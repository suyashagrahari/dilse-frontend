"use client";

// ─── The functions: one card per celebration, each with its own couple ──────
// Every function opens on a little stage: a rounded palace arch glowing in the
// function's colour (turmeric for the haldi, henna green for the mehndi, coral
// for the sangeet, periwinkle for the reception, rose for the wedding), the
// couple dressed for it (template14: yellow for the haldi, the orange saree
// at the mehndi, dancing at the sangeet, the red lehenga for the pheras, the
// gown and tux at the reception), the date on a calendar leaf and the gold
// line-art swirl. Below: the name in script (in Hindi on the Hindi page when
// it is a known function), the time, the venue, the dress code with its
// swatch, the note, directions and add-to-calendar (.ics + Google). The main
// ceremony is crowned with a rose bouquet. "Save all dates" closes it.
// Phones: a swipe carousel (snap, dots); tablets two across; desktops three.

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { DEFAULT_TZ_OFFSET, Reveal, downloadWeddingIcs, formatEventTime, googleCalendarUrl, mapLink, type WeddingEvent } from "../../../_wedding";
import { A, FN_COUPLE, img } from "./assets";
import { DATE_RE, MAIN_RE, fnTitle, hiTime, kindOf, type FnKind, type Lang } from "./model";

function Icon({ d }: { d: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}
export const PIN = "M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21zM12 12.2a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2z";
export const CAL = "M7 3v3M17 3v3M4 8.5h16M5 5.5h14a1 1 0 0 1 1 1V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1zM8.5 13h3v3h-3z";
const CLOCK = "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7.5V12l3 2";

/** Each function's glow: the colour the family dresses in for it, softened to sit on blush paper. */
const TINT: Record<FnKind, string> = {
  haldi: "#F2C14E",
  mehndi: "#8DBB6A",
  sangeet: "#F09A72",
  reception: "#A9B5E4",
  engagement: "#E7C9B5",
  wedding: "#D9506A",
};

function leaf(date: string, locale: string) {
  if (!DATE_RE.test(date)) return null;
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12));
  return {
    day: String(d),
    month: dt.toLocaleDateString(locale, { month: "short", timeZone: "UTC" }).replace(/\.$/, ""),
    weekday: dt.toLocaleDateString(locale, { weekday: "long", timeZone: "UTC" }),
  };
}

export interface EventsProps {
  events: readonly WeddingEvent[];
  couple: string;
  url?: string;
  locale: string;
  lang: Lang;
  labels: { directions: string; calendar: string; saveAll: string; dress: string; tba: string; saved: string; swipe: string };
}

export default function Events({ events, couple, url, locale, lang, labels: l }: EventsProps) {
  const [flash, setFlash] = useState<string | null>(null);
  const [at, setAt] = useState(0);
  const railRef = useRef<HTMLOListElement>(null);
  const list = events.filter((e) => e.title || e.venue || e.date);

  // Phones: which card the swipe rail is resting on (the dots under it).
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
  const mainId = (list.find((e) => MAIN_RE.test(e.title)) ?? list[0]).id;
  const save = (es: readonly WeddingEvent[], key: string, name: string) => {
    const ok = downloadWeddingIcs(es, { couple, url, tz: DEFAULT_TZ_OFFSET }, name);
    setFlash(ok ? key : `${key}:err`);
    window.setTimeout(() => setFlash(null), 2200);
  };
  const go = (i: number) => {
    const el = railRef.current;
    const k = el?.children[i] as HTMLElement | undefined;
    if (el && k) el.scrollTo({ left: k.offsetLeft - (el.clientWidth - k.offsetWidth) / 2, behavior: "smooth" });
  };

  return (
    <div className="cw-evs">
      <ol ref={railRef} className={`cw-ev-grid n-${Math.min(list.length, 3)}${list.length > 1 ? " is-rail" : ""}`}>
        {list.map((e, i) => {
          const lf = leaf(e.date, locale);
          const time = lang === "hi" ? hiTime(e.time) : formatEventTime(e.time, locale);
          const end = lang === "hi" ? hiTime(e.endTime ?? "") : formatEventTime(e.endTime, locale);
          const map = mapLink(e);
          const key = e.id || String(i);
          const swatch = e.dressColor && /^#[0-9a-f]{3,8}$/i.test(e.dressColor) ? e.dressColor : null;
          const gcal = e.date ? googleCalendarUrl(e, { couple, url, tz: DEFAULT_TZ_OFFSET }) : "";
          const isMain = e.id === mainId;
          const kind = isMain ? "wedding" : kindOf(e.title, i);
          const art = FN_COUPLE[kind];
          const title = fnTitle(e.title, lang);
          return (
            <Reveal as="li" key={key} className={`cw-ev is-${kind}${isMain ? " is-main" : ""}`} delay={(i % 3) * 110} style={{ ["--fn" as string]: TINT[kind] } as CSSProperties}>
              <article className="cw-ev-card">
                <div className="cw-ev-stage" aria-hidden>
                  <span className="cw-ev-window" />
                  {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                  <img className="cw-ev-swirl is-l" {...img(A.swirl, { lazy: true })} />
                  {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                  <img className="cw-ev-swirl is-r" {...img(A.swirl, { lazy: true })} />
                  {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                  <img className={`cw-ev-couple is-${kind}`} {...img(art, { lazy: true })} />
                  <span className="cw-ev-floor" />
                  {isMain && (
                    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
                    <img className="cw-ev-roses" {...img(A.roses, { lazy: true })} />
                  )}
                  {lf ? (
                    <span className="cw-ev-leaf">
                      <b>{lf.day}</b>
                      <small>{lf.month}</small>
                    </span>
                  ) : (
                    <span className="cw-ev-leaf is-empty">
                      <b>{String(i + 1).padStart(2, "0")}</b>
                    </span>
                  )}
                </div>
                <div className="cw-ev-info">
                  <div className="cw-ev-titles">
                    {lf && <p className="cw-ev-wd">{lf.weekday}</p>}
                    <h3 className="cw-ev-title" lang={title !== e.title ? "hi" : undefined}>
                      {title}
                    </h3>
                  </div>
                  <div className="cw-ev-body">
                    <p className="cw-ev-line">
                      <Icon d={CLOCK} />
                      <span>{time ? `${time}${end ? ` – ${end}` : ""}` : l.tba}</span>
                    </p>
                    {(e.venue || e.address) && (
                      <p className="cw-ev-line">
                        <Icon d={PIN} />
                        <span>
                          {e.venue && <b>{e.venue}</b>}
                          {e.address && <span className="cw-ev-addr">{e.address}</span>}
                        </span>
                      </p>
                    )}
                    {e.dressCode && (
                      <p className="cw-ev-line cw-ev-dress">
                        {swatch ? <span className="cw-ev-swatch" style={{ background: swatch }} aria-hidden /> : <Icon d="M8 3l4 3 4-3 4 4-3 3v11H7V10L4 7z" />}
                        <span>
                          <span className="cw-ev-k">{l.dress}</span> {e.dressCode}
                        </span>
                      </p>
                    )}
                    {e.note && <p className="cw-ev-note">{e.note}</p>}
                  </div>
                  {(map || e.date) && (
                    <div className="cw-ev-actions">
                      {map && (
                        <a className="cw-btn cw-btn-ghost cw-btn-sm" href={map} target="_blank" rel="noopener noreferrer">
                          <Icon d={PIN} /> {l.directions}
                        </a>
                      )}
                      {e.date && (
                        <button type="button" className="cw-btn cw-btn-ghost cw-btn-sm" onClick={() => save([e], key, `${e.title || "event"}-${couple}`)}>
                          <Icon d={CAL} /> {flash === key ? l.saved : l.calendar}
                        </button>
                      )}
                    </div>
                  )}
                  {gcal && (
                    <a className="cw-ev-gcal" href={gcal} target="_blank" rel="noopener noreferrer" aria-label={`Google Calendar: ${e.title}`}>
                      + Google Calendar
                    </a>
                  )}
                </div>
              </article>
            </Reveal>
          );
        })}
      </ol>
      {list.length > 1 && (
        <div className="cw-ev-dots" role="group" aria-label={l.swipe}>
          {list.map((e, i) => (
            <button key={e.id || i} type="button" className={i === at ? "is-on" : undefined} aria-label={fnTitle(e.title, lang)} aria-current={i === at || undefined} onClick={() => go(i)} />
          ))}
        </div>
      )}
      {list.filter((e) => e.date).length > 1 && (
        <Reveal className="cw-ev-all">
          <button type="button" className="cw-btn cw-btn-rose" onClick={() => save(list, "all", `wedding-${couple}`)}>
            <Icon d={CAL} /> {flash === "all" ? l.saved : l.saveAll}
          </button>
        </Reveal>
      )}
    </div>
  );
}
