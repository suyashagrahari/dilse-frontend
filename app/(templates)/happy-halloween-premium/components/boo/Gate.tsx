"use client";

// The gate: a haunted mailbox (with a face) wiggles at the foot of the screen.
// Tap it (or the button): the door flips down, the flag pops up, and a ghost
// pops out holding a letter: "BOO!" (a cute high woo). Like the kit's
// PremiumGate, everything audible happens synchronously inside the tap:
// p.open() (audio session, AudioContext, voice prime, YouTube unMute+play),
// then the cues; onOpen() follows when the ghost has said hello.

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { burst, haptic, useReducedMotion } from "../../../_valentine/kit";
import { requestTiltPermission, usePremium } from "../../../_valentine/kit/premium";
import { Ghost, Mailbox } from "./art";
import { DISPLAY, HAND } from "./fonts";
import type { Night } from "./model";
import { Gif, POP, Puffy, TextLink } from "./ui";

export default function Gate({ n, hello, justUnsealed, onOpen }: { n: Night; hello: string | null; justUnsealed: boolean; onOpen: () => void }) {
  const p = usePremium();
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<"idle" | "boo" | "out">("idle");
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
      p.sfx("pop", { gain: 0.5 });
      p.sfx("bn-woo", { gain: 0.9, at: 0.18 });
    }
    haptic([15, 40, 25]);
    setPhase("boo");
    burst({ kind: "hearts", origin: { x: 0.5, y: 0.5 }, count: 18, emojis: ["💜", "🧡", "✨", "🍬"] });
    window.setTimeout(() => setPhase("out"), reduce ? 200 : 1900);
    window.setTimeout(onOpen, reduce ? 450 : 2500);
  };

  const sealName: ReactNode = n.recipient;

  return (
    <div className={`bn-scene bn-gate is-${phase}`} role="dialog" aria-modal="true" aria-label={`A letter for ${n.recipient}`}>
      <div className="bn-gateTop">
        <p className="bn-kicker">{justUnsealed ? "Unsealed at midnight 🌙" : "Special delivery · 31 October"}</p>
        <motion.h1 className="bn-gateName" initial={{ scale: 0.5, rotate: -6, opacity: 0 }} animate={{ scale: 1, rotate: -2, opacity: 1 }} transition={{ ...POP, delay: 0.15 }}>
          Psst, <span>{n.recipient}</span>…
        </motion.h1>
        <p className="bn-sub">Your mailbox is acting a little spooky tonight.</p>
      </div>

      <button type="button" className="bn-gateBox" onClick={() => open()} aria-label="Open the mailbox" tabIndex={-1}>
        <AnimatePresence>
          {phase !== "idle" && (
            <motion.span
              className="bn-gateGhost"
              initial={{ y: 90, scale: 0.3, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 11 }}
            >
              <span className="bn-boo">BOO!</span>
              <Ghost size={130} mood="boo" hold="letter" />
            </motion.span>
          )}
        </AnimatePresence>
        <span className={phase === "idle" ? "bn-shake" : undefined} style={{ display: "inline-block" }}>
          <Mailbox open={phase !== "idle"} size={250} />
        </span>
        <span className="bn-gatePlate">{n.house}</span>
        <Gif src={hello} size={104} tilt={-8} eager className="bn-gateGif" />
      </button>

      <div className="bn-foot">
        <Puffy onClick={() => open()} disabled={phase !== "idle"}>
          Open the mailbox 💌
        </Puffy>
        <p className="bn-tuning" aria-live="polite">{tuning ? "tuning the music…" : "sound on 🎧"}</p>
        <div className="bn-seal">
          <span aria-hidden>👻</span>
          <span>Hand-made for {sealName}</span>
        </div>
        <TextLink onClick={() => open(true)}>Open quietly</TextLink>
      </div>
      <style>{GATE_CSS}</style>
    </div>
  );
}

const GATE_CSS = `
.bn-gate { z-index: 20; transition: opacity .6s ease; }
.bn-gate.is-out { opacity: 0; pointer-events: none; }
.bn-gateTop { display: grid; justify-items: center; gap: 8px; margin-top: 4px; }
.bn-gateName { margin: 0; font: 400 clamp(40px, 12vw, 64px)/1 ${DISPLAY}; color: #fff; text-shadow: 0 4px 0 rgba(42,31,61,.4); }
.bn-gateName span { color: ${"#FFD27A"}; }
.bn-gateBox { all: unset; position: relative; display: grid; place-items: center; cursor: pointer; margin: auto 0; padding-top: 70px; -webkit-tap-highlight-color: transparent; }
.bn-gateGhost { position: absolute; top: 0; left: 50%; margin-left: -65px; z-index: 0; display: grid; justify-items: center; }
.bn-boo { position: absolute; top: -26px; left: 92px; font: 400 34px/1 ${DISPLAY}; color: ${"#FF9EC4"}; transform: rotate(10deg); text-shadow: 0 3px 0 #fff, 0 6px 14px rgba(30,16,60,.4); white-space: nowrap; }
.bn-gateBox > span:nth-of-type(2) { position: relative; z-index: 1; }
.bn-gatePlate { position: absolute; z-index: 2; bottom: 70px; left: 50%; transform: translateX(-50%) rotate(-3deg); background: #FFF4E3; color: #2A1F3D; padding: 6px 14px; border-radius: 12px;
  font: 400 19px/1 ${HAND}; box-shadow: 0 0 0 3px #fff inset, 0 6px 14px rgba(30,16,60,.35); white-space: nowrap; max-width: 92vw; overflow: hidden; text-overflow: ellipsis; }
.bn-gateGif { position: absolute; z-index: 3; left: -40px; top: 96px; }
.bn-shake { animation: bn-shake 2.6s ease-in-out infinite; transform-origin: 50% 100%; }
@keyframes bn-shake { 0%, 70%, 100% { transform: rotate(0) } 74% { transform: rotate(-4deg) translateY(-3px) } 78% { transform: rotate(4deg) } 82% { transform: rotate(-3deg) translateY(-2px) } 86% { transform: rotate(2deg) } 90% { transform: rotate(0) } }
.bn-doorOpen { transform: scaleY(-.32); transition: transform .45s cubic-bezier(.34,1.56,.64,1); }
.bn-door { transition: transform .3s ease; }
.bn-flag { transform: rotate(0); transition: transform .4s cubic-bezier(.34,1.56,.64,1); }
.bn-flagUp { transform: rotate(-80deg); transition: transform .5s cubic-bezier(.34,1.56,.64,1) .15s; }
.bn-tuning { margin: 0; font: 700 13px/1 var(--font-bn-body), sans-serif; color: rgba(237,228,255,.75); min-height: 14px; }
.bn-seal { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px 6px 8px; border-radius: 99px; background: rgba(42,31,61,.4); font: 800 12px/1 var(--font-bn-body), sans-serif; letter-spacing: .1em; text-transform: uppercase; color: #FFD27A; }
@media (prefers-reduced-motion: reduce) { .bn-shake { animation: none; } }
@media (max-height: 700px) { .bn-gateBox { padding-top: 40px; } }
`;
