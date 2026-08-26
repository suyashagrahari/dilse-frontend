import type { Metadata } from "next";
import Link from "next/link";
import { buildMeta, SITE_URL } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import LuxuryMobileTopBrand from "@/components/LuxuryMobileTopBrand";
import { guideList } from "@/data/guide-registry";
import { guideVideoSet } from "@/lib/templateMedia";
import { isoDuration, stepCount } from "@/lib/guides";
import GuidesHubClient from "./GuidesHubClient";

export const metadata: Metadata = buildMeta({
  title: "Product Guides — video walkthroughs & step-by-step docs | SubhSandesh",
  description:
    "Watch the full build of any SubhSandesh page, then follow the same steps written out. Video walkthroughs with chapters, annotated screenshots, and answers to the questions people actually ask.",
  alternates: { canonical: `${SITE_URL}/guides` },
});

const CORNER_FILTER =
  "brightness(0) saturate(100%) invert(8%) sepia(55%) saturate(2800%) hue-rotate(330deg) brightness(90%) contrast(120%)";

const CORNER = "https://cdn.subhsandesh.in/gifts-media/indianFestival/alekhancorner2.svg";

export default function GuidesPage() {
  const withVideo = guideList.filter((g) => g.video);

  return (
    <main
      // `clip` rather than `hidden`: both suppress the horizontal overflow, but
      // `hidden` makes the element a scroll container, which breaks position:
      // sticky inside it. This is the project convention (see the theme notes);
      // the neighbouring older pages still use `hidden` and predate it.
      className="min-h-screen overflow-x-clip"
      style={{ background: "#f5ede6", color: "#2a0a0e", fontFamily: "'Inter', sans-serif" }}
    >
      {/* An ItemList of the video guides rather than one VideoObject per page.
          Google needs a VideoObject to consider a video for the Videos tab and
          for a thumbnail in the main results, but those live on each guide's own
          page where the video actually is — here the list is what is true: this
          page is an index, not a video page. */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "SubhSandesh product guides",
          description:
            "Video walkthroughs and written step-by-step guides for building SubhSandesh celebration pages.",
          numberOfItems: guideList.length,
          itemListElement: guideList.map((g, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${SITE_URL}/guides/${g.slug}`,
            name: g.title,
          })),
        }}
      />

      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={CORNER} alt="" aria-hidden="true" style={{ position: "fixed", top: 0, left: 0, width: "clamp(112px, 30vw, 180px)", height: "clamp(112px, 30vw, 180px)", opacity: 0.62, transform: "scaleY(-1)", filter: CORNER_FILTER }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={CORNER} alt="" aria-hidden="true" style={{ position: "fixed", top: 0, right: 0, width: "clamp(112px, 30vw, 180px)", height: "clamp(112px, 30vw, 180px)", opacity: 0.62, transform: "scale(-1,-1)", filter: CORNER_FILTER }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={CORNER} alt="" aria-hidden="true" style={{ position: "fixed", bottom: 0, left: 0, width: "clamp(86px, 24vw, 170px)", height: "clamp(86px, 24vw, 170px)", opacity: 0.5, filter: CORNER_FILTER }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={CORNER} alt="" aria-hidden="true" style={{ position: "fixed", bottom: 0, right: 0, width: "clamp(86px, 24vw, 170px)", height: "clamp(86px, 24vw, 170px)", opacity: 0.5, transform: "scaleX(-1)", filter: CORNER_FILTER }} />
      </div>

      <LuxuryMobileTopBrand />

      <section className="relative z-[1] max-w-6xl mx-auto px-4 md:px-6 pt-10 pb-28 md:pt-32">
        <header className="text-center">
          <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.28em] mb-3" style={{ color: "#c9a84c" }}>
            Product Guides
          </p>
          <h1
            className="text-[40px] md:text-[68px] leading-[0.94] tracking-[-0.03em]"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
          >
            Watch it built.
            <em style={{ color: "#c9a84c", fontStyle: "italic" }}> Then build it.</em>
          </h1>
          <p className="mt-5 text-base md:text-lg max-w-2xl mx-auto" style={{ color: "#7a5555", lineHeight: 1.65 }}>
            Every guide comes twice over — a short recording with chapters you can jump
            between, and the same steps written out with screenshots. Watch if you want the
            feel of it; read if you are mid-build and need one specific field.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2" style={{ fontSize: 12, fontWeight: 600, color: "#7a5555" }}>
            <span>{guideList.length} guides</span>
            <span aria-hidden style={{ color: "#c9a84c" }}>·</span>
            <span>{withVideo.length} with video</span>
            <span aria-hidden style={{ color: "#c9a84c" }}>·</span>
            <span>{guideList.reduce((n, g) => n + stepCount(g), 0)} documented steps</span>
          </div>
        </header>

        <GuidesHubClient guides={guideList} />

        {/* A guide is not the only kind of help, and someone who scrolled the
            whole list without finding theirs should land somewhere rather than
            at the bottom of a grid. */}
        <div
          className="mt-14 md:mt-20 rounded-3xl p-7 md:p-9 text-center"
          style={{ border: "1px solid rgba(61,12,17,0.14)", background: "rgba(255,255,255,0.72)" }}
        >
          <h2
            style={{
              fontFamily: "'Playfair Display', serif", fontWeight: 700,
              fontSize: "clamp(24px,3vw,32px)", lineHeight: 1.1,
              letterSpacing: "-0.02em", color: "#2a0a0e", margin: 0,
            }}
          >
            Not the one you needed?
          </h2>
          <p className="mt-3 mx-auto" style={{ maxWidth: 520, fontSize: 14.5, lineHeight: 1.66, color: "#7a5555" }}>
            Every template has its own help on its page, the{" "}
            <Link href="/help" style={{ color: "#c9a84c", fontWeight: 700, textDecoration: "none" }}>Help Centre</Link>{" "}
            covers the account and sharing questions, and the{" "}
            <Link href="/blog" style={{ color: "#c9a84c", fontWeight: 700, textDecoration: "none" }}>blog</Link>{" "}
            has the writing help. If a guide is missing, ask us for it.
          </p>
          <Link
            href="/contact-us"
            className="mt-5 inline-flex items-center gap-2"
            style={{
              padding: "11px 22px", borderRadius: 999, textDecoration: "none",
              background: "linear-gradient(180deg,#3d0c11,#2a0a0e)", color: "#f5ede6",
              border: "1px solid #c9a84c", fontSize: 12, fontWeight: 800,
              letterSpacing: "0.1em", textTransform: "uppercase",
            }}
          >
            Request a guide
          </Link>
        </div>
      </section>
    </main>
  );
}
