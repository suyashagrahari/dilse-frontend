// ─── Turning a held photo into an S3 URL ─────────────────────────────────────
//
// One uploader for every template, because adoption has to work for shapes it
// has never seen. `POST /media/upload` stores the bytes and answers with a CDN
// URL — re-encoding a photo to WebP, keeping a recording's container intact —
// and this module's whole job is getting bytes to it from the two forms a
// pending photo or clip can take.
//
// ── WHY DATA URLS ARE DECODED BY HAND ───────────────────────────────────────
//
// `fetch(dataUrl).then(r => r.blob())` is the one-liner, and it is a trap here:
// a Content Security Policy that does not list `data:` in `connect-src` blocks
// it, and the failure arrives as a generic TypeError indistinguishable from the
// user being offline. Decoding with `atob` touches no network and cannot be
// blocked by policy.

import { API_URL, IS_NGROK } from "@/lib/config";
import { classifyMediaRef, LOCAL_REF_PREFIX } from "./mediaRefs";

// ── WHY THE CEILING IS PER KIND ─────────────────────────────────────────────
//
// One 12MB limit for everything was a photo limit wearing a general name, and
// it silently truncated the feature it was not written for: a two-minute voice
// note is comfortably larger than any photo anyone uploads. The server accepts
// 20MB of audio and 12MB of an image; this matches, so the refusal happens here
// with a sentence rather than there with a 400.
const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
const MAX_AUDIO_BYTES = 20 * 1024 * 1024;

export interface UploadedRef {
  ok: boolean;
  url?: string;
  /** Safe to show a user directly. */
  error?: string;
}

/**
 * Fetches the Blob behind an `idb:<id>` ref.
 *
 * Supplied by the editor rather than looked up here: the two rakhi templates
 * keep their blobs in their own IndexedDB store, and reaching into another
 * module's database from here would make this file depend on every template that
 * has one. An editor with no local blob store passes nothing, and its `idb:`
 * refs — which it cannot produce anyway — are left untouched.
 */
export type LocalRefResolver = (ref: string) => Promise<Blob | null>;

/**
 * Convert one pending ref into an uploaded CDN URL.
 *
 * A `remote` ref is returned as-is without a request. That is not an
 * optimisation; re-uploading a URL that came back from a previous upload is how
 * you silently multiply S3 objects across repeated saves.
 */
export async function uploadPendingRef(
  ref: string,
  opts: {
    templateType: string;
    accessToken: string | null | undefined;
    resolveLocalRef?: LocalRefResolver;
  }
): Promise<UploadedRef> {
  const kind = classifyMediaRef(ref);
  if (kind === "remote") return { ok: true, url: ref };
  if (kind === "none") return { ok: false, error: "Not an image" };
  if (!opts.accessToken) return { ok: false, error: "Sign in to save photos" };

  let blob: Blob | null = null;

  if (kind === "data-url") {
    blob = dataUrlToBlob(ref);
    if (!blob) return { ok: false, error: "That photo could not be read" };
  } else {
    if (!opts.resolveLocalRef) {
      // The editor holds blobs somewhere this module cannot see. Say so plainly
      // rather than reporting a fake upload failure — the caller leaves the ref
      // alone and the at-publish path still handles it.
      return { ok: false, error: "unresolvable-local-ref" };
    }
    blob = await opts.resolveLocalRef(ref);
    if (!blob) return { ok: false, error: "One of your photos went missing — add it again" };
  }

  // ── WHY THE KIND IS DERIVED AND NOT ASSUMED ───────────────────────────────
  //
  // This said `kind: "image"` unconditionally, because when it was written only
  // photos came through here. Adoption collects EVERY pending data URL in a
  // payload, and eleven templates put a recording in theirs — so every voice
  // note ever adopted was handed to the server labelled as a photo, fed to
  // sharp, and refused with "Unsupported image format". The upload failed, the
  // ref was left in place as the code above intends, and the draft was saved
  // with a megabyte of base64 where a URL belonged. That is the giant "music
  // URL" people find in their profile.
  //
  // The server sniffs the bytes now and no longer trusts this field at all, but
  // sending the truth is still what keeps the size check below honest.
  const type = (blob.type || "").toLowerCase();
  const isAudio = type.startsWith("audio/");
  // A phone that could not name the file gives us nothing to go on. The server
  // reads the magic bytes and will know; until it answers, assume the generous
  // ceiling, because refusing a 15MB song as though it were an oversized photo
  // is the wrong guess to make.
  const undecided = !type || type === "application/octet-stream" || type === "binary/octet-stream";
  const ceiling = isAudio || undecided ? MAX_AUDIO_BYTES : MAX_IMAGE_BYTES;
  if (blob.size > ceiling)
    return {
      ok: false,
      error:
        isAudio || undecided
          ? "That clip is too long — keep it under 20MB"
          : "Too big — keep it under 12MB",
    };

  const body = new FormData();
  body.append("file", new File([blob], fileNameFor(ref, blob.type), { type: blob.type }));
  body.append("template", opts.templateType);
  body.append("kind", isAudio ? "audio" : undecided ? "" : "image");

  try {
    const res = await fetch(`${API_URL}/media/upload`, {
      method: "POST",
      // No Content-Type: the browser must set the multipart boundary itself, and
      // setting it by hand produces a request multer cannot parse.
      headers: {
        Authorization: `Bearer ${opts.accessToken}`,
        ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
      },
      body,
    });
    const json = await res.json();
    if (!res.ok || !json?.success || !json.data?.url) {
      return { ok: false, error: typeof json?.error === "string" ? json.error : "Upload failed" };
    }
    return { ok: true, url: String(json.data.url) };
  } catch {
    return { ok: false, error: "Upload failed — check your connection" };
  }
}

/** `data:image/png;base64,AAAA` → Blob, without touching the network. */
function dataUrlToBlob(dataUrl: string): Blob | null {
  const comma = dataUrl.indexOf(",");
  if (comma < 0) return null;

  const header = dataUrl.slice(5, comma); // past "data:"
  const isBase64 = header.endsWith(";base64");
  // No default of "image/png" here. `data:;base64,…` is exactly what a browser
  // writes for a recording it has no type for, and calling it a PNG is how an
  // audio clip ended up being sized, labelled and processed as a photo.
  const mime = (isBase64 ? header.slice(0, -";base64".length) : header) || "application/octet-stream";
  const payload = dataUrl.slice(comma + 1);

  try {
    if (!isBase64) {
      return new Blob([decodeURIComponent(payload)], { type: mime });
    }
    const binary = atob(payload);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new Blob([bytes], { type: mime });
  } catch {
    // Truncated base64 — a scratch record half-written when the tab was killed.
    return null;
  }
}

function fileNameFor(ref: string, mime: string): string {
  // `audio/webm;codecs=opus` → `webm`. The parameter has to come off or the
  // filename ends up as `clip.webm;codecs=opus`.
  const subtype = (mime.split("/")[1] || "").split(";")[0].trim();
  const ext = (subtype && subtype !== "octet-stream" ? subtype : "bin").split("+")[0];
  const id = ref.startsWith(LOCAL_REF_PREFIX) ? ref.slice(LOCAL_REF_PREFIX.length) : "inline";
  return `${id.slice(0, 24) || "photo"}.${ext}`;
}
