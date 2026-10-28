import type { Metadata } from "next";
import { getTemplateMeta, SITE_URL, TEMPLATE_SEO, getFAQs, getHowTo, getAggregateRating } from "@/lib/seo";
import { BreadcrumbJsonLd, TemplateJsonLd, FAQJsonLd, HowToJsonLd, TemplateAppJsonLd } from "@/components/JsonLd";

// Title, description, keywords, FAQs and the HowTo live in lib/seo-data.ts
// ("sikh-wedding-invitation"), which also puts the page in the sitemap, /llms.txt and
// the agent catalog. The og:image is ./opengraph-image.tsx (1200×630, rendered
// at build time); Next adds it to openGraph and twitter on its own.
const SLUG = "sikh-wedding-invitation";
const tpl = TEMPLATE_SEO[SLUG];

// The link preview stays a teaser: it is what
// shows on WhatsApp when someone pastes the template link to a friend.
const SOCIAL_TITLE = "🌼 An Anand Karaj wedding invitation";
const SOCIAL_DESCRIPTION = "Ik Onkar in gold, the Golden Temple and every function with maps and RSVP. One link 🤍";

const base = getTemplateMeta(SLUG);
export const metadata: Metadata = {
  ...base,
  alternates: { canonical: `${SITE_URL}/${SLUG}` },
  openGraph: {
    ...base.openGraph,
    title: SOCIAL_TITLE,
    description: SOCIAL_DESCRIPTION,
    url: `${SITE_URL}/${SLUG}`,
    // Drop the site-wide default image so the route's opengraph-image is the only one.
    images: undefined,
  },
  twitter: {
    ...base.twitter,
    card: "summary_large_image",
    title: SOCIAL_TITLE,
    description: SOCIAL_DESCRIPTION,
    images: undefined,
  },
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
