"use client";

// ─── Contributions, as this template speaks them ─────────────────────────────
//
// The shared vocabulary lives in `lib/contrib/types.ts` and the shared surfaces
// in `components/contrib/` — `ModerationQueue` and `ContributorShell` are used
// verbatim. What is here is the small adapter between those and the endpoints
// this page actually talks to:
//
//   POST  /contributions/submit/:contribToken   friends, anonymous, reusable
//   GET   /contributions/:shareId/published     the live poll
//   GET   /contributions/:shareId/queue         owner only
//   POST  /contributions/:shareId/approve-all   owner only
//   PATCH /contributions/:id/status             owner only
//
// ── TWO SECRETS, AND THEY ARE NOT INTERCHANGEABLE ────────────────────────────
//
// `shareId` is a READ capability handed to the one person the page is for.
// `contribToken` is a WRITE capability handed to a group chat. The friends'
// link is built from the token and never from the share id — a link that let
// twenty people write would otherwise also let twenty people read the gift.
//
// ── THE SERVER SAYS "published", THE SHARED UI SAYS "approved" ───────────────
//
// Same state, two vocabularies, translated in exactly one place: `toShared` on
// the way in and `fromShared` on the way out. Nothing downstream has to know.
//
// ── EVERY TIMER IN HERE IS CLEANED UP ────────────────────────────────────────
//
// The poll stops on tab-hide, restarts on return with an immediate tick, and is
// torn down with its abort controller on unmount. Nothing survives the effect
// that created it.

import { useCallback, useEffect, useRef, useState } from "react";
import { API_URL, IS_NGROK } from "@/lib/config";
import { list, num, obj, str, strOr, type Raw } from "@/lib/wire";
import type { Contribution, ContributionStatus } from "@/lib/contrib/types";
import type { Comment } from "./types";
import { relativeAgo } from "./theme";

/** This template collects one thing. The server's vocabulary for it. */
const KIND = "comment";
const PAGE_TYPE = "watch";
const POLL_MS = 5000;
/** Mirrors the server's own cap, so the limit is visible while typing. */
export const COMMENT_MAX = 200;
export const NAME_MAX = 30;

type ServerStatus = "pending" | "published" | "rejected";

const headers = (token?: string | null): Record<string, string> => ({
  "Content-Type": "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
  ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
});

const toShared = (s: string): ContributionStatus =>
  s === "published" ? "approved" : s === "rejected" ? "rejected" : "pending";

const fromShared = (s: ContributionStatus): ServerStatus =>
  s === "approved" ? "published" : s === "rejected" ? "rejected" : "pending";

/** One wire row → the shared `Contribution`. Null for anything unusable. */
function toContribution(raw: Raw): Contribution | null {
  const id = str(raw.id ?? raw._id, "");
  const text = strOr(obj(raw.payload).text, "").trim().slice(0, COMMENT_MAX);
  if (!id || !text) return null;
  return {
    id,
    kind: "comment",
    author: str(raw.submitterName, "Someone").slice(0, NAME_MAX),
    body: text,
    status: toShared(str(raw.status, "approved")),
    flagged: raw.flagged === true,
    createdAt: str(raw.createdAt, new Date(0).toISOString()),
  };
}

/** A contribution as the comment list renders it. */
export function contributionToComment(c: Contribution): Comment {
  return {
    id: `x-${c.id}`,
    author: c.author,
    text: c.body,
    ago: relativeAgo(c.createdAt),
    likes: 0,
    status: "published",
  };
}

/** One submission. Resolves; never throws. */
export async function submitComment(
  contribToken: string,
  name: string,
  text: string,
  idempotencyKey: string,
): Promise<{ ok: true; status: ServerStatus } | { ok: false; error: string }> {
  try {
    const res = await fetch(`${API_URL}/contributions/submit/${encodeURIComponent(contribToken)}`, {
      method: "POST",
      headers: { ...headers(), "Idempotency-Key": idempotencyKey },
      body: JSON.stringify({
        kind: KIND,
        pageType: PAGE_TYPE,
        submitterName: name.trim().slice(0, NAME_MAX),
        payload: { text: text.trim().slice(0, COMMENT_MAX) },
        idempotencyKey,
      }),
    });
    const body = obj(await res.json().catch(() => null));
    if (!res.ok || body.success !== true) {
      const message = typeof body.error === "string" ? body.error : "That didn't go through. Try again?";
      return { ok: false, error: message };
    }
    return { ok: true, status: (str(obj(body.data).status, "pending") as ServerStatus) };
  } catch {
    return { ok: false, error: "Couldn't reach the server — check your connection and try again." };
  }
}

/**
 * A key that survives being sent twice.
 *
 * `crypto.randomUUID` does not exist outside a secure context, and a throw here
 * would take out the one button on the page.
 */
export function idempotencyKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `k-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

/* ── The live poll ─────────────────────────────────────────────────────────── */

export function usePublishedComments(shareId: string | null | undefined, enabled: boolean): Comment[] {
  const [items, setItems] = useState<Comment[]>([]);
  const inFlight = useRef(false);

  useEffect(() => {
    if (!enabled || !shareId) return;
    if (typeof document === "undefined") return;

    let alive = true;
    let timer: number | null = null;
    const controller = new AbortController();

    const tick = async () => {
      if (!alive || inFlight.current) return;
      inFlight.current = true;
      try {
        const res = await fetch(`${API_URL}/contributions/${encodeURIComponent(shareId)}/published`, {
          headers: headers(),
          cache: "no-store",
          signal: controller.signal,
        });
        const body = obj(await res.json().catch(() => null));
        if (!alive || body.success !== true) return;
        const rows = list<Contribution>(obj(body.data).contributions, toContribution, []);
        setItems(rows.map(contributionToComment));
      } catch {
        /* a poll that fails leaves what is already on screen alone */
      } finally {
        inFlight.current = false;
      }
    };

    const stop = () => {
      if (timer === null) return;
      window.clearInterval(timer);
      timer = null;
    };
    const start = () => {
      if (timer !== null) return;
      timer = window.setInterval(() => void tick(), POLL_MS);
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
  }, [shareId, enabled]);

  return items;
}

/* ── The owner's queue ─────────────────────────────────────────────────────── */

export interface WatchQueue {
  items: Contribution[];
  loading: boolean;
  busyIds: string[];
  approvingAll: boolean;
  approve: (id: string) => void;
  reject: (id: string) => void;
  approveAll: () => void;
}

export function useWatchQueue(
  shareId: string | null | undefined,
  token: string | null | undefined,
  enabled: boolean,
): WatchQueue {
  const [items, setItems] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyIds, setBusyIds] = useState<string[]>([]);
  const [approvingAll, setApprovingAll] = useState(false);
  const [nonce, setNonce] = useState(0);

  const on = Boolean(enabled && shareId && token);

  useEffect(() => {
    if (!on || !shareId || !token) {
      setLoading(false);
      return;
    }
    let alive = true;
    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch(`${API_URL}/contributions/${encodeURIComponent(shareId)}/queue`, {
          headers: headers(token),
          cache: "no-store",
          signal: controller.signal,
        });
        const body = obj(await res.json().catch(() => null));
        if (!alive) return;
        if (body.success === true) {
          setItems(list<Contribution>(obj(body.data).contributions, toContribution, []));
        }
      } catch {
        /* the panel simply stays empty */
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
      controller.abort();
    };
  }, [on, shareId, token, nonce]);

  const decide = useCallback(
    (id: string, next: ContributionStatus) => {
      if (!token) return;
      setBusyIds((prev) => [...prev, id]);
      void (async () => {
        try {
          await fetch(`${API_URL}/contributions/${encodeURIComponent(id)}/status`, {
            method: "PATCH",
            headers: headers(token),
            body: JSON.stringify({ status: fromShared(next) }),
          });
          setItems((prev) => prev.map((c) => (c.id === id ? { ...c, status: next } : c)));
        } catch {
          /* left as it was; the next open re-reads the truth */
        } finally {
          setBusyIds((prev) => prev.filter((x) => x !== id));
        }
      })();
    },
    [token],
  );

  const approve = useCallback((id: string) => decide(id, "approved"), [decide]);
  const reject = useCallback((id: string) => decide(id, "rejected"), [decide]);

  const approveAll = useCallback(() => {
    if (!token || !shareId) return;
    setApprovingAll(true);
    void (async () => {
      try {
        await fetch(`${API_URL}/contributions/${encodeURIComponent(shareId)}/approve-all`, {
          method: "POST",
          headers: headers(token),
        });
        setNonce((n) => n + 1);
      } catch {
        /* nothing changed; the button can be pressed again */
      } finally {
        setApprovingAll(false);
      }
    })();
  }, [token, shareId]);

  return { items, loading, busyIds, approvingAll, approve, reject, approveAll };
}

/** Kept so a caller that wants a raw count does not re-derive it. */
export const pendingCount = (items: readonly Contribution[]): number =>
  items.filter((c) => c.status === "pending").length;

/** Defensive: the queue endpoint returns a number the panel likes to show. */
export const asCount = (v: unknown): number => Math.max(0, Math.trunc(num(v, 0)));
