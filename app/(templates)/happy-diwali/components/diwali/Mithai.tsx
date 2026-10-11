"use client";

// Scene 7 — The mithai box. A maroon-and-gold sweet box tied with a ribbon.
// Tap it: the ribbon slips, the lid lifts away (the sender's note is written
// under it) and six of their favourite sweets sit on gold paper. Tap a sweet
// to take a bite. Then on to the Shubh Deepavali card.

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { burst, haptic, useReducedMotion } from "../../../_valentine/kit";
import { DIWALI_MITHAI, type DiwaliMithai } from "../../../_valentine/days/happy-diwali";
import { FONTS } from "../../../_valentine/theme";
import { Sweet } from "./art";
import { useDw, useNext } from "./stage";
import { DW, Hint, SceneTitle } from "./ui";

/** Outside the component: the React compiler treats these as impure inside it. */
const rand = () => Math.random();

const CSS = `
.dw-box { position: relative; width: min(86cqw, calc((100cqh - 20px) * 1.05), 400px); aspect-ratio: 1.15; }
.dw-box-base { position: absolute; left: 0; right: 0; bottom: 0; height: 74%; border-radius: 16px; background: linear-gradient(180deg, #8E1C3A, #5E0F26);
  box-shadow: inset 0 0 0 3px #E8B65A, inset 0 0 0 7px #8E1C3A, inset 0 0 0 8.5px rgba(255,211,110,.6), 0 26px 40px -18px rgba(0,0,0,.85); }
.dw-tray { position: absolute; left: 7%; right: 7%; top: 9%; bottom: 9%; border-radius: 10px; background: radial-gradient(circle at 50% 40%, #FFE6A3, #E9B04A);
  display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(2, 1fr); padding: 4%; gap: 4%; box-sizing: border-box; box-shadow: inset 0 3px 10px rgba(122,42,12,.45); }
.dw-sweet { border: 0; padding: 6%; background: radial-gradient(circle, rgba(255,255,255,.35), transparent 70%); border-radius: 50%; cursor: pointer; touch-action: manipulation; }
.dw-sweet:focus-visible { outline: 3px solid #FFF1B8; }
.dw-lid { position: absolute; left: -2%; right: -2%; top: 0; height: 74%; border-radius: 16px; cursor: pointer; border: 0; padding: 0;
  background: linear-gradient(180deg, #A82446, #6E1430); box-shadow: inset 0 0 0 3px #E8B65A, inset 0 0 0 9px #A82446, inset 0 0 0 10.5px rgba(255,211,110,.7), 0 18px 30px -12px rgba(0,0,0,.8);
  display: grid; place-items: center; color: #FFE6A3; touch-action: manipulation; }
.dw-lid:focus-visible { outline: 3px solid #FFF1B8; outline-offset: 4px; }
.dw-ribbon-v { position: absolute; top: 0; bottom: 0; left: 50%; width: 14%; transform: translateX(-50%); background: linear-gradient(90deg, #E8B65A, #FFE6A3, #E8B65A); }
.dw-ribbon-h { position: absolute; left: 0; right: 0; top: 50%; height: 14%; transform: translateY(-50%); background: linear-gradient(180deg, #E8B65A, #FFE6A3, #E8B65A); }
.dw-bow { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 30%; aspect-ratio: 1.6; }
.dw-lid-label { position: absolute; left: 50%; bottom: 10%; transform: translateX(-50%); padding: 4px 12px; border-radius: 99px; background: rgba(46,10,20,.55); font: 700 clamp(11px, 1.7dvh, 13px) ${FONTS.ui}; letter-spacing: .12em; text-transform: uppercase; white-space: nowrap; }
.dw-note { position: absolute; left: 0; right: 0; top: 0; margin: 0 auto; width: min(100%, 360px); box-sizing: border-box; padding: 10px 14px; border-radius: 12px; background: #FFF7E8; color: ${DW.paperInk};
  font: 700 clamp(15px, 2.4dvh, 19px)/1.3 var(--font-vw-script, cursive); box-shadow: 0 12px 26px -10px rgba(0,0,0,.7); text-align: center; overflow-wrap: anywhere; }
`;

function Bow() {
  return (
    <svg viewBox="0 0 80 50" className="dw-bow" aria-hidden>
      <path d="M40 25 C26 4 6 6 8 22 C10 36 28 34 40 25 Z" fill="#FFD36E" stroke="#B9802C" strokeWidth="2" />
      <path d="M40 25 C54 4 74 6 72 22 C70 36 52 34 40 25 Z" fill="#FFD36E" stroke="#B9802C" strokeWidth="2" />
      <path d="M36 27 L28 48 M44 27 L52 48" stroke="#E8B65A" strokeWidth="5" strokeLinecap="round" />
      <circle cx="40" cy="25" r="7" fill="#FFE6A3" stroke="#B9802C" strokeWidth="2" />
    </svg>
  );
}

export default function Mithai({ kind, note, onNext }: { kind: DiwaliMithai; note: string; onNext: () => void }) {
  const reduced = useReducedMotion();
  const { cue } = useDw();
  const [open, setOpen] = useState(false);
  const [bites, setBites] = useState<boolean[]>(() => Array.from({ length: 6 }, () => false));
  const m = DIWALI_MITHAI[kind] ?? DIWALI_MITHAI.laddoo;

  const openBox = () => {
    if (open) return;
    haptic([12, 30, 12]);
    cue("ribbon", { gain: 0.6 });
    window.setTimeout(() => cue("paper-rustle", { gain: 0.5 }), 250);
    setOpen(true);
    if (!reduced) window.setTimeout(() => burst({ kind: "sparkles", emojis: ["✨", "💛", "🌟"], origin: { x: 0.5, y: 0.55 }, count: 22 }), 400);
  };

  const bite = (i: number) => {
    if (bites[i]) return;
    haptic(10);
    cue("pop", { gain: 0.5, detune: (rand() - 0.5) * 500 });
    setBites((b) => b.map((v, k) => (k === i ? true : v)));
  };

  useNext(open ? "Your Diwali card" : null, onNext, "heart");

  const eaten = bites.filter(Boolean).length;
  return (
    <>
      <style>{CSS}</style>
      <SceneTitle kicker="One last thing" title={open ? `${m.label}, all yours` : "A box of something sweet"} sub={open ? undefined : "No Diwali is complete without mithai."} />
      <div className="dw-fill" style={{ gridTemplateRows: "auto minmax(0, 1fr)", gap: 10 }}>
        <div style={{ position: "relative", width: "100%", minHeight: open ? 64 : 0 }}>
          <AnimatePresence>
            {open && note && (
              <motion.p className="dw-note" initial={reduced ? false : { opacity: 0, y: 30, rotate: -4 }} animate={{ opacity: 1, y: 0, rotate: -1.5 }} transition={{ delay: reduced ? 0 : 0.5, type: "spring", stiffness: 160, damping: 15 }}>
                {note}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        <div className="dw-box">
          <div className="dw-box-base">
            <div className="dw-tray">
              {bites.map((b, i) => (
                <button key={i} type="button" className="dw-sweet" onClick={() => bite(i)} disabled={!open} aria-label={b ? `${m.label}, bitten` : `Take a bite of ${m.label}`}>
                  <motion.span style={{ display: "block", width: "100%", height: "100%" }} animate={b && !reduced ? { scale: [1, 0.86, 1] } : undefined}>
                    <Sweet kind={kind} bitten={b} id={`m${i}`} />
                  </motion.span>
                </button>
              ))}
            </div>
          </div>
          <motion.button
            type="button"
            className="dw-lid"
            onClick={openBox}
            aria-label="Open the box of sweets"
            aria-hidden={open}
            tabIndex={open ? -1 : 0}
            initial={false}
            animate={
              open
                ? reduced
                  ? { opacity: 0 }
                  : { y: "-70%", x: "30%", rotate: 22, opacity: 0, transition: { duration: 0.8, ease: [0.3, 0.7, 0.4, 1] } }
                : reduced
                  ? undefined
                  : { rotate: [0, -1.5, 1.5, 0], transition: { duration: 0.6, repeat: Infinity, repeatDelay: 2 } }
            }
            style={{ pointerEvents: open ? "none" : undefined }}
          >
            <span className="dw-ribbon-v" />
            <span className="dw-ribbon-h" />
            <Bow />
            <span className="dw-lid-label">Shubh Deepavali</span>
          </motion.button>
        </div>
      </div>
      <div style={{ flex: "none", minHeight: 40, display: "grid", placeItems: "center" }}>
        <Hint>{!open ? "Tap the box to open it 🎁" : eaten === 0 ? "Go on, take a bite 😋" : eaten < 6 ? `${eaten} gone. No one's counting 🤫` : "All six! Legendary 😄"}</Hint>
      </div>
    </>
  );
}
