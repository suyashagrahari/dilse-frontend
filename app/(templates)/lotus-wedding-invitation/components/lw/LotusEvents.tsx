"use client";

// ─── The functions: ivory cards with a date plate ────────────────────────────
// Each function is an ivory card under a rounded sage plate with its date (day,
// month, weekday), with a white-gold lotus piece growing from the corner (bud,
// pod, bloom or leaf in turn), then time, venue, a dress-code swatch, a note,
// and two actions: directions and WhatsApp. Phones: a rail that snaps one card
// to the centre with dots underneath; 2 columns at ≥700px, 3 at ≥1100px.

import { useEffect, useRef, useState } from "react";
import { Reveal, formatEventTime, mapLink, type WeddingEvent } from "../../../_wedding";
import { Btn, CLOCK, Icon, PIN, WA, openWhatsApp } from "./Actions";
import { img, type ArtKey } from "./art";
import { MAIN_RE } from "./model";

const SPRIGS: ArtKey[] = ["budA", "podB", "bloomStem", "leafStem", "budB", "podA"];

export interface LotusEventsProps {
  events: readonly WeddingEvent[];
  couple: string;
  locale: string;
  labels: { directions: string; dress: string; tba: string; whatsapp: string; nav: string };
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

export default function LotusEvents({ events, couple, locale, labels: l }: LotusEventsProps) {
  const [at, setAt] = useState(0);
  const railRef = useRef<HTMLOListElement>(null);
  const list = events.filter((e) => e.title || e.venue || e.date);

  // Phones: which card the rail rests on (the dots): the one whose centre is nearest the rail's.
  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const kids = Array.from(el.children) as HTMLElement[];
      const mid = el.scrollLeft + el.clientWidth / 2;
      let best = 0;
      let bestD = Infinity;
      kids.forEach((k, i) => {
        const d = Math.abs(k.offsetLeft - el.offsetLeft + k.offsetWidth / 2 - mid);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      });
      setAt(best);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [list.length]);

  if (!list.length) return null;
  const go = (i: number) => {
    const el = railRef.current;
    const k = el?.children[i] as HTMLElement | undefined;
    if (el && k) el.scrollTo({ left: k.offsetLeft - el.offsetLeft - (el.clientWidth - k.offsetWidth) / 2, behavior: "smooth" });
  };
  return (
    // One reveal for the whole rail: per-card reveals never fire for cards parked off-screen in it.
    <Reveal className="lw-evs">
      <ol ref={railRef} className="lw-ev-list">
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
            <li key={key} className={`lw-ev${isMain ? " is-main" : ""}${i === at ? " is-at" : ""}`}>
              <article className="lw-ev-card">
                {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                <img {...img(SPRIGS[i % SPRIGS.length], { lazy: true })} className="lw-ev-sprig" aria-hidden />
                <div className="lw-ev-plate">
                  {d ? (
                    <>
                      <span className="lw-ev-day">{d.day}</span>
                      <span className="lw-ev-mon">{d.month}</span>
                      <span className="lw-ev-wd">{d.weekday}</span>
                    </>
                  ) : (
                    <span className="lw-ev-mon">{l.tba}</span>
                  )}
                </div>
                <div className="lw-ev-body">
                  <h3 className="lw-ev-title">{e.title}</h3>
                  <p className="lw-ev-line">
                    <Icon d={CLOCK} />
                    <span>{time ? `${time}${end ? ` – ${end}` : ""}` : l.tba}</span>
                  </p>
                  {(e.venue || e.address) && (
                    <p className="lw-ev-line">
                      <Icon d={PIN} />
                      <span>
                        {e.venue && <b>{e.venue}</b>}
                        {e.address && <span className="lw-ev-addr">{e.address}</span>}
                      </span>
                    </p>
                  )}
                  {e.dressCode && (
                    <p className="lw-ev-line lw-ev-dress">
                      {swatch ? <span className="lw-ev-swatch" style={{ background: swatch }} aria-hidden /> : <Icon d="M8 4l4 3 4-3 4 4-3 3v9H7v-9L4 8z" />}
                      <span>
                        <span className="lw-ev-k">{l.dress}</span> {e.dressCode}
                      </span>
                    </p>
                  )}
                  {e.note && <p className="lw-ev-note">{e.note}</p>}
                  <div className="lw-ev-actions">
                    {map && (
                      <Btn href={map} icon={PIN} ghost className="is-sm">
                        {l.directions}
                      </Btn>
                    )}
                    <button type="button" className="lw-ev-wa" onClick={() => openWhatsApp(shareLine)} aria-label={`${l.whatsapp}: ${e.title}`}>
                      <Icon d={WA} fill size={16} /> <span>WhatsApp</span>
                    </button>
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ol>
      {list.length > 1 && (
        <div className="lw-ev-dots" role="group" aria-label={l.nav}>
          {list.map((e, i) => (
            <button key={e.id || i} type="button" className={i === at ? "is-on" : undefined} aria-label={e.title || String(i + 1)} aria-current={i === at || undefined} onClick={() => go(i)} />
          ))}
        </div>
      )}
    </Reveal>
  );
}
