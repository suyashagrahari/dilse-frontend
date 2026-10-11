// The Dandiya display face: Yatra One — a festive, hand-lettered Latin with
// the swing of a Navratri poster. Self-hosted by next/font, swap so a first
// visit never shows blank headings, and only downloaded where this page
// renders. Body text stays Fredoka (the engine's UI face).
import { Kalam, Yatra_One } from "next/font/google";

export const ddDisplay = Yatra_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-dd-display",
  display: "swap",
  preload: false,
});

/** Headings, the pill, the pass. */
export const DD_DISPLAY = "var(--font-dd-display), var(--font-fredoka), 'Fredoka', system-ui, sans-serif";

// The letter's hand: Kalam — an Indian handwriting face (drawn for Devanagari
// and Latin), warm and easy to read at length. Only the letter scene uses it.
export const ddHand = Kalam({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-dd-hand",
  display: "swap",
  preload: false,
});

/** The handwritten letter. */
export const DD_HAND = "var(--font-dd-hand), 'Segoe Print', 'Bradley Hand', cursive";
