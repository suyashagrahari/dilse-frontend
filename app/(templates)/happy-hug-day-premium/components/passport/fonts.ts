// "The Hug Passport" type: Fredoka (the app-wide rounded face, --font-fredoka) for headings, UI and stamps; Caveat for
// everything handwritten (names, captions, his lines); Patrick Hand for the letter body (a legible handwriting at
// 19px). Both are self-hosted by next/font.
import { Caveat, Patrick_Hand } from "next/font/google";

const hand = Caveat({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--hp-hand", display: "swap", preload: false });
const letter = Patrick_Hand({ subsets: ["latin"], weight: "400", variable: "--hp-letter", display: "swap", preload: false });

export const PASSPORT_FONT_VARS = `${hand.variable} ${letter.variable}`;
