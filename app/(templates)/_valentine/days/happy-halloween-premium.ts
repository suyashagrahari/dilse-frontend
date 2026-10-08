// happy-halloween-premium — "The Midnight Manor" (the ✦ Premium twin of happy-halloween).
//
// OWNED BY THIS DAY'S BUILDER. Starts as the $2 config + the premium limits
// (see ./_premium.ts). Refine the extras here AND in
// server/src/config/premiumDays/happy-halloween-premium.ts (same keys + limits), and the AI
// fields in server/src/config/aiFill/happy-halloween-premium.ts.

import type { DayConfig, GifSlot } from "../types";
import { premiumDay } from "./_premium";
import { halloweenDay, type HalloweenExtras } from "./happy-halloween";

export type HalloweenExtrasPremium = HalloweenExtras;

const GIFS: GifSlot[] = [
  { id: "p1-invite", label: "Invite", moment: "Peeking ghost", file: "p1-invite.gif", emoji: "👻", anim: "wiggle" },
  { id: "p2-candle", label: "Candle", moment: "Candle friend", file: "p2-candle.gif", emoji: "🕯️", anim: "bounce" },
  { id: "p3-portrait", label: "Portrait", moment: "Portrait wink", file: "p3-portrait.gif", emoji: "🖼️", anim: "pulse" },
  { id: "p4-seance", label: "Seance", moment: "Séance cat", file: "p4-seance.gif", emoji: "🐈‍⬛", anim: "float" },
  { id: "p5-cauldron", label: "Cauldron", moment: "Spell casting", file: "p5-cauldron.gif", emoji: "🧙", anim: "spin" },
  { id: "p6-yes", label: "Yes", moment: "Ghost couple", file: "p6-yes.gif", emoji: "💞", anim: "pulse" },
];

export const halloweenDayPremium: DayConfig<HalloweenExtrasPremium> = premiumDay<HalloweenExtrasPremium>(halloweenDay, {
  slug: "happy-halloween-premium",
  title: "The Midnight Manor",
  gifSlots: GIFS,
  demoPremium: {
    voiceCaption: "Testing, testing\u2026 this is me, calling from the other side of the city.",
    psLetter: "Open only if you're scared: I'm right here. I was always right here.",
  },
});
