// Handwriting for polaroid captions and the sign-off. Self-hosted by next/font
// and applied as a CSS variable on the template root.
import localFont from "next/font/local";

export const catchHand = localFont({
  src: [
    { path: "../../../../assets/fonts/caveat-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../../../../assets/fonts/caveat-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-ct-hand",
  display: "swap",
  preload: false,
});
