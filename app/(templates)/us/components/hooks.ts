"use client";

// ─── Us — the shared hooks ───────────────────────────────────────────────────
//
// Three React 19 rules shape every hook in this template, and there are no
// suppressions anywhere:
//
//   • `react-hooks/set-state-in-effect` — an effect may not call a setter. Both
//     of the flags below are therefore `useSyncExternalStore` subscriptions,
//     not "read it in an effect and mirror it into state".
//   • `react-hooks/refs` — a ref is never read or written during render. The
//     hooks here hand back *attach callbacks*, never a RefObject.
//   • `react-hooks/immutability` — nothing is mutated in place.

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

/* ── Mount flag ──────────────────────────────────────────────────────────── */

const neverChanges = (): (() => void) => () => {};

/**
 * False on the server and for the hydration pass, true afterwards. A
 * `useSyncExternalStore` with a subscription that never fires is the sanctioned
 * way to express "this value differs between server and client" — it costs one
 * extra render and cannot trip the set-state-in-effect rule.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    neverChanges,
    () => true,
    () => false,
  );
}

/* ── prefers-reduced-motion ──────────────────────────────────────────────── */

const REDUCED = "(prefers-reduced-motion: reduce)";

function subscribeReduced(onChange: () => void): () => void {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return () => {};
  const mql = window.matchMedia(REDUCED);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

const readReduced = (): boolean =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia(REDUCED).matches;

/**
 * Live, not sampled once. Someone who flips the OS setting mid-session gets the
 * still version immediately, which is the whole point of the preference.
 *
 * Written here rather than imported so this template owns its own motion policy
 * and does not inherit an animation library's interpretation of it.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribeReduced, readReduced, () => false);
}

/* ── Overlay history ─────────────────────────────────────────────────────── */

/**
 * Wires an overlay (post detail, story viewer) into the browser's back stack.
 *
 * Opening pushes one entry. Closing — from the in-app back chevron, the OS back
 * gesture, or the hardware button — is *always* a `history.back()`, so there is
 * exactly one close path and the stack never drifts. Callers use the returned
 * `requestClose`; they never call the setter directly.
 *
 * `onClose` is held in a ref that is only ever written from an effect, so a new
 * closure identity on the caller's side cannot re-run the push and strand a
 * second entry in the stack.
 */
export function useOverlayHistory(open: boolean, onClose: () => void): () => void {
  const latest = useRef(onClose);

  useEffect(() => {
    latest.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open || typeof window === "undefined") return;
    window.history.pushState({ usOverlay: true }, "");
    const onPop = () => latest.current();
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [open]);

  return useCallback(() => {
    if (typeof window === "undefined") return;
    window.history.back();
  }, []);
}

/* ── Scroll memory ───────────────────────────────────────────────────────── */

/**
 * Remembers where the grid was and puts it back.
 *
 * The overlays are `position: fixed` and the profile underneath is never
 * unmounted, so in practice the scroll offset survives on its own. This exists
 * because "in practice" is not good enough for the one interaction people
 * repeat forty times in a row: open a photo, go back, open the next one. A
 * single browser that collapses the offset while a fixed overlay is up would
 * throw the reader back to the top of the profile every time.
 */
export function useScrollMemory(): { remember: () => void; restore: () => void } {
  const savedY = useRef(0);

  const remember = useCallback(() => {
    if (typeof window === "undefined") return;
    savedY.current = window.scrollY;
  }, []);

  const restore = useCallback(() => {
    if (typeof window === "undefined") return;
    const y = savedY.current;
    // After the overlay unmounts, in the same frame the document regains its
    // full height. Restoring before that lands short on a long grid.
    window.requestAnimationFrame(() => window.scrollTo(0, y));
  }, []);

  return { remember, restore };
}

/* ── Transient flags ─────────────────────────────────────────────────────── */

/**
 * A boolean that raises on `fire()` and lowers itself `ms` later — the heart
 * bounce, the big double-tap heart, the toast.
 *
 * Deliberately a tiny store rather than `useState` + a timeout ref. Reading
 * `ref.current` from an effect cleanup is exactly the pattern the hooks lint
 * warns about (the value has usually changed by then), and the alternative —
 * suppressing it — is not on the table. A store owns its own timer, disposes
 * itself once, and never touches a ref at all.
 */
class Pulse {
  private on = false;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private readonly listeners = new Set<() => void>();

  readonly subscribe = (cb: () => void): (() => void) => {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  };

  readonly getSnapshot = (): boolean => this.on;

  readonly fire = (ms: number): void => {
    if (this.timer !== null) clearTimeout(this.timer);
    this.set(true);
    this.timer = setTimeout(() => {
      this.timer = null;
      this.set(false);
    }, ms);
  };

  readonly clear = (): void => {
    if (this.timer !== null) clearTimeout(this.timer);
    this.timer = null;
    this.set(false);
  };

  readonly dispose = (): void => {
    if (this.timer !== null) clearTimeout(this.timer);
    this.timer = null;
    this.listeners.clear();
  };

  private set(next: boolean): void {
    if (this.on === next) return;
    this.on = next;
    for (const cb of this.listeners) cb();
  }
}

const alwaysFalse = (): boolean => false;

export function useTransient(ms: number): [boolean, () => void] {
  const [pulse] = useState(() => new Pulse());
  const on = useSyncExternalStore(pulse.subscribe, pulse.getSnapshot, alwaysFalse);

  useEffect(() => () => pulse.dispose(), [pulse]);

  const fire = useCallback(() => pulse.fire(ms), [pulse, ms]);
  return [on, fire];
}

/* ── Media query ─────────────────────────────────────────────────────────── */

/** Live `matchMedia`. False on the server — overlays only open after a tap, so no mismatch. */
export function useMedia(query: string): boolean {
  const subscribe = useCallback(
    (cb: () => void) => {
      if (typeof window === "undefined" || !window.matchMedia) return () => {};
      const m = window.matchMedia(query);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => typeof window !== "undefined" && !!window.matchMedia && window.matchMedia(query).matches,
    () => false,
  );
}

/** Locks the page behind an overlay without losing the scroll position. */
export function useBodyLock(on: boolean): void {
  useEffect(() => {
    if (!on || typeof document === "undefined") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [on]);
}
