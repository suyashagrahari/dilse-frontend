"use client";

// ─── Slide 6 — the joke stat ─────────────────────────────────────────────────
//
// The ONE slide in the deck whose number the sender typed, and legitimately so:
// "47 times you said 'I'm fine'" is a self-reported joke, not something any
// amount of arithmetic could recover from a start date. Everything time-shaped
// elsewhere in the deck comes out of deriveStats().
//
// Which stat we show is picked with seededPick off props.seed — deterministic,
// stable across re-renders, and identical in the exported PNG. Never index 0
// (the first demo entry is the funny one; always showing it would make the pick
// look hardcoded) and never an unseeded RNG.
//
// `value` is a free string and may be "11:42", so it is only counted up when it
// is purely digits. Otherwise it gets a letter-spacing entrance.
//
// Timing budget: SLIDE.textHeavyMs (7000ms). The punchline lands at ~1700ms and
// then sits there, which is the joke.

import React from "react";
import type { SlideProps } from "../slideTypes";
import type { Stat } from "../types";
import { SLIDE } from "../types";
import { seededPick } from "@/lib/seededRandom";
import { BODY_FONT, CountUp, DISPLAY_FONT, FadeUp, LetterSpaceIn } from "../kinetic";

const LABEL_MS = 150;
const VALUE_MS = 450;
const SUB_MS = 1700;

const DIGITS = /^\d+$/;

/** Deliberate at "9" and at "11:42". */
function valueSize(glyphs: number): string {
  if (glyphs <= 2) return "clamp(124px, 42vw, 240px)";
  if (glyphs <= 3) return "clamp(106px, 34vw, 196px)";
  if (glyphs <= 5) return "clamp(76px, 25vw, 156px)";
  if (glyphs <= 8) return "clamp(52px, 17vw, 112px)";
  return "clamp(36px, 11vw, 78px)";
}

export default function JokeStatSlide({ data, def, reduced, seed }: SlideProps): React.JSX.Element {
  const fg = def.fg;

  const pool: Stat[] = data.stats.filter((s) => s.value.trim() || s.label.trim());
  const stat: Stat | null = pool.length ? seededPick(seed, `${def.key}:stat`, pool) : null;

  if (!stat) {
    return <div style={{ height: "100%", width: "100%", color: fg }} />;
  }

  const label = stat.label.trim();
  const value = stat.value.trim();
  const sub = stat.sub.trim();

  const numeric = DIGITS.test(value) && Number.isSafeInteger(Number(value));
  const glyphs = value.length || 1;

  return (
    <div
      style={{
        flex: "1 1 auto",
        height: "100%",
        width: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        overflow: "hidden",
        boxSizing: "border-box",
        color: fg,
        paddingTop: "calc(72px + env(safe-area-inset-top))",
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: "calc(40px + env(safe-area-inset-bottom))",
      }}
    >
      {label ? (
        <FadeUp reduced={reduced} delayMs={LABEL_MS} fromY={12} style={{ flex: "0 0 auto" }}>
          <span
            style={{
              display: "block",
              fontFamily: BODY_FONT,
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              lineHeight: 1.3,
              fontSize: "clamp(12px, 3.4vw, 16px)",
              opacity: 0.76,
              marginBottom: 12,
              color: fg,
            }}
          >
            {label}
          </span>
        </FadeUp>
      ) : null}

      {numeric ? (
        <CountUp
          value={Number(value)}
          durationMs={SLIDE.countUpMs}
          reduced={reduced}
          delayMs={VALUE_MS}
          // Rendered back at the sender's own width, so "007" stays "007".
          format={(nn) => String(nn).padStart(value.length, "0")}
          style={{
            display: "block",
            fontFamily: DISPLAY_FONT,
            fontWeight: 700,
            fontVariantNumeric: "tabular-nums",
            fontFeatureSettings: '"tnum" 1',
            letterSpacing: "-0.03em",
            lineHeight: 0.82,
            fontSize: valueSize(glyphs),
            color: fg,
          }}
        />
      ) : (
        <LetterSpaceIn
          reduced={reduced}
          delayMs={VALUE_MS}
          from="0.3em"
          style={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 700,
            fontVariantNumeric: "tabular-nums",
            fontFeatureSettings: '"tnum" 1',
            letterSpacing: "-0.02em",
            lineHeight: 0.85,
            fontSize: valueSize(glyphs),
            overflowWrap: "anywhere",
            color: fg,
          }}
        >
          {value}
        </LetterSpaceIn>
      )}

      {sub ? (
        <FadeUp reduced={reduced} delayMs={SUB_MS} fromY={16} style={{ marginTop: 26, flex: "0 0 auto" }}>
          <div style={{ width: 34, height: 2, background: fg, opacity: 0.4, marginBottom: 14 }} />
          <p
            style={{
              fontFamily: BODY_FONT,
              fontWeight: 400,
              fontSize: "clamp(15px, 4.4vw, 20px)",
              lineHeight: 1.35,
              margin: 0,
              opacity: 0.82,
              overflowWrap: "anywhere",
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 4,
              overflow: "hidden",
              color: fg,
            }}
          >
            {sub}
          </p>
        </FadeUp>
      ) : null}
    </div>
  );
}
