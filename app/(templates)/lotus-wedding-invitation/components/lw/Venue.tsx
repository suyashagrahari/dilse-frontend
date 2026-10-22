"use client";

// ─── The venue: the temple gopuram over a lotus pond, beside the map card ────
// The owner's painted gopuram (with its rain of water drops) rises out of pink
// lotuses and banana leaves; the leaves sway, the drops shimmer. Beside it (or
// under it on phones) the kit's VenueCard with a tap-to-load map, plus the
// "Getting there" note. Transform/opacity only, paused off screen.

import { useEffect, useRef, useState } from "react";
import { Reveal, VenueCard, type WeddingEvent } from "../../../_wedding";
import { img } from "./art";

export default function Venue({ event, eyebrow, directions, note }: { event: WeddingEvent; eyebrow: string; directions: string; note?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([en]) => setOn(en.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`lw-venue${on ? " is-on" : ""}`}>
      <Reveal effect="rise" className="lw-venue-art">
        <span className="lw-venue-glow" aria-hidden />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img {...img("gopuram", { lazy: true })} alt="A South Indian temple gopuram" className="lw-venue-gopuram" />
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img("banana", { lazy: true })} className="lw-venue-banana lw-venue-banana-l" aria-hidden />
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img("banana", { lazy: true })} className="lw-venue-banana lw-venue-banana-r" aria-hidden />
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img("lotusCluster", { lazy: true })} className="lw-venue-lotus" aria-hidden />
      </Reveal>
      <Reveal className="lw-venue-card" delay={140}>
        <VenueCard name={event.venue} address={event.address} mapUrl={event.mapUrl} eyebrow={eyebrow} note={note} embed ornament={null} labels={{ directions }} />
      </Reveal>
    </div>
  );
}
