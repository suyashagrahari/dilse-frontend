// ─── Wedding kit: guest + owner API client ──────────────────────────────────
//
// Server: controllers/weddingGuest.controller.ts, mounted on /<slug>-pages for
// the three wedding slugs. Guests never log in; a password-protected page's
// password travels with each call (the gate keeps it for the tab).
import { API_URL, IS_NGROK } from "@/lib/config";
import { pagePassword } from "../_valentine/kit/shareInfo";
import type { Blessing, RsvpDraft, RsvpRow, RsvpTotals } from "./types";

const base = (slug: string) => `${API_URL}/${slug}-pages`;
const ngrok = (): Record<string, string> => (IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {});

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string; status: number; needsPassword?: boolean };

async function call<T>(url: string, init: RequestInit, pick: (j: Record<string, unknown>) => T): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, init);
    const j = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok || j.success === false) {
      return {
        ok: false,
        status: res.status,
        error: typeof j.error === "string" ? j.error : res.status === 429 ? "Too many tries — please wait a little" : "Something went wrong — please try again",
        needsPassword: j.needsPassword === true,
      };
    }
    return { ok: true, data: pick(j) };
  } catch {
    return { ok: false, status: 0, error: "No connection — check your internet and try again" };
  }
}

// ── "Edit my response": the RSVP id + token live on this device ─────────────

export interface StoredRsvp {
  id: string;
  token: string;
  rsvp: RsvpDraft;
}
const rsvpKey = (shareId: string) => `wk_rsvp_${shareId}`;

export function loadMyRsvp(shareId: string): StoredRsvp | null {
  try {
    const v = JSON.parse(localStorage.getItem(rsvpKey(shareId)) || "null") as StoredRsvp | null;
    return v && typeof v.id === "string" && typeof v.token === "string" ? v : null;
  } catch {
    return null;
  }
}
function saveMyRsvp(shareId: string, v: StoredRsvp) {
  try {
    localStorage.setItem(rsvpKey(shareId), JSON.stringify(v));
  } catch {
    /* private mode: the RSVP still went through */
  }
}

/** Create, or update when this device already answered. `password` overrides the gate's stored one. */
export async function submitRsvp(
  slug: string,
  shareId: string,
  draft: RsvpDraft,
  opts: { password?: string; honeypot?: string } = {},
): Promise<ApiResult<{ id: string; rsvp: RsvpDraft; updated: boolean }>> {
  const mine = loadMyRsvp(shareId);
  const password = opts.password ?? pagePassword(shareId);
  const body = JSON.stringify({ ...draft, password, website: opts.honeypot ?? "" });
  const headers = { "Content-Type": "application/json", ...ngrok(), ...(mine ? { "X-Rsvp-Token": mine.token } : {}) };
  const url = `${base(slug)}/share/${encodeURIComponent(shareId)}/rsvp${mine ? `/${encodeURIComponent(mine.id)}` : ""}`;
  let r = await call(url, { method: mine ? "PUT" : "POST", headers, body }, (j) => j);
  // The stored token no longer matches (e.g. the owner reset things): answer afresh.
  if (!r.ok && mine && (r.status === 403 || r.status === 404)) {
    r = await call(`${base(slug)}/share/${encodeURIComponent(shareId)}/rsvp`, { method: "POST", headers: { "Content-Type": "application/json", ...ngrok() }, body }, (j) => j);
  }
  if (!r.ok) return r;
  const j = r.data;
  const id = String(j.rsvpId ?? mine?.id ?? "");
  const token = typeof j.editToken === "string" ? j.editToken : mine?.token ?? "";
  if (id && token && !/^0+$/.test(id)) saveMyRsvp(shareId, { id, token, rsvp: draft });
  return { ok: true, data: { id, rsvp: draft, updated: !!mine && !j.editToken } };
}

export async function postBlessing(
  slug: string,
  shareId: string,
  b: { name: string; message: string },
  opts: { password?: string; honeypot?: string } = {},
): Promise<ApiResult<Blessing>> {
  return call(
    `${base(slug)}/share/${encodeURIComponent(shareId)}/blessing`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", ...ngrok() },
      body: JSON.stringify({ ...b, password: opts.password ?? pagePassword(shareId), website: opts.honeypot ?? "" }),
    },
    (j) => j.blessing as Blessing,
  );
}

export async function fetchBlessings(slug: string, shareId: string, password?: string): Promise<ApiResult<Blessing[]>> {
  const pw = password ?? pagePassword(shareId);
  return call(
    `${base(slug)}/share/${encodeURIComponent(shareId)}/blessings`,
    { headers: { ...ngrok(), ...(pw ? { "X-Page-Password": pw } : {}) }, cache: "no-store" },
    (j) => (Array.isArray(j.blessings) ? (j.blessings as Blessing[]) : []),
  );
}

// ── Owner ───────────────────────────────────────────────────────────────────

export interface GuestsData {
  rsvps: RsvpRow[];
  totals: RsvpTotals;
  eventLabels: Record<string, string>;
  blessings: Blessing[];
  features: { rsvpPerEvent: boolean; blessings: boolean };
}

const auth = (token: string) => ({ Authorization: `Bearer ${token}`, ...ngrok() });

export const fetchGuests = (slug: string, pageId: string, token: string) =>
  call<GuestsData>(`${base(slug)}/${encodeURIComponent(pageId)}/guests`, { headers: auth(token), cache: "no-store" }, (j) => j.data as GuestsData);

export const moderateBlessing = (slug: string, pageId: string, token: string, blessingId: string, approved: boolean) =>
  call<Blessing>(
    `${base(slug)}/${encodeURIComponent(pageId)}/blessings/${encodeURIComponent(blessingId)}`,
    { method: "PATCH", headers: { ...auth(token), "Content-Type": "application/json" }, body: JSON.stringify({ approved }) },
    (j) => j.blessing as Blessing,
  );

/** Downloads the CSV through fetch (the endpoint needs the bearer token, so a plain link cannot). */
export async function downloadGuestsCsv(slug: string, pageId: string, token: string, fileName = "rsvps"): Promise<boolean> {
  try {
    const res = await fetch(`${base(slug)}/${encodeURIComponent(pageId)}/guests.csv`, { headers: auth(token) });
    if (!res.ok) return false;
    const url = URL.createObjectURL(await res.blob());
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName.replace(/[^a-z0-9-]+/gi, "-").slice(0, 40) || "rsvps"}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 4000);
    return true;
  } catch {
    return false;
  }
}
