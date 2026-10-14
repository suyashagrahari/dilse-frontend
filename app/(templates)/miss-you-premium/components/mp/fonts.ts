// Miss You ✦ Premium faces, self-hosted (next/font/google is lint-banned).
//
//   • Grandstander — round, bouncy, sunny: headings, the pill, the postcard.
//   • Kalam — a warm ballpoint hand: everything the sender wrote (voice notes,
//     the letter, the things I miss, the postcard's back).
//
// swap, so a first visit never shows blank text; only downloaded where this
// page renders. UI text stays Fredoka (the engine's).
import localFont from "next/font/local";

export const mpDisplay = localFont({
  src: [
    { path: "../../../../../assets/fonts/grandstander-700-normal.woff2", weight: "700", style: "normal" },
    { path: "../../../../../assets/fonts/grandstander-800-normal.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-mp-display",
  display: "swap",
  preload: false,
});

export const MP_DISPLAY = "var(--font-mp-display), var(--font-fredoka), 'Fredoka', system-ui, sans-serif";

export const mpHand = localFont({
  src: [
    { path: "../../../../../assets/fonts/kalam-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../../../../assets/fonts/kalam-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-mp-hand",
  display: "swap",
  preload: false,
});

export const MP_HAND = "var(--font-mp-hand), 'Segoe Print', 'Bradley Hand', cursive";
