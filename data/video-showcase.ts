// ─── The video showcase's one list ───────────────────────────────────────────
//
// Template walkthroughs, each of which exists in three places: our own CDN,
// YouTube, and an Instagram reel. This file holds ONLY the two things that
// cannot be derived — the YouTube id and the Instagram reel code.
//
// ── WHY SO LITTLE IS STORED HERE ────────────────────────────────────────────
//
// Everything else already exists and is already correct somewhere else:
//
//   · the mp4, the 720p mp4 and the poster come from `guideVideoSet(slug)`,
//     which builds them from the naming convention that
//     `scripts/compress-guide-videos.sh` writes. Re-typing
//     `https://cdn.subhsandesh.in/gifts-media/guides/<slug>/<slug>-720.mp4`
//     once per entry would be one chance per entry to typo a URL that fails
//     silently as a dead <video> with a poster still showing.
//   · the title, tagline, accent, emoji, build time and template link come from
//     `data/guide-registry.ts`, which is what /guides already publishes. Two
//     copies of a title drift the first time somebody edits one of them.
//
// So the rule is: if it can be looked up by slug, it is not in this file. The
// slug is checked against the guide registry at module load — a typo there is a
// thrown error at build time rather than an empty card in production.
//
// ── WHY THE INSTAGRAM SHARE TOKEN IS NOT KEPT ───────────────────────────────
//
// The links these came from carried `?stkn=…`, which is a per-share token tied
// to whoever generated it. It is not needed to view a public reel, it expires,
// and pasting one into a page that other people load would be publishing a
// credential-ish string for no benefit. Only the reel code is stored, and the
// canonical `https://www.instagram.com/reel/<code>/` is rebuilt from it.

import { getGuide, GUIDE_CATEGORIES } from "@/data/guide-registry";
import { guideVideoSet } from "@/lib/templateMedia";
import type { ProductGuide } from "@/types/product-guide";

export interface ShowcaseSource {
  /** Matches a `slug` in data/guide-registry.ts. Everything else follows. */
  slug: string;
  /** The `youtu.be/<id>` id — NOT a full URL. */
  youtubeId: string;
  /** The `instagram.com/reel/<code>` code — NOT a full URL. */
  instagramCode: string;
}

/**
 * A chronological log, oldest first. This is NOT the order the page shows them
 * in — see the sort under `SHOWCASE`. Append to the end when a recording ships.
 */
const SOURCES: ShowcaseSource[] = [
  { slug: "happy-rakshabandhan-to-sister",  youtubeId: "raxb2HdVeQw", instagramCode: "Dc_AbwBCPoG" },
  { slug: "happy-rakshabandhan-to-brother", youtubeId: "5ovesziKct8", instagramCode: "Dc-_HnVieX3" },
  { slug: "darling",                        youtubeId: "lx10QWwJq4c", instagramCode: "Dc_E7U7qemV" },
  { slug: "love-gf",                        youtubeId: "bP_crjGQzNI", instagramCode: "Dc_FWDXqfnt" },
  { slug: "birthday-gf",                    youtubeId: "3zj6xt2YXOI", instagramCode: "Dc_CrxvK5G9" },
  { slug: "bouquet-gf",                     youtubeId: "n_Whnp3ZUeo", instagramCode: "Dc_EdAVKz80" },
  { slug: "missyou-gf",                     youtubeId: "zKJZwizmwig", instagramCode: "Dc_GLrpi3xl" },
  { slug: "apology-dashboard",              youtubeId: "ssV35H3ISzc", instagramCode: "Dc_FzdVK_1_" },
  { slug: "christian-wedding",              youtubeId: "ptbd84K1AGk", instagramCode: "Dc_Gf61q2eB" },
  { slug: "shaadi-card",                    youtubeId: "ysMQcs11Ucg", instagramCode: "Dc_Hhi-C695" },
  { slug: "wedding-shaadi",                 youtubeId: "oR9Pana_aD0", instagramCode: "Dc_H1SHiVQ2" },
  { slug: "reception",                       youtubeId: "M7Ayhj2XAP8", instagramCode: "Dc_HCJnKnxC" },
  { slug: "happy-ganesh-chaturthi",         youtubeId: "mpWiv5T59QY", instagramCode: "DdEMPgvCTN3" },
];

/** One card's worth of everything the page needs, assembled from both sources. */
export interface ShowcaseEntry extends ShowcaseSource {
  guide: ProductGuide;
  /** Our own CDN copies, by convention. */
  media: ReturnType<typeof guideVideoSet>;
  /** Watch pages, for the "open it there" links. */
  youtubeWatchUrl: string;
  /** Privacy-preserving host: no cookie until the frame is actually created. */
  youtubeEmbedUrl: string;
  instagramUrl: string;
  /** Where someone goes to build this one themselves. */
  guideHref: string;
  templateHref: string;
}

function build(source: ShowcaseSource): ShowcaseEntry {
  const guide = getGuide(source.slug);
  // Thrown at module load, which means at build time — the whole point of
  // keying on slug is that a wrong one cannot reach a browser.
  if (!guide) {
    throw new Error(
      `[video-showcase] "${source.slug}" is not a slug in data/guide-registry.ts. ` +
        "The showcase derives titles, accents and media paths from the guide, so the " +
        "slug has to match exactly."
    );
  }
  return {
    ...source,
    guide,
    media: guideVideoSet(source.slug),
    youtubeWatchUrl: `https://youtu.be/${source.youtubeId}`,
    // youtube-nocookie, and `rel=0` so the end screen does not advertise
    // somebody else's channel on a page about our own product.
    youtubeEmbedUrl: `https://www.youtube-nocookie.com/embed/${source.youtubeId}?rel=0&modestbranding=1`,
    instagramUrl: `https://www.instagram.com/reel/${source.instagramCode}/`,
    guideHref: `/guides/${source.slug}`,
    templateHref: guide.templateHref,
  };
}

/**
 * Newest recording first, which is not the order the list above is kept in.
 *
 * The two orders want different things. `SOURCES` is a log: appending keeps the
 * history readable and a diff shows exactly what was added. The PAGE wants the
 * freshest work at the top — a dated festival recording is most useful in the
 * days before the festival, and it was arriving at the bottom of a wall of
 * thirteen cards. This also makes `SHOWCASE[0].media.poster`, which page.tsx
 * uses for the og:image and the Twitter card, the newest recording rather than
 * permanently the first one ever made.
 *
 * `recordedAt` is a plain ISO date so it sorts as a string. Ties fall back to
 * the log position, later meaning newer — a whole batch recorded on one day
 * therefore keeps the order it was recorded in rather than an arbitrary one.
 */
export const SHOWCASE: ShowcaseEntry[] = SOURCES.map(build)
  .map((entry, logIndex) => ({ entry, logIndex }))
  .sort((a, b) => {
    const byDate = (b.entry.guide.video?.recordedAt ?? "").localeCompare(
      a.entry.guide.video?.recordedAt ?? "",
    );
    return byDate !== 0 ? byDate : b.logIndex - a.logIndex;
  })
  .map(({ entry }) => entry);

/** For the header count, so the copy cannot disagree with the list. */
export const SHOWCASE_COUNT = SHOWCASE.length;

/**
 * One entry by slug, for the guide page that owns the recording.
 *
 * A guide knows about its own mp4 through `guideVideoSet(slug)` and knew nothing
 * about the two social copies, so `/guides/<slug>` could not link to them and
 * the VideoObject could not declare them the same work. This is the lookup that
 * closes that, and it goes in THIS direction on purpose: the showcase already
 * imports the guide registry, so the ids cannot move into `ProductGuide`
 * without an import cycle — and they do not belong there anyway. A guide is
 * about a flow; where the recording was also posted is distribution.
 *
 * Callers should be server components. Importing this file pulls the whole
 * guide registry in behind it, which is not something to ship to a browser.
 */
export const getShowcase = (slug: string): ShowcaseEntry | undefined =>
  SHOWCASE.find((s) => s.slug === slug);

/* ── WHAT THE CLIENT COMPONENT GETS ─────────────────────────────────────────
 *
 * A flat, serialisable row per card — and the reason it exists is bundle size,
 * not tidiness.
 *
 * `ShowcaseEntry` carries a whole `ProductGuide`, and a "use client" component
 * that imports `SHOWCASE` to read one therefore pulls `data/guide-registry.ts`
 * into the BROWSER bundle: 300 KB of source, forty-three guides, every step
 * body, every screenshot filename and every FAQ answer — shipped to render
 * thirteen cards that between them use nine fields.
 *
 * So the server resolves the cards and hands over only those nine fields. The
 * registry stays where it belongs, and adding a field here is a deliberate act
 * rather than a re-import that silently costs a quarter of a megabyte.
 *
 * This is also why `ShowcaseClient` keeps a two-line `formatDuration` of its
 * own instead of importing the one in `lib/guides.ts`. That module imports the
 * registry AND `lib/strapi`, so the "duplication" is what keeps both out of the
 * browser. Do not consolidate it.
 */
export interface ShowcaseCardData {
  slug: string;
  templateName: string;
  title: string;
  tagline: string;
  emoji: string;
  accent: string;
  buildTime: string;
  /** null for a guide with no recording, which cannot currently be in the list. */
  seconds: number | null;
  /** The guide's category id, and the human label the hub already uses for it. */
  category: string;
  categoryLabel: string;
  mp4: string;
  mp4720: string;
  poster: string;
  youtubeEmbedUrl: string;
  instagramUrl: string;
  guideHref: string;
  templateHref: string;
}

const CATEGORY_LABEL = new Map(GUIDE_CATEGORIES.map((c) => [c.id as string, c.label as string]));

/** Call from a server component and pass the result down as a prop. */
export const showcaseCards = (): ShowcaseCardData[] =>
  SHOWCASE.map((e) => ({
    slug: e.slug,
    templateName: e.guide.templateName,
    title: e.guide.title,
    tagline: e.guide.tagline,
    emoji: e.guide.emoji,
    accent: e.guide.accent,
    buildTime: e.guide.buildTime,
    seconds: e.guide.video?.seconds ?? null,
    category: e.guide.category,
    categoryLabel: CATEGORY_LABEL.get(e.guide.category) ?? e.guide.category,
    mp4: e.media.mp4,
    mp4720: e.media.mp4720,
    poster: e.media.poster,
    youtubeEmbedUrl: e.youtubeEmbedUrl,
    instagramUrl: e.instagramUrl,
    guideHref: e.guideHref,
    templateHref: e.templateHref,
  }));
