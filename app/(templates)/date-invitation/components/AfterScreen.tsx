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
  GRAD,
  GROTESK,
  INK,
  ITALIC,
  LIME,
  MOON,
  MOON_FAINT,
  MOON_SOFT,
  PAPER,
  fmtDateLong,
  fmtTime,
} from "./dateTheme";
import Memories from "./Memories";
import { ShareCardPanel } from "./ShareCard";
import { totalTimeTogether, type DateInviteData, type Memory, type StopView } from "./types";
import { Eyebrow, Glass, GradText } from "./NightKit";

const CSS = `
.di-after { position: relative; z-index: 1; margin: 0 auto; width: 100%; max-width: 480px; padding: 88px 16px 72px; }
.di-after-grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: 18px; margin-top: 24px; }
.di-after-grid > * { min-width: 0; }
.di-after-stats { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); gap: 10px; }
@media (min-width: 640px) { .di-after { max-width: 620px; padding-top: 104px; } }
@media (min-width: 960px) {
  .di-after { max-width: 1040px; }
  .di-after-grid { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 24px; align-items: start; }
}
`;

export interface AfterScreenProps {
  data: DateInviteData;
  /** From `buildItinerary(data, "after")` — every entry is `passed`. */
  itinerary: StopView[];
  memories: Memory[];
  maxMemories: number;
  /** Who is looking, for "add" and "remove mine". null while unknown. */
  me: "sender" | "recipient" | null;
  onAddMemory: (file: File, stopId: string, title: string) => Promise<string | null>;
  onRemoveMemory: (id: string) => Promise<void>;
  reduceMotion: boolean;
}


export default function AfterScreen({
  data,
  itinerary,
  memories,
  maxMemories,
  me,
  onAddMemory,
  onRemoveMemory,
  reduceMotion,
}: AfterScreenProps) {
  const total = totalTimeTogether(data);
  const dateLabel = fmtDateLong(data.startsAt);
  const count = itinerary.length;

  return (
    <div className="di-after">
      <style>{CSS}</style>

      <header className={`text-center ${reduceMotion ? "" : "di-pop-in"}`}>
        <Eyebrow>
          {data.recipientName} &amp; {data.senderName}
          {dateLabel ? ` · ${dateLabel}` : ""}
        </Eyebrow>
        <h1
          className="mt-3"
          style={{
            fontFamily: GROTESK,
            fontWeight: 800,
            fontSize: "clamp(40px, 11vw, 80px)",
            lineHeight: 0.95,
            letterSpacing: "-0.04em",
            color: MOON,
          }}
        >
          that was <GradText>a night</GradText>{" "}
          <span className={reduceMotion ? "" : "di-float"} style={{ display: "inline-block" }}>
            ✨
          </span>
        </h1>
        <p className="mt-3" style={{ fontFamily: ITALIC, fontStyle: "italic", fontSize: 21, color: MOON_SOFT }}>
          officially a core memory
        </p>
      </header>

      <div className="di-after-grid">
        <div className="flex flex-col gap-[18px]">
          {/* ── Time together ─────────────────────────────────────────── */}
          <div className="di-after-stats">
            <div
              className="rounded-[24px] px-5 py-5"
              style={{ background: GRAD, color: "#fff", boxShadow: "0 24px 50px -24px rgba(255,79,139,.9)" }}
            >
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em]" style={{ fontFamily: GROTESK, opacity: 0.9 }}>
                time together
              </p>
              <p
                className="mt-2 leading-none"
                style={{ fontFamily: GROTESK, fontWeight: 800, fontSize: "clamp(34px, 10vw, 48px)", letterSpacing: "-0.04em" }}
              >
                {total}
              </p>
            </div>
            <div
              className="flex flex-col justify-center rounded-[24px] px-4 py-4"
              style={{ background: LIME, color: "#1a0d26", transform: "rotate(2deg)" }}
            >
              <p className="text-[34px] font-extrabold leading-none" style={{ fontFamily: GROTESK, letterSpacing: "-0.04em" }}>
                {count}/{count}
              </p>
              <p className="mt-1 text-[12px] font-bold leading-tight" style={{ fontFamily: GROTESK }}>
                {count === 1 ? "stop" : "stops"}, all of them ✓
              </p>
            </div>
          </div>

          {/* ── The completed route ─────────────────────────────────────── */}
          {count > 0 && (
            <Glass style={{ padding: "18px 16px" }}>
              <Eyebrow>🗺️ the route</Eyebrow>
              <ol className="mt-4 list-none p-0">
                {itinerary.map((stop, i) => (
                  <RouteRow key={stop.id} stop={stop} index={i} last={i === count - 1} />
                ))}
              </ol>
            </Glass>
          )}

          {/* ── The last word ─────────────────────────────────────────── */}
          {data.closingLine && (
            <figure className="px-2 py-4 text-center">
              <blockquote
                style={{
                  fontFamily: ITALIC,
                  fontStyle: "italic",
                  fontSize: "clamp(24px, 6.4vw, 32px)",
                  lineHeight: 1.3,
                  color: MOON,
                  overflowWrap: "anywhere",
                }}
              >
                &ldquo;{data.closingLine}&rdquo;
              </blockquote>
              {data.senderName && (
                <figcaption className="mt-3 text-[14px] font-bold" style={{ color: "#ffb3cc", fontFamily: GROTESK }}>
                  — {data.senderName} 🤍
                </figcaption>
              )}
            </figure>
          )}
        </div>

        <div className="flex flex-col gap-[18px]">
          {/* ── Four photos from the night ──────────────────────────────────────────────────── */}
          <section className="rounded-[26px] px-4 pb-5 pt-1" style={{ background: PAPER, color: INK, boxShadow: "0 30px 60px -30px rgba(0,0,0,.7)" }}>
            <Memories
              memories={memories}
              stops={itinerary.filter((s) => s.state === "passed").map((s) => ({ id: s.id, name: s.state === "passed" ? s.name : "" }))}
              max={maxMemories}
              me={me}
              senderName={data.senderName}
              recipientName={data.recipientName}
              onAdd={onAddMemory}
              onRemove={onRemoveMemory}
              reduceMotion={reduceMotion}
            />
          </section>

          {/* ── The share card ──────────────────────────────────────────── */}
          <section className="rounded-[26px] px-4 py-5" style={{ background: PAPER, color: INK, boxShadow: "0 30px 60px -30px rgba(0,0,0,.7)" }}>
            <p className="mb-3 text-center text-[18px] font-extrabold" style={{ fontFamily: GROTESK, letterSpacing: "-0.01em" }}>
              save the night 📸
            </p>
            <ShareCardPanel data={data} itinerary={itinerary} />
          </section>
        </div>
      </div>
    </div>
  );
}

/**
 * One line of the completed route. Every entry from `buildItinerary(data,
 * "after")` is `passed`; the other two states render as nothing rather than
 * being assumed away with a cast.
 */
function RouteRow({ stop, index, last }: { stop: StopView; index: number; last: boolean }) {
  if (stop.state !== "passed") return null;
  const at = fmtTime(stop.arrivedAt);

  return (
    <li className="relative flex gap-3">
      {!last && (
        <span
          aria-hidden
          className="absolute"
          style={{ left: 13, top: 30, bottom: -2, width: 2, background: LIME, opacity: 0.45 }}
        />
      )}
      <span
        aria-hidden
        className="relative z-[1] grid shrink-0 place-items-center rounded-full text-[12px] font-extrabold"
        style={{ width: 28, height: 28, background: LIME, color: "#1a0d26", fontFamily: GROTESK }}
      >
        {index + 1}
      </span>
      <div className={`min-w-0 flex-1 ${last ? "pb-0" : "pb-4"}`}>
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 pt-1">
          <p
            className="min-w-0 flex-1 text-[15.5px] font-bold leading-[1.35]"
            style={{ color: MOON, fontFamily: GROTESK, overflowWrap: "anywhere" }}
          >
            {stop.name}
          </p>
          {/* "" is the frozen contract's marker for "nobody tapped". */}
          {at && (
            <span className="shrink-0 text-[13px] font-semibold" style={{ color: MOON_FAINT, fontFamily: GROTESK }}>
              {at}
            </span>
          )}
        </div>
      </div>
    </li>
  );
}
