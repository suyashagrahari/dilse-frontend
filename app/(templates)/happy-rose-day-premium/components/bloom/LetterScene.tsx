"use client";

// Chapter IV: The letter. A sheet of cream paper lies tilted away on the dark, a pressed petal under the fold
// line and their name on it. Tap (or swipe up) and it rises to face them (sfx paper-rustle + a soft nib-scratch;
// visual twin: the sheet lifting, the ink starting). Paragraphs then come up line by line as they scroll.
// The pressed petals are the rose's own velvet in the petal mask, at watermark strength.

import { useState } from "react";
import { useReducedMotion } from "../../../_valentine/kit";
import { PremiumCTA, RevealText, usePremium } from "../../../_valentine/kit/premium";
import { paragraphs, SHADES, type Bloom } from "./util";

export function LetterScene({ b, letter, onDone }: { b: Bloom; letter: string; onDone: () => void }) {
  const { sfx } = usePremium();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const paras = paragraphs(letter);
  const shade = SHADES[b.color];
  const raise = () => {
    if (open) return;
    setOpen(true);
    sfx("paper-rustle", { gain: 0.9 });
    sfx("nib-scratch", { at: 0.9, gain: 0.45 });
  };
  return (
    <section className={`rb-scene rb-letterScene${open ? " is-open" : ""}`} aria-label="The letter">
      <header className="rb-head rb-headTight">
        <p className="rb-eyebrow">IV · The letter</p>
      </header>
      <div className="rb-letterStage" style={{ ["--deep" as string]: shade.deep, ["--base" as string]: shade.base, ["--light" as string]: shade.light }}>
        <article
          className={`rb-letter${open ? " is-open" : ""}${reduce ? " is-reduced" : ""}`}
          onClick={raise}
          onKeyDown={(e) => {
            if (!open && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              raise();
            }
          }}
          role={open ? undefined : "button"}
          tabIndex={open ? -1 : 0}
          aria-label={open ? undefined : `Open the letter for ${b.to}`}
        >
          <i className="rb-pressed rb-pressedA" aria-hidden />
          <i className="rb-pressed rb-pressedB" aria-hidden />
          {!open ? (
            <div className="rb-letterCover">
              <p className="rb-letterFor">for</p>
              <p className="rb-letterName">{b.to}</p>
              <p className="rb-letterTap">Tap to unfold</p>
            </div>
          ) : (
            <div className="rb-letterBody">
              {paras.map((t, k) => (
                <div key={k} className={`rb-letterP${k === 0 ? " is-first" : ""}`}>
                  <RevealText as="p" text={t} delay={k === 0 ? 0.5 : 0.1} stagger={0.09} />
                </div>
              ))}
              {b.shayari && <p className="rb-shayari">{b.shayari}</p>}
              {b.signOff && <p className="rb-signOff">{b.signOff}</p>}
            </div>
          )}
        </article>
      </div>
      {open && (
        <footer className="rb-foot rb-footFlow">
          <PremiumCTA tone="gold" cue="chime" onClick={onDone}>
            One more thing
          </PremiumCTA>
        </footer>
      )}
    </section>
  );
}
