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
import { GANESH_ASSETS } from "./assets";

const SLUG = "happy-ganesh-chaturthi";
const tpl = TEMPLATE_SEO[SLUG];

const OG_IMAGE = {
  url: GANESH_ASSETS.cover.src,
  // The asset's real dimensions — a lying og:image size makes some scrapers
  // letterbox or refuse the preview outright.
  //
  // The still cover and not `shubhkamnaye.gif`: several scrapers refuse an
  // animated source, and the ones that accept it take an arbitrary frame, so the
  // WhatsApp preview of every link would be whichever frame happened to be
  // first. See the note in assets.ts.
  width: GANESH_ASSETS.cover.width,
  height: GANESH_ASSETS.cover.height,
  alt: "Happy Ganesh Chaturthi — send a Ganesh Chaturthi page online, SubhSandesh",
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
  // Null for this template, deliberately — it launches with zero real uses, and
  // the guard below renders no markup rather than a star rating nothing has
  // earned yet.
  const rating = getAggregateRating(SLUG);

  return (
    // No font wrapper: this template uses the faces the root layout already
    // declares (see the note at the top of components/ganesh.css). Registering
    // its own would add a next/font declaration to a second route entry point,
    // which is the exact shape that broke the Turbopack build in CI.
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
