// ─── Challan — the four vibes ────────────────────────────────────────────────
//
// Each one is a different "department" the notice could have come from. The
// first is the default. Every colour lands on the page through CSS custom
// properties, so the document, the flows, the CCTV room and the court order all
// re-colour in one style write when the dock or the form picks another.
//
//   patrol    Night Patrol — siren red and siren blue bleeding into a black
//             street at 1 a.m. The notice is a white sheet under a torch.
//   official  Official — sarkari navy on crisp white with traffic-sign yellow
//             stickers. The most "real looking" one, which is the joke.
//   pink      Pink Police — bubblegum and lilac. Same notice, zero menace.
//   carbon    Carbon Copy — the yellow duplicate the officer tears off the pad,
//             carbon-blue ink, a red rubber stamp.
//
// The server mirrors the ids in challanPage.controller.ts (CHALLAN_THEMES).

import type { CSSProperties } from "react";
import type { LoveTheme } from "../../_love/theme";

export const CHALLAN_THEMES: LoveTheme[] = [
  {
    id: "patrol",
    name: "Night Patrol",
    emoji: "🚨",
    vibe: "siren red & blue on a 1 a.m. street",
    dark: true,
    sky: "stars",
    swatch: ["#07080f", "#ff2e55", "#2e7bff"],
    colors: {
      bg: "radial-gradient(90% 55% at 0% 0%, rgba(255,46,85,.30) 0%, rgba(255,46,85,0) 60%), radial-gradient(90% 55% at 100% 4%, rgba(46,123,255,.32) 0%, rgba(46,123,255,0) 60%), linear-gradient(180deg, #0a0b16 0%, #07080f 100%)",
      base: "#07080f",
      ink: "#f3f5ff",
      soft: "rgba(243,245,255,.74)",
      faint: "rgba(243,245,255,.5)",
      a1: "#ff2e55",
      a2: "#b04dff",
      a3: "#2e7bff",
      glass: "rgba(255,255,255,.065)",
      edge: "rgba(255,255,255,.15)",
      paper: "#f5f6fb",
      paperInk: "#0c1024",
      paperSoft: "#5b6282",
      chip: "#d8ff3e",
      chipInk: "#0a0c18",
    },
  },
  {
    id: "official",
    name: "Official",
    emoji: "🏛️",
    vibe: "sarkari navy, crisp white, traffic yellow",
    dark: false,
    sky: "sparkles",
    swatch: ["#ffffff", "#1d4ed8", "#ffd23f"],
    colors: {
      bg: "linear-gradient(180deg, #f5f8ff 0%, #e8efff 55%, #dce6ff 100%)",
      base: "#eef3ff",
      ink: "#0b1f4d",
      soft: "rgba(11,31,77,.74)",
      faint: "rgba(11,31,77,.5)",
      a1: "#1d4ed8",
      a2: "#2f6df0",
      a3: "#0ea5e9",
      glass: "rgba(255,255,255,.74)",
      edge: "rgba(11,31,77,.13)",
      paper: "#ffffff",
      paperInk: "#0b1f4d",
      paperSoft: "#5a6a92",
      chip: "#ffd23f",
      chipInk: "#0b1f4d",
    },
  },
  {
    id: "pink",
    name: "Pink Police",
    emoji: "🎀",
    vibe: "bubblegum, lilac & zero menace",
    dark: false,
    sky: "hearts",
    swatch: ["#ffe1ee", "#ff4f9a", "#a78bfa"],
    colors: {
      bg: "linear-gradient(165deg, #fff1f7 0%, #ffe0ee 45%, #f1e2ff 100%)",
      base: "#ffeaf3",
      ink: "#4a1238",
      soft: "rgba(74,18,56,.74)",
      faint: "rgba(74,18,56,.5)",
      a1: "#ff3d8f",
      a2: "#ff79b0",
      a3: "#a78bfa",
      glass: "rgba(255,255,255,.66)",
      edge: "rgba(74,18,56,.12)",
      paper: "#fffafc",
      paperInk: "#4a1238",
      paperSoft: "#a0668b",
      chip: "#bfe9ff",
      chipInk: "#3a0f2e",
    },
  },
  {
    id: "carbon",
    name: "Carbon Copy",
    emoji: "📒",
    vibe: "yellow duplicate, carbon-blue ink",
    dark: false,
    sky: "bokeh",
    swatch: ["#f7e9a6", "#2336a0", "#d4322a"],
    colors: {
      bg: "linear-gradient(170deg, #fbf4d4 0%, #f5e8ac 55%, #eed98c 100%)",
      base: "#f6ebb8",
      ink: "#1f2a6b",
      soft: "rgba(31,42,107,.76)",
      faint: "rgba(31,42,107,.52)",
      a1: "#2336a0",
      a2: "#3a4cc0",
      a3: "#6b5bd6",
      glass: "rgba(255,251,230,.7)",
      edge: "rgba(31,42,107,.16)",
      paper: "#fdf3c4",
      paperInk: "#1f2a6b",
      paperSoft: "#5f6597",
      chip: "#d4322a",
      chipInk: "#fff8e0",
    },
  },
];

export const CHALLAN_THEME_IDS = CHALLAN_THEMES.map((t) => t.id);

/** The colours the love kit has no slot for: the two rubber-stamp inks and the sirens. */
const EXTRA: Record<string, { red: string; green: string; sirenA: string; sirenB: string }> = {
  patrol: { red: "#e11d48", green: "#138a4a", sirenA: "#ff2e55", sirenB: "#2e7bff" },
  official: { red: "#d61f36", green: "#15803d", sirenA: "#e11d48", sirenB: "#1d4ed8" },
  pink: { red: "#e0277a", green: "#1f9d6a", sirenA: "#ff3d8f", sirenB: "#8b7bff" },
  carbon: { red: "#c7271f", green: "#2f7a4f", sirenA: "#d4322a", sirenB: "#2336a0" },
};

/** Extra custom properties mounted next to the love-kit ones. */
export function challanVars(t: LoveTheme): CSSProperties {
  const x = EXTRA[t.id] ?? EXTRA.patrol;
  return { "--ch-red": x.red, "--ch-green": x.green, "--ch-siren-a": x.sirenA, "--ch-siren-b": x.sirenB } as CSSProperties;
}
