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
  GRAD,
  GROTESK,
  INK,
  INK_SOFT,
  ITALIC,
  LIME,
  MOON,
  MOON_FAINT,
  MOON_SOFT,
  PAPER,
  fmtTime,
} from "./dateTheme";
import { PlaceBlock } from "./StaticMap";
import { CandyButton, Glass, GradText } from "./NightKit";
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
const NODE_COL = 34;
const NODE_CENTER = NODE_COL / 2;
/** Where the connector below a node starts. Clears the largest node (the ring). */
const CONNECTOR_TOP = 36;

const REVEAL_MS = 320;

/**
 * Scoped keyframes. `globals.css` belongs to nobody on this build, so the two
 * animations this screen needs live with the screen. Both are also disabled at
 * the media-query level, so a user with reduced motion set gets stillness even
 * if the prop somehow says otherwise.
 */
const CSS = `
@keyframes di-ring-pulse {
  0%   { box-shadow: 0 0 0 0 rgba(255,79,139,0.6); }
  70%  { box-shadow: 0 0 0 13px rgba(255,79,139,0); }
  100% { box-shadow: 0 0 0 0 rgba(255,79,139,0); }
}
@keyframes di-unlock-reveal {
  from { opacity: 0; transform: translateY(9px); }
  to   { opacity: 1; transform: none; }
}
.di-ring-pulse { animation: di-ring-pulse 2.4s ease-out infinite; }
.di-unlock-reveal { animation: di-unlock-reveal ${REVEAL_MS}ms ease-out both; }
.di-live { position: relative; z-index: 1; margin: 0 auto; width: 100%; max-width: 480px; padding: 84px 16px 72px; }
@media (min-width: 640px) { .di-live { max-width: 600px; padding-top: 100px; } }
@media (min-width: 960px) { .di-live { max-width: 660px; } }
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

  // Story-style progress: the meeting point plus every stop.
  const segments = total + 1;
  const done = cursor < 0 ? 0 : Math.min(cursor + 1, segments);

  return (
    <div className="di-live">
      <style>{CSS}</style>

      {/* ── Status ──────────────────────────────────────────────────────────
          `status` is rendered verbatim. It came from `runningStatus()`, which
          is already relaxed and already refuses to scold. */}
      <header className="text-center">
        <span
          className="inline-flex items-center gap-2 rounded-full px-3 py-1.5"
          style={{ background: "rgba(255,79,139,.16)", border: "1px solid rgba(255,79,139,.4)", fontFamily: GROTESK }}
        >
          <span
            className={reduceMotion ? "" : "di-live-dot"}
            style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff4f8b", display: "inline-block" }}
          />
          <span className="text-[11px] font-extrabold uppercase tracking-[0.22em]" style={{ color: "#ffb3cc" }}>
            live · date night
          </span>
        </span>
        <h1
          className="mt-3"
          style={{
            fontFamily: GROTESK,
            fontWeight: 800,
            fontSize: "clamp(32px, 9vw, 52px)",
            lineHeight: 1,
            letterSpacing: "-0.035em",
            color: MOON,
            overflowWrap: "anywhere",
          }}
        >
          {view.recipientName} <GradText>&amp;</GradText> {view.senderName}
        </h1>
        {status && (
          <p
            className="mt-3 inline-block rounded-full px-4 py-2 text-[14.5px] leading-[1.4]"
            style={{
              color: MOON,
              fontFamily: GROTESK,
              fontWeight: 600,
              background: "rgba(255,255,255,.08)",
              border: "1px solid rgba(255,255,255,.14)",
              overflowWrap: "anywhere",
            }}
            aria-live="polite"
          >
            {status}
          </p>
        )}
        {/* Weather is null mid-date by design. Hidden, never a placeholder. */}
        {weather && weatherLine && (
          <p className="mt-2 inline-flex items-center gap-1.5 text-[13px]" style={{ color: MOON_SOFT, fontFamily: GROTESK }}>
            <WeatherIcon code={weather.code} size={15} color={MOON_SOFT} />
            {weatherLine}
          </p>
        )}

        {/* Progress, story-style. */}
        <div aria-hidden className="mt-5 flex gap-1.5">
          {Array.from({ length: segments }, (_, i) => (
            <span
              key={i}
              className="h-[5px] flex-1 overflow-hidden rounded-full"
              style={{ background: "rgba(255,255,255,.14)" }}
            >
              <span
                className="block h-full rounded-full"
                style={{
                  width: i < done ? "100%" : i === done ? "45%" : "0%",
                  background: i < done ? LIME : GRAD,
                  transition: reduceMotion ? "none" : "width .6s cubic-bezier(.2,.9,.3,1)",
                }}
              />
            </span>
          ))}
        </div>
        <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: MOON_FAINT, fontFamily: GROTESK }}>
          {cursor < 0 ? "find each other first" : cursor >= total ? "that's the whole night" : `stop ${cursor + 1} of ${total}`}
        </p>
      </header>

      {/* ── cursor === -1 ───────────────────────────────────────────────────
          The evening has started and they have not checked in anywhere. This
          is the state the page is most often *opened* in, so it must never be
          an empty timeline: the meeting point is shown, with the way forward. */}
      {cursor < 0 && (
        <div
          key="focus-meet"
          ref={focusRef}
          className={`relative mt-6 ${reveal ?? ""}`}
          style={{
            background: PAPER,
            color: INK,
            borderRadius: 26,
            padding: "20px 18px",
            boxShadow: "0 30px 60px -30px rgba(0,0,0,.75)",
          }}
        >
          <p className="mb-3 flex items-center gap-2" style={{ fontFamily: GROTESK, fontWeight: 800, fontSize: 18 }}>
            <span aria-hidden>👋</span> first, find each other
          </p>
          <PlaceBlock point={view.meetingPoint} seed="meeting-point" height={150} eyebrow="MEET AT" />
          <p className="mt-4 text-[15px] leading-[1.6]" style={{ color: INK_SOFT, fontFamily: GROTESK }}>
            Tap below once you&rsquo;ve found each other. The first stop unlocks then. 🔓
          </p>
          <div className="mt-4">
            <CandyButton onClick={handleAdvance}>
              we&rsquo;re here <span aria-hidden>📍</span>
            </CandyButton>
          </div>
        </div>
      )}

      {/* ── The timeline ────────────────────────────────────────────────────
          One <li> per StopView. The node column is a fixed 30px and never grows,
          so a 90-character name or a 120-character address wraps inside the
          content column and the nodes stay in a straight line. */}
      {total > 0 && (
        <ol className="mt-8 list-none p-0">
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
                      width: 2,
                      marginLeft: -0.5,
                      background: stop.state === "passed" ? LIME : "rgba(255,255,255,.16)",
                      opacity: stop.state === "passed" ? 0.6 : 1,
                    }}
                  />
                )}

                <span
                  aria-hidden
                  className="relative z-[1] flex shrink-0 items-start justify-center pt-1"
                  style={{ width: NODE_COL }}
                >
                  <Node state={stop.state} reduceMotion={reduceMotion} />
                </span>

                <div className={`min-w-0 flex-1 ${last ? "pb-2" : "pb-5"}`}>
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
        className="grid place-items-center rounded-full text-[13px] font-black"
        style={{ width: 26, height: 26, background: LIME, color: "#1a0d26" }}
      >
        ✓
      </span>
    );
  }
  if (state === "current") {
    // The single sanctioned ambient motion on this screen.
    return (
      <span
        className={`grid place-items-center rounded-full ${reduceMotion ? "" : "di-ring-pulse"}`}
        style={{ width: 30, height: 30, background: GRAD, border: "3px solid #fff" }}
      >
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />
      </span>
    );
  }
  return (
    <span
      className="grid place-items-center rounded-full text-[12px]"
      style={{ width: 26, height: 26, background: "rgba(255,255,255,.08)", border: "1.5px solid rgba(255,255,255,.22)" }}
    >
      🔒
    </span>
  );
}

// ─── Rows ────────────────────────────────────────────────────────────────────

/** A stop they have already been to. `arrivedAt === ""` means it auto-advanced. */
function PassedRow({ stop }: { stop: Extract<StopView, { state: "passed" }> }) {
  const at = fmtTime(stop.arrivedAt);
  return (
    <Glass style={{ borderRadius: 18, padding: "12px 14px" }}>
      <p
        className="text-[16px] font-bold leading-[1.35]"
        style={{ color: MOON, fontFamily: GROTESK, overflowWrap: "anywhere" }}
      >
        {stop.name}
      </p>
      {/* No invented timestamp when nobody tapped, and never the word "missed". */}
      <p className="mt-0.5 text-[13px]" style={{ color: MOON_SOFT, fontFamily: GROTESK }}>
        {at ? <>✓ you were here at {at}</> : "✓ you were here"}
      </p>
    </Glass>
  );
}

/**
 * A stop that has not been unlocked. `label` is all there is: `———` when the
 * sender kept it a surprise, the real name when they set `surprise === false`.
 * There is no address and no `why` on this object to render even by accident.
 */
function LockedRow({ stop }: { stop: Extract<StopView, { state: "locked" }> }) {
  return (
    <div
      style={{
        borderRadius: 18,
        padding: "12px 14px",
        border: "1.5px dashed rgba(255,255,255,.18)",
        background: "rgba(255,255,255,.03)",
      }}
    >
      <p
        className="text-[16px] font-bold leading-[1.35]"
        style={{
          color: stop.surprise ? MOON_FAINT : MOON_SOFT,
          fontFamily: GROTESK,
          letterSpacing: stop.surprise ? "0.2em" : undefined,
          overflowWrap: "anywhere",
        }}
      >
        {stop.label}
      </p>
      <p className="mt-0.5 text-[13px]" style={{ color: MOON_FAINT, fontFamily: ITALIC, fontStyle: "italic", fontSize: 15 }}>
        unlocks when you get there
      </p>
    </div>
  );
}
