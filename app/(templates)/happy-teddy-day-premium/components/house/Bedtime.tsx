"use client";

// Room 7 · The bedroom. He's yawning in his little bed. Pull the patchwork blanket up over him (drag it up): when
// it reaches his chin the lights dim, stars come out over the house, a night-light glows, he closes his eyes and
// whispers "Goodnight, Riya". Then a folded note peeks out from under his pillow: the sealed P.S. (premium.psLetter).

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { burst, haptic, useReducedMotion } from "../../../_valentine/kit";
import { sfx, usePremium } from "../../../_valentine/kit/premium";
import type { TeddyItem } from "../../../_valentine/days/happy-teddy-day-premium";
import { heartPath, Teddy } from "./art";
import { HAND } from "./fonts";
import { GIF } from "./gifs";
import { TH, type House } from "./model";
import { Bubble, Gif, Header, Hint, Later, POP, Puffy, TextLink } from "./ui";

const LIFT = 140;

export default function Bedtime({
  h, snuggle, step, total, name, worn, onNight, onNext,
}: { h: House; snuggle: string | null; step: number; total: number; name: string; worn: TeddyItem[]; onNight: (on: boolean) => void; onNext: () => void }) {
  const p = usePremium();
  const reduce = useReducedMotion();
  const ps = p.premium.psLetter?.trim() ?? "";
  const [lift, setLift] = useState(0);
  const [tucked, setTucked] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [notePeek, setNotePeek] = useState(false);
  const drag = useRef<{ y: number; l: number } | null>(null);
  const timers = useRef<number[]>([]);
  useEffect(() => {
    const t = timers.current;
    return () => t.forEach((id) => window.clearTimeout(id));
  }, []);
  useEffect(() => () => onNight(false), [onNight]);

  const tuck = () => {
    if (tucked) return;
    setLift(1);
    setTucked(true);
    onNight(true);
    haptic([30, 80, 30]);
    sfx("swoosh-soft", { gain: 0.5 });
    sfx("th-yawn", { gain: 0.7, at: 0.3 });
    sfx("chime", { gain: 0.35, at: 1.2 });
    timers.current.push(window.setTimeout(() => burst({ kind: "sparkles", origin: { x: 0.5, y: 0.3 }, count: 12, emojis: ["⭐", "✨", "🌙"] }), reduce ? 0 : 900));
    if (ps) timers.current.push(window.setTimeout(() => setNotePeek(true), reduce ? 300 : 2600));
  };

  const onDown = (e: React.PointerEvent) => {
    if (tucked) return;
    drag.current = { y: e.clientY, l: lift };
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current || tucked) return;
    const l = Math.max(0, Math.min(1, drag.current.l + (drag.current.y - e.clientY) / LIFT));
    setLift(l);
    if (l > 0.82) tuck();
  };
  const onUp = () => {
    drag.current = null;
    if (!tucked) setLift((l) => (l > 0.82 ? l : l * 0.6));
  };

  const openNote = () => {
    setNoteOpen(true);
    sfx("paper-rustle", { gain: 0.6 });
    sfx("chime", { gain: 0.4, at: 0.3 });
    haptic(12);
  };

  return (
    <div className={`th-scene th-bed${tucked ? " is-night" : ""}`}>
      <Header
        step={step}
        total={total}
        room="Room 7 · The bedroom"
        title={tucked ? <>Shh… {name} is asleep</> : <>Time to tuck him in</>}
        sub={tucked ? undefined : "Pull the blanket up over him."}
      />

      <div className="th-bedroom">
        <span className="th-window" aria-hidden>
          <span className="th-moon" />
        </span>
        <span className={`th-lamp${tucked ? " is-on" : ""}`} aria-hidden>
          <i />
        </span>
        <AnimatePresence>
          {tucked && (
            <Bubble k="gn" className="th-gn">
              Goodnight, {h.callHer}. 💤
            </Bubble>
          )}
        </AnimatePresence>
        <div className="th-bedFrame">
          <span className="th-headboard" aria-hidden>
            <svg viewBox="0 0 32 32" width={30} height={30}>
              <path d={heartPath(16, 17, 26)} fill="#FF8FAB" />
            </svg>
          </span>
          <span className="th-pillow" aria-hidden />
          <span className="th-bedTeddy">
            <Teddy size={150} mood={tucked ? "sleep" : lift > 0.3 ? "shy" : "open"} pose="down" worn={worn.filter((w) => w !== "glasses" && w !== "cap")} heart />
          </span>
          {tucked && (
            <span className="th-zzz th-zzzBed" aria-hidden>
              <i>z</i>
              <i>z</i>
              <i>Z</i>
            </span>
          )}
          <AnimatePresence>
            {notePeek && !noteOpen && (
              <motion.button type="button" className="th-peekNote" onClick={openNote} initial={{ x: -40, opacity: 0, rotate: -20 }} animate={{ x: 0, opacity: 1, rotate: -8 }} exit={{ opacity: 0 }} transition={POP} aria-label="Read the note under his pillow">
                <span>a note for you</span>
              </motion.button>
            )}
          </AnimatePresence>
          <div
            className="th-blanket"
            style={{ height: 40 + lift * 58 }}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            role="slider"
            aria-label="Pull the blanket up"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(lift * 100)}
            tabIndex={0}
            onKeyDown={(e) => (e.key === "ArrowUp" || e.key === "Enter") && tuck()}
          >
            <span className="th-blanketHem" />
            {!tucked && <span className="th-pullTab" aria-hidden>⇡</span>}
          </div>
          <span className="th-bedFoot" aria-hidden />
        </div>
        {tucked && <Gif src={snuggle} size={96} tilt={8} className="th-sleepGif" />}
        {!tucked && <Gif src={GIF.sparkles} size={46} tilt={0} className="th-sparkGif" />}
      </div>

      <AnimatePresence>
        {noteOpen && (
          <motion.div className="th-psCard" initial={{ scale: 0.4, rotate: -10, opacity: 0, y: 30 }} animate={{ scale: 1, rotate: -1.5, opacity: 1, y: 0 }} transition={POP}>
            <p>{ps}</p>
            {h.sender && <span className="th-from">— {h.sender}</span>}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="th-foot">
        {!tucked ? (
          <>
            <Hint style={{ color: TH.inkSoft }}>Drag the blanket up ⇡</Hint>
            <Later ms={6000}>
              <TextLink onClick={tuck}>Tuck him in for me</TextLink>
            </Later>
          </>
        ) : (
          (!ps || noteOpen) && (
            <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ ...POP, delay: ps ? 0.6 : 2.4 }}>
              <Puffy onClick={onNext} tone="honey">
                Good morning ☀️
              </Puffy>
            </motion.div>
          )
        )}
        {tucked && ps && !noteOpen && notePeek && <Hint style={{ color: "#F3E9FF" }}>Psst… check under his pillow</Hint>}
      </div>
      <style>{BED_CSS}</style>
    </div>
  );
}

const BED_CSS = `
.th-bed .th-title, .th-bed .th-sub { transition: color 1.2s ease, text-shadow 1.2s ease; }
.th-bed.is-night .th-title { color: #FFF7EC; text-shadow: 0 3px 0 rgba(40,30,80,.4); }
.th-bed.is-night .th-room { background: rgba(255,255,255,.16); color: #FFE9A8; box-shadow: none; }
.th-bed.is-night .th-dots { background: rgba(255,255,255,.18); box-shadow: none; }
.th-bedroom { position: relative; display: grid; justify-items: center; width: 100%; min-height: 380px; margin-top: 4px; }
.th-window { position: absolute; left: max(6px, calc(50% - 186px)); top: 6px; width: 84px; height: 96px; border-radius: 42px 42px 10px 10px; background: linear-gradient(180deg, #CFE8FF, #EAF5FF);
  box-shadow: 0 0 0 6px #fff, 0 8px 18px rgba(120,70,30,.15); overflow: hidden; transition: background 1.4s ease; }
.th-window::before, .th-window::after { content: ""; position: absolute; background: #fff; }
.th-window::before { left: 50%; top: 0; bottom: 0; width: 5px; margin-left: -2.5px; }
.th-window::after { top: 52%; left: 0; right: 0; height: 5px; }
.th-moon { position: absolute; right: 12px; top: 14px; width: 26px; height: 26px; border-radius: 50%; background: #FFF3C9; box-shadow: -8px 2px 0 0 #EAF5FF inset; opacity: 0; transition: opacity 1.4s ease; }
.th-bed.is-night .th-window { background: linear-gradient(180deg, #2E2A5E, #4B3F7A); }
.th-bed.is-night .th-moon { opacity: 1; box-shadow: -8px 2px 0 0 #2E2A5E inset, 0 0 18px rgba(255,243,201,.7); }
.th-lamp { position: absolute; right: max(10px, calc(50% - 180px)); top: 120px; width: 46px; height: 74px; }
.th-lamp::before { content: ""; position: absolute; left: 4px; right: 4px; top: 0; height: 34px; border-radius: 20px 20px 6px 6px; background: #FFD9E4; box-shadow: 0 0 0 3px #fff inset; transition: background .8s ease, box-shadow .8s ease; }
.th-lamp::after { content: ""; position: absolute; left: 50%; bottom: 0; width: 8px; height: 40px; margin-left: -4px; border-radius: 4px; background: #F2B36B; }
.th-lamp.is-on::before { background: #FFF3C9; box-shadow: 0 0 0 3px #fff inset, 0 0 40px 18px rgba(255,226,122,.55); }
.th-gn { position: absolute; top: 40px; z-index: 5; font-size: 22px; }
.th-bedFrame { position: absolute; left: 50%; bottom: 0; width: 300px; height: 300px; margin-left: -150px; }
.th-headboard { position: absolute; left: 20px; right: 20px; top: 30px; height: 140px; border-radius: 70px 70px 10px 10px; background: linear-gradient(180deg, #F2C89A, #E2B27C); box-shadow: 0 0 0 5px #fff inset; display: grid; justify-items: center; padding-top: 14px; }
.th-pillow { position: absolute; left: 70px; right: 70px; top: 102px; height: 54px; border-radius: 28px; background: #fff; box-shadow: 0 6px 12px rgba(120,70,30,.15), 0 0 0 3px ${TH.pinkSoft} inset; }
.th-bedTeddy { position: absolute; left: 50%; top: 64px; margin-left: -75px; }
.th-zzzBed { right: 52px; top: 56px; color: #FFE9A8; }
.th-peekNote { all: unset; cursor: pointer; position: absolute; left: 30px; top: 116px; z-index: 6; padding: 8px 12px; border-radius: 6px; background: #FFF3C9; box-shadow: 0 0 0 2px #fff inset, 0 6px 14px rgba(0,0,0,.25);
  font: 400 18px/1 ${HAND}; color: ${TH.ink}; animation: th-wiggle 2.4s ease-in-out infinite; }
.th-peekNote:focus-visible { outline: 3px solid #FFE9A8; outline-offset: 3px; }
.th-blanket { position: absolute; left: 4px; right: 4px; bottom: 24px; z-index: 4; border-radius: 26px 26px 14px 14px; cursor: ns-resize; touch-action: none; transition: height .12s ease-out;
  background: conic-gradient(from 90deg at 50% 50%, #FFB3C8 0 25%, #FFF3C9 0 50%, #FFB3C8 0 75%, #FFF3C9 0) 0 0 / 52px 52px; box-shadow: 0 0 0 5px #fff inset, 0 -4px 12px rgba(120,70,30,.15); }
.th-blanket:focus-visible { outline: 3px dashed ${TH.pinkDeep}; outline-offset: 3px; }
.th-blanketHem { position: absolute; left: 0; right: 0; top: 0; height: 22px; border-radius: 26px 26px 0 0; background: #fff; box-shadow: 0 3px 0 ${TH.pinkSoft}; }
.th-pullTab { position: absolute; left: 50%; top: -24px; width: 44px; height: 30px; margin-left: -22px; border-radius: 14px; display: grid; place-items: center; background: ${TH.pinkDeep}; color: #fff; font: 900 18px/1 var(--font-th-body), sans-serif;
  box-shadow: 0 4px 0 #B8455F; animation: th-pullHint 1.4s ease-in-out infinite; }
@keyframes th-pullHint { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-8px) } }
.th-bedFoot { position: absolute; left: 0; right: 0; bottom: 0; height: 34px; border-radius: 12px; background: linear-gradient(180deg, #E2B27C, #C98A55); z-index: 5; box-shadow: 0 0 0 4px #fff inset; }
.th-sleepGif { position: absolute; right: max(-4px, calc(50% - 196px)); bottom: 40px; z-index: 6; }
.th-sparkGif { position: absolute; left: max(10px, calc(50% - 170px)); bottom: 160px; z-index: 6; }
.th-psCard { position: relative; z-index: 7; width: min(100%, 360px); margin-top: 14px; padding: 16px 18px; border-radius: 8px; text-align: left; background: #FFF3C9; color: ${TH.ink};
  box-shadow: 0 0 0 3px #fff inset, 0 14px 30px rgba(20,10,50,.35); display: grid; gap: 8px; }
.th-psCard p { margin: 0; font: 400 20px/1.3 ${HAND}; white-space: pre-line; }
.th-psCard .th-from { justify-self: end; font: 800 12px/1 var(--font-th-body), sans-serif; letter-spacing: .12em; text-transform: uppercase; color: ${TH.pinkDeep}; }
@media (prefers-reduced-motion: reduce) { .th-pullTab, .th-peekNote { animation: none; } }
@media (max-height: 740px) { .th-bedroom { min-height: 340px; } }
`;
