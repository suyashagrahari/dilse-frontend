"use client";

// ─── The functions: a dotted carousel of compact cards ───────────────────────
// Each function is an ivory rounded card with the couple dressed for it
// (haldi yellow, mehendi orange, sangeet dancing, wedding red, reception
// tux-and-gown, engagement ivory) standing on a terracotta carpet in a warm
// alcove. Under it: the date, title, time, venue, a dress-code swatch, the
// note and directions. The cards sit on a horizontal rail that snaps one card
// to the centre on phones (as the royal invitation's functions): swipe or the
// dots underneath. Tablets and up lay the cards out as a centred grid, two
// across then three. The couple sways gently while its card is on screen.

import { useEffect, useRef, useState } from "react";
import { Reveal, formatEventDate, formatEventTime, mapLink, type WeddingEvent } from "../../../_wedding";
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
  labels: { directions: string; dress: string; tba: string; nav: string };
}

export default function Events({ events, locale, labels: l }: EventsProps) {
  const [at, setAt] = useState(0);
  const railRef = useRef<HTMLOListElement>(null);
  const list = events.filter((e) => e.title || e.venue || e.date);

  // Which card the rail rests on (the dots, the arrows): the one whose centre is nearest the rail's.
  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const kids = Array.from(el.children) as HTMLElement[];
      if (!kids.length) return;
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
  /** Centre card i in the rail. */
  const go = (i: number) => {
    const el = railRef.current;
    const k = el?.children[Math.max(0, Math.min(list.length - 1, i))] as HTMLElement | undefined;
    if (el && k) el.scrollTo({ left: k.offsetLeft - el.offsetLeft - (el.clientWidth - k.offsetWidth) / 2, behavior: "smooth" });
  };
  const many = list.length > 1;
  return (
    // One reveal for the whole rail: per-card reveals never fire for cards parked off-screen in the rail.
    <Reveal className={`pd-evs${many ? "" : " is-one"}`}>
      <div className="pd-ev-wrap">
        {many && (
          <button type="button" className="pd-ev-arrow is-prev" onClick={() => go(at - 1)} disabled={at === 0} aria-label="Previous">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
        )}
        <ol ref={railRef} className="pd-ev-grid">
          {list.map((e, i) => {
            const date = formatEventDate(e.date, locale);
            const time = formatEventTime(e.time, locale);
            const end = formatEventTime(e.endTime, locale);
            const map = mapLink(e);
            const swatch = e.dressColor && /^#[0-9a-f]{3,8}$/i.test(e.dressColor) ? e.dressColor : null;
            const art = coupleFor(e.title, i);
            return (
              <li key={e.id || i} className={`pd-ev${i === at ? " is-at" : ""}`}>
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
                    {map && (
                      <div className="pd-ev-actions">
                        <a className="pd-btn pd-btn-ghost" href={map} target="_blank" rel="noopener noreferrer">
                          <Icon d={PIN} /> {l.directions}
                        </a>
                      </div>
                    )}
                  </div>
                </article>
              </li>
            );
          })}
        </ol>
        {many && (
          <button type="button" className="pd-ev-arrow is-next" onClick={() => go(at + 1)} disabled={at === list.length - 1} aria-label="Next">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
      {many && (
        <div className="pd-ev-dots" role="group" aria-label={l.nav}>
          {list.map((e, i) => (
            <button key={e.id || i} type="button" className={i === at ? "is-on" : undefined} aria-label={e.title || String(i + 1)} aria-current={i === at || undefined} onClick={() => go(i)} />
          ))}
        </div>
      )}
    </Reveal>
  );
}
