"use client";

// Chapter 3: the booth also recorded. Their last frame fills the screen,
// graded and dimmed like a film still; over it, the sender's voice note on
// a chrome player. No voice note: their line is printed big instead.

import { CinematicPhoto, PremiumCTA, VoiceNotePlayer, sfx, usePremium } from "../../../_valentine/kit/premium";
import type { Booth } from "./model";
import { CTA_STYLE, Eyebrow, Scene } from "./ui";

export default function VoiceScene({ b, onNext }: { b: Booth; onNext: () => void }) {
  const { premium } = usePremium();
  const hasVoice = !!premium.voiceNote;
  const bg = b.frames[3] ?? b.frames[0];
  return (
    <Scene label="A message from the booth" className="pb-voice">
      {bg && (
        <div className="pb-voiceBg" aria-hidden>
          <CinematicPhoto photo={bg} frame="full" grade={b.mono ? "noir" : "warm"} kenBurns="in" drift={22} focusPull={false} caption="" aspect="auto" style={{ height: "100%" }} />
        </div>
      )}
      <div className="pb-voiceIn">
        <Eyebrow>{hasVoice ? "The booth also recorded" : "Left in the booth"}</Eyebrow>
        {hasVoice ? (
          <>
            <h2 className="pb-h pb-voiceH">
              {b.sender} left you <em>a message.</em>
            </h2>
            <VoiceNotePlayer accent={b.S.hi} track="rgba(244,237,225,.8)" className="pb-vn" />
          </>
        ) : (
          <blockquote className="pb-voiceQuote">“{premium.voiceCaption}”<cite>— {b.sender}</cite></blockquote>
        )}
      </div>
      <div className="pb-foot">
        <PremiumCTA style={CTA_STYLE} tone="pearl" cue={null} onClick={() => { sfx("kpb-press", { gain: 0.7 }); onNext(); }}>Print the letter</PremiumCTA>
      </div>
      <style>{CSS}</style>
    </Scene>
  );
}

const CSS = `
.pb-voiceBg { position: absolute; inset: 0; z-index: 0; }
.pb-voice .pb-in > :not(.pb-voiceBg) { position: relative; z-index: 1; }
.pb-voiceBg::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(11,6,7,.55) 0%, rgba(11,6,7,.25) 35%, rgba(11,6,7,.78) 70%, #0b0607 100%); }
.pb-voice .pb-in { justify-content: flex-end; }
.pb-voiceIn { display: grid; justify-items: center; gap: 18px; margin-top: auto; width: 100%; max-width: 560px; }
.pb-voiceH { font-size: clamp(36px, 10.4vw, 72px); max-width: 11ch; }
.pb-voiceQuote { margin: 0; font: 400 clamp(30px, 8.4vw, 56px)/1.08 var(--pb-display); letter-spacing: -.015em; color: var(--pb-cream); max-width: 16ch; text-wrap: balance; }
.pb-voiceQuote cite { display: block; margin-top: 18px; font: 700 11px/1 var(--pb-mono); letter-spacing: .3em; text-transform: uppercase; font-style: normal; color: rgba(244,237,225,.7); }
.pb-vn.pm-vn { background: rgba(14,9,10,.55); border: 1px solid rgba(201,206,214,.22); color: var(--pb-cream); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); border-radius: 18px; }
.pb-vn .pm-vnBtn { color: #1a0d0f; box-shadow: 0 8px 22px -8px rgba(0,0,0,.8), inset 0 1px 0 rgba(255,255,255,.5); }
.pb-vn .pm-vnTime, .pb-vn .pm-vnCap, .pb-vn .pm-vnLabel { font-family: var(--pb-mono); }
.pb-vn .pm-vnCap { font-size: 13px; line-height: 1.55; opacity: .85; text-align: left; }
`;
