"use client";

// Scene 7 — The liffafa. The sender's letter waits in a red-and-gold shagun
// envelope: gold-foil borders, paisley corners, "Shubh Deepavali" in foil
// with a slow glint, a gold lotus medallion holding the flap shut and a silk
// tassel swinging from it. Two diyas burn on either side; their light breathes
// on the paper.
//
// Tap the medallion: it unclasps and drops, the flap swings open in 3D (the
// gold liner shows on its back), warm light pours out of the opening, the
// letter slides up into god-rays and drifting gold dust, and then unfolds into
// the full letter, paged to fit the screen (never a scroll). The way forward
// appears once the last page has been read.
//
// Everything animates on transform / opacity; reduced motion opens it at once.

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import { FONTS } from "../../../_valentine/theme";
import { Diya } from "./art";
import { DW_DISPLAY } from "./fonts";
import { useDw, useNext } from "./stage";
import { DW, Hint, SceneTitle } from "./ui";

type Phase = "sealed" | "opening" | "reading";

/** Split the letter into pages that each fit (measured with the real type). */
function paginate(text: string, measure: HTMLElement, avail: number): string[] {
  const tokens = text.split(/(\s+)/).filter((t) => t.length);
  const pages: string[] = [];
  let cur = "";
  for (const tok of tokens) {
    const test = cur + tok;
    measure.textContent = test;
    if (measure.scrollHeight > avail && cur.trim()) {
      pages.push(cur.trimEnd());
      cur = tok.trimStart();
    } else cur = test;
  }
  if (cur.trim()) pages.push(cur.trimEnd());
  return pages.length ? pages : [text];
}

const CSS = `
.dw-lf { position: relative; width: 100%; height: 100%; }
/* the light: a bloom behind everything, god-rays and dust once it opens */
.dw-lf-bloom { position: absolute; left: 50%; top: 52%; width: min(150cqw, 150cqh); aspect-ratio: 1; transform: translate(-50%, -50%); border-radius: 50%; pointer-events: none;
  background: radial-gradient(circle, rgba(255,226,150,.55) 0%, rgba(255,190,70,.3) 22%, rgba(214,60,30,.12) 48%, transparent 68%);
  opacity: .5; transition: opacity 1.2s ease; animation: dw-lf-breathe 3.4s ease-in-out infinite alternate; will-change: opacity, transform; }
.dw-lf[data-phase="opening"] .dw-lf-bloom, .dw-lf[data-phase="reading"] .dw-lf-bloom { opacity: 1; animation: dw-lf-flicker 2.6s linear infinite; }
@keyframes dw-lf-breathe { from { transform: translate(-50%, -50%) scale(.92) } to { transform: translate(-50%, -50%) scale(1.04) } }
@keyframes dw-lf-flicker { 0%,100% { opacity: 1 } 12% { opacity: .86 } 20% { opacity: .97 } 37% { opacity: .9 } 52% { opacity: 1 } 68% { opacity: .84 } 80% { opacity: .95 } }
.dw-lf-rays { position: absolute; left: 50%; top: 40%; width: min(170cqw, 170cqh); aspect-ratio: 1; margin: calc(min(170cqw, 170cqh) / -2) 0 0 calc(min(170cqw, 170cqh) / -2); pointer-events: none; opacity: 0;
  background: repeating-conic-gradient(from 0deg, rgba(255,214,120,.22) 0deg 5deg, transparent 5deg 16deg);
  -webkit-mask: radial-gradient(circle, #000 0%, rgba(0,0,0,.6) 25%, transparent 62%); mask: radial-gradient(circle, #000 0%, rgba(0,0,0,.6) 25%, transparent 62%);
  transition: opacity 1.4s ease .5s; animation: dw-lf-spin 60s linear infinite; will-change: transform; }
.dw-lf[data-phase="opening"] .dw-lf-rays, .dw-lf[data-phase="reading"] .dw-lf-rays { opacity: 1; }
@keyframes dw-lf-spin { to { transform: rotate(360deg) } }
.dw-lf-dust { position: absolute; bottom: 30%; width: 4px; height: 4px; border-radius: 50%; background: #FFE7A8; box-shadow: 0 0 8px 2px rgba(255,207,90,.8); opacity: 0; pointer-events: none; }
.dw-lf[data-phase="opening"] .dw-lf-dust, .dw-lf[data-phase="reading"] .dw-lf-dust { animation: dw-lf-dust 5s ease-out infinite; }
@keyframes dw-lf-dust { 0% { transform: translate(0, 0); opacity: 0 } 15% { opacity: 1 } 100% { transform: translate(var(--dx), -42cqh); opacity: 0 } }
.dw-lf-diya { position: absolute; bottom: 1%; width: min(20cqw, 100px); aspect-ratio: 200 / 150; pointer-events: none; z-index: 3; }
.dw-lf-diya.l { left: 2%; } .dw-lf-diya.r { right: 2%; }

/* the envelope (290 × 200 units; every part scales with --ew) */
.dw-lf-wrap { position: absolute; left: 50%; top: 50%; width: var(--ew); height: calc(var(--ew) / 1.45); --ew: min(86cqw, 460px, 92cqh);
  transform: translate(-50%, -50%); transition: transform 1.1s cubic-bezier(.5,0,.2,1), opacity .7s ease; z-index: 2; }
.dw-lf[data-phase="opening"] .dw-lf-wrap { transform: translate(-50%, calc(-50% + 17cqh)); }
.dw-lf[data-phase="reading"] .dw-lf-wrap { transform: translate(-50%, calc(-50% + 30cqh)) scale(.8); opacity: 0; pointer-events: none; }
.dw-lf-env { position: absolute; inset: 0; perspective: 1100px; animation: dw-lf-bob 3.6s ease-in-out infinite alternate; }
.dw-lf[data-phase="opening"] .dw-lf-env { animation: none; }
@keyframes dw-lf-bob { from { transform: translateY(-4px) rotate(-.6deg) } to { transform: translateY(4px) rotate(.6deg) } }
.dw-lf-env > * { position: absolute; }
.dw-lf-back { inset: 0; z-index: 1; border-radius: 10px; overflow: hidden; background: linear-gradient(180deg, #6E0F12, #8F1416);
  box-shadow: 0 30px 50px -18px rgba(0,0,0,.85), 0 0 60px -10px rgba(255,170,60,.35); }
.dw-lf-back::before { content: ""; position: absolute; inset: 0 0 45% 0; background: radial-gradient(circle at 50% 0, rgba(255,207,90,.4), transparent 70%),
  radial-gradient(circle, rgba(255,207,90,.5) 0 1.5px, transparent 2px) 0 0 / 12px 12px, linear-gradient(180deg, #A8161C, #7A0F12); }
/* the light pouring out of the opening */
.dw-lf-inner { left: 4%; right: 4%; top: -30%; height: 90%; z-index: 2; pointer-events: none; opacity: 0; border-radius: 50%;
  background: radial-gradient(50% 50% at 50% 60%, rgba(255,246,220,.95), rgba(255,207,90,.55) 35%, rgba(246,140,33,0) 70%); transition: opacity .9s ease .35s; }
.dw-lf[data-phase="opening"] .dw-lf-inner { opacity: 1; animation: dw-lf-flicker 1.8s linear infinite .9s; }
.dw-lf-paper { left: 6%; right: 6%; top: 6%; height: 88%; z-index: 3; box-sizing: border-box; padding: 7% 8%; border-radius: 6px; text-align: left; overflow: hidden;
  background: linear-gradient(180deg, #FFFBF0, #FFEFD2); box-shadow: inset 0 0 0 1.5px #E8B65A, inset 0 0 0 5px #FFFBF0, inset 0 0 0 6px rgba(232,182,90,.6), 0 -10px 30px -10px rgba(255,190,70,.7);
  transition: transform 1.25s cubic-bezier(.3,.7,.2,1) .75s; }
.dw-lf[data-phase="opening"] .dw-lf-paper { transform: translateY(-62%); }
.dw-lf[data-phase="sealed"] .dw-lf-paper { visibility: hidden; }
.dw-lf-paper p { margin: 0; font: 700 calc(var(--ew) * .062)/1.15 var(--font-vw-script, cursive); color: #A8430C; }
.dw-lf-paper i { display: block; height: 2px; margin-top: calc(var(--ew) * .035); border-radius: 2px; background: rgba(168,67,12,.18); }
.dw-lf-front { inset: 0; z-index: 4; width: 100%; height: 100%; filter: drop-shadow(0 -2px 3px rgba(60,5,5,.35)); }
.dw-lf-foil { position: absolute; left: 0; right: 0; top: 12%; margin: 0; text-align: center; backface-visibility: hidden; -webkit-backface-visibility: hidden; pointer-events: none; font: 400 calc(var(--ew) * .072)/1 ${DW_DISPLAY}; letter-spacing: .04em;
  background: linear-gradient(100deg, #C98A2A 0%, #FFE7A8 30%, #FFCF5A 42%, #FFF8E0 50%, #D89A30 60%, #FFCF5A 80%, #C98A2A 100%) 0 0 / 250% 100%;
  -webkit-background-clip: text; background-clip: text; color: transparent; animation: dw-lf-glint 4s ease-in-out infinite; filter: drop-shadow(0 1px 0 rgba(60,5,5,.6)); }
.dw-lf-foil small { display: block; max-width: 44%; margin: calc(var(--ew) * .018) auto 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding-bottom: 2px; font: 700 calc(var(--ew) * .028)/1 ${FONTS.ui}; letter-spacing: .32em; text-transform: uppercase; }
@keyframes dw-lf-glint { 0%, 100% { background-position: 100% 0 } 50% { background-position: 0 0 } }
.dw-lf-flap { left: 0; right: 0; top: 0; height: 60%; z-index: 5; transform-origin: 50% 0; transform-style: preserve-3d;
  transition: transform 1s cubic-bezier(.55,0,.25,1), z-index 0s linear .5s; }
.dw-lf[data-phase="opening"] .dw-lf-flap, .dw-lf[data-phase="reading"] .dw-lf-flap { transform: rotateX(180deg); z-index: 2; }
.dw-lf-flap svg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; overflow: visible; backface-visibility: hidden; -webkit-backface-visibility: hidden; }
.dw-lf-flap svg.b { transform: rotateX(180deg); }
/* the medallion + tassel */
.dw-lf-seal { left: 50%; top: 60%; z-index: 6; width: calc(var(--ew) * .23); aspect-ratio: 1; margin: calc(var(--ew) * -.115) 0 0 calc(var(--ew) * -.115); padding: 0; border: 0; border-radius: 50%; background: none; cursor: pointer;
  touch-action: manipulation; -webkit-tap-highlight-color: transparent; transition: transform .7s cubic-bezier(.5,-0.3,.6,1), opacity .5s ease .2s; }
.dw-lf-seal > svg:first-child { width: 100%; height: 100%; display: block; overflow: visible; filter: drop-shadow(0 4px 6px rgba(40,4,4,.6)) drop-shadow(0 0 14px rgba(255,190,70,.55)); }
.dw-lf-seal::before { content: ""; position: absolute; inset: -14%; border-radius: 50%; border: 2px solid rgba(255,231,168,.85); animation: dw-lf-ping 1.8s ease-out infinite; pointer-events: none; }
@keyframes dw-lf-ping { 0% { transform: scale(.85); opacity: .9 } 100% { transform: scale(1.35); opacity: 0 } }
.dw-lf-seal:focus-visible { outline: 3px solid #FFF1B8; outline-offset: 6px; }
.dw-lf-seal:active > svg:first-child { transform: scale(.94); }
.dw-lf[data-phase="opening"] .dw-lf-seal, .dw-lf[data-phase="reading"] .dw-lf-seal { transform: translateY(70%) rotate(30deg) scale(.7); opacity: 0; pointer-events: none; }
.dw-lf[data-phase="opening"] .dw-lf-seal::before { animation: none; opacity: 0; }
.dw-lf-tassel { position: absolute; left: 50%; top: 86%; width: 30%; height: 150%; margin-left: -15%; transform-origin: 50% 0; animation: dw-lf-swing 2.8s ease-in-out infinite alternate; pointer-events: none; }
@keyframes dw-lf-swing { from { transform: rotate(-9deg) } to { transform: rotate(9deg) } }

/* the open letter */
.dw-letter { position: absolute; left: 50%; top: 50%; z-index: 4; width: min(100%, 460px); height: min(100%, 580px); box-sizing: border-box; display: flex; flex-direction: column;
  padding: clamp(16px, 2.8dvh, 24px) clamp(18px, 5cqw, 28px) 10px; border-radius: 14px; text-align: left; color: ${DW.paperInk};
  background: radial-gradient(120% 60% at 50% 0%, #FFFDF5, #FFF3DC 60%, #FFE9C4);
  box-shadow: 0 0 0 1.5px #E8B65A, 0 0 0 6px #8F1416, 0 0 0 7.5px #FFCF5A, 0 0 80px 14px rgba(255,180,60,.4), 0 34px 70px -24px rgba(0,0,0,.9); }
.dw-letter::before { content: ""; position: absolute; inset: 8px; border-radius: 9px; border: 1px solid rgba(201,138,58,.55); pointer-events: none; }
.dw-letter-orn { flex: none; display: block; width: 120px; height: 14px; margin: 0 auto 4px; }
.dw-letter-to { margin: 0 0 6px; font: 700 clamp(21px, 3.3dvh, 27px)/1.15 var(--font-vw-script, cursive); color: #A8430C; flex: none; }
.dw-letter-body { position: relative; flex: 1 1 0; min-height: 0; overflow: hidden; }
.dw-letter-text, .dw-letter-measure { margin: 0; font: 400 clamp(14.5px, 2.25dvh, 17px)/1.6 var(--font-vw-serif, Georgia, serif); white-space: pre-wrap; overflow-wrap: anywhere; }
.dw-letter-measure { position: absolute; left: 0; right: 0; top: 0; visibility: hidden; pointer-events: none; }
.dw-letter-sign { margin: 6px 0 0; text-align: right; font: 700 clamp(18px, 2.9dvh, 23px) var(--font-vw-script, cursive); color: #A8430C; }
.dw-letter-nav { flex: none; display: flex; align-items: center; justify-content: space-between; gap: 8px; padding-top: 6px; }
.dw-letter-nav button { min-width: 44px; min-height: 40px; border-radius: 12px; border: 1.5px solid rgba(143,20,22,.3); background: rgba(255,207,90,.28); color: #7A0F12; font: 700 15px ${FONTS.ui}; cursor: pointer; padding: 0 12px; }
.dw-letter-nav button:disabled { opacity: .3; cursor: default; }
.dw-letter-dots { display: flex; gap: 5px; }
.dw-letter-dots i { width: 6px; height: 6px; border-radius: 50%; background: rgba(143,20,22,.22); }
.dw-letter-dots i.on { background: #B3121B; }
@media (prefers-reduced-motion: reduce) {
  .dw-lf-bloom, .dw-lf-rays, .dw-lf-env, .dw-lf-tassel, .dw-lf-foil, .dw-lf-seal::before, .dw-lf-inner, .dw-lf-dust { animation: none !important; }
  .dw-lf-wrap, .dw-lf-paper, .dw-lf-flap, .dw-lf-seal, .dw-lf-inner { transition: none !important; }
}
`;

/** The envelope's front pocket: side flaps + bottom flap, gold foil edges, paisley corners. */
function Pocket() {
  return (
    <svg className="dw-lf-front" viewBox="0 0 290 200" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="dw-lf-red" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#C4161E" />
          <stop offset=".55" stopColor="#A01218" />
          <stop offset="1" stopColor="#7A0F12" />
        </linearGradient>
        <linearGradient id="dw-lf-side" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8F1416" />
          <stop offset="1" stopColor="#B3121B" />
        </linearGradient>
        <linearGradient id="dw-lf-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#C98A2A" />
          <stop offset=".45" stopColor="#FFE7A8" />
          <stop offset=".6" stopColor="#FFCF5A" />
          <stop offset="1" stopColor="#B8781E" />
        </linearGradient>
      </defs>
      {/* side flaps */}
      <path d="M0 0 L138 110 L0 200 Z" fill="url(#dw-lf-side)" />
      <path d="M290 0 L152 110 L290 200 Z" fill="url(#dw-lf-side)" />
      {/* bottom flap */}
      <path d="M0 200 L0 196 L145 92 L290 196 L290 200 Z" fill="url(#dw-lf-red)" />
      <path d="M2 196 L145 94 L288 196" fill="none" stroke="url(#dw-lf-gold)" strokeWidth="2.2" />
      <path d="M14 196 L145 104 L276 196" fill="none" stroke="rgba(255,207,90,.45)" strokeWidth="1" strokeDasharray="1.5 4" />
      {/* foil border */}
      <rect x="5" y="5" width="280" height="190" rx="7" fill="none" stroke="url(#dw-lf-gold)" strokeWidth="1.6" />
      {/* paisley (mango) corners + dot borders */}
      {[
        [26, 176, 1],
        [264, 176, -1],
      ].map(([x, y, sx], k) => (
        <g key={k} transform={`translate(${x} ${y}) scale(${sx} 1)`}>
          <path d="M0 0 C-12 -2 -14 -18 -2 -22 C8 -25 14 -14 8 -8 C4 -4 -2 -6 0 -11" fill="none" stroke="url(#dw-lf-gold)" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="1" cy="-12" r="1.8" fill="#FFCF5A" />
          {[0, 1, 2, 3].map((d) => (
            <circle key={d} cx={14 + d * 7} cy={4} r="1.1" fill="#FFCF5A" opacity=".8" />
          ))}
        </g>
      ))}
    </svg>
  );
}

/** The flap: red face with a foil edge (front); the gold liner (back, seen once it is open). */
function Flap({ recipient }: { recipient: string }) {
  return (
    <div className="dw-lf-flap" aria-hidden>
      <svg className="f" viewBox="0 0 290 120" preserveAspectRatio="none">
        <defs>
          <linearGradient id="dw-lf-flapg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8F1416" />
            <stop offset="1" stopColor="#C4161E" />
          </linearGradient>
        </defs>
        <path d="M0 0 H290 L152 116 Q145 121 138 116 Z" fill="url(#dw-lf-flapg)" />
        <path d="M3 3 L145 117 L287 3" fill="none" stroke="#FFCF5A" strokeWidth="2.2" />
        <path d="M18 6 L145 108 L272 6" fill="none" stroke="rgba(255,207,90,.5)" strokeWidth="1" strokeDasharray="1.5 4" />
      </svg>
      <svg className="b" viewBox="0 0 290 120" preserveAspectRatio="none">
        <defs>
          <pattern id="dw-lf-liner" width="14" height="14" patternUnits="userSpaceOnUse">
            <rect width="14" height="14" fill="#E9A834" />
            <circle cx="7" cy="7" r="2.2" fill="#FFE7A8" />
            <circle cx="0" cy="0" r="1.2" fill="#B8781E" />
            <circle cx="14" cy="14" r="1.2" fill="#B8781E" />
          </pattern>
        </defs>
        {/* Pre-mirrored: this face is turned over (rotateX 180° about its centre), which flips it top-to-bottom;
            drawn upside down, the flap's own turn about the top edge lands it on the hinge pointing up. */}
        <g transform="translate(0 120) scale(1 -1)">
          <path d="M0 0 H290 L152 116 Q145 121 138 116 Z" fill="url(#dw-lf-liner)" />
          <path d="M0 0 H290 L152 116 Q145 121 138 116 Z" fill="none" stroke="#B3121B" strokeWidth="3" />
        </g>
      </svg>
      <p className="dw-lf-foil">
        Shubh Deepavali
        <small>for {recipient}</small>
      </p>
    </div>
  );
}

/** A gold lotus medallion with a silk tassel. */
function Seal() {
  return (
    <>
      <svg viewBox="0 0 100 100" aria-hidden>
        <defs>
          <radialGradient id="dw-lf-medal" cx="40%" cy="35%" r="70%">
            <stop offset="0" stopColor="#FFF4C8" />
            <stop offset=".45" stopColor="#FFCF5A" />
            <stop offset="1" stopColor="#B8781E" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#dw-lf-medal)" />
        <circle cx="50" cy="50" r="41" fill="none" stroke="#9A5E12" strokeWidth="1.6" />
        {Array.from({ length: 24 }, (_, k) => (
          <circle key={k} cx={50 + Math.cos((k / 24) * Math.PI * 2) * 44.5} cy={50 + Math.sin((k / 24) * Math.PI * 2) * 44.5} r="1.5" fill="#9A5E12" />
        ))}
        {/* lotus */}
        <g fill="#B3121B" stroke="#7A0F12" strokeWidth="1">
          <path d="M50 26 C58 36 58 50 50 60 C42 50 42 36 50 26 Z" />
          <path d="M50 60 C44 48 32 42 24 44 C26 54 36 62 50 60 Z" />
          <path d="M50 60 C56 48 68 42 76 44 C74 54 64 62 50 60 Z" />
          <path d="M50 60 C40 56 30 58 26 64 C34 70 44 68 50 60 Z" opacity=".85" />
          <path d="M50 60 C60 56 70 58 74 64 C66 70 56 68 50 60 Z" opacity=".85" />
        </g>
        <path d="M30 70 Q50 78 70 70" fill="none" stroke="#9A5E12" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <svg className="dw-lf-tassel" viewBox="0 0 30 150" aria-hidden>
        <path d="M15 0 V52" stroke="#FFCF5A" strokeWidth="1.8" />
        <circle cx="15" cy="56" r="5.5" fill="#FFCF5A" stroke="#B8781E" strokeWidth="1" />
        <path d="M10 62 H20 L22 70 H8 Z" fill="#B3121B" />
        {[-6, -3, 0, 3, 6].map((dx, k) => (
          <path key={k} d={`M${15 + dx * 0.6} 70 L${15 + dx * 1.3} ${118 + (k % 2) * 6}`} stroke={k % 2 ? "#FFCF5A" : "#D8202A"} strokeWidth="2" strokeLinecap="round" />
        ))}
      </svg>
    </>
  );
}

const DUST = [
  { left: "38%", dx: "-30px", d: 0 },
  { left: "46%", dx: "18px", d: 1.1 },
  { left: "54%", dx: "-12px", d: 2.3 },
  { left: "61%", dx: "26px", d: 0.6 },
  { left: "42%", dx: "8px", d: 3.2 },
  { left: "58%", dx: "-22px", d: 1.8 },
  { left: "50%", dx: "4px", d: 4 },
];

export default function Liffafa({ letter, recipient, sender, onNext }: { letter: string; recipient: string; sender: string; onNext: () => void }) {
  const reduced = useReducedMotion();
  const { cue } = useDw();
  const [phase, setPhase] = useState<Phase>("sealed");

  const open = () => {
    if (phase !== "sealed") return;
    haptic([14, 30, 10]);
    cue("wax-crack", { gain: 0.5 });
    if (reduced) {
      setPhase("reading");
      return;
    }
    setPhase("opening");
    window.setTimeout(() => cue("paper-rustle", { gain: 0.45 }), 750);
    window.setTimeout(() => cue("chime", { gain: 0.35 }), 1500);
    window.setTimeout(() => setPhase("reading"), 2350);
  };

  // ─── The letter, paged to fit ────────────────────────────────────────────
  const reading = phase === "reading";
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const measureRef = useRef<HTMLParagraphElement | null>(null);
  const [pages, setPages] = useState<string[]>([letter]);
  const [page, setPage] = useState(0);
  const [seenLast, setSeenLast] = useState(false);
  useLayoutEffect(() => {
    if (!reading) return;
    const body = bodyRef.current;
    const m = measureRef.current;
    if (!body || !m) return;
    const run = () => {
      const avail = body.clientHeight - 36; // room for the signature on the last page
      const ps = paginate(letter, m, Math.max(60, avail));
      setPages(ps);
      setPage((p) => Math.min(p, ps.length - 1));
    };
    run();
    const ro = new ResizeObserver(run);
    ro.observe(body);
    return () => ro.disconnect();
  }, [reading, letter]);
  const last = page >= pages.length - 1;
  useEffect(() => {
    if (reading && last) {
      const t = window.setTimeout(() => setSeenLast(true), 700);
      return () => window.clearTimeout(t);
    }
  }, [reading, last]);

  useNext(seenLast ? "Open the sweets" : null, onNext, "sweet");

  return (
    <>
      <style>{CSS}</style>
      <SceneTitle kicker="A shagun liffafa" title={reading ? "In the diya light…" : "Sealed, just for you"} sub={phase === "sealed" ? `${sender} tucked a letter inside.` : undefined} />
      <div className="dw-fill">
        <div className="dw-lf" data-phase={phase}>
          <span className="dw-lf-rays" aria-hidden />
          <span className="dw-lf-bloom" aria-hidden />
          {DUST.map((d, k) => (
            <span key={k} className="dw-lf-dust" style={{ left: d.left, ["--dx" as string]: d.dx, animationDelay: `${d.d * 0.6}s` }} aria-hidden />
          ))}
          <span className="dw-lf-diya l" aria-hidden>
            <Diya lit id="lf-l" hue={1} />
          </span>
          <span className="dw-lf-diya r" aria-hidden>
            <Diya lit id="lf-r" hue={3} />
          </span>
          <div className="dw-lf-wrap">
            <div className="dw-lf-env">
              <div className="dw-lf-back" />
              <span className="dw-lf-inner" aria-hidden />
              <div className="dw-lf-paper" aria-hidden>
                <p>Dear {recipient},</p>
                <i />
                <i style={{ width: "86%" }} />
                <i style={{ width: "92%" }} />
                <i style={{ width: "70%" }} />
              </div>
              <Pocket />
              <Flap recipient={recipient} />
              <button type="button" className="dw-lf-seal" onClick={open} aria-label="Open the liffafa" disabled={phase !== "sealed"}>
                <Seal />
              </button>
            </div>
          </div>
          <AnimatePresence>
            {reading && (
              <motion.article
                className="dw-letter"
                initial={reduced ? false : { opacity: 0, y: "-30%", x: "-50%", scale: 0.55 }}
                animate={{ opacity: 1, y: "-50%", x: "-50%", scale: 1 }}
                transition={{ type: "spring", stiffness: 110, damping: 17 }}
                aria-label={`A letter from ${sender}`}
              >
                <svg className="dw-letter-orn" viewBox="0 0 120 14" aria-hidden>
                  <path d="M0 7 H46 M74 7 H120" stroke="#E8B65A" strokeWidth="1.4" />
                  <path d="M60 1 C64 5 64 9 60 13 C56 9 56 5 60 1 Z" fill="#B3121B" />
                  <circle cx="51" cy="7" r="2" fill="#FFCF5A" />
                  <circle cx="69" cy="7" r="2" fill="#FFCF5A" />
                </svg>
                <p className="dw-letter-to">Dear {recipient},</p>
                <div ref={bodyRef} className="dw-letter-body">
                  <p ref={measureRef} className="dw-letter-measure" aria-hidden />
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div key={page} initial={reduced ? false : { opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={reduced ? undefined : { opacity: 0, x: -14 }} transition={{ duration: 0.25 }}>
                      <p className="dw-letter-text">{pages[page]}</p>
                      {last && <p className="dw-letter-sign">— {sender}</p>}
                    </motion.div>
                  </AnimatePresence>
                </div>
                {pages.length > 1 && (
                  <nav className="dw-letter-nav" aria-label="Letter pages">
                    <button type="button" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} aria-label="Previous page">
                      ‹
                    </button>
                    <span className="dw-letter-dots" aria-label={`Page ${page + 1} of ${pages.length}`}>
                      {pages.map((_, k) => (
                        <i key={k} className={k === page ? "on" : undefined} />
                      ))}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        cue("page-turn", { gain: 0.4 });
                        setPage((p) => Math.min(pages.length - 1, p + 1));
                      }}
                      disabled={last}
                    >
                      Next page ›
                    </button>
                  </nav>
                )}
              </motion.article>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div style={{ flex: "none", minHeight: 40, display: "grid", placeItems: "center" }}>
        <Hint>{phase === "sealed" ? "Tap the gold seal to open it 💌" : phase === "opening" ? "Opening…" : last ? `With love, from ${sender} 🪔` : "Turn the page ›"}</Hint>
      </div>
    </>
  );
}
