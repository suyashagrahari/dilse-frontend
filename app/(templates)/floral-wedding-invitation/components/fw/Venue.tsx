"use client";

// ─── The venue: a garden folly in watercolour ───────────────────────────────
// A blush gazebo and a stone fountain on a watercolour wash, a gold-leaf
// branch and a green branch reaching in from the edges (they drift a few px
// on scroll), then the venue's name, address, "Directions" and, on tap, the
// map itself (no third-party frame until the guest asks for it), plus the
// "getting there" note.

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
      <Reveal effect="zoom" className="fw-venue-art">
        <span className="fw-venue-wash" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...pic("cloudWash", { lazy: true })} />
        </span>
        <span className="fw-venue-leaf is-gold" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...pic("goldLeaf", { lazy: true })} />
        </span>
        <span className="fw-venue-gazebo" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...pic("gazebo", { lazy: true })} />
        </span>
        <span className="fw-venue-fountain" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...pic("fountain", { lazy: true })} />
        </span>
        <span className="fw-venue-leaf is-green" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...pic("greenBranch", { lazy: true })} />
        </span>
      </Reveal>
      <Reveal className="fw-venue-text" delay={140}>
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
