"use client";

// Chapter II · The Séance. A lacquered talking board (CSS wood + gold-foil
// type; no drawn objects). The recipient rests a finger on the board and the
// planchette glides, letter by letter: their name, then the sender's word,
// then YES. Lifting the finger pauses it, so they "feel" it move.
// SFX: nm-glide on every slide (the planchette moving), glass-ping on every
// letter (the letter flares gold), chime-cascade when it's spelled.

import { useEffect, useMemo, useRef, useState } from "react";
import { PremiumCTA, RevealText, sfx } from "../../../_valentine/kit/premium";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import type { Night } from "./model";
import { Eyebrow, Quiet } from "./ui";
import { BODY, DISPLAY } from "./fonts";
import { GILT } from "./model";

type Pt = { x: number; y: number; r: number };
const A = "ABCDEFGHIJKLM".split("");
const B = "NOPQRSTUVWXYZ".split("");

/** Letter centres in % of the board (two arcs like an old board), YES / NO in the top corners. */
function layout(): Record<string, Pt> {
  const out: Record<string, Pt> = {};
  const arc = (ls: string[], cx: number, cy: number, rx: number, ry: number, from: number, to: number) =>
    ls.forEach((l, i) => {
      const th = ((from + ((to - from) * i) / (ls.length - 1)) * Math.PI) / 180;
      out[l] = { x: cx + rx * Math.cos(th), y: cy - ry * Math.sin(th), r: (90 - (th * 180) / Math.PI) * 0.55 };
    });
  arc(A, 50, 78, 41, 50, 162, 18);
  arc(B, 50, 99, 36, 37, 156, 24);
  out.YES = { x: 13, y: 13, r: 0 };
  out.NO = { x: 87, y: 13, r: 0 };
  out.REST = { x: 50, y: 40, r: 0 };
  return out;
}

const PTS = layout();

export default function Seance({ n, onNext }: { n: Night; onNext: () => void }) {
  const reduce = useReducedMotion();
  const pts = PTS;
  const seq = useMemo(() => [...n.boardName.split(""), "·", ...n.boardWord.split(""), "YES"], [n.boardName, n.boardWord]);
  const board = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [step, setStep] = useState(-1); // index into seq the planchette is on
  const [landed, setLanded] = useState(0); // how many steps have landed
  const [holding, setHolding] = useState(false);
  const [auto, setAuto] = useState(false);
  const [offer, setOffer] = useState(false);
  const done = landed >= seq.length;
  const going = (holding || auto) && !done;
  const hit = landed > 0 && landed === step + 1 ? seq[step] : "";

  useEffect(() => {
    const el = board.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    const t = window.setTimeout(() => setOffer(true), 5000);
    return () => {
      ro.disconnect();
      window.clearTimeout(t);
    };
  }, []);

  // One step at a time: glide, land (the letter flares + a glass ping), breathe,
  // and only then the next glide. Lifting the finger lets the current step
  // land but schedules no more.
  const glide = reduce ? 260 : 760;
  const live = useRef({ going, step: -1, busy: false, alive: true });
  useEffect(() => {
    const L = live.current;
    L.alive = true;
    return () => {
      L.alive = false;
    };
  }, []);
  useEffect(() => {
    const L = live.current;
    L.going = going;
    const advance = () => {
      if (!L.alive || L.busy || !L.going) return;
      const idx = L.step + 1;
      if (idx >= seq.length) return;
      L.busy = true;
      L.step = idx;
      setStep(idx);
      const key = seq[idx];
      if (key !== "·") sfx("nm-glide", { dur: glide / 1000, gain: 0.8, detune: Math.random() * 100 - 50 });
      window.setTimeout(() => {
        if (!L.alive) return;
        setLanded(idx + 1);
        if (key !== "·") {
          haptic(8);
          sfx(key === "YES" ? "chime-cascade" : "glass-ping", { gain: key === "YES" ? 0.6 : 0.35, detune: (idx % 5) * 80 });
        }
        window.setTimeout(() => {
          L.busy = false;
          advance();
        }, key === "·" ? 500 : 340);
      }, key === "·" ? 200 : glide);
    };
    if (going) advance();
  }, [going, seq, glide]);

  const at = step < 0 ? pts.REST : seq[step] === "·" ? pts.REST : pts[seq[step]] ?? pts.REST;
  const px = (at.x / 100) * size.w;
  const py = (at.y / 100) * size.h;

  // What has been spelled so far, split into the name and the word.
  const sofar = seq.slice(0, landed);
  const sep = n.boardName.length;
  const nameSoFar = sofar.slice(0, sep).join("");
  const wordSoFar = sofar.slice(sep + 1, sep + 1 + n.boardWord.length).join("");

  const down = () => {
    setHolding(true);
    if (step < 0 && !holding) sfx("organ-chord", { gain: 0.25 });
  };
  const up = () => setHolding(false);

  return (
    <div className="nm-scene nm-seance">
      <header style={{ display: "grid", justifyItems: "center", gap: 10 }}>
        <Eyebrow n="II">The Séance</Eyebrow>
        <p className="nm-sub" style={{ fontSize: 17 }}>{done ? n.copy.board.replace("listening", "speaking") : step < 0 ? "Rest a finger on the board." : n.copy.board + "…"}</p>
      </header>

      <div
        ref={board}
        className={`nm-board${going ? " is-going" : ""}${done ? " is-done" : ""}`}
        onPointerDown={down}
        onPointerUp={up}
        onPointerCancel={up}
        onPointerLeave={up}
        onContextMenu={(e) => e.preventDefault()}
        role="button"
        tabIndex={0}
        aria-label="Hold to let the planchette spell"
        onKeyDown={(e) => (e.key === " " || e.key === "Enter") && (e.preventDefault(), setAuto(true))}
      >
        <span className="nm-bMoon" aria-hidden>☾ ✦ ☽</span>
        {[...A, ...B].map((l) => (
          <span key={l} className={`nm-bL${hit === l ? " is-hit" : ""}`} style={{ left: `${pts[l].x}%`, top: `${pts[l].y}%`, transform: `translate(-50%,-50%) rotate(${pts[l].r}deg)` }} aria-hidden>
            {l}
          </span>
        ))}
        <span className={`nm-bW${hit === "YES" ? " is-hit" : ""}`} style={{ left: "13%", top: "13%" }} aria-hidden>Yes</span>
        <span className="nm-bW" style={{ left: "87%", top: "13%" }} aria-hidden>No</span>
        <span className="nm-bBye" aria-hidden>Good bye</span>
        <div
          className={`nm-plan${step < 0 && !holding ? " is-waiting" : ""}`}
          style={{ transform: `translate3d(${px}px, ${py}px, 0) rotate(${at.r * 0.5}deg)`, transitionDuration: `${glide}ms`, opacity: size.w ? 1 : 0 }}
          aria-hidden
        >
          <span className="nm-planBody" />
        </div>
      </div>

      <div className="nm-spelled" aria-live="polite">
        <p className="nm-spName">{nameSoFar || " "}</p>
        <p className="nm-spWord">{wordSoFar || " "}</p>
      </div>

      <div className="nm-foot">
        {done ? (
          <>
            {n.boardLine && <RevealText mode="blur" text={n.boardLine} className="nm-sub" style={{ font: `italic 300 21px/1.4 ${BODY}`, color: "#F1E9D8" }} />}
            <PremiumCTA tone="ember" cue="whoosh" onClick={onNext}>
              Draw three cards
            </PremiumCTA>
          </>
        ) : (
          offer && !auto && <Quiet onClick={() => setAuto(true)}>Let it spell on its own</Quiet>
        )}
      </div>
      <style>{SEANCE_CSS}</style>
    </div>
  );
}

const SEANCE_CSS = `
.nm-board { position: relative; flex: none; width: min(100%, 540px); aspect-ratio: 1.26; margin-top: auto; border-radius: 22px;
  touch-action: none; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; cursor: pointer; outline: none;
  background:
    radial-gradient(110% 80% at 50% 38%, rgba(255,214,150,.13), transparent 62%),
    repeating-linear-gradient(93deg, rgba(0,0,0,.07) 0 1px, transparent 1px 7px),
    repeating-linear-gradient(88deg, rgba(255,220,180,.025) 0 2px, transparent 2px 13px),
    linear-gradient(165deg, #5e2420 0%, #3c1416 52%, #250b0f 100%);
  box-shadow: inset 0 0 0 2px rgba(232,207,138,.55), inset 0 0 0 9px rgba(0,0,0,.28), inset 0 0 0 10px rgba(232,207,138,.28),
    inset 0 0 60px rgba(0,0,0,.55), 0 50px 80px -40px #000, 0 12px 30px rgba(0,0,0,.6);
  transition: box-shadow .8s ease; }
.nm-board.is-going { box-shadow: inset 0 0 0 2px rgba(232,207,138,.75), inset 0 0 0 9px rgba(0,0,0,.28), inset 0 0 0 10px rgba(232,207,138,.4),
    inset 0 0 60px rgba(0,0,0,.45), 0 50px 80px -40px #000, 0 0 60px -10px rgba(242,179,91,.45); }
.nm-board:focus-visible { outline: 2px solid #F2B35B; outline-offset: 4px; }
.nm-bL, .nm-bW, .nm-bBye, .nm-bMoon { position: absolute; font-family: ${DISPLAY}; background: ${GILT}; background-size: 200% 200%;
  -webkit-background-clip: text; background-clip: text; color: transparent; pointer-events: none; transition: filter .3s ease, transform .3s ease; }
.nm-bL { font-size: clamp(19px, 5.6vw, 30px); line-height: 1; }
.nm-bL.is-hit, .nm-bW.is-hit { filter: drop-shadow(0 0 8px rgba(255,214,140,.95)) brightness(1.35); }
.nm-bW { transform: translate(-50%,-50%); font-size: clamp(17px, 4.6vw, 24px); letter-spacing: .12em; }
.nm-bBye { left: 50%; bottom: 5.5%; transform: translateX(-50%); font-size: clamp(13px, 3.4vw, 17px); letter-spacing: .3em; white-space: nowrap; opacity: .85; }
.nm-bMoon { left: 50%; top: 6%; transform: translateX(-50%); font-size: clamp(16px, 4.4vw, 22px); letter-spacing: .3em; white-space: nowrap; }
.nm-plan { position: absolute; left: 0; top: 0; width: 0; height: 0; transition-property: transform, opacity; transition-timing-function: cubic-bezier(.65,0,.35,1); will-change: transform; }
.nm-planBody { position: absolute; left: -38px; top: -36px; width: 76px; height: 94px;
  border-radius: 50% 50% 46% 46% / 62% 62% 38% 38%;
  background: radial-gradient(circle at 50% 38%, rgba(255,240,205,0) 0 14px, rgba(232,207,138,.95) 15px 17px, rgba(255,240,205,0) 18px),
    linear-gradient(172deg, rgba(246,238,222,.95), rgba(200,182,152,.9) 70%, rgba(160,138,108,.9));
  -webkit-mask: radial-gradient(circle at 50% 38%, transparent 0 14px, #000 14.5px); mask: radial-gradient(circle at 50% 38%, transparent 0 14px, #000 14.5px);
  box-shadow: inset 0 2px 0 rgba(255,255,255,.65), inset 0 -6px 12px rgba(90,60,30,.35); filter: drop-shadow(0 14px 12px rgba(0,0,0,.6)); }
.nm-plan.is-waiting .nm-planBody { animation: nm-planWait 2.4s ease-in-out infinite; }
@keyframes nm-planWait { 0%,100% { transform: translateY(0) rotate(0); } 50% { transform: translateY(-4px) rotate(-3deg); } }
.nm-spelled { display: grid; justify-items: center; gap: 4px; margin-top: clamp(16px, 3.5vh, 30px); min-height: 92px; }
.nm-spName, .nm-spWord { margin: 0; font-family: ${DISPLAY}; letter-spacing: .32em; text-indent: .32em; line-height: 1; }
.nm-spName { font-size: 18px; color: rgba(232,223,204,.75); }
.nm-spWord { font-size: clamp(40px, 12vw, 64px); background: ${GILT}; background-size: 200% 200%; -webkit-background-clip: text; background-clip: text; color: transparent;
  filter: drop-shadow(0 2px 18px rgba(242,179,91,.35)); }
@media (prefers-reduced-motion: reduce) { .nm-plan.is-waiting .nm-planBody { animation: none; } }
`;
