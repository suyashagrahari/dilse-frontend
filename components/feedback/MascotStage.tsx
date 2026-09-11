"use client";

// ─── The stage the mascot stands on ──────────────────────────────────────────
//
// The slot every beat of the feedback flow renders into — the reacting SVG face
// at the ask, an animated penguin at each escalation, the shiba on the way out.
//
// ── WHY THERE IS NO PLATE ANY MORE ──────────────────────────────────────────
//
// The first build sat each character on a rounded, ringed, shadowed near-white
// plate, for a reason that turned out not to survive contact with the actual
// colours: the artwork is drawn for a white chat background, so the worry was
// that its pale halves would dissolve into the card. The card is `#fffdfb`.
// That is white to within a rounding error, and the plate was `#fffefc` — the
// two were never distinguishable. All the plate actually contributed was an
// edge, and an edge around a sticker reads as a sticker in a box.
//
// So the art now sits directly on the card, transparency and all, which is what
// the source files were cut for. What the plate did do usefully is kept:
//
//   · A FIXED, KNOWN BOX. Swapping a 200px GIF for a 498px one must not resize
//     the card and shunt the Send button out from under a travelling thumb. The
//     box below is a constant; only the picture inside it changes.
//   · A PER-BEAT COLOUR. Copy is the slowest thing on screen to read, so a
//     colour behind the character says which beat this is before a word is
//     processed: gold while we ask politely, rose while the penguin begs, a
//     cool grey-blue for the sulk, green for thank you. It is now a soft halo
//     that fades to nothing well inside its own box — light, not a container.
//
// ── WHY NOTHING HERE CAN CROP ───────────────────────────────────────────────
//
// Every source is a square canvas with its caption set hard against the TOP
// edge — "PLEASE PLEASE", "THANK YOU", "See You Next Time!" — which makes this
// art unusually easy to damage. The plate cost us that once already: a circular
// mask rendered the second penguin as "EASE PLEAS" with its flippers sliced off.
//
// Three things now make a crop impossible rather than unlikely, and all three
// must stay: `object-fit: contain` (never `cover`), no `overflow: hidden`
// anywhere on this subtree, and no padding or border-radius on the <img>. A
// square box holding square art means contain fits it exactly, edge to edge,
// with nothing trimmed and no letterboxing either.

import type { CSSProperties, ReactNode } from "react";

export interface MascotStageProps {
  /** The halo behind the art. A brand hex; alpha is applied here. */
  tone: string;
  /** The artwork — an <img> for a mascot, or the reacting SVG face. */
  children: ReactNode;
  /**
   * Replays the entrance when it changes. React keeps the DOM node across a
   * stage change because it is the same element in the same slot, so without a
   * key the CSS animation never re-runs and each new mascot fades in with no
   * arrival at all. It also restarts the GIF, so every beat plays from frame
   * one rather than joining a loop already in progress.
   */
  beat: string;
}

export default function MascotStage({ tone, children, beat }: MascotStageProps) {
  // ── SIZE IS A CLASS, NOT AN INLINE STYLE ────────────────────────────────
  //
  // Bigger on a phone, where this is a full-screen beat with room to spare and
  // the artwork is carrying the moment; smaller from 640px, where it sits in a
  // 420px card and would otherwise crowd the copy underneath; smaller again on
  // a short landscape window, where the tallest thing on screen decides whether
  // anything scrolls. All three live in the stylesheet because an inline width
  // cannot be overridden by a media query — the same trap that once made the
  // card fill every desktop viewport.
  //
  // Only the tone crosses as an inline value, as a custom property, because it
  // is a value rather than a layout decision and the halo is painted in a
  // pseudo-element that cannot be reached from here any other way.
  const style: CSSProperties = {
    position: "relative",
    margin: "0 auto",
    display: "grid",
    placeItems: "center",
    // Load-bearing: the halo below is drawn outside the box it belongs to.
    overflow: "visible",
    // Two pre-mixed stops rather than `color-mix()` in the stylesheet: every
    // tone here is a 6-digit brand hex, so 8-digit alpha does the same job with
    // no support question to answer.
    ["--ssfbGlow1" as string]: `${tone}42`,
    ["--ssfbGlow2" as string]: `${tone}1a`,
    ["--ssfbGlow0" as string]: `${tone}00`,
  };

  return (
    <div className="ssfbStage" style={style} key={beat}>
      {children}
      <style>{`
        /* ── THE SIZE IS A CLAMP, NOT A LADDER OF BREAKPOINTS ───────────────
           Three terms, each answering a different failure:

           · 236px / 188px — what the art should be when there is room. Bigger
             on a phone, where this is a full-screen beat carrying the moment;
             smaller in the 420px desktop card, where it would crowd the copy.
           · 60vw — the halo below is drawn 12% OUTSIDE this box, and the card
             above is "overflow-y: auto", which computes the x-axis to "auto"
             too. Anything wider than the card's content box is a horizontal
             scrollbar on the one screen that must never have one. At a flat
             236 the halo is 293px wide and a 320px phone has 276px of content
             box. The vw term keeps it inside at every width and costs nothing
             from 390 up, where "min()" picks 236 anyway.
           · 30vh / 32vh — a short window (landscape phone, half-height desktop
             browser) is where the tallest thing on screen decides whether the
             Send button needs scrolling to. A vh term gives ground smoothly
             instead of falling off a "max-height" cliff, and it is the term
             that wins exactly when it should. */
        .ssfbStage {
          width: min(236px, 60vw, 30vh);
          aspect-ratio: 1;
          animation: ssfbPop 420ms cubic-bezier(0.22, 1.4, 0.36, 1) both;
        }
        @media (min-width: 640px) {
          .ssfbStage { width: min(188px, 32vh) }
        }

        /* ── The halo ──────────────────────────────────────────────────────
           Behind the art, fading to fully transparent before it reaches the
           edge of its own box, so it never resolves into a shape. It sits
           outside the box's own bounds, which is why the parent must not clip.

           Stacked with z-index 0 against the art's 1, NOT with a negative
           z-index: ".ssfbStage" only establishes a stacking context while its
           entrance animation holds a transform, so under "prefers-reduced-
           motion" a -1 would escape the element and paint behind the card's own
           background — the halo would simply vanish for exactly the people
           least likely to report it. */
        .ssfbStage::before {
          content: "";
          position: absolute;
          inset: -12%;
          z-index: 0;
          border-radius: 50%;
          background: radial-gradient(
            closest-side,
            var(--ssfbGlow1) 0%,
            var(--ssfbGlow2) 46%,
            var(--ssfbGlow0) 76%
          );
          /* A gradient stop is still a boundary the eye can find on a wide
             gamut screen; the blur guarantees there is nothing to find. */
          filter: blur(10px);
          pointer-events: none;
        }

        /* Everything real sits above the halo. ":not(style)" because the tag
           holding these very rules is a child too. */
        .ssfbStage > *:not(style) {
          position: relative;
          z-index: 1;
        }

        /* The artwork, at its own aspect ratio, filling the box exactly. No
           padding, no radius, no mask — see the crop note at the top of this
           file before adding any of the three back. */
        .ssfbStage > img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
          /* NO drop-shadow, deliberately. A silhouette shadow grounds a
             character nicely right up until the character runs off the edge of
             its own canvas — which "please-please" does: the penguin's belly is
             cropped flat by the bottom of the source sticker. A shadow along
             that straight edge draws a line under it and makes a faithful,
             uncropped render look like something we had cut off. The whole
             point of removing the plate was that the art should read as itself. */
        }
        /* ── The reacting face ─────────────────────────────────────────────
           "RatingFace" renders a <div> wrapper — not a bare <svg>, which is
           what the rule here used to target, so it had quietly never matched
           anything — and that wrapper carries its size INLINE, from a prop.

           "!important" is doing real work rather than papering over specificity:
           an inline width is unreachable from a stylesheet by any other means,
           and the whole point is that this must track the clamp above rather
           than sit at one fixed number. With it, the face follows the slot at
           every width and height for free; the "size" prop then only decides
           how finely the SVG is rasterised.

           74% because the face wants a little less of the slot than a sticker
           does: it is drawn on a generous canvas with its own margin, where the
           stickers are cropped tight to their own artwork. */
        .ssfbStage > div {
          width: 74% !important;
          height: 74% !important;
        }
        .ssfbStage > div > svg {
          width: 100%;
          height: 100%;
        }

        @keyframes ssfbPop {
          0%   { opacity: 0; transform: scale(0.82) translateY(6px) }
          60%  { opacity: 1; transform: scale(1.04) translateY(0) }
          100% { opacity: 1; transform: scale(1) translateY(0) }
        }
        /* An arrival that overshoots is the joke landing. Under reduced motion
           it is simply there, which is correct rather than degraded. */
        @media (prefers-reduced-motion: reduce) {
          .ssfbStage { animation: none }
        }
      `}</style>
    </div>
  );
}
