// The Proposal faces — all already shipped elsewhere on the site, self-hosted
// (next/font/google is lint-banned), swap so a first visit never shows blank
// text, and only downloaded where this page renders. UI text stays Fredoka.
//
//   • Cormorant Garamond — a fairytale serif for the headings, the invitation
//     and the certificate (italic for the big moments).
//   • Dancing Script — the names, the signature, the engraving.
//   • Kalam — a warm handwriting for what the sender wrote (the letter, the
//     chapters, the petals, the promise).
import localFont from "next/font/local";

export const ppSerif = localFont({
  src: [
    { path: "../../../../../assets/fonts/cormorant-garamond-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../../../../../assets/fonts/cormorant-garamond-700-normal.woff2", weight: "700", style: "normal" },
    { path: "../../../../../assets/fonts/cormorant-garamond-600-italic.woff2", weight: "600", style: "italic" },
  ],
  variable: "--font-pp-serif",
  display: "swap",
  preload: false,
});

export const PP_SERIF = "var(--font-pp-serif), 'Cormorant Garamond', Georgia, serif";

export const ppScript = localFont({
  src: [{ path: "../../../../../assets/fonts/dancing-script-700-normal.woff2", weight: "700", style: "normal" }],
  variable: "--font-pp-script",
  display: "swap",
  preload: false,
});

export const PP_SCRIPT = "var(--font-pp-script), 'Dancing Script', 'Segoe Script', cursive";

export const ppHand = localFont({
  src: [{ path: "../../../../../assets/fonts/kalam-400-normal.woff2", weight: "400", style: "normal" }],
  variable: "--font-pp-hand",
  display: "swap",
  preload: false,
});

export const PP_HAND = "var(--font-pp-hand), 'Segoe Print', 'Bradley Hand', cursive";
