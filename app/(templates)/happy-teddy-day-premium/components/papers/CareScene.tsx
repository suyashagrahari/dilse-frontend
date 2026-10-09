"use client";

// Chapter III · Care instructions. A stack of woven satin care labels (powder blue, stitched edge, a laundry-style
// care symbol). Tap a label: it flips in 3D to its love-note instruction (sfx swoosh-soft + tick; visual twin: the
// flip). Tap again: it slides off and the next label is on top (sfx paper-rustle). 3–5 labels.

import { useState } from "react";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import { PremiumCTA, RevealText, usePremium } from "../../../_valentine/kit/premium";

/** Laundry-label glyphs, icon-sized strokes (24×24). Each holds a tiny heart. */
const GLYPHS = [
  // wash tub
  "M3 7l2 12h14l2-12M3 7c2 1.4 4 1.4 6 0s4-1.4 6 0 4 1.4 6 0M12 15.5l-2-2a1.3 1.3 0 0 1 2-1.6 1.3 1.3 0 0 1 2 1.6z",
  // iron
  "M4 18h16c0-5-3-9-9-9H8M4 18l2-6M12 15.5l-1.6-1.6a1.1 1.1 0 0 1 1.6-1.4 1.1 1.1 0 0 1 1.6 1.4z",
  // tumble dry (circle in a square)
  "M4 4h16v16H4zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM12 14l-1.5-1.5a1 1 0 0 1 1.5-1.3 1 1 0 0 1 1.5 1.3z",
  // hand wash
  "M3 7l2 12h14l2-12M8 13V9.5a1 1 0 0 1 2 0V12M10 12V8.5a1 1 0 0 1 2 0V12M12 12V9a1 1 0 0 1 2 0v3M14 12v-1.5a1 1 0 0 1 2 0V14c0 2-1.5 3-3.5 3S9 16 8 14.5L6.8 12.6a1 1 0 0 1 1.6-1.1L9 12",
  // triangle
  "M12 4l9 16H3zM12 15.5l-1.7-1.7a1.15 1.15 0 0 1 1.7-1.5 1.15 1.15 0 0 1 1.7 1.5z",
];

export function Glyph({ k, size = 34 }: { k: number; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={GLYPHS[k % GLYPHS.length]} />
    </svg>
  );
}

export function CareScene({ care, n, teddy, from, onNext }: { care: string[]; n: string; teddy: string; from: string; onNext: () => void }) {
  const { sfx } = usePremium();
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const total = care.length;
  const done = i >= total - 1 && flipped;

  const tap = () => {
    if (leaving) return;
    if (!flipped) {
      setFlipped(true);
      sfx("swoosh-soft", { gain: 0.45 });
      sfx("tick", { at: 0.32, gain: 0.5 });
      haptic(10);
      return;
    }
    if (i >= total - 1) return;
    setLeaving(true);
    sfx("paper-rustle", { gain: 0.5 });
    window.setTimeout(
      () => {
        setI((k) => k + 1);
        setFlipped(false);
        setLeaving(false);
      },
      reduce ? 100 : 520,
    );
  };

  return (
    <section className="ap-scene ap-care" aria-label="Care instructions">
      <header className="ap-head">
        <p className="ap-eyebrow">{n} · Care instructions</p>
        <RevealText as="h2" text={`How to look after ${teddy}.`} className="ap-display ap-displaySm" delay={0.25} />
      </header>

      <div className="ap-labels">
        {care.map((line, k) => {
          if (k < i || k > i + 2) return null;
          const depth = k - i;
          const top = depth === 0;
          return (
            <button
              key={k}
              type="button"
              className={`ap-label${top && flipped ? " is-flipped" : ""}${top && leaving ? " is-leaving" : ""}${top ? " is-top" : ""}`}
              style={{ zIndex: 5 - depth, ["--d" as string]: depth, ["--tilt" as string]: `${k % 2 ? 1.6 : -1.4}deg` }}
              onClick={top ? tap : undefined}
              tabIndex={top ? 0 : -1}
              aria-hidden={!top}
              aria-label={top ? (flipped ? `Instruction ${k + 1}: ${line}${i < total - 1 ? ". Tap for the next one" : ""}` : `Care label ${k + 1} of ${total}. Tap to read`) : undefined}
            >
              <span className="ap-labelInner">
                <span className="ap-labelFront">
                  <span className="ap-labelHead">Care label</span>
                  <Glyph k={k} size={56} />
                  <span className="ap-labelNo">
                    No. {k + 1} <em>of {total}</em>
                  </span>
                  <span className="ap-labelFibre">100% soft · hand-made by {from}</span>
                </span>
                <span className="ap-labelBack">
                  <span className="ap-labelGlyph">
                    <Glyph k={k} size={26} />
                  </span>
                  <span className="ap-labelLine">{line}</span>
                  <span className="ap-labelNo">
                    {k + 1} / {total}
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <footer className="ap-foot">
        {done ? (
          <PremiumCTA tone="gold" cue="page-turn" onClick={onNext}>
            Noted. All of it.
          </PremiumCTA>
        ) : (
          <p className="ap-hint">{flipped ? "Tap for the next label" : "Tap the label to read it"}</p>
        )}
      </footer>
    </section>
  );
}
