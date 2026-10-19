import type { Metadata } from "next";
import { getTemplateMeta, SITE_URL, TEMPLATE_SEO, getFAQs, getHowTo, getAggregateRating } from "@/lib/seo";
import WeddingTiersCrossLink from "@/components/WeddingTiersCrossLink";
import { BreadcrumbJsonLd, TemplateJsonLd, FAQJsonLd, HowToJsonLd, TemplateAppJsonLd } from "@/components/JsonLd";
import localFont from "next/font/local";

const cinzel = localFont({
  src: [
    { path: "../../../assets/fonts/cinzel-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../../assets/fonts/cinzel-700-normal.woff2", weight: "700", style: "normal" },
  ],
  adjustFontFallback: "Times New Roman",
  variable: "--font-cinzel" });
const dancing = localFont({
  src: [
    { path: "../../../assets/fonts/dancing-script-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-dancing" });
const lora = localFont({
  src: [
    { path: "../../../assets/fonts/lora-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../../assets/fonts/lora-700-normal.woff2", weight: "700", style: "normal" },
  ],
  adjustFontFallback: "Times New Roman",
  variable: "--font-lora" });

const SLUG = "shaadi-card";
const tpl = TEMPLATE_SEO[SLUG];

export const metadata: Metadata = {
  ...getTemplateMeta(SLUG),
  alternates: { canonical: `${SITE_URL}/${SLUG}` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const faqs = getFAQs(SLUG);
  const howTo = getHowTo(SLUG);
  const rating = getAggregateRating(SLUG);
  return (
    <div className={`${cinzel.variable} ${dancing.variable} ${lora.variable}`}>
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
      {/* The paid wedding invitation websites (cross-link, below the free editor). */}
      <WeddingTiersCrossLink variant="card" />
    </div>
  );
}
