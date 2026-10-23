"use client";

// ─── The functions: a stationery suite of ivory cards ───────────────────────
// Each function is its own little card from the suite: a calendar leaf with
// the day and month in rose gold, the name in script, a gold line-art swirl
// (template8) blooming in the corner, then the time, the venue, a dress-code
// swatch, the note, directions and add-to-calendar (.ics + Google). The main
// ceremony's card is crowned with a rose bouquet. "Save all dates" closes it.
// Phones: one column; tablets two; desktops three. All corners equally round.

import { useState } from "react";
import { DEFAULT_TZ_OFFSET, Reveal, downloadWeddingIcs, formatEventTime, googleCalendarUrl, mapLink, type WeddingEvent } from "../../../_wedding";
import { A, img } from "./assets";
import { DATE_RE, MAIN_RE } from "./model";

function Icon({ d }: { d: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}
export const PIN = "M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21zM12 12.2a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2z";
export const CAL = "M7 3v3M17 3v3M4 8.5h16M5 5.5h14a1 1 0 0 1 1 1V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1zM8.5 13h3v3h-3z";
const CLOCK = "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7.5V12l3 2";

function leaf(date: string, locale: string) {
  if (!DATE_RE.test(date)) return null;
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12));
  return {
    day: String(d),
    month: dt.toLocaleDateString(locale, { month: "short", timeZone: "UTC" }).replace(/\.$/, ""),
    weekday: dt.toLocaleDateString(locale, { weekday: "long", timeZone: "UTC" }),
  };
}

export interface EventsProps {
  events: readonly WeddingEvent[];
  couple: string;
  url?: string;
  locale: string;
  labels: { directions: string; calendar: string; saveAll: string; dress: string; tba: string; saved: string };
}

export default function Events({ events, couple, url, locale, labels: l }: EventsProps) {
  const [flash, setFlash] = useState<string | null>(null);
  const list = events.filter((e) => e.title || e.venue || e.date);
  if (!list.length) return null;
  const mainId = (list.find((e) => MAIN_RE.test(e.title)) ?? list[0]).id;
  const save = (es: readonly WeddingEvent[], key: string, name: string) => {
    const ok = downloadWeddingIcs(es, { couple, url, tz: DEFAULT_TZ_OFFSET }, name);
    setFlash(ok ? key : `${key}:err`);
    window.setTimeout(() => setFlash(null), 2200);
  };
  return (
    <div className="cw-evs">
      <ol className={`cw-ev-grid n-${Math.min(list.length, 3)}`}>
        {list.map((e, i) => {
          const lf = leaf(e.date, locale);
          const time = formatEventTime(e.time, locale);
          const end = formatEventTime(e.endTime, locale);
          const map = mapLink(e);
          const key = e.id || String(i);
          const swatch = e.dressColor && /^#[0-9a-f]{3,8}$/i.test(e.dressColor) ? e.dressColor : null;
          const gcal = e.date ? googleCalendarUrl(e, { couple, url, tz: DEFAULT_TZ_OFFSET }) : "";
          const isMain = e.id === mainId;
          return (
            <Reveal as="li" key={key} className={`cw-ev${isMain ? " is-main" : ""}`} delay={(i % 3) * 90}>
              <article className="cw-ev-card">
                {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                <img className="cw-ev-swirl" {...img(A.swirl, { lazy: true })} aria-hidden />
                {isMain && (
                  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
                  <img className="cw-ev-roses" {...img(A.roses, { lazy: true })} aria-hidden />
                )}
                <div className="cw-ev-head">
                  {lf ? (
                    <span className="cw-ev-leaf" aria-hidden>
                      <b>{lf.day}</b>
                      <small>{lf.month}</small>
                    </span>
                  ) : (
                    <span className="cw-ev-leaf is-empty" aria-hidden>
                      <b>{String(i + 1).padStart(2, "0")}</b>
                    </span>
                  )}
                  <div className="cw-ev-titles">
                    {lf && <p className="cw-ev-wd">{lf.weekday}</p>}
                    <h3 className="cw-ev-title">{e.title}</h3>
                  </div>
                </div>
                <div className="cw-ev-body">
                  <p className="cw-ev-line">
                    <Icon d={CLOCK} />
                    <span>{time ? `${time}${end ? ` – ${end}` : ""}` : l.tba}</span>
                  </p>
                  {(e.venue || e.address) && (
                    <p className="cw-ev-line">
                      <Icon d={PIN} />
                      <span>
                        {e.venue && <b>{e.venue}</b>}
                        {e.address && <span className="cw-ev-addr">{e.address}</span>}
                      </span>
                    </p>
                  )}
                  {e.dressCode && (
                    <p className="cw-ev-line cw-ev-dress">
                      {swatch ? <span className="cw-ev-swatch" style={{ background: swatch }} aria-hidden /> : <Icon d="M8 3l4 3 4-3 4 4-3 3v11H7V10L4 7z" />}
                      <span>
                        <span className="cw-ev-k">{l.dress}</span> {e.dressCode}
                      </span>
                    </p>
                  )}
                  {e.note && <p className="cw-ev-note">{e.note}</p>}
                </div>
                {(map || e.date) && (
                  <div className="cw-ev-actions">
                    {map && (
                      <a className="cw-btn cw-btn-ghost cw-btn-sm" href={map} target="_blank" rel="noopener noreferrer">
                        <Icon d={PIN} /> {l.directions}
                      </a>
                    )}
                    {e.date && (
                      <button type="button" className="cw-btn cw-btn-ghost cw-btn-sm" onClick={() => save([e], key, `${e.title || "event"}-${couple}`)}>
                        <Icon d={CAL} /> {flash === key ? l.saved : l.calendar}
                      </button>
                    )}
                    {gcal && (
                      <a className="cw-btn cw-btn-ghost cw-btn-sm" href={gcal} target="_blank" rel="noopener noreferrer" aria-label={`Google Calendar: ${e.title}`}>
                        Google
                      </a>
                    )}
                  </div>
                )}
              </article>
            </Reveal>
          );
        })}
      </ol>
      {list.filter((e) => e.date).length > 1 && (
        <Reveal className="cw-ev-all">
          <button type="button" className="cw-btn cw-btn-rose" onClick={() => save(list, "all", `wedding-${couple}`)}>
            <Icon d={CAL} /> {flash === "all" ? l.saved : l.saveAll}
          </button>
        </Reveal>
      )}
    </div>
  );
}
