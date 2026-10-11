"use client";

// Scene 7 · "Kiss me?" Yes / Later. "Later" runs away from her finger (kit
// RunawayNo) with begging lines, and the sticker goes from pleading to
// crying. YES is the money moment, on the song's chorus via drop(): lipstick
// prints stamp all over the screen in quick rhythm, then glide together into
// one giant heart that frames her decorated photobooth strip; confetti, the
// couple sticker, "YES!". Then on to the keepsake.

import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { RunawayNo, burst, haptic, useReducedMotion } from "../../../_valentine/kit";
import { sfx, useSongDrop } from "../../../_valentine/kit/premium";
import { HEART, LIP_LOWER, LIP_UPPER } from "./LipPrint";
import { GIF, type Deco, type Mwah } from "./model";
import Strip, { STRIP_H } from "./Strip";
import { Gif, Kicker, Puffy, Scene, Sub, Title, popIn, rise } from "./ui";

const LATER = ["No later, only now 😤", "Later is not a time", "Okay, in 5 seconds?", "The booth says no 🙅", "Later = now. Try again", "I'll wait right here 🥺"];

export default function QuestionScene({ m, decos, gif, onAnswer, onNext }: { m: Mwah; decos: Deco[]; gif: string; onAnswer: (dodges: number) => void; onNext: () => void }) {
  const { drop } = useSongDrop();
  const [dodges, setDodges] = useState(0);
  const [phase, setPhase] = useState<"ask" | "rise" | "storm">("ask");
  const yes = (n: number) => {
    if (phase !== "ask") return;
    onAnswer(n);
    setPhase("rise");
    haptic([20, 30, 20, 30, 60]);
    sfx("kmw-mwah", { gain: 1 });
    drop(() => setPhase("storm"));
  };
  return (
    <Scene label="One question" className={`km-q is-${phase}`}>
      <motion.div {...rise(0)}>
        <Kicker>Last question, promise</Kicker>
      </motion.div>
      <motion.div {...rise(1)}>
        <Title size="clamp(38px, 11vw, 60px)">{m.question}</Title>
      </motion.div>
      <motion.div {...rise(2)}>
        <Sub>{dodges ? (dodges < 3 ? "Later keeps running. Interesting 👀" : "Later has left the chat.") : "Answer carefully. The booth is listening."}</Sub>
      </motion.div>
      <motion.div className="km-qGif" {...popIn(3)}>
        <Gif src={phase !== "ask" ? GIF.heartEyes : dodges >= 3 ? GIF.crying : GIF.pleading} size={120} tilt={-4} eager />
      </motion.div>
      <motion.div className="km-qArena" {...rise(4)}>
        <RunawayNo
          yesLabel="Yes 💋"
          noLabel="Later"
          noLines={LATER}
          surrenderLabel="Okay okay, YES 💋"
          maxDodges={6}
          height={230}
          onDodge={(n) => {
            setDodges(n);
            sfx("swoosh-soft", { gain: 0.5, detune: n * 90 });
          }}
          onYes={yes}
          yesStyle={{ background: "linear-gradient(180deg, #FF7AA5, #FF4F86 55%, #F23E78)", color: "#fff", boxShadow: "0 5px 0 #D63F72, 0 12px 26px -8px rgba(214,63,114,.55)", fontFamily: "var(--km-ui)", fontWeight: 600, fontSize: 19 }}
          noStyle={{ background: "#fff", color: "#8A4A5E", border: "2px solid #FFD1DF", boxShadow: "0 4px 0 #FFD1DF", fontFamily: "var(--km-ui)", fontWeight: 600 }}
        />
      </motion.div>
      {phase === "rise" && <div className="km-rise" aria-hidden />}
      {phase === "storm" && <KissStorm m={m} decos={decos} gif={gif} onNext={onNext} />}
      <style>{CSS}</style>
    </Scene>
  );
}

const lipsUri = (color: string, lipstick: boolean) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 -4 128 80"><g fill="${color}" stroke="#fff" stroke-width="5" stroke-linejoin="round" paint-order="stroke">${
      lipstick ? `<path d="${LIP_UPPER}"/><path d="${LIP_LOWER}"/>` : `<path d="${HEART}"/>`
    }</g></svg>`,
  )}`;

/** Deterministic scatter (render must stay pure). */
const rnd = (i: number, k: number) => {
  const x = Math.sin((i + 1) * 9301 + k * 49297) * 233280;
  return x - Math.floor(x);
};

type P = { sx: number; sy: number; hx: number; hy: number; r: number; s: number; c: number };

/** The money moment: prints stamp everywhere, then gather into a heart around the strip. */
function KissStorm({ m, decos, gif, onNext }: { m: Mwah; decos: Deco[]; gif: string; onNext: () => void }) {
  const reduce = useReducedMotion();
  const [stage, setStage] = useState<0 | 1 | 2 | 3>(reduce ? 2 : 0);
  const timers = useRef<number[]>([]);
  const geo = useMemo(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const n = vw < 640 ? 66 : 96;
    const R = Math.min(vw * 0.41, vh * 0.31);
    const cx = vw / 2;
    const cy = vh * 0.54;
    const pts: P[] = Array.from({ length: n }, (_, i) => {
      const t = (i / n) * Math.PI * 2;
      const hx = 16 * Math.sin(t) ** 3;
      const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      return {
        sx: vw * (0.06 + rnd(i, 1) * 0.88),
        sy: vh * (0.06 + rnd(i, 2) * 0.88),
        hx: cx + (hx / 16) * R,
        hy: cy + (hy / 16) * R - R * 0.12,
        r: rnd(i, 3) * 60 - 30,
        s: 0.75 + rnd(i, 4) * 0.6,
        c: i % 3,
      };
    });
    return { pts, R, size: Math.max(44, Math.min(78, R * 0.3)) };
  }, []);
  const shades = useMemo(() => [lipsUri(m.S.c, m.lipstick), lipsUri(m.S.hi, m.lipstick), lipsUri(m.S.lo, m.lipstick)], [m.S, m.lipstick]);
  const stampMs = 2100;

  useEffect(() => {
    const at = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
    if (!reduce) {
      for (let k = 0; k < 9; k++) sfx("kmw-mwah", { at: k * 0.23, gain: 0.55, detune: (k % 4) * 140 - 120 });
      at(() => setStage(1), stampMs + 150);
      at(() => {
        setStage(2);
        sfx("kmw-stamp", { gain: 0.9 });
        haptic([20, 30, 20, 30, 60]);
        burst({ kind: "confetti", count: 120, colors: ["#FF4F86", "#FF9EBB", "#FFD1DF", "#FFE27A", "#ffffff"] });
      }, stampMs + 1300);
      at(() => setStage(3), stampMs + 2300);
    } else {
      sfx("kmw-stamp", { gain: 0.9 });
      at(() => setStage(3), 600);
    }
    const ts = timers.current;
    return () => ts.forEach((t) => window.clearTimeout(t));
  }, [reduce]);

  const stripW = Math.round((geo.R * 1.62) / STRIP_H);
  // Portalled to the page root: the scene column is its own stacking context
  // (under the desktop wings), and the storm must cover the whole screen.
  const host = document.querySelector(".km-root") ?? document.body;
  return createPortal(
    <div className={`km-storm s${stage}${reduce ? " is-reduced" : ""}`} role="dialog" aria-label={`${m.recipient} said yes`}>
      {geo.pts.map((p, i) => {
        const gathered = stage >= 1;
        const x = gathered ? p.hx : p.sx;
        const y = gathered ? p.hy : p.sy;
        return (
          <span
            key={i}
            className="km-st"
            style={{
              transform: `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${gathered ? 0 : p.r}deg) scale(${gathered ? 0.62 : p.s})`,
              transitionDelay: `${(i % 33) * 9}ms`,
              width: geo.size,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={shades[p.c]} alt="" width={geo.size} height={geo.size * 0.625} style={{ animationDelay: `${Math.round((i / geo.pts.length) * stampMs)}ms` }} />
          </span>
        );
      })}
      {stage >= 2 && (
        <motion.div className="km-stormStrip" initial={{ scale: 0.3, opacity: 0, rotate: -12 }} animate={{ scale: 1, opacity: 1, rotate: -3 }} transition={{ type: "spring", stiffness: 180, damping: 12 }} style={{ top: `calc(54% - ${geo.R * 0.12}px)` }}>
          <Strip m={m} decos={decos} width={`${stripW}px`} decoPx={stripW * 0.42} />
        </motion.div>
      )}
      {stage >= 2 && (
        <motion.p className="km-yes" initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 180, damping: 12, delay: 0.15 }}>
          YES! 💋
        </motion.p>
      )}
      {stage >= 2 && (
        <motion.span className="km-stormGif" {...popIn(3)}>
          <Gif src={gif} size={110} tilt={-8} eager />
        </motion.span>
      )}
      {stage >= 3 && (
        <motion.div className="km-stormCta" {...popIn(0)}>
          <Puffy onClick={onNext}>Keep our strip 💌</Puffy>
        </motion.div>
      )}
    </div>,
    host,
  );
}

const CSS = `
.km-qGif { margin-top: 4px; }
.km-qArena { width: min(400px, 100%); }
.km-qArena button { min-height: 52px; border-radius: 999px !important; padding: 0 24px !important; }
.km-rise { position: fixed; inset: 0; z-index: 110; pointer-events: none; background: radial-gradient(circle at 50% 55%, rgba(255,79,134,.0), rgba(255,79,134,.35)); animation: km-riseIn 1.1s ease-in forwards; }
@keyframes km-riseIn { from { opacity: 0; } to { opacity: 1; } }
.km-storm { position: fixed; inset: 0; z-index: 115; overflow: hidden; background: radial-gradient(circle at 50% 48%, #FFF5F8 0%, #FFE3EC 55%, #FFC9DA 100%); animation: km-riseIn .25s ease-out both; }
.km-st { position: absolute; left: 0; top: 0; display: block; pointer-events: none; will-change: transform; transition: transform 1.05s cubic-bezier(.65,0,.25,1); }
.km-st img { display: block; width: 100%; height: auto; opacity: 0; animation: km-stamp .34s cubic-bezier(.2,1.4,.4,1) forwards; filter: drop-shadow(0 3px 4px rgba(214,63,114,.3)); }
.km-storm.is-reduced .km-st { transition: none; }
.km-storm.is-reduced .km-st img { animation: km-riseIn .4s ease forwards; animation-delay: 0ms !important; }
@keyframes km-stamp { from { opacity: 0; transform: scale(2.2); } to { opacity: 1; transform: scale(1); } }
.km-storm.s2 .km-st img, .km-storm.s3 .km-st img { animation: km-stamp .34s forwards, km-beat 1.2s ease-in-out .1s 1; animation-delay: 0ms !important; }
.km-stormStrip { position: absolute; left: 50%; translate: -50% -50%; z-index: 2; }
.km-yes { position: absolute; left: 0; right: 0; top: max(76px, 9svh); margin: 0; z-index: 3; text-align: center; font: 400 clamp(54px, 16vw, 110px)/1 var(--km-display); color: var(--km-primary);
  text-shadow: 0 5px 0 #fff, 0 14px 30px rgba(214,63,114,.35); }
.km-stormGif { position: absolute; left: max(12px, calc(50% - 230px)); bottom: max(96px, 14svh); z-index: 3; }
.km-stormCta { position: absolute; left: 0; right: 0; bottom: max(28px, calc(env(safe-area-inset-bottom) + 20px)); z-index: 4; display: grid; justify-items: center; }
`;
