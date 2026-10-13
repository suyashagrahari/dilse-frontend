// "Be My Valentine Carnival" type (research §C2 pairing 3): Sour Gummy for the short candy headings, Quicksand for
// everything you read, and the kit's Dancing Script (--font-vw-script, mounted by DayRoot) for names and captions.
// Self-hosted by next/font, display: swap, only downloaded where this template renders.
import localFont from "next/font/local";

const gummy = localFont({
  src: [
    { path: "../../../../../assets/fonts/sour-gummy-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../../../../../assets/fonts/sour-gummy-800-normal.woff2", weight: "800", style: "normal" },
  ],
  variable: "--vc-gummy", display: "swap", preload: false });
const quick = localFont({
  src: [
    { path: "../../../../../assets/fonts/quicksand-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../../../../../assets/fonts/quicksand-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../../../../../assets/fonts/quicksand-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--vc-ui", display: "swap", preload: false });

export const CARNIVAL_FONT_VARS = `${gummy.variable} ${quick.variable}`;

/** Real family names (for the canvas keepsake, which can't read CSS variables). */
export const CARNIVAL_FAMILIES = { gummy: gummy.style.fontFamily, ui: quick.style.fontFamily } as const;
