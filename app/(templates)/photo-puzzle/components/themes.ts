// ─── The Last Piece — four vibes ─────────────────────────────────────────────
//
// Each one is a "table" the puzzle is being played on: the page is the room,
// the board is the tray, the tiles are thick little cards. The first theme is
// the default. Ids are mirrored in server/src/models/PhotoPuzzlePage.ts.

import type { LoveTheme } from "../../_love/theme";

export interface BoardSkin {
  /** The tray around the tiles (any CSS background). */
  frame: string;
  /** Inner well the tiles slide on — visible through the empty slot. */
  well: string;
  /** Tile edge highlight + drop shadow. */
  tileEdge: string;
  /** Little number badges. */
  badge: string;
  badgeInk: string;
}

export const PUZZLE_THEMES: LoveTheme[] = [
  {
    id: "cozy",
    name: "Cozy Table",
    emoji: "🧸",
    vibe: "warm wood, fairy lights & a blanket fort",
    dark: false,
    sky: "bokeh",
    swatch: ["#f6e6d0", "#c65a3a", "#8a5a36"],
    colors: {
      bg: "radial-gradient(120% 70% at 50% -10%, #fff6e8 0%, #f7e3c8 48%, #eccfae 100%)",
      base: "#f6e4cb",
      ink: "#3a2216",
      soft: "rgba(58,34,22,.72)",
      faint: "rgba(58,34,22,.5)",
      a1: "#c65a3a",
      a2: "#e0873f",
      a3: "#d4a24c",
      glass: "rgba(255,250,242,.66)",
      edge: "rgba(58,34,22,.14)",
      paper: "#fffaf1",
      paperInk: "#2e1b11",
      paperSoft: "#9a6a47",
      chip: "#3a2216",
      chipInk: "#ffe2ae",
    },
  },
  {
    id: "pastel",
    name: "Pastel Dream",
    emoji: "🫧",
    vibe: "lilac clouds, strawberry milk & mint",
    dark: false,
    sky: "hearts",
    swatch: ["#f3ecff", "#ff7eb6", "#79d7c3"],
    colors: {
      bg: "linear-gradient(165deg, #fdf0ff 0%, #efe8ff 45%, #e3f7f2 100%)",
      base: "#f3ecff",
      ink: "#35264f",
      soft: "rgba(53,38,79,.72)",
      faint: "rgba(53,38,79,.5)",
      a1: "#ff6fae",
      a2: "#b28cff",
      a3: "#5fcfb8",
      glass: "rgba(255,255,255,.62)",
      edge: "rgba(53,38,79,.12)",
      paper: "#fffdfd",
      paperInk: "#35264f",
      paperSoft: "#9c7fbf",
      chip: "#35264f",
      chipInk: "#c7fff1",
    },
  },
  {
    id: "midnight",
    name: "Midnight Glow",
    emoji: "🌙",
    vibe: "3am talks, neon hearts, city lights",
    dark: true,
    sky: "stars",
    swatch: ["#120d2e", "#ff5fa2", "#5ee0ff"],
    colors: {
      bg: "radial-gradient(120% 80% at 50% -10%, #2b1d63 0%, #130d33 55%, #090620 100%)",
      base: "#130d33",
      ink: "#f6f1ff",
      soft: "rgba(246,241,255,.74)",
      faint: "rgba(246,241,255,.5)",
      a1: "#ff5fa2",
      a2: "#a970ff",
      a3: "#5ee0ff",
      glass: "rgba(255,255,255,.07)",
      edge: "rgba(255,255,255,.16)",
      paper: "#fdf8ff",
      paperInk: "#1f1638",
      paperSoft: "#7d6aa6",
      chip: "#d9ff5e",
      chipInk: "#140e30",
    },
  },
  {
    id: "sakura",
    name: "Cherry Blossom",
    emoji: "🌸",
    vibe: "sakura petals, blush & plum",
    dark: false,
    sky: "sparkles",
    swatch: ["#ffe9ef", "#e0507a", "#7e2f58"],
    colors: {
      bg: "linear-gradient(170deg, #fff4f6 0%, #ffe3ea 50%, #fbd3de 100%)",
      base: "#ffe8ee",
      ink: "#4a1832",
      soft: "rgba(74,24,50,.72)",
      faint: "rgba(74,24,50,.5)",
      a1: "#e0507a",
      a2: "#f08aa8",
      a3: "#9b3d6c",
      glass: "rgba(255,255,255,.6)",
      edge: "rgba(74,24,50,.13)",
      paper: "#fffafb",
      paperInk: "#3d1429",
      paperSoft: "#b2668a",
      chip: "#4a1832",
      chipInk: "#ffd1e0",
    },
  },
];

export const PUZZLE_THEME_IDS = PUZZLE_THEMES.map((t) => t.id);

export const BOARD_SKINS: Record<string, BoardSkin> = {
  cozy: {
    frame: "linear-gradient(145deg, #b77a4c 0%, #8d5634 45%, #6f4127 100%)",
    well: "repeating-linear-gradient(90deg, #5a331f 0 18px, #613822 18px 36px)",
    tileEdge: "inset 0 1px 0 rgba(255,255,255,.35), 0 3px 0 rgba(60,30,15,.45), 0 8px 14px -6px rgba(40,20,10,.55)",
    badge: "#fff3dc",
    badgeInk: "#6b3b20",
  },
  pastel: {
    frame: "linear-gradient(145deg, #ffd0ea 0%, #d9c5ff 50%, #b9ede0 100%)",
    well: "radial-gradient(circle at 30% 30%, #f7f1ff 0 2px, transparent 3px) 0 0/16px 16px, #e9defc",
    tileEdge: "inset 0 1px 0 rgba(255,255,255,.6), 0 3px 0 rgba(120,90,170,.28), 0 8px 14px -6px rgba(90,60,140,.35)",
    badge: "#ffffff",
    badgeInk: "#6b4fa3",
  },
  midnight: {
    frame: "linear-gradient(145deg, #3a2a86 0%, #1d1550 55%, #2a1150 100%)",
    well: "radial-gradient(circle at 50% 50%, #1b1245 0%, #0c0824 100%)",
    tileEdge: "inset 0 1px 0 rgba(255,255,255,.25), 0 0 0 1px rgba(169,112,255,.35), 0 8px 18px -6px rgba(255,95,162,.45)",
    badge: "#140e30",
    badgeInk: "#d9ff5e",
  },
  sakura: {
    frame: "linear-gradient(145deg, #f7a8bf 0%, #e0708f 50%, #a64575 100%)",
    well: "radial-gradient(circle at 50% 50%, #fff0f4 0 1.5px, transparent 2.5px) 0 0/14px 14px, #f6c9d6",
    tileEdge: "inset 0 1px 0 rgba(255,255,255,.55), 0 3px 0 rgba(140,40,80,.3), 0 8px 14px -6px rgba(120,30,70,.4)",
    badge: "#fff5f8",
    badgeInk: "#9b3d6c",
  },
};

export const boardSkin = (id: string): BoardSkin => BOARD_SKINS[id] ?? BOARD_SKINS.cozy;
