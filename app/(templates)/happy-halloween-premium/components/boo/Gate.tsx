"use client";

// The gate: the title card (slot hb1: "HAPPY HALLOWEEN" with a penguin peeking
// out of a pumpkin) over a haunted mailbox with a face that wiggles. Tap it:
// the door flips down, the flag pops up and a ghost BURSTS out at the screen
// (scare #1: the boo sample, the piano ducks, a buzz, a little shake), then
// shrinks back, giggles and holds up the letter. Like the kit's PremiumGate,
// everything audible starts synchronously inside the tap: p.open() (audio
// session, AudioContext, the haunted piano), then the cues; onOpen() follows
// once the ghost has said sorry. Kids pages: a cute pop, no scare.

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { burst, haptic, useReducedMotion } from "../../../_valentine/kit";
import { requestTiltPermission, usePremium } from "../../../_valentine/kit/premium";
import { Ghost, Mailbox } from "./art";
import { BODY, DISPLAY, HAND } from "./fonts";
import type { Night } from "./model";
import { useBoo } from "./Scare";
import { Gif, NextButton, POP, TextLink } from "./ui";

type Phase = "idle" | "boo" | "giggle" | "out";

export default function Gate({ n, hello, justUnsealed, onOpen }: { n: Night; hello: string | null; justUnsealed: boolean; onOpen: () => void }) {
  const p = usePremium();
  const boo = useBoo();
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("idle");
  const [waited, setWaited] = useState(false);
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  useEffect(() => {
    const t = timers.current;
    const w = window.setTimeout(() => setWaited(true), 4000);
    return () => {
      window.clearTimeout(w);
      t.forEach((x) => window.clearTimeout(x));
    };
  }, []);
  const tuning = !!p.music && p.music.mode === "youtube" && !p.music.ready && !waited;
  const scary = boo.enabled && !reduce;

  const open = (quiet = false) => {
    if (phase !== "idle") return;
    p.open({ quiet });
    void requestTiltPermission();
    p.sfx("pop", { gain: 0.5 });
    setPhase("boo");
    if (boo.enabled) {
      // the ghost lunges at ~0.26 s: the boo + duck + buzz land with it
      boo.sound(reduce ? 0 : 270);
      later(() => boo.shake(), 280);
    } else {
      p.sfx("bn-woo", { gain: 0.9, at: 0.18 });
      haptic([15, 40, 25]);
    }
    const t = scary ? 1250 : 500;
    later(() => {
      setPhase("giggle");
      p.sfx("bn-giggle", { gain: 0.7 });
      burst({ kind: "hearts", origin: { x: 0.5, y: 0.5 }, count: 18, emojis: ["💜", "🧡", "✨", "🍬"] });
    }, t);
    later(() => setPhase("out"), t + (reduce ? 700 : 1700));
    later(onOpen, t + (reduce ? 950 : 2300));
  };

  const sealName: ReactNode = n.recipient;
  const out = phase !== "idle";

  return (
    <div className={`bn-scene bn-gate is-${phase}`} role="dialog" aria-modal="true" aria-label={`A letter for ${n.recipient}`}>
      <div className="bn-gateTop">
        <p className="bn-kicker">{justUnsealed ? "Unsealed at midnight 🌙" : "Special delivery · 31 October"}</p>
        <Gif src={hello} size={170} tilt={-3} eager float={false} className="bn-gateCard" />
        <motion.h1 className="bn-gateName" initial={{ scale: 0.5, rotate: -6, opacity: 0 }} animate={{ scale: 1, rotate: -2, opacity: 1 }} transition={{ ...POP, delay: 0.15 }}>
          Psst, <span>{n.recipient}</span>…
        </motion.h1>
        <p className="bn-sub">Your mailbox is acting a little spooky tonight.</p>
      </div>

      <button type="button" className="bn-gateBox" onClick={() => open()} aria-label="Open the mailbox" tabIndex={-1}>
        <span className="bn-mbWrap">
          <AnimatePresence>
            {out && (
              <motion.span
                key="g"
                className="bn-gateGhost"
                initial={{ y: 90, scale: 0.3, opacity: 0 }}
                animate={
                  phase === "boo" && scary
                    ? { y: [90, -10, 60], scale: [0.3, 1, 2.5], opacity: [0, 1, 1] }
                    : { y: 0, scale: 1, opacity: 1 }
                }
                exit={{ opacity: 0 }}
                transition={
                  phase === "boo" && scary
                    ? { duration: 0.5, times: [0, 0.5, 1], ease: ["easeOut", [0.2, 1.4, 0.4, 1]] }
                    : { type: "spring", stiffness: 260, damping: 13 }
                }
              >
                <AnimatePresence>
                  {phase === "boo" && (
                    <motion.span
                      key="b"
                      className="bn-boo"
                      initial={{ scale: 0.2, opacity: 0, rotate: -14 }}
                      animate={{ scale: 1, opacity: 1, rotate: -6 }}
                      exit={{ scale: 0.6, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 14, delay: scary ? 0.24 : 0.1 }}
                    >
                      BOO!
                    </motion.span>
                  )}
                </AnimatePresence>
                <Ghost size={130} mood={phase === "boo" ? "boo" : "wink"} hold="letter" />
                <AnimatePresence>
                  {phase !== "boo" && (
                    <motion.span key="s" className="bn-sorry" initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} transition={POP}>
                      hehe, got you! 💜
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.span>
            )}
          </AnimatePresence>
          <span className={phase === "idle" ? "bn-shake bn-mb" : "bn-mb"}>
            <Mailbox open={out} size={220} />
          </span>
          <span className="bn-gatePlate">{n.house}</span>
        </span>
      </button>

      <div className="bn-gateMeta">
        <span className="bn-seal">
          <span aria-hidden>👻</span>
          <span>Hand-made for {sealName}</span>
        </span>
        <span className="bn-tuning" aria-live="polite">
          {tuning ? "tuning the music…" : "sound on 🎧"} ·{" "}
          <TextLink onClick={() => open(true)} style={{ minHeight: 36, padding: "0 4px", fontSize: 13 }}>
            open quietly
          </TextLink>
        </span>
      </div>

      <div className="bn-foot">
        <NextButton quiet onClick={() => open()} disabled={out}>
          Open the mailbox 💌
        </NextButton>
      </div>
      <style>{GATE_CSS}</style>
    </div>
  );
}

const GATE_CSS = `
.bn-gate { z-index: 20; transition: opacity .6s ease; }
.bn-gate.is-out { opacity: 0; pointer-events: none; }
.bn-gateTop { display: grid; justify-items: center; gap: clamp(2px, .8dvh, 8px); flex: none; max-width: 100%; }
.bn-gateTop .bn-sub { max-width: 30ch; }
.bn-gateCard { width: clamp(92px, 19dvh, 176px) !important; height: clamp(92px, 19dvh, 176px) !important; margin: -2px 0 -4px; }
.bn-gateName { margin: 0; font: 400 clamp(36px, min(12vw, 7dvh), 62px)/1 ${DISPLAY}; color: #fff; text-shadow: 0 4px 0 rgba(42,31,61,.4); }
.bn-gateName span { color: #FFD27A; }
.bn-gateBox { all: unset; flex: 1 1 0; min-height: 0; width: 100%; display: grid; grid-template-rows: minmax(0, 1fr); place-items: end center; cursor: pointer; -webkit-tap-highlight-color: transparent; position: relative; z-index: 4; }
.bn-mbWrap { position: relative; height: min(100%, 350px); aspect-ratio: 220 / 300; display: grid; align-items: end; justify-items: center; }
.bn-mb { position: relative; z-index: 1; display: block; width: 100%; height: auto; transform-origin: 50% 100%; }
.bn-mb svg { display: block; width: 100%; height: auto; }
.bn-gateGhost { position: absolute; top: 0; left: 50%; width: 130px; margin-left: -65px; z-index: 0; display: grid; justify-items: center; transform-origin: 50% 70%; }
.bn-gate.is-boo .bn-gateGhost { z-index: 5; }
.bn-boo { position: absolute; top: -34px; left: 50%; margin-left: -70px; width: 140px; text-align: center; font: 400 40px/1 ${DISPLAY}; color: #FF9EC4; text-shadow: 0 3px 0 #fff, 0 6px 14px rgba(30,16,60,.4); white-space: nowrap; }
.bn-sorry { position: absolute; top: -34px; left: 50%; translate: -20% 0; padding: 6px 12px; border-radius: 16px 16px 16px 4px; background: #FFFBF4; color: #2A1F3D; font: 400 18px/1 ${HAND}; white-space: nowrap; box-shadow: 0 0 0 2px #fff inset, 0 6px 14px rgba(30,16,60,.35); }
.bn-gatePlate { position: absolute; z-index: 2; bottom: 18%; left: 50%; transform: translateX(-50%) rotate(-3deg); background: #FFF4E3; color: #2A1F3D; padding: 6px 14px; border-radius: 12px;
  font: 400 clamp(15px, 2.4dvh, 19px)/1 ${HAND}; box-shadow: 0 0 0 3px #fff inset, 0 6px 14px rgba(30,16,60,.35); white-space: nowrap; max-width: 86vw; overflow: hidden; text-overflow: ellipsis; }
.bn-shake { animation: bn-shake 2.6s ease-in-out infinite; }
@keyframes bn-shake { 0%, 70%, 100% { transform: rotate(0) } 74% { transform: rotate(-4deg) translateY(-3px) } 78% { transform: rotate(4deg) } 82% { transform: rotate(-3deg) translateY(-2px) } 86% { transform: rotate(2deg) } 90% { transform: rotate(0) } }
.bn-doorOpen { transform: scaleY(-.32); transition: transform .45s cubic-bezier(.34,1.56,.64,1); }
.bn-door { transition: transform .3s ease; }
.bn-flag { transform: rotate(0); transition: transform .4s cubic-bezier(.34,1.56,.64,1); }
.bn-flagUp { transform: rotate(-80deg); transition: transform .5s cubic-bezier(.34,1.56,.64,1) .15s; }
.bn-gateMeta { display: grid; justify-items: center; gap: 0; flex: none; }
.bn-tuning { display: inline-flex; align-items: center; gap: 2px; margin: 0; font: 700 13px/1 ${BODY}; color: rgba(237,228,255,.8); min-height: 36px; }
.bn-seal { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px 6px 8px; border-radius: 99px; background: rgba(42,31,61,.4); font: 800 12px/1 ${BODY}; letter-spacing: .1em; text-transform: uppercase; color: #FFD27A; }
@media (prefers-reduced-motion: reduce) { .bn-shake { animation: none; } }
`;
