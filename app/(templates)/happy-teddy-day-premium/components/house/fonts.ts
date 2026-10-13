// The Teddy House's three faces (research §C2 pairing 5, "playful kids' book"),
// self-hosted by next/font (swap, not preloaded; only downloaded where this page renders):
//   • Grandstander — round, bouncy headings
//   • Patrick Hand — handwriting: names, captions, his speech bubbles, the letter
//   • Nunito — everything people read in the UI
import localFont from "next/font/local";

export const thDisplay = localFont({
  src: [
    { path: "../../../../../assets/fonts/grandstander-700-normal.woff2", weight: "700", style: "normal" },
    { path: "../../../../../assets/fonts/grandstander-800-normal.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-th-display", display: "swap", preload: false });
export const thHand = localFont({
  src: [
    { path: "../../../../../assets/fonts/patrick-hand-400-normal.woff2", weight: "400", style: "normal" },
  ],
  variable: "--font-th-hand", display: "swap", preload: false });
export const thBody = localFont({
  src: [
    { path: "../../../../../assets/fonts/nunito-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../../../../../assets/fonts/nunito-700-normal.woff2", weight: "700", style: "normal" },
    { path: "../../../../../assets/fonts/nunito-800-normal.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-th-body", display: "swap", preload: false });

export const TH_FONT_VARS = `${thDisplay.variable} ${thHand.variable} ${thBody.variable}`;

export const DISPLAY = "var(--font-th-display), Grandstander, 'Comic Neue', system-ui, sans-serif";
export const HAND = "var(--font-th-hand), 'Patrick Hand', cursive";
export const BODY = "var(--font-th-body), Nunito, system-ui, sans-serif";
