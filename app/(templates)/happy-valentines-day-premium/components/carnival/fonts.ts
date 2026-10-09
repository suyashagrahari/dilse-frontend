// "Be My Valentine Carnival" type (research §C2 pairing 3): Sour Gummy for the short candy headings, Quicksand for
// everything you read, and the kit's Dancing Script (--font-vw-script, mounted by DayRoot) for names and captions.
// Self-hosted by next/font, display: swap, only downloaded where this template renders.
import { Quicksand, Sour_Gummy } from "next/font/google";

const gummy = Sour_Gummy({ subsets: ["latin"], weight: ["600", "800"], variable: "--vc-gummy", display: "swap", preload: false });
const quick = Quicksand({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--vc-ui", display: "swap", preload: false });

export const CARNIVAL_FONT_VARS = `${gummy.variable} ${quick.variable}`;

/** Real family names (for the canvas keepsake, which can't read CSS variables). */
export const CARNIVAL_FAMILIES = { gummy: gummy.style.fontFamily, ui: quick.style.fontFamily } as const;
