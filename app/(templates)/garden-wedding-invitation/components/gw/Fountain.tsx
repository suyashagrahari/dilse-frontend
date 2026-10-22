"use client";

// ─── The auspicious day: the date card, the countdown and the fountain ───────
// The stone fountain plays: a jet pulses above the top bowl, water spills from
// both bowls in staggered drops, ripples widen in the basin. Tall lotus stems
// lean in from both sides. Every loop is transform/opacity and runs only while
// the fountain is on screen (.is-on); under reduced motion the water is still.

import { useRef } from "react";
import { Countdown, Reveal } from "../../../_wedding";
import { GW, gwImg } from "../assets";
import { useOnScreen } from "./art";
import type { Strings } from "./model";

function parts(date: string, locale: string) {
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(Date.UTC(y, (m || 1) - 1, d || 1, 12));
  const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale, { timeZone: "UTC", ...o }).format(dt);
  return { weekday: f({ weekday: "long" }), day: f({ day: "numeric" }), month: f({ month: "long" }), year: f({ year: "numeric" }) };
}

// Drops: [left %, top %, fall in cqw (the core is a size container), delay s] —
// from the lip of the top bowl into the middle bowl, and from the middle bowl into the basin.
const DROPS: [number, number, number, number][] = [
  [40, 8, 12, 0],
  [46, 9, 11, 0.4],
  [54, 9, 11, 0.75],
  [60, 8, 12, 0.2],
  [22, 29, 28, 0.1],
  [29, 31, 27, 0.55],
  [71, 31, 27, 0.3],
  [78, 29, 28, 0.85],
];

export interface FountainProps {
  s: Strings;
  lang: "en" | "hi";
  locale: string;
  date: string;
  time: string;
  timeRaw: string;
  muhurat: string;
  venue: string;
}

export default function Fountain({ s, lang, locale, date, time, timeRaw, muhurat, venue }: FountainProps) {
  const ref = useRef<HTMLDivElement>(null);
  const on = useOnScreen(ref);
  const p = parts(date, locale);
  return (
    <div className="gw-day">
      <Reveal effect="zoom" className="gw-day-card">
        <p className="gw-day-week" lang={lang}>
          {p.weekday}
        </p>
        <p className="gw-day-num wk-foil-text wk-shimmer">{p.day}</p>
        <p className="gw-day-month">
          {p.month} <span>{p.year}</span>
        </p>
        <span className="gw-day-rule" aria-hidden />
        {time && <p className="gw-day-time">{time}</p>}
        {muhurat && <p className="gw-day-muhurat">{muhurat}</p>}
        {venue && <p className="gw-day-venue">{venue}</p>}
      </Reveal>

      <Reveal className="gw-day-count" delay={120}>
        <p className="wk-eyebrow" lang={lang}>
          {s.countdown}
        </p>
        <Countdown date={date} time={timeRaw || "00:00"} variant="flip" labels={s.units} doneText={s.done} />
      </Reveal>

      <div ref={ref} className={`gw-fountain${on ? " is-on" : ""}`} aria-hidden>
        <span className="gw-stems gw-stems-l">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...gwImg(GW.lotusStems, { lazy: true })} />
        </span>
        <span className="gw-fountain-core">
          <span className="gw-jet" />
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img className="gw-fountain-img" {...gwImg(GW.fountain, { lazy: true })} />
          <span className="gw-drops">
            {DROPS.map(([l, t, fall, d], i) => (
              <i key={i} style={{ left: `${l}%`, top: `${t}%`, ["--fall" as string]: `${fall}cqw`, animationDelay: `${d}s` }} />
            ))}
          </span>
          <span className="gw-ripples">
            <i />
            <i />
            <i />
          </span>
        </span>
        <span className="gw-stems gw-stems-r">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...gwImg(GW.lotusStems, { lazy: true })} />
        </span>
      </div>
    </div>
  );
}
