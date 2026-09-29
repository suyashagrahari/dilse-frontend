// ─── The Listing — design tokens ─────────────────────────────────────────────
//
// A phone storefront's product page is white paper, two greys, one hairline and
// ONE tint. The tint here is a warm system pink instead of the usual blue — the
// only visible concession to romance in the chrome, and it is what makes the
// page read as "the store, in love mode" at a glance.

/** The whole palette. */
export const AP = {
  page: "#FFFFFF",
  /** Grouped fills: review cards, privacy cards, the GET pill in lists. */
  card: "#F2F2F7",
  /** Hairlines. */
  edge: "#E3E3E8",
  ink: "#000000",
  /** Secondary label grey. */
  inkSoft: "#8A8A8E",
  /** Tertiary grey — histogram tracks, empty stars. */
  inkFaint: "#C7C7CC",
  accent: "#FF2D55",
  accent2: "#FF6F91",
  accentInk: "#FFFFFF",
  /** Review stars are orange in the real thing, not the tint. */
  star: "#FF9500",
  font: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`,
};

/** Vertical gap between major sections, px (legacy consumers). */
export const SECTION_GAP = 32;

/** Horizontal page gutter on phones, px. */
export const AP_GUTTER = 20;

/** Minimum tap target, px. */
export const AP_TAP = 44;
