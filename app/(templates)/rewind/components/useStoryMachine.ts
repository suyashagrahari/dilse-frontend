"use client";

// ─── Rewind — the story machine ──────────────────────────────────────────────
//
// One hook owns everything time-shaped about the deck: which slide is up, how
// full the active progress segment is, and every way a finger can change that.
//
// Three decisions that the rest of the shell depends on:
//
// 1. ONE CLOCK. The progress fill and the auto-advance are the same measurement,
//    read off `performance.now()` inside a single rAF loop. A `setInterval` that
//    ticks a counter drifts away from a `setTimeout` that fires the advance, and
//    the bar visibly finishes early or late. Here the bar reaching 1 and the
//    slide changing are the same event by construction.
//
// 2. TIME IS BANKED, NOT RESTARTED. Pausing subtracts the elapsed run from
//    `remainingRef` and drops the start stamp. Resuming just re-stamps. A hold
//    of any length gives back exactly the time that was left, so pressing to
//    screenshot the archetype never costs you the slide.
//
// 3. THE INPUT LOCK IS A REF, NOT STATE. It is read and written synchronously
//    inside the pointer handler, so twenty taps inside one React batch still see
//    the timestamp written by the first one.

import React from "react";
import { SLIDE } from "./types";
import type { SlideDef } from "./slideTypes";

/** Pointer must stay down this long before it counts as a hold rather than a tap. */
const HOLD_MS = 200;
/** Past this much travel a pointer-up is a drag, not a tap. */
const TAP_SLOP_PX = 16;
/** Swipe-down-to-exit. Generous on dy, strict on dx, so a scroll-ish flick exits. */
const SWIPE_DY = 70;
const SWIPE_DX_MAX = 60;
/** Progress is quantised before it hits state — 3px of bar cannot show more. */
const PROGRESS_STEPS = 240;

export interface StoryMachine {
  index: number;
  /** Increments on every index change. Use as a React key to restart entrances. */
  visit: number;
  /** 0..1 fill of the active progress segment. */
  progress: number;
  /** Press-and-hold is down: timer paused, chrome hidden. */
  held: boolean;
  /** True when the timer is not running for any reason. */
  paused: boolean;
  /** Swiped down / ran off the end -> the share card. */
  exited: boolean;
  goNext: () => void;
  goPrev: () => void;
  goTo: (i: number) => void;
  exit: () => void;
  restart: () => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function useStoryMachine(opts: {
  slides: SlideDef[];
  reduced: boolean;
  onAdvance?: (from: number, to: number) => void;
  onSlideEnter?: (def: SlideDef, index: number) => void;
  onExit?: () => void;
}): StoryMachine {
  const { slides, reduced } = opts;

  // Reduced motion changes nothing here on purpose. It strips decoration from
  // the slides; it must never strip the sequence itself, or the story cannot be
  // completed by the people most likely to have the setting on.
  void reduced;

  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const [index, setIndex] = React.useState(0);
  const [visit, setVisit] = React.useState(0);
  const [progress, setProgress] = React.useState(0);
  const [held, setHeld] = React.useState(false);
  const [tabHidden, setTabHidden] = React.useState(false);
  const [exited, setExited] = React.useState(false);

  // ── Refs the clock and the input handlers read synchronously ───────────────
  const slidesRef = React.useRef(slides);
  const indexRef = React.useRef(0);
  const heldRef = React.useRef(false);
  const tabHiddenRef = React.useRef(false);
  const exitedRef = React.useRef(false);

  /** Milliseconds still owed to the current slide, as of the last pause. */
  const remainingRef = React.useRef(0);
  /** performance.now() when the current running stretch began; null = paused. */
  const runStartRef = React.useRef<number | null>(null);
  const durationRef = React.useRef<number>(SLIDE.defaultMs);
  const progressRef = React.useRef(0);

  /** Advance input is ignored until performance.now() passes this. */
  const lockUntilRef = React.useRef(0);

  const cbRef = React.useRef(opts);

  // Latest-value refs, written after commit rather than during render. Both are
  // only ever read from an event handler or a rAF callback, which run later.
  React.useEffect(() => {
    slidesRef.current = slides;
    cbRef.current = opts;
  });

  // ── Clock control ──────────────────────────────────────────────────────────

  const shouldRun = React.useCallback(
    () => !heldRef.current && !tabHiddenRef.current && !exitedRef.current,
    [],
  );

  /** Bank the elapsed run into `remainingRef` and stop the clock. Idempotent. */
  const pauseClock = React.useCallback(() => {
    if (runStartRef.current === null) return;
    remainingRef.current -= performance.now() - runStartRef.current;
    runStartRef.current = null;
  }, []);

  /** Re-stamp the clock. The banked remainder is untouched, so nothing restarts. */
  const resumeClock = React.useCallback(() => {
    if (runStartRef.current !== null) return;
    if (!shouldRun()) return;
    runStartRef.current = performance.now();
  }, [shouldRun]);

  const syncClock = React.useCallback(() => {
    if (shouldRun()) resumeClock();
    else pauseClock();
  }, [shouldRun, resumeClock, pauseClock]);

  // ── Navigation ─────────────────────────────────────────────────────────────

  const exit = React.useCallback(() => {
    if (exitedRef.current) return;
    exitedRef.current = true;
    pauseClock();
    setExited(true);
    cbRef.current.onExit?.();
  }, [pauseClock]);

  /** The only place `index` moves. Every caller goes through the lock. */
  const commit = React.useCallback((to: number) => {
    const from = indexRef.current;
    indexRef.current = to;
    lockUntilRef.current = performance.now() + SLIDE.inputLockMs;
    setIndex(to);
    setVisit((v) => v + 1);
    if (to !== from) cbRef.current.onAdvance?.(from, to);
  }, []);

  const locked = () => performance.now() < lockUntilRef.current;

  const goNext = React.useCallback(() => {
    if (exitedRef.current || locked()) return;
    const last = slidesRef.current.length - 1;
    if (indexRef.current >= last) {
      // Off the end is the same destination as a swipe down.
      lockUntilRef.current = performance.now() + SLIDE.inputLockMs;
      exit();
      return;
    }
    commit(indexRef.current + 1);
  }, [commit, exit]);

  const goPrev = React.useCallback(() => {
    if (exitedRef.current || locked()) return;
    // Back off the front is a no-op, never a backwards exit.
    if (indexRef.current <= 0) return;
    commit(indexRef.current - 1);
  }, [commit]);

  const goTo = React.useCallback(
    (i: number) => {
      if (exitedRef.current || locked()) return;
      const last = slidesRef.current.length - 1;
      if (last < 0) return;
      if (i > last) {
        exit();
        return;
      }
      const target = Math.max(0, i);
      if (target === indexRef.current) return;
      commit(target);
    },
    [commit, exit],
  );

  const restart = React.useCallback(() => {
    exitedRef.current = false;
    indexRef.current = 0;
    lockUntilRef.current = performance.now() + SLIDE.inputLockMs;
    setExited(false);
    setIndex(0);
    setVisit((v) => v + 1);
  }, []);

  // ── Slide entry: reset the banked time, announce the slide ─────────────────
  React.useEffect(() => {
    const def = slidesRef.current[index];
    if (!def || exitedRef.current) return;
    durationRef.current = Math.max(1, def.durationMs);
    remainingRef.current = durationRef.current;
    runStartRef.current = shouldRun() ? performance.now() : null;
    progressRef.current = 0;
    setProgress(0);
    cbRef.current.onSlideEnter?.(def, index);
  }, [index, visit, exited, shouldRun]);

  // Editing the story can shorten the deck under a live index (drop the last
  // photo while sitting on the photo slide). Clamp rather than run off the end.
  React.useEffect(() => {
    if (slides.length === 0) return;
    if (indexRef.current <= slides.length - 1) return;
    indexRef.current = slides.length - 1;
    setIndex(slides.length - 1);
    setVisit((v) => v + 1);
  }, [slides.length]);

  // ── The single clock: progress fill AND auto-advance, same measurement ─────
  React.useEffect(() => {
    if (exited || slides.length === 0) return;
    let raf = 0;
    let alive = true;

    const tick = () => {
      if (!alive) return;
      const dur = durationRef.current;
      const running = runStartRef.current !== null;
      const rem = running
        ? remainingRef.current - (performance.now() - (runStartRef.current as number))
        : remainingRef.current;

      const p = dur > 0 ? Math.min(1, Math.max(0, 1 - rem / dur)) : 1;
      const q = Math.round(p * PROGRESS_STEPS) / PROGRESS_STEPS;
      if (q !== progressRef.current) {
        progressRef.current = q;
        setProgress(q);
      }

      // Auto-advance. If the input lock happens to be up (a tap landed a moment
      // ago) this simply retries on the next frame — the remainder stays spent.
      if (running && rem <= 0) goNext();

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
    };
  }, [exited, slides.length, goNext]);

  // ── Tab visibility: a notification must not eat four slides ────────────────
  React.useEffect(() => {
    const onVis = () => {
      const hidden = document.hidden;
      tabHiddenRef.current = hidden;
      setTabHidden(hidden);
      syncClock();
    };
    onVis();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [syncClock]);

  // ── Pointer: tap zones, press-and-hold, swipe-down ─────────────────────────
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el || exited) return;

    let activeId: number | null = null;
    let startX = 0;
    let startY = 0;
    let movedFar = false;
    let holdTimer: ReturnType<typeof setTimeout> | null = null;

    const clearHoldTimer = () => {
      if (holdTimer !== null) {
        clearTimeout(holdTimer);
        holdTimer = null;
      }
    };

    const releaseHold = () => {
      if (!heldRef.current) return false;
      heldRef.current = false;
      setHeld(false);
      resumeClock();
      return true;
    };

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if (activeId !== null) return; // second finger: ignore, do not double-fire
      activeId = e.pointerId;
      startX = e.clientX;
      startY = e.clientY;
      movedFar = false;
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* capture is an optimisation; the document-level fallbacks still fire */
      }
      clearHoldTimer();
      holdTimer = setTimeout(() => {
        holdTimer = null;
        if (activeId === null) return;
        heldRef.current = true;
        setHeld(true);
        pauseClock();
      }, HOLD_MS);
    };

    const onMove = (e: PointerEvent) => {
      if (activeId !== e.pointerId) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.abs(dx) > TAP_SLOP_PX || Math.abs(dy) > TAP_SLOP_PX) movedFar = true;
      if (dy > SWIPE_DY && Math.abs(dx) < SWIPE_DX_MAX) {
        clearHoldTimer();
        activeId = null;
        heldRef.current = false;
        setHeld(false);
        exit();
      }
    };

    /** Every way a pointer can end. `allowTap` is false when we never saw the up. */
    const finish = (e: PointerEvent, allowTap: boolean) => {
      if (activeId !== e.pointerId) return;
      activeId = null;
      clearHoldTimer();
      try {
        if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }

      // A hold ends by giving the time back. It never advances — that is the
      // whole point: she was holding it still so she could screenshot it.
      if (releaseHold()) return;
      if (!allowTap || movedFar) return;

      const rect = el.getBoundingClientRect();
      if (rect.width <= 0) return;
      // Rect, not window: on desktop the story is a letterboxed column and the
      // zones must follow the column, not the viewport.
      const fraction = (e.clientX - rect.left) / rect.width;
      if (fraction < SLIDE.backZoneFraction) goPrev();
      else goNext();
    };

    const onUp = (e: PointerEvent) => finish(e, true);
    const onCancel = (e: PointerEvent) => finish(e, false);
    const onLostCapture = (e: PointerEvent) => finish(e, false);

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onCancel);
    el.addEventListener("lostpointercapture", onLostCapture);

    return () => {
      clearHoldTimer();
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onCancel);
      el.removeEventListener("lostpointercapture", onLostCapture);
      // Leaving the story while held must not strand the clock paused.
      if (heldRef.current) {
        heldRef.current = false;
        setHeld(false);
      }
    };
  }, [exited, exit, goNext, goPrev, pauseClock, resumeClock]);

  // A window blur mid-hold (app switcher, screenshot UI on some devices) leaves
  // no pointerup. Treat it as a release so the story is never stuck.
  React.useEffect(() => {
    const onBlur = () => {
      if (!heldRef.current) return;
      heldRef.current = false;
      setHeld(false);
      resumeClock();
    };
    window.addEventListener("blur", onBlur);
    return () => window.removeEventListener("blur", onBlur);
  }, [resumeClock]);

  // Orientation change and resize are deliberately unhandled: `index` lives in
  // state that nothing here touches, and the tap zones are measured from the
  // container rect at event time, so both survive a rotation with no work.

  return {
    index,
    visit,
    progress,
    held,
    paused: held || tabHidden || exited,
    exited,
    goNext,
    goPrev,
    goTo,
    exit,
    restart,
    containerRef,
  };
}
