"use client";

// Chapter V · The Letter. Dark until they hold to light the candle
// (match-strike → flame-whoosh, the room warms). Then the parchment rises:
// "Dear {name}," the sender's letter, their name, and under it a sealed
// P.S. — break the oxblood wax (wax-crack) to read it.

import { useMemo, useState } from "react";
import { Fluent3D, HoldToReveal, PremiumCTA, sfx, usePremium } from "../../../_valentine/kit/premium";
import { haptic } from "../../../_valentine/kit";
import type { Night } from "./model";
import { Eyebrow } from "./ui";
import { BODY, DISPLAY } from "./fonts";

export default function Letter({ n, letter, onNext }: { n: Night; letter: string; onNext: () => void }) {
  const p = usePremium();
  const [lit, setLit] = useState(false);
  const [psOpen, setPsOpen] = useState(false);
  const paras = useMemo(() => letter.split(/\n{1,}/).map((s) => s.trim()).filter(Boolean), [letter]);
  const ps = (p.premium.psLetter || "").trim();
  const [psHead, ...psRest] = ps.split(/\n+/);
  const psBody = psRest.join("\n").trim();
  const initial = (n.sender || n.recipient || "✦").trim().charAt(0).toUpperCase();

  const light = () => {
    setLit(true);
    haptic(16);
    sfx("match-strike", { gain: 0.7 });
    sfx("flame-whoosh", { gain: 0.5, at: 0.25 });
    sfx("paper-rustle", { gain: 0.4, at: 0.9 });
  };
  const breakSeal = () => {
    if (psOpen) return;
    setPsOpen(true);
    haptic(18);
    sfx("wax-crack", { gain: 0.8 });
  };

  return (
    <div className={`nm-scene nm-letter${lit ? " is-lit" : ""}`}>
      <div className="nm-warm" aria-hidden />
      <header style={{ display: "grid", justifyItems: "center", gap: 10, position: "relative" }}>
        <Eyebrow n="V">The Letter</Eyebrow>
        {!lit && <p className="nm-sub" style={{ fontSize: 17 }}>It&rsquo;s too dark to read.</p>}
      </header>

      {!lit ? (
        <div style={{ margin: "auto 0", display: "grid", justifyItems: "center", position: "relative" }}>
          <HoldToReveal label="Hold to light the candle" tone="ember" cue="tick" size={132} onComplete={light}>
            <Fluent3D name="candle" size={78} float={false} shadow={false} />
          </HoldToReveal>
        </div>
      ) : (
        <article className="nm-parch nm-scroll" aria-label="The letter">
          <span className="nm-drip" style={{ left: "16%", height: 30 }} aria-hidden />
          <span className="nm-drip" style={{ left: "22%", height: 18 }} aria-hidden />
          <span className="nm-drip" style={{ left: "81%", height: 24 }} aria-hidden />
          <p className="nm-dear">Dear {n.recipient},</p>
          {paras.map((t, i) => (
            <p key={i} className="nm-para" style={{ animationDelay: `${0.5 + i * 0.25}s` }}>
              {t}
            </p>
          ))}
          {n.sender && <p className="nm-sign">{n.sender}</p>}

          {ps && (
            <div className={`nm-ps${psOpen ? " is-open" : ""}`}>
              <button type="button" className="nm-wax" onClick={breakSeal} aria-label={psOpen ? "The seal is broken" : `Break the seal: ${psHead}`} aria-expanded={psOpen}>
                <span className="nm-waxL" aria-hidden>{initial}</span>
                <span className="nm-waxR" aria-hidden>{initial}</span>
              </button>
              <p className="nm-psHead">{psOpen ? "P.S." : psHead}</p>
              {psOpen && <p className="nm-psBody">{psBody || psHead}</p>}
            </div>
          )}
        </article>
      )}

      <div className="nm-foot" style={{ position: "relative" }}>
        {lit && (
          <PremiumCTA tone="ember" cue="whoosh" onClick={onNext}>
            One portrait is left
          </PremiumCTA>
        )}
      </div>
      <style>{LETTER_CSS}</style>
    </div>
  );
}

const PAPER_NOISE =
  "url(\"data:image/svg+xml;utf8," +
  encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .35  0 0 0 0 .25  0 0 0 0 .15  0 0 0 .22 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>") +
  "\")";

const LETTER_CSS = `
.nm-warm { position: absolute; inset: 0; pointer-events: none; opacity: 0; transition: opacity 2.2s ease;
  background: radial-gradient(70% 55% at 50% 58%, rgba(242,179,91,.30), rgba(224,120,47,.08) 50%, transparent 75%); }
.nm-letter.is-lit .nm-warm { opacity: 1; }
.nm-parch { position: relative; width: min(100%, 540px); flex: 1 1 auto; min-height: 0; margin-top: 18px; box-sizing: border-box;
  padding: 34px clamp(22px, 6vw, 44px) 40px; color: #2a1712; border-radius: 3px;
  background: ${PAPER_NOISE}, radial-gradient(120% 80% at 50% 30%, #f3ead6 0%, #e8dfcc 55%, #d4c39f 100%);
  box-shadow: inset 0 0 70px rgba(120,80,30,.35), inset 0 0 0 1px rgba(120,80,30,.25), 0 40px 70px -30px #000, 0 0 90px -30px rgba(242,179,91,.5);
  animation: nm-rise 1.4s cubic-bezier(.22,1,.36,1) backwards; scrollbar-width: thin; scrollbar-color: rgba(92,26,27,.5) transparent; }
@keyframes nm-rise { from { opacity: 0; transform: translateY(40px) scale(.97); } }
.nm-drip { position: absolute; top: 0; width: 9px; border-radius: 0 0 6px 6px; background: linear-gradient(90deg, #4a1213, #7c2a28 45%, #4a1213);
  box-shadow: inset 0 -3px 3px rgba(255,150,130,.25); }
.nm-drip::after { content: ""; position: absolute; left: -1px; bottom: -5px; width: 11px; height: 11px; border-radius: 50%; background: radial-gradient(circle at 40% 35%, #9a3a35, #4a1213 70%); }
.nm-dear { margin: 6px 0 18px; font: 400 clamp(24px, 6.6vw, 30px)/1.1 ${DISPLAY}; color: #5C1A1B; }
.nm-para { margin: 0 0 14px; font: 400 clamp(17px, 4.5vw, 19px)/1.62 ${BODY}; font-feature-settings: "liga","onum"; color: #2a1712; hanging-punctuation: first;
  animation: nm-ink 1.2s ease backwards; }
@keyframes nm-ink { from { opacity: 0; filter: blur(3px); } }
.nm-sign { margin: 18px 0 0; text-align: right; font: italic 400 26px/1 ${BODY}; color: #5C1A1B; }
.nm-sign::before { content: "— "; }
.nm-ps { display: grid; justify-items: center; gap: 10px; margin-top: 34px; padding-top: 26px; border-top: 1px dashed rgba(92,26,27,.35); text-align: center; }
.nm-wax { all: unset; position: relative; width: 64px; height: 64px; cursor: pointer; -webkit-tap-highlight-color: transparent; }
.nm-wax:focus-visible { outline: 2px solid #5C1A1B; outline-offset: 4px; border-radius: 50%; }
.nm-waxL, .nm-waxR { position: absolute; inset: 0; display: grid; place-items: center; border-radius: 47% 53% 50% 50% / 52% 48% 52% 48%;
  font: 400 30px/1 ${DISPLAY}; color: rgba(40,6,8,.55); text-shadow: 0 1px 0 rgba(255,170,150,.35);
  background: radial-gradient(circle at 38% 32%, #b0423b, #7a2422 45%, #4a1213 80%);
  box-shadow: inset 0 -4px 6px rgba(0,0,0,.35), inset 0 3px 4px rgba(255,170,150,.3), 0 6px 12px -4px rgba(0,0,0,.5);
  transition: transform .7s cubic-bezier(.22,1,.36,1), opacity .7s ease .2s; }
.nm-waxL { clip-path: polygon(0 0, 54% 0, 44% 38%, 56% 62%, 46% 100%, 0 100%); }
.nm-waxR { clip-path: polygon(54% 0, 100% 0, 100% 100%, 46% 100%, 56% 62%, 44% 38%); }
.nm-ps:not(.is-open) .nm-wax { animation: nm-waxPulse 2.4s ease-in-out infinite; }
@keyframes nm-waxPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.06); } }
.nm-ps.is-open .nm-waxL { transform: translate(-14px, 6px) rotate(-18deg); opacity: 0; }
.nm-ps.is-open .nm-waxR { transform: translate(14px, 8px) rotate(16deg); opacity: 0; }
.nm-psHead { margin: 0; font: italic 400 18px/1.3 ${BODY}; color: #5C1A1B; }
.nm-psBody { margin: 0; font: 400 17px/1.6 ${BODY}; color: #2a1712; white-space: pre-line; animation: nm-ink 1.2s ease backwards; }
@media (prefers-reduced-motion: reduce) { .nm-parch, .nm-para, .nm-psBody { animation: nm-fade .3s ease backwards; } .nm-ps:not(.is-open) .nm-wax { animation: none; } }
`;
