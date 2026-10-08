import type { Metadata } from "next";
import { getTemplateMeta, SITE_URL, TEMPLATE_SEO, getFAQs, getHowTo, getAggregateRating } from "@/lib/seo";
import { BreadcrumbJsonLd, TemplateJsonLd, FAQJsonLd, HowToJsonLd, TemplateAppJsonLd } from "@/components/JsonLd";

// Title, description, keywords, FAQs and the HowTo live in lib/seo-data.ts
// ("happy-promise-day-premium"), which also puts the page in the sitemap, /llms.txt and the
// agent catalog. The search title targets the premium/cinematic intent; the
// $2 twin keeps the plain "<day> surprise website" one. No route og:image yet,
// so the site default stays in openGraph/twitter.
const SLUG = "happy-promise-day-premium";
const tpl = TEMPLATE_SEO[SLUG];

// The link preview stays a teaser: it is what shows on WhatsApp when someone
// pastes the template link to a friend.
const SOCIAL_TITLE = `🧵 Someone tied a red thread to your finger`;
const SOCIAL_DESCRIPTION = `Follow it. Sound on ✦`;

const base = getTemplateMeta(SLUG);
export const metadata: Metadata = {
  ...base,
  alternates: { canonical: `${SITE_URL}/${SLUG}` },
  openGraph: { ...base.openGraph, title: SOCIAL_TITLE, description: SOCIAL_DESCRIPTION, url: `${SITE_URL}/${SLUG}` },
  twitter: { ...base.twitter, card: "summary_large_image", title: SOCIAL_TITLE, description: SOCIAL_DESCRIPTION },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const faqs = getFAQs(SLUG);
  const howTo = getHowTo(SLUG);
  // Null: no real ratings yet, and the guard renders nothing rather than stars.
  const rating = getAggregateRating(SLUG);
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Templates", url: `${SITE_URL}/templates` },
          { name: tpl.title, url: `${SITE_URL}/${SLUG}` },
        ]}
      />
      <TemplateJsonLd name={tpl.title} description={tpl.description} category={tpl.category} url={`${SITE_URL}/${SLUG}`} />
      {faqs.length > 0 && <FAQJsonLd faqs={faqs} />}
      {howTo && <HowToJsonLd howTo={howTo} />}
      {rating && <TemplateAppJsonLd name={tpl.title} description={tpl.description} url={`${SITE_URL}/${SLUG}`} aggregateRating={rating} />}
      {children}
    </>
  );
}
