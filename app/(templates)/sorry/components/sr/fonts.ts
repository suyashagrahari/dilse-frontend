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
import { Gochi_Hand, Sour_Gummy } from "next/font/google";

export const srDisplay = Sour_Gummy({
  subsets: ["latin"],
  // The same two weights the other Sour Gummy pages load, so the files are shared.
  weight: ["600", "800"],
  variable: "--font-sr-display",
  display: "swap",
  preload: false,
});

export const SR_DISPLAY = "var(--font-sr-display), var(--font-fredoka), 'Fredoka', system-ui, sans-serif";

export const srHand = Gochi_Hand({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-sr-hand",
  display: "swap",
  preload: false,
});

export const SR_HAND = "var(--font-sr-hand), 'Segoe Print', 'Bradley Hand', cursive";
