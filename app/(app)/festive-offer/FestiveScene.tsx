"use client";

// ─── The festival night behind the /festive-offer hero ───────────────────────
//
// Diwali falls on amavasya — the moonless night — so there is no moon here:
// an indigo sky full of stars, fireworks blooming over a lit haveli (onion
// dome, two chhatris, arched jharokha windows, a marigold toran over the gate
// and diyas flickering along every parapet), sky lanterns rising, a rangoli on
// the forecourt and a Dandiya couple dancing beside it.
//
// Performance: sky, haveli, bursts, lanterns and rangoli are inline SVG/CSS —
// no request, so the headline stays the LCP. Every moving layer animates
// transform or opacity only. The CDN GIFs (two light skyshots, sparkles, the
// dancing couple, the diya) come through IdleGif: requested after load + idle
// into boxes already sized, so nothing shifts. The two heavy fireworks GIFs
// are never used here. Reduced motion stills everything.

import type { CSSProperties } from "react";
import IdleGif from "@/components/promo/IdleGif";
import { Burst, Lantern, Rangoli } from "@/components/promo/festiveArt";
import { FV } from "@/components/promo/festiveTheme";
import { FESTIVE_GIF } from "@/lib/season";

const VB_W = 400;
const VB_H = 330;

/** Diyas along a parapet: [x, y] of each flame. */
const FLAMES: [number, number][] = [
  ...[96, 116, 136, 156, 176, 224, 244, 264, 284, 304].map((x) => [x, 163] as [number, number]),
  ...[30, 48, 66, 334, 352, 370].map((x) => [x, 215] as [number, number]),
  [200, 238],
];

/** The marigold toran over the gate: alternating flowers and mango leaves on a sagging string. */
const TORAN = Array.from({ length: 11 }, (_, i) => {
  const x = 172 + i * 5.6;
  const y = 246 + Math.sin((i / 10) * Math.PI) * 5;
  return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, i };
});

/** Fairy lights (ladi) draped from the dome's drum to the wings. */
const LADI_L = "M176 150 Q130 190 64 212";
const LADI_R = "M224 150 Q270 190 336 212";
const LADI_DOTS = (from: [number, number], c: [number, number], to: [number, number]) =>
  Array.from({ length: 9 }, (_, i) => {
    const t = (i + 1) / 10;
    const x = (1 - t) ** 2 * from[0] + 2 * (1 - t) * t * c[0] + t ** 2 * to[0];
    const y = (1 - t) ** 2 * from[1] + 2 * (1 - t) * t * c[1] + t ** 2 * to[1];
    return [Math.round(x * 10) / 10, Math.round(y * 10) / 10] as const;
  });
const DOTS = [...LADI_DOTS([176, 150], [130, 190], [64, 212]), ...LADI_DOTS([224, 150], [270, 190], [336, 212])];

function Chhatri({ x }: { x: number }) {
  // a small domed pavilion on four pillars, centred on x
  return (
    <g>
      <rect x={x - 19} y={146} width={38} height={4} rx={1} />
      {[-16, -6, 4, 14].map((dx) => <rect key={dx} x={x + dx} y={126} width={2.6} height={20} />)}
      <rect x={x - 21} y={121} width={42} height={6} rx={1.5} />
      <path d={`M${x - 17} 121 C${x - 18} 106 ${x - 6} 100 ${x} 92 C${x + 6} 100 ${x + 18} 106 ${x + 17} 121 Z`} />
      <path d={`M${x} 92 V84`} stroke="currentColor" strokeWidth="1.6" />
      <circle cx={x} cy={83} r={2} />
    </g>
  );
}

function HaveliSvg() {
  const sil = "#11143d";
  return (
    <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="fsHaveliSvg" aria-hidden preserveAspectRatio="xMidYMax meet">
      <defs>
        <linearGradient id="fs-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1d2260" />
          <stop offset="1" stopColor="#0f1238" />
        </linearGradient>
        <linearGradient id="fs-dome" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#262d78" />
          <stop offset=".6" stopColor="#1a1f58" />
          <stop offset="1" stopColor="#11143d" />
        </linearGradient>
        <radialGradient id="fs-win" cx="50%" cy="70%" r="75%">
          <stop offset="0" stopColor="#fff3c4" />
          <stop offset=".5" stopColor="#ffc457" />
          <stop offset="1" stopColor="#f07c0a" />
        </radialGradient>
        <radialGradient id="fs-flame" cx="50%" cy="70%" r="60%">
          <stop offset="0" stopColor="#fffbe8" />
          <stop offset=".5" stopColor="#ffd36b" />
          <stop offset="1" stopColor="#ff8a1c" />
        </radialGradient>
      </defs>

      {/* the forecourt */}
      <path d="M0 300 H400 V330 H0 Z" fill="#0b0d2b" />
      <path d="M0 300 H400" stroke="rgba(255,211,107,.25)" strokeWidth="1.2" />

      {/* the side wings */}
      <g fill="url(#fs-wall)" stroke="rgba(255,211,107,.28)" strokeWidth="1">
        <path d="M18 218 H88 V300 H18 Z" />
        <path d="M312 218 H382 V300 H312 Z" />
      </g>
      <g fill={sil}>
        {[18, 30, 42, 54, 66, 78].map((x) => <path key={`wl${x}`} d={`M${x} 218 h10 v-4 a5 5 0 0 0 -10 0 z`} />)}
        {[312, 324, 336, 348, 360, 372].map((x) => <path key={`wr${x}`} d={`M${x} 218 h10 v-4 a5 5 0 0 0 -10 0 z`} />)}
      </g>

      {/* the main block */}
      <path d="M86 168 H314 V300 H86 Z" fill="url(#fs-wall)" stroke="rgba(255,211,107,.32)" strokeWidth="1.1" />
      {/* parapet: a row of small scalloped merlons */}
      <g fill={sil}>
        {Array.from({ length: 19 }, (_, i) => 86 + i * 12).map((x) => <path key={`p${x}`} d={`M${x} 168 h12 v-3 a6 6 0 0 0 -12 0 z`} />)}
      </g>
      {/* a cornice band between floors */}
      <path d="M86 238 H314" stroke="rgba(255,211,107,.35)" strokeWidth="1.4" />

      {/* the onion dome on its drum */}
      <g color="#ffd36b" fill="url(#fs-dome)" stroke="rgba(255,211,107,.4)" strokeWidth="1">
        <rect x={168} y={138} width={64} height={28} rx={2} />
        <path d="M164 140 C150 112 176 90 200 58 C224 90 250 112 236 140 Z" />
        <path d="M200 58 V40" stroke="#ffd36b" strokeWidth="1.8" />
        <circle cx={200} cy={38} r={3} fill="#ffd36b" stroke="none" />
        <circle cx={200} cy={46} r={2} fill="#ffd36b" stroke="none" />
      </g>
      {/* drum windows */}
      <g fill="url(#fs-win)">
        {[176, 192, 208, 222].map((x) => <path key={`d${x}`} d={`M${x} 162 v-10 a3.5 3.5 0 0 1 7 0 v10 z`} opacity=".85" />)}
      </g>

      {/* the two chhatris */}
      <g fill={sil} color="#ffd36b" stroke="rgba(255,211,107,.35)" strokeWidth=".8">
        <Chhatri x={124} />
        <Chhatri x={276} />
      </g>

      {/* upper floor: arched jharokha windows, all lit */}
      <g fill="url(#fs-win)" className="fsWins">
        {[104, 134, 164, 222, 252, 282].map((x) => (
          <path key={`u${x}`} d={`M${x} 226 v-26 a7 9 0 0 1 14 0 v26 z`} />
        ))}
        <path d="M188 228 v-34 a12 13 0 0 1 24 0 v34 z" />
      </g>
      {/* the balcony ledges */}
      <g fill="#0c0f30">
        {[102, 132, 162, 220, 250, 280].map((x) => <rect key={`b${x}`} x={x} y={226} width={18} height={3} rx={1} />)}
        <rect x={185} y={228} width={30} height={3} rx={1} />
      </g>

      {/* ground floor: the gate and side windows */}
      <path d="M178 300 V264 a22 24 0 0 1 44 0 V300 Z" fill="url(#fs-win)" />
      <path d="M186 300 V268 a14 16 0 0 1 28 0 V300 Z" fill="#ffb84a" opacity=".55" />
      <g fill="url(#fs-win)" opacity=".9">
        {[104, 134, 252, 282].map((x) => <path key={`g${x}`} d={`M${x} 290 v-26 a7 8 0 0 1 14 0 v26 z`} />)}
        {[34, 60, 328, 354].map((x) => <path key={`wg${x}`} d={`M${x} 288 v-22 a6 7 0 0 1 12 0 v22 z`} />)}
      </g>

      {/* the toran over the gate */}
      <path d="M170 244 Q200 256 230 244" stroke="#c46a12" strokeWidth=".9" fill="none" />
      {TORAN.map(({ x, y, i }) =>
        i % 2 ? (
          <path key={`t${i}`} d={`M${x - 2} ${y} L${x + 2} ${y} L${x} ${y + 7} Z`} fill="#3aa65a" />
        ) : (
          <circle key={`t${i}`} cx={x} cy={y + 2} r={2.6} fill={i % 4 ? "#ffb020" : "#f07c0a"} />
        ),
      )}

      {/* fairy lights draped from the dome */}
      <path d={LADI_L} stroke="rgba(255,211,107,.35)" strokeWidth=".7" fill="none" />
      <path d={LADI_R} stroke="rgba(255,211,107,.35)" strokeWidth=".7" fill="none" />
      <g className="fsLadi">
        {DOTS.map(([x, y], i) => (
          <circle key={`l${i}`} cx={x} cy={y} r={1.5} fill={i % 3 === 0 ? "#ff5d8f" : i % 3 === 1 ? "#ffd36b" : "#2fd3c0"} style={{ animationDelay: `${-(i % 6) * 0.35}s` }} />
        ))}
      </g>

      {/* diyas along the parapets */}
      {FLAMES.map(([x, y], i) => (
        <g key={`f${i}`}>
          <path d={`M${x - 4} ${y + 1} h8 a4 3 0 0 1 -8 0 z`} fill="#b4501a" />
          <path
            className="fsFlame"
            d={`M${x} ${y - 7} C${x + 2.6} ${y - 3.6} ${x + 2.4} ${y + 0.6} ${x} ${y + 0.8} C${x - 2.4} ${y + 0.6} ${x - 2.6} ${y - 3.6} ${x} ${y - 7} Z`}
            fill="url(#fs-flame)"
            style={{ animationDelay: `${-(i * 0.37) % 2}s`, transformOrigin: `${x}px ${y}px` }}
          />
        </g>
      ))}
    </svg>
  );
}

type BurstSpec = { left: string; top: string; size: number; color: string; delay: number; dur: number };
const BURSTS: BurstSpec[] = [
  { left: "12%", top: "12%", size: 120, color: FV.flame, delay: 0.2, dur: 3.6 },
  { left: "70%", top: "6%", size: 150, color: FV.rose, delay: 1.4, dur: 4.2 },
  { left: "44%", top: "18%", size: 90, color: FV.teal, delay: 2.5, dur: 3.4 },
  { left: "86%", top: "28%", size: 100, color: FV.goldSoft, delay: 0.9, dur: 3.9 },
  { left: "28%", top: "4%", size: 80, color: FV.marigold, delay: 3.1, dur: 4.4 },
];

const LANTERNS = [
  { left: "6%", size: 22, delay: 0, dur: 19 },
  { left: "22%", size: 16, delay: -7, dur: 23 },
  { left: "58%", size: 20, delay: -3, dur: 21 },
  { left: "78%", size: 14, delay: -12, dur: 25 },
  { left: "93%", size: 18, delay: -16, dur: 20 },
];

const pctBox = (x: number, y: number, w: number, h: number): CSSProperties => ({
  position: "absolute", left: `${(x / VB_W) * 100}%`, top: `${(y / VB_H) * 100}%`, width: `${(w / VB_W) * 100}%`, height: `${(h / VB_H) * 100}%`,
});

export default function FestiveScene() {
  return (
    <div className="fs" aria-hidden>
      <span className="fsStars" />
      <span className="fsHorizon" />
      {BURSTS.map((b, i) => (
        <span key={i} className="fsBurst" style={{ left: b.left, top: b.top, width: b.size, height: b.size, animationDelay: `${b.delay}s`, animationDuration: `${b.dur}s` }}>
          <Burst size={b.size} color={b.color} />
        </span>
      ))}
      <IdleGif src={FESTIVE_GIF("fireworks-hanabi-skyshot.gif")} width={498} height={498} className="fsSky fsSky1" />
      <IdleGif src={FESTIVE_GIF("fireworks-deepavali-skyshot.gif")} width={498} height={340} className="fsSky fsSky2" />
      {LANTERNS.map((l, i) => (
        <span key={i} className={`fsLantern${i > 0 && i < 4 ? " mid" : ""}`} style={{ left: l.left, animationDelay: `${l.delay}s`, animationDuration: `${l.dur}s` }}>
          <Lantern size={l.size} />
        </span>
      ))}

      <div className="fsHaveli">
        <HaveliSvg />
        {/* the gate's warm halo, composited above the drawing */}
        <span className="fsGateGlow" style={pctBox(150, 220, 100, 100)} />
        {/* a rangoli on the forecourt in front of the gate, seen at an angle */}
        <span className="fsRangoli" style={pctBox(152, 296, 96, 34)}><Rangoli size={96} /></span>
        <IdleGif src={FESTIVE_GIF("diwali-sparkles-stars.gif")} width={498} height={467} className="fsSparkle" />
        <span className="fsCouple">
          <IdleGif src={FESTIVE_GIF("dandiyapartyner.webp")} width={498} height={498} className="fsCoupleImg" />
        </span>
        <IdleGif src={FESTIVE_GIF("happy-diwali-diya.webp")} width={451} height={498} className="fsDiya" />
      </div>

    </div>
  );
}

export const FS_CSS = `
.fs { position: absolute; inset: 0; z-index: 0; overflow: hidden; pointer-events: none; }
.fsStars { position: absolute; inset: 0 0 30% 0; opacity: .85;
  background-image: radial-gradient(1.4px 1.4px at 12% 18%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 28% 8%, #fff 50%, transparent 51%),
    radial-gradient(1.2px 1.2px at 46% 22%, #fff4cf 50%, transparent 51%), radial-gradient(1px 1px at 66% 12%, #fff 50%, transparent 51%),
    radial-gradient(1.6px 1.6px at 84% 30%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 92% 6%, #fff4cf 50%, transparent 51%),
    radial-gradient(1px 1px at 6% 44%, #fff 50%, transparent 51%), radial-gradient(1.2px 1.2px at 38% 40%, #fff 50%, transparent 51%),
    radial-gradient(1px 1px at 56% 4%, #fff 50%, transparent 51%), radial-gradient(1.3px 1.3px at 20% 58%, #ffe3a3 50%, transparent 51%),
    radial-gradient(1px 1px at 74% 46%, #fff 50%, transparent 51%), radial-gradient(1.1px 1.1px at 3% 12%, #fff 50%, transparent 51%);
  animation: fsTwinkle 4.5s ease-in-out infinite alternate; }
@keyframes fsTwinkle { from { opacity: .45; } to { opacity: .95; } }
/* the city's glow on the horizon — Diwali night has no moon */
.fsHorizon { position: absolute; left: -10%; right: -10%; bottom: 0; height: 55%;
  background: radial-gradient(60% 70% at 70% 100%, rgba(240,124,10,.32), transparent 70%), radial-gradient(40% 50% at 15% 100%, rgba(255,93,143,.16), transparent 70%); }

/* CSS fireworks: a burst blooms, hangs, fades — transform + opacity only */
.fsBurst { position: absolute; display: block; opacity: 0; transform: scale(.2); animation: fsBoom 3.8s cubic-bezier(.2,.8,.3,1) infinite; }
.fsBurst svg { display: block; width: 100%; height: 100%; filter: drop-shadow(0 0 8px currentColor); }
@keyframes fsBoom { 0% { opacity: 0; transform: scale(.15) rotate(0deg); } 8% { opacity: 1; } 34% { opacity: .95; transform: scale(1) rotate(8deg); }
  60% { opacity: 0; transform: scale(1.12) rotate(10deg) translateY(10px); } 100% { opacity: 0; transform: scale(1.12); } }
.fsSky { position: absolute; z-index: 1; mix-blend-mode: screen; }
.fsSky1 { right: 2%; top: 2%; width: 180px; height: 180px; }
.fsSky2 { left: 2%; top: 6%; width: 170px; height: 116px; }

.fsLantern { position: absolute; bottom: -60px; display: block; opacity: 0; filter: drop-shadow(0 0 10px rgba(255,176,32,.75)); animation: fsRise 20s linear infinite; }
@keyframes fsRise { 0% { transform: translate(0, 0) rotate(-4deg); opacity: 0; } 8% { opacity: .95; } 50% { transform: translate(18px, -50vh) rotate(4deg); }
  85% { opacity: .8; } 100% { transform: translate(-6px, -100vh) rotate(-3deg); opacity: 0; } }

/* the haveli: phones stand it under the hero copy */
.fsHaveli { position: absolute; left: 50%; bottom: 0; width: min(112vw, 560px); transform: translateX(-50%); aspect-ratio: ${VB_W} / ${VB_H}; }
.fsHaveliSvg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; overflow: visible;
  filter: drop-shadow(0 0 26px rgba(255,176,32,.22)) drop-shadow(0 0 2px rgba(255,211,107,.25)); }
.fsWins { animation: fsWin 5s ease-in-out infinite; }
@keyframes fsWin { 0%, 100% { opacity: 1; } 40% { opacity: .82; } 44% { opacity: 1; } 70% { opacity: .9; } }
.fsFlame { animation: fsFlick 1.6s ease-in-out infinite; }
@keyframes fsFlick { 0%, 100% { transform: scale(1, 1); opacity: 1; } 30% { transform: scale(.86, 1.12); opacity: .9; } 60% { transform: scale(1.08, .92); opacity: 1; } }
.fsLadi circle { animation: fsLadi 2.1s steps(2) infinite; }
@keyframes fsLadi { 0% { opacity: 1; } 50% { opacity: .3; } }
.fsGateGlow { border-radius: 50%; background: radial-gradient(circle, rgba(255,196,77,.55), rgba(240,124,10,.15) 50%, transparent 70%); animation: fsGlow 4s ease-in-out infinite; }
@keyframes fsGlow { 0%, 100% { opacity: .85; } 50% { opacity: 1; transform: scale(1.06); } }
.fsSparkle { position: absolute; left: 30%; top: -12%; width: 40%; aspect-ratio: 498 / 467; mix-blend-mode: screen; opacity: .9; }
.fsCouple { position: absolute; left: 1%; bottom: 3%; width: 30%; aspect-ratio: 1; transform-origin: 50% 100%; animation: fsSway 2.4s ease-in-out infinite; }
.fsCoupleImg { width: 100%; height: 100%; filter: drop-shadow(0 6px 16px rgba(0,0,0,.45)); }
@keyframes fsSway { 0%, 100% { transform: rotate(-3deg) translateY(0); } 25% { transform: rotate(0deg) translateY(-6px); } 50% { transform: rotate(3deg) translateY(0); } 75% { transform: rotate(0deg) translateY(-4px); } }
.fsDiya { position: absolute; right: 2%; bottom: 0; width: 20%; aspect-ratio: 451 / 498; filter: drop-shadow(0 0 18px rgba(255,176,32,.5)); }

.fsRangoli { display: flex; align-items: center; justify-content: center; }
.fsRangoli svg { width: 100%; height: auto; aspect-ratio: 1; transform: scaleY(.34); filter: drop-shadow(0 0 6px rgba(255,176,32,.5)); }

@media (max-width: 639px) {
  /* phones: the CSS bursts carry the sky (the GIF skyshots would sit on the headline),
     lanterns rise only along the edges, the couple and the diya stay on screen */
  .fsSky { display: none; }
  .fsLantern.mid { display: none; }
  .fsCouple { left: 8%; width: 28%; }
  .fsDiya { right: 9%; width: 18%; }
}
@media (min-width: 640px) {
  .fsHaveli { width: min(84vw, 640px); }
  .fsSky1 { width: 240px; height: 240px; }
  .fsSky2 { width: 230px; height: 157px; }
}
@media (min-width: 1024px) {
  /* desktop: the haveli fills the right half of the night, under the fireworks;
     sized off the hero's height so the forecourt always stands inside the first screen */
  .fsHaveli { left: auto; right: 2vw; transform: none; width: auto; height: 74%; max-width: 50vw; max-height: calc(50vw * ${VB_H} / ${VB_W}); }
  .fsSky1 { right: 8%; top: 9%; width: clamp(200px, 34vh, 320px); height: clamp(200px, 34vh, 320px); }
  .fsSky2 { left: auto; right: 34%; top: 12%; width: clamp(180px, 28vh, 280px); height: clamp(123px, 19vh, 191px); }
}
@media (prefers-reduced-motion: reduce) {
  .fs *, .fs *::before, .fs *::after { animation: none !important; }
  .fsLantern, .fsBurst { display: none; }
}
`;
