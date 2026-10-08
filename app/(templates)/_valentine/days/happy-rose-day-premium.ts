// happy-rose-day-premium — "The Glasshouse Rose" (the ✦ Premium twin of happy-rose-day).
//
// OWNED BY THIS DAY'S BUILDER. Starts as the $2 config + the premium limits
// (see ./_premium.ts). Refine the extras here AND in
// server/src/config/premiumDays/happy-rose-day-premium.ts (same keys + limits), and the AI
// fields in server/src/config/aiFill/happy-rose-day-premium.ts.

import type { DayConfig, GifSlot } from "../types";
import { premiumDay } from "./_premium";
import { roseDay, type RoseExtras } from "./happy-rose-day";

export type RoseExtrasPremium = RoseExtras;

const GIFS: GifSlot[] = [
  { id: "pr1-door", label: "Door", moment: "Threshold, beside the fogged door", file: "pr1-door.gif", emoji: "", anim: "wiggle" },
  { id: "pr2-thorn", label: "Thorn", moment: "After the last thorn (\"Nothing left that can hurt you\")", file: "pr2-thorn.gif", emoji: "", anim: "bounce" },
  { id: "pr3-petals", label: "Petals", moment: "Petal sentence completed", file: "pr3-petals.gif", emoji: "", anim: "pulse" },
  { id: "pr4-letter", label: "Letter", moment: "Bottom of the pressed-book letter", file: "pr4-letter.gif", emoji: "", anim: "float" },
  { id: "pr5-memories", label: "Memories", moment: "Dew-drop memories heading", file: "pr5-memories.gif", emoji: "", anim: "spin" },
  { id: "pr6-forever", label: "Forever", moment: "Eternal Rose ending", file: "pr6-forever.gif", emoji: "", anim: "pulse" },
];

export const roseDayPremium: DayConfig<RoseExtrasPremium> = premiumDay<RoseExtrasPremium>(roseDay, {
  slug: "happy-rose-day-premium",
  title: "The Glasshouse Rose",
  gifSlots: GIFS,
  demoPremium: {
    voiceCaption: "I grew this one where nothing could touch it. Not even time.",
    psLetter: "Open only if you ever doubt it was real: it was. Every petal.",
  },
});
