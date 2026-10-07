// The eight slugs, and nothing heavy — imported by SharePageClient and the
// registries, which must not pull every day's demo copy into their bundles.
// templateType === slug === route === aiFill slug === API base `<slug>-pages`.

import { VALENTINE_DAYS as WISHLIST_DAYS } from "@/lib/wishlist/valentine";

export const VALENTINE_DAY_SLUGS = [
  "happy-rose-day",
  "happy-propose-day",
  "happy-chocolate-day",
  "happy-teddy-day",
  "happy-promise-day",
  "happy-hug-day",
  "happy-kiss-day",
  "happy-valentines-day",
] as const;

export type DaySlug = (typeof VALENTINE_DAY_SLUGS)[number];

export const VALENTINE_DAY_SET: ReadonlySet<string> = new Set(VALENTINE_DAY_SLUGS);

export const isDaySlug = (s: unknown): s is DaySlug => typeof s === "string" && VALENTINE_DAY_SET.has(s);

/** Name, emoji and February date per slug — straight from the wishlist campaign. */
export const DAY_META: Record<DaySlug, { name: string; emoji: string; date: number }> = Object.fromEntries(
  VALENTINE_DAY_SLUGS.map((slug, i) => [slug, { name: WISHLIST_DAYS[i].name, emoji: WISHLIST_DAYS[i].emoji, date: WISHLIST_DAYS[i].date }]),
) as Record<DaySlug, { name: string; emoji: string; date: number }>;
