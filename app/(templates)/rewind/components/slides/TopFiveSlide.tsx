"use client";

// ─── Slide 5 — the ranked list ───────────────────────────────────────────────
//
// The highest-screenshot slide in the deck, and the one with the longest hold
// (SLIDE.listMs, 8000ms). Everything here is composition: giant zero-padded
// numerals down the left, the sender's own words beside them, rows sliding in
// from the left one at a time.
//
// The only number on screen is the rank, which is the row's own position.
//
// Fit at 380x640 (the tightest case we support), measured rather than hoped:
//   available height  = 640 - 72 (top pad) - 40 (bottom pad) = 528
//   header block      = ~79   (eyebrow 15 + gap 8 + title 34 + gap 22)
//   five rows         = 5 x (58 content + 16 gap) - 16 = 354
//   total             = 433 < 528, with every reason clamped at three lines.
//
// Timing: last row starts at 300 + 4 x 220 = 1180ms, far inside the 8000ms hold.

import React from "react";
import type { SlideProps } from "../slideTypes";
import { SLIDE } from "../types";
import { BODY_FONT, DISPLAY_FONT, FadeUp, StaggerList } from "../kinetic";

const EYEBROW_MS = 100;
const TITLE_MS = 260;
const ROWS_MS = 300;

export default function TopFiveSlide({ data, def, reduced }: SlideProps): React.JSX.Element {
  const fg = def.fg;
  // Fewer than five is normal: render what exists, numbered from 1, no blanks.
  const reasons = data.topReasons.map((r) => r.trim()).filter(Boolean).slice(0, 5);
  const n = reasons.length;

  const title = n === 1 ? "The reason" : `Top ${n} reasons`;

  // Five rows want to be a touch tighter than two.
  const numeralSize = n >= 5 ? "clamp(48px, 15vw, 64px)" : "clamp(54px, 17vw, 72px)";
  const bodySize = n >= 5 ? "clamp(14px, 3.9vw, 17px)" : "clamp(15px, 4.3vw, 19px)";
  const rowGap = n >= 5 ? 16 : 20;

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
      <FadeUp reduced={reduced} delayMs={EYEBROW_MS} fromY={10} style={{ flex: "0 0 auto" }}>
        <span
          style={{
            display: "block",
            fontFamily: BODY_FONT,
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.24em",
            fontSize: "clamp(10px, 3vw, 13px)",
            opacity: 0.68,
            color: fg,
          }}
        >
          the official list
        </span>
      </FadeUp>

      <FadeUp reduced={reduced} delayMs={TITLE_MS} fromY={14} style={{ flex: "0 0 auto", marginTop: 8 }}>
        <h1
          style={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "-0.02em",
            lineHeight: 0.9,
            fontSize: "clamp(32px, 9.2vw, 50px)",
            margin: 0,
            color: fg,
          }}
        >
          {title}
        </h1>
      </FadeUp>

      {n === 0 ? (
        <FadeUp reduced={reduced} delayMs={ROWS_MS} fromY={16} style={{ marginTop: 24 }}>
          <p
            style={{
              fontFamily: BODY_FONT,
              fontWeight: 400,
              fontSize: "clamp(15px, 4.2vw, 19px)",
              lineHeight: 1.4,
              margin: 0,
              opacity: 0.78,
              color: fg,
            }}
          >
            Still being written.
          </p>
        </FadeUp>
      ) : (
        <StaggerList
          reduced={reduced}
          delayMs={ROWS_MS}
          staggerMs={SLIDE.rowStaggerMs}
          fromX={-34}
          style={{
            marginTop: 22,
            display: "flex",
            flexDirection: "column",
            gap: rowGap,
            minHeight: 0,
          }}
        >
          {reasons.map((reason, i) => (
            <div
              key={`${i}-${reason.slice(0, 24)}`}
              style={{ display: "flex", alignItems: "center", gap: 12 }}
            >
              <span
                aria-hidden
                style={{
                  flex: "0 0 auto",
                  minWidth: n >= 5 ? 66 : 74,
                  fontFamily: DISPLAY_FONT,
                  fontWeight: 700,
                  fontVariantNumeric: "tabular-nums",
                  fontFeatureSettings: '"tnum" 1',
                  letterSpacing: "-0.04em",
                  lineHeight: 0.8,
                  fontSize: numeralSize,
                  opacity: 0.9,
                  color: fg,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <p
                style={{
                  flex: "1 1 auto",
                  minWidth: 0,
                  fontFamily: BODY_FONT,
                  fontWeight: 500,
                  fontSize: bodySize,
                  lineHeight: 1.28,
                  margin: 0,
                  color: fg,
                  // A 200-character reason must not push the deck into a scroll.
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 3,
                  overflow: "hidden",
                  overflowWrap: "anywhere",
                }}
              >
                {reason}
              </p>
            </div>
          ))}
        </StaggerList>
      )}
    </div>
  );
}
