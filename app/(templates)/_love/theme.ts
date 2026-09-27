// ─── Love kit — themes ───────────────────────────────────────────────────────
//
// Every love-kit template (Kundli Milan, Train Ticket, Legal Notice, Court
// Marriage) ships 2–4 colour themes. A theme is nothing but a set of CSS custom
// properties mounted on the template root, so switching one recolours the whole
// page in a single style write, with a transition, and no component ever needs
// to know which theme is active: they all paint with `V.*` below.
//
// In the sender's preview a floating dock flips between themes; in the Create
// form they pick exactly one; the published page renders the one they picked.

import type { CSSProperties } from "react";

export interface LoveTheme {
  id: string;
  /** Short, cute, shown on the dock and in the form. */
  name: string;
  emoji: string;
  /** One line for the form card: what the vibe is. */
  vibe: string;
  /** Dark themes get white-on-glass chrome; light themes get ink-on-paper. */
  dark: boolean;
  /** The background decoration drawn by <LoveSky>. */
  sky: "stars" | "hearts" | "bokeh" | "sparkles";
  /** Three swatch colours for the picker dots. */
  swatch: [string, string, string];
  colors: {
    /** Page background (any CSS background). */
    bg: string;
    /** A solid colour close to `bg`, for sheets, the browser chrome and PNGs. */
    base: string;
    ink: string;
    soft: string;
    faint: string;
    /** The three gradient stops everything loud is painted with. */
    a1: string;
    a2: string;
    a3: string;
    /** Glass panel fill + edge. */
    glass: string;
    edge: string;
    /** Letter paper. */
    paper: string;
    paperInk: string;
    paperSoft: string;
    /** The sticker colour (the lime of the night kit) + its ink. */
    chip: string;
    chipInk: string;
  };
}

/** `var(--lv-…)` handles. Components paint with these and nothing else. */
export const V = {
  bg: "var(--lv-bg)",
  base: "var(--lv-base)",
  ink: "var(--lv-ink)",
  soft: "var(--lv-soft)",
  faint: "var(--lv-faint)",
  a1: "var(--lv-a1)",
  a2: "var(--lv-a2)",
  a3: "var(--lv-a3)",
  grad: "linear-gradient(115deg, var(--lv-a1) 0%, var(--lv-a2) 50%, var(--lv-a3) 100%)",
  gradText: "linear-gradient(100deg, var(--lv-a1), var(--lv-a2) 55%, var(--lv-a3))",
  glass: "var(--lv-glass)",
  edge: "var(--lv-edge)",
  paper: "var(--lv-paper)",
  paperInk: "var(--lv-paper-ink)",
  paperSoft: "var(--lv-paper-soft)",
  chip: "var(--lv-chip)",
  chipInk: "var(--lv-chip-ink)",
  shadow: "var(--lv-shadow)",
} as const;

/** The custom properties for one theme, to spread onto the root `style`. */
export function themeVars(t: LoveTheme): CSSProperties {
  const c = t.colors;
  return {
    "--lv-bg": c.bg,
    "--lv-base": c.base,
    "--lv-ink": c.ink,
    "--lv-soft": c.soft,
    "--lv-faint": c.faint,
    "--lv-a1": c.a1,
    "--lv-a2": c.a2,
    "--lv-a3": c.a3,
    "--lv-glass": c.glass,
    "--lv-edge": c.edge,
    "--lv-paper": c.paper,
    "--lv-paper-ink": c.paperInk,
    "--lv-paper-soft": c.paperSoft,
    "--lv-chip": c.chip,
    "--lv-chip-ink": c.chipInk,
    "--lv-shadow": t.dark ? "rgba(0,0,0,.75)" : "rgba(90,40,70,.28)",
    colorScheme: t.dark ? "dark" : "light",
  } as CSSProperties;
}

/** The theme with this id, or the template's first (default) theme. */
export function pickTheme(themes: readonly LoveTheme[], id: string | undefined | null): LoveTheme {
  return themes.find((t) => t.id === id) ?? themes[0];
}
