"use client";

// The Proposal artwork, all drawn here (original, no licensed character):
//
//   • WaxSeal — a blobby wax seal with the couple's initials; `crack` (0–1)
//     draws the fracture lines in as she presses.
//   • Bulb — one string-light bulb, lit or not.
//   • Horse — a carousel horse on its brass pole, in the page's palette.
//   • HeartLock / LoveKey — the love-lock and its key.
//   • RingBox — a round pastel ring box (the base and the lid are separate so
//     the lid can hinge on a drag) and Ring — a gold band with a big sparkler.
//   • Hand — a hand with its ring finger up, for the ring to slide onto.
//   • Sparkle — a four-point twinkle.
//
// Colours come from the palette's CSS variables, so every look re-skins them.

import type { CSSProperties } from "react";

const INK = "var(--pp-deep, #8E2F4B)";

export function WaxSeal({ a, b, crack = 0, size = "100%" }: { a: string; b: string; crack?: number; size?: number | string }) {
  const c = Math.max(0, Math.min(1, crack));
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ overflow: "visible" }} aria-hidden>
      <defs>
        <radialGradient id="ppWax" cx="38%" cy="32%" r="75%">
          <stop offset="0" stopColor="color-mix(in srgb, var(--vw-accent, #D45E78) 55%, #FFFFFF)" />
          <stop offset=".55" stopColor="var(--vw-accent, #D45E78)" />
          <stop offset="1" stopColor="var(--vw-accent-deep, #A63D58)" />
        </radialGradient>
      </defs>
      <path
        d="M50 3 C60 4 64 9 72 9 C82 10 84 18 90 24 C96 31 93 39 96 47 C99 57 92 62 91 70 C89 80 81 82 75 89 C68 96 60 93 51 97 C41 100 36 93 28 91 C18 88 16 81 10 75 C4 68 7 60 4 51 C1 42 8 37 9 28 C11 18 20 16 26 10 C33 4 41 2 50 3 Z"
        fill="url(#ppWax)"
      />
      <circle cx="50" cy="50" r="31" fill="none" stroke="rgba(255,255,255,.45)" strokeWidth="2.2" />
      <circle cx="50" cy="50" r="27" fill="color-mix(in srgb, var(--vw-accent-deep, #A63D58) 30%, transparent)" />
      <text x="50" y="57" textAnchor="middle" fontSize="21" fontWeight="700" fill="rgba(255,255,255,.92)" style={{ fontFamily: "var(--font-pp-script), 'Dancing Script', cursive" }}>
        {a}&amp;{b}
      </text>
      <path d="M50 30 c-2-3-7-3-7 1 c0 3 7 7 7 7 c0 0 7-4 7-7 c0-4-5-4-7-1z" fill="rgba(255,255,255,.75)" />
      <ellipse cx="34" cy="22" rx="10" ry="4" fill="rgba(255,255,255,.35)" transform="rotate(-28 34 22)" />
      {c > 0 && (
        <g fill="none" stroke="rgba(255,255,255,.9)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" pathLength={1} style={{ strokeDasharray: 1, strokeDashoffset: 1 - c }}>
          <path d="M50 2 L46 20 L54 34 L47 50 L55 66 L48 82 L51 98" pathLength={1} style={{ strokeDasharray: 1, strokeDashoffset: 1 - c }} />
          <path d="M47 50 L30 44 L18 50" pathLength={1} style={{ strokeDasharray: 1, strokeDashoffset: 1 - Math.max(0, c * 1.4 - 0.4) }} />
          <path d="M55 66 L72 70 L84 64" pathLength={1} style={{ strokeDasharray: 1, strokeDashoffset: 1 - Math.max(0, c * 1.6 - 0.6) }} />
        </g>
      )}
    </svg>
  );
}

export function Bulb({ lit, size = 30 }: { lit: boolean; size?: number | string }) {
  return (
    <svg viewBox="0 0 30 46" width={size} style={{ overflow: "visible" }} aria-hidden>
      {lit && <circle cx="15" cy="28" r="20" fill="var(--pp-sun, #FFD3A6)" opacity=".55" className="pp-bulb-halo" />}
      <rect x="9" y="0" width="12" height="10" rx="2" fill="var(--vw-gold, #E3A891)" stroke={INK} strokeWidth="1.4" />
      <path d="M9 10 C3 18 3 32 15 44 C27 32 27 18 21 10 Z" fill={lit ? "#FFF6D8" : "rgba(255,255,255,.7)"} stroke={lit ? "var(--vw-gold, #E3A891)" : "var(--vw-edge, #F1C6BB)"} strokeWidth="1.6" />
      {lit && <path d="M9 10 C3 18 3 32 15 44 C27 32 27 18 21 10 Z" fill="var(--pp-sun, #FFD3A6)" opacity=".75" />}
      <path d="M11 22 C10 26 11 30 13 33" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none" opacity=".85" />
      <path d="M12 16 l3 6 l3 -6" stroke={lit ? "var(--vw-accent-deep, #A63D58)" : "var(--vw-edge, #F1C6BB)"} strokeWidth="1.2" fill="none" />
    </svg>
  );
}

export function Horse({ color, mane, size = "100%", flip = false }: { color: string; mane: string; size?: number | string; flip?: boolean }) {
  return (
    <svg viewBox="0 0 100 130" width={size} style={{ overflow: "visible", transform: flip ? "scaleX(-1)" : undefined }} aria-hidden>
      <rect x="47" y="0" width="6" height="130" rx="3" fill="var(--vw-gold, #E3A891)" stroke={INK} strokeWidth="1.2" />
      <path d="M47 18 h6 M47 30 h6 M47 100 h6 M47 112 h6" stroke="#FFFFFF" strokeWidth="1.5" opacity=".7" />
      {/* tail */}
      <path d="M22 58 C10 60 6 74 12 86 C16 76 20 70 26 66 Z" fill={mane} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      {/* back legs */}
      <path d="M30 74 L22 92 L30 100" fill="none" stroke={INK} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M30 74 L22 92 L30 100" fill="none" stroke={color} strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* body */}
      <ellipse cx="46" cy="66" rx="26" ry="15" fill={color} stroke={INK} strokeWidth="2.2" />
      {/* front legs */}
      <path d="M62 74 L74 86 L68 98" fill="none" stroke={INK} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M62 74 L74 86 L68 98" fill="none" stroke={color} strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* neck + head */}
      <path d="M60 58 C64 46 66 38 70 30 C76 24 88 26 90 34 C92 40 86 42 80 42 C76 46 74 56 70 66 Z" fill={color} stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M70 26 L72 18 L76 26" fill={color} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <circle cx="80" cy="33" r="2.2" fill={INK} />
      <ellipse cx="86" cy="38" rx="3" ry="1.8" fill="var(--pp-blush, #FBDDD6)" />
      {/* mane */}
      <path d="M70 28 C62 32 64 40 58 44 C62 46 66 44 66 50 C60 52 60 56 62 60 C66 54 70 46 72 34 Z" fill={mane} stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
      {/* saddle + bridle */}
      <path d="M36 52 C42 48 54 48 58 52 L56 62 C50 64 42 64 38 62 Z" fill="var(--vw-gold, #E3A891)" stroke={INK} strokeWidth="1.8" />
      <path d="M38 56 C44 59 52 59 57 56" stroke="#FFFFFF" strokeWidth="1.6" fill="none" opacity=".8" />
      <path d="M77 30 L88 40" stroke={mane} strokeWidth="2" />
      <circle cx="47" cy="45" r="3" fill="var(--vw-accent, #D45E78)" stroke={INK} strokeWidth="1.2" />
    </svg>
  );
}

export function HeartLock({ open, size = "100%" }: { open: boolean; size?: number | string }) {
  return (
    <svg viewBox="0 0 100 124" width={size} style={{ overflow: "visible" }} aria-hidden>
      <defs>
        <linearGradient id="ppLock" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="color-mix(in srgb, var(--vw-gold, #E3A891) 45%, #FFFFFF)" />
          <stop offset=".6" stopColor="var(--vw-gold, #E3A891)" />
          <stop offset="1" stopColor="color-mix(in srgb, var(--vw-gold, #E3A891) 70%, var(--pp-deep, #8E2F4B))" />
        </linearGradient>
      </defs>
      <g className="pp-shackle" style={{ transform: open ? "translateY(-12px) rotate(-18deg)" : "none", transformOrigin: "30px 46px", transition: "transform .5s cubic-bezier(.3,1.6,.5,1)" }}>
        <path d="M28 52 V30 C28 10 72 10 72 30 V52" fill="none" stroke="#B9B2C4" strokeWidth="9" strokeLinecap="round" />
        <path d="M28 52 V30 C28 10 72 10 72 30 V52" fill="none" stroke="#E9E6F0" strokeWidth="4" strokeLinecap="round" />
      </g>
      <path d="M50 120 C20 100 6 84 8 64 C10 46 32 40 50 56 C68 40 90 46 92 64 C94 84 80 100 50 120 Z" fill="url(#ppLock)" stroke={INK} strokeWidth="2.5" />
      <path d="M22 62 C24 54 32 52 38 56" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".75" />
      <circle cx="50" cy="80" r="7" fill={INK} />
      <path d="M47 84 L45 98 L55 98 L53 84 Z" fill={INK} />
    </svg>
  );
}

export function LoveKey({ size = "100%" }: { size?: number | string }) {
  return (
    <svg viewBox="0 0 130 50" width={size} style={{ overflow: "visible" }} aria-hidden>
      <path d="M26 44 C10 34 2 26 3 16 C4 6 18 3 26 13 C34 3 48 6 49 16 C50 26 42 34 26 44 Z" fill="var(--vw-gold, #E3A891)" stroke={INK} strokeWidth="2.4" />
      <path d="M26 33 C19 28 15 24 16 19 C17 14 23 13 26 18 C29 13 35 14 36 19 C37 24 33 28 26 33 Z" fill="var(--vw-paper, #FFF)" stroke={INK} strokeWidth="1.6" />
      <rect x="46" y="20" width="76" height="9" rx="4.5" fill="var(--vw-gold, #E3A891)" stroke={INK} strokeWidth="2.2" />
      <path d="M100 29 v10 h7 v-6 h5 v8 h7 V29" fill="var(--vw-gold, #E3A891)" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M50 22.5 h60" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity=".7" />
    </svg>
  );
}

/** The ring: a gold band seen at a slight angle with a big brilliant-cut stone. */
export function Ring({ size = "100%", style }: { size?: number | string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 100 100" width={size} style={{ overflow: "visible", ...style }} aria-hidden>
      <defs>
        <linearGradient id="ppBand" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFF1C4" />
          <stop offset=".45" stopColor="#E9B95A" />
          <stop offset="1" stopColor="#B9852E" />
        </linearGradient>
        <linearGradient id="ppGem" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset=".5" stopColor="#E3F4FF" />
          <stop offset="1" stopColor="#B9DDF6" />
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="66" rx="29" ry="25" fill="none" stroke="url(#ppBand)" strokeWidth="8" />
      <ellipse cx="50" cy="66" rx="29" ry="25" fill="none" stroke="#FFFFFF" strokeWidth="1.5" opacity=".55" strokeDasharray="30 160" />
      <path d="M42 42 L46 34 L54 34 L58 42 Z" fill="#E9B95A" stroke="#B9852E" strokeWidth="1.2" />
      <path d="M34 22 L42 12 L58 12 L66 22 L50 42 Z" fill="url(#ppGem)" stroke="#8DBCE0" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M34 22 H66 M42 12 L46 22 L50 42 L54 22 L58 12 M46 22 L50 12 L54 22" stroke="#8DBCE0" strokeWidth="1" fill="none" opacity=".9" />
      <path d="M40 18 L44 14" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** The ring box base (the cushion is drawn so the ring can sit in its slit). */
export function RingBoxBase({ size = "100%" }: { size?: number | string }) {
  return (
    <svg viewBox="0 0 160 110" width={size} style={{ overflow: "visible", display: "block" }} aria-hidden>
      <path d="M12 30 V86 C12 104 148 104 148 86 V30 Z" fill="var(--vw-accent, #D45E78)" stroke={INK} strokeWidth="2.5" />
      <path d="M12 46 C12 60 148 60 148 46" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="3" />
      <path d="M22 40 V82" stroke="rgba(255,255,255,.4)" strokeWidth="5" strokeLinecap="round" />
      <ellipse cx="80" cy="30" rx="68" ry="20" fill="var(--pp-deep, #8E2F4B)" stroke={INK} strokeWidth="2.5" />
      <ellipse cx="80" cy="31" rx="60" ry="15" fill="var(--pp-blush, #FBDDD6)" />
      <path d="M48 32 C60 26 100 26 112 32" stroke="color-mix(in srgb, var(--pp-deep, #8E2F4B) 55%, transparent)" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M70 100 h20" stroke="var(--vw-gold, #E3A891)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** The lid, drawn as seen from the front when closed; the scene hinges it on its bottom edge. */
export function RingBoxLid({ size = "100%" }: { size?: number | string }) {
  return (
    <svg viewBox="0 0 160 70" width={size} style={{ overflow: "visible", display: "block" }} aria-hidden>
      <path d="M12 56 V24 C12 2 148 2 148 24 V56 C148 70 12 70 12 56 Z" fill="var(--vw-accent, #D45E78)" stroke={INK} strokeWidth="2.5" />
      <ellipse cx="80" cy="22" rx="62" ry="15" fill="color-mix(in srgb, var(--vw-accent, #D45E78) 70%, #FFFFFF)" opacity=".7" />
      <path d="M30 16 C50 8 80 8 96 10" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" fill="none" opacity=".6" />
      <path d="M12 52 C12 64 148 64 148 52" fill="none" stroke="var(--vw-gold, #E3A891)" strokeWidth="3" />
      <path d="M80 14 c-3-5-11-5-11 1 c0 5 11 11 11 11 c0 0 11-6 11-11 c0-6-8-6-11-1z" fill="var(--vw-gold, #E3A891)" stroke={INK} strokeWidth="1.6" />
    </svg>
  );
}

export const HAND_FINGER = { x: 125, y: 122 } as const;

/** A hand with its ring finger up (viewBox 200×280); the ring lands at HAND_FINGER. */
export function Hand({ size = "100%", ring = false }: { size?: number | string; ring?: boolean }) {
  const skin = "#F7D7C4";
  const line = "#C98E78";
  return (
    <svg viewBox="0 0 200 280" width={size} style={{ overflow: "visible", display: "block" }} aria-hidden>
      {/* fingers */}
      <rect x="60" y="64" width="24" height="96" rx="12" fill={skin} stroke={line} strokeWidth="2.5" />
      <rect x="87" y="40" width="25" height="120" rx="12.5" fill={skin} stroke={line} strokeWidth="2.5" />
      <rect x="113" y="54" width="24" height="106" rx="12" fill={skin} stroke={line} strokeWidth="2.5" />
      <rect x="139" y="86" width="21" height="76" rx="10.5" fill={skin} stroke={line} strokeWidth="2.5" />
      {/* nails */}
      <rect x="65" y="68" width="14" height="16" rx="7" fill="var(--pp-blush, #FBDDD6)" stroke={line} strokeWidth="1.2" />
      <rect x="92" y="44" width="15" height="17" rx="7.5" fill="var(--pp-blush, #FBDDD6)" stroke={line} strokeWidth="1.2" />
      <rect x="118" y="58" width="14" height="16" rx="7" fill="var(--pp-blush, #FBDDD6)" stroke={line} strokeWidth="1.2" />
      <rect x="143" y="90" width="13" height="14" rx="6.5" fill="var(--pp-blush, #FBDDD6)" stroke={line} strokeWidth="1.2" />
      {/* back of the hand + thumb */}
      <path d="M58 140 C56 190 66 226 84 244 L150 244 C166 220 166 182 162 142 Z" fill={skin} stroke={line} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M62 170 C44 158 30 140 24 128 C20 118 32 110 40 118 C50 130 58 140 66 146" fill={skin} stroke={line} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M64 150 C70 156 76 160 84 160" stroke={line} strokeWidth="2" fill="none" opacity=".6" />
      {/* knuckle creases */}
      <path d="M66 112 h12 M93 98 h13 M119 104 h12 M144 124 h11" stroke={line} strokeWidth="1.6" strokeLinecap="round" opacity=".55" />
      {/* a frilly cuff with a little bow */}
      <path d="M70 280 L74 246 L160 246 L166 280 Z" fill="var(--pp-blush, #FBDDD6)" stroke={line} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M66 248 q7 -12 14 0 q7 -12 14 0 q7 -12 14 0 q7 -12 14 0 q7 -12 14 0 q7 -12 14 0 q7 -12 14 0 L164 256 L66 256 Z" fill="#FFFFFF" stroke={line} strokeWidth="2" strokeLinejoin="round" />
      <path d="M72 262 L162 262" stroke="var(--vw-accent, #D45E78)" strokeWidth="4" />
      <path d="M117 262 c-10 -8 -18 -2 -14 4 c3 5 14 -4 14 -4 c0 0 11 9 14 4 c4 -6 -4 -12 -14 -4 z" fill="var(--vw-accent, #D45E78)" stroke="var(--pp-deep, #8E2F4B)" strokeWidth="1.2" />
      {ring && (
        <g className="pp-hand-ring">
          <path d={`M${HAND_FINGER.x - 14} ${HAND_FINGER.y} C${HAND_FINGER.x - 14} ${HAND_FINGER.y + 8} ${HAND_FINGER.x + 14} ${HAND_FINGER.y + 8} ${HAND_FINGER.x + 14} ${HAND_FINGER.y}`} stroke="#E9B95A" strokeWidth="7" fill="none" strokeLinecap="round" />
          <path d={`M${HAND_FINGER.x - 12} ${HAND_FINGER.y + 2} C${HAND_FINGER.x - 6} ${HAND_FINGER.y + 6} ${HAND_FINGER.x + 6} ${HAND_FINGER.y + 6} ${HAND_FINGER.x + 12} ${HAND_FINGER.y + 2}`} stroke="#FFF1C4" strokeWidth="1.6" fill="none" />
          <path d={`M${HAND_FINGER.x - 11} ${HAND_FINGER.y - 4} L${HAND_FINGER.x - 6} ${HAND_FINGER.y - 13} L${HAND_FINGER.x + 6} ${HAND_FINGER.y - 13} L${HAND_FINGER.x + 11} ${HAND_FINGER.y - 4} L${HAND_FINGER.x} ${HAND_FINGER.y + 8} Z`} fill="#E3F4FF" stroke="#8DBCE0" strokeWidth="1.4" strokeLinejoin="round" />
          <path d={`M${HAND_FINGER.x - 11} ${HAND_FINGER.y - 4} H${HAND_FINGER.x + 11} M${HAND_FINGER.x - 4} ${HAND_FINGER.y - 4} L${HAND_FINGER.x} ${HAND_FINGER.y + 8} L${HAND_FINGER.x + 4} ${HAND_FINGER.y - 4}`} stroke="#8DBCE0" strokeWidth="1" fill="none" />
          <path d={`M${HAND_FINGER.x - 5} ${HAND_FINGER.y - 10} l3 -2`} stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}

export function Sparkle({ size = 24, color = "#FFE7A0", style }: { size?: number; color?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={style} aria-hidden>
      <path d="M12 0 C13 8 16 11 24 12 C16 13 13 16 12 24 C11 16 8 13 0 12 C8 11 11 8 12 0 Z" fill={color} />
    </svg>
  );
}
