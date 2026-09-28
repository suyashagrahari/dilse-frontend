// ─── Flags — the four vibes ──────────────────────────────────────────────────
//
// Designed for THIS template: a dating-app swipe deck where every card is
// judged red, green or beige. So every palette carries its own three flag inks
// (tuned to read on its own card surface) on top of the love-kit tokens.
//
//   Swipe Night     after-midnight dating app: ink black, neon cherry + mint
//   Matcha & Cherry soft café date: oat milk, cherry red, matcha green
//   Y2K Bubble      2003 flip-phone glitter: bubblegum, grape, baby blue, lime
//   Beige Flag      the neutral aesthetic: oat, caramel, sage — calm, clean
//
// The first theme is the default. Server mirror: FLAGS_THEMES in
// server/src/controllers/flagsPage.controller.ts.

import type { CSSProperties } from "react";

import type { LoveTheme } from "../../_love/theme";

export interface FlagTones {
  red: string;
  green: string;
  beige: string;
  /** Text that sits ON a filled flag colour. */
  onFlag: string;
}

export const FLAGS_THEMES: LoveTheme[] = [
  {
    id: "swipe-night",
    name: "Swipe Night",
    emoji: "🌚",
    vibe: "2am dating app, neon red + green",
    dark: true,
    sky: "stars",
    swatch: ["#0b0912", "#ff2e63", "#2dffa3"],
    colors: {
      bg: "radial-gradient(120% 70% at 50% -10%, #2a1245 0%, #120b1f 45%, #07060c 100%)",
      base: "#0b0912",
      ink: "#f7f4ff",
      soft: "rgba(247,244,255,.74)",
      faint: "rgba(247,244,255,.48)",
      a1: "#ff2e63",
      a2: "#ff5fd2",
      a3: "#2dffa3",
      glass: "rgba(255,255,255,.07)",
      edge: "rgba(255,255,255,.15)",
      paper: "#16121f",
      paperInk: "#f7f4ff",
      paperSoft: "rgba(247,244,255,.62)",
      chip: "#2dffa3",
      chipInk: "#05140d",
    },
  },
  {
    id: "matcha-cherry",
    name: "Matcha & Cherry",
    emoji: "🍒",
    vibe: "soft café date, cherry + matcha",
    dark: false,
    sky: "hearts",
    swatch: ["#fbf6ec", "#e2445c", "#7da453"],
    colors: {
      bg: "linear-gradient(165deg, #fffaf1 0%, #f7f0e1 48%, #eef3e1 100%)",
      base: "#f9f4ea",
      ink: "#25301f",
      soft: "rgba(37,48,31,.74)",
      faint: "rgba(37,48,31,.5)",
      a1: "#e2445c",
      a2: "#f0848a",
      a3: "#7da453",
      glass: "rgba(255,255,255,.7)",
      edge: "rgba(37,48,31,.12)",
      paper: "#fffdf8",
      paperInk: "#25301f",
      paperSoft: "#6f7b61",
      chip: "#6f9a44",
      chipInk: "#ffffff",
    },
  },
  {
    id: "y2k-bubble",
    name: "Y2K Bubble",
    emoji: "🫧",
    vibe: "bubblegum, grape & glitter",
    dark: false,
    sky: "sparkles",
    swatch: ["#ffe3f6", "#ff3fb4", "#2ec5ff"],
    colors: {
      bg: "linear-gradient(160deg, #ffe4f6 0%, #ece0ff 50%, #d8f3ff 100%)",
      base: "#f2e8ff",
      ink: "#2a1650",
      soft: "rgba(42,22,80,.74)",
      faint: "rgba(42,22,80,.5)",
      a1: "#ff3fb4",
      a2: "#9b5cff",
      a3: "#2ec5ff",
      glass: "rgba(255,255,255,.6)",
      edge: "rgba(42,22,80,.12)",
      paper: "#ffffff",
      paperInk: "#2a1650",
      paperSoft: "#7a6aa0",
      chip: "#c8ff4d",
      chipInk: "#2a1650",
    },
  },
  {
    id: "beige-flag",
    name: "Beige Flag",
    emoji: "🤎",
    vibe: "oat, caramel & sage — clean girl",
    dark: false,
    sky: "bokeh",
    swatch: ["#f1e9dd", "#a0704f", "#7c8a64"],
    colors: {
      bg: "linear-gradient(170deg, #f7f2ea 0%, #efe6d8 55%, #e8ddcc 100%)",
      base: "#f2eadf",
      ink: "#3b2f24",
      soft: "rgba(59,47,36,.72)",
      faint: "rgba(59,47,36,.48)",
      a1: "#a0704f",
      a2: "#c79a72",
      a3: "#7c8a64",
      glass: "rgba(255,255,255,.58)",
      edge: "rgba(59,47,36,.13)",
      paper: "#fcf9f3",
      paperInk: "#3b2f24",
      paperSoft: "#8a7661",
      chip: "#3b2f24",
      chipInk: "#f4eee4",
    },
  },
];

export const FLAGS_THEME_IDS = FLAGS_THEMES.map((t) => t.id);

export const FLAG_TONES: Record<string, FlagTones> = {
  "swipe-night": { red: "#ff2e63", green: "#2dffa3", beige: "#e9c89c", onFlag: "#0b0912" },
  "matcha-cherry": { red: "#e2445c", green: "#5f9a3a", beige: "#c49a6c", onFlag: "#ffffff" },
  "y2k-bubble": { red: "#ff3f7f", green: "#16c98a", beige: "#dca66e", onFlag: "#ffffff" },
  "beige-flag": { red: "#b5523b", green: "#6b7f4e", beige: "#c29d74", onFlag: "#ffffff" },
};

/** The flag custom properties for one theme, spread next to `themeVars`. */
export function flagVars(themeId: string): CSSProperties {
  const t = FLAG_TONES[themeId] ?? FLAG_TONES["swipe-night"];
  return {
    "--fl-red": t.red,
    "--fl-green": t.green,
    "--fl-beige": t.beige,
    "--fl-on": t.onFlag,
  } as CSSProperties;
}
