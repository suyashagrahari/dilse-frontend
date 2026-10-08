// The Midnight Manor's two faces, self-hosted by next/font (swap, not
// preloaded, only downloaded where this page renders):
//   • Cinzel — engraved capitals for the invitation, plaques and the clock;
//   • IM Fell English — an old printed-book face for the letter and the ledger.
// Names stay in the engine's script (Dancing Script), the UI in Fredoka.
// No dripping/"horror" faces: the manor is beautiful, not a slasher.
import { Cinzel, IM_Fell_English } from "next/font/google";

export const mmEngraved = Cinzel({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-mm-engraved",
  display: "swap",
  preload: false,
});

export const mmBook = IM_Fell_English({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-mm-book",
  display: "swap",
  preload: false,
});

export const MM_FONT_VARS = `${mmEngraved.variable} ${mmBook.variable}`;

/** Invitation capitals, plaques, the clock. */
export const ENGRAVED = "var(--font-mm-engraved), 'Cinzel', Georgia, serif";
/** The letter, the ledger, whispered lines. */
export const BOOK = "var(--font-mm-book), 'IM Fell English', Georgia, serif";
/** Names. */
export const SCRIPT = "var(--font-vw-script, 'Dancing Script'), 'Segoe Script', cursive";
