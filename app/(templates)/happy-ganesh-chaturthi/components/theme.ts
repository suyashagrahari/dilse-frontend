// ─── Ganesh Chaturthi palette ────────────────────────────────────────────────
//
// Light, warm and quiet. The whole page sits on ivory paper and the colour
// arrives in three places only: gold for every rule and ornament, saffron for
// the flame, and a single deep red reserved for headings.
//
// ── WHY THERE IS NO ORANGE PANEL ANY MORE ───────────────────────────────────
//
// The first build painted the murti onto a saturated marigold wall, in four
// selectable variants. It read as a banner rather than as a page: a large block
// of high-chroma orange sets the whole composition's key, so every other element
// had to shout to be seen next to it, and the aarti — the one moment that should
// feel still — was the loudest screen of the lot.
//
// The murti asset is a transparent WebP, so it needs no ground at all. It now
// stands on the paper itself, inside a soft ivory medallion, and the gold does
// the work the orange was doing. Nothing in this file is a full-bleed saturated
// surface, and nothing new should be: if a section needs separating, it takes a
// hairline or a shade of ivory, never a colour field.
//
// ── ONE PALETTE, NOT FOUR ───────────────────────────────────────────────────
//
// The four `BACKDROPS` are gone with the wall. A sender choosing between four
// coloured walls was choosing between four versions of the same mistake, and the
// choice cost a form control, a stored field, a server enum and a swatch grid
// for something nobody asked for.

export const GC = {
  /** Page ground. Warm ivory, top to bottom. */
  paper: "#FBF7F0",
  paperDeep: "#F4EBDC",
  /** Cards, and the medallion behind the murti. */
  surface: "#FFFDF9",

  /** Headings, and nothing else. Deep enough to read as ink, not as alarm. */
  maroon: "#9E2B2B",

  /** The flame, the diya, the one warm highlight. Used in small quantities. */
  saffron: "#DE8A2C",
  saffronSoft: "#F0B569",

  /** Every rule, ring, glyph and ornament on the page. */
  gold: "#C19A3E",
  goldSoft: "#E3CE9B",
  goldPale: "#F3E7C9",

  /** Durva and the garland leaves. The one cool colour, and it is a leaf. */
  leaf: "#4A7A54",
  leafSoft: "#8FAE93",

  ink: "#2E2119",
  muted: "#87745F",
  hairline: "rgba(46,33,25,0.10)",
  hairlineStrong: "rgba(46,33,25,0.18)",
} as const;

/** The page ground. A single very soft vertical warm-up, nothing more. */
export const PAPER_GRADIENT = `linear-gradient(180deg, ${GC.paper} 0%, #FCF9F3 42%, ${GC.paperDeep} 100%)`;

/**
 * Primary action.
 *
 * Gold into saffron rather than saffron into red: on ivory, a red-ended gradient
 * reads as a warning and this button is only ever "save" or "send".
 */
export const BRAND_GRADIENT = `linear-gradient(135deg, ${GC.gold} 0%, ${GC.saffron} 100%)`;

/**
 * Card edging.
 *
 * A hairline and a diffuse shadow, not the house's 2px ink border and hard
 * offset. That treatment is deliberately hand-drawn and it fights the thing this
 * page is trying to be — the offset shadow in particular puts a black step under
 * every card, which on ivory reads as a sticker.
 */
export const CARD_BORDER = `1px solid ${GC.hairline}`;
export const CARD_SHADOW = "0 18px 40px -28px rgba(46,33,25,0.35)";
/** For the two or three elements that should lift off the page. */
export const CARD_SHADOW_LIFTED = "0 30px 60px -34px rgba(46,33,25,0.42)";
