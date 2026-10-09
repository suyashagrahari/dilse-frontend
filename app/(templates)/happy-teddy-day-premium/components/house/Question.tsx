"use client";

// Room 8 · The next morning — THE MONEY MOMENT. He holds her photo up over his head: "Will you keep him forever?
// (Me too?)". The No button scoots away with a new excuse each time ("he packed a tiny suitcase"), he gets sadder,
// the Yes grows, and after four tries the No gives up and turns into a second Yes. YES → drop(): on the song's
// chorus the house glows pink and teddies of every size and colour rain down and land, one by one with a squeak,
// into a big heart around her photo, while her named teddy cheers in the middle.

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { burst, CroppedPhoto, haptic, useReducedMotion } from "../../../_valentine/kit";
import { sfx, useSongDrop } from "../../../_valentine/kit/premium";
import type { TeddyItem } from "../../../_valentine/days/happy-teddy-day-premium";
import { MiniTeddy, Teddy, type Fur, type Mood } from "./art";
import { DISPLAY, HAND } from "./fonts";
import { GIF } from "./gifs";
import { TH, type House } from "./model";
import { Dots, Gif, Note, POP, Puffy, WOBBLY } from "./ui";

type Phase = "ask" | "rise" | "peak" | "after";
const COUNT = 30;
const FURS: Fur[] = ["honey", "pink", "cocoa", "snow", "lilac"];
const NO_LINES = ["are you sure? 🥺", "he's crying…", "he packed a tiny suitcase", "last chance, he's sniffling"];

function heartPoints(count: number, k: number) {
  return Array.from({ length: count }, (_, i) => {
    const t = (i / count) * Math.PI * 2;
    const x = 16 * Math.sin(t) ** 3;
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    return { x: x * k, y: y * k - 6 };
  });
}

export default function Question({
  h, celebrate, step, total, name, worn, onPeak, onYes, onNext,
}: { h: House; celebrate: string | null; step: number; total: number; name: string; worn: TeddyItem[]; onPeak: () => void; onYes: (dodges: number) => void; onNext: () => void }) {
  const reduce = useReducedMotion();
  const { drop } = useSongDrop();
  const [phase, setPhase] = useState<Phase>("ask");
  const [dodges, setDodges] = useState(0);
  const [noPos, setNoPos] = useState({ x: 72, y: 50 });
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  useEffect(() => {
    const t = timers.current;
    return () => t.forEach((id) => window.clearTimeout(id));
  }, []);

  // client-only scene (next/dynamic, ssr: false), so the viewport is known here
  const [k] = useState(() => (typeof window === "undefined" ? 10.5 : Math.max(9, Math.min(12.5, (Math.min(window.innerWidth, 520) - 24) / 33))));
  const hearts = useMemo(() => heartPoints(COUNT, k), [k]);
  const look = useMemo(
    () =>
      Array.from({ length: COUNT }, (_, i) => ({
        fur: FURS[i % FURS.length],
        size: 36 + ((i * 7) % 4) * 7,
        tilt: ((i * 37) % 30) - 15,
        sx: ((i * 53) % 200) - 100,
        bow: i % 4 === 0,
        mood: (i % 3 === 0 ? "love" : "happy") as "love" | "happy",
      })),
    [],
  );

  const gaveUp = dodges >= 4;
  const dodge = () => {
    if (gaveUp || phase !== "ask") return;
    const d = dodges + 1;
    haptic(8);
    sfx("swoosh-soft", { gain: 0.5, detune: d * 90 });
    if (d === 2) sfx("plush-squeak", { gain: 0.4, detune: -400 });
    const spots = [
      { x: 20, y: 86 }, { x: 80, y: 88 }, { x: 18, y: 16 }, { x: 82, y: 14 },
    ];
    setNoPos(spots[(d - 1) % spots.length]);
    setDodges(d);
  };

  const yes = () => {
    if (phase !== "ask") return;
    setPhase("rise");
    onYes(dodges);
    haptic([20, 30, 20, 30, 60]);
    sfx("sparkle", { gain: 0.5 });
    sfx("plush-squeak", { gain: 0.6, at: 0.2 });
    drop(() => {
      setPhase("peak");
      onPeak();
      burst({ kind: "confetti", count: 120, colors: ["#FF8FAB", "#F2B36B", "#FFE27A", "#BDEBD6", "#CFE8FF"] });
      // a squeak as the teddies land, in a little rhythm
      if (!reduce) [0.5, 0.8, 1.1, 1.4, 1.7, 2.0].forEach((at, i) => sfx("plush-squeak", { gain: 0.35, at, detune: (i % 3) * 200 - 100 }));
      sfx("chime-cascade", { gain: 0.5, at: 2.1 });
      later(() => burst({ kind: "hearts", origin: { x: 0.5, y: 0.42 }, count: 26, emojis: ["💖", "💗", "🧸", "✨"] }), 1900);
      later(() => setPhase("after"), reduce ? 600 : 3300);
    });
  };

  const peaked = phase === "peak" || phase === "after";
  const mood: Mood = peaked ? "love" : phase === "rise" ? "happy" : dodges >= 3 ? "sad" : dodges >= 1 ? "shy" : "open";
  const reactor = dodges >= 3 ? GIF.crying : dodges >= 1 ? GIF.pleading : GIF.holdingTears;
  const yesScale = 1 + Math.min(dodges, 4) * 0.1;

  return (
    <div className={`th-scene th-q is-${phase}`}>
      <header className="th-head">
        <Dots step={step} total={total} />
        <p className="th-room">{peaked ? `${h.recipient} said yes 💗` : "Room 8 · The next morning ☀️"}</p>
        <AnimatePresence mode="wait">
          {!peaked ? (
            <motion.h2 key="q" className="th-title th-qTitle" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} transition={POP}>
              {h.question}
            </motion.h2>
          ) : (
            <motion.h2 key="y" className="th-title th-qTitle" initial={{ scale: 0.4, rotate: -6, opacity: 0 }} animate={{ scale: 1, rotate: -2, opacity: 1 }} transition={WOBBLY}>
              {name} is home <em>forever</em>
            </motion.h2>
          )}
        </AnimatePresence>
      </header>

      <div className="th-heroArea">
        {peaked && (
          <div className="th-rain" aria-hidden>
            {hearts.map((pt, i) => {
              const l = look[i];
              return (
                <motion.span
                  key={i}
                  className="th-rainTeddy"
                  initial={reduce ? { x: pt.x, y: pt.y, opacity: 0 } : { x: pt.x + l.sx, y: -760, rotate: l.tilt * 3, opacity: 1, scale: 0.8 }}
                  animate={{ x: pt.x, y: pt.y, rotate: l.tilt, opacity: 1, scale: 1 }}
                  transition={reduce ? { duration: 0.3 } : { type: "spring", stiffness: 90, damping: 11, delay: 0.05 * ((i * 11) % COUNT) }}
                >
                  <span className="th-rainBob" style={{ animationDelay: `${(i % 6) * -0.35}s` }}>
                    <MiniTeddy size={l.size} fur={l.fur} mood={l.mood} bow={l.bow} />
                  </span>
                </motion.span>
              );
            })}
          </div>
        )}

        <motion.div className="th-heroPol" animate={phase === "rise" ? { scale: 1.06, rotate: 0 } : peaked ? { scale: 0.86, rotate: -2, y: -16 } : { scale: 1, rotate: -3 }} transition={WOBBLY}>
          <span className="th-heroTape" aria-hidden />
          <div className="th-heroImg">
            {h.hero ? (
              <CroppedPhoto photo={h.hero} eager />
            ) : (
              <span style={{ display: "grid", placeItems: "center", height: "100%" }}>
                <MiniTeddy size={110} mood="love" bow />
              </span>
            )}
          </div>
          <span className="th-heroCap">{h.hero?.caption || `${h.recipient} & ${name}`}</span>
        </motion.div>

        <motion.span className="th-qTeddy" animate={peaked ? { y: [0, -22, 0] } : { y: 0 }} transition={peaked ? { duration: 0.7, repeat: reduce ? 0 : 2, delay: 1.2 } : undefined}>
          <Teddy size={118} mood={mood} pose={peaked ? "up" : "up"} worn={worn} heart />
          <span className="th-tag th-qTag">{name}</span>
        </motion.span>

        {peaked && (
          <>
            <Gif src={celebrate} size={100} tilt={8} className="th-qYes" eager />
            <Gif src={GIF.backHug} size={84} tilt={-8} className="th-qBears" eager />
          </>
        )}
      </div>

      {phase === "ask" && (
        <div className="th-ansField">
          <span className="th-yesSlot" style={{ transform: `scale(${yesScale})` }}>
            <Puffy onClick={yes} style={{ minWidth: 150 }}>
              Yes, forever 💗
            </Puffy>
          </span>
          <Gif src={reactor} size={58} tilt={-6} className="th-sad" float={false} eager />
          {gaveUp ? (
            <motion.span className="th-noSlot" style={{ left: `${noPos.x}%`, top: `${noPos.y}%` }} initial={{ scale: 0.4 }} animate={{ scale: 1 }} transition={POP}>
              <Puffy tone="honey" small onClick={yes}>
                Okay, yes 🥹
              </Puffy>
            </motion.span>
          ) : (
            <motion.span
              className="th-noSlot"
              animate={{ left: `${noPos.x}%`, top: `${noPos.y}%`, scale: 1 - dodges * 0.08 }}
              transition={{ type: "spring", stiffness: 380, damping: 18 }}
              onPointerEnter={(e) => e.pointerType === "mouse" && dodge()}
            >
              <Puffy tone="cream" small onClick={dodge} ariaLabel="No">
                {dodges === 0 ? "No" : NO_LINES[(dodges - 1) % NO_LINES.length]}
              </Puffy>
            </motion.span>
          )}
        </div>
      )}

      {phase === "rise" && <p className="th-hint" style={{ fontFamily: DISPLAY, fontSize: 22 }}>wait for it… 🧸</p>}

      <div className="th-foot">
        {phase === "after" && (
          <motion.div style={{ display: "grid", justifyItems: "center", gap: 12 }} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={POP}>
            {h.yesLine && (
              <Note tilt={-1.5} style={{ fontFamily: HAND, fontWeight: 400, fontSize: 22, lineHeight: 1.25 }}>
                {h.yesLine}
              </Note>
            )}
            <Puffy onClick={onNext}>Sign his adoption certificate →</Puffy>
          </motion.div>
        )}
      </div>
      <style>{Q_CSS}</style>
    </div>
  );
}

const Q_CSS = `
.th-qTitle { font-size: clamp(27px, 7.6vw, 40px); max-width: 15ch; }
.th-heroArea { position: relative; display: grid; justify-items: center; width: 100%; min-height: 360px; margin-top: 10px; }
.th-q.is-peak .th-heroArea, .th-q.is-after .th-heroArea { margin-top: 34px; }
.th-heroPol { position: relative; z-index: 2; width: min(48vw, 184px); background: #fff; padding: 9px 9px 0; border-radius: 6px; box-shadow: 0 16px 30px rgba(120,70,30,.28); }
.th-q.is-rise .th-heroPol { box-shadow: 0 0 0 6px rgba(255,226,122,.7), 0 0 60px rgba(255,143,171,.7); }
.th-heroImg { aspect-ratio: 4 / 5; overflow: hidden; border-radius: 3px; background: ${TH.pinkSoft}; }
.th-heroCap { display: block; padding: 7px 4px 9px; font: 400 20px/1.1 ${HAND}; color: ${TH.ink}; text-align: center; }
.th-heroTape { position: absolute; top: -10px; left: 50%; width: 72px; height: 20px; margin-left: -36px; background: #FFD9E4; opacity: .95; transform: rotate(-4deg); z-index: 3; }
.th-qTeddy { position: relative; z-index: 3; margin-top: -8px; display: grid; justify-items: center; }
.th-qTag { position: absolute; right: -40px; bottom: 30px; font-size: 18px; padding: 4px 10px; transform: rotate(-6deg); }
.th-rain { position: absolute; left: 50%; top: 46%; width: 0; height: 0; z-index: 1; pointer-events: none; }
.th-rainTeddy { position: absolute; left: -22px; top: -20px; }
.th-rainBob { display: inline-block; animation: th-rainBob 1.8s ease-in-out infinite; }
@keyframes th-rainBob { 0%,100% { transform: translateY(0) rotate(0) } 50% { transform: translateY(-4px) rotate(4deg) } }
.th-qYes { position: absolute; right: max(-6px, calc(50% - 196px)); bottom: 0; z-index: 4; }
.th-qBears { position: absolute; left: max(-6px, calc(50% - 196px)); bottom: 4px; z-index: 4; }
.th-ansField { position: relative; width: min(100%, 360px); height: 150px; margin-top: 4px; }
.th-yesSlot { position: absolute; left: 36%; top: 50%; translate: -50% -50%; transition: transform .35s cubic-bezier(.34,1.56,.64,1); z-index: 2; }
.th-sad { position: absolute; left: calc(36% - 29px); top: -26px; }
.th-noSlot { position: absolute; translate: -50% -50%; z-index: 3; white-space: nowrap; }
@media (prefers-reduced-motion: reduce) { .th-rainBob { animation: none; } }
@media (max-height: 740px) { .th-heroArea { min-height: 320px; } .th-heroPol { width: min(46vw, 170px); } }
`;
