// ─── LoveFlix design tokens ──────────────────────────────────────────────────
//
// ONE accent runs through the whole template. Buttons, progress bars, the match
// percentage, the choice countdown. Nothing else in the UI is allowed colour —
// everything else is a step on the near-black ramp below.
//
// BRAND SAFETY: the recognition in this layout comes from STRUCTURE (profile
// select, dark rails, oversized rank numerals, autoplay countdowns), never from
// anybody's colour or mark. The accent is deliberately a warm amber so it can
// never be mistaken for the streaming red it is not.

import { ACCENT, ACCENT_DIM, BG, BG_RAISED, TEXT, TEXT_DIM } from "./types";
import { hash32, seededInt } from "@/lib/seededRandom";

export { ACCENT, ACCENT_DIM, BG, BG_RAISED, TEXT, TEXT_DIM };

/** Two more steps on the ramp, for card bodies and hairlines. */
export const BG_CARD = "#1c1c1c";
export const HAIRLINE = "rgba(255,255,255,0.08)";

/**
 * Condensed display face for titles, the wordmark and the rank numerals.
 * Oswald is already registered on <html> as --font-oswald by the root layout —
 * no font is added by this template.
 */
export const FONT_DISPLAY = "var(--font-oswald), 'Arial Narrow', 'Helvetica Neue', sans-serif";

/** Clean sans for body copy and narration. */
export const FONT_BODY = "var(--font-inter), system-ui, -apple-system, sans-serif";

/** Cards: 4px radius, no borders. */
export const CARD_RADIUS = 4;

/** Accent fill used on primary buttons and the committed choice. */
export const ACCENT_GRAD = `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DIM})`;

/** Layering, so nothing has to guess. */
export const Z = {
  rail: 1,
  hero: 2,
  chrome: 40,
  sheet: 60,
  player: 80,
  interrupt: 90,
  brand: 110,
  devPanel: 200,
} as const;

/** Minimum tap target mandated for every interactive element here. */
export const TAP = 44;

// ─── Placeholder art ─────────────────────────────────────────────────────────
//
// The demo ships with every image URL empty, so the placeholder IS the default
// experience for anybody browsing the gallery. It has to look composed, not
// like a hole where an image failed. Palettes are muted, desaturated and always
// warm-adjacent so a rail of them reads as one designed catalogue rather than a
// bag of random gradients.

/** Hand-picked duotone stops. Deliberately narrow in hue so rails feel curated. */
const PLACEHOLDER_STOPS: readonly [string, string][] = [
  ["#3a2a20", "#171313"],
  ["#2b2a3a", "#141418"],
  ["#203029", "#121614"],
  ["#3a2430", "#171216"],
  ["#2a3038", "#131518"],
  ["#382f22", "#171512"],
  ["#26303a", "#121517"],
  ["#332433", "#161217"],
];

export interface PlaceholderLook {
  /** The full CSS background stack: duotone + vignette + a soft accent bloom. */
  background: string;
  /** Rotation of the diagonal rule overlay, in degrees. */
  angle: number;
  /** Position of the accent bloom, as CSS percentages. */
  bloom: { x: number; y: number };
}

/**
 * Deterministic from the seed — never `Math.random()`, or the same card would
 * look different on every re-render and the exported PNG would not match the
 * screen.
 */
export function placeholderLook(seed: string): PlaceholderLook {
  const i = hash32(seed) % PLACEHOLDER_STOPS.length;
  const [a, b] = PLACEHOLDER_STOPS[i];
  const angle = seededInt(seed, "angle", -18, 18);
  const bloom = {
    x: seededInt(seed, "bx", 18, 82),
    y: seededInt(seed, "by", 14, 62),
  };
  return {
    background: [
      `radial-gradient(120% 90% at ${bloom.x}% ${bloom.y}%, rgba(232,145,58,0.16) 0%, rgba(232,145,58,0) 62%)`,
      `linear-gradient(${140 + angle}deg, ${a} 0%, ${b} 100%)`,
    ].join(","),
    angle,
    bloom,
  };
}

/** Repeating hairline rule overlay — gives the flat gradient a printed texture. */
export const PLACEHOLDER_RULES =
  "repeating-linear-gradient(115deg, rgba(255,255,255,0.030) 0px, rgba(255,255,255,0.030) 1px, rgba(255,255,255,0) 1px, rgba(255,255,255,0) 9px)";

/** Bottom-up scrim used over hero art and card captions. */
export const scrim = (to = "rgba(13,13,13,0.96)") =>
  `linear-gradient(to top, ${to} 0%, rgba(13,13,13,0.72) 34%, rgba(13,13,13,0.12) 68%, rgba(13,13,13,0) 100%)`;

/** Left-side scrim, so hero copy stays legible over a bright still. */
export const scrimLeft =
  "linear-gradient(to right, rgba(13,13,13,0.92) 0%, rgba(13,13,13,0.55) 42%, rgba(13,13,13,0) 78%)";

/** Edge fade applied to every rail so content bleeds off rather than stopping. */
export const railMask =
  "linear-gradient(to right, transparent 0px, #000 22px, #000 calc(100% - 28px), transparent 100%)";

/** First grapheme of a name, upper-cased. Falls back rather than rendering "". */
export const initialOf = (name: string, fallback = "•"): string => {
  const t = (name || "").trim();
  if (!t) return fallback;
  return Array.from(t)[0].toUpperCase();
};

/** Hides the scrollbar on a scroll container in every engine we support. */
export const HIDE_SCROLLBAR_CLASS = "loveflix-no-bar";
