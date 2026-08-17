import type { Metadata } from "next";
import {
  getTemplateMeta,
  SITE_URL,
  TEMPLATE_SEO,
  getFAQs,
  getHowTo,
  getAggregateRating,
} from "@/lib/seo";
import {
  BreadcrumbJsonLd,
  TemplateJsonLd,
  FAQJsonLd,
  HowToJsonLd,
  TemplateAppJsonLd,
} from "@/components/JsonLd";
import { RS_ASSETS } from "./assets";

const SLUG = "happy-rakshabandhan-to-sister";
const tpl = TEMPLATE_SEO[SLUG];

// ── `og`, NOT `cover`, AND THEY ARE DIFFERENT FILES ─────────────────────────
//
// Two crops of the same artwork exist because two consumers want opposite
// shapes, and using one file for both loses a chunk of the design either way.
//
// `cover` is 3:4 portrait, because `TemplateCard` renders `coverImage` into an
// `aspect-[3/4]` box with `object-cover` — a landscape file dropped in there is
// cropped to its middle 61% and the words go with the edges.
//
// `og` is the 1.91:1 twin, which is what every link scraper actually wants. A
// portrait og:image is not merely suboptimal: WhatsApp and some others letterbox
// or refuse it outright, and the preview is the only thing that travels when a
// link is forwarded.
const OG_IMAGE = {
  url: RS_ASSETS.og.src,
  // The asset's real dimensions — a lying og:image size makes some scrapers
  // letterbox or refuse the preview.
  width: RS_ASSETS.og.width,
  height: RS_ASSETS.og.height,
  alt: "Happy Raksha Bandhan — send your sister a rakhi she ties herself, SubhSandesh",
};

const base = getTemplateMeta(SLUG);
export const metadata: Metadata = {
  ...base,
  alternates: { canonical: `${SITE_URL}/${SLUG}` },
  openGraph: {
    ...base.openGraph,
    url: `${SITE_URL}/${SLUG}`,
    images: [OG_IMAGE],
  },
  twitter: {
    ...base.twitter,
    card: "summary_large_image",
    images: [OG_IMAGE.url],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const faqs = getFAQs(SLUG);
  const howTo = getHowTo(SLUG);
  // Null for this template, deliberately — see the note on `aggregateRating`
  // in lib/seo-data.ts. The guard below renders no markup rather than a
  // star rating nothing has earned yet. It is written as a guard and not
  // deleted so the block starts working the day real ratings exist.
  const rating = getAggregateRating(SLUG);

  return (
    // No font wrapper, and this is the same decision the brother template made
    // for the same hard reason: a `next/font/google` call here is a new font
    // family fetched at BUILD time, and the CI builder cannot reach Google
    // Fonts — the build fails, not the page. This template's CSS therefore uses
    // only the faces the root layout already declares, which wrap every route
    // including this one. See the note at the top of components/sister.css.
    <div>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Templates", url: `${SITE_URL}/templates` },
          { name: tpl.title, url: `${SITE_URL}/${SLUG}` },
        ]}
      />
      <TemplateJsonLd
        name={tpl.title}
        description={tpl.description}
        category={tpl.category}
        url={`${SITE_URL}/${SLUG}`}
      />
      {faqs.length > 0 && <FAQJsonLd faqs={faqs} />}
      {howTo && <HowToJsonLd howTo={howTo} />}
      {rating && (
        <TemplateAppJsonLd
          name={tpl.title}
          description={tpl.description}
          url={`${SITE_URL}/${SLUG}`}
          aggregateRating={rating}
        />
      )}
      {children}
    </div>
  );
}
