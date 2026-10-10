"use client";

// The gate: the title card (slot hb1: "HAPPY HALLOWEEN" with a penguin peeking
// out of a pumpkin) over a haunted mailbox with a face that wiggles. Tap it:
// the door flips down, the flag pops up and a ghost BURSTS out at the screen
// (scare #1: the boo sample, the piano ducks, a buzz, a little shake), then
// shrinks back, giggles and holds up the letter. Like the kit's PremiumGate,
// everything audible starts synchronously inside the tap: p.open() (audio
// session, AudioContext, the haunted piano), then the cues; onOpen() follows
// once the ghost has said sorry. Kids pages: a cute pop, no scare.

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { burst, haptic, useReducedMotion } from "../../../_valentine/kit";
import { requestTiltPermission, usePremium } from "../../../_valentine/kit/premium";
import { Bat, Ghost, Mailbox } from "./art";
import { DISPLAY, HAND } from "./fonts";
import type { Night } from "./model";
import { useBoo } from "./Scare";
import { GIF } from "./gifs";
import { Manor } from "./haunt";
import { Gif, NextButton, POP } from "./ui";

type Phase = "idle" | "boo" | "giggle" | "out";

export default function Gate({ n, hello, justUnsealed, onOpen }: { n: Night; hello: string | null; justUnsealed: boolean; onOpen: () => void }) {
  const p = usePremium();
  const boo = useBoo();
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("idle");
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  useEffect(() => {
    const t = timers.current;
    return () => t.forEach((x) => window.clearTimeout(x));
  }, []);
  const scary = boo.enabled && !reduce;

  // (v8: no "open quietly" link; the engine's music icon bottom-left mutes)
  const open = () => {
    if (phase !== "idle") return;
    p.open();
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

  const out = phase !== "idle";

  return (
    <div className={`bn-scene bn-gate is-${phase}`} role="dialog" aria-modal="true" aria-label={`A letter for ${n.recipient}`}>
      <div className="bn-gateTop">
        <p className="bn-kicker">{justUnsealed ? "Unsealed at midnight 🌙" : "Special delivery · 31 October"}</p>
        <Gif src={hello} size={140} tilt={-3} eager float={false} className="bn-gateCard" />
        <motion.h1 className="bn-gateName" initial={{ scale: 0.5, rotate: -6, opacity: 0 }} animate={{ scale: 1, rotate: -2, opacity: 1 }} transition={{ ...POP, delay: 0.15 }}>
          Psst, <span>{n.recipient}</span>…
        </motion.h1>
        <p className="bn-sub">Your mailbox is acting a little spooky tonight.</p>
      </div>

      <button type="button" className="bn-gateBox" onClick={() => open()} aria-label="Open the mailbox" tabIndex={-1}>
        {/* v6: the haunted house behind the mailbox, a grave whose zombie hand waves, a pumpkin in a witch hat */}
        <span className="bn-manorWrap" aria-hidden>
          <Manor />
          <span className="bn-yard is-l" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={GIF.grave} alt="" width={150} height={139} decoding="async" draggable={false} />
          </span>
          <span className="bn-yard is-r" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={GIF.witchPumpkin} alt="" width={240} height={285} decoding="async" draggable={false} />
          </span>
        </span>
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
          <span className="bn-gatePlate">
            <span className="bn-plateBat is-l" aria-hidden>
              <Bat size={22} />
            </span>
            <span className="bn-plateTxt">{n.house}</span>
            <span className="bn-plateBat is-r" aria-hidden>
              <Bat size={22} />
            </span>
          </span>
        </span>
      </button>


      <div className="bn-foot">
        <NextButton quiet onClick={() => open()} disabled={out}>
          Open the mailbox
        </NextButton>
      </div>
      <style>{GATE_CSS}</style>
    </div>
  );
}

const GATE_CSS = `
.bn-gate { z-index: 20; transition: opacity .6s ease; }
.bn-gate.is-out { opacity: 0; pointer-events: none; }
/* v8 (owner, 11 Oct): one clean column. The kicker sits right under the top bar, then a
   small title card + the headline in the sky, then the whole manor below the roof line,
   and the mailbox (with its house sign on the post) at the manor's door. */
.bn-scene.bn-gate { --bn-manorW: min(150vw, 70dvh, 660px); padding-top: max(62px, calc(env(safe-area-inset-top, 0px) + 54px)); gap: 0; }
.bn-gateTop { position: relative; z-index: 5; display: grid; justify-items: center; gap: 0; flex: none; max-width: 100%; }
.bn-gateTop .bn-kicker { font-size: 11px; letter-spacing: .14em; white-space: nowrap; text-shadow: 0 1px 2px rgba(20,10,40,.8); }
.bn-gateTop .bn-sub { max-width: 23ch; margin-top: clamp(4px, .9dvh, 8px); text-shadow: 0 1px 2px rgba(20,10,40,.9), 0 0 12px rgba(20,10,40,.75); }
.bn-gateCard { width: clamp(100px, 15dvh, 140px) !important; height: clamp(100px, 15dvh, 140px) !important; margin: clamp(4px, 1.8dvh, 20px) 0 0; }
.bn-gateName { margin: clamp(-6px, -.5dvh, -2px) 0 0; font: 400 clamp(34px, min(11vw, 5.6dvh), 56px)/1.05 ${DISPLAY}; color: #fff; text-shadow: 0 4px 0 rgba(42,31,61,.4), 0 0 18px rgba(20,10,40,.5); }
.bn-gateName span { color: #FFD27A; }
.bn-gateBox { all: unset; flex: 1 1 0; min-height: 0; width: 100%; container-type: size; display: grid; grid-template-rows: minmax(0, 1fr); place-items: end center; cursor: pointer; -webkit-tap-highlight-color: transparent; position: relative; z-index: 4; }
.bn-manorWrap { position: absolute; z-index: 0; left: 50%; bottom: 0; width: calc(var(--bn-manorW) / var(--bn-z, 1)); transform: translateX(-50%); display: grid; align-items: end; pointer-events: none; }
@media (min-width: 768px) { .bn-scene.bn-gate { --bn-manorW: min(88vw, 74dvh, 1280px); } .bn-gateTop .bn-sub { max-width: 40ch; } .bn-manorWrap { bottom: -6px; } }
.bn-gate.is-out .bn-manorWrap, .bn-gate.is-out .bn-yard { opacity: 0; transition: opacity .5s ease; }
.bn-yard { position: absolute; z-index: 3; bottom: 0; pointer-events: none; }
.bn-yard img { display: block; width: 100%; height: auto; filter: drop-shadow(0 6px 8px rgba(20,10,40,.45)); }
.bn-yard.is-l { left: 0; width: 21%; }
.bn-yard.is-r { right: 1%; width: 17%; }
/* phones: the manor overflows the screen sides, so its yard steps in */
@media (max-width: 767px) { .bn-yard.is-l { left: 19%; width: 17%; } .bn-yard.is-r { right: 19%; width: 13%; } }
/* the mailbox stands at the door, sized off the manor (door = 14% of the manor's width) */
.bn-mbWrap { position: relative; z-index: 2; height: min(70%, calc(var(--bn-manorW) / var(--bn-z, 1) * .33)); aspect-ratio: 220 / 300; display: grid; align-items: end; justify-items: center; }
.bn-mb { position: relative; z-index: 1; display: block; width: 100%; height: auto; transform-origin: 50% 100%; }
.bn-mb svg { display: block; width: 100%; height: auto; }
.bn-gateGhost { position: absolute; top: 0; left: 50%; width: 130px; margin-left: -65px; z-index: 0; display: grid; justify-items: center; transform-origin: 50% 70%; }
.bn-gate.is-boo .bn-gateGhost { z-index: 5; }
.bn-boo { position: absolute; top: -34px; left: 50%; margin-left: -70px; width: 140px; text-align: center; font: 400 40px/1 ${DISPLAY}; color: #FF9EC4; text-shadow: 0 3px 0 #fff, 0 6px 14px rgba(30,16,60,.4); white-space: nowrap; }
.bn-sorry { position: absolute; top: -34px; left: 50%; translate: -20% 0; padding: 6px 12px; border-radius: 16px 16px 16px 4px; background: #FFFBF4; color: #2A1F3D; font: 400 18px/1 ${HAND}; white-space: nowrap; box-shadow: 0 0 0 2px #fff inset, 0 6px 14px rgba(30,16,60,.35); }
/* the house sign: a little cream plaque with a wooden rim, nailed to the post under the box */
.bn-gatePlate { position: absolute; z-index: 2; bottom: 17.5%; left: 50%; transform: translateX(-50%) rotate(-3deg); display: inline-flex; align-items: center; gap: 2px; max-width: min(72vw, 300px);
  padding: 4px 9px 5px; border-radius: 9px; background: linear-gradient(180deg, #FFF8EC, #FBE6C6); color: #2A1F3D; box-shadow: 0 0 0 2px #9A6A45, 0 0 0 4px rgba(255,244,227,.35), 0 6px 12px rgba(20,10,40,.45); }
.bn-plateTxt { font: 400 clamp(13px, 1.8dvh, 17px)/1.05 ${HAND}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; padding: 0 2px; }
.bn-plateBat { position: absolute; top: 50%; display: block; line-height: 0; pointer-events: none; }
.bn-plateBat svg { display: block; width: 26px; height: auto; }
.bn-plateBat.is-l { left: -25px; transform: translateY(-62%) rotate(-14deg); }
.bn-plateBat.is-r { right: -25px; transform: translateY(-62%) rotate(14deg) scaleX(-1); }
.bn-shake { animation: bn-shake 2.6s ease-in-out infinite; }
@keyframes bn-shake { 0%, 70%, 100% { transform: rotate(0) } 74% { transform: rotate(-4deg) translateY(-3px) } 78% { transform: rotate(4deg) } 82% { transform: rotate(-3deg) translateY(-2px) } 86% { transform: rotate(2deg) } 90% { transform: rotate(0) } }
.bn-doorOpen { transform: scaleY(-.32); transition: transform .45s cubic-bezier(.34,1.56,.64,1); }
.bn-door { transition: transform .3s ease; }
.bn-flag { transform: rotate(0); transition: transform .4s cubic-bezier(.34,1.56,.64,1); }
.bn-flagUp { transform: rotate(-80deg); transition: transform .5s cubic-bezier(.34,1.56,.64,1) .15s; }
@media (prefers-reduced-motion: reduce) { .bn-shake { animation: none; } }
`;
