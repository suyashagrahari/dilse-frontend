"use client";

// The "After the Rain" artwork, all drawn here (original — no licensed
// character). Paints come from the page palette (--vw-* / --sp-*), so every
// look re-colours the whole garden.
//
//   • PuddleBear — a round bear in yellow wellies under a pastel umbrella:
//     "sad" (drizzle on the umbrella), "hope" and "happy" (umbrella folded).
//   • Flower — wilted → bloomed by one number, with its pot.
//   • WateringCan — tilts by a prop; the rose drips while it pours.
//   • MendHeart — the cracked heart; a mended crack turns to a gold seam
//     (kintsugi: the repair is part of the story, not hidden).
//   • Plaster — the bandage sticker.
//   • FortuneCookie, PaperStar, StarJar, PaperBoat.

import type { CSSProperties } from "react";

const INK = "#5A3B33";
const FUR = "#FFF8EF";

export type BearMood = "sad" | "hope" | "happy";

export function PuddleBear({ mood = "sad", umbrella = true, size = 180, style, className }: { mood?: BearMood; umbrella?: boolean; size?: number | string; style?: CSSProperties; className?: string }) {
  return (
    <svg viewBox="0 0 200 250" width={size} height={size} className={`sp-bear sp-bear-${mood}${className ? ` ${className}` : ""}`} style={{ overflow: "visible", ...style }} aria-hidden>
      <defs>
        <radialGradient id="spFur" cx="42%" cy="34%" r="70%">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset=".75" stopColor={FUR} />
          <stop offset="1" stopColor="#F1E2D6" />
        </radialGradient>
        <linearGradient id="spUmb" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="color-mix(in srgb, var(--vw-accent, #E0567B) 55%, #FFFFFF)" />
          <stop offset="1" stopColor="var(--vw-accent, #E0567B)" />
        </linearGradient>
      </defs>
      {umbrella && (
        <g className="sp-bear-umb">
          <path d="M100 26 L100 132" stroke={INK} strokeWidth="4" strokeLinecap="round" />
          <path d="M14 92 C18 46 56 18 100 18 C144 18 182 46 186 92 C172 82 158 82 143 92 C130 82 114 82 100 92 C86 82 70 82 57 92 C42 82 28 82 14 92 Z" fill="url(#spUmb)" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
          <path d="M100 18 C80 40 72 66 72 88 M100 18 C120 40 128 66 128 88" stroke={INK} strokeWidth="2.5" fill="none" opacity=".5" />
          <path d="M40 54 C52 36 70 28 86 26" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" fill="none" opacity=".55" />
          <circle cx="100" cy="14" r="5" fill={INK} />
          {mood === "sad" && (
            <g className="sp-bear-drips" fill="#A9C7EA">
              <path d="M30 100 q-4 8 0 11 q4 -3 0 -11 Z" />
              <path d="M170 100 q-4 8 0 11 q4 -3 0 -11 Z" />
              <path d="M62 100 q-3 6 0 9 q3 -3 0 -9 Z" />
            </g>
          )}
        </g>
      )}
      <g className="sp-bear-body">
        {/* ears */}
        <circle cx="64" cy="128" r="15" fill="url(#spFur)" stroke={INK} strokeWidth="4" />
        <circle cx="136" cy="128" r="15" fill="url(#spFur)" stroke={INK} strokeWidth="4" />
        <circle cx="64" cy="128" r="7" fill="var(--sp-blush, #FFD8E2)" />
        <circle cx="136" cy="128" r="7" fill="var(--sp-blush, #FFD8E2)" />
        {/* body */}
        <ellipse cx="100" cy="212" rx="44" ry="30" fill="url(#spFur)" stroke={INK} strokeWidth="4" />
        {/* wellies */}
        <path d="M66 226 h22 v18 h-26 q-2 -8 4 -18 Z" fill="#FFD45E" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
        <path d="M112 226 h22 q6 10 4 18 h-26 Z" fill="#FFD45E" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
        {/* head */}
        <ellipse cx="100" cy="162" rx="50" ry="42" fill="url(#spFur)" stroke={INK} strokeWidth="4" />
        <ellipse cx="72" cy="176" rx="9" ry="6" fill="color-mix(in srgb, var(--vw-accent, #E0567B) 40%, #FFFFFF)" opacity=".8" />
        <ellipse cx="128" cy="176" rx="9" ry="6" fill="color-mix(in srgb, var(--vw-accent, #E0567B) 40%, #FFFFFF)" opacity=".8" />
        {mood === "sad" && (
          <g>
            <path d="M74 158 q8 6 16 0" stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M110 158 q8 6 16 0" stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />
            <path className="sp-tear" d="M86 166 q-4 8 0 11 q4 -3 0 -11 Z" fill="#A9C7EA" />
            <path d="M92 186 q8 -6 16 0" stroke={INK} strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <path d="M70 146 l12 -5 M130 146 l-12 -5" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          </g>
        )}
        {mood === "hope" && (
          <g>
            <circle cx="82" cy="160" r="6" fill={INK} />
            <circle cx="118" cy="160" r="6" fill={INK} />
            <circle cx="84" cy="158" r="2" fill="#FFF" />
            <circle cx="120" cy="158" r="2" fill="#FFF" />
            <path d="M94 182 q6 4 12 0" stroke={INK} strokeWidth="3.5" fill="none" strokeLinecap="round" />
          </g>
        )}
        {mood === "happy" && (
          <g>
            <path d="M74 162 q8 -9 16 0" stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M110 162 q8 -9 16 0" stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M90 178 q10 12 20 0 Z" fill="#E2687F" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
          </g>
        )}
        <ellipse cx="100" cy="172" rx="5" ry="3.6" fill={INK} />
        {/* paws, one on the umbrella handle */}
        <ellipse cx={umbrella ? 104 : 72} cy={umbrella ? 134 : 204} rx="10" ry="8" fill="url(#spFur)" stroke={INK} strokeWidth="3.5" />
        <ellipse cx="128" cy="204" rx="10" ry="8" fill="url(#spFur)" stroke={INK} strokeWidth="3.5" />
      </g>
    </svg>
  );
}

/** b: 0 wilted (grey, drooping) → 1 in full bloom. */
export function Flower({ b, size = "100%" }: { b: number; size?: number | string }) {
  const k = Math.max(0, Math.min(1, b));
  const ex = 80 + (1 - k) * 44;
  const ey = 72 + (1 - k) * 46;
  const petalScale = 0.42 + k * 0.58;
  const tilt = (1 - k) * 78;
  return (
    <svg viewBox="0 0 160 230" width={size} height={size} style={{ overflow: "visible" }} aria-hidden>
      {/* pot */}
      <path d="M44 178 h72 l-8 46 h-56 Z" fill="#F2B49A" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      <rect x="38" y="168" width="84" height="16" rx="6" fill="#F7C6AF" stroke={INK} strokeWidth="3.5" />
      <path d="M60 200 q20 8 40 0" stroke="#FFFFFF" strokeWidth="3" fill="none" opacity=".6" strokeLinecap="round" />
      {/* stem */}
      <path d={`M80 170 Q80 ${120 - (1 - k) * 10} ${ex} ${ey}`} stroke="#5FAE7B" strokeWidth="6" fill="none" strokeLinecap="round" />
      {/* leaves */}
      <path d={`M80 146 q${-24 + (1 - k) * 8} ${-10 + (1 - k) * 22} -30 ${4 + (1 - k) * 16} q20 6 30 -4 Z`} fill="#8FD3A6" stroke={INK} strokeWidth="2.5" />
      <path d={`M80 132 q${24 - (1 - k) * 8} ${-10 + (1 - k) * 22} 30 ${4 + (1 - k) * 16} q-20 6 -30 -4 Z`} fill="#8FD3A6" stroke={INK} strokeWidth="2.5" />
      {/* bloom */}
      <g transform={`translate(${ex} ${ey}) rotate(${tilt}) scale(${petalScale})`}>
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <g key={a} transform={`rotate(${a})`}>
            <ellipse cx="0" cy="-24" rx="15" ry="22" fill="#CFC6CC" stroke={INK} strokeWidth="2.5" opacity={1 - k} />
            <ellipse cx="0" cy="-24" rx="15" ry="22" fill="color-mix(in srgb, var(--vw-accent, #E0567B) 55%, #FFFFFF)" stroke={INK} strokeWidth="2.5" opacity={k} />
            <ellipse cx="-4" cy="-30" rx="4" ry="8" fill="#FFFFFF" opacity={k * 0.55} />
          </g>
        ))}
        <circle r="13" fill="#FFD45E" stroke={INK} strokeWidth="2.5" />
        {k > 0.9 ? (
          <g>
            <path d="M-6 -2 q2 -3 4 0 M2 -2 q2 -3 4 0" stroke={INK} strokeWidth="1.8" fill="none" strokeLinecap="round" />
            <path d="M-4 4 q4 4 8 0" stroke={INK} strokeWidth="1.8" fill="none" strokeLinecap="round" />
          </g>
        ) : (
          <g>
            <path d="M-6 -1 h4 M2 -1 h4" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
            <path d="M-3 6 q3 -3 6 0" stroke={INK} strokeWidth="1.8" fill="none" strokeLinecap="round" />
          </g>
        )}
      </g>
    </svg>
  );
}

export function WateringCan({ size = 120 }: { size?: number | string }) {
  return (
    <svg viewBox="0 0 150 104" width={size} height={size} style={{ overflow: "visible" }} aria-hidden>
      <path d="M118 46 L146 20" stroke={INK} strokeWidth="9" strokeLinecap="round" />
      <path d="M118 46 L146 20" stroke="color-mix(in srgb, var(--vw-gold, #F4A7BB) 70%, #FFFFFF)" strokeWidth="4.5" strokeLinecap="round" />
      <ellipse cx="146" cy="19" rx="7" ry="9" transform="rotate(-45 146 19)" fill="#FFFFFF" stroke={INK} strokeWidth="3" />
      <path d="M30 34 C24 10 72 6 70 34" stroke={INK} strokeWidth="5" fill="none" strokeLinecap="round" />
      <rect x="22" y="34" width="100" height="62" rx="18" fill="color-mix(in srgb, var(--vw-gold, #F4A7BB) 75%, #FFFFFF)" stroke={INK} strokeWidth="4" />
      <path d="M34 50 q20 -8 40 0" stroke="#FFFFFF" strokeWidth="5" fill="none" opacity=".6" strokeLinecap="round" />
      <path d="M58 70 c-6 -8 -16 -2 -10 6 l10 9 l10 -9 c6 -8 -4 -14 -10 -6 Z" fill="var(--vw-accent, #E0567B)" opacity=".85" />
    </svg>
  );
}

/** The crack paths, in the heart's 0 0 200 184 box. */
export const CRACKS: readonly string[] = [
  "M44 40 L56 60 L42 74 L58 94",
  "M150 40 L138 60 L154 74 L140 94",
  "M98 112 L88 128 L106 140 L96 158",
];

/** Where each crack's plaster sits, as % of the heart box. */
export const CRACK_SPOTS: readonly (readonly [number, number, number])[] = [
  [25, 37, -20],
  [74, 37, 20],
  [49, 74, -8],
];

export function MendHeart({ mended }: { mended: readonly boolean[] }) {
  return (
    <svg viewBox="0 0 200 184" width="100%" height="100%" style={{ overflow: "visible" }} aria-hidden>
      <defs>
        <radialGradient id="spHeartG" cx="38%" cy="30%" r="80%">
          <stop offset="0" stopColor="color-mix(in srgb, var(--vw-accent, #E0567B) 35%, #FFFFFF)" />
          <stop offset=".6" stopColor="color-mix(in srgb, var(--vw-accent, #E0567B) 80%, #FFFFFF)" />
          <stop offset="1" stopColor="var(--vw-accent-deep, #B5365A)" />
        </radialGradient>
      </defs>
      <path d="M100 178 C40 136 4 104 6 62 C8 22 54 4 100 42 C146 4 192 22 194 62 C196 104 160 136 100 178 Z" fill="url(#spHeartG)" stroke={INK} strokeWidth="4.5" strokeLinejoin="round" />
      <path d="M36 50 C44 30 66 24 80 32" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" fill="none" opacity=".5" />
      {CRACKS.map((d, k) => (
        <g key={k}>
          <path d={d} fill="none" stroke={mended[k] ? "#F3C24D" : INK} strokeWidth={mended[k] ? 5 : 4} strokeLinecap="round" strokeLinejoin="round" style={{ transition: "stroke .6s ease" }} />
          {mended[k] && <path d={d} fill="none" stroke="#FFF3C4" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />}
        </g>
      ))}
      {mended.every(Boolean) && (
        <g className="sp-heart-face">
          <path d="M78 96 q8 -8 16 0 M106 96 q8 -8 16 0" stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M92 112 q8 8 16 0" stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}

export function Plaster({ size = 74 }: { size?: number | string }) {
  return (
    <svg viewBox="0 0 100 40" width={size} style={{ overflow: "visible", display: "block", height: "auto" }} aria-hidden>
      <rect x="2" y="4" width="96" height="32" rx="16" fill="#FFE2C4" stroke={INK} strokeWidth="3" />
      <rect x="34" y="8" width="32" height="24" rx="6" fill="#FFF4E6" stroke={INK} strokeWidth="2" opacity=".9" />
      {[16, 24, 76, 84].map((x) => (
        <g key={x}>
          <circle cx={x} cy="15" r="1.8" fill="#D9A47F" />
          <circle cx={x} cy="25" r="1.8" fill="#D9A47F" />
        </g>
      ))}
      <path d="M44 20 c-3 -4 -9 -1 -6 3 l6 5 l6 -5 c3 -4 -3 -7 -6 -3 Z" fill="var(--vw-accent, #E0567B)" />
    </svg>
  );
}

/** One fortune cookie half (the other is drawn mirrored). */
export function CookieHalf({ flip = false }: { flip?: boolean }) {
  return (
    <svg viewBox="0 0 70 80" width="100%" height="100%" style={{ overflow: "visible", transform: flip ? "scaleX(-1)" : undefined }} aria-hidden>
      <path d="M66 8 C30 4 4 26 6 54 C8 72 30 78 50 70 C40 60 44 42 66 34 Z" fill="#F6C97A" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M58 16 C34 16 18 32 18 52" stroke="#FBE0A6" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M50 70 C40 60 44 42 66 34" stroke="#D99A45" strokeWidth="3" fill="none" />
    </svg>
  );
}

/** A whole fortune cookie (closed): the classic folded half-moon with its crease. */
export function FortuneCookie({ cracked = false }: { cracked?: boolean }) {
  return (
    <svg viewBox="0 4 130 86" width="100%" height="100%" style={{ overflow: "visible" }} aria-hidden>
      <path d="M8 66 C2 30 36 8 66 26 C96 8 128 30 122 66 C104 54 84 56 66 78 C48 56 28 54 8 66 Z" fill="#F6C97A" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M20 50 C24 30 44 22 60 32" stroke="#FBE3AE" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M66 28 C62 44 62 60 66 78" stroke="#D99A45" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M24 62 C40 56 56 62 66 78 C76 62 92 56 106 62 C94 68 78 72 66 80 C54 72 38 68 24 62 Z" fill="#E3A653" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M96 34 C104 38 110 46 112 54" stroke="#FFFFFF" strokeWidth="4" fill="none" strokeLinecap="round" opacity=".55" />
      {cracked && <path d="M66 26 L60 38 L70 46 L62 58" stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  );
}

export function PaperStar({ size = 40, color = "#FFE07A" }: { size?: number | string; color?: string }) {
  return (
    <svg viewBox="0 0 50 50" width={size} height={size} style={{ overflow: "visible", display: "block" }} aria-hidden>
      <path d="M25 3 L31 17 L46 18 L34.5 28 L38.5 43 L25 35 L11.5 43 L15.5 28 L4 18 L19 17 Z" fill={color} stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M25 3 L25 35 M4 18 L34.5 28 M46 18 L15.5 28" stroke={INK} strokeWidth="1" opacity=".25" />
    </svg>
  );
}

export function StarJar({ left, colors }: { left: number; colors: readonly string[] }) {
  const spots: readonly (readonly [number, number, number])[] = [
    [58, 168, -10], [86, 172, 18], [112, 166, -24], [70, 146, 30], [100, 144, -6], [124, 140, 12], [52, 130, 22], [84, 122, -18], [112, 118, 8],
  ];
  return (
    <svg viewBox="0 0 170 210" width="100%" height="100%" style={{ overflow: "visible" }} aria-hidden>
      <rect x="44" y="18" width="82" height="22" rx="8" fill="color-mix(in srgb, var(--vw-gold, #F4A7BB) 70%, #FFFFFF)" stroke={INK} strokeWidth="3.5" />
      <path d="M50 40 C26 52 24 80 26 120 C28 170 40 196 85 198 C130 196 142 170 144 120 C146 80 144 52 120 40 Z" fill="rgba(255,255,255,.45)" stroke={INK} strokeWidth="3.5" />
      {spots.slice(0, Math.max(0, Math.min(spots.length, left + 3))).map(([x, y, r], k) => (
        <g key={k} transform={`translate(${x} ${y}) rotate(${r}) scale(.5) translate(-25 -25)`}>
          <path d="M25 3 L31 17 L46 18 L34.5 28 L38.5 43 L25 35 L11.5 43 L15.5 28 L4 18 L19 17 Z" fill={colors[k % colors.length]} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        </g>
      ))}
      <path d="M38 70 C36 100 38 140 48 168" stroke="#FFFFFF" strokeWidth="7" fill="none" opacity=".6" strokeLinecap="round" />
      <path d="M44 40 q41 12 82 0" stroke="var(--vw-accent, #E0567B)" strokeWidth="5" fill="none" />
      <path d="M85 44 l-12 14 M85 44 l12 14" stroke="var(--vw-accent, #E0567B)" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export function PaperBoat({ size = 110 }: { size?: number | string }) {
  return (
    <svg viewBox="0 0 140 100" width={size} height={size} style={{ overflow: "visible", display: "block" }} aria-hidden>
      <path d="M8 58 L132 58 L110 88 L30 88 Z" fill="#FFFFFF" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M40 58 L70 6 L100 58 Z" fill="color-mix(in srgb, var(--sp-blush, #FFD8E2) 70%, #FFFFFF)" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M70 6 L70 58" stroke={INK} strokeWidth="2" opacity=".35" />
      <path d="M62 42 c-3 -4 -9 -1 -6 3 l6 5 l6 -5 c3 -4 -3 -7 -6 -3 Z" fill="var(--vw-accent, #E0567B)" />
      <path d="M30 88 L50 58 M110 88 L90 58" stroke={INK} strokeWidth="1.6" opacity=".3" />
    </svg>
  );
}

export const SP_ART_CSS = `
.sp-bear-drips path { animation: sp-drip 1.6s ease-in infinite; }
.sp-bear-drips path:nth-child(2) { animation-delay: .5s; } .sp-bear-drips path:nth-child(3) { animation-delay: 1s; }
@keyframes sp-drip { 0% { transform: translateY(0); opacity: 0 } 20% { opacity: 1 } 100% { transform: translateY(26px); opacity: 0 } }
.sp-tear { animation: sp-tear 2.2s ease-in infinite; }
@keyframes sp-tear { 0%, 30% { transform: translateY(0); opacity: 0 } 45% { opacity: 1 } 100% { transform: translateY(14px); opacity: 0 } }
.sp-bear-happy .sp-bear-body { animation: sp-hop 1s ease-in-out infinite; transform-origin: 100px 240px; }
@keyframes sp-hop { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-6px) } }
@media (prefers-reduced-motion: reduce) { .sp-bear-drips path, .sp-tear, .sp-bear-happy .sp-bear-body { animation: none; } }
`;
