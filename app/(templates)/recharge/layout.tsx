import type { Metadata } from "next";
import { getTemplateMeta, getFAQs, getHowTo, getAggregateRating, SITE_URL } from "@/lib/seo";
import { BreadcrumbJsonLd, TemplateJsonLd, FAQJsonLd, HowToJsonLd, TemplateAppJsonLd } from "@/components/JsonLd";
import { templateMedia } from "@/lib/templateMedia";

const SLUG = "recharge";

// A parody of the prepaid recharge FLOW — the subscriber strip, the category
// rail, the plan grid, the payment sheet, the receipt. The operator is invented
// and so are the payment rails; no real network or payment app is named or
// coloured anywhere in this template. Title and description are declared here
// rather than read out of TEMPLATE_SEO so this route carries correct metadata
// whether or not the slug has been added to lib/seo-data.ts yet.
const TITLE = "Recharge — A Prepaid Plan for a Relationship (Free)";
const DESCRIPTION =
  "Pick a plan, pay on a sheet that looks exactly like the real thing, and send a receipt that says the part you actually wanted to say. Unlimited calls, no expiry, ₹∞.";
const CATEGORY = "Love";
const SOCIAL_TITLE = "Recharge successful · No expiry";
const SOCIAL_DESCRIPTION = "Unlimited calls, unlimited data, validity: no expiry. Amount debited: everything.";

const OG_IMAGE = {
  url: templateMedia("recharge", "cover.webp"),
  width: 1200,
  height: 630,
  alt: "A prepaid recharge plan made for someone you love — SubhSandesh",
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
          { name: "Recharge", url: `${SITE_URL}/${SLUG}` },
        ]}
      />
      <TemplateJsonLd name="Recharge" description={DESCRIPTION} category={CATEGORY} url={`${SITE_URL}/${SLUG}`} />
      {faqs.length > 0 && <FAQJsonLd faqs={faqs} />}
      {howTo && <HowToJsonLd howTo={howTo} />}
      {rating && (
        <TemplateAppJsonLd
          name="Recharge"
          description={DESCRIPTION}
          url={`${SITE_URL}/${SLUG}`}
          aggregateRating={rating}
        />
      )}
      {children}
    </>
  );
}
