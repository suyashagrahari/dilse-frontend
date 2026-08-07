// ─── Contributions — the five network calls ──────────────────────────────────
//
// Same contract as `lib/ai-fill/api.ts`: thin, typed, total. Every function
// returns a discriminated result and none of them ever throws. The callers are
// React handlers on a page a stranger opened from a WhatsApp link — an
// exception escaping one of them is a white screen where somebody was about to
// write two nice sentences about a person they know.
//
// `status` is the HTTP status when there was one and `0` when the request never
// reached a server (offline, DNS, CORS, abort). The hook keys its human-facing
// copy off that number.
//
// ── ONE PLACE TO CHANGE THE PATHS ────────────────────────────────────────────
//
// Every URL this file builds comes out of `paths` below. The server half of
// this feature is being written alongside it, so if the agreed shape moves, it
// moves in one twelve-line block and nothing else in the client notices.
//
// ── NOTHING FROM THE WIRE IS TRUSTED ─────────────────────────────────────────
//
// The list render happens on the recipient's share page, where a document
// written by an older deploy — or a field somebody nulled out in Mongo — must
// degrade to something sensible rather than crash. Everything is put through
// `normaliseContribution` on the way in, in the same spirit as `lib/wire.ts`.

import { API_URL, IS_NGROK } from "@/lib/config";
import { list, num, obj, oneOf, str, type Raw } from "@/lib/wire";
import {
  CONTRIBUTION_KINDS,
  CONTRIBUTION_STATUSES,
  CONTRIB_LIMITS,
  STAR_VALUES,
  type Contribution,
  type ContributionDraft,
  type ContributionFeed,
  type ContributionKind,
  type ContributionStatus,
  type ContributionSummary,
  type StarValue,
} from "./types";

export type ApiResult<T> = { ok: true; data: T } | { ok: false; status: number; error: string };

const enc = encodeURIComponent;

/** The whole URL surface of the feature. See the note at the top of the file. */
const paths = {
  /** Public. Approved items only — this is what a visitor's browser polls. */
  feed: (shareId: string, kind: ContributionKind) => `${API_URL}/contrib/${enc(shareId)}/${kind}`,
  /** Public. Auth optional: most contributors have no account and never will. */
  submit: (shareId: string, kind: ContributionKind) => `${API_URL}/contrib/${enc(shareId)}/${kind}`,
  /** Owner only. Every status, newest first — the moderation queue. */
  queue: (shareId: string, kind: ContributionKind) =>
    `${API_URL}/contrib/${enc(shareId)}/${kind}/queue`,
  /** Owner only. Approve or reject exactly one. */
  decide: (shareId: string, kind: ContributionKind, id: string) =>
    `${API_URL}/contrib/${enc(shareId)}/${kind}/${enc(id)}`,
  /** Owner only. Approves everything currently pending. */
  approveAll: (shareId: string, kind: ContributionKind) =>
    `${API_URL}/contrib/${enc(shareId)}/${kind}/approve-all`,
} as const;

/** Same shape the editors and authSlice use — the ngrok tunnel needs the bypass header. */
function apiHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json", ...extra };
  if (IS_NGROK) headers["ngrok-skip-browser-warning"] = "true";
  return headers;
}

function authHeaders(token?: string | null, extra: Record<string, string> = {}) {
  return apiHeaders(token ? { Authorization: `Bearer ${token}`, ...extra } : extra);
}

const NETWORK_ERROR = "Couldn't reach the server.";

/**
 * Read `{ success, data }` off a response without trusting any part of it.
 *
 * A 500 from a proxy is frequently an HTML error page, so `res.json()` is
 * itself a throw site and is guarded.
 */
async function envelope<T>(res: Response, fallback: string): Promise<ApiResult<T>> {
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  const data = obj(body);

  if (!res.ok) {
    const message =
      (typeof data.error === "string" && data.error) ||
      (typeof data.message === "string" && data.message) ||
      fallback;
    return { ok: false, status: res.status, error: message };
  }

  if (data.success === false || data.data === undefined || data.data === null) {
    const message = typeof data.error === "string" ? data.error : fallback;
    return { ok: false, status: res.status, error: message };
  }

  return { ok: true, data: data.data as T };
}

/* ── Coercion ──────────────────────────────────────────────────────────────── */

/** A rating, or nothing. Anything that is not one of the five whole stars is nothing. */
function starOrNone(v: unknown): StarValue | undefined {
  const n = Math.round(num(v, 0));
  return (STAR_VALUES as readonly number[]).includes(n) ? (n as StarValue) : undefined;
}

/** Drop the key entirely when the value is blank, so `title?: string` stays honest. */
function optionalStr(v: unknown, max: number): string | undefined {
  const s = typeof v === "string" ? v.trim() : "";
  return s ? s.slice(0, max) : undefined;
}

/**
 * One wire object into one `Contribution`, or null if it is not usable.
 *
 * Null for a row with no id or no words in it: an entry that cannot be keyed
 * cannot be moderated, and an entry with nothing to read is not a contribution.
 * `list` drops the nulls, so one bad document costs one row rather than the
 * whole page.
 */
function normaliseContribution(raw: Raw): Contribution | null {
  const id = str(raw.id ?? raw._id, "");
  const body = str(raw.body ?? raw.text, "").slice(0, CONTRIB_LIMITS.body);
  if (!id || !body) return null;

  const contribution: Contribution = {
    id,
    kind: oneOf(raw.kind, CONTRIBUTION_KINDS, "note"),
    author: str(raw.author ?? raw.name, "Someone").slice(0, CONTRIB_LIMITS.author),
    body,
    status: oneOf(raw.status, CONTRIBUTION_STATUSES, "pending"),
    // Unknown means "not flagged": the marker is an extra pair of eyes, and a
    // missing field is not a reason to put a warning badge on somebody's words.
    flagged: raw.flagged === true,
    createdAt: str(raw.createdAt, new Date(0).toISOString()),
  };

  const title = optionalStr(raw.title, CONTRIB_LIMITS.title);
  if (title) contribution.title = title;

  const rating = starOrNone(raw.rating);
  if (rating) contribution.rating = rating;

  const avatarUrl = optionalStr(raw.avatarUrl, 2048);
  if (avatarUrl) contribution.avatarUrl = avatarUrl;

  const flagReason = optionalStr(raw.flagReason, 120);
  if (flagReason) contribution.flagReason = flagReason;

  return contribution;
}

/**
 * The aggregate, defended.
 *
 * `average` is NOT rounded on the way through — the whole reason it is sent
 * from the server is that the page needs the true 4.7 — but it is clamped into
 * 0…5 so a corrupt value cannot push the star fill past the end of the row.
 */
function normaliseSummary(raw: Raw, items: readonly Contribution[]): ContributionSummary {
  const rawDist = Array.isArray(raw.distribution) ? raw.distribution : [];
  const distribution = STAR_VALUES.map((_, i) => Math.max(0, Math.round(num(rawDist[i], 0))));

  const rated = items.filter((c) => typeof c.rating === "number");
  // Falling back to what is in hand is better than showing "0 reviews" under a
  // list of five of them, which is the one failure a visitor would notice.
  const fallbackAvg =
    rated.length > 0 ? rated.reduce((sum, c) => sum + (c.rating ?? 0), 0) / rated.length : 0;

  return {
    count: Math.max(0, Math.round(num(raw.count, items.length))),
    average: Math.min(5, Math.max(0, num(raw.average, fallbackAvg))),
    distribution,
  };
}

function normaliseFeed(raw: unknown): ContributionFeed {
  const data = obj(raw);
  // Tolerates a server that answers with a bare array as well as `{ items }`.
  const rawItems = Array.isArray(data.items) ? data.items : Array.isArray(raw) ? raw : [];
  const items = list<Contribution>(rawItems, normaliseContribution, []);
  return { items, summary: normaliseSummary(obj(data.summary), items) };
}

/* ── Idempotency ───────────────────────────────────────────────────────────── */

/**
 * A key that makes one submission survive being sent twice.
 *
 * The contributor is on a phone on a train. The POST goes out, the tunnel dies
 * before the response comes back, they press the button again — and without
 * this the page they were being kind to now carries their note twice. The key
 * is generated once per submission and REUSED across retries of that same
 * submission; the server keys on it and returns the original row.
 *
 * `crypto.randomUUID` is unavailable outside secure contexts (an ngrok demo
 * over plain http, an old in-app browser), and a throw here would take out the
 * submit button, so there is a fallback. It only has to be unique among the
 * handful of submissions one person makes, not globally.
 */
export function newIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  }
  return `k-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

/* ── The calls ─────────────────────────────────────────────────────────────── */

/** Public. Approved items only. Polled, so it must stay cheap and never cache. */
export async function fetchContributions(
  shareId: string,
  kind: ContributionKind,
  signal?: AbortSignal
): Promise<ApiResult<ContributionFeed>> {
  try {
    const res = await fetch(paths.feed(shareId, kind), {
      headers: apiHeaders(),
      cache: "no-store",
      signal,
    });
    const parsed = await envelope<unknown>(res, "Couldn't load what people have added.");
    return parsed.ok ? { ok: true, data: normaliseFeed(parsed.data) } : parsed;
  } catch {
    return { ok: false, status: 0, error: NETWORK_ERROR };
  }
}

/**
 * Public. Leaves something on somebody else's page.
 *
 * Auth is optional by design and will usually be absent: the contributor got
 * here from a link and has no reason to make an account to say something nice.
 * The body is clamped to `CONTRIB_LIMITS` here as well as in the form, so a
 * caller that forgot the `maxLength` cannot turn a long paste into a 400.
 */
export async function postContribution(
  shareId: string,
  kind: ContributionKind,
  draft: ContributionDraft,
  idempotencyKey: string,
  token?: string | null,
  signal?: AbortSignal
): Promise<ApiResult<Contribution>> {
  const body: Record<string, unknown> = {
    author: draft.author.trim().slice(0, CONTRIB_LIMITS.author),
    body: draft.body.trim().slice(0, CONTRIB_LIMITS.body),
    idempotencyKey,
  };
  if (draft.title?.trim()) body.title = draft.title.trim().slice(0, CONTRIB_LIMITS.title);
  if (draft.rating) body.rating = draft.rating;
  if (draft.avatarUrl?.trim()) body.avatarUrl = draft.avatarUrl.trim();

  try {
    const res = await fetch(paths.submit(shareId, kind), {
      method: "POST",
      // Sent as a header too — the shape most idempotency middleware expects,
      // and free to include for one that reads it off the body instead.
      headers: authHeaders(token, { "Idempotency-Key": idempotencyKey }),
      body: JSON.stringify(body),
      signal,
    });
    const parsed = await envelope<unknown>(res, "Couldn't send that just now.");
    if (!parsed.ok) return parsed;

    const contribution = normaliseContribution(obj(parsed.data));
    // A 200 whose body we cannot read still means it was written. Reporting it
    // as a failure would invite a duplicate; this is treated as success by the
    // caller and simply has nothing to append to the list.
    if (!contribution) {
      return { ok: false, status: res.status, error: "Sent — but we couldn't read it back." };
    }
    return { ok: true, data: contribution };
  } catch {
    return { ok: false, status: 0, error: NETWORK_ERROR };
  }
}

/** Owner only. Every status, so the sender can see what they have already dealt with. */
export async function fetchModerationQueue(
  shareId: string,
  kind: ContributionKind,
  token: string,
  signal?: AbortSignal
): Promise<ApiResult<ContributionFeed>> {
  try {
    const res = await fetch(paths.queue(shareId, kind), {
      headers: authHeaders(token),
      cache: "no-store",
      signal,
    });
    const parsed = await envelope<unknown>(res, "Couldn't load what's waiting for you.");
    return parsed.ok ? { ok: true, data: normaliseFeed(parsed.data) } : parsed;
  } catch {
    return { ok: false, status: 0, error: NETWORK_ERROR };
  }
}

/** Owner only. One decision, one row. Idempotent server-side — a double tap is harmless. */
export async function setContributionStatus(
  shareId: string,
  kind: ContributionKind,
  id: string,
  status: ContributionStatus,
  token: string,
  signal?: AbortSignal
): Promise<ApiResult<Contribution>> {
  try {
    const res = await fetch(paths.decide(shareId, kind, id), {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify({ status }),
      signal,
    });
    const parsed = await envelope<unknown>(res, "Couldn't save that.");
    if (!parsed.ok) return parsed;

    const contribution = normaliseContribution(obj(parsed.data));
    if (!contribution) return { ok: false, status: res.status, error: "Couldn't save that." };
    return { ok: true, data: contribution };
  } catch {
    return { ok: false, status: 0, error: NETWORK_ERROR };
  }
}

/**
 * Owner only. Approves everything pending in one call.
 *
 * Returns the full updated set rather than a count, because the queue has to
 * repaint and a count would send it back for a second round trip to find out
 * what it now holds.
 */
export async function approveAllContributions(
  shareId: string,
  kind: ContributionKind,
  token: string,
  signal?: AbortSignal
): Promise<ApiResult<ContributionFeed>> {
  try {
    const res = await fetch(paths.approveAll(shareId, kind), {
      method: "POST",
      headers: authHeaders(token),
      signal,
    });
    const parsed = await envelope<unknown>(res, "Couldn't approve those.");
    return parsed.ok ? { ok: true, data: normaliseFeed(parsed.data) } : parsed;
  } catch {
    return { ok: false, status: 0, error: NETWORK_ERROR };
  }
}
