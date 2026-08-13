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
// ── WHY GIFs HERE, WHEN THE HOUSE STYLE AVOIDS THEM ─────────────────────────
//
// Elsewhere we build motion in CSS/SVG because a GIF bands gradients to 256
// colours and fringes its alpha. These are different: they are hand-drawn
// character animations, and the banding is invisible on flat cel art. Nothing
// we could draw in SVG would carry the same warmth, and warmth is the entire
// product here.
//
// The one real constraint they impose is on export: `html-to-image` snapshots
// whichever frame happens to be painted, so a GIF must never sit inside a node
// passed to `exportNodeToPng`. See the note in `StoryCard.tsx`.

const slug = "happy-rakshabandhan-to-brother";
const a = (file: string) => templateMedia(slug, file);

export const RAKHI_ASSETS = {
  /** Screen 1 — the opening. 700 KB, so it is preloaded before the tap. */
  cover: a("cover.webp"),

  // ── The ritual, in order ──────────────────────────────────────────────────
  tilak: a("tilak.gif"),
  mithai: a("mithai.gif"),
  aarti: a("aarti.gif"),
  bandhan: a("bandhan.gif"),

  // ── The gift bit ──────────────────────────────────────────────────────────
  giftDemand: a("gift-demand.gif"),
  giftThinking: a("gift-thinking.gif"),
  giftReveal: a("gift-reveal.gif"),

  // ── Decorative ────────────────────────────────────────────────────────────
  bhaiBest: a("bhai-best.webp"),
  hug: a("hug.webp"),
} as const;

/**
 * Fetched during the cover screen so the ritual never opens on a blank frame.
 * `bandhan.gif` is 1.5 MB and `tilak.gif` 2.4 MB — on a phone connection those
 * are the two that would otherwise pop in visibly late.
 */
export const PRELOAD: string[] = [
  RAKHI_ASSETS.tilak,
  RAKHI_ASSETS.mithai,
  RAKHI_ASSETS.aarti,
  RAKHI_ASSETS.bandhan,
];
