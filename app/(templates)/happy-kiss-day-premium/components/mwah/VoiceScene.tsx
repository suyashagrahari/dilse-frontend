"use client";

// Scene 6 · His voice: a whisper. "Come closer…" A big puffy pair of lips
// breathes on the screen; tap them and the whisper plays (the voice note,
// with the kit's player in pink), the lips pulse while it plays. No voice
// note: the whisper caption types itself out in a speech bubble instead.

import { motion } from "framer-motion";
import { useState } from "react";
import { Typewriter, haptic } from "../../../_valentine/kit";
import { VoiceNotePlayer, sfx, usePremium } from "../../../_valentine/kit/premium";
import { LipPrint } from "./LipPrint";
import { GIF, type Mwah } from "./model";
import { Gif, Kicker, Puffy, Scene, Sub, Title, popIn, rise } from "./ui";

export default function VoiceScene({ m, onNext }: { m: Mwah; onNext: () => void }) {
  const { premium } = usePremium();
  const hasVoice = !!premium.voiceNote;
  const [close, setClose] = useState(false);
  const [playing, setPlaying] = useState(false);

  const lean = () => {
    if (close) return;
    setClose(true);
    sfx("kmw-whisper", { gain: 0.7 });
    haptic([30, 80, 30]);
  };

  return (
    <Scene label="A whisper" className={`km-voice${close ? " is-close" : ""}`}>
      <motion.div {...rise(0)}>
        <Kicker>Psst, {m.recipient}</Kicker>
      </motion.div>
      <motion.div {...rise(1)}>
        <Title>
          Come <em>closer…</em>
        </Title>
      </motion.div>
      <motion.div {...rise(2)}>
        <Sub>{close ? `${m.sender} has something to whisper.` : "Closer. Tap the lips."}</Sub>
      </motion.div>

      <motion.button type="button" className={`km-bigLips${playing ? " is-talking" : ""}`} onClick={lean} aria-label="Come closer: tap to hear the whisper" {...popIn(3)}>
        <span className="km-bigLipsIn">
          <span className="km-bigLipsGlow" aria-hidden />
          <LipPrint color={m.S.c} lipstick size={220} seed={21} />
        </span>
        {!close && <span className="km-bigLipsTap">tap 🤫</span>}
      </motion.button>

      {close && (
        <motion.div className="km-whisper" {...popIn(0)}>
          <span className="km-voiceGif">
            <Gif src={GIF.closedEyes} size={72} tilt={-8} eager />
          </span>
          {hasVoice ? (
            <VoiceNotePlayer
              label={`${m.sender}'s whisper`}
              accent={m.S.c}
              track="#FFD1DF"
              className="km-vn"
              onPlay={() => setPlaying(true)}
              onEnded={() => setPlaying(false)}
            />
          ) : (
            <div className="km-bubble km-hand">
              <Typewriter text={premium.voiceCaption || "Mwah."} speed={46} skippable={false} caretColor={m.S.c} />
            </div>
          )}
        </motion.div>
      )}

      <div className="km-foot">{close && <Puffy onClick={onNext}>Next: one question 💋</Puffy>}</div>
      <style>{CSS}</style>
    </Scene>
  );
}

const CSS = `
.km-bigLips { all: unset; cursor: pointer; position: relative; display: grid; place-items: center; width: 250px; height: 190px; margin-top: 10px; -webkit-tap-highlight-color: transparent; transition: height .5s var(--km-spring); }
.km-bigLipsIn { position: relative; display: grid; place-items: center; animation: km-breathe 2.6s ease-in-out infinite; transition: transform .5s var(--km-spring); }
.km-bigLips:focus-visible { outline: 3px solid var(--km-primary); outline-offset: 4px; border-radius: 30px; }
.km-bigLipsGlow { position: absolute; inset: -14%; border-radius: 50%; background: radial-gradient(circle, rgba(255,255,255,.95), rgba(255,209,223,.6) 50%, transparent 70%); }
.km-bigLipsIn svg { position: relative; filter: drop-shadow(0 10px 16px rgba(214,63,114,.35)); }
.km-bigLipsTap { position: absolute; bottom: -4px; font: 600 15px/1 var(--km-hand); color: var(--km-deep); background: #fff; padding: 6px 12px; border-radius: 99px; box-shadow: 0 6px 14px -8px rgba(214,63,114,.5); }
.km-voice.is-close .km-bigLips { height: 130px; }
.km-voice.is-close .km-bigLipsIn { animation: none; transform: scale(.66); }
.km-bigLips.is-talking svg { animation: km-talk .32s ease-in-out infinite alternate; }
@keyframes km-breathe { 0%, 100% { transform: scale(.94); } 50% { transform: scale(1.04); } }
@keyframes km-talk { to { transform: scaleY(.86) scaleX(1.04); } }
.km-whisper { position: relative; width: min(400px, 100%); margin-top: 8px; }
.km-voiceGif { position: absolute; left: -10px; top: -46px; z-index: 2; }
.km-vn.pm-vn { background: #fff; border: 0; color: var(--km-ink); border-radius: 24px; box-shadow: 0 0 0 4px #fff, 0 0 0 6px #FFE3EC, 0 18px 34px -18px rgba(214,63,114,.6); }
.km-vn .pm-vnLabel { font: 600 18px/1.2 var(--km-hand); color: var(--km-deep); }
.km-vn .pm-vnCap { font: 400 16px/1.45 var(--km-hand); color: var(--km-ink2); }
.km-bubble { position: relative; margin: 0; padding: 22px 22px; border-radius: 26px; background: #fff; font-size: 21px; font-weight: 600; line-height: 1.4; color: var(--km-deep); text-align: center;
  box-shadow: 0 0 0 4px #fff, 0 0 0 6px #FFE3EC, 0 18px 34px -18px rgba(214,63,114,.6); }
.km-bubble::after { content: ""; position: absolute; left: 50%; top: -12px; width: 24px; height: 24px; background: #fff; transform: translateX(-50%) rotate(45deg); border-radius: 4px; }
@media (prefers-reduced-motion: reduce) { .km-bigLipsIn, .km-bigLips.is-talking svg { animation: none; } }
`;
