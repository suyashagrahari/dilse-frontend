// ─── The mascot set ──────────────────────────────────────────────────────────
//
// Five animations that carry the feedback ask's escalation beats. They live in
// object storage beside every other binary this app renders — see
// `lib/templateMedia.ts` for why nothing here is in /public — under
// `gifts-media/feedback/`, uploaded with the house headers
// (`public, max-age=31536000, immutable`).
//
// ── WHY THESE ARE GIFs WHEN RatingFace IS AN SVG ────────────────────────────
//
// `components/feedback/RatingFace.tsx` argues at length that a GIF is the wrong
// medium for the feedback sheet, and it is still right — about the FIRST frame
// somebody sees. That face renders the instant a page is published, has to be
// crisp at any density, and has to react to the star being hovered. No fetched
// asset can do those three things.
//
// These are a different job. They appear only after a deliberate dismissal, on
// a modal that is already mounted and already on screen. That changes every one
// of the old objections:
//
//   · No first-paint cost. Nothing here is fetched on mount; the ask stage is
//     still pure SVG. `preloadMascot` warms the NEXT beat while the current one
//     is on screen, so a transition is instant without anybody paying for art
//     they never see. Someone who rates or leaves straight away downloads none
//     of it.
//   · They do not need to hold state. Each one is a single, fixed reaction to a
//     single event, which is exactly what a fixed loop is good at.
//   · Weight was cut where it mattered: see-you was a 1080px, 733 KB source and
//     ships at 320px/64 colours and 165 KB, which is indistinguishable at the
//     ~180px slot it renders into. The whole set is 560 KB and no single path
//     through the flow loads more than about 280 KB of it.
//
// So the split is deliberate and neither half should absorb the other: SVG for
// the thing that must be instant and reactive, animation for the beats that are
// a performance.
//
// ── WHY THE INTRINSIC SIZE IS RECORDED ──────────────────────────────────────
//
// `width`/`height` below are the real pixel dimensions of each file, handed to
// the <img> so the browser reserves the box before the bytes land. Without them
// the card reflows the moment a GIF decodes — on the one screen whose entire
// job is to feel considered rather than janky.

import { media } from "@/lib/templateMedia";

export type MascotKey = "please" | "pleasePlease" | "imFine" | "thankYou" | "seeYou";

export interface Mascot {
  src: string;
  /** Described for a screen reader, because the picture IS the message here. */
  alt: string;
  width: number;
  height: number;
}

export const MASCOTS: Record<MascotKey, Mascot> = {
  please: {
    src: media("feedback/please.gif"),
    alt: "A small blue penguin looking up hopefully, saying please",
    width: 200,
    height: 200,
  },
  pleasePlease: {
    src: media("feedback/please-please.gif"),
    alt: "The penguin with its flippers clasped together, begging, saying please please",
    width: 498,
    height: 498,
  },
  imFine: {
    // The one animated WebP in the set. Kept as-is: 17 frames with a real alpha
    // channel at 42 KB, which no GIF conversion was going to beat — GIF
    // transparency is one bit, so the soft edges would have come back jagged.
    src: media("feedback/im-fine.webp"),
    alt: "The penguin crying two streams of tears while insisting it is fine",
    // 200, not the 300 first recorded here. ffprobe cannot read an animated
    // WebP's dimensions and reported 0×0, so the number was guessed from its
    // neighbours; the browser reports naturalWidth 200. A wrong intrinsic size
    // reserves the wrong box and reintroduces exactly the reflow these are for.
    width: 200,
    height: 200,
  },
  thankYou: {
    src: media("feedback/thank-you.gif"),
    alt: "The penguin wearing a smart hat, beaming, saying thank you",
    width: 300,
    height: 300,
  },
  seeYou: {
    src: media("feedback/see-you.gif"),
    alt: "A shiba inu waving goodbye, saying see you next time",
    width: 320,
    height: 320,
  },
};

/**
 * Warm one animation so the next beat renders without a blank frame.
 *
 * A plain `new Image()` is deliberate rather than `<link rel=prefetch>`: this
 * has to work from inside an effect on a component that may already be halfway
 * through its own exit, and the image cache is the thing actually being primed.
 * Failures are silent because a missed preload costs a few hundred milliseconds
 * of blank stage and nothing else — never an error in front of somebody who
 * just published a card for a person they love.
 */
export function preloadMascot(key: MascotKey): void {
  if (typeof window === "undefined") return;
  try {
    const img = new window.Image();
    img.decoding = "async";
    img.src = MASCOTS[key].src;
  } catch {
    /* a cold next beat, and nothing worth reporting */
  }
}
