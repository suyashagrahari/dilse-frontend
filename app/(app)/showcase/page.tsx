// ─── /showcase — the video hub ───────────────────────────────────────────────
//
// Every template walkthrough in one place, indexable, and pointing at the
// guide that owns each recording. The list itself is data/video-showcase.ts;
// the count is read from it, so adding a recording is one line there and
// nothing here needs touching.
//
// ── WHY THIS PAGE DOES NOT CLAIM THE VIDEOS ─────────────────────────────────
//
// Every one of these recordings ALREADY has a canonical watch page:
// `/guides/<slug>`, which emits a full `VideoObject` with `contentUrl` set to
// the mp4 and `url`/`mainEntityOfPage` set to itself — that is what tells
// Google the recording belongs to that URL rather than floating free.
//
// If this page emitted its own `VideoObject` for the same `contentUrl`, two URLs
// would be claiming one video. Google picks one, and the loser stops being
// eligible for a video result at all. The guide pages should win that: they
// carry a HowTo, written steps, annotated screenshots and an FAQ, against a card
// and a tagline here.
//
// So this is an `ItemList` of `ListItem`s pointing at the guides — the same
// shape `/guides` already uses, and for the same stated reason. It is an index,
// and the markup says so. What it can rank for is the collection query ("all
// SubhSandesh template videos"), and what it does for the guides is pass them
// internal links from a page that is itself linked from the footer.
//
// ── WHY IT IS LINKED AT ALL ─────────────────────────────────────────────────
//
// It was built unlisted and deliberately orphaned. Indexing changed that
// requirement: an orphan page — no internal links, sitemap-only — is crawled
// late, treated as low value, and does not rank. Ranking and "reachable from
// nowhere" cannot both be true, so the footer links it. See lib/social.ts's
// neighbours in SubhSandeshFooter.

import type { Metadata } from "next";

import { JsonLd } from "@/components/JsonLd";
import { SHOWCASE, SHOWCASE_COUNT, showcaseCards } from "@/data/video-showcase";
import { isoDateTime, isoDuration } from "@/lib/guides";
import { buildMeta, SITE_URL } from "@/lib/seo";

import ShowcaseClient from "./ShowcaseClient";

const PAGE_URL = `${SITE_URL}/showcase`;

const TITLE =
  "Template Walkthrough Videos — watch every SubhSandesh page built | SubhSandesh";
/* Derived, not typed out. The hand-written version listed "Raksha Bandhan,
   wedding invitations, birthday and love pages" and stopped being true the
   moment a Ganesh Chaturthi recording was added — on the one page whose entire
   job is to be readable by something that cannot watch a video. The header
   paragraph in ShowcaseClient is built the same way, from the same data. */
const OCCASIONS = [
  ...new Set(showcaseCards().map((c) => c.categoryLabel.toLowerCase())),
].join(", ");

const DESCRIPTION =
  `${SHOWCASE_COUNT} full walkthrough videos — ${OCCASIONS}. Every field filled in, then the ` +
  "finished page as the person receiving it sees it. Watch here, on YouTube, or on Instagram.";

export const metadata: Metadata = buildMeta({
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  keywords: [
    "template walkthrough video",
    "digital invitation video tutorial",
    "raksha bandhan page video",
    "wedding invitation website demo",
    "birthday page for girlfriend video",
    "SubhSandesh templates",
  ],
  openGraph: {
    // The house default is the generic site card. A video hub shared into
    // WhatsApp should preview as one of the actual recordings — the first
    // poster is a real frame from a real template.
    images: [{ url: SHOWCASE[0].media.poster, width: 1280, height: 720, alt: TITLE }],
    type: "website",
  },
  twitter: { card: "summary_large_image", images: [SHOWCASE[0].media.poster] },
});

export default function ShowcasePage() {
  return (
    <>
      {/* The collection itself, and the list of what is in it. `ListItem.url`
          is the GUIDE, not this page — see the note above on why this page does
          not claim the videos. */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "@id": PAGE_URL,
          url: PAGE_URL,
          name: "SubhSandesh template walkthrough videos",
          description: DESCRIPTION,
          inLanguage: "en-IN",
          isPartOf: { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: SITE_URL },
          publisher: { "@type": "Organization", name: "SubhSandesh", url: SITE_URL },
          mainEntity: {
            "@type": "ItemList",
            name: "Template walkthrough videos",
            numberOfItems: SHOWCASE_COUNT,
            itemListOrder: "https://schema.org/ItemListOrderAscending",
            itemListElement: SHOWCASE.map((entry, i) => ({
              "@type": "ListItem",
              position: i + 1,
              // The guide page is where the recording lives. Pointing here
              // instead would put this page in competition with it.
              url: `${SITE_URL}${entry.guideHref}`,
              name: entry.guide.title,
              image: entry.media.poster,
              ...(entry.guide.video
                ? {
                    // Enough to describe the item without asserting a second
                    // canonical home for the video: no `contentUrl`, and the
                    // `url` above is the guide.
                    additionalType: "https://schema.org/VideoObject",
                    description: entry.guide.tagline,
                  }
                : {}),
            })),
          },
        }}
      />

      {/* Breadcrumbs, so the result shows Home › Guides › Walkthrough videos
          rather than a bare URL. Parented under /guides because that is where
          this sits conceptually and where its links go. */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE_URL}/guides` },
            { "@type": "ListItem", position: 3, name: "Walkthrough videos", item: PAGE_URL },
          ],
        }}
      />

      {/* One VideoObject for the page as a whole would be a lie — there are
          many. Instead each guide keeps its own, and the freshest recording
          date is published here as the collection's `dateModified`, which is
          what a hub can honestly claim. */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "@id": `${PAGE_URL}#page`,
          url: PAGE_URL,
          dateModified: newestRecording(),
          timeRequired: totalRuntime(),
        }}
      />

      {/* The cards are resolved HERE, on the server, and handed over as flat
          rows. ShowcaseClient used to import the showcase list itself, which
          pulled data/guide-registry.ts — 300 KB of source, forty-three guides,
          every step body and every FAQ — into the browser bundle to render
          thirteen cards. See the note above `ShowcaseCardData`. */}
      <ShowcaseClient cards={showcaseCards()} />
    </>
  );
}

/** The most recent recording date in the showcase, as an ISO datetime. */
function newestRecording(): string {
  const dates = SHOWCASE.map((e) => e.guide.video?.recordedAt).filter(
    (d): d is string => typeof d === "string"
  );
  return isoDateTime(dates.sort().at(-1) ?? "2026-08-26");
}

/** Total runtime of everything on the page, as an ISO 8601 duration. */
function totalRuntime(): string {
  return isoDuration(SHOWCASE.reduce((sum, e) => sum + (e.guide.video?.seconds ?? 0), 0));
}
