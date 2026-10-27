"use client";

// ─── The venue: the pavilion on an ivory card ───────────────────────────────
// Royal-style and quiet: the flowering pavilion on its garden base
// stands on the top edge of an ivory card framed in a fine double gold line,
// a bunch of pink peonies tucked into each bottom corner. Inside: the venue in
// gold foil, its address, Directions and a tap-to-load map (no Google request
// until the guest asks), then "Getting there" under a gold rule.

import { useState } from "react";
import { Reveal, mapLink, type WeddingEvent } from "../../../_wedding";
import { GW, gwImg } from "../assets";
import { ICON, Icon } from "./ShareBar";

export interface VenueProps {
  event: WeddingEvent;
  lang: "en" | "hi";
  gettingThere: string;
  labels: { directions: string; map: string; gettingThere: string };
}

export default function Venue({ event, lang, gettingThere, labels: l }: VenueProps) {
  const [map, setMap] = useState(false);
  const link = mapLink(event);
  const q = [event.venue, event.address].filter(Boolean).join(", ");
  return (
    <div className="gw-venue">
      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
      <img className="gw-venue-dome" {...gwImg(GW.pavilion, { lazy: true })} aria-hidden />
      <Reveal effect="zoom" className="gw-venue-card">
        <span className="gw-venue-corner gw-venue-corner-l" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...gwImg(GW.peonyCorner, { lazy: true })} />
        </span>
        <span className="gw-venue-corner gw-venue-corner-r" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...gwImg(GW.peonyCorner, { lazy: true })} />
        </span>
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
        {gettingThere && (
          <div className="gw-venue-travel">
            <p className="gw-know-h" lang={lang}>
              {l.gettingThere}
            </p>
            <p className="gw-know-t">{gettingThere}</p>
          </div>
        )}
      </Reveal>
    </div>
  );
}
