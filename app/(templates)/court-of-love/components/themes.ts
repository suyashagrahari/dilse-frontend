// ─── Court of Love — the four courtrooms ─────────────────────────────────────
//
// Each theme is a different room the trial can be held in. The first is the
// default. Every surface paints with the love-kit `V.*` variables, so switching
// recolours the summons, the evidence folder, the judgement and the chrome in
// one style write.
//
// Design notes:
//  - Paper is always light. Summons, exhibits and the judgement are documents,
//    and the court GIFs (several have opaque white/pastel backdrops) sit on
//    that paper, so a dark theme never shows a GIF as a stray rectangle.
//  - `a1` is the "rubber stamp" colour: GUILTY, ADMITTED, SO ORDERED.
//  - `chip` is the wax / foil used for the seal and the evidence tags.

import type { LoveTheme } from "../../_love/theme";

export const COURT_THEMES: LoveTheme[] = [
  {
    id: "supreme",
    name: "Supreme Court",
    emoji: "🏛️",
    vibe: "mahogany benches, gold leaf, very serious (not)",
    dark: true,
    sky: "sparkles",
    swatch: ["#3a120c", "#e9b949", "#ff6f91"],
    colors: {
      bg: "radial-gradient(120% 85% at 50% -12%, #5a1d14 0%, #2e0d08 52%, #170504 100%)",
      base: "#2a0c07",
      ink: "#fbf0dc",
      soft: "rgba(251,240,220,.76)",
      faint: "rgba(251,240,220,.5)",
      a1: "#e9b949",
      a2: "#ff8f7a",
      a3: "#ffd98e",
      glass: "rgba(255,236,200,.07)",
      edge: "rgba(233,185,73,.28)",
      paper: "#fbf3e1",
      paperInk: "#2b1610",
      paperSoft: "#8a6a55",
      chip: "#e9b949",
      chipInk: "#2a0c07",
    },
  },
  {
    id: "pink",
    name: "Pink Court",
    emoji: "💅",
    vibe: "bend-and-snap energy, pastel legal pads",
    dark: false,
    sky: "hearts",
    swatch: ["#ffe3ef", "#ff3d8b", "#a66bff"],
    colors: {
      bg: "linear-gradient(165deg, #fff1f7 0%, #ffe2ee 46%, #f5e4ff 100%)",
      base: "#ffeaf3",
      ink: "#3b0d2c",
      soft: "rgba(59,13,44,.72)",
      faint: "rgba(59,13,44,.48)",
      a1: "#ff3d8b",
      a2: "#ff7eb3",
      a3: "#a66bff",
      glass: "rgba(255,255,255,.66)",
      edge: "rgba(59,13,44,.12)",
      paper: "#fffafc",
      paperInk: "#3b0d2c",
      paperSoft: "#9a6385",
      chip: "#ff3d8b",
      chipInk: "#ffffff",
    },
  },
  {
    id: "night",
    name: "Night Court",
    emoji: "🌙",
    vibe: "midnight hearings, navy & old gold",
    dark: true,
    sky: "stars",
    swatch: ["#0b1233", "#f3c14f", "#8fb0ff"],
    colors: {
      bg: "radial-gradient(120% 85% at 50% -12%, #1d2a64 0%, #0b1233 55%, #050818 100%)",
      base: "#0b1233",
      ink: "#eef1ff",
      soft: "rgba(238,241,255,.74)",
      faint: "rgba(238,241,255,.5)",
      // Rose leads (the sky's big glow and the stamp ink): a gold glow turns
      // muddy olive over navy. Gold stays as the foil (chip) and third stop.
      a1: "#ff8fb4",
      a2: "#8fb0ff",
      a3: "#f3c14f",
      glass: "rgba(255,255,255,.06)",
      edge: "rgba(243,193,79,.24)",
      paper: "#fbf7ec",
      paperInk: "#141a36",
      paperSoft: "#6b6f8e",
      chip: "#f3c14f",
      chipInk: "#0b1233",
    },
  },
  {
    id: "parchment",
    name: "Old Parchment",
    emoji: "📜",
    vibe: "sepia case files, red wax, fountain ink",
    dark: false,
    sky: "bokeh",
    swatch: ["#f3e6c8", "#b3261e", "#7a5418"],
    colors: {
      bg: "linear-gradient(170deg, #f8eed8 0%, #efdfbc 55%, #e5cf9f 100%)",
      base: "#f1e3c3",
      ink: "#2e1d10",
      soft: "rgba(46,29,16,.74)",
      faint: "rgba(46,29,16,.5)",
      a1: "#b3261e",
      a2: "#d4552f",
      a3: "#8a5a19",
      glass: "rgba(255,250,238,.6)",
      edge: "rgba(46,29,16,.16)",
      paper: "#fffaf0",
      paperInk: "#2e1d10",
      paperSoft: "#8b6a45",
      chip: "#b3261e",
      chipInk: "#fff3e0",
    },
  },
];

export const COURT_THEME_IDS = COURT_THEMES.map((t) => t.id);
export const DEFAULT_COURT_THEME = COURT_THEMES[0].id;
