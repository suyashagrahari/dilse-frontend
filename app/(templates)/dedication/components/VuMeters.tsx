"use client";

// ─── The VU meter pair ───────────────────────────────────────────────────────
//
// TWO DIFFERENT THINGS SHARE THIS COMPONENT, and the difference is not cosmetic:
//
//   VOICE segments — the needles are driven by a real AnalyserNode reading our
//   own <audio> element. `machine.audio.voiceLevel()` returns the RMS of the
//   actual waveform. When it says 0.7, the RJ is 0.7 loud.
//
//   SONG segments — the audio is inside a cross-origin YouTube iframe. It
//   CANNOT be read; there is no API for it and attempting one would violate the
//   embed terms. So the needles run a SIMULATED path: a smoothed random walk
//   whose target is re-rolled 4–8 times a second, seeded so it is at least
//   deterministic. It is not measuring anything. Nothing in this file pretends
//   otherwise, and `voiceLevel()` returning null is the honest signal that we
//   have fallen back to it.
//
// Drawn to canvas in a rAF loop rather than through React state — a needle
// updated via setState at 60fps is both a React 19 lint violation
// (`set-state-in-effect`) and a re-render storm.

import { useCallback } from "react";
import { PALETTE, TIMING, BODY_FACE } from "./types";
import type { ShowMachine } from "./showMachine";

export interface VuMetersProps {
  machine: ShowMachine;
  /** Freeze the needles at rest. The tuner still works; this is decoration. */
  reduced: boolean;
  height?: number;
}

interface Channel {
  /** Where the needle is now. */
  value: number;
  /** Where it is heading. */
  target: number;
  /** ms until the simulated walk re-rolls. */
  nextRollAt: number;
}

/**
 * Classic VU sweep, drawn as an arc over a pivot at the bottom of the face.
 *
 * Canvas angles run clockwise from +x, so straight up is 1.5π. Both endpoints
 * are expressed in the 1.22π–1.78π range deliberately: written as 0.78π→0.22π
 * the arc still draws correctly (the long way round) but the NEEDLE, which
 * interpolates linearly between the two, takes the short way and swings below
 * the face where nobody can see it.
 */
const ARC_START = Math.PI * 1.22;
const ARC_END = Math.PI * 1.78;

function drawMeter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  value: number,
  label: string,
  lit: boolean,
): void {
  const cx = x + w / 2;
  const cy = y + h * 0.96;
  const r = Math.min(w * 0.46, h * 0.86);

  // Face
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 4);
  ctx.fillStyle = lit ? "#efe3c6" : "#cfc4a8";
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,.45)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.clip();

  // Scale arc — the last fifth is the red overload zone.
  ctx.lineWidth = Math.max(1.5, r * 0.055);
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.82, ARC_START, ARC_START + (ARC_END - ARC_START) * 0.78, false);
  ctx.strokeStyle = "rgba(29,22,16,.72)";
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.82, ARC_START + (ARC_END - ARC_START) * 0.78, ARC_END, false);
  ctx.strokeStyle = PALETTE.red;
  ctx.stroke();

  // Ticks
  for (let i = 0; i <= 6; i++) {
    const a = ARC_START + (ARC_END - ARC_START) * (i / 6);
    const inner = r * 0.7;
    const outer = r * 0.8;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
    ctx.lineTo(cx + Math.cos(a) * outer, cy + Math.sin(a) * outer);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(29,22,16,.5)";
    ctx.stroke();
  }

  // Needle
  const a = ARC_START + (ARC_END - ARC_START) * Math.min(1, Math.max(0, value));
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(a) * r * 0.86, cy + Math.sin(a) * r * 0.86);
  ctx.lineWidth = Math.max(1.4, r * 0.045);
  ctx.strokeStyle = PALETTE.red;
  ctx.lineCap = "round";
  ctx.stroke();

  // Pivot
  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(2, r * 0.09), 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.chromeDark;
  ctx.fill();

  // Label
  ctx.font = `600 ${Math.max(7, r * 0.2)}px ui-sans-serif, system-ui, sans-serif`;
  ctx.fillStyle = "rgba(29,22,16,.6)";
  ctx.textAlign = "center";
  ctx.fillText(label, cx, y + h * 0.34);

  ctx.restore();
}

export default function VuMeters({ machine, reduced, height = 62 }: VuMetersProps) {
  /**
   * React 19 ref callbacks may return a cleanup function, which is what lets
   * the whole rAF lifecycle live here without an effect and without ever
   * reading a ref during render.
   */
  const attachCanvas = useCallback(
    (canvas: HTMLCanvasElement | null) => {
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const channels: Channel[] = [
        { value: 0, target: 0, nextRollAt: 0 },
        { value: 0, target: 0, nextRollAt: 0 },
      ];

      let raf = 0;
      let cssW = 0;
      let cssH = height;

      const resize = () => {
        const dpr = Math.min(3, window.devicePixelRatio || 1);
        const rect = canvas.getBoundingClientRect();
        cssW = Math.max(1, rect.width);
        cssH = Math.max(1, rect.height || height);
        canvas.width = Math.round(cssW * dpr);
        canvas.height = Math.round(cssH * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };
      resize();

      const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
      ro?.observe(canvas);

      let last = performance.now();

      const frame = (now: number) => {
        const dt = Math.min(64, now - last);
        last = now;
        const snap = machine.getSnapshot();
        const live = snap.phase === "playing" && snap.playing && !snap.bridging;

        // GENUINE: a real AnalyserNode on our own element. Null when there is
        // nothing real to read.
        const measured = snap.onAir ? machine.audio.voiceLevel() : null;

        for (let i = 0; i < channels.length; i++) {
          const ch = channels[i];

          if (!live) {
            ch.target = 0;
          } else if (measured !== null) {
            // Slight channel offset so the pair does not move as one bar.
            ch.target = Math.min(1, measured * (i === 0 ? 1 : 0.9) + (i === 0 ? 0 : 0.03));
          } else {
            // SIMULATED. Not a measurement — see the header. Re-rolled at
            // TIMING.vuSimHzMin..Max, with an occasional peak so it does not
            // sit in a comfortable middle band the way no real meter does.
            ch.nextRollAt -= dt;
            if (ch.nextRollAt <= 0) {
              const hz =
                TIMING.vuSimHzMin + machine.vuRandom() * (TIMING.vuSimHzMax - TIMING.vuSimHzMin);
              ch.nextRollAt = 1000 / hz;
              const roll = machine.vuRandom();
              const peak = machine.vuRandom() < 0.12;
              ch.target = peak ? 0.82 + roll * 0.18 : 0.28 + roll * 0.42;
            }
          }

          if (reduced) {
            ch.value = 0;
          } else {
            // Real VU ballistics: rises fast, falls slowly.
            const k = ch.target > ch.value ? 0.3 : 0.08;
            ch.value += (ch.target - ch.value) * k;
          }
        }

        ctx.clearRect(0, 0, cssW, cssH);
        const gap = 8;
        const w = (cssW - gap) / 2;
        drawMeter(ctx, 0, 0, w, cssH, channels[0].value, "L", live);
        drawMeter(ctx, w + gap, 0, w, cssH, channels[1].value, "R", live);

        raf = requestAnimationFrame(frame);
      };

      raf = requestAnimationFrame(frame);

      return () => {
        cancelAnimationFrame(raf);
        ro?.disconnect();
      };
    },
    [machine, reduced, height],
  );

  return (
    <div className="w-full">
      <canvas
        ref={attachCanvas}
        role="img"
        aria-label="Volume unit meters"
        className="block w-full"
        style={{ height }}
      />
      <p
        className="text-[8px] uppercase tracking-[0.24em] text-center mt-0.5"
        style={{ fontFamily: BODY_FACE, color: "rgba(232,220,192,.34)" }}
      >
        VU
      </p>
    </div>
  );
}
