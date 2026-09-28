// The Court's own faces, self-hosted by next/font. Shared by the template
// layout, the /[id] viewer (which never sees the template layout) and the
// evidence viewer's portal (which renders outside both).
//
//  - Courier Prime: the typed case file — case numbers, exhibit tags, the docket.
//  - Caveat: the judge's handwriting — testimony signatures, margin notes.
//
// Display serif (Instrument Serif) and the UI grotesk (Bricolage) come from the
// love kit's DATE_FONT_VARS.
import { Caveat, Courier_Prime } from "next/font/google";

import { DATE_FONT_VARS } from "../../date-invitation/components/fonts";

const courierPrime = Courier_Prime({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-court-mono",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-caveat",
  display: "swap",
});

export const COURT_FONT_VARS = `${courierPrime.variable} ${caveat.variable} ${DATE_FONT_VARS}`;
