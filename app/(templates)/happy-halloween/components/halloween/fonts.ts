// Halloween's display face: Chewy — round, bubbly, cute rather than horror
// (no dripping-blood faces; the brand is spooky-sweet). Self-hosted by
// next/font, swap so a first visit never shows blank headings, and only
// downloaded where the Halloween page renders. Body text stays Fredoka.
import localFont from "next/font/local";

export const hwDisplay = localFont({
  src: [
    { path: "../../../../../assets/fonts/chewy-400-normal.woff2", weight: "400", style: "normal" },
  ],
  variable: "--font-hw-display",
  display: "swap",
  preload: false,
});

/** Headings, signs, the carved word. */
export const HW_DISPLAY = "var(--font-hw-display), var(--font-fredoka), 'Fredoka', system-ui, sans-serif";
