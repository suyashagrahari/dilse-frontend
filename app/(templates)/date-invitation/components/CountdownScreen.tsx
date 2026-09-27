"use client";

// ─── Phase 5 of 7 — `countdown` ──────────────────────────────────────────────
//
// She said yes. The date has not started.
//
// REVEALED HERE: the meeting point — she has to know where to go — the dress
// code, the weather, a short list of prep, and the countdown itself.
//
// NOT REVEALED, EVER: anything about the stops. `view` is an `InviteHeaderView`
// and that type has no `stops` property, so this screen cannot leak the plan.
//
// THE CLOCK: `nowMs` is a prop, ticked once a second by the phase router. This
// screen starts no interval and never reads `Date.now()`. When the countdown
// crosses zero the router swaps in the itinerary on the same tick.
//
// LAYOUT: phone and tablet stack; from 960px the meet-up card and the prep
// card sit side by side under the clock.

import { useState } from "react";

import {
  GROTESK,
  INK,
  ITALIC,
  MOON,
  MOON_FAINT,
  MOON_SOFT,
  PAPER,
  fmtDateLong,
  fmtDuration,
  fmtTime,
} from "./dateTheme";
import { WALKING_COPY, countdownTo } from "./types";
import { PlaceBlock } from "./StaticMap";
import SharePlanSheet from "./SharePlanSheet";
import { weatherText, type WeatherView } from "./useWeather";
import type { InviteHeaderView } from "./viewModel";
import { weatherEmoji } from "./InvitationCard";
import { Eyebrow, Glass, GhostButton, GradText, Tape, useHydrated } from "./NightKit";

export interface CountdownScreenProps {
  view: InviteHeaderView;
  /** Ticked by the template every TIMING.tickMs. Crossing zero re-phases automatically. */
  nowMs: number;
  weather: WeatherView | null;
  reduceMotion: boolean;
  /** The host sees "Aditi said yes"; everyone else sees "you said yes". */
  viewer: "guest" | "host" | "demo";
}

const CSS = `
.di-cd { position: relative; z-index: 1; min-height: 100dvh; padding: 88px 16px 56px; display: flex; flex-direction: column; align-items: center; }
.di-cd-wrap { width: 100%; max-width: 480px; }
.di-cd-tiles { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.di-cd-grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: 16px; margin-top: 18px; }
@media (min-width: 640px) {
  .di-cd { padding-top: 104px; }
  .di-cd-wrap { max-width: 600px; }
  .di-cd-tiles { gap: 14px; }
}
@media (min-width: 960px) {
  .di-cd-wrap { max-width: 1000px; }
  .di-cd-tiles { max-width: 720px; margin: 0 auto; }
  .di-cd-grid { grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr); gap: 22px; align-items: start; }
}
`;

const PREP = [
  { emoji: "🥪", text: "Eat something light beforehand — trust me on this one." },
  { emoji: "🔋", text: "Charge your phone. The rest of the night arrives on it, one stop at a time." },
  { emoji: "💅", text: "Show up as you. That's the whole dress code, really." },
];

export default function CountdownScreen({ view, nowMs, weather, reduceMotion, viewer }: CountdownScreenProps) {
  const [sharing, setSharing] = useState(false);
  const [ticked, setTicked] = useState<Record<number, boolean>>({});

  const c = countdownTo(view.startsAt, nowMs);
  const hydrated = useHydrated();
  const dateLine = hydrated ? fmtDateLong(view.startsAt) : "";
  const timeLine = hydrated ? fmtTime(view.startsAt) : "";
  const weatherLine = weatherText(weather);
  const pad = (n: number) => String(n).padStart(2, "0");

  const units = [
    { v: String(c.days), l: c.days === 1 ? "day" : "days" },
    { v: pad(c.hours), l: "hrs" },
    { v: pad(c.mins), l: "min" },
    { v: pad(c.secs), l: "sec" },
  ];

  const facts: { emoji: string; label: string; value: string }[] = [
    ...(view.dressCode ? [{ emoji: "👗", label: "Dress", value: view.dressCode }] : []),
    { emoji: "👟", label: "Walking", value: WALKING_COPY[view.walkingLevel] },
    { emoji: "⏱️", label: "Runs", value: fmtDuration(view.durationMins) },
    // Exists only when there is a forecast — no error text, no dash.
    ...(weather && weatherLine ? [{ emoji: weatherEmoji(weather.code), label: "Weather", value: weatherLine }] : []),
  ];

  return (
    <main className="di-cd">
      <style>{CSS}</style>
      <div className="di-cd-wrap">
        {/* ── The answer, and the date it bought ───────────────────────── */}
        <header style={{ textAlign: "center" }} className={reduceMotion ? "" : "di-pop-in"}>
          <span
            style={{
              display: "inline-block",
              padding: "6px 14px",
              borderRadius: 999,
              background: "#d8ff5c",
              color: "#1a0d26",
              fontFamily: GROTESK,
              fontWeight: 800,
              fontSize: 12,
              letterSpacing: ".16em",
              textTransform: "uppercase",
              transform: "rotate(-2deg)",
            }}
          >
            ✓ {viewer === "host" ? `${view.recipientName} said yes` : "you said yes"}
          </span>
          <h1
            style={{
              margin: "16px 0 0",
              fontFamily: GROTESK,
              fontWeight: 800,
              fontSize: "clamp(40px, 11vw, 80px)",
              lineHeight: 0.95,
              letterSpacing: "-0.04em",
              color: MOON,
            }}
          >
            it&rsquo;s a <GradText>date</GradText>{" "}
            <span className={reduceMotion ? "" : "di-float"} style={{ display: "inline-block" }}>
              🥂
            </span>
          </h1>
          <p style={{ margin: "12px 0 0", fontFamily: ITALIC, fontStyle: "italic", fontSize: 22, color: MOON_SOFT }}>
            {dateLine}
            {timeLine ? ` · ${timeLine}` : ""}
          </p>
        </header>

        {/* ── The countdown ──────────────────────────────────────────────
            aria-live is off: a polite live region would read the clock out
            loud once a second, forever. The hidden label carries it once. */}
        <div role="timer" aria-live="off" className="di-cd-tiles" style={{ marginTop: 26 }}>
          {units.map((u, i) => (
            <Glass
              key={u.l}
              style={{
                borderRadius: 22,
                padding: "14px 4px 12px",
                textAlign: "center",
                overflow: "hidden",
                background: i === 3 ? "linear-gradient(160deg, rgba(255,79,139,.35), rgba(255,154,60,.22))" : undefined,
              }}
            >
              <span
                key={u.v}
                className={reduceMotion ? "" : "di-tick"}
                style={{
                  display: "block",
                  fontFamily: GROTESK,
                  fontWeight: 800,
                  fontSize: "clamp(30px, 10vw, 64px)",
                  lineHeight: 1,
                  letterSpacing: "-0.04em",
                  fontVariantNumeric: "tabular-nums",
                  color: MOON,
                }}
              >
                {u.v}
              </span>
              <span style={{ display: "block", marginTop: 6, fontFamily: GROTESK, fontSize: 11, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase", color: MOON_FAINT }}>
                {u.l}
              </span>
            </Glass>
          ))}
        </div>
        <p style={{ margin: "12px 0 0", textAlign: "center", fontFamily: ITALIC, fontStyle: "italic", fontSize: 20, color: MOON_SOFT }}>
          {viewer === "host" ? `until you see ${view.recipientName} ✨` : "until I see you ✨"}
        </p>
        <span
          style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}
        >
          {`Counting down to ${dateLine}${timeLine ? ` at ${timeLine}` : ""}.`}
        </span>

        <div style={{ margin: "26px 0 8px" }}>
          <Tape
            words={["see you soon", "don't be late (jk)", "the plan stays secret", "bring your smile"]}
            tilt={2}
            tone="lime"
            reduceMotion={reduceMotion}
          />
        </div>

        <div className="di-cd-grid">
          {/* ── Where to go. The one location this phase is allowed to know ── */}
          <section
            style={{
              background: PAPER,
              color: INK,
              borderRadius: 26,
              padding: "20px 18px 20px",
              boxShadow: "0 30px 60px -30px rgba(0,0,0,.7)",
              transform: reduceMotion ? undefined : "rotate(-0.6deg)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 20 }}>📍</span>
              <span style={{ fontFamily: GROTESK, fontSize: 18, fontWeight: 800, letterSpacing: "-0.01em" }}>
                meet me here
              </span>
            </div>
            <PlaceBlock point={view.meetingPoint} seed={`meeting:${view.startsAt}`} height={150} />
          </section>

          {/* ── Prep ───────────────────────────────────────────────────── */}
          <Glass style={{ padding: "20px 18px" }}>
            <Eyebrow>before you come</Eyebrow>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
              {facts.map((f) => (
                <div
                  key={f.label}
                  className="di-chip"
                  style={{ borderRadius: 16, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)", padding: "10px 12px", minWidth: 0 }}
                >
                  <div style={{ fontSize: 17 }}>{f.emoji}</div>
                  <div style={{ marginTop: 4, fontFamily: GROTESK, fontSize: 10, fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase", color: MOON_FAINT }}>
                    {f.label}
                  </div>
                  <div style={{ marginTop: 2, fontFamily: GROTESK, fontSize: 14, fontWeight: 700, color: MOON, overflowWrap: "anywhere" }}>
                    {f.value}
                  </div>
                </div>
              ))}
            </div>

            <Eyebrow style={{ marginTop: 20 }}>checklist · tap to tick</Eyebrow>
            <ul style={{ listStyle: "none", margin: "10px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {PREP.map((p, i) => {
                const on = !!ticked[i];
                return (
                  <li key={i}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => setTicked((t) => ({ ...t, [i]: !t[i] }))}
                      className="di-ghost"
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 12,
                        textAlign: "left",
                        padding: "12px 14px",
                        borderRadius: 16,
                        border: `1px solid ${on ? "rgba(216,255,92,.5)" : "rgba(255,255,255,.12)"}`,
                        background: on ? "rgba(216,255,92,.1)" : "rgba(255,255,255,.04)",
                        color: MOON,
                        cursor: "pointer",
                        minHeight: 48,
                      }}
                    >
                      <span
                        aria-hidden
                        style={{
                          flexShrink: 0,
                          width: 24,
                          height: 24,
                          borderRadius: 8,
                          display: "grid",
                          placeItems: "center",
                          background: on ? "#d8ff5c" : "transparent",
                          border: on ? "none" : "2px solid rgba(255,255,255,.3)",
                          color: "#1a0d26",
                          fontWeight: 900,
                          fontSize: 14,
                        }}
                      >
                        {on ? "✓" : ""}
                      </span>
                      <span
                        style={{
                          fontFamily: GROTESK,
                          fontSize: 14.5,
                          lineHeight: 1.45,
                          fontWeight: 500,
                          textDecoration: on ? "line-through" : "none",
                          opacity: on ? 0.6 : 1,
                        }}
                      >
                        <span aria-hidden style={{ marginRight: 6 }}>{p.emoji}</span>
                        {p.text}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* ── Share the plan. Ordinary and useful — the thing she'd text a
                friend anyway. No warning triangle, no safety banner. */}
            <GhostButton onClick={() => setSharing(true)} style={{ marginTop: 16 }}>
              <span aria-hidden>🔗</span> share this plan with a friend
            </GhostButton>
          </Glass>
        </div>

        <p style={{ margin: "22px 0 0", textAlign: "center", fontFamily: ITALIC, fontStyle: "italic", fontSize: 20, color: MOON_SOFT }}>
          — {view.senderName}
        </p>
      </div>

      <SharePlanSheet view={view} open={sharing} onClose={() => setSharing(false)} />
    </main>
  );
}
