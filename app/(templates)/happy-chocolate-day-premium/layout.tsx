import type { Metadata } from "next";
import { getTemplateMeta, SITE_URL, TEMPLATE_SEO, getFAQs, getHowTo, getAggregateRating } from "@/lib/seo";
import { BreadcrumbJsonLd, TemplateJsonLd, FAQJsonLd, HowToJsonLd, TemplateAppJsonLd } from "@/components/JsonLd";

// Title, description, keywords, FAQs and the HowTo live in lib/seo-data.ts
// ("happy-chocolate-day-premium"), which also puts the page in the sitemap, /llms.txt and the
// agent catalog. The search title targets the premium/cinematic intent; the
// $2 twin keeps the plain "<day> surprise website" one. The og:image is
// ./opengraph-image.tsx; images: undefined drops the site default so it wins.
const SLUG = "happy-chocolate-day-premium";
const tpl = TEMPLATE_SEO[SLUG];

// The link preview stays a teaser: it is what shows on WhatsApp when someone
// pastes the template link to a friend.
const SOCIAL_TITLE = `🍫 A chocolate factory, made just for you`;
const SOCIAL_DESCRIPTION = `Scratch your golden ticket, fill your box, catch the chocolates, melt the heart… and pull the lever on the chocolate fountain. Sound on ✦`;
// "The Sweetheart Chocolate Factory" (v3). The page description and its JSON-LD use this line (lib/seo-data.ts carries the same concept).
const DESCRIPTION =
  "A cute Chocolate Day website shaped like a chocolate factory made just for her: a golden ticket, six truffles with six reasons, her photo in a chocolate bar, a catch game, your letter, your voice, and a chocolate fountain on your song's chorus.";

const base = getTemplateMeta(SLUG);
export const metadata: Metadata = {
  ...base,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/${SLUG}` },
  openGraph: { ...base.openGraph, title: SOCIAL_TITLE, description: SOCIAL_DESCRIPTION, url: `${SITE_URL}/${SLUG}`, images: undefined },
  twitter: { ...base.twitter, card: "summary_large_image", title: SOCIAL_TITLE, description: SOCIAL_DESCRIPTION, images: undefined },
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
      <TemplateJsonLd name={tpl.title} description={DESCRIPTION} category={tpl.category} url={`${SITE_URL}/${SLUG}`} />
      {faqs.length > 0 && <FAQJsonLd faqs={faqs} />}
      {howTo && <HowToJsonLd howTo={howTo} />}
      {rating && <TemplateAppJsonLd name={tpl.title} description={DESCRIPTION} url={`${SITE_URL}/${SLUG}`} aggregateRating={rating} />}
      {children}
    </>
  );
}
