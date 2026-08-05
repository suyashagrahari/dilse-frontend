// ─── Proposal — design tokens ────────────────────────────────────────────────
// Kawaii pastel: creamy whites, soft pinks, lavender accents. Nothing neon,
// nothing high-contrast, heavy rounding everywhere. Kept as plain constants (no
// "use client") so both server and client modules can import them.

import type { CSSProperties } from "react";

export const CREAM = "#fffaf6";
export const BLUSH = "#ffe7ef";
export const BLUSH_DEEP = "#ffd3e2";
export const PINK = "#ff92b4";
export const PINK_DEEP = "#ef537d";
export const LAVENDER = "#c8b6ff";
export const LILAC = "#f2ebff";
export const INK = "#4b2e3d";
export const INK_SOFT = "#8d6b7b";

export const DISPLAY = "var(--font-fredoka), 'Fredoka', system-ui, sans-serif";
export const BODY = "var(--font-inter), 'Inter', system-ui, sans-serif";
/** Handwritten accent — polaroid captions and the letter's signature. */
export const SCRIPT = "var(--font-dancing), 'Dancing Script', 'Segoe Script', cursive";

/** The page wash. Three soft light sources over cream so it never reads flat. */
export const PAGE_BG = [
  `radial-gradient(90% 60% at 12% 4%, ${BLUSH} 0%, rgba(255,231,239,0) 62%)`,
  `radial-gradient(80% 55% at 92% 12%, ${LILAC} 0%, rgba(242,235,255,0) 60%)`,
  `radial-gradient(120% 80% at 50% 108%, #ffeef4 0%, rgba(255,238,244,0) 70%)`,
  `linear-gradient(175deg, ${CREAM} 0%, #fff5f8 46%, #f9f2ff 100%)`,
].join(", ");

/** Translucent card so the drifting hearts behind it stay visible. */
export const GLASS: CSSProperties = {
  background: "rgba(255,255,255,.6)",
  backdropFilter: "blur(18px) saturate(150%)",
  WebkitBackdropFilter: "blur(18px) saturate(150%)",
  border: "1px solid rgba(255,255,255,.8)",
  borderRadius: 32,
  boxShadow:
    "0 26px 60px -30px rgba(190,90,130,.5), 0 2px 0 rgba(255,255,255,.6) inset, 0 -1px 0 rgba(255,214,228,.5) inset",
};

/** The one loud element on the page: the YES button. */
export const PINK_GRADIENT = `linear-gradient(140deg, #ffa7c4 0%, ${PINK} 38%, ${PINK_DEEP} 100%)`;

export const PINK_GLOW = "0 18px 44px -14px rgba(239,83,125,.62), 0 5px 0 #d94670";

/** Rounded pastel pill used for chips, nudges and counters. */
export function chip(bg = "rgba(255,255,255,.72)", fg = INK_SOFT): CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 13px",
    borderRadius: 999,
    background: bg,
    color: fg,
    border: "1px solid rgba(255,214,228,.9)",
    fontFamily: DISPLAY,
    fontSize: 12,
    fontWeight: 600,
    lineHeight: 1.2,
    letterSpacing: ".01em",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
  };
}
