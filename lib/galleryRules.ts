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
