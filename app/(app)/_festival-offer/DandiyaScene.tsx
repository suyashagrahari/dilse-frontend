"use client";

// ─── The garba night behind the /dandiya-offer hero ──────────────────────────
//
// A kumkum-red Navratri night: bandhani dots in the sky, two stage lights
// sweeping, a giant mirror-work mandala glowing where a moon would be, a
// mirror-work bandhanwar strung across the top, and a garba mandap — scalloped
// marigold canopy on carved pillars wrapped in genda garlands, bells, a
// bandhanwar under the canopy and the garbo (the pierced clay lamp) glowing at
// the centre of a chalk garba circle. The dancing couple twirls in front of it,
// the bubudubu panda swings his sticks beside the dhol, sticks twirl, mirror
// glints flash and marigold heads tumble down.
//
// Performance: sky, mandap, mandala, lights and petals are inline SVG/CSS — no
// request, so the headline stays the LCP. Every moving layer animates transform
// or opacity only. The CDN GIFs (couple, panda, the still "Dandiya Dhamaal"
// sticker) come through IdleGif: requested after load + idle into boxes already
// sized, so nothing shifts. Reduced motion stills everything.

import type { CSSProperties } from "react";
import IdleGif from "@/components/promo/IdleGif";
import { Bandhanwar, Dandiya, Dhol, Mirror } from "@/components/promo/festivalArt";
import { FESTIVE_GIF } from "@/lib/season";

const VB_W = 400;
const VB_H = 330;

/** Bells under the canopy: [x, string length]. */
const BELLS: [number, number][] = [[96, 16], [130, 24], [164, 14], [236, 14], [270, 24], [304, 16]];

/** Fairy-light dots on the swags from the canopy's edge. */
const swagDots = (x0: number, x1: number, y: number, sag: number, n: number) =>
  Array.from({ length: n }, (_, i) => {
    const t = (i + 0.5) / n;
    return [Math.round((x0 + (x1 - x0) * t) * 10) / 10, Math.round((y + Math.sin(t * Math.PI) * sag) * 10) / 10] as const;
  });
const LIGHTS = [...swagDots(60, 140, 126, 18, 7), ...swagDots(140, 260, 126, 24, 10), ...swagDots(260, 340, 126, 18, 7)];

function Pillar({ x, back = false }: { x: number; back?: boolean }) {
  const w = back ? 8 : 12;
  const top = back ? 122 : 116;
  return (
    <g opacity={back ? 0.75 : 1}>
      <rect x={x - w / 2} y={top} width={w} height={300 - top} rx="2" fill={back ? "#5a070c" : "#8a0d15"} stroke="#d4a537" strokeWidth={back ? 0.8 : 1.2} />
      {[150, 190, 230, 270].map((y) => <rect key={y} x={x - w / 2 - 1.5} y={y} width={w + 3} height="3" fill="#d4a537" />)}
      {/* a genda garland spiralling down the pillar */}
      {!back && Array.from({ length: 11 }, (_, i) => {
        const y = top + 8 + i * 16;
        const dx = (i % 2 ? 1 : -1) * (w / 2 - 1);
        return <circle key={i} cx={x + dx} cy={y} r="3.6" fill={i % 3 ? "#ffb000" : "#f07c0a"} />;
      })}
      <rect x={x - w / 2 - 4} y={296} width={w + 8} height="6" rx="1.5" fill="#d4a537" />
    </g>
  );
}

function MandapSvg() {
  return (
    <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="dsMandapSvg" aria-hidden preserveAspectRatio="xMidYMax meet">
      <defs>
        <linearGradient id="ds-canopy" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd04a" />
          <stop offset=".6" stopColor="#ffb000" />
          <stop offset="1" stopColor="#e07800" />
        </linearGradient>
        <linearGradient id="ds-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6e0a12" />
          <stop offset="1" stopColor="#3a0408" />
        </linearGradient>
        <radialGradient id="ds-garbo" cx="50%" cy="45%" r="60%">
          <stop offset="0" stopColor="#fff3c4" />
          <stop offset=".35" stopColor="#ffb000" />
          <stop offset="1" stopColor="#b3121b" />
        </radialGradient>
        <radialGradient id="ds-mir" cx="38%" cy="34%" r="70%">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".5" stopColor="#dfe6ef" />
          <stop offset="1" stopColor="#8f9cad" />
        </radialGradient>
      </defs>

      {/* the floor and the chalk garba circle */}
      <path d="M0 292 H400 V330 H0 Z" fill="url(#ds-floor)" />
      <ellipse cx="200" cy="306" rx="186" ry="20" fill="none" stroke="#ffe6a6" strokeWidth="1.6" strokeDasharray="1.5 6" strokeLinecap="round" opacity=".8" />
      <ellipse cx="200" cy="306" rx="130" ry="14" fill="none" stroke="#ff3d9a" strokeWidth="1.4" strokeDasharray="1.5 5" strokeLinecap="round" opacity=".8" />
      <ellipse cx="200" cy="306" rx="74" ry="8" fill="none" stroke="#12b5a6" strokeWidth="1.2" strokeDasharray="1.5 4" strokeLinecap="round" opacity=".8" />

      {/* back pillars, then the front ones */}
      <Pillar x={118} back />
      <Pillar x={282} back />
      <Pillar x={64} />
      <Pillar x={336} />

      {/* the scalloped marigold canopy */}
      <path d="M44 116 Q200 -4 356 116 Z" fill="url(#ds-canopy)" stroke="#b3121b" strokeWidth="2" />
      <path d="M70 108 Q200 14 330 108" fill="none" stroke="#b3121b" strokeWidth="1.2" strokeDasharray="2 3" />
      <path d="M110 98 Q200 34 290 98" fill="none" stroke="#e5197d" strokeWidth="1.2" strokeDasharray="1.2 3" />
      {[100, 150, 200, 250, 300].map((x, i) => (
        <g key={x}>
          <circle cx={x} cy={i === 2 ? 66 : i % 4 ? 84 : 102} r="5" fill="#b3121b" stroke="#d4a537" strokeWidth="1" />
          <circle cx={x} cy={i === 2 ? 66 : i % 4 ? 84 : 102} r="3" fill="url(#ds-mir)" />
        </g>
      ))}
      {/* the kalash finial */}
      <path d="M190 58 h20 l-2.5 -11 a7.5 7.5 0 0 0 -15 0 z" fill="#d4a537" stroke="#b3121b" strokeWidth=".8" />
      <path d="M200 46 v-10" stroke="#d4a537" strokeWidth="2" />
      <path d="M200 28 l5 6 -5 2 -5 -2 z" fill="#ff3d9a" />
      {/* scallops along the canopy's hem */}
      {Array.from({ length: 13 }, (_, i) => {
        const x = 44 + i * 24;
        return (
          <g key={`sc${i}`}>
            <path d={`M${x} 116 q12 16 24 0`} fill={i % 2 ? "#c8141f" : "#e5197d"} stroke="#d4a537" strokeWidth="1" />
            <circle cx={x + 12} cy="121" r="2.4" fill="url(#ds-mir)" />
          </g>
        );
      })}
      {/* fairy lights swagged under the canopy */}
      <g className="dsLights">
        {LIGHTS.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="1.8" fill={i % 3 === 0 ? "#fff1c2" : i % 3 === 1 ? "#ffb000" : "#ff7ab8"} style={{ animationDelay: `${-(i % 5) * 0.3}s` }} />
        ))}
      </g>
      {/* bells */}
      {BELLS.map(([x, l], i) => (
        <g key={`b${i}`} className="dsBell" style={{ transformOrigin: `${x}px 124px`, animationDelay: `${-i * 0.27}s` }}>
          <path d={`M${x} 124 v${l}`} stroke="#d4a537" strokeWidth=".9" />
          <path d={`M${x - 4} ${128 + l} q4 -9 8 0 z`} fill="#f7c64a" />
          <circle cx={x} cy={129 + l} r="1.2" fill="#b3121b" />
        </g>
      ))}

      {/* the garbo: a pierced clay pot with its lamp, glowing, on a stand */}
      <ellipse cx="200" cy="262" rx="44" ry="40" fill="rgba(255,176,0,.22)" className="dsGarboGlow" />
      <path d="M186 292 h28 l-4 -10 h-20 z" fill="#d4a537" />
      <path d="M200 282 c-22 0 -30 -12 -30 -26 c0 -16 12 -26 30 -26 c18 0 30 10 30 26 c0 14 -8 26 -30 26 z" fill="url(#ds-garbo)" stroke="#7a0f12" strokeWidth="1.4" />
      {[[186, 246], [200, 242], [214, 246], [180, 260], [193, 258], [207, 258], [220, 260], [188, 272], [200, 274], [212, 272]].map(([x, y], i) => (
        <circle key={`h${i}`} cx={x} cy={y} r="2.2" fill="#fff6d0" className="dsHole" style={{ animationDelay: `${-(i % 4) * 0.25}s` }} />
      ))}
      <path d="M190 232 h20 l-3 -6 h-14 z" fill="#7a0f12" />
      <path className="dsFlame" d="M200 206 c4 6 6 10 6 13 a6 6 0 0 1 -12 0 c0 -3 2 -7 6 -13 z" fill="#ffd36b" style={{ transformOrigin: "200px 225px" }} />
    </svg>
  );
}

const pctBox = (x: number, y: number, w: number, h: number): CSSProperties => ({
  position: "absolute", left: `${(x / VB_W) * 100}%`, top: `${(y / VB_H) * 100}%`, width: `${(w / VB_W) * 100}%`, height: `${(h / VB_H) * 100}%`,
});

const GLINTS = [
  { left: "8%", top: "22%", size: 30, delay: 0 },
  { left: "40%", top: "10%", size: 20, delay: 0.8 },
  { left: "58%", top: "30%", size: 24, delay: 1.6 },
  { left: "90%", top: "14%", size: 18, delay: 2.2 },
  { left: "24%", top: "44%", size: 16, delay: 1.1 },
];

const PETALS = Array.from({ length: 12 }, (_, i) => ({
  left: `${(i * 8.3 + 4) % 100}%`,
  delay: -((i * 1.7) % 11),
  dur: 9 + (i % 4) * 2,
  size: 10 + (i % 3) * 4,
}));

export default function DandiyaScene() {
  return (
    <div className="ds" aria-hidden>
      <span className="dsDots" />
      <span className="dsBeam dsBeamL" />
      <span className="dsBeam dsBeamR" />
      <span className="dsMoon"><Mirror size={260} thread="#ffb000" /></span>
      <Bandhanwar n={30} className="dsBand" />
      {GLINTS.map((g, i) => (
        <span key={i} className="dsGlint" style={{ left: g.left, top: g.top, animationDelay: `${g.delay}s` }}>
          <Mirror size={g.size} thread={i % 2 ? "#ff3d9a" : "#ffb000"} />
        </span>
      ))}
      {PETALS.map((p, i) => (
        <span key={i} className="dsPetal" style={{ left: p.left, width: p.size, height: p.size, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s` }} />
      ))}

      <div className="dsMandap">
        <MandapSvg />
        <span className="dsCouple" style={pctBox(126, 168, 148, 148)}>
          <IdleGif src={FESTIVE_GIF("dandiyapartyner.webp")} width={498} height={498} className="dsImg" />
        </span>
        <span className="dsPanda" style={pctBox(330, 236, 64, 64)}>
          <IdleGif src={FESTIVE_GIF("bubudubu-dandiya-playing.webp")} width={240} height={236} className="dsImg" />
        </span>
        <span className="dsDhol" style={pctBox(8, 262, 60, 44)}><Dhol size={60} /></span>
        <span className="dsTwirl dsT1" style={pctBox(30, 150, 36, 38)}><Dandiya size={36} /></span>
        <span className="dsTwirl dsT2" style={pctBox(338, 152, 32, 34)}><Dandiya size={32} /></span>
      </div>
      <span className="dsSticker">
        <IdleGif src={FESTIVE_GIF("dandiya-dhamal.webp")} width={384} height={500} className="dsImg" />
      </span>
    </div>
  );
}

export const DANDIYA_SCENE_CSS = `
.ds { position: absolute; inset: 0; z-index: 0; overflow: hidden; pointer-events: none; }
.dsDots { position: absolute; inset: 0; opacity: .38;
  background: radial-gradient(circle at 50% 50%, rgba(255,240,220,.7) 0 1.4px, transparent 1.9px) 0 0 / 24px 24px,
    radial-gradient(circle at 50% 50%, rgba(255,214,120,.55) 0 1.2px, transparent 1.7px) 12px 12px / 24px 24px;
  -webkit-mask-image: linear-gradient(180deg, #000 0%, #000 55%, transparent 90%); mask-image: linear-gradient(180deg, #000 0%, #000 55%, transparent 90%); }
/* two stage lights sweeping over the garba */
.dsBeam { position: absolute; bottom: 0; width: 46vmax; height: 120%; transform-origin: 50% 100%; opacity: .32; mix-blend-mode: screen;
  background: linear-gradient(0deg, rgba(255,214,120,.0) 0%, rgba(255,214,120,.55) 30%, rgba(255,240,200,.0) 100%);
  clip-path: polygon(48% 100%, 52% 100%, 100% 0, 0 0); }
.dsBeamL { left: 0; animation: dsSweepL 9s ease-in-out infinite alternate; }
.dsBeamR { right: 0; background: linear-gradient(0deg, rgba(255,61,154,0) 0%, rgba(255,61,154,.5) 30%, rgba(255,61,154,0) 100%); animation: dsSweepR 11s ease-in-out infinite alternate; }
@keyframes dsSweepL { from { transform: translateX(-20%) rotate(24deg); } to { transform: translateX(-20%) rotate(-6deg); } }
@keyframes dsSweepR { from { transform: translateX(20%) rotate(-24deg); } to { transform: translateX(20%) rotate(8deg); } }
/* the mirror mandala glowing where a moon would be */
.dsMoon { position: absolute; right: 5%; top: 10%; opacity: .85; filter: drop-shadow(0 0 30px rgba(255,214,120,.55)) drop-shadow(0 0 70px rgba(255,61,154,.3)); animation: dsMoon 40s linear infinite; }
.dsMoon svg { display: block; width: clamp(110px, 22vmin, 240px); height: auto; }
@keyframes dsMoon { to { transform: rotate(360deg); } }
.dsBand { position: absolute; left: 0; top: 0; width: 100%; height: clamp(36px, 5.6vh, 52px); filter: drop-shadow(0 5px 8px rgba(40,0,4,.45)); }
.dsGlint { position: absolute; display: block; animation: dsGlint 3.2s ease-in-out infinite; }
.dsGlint svg { display: block; filter: drop-shadow(0 0 8px rgba(255,255,255,.8)); }
@keyframes dsGlint { 0%, 100% { opacity: .45; transform: rotate(0deg) scale(.85); } 50% { opacity: 1; transform: rotate(60deg) scale(1.2); } }
.dsPetal { position: absolute; top: -30px; display: block; border-radius: 50%; opacity: 0;
  background: radial-gradient(circle, #ffcf3a 0 28%, #ffb000 30% 62%, #f07c0a 64%); box-shadow: 0 1px 2px rgba(90,7,12,.4);
  animation: dsFall 10s linear infinite; }
@keyframes dsFall { 0% { transform: translate(0, 0) rotate(0); opacity: 0; } 6% { opacity: .95; } 50% { transform: translate(24px, 55vh) rotate(260deg); }
  90% { opacity: .9; } 100% { transform: translate(-10px, 110vh) rotate(520deg); opacity: 0; } }

/* the mandap: phones stand it under the hero copy */
.dsMandap { position: absolute; left: 50%; bottom: 0; width: min(112vw, 560px); transform: translateX(-50%); aspect-ratio: ${VB_W} / ${VB_H}; }
.dsMandapSvg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; overflow: visible;
  filter: drop-shadow(0 0 26px rgba(255,176,0,.25)) drop-shadow(0 10px 24px rgba(40,0,4,.5)); }
.dsLights circle { animation: dsBulb 1.8s steps(2) infinite; }
@keyframes dsBulb { 0% { opacity: 1; } 50% { opacity: .35; } }
.dsBell { animation: dsBell 1.8s ease-in-out infinite; }
@keyframes dsBell { 0%, 100% { transform: rotate(-8deg); } 50% { transform: rotate(8deg); } }
.dsGarboGlow { animation: dsGlow 2.4s ease-in-out infinite; transform-box: fill-box; transform-origin: 50% 50%; }
@keyframes dsGlow { 0%, 100% { opacity: .7; transform: scale(1); } 50% { opacity: 1; transform: scale(1.08); } }
.dsHole { animation: dsHole 1.4s ease-in-out infinite alternate; }
@keyframes dsHole { from { opacity: .55; } to { opacity: 1; } }
.dsFlame { animation: dsFlick 1.2s ease-in-out infinite alternate; }
@keyframes dsFlick { from { transform: scale(1, 1) rotate(-4deg); } to { transform: scale(.86, 1.16) rotate(4deg); } }
.dsImg { width: 100%; height: 100%; }
.dsCouple { transform-origin: 50% 100%; animation: dsDance 2.2s ease-in-out infinite; filter: drop-shadow(0 8px 14px rgba(40,0,4,.5)); }
@keyframes dsDance { 0%, 100% { transform: rotate(-3deg) translateY(0); } 25% { transform: rotate(0deg) translateY(-6px); } 50% { transform: rotate(3deg) translateY(0); } 75% { transform: rotate(0deg) translateY(-4px); } }
.dsPanda { transform-origin: 50% 100%; animation: dsHop 1.1s ease-in-out infinite; filter: drop-shadow(0 6px 10px rgba(40,0,4,.45)); }
@keyframes dsHop { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
.dsDhol { display: flex; align-items: flex-end; animation: dsDhol .55s ease-in-out infinite alternate; }
.dsDhol svg { width: 100%; height: auto; filter: drop-shadow(0 6px 10px rgba(40,0,4,.5)); }
@keyframes dsDhol { from { transform: rotate(-3deg); } to { transform: rotate(3deg) translateY(-2px); } }
.dsTwirl { display: flex; animation: dsTwirl 2.4s cubic-bezier(.5,0,.5,1) infinite; }
.dsTwirl svg { width: 100%; height: auto; filter: drop-shadow(0 0 6px rgba(255,214,120,.85)); }
.dsT2 { animation-delay: -1.2s; animation-direction: reverse; }
@keyframes dsTwirl { 0% { transform: rotate(0); } 60%, 100% { transform: rotate(360deg); } }
.dsSticker { position: absolute; display: none; width: 120px; aspect-ratio: 384 / 500; transform: rotate(-8deg); animation: dsBob 3.4s ease-in-out infinite; filter: drop-shadow(0 8px 14px rgba(40,0,4,.45)); }
@keyframes dsBob { 0%, 100% { transform: rotate(-8deg) translateY(0); } 50% { transform: rotate(-3deg) translateY(-8px); } }

@media (max-width: 639px) {
  .dsBeam { opacity: .22; }
  .dsMoon { display: none; }
  .dsGlint:nth-of-type(n+4) { display: none; }
}
@media (min-width: 640px) {
  .dsMandap { width: min(84vw, 640px); }
}
@media (min-width: 1024px) {
  /* desktop: the mandap fills the right half of the night, sized off the hero's
     height so the garba circle always stands inside the first screen */
  .dsMandap { left: auto; right: 3vw; transform: none; width: auto; height: 78%; max-width: 50vw; max-height: calc(50vw * ${VB_H} / ${VB_W}); }
  .dsMoon { right: auto; left: 47%; top: 12%; opacity: .7; }
  .dsMoon svg { width: clamp(90px, 16vh, 170px); }
  .dsSticker { display: block; left: 40%; bottom: 6%; width: clamp(80px, 13vh, 130px); }
}
@media (prefers-reduced-motion: reduce) {
  .ds *, .ds *::before, .ds *::after { animation: none !important; }
  .dsPetal, .dsBeam { display: none; }
}
`;
