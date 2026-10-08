// happy-hug-day-premium — "Hold Me for 20 Seconds" (the ✦ Premium twin of happy-hug-day).
//
// OWNED BY THIS DAY'S BUILDER. Starts as the $2 config + the premium limits
// (see ./_premium.ts). Refine the extras here AND in
// server/src/config/premiumDays/happy-hug-day-premium.ts (same keys + limits), and the AI
// fields in server/src/config/aiFill/happy-hug-day-premium.ts.

import type { DayConfig, GifSlot } from "../types";
import { premiumDay } from "./_premium";
import { hugDay, type HugExtras } from "./happy-hug-day";

export type HugExtrasPremium = HugExtras;

const GIFS: GifSlot[] = [
  { id: "ph1-window", label: "Window", moment: "Peeking at the frosted window's corner", file: "ph1-window.gif", emoji: "", anim: "wiggle" },
  { id: "ph2-walk", label: "Walk", moment: "Over the snow field as the figures meet", file: "ph2-walk.gif", emoji: "", anim: "bounce" },
  { id: "ph3-held", label: "Held", moment: "After \"Hug delivered\"", file: "ph3-held.gif", emoji: "", anim: "pulse" },
  { id: "ph4-mitten", label: "Mitten", moment: "Beside the mitten pockets", file: "ph4-mitten.gif", emoji: "", anim: "float" },
  { id: "ph5-fort", label: "Fort", moment: "Peeking from the blanket fort", file: "ph5-fort.gif", emoji: "", anim: "spin" },
  { id: "ph6-back", label: "Back", moment: "Finale, hug-back", file: "ph6-back.gif", emoji: "", anim: "pulse" },
];

export const hugDayPremium: DayConfig<HugExtrasPremium> = premiumDay<HugExtrasPremium>(hugDay, {
  slug: "happy-hug-day-premium",
  title: "Hold Me for 20 Seconds",
  gifSlots: GIFS,
  demoPremium: {
    voiceCaption: "Twenty seconds. That's all I'm asking. Okay, maybe forty.",
    psLetter: "Open only on a bad day: this one counts as a hug. Hold the screen.",
  },
});
