"use client";

// ─── The functions: ivory terrace cards with a powder-blue date plate ────────
// Each function is an ivory card (all four corners equally rounded) with a
// powder-blue plate carrying its date (day, month, weekday) and a watercolour
// sprig (cherry blossom, lotus or anthurium in turn) tucked into the corner,
// then time, venue, a dress-code swatch, a note and three actions: directions,
// add to calendar, WhatsApp. "Save all dates" sits underneath. 1 column on
// phones, 2 at ≥700px, 3 at ≥1100px.

import { useState } from "react";
import { DEFAULT_TZ_OFFSET, Reveal, downloadWeddingIcs, formatEventTime, googleCalendarUrl, mapLink, type WeddingEvent } from "../../../_wedding";
import { Btn, CAL, CLOCK, Icon, PIN, WA, openWhatsApp, pageUrl } from "./Actions";
import { img, type ArtKey } from "./art";
import { MAIN_RE } from "./model";

const SPRIGS: ArtKey[] = ["blossom", "lotus", "anthurium"];

export interface EventsProps {
  events: readonly WeddingEvent[];
  couple: string;
  locale: string;
  labels: { directions: string; calendar: string; calShort: string; gcal: string; saveAll: string; dress: string; tba: string; whatsapp: string };
}

function parts(date: string, locale: string) {
  const d = new Date(`${date}T12:00:00+05:30`);
  if (Number.isNaN(d.getTime())) return null;
  return {
    day: String(d.getDate()),
    month: d.toLocaleDateString(locale, { month: "short", timeZone: "Asia/Kolkata" }),
    weekday: d.toLocaleDateString(locale, { weekday: "long", timeZone: "Asia/Kolkata" }),
    full: d.toLocaleDateString(locale, { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }),
  };
}

export default function Events({ events, couple, locale, labels: l }: EventsProps) {
  const [flash, setFlash] = useState<string | null>(null);
  const list = events.filter((e) => e.title || e.venue || e.date);
  if (!list.length) return null;
  const save = (es: readonly WeddingEvent[], key: string, name: string) => {
    const ok = downloadWeddingIcs(es, { couple, url: pageUrl(), tz: DEFAULT_TZ_OFFSET }, name);
    setFlash(ok ? key : `${key}:err`);
    window.setTimeout(() => setFlash(null), 2200);
  };
  return (
    <div className="wp-evs">
      <ol className="wp-ev-list">
        {list.map((e, i) => {
          const d = e.date ? parts(e.date, locale) : null;
          const time = formatEventTime(e.time, locale);
          const end = formatEventTime(e.endTime, locale);
          const map = mapLink(e);
          const key = e.id || String(i);
          const swatch = e.dressColor && /^#[0-9a-f]{3,8}$/i.test(e.dressColor) ? e.dressColor : null;
          const isMain = MAIN_RE.test(e.title);
          const shareLine = `${e.title} · ${couple}${d ? ` · ${d.full}` : ""}${time ? `, ${time}` : ""}${e.venue ? ` · ${e.venue}` : ""}`;
          return (
            <Reveal as="li" key={key} effect="rise" delay={(i % 3) * 90} className={`wp-ev${isMain ? " is-main" : ""}`}>
              <article className="wp-ev-card">
                {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                <img {...img(SPRIGS[i % SPRIGS.length], { lazy: true })} className="wp-ev-sprig" aria-hidden />
                <div className="wp-ev-plate">
                  {d ? (
                    <>
                      <span className="wp-ev-day">{d.day}</span>
                      <span className="wp-ev-mon">{d.month}</span>
                      <span className="wp-ev-wd">{d.weekday}</span>
                    </>
                  ) : (
                    <span className="wp-ev-mon">{l.tba}</span>
                  )}
                </div>
                <div className="wp-ev-body">
                  <h3 className="wp-ev-title">{e.title}</h3>
                  <p className="wp-ev-line">
                    <Icon d={CLOCK} />
                    <span>{time ? `${time}${end ? ` – ${end}` : ""}` : l.tba}</span>
                  </p>
                  {(e.venue || e.address) && (
                    <p className="wp-ev-line">
                      <Icon d={PIN} />
                      <span>
                        {e.venue && <b>{e.venue}</b>}
                        {e.address && <span className="wp-ev-addr">{e.address}</span>}
                      </span>
                    </p>
                  )}
                  {e.dressCode && (
                    <p className="wp-ev-line wp-ev-dress">
                      {swatch ? <span className="wp-ev-swatch" style={{ background: swatch }} aria-hidden /> : <Icon d="M8 4l4 3 4-3 4 4-3 3v9H7v-9L4 8z" />}
                      <span>
                        <span className="wp-ev-k">{l.dress}</span> {e.dressCode}
                      </span>
                    </p>
                  )}
                  {e.note && <p className="wp-ev-note">{e.note}</p>}
                  <div className="wp-ev-actions">
                    {map && (
                      <Btn href={map} icon={PIN} ghost className="is-sm">
                        {l.directions}
                      </Btn>
                    )}
                    {e.date && (
                      <Btn icon={CAL} ghost className="is-sm" label={`${l.calendar}: ${e.title}`} onClick={() => save([e], key, `${e.title || "event"}-${couple}`)}>
                        {flash === key ? "Saved ✓" : l.calShort}
                      </Btn>
                    )}
                    {e.date && (
                      <a className="wp-ev-g" href={googleCalendarUrl(e, { couple, url: pageUrl(), tz: DEFAULT_TZ_OFFSET })} target="_blank" rel="noopener noreferrer" aria-label={`${e.title}: Google Calendar`}>
                        <Icon d={CAL} size={15} /> <span>{l.gcal}</span>
                      </a>
                    )}
                    <button type="button" className="wp-ev-wa" onClick={() => openWhatsApp(shareLine)} aria-label={`${l.whatsapp}: ${e.title}`}>
                      <Icon d={WA} fill size={16} /> <span>WhatsApp</span>
                    </button>
                  </div>
                </div>
              </article>
            </Reveal>
          );
        })}
      </ol>
      {list.filter((e) => e.date).length > 1 && (
        <Reveal className="wp-ev-all">
          <Btn icon={CAL} onClick={() => save(list.filter((e) => e.date), "all", `wedding-${couple}`)}>
            {flash === "all" ? "Saved ✓" : l.saveAll}
          </Btn>
        </Reveal>
      )}
    </div>
  );
}
