"use client";

// Chapter IV · Schedule A, in my own words. The letter, set on the deed's
// ivory paper. At the foot of the page, like every page of a real deed, a
// box to initial: tap it and their initial is pen-written in, in ink.

import { useState } from "react";
import { haptic } from "../../../_valentine/kit";
import { PremiumCTA, sfx } from "../../../_valentine/kit/premium";
import { initialOf, type Deed } from "./model";
import { CTA_STYLE, Eyebrow, Scene } from "./ui";

export default function LetterScene({ d, letter, onNext }: { d: Deed; letter: string; onNext: () => void }) {
  const [initialled, setInitialled] = useState(false);
  const paras = letter
    .split(/\n\s*\n|\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  const initial = () => {
    if (initialled) return;
    setInitialled(true);
    sfx("sp-initial", { gain: 1 });
    haptic([8, 30, 8]);
  };
  return (
    <Scene label="Schedule A: the letter" className="sp-lt">
      <Eyebrow>Schedule A · In my own words</Eyebrow>
      <article className="sp-ltPage sp-paper sp-rise">
        <p className="sp-ltDear">Dear {d.recipient},</p>
        {paras.map((p, k) => (
          <p key={k} className="sp-ltP">
            {p}
          </p>
        ))}
        <p className="sp-ltSign">
          Yours, under oath,
          <br />
          <span>{d.sender}</span>
        </p>
        <div className="sp-ltFoot">
          <span className="sp-ltPg sp-typed">Page 2 of 3</span>
          <button type="button" className={`sp-ltBox${initialled ? " is-done" : ""}`} onClick={initial} aria-label={initialled ? "Initialled" : "Tap to initial this page"} aria-pressed={initialled}>
            <span className="sp-ltBoxLbl">{initialled ? "Initialled" : "Initial here"}</span>
            <svg viewBox="0 0 80 50" className="sp-ltInk" aria-hidden>
              <text x="40" y="36" textAnchor="middle" className="sp-ltInkTx">
                {initialOf(d.recipient)}.
              </text>
              <path d="M14 42 C 30 38, 50 46, 68 38" className="sp-ltInkSw" />
            </svg>
          </button>
        </div>
      </article>
      <div className="sp-foot">
        <PremiumCTA style={CTA_STYLE} tone="pearl" cue="page-turn" onClick={onNext} disabled={!initialled}>
          {initialled ? "Proceed" : "Initial the page first"}
        </PremiumCTA>
      </div>
      <style>{CSS}</style>
    </Scene>
  );
}

const CSS = `
.sp-lt .sp-in { gap: 18px; }
.sp-ltPage { width: min(620px, 100%); box-sizing: border-box; padding: clamp(26px, 7vw, 56px) clamp(22px, 7vw, 60px) 26px; text-align: left; transform: rotate(-.4deg); }
.sp-ltDear { margin: 0 0 18px; font: italic 500 22px/1.2 var(--sp-serif); color: var(--sp-navy); }
.sp-ltP { margin: 0 0 1em; font: 400 clamp(18px, 4.8vw, 20px)/1.55 var(--sp-serif); color: #23293f; font-feature-settings: "liga", "onum"; text-wrap: pretty; hanging-punctuation: first; }
.sp-ltSign { margin: 26px 0 0; font: italic 400 16px/1.4 var(--sp-serif); color: rgba(28,37,65,.75); }
.sp-ltSign span { display: inline-block; margin-top: 4px; font: italic 500 30px/1 var(--sp-serif); color: var(--sp-navy); }
.sp-ltFoot { margin-top: 26px; padding-top: 14px; border-top: 1px solid rgba(28,37,65,.16); display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.sp-ltPg { font-size: 10.5px; letter-spacing: .2em; text-transform: uppercase; opacity: .6; }
.sp-ltBox { all: unset; cursor: pointer; position: relative; width: 108px; height: 64px; border: 1.5px dashed rgba(110,20,35,.55); border-radius: 4px; display: grid; place-items: center; -webkit-tap-highlight-color: transparent;
  animation: sp-boxPulse 2.2s ease-in-out infinite; }
.sp-ltBox:focus-visible { outline: 3px solid var(--sp-gold); outline-offset: 3px; }
.sp-ltBox.is-done { border-style: solid; border-color: rgba(28,37,65,.25); animation: none; }
@keyframes sp-boxPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(110,20,35,0); } 50% { box-shadow: 0 0 0 6px rgba(110,20,35,.08); } }
.sp-ltBoxLbl { position: absolute; top: -8px; left: 8px; padding: 0 5px; background: #F2EADA; font: 700 8.5px/1.2 var(--sp-type); letter-spacing: .22em; text-transform: uppercase; color: var(--sp-ox); }
.sp-ltInk { width: 86px; height: 54px; overflow: visible; }
.sp-ltInkTx { font: italic 500 36px var(--sp-serif); fill: var(--sp-navy); fill-opacity: 0; stroke: var(--sp-navy); stroke-width: .8; stroke-dasharray: 200; stroke-dashoffset: 200; }
.sp-ltInkSw { fill: none; stroke: var(--sp-navy); stroke-width: 1.8; stroke-linecap: round; stroke-dasharray: 80; stroke-dashoffset: 80; }
.sp-ltBox.is-done .sp-ltInkTx { animation: sp-ink .6s ease forwards, sp-inkfill .3s ease .45s forwards; }
.sp-ltBox.is-done .sp-ltInkSw { animation: sp-ink .3s ease .5s forwards; }
@media (prefers-reduced-motion: reduce) { .sp-ltBox { animation: none; } .sp-ltBox.is-done .sp-ltInkTx { animation: none; fill-opacity: 1; stroke-dashoffset: 0; } .sp-ltBox.is-done .sp-ltInkSw { animation: none; stroke-dashoffset: 0; } }
`;
