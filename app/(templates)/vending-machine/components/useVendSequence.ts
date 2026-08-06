"use client";

// ─── The purchase sequence ───────────────────────────────────────────────────
//
// One rAF clock drives everything. Not a pile of setTimeouts: the impact is the
// moment the whole template lives or dies on, and the thunk, the flap swing and
// the body jolt have to be dispatched from a single synchronous callback so they
// commit in one React pass and paint on one frame. Separate timers drift.
//
// All timings come from VEND in types.ts. Nothing is retyped here.

import { useCallback, useEffect, useRef, useState } from "react";
import { VEND, type Slot } from "./types";

export type VendStage = "coil" | "tip" | "stuck" | "fall" | "impact" | "settle";
export type StuckReason = "shake" | "override";

const easeInOut = (u: number): number => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);

/**
 * The stutter is a HOLD inside the rotation window, not an extension of it: the
 * coil still finishes at coilRotateMs, it just loses stutterMs of motion at
 * stutterAtPct of the way through. Removing the hold from the denominator is
 * what puts the pause at exactly 40%.
 */
const MOTION_MS = VEND.coilRotateMs - VEND.stutterMs;
export const STUTTER_AT = VEND.stutterAtPct * MOTION_MS;

export function coilProgress(t: number): number {
  let te = t;
  if (t > STUTTER_AT + VEND.stutterMs) te = t - VEND.stutterMs;
  else if (t > STUTTER_AT) te = STUTTER_AT;
  return easeInOut(Math.min(1, Math.max(0, te / MOTION_MS)));
}

/** How far through the forward travel the item is when it reaches the lip. */
export const P_AT_TIP = coilProgress(VEND.tipAtMs);

type Kind = "stutterOn" | "stutterOff" | "tip" | "fall" | "impact" | "collect" | "idle";

interface Beat {
  at: number;
  kind: Kind;
}

const FULL: Beat[] = [
  { at: STUTTER_AT, kind: "stutterOn" },
  { at: STUTTER_AT + VEND.stutterMs, kind: "stutterOff" },
  { at: VEND.tipAtMs, kind: "tip" },
  { at: VEND.fallStartMs, kind: "fall" },
  { at: VEND.impactAtMs, kind: "impact" },
  { at: VEND.collectAtMs, kind: "collect" },
  { at: VEND.collectAtMs + VEND.idleAfterMs, kind: "idle" },
];

/** Reduced motion keeps every display state and drops every movement. */
const REDUCED: Beat[] = [
  { at: 300, kind: "tip" },
  { at: 380, kind: "fall" },
  { at: 480, kind: "impact" },
  { at: 620, kind: "collect" },
  { at: 620 + VEND.idleAfterMs, kind: "idle" },
];

export interface VendCallbacks {
  onStart: (slot: Slot) => void;
  /** Called every frame of the rotation with eased progress 0..1. */
  onCoilFrame: (p: number, elapsed: number) => void;
  onStutter: (on: boolean) => void;
  onTip: () => void;
  onStuck: () => void;
  onShakeProgress: (count: number, direction: 1 | -1) => void;
  onFall: (hard: boolean) => void;
  /** Fire the thunk, the flap and the jolt here. Same call, same frame. */
  onImpact: (hard: boolean) => void;
  onCollect: (slot: Slot, reason: StuckReason | null) => void;
  onIdle: () => void;
  onOverride: () => void;
}

export function useVendSequence(reducedMotion: boolean, callbacks: VendCallbacks) {
  const cb = useRef(callbacks);
  useEffect(() => {
    cb.current = callbacks;
  });

  const [stage, setStage] = useState<VendStage | null>(null);
  const [shakes, setShakes] = useState(0);

  const slotRef = useRef<Slot | null>(null);
  const beatsRef = useRef<Beat[]>(FULL);
  const cursor = useRef(0);
  const t0 = useRef(0);
  const raf = useRef<number | null>(null);
  const frozen = useRef(false);
  const coilLive = useRef(false);
  const hardRef = useRef(false);
  const reasonRef = useRef<StuckReason | null>(null);
  const overrideTimer = useRef<number | null>(null);
  const busyRef = useRef(false);
  const shakeCount = useRef(0);
  /** Resuming out of the stuck state has to reach back into the loop closure. */
  const resumeRef = useRef<((reason: StuckReason) => void) | null>(null);
  /** Self-scheduling rAF, indirected so the callback is never stale. */
  const loopRef = useRef<(() => void) | null>(null);

  const stopRaf = () => {
    if (raf.current !== null) {
      cancelAnimationFrame(raf.current);
      raf.current = null;
    }
  };
  const clearOverride = () => {
    if (overrideTimer.current !== null) {
      window.clearTimeout(overrideTimer.current);
      overrideTimer.current = null;
    }
  };

  const finish = useCallback(() => {
    stopRaf();
    clearOverride();
    busyRef.current = false;
    frozen.current = false;
    coilLive.current = false;
    slotRef.current = null;
    shakeCount.current = 0;
    setStage(null);
    setShakes(0);
  }, []);

  const loop = useCallback(() => {
    raf.current = requestAnimationFrame(() => loopRef.current?.());
    const beats = beatsRef.current;
    const t = performance.now() - t0.current;

    if (coilLive.current) {
      cb.current.onCoilFrame(coilProgress(Math.min(t, VEND.tipAtMs)), t);
    }

    while (cursor.current < beats.length && t >= beats[cursor.current].at) {
      const beat = beats[cursor.current];
      cursor.current += 1;

      switch (beat.kind) {
        case "stutterOn":
          cb.current.onStutter(true);
          break;
        case "stutterOff":
          cb.current.onStutter(false);
          break;
        case "tip": {
          coilLive.current = false;
          const slot = slotRef.current;
          if (slot?.sticks) {
            frozen.current = true;
            setStage("stuck");
            cb.current.onStuck();
            clearOverride();
            // Never a dead end. Twenty seconds and the machine gives up arguing.
            overrideTimer.current = window.setTimeout(() => {
              cb.current.onOverride();
              resumeRef.current?.("override");
            }, VEND.stuckOverrideMs);
          } else {
            setStage("tip");
            cb.current.onTip();
          }
          break;
        }
        case "fall":
          setStage("fall");
          cb.current.onFall(hardRef.current);
          break;
        case "impact":
          // The one moment that matters: sound, flap and jolt from one call.
          setStage("impact");
          cb.current.onImpact(hardRef.current);
          break;
        case "collect": {
          setStage("settle");
          const slot = slotRef.current;
          if (slot) cb.current.onCollect(slot, reasonRef.current);
          break;
        }
        case "idle":
          cb.current.onIdle();
          finish();
          return;
      }

      if (frozen.current) {
        stopRaf();
        return;
      }
    }
  }, [finish]);

  const resume = useCallback(
    (reason: StuckReason) => {
      if (!frozen.current) return;
      clearOverride();
      frozen.current = false;
      hardRef.current = true;
      reasonRef.current = reason;
      const beats = beatsRef.current;
      const fallIndex = beats.findIndex((b) => b.kind === "fall");
      cursor.current = Math.max(0, fallIndex);
      t0.current = performance.now() - beats[fallIndex].at;
      setStage("fall");
      stopRaf();
      raf.current = requestAnimationFrame(loop);
    },
    [loop],
  );

  useEffect(() => {
    loopRef.current = loop;
    resumeRef.current = resume;
  }, [loop, resume]);

  const begin = useCallback(
    (slot: Slot): boolean => {
      if (busyRef.current) return false;
      busyRef.current = true;
      slotRef.current = slot;
      beatsRef.current = reducedMotion ? REDUCED : FULL;
      cursor.current = 0;
      hardRef.current = false;
      reasonRef.current = null;
      frozen.current = false;
      coilLive.current = !reducedMotion;
      t0.current = performance.now();
      shakeCount.current = 0;
      setShakes(0);
      setStage("coil");
      cb.current.onStart(slot);
      if (coilLive.current) cb.current.onCoilFrame(0, 0);
      stopRaf();
      raf.current = requestAnimationFrame(loop);
      return true;
    },
    [loop, reducedMotion],
  );

  // The count lives in a ref, not in the setState updater: React runs updaters
  // twice in development and a shake must never be counted twice.
  const registerShake = useCallback((direction: 1 | -1) => {
    if (!frozen.current) return;
    shakeCount.current += 1;
    const next = shakeCount.current;
    setShakes(next);
    cb.current.onShakeProgress(next, direction);
    if (next >= VEND.shakesRequired) resumeRef.current?.("shake");
  }, []);

  useEffect(
    () => () => {
      stopRaf();
      clearOverride();
    },
    [],
  );

  return {
    stage,
    shakes,
    busy: stage !== null,
    begin,
    registerShake,
    cancel: finish,
  };
}

export default useVendSequence;
