import { SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION, SITE_URL, DEFAULT_OG_IMAGE } from "@/lib/seo";
import type { HowToData, AggregateRatingData } from "@/lib/seo-data";

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
        name: SITE_NAME,
        alternateName: `${SITE_NAME} - ${SITE_TAGLINE}`,
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        inLanguage: ["en-IN", "en"],
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
        name: SITE_NAME,
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: DEFAULT_OG_IMAGE,
          width: 1370,
          height: 784,
        },
        description: SITE_DESCRIPTION,
        foundingDate: "2024",
        areaServed: {
          "@type": "Country",
          name: "India",
        },
        knowsLanguage: ["en", "hi"],
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          availableLanguage: ["English", "Hindi"],
          areaServed: "IN",
        },
        sameAs: [],
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
