"use client";

// ─── Slide 2 — the date ──────────────────────────────────────────────────────
//
// Both strings on this slide are DERIVED from data.startDate via deriveStats():
//   stats.startDateLabel  "14 March"
//   stats.startWeekday    "Tuesday"
// Nobody typed either of them. The weekday is the punchline — it is real, it is
// specific, and it always lands — so it gets its own beat a second later rather
// than arriving with the date.
//
// Timing budget: SLIDE.defaultMs (4500ms). Weekday lands at ~1350ms.

import React from "react";
import type { SlideProps } from "../slideTypes";
import { BODY_FONT, DISPLAY_FONT, FadeUp, WordStagger } from "../kinetic";

const EYEBROW_MS = 150;
const DATE_MS = 400;
const WEEKDAY_MS = 1350;

export default function DateSlide({ def, stats, reduced }: SlideProps): React.JSX.Element {
  const fg = def.fg;
  // Future start dates get forward-looking copy instead of a nonsense elapsed
  // figure. No number is shown on this slide either way.
  const eyebrow = stats.isFuture ? "It starts on" : "It started on";
  const label = stats.startDateLabel;
  const weekday = stats.startWeekday;

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
      <WordStagger
        as="p"
        text={eyebrow}
        reduced={reduced}
        delayMs={EYEBROW_MS}
        staggerMs={60}
        style={{
          fontFamily: BODY_FONT,
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.18em",
          fontSize: "clamp(11px, 3.1vw, 14px)",
          margin: 0,
          opacity: 0.7,
          color: fg,
        }}
      />

      <WordStagger
        as="h1"
        text={label}
        reduced={reduced}
        delayMs={DATE_MS}
        staggerMs={110}
        style={{
          fontFamily: DISPLAY_FONT,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "-0.02em",
          lineHeight: 0.85,
          fontSize: "clamp(58px, 17.5vw, 112px)",
          overflowWrap: "break-word",
          margin: "14px 0 0",
          color: fg,
        }}
      />

      {/* The punchline gets air above it and a rule to separate the beats. */}
      <FadeUp
        reduced={reduced}
        delayMs={WEEKDAY_MS}
        fromY={14}
        style={{ marginTop: 30, flex: "0 0 auto" }}
      >
        <div style={{ width: 34, height: 2, background: fg, opacity: 0.4, marginBottom: 14 }} />
        <p
          style={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 700,
            letterSpacing: "-0.01em",
            lineHeight: 0.95,
            fontSize: "clamp(30px, 8.6vw, 54px)",
            margin: 0,
            color: fg,
          }}
        >
          a {weekday}.
        </p>
        {stats.isFuture ? (
          <p
            style={{
              fontFamily: BODY_FONT,
              fontWeight: 400,
              fontSize: "clamp(14px, 3.9vw, 18px)",
              lineHeight: 1.35,
              margin: "14px 0 0",
              opacity: 0.72,
              color: fg,
            }}
          >
            Not long now.
          </p>
        ) : null}
      </FadeUp>
    </div>
  );
}
