// The Birthday Storybook faces, both already self-hosted in assets/fonts (no
// new download for the build):
//
//   • Sour Gummy — round, soft, picture-book: headings, the pill, the passport.
//   • Gochi Hand — a bouncy handwriting: what the sender wrote (the wishes,
//     the capsules, the milestones, the letter, the ticket's small print).
//
// Self-hosted by next/font/local, swap so a first visit never shows blank
// text, and only downloaded where this page renders. UI text stays Fredoka.
import localFont from "next/font/local";

export const bpDisplay = localFont({
  src: [
    { path: "../../../../../assets/fonts/sour-gummy-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../../../../../assets/fonts/sour-gummy-800-normal.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-bp-display",
  display: "swap",
  preload: false,
});

export const BP_DISPLAY = "var(--font-bp-display), var(--font-fredoka), 'Fredoka', system-ui, sans-serif";

export const bpHand = localFont({
  src: [{ path: "../../../../../assets/fonts/gochi-hand-400-normal.woff2", weight: "400", style: "normal" }],
  variable: "--font-bp-hand",
  display: "swap",
  preload: false,
});

export const BP_HAND = "var(--font-bp-hand), 'Segoe Print', 'Bradley Hand', cursive";
