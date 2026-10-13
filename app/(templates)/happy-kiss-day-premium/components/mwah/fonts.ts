// "Mwah Booth" faces, self-hosted by next/font (swap, not preloaded, only
// downloaded where this page renders). Three families in all, with the
// shared Fredoka UI face (already in the repo, research §C2 pairing 6):
//   Cherry Bomb One  short, bubbly display words ("Mwah!", "Kiss me?")
//   Shantell Sans    handwriting that stays legible: names, captions, the letter
import localFont from "next/font/local";

const bomb = localFont({
  src: [
    { path: "../../../../../assets/fonts/cherry-bomb-one-400-normal.woff2", weight: "400", style: "normal" },
  ],
  variable: "--font-km-display", display: "swap", preload: false });
const hand = localFont({
  src: [
    { path: "../../../../../assets/fonts/shantell-sans-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../../../../assets/fonts/shantell-sans-600-normal.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-km-hand", display: "swap", preload: false });

export const KM_FONT_VARS = `${bomb.variable} ${hand.variable}`;
export const DISPLAY = "var(--font-km-display), 'Cherry Bomb One', var(--font-fredoka), system-ui, sans-serif";
export const HAND = "var(--font-km-hand), 'Shantell Sans', 'Comic Neue', system-ui, sans-serif";
export const UI = "var(--font-fredoka), 'Fredoka', system-ui, -apple-system, sans-serif";
