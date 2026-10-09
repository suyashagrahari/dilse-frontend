"use client";

// Chapter 5: the letter. A folded note, warm from the hug, waits with their name on it. Tap it: it unfolds (two
// panels swing open in 3D, paper rustle) and the paragraphs ink in one after another. Long letters scroll inside the
// scene. The song sits a little lower here (the root fades it where the platform can).

import { useState } from "react";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import { PremiumCTA, sfx } from "../../../_valentine/kit/premium";
import type { Hug } from "./model";
import { CTA_STYLE, Eyebrow, Scene } from "./ui";

export default function LetterScene({ h, letter, nextLabel, onNext }: { h: Hug; letter: string; nextLabel: string; onNext: () => void }) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const paras = letter.split(/\n\s*\n|\n/).map((s) => s.trim()).filter(Boolean);

  const unfold = () => {
    if (open) return;
    setOpen(true);
    sfx("paper-rustle", { gain: 0.7 });
    window.setTimeout(() => sfx("paper-rustle", { gain: 0.45, detune: 300 }), reduce ? 0 : 380);
    haptic(10);
  };

  return (
    <Scene label="The letter" className={`hh-light hh-letterScene${open ? " is-open" : ""}`}>
      <Eyebrow>{open ? `From ${h.from}` : "Still warm"}</Eyebrow>
      {!open ? (
        <>
          <h2 className="hh-h hh-letterAsk hh-rise">
            Something I wanted to say <em>while I had you.</em>
          </h2>
          <button type="button" className="hh-note" onClick={unfold} aria-label={`Unfold the letter for ${h.to}`}>
            <span className="hh-noteFlap" aria-hidden />
            <span className="hh-noteFor">For {h.to}</span>
            <span className="hh-noteTap" aria-hidden>Tap to unfold</span>
          </button>
          <div className="hh-foot" />
        </>
      ) : (
        <>
          <article className="hh-paper">
            <i className="hh-paperCrease" aria-hidden />
            {paras.map((t, i) => (
              <p key={i} className="hh-para" style={{ animationDelay: reduce ? "0s" : `${0.5 + i * 0.45}s` }}>
                {t}
              </p>
            ))}
            <p className="hh-sign" style={{ animationDelay: reduce ? "0s" : `${0.6 + paras.length * 0.45}s` }}>
              — {h.from}
            </p>
          </article>
          <div className="hh-foot hh-rise" style={{ animationDelay: reduce ? "0s" : `${1 + paras.length * 0.45}s` }}>
            <PremiumCTA style={CTA_STYLE} tone="ember" cue="tick" onClick={onNext}>
              {nextLabel}
            </PremiumCTA>
          </div>
        </>
      )}
      <style>{CSS}</style>
    </Scene>
  );
}

const CSS = `
.hh-letterScene .hh-in { gap: 22px; }
.hh-letterAsk { font-size: clamp(38px, 10.6vw, 72px); max-width: 12ch; margin-top: 10px; }
.hh-note { all: unset; position: relative; cursor: pointer; display: grid; place-items: center; align-content: center; gap: 10px; box-sizing: border-box; margin-top: 12px;
  width: min(300px, 74vw); aspect-ratio: 1.42; border-radius: 4px; -webkit-tap-highlight-color: transparent; transform: rotate(-2deg);
  background: linear-gradient(170deg, #FFFDF9, #F3EBDF); box-shadow: 0 34px 60px -30px rgba(75,52,38,.7), 0 2px 6px rgba(75,52,38,.15), inset 0 0 0 1px rgba(75,52,38,.06);
  animation: hh-noteIn 1.2s var(--hh-ease) both, hh-noteBob 4.6s 1.2s ease-in-out infinite; }
.hh-note:focus-visible { outline: 3px solid var(--hh-apricot-deep); outline-offset: 6px; }
.hh-noteFlap { position: absolute; left: 0; right: 0; top: 0; height: 50%; border-bottom: 1px solid rgba(75,52,38,.12);
  background: linear-gradient(180deg, rgba(255,255,255,.7), rgba(234,219,200,.35)); border-radius: 4px 4px 0 0; }
.hh-noteFor { position: relative; font: 400 34px/1 var(--hh-display); font-style: italic; color: var(--hh-cocoa); }
.hh-noteTap { position: relative; font: 700 10px/1 var(--hh-ui); letter-spacing: .3em; text-transform: uppercase; color: var(--hh-apricot-deep); }
@keyframes hh-noteIn { from { opacity: 0; transform: translateY(30px) rotate(-6deg); } to { opacity: 1; transform: rotate(-2deg); } }
@keyframes hh-noteBob { 0%, 100% { transform: rotate(-2deg) translateY(0); } 50% { transform: rotate(-1deg) translateY(-6px); } }
.hh-paper { position: relative; width: min(600px, 100%); box-sizing: border-box; padding: clamp(28px, 7vw, 56px) clamp(22px, 6vw, 56px); text-align: left; border-radius: 3px;
  background: linear-gradient(175deg, #FFFDF9 0%, #FAF5EC 60%, #F3EBDF 100%); color: var(--hh-cocoa);
  box-shadow: 0 40px 80px -40px rgba(75,52,38,.75), 0 2px 8px rgba(75,52,38,.12), inset 0 0 0 1px rgba(75,52,38,.05);
  transform-origin: 50% 0; animation: hh-unfold 1.1s var(--hh-ease) both; }
.hh-paperCrease { position: absolute; left: 0; right: 0; top: 50%; height: 1px; background: linear-gradient(90deg, transparent, rgba(75,52,38,.12), transparent); }
@keyframes hh-unfold { 0% { opacity: 0; transform: perspective(900px) rotateX(-70deg) scaleY(.4); } 60% { opacity: 1; } 100% { transform: none; } }
.hh-para { margin: 0 0 1.05em; font: 400 clamp(19px, 5.1vw, 23px)/1.5 var(--hh-display); letter-spacing: .003em; text-wrap: pretty; opacity: 0; animation: hh-ink 1.2s var(--hh-ease) both; }
.hh-para:first-of-type { font-style: italic; font-size: clamp(24px, 6.4vw, 30px); }
.hh-sign { margin: 1.2em 0 0; font: 400 28px/1 var(--hh-display); font-style: italic; color: var(--hh-apricot-deep); text-align: right; opacity: 0; animation: hh-ink 1.2s var(--hh-ease) both; }
@keyframes hh-ink { from { opacity: 0; transform: translateY(8px); filter: blur(5px); } to { opacity: 1; transform: none; filter: blur(0); } }
@media (min-width: 1024px) { .hh-letterScene .hh-in { padding-top: calc(max(var(--vw-top-space, 0px), 12px) + 84px); } }
@media (prefers-reduced-motion: reduce) { .hh-note { animation: hh-fade .3s ease both; } .hh-paper { animation: hh-fade .3s ease both; } .hh-para, .hh-sign { animation: hh-fade .3s ease both; } }
`;
