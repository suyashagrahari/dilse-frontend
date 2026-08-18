"use client";

// ─── The gesture ─────────────────────────────────────────────────────────────
//
// This file is the template. Everything else is presentation.
//
// The swipe direction selects which of three authored responses is revealed, so
// the drag has to be trustworthy in a way a decorative drag does not: if a
// diagonal flick misfires into "complicated", the recipient reads a response the
// sender wrote for a choice she did not make.
//
// Pointer Events only. Handling touch and mouse separately means two code paths,
// two sets of thresholds and a double-fire on hybrid devices.

import { useCallback, useRef, useState } from "react";
import { GESTURE, type SwipeChoice } from "./types";

/** Below this, a wobble during a tap can look like a fast flick. */
const MIN_TRAVEL_PX = 24;
/** Total movement under this on release counts as a tap, not a drag. */
const TAP_SLOP_PX = 8;
const TAP_MAX_MS = 500;

export interface Sample {
  t: number;
  x: number;
  y: number;
}

/**
 * px/ms over the LAST `GESTURE.velocityWindowMs` of movement only.
 *
 * Measuring across the whole gesture is the classic mistake: a long slow drag
 * that ends in a flick averages out to nothing, and a fast drag that stalls
 * before release still reads as fast. Both are wrong, and the second one is the
 * one users notice, because the card leaves after they decided not to send it.
 *
 * Exported so it can be exercised directly — the hook keeps no other maths.
 */
export function tailVelocity(samples: readonly Sample[]): { vx: number; vy: number } {
  if (samples.length < 2) return { vx: 0, vy: 0 };
  const last = samples[samples.length - 1];
  let i = samples.length - 1;
  while (i > 0 && last.t - samples[i - 1].t <= GESTURE.velocityWindowMs) i--;
  const first = samples[i];
  const dt = last.t - first.t;
  if (dt <= 0) return { vx: 0, vy: 0 };
  return { vx: (last.x - first.x) / dt, vy: (last.y - first.y) / dt };
}

/**
 * Which direction the current offset is pointing at — used for the live tint
 * and stamp, so the feedback and the eventual commit can never disagree.
 */
export function previewChoice(dx: number, dy: number): SwipeChoice | null {
  if (dy < 0 && Math.abs(dy) > Math.abs(dx) * GESTURE.upDominance) return "complicated";
  if (Math.abs(dx) < 2) return null;
  return dx < 0 ? "red" : "green";
}

/** 0 at rest, 1 at the commit threshold for that direction. */
export function dragProgress(
  dx: number,
  dy: number,
  width: number,
  height: number,
  choice: SwipeChoice | null,
): number {
  if (!choice) return 0;
  if (choice === "complicated") {
    const t = height * GESTURE.upFraction;
    return t > 0 ? Math.abs(dy) / t : 0;
  }
  const t = width * GESTURE.commitFraction;
  return t > 0 ? Math.abs(dx) / t : 0;
}

/**
 * The commit decision.
 *
 * UP is tested first and requires clear vertical dominance. Without that rule a
 * 45deg drag lands in "complicated" roughly half the time, because at 45deg the
 * horizontal threshold and the vertical threshold are both met.
 *
 * `vx`/`vy` are px/ms measured over the tail of the gesture only, so a short
 * fast flick commits under the distance threshold while a long slow drag that
 * stalled before release does not.
 */
export function commitChoice(
  dx: number,
  dy: number,
  vx: number,
  vy: number,
  width: number,
  height: number,
): SwipeChoice | null {
  const upDominant = dy < 0 && Math.abs(dy) > Math.abs(dx) * GESTURE.upDominance;
  if (upDominant) {
    const far = Math.abs(dy) > height * GESTURE.upFraction;
    const fast = -vy > GESTURE.commitVelocity && Math.abs(dy) > MIN_TRAVEL_PX;
    return far || fast ? "complicated" : null;
  }
  const far = Math.abs(dx) > width * GESTURE.commitFraction;
  const fast = Math.abs(vx) > GESTURE.commitVelocity && Math.abs(dx) > MIN_TRAVEL_PX;
  if (far || fast) return dx < 0 ? "red" : "green";
  return null;
}

/** iOS has no Vibration API. Skip silently — a polyfill would be a lie. */
function buzz(): void {
  try {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      navigator.vibrate(GESTURE.hapticMs);
    }
  } catch {
    /* some browsers throw on a gesture-less call; a missing buzz is not an error */
  }
}

export interface SwipeHandlers {
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  onPointerCancel: (e: React.PointerEvent) => void;
}

export interface SwipeState {
  dx: number;
  dy: number;
  /** A pointer is down and moving. Transitions are off while true. */
  active: boolean;
  /** Released under threshold — springing back with an overshoot. */
  springing: boolean;
  handlers: SwipeHandlers;
}

interface Options {
  /** False for sincere cards, cards behind the front one, and during a reveal. */
  enabled: boolean;
  width: number;
  height: number;
  /** Receives the release offset so the fly-out can continue from it. */
  onCommit: (choice: SwipeChoice, dx: number, dy: number) => void;
  /** A press that never became a drag. */
  onTap?: () => void;
}

export function useSwipeGesture({ enabled, width, height, onCommit, onTap }: Options): SwipeState {
  const [dx, setDx] = useState(0);
  const [dy, setDy] = useState(0);
  const [active, setActive] = useState(false);
  const [springing, setSpringing] = useState(false);

  const pointerId = useRef<number | null>(null);
  const origin = useRef({ x: 0, y: 0, t: 0 });
  const samples = useRef<Sample[]>([]);
  /** Debounce: one buzz per gesture, not one per frame past the threshold. */
  const buzzed = useRef(false);
  const springTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pushSample = useCallback((t: number, x: number, y: number) => {
    const s = samples.current;
    s.push({ t, x, y });
    // Keep a little more than the window so there is always a sample to
    // measure against, but never the whole gesture.
    const cut = t - GESTURE.velocityWindowMs * 3;
    while (s.length > 2 && s[0].t < cut) s.shift();
  }, []);

  const reset = useCallback((withSpring: boolean) => {
    pointerId.current = null;
    samples.current = [];
    buzzed.current = false;
    setActive(false);
    setDx(0);
    setDy(0);
    if (springTimer.current) clearTimeout(springTimer.current);
    if (withSpring) {
      setSpringing(true);
      springTimer.current = setTimeout(() => setSpringing(false), GESTURE.springBackMs);
    } else {
      setSpringing(false);
    }
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!enabled || pointerId.current !== null) return;
      pointerId.current = e.pointerId;
      const now = e.timeStamp || performance.now();
      origin.current = { x: e.clientX, y: e.clientY, t: now };
      samples.current = [];
      buzzed.current = false;
      pushSample(now, e.clientX, e.clientY);
      setSpringing(false);
      setActive(true);
      try {
        (e.currentTarget as Element).setPointerCapture(e.pointerId);
      } catch {
        /* capture is an optimisation; the document-level fallback still works */
      }
    },
    [enabled, pushSample],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (pointerId.current !== e.pointerId) return;
      const now = e.timeStamp || performance.now();
      const nx = e.clientX - origin.current.x;
      const ny = e.clientY - origin.current.y;
      pushSample(now, e.clientX, e.clientY);
      setDx(nx);
      setDy(ny);

      if (!buzzed.current) {
        const choice = previewChoice(nx, ny);
        if (choice && dragProgress(nx, ny, width, height, choice) >= 1) {
          buzzed.current = true;
          buzz();
        }
      }
    },
    [pushSample, width, height],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (pointerId.current !== e.pointerId) return;
      const now = e.timeStamp || performance.now();
      const nx = e.clientX - origin.current.x;
      const ny = e.clientY - origin.current.y;
      pushSample(now, e.clientX, e.clientY);
      const { vx, vy } = tailVelocity(samples.current);
      try {
        (e.currentTarget as Element).releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }

      const travel = Math.hypot(nx, ny);
      const elapsed = now - origin.current.t;
      if (travel < TAP_SLOP_PX && elapsed < TAP_MAX_MS) {
        reset(false);
        onTap?.();
        return;
      }

      const choice = commitChoice(nx, ny, vx, vy, width, height);
      if (choice) {
        // Hand the release offset to the parent; the reveal sequence takes over
        // the transform from here and this hook goes back to zero.
        reset(false);
        onCommit(choice, nx, ny);
        return;
      }
      reset(true);
    },
    [pushSample, width, height, onCommit, onTap, reset],
  );

  const onPointerCancel = useCallback(
    (e: React.PointerEvent) => {
      if (pointerId.current !== e.pointerId) return;
      // Pointer left the viewport or the browser took over. Never a commit.
      reset(true);
    },
    [reset],
  );

  return {
    dx,
    dy,
    active,
    springing,
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel },
  };
}

/**
 * A one-shot upward swipe, for the screens either side of the deck. Tap works
 * too — the chevron is an invitation, not a toll gate.
 */
export function useUpSwipe(onAdvance: () => void): SwipeHandlers {
  const start = useRef<{ id: number; x: number; y: number; t: number } | null>(null);
  const fired = useRef(false);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    start.current = { id: e.pointerId, x: e.clientX, y: e.clientY, t: e.timeStamp || performance.now() };
    fired.current = false;
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const s = start.current;
      if (!s || s.id !== e.pointerId || fired.current) return;
      const ndx = e.clientX - s.x;
      const ndy = e.clientY - s.y;
      if (ndy < -56 && Math.abs(ndy) > Math.abs(ndx) * GESTURE.upDominance) {
        fired.current = true;
        onAdvance();
      }
    },
    [onAdvance],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      const s = start.current;
      start.current = null;
      if (!s || s.id !== e.pointerId || fired.current) return;
      const travel = Math.hypot(e.clientX - s.x, e.clientY - s.y);
      if (travel < TAP_SLOP_PX) onAdvance();
    },
    [onAdvance],
  );

  const onPointerCancel = useCallback(() => {
    start.current = null;
  }, []);

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel };
}
