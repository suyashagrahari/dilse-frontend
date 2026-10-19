"use client";
// ─── <EventsTimeline> — every function, with time, venue, dress code, map + calendar ─
//
//   <EventsTimeline events={extras.events} couple="Ananya & Rohan" calendar="main" mainEventId="wedding" />
//
// layout "timeline" (default): a gold line down the middle on desktop, down the
// left on phones, each event a card that rises in. "cards": a responsive grid.

import { useState } from "react";
import type { WeddingEvent } from "../types";
import { DEFAULT_TZ_OFFSET } from "../types";
import { downloadWeddingIcs, formatEventDate, formatEventTime, mapLink } from "../ics";
import { Reveal } from "../WeddingRoot";

export interface EventsTimelineProps {
  events: readonly WeddingEvent[];
  /** "Ananya & Rohan" — used in calendar titles. */
  couple: string;
  /** Add-to-calendar buttons: "all" = on every event + "Save all dates"; "main" = only on `mainEventId`; "none". */
  calendar?: "all" | "main" | "none";
  /** The event the "main" calendar button belongs to (default: the one titled like "Wedding", else the first). */
  mainEventId?: string;
  /** Link back to the invitation (in .ics descriptions). */
  url?: string;
  tz?: string;
  /** "en-IN" (default) or "hi-IN" for dates. */
  locale?: string;
  layout?: "timeline" | "cards";
  /** Show the dress-code colour swatch (Royal). Default true when an event has one. */
  showSwatch?: boolean;
  labels?: Partial<{ directions: string; calendar: string; saveAll: string; dress: string; tba: string }>;
}

const L = { directions: "Directions", calendar: "Add to calendar", saveAll: "Save all dates", dress: "Dress code", tba: "Time to be announced" };

function Icon({ d }: { d: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}
const PIN = "M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21zM12 12.2a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2z";
const CAL = "M7 3v3M17 3v3M4 8.5h16M5 5.5h14a1 1 0 0 1 1 1V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1zM8.5 13h3v3h-3z";
const CLOCK = "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7.5V12l3 2";

export function mainEventOf(events: readonly WeddingEvent[], id?: string): WeddingEvent | undefined {
  return events.find((e) => e.id === id) ?? events.find((e) => /wedding|vivah|शादी|विवाह|phere|pheras/i.test(e.title)) ?? events[0];
}

export default function EventsTimeline({
  events,
  couple,
  calendar = "main",
  mainEventId,
  url,
  tz = DEFAULT_TZ_OFFSET,
  locale = "en-IN",
  layout = "timeline",
  showSwatch,
  labels,
}: EventsTimelineProps) {
  const l = { ...L, ...labels };
  const main = mainEventOf(events, mainEventId);
  const [flash, setFlash] = useState<string | null>(null);
  const list = events.filter((e) => e.title || e.venue || e.date);
  if (!list.length) return null;

  const save = (es: readonly WeddingEvent[], key: string, name: string) => {
    const ok = downloadWeddingIcs(es, { couple, url, tz }, name);
    setFlash(ok ? key : `${key}:err`);
    window.setTimeout(() => setFlash(null), 2200);
  };

  return (
    <div className={`wk-events wk-events-${layout}`}>
      <ol className="wk-ev-list">
        {list.map((e, i) => {
          const date = formatEventDate(e.date, locale);
          const time = formatEventTime(e.time, locale);
          const end = formatEventTime(e.endTime, locale);
          const map = mapLink(e);
          const withCal = calendar === "all" || (calendar === "main" && main?.id === e.id);
          const swatch = (showSwatch ?? true) && e.dressColor && /^#[0-9a-f]{3,8}$/i.test(e.dressColor) ? e.dressColor : null;
          return (
            <Reveal as="li" key={e.id || i} delay={Math.min(i, 4) * 90} className={`wk-ev ${i % 2 ? "is-right" : "is-left"}`}>
              <span className="wk-ev-dot" aria-hidden />
              <article className="wk-card wk-foil-border wk-ev-card">
                {date && <p className="wk-eyebrow wk-ev-date">{date}</p>}
                <h3 className="wk-ev-title">{e.title}</h3>
                <p className="wk-ev-time">
                  <Icon d={CLOCK} />
                  {time ? `${time}${end ? ` – ${end}` : ""}` : l.tba}
                </p>
                {(e.venue || e.address) && (
                  <p className="wk-ev-venue">
                    <Icon d={PIN} />
                    <span>
                      {e.venue && <b>{e.venue}</b>}
                      {e.address && <span className="wk-ev-addr">{e.address}</span>}
                    </span>
                  </p>
                )}
                {e.dressCode && (
                  <p className="wk-ev-dress">
                    {swatch && <span className="wk-ev-swatch" style={{ background: swatch }} aria-hidden />}
                    <span>
                      <span className="wk-ev-k">{l.dress}</span> {e.dressCode}
                    </span>
                  </p>
                )}
                {e.note && <p className="wk-ev-note">{e.note}</p>}
                {(map || withCal) && (
                  <div className="wk-ev-actions">
                    {map && (
                      <a className="wk-btn wk-btn-ghost wk-btn-sm" href={map} target="_blank" rel="noopener noreferrer">
                        <Icon d={PIN} /> {l.directions}
                      </a>
                    )}
                    {withCal && e.date && (
                      <button type="button" className="wk-btn wk-btn-ghost wk-btn-sm" onClick={() => save([e], e.id || String(i), `${e.title || "event"}-${couple}`)}>
                        <Icon d={CAL} /> {flash === (e.id || String(i)) ? "Saved ✓" : l.calendar}
                      </button>
                    )}
                  </div>
                )}
              </article>
            </Reveal>
          );
        })}
      </ol>
      {calendar === "all" && list.filter((e) => e.date).length > 1 && (
        <div className="wk-ev-all">
          <button type="button" className="wk-btn" onClick={() => save(list, "all", `wedding-${couple}`)}>
            <Icon d={CAL} /> {flash === "all" ? "Saved ✓" : l.saveAll}
          </button>
        </div>
      )}
    </div>
  );
}
