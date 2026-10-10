import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, ChevronRight, Sparkles } from "lucide-react";
import { buildMeta, SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from "@/lib/seo";
import { getArticleBySlug, getAllArticleSlugs, getRelatedArticles, articleCover, articleOgImage, strapiMedia, authorProfiles } from "@/lib/strapi";
import { formatDate } from "@/lib/blog-utils";
import ArticleBody from "@/components/blog/ArticleBody";
import AuthorBox from "@/components/blog/AuthorBox";
import FAQAccordion from "@/components/blog/FAQAccordion";
import ShareButtons from "@/components/blog/ShareButtons";
import RelatedPosts from "@/components/blog/RelatedPosts";
import GuidePromo from "@/components/guides/GuidePromo";
import { getGuidesForArticle } from "@/lib/guides";
import TableOfContents from "@/components/blog/TableOfContents";
import TemplatesPromoCard from "@/components/blog/TemplatesPromoCard";
import { ArticleGraphJsonLd } from "@/components/JsonLd";
import FollowUs from "@/components/blog/FollowUs";
import { SeasonalMarquee, SeasonalCountdownCard } from "@/components/promo/SeasonalPromos";
import { SeasonProvider } from "@/hooks/useSeason";
import { getSeasonServer } from "@/lib/season.server";

export const revalidate = 3600;
// Allow on-demand pages not built at deploy time to be generated + cached on first hit.
export const dynamicParams = true;

// Prerendering ALL articles at build time exploded the image (668 pages ≈ 500 MB of
// static HTML/RSC) and dominated build time. Since `dynamicParams = true`, any slug
// NOT returned here is still rendered on first request and cached for `revalidate`
// seconds (ISR) — fully indexable, listed in the sitemap. So we only pre-build the
// newest N (the hot pages); the long tail generates lazily on demand. Tune via
// BLOG_SSG_COUNT (set to a huge number to restore full prerender if ever needed).
const BLOG_SSG_COUNT = Number(process.env.BLOG_SSG_COUNT ?? 30);

export async function generateStaticParams() {
  const slugs = await getAllArticleSlugs(); // already sorted publishedAt:desc
  return slugs.slice(0, BLOG_SSG_COUNT).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return buildMeta({ title: "Post not found | SubhSandesh" });

  const seo = article.seo;
  const title = seo?.metaTitle || article.title;
  const description = seo?.metaDescription || article.excerpt || `Read ${article.title} on the ${SITE_NAME} blog.`;
  const canonical = seo?.canonicalURL || `${SITE_URL}/blog/${article.slug}`;
  const ogImage = articleOgImage(article) || DEFAULT_OG_IMAGE;

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

  // Templates explicitly linked to this post in Strapi drive the "Create now" CTA:
  //  • one linked  → redirect straight to that template's page
  //  • several     → open the picker showing just those linked templates
  //  • none linked → redirect to the /templates listing page (no picker)
  const linkedTemplates = article.relatedTemplates ?? [];
  const related = await getRelatedArticles(article);
  // Guides for the templates this post is linked to, if any of them have one.
  // Sits between the author box and the related posts: the reader has finished
  // the article and is deciding what to do, which is the moment a "here is how
  // to actually build it" is useful rather than an interruption.
  const articleGuides = getGuidesForArticle(article);
  const cover = articleCover(article);
  const url = `${SITE_URL}/blog/${article.slug}`;
  const ogImage = articleOgImage(article) || DEFAULT_OG_IMAGE;
  const takeaways = Array.isArray(article.keyTakeaways) ? article.keyTakeaways : [];
  // Raw markdown body (uploaded/pasted .md) wins over blocks; either renders.
  const markdown = article.contentMarkdown?.trim() || null;
  const hasBody = Boolean(markdown) || (Array.isArray(article.content) && article.content.length > 0);

  // ── Unified JSON-LD @graph inputs ──
  const wordCount = markdown
    ? markdown.split(/\s+/).filter(Boolean).length
    : article.readingTime
    ? article.readingTime * 200
    : undefined;
  // Same helper the visible AuthorBox uses, so sameAs and the clickable icons
  // can never disagree: X, LinkedIn, Instagram, GitHub, portfolio.
  const authorSameAs = authorProfiles(article.author).map((p) => p.url);
  const authorAvatar = article.author?.avatar;
  const authorForLd = article.author
    ? {
        name: article.author.name,
        slug: article.author.slug,
        url: `${SITE_URL}/blog`,
        jobTitle: article.author.jobTitle,
        bio: article.author.bio,
        image: strapiMedia(authorAvatar?.url) || null,
        imageWidth: authorAvatar?.width ?? null,
        imageHeight: authorAvatar?.height ?? null,
        sameAs: authorSameAs,
      }
    : null;
  const breadcrumb = [
    { name: "Home", url: SITE_URL },
    { name: "Blog", url: `${SITE_URL}/blog` },
    ...(article.category
      ? [{ name: article.category.name, url: `${SITE_URL}/blog/category/${article.category.slug}` }]
      : []),
    { name: article.title, url },
  ];

  // Hourly, like the page itself — see lib/season.server.ts.
  const season = await getSeasonServer(3600);

  return (
    <SeasonProvider season={season}>
    <main className="min-h-screen overflow-x-clip" style={{ background: "#f5ede6", color: "#2a0a0e" }}>
      {/* ── Structured data: ONE unified @graph (Organization ↔ WebSite ↔ Person
          ↔ BlogPosting ↔ Breadcrumb ↔ FAQ + any studio HowTo/rich types) ── */}
      <ArticleGraphJsonLd
        url={url}
        headline={article.seo?.metaTitle || article.title}
        description={article.seo?.metaDescription || article.excerpt || article.title}
        image={ogImage}
        datePublished={article.publishedAt}
        dateModified={article.updatedAt}
        keywords={article.seo?.keywords || (article.tags || []).join(", ") || undefined}
        section={article.category?.name}
        wordCount={wordCount}
        readingTimeMinutes={article.readingTime}
        author={authorForLd}
        breadcrumb={breadcrumb}
        faqs={article.faqs ?? undefined}
        extra={article.seo?.structuredData}
        speakableSelectors={[".article-summary", ".key-takeaways"]}
      />

      {/* lg: items-stretch (default) makes the aside as tall as the article so the
          sticky TOC stays pinned through the whole left-content scroll. */}
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-5 pt-12 pb-24 md:pt-32 lg:flex-row lg:justify-center lg:gap-16">
      <article className="relative w-full lg:max-w-[52rem]">
        {/* The wishlist sale strip — renders nothing unless a countdown is running. */}
        <SeasonalMarquee source="blog-banner" critters />

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
            <p className="article-summary mt-4 text-lg leading-relaxed" style={{ color: "rgba(42,10,14,0.72)" }}>
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

        {/* Create-a-surprise CTA — phone/tablet only, and deliberately the first
            thing after the cover.
            There is no sidebar on a phone, so this used to be the reader's only
            CTA and it sat after the body, the tags, the share row AND the FAQ —
            past everything. Someone who arrived wanting the template had to read
            the whole post to learn it existed. Above the takeaways it is the
            first actionable thing on the page; the compact variant keeps it short
            enough that the article still starts on the first screen, and the full
            card still closes the post below. */}
        <div className="mt-8 lg:hidden">
          <TemplatesPromoCard linked={linkedTemplates} variant="compact" />
        </div>

        {/* Key takeaways (GEO/AEO TL;DR) */}
        {takeaways.length > 0 && (
          <div className="key-takeaways mt-8 rounded-2xl p-5" style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.35)" }}>
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

        {/* The sale's big countdown, after the TL;DR where the reader decides to stay. */}
        <SeasonalCountdownCard source="blog-card" />

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

        {/* Create-a-surprise CTA — mobile/tablet only (desktop shows it in the sticky sidebar) */}
        <div className="mt-12 lg:hidden">
          <TemplatesPromoCard linked={linkedTemplates} />
        </div>

        {/* Author */}
        {article.author && (
          <div className="mt-12">
            <AuthorBox author={article.author} />
          </div>
        )}

        {/* The brand's own accounts — a reader who reached the end is the one
            most likely to follow. Share buttons above are for THIS post. */}
        <FollowUs />

        {/* How to build the thing the post is about */}
        <GuidePromo guides={articleGuides} heading="See it built, step by step" />

        {/* Related */}
        <RelatedPosts articles={related} />
      </article>

      {/* Sticky sidebar (desktop): table of contents + create-a-surprise CTA.
          The aside fills the viewport height; only the TOC scrolls when long so
          the promo card stays pinned and fully visible (never cut off). */}
      <aside className="hidden shrink-0 lg:block lg:w-72 xl:w-80">
        <div className="sticky top-28 flex h-[calc(100vh-8rem)] flex-col gap-5">
          {hasBody && (
            <div className="flex min-h-0 flex-1 flex-col">
              <TableOfContents content={article.content} markdown={markdown} variant="sidebar" />
            </div>
          )}
          <div className="shrink-0">
            <TemplatesPromoCard linked={linkedTemplates} />
          </div>
        </div>
      </aside>
      </div>
    </main>
    </SeasonProvider>
  );
}
