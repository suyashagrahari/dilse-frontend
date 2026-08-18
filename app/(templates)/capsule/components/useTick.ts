"use client";

// ─── Capsule — time hooks ────────────────────────────────────────────────────
//
// The waiting screen's countdown is the only continuous thing in this template,
// and it is the one people will leave open. It is driven by
// `useSyncExternalStore` over a SINGLE shared 1-second interval:
//
//   * `setInterval` + `setState` in an effect trips `react-hooks/set-state-in-effect`,
//   * and one interval per mounted countdown is one interval too many.
//
// Nothing here decides whether a capsule may open. That is `isOpenable`, and
// ultimately the server — these hooks only draw the clock.

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { countdownTo, type Countdown } from "./types";

// ═══════════════════════════════════════════════════════════════════════════
// A shared, once-a-second clock
// ═══════════════════════════════════════════════════════════════════════════

const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;
let snapshot = 0;

function emit() {
  snapshot = Date.now();
  for (const l of listeners) l();
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  if (timer === null) {
    snapshot = Date.now();
    timer = setInterval(emit, 1000);
  }
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0 && timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  };
}

/** Cached: `useSyncExternalStore` requires the same value until it changes. */
const getSnapshot = (): number => snapshot;

/**
 * Zero on the server. `useSyncExternalStore` re-renders with the real value
 * after hydration, which is precisely what it exists for — no mismatch warning,
 * and no `mounted` state variable set from an effect.
 */
const getServerSnapshot = (): number => 0;

/** Milliseconds, ticking once a second. `0` until hydrated. */
export function useNow(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * A live countdown to `opensOn`. Clamped at zero by `countdownTo`, so an
 * overdue capsule reads `0 days · 00:00:00` and never negative time.
 *
 * `ready` is false during SSR and the first hydration pass; render the date
 * rather than a wrong clock in that window.
 */
export function useCountdown(opensOn: string): Countdown & { ready: boolean } {
  const now = useNow();
  if (now === 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: false, ready: false };
  return { ...countdownTo(opensOn, now), ready: true };
}

/** "247 days · 04:22:11" */
export function fmtCountdown(c: Countdown): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const d = `${c.days} day${c.days === 1 ? "" : "s"}`;
  return `${d} · ${pad(c.hours)}:${pad(c.minutes)}:${pad(c.seconds)}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// One-shot ceremony steps
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Wait `ms`, then fire — restarting whenever `key` changes, and PAUSING while
 * the tab is hidden.
 *
 * The pause is not a nicety. Background a tab mid-crack and the browser throttles
 * timers to once a minute; without this, someone who checked a message during
 * the 1.2s crack comes back to a capsule that has already unfurled, jumped past
 * the context screen, and landed on card three. The sequence waits for them.
 *
 * Pass `key: null` to disarm.
 */
export function useStepTimer(key: string | null, ms: number, onDone: () => void): void {
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    if (key === null) return;
    if (typeof document === "undefined") return;

    let remaining = ms;
    let startedAt = 0;
    let handle: ReturnType<typeof setTimeout> | null = null;

    const start = () => {
      startedAt = Date.now();
      handle = setTimeout(() => {
        handle = null;
        onDoneRef.current();
      }, remaining);
    };
    const pause = () => {
      if (handle === null) return;
      clearTimeout(handle);
      handle = null;
      remaining = Math.max(0, remaining - (Date.now() - startedAt));
    };
    const onVisibility = () => {
      if (document.hidden) pause();
      else if (handle === null) start();
    };

    if (!document.hidden) start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      if (handle !== null) clearTimeout(handle);
    };
  }, [key, ms]);
}

/**
 * A poll that stops when `active` goes false. Used for partner presence and for
 * re-asking the server whether the capsule has become openable — the client is
 * never allowed to make that call from its own clock.
 */
export function usePoll(active: boolean, ms: number, tick: () => void): void {
  const tickRef = useRef(tick);
  useEffect(() => {
    tickRef.current = tick;
  }, [tick]);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => tickRef.current(), ms);
    return () => clearInterval(id);
  }, [active, ms]);
}

/** A monotonic elapsed-ms reading since `since`, ticking once a second. */
export function useElapsed(since: number | null): number {
  const now = useNow();
  if (since === null || now === 0) return 0;
  return Math.max(0, now - since);
}

/** Stable "run this once" callback factory, for one-shot audio and jolts. */
export function useOnce(): (fn: () => void) => void {
  const doneRef = useRef(false);
  return useCallback((fn: () => void) => {
    if (doneRef.current) return;
    doneRef.current = true;
    fn();
  }, []);
}
