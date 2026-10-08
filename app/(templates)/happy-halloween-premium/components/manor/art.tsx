"use client";

// The Midnight Manor's art, all SVG/CSS (no images): the sealed invitation, the
// manor silhouette, the iron gate, a candle, the spirit-board ghost, a bat,
// the valve radio and the cauldron. Colours come from MM (./model.ts).

import type { CSSProperties } from "react";
import { MM } from "./model";

/** The gate's sealed object: a black envelope, gold edging, a maroon wax seal with a pumpkin crest. */
export function Invitation({ name, title }: { name: string; title: string }) {
  return (
    <svg viewBox="0 0 320 230" width="100%" height="100%" role="img" aria-label={`A sealed black invitation for ${name}`} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="mmEnv" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#25202F" />
          <stop offset="1" stopColor="#0F0C16" />
        </linearGradient>
        <linearGradient id="mmGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFF1BF" />
          <stop offset=".45" stopColor="#E9B95A" />
          <stop offset="1" stopColor="#9A6A1F" />
        </linearGradient>
        <radialGradient id="mmWax" cx=".38" cy=".32" r=".75">
          <stop offset="0" stopColor="#D2575F" />
          <stop offset=".5" stopColor={MM.wax} />
          <stop offset="1" stopColor="#4A0F19" />
        </radialGradient>
      </defs>
      <g style={{ filter: "drop-shadow(0 26px 34px rgba(0,0,0,.6))" }}>
        <rect x="10" y="30" width="300" height="190" rx="10" fill="url(#mmEnv)" stroke="url(#mmGold)" strokeWidth="2" />
        <rect x="20" y="40" width="280" height="170" rx="6" fill="none" stroke="url(#mmGold)" strokeWidth=".8" strokeDasharray="2 4" opacity=".7" />
        <path d="M10 40 L160 135 L310 40" fill="none" stroke="url(#mmGold)" strokeWidth="1.6" opacity=".9" />
        <path d="M12 32 L160 128 L308 32 Z" fill="#1B1724" stroke="url(#mmGold)" strokeWidth="1.4" />
        <text x="160" y="196" textAnchor="middle" fill="url(#mmGold)" style={{ font: "italic 400 15px var(--font-mm-book), Georgia, serif", letterSpacing: ".04em" }}>
          {title.length > 34 ? `${title.slice(0, 33)}…` : title}
        </text>
      </g>
      <g className="mm-sealWax" style={{ transformOrigin: "160px 128px" }}>
        <circle cx="160" cy="128" r="31" fill="url(#mmWax)" />
        <path d="M131 124 q-6 10 4 18 M189 124 q6 10 -4 18 M146 101 q-10 -2 -14 8 M174 101 q10 -2 14 8" stroke="#5A1220" strokeWidth="3" fill="none" opacity=".55" />
        <circle cx="160" cy="128" r="22" fill="none" stroke="#E9B95A" strokeWidth="1.2" opacity=".55" />
        {/* pumpkin crest */}
        <g fill="#F4C66B" opacity=".92">
          <ellipse cx="160" cy="131" rx="12" ry="9.5" />
          <ellipse cx="152.5" cy="131" rx="6" ry="9" fill="#E3A94C" />
          <ellipse cx="167.5" cy="131" rx="6" ry="9" fill="#E3A94C" />
          <rect x="158.5" y="118" width="3" height="6" rx="1" fill="#8FB46A" />
        </g>
        <path d="M154 129 l2.6 -3 2.6 3 z M163 129 l2.6 -3 2.6 3 z M153 134 q7 5 14 0 q-7 2 -14 0z" fill={MM.wax} />
      </g>
    </svg>
  );
}

/** The manor on the hill: towers, a clock tower, windows that glow. */
export function ManorSilhouette({ lit = 0.4, dawn = false, style }: { lit?: number; dawn?: boolean; style?: CSSProperties }) {
  const win = dawn ? "#FFD49A" : "#FFC86B";
  const body = dawn ? "#3B2740" : "#120F1D";
  const roof = dawn ? "#2C1D33" : "#0B0913";
  const w = (x: number, y: number, h = 16, k = 0) => (
    <rect key={`${x}-${y}`} x={x} y={y} width="9" height={h} rx="4.5" fill={win} opacity={Math.min(1, lit * (0.6 + ((k * 37) % 5) / 10))} />
  );
  return (
    <svg viewBox="0 0 600 300" preserveAspectRatio="xMidYMax meet" aria-hidden style={{ display: "block", width: "100%", height: "100%", ...style }}>
      <g fill={body}>
        {/* hill */}
        <path d="M0 300 L0 262 Q150 228 300 236 Q450 226 600 258 L600 300 Z" fill={dawn ? "#2A1B30" : "#090711"} />
        {/* left wing */}
        <rect x="150" y="160" width="110" height="82" />
        <path d="M144 162 L205 118 L266 162 Z" fill={roof} />
        {/* right wing */}
        <rect x="340" y="166" width="112" height="76" />
        <path d="M334 168 L396 126 L458 168 Z" fill={roof} />
        {/* left tower */}
        <rect x="122" y="118" width="40" height="124" />
        <path d="M116 120 L142 52 L168 120 Z" fill={roof} />
        <rect x="140.5" y="36" width="3" height="18" fill={roof} />
        {/* right tower */}
        <rect x="440" y="128" width="36" height="114" />
        <path d="M434 130 L458 70 L482 130 Z" fill={roof} />
        {/* central clock tower */}
        <rect x="262" y="96" width="78" height="146" />
        <path d="M254 98 L301 24 L348 98 Z" fill={roof} />
        <rect x="299.5" y="6" width="3" height="20" fill={roof} />
        <circle cx="301" cy="128" r="20" fill={dawn ? "#FFE7BF" : "#E7DFC8"} opacity={dawn ? 0.95 : 0.5} />
        <path d="M301 128 L301 113 M301 128 L310 128" stroke="#20182A" strokeWidth="2.4" strokeLinecap="round" />
        {/* door */}
        <path d="M286 242 L286 206 Q301 188 316 206 L316 242 Z" fill={win} opacity={0.35 + lit * 0.5} />
      </g>
      {[w(176, 178, 18, 1), w(200, 178, 18, 2), w(224, 178, 18, 3), w(176, 210, 16, 4), w(224, 210, 16, 5), w(364, 182, 18, 6), w(390, 182, 18, 7), w(416, 182, 18, 8), w(390, 212, 16, 9), w(137, 140, 18, 10), w(137, 180, 18, 11), w(453, 150, 18, 12), w(453, 190, 18, 13), w(282, 166, 20, 14), w(311, 166, 20, 15)]}
      {/* dead trees */}
      <g stroke={dawn ? "#251829" : "#07060C"} strokeWidth="4" strokeLinecap="round" fill="none">
        <path d="M40 270 L46 200 M46 214 L24 186 M45 226 L72 196 M30 192 L22 178 M66 202 L80 188" />
        <path d="M556 272 L548 204 M549 220 L574 192 M548 232 L522 206 M570 196 L582 184" />
      </g>
    </svg>
  );
}

/** One leaf of the wrought-iron gate (mirror it for the other side). */
export function GateLeaf({ side }: { side: "left" | "right" }) {
  const flip = side === "right";
  return (
    <svg viewBox="0 0 160 300" width="100%" height="100%" aria-hidden style={{ display: "block", overflow: "visible", transform: flip ? "scaleX(-1)" : undefined }}>
      <g stroke="#1E1828" strokeWidth="6" fill="none" strokeLinecap="round">
        <path d="M6 300 L6 60 Q80 20 156 40 L156 300" />
        {[30, 54, 78, 102, 126].map((x) => (
          <path key={x} d={`M${x} 300 L${x} ${48 - (x - 6) * 0.05}`} />
        ))}
        <path d="M6 120 L156 120 M6 270 L156 270" strokeWidth="7" />
        {[30, 78, 126].map((x) => (
          <path key={`c${x}`} d={`M${x - 12} 150 q12 -18 24 0 q-12 18 -24 0`} strokeWidth="3.5" />
        ))}
      </g>
      <g fill="#2A2235">
        {[6, 30, 54, 78, 102, 126, 156].map((x) => (
          <path key={`s${x}`} d={`M${x - 5} ${x === 6 ? 62 : 48 - (x - 6) * 0.05 + 2} l5 -14 l5 14 z`} />
        ))}
      </g>
    </svg>
  );
}

/** A tall candle; `lit` shows the flame and its halo. */
export function Candle({ lit, h = 92, delay = 0 }: { lit: boolean; h?: number; delay?: number }) {
  return (
    <svg viewBox={`0 0 40 ${h + 50}`} width="40" height={h + 50} aria-hidden style={{ overflow: "visible", display: "block" }}>
      <defs>
        <linearGradient id="mmWaxCandle" x1="0" x2="1">
          <stop offset="0" stopColor="#E8DCC4" />
          <stop offset=".55" stopColor="#FFF7E6" />
          <stop offset="1" stopColor="#CDBFA4" />
        </linearGradient>
        <radialGradient id="mmHalo" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor={MM.candle} stopOpacity=".45" />
          <stop offset=".5" stopColor={MM.ember} stopOpacity=".12" />
          <stop offset="1" stopColor={MM.ember} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="mmFlame" cx=".5" cy=".7" r=".6">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset=".35" stopColor={MM.flame} />
          <stop offset=".75" stopColor={MM.candle} />
          <stop offset="1" stopColor={MM.ember} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="9" y="44" width="22" height={h} rx="4" fill="url(#mmWaxCandle)" />
      <path d={`M9 52 q4 8 0 18 M31 58 q-4 10 0 16`} stroke="#E0D2B6" strokeWidth="3" fill="none" />
      <path d="M20 44 L20 34" stroke="#3A2A1E" strokeWidth="2" strokeLinecap="round" />
      <g className={`mm-flame${lit ? " is-lit" : ""}`} style={{ transformOrigin: "20px 34px", animationDelay: `${delay}ms` }}>
        <circle cx="20" cy="22" r="30" fill="url(#mmHalo)" />
        <path d="M20 4 C27 16 28 24 20 34 C12 24 13 16 20 4 Z" fill="url(#mmFlame)" />
        <path d="M20 16 C23 22 23 27 20 31 C17 27 17 22 20 16 Z" fill="#FFFFFF" opacity=".85" />
      </g>
    </svg>
  );
}

/** The spirit-board planchette: a little ghost with a lens window. */
export function GhostPlanchette({ smile = true }: { smile?: boolean }) {
  return (
    <svg viewBox="0 0 80 88" width="100%" height="100%" aria-hidden style={{ overflow: "visible", display: "block" }}>
      <path d="M40 4 C62 4 72 22 72 44 L72 76 Q66 70 60 76 Q54 82 48 76 Q42 70 36 76 Q30 82 24 76 Q18 70 12 76 L8 78 L8 44 C8 22 18 4 40 4 Z" fill="#F7F3FF" stroke="#CFC6E8" strokeWidth="2" />
      <circle cx="40" cy="40" r="13" fill="rgba(127,245,216,.18)" stroke="#9A6A1F" strokeWidth="3" />
      <circle cx="29" cy="24" r="3.6" fill="#2B1E3F" />
      <circle cx="51" cy="24" r="3.6" fill="#2B1E3F" />
      {smile ? <path d="M34 31 q6 5 12 0" stroke="#2B1E3F" strokeWidth="2.4" fill="none" strokeLinecap="round" /> : <ellipse cx="40" cy="32" rx="3" ry="3.6" fill="#2B1E3F" />}
      <circle cx="22" cy="30" r="3.2" fill="#FFB3C6" opacity=".7" />
      <circle cx="58" cy="30" r="3.2" fill="#FFB3C6" opacity=".7" />
    </svg>
  );
}

/** A small bat (used by the gate's flock and the tower burst). */
export function Bat({ size = 34, color = "#0E0B16" }: { size?: number; color?: string }) {
  return (
    <svg viewBox="0 0 64 30" width={size} height={(size * 30) / 64} aria-hidden style={{ display: "block", overflow: "visible" }}>
      <path className="mm-batWing" d="M32 12 C26 2 14 0 2 6 C10 8 12 14 10 18 C16 14 22 16 26 22 C28 18 30 16 32 16 C34 16 36 18 38 22 C42 16 48 14 54 18 C52 14 54 8 62 6 C50 0 38 2 32 12 Z" fill={color} />
      <circle cx="29.5" cy="12" r="1.2" fill="#FFC86B" />
      <circle cx="34.5" cy="12" r="1.2" fill="#FFC86B" />
    </svg>
  );
}

/** The valve radio: cabinet, speaker grille, the tuning window + needle, the magic-eye tube. */
export function RadioCabinet({ needle, eye }: { needle: number; eye: number }) {
  const nx = 62 + needle * 196;
  return (
    <svg viewBox="0 0 320 250" width="100%" height="100%" aria-hidden style={{ display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id="mmWood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6B3A22" />
          <stop offset=".5" stopColor="#4B2615" />
          <stop offset="1" stopColor="#2E170C" />
        </linearGradient>
        <radialGradient id="mmEye" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#E9FFF6" />
          <stop offset=".5" stopColor={MM.mint} />
          <stop offset="1" stopColor="#0E3A30" />
        </radialGradient>
        <pattern id="mmGrille" width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill="#1E140E" />
          <circle cx="4" cy="4" r="2.2" fill="#3A2A1E" />
        </pattern>
      </defs>
      <path d="M20 240 L20 70 Q20 12 160 12 Q300 12 300 70 L300 240 Z" fill="url(#mmWood)" stroke="#2A140A" strokeWidth="3" />
      <path d="M40 228 L40 78 Q40 32 160 32 Q280 32 280 78 L280 228 Z" fill="none" stroke="#C99A5B" strokeWidth="1.5" opacity=".5" />
      <path d="M62 140 L62 86 Q62 52 160 52 Q258 52 258 86 L258 140 Z" fill="url(#mmGrille)" stroke="#C99A5B" strokeWidth="2" />
      <g className="mm-grilleStatic" />
      {/* tuning window */}
      <rect x="54" y="152" width="212" height="34" rx="6" fill="#F3E2B8" stroke="#C99A5B" strokeWidth="2" />
      {Array.from({ length: 21 }, (_, i) => (
        <line key={i} x1={62 + i * 9.8} x2={62 + i * 9.8} y1={i % 5 ? 172 : 166} y2={182} stroke="#6B4A2A" strokeWidth={i % 5 ? 1 : 1.6} />
      ))}
      <rect x={nx - 1.5} y="154" width="3" height="30" fill="#B42A2A" />
      {/* magic eye */}
      <circle cx="160" cy="214" r="13" fill="#0C1A16" stroke="#C99A5B" strokeWidth="2" />
      <circle cx="160" cy="214" r={4 + eye * 8} fill="url(#mmEye)" opacity={0.25 + eye * 0.75} />
    </svg>
  );
}

/** The cauldron (the brew colour is a CSS var on the parent: --mm-brew). */
export function Cauldron() {
  return (
    <svg viewBox="0 0 240 190" width="100%" height="100%" aria-hidden style={{ display: "block", overflow: "visible" }}>
      <defs>
        <radialGradient id="mmPot" cx=".4" cy=".35" r=".8">
          <stop offset="0" stopColor="#3B3448" />
          <stop offset=".6" stopColor="#17131F" />
          <stop offset="1" stopColor="#09070D" />
        </radialGradient>
      </defs>
      <ellipse cx="120" cy="56" rx="96" ry="20" fill="var(--mm-brew, #7FF5D8)" className="mm-brew" />
      <path d="M22 60 Q20 160 120 170 Q220 160 218 60 Q170 80 120 78 Q70 80 22 60 Z" fill="url(#mmPot)" />
      <ellipse cx="120" cy="58" rx="100" ry="22" fill="none" stroke="#2C2638" strokeWidth="9" />
      <path d="M60 166 L48 186 M180 166 L192 186" stroke="#120F18" strokeWidth="10" strokeLinecap="round" />
      <ellipse cx="80" cy="104" rx="16" ry="34" fill="#FFFFFF" opacity=".05" transform="rotate(18 80 104)" />
    </svg>
  );
}
