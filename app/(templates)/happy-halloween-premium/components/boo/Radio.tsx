"use client";

// Stop 6 · The spirit radio. A cute pink radio with ghost-shaped speaker holes
// hisses static. Slide the dial: little ticks and whistles, the static wobbles
// harder as you get close, and on Boo FM 103.1 it locks with a chime, the
// antenna star lights up and the sender's voice comes through (the kit's
// VoiceNotePlayer, which ducks the song). No voice note → his line types out
// in a speech bubble from the radio. "Tune it for me" after a few seconds.

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { burst, haptic, Typewriter } from "../../../_valentine/kit";
import { sfx, usePremium, VoiceNotePlayer } from "../../../_valentine/kit/premium";
import { Radio as RadioArt } from "./art";
import { DISPLAY } from "./fonts";
import { GIF } from "./gifs";
import { BN, type Night } from "./model";
import { Gif, Header, Later, NextButton, POP, TextLink } from "./ui";

const TARGET = 75.5;
const freq = (v: number) => (88 + (v / 100) * 20).toFixed(1);

export default function Radio({ n, step, total, onNext }: { n: Night; step: number; total: number; onNext: () => void }) {
  const p = usePremium();
  const hasVoice = !!p.premium.voiceNote;
  const caption = p.premium.voiceCaption?.trim() || `It's ${n.sender || "me"}. Happy Halloween. I'm right here.`;
  const [v, setV] = useState(18);
  const [locked, setLocked] = useState(false);
  const lastTick = useRef(0);
  const close = Math.max(0, 1 - Math.abs(v - TARGET) / 40);

  const lock = () => {
    if (locked) return;
    setLocked(true);
    setV(TARGET);
    haptic([15, 40, 25]);
    sfx("glass-ping", { gain: 0.5 });
    sfx("chime", { gain: 0.6, at: 0.2 });
    burst({ kind: "sparkles", origin: { x: 0.5, y: 0.36 }, count: 18, emojis: ["✨", "🎶", "💜", "⭐"] });
  };

  const onDial = (nv: number) => {
    if (locked) return;
    setV(nv);
    const now = performance.now();
    if (now - lastTick.current > 70) {
      lastTick.current = now;
      sfx("bn-tune", { gain: 0.25 + close * 0.3 });
    }
    if (Math.abs(nv - TARGET) < 2.5) lock();
  };

  // A tiny auto-sweep hint: the needle nudges once so it reads as a dial.
  useEffect(() => {
    const t = window.setTimeout(() => setV((x) => (x === 18 ? 24 : x)), 900);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className={`bn-scene bn-radio${locked ? " is-on" : ""}`}>
      <Header
        step={step}
        total={total}
        kicker="Stop 6 · The spirit radio"
        title={locked ? "Boo FM · on air 🎙️" : "Someone's on the spirit radio"}
        sub={locked ? undefined : "Slide the dial to find the right station."}
      />

      <div className="bn-radioWrap" style={{ ["--close" as string]: String(close) }}>
        {!locked && (
          <span className="bn-static" aria-hidden>
            ~ ~ ~
          </span>
        )}
        <span className={locked ? "bn-radioOn" : "bn-radioBuzz"}>
          <RadioArt needle={v / 100} on={locked} size={260} className="bn-radioArt" />
        </span>
        <Gif src={locked ? GIF.blush : GIF.panda} size={locked ? 92 : 84} tilt={locked ? -8 : 10} className="bn-radioGif" style={{ opacity: locked ? 1 : 0.4 + close * 0.6 }} />
        {locked && (
          <span className="bn-notes" aria-hidden>
            <span>♪</span>
            <span>♥</span>
            <span>♫</span>
          </span>
        )}
      </div>

      <div className="bn-dialRow">
        <span className="bn-freq" aria-live="polite">
          {locked ? "103.1 Boo FM" : `${freq(v)} FM`}
        </span>
        <input
          type="range"
          min={0}
          max={100}
          step={0.5}
          value={v}
          disabled={locked}
          onChange={(e) => onDial(Number(e.target.value))}
          className="bn-dial"
          aria-label="Tune the radio"
        />
      </div>

      <div className="bn-radioBody">
        <AnimatePresence>
          {locked &&
            (hasVoice ? (
              <motion.div key="v" initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={POP} style={{ width: "100%" }}>
                <VoiceNotePlayer
                  label={`${n.sender || "Them"}, live on Boo FM`}
                  accent={BN.orange}
                  className="bn-vnp"
                />
                <p className="bn-capLine">{caption}</p>
              </motion.div>
            ) : (
              <motion.div key="c" className="bn-bubble" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={POP}>
                <Typewriter text={`“${caption}”`} speed={34} skippable={false} />
                {n.sender && <span className="bn-from">— {n.sender}</span>}
              </motion.div>
            ))}
        </AnimatePresence>
      </div>

      <div className="bn-foot">
        {locked ? (
          <NextButton onClick={onNext} delay={hasVoice ? 0.6 : 1.2}>
            One last thing
          </NextButton>
        ) : (
          <Later ms={6000}>
            <TextLink onClick={lock}>Tune it for me</TextLink>
          </Later>
        )}
      </div>
      <style>{RADIO_CSS}</style>
    </div>
  );
}

const RADIO_CSS = `
.bn-radioWrap { position: relative; display: grid; grid-template-rows: minmax(0, 1fr); place-items: center; flex: 1 1 0; min-height: 0; width: min(100%, 360px); }
.bn-radioBuzz, .bn-radioOn { height: min(100%, 210px); aspect-ratio: 260 / 210; }
.bn-radioArt { width: 100%; height: 100%; }
.bn-radioBuzz { display: inline-block; animation: bn-buzz .18s linear infinite; animation-play-state: running; }
@keyframes bn-buzz { 0% { transform: translate(0,0) rotate(0) } 25% { transform: translate(calc(var(--close) * 2px), calc(var(--close) * -1px)) rotate(calc(var(--close) * .6deg)) } 75% { transform: translate(calc(var(--close) * -2px), calc(var(--close) * 1px)) rotate(calc(var(--close) * -.6deg)) } }
.bn-radioOn { display: inline-block; animation: bn-bop .9s ease-in-out infinite; }
@keyframes bn-bop { 0%,100% { transform: scale(1) rotate(-1deg) } 50% { transform: scale(1.04, .97) rotate(1deg) } }
.bn-static { position: absolute; top: -8px; left: 50%; transform: translateX(-50%); font: 400 28px/1 ${DISPLAY}; color: rgba(255,255,255,.6); letter-spacing: .3em; animation: bn-breath .5s ease-in-out infinite; }
.bn-radioGif { position: absolute; left: -4px; top: -4px; transition: opacity .3s ease; width: clamp(60px, 10dvh, 92px) !important; height: clamp(60px, 10dvh, 92px) !important; }
.bn-notes { position: absolute; right: 6px; top: -10px; display: flex; gap: 8px; font: 400 26px/1 ${DISPLAY}; color: ${BN.candle}; }
.bn-notes span { animation: bn-noteUp 1.8s ease-in-out infinite; }
.bn-notes span:nth-child(2) { animation-delay: .5s; color: ${BN.pink}; }
.bn-notes span:nth-child(3) { animation-delay: 1s; color: ${BN.mint}; }
@keyframes bn-noteUp { 0% { transform: translateY(10px); opacity: 0 } 40% { opacity: 1 } 100% { transform: translateY(-26px); opacity: 0 } }
.bn-dialRow { flex: none; display: grid; justify-items: center; gap: 4px; width: min(100%, 320px); }
.bn-freq { padding: 6px 14px; border-radius: 99px; background: #2A1F3D; color: ${BN.candle}; font: 800 16px/1 var(--font-bn-body), sans-serif; letter-spacing: .08em; box-shadow: 0 0 0 2px rgba(255,210,122,.35); }
.bn-dial { -webkit-appearance: none; appearance: none; width: 100%; height: 44px; background: transparent; cursor: pointer; touch-action: pan-y; }
.bn-dial::-webkit-slider-runnable-track { height: 16px; border-radius: 99px; background: repeating-linear-gradient(90deg, #FFF4E3 0 3px, #FFD9E9 3px 14px); box-shadow: 0 0 0 3px #fff inset, 0 4px 0 #E0619C; }
.bn-dial::-moz-range-track { height: 16px; border-radius: 99px; background: repeating-linear-gradient(90deg, #FFF4E3 0 3px, #FFD9E9 3px 14px); }
.bn-dial::-webkit-slider-thumb { -webkit-appearance: none; width: 40px; height: 40px; margin-top: -12px; border-radius: 50%; background: radial-gradient(circle at 40% 35%, #FFC07A, ${BN.orange}); border: 4px solid #fff; box-shadow: 0 4px 0 ${BN.orangeDeep}, 0 8px 16px rgba(30,16,60,.35); }
.bn-dial::-moz-range-thumb { width: 34px; height: 34px; border-radius: 50%; background: ${BN.orange}; border: 4px solid #fff; }
.bn-dial:focus-visible { outline: 3px solid #fff; outline-offset: 4px; border-radius: 99px; }
.bn-radioBody { flex: none; width: min(100%, 400px); min-height: clamp(96px, 17dvh, 130px); display: grid; place-items: center; }
.bn-vnp { width: 100%; background: ${BN.card} !important; color: ${BN.ink} !important; border-color: #fff !important; border-radius: 24px !important; }
.bn-capLine { margin: 10px 0 0; font: 400 19px/1.3 var(--font-bn-hand), cursive; color: #FFF7EC; }
.bn-bubble { position: relative; background: ${BN.card}; color: ${BN.ink}; border-radius: 26px; padding: clamp(10px, 1.6dvh, 16px) 18px; font: 400 clamp(17px, 2.7dvh, 21px)/1.3 var(--font-bn-hand), cursive; box-shadow: 0 0 0 3px #fff inset, 0 12px 26px rgba(30,16,60,.35); text-align: left; display: grid; gap: 6px; }
.bn-bubble::before { content: ""; position: absolute; top: -12px; left: 50%; margin-left: -12px; border: 12px solid transparent; border-top: 0; border-bottom-color: ${BN.card}; }
.bn-from { justify-self: end; font: 800 13px/1 var(--font-bn-body), sans-serif; letter-spacing: .12em; text-transform: uppercase; color: ${BN.lilacDeep}; }
@media (prefers-reduced-motion: reduce) { .bn-radioBuzz, .bn-radioOn, .bn-static, .bn-notes span { animation: none; } }
`;
