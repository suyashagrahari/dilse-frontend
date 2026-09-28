// The one face this template adds: a pixel font for slot codes, card rarity
// and the receipt printer's labels. Self-hosted by next/font and applied as a
// CSS variable on the template root (see PIXEL in machine.ts).
import { Silkscreen } from "next/font/google";

export const pixel = Silkscreen({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-vm-pixel",
  display: "swap",
});

export const VM_FONT_VARS = pixel.variable;
