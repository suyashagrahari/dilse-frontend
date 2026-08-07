import type { Metadata } from "next";
import { getTemplateMeta, getFAQs, getHowTo, getAggregateRating, SITE_URL } from "@/lib/seo";
import { BreadcrumbJsonLd, TemplateJsonLd, FAQJsonLd, HowToJsonLd, TemplateAppJsonLd } from "@/components/JsonLd";

const SLUG = "watch";

// A parody of the watch-page LAYOUT — the 16:9 frame, the metadata row, the
// chapter list, the comment section. Our own wordmark, our own accent, and no
// affiliation with or endorsement by any video platform; the embedded player
// carries its own branding, which is the platform's and stays untouched.
// Title and description are declared here rather than read out of TEMPLATE_SEO
// so this route carries correct metadata whether or not the slug has been added
// to lib/seo-data.ts yet.
const TITLE = "Watch — Give Your Video Its Own Watch Page (Free)";
const DESCRIPTION =
  "Turn the video you made for her into a full watch page: a player that really plays, a channel row, a description with chapters that seek, a pinned comment and a comment section her friends can write in.";
const CATEGORY = "Love";
const SOCIAL_TITLE = "3 Years With Meera Sharma (Full Video, No Skips)";
const SOCIAL_DESCRIPTION = "2,481 views · Premiered 14 Feb 2026 · the timestamps are load-bearing";

const OG_IMAGE = {
  url: "https://gifts-media-prod-123.s3.ap-south-1.amazonaws.com/gifts-media/templates/watch/cover.webp",
  width: 1280,
  height: 720,
  alt: "A video watch page made for someone you love — SubhSandesh",
};

const base = getTemplateMeta(SLUG);
export const metadata: Metadata = {
  ...base,
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/${SLUG}` },
  openGraph: {
    ...base.openGraph,
    title: SOCIAL_TITLE,
    description: SOCIAL_DESCRIPTION,
    url: `${SITE_URL}/${SLUG}`,
    images: [OG_IMAGE],
  },
  twitter: {
    ...base.twitter,
    card: "summary_large_image",
    title: SOCIAL_TITLE,
    description: SOCIAL_DESCRIPTION,
    images: [OG_IMAGE.url],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const faqs = getFAQs(SLUG);
  const howTo = getHowTo(SLUG);
  const rating = getAggregateRating(SLUG);
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Templates", url: `${SITE_URL}/templates` },
          { name: "Watch", url: `${SITE_URL}/${SLUG}` },
        ]}
      />
      <TemplateJsonLd name="Watch" description={DESCRIPTION} category={CATEGORY} url={`${SITE_URL}/${SLUG}`} />
      {faqs.length > 0 && <FAQJsonLd faqs={faqs} />}
      {howTo && <HowToJsonLd howTo={howTo} />}
      {rating && (
        <TemplateAppJsonLd name="Watch" description={DESCRIPTION} url={`${SITE_URL}/${SLUG}`} aggregateRating={rating} />
      )}
      {children}
    </>
  );
}
