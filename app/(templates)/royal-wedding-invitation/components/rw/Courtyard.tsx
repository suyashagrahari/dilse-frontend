"use client";

// ─── The courtyard (the hero, right after the gateway) ───────────────────────
// A daylight Mughal garden court: a pale dawn sky with drifting clouds, gold
// lanterns swaying from the top corners, a sunburst of soft gold rays, the
// couple (their portrait in a rounded gold frame, or the illustrated couple in
// wedding red on a terracotta carpet) between two pink chhatris, a peacock on
// the white balustrade. The names in gold script, "are getting married", and a
// sandstone cartouche with the date, time and palace.
// Phones: art on top, words below. ≥1024px: words left, the scene right.
// The entrance is staged by `open`; loops pause while the hero is off screen.

import { useEffect, useRef } from "react";
import CroppedPhoto from "../../../_valentine/kit/CroppedPhoto";
import type { LovePhoto } from "../../../_love/types";
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
  muhurat: string;
  venue: string;
  guest: string;
}

export default function Courtyard({ open, s, lang, first, second, photo, dateLine, time, muhurat, venue, guest }: CourtyardProps) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([en]) => el.classList.toggle("is-idle", !en.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <header ref={ref} className={`rw-court${open ? " is-open" : ""}`}>
      <div className="rw-court-sky" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img className="rw-court-cloud is-a" {...img(A.cloud)} />
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img className="rw-court-cloud is-b" {...img(A.cloud2)} />
      </div>
      {[0, 1].map((i) => (
        <span key={i} className={`rw-court-lamp is-${i ? "r" : "l"}`} aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...img(A.lanterns)} />
        </span>
      ))}

      <div className="rw-court-grid">
        <div className="rw-court-scene">
          <span className="rw-court-sunburst" aria-hidden />
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img className="rw-court-chhatri is-l" aria-hidden {...img(A.chhatri)} />
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img className="rw-court-chhatri is-r" aria-hidden {...img(A.chhatri)} />
          {photo ? (
            <span className="rw-portrait">
              <CroppedPhoto photo={photo} alt={`${first} ${s.and} ${second}`} eager className="rw-portrait-photo" />
            </span>
          ) : (
            <span className="rw-court-couple" aria-hidden>
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img className="rw-court-carpet" {...img(A.carpet)} />
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img className="rw-court-pair" {...img(A.coupleWedding, { high: true })} />
            </span>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img className="rw-court-peacock" aria-hidden {...img(A.peacock)} />
        </div>

        <div className="rw-court-text">
          {guest && (
            <p className="rw-court-dear" lang={lang}>
              {s.dear} {guest}, {s.invited}
            </p>
          )}
          <p className="wk-eyebrow rw-court-k" lang={lang}>
            {s.royalOf}
          </p>
          <h1 className="rw-court-names">
            <span className="rw-court-n wk-foil-text wk-shimmer">{first}</span>
            <span className="rw-court-amp" aria-hidden>
              &amp;
            </span>
            <span className="rw-court-n wk-foil-text wk-shimmer">{second}</span>
          </h1>
          <p className="rw-court-getting" lang={lang}>
            {s.getting}
          </p>
          {(dateLine || venue) && (
            <div className="rw-cartouche">
              {dateLine && <p className="rw-cartouche-date">{dateLine}</p>}
              {(time || muhurat) && <p className="rw-cartouche-time">{[time, muhurat].filter(Boolean).join(" · ")}</p>}
              {venue && <p className="rw-cartouche-venue">{venue}</p>}
            </div>
          )}
          <a className="rw-court-cue" href="#invitation" lang={lang}>
            {s.scroll}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M6 9l6 6 6-6" />
            </svg>
          </a>
        </div>
      </div>

      {/* Two lengths of balustrade side by side: on laptops they run the full width under the courtyard. */}
      <div className="rw-court-rail" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img(A.balustrade, { lazy: true })} />
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img className="rw-court-rail-2" {...img(A.balustrade, { lazy: true })} />
      </div>
    </header>
  );
}
