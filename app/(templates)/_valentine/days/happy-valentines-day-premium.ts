// happy-valentines-day-premium — "Our Film" (the ✦ Premium twin of happy-valentines-day).
//
// OWNED BY THIS DAY'S BUILDER. Starts as the $2 config + the premium limits
// (see ./_premium.ts). Refine the extras here AND in
// server/src/config/premiumDays/happy-valentines-day-premium.ts (same keys + limits), and the AI
// fields in server/src/config/aiFill/happy-valentines-day-premium.ts.

import type { DayConfig, GifSlot } from "../types";
import { premiumDay } from "./_premium";
import { valentinesDay, type ValentinesExtras } from "./happy-valentines-day";

export type ValentinesExtrasPremium = ValentinesExtras;

const GIFS: GifSlot[] = [
  { id: "pv1-ticket", label: "Ticket", moment: "Beside the ticket at the gate", file: "pv1-ticket.gif", emoji: "", anim: "wiggle" },
  { id: "pv2-starring", label: "Starring", moment: "Cameo in the \"starring\" title card", file: "pv2-starring.gif", emoji: "", anim: "bounce" },
  { id: "pv3-stars", label: "Stars", moment: "Over the completed constellation", file: "pv3-stars.gif", emoji: "", anim: "pulse" },
  { id: "pv4-please", label: "Please", moment: "Next to YES/No; swaps to a \"please\" pose after each take", file: "pv4-please.gif", emoji: "", anim: "float" },
  { id: "pv5-yes", label: "Yes", moment: "After the colour flood", file: "pv5-yes.gif", emoji: "", anim: "spin" },
  { id: "pv6-credits", label: "Credits", moment: "Waving in the corner of the credits", file: "pv6-credits.gif", emoji: "", anim: "pulse" },
];

export const valentinesDayPremium: DayConfig<ValentinesExtrasPremium> = premiumDay<ValentinesExtrasPremium>(valentinesDay, {
  slug: "happy-valentines-day-premium",
  title: "Our Film",
  gifSlots: GIFS,
  demoPremium: {
    voiceCaption: "Testing, testing\u2026 this is the director speaking.",
    psLetter: "Open only after the credits: there's a sequel. You're in it.",
  },
});
