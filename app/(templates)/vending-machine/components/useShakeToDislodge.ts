"use client";

// ─── Shake to dislodge ───────────────────────────────────────────────────────
//
// One physical shake is a burst of readings, not a reading. Without the debounce
// a single wrist flick registers four or five times and the whole mechanic
// collapses into "wave phone once, item drops" — so VEND.shakeDebounceMs is the
// load-bearing constant here, not the threshold.
//
// iOS 13+ will only hand over motion data after requestPermission() resolves
// inside a user gesture. It is deliberately NOT called on mount: a permission
// sheet on page load reads as a scam and gets denied. The caller fires it off
// the ENTER keypress.

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { VEND } from "./types";

export type MotionPermission = "unknown" | "unsupported" | "prompt" | "granted" | "denied";

interface MotionCtor {
  requestPermission?: () => Promise<"granted" | "denied" | "default">;
}

const motionCtor = (): MotionCtor | null =>
  typeof window !== "undefined" && "DeviceMotionEvent" in window
    ? (window.DeviceMotionEvent as unknown as MotionCtor)
    : null;

const GRAVITY = 9.81;

/** What the platform can do before anyone has been asked anything. */
function detect(): MotionPermission {
  const ctor = motionCtor();
  if (!ctor) return "unsupported";
  return typeof ctor.requestPermission === "function" ? "prompt" : "granted";
}
const NO_SUBSCRIBE = () => () => {};
const SERVER_SNAPSHOT = (): MotionPermission => "unknown";

interface UseShakeOpts {
  /** Only listen while an item is actually stuck. */
  active: boolean;
  onShake: (direction: 1 | -1) => void;
}

export function useShakeToDislodge({ active, onShake }: UseShakeOpts) {
  // Platform capability is read straight from the environment; only the answer
  // to an actual permission prompt is state.
  const capability = useSyncExternalStore(NO_SUBSCRIBE, detect, SERVER_SNAPSHOT);
  const [answered, setAnswered] = useState<MotionPermission | null>(null);
  const permission = answered ?? capability;

  const lastAt = useRef(0);
  const cb = useRef(onShake);
  useEffect(() => {
    cb.current = onShake;
  });

  /** Must be called from inside a user gesture on iOS. Safe to call repeatedly. */
  const requestPermission = useCallback(async () => {
    const ctor = motionCtor();
    if (!ctor) {
      setAnswered("unsupported");
      return "unsupported" as const;
    }
    if (typeof ctor.requestPermission !== "function") {
      setAnswered("granted");
      return "granted" as const;
    }
    try {
      const result = await ctor.requestPermission();
      const next = result === "granted" ? "granted" : "denied";
      setAnswered(next);
      return next;
    } catch {
      setAnswered("denied");
      return "denied" as const;
    }
  }, []);

  useEffect(() => {
    if (!active) return;
    if (permission !== "granted") return;

    const handler = (e: DeviceMotionEvent) => {
      const a = e.acceleration;
      const ag = e.accelerationIncludingGravity;
      let mag: number;
      let axis: number;

      if (a && (a.x !== null || a.y !== null || a.z !== null)) {
        const x = a.x ?? 0;
        const y = a.y ?? 0;
        const z = a.z ?? 0;
        mag = Math.sqrt(x * x + y * y + z * z);
        axis = x;
      } else if (ag) {
        const x = ag.x ?? 0;
        const y = ag.y ?? 0;
        const z = ag.z ?? 0;
        // Gravity is always in there; the interesting quantity is the departure
        // from a 1g resting magnitude.
        mag = Math.abs(Math.sqrt(x * x + y * y + z * z) - GRAVITY);
        axis = x;
      } else {
        return;
      }

      if (mag < VEND.shakeThreshold) return;

      const now = Date.now();
      if (now - lastAt.current < VEND.shakeDebounceMs) return;
      lastAt.current = now;

      cb.current(axis >= 0 ? 1 : -1);
    };

    window.addEventListener("devicemotion", handler);
    return () => window.removeEventListener("devicemotion", handler);
  }, [active, permission]);

  /** The desktop / denied / no-sensor path. Same debounce, same effect. */
  const manualShake = useCallback((direction: 1 | -1) => {
    const now = Date.now();
    if (now - lastAt.current < VEND.shakeDebounceMs) return false;
    lastAt.current = now;
    cb.current(direction);
    return true;
  }, []);

  return {
    permission,
    requestPermission,
    manualShake,
    /** True when the sensor path can never work and the button is the only way. */
    needsButton: permission === "unsupported" || permission === "denied",
  };
}

export default useShakeToDislodge;
