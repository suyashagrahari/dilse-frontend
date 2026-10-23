"use client";

// ─── The sections of the evening, below the hero ─────────────────────────────

import { useState, type ReactNode } from "react";
import { cropImgStyle } from "../../_valentine/editor/PhotoCropper";
import { Countdown, Reveal, formatEventDate, formatEventTime, googleCalendarUrl, mapLink, downloadWeddingIcs, DEFAULT_TZ_OFFSET, type WeddingEvent } from "../../_wedding";
import { Btn, CAL, CLOCK, Icon, PIN, PLAY, pageUrl, useFlash } from "./Actions";
import { img } from "./art";
import { clock12, swatchFor } from "./model";
import { MONTHS_HI, type Strings } from "./strings";
import type { Lang, PersonInfo, StoryChapter, Thing } from "./types";

/** Eyebrow, title and the white-gold lotus divider, revealed on scroll. */
export function Head({ eyebrow, title, lang }: { eyebrow: ReactNode; title?: ReactNode; lang: Lang }) {
  return (
    <Reveal className="rc-head">
      <p className="rc-eyebrow" lang={lang}>
        {eyebrow}
      </p>
      {title && (
        <h2 className="rc-h2" lang={lang}>
          {title}
        </h2>
      )}
      <span className="rc-divider" aria-hidden>
        <i />
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img("lotusOpen", { lazy: true })} />
        <i />
      </span>
    </Reveal>
  );
}

// ── The invitation card ─────────────────────────────────────────────────────

export function Invitation({ text, hindi, lang, s, blessingsOf, signature }: { text: string; hindi: string; lang: Lang; s: Strings; blessingsOf: string; signature: string }) {
  const paras = text.split(/\n+/).map((p) => p.trim()).filter(Boolean);
  const showHindiFirst = lang === "hi" && !!hindi;
  return (
    <Reveal className="rc-invite">
      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
      <img {...img("swirl", { lazy: true })} className="rc-invite-swirl rc-invite-swirl-l" aria-hidden />
      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
      <img {...img("swirl", { lazy: true })} className="rc-invite-swirl rc-invite-swirl-r" aria-hidden />
      <p className="rc-eyebrow" lang={lang}>
        {s.together}
      </p>
      <div className={`rc-invite-cols${hindi ? " has-hi" : ""}${showHindiFirst ? " hi-first" : ""}`}>
        <div className="rc-invite-en">
          {paras.map((p, i) => (
            <p key={i} className={i === 0 ? "rc-invite-lead" : undefined}>
              {p}
            </p>
          ))}
        </div>
        {hindi && (
          <div className="rc-invite-hi" lang="hi">
            {hindi.split(/\n\s*\n/).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        )}
      </div>
      {blessingsOf && (
        <p className="rc-invite-bless">
          <span lang={lang}>{s.blessingsOf}</span>
          <b>{blessingsOf}</b>
        </p>
      )}
      <p className="rc-invite-sign">{signature}</p>
      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
      <img {...img("roses", { lazy: true })} className="rc-invite-roses" aria-hidden />
    </Reveal>
  );
}

// ── The couple ──────────────────────────────────────────────────────────────

function Portrait({ p, label, family, familyLabel, lang, delay }: { p: PersonInfo; label: string; family: string; familyLabel: string; lang: Lang; delay: number }) {
  return (
    <Reveal className="rc-person" delay={delay}>
      <div className="rc-person-frame">
        {p.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.photo} alt={p.name} loading="lazy" decoding="async" style={cropImgStyle({ x: p.cropX ?? 50, y: p.cropY ?? 50, scale: p.scale ?? 100 })} />
        ) : (
          <span className="rc-person-ini" aria-hidden>
            {(p.name || label).slice(0, 1)}
          </span>
        )}
      </div>
      <div className="rc-person-body">
        <p className="rc-person-role" lang={lang}>
          {label}
        </p>
        <h3 className="rc-person-name">{p.name}</h3>
        {family && (
          <p className="rc-person-fam">
            <span lang={lang}>{familyLabel}</span> {family}
          </p>
        )}
        {p.description && <p className="rc-person-desc">{p.description}</p>}
        {p.tags.length > 0 && (
          <ul className="rc-tags">
            {p.tags.map((t, i) => (
              <li key={i}>
                {t.emoji && <span aria-hidden>{t.emoji}</span>} {t.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Reveal>
  );
}

export function Couple({ bride, groom, families, s, lang, initials }: { bride: PersonInfo; groom: PersonInfo; families: { bride: string; groom: string }; s: Strings; lang: Lang; initials: string }) {
  return (
    <div className="rc-couple">
      <Portrait p={bride} label={s.bride} family={families.bride} familyLabel={s.daughterOf} lang={lang} delay={0} />
      <Reveal effect="zoom" className="rc-monogram" delay={120}>
        <span aria-hidden>{initials}</span>
      </Reveal>
      <Portrait p={groom} label={s.groom} family={families.groom} familyLabel={s.sonOf} lang={lang} delay={160} />
    </div>
  );
}

// ── The date + countdown ────────────────────────────────────────────────────

export function DateBlock({ main, s, lang }: { main: WeddingEvent; s: Strings; lang: Lang }) {
  const [y, mo, d] = main.date.split("-").map(Number);
  const month = lang === "hi" ? MONTHS_HI[mo - 1] : new Date(Date.UTC(y, mo - 1, d)).toLocaleDateString("en-IN", { month: "long", timeZone: "UTC" });
  const weekday = new Date(Date.UTC(y, mo - 1, d)).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", { weekday: "long", timeZone: "UTC" });
  return (
    <div className="rc-date">
      <Reveal effect="zoom" className="rc-date-card">
        <span className="rc-date-wk" lang={lang}>
          {weekday}
        </span>
        <span className="rc-date-d">{d}</span>
        <span className="rc-date-m" lang={lang}>
          {month}
        </span>
        <span className="rc-date-y">{y}</span>
        {main.time && <span className="rc-date-t">{clock12(main.time)}</span>}
      </Reveal>
      <Reveal className="rc-date-count" delay={120}>
        <Countdown date={main.date} time={main.time || "19:00"} variant="flip" labels={s.units} doneText={s.done} />
      </Reveal>
    </div>
  );
}

// ── Our story ───────────────────────────────────────────────────────────────

export function Story({ chapters }: { chapters: StoryChapter[] }) {
  const rows = chapters.filter((c) => c.title || c.line);
  return (
    <ol className="rc-story">
      {rows.map((c, i) => (
        <Reveal as="li" key={i} className={`rc-chapter${c.photo ? " has-photo" : ""}${i % 2 ? " is-alt" : ""}`} delay={60}>
          {c.photo && (
            <div className="rc-chapter-ph">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.photo} alt={c.title} loading="lazy" decoding="async" />
            </div>
          )}
          <div className="rc-chapter-t">
            <div className="rc-chapter-top">
              <span className="rc-chapter-n" aria-hidden>
                {String(i + 1).padStart(2, "0")}
              </span>
              {c.when && <p className="rc-chapter-when">{c.when}</p>}
            </div>
            {c.title && <h3 className="rc-chapter-title">{c.title}</h3>}
            {c.line && <p className="rc-chapter-line">{c.line}</p>}
          </div>
        </Reveal>
      ))}
    </ol>
  );
}

// ── The evening: every part with time, venue, dress code, map, calendar ────

function EventCard({ e, couple, s, locale, i }: { e: WeddingEvent; couple: string; s: Strings; locale: string; i: number }) {
  const [flash, setFlash] = useFlash();
  const sw = swatchFor({ dressCode: e.dressCode ?? "", dressColor: e.dressColor ?? "" });
  const gcal = e.date ? googleCalendarUrl(e, { couple, url: pageUrl(), tz: DEFAULT_TZ_OFFSET }) : "";
  const map = e.venue || e.address || e.mapUrl ? mapLink(e) : "";
  const t1 = e.time ? formatEventTime(e.time, locale) : "";
  const t2 = e.endTime ? formatEventTime(e.endTime, locale) : "";
  return (
    <Reveal as="li" className="rc-event" delay={(i % 3) * 90}>
      <div className="rc-event-time">
        <span className="rc-event-clock">{t1 || "—"}</span>
        {t2 && <span className="rc-event-end">– {t2}</span>}
      </div>
      <div className="rc-event-body">
        <h3 className="rc-event-title">{e.title}</h3>
        <p className="rc-event-meta">
          <Icon d={CAL} size={15} /> <span>{e.date ? formatEventDate(e.date, locale) : s.tba}</span>
        </p>
        {!t1 && (
          <p className="rc-event-meta">
            <Icon d={CLOCK} size={15} /> <span>{s.tba}</span>
          </p>
        )}
        {(e.venue || e.address) && (
          <p className="rc-event-meta">
            <Icon d={PIN} size={15} />
            <span>
              {e.venue && <b>{e.venue}</b>}
              {e.venue && e.address && <br />}
              {e.address}
            </span>
          </p>
        )}
        {e.dressCode && (
          <p className="rc-event-dress">
            {sw && <span className="rc-swatch" style={{ background: sw }} aria-hidden />}
            <span>
              <small>{s.dress}</small> {e.dressCode}
            </span>
          </p>
        )}
        {e.note && <p className="rc-event-note">{e.note}</p>}
        <div className="rc-event-a">
          {map && (
            <Btn href={map} icon={PIN} ghost className="is-sm">
              {s.directions}
            </Btn>
          )}
          {e.date && (
            <Btn icon={CAL} ghost className="is-sm" onClick={() => setFlash(downloadWeddingIcs([e], { couple, url: pageUrl(), tz: DEFAULT_TZ_OFFSET }, `${e.title}-${couple}`) ? "ok" : "err")}>
              {flash === "ok" ? "Saved ✓" : s.calendar}
            </Btn>
          )}
          {gcal && (
            <Btn href={gcal} ghost className="is-sm">
              {s.gcal}
            </Btn>
          )}
        </div>
      </div>
    </Reveal>
  );
}

export function Evening({ events, couple, s, locale }: { events: WeddingEvent[]; couple: string; s: Strings; locale: string }) {
  return (
    <ol className={`rc-events n-${Math.min(events.length, 3)}`}>
      {events.map((e, i) => (
        <EventCard key={e.id || i} e={e} couple={couple} s={s} locale={locale} i={i} />
      ))}
    </ol>
  );
}

// ── The venue with a tap-to-load map ────────────────────────────────────────

export function Venue({ main, s, note }: { main: WeddingEvent; s: Strings; note: string }) {
  const [map, setMap] = useState(false);
  const q = [main.venue, main.address].filter(Boolean).join(", ");
  const link = mapLink(main);
  return (
    <Reveal className="rc-venue">
      <div className="rc-venue-map">
        {map && q ? (
          <iframe title={`Map: ${q}`} src={`https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=15&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        ) : (
          <button type="button" className="rc-venue-poster" onClick={() => setMap(true)} disabled={!q}>
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img {...img("ballroom", { lazy: true })} aria-hidden />
            <span className="rc-venue-pin" aria-hidden>
              <Icon d={PIN} size={26} />
            </span>
            <span className="rc-venue-cta">{s.map}</span>
          </button>
        )}
      </div>
      <div className="rc-venue-t">
        <h3 className="rc-venue-name">{main.venue}</h3>
        {main.address && <p className="rc-venue-addr">{main.address}</p>}
        {note && (
          <div className="rc-venue-note">
            <p className="rc-venue-note-h">{s.gettingThere}</p>
            <p>{note}</p>
          </div>
        )}
        {link && (
          <Btn href={link} icon={PIN}>
            {s.directions}
          </Btn>
        )}
      </div>
    </Reveal>
  );
}

// ── Film (tap to load) ──────────────────────────────────────────────────────

export function Film({ id, label }: { id: string; label: string }) {
  const [on, setOn] = useState(false);
  return (
    <div className="rc-film">
      {on ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
          title={label}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          loading="lazy"
        />
      ) : (
        <button type="button" className="rc-film-poster" onClick={() => setOn(true)} aria-label={label}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" decoding="async" />
          <span className="rc-film-play" aria-hidden>
            <Icon d={PLAY} fill size={28} />
          </span>
          <span className="rc-film-label">{label}</span>
        </button>
      )}
    </div>
  );
}

// ── Good to know ────────────────────────────────────────────────────────────

export function Know({ things }: { things: Thing[] }) {
  return (
    <ul className="rc-know">
      {things.map((t, i) => (
        <Reveal as="li" key={i} className="rc-know-i" delay={(i % 3) * 70}>
          {t.head && <p className="rc-know-h">{t.head}</p>}
          <p className="rc-know-t">{t.text}</p>
        </Reveal>
      ))}
    </ul>
  );
}
