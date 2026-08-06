"use client";

// ─── Phase 5 of 7 — `countdown` ──────────────────────────────────────────────
//
// AGENT 2. She said yes. The date has not started.
//
// REVEALED HERE: the meeting point — she has to know where to go — the dress
// code, the weather, a short list of prep, and the countdown itself.
//
// NOT REVEALED, EVER: anything about the stops. `view` is an `InviteHeaderView`
// and that type has no `stops` property, so this screen cannot leak the plan
// even by accident: there is nothing to map over, nothing to count, and nothing
// to stringify into a debug attribute. Acceptance criterion 1 dumps
// `document.body.innerHTML` during this phase and greps it for every secret
// stop's name, address and lat/lng — including inside data- attributes,
// aria-labels, titles and comments. Nothing in this file writes any of those.
//
// THE CLOCK: `nowMs` is a prop, ticked once a second by the phase router. This
// screen starts no interval and never reads `Date.now()`. When the countdown
// crosses zero the router recomputes `phaseOf` on the same tick and swaps in
// the itinerary — the transition is a consequence of the clock, not an event
// this component has to fire.
//
// MOTION: none. Digits changing once a second is already the most animated
// thing on the page; a pulsing ring next to it would be noise. The only
// movement in the file is the share sheet sliding up when she asks for it.

import { useState } from "react";

import {
  ACCENT,
  ACCENT_EDGE,
  CARD_MAX_W,
  CARD_RADIUS,
  CARD_SHADOW,
  DISPLAY,
  INK,
  INK_FAINT,
  INK_SOFT,
  MONO,
  PAPER,
  PAPER_EDGE,
  SERIF,
  TAP,
  fmtDateLong,
  fmtDuration,
  fmtTime,
} from "./dateTheme";
import { WALKING_COPY, countdownTo, formatCountdown } from "./types";
import { CornerFlourishes, DotLeaderRow, Rule } from "./Ornaments";
import { PlaceBlock } from "./StaticMap";
import SharePlanSheet from "./SharePlanSheet";
import { WeatherIcon, weatherText, type WeatherView } from "./useWeather";
import type { InviteHeaderView } from "./viewModel";

export interface CountdownScreenProps {
  view: InviteHeaderView;
  /** Ticked by the template every TIMING.tickMs. Crossing zero re-phases automatically. */
  nowMs: number;
  weather: WeatherView | null;
  reduceMotion: boolean;
}

export default function CountdownScreen({ view, nowMs, weather, reduceMotion }: CountdownScreenProps) {
  const [sharing, setSharing] = useState(false);

  const c = countdownTo(view.startsAt, nowMs);
  const clock = formatCountdown(c);

  const dateLine = fmtDateLong(view.startsAt);
  const timeLine = fmtTime(view.startsAt);
  const weatherLine = weatherText(weather);

  // "20 days 04:22:11" is sixteen characters; "04:22:11" is eight. The type
  // scales with the viewport so the longest form still fits on one line at
  // 320px, and the shortest does not look lost at 430.
  const clockSize = c.days > 0 ? "clamp(25px, 8.2vw, 38px)" : "clamp(34px, 11.5vw, 52px)";

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        justifyContent: "center",
        padding: "26px 16px 44px",
      }}
    >
      <div style={{ width: "100%", maxWidth: CARD_MAX_W }}>
        <article
          style={{
            position: "relative",
            background: PAPER,
            border: `1px solid ${PAPER_EDGE}`,
            borderRadius: CARD_RADIUS,
            boxShadow: CARD_SHADOW,
            padding: "34px 22px 28px",
          }}
        >
          <CornerFlourishes />

          {/* ── The answer, and the date it bought ───────────────────────── */}
          <header style={{ textAlign: "center" }}>
            <p
              style={{
                margin: 0,
                fontFamily: SERIF,
                fontSize: 10.5,
                letterSpacing: "0.34em",
                textTransform: "uppercase",
                color: INK_FAINT,
              }}
            >
              You said yes
            </p>

            <h1
              style={{
                margin: "12px 0 0",
                fontFamily: DISPLAY,
                fontSize: 30,
                lineHeight: 1.2,
                fontWeight: 500,
                color: INK,
                letterSpacing: "0.01em",
                overflowWrap: "anywhere",
              }}
            >
              {dateLine}
            </h1>

            {timeLine ? (
              <p
                style={{
                  margin: "6px 0 0",
                  fontFamily: MONO,
                  fontSize: 14,
                  letterSpacing: "0.1em",
                  color: INK_SOFT,
                }}
              >
                {timeLine}
              </p>
            ) : null}

            <div style={{ display: "flex", justifyContent: "center", margin: "20px 0 0" }}>
              <Rule width={110} />
            </div>

            {/* ── The countdown ──────────────────────────────────────────── */}
            {/*
              aria-live is deliberately off. A polite live region here would
              read the whole clock out loud once a second, forever. The static
              label below carries the same information, once.
            */}
            <div
              role="timer"
              aria-live="off"
              style={{
                margin: "22px 0 0",
                fontFamily: MONO,
                fontSize: clockSize,
                lineHeight: 1.05,
                fontWeight: 700,
                letterSpacing: "0.01em",
                color: ACCENT,
                whiteSpace: "nowrap",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {clock}
            </div>
            <p
              style={{
                margin: "10px 0 0",
                fontFamily: SERIF,
                fontSize: 14.5,
                fontStyle: "italic",
                color: INK_SOFT,
              }}
            >
              until I see you
            </p>
            <span
              style={{
                position: "absolute",
                width: 1,
                height: 1,
                overflow: "hidden",
                clip: "rect(0 0 0 0)",
                whiteSpace: "nowrap",
              }}
            >
              {`Counting down to ${dateLine}${timeLine ? ` at ${timeLine}` : ""}.`}
            </span>
          </header>

          <div style={{ display: "flex", justifyContent: "center", margin: "26px 0 24px" }}>
            <Rule width={110} />
          </div>

          {/* ── Where to go. The one location this phase is allowed to know ── */}
          <PlaceBlock
            point={view.meetingPoint}
            seed={`meeting:${view.startsAt}`}
            eyebrow="Meet at"
            height={132}
          />

          <div style={{ display: "flex", justifyContent: "center", margin: "26px 0 20px" }}>
            <Rule width={110} />
          </div>

          {/* ── Prep. Three facts and one sentence, not a checklist ────────── */}
          <section>
            <p
              style={{
                margin: "0 0 12px",
                fontFamily: SERIF,
                fontSize: 10.5,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: INK_FAINT,
              }}
            >
              Before you come
            </p>

            {view.dressCode ? <DotLeaderRow label="Dress" value={view.dressCode} /> : null}
            <DotLeaderRow label="Walking" value={WALKING_COPY[view.walkingLevel]} />
            <DotLeaderRow label="Running" value={fmtDuration(view.durationMins)} />
            {/* The forecast row exists only when there is a forecast. A failed
                fetch leaves `weather` null and this disappears entirely — no
                error text, no dash, no empty row. */}
            {weather && weatherLine ? (
              <DotLeaderRow
                label="Weather"
                value={
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <WeatherIcon code={weather.code} size={15} />
                    {weatherLine}
                  </span>
                }
              />
            ) : null}

            <p
              style={{
                margin: "16px 0 0",
                fontFamily: SERIF,
                fontSize: 14.5,
                lineHeight: 1.68,
                color: INK,
              }}
            >
              Eat something light beforehand &mdash; trust me on that one. And charge your phone;
              the rest of the evening arrives on it, one piece at a time.
            </p>
          </section>

          {/* ── Share the plan ──────────────────────────────────────────────
              Ordinary and useful, and written that way. No warning triangle,
              no "for your safety" banner, no reminder that the world is
              dangerous. It is the thing she would text a friend anyway. */}
          <div style={{ marginTop: 24, display: "flex", justifyContent: "center" }}>
            <button
              type="button"
              onClick={() => setSharing(true)}
              style={{
                minHeight: TAP,
                minWidth: TAP,
                width: "100%",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 9,
                padding: "0 16px",
                borderRadius: CARD_RADIUS,
                border: `1px solid ${ACCENT_EDGE}`,
                background: "transparent",
                color: ACCENT,
                fontFamily: SERIF,
                fontSize: 12.5,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: reduceMotion ? "none" : "background-color 140ms ease-out",
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle cx="17.5" cy="5.8" r="2.9" stroke="currentColor" strokeWidth="1.6" />
                <circle cx="6" cy="12" r="2.9" stroke="currentColor" strokeWidth="1.6" />
                <circle cx="17.5" cy="18.2" r="2.9" stroke="currentColor" strokeWidth="1.6" />
                <path
                  d="M8.6 10.7 15 7.1M8.6 13.3 15 16.9"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
              share this plan with a friend
            </button>
          </div>
        </article>

        <p
          style={{
            margin: "18px 0 0",
            textAlign: "center",
            fontFamily: SERIF,
            fontSize: 13,
            color: INK_FAINT,
          }}
        >
          &mdash; {view.senderName}
        </p>
      </div>

      <SharePlanSheet view={view} open={sharing} onClose={() => setSharing(false)} />
    </main>
  );
}
