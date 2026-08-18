"use client";

// ─── Rewind — slide 9: the beat ──────────────────────────────────────────────
//
// Pure pacing. SLIDE.beatMs is 2000ms and there is no stat, no photo and no
// decoration on this slide — the whole job is the half-second of silence before
// the archetype lands. Two lines: the question, then the setup, the second one
// arriving late enough that you feel the gap.
//
// Full reveal completes at ~1.45s, comfortably inside the 2s hold.

import React from "react";
import { DISPLAY_FONT, LetterSpaceIn } from "../kinetic";
import type { SlideProps } from "../slideTypes";

const LINE_ONE_DELAY_MS = 80;
const LINE_TWO_DELAY_MS = 880;
const ENTER_MS = 560;

export default function BuildUpSlide({
  def,
  reduced,
}: SlideProps): React.JSX.Element {
  return (
    <div
      className="flex w-full flex-col items-center justify-center text-center"
      style={{
        height: "100%",
        minHeight: "100dvh",
        boxSizing: "border-box",
        overflow: "hidden",
        color: def.fg,
        paddingTop: "calc(72px + env(safe-area-inset-top))",
        paddingBottom: "calc(30px + env(safe-area-inset-bottom))",
        paddingLeft: 26,
        paddingRight: 26,
      }}
    >
      <LetterSpaceIn
        reduced={reduced}
        delayMs={LINE_ONE_DELAY_MS}
        durationMs={ENTER_MS}
        as="h2"
        style={{
          fontFamily: DISPLAY_FONT,
          fontWeight: 700,
          fontSize: "clamp(34px, 10.5vw, 52px)",
          lineHeight: 0.9,
          letterSpacing: "-0.02em",
          textTransform: "uppercase",
          maxWidth: 340,
        }}
      >
        So what does all this make you?
      </LetterSpaceIn>

      <LetterSpaceIn
        reduced={reduced}
        delayMs={LINE_TWO_DELAY_MS}
        durationMs={ENTER_MS}
        as="p"
        style={{
          fontFamily: DISPLAY_FONT,
          fontWeight: 700,
          fontSize: "clamp(17px, 5vw, 22px)",
          lineHeight: 1.1,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          opacity: 0.82,
          marginTop: 26,
          maxWidth: 340,
        }}
      >
        We ran the numbers.
      </LetterSpaceIn>
    </div>
  );
}
