"use client";

// ─── ReviewQueue — the sender decides what goes on the listing ────────────────
//
// Her friends' reviews land PENDING. Nothing reaches the published listing
// until the sender taps Approve, because that link went into a group chat and
// the page is about a real person with their name on it. There is no auto-
// publish, no "approve after an hour", no exceptions.
//
// This file is a THIN WRAPPER. The rendering — the rows, the flag marker, the
// approve/reject pair, the empty state, the reduced-motion handling — is all
// `components/contrib/ModerationQueue.tsx`, used as-is. The only things added
// here are the transport and the template's skin.
//
// ── WHY THE TRANSPORT IS LOCAL ───────────────────────────────────────────────
//
// `lib/contrib/api.ts` speaks a `/contrib/:shareId/:kind` shape; the server
// this ships against speaks `/contributions/...`, and it says "published" where
// the shared moderation vocabulary says "approved". Both mappings happen here,
// in one direction each, exactly as the other templates do it — nothing
// downstream has to know the two words mean the same thing.
//
// ── THE POLL ─────────────────────────────────────────────────────────────────
//
// The same three-state rule as `useContributions`, because a forgotten
// `setInterval` is a phone waking its radio every five seconds inside a
// backgrounded tab for as long as the tab exists:
//
//   VISIBLE   → tick every 5s
//   HIDDEN    → stop, on `visibilitychange`
//   UNMOUNTED → stop, unsubscribe, abort the request in flight

import { useCallback, useEffect, useRef, useState, type JSX } from "react";

import ModerationQueue from "@/components/contrib/ModerationQueue";
import { API_URL, IS_NGROK } from "@/lib/config";
import type { Contribution, StarValue } from "@/lib/contrib/types";
import { useAppSelector } from "@/store/hooks";

import { AP } from "./theme";
import { APP_REVIEW_LIMITS } from "./types";

const BASE = `${API_URL}/contributions`;
const POLL_MS = 5_000;

/* ── Wire ──────────────────────────────────────────────────────────────────── */

type Result<T> = { ok: true; data: T } | { ok: false; status: number; error: string };

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

const asRecord = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};

const text = (v: unknown, max: number): string => (typeof v === "string" ? v.slice(0, max).trim() : "");

/**
 * One wire row → the shared moderation vocabulary.
 *
 * Nothing off the wire is trusted: a row written by an older deploy, or a field
 * somebody nulled out by hand, degrades to one missing row rather than taking
 * the whole panel down with it.
 */
function toContribution(raw: unknown): Contribution | null {
  const row = asRecord(raw);
  const id = text(row.id ?? row._id, 64);
  const payload = asRecord(row.payload);
  const body = text(payload.body, APP_REVIEW_LIMITS.body);
  const title = text(payload.title, APP_REVIEW_LIMITS.title);
  if (!id || (!body && !title)) return null;

  const serverStatus = text(row.status, 20);
  const item: Contribution = {
    id,
    kind: "review",
    author: text(row.submitterName, APP_REVIEW_LIMITS.author) || "Someone",
    body: body || title,
    status:
      serverStatus === "published" ? "approved" : serverStatus === "rejected" ? "rejected" : "pending",
    // Unknown means "not flagged" — a missing field is no reason to put a
    // warning badge on somebody's words.
    flagged: row.flagged === true,
    createdAt: text(row.createdAt, 40) || new Date(0).toISOString(),
  };
  if (title) item.title = title;

  const stars = payload.stars;
  if (typeof stars === "number" && stars >= 1 && stars <= 5) {
    item.rating = Math.round(stars) as StarValue;
  }
  return item;
}

/** Owner. Every status, so the sender can see what they already dealt with. */
async function fetchQueue(
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
    const parsed = await envelope<unknown>(res, "Couldn't load what's waiting for you.");
    if (!parsed.ok) return parsed;
    const rows = asRecord(parsed.data).contributions;
    const out: Contribution[] = [];
    for (const row of Array.isArray(rows) ? rows : []) {
      const item = toContribution(row);
      if (item) out.push(item);
    }
    return { ok: true, data: out };
  } catch {
    return { ok: false, status: 0, error: NETWORK };
  }
}

/** Owner. One decision, one row. "approved" here is "published" on the wire. */
async function decide(id: string, approved: boolean, token: string): Promise<Result<true>> {
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
async function approveEverything(shareId: string, token: string): Promise<Result<number>> {
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

/* ── Skin ──────────────────────────────────────────────────────────────────── */

const QUEUE_THEME = {
  paper: "#FFFFFF",
  paperDeep: AP.card,
  edge: AP.edge,
  ink: AP.ink,
  inkSoft: AP.inkSoft,
  inkFaint: AP.inkSoft,
  accent: AP.accent,
  accentInk: "#FFFFFF",
  danger: "#C0322B",
  ok: "#1E7A46",
  warn: "#B07213",
  font: AP.font,
  serif: AP.font,
};

/* ── The panel ─────────────────────────────────────────────────────────────── */

export function ReviewQueue({ shareId }: { shareId: string }): JSX.Element {
  const { accessToken } = useAppSelector((s) => s.auth);

  const [items, setItems] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyIds, setBusyIds] = useState<string[]>([]);
  const [approvingAll, setApprovingAll] = useState(false);
  const [error, setError] = useState("");

  /** Claimed synchronously; `loading` lands a render too late to gate a poll. */
  const inFlight = useRef(false);

  /** Written after every commit, read only from callbacks. */
  const live = useRef({ shareId, token: accessToken });
  useEffect(() => {
    live.current = { shareId, token: accessToken };
  });

  const active = Boolean(shareId) && Boolean(accessToken);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      if (!shareId || !accessToken || inFlight.current) return;
      inFlight.current = true;
      const res = await fetchQueue(shareId, accessToken, signal);
      inFlight.current = false;
      if (res.ok) setItems(res.data);
      setLoading(false);
    },
    [shareId, accessToken]
  );

  useEffect(() => {
    if (!active) return;

    let alive = true;
    let timer: ReturnType<typeof setInterval> | null = null;
    const controller = new AbortController();

    const tick = () => {
      if (!alive) return;
      void load(controller.signal);
    };
    const stop = () => {
      if (timer === null) return;
      clearInterval(timer);
      timer = null;
    };
    const start = () => {
      if (timer !== null) return;
      timer = setInterval(tick, POLL_MS);
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        stop();
        return;
      }
      // Back from hidden ticks immediately — the first thing the sender does on
      // returning is look at what came in, and a five-second wait reads as stale.
      tick();
      start();
    };

    tick();
    if (document.visibilityState === "visible") start();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      alive = false;
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
      controller.abort();
    };
  }, [active, load]);

  const setStatus = useCallback(async (id: string, approved: boolean) => {
    const { token } = live.current;
    if (!token) return;

    setBusyIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    const res = await decide(id, approved, token);
    setBusyIds((prev) => prev.filter((b) => b !== id));

    if (!res.ok) {
      setError(res.error);
      return;
    }
    setError("");
    setItems((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: approved ? "approved" : "rejected" } : c))
    );
  }, []);

  const approveAll = useCallback(async () => {
    const { shareId: id, token } = live.current;
    if (!id || !token) return;

    setApprovingAll(true);
    const res = await approveEverything(id, token);
    setApprovingAll(false);

    if (!res.ok) {
      setError(res.error);
      return;
    }
    setError("");
    setItems((prev) => prev.map((c) => (c.status === "pending" ? { ...c, status: "approved" } : c)));
  }, []);

  // Not published yet, or signed out on another device. Saying so beats an
  // empty panel that looks like nobody has written anything.
  if (!active) {
    return (
      <section
        style={{
          padding: "22px 18px",
          borderRadius: 16,
          border: `1px dashed ${AP.edge}`,
          background: AP.card,
          fontFamily: AP.font,
          color: AP.ink,
        }}
      >
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Reviews land here first</h3>
        <p style={{ margin: "6px 0 0", fontSize: 13.5, lineHeight: 1.55, color: AP.inkSoft }}>
          {shareId
            ? "Sign in on this device to see what her friends have written. Nothing goes on the listing until you approve it."
            : "Publish the listing, then send the review link around. What comes back waits for you here — nothing appears until you approve it."}
        </p>
      </section>
    );
  }

  return (
    <div style={{ fontFamily: AP.font }}>
      <ModerationQueue
        items={items}
        loading={loading}
        busyIds={busyIds}
        onApprove={(id) => void setStatus(id, true)}
        onReject={(id) => void setStatus(id, false)}
        onApproveAll={() => void approveAll()}
        approvingAll={approvingAll}
        emptyTitle="Nothing waiting yet"
        emptyBody="When one of her friends writes a review it lands here first. You see it before she does, and nothing joins the rating until you say so."
        theme={QUEUE_THEME}
      />

      {error ? (
        <p aria-live="polite" style={{ margin: "10px 0 0", fontSize: 13, color: "#C0322B" }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default ReviewQueue;
