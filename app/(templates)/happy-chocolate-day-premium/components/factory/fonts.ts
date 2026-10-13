// "The Sweetheart Chocolate Factory" type (research §C2 pairing 3, candy-sweet): Sour Gummy for the short candy
// headings, Quicksand for everything you read, and the kit's Dancing Script (--font-vw-script, mounted by DayRoot)
// for names and captions. Self-hosted by next/font, display: swap, only downloaded where this template renders.
import localFont from "next/font/local";

const gummy = localFont({
  src: [
    { path: "../../../../../assets/fonts/sour-gummy-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../../../../../assets/fonts/sour-gummy-800-normal.woff2", weight: "800", style: "normal" },
  ],
  variable: "--sf-gummy", display: "swap", preload: false });
const quick = localFont({
  src: [
    { path: "../../../../../assets/fonts/quicksand-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../../../../../assets/fonts/quicksand-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../../../../../assets/fonts/quicksand-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--sf-ui", display: "swap", preload: false });

export const FACTORY_FONT_VARS = `${gummy.variable} ${quick.variable}`;
