"use client";

// Chapter V · In my voice. One of their photos, full-bleed and graded warm under a cocoa scrim; the sender's voice
// note (VoiceNotePlayer primes the audio, draws the peaks and ducks the song). Without a recording, the caption is
// set large as the sender's own spoken words. Skipped when there is neither.

import { CinematicPhoto, PremiumCTA, RevealText, VoiceNotePlayer, usePremium } from "../../../_valentine/kit/premium";
import type { LovePhoto } from "../../../_love/types";

export function VoiceScene({ from, n, photo, onDone }: { from: string; n: string; photo?: LovePhoto; onDone: () => void }) {
  const { premium } = usePremium();
  const hasVoice = !!premium.voiceNote;
  return (
    <section className="ap-scene ap-voice" aria-label={`In ${from}'s voice`}>
      {photo && (
        <div className="ap-voiceBg" aria-hidden>
          <CinematicPhoto photo={photo} frame="full" grade="warm" kenBurns="out" drift={22} caption="" />
        </div>
      )}
      <header className="ap-head ap-headTight">
        <p className="ap-eyebrow">{n} · In my voice</p>
      </header>
      <div className="ap-voiceMid">
        {hasVoice ? (
          <>
            <p className="ap-voiceFrom">From {from}</p>
            <VoiceNotePlayer label={null} accent="#E9C08A" track="rgba(245,238,226,.55)" className="ap-voicePlayer" />
            {premium.voiceCaption && <p className="ap-voiceCap">{premium.voiceCaption}</p>}
          </>
        ) : (
          <figure className="ap-quote">
            <RevealText as="blockquote" text={`“${premium.voiceCaption}”`} className="ap-quoteText" mode="blur" stagger={0.02} delay={0.4} />
            <figcaption>{from}</figcaption>
          </figure>
        )}
      </div>
      <footer className="ap-foot">
        <PremiumCTA tone="gold" cue="page-turn" onClick={onDone}>
          Sign the papers
        </PremiumCTA>
      </footer>
    </section>
  );
}
