"use client";

// ─── The hero: the lake terrace, just through the doors ──────────────────────
// A powder-blue watercolour sky with the flamingo border along the top; the
// couple's names in script with the date, muhurat and city; the cover photo in
// an ivory, gold-edged rounded frame between the pink gazebo and the peacock;
// the lake and the white balustrade along the bottom. Phones stack it (words
// first, then the photo); at ≥960px it is a two-column spread. One
// rAF-throttled scroll listener writes --wp-sy for a gentle parallax (off for
// reduced motion and low-end phones).

import { useEffect, useRef, useState } from "react";
import { photoImgStyle, useWeddingReducedMotion, type WeddingEvent } from "../../../_wedding";
import type { LovePhoto } from "../../../_love/types";
import { HeroActions } from "./Actions";
import { img } from "./art";
import type { Motif, Strings } from "./model";

export interface HeroProps {
  open: boolean;
  lite: boolean;
  s: Strings;
  lang: "en" | "hi";
  first: string;
  second: string;
  guest: string;
  motif: Motif;
  dateLine: string;
  time: string;
  muhurat: string;
  place: string;
  cover: LovePhoto | null;
  main?: WeddingEvent;
  events: WeddingEvent[];
  couple: string;
  shareText: string;
}

export function MotifMark({ motif, className }: { motif: Motif; className?: string }) {
  if (motif === "none") return null;
  if (motif === "ganesha")
    return (
      <p className={`wp-motif wp-motif-text ${className ?? ""}`} lang="hi">
        ॥ श्री गणेशाय नमः ॥
      </p>
    );
  if (motif === "lotus")
    return (
      <span className={`wp-motif ${className ?? ""}`} aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img("lotus")} className="wp-motif-lotus" />
      </span>
    );
  return (
    <span className={`wp-motif ${className ?? ""}`} aria-hidden>
      <svg viewBox="0 0 64 40" width="64" height="40" fill="none" stroke="currentColor" strokeWidth="2.2">
        <circle cx="25" cy="23" r="12" />
        <circle cx="39" cy="23" r="12" />
        <path d="M21 9l4-5 4 5" strokeWidth="1.6" />
      </svg>
    </span>
  );
}

export default function Hero(p: HeroProps) {
  const { open, lite, s, lang } = p;
  const ref = useRef<HTMLElement>(null);
  const reduce = useWeddingReducedMotion();
  // A cover that no longer loads (an old CDN link) gives way to the couple illustration.
  const [broken, setBroken] = useState<string | null>(null);
  const cover = p.cover && p.cover.url !== broken ? p.cover : null;

  useEffect(() => {
    const el = ref.current;
    if (!el || reduce || lite) return;
    let raf = 0;
    let on = true;
    const tick = () => {
      raf = 0;
      el.style.setProperty("--wp-sy", String(Math.min(900, Math.max(0, window.scrollY))));
    };
    const onScroll = () => {
      if (on && !raf) raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([en]) => {
      on = en.isIntersecting;
    });
    io.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduce, lite]);

  const d = (ms: number) => ({ ["--d" as string]: `${ms}ms` });
  return (
    <header ref={ref} className={`wp-hero${open ? " is-on" : ""}`}>
      <div className="wp-hero-sky" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img("sky", { high: true })} />
      </div>
      <div className="wp-hero-flamingo" aria-hidden>
        <picture>
          <source media="(max-width: 700px)" srcSet={img("flamingoSm").src} />
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <img {...img("flamingo", { high: true })} />
        </picture>
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
      <img {...img("lanterns", { lazy: true })} className="wp-hero-lantern wp-hero-lantern-l" aria-hidden />
      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
      <img {...img("lanterns", { lazy: true })} className="wp-hero-lantern wp-hero-lantern-r" aria-hidden />

      <div className="wp-hero-grid">
        <div className="wp-hero-words">
          <MotifMark motif={p.motif} className="wp-in" />
          {p.guest && (
            <p className="wp-hero-dear wp-in" style={d(60)} lang={lang}>
              {s.dear} {p.guest},
            </p>
          )}
          <p className="wp-hero-kicker wp-in" style={d(120)} lang={lang}>
            {s.together}
          </p>
          <h1 className="wp-hero-names">
            <span className="wp-in" style={d(220)}>
              {p.first}
            </span>
            <i className="wp-in" style={d(320)}>
              &amp;
            </i>
            <span className="wp-in" style={d(420)}>
              {p.second}
            </span>
          </h1>
          <p className="wp-hero-line wp-in" style={d(540)} lang={lang}>
            {s.inviteLine}
          </p>
          <span className="wp-rule wp-in" style={d(600)} aria-hidden>
            <i />
          </span>
          {(p.dateLine || p.time) && (
            <p className="wp-hero-when wp-in" style={d(660)}>
              {[p.dateLine, p.time].filter(Boolean).join(" · ")}
            </p>
          )}
          {p.muhurat && (
            <p className="wp-hero-muhurat wp-in" style={d(720)}>
              {p.muhurat}
            </p>
          )}
          {p.place && (
            <p className="wp-hero-place wp-in" style={d(780)}>
              {p.place}
            </p>
          )}
          <div className="wp-in" style={d(860)}>
            <HeroActions main={p.main} all={p.events} couple={p.couple} s={s} shareText={p.shareText} />
          </div>
        </div>

        <div className="wp-hero-art" aria-hidden={!cover}>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...img("banana", { high: true })} className="wp-hero-banana" aria-hidden />
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...img("peacock", { high: true })} className="wp-hero-peacock" aria-hidden />
          {cover ? (
            <figure className="wp-hero-photo wp-in" style={d(300)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cover.url} alt={p.couple} decoding="async" fetchPriority="high" style={photoImgStyle(cover)} onError={() => setBroken(cover.url)} />
            </figure>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
            <img {...img("couple", { high: true })} className="wp-hero-couple wp-in" style={d(300)} aria-hidden />
          )}
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...img("anthurium", { high: true })} className="wp-hero-flora" aria-hidden />
        </div>
      </div>

      <div className="wp-hero-lake" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img("lake", { high: true })} className="wp-lake" />
        <span className="wp-balustrade" />
      </div>
      <a className="wp-hero-scroll" href="#invitation" aria-label={s.scroll}>
        <span lang={lang}>{s.scroll}</span>
        <i aria-hidden />
      </a>
    </header>
  );
}
