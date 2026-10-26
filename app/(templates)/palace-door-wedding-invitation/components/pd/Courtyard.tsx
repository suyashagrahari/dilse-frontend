"use client";

// ─── The courtyard (what the door opens onto; the hero) ──────────────────────
// An ivory palace courtyard in the morning: an ivy curtain along the cornice,
// gold lanterns on long chains, a gold mandala and ring framing the
// couple's portrait in the gold round frame (or, with no photo, the
// illustrated couple in wedding red), the names, the date and the venue, and a
// white stone balustrade with urns in the foreground, a terracotta carpet
// leading in. Behind the couple a gold mandala turns in warm light, lotuses
// and diyas sit at their feet. The floral arch, split in two, blooms from the
// top corners over a fringe of ivy; urns stand in the bottom corners.
// Tablets and up: the hero is one screen tall, full-height pillars at the
// edges and the balustrade edge to edge; desktop sets the arch on the left and
// the words on the right. Everything enters once the door has opened and then
// stays put (no scroll parallax, so a fast scroll never drags the art around).

import CroppedPhoto from "../../../_valentine/kit/CroppedPhoto";
import type { LovePhoto } from "../../../_valentine/types";
import { A, img } from "../assets";
import Diya from "./Diya";
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


  return (
    <section className={`pd-court${open ? " is-on" : ""}`} aria-label={`${first} ${s.and} ${second}`}>
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
        {/* Tablets and up: a shorter, denser fringe, the strand repeated at a smaller scale. */}
        <span className="pd-court-ivy-fringe" style={{ backgroundImage: `url(${A.ivy.src})` }} />
      </div>
      {/* The floral arch's two halves bloom from the top corners. */}
      {(["l", "r"] as const).map((sd) => (
        <span key={sd} className={`pd-court-corner is-${sd}`} aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...img(sd === "l" ? A.floralL : A.floralR)} />
        </span>
      ))}
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
          {/* Behind the couple: warm light and a slowly turning gold mandala. */}
          <span className="pd-arch-glow" aria-hidden />
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img className="pd-arch-mandala" {...img(A.mandala)} aria-hidden />

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
          {/* Lotuses and diyas at the couple's feet. */}
          <span className="pd-arch-foot" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img className="pd-arch-lotus is-l" {...img(A.lotus)} />
            {[0, 1, 2].map((i) => (
              <Diya key={i} className={`pd-arch-diya is-${i}`} />
            ))}
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img className="pd-arch-lotus is-r" {...img(A.lotus)} />
          </span>
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
        {/* The balustrade, repeated edge to edge (the tile is cut post-centre to post-centre). */}
        <span className="pd-court-rail" style={{ backgroundImage: `url(${A.railTile.src})` }} />
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img className="pd-court-urn is-l" {...img(A.urn)} />
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img className="pd-court-urn is-r" {...img(A.urn)} />
      </div>
    </section>
  );
}
