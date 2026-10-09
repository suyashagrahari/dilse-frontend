// "Us, Wrapped" type: Bricolage Grotesque for the huge numbers and headlines (variable: weight, width and
// optical size, so the 160 px numerals get the tight display cut), Instrument Serif italic for the emotional
// lines. Two families, self-hosted by next/font, display: swap, only downloaded where this template renders.
import { Bricolage_Grotesque, Instrument_Serif } from "next/font/google";

const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--uw-sans", display: "swap", preload: false, axes: ["opsz", "wdth"] });
const instrument = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--uw-serif", display: "swap", preload: false });

export const WRAPPED_FONT_VARS = `${bricolage.variable} ${instrument.variable}`;

/** Real family names (for the canvas keepsake, which can't read CSS variables). */
export const WRAPPED_FAMILIES = { sans: bricolage.style.fontFamily, serif: instrument.style.fontFamily } as const;

export const F = {
  sans: "var(--uw-sans), 'Helvetica Neue', Arial, sans-serif",
  serif: "var(--uw-serif), Georgia, 'Times New Roman', serif",
} as const;
