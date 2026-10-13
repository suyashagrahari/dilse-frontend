import type { Metadata } from "next";
import localFont from "next/font/local";
import { getTemplateMeta, SITE_URL, TEMPLATE_SEO, getFAQs, getHowTo, getAggregateRating } from "@/lib/seo";
import { BreadcrumbJsonLd, TemplateJsonLd, FAQJsonLd, HowToJsonLd, TemplateAppJsonLd } from "@/components/JsonLd";
import { media } from "@/lib/templateMedia";

// Self-hosted via next/font (no raw <link>/@import). display:"optional" so a font
// swap never blocks the above-the-fold hero copy. This chunky rounded display +
// handwritten script pairing is the gen-z "sticker" look the recipient sees;
// consumed as CSS vars by components/bouquet.css.
const balooDisplay = localFont({
  src: [
    { path: "../../../assets/fonts/baloo-2-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../../../assets/fonts/baloo-2-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../../../assets/fonts/baloo-2-700-normal.woff2", weight: "700", style: "normal" },
    { path: "../../../assets/fonts/baloo-2-800-normal.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-bq-display",
  display: "optional",
});
const caveat = localFont({
  src: [
    { path: "../../../assets/fonts/caveat-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../../../assets/fonts/caveat-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../../../assets/fonts/caveat-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-bq-script",
  display: "optional",
});
const inter = localFont({
  src: [
    { path: "../../../assets/fonts/inter-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../../assets/fonts/inter-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../../../assets/fonts/inter-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../../../assets/fonts/inter-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-inter",
  display: "optional",
});

const SLUG = "bouquet-gf";
const tpl = TEMPLATE_SEO[SLUG];

const OG_IMAGE = {
  url: media("bouquet-gf/cover.webp"),
  width: 1000,
  height: 1000,
  alt: "A hand-tied digital flower bouquet — SubhSandesh",
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
  const rating = getAggregateRating(SLUG);
  return (
    <div className={`${balooDisplay.variable} ${caveat.variable} ${inter.variable}`}>
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
    </div>
  );
}
