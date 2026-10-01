// The Valentine's week wishlist: one place for the campaign key, the offer and
// the dates, so the hero button, the gallery card, the page and the profile
// can never disagree. The server holds its own copy of the discount
// (controllers/wishlist.controller.ts) and stores it on each row.

export const VALENTINE_CAMPAIGN = "valentine-2027";
export const VALENTINE_DISCOUNT = 30;
export const VALENTINE_PATH = "/valentine-wishlist";
/** Rose Day — the first day of Valentine's week, local midnight. */
export const VALENTINE_WEEK_START = new Date(2027, 1, 7);

export const VALENTINE_DAYS = [
  { date: 7, name: "Rose Day", emoji: "🌹" },
  { date: 8, name: "Propose Day", emoji: "💍" },
  { date: 9, name: "Chocolate Day", emoji: "🍫" },
  { date: 10, name: "Teddy Day", emoji: "🧸" },
  { date: 11, name: "Promise Day", emoji: "🤞" },
  { date: 12, name: "Hug Day", emoji: "🤗" },
  { date: 13, name: "Kiss Day", emoji: "💋" },
  { date: 14, name: "Valentine's Day", emoji: "💘" },
] as const;

export function daysUntilValentineWeek(now = new Date()): number {
  return Math.max(0, Math.ceil((VALENTINE_WEEK_START.getTime() - now.getTime()) / 86_400_000));
}
