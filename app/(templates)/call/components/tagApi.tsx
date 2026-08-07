// ─── Caller ID — the tag loop ────────────────────────────────────────────────
//
// Her friends tag the number. The sender approves. The published page shows the
// count going up. This file is every network call in that loop, plus the two
// pure helpers that build and read the friends' link.
//
// ── WHY THIS FILE EXISTS ALONGSIDE `lib/contrib/api.ts` ──────────────────────
//
// The shared contribution client speaks a `/contrib/:shareId/:kind` shape. The
// server that shipped speaks the shape documented in
// `server/src/routes/contribution.routes.ts`:
//
//   POST  /contributions/submit/:contribToken   friends, anonymous, reusable
//   GET   /contributions/:shareId/published     the live poll
//   GET   /contributions/:shareId/queue         owner moderation
//   POST  /contributions/:shareId/approve-all   owner
//   PATCH /contributions/:id/status             owner
//
// Those are the calls this template makes, because those are the calls that
// exist. The shared *components* (`ContributorShell`, `ModerationQueue`) are
// used as-is — only the transport is local, and `toContribution` below maps the
// server's row onto the shared `Contribution` type so those components never
// learn that anything is different.
//
// ── TWO SECRETS, AND THEY ARE NOT INTERCHANGEABLE ────────────────────────────
//
// `contribToken` is a WRITE capability handed to a group chat. `shareId` is a
// READ capability handed to the one person the page is for. The friends' link
// is built from the token and never from the shareId, and the shared read
// strips the token out of the payload so a recipient's page cannot leak it.
//
// The consequence, and it is a design point rather than a gap: the tag page has
// no read capability at all. It cannot fetch her name, her photo, the prompt or
// the existing tags — so the sender's link CARRIES those, as ordinary query
// parameters, because they are exactly the things the sender chose to put in an
// invitation. Nothing private travels with them.

"use client";

import { useEffect, useRef, useState } from "react";
import { API_URL, IS_NGROK } from "@/lib/config";
import { list, num, obj, str, strOr, type Raw } from "@/lib/wire";
import type { Contribution, ContributionStatus } from "@/lib/contrib/types";
import type { CallData, CallerTag } from "./types";

/** The server's word for what this template collects. */
export const TAG_KIND = "tag";
/** A hint that saves the resolver a query. Never trusted server-side. */
export const PAGE_TYPE = "call";

/** Enforced on both sides. The server cuts at these; the form shows them. */
export const TAG_LABEL_MAX = 24;
export const TAGGER_NAME_MAX = 30;

export type ApiResult<T> = { ok: true; data: T } | { ok: false; status: number; error: string };

const NETWORK_ERROR = "Couldn't reach the server.";

function headers(token?: string | null): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (token) h.Authorization = `Bearer ${token}`;
  if (IS_NGROK) h["ngrok-skip-browser-warning"] = "true";
  return h;
}

/** `{ success, data }` off a response without trusting any part of it. */
async function envelope<T>(res: Response, fallback: string): Promise<ApiResult<T>> {
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  const data = obj(body);

  if (!res.ok || data.success === false) {
    const message =
      (typeof data.error === "string" && data.error) ||
      (typeof data.message === "string" && data.message) ||
      fallback;
    return { ok: false, status: res.status, error: message };
  }
  if (data.data === undefined || data.data === null) {
    return { ok: false, status: res.status, error: fallback };
  }
  return { ok: true, data: data.data as T };
}

/**
 * A key that survives being sent twice.
 *
 * The friend is on a phone on a train. The POST goes out, the connection dies
 * before the reply, they press the button again — and without this her page
 * carries their tag twice. Reused across retries of the SAME submission;
 * regenerated for a genuinely new one.
 */
export function newSubmissionKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  }
  return `k-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

/* ── Rows ──────────────────────────────────────────────────────────────────── */

/** One approved tag as the published feed sends it. */
export interface PublishedTag {
  id: string;
  label: string;
  submitterName: string;
  createdAt: string;
}

function coercePublished(raw: Raw): PublishedTag | null {
  const id = str(raw.id ?? raw._id, "");
  const label = str(obj(raw.payload).label, "").trim().slice(0, TAG_LABEL_MAX);
  if (!id || !label) return null;
  return {
    id,
    label,
    submitterName: str(raw.submitterName, "Someone").slice(0, TAGGER_NAME_MAX),
    createdAt: str(raw.createdAt, new Date(0).toISOString()),
  };
}

/**
 * The server's status vocabulary is `pending | published | rejected`; the
 * shared components speak `pending | approved | rejected`. One translation, in
 * one place, both ways.
 */
const toSharedStatus = (v: unknown): ContributionStatus =>
  v === "published" ? "approved" : v === "rejected" ? "rejected" : "pending";

export const toServerStatus = (v: ContributionStatus): "published" | "rejected" =>
  v === "approved" ? "published" : "rejected";

/** One queue row onto the shape `ModerationQueue` renders. */
function toContribution(raw: Raw): Contribution | null {
  const id = str(raw.id ?? raw._id, "");
  const label = str(obj(raw.payload).label, "").trim().slice(0, TAG_LABEL_MAX);
  if (!id || !label) return null;

  const out: Contribution = {
    id,
    kind: "note",
    author: str(raw.submitterName, "Someone").slice(0, TAGGER_NAME_MAX),
    body: label,
    status: toSharedStatus(raw.status),
    flagged: raw.flagged === true,
    createdAt: str(raw.createdAt, new Date(0).toISOString()),
  };
  return out;
}

/* ── Calls ─────────────────────────────────────────────────────────────────── */

/**
 * A friend adds a tag. Anonymous by design, addressed by the write token.
 *
 * Never throws: the caller is a form handler on a page a stranger opened from a
 * WhatsApp link, and an exception there is a white screen where somebody was
 * about to be kind.
 */
export async function submitTag(
  contribToken: string,
  input: { label: string; submitterName: string },
  submissionKey: string,
  signal?: AbortSignal
): Promise<ApiResult<{ id: string; status: ContributionStatus }>> {
  const body = {
    kind: TAG_KIND,
    pageType: PAGE_TYPE,
    submitterName: input.submitterName.trim().slice(0, TAGGER_NAME_MAX),
    payload: { label: input.label.trim().slice(0, TAG_LABEL_MAX) },
    idempotencyKey: submissionKey,
  };

  try {
    const res = await fetch(`${API_URL}/contributions/submit/${encodeURIComponent(contribToken)}`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(body),
      signal,
    });
    const parsed = await envelope<Raw>(res, "Couldn't send that just now.");
    if (!parsed.ok) return parsed;
    const row = obj(parsed.data);
    return {
      ok: true,
      data: { id: str(row.id, ""), status: toSharedStatus(row.status) },
    };
  } catch {
    return { ok: false, status: 0, error: NETWORK_ERROR };
  }
}

/** Public. Approved tags only — this is what a published page polls. */
export async function fetchPublishedTags(
  shareId: string,
  signal?: AbortSignal
): Promise<ApiResult<PublishedTag[]>> {
  try {
    const res = await fetch(`${API_URL}/contributions/${encodeURIComponent(shareId)}/published`, {
      headers: headers(),
      cache: "no-store",
      signal,
    });
    const parsed = await envelope<Raw>(res, "Couldn't load the tags.");
    if (!parsed.ok) return parsed;
    const rows = obj(parsed.data).contributions;
    return { ok: true, data: list<PublishedTag>(rows, coercePublished, []) };
  } catch {
    return { ok: false, status: 0, error: NETWORK_ERROR };
  }
}

/** Owner only. Every status, newest first. */
export async function fetchTagQueue(
  shareId: string,
  token: string,
  signal?: AbortSignal
): Promise<ApiResult<Contribution[]>> {
  try {
    const res = await fetch(`${API_URL}/contributions/${encodeURIComponent(shareId)}/queue`, {
      headers: headers(token),
      cache: "no-store",
      signal,
    });
    const parsed = await envelope<Raw>(res, "Couldn't load what's waiting for you.");
    if (!parsed.ok) return parsed;
    const rows = obj(parsed.data).contributions;
    return { ok: true, data: list<Contribution>(rows, toContribution, []) };
  } catch {
    return { ok: false, status: 0, error: NETWORK_ERROR };
  }
}

/** Owner only. One decision, one row. */
export async function setTagStatus(
  id: string,
  status: ContributionStatus,
  token: string
): Promise<ApiResult<{ id: string }>> {
  try {
    const res = await fetch(`${API_URL}/contributions/${encodeURIComponent(id)}/status`, {
      method: "PATCH",
      headers: headers(token),
      body: JSON.stringify({ status: toServerStatus(status) }),
    });
    const parsed = await envelope<Raw>(res, "Couldn't save that.");
    if (!parsed.ok) return parsed;
    return { ok: true, data: { id: str(obj(parsed.data).id, id) } };
  } catch {
    return { ok: false, status: 0, error: NETWORK_ERROR };
  }
}

/** Owner only. Approves everything currently pending. */
export async function approveAllTags(
  shareId: string,
  token: string
): Promise<ApiResult<{ approved: number }>> {
  try {
    const res = await fetch(`${API_URL}/contributions/${encodeURIComponent(shareId)}/approve-all`, {
      method: "POST",
      headers: headers(token),
    });
    const parsed = await envelope<Raw>(res, "Couldn't approve those.");
    if (!parsed.ok) return parsed;
    return { ok: true, data: { approved: Math.max(0, Math.round(num(obj(parsed.data).approved, 0))) } };
  } catch {
    return { ok: false, status: 0, error: NETWORK_ERROR };
  }
}

/* ── The live poll ─────────────────────────────────────────────────────────── */

/**
 * Approved tags, folded into the page's own tag list.
 *
 * Same three-state discipline as `hooks/useContributions`, and for the same
 * reason: a forgotten interval is a phone waking its radio every five seconds
 * inside a tab nobody is looking at.
 *
 *   VISIBLE   → tick every 5s
 *   HIDDEN    → stop, on the `visibilitychange` tick itself
 *   UNMOUNTED → stop, unsubscribe, abort the request in flight
 */
export function useLiveTags(opts: { shareId?: string | null; enabled: boolean }): {
  tags: PublishedTag[];
} {
  const { shareId, enabled } = opts;
  const [tags, setTags] = useState<PublishedTag[]>([]);

  /** Claimed synchronously — `loading` state lands a render too late. */
  const inFlight = useRef(false);

  useEffect(() => {
    if (!enabled || !shareId) return;

    let alive = true;
    let timer: ReturnType<typeof setInterval> | null = null;
    const controller = new AbortController();

    const tick = async () => {
      if (!alive || inFlight.current) return;
      inFlight.current = true;
      const res = await fetchPublishedTags(shareId, controller.signal);
      inFlight.current = false;
      if (!alive || !res.ok) return;
      setTags(res.data);
    };

    const stop = () => {
      if (timer === null) return;
      clearInterval(timer);
      timer = null;
    };
    const start = () => {
      if (timer !== null) return;
      timer = setInterval(() => void tick(), 5000);
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
  }, [enabled, shareId]);

  return { tags };
}

/**
 * The page's own tags plus everything her friends have had approved.
 *
 * Case-insensitive on the label, because "pick up now" and "Pick Up Now" are
 * one vote and two rows would split the count that is the whole joke. The
 * page's own casing wins — the sender wrote it deliberately.
 */
export function mergeTags(base: readonly CallerTag[], published: readonly PublishedTag[]): CallerTag[] {
  const byKey = new Map<string, CallerTag>();
  for (const t of base) byKey.set(t.label.toLowerCase(), { label: t.label, count: t.count });
  for (const p of published) {
    const key = p.label.toLowerCase();
    const existing = byKey.get(key);
    if (existing) existing.count += 1;
    else byKey.set(key, { label: p.label, count: 1 });
  }
  return [...byKey.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

/* ── The friends' link ─────────────────────────────────────────────────────── */

/** What the sender's link carries, so the tag page can render before it can read. */
export interface TagInvite {
  name: string;
  photoUrl: string;
  prompt: string;
  /** Existing tags, for the chips. The whole reason most people finish. */
  chips: string[];
  /** The top tag's count, so the success screen can show it going up. */
  topCount: number;
}

const CHIP_SEP = "~";

/**
 * `/call/tag/<token>?n=…&a=…&q=…&t=…&c=…`
 *
 * Only ever built from `contribToken`. A photo is included only when it is a
 * plain http(s) URL under 400 characters — a `data:` image would blow past
 * every URL length limit between here and WhatsApp, and the initials fallback
 * is a designed state anyway.
 */
export function buildTagLink(origin: string, contribToken: string, data: CallData): string {
  const url = new URL(`/call/tag/${encodeURIComponent(contribToken)}`, origin || "https://subhsandesh.in");
  url.searchParams.set("n", data.caller.name);
  if (data.contributorPrompt) url.searchParams.set("q", data.contributorPrompt);

  const photo = data.caller.photoUrl;
  if (/^https?:\/\//i.test(photo) && photo.length <= 400) url.searchParams.set("a", photo);

  const top = [...data.tags].sort((a, b) => b.count - a.count);
  const chips = top.slice(0, 5).map((t) => t.label.replace(new RegExp(CHIP_SEP, "g"), "-"));
  if (chips.length > 0) url.searchParams.set("t", chips.join(CHIP_SEP));
  if (top.length > 0) url.searchParams.set("c", String(top[0].count));

  return url.toString();
}

/** The other half. Everything optional; every branch renders something. */
export function readTagInvite(params: URLSearchParams): TagInvite {
  const chipsRaw = strOr(params.get("t"), "");
  return {
    name: strOr(params.get("n"), "").trim().slice(0, 60),
    photoUrl: /^https?:\/\//i.test(params.get("a") ?? "") ? String(params.get("a")) : "",
    prompt: strOr(params.get("q"), "").trim().slice(0, 240),
    chips: chipsRaw
      .split(CHIP_SEP)
      .map((c) => c.trim().slice(0, TAG_LABEL_MAX))
      .filter(Boolean)
      .slice(0, 6),
    topCount: Math.max(0, Math.round(num(params.get("c"), 0))),
  };
}

/**
 * The WhatsApp nudge.
 *
 * `wa.me` with no number opens WhatsApp's own contact picker — the sender
 * chooses who, we only supply the words. Same URL the shared
 * `whatsappNudgeUrl` builds; re-derived here so the tag page does not have to
 * import a component module for one string.
 */
export function whatsappUrl(message: string, link: string): string {
  const text = [message.trim(), link.trim()].filter(Boolean).join(" ");
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

/** Stable copy helper. Resolves false rather than throwing on a denied clipboard. */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
