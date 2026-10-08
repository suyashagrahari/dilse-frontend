// premiumDay(base, …) — the starting point of every `-premium` day config.
//
// Spreads the $2 twin's config and applies the premium limits (12 photos,
// a 3,000-character letter, six GIF slots) plus `premium: { base }`. A builder
// may keep using it and override pieces, or replace the call with a full
// literal — either way the result must keep `premium`, the limits below and
// the SAME extras keys/limits as server/src/config/premiumDays/<slug>.ts.

import type { DayConfig, DayCopy, GifSlot } from "../types";
import type { Extras } from "../spec";
import { PREMIUM_DEFAULTS, PREMIUM_LIMITS, type PremiumFields } from "../premiumData";
import type { PremiumDaySlug } from "./slugs";
import { defaultGifs } from "./_shared";

export interface PremiumDayOptions {
  slug: PremiumDaySlug;
  title: string;
  gifSlots: GifSlot[];
  /** Demo values for the premium fields (voiceCaption, psLetter…). */
  demoPremium?: Partial<PremiumFields>;
  copy?: Partial<DayCopy>;
  share?: Partial<DayConfig["share"]>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function premiumDay<E extends Extras>(base: DayConfig<any>, o: PremiumDayOptions): DayConfig<E> {
  return {
    ...base,
    slug: o.slug,
    title: o.title,
    maxPhotos: PREMIUM_LIMITS.maxPhotos,
    letterMax: PREMIUM_LIMITS.letterMax,
    gifSlots: o.gifSlots,
    premium: { base: base.slug },
    demo: {
      ...base.demo,
      gifs: defaultGifs(o.gifSlots.map((g) => g.id)),
      premium: { ...PREMIUM_DEFAULTS, ...o.demoPremium },
    },
    copy: { ...base.copy, ...o.copy },
    share: { ...base.share, ...o.share },
  } as DayConfig<E>;
}
