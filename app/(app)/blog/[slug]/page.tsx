import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, ChevronRight, Sparkles } from "lucide-react";
import { buildMeta, SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from "@/lib/seo";
import { getArticleBySlug, getAllArticleSlugs, getRelatedArticles, strapiMedia } from "@/lib/strapi";
import { formatDate } from "@/lib/blog-utils";
import ArticleBody from "@/components/blog/ArticleBody";
import AuthorBox from "@/components/blog/AuthorBox";
import FAQAccordion from "@/components/blog/FAQAccordion";
import ShareButtons from "@/components/blog/ShareButtons";
import RelatedPosts from "@/components/blog/RelatedPosts";
import TableOfContents from "@/components/blog/TableOfContents";
import { BlogPostingJsonLd, BreadcrumbJsonLd, FAQJsonLd } from "@/components/JsonLd";

export const revalidate = 3600;
// Allow on-demand pages not built at deploy time to be generated + cached on first hit.
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getAllArticleSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return buildMeta({ title: "Post not found | SubhSandesh" });

  const seo = article.seo;
  const title = seo?.metaTitle || article.title;
  const description = seo?.metaDescription || article.excerpt || `Read ${article.title} on the ${SITE_NAME} blog.`;
  const canonical = seo?.canonicalURL || `${SITE_URL}/blog/${article.slug}`;
  const ogImage = strapiMedia(seo?.metaImage?.url || article.coverImage?.url) || DEFAULT_OG_IMAGE;

  const meta = buildMeta({
    title: `${title} | ${SITE_NAME} Blog`,
    description,
    alternates: { canonical },
    ...(seo?.keywords ? { keywords: seo.keywords.split(",").map((k) => k.trim()) } : {}),
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: article.author ? [article.author.name] : undefined,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  });

  // buildMeta hardcodes index:true; honor the per-post noIndex toggle here.
  if (seo?.noIndex) {
    meta.robots = { index: false, follow: true, googleBot: { index: false, follow: true } };
  }
  return meta;
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const related = await getRelatedArticles(article);
  const cover = strapiMedia(article.coverImage?.url);
  const url = `${SITE_URL}/blog/${article.slug}`;
  const ogImage = strapiMedia(article.seo?.metaImage?.url || article.coverImage?.url) || DEFAULT_OG_IMAGE;
  const takeaways = Array.isArray(article.keyTakeaways) ? article.keyTakeaways : [];
  // Raw markdown body (uploaded/pasted .md) wins over blocks; either renders.
  const markdown = article.contentMarkdown?.trim() || null;
  const hasBody = Boolean(markdown) || (Array.isArray(article.content) && article.content.length > 0);

  return (
    <main className="min-h-screen overflow-x-clip" style={{ background: "#f5ede6", color: "#2a0a0e" }}>
      {/* ── Structured data ── */}
      <BlogPostingJsonLd
        title={article.seo?.metaTitle || article.title}
        description={article.seo?.metaDescription || article.excerpt || article.title}
        url={url}
        image={ogImage}
        datePublished={article.publishedAt}
        dateModified={article.updatedAt}
        authorName={article.author?.name || SITE_NAME}
        authorUrl={article.author ? `${SITE_URL}/blog` : undefined}
        keywords={article.seo?.keywords || (article.tags || []).join(", ") || undefined}
        section={article.category?.name}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Blog", url: `${SITE_URL}/blog` },
          ...(article.category ? [{ name: article.category.name, url: `${SITE_URL}/blog/category/${article.category.slug}` }] : []),
          { name: article.title, url },
        ]}
      />
      {article.faqs && article.faqs.length > 0 && <FAQJsonLd faqs={article.faqs} />}

      {/* lg: items-stretch (default) makes the aside as tall as the article so the
          sticky TOC stays pinned through the whole left-content scroll. */}
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-5 pt-12 pb-24 md:pt-32 lg:flex-row lg:justify-center lg:gap-16">
      <article className="relative w-full lg:max-w-[52rem]">
        {/* Breadcrumb */}
        <nav className="mb-6 flex flex-wrap items-center gap-1 text-xs" style={{ color: "rgba(42,10,14,0.55)" }} aria-label="Breadcrumb">
          <Link href="/blog" className="hover:underline">Blog</Link>
          {article.category && (
            <>
              <ChevronRight size={12} />
              <Link href={`/blog/category/${article.category.slug}`} className="hover:underline">{article.category.name}</Link>
            </>
          )}
        </nav>

        {/* Title block */}
        <header>
          {article.category && (
            <span className="mb-3 inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em]" style={{ background: "#3d0c11", color: "#f5ede6" }}>
              {article.category.name}
            </span>
          )}
          <h1 className="text-[34px] leading-[1.05] tracking-[-0.02em] md:text-[52px]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
            {article.title}
          </h1>
          {article.excerpt && (
            <p className="mt-4 text-lg leading-relaxed" style={{ color: "rgba(42,10,14,0.72)" }}>
              {article.excerpt}
            </p>
          )}
          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm" style={{ color: "rgba(42,10,14,0.6)" }}>
            {article.author && <span className="font-semibold" style={{ color: "#2a0a0e" }}>{article.author.name}</span>}
            <span>·</span>
            <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
            {article.readingTime ? (
              <span className="flex items-center gap-1"><Clock size={14} /> {article.readingTime} min read</span>
            ) : null}
          </div>
        </header>

        {/* Cover */}
        {cover && (
          <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-2xl" style={{ background: "#efe3d8" }}>
            <Image src={cover} alt={article.coverImage?.alternativeText || article.title} fill priority sizes="(max-width:768px) 100vw, 768px" className="object-cover" />
          </div>
        )}

        {/* Key takeaways (GEO/AEO TL;DR) */}
        {takeaways.length > 0 && (
          <div className="mt-8 rounded-2xl p-5" style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.35)" }}>
            <p className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: "#9a7415" }}>
              <Sparkles size={14} /> Key takeaways
            </p>
            <ul className="space-y-1.5">
              {takeaways.map((t, i) => (
                <li key={i} className="flex gap-2 text-sm leading-relaxed" style={{ color: "#2a0a0e" }}>
                  <span style={{ color: "#c9a84c" }}>•</span> {t}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* TOC — mobile only (desktop uses the sticky sidebar) */}
        {hasBody && (
          <div className="mt-8">
            <TableOfContents content={article.content} markdown={markdown} variant="inline" />
          </div>
        )}

        {/* Body */}
        {hasBody && (
          <div className="mt-8">
            <ArticleBody content={article.content} markdown={markdown} />
          </div>
        )}

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2">
            {article.tags.map((t) => (
              <span key={t} className="rounded-full px-3 py-1 text-xs" style={{ background: "rgba(61,12,17,0.06)", color: "rgba(42,10,14,0.7)" }}>
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* Share */}
        <div className="mt-8 border-t pt-6" style={{ borderColor: "rgba(61,12,17,0.12)" }}>
          <ShareButtons url={url} title={article.title} />
        </div>

        {/* FAQ */}
        {article.faqs && article.faqs.length > 0 && <FAQAccordion faqs={article.faqs} />}

        {/* Author */}
        {article.author && (
          <div className="mt-12">
            <AuthorBox author={article.author} />
          </div>
        )}

        {/* Related */}
        <RelatedPosts articles={related} />
      </article>

      {/* Sticky table-of-contents sidebar (desktop) */}
      {hasBody && (
        <aside className="hidden shrink-0 lg:block lg:w-72 xl:w-80">
          <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pr-1">
            <TableOfContents content={article.content} markdown={markdown} variant="sidebar" />
          </div>
        </aside>
      )}
      </div>
    </main>
  );
}
