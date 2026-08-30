import { getArticles, type Article } from "@/lib/strapi";
import type { GuideVideo, ProductGuide } from "@/types/product-guide";
import { guideList, getGuide, guideByTemplateHref } from "@/data/guide-registry";

/** "1:30" from 90. Used on cards, chapter rows and the player. */
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** "PT1M30S" — ISO 8601 duration, required by schema.org VideoObject. */
export function isoDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `PT${m > 0 ? `${m}M` : ""}${s}S`;
}

/**
 * A registry date as an ISO 8601 datetime **with a timezone**.
 *
 * The registry stores dates as a plain "2026-08-21", which is a valid
 * schema.org Date but not a valid Google `uploadDate`: Search Console reports
 * it as both "Invalid datetime value" and "missing a timezone". Google wants a
 * full datetime and will not assume UTC, because the upload date is used to
 * order and freshness-rank video results and a bare date is ambiguous by up to
 * a day either way.
 *
 * The recordings are made in Asia/Kolkata, so +05:30 is the honest offset. The
 * time of day is not recorded anywhere and nothing depends on it, so it is
 * pinned to a fixed working hour rather than invented per guide — a stable
 * value re-emits identically on every build, which matters because a changing
 * uploadDate looks to Google like a re-upload.
 *
 * A value that already carries a time is passed through untouched, so the
 * registry can move to full timestamps later without this needing to change.
 */
export function isoDateTime(date: string): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? `${date}T10:00:00+05:30` : date;
}

/**
 * Chapters as `Clip` nodes need a start *and* an end — Search Console flags
 * `Missing field "endOffset" (in "hasPart")` without it, and a Clip with no end
 * cannot become a "key moments" link because Google has no segment to draw.
 *
 * The end of a chapter is the start of the next one, and the last chapter runs
 * to the end of the video. Crucially that is computed from the **full** chapter
 * list before any filtering: chapters without a `sectionId` are dropped from
 * the schema (they have no anchor to link to) but they still occupy time, so
 * using the filtered list would stretch the preceding clip straight through
 * them and mark the wrong segment.
 */
export function chapterClips(video: GuideVideo) {
  return video.chapters.map((c, i) => ({
    ...c,
    startOffset: c.at,
    endOffset: video.chapters[i + 1]?.at ?? video.seconds,
  }));
}

/** Total written steps across a guide — the "12 steps" chip on the card. */
export function stepCount(guide: ProductGuide): number {
  return guide.sections.reduce((n, s) => n + s.steps.length, 0);
}

/**
 * Blog posts to surface at the foot of a guide.
 *
 * Two sources, in priority order, because the registry's `relatedBlogSlugs`
 * will lag reality — posts are written in Strapi long after a guide ships, and
 * nobody is going to come back and edit a TypeScript file each time one
 * publishes:
 *
 *   1. Slugs named explicitly in the registry. Deliberate editorial pairing,
 *      always wins.
 *   2. Whatever Strapi returns for a free-text search on the guide's own
 *      subject. Keeps the section populated on its own as the blog grows.
 *
 * Everything here fails soft. Strapi being unreachable, a named slug having
 * been unpublished, the search returning nothing — each degrades to fewer
 * cards, never to a thrown request or a 404 link. A guide is still a complete
 * page with no blog posts attached to it.
 */
export async function getRelatedArticlesForGuide(
  guide: ProductGuide,
  limit = 3,
): Promise<Article[]> {
  const picked: Article[] = [];
  const seen = new Set<string>();

  const take = (a: Article) => {
    if (picked.length >= limit || seen.has(a.slug)) return;
    seen.add(a.slug);
    picked.push(a);
  };

  // 1 — explicitly paired posts.
  if (guide.relatedBlogSlugs.length > 0) {
    try {
      const results = await Promise.all(
        guide.relatedBlogSlugs.map((slug) =>
          getArticles({ search: slug, pageSize: 5 }).catch(() => null),
        ),
      );
      for (const r of results) {
        const exact = r?.articles.find((a) => guide.relatedBlogSlugs.includes(a.slug));
        if (exact) take(exact);
      }
    } catch {
      // Strapi down. The search below is attempted anyway; if it also fails the
      // section renders empty, which is the correct outcome.
    }
  }

  // 2 — topical backfill. Searching the template name rather than the guide
  // title: the guide title is phrased as an instruction ("Build a Raksha
  // Bandhan page…") and matches almost nothing, whereas the template name is
  // the noun people actually write posts about.
  if (picked.length < limit) {
    try {
      const { articles } = await getArticles({
        search: guide.templateName.split("—")[0].trim(),
        pageSize: limit + 3,
      });
      articles.forEach(take);
    } catch {
      /* fails soft — see above */
    }
  }

  return picked;
}

/** The other guides a reader should see next, resolved and filtered. */
export function getRelatedGuides(guide: ProductGuide, limit = 3): ProductGuide[] {
  const explicit = guide.relatedGuideSlugs
    .map(getGuide)
    .filter((g): g is ProductGuide => Boolean(g));

  if (explicit.length >= limit) return explicit.slice(0, limit);

  // Backfill from the same category so the section is never a lonely single
  // card. Self is excluded; so is anything already listed.
  const seen = new Set([guide.slug, ...explicit.map((g) => g.slug)]);
  const backfill = guideList.filter((g) => g.category === guide.category && !seen.has(g.slug));

  return [...explicit, ...backfill].slice(0, limit);
}

/**
 * Guides worth surfacing on a blog post.
 *
 * The strong signal is `relatedTemplates` — an editor in Strapi explicitly
 * linking this post to a template. If that template has a guide, someone who
 * just read a post about the occasion is exactly the person who wants to be
 * shown how to build it, and that pairing was chosen by a human.
 *
 * The weak signal is a title/tag match against the guide's template name. It is
 * deliberately narrow: matching on any shared word would put the Raksha Bandhan
 * guides on every post that happens to mention a brother, which is worse than
 * showing nothing. A guide that does not clearly belong is left out.
 *
 * Both take a normalised path so that "/holi", "holi" and an absolute
 * "https://subhsandesh.in/holi" from the CMS all resolve to the same guide.
 */
export function getGuidesForArticle(
  article: Pick<Article, "title" | "tags"> & {
    relatedTemplates?: { url: string }[] | null;
  },
  limit = 2,
): ProductGuide[] {
  const picked: ProductGuide[] = [];
  const seen = new Set<string>();

  const take = (g?: ProductGuide) => {
    if (!g || picked.length >= limit || seen.has(g.slug)) return;
    seen.add(g.slug);
    picked.push(g);
  };

  const toPath = (raw: string): string => {
    try {
      // Absolute URLs from the CMS reduce to their pathname; relative ones are
      // left alone. Either way a trailing slash must not create a second key.
      const p = raw.startsWith("http") ? new URL(raw).pathname : raw;
      const withSlash = p.startsWith("/") ? p : `/${p}`;
      return withSlash.length > 1 ? withSlash.replace(/\/+$/, "") : withSlash;
    } catch {
      return raw;
    }
  };

  for (const t of article.relatedTemplates ?? []) {
    take(guideByTemplateHref[toPath(t.url)]);
  }

  if (picked.length < limit) {
    const haystack = [article.title, ...(article.tags ?? [])].join(" ").toLowerCase();
    for (const g of guideList) {
      // The template name minus its "— for your sister" qualifier: "happy
      // raksha bandhan". Long enough to be specific, short enough to match how
      // a post would actually name the occasion.
      const subject = g.templateName.split("—")[0].trim().toLowerCase();
      if (subject.length >= 8 && haystack.includes(subject)) take(g);
    }
  }

  return picked;
}
