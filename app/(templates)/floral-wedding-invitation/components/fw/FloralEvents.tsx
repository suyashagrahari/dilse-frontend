"use client";

// ─── The functions: a suite of stationery cards ─────────────────────────────
// Each function is its own card from the suite: an arched window washed in
// watercolour with a vignette picked from its title (haldi = marigold pots,
// mehendi = banana leaves, sangeet = the peacock, baraat = the umbrella
// bearer, the pheras = the floral drape, reception = the couple, roka = a
// peony bouquet…), then the date, time, venue, a dress-code swatch, a note and
// three actions (directions, calendar, WhatsApp). Cards unfold on scroll
// (rotateX from the top edge, staggered). One column on phones, two from
// 720 px, three from 1280 px.

import { useState } from "react";
import { DEFAULT_TZ_OFFSET, Reveal, downloadWeddingIcs, formatEventDate, formatEventTime, mapLink, type WeddingEvent } from "../../../_wedding";
import { pic, type ArtRole } from "./art";
import { waLink } from "./guest";
import { MAIN_RE } from "./model";

const VIGNETTES: [RegExp, ArtRole][] = [
  [/haldi|pithi|ubtan|tel ban|mayra|हल्दी/i, "marigoldPots"],
  [/mehendi|mehndi|henna|मेहंदी/i, "banana"],
  [/sangeet|garba|dandiya|music|dance|cocktail|संगीत/i, "peacock"],
  [/baraat|barat|procession|ghudchadi|sehra|milni|बारात/i, "umbrella"],
  [/reception|dinner|party|gala|banquet|स्वागत/i, "coupleStanding"],
  [/tilak|roka|engagement|sagai|ring|सगाई/i, "peonyPink"],
  [/puja|pooja|path|havan|chowki|पूजा/i, "garland"],
  [MAIN_RE, "drapeSm"],
];
const vignetteFor = (title: string): ArtRole => VIGNETTES.find(([re]) => re.test(title))?.[1] ?? "roses";

export function Icon({ d }: { d: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}
export const PIN = "M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21zM12 12.2a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2z";
export const CAL = "M7 3v3M17 3v3M4 8.5h16M5 5.5h14a1 1 0 0 1 1 1V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1zM8.5 13h3v3h-3z";
const CLOCK = "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7.5V12l3 2";
export const WA =
  "M12 3.2a8.8 8.8 0 0 0-7.6 13.2L3.2 20.8l4.5-1.2A8.8 8.8 0 1 0 12 3.2zM8.6 8.4c.2-.4.4-.4.7-.4h.5c.2 0 .4 0 .6.5l.7 1.6c.1.2.1.4 0 .5-.4.8-.8.8-.6 1.2a6 6 0 0 0 2.9 2.5c.2.1.4.1.5-.1l.7-.9c.2-.2.4-.2.6-.1l1.5.7c.3.1.5.2.5.3 0 .3 0 .8-.2 1.1-.3.5-1 .9-1.6 1-.8.2-1.4.1-2.9-.5a10.4 10.4 0 0 1-4-3.5 4.6 4.6 0 0 1-1-2.4c0-.8.3-1.3.6-1.5z";

export function WaGlyph() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d={WA} />
    </svg>
  );
}

export interface FloralEventsProps {
  events: readonly WeddingEvent[];
  couple: string;
  url?: string;
  locale: string;
  labels: { directions: string; calendar: string; saveAll: string; dress: string; tba: string; whatsapp: string; saved: string };
}

export default function FloralEvents({ events, couple, url, locale, labels: l }: FloralEventsProps) {
  const [flash, setFlash] = useState<string | null>(null);
  const list = events.filter((e) => e.title || e.venue || e.date);
  if (!list.length) return null;
  const save = (es: readonly WeddingEvent[], key: string, name: string) => {
    const ok = downloadWeddingIcs(es, { couple, url, tz: DEFAULT_TZ_OFFSET }, name);
    setFlash(ok ? key : `${key}:err`);
    window.setTimeout(() => setFlash(null), 2200);
  };
  return (
    <div className="fw-evs">
      <ol className="fw-ev-list">
        {list.map((e, i) => {
          const date = formatEventDate(e.date, locale);
          const time = formatEventTime(e.time, locale);
          const end = formatEventTime(e.endTime, locale);
          const map = mapLink(e);
          const key = e.id || String(i);
          const swatch = e.dressColor && /^#[0-9a-f]{3,8}$/i.test(e.dressColor) ? e.dressColor : null;
          const art = vignetteFor(e.title);
          const waText = [`${e.title} · ${couple}`, [date, time].filter(Boolean).join(", "), e.venue, url].filter(Boolean).join("\n");
          return (
            <Reveal as="li" key={key} effect="rise" delay={(i % 3) * 110} className="fw-ev fw-fold">
              <article className="fw-ev-card">
                <div className={`fw-ev-art is-${art}`} aria-hidden>
                  <span className="fw-ev-win">
                    {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                    <img className="fw-ev-wash" {...pic("cloudWashSm", { lazy: true })} />
                    {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                    <img className="fw-ev-img" {...pic(art, { lazy: true, sizes: "220px" })} />
                  </span>
                  <span className="fw-ev-no">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <div className="fw-ev-body">
                  {date && <p className="fw-ev-date">{date}</p>}
                  <h3 className="fw-ev-title">{e.title}</h3>
                  <p className="fw-ev-line">
                    <Icon d={CLOCK} />
                    <span>{time ? `${time}${end ? ` – ${end}` : ""}` : l.tba}</span>
                  </p>
                  {(e.venue || e.address) && (
                    <p className="fw-ev-line">
                      <Icon d={PIN} />
                      <span>
                        {e.venue && <b>{e.venue}</b>}
                        {e.address && <span className="fw-ev-addr">{e.address}</span>}
                      </span>
                    </p>
                  )}
                  {e.dressCode && (
                    <p className="fw-ev-line fw-ev-dress">
                      <span className={`fw-ev-swatch${swatch ? "" : " is-none"}`} style={swatch ? { background: swatch } : undefined} aria-hidden />
                      <span>
                        <span className="fw-ev-k">{l.dress}</span> {e.dressCode}
                      </span>
                    </p>
                  )}
                  {e.note && <p className="fw-ev-note">{e.note}</p>}
                  <div className="fw-ev-actions">
                    {map && (
                      <a className="fw-chip" href={map} target="_blank" rel="noopener noreferrer">
                        <Icon d={PIN} /> {l.directions}
                      </a>
                    )}
                    {e.date && (
                      <button type="button" className="fw-chip" onClick={() => save([e], key, `${e.title || "event"}-${couple}`)}>
                        <Icon d={CAL} /> {flash === key ? `${l.saved} ✓` : l.calendar}
                      </button>
                    )}
                    <a className="fw-chip fw-chip-icon" href={waLink(waText)} target="_blank" rel="noopener noreferrer" aria-label={`${l.whatsapp}: ${e.title}`}>
                      <WaGlyph />
                    </a>
                  </div>
                </div>
              </article>
            </Reveal>
          );
        })}
      </ol>
      {list.filter((e) => e.date).length > 1 && (
        <Reveal className="fw-ev-all">
          <button type="button" className="wk-btn fw-btn" onClick={() => save(list, "all", `wedding-${couple}`)}>
            <Icon d={CAL} /> {flash === "all" ? `${l.saved} ✓` : l.saveAll}
          </button>
        </Reveal>
      )}
    </div>
  );
}
