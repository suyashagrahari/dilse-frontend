"use client";

// The locked-page teaser (before e.g. 31 Oct 00:00): the haunted mailbox with
// its flag down and a little ghost peeking over it, waiting. Only names reach
// the teaser. Self-contained SVG (no scene CSS, no extras); loaded lazily by
// the viewer (getTeaserArt).

import type { TeaserArtProps } from "../../_valentine/types";
import { Ghost, Mailbox } from "./boo/art";

export default function HalloweenTeaserArt({ recipientName }: TeaserArtProps) {
  return (
    <div
      role="img"
      aria-label={`A haunted mailbox with a little ghost, waiting for ${recipientName || "you"}`}
      style={{ position: "relative", width: "min(280px, 74vw)", aspectRatio: "1", display: "grid", placeItems: "end center" }}
    >
      <span aria-hidden style={{ position: "absolute", inset: "4%", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,210,122,.38), rgba(201,182,255,.16) 46%, transparent 70%)" }} />
      <span style={{ position: "absolute", top: "2%", left: "50%", marginLeft: -48, transform: "rotate(-6deg)" }}>
        <Ghost size={96} mood="wink" hold="heart" />
      </span>
      <Mailbox open={false} size={190} style={{ position: "relative" }} />
    </div>
  );
}
