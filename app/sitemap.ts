import type { MetadataRoute } from "next";
import { SITE_URL, TEMPLATE_SEO } from "@/lib/seo";
import { getAllArticleSlugs, getCategories } from "@/lib/strapi";

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

  const templatePages: MetadataRoute.Sitemap = Object.keys(TEMPLATE_SEO).map((slug) => ({
    url: `${SITE_URL}/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
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

  return [...staticPages, ...templatePages, ...blogPosts, ...blogCategories];
}
