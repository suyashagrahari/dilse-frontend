// "A Night at the Manor" has exactly two faces, self-hosted by next/font (swap,
// not preloaded, only downloaded where this page renders):
//   • IM Fell English SC — old-print small capitals: titles, the talking board,
//     tarot names, plaques. It is the "manor" voice.
//   • Spectral — a calm book serif for everything people read: notes, fortunes,
//     the letter, buttons.
// No "Creepster"-style novelty faces: cute-spooky reads expensive only in
// real book type.
import { IM_Fell_English_SC, Spectral } from "next/font/google";

export const nmDisplay = IM_Fell_English_SC({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-nm-display",
  display: "swap",
  preload: false,
});

export const nmBody = Spectral({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-nm-body",
  display: "swap",
  preload: false,
});

export const NM_FONT_VARS = `${nmDisplay.variable} ${nmBody.variable}`;

/** Titles, the talking board, tarot names, plaques. */
export const DISPLAY = "var(--font-nm-display), 'IM Fell English SC', Georgia, serif";
/** Notes, fortunes, the letter, buttons. */
export const BODY = "var(--font-nm-body), Spectral, Georgia, serif";
