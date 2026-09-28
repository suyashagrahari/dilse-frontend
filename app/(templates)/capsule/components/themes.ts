// ─── Capsule — themes ────────────────────────────────────────────────────────
//
// Four capsules, each a different object you could actually bury:
//
//   rust      Rust & Brass — an heirloom tin. Brass canister, rust-red wax,
//             letters gone the colour of tea. The original look, warmed up.
//   chrome    Y2K Chrome — a 2003 bedroom. Liquid-silver canister, holo foil,
//             bubblegum wax, a lime sticker. Loud on purpose.
//   garden    Garden Soil — dug up from under the rose bush. Verdigris copper,
//             terracotta wax, pressed petals, moss.
//   stardust  Stardust — sealed at midnight. Ink-blue night, a pewter canister,
//             gold wax, pink for the disputed ones.
//
// A theme is a `LoveTheme` (so every love-kit piece — the dock, the picker,
// glass, stickers — paints correctly) plus the capsule's own `cp` palette,
// which feeds the `PALETTE` custom properties in types.ts. The theme is the
// OUTSIDE of the capsule: public on the sealed view, editable forever.

import type { CSSProperties } from "react";
import { pickTheme, themeVars, type LoveTheme } from "../../_love/theme";

export interface CapsuleTheme extends LoveTheme {
  cp: {
    page: string;
    paper: string;
    paperDeep: string;
    edge: string;
    ink: string;
    inkSoft: string;
    inkFaint: string;
    wax: string;
    waxDeep: string;
    waxHi: string;
    amber: string;
    amberWash: string;
    right: string;
    quiet: string;
    metalHi: string;
    metal: string;
    metalLo: string;
  };
  /** Little glyphs that fall out when the letter's seal breaks. */
  burst: string[];
  /** The decoration scattered inside the capsule with the keepsakes. */
  confetti: string[];
}

export const CAPSULE_THEMES: readonly CapsuleTheme[] = [
  {
    id: "rust",
    name: "Rust & Brass",
    emoji: "🗝️",
    vibe: "heirloom tin, brass, tea-stained letters",
    dark: false,
    sky: "bokeh",
    swatch: ["#b8893a", "#9c3b1e", "#f9f1e3"],
    colors: {
      bg: "radial-gradient(120% 70% at 20% 0%, #fbf1df 0%, #f1e3cb 45%, #e6d2b2 100%)",
      base: "#f1e3cb",
      ink: "#2b1d13",
      soft: "#6f5a45",
      faint: "#a8906f",
      a1: "#c4552d",
      a2: "#d49a3a",
      a3: "#8a5a2b",
      glass: "rgba(255,250,240,.62)",
      edge: "rgba(120,84,40,.22)",
      paper: "#fbf4e6",
      paperInk: "#2b1d13",
      paperSoft: "#6f5a45",
      chip: "#2b1d13",
      chipInk: "#f9f1e3",
    },
    cp: {
      page: "#efe4d2",
      paper: "#f9f1e3",
      paperDeep: "#efe1c9",
      edge: "#d9c39f",
      ink: "#2b1d13",
      inkSoft: "#6f5a45",
      inkFaint: "#a8906f80",
      wax: "#9c3b1e",
      waxDeep: "#6e2512",
      waxHi: "#c9603a",
      amber: "#b27a22",
      amberWash: "#f6e6c6",
      right: "#56703f",
      quiet: "rgba(255,250,240,.62)",
      metalHi: "#f7e2a4",
      metal: "#b8893a",
      metalLo: "#5e3d15",
    },
    burst: ["✉️", "✨", "🗝️", "🤎", "⭐"],
    confetti: ["✦", "·", "✧"],
  },
  {
    id: "chrome",
    name: "Y2K Chrome",
    emoji: "💿",
    vibe: "liquid silver, holo foil, bubblegum wax",
    dark: false,
    sky: "sparkles",
    swatch: ["#c9cedf", "#e8207a", "#c8ff3d"],
    colors: {
      bg: "radial-gradient(90% 60% at 10% 0%, #ffe3f3 0%, transparent 60%), radial-gradient(90% 60% at 100% 30%, #dcefff 0%, transparent 60%), radial-gradient(80% 60% at 30% 100%, #e6fff8 0%, transparent 60%), #f1f2fb",
      base: "#f1f2fb",
      ink: "#1c1d33",
      soft: "#5d6184",
      faint: "#9aa0c4",
      a1: "#e8207a",
      a2: "#7a5cff",
      a3: "#18c7b8",
      glass: "rgba(255,255,255,.68)",
      edge: "rgba(90,96,160,.2)",
      paper: "#ffffff",
      paperInk: "#1c1d33",
      paperSoft: "#5d6184",
      chip: "#c8ff3d",
      chipInk: "#1c1d33",
    },
    cp: {
      page: "#f1f2fb",
      paper: "#fdfdff",
      paperDeep: "#eceefa",
      edge: "#cfd3ea",
      ink: "#1c1d33",
      inkSoft: "#5d6184",
      inkFaint: "#9aa0c480",
      wax: "#e8207a",
      waxDeep: "#a50f55",
      waxHi: "#ff7cbb",
      amber: "#7a5cff",
      amberWash: "#efeaff",
      right: "#0f9e86",
      quiet: "rgba(255,255,255,.72)",
      metalHi: "#ffffff",
      metal: "#b9bfd6",
      metalLo: "#5f6685",
    },
    burst: ["💿", "✨", "🦋", "💖", "⭐"],
    confetti: ["✦", "✧", "♡"],
  },
  {
    id: "garden",
    name: "Garden Soil",
    emoji: "🌷",
    vibe: "pressed petals, moss, terracotta wax",
    dark: false,
    sky: "hearts",
    swatch: ["#5b8f7b", "#b5532f", "#e0708b"],
    colors: {
      bg: "radial-gradient(110% 70% at 80% 0%, #f7f1df 0%, #ebe4cf 50%, #dcd5bb 100%)",
      base: "#ebe4cf",
      ink: "#26291c",
      soft: "#5f6448",
      faint: "#9ba07e",
      a1: "#d9607e",
      a2: "#d9774d",
      a3: "#6f9a4f",
      glass: "rgba(255,253,244,.64)",
      edge: "rgba(70,80,40,.2)",
      paper: "#fbf8ee",
      paperInk: "#26291c",
      paperSoft: "#5f6448",
      chip: "#4f7a3a",
      chipInk: "#fbf8ee",
    },
    cp: {
      page: "#ebe4cf",
      paper: "#f8f4e8",
      paperDeep: "#ebe4cf",
      edge: "#cfc6a6",
      ink: "#26291c",
      inkSoft: "#5f6448",
      inkFaint: "#9ba07e80",
      wax: "#b5532f",
      waxDeep: "#7a3217",
      waxHi: "#dc7e52",
      amber: "#c47a12",
      amberWash: "#f5ead0",
      right: "#4f7a3a",
      quiet: "rgba(255,253,244,.64)",
      metalHi: "#b9e3d2",
      metal: "#5f937f",
      metalLo: "#27443a",
    },
    burst: ["🌷", "🌼", "🍃", "🌸", "✨"],
    confetti: ["❀", "✿", "·"],
  },
  {
    id: "stardust",
    name: "Stardust",
    emoji: "🌙",
    vibe: "sealed at midnight, gold wax, wishes",
    dark: true,
    sky: "stars",
    swatch: ["#1a1733", "#e9c46a", "#ff9ecb"],
    colors: {
      bg: "radial-gradient(90% 60% at 50% 0%, #2a2356 0%, #15122c 55%, #0b0a1a 100%)",
      base: "#15122c",
      ink: "#f3eeff",
      soft: "#b4acd6",
      faint: "#7a72a3",
      a1: "#b69cff",
      a2: "#ff9ecb",
      a3: "#ffd37a",
      glass: "rgba(34,29,70,.62)",
      edge: "rgba(200,190,255,.18)",
      paper: "#fbf5e6",
      paperInk: "#221b3b",
      paperSoft: "#5d5577",
      chip: "#ffd37a",
      chipInk: "#1a1733",
    },
    cp: {
      page: "#15122c",
      paper: "#1f1b3d",
      paperDeep: "#171433",
      edge: "#3b3566",
      ink: "#f3eeff",
      inkSoft: "#b4acd6",
      inkFaint: "#7a72a399",
      wax: "#e9c46a",
      waxDeep: "#94701f",
      waxHi: "#fff0b8",
      amber: "#ff9ecb",
      amberWash: "#34204a",
      right: "#8fe3b5",
      quiet: "rgba(255,255,255,.07)",
      metalHi: "#eef0ff",
      metal: "#8e93c8",
      metalLo: "#2c2f5c",
    },
    burst: ["🌙", "✨", "⭐", "💫", "🤍"],
    confetti: ["✦", "✧", "·"],
  },
];

export const CAPSULE_THEME_IDS = CAPSULE_THEMES.map((t) => t.id);
export const DEFAULT_THEME_ID = "rust";

export function capsuleTheme(id: string | undefined | null): CapsuleTheme {
  return pickTheme(CAPSULE_THEMES, id) as CapsuleTheme;
}

/** Every custom property one theme sets: the love kit's `--lv-*` plus `--cp-*`. */
export function capsuleThemeVars(t: CapsuleTheme): CSSProperties {
  const c = t.cp;
  return {
    ...themeVars(t),
    "--cp-page": c.page,
    "--cp-paper": c.paper,
    "--cp-paper-deep": c.paperDeep,
    "--cp-edge": c.edge,
    "--cp-ink": c.ink,
    "--cp-ink-soft": c.inkSoft,
    "--cp-ink-faint": c.inkFaint,
    "--cp-wax": c.wax,
    "--cp-wax-deep": c.waxDeep,
    "--cp-wax-hi": c.waxHi,
    "--cp-amber": c.amber,
    "--cp-amber-wash": c.amberWash,
    "--cp-right": c.right,
    "--cp-quiet": c.quiet,
    "--cp-metal-hi": c.metalHi,
    "--cp-metal": c.metal,
    "--cp-metal-lo": c.metalLo,
  } as CSSProperties;
}


/**
 * The form is always written on light paper — the love-kit editor pieces
 * (photo cards, GIF grid) are drawn for a light sheet, and a long form reads
 * best dark-on-light. A dark theme gets a moonlit-paper variant of itself.
 */
export function sheetTheme(t: CapsuleTheme): CapsuleTheme {
  if (!t.dark) return t;
  return {
    ...t,
    dark: false,
    cp: {
      ...t.cp,
      page: "#efecfa",
      paper: "#f8f6ff",
      paperDeep: "#ebe7fb",
      edge: "#d5cff0",
      ink: "#1f1b3d",
      inkSoft: "#5d5577",
      inkFaint: "#9a93b880",
      wax: "#6b4fd8",
      waxDeep: "#48309f",
      waxHi: "#a08bff",
      amber: "#c2417f",
      amberWash: "#fbe7f1",
      right: "#1f8a5b",
      quiet: "rgba(255,255,255,.78)",
    },
  };
}
