// The Sorry faces. Both are already used elsewhere on the site, so no new
// Google Fonts download is added to the build.
//
//   • Sour Gummy — round, squishy, a little sheepish: headings, the pill, the
//     certificate. Reads "cute" without shouting.
//   • Gochi Hand — a sincere scribble: what the sender wrote (the confession,
//     the letter, the promise, the coupon small print).
//
// Self-hosted by next/font, swap so a first visit never shows blank text, and
// only downloaded where this page renders. UI text stays Fredoka (the engine's).
import localFont from "next/font/local";

export const srDisplay = localFont({
  src: [
    { path: "../../../../../assets/fonts/sour-gummy-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../../../../../assets/fonts/sour-gummy-800-normal.woff2", weight: "800", style: "normal" },
  ],
  // The same two weights the other Sour Gummy pages load, so the files are shared.
  variable: "--font-sr-display",
  display: "swap",
  preload: false,
});

export const SR_DISPLAY = "var(--font-sr-display), var(--font-fredoka), 'Fredoka', system-ui, sans-serif";

export const srHand = localFont({
  src: [
    { path: "../../../../../assets/fonts/gochi-hand-400-normal.woff2", weight: "400", style: "normal" },
  ],
  variable: "--font-sr-hand",
  display: "swap",
  preload: false,
});

export const SR_HAND = "var(--font-sr-hand), 'Segoe Print', 'Bradley Hand', cursive";
