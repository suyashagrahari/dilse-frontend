// "Adoption Papers" type: two families, both self-hosted by next/font with display:swap.
//   DM Serif Display: the certificate, headlines, names, the letter (it is letterpress-shaped at every size).
//   Nunito Sans: every piece of UI (eyebrows, buttons, hints, typed form fields).
// The root also points the shell's serif/script/UI variables at these two, so the kit's CTA, ReplyBox,
// EndingActions and the canvas keepsake all set in the same two faces (KIT-REQUESTS: the kit loads neither).
import { DM_Serif_Display, Nunito_Sans } from "next/font/google";

const serif = DM_Serif_Display({ subsets: ["latin"], weight: ["400"], style: ["normal", "italic"], variable: "--ap-serif", display: "swap", preload: false });
const sans = Nunito_Sans({ subsets: ["latin"], weight: ["400", "600", "700", "800"], variable: "--ap-sans", display: "swap", preload: false });

export const PAPERS_FONT_VARS = `${serif.variable} ${sans.variable}`;

/** Inline vars for the DayRoot: the shell + kit + canvas faces resolve to ours. */
export const PAPERS_FONT_STYLE = {
  ["--font-vw-serif" as string]: "var(--ap-serif)",
  ["--font-vw-script" as string]: "var(--ap-serif)",
  ["--font-fredoka" as string]: "var(--ap-sans)",
  ["--font-vw-ui" as string]: "var(--ap-sans)",
  ["--vw-font-ui" as string]: "var(--ap-sans), system-ui, sans-serif",
  fontFamily: "var(--ap-sans), system-ui, sans-serif",
};
