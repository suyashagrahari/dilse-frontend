// The Miss You faces, self-hosted (assets/fonts via next/font/local — the
// lint rule bans next/font/google). Both files already ship for other pages.
//
//   • Baloo 2 — round, soft, a little bouncy: headings, the pill, the ticket.
//   • Caveat — a real handwriting: what the sender wrote (the jar notes, the
//     open-when letters, the letter, the hug line).
//
// swap so a first visit never shows blank text, and only downloaded where this
// page renders. UI text stays Fredoka (the engine's).
import localFont from "next/font/local";

export const muDisplay = localFont({
  src: [
    { path: "../../../../../assets/fonts/baloo-2-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../../../../../assets/fonts/baloo-2-800-normal.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-mu-display",
  display: "swap",
  preload: false,
});

export const MU_DISPLAY = "var(--font-mu-display), var(--font-fredoka), 'Fredoka', system-ui, sans-serif";

export const muHand = localFont({
  src: [
    { path: "../../../../../assets/fonts/caveat-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../../../../../assets/fonts/caveat-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-mu-hand",
  display: "swap",
  preload: false,
});

export const MU_HAND = "var(--font-mu-hand), 'Segoe Print', 'Bradley Hand', cursive";
