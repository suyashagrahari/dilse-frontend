// "Photo Booth" faces, self-hosted by next/font (swap, not preloaded, only
// downloaded where this page renders). Two families, no more:
//   Gloock      the display serif (names, headlines, the big countdown)
//   Space Mono  everything the machine prints: labels, buttons, the receipt,
//               the date stamp on the strip.
import { Gloock, Space_Mono } from "next/font/google";

const gloock = Gloock({ subsets: ["latin"], weight: "400", variable: "--font-pb-display", display: "swap", preload: false });
const mono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-pb-mono", display: "swap", preload: false });

export const PB_FONT_VARS = `${gloock.variable} ${mono.variable}`;
export const DISPLAY = "var(--font-pb-display), 'Gloock', Georgia, serif";
export const MONO = "var(--font-pb-mono), 'Space Mono', ui-monospace, Menlo, monospace";
