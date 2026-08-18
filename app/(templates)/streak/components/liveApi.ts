// ─── The live layer ──────────────────────────────────────────────────────────
//
// IDENTITY.
//
// The viewer's side is NOT decided on the client. The published link carries an
// unguessable per-side token as `?k=`, the server matches it, and the server
// tells us which half of the pair is asking. There is deliberately no code path
// here that reads a `side` from the URL, infers one from a name, or lets the
// caller assert one — a self-declared side is exactly the hole this replaces.
//
// HONEST LIMITATION, so nobody reads more into this than is there: the token is
// a CEREMONY, not a security boundary. Anyone holding a partner's link can read
// as that partner, which is inherent to unauthenticated share links. What IS
// genuinely enforced is the DOM-absence property — the server omits the note
// from the payload entirely until the caller has checked in, and the client
// type has no field to put it in. That is the property the sealed note rests
// on, and it holds regardless of who is holding the link.
//
// EVERY FUNCTION HERE IS NON-THROWING. The endpoints may not be deployed yet;
// a template that white-screens because a poll 404'd would be worse than one
// that quietly runs on local state.

"use client";

import { API_URL, IS_NGROK } from "@/lib/config";
import { obj, str, strOr, type Raw } from "@/lib/wire";
import type { CheckInDay, CheckInEntry, Side } from "./types";

const BASE = `${API_URL}/streak-pages`;

const headers = (): HeadersInit => ({
  "Content-Type": "application/json",
  ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
});

/** What the server is willing to tell this caller about today. */
export interface TodayPayload {
  /** Resolved from the token. `null` when the token is absent or unknown. */
  side: Side | null;
  /**
   * Today's row as the server sees it FOR THIS CALLER.
   *
   * When the caller has not checked in, the partner's `note` is not present on
   * this object. Not blank, not masked — absent. `noteViewFor` then returns
   * `{ state: "none" }` and the UI shows nothing, which is also exactly what a
   * viewer without a valid token sees: a working page with no note on it.
   */
  day: CheckInDay | null;
}

function entryFrom(v: unknown): CheckInEntry | undefined {
  if (!v || typeof v !== "object" || Array.isArray(v)) return undefined;
  const o = obj(v);
  if (typeof o.at !== "string") return undefined;
  const note = strOr(o.note, "");
  const photoUrl = strOr(o.photoUrl, "");
  return {
    word: strOr(o.word, ""),
    at: o.at,
    ...(photoUrl ? { photoUrl } : {}),
    // Present only if the server chose to send it. Never defaulted into
    // existence — an empty-string note would render an empty open envelope.
    ...(note.trim() ? { note } : {}),
  };
}

function dayFrom(v: unknown): CheckInDay | null {
  const o = obj(v);
  const date = str(o.date, "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const a = entryFrom(o.a);
  const b = entryFrom(o.b);
  const covered: Side | undefined = o.covered === "a" || o.covered === "b" ? o.covered : undefined;
  return { date, ...(a ? { a } : {}), ...(b ? { b } : {}), ...(covered ? { covered } : {}) };
}

/**
 * TODO(realtime): this poll is the placeholder for a socket subscription. The
 * shape it returns is what the subscription should push.
 */
export async function fetchToday(shareId: string, token: string | null): Promise<TodayPayload | null> {
  try {
    const qs = token ? `?k=${encodeURIComponent(token)}` : "";
    const res = await fetch(`${BASE}/share/${encodeURIComponent(shareId)}/today${qs}`, {
      headers: headers(),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const result: Raw = obj(await res.json());
    if (result.success === false) return null;
    const d = obj(result.data);
    const side = d.side === "a" || d.side === "b" ? d.side : null;
    return { side, day: dayFrom(d.day) };
  } catch {
    return null;
  }
}

/**
 * Records a check-in. `idempotencyKey` is `checkInKey(pairId, date, side)` and
 * the server holds a unique index on it, so a double submit — two taps in the
 * same second, or a retry after a dropped connection — is a no-op rather than
 * a duplicate row.
 *
 * Returns false on ANY failure, including offline. The caller has already
 * counted the day locally and queues the key; a rejected request never
 * un-counts a check-in.
 */
export async function postCheckIn(
  shareId: string,
  token: string | null,
  idempotencyKey: string,
  entry: Pick<CheckInEntry, "word" | "note" | "photoUrl" | "at">,
): Promise<boolean> {
  try {
    const qs = token ? `?k=${encodeURIComponent(token)}` : "";
    const res = await fetch(`${BASE}/share/${encodeURIComponent(shareId)}/check-in${qs}`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ idempotencyKey, entry }),
    });
    if (!res.ok) return false;
    const result: Raw = obj(await res.json());
    return result.success !== false;
  } catch {
    return false;
  }
}
