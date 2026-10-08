// happy-propose-day-premium — "Look Up" (the ✦ Premium twin of happy-propose-day).
//
// OWNED BY THIS DAY'S BUILDER. Starts as the $2 config + the premium limits
// (see ./_premium.ts). Refine the extras here AND in
// server/src/config/premiumDays/happy-propose-day-premium.ts (same keys + limits), and the AI
// fields in server/src/config/aiFill/happy-propose-day-premium.ts.

import type { DayConfig, GifSlot } from "../types";
import { premiumDay } from "./_premium";
import { proposeDay, type ProposeExtras } from "./happy-propose-day";

export type ProposeExtrasPremium = ProposeExtras;

const GIFS: GifSlot[] = [
  { id: "pp1-nervous", label: "Nervous", moment: "Cold-open chat, as a \"sticker\" message", file: "pp1-nervous.gif", emoji: "", anim: "wiggle" },
  { id: "pp2-candles", label: "Candles", moment: "After the last candle", file: "pp2-candles.gif", emoji: "", anim: "bounce" },
  { id: "pp3-lookup", label: "Lookup", moment: "Bottom of \"Look up.\" (shown after the show)", file: "pp3-lookup.gif", emoji: "", anim: "pulse" },
  { id: "pp4-please", label: "Please", moment: "After 3 dodges of \"Let me think\"", file: "pp4-please.gif", emoji: "", anim: "float" },
  { id: "pp5-yes", label: "Yes", moment: "SAID YES", file: "pp5-yes.gif", emoji: "", anim: "spin" },
  { id: "pp6-ticket", label: "Ticket", moment: "Ticket keepsake", file: "pp6-ticket.gif", emoji: "", anim: "pulse" },
];

export const proposeDayPremium: DayConfig<ProposeExtrasPremium> = premiumDay<ProposeExtrasPremium>(proposeDay, {
  slug: "happy-propose-day-premium",
  title: "Look Up",
  gifSlots: GIFS,
  demoPremium: {
    voiceCaption: "I asked the sky to help me ask you.",
    psLetter: "Open only if you said yes: I had a backup speech. It was terrible.",
  },
});
