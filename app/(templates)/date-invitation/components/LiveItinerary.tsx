"use client";

// ─── Phase 6 of 7 (`live`) — THE ACTUAL PRODUCT ──────────────────────────────
//
// AGENT 3. They are outdoors, on a phone, in sunlight, one-handed, possibly
// holding a drink. High contrast, large type, 48px targets, readable at arm's
// length. Verified at 380px.
//
// THE TIMELINE RENDERS `itinerary` AND NOTHING ELSE. It came from
// `buildItinerary()`, the only sanctioned path from `data.stops` to the screen.
// These props contain no `stops` array at all — `view` is an `InviteHeaderView`.
// A locked stop's name, address and coordinates are not reachable from this
// file: `LockedStopView` has no such properties. Every branch below switches on
// `state` and lets TypeScript narrow. There is not a single cast in this file,
// and there must never be one.
//
// MOTION. Exactly one ambient animation exists in this entire template and it
// is here: the hollow ring on the current stop pulses, because this page is
// glanced at in the dark and the ring is what says "you are here". It is killed
// under `reduceMotion`. Everything else is one-shot: a ~300ms unlock reveal on
// the newly-current stop, keyed by its id so it plays for the auto-advance too.
//
// NETWORK. Nothing here fetches. `weather` arrives as null mid-date by design
// (see the router) and the row simply does not render. The screen is complete
// from already-loaded state and works offline.

import React, { useEffect, useRef } from "react";

import {
  ACCENT,
  DONE,
  INK,
  INK_FAINT,
  INK_SOFT,
  MONO,
  PAPER,
  PAPER_EDGE,
  SERIF,
  UI,
  fmtTime,
} from "./dateTheme";
import { CornerFlourishes } from "./Ornaments";
import { PlaceBlock } from "./StaticMap";
import StopCard from "./StopCard";
import { sfxUnlock } from "./dateAudio";
import { WeatherIcon, weatherText, type WeatherView } from "./useWeather";
import type { StopView } from "./types";
import type { InviteHeaderView } from "./viewModel";

export interface LiveItineraryProps {
  view: InviteHeaderView;
  /** From `buildItinerary(data, "live")`. The only stop source. */
  itinerary: StopView[];
  /** From `runningStatus(data, nowMs)`. Never scolds. Render it verbatim. */
  status: string;
  /**
   * `data.currentStopIndex`, clamped. -1 means the evening has started but they
   * have not checked in anywhere yet: every entry in `itinerary` is `locked`,
   * and the screen shows the MEETING POINT with the `[ we're here ]` button.
   * See the cursor ruling in `DateInvitationTemplate.tsx`.
   */
  cursor: number;
  nowMs: number;
  /** Usually null during the date — nothing here may block on a fetch. */
  weather: WeatherView | null;
  /** The `[ we're here ]` tap. Stamps the arrival and unlocks exactly one more. */
  onAdvance: () => void;
  reduceMotion: boolean;
}

/** Column width for the timeline nodes. Fixed, so long names cannot shift it. */
const NODE_COL = 30;
const NODE_CENTER = NODE_COL / 2;
/** Where the connector below a node starts. Clears the largest node (the ring). */
const CONNECTOR_TOP = 32;

const REVEAL_MS = 320;

/**
 * Scoped keyframes. `globals.css` belongs to nobody on this build, so the two
 * animations this screen needs live with the screen. Both are also disabled at
 * the media-query level, so a user with reduced motion set gets stillness even
 * if the prop somehow says otherwise.
 */
const CSS = `
@keyframes di-ring-pulse {
  0%   { box-shadow: 0 0 0 0 rgba(140,47,57,0.34); }
  70%  { box-shadow: 0 0 0 11px rgba(140,47,57,0); }
  100% { box-shadow: 0 0 0 0 rgba(140,47,57,0); }
}
@keyframes di-unlock-reveal {
  from { opacity: 0; transform: translateY(9px); }
  to   { opacity: 1; transform: none; }
}
.di-ring-pulse { animation: di-ring-pulse 2.4s ease-out infinite; }
.di-unlock-reveal { animation: di-unlock-reveal ${REVEAL_MS}ms ease-out both; }
@media (prefers-reduced-motion: reduce) {
  .di-ring-pulse, .di-unlock-reveal { animation: none !important; }
}
`;

/** The stable identity of "the thing they are looking at right now". */
const focusKey = (cursor: number, itinerary: StopView[]): string => {
  if (cursor < 0) return "meet";
  const current = itinerary.find((s) => s.state === "current");
  return current ? current.id : "done";
};

export default function LiveItinerary({
  view,
  itinerary,
  status,
  cursor,
  weather,
  onAdvance,
  reduceMotion,
}: LiveItineraryProps) {
  const total = itinerary.length;
  const key = focusKey(cursor, itinerary);

  // ── The one-shot unlock reveal ─────────────────────────────────────────────
  //
  // No state and no timer: the reveal is a mount animation on an element whose
  // React key is the focus id. When the cursor moves — by tap OR by the router's
  // auto-advance, which changes the itinerary underneath us with no event of any
  // kind — the old element unmounts, the new one mounts, and the animation runs
  // exactly once. Nothing can get stuck in a half-revealed state because there
  // is no state to get stuck.
  const focusRef = useRef<HTMLDivElement | null>(null);
  const reveal = reduceMotion ? undefined : "di-unlock-reveal";

  // Bring the new focus into view on an advance. This is navigation, not
  // decoration, so it happens under reduced motion too — instantly instead of
  // smoothly. Never on first paint: that would yank the page out from under
  // someone who has only just opened it.
  const prevKey = useRef<string | null>(null);
  useEffect(() => {
    const prev = prevKey.current;
    prevKey.current = key;
    if (prev === null || prev === key) return;
    focusRef.current?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "center",
    });
  }, [key, reduceMotion]);

  const handleAdvance = () => {
    sfxUnlock();
    onAdvance();
  };

  const weatherLine = weatherText(weather);

  return (
    <div className="mx-auto w-full max-w-[30rem] px-4 pb-16 pt-5">
      <style>{CSS}</style>

      {/* ── Status ──────────────────────────────────────────────────────────
          `status` is rendered verbatim. It came from `runningStatus()`, which is
          already relaxed and already refuses to scold. Nothing in this file adds
          lateness copy of its own. */}
      <header className="text-center">
        <p
          className="text-[10.5px] uppercase tracking-[0.3em]"
          style={{ color: INK_SOFT, fontFamily: UI }}
        >
          {view.recipientName} &amp; {view.senderName}
        </p>
        {status && (
          <p
            className="mt-2 text-[16px] leading-[1.5]"
            style={{ color: INK, fontFamily: SERIF, overflowWrap: "anywhere" }}
            aria-live="polite"
          >
            {status}
          </p>
        )}
        {/* Weather is null mid-date by design. Hidden, never a placeholder. */}
        {weather && weatherLine && (
          <p
            className="mt-1.5 inline-flex items-center gap-1.5 text-[13px]"
            style={{ color: INK_SOFT, fontFamily: SERIF }}
          >
            <WeatherIcon code={weather.code} size={15} color={INK_SOFT} />
            {weatherLine}
          </p>
        )}
        <hr
          aria-hidden
          className="mx-auto mt-4 w-[70px] border-0 border-t"
          style={{ borderColor: PAPER_EDGE }}
        />
      </header>

      {/* ── cursor === -1 ───────────────────────────────────────────────────
          The evening has started and they have not checked in anywhere. This is
          the state the page is most often *opened* in, so it must never be an
          empty timeline: the meeting point is shown, with the way forward. */}
      {cursor < 0 && (
        <div
          key="focus-meet"
          ref={focusRef}
          className={`relative mt-5 rounded-[4px] px-4 py-5 ${reveal ?? ""}`}
          style={{
            background: PAPER,
            border: `1.5px solid ${PAPER_EDGE}`,
            boxShadow: "0 10px 30px -20px rgba(58,44,32,0.4)",
          }}
        >
          <CornerFlourishes color={INK_FAINT} size={26} inset={8} />
          <PlaceBlock point={view.meetingPoint} seed="meeting-point" height={150} eyebrow="MEET AT" />
          <p
            className="mt-4 text-[15px] leading-[1.65]"
            style={{ color: INK_SOFT, fontFamily: SERIF }}
          >
            Tap below once you&rsquo;ve found each other. The first stop unlocks then.
          </p>
          <button
            type="button"
            onClick={handleAdvance}
            className="mt-4 w-full rounded-[4px] px-5 text-[14px] font-semibold uppercase tracking-[0.24em] transition-transform active:scale-[0.985]"
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
        </div>
      )}

      {/* ── The timeline ────────────────────────────────────────────────────
          One <li> per StopView. The node column is a fixed 30px and never grows,
          so a 90-character name or a 120-character address wraps inside the
          content column and the nodes stay in a straight line. */}
      {total > 0 && (
        <ol className="mt-6 list-none p-0">
          {itinerary.map((stop, i) => {
            const last = i === total - 1;
            const isCurrent = stop.state === "current";
            return (
              <li key={stop.id} className="relative flex gap-3">
                {/* Connector. Drawn behind the node, stopping at the last row. */}
                {!last && (
                  <span
                    aria-hidden
                    className="absolute w-px"
                    style={{
                      left: NODE_CENTER,
                      top: CONNECTOR_TOP,
                      bottom: -2,
                      background: stop.state === "passed" ? DONE : PAPER_EDGE,
                      opacity: stop.state === "passed" ? 0.5 : 1,
                    }}
                  />
                )}

                <span
                  aria-hidden
                  className="relative z-[1] flex shrink-0 items-start justify-center pt-1.5"
                  style={{ width: NODE_COL }}
                >
                  <Node state={stop.state} reduceMotion={reduceMotion} />
                </span>

                <div className={`min-w-0 flex-1 ${last ? "pb-2" : "pb-7"}`}>
                  {stop.state === "passed" && <PassedRow stop={stop} />}

                  {stop.state === "locked" && <LockedRow stop={stop} />}

                  {isCurrent && stop.state === "current" && (
                    <div key={`focus-${stop.id}`} ref={focusRef} className={reveal}>
                      <StopCard
                        stop={stop}
                        position={i + 1}
                        total={total}
                        onAdvance={handleAdvance}
                        reduceMotion={reduceMotion}
                      />
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

// ─── Nodes ───────────────────────────────────────────────────────────────────

function Node({ state, reduceMotion }: { state: StopView["state"]; reduceMotion: boolean }) {
  if (state === "passed") {
    return (
      <span
        className="block rounded-full"
        style={{ width: 13, height: 13, background: DONE, border: `1px solid ${DONE}` }}
      />
    );
  }
  if (state === "current") {
    // The single sanctioned ambient motion in this template.
    return (
      <span
        className={`block rounded-full ${reduceMotion ? "" : "di-ring-pulse"}`}
        style={{
          width: 20,
          height: 20,
          background: PAPER,
          border: `3px solid ${ACCENT}`,
        }}
      />
    );
  }
  return (
    <span
      className="block rounded-full"
      style={{
        width: 11,
        height: 11,
        background: PAPER,
        border: `1.5px solid ${INK_FAINT}`,
      }}
    />
  );
}

// ─── Rows ────────────────────────────────────────────────────────────────────

/** A stop they have already been to. `arrivedAt === ""` means it auto-advanced. */
function PassedRow({ stop }: { stop: Extract<StopView, { state: "passed" }> }) {
  const at = fmtTime(stop.arrivedAt);
  return (
    <div className="pt-px">
      <p
        className="text-[16px] leading-[1.4]"
        style={{ color: INK_SOFT, fontFamily: SERIF, overflowWrap: "anywhere" }}
      >
        {stop.name}
      </p>
      {/* No invented timestamp when nobody tapped, and never the word "missed" —
          they were there, the phone just stayed in a pocket. */}
      <p className="mt-0.5 text-[13px]" style={{ color: INK_SOFT, fontFamily: SERIF }}>
        {at ? (
          <>
            you were here at <span style={{ fontFamily: MONO }}>{at}</span>
          </>
        ) : (
          "you were here"
        )}
      </p>
    </div>
  );
}

/**
 * A stop that has not been unlocked. `label` is all there is: `———` when the
 * sender kept it a surprise, the real name when they set `surprise === false`.
 * There is no address and no `why` on this object to render even by accident.
 */
function LockedRow({ stop }: { stop: Extract<StopView, { state: "locked" }> }) {
  return (
    <div className="pt-px">
      <p
        className="text-[16px] leading-[1.4]"
        style={{
          color: stop.surprise ? INK_FAINT : INK_SOFT,
          fontFamily: SERIF,
          letterSpacing: stop.surprise ? "0.12em" : undefined,
          overflowWrap: "anywhere",
        }}
      >
        {stop.label}
      </p>
      <p className="mt-0.5 text-[13px]" style={{ color: INK_FAINT, fontFamily: SERIF }}>
        unlocks when you get there
      </p>
    </div>
  );
}
