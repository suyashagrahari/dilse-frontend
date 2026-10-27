"use client";

// ─── The functions: a carousel of durbar stages, one per celebration ────────
// Each function stands in its own pointed palace arch glowing in the
// function's colour (turmeric for the haldi, henna green for the mehndi,
// coral for the sangeet, periwinkle for the reception, rose for the wedding),
// with the couple dressed for it (template14) on a terracotta carpet, the date
// on a gold calendar leaf and the number in the corner. Below: the name (in
// Hindi on the Hindi page when it is a known function), time, venue, dress
// code, note and directions.
// One horizontal rail on every screen, the active card centred with its
// neighbours peeking in at the sides (smaller, softer); a swipe or a wheel
// settles the nearest card in the centre (scroll-snap center). Arrows on wide
// screens, dots everywhere; the whole section fits one screen.

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { FN_TINT, Reveal, fnTitle, kindOf, formatEventDate, formatEventTime, hiTime, mapLink, type WeddingEvent } from "../../../_wedding";
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
const CLOCK = "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7.5V12l3 2";

export interface EventsProps {
  events: readonly WeddingEvent[];
  locale: string;
  lang: "en" | "hi";
  labels: { directions: string; dress: string; tba: string; swipe: string };
}

export default function Events({ events, locale, lang, labels: l }: EventsProps) {
  const [at, setAt] = useState(0);
  const [edge, setEdge] = useState<{ start: boolean; end: boolean }>({ start: true, end: false });
  const railRef = useRef<HTMLOListElement>(null);
  const list = events.filter((e) => e.title || e.venue || e.date);

  // Which card the rail rests on (the dots) and whether either end is reached (the arrows).
  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const kids = Array.from(el.children) as HTMLElement[];
      if (!kids.length) return;
      // The active card is the one whose centre is nearest the rail's centre.
      const mid = el.scrollLeft + el.clientWidth / 2;
      let best = 0;
      kids.forEach((k, i) => {
        const c = k.offsetLeft - el.offsetLeft + k.offsetWidth / 2;
        const cb = kids[best].offsetLeft - el.offsetLeft + kids[best].offsetWidth / 2;
        if (Math.abs(c - mid) < Math.abs(cb - mid)) best = i;
      });
      setAt(best);
      setEdge({ start: best === 0, end: best === kids.length - 1 });
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
  /** Centre card i in the rail. */
  const go = (i: number) => {
    const el = railRef.current;
    const k = el?.children[Math.max(0, Math.min(list.length - 1, i))] as HTMLElement | undefined;
    if (el && k) el.scrollTo({ left: k.offsetLeft - el.offsetLeft - (el.clientWidth - k.offsetWidth) / 2, behavior: "smooth" });
  };
  const step = (dir: 1 | -1) => go(at + dir);
  return (
    <div className="rw-evs">
      <div className="rw-ev-wrap">
      {list.length > 1 && (
        <button type="button" className="rw-ev-arrow is-prev" onClick={() => step(-1)} disabled={edge.start} aria-label="Previous">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
      )}
      <ol ref={railRef} className={`rw-ev-grid n-${Math.min(list.length, 3)}`}>
        {list.map((e, i) => {
          const date = formatEventDate(e.date, locale);
          const time = lang === "hi" ? hiTime(e.time) : formatEventTime(e.time, locale);
          const end = lang === "hi" ? hiTime(e.endTime ?? "") : formatEventTime(e.endTime, locale);
          const title = fnTitle(e.title, lang);
          const map = mapLink(e);
          const key = e.id || String(i);
          const swatch = e.dressColor && /^#[0-9a-f]{3,8}$/i.test(e.dressColor) ? e.dressColor : null;
          const art = coupleFor(e.title, i);
          const kind = MAIN_RE.test(e.title) ? "wedding" : kindOf(e.title, i);
          const day = e.date ? new Date(`${e.date}T12:00:00Z`) : null;
          return (
            <Reveal as="li" key={key} className={`rw-ev is-${kind}`} delay={(i % 3) * 90} style={{ ["--fn" as string]: FN_TINT[kind] } as CSSProperties}>
              <article className={`rw-ev-card${i === at ? " is-active" : ""}`}>
                <div className="rw-ev-alcove" aria-hidden>
                  <span className="rw-ev-arch" />
                  {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                  <img className="rw-ev-carpet" {...img(A.carpet, { lazy: true })} />
                  {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                  <img className="rw-ev-couple" {...img(art, { lazy: true })} />
                  {day && (
                    <span className="rw-ev-leaf">
                      <b>{day.getUTCDate()}</b>
                      <small>{day.toLocaleDateString(locale, { month: "short", timeZone: "UTC" }).replace(/\.$/, "")}</small>
                    </span>
                  )}
                  <span className="rw-ev-no">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <div className="rw-ev-body">
                  {date && <p className="wk-eyebrow rw-ev-date">{date}</p>}
                  <h3 className="rw-ev-title" lang={title !== e.title ? "hi" : undefined}>{title}</h3>
                  <p className="rw-ev-line">
                    <Icon d={CLOCK} />
                    {time ? `${time}${end ? ` – ${end}` : ""}` : l.tba}
                  </p>
                  {(e.venue || e.address) && (
                    <p className="rw-ev-line">
                      <Icon d={PIN} />
                      <span>
                        {e.venue && <b>{e.venue}</b>}
                        {e.address && <span className="rw-ev-addr">{e.address}</span>}
                      </span>
                    </p>
                  )}
                  {e.dressCode && (
                    <p className="rw-ev-line rw-ev-dress">
                      {swatch && <span className="rw-ev-swatch" style={{ background: swatch }} aria-hidden />}
                      <span>
                        <span className="rw-ev-k">{l.dress}</span> {e.dressCode}
                      </span>
                    </p>
                  )}
                  {e.note && <p className="rw-ev-note">{e.note}</p>}
                  {map && (
                    <div className="rw-ev-actions">
                      <a className="rw-btn rw-btn-ghost" href={map} target="_blank" rel="noopener noreferrer">
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
        <button type="button" className="rw-ev-arrow is-next" onClick={() => step(1)} disabled={edge.end} aria-label="Next">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
      </div>
      {list.length > 1 && (
        <div className="rw-ev-dots" role="group" aria-label={l.swipe}>
          {list.map((e, i) => (
            <button key={e.id || i} type="button" className={i === at ? "is-on" : undefined} aria-label={fnTitle(e.title, lang)} aria-current={i === at || undefined} onClick={() => go(i)} />
          ))}
        </div>
      )}
    </div>
  );
}
