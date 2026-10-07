// All eight days. `getDay(slug)` is the one lookup everything uses.

import type { DayConfig } from "../types";
import { roseDay } from "./happy-rose-day";
import { proposeDay } from "./happy-propose-day";
import { chocolateDay } from "./happy-chocolate-day";
import { teddyDay } from "./happy-teddy-day";
import { promiseDay } from "./happy-promise-day";
import { hugDay } from "./happy-hug-day";
import { kissDay } from "./happy-kiss-day";
import { valentinesDay } from "./happy-valentines-day";
import { VALENTINE_DAY_SLUGS, type DaySlug } from "./slugs";

export { VALENTINE_DAY_SLUGS, VALENTINE_DAY_SET, DAY_META, isDaySlug, type DaySlug } from "./slugs";

export const DAYS: Record<DaySlug, DayConfig> = {
  "happy-rose-day": roseDay as unknown as DayConfig,
  "happy-propose-day": proposeDay as unknown as DayConfig,
  "happy-chocolate-day": chocolateDay as unknown as DayConfig,
  "happy-teddy-day": teddyDay as unknown as DayConfig,
  "happy-promise-day": promiseDay as unknown as DayConfig,
  "happy-hug-day": hugDay as unknown as DayConfig,
  "happy-kiss-day": kissDay as unknown as DayConfig,
  "happy-valentines-day": valentinesDay as unknown as DayConfig,
};

export function getDay(slug: DaySlug): DayConfig {
  return DAYS[slug];
}

/** In week order. */
export const DAY_LIST: readonly DayConfig[] = VALENTINE_DAY_SLUGS.map((s) => DAYS[s]);
