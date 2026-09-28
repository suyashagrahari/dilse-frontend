// ─── Affection Dispenser — the four machines ─────────────────────────────────
//
// A love-kit theme recolours the PAGE (sky, stickers, cards, the receipt). This
// template also has a physical object in the middle of it, so every theme ships
// a second palette — the machine's skin — mounted as `--vm-*` custom properties
// next to the kit's `--lv-*` ones. `C` in machine.ts reads nothing but these, so
// the cabinet, the keypad, the glass, the LEDs and the card vendor all re-skin
// in the same single style write.
//
// The one exception is the dot-matrix sign: it is painted to a canvas, and a
// canvas cannot read a CSS variable, so it takes `machine.led` as a hex value.
//
// The first theme is the default and is the original machine, colour for colour.

import type { CSSProperties } from "react";

import type { LoveTheme } from "../../_love/theme";

export interface MachineSkin {
  body: string;
  bodyDark: string;
  bodyDarker: string;
  bodyLight: string;
  /** Outlines and seams. */
  edge: string;
  /** Text printed on the cabinet (rail buttons, INSERT). */
  ink: string;
  inkDim: string;
  /** Behind the glass. */
  glass: string;
  glassHi: string;
  /** Recesses: the keypad well, the window frame, the coin slot. */
  well: string;
  well2: string;
  /** The header plate and every dark panel below the machine. Always dark. */
  plateHi: string;
  plateLo: string;
  keyHi: string;
  keyLo: string;
  keyInk: string;
  keyShadow: string;
  /** The two keys every real keypad wears lighter. */
  wornHi: string;
  wornLo: string;
  /** The stencilled name + its neon. */
  sign: string;
  signGlow: string;
  /** Dot-matrix LED — hex, it is painted to a canvas. */
  led: string;
  ledDim: string;
  /** Credit readout. */
  credit: string;
  /** SOLD OUT, the jam, the one red button. */
  alert: string;
}

export interface VendTheme extends LoveTheme {
  machine: MachineSkin;
}

export const VEND_THEMES: VendTheme[] = [
  {
    id: "arcade",
    name: "Retro Arcade",
    emoji: "🕹️",
    vibe: "teal steel, cherry soda & amber LEDs",
    dark: true,
    sky: "sparkles",
    swatch: ["#2d5c5c", "#ff4d6d", "#ffb547"],
    colors: {
      bg: "radial-gradient(120% 80% at 50% 0%, #16393b 0%, #0a1f21 55%, #051012 100%)",
      base: "#0a1f21",
      ink: "#f3fbf8",
      soft: "rgba(243,251,248,.74)",
      faint: "rgba(243,251,248,.5)",
      a1: "#ff4d6d",
      a2: "#ff8f5a",
      a3: "#ffc857",
      glass: "rgba(255,255,255,.06)",
      edge: "rgba(255,255,255,.14)",
      paper: "#fffaf0",
      paperInk: "#1f2a2a",
      paperSoft: "#6b7c7a",
      chip: "#ff4d6d",
      chipInk: "#fff",
    },
    machine: {
      body: "#2d5c5c",
      bodyDark: "#1d4144",
      bodyDarker: "#132e31",
      bodyLight: "#3d7370",
      edge: "#0d1f21",
      ink: "#d9e6e3",
      inkDim: "#8fa8a5",
      glass: "#08191b",
      glassHi: "#14282b",
      well: "#173437",
      well2: "#0f2528",
      plateHi: "#173437",
      plateLo: "#0b1e21",
      keyHi: "#2d4a4c",
      keyLo: "#182c2e",
      keyInk: "#e3eeeb",
      keyShadow: "0 1px 0 rgba(0,0,0,.6)",
      wornHi: "#3d5f60",
      wornLo: "#22393b",
      sign: "#ffe9bd",
      signGlow: "rgba(255,165,0,.4)",
      led: "#ffa500",
      ledDim: "rgba(255,165,0,0.09)",
      credit: "#3dff8b",
      alert: "#e63950",
    },
  },
  {
    id: "tokyo",
    name: "Tokyo Night",
    emoji: "🌃",
    vibe: "neon konbini at 2am, rain on the glass",
    dark: true,
    sky: "stars",
    swatch: ["#1e1540", "#ff2e97", "#22e4ff"],
    colors: {
      bg: "radial-gradient(120% 80% at 50% 0%, #2c1266 0%, #130829 55%, #07031a 100%)",
      base: "#130829",
      ink: "#fbf4ff",
      soft: "rgba(251,244,255,.74)",
      faint: "rgba(251,244,255,.5)",
      a1: "#ff2e97",
      a2: "#b14cff",
      a3: "#22e4ff",
      glass: "rgba(255,255,255,.07)",
      edge: "rgba(255,255,255,.16)",
      paper: "#fdfaff",
      paperInk: "#1b1030",
      paperSoft: "#7a6a96",
      chip: "#22e4ff",
      chipInk: "#0c0620",
    },
    machine: {
      body: "#241a4d",
      bodyDark: "#170f36",
      bodyDarker: "#0f0924",
      bodyLight: "#352768",
      edge: "#06031a",
      ink: "#eadcff",
      inkDim: "#9d8cc4",
      glass: "#0a0620",
      glassHi: "#21124d",
      well: "#1a1140",
      well2: "#0e0826",
      plateHi: "#1d1147",
      plateLo: "#0a0520",
      keyHi: "#2f2263",
      keyLo: "#18103c",
      keyInk: "#f3e9ff",
      keyShadow: "0 0 6px rgba(255,46,151,.55)",
      wornHi: "#48307f",
      wornLo: "#251755",
      sign: "#ffc2e6",
      signGlow: "rgba(255,46,151,.75)",
      led: "#22e4ff",
      ledDim: "rgba(34,228,255,0.09)",
      credit: "#b6ff3b",
      alert: "#ff2e97",
    },
  },
  {
    id: "kawaii",
    name: "Pastel Kawaii",
    emoji: "🍡",
    vibe: "strawberry milk, mochi & sticker-bombs",
    dark: false,
    sky: "hearts",
    swatch: ["#ffb6d2", "#b98cff", "#7ce0c3"],
    colors: {
      bg: "linear-gradient(170deg, #fff5f9 0%, #ffe4f0 48%, #e8f6ff 100%)",
      base: "#ffeef5",
      ink: "#4a1d3a",
      soft: "rgba(74,29,58,.74)",
      faint: "rgba(74,29,58,.5)",
      a1: "#ff4f9a",
      a2: "#b27dff",
      a3: "#42c8e8",
      glass: "rgba(255,255,255,.7)",
      edge: "rgba(74,29,58,.12)",
      paper: "#fffdfb",
      paperInk: "#3d1830",
      paperSoft: "#9a6a86",
      chip: "#4a1d3a",
      chipInk: "#ffe0ef",
    },
    machine: {
      body: "#ffb3cf",
      bodyDark: "#f497bb",
      bodyDarker: "#d9709c",
      bodyLight: "#ffd6e6",
      edge: "#b4577f",
      ink: "#5a2144",
      inkDim: "#9b5a7e",
      glass: "#3b1737",
      glassHi: "#5c2757",
      well: "#f7a2c5",
      well2: "#e787b0",
      plateHi: "#57224c",
      plateLo: "#3a1535",
      keyHi: "#fff7fb",
      keyLo: "#ffd3e5",
      keyInk: "#5a2144",
      keyShadow: "0 1px 0 rgba(255,255,255,.8)",
      wornHi: "#e3fff5",
      wornLo: "#aeeed8",
      sign: "#fff0f7",
      signGlow: "rgba(255,95,162,.8)",
      led: "#ff86c0",
      ledDim: "rgba(255,134,192,0.1)",
      credit: "#7dffd0",
      alert: "#ff4f8b",
    },
  },
  {
    id: "chrome",
    name: "Chrome Future",
    emoji: "🪩",
    vibe: "brushed chrome, holo foil & Y2K ice",
    dark: false,
    sky: "sparkles",
    swatch: ["#c3c9d4", "#7a5cff", "#3ad4ff"],
    colors: {
      bg: "linear-gradient(160deg, #f5f7fc 0%, #e2e7f1 46%, #efe7ff 100%)",
      base: "#eef1f7",
      ink: "#15172a",
      soft: "rgba(21,23,42,.72)",
      faint: "rgba(21,23,42,.5)",
      a1: "#7a5cff",
      a2: "#3ad4ff",
      a3: "#ff6bd6",
      glass: "rgba(255,255,255,.66)",
      edge: "rgba(21,23,42,.12)",
      paper: "#ffffff",
      paperInk: "#15172a",
      paperSoft: "#6a6f86",
      chip: "#15172a",
      chipInk: "#d6ff3d",
    },
    machine: {
      body: "#bcc3cf",
      bodyDark: "#8e96a6",
      bodyDarker: "#5f6778",
      bodyLight: "#eef1f6",
      edge: "#3b4150",
      ink: "#1b1f2c",
      inkDim: "#555d70",
      glass: "#0e1220",
      glassHi: "#232c46",
      well: "#a5adbb",
      well2: "#8b93a3",
      plateHi: "#1c2131",
      plateLo: "#0b0e19",
      keyHi: "#fbfcfe",
      keyLo: "#c9cfda",
      keyInk: "#1b1f2c",
      keyShadow: "0 1px 0 rgba(255,255,255,.9)",
      wornHi: "#ece6ff",
      wornLo: "#c3b6ff",
      sign: "#e8f8ff",
      signGlow: "rgba(58,212,255,.8)",
      led: "#7fe7ff",
      ledDim: "rgba(127,231,255,0.09)",
      credit: "#d6ff3d",
      alert: "#ff4f8b",
    },
  },
];

export const VEND_THEME_IDS = VEND_THEMES.map((t) => t.id);
export const DEFAULT_VEND_THEME = VEND_THEMES[0].id;

export function pickVendTheme(id: string | null | undefined): VendTheme {
  return VEND_THEMES.find((t) => t.id === id) ?? VEND_THEMES[0];
}

/** The machine skin as custom properties, spread next to `themeVars()`. */
export function machineVars(t: VendTheme): CSSProperties {
  const m = t.machine;
  return {
    "--vm-body": m.body,
    "--vm-body-dark": m.bodyDark,
    "--vm-body-darker": m.bodyDarker,
    "--vm-body-light": m.bodyLight,
    "--vm-edge": m.edge,
    "--vm-ink": m.ink,
    "--vm-ink-dim": m.inkDim,
    "--vm-glass": m.glass,
    "--vm-glass-hi": m.glassHi,
    "--vm-well": m.well,
    "--vm-well-2": m.well2,
    "--vm-plate-hi": m.plateHi,
    "--vm-plate-lo": m.plateLo,
    "--vm-key-hi": m.keyHi,
    "--vm-key-lo": m.keyLo,
    "--vm-key-ink": m.keyInk,
    "--vm-key-shadow": m.keyShadow,
    "--vm-worn-hi": m.wornHi,
    "--vm-worn-lo": m.wornLo,
    "--vm-sign": m.sign,
    "--vm-sign-glow": m.signGlow,
    "--vm-led": m.led,
    "--vm-led-dim": m.ledDim,
    "--vm-credit": m.credit,
    "--vm-alert": m.alert,
  } as CSSProperties;
}
