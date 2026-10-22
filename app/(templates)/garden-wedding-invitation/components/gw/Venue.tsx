"use client";

// ─── The palace venue (spec 6.3 scene 7) ─────────────────────────────────────
// A palace painting in a cusped gold arch (lake palace at dusk on dark themes,
// the watercolour Taj on light ones), lamp twinkles over its windows (≤ 12 SVG
// circles, opacity loops only, paused off screen), then the venue and a map.

import { useEffect, useMemo, useRef, useState } from "react";
import { Reveal, mapLink, type WeddingEvent } from "../../../_wedding";
import { artImg, seeded, type GardenArt } from "./art";

export default function Venue({ event, look, directions }: { event: WeddingEvent; look: GardenArt; directions: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([en]) => setOn(en.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const dots = useMemo(() => {
    const r = seeded(41);
    // Lamps in the band of windows across the middle of the lake palace.
    return Array.from({ length: 12 }, () => ({ x: 8 + r() * 84, y: 38 + r() * 14, r: 0.35 + r() * 0.45, d: 1.5 + r() * 1.5, delay: -r() * 3 }));
  }, []);
  const map = mapLink(event);
  return (
    <div ref={ref} className={`gw-venue${on ? " is-on" : ""}`}>
      <Reveal effect="zoom" className="gw-venue-arch">
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img className="gw-venue-img" {...artImg(look.venue, { lazy: true })} />
        <svg className="gw-venue-tw" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          {dots.map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r={d.r} style={{ animationDuration: `${d.d}s`, animationDelay: `${d.delay}s` }} />
          ))}
        </svg>
        <span className="gw-venue-glow" aria-hidden />
      </Reveal>
      <Reveal className="gw-venue-text" delay={120}>
        <h3 className="gw-venue-name wk-foil-text">{event.venue}</h3>
        {event.address && <p className="gw-venue-addr">{event.address}</p>}
        {map && (
          <a className="wk-btn" href={map} target="_blank" rel="noopener noreferrer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
              <path d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21zM12 12.2a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2z" />
            </svg>
            {directions}
          </a>
        )}
      </Reveal>
    </div>
  );
}
