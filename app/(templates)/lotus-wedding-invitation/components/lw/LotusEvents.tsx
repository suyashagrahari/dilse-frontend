"use client";

// ─── The functions as illustrated panels (spec 6.3 scene 6) ──────────────────
// Each function is its own panel: an arched "window" with a vignette picked
// from its title (haldi = the museum marigold painting, mehendi = the floral
// medallion, sangeet = the miniature dhol player GIF, baraat = the gold palki,
// pheras = the pietra-dura arch, reception = a jhoomar …) over the details the
// kit's EventsTimeline shows (time, venue, dress-code swatch, note, map and
// calendar), plus "Save all dates". Same behaviour, the Royal look.

import { useState } from "react";
import { DEFAULT_TZ_OFFSET, Reveal, downloadWeddingIcs, formatEventDate, formatEventTime, mapLink, type WeddingEvent } from "../../../_wedding";
import type { WeddingArtId } from "../../../_wedding/art";
import { GIF, artImg } from "./art";
import { MAIN_RE } from "./model";

interface Vignette {
  art: WeddingArtId;
  /** "paint" = an opaque painting that fills the window; "line" = a cutout on the theme glow. */
  kind: "paint" | "line";
  gif?: string;
  /** Crop into a painting past its museum mount. */
  zoom?: number;
}

const VIGNETTES: [RegExp, Vignette][] = [
  [/haldi|pithi|ubtan|tel ban|mayra|हल्दी/i, { art: "museum/indian-marigold", kind: "paint", zoom: 1.75 }],
  [/mehendi|mehndi|henna|मेहंदी/i, { art: "museum/spread-floral-medallion", kind: "paint", zoom: 1.35 }],
  [/sangeet|garba|dandiya|music|dance|cocktail|संगीत/i, { art: "museum/floral-canopy-gold-leaf", kind: "paint", gif: GIF.dhol, zoom: 1.15 }],
  [/baraat|barat|procession|ghudchadi|sehra|milni|बारात/i, { art: "royal/palki-doli-gold-line-01", kind: "line" }],
  [/reception|dinner|party|gala|banquet|स्वागत/i, { art: "royal/jhoomar-chandelier-gold-01", kind: "line" }],
  [/tilak|roka|engagement|sagai|ring|सगाई/i, { art: "royal/kalash-line-01", kind: "line" }],
  [MAIN_RE, { art: "royal/mughal-pietra-dura-arch-01", kind: "line" }],
];
const FALLBACK: Vignette = { art: "museum/lotus-canopy", kind: "paint", zoom: 1.3 };
const vignetteFor = (title: string): Vignette => VIGNETTES.find(([re]) => re.test(title))?.[1] ?? FALLBACK;

function Icon({ d }: { d: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}
const PIN = "M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21zM12 12.2a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2z";
const CAL = "M7 3v3M17 3v3M4 8.5h16M5 5.5h14a1 1 0 0 1 1 1V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1zM8.5 13h3v3h-3z";
const CLOCK = "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7.5V12l3 2";

function Art({ v }: { v: Vignette }) {
  const [gifOk, setGifOk] = useState(true);
  return (
    <div className={`lw-ev-art is-${v.kind}`} aria-hidden>
      <span className="lw-ev-win">
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img className="lw-ev-img" {...artImg(v.art, { lazy: true })} style={v.zoom ? { transform: `scale(${v.zoom})` } : undefined} />
      </span>
      {v.gif && gifOk && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="lw-ev-gif" src={v.gif} alt="" width={200} height={200} loading="lazy" decoding="async" onError={() => setGifOk(false)} />
      )}
    </div>
  );
}

export interface LotusEventsProps {
  events: readonly WeddingEvent[];
  couple: string;
  url?: string;
  locale: string;
  labels: { directions: string; calendar: string; saveAll: string; dress: string; tba: string };
}

export default function LotusEvents({ events, couple, url, locale, labels: l }: LotusEventsProps) {
  const [flash, setFlash] = useState<string | null>(null);
  const list = events.filter((e) => e.title || e.venue || e.date);
  if (!list.length) return null;
  const save = (es: readonly WeddingEvent[], key: string, name: string) => {
    const ok = downloadWeddingIcs(es, { couple, url, tz: DEFAULT_TZ_OFFSET }, name);
    setFlash(ok ? key : `${key}:err`);
    window.setTimeout(() => setFlash(null), 2200);
  };
  return (
    <div className="lw-evs">
      <ol className="lw-ev-list">
        {list.map((e, i) => {
          const date = formatEventDate(e.date, locale);
          const time = formatEventTime(e.time, locale);
          const end = formatEventTime(e.endTime, locale);
          const map = mapLink(e);
          const key = e.id || String(i);
          const swatch = e.dressColor && /^#[0-9a-f]{3,8}$/i.test(e.dressColor) ? e.dressColor : null;
          return (
            <Reveal as="li" key={key} effect="zoom" className={`lw-ev${i % 2 ? " is-alt" : ""}`}>
              <article className="lw-ev-card">
                <Art v={vignetteFor(e.title)} />
                <span className="lw-ev-no" aria-hidden>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="lw-ev-body">
                  {date && <p className="wk-eyebrow wk-ev-date">{date}</p>}
                  <h3 className="lw-ev-title">{e.title}</h3>
                  <p className="lw-ev-line">
                    <Icon d={CLOCK} />
                    {time ? `${time}${end ? ` – ${end}` : ""}` : l.tba}
                  </p>
                  {(e.venue || e.address) && (
                    <p className="lw-ev-line">
                      <Icon d={PIN} />
                      <span>
                        {e.venue && <b>{e.venue}</b>}
                        {e.address && <span className="lw-ev-addr">{e.address}</span>}
                      </span>
                    </p>
                  )}
                  {e.dressCode && (
                    <p className="lw-ev-line lw-ev-dress">
                      {swatch && <span className="lw-ev-swatch" style={{ background: swatch }} aria-hidden />}
                      <span>
                        <span className="wk-ev-k">{l.dress}</span> {e.dressCode}
                      </span>
                    </p>
                  )}
                  {e.note && <p className="lw-ev-note">{e.note}</p>}
                  {(map || e.date) && (
                    <div className="lw-ev-actions">
                      {map && (
                        <a className="wk-btn wk-btn-ghost wk-btn-sm" href={map} target="_blank" rel="noopener noreferrer">
                          <Icon d={PIN} /> {l.directions}
                        </a>
                      )}
                      {e.date && (
                        <button type="button" className="wk-btn wk-btn-ghost wk-btn-sm" onClick={() => save([e], key, `${e.title || "event"}-${couple}`)}>
                          <Icon d={CAL} /> {flash === key ? "Saved ✓" : l.calendar}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </article>
            </Reveal>
          );
        })}
      </ol>
      {list.filter((e) => e.date).length > 1 && (
        <div className="lw-ev-all">
          <button type="button" className="wk-btn" onClick={() => save(list, "all", `wedding-${couple}`)}>
            <Icon d={CAL} /> {flash === "all" ? "Saved ✓" : l.saveAll}
          </button>
        </div>
      )}
    </div>
  );
}
