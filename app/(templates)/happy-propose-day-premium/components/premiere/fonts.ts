// "The Premiere" type: two families only.
//  · Bodoni Moda (display): title cards, the question, names. High-contrast didone = film-poster glamour;
//    the variable opsz axis keeps hairlines crisp at 120 px and readable at 20 px.
//  · Courier Prime (everything else): subtitles, the slate/chapter labels, the screenplay page, buttons.
//    It is the screenwriter's typeface, so the UI itself reads as "on set".
// Self-hosted by next/font, display: swap, downloaded only where this template renders.
import { Bodoni_Moda, Courier_Prime } from "next/font/google";

const bodoni = Bodoni_Moda({ subsets: ["latin"], style: ["normal", "italic"], axes: ["opsz"], variable: "--pr-display", display: "swap", preload: false });
const courier = Courier_Prime({ subsets: ["latin"], weight: ["400", "700"], style: ["normal", "italic"], variable: "--pr-mono", display: "swap", preload: false });

export const PREMIERE_FONT_VARS = `${bodoni.variable} ${courier.variable}`;
