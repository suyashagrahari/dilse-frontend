// happy-chocolate-day-premium — "The Midnight Chocolatier" (the ✦ Premium twin of happy-chocolate-day).
//
// OWNED BY THIS DAY'S BUILDER. Starts as the $2 config + the premium limits
// (see ./_premium.ts). Refine the extras here AND in
// server/src/config/premiumDays/happy-chocolate-day-premium.ts (same keys + limits), and the AI
// fields in server/src/config/aiFill/happy-chocolate-day-premium.ts.

import type { DayConfig, GifSlot } from "../types";
import { premiumDay } from "./_premium";
import { chocolateDay, type ChocolateExtras } from "./happy-chocolate-day";

export type ChocolateExtrasPremium = ChocolateExtras;

const GIFS: GifSlot[] = [
  { id: "pc1-open", label: "Open", moment: "Lights on", file: "pc1-open.gif", emoji: "", anim: "wiggle" },
  { id: "pc2-smash", label: "Smash", moment: "Right after the shatter", file: "pc2-smash.gif", emoji: "", anim: "bounce" },
  { id: "pc3-yum", label: "Yum", moment: "All truffles tasted", file: "pc3-yum.gif", emoji: "", anim: "pulse" },
  { id: "pc4-ticket", label: "Ticket", moment: "Golden ticket revealed", file: "pc4-ticket.gif", emoji: "", anim: "float" },
  { id: "pc5-photos", label: "Photos", moment: "Display case heading", file: "pc5-photos.gif", emoji: "", anim: "spin" },
  { id: "pc6-box", label: "Box", moment: "Box tied, ending", file: "pc6-box.gif", emoji: "", anim: "pulse" },
];

export const chocolateDayPremium: DayConfig<ChocolateExtrasPremium> = premiumDay<ChocolateExtrasPremium>(chocolateDay, {
  slug: "happy-chocolate-day-premium",
  title: "The Midnight Chocolatier",
  gifSlots: GIFS,
  demoPremium: {
    voiceCaption: "The kitchen is closed. Except for you.",
    psLetter: "Open only if you are hungry: the last truffle is in my bag. Come get it.",
  },
});
