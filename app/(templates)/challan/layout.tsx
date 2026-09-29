import type { Metadata } from "next";
import { getTemplateMeta, getFAQs, getHowTo, getAggregateRating, SITE_URL } from "@/lib/seo";
import { BreadcrumbJsonLd, TemplateJsonLd, FAQJsonLd, HowToJsonLd, TemplateAppJsonLd } from "@/components/JsonLd";
import { templateMedia } from "@/lib/templateMedia";

const SLUG = "challan";

// A parody traffic NOTICE. The issuing authority — "Department of Heart Traffic,
// Republic of Us" — is invented, as are its seal, its motto and its statutes. No
// national emblem, no real police or transport department, no government portal
// wordmark appears anywhere in this template, and nothing in it resembles any
// government identity document. The notice itself carries
// the disclaimer that it has no legal effect. Title and description are declared
// here rather than read out of TEMPLATE_SEO so this route carries correct
// metadata whether or not the slug has been added to lib/seo-data.ts yet.
const TITLE = "Challan — A Traffic Notice for the Things They Did (Free)";
const DESCRIPTION =
  "A parody e-challan for overspeeding into your life and parking in your head since 2023. Pay it in one date, or contest it — the objection is always upheld.";
const CATEGORY = "Love";
const SOCIAL_TITLE = "1 challan found · KA 01 LUV 2023";
const SOCIAL_DESCRIPTION = "Total payable: one date. Pay before the due date, or contest it and win.";

const OG_IMAGE = {
  url: templateMedia("challan", "cover-v2.webp"),
  width: 1200,
  height: 630,
  alt: "A parody traffic notice made for someone you love — SubhSandesh",
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
          { name: "Challan", url: `${SITE_URL}/${SLUG}` },
        ]}
      />
      <TemplateJsonLd name="Challan" description={DESCRIPTION} category={CATEGORY} url={`${SITE_URL}/${SLUG}`} />
      {faqs.length > 0 && <FAQJsonLd faqs={faqs} />}
      {howTo && <HowToJsonLd howTo={howTo} />}
      {rating && (
        <TemplateAppJsonLd
          name="Challan"
          description={DESCRIPTION}
          url={`${SITE_URL}/${SLUG}`}
          aggregateRating={rating}
        />
      )}
      {children}
    </>
  );
}
