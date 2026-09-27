"use client";

// ─── Phase 1 of 7 — the invitation ───────────────────────────────────────────
//
// A two-part ticket on a night sky: the cream "main" carries everything she
// needs in order to say yes, the plum "stub" carries the answer. On a phone the
// stub tears off below; from 960px the ticket turns landscape and the stub sits
// on the right, like a real admit-two.
//
// Note the props: `view` is an `InviteHeaderView`, which has NO `stops`
// property. The plan is not reachable from here, by construction — see
// `viewModel.ts`. The Location row reads `you'll find out` and that is not a
// joke, it is the product.

import { useCallback, useEffect, useRef, useState } from "react";

import { unlockAudio } from "@/lib/webAudio";
import { sfxSeal } from "./dateAudio";
import {
  ACCENT,
  GRAD,
  GROTESK,
  INK,
  INK_SOFT,
  ITALIC,
  MOON,
  MOON_FAINT,
  MOON_SOFT,
  PAPER,
  PAPER_EDGE,
  TAP,
  fmtDuration,
  fmtTime,
  toLocalDateInput,
} from "./dateTheme";
import { TIMING, WALKING_COPY, getServerTime } from "./types";
import { weatherFamily, weatherText, type WeatherView } from "./useWeather";
import type { InviteHeaderView } from "./viewModel";
import { CandyButton, Eyebrow, GhostButton, GradText, HeartBurst, Tape, useHydrated } from "./NightKit";

export interface InvitationCardProps {
  view: InviteHeaderView;
  /** null → omit the Weather chip entirely. Never show an error or a spinner. */
  weather: WeatherView | null;
  /**
   * Called AFTER the yes animation has finished. Under reduced motion, call it
   * immediately — reduced motion removes decoration, never functionality.
   */
  onAccept: () => void;
  onDecline: () => void;
  /** `isoDate` is the counter-proposal, ISO 8601. Moves to the reschedule phase. */
  onReschedule: (isoDate: string) => void;
  reduceMotion: boolean;
}

/** Long enough for the hearts to land; never shorter than the frozen seal time. */
const YES_MS = Math.max(TIMING.sealMs, 1150);

/**
 * Turn a local `<input type="date">` value into an ISO UTC instant, keeping the
 * ORIGINAL start's time-of-day, so the counter-proposal is "6:30 PM on the
 * 23rd" and not midnight. `setFullYear` keeps the local wall-clock time even
 * across a DST boundary; `toISOString` then does the UTC conversion.
 */
function dateInputToIsoUtc(dateInput: string, originalIso: string): string {
  const parts = dateInput.split("-").map(Number);
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return "";
  const [y, m, d] = parts;

  const base = Date.parse(originalIso);
  const next = Number.isNaN(base) ? new Date(y, m - 1, d, 19, 0, 0, 0) : new Date(base);
  if (!Number.isNaN(base)) next.setFullYear(y, m - 1, d);
  if (Number.isNaN(next.getTime())) return "";
  return next.toISOString();
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function dateParts(iso: string): { day: string; month: string; weekday: string } | null {
  const t = Date.parse(iso);
  if (!iso || Number.isNaN(t)) return null;
  const d = new Date(t);
  // Fixed names rather than toLocaleDateString: Node and the browser disagree
  // on short month names ("Sept" / "Sep"), which breaks hydration.
  return { day: String(d.getDate()), month: MONTHS[d.getMonth()], weekday: WEEKDAYS[d.getDay()] };
}

export function weatherEmoji(code: number): string {
  switch (weatherFamily(code)) {
    case "clear":
      return "☀️";
    case "mostly-clear":
      return "🌤️";
    case "cloudy":
      return "☁️";
    case "fog":
      return "🌫️";
    case "drizzle":
      return "🌦️";
    case "rain":
      return "🌧️";
    case "snow":
      return "❄️";
    case "thunder":
      return "⛈️";
    default:
      return "🌙";
  }
}

const CSS = `
.di-inv { position: relative; z-index: 1; min-height: 100dvh; padding: 88px 16px 56px; display: flex; flex-direction: column; align-items: center; }
.di-inv-intro { text-align: center; max-width: 560px; }
.di-ticket { width: 100%; max-width: 460px; display: grid; grid-template-columns: 1fr; filter: drop-shadow(0 30px 50px rgba(0,0,0,.55)); }
.di-main { background: ${PAPER}; color: ${INK}; border-radius: 28px 28px 0 0; padding: 26px 22px 26px;
  -webkit-mask: radial-gradient(circle 14px at 0 100%, #0000 97%, #000) left / 51% 100% no-repeat, radial-gradient(circle 14px at 100% 100%, #0000 97%, #000) right / 51% 100% no-repeat;
          mask: radial-gradient(circle 14px at 0 100%, #0000 97%, #000) left / 51% 100% no-repeat, radial-gradient(circle 14px at 100% 100%, #0000 97%, #000) right / 51% 100% no-repeat; }
.di-stub { background: linear-gradient(160deg, #2c1147 0%, #1c0b2e 100%); color: ${MOON}; border-radius: 0 0 28px 28px; padding: 26px 22px 24px; position: relative;
  border-top: 2px dashed rgba(255,255,255,.22);
  -webkit-mask: radial-gradient(circle 14px at 0 0, #0000 97%, #000) left / 51% 100% no-repeat, radial-gradient(circle 14px at 100% 0, #0000 97%, #000) right / 51% 100% no-repeat;
          mask: radial-gradient(circle 14px at 0 0, #0000 97%, #000) left / 51% 100% no-repeat, radial-gradient(circle 14px at 100% 0, #0000 97%, #000) right / 51% 100% no-repeat; }
.di-chips { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.di-tape { width: 100%; max-width: 620px; margin: 22px 0 26px; }
@media (min-width: 640px) {
  .di-inv { padding-top: 104px; }
  .di-ticket { max-width: 520px; }
  .di-main { padding: 32px 30px; }
  .di-stub { padding: 30px 30px 26px; }
}
@media (min-width: 960px) {
  .di-inv { padding-top: 112px; justify-content: flex-start; }
  .di-ticket { max-width: 980px; grid-template-columns: minmax(0, 1fr) 360px; }
  .di-main { border-radius: 32px 0 0 32px; padding: 38px 40px;
    -webkit-mask: radial-gradient(circle 16px at 100% 0, #0000 97%, #000) top / 100% 51% no-repeat, radial-gradient(circle 16px at 100% 100%, #0000 97%, #000) bottom / 100% 51% no-repeat;
            mask: radial-gradient(circle 16px at 100% 0, #0000 97%, #000) top / 100% 51% no-repeat, radial-gradient(circle 16px at 100% 100%, #0000 97%, #000) bottom / 100% 51% no-repeat; }
  .di-stub { border-radius: 0 32px 32px 0; border-top: none; border-left: 2px dashed rgba(255,255,255,.22); padding: 38px 32px; display: flex; flex-direction: column; justify-content: center;
    -webkit-mask: radial-gradient(circle 16px at 0 0, #0000 97%, #000) top / 100% 51% no-repeat, radial-gradient(circle 16px at 0 100%, #0000 97%, #000) bottom / 100% 51% no-repeat;
            mask: radial-gradient(circle 16px at 0 0, #0000 97%, #000) top / 100% 51% no-repeat, radial-gradient(circle 16px at 0 100%, #0000 97%, #000) bottom / 100% 51% no-repeat; }
  .di-inv-intro { max-width: 980px; }
  .di-chips { margin-top: 0 !important; }
  .di-main-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 26px; align-items: start; }
}
`;

export default function InvitationCard({
  view,
  weather,
  onAccept,
  onDecline,
  onReschedule,
  reduceMotion,
}: InvitationCardProps) {
  // The yes is a one-shot. `stamping` latches true and never goes back.
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
      onAccept();
      return;
    }
    sfxSeal();
    setStamping(true);
    sealTimer.current = window.setTimeout(onAccept, YES_MS);
  }, [stamping, reduceMotion, onAccept]);

  const openPicker = useCallback(() => {
    unlockAudio();
    // Computed on the gesture, not at render — a clock-derived value during SSR
    // would not match the client's. `getServerTime()`, per the frozen types.
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
    // No confirm step, no "are you sure?". A no is a complete answer.
    onDecline();
  }, [onDecline]);

  const hydrated = useHydrated();
  const parts = hydrated ? dateParts(view.startsAt) : null;
  const timeText = hydrated ? fmtTime(view.startsAt) : "";
  const busy = stamping;

  const chips: { emoji: string; label: string; value: string }[] = [
    { emoji: "⏱️", label: "Runs", value: fmtDuration(view.durationMins).replace(/^about /, "~") },
    ...(view.dressCode.trim() ? [{ emoji: "👗", label: "Dress", value: view.dressCode }] : []),
    { emoji: "👟", label: "Walking", value: WALKING_COPY[view.walkingLevel] },
    // Omitted ENTIRELY when the forecast is unavailable. Never an error state.
    ...(weather ? [{ emoji: weatherEmoji(weather.code), label: "Weather", value: weatherText(weather) }] : []),
  ];

  return (
    <main className="di-inv">
      <style>{CSS}</style>

      {/* ── The hook ─────────────────────────────────────────────────────── */}
      <header className={`di-inv-intro ${reduceMotion ? "" : "di-pop-in"}`}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 14px 6px 6px",
            borderRadius: 999,
            background: "rgba(255,255,255,.08)",
            border: "1px solid rgba(255,255,255,.16)",
            fontFamily: GROTESK,
            fontSize: 13,
            fontWeight: 600,
            color: MOON_SOFT,
          }}
        >
          <span
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: GRAD,
              display: "grid",
              placeItems: "center",
              fontSize: 13,
            }}
          >
            💌
          </span>
          new invite from <strong style={{ color: MOON }}>{view.senderName}</strong>
        </span>

        <h1
          style={{
            margin: "18px 0 0",
            fontFamily: GROTESK,
            fontWeight: 800,
            fontSize: "clamp(40px, 11vw, 76px)",
            lineHeight: 0.95,
            letterSpacing: "-0.035em",
            color: MOON,
            overflowWrap: "anywhere",
          }}
        >
          {view.recipientName},
          <br />
          <span style={{ fontFamily: ITALIC, fontStyle: "italic", fontWeight: 400, letterSpacing: "-0.01em" }}>
            wanna go on a{" "}
          </span>
          <GradText>date?</GradText>
        </h1>
      </header>

      <div className="di-tape">
        <Tape
          words={["date night", "location: classified", "rsvp required", "no pressure tho"]}
          reduceMotion={reduceMotion}
        />
      </div>

      {/* ── The ticket ───────────────────────────────────────────────────── */}
      <article
        aria-label={`An invitation for ${view.recipientName}`}
        className={`di-ticket ${reduceMotion ? "" : "di-pop-in"}`}
        style={{ position: "relative", animationDelay: "120ms" }}
      >
        <section className="di-main">
          <div className="di-main-cols">
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <span
                  style={{
                    fontFamily: GROTESK,
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: ACCENT,
                  }}
                >
                  🎟️ admit two
                </span>
                <span style={{ fontFamily: GROTESK, fontSize: 12, fontWeight: 600, color: INK_SOFT }}>
                  for <b style={{ color: INK }}>{view.recipientName}</b>
                </span>
              </div>

              {/* The date, as a big tile + the time. */}
              <div style={{ display: "flex", alignItems: "stretch", gap: 14, marginTop: 18 }}>
                {(parts || !hydrated) && (
                  <div
                    style={{
                      flexShrink: 0,
                      width: 92,
                      borderRadius: 20,
                      background: GRAD,
                      color: "#fff",
                      textAlign: "center",
                      padding: "10px 6px 12px",
                      transform: "rotate(-3deg)",
                      boxShadow: "0 12px 24px -12px rgba(208,36,95,.8)",
                    }}
                  >
                    <div style={{ fontFamily: GROTESK, fontSize: 12, fontWeight: 800, letterSpacing: ".18em", textTransform: "uppercase", opacity: 0.9 }}>
                      {parts?.month ?? "\u00a0"}
                    </div>
                    <div style={{ fontFamily: GROTESK, fontSize: 46, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.04em" }}>
                      {parts?.day ?? "\u00a0"}
                    </div>
                  </div>
                )}
                <div style={{ minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  {(parts || !hydrated) && (
                    <p style={{ margin: 0, fontFamily: GROTESK, fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                      {parts?.weekday ?? "\u00a0"}
                    </p>
                  )}
                  {timeText && (
                    <p style={{ margin: "4px 0 0", fontFamily: ITALIC, fontStyle: "italic", fontSize: 24, lineHeight: 1.1, color: ACCENT }}>
                      at {timeText}
                    </p>
                  )}
                </div>
              </div>

              {/* The whole point of the template. This string does not change:
                  it must read EXACTLY `you'll find out` (straight apostrophe). */}
              <div
                style={{
                  marginTop: 20,
                  borderRadius: 18,
                  background: "#1c0d2c",
                  color: MOON,
                  padding: "14px 16px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <span style={{ fontFamily: GROTESK, fontSize: 11, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: MOON_FAINT }}>
                    📍 Location
                  </span>
                  <span
                    className={reduceMotion ? "" : "di-wiggle"}
                    style={{
                      fontFamily: GROTESK,
                      fontSize: 10.5,
                      fontWeight: 800,
                      letterSpacing: ".14em",
                      textTransform: "uppercase",
                      background: "#d8ff5c",
                      color: "#1a0d26",
                      borderRadius: 999,
                      padding: "3px 9px",
                    }}
                  >
                    classified
                  </span>
                </div>
                <div style={{ position: "relative", marginTop: 8 }}>
                  <span
                    aria-hidden
                    className={reduceMotion ? "" : "di-scramble"}
                    style={{
                      display: "block",
                      fontFamily: GROTESK,
                      fontWeight: 800,
                      fontSize: 18,
                      letterSpacing: ".02em",
                      filter: "blur(5px)",
                      opacity: 0.55,
                      userSelect: "none",
                    }}
                  >
                    Somewhere you&rsquo;ll love, 7th Cross
                  </span>
                  <span
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontFamily: ITALIC,
                      fontStyle: "italic",
                      fontSize: 22,
                      color: "#ff8fb6",
                    }}
                  >
                    🔒 {"you'll find out"}
                  </span>
                </div>
              </div>
            </div>

            <div>
              {/* Stickers: the facts she needs to say yes. */}
              <div className="di-chips" style={{ marginTop: 20 }}>
                {chips.map((c) => (
                  <div
                    key={c.label}
                    className="di-chip"
                    style={{
                      borderRadius: 16,
                      background: "#fff",
                      border: `1px solid ${PAPER_EDGE}`,
                      padding: "10px 12px",
                      minWidth: 0,
                      boxShadow: "0 6px 14px -10px rgba(58,44,32,.5)",
                    }}
                  >
                    <div style={{ fontSize: 18, lineHeight: 1 }}>{c.emoji}</div>
                    <div style={{ marginTop: 6, fontFamily: GROTESK, fontSize: 10, fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase", color: INK_SOFT }}>
                      {c.label}
                    </div>
                    <div style={{ marginTop: 2, fontFamily: GROTESK, fontSize: 14, fontWeight: 700, lineHeight: 1.25, color: INK, overflowWrap: "anywhere" }}>
                      {c.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* The note. */}
              {view.note.trim() !== "" && (
                <figure style={{ margin: "22px 0 0", position: "relative", padding: "4px 2px 0 30px" }}>
                  <span
                    aria-hidden
                    style={{ position: "absolute", left: 0, top: -12, fontFamily: ITALIC, fontSize: 64, lineHeight: 1, color: "#ffb3cc" }}
                  >
                    &ldquo;
                  </span>
                  <blockquote
                    style={{
                      margin: 0,
                      fontFamily: ITALIC,
                      fontStyle: "italic",
                      fontSize: 22,
                      lineHeight: 1.35,
                      color: INK,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {view.note}
                  </blockquote>
                  <figcaption style={{ marginTop: 10, fontFamily: GROTESK, fontSize: 14, fontWeight: 700, color: ACCENT }}>
                    — {view.senderName} 🤍
                  </figcaption>
                </figure>
              )}
              {view.note.trim() === "" && (
                <p style={{ margin: "18px 0 0", fontFamily: GROTESK, fontSize: 14, fontWeight: 700, color: ACCENT }}>
                  — {view.senderName} 🤍
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ── The stub: the answer ─────────────────────────────────────────── */}
        <section className="di-stub">
          <Eyebrow color={MOON_FAINT}>rsvp · tap one</Eyebrow>
          <p style={{ margin: "8px 0 18px", fontFamily: GROTESK, fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            so&hellip; are you in? <span className={reduceMotion ? "" : "di-float"} style={{ display: "inline-block" }}>👀</span>
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <CandyButton onClick={handleAccept} disabled={busy} ariaLabel="Accept">
              yes, I&rsquo;m in <span aria-hidden>💘</span>
            </CandyButton>

            <GhostButton
              onClick={picking ? () => setPicking(false) : openPicker}
              disabled={busy}
              ariaExpanded={picking}
              ariaLabel="Suggest another day"
            >
              <span aria-hidden>📅</span> can we do another day?
            </GhostButton>

            {picking && (
              <div
                className={reduceMotion ? "" : "di-pop-in"}
                style={{
                  borderRadius: 20,
                  background: "rgba(255,255,255,.07)",
                  border: "1px solid rgba(255,255,255,.16)",
                  padding: 14,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <label htmlFor="di-reschedule-date">
                  <Eyebrow color={MOON_FAINT}>a day that works</Eyebrow>
                </label>
                {/* Native picker. No date library — the OS one is better on a phone. */}
                <input
                  id="di-reschedule-date"
                  type="date"
                  value={pick}
                  min={minDate || undefined}
                  onChange={(e) => setPick(e.target.value)}
                  style={{
                    minHeight: TAP,
                    width: "100%",
                    padding: "10px 14px",
                    background: PAPER,
                    color: INK,
                    border: "none",
                    borderRadius: 14,
                    fontFamily: GROTESK,
                    fontWeight: 700,
                    fontSize: 16,
                    colorScheme: "light",
                  }}
                />
                <p style={{ margin: 0, fontFamily: GROTESK, fontSize: 13, lineHeight: 1.5, color: MOON_SOFT }}>
                  Same time{timeText ? <> ({timeText})</> : null}. {view.senderName} gets the suggestion.
                </p>
                <CandyButton onClick={confirmReschedule} disabled={!pick} ariaLabel="Send this day" style={{ minHeight: 50, fontSize: 15 }}>
                  send this day <span aria-hidden>✈️</span>
                </CandyButton>
              </div>
            )}

            <button
              type="button"
              onClick={handleDecline}
              disabled={busy}
              aria-label="Not this time"
              className="di-ghost"
              style={{
                minHeight: TAP,
                width: "100%",
                background: "transparent",
                border: "none",
                borderRadius: 999,
                color: MOON_FAINT,
                fontFamily: GROTESK,
                fontSize: 14,
                fontWeight: 600,
                cursor: busy ? "default" : "pointer",
                textDecoration: "underline",
                textUnderlineOffset: 4,
              }}
            >
              not this time
            </button>
          </div>

          {/* Barcode, because every good ticket has one. */}
          <div aria-hidden style={{ marginTop: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: 0.55 }}>
            <div style={{ display: "flex", gap: 2, height: 30 }}>
              {Array.from({ length: 38 }, (_, i) => (
                <span key={i} style={{ width: [1, 3, 1, 2, 4, 1, 2][i % 7], background: MOON, borderRadius: 1 }} />
              ))}
            </div>
            <span style={{ fontFamily: GROTESK, fontSize: 10, fontWeight: 700, letterSpacing: ".3em" }}>
              {(view.senderName.slice(0, 1) + "♥" + view.recipientName.slice(0, 1)).toUpperCase()} · ADMIT 2
            </span>
          </div>
        </section>

        {/* ── The yes ──────────────────────────────────────────────────────── */}
        {stamping && (
          <div
            aria-hidden
            style={{
              position: "fixed",
              inset: 0,
              display: "grid",
              placeItems: "center",
              pointerEvents: "none",
              zIndex: 140,
              background: "radial-gradient(circle at 50% 50%, rgba(18,8,31,.55), rgba(18,8,31,.2) 70%)",
            }}
          >
            <HeartBurst />
            <div
              className="di-slap"
              style={{
                padding: "14px 26px",
                borderRadius: 18,
                border: "4px solid #d8ff5c",
                background: "rgba(18,8,31,.9)",
                color: "#d8ff5c",
                fontFamily: GROTESK,
                fontWeight: 800,
                fontSize: "clamp(30px, 9vw, 48px)",
                letterSpacing: "-0.02em",
                boxShadow: "0 20px 60px -10px rgba(0,0,0,.7)",
              }}
            >
              it&rsquo;s a date ✓
            </div>
          </div>
        )}
      </article>
    </main>
  );
}
