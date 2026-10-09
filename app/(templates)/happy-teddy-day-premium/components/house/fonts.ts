// The Teddy House's three faces (research §C2 pairing 5, "playful kids' book"),
// self-hosted by next/font (swap, not preloaded; only downloaded where this page renders):
//   • Grandstander — round, bouncy headings
//   • Patrick Hand — handwriting: names, captions, his speech bubbles, the letter
//   • Nunito — everything people read in the UI
import { Grandstander, Nunito, Patrick_Hand } from "next/font/google";

export const thDisplay = Grandstander({ subsets: ["latin"], weight: ["700", "800"], variable: "--font-th-display", display: "swap", preload: false });
export const thHand = Patrick_Hand({ subsets: ["latin"], weight: "400", variable: "--font-th-hand", display: "swap", preload: false });
export const thBody = Nunito({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-th-body", display: "swap", preload: false });

export const TH_FONT_VARS = `${thDisplay.variable} ${thHand.variable} ${thBody.variable}`;

export const DISPLAY = "var(--font-th-display), Grandstander, 'Comic Neue', system-ui, sans-serif";
export const HAND = "var(--font-th-hand), 'Patrick Hand', cursive";
export const BODY = "var(--font-th-body), Nunito, system-ui, sans-serif";
