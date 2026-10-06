import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildMeta, SITE_URL, SITE_NAME } from "@/lib/seo";
import { getArticles, getCategories, getCategoriesWithCounts, getCategoryBySlug } from "@/lib/strapi";
import InfiniteBlogGrid from "@/components/blog/InfiniteBlogGrid";
import CategoryChips from "@/components/blog/CategoryChips";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import FollowUs from "@/components/blog/FollowUs";
import { PromoMarquee } from "@/components/promo/PromoBanners";

export const revalidate = 3600;
export const dynamicParams = true;

const PAGE_SIZE = 12;

// Every post in a category, as {slug,title}. The visible grid streams pages
// client-side (which crawlers don't execute), so we also emit a complete crawlable
// link index below — this makes every deep post reachable in one hop from the
// category page, strengthening topical clustering and fixing "discovered, not indexed".
async function getAllCategoryLinks(category: string): Promise<{ slug: string; title: string }[]> {
  const out: { slug: string; title: string }[] = [];
  let page = 1;
  let pageCount = 1;
  do {
    const { articles, pageCount: pc } = await getArticles({ category, page, pageSize: 100 });
    out.push(...articles.map((a) => ({ slug: a.slug, title: a.title })));
    pageCount = pc;
    page += 1;
  } while (page <= pageCount);
  return out;
}

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const cat = await getCategoryBySlug(category);
  if (!cat) return buildMeta({ title: "Category not found | SubhSandesh Blog" });
  return buildMeta({
    title: `${cat.name} — Blog | ${SITE_NAME}`,
    description: cat.description || `Articles, guides and ideas about ${cat.name} on the ${SITE_NAME} blog.`,
    alternates: { canonical: `${SITE_URL}/blog/category/${cat.slug}` },
  });
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const cat = await getCategoryBySlug(category);
  if (!cat) notFound();

  // SSR only the first page for instant paint; InfiniteBlogGrid streams the rest
  // client-side as the user scrolls.
  const [{ articles, pageCount }, { categories, total }, allLinks] = await Promise.all([
    getArticles({ category, page: 1, pageSize: PAGE_SIZE }),
    getCategoriesWithCounts(),
    getAllCategoryLinks(category),
  ]);

  return (
    <main className="min-h-screen overflow-x-hidden" style={{ background: "#f5ede6", color: "#2a0a0e" }}>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Blog", url: `${SITE_URL}/blog` },
          { name: cat.name, url: `${SITE_URL}/blog/category/${cat.slug}` },
        ]}
      />
      <section className="relative mx-auto max-w-6xl px-5 pt-12 pb-24 md:pt-32">
        <PromoMarquee source="blog-banner" />
        <header className="mx-auto mb-10 max-w-2xl text-center">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.28em] md:text-[11px]" style={{ color: "#7d5f18" }}>
            Category
          </p>
          <h1 className="text-[38px] leading-[0.95] tracking-[-0.03em] md:text-[58px]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
            {cat.name}
          </h1>
          {cat.description && (
            <p className="mt-4 text-sm leading-relaxed md:text-base" style={{ color: "rgba(42,10,14,0.7)" }}>
              {cat.description}
            </p>
          )}
          <FollowUs variant="inline" />
        </header>

        <div className="mb-10">
          <CategoryChips categories={categories} active={cat.slug} total={total} />
        </div>

        {articles.length === 0 ? (
          <p className="py-20 text-center" style={{ color: "rgba(42,10,14,0.6)" }}>No posts in this category yet.</p>
        ) : (
          <InfiniteBlogGrid
            initialArticles={articles}
            initialPageCount={pageCount}
            category={cat.slug}
            pageSize={PAGE_SIZE}
          />
        )}

        {/* Complete crawlable index of every post in this category (visually hidden,
            available to assistive tech + search/answer-engine crawlers). */}
        {allLinks.length > 0 && (
          <nav aria-label={`All ${cat.name} articles`} className="sr-only">
            <ul>
              {allLinks.map((a) => (
                <li key={a.slug}>
                  <a href={`/blog/${a.slug}`}>{a.title}</a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </section>
    </main>
  );
}
