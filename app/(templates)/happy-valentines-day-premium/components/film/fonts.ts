// "Our Film" type: a condensed high-contrast display serif for titles (Bodoni Moda), a classic book serif for
// the letter (EB Garamond) and a typewriter for credits and lower-thirds (Courier Prime). Self-hosted by
// next/font, display: swap, only downloaded where this template renders. The script signature uses the
// engine's Dancing Script (--vw-font-script).
import { Bodoni_Moda, Courier_Prime, EB_Garamond } from "next/font/google";

const bodoni = Bodoni_Moda({ subsets: ["latin"], style: ["normal", "italic"], variable: "--fm-display", display: "swap", preload: false });
const garamond = EB_Garamond({ subsets: ["latin"], style: ["normal", "italic"], variable: "--fm-book", display: "swap", preload: false });
const courier = Courier_Prime({ subsets: ["latin"], weight: ["400", "700"], variable: "--fm-type", display: "swap", preload: false });

export const FILM_FONT_VARS = `${bodoni.variable} ${garamond.variable} ${courier.variable}`;

export const F = {
  display: "var(--fm-display), 'Bodoni 72', Didot, 'Playfair Display', Georgia, serif",
  book: "var(--fm-book), Garamond, 'Times New Roman', Georgia, serif",
  type: "var(--fm-type), 'Courier New', Courier, ui-monospace, monospace",
  script: "var(--vw-font-script, 'Dancing Script'), 'Segoe Script', cursive",
  ui: "var(--vw-font-ui, system-ui), system-ui, sans-serif",
} as const;
