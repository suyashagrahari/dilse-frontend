// "The Rose Garden" type: Fredoka (the app-wide rounded face, --font-fredoka) for headings and UI, and Caveat for
// everything handwritten (names, sticky notes, tags, the letter's sign-off). Caveat is self-hosted by next/font.
import localFont from "next/font/local";

const hand = localFont({
  src: [
    { path: "../../../../../assets/fonts/caveat-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../../../../../assets/fonts/caveat-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../../../../../assets/fonts/caveat-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--rg-hand", display: "swap", preload: false });

export const GARDEN_FONT_VARS = hand.variable;
