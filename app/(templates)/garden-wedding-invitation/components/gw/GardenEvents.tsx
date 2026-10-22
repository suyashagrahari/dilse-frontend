"use client";

// ─── The functions: garden cards, each with its own little painting ──────────
// Every function is an arched card: a watercolour vignette picked from its
// title (mehendi = the couple on the sofa, sangeet = the lanterns, haldi = the
// chhatri umbrellas, the pheras = the flowering gazebo …) on a wash of its
// dress-code colour, then the date, time, venue, dress-code swatch and note,
// and its own Directions / Add to calendar / Share buttons. The main function
// also gets "Watch live" when the sender added a livestream. One column on
// phones, two on tablets, three on wide screens.

import { useState } from "react";
import { DEFAULT_TZ_OFFSET, Reveal, downloadWeddingIcs, formatEventDate, formatEventTime, mapLink, type WeddingEvent } from "../../../_wedding";
import { GW, gwImg, type WeddingAsset } from "../assets";
import { shareableUrl, whatsappUrl } from "./guest";
import { MAIN_RE } from "./model";
import { ICON, Icon, WhatsAppGlyph } from "./ShareBar";

interface Vignette {
  art: WeddingAsset;
  /** How the art sits in the window: "stand" = bottom-anchored, "hang" = from the top. */
  fit: "stand" | "hang";
  flip?: boolean;
}

const VIGNETTES: [RegExp, Vignette][] = [
  [/haldi|pithi|ubtan|tel ban|mayra|हल्दी/i, { art: GW.chhatri, fit: "stand" }],
  [/mehendi|mehndi|henna|मेहंदी/i, { art: GW.coupleSofa, fit: "stand" }],
  [/sangeet|garba|dandiya|music|dance|संगीत/i, { art: GW.lanterns, fit: "hang" }],
  [/cocktail|party|after/i, { art: GW.palm, fit: "stand" }],
  [/baraat|barat|procession|ghudchadi|sehra|milni|बारात/i, { art: GW.peacockFlowers, fit: "stand" }],
  [/reception|dinner|gala|banquet|स्वागत/i, { art: GW.couplePeach, fit: "stand" }],
  [/tilak|roka|engagement|sagai|ring|सगाई/i, { art: GW.rose, fit: "stand" }],
  [MAIN_RE, { art: GW.pavilion, fit: "stand" }],
];
const FALLBACKS: Vignette[] = [
  { art: GW.lotus, fit: "stand" },
  { art: GW.anthurium, fit: "stand" },
  { art: GW.gazeboDome, fit: "stand" },
];
const vignetteFor = (title: string, i: number): Vignette => VIGNETTES.find(([re]) => re.test(title))?.[1] ?? FALLBACKS[i % FALLBACKS.length];

export interface GardenEventsProps {
  events: readonly WeddingEvent[];
  couple: string;
  locale: string;
  lang: "en" | "hi";
  mainId?: string;
  live?: { url: string; open: boolean; label: string; soon: string };
  labels: { directions: string; calendar: string; saveAll: string; dress: string; tba: string; share: string; saved: string };
}

export default function GardenEvents({ events, couple, locale, lang, mainId, live, labels: l }: GardenEventsProps) {
  const [flash, setFlash] = useState<string | null>(null);
  const list = events.filter((e) => e.title || e.venue || e.date);
  if (!list.length) return null;
  const save = (es: readonly WeddingEvent[], key: string, name: string) => {
    const ok = downloadWeddingIcs(es, { couple, url: shareableUrl(), tz: DEFAULT_TZ_OFFSET }, name);
    setFlash(ok ? key : `${key}:err`);
    window.setTimeout(() => setFlash(null), 2200);
  };
  const share = (e: WeddingEvent) => {
    const when = [formatEventDate(e.date, locale), formatEventTime(e.time, locale)].filter(Boolean).join(", ");
    const text = [`${e.title} · ${couple}`, when, e.venue, e.dressCode ? `${l.dress}: ${e.dressCode}` : "", shareableUrl()].filter(Boolean).join("\n");
    window.open(whatsappUrl(text), "_blank", "noopener,noreferrer");
  };
  return (
    <div className="gw-evs">
      <ol className="gw-ev-list">
        {list.map((e, i) => {
          const date = formatEventDate(e.date, locale);
          const time = formatEventTime(e.time, locale);
          const end = formatEventTime(e.endTime, locale);
          const map = mapLink(e);
          const key = e.id || String(i);
          const swatch = e.dressColor && /^#[0-9a-f]{3,8}$/i.test(e.dressColor) ? e.dressColor : null;
          const v = vignetteFor(e.title, i);
          const isMain = !!mainId && e.id === mainId;
          return (
            <Reveal as="li" key={key} effect="rise" delay={(i % 3) * 90} className={`gw-ev${isMain ? " is-main" : ""}`}>
              <article className="gw-ev-card" style={swatch ? { ["--gw-sw" as string]: swatch } : undefined}>
                <div className={`gw-ev-art is-${v.fit}`} aria-hidden>
                  <span className="gw-ev-wash" />
                  {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                  <img className="gw-ev-img" {...gwImg(v.art, { lazy: true })} />
                  <span className="gw-ev-no">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <div className="gw-ev-body">
                  {date && (
                    <p className="wk-eyebrow gw-ev-date" lang={lang}>
                      {date}
                    </p>
                  )}
                  <h3 className="gw-ev-title">{e.title}</h3>
                  <p className="gw-ev-line">
                    <Icon d={ICON.clock} size={16} />
                    <span lang={lang}>{time ? `${time}${end ? ` – ${end}` : ""}` : l.tba}</span>
                  </p>
                  {(e.venue || e.address) && (
                    <p className="gw-ev-line">
                      <Icon d={ICON.pin} size={16} />
                      <span>
                        {e.venue && <b>{e.venue}</b>}
                        {e.address && <span className="gw-ev-addr">{e.address}</span>}
                      </span>
                    </p>
                  )}
                  {e.dressCode && (
                    <p className="gw-ev-line gw-ev-dress">
                      {swatch ? <span className="gw-ev-swatch" style={{ background: swatch }} aria-hidden /> : <Icon d={ICON.image} size={16} />}
                      <span>
                        <span className="gw-ev-k" lang={lang}>
                          {l.dress}
                        </span>{" "}
                        {e.dressCode}
                      </span>
                    </p>
                  )}
                  {e.note && <p className="gw-ev-note">{e.note}</p>}
                  <div className="gw-ev-actions">
                    {map && (
                      <a className="gw-pill" href={map} target="_blank" rel="noopener noreferrer" lang={lang}>
                        <Icon d={ICON.pin} size={15} /> {l.directions}
                      </a>
                    )}
                    {e.date && (
                      <button type="button" className="gw-pill" onClick={() => save([e], key, `${e.title || "event"}-${couple}`)} lang={lang}>
                        <Icon d={flash === key ? ICON.check : ICON.cal} size={15} /> {flash === key ? l.saved : l.calendar}
                      </button>
                    )}
                    <button type="button" className="gw-pill gw-pill-icon" onClick={() => share(e)} aria-label={`${l.share}: ${e.title}`}>
                      <WhatsAppGlyph size={16} />
                    </button>
                  </div>
                  {isMain && live && (
                    <div className="gw-ev-live">
                      {live.open ? (
                        <a className="wk-btn wk-btn-sm gw-live-btn" href={live.url} target="_blank" rel="noopener noreferrer" lang={lang}>
                          <span className="gw-live-dot" aria-hidden /> {live.label}
                        </a>
                      ) : (
                        <p className="gw-ev-livesoon" lang={lang}>
                          <Icon d={ICON.live} size={15} /> {live.soon}
                        </p>
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
        <div className="gw-ev-all">
          <button type="button" className="wk-btn" onClick={() => save(list.filter((e) => e.date), "all", `wedding-${couple}`)} lang={lang}>
            <Icon d={flash === "all" ? ICON.check : ICON.cal} /> {flash === "all" ? l.saved : l.saveAll}
          </button>
        </div>
      )}
    </div>
  );
}
