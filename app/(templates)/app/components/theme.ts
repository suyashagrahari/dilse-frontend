// ─── App Listing — design tokens ─────────────────────────────────────────────
//
// One flat token object, shared by every part of this template. It is
// deliberately tiny: a listing is white paper, one grey, one hairline, one
// accent, and nothing else. Every extra colour added here is a colour that will
// end up somewhere it does not belong.
//
// ── BRAND ────────────────────────────────────────────────────────────────────
//
// The accent is a deep indigo that belongs to no software storefront, and it is
// the ONLY saturated colour in the template — the install pill, the "more"
// affordance, and the developer line. It is never used as a background wash.
//
// ── WHY THE GREYS ARE THREE AND NOT ONE ──────────────────────────────────────
//
//   card  #F2F2F7  fills — image fallbacks, the age box, empty states
//   edge  #E5E5EA  hairlines — cell dividers, card borders, the bar underline
//
// They are two steps apart and both read as "grey" in isolation, which is the
// point: a fill that is the same value as a hairline makes every bordered box
// look like it failed to load.

/** The whole palette. Nothing in this template may introduce a colour outside it. */
export const AP = {
  page: "#FFFFFF",
  card: "#F2F2F7",
  edge: "#E5E5EA",
  ink: "#000000",
  inkSoft: "#8A8A8E",
  accent: "#4B3FA7",
  accentInk: "#FFFFFF",
  font: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`,
};

/**
 * Vertical gap between the template's major sections, in px.
 *
 * This is large on purpose and must not be tuned down to fit more on screen.
 * Listings breathe — the whitespace between the header, the strip, the shots
 * and the copy is most of what makes a page like this read as a real product
 * surface. Cramming the sections is the single fastest way to make the whole
 * thing look like a screenshot of a screenshot.
 */
export const SECTION_GAP = 32;

/** Horizontal page gutter. Full-bleed scrollers pad their own children instead. */
export const AP_GUTTER = 16;

/** Minimum tap target, in px. Applies to every control in the template. */
export const AP_TAP = 44;
