// Faces for the watch page, self-hosted by next/font so they are ready before
// first paint. Roboto is the grammar of a video watch page; Instrument Serif is
// the one place the page stops joking (the description outro, the letter).
import { Instrument_Serif, Roboto } from "next/font/google";

export const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-wt-roboto",
  display: "swap",
});

export const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-di-serif",
  display: "swap",
});

export const WATCH_FONT_VARS = `${roboto.variable} ${instrumentSerif.variable}`;
