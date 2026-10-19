// ─── Wedding kit themes: six complete token sets ────────────────────────────
//
// A theme is nothing but CSS custom properties (`--wk-*`). WeddingRoot puts
// `themeVars(id)` on its root element, so every kit component and every tier's
// own CSS re-themes by reading the tokens — never a hard-coded colour.
//
//   light: blush · champagne · powder
//   dark:  maroon · noir · emerald
//
// Gold is a FOIL, never a flat yellow: `--wk-foil` is a multi-stop metallic
// gradient (darker, higher-contrast stops on light paper; brighter on dark),
// `--wk-gold` the solid mid-tone for hairlines and icons, `--wk-gold-ink` a
// text-safe gold (≥ 4.5:1 on the theme's surface).

import type { CSSProperties } from "react";

export const WEDDING_THEME_IDS = ["blush", "champagne", "powder", "maroon", "noir", "emerald"] as const;
export type WeddingThemeId = (typeof WEDDING_THEME_IDS)[number];
export const DEFAULT_WEDDING_THEME: WeddingThemeId = "maroon";

export interface WeddingTheme {
  id: WeddingThemeId;
  label: string;
  /** One line for the picker. */
  blurb: string;
  dark: boolean;
  /** Three swatch colours for the picker chip: background, accent, gold. */
  swatch: [string, string, string];
  /** `<meta name="theme-color">` / browser chrome. */
  chrome: string;
  tokens: WeddingTokens;
}

export interface WeddingTokens {
  /** Page background (solid) and the second stop of its radial wash. */
  bg: string;
  bg2: string;
  /** Card / panel surface (may be translucent on dark themes) and its solid twin for foil borders. */
  surface: string;
  surfaceSolid: string;
  /** Raised / inset surface (inputs, chips). */
  surface2: string;
  ink: string;
  muted: string;
  /** The theme's own colour (rose / champagne / blue / gold). */
  accent: string;
  /** Text on an accent fill. */
  accentInk: string;
  /** Metallic gradient for foil text / borders / rules. */
  foil: string;
  /** Solid gold for hairlines, icons, focus rings. */
  gold: string;
  /** Text-safe gold. */
  goldInk: string;
  border: string;
  shadow: string;
  /** Soft glow behind hero elements. */
  glow: string;
  /** `url(...)` transparent fibre overlay for the page, and how strongly to lay it on. */
  texture: string;
  /** `url(...)` opaque silk paper for cards / the invitation sheet (multiply it over `surfaceSolid`). */
  paper: string;
  textureOpacity: string;
  /** Photo placeholder wash before an image paints. */
  placeholder: string;
  /** Lightbox backdrop. */
  scrim: string;
}

// ── Textures (the wedding asset pack, CDN; CSS backgrounds need no CORS) ────
const CDN = "https://cdn.subhsandesh.in/gifts-media/templates/wedding/textures/";
/** Transparent linen fibre, laid over every theme's background. */
const LINEN = `url("${CDN}linen-overlay.webp")`;
const SILK_LIGHT = `url("${CDN}paper-silk-light.webp")`;
const SILK_DARK = `url("${CDN}paper-silk-dark.webp")`;

// ── Foils ───────────────────────────────────────────────────────────────────
// On light paper the highlights stay mid-gold: a near-white stop would vanish into cream.
const FOIL_ON_LIGHT =
  "linear-gradient(105deg, #6e4510 0%, #9a6b22 16%, #c3953f 30%, #dcb768 39%, #b58630 50%, #7d5216 63%, #a87a2e 78%, #cfa553 89%, #7a4f12 100%)";
const FOIL_ON_DARK =
  "linear-gradient(105deg, #a8762a 0%, #d9b45e 14%, #f7e3a3 28%, #fffaf0 36%, #e3bd66 48%, #a8762a 60%, #e8c87a 76%, #fff0c2 86%, #b9873a 100%)";
const ROSE_FOIL =
  "linear-gradient(105deg, #7d3e2f 0%, #a8664d 16%, #c98a6c 30%, #dfa98b 39%, #b97559 50%, #8a4a38 63%, #b4735a 78%, #d49c80 89%, #874634 100%)";

export const WEDDING_THEMES: Record<WeddingThemeId, WeddingTheme> = {
  blush: {
    id: "blush",
    label: "Blush Pink",
    blurb: "Rose petals & rose-gold",
    dark: false,
    swatch: ["#f8e9e7", "#b4596c", "#c9964a"],
    chrome: "#f8e9e7",
    tokens: {
      bg: "#fbf0ee",
      bg2: "#f4dcd9",
      surface: "rgba(255, 250, 248, 0.86)",
      surfaceSolid: "#fffaf8",
      surface2: "#f7e6e3",
      ink: "#3e1f27",
      muted: "#87636a",
      accent: "#a94e63",
      accentInk: "#fff8f6",
      foil: ROSE_FOIL,
      gold: "#c08a5c",
      goldInk: "#8a5233",
      border: "rgba(169, 78, 99, 0.2)",
      shadow: "0 22px 50px -26px rgba(110, 40, 58, 0.38), 0 2px 8px -4px rgba(110, 40, 58, 0.14)",
      glow: "rgba(236, 170, 180, 0.55)",
      texture: LINEN,
      paper: LINEN, // cream silk would tint the theme beige
      textureOpacity: "0.22",
      placeholder: "linear-gradient(135deg, #f6e1de, #fbefed 50%, #f1d6d2)",
      scrim: "rgba(38, 14, 20, 0.94)",
    },
  },
  champagne: {
    id: "champagne",
    label: "Champagne",
    blurb: "Butter cream & antique gold",
    dark: false,
    swatch: ["#faf3df", "#a8823a", "#d4ad5c"],
    chrome: "#faf3df",
    tokens: {
      bg: "#fbf5e4",
      bg2: "#f2e4c0",
      surface: "rgba(255, 252, 242, 0.86)",
      surfaceSolid: "#fffcf2",
      surface2: "#f5ebcf",
      ink: "#3a2c14",
      muted: "#857452",
      accent: "#8f6a22",
      accentInk: "#fffbef",
      foil: FOIL_ON_LIGHT,
      gold: "#c19a4b",
      goldInk: "#7c5915",
      border: "rgba(143, 106, 34, 0.22)",
      shadow: "0 22px 50px -26px rgba(98, 72, 20, 0.38), 0 2px 8px -4px rgba(98, 72, 20, 0.14)",
      glow: "rgba(240, 210, 140, 0.6)",
      texture: LINEN,
      paper: SILK_LIGHT,
      textureOpacity: "0.25",
      placeholder: "linear-gradient(135deg, #f3e7c6, #fbf5e2 50%, #eedfb7)",
      scrim: "rgba(30, 22, 8, 0.94)",
    },
  },
  powder: {
    id: "powder",
    label: "Powder Blue",
    blurb: "Morning sky & soft gold",
    dark: false,
    swatch: ["#e9f0f8", "#4d6f9c", "#c9a457"],
    chrome: "#e9f0f8",
    tokens: {
      bg: "#edf3f9",
      bg2: "#d6e3f1",
      surface: "rgba(250, 252, 255, 0.86)",
      surfaceSolid: "#fafcff",
      surface2: "#e2ebf5",
      ink: "#1d2b42",
      muted: "#5f6f88",
      accent: "#3f6292",
      accentInk: "#f7faff",
      foil: FOIL_ON_LIGHT,
      gold: "#c3a05a",
      goldInk: "#7a5a1c",
      border: "rgba(63, 98, 146, 0.2)",
      shadow: "0 22px 50px -26px rgba(29, 52, 92, 0.36), 0 2px 8px -4px rgba(29, 52, 92, 0.12)",
      glow: "rgba(170, 200, 236, 0.65)",
      texture: LINEN,
      paper: LINEN, // cream silk would tint the theme beige
      textureOpacity: "0.18",
      placeholder: "linear-gradient(135deg, #dce7f3, #eef4fa 50%, #d3e0ef)",
      scrim: "rgba(10, 18, 32, 0.94)",
    },
  },
  maroon: {
    id: "maroon",
    label: "Royal Maroon",
    blurb: "Velvet maroon & gold foil",
    dark: true,
    swatch: ["#4a0d1a", "#7d1a2c", "#e2bd6b"],
    chrome: "#3a0913",
    tokens: {
      bg: "#3a0913",
      bg2: "#5e1424",
      surface: "rgba(255, 236, 214, 0.06)",
      surfaceSolid: "#4a0f1b",
      surface2: "rgba(255, 236, 214, 0.1)",
      ink: "#fbecd4",
      muted: "#d6b99c",
      accent: "#e2bd6b",
      accentInk: "#3a0913",
      foil: FOIL_ON_DARK,
      gold: "#d9b05c",
      goldInk: "#efd08c",
      border: "rgba(226, 189, 107, 0.28)",
      shadow: "0 28px 60px -28px rgba(0, 0, 0, 0.7), 0 2px 10px -4px rgba(0, 0, 0, 0.4)",
      glow: "rgba(226, 160, 90, 0.32)",
      texture: LINEN,
      paper: SILK_DARK,
      textureOpacity: "0.12",
      placeholder: "linear-gradient(135deg, #521221, #3f0b16 50%, #5a1626)",
      scrim: "rgba(24, 4, 9, 0.96)",
    },
  },
  noir: {
    id: "noir",
    label: "Black & Gold",
    blurb: "Midnight black & bright foil",
    dark: true,
    swatch: ["#0e0d0b", "#2a251c", "#d4af37"],
    chrome: "#0c0b09",
    tokens: {
      bg: "#0c0b09",
      bg2: "#221d14",
      surface: "rgba(255, 243, 214, 0.05)",
      surfaceSolid: "#15130f",
      surface2: "rgba(255, 243, 214, 0.09)",
      ink: "#f5ead0",
      muted: "#b3a68a",
      accent: "#d8b45a",
      accentInk: "#0c0b09",
      foil: FOIL_ON_DARK,
      gold: "#d4af37",
      goldInk: "#e9cc7e",
      border: "rgba(216, 180, 90, 0.26)",
      shadow: "0 28px 60px -28px rgba(0, 0, 0, 0.85), 0 2px 10px -4px rgba(0, 0, 0, 0.5)",
      glow: "rgba(212, 175, 55, 0.22)",
      texture: LINEN,
      paper: SILK_DARK,
      textureOpacity: "0.09",
      placeholder: "linear-gradient(135deg, #1b1812, #12100c 50%, #211c13)",
      scrim: "rgba(4, 4, 3, 0.96)",
    },
  },
  emerald: {
    id: "emerald",
    label: "Emerald & Gold",
    blurb: "Deep emerald & antique gold",
    dark: true,
    swatch: ["#06281f", "#0f4a3a", "#d9b45a"],
    chrome: "#06241c",
    tokens: {
      bg: "#06241c",
      bg2: "#0e4234",
      surface: "rgba(236, 248, 230, 0.06)",
      surfaceSolid: "#0a3026",
      surface2: "rgba(236, 248, 230, 0.1)",
      ink: "#f3ecd6",
      muted: "#b9c7b4",
      accent: "#dcb862",
      accentInk: "#06241c",
      foil: FOIL_ON_DARK,
      gold: "#d6b05a",
      goldInk: "#ecd08e",
      border: "rgba(220, 184, 98, 0.26)",
      shadow: "0 28px 60px -28px rgba(0, 0, 0, 0.75), 0 2px 10px -4px rgba(0, 0, 0, 0.45)",
      glow: "rgba(120, 200, 160, 0.18)",
      texture: LINEN,
      paper: SILK_DARK,
      textureOpacity: "0.1",
      placeholder: "linear-gradient(135deg, #0d3a2e, #082c22 50%, #114536)",
      scrim: "rgba(2, 14, 10, 0.96)",
    },
  },
};

export const LIGHT_THEMES = WEDDING_THEME_IDS.filter((id) => !WEDDING_THEMES[id].dark);
export const DARK_THEMES = WEDDING_THEME_IDS.filter((id) => WEDDING_THEMES[id].dark);

export const isWeddingThemeId = (v: unknown): v is WeddingThemeId =>
  typeof v === "string" && (WEDDING_THEME_IDS as readonly string[]).includes(v);

/** Unknown / empty → the default, so a stored theme from an old draft can never break the page. */
export const weddingTheme = (id: unknown, fallback: WeddingThemeId = DEFAULT_WEDDING_THEME): WeddingTheme =>
  WEDDING_THEMES[isWeddingThemeId(id) ? id : fallback];

const KEBAB: Record<keyof WeddingTokens, string> = {
  bg: "--wk-bg",
  bg2: "--wk-bg2",
  surface: "--wk-surface",
  surfaceSolid: "--wk-surface-solid",
  surface2: "--wk-surface-2",
  ink: "--wk-ink",
  muted: "--wk-muted",
  accent: "--wk-accent",
  accentInk: "--wk-accent-ink",
  foil: "--wk-foil",
  gold: "--wk-gold",
  goldInk: "--wk-gold-ink",
  border: "--wk-border",
  shadow: "--wk-shadow",
  glow: "--wk-glow",
  texture: "--wk-texture",
  paper: "--wk-paper",
  textureOpacity: "--wk-texture-opacity",
  placeholder: "--wk-placeholder",
  scrim: "--wk-scrim",
};

/** The theme as an inline style object of CSS variables (+ color-scheme). */
export function themeVars(id: unknown): CSSProperties {
  const t = weddingTheme(id);
  const out: Record<string, string> = { colorScheme: t.dark ? "dark" : "light" };
  for (const k of Object.keys(KEBAB) as (keyof WeddingTokens)[]) out[KEBAB[k]] = t.tokens[k];
  return out as CSSProperties;
}
