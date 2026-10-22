"use client";

// ─── The auspicious day: a parchment scroll unrolls, the havan kund is lit ───
// The scroll (template14's parchment banner) opens from its centre (scaleX on
// the paper, the two rollers slide out to its edges), then the lines of the
// date write themselves in one by one. Under it the sacred fire of the
// pheras: the havan kund with a soft flame glow that breathes (opacity +
// scale only). Below: the split-flap countdown between two hanging lantern
// trios (desktop). Reduced motion: everything is simply there.

import { useEffect, useRef, useState } from "react";
import { Countdown, useWeddingReducedMotion } from "../../../_wedding";
import { A, img } from "../assets";
import type { Strings } from "./model";

export interface DateScrollProps {
  s: Strings;
  lang: "en" | "hi";
  date: string;
  dateLine: string;
  time: string;
  muhurat: string;
  venue: string;
  rawTime: string;
}

export default function DateScroll({ s, lang, date, dateLine, time, muhurat, venue, rawTime }: DateScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useWeddingReducedMotion();
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([en]) => {
        if (en.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const shown = on || reduce;
  const [weekday, ...rest] = dateLine.split(", ");
  return (
    <div ref={ref} className={`pd-day${shown ? " is-on" : ""}`}>
      <div className="pd-scroll">
        <span className="pd-scroll-paper" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...img(A.scroll, { lazy: true })} />
        </span>
        <div className="pd-scroll-text">
          <p className="pd-scroll-l pd-scroll-eyebrow" lang={lang} style={{ ["--i" as string]: 0 }}>
            {s.dateEyebrow}
          </p>
          {rest.length > 0 && (
            <p className="pd-scroll-l pd-scroll-wd" style={{ ["--i" as string]: 1 }}>
              {weekday}
            </p>
          )}
          <p className="pd-scroll-l pd-scroll-date" style={{ ["--i" as string]: 2 }}>
            {rest.length ? rest.join(", ") : dateLine}
          </p>
          {(time || muhurat) && (
            <p className="pd-scroll-l pd-scroll-time" style={{ ["--i" as string]: 3 }}>
              {[time, muhurat].filter(Boolean).join(" · ")}
            </p>
          )}
          {venue && (
            <p className="pd-scroll-l pd-scroll-venue" style={{ ["--i" as string]: 4 }}>
              {venue}
            </p>
          )}
        </div>
      </div>
      <div className="pd-havan" aria-hidden>
        <span className="pd-havan-glow" />
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img(A.havan, { lazy: true })} />
      </div>
      <div className="pd-count">
        <span className="pd-count-lan is-l" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...img(A.lanterns, { lazy: true })} />
        </span>
        <div className="pd-count-in">
          <p className="wk-eyebrow" lang={lang}>
            {s.countdown}
          </p>
          <Countdown date={date} time={rawTime || "00:00"} variant="flip" labels={s.units} doneText={s.done} />
        </div>
        <span className="pd-count-lan is-r" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...img(A.lanterns, { lazy: true })} />
        </span>
      </div>
    </div>
  );
}
