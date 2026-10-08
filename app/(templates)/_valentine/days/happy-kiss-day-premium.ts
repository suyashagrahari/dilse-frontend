// happy-kiss-day-premium — "A Thousand Kisses" (the ✦ Premium twin of happy-kiss-day).
//
// OWNED BY THIS DAY'S BUILDER. Starts as the $2 config + the premium limits
// (see ./_premium.ts). Refine the extras here AND in
// server/src/config/premiumDays/happy-kiss-day-premium.ts (same keys + limits), and the AI
// fields in server/src/config/aiFill/happy-kiss-day-premium.ts.

import type { DayConfig, GifSlot } from "../types";
import { premiumDay } from "./_premium";
import { kissDay, type KissExtras } from "./happy-kiss-day";

export type KissExtrasPremium = KissExtras;

const GIFS: GifSlot[] = [
  { id: "pk1-shy", label: "Shy", moment: "Peeking at the envelope", file: "pk1-shy.gif", emoji: "", anim: "wiggle" },
  { id: "pk2-catch", label: "Catch", moment: "Beside the jar while catching", file: "pk2-catch.gif", emoji: "", anim: "bounce" },
  { id: "pk3-wow", label: "Wow", moment: "After the mosaic locks", file: "pk3-wow.gif", emoji: "", anim: "pulse" },
  { id: "pk4-mirror", label: "Mirror", moment: "Corner of the mirror letter", file: "pk4-mirror.gif", emoji: "", anim: "float" },
  { id: "pk5-booth", label: "Booth", moment: "Peeking from the booth curtain", file: "pk5-booth.gif", emoji: "", anim: "spin" },
  { id: "pk6-back", label: "Back", moment: "Finale, \"your turn\"", file: "pk6-back.gif", emoji: "", anim: "pulse" },
];

export const kissDayPremium: DayConfig<KissExtrasPremium> = premiumDay<KissExtrasPremium>(kissDay, {
  slug: "happy-kiss-day-premium",
  title: "A Thousand Kisses",
  gifSlots: GIFS,
  demoPremium: {
    voiceCaption: "Counting them was a bad idea. I lost track at 412.",
    psLetter: "Open only when you miss me: close your eyes. That was one.",
  },
});
