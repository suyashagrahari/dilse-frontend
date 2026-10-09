"use client";

// Chapter V: In my voice. The last of their photos, full-bleed and graded, dimmed under a scrim; the sender's voice note
// (VoiceNotePlayer primes the audio, draws the peaks and ducks the song). Without a recording, the caption becomes
// the sender's words, set large in italic as if spoken. The scene is skipped when there is neither.

import { CinematicPhoto, PremiumCTA, RevealText, VoiceNotePlayer, usePremium } from "../../../_valentine/kit/premium";
import type { LovePhoto } from "../../../_love/types";

export function VoiceScene({ from, photo, onDone }: { from: string; photo?: LovePhoto; onDone: () => void }) {
  const { premium } = usePremium();
  const hasVoice = !!premium.voiceNote;
  return (
    <section className="lb-scene lb-voice" aria-label={`In ${from}'s voice`}>
      {photo && (
        <div className="lb-voiceBg" aria-hidden>
          <CinematicPhoto photo={photo} frame="full" grade="warm" kenBurns="out" drift={22} caption="" />
        </div>
      )}
      <header className="lb-head lb-headTight">
        <p className="lb-eyebrow">V · In my voice</p>
      </header>
      <div className="lb-voiceMid">
        {hasVoice ? (
          <>
            <p className="lb-voiceFrom">From {from}</p>
            <VoiceNotePlayer label={null} accent="#E3C27E" track="rgba(246,240,230,.55)" className="lb-voicePlayer" />
            {premium.voiceCaption && <p className="lb-voiceCap">{premium.voiceCaption}</p>}
          </>
        ) : (
          <figure className="lb-quote">
            <RevealText as="blockquote" text={`“${premium.voiceCaption}”`} className="lb-quoteText" mode="blur" stagger={0.02} delay={0.4} />
            <figcaption>{from}</figcaption>
          </figure>
        )}
      </div>
      <footer className="lb-foot">
        <PremiumCTA tone="pearl" cue="tick" onClick={onDone}>
          Continue
        </PremiumCTA>
      </footer>
    </section>
  );
}
