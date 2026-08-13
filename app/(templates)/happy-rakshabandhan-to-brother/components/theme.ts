// ─── Raksha Bandhan palette ──────────────────────────────────────────────────
//
// Festive but restrained. The failure mode for an Indian-festival page is
// saturated red-on-gold everywhere, which reads as a wedding-hall banner; the
// cream ground is what keeps this feeling like paper someone chose.

export const RB = {
  /** Page ground. Warm, not white. */
  paper: "#fdf8ee",
  paperDeep: "#f6ecd9",
  /** Cards and sheets. */
  surface: "#fffdf8",

  /** The festival red. Headlines, the thread, the tilak. */
  red: "#9B2226",
  redSoft: "#c0464a",

  /** Marigold. Buttons, accents, the flame. */
  marigold: "#E8913A",
  marigoldSoft: "#f2b877",

  /** The thali and every ornamental rule. */
  brass: "#B08D57",
  brassSoft: "#d9c194",

  /** Muhurat-active only. Used nowhere else, so it always means "now". */
  green: "#2F6B4F",

  ink: "#3d2317",
  muted: "#8a6f5e",
  hairline: "rgba(61,35,23,0.14)",
} as const;

export const PAPER_GRADIENT = `linear-gradient(170deg, ${RB.paper} 0%, ${RB.paperDeep} 100%)`;

/** Primary action. */
export const BRAND_GRADIENT = `linear-gradient(135deg, ${RB.marigold} 0%, ${RB.red} 100%)`;

/** The house's hand-drawn card edge, in this template's ink. */
export const CARD_BORDER = `2px solid ${RB.ink}`;
export const CARD_SHADOW = "3px 4px 0 rgba(61,35,23,0.15)";

export const charmGlyph: Record<string, string> = {
  om: "ॐ",
  swastik: "卍",
  "evil-eye": "🧿",
  heart: "♥",
  star: "✦",
};
