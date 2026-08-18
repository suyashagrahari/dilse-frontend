"use client";

// ─── Rewind — slide 10: the archetype ────────────────────────────────────────
//
// The payoff, and the slide the whole deck exists to arrive at. Press-and-hold
// pauses the timer specifically so this can be screenshotted, so the reveal is
// fully finished at ~1.85s — nobody holding at second three ever catches it
// mid-animation.
//
// def.bg is already archetype.bg and def.fg is already textOn(archetype.bg).
// Neither is re-derived here and no colour is hardcoded. The composition is a
// poster: an eyebrow, the name at poster scale, one line underneath, a hairline
// frame and a seeded dust of specks. Nothing else competes with the name.

import React from "react";
import { seededSpread, seededUnit } from "@/lib/seededRandom";
import { BODY_FONT, DISPLAY_FONT, FadeUp, FitText, LetterSpaceIn } from "../kinetic";
import type { SlideProps } from "../slideTypes";

const SPECKS = 26;

export default function ArchetypeSlide({
  archetype,
  def,
  reduced,
  seed,
}: SlideProps): React.JSX.Element {
  const name = archetype.name.trim() || "THE TWO OF YOU";
  const line = archetype.line.trim();

  // A 200-character line steps down a size rather than crowding the name.
  const linePx = line.length > 130 ? 15 : line.length > 80 ? 16 : 18;

  const specks = React.useMemo(
    () =>
      Array.from({ length: SPECKS }, (_, i) => ({
        left: 50 + seededSpread(seed, `speck:x:${i}`, 48),
        top: 50 + seededSpread(seed, `speck:y:${i}`, 48),
        size: 2 + seededUnit(seed, `speck:s:${i}`) * 3.4,
      })),
    [seed],
  );

  return (
    <div
      className="relative flex w-full flex-col items-center"
      style={{
        height: "100%",
        minHeight: "100dvh",
        boxSizing: "border-box",
        overflow: "hidden",
        color: def.fg,
        paddingTop: "calc(72px + env(safe-area-inset-top))",
        paddingBottom: "calc(34px + env(safe-area-inset-bottom))",
        paddingLeft: 22,
        paddingRight: 22,
      }}
    >
      {/* Seeded texture — no unseeded randomness, so the export matches. */}
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {specks.map((s, i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              left: `${s.left.toFixed(2)}%`,
              top: `${s.top.toFixed(2)}%`,
              width: s.size.toFixed(2) + "px",
              height: s.size.toFixed(2) + "px",
              borderRadius: "50%",
              background: def.fg,
              opacity: 0.1,
            }}
          />
        ))}
      </div>

      {/* Hairline frame, low alpha, so the poster has an edge. */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "calc(58px + env(safe-area-inset-top))",
          bottom: "calc(20px + env(safe-area-inset-bottom))",
          left: 12,
          right: 12,
          border: `1px solid ${def.fg}24`,
          pointerEvents: "none",
        }}
      />

      <LetterSpaceIn
        reduced={reduced}
        delayMs={60}
        durationMs={620}
        style={{
          position: "relative",
          fontFamily: DISPLAY_FONT,
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: "0.34em",
          textTransform: "uppercase",
          opacity: 0.72,
        }}
      >
        YOUR ARCHETYPE
      </LetterSpaceIn>

      <div
        style={{
          position: "relative",
          flex: 1,
          minHeight: 0,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* LetterSpaceIn sits outside FitText so the entrance animates the
            tracking of the whole block.
            Two deliberate numbers here, both about the transient:
            FitText's layout effect runs before its parent's, so it measures at
            the RESTING tracking — then the entrance briefly widens the line by
            (from / avg-advance). `from` is held at 0.07em and FitText is given
            26px of horizontal padding, so the widest possible line (284px at
            fit) can bleed to ~324px and still sit inside the 336px border box
            that FitText clips at. Nothing is ever cut off mid-entrance. */}
        <LetterSpaceIn
          reduced={reduced}
          delayMs={300}
          durationMs={900}
          from="0.07em"
          style={{ width: "100%" }}
        >
          <FitText
            maxPx={110}
            minPx={34}
            style={{
              fontFamily: DISPLAY_FONT,
              fontWeight: 700,
              lineHeight: 0.85,
              textTransform: "uppercase",
              textAlign: "center",
              width: "100%",
              paddingLeft: 26,
              paddingRight: 26,
            }}
          >
            {name}
          </FitText>
        </LetterSpaceIn>
      </div>

      {line ? (
        <FadeUp
          reduced={reduced}
          delayMs={1150}
          durationMs={700}
          fromY={18}
          style={{
            position: "relative",
            fontFamily: BODY_FONT,
            fontSize: linePx,
            lineHeight: 1.4,
            textAlign: "center",
            opacity: 0.88,
            maxWidth: 320,
            marginTop: 8,
          }}
        >
          {line}
        </FadeUp>
      ) : null}
    </div>
  );
}
