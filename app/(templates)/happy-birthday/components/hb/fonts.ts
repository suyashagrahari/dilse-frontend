// The Happy Birthday faces, both already self-hosted in assets/fonts (no new
// download for the build):
//
//   • Grandstander — round, bouncy, a little party-hat: headings, the pill,
//     the certificate. Reads "birthday" without shouting.
//   • Caveat — a warm handwriting: what the sender wrote (the wish, the slice,
//     the balloons, the letter, the coupon small print).
//
// Self-hosted by next/font/local, swap so a first visit never shows blank
// text, and only downloaded where this page renders. UI text stays Fredoka.
import localFont from "next/font/local";

export const hbDisplay = localFont({
  src: [
    { path: "../../../../../assets/fonts/grandstander-700-normal.woff2", weight: "700", style: "normal" },
    { path: "../../../../../assets/fonts/grandstander-800-normal.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-hb-display",
  display: "swap",
  preload: false,
});

export const HB_DISPLAY = "var(--font-hb-display), var(--font-fredoka), 'Fredoka', system-ui, sans-serif";

export const hbHand = localFont({
  src: [
    { path: "../../../../../assets/fonts/caveat-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../../../../../assets/fonts/caveat-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-hb-hand",
  display: "swap",
  preload: false,
});

export const HB_HAND = "var(--font-hb-hand), 'Segoe Print', 'Bradley Hand', cursive";
