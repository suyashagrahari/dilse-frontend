"use client";

// ─── The invitation's first screen: the rose garden behind the jharokha ─────
// What the guest steps into: blush paper under a gold lattice crown (template9's
// panel, the baked-in sample text removed: classic/lattice-gold.webp), the
// names in rose-gold script, the date on a hairline strip, the venue, and the
// two things guests do first (RSVP, save the date). Below, the floral gazebo
// with the illustrated couple in peach (or the couple's own portrait in a
// rounded frame), framed by two peony trees growing in from the edges.
// Phones: one column. ≥ 1024 px: the words on the left, the garden on the right.
// Everything enters once the window has opened (.is-on); transform/opacity only.

import CroppedPhoto from "../../../_valentine/kit/CroppedPhoto";
import { initialOf } from "../../../_wedding";
import { A, img } from "./assets";
import { dateParts, type Strings } from "./model";
import type { LovePhoto } from "../../../_love/types";

export interface HeroProps {
  on: boolean;
  s: Strings;
  lang: "en" | "hi";
  first: string;
  second: string;
  guest: string;
  date: string;
  time: string;
  venue: string;
  photo: LovePhoto | null;
  onRsvp?: () => void;
  onSave?: () => void;
  saved?: boolean;
}

function Icon({ d }: { d: string }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}
const HEART = "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z";
const CAL = "M7 3v3M17 3v3M4 8.5h16M5 5.5h14a1 1 0 0 1 1 1V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1zM8.5 13h3v3h-3z";

export default function Hero({ on, s, lang, first, second, guest, date, time, venue, photo, onRsvp, onSave, saved }: HeroProps) {
  const locale = lang === "hi" ? "hi-IN" : "en-IN";
  const p = dateParts(date, locale);
  // Script names never wrap mid-name: long ones step down a size instead.
  const longest = Math.max([...first].length, [...second].length);
  const size = longest > 13 ? " is-xlong" : longest > 9 ? " is-long" : "";
  return (
    <header className={`cw-hero${on ? " is-on" : ""}`} id="top">
      <div className="cw-hero-wash" aria-hidden />
      <span className="cw-hero-crown" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img(A.lattice, { high: true })} />
        {/* Wide screens: the couple's initials in rose-gold script inside the arch. */}
        <span className="cw-hero-mono">
          {initialOf(first)}
          <i>&amp;</i>
          {initialOf(second)}
        </span>
      </span>
      {(["l", "r"] as const).map((side) => (
        <span key={side} className={`cw-hero-tree is-${side}`} aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...img(side === "l" ? A.treeL : A.treeR)} />
        </span>
      ))}
      {(["l", "r"] as const).map((side) => (
        <span key={side} className={`cw-pampas is-${side}`} aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...img(A.pampasCorner, { lazy: true })} />
        </span>
      ))}

      <div className="cw-hero-grid">
        <div className="cw-hero-words">
          {guest && (
            <p className="cw-hero-dear" lang={lang}>
              {s.dear} {guest}, {s.invited}
            </p>
          )}
          <p className="cw-hero-eyebrow" lang={lang}>
            {s.together}
          </p>
          <h1 className={`cw-hero-names${size}`}>
            <span className="cw-hero-n wk-foil-text wk-shimmer">{first}</span>
            <span className="cw-hero-amp" aria-label={s.and}>
              &amp;
            </span>
            <span className="cw-hero-n wk-foil-text wk-shimmer">{second}</span>
          </h1>
          <p className="cw-hero-getting" lang={lang}>
            {s.getting}
          </p>
          {p && (
            <div className="cw-hero-date" aria-label={`${p.weekday} ${p.day} ${p.month} ${p.year}`}>
              <span className="cw-hero-date-side">{p.weekday}</span>
              <span className="cw-hero-date-day">{p.day}</span>
              <span className="cw-hero-date-side">
                {p.month} {p.year}
              </span>
            </div>
          )}
          {(time || venue) && (
            <p className="cw-hero-where">
              {time && <span className="cw-hero-time">{time}</span>}
              {venue && <span className="cw-hero-venue">{venue}</span>}
            </p>
          )}
          {(onRsvp || onSave) && (
            <div className="cw-hero-acts">
              {onRsvp && (
                <button type="button" className="cw-btn cw-btn-rose" onClick={onRsvp} lang={lang}>
                  <Icon d={HEART} /> RSVP
                </button>
              )}
              {onSave && (
                <button type="button" className="cw-btn cw-btn-ghost" onClick={onSave} lang={lang}>
                  <Icon d={CAL} /> {saved ? s.saved : s.saveDate}
                </button>
              )}
            </div>
          )}
        </div>

        <div className={`cw-hero-scene${photo ? " has-photo" : ""}`} aria-hidden={!photo}>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img className="cw-hero-gazebo" {...img(A.gazebo, { high: true })} aria-hidden />
          {photo ? (
            <div className="cw-hero-portrait">
              <CroppedPhoto photo={photo} alt={`${first} & ${second}`} eager />
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
            <img className="cw-hero-couple" {...img(A.couple, { high: true })} aria-hidden />
          )}
          <span className="cw-hero-ground" aria-hidden />
        </div>
      </div>

      <a className="cw-hero-down" href="#invitation" lang={lang}>
        {s.scroll}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </a>
    </header>
  );
}
