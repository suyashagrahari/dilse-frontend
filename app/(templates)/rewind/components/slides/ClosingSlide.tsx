"use client";

// ─── Rewind — slide 11: the exhale ───────────────────────────────────────────
//
// The last thing anybody reads, so nothing on this slide competes with it. One
// slow fade-up for the line, one much later and much quieter for the two names,
// and that is the entire slide. Deliberately under-done: after the archetype
// poster, more motion here would read as a lack of confidence in the sentence.

import React from "react";
import { BODY_FONT, DISPLAY_FONT, FadeUp } from "../kinetic";
import type { SlideProps } from "../slideTypes";

export default function ClosingSlide({
  data,
  def,
  reduced,
}: SlideProps): React.JSX.Element {
  const line = data.closingLine.trim() || "Same time next year.";

  const sender = data.senderName.trim();
  const recipient = data.recipientName.trim();
  const names = sender && recipient ? `${sender} & ${recipient}` : sender || recipient;

  // A long sign-off steps down instead of wrapping past the fold.
  const px =
    line.length > 160 ? 19 : line.length > 90 ? 24 : line.length > 44 ? 30 : 38;

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
        paddingBottom: "calc(34px + env(safe-area-inset-bottom))",
        paddingLeft: 28,
        paddingRight: 28,
      }}
    >
      <FadeUp
        reduced={reduced}
        delayMs={280}
        durationMs={1400}
        fromY={20}
        as="p"
        style={{
          fontFamily: DISPLAY_FONT,
          fontWeight: 600,
          fontSize: px,
          lineHeight: 1.14,
          letterSpacing: "-0.01em",
          maxWidth: 330,
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: 12,
          overflow: "hidden",
        }}
      >
        {line}
      </FadeUp>

      {names ? (
        <FadeUp
          reduced={reduced}
          delayMs={1500}
          durationMs={1100}
          fromY={10}
          style={{
            fontFamily: BODY_FONT,
            fontSize: 11,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            opacity: 0.5,
            marginTop: 32,
            maxWidth: 320,
          }}
        >
          {names}
        </FadeUp>
      ) : null}
    </div>
  );
}
