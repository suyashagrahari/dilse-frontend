// The gallery's catalogue rules, shared by the gallery and anything else that
// shows templates "the gallery way" (the /halloween-offer drop, the super-admin
// drop picker). Kept out of TemplatesPageClient so those pages do not pull the
// whole gallery bundle in to learn which slugs are coming soon.

import { templateList, webpageTemplateList } from "@/data/template-registry";
import type { TemplateListItem } from "@/types/template-config";

/** Slugs temporarily treated as coming-soon even though they have a coverImage. */
export const FORCE_COMING_SOON: ReadonlySet<string> = new Set(["anniversary-gf"]);

/** Is this a template the gallery would show as "coming soon" rather than a card? */
export const isComingSoon = (t: Pick<TemplateListItem, "slug" | "coverImage">) => !t.coverImage || FORCE_COMING_SOON.has(t.slug);

/**
 * One gallery list. The "webpage" templates used to sit behind an App UI /
 * Webpage UI toggle; they now live with the rest, each one next to its
 * closest sibling (christian-wedding-2 beside christian-wedding). Hidden
 * templates are still removed per visitor by the callers.
 */
export const GALLERY_LIST: TemplateListItem[] = (() => {
  const list = [...templateList];
  for (const w of webpageTemplateList) {
    const sibling = list.findIndex((t) => w.slug.startsWith(`${t.slug}-`));
    if (sibling >= 0) list.splice(sibling + 1, 0, w);
    else list.push(w);
  }
  return list;
})();

/**
 * Shown first in the gallery, in this order, ahead of the most-created
 * ranking: Dandiya, the bouquet, the three wedding tiers, then the ✦ premium evergreens. Only the order moves;
 * rank badges still come from what people actually made (see rankRooms).
 */
export const PINNED_FIRST: readonly string[] = ["dandiya-partner", "digital-bouquet", "wedding-invitation", "wedding-invitation-premium", "royal-wedding-invitation", "palace-door-wedding-invitation", "garden-wedding-invitation", "floral-wedding-invitation", "sikh-wedding-invitation", "muslim-wedding-invitation", "christian-wedding-invitation", "lotus-wedding-invitation", "anniversary-premium", "happy-anniversary", "proposal-premium", "birthday-premium", "sorry-premium", "miss-you-premium", "sorry", "will-you-be-mine", "happy-birthday", "miss-you"];

/**
 * Launch day per template (IST, yyyy-mm-dd). For NEW_LAUNCH_DAYS after it the
 * card wears the diagonal "New launch" ribbon; then it simply stops showing —
 * no admin step. Add a line here when a template goes live.
 */
export const LAUNCHES: Readonly<Record<string, string>> = {
  "dandiya-partner": "2026-10-11",
  sorry: "2026-10-13",
  "will-you-be-mine": "2026-10-14",
  "happy-birthday": "2026-10-14",
  "miss-you": "2026-10-14",
  "proposal-premium": "2026-10-15",
  "birthday-premium": "2026-10-15",
  "sorry-premium": "2026-10-15",
  "miss-you-premium": "2026-10-15",
  "anniversary-premium": "2026-10-15",
  "happy-anniversary": "2026-10-15",
  "digital-bouquet": "2026-10-19",
  "wedding-invitation": "2026-10-20",
  "wedding-invitation-premium": "2026-10-20",
  "royal-wedding-invitation": "2026-10-20",
  "palace-door-wedding-invitation": "2026-10-23",
  "garden-wedding-invitation": "2026-10-23",
  "floral-wedding-invitation": "2026-10-23",
  "sikh-wedding-invitation": "2026-10-28",
  "muslim-wedding-invitation": "2026-10-28",
  "christian-wedding-invitation": "2026-10-28",
  "lotus-wedding-invitation": "2026-10-23",
};
export const NEW_LAUNCH_DAYS = 10;

/** Is `slug` inside its launch window at `now`? */
export function isNewLaunch(slug: string, now: number = Date.now()): boolean {
  const day = LAUNCHES[slug];
  if (!day) return false;
  const start = Date.parse(`${day}T00:00:00+05:30`);
  return now >= start && now < start + NEW_LAUNCH_DAYS * 86_400_000;
}

/**
 * `list` (already in ranking order) with the front of the gallery pulled first:
 * the super admin's saved order (/admin/template-order) when there is one,
 * otherwise PINNED_FIRST. Anything not in that list keeps its ranking order after it.
 */
export function pinFirst<T extends { slug: string }>(list: T[], order?: readonly string[]): T[] {
  const front = order && order.length ? order : PINNED_FIRST;
  const pos = new Map(front.map((s, i) => [s, i]));
  const pinned = list.filter((t) => pos.has(t.slug)).sort((a, b) => pos.get(a.slug)! - pos.get(b.slug)!);
  return [...pinned, ...list.filter((t) => !pos.has(t.slug))];
}

/**
 * Is this template LISTED on the main gallery (/templates, its search, the
 * Premium room)? The one rule every main-gallery surface applies, so they
 * cannot drift:
 *
 *   hidden (visibility, the master switch)   → never listed
 *   live but in the super admin's "Templates page" exclusions → not listed,
 *       yet still openable by link and still shown in other places
 *       (/wedding, drops) — those surfaces do NOT call this
 *   otherwise → listed
 *
 * Never use this for the sitemap or SEO pages: an excluded template is still a
 * public page.
 */
export function isListedOnGallery(slug: string, hidden: ReadonlySet<string>, excluded: ReadonlySet<string>): boolean {
  return !hidden.has(slug) && !excluded.has(slug);
}

/** slug → registry entry. */
export const GALLERY_BY_SLUG: ReadonlyMap<string, TemplateListItem> = new Map(GALLERY_LIST.map((t) => [t.slug, t]));

/**
 * The five most-created templates in each room (premium / freemium), ranked
 * against the whole room exactly as the gallery ranks them, so a badge means
 * the same thing wherever the card is shown.
 */
export function rankRooms(
  visible: (TemplateListItem & { premium?: boolean })[],
  createdBy: ReadonlyMap<string, number>,
): Map<string, number> {
  const m = new Map<string, number>();
  for (const room of [true, false]) {
    visible
      .filter((t) => Boolean(t.premium) === room && t.coverImage && (createdBy.get(t.slug) ?? 0) > 0)
      .slice(0, 5)
      .forEach((t, i) => m.set(t.slug, i + 1));
  }
  return m;
}
