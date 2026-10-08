// happy-teddy-day-premium — "Made With a Heart" (the ✦ Premium twin of happy-teddy-day).
//
// OWNED BY THIS DAY'S BUILDER. Starts as the $2 config + the premium limits
// (see ./_premium.ts). Refine the extras here AND in
// server/src/config/premiumDays/happy-teddy-day-premium.ts (same keys + limits), and the AI
// fields in server/src/config/aiFill/happy-teddy-day-premium.ts.

import type { DayConfig, GifSlot } from "../types";
import { premiumDay } from "./_premium";
import { teddyDay, type TeddyExtras } from "./happy-teddy-day";

export type TeddyExtrasPremium = TeddyExtras;

const GIFS: GifSlot[] = [
  { id: "pt1-parcel", label: "Parcel", moment: "The parcel on the doorstep", file: "pt1-parcel.gif", emoji: "", anim: "wiggle" },
  { id: "pt2-heart", label: "Heart", moment: "After the kiss on the heart", file: "pt2-heart.gif", emoji: "", anim: "bounce" },
  { id: "pt3-alive", label: "Alive", moment: "Wake-up (beside the speech bubble)", file: "pt3-alive.gif", emoji: "", anim: "pulse" },
  { id: "pt4-letter", label: "Letter", moment: "End of the torchlight letter", file: "pt4-letter.gif", emoji: "", anim: "float" },
  { id: "pt5-found", label: "Found", moment: "Hide-and-seek, round 3 found", file: "pt5-found.gif", emoji: "", anim: "spin" },
  { id: "pt6-sleep", label: "Sleep", moment: "Tuck-in ending", file: "pt6-sleep.gif", emoji: "", anim: "pulse" },
];

export const teddyDayPremium: DayConfig<TeddyExtrasPremium> = premiumDay<TeddyExtrasPremium>(teddyDay, {
  slug: "happy-teddy-day-premium",
  title: "Made With a Heart",
  gifSlots: GIFS,
  demoPremium: {
    voiceCaption: "I put a heart in him so he can keep you company when I can't.",
    psLetter: "Open only on a lonely night: squeeze him twice. That one's from me.",
  },
});
