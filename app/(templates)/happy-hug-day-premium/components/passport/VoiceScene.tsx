"use client";

// A hug you can hear. A round plush (his critter, hugging a heart) sits on a cushion; while his voice note plays it
// purrs (a soft shiver, little hearts and "purr" floating up), and tapping it gets a squeak and a purr. The kit's
// VoiceNotePlayer primes the audio, draws the peaks and ducks the song. Without a recording, the plush says his
// caption in a speech bubble instead. Two bunnies snuggle in the corner.

import { useState } from "react";
import { burst, haptic } from "../../../_valentine/kit";
import { VoiceNotePlayer, usePremium } from "../../../_valentine/kit/premium";
import { Critter } from "../../../happy-hug-day/components/hug/Characters";
import { Gif } from "./art";
import { Puffy, Scene, useSfx, usePassport } from "./ui";
import { FIXED_GIF } from "./util";

export function VoiceScene({ onDone }: { onDone: () => void }) {
  const { premium } = usePremium();
  const { g } = usePassport();
  const sfx = useSfx();
  const [playing, setPlaying] = useState(false);
  const [heard, setHeard] = useState(false);
  const [boop, setBoop] = useState(0);
  const hasVoice = !!premium.voiceNote;
  const caption = premium.voiceCaption.trim();

  const squeeze = () => {
    setBoop((b) => b + 1);
    sfx("plush-squeak", { gain: 0.5, detune: Math.random() * 300 });
    sfx("hp-purr", { gain: 0.8 });
    haptic([20, 20, 20]);
    burst({ kind: "hearts", origin: { x: 0.5, y: 0.4 }, emojis: ["💗", "🧡", "✨"], count: 10, spread: 0.2 });
  };

  return (
    <Scene
      id="voice"
      label={`${g.from}'s voice`}
      kicker="A hug you can hear"
      title={hasVoice ? "Press play. It's me 🎧" : "In my own words 🎧"}
      sub={hasVoice ? "Headphones on, if you can" : "(squeeze the plush)"}
    >
      <div className="hp-voiceStage">
        <span className="hp-cushion" aria-hidden />
        <button type="button" key={boop} className={`hp-plush${playing ? " is-purring" : ""}${boop ? " hp-jelly" : ""}`} onClick={squeeze} aria-label="Squeeze the plush">
          <svg viewBox="-80 -150 160 165" width="100%" height="100%" aria-hidden style={{ overflow: "visible" }}>
            <Critter species={g.species[0]} layer="body" pose={{ happy: true, squish: boop ? 0.2 : 0 }} />
            <path d="M0 -10 C-26 -26 -26 -46 -12 -48 C-6 -49 -1 -44 0 -40 C1 -44 6 -49 12 -48 C26 -46 26 -26 0 -10 Z" fill="#FF7AA2" stroke="#6B4232" strokeWidth="3" />
            <Critter species={g.species[0]} layer="arms" pose={{ hugging: true, reach: 26 }} />
          </svg>
        </button>
        {playing && (
          <span className="hp-purrs" aria-hidden>
            <i>purr</i>
            <i>💗</i>
            <i>purr</i>
          </span>
        )}
        <Gif src={FIXED_GIF.snuggle} size={90} className="hp-voicePeek" tilt={6} />
        {!hasVoice && caption && (
          <div className="hp-bubble" role="note">
            “{caption}”
          </div>
        )}
      </div>
      {hasVoice && (
        <div className="hp-voiceCard">
          <VoiceNotePlayer
            label={<span className="hp-voiceLabel">From {g.from}, with a hug</span>}
            accent="#FF8A6B"
            track="rgba(224,96,63,.25)"
            onPlay={() => {
              setPlaying(true);
              sfx("hp-purr", { gain: 0.5 });
            }}
            onEnded={() => {
              setPlaying(false);
              setHeard(true);
              sfx("hp-aww", { gain: 0.6 });
            }}
          />
          {caption && <p className="hp-voiceCap">{caption}</p>}
        </div>
      )}
      <div className="hp-foot is-on">
        <Puffy onClick={onDone} className={heard || !hasVoice ? "hp-heartbeat" : undefined}>
          Your hug coupons 🎟️
        </Puffy>
      </div>
    </Scene>
  );
}
