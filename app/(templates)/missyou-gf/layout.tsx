import type { Metadata } from "next";
import localFont from "next/font/local";
import { getTemplateMeta, SITE_URL, TEMPLATE_SEO, getFAQs, getHowTo, getAggregateRating } from "@/lib/seo";
import { BreadcrumbJsonLd, TemplateJsonLd, FAQJsonLd, HowToJsonLd, TemplateAppJsonLd } from "@/components/JsonLd";

// Self-hosted via next/font (no raw <link>/@import). display:"optional" so a font
// swap never blocks the above-the-fold hero copy — the metric-ish fallback holds
// layout and the real face only upgrades if it loads near-instantly. This warm
// "paper letter" pairing (elegant serif display + handwritten script) is what the
// recipient sees; consumed as CSS vars by components/missyou.css.
const serifDisplay = localFont({
  src: [
    { path: "../../../assets/fonts/cormorant-garamond-400-italic.woff2", weight: "400", style: "italic" },
    { path: "../../../assets/fonts/cormorant-garamond-500-italic.woff2", weight: "500", style: "italic" },
    { path: "../../../assets/fonts/cormorant-garamond-600-italic.woff2", weight: "600", style: "italic" },
    { path: "../../../assets/fonts/cormorant-garamond-700-italic.woff2", weight: "700", style: "italic" },
    { path: "../../../assets/fonts/cormorant-garamond-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../../assets/fonts/cormorant-garamond-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../../../assets/fonts/cormorant-garamond-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../../../assets/fonts/cormorant-garamond-700-normal.woff2", weight: "700", style: "normal" },
  ],
  adjustFontFallback: "Times New Roman",
  variable: "--font-serif-display",
  display: "optional",
});
const script = localFont({
  src: [
    { path: "../../../assets/fonts/dancing-script-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../../../assets/fonts/dancing-script-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../../../assets/fonts/dancing-script-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-script",
  display: "optional",
});
// Inter is also the app body font — keep "optional" to match the root layout and
// avoid re-introducing a font-display:swap @font-face for the shared Inter family.
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

const SLUG = "missyou-gf";
const tpl = TEMPLATE_SEO[SLUG];

// Sealed-envelope social card the design specified (1200×630). Drop the final art
// at this path; the metadata already references it so WhatsApp/social render it.
const OG_IMAGE = {
  url: `${SITE_URL}/assets/missyou-gf/og-missyou-gf.png`,
  width: 1200,
  height: 630,
  alt: "A sealed 'I miss you' letter under a starry night — SubhSandesh",
};

// Metadata is sourced from the single source of truth in lib/seo-data.ts
// (title/description/keywords) via getTemplateMeta, then we pin the canonical URL
// and swap in the template-specific sealed-envelope OG image.
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
    <div className={`${serifDisplay.variable} ${script.variable} ${inter.variable}`}>
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
