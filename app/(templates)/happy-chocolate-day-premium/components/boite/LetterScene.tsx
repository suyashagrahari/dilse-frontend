"use client";

// Chapter IV: Notes from the chocolatier. The letter is the box's menu card: heavy cream stock, a double foil rule,
// the house name at the head. It sits tucked into a cacao sleeve with only its head showing; slide it up (or tap)
// and it comes out (paper-rustle + page-turn; visual twin: the card sliding free, the sleeve dropping away). The
// paragraphs then come up line by line as they read.

import { useRef, useState, type PointerEvent as RPE } from "react";
import { useReducedMotion } from "../../../_valentine/kit";
import { PremiumCTA, RevealText, usePremium } from "../../../_valentine/kit/premium";
import { paragraphs, type Boite } from "./util";

export function LetterScene({ b, letter, onDone }: { b: Boite; letter: string; onDone: () => void }) {
  const { sfx } = usePremium();
  const reduce = useReducedMotion();
  const [out, setOut] = useState(false);
  const [pull, setPull] = useState(0);
  const drag = useRef<{ y: number; id: number; moved: boolean } | null>(null);
  const paras = paragraphs(letter);
  const slide = () => {
    if (out) return;
    setOut(true);
    setPull(0);
    sfx("paper-rustle", { gain: 0.9 });
    sfx("page-turn", { at: 0.35, gain: 0.5 });
  };
  return (
    <section className={`lb-scene lb-letterScene${out ? " is-out" : ""}`} aria-label="Notes from the chocolatier">
      <header className="lb-head lb-headTight">
        <p className="lb-eyebrow">IV · Notes from the chocolatier</p>
      </header>
      <div className="lb-menuStage">
        <article
          className={`lb-menu${out ? " is-out" : ""}${reduce ? " is-reduced" : ""}`}
          style={{ ["--pull" as string]: pull }}
          onClick={slide}
          onPointerDown={(e: RPE) => {
            if (out) return;
            drag.current = { y: e.clientY, id: e.pointerId, moved: false };
          }}
          onPointerMove={(e: RPE) => {
            const d = drag.current;
            if (!d || d.id !== e.pointerId || out) return;
            if (Math.abs(d.y - e.clientY) > 6) d.moved = true;
            const p = Math.max(0, Math.min(1, (d.y - e.clientY) / 160));
            setPull(p);
            if (p > 0.6) {
              drag.current = null;
              slide();
            }
          }}
          onPointerUp={() => {
            drag.current = null;
            if (!out) setPull(0);
          }}
          onKeyDown={(e) => {
            if (!out && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              slide();
            }
          }}
          role={out ? undefined : "button"}
          tabIndex={out ? -1 : 0}
          aria-label={out ? undefined : `Slide out the menu card for ${b.to}`}
        >
          <div className="lb-menuHead">
            <p className="lb-menuHouse">{b.house}</p>
            <i className="lb-menuRule" aria-hidden />
            <p className="lb-menuFor">
              Notes for <em>{b.to}</em>
            </p>
          </div>
          {out && (
            <div className="lb-menuBody">
              {paras.map((t, k) => (
                <div key={k} className={`lb-menuP${k === 0 ? " is-first" : ""}`}>
                  <RevealText as="p" text={t} delay={k === 0 ? 0.6 : 0.1} stagger={0.08} />
                </div>
              ))}
              {b.signOff && <p className="lb-signOff">{b.signOff}</p>}
              <p className="lb-menuFoot">{b.since ? `${b.house} · Est. ${b.since}` : b.house}</p>
            </div>
          )}
        </article>
        <div className={`lb-sleeve${out ? " is-gone" : ""}`} aria-hidden>
          <i className="lb-lidGrain" />
          <p className="lb-sleeveMono">
            {b.monogram[0]}
            <em>&amp;</em>
            {b.monogram[1]}
          </p>
          <p className="lb-sleeveHint">Slide the card out</p>
        </div>
      </div>
      {out && (
        <footer className="lb-foot lb-footFlow">
          <PremiumCTA tone="gold" cue="chime" onClick={onDone}>
            One more thing
          </PremiumCTA>
        </footer>
      )}
    </section>
  );
}
