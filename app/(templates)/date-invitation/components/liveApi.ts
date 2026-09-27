// ─── The shared evening — client side of dateInvitationLive.controller ──────
//
// Every call is keyed by the share id. The owner is recognised by their normal
// access token (sent when signed in); a recipient on a password-protected page
// carries the token /verify handed out, kept in sessionStorage for the tab.

import { API_URL, IS_NGROK } from "@/lib/config";
import type { Memory, RsvpState } from "./types";

export interface LiveState {
  isOwner: boolean;
  rsvp: RsvpState;
  rsvpAt: string;
  proposedDate: string;
  currentStopIndex: number;
  arrivedAt: string[];
  memories: Memory[];
  maxMemories: number;
  serverNow: string;
}

export const pageTokenKey = (shareId: string) => `date-invitation_token_${shareId}`;

function headers(shareId: string, accessToken: string | null): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (IS_NGROK) h["ngrok-skip-browser-warning"] = "true";
  if (accessToken) h.Authorization = `Bearer ${accessToken}`;
  try {
    const t = sessionStorage.getItem(pageTokenKey(shareId));
    if (t) h["x-page-token"] = t;
  } catch {
    /* storage blocked — public pages still work */
  }
  return h;
}

async function call(
  method: "GET" | "POST" | "DELETE",
  path: string,
  shareId: string,
  accessToken: string | null,
  body?: unknown,
): Promise<{ ok: true; data: LiveState } | { ok: false; error: string; status: number }> {
  try {
    const res = await fetch(`${API_URL}/date-invitation-pages/share/${encodeURIComponent(shareId)}${path}`, {
      method,
      headers: headers(shareId, accessToken),
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok && json?.success && json.data) return { ok: true, data: json.data as LiveState };
    return { ok: false, error: json?.error || "Something went wrong", status: res.status };
  } catch {
    return { ok: false, error: "You're offline — try again in a moment", status: 0 };
  }
}

export const fetchLive = (shareId: string, token: string | null) => call("GET", "/live", shareId, token);

export const sendRsvp = (shareId: string, token: string | null, state: Exclude<RsvpState, "pending">, proposedDate = "") =>
  call("POST", "/rsvp", shareId, token, { state, proposedDate });

export const sendCheckIn = (shareId: string, token: string | null, from: number) =>
  call("POST", "/arrive", shareId, token, { from });

export const sendMemory = (shareId: string, token: string | null, image: string, stopId: string, title: string) =>
  call("POST", "/memories", shareId, token, { image, stopId, title });

export const deleteMemory = (shareId: string, token: string | null, id: string) =>
  call("DELETE", `/memories/${encodeURIComponent(id)}`, shareId, token);

/** Shrink a phone photo to a ~1600px WebP data URL before it leaves the device. */
export async function compressPhoto(file: File, max = 1600): Promise<string> {
  const src = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = src;
  });
  const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) return src;
  ctx.drawImage(img, 0, 0, w, h);
  const webp = c.toDataURL("image/webp", 0.82);
  return webp.startsWith("data:image/webp") ? webp : c.toDataURL("image/jpeg", 0.85);
}
