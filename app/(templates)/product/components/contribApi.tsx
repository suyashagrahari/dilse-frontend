"use client";

// ─── Reviews from her friends — the wire, and the live poll ──────────────────
//
// Four calls and two hooks. Everything a person who is not the sender can do to
// this page goes through here.
//
// ── TWO SECRETS, TWO AUDIENCES ───────────────────────────────────────────────
//
// `contribToken` is a WRITE capability: it is what goes in the group chat, it
// lets a friend post a review, and it lets them do nothing else — it does not
// open the gift. `shareId` is the READ address the recipient holds. They are
// separate values on the document and they are never interchangeable here. The
// friends' link is built from `contribToken` and only from `contribToken`; the
// server returns it on OWNER reads only, so it can never leak off a share page.
//
// ── STATUS VOCABULARY ────────────────────────────────────────────────────────
//
// The server says "published"; the shared moderation components say "approved".
// The mapping happens in this file, in one direction each way, so no component
// downstream has to know that the two words mean the same thing.
//
// ── NOTHING THROWS ───────────────────────────────────────────────────────────
//
// Every call resolves to a discriminated result. The callers are handlers on a
// page a stranger opened from a link, and an exception escaping one of them is
// a white screen where somebody was about to be kind about a person they know.

import { useCallback, useEffect, useRef, useState } from "react";
import { API_URL, IS_NGROK } from "@/lib/config";
import { newIdempotencyKey } from "@/lib/contrib/api";
import type { Contribution, StarValue } from "@/lib/contrib/types";
import type { Review, StarRating } from "./types";

export type Result<T> = { ok: true; data: T } | { ok: false; status: number; error: string };

const BASE = `${API_URL}/contributions`;

/** The kind this template collects. One page, one stream. */
const KIND = "review";

/**
 * Mirrors the server's caps exactly — `LIMITS` in contribution.controller.ts
 * and `SUBMITTER_NAME_MAX` on the Contribution model. Mirrored rather than
 * guessed so the contributor sees the limit while typing instead of losing a
 * paragraph to a 400.
 */
export const REVIEW_LIMITS = { title: 60, body: 200, name: 30 } as const;

function headers(token?: string | null): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (IS_NGROK) h["ngrok-skip-browser-warning"] = "true";
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

const NETWORK = "Couldn't reach the server.";

async function envelope<T>(res: Response, fallback: string): Promise<Result<T>> {
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  const data = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  if (!res.ok || data.success === false) {
    const message = typeof data.error === "string" && data.error ? data.error : fallback;
    return { ok: false, status: res.status, error: message };
  }
  if (data.data === undefined || data.data === null) {
    return { ok: false, status: res.status, error: fallback };
  }
  return { ok: true, data: data.data as T };
}

/* ── Coercion ──────────────────────────────────────────────────────────────── */

const asRecord = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};

const text = (v: unknown, max: number): string =>
  typeof v === "string" ? v.slice(0, max).trim() : "";

const starOf = (v: unknown): StarRating => {
  const n = Math.round(typeof v === "number" ? v : Number(v));
  return n >= 1 && n <= 5 ? (n as StarRating) : 5;
};

/** "3 March 2026" — the byline date. Formatted in the browser, never on a server. */
export function reviewedOn(iso: string): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "";
  return new Date(t).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** One wire row → the `Review` shape the listing already renders. */
function toReview(raw: unknown): Review | null {
  const row = asRecord(raw);
  const id = text(row.id ?? row._id, 64);
  const payload = asRecord(row.payload);
  const body = text(payload.body, REVIEW_LIMITS.body);
  const title = text(payload.title, REVIEW_LIMITS.title);
  if (!id || (!body && !title)) return null;

  const created = text(row.createdAt, 40);
  const day = reviewedOn(created);

  return {
    id,
    author: text(row.submitterName, REVIEW_LIMITS.name) || "Anonymous",
    stars: starOf(payload.stars),
    title,
    body,
    ago: day ? `Reviewed in India on ${day}` : "Reviewed in India",
    // A contributed review is not a purchase the sender made. Saying otherwise
    // would be the one dishonest line on a page that is otherwise a joke.
    verified: false,
    helpful: 0,
    status: "published",
  };
}

/** One wire row → the shared moderation vocabulary. */
function toContribution(raw: unknown): Contribution | null {
  const row = asRecord(raw);
  const id = text(row.id ?? row._id, 64);
  const payload = asRecord(row.payload);
  const body = text(payload.body, REVIEW_LIMITS.body);
  const title = text(payload.title, REVIEW_LIMITS.title);
  if (!id || (!body && !title)) return null;

  const serverStatus = text(row.status, 20);
  const out: Contribution = {
    id,
    kind: "review",
    author: text(row.submitterName, REVIEW_LIMITS.name) || "Someone",
    body: body || title,
    status: serverStatus === "published" ? "approved" : serverStatus === "rejected" ? "rejected" : "pending",
    flagged: row.flagged === true,
    createdAt: text(row.createdAt, 40) || new Date(0).toISOString(),
  };
  if (title) out.title = title;
  const stars = payload.stars;
  if (typeof stars === "number" && stars >= 1 && stars <= 5) out.rating = Math.round(stars) as StarValue;
  return out;
}

function rowsOf(data: unknown): unknown[] {
  const d = asRecord(data);
  return Array.isArray(d.contributions) ? d.contributions : [];
}

/* ── The calls ─────────────────────────────────────────────────────────────── */

export interface ReviewDraft {
  stars: StarRating;
  title: string;
  body: string;
  name: string;
}

/**
 * A friend posts a review. Addressed by `contribToken`, never by `shareId`.
 *
 * `idempotencyKey` is generated once per submission and REUSED on retry: the
 * contributor is on a phone, the request may well have landed before the
 * connection dropped, and the server collapses the repeat onto the original row
 * instead of writing a second one.
 */
export async function submitReview(
  contribToken: string,
  draft: ReviewDraft,
  idempotencyKey: string,
  signal?: AbortSignal
): Promise<Result<{ id: string; status: string }>> {
  try {
    const res = await fetch(`${BASE}/submit/${encodeURIComponent(contribToken)}`, {
      method: "POST",
      headers: { ...headers(), "Idempotency-Key": idempotencyKey },
      body: JSON.stringify({
        kind: KIND,
        pageType: "product",
        submitterName: draft.name.trim().slice(0, REVIEW_LIMITS.name),
        idempotencyKey,
        payload: {
          stars: draft.stars,
          title: draft.title.trim().slice(0, REVIEW_LIMITS.title),
          body: draft.body.trim().slice(0, REVIEW_LIMITS.body),
        },
      }),
      signal,
    });
    const parsed = await envelope<unknown>(res, "Couldn't send that just now.");
    if (!parsed.ok) return parsed;
    const row = asRecord(parsed.data);
    return { ok: true, data: { id: text(row.id, 64), status: text(row.status, 20) || "pending" } };
  } catch {
    return { ok: false, status: 0, error: NETWORK };
  }
}

/** Public. Published reviews on this page. This is what the live page polls. */
export async function fetchPublishedReviews(
  shareId: string,
  signal?: AbortSignal
): Promise<Result<Review[]>> {
  try {
    const res = await fetch(`${BASE}/${encodeURIComponent(shareId)}/published`, {
      headers: headers(),
      cache: "no-store",
      signal,
    });
    const parsed = await envelope<unknown>(res, "Couldn't load the reviews.");
    if (!parsed.ok) return parsed;
    const out: Review[] = [];
    for (const row of rowsOf(parsed.data)) {
      const review = toReview(row);
      if (review) out.push(review);
    }
    return { ok: true, data: out };
  } catch {
    return { ok: false, status: 0, error: NETWORK };
  }
}

/** Owner. Every status, so the sender can see what they have already dealt with. */
export async function fetchReviewQueue(
  shareId: string,
  token: string,
  signal?: AbortSignal
): Promise<Result<Contribution[]>> {
  try {
    const res = await fetch(`${BASE}/${encodeURIComponent(shareId)}/queue`, {
      headers: headers(token),
      cache: "no-store",
      signal,
    });
    const parsed = await envelope<unknown>(res, "Couldn't load your queue.");
    if (!parsed.ok) return parsed;
    const out: Contribution[] = [];
    for (const row of rowsOf(parsed.data)) {
      const item = toContribution(row);
      if (item) out.push(item);
    }
    return { ok: true, data: out };
  } catch {
    return { ok: false, status: 0, error: NETWORK };
  }
}

/** Owner. One decision, one row. "approved" here is "published" on the wire. */
export async function decideReview(
  id: string,
  approved: boolean,
  token: string
): Promise<Result<true>> {
  try {
    const res = await fetch(`${BASE}/${encodeURIComponent(id)}/status`, {
      method: "PATCH",
      headers: headers(token),
      body: JSON.stringify({ status: approved ? "published" : "rejected" }),
    });
    const parsed = await envelope<unknown>(res, "Couldn't save that.");
    return parsed.ok ? { ok: true, data: true } : parsed;
  } catch {
    return { ok: false, status: 0, error: NETWORK };
  }
}

/** Owner. Publishes everything still pending. Never resurrects a rejection. */
export async function approveAllReviews(shareId: string, token: string): Promise<Result<number>> {
  try {
    const res = await fetch(`${BASE}/${encodeURIComponent(shareId)}/approve-all`, {
      method: "POST",
      headers: headers(token),
    });
    const parsed = await envelope<unknown>(res, "Couldn't approve those.");
    if (!parsed.ok) return parsed;
    const n = asRecord(parsed.data).approved;
    return { ok: true, data: typeof n === "number" ? n : 0 };
  } catch {
    return { ok: false, status: 0, error: NETWORK };
  }
}

/** Turns a status code into something a stranger doing a favour can act on. */
export function submitMessageFor(status: number, serverError: string): string {
  switch (status) {
    case 0:
      return "Couldn't reach the server — check your connection and try again.";
    case 400:
    case 422:
      return "That didn't go through — check the fields and try again.";
    case 404:
      return "This link has gone — ask whoever sent it for a new one.";
    case 429:
      return "That's a lot at once — give it a minute and try again.";
    default:
      return serverError || "Something went wrong — try that again in a moment.";
  }
}

/* ── The live poll ─────────────────────────────────────────────────────────── */

export interface LiveReviews {
  /** Published contributed reviews, oldest first as the server sends them. */
  reviews: Review[];
  /** Ids that arrived on the most recent tick. Drives the entry animation. */
  arrivedIds: readonly string[];
}

/**
 * Polls the published feed every 5s while the page is visible.
 *
 * Three states, all handled, because a forgotten interval is a phone waking its
 * radio inside a backgrounded tab for as long as the tab exists:
 *
 *   VISIBLE   → tick every `pollMs`
 *   HIDDEN    → stop; `visibilitychange` clears the timer the moment the tab
 *               is backgrounded or the phone is locked
 *   UNMOUNTED → stop, unsubscribe, abort the request in flight
 *
 * Returning from hidden ticks IMMEDIATELY and then restarts the interval — the
 * first thing somebody does on coming back is look at the list.
 */
export function useLiveReviews(shareId: string | undefined, enabled: boolean, pollMs = 5000): LiveReviews {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [arrivedIds, setArrivedIds] = useState<readonly string[]>([]);

  /** Ids already on screen. Written from the tick only; never read in render. */
  const seen = useRef<Set<string>>(new Set());
  /** The first load is the page, not an arrival — nothing animates in on it. */
  const hasLoaded = useRef(false);
  /** One request at a time — `loading` state lands too late to gate the timer. */
  const inFlight = useRef(false);

  useEffect(() => {
    if (!enabled || !shareId) return;

    // A new page means a new list — nothing carried over from the last one is
    // "already seen", and its first tick is a first load again.
    seen.current = new Set();
    hasLoaded.current = false;

    let alive = true;
    let timer: ReturnType<typeof setInterval> | null = null;
    const controller = new AbortController();

    const tick = async () => {
      if (!alive || inFlight.current) return;
      inFlight.current = true;
      const res = await fetchPublishedReviews(shareId, controller.signal);
      inFlight.current = false;
      if (!alive || !res.ok) return;

      const fresh: string[] = [];
      for (const r of res.data) {
        if (seen.current.has(r.id)) continue;
        seen.current.add(r.id);
        // The very first load IS the page, not an arrival. Animating twenty
        // reviews in on open reads as a loading screen, not as news.
        if (hasLoaded.current) fresh.push(r.id);
      }
      hasLoaded.current = true;
      setReviews(res.data);
      setArrivedIds(fresh);
    };

    const stop = () => {
      if (timer === null) return;
      clearInterval(timer);
      timer = null;
    };
    const start = () => {
      if (timer !== null) return;
      timer = setInterval(() => {
        void tick();
      }, pollMs);
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        stop();
        return;
      }
      void tick();
      start();
    };

    void tick();
    if (document.visibilityState === "visible") start();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      alive = false;
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
      controller.abort();
    };
  }, [shareId, enabled, pollMs]);

  return { reviews, arrivedIds };
}

/* ── The owner's queue ─────────────────────────────────────────────────────── */

export interface ModerationState {
  items: Contribution[];
  loading: boolean;
  busyIds: string[];
  approvingAll: boolean;
  pendingCount: number;
  approve: (id: string) => void;
  reject: (id: string) => void;
  approveAll: () => void;
  refresh: () => void;
}

/**
 * The sender's moderation queue.
 *
 * Polled on the same terms as the public feed, and every decision refreshes
 * from the server rather than patching local state — the queue is the one place
 * where "what I think happened" and "what is on the recipient's page" have to
 * be the same thing.
 */
export function useReviewModeration(
  shareId: string | undefined,
  token: string | null | undefined,
  enabled: boolean
): ModerationState {
  const [items, setItems] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyIds, setBusyIds] = useState<string[]>([]);
  const [approvingAll, setApprovingAll] = useState(false);
  const [nonce, setNonce] = useState(0);

  const live = useRef({ shareId, token });
  useEffect(() => {
    live.current = { shareId, token };
  });

  useEffect(() => {
    // Nothing to load. `loading` is reported as false below rather than set
    // here — a setState in an effect body is a cascading render, and React 19
    // lint is right to refuse it.
    if (!enabled || !shareId || !token) return;
    let alive = true;
    const controller = new AbortController();
    (async () => {
      const res = await fetchReviewQueue(shareId, token, controller.signal);
      if (!alive) return;
      if (res.ok) setItems(res.data);
      setLoading(false);
    })();
    return () => {
      alive = false;
      controller.abort();
    };
  }, [shareId, token, enabled, nonce]);

  const refresh = useCallback(() => setNonce((n) => n + 1), []);

  const decide = useCallback(
    (id: string, approved: boolean) => {
      const { shareId: sid, token: tok } = live.current;
      if (!sid || !tok) return;
      setBusyIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
      void decideReview(id, approved, tok).then(() => {
        setBusyIds((prev) => prev.filter((x) => x !== id));
        setNonce((n) => n + 1);
      });
    },
    []
  );

  const approve = useCallback((id: string) => decide(id, true), [decide]);
  const reject = useCallback((id: string) => decide(id, false), [decide]);

  const approveAll = useCallback(() => {
    const { shareId: sid, token: tok } = live.current;
    if (!sid || !tok) return;
    setApprovingAll(true);
    void approveAllReviews(sid, tok).then(() => {
      setApprovingAll(false);
      setNonce((n) => n + 1);
    });
  }, []);

  const active = enabled && !!shareId && !!token;

  return {
    items,
    loading: active && loading,
    busyIds,
    approvingAll,
    pendingCount: items.filter((i) => i.status === "pending").length,
    approve,
    reject,
    approveAll,
    refresh,
  };
}

export { newIdempotencyKey };
