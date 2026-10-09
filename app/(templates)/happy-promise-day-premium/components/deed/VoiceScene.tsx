"use client";

// Chapter V · The sworn statement. Their last photo fills the screen, graded
// warm and dimmed like a film still; over it, the sender's voice note. No
// voice note: the caption is typed out big, as the statement itself.

import { useEffect, useState } from "react";
import { useReducedMotion } from "../../../_valentine/kit";
import { CinematicPhoto, PremiumCTA, VoiceNotePlayer, sfx, usePremium } from "../../../_valentine/kit/premium";
import type { Deed } from "./model";
import { CTA_STYLE, Eyebrow, Scene } from "./ui";

function useTyped(text: string, on: boolean) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!on || reduce || n >= text.length) return;
    const ch = text[n];
    const t = window.setTimeout(() => {
      if (ch !== " " && n % 2 === 0) sfx("sp-key", { gain: 0.42, detune: (Math.random() - 0.5) * 300 });
      setN((v) => v + 1);
    }, /[,.;!?]/.test(ch) ? 160 : 42);
    return () => window.clearTimeout(t);
  }, [n, text, on, reduce]);
  return reduce ? text.length : n;
}

export default function VoiceScene({ d, onNext }: { d: Deed; onNext: () => void }) {
  const { premium } = usePremium();
  const hasVoice = !!premium.voiceNote;
  const caption = premium.voiceCaption || "";
  const n = useTyped(caption, !hasVoice);
  const bg = d.photos[d.photos.length - 1];
  return (
    <Scene label="A sworn statement" className="sp-vo">
      {bg && (
        <div className="sp-voBg" aria-hidden>
          <CinematicPhoto photo={bg} frame="full" grade="warm" kenBurns="in" drift={22} focusPull={false} caption="" aspect="auto" style={{ height: "100%" }} />
        </div>
      )}
      <div className="sp-voIn">
        <Eyebrow>Sworn statement of {d.sender}</Eyebrow>
        {hasVoice ? (
          <>
            <h2 className="sp-h sp-voH">
              In {d.sender}&rsquo;s <em>own voice.</em>
            </h2>
            <VoiceNotePlayer accent="#E9D7A8" track="rgba(245,239,226,.8)" className="sp-vn" />
          </>
        ) : (
          <blockquote className="sp-voQuote" aria-label={caption}>
            <span aria-hidden>
              “{caption.slice(0, n)}
              {n >= caption.length ? "”" : <i className="sp-caret" />}
            </span>
          </blockquote>
        )}
      </div>
      <div className="sp-foot">
        <PremiumCTA style={CTA_STYLE} tone="pearl" cue="page-turn" onClick={onNext}>
          To the signatures
        </PremiumCTA>
      </div>
      <style>{CSS}</style>
    </Scene>
  );
}

const CSS = `
.sp-voBg { position: absolute; inset: 0; z-index: 0; }
.sp-vo .sp-in > :not(.sp-voBg) { position: relative; z-index: 1; }
.sp-voBg::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(13,8,6,.6) 0%, rgba(13,8,6,.2) 34%, rgba(13,8,6,.78) 68%, #0d0806 100%); }
.sp-vo .sp-in { justify-content: flex-end; }
.sp-voIn { display: grid; justify-items: center; gap: 18px; margin-top: auto; width: 100%; max-width: 560px; }
.sp-voH { font-size: clamp(38px, 11vw, 74px); font-style: normal; max-width: 11ch; }
.sp-voQuote { margin: 0; font: 400 clamp(21px, 5.6vw, 34px)/1.4 var(--sp-type); color: var(--sp-ivory); max-width: 20ch; text-wrap: balance; text-shadow: 0 2px 18px rgba(0,0,0,.6); min-height: 4em; }
.sp-voQuote .sp-caret { background: #E9D7A8; }
.sp-vn.pm-vn { background: rgba(20,12,8,.6); border: 1px solid rgba(233,215,168,.22); color: var(--sp-ivory); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); border-radius: 18px; }
.sp-vn .pm-vnBtn { color: #1a1008; box-shadow: 0 8px 22px -8px rgba(0,0,0,.8), inset 0 1px 0 rgba(255,255,255,.5); }
.sp-vn .pm-vnTime, .sp-vn .pm-vnCap, .sp-vn .pm-vnLabel { font-family: var(--sp-type); }
.sp-vn .pm-vnCap { font-size: 13px; line-height: 1.55; opacity: .85; text-align: left; }
`;
