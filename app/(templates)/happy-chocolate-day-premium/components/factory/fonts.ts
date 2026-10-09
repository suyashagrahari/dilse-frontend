// "The Sweetheart Chocolate Factory" type (research §C2 pairing 3, candy-sweet): Sour Gummy for the short candy
// headings, Quicksand for everything you read, and the kit's Dancing Script (--font-vw-script, mounted by DayRoot)
// for names and captions. Self-hosted by next/font, display: swap, only downloaded where this template renders.
import { Quicksand, Sour_Gummy } from "next/font/google";

const gummy = Sour_Gummy({ subsets: ["latin"], weight: ["600", "800"], variable: "--sf-gummy", display: "swap", preload: false });
const quick = Quicksand({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--sf-ui", display: "swap", preload: false });

export const FACTORY_FONT_VARS = `${gummy.variable} ${quick.variable}`;
