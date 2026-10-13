// "The Pinky Promise Club" type: two families (research v3 §C2, pairing 4, desi-cute and Hinglish-ready).
//  · Baloo 2 (display + UI): round, bouncy headings, buttons and body.
//  · Kalam (handwriting): names, the paper-star promises, sticky notes, the letter. Legible at 18–20px.
// Self-hosted by next/font, display: swap, downloaded only where this template renders.
import localFont from "next/font/local";

const baloo = localFont({
  src: [
    { path: "../../../../../assets/fonts/baloo-2-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../../../../../assets/fonts/baloo-2-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../../../../../assets/fonts/baloo-2-700-normal.woff2", weight: "700", style: "normal" },
    { path: "../../../../../assets/fonts/baloo-2-800-normal.woff2", weight: "800", style: "normal" },
  ],
  variable: "--pk-round", display: "swap", preload: false });
const kalam = localFont({
  src: [
    { path: "../../../../../assets/fonts/kalam-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../../../../assets/fonts/kalam-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--pk-hand", display: "swap", preload: false });

export const CLUB_FONT_VARS = `${baloo.variable} ${kalam.variable}`;
