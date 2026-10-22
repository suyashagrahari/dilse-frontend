"use client";

// ─── The farmaan: a royal scroll that unrolls to the date (spec 6.3 scene 5) ─
// Two turned gold rods and a parchment body. When the scroll is 35% on screen
// the body wipes open from the top (one clip-path inset, one shot) while the
// bottom rod travels down with it (translateY); then the gold-and-ruby mohar
// presses onto the paper (--ease-press) with a short vibrate. Reduced motion:
// already open, seal in place.

import { useEffect, useRef, useState } from "react";
import { initialOf, useWeddingReducedMotion } from "../../../_wedding";
import { artImg } from "./art";
import type { Strings } from "./model";

export interface FarmaanProps {
  s: Strings;
  lang: "en" | "hi";
  locale: string;
  date: string;
  time: string;
  muhurat: string;
  venue: string;
  first: string;
  second: string;
}

function parts(date: string, locale: string) {
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(Date.UTC(y, (m || 1) - 1, d || 1, 12));
  const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale, { timeZone: "UTC", ...o }).format(dt);
  return { weekday: f({ weekday: "long" }), day: f({ day: "numeric" }), month: f({ month: "long" }), year: f({ year: "numeric" }) };
}

export default function Farmaan({ s, lang, locale, date, time, muhurat, venue, first, second }: FarmaanProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useWeddingReducedMotion();
  const [state, setState] = useState<"rolled" | "open" | "sealed">("rolled");

  useEffect(() => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    let t = 0;
    const io = new IntersectionObserver(
      ([en]) => {
        if (!en.isIntersecting) return;
        io.disconnect();
        setState("open");
        t = window.setTimeout(() => {
          setState("sealed");
          try {
            navigator.vibrate?.(12);
          } catch {}
        }, 1650);
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(t);
    };
  }, [reduce]);

  const p = parts(date, locale);
  const shown = reduce ? "sealed" : state;
  return (
    <div ref={ref} className={`gw-farmaan is-${shown}`}>
      <span className="gw-rod gw-rod-top" aria-hidden />
      <div className="gw-scroll-body">
        <div className="gw-scroll-paper">
          <p className="gw-f-k" lang={lang}>
            {s.decree}
          </p>
          <p className="gw-f-weekday">{p.weekday}</p>
          <p className="gw-f-day wk-foil-text">{p.day}</p>
          <p className="gw-f-month">
            {p.month} <span>{p.year}</span>
          </p>
          {time && (
            <p className="gw-f-time" lang={lang}>
              {s.at} {time}
            </p>
          )}
          {muhurat && <p className="gw-f-muhurat">{muhurat}</p>}
          {venue && <p className="gw-f-venue">{venue}</p>}
          <span className="gw-mohar" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img {...artImg("gold/gold-sunburst-ring-01", { lazy: true })} />
            <b>
              {initialOf(first)}
              <i>&amp;</i>
              {initialOf(second)}
            </b>
          </span>
        </div>
        <span className="gw-rod-track" aria-hidden>
          <span className="gw-rod gw-rod-bottom" />
        </span>
      </div>
    </div>
  );
}
