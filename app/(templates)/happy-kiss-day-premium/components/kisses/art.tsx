"use client";

// SVG art for "A Thousand Kisses": a lip-print, the perfumed envelope, the
// lip-pressed wax seal and the glass heart jar. Colours come in as props.

import type { CSSProperties } from "react";
import { KD } from "./model";

/** A lipstick print (two lobes + the lower lip, with creases). */
export function Lips({ color, size = 60, style, cute }: { color: string; size?: number; style?: CSSProperties; cute?: boolean }) {
  if (cute) {
    // Cute mode: an X-and-heart kiss mark instead of a lip-print.
    return (
      <svg viewBox="0 0 64 48" width={size} height={(size * 48) / 64} aria-hidden style={{ display: "block", overflow: "visible", ...style }}>
        <path d="M10 8 L30 40 M30 8 L10 40" stroke={color} strokeWidth="7" strokeLinecap="round" />
        <path d="M46 40 C34 30 32 22 36 17 C40 12 45 14 46 19 C47 14 52 12 56 17 C60 22 58 30 46 40 Z" fill={color} />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 100 60" width={size} height={(size * 60) / 100} aria-hidden style={{ display: "block", overflow: "visible", ...style }}>
      <path d="M4 28 C14 12 30 4 42 10 C46 12 48 14 50 16 C52 14 54 12 58 10 C70 4 86 12 96 28 C86 30 70 30 50 30 C30 30 14 30 4 28 Z" fill={color} />
      <path d="M4 30 C20 32 34 33 50 33 C66 33 80 32 96 30 C86 48 70 57 50 57 C30 57 14 48 4 30 Z" fill={color} />
      <g stroke="rgba(255,255,255,.35)" strokeWidth="1.3" fill="none" strokeLinecap="round">
        <path d="M24 16 L27 26 M34 12 L35 25 M66 12 L65 25 M76 16 L73 26" />
        <path d="M22 38 L25 50 M36 40 L37 54 M50 41 L50 55 M64 40 L63 54 M78 38 L75 50" />
      </g>
      <path d="M8 30 C30 34 70 34 92 30" stroke="rgba(0,0,0,.25)" strokeWidth="1.6" fill="none" />
    </svg>
  );
}

/** The cream envelope with a lipstick kiss on the flap and the line in script. */
export function Envelope({ line, shade, cute }: { line: string; shade: string; cute: boolean }) {
  return (
    <svg viewBox="0 0 320 220" width="100%" height="100%" role="img" aria-label={`A perfumed envelope: ${line}`} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="kdPaper" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFF9F2" />
          <stop offset="1" stopColor="#F4E2D4" />
        </linearGradient>
        <linearGradient id="kdFoil" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#B88A1E" />
          <stop offset=".5" stopColor="#F3DC8A" />
          <stop offset="1" stopColor="#B88A1E" />
        </linearGradient>
      </defs>
      <g style={{ filter: "drop-shadow(0 26px 30px rgba(40,4,14,.55))" }}>
        <rect x="10" y="26" width="300" height="186" rx="8" fill="url(#kdPaper)" />
        <rect x="18" y="34" width="284" height="170" rx="5" fill="none" stroke="url(#kdFoil)" strokeWidth="1.4" />
        <path d="M10 210 L160 118 L310 210" fill="none" stroke="#E7D3C2" strokeWidth="2" />
        <path d="M12 28 L160 124 L308 28 Z" fill="#FBEFE4" stroke="#E7D3C2" strokeWidth="1.5" />
        <text x="160" y="186" textAnchor="middle" fill={KD.velvet} style={{ font: "500 22px var(--font-kd-hand), 'Caveat', cursive" }}>
          {line.length > 34 ? `${line.slice(0, 33)}…` : line}
        </text>
      </g>
      <g transform="translate(118 96) rotate(-8)" className="kd-envKiss">
        <Lips color={shade} size={84} cute={cute} />
      </g>
    </svg>
  );
}

/** A wax seal pressed with lips. `melt` 0–1 glows and softens it. */
export function WaxSeal({ shade, melt, cute }: { shade: string; melt: number; cute: boolean }) {
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%" aria-hidden style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id="kdWax" cx=".38" cy=".32" r=".8">
          <stop offset="0" stopColor="#F26A82" />
          <stop offset=".55" stopColor={shade} />
          <stop offset="1" stopColor="#3E0614" />
        </radialGradient>
        <radialGradient id="kdGlow" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#FFB38A" stopOpacity=".9" />
          <stop offset="1" stopColor="#FF6A3D" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r={92} fill="url(#kdGlow)" opacity={melt * 0.9} />
      <path
        d="M100 22 C128 20 150 30 166 50 C182 70 184 96 178 120 C172 146 152 168 126 176 C100 184 70 180 50 164 C30 148 20 124 22 98 C24 72 38 46 60 32 C72 24 86 22 100 22 Z"
        fill="url(#kdWax)"
        style={{ transform: `scale(${1 + melt * 0.05}, ${1 - melt * 0.03})`, transformOrigin: "100px 120px", transition: "transform .2s" }}
      />
      <circle cx="100" cy="100" r="56" fill="none" stroke="rgba(0,0,0,.22)" strokeWidth="5" />
      <circle cx="100" cy="100" r="56" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="1.5" transform="translate(-1.5 -1.5)" />
      <g transform="translate(64 80)" opacity={0.85 - melt * 0.4}>
        <Lips color="rgba(40,4,14,.45)" size={72} cute={cute} />
      </g>
      {/* drips */}
      {[0.3, 0.6, 0.9].map((th, i) => (
        <path key={i} d={`M${70 + i * 30} 176 q4 ${10 + i * 6} 0 ${18 + i * 8} q-4 -${8 + i * 4} 0 -${18 + i * 8}`} fill={shade} opacity={melt >= th ? 1 : 0} style={{ transition: "opacity .4s" }} />
      ))}
    </svg>
  );
}

/** The glass heart jar; `fill` 0–1. */
export function HeartJar({ fill, shade }: { fill: number; shade: string }) {
  const h = 70 * fill;
  return (
    <svg viewBox="0 0 100 96" width="100%" height="100%" aria-hidden style={{ overflow: "visible", display: "block" }}>
      <defs>
        <clipPath id="kdJarClip">
          <path d="M50 92 C18 72 6 56 8 38 C10 22 26 16 38 22 C44 25 48 30 50 34 C52 30 56 25 62 22 C74 16 90 22 92 38 C94 56 82 72 50 92 Z" />
        </clipPath>
      </defs>
      <rect x="34" y="2" width="32" height="12" rx="4" fill={KD.gold} />
      <g clipPath="url(#kdJarClip)">
        <rect x="0" y="0" width="100" height="96" fill="rgba(255,255,255,.35)" />
        <rect x="0" y={92 - h} width="100" height={h + 4} fill={shade} opacity=".85" style={{ transition: "y .4s, height .4s" }} />
      </g>
      <path d="M50 92 C18 72 6 56 8 38 C10 22 26 16 38 22 C44 25 48 30 50 34 C52 30 56 25 62 22 C74 16 90 22 92 38 C94 56 82 72 50 92 Z" fill="none" stroke="rgba(255,255,255,.9)" strokeWidth="3" />
      <path d="M20 40 C20 32 26 28 32 30" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".8" />
    </svg>
  );
}
