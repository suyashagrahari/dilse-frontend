"use client";

import { useState } from "react";

import { sfxChoiceCommit, sfxChoiceHover } from "./loveflixAudio";
import {
  ACCENT,
  ACCENT_GRAD,
  BG,
  BG_RAISED,
  CARD_RADIUS,
  FONT_BODY,
  FONT_DISPLAY,
  HAIRLINE,
  TEXT,
} from "./theme";
import type { Choice } from "./types";

// The signature element of the template: two options, a shared countdown, and
// no wrong answer.
//
// NO CHOICE IS EVER "WRONG". Both buttons are styled identically — same fill,
// same weight, same border, same order-neutral labelling. There is no red, no
// warning affordance, no "safe vs risky" framing, and no visual hint that one
// route is better than the other. Every path converges on the same finale, so
// suggesting otherwise would be a lie told by the CSS.
//
// The countdown is ONE continuous bar spanning BOTH buttons, draining right to
// left: the fill is anchored at the left edge of the pair and its right end
// recedes as time runs out. It is not two independent bars. A small numeral
// counts down beside it, and under reduced motion that numeral becomes the
// primary signal, so it is set larger.

export interface ChoiceBarProps {
  choices: Choice[];
  /** 0..1, drains right to left across both buttons in the accent colour. */
  remainingFraction: number;
  /** Whole seconds left, shown as a small numeral beside the bar. */
  secondsLeft: number;
  /** Index of the button currently committed, or null while still choosing. */
  committedIndex: number | null;
  onChoose: (index: number) => void;
  reducedMotion: boolean;
}

export default function ChoiceBar({
  choices,
  remainingFraction,
  secondsLeft,
  committedIndex,
  onChoose,
  reducedMotion,
}: ChoiceBarProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  if (choices.length === 0) return null;

  const committed = committedIndex !== null;
  const pct = Math.max(0, Math.min(1, remainingFraction)) * 100;

  return (
    <div
      role="group"
      aria-label="Choose what happens next. A countdown is running; if it runs out, one option is picked for you and the story continues."
      style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}
    >
      {/* One continuous countdown spanning the pair. Driven frame-by-frame from
          the timer hook, so it carries no CSS transition of its own — under
          reduced motion it therefore already updates without easing. */}
      <div aria-hidden style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            position: "relative",
            flex: 1,
            height: 4,
            borderRadius: 2,
            background: "rgba(255,255,255,0.10)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: `${pct}%`,
              background: ACCENT,
              opacity: committed ? 0.3 : 1,
            }}
          />
        </div>
        <span
          style={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 600,
            fontSize: reducedMotion ? 26 : 18,
            lineHeight: 1,
            letterSpacing: "0.02em",
            fontVariantNumeric: "tabular-nums",
            color: ACCENT,
            opacity: committed ? 0.35 : 1,
            minWidth: "2ch",
            textAlign: "right",
          }}
        >
          {Math.max(0, secondsLeft)}
        </span>
      </div>

      {/* flex-basis does the responsive work with no media query: at 380px the
          pair cannot fit and stacks; on a laptop they sit side by side. */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, width: "100%" }}>
        {choices.map((choice, i) => {
          const isChosen = committedIndex === i;
          const isDropped = committed && !isChosen;
          const lift = !reducedMotion && !committed && hovered === i;

          return (
            <button
              key={`${choice.nextSceneId}-${i}`}
              type="button"
              disabled={committed}
              aria-label={`Option ${i + 1} of ${choices.length}: ${choice.label}`}
              onPointerEnter={(e) => {
                if (committed) return;
                setHovered(i);
                if (e.pointerType === "mouse") sfxChoiceHover();
              }}
              onPointerLeave={() => setHovered((h) => (h === i ? null : h))}
              onClick={() => {
                if (committed) return;
                sfxChoiceCommit();
                onChoose(i);
              }}
              style={{
                flex: "1 1 240px",
                minWidth: 0,
                minHeight: 56,
                padding: "14px 16px",
                borderRadius: CARD_RADIUS,
                border: `1px solid ${isChosen ? "transparent" : HAIRLINE}`,
                background: isChosen ? ACCENT_GRAD : BG_RAISED,
                color: isChosen ? BG : TEXT,
                opacity: isDropped ? 0.24 : 1,
                fontFamily: FONT_BODY,
                fontSize: 15,
                fontWeight: isChosen ? 600 : 500,
                lineHeight: 1.35,
                textAlign: "left",
                cursor: committed ? "default" : "pointer",
                pointerEvents: committed ? "none" : "auto",
                transform: lift ? "scale(1.02)" : "none",
                // Reduced motion: the committed state is an instant change and
                // hover does nothing. The mechanic itself is untouched.
                transition: reducedMotion
                  ? "none"
                  : "transform 200ms ease, opacity 220ms ease, background 220ms ease, border-color 200ms ease",
                WebkitTapHighlightColor: "transparent",
                appearance: "none",
              }}
            >
              {choice.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
