"use client";

// ─── The functions: a suite of stationery cards ─────────────────────────────
// Each function is its own card from the suite: an arched window washed in the
// faith's watercolour with a gold-foil medallion holding that function's line
// icon (the Laavan's Khanda, the Nikah's crescent, the chapel, the dhol for the
// Jaggo, the lantern for the Rukhsati…), then the date, time, venue, a
// dress-code swatch, a note and Directions. Cards unfold on scroll (rotateX
// from the top edge, staggered). Phones: a swipeable row (scroll-snap, every
// card centred) with dots under it. Two columns from 720 px, three from 1240 px.

import { useEffect, useRef, useState } from "react";
import { Reveal, formatEventDate, formatEventTime, mapLink, type WeddingEvent } from "../_wedding";
import { usePic } from "./art";
import type { FaithEventArt } from "./types";

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

export interface FaithEventsProps {
  events: readonly WeddingEvent[];
  locale: string;
  labels: { directions: string; dress: string; tba: string };
  icons: readonly FaithEventArt[];
}

export default function FaithEvents({ events, locale, labels: l, icons }: FaithEventsProps) {
  const pic = usePic();
  const list = events.filter((e) => e.title || e.venue || e.date);
  const row = useRef<HTMLOListElement>(null);
  const [at, setAt] = useState(0);

  // Which card the phone row is resting on (the dots follow it). Wider screens wrap, so this stays 0.
  useEffect(() => {
    const el = row.current;
    if (!el) return;
    let raf = 0;
    const read = () => {
      raf = 0;
      const first = el.firstElementChild as HTMLElement | null;
      if (!first) return;
      const step = first.offsetWidth + parseFloat(getComputedStyle(el).columnGap || "0");
      setAt(Math.max(0, Math.min(el.children.length - 1, Math.round(el.scrollLeft / step))));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const go = (i: number) => {
    const el = row.current;
    const card = el?.children[i] as HTMLElement | undefined;
    if (el && card) el.scrollTo({ left: card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2, behavior: "smooth" });
  };

  if (!list.length) return null;
  return (
    <div className="fw-evs">
      <ol ref={row} className="fw-ev-list">
        {list.map((e, i) => {
          const date = formatEventDate(e.date, locale);
          const time = formatEventTime(e.time, locale);
          const end = formatEventTime(e.endTime, locale);
          const map = mapLink(e);
          const key = e.id || String(i);
          const swatch = e.dressColor && /^#[0-9a-f]{3,8}$/i.test(e.dressColor) ? e.dressColor : null;
          const icon = (icons.find((x) => x.re.test(e.title)) ?? icons[i % icons.length]).icon;
          return (
            <Reveal as="li" key={key} effect="rise" delay={(i % 3) * 110} className="fw-ev fw-fold">
              <article className="fw-ev-card">
                <div className="fw-ev-art" aria-hidden>
                  <span className="fw-ev-win">
                    {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                    <img className="fw-ev-wash" {...pic("rsvpWash", { lazy: true, sizes: "300px" })} />
                    <span className="fw-ev-medal">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" focusable="false">
                        <path d={icon} />
                      </svg>
                    </span>
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
                  {map && (
                    <div className="fw-ev-actions">
                      <a className="fw-chip fw-ev-dir" href={map} target="_blank" rel="noopener noreferrer">
                        <Icon d={PIN} /> {l.directions}
                      </a>
                    </div>
                  )}
                </div>
              </article>
            </Reveal>
          );
        })}
      </ol>
      {list.length > 1 && (
        <div className="fw-ev-dots">
          {list.map((e, i) => (
            <button key={e.id || i} type="button" aria-label={e.title || String(i + 1)} aria-current={i === at ? "true" : undefined} className={i === at ? "is-on" : ""} onClick={() => go(i)} />
          ))}
        </div>
      )}
    </div>
  );
}
