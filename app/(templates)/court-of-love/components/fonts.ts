// The Court's own faces, self-hosted by next/font. Shared by the template
// layout, the /[id] viewer (which never sees the template layout) and the
// evidence viewer's portal (which renders outside both).
//
//  - Courier Prime: the typed case file — case numbers, exhibit tags, the docket.
//  - Caveat: the judge's handwriting — testimony signatures, margin notes.
//
// Display serif (Instrument Serif) and the UI grotesk (Bricolage) come from the
// love kit's DATE_FONT_VARS.
import localFont from "next/font/local";

import { DATE_FONT_VARS } from "../../date-invitation/components/fonts";

const courierPrime = localFont({
  src: [
    { path: "../../../../assets/fonts/courier-prime-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../../../assets/fonts/courier-prime-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-court-mono",
  display: "swap",
});

const caveat = localFont({
  src: [
    { path: "../../../../assets/fonts/caveat-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../../../../assets/fonts/caveat-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-caveat",
  display: "swap",
});

export const COURT_FONT_VARS = `${courierPrime.variable} ${caveat.variable} ${DATE_FONT_VARS}`;
