import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildMeta, SITE_URL } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import LuxuryMobileTopBrand from "@/components/LuxuryMobileTopBrand";
import { getGuide, guideSlugs } from "@/data/guide-registry";
import { guideVideoSet, guideMedia } from "@/lib/templateMedia";
import {
  isoDuration,
  isoUploadDate,
  chapterClips,
  getRelatedGuides,
  getRelatedArticlesForGuide,
  stepCount,
} from "@/lib/guides";
import GuideDetailClient from "./GuideDetailClient";

const CORNER_FILTER =
  "brightness(0) saturate(100%) invert(8%) sepia(55%) saturate(2800%) hue-rotate(330deg) brightness(90%) contrast(120%)";
const CORNER = "https://cdn.subhsandesh.in/gifts-media/indianFestival/alekhancorner2.svg";

/** Static params — the guide list is a compile-time constant, so every guide
 *  page is prerendered rather than rendered per request. */
export function generateStaticParams() {
  return guideSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return buildMeta({ title: "Guide not found | SubhSandesh" });

  const media = guideVideoSet(guide.slug);

  return buildMeta({
    title: `${guide.title} | SubhSandesh Guides`,
    description: guide.summary,
    alternates: { canonical: `${SITE_URL}/guides/${guide.slug}` },
    openGraph: {
      type: "article",
      title: guide.title,
      description: guide.summary,
      url: `${SITE_URL}/guides/${guide.slug}`,
      images: [{ url: media.poster, width: 1600, height: 900, alt: guide.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: guide.title,
      description: guide.summary,
      images: [media.poster],
    },
  });
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const media = guideVideoSet(guide.slug);
  const relatedGuides = getRelatedGuides(guide);
  const relatedArticles = await getRelatedArticlesForGuide(guide);

  /**
   * Three schemas, because this page is honestly three things at once and
   * collapsing them would lose eligibility for the results each one earns:
   *
   *   HowTo      — the written steps. Drives the step-list rich result.
   *   VideoObject — the recording. Required for the Videos tab and for a video
   *                 thumbnail beside the main result. `hasPart` carries the
   *                 chapters as Clip nodes, which is what produces the "key
   *                 moments" links under a video result.
   *   FAQPage    — the questions at the foot.
   *
   * BreadcrumbList is included separately so the result shows
   * Guides › <template> rather than a bare URL.
   *
   * ── ONE VideoObject, REFERENCED, NOT REPEATED ──────────────────────────────
   * The HowTo used to carry its own inline copy of the VideoObject alongside
   * the standalone one. Both described the same file, so Search Console counted
   * every guide twice under Enhancements › Videos, and Google was left to guess
   * which of two competing nodes was the page's video. Now the VideoObject is
   * declared once with an `@id` and the HowTo points at it by reference — the
   * standard way to say "the same thing" in JSON-LD across separate blocks.
   *
   * There is deliberately no `embedUrl`. `embedUrl` means "a URL that loads a
   * standalone player, embeddable in an iframe", and this page is an article
   * with a player in it, not a player. Pointing it here invited Google to embed
   * the whole guide and fail, which is one of the ways a video ends up filed as
   * "Video isn't on a watch page". `contentUrl` is the correct field for a
   * self-hosted MP4 and Google accepts either one.
   */
  const pageUrl = `${SITE_URL}/guides/${guide.slug}`;
  const videoId = `${pageUrl}#video`;

  const howToSteps = guide.sections.flatMap((section, si) =>
    section.steps.map((step, i) => ({
      "@type": "HowToStep",
      position: si * 100 + i + 1,
      name: step.title,
      text: step.body,
      url: `${SITE_URL}/guides/${guide.slug}#${section.id}`,
      ...(step.shot ? { image: guideMedia(guide.slug, step.shot) } : {}),
    })),
  );

  return (
    <main
      // `clip` rather than `hidden`: both suppress the horizontal overflow, but
      // `hidden` makes the element a scroll container, which breaks position:
      // sticky inside it. This is the project convention (see the theme notes);
      // the neighbouring older pages still use `hidden` and predate it.
      className="min-h-screen overflow-x-clip"
      style={{ background: "#f5ede6", color: "#2a0a0e", fontFamily: "'Inter', sans-serif" }}
    >
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "HowTo",
          "@id": `${pageUrl}#howto`,
          mainEntityOfPage: pageUrl,
          name: guide.title,
          description: guide.summary,
          totalTime: `PT${/(\d+)/.exec(guide.buildTime)?.[1] ?? 6}M`,
          image: media.poster,
          step: howToSteps,
          ...(guide.video ? { video: { "@id": videoId } } : {}),
        }}
      />

      {guide.video && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "VideoObject",
            "@id": videoId,
            name: guide.title,
            description: guide.summary,
            thumbnailUrl: [media.poster],
            contentUrl: media.mp4,
            // The watch page. Naming it explicitly is what tells Google this
            // recording belongs to this URL rather than floating free.
            url: pageUrl,
            mainEntityOfPage: pageUrl,
            uploadDate: isoUploadDate(guide.video.recordedAt),
            duration: isoDuration(guide.video.seconds),
            inLanguage: "en-IN",
            isFamilyFriendly: true,
            publisher: {
              "@type": "Organization",
              name: "SubhSandesh",
              url: SITE_URL,
            },
            // Only chapters that map to a written section get a Clip: those are
            // the ones with a real landing place. An intro marker as a "key
            // moment" would send someone to the top of a page they are on.
            // Offsets are derived from the unfiltered chapter list so a dropped
            // marker does not stretch the clip before it over the gap.
            hasPart: chapterClips(guide.video)
              .filter((c) => c.sectionId)
              .map((c) => ({
                "@type": "Clip",
                name: c.label,
                startOffset: c.startOffset,
                endOffset: c.endOffset,
                url: `${pageUrl}#${c.sectionId}`,
              })),
          }}
        />
      )}

      {guide.faqs.length > 0 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: guide.faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }}
        />
      )}

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Guides", item: `${SITE_URL}/guides` },
            { "@type": "ListItem", position: 2, name: guide.templateName, item: `${SITE_URL}/guides/${guide.slug}` },
          ],
        }}
      />

      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={CORNER} alt="" aria-hidden="true" style={{ position: "fixed", top: 0, left: 0, width: "clamp(100px, 26vw, 160px)", height: "clamp(100px, 26vw, 160px)", opacity: 0.5, transform: "scaleY(-1)", filter: CORNER_FILTER }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={CORNER} alt="" aria-hidden="true" style={{ position: "fixed", top: 0, right: 0, width: "clamp(100px, 26vw, 160px)", height: "clamp(100px, 26vw, 160px)", opacity: 0.5, transform: "scale(-1,-1)", filter: CORNER_FILTER }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={CORNER} alt="" aria-hidden="true" style={{ position: "fixed", bottom: 0, right: 0, width: "clamp(80px, 22vw, 150px)", height: "clamp(80px, 22vw, 150px)", opacity: 0.42, transform: "scaleX(-1)", filter: CORNER_FILTER }} />
      </div>

      <LuxuryMobileTopBrand />

      <article className="relative z-[1] max-w-4xl mx-auto px-4 md:px-6 pt-8 pb-28 md:pt-32">
        <GuideDetailClient
          guide={guide}
          relatedGuides={relatedGuides}
          relatedArticles={relatedArticles}
        />
      </article>
    </main>
  );
}
