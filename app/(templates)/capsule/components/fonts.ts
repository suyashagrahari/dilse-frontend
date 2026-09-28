// Handwriting for the backs of the keepsakes. Self-hosted by next/font and
// applied as a CSS variable on the template root, next to the love kit's
// Bricolage Grotesque + Instrument Serif.
import { Caveat } from "next/font/google";

export const capsuleHand = Caveat({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-cp-hand",
  display: "swap",
});
