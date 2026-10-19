// ─── Share accents, by template slug ─────────────────────────────────────────
//
// The colour a template's share sheet is dressed in.
//
// A template's own editor passes its accent explicitly, because it has one to
// hand. This table exists for callers that do NOT — chiefly the profile, which
// lists every creation a person has made and knows only the template it came
// from. Sharing a wedding page from the profile should raise the same gold
// sheet the wedding editor raises; opening a generic pink one for all forty
// templates would make the profile feel like a different product.
//
// Values were derived from each template's own `navActiveColor`, with shades of
// 400 and below lifted to 600 — a colour chosen to read as a small tinted icon
// washes out as a full button fill.
//
// A slug that is missing here is not an error. `shareAccent` falls back to the
// house pink, which is what an unrecognised template should look like anyway.

import { DEFAULT_ACCENT } from "@/components/share/qrTheme";

const ACCENTS: Record<string, string> = {
  "anniversary-gf": "#f43f5e",
  "apology-dashboard": "#f43f5e",
  app: "#4f46e5",
  "birthday-gf": "#f43f5e",
  "bouquet-gf": "#ec4899",
  call: "#059669",
  capsule: "#991b1b",
  catch: "#0369a1",
  "happy-rose-day": "#C8102E",
  "happy-propose-day": "#A8823A",
  "happy-chocolate-day": "#A82B58",
  "happy-teddy-day": "#D9628F",
  "happy-promise-day": "#B8456C",
  "happy-hug-day": "#D64C70",
  "happy-kiss-day": "#9D174D",
  "happy-valentines-day": "#C48F2E",
  "happy-halloween": "#B84E14",
  "dandiya-partner": "#B8650A",
  sorry: "#D9466E",
  "happy-birthday": "#C93A63",
  "birthday-premium": "#BE355D",
  "miss-you": "#D9487F",
  "miss-you-premium": "#C23F79",
  "will-you-be-mine": "#B8435F",
  "sorry-premium": "#B5365A",
  "proposal-premium": "#A63D58",
  "happy-anniversary": "#AE3558",
  "anniversary-premium": "#B4813A",
  "digital-bouquet": "#AE2F57",
  "happy-diwali": "#B3121B",
  // ✦ Premium v2: each one's own palette (its day file's share accent, or its
  // accentDeep where that accent is too light to carry white button text).
  "happy-rose-day-premium": "#D63F72",
  "happy-propose-day-premium": "#5B36C4",
  "happy-chocolate-day-premium": "#D63F72",
  "happy-teddy-day-premium": "#E0607E",
  "happy-promise-day-premium": "#E0603F",
  "happy-hug-day-premium": "#E0603F",
  "happy-kiss-day-premium": "#D63F72",
  "happy-valentines-day-premium": "#C9184A",
  "happy-halloween-premium": "#E06A12",
  challan: "#b91c1c",
  "christian-wedding": "#065f46",
  "christian-wedding-2": "#065f46",
  "court-marriage": "#b45309",
  "court-of-love": "#7c3aed",
  darling: "#e11d48",
  "date-invitation": "#be123c",
  dedication: "#9a3412",
  "eid-mubarak": "#d97706",
  flags: "#be123c",
  "hold-my-hand": "#7c3aed",
  holi: "#ec4899",
  "kundli-milan": "#b45309",
  "legal-notice": "#4338ca",
  "love-gf": "#ec4899",
  loveflix: "#f59e0b",
  "missyou-gf": "#4f46e5",
  nutrition: "#44403c",
  "photo-puzzle": "#4f46e5",
  product: "#f97316",
  "profile-pro": "#0f766e",
  proposal: "#db2777",
  recharge: "#c026d3",
  reception: "#e11d48",
  rewind: "#c026d3",
  searched: "#6d28d9",
  "shaadi-card": "#f43f5e",
  streak: "#b45309",
  "train-ticket": "#334155",
  "happy-rakshabandhan-to-brother": "#9B2226",
  // Rani pink, not the brother's festival red — kept in step with `ACCENT` in
  // that template's components/theme.ts, which explains why the two halves of
  // the same festival must not look like each other's reload.
  "happy-rakshabandhan-to-sister": "#A62A5C",
  us: "#171717",
  "valentine-gf": "#ef4444",
  "vending-machine": "#0f766e",
  watch: "#0284c7",
  "wedding-shaadi": "#f59e0b",
};

/** The share accent for a template slug, or the house pink if it has none. */
export function shareAccent(slug?: string | null): string {
  if (!slug) return DEFAULT_ACCENT;
  return ACCENTS[slug] ?? DEFAULT_ACCENT;
}
