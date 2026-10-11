"use client";

// Procedural art shared by the contract, the ending and the keepsake:
//   • a fingerprint (warped concentric ridges with breaks, from a seed)
//   • the round "Notarised by Cupid" seal
//   • a guilloche rosette for the stamp-paper header
// Each has a React version and an SVG-string version (for the keepsake
// canvas, which draws them as data: URL images — no web fonts there, so the
// strings use system serif faces).

import { useMemo } from "react";
import { P, rng } from "./ui";

export function thumbRidges(seed: number): string[] {
  const r = rng(seed || 7);
  const out: string[] = [];
  const cx = 50;
  const cy = 60;
  const ph = r() * 6;
  for (let k = 1; k <= 13; k++) {
    const rx = 2.4 + k * 3.25;
    const ry = 3.4 + k * 4.05;
    const gapAt = r() * Math.PI * 2;
    const gap = 0.25 + r() * 0.7;
    const steps = 30 + k * 3;
    let d = "";
    for (let s = 0; s <= steps; s++) {
      const th = gapAt + gap / 2 + ((Math.PI * 2 - gap) * s) / steps;
      const wob = 1 + 0.05 * Math.sin(3 * th + k * 0.7 + ph) + 0.03 * Math.sin(5 * th + ph * 2) + (k > 9 ? 0.04 * Math.sin(2 * th) : 0);
      const x = cx + Math.cos(th) * rx * wob;
      // flatten the bottom like a real thumb
      const y = cy + Math.sin(th) * ry * wob * (Math.sin(th) > 0 ? 0.88 : 1);
      d += `${s ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    out.push(d);
  }
  return out;
}

/** The fingerprint; `reveal` 0–1 inks it in from the centre outward. */
export function ThumbprintArt({ seed, reveal = 1, id = "pt", size = 96 }: { seed: number; reveal?: number; id?: string; size?: number }) {
  const ridges = useMemo(() => thumbRidges(seed), [seed]);
  const R = 6 + reveal * 70;
  return (
    <svg viewBox="0 0 100 120" width={size} height={(size * 120) / 100} aria-hidden style={{ display: "block", overflow: "visible" }}>
      <defs>
        <filter id={`${id}-soft`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
        <filter id={`${id}-ink`} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed={seed % 97} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" />
        </filter>
        <mask id={`${id}-m`}>
          <circle cx="50" cy="60" r={R} fill="#fff" filter={`url(#${id}-soft)`} />
        </mask>
      </defs>
      <g mask={`url(#${id}-m)`}>
        <ellipse cx="50" cy="60" rx="44" ry="54" fill={P.sindoor} opacity=".16" />
        <g filter={`url(#${id}-ink)`} fill="none" stroke={P.sindoor} strokeWidth="2.3" strokeLinecap="round" opacity=".92">
          {ridges.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
      </g>
    </svg>
  );
}

export function thumbprintSvg(seed: number): string {
  const ridges = thumbRidges(seed)
    .map((d) => `<path d="${d}"/>`)
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" width="400" height="480"><defs><filter id="i" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="${seed % 97}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.2"/></filter></defs><ellipse cx="50" cy="60" rx="44" ry="54" fill="${P.sindoor}" opacity=".16"/><g filter="url(#i)" fill="none" stroke="${P.sindoor}" stroke-width="2.3" stroke-linecap="round" opacity=".92">${ridges}</g></svg>`;
}

const SEAL_TEXT = "NOTARISED BY CUPID ✦ VAADA PAKKA ✦ ";

function sealStar(n = 44, r1 = 67, r2 = 62.5): string {
  let d = "";
  for (let i = 0; i < n * 2; i++) {
    const a = (Math.PI * i) / n;
    const r = i % 2 ? r2 : r1;
    d += `${i ? "L" : "M"}${(70 + Math.cos(a) * r).toFixed(2)} ${(70 + Math.sin(a) * r).toFixed(2)}`;
  }
  return `${d}Z`;
}

const WINGED_HEART =
  "M70 92 C56 82 52 72 57 66 C61 61.5 67 63 70 68 C73 63 79 61.5 83 66 C88 72 84 82 70 92 Z";
const WING_L = "M57 70 C46 64 38 66 34 72 C40 72 44 74 46 78 C49 75 53 75 57 76 Z";
const WING_R = "M83 70 C94 64 102 66 106 72 C100 72 96 74 94 78 C91 75 87 75 83 76 Z";

/** The round notary seal, as React. */
export function CupidSeal({ size = 120, color = P.berry, date }: { size?: number; color?: string; date: string }) {
  const star = useMemo(() => sealStar(), []);
  return (
    <svg viewBox="0 0 140 140" width={size} height={size} aria-hidden style={{ display: "block", overflow: "visible" }}>
      <defs>
        <path id="pd-seal-c" d="M70,70 m-49,0 a49,49 0 1,1 98,0 a49,49 0 1,1 -98,0" />
        <filter id="pd-seal-rough">
          <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="1" seed="3" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.4 1.25" result="a" />
          <feComposite in="SourceGraphic" in2="a" operator="in" />
        </filter>
      </defs>
      <g filter="url(#pd-seal-rough)" opacity=".9">
        <path d={star} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx="70" cy="70" r="58" fill="none" stroke={color} strokeWidth="2" />
        <circle cx="70" cy="70" r="40" fill="none" stroke={color} strokeWidth="1.6" />
        <text style={{ font: "700 10.4px Georgia, 'Times New Roman', serif", letterSpacing: "1.1px" }} fill={color}>
          <textPath href="#pd-seal-c" startOffset="0">
            {SEAL_TEXT}
            {SEAL_TEXT}
          </textPath>
        </text>
        <path d={WING_L} fill={color} opacity=".75" />
        <path d={WING_R} fill={color} opacity=".75" />
        <path d={WINGED_HEART} fill={color} />
        <text x="70" y="58" textAnchor="middle" style={{ font: "700 8px Georgia, serif", letterSpacing: "1px" }} fill={color}>
          ₹∞
        </text>
        <text x="70" y="104" textAnchor="middle" style={{ font: "700 7.5px Georgia, serif", letterSpacing: ".8px" }} fill={color}>
          {date}
        </text>
      </g>
    </svg>
  );
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);

export function cupidSealSvg(color: string, date: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 140" width="560" height="560"><defs><path id="c" d="M70,70 m-49,0 a49,49 0 1,1 98,0 a49,49 0 1,1 -98,0"/></defs><g opacity=".9"><path d="${sealStar()}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round"/><circle cx="70" cy="70" r="58" fill="none" stroke="${color}" stroke-width="2"/><circle cx="70" cy="70" r="40" fill="none" stroke="${color}" stroke-width="1.6"/><text font-family="Georgia, 'Times New Roman', serif" font-weight="700" font-size="10.4" letter-spacing="1.1" fill="${color}"><textPath href="#c">${esc(SEAL_TEXT + SEAL_TEXT)}</textPath></text><path d="${WING_L}" fill="${color}" opacity=".75"/><path d="${WING_R}" fill="${color}" opacity=".75"/><path d="${WINGED_HEART}" fill="${color}"/><text x="70" y="58" text-anchor="middle" font-family="Georgia, serif" font-weight="700" font-size="8" fill="${color}">₹∞</text><text x="70" y="104" text-anchor="middle" font-family="Georgia, serif" font-weight="700" font-size="7.5" fill="${color}">${esc(date)}</text></g></svg>`;
}

export const svgUrl = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

/** Guilloche rosette — overlapping rotated ellipses, like a banknote. */
export function Rosette({ size = 78, color = P.gold }: { size?: number; color?: string }) {
  const rings = useMemo(() => Array.from({ length: 18 }, (_, i) => i * 10), []);
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden style={{ display: "block" }}>
      <circle cx="50" cy="50" r="48" fill="#FFF8E8" stroke={color} strokeWidth="1.5" />
      <g fill="none" stroke={color} strokeWidth=".55" opacity=".85">
        {rings.map((a) => (
          <ellipse key={a} cx="50" cy="50" rx="40" ry="16" transform={`rotate(${a} 50 50)`} />
        ))}
        {rings.map((a) => (
          <ellipse key={`b${a}`} cx="50" cy="50" rx="26" ry="9" transform={`rotate(${a + 5} 50 50)`} stroke={P.rose} />
        ))}
      </g>
      <circle cx="50" cy="50" r="17" fill="#FFF8E8" stroke={color} strokeWidth="1.2" />
      <text x="50" y="56" textAnchor="middle" style={{ font: "700 16px Georgia, serif" }} fill={P.berry}>
        ₹∞
      </text>
    </svg>
  );
}
