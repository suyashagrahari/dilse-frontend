"use client";

// ─── /app/review/[token] — the friends' door ─────────────────────────────────
//
// Somebody pulled this out of a group chat. They have no account, they are not
// going to make one, and they are giving this ninety seconds because they like
// the person it is about. So: FOUR FIELDS, no signup, no email.
//
//   1. stars      — five 44px targets
//   2. title      — 60   (APP_REVIEW_LIMITS.title)
//   3. review     — 200  (APP_REVIEW_LIMITS.body)
//   4. your name  — 30   (APP_REVIEW_LIMITS.author)
//
// A FIFTH FIELD HALVES COMPLETION. Do not add one. Every cap above is the
// server's own limit, mirrored so the contributor sees it while typing instead
// of losing a paragraph to a 400.
//
// ── THE LINK IS REUSABLE, SO THERE IS NO TOKEN TO BURN ───────────────────────
//
// One link goes to twenty friends and all twenty may write. `token` is a WRITE
// capability and nothing else — it does not open the recipient's page, which is
// addressed by a different secret. Dedupe is therefore per-SUBMISSION, not
// per-link: one idempotency key, minted once for this form session, reused
// across retries of the same submission. The server holds a unique index on
// { shareId, idempotencyKey } and turns a collision into "here is the row you
// already created". A double tap, a retry and a flaky network replaying the
// POST are all no-ops.
//
// The success state is a STATE FLIP, not a navigation, so browser-back cannot
// resubmit anything — there is nothing behind it to go back to.
//
// ── WHAT ARRIVES IN THE QUERY STRING ─────────────────────────────────────────
//
// Decoration the server never sees: `n` who it is about, `s` who asked, `p` the
// prompt, `ph` a photo, `sid` the public read id used only to poll the live
// listing after they submit. Strip all of it and the page still works.
//
// ── REUSE ────────────────────────────────────────────────────────────────────
//
// `ContributorShell`, `StarRating` and `newIdempotencyKey` are the shared
// pieces and are used as-is. The transport is written out here rather than
// taken from `lib/contrib/api.ts` because that client speaks a
// `/contrib/:shareId/:kind` shape and the server this ships against speaks
// `/contributions/...` — the same reason every other template carries its own
// twenty lines of fetch. The polling contract is `useContributions`' contract,
// to the letter: tick while visible, STOP on `visibilitychange` → hidden, and
// tear the timer, the listener and the request down on unmount.

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

import ContributorShell, { whatsappNudgeUrl } from "@/components/contrib/ContributorShell";
import StarRating from "@/components/contrib/StarRating";
import { newIdempotencyKey } from "@/lib/contrib/api";
import { CONTRIB_TAP, initialsOf, type StarValue } from "@/lib/contrib/types";
import { API_URL, IS_NGROK } from "@/lib/config";

import { AP } from "../../components/theme";
import { APP_REVIEW_LIMITS, type AppReview, type AppStar } from "../../components/types";

/* ── Wire ──────────────────────────────────────────────────────────────────── */

const BASE = `${API_URL}/contributions`;

/** This template's slug on the contribution record, and the stream it collects. */
const PAGE_TYPE = "app";
const KIND = "review";

/** How often the live listing asks for new arrivals, while somebody is looking. */
const POLL_MS = 5_000;

/** Rating stars stay amber — the accent is the chrome, not the rating. */
const STAR_FILL = "#F5A623";

type Result<T> = { ok: true; data: T } | { ok: false; status: number; error: string };

function headers(): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (IS_NGROK) h["ngrok-skip-browser-warning"] = "true";
  return h;
}

const NETWORK = "Couldn't reach the server.";

async function envelope<T>(res: Response, fallback: string): Promise<Result<T>> {
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    // A 500 from a proxy is frequently an HTML error page, so `json()` is
    // itself a throw site.
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

const starOf = (v: unknown): AppStar => {
  const n = Math.round(typeof v === "number" ? v : Number(v));
  return n >= 1 && n <= 5 ? (n as AppStar) : 5;
};

/** "2d ago". Relative, formatted in the browser, never on a server. */
function agoOf(iso: string): string {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return "just now";
  const secs = Math.max(0, Math.round((Date.now() - then) / 1000));
  if (secs < 60) return "just now";
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 31) return `${days}d ago`;
  const months = Math.round(days / 30);
  return months < 12 ? `${months}mo ago` : `${Math.round(months / 12)}y ago`;
}

/** One wire row → the listing's own review shape. Null for anything unusable. */
function toReview(raw: unknown): AppReview | null {
  const row = asRecord(raw);
  const id = text(row.id ?? row._id, 64);
  const payload = asRecord(row.payload);
  const body = text(payload.body, APP_REVIEW_LIMITS.body);
  const title = text(payload.title, APP_REVIEW_LIMITS.title);
  if (!id || (!body && !title)) return null;

  return {
    id,
    author: text(row.submitterName, APP_REVIEW_LIMITS.author) || "Anonymous",
    stars: starOf(payload.stars),
    title,
    body,
    ago: agoOf(text(row.createdAt, 40)),
    status: "published",
  };
}

export interface ReviewDraft {
  stars: AppStar;
  title: string;
  body: string;
  name: string;
}

/**
 * A friend posts a review. Addressed by the reusable write token.
 *
 * `idempotencyKey` is minted once per submission and REUSED on retry: the
 * contributor is on a phone, the request may well have landed before the
 * connection dropped, and the server collapses the repeat onto the original row
 * instead of writing a second one.
 */
async function sendReview(
  token: string,
  draft: ReviewDraft,
  idempotencyKey: string
): Promise<Result<{ status: string }>> {
  try {
    const res = await fetch(`${BASE}/submit/${encodeURIComponent(token)}`, {
      method: "POST",
      // Sent as a header as well as in the body — free, and it is the shape
      // most idempotency middleware reads.
      headers: { ...headers(), "Idempotency-Key": idempotencyKey },
      body: JSON.stringify({
        kind: KIND,
        pageType: PAGE_TYPE,
        submitterName: draft.name.trim().slice(0, APP_REVIEW_LIMITS.author),
        idempotencyKey,
        payload: {
          stars: draft.stars,
          title: draft.title.trim().slice(0, APP_REVIEW_LIMITS.title),
          body: draft.body.trim().slice(0, APP_REVIEW_LIMITS.body),
        },
      }),
    });
    const parsed = await envelope<unknown>(res, "Couldn't send that just now.");
    if (!parsed.ok) return parsed;
    return { ok: true, data: { status: text(asRecord(parsed.data).status, 20) || "pending" } };
  } catch {
    return { ok: false, status: 0, error: NETWORK };
  }
}

/** Public. Approved reviews on the listing. Polled, so it never caches. */
async function fetchPublished(shareId: string, signal?: AbortSignal): Promise<Result<AppReview[]>> {
  try {
    const res = await fetch(`${BASE}/${encodeURIComponent(shareId)}/published`, {
      headers: headers(),
      cache: "no-store",
      signal,
    });
    const parsed = await envelope<unknown>(res, "Couldn't load the reviews.");
    if (!parsed.ok) return parsed;
    const rows = asRecord(parsed.data).contributions;
    const out: AppReview[] = [];
    for (const row of Array.isArray(rows) ? rows : []) {
      const review = toReview(row);
      if (review) out.push(review);
    }
    // Newest first — the contributor's own is pinned above these anyway.
    return { ok: true, data: out.reverse() };
  } catch {
    return { ok: false, status: 0, error: NETWORK };
  }
}

/** Turns a status code into something a stranger doing a favour can act on. */
function messageFor(status: number, serverError: string): string {
  switch (status) {
    case 0:
      return "Couldn't reach the server — check your connection and try again.";
    case 400:
    case 422:
      return "That didn't go through — check the fields and try again.";
    case 404:
      return "This link has gone quiet — ask whoever sent it for a fresh one.";
    case 429:
      return "That's a lot at once — give it a minute and try again.";
    default:
      return serverError || "Something went wrong — try that again in a moment.";
  }
}

/* ── Aggregate maths ───────────────────────────────────────────────────────── */

/**
 * Mean of PUBLISHED stars, one decimal, HALF-UP.
 *
 * Done over integers — `sum * 10 / count` rather than `(sum / count) * 10` —
 * because the float form turns an exact 4.05 into 40.499999999999996 and rounds
 * a 4.1 down to 4.0.
 */
function averageOf(reviews: readonly AppReview[]): number {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((total, r) => total + r.stars, 0);
  return Math.floor((sum * 10) / reviews.length + 0.5) / 10;
}

/** 1★…5★ counts in index order. */
function distributionOf(reviews: readonly AppReview[]): number[] {
  const dist = [0, 0, 0, 0, 0];
  for (const r of reviews) dist[r.stars - 1] += 1;
  return dist;
}

/**
 * Histogram percentages that sum to EXACTLY 100.
 *
 * Largest remainder, not per-row rounding: five naive `Math.round` calls on
 * thirds give 33+33+33 = 99 and the bar chart quietly stops being a whole. The
 * floors are handed out first and the leftover points go to the rows with the
 * biggest fractional parts, ties broken by index so the result is stable across
 * polls and does not flicker.
 */
function percentagesOf(distribution: readonly number[]): number[] {
  const total = distribution.reduce((a, b) => a + b, 0);
  if (total <= 0) return distribution.map(() => 0);

  const exact = distribution.map((count) => (count * 100) / total);
  const out = exact.map((v) => Math.floor(v));
  let leftover = 100 - out.reduce((a, b) => a + b, 0);

  const byRemainder = exact
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac || a.i - b.i);

  for (let k = 0; k < byRemainder.length && leftover > 0; k += 1, leftover -= 1) {
    out[byRemainder[k].i] += 1;
  }
  return out;
}

/* ── Motion ────────────────────────────────────────────────────────────────── */

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return reduced;
}

/**
 * The average, counting up to itself.
 *
 * Under `prefers-reduced-motion: reduce` it simply IS the number — a figure
 * that animates is the single thing reduced-motion users most often ask not to
 * see, and nothing here is gated on the count finishing.
 */
function useCountUp(target: number, reduced: boolean, ms = 600): number {
  const [shown, setShown] = useState(target);
  const from = useRef(target);

  useEffect(() => {
    if (reduced) {
      from.current = target;
      setShown(target);
      return;
    }
    const start = from.current;
    if (start === target) return;

    let frame = 0;
    const t0 = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / ms);
      // Ease-out: fast at first, so the number is readable almost immediately.
      const eased = 1 - (1 - p) * (1 - p);
      setShown(Math.round((start + (target - start) * eased) * 10) / 10);
      if (p < 1) {
        frame = requestAnimationFrame(step);
      } else {
        from.current = target;
      }
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, reduced, ms]);

  return shown;
}

/* ── Form bits ─────────────────────────────────────────────────────────────── */

/** The line under the star row. The wording is the reason anyone picks five. */
const STAR_LABELS: Record<number, string> = {
  1: "one star, and you meant it",
  2: "room for improvement",
  3: "perfectly fine, apparently",
  4: "very good, minor notes",
  5: "flawless, ships weekly",
};

/**
 * One capped field with a LIVE counter.
 *
 * The counter is not decoration: it is the only thing standing between a
 * contributor and a paragraph they lose to a 400. `maxLength` stops the typing,
 * the counter explains why.
 */
function Field({
  label,
  value,
  onChange,
  max,
  rows,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  max: number;
  rows?: number;
  placeholder?: string;
}) {
  const near = value.length >= max - 10;
  const style: React.CSSProperties = {
    width: "100%",
    minHeight: rows ? undefined : CONTRIB_TAP,
    padding: "12px 13px",
    borderRadius: 12,
    fontSize: 16, // 16px or the mobile browser zooms the whole page on focus.
    fontFamily: AP.font,
    color: AP.ink,
    background: "#FFFFFF",
    border: `1px solid ${AP.edge}`,
    outline: "none",
  };

  return (
    <label style={{ display: "block" }}>
      <span
        style={{
          display: "flex",
          gap: 8,
          alignItems: "baseline",
          marginBottom: 6,
          fontSize: 12.5,
          fontWeight: 700,
          color: AP.inkSoft,
        }}
      >
        {label}
        <span
          aria-hidden="true"
          style={{
            marginLeft: "auto",
            fontWeight: 500,
            fontSize: 11.5,
            fontVariantNumeric: "tabular-nums",
            color: near ? AP.accent : AP.inkSoft,
          }}
        >
          {value.length}/{max}
        </span>
      </span>
      {rows ? (
        <textarea
          value={value}
          rows={rows}
          maxLength={max}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          style={{ ...style, resize: "vertical", lineHeight: 1.55 }}
        />
      ) : (
        <input
          value={value}
          maxLength={max}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          style={style}
        />
      )}
    </label>
  );
}

/* ── Listing bits ──────────────────────────────────────────────────────────── */

function Avatar({ name }: { name: string }) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: 32,
        height: 32,
        flex: "none",
        borderRadius: "50%",
        background: AP.card,
        border: `1px solid ${AP.edge}`,
        display: "grid",
        placeItems: "center",
        fontSize: 12,
        fontWeight: 700,
        color: AP.inkSoft,
      }}
    >
      {initialsOf(name)}
    </span>
  );
}

function ReviewCard({
  review,
  mine,
  fresh,
}: {
  review: AppReview;
  mine?: boolean;
  fresh?: boolean;
}) {
  return (
    <li
      className={fresh ? "ap-rv ap-rv-in" : "ap-rv"}
      style={{
        listStyle: "none",
        padding: 14,
        borderRadius: 14,
        border: `1px solid ${mine ? AP.accent : AP.edge}`,
        background: mine ? "#FFFFFF" : AP.card,
      }}
    >
      {mine ? (
        <p style={{ margin: "0 0 10px", fontSize: 11.5, fontWeight: 700, letterSpacing: "0.04em", color: AP.accent }}>
          YOURS — WAITING TO BE APPROVED
        </p>
      ) : null}

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Avatar name={review.author} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: AP.ink, overflowWrap: "anywhere" }}>
            {review.author}
          </p>
          <p style={{ margin: "1px 0 0", fontSize: 11.5, color: AP.inkSoft }}>{review.ago}</p>
        </div>
        <StarRating
          rating={review.stars}
          size={13}
          fillColor={STAR_FILL}
          emptyColor={AP.edge}
          label={`${review.stars} out of 5 stars`}
        />
      </div>

      {review.title ? (
        <p style={{ margin: "10px 0 0", fontSize: 14.5, fontWeight: 700, color: AP.ink, overflowWrap: "anywhere" }}>
          {review.title}
        </p>
      ) : null}
      {review.body ? (
        <p style={{ margin: "5px 0 0", fontSize: 14, lineHeight: 1.5, color: AP.ink, overflowWrap: "anywhere" }}>
          {review.body}
        </p>
      ) : null}
    </li>
  );
}

/**
 * The aggregate, exactly as the listing shows it.
 *
 * ZERO PUBLISHED REVIEWS IS "No Ratings Yet" AND NO HISTOGRAM. Never "0.0" — a
 * zero rating is a claim, an absent rating is a fact, and the contributor is
 * looking at a page about a real person.
 */
function Aggregate({ reviews, reduced }: { reviews: readonly AppReview[]; reduced: boolean }) {
  const average = averageOf(reviews);
  const distribution = useMemo(() => distributionOf(reviews), [reviews]);
  const percentages = useMemo(() => percentagesOf(distribution), [distribution]);
  const shown = useCountUp(average, reduced);

  if (reviews.length === 0) {
    return (
      <div style={{ padding: "16px 14px", borderRadius: 14, background: AP.card, border: `1px solid ${AP.edge}` }}>
        <p style={{ margin: 0, fontSize: 19, fontWeight: 700, color: AP.ink }}>No Ratings Yet</p>
        <p style={{ margin: "4px 0 0", fontSize: 13, lineHeight: 1.5, color: AP.inkSoft }}>
          Yours is the first one in. It shows up here the moment it is approved.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: "16px 14px", borderRadius: 14, background: AP.card, border: `1px solid ${AP.edge}` }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 14 }}>
        <div style={{ flex: "none" }}>
          <p
            aria-live="polite"
            style={{
              margin: 0,
              fontSize: 42,
              lineHeight: 1,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              fontVariantNumeric: "tabular-nums",
              color: AP.ink,
            }}
          >
            {shown.toFixed(1)}
          </p>
          <p style={{ margin: "4px 0 0", fontSize: 11.5, color: AP.inkSoft }}>out of 5</p>
        </div>

        <div style={{ flex: 1, minWidth: 0, display: "grid", gap: 4 }}>
          {[5, 4, 3, 2, 1].map((star) => {
            const pct = percentages[star - 1] ?? 0;
            return (
              <div key={star} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span aria-hidden="true" style={{ fontSize: 10.5, color: AP.inkSoft, width: 26, flex: "none" }}>
                  {star}★
                </span>
                <span
                  style={{
                    flex: 1,
                    minWidth: 0,
                    height: 6,
                    borderRadius: 3,
                    background: AP.edge,
                    overflow: "hidden",
                  }}
                >
                  <span
                    className="ap-bar"
                    style={{ display: "block", height: "100%", width: `${pct}%`, background: AP.accent }}
                  />
                </span>
                <span
                  aria-hidden="true"
                  style={{ fontSize: 10.5, color: AP.inkSoft, width: 30, flex: "none", textAlign: "right", fontVariantNumeric: "tabular-nums" }}
                >
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <p style={{ margin: "12px 0 0", display: "flex", alignItems: "center", gap: 8 }}>
        <StarRating rating={average} size={15} fillColor={STAR_FILL} emptyColor={AP.edge} />
        <span style={{ fontSize: 12.5, color: AP.inkSoft }}>
          {reviews.length === 1 ? "1 review" : `${reviews.length} reviews`}
        </span>
      </p>
    </div>
  );
}

/* ── The page ──────────────────────────────────────────────────────────────── */

function ReviewFormPage() {
  const params = useParams<{ token: string }>();
  const search = useSearchParams();
  const reduced = usePrefersReducedMotion();

  const token = typeof params?.token === "string" ? params.token : "";
  const subjectName = (search.get("n") ?? "").trim() || "her";
  const senderName = (search.get("s") ?? "").trim();
  const photo = search.get("ph") ?? "";
  const shareId = (search.get("sid") ?? "").trim();
  const prompt =
    (search.get("p") ?? "").trim() ||
    `${senderName || "Someone"} is collecting reviews of ${subjectName}. One line is plenty.`;

  // ── The four fields, and nothing else ──────────────────────────────────────
  const [stars, setStars] = useState<AppStar | 0>(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [name, setName] = useState("");

  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  /** Claimed synchronously — a second tap must not reach the network at all. */
  const inFlight = useRef(false);
  /**
   * The key for THIS form session. Minted lazily on the first send and reused
   * afterwards, never regenerated per keystroke or per render. Cleared only on
   * a 4xx, where the body itself was the problem and the next attempt really is
   * a different submission; a dropped connection keeps the key so the server
   * collapses the retry onto the row it already wrote.
   */
  const keyRef = useRef<string | null>(null);

  /** Their own review, held locally — it is pending, so no feed will return it. */
  const [mine, setMine] = useState<AppReview | null>(null);

  // ── The live listing ───────────────────────────────────────────────────────
  const [published, setPublished] = useState<AppReview[]>([]);
  const [freshIds, setFreshIds] = useState<readonly string[]>([]);
  const seen = useRef<Set<string>>(new Set());
  const firstLoad = useRef(true);
  const pollInFlight = useRef(false);

  const livePolling = submitted && Boolean(shareId);

  useEffect(() => {
    if (!livePolling) return;

    let alive = true;
    let timer: ReturnType<typeof setInterval> | null = null;
    const controller = new AbortController();

    const tick = async () => {
      if (!alive || pollInFlight.current) return;
      pollInFlight.current = true;
      const res = await fetchPublished(shareId, controller.signal);
      pollInFlight.current = false;
      if (!alive || !res.ok) return;

      const arrived: string[] = [];
      for (const r of res.data) {
        if (seen.current.has(r.id)) continue;
        seen.current.add(r.id);
        // The first load IS the listing, not news. Animating twenty reviews in
        // on open reads as a loading screen.
        if (!firstLoad.current) arrived.push(r.id);
      }
      firstLoad.current = false;
      setPublished(res.data);
      setFreshIds(arrived);
    };

    const stop = () => {
      if (timer === null) return;
      clearInterval(timer);
      timer = null;
    };
    const start = () => {
      if (timer !== null) return;
      timer = setInterval(() => void tick(), POLL_MS);
    };
    // Locking the phone, switching apps, another tab — all the same thing:
    // nobody is looking, so stop asking.
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
  }, [livePolling, shareId]);

  /**
   * This page's own URL, read in an effect rather than during render.
   *
   * `window.location` during render would make the server's HTML and the
   * client's first render disagree, and a hydration mismatch on a page a
   * stranger opened from a link is a blank screen.
   */
  const [pageHref, setPageHref] = useState("");
  useEffect(() => {
    setPageHref(window.location.href);
  }, []);

  const nudgeHref = useMemo(
    () =>
      pageHref
        ? whatsappNudgeUrl(
            `I just left a review for ${subjectName}. Leave one too — it takes a minute:`,
            pageHref
          )
        : "",
    [pageHref, subjectName]
  );

  const canSend = stars > 0 && body.trim().length > 0 && name.trim().length > 0 && !sending;

  const send = useCallback(async () => {
    if (inFlight.current || submitted) return;
    if (!token) {
      setError("This link is missing its token — ask whoever sent it for a new one.");
      return;
    }
    if (stars < 1) {
      setError("Pick a number of stars first.");
      return;
    }
    if (!body.trim() || !name.trim()) {
      setError("A line or two and your name, and you're done.");
      return;
    }

    inFlight.current = true;
    setSending(true);
    setError("");

    const key = keyRef.current ?? newIdempotencyKey();
    keyRef.current = key;

    const draft: ReviewDraft = { stars: stars as AppStar, title, body, name };
    const res = await sendReview(token, draft, key);

    inFlight.current = false;
    setSending(false);

    if (!res.ok) {
      if (res.status >= 400 && res.status < 500) keyRef.current = null;
      setError(messageFor(res.status, res.error));
      return;
    }

    // The key is deliberately NOT cleared here: if anything at all replays this
    // submission it must collapse onto the row that already exists.
    setMine({
      id: `mine-${key}`,
      author: name.trim() || "You",
      stars: stars as AppStar,
      title: title.trim(),
      body: body.trim(),
      ago: "just now",
      status: "pending",
    });
    setSubmitted(true);
  }, [token, stars, title, body, name, submitted]);

  const shown = stars > 0 ? stars : 0;

  return (
    <div style={{ minHeight: "100dvh", background: "#FFFFFF", fontFamily: AP.font, color: AP.ink }}>
      {/* The listing's own chrome, so the friend knows where they are. */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          minHeight: 52,
          padding: "0 16px",
          borderBottom: `1px solid ${AP.edge}`,
          background: AP.card,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false" style={{ flex: "none" }}>
          <rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke={AP.accent} strokeWidth="1.7" />
          <path d="M8.6 15.2 12 8.4l3.4 6.8" fill="none" stroke={AP.accent} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em" }}>
          {senderName ? `${senderName}'s listing` : "The listing"}
        </span>
        <span style={{ marginLeft: "auto", fontSize: 12.5, color: AP.inkSoft }}>Ratings &amp; Reviews</span>
      </header>

      <ContributorShell
        subjectName={subjectName}
        subjectPhotoUrl={photo || undefined}
        eyebrow={senderName ? `${senderName} asked` : "Someone asked"}
        prompt={prompt}
        submitted={submitted}
        successTitle="That's in. Thank you."
        successBody={`${senderName || "They"} sees it before anyone else, and it joins the rating the moment it is approved.`}
        shareLink={pageHref || undefined}
        shareMessage={`I just left a review for ${subjectName}. Leave one too:`}
        shareLabel="Send this on WhatsApp"
        ctaHref="/templates"
        ctaLabel="Make one for someone"
        theme={{
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
          font: AP.font,
          serif: AP.font,
        }}
        footer={
          submitted ? (
            <>
              No account, no email, nothing kept.{" "}
              <Link href="/templates" style={{ color: AP.accent }}>
                Make one of these
              </Link>{" "}
              for somebody you like.
            </>
          ) : (
            <>
              No account, no email. Four fields and you&apos;re done.{" "}
              {nudgeHref ? (
                <a
                  href={nudgeHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: AP.accent, display: "inline-block", minHeight: 22 }}
                >
                  Pass the link on
                </a>
              ) : null}
            </>
          )
        }
      >
        <div style={{ display: "grid", gap: 18 }}>
          {/* 1 · Stars — five 44px targets, straight from the shared widget. */}
          <div>
            <span style={{ display: "block", marginBottom: 2, fontSize: 12.5, fontWeight: 700, color: AP.inkSoft }}>
              How many stars?
            </span>
            <StarRating
              rating={shown}
              size={32}
              interactive
              onRate={(n: StarValue) => setStars(n as AppStar)}
              fillColor={STAR_FILL}
              emptyColor={AP.edge}
              label={`Rate ${subjectName} out of 5`}
            />
            <p
              aria-live="polite"
              style={{ margin: "2px 0 0", fontSize: 13.5, color: shown > 0 ? AP.ink : AP.inkSoft }}
            >
              {shown > 0 ? `${shown}.0 — ${STAR_LABELS[shown]}` : "Tap a star"}
            </p>
          </div>

          {/* 2 · Title */}
          <Field
            label="Add a title"
            value={title}
            onChange={setTitle}
            max={APP_REVIEW_LIMITS.title}
            placeholder="What's the one line?"
          />

          {/* 3 · The review */}
          <Field
            label="Write your review"
            value={body}
            onChange={setBody}
            max={APP_REVIEW_LIMITS.body}
            rows={4}
            placeholder={`Something only somebody who knows ${subjectName} would say.`}
          />

          {/* 4 · Their name */}
          <Field
            label="Your name"
            value={name}
            onChange={setName}
            max={APP_REVIEW_LIMITS.author}
            placeholder="So they know who it's from"
          />

          {error ? (
            <p aria-live="polite" style={{ margin: 0, fontSize: 13, color: "#C0322B", overflowWrap: "anywhere" }}>
              {error}
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => void send()}
            disabled={!canSend}
            style={{
              width: "100%",
              minHeight: CONTRIB_TAP + 4,
              padding: "0 18px",
              borderRadius: 14,
              border: `1px solid ${AP.accent}`,
              background: AP.accent,
              color: "#FFFFFF",
              fontFamily: AP.font,
              fontSize: 15.5,
              fontWeight: 700,
              cursor: canSend ? "pointer" : "default",
              opacity: canSend ? 1 : 0.5,
              touchAction: "manipulation",
            }}
          >
            {sending ? "Sending…" : "Submit your review"}
          </button>

          <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: AP.inkSoft }}>
            {senderName || "They"} reads it first. Nothing appears on the listing until it is approved.
          </p>
        </div>
      </ContributorShell>

      {/* ── After submit: the listing, with theirs at the top ─────────────── */}
      {submitted ? (
        <section
          style={{
            width: "100%",
            maxWidth: 520,
            margin: "0 auto",
            padding: "0 18px 44px",
            display: "grid",
            gap: 14,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, letterSpacing: "-0.01em" }}>
            Ratings &amp; Reviews
          </h2>

          <Aggregate reviews={published} reduced={reduced} />

          <ul style={{ display: "grid", gap: 10, margin: 0, padding: 0 }}>
            {mine ? <ReviewCard review={mine} mine /> : null}
            {published.map((r) => (
              <ReviewCard key={r.id} review={r} fresh={freshIds.includes(r.id)} />
            ))}
          </ul>

          {shareId ? null : (
            <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: AP.inkSoft }}>
              The full listing lives on {subjectName === "her" ? "her" : `${subjectName}'s`} own link — this one only
              takes reviews.
            </p>
          )}
        </section>
      ) : null}

      <style>{`
        .ap-bar { transition: width 520ms cubic-bezier(0.22, 0.61, 0.36, 1); }
        .ap-rv-in { animation: ap-rv-rise 260ms ease-out both; }
        @keyframes ap-rv-rise {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ap-bar { transition: none; }
          .ap-rv-in { animation: none; }
        }
      `}</style>
    </div>
  );
}

export default function AppReviewPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", background: "#FFFFFF" }} />}>
      <ReviewFormPage />
    </Suspense>
  );
}
