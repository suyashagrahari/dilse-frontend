"use client";

// ─── Slide 1 — the cold open ─────────────────────────────────────────────────
//
// Two beats on near-black. "It was a year." lands first; "Let's talk about it."
// arrives a full beat later so the pause does the work. Nothing else on screen —
// the deck earns its volume later, and a loud first slide has nowhere to go.
//
// Timing budget: slide holds for SLIDE.defaultMs (4500ms). Beat two starts at
// 1200ms and finishes its word stagger well before the auto-advance.

import React from "react";
import type { SlideProps } from "../slideTypes";
import { BODY_FONT, DISPLAY_FONT, FadeUp, WordStagger } from "../kinetic";

const BEAT_ONE_MS = 250;
const BEAT_TWO_MS = 1200;

export default function ColdOpenSlide({ def, reduced }: SlideProps): React.JSX.Element {
  const fg = def.fg;

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
      {/* A hairline, not a decoration: it gives the two lines something to hang from. */}
      <FadeUp
        reduced={reduced}
        delayMs={BEAT_ONE_MS}
        fromY={12}
        style={{ flex: "0 0 auto", marginBottom: 22 }}
      >
        <div style={{ width: 44, height: 2, background: fg, opacity: 0.5 }} />
      </FadeUp>

      <WordStagger
        as="h1"
        text="It was a year."
        reduced={reduced}
        delayMs={BEAT_ONE_MS}
        staggerMs={90}
        style={{
          fontFamily: DISPLAY_FONT,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "-0.02em",
          lineHeight: 0.88,
          fontSize: "clamp(46px, 14vw, 86px)",
          margin: 0,
          color: fg,
        }}
      />

      <WordStagger
        as="p"
        text="Let's talk about it."
        reduced={reduced}
        delayMs={BEAT_TWO_MS}
        staggerMs={70}
        style={{
          fontFamily: BODY_FONT,
          fontWeight: 500,
          letterSpacing: "0.01em",
          lineHeight: 1.25,
          fontSize: "clamp(17px, 4.8vw, 24px)",
          margin: "20px 0 0",
          opacity: 0.78,
          color: fg,
        }}
      />
    </div>
  );
}
