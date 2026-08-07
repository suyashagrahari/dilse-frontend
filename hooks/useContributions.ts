// ─── useContributions — the live list on a published page ────────────────────
//
// A page is out in the world and people are writing into it. This hook is what
// makes the recipient's screen show that as it happens: it polls the public
// feed, it submits, and it does both without ever leaving a timer running
// behind it.
//
// ── THE INTERVAL IS THE WHOLE JOB ────────────────────────────────────────────
//
// There are exactly three states a poll can be in and all three are handled
// here, because a forgotten `setInterval` is not a style problem — it is a
// phone waking its radio every five seconds inside a backgrounded tab for as
// long as the tab exists:
//
//   1. VISIBLE      → tick every `pollMs`.
//   2. HIDDEN       → stop. `visibilitychange` fires the moment the tab is
//                     backgrounded or the phone is locked, and the interval is
//                     cleared right there rather than being left to spin
//                     against a throttled clock.
//   3. UNMOUNTED    → stop, unsubscribe, abort the request in flight.
//
// Coming back from hidden ticks IMMEDIATELY and then restarts the interval,
// because the first thing someone does on returning is look at the list, and
// waiting five seconds for it to catch up reads as staleness.
//
// ── REACT 19 RULES ───────────────────────────────────────────────────────────
//
// Lint enforces them here. No state is set during render, no ref is read during
// render, and every effect returns a cleanup. The refs below are written from
// effects and callbacks only.

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchContributions,
  fetchModerationQueue,
  newIdempotencyKey,
  postContribution,
} from "@/lib/contrib/api";
import type {
  Contribution,
  ContributionDraft,
  ContributionKind,
  ContributionSummary,
} from "@/lib/contrib/types";

/** How often a visible page asks for new arrivals. */
const DEFAULT_POLL_MS = 5_000;

/**
 * Turn a failed submit into something a person can act on.
 *
 * The contributor is a stranger doing someone a favour. Every one of these has
 * to end with a way forward, because the alternative is that they shrug and
 * close the tab, and the sender never finds out anybody tried.
 */
function messageFor(status: number, serverError: string): string {
  switch (status) {
    case 0:
      return "Couldn't reach the server — check your connection and try again.";
    case 400:
    case 422:
      return "That didn't go through — check the fields and try again.";
    case 403:
      return "This page isn't taking additions right now.";
    case 404:
      return "This page has gone — the link may have expired.";
    case 409:
      // The idempotency key matched an earlier attempt. It is already saved.
      return "That's already in — you're all set.";
    case 429:
      return "That's a lot at once — give it a minute and try again.";
    default:
      return serverError || "Something went wrong — try that again in a moment.";
  }
}

export interface UseContributionsOptions {
  /** The published page's share id. Nothing runs without one. */
  shareId: string;
  kind: ContributionKind;
  /** False keeps the hook completely inert — no fetch, no timer, no listener. */
  enabled?: boolean;
  /**
   * `"public"` is the visitor's view: approved items only, no auth.
   * `"owner"` is the sender's: every status, needs `token`. Same polling rules.
   */
  scope?: "public" | "owner";
  /** Required by `scope: "owner"`, ignored otherwise. */
  token?: string | null;
  /** Override the 5s cadence. Mostly for tests. */
  pollMs?: number;
}

export type SubmitResult =
  | { ok: true; contribution: Contribution }
  | { ok: false; error: string };

export interface UseContributionsResult {
  items: Contribution[];
  summary: ContributionSummary | null;
  /** True only for the first load. A poll refreshing underneath is not "loading". */
  loading: boolean;
  /** Only ever set when there is nothing on screen to look at. See the note below. */
  error: string | null;
  submitting: boolean;
  submit: (draft: ContributionDraft) => Promise<SubmitResult>;
  /** Fetch now, outside the interval. Safe to call from a pull-to-refresh. */
  refresh: () => void;
}

export function useContributions(opts: UseContributionsOptions): UseContributionsResult {
  const { shareId, kind, enabled = true, scope = "public", token, pollMs = DEFAULT_POLL_MS } = opts;

  const [items, setItems] = useState<Contribution[]>([]);
  const [summary, setSummary] = useState<ContributionSummary | null>(null);
  const [loading, setLoading] = useState(enabled && Boolean(shareId));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  /**
   * True once any fetch has come back with a list.
   *
   * Drives the error policy: a poll that fails while there are already ten
   * items on screen must not replace them with an error. The page is still
   * true, it is just a few seconds behind, and nobody needs to be told that.
   * The message only appears when the alternative is an empty page.
   */
  const everLoaded = useRef(false);

  /**
   * One request at a time. `loading` is for the UI and only takes effect on the
   * next render, which is too late to stop the interval firing on top of a slow
   * response. Claimed synchronously here. Never read during render.
   */
  const inFlight = useRef(false);

  /** One submit at a time, for the same reason — a double tap is a double row. */
  const submitInFlight = useRef(false);

  /**
   * The key for the submission currently being attempted.
   *
   * Kept across a NETWORK failure so pressing the button again re-sends the
   * same key: the first attempt may well have been written before the
   * connection dropped, and the server collapses the retry onto it. Cleared on
   * success and on a 4xx, where the body itself is the problem and the next
   * attempt is a genuinely different submission.
   */
  const retryKey = useRef<string | null>(null);

  /** Written after every commit, read only from callbacks. See `useStoryFill`. */
  const live = useRef({ shareId, kind, scope, token });
  useEffect(() => {
    live.current = { shareId, kind, scope, token };
  });

  /**
   * One fetch, whichever scope. Stable across renders so the polling effect
   * does not tear down and rebuild its interval on every parent render — an
   * interval that restarts on each render never actually fires.
   */
  const load = useCallback(
    async (signal?: AbortSignal): Promise<boolean> => {
      if (!shareId) return false;

      const res =
        scope === "owner" && token
          ? await fetchModerationQueue(shareId, kind, token, signal)
          : await fetchContributions(shareId, kind, signal);

      if (!res.ok) return false;

      setItems(res.data.items);
      setSummary(res.data.summary);
      setError(null);
      return true;
    },
    [shareId, kind, scope, token]
  );

  // ── Poll ───────────────────────────────────────────────────────────────────
  //
  // Everything the effect creates is closed over by its own cleanup: the alive
  // flag, the timer handle, the listener and the abort controller. Nothing
  // survives it.
  useEffect(() => {
    if (!enabled || !shareId) return;

    let alive = true;
    let timer: ReturnType<typeof setInterval> | null = null;
    const controller = new AbortController();

    const tick = async () => {
      if (!alive || inFlight.current) return;
      inFlight.current = true;

      const ok = await load(controller.signal);

      inFlight.current = false;
      if (!alive) return;

      if (ok) {
        everLoaded.current = true;
      } else if (!everLoaded.current) {
        setError("Couldn't load what people have added — pull down to try again.");
      }
      setLoading(false);
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

    // Locking the phone, switching apps, moving to another tab — all of them
    // land here, and all of them mean the same thing: nobody is looking, so
    // stop asking.
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        stop();
        return;
      }
      void tick();
      start();
    };

    void tick();
    // A page opened in a background tab starts hidden; it must not begin
    // polling until somebody actually looks at it.
    if (document.visibilityState === "visible") start();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      alive = false;
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
      controller.abort();
    };
  }, [enabled, shareId, pollMs, load]);

  const refresh = useCallback(() => {
    if (inFlight.current) return;
    inFlight.current = true;
    void load().then((ok) => {
      inFlight.current = false;
      if (ok) everLoaded.current = true;
      setLoading(false);
    });
  }, [load]);

  /**
   * Send one contribution.
   *
   * Resolves rather than throws, always — the caller is a form's `onSubmit` and
   * an unhandled rejection there is a page that silently does nothing.
   *
   * A successful submission is prepended to the list ONLY IF the server
   * approved it on the spot. Everything else is pending moderation and does not
   * belong in the public list; the form's success state is what tells the
   * contributor it landed, and `status` on the returned row is what lets it say
   * "it's with them now" rather than pretending the words are already up.
   */
  const submit = useCallback(
    async (draft: ContributionDraft): Promise<SubmitResult> => {
      const { shareId: id, kind: k, token: tok } = live.current;

      if (!id) return { ok: false, error: "This page can't take additions." };
      if (submitInFlight.current) return { ok: false, error: "Just a second — that's sending." };
      if (!draft.author.trim() || !draft.body.trim()) {
        return { ok: false, error: "A name and a line or two, and you're done." };
      }

      submitInFlight.current = true;
      setSubmitting(true);

      const key = retryKey.current ?? newIdempotencyKey();
      retryKey.current = key;

      const res = await postContribution(id, k, draft, key, tok);

      submitInFlight.current = false;
      setSubmitting(false);

      if (!res.ok) {
        // Anything the server actually judged is a new submission next time.
        // A dropped connection is not — that one gets the same key again.
        if (res.status >= 400 && res.status < 500) retryKey.current = null;
        return { ok: false, error: messageFor(res.status, res.error) };
      }

      retryKey.current = null;

      if (res.data.status === "approved") {
        // Deduped by id so the poll that lands a moment later — carrying the
        // same row from the server — does not print it twice.
        setItems((prev) => [res.data, ...prev.filter((c) => c.id !== res.data.id)]);
      }

      return { ok: true, contribution: res.data };
    },
    []
  );

  return { items, summary, loading, error, submitting, submit, refresh };
}

export default useContributions;
