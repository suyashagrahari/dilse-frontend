// The engine's slugs, and nothing heavy — imported by SharePageClient and the
// registries, which must not pull every day's demo copy into their bundles.
// templateType === slug === route === aiFill slug === API base `<slug>-pages`.
//
// The engine started as Valentine's week (eight days) and now also carries
// occasions that reuse it — Happy Halloween is the ninth entry. The list keeps
// its historical name; "day" here means "one template built on the engine".

import { VALENTINE_DAYS as WISHLIST_DAYS } from "@/lib/wishlist/valentine";

/** The eight Valentine's-week days, in week order (Rose 7 Feb → Valentine's 14 Feb). */
export const VALENTINE_WEEK_SLUGS = [
  "happy-rose-day",
  "happy-propose-day",
  "happy-chocolate-day",
  "happy-teddy-day",
  "happy-promise-day",
  "happy-hug-day",
  "happy-kiss-day",
  "happy-valentines-day",
] as const;

/** Occasions outside Valentine's week that run on the same engine. */
export const OCCASION_SLUGS = ["happy-halloween"] as const;

/** Every template on the engine. */
export const VALENTINE_DAY_SLUGS = [...VALENTINE_WEEK_SLUGS, ...OCCASION_SLUGS] as const;

export type DaySlug = (typeof VALENTINE_DAY_SLUGS)[number];

export const VALENTINE_DAY_SET: ReadonlySet<string> = new Set(VALENTINE_DAY_SLUGS);

export const isDaySlug = (s: unknown): s is DaySlug => typeof s === "string" && VALENTINE_DAY_SET.has(s);

export interface DayMeta {
  name: string;
  emoji: string;
  /** Day of the month. */
  date: number;
  /** "February" / "October". */
  month: string;
}

/** Name, emoji and date per slug — the week straight from the wishlist campaign, plus the occasions. */
export const DAY_META: Record<DaySlug, DayMeta> = {
  ...(Object.fromEntries(
    VALENTINE_WEEK_SLUGS.map((slug, i) => [slug, { name: WISHLIST_DAYS[i].name, emoji: WISHLIST_DAYS[i].emoji, date: WISHLIST_DAYS[i].date, month: "February" }]),
  ) as Record<(typeof VALENTINE_WEEK_SLUGS)[number], DayMeta>),
  "happy-halloween": { name: "Halloween", emoji: "🎃", date: 31, month: "October" },
};
