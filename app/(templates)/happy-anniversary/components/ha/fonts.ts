// The "Little Love Museum" faces, self-hosted (next/font/google is lint-banned).
// All of these files already ship with the site, so nothing new is downloaded
// for the build — only fetched where this page renders.
//
//   • Cormorant Garamond — the museum's serif: room titles, plaques, the award.
//   • Cinzel — engraved capitals: the ticket, the brass labels, the award rank.
//   • Caveat — a warm hand: the guestbook, the snow-globe notes, the guide.
import localFont from "next/font/local";

export const haDisplay = localFont({
  src: [
    { path: "../../../../../assets/fonts/cormorant-garamond-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../../../../../assets/fonts/cormorant-garamond-700-normal.woff2", weight: "700", style: "normal" },
    { path: "../../../../../assets/fonts/cormorant-garamond-600-italic.woff2", weight: "600", style: "italic" },
  ],
  variable: "--font-ha-display",
  display: "swap",
  preload: false,
});

export const HA_DISPLAY = "var(--font-ha-display), 'Cormorant Garamond', Georgia, serif";

export const haCaps = localFont({
  src: [{ path: "../../../../../assets/fonts/cinzel-700-normal.woff2", weight: "700", style: "normal" }],
  variable: "--font-ha-caps",
  display: "swap",
  preload: false,
});

export const HA_CAPS = "var(--font-ha-caps), 'Cinzel', 'Trajan Pro', Georgia, serif";

export const haHand = localFont({
  src: [
    { path: "../../../../../assets/fonts/caveat-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../../../../../assets/fonts/caveat-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-ha-hand",
  display: "swap",
  preload: false,
});

export const HA_HAND = "var(--font-ha-hand), 'Caveat', 'Segoe Print', 'Bradley Hand', cursive";
