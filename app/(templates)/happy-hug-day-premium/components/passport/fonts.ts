// "The Hug Passport" type: Fredoka (the app-wide rounded face, --font-fredoka) for headings, UI and stamps; Caveat for
// everything handwritten (names, captions, his lines); Patrick Hand for the letter body (a legible handwriting at
// 19px). Both are self-hosted by next/font.
import localFont from "next/font/local";

const hand = localFont({
  src: [
    { path: "../../../../../assets/fonts/caveat-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../../../../../assets/fonts/caveat-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../../../../../assets/fonts/caveat-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--hp-hand", display: "swap", preload: false });
const letter = localFont({
  src: [
    { path: "../../../../../assets/fonts/patrick-hand-400-normal.woff2", weight: "400", style: "normal" },
  ],
  variable: "--hp-letter", display: "swap", preload: false });

export const PASSPORT_FONT_VARS = `${hand.variable} ${letter.variable}`;
