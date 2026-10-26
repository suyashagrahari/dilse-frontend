"use client";

// ─── The functions: a terrace stage per celebration, each with its couple ────
// Every function opens on a little stage: a rounded arch window over the
// lake, glowing in the function's colour (turmeric for the haldi, henna green
// for the mehndi, coral for the sangeet, periwinkle for the reception, rose
// for the wedding), the couple dressed for it (template14), the date on a
// powder-blue leaf and a watercolour sprig in the corner. Below: the name (in
// Hindi on the Hindi page when it is a known function), time, venue, dress
// code, note and the actions (directions, calendar, Google, WhatsApp). "Save
// all dates" sits underneath. Phones: a swipe rail with dots; 2 across at
// ≥700px, 3 at ≥1100px.

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { DEFAULT_TZ_OFFSET, FN_COUPLE, FN_TINT, Reveal, downloadWeddingIcs, fnTitle, formatEventTime, googleCalendarUrl, hiTime, kindOf, mapLink, type WeddingEvent } from "../../../_wedding";
import { Btn, CAL, CLOCK, Icon, PIN, WA, openWhatsApp, pageUrl } from "./Actions";
import { img, type ArtKey } from "./art";
import { MAIN_RE, type Lang } from "./model";

const SPRIGS: ArtKey[] = ["blossom", "lotus", "anthurium"];

export interface EventsProps {
  events: readonly WeddingEvent[];
  couple: string;
  locale: string;
  lang: Lang;
  labels: { directions: string; calendar: string; calShort: string; gcal: string; saveAll: string; dress: string; tba: string; whatsapp: string; swipe: string; saved: string };
}

function parts(date: string, locale: string) {
  const d = new Date(`${date}T12:00:00+05:30`);
  if (Number.isNaN(d.getTime())) return null;
  return {
    day: String(d.getDate()),
    month: d.toLocaleDateString(locale, { month: "short", timeZone: "Asia/Kolkata" }),
    weekday: d.toLocaleDateString(locale, { weekday: "long", timeZone: "Asia/Kolkata" }),
    full: d.toLocaleDateString(locale, { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }),
  };
}

export default function Events({ events, couple, locale, lang, labels: l }: EventsProps) {
  const [flash, setFlash] = useState<string | null>(null);
  const [at, setAt] = useState(0);
  const railRef = useRef<HTMLOListElement>(null);
  const list = events.filter((e) => e.title || e.venue || e.date);

  // Phones: which card the swipe rail rests on (the dots under it).
  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const kids = Array.from(el.children) as HTMLElement[];
        const mid = el.scrollLeft + el.clientWidth / 2;
        let best = 0;
        kids.forEach((k, i) => {
          if (Math.abs(k.offsetLeft + k.offsetWidth / 2 - mid) < Math.abs(kids[best].offsetLeft + kids[best].offsetWidth / 2 - mid)) best = i;
        });
        setAt(best);
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!list.length) return null;
  const go = (i: number) => {
    const el = railRef.current;
    const k = el?.children[i] as HTMLElement | undefined;
    if (el && k) el.scrollTo({ left: k.offsetLeft - (el.clientWidth - k.offsetWidth) / 2, behavior: "smooth" });
  };
  const mainIdx = Math.max(0, list.findIndex((e) => MAIN_RE.test(e.title)));
  const clock = (t: string | undefined) => (lang === "hi" ? hiTime(t ?? "") : formatEventTime(t, locale));
  const save = (es: readonly WeddingEvent[], key: string, name: string) => {
    const ok = downloadWeddingIcs(es, { couple, url: pageUrl(), tz: DEFAULT_TZ_OFFSET }, name);
    setFlash(ok ? key : `${key}:err`);
    window.setTimeout(() => setFlash(null), 2200);
  };
  return (
    <div className="wp-evs">
      <ol ref={railRef} className={`wp-ev-list${list.length > 1 ? " is-rail" : ""}`}>
        {list.map((e, i) => {
          const d = e.date ? parts(e.date, locale) : null;
          const time = clock(e.time);
          const end = clock(e.endTime);
          const map = mapLink(e);
          const key = e.id || String(i);
          const swatch = e.dressColor && /^#[0-9a-f]{3,8}$/i.test(e.dressColor) ? e.dressColor : null;
          const isMain = i === mainIdx;
          const kind = isMain ? "wedding" : kindOf(e.title, i);
          const art = FN_COUPLE[kind];
          const title = fnTitle(e.title, lang);
          const shareLine = `${e.title} · ${couple}${d ? ` · ${d.full}` : ""}${time ? `, ${time}` : ""}${e.venue ? ` · ${e.venue}` : ""}`;
          return (
            <Reveal as="li" key={key} effect="rise" delay={(i % 3) * 110} className={`wp-ev is-${kind}${isMain ? " is-main" : ""}`} style={{ ["--fn" as string]: FN_TINT[kind] } as CSSProperties}>
              <article className="wp-ev-card">
                <div className="wp-ev-stage" aria-hidden>
                  <span className="wp-ev-window" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className={`wp-ev-couple is-${kind}`} src={art.src} width={art.w} height={art.h} alt="" loading="lazy" decoding="async" draggable={false} />
                  <span className="wp-ev-floor" />
                  {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                  <img {...img(SPRIGS[i % SPRIGS.length], { lazy: true })} className="wp-ev-sprig" />
                </div>
                <div className="wp-ev-plate">
                  {d ? (
                    <>
                      <span className="wp-ev-day">{d.day}</span>
                      <span className="wp-ev-mon">{d.month}</span>
                      <span className="wp-ev-wd">{d.weekday}</span>
                    </>
                  ) : (
                    <span className="wp-ev-mon">{l.tba}</span>
                  )}
                </div>
                <div className="wp-ev-body">
                  <h3 className="wp-ev-title" lang={title !== e.title ? "hi" : undefined}>
                    {title}
                  </h3>
                  <p className="wp-ev-line">
                    <Icon d={CLOCK} />
                    <span>{time ? `${time}${end ? ` – ${end}` : ""}` : l.tba}</span>
                  </p>
                  {(e.venue || e.address) && (
                    <p className="wp-ev-line">
                      <Icon d={PIN} />
                      <span>
                        {e.venue && <b>{e.venue}</b>}
                        {e.address && <span className="wp-ev-addr">{e.address}</span>}
                      </span>
                    </p>
                  )}
                  {e.dressCode && (
                    <p className="wp-ev-line wp-ev-dress">
                      {swatch ? <span className="wp-ev-swatch" style={{ background: swatch }} aria-hidden /> : <Icon d="M8 4l4 3 4-3 4 4-3 3v9H7v-9L4 8z" />}
                      <span>
                        <span className="wp-ev-k">{l.dress}</span> {e.dressCode}
                      </span>
                    </p>
                  )}
                  {e.note && <p className="wp-ev-note">{e.note}</p>}
                  <div className="wp-ev-actions">
                    {map && (
                      <Btn href={map} icon={PIN} ghost className="is-sm">
                        {l.directions}
                      </Btn>
                    )}
                    {e.date && (
                      <Btn icon={CAL} ghost className="is-sm" label={`${l.calendar}: ${e.title}`} onClick={() => save([e], key, `${e.title || "event"}-${couple}`)}>
                        {flash === key ? l.saved : l.calShort}
                      </Btn>
                    )}
                    {e.date && (
                      <a className="wp-ev-g" href={googleCalendarUrl(e, { couple, url: pageUrl(), tz: DEFAULT_TZ_OFFSET })} target="_blank" rel="noopener noreferrer" aria-label={`${e.title}: Google Calendar`}>
                        <Icon d={CAL} size={15} /> <span>{l.gcal}</span>
                      </a>
                    )}
                    <button type="button" className="wp-ev-wa" onClick={() => openWhatsApp(shareLine)} aria-label={`${l.whatsapp}: ${e.title}`}>
                      <Icon d={WA} fill size={16} /> <span>WhatsApp</span>
                    </button>
                  </div>
                </div>
              </article>
            </Reveal>
          );
        })}
      </ol>
      {list.length > 1 && (
        <div className="wp-ev-dots" role="group" aria-label={l.swipe}>
          {list.map((e, i) => (
            <button key={e.id || i} type="button" className={i === at ? "is-on" : undefined} aria-label={fnTitle(e.title, lang)} aria-current={i === at || undefined} onClick={() => go(i)} />
          ))}
        </div>
      )}
      {list.filter((e) => e.date).length > 1 && (
        <Reveal className="wp-ev-all">
          <Btn icon={CAL} onClick={() => save(list.filter((e) => e.date), "all", `wedding-${couple}`)}>
            {flash === "all" ? l.saved : l.saveAll}
          </Btn>
        </Reveal>
      )}
    </div>
  );
}
