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
export const OCCASION_SLUGS = ["happy-halloween", "dandiya-partner", "happy-diwali", "sorry", "happy-birthday", "miss-you"] as const;

/**
 * The ULTRA-PREMIUM tier ($4): one cinematic twin per base template, on the
 * same engine plus the premium layer (kit/premium). See
 * .template-factory/premium/PREMIUM-ENGINE.md.
 */
export const PREMIUM_DAY_SLUGS = [
  "happy-rose-day-premium",
  "happy-propose-day-premium",
  "happy-chocolate-day-premium",
  "happy-teddy-day-premium",
  "happy-promise-day-premium",
  "happy-hug-day-premium",
  "happy-kiss-day-premium",
  "happy-valentines-day-premium",
  "happy-halloween-premium",
] as const;

export type PremiumDaySlug = (typeof PREMIUM_DAY_SLUGS)[number];
type BaseDaySlug = (typeof VALENTINE_WEEK_SLUGS)[number] | (typeof OCCASION_SLUGS)[number];

/** premium slug → its $2 twin. */
export const PREMIUM_BASE: Record<PremiumDaySlug, BaseDaySlug> = {
  "happy-rose-day-premium": "happy-rose-day",
  "happy-propose-day-premium": "happy-propose-day",
  "happy-chocolate-day-premium": "happy-chocolate-day",
  "happy-teddy-day-premium": "happy-teddy-day",
  "happy-promise-day-premium": "happy-promise-day",
  "happy-hug-day-premium": "happy-hug-day",
  "happy-kiss-day-premium": "happy-kiss-day",
  "happy-valentines-day-premium": "happy-valentines-day",
  "happy-halloween-premium": "happy-halloween",
};

export const PREMIUM_DAY_SET: ReadonlySet<string> = new Set(PREMIUM_DAY_SLUGS);
export const isPremiumDaySlug = (s: unknown): s is PremiumDaySlug => typeof s === "string" && PREMIUM_DAY_SET.has(s);

/** $2 slug → its premium twin (null when it has none). */
export function premiumTwinOf(slug: string): PremiumDaySlug | null {
  return (PREMIUM_DAY_SLUGS.find((p) => PREMIUM_BASE[p] === slug) as PremiumDaySlug | undefined) ?? null;
}

/** Every template on the engine: the week, the occasions, then the premium twins. */
export const VALENTINE_DAY_SLUGS = [...VALENTINE_WEEK_SLUGS, ...OCCASION_SLUGS, ...PREMIUM_DAY_SLUGS] as const;

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
const BASE_META: Record<BaseDaySlug, DayMeta> = {
  ...(Object.fromEntries(
    VALENTINE_WEEK_SLUGS.map((slug, i) => [slug, { name: WISHLIST_DAYS[i].name, emoji: WISHLIST_DAYS[i].emoji, date: WISHLIST_DAYS[i].date, month: "February" }]),
  ) as Record<(typeof VALENTINE_WEEK_SLUGS)[number], DayMeta>),
  "happy-halloween": { name: "Halloween", emoji: "🎃", date: 31, month: "October" },
  // Sharad Navratri 2026 begins on 11 October.
  "dandiya-partner": { name: "Navratri", emoji: "🪔", date: 11, month: "October" },
  // Diwali 2026 falls on 8 November.
  "happy-diwali": { name: "Diwali", emoji: "🪔", date: 8, month: "November" },
  // Evergreen: no date (date 0 hides it in the editor and the wide frame).
  sorry: { name: "Sorry", emoji: "🥺", date: 0, month: "" },
  // Evergreen too: a birthday is any day of the year.
  "happy-birthday": { name: "Birthday", emoji: "🎂", date: 0, month: "" },
  // Evergreen too: a cute "I miss you" for a long-distance love.
  "miss-you": { name: "Miss You", emoji: "🥹", date: 0, month: "" },
};
export const DAY_META: Record<DaySlug, DayMeta> = {
  ...BASE_META,
  ...(Object.fromEntries(PREMIUM_DAY_SLUGS.map((p) => [p, BASE_META[PREMIUM_BASE[p]]])) as Record<PremiumDaySlug, DayMeta>),
};
