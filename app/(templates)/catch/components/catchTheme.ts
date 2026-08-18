// ─── Catch — shared visual language ──────────────────────────────────────────
//
// The background WARMS as lines are revealed: cool grey-blue at zero, warm
// amber at complete. Interpolated continuously, so it is a single scalar
// (`warmth`, 0..1) feeding both the DOM wrapper and the canvas gradient.
//
// Kept out of the rAF loop: `mix()` allocates a string, so callers must cache
// the result and only recompute when the warmth bucket actually changes.

export type RGB = readonly [number, number, number];

/** Cool grey-blue — zero lines revealed. */
export const COOL_TOP: RGB = [228, 235, 243];
export const COOL_BOT: RGB = [199, 210, 224];

/** Warm amber — the whole letter in their hands. */
export const WARM_TOP: RGB = [255, 246, 229];
export const WARM_BOT: RGB = [246, 211, 152];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function mix(a: RGB, b: RGB, t: number): string {
  const k = t < 0 ? 0 : t > 1 ? 1 : t;
  return `rgb(${Math.round(lerp(a[0], b[0], k))},${Math.round(lerp(a[1], b[1], k))},${Math.round(
    lerp(a[2], b[2], k),
  )})`;
}

export const warmTop = (t: number) => mix(COOL_TOP, WARM_TOP, t);
export const warmBot = (t: number) => mix(COOL_BOT, WARM_BOT, t);

/** Ink, paper and accent. Warm, soft, hand-made — never arcade, never neon. */
export const INK = "#2c2a26";
export const INK_SOFT = "#6b6559";
export const PAPER = "#fffdf7";
export const PAPER_EDGE = "#e6dfd0";
export const ACCENT = "#c2833a";
export const FLAG = "#c4553f";

/** Deterministic warm fill for the initial-circle fallback (no photo). */
const FACE_FILLS = ["#d9a05b", "#c98b6b", "#b0895f", "#c79a4f", "#a98a6a", "#cf9a76"] as const;
export function faceFill(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return FACE_FILLS[h % FACE_FILLS.length];
}

export function initialOf(name: string): string {
  const t = (name || "").trim();
  return t ? t[0].toUpperCase() : "♥";
}
