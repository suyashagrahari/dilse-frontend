import type { MetadataRoute } from "next";
import { SITE_URL, TEMPLATE_SEO } from "@/lib/seo";
import { getAllArticleSlugs, getCategories } from "@/lib/strapi";
import { COMING_SOON_REDIRECTS, STANDALONE_INDEXABLE_PAGES } from "@/lib/site-routes";
import { guideList } from "@/data/guide-registry";
import { guideVideoSet } from "@/lib/templateMedia";
import { isoUploadDate } from "@/lib/guides";

// Revalidated on demand by the Strapi webhook (tag `articles`) + hourly fallback.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/templates`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/about-us`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/contact-us`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
  ];

  // Coming-soon slugs answer 307 (see COMING_SOON_REDIRECTS). Listing a URL that
  // redirects earns a "Page with redirect — not indexed" in Search Console and
  // Bing Webmaster Tools and burns crawl budget, so the source is dropped and
  // only the live destination is advertised.
  const templatePages: MetadataRoute.Sitemap = Object.keys(TEMPLATE_SEO)
    .filter((slug) => !(slug in COMING_SOON_REDIRECTS))
    .map((slug) => ({
      url: `${SITE_URL}/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));

  // Shipped pages that TEMPLATE_SEO never covered — they were live and
  // crawlable but unreachable from the sitemap.
  const standalonePages: MetadataRoute.Sitemap = STANDALONE_INDEXABLE_PAGES.map((page) => ({
    url: `${SITE_URL}${page.path}`,
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  // One entry per guide, generated from the registry rather than hand-listed.
  // `updatedAt` is the date the guide's content was last checked against the
  // live flow, which is the honest lastModified — a guide whose template has
  // since changed should not be advertised as fresh just because the file was
  // touched. Guides sit at 0.7, above the informational pages and below the
  // templates they document: they exist to send someone to a template, so they
  // should not outrank it.
  //
  // Guides that have a recording also carry a <video:video> entry. Video
  // structured data on the page tells Google what the video *is*; a video
  // sitemap tells it the video exists at all and which page to treat as its
  // watch page. Search Console had filed one of these as "Video isn't on a
  // watch page" — the sitemap is the direct, non-inferential answer to that,
  // and it is also how the discovery date stops depending on when a crawl
  // happens to reach the page.
  const guidePages: MetadataRoute.Sitemap = guideList.map((g) => {
    const url = `${SITE_URL}/guides/${g.slug}`;
    const media = guideVideoSet(g.slug);
    return {
      url,
      lastModified: new Date(g.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
      ...(g.video
        ? {
            videos: [
              {
                title: g.title,
                thumbnail_loc: media.poster,
                description: g.summary,
                // content_loc (the MP4) only. `player_loc` means "a URL that
                // loads a standalone player" and Google explicitly requires it
                // to differ from <loc> — the page itself is not a player, same
                // reason the VideoObject carries no embedUrl.
                content_loc: media.mp4,
                duration: g.video.seconds,
                publication_date: isoUploadDate(g.video.recordedAt),
                family_friendly: "yes" as const,
                live: "no" as const,
              },
            ],
          }
        : {}),
    };
  });

  // Blog content from Strapi — degrades gracefully (empty) if the CMS is unreachable.
  const [articles, categories] = await Promise.all([getAllArticleSlugs(), getCategories()]);

  const blogPosts: MetadataRoute.Sitemap = articles.map(({ slug, updatedAt }) => ({
    url: `${SITE_URL}/blog/${slug}`,
    lastModified: updatedAt ? new Date(updatedAt) : now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const blogCategories: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE_URL}/blog/category/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...templatePages, ...standalonePages, ...guidePages, ...blogPosts, ...blogCategories];
}
