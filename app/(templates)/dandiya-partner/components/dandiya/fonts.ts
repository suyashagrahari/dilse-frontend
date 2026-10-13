// The Dandiya display face: Yatra One — a festive, hand-lettered Latin with
// the swing of a Navratri poster. Self-hosted by next/font, swap so a first
// visit never shows blank headings, and only downloaded where this page
// renders. Body text stays Fredoka (the engine's UI face).
import localFont from "next/font/local";

export const ddDisplay = localFont({
  src: [
    { path: "../../../../../assets/fonts/yatra-one-400-normal.woff2", weight: "400", style: "normal" },
  ],
  variable: "--font-dd-display",
  display: "swap",
  preload: false,
});

/** Headings, the pill, the pass. */
export const DD_DISPLAY = "var(--font-dd-display), var(--font-fredoka), 'Fredoka', system-ui, sans-serif";

// The letter's hand: Kalam — an Indian handwriting face (drawn for Devanagari
// and Latin), warm and easy to read at length. Only the letter scene uses it.
export const ddHand = localFont({
  src: [
    { path: "../../../../../assets/fonts/kalam-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../../../../assets/fonts/kalam-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-dd-hand",
  display: "swap",
  preload: false,
});

/** The handwritten letter. */
export const DD_HAND = "var(--font-dd-hand), 'Segoe Print', 'Bradley Hand', cursive";
