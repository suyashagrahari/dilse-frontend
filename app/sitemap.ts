import type { MetadataRoute } from "next";
import { SITE_URL, TEMPLATE_SEO } from "@/lib/seo";
import { getAllArticleSlugs, getCategories } from "@/lib/strapi";
import { COMING_SOON_REDIRECTS, STANDALONE_INDEXABLE_PAGES } from "@/lib/site-routes";

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

  return [...staticPages, ...templatePages, ...standalonePages, ...blogPosts, ...blogCategories];
}
