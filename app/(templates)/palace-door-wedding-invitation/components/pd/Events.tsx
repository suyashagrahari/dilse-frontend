"use client";

// ─── The functions: one illustrated couple per function ──────────────────────
// Each function is an ivory rounded card with the couple dressed for it
// (haldi yellow, mehendi orange, sangeet dancing, wedding red, reception
// tux-and-gown, engagement ivory) standing on a terracotta carpet in a warm
// alcove. Under it: the date, time, venue, a dress-code swatch, the note,
// directions and add-to-calendar. "Save all dates" at the end. Phones: one
// column; tablets two; desktops three. Cards rise in with a stagger; the
// couple sways gently while the card is on screen.

import { useState } from "react";
import { DEFAULT_TZ_OFFSET, Reveal, downloadWeddingIcs, formatEventDate, formatEventTime, googleCalendarUrl, mapLink, type WeddingEvent } from "../../../_wedding";
import { A, img, type WeddingAsset } from "../assets";
import { MAIN_RE } from "./model";

const COUPLES: [RegExp, WeddingAsset][] = [
  [/haldi|pithi|ubtan|tel ban|mayra|हल्दी/i, A.coupleHaldi],
  [/mehendi|mehndi|henna|मेहंदी/i, A.coupleMehndi],
  [/sangeet|garba|dandiya|music|dance|संगीत/i, A.coupleSangeet],
  [/reception|cocktail|dinner|party|gala|banquet|स्वागत/i, A.coupleReception],
  [/tilak|roka|engagement|sagai|ring|mangni|सगाई/i, A.coupleEngagement],
  [MAIN_RE, A.coupleWedding],
  [/baraat|barat|procession|ghudchadi|sehra|milni|बारात/i, A.coupleWedding],
];
const ROTATION = [A.coupleEngagement, A.coupleHaldi, A.coupleMehndi, A.coupleSangeet, A.coupleWedding, A.coupleReception];
export const coupleFor = (title: string, i: number): WeddingAsset => COUPLES.find(([re]) => re.test(title))?.[1] ?? ROTATION[i % ROTATION.length];

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
  const save = (es: readonly WeddingEvent[], key: string, name: string) => {
    const ok = downloadWeddingIcs(es, { couple, url, tz: DEFAULT_TZ_OFFSET }, name);
    setFlash(ok ? key : `${key}:err`);
    window.setTimeout(() => setFlash(null), 2200);
  };
  return (
    <div className="pd-evs">
      <ol className={`pd-ev-grid n-${Math.min(list.length, 3)}`}>
        {list.map((e, i) => {
          const date = formatEventDate(e.date, locale);
          const time = formatEventTime(e.time, locale);
          const end = formatEventTime(e.endTime, locale);
          const map = mapLink(e);
          const key = e.id || String(i);
          const swatch = e.dressColor && /^#[0-9a-f]{3,8}$/i.test(e.dressColor) ? e.dressColor : null;
          const art = coupleFor(e.title, i);
          const gcal = e.date ? googleCalendarUrl(e, { couple, url, tz: DEFAULT_TZ_OFFSET }) : "";
          return (
            <Reveal as="li" key={key} className="pd-ev" delay={(i % 3) * 90}>
              <article className="pd-ev-card">
                <div className="pd-ev-alcove" aria-hidden>
                  <span className="pd-ev-glow" />
                  {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                  <img className="pd-ev-carpet" {...img(A.carpet, { lazy: true })} />
                  {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                  <img className="pd-ev-couple" {...img(art, { lazy: true })} />
                  <span className="pd-ev-no">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <div className="pd-ev-body">
                  {date && <p className="wk-eyebrow pd-ev-date">{date}</p>}
                  <h3 className="pd-ev-title">{e.title}</h3>
                  <p className="pd-ev-line">
                    <Icon d={CLOCK} />
                    {time ? `${time}${end ? ` – ${end}` : ""}` : l.tba}
                  </p>
                  {(e.venue || e.address) && (
                    <p className="pd-ev-line">
                      <Icon d={PIN} />
                      <span>
                        {e.venue && <b>{e.venue}</b>}
                        {e.address && <span className="pd-ev-addr">{e.address}</span>}
                      </span>
                    </p>
                  )}
                  {e.dressCode && (
                    <p className="pd-ev-line pd-ev-dress">
                      {swatch && <span className="pd-ev-swatch" style={{ background: swatch }} aria-hidden />}
                      <span>
                        <span className="pd-ev-k">{l.dress}</span> {e.dressCode}
                      </span>
                    </p>
                  )}
                  {e.note && <p className="pd-ev-note">{e.note}</p>}
                  {(map || e.date) && (
                    <div className="pd-ev-actions">
                      {map && (
                        <a className="pd-btn pd-btn-ghost" href={map} target="_blank" rel="noopener noreferrer">
                          <Icon d={PIN} /> {l.directions}
                        </a>
                      )}
                      {e.date && (
                        // One pill, two calendars: the .ics file (Apple, Outlook) and Google.
                        <span className="pd-ev-cal">
                          <button type="button" className="pd-btn pd-btn-ghost" onClick={() => save([e], key, `${e.title || "event"}-${couple}`)}>
                            <Icon d={CAL} /> {flash === key ? l.saved : l.calendar}
                          </button>
                          {gcal && (
                            <a className="pd-btn pd-btn-ghost" href={gcal} target="_blank" rel="noopener noreferrer" aria-label={`Google Calendar: ${e.title}`} title="Google Calendar">
                              Google
                            </a>
                          )}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </article>
            </Reveal>
          );
        })}
      </ol>
      {list.filter((e) => e.date).length > 1 && (
        <Reveal className="pd-ev-all">
          <button type="button" className="pd-btn pd-btn-gold" onClick={() => save(list, "all", `wedding-${couple}`)}>
            <Icon d={CAL} /> {flash === "all" ? l.saved : l.saveAll}
          </button>
        </Reveal>
      )}
    </div>
  );
}
