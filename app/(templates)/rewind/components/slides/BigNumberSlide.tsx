"use client";

// ─── Slide 3 — the hero number ───────────────────────────────────────────────
//
// stats.days, and only stats.days. There is deliberately no `daysTogether` field
// in RewindData — this number is computed from one ISO date, which is the whole
// reason the format works. If it were typed the surprise would be gone before
// the deck started.
//
// The single radial glow behind the numeral is the ONLY gradient anywhere in this
// template, and it is drawn in def.fg at very low alpha — never a second colour.
//
// Timing budget: SLIDE.defaultMs (4500ms). Count-up runs SLIDE.countUpMs (1400ms)
// from 150ms; "together" lands at ~1150ms. Everything is settled by ~1600ms.

import React from "react";
import type { SlideProps } from "../slideTypes";
import { SLIDE } from "../types";
import { BODY_FONT, CountUp, DISPLAY_FONT, FadeUp, LetterSpaceIn } from "../kinetic";

const NUMBER_MS = 150;
const UNIT_MS = 800;
const TAIL_MS = 1150;

/** Alpha suffix on a 6-digit hex. def.fg is always #FFFFFF or #0E0E12. */
function withAlpha(hex: string, aa: string): string {
  return hex.length === 7 ? `${hex}${aa}` : hex;
}

/**
 * The hero has to look deliberate at one digit and at five. Sized off the final
 * value (not the animating one) so the type never resizes mid count-up.
 */
function heroSize(glyphs: number): string {
  if (glyphs <= 2) return "clamp(128px, 44vw, 250px)";
  if (glyphs <= 3) return "clamp(108px, 35vw, 200px)";
  if (glyphs <= 5) return "clamp(88px, 30vw, 178px)";
  return "clamp(64px, 22vw, 140px)";
}

export default function BigNumberSlide({ def, stats, reduced }: SlideProps): React.JSX.Element {
  const fg = def.fg;
  const days = Math.max(0, stats.days);
  const printed = days.toLocaleString("en-IN");

  // Two honest edge cases rather than "0 days together", which reads as a bug.
  const mode: "soon" | "dayOne" | "count" = stats.isFuture ? "soon" : days === 0 ? "dayOne" : "count";
  const glyphs = mode === "count" ? printed.length : 4;

  const unit = days === 1 ? "day" : "days";

  return (
    <div
      style={{
        position: "relative",
        flex: "1 1 auto",
        height: "100%",
        width: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        overflow: "hidden",
        boxSizing: "border-box",
        color: fg,
        paddingTop: "calc(72px + env(safe-area-inset-top))",
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: "calc(40px + env(safe-area-inset-bottom))",
      }}
    >
      {/* The one permitted gradient in the deck. */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: "50%",
          top: "47%",
          transform: "translate(-50%, -50%)",
          width: "148%",
          aspectRatio: "1 / 1",
          pointerEvents: "none",
          background: `radial-gradient(circle at 50% 50%, ${withAlpha(fg, "24")} 0%, ${withAlpha(fg, "0F")} 34%, ${withAlpha(fg, "00")} 68%)`,
        }}
      />

      <div style={{ position: "relative", width: "100%" }}>
        {mode === "count" ? (
          <CountUp
            value={days}
            durationMs={SLIDE.countUpMs}
            reduced={reduced}
            delayMs={NUMBER_MS}
            style={{
              display: "block",
              fontFamily: DISPLAY_FONT,
              fontWeight: 700,
              fontVariantNumeric: "tabular-nums",
              fontFeatureSettings: '"tnum" 1',
              letterSpacing: "-0.03em",
              lineHeight: 0.82,
              fontSize: heroSize(glyphs),
              color: fg,
            }}
          />
        ) : (
          <LetterSpaceIn
            reduced={reduced}
            delayMs={NUMBER_MS}
            from="0.34em"
            style={{
              fontFamily: DISPLAY_FONT,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "-0.02em",
              lineHeight: 0.82,
              fontSize: heroSize(glyphs),
              color: fg,
            }}
          >
            {mode === "soon" ? "SOON" : "DAY 1"}
          </LetterSpaceIn>
        )}

        <FadeUp
          reduced={reduced}
          delayMs={UNIT_MS}
          fromY={18}
          style={{ marginTop: 10 }}
        >
          <span
            style={{
              display: "block",
              fontFamily: DISPLAY_FONT,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.01em",
              lineHeight: 0.95,
              fontSize: "clamp(34px, 10vw, 62px)",
              color: fg,
            }}
          >
            {mode === "soon" ? "starting" : mode === "dayOne" ? "today" : unit}
          </span>
        </FadeUp>

        <FadeUp reduced={reduced} delayMs={TAIL_MS} fromY={12} style={{ marginTop: 16 }}>
          <span
            style={{
              display: "block",
              fontFamily: BODY_FONT,
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.26em",
              fontSize: "clamp(11px, 3.2vw, 15px)",
              opacity: 0.72,
              color: fg,
            }}
          >
            together
          </span>
        </FadeUp>
      </div>
    </div>
  );
}
