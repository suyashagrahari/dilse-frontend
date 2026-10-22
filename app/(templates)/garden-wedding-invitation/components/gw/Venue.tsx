"use client";

// ─── The venue: a lake garden seen over a white balustrade ───────────────────
// The watercolour lake (mountains, lotus, a pink dome and a peacock) in a wide
// arch, a white balustrade along its foot, sunlight glints on the water
// (opacity loops, only while on screen), then the venue, its address,
// Directions and a tap-to-load map (no Google request until the guest asks),
// and "Getting there" beside it on wide screens.

import { useRef, useState } from "react";
import { Reveal, mapLink, type WeddingEvent } from "../../../_wedding";
import { GW, gwImg } from "../assets";
import { useOnScreen } from "./art";
import { ICON, Icon } from "./ShareBar";

export interface VenueProps {
  event: WeddingEvent;
  lang: "en" | "hi";
  gettingThere: string;
  labels: { directions: string; map: string; gettingThere: string };
}

export default function Venue({ event, lang, gettingThere, labels: l }: VenueProps) {
  const ref = useRef<HTMLDivElement>(null);
  const on = useOnScreen(ref);
  const [map, setMap] = useState(false);
  const link = mapLink(event);
  const q = [event.venue, event.address].filter(Boolean).join(", ");
  return (
    <div ref={ref} className={`gw-venue${on ? " is-on" : ""}`}>
      <Reveal effect="zoom" className="gw-venue-arch">
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img className="gw-venue-img" {...gwImg(GW.lake, { lazy: true })} />
        <span className="gw-glints" aria-hidden>
          <i />
          <i />
          <i />
          <i />
          <i />
        </span>
        <span className="gw-balustrade" aria-hidden />
      </Reveal>
      <div className="gw-venue-cols">
        <Reveal className="gw-venue-text" delay={100}>
          <h3 className="gw-venue-name wk-foil-text">{event.venue}</h3>
          {event.address && <p className="gw-venue-addr">{event.address}</p>}
          <div className="gw-venue-btns">
            {link && (
              <a className="wk-btn" href={link} target="_blank" rel="noopener noreferrer" lang={lang}>
                <Icon d={ICON.pin} /> {l.directions}
              </a>
            )}
            {q && !map && (
              <button type="button" className="wk-btn wk-btn-ghost" onClick={() => setMap(true)} lang={lang}>
                {l.map}
              </button>
            )}
          </div>
          {map && q && (
            <div className="gw-venue-map">
              <iframe title={q} src={`https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            </div>
          )}
        </Reveal>
        {gettingThere && (
          <Reveal className="gw-venue-travel wk-card" delay={180}>
            <p className="gw-know-h" lang={lang}>
              {l.gettingThere}
            </p>
            <p className="gw-know-t">{gettingThere}</p>
          </Reveal>
        )}
      </div>
    </div>
  );
}
