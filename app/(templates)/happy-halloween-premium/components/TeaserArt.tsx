"use client";

// The sealed invitation on the unlock teaser (before 31 Oct 00:00 — the day's
// main marketing beat). Only names reach the teaser, so the night's title is
// the default one. Loaded lazily by the viewer (getTeaserArt).

import type { TeaserArtProps } from "../../_valentine/types";
import { Invitation } from "./manor/art";

export default function HalloweenTeaserArt({ recipientName }: TeaserArtProps) {
  return (
    <div style={{ width: "min(300px, 78vw)", aspectRatio: "320 / 230" }}>
      <Invitation name={recipientName || "you"} title="“The Haunting of Us”" />
    </div>
  );
}
