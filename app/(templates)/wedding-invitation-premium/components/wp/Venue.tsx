"use client";

// ─── The venue: the stone fountain on the terrace, beside the map card ───────
// The owner's watercolour fountain with banana leaves and lotuses either side;
// the water sparkles (transform/opacity, paused off screen). Beside it (under
// it on phones) the kit's VenueCard with a tap-to-load map and the "Getting
// there" note.

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
    <div ref={ref} className={`wp-venue${on ? " is-on" : ""}`}>
      <Reveal effect="rise" className="wp-venue-art">
        <span className="wp-venue-glow" aria-hidden />
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img("banana", { lazy: true })} className="wp-venue-banana wp-venue-banana-l" aria-hidden />
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img("banana", { lazy: true })} className="wp-venue-banana wp-venue-banana-r" aria-hidden />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img {...img("fountain", { lazy: true })} alt="A stone fountain on the terrace" className="wp-venue-fountain" />
        <span className="wp-venue-sparks" aria-hidden>
          <i />
          <i />
          <i />
          <i />
          <i />
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img("lotus", { lazy: true })} className="wp-venue-lotus" aria-hidden />
      </Reveal>
      <Reveal className="wp-venue-card" delay={140}>
        <VenueCard name={event.venue} address={event.address} mapUrl={event.mapUrl} eyebrow={eyebrow} note={note} embed ornament={null} labels={{ directions }} />
      </Reveal>
    </div>
  );
}
