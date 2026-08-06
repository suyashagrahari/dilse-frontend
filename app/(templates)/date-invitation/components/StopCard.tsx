"use client";

// ─── The current stop, expanded ──────────────────────────────────────────────
//
// AGENT 3. Rendered by `LiveItinerary` for the one entry whose state is
// "current". It takes a `CurrentStopView` — never a `Stop`, never `data.stops`
// — so there is no path from this file to a locked stop's contents.
//
// They are outdoors, on a phone, in sunlight, one-handed, possibly holding a
// drink. Everything here is sized to be read at arm's length: the type is large,
// the ink is the full-contrast INK, and the one action is 56px tall.
//
// `why` is the emotional payload — the reason the sender picked this place. It
// gets the largest, warmest type on the screen, real space above and below, and
// no box, no truncation and no "read more".

import React from "react";

import { fmtMins, fmtTime, ACCENT, ACCENT_EDGE, ACCENT_WASH, INK, INK_SOFT, MONO, PAPER, SERIF, UI } from "./dateTheme";
import type { CurrentStopView, GeoPoint } from "./types";
import { PlaceBlock } from "./StaticMap";

export interface StopCardProps {
  stop: CurrentStopView;
  /** 1-based position in the itinerary, for the "STOP 2 OF 4" eyebrow. */
  position: number;
  total: number;
  /** The `[ we're here ]` tap. Stamps the arrival and unlocks exactly one more. */
  onAdvance: () => void;
  reduceMotion: boolean;
}

export default function StopCard({ stop, position, total, onAdvance }: StopCardProps) {
  // Constructed, not cast. A CurrentStopView carries these four fields by
  // definition; a LockedStopView could never be passed in here.
  const point: GeoPoint = {
    name: stop.name,
    address: stop.address,
    lat: stop.lat,
    lng: stop.lng,
  };

  const arriveLabel = fmtTime(stop.arriveAt);

  return (
    <article
      className="rounded-[4px] px-4 py-4"
      style={{
        background: ACCENT_WASH,
        border: `1.5px solid ${ACCENT_EDGE}`,
        boxShadow: "0 10px 30px -18px rgba(58,44,32,0.4)",
      }}
    >
      {/* Arrive-by. Monospace, because it is a time — and nothing else here is. */}
      {(arriveLabel || stop.durationMins > 0) && (
        <p className="mb-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          {arriveLabel && (
            <>
              <span
                className="text-[11px] uppercase tracking-[0.22em]"
                style={{ color: INK_SOFT, fontFamily: UI }}
              >
                arrive by
              </span>
              <span
                className="text-[20px] font-bold leading-none"
                style={{ color: INK, fontFamily: MONO }}
              >
                {arriveLabel}
              </span>
            </>
          )}
          {stop.durationMins > 0 && (
            <span className="text-[14px]" style={{ color: INK_SOFT, fontFamily: SERIF }}>
              {arriveLabel ? "· " : ""}
              {fmtMins(stop.durationMins)} here
            </span>
          )}
        </p>
      )}

      {/* name → stylised map → address → [ DIRECTIONS ]. No coords, no map, no
          button: PlaceBlock falls back to the address as plain text. */}
      <PlaceBlock
        point={point}
        seed={stop.id}
        height={150}
        eyebrow={total > 1 ? `STOP ${position} OF ${total}` : "STOP"}
      />

      {stop.dressNote && (
        <p
          className="mt-3 text-[14.5px] leading-[1.6]"
          style={{ color: INK_SOFT, fontFamily: SERIF, overflowWrap: "anywhere" }}
        >
          {stop.dressNote}
        </p>
      )}

      {/* THE EMOTIONAL PAYLOAD. Largest, warmest type on the screen. Hairlines
          above and below rather than a box — a box makes it look like an aside. */}
      {stop.why && (
        <div
          className="mt-5 border-t border-b py-5"
          style={{ borderColor: ACCENT_EDGE }}
        >
          <p
            className="text-[19px] leading-[1.75]"
            style={{ color: INK, fontFamily: SERIF, overflowWrap: "anywhere" }}
          >
            {stop.why}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={onAdvance}
        className="mt-5 w-full rounded-[4px] px-5 text-[14px] font-semibold uppercase tracking-[0.24em] transition-transform active:scale-[0.985]"
        style={{
          minHeight: 56,
          color: PAPER,
          background: ACCENT,
          border: `1.5px solid ${ACCENT}`,
          fontFamily: UI,
        }}
      >
        we&rsquo;re here
      </button>
    </article>
  );
}
