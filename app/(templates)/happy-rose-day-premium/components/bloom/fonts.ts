// "The Bloom of Us" type: two families, both self-hosted by next/font with display:swap.
//   Cormorant Garamond: display (italic for emphasis), the letter, captions.
//   Jost: every piece of UI (eyebrows, buttons, hints). The kit's CTA reads --font-vw-ui, so it picks Jost up too.
import { Cormorant_Garamond, Jost } from "next/font/google";

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"], style: ["normal", "italic"], variable: "--rb-serif", display: "swap", preload: false });
const sans = Jost({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--rb-sans", display: "swap", preload: false });

export const BLOOM_FONT_VARS = `${serif.variable} ${sans.variable}`;
