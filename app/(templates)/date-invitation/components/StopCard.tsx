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

import { fmtMins, fmtTime, ACCENT, GRAD, GROTESK, INK, INK_SOFT, ITALIC, PAPER } from "./dateTheme";
import { CandyButton } from "./NightKit";
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
      style={{
        background: PAPER,
        color: INK,
        borderRadius: 26,
        padding: "18px 18px 20px",
        boxShadow: "0 34px 70px -30px rgba(0,0,0,.8), 0 0 0 1px rgba(255,79,139,.25)",
      }}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <span
          className="rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-white"
          style={{ background: GRAD, fontFamily: GROTESK }}
        >
          {total > 1 ? `stop ${position} of ${total}` : "the stop"} 🔓
        </span>
        {stop.durationMins > 0 && (
          <span className="text-[13px] font-semibold" style={{ color: INK_SOFT, fontFamily: GROTESK }}>
            ⏳ {fmtMins(stop.durationMins)} here
          </span>
        )}
      </div>

      {arriveLabel && (
        <p className="mb-3 flex items-baseline gap-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: INK_SOFT, fontFamily: GROTESK }}>
            arrive by
          </span>
          <span className="text-[26px] font-extrabold leading-none tracking-[-0.03em]" style={{ color: ACCENT, fontFamily: GROTESK }}>
            {arriveLabel}
          </span>
        </p>
      )}

      {/* name → stylised map → address → Directions. No coords: PlaceBlock
          falls back to the address as plain text. */}
      <PlaceBlock point={point} seed={stop.id} height={160} />

      {stop.dressNote && (
        <p
          className="mt-3 rounded-2xl px-3 py-2 text-[14px] leading-[1.5]"
          style={{ color: INK_SOFT, fontFamily: GROTESK, background: "#fff4e6", overflowWrap: "anywhere" }}
        >
          👗 {stop.dressNote}
        </p>
      )}

      {/* THE EMOTIONAL PAYLOAD. Largest, warmest type on the screen. */}
      {stop.why && (
        <figure
          className="relative mt-5 rounded-[22px] px-5 pb-5 pt-6"
          style={{ background: "linear-gradient(150deg, #ffe8f0 0%, #fff1e4 100%)" }}
        >
          <span
            aria-hidden
            className="absolute -top-3 left-4 rounded-full px-2.5 py-0.5 text-[10.5px] font-extrabold uppercase tracking-[0.18em] text-white"
            style={{ background: INK, fontFamily: GROTESK }}
          >
            why here 💭
          </span>
          <p
            className="text-[21px] leading-[1.45]"
            style={{ color: INK, fontFamily: ITALIC, fontStyle: "italic", overflowWrap: "anywhere" }}
          >
            {stop.why}
          </p>
        </figure>
      )}

      <div className="mt-5">
        <CandyButton onClick={onAdvance}>
          we&rsquo;re here <span aria-hidden>📍</span>
        </CandyButton>
      </div>
    </article>
  );
}
