// Faces for the watch page, self-hosted by next/font so they are ready before
// first paint. Roboto is the grammar of a video watch page; Instrument Serif is
// the one place the page stops joking (the description outro, the letter).
import localFont from "next/font/local";

export const roboto = localFont({
  src: [
    { path: "../../../../assets/fonts/roboto-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../../../assets/fonts/roboto-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../../../../assets/fonts/roboto-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-wt-roboto",
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

export const WATCH_FONT_VARS = `${roboto.variable} ${instrumentSerif.variable}`;
