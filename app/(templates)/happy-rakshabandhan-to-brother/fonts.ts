import { Fraunces, Tiro_Devanagari_Hindi, Kalam, Inter } from "next/font/google";

// ─── Typefaces ───────────────────────────────────────────────────────────────
//
// Declared HERE rather than in layout.tsx because this template renders on two
// different routes and only one of them has that layout:
//
//   /happy-rakshabandhan-to-brother   the builder — wrapped by layout.tsx
//   /[id]                             the SHARED page — a different route tree
//
// The shared page is the one her brother actually opens, and it is the whole
// point of the template. With the fonts scoped to the builder's layout, every
// `var(--font-rb-*)` on his side resolved to nothing and the entire ritual fell
// back to Georgia and a system cursive — including the Devanagari shloka, which
// would render in whatever the device happened to have.
//
// So both entry points import `RAKHI_FONT_VARS` and apply it to their root.
// next/font dedupes at build time, so the faces are downloaded once.
//
// display:"swap" and NOT "optional" on the three display faces — "optional"
// permits the browser to decline the face outright, and a declined Devanagari
// face means either a mismatched script or tofu on the one line that must be
// right. It also matters for the PNG export, which awaits `document.fonts.ready`
// before capturing.

const display = Fraunces({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-rb-display",
  display: "swap",
});

/** 400 is the only weight this family ships. */
const devanagari = Tiro_Devanagari_Hindi({
  subsets: ["devanagari", "latin"],
  weight: "400",
  variable: "--font-rb-deva",
  display: "swap",
});

/**
 * Polaroid captions and the promise. Covers both scripts, so a Hindi caption
 * does not fall out of the handwriting into a system face mid-sentence.
 */
const hand = Kalam({
  subsets: ["devanagari", "latin"],
  weight: ["400", "700"],
  variable: "--font-rb-hand",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "optional",
});

/** Apply to the root of every tree that renders this template. */
export const RAKHI_FONT_VARS = `${display.variable} ${devanagari.variable} ${hand.variable} ${inter.variable}`;
