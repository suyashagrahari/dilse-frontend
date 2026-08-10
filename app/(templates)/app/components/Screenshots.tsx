// ─── Screenshots — the horizontal shot rail ──────────────────────────────────
//
// A full-bleed snap scroller of phone-shaped cards with a caption under each.
//
// ── WHY THE RAIL IS FULL-BLEED AND THE CARDS CARRY THE GUTTER ────────────────
//
// The scroller itself runs edge to edge and pads its own first child by 16px,
// so the second card is always clipped by the right edge of the screen. That
// sliver is the entire affordance: it is what tells a thumb there is more to
// the right. A rail inset by the page gutter on BOTH sides ends flush with the
// last card and reads as a static row of images, which is why there are no dot
// indicators here — real listings do not have them, and adding them is an
// admission that the sliver was cropped away.
//
// `scroll-padding-left` has to match that 16px inset or every snap lands the
// card hard against the viewport edge, one gutter to the left of where it sat
// at rest. The two numbers are the same number and move together.
//
// ── ONE SHOT AND TEN SHOTS ARE THE SAME COMPONENT ────────────────────────────
//
// Nothing here is conditional on count. A single shot simply does not overflow,
// so the rail stops scrolling on its own; ten overflow and snap. The trailing
// spacer is a real element rather than a container `padding-right`, because
// several browsers drop the right padding of an overflowing flex row and the
// last caption would sit flush against the edge.
//
// ── A SHOT THAT FAILS TO LOAD ────────────────────────────────────────────────
//
// It becomes a filled card carrying its own caption, at the exact same size as
// its neighbours. The rhythm of the rail never breaks, and the reader never
// sees a torn-image glyph — a listing that shows one is a listing nobody trusts.

"use client";

import * as React from "react";
import { AP, AP_GUTTER } from "./theme";
import type { AppScreenshot } from "./types";

/** Card geometry. The height is derived — never type a second number here. */
const SHOT_W = 240;
const SHOT_RATIO = 19.5 / 9;
const SHOT_H = Math.round(SHOT_W * SHOT_RATIO);
const SHOT_RADIUS = 20;
const SHOT_GAP = 12;

/**
 * The fallback face of a card whose image did not load.
 *
 * It is the caption again, centred in a card-grey fill. Repeating the caption
 * is deliberate: the line underneath is small and secondary, and on a failed
 * card it is the only thing left that says what the reader is missing.
 */
function ShotFallback({ caption }: { caption: string }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 18px",
        background: AP.card,
        color: AP.inkSoft,
        fontSize: 14,
        lineHeight: "19px",
        textAlign: "center",
      }}
    >
      {caption}
    </div>
  );
}

function Shot({ shot, first }: { shot: AppScreenshot; first: boolean }) {
  const [failed, setFailed] = React.useState(false);

  return (
    <figure
      style={{
        flex: "none",
        margin: 0,
        width: SHOT_W,
        scrollSnapAlign: "start",
        marginLeft: first ? AP_GUTTER : 0,
      }}
    >
      <div
        style={{
          width: SHOT_W,
          height: SHOT_H,
          borderRadius: SHOT_RADIUS,
          border: `1px solid ${AP.edge}`,
          background: AP.card,
          overflow: "hidden",
        }}
      >
        {failed || !shot.imageUrl ? (
          <ShotFallback caption={shot.caption} />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={shot.imageUrl}
            alt={shot.caption}
            loading="lazy"
            decoding="async"
            draggable={false}
            onError={() => setFailed(true)}
            style={{
              display: "block",
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}
      </div>
      <figcaption
        style={{
          marginTop: 8,
          fontSize: 13,
          lineHeight: "17px",
          color: AP.inkSoft,
        }}
      >
        {shot.caption}
      </figcaption>
    </figure>
  );
}

export function Screenshots({ shots }: { shots: AppScreenshot[] }) {
  if (!shots || shots.length === 0) return null;

  return (
    <section
      aria-label="Preview"
      className="[&::-webkit-scrollbar]:hidden"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: SHOT_GAP,
        overflowX: "auto",
        overflowY: "hidden",
        scrollbarWidth: "none",
        WebkitOverflowScrolling: "touch",
        scrollSnapType: "x mandatory",
        scrollPaddingLeft: AP_GUTTER,
        fontFamily: AP.font,
      }}
    >
      {shots.map((shot, i) => (
        <Shot key={`${shot.imageUrl}-${i}`} shot={shot} first={i === 0} />
      ))}
      {/* Trailing gutter. See the note at the top: a container `padding-right`
          is dropped by several browsers inside an overflowing flex row. */}
      <span aria-hidden="true" style={{ flex: "none", width: AP_GUTTER }} />
    </section>
  );
}

export default Screenshots;
