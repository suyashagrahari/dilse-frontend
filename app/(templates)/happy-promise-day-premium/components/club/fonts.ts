// "The Pinky Promise Club" type: two families (research v3 §C2, pairing 4, desi-cute and Hinglish-ready).
//  · Baloo 2 (display + UI): round, bouncy headings, buttons and body.
//  · Kalam (handwriting): names, the paper-star promises, sticky notes, the letter. Legible at 18–20px.
// Self-hosted by next/font, display: swap, downloaded only where this template renders.
import { Baloo_2, Kalam } from "next/font/google";

const baloo = Baloo_2({ subsets: ["latin"], weight: ["500", "600", "700", "800"], variable: "--pk-round", display: "swap", preload: false });
const kalam = Kalam({ subsets: ["latin"], weight: ["400", "700"], variable: "--pk-hand", display: "swap", preload: false });

export const CLUB_FONT_VARS = `${baloo.variable} ${kalam.variable}`;
