// "The Rose Garden" type: Fredoka (the app-wide rounded face, --font-fredoka) for headings and UI, and Caveat for
// everything handwritten (names, sticky notes, tags, the letter's sign-off). Caveat is self-hosted by next/font.
import { Caveat } from "next/font/google";

const hand = Caveat({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--rg-hand", display: "swap", preload: false });

export const GARDEN_FONT_VARS = hand.variable;
