"use client";

// ─── The functions: garden cards, each with the couple dressed for it ────────
// Every function is a rounded card: the couple illustrated in that function's
// outfit (haldi in yellow, mehendi in orange, sangeet dancing, pheras in the red
// lehenga, reception in tux and gown …) on a wash of its dress-code colour, then
// the date, time, venue, dress-code swatch, note and Directions. The main
// function also gets "Watch live" when the sender added a livestream.
// Phones: a swipeable row (scroll-snap) with dots under it. Tablets: two
// columns. Wide screens: three.

import { useEffect, useRef, useState } from "react";
import { Reveal, formatEventDate, formatEventTime, mapLink, type WeddingEvent } from "../../../_wedding";
import { GW, gwImg, type WeddingAsset } from "../assets";
import { MAIN_RE } from "./model";
import { ICON, Icon } from "./ShareBar";

const COUPLES: [RegExp, WeddingAsset][] = [
  [/haldi|pithi|ubtan|tel ban|mayra|हल्दी/i, GW.coupleHaldi],
  [/mehendi|mehndi|henna|मेहंदी/i, GW.coupleMehendi],
  [/sangeet|garba|dandiya|music|dance|संगीत/i, GW.coupleSangeet],
  [/reception|dinner|gala|banquet|cocktail|party|after|स्वागत/i, GW.coupleReception],
  [/tilak|roka|engagement|sagai|ring|सगाई/i, GW.coupleEngagement],
  [/baraat|barat|procession|ghudchadi|sehra|milni|बारात/i, GW.coupleWedding],
  [MAIN_RE, GW.coupleWedding],
];
const FALLBACKS: WeddingAsset[] = [GW.coupleEngagement, GW.coupleReception, GW.coupleWedding];
const coupleFor = (title: string, i: number): WeddingAsset => COUPLES.find(([re]) => re.test(title))?.[1] ?? FALLBACKS[i % FALLBACKS.length];

export interface GardenEventsProps {
  events: readonly WeddingEvent[];
  locale: string;
  lang: "en" | "hi";
  mainId?: string;
  live?: { url: string; open: boolean; label: string; soon: string };
  labels: { directions: string; dress: string; tba: string };
}

export default function GardenEvents({ events, locale, lang, mainId, live, labels: l }: GardenEventsProps) {
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
    <div className="gw-evs">
      <ol ref={row} className="gw-ev-list">
        {list.map((e, i) => {
          const date = formatEventDate(e.date, locale);
          const time = formatEventTime(e.time, locale);
          const end = formatEventTime(e.endTime, locale);
          const map = mapLink(e);
          const key = e.id || String(i);
          const swatch = e.dressColor && /^#[0-9a-f]{3,8}$/i.test(e.dressColor) ? e.dressColor : null;
          const isMain = !!mainId && e.id === mainId;
          return (
            <Reveal as="li" key={key} effect="rise" delay={(i % 3) * 90} className={`gw-ev${isMain ? " is-main" : ""}`}>
              <article className="gw-ev-card" style={swatch ? { ["--gw-sw" as string]: swatch } : undefined}>
                <div className="gw-ev-art" aria-hidden>
                  <span className="gw-ev-wash" />
                  {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                  <img className="gw-ev-img" {...gwImg(coupleFor(e.title, i), { lazy: true })} />
                  <span className="gw-ev-no">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <div className="gw-ev-body">
                  {date && (
                    <p className="wk-eyebrow gw-ev-date" lang={lang}>
                      {date}
                    </p>
                  )}
                  <h3 className="gw-ev-title">{e.title}</h3>
                  <p className="gw-ev-line">
                    <Icon d={ICON.clock} size={16} />
                    <span lang={lang}>{time ? `${time}${end ? ` – ${end}` : ""}` : l.tba}</span>
                  </p>
                  {(e.venue || e.address) && (
                    <p className="gw-ev-line">
                      <Icon d={ICON.pin} size={16} />
                      <span>
                        {e.venue && <b>{e.venue}</b>}
                        {e.address && <span className="gw-ev-addr">{e.address}</span>}
                      </span>
                    </p>
                  )}
                  {e.dressCode && (
                    <p className="gw-ev-line gw-ev-dress">
                      {swatch ? <span className="gw-ev-swatch" style={{ background: swatch }} aria-hidden /> : <Icon d={ICON.image} size={16} />}
                      <span>
                        <span className="gw-ev-k" lang={lang}>
                          {l.dress}
                        </span>{" "}
                        {e.dressCode}
                      </span>
                    </p>
                  )}
                  {e.note && <p className="gw-ev-note">{e.note}</p>}
                  {map && (
                    <div className="gw-ev-actions">
                      <a className="gw-pill gw-ev-dir" href={map} target="_blank" rel="noopener noreferrer" lang={lang}>
                        <Icon d={ICON.pin} size={15} /> {l.directions}
                      </a>
                    </div>
                  )}
                  {isMain && live && (
                    <div className="gw-ev-live">
                      {live.open ? (
                        <a className="wk-btn wk-btn-sm gw-live-btn" href={live.url} target="_blank" rel="noopener noreferrer" lang={lang}>
                          <span className="gw-live-dot" aria-hidden /> {live.label}
                        </a>
                      ) : (
                        <p className="gw-ev-livesoon" lang={lang}>
                          <Icon d={ICON.live} size={15} /> {live.soon}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </article>
            </Reveal>
          );
        })}
      </ol>
      {list.length > 1 && (
        <div className="gw-ev-dots">
          {list.map((e, i) => (
            <button key={e.id || i} type="button" aria-label={e.title || String(i + 1)} aria-current={i === at ? "true" : undefined} className={i === at ? "is-on" : ""} onClick={() => go(i)} />
          ))}
        </div>
      )}
    </div>
  );
}
