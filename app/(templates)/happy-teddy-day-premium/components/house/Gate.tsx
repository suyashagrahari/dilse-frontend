"use client";

// The doorstep: a kraft delivery box with a pink ribbon wiggles (something inside is restless). Its label reads
// "FRAGILE · 1 cuddly teddy for Riya" plus the sender's line. Tap it (or the button): the lid pops off, a teddy
// springs out of the box with a squeak… and he's fast asleep (he needs a heart, next room). Like the kit's
// PremiumGate, everything audible happens synchronously inside the tap: p.open() (audio session, AudioContext,
// voice prime, YouTube unMute+play), then the cues; onOpen() follows when he has landed.

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { burst, haptic, useReducedMotion } from "../../../_valentine/kit";
import { requestTiltPermission, usePremium } from "../../../_valentine/kit/premium";
import { BoxBody, BoxLid, Teddy } from "./art";
import { DISPLAY, HAND } from "./fonts";
import { TH, type House } from "./model";
import { Gif, POP, Puffy, TextLink } from "./ui";

export default function Gate({ h, hello, justUnsealed, onOpen }: { h: House; hello: string | null; justUnsealed: boolean; onOpen: () => void }) {
  const p = usePremium();
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<"idle" | "pop" | "out">("idle");
  const [waited, setWaited] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setWaited(true), 4000);
    return () => window.clearTimeout(t);
  }, []);
  const tuning = !!p.music && p.music.mode === "youtube" && !p.music.ready && !waited;

  const open = (quiet = false) => {
    if (phase !== "idle") return;
    p.open({ quiet });
    void requestTiltPermission();
    if (!quiet) {
      p.sfx("ribbon", { gain: 0.5 });
      p.sfx("pop", { gain: 0.55, at: 0.22 });
      p.sfx("plush-squeak", { gain: 0.7, at: 0.42 });
      p.sfx("chime", { gain: 0.45, at: 0.7 });
    }
    haptic([15, 40, 25]);
    setPhase("pop");
    window.setTimeout(() => burst({ kind: "hearts", origin: { x: 0.5, y: 0.52 }, count: 20, emojis: ["💗", "🧸", "✨", "💛"] }), reduce ? 0 : 380);
    window.setTimeout(() => setPhase("out"), reduce ? 300 : 2500);
    window.setTimeout(onOpen, reduce ? 500 : 3100);
  };

  return (
    <div className={`th-scene th-gate is-${phase}`} role="dialog" aria-modal="true" aria-label={`A delivery for ${h.recipient}`}>
      <div className="th-gateTop">
        <p className="th-room">{justUnsealed ? "Delivered at midnight 🌙" : "The doorstep · 10 February"}</p>
        <motion.h1 className="th-gateName" initial={{ scale: 0.5, rotate: -6, opacity: 0 }} animate={{ scale: 1, rotate: -2, opacity: 1 }} transition={{ ...POP, delay: 0.15 }}>
          Special delivery for <span>{h.recipient}</span>
        </motion.h1>
        <p className="th-sub">{phase === "idle" ? "Something in this box is wiggling…" : "Shh. He fell asleep on the way. 💤"}</p>
      </div>

      <button type="button" className="th-gateBox" onClick={() => open()} aria-label="Open the box" tabIndex={-1}>
        <span className="th-gateInside">
          <AnimatePresence>
            {phase !== "idle" && (
              <motion.span
                className="th-gateTeddy"
                initial={{ y: 150, scale: 0.7 }}
                animate={{ y: 0, scale: 1 }}
                transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 240, damping: 10, delay: 0.25 }}
              >
                <Teddy size={168} mood="sleep" pose="down" />
                <span className="th-zzz" aria-hidden>
                  <i>z</i>
                  <i>z</i>
                  <i>Z</i>
                </span>
              </motion.span>
            )}
          </AnimatePresence>
        </span>
        <motion.span
          className="th-gateLid"
          animate={phase === "idle" ? { y: 0, rotate: 0, x: 0, opacity: 1 } : { y: -190, x: 120, rotate: 38, opacity: 0 }}
          transition={phase === "idle" ? undefined : { duration: reduce ? 0.2 : 0.7, ease: [0.3, 1.4, 0.6, 1] }}
        >
          <BoxLid size={262} />
        </motion.span>
        <span className={`th-gateBody${phase === "idle" ? " th-jiggle" : ""}`}>
          <BoxBody size={240} />
          <span className="th-label">
            <b>1 cuddly teddy</b>
            <span>for {h.recipient}</span>
            <em>{h.parcel}</em>
          </span>
        </span>
        <Gif src={hello} size={108} tilt={-8} eager className="th-gateGif" />
      </button>

      <div className="th-foot">
        <Puffy onClick={() => open()} disabled={phase !== "idle"}>
          Open the box 🎁
        </Puffy>
        <p className="th-tuning" aria-live="polite">{tuning ? "tuning the music…" : "sound on 🎧"}</p>
        <div className="th-seal">
          <span aria-hidden>🧸</span>
          <span>Hand-made for {h.recipient}</span>
        </div>
        <TextLink onClick={() => open(true)}>Open quietly</TextLink>
      </div>
      <style>{GATE_CSS}</style>
    </div>
  );
}

const GATE_CSS = `
.th-gate { z-index: 20; transition: opacity .6s ease; }
.th-gate .th-foot { gap: 4px; }
.th-gate .th-gateTop { gap: 6px; }
.th-gate.is-out { opacity: 0; pointer-events: none; }
.th-gateTop { display: grid; justify-items: center; gap: 8px; margin-top: 2px; }
.th-gateName { margin: 0; font: 800 clamp(30px, 9vw, 48px)/1.04 ${DISPLAY}; color: ${TH.ink}; text-shadow: 0 3px 0 #fff; max-width: 13ch; text-wrap: balance; }
.th-gateName span { display: block; font: 400 clamp(46px, 14vw, 72px)/1 ${HAND}; color: ${TH.pinkDeep}; margin-top: 4px; }
.th-gateBox { all: unset; position: relative; display: grid; justify-items: center; cursor: pointer; margin: auto 0; padding-top: 104px; -webkit-tap-highlight-color: transparent; }
.th-gateInside { position: absolute; top: 0; left: 50%; width: 220px; height: 200px; margin-left: -110px; overflow: hidden; display: grid; justify-items: center; align-items: end; }
.th-gateTeddy { position: relative; display: block; margin-bottom: -60px; }
.th-gateLid { position: relative; z-index: 3; margin-bottom: -14px; display: block; }
.th-gateBody { position: relative; z-index: 2; display: block; }
.th-jiggle { animation: th-jiggle 2.4s ease-in-out infinite; transform-origin: 50% 100%; }
@keyframes th-jiggle { 0%, 62%, 100% { transform: rotate(0) scale(1) } 66% { transform: rotate(-3deg) scale(1.02, .98) } 70% { transform: rotate(3deg) scale(.98, 1.03) translateY(-4px) } 74% { transform: rotate(-2deg) } 78% { transform: rotate(1.5deg) translateY(-2px) } 82% { transform: rotate(0) } }
.th-label { position: absolute; z-index: 3; right: 22px; bottom: 26px; width: 118px; display: grid; gap: 2px; padding: 8px 10px 9px; border-radius: 10px; background: #FFFDF8; text-align: left;
  box-shadow: 0 0 0 2px #fff inset, 0 3px 8px rgba(120,70,30,.25); transform: rotate(3deg); color: ${TH.ink}; }
.th-label b { font: 800 10.5px/1.15 var(--font-th-body), sans-serif; letter-spacing: .1em; text-transform: uppercase; color: ${TH.pinkDeep}; }
.th-label span { font: 400 19px/1 ${HAND}; }
.th-label em { font: 400 13.5px/1.15 ${HAND}; font-style: normal; color: ${TH.inkSoft}; }
.th-gateGif { position: absolute; z-index: 4; left: -46px; bottom: 18px; }
.th-tuning { margin: 0; font: 800 13px/1 var(--font-th-body), sans-serif; color: ${TH.inkSoft}; min-height: 14px; opacity: .8; }
.th-seal { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px 6px 8px; border-radius: 99px; background: rgba(255,255,255,.75); font: 800 12px/1 var(--font-th-body), sans-serif; letter-spacing: .1em; text-transform: uppercase; color: ${TH.honeyDeep}; box-shadow: 0 0 0 2px #fff inset; }
@media (prefers-reduced-motion: reduce) { .th-jiggle { animation: none; } }
@media (max-height: 720px) { .th-gateBox { padding-top: 92px; } }
`;
