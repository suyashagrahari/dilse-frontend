import type { Metadata } from "next";
import { getTemplateMeta, getFAQs, getHowTo, getAggregateRating, SITE_URL } from "@/lib/seo";
import { BreadcrumbJsonLd, TemplateJsonLd, FAQJsonLd, HowToJsonLd, TemplateAppJsonLd } from "@/components/JsonLd";

const SLUG = "nutrition";

// A parody of the regulatory nutrition panel FORMAT — the rule-weight
// hierarchy, the % Daily Value column, the ingredients paragraph. The format is
// not anyone's trademark; no food brand and no regulator is named or referenced
// anywhere in this template. Title and description are declared here rather than
// read out of TEMPLATE_SEO so this route carries correct metadata whether or not
// the slug has been added to lib/seo-data.ts yet.
const TITLE = "Nutrition Facts — A Nutrition Label for a Person (Free)";
const DESCRIPTION =
  "Serving size: 1. Calories: ∞. A parody nutrition panel where every nutrient is one of their traits, and tapping a row reveals why it made the label.";
const CATEGORY = "Friendship";
const SOCIAL_TITLE = "Nutrition Facts · Servings per container: 1";
const SOCIAL_DESCRIPTION = "Calories: ∞, worth every one. Not a significant source of patience.";

const OG_IMAGE = {
  url: "https://gifts-media-prod-123.s3.ap-south-1.amazonaws.com/gifts-media/templates/nutrition/cover.webp",
  width: 1200,
  height: 630,
  alt: "A nutrition label made for someone you love — SubhSandesh",
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
          { name: "Nutrition Facts", url: `${SITE_URL}/${SLUG}` },
        ]}
      />
      <TemplateJsonLd name="Nutrition Facts" description={DESCRIPTION} category={CATEGORY} url={`${SITE_URL}/${SLUG}`} />
      {faqs.length > 0 && <FAQJsonLd faqs={faqs} />}
      {howTo && <HowToJsonLd howTo={howTo} />}
      {rating && (
        <TemplateAppJsonLd
          name="Nutrition Facts"
          description={DESCRIPTION}
          url={`${SITE_URL}/${SLUG}`}
          aggregateRating={rating}
        />
      )}
      {children}
    </>
  );
}
