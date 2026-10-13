// Template-scoped faces with display:"swap". The app-wide Dancing Script and
// Playfair (app/layout) are display:"optional" for the landing's LCP, which
// means a first, uncached visit may never paint them — fine for a hero, wrong
// for a love letter whose whole look is the script. These are self-hosted by
// next/font, only downloaded where a Valentine page renders them, and mounted
// as CSS variables by DayRoot / EditSheet (`VW_FONT_VARS`).
import localFont from "next/font/local";

export const vwScript = localFont({
  src: [
    { path: "../../../assets/fonts/dancing-script-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../../assets/fonts/dancing-script-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-vw-script",
  display: "swap",
  preload: false,
});

export const vwSerif = localFont({
  src: [
    { path: "../../../assets/fonts/playfair-display-400-italic.woff2", weight: "400", style: "italic" },
    { path: "../../../assets/fonts/playfair-display-600-italic.woff2", weight: "600", style: "italic" },
    { path: "../../../assets/fonts/playfair-display-700-italic.woff2", weight: "700", style: "italic" },
    { path: "../../../assets/fonts/playfair-display-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../../assets/fonts/playfair-display-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../../../assets/fonts/playfair-display-700-normal.woff2", weight: "700", style: "normal" },
  ],
  adjustFontFallback: "Times New Roman",
  variable: "--font-vw-serif",
  display: "swap",
  preload: false,
});

/** className that defines both variables on an element. */
export const VW_FONT_VARS = `${vwScript.variable} ${vwSerif.variable}`;
