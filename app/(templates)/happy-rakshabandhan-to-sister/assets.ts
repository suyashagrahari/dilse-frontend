// ─── Raksha Bandhan (to sister) — every file this template owns ──────────────
//
// Six rasters, 219 KB, all of them in `client/public/rakhi-sister/`. There is
// no object storage in this file and no `templateMedia()` import, which is the
// one structural difference from the brother template's `assets.ts` — read that
// file too, because this one is defined by what it does NOT do.
//
// ── WHY NO EXTERNAL MEDIA HERE, WHEN THE BROTHER TEMPLATE HAS TEN GIFs ──────
//
// The brother template's ritual is a performance the reader WATCHES: he taps
// tilak, mithai, aarti, bandhan, and each tap plays a frame of hand-drawn
// character animation. Nothing we could draw in SVG carries that warmth, so it
// pays 4.9 MB of GIF for it and serves that from a bucket.
//
// This template's ritual is a performance the reader DOES. She drags a thread
// around a wrist and the knot cinches under her finger. That cannot be a GIF —
// a GIF has no idea where her finger is — so every moving thing here is drawn
// in SVG and CSS and animated from the same state the pointer is driving. Once
// the interaction forces vector art, a raster library would only be decoration
// competing with it, and the whole page is lighter for not having one.
//
// The knock-on benefits are the reason not to "improve" this later: nothing on
// this page can 404 independently of the app, the ritual runs offline once the
// document is cached, it recolours per rakhi style from `RAKHI_STYLES` without
// seven variants of anything, and `html-to-image` can snapshot any of it —
// which is not true of a GIF, whose painted frame at capture time is whatever
// the browser happened to be showing.
//
// So there is no `PRELOAD` export and no uploader command to run. If you find
// yourself adding one, the question to answer first is what it does that a
// pointer-driven SVG cannot.

/** A raster whose true proportions travel with its URL. */
export interface Asset {
  src: string;
  width: number;
  height: number;
  /** width / height — frames size themselves from this so nothing is cropped. */
  ratio: number;
}

const local = (file: string) => `/rakhi-sister/${file}`;

const asset = (file: string, width: number, height: number): Asset => ({
  src: local(file),
  width,
  height,
  ratio: width / height,
});

// ─── The cover ───────────────────────────────────────────────────────────────
//
// Composed as SVG and rendered to WebP once, from the palette in
// `components/theme.ts`: rani frame on ivory, a marigold garland, the rakhi and
// its pendant, and two mehendi leaves. Typographic and ornamental on purpose —
// no drawn figures, because a stylised brother and sister is either a specific
// pair of people (and so the wrong pair for every visitor) or a clip-art one.
//
// ── WHY `cover` IS 3:4 AND NOT THE 1200×630 AN OG IMAGE WANTS ───────────────
//
// Because the gallery card is the surface that actually crops. `TemplateCard`
// renders `coverImage` into an `aspect-[3/4]` box with `object-cover`, so a
// 1200×630 file loses 61% of its width there — the centre column of a wide
// composition, which is exactly where the words are. A 3:4 file loses nothing.
//
// `og` is the same artwork laid out wide for the scrapers that want 1.91:1.
// Use `cover` for `config.coverImage` and `og` for the `openGraph.images` entry
// in `layout.tsx`, and quote the width/height below verbatim: the brother
// template's comments record that a lying size makes some scrapers refuse the
// preview outright, and that a wrong ratio silently cropped its characters'
// heads.
//
// If a single file ever has to serve both, `cover` is the safer of the two. Its
// whole title block sits inside the centre 1.91:1 band (y 285–756 of 1200), so
// a landscape centre-crop of it still reads "Happy Raksha Bandhan — for my
// sister". The reverse is not true.
//
// The card's own chrome is designed around, too. `TemplateCard` paints a
// top-to-bottom black scrim over the image and stacks its emoji chip, heart,
// type badge, title and description on top; below ~65% of the height nothing is
// legible. Every word in `cover.webp` ends above that line, and what is under
// it is ornament.
export const RS_ASSETS = {
  /** 41.6 KB. The gallery card — `config.coverImage`. */
  cover: asset("cover.webp", 900, 1200),
  /** 37.4 KB. The same artwork at 1.91:1, for `openGraph` / `twitter`. */
  og: asset("cover-og.webp", 1200, 630),
} as const;

// ─── Demo media ──────────────────────────────────────────────────────────────
//
// The gallery preview renders `DEMO` (see `components/types.ts`), and `DEMO`
// needs a face and three memories — because `SAMPLE`, which the builder starts
// from, ships all of those empty on purpose and a preview of `SAMPLE` shows a
// stranger the shell of the template instead of the template.
//
// These four are ONE photograph, cropped four ways. Four stock photos would
// have been quicker and would have looked it: the demo has to read as one
// family's afternoon, because that is what a real page is.
//
// ── WHY THEY ARE IN /public AND NOT media-src/templates/ ────────────────────
//
// Same reasoning as the brother template's five, which sit beside these in
// `public/rakhi-demo/`. They are load-bearing for the FIRST render a stranger
// ever sees, they total 140 KB, and shipping them with the app means they
// cannot 404 on their own. Anything under `media-src/templates/` is mirrored to
// object storage by the uploader, and these would land there as four objects
// nothing reads — so the photograph they were cut from lives at
// `media-src/_sources/rakhi-demo-source.png`, outside the folder the uploader
// scans, and a re-crop stays possible without seeding a bucket with dead files.
//
// ── WHY THE CROPS DIFFER FROM THE BROTHER TEMPLATE'S ───────────────────────
//
// Both templates cut the same 1402×1122 photograph, and both gallery cards can
// appear in the same grid. So no region is reused: the brother's set is a wide
// two-shot, a tight wrist, his face, and her lap with the gift box; this set is
// her portrait, the thali from above, him beside the shrine, and a wide
// shoulders-down of the tie. A shared crop would read as one template listed
// twice.
//
// The hero being HER and not the two of them is the deliberate part. A brother
// builds this page and it is addressed to her — the cover puts her name in the
// largest text on the screen, and a photograph of the sender beside her there
// competes with that.
//
// ── WHY PLAIN URLs AND NOT `Asset`s ─────────────────────────────────────────
//
// They stand in for fields a brother uploads himself — `photoUrl` and
// `memories[].imageUrl` — which are `string` on the wire and rendered by the
// same components that render his. Giving them the `Asset` treatment would mean
// a second, demo-only path through those components, and the entire value of the
// demo is that it exercises the real one.
//
// ── NO PAYMENT QR SHIPS WITH THIS TEMPLATE ─────────────────────────────────
//
// There used to be a `demo-qr.png` here, standing in for a UPI QR a brother
// would upload to the lifafa. That field is gone: the money on this template
// flows FROM the builder TO the reader, and a QR encodes a payee, so his handle
// on her screen built a payment rail running backwards. The full reasoning is on
// the `Lifafa` interface in `components/types.ts` and is not repeated here.
//
// The only QR left anywhere near this template is the story card's, generated in
// code by `lib/share/qr.ts` from the page's own share URL. That one is
// legitimate, it is not a payment code, and it needs no file in /public.
const demo = (file: string) => local(file);

export const DEMO_MEDIA = {
  /** 900×900, 55.1 KB. Her portrait — the cover frame and the story card. */
  hero: demo("demo-hero.webp"),
  /** 560×560 each, 85 KB the three. The polaroid grid. */
  memories: [demo("demo-mem-1.webp"), demo("demo-mem-2.webp"), demo("demo-mem-3.webp")] as const,
} as const;
