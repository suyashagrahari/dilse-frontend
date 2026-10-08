// "Hold Me for 20 Seconds" faces, self-hosted by next/font (swap, not
// preloaded, only downloaded where this page renders): Fraunces (soft, rounded
// serif) for the lines and Caveat for mitten labels and signatures.
import { Caveat, Fraunces } from "next/font/google";

export const hgSoft = Fraunces({ subsets: ["latin"], weight: ["400", "600"], style: ["normal", "italic"], variable: "--font-hg-soft", display: "swap", preload: false });
export const hgHand = Caveat({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-hg-hand", display: "swap", preload: false });

export const HG_FONT_VARS = `${hgSoft.variable} ${hgHand.variable}`;
export const SOFT = "var(--font-hg-soft), 'Fraunces', Georgia, serif";
export const HAND = "var(--font-hg-hand), 'Caveat', 'Segoe Script', cursive";
