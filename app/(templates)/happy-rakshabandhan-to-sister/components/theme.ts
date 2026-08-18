// ─── Raksha Bandhan (to sister) palette ──────────────────────────────────────
//
// Deliberately NOT the brother template's palette, and the reason is practical
// rather than aesthetic. Both pages carry the same festival, the same slug stem
// and nearly the same title, and a family where the sister sends one and the
// brother sends the other will have both open on the same phone within an hour.
// If they share a palette, the second one reads as the first one having reloaded.
//
// So: brother is festival red (#9B2226) on cream. This one is RANI PINK on ivory,
// with haldi for every action and a deep mehendi green that appears in exactly
// two places. Same shelf, obviously different object.
//
// The failure mode being avoided is the other direction too — "a page for a
// sister" is not an invitation to bubblegum pink and hearts. Rani pink is a
// festival colour that predates that association by several centuries; it is the
// pink of a Jaipur wedding lehenga, not of a greeting-card aisle.

export const RS = {
  /** Page ground. Ivory, warmer than white, cooler than the brother's cream. */
  paper: "#fffaf2",
  paperDeep: "#f9edda",
  /** Cards and sheets. */
  surface: "#fffdf8",

  /** Rani pink. Headlines, the seal, the thread's default. */
  rani: "#A62A5C",
  raniSoft: "#c25a83",
  raniDeep: "#6D1F45",

  /** Haldi. Every primary action, the flame, the marigold. */
  haldi: "#E8A33A",
  haldiSoft: "#f4c684",

  /** Brass — the thali, every ornamental rule. Shared with the house. */
  brass: "#B08D57",
  brassSoft: "#dcc7a1",

  /**
   * Mehendi green. Used for the muhurat-active state and for the vow's "signed"
   * stamp, and NOWHERE else — which is what lets both of them mean something
   * without a label.
   */
  mehendi: "#17564F",

  /** Plum-ink, not brown. Reads as ink on ivory rather than as sepia. */
  ink: "#33202B",
  muted: "#8a6478",
  hairline: "rgba(51,32,43,0.14)",
} as const;

export const PAPER_GRADIENT = `linear-gradient(170deg, ${RS.paper} 0%, ${RS.paperDeep} 100%)`;

/** Primary action. */
export const BRAND_GRADIENT = `linear-gradient(135deg, ${RS.haldi} 0%, ${RS.rani} 100%)`;

/** The house's hand-drawn card edge, in this template's ink. */
export const CARD_BORDER = `2px solid ${RS.ink}`;
export const CARD_SHADOW = "3px 4px 0 rgba(51,32,43,0.15)";

/**
 * The accent that travels OUT of this template — the share card, the OG image,
 * `lib/share/accents.ts`. One constant so those three cannot drift from the page.
 */
export const ACCENT = RS.rani;
