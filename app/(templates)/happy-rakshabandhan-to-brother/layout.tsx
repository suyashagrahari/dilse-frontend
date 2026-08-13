import type { Metadata } from "next";
import { Fraunces, Tiro_Devanagari_Hindi, Kalam, Inter } from "next/font/google";
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

// Self-hosted via next/font (no raw <link>/@import), consumed as CSS vars by
// components/rakhi.css.
//
// display:"swap" and NOT "optional" here — "optional" permits the browser to
// decline the face outright, and a declined Devanagari face silently falls back
// to whatever the system has, which for the shloka means either a mismatched
// face or tofu. The shloka is the one line on the page that must render in the
// right script, so we accept the swap.
const display = Fraunces({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-rb-display",
  display: "swap",
});

// Weight 400 is the only weight this family ships.
const devanagari = Tiro_Devanagari_Hindi({
  subsets: ["devanagari", "latin"],
  weight: "400",
  variable: "--font-rb-deva",
  display: "swap",
});

// Polaroid captions. Covers both scripts, so a Hindi caption on a memory does
// not fall out of the handwriting into a system face mid-sentence.
const hand = Kalam({
  subsets: ["devanagari", "latin"],
  weight: ["400", "700"],
  variable: "--font-rb-hand",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "optional",
});

const SLUG = "happy-rakshabandhan-to-brother";
const tpl = TEMPLATE_SEO[SLUG];

const OG_IMAGE = {
  url: RAKHI_ASSETS.cover,
  width: 1200,
  height: 1200,
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
    <div
      className={`${display.variable} ${devanagari.variable} ${hand.variable} ${inter.variable}`}
    >
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
