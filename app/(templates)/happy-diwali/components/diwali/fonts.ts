// Diwali's display face: Yatra One — a warm, hand-lettered face with an Indian
// festive feel (drawn by a Devanagari type studio, with a full Latin set), for
// headings, the sparkler word and the card. Self-hosted by next/font, swap so a
// first visit never shows blank headings, and only downloaded where this page
// renders. Body text stays Fredoka.
import { Yatra_One } from "next/font/google";

export const dwDisplay = Yatra_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-dw-display",
  display: "swap",
  preload: false,
});

/** Headings, the sparkler word, the card. */
export const DW_DISPLAY = "var(--font-dw-display), var(--font-fredoka), 'Fredoka', system-ui, sans-serif";
