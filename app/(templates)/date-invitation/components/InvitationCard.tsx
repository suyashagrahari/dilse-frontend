"use client";

// ─── Phase 1 of 7 — the invitation ───────────────────────────────────────────
//
// A formal card on cream paper. It has exactly one job: give her everything she
// needs in order to say yes, and none of what would spoil the evening.
//
// Note the props: `view` is an `InviteHeaderView`, which has NO `stops`
// property. The plan is not reachable from here, by construction — see
// `viewModel.ts`. The Location row reads `you'll find out` and that is not a
// joke, it is the product.
//
// AESTHETIC: a real invitation, not a parody document. No case numbers, no
// form codes, no rubber-stamp officialese. The wow here is the craft of the
// paper and the reveal, not an effect. Ambient motion: none. The only thing
// that moves on this screen is the wax seal, once, when she accepts.
//
// MONOSPACE IS RESERVED FOR TIMES. Not the labels, not the values, not the
// dress code. The headline row is therefore composed from `fmtDateLong` +
// `fmtTime` rather than `fmtDateTimeLong` — same two formatters from
// `dateTheme`, same output, but only the clock half gets the mono face.

import { useCallback, useEffect, useRef, useState } from "react";

import { unlockAudio } from "@/lib/webAudio";
import { sfxSeal } from "./dateAudio";
import { CornerFlourishes, DotLeaderRow, Rule, WaxSeal } from "./Ornaments";
import {
  ACCENT,
  ACCENT_EDGE,
  CARD_MAX_W,
  CARD_RADIUS,
  CARD_SHADOW,
  DISPLAY,
  INK,
  INK_SOFT,
  MONO,
  PAPER,
  PAPER_EDGE,
  SERIF,
  TAP,
  fmtDateLong,
  fmtDuration,
  fmtTime,
  toLocalDateInput,
} from "./dateTheme";
import { TIMING, WALKING_COPY, getServerTime } from "./types";
import { WeatherIcon, weatherText, type WeatherView } from "./useWeather";
import type { InviteHeaderView } from "./viewModel";

export interface InvitationCardProps {
  view: InviteHeaderView;
  /** null → omit the Weather row entirely. Never show an error or a spinner. */
  weather: WeatherView | null;
  /**
   * Called AFTER the wax-seal one-shot has finished (TIMING.sealMs). Under
   * reduced motion, call it immediately — reduced motion removes decoration,
   * never functionality.
   */
  onAccept: () => void;
  onDecline: () => void;
  /** `isoDate` is the counter-proposal, ISO 8601. Moves to the reschedule phase. */
  onReschedule: (isoDate: string) => void;
  reduceMotion: boolean;
}

/**
 * Turn a local `<input type="date">` value into an ISO UTC instant, keeping the
 * ORIGINAL start's time-of-day.
 *
 * Without this the counter-proposal is midnight, which is not a date, it is a
 * bug wearing a date's clothes. `setFullYear` writes the local calendar fields
 * and leaves the local wall-clock time alone, so "6:30 PM on the 16th" becomes
 * "6:30 PM on the 23rd" even across a DST boundary; `toISOString` then does the
 * UTC conversion. Everything is stored in UTC, displayed local — see the frozen
 * types.
 */
function dateInputToIsoUtc(dateInput: string, originalIso: string): string {
  const parts = dateInput.split("-").map(Number);
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return "";
  const [y, m, d] = parts;

  const base = Date.parse(originalIso);
  // No usable original time-of-day → 7pm local, which is at least an evening.
  const next = Number.isNaN(base) ? new Date(y, m - 1, d, 19, 0, 0, 0) : new Date(base);
  if (!Number.isNaN(base)) next.setFullYear(y, m - 1, d);
  if (Number.isNaN(next.getTime())) return "";
  return next.toISOString();
}

export default function InvitationCard({
  view,
  weather,
  onAccept,
  onDecline,
  onReschedule,
  reduceMotion,
}: InvitationCardProps) {
  // The seal is a one-shot. `stamping` latches true and never goes back.
  const [stamping, setStamping] = useState(false);
  // The reschedule picker is inline — no library, no modal, no overlay.
  const [picking, setPicking] = useState(false);
  const [pick, setPick] = useState("");
  const [minDate, setMinDate] = useState("");

  const sealTimer = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (sealTimer.current !== null) window.clearTimeout(sealTimer.current);
    },
    [],
  );

  const handleAccept = useCallback(() => {
    if (stamping) return;
    // First user gesture on the page — the only place an AudioContext may be
    // created. Never on mount; the browser would leave it suspended.
    unlockAudio();

    // TODO(server): POST the rsvp result to the sender.

    if (reduceMotion) {
      // No decoration, but the answer still lands. Immediately.
      onAccept();
      return;
    }
    sfxSeal();
    setStamping(true);
    sealTimer.current = window.setTimeout(onAccept, TIMING.sealMs);
  }, [stamping, reduceMotion, onAccept]);

  const openPicker = useCallback(() => {
    unlockAudio();
    // Computed on the gesture, not at render — a value derived from the clock
    // during SSR would not match the client's and React would throw the tree
    // away. `getServerTime()` rather than `Date.now()`, per the frozen types.
    setMinDate(toLocalDateInput(new Date(getServerTime()).toISOString()));
    setPick(toLocalDateInput(view.startsAt));
    setPicking(true);
  }, [view.startsAt]);

  const confirmReschedule = useCallback(() => {
    const iso = dateInputToIsoUtc(pick, view.startsAt);
    if (!iso) return;
    // TODO(server): POST the rsvp result to the sender.
    onReschedule(iso);
  }, [pick, view.startsAt, onReschedule]);

  const handleDecline = useCallback(() => {
    unlockAudio();
    // TODO(server): POST the rsvp result to the sender.
    // No confirm step, no "are you sure?", no second chance prompt. A guilt
    // mechanic is still a guilt mechanic when it is only one tap long.
    onDecline();
  }, [onDecline]);

  const dateText = fmtDateLong(view.startsAt);
  const timeText = fmtTime(view.startsAt);
  const walkingText = WALKING_COPY[view.walkingLevel];
  const busy = stamping;

  return (
    <div className="flex min-h-[100dvh] w-full justify-center px-4 py-8" style={{ background: PAPER }}>
      <article
        aria-label={`An invitation for ${view.recipientName}`}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: CARD_MAX_W,
          alignSelf: "flex-start",
          background: PAPER,
          border: `1px solid ${PAPER_EDGE}`,
          borderRadius: CARD_RADIUS,
          boxShadow: CARD_SHADOW,
          padding: "34px 22px 24px",
        }}
      >
        <CornerFlourishes inset={9} size={34} />

        {/* ── Header ───────────────────────────────────────────────────── */}
        <p
          style={{
            margin: 0,
            textAlign: "center",
            fontFamily: DISPLAY,
            fontSize: 11,
            letterSpacing: "0.36em",
            textIndent: "0.36em",
            textTransform: "uppercase",
            color: ACCENT,
          }}
        >
          You are invited
        </p>

        <h1
          style={{
            margin: "10px 0 0",
            textAlign: "center",
            fontFamily: DISPLAY,
            fontSize: "clamp(30px, 9.5vw, 40px)",
            fontWeight: 500,
            lineHeight: 1.12,
            letterSpacing: "0.005em",
            color: INK,
            overflowWrap: "anywhere",
          }}
        >
          {view.recipientName}
        </h1>

        <div
          aria-hidden
          style={{ height: 1, background: PAPER_EDGE, margin: "18px auto 0", width: "100%" }}
        />

        {/* ── The headline row. Date in the display serif, time in mono. ─── */}
        <p
          style={{
            margin: "18px 0 6px",
            textAlign: "center",
            fontFamily: DISPLAY,
            fontSize: 18,
            lineHeight: 1.45,
            color: INK,
          }}
        >
          {dateText}
          {dateText && timeText ? (
            <>
              <span aria-hidden style={{ color: INK_SOFT, padding: "0 7px" }}>
                ·
              </span>
              <span style={{ fontFamily: MONO, fontSize: 16, letterSpacing: "-0.01em" }}>{timeText}</span>
            </>
          ) : (
            timeText && <span style={{ fontFamily: MONO, fontSize: 16 }}>{timeText}</span>
          )}
        </p>

        {/* ── The leader rows ──────────────────────────────────────────── */}
        <div style={{ margin: "10px 0 0" }}>
          <DotLeaderRow label="Duration" value={fmtDuration(view.durationMins)} />

          {view.dressCode.trim() !== "" && <DotLeaderRow label="Dress" value={view.dressCode} />}

          <DotLeaderRow label="Walking" value={walkingText} />

          {/* Weather is omitted ENTIRELY when the forecast is unavailable. No
              placeholder, no spinner, no error. Never an error state on a
              romantic page. */}
          {weather && (
            <DotLeaderRow
              label="Weather"
              value={
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <WeatherIcon code={weather.code} size={15} color={INK_SOFT} />
                  {weatherText(weather)}
                </span>
              }
            />
          )}

          {/* The entire point of the template. This string does not change.
              Straight apostrophe, deliberately: the row must read EXACTLY
              `you'll find out`, and a curly quote breaks a grep for it. */}
          <DotLeaderRow
            label="Location"
            value={<span style={{ color: ACCENT, fontStyle: "italic" }}>{"you'll find out"}</span>}
          />
        </div>

        {/* ── The note ─────────────────────────────────────────────────── */}
        {view.note.trim() !== "" && (
          <>
            <div style={{ margin: "26px 0 22px" }}>
              <Rule width={86} />
            </div>
            <p
              style={{
                margin: 0,
                textAlign: "center",
                fontFamily: SERIF,
                fontStyle: "italic",
                fontSize: 16.5,
                lineHeight: 1.65,
                color: INK,
                padding: "0 4px",
              }}
            >
              {view.note}
            </p>
          </>
        )}

        <p
          style={{
            margin: "18px 0 0",
            textAlign: "center",
            fontFamily: DISPLAY,
            fontSize: 13,
            letterSpacing: "0.2em",
            textIndent: "0.2em",
            textTransform: "uppercase",
            color: INK_SOFT,
          }}
        >
          {view.senderName}
        </p>

        {/* ── RSVP ─────────────────────────────────────────────────────── */}
        <div style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            type="button"
            onClick={handleAccept}
            disabled={busy}
            aria-label="Accept"
            style={{
              minHeight: 54,
              minWidth: TAP,
              width: "100%",
              padding: "14px 16px",
              background: ACCENT,
              color: PAPER,
              border: `1px solid ${ACCENT}`,
              borderRadius: CARD_RADIUS,
              fontFamily: DISPLAY,
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: "0.2em",
              textIndent: "0.2em",
              cursor: busy ? "default" : "pointer",
              opacity: busy ? 0.55 : 1,
              WebkitTapHighlightColor: "transparent",
            }}
          >
            [ ACCEPT ]
          </button>

          <button
            type="button"
            onClick={picking ? () => setPicking(false) : openPicker}
            disabled={busy}
            aria-expanded={picking}
            aria-label="Suggest another day"
            style={{
              minHeight: TAP,
              minWidth: TAP,
              width: "100%",
              padding: "12px 14px",
              background: "transparent",
              color: ACCENT,
              border: `1px solid ${ACCENT_EDGE}`,
              borderRadius: CARD_RADIUS,
              fontFamily: DISPLAY,
              fontSize: 13,
              letterSpacing: "0.15em",
              textIndent: "0.15em",
              cursor: busy ? "default" : "pointer",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            [ CAN WE DO ANOTHER DAY? ]
          </button>

          {picking && (
            <div
              style={{
                border: `1px solid ${PAPER_EDGE}`,
                borderRadius: CARD_RADIUS,
                padding: "12px 12px 14px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <label
                htmlFor="di-reschedule-date"
                style={{
                  fontFamily: SERIF,
                  fontSize: 11,
                  letterSpacing: "0.17em",
                  textTransform: "uppercase",
                  color: INK_SOFT,
                }}
              >
                A day that works
              </label>
              {/* Native picker. No date library — they are banned, and the OS
                  one is better on a phone than anything we could ship. */}
              <input
                id="di-reschedule-date"
                type="date"
                value={pick}
                min={minDate || undefined}
                onChange={(e) => setPick(e.target.value)}
                style={{
                  minHeight: TAP,
                  width: "100%",
                  padding: "10px 12px",
                  background: PAPER,
                  color: INK,
                  border: `1px solid ${PAPER_EDGE}`,
                  borderRadius: CARD_RADIUS,
                  fontFamily: MONO,
                  fontSize: 16,
                }}
              />
              <p style={{ margin: 0, fontFamily: SERIF, fontSize: 13, lineHeight: 1.5, color: INK_SOFT }}>
                Same time of day{timeText ? <> — {timeText}</> : null}. {view.senderName} will get the
                suggestion.
              </p>
              <button
                type="button"
                onClick={confirmReschedule}
                disabled={!pick}
                aria-label="Send this day"
                style={{
                  minHeight: TAP,
                  minWidth: TAP,
                  width: "100%",
                  padding: "12px 14px",
                  background: pick ? ACCENT : PAPER_EDGE,
                  color: pick ? PAPER : INK_SOFT,
                  border: `1px solid ${pick ? ACCENT : PAPER_EDGE}`,
                  borderRadius: CARD_RADIUS,
                  fontFamily: DISPLAY,
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: "0.16em",
                  textIndent: "0.16em",
                  cursor: pick ? "pointer" : "default",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                [ SEND THIS DAY ]
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleDecline}
            disabled={busy}
            aria-label="Not this time"
            style={{
              minHeight: TAP,
              minWidth: TAP,
              width: "100%",
              padding: "12px 14px",
              background: "transparent",
              color: INK_SOFT,
              border: "1px solid transparent",
              borderRadius: CARD_RADIUS,
              fontFamily: DISPLAY,
              fontSize: 13,
              letterSpacing: "0.15em",
              textIndent: "0.15em",
              cursor: busy ? "default" : "pointer",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            [ NOT THIS TIME ]
          </button>
        </div>

        {/* ── The seal ─────────────────────────────────────────────────── */}
        {stamping && (
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(253, 250, 243, 0.78)",
              borderRadius: CARD_RADIUS,
              pointerEvents: "none",
            }}
          >
            <WaxSeal initial={view.senderName} stamped reduceMotion={reduceMotion} size={124} />
          </div>
        )}
      </article>
    </div>
  );
}
