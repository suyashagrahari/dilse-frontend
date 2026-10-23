"use client";

// ─── The courtyard (what the door opens onto; the hero) ──────────────────────
// An ivory palace courtyard in the morning: an ivy curtain along the cornice,
// gold lanterns on long chains, the pink-and-white floral arch framing the
// couple's portrait in the gold round frame (or, with no photo, the
// illustrated couple in wedding red), the names, the date and the venue, and a
// white stone balustrade with urns in the foreground, a terracotta carpet
// leading in. Desktop: the arch on the left, the words on the right, pillars
// at the edges. Everything enters once the door has opened; three depth
// layers drift on scroll (one rAF-throttled listener, transform only).

import { useEffect, useRef } from "react";
import { useWeddingReducedMotion } from "../../../_wedding";
import CroppedPhoto from "../../../_valentine/kit/CroppedPhoto";
import type { LovePhoto } from "../../../_valentine/types";
import { A, img } from "../assets";
import type { Strings } from "./model";

export interface CourtyardProps {
  open: boolean;
  s: Strings;
  lang: "en" | "hi";
  first: string;
  second: string;
  photo: LovePhoto | null;
  dateLine: string;
  time: string;
  venue: string;
  guest: string;
}

export default function Courtyard({ open, s, lang, first, second, photo, dateLine, time, venue, guest }: CourtyardProps) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useWeddingReducedMotion();

  // Parallax: one passive listener, rAF-throttled, only while the hero is on screen.
  useEffect(() => {
    const el = ref.current;
    if (!el || reduce) return;
    const weak = typeof navigator !== "undefined" && (navigator.hardwareConcurrency || 8) <= 4 && window.matchMedia("(pointer: coarse)").matches;
    if (weak) return;
    let raf = 0;
    let on = true;
    const tick = () => {
      raf = 0;
      const y = Math.max(0, Math.min(window.innerHeight * 1.2, -el.getBoundingClientRect().top));
      el.style.setProperty("--pd-sy", y.toFixed(1));
    };
    const onScroll = () => {
      if (on && !raf) raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([en]) => {
      on = en.isIntersecting;
      if (on) onScroll();
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
    <section ref={ref} className={`pd-court${open ? " is-on" : ""}`} aria-label={`${first} ${s.and} ${second}`}>
      <div className="pd-court-sky" aria-hidden />
      <div className="pd-court-far" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img className="pd-court-pillar is-l" {...img(A.pillar)} />
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img className="pd-court-pillar is-r" {...img(A.pillar)} />
      </div>
      <div className="pd-court-ivy" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img(A.ivy)} />
      </div>
      <span className="pd-court-lan is-l" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img(A.lanterns)} />
      </span>
      <span className="pd-court-lan is-r" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img(A.lanterns)} />
      </span>

      <div className="pd-court-stage">
        <div className={`pd-court-arch${photo ? " has-photo" : " has-art"}`}>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img className="pd-court-flowers" {...img(A.arch)} />
          {photo ? (
            <div className="pd-portrait is-photo">
              <span className="pd-portrait-frame">
                <CroppedPhoto photo={photo} alt={`${first} ${s.and} ${second}`} eager className="pd-portrait-photo" />
              </span>
            </div>
          ) : (
            <div className="pd-portrait is-art">
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img className="pd-portrait-ring" {...img(A.frame)} />
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img className="pd-portrait-carpet" {...img(A.carpet)} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="pd-portrait-art" {...img(A.coupleWedding)} alt={`${first} ${s.and} ${second}`} />
            </div>
          )}
        </div>

        <div className="pd-court-text">
          {guest && (
            <p className="pd-court-dear" lang={lang}>
              {s.dear} {guest}, {s.invited}
            </p>
          )}
          <p className="wk-eyebrow pd-court-eyebrow" lang={lang}>
            {s.together}
          </p>
          <h1 className="pd-court-names">
            <span className="pd-court-n wk-foil-text wk-shimmer">{first}</span>
            <span className="pd-court-amp" aria-hidden>
              &amp;
            </span>
            <span className="pd-court-n wk-foil-text wk-shimmer">{second}</span>
          </h1>
          <p className="pd-court-getting" lang={lang}>
            {s.getting}
          </p>
          {(dateLine || venue) && (
            <div className="pd-court-when">
              {dateLine && <p className="pd-court-date">{dateLine}</p>}
              {time && <p className="pd-court-time">{time}</p>}
              {venue && <p className="pd-court-venue">{venue}</p>}
            </div>
          )}
          <a className="pd-court-down" href="#invitation" lang={lang}>
            <span>{lang === "hi" ? "भीतर पधारें" : "Step inside"}</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
              <path d="M6 9l6 6 6-6" />
            </svg>
          </a>
        </div>
      </div>

      <div className="pd-court-front" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img className="pd-court-carpet" {...img(A.carpet)} />
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img className="pd-court-rail" {...img(A.balustrade)} />
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img className="pd-court-urn is-l" {...img(A.urn)} />
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img className="pd-court-urn is-r" {...img(A.urn)} />
      </div>
    </section>
  );
}
