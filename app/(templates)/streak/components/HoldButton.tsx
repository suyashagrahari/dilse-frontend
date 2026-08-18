// ─── Press and hold ──────────────────────────────────────────────────────────
//
// WHY A HOLD AND NOT A TAP.
//
// A tap is something you do to a notification. 1.2 seconds is long enough that
// you cannot do it without meaning to, and short enough that it never becomes a
// chore. It is the single most important interaction in the template and it is
// deliberately the slowest one.
//
// Releasing early costs NOTHING. The ring drains back, no message appears, no
// state is touched. Punishing a mis-press would be exactly the anxiety this
// product exists to avoid.

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { unlockAudio } from "@/lib/webAudio";
import { CHECKIN_BUTTON_PX, COPY, PALETTE, SERIF, TIMING, UI } from "./types";

/** Outer diameter. The inner disc alone already clears CHECKIN_BUTTON_PX. */
const SIZE = 132;
const R = 62;
const C = 2 * Math.PI * R;
/** The ring drains back faster than it filled — an undo should feel light. */
const DRAIN_MS = 220;
/** Re-issued on this cadence so the buzz continues for the length of the hold. */
const VIBE_LOOP_MS = 240;

export interface HoldButtonProps {
  onComplete: () => void;
  disabled?: boolean;
  /** Replaces `COPY.holdHint` beneath the button (e.g. once already checked in). */
  hint?: string;
  reduced?: boolean;
}

/**
 * `navigator.vibrate` is Android-only. Absent on iOS Safari and on desktop, so
 * this is a silent no-op there — never polyfilled, never apologised for.
 */
function buzz(): void {
  if (typeof navigator === "undefined") return;
  const v = (navigator as Navigator & { vibrate?: (p: number[]) => boolean }).vibrate;
  if (typeof v !== "function") return;
  try {
    v.call(navigator, [15, 100, 20]);
  } catch {
    /* a blocked vibration is not an error worth surfacing */
  }
}

function stopBuzz(): void {
  if (typeof navigator === "undefined") return;
  const v = (navigator as Navigator & { vibrate?: (p: number[]) => boolean }).vibrate;
  if (typeof v !== "function") return;
  try {
    // An empty pattern is the documented way to stop an in-flight vibration.
    v.call(navigator, [0]);
  } catch {
    /* ignore */
  }
}

export default function HoldButton({ onComplete, disabled = false, hint, reduced = false }: HoldButtonProps) {
  const [holding, setHolding] = useState(false);
  const doneTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const vibeTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = useCallback(() => {
    if (doneTimer.current) {
      clearTimeout(doneTimer.current);
      doneTimer.current = null;
    }
    if (vibeTimer.current) {
      clearInterval(vibeTimer.current);
      vibeTimer.current = null;
    }
    stopBuzz();
  }, []);

  // Timers must not outlive the button — a check-in firing after the screen
  // changed would be a ghost action.
  useEffect(() => clearTimers, [clearTimers]);

  const begin = useCallback(() => {
    if (disabled || doneTimer.current) return;
    // The one real gesture we are guaranteed, so the chime later has a live
    // AudioContext to play into.
    unlockAudio();
    setHolding(true);
    buzz();
    vibeTimer.current = setInterval(buzz, VIBE_LOOP_MS);
    doneTimer.current = setTimeout(() => {
      clearTimers();
      setHolding(false);
      onComplete();
    }, TIMING.holdMs);
  }, [disabled, clearTimers, onComplete]);

  /** Early release. No penalty, no message — the ring just drains back. */
  const cancel = useCallback(() => {
    if (!doneTimer.current && !vibeTimer.current) {
      setHolding(false);
      return;
    }
    clearTimers();
    setHolding(false);
  }, [clearTimers]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Browsers repeat keydown while a key is held; `repeat` keeps `begin`
      // idempotent so the 1.2s timer is not restarted 30 times.
      if (e.repeat || (e.key !== " " && e.key !== "Enter")) return;
      e.preventDefault();
      begin();
    },
    [begin],
  );

  const onKeyUp = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== " " && e.key !== "Enter") return;
      cancel();
    },
    [cancel],
  );

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        disabled={disabled}
        aria-label={`${COPY.holdHint} — press and hold for just over a second`}
        onPointerDown={begin}
        onPointerUp={cancel}
        onPointerLeave={cancel}
        onPointerCancel={cancel}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onBlur={cancel}
        // A tap must do nothing at all. Without this, a quick tap on some
        // browsers also fires a synthetic click; there is no onClick to fire.
        onContextMenu={(e) => e.preventDefault()}
        className="relative grid place-items-center rounded-full select-none disabled:opacity-45"
        style={{
          width: SIZE,
          height: SIZE,
          minWidth: CHECKIN_BUTTON_PX,
          minHeight: CHECKIN_BUTTON_PX,
          background: "transparent",
          border: "none",
          padding: 0,
          touchAction: "none",
          WebkitTapHighlightColor: "transparent",
          cursor: disabled ? "default" : "pointer",
        }}
      >
        {/* The track and the fill. `streak-keep-motion` exempts this from the
            reduced-motion kill switch: it is progress feedback, not decoration,
            and a user who has asked for less motion still needs to know their
            press is registering. */}
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="absolute inset-0"
          aria-hidden="true"
          style={{ transform: "rotate(-90deg)" }}
        >
          <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke={PALETTE.edge} strokeWidth={3} />
          <circle
            className="streak-keep-motion"
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke={PALETTE.accent}
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={holding ? 0 : C}
            style={{
              transition: `stroke-dashoffset ${holding ? TIMING.holdMs : DRAIN_MS}ms ${
                holding ? "linear" : "ease-out"
              }`,
            }}
          />
        </svg>

        <span
          className="grid place-items-center rounded-full"
          style={{
            width: SIZE - 24,
            height: SIZE - 24,
            background: PALETTE.paperDeep,
            border: `1px solid ${PALETTE.edge}`,
            boxShadow: holding && !reduced ? `inset 0 0 26px rgba(201,130,47,0.20)` : "none",
            transition: reduced ? undefined : "box-shadow 300ms ease",
          }}
        >
          <span style={{ fontFamily: SERIF, fontSize: 19, color: PALETTE.ink, letterSpacing: "0.01em" }}>
            hold
          </span>
        </span>
      </button>

      <p style={{ fontFamily: UI, fontSize: 13, color: PALETTE.inkSoft }}>{hint ?? COPY.holdHint}</p>
    </div>
  );
}
