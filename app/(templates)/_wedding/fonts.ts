// ─── Wedding kit typography (self-hosted; next/font/google is lint-banned) ──
//
//   display  Cormorant Garamond — the invitation's voice (headings, body copy)
//   caps     Cinzel             — engraved small caps (eyebrows, dates, labels)
//   script   Great Vibes        — the couple's names, signatures
//   sans     DM Sans            — UI, forms, buttons
//   deva     Tiro Devanagari Hindi — every stack falls back to it, so Hindi
//            text (names, shlokas, the invitation) renders in a matching
//            serif instead of the system's default Devanagari.
//   guru     Tiro Gurmukhi      — Punjabi (the Anand Karaj invitation), Tiro's sister face
//   urdu     Noto Nastaliq Urdu — Urdu (the Nikah invitation), set right-to-left
//   tamil / telugu / kannada   Tiro Tamil, Telugu, Kannada — the South Indian weddings, Tiro's sister faces
//   malayalam                  Noto Serif Malayalam (Tiro has no Malayalam)
//   marathi  Tiro Devanagari Marathi — Marathi's own letterforms (ळ, श…); set only on [lang="mr"]
//
// All `display: "swap"` + `preload: false`: a template-scoped face must paint
// on a first, uncached visit (see _valentine/fonts.ts for the reasoning), and
// only pages that mount WEDDING_FONT_VARS download them.
import localFont from "next/font/local";

export const wkDisplay = localFont({
  src: [
    { path: "../../../assets/fonts/cormorant-garamond-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../../assets/fonts/cormorant-garamond-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../../../assets/fonts/cormorant-garamond-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../../../assets/fonts/cormorant-garamond-700-normal.woff2", weight: "700", style: "normal" },
    { path: "../../../assets/fonts/cormorant-garamond-400-italic.woff2", weight: "400", style: "italic" },
    { path: "../../../assets/fonts/cormorant-garamond-500-italic.woff2", weight: "500", style: "italic" },
    { path: "../../../assets/fonts/cormorant-garamond-600-italic.woff2", weight: "600", style: "italic" },
  ],
  variable: "--font-wk-display",
  adjustFontFallback: "Times New Roman",
  display: "swap",
  preload: false,
});

export const wkCaps = localFont({
  src: [
    { path: "../../../assets/fonts/cinzel-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../../assets/fonts/cinzel-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../../../assets/fonts/cinzel-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-wk-caps",
  adjustFontFallback: "Times New Roman",
  display: "swap",
  preload: false,
});

export const wkScript = localFont({
  src: [{ path: "../../../assets/fonts/great-vibes-400-normal.woff2", weight: "400", style: "normal" }],
  variable: "--font-wk-script",
  adjustFontFallback: false,
  display: "swap",
  preload: false,
});

export const wkSans = localFont({
  src: [
    { path: "../../../assets/fonts/dm-sans-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../../assets/fonts/dm-sans-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../../../assets/fonts/dm-sans-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-wk-sans",
  adjustFontFallback: "Arial",
  display: "swap",
  preload: false,
});

export const wkDeva = localFont({
  src: [
    { path: "../../../assets/fonts/tiro-devanagari-hindi-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../../assets/fonts/tiro-devanagari-hindi-400-italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-wk-deva",
  adjustFontFallback: false,
  display: "swap",
  preload: false,
});

export const wkGuru = localFont({
  src: [
    { path: "../../../assets/fonts/tiro-gurmukhi-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../../assets/fonts/tiro-gurmukhi-400-italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-wk-guru",
  adjustFontFallback: false,
  display: "swap",
  preload: false,
});

export const wkUrdu = localFont({
  src: [
    { path: "../../../assets/fonts/noto-nastaliq-urdu-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../../assets/fonts/noto-nastaliq-urdu-600-normal.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-wk-urdu",
  adjustFontFallback: false,
  display: "swap",
  preload: false,
});

export const wkTamil = localFont({
  src: [
    { path: "../../../assets/fonts/tiro-tamil-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../../assets/fonts/tiro-tamil-400-italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-wk-tamil",
  adjustFontFallback: false,
  display: "swap",
  preload: false,
});

export const wkTelugu = localFont({
  src: [
    { path: "../../../assets/fonts/tiro-telugu-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../../assets/fonts/tiro-telugu-400-italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-wk-telugu",
  adjustFontFallback: false,
  display: "swap",
  preload: false,
});

export const wkKannada = localFont({
  src: [
    { path: "../../../assets/fonts/tiro-kannada-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../../assets/fonts/tiro-kannada-400-italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-wk-kannada",
  adjustFontFallback: false,
  display: "swap",
  preload: false,
});

export const wkMalayalam = localFont({
  src: [
    { path: "../../../assets/fonts/noto-serif-malayalam-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../../assets/fonts/noto-serif-malayalam-600-normal.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-wk-malayalam",
  adjustFontFallback: false,
  display: "swap",
  preload: false,
});

export const wkMarathi = localFont({
  src: [
    { path: "../../../assets/fonts/tiro-devanagari-marathi-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../../assets/fonts/tiro-devanagari-marathi-400-italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-wk-marathi",
  adjustFontFallback: false,
  display: "swap",
  preload: false,
});

/** className that defines every --font-wk-* variable. WeddingRoot mounts it; editors that render kit pieces outside one should too. */
export const WEDDING_FONT_VARS = [wkDisplay, wkCaps, wkScript, wkSans, wkDeva, wkGuru, wkUrdu, wkTamil, wkTelugu, wkKannada, wkMalayalam, wkMarathi].map((f) => f.variable).join(" ");
