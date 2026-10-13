// Boo-tiful Night's three faces (research §C2 pairing 2), self-hosted by
// next/font (swap, not preloaded; only downloaded where this page renders):
//   • Chewy — round, bubbly headings (kept from the $2 haunted house)
//   • Gochi Hand — handwriting: names, captions, sticky notes, the signature
//   • Nunito — everything people read: UI, lines, the letter
import localFont from "next/font/local";

export const bnDisplay = localFont({
  src: [
    { path: "../../../../../assets/fonts/chewy-400-normal.woff2", weight: "400", style: "normal" },
  ],
  variable: "--font-bn-display", display: "swap", preload: false });
export const bnHand = localFont({
  src: [
    { path: "../../../../../assets/fonts/gochi-hand-400-normal.woff2", weight: "400", style: "normal" },
  ],
  variable: "--font-bn-hand", display: "swap", preload: false });
export const bnBody = localFont({
  src: [
    { path: "../../../../../assets/fonts/nunito-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../../../../../assets/fonts/nunito-700-normal.woff2", weight: "700", style: "normal" },
    { path: "../../../../../assets/fonts/nunito-800-normal.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-bn-body", display: "swap", preload: false });

export const BN_FONT_VARS = `${bnDisplay.variable} ${bnHand.variable} ${bnBody.variable}`;

export const DISPLAY = "var(--font-bn-display), Chewy, 'Comic Neue', system-ui, sans-serif";
export const HAND = "var(--font-bn-hand), 'Gochi Hand', cursive";
export const BODY = "var(--font-bn-body), Nunito, system-ui, sans-serif";
