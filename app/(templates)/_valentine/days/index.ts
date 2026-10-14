// Every template on the engine (the eight Valentine days + Halloween + their nine ✦ Premium twins). `getDay(slug)` is the one lookup everything uses.

import type { DayConfig } from "../types";
import { roseDay } from "./happy-rose-day";
import { proposeDay } from "./happy-propose-day";
import { chocolateDay } from "./happy-chocolate-day";
import { teddyDay } from "./happy-teddy-day";
import { promiseDay } from "./happy-promise-day";
import { hugDay } from "./happy-hug-day";
import { kissDay } from "./happy-kiss-day";
import { valentinesDay } from "./happy-valentines-day";
import { halloweenDay } from "./happy-halloween";
import { dandiyaDay } from "./dandiya-partner";
import { sorryDay } from "./sorry";
import { happyBirthdayDay } from "./happy-birthday";
import { missYouDay } from "./miss-you";
import { willYouBeMineDay } from "./will-you-be-mine";
import { happyAnniversaryDay } from "./happy-anniversary";
import { anniversaryPremiumDay } from "./anniversary-premium";
import { diwaliDay } from "./happy-diwali";
import { roseDayPremium } from "./happy-rose-day-premium";
import { proposeDayPremium } from "./happy-propose-day-premium";
import { chocolateDayPremium } from "./happy-chocolate-day-premium";
import { teddyDayPremium } from "./happy-teddy-day-premium";
import { promiseDayPremium } from "./happy-promise-day-premium";
import { hugDayPremium } from "./happy-hug-day-premium";
import { kissDayPremium } from "./happy-kiss-day-premium";
import { valentinesDayPremium } from "./happy-valentines-day-premium";
import { halloweenDayPremium } from "./happy-halloween-premium";
import { VALENTINE_DAY_SLUGS, type DaySlug } from "./slugs";

export { VALENTINE_DAY_SLUGS, VALENTINE_WEEK_SLUGS, OCCASION_SLUGS, PREMIUM_DAY_SLUGS, PREMIUM_BASE, VALENTINE_DAY_SET, DAY_META, isDaySlug, isPremiumDaySlug, premiumTwinOf, type DaySlug, type PremiumDaySlug } from "./slugs";

/**
 * ✦ Premium previews play a real song, never the synth melody: unless the
 * config's demo already names a YouTube song — or plays the day's own track
 * (demo musicMode "track", with music.track set) — it plays the day's first
 * suggestion (from `music.demoStart`, default 0s) once the visitor taps in.
 */
function withDemoSong(day: DayConfig): DayConfig {
  const first = day.music?.suggestions?.[0];
  const d = day.demo as unknown as Record<string, unknown>;
  if (!first || d.musicMode === "youtube" || (d.musicMode === "track" && day.music?.track)) return day;
  return { ...day, demo: { ...day.demo, music: true, musicMode: "youtube", musicYoutubeId: first.id, musicStart: day.music?.demoStart ?? 0 } } as DayConfig;
}

export const DAYS: Record<DaySlug, DayConfig> = {
  "happy-rose-day": roseDay as unknown as DayConfig,
  "happy-propose-day": proposeDay as unknown as DayConfig,
  "happy-chocolate-day": chocolateDay as unknown as DayConfig,
  "happy-teddy-day": teddyDay as unknown as DayConfig,
  "happy-promise-day": promiseDay as unknown as DayConfig,
  "happy-hug-day": hugDay as unknown as DayConfig,
  "happy-kiss-day": kissDay as unknown as DayConfig,
  "happy-valentines-day": valentinesDay as unknown as DayConfig,
  "happy-halloween": halloweenDay as unknown as DayConfig,
  "dandiya-partner": dandiyaDay as unknown as DayConfig,
  sorry: sorryDay as unknown as DayConfig,
  "happy-birthday": happyBirthdayDay as unknown as DayConfig,
  "miss-you": missYouDay as unknown as DayConfig,
  "will-you-be-mine": willYouBeMineDay as unknown as DayConfig,
  "happy-anniversary": happyAnniversaryDay as unknown as DayConfig,
  "anniversary-premium": anniversaryPremiumDay as unknown as DayConfig,
  "happy-diwali": diwaliDay as unknown as DayConfig,
  // ✦ Premium twins
  "happy-rose-day-premium": withDemoSong(roseDayPremium as unknown as DayConfig),
  "happy-propose-day-premium": withDemoSong(proposeDayPremium as unknown as DayConfig),
  "happy-chocolate-day-premium": withDemoSong(chocolateDayPremium as unknown as DayConfig),
  "happy-teddy-day-premium": withDemoSong(teddyDayPremium as unknown as DayConfig),
  "happy-promise-day-premium": withDemoSong(promiseDayPremium as unknown as DayConfig),
  "happy-hug-day-premium": withDemoSong(hugDayPremium as unknown as DayConfig),
  "happy-kiss-day-premium": withDemoSong(kissDayPremium as unknown as DayConfig),
  "happy-valentines-day-premium": withDemoSong(valentinesDayPremium as unknown as DayConfig),
  "happy-halloween-premium": withDemoSong(halloweenDayPremium as unknown as DayConfig),
};

export function getDay(slug: DaySlug): DayConfig {
  return DAYS[slug];
}

/** In week order, then the occasions. */
export const DAY_LIST: readonly DayConfig[] = VALENTINE_DAY_SLUGS.map((s) => DAYS[s]);
