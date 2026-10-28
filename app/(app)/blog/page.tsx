import type { Metadata } from "next";
import Link from "next/link";
import { buildMeta, SITE_URL } from "@/lib/seo";
import { getArticles, getCategoriesWithCounts } from "@/lib/strapi";
import BlogCard from "@/components/blog/BlogCard";
import CategoryChips from "@/components/blog/CategoryChips";
import BlogSearch from "@/components/blog/BlogSearch";
import { BlogIndexJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";
import { SeasonalMarquee } from "@/components/promo/SeasonalPromos";
import { SeasonProvider } from "@/hooks/useSeason";
import { getSeasonServer } from "@/lib/season.server";
import FollowUs from "@/components/blog/FollowUs";

// Time-based ISR fallback; the Strapi webhook revalidates instantly on publish.
export const revalidate = 3600;

const PAGE_SIZE = 24;

const BLOG_META = {
  title: "Blog — Ideas & Guides for Every Celebration | SubhSandesh",
  description:
    "Gift ideas, celebration guides, festival traditions and heartfelt message inspiration for birthdays, weddings, Holi, Eid and every special Indian occasion.",
  keywords: [
    "celebration ideas",
    "gift ideas india",
    "festival guides",
    "birthday wishes",
    "wedding inspiration",
    "subhsandesh blog",
  ],
};

// Each ?page=N canonicalises to itself. Pointing them all at /blog told Google
// that pages 2..N were copies of page 1, so it dropped them ("Alternate page
// with proper canonical tag") and stopped using them to find older posts —
// most of the blog was reachable only through the sitemap.
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}): Promise<Metadata> {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam || "1", 10) || 1);
  if (page === 1) return buildMeta({ ...BLOG_META, alternates: { canonical: `${SITE_URL}/blog` } });
  return buildMeta({
    ...BLOG_META,
    title: `Blog — Page ${page} | SubhSandesh`,
    alternates: { canonical: `${SITE_URL}/blog?page=${page}` },
  });
}

/** Page numbers to link from page `page` of `count`: its neighbours, the ends,
 *  and every tenth page, so any page of the archive is a few clicks from any
 *  other instead of one "Next" at a time. */
function pageLinks(page: number, count: number): number[] {
  const set = new Set<number>([1, count]);
  for (let p = page - 2; p <= page + 2; p++) if (p >= 1 && p <= count) set.add(p);
  for (let p = 10; p < count; p += 10) set.add(p);
  return [...set].sort((a, b) => a - b);
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam || "1", 10) || 1);

  const [{ articles, pageCount }, { categories, total }] = await Promise.all([
    getArticles({ page, pageSize: PAGE_SIZE }),
    getCategoriesWithCounts(),
  ]);

  const featured = page === 1 ? articles[0] : undefined;
  const rest = featured ? articles.slice(1) : articles;

  // Hourly, like the page itself — see lib/season.server.ts.
  const season = await getSeasonServer(3600);

  return (
    <SeasonProvider season={season}>
    <main className="min-h-screen overflow-x-hidden" style={{ background: "#f5ede6", color: "#2a0a0e" }}>
      <BlogIndexJsonLd
        url={`${SITE_URL}/blog`}
        posts={articles.map((a) => ({
          title: a.title,
          url: `${SITE_URL}/blog/${a.slug}`,
          description: a.excerpt || undefined,
          datePublished: a.publishedAt,
        }))}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Blog", url: `${SITE_URL}/blog` },
        ]}
      />

      <section className="relative mx-auto max-w-6xl px-5 pt-12 pb-24 md:pt-32">
        <SeasonalMarquee source="blog-banner" critters />

        {/* Header */}
        <header className="mx-auto mb-10 max-w-2xl text-center">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.28em] md:text-[11px]" style={{ color: "#7d5f18" }}>
            The SubhSandesh Journal
          </p>
          <h1 className="text-[40px] leading-[0.95] tracking-[-0.03em] md:text-[64px]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
            Stories for every <em style={{ color: "#8a6a1c", fontStyle: "italic" }}>celebration</em>
          </h1>
          <p className="mt-4 text-sm leading-relaxed md:text-base" style={{ color: "rgba(42,10,14,0.7)" }}>
            Gift ideas, festival traditions and heartfelt message inspiration to make every occasion unforgettable.
          </p>
          <FollowUs variant="inline" />
        </header>

        {/* Search — while a query is active it replaces the default grid below */}
        <BlogSearch>
          {/* Categories */}
          <div className="mb-10">
            <CategoryChips categories={categories} total={total} />
          </div>

          {/* Posts */}
          {articles.length === 0 ? (
            <div className="rounded-2xl py-20 text-center" style={{ background: "rgba(255,255,255,0.6)", border: "1px dashed rgba(61,12,17,0.2)" }}>
              <p className="text-lg" style={{ fontFamily: "'Playfair Display', serif", color: "#2a0a0e" }}>
                No posts yet — check back soon ✨
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured && <BlogCard article={featured} featured />}
              {rest.map((a) => (
                <BlogCard key={a.id} article={a} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pageCount > 1 && (
            <nav className="mt-12 flex flex-wrap items-center justify-center gap-3" aria-label="Blog pagination">
              {page > 1 && (
                <Link href={page === 2 ? "/blog" : `/blog?page=${page - 1}`} className="rounded-full px-5 py-2 text-sm font-bold" style={{ background: "rgba(61,12,17,0.06)", color: "#3d0c11", border: "1px solid rgba(61,12,17,0.12)" }}>
                  ← Previous
                </Link>
              )}
              {pageLinks(page, pageCount).map((p, i, arr) => (
                <span key={p} className="flex items-center gap-3">
                  {i > 0 && p - arr[i - 1] > 1 && <span aria-hidden style={{ color: "rgba(42,10,14,0.4)" }}>…</span>}
                  {p === page ? (
                    <span aria-current="page" className="text-sm font-bold" style={{ color: "#3d0c11" }}>{p}</span>
                  ) : (
                    <Link href={p === 1 ? "/blog" : `/blog?page=${p}`} className="text-sm" style={{ color: "rgba(42,10,14,0.6)" }}>
                      {p}
                    </Link>
                  )}
                </span>
              ))}
              {page < pageCount && (
                <Link href={`/blog?page=${page + 1}`} className="rounded-full px-5 py-2 text-sm font-bold" style={{ background: "#3d0c11", color: "#f5ede6" }}>
                  Next →
                </Link>
              )}
            </nav>
          )}
        </BlogSearch>
      </section>
    </main>
    </SeasonProvider>
  );
}
