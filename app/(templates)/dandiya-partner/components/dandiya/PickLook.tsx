"use client";

// Scene 4 — "Pick your look". A chaniya-choli / kediyu flare stands on a
// little stage; she taps a colour swatch and it twirls into that colour with a
// burst of mirror sparkles. Then the sender's own colour slides in beside it:
// "I'm in Peacock blue" + the sender's line (or "We match!").

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import { DANDIYA_COLORS, type DandiyaColor } from "../../../_valentine/days/dandiya-partner";
import { FONTS } from "../../../_valentine/theme";
import { Ghagra, Sparkle } from "./art";
import { DD_DISPLAY } from "./fonts";
import { useDd, useNext } from "./stage";
import { DD, Hint, RoomTitle } from "./ui";

const KEYS = Object.keys(DANDIYA_COLORS) as DandiyaColor[];

export default function PickLook({ myColor, lookLine, sender, onPick, onNext }: { myColor: DandiyaColor; lookLine: string; sender: string; onPick: (c: DandiyaColor) => void; onNext: () => void }) {
  const reduced = useReducedMotion();
  const { cue } = useDd();
  const [pick, setPick] = useState<DandiyaColor | null>(null);
  const [twirl, setTwirl] = useState(0);
  const c = DANDIYA_COLORS[pick ?? "marigold"];
  const mine = DANDIYA_COLORS[myColor] ?? DANDIYA_COLORS.peacock;
  const match = pick === myColor;

  const choose = (k: DandiyaColor) => {
    haptic(10);
    cue("dd-bells", { gain: 0.6, detune: KEYS.indexOf(k) * 80 });
    cue("swoosh-soft", { gain: 0.5 });
    setPick(k);
    setTwirl((t) => t + 1);
    onPick(k);
  };

  useNext(pick ? "Into the circle" : null, onNext, "dance");

  return (
    <>
      <style>{LOOK_CSS}</style>
      <RoomTitle kicker="Chaniya choli · kediyu" title="Pick your look" sub={pick ? undefined : "Which colour are you twirling in?"} />

      <div className="dd-fill">
        <div className="dd-look">
          <div className="dd-look-stage">
            <motion.div
              key={twirl}
              className="dd-look-twirl"
              initial={reduced || twirl === 0 ? false : { rotateY: 0, scaleX: 1 }}
              animate={reduced || twirl === 0 ? undefined : { rotateY: [0, 360, 720], scaleX: [1, 1.08, 1] }}
              transition={{ duration: 1.1, ease: [0.3, 0.7, 0.3, 1] }}
            >
              <Ghagra base={pick ? c.base : "#5A6396"} deep={pick ? c.deep : "#2A3268"} light={pick ? c.light : "#8F98C8"} size="100%" spin={twirl} />
            </motion.div>
            {/* mirror sparkles fly off the hem on every twirl */}
            {!reduced && twirl > 0 && (
              <span key={`s${twirl}`} className="dd-look-sparks" aria-hidden>
                {Array.from({ length: 10 }, (_, i) => (
                  <span key={i} style={{ ["--a" as string]: `${i * 36}deg`, animationDelay: `${(i % 3) * 0.05}s` }}>
                    <Sparkle size={12 + (i % 3) * 4} color={i % 2 ? "#FFFFFF" : DD.gold} />
                  </span>
                ))}
              </span>
            )}
            <AnimatePresence>
              {pick && (
                <motion.div
                  className="dd-look-mine"
                  initial={reduced ? false : { opacity: 0, x: 30, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ delay: reduced ? 0 : 0.7, type: "spring", stiffness: 200, damping: 16 }}
                >
                  <Ghagra base={mine.base} deep={mine.deep} light={mine.light} size="100%" />
                  <span className="dd-look-tag">{sender}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="dd-swatches" role="radiogroup" aria-label="Your twirl colour">
        {KEYS.map((k) => (
          <button
            key={k}
            type="button"
            role="radio"
            aria-checked={pick === k}
            aria-label={DANDIYA_COLORS[k].label}
            className={`dd-swatch${pick === k ? " is-on" : ""}`}
            style={{ background: `radial-gradient(circle at 36% 32%, ${DANDIYA_COLORS[k].light}, ${DANDIYA_COLORS[k].base} 55%, ${DANDIYA_COLORS[k].deep})` }}
            onClick={() => choose(k)}
          />
        ))}
      </div>
      <div className="dd-look-line" aria-live="polite">
        {pick ? (
          <motion.p key={pick} initial={reduced ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduced ? 0 : 0.8 }} style={{ margin: 0 }}>
            <span style={{ display: "block", font: `400 clamp(17px, 2.6dvh, 21px)/1.3 ${DD_DISPLAY}`, color: match ? DD.marigold : DD.ink }}>
              {match ? `We match! Both in ${mine.label} ✨` : `You in ${c.label}, me in ${mine.label}`}
            </span>
            {lookLine && <span style={{ display: "block", marginTop: 2, font: `italic 400 clamp(14px, 2.1dvh, 16px)/1.4 ${FONTS.serif}`, color: DD.mist, overflowWrap: "anywhere" }}>{lookLine}</span>}
          </motion.p>
        ) : (
          <Hint>Tap a colour to twirl ✨</Hint>
        )}
      </div>
    </>
  );
}

const LOOK_CSS = `
.dd-look { width: min(92cqw, 140cqh, calc(380px * var(--vw-s, 1))); aspect-ratio: 1.4; position: relative; }
.dd-look-stage { position: absolute; inset: 0; perspective: 800px; }
.dd-look-stage::after { content: ""; position: absolute; left: 6%; right: 6%; bottom: 0; height: 12%; border-radius: 50%;
  background: radial-gradient(closest-side, rgba(255,182,39,.45), rgba(255,182,39,0)); }
.dd-look-twirl { position: absolute; left: 2%; width: 60%; bottom: 7%; transform-style: preserve-3d; }
.dd-look-mine { position: absolute; right: 1%; width: 34%; bottom: 7%; }
.dd-look-tag { position: absolute; left: 50%; bottom: -14px; transform: translateX(-50%); padding: 2px 10px; border-radius: 99px; background: ${DD.cream}; color: ${DD.maroon};
  font: 700 11.5px ${FONTS.ui}; white-space: nowrap; max-width: 120%; overflow: hidden; text-overflow: ellipsis; box-shadow: 0 0 0 2px #F6D27A; }
.dd-look-sparks { position: absolute; left: 45%; bottom: 20%; width: 0; height: 0; pointer-events: none; }
.dd-look-sparks > span { position: absolute; left: 0; top: 0; animation: dd-fly .9s cubic-bezier(.2,.8,.3,1) forwards; opacity: 0; }
@keyframes dd-fly { 0% { opacity: 1; transform: rotate(var(--a)) translateX(0) scale(.4) } 100% { opacity: 0; transform: rotate(var(--a)) translateX(min(34vw, 150px)) scale(1) } }
.dd-swatches { flex: none; display: flex; flex-wrap: nowrap; gap: clamp(7px, 2.2vw, 14px); justify-content: center; max-width: 360px; }
.dd-swatch { width: clamp(36px, min(10vw, 6.4dvh), 50px); aspect-ratio: 1; border-radius: 50%; border: 0; padding: 0; cursor: pointer; touch-action: manipulation;
  box-shadow: 0 0 0 3px rgba(246,210,122,.45), 0 6px 14px -6px rgba(0,0,0,.7); transition: transform .2s cubic-bezier(.3,1.6,.5,1), box-shadow .2s ease; }
.dd-swatch:active { transform: scale(.9); }
.dd-swatch.is-on { transform: scale(1.14); box-shadow: 0 0 0 3px #FFF7E8, 0 0 0 6px #F6D27A, 0 0 18px rgba(255,224,138,.8); }
.dd-swatch:focus-visible { outline: 3px solid #7FD8F2; outline-offset: 4px; }
.dd-look-line { flex: none; min-height: clamp(52px, 8dvh, 64px); display: grid; place-items: center; max-width: 380px; }
`;
