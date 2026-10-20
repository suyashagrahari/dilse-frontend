// The Digital Bouquet faces, all self-hosted (next/font/google is lint-banned)
// and only downloaded where this page renders:
//
//   • Cormorant Garamond — the florist-card serif: scene titles, the card in "storybook".
//   • Great Vibes — calligraphy: their name, the signature.
//   • Dancing Script — the card in "calligraphy" (readable for a whole letter).
//   • Caveat — the sender's own handwriting: tags, notes, the card in "handwritten".
//   • Figtree — small UI text (kickers, hints, buttons).
import localFont from "next/font/local";

export const dbSerif = localFont({
  src: [
    { path: "../../../../../assets/fonts/cormorant-garamond-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../../../../../assets/fonts/cormorant-garamond-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../../../../../assets/fonts/cormorant-garamond-500-italic.woff2", weight: "500", style: "italic" },
    { path: "../../../../../assets/fonts/cormorant-garamond-600-italic.woff2", weight: "600", style: "italic" },
  ],
  variable: "--font-db-serif",
  display: "swap",
  preload: false,
});
export const DB_SERIF = "var(--font-db-serif), 'Cormorant Garamond', Georgia, serif";

export const dbScript = localFont({
  src: [{ path: "../../../../../assets/fonts/great-vibes-400-normal.woff2", weight: "400", style: "normal" }],
  variable: "--font-db-script",
  display: "swap",
  preload: false,
});
export const DB_SCRIPT = "var(--font-db-script), 'Great Vibes', 'Segoe Script', cursive";

export const dbCalli = localFont({
  src: [
    { path: "../../../../../assets/fonts/dancing-script-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../../../../../assets/fonts/dancing-script-600-normal.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-db-calli",
  display: "swap",
  preload: false,
});
export const DB_CALLI = "var(--font-db-calli), 'Dancing Script', 'Segoe Script', cursive";

export const dbHand = localFont({
  src: [
    { path: "../../../../../assets/fonts/caveat-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../../../../../assets/fonts/caveat-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-db-hand",
  display: "swap",
  preload: false,
});
export const DB_HAND = "var(--font-db-hand), 'Caveat', 'Bradley Hand', cursive";

export const dbSans = localFont({
  src: [
    { path: "../../../../../assets/fonts/figtree-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../../../../../assets/fonts/figtree-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../../../../../assets/fonts/figtree-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-db-sans",
  display: "swap",
  preload: false,
});
export const DB_SANS = "var(--font-db-sans), 'Figtree', system-ui, -apple-system, sans-serif";

export const DB_FONT_VARS = `${dbSerif.variable} ${dbScript.variable} ${dbCalli.variable} ${dbHand.variable} ${dbSans.variable}`;

/** The card's handwriting choice → its face. */
export const handFace = (h: "script" | "hand" | "serif") => (h === "script" ? DB_CALLI : h === "serif" ? DB_SERIF : DB_HAND);

/**
 * The card's text size, normalised per handwriting: Caveat sets small and
 * Cormorant has a low x-height, so each face gets its own px for the same
 * Small / Medium / Large. The studio preview and the recipient's card both use
 * it, so what the sender picks is exactly what they read.
 */
const CARD_PX = { s: 16, m: 18.5, l: 21.5 } as const;
const HAND_K = { hand: 1.14, script: 1, serif: 1.06 } as const;
export const cardFontPx = (h: "script" | "hand" | "serif", size: "s" | "m" | "l" = "m") => Math.round(CARD_PX[size] * HAND_K[h] * 2) / 2;
