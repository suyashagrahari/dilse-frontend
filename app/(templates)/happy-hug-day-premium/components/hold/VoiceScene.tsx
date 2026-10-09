"use client";

// Chapter 6: in my voice. A photo of the two of them fills the screen, graded and dimmed like a film still; over it,
// the sender's voice note (the player ducks the song). No recording: their line, set large, in their words.

import { CinematicPhoto, PremiumCTA, VoiceNotePlayer, usePremium } from "../../../_valentine/kit/premium";
import type { Hug } from "./model";
import { CTA_STYLE, Eyebrow, Scene } from "./ui";

export default function VoiceScene({ h, onNext }: { h: Hug; onNext: () => void }) {
  const { premium } = usePremium();
  const hasVoice = !!premium.voiceNote;
  const bg = h.photos[h.photos.length - 1] ?? h.hero;
  return (
    <Scene label={`In ${h.from}'s voice`} className="hh-voice">
      {bg && (
        <div className="hh-voiceBg" aria-hidden>
          <CinematicPhoto photo={bg} frame="full" grade="warm" kenBurns="in" drift={22} focusPull={false} caption="" aspect="auto" style={{ height: "100%" }} />
        </div>
      )}
      <div className="hh-voiceIn">
        <Eyebrow>{hasVoice ? "Close your eyes for this one" : `${h.from}, out loud`}</Eyebrow>
        {hasVoice ? (
          <>
            <h2 className="hh-h hh-voiceH">
              In my <em>voice.</em>
            </h2>
            <VoiceNotePlayer accent="#F2A477" track="rgba(250,247,242,.8)" className="hh-vn" />
          </>
        ) : (
          <blockquote className="hh-voiceQuote">
            “{premium.voiceCaption}”<cite>— {h.from}</cite>
          </blockquote>
        )}
      </div>
      <div className="hh-foot">
        <PremiumCTA style={CTA_STYLE} tone="pearl" cue="tick" onClick={onNext}>
          One last thing
        </PremiumCTA>
      </div>
      <style>{CSS}</style>
    </Scene>
  );
}

const CSS = `
.hh-voiceBg { position: absolute; inset: 0; z-index: 0; }
.hh-voice .hh-in > :not(.hh-voiceBg) { position: relative; z-index: 1; }
.hh-voiceBg::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(18,12,9,.6) 0%, rgba(18,12,9,.2) 32%, rgba(18,12,9,.72) 66%, #120C09 100%); }
.hh-voice .hh-in { justify-content: flex-end; max-width: none; }
.hh-voiceIn { display: grid; justify-items: center; gap: 18px; margin-top: auto; width: 100%; max-width: 560px; }
.hh-voiceH { font-size: clamp(48px, 14vw, 96px); }
.hh-voiceQuote { margin: 0; font: 400 clamp(32px, 8.8vw, 60px)/1.06 var(--hh-display); font-style: italic; letter-spacing: -.015em; color: var(--hh-cloud); max-width: 15ch; text-wrap: balance; }
.hh-voiceQuote cite { display: block; margin-top: 18px; font: 700 11px/1 var(--hh-ui); letter-spacing: .3em; text-transform: uppercase; font-style: normal; color: rgba(250,247,242,.7); }
.hh-vn.pm-vn { background: rgba(18,12,9,.55); border: 1px solid rgba(250,247,242,.18); color: var(--hh-cloud); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); border-radius: 18px; }
.hh-vn .pm-vnBtn { color: #2A1A10; }
.hh-vn .pm-vnTime, .hh-vn .pm-vnCap, .hh-vn .pm-vnLabel { font-family: var(--hh-ui); }
.hh-vn .pm-vnCap { font-size: 14px; line-height: 1.5; opacity: .85; text-align: left; }
`;
