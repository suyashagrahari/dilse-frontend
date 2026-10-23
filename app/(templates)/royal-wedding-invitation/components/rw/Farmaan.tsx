"use client";

// ─── The farmaan: a royal decree that unrolls to the date ────────────────────
// Two turned brass rods and a parchment body (template1's parchment, multiplied
// over ivory). When the scroll is 35% on screen the body opens from the top
// (scaleY on the paper, the bottom rod travelling with it) and the wax mohar
// with the couple's initials presses on. Below it, the flip countdown sits in
// a sandstone medallion with a gold jhumka swaying on each side.
// Reduced motion: already open, seal in place.

import { useEffect, useRef, useState } from "react";
import { Countdown, Reveal, initialOf, useWeddingReducedMotion } from "../../../_wedding";
import { A, img } from "../assets";
import type { Strings } from "./model";

export interface FarmaanProps {
  s: Strings;
  lang: "en" | "hi";
  locale: string;
  date: string;
  rawTime: string;
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

export default function Farmaan({ s, lang, locale, date, rawTime, time, muhurat, venue, first, second }: FarmaanProps) {
  const ref = useRef<HTMLDivElement>(null);
  const paper = useRef<HTMLDivElement>(null);
  const reduce = useWeddingReducedMotion();
  const [state, setState] = useState<"rolled" | "open" | "sealed">("rolled");

  useEffect(() => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    // The bottom rod starts rolled up under the top one: it travels the paper's height.
    if (paper.current) el.style.setProperty("--rw-ph", `${paper.current.offsetHeight}px`);
    let t = 0;
    const io = new IntersectionObserver(
      ([en]) => {
        if (!en.isIntersecting) return;
        io.disconnect();
        setState("open");
        t = window.setTimeout(() => setState("sealed"), 1300);
      },
      { threshold: 0.3 },
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
    <div className="rw-day">
      <div ref={ref} className={`rw-farmaan is-${shown}`}>
        <span className="rw-rod is-top" aria-hidden />
        <div className="rw-paper" ref={paper}>
          <p className="rw-f-k" lang={lang}>
            {s.decree}
          </p>
          <p className="rw-f-weekday">{p.weekday}</p>
          <p className="rw-f-day wk-foil-text">{p.day}</p>
          <p className="rw-f-month">
            {p.month} <span>{p.year}</span>
          </p>
          {time && (
            <p className="rw-f-time" lang={lang}>
              {s.at} {time}
            </p>
          )}
          {muhurat && <p className="rw-f-muhurat">{muhurat}</p>}
          {venue && <p className="rw-f-venue">{venue}</p>}
          <span className="rw-mohar" aria-hidden>
            <b>
              {initialOf(first)}
              <i>&amp;</i>
              {initialOf(second)}
            </b>
          </span>
        </div>
        <span className="rw-rod is-bottom" aria-hidden />
      </div>

      <Reveal effect="zoom" className="rw-count">
        {[0, 1].map((i) => (
          <span key={i} className={`rw-count-jhumka is-${i ? "r" : "l"}`} aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img {...img(A.jhumka, { lazy: true })} />
          </span>
        ))}
        <p className="wk-eyebrow rw-count-k" lang={lang}>
          {s.countdown}
        </p>
        <Countdown date={date} time={rawTime || "00:00"} variant="flip" labels={s.units} doneText={s.done} />
      </Reveal>
    </div>
  );
}
