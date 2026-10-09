// "The Twenty-Second Hug" type (research §D.6): two families, self-hosted by next/font (swap, not preloaded, only
// downloaded where this page renders).
//   Instrument Serif  display + letter: the big words, the lines during the hug, captions (italic for warmth).
//   DM Sans           every piece of UI: eyebrows, buttons, the seconds. The kit names DM Sans but never loads it
//                     (KIT-REQUESTS.md), so the root sets --font-vw-ui to this variable and kit CTAs pick it up.
import { DM_Sans, Instrument_Serif } from "next/font/google";

const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--hh-serif", display: "swap", preload: false });
const sans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--hh-sans", display: "swap", preload: false });

export const HUG_FONT_VARS = `${serif.variable} ${sans.variable}`;
export const SERIF = "var(--hh-serif), 'Instrument Serif', Georgia, serif";
export const SANS = "var(--hh-sans), 'DM Sans', system-ui, sans-serif";
