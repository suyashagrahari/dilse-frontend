// happy-promise-day-premium — "The Red Thread" (the ✦ Premium twin of happy-promise-day).
//
// OWNED BY THIS DAY'S BUILDER. Starts as the $2 config + the premium limits
// (see ./_premium.ts). Refine the extras here AND in
// server/src/config/premiumDays/happy-promise-day-premium.ts (same keys + limits), and the AI
// fields in server/src/config/aiFill/happy-promise-day-premium.ts.

import type { DayConfig, GifSlot } from "../types";
import { premiumDay } from "./_premium";
import { promiseDay, type PromiseExtras } from "./happy-promise-day";

export type PromiseExtrasPremium = PromiseExtras;

const GIFS: GifSlot[] = [
  { id: "pp1-gate", label: "Gate", moment: "Gate, bottom corner, peeking", file: "pp1-gate.gif", emoji: "", anim: "wiggle" },
  { id: "pp2-pull", label: "Pull", moment: "Beside the hand while pulling", file: "pp2-pull.gif", emoji: "", anim: "bounce" },
  { id: "pp3-knot", label: "Knot", moment: "After \"I promise\" writes", file: "pp3-knot.gif", emoji: "", anim: "pulse" },
  { id: "pp4-rings", label: "Rings", moment: "Over the ring field, by the score", file: "pp4-rings.gif", emoji: "", anim: "float" },
  { id: "pp5-vial", label: "Vial", moment: "The river, beside the floating vial", file: "pp5-vial.gif", emoji: "", anim: "spin" },
  { id: "pp6-promised", label: "Promised", moment: "Finale, after \"Do you promise too?\"", file: "pp6-promised.gif", emoji: "", anim: "pulse" },
];

export const promiseDayPremium: DayConfig<PromiseExtrasPremium> = premiumDay<PromiseExtrasPremium>(promiseDay, {
  slug: "happy-promise-day-premium",
  title: "The Red Thread",
  gifSlots: GIFS,
  demoPremium: {
    voiceCaption: "However far, the thread doesn't break. I checked.",
    psLetter: "Open only if you're ever unsure: I meant every single one.",
  },
});
