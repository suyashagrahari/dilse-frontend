"use client";

// Room 1 — Warm the seal. A wax seal pressed with lips holds the envelope
// shut. Press and hold: the wax glows, softens and drips (a warm crackle
// under the finger), the flap lifts and the letter-sheet peeks out. A small
// aside about the X: people have signed letters with a kiss for ~250 years.

import { useEffect, useRef } from "react";
import { sfx } from "../../../_valentine/kit/premium";
import { useHoldProgress, useReducedMotion } from "../../../_valentine/kit";
import { WaxSeal } from "./art";
import { SERIF } from "./fonts";
import type { Kisses } from "./model";
import { Hint, Kicker, Room, Satin, Title } from "./ui";

export default function Seal({ k, onNext }: { k: Kisses; onNext: () => void }) {
  const reduce = useReducedMotion();
  const hold = useHoldProgress({
    duration: 1300,
    taps: 4,
    onComplete: () => {
      sfx("ribbon", { gain: 0.6 });
      sfx("paper-rustle", { at: 0.2, gain: 0.6 });
      sfx("chime", { at: 0.3, gain: 0.5 });
    },
  });
  const drips = useRef(0);
  useEffect(() => {
    if (!hold.holding) return;
    const bed = sfx("kd-wax", { gain: 0.8 });
    return () => bed.stop(250);
  }, [hold.holding]);
  useEffect(() => {
    const d = Math.floor(hold.progress * 3.3);
    if (d > drips.current && d <= 3) {
      drips.current = d;
      sfx("kd-drip", { gain: 0.7 });
    }
  }, [hold.progress]);

  const open = hold.done;
  return (
    <Room label="Warm the seal" className="kd-seal">
      <Kicker>Sealed with a kiss</Kicker>
      <Title>{open ? "It's open" : "Warm the seal"}</Title>
      <div className={`kd-sealStage${open ? " is-open" : ""}`}>
        <div className="kd-sheet" aria-hidden>
          <span style={{ fontFamily: SERIF }}>For {k.recipient}</span>
          <i>x x x</i>
        </div>
        <div className="kd-flap" aria-hidden />
        <button type="button" className={`kd-sealBtn${hold.holding ? " is-hold" : ""}`} {...hold.bind} aria-label="Press and hold to warm the wax seal" disabled={open}>
          <WaxSeal shade={k.S.c} melt={reduce ? (open ? 1 : hold.progress) : hold.progress} cute={!k.lipstick} />
        </button>
      </div>
      {open ? (
        <>
          <p className="kd-aside" style={{ fontFamily: SERIF }}>
            People have signed letters with an <b>x</b> for a kiss for about 250 years.
            <br />
            Here are a few more.
          </p>
          <Satin big onClick={() => { sfx("kd-mwah", { gain: 0.8 }); onNext(); }}>Catch them →</Satin>
        </>
      ) : (
        <Hint>{hold.progress > 0.05 ? "Keep it warm…" : "Press and hold the seal"}</Hint>
      )}
      <style>{CSS}</style>
    </Room>
  );
}

const CSS = `
.kd-sealStage { position: relative; width: min(82vw, 340px); aspect-ratio: 320 / 230; margin-top: 8px; transition: margin-top .8s ease; }
.kd-sheet { position: absolute; left: 9%; right: 9%; top: 18%; height: 70%; border-radius: 6px; background: #FFFDF8; box-shadow: 0 6px 20px rgba(60,10,25,.2);
  display: grid; place-content: center; gap: 4px; transition: transform 1s cubic-bezier(.22,1,.36,1), opacity .3s; }
.kd-sheet span { font-size: 22px; font-style: italic; color: var(--vw-ink); }
.kd-sheet i { font: 700 18px/1 var(--font-kd-hand), cursive; letter-spacing: .3em; color: var(--vw-accent); }
.kd-sheet { opacity: 0; } .kd-sealStage.is-open .kd-sheet { opacity: 1; transform: translateY(-34%); }
.kd-sealStage.is-open { margin-top: 48px; }
.kd-sealStage::before { content: ""; position: absolute; inset: 12% 0 0; border-radius: 10px; background: linear-gradient(160deg, #FFF9F2, #EED9C6); box-shadow: 0 30px 50px -20px rgba(60,6,20,.55); z-index: 0; }
.kd-sheet { z-index: 1; }
.kd-sealStage::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 58%; border-radius: 0 0 10px 10px; z-index: 2;
  background: linear-gradient(180deg, #F7E8DA, #F1DECB); clip-path: polygon(0 0, 50% 46%, 100% 0, 100% 100%, 0 100%); }
.kd-flap { position: absolute; left: 0; right: 0; top: 12%; height: 52%; z-index: 3; transform-origin: 50% 0; transition: transform 1s cubic-bezier(.22,1,.36,1);
  background: linear-gradient(180deg, #FBEFE4, #F1DECB); clip-path: polygon(0 0, 100% 0, 50% 100%); filter: drop-shadow(0 4px 4px rgba(0,0,0,.1)); }
.kd-sealStage.is-open .kd-flap { transform: rotateX(178deg) scaleY(.55); z-index: 0; }
.kd-sealBtn { all: unset; position: absolute; left: 50%; top: 58%; width: 38%; aspect-ratio: 1; transform: translate(-50%, -50%); z-index: 4; cursor: pointer;
  -webkit-tap-highlight-color: transparent; transition: transform .3s, opacity .8s; touch-action: none; }
.kd-sealBtn.is-hold { transform: translate(-50%, -50%) scale(.97); }
.kd-sealBtn:focus-visible { outline: 3px solid var(--vw-accent); outline-offset: 4px; border-radius: 50%; }
.kd-sealStage.is-open .kd-sealBtn { opacity: 0; transform: translate(-50%, 10%) scale(.9) rotate(18deg); pointer-events: none; }
.kd-aside { margin: 4px 0 0; max-width: 30ch; font-size: 18px; font-style: italic; line-height: 1.45; color: var(--vw-ink-soft); animation: kd-in 1s ease both; }
.kd-aside b { font: 700 22px/1 var(--font-kd-hand), cursive; color: var(--vw-accent); }
@media (prefers-reduced-motion: reduce) { .kd-sheet, .kd-flap { transition: none; } }
`;
