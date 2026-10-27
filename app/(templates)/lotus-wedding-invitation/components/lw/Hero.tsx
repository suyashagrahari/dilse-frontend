"use client";

// ─── The hero: the temple courtyard after the lotus opens ────────────────────
// A marigold garland swings in along the top, gold string lights hang beneath
// it, the sage arch badge drops on its cord with the date, and the couple (the
// owner's illustration) stand before a faded gopuram with lotus stems at their
// feet, white-gold lotus stems rising at the screen's corners. Phones stack it;
// at ≥960px it is a two-column spread (art left, words right) one screen tall.
// No scroll parallax: a fast scroll never drags the art around.

import type { WeddingEvent } from "../../../_wedding";
import DateBadge from "./DateBadge";
import { img } from "./art";
import type { Strings } from "./model";

export interface HeroProps {
  open: boolean;
  lite: boolean;
  s: Strings;
  lang: "en" | "hi";
  first: string;
  second: string;
  guest: string;
  invocation: boolean;
  badge: { month: string; day: string; year: string } | null;
  dateLine: string;
  time: string;
  muhurat: string;
  venue: string;
  main?: WeddingEvent;
  events: WeddingEvent[];
  couple: string;
}

export default function Hero(p: HeroProps) {
  const { open, s, lang } = p;


  return (
    <header className={`lw-hero${open ? " is-on" : ""}`}>
      <div className="lw-hero-garland" aria-hidden />
      <div className="lw-hero-lights" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img("lights", { high: true })} />
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img("lights", { high: true })} className="lw-lights-b" />
      </div>

      {/* The white-gold lotus pond rising at the screen's two bottom corners (tablets and up). */}
      <div className="lw-hero-gold" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img("leafStem")} className="lw-hg lw-hg-leaf" />
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img("budA")} className="lw-hg lw-hg-bud" />
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img("podA")} className="lw-hg lw-hg-pod" />
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img("leafTilt")} className="lw-hg lw-hg-tilt" />
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img("budB")} className="lw-hg lw-hg-budb" />
      </div>

      <div className="lw-hero-grid">
        <div className="lw-hero-art" aria-hidden>
          <span className="lw-hero-sun" />
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...img("gopuramFaded", { high: true })} className="lw-hero-gopuram" />
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...img("couple", { high: true })} className="lw-hero-couple" />
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...img("pondStems", { high: true })} className="lw-hero-pond lw-hero-pond-l" />
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...img("lotusPair", { high: true })} className="lw-hero-pond lw-hero-pond-r" />
          <span className="lw-hero-water" />
        </div>

        <div className="lw-hero-words">
          {p.badge && (
            <div className="lw-hero-badge">
              <span className="lw-hero-cord" aria-hidden />
              <DateBadge month={p.badge.month} day={p.badge.day} year={p.badge.year} />
            </div>
          )}
          {p.invocation && (
            // eslint-disable-next-line @next/next/no-img-element
            <img {...img("ganeshaLotus", { high: true })} alt="" className="lw-hero-ganesha lw-in" style={{ ["--d" as string]: "0ms" }} />
          )}
          {p.guest && (
            <p className="lw-hero-dear lw-in" style={{ ["--d" as string]: "60ms" }} lang={lang}>
              {s.dear} {p.guest},
            </p>
          )}
          <p className="lw-hero-kicker lw-in" style={{ ["--d" as string]: "120ms" }} lang={lang}>
            {s.together}
          </p>
          <h1 className="lw-hero-names">
            <span className="lw-in" style={{ ["--d" as string]: "220ms" }}>
              {p.first}
            </span>
            <i className="lw-in" style={{ ["--d" as string]: "320ms" }}>
              &amp;
            </i>
            <span className="lw-in" style={{ ["--d" as string]: "420ms" }}>
              {p.second}
            </span>
          </h1>
          <p className="lw-hero-line lw-in" style={{ ["--d" as string]: "540ms" }} lang={lang}>
            {s.inviteLine}
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...img("divider")} className="lw-hero-div lw-in" style={{ ["--d" as string]: "620ms" }} aria-hidden />
          {(p.dateLine || p.time) && (
            <p className="lw-hero-when lw-in" style={{ ["--d" as string]: "680ms" }}>
              {[p.dateLine, p.time].filter(Boolean).join(" · ")}
            </p>
          )}
          {p.muhurat && (
            <p className="lw-hero-muhurat lw-in" style={{ ["--d" as string]: "740ms" }}>
              {p.muhurat}
            </p>
          )}
          {p.venue && (
            <p className="lw-hero-venue lw-in" style={{ ["--d" as string]: "800ms" }}>
              {p.venue}
            </p>
          )}
        </div>
      </div>
      <a className="lw-hero-scroll" href="#invitation" aria-label={s.scroll}>
        <span lang={lang}>{s.scroll}</span>
        <i aria-hidden />
      </a>
    </header>
  );
}
