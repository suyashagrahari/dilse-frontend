"use client";

// ─── Slide 4 — the time breakdown ────────────────────────────────────────────
//
// stats.breakdown is rendered VERBATIM. deriveStats() already composes it — the
// hours, the winters, the Diwalis, the pluralisation, and the under-30-days
// swap to "it's early. that's the good part." Reassembling that sentence here
// would mean two places to get it wrong, and the early case is already handled,
// so there is deliberately no fallback below.
//
// The only thing this file decides is where the line breaks go: split on ". " so
// each clause is its own line and gets its own stagger beat.
//
// Timing budget: SLIDE.textHeavyMs (7000ms). At most four clauses at 480ms
// apart, so the last line starts at ~1740ms.

import React from "react";
import type { SlideProps } from "../slideTypes";
import { BODY_FONT, DISPLAY_FONT, FadeUp, WordStagger } from "../kinetic";

const RULE_MS = 120;
const FIRST_LINE_MS = 320;
const LINE_GAP_MS = 480;

/** "that's 20,328 hours. 3 winters. 2 Diwalis." -> one clause per line. */
function toLines(breakdown: string): string[] {
  const lines = breakdown
    .split(". ")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => (s.endsWith(".") ? s : `${s}.`));
  return lines.length ? lines : [breakdown.trim()].filter(Boolean);
}

/** Four short clauses want more air than one long one. */
function lineSize(count: number, longest: number): string {
  if (count >= 4 || longest > 26) return "clamp(30px, 8.4vw, 50px)";
  if (count === 3) return "clamp(34px, 9.6vw, 58px)";
  return "clamp(38px, 11vw, 66px)";
}

export default function BreakdownSlide({ def, stats, reduced }: SlideProps): React.JSX.Element {
  const fg = def.fg;
  const lines = toLines(stats.breakdown);
  const longest = lines.reduce((m, l) => Math.max(m, l.length), 0);
  const size = lineSize(lines.length, longest);

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
      <FadeUp reduced={reduced} delayMs={RULE_MS} fromY={10} style={{ flex: "0 0 auto" }}>
        <div style={{ width: 56, height: 2, background: fg, opacity: 0.45, marginBottom: 24 }} />
      </FadeUp>

      {lines.map((line, i) => (
        <WordStagger
          key={`${i}-${line}`}
          as="p"
          text={line}
          reduced={reduced}
          delayMs={FIRST_LINE_MS + i * LINE_GAP_MS}
          staggerMs={70}
          style={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "-0.015em",
            lineHeight: 0.94,
            fontSize: size,
            overflowWrap: "break-word",
            margin: i === 0 ? 0 : "16px 0 0",
            // The first clause carries the hours; the rest are the texture.
            opacity: i === 0 ? 1 : 0.86,
            color: fg,
          }}
        />
      ))}

      <FadeUp
        reduced={reduced}
        delayMs={FIRST_LINE_MS + lines.length * LINE_GAP_MS}
        fromY={10}
        style={{ marginTop: 28, flex: "0 0 auto" }}
      >
        <span
          style={{
            display: "block",
            fontFamily: BODY_FONT,
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.24em",
            fontSize: "clamp(10px, 3vw, 13px)",
            opacity: 0.6,
            color: fg,
          }}
        >
          and counting
        </span>
      </FadeUp>
    </div>
  );
}
