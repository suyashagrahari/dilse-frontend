// The Dandiya display face: Yatra One — a festive, hand-lettered Latin with
// the swing of a Navratri poster. Self-hosted by next/font, swap so a first
// visit never shows blank headings, and only downloaded where this page
// renders. Body text stays Fredoka (the engine's UI face).
import { Yatra_One } from "next/font/google";

export const ddDisplay = Yatra_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-dd-display",
  display: "swap",
  preload: false,
});

/** Headings, the pill, the pass. */
export const DD_DISPLAY = "var(--font-dd-display), var(--font-fredoka), 'Fredoka', system-ui, sans-serif";
