// The "After the Rain" faces, self-hosted (next/font/google is lint-banned).
// All three files already ship with the site, so nothing new is downloaded
// for the build — only fetched where this page renders.
//
//   • Baloo 2 — round, soft, friendly: headings, the pill, the treaty.
//   • Shantell Sans — a warm marker hand: everything the sender wrote.
//   • Dancing Script — the signatures on the contract and the treaty.
import localFont from "next/font/local";

export const spDisplay = localFont({
  src: [
    { path: "../../../../../assets/fonts/baloo-2-700-normal.woff2", weight: "700", style: "normal" },
    { path: "../../../../../assets/fonts/baloo-2-800-normal.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-sp-display",
  display: "swap",
  preload: false,
});

export const SP_DISPLAY = "var(--font-sp-display), var(--font-fredoka), 'Fredoka', system-ui, sans-serif";

export const spHand = localFont({
  src: [
    { path: "../../../../../assets/fonts/shantell-sans-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../../../../assets/fonts/shantell-sans-600-normal.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-sp-hand",
  display: "swap",
  preload: false,
});

export const SP_HAND = "var(--font-sp-hand), 'Segoe Print', 'Bradley Hand', cursive";

export const spSign = localFont({
  src: [{ path: "../../../../../assets/fonts/dancing-script-700-normal.woff2", weight: "700", style: "normal" }],
  variable: "--font-sp-sign",
  display: "swap",
  preload: false,
});

export const SP_SIGN = "var(--font-sp-sign), 'Segoe Script', cursive";
