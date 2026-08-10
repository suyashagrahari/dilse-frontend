import type { Metadata } from "next";
import { getTemplateMeta, getFAQs, getHowTo, getAggregateRating, SITE_URL } from "@/lib/seo";
import { BreadcrumbJsonLd, TemplateJsonLd, FAQJsonLd, HowToJsonLd, TemplateAppJsonLd } from "@/components/JsonLd";
import { templateMedia } from "@/lib/templateMedia";

const SLUG = "call";

// A parody of the incoming-call and caller-identification LAYOUT — the
// full-bleed photo, the tag row, the spam meter, the call log. Our own
// wordmark, our own accent, and no affiliation with or endorsement by any
// caller-ID service. Title and description are declared here rather than read
// out of TEMPLATE_SEO so this route carries correct metadata whether or not the
// slug has been added to lib/seo-data.ts yet.
const TITLE = "Caller ID — An Incoming Call They Cannot Ignore (Free)";
const DESCRIPTION =
  "Send an incoming call screen instead of a message: full-screen photo, identification card, crowd-sourced tags, 0% spam, verified, and a call log where every entry is a real night.";
const CATEGORY = "Love";
const SOCIAL_TITLE = "Incoming call · Meera Sharma";
const SOCIAL_DESCRIPTION = "0% spam · verified · Pick Up. Now. (2,481 people agree)";

const OG_IMAGE = {
  url: templateMedia("call", "cover.webp"),
  width: 1200,
  height: 630,
  alt: "An incoming call screen made for someone you love — SubhSandesh",
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
          { name: "Caller ID", url: `${SITE_URL}/${SLUG}` },
        ]}
      />
      <TemplateJsonLd name="Caller ID" description={DESCRIPTION} category={CATEGORY} url={`${SITE_URL}/${SLUG}`} />
      {faqs.length > 0 && <FAQJsonLd faqs={faqs} />}
      {howTo && <HowToJsonLd howTo={howTo} />}
      {rating && (
        <TemplateAppJsonLd
          name="Caller ID"
          description={DESCRIPTION}
          url={`${SITE_URL}/${SLUG}`}
          aggregateRating={rating}
        />
      )}
      {children}
    </>
  );
}
