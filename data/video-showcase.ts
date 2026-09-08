// ─── The video showcase's one list ───────────────────────────────────────────
//
// Twelve template walkthroughs, each of which exists in three places: our own
// CDN, YouTube, and an Instagram reel. This file holds ONLY the two things that
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
//     twelve times would be twelve chances to typo a URL that fails silently
//     as a dead <video> with a poster still showing.
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

import { getGuide } from "@/data/guide-registry";
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

/** Recording order, which is also the order they are shown. */
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

export const SHOWCASE: ShowcaseEntry[] = SOURCES.map(build);

/** For the header count, so the copy cannot disagree with the list. */
export const SHOWCASE_COUNT = SHOWCASE.length;
