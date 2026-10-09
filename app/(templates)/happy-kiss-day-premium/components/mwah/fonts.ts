// "Mwah Booth" faces, self-hosted by next/font (swap, not preloaded, only
// downloaded where this page renders). Three families in all, with the
// shared Fredoka UI face (already in the repo, research §C2 pairing 6):
//   Cherry Bomb One  short, bubbly display words ("Mwah!", "Kiss me?")
//   Shantell Sans    handwriting that stays legible: names, captions, the letter
import { Cherry_Bomb_One, Shantell_Sans } from "next/font/google";

const bomb = Cherry_Bomb_One({ subsets: ["latin"], weight: "400", variable: "--font-km-display", display: "swap", preload: false });
const hand = Shantell_Sans({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-km-hand", display: "swap", preload: false });

export const KM_FONT_VARS = `${bomb.variable} ${hand.variable}`;
export const DISPLAY = "var(--font-km-display), 'Cherry Bomb One', var(--font-fredoka), system-ui, sans-serif";
export const HAND = "var(--font-km-hand), 'Shantell Sans', 'Comic Neue', system-ui, sans-serif";
export const UI = "var(--font-fredoka), 'Fredoka', system-ui, -apple-system, sans-serif";
