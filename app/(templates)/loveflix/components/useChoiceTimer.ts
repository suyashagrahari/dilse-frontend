"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// The countdown behind the timed binary choice.
//
// The countdown MUST pause on `visibilitychange` when the tab is hidden and
// resume with the same remaining time. Nobody should lose a choice because a
// notification arrived. It must also survive a device rotation with the
// remaining time intact, which is why the deadline is tracked in a ref against
// a monotonic clock rather than being recomputed from a re-rendered prop.
//
// WHY A DEADLINE AND NOT A COUNTER
// A `setInterval` that decrements a state counter drifts (timers fire late and
// the error accumulates), it keeps running while the tab is hidden, and it has
// no way to express "give me back exactly the 6.4s I had left". Tracking an
// absolute deadline against `performance.now()` — a monotonic clock, immune to
// the wall clock being changed — makes all three problems disappear:
//
//   remaining = deadline - now                 (cannot drift)
//   on hide   → banked  = deadline - now       (and the loop is torn down)
//   on show   → deadline = now + banked        (resumes at exactly `banked`)
//
// The deadline lives in a ref, so a re-render for any reason — a device
// rotation, a parent state change, a font swap — cannot reset it. The effect
// that arms the timer is keyed only on (active, totalMs), so nothing else can
// re-arm it either.
//
// WHY THE `arm` TOKEN
// "Reset to full when re-armed" is a pure derivation, not an effect: a reading
// stamped with a previous activation is stale by construction, so render simply
// ignores it and falls back to the full duration. That keeps every setState in
// this hook inside a callback (a rAF frame or a visibility event), which is
// what the hook is actually for — synchronising React with an external clock.

export interface ChoiceTimer {
  /** 0..1 remaining. 1 at the start, 0 at expiry. */
  remainingFraction: number;
  /** Whole seconds remaining, rounded up. */
  secondsLeft: number;
  /** True while the tab is hidden. */
  paused: boolean;
  /** Halt the timer permanently — call the moment a choice is committed. */
  stop: () => void;
}

interface Reading {
  /** Identity of the activation this reading belongs to. */
  arm: string;
  leftMs: number;
  paused: boolean;
}

const hidden = (): boolean => typeof document !== "undefined" && document.hidden === true;

export function useChoiceTimer(
  seconds: number,
  active: boolean,
  onExpire: () => void,
): ChoiceTimer {
  const totalMs = Math.max(0, Number.isFinite(seconds) ? seconds : 0) * 1000;

  // Changes exactly when the timer is armed or disarmed. A derived string
  // rather than a memoised object identity: the value IS the two inputs, so
  // there is nothing to memoise and no dependency array to get wrong.
  const arm = `${active}|${totalMs}`;

  const [reading, setReading] = useState<Reading | null>(null);

  /** Monotonic timestamp at which the countdown hits zero. */
  const deadlineRef = useRef(0);
  /** Milliseconds banked while the tab is hidden. `null` means "running". */
  const bankedRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  /** Set by `stop()`, by expiry and by teardown. Cleared only on re-arming. */
  const stoppedRef = useRef(false);
  /** `onExpire` fires at most once per activation. */
  const firedRef = useRef(false);

  // Held in a ref so a fresh inline callback each render never re-arms the timer.
  const onExpireRef = useRef(onExpire);
  useEffect(() => {
    onExpireRef.current = onExpire;
  });

  const stop = useCallback(() => {
    stoppedRef.current = true;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    // Idle: no loop running, nothing scheduled. Render reports a full timer
    // because `arm` has changed and the last reading is therefore stale.
    if (!active || totalMs <= 0) {
      stoppedRef.current = false;
      firedRef.current = false;
      bankedRef.current = null;
      deadlineRef.current = 0;
      return;
    }

    stoppedRef.current = false;
    firedRef.current = false;

    const startedHidden = hidden();
    deadlineRef.current = performance.now() + totalMs;
    // Already backgrounded at arm time? Bank the whole duration up front so no
    // time is consumed while nobody is looking. (`paused` reads false until the
    // tab comes back and publishes — invisible by definition, and no time is
    // lost either way.)
    bankedRef.current = startedHidden ? totalMs : null;

    const publish = (leftMs: number, isPaused: boolean) => {
      setReading({ arm, leftMs: Math.max(0, leftMs), paused: isPaused });
    };

    const tick = () => {
      rafRef.current = null;
      if (stoppedRef.current) return;

      // While banked the loop is not scheduled at all, but a frame already in
      // flight when the tab went away can still land here — hold the banked
      // value rather than reading a deadline that no longer means anything.
      const banked = bankedRef.current;
      if (banked !== null) {
        publish(banked, true);
        return;
      }

      const left = deadlineRef.current - performance.now();
      publish(left, false);

      if (left <= 0) {
        stoppedRef.current = true;
        if (!firedRef.current) {
          firedRef.current = true;
          onExpireRef.current();
        }
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    if (!startedHidden) rafRef.current = requestAnimationFrame(tick);

    const onVisibility = () => {
      if (stoppedRef.current) return;

      if (hidden()) {
        if (bankedRef.current !== null) return; // already frozen
        // Bank exactly what is left, then take the loop down completely.
        const left = Math.max(0, deadlineRef.current - performance.now());
        bankedRef.current = left;
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        publish(left, true);
        return;
      }

      const banked = bankedRef.current;
      if (banked === null) return; // never froze; nothing to resume
      // Push the deadline forward by however long we were away, so the time
      // remaining is exactly what it was at the moment of hiding.
      deadlineRef.current = performance.now() + banked;
      bankedRef.current = null;
      publish(banked, false);
      if (rafRef.current === null) rafRef.current = requestAnimationFrame(tick);
    };

    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      // A frame that somehow survives cancellation must not fire onExpire on a
      // scene the user has already left.
      stoppedRef.current = true;
    };
  }, [active, totalMs, arm]);

  // A reading from a previous activation is discarded, which is what makes the
  // reset-on-arm a derivation rather than an effect.
  const live = reading !== null && reading.arm === arm ? reading : null;
  const leftMs = live ? live.leftMs : totalMs;

  return {
    remainingFraction: totalMs > 0 ? Math.max(0, Math.min(1, leftMs / totalMs)) : 1,
    // Rounded UP, so it reads 10…1 and never shows a premature 0.
    secondsLeft: Math.ceil(Math.max(0, leftMs) / 1000),
    paused: live ? live.paused : false,
    stop,
  };
}
