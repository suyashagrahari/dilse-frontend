// Template-scoped faces with display:"swap". The app-wide Dancing Script and
// Playfair (app/layout) are display:"optional" for the landing's LCP, which
// means a first, uncached visit may never paint them — fine for a hero, wrong
// for a love letter whose whole look is the script. These are self-hosted by
// next/font, only downloaded where a Valentine page renders them, and mounted
// as CSS variables by DayRoot / EditSheet (`VW_FONT_VARS`).
import { Dancing_Script, Playfair_Display } from "next/font/google";

export const vwScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-vw-script",
  display: "swap",
  preload: false,
});

export const vwSerif = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-vw-serif",
  display: "swap",
  preload: false,
});

/** className that defines both variables on an element. */
export const VW_FONT_VARS = `${vwScript.variable} ${vwSerif.variable}`;
