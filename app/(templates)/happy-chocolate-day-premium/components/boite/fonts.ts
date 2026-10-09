// "La Boîte" type (research §D.3): two families, both self-hosted by next/font with display:swap.
//   Fraunces: the soft display serif (optical size + SOFT axes), the letter, the tasting notes, the foil monogram.
//   Manrope: every piece of UI (eyebrows, buttons, hints). The kit's CTA reads --font-vw-ui, so it picks it up too.
import { Fraunces, Manrope } from "next/font/google";

const serif = Fraunces({ subsets: ["latin"], weight: "variable", style: ["normal", "italic"], axes: ["opsz", "SOFT"], variable: "--lb-serif", display: "swap", preload: false });
const sans = Manrope({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--lb-sans", display: "swap", preload: false });

export const BOITE_FONT_VARS = `${serif.variable} ${sans.variable}`;
