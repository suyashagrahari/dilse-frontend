"use client";

// ─── The hero: the couple on a swing under a floral drape ───────────────────
// Back to front: a blush glow, the floral drape arch, the couple on their
// swing (swaying from the drape's beam), garden rocks at its foot, pampas
// grass in both corners and a pampas cloud bank along the bottom, petals on
// the breeze. The copy (guest greeting, names in script, date, venue and the
// three actions: RSVP, save the date, share) sits under the arch on phones
// and beside it from 1024 px. The entrance is staged by `open`; one
// rAF-throttled scroll listener writes --fw-hy for a two-depth parallax exit;
// the loops pause while the hero is off screen.

import { useEffect, useMemo, useRef } from "react";
import { useWeddingReducedMotion } from "../../../_wedding";
import { pic, seeded } from "./art";
import type { Strings } from "./model";
import Wipe from "./Wipe";

export interface HeroProps {
  open: boolean;
  s: Strings;
  lang: "en" | "hi";
  first: string;
  second: string;
  guest: string;
  dateLine: string;
  time: string;
  venue: string;
}

export default function Hero({ open, s, lang, first, second, guest, dateLine, time, venue }: HeroProps) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useWeddingReducedMotion();
  const petals = useMemo(() => {
    const r = seeded(31);
    return Array.from({ length: 9 }, () => ({ left: 4 + r() * 92, delay: -r() * 14, dur: 11 + r() * 7, dx: (r() - 0.5) * 160, size: 9 + r() * 9, tone: r() }));
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let on = true;
    const tick = () => {
      raf = 0;
      const y = Math.max(0, Math.min(window.scrollY, el.offsetHeight));
      el.style.setProperty("--fw-hy", `${y.toFixed(1)}px`);
    };
    const onScroll = () => {
      if (on && !raf && !reduce) raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([en]) => {
      on = en.isIntersecting;
      el.classList.toggle("is-idle", !on);
    });
    io.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduce]);

  return (
    <header ref={ref} className={`fw-hero${open ? " is-open" : ""}`}>
      <span className="fw-frame" aria-hidden />
      <div className="fw-hero-bank" aria-hidden>
        <span className="fw-hero-peony is-l">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...pic("peonyBeige", { high: true })} />
        </span>
        <span className="fw-hero-peony is-r">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...pic("peonyBeige", { high: true })} />
        </span>
        <span className="fw-hero-corner is-l">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...pic("pampasCorner")} />
        </span>
        <span className="fw-hero-corner is-r">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...pic("pampasCorner")} />
        </span>
        <span className="fw-hero-clouds">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...pic("clouds", { sizes: "100vw" })} />
        </span>
      </div>

      <div className="fw-hero-grid">
        <div className="fw-hero-art" aria-hidden>
          <div className="fw-hero-par">
            <span className="fw-hero-glow" />
            <span className="fw-hero-drape">
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img {...pic("drape", { high: true, sizes: "(min-width: 1024px) 560px, 86vw" })} />
            </span>
            <span className="fw-hero-swing">
              <span className="fw-hero-swing-in">
                {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                <img {...pic("swing", { high: true })} />
              </span>
            </span>
          </div>
        </div>

        <div className="fw-hero-copy">
          <Wipe role="swirl" className="fw-hero-swirl" when={open} delay={500} sizes="(min-width: 1024px) 360px, 58vw" />
          {guest && (
            <p className="fw-hero-dear fw-hi-1" lang={lang}>
              {s.dear} {guest},
            </p>
          )}
          <p className="wk-eyebrow fw-hi-2" lang={lang}>
            {s.togetherWith}
          </p>
          <h1 className="fw-hero-names">
            <span className="fw-hero-n fw-hi-3">{first}</span>
            <span className="fw-hero-amp fw-hi-4" aria-label={s.and}>
              &amp;
            </span>
            <span className="fw-hero-n fw-hi-5">{second}</span>
          </h1>
          <p className="fw-hero-sub fw-hi-6" lang={lang}>
            {s.gettingMarried}
          </p>
          {dateLine && (
            <p className="fw-hero-date fw-hi-7">
              <span>{dateLine}</span>
              {time && <small>{time}</small>}
            </p>
          )}
          {venue && <p className="fw-hero-venue fw-hi-8">{venue}</p>}
        </div>
      </div>

      <div className="fw-breeze" aria-hidden>
        {petals.map((p, i) => (
          <i
            key={i}
            style={{
              left: `${p.left}%`,
              width: p.size,
              height: p.size * 0.72,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.dur}s`,
              ["--dx" as string]: `${p.dx}px`,
              ["--tone" as string]: p.tone > 0.5 ? "#efcfc9" : "#f6e6d6",
            }}
          />
        ))}
      </div>

      <a className="fw-cue" href="#invitation" aria-label={s.scroll}>
        <i aria-hidden />
      </a>
    </header>
  );
}

export function ShareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="18" cy="5" r="2.6" />
      <circle cx="6" cy="12" r="2.6" />
      <circle cx="18" cy="19" r="2.6" />
      <path d="M8.3 10.8l7.4-4.3M8.3 13.2l7.4 4.3" />
    </svg>
  );
}
