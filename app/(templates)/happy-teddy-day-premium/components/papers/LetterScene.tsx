"use client";

// Chapter IV · Enclosed with him. The sender's letter, folded in three on letterpress paper and tucked in the file.
// Tap: the folds open toward the reader (sfx paper-rustle, then a soft nib-scratch as the ink starts; visual twin:
// the panels swinging open, the first line inking in). Paragraphs reveal line by line as they scroll.

import { useState } from "react";
import { useReducedMotion } from "../../../_valentine/kit";
import { PremiumCTA, RevealText, usePremium } from "../../../_valentine/kit/premium";
import { paragraphs, type Papers } from "./util";

export function LetterScene({ p, n, letter, onDone }: { p: Papers; n: string; letter: string; onDone: () => void }) {
  const { sfx } = usePremium();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const paras = paragraphs(letter);
  const unfold = () => {
    if (open) return;
    setOpen(true);
    sfx("paper-rustle", { gain: 0.9 });
    sfx("page-turn", { at: 0.35, gain: 0.5 });
    sfx("nib-scratch", { at: 1.0, gain: 0.4 });
  };
  return (
    <section className={`ap-scene ap-letterScene${open ? " is-open" : ""}`} aria-label="The letter">
      <header className="ap-head ap-headTight">
        <p className="ap-eyebrow">{n} · Enclosed with him</p>
      </header>
      {!open ? (
        <div className="ap-folded">
          <button type="button" className={`ap-fold${reduce ? " is-reduced" : ""}`} onClick={unfold} aria-label={`Unfold the letter for ${p.to}`}>
            <span className="ap-foldPanel ap-foldTop" aria-hidden />
            <span className="ap-foldFace">
              <span className="ap-foldFor">A letter for</span>
              <span className="ap-foldName">{p.to}</span>
              <span className="ap-foldSeal" aria-hidden>
                {p.from.charAt(0).toUpperCase()}
              </span>
            </span>
          </button>
          <p className="ap-hint ap-pulse">Tap to unfold</p>
        </div>
      ) : (
        <>
          <article className={`ap-letter${reduce ? " is-reduced" : ""}`}>
            <i className="ap-crease ap-creaseA" aria-hidden />
            <i className="ap-crease ap-creaseB" aria-hidden />
            <p className="ap-letterMast">
              <span>File {p.serial}</span>
              <span>Enclosure 1</span>
            </p>
            {paras.map((t, k) => (
              <div key={k} className={`ap-letterP${k === 0 ? " is-first" : ""}`}>
                <RevealText as="p" text={t} delay={k === 0 ? 0.7 : 0.1} stagger={0.08} />
              </div>
            ))}
            {p.signOff && <p className="ap-signOff">{p.signOff}</p>}
          </article>
          <footer className="ap-foot ap-footFlow">
            <PremiumCTA tone="gold" cue="chime" onClick={onDone}>
              One more thing
            </PremiumCTA>
          </footer>
        </>
      )}
    </section>
  );
}
