// The Anniversary ✦ Premium faces, all self-hosted (next/font/google is
// lint-banned) and only downloaded where this page renders:
//
//   • Cormorant Garamond — the storybook serif: titles, chapter numbers, the
//     book, the certificate. Wedding-stationery elegance.
//   • Great Vibes — the calligraphy: their names, signatures.
//   • Caveat — the sender's own handwriting: notes, captions, promises.
//   • Figtree — small UI text (kickers, hints, numbers).
import localFont from "next/font/local";

export const apSerif = localFont({
  src: [
    { path: "../../../../../assets/fonts/cormorant-garamond-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../../../../../assets/fonts/cormorant-garamond-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../../../../../assets/fonts/cormorant-garamond-700-normal.woff2", weight: "700", style: "normal" },
    { path: "../../../../../assets/fonts/cormorant-garamond-500-italic.woff2", weight: "500", style: "italic" },
  ],
  variable: "--font-ap-serif",
  display: "swap",
  preload: false,
});
export const AP_SERIF = "var(--font-ap-serif), 'Cormorant Garamond', Georgia, serif";

export const apScript = localFont({
  src: [{ path: "../../../../../assets/fonts/great-vibes-400-normal.woff2", weight: "400", style: "normal" }],
  variable: "--font-ap-script",
  display: "swap",
  preload: false,
});
export const AP_SCRIPT = "var(--font-ap-script), 'Great Vibes', 'Segoe Script', cursive";

export const apHand = localFont({
  src: [
    { path: "../../../../../assets/fonts/caveat-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../../../../../assets/fonts/caveat-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-ap-hand",
  display: "swap",
  preload: false,
});
export const AP_HAND = "var(--font-ap-hand), 'Caveat', 'Bradley Hand', cursive";

export const apSans = localFont({
  src: [
    { path: "../../../../../assets/fonts/figtree-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../../../../../assets/fonts/figtree-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../../../../../assets/fonts/figtree-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-ap-sans",
  display: "swap",
  preload: false,
});
export const AP_SANS = "var(--font-ap-sans), 'Figtree', system-ui, -apple-system, sans-serif";
