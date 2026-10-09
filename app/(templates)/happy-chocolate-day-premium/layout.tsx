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
const SOCIAL_TITLE = `🍫 A box of chocolates, made only for you`;
const SOCIAL_DESCRIPTION = `Every piece in it is a memory. Pull the ribbon with the sound on ✦`;
// "La Boîte" (v2). The page description and its JSON-LD use this line (lib/seo-data.ts carries the same concept).
const DESCRIPTION =
  "A cinematic Chocolate Day website shaped like a chocolatier's box: they pull the ribbon, lift the lid on your song's chorus, and every bonbon inside is one of your photos, each turning over to its flavour and memory. Then a cocoa-dusted heart, your letter on the menu card, your voice, and a keepsake card.";

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
