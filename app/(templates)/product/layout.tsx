import type { Metadata } from "next";
import { getTemplateMeta, getFAQs, getHowTo, getAggregateRating, SITE_URL } from "@/lib/seo";
import { BreadcrumbJsonLd, TemplateJsonLd, FAQJsonLd, HowToJsonLd, TemplateAppJsonLd } from "@/components/JsonLd";
import { templateMedia } from "@/lib/templateMedia";

const SLUG = "product";

// A parody of the marketplace LISTING LAYOUT — the buy box, the bullet block,
// the spec table, the review histogram. Its own wordmark, and no affiliation
// with or endorsement by any retailer. Title and description are declared here
// rather than read out of TEMPLATE_SEO so this route carries correct metadata
// whether or not the slug has been added to lib/seo-data.ts yet.
const TITLE = "Product — List the Person You Love as a Product (Free)";
const DESCRIPTION =
  "A full listing page for a person: photo gallery, buy box, bullet points, spec table, customer questions and real reviews from her friends. The price is ∞. Free, no signup to preview.";
const CATEGORY = "Love";
const SOCIAL_TITLE = "Meera Sharma — Girlfriend, Original, 1 Count";
const SOCIAL_DESCRIPTION = "In stock. Only 1 left — there was only ever 1. ★★★★★ (2,140 ratings)";

const OG_IMAGE = {
  url: templateMedia("product", "cover.webp"),
  width: 1200,
  height: 630,
  alt: "A person listed as a product — SubhSandesh",
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
          { name: "Product", url: `${SITE_URL}/${SLUG}` },
        ]}
      />
      <TemplateJsonLd name="Product" description={DESCRIPTION} category={CATEGORY} url={`${SITE_URL}/${SLUG}`} />
      {faqs.length > 0 && <FAQJsonLd faqs={faqs} />}
      {howTo && <HowToJsonLd howTo={howTo} />}
      {rating && (
        <TemplateAppJsonLd name="Product" description={DESCRIPTION} url={`${SITE_URL}/${SLUG}`} aggregateRating={rating} />
      )}
      {children}
    </>
  );
}
