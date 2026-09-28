// ─── Nutrition Facts — the four packagings ───────────────────────────────────
//
// Each theme is a different PRODUCT LINE of the same person: the regulatory
// panel stays a regulatory panel (hard rules, Helvetica, % Daily Value), only
// the carton around it changes. `paper` / `paperInk` are the printed panel and
// the folded note inside the wrapper; `pack` is the carton itself.
//
// The first theme is the default.

import type { CSSProperties } from "react";

import type { LoveTheme } from "../../_love/theme";

export interface NutritionTheme extends LoveTheme {
  /** The carton around the printed panel. */
  pack: {
    /** Board the panel is printed on. */
    board: string;
    /** Board ink (barcode, distributor line). */
    boardInk: string;
    /** Foil wrapper gradient stops (the letter pack + sachet crimps). */
    foil1: string;
    foil2: string;
    /** The flavour ribbon across the front of pack. */
    ribbon: string;
    ribbonInk: string;
  };
}

export const NUTRITION_THEMES: NutritionTheme[] = [
  {
    id: "classic",
    name: "Classic Label",
    emoji: "🏷️",
    vibe: "crisp black & white, a red sale sticker",
    dark: false,
    sky: "sparkles",
    swatch: ["#f5f2ea", "#111111", "#ff3b2f"],
    colors: {
      bg: "radial-gradient(120% 70% at 50% -10%, #ffffff 0%, #f5f2ea 55%, #ebe6da 100%)",
      base: "#f5f2ea",
      ink: "#111111",
      soft: "rgba(17,17,17,.72)",
      faint: "rgba(17,17,17,.5)",
      a1: "#ff3b2f",
      a2: "#ff7a1a",
      a3: "#ffb800",
      glass: "rgba(255,255,255,.72)",
      edge: "rgba(17,17,17,.14)",
      paper: "#ffffff",
      paperInk: "#0b0b0b",
      paperSoft: "#6b6b6b",
      chip: "#ffe14d",
      chipInk: "#111111",
    },
    pack: {
      board: "#f3f1ec",
      boardInk: "#111111",
      foil1: "#e9e9ee",
      foil2: "#b9bac4",
      ribbon: "#111111",
      ribbonInk: "#ffffff",
    },
  },
  {
    id: "candy",
    name: "Candy Wrapper",
    emoji: "🍬",
    vibe: "bubblegum pink, lilac & a sour-lemon pop",
    dark: false,
    sky: "hearts",
    swatch: ["#ffd9ea", "#ff3d8b", "#9b6bff"],
    colors: {
      bg: "linear-gradient(165deg, #fff0f7 0%, #ffd9ea 48%, #f3dcff 100%)",
      base: "#ffe4f0",
      ink: "#4a0d2e",
      soft: "rgba(74,13,46,.74)",
      faint: "rgba(74,13,46,.52)",
      a1: "#ff3d8b",
      a2: "#ff7eb6",
      a3: "#9b6bff",
      glass: "rgba(255,255,255,.62)",
      edge: "rgba(74,13,46,.14)",
      paper: "#fffafc",
      paperInk: "#5b0f38",
      paperSoft: "#a45c83",
      chip: "#fff27a",
      chipInk: "#4a0d2e",
    },
    pack: {
      board: "#ffc6de",
      boardInk: "#5b0f38",
      foil1: "#ffd1e6",
      foil2: "#d7a8ff",
      ribbon: "#ff3d8b",
      ribbonInk: "#ffffff",
    },
  },
  {
    id: "kraft",
    name: "Organic Kraft",
    emoji: "🌿",
    vibe: "brown paper bag, leaf green & honey",
    dark: false,
    sky: "bokeh",
    swatch: ["#d4b48a", "#2f6b34", "#e3a72f"],
    colors: {
      bg: "linear-gradient(170deg, #e9d6b6 0%, #d8bb91 55%, #c9a577 100%)",
      base: "#dcc29c",
      ink: "#2b1d10",
      soft: "rgba(43,29,16,.76)",
      faint: "rgba(43,29,16,.54)",
      a1: "#2f6b34",
      a2: "#5f9a3f",
      a3: "#e3a72f",
      glass: "rgba(255,248,232,.55)",
      edge: "rgba(43,29,16,.18)",
      paper: "#f7f0de",
      paperInk: "#2b1d10",
      paperSoft: "#7d6445",
      chip: "#2f6b34",
      chipInk: "#f7f0de",
    },
    pack: {
      board: "#c9a273",
      boardInk: "#2b1d10",
      foil1: "#d9bf94",
      foil2: "#a9844f",
      ribbon: "#2f6b34",
      ribbonInk: "#f7f0de",
    },
  },
  {
    id: "midnight",
    name: "Midnight Energy",
    emoji: "⚡",
    vibe: "neon on black, 2 a.m. energy drink",
    dark: true,
    sky: "stars",
    swatch: ["#07070c", "#c6ff00", "#ff2bd6"],
    colors: {
      bg: "radial-gradient(110% 70% at 50% -10%, #1d1438 0%, #0b0a14 55%, #050508 100%)",
      base: "#0b0a14",
      ink: "#f4f3ff",
      soft: "rgba(244,243,255,.74)",
      faint: "rgba(244,243,255,.5)",
      a1: "#ff2bd6",
      a2: "#8b5cff",
      a3: "#00e5ff",
      glass: "rgba(255,255,255,.07)",
      edge: "rgba(198,255,0,.22)",
      paper: "#101018",
      paperInk: "#d8ff3d",
      paperSoft: "#9aa0b8",
      chip: "#c6ff00",
      chipInk: "#07070c",
    },
    pack: {
      board: "#17162a",
      boardInk: "#d8ff3d",
      foil1: "#2a2550",
      foil2: "#0f0e1c",
      ribbon: "#c6ff00",
      ribbonInk: "#07070c",
    },
  },
];

export const NUTRITION_THEME_IDS = NUTRITION_THEMES.map((t) => t.id);

export function pickNutritionTheme(id: string | undefined | null): NutritionTheme {
  return NUTRITION_THEMES.find((t) => t.id === id) ?? NUTRITION_THEMES[0];
}

/** `var(--nf-…)` handles for the carton. */
export const P = {
  board: "var(--nf-board)",
  boardInk: "var(--nf-board-ink)",
  foil1: "var(--nf-foil1)",
  foil2: "var(--nf-foil2)",
  ribbon: "var(--nf-ribbon)",
  ribbonInk: "var(--nf-ribbon-ink)",
} as const;

export function packVars(t: NutritionTheme): CSSProperties {
  return {
    "--nf-board": t.pack.board,
    "--nf-board-ink": t.pack.boardInk,
    "--nf-foil1": t.pack.foil1,
    "--nf-foil2": t.pack.foil2,
    "--nf-ribbon": t.pack.ribbon,
    "--nf-ribbon-ink": t.pack.ribbonInk,
  } as CSSProperties;
}
