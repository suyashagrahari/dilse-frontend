"use client";

// ─── The venue: an ivory card, gold and nothing else ────────────────────────
// No painted art: an arched ivory card in a fine double gold rim, a drawn
// gold-line pavilion ornament on its crown, the venue's name in gold-foil
// script between two gold rules, its address, "Directions" and, on tap, the map itself (no third-party frame until the
// guest asks for it), then the "getting there" note under a gold rule.

import { useState } from "react";
import { Reveal, mapLink, type WeddingEvent } from "../../../_wedding";
import { Icon, PIN } from "./FloralEvents";

export default function Venue({ event, directions, gettingThere, gettingThereLabel, mapLabel }: { event: WeddingEvent; directions: string; gettingThere: string; gettingThereLabel: string; mapLabel: string }) {
  const [embed, setEmbed] = useState(false);
  const map = mapLink(event);
  const q = [event.venue, event.address].filter(Boolean).join(", ");
  return (
    <div className="fw-venue">
      <Reveal effect="zoom" className="fw-venue-card">
        <span className="fw-venue-crest" aria-hidden>
          <svg viewBox="0 0 64 64" focusable="false">
            <path d="M32 6v5M24 22c0-6 3.6-10 8-10s8 4 8 10M20 22h24M22 22v24M42 22v24M28.7 22v24M35.3 22v24M18 46h28M16 50h32" />
          </svg>
        </span>
        <span className="fw-venue-rule" aria-hidden />
        <h3 className="fw-venue-name">{event.venue}</h3>
        <span className="fw-venue-rule" aria-hidden />
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
