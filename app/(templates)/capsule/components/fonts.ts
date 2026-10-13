// Handwriting for the backs of the keepsakes. Self-hosted by next/font and
// applied as a CSS variable on the template root, next to the love kit's
// Bricolage Grotesque + Instrument Serif.
import localFont from "next/font/local";

export const capsuleHand = localFont({
  src: [
    { path: "../../../../assets/fonts/caveat-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../../../../assets/fonts/caveat-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-cp-hand",
  display: "swap",
});
