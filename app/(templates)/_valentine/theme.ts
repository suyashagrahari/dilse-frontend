// ─── Valentine's week — theme tokens ─────────────────────────────────────────
//
// Each day owns a world (00-brief.md "Visual language"). A DayTheme is a flat
// set of colour tokens; `themeVars()` mounts them as CSS custom properties on
// a root element so every engine/kit component — and every day Experience —
// paints with `var(--vw-*)` (or the `VW` refs below) and re-skins for free.
//
// Fonts are the three the brief allows: Fredoka from app/layout, and the serif
// + script from ./fonts.ts (display:"swap", mounted by DayRoot/EditSheet via
// VW_FONT_VARS). Wrap custom roots in DayRoot so the variables exist.

import type { CSSProperties } from "react";

export interface DayTheme {
  /** Page background — any CSS background (gradients welcome). */
  bg: string;
  /** Solid colour behind the page while it loads / under the bg. */
  base: string;
  /** Letter paper, cards. */
  paper: string;
  /** Translucent card fill over `bg`. */
  glass: string;
  /** Main text on `bg`. */
  ink: string;
  /** Secondary text on `bg`. */
  inkSoft: string;
  /** Text on `paper`. */
  paperInk: string;
  /** Primary accent (buttons, highlights). */
  accent: string;
  /** Darker accent (button shadow, pressed). */
  accentDeep: string;
  /** Text on `accent`. */
  accentInk: string;
  /** A pale tint of the accent (chip backgrounds, focus rings). */
  soft: string;
  /** Hairlines and input borders. */
  edge: string;
  /** Secondary metallic / highlight colour. */
  gold: string;
  /** Is `bg` dark? (Pick light glass, light dock, etc.) */
  dark: boolean;
  /** Ambient particles for the day (emoji). */
  particles: readonly string[];
  /** Confetti colours for Burst. */
  confetti: readonly string[];
}

export const FONTS = {
  /** Rounded, cute UI face. */
  ui: "var(--font-fredoka), 'Fredoka', system-ui, -apple-system, sans-serif",
  /** Romantic serif for headings and letters. */
  // Nested fallbacks: an undefined var() would void the whole declaration.
  serif: "var(--font-vw-serif, var(--font-playfair, 'Playfair Display')), 'Cormorant Garamond', Georgia, serif",
  /** Handwriting for names, captions, signatures. */
  script: "var(--font-vw-script, var(--font-dancing, 'Dancing Script')), 'Segoe Script', cursive",
} as const;

const KEYS = [
  "bg", "base", "paper", "glass", "ink", "inkSoft", "paperInk", "accent", "accentDeep", "accentInk", "soft", "edge", "gold",
] as const;
type TokenKey = (typeof KEYS)[number];

const cssName = (k: string) => `--vw-${k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}`;

/** `var(--vw-…)` references, for inline styles: `color: VW.ink`. */
export const VW = Object.fromEntries(KEYS.map((k) => [k, `var(${cssName(k)})`])) as Record<TokenKey, string>;

/** Mount a theme as CSS variables (plus the three font vars) on any element. */
export function themeVars(t: DayTheme): CSSProperties {
  const out: Record<string, string> = {};
  for (const k of KEYS) out[cssName(k)] = t[k];
  out["--vw-font-ui"] = FONTS.ui;
  out["--vw-font-serif"] = FONTS.serif;
  out["--vw-font-script"] = FONTS.script;
  return out as CSSProperties;
}
