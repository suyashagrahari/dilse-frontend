import type { Metadata } from "next";
import { getTemplateMeta, getFAQs, getHowTo, getAggregateRating, SITE_URL } from "@/lib/seo";
import { BreadcrumbJsonLd, TemplateJsonLd, FAQJsonLd, HowToJsonLd, TemplateAppJsonLd } from "@/components/JsonLd";
import { templateMedia } from "@/lib/templateMedia";

const SLUG = "app";

// A parody of the SOFTWARE LISTING LAYOUT — the header block, the stats strip,
// the ratings histogram, the changelog. Its own chrome, its own indigo, and no
// affiliation with or endorsement by any storefront or device maker. Title and
// description are declared here rather than read out of TEMPLATE_SEO so this
// route carries correct metadata whether or not the slug has been added to
// lib/seo-data.ts yet.
const TITLE = "The Listing — Publish the Person You Love as Software (Free)";
const DESCRIPTION =
  "A full software listing for a person: icon, developer line, GET button, screenshots, a ratings histogram, a changelog that gets steadily more unhinged, and real reviews from her friends. Free, no signup to preview.";
const CATEGORY = "Love";
const SOCIAL_TITLE = "Meera Sharma — Version 4.0.2, 1 human, free";
const SOCIAL_DESCRIPTION = "★★★★★ 4.9 out of 5. Updates are automatic and non-negotiable.";

const OG_IMAGE = {
  url: templateMedia("app", "cover.webp"),
  width: 1200,
  height: 630,
  alt: "A person published as a software listing — SubhSandesh",
};

const base = getTemplateMeta(SLUG);
export const metadata: Metadata = {
  ...base,
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/${SLUG}` },
  openGraph: {
    ...base.openGraph,
    title: SOCIAL_TITLE,
    description: SOCIAL_DESCRIPTION,
    url: `${SITE_URL}/${SLUG}`,
    images: [OG_IMAGE],
  },
  twitter: {
    ...base.twitter,
    card: "summary_large_image",
    title: SOCIAL_TITLE,
    description: SOCIAL_DESCRIPTION,
    images: [OG_IMAGE.url],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const faqs = getFAQs(SLUG);
  const howTo = getHowTo(SLUG);
  const rating = getAggregateRating(SLUG);
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Templates", url: `${SITE_URL}/templates` },
          { name: "The Listing", url: `${SITE_URL}/${SLUG}` },
        ]}
      />
      <TemplateJsonLd
        name="The Listing"
        description={DESCRIPTION}
        category={CATEGORY}
        url={`${SITE_URL}/${SLUG}`}
      />
      {faqs.length > 0 && <FAQJsonLd faqs={faqs} />}
      {howTo && <HowToJsonLd howTo={howTo} />}
      {rating && (
        <TemplateAppJsonLd
          name="The Listing"
          description={DESCRIPTION}
          url={`${SITE_URL}/${SLUG}`}
          aggregateRating={rating}
        />
      )}
      {children}
    </>
  );
}
