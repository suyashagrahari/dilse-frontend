"use client";

// Room 6 · The hallway. His pink toy phone is ringing (a bright trill, it hops on the table), and the teddy
// points at it: "It's for you!" Tap it to pick up: the handset lifts, a heart pops, and it's the sender's voice
// (the kit's VoiceNotePlayer, which ducks the song). No voice note → his line types out in a speech bubble.

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { burst, haptic, Typewriter } from "../../../_valentine/kit";
import { sfx, usePremium, VoiceNotePlayer } from "../../../_valentine/kit/premium";
import type { TeddyItem } from "../../../_valentine/days/happy-teddy-day-premium";
import { HeldHandset, Teddy, ToyPhone } from "./art";
import { HAND } from "./fonts";
import { GIF } from "./gifs";
import { TH, type House } from "./model";
import { Bubble, Gif, Header, POP, Puffy } from "./ui";

export default function Call({ h, step, total, name, worn, onNext }: { h: House; step: number; total: number; name: string; worn: TeddyItem[]; onNext: () => void }) {
  const p = usePremium();
  const hasVoice = !!p.premium.voiceNote;
  const caption = p.premium.voiceCaption?.trim() || `It's ${h.sender || "me"}. I miss you. Give ${name} a squeeze for me.`;
  const [up, setUp] = useState(false);
  const [heard, setHeard] = useState(false);
  const rings = useRef(0);

  useEffect(() => {
    if (up) return;
    const ring = () => {
      if (rings.current >= 6) return;
      rings.current += 1;
      sfx("th-ring", { gain: 0.45 });
      haptic(10);
    };
    const first = window.setTimeout(ring, 500);
    const id = window.setInterval(ring, 1900);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, [up]);

  const pick = () => {
    if (up) return;
    setUp(true);
    haptic([15, 40, 25]);
    sfx("pop", { gain: 0.5 });
    sfx("chime", { gain: 0.5, at: 0.15 });
    burst({ kind: "hearts", origin: { x: 0.5, y: 0.45 }, count: 14, emojis: ["💗", "📞", "✨"] });
  };

  return (
    <div className={`th-scene th-call${up ? " is-up" : ""}`}>
      <Header step={step} total={total} room="Room 6 · The hallway" title={up ? <>It&apos;s {h.sender || "someone"} 💗</> : <>Ring ring! It&apos;s for <em>you</em></>} sub={up ? undefined : "Tap the phone to pick up."} />

      <div className="th-hall">
        <AnimatePresence>
          {!up && (
            <Bubble k="foryou" className="th-forYou">
              It&apos;s for you, {h.callHer}! 📞
            </Bubble>
          )}
        </AnimatePresence>
        <div className="th-hallRow">
          <span className="th-callTeddy">
            <Teddy size={150} mood={up ? "love" : "open"} pose={up ? "hold" : "wave"} worn={worn} heart held={up ? <HeldHandset /> : undefined} />
          </span>
          <button type="button" className={`th-phoneBtn${up ? "" : " is-ringing"}`} onClick={pick} aria-label="Pick up the phone" disabled={up}>
            <ToyPhone size={190} ringing={!up} off={up} />
            {!up && (
              <span className="th-ringLines" aria-hidden>
                <i />
                <i />
                <i />
              </span>
            )}
          </button>
        </div>
        <span className="th-table" aria-hidden />
        <Gif src={up ? GIF.mwah : GIF.hugging} size={up ? 92 : 64} tilt={up ? 8 : -8} className={up ? "th-callGif is-up" : "th-callGif"} />
      </div>

      <div className="th-callBody">
        <AnimatePresence>
          {up &&
            (hasVoice ? (
              <motion.div key="v" initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={POP} style={{ width: "100%" }}>
                <VoiceNotePlayer label={`${h.sender || "Them"}, on the line`} accent={TH.pinkDeep} onEnded={() => setHeard(true)} className="th-vnp" />
                <p className="th-capLine">{caption}</p>
              </motion.div>
            ) : (
              <Bubble k="cap" className="th-capBubble">
                <Typewriter text={`“${caption}”`} speed={34} skippable={false} onDone={() => setHeard(true)} />
                {h.sender && <span className="th-from">— {h.sender}</span>}
              </Bubble>
            ))}
        </AnimatePresence>
      </div>

      <div className="th-foot">
        {up && (
          <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ ...POP, delay: hasVoice ? 0.6 : 1.4 }}>
            <Puffy onClick={onNext} tone={heard || hasVoice ? "pink" : "cream"}>
              It&apos;s bedtime 🌙
            </Puffy>
          </motion.div>
        )}
      </div>
      <style>{CALL_CSS}</style>
    </div>
  );
}

const CALL_CSS = `
.th-hall { position: relative; display: grid; justify-items: center; width: 100%; margin-top: 18px; }
.th-forYou { margin-bottom: 6px; font-size: 21px; }
.th-hallRow { position: relative; z-index: 2; display: flex; align-items: flex-end; justify-content: center; gap: 0; margin: 0 -8px; }
.th-callTeddy { margin-bottom: -6px; }
.th-phoneBtn { all: unset; cursor: pointer; position: relative; -webkit-tap-highlight-color: transparent; }
.th-phoneBtn.is-ringing { animation: th-ringHop 1.9s ease-in-out infinite; transform-origin: 50% 100%; }
@keyframes th-ringHop { 0%, 40%, 100% { transform: rotate(0) translateY(0) } 4% { transform: rotate(-6deg) translateY(-8px) } 8% { transform: rotate(6deg) translateY(-6px) } 12% { transform: rotate(-5deg) translateY(-8px) } 16% { transform: rotate(5deg) translateY(-4px) } 20% { transform: rotate(-3deg) } 24% { transform: rotate(0) } }
.th-phoneBtn:focus-visible { outline: 3px dashed ${TH.pinkDeep}; outline-offset: 4px; border-radius: 20px; }
.th-ringLines { position: absolute; right: -6px; top: 8px; display: grid; gap: 6px; transform: rotate(-20deg); }
.th-ringLines i { display: block; height: 5px; border-radius: 5px; background: ${TH.pinkDeep}; animation: th-breath .6s ease-in-out infinite; }
.th-ringLines i:nth-child(1) { width: 18px; } .th-ringLines i:nth-child(2) { width: 26px; animation-delay: .15s; } .th-ringLines i:nth-child(3) { width: 18px; animation-delay: .3s; }
.th-table { position: relative; z-index: 1; width: min(92%, 330px); height: 24px; margin-top: -6px; border-radius: 12px; background: linear-gradient(180deg, #F2C89A, #E2B27C); box-shadow: 0 6px 0 #C98A55, 0 14px 20px rgba(120,70,30,.18); }
.th-callGif { position: absolute; left: max(-4px, calc(50% - 196px)); top: -10px; z-index: 3; }
.th-callGif.is-up { left: auto; right: max(-4px, calc(50% - 196px)); top: -30px; }
.th-callBody { width: min(100%, 400px); min-height: 130px; display: grid; place-items: center; margin-top: 22px; }
.th-vnp { width: 100%; background: ${TH.card} !important; color: ${TH.ink} !important; border-color: #fff !important; border-radius: 24px !important; box-shadow: 0 0 0 3px #fff inset, 0 10px 24px rgba(224,96,126,.18) !important; }
.th-capLine { margin: 10px 0 0; font: 400 20px/1.3 ${HAND}; color: ${TH.ink}; }
.th-capBubble::after { display: none; }
.th-capBubble { display: grid; gap: 6px; }
.th-from { justify-self: end; font: 800 12px/1 var(--font-th-body), sans-serif; letter-spacing: .12em; text-transform: uppercase; color: ${TH.pinkDeep}; }
@media (prefers-reduced-motion: reduce) { .th-phoneBtn.is-ringing, .th-ringLines i { animation: none; } }
`;
