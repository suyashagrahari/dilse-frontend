// The Will You Be Mine faces. The romantic serif (Playfair Display, roman +
// italic) already comes with the engine (DayRoot mounts --font-vw-serif), so
// this page only adds two self-hosted faces other pages already ship:
//
//   • Great Vibes — the flourish: "mine", their names on the certificate.
//   • Caveat — a warm handwriting: what the sender wrote (the story, the
//     reasons, the letter, the promise).
//
// next/font/local, swap so a first visit never shows blank text, and only
// downloaded where this page renders. UI text stays Fredoka (the engine's).
import localFont from "next/font/local";

export const wyScript = localFont({
  src: [{ path: "../../../../../assets/fonts/great-vibes-400-normal.woff2", weight: "400", style: "normal" }],
  variable: "--font-wy-script",
  display: "swap",
  preload: false,
});

export const WY_SCRIPT = "var(--font-wy-script), var(--font-vw-script, 'Dancing Script'), 'Segoe Script', cursive";

export const wyHand = localFont({
  src: [
    { path: "../../../../../assets/fonts/caveat-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../../../../../assets/fonts/caveat-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-wy-hand",
  display: "swap",
  preload: false,
});

export const WY_HAND = "var(--font-wy-hand), 'Segoe Print', 'Bradley Hand', cursive";

/** The romantic serif headings (the engine's Playfair). */
export const WY_SERIF = "var(--font-vw-serif, 'Playfair Display'), 'Cormorant Garamond', Georgia, serif";
