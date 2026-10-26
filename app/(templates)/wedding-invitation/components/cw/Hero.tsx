"use client";

// ─── The invitation's first screen: the rose garden behind the jharokha ─────
// What the guest steps into: blush paper, the names in rose-gold script, the
// date on a hairline strip, the venue, and the two things guests do first
// (RSVP, save the date). Beside them (below on phones) the couple under the
// floral gazebo, framed by a palace arch window that looks out on the pink
// dawn over the lake palace (the jharokha's own view), a gold mandala (from
// template16) turning slowly behind the arch like a halo, a few twinkles and
// rose petals drifting through. Two peony trees grow in from the very edges of
// the screen (their art is cropped on the outer side, so they always sit
// flush). Phones and tablets keep the gold lattice crown over the names.
// ≥ 1024 px: the words on the left, the arch on the right, all inside one
// screen. Everything enters once the window has opened (.is-on);
// transform/opacity only.

import CroppedPhoto from "../../../_valentine/kit/CroppedPhoto";
import { initialOf } from "../../../_wedding";
import { A, img, seeded } from "./assets";
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

/** A cusped Mughal arch, 400 × 520, open at the bottom; INNER is the same arch inset 12 units (the gold double line). */
const ARCH = "M20 520V206C20 128 112 84 166 50c16-10 28-24 34-44 6 20 18 34 34 44 54 34 146 78 146 156v314z";
const INNER = "M32 520V210c0-70 86-112 138-144 13-8 24-20 30-34 6 14 17 26 30 34 52 32 138 74 138 144v310";

/** Rose petals drifting through the garden: a fixed layout (seeded), so server and client agree. */
const PETALS = (() => {
  const r = seeded(29);
  return Array.from({ length: 11 }, (_, i) => ({
    left: `${Math.round(r() * 96)}%`,
    size: 14 + Math.round(r() * 14),
    dur: `${11 + Math.round(r() * 9)}s`,
    delay: `${(i * 1.3 + r() * 2).toFixed(1)}s`,
    dx: `${Math.round(r() * 160 - 80)}px`,
    rot: `${Math.round(r() * 540 - 270)}deg`,
    sakura: i % 3 === 0,
  }));
})();
const TWINKLES = [
  { l: "10%", t: "24%", d: "0s", s: 22 },
  { l: "84%", t: "18%", d: "1.1s", s: 18 },
  { l: "90%", t: "52%", d: "2.2s", s: 14 },
  { l: "4%", t: "60%", d: "1.6s", s: 16 },
  { l: "50%", t: "2%", d: ".6s", s: 20 },
];

export default function Hero({ on, s, lang, first, second, guest, date, time, venue, photo, onRsvp, onSave, saved }: HeroProps) {
  const locale = lang === "hi" ? "hi-IN" : "en-IN";
  const p = dateParts(date, locale);
  // Script names never wrap mid-name: long ones step down a size instead.
  const longest = Math.max([...first].length, [...second].length);
  const size = longest > 13 ? " is-xlong" : longest > 9 ? " is-long" : "";
  return (
    <header className={`cw-hero${on ? " is-on" : ""}`} id="top">
      <div className="cw-hero-wash" aria-hidden />
      <div className="cw-hero-petals" aria-hidden>
        {PETALS.map((p, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} src={p.sakura ? A.petalSakura.src : A.petal.src} alt="" width={p.size} height={p.size} loading="lazy" decoding="async" style={{ left: p.left, animationDuration: p.dur, animationDelay: p.delay, ["--dx" as string]: p.dx, ["--rot" as string]: p.rot }} />
        ))}
      </div>
      <span className="cw-hero-crown" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img(A.lattice, { high: true })} />
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

      {(["l", "r"] as const).map((side) => (
        <span key={side} className={`cw-bloom is-${side}`} aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...img(A.peonies, { lazy: true })} />
        </span>
      ))}
      {(["l", "r"] as const).map((side) => (
        <span key={side} className={`cw-lantern is-${side}`} aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...img(A.lanterns, { lazy: true })} />
        </span>
      ))}

      <div className="cw-hero-grid">
        <div className="cw-hero-words">
          {/* Wide screens: the couple's initials in a gold-ringed seal above the names. */}
          <span className="cw-hero-mono" aria-hidden>
            <span>{initialOf(first)}</span>
            <i>&amp;</i>
            <span>{initialOf(second)}</span>
          </span>
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
                  <Icon d={HEART} /> {s.rsvpBtn}
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
          <span className="cw-hero-halo" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img {...img(A.mandalaGold, { lazy: true })} />
          </span>
          <svg className="cw-hero-arch" viewBox="0 0 400 520" aria-hidden>
            <defs>
              <clipPath id="cw-arch-clip">
                <path d={ARCH} />
              </clipPath>
              <linearGradient id="cw-arch-fade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#fff6f3" stopOpacity="0" />
                <stop offset=".55" stopColor="#fff6f3" stopOpacity=".05" />
                <stop offset="1" stopColor="#fbe9e8" stopOpacity=".92" />
              </linearGradient>
              <linearGradient id="cw-arch-gold" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#E9C98B" />
                <stop offset=".45" stopColor="#B8864B" />
                <stop offset=".7" stopColor="#F3DDA8" />
                <stop offset="1" stopColor="#A9743F" />
              </linearGradient>
              <radialGradient id="cw-arch-sun" cx=".5" cy=".42" r=".5">
                <stop offset="0" stopColor="#fff" stopOpacity=".85" />
                <stop offset=".5" stopColor="#ffe6ea" stopOpacity=".35" />
                <stop offset="1" stopColor="#ffe6ea" stopOpacity="0" />
              </radialGradient>
            </defs>
            <g clipPath="url(#cw-arch-clip)">
              <rect width="400" height="520" fill="#f8d8da" />
              <image href={A.dawn.src} x="-60" y="-40" width="520" height="866" preserveAspectRatio="xMidYMid slice" className="cw-hero-arch-dawn" />
              <rect width="400" height="520" fill="url(#cw-arch-sun)" className="cw-hero-arch-sun" />
              <rect width="400" height="520" fill="url(#cw-arch-fade)" />
            </g>
            <path d={ARCH} fill="none" stroke="url(#cw-arch-gold)" strokeWidth="5" className="cw-hero-arch-line" />
            <path d={INNER} fill="none" stroke="#C9A063" strokeOpacity=".7" strokeWidth="1.4" />
          </svg>
          {TWINKLES.map((t, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} className="cw-hero-twinkle" src={A.sparkle.src} alt="" width={t.s} height={t.s} loading="lazy" decoding="async" style={{ left: t.l, top: t.t, animationDelay: t.d }} />
          ))}
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
