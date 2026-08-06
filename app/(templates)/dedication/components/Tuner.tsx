"use client";

// ─── Screen 1 — the tuner ────────────────────────────────────────────────────
//
// The hook. Everything else in this template is downstream of the fifteen
// seconds someone spends dragging this needle.
//
// THE GESTURE. `pointerup` is what fires the unlock, not `pointermove`. Only
// certain event types grant transient user activation, and pointermove is not
// one of them — a show unlocked from a move handler looks fine in Chrome on a
// desktop and is stone silent on an iPhone. So the needle SNAPS and the lamp
// LIGHTS during the move (that is the feedback the interaction needs), and the
// release is what puts the station on air.
//
// The keyboard path is different: keydown DOES grant activation, so an arrow
// key that lands inside the tolerance can unlock immediately.
//
// The decoy stations are deliberately not marked on the scale. You find them by
// ear or not at all — a dial with its stations printed on it is a menu.

import { useCallback, useState } from "react";
import { DIAL, PALETTE, TAP_TARGET_PX, BODY_FACE, DISPLAY_FACE, type Decoy } from "./types";
import { amberGlow, lampStyle } from "./radioStyles";

const SPAN = DIAL.max - DIAL.min;

/** Major numbered ticks; minor ticks fill between them. */
const MAJORS = [88, 92, 96, 100, 104, 108];
const MINOR_STEP = 0.5;

/** Ticks, numbers, needle and pointer mapping all share this inset. */
const TRACK_INSET = 12;

export interface TunerProps {
  target: number;
  decoys: Decoy[];
  stationName: string;
  /** Create the AudioContext. Called from pointerdown/keydown — a real gesture. */
  onPrime: () => void;
  /** Every needle movement. Drives the static, carrier and decoy bleed. */
  onNeedle: (freq: number) => void;
  /** THE unlock. Fired from pointerup or keydown, never from pointermove. */
  onLock: () => void;
}

const pct = (freq: number): number => ((freq - DIAL.min) / SPAN) * 100;

export default function Tuner({ target, decoys, stationName, onPrime, onNeedle, onLock }: TunerProps) {
  // Starts off-station on purpose: a dial that opens on the answer has no hook.
  const [needle, setNeedle] = useState(() => Number((DIAL.min + SPAN * 0.13).toFixed(2)));
  const [snapped, setSnapped] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [touched, setTouched] = useState(false);

  const apply = useCallback(
    (raw: number): boolean => {
      const clamped = Math.min(DIAL.max, Math.max(DIAL.min, raw));
      const inLock = Math.abs(clamped - target) <= DIAL.lockTolerance;
      // Magnetic: inside the tolerance the needle stops being yours.
      const next = inLock ? target : Number(clamped.toFixed(2));
      setNeedle(next);
      setSnapped(inLock);
      onNeedle(next);
      return inLock;
    },
    [target, onNeedle],
  );

  /**
   * Null when the track has no width yet — the caller then leaves the needle
   * alone.
   *
   * `TRACK_INSET` is subtracted on both sides because the ticks and the needle
   * are laid out inside that inset. Mapping the pointer across the FULL width
   * instead puts the needle up to three-quarters of a megahertz away from the
   * finger dragging it, which on a dial reads as broken tracking.
   */
  const freqFromEvent = (el: HTMLElement, clientX: number): number | null => {
    const r = el.getBoundingClientRect();
    const usable = r.width - TRACK_INSET * 2;
    if (usable <= 0) return null;
    const f = (clientX - r.left - TRACK_INSET) / usable;
    return DIAL.min + Math.min(1, Math.max(0, f)) * SPAN;
  };

  const handleDown = useCallback(
    (ev: React.PointerEvent<HTMLDivElement>) => {
      // Gesture #1: this is where the AudioContext is allowed to be born, and
      // it is why static is audible under the very first drag rather than
      // arriving a beat late.
      onPrime();
      setTouched(true);
      setDragging(true);
      ev.currentTarget.setPointerCapture(ev.pointerId);
      const f = freqFromEvent(ev.currentTarget, ev.clientX);
      if (f !== null) apply(f);
    },
    [apply, onPrime],
  );

  const handleMove = useCallback(
    (ev: React.PointerEvent<HTMLDivElement>) => {
      if (!dragging) return;
      const f = freqFromEvent(ev.currentTarget, ev.clientX);
      if (f !== null) apply(f);
    },
    [dragging, apply],
  );

  const handleUp = useCallback(
    (ev: React.PointerEvent<HTMLDivElement>) => {
      if (!dragging) return;
      setDragging(false);
      try {
        ev.currentTarget.releasePointerCapture(ev.pointerId);
      } catch {
        /* capture already gone */
      }
      // THE LOCK. pointerup carries user activation; pointermove does not.
      if (Math.abs(needle - target) <= DIAL.lockTolerance) onLock();
    },
    [dragging, needle, target, onLock],
  );

  const handleKey = useCallback(
    (ev: React.KeyboardEvent<HTMLDivElement>) => {
      let delta = 0;
      if (ev.key === "ArrowLeft" || ev.key === "ArrowDown") delta = -DIAL.keyStep;
      else if (ev.key === "ArrowRight" || ev.key === "ArrowUp") delta = DIAL.keyStep;
      else if (ev.key === "Home") delta = DIAL.min - needle;
      else if (ev.key === "End") delta = DIAL.max - needle;
      else if (ev.key === "Enter" || ev.key === " ") {
        if (snapped) {
          ev.preventDefault();
          onLock();
        }
        return;
      } else return;

      ev.preventDefault();
      onPrime();
      setTouched(true);
      // keydown grants activation, so an arrow key that lands on the station
      // can unlock in the same handler.
      if (apply(needle + delta)) onLock();
    },
    [needle, snapped, apply, onPrime, onLock],
  );

  const near = decoys.some((d) => Math.abs(needle - d.freq) < 0.45);
  const position = pct(needle);

  return (
    <div className="flex flex-col gap-3">
      {/* ── The illuminated station name. Dark until the needle finds it. ── */}
      <div className="flex items-center justify-between gap-2 px-0.5">
        <div className="flex items-center gap-2 min-w-0">
          <span
            aria-hidden
            className="w-3 h-3 rounded-full shrink-0"
            style={lampStyle(PALETTE.green, snapped)}
          />
          <span
            className="text-[11px] font-bold uppercase tracking-[0.16em] truncate"
            style={{
              fontFamily: BODY_FACE,
              color: snapped ? PALETTE.green : "rgba(232,220,192,.4)",
              textShadow: snapped ? `0 0 10px ${PALETTE.green}88` : "none",
            }}
          >
            {snapped ? "TUNED" : "SEARCHING"}
          </span>
        </div>
        <span
          className="text-[12px] font-bold uppercase tracking-[0.14em] truncate text-right"
          style={{
            fontFamily: BODY_FACE,
            color: snapped ? PALETTE.amber : "rgba(232,220,192,.22)",
            textShadow: snapped ? amberGlow(1) : "none",
            transition: "color 320ms ease, text-shadow 320ms ease",
          }}
        >
          {snapped ? stationName : "— — —"}
        </span>
      </div>

      {/* ── The scale. Cream inlay behind glass. ────────────────────────── */}
      <div
        role="slider"
        tabIndex={0}
        aria-label="Tuning dial"
        aria-valuemin={DIAL.min}
        aria-valuemax={DIAL.max}
        aria-valuenow={Number(needle.toFixed(1))}
        aria-valuetext={`${needle.toFixed(1)} megahertz${snapped ? ", station locked" : ""}`}
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerCancel={handleUp}
        onKeyDown={handleKey}
        className="relative w-full select-none outline-none rounded-[10px] cursor-ew-resize focus-visible:ring-2"
        style={{
          height: 118,
          minHeight: TAP_TARGET_PX * 2,
          touchAction: "none",
          background: `linear-gradient(180deg, ${PALETTE.cream}, ${PALETTE.creamDeep})`,
          boxShadow: `inset 0 2px 6px rgba(0,0,0,.45), inset 0 -1px 0 rgba(255,255,255,.6), 0 0 0 2px ${PALETTE.chromeDark}`,
        }}
      >
        {/* Ticks */}
        <div className="absolute top-0 bottom-0" style={{ left: TRACK_INSET, right: TRACK_INSET }}>
          {Array.from({ length: Math.round(SPAN / MINOR_STEP) + 1 }, (_, i) => {
            const f = DIAL.min + i * MINOR_STEP;
            const major = MAJORS.includes(Math.round(f * 10) / 10);
            return (
              <span
                key={f}
                aria-hidden
                className="absolute top-[14px]"
                style={{
                  left: `${pct(f)}%`,
                  width: major ? 2 : 1,
                  height: major ? 20 : 11,
                  background: major ? PALETTE.ink : "rgba(29,22,16,.55)",
                  transform: "translateX(-50%)",
                }}
              />
            );
          })}
          {MAJORS.map((f) => (
            <span
              key={`n${f}`}
              aria-hidden
              className="absolute text-[11px] font-bold tabular-nums"
              style={{
                left: `${pct(f)}%`,
                top: 38,
                transform: "translateX(-50%)",
                color: PALETTE.ink,
                fontFamily: DISPLAY_FACE,
              }}
            >
              {f}
            </span>
          ))}
          <span
            aria-hidden
            className="absolute text-[8px] font-bold uppercase tracking-[0.3em]"
            style={{ left: 0, top: 60, color: "rgba(29,22,16,.5)", fontFamily: BODY_FACE }}
          >
            MHz · FM
          </span>
        </div>

        {/* The needle */}
        <div
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            left: `calc(${TRACK_INSET}px + (100% - ${TRACK_INSET * 2}px) * ${position / 100})`,
            top: 6,
            bottom: 30,
            width: 3,
            transform: "translateX(-50%)",
            background: PALETTE.red,
            boxShadow: `0 0 6px ${PALETTE.red}cc, 0 0 14px ${PALETTE.red}55`,
            borderRadius: 2,
            transition: snapped && !dragging ? "left 180ms cubic-bezier(.2,.9,.3,1)" : "none",
          }}
        >
          <span
            className="absolute left-1/2 -translate-x-1/2"
            style={{
              top: -5,
              width: 0,
              height: 0,
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderTop: `8px solid ${PALETTE.red}`,
            }}
          />
        </div>

        {/* Readout, in the monospace display face */}
        <div
          className="absolute left-1/2 -translate-x-1/2 tabular-nums"
          style={{ bottom: 6, fontFamily: DISPLAY_FACE, fontSize: 15, fontWeight: 700, color: PALETTE.ink }}
        >
          {needle.toFixed(1)}
        </div>

        {/* Glass */}
        <span
          aria-hidden
          className="absolute inset-0 rounded-[10px] pointer-events-none"
          style={{
            background: "linear-gradient(112deg, rgba(255,255,255,.42) 0%, rgba(255,255,255,0) 42%)",
          }}
        />
      </div>

      {/* ── The instruction, and the only honest hint you get. ──────────── */}
      <p
        className="text-center text-[11px] leading-snug px-2"
        style={{ fontFamily: BODY_FACE, color: "rgba(232,220,192,.66)", minHeight: 30 }}
        aria-live="polite"
      >
        {snapped
          ? "release to listen"
          : near
            ? "something's coming through… keep going"
            : touched
              ? "keep going — there's a station in here somewhere"
              : "drag the red needle through the static"}
      </p>
    </div>
  );
}
