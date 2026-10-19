"use client";
// ─── <VenueCard> — the main venue with an optional tap-to-load map ───────────
//
//   <VenueCard name="The Leela Palace" address="Udaipur, Rajasthan" mapUrl={…} embed />
//
// The embedded map is an iframe that only loads when the guest taps it (no
// third-party weight on first paint).

import { useState } from "react";
import { mapLink } from "../ics";
import { Ornament, type OrnamentId } from "../ornaments";
import { Reveal } from "../WeddingRoot";

export interface VenueCardProps {
  name: string;
  address?: string;
  mapUrl?: string;
  /** A line above the name ("The wedding ceremony"). */
  eyebrow?: string;
  /** Free text under the address ("Valet parking at Gate 2"). */
  note?: string;
  /** Show a tap-to-load embedded map. Default false. */
  embed?: boolean;
  /** Small foil ornament above the eyebrow. Default "kalash"; null = none. */
  ornament?: OrnamentId | null;
  labels?: Partial<{ directions: string; showMap: string }>;
}

export default function VenueCard({ name, address, mapUrl, eyebrow = "Venue", note, embed = false, ornament = "kalash", labels }: VenueCardProps) {
  const [showMap, setShowMap] = useState(false);
  const link = mapLink({ mapUrl, venue: name, address });
  const q = [name, address].filter(Boolean).join(", ");
  if (!name && !address) return null;
  return (
    <Reveal className="wk-card wk-foil-border wk-venue">
      {ornament && <Ornament id={ornament} width={56} className="wk-venue-orn" shimmer />}
      <p className="wk-eyebrow">{eyebrow}</p>
      <h3 className="wk-venue-name">{name}</h3>
      {address && <p className="wk-venue-addr">{address}</p>}
      {note && <p className="wk-venue-note">{note}</p>}
      {embed && q && (
        <div className="wk-venue-map">
          {showMap ? (
            <iframe
              title={`Map of ${name}`}
              src={`https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <button type="button" className="wk-venue-mapBtn" onClick={() => setShowMap(true)}>
              {labels?.showMap ?? "Show map"}
            </button>
          )}
        </div>
      )}
      {link && (
        <a className="wk-btn" href={link} target="_blank" rel="noopener noreferrer">
          {labels?.directions ?? "Get directions"}
        </a>
      )}
    </Reveal>
  );
}
