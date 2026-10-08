// "Look Up" type: a modern condensed display face (Oswald) — the drones write in it too — and an elegant serif
// for the letter and the ticket (Cormorant Garamond). The chat uses the phone's own UI font; names use the
// engine's script. Self-hosted by next/font, display: swap, only downloaded where this template renders.
import { Cormorant_Garamond, Oswald } from "next/font/google";

const oswald = Oswald({ subsets: ["latin"], variable: "--sk-display", display: "swap", preload: false });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"], style: ["normal", "italic"], variable: "--sk-serif", display: "swap", preload: false });

export const SKY_FONT_VARS = `${oswald.variable} ${cormorant.variable}`;
