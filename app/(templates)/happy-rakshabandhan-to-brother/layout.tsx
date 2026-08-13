import type { Metadata } from "next";
import { RAKHI_FONT_VARS } from "./fonts";
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
import { RAKHI_ASSETS } from "./assets";

const SLUG = "happy-rakshabandhan-to-brother";
const tpl = TEMPLATE_SEO[SLUG];

const OG_IMAGE = {
  url: RAKHI_ASSETS.cover.src,
  // The asset's real dimensions — a lying og:image size makes some scrapers
  // letterbox or refuse the preview.
  width: RAKHI_ASSETS.cover.width,
  height: RAKHI_ASSETS.cover.height,
  alt: "Happy Raksha Bandhan — tie a rakhi to your brother online, SubhSandesh",
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
  // star rating nothing has earned yet.
  const rating = getAggregateRating(SLUG);

  return (
    <div className={RAKHI_FONT_VARS}>
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
