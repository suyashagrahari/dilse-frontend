// Handwriting for polaroid captions and the sign-off. Self-hosted by next/font
// and applied as a CSS variable on the template root.
import { Caveat } from "next/font/google";

export const catchHand = Caveat({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-ct-hand",
  display: "swap",
  preload: false,
});
