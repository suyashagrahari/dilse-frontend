import type { Metadata } from "next";
import { getTemplateMeta, SITE_URL, TEMPLATE_SEO, getFAQs, getHowTo, getAggregateRating } from "@/lib/seo";
import { BreadcrumbJsonLd, TemplateJsonLd, FAQJsonLd, HowToJsonLd, TemplateAppJsonLd } from "@/components/JsonLd";

// Title, description, keywords, FAQs and the HowTo live in lib/seo-data.ts
// ("happy-rose-day-premium"), which also puts the page in the sitemap, /llms.txt and the
// agent catalog. The search title targets the premium/cinematic intent; the
// $2 twin keeps the plain "<day> surprise website" one. The og:image is
// ./opengraph-image.tsx; images: undefined drops the site default so it wins.
const SLUG = "happy-rose-day-premium";
const tpl = TEMPLATE_SEO[SLUG];

// The link preview stays a teaser: it is what shows on WhatsApp when someone
// pastes the template link to a friend.
const SOCIAL_TITLE = `🌹 Something has been opening, just for you`;
const SOCIAL_DESCRIPTION = `A rose made of us. Go somewhere quiet, sound on ✦`;
// "The Bloom of Us" (v2). The page's own description and its JSON-LD use this fuller line; the shorter
// lib/seo-data.ts description feeds the gallery, sitemap and /llms.txt.
const DESCRIPTION =
  "A cinematic Rose Day website where your photos are the petals: a velvet bud they hold to warm, which opens on your song's chorus into a rose made of your photos, then pressed photos, your letter, your voice and a keepsake card.";

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
