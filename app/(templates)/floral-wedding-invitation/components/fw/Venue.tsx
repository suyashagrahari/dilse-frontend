"use client";

// ─── The venue: the blush gazebo on an ivory card ───────────────────────────
// Royal-style and quiet: the blush gazebo stands on the top edge of an ivory
// card framed in a fine double gold line, a bunch of pink peonies tucked into
// each bottom corner. Inside: the venue's name in script, its address,
// "Directions" and, on tap, the map itself (no third-party frame until the
// guest asks for it), then the "getting there" note under a gold rule.

import { useState } from "react";
import { Reveal, mapLink, type WeddingEvent } from "../../../_wedding";
import { pic } from "./art";
import { Icon, PIN } from "./FloralEvents";

export default function Venue({ event, directions, gettingThere, gettingThereLabel, mapLabel }: { event: WeddingEvent; directions: string; gettingThere: string; gettingThereLabel: string; mapLabel: string }) {
  const [embed, setEmbed] = useState(false);
  const map = mapLink(event);
  const q = [event.venue, event.address].filter(Boolean).join(", ");
  return (
    <div className="fw-venue">
      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
      <img className="fw-venue-gazebo" {...pic("gazebo", { lazy: true })} aria-hidden />
      <Reveal effect="zoom" className="fw-venue-card">
        <span className="fw-venue-corner is-l" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...pic("peonyCorner", { lazy: true })} />
        </span>
        <span className="fw-venue-corner is-r" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...pic("peonyCorner", { lazy: true })} />
        </span>
        <h3 className="fw-venue-name">{event.venue}</h3>
        {event.address && <p className="fw-venue-addr">{event.address}</p>}
        <div className="fw-venue-actions">
          {map && (
            <a className="wk-btn fw-btn" href={map} target="_blank" rel="noopener noreferrer">
              <Icon d={PIN} /> {directions}
            </a>
          )}
          {q && !embed && (
            <button type="button" className="wk-btn wk-btn-ghost fw-btn" onClick={() => setEmbed(true)}>
              {mapLabel}
            </button>
          )}
        </div>
        {embed && q && (
          <div className="fw-venue-map">
            <iframe title={event.venue || "Map"} src={`https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
        )}
        {gettingThere && (
          <div className="fw-venue-go">
            <p className="fw-venue-go-h">{gettingThereLabel}</p>
            <p className="fw-venue-go-t">{gettingThere}</p>
          </div>
        )}
      </Reveal>
    </div>
  );
}
