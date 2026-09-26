// ─── Dedication — getting the sender's photos, audio and videos to S3 ───────
//
// Photos and audio travel the way the booth recordings always have: as data
// URLs inside the page body, which the server uploads to S3 on save (photos
// are shrunk here first so twelve of them stay well under the body limit).
//
// Videos are too big for that. A picked video is held in memory as a `blob:`
// URL for the live preview; at publish time — when the sender is signed in —
// each one is POSTed to `/media/upload-video`, which transcodes it to a small
// 720p H.264 mp4 on the server and answers with the CDN URL. A signed-in
// sender gets that upload immediately, with a progress bar, so publishing is
// instant.

import { API_URL, IS_NGROK } from "@/lib/config";
import { MAX_CLIP_BYTES, type DedicationData } from "./showData";
import type { ClipSegment, Segment } from "./types";

const mb = (b: number) => (Math.round((b / 1048576) * 10) / 10).toString();

/* ── photos ─────────────────────────────────────────────────────────────── */

/** Longest side 1400px, WebP (JPEG where WebP encoding is unsupported). */
export async function compressImage(file: File, maxSide = 1400): Promise<string> {
  if (!file.type.startsWith("image/") && file.type !== "") throw new Error("That isn't a photo.");
  if (file.size > 25 * 1048576) throw new Error(`That photo is ${mb(file.size)}MB — pick one under 25MB.`);

  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("That photo could not be read. Try a jpg or png."));
      i.src = url;
    });
    const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Your browser couldn't process that photo.");
    ctx.drawImage(img, 0, 0, w, h);
    let out = canvas.toDataURL("image/webp", 0.82);
    if (!out.startsWith("data:image/webp")) out = canvas.toDataURL("image/jpeg", 0.85);
    return out;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/* ── audio ──────────────────────────────────────────────────────────────── */

/** How long an audio file plays for, so the show knows when to move on. */
export function audioDurationMs(src: string): Promise<number> {
  return new Promise((resolve) => {
    const a = document.createElement("audio");
    a.preload = "metadata";
    const done = (ms: number) => {
      a.removeAttribute("src");
      resolve(ms);
    };
    a.onloadedmetadata = () => {
      const d = a.duration;
      done(Number.isFinite(d) && d > 0 ? Math.round(d * 1000) : 30_000);
    };
    a.onerror = () => done(30_000);
    a.src = src;
  });
}

/* ── videos ─────────────────────────────────────────────────────────────── */

/** blob: URL → the File behind it, for clips not yet uploaded. */
const pending = new Map<string, File>();

export function checkVideoFile(file: File): string | null {
  const type = (file.type || "").toLowerCase();
  if (type && !type.startsWith("video/")) return "That isn't a video file.";
  if (file.size > MAX_CLIP_BYTES) return `That video is ${mb(file.size)}MB — the limit is 10MB. Try a shorter clip.`;
  if (!file.size) return "That file looks empty.";
  return null;
}

/** Keep a picked video locally (preview plays from this) until it is uploaded. */
export function holdVideo(file: File): string {
  const url = URL.createObjectURL(file);
  pending.set(url, file);
  return url;
}

export const isPendingVideo = (url: string): boolean => pending.has(url);

export interface UploadedVideo {
  url: string;
  posterUrl: string;
  size: number;
  originalSize: number;
}

export function uploadVideo(
  file: File,
  accessToken: string,
  onProgress?: (fraction: number, stage: "uploading" | "compressing") => void,
): Promise<UploadedVideo> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("template", "dedication");
    form.append("file", file, file.name || "clip.mp4");
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_URL}/media/upload-video`);
    xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
    if (IS_NGROK) xhr.setRequestHeader("ngrok-skip-browser-warning", "true");
    xhr.timeout = 240_000;
    xhr.upload.onprogress = (e) => {
      if (!e.lengthComputable) return;
      const f = e.loaded / e.total;
      onProgress?.(f, f >= 1 ? "compressing" : "uploading");
    };
    xhr.upload.onload = () => onProgress?.(1, "compressing");
    xhr.onload = () => {
      let body: { success?: boolean; data?: UploadedVideo; error?: string } = {};
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        /* not JSON */
      }
      if (xhr.status >= 200 && xhr.status < 300 && body.success && body.data?.url) resolve(body.data);
      else reject(new Error(body.error || (xhr.status === 413 ? "That video is too large." : "Video upload failed.")));
    };
    xhr.onerror = () => reject(new Error("Network error while uploading the video."));
    xhr.ontimeout = () => reject(new Error("The video upload timed out. Try a shorter clip."));
    xhr.send(form);
  });
}

/**
 * Upload every clip still held locally, swap in its CDN URL, and drop any clip
 * whose `blob:` URL no longer has a file behind it (a reloaded tab) — a dead
 * blob URL would otherwise publish and then play nothing.
 */
export async function resolvePendingClips(
  data: DedicationData,
  accessToken: string,
  onProgress?: (label: string) => void,
): Promise<DedicationData> {
  const segments: Segment[] = [];
  let n = 0;
  const total = data.segments.filter((s) => s.kind === "clip" && s.videoUrl.startsWith("blob:")).length;
  for (const s of data.segments) {
    if (s.kind !== "clip" || !s.videoUrl.startsWith("blob:")) {
      segments.push(s);
      continue;
    }
    const file = pending.get(s.videoUrl);
    if (!file) continue;
    n++;
    const up = await uploadVideo(file, accessToken, (f, stage) =>
      onProgress?.(
        stage === "compressing"
          ? `Compressing video ${n}/${total}…`
          : `Uploading video ${n}/${total} · ${Math.round(f * 100)}%`,
      ),
    );
    pending.delete(s.videoUrl);
    const next: ClipSegment = { ...s, videoUrl: up.url, ...(up.posterUrl ? { posterUrl: up.posterUrl } : {}) };
    segments.push(next);
  }
  return { ...data, segments };
}
