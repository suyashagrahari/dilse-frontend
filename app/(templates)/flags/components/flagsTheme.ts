// ─── Flags — visual tokens ───────────────────────────────────────────────────
//
// Dating-app structure, Gen-Z execution: big rounded cards, chunky grotesk,
// an italic serif for the soft moments, sticker-style flags. Every colour is a
// theme custom property (see ./themes.ts and _love/theme.ts), so switching the
// vibe recolours the whole deck in one style write.
//
// Nothing here reproduces the wordmark, colour identity or icon set of any real
// dating product. The swipe deck is a genre; the look is our own.

import { GROTESK, ITALIC } from "../../_love/LoveKit";

export { GROTESK, ITALIC };

/** Numbers + tiny labels. */
export const MONO = "ui-monospace, 'SF Mono', Menlo, monospace";

/** Card geometry. Scaled, never reflowed. */
export const CARD_W = "min(360px, calc(100vw - 40px))";
export const CARD_H = "min(470px, calc(100dvh - 290px))";

/** How much further the card travels on commit, before the hold. */
export const FLY_OUT_PUSH = 90;
/** The flipped card slides off before the stack advances. */
export const EXIT_MS = 220;
/** Behind cards move up one position over this. */
export const STACK_MS = 240;

export const clamp = (n: number, lo: number, hi: number): number =>
  n < lo ? lo : n > hi ? hi : n;

/**
 * Hinge-style prompt titles. Each memory photo's note answers one of these,
 * picked by position, so a profile of five photos reads as five prompts.
 */
export const PROMPTS = [
  "the moment I knew…",
  "green flag I found in you",
  "our most chaotic date",
  "a memory I replay at 2am",
  "we're the kind of couple who…",
  "the most 'us' thing ever",
  "I'd go back to this day for…",
  "unpopular opinion",
  "my toxic trait is… missing this",
  "this is where it got serious",
] as const;

export type PhotoFlag = "green" | "beige" | "red";

/** Every photo wears a flag sticker; the rhythm is mostly green, on purpose. */
const PHOTO_FLAG_RHYTHM: PhotoFlag[] = ["green", "beige", "green", "red", "green", "beige", "green", "green", "red", "green"];

export const photoFlag = (i: number): PhotoFlag => PHOTO_FLAG_RHYTHM[i % PHOTO_FLAG_RHYTHM.length];

export const PHOTO_FLAG_LABEL: Record<PhotoFlag, string> = {
  green: "green flag 💚",
  beige: "beige flag 🫠",
  red: "red flag (cute) 🚩",
};

export const PHOTO_FLAG_VAR: Record<PhotoFlag, string> = {
  green: "var(--fl-green)",
  beige: "var(--fl-beige)",
  red: "var(--fl-red)",
};
