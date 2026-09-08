// ─── Toast bus ───────────────────────────────────────────────────────────────
//
// The one toast store for the whole app, the same shape as `lib/share/shareBus`,
// `lib/feedback/feedbackBus` and `lib/paywall/paywallBus`.
//
// ── WHAT THIS REPLACED, AND WHY IT HAD TO ───────────────────────────────────
//
// Forty templates each carried their OWN toast: ten as a `ToastStack.tsx`, thirty
// defined inline in `page.tsx`, plus forty-five separate copies of the state
// (`toasts`, `toastIdRef`, `pushToast`, `dismissToast`) and forty-five
// `<ToastStack toasts={…} onDismiss={…} />` wirings. Every copy was a near-clone
// of the others, in four different markup styles.
//
// The cost was not theoretical. Removing the share link from "the toast" meant
// editing forty toasts, and 97 of the 116 files in that change existed only
// because of the duplication. Two of them — `watch` and `call` — used bespoke
// markup that two separate sweeps missed, and were only caught by a leak scan
// afterwards. Duplicated UI does not stay identical; it only starts that way,
// and the drift is invisible until someone has to change all of it at once.
//
// The same three copies of the delay logic proved the point: 23 templates
// dismissed a "Published!" toast after 1000ms, three after 1200ms, three after
// 1400ms, and three after 6–8 seconds. Nobody chose that spread.
//
// ── WHY A BUS RATHER THAN A SHARED COMPONENT + LOCAL STATE ──────────────────
//
// A shared `<ToastStack>` would have removed the forty components but kept the
// forty-five copies of state and the forty-five page wirings — and the wiring is
// the half with a silent failure mode: forget the JSX in one page and that
// template's toasts simply never appear. With a bus there is nothing left to
// wire. `ToastHost` is mounted once per route group and `pushToast` is an
// import.
//
// ── WHY THE DURATION LIVES HERE ─────────────────────────────────────────────
//
// A "Published!" toast used to be covered a second later by the share sheet
// opening on its own, so a 1000ms dismissal was invisible and harmless. The
// sheet no longer opens by itself — the toast IS the confirmation that the page
// went live, and it is what points at the Share button — so the timing matters
// now in a way it did not before. It is three seconds for every kind, in one
// place, and hovering pauses it for anyone who reads slowly.

import { useSyncExternalStore } from "react";

export type ToastType = "success" | "info" | "publish" | "error";

export interface ToastInput {
  /** Defaults to "info". */
  type?: ToastType;
  /** The one line everybody reads. Required. */
  title: string;
  /** The optional second line. */
  message?: string;
  /**
   * The template's own accent, so a toast wears the palette of the page it
   * belongs to rather than a house colour that belongs to no template. Falls
   * back to a per-type colour.
   */
  accent?: string;
  /** Override the per-type default. Pass 0 to require a manual dismiss. */
  duration?: number;
}

export interface Toast extends ToastInput {
  id: number;
  type: ToastType;
}

/** Every toast hides itself after this long, unless the caller overrides it. */
export const TOAST_DEFAULT_DURATION = 3000;

/**
 * How long each kind stays, in ms.
 *
 * One value, on purpose. The forty copies this replaced had drifted to six
 * different numbers for the same event — 23 templates dismissed "Published!"
 * after 1000ms, three after 1200, three after 1400, three after 6–8 seconds —
 * and nobody had chosen that spread. A single number is the only version that
 * stays true after the next template ships.
 *
 * Three seconds is long enough to read one line and a half, and short enough
 * that nobody waits for it. Anything that genuinely needs longer should say so
 * at the call site with `duration`, where the reason is visible, rather than
 * quietly here.
 *
 * Kept as a per-type map rather than a bare constant because the shape is the
 * seam: if one kind ever does need its own timing, this is the line that
 * changes, not forty call sites.
 */
export const TOAST_DURATION: Record<ToastType, number> = {
  publish: TOAST_DEFAULT_DURATION,
  error: TOAST_DEFAULT_DURATION,
  info: TOAST_DEFAULT_DURATION,
  success: TOAST_DEFAULT_DURATION,
};

/**
 * Most toasts on screen at once.
 *
 * Beyond three the stack is taller than a phone's usable top half and the
 * oldest is unreadable anyway. The OLDEST is dropped rather than the newest,
 * because the newest is the one that just described what the person did.
 */
export const MAX_VISIBLE = 3;

let toasts: Toast[] = [];
let nextId = 0;
const listeners = new Set<() => void>();
/** Live dismissal timers, so a manual dismiss can cancel its own. */
const timers = new Map<number, ReturnType<typeof setTimeout>>();

function emit(): void {
  for (const listen of listeners) listen();
}

function clearTimer(id: number): void {
  const timer = timers.get(id);
  if (timer !== undefined) {
    clearTimeout(timer);
    timers.delete(id);
  }
}

/**
 * Show a toast. Returns its id, so a caller can dismiss it early.
 *
 * Safe to call during SSR (it is a no-op) and from anywhere — a hook, an event
 * handler, a promise rejection — because it touches no React state directly.
 */
export function pushToast(input: ToastInput): number {
  const id = ++nextId;
  if (typeof window === "undefined") return id;

  const type: ToastType = input.type ?? "info";
  const toast: Toast = { ...input, type, id };

  toasts = [...toasts, toast];
  // Drop the oldest rather than refusing the newest.
  while (toasts.length > MAX_VISIBLE) {
    const dropped = toasts[0];
    toasts = toasts.slice(1);
    clearTimer(dropped.id);
  }
  emit();

  const duration = input.duration ?? TOAST_DURATION[type];
  if (duration > 0) {
    timers.set(
      id,
      setTimeout(() => {
        timers.delete(id);
        dismissToast(id);
      }, duration)
    );
  }
  return id;
}

/** Remove one toast. Idempotent — dismissing twice is not an error. */
export function dismissToast(id: number): void {
  clearTimer(id);
  const next = toasts.filter((t) => t.id !== id);
  if (next.length === toasts.length) return;
  toasts = next;
  emit();
}

/**
 * Remove everything.
 *
 * Used when a route changes: a toast about the page you just left is noise at
 * best and a lie at worst ("Published!" over somebody else's template).
 */
export function clearToasts(): void {
  if (toasts.length === 0) return;
  for (const t of toasts) clearTimer(t.id);
  toasts = [];
  emit();
}

/** Pause a toast's dismissal — used while the pointer is over the stack. */
export function holdToast(id: number): void {
  clearTimer(id);
}

/**
 * Restart a paused toast's dismissal.
 *
 * Deliberately restarts the full duration rather than resuming the remainder:
 * somebody who has just moved the pointer away has not necessarily read it, and
 * the cheap, predictable behaviour is easier to reason about than a stopwatch.
 */
export function releaseToast(id: number): void {
  if (!toasts.some((t) => t.id === id)) return;
  if (timers.has(id)) return;
  const toast = toasts.find((t) => t.id === id);
  const duration = toast?.duration ?? TOAST_DURATION[toast?.type ?? "info"];
  if (duration <= 0) return;
  timers.set(
    id,
    setTimeout(() => {
      timers.delete(id);
      dismissToast(id);
    }, duration)
  );
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * The current stack, as a plain read.
 *
 * `useToasts` is the React way in; this is the same value without a hook, which
 * is what the tests assert against and what any non-React caller would need.
 * Returned as-is rather than copied: the array is replaced on every change and
 * never mutated in place, so handing it out cannot corrupt the store.
 */
export function getToasts(): readonly Toast[] {
  return toasts;
}

const getSnapshot = () => toasts;
const EMPTY: Toast[] = [];
const getServerSnapshot = () => EMPTY;

/** The visible toasts. Re-renders only when the list changes. */
export function useToasts(): Toast[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
