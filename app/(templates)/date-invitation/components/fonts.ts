// Faces for the night-out redesign, self-hosted by next/font so they are ready
// before first paint. Applied as CSS variables on the template root.
import { Bricolage_Grotesque, Instrument_Serif } from "next/font/google";

export const grotesk = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-di-grotesk",
  display: "swap",
});

export const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-di-serif",
  display: "swap",
});

export const DATE_FONT_VARS = `${grotesk.variable} ${instrumentSerif.variable}`;
