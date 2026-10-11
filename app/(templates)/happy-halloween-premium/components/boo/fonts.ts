// Boo-tiful Night's three faces (research §C2 pairing 2), self-hosted by
// next/font (swap, not preloaded; only downloaded where this page renders):
//   • Chewy — round, bubbly headings (kept from the $2 haunted house)
//   • Gochi Hand — handwriting: names, captions, sticky notes, the signature
//   • Nunito — everything people read: UI, lines, the letter
import { Chewy, Gochi_Hand, Nunito } from "next/font/google";

export const bnDisplay = Chewy({ subsets: ["latin"], weight: "400", variable: "--font-bn-display", display: "swap", preload: false });
export const bnHand = Gochi_Hand({ subsets: ["latin"], weight: "400", variable: "--font-bn-hand", display: "swap", preload: false });
export const bnBody = Nunito({ subsets: ["latin"], weight: ["500", "700", "800"], variable: "--font-bn-body", display: "swap", preload: false });

export const BN_FONT_VARS = `${bnDisplay.variable} ${bnHand.variable} ${bnBody.variable}`;

export const DISPLAY = "var(--font-bn-display), Chewy, 'Comic Neue', system-ui, sans-serif";
export const HAND = "var(--font-bn-hand), 'Gochi Hand', cursive";
export const BODY = "var(--font-bn-body), Nunito, system-ui, sans-serif";
