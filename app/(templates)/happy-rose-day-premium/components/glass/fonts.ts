// "The Glasshouse Rose" type: an elegant high-contrast serif for titles, the letter and the engraving (Cormorant
// Garamond). Names and the sign-off use the engine's script; UI stays on the engine's sans. next/font, swap.
import { Cormorant_Garamond } from "next/font/google";

const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"], style: ["normal", "italic"], variable: "--gh-serif", display: "swap", preload: false });

export const GLASS_FONT_VARS = cormorant.variable;
