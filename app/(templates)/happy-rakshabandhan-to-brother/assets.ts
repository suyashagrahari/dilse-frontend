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
