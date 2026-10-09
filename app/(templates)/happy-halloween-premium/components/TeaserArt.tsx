"use client";

// The locked-page teaser (before e.g. 31 Oct 00:00, the day's main marketing
// beat): the manor's jack-o'-lantern glowing behind a closed door. Only names
// reach the teaser. Self-contained (inline styles, no scene CSS); loaded
// lazily by the viewer (getTeaserArt).

import type { TeaserArtProps } from "../../_valentine/types";
import { Fluent3D } from "../../_valentine/kit/premium";

export default function HalloweenTeaserArt({ recipientName }: TeaserArtProps) {
  return (
    <div style={{ position: "relative", width: "min(280px, 74vw)", aspectRatio: "1", display: "grid", placeItems: "center" }}>
      <span
        aria-hidden
        style={{ position: "absolute", inset: "6%", borderRadius: "50%", background: "radial-gradient(circle, rgba(242,179,91,.42), rgba(224,120,47,.14) 42%, transparent 70%)" }}
      />
      <Fluent3D name="jack-o-lantern" size={168} glow="#E0782F" alt={`A jack-o'-lantern waiting for ${recipientName || "you"}`} />
    </div>
  );
}
