import { SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION, SITE_URL, DEFAULT_OG_IMAGE } from "@/lib/seo";

interface JsonLdProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

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
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE_URL}/templates?search={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      }}
    />
  );
}

export function WebAppJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: SITE_NAME,
        url: SITE_URL,
        applicationCategory: "LifestyleApplication",
        operatingSystem: "Any",
        description: SITE_DESCRIPTION,
        image: DEFAULT_OG_IMAGE,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.9",
          ratingCount: "5000",
          bestRating: "5",
          worstRating: "1",
        },
      }}
    />
  );
}

export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL,
        logo: DEFAULT_OG_IMAGE,
        sameAs: [],
      }}
    />
  );
}

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
      }}
    />
  );
}

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

export function FAQJsonLd({ faqs }: { faqs: { question: string; answer: string }[] }) {
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
