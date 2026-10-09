"use client";

// Chapter IV · A Voice from the Other Side. One crystal ball (Fluent 3D) in
// the dark. With a voice note: the kit's player under it, and the ball pulses
// while the sender speaks. Without one: tap the ball, the mist clears
// (glass-ping + chime) and their line surfaces in the glass.

import { useState } from "react";
import { Fluent3D, PremiumCTA, RevealText, VoiceNotePlayer, sfx, usePremium } from "../../../_valentine/kit/premium";
import { haptic } from "../../../_valentine/kit";
import type { Night } from "./model";
import { Eyebrow } from "./ui";
import { BODY } from "./fonts";

export default function Voice({ n, onNext }: { n: Night; onNext: () => void }) {
  const p = usePremium();
  const hasVoice = !!p.premium.voiceNote;
  const caption = p.premium.voiceCaption?.trim() || `Can you hear me? It's ${n.sender || "me"}. I'm right here.`;
  const [clear, setClear] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [heard, setHeard] = useState(false);

  const gaze = () => {
    if (clear) return;
    setClear(true);
    haptic(12);
    sfx("glass-ping", { gain: 0.5 });
    sfx("chime", { gain: 0.4, at: 0.35 });
  };

  return (
    <div className="nm-scene nm-voice">
      <header style={{ display: "grid", justifyItems: "center", gap: 10 }}>
        <Eyebrow n="IV">A Voice from Beyond</Eyebrow>
        <p className="nm-sub" style={{ fontSize: 17 }}>{hasVoice ? `${n.sender || "Someone"} left a message in the glass.` : clear ? " " : "Something is moving in the glass."}</p>
      </header>

      <button type="button" className={`nm-ball${clear ? " is-clear" : ""}${playing ? " is-playing" : ""}`} onClick={hasVoice ? undefined : gaze} aria-label={hasVoice ? "A crystal ball" : "Gaze into the crystal ball"} tabIndex={hasVoice ? -1 : 0}>
        <span className="nm-ballHalo" aria-hidden />
        <Fluent3D name="crystal-ball" size={200} glow="#b48cff" eager />
        <span className="nm-mist" aria-hidden />
      </button>

      <div className="nm-voiceBody">
        {hasVoice ? (
          <VoiceNotePlayer
            label={`${n.sender || "Them"}, from the other side`}
            accent="#F2B35B"
            onPlay={() => setPlaying(true)}
            onEnded={() => {
              setPlaying(false);
              setHeard(true);
            }}
            className="nm-vnp"
          />
        ) : clear ? (
          <figure style={{ margin: 0, display: "grid", gap: 12, justifyItems: "center" }}>
            <RevealText as="blockquote" mode="blur" text={`“${caption}”`} style={{ margin: 0, font: `italic 300 clamp(22px, 6vw, 30px)/1.35 ${BODY}`, color: "#F6EEDC", textAlign: "center", maxWidth: "22ch" }} />
            {n.sender && <figcaption className="nm-from">— {n.sender}</figcaption>}
          </figure>
        ) : (
          <p className="nm-tapHint">Tap the glass</p>
        )}
      </div>

      <div className="nm-foot">
        {(clear || hasVoice) && (
          <PremiumCTA tone={heard || clear ? "ember" : "pearl"} cue="whoosh" onClick={onNext}>
            Light the candle
          </PremiumCTA>
        )}
      </div>
      <style>{VOICE_CSS}</style>
    </div>
  );
}

const VOICE_CSS = `
.nm-ball { all: unset; position: relative; display: grid; place-items: center; margin: auto 0 0; cursor: pointer; -webkit-tap-highlight-color: transparent; }
.nm-ball:focus-visible { outline: 2px solid #F2B35B; outline-offset: 8px; border-radius: 50%; }
.nm-ballHalo { position: absolute; width: 320px; height: 320px; border-radius: 50%; pointer-events: none;
  background: radial-gradient(circle, rgba(180,140,255,.28), rgba(242,179,91,.08) 45%, transparent 70%); animation: nm-halo 4s ease-in-out infinite; }
.nm-ball.is-playing .nm-ballHalo { animation-duration: 1.1s; }
@keyframes nm-halo { 0%,100% { transform: scale(.92); opacity: .75; } 50% { transform: scale(1.06); opacity: 1; } }
.nm-mist { position: absolute; left: 50%; top: 42%; width: 150px; height: 120px; transform: translate(-50%,-50%); border-radius: 50%; pointer-events: none;
  background: radial-gradient(circle at 40% 45%, rgba(240,235,255,.85), rgba(220,210,255,.45) 45%, transparent 70%); filter: blur(6px);
  animation: nm-mist 5s ease-in-out infinite; transition: opacity 1.4s ease, transform 1.4s cubic-bezier(.22,1,.36,1); }
.nm-ball.is-clear .nm-mist { opacity: 0; transform: translate(-50%,-50%) scale(1.8); }
@keyframes nm-mist { 0%,100% { transform: translate(-52%,-50%) rotate(0); } 50% { transform: translate(-48%,-52%) rotate(14deg); } }
.nm-voiceBody { display: grid; justify-items: center; min-height: 150px; margin: 22px 0 auto; width: 100%; max-width: 420px; }
.nm-vnp { width: 100%; background: rgba(20,10,22,.6) !important; border-color: rgba(232,207,138,.3) !important; color: #F1E9D8 !important; }
.nm-from { font: 400 15px/1 var(--font-nm-display), Georgia, serif; letter-spacing: .2em; text-transform: uppercase; color: #E8CF8A; }
.nm-tapHint { margin: 8px 0 0; font: italic 400 16px/1 ${BODY}; color: rgba(232,223,204,.7); animation: nm-breath 2.6s ease-in-out infinite; }
@keyframes nm-breath { 0%,100% { opacity: .45; } 50% { opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .nm-ballHalo, .nm-mist, .nm-tapHint { animation: none; } }
`;
