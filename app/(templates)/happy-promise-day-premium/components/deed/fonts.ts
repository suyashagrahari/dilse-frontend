// "Signed, Sealed, Promised" faces, self-hosted by next/font (swap, not
// preloaded, only downloaded where this page renders). Two families:
//   EB Garamond    the deed's serif: headlines, names, the letter, the
//                  signatures (italic, drawn in ink).
//   Courier Prime  everything the typewriter types: the promises, labels,
//                  buttons, clause numbers.
import { Courier_Prime, EB_Garamond } from "next/font/google";

const serif = EB_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"], style: ["normal", "italic"], variable: "--font-sp-serif", display: "swap", preload: false });
const type = Courier_Prime({ subsets: ["latin"], weight: ["400", "700"], style: ["normal", "italic"], variable: "--font-sp-type", display: "swap", preload: false });

export const SP_FONT_VARS = `${serif.variable} ${type.variable}`;
export const SERIF = "var(--font-sp-serif), 'EB Garamond', Garamond, Georgia, serif";
export const TYPE = "var(--font-sp-type), 'Courier Prime', 'Courier New', ui-monospace, monospace";
