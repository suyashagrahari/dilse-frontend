"use client";

// ─── The hero: the haldi mandap the khidki opened onto ──────────────────────
//
// Phones: a haldi-yellow sunburst sky with the marigold toran along the top
// and two garland strands at the edges; "श्री गणेशाय नमः", the names in
// script and the date under them; below, the mandap (marigold-wrapped
// pillars, red and yellow drapes, the havan) with the couple standing in it,
// the havan in front of them, and two umbrella guards at the corners.
// Tablet and desktop: the words on the left, the mandap on the right as a
// rounded-rectangle panel guarded on both sides.
//
// The couple's own photo (couplePhoto) replaces the illustration as a framed
// rounded rectangle. Entrance: everything rises in after the window opens.

import type { ReactNode } from "react";
import CroppedPhoto from "../../../_valentine/kit/CroppedPhoto";
import { cdn } from "../../../_wedding/media";
import { ART, img } from "../assets";
import type { Crop, Lang, Strings } from "../model";

export interface HeroProps {
  open: boolean;
  s: Strings;
  lang: Lang;
  first: string;
  second: string;
  guest: string;
  invocation: boolean;
  dateLine: string;
  time: string;
  muhurat: string;
  venue: string;
  couplePhoto: string;
  coupleCrop: Crop;
  live?: ReactNode;
  actions: ReactNode;
}

export default function Hero({ open, s, lang, first, second, guest, invocation, dateLine, time, muhurat, venue, couplePhoto, coupleCrop, live, actions }: HeroProps) {
  return (
    <section id="top" className={`sc-hero${open ? " is-in" : ""}`} aria-label={`${first} ${s.and} ${second}`}>
      <div className="sc-hero-sky" aria-hidden />
      <span className="sc-hero-garland" aria-hidden />
      <span className="sc-hero-strand sc-hero-strand-l" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img(ART.garland)} />
      </span>
      <span className="sc-hero-strand sc-hero-strand-r" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img(ART.garland)} />
      </span>

      <div className="sc-hero-grid">
        <div className="sc-hero-copy">
          {invocation && (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="sc-hero-ganesh sc-rise" {...img(ART.ganeshText)} alt="॥ श्री गणेशाय नमः ॥" lang="hi" />
          )}
          {guest ? (
            <p className="sc-hero-dear sc-rise" style={{ ["--d" as string]: "80ms" }}>
              <span lang={lang}>{s.dear}</span> <b>{guest}</b>, <span lang={lang}>{s.invitedYou}</span>
            </p>
          ) : (
            <p className="sc-eyebrow sc-rise" style={{ ["--d" as string]: "80ms" }} lang={lang}>
              {s.weddingOf}
            </p>
          )}
          <h1 className="sc-hero-names sc-rise" style={{ ["--d" as string]: "160ms" }}>
            <span className="sc-hero-n">{first}</span>
            <span className="sc-hero-amp" aria-hidden>
              &amp;
            </span>
            <span className="sc-hero-n">{second}</span>
          </h1>
          {dateLine && (
            <div className="sc-hero-when sc-rise" style={{ ["--d" as string]: "260ms" }}>
              <span className="sc-hero-rule" aria-hidden />
              <p className="sc-hero-date">{dateLine}</p>
              {(time || muhurat) && <p className="sc-hero-time">{[time, muhurat].filter(Boolean).join(" · ")}</p>}
              {venue && <p className="sc-hero-venue">{venue}</p>}
            </div>
          )}
          <div className="sc-hero-actions sc-rise" style={{ ["--d" as string]: "360ms" }}>
            {live}
            {actions}
          </div>
        </div>

        <div className="sc-hero-scene sc-rise" style={{ ["--d" as string]: "120ms" }}>
          <span className="sc-hero-guard sc-hero-guard-l" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img {...img(ART.guard)} />
          </span>
          <span className="sc-hero-guard sc-hero-guard-r" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img {...img(ART.guard)} />
          </span>
          <div className="sc-mandap">
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img className="sc-mandap-bg" {...img(ART.mandapSm, { high: true })} srcSet={`${cdn(ART.mandapSm.src)} 720w, ${cdn(ART.mandap.src)} 1080w`} sizes="(max-width: 1023px) 92vw, 520px" aria-hidden />
            <span className="sc-mandap-glow" aria-hidden />
            {couplePhoto ? (
              <span className="sc-mandap-photo">
                <CroppedPhoto photo={{ url: couplePhoto, cropX: coupleCrop.x, cropY: coupleCrop.y, scale: coupleCrop.scale }} alt={`${first} ${s.and} ${second}`} eager />
              </span>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="sc-mandap-couple" {...img(ART.couple)} alt={`${first} ${s.and} ${second}`} />
            )}
            {/* The havan stands in front of the couple (the same art, clipped to the fire pit). */}
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img className="sc-mandap-havan" {...img(ART.mandapSm)} srcSet={`${cdn(ART.mandapSm.src)} 720w, ${cdn(ART.mandap.src)} 1080w`} sizes="(max-width: 1023px) 92vw, 520px" aria-hidden />
            <span className="sc-mandap-flame" aria-hidden />
          </div>
          <span className="sc-hero-pot sc-hero-pot-l" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img {...img(ART.pots)} />
          </span>
          <span className="sc-hero-pot sc-hero-pot-r" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img {...img(ART.pots)} />
          </span>
        </div>
      </div>
      <a className="sc-hero-scroll" href="#invitation" aria-label={s.invitationTitle}>
        <span aria-hidden />
      </a>
    </section>
  );
}
