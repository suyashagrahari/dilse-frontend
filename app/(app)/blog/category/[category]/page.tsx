import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildMeta, SITE_URL, SITE_NAME } from "@/lib/seo";
import { getArticles, getCategories, getCategoryBySlug } from "@/lib/strapi";
import BlogCard from "@/components/blog/BlogCard";
import CategoryChips from "@/components/blog/CategoryChips";
import { BreadcrumbJsonLd } from "@/components/JsonLd";

export const revalidate = 3600;
export const dynamicParams = true;

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

  const [{ articles }, categories] = await Promise.all([
    getArticles({ category, pageSize: 30 }),
    getCategories(),
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
        <header className="mx-auto mb-10 max-w-2xl text-center">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.28em] md:text-[11px]" style={{ color: "#c9a84c" }}>
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
        </header>

        <div className="mb-10">
          <CategoryChips categories={categories} active={cat.slug} />
        </div>

        {articles.length === 0 ? (
          <p className="py-20 text-center" style={{ color: "rgba(42,10,14,0.6)" }}>No posts in this category yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => (
              <BlogCard key={a.id} article={a} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
