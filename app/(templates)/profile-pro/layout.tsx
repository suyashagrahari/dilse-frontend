import type { Metadata } from "next";
import { getTemplateMeta, getFAQs, getHowTo, getAggregateRating, SITE_URL } from "@/lib/seo";
import { BreadcrumbJsonLd, TemplateJsonLd, FAQJsonLd, HowToJsonLd, TemplateAppJsonLd } from "@/components/JsonLd";

const SLUG = "profile-pro";

// A parody of the professional-profile FORMAT — the banner, the headline, the
// experience list, the endorsement counts. The format is a convention, not a
// trademark; no professional network is named, coloured, or imitated anywhere in
// this template. Title and description are declared here rather than read out of
// TEMPLATE_SEO so this route carries correct metadata whether or not the slug has
// been added to lib/seo-data.ts yet.
const TITLE = "Endorsements — A Career Profile for a Relationship (Free)";
const DESCRIPTION =
  "Experience, skills and endorsements for the person you love. Their friends endorse with one tap — no signup, no form — and the counts fill in live.";
const CATEGORY = "Love";
const SOCIAL_TITLE = "Endorsements · 1 connection";
const SOCIAL_DESCRIPTION = "Being Right, endorsed by 47 people. Punctuality, endorsed by 2.";

const OG_IMAGE = {
  url: "https://gifts-media-prod-123.s3.ap-south-1.amazonaws.com/gifts-media/templates/profile-pro/cover.webp",
  width: 1200,
  height: 630,
  alt: "A career profile made for someone you love — SubhSandesh",
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
          { name: "Endorsements", url: `${SITE_URL}/${SLUG}` },
        ]}
      />
      <TemplateJsonLd name="Endorsements" description={DESCRIPTION} category={CATEGORY} url={`${SITE_URL}/${SLUG}`} />
      {faqs.length > 0 && <FAQJsonLd faqs={faqs} />}
      {howTo && <HowToJsonLd howTo={howTo} />}
      {rating && (
        <TemplateAppJsonLd
          name="Endorsements"
          description={DESCRIPTION}
          url={`${SITE_URL}/${SLUG}`}
          aggregateRating={rating}
        />
      )}
      {children}
    </>
  );
}
