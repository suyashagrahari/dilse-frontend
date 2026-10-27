"use client";

// ─── The hero: the ballroom itself ───────────────────────────────────────────
// Gold string lights hang across the top. The names in script, the tagline,
// the date and the venue; then the stage — a rounded-rectangle "ballroom
// window" with the chandelier glowing over the couple (the owner's tux-and-
// gown illustration, or the couple's own cover photo), gold line-art swirls
// at its shoulders and blush roses at its feet. On laptops the two sit side by
// side. Everything rises in once the doors have opened.

import { useMemo } from "react";
import { cropImgStyle } from "../../_valentine/editor/PhotoCropper";
import { formatEventDate, formatEventTime, type WeddingEvent, cdn } from "../../_wedding";
import { Btn, CAL, HEART, Icon, PIN, SaveDates, WA, openWhatsApp } from "./Actions";
import { img } from "./art";
import { seeded } from "./model";
import type { Strings } from "./strings";
import type { Lang } from "./types";

export interface HeroProps {
  open: boolean;
  s: Strings;
  lang: Lang;
  first: string;
  second: string;
  guest: string;
  tagline: string;
  main?: WeddingEvent;
  events: WeddingEvent[];
  couple: string;
  shareText: string;
  photo: string;
  photoCrop?: { x: number; y: number; scale: number };
}

export default function Hero({ open, s, lang, first, second, guest, tagline, main, events, couple, shareText, photo, photoCrop }: HeroProps) {
  const locale = lang === "hi" ? "hi-IN" : "en-IN";
  const dateLine = main?.date ? formatEventDate(main.date, locale) : "";
  const time = main?.time ? formatEventTime(main.time, locale) : "";
  const city = (main?.address || "").split(",").map((x) => x.trim()).filter(Boolean).slice(-2, -1)[0] || (main?.address || "").split(",").pop()?.trim() || "";
  const venueLine = [main?.venue, city && !(main?.venue || "").includes(city) ? city : ""].filter(Boolean).join(" · ");
  const twinkles = useMemo(() => {
    const r = seeded(23);
    return Array.from({ length: 14 }, () => ({ x: 3 + r() * 94, y: r() * 120, d: -r() * 4, dur: 2.2 + r() * 2.4 }));
  }, []);
  const sparks = useMemo(() => {
    const r = seeded(91);
    return Array.from({ length: 10 }, () => ({ x: 8 + r() * 84, y: 10 + r() * 70, d: -r() * 6, dur: 4 + r() * 4, s: 6 + r() * 8 }));
  }, []);

  return (
    <header id="top" className={`rc-hero${open ? " is-open" : ""}`}>
      <div className="rc-hero-lights" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img("lights", { high: true })} className="rc-hero-lights-a" />
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img("lights")} className="rc-hero-lights-b" />
        {twinkles.map((t, i) => (
          <i key={i} className="rc-twinkle" style={{ left: `${t.x}%`, top: `${t.y}px`, animationDelay: `${t.d}s`, animationDuration: `${t.dur}s` }} />
        ))}
      </div>

      <div className="rc-hero-inner">
        <div className="rc-hero-copy">
          {guest && (
            <p className="rc-hero-dear" lang={lang}>
              {s.dear} <b>{guest}</b>,
            </p>
          )}
          <p className="rc-eyebrow rc-hero-eyebrow" lang={lang}>
            {s.receptionOf}
          </p>
          <h1 className="rc-names" style={{ ["--rc-len" as string]: Math.max(5, first.length, second.length) }}>
            <span className="rc-name">{first}</span>
            <span className="rc-amp" aria-label={s.and}>
              &amp;
            </span>
            <span className="rc-name">{second}</span>
          </h1>
          {tagline && <p className="rc-hero-tag">{tagline}</p>}
          {(dateLine || time) && (
            <p className="rc-hero-when">
              {dateLine && (
                <span className="rc-chip">
                  <Icon d={CAL} size={15} /> {dateLine}
                </span>
              )}
              {time && <span className="rc-chip">{time}</span>}
            </p>
          )}
          {venueLine && (
            <p className="rc-hero-venue">
              <Icon d={PIN} size={16} />
              {venueLine}
            </p>
          )}
          <div className="rc-hero-actions">
            <a className="rc-btn rc-btn-gold" href="#rsvp">
              <Icon d={HEART} /> <span lang={lang}>{s.rsvpNow}</span>
            </a>
            <SaveDates events={events} couple={couple} s={s} ghost />
            <Btn icon={WA} fill ghost onClick={() => openWhatsApp(shareText)}>
              {s.whatsapp}
            </Btn>
          </div>
        </div>

        <div className="rc-hero-stage">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...img("swirl")} className="rc-hero-swirl rc-hero-swirl-l" aria-hidden />
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...img("swirl")} className="rc-hero-swirl rc-hero-swirl-r" aria-hidden />
          <div className="rc-hero-window">
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img {...img("ballroom", { high: true })} className="rc-hero-room" aria-hidden />
            <span className="rc-hero-chand" aria-hidden />
            <span className="rc-hero-spot" aria-hidden />
            {sparks.map((p, i) => (
              <i key={i} className="rc-mote" aria-hidden style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.s, height: p.s, animationDelay: `${p.d}s`, animationDuration: `${p.dur}s` }} />
            ))}
            {photo ? (
              <div className="rc-hero-photo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cdn(photo)} alt={couple} style={cropImgStyle(photoCrop ?? { x: 50, y: 40, scale: 100 })} decoding="async" />
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img {...img("couple", { high: true })} alt={couple} className="rc-hero-couple" />
            )}
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...img("roses")} className="rc-hero-roses rc-hero-roses-l" aria-hidden />
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...img("roses")} className="rc-hero-roses rc-hero-roses-r" aria-hidden />
        </div>
      </div>
      <a className="rc-hero-scroll" href="#invitation" aria-label="Scroll to the invitation">
        <span />
      </a>
    </header>
  );
}
