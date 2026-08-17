import { templateMedia } from "@/lib/templateMedia";

// ─── Raksha Bandhan media ────────────────────────────────────────────────────
//
// Served from object storage, not the repo — these ten files are 4.9 MB and
// binary, and `lib/templateMedia.ts` explains why that never enters git. Keys
// are stable and immutable-cached, so re-running the uploader replaces a file
// in place without any URL here changing.
//
//     cd server && npm run upload:template-media -- --only=happy-rakshabandhan-to-brother
//
// Source of truth: <repo-root>/media-src/templates/happy-rakshabandhan-to-brother/
//
// ── WHY EVERY ASSET CARRIES ITS TRUE SIZE ───────────────────────────────────
//
// These are NOT square. They range from 1.000 (tilak, bandhan) to 1.408
// (gift-demand, 200×142). The first build dropped all of them into a 1:1 frame
// with `object-fit: cover`, which silently cropped 29% off the top and bottom of
// gift-demand and 15% off gift-thinking — the characters' heads.
//
// So the real width/height travels with the URL, every frame is sized from the
// asset's own ratio, and the fit is `contain`. Nothing is ever cropped, and a
// replaced asset with different proportions cannot reintroduce the bug: update
// the numbers here and every frame re-sizes itself.
//
// ── WHY GIFs HERE, WHEN THE HOUSE STYLE AVOIDS THEM ─────────────────────────
//
// Elsewhere we build motion in CSS/SVG because a GIF bands gradients to 256
// colours and fringes its alpha. These are different: hand-drawn character
// animation, where banding is invisible on flat cel art. Nothing we could draw
// in SVG would carry the same warmth, and warmth is the entire product.
//
// The one real constraint they impose is on export: `html-to-image` snapshots
// whichever frame happens to be painted, so a GIF must never sit inside a node
// passed to the PNG capture. See the note in `StoryCard.tsx`.

const slug = "happy-rakshabandhan-to-brother";
const a = (file: string) => templateMedia(slug, file);

export interface Asset {
  src: string;
  width: number;
  height: number;
  /** width / height — frames use this so nothing is ever cropped. */
  ratio: number;
}

const asset = (file: string, width: number, height: number): Asset => ({
  src: a(file),
  width,
  height,
  ratio: width / height,
});

export const RAKHI_ASSETS = {
  /** Screen 1 — the opening. 684 KB, so it is `priority`. */
  cover: asset("cover.webp", 480, 480),

  // ── The ritual, in order ──────────────────────────────────────────────────
  //
  // These are never shown on the step itself any more — the step is a card of
  // words. Each one plays full screen when the reader taps the action, in
  // `RitualTakeover`, and that is the only place they appear.
  tilak: asset("tilak.gif", 498, 498),
  mithai: asset("mithai.gif", 217, 197),
  aarti: asset("aarti.gif", 200, 198),
  bandhan: asset("bandhan.gif", 498, 498),

  // ── The gift bit ──────────────────────────────────────────────────────────
  /** The widest of the set at 1.408 — the one `cover` was mangling. */
  giftDemand: asset("gift-demand.gif", 200, 142),
  giftThinking: asset("gift-thinking.gif", 200, 170),
  giftReveal: asset("gift-reveal.gif", 498, 487),

  // ── Decorative ────────────────────────────────────────────────────────────
  bhaiBest: asset("bhai-best.webp", 200, 157),
  hug: asset("hug.webp", 200, 198),
} as const;

// ─── Demo media ──────────────────────────────────────────────────────────────
//
// The gallery preview used to render `SAMPLE`, which ships every photo slot
// empty on purpose. The result was that anyone browsing the template saw the
// shell — no photo, no memories, no shagun QR — and had no way to tell that
// those features exist at all. These five files fill it in.
//
// They are ONE photograph, cropped four ways. Four unrelated stock photos would
// have been easier and would have looked it: the demo is meant to read as one
// family's afternoon, which is what the real thing is.
//
// ── WHY THESE FIVE LIVE IN /public AND THE OTHER TEN DO NOT ─────────────────
//
// Everything above is served from object storage, for the reasons at the top of
// this file. These five are checked into `client/public/rakhi-demo/` instead,
// and the exception is deliberate.
//
// The rule exists because the ritual GIFs are 4.9 MB of binary that would enter
// git history, the Docker image and every deploy forever. These five total
// 136 KB — three orders of magnitude below the thing the rule is protecting
// against — and unlike the GIFs they are load-bearing for the FIRST render a
// stranger ever sees. An object-storage miss on `tilak.gif` costs one animation
// on a page someone already chose to open; a miss on `demo-hero.webp` means the
// gallery preview shows an empty ring and a broken memories grid, which is the
// exact failure this demo content was added to fix.
//
// So they ship with the app and cannot 404 independently of it.
//
// They are NOT in `media-src/templates/`, because everything in that folder is
// mirrored to object storage by the uploader and these would land there as five
// objects nothing reads. The photograph they were cut from lives at
// `media-src/_sources/rakhi-demo-source.png` — outside the folder the uploader
// scans — so a re-crop is still possible without putting dead files in a bucket.
//
// ── WHY THESE ARE PLAIN URLs AND NOT `Asset`s ───────────────────────────────
//
// They stand in for fields a sister uploads herself — `photoUrl`,
// `memories[].imageUrl`, `shagun.qrImageUrl` — which are `string` on the wire
// and rendered by the same components that render hers. Giving them the `Asset`
// treatment would mean a second, demo-only code path through those components,
// and the whole value of the demo is that it exercises the real one.
//
// ── THE QR ──────────────────────────────────────────────────────────────────
//
// `demo-qr.png` is a real, scannable version-3 symbol at EC level "high",
// generated from `lib/share/qr.ts`. It resolves to https://subhsandesh.in — so
// in GiftScreen's payment-card frame it reads exactly like the UPI QR a sister
// would upload, and anyone who actually scans it lands on the site rather than
// on a dead intent URL.
//
// PNG, not SVG, and that is not a preference. This URL lands in
// `shagun.qrImageUrl`, which GiftScreen renders through `next/image`, and
// `next.config.ts` leaves `dangerouslyAllowSVG` at its default of false — the
// optimiser rejects an SVG source outright. That default is right and must not
// be flipped to suit this file: the same field also holds a QR that a stranger
// uploaded, and allowing SVG there would push arbitrary user-supplied markup
// through /_next/image.
const demo = (file: string) => `/rakhi-demo/${file}`;

export const DEMO_MEDIA = {
  /** 900×900. The cover portrait and the story card. */
  hero: demo("demo-hero.webp"),
  /** 560×560 each. The memories grid. */
  memories: [demo("demo-mem-1.webp"), demo("demo-mem-2.webp"), demo("demo-mem-3.webp")] as const,
  qr: demo("demo-qr.png"),
} as const;

/**
 * Fetched during the cover screen so the ritual never opens on a blank frame.
 * `tilak.gif` is 2.4 MB and `bandhan.gif` 1.5 MB — on a phone connection those
 * are the two that would otherwise pop in visibly late.
 */
export const PRELOAD: string[] = [
  RAKHI_ASSETS.tilak.src,
  RAKHI_ASSETS.mithai.src,
  RAKHI_ASSETS.aarti.src,
  RAKHI_ASSETS.bandhan.src,
];
