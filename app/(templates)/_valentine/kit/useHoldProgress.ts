"use client";

// ─── useHoldProgress — press and hold to fill 0 → 1 ──────────────────────────
//
// One value drives everything (a bloom, a ring, a glow). Holding fills it over
// `duration`; letting go early springs it BACK a little (`springBack`, default
// 25% of the way — never to zero, that's punishing) and it eases down there.
// Accessibility / no-hold fallback: `taps` quick taps also complete it
// (each tap adds 1/taps), and Space/Enter held on the focused element works
// like a press. Completes once; `reset()` re-arms it.
//
//   const hold = useHoldProgress({ duration: 2400, onComplete: () => setBloomed(true) });
//   <button {...hold.bind} aria-label="Press and hold to grow the rose">…</button>
//   <Rose progress={hold.progress} />

import { useCallback, useEffect, useRef, useState } from "react";
import { haptic } from "./haptic";

export interface HoldOptions {
  /** ms of continuous holding from 0 to 1. Default 2200. */
  duration?: number;
  /** Share lost when released early. Default 0.25. */
  springBack?: number;
  /** Quick taps that complete it without holding. Default 5. */
  taps?: number;
  /** Tick haptics at 25/50/75%. Default true. */
  ticks?: boolean;
  onComplete?: () => void;
  disabled?: boolean;
}

export interface HoldHandle {
  progress: number;
  holding: boolean;
  done: boolean;
  reset: () => void;
  bind: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerUp: () => void;
    onPointerLeave: () => void;
    onPointerCancel: () => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
    onKeyUp: (e: React.KeyboardEvent) => void;
    onContextMenu: (e: React.MouseEvent) => void;
    style: React.CSSProperties;
  };
}

export function useHoldProgress({ duration = 2200, springBack = 0.25, taps = 5, ticks = true, onComplete, disabled }: HoldOptions = {}): HoldHandle {
  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const [done, setDone] = useState(false);
  const p = useRef(0);
  const target = useRef<number | null>(null);
  const raf = useRef<number | null>(null);
  const last = useRef(0);
  const downAt = useRef(0);
  const holdingRef = useRef(false);
  const doneRef = useRef(false);
  const tick = useRef(0);
  const tapCount = useRef(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const stop = () => {
    if (raf.current != null) cancelAnimationFrame(raf.current);
    raf.current = null;
  };

  const complete = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    p.current = 1;
    setProgress(1);
    setDone(true);
    setHolding(false);
    holdingRef.current = false;
    stop();
    haptic([15, 40, 25]);
    onCompleteRef.current?.();
  }, []);

  const loop = useCallback(
    (t: number) => {
      const dt = last.current ? t - last.current : 16;
      last.current = t;
      if (holdingRef.current) {
        p.current = Math.min(1, p.current + dt / duration);
        const q = Math.floor(p.current * 4);
        if (ticks && q > tick.current && q < 4) {
          tick.current = q;
          haptic(8);
        }
        if (p.current >= 1) return complete();
      } else if (target.current != null) {
        // Ease down to the spring-back target.
        p.current += (target.current - p.current) * Math.min(1, dt / 120);
        if (Math.abs(p.current - target.current) < 0.002) {
          p.current = target.current;
          target.current = null;
        }
      }
      setProgress(p.current);
      if (holdingRef.current || target.current != null) raf.current = requestAnimationFrame(loop);
      else raf.current = null;
    },
    [duration, ticks, complete],
  );

  const run = useCallback(() => {
    if (raf.current == null) {
      last.current = 0;
      raf.current = requestAnimationFrame(loop);
    }
  }, [loop]);

  const press = useCallback(() => {
    if (disabled || doneRef.current || holdingRef.current) return;
    holdingRef.current = true;
    target.current = null;
    downAt.current = performance.now();
    setHolding(true);
    run();
  }, [disabled, run]);

  const release = useCallback(() => {
    if (!holdingRef.current || doneRef.current) return;
    holdingRef.current = false;
    setHolding(false);
    const quick = performance.now() - downAt.current < 260;
    if (quick && taps > 0) {
      // A tap: count it toward the tap fallback instead of springing back.
      // Counted, not derived from progress: a fast next tap lands mid-ease, so
      // rounding the live value would sometimes swallow a step.
      tapCount.current += 1;
      const next = Math.min(1, Math.max(p.current, tapCount.current / taps));
      if (next >= 1) return complete();
      target.current = next;
    } else {
      target.current = Math.max(0, p.current - springBack);
      tick.current = Math.floor(target.current * 4);
    }
    run();
  }, [taps, springBack, run, complete]);

  useEffect(() => stop, []);

  const reset = useCallback(() => {
    stop();
    doneRef.current = false;
    holdingRef.current = false;
    target.current = null;
    tick.current = 0;
    tapCount.current = 0;
    p.current = 0;
    setProgress(0);
    setDone(false);
    setHolding(false);
  }, []);

  return {
    progress,
    holding,
    done,
    reset,
    bind: {
      onPointerDown: (e) => {
        (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
        press();
      },
      onPointerUp: release,
      onPointerLeave: release,
      onPointerCancel: release,
      onKeyDown: (e) => {
        if ((e.key === " " || e.key === "Enter") && !e.repeat) {
          e.preventDefault();
          press();
        }
      },
      onKeyUp: (e) => {
        if (e.key === " " || e.key === "Enter") release();
      },
      onContextMenu: (e) => e.preventDefault(),
      style: { touchAction: "none", userSelect: "none", WebkitUserSelect: "none", WebkitTouchCallout: "none" },
    },
  };
}

export default useHoldProgress;
