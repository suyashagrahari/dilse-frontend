// The one face this template adds: a pixel font for slot codes, card rarity
// and the receipt printer's labels. Self-hosted by next/font and applied as a
// CSS variable on the template root (see PIXEL in machine.ts).
import localFont from "next/font/local";

export const pixel = localFont({
  src: [
    { path: "../../../../assets/fonts/silkscreen-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../../../assets/fonts/silkscreen-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-vm-pixel",
  display: "swap",
});

export const VM_FONT_VARS = pixel.variable;
