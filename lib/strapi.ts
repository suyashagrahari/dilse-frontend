/**
 * Strapi blog CMS client.
 *
 * Talks to the Strapi v5 REST API (separate server, default :1337) and returns
 * typed blog data for the Next.js `/blog` routes. All reads are cached with the
 * `articles` tag so the Strapi publish webhook can revalidate them on demand
 * (see app/api/revalidate/route.ts) while also falling back to time-based ISR.
 *
 * Strapi v5 returns FLAT documents (no v4-style `data.attributes` nesting) and a
 * `documentId`. Populated media/relations are likewise flat.
 */
import { STRAPI_URL, STRAPI_API_TOKEN } from "@/lib/config";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StrapiMedia {
  id: number;
  url: string;
  alternativeText?: string | null;
  width?: number;
  height?: number;
  formats?: Record<string, { url: string; width: number; height: number }>;
}

export interface Author {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  bio?: string | null;
  jobTitle?: string | null;
  twitter?: string | null;
  linkedin?: string | null;
  instagram?: string | null;
  github?: string | null;
  website?: string | null;
  avatar?: StrapiMedia | null;
}

/**
 * Fallback profiles for the site's founder, used only when their Strapi author
 * record has no link of that kind yet (the instagram/github/website fields are
 * newer than the record). Never applied to any other author.
 */
export const FOUNDER_NAME = "Suyash Agrahari";
export const FOUNDER_PROFILES: Record<AuthorProfileKind, string> = {
  twitter: "https://x.com/SuyashAgrahari",
  linkedin: "https://www.linkedin.com/in/suyash-agrahari-717260228/",
  instagram: "https://www.instagram.com/suyash_agrahari_",
  github: "https://github.com/suyashagrahari",
  website: "https://portfolio-website-mu-fawn-27.vercel.app/",
};

export type AuthorProfileKind = "twitter" | "linkedin" | "instagram" | "github" | "website";

const PROFILE_ORDER: AuthorProfileKind[] = ["twitter", "linkedin", "instagram", "github", "website"];

/**
 * One ordered list of an author's profile links. Both the visible AuthorBox and
 * the JSON-LD Person.sameAs read from this, so what a reader can click and what
 * the graph claims can never drift apart.
 */
export function authorProfiles(author?: Author | null): { kind: AuthorProfileKind; url: string }[] {
  if (!author) return [];
  const isFounder = author.name?.trim() === FOUNDER_NAME;
  return PROFILE_ORDER.map((kind) => ({
    kind,
    url: (author[kind] || (isFounder ? FOUNDER_PROFILES[kind] : "") || "").trim(),
  })).filter((p) => /^https?:\/\//.test(p.url));
}

export interface Category {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  description?: string | null;
}

export interface Seo {
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalURL?: string | null;
  keywords?: string | null;
  ogType?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  structuredData?: Record<string, any> | null;
  noIndex?: boolean | null;
  metaImage?: StrapiMedia | null;
  /** External OG image URL (e.g. S3/CDN). Wins over `metaImage` when set. */
  metaImageUrl?: string | null;
}

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

// Strapi "blocks" rich-text content is an array of block nodes.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BlocksContent = any[];

export interface Article {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: BlocksContent | null;
  /** Optional raw markdown body — takes precedence over `content` blocks when present. */
  contentMarkdown?: string | null;
  coverImage?: StrapiMedia | null;
  /** External cover image URL (e.g. S3/CDN). Wins over `coverImage` when set. */
  coverImageUrl?: string | null;
  author?: Author | null;
  category?: Category | null;
  tags?: string[] | null;
  keyTakeaways?: string[] | null;
  readingTime?: number | null;
  featured?: boolean | null;
  seo?: Seo | null;
  faqs?: FaqItem[] | null;
  /** Templates linked to this post in Strapi — power the "Create a surprise" CTA. */
  relatedTemplates?: Template[] | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface Template {
  id: number;
  documentId: string;
  title: string;
  description?: string | null;
  /** Path ("/birthday-gf") or absolute URL the card links to. */
  url: string;
  category?: string | null;
  emoji?: string | null;
  featured?: boolean | null;
  order?: number | null;
  coverImage?: StrapiMedia | null;
}

interface StrapiListResponse<T> {
  data: T[];
  meta: { pagination: { page: number; pageSize: number; pageCount: number; total: number } };
}

// ─── Fetch primitives ───────────────────────────────────────────────────────

const REVALIDATE_SECONDS = 3600; // fallback ISR; webhook handles instant updates

async function strapiFetch<T>(path: string): Promise<T | null> {
  if (!STRAPI_URL) return null;
  try {
    const res = await fetch(`${STRAPI_URL}/api${path}`, {
      headers: STRAPI_API_TOKEN ? { Authorization: `Bearer ${STRAPI_API_TOKEN}` } : {},
      next: { tags: ["articles"], revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) {
      console.error(`[strapi] ${path} → ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    // CMS unreachable → degrade gracefully (empty blog) instead of crashing the build.
    console.error(`[strapi] fetch failed for ${path}:`, err);
    return null;
  }
}

/** Absolutize a Strapi media URL (Strapi returns root-relative paths for local uploads). */
export function strapiMedia(url?: string | null): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${STRAPI_URL}${url}`;
}

/**
 * Resolve an article's cover image, preferring an external URL (S3/CDN set via
 * `coverImageUrl` by the Blog Automation studio) over the uploaded Strapi media.
 * Returns "" when neither is set.
 */
export function articleCover(article?: {
  coverImageUrl?: string | null;
  coverImage?: StrapiMedia | null;
} | null): string {
  if (!article) return "";
  return strapiMedia(article.coverImageUrl) || strapiMedia(article.coverImage?.url);
}

/**
 * Resolve an article's Open Graph image: explicit OG url → OG media → cover url →
 * cover media. Returns "" when none is set (caller supplies the default).
 */
export function articleOgImage(article?: {
  seo?: Seo | null;
  coverImageUrl?: string | null;
  coverImage?: StrapiMedia | null;
} | null): string {
  if (!article) return "";
  return (
    strapiMedia(article.seo?.metaImageUrl) ||
    strapiMedia(article.seo?.metaImage?.url) ||
    articleCover(article)
  );
}

// ─── Populate strings ─────────────────────────────────────────────────────────

const LIST_POPULATE =
  "populate[coverImage]=true" +
  "&populate[author][populate][avatar]=true" +
  "&populate[category]=true";

const DETAIL_POPULATE =
  LIST_POPULATE +
  "&populate[seo][populate][metaImage]=true" +
  "&populate[faqs]=true" +
  "&populate[relatedTemplates][populate][coverImage]=true";

// ─── Public API ────────────────────────────────────────────────────────────────

export async function getArticles(opts: {
  page?: number;
  pageSize?: number;
  category?: string;
  featured?: boolean;
  /** Free-text query — case-insensitive match across title, excerpt & tags. */
  search?: string;
} = {}): Promise<{ articles: Article[]; pageCount: number; total: number }> {
  const { page = 1, pageSize = 12, category, featured, search } = opts;
  const params = [
    LIST_POPULATE,
    "sort[0]=publishedAt:desc",
    `pagination[page]=${page}`,
    `pagination[pageSize]=${pageSize}`,
  ];
  if (category) params.push(`filters[category][slug][$eq]=${encodeURIComponent(category)}`);
  if (featured) params.push("filters[featured][$eq]=true");
  const q = search?.trim();
  if (q) {
    // Case-insensitive OR across the fields a reader is likely searching by.
    const enc = encodeURIComponent(q);
    params.push(
      `filters[$or][0][title][$containsi]=${enc}`,
      `filters[$or][1][excerpt][$containsi]=${enc}`,
      `filters[$or][2][tags][$containsi]=${enc}`,
      `filters[$or][3][category][name][$containsi]=${enc}`,
    );
  }

  const res = await strapiFetch<StrapiListResponse<Article>>(`/articles?${params.join("&")}`);
  return {
    articles: res?.data ?? [],
    pageCount: res?.meta.pagination.pageCount ?? 0,
    total: res?.meta.pagination.total ?? 0,
  };
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const res = await strapiFetch<StrapiListResponse<Article>>(
    `/articles?filters[slug][$eq]=${encodeURIComponent(slug)}&${DETAIL_POPULATE}&pagination[pageSize]=1`
  );
  return res?.data?.[0] ?? null;
}

export async function getRelatedArticles(article: Article, limit = 3): Promise<Article[]> {
  const params = [
    LIST_POPULATE,
    "sort[0]=publishedAt:desc",
    `pagination[pageSize]=${limit}`,
    `filters[slug][$ne]=${encodeURIComponent(article.slug)}`,
  ];
  if (article.category?.slug) {
    params.push(`filters[category][slug][$eq]=${encodeURIComponent(article.category.slug)}`);
  }
  const res = await strapiFetch<StrapiListResponse<Article>>(`/articles?${params.join("&")}`);
  return res?.data ?? [];
}

export async function getCategories(): Promise<Category[]> {
  const res = await strapiFetch<StrapiListResponse<Category>>(
    `/categories?sort[0]=name:asc&pagination[pageSize]=100`
  );
  return res?.data ?? [];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const res = await strapiFetch<StrapiListResponse<Category>>(
    `/categories?filters[slug][$eq]=${encodeURIComponent(slug)}&pagination[pageSize]=1`
  );
  return res?.data?.[0] ?? null;
}

/**
 * Gift/occasion templates shown in the blog "Create a surprise" picker.
 * Cached under the shared `articles` tag, so the existing Strapi publish webhook
 * revalidates them on demand too. Sorted by `order` then title.
 */
export async function getTemplates(): Promise<Template[]> {
  const res = await strapiFetch<StrapiListResponse<Template>>(
    `/templates?populate[coverImage]=true&sort[0]=order:asc&sort[1]=title:asc&pagination[pageSize]=100`
  );
  return res?.data ?? [];
}

/** Lightweight list of every published article (slug + updatedAt) for sitemap + generateStaticParams. */
export async function getAllArticleSlugs(): Promise<{ slug: string; updatedAt: string }[]> {
  // Strapi caps page size at `rest.maxLimit` (100), so a single big request only
  // ever returns the first 100 articles. Page through until every article is fetched.
  const PAGE_SIZE = 100;
  const all: { slug: string; updatedAt: string }[] = [];
  let page = 1;
  let pageCount = 1;

  do {
    const res = await strapiFetch<StrapiListResponse<Pick<Article, "slug" | "updatedAt">>>(
      `/articles?fields[0]=slug&fields[1]=updatedAt` +
        `&pagination[page]=${page}&pagination[pageSize]=${PAGE_SIZE}&sort[0]=publishedAt:desc`
    );
    if (!res) break; // CMS unreachable → return whatever we have so far
    all.push(...res.data);
    pageCount = res.meta.pagination.pageCount;
    page += 1;
  } while (page <= pageCount);

  return all;
}
