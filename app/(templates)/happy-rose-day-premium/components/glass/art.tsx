"use client";

// "The Glasshouse Rose" art — all SVG, generated from ONE parametric rose (rings of petals, Bloom-style): the
// opening hero (each ring unfurls on its own CSS transition), the 99-rose garden sprites (the same geometry as an
// SVG string → one canvas), the pressed rose in the book and the rose under the dome. Plus the bud on its stem
// with plucked-able thorns, and the cloche on its walnut base.

import type { CSSProperties, ReactNode } from "react";
import { SHADES, type RoseColor } from "./util";

type Ring = { n: number; r: number; r0: number; w: number; rot: number; closed: number };
const RINGS: Ring[] = [
  { n: 5, r: 47, r0: 9, w: 44, rot: 0, closed: 0.36 },
  { n: 5, r: 37, r0: 7, w: 36, rot: 36, closed: 0.44 },
  { n: 5, r: 27, r0: 5, w: 27, rot: 14, closed: 0.56 },
  { n: 4, r: 18, r0: 3, w: 19, rot: 58, closed: 0.72 },
  { n: 3, r: 10, r0: 1, w: 12, rot: 22, closed: 0.9 },
];

const petalD = (r: number, r0: number, w: number) =>
  `M0 ${-r0} C${(-w * 0.55).toFixed(1)} ${(-(r0 + (r - r0) * 0.25)).toFixed(1)} ${(-w * 0.62).toFixed(1)} ${(-r * 0.97).toFixed(1)} 0 ${-r} C${(w * 0.62).toFixed(1)} ${(-r * 0.97).toFixed(1)} ${(w * 0.55).toFixed(1)} ${(-(r0 + (r - r0) * 0.25)).toFixed(1)} 0 ${-r0}Z`;
const curlD = (r: number, w: number) => `M${(-w * 0.34).toFixed(1)} ${(-r * 0.86).toFixed(1)} Q0 ${(-r * 1.0).toFixed(1)} ${(w * 0.34).toFixed(1)} ${(-r * 0.86).toFixed(1)}`;

/** The rose from above. `open` false = a tight bud seen from the top; true = in full bloom (rings transition). */
export function RoseHead({ color, open = true, id, size, style, className }: { color: RoseColor; open?: boolean; id: string; size?: number | string; style?: CSSProperties; className?: string }) {
  const s = SHADES[color];
  return (
    <svg viewBox="-50 -50 100 100" width={size} height={size} className={className} style={{ display: "block", overflow: "visible", ...style }} aria-hidden>
      <defs>
        {RINGS.map((R, i) => (
          <radialGradient key={i} id={`${id}-g${i}`} cx="0" cy="0" r={R.r} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor={s.dark} />
            <stop offset={i < 2 ? ".55" : ".7"} stopColor={i < 3 ? s.base : s.dark} />
            <stop offset="1" stopColor={i < 2 ? s.light : s.base} />
          </radialGradient>
        ))}
      </defs>
      {RINGS.map((R, i) => (
        <g key={i} className="gh-ring" style={{ transform: open ? `rotate(${R.rot}deg) scale(1)` : `rotate(${R.rot + 34}deg) scale(${R.closed})`, transitionDelay: `${(4 - i) * 0.07 + (open ? (i === 0 ? 0.35 : 0.08 * (4 - i)) : 0)}s` }}>
          {Array.from({ length: R.n }, (_, k) => (
            <g key={k} transform={`rotate(${(k * 360) / R.n})`}>
              <path d={petalD(R.r, R.r0, R.w)} fill={`url(#${id}-g${i})`} stroke={s.dark} strokeOpacity=".35" strokeWidth=".6" />
              <path d={curlD(R.r, R.w)} fill="none" stroke={s.hi} strokeOpacity={i < 3 ? 0.55 : 0.3} strokeWidth="1.1" strokeLinecap="round" />
            </g>
          ))}
        </g>
      ))}
      <path d="M-3 -1 C-3 -5 3 -5 3 -1 C3 3 -2 4 -3 1" fill="none" stroke={s.dark} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/** The same rose as an SVG string (garden sprites, keepsake). */
export function roseSvg(color: RoseColor, px = 128, opts: { tilt?: number } = {}): string {
  const s = SHADES[color];
  const grads = RINGS.map((R, i) => `<radialGradient id="g${i}" cx="0" cy="0" r="${R.r}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${s.dark}"/><stop offset="${i < 2 ? ".55" : ".7"}" stop-color="${i < 3 ? s.base : s.dark}"/><stop offset="1" stop-color="${i < 2 ? s.light : s.base}"/></radialGradient>`).join("");
  const rings = RINGS.map(
    (R, i) =>
      `<g transform="rotate(${R.rot})">${Array.from({ length: R.n }, (_, k) => `<g transform="rotate(${(k * 360) / R.n})"><path d="${petalD(R.r, R.r0, R.w)}" fill="url(#g${i})" stroke="${s.dark}" stroke-opacity=".35" stroke-width=".6"/><path d="${curlD(R.r, R.w)}" fill="none" stroke="${s.hi}" stroke-opacity="${i < 3 ? 0.55 : 0.3}" stroke-width="1.1" stroke-linecap="round"/></g>`).join("")}</g>`,
  ).join("");
  const tilt = opts.tilt ? ` transform="scale(1 ${opts.tilt})"` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="-50 -50 100 100"><defs>${grads}</defs><g${tilt}>${rings}<path d="M-3 -1 C-3 -5 3 -5 3 -1 C3 3 -2 4 -3 1" fill="none" stroke="${s.dark}" stroke-width="1.4" stroke-linecap="round"/></g></svg>`;
}
export const svgUrl = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

/** Thorn positions on the stem (viewBox 0 0 200 560): y, and which side. */
export const THORN_SPOTS = [
  { y: 452, side: 1 },
  { y: 402, side: -1 },
  { y: 352, side: 1 },
  { y: 268, side: -1 },
  { y: 222, side: 1 },
] as const;

/** The bud on its long stem (the thorns are drawn by the scene, over this). `swell` 0–1 grows the bud. */
export function BudStem({ color, swell = 0, id, children }: { color: RoseColor; swell?: number; id: string; children?: ReactNode }) {
  const s = SHADES[color];
  return (
    <svg viewBox="0 0 200 560" style={{ display: "block", width: "100%", height: "100%", overflow: "visible" }} aria-hidden>
      <defs>
        <linearGradient id={`${id}-st`} x1="0" x2="1"><stop offset="0" stopColor="#2C4F2A" /><stop offset=".5" stopColor="#4F8248" /><stop offset="1" stopColor="#2C4F2A" /></linearGradient>
        <linearGradient id={`${id}-lf`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#6FA05F" /><stop offset="1" stopColor="#2F5A2B" /></linearGradient>
        <radialGradient id={`${id}-bd`} cx=".45" cy=".35" r=".8"><stop offset="0" stopColor={s.light} /><stop offset=".6" stopColor={s.base} /><stop offset="1" stopColor={s.dark} /></radialGradient>
      </defs>
      <path d="M100 560 C96 470 106 380 100 300 C96 240 102 200 100 168" fill="none" stroke={`url(#${id}-st)`} strokeWidth="8" strokeLinecap="round" />
      <path d="M100 420 C78 404 56 404 40 418 C58 432 82 434 100 420 Z" fill={`url(#${id}-lf)`} />
      <path d="M100 420 C80 414 60 414 44 418" stroke="#244521" strokeWidth="1" fill="none" opacity=".6" />
      <path d="M101 318 C122 300 146 300 162 312 C144 328 120 330 101 318 Z" fill={`url(#${id}-lf)`} />
      <path d="M101 318 C122 310 142 310 158 312" stroke="#244521" strokeWidth="1" fill="none" opacity=".6" />
      <g style={{ transformOrigin: "100px 170px", transform: `scale(${1 + swell * 0.35})`, transition: "transform .25s" }}>
        <path d="M100 172 C64 160 62 102 100 66 C138 102 136 160 100 172 Z" fill={s.dark} />
        <path d="M100 172 C70 158 70 110 95 78 C88 118 96 150 113 168 Z" fill={`url(#${id}-bd)`} />
        <path d="M100 172 C132 160 132 108 106 76 C112 118 104 150 87 168 Z" fill={s.base} opacity=".92" />
        <path d="M95 84 C99 74 105 72 108 80" stroke={s.hi} strokeWidth="1.6" fill="none" opacity=".7" strokeLinecap="round" />
        <path d="M100 176 L80 150 L94 168 L100 140 L106 168 L120 150 Z" fill="#3E6B3A" />
      </g>
      {children}
    </svg>
  );
}

/** A thorn at a spot (draw inside BudStem's viewBox). */
export function thornD(y: number, side: number) {
  const x = 100 + side * 3;
  return `M${x} ${y} L${x + side * 18} ${y - 12} L${x + side * 1} ${y - 9} Z`;
}

/** The cloche scene (viewBox 0 0 300 430): walnut base with the engraving, the rose standing on its stem, the glow, and the glass dome. */
export function DomeScene({ color, id, domeDown, engraved, glowBoost, sprite }: { color: RoseColor; id: string; domeDown: boolean; engraved: [string, string]; glowBoost: boolean; sprite: string }) {
  const s = SHADES[color];
  return (
    <svg viewBox="0 0 300 430" style={{ display: "block", width: "100%", height: "auto", overflow: "visible" }} role="img" aria-label={`A ${color} rose under a glass dome. ${engraved.join(" ")}`}>
      <defs>
        <radialGradient id={`${id}-glow`}><stop offset="0" stopColor={`rgba(${s.glow},.75)`} /><stop offset="1" stopColor={`rgba(${s.glow},0)`} /></radialGradient>
        <linearGradient id={`${id}-wood`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7A4B2C" /><stop offset=".5" stopColor="#5A331C" /><stop offset="1" stopColor="#3A1F10" /></linearGradient>
        <linearGradient id={`${id}-glass`} x1="0" x2="1"><stop offset="0" stopColor="rgba(255,255,255,.22)" /><stop offset=".18" stopColor="rgba(255,255,255,.04)" /><stop offset=".8" stopColor="rgba(255,255,255,.02)" /><stop offset="1" stopColor="rgba(255,255,255,.16)" /></linearGradient>
      </defs>
      <ellipse className={`gh-glowOrb${glowBoost ? " is-boost" : ""}`} cx="150" cy="190" rx="130" ry="130" fill={`url(#${id}-glow)`} />
      {/* base */}
      <path d="M26 362 L274 362 L266 408 Q150 424 34 408 Z" fill={`url(#${id}-wood)`} />
      <ellipse cx="150" cy="362" rx="124" ry="20" fill="#8B5A35" />
      <ellipse cx="150" cy="360" rx="110" ry="14" fill="#6B4026" />
      <text x="150" y="388" textAnchor="middle" className="gh-engr">{engraved[0]}</text>
      <text x="150" y="404" textAnchor="middle" className="gh-engr is-small">{engraved[1]}</text>
      {/* the rose */}
      <path d="M150 358 C146 320 154 280 150 226" stroke="#3E6B3A" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M150 312 C132 300 116 302 104 312 C120 322 138 322 150 312 Z" fill="#4F8248" />
      <path d="M151 282 C168 268 186 270 196 280 C182 292 164 292 151 282 Z" fill="#4F8248" />
      <image href={sprite} x="78" y="140" width="144" height="144" preserveAspectRatio="xMidYMid meet" />
      {/* the cloche */}
      <g className="gh-cloche" style={{ transform: domeDown ? "translateY(0)" : "translateY(-130%)" }}>
        <path d="M44 360 L44 160 C44 40 256 40 256 160 L256 360 Z" fill={`url(#${id}-glass)`} stroke="rgba(255,255,255,.45)" strokeWidth="2" />
        <path d="M64 330 L64 168 C64 96 110 66 150 62" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="5" strokeLinecap="round" opacity=".55" />
        <path d="M232 300 L232 190" stroke="rgba(255,255,255,.35)" strokeWidth="3" strokeLinecap="round" />
        <ellipse cx="150" cy="48" rx="14" ry="7" fill="rgba(255,255,255,.55)" />
        <ellipse cx="150" cy="360" rx="106" ry="10" fill="none" stroke="rgba(255,255,255,.3)" strokeWidth="2" />
      </g>
    </svg>
  );
}
