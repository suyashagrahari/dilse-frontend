// Diwali's display face: Yatra One — a warm, hand-lettered face with an Indian
// festive feel (drawn by a Devanagari type studio, with a full Latin set), for
// headings, the sparkler word and the card. Self-hosted by next/font, swap so a
// first visit never shows blank headings, and only downloaded where this page
// renders. Body text stays Fredoka.
import localFont from "next/font/local";

export const dwDisplay = localFont({
  src: [
    { path: "../../../../../assets/fonts/yatra-one-400-normal.woff2", weight: "400", style: "normal" },
  ],
  variable: "--font-dw-display",
  display: "swap",
  preload: false,
});

/** Headings, the sparkler word, the card. */
export const DW_DISPLAY = "var(--font-dw-display), var(--font-fredoka), 'Fredoka', system-ui, sans-serif";
