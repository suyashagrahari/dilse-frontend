// Faces for the night-out redesign, self-hosted by next/font so they are ready
// before first paint. Applied as CSS variables on the template root.
import localFont from "next/font/local";

export const grotesk = localFont({
  src: [
    { path: "../../../../assets/fonts/bricolage-grotesque-200-normal.woff2", weight: "200", style: "normal" },
    { path: "../../../../assets/fonts/bricolage-grotesque-300-normal.woff2", weight: "300", style: "normal" },
    { path: "../../../../assets/fonts/bricolage-grotesque-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../../../assets/fonts/bricolage-grotesque-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../../../../assets/fonts/bricolage-grotesque-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../../../../assets/fonts/bricolage-grotesque-700-normal.woff2", weight: "700", style: "normal" },
    { path: "../../../../assets/fonts/bricolage-grotesque-800-normal.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-di-grotesk",
  display: "swap",
});

export const instrumentSerif = localFont({
  src: [
    { path: "../../../../assets/fonts/instrument-serif-400-italic.woff2", weight: "400", style: "italic" },
    { path: "../../../../assets/fonts/instrument-serif-400-normal.woff2", weight: "400", style: "normal" },
  ],
  adjustFontFallback: "Times New Roman",
  variable: "--font-di-serif",
  display: "swap",
});

export const DATE_FONT_VARS = `${grotesk.variable} ${instrumentSerif.variable}`;
