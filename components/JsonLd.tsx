import { SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION, SITE_URL, DEFAULT_OG_IMAGE } from "@/lib/seo";
import { BUSINESS } from "@/lib/business";
import { SOCIAL_ACCOUNTS } from "@/lib/social";
import type { HowToData, AggregateRatingData } from "@/lib/seo-data";
import { FOUNDER_NAME, FOUNDER_PROFILES } from "@/lib/strapi";

// The founder's own profiles — X, LinkedIn, Instagram, GitHub, portfolio — used as
// schema.org `sameAs` on the Person so search and answer engines can confirm this
// is one real, identifiable author across the web.
//
// These belong to the PERSON, not the Organization. Claiming a founder's personal
// profiles as the company's sameAs invites the two entities to be conflated; the
// `founder` relation is the correct way to connect them, and it is already set.
const FOUNDER_SAME_AS = Object.values(FOUNDER_PROFILES);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function JsonLd({ data }: { data: Record<string, any> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ─── WebSite ─────────────────────────────────────────────────────────────────
export function WebsiteJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: SITE_NAME,
        alternateName: `${SITE_NAME} - ${SITE_TAGLINE}`,
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        inLanguage: ["en-IN", "en"],
        publisher: { "@id": `${SITE_URL}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE_URL}/templates?search={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      }}
    />
  );
}

// ─── Organization (India geo) ─────────────────────────────────────────────────
export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: DEFAULT_OG_IMAGE,
          width: 1370,
          height: 784,
        },
        description: SITE_DESCRIPTION,
        // Must match the registered business (lib/business.ts) — payment
        // gateways and search engines both compare it with the KYC record.
        foundingDate: "2026-03-04",
        legalName: BUSINESS.name,
        // The COMPANY's own accounts (lib/social.ts). The founder's personal
        // profiles stay on the Person below — see FOUNDER_SAME_AS.
        sameAs: SOCIAL_ACCOUNTS.map((a) => a.href),
        email: BUSINESS.email,
        telephone: BUSINESS.phone.tel,
        address: {
          "@type": "PostalAddress",
          streetAddress: BUSINESS.address.line1,
          addressLocality: BUSINESS.address.city,
          addressRegion: BUSINESS.address.state,
          postalCode: BUSINESS.address.postalCode,
          addressCountry: "IN",
        },
        areaServed: {
          "@type": "Country",
          name: "India",
        },
        knowsLanguage: ["en", "hi"],
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          email: BUSINESS.email,
          telephone: BUSINESS.phone.tel,
          hoursAvailable: {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            opens: "00:00",
            closes: "23:59",
          },
          availableLanguage: ["English", "Hindi"],
          areaServed: "IN",
        },
        founder: {
          "@type": "Person",
          "@id": `${SITE_URL}/#person-author`,
          name: FOUNDER_NAME,
          url: `${SITE_URL}/about-us`,
          jobTitle: "Founder",
          sameAs: FOUNDER_SAME_AS,
        },
      }}
    />
  );
}

// ─── WebApplication (with aggregate rating) ───────────────────────────────────
export function WebAppJsonLd({
  aggregateRating,
}: {
  aggregateRating?: { ratingValue: number; reviewCount: number };
} = {}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: SITE_NAME,
        url: SITE_URL,
        applicationCategory: "LifestyleApplication",
        applicationSubCategory: "GiftApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript",
        description: SITE_DESCRIPTION,
        image: DEFAULT_OG_IMAGE,
        inLanguage: ["en-IN", "en"],
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
        },
        aggregateRating: aggregateRating
          ? {
              "@type": "AggregateRating",
              ratingValue: aggregateRating.ratingValue,
              reviewCount: aggregateRating.reviewCount,
              bestRating: "5",
              worstRating: "1",
            }
          : {
              "@type": "AggregateRating",
              ratingValue: "4.9",
              reviewCount: "25000",
              bestRating: "5",
              worstRating: "1",
            },
      }}
    />
  );
}

// ─── Breadcrumb ───────────────────────────────────────────────────────────────
export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.name,
          item: item.url,
        })),
      }}
    />
  );
}

// ─── Template (CreativeWork) ──────────────────────────────────────────────────
export function TemplateJsonLd({
  name,
  description,
  category,
  url,
}: {
  name: string;
  description: string;
  category: string;
  url: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name,
        description,
        genre: category,
        url,
        provider: {
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_URL,
        },
        isAccessibleForFree: true,
        inLanguage: "en-IN",
      }}
    />
  );
}

// ─── SoftwareApplication per-template (shows star rating in search) ───────────
export function TemplateAppJsonLd({
  name,
  description,
  url,
  aggregateRating,
}: {
  name: string;
  description: string;
  url: string;
  aggregateRating: AggregateRatingData;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: `${SITE_NAME} — ${name}`,
        description,
        url,
        applicationCategory: "LifestyleApplication",
        operatingSystem: "Any",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: aggregateRating.ratingValue,
          reviewCount: aggregateRating.reviewCount,
          bestRating: "5",
          worstRating: "1",
        },
      }}
    />
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
export function FAQJsonLd({ faqs }: { faqs: { question: string; answer: string }[] }) {
  if (!faqs.length) return null;
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      }}
    />
  );
}

// ─── HowTo ────────────────────────────────────────────────────────────────────
export function HowToJsonLd({ howTo }: { howTo: HowToData }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: howTo.name,
        description: howTo.description,
        totalTime: howTo.totalTime,
        tool: [{ "@type": "HowToTool", name: "SubhSandesh Account (Free)" }],
        supply: [
          { "@type": "HowToSupply", name: "Personal Message" },
          { "@type": "HowToSupply", name: "Photos (optional)" },
          { "@type": "HowToSupply", name: "Music playlist (optional)" },
        ],
        step: howTo.steps.map((s, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          name: s.name,
          text: s.text,
        })),
      }}
    />
  );
}

// ─── ItemList (for templates listing page) ────────────────────────────────────
export function ItemListJsonLd({
  items,
}: {
  items: { name: string; url: string; description?: string }[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Digital Gift & Celebration Templates — SubhSandesh",
        description:
          "Browse personalized digital gift templates for every occasion — birthdays, weddings, Eid, Holi, anniversaries, and more.",
        numberOfItems: items.length,
        itemListElement: items.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.name,
          url: item.url,
          ...(item.description ? { description: item.description } : {}),
        })),
      }}
    />
  );
}

// ─── BlogPosting (single blog article) ────────────────────────────────────────
export function BlogPostingJsonLd({
  title,
  description,
  url,
  image,
  datePublished,
  dateModified,
  authorName,
  authorUrl,
  keywords,
  section,
}: {
  title: string;
  description: string;
  url: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  authorName: string;
  authorUrl?: string;
  keywords?: string;
  section?: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: title,
        description,
        url,
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        ...(image ? { image: [image] } : {}),
        datePublished,
        dateModified: dateModified || datePublished,
        inLanguage: "en-IN",
        ...(keywords ? { keywords } : {}),
        ...(section ? { articleSection: section } : {}),
        author: {
          "@type": "Person",
          name: authorName,
          ...(authorUrl ? { url: authorUrl } : {}),
        },
        publisher: {
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_URL,
          logo: { "@type": "ImageObject", url: DEFAULT_OG_IMAGE },
        },
      }}
    />
  );
}

// ─── Blog index (Blog + ItemList of posts) ─────────────────────────────────────
export function BlogIndexJsonLd({
  url,
  posts,
}: {
  url: string;
  posts: { title: string; url: string; description?: string; datePublished?: string }[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Blog",
        name: `${SITE_NAME} Blog`,
        description:
          "Guides, ideas and inspiration for celebrating birthdays, weddings, festivals and every special Indian occasion.",
        url,
        inLanguage: ["en-IN", "en"],
        publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
        blogPost: posts.map((p) => ({
          "@type": "BlogPosting",
          headline: p.title,
          url: p.url,
          ...(p.description ? { description: p.description } : {}),
          ...(p.datePublished ? { datePublished: p.datePublished } : {}),
        })),
      }}
    />
  );
}

// ─── Extra JSON-LD authored by the Blog Automation studio ─────────────────────
// Blog posts carry a `seo.structuredData` array (Article + FAQPage + often a rich
// HowTo, etc.) generated per-article. We render the blog's Article, FAQPage and
// BreadcrumbList from dedicated, always-valid builders above, so here we emit ONLY
// the *extra* types the studio produced (e.g. HowTo) — skipping anything already
// covered so the page never ships duplicate/conflicting schema for the same type.
const COVERED_LD_TYPES = new Set([
  "article",
  "blogposting",
  "faqpage",
  "breadcrumblist",
  "website",
  "organization",
  "webapplication",
  "webpage",
]);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeLdArray(data: unknown): Record<string, any>[] {
  let value = data;
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return [];
    }
  }
  const list = Array.isArray(value) ? value : value && typeof value === "object" ? [value] : [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return list.filter((b): b is Record<string, any> => Boolean(b) && typeof b === "object");
}

export function ExtraStructuredData({ data }: { data: unknown }) {
  const blocks = normalizeLdArray(data).filter((b) => {
    const type = String(b["@type"] || "").toLowerCase();
    return type.length > 0 && !COVERED_LD_TYPES.has(type);
  });
  if (!blocks.length) return null;
  return (
    <>
      {blocks.map((b, i) => (
        <JsonLd key={i} data={b["@context"] ? b : { "@context": "https://schema.org", ...b }} />
      ))}
    </>
  );
}

// ─── Blog post — ONE unified @graph (best-practice for GEO/AEO) ────────────────
// A single JSON-LD script whose nodes cross-reference each other by @id
// (Organization ↔ WebSite ↔ Person author ↔ BlogPosting ↔ BreadcrumbList ↔
// FAQPage), plus any extra rich types the Blog Automation studio produced (HowTo,
// etc.) merged in. Answer engines parse this as one connected entity graph, which
// they cite far more reliably than disconnected, separate schema blocks.
export function ArticleGraphJsonLd({
  url,
  headline,
  description,
  image,
  datePublished,
  dateModified,
  keywords,
  section,
  wordCount,
  readingTimeMinutes,
  author,
  breadcrumb,
  faqs,
  extra,
  speakableSelectors,
}: {
  url: string;
  headline: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  keywords?: string | null;
  section?: string;
  wordCount?: number;
  /** Strapi readingTime, in minutes → BlogPosting.timeRequired as an ISO 8601 duration. */
  readingTimeMinutes?: number | null;
  author?: {
    name: string;
    /** Strapi author slug — gives the Person a stable @id shared by every post. */
    slug?: string | null;
    url?: string;
    jobTitle?: string | null;
    /** Strapi bio → Person.description. */
    bio?: string | null;
    /** Absolute avatar URL (run Strapi paths through strapiMedia first). */
    image?: string | null;
    imageWidth?: number | null;
    imageHeight?: number | null;
    sameAs?: string[];
  } | null;
  breadcrumb: { name: string; url: string }[];
  faqs?: { question: string; answer: string }[];
  extra?: unknown;
  speakableSelectors?: string[];
}) {
  const orgId = `${SITE_URL}/#organization`;
  const siteId = `${SITE_URL}/#website`;
  const postId = `${url}#post`;
  // Site-wide, not per-article: every post by the same author must reference ONE
  // Person entity, or the graph asserts 800+ unrelated people with the same name
  // and no author authority accumulates anywhere.
  const authorId = author?.slug
    ? `${SITE_URL}/#person-${author.slug}`
    : `${SITE_URL}/#person`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const graph: Record<string, any>[] = [];

  graph.push({
    "@type": "Organization",
    "@id": orgId,
    name: SITE_NAME,
    url: SITE_URL,
    logo: { "@type": "ImageObject", url: DEFAULT_OG_IMAGE, width: 1370, height: 784 },
  });

  graph.push({
    "@type": "WebSite",
    "@id": siteId,
    url: SITE_URL,
    name: SITE_NAME,
    publisher: { "@id": orgId },
    inLanguage: ["en-IN", "en"],
  });

  const hasAuthor = Boolean(author?.name);
  if (hasAuthor && author) {
    const jobTitle = (author.jobTitle || "").trim();
    // Already complete: the caller builds this with authorProfiles(), which applies
    // the founder fallback only to the founder. Do NOT union FOUNDER_SAME_AS here —
    // that would claim their personal profiles for any future author.
    const sameAs = [...new Set(author.sameAs || [])].filter(Boolean);
    graph.push({
      "@type": "Person",
      "@id": authorId,
      name: author.name,
      ...(author.url ? { url: author.url } : {}),
      ...(jobTitle ? { jobTitle } : {}),
      ...(author.bio ? { description: author.bio } : {}),
      ...(author.image
        ? {
            image: {
              "@type": "ImageObject",
              url: author.image,
              ...(author.imageWidth ? { width: author.imageWidth } : {}),
              ...(author.imageHeight ? { height: author.imageHeight } : {}),
            },
          }
        : {}),
      worksFor: { "@id": orgId },
      ...(sameAs.length ? { sameAs } : {}),
    });
    // The bio and jobTitle both say founder, so assert it — a named founder is one
    // of the stronger organisation-credibility signals available.
    if (/founder/i.test(jobTitle)) {
      const org = graph.find((n) => n["@id"] === orgId);
      if (org && org.founder === undefined) org.founder = { "@id": authorId };
    }
  }

  const kw = (keywords || "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  graph.push({
    "@type": "BlogPosting",
    "@id": postId,
    mainEntityOfPage: url,
    isPartOf: { "@id": siteId },
    headline,
    description,
    datePublished,
    dateModified: dateModified || datePublished,
    author: hasAuthor ? { "@id": authorId } : { "@id": orgId },
    publisher: { "@id": orgId },
    ...(image
      ? { image: { "@type": "ImageObject", url: image, width: 1200, height: 630 }, thumbnailUrl: image }
      : {}),
    ...(typeof wordCount === "number" && wordCount > 0 ? { wordCount } : {}),
    ...(kw.length ? { keywords: kw } : {}),
    ...(section ? { articleSection: section } : {}),
    inLanguage: "en-IN",
    // True of every post on this blog — nothing is gated.
    isAccessibleForFree: true,
    ...(typeof readingTimeMinutes === "number" && readingTimeMinutes > 0
      ? { timeRequired: `PT${Math.round(readingTimeMinutes)}M` }
      : {}),
    ...(speakableSelectors && speakableSelectors.length
      ? { speakable: { "@type": "SpeakableSpecification", cssSelector: speakableSelectors } }
      : {}),
  });

  if (breadcrumb.length) {
    graph.push({
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: breadcrumb.map((b, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: b.name,
        item: b.url,
      })),
    });
  }

  if (faqs && faqs.length) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    });
  }

  // Merge extra studio-authored blocks. Their own @context is stripped — the graph
  // root carries it.
  //
  // A block whose @id matches a node already built above ENRICHES that node rather
  // than being dropped. That is the only way the studio can attach citation /
  // about / mentions to the BlogPosting, since those are properties of it and a
  // second BlogPosting node would conflict with the first. Renderer-built values
  // always win, so an enrichment block can fill gaps but never rewrite the graph.
  //
  // Blocks without a matching @id are appended, unless their type is already
  // built above (see COVERED_LD_TYPES) — a duplicate FAQPage or BlogPosting is
  // worse than none.
  for (const b of normalizeLdArray(extra)) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    const { ["@context"]: _ctx, ...rest } = b as Record<string, any>;
    const id = typeof rest["@id"] === "string" ? rest["@id"] : "";
    const target = id ? graph.find((n) => n["@id"] === id) : undefined;
    if (target) {
      for (const [k, v] of Object.entries(rest)) {
        if (k === "@id" || k === "@type") continue;
        if (target[k] === undefined) target[k] = v;
      }
      continue;
    }
    const type = String(rest["@type"] || "").toLowerCase();
    if (!type || COVERED_LD_TYPES.has(type) || type === "person") continue;
    graph.push(rest);
  }

  return <JsonLd data={{ "@context": "https://schema.org", "@graph": graph }} />;
}

// ─── Share page ───────────────────────────────────────────────────────────────
export function SharePageJsonLd({
  title,
  description,
  url,
  datePublished,
  authorName,
}: {
  title: string;
  description: string;
  url: string;
  datePublished?: string;
  authorName: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name: title,
        description,
        url,
        datePublished,
        inLanguage: "en-IN",
        author: {
          "@type": "Person",
          name: authorName,
        },
        provider: {
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_URL,
        },
      }}
    />
  );
}
