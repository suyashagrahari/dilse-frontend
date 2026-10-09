"use client";

// Scene 5 · His voice, in a rose. A little rose with a face and a microphone sways; when his voice note plays it
// sings (its mouth moves, music notes float up). The kit's VoiceNotePlayer primes the audio, draws the peaks and
// ducks the song. Without a recording, the rose says his caption in a speech bubble instead. A penguin holding a
// rose listens from the corner.

import { useState } from "react";
import { burst, haptic } from "../../../_valentine/kit";
import { VoiceNotePlayer, usePremium } from "../../../_valentine/kit/premium";
import { Gif, SingingRose } from "./art";
import { Puffy, Scene } from "./ui";
import { FIXED_GIF, type Garden } from "./util";

export function VoiceScene({ g, step, total, onDone }: { g: Garden; step: number; total: number; onDone: () => void }) {
  const { premium, sfx } = usePremium();
  const [singing, setSinging] = useState(false);
  const [heard, setHeard] = useState(false);
  const hasVoice = !!premium.voiceNote;
  const caption = premium.voiceCaption.trim();

  const boop = () => {
    sfx("plush-squeak", { gain: 0.5, detune: Math.random() * 300 });
    haptic(12);
    burst({ kind: "hearts", origin: { x: 0.5, y: 0.36 }, emojis: ["🎵", "💗", "🎶"], count: 8, spread: 0.18 });
  };

  return (
    <Scene
      id="voice"
      step={step}
      total={total}
      label={`${g.from}'s voice`}
      kicker="Step 5 · a little song"
      title={hasVoice ? "Press play. It's me 🎙" : "In my own words 🎙"}
      sub={hasVoice ? "Headphones on, if you can" : "(I was too shy to record it)"}
    >
      <div className="rg-voiceStage">
        <button type="button" className="rg-singerBtn" onClick={boop} aria-label="Boop the singing rose">
          <SingingRose color={g.color} singing={singing} size={190} />
          {singing && (
            <span className="rg-notes" aria-hidden>
              <i>♪</i>
              <i>♫</i>
              <i>♪</i>
            </span>
          )}
        </button>
        <Gif src={FIXED_GIF.penguinRose} size={92} className="rg-voicePeek" tilt={6} />
        {!hasVoice && caption && (
          <div className="rg-bubble" role="note">
            “{caption}”
          </div>
        )}
      </div>
      {hasVoice && (
        <div className="rg-voiceCard">
          <VoiceNotePlayer
            label={<span className="rg-voiceLabel">From {g.from}, with love</span>}
            accent="#FF6F9C"
            track="rgba(214,63,114,.25)"
            onPlay={() => setSinging(true)}
            onEnded={() => {
              setSinging(false);
              setHeard(true);
              sfx("rg-aww", { gain: 0.6 });
            }}
          />
          {caption && <p className="rg-voiceCap">{caption}</p>}
        </div>
      )}
      <div className="rg-foot">
        <Puffy onClick={onDone} className={heard || !hasVoice ? "rg-heartbeat" : undefined}>
          {g.photos.length ? "Let's make a bouquet 💐" : "Next 🌹"}
        </Puffy>
      </div>
    </Scene>
  );
}
