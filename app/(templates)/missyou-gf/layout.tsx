import type { Metadata } from "next";
import { Space_Grotesk, Caveat, Inter } from "next/font/google";
import { getTemplateMeta, SITE_URL, TEMPLATE_SEO, getFAQs, getHowTo, getAggregateRating } from "@/lib/seo";
import { BreadcrumbJsonLd, TemplateJsonLd, FAQJsonLd, HowToJsonLd, TemplateAppJsonLd } from "@/components/JsonLd";

// Self-hosted via next/font (no raw <link>/@import). display:"optional" so a font
// swap never blocks the above-the-fold wax-seal reveal — the metric-matched
// fallback holds layout and the real face only upgrades if it loads near-instantly.
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "optional",
});
const caveat = Caveat({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-caveat",
  display: "optional",
});
// Inter is also the app body font — keep "optional" to match the root layout and
// avoid re-introducing a font-display:swap @font-face for the shared Inter family.
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
    <div className={`${spaceGrotesk.variable} ${caveat.variable} ${inter.variable}`}>
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
