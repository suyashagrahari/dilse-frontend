// "A Thousand Kisses" faces, self-hosted by next/font (swap, not preloaded,
// only downloaded where this page renders): Caveat is the lipstick-on-the-
// mirror hand. Titles use the engine's Playfair (italic), names its script.
import { Caveat } from "next/font/google";

export const kdHand = Caveat({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-kd-hand", display: "swap", preload: false });

export const KD_FONT_VARS = kdHand.variable;
export const HAND = "var(--font-kd-hand), 'Caveat', 'Segoe Script', cursive";
export const SERIF = "var(--font-vw-serif, 'Playfair Display'), Georgia, serif";
export const SCRIPT = "var(--font-vw-script, 'Dancing Script'), 'Segoe Script', cursive";
