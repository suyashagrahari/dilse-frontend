"use client";

// ─── Phase 7 of 7 (`after`) — it becomes a memory ────────────────────────────
//
// AGENT 3. The timeline collapses: no cards, no maps, no `why` blocks. One line
// per stop with the real timestamp, joined into a single connected route, so the
// whole evening reads at a glance.
//
// `data` arrives whole here (the share card needs it) but this file never maps
// over `data.stops` — the route comes from `itinerary`, which came from
// `buildItinerary()`. Everything else is read off `data` by name.
//
// The 9:16 share card and its PNG download are AGENT 5's file. We render
// `<ShareCardPanel />` and nothing else.

import React from "react";

import {
  ACCENT,
  ACCENT_EDGE,
  DONE,
  INK,
  INK_FAINT,
  INK_SOFT,
  MONO,
  PAPER,
  PAPER_EDGE,
  SERIF,
  UI,
  fmtDateLong,
  fmtTime,
} from "./dateTheme";
import { CornerFlourishes } from "./Ornaments";
import PhotoStrip from "./PhotoStrip";
import { ShareCardPanel } from "./ShareCard";
import { totalTimeTogether, type DateInviteData, type StopView } from "./types";

export interface AfterScreenProps {
  data: DateInviteData;
  /** From `buildItinerary(data, "after")` — every entry is `passed`. */
  itinerary: StopView[];
  photos: string[];
  /** Local file input → data URLs. Previews only. // TODO(server): upload. */
  onAddPhotos: (dataUrls: string[]) => void;
  reduceMotion: boolean;
}

/** Node column width. Fixed, so a 90-character name cannot bend the route. */
const NODE_COL = 22;

export default function AfterScreen({
  data,
  itinerary,
  photos,
  onAddPhotos,
  reduceMotion,
}: AfterScreenProps) {
  const total = totalTimeTogether(data);
  const dateLabel = fmtDateLong(data.startsAt);
  const count = itinerary.length;

  return (
    <div className="mx-auto w-full max-w-[30rem] px-4 pb-16 pt-6">
      <header className="text-center">
        <p
          className="text-[10.5px] uppercase tracking-[0.3em]"
          style={{ color: INK_SOFT, fontFamily: UI }}
        >
          {data.recipientName} &amp; {data.senderName}
        </p>
        {dateLabel && (
          <p className="mt-2 text-[15px]" style={{ color: INK_SOFT, fontFamily: SERIF }}>
            {dateLabel}
          </p>
        )}
      </header>

      {/* ── Time together ─────────────────────────────────────────────────── */}
      <div
        className="relative mt-5 rounded-[4px] px-5 py-6 text-center"
        style={{
          background: PAPER,
          border: `1.5px solid ${ACCENT_EDGE}`,
          boxShadow: "0 12px 32px -22px rgba(58,44,32,0.42)",
        }}
      >
        <CornerFlourishes color={INK_FAINT} size={28} inset={8} />
        <p
          className="text-[10.5px] uppercase tracking-[0.3em]"
          style={{ color: INK_SOFT, fontFamily: UI }}
        >
          Time together
        </p>
        <p
          className="mt-2 text-[38px] font-bold leading-none"
          style={{ color: ACCENT, fontFamily: MONO }}
        >
          {total}
        </p>
        {count > 0 && (
          <p className="mt-3 text-[14px]" style={{ color: INK_SOFT, fontFamily: SERIF }}>
            {count} {count === 1 ? "stop" : "stops"}, all of them
          </p>
        )}
      </div>

      {/* ── The completed route ───────────────────────────────────────────── */}
      {count > 0 && (
        <section className="mt-8">
          <h2
            className="text-[10.5px] uppercase tracking-[0.3em]"
            style={{ color: INK_SOFT, fontFamily: UI }}
          >
            The route
          </h2>
          <ol className="mt-3 list-none p-0">
            {itinerary.map((stop, i) => (
              <RouteRow key={stop.id} stop={stop} last={i === count - 1} />
            ))}
          </ol>
        </section>
      )}

      {/* ── Photos ────────────────────────────────────────────────────────── */}
      <PhotoStrip photos={photos} onAddPhotos={onAddPhotos} reduceMotion={reduceMotion} />

      {/* ── The last word ─────────────────────────────────────────────────── */}
      {data.closingLine && (
        <figure
          className="mt-9 border-t border-b py-6 text-center"
          style={{ borderColor: PAPER_EDGE }}
        >
          <blockquote
            className="text-[19px] leading-[1.75]"
            style={{ color: INK, fontFamily: SERIF, overflowWrap: "anywhere" }}
          >
            {data.closingLine}
          </blockquote>
          {data.senderName && (
            <figcaption
              className="mt-3 text-[13.5px]"
              style={{ color: INK_SOFT, fontFamily: SERIF }}
            >
              &mdash; {data.senderName}
            </figcaption>
          )}
        </figure>
      )}

      {/* ── The share card. Agent 5's, whole. ─────────────────────────────── */}
      <div className="mt-9">
        <ShareCardPanel data={data} itinerary={itinerary} />
      </div>
    </div>
  );
}

/**
 * One line of the completed route. Every entry from `buildItinerary(data,
 * "after")` is `passed`, but the switch is real: the other two states are
 * unreachable here and are rendered as nothing rather than assumed away with a
 * cast.
 */
function RouteRow({ stop, last }: { stop: StopView; last: boolean }) {
  if (stop.state !== "passed") return null;
  const at = fmtTime(stop.arrivedAt);

  return (
    <li className="relative flex gap-2.5">
      {!last && (
        <span
          aria-hidden
          className="absolute w-px"
          style={{ left: NODE_COL / 2, top: 20, bottom: -2, background: DONE, opacity: 0.45 }}
        />
      )}
      <span
        aria-hidden
        className="relative z-[1] flex shrink-0 items-start justify-center pt-[7px]"
        style={{ width: NODE_COL }}
      >
        <span
          className="block rounded-full"
          style={{ width: 9, height: 9, background: DONE }}
        />
      </span>
      <div className={`min-w-0 flex-1 ${last ? "pb-0" : "pb-3.5"}`}>
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
          <p
            className="min-w-0 flex-1 text-[15.5px] leading-[1.45]"
            style={{ color: INK, fontFamily: SERIF, overflowWrap: "anywhere" }}
          >
            {stop.name}
          </p>
          {/* "" is the frozen contract's marker for "nobody tapped". No invented
              time, and never the word "missed". */}
          {at && (
            <span
              className="shrink-0 text-[13.5px]"
              style={{ color: INK_SOFT, fontFamily: MONO }}
            >
              {at}
            </span>
          )}
        </div>
      </div>
    </li>
  );
}
