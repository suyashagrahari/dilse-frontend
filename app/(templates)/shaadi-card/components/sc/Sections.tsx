"use client";

// ─── The sections under the hero ────────────────────────────────────────────
// Invitation · Families · The couple · Save the date (countdown) · Story ·
// Functions · Venue · Film · Good to know (contacts, shagun) · Finale.
// RSVP, the album and the blessings wall are composed in ShaadiExperience.
// Every photo frame and card is a plain rounded rectangle (no arches).

import { useEffect, useState, type ReactNode } from "react";
import { Countdown, DEFAULT_TZ_OFFSET, Reveal, downloadWeddingIcs, eventEnd, eventStart, formatEventDate, formatEventTime, googleCalendarUrl, mapLink } from "../../../_wedding";
import CroppedPhoto from "../../../_valentine/kit/CroppedPhoto";
import { ART, FN_ART, img } from "../assets";
import type { Contact, Crop, Lang, Person, RenderEvent, StoryChapter, Strings } from "../model";
import { copyText, shareableUrl, whatsappUrl } from "./guest";
import { ICON, Icon, WhatsAppGlyph } from "./ShareBar";

const paras = (t: string) =>
  t
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

export function SectionHead({ eyebrow, title, lang, art }: { eyebrow: string; title: string; lang: Lang; art?: ReactNode }) {
  return (
    <Reveal className="sc-head">
      {art}
      <p className="sc-eyebrow" lang={lang}>
        {eyebrow}
      </p>
      <h2 className="sc-h2" lang={lang}>
        {title}
      </h2>
      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
      <img className="sc-head-rule" {...img(ART.divider, { lazy: true })} aria-hidden />
    </Reveal>
  );
}

// ── Invitation ──────────────────────────────────────────────────────────────

export function Invitation({ text, hindi, lang, s, signature, blessing }: { text: string; hindi: string; lang: Lang; s: Strings; signature: string; blessing: string }) {
  const en = paras(text);
  const hi = paras(hindi);
  const showHi = hi.length > 0;
  return (
    <section id="invitation" className="sc-sec sc-sec-invite">
      <span className="sc-lamp sc-lamp-l" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img(ART.brassLamp, { lazy: true })} />
      </span>
      <span className="sc-lamp sc-lamp-r" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img(ART.brassLamp, { lazy: true })} />
      </span>
      <Reveal className="sc-card sc-invite" effect="rise">
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img className="sc-invite-border" {...img(ART.garlandBorder, { lazy: true })} aria-hidden />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="sc-invite-ganesha" {...img(ART.ganesha, { lazy: true })} alt="" aria-hidden />
        <p className="sc-eyebrow" lang={lang}>
          {s.invitation}
        </p>
        {blessing && (
          <p className="sc-invite-om" lang="hi">
            {blessing}
          </p>
        )}
        <h2 className="sc-h2" lang={lang}>
          {s.invitationTitle}
        </h2>
        <div className={`sc-invite-cols${showHi ? " has-hi" : ""}${lang === "hi" ? " is-hi-first" : ""}`}>
          <div className="sc-invite-en" lang="en">
            {en.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          {showHi && (
            <div className="sc-invite-hi" lang="hi">
              {hi.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          )}
        </div>
        {signature && <p className="sc-invite-sign">{signature}</p>}
      </Reveal>
    </section>
  );
}

// ── Families ────────────────────────────────────────────────────────────────

export function Families({
  s,
  lang,
  bride,
  groom,
  first,
  blessingsOf,
}: {
  s: Strings;
  lang: Lang;
  bride: { parents: string; grandparents: string; name: string };
  groom: { parents: string; grandparents: string; name: string };
  first: "bride" | "groom";
  blessingsOf: string;
}) {
  const card = (side: "bride" | "groom") => {
    const f = side === "bride" ? bride : groom;
    if (!f.parents && !f.grandparents) return null;
    return (
      <Reveal key={side} className="sc-card sc-fam-card" delay={side === first ? 0 : 120}>
        <p className="sc-eyebrow" lang={lang}>
          {side === "bride" ? s.brideSide : s.groomSide}
        </p>
        {f.parents && <p className="sc-fam-parents">{f.parents}</p>}
        {f.grandparents && (
          <p className="sc-fam-grand">
            <span lang={lang}>{s.grandparents}</span>: {f.grandparents}
          </p>
        )}
        <p className="sc-fam-of">
          {lang === "hi" ? (side === "bride" ? "की सुपुत्री" : "के सुपुत्र") : side === "bride" ? "parents of the bride" : "parents of the groom"} <b>{f.name}</b>
        </p>
      </Reveal>
    );
  };
  return (
    <section id="families" className="sc-sec sc-sec-fam">
      <span className="sc-fam-leaf sc-fam-leaf-l" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img(ART.bananaLeaf, { lazy: true })} />
      </span>
      <span className="sc-fam-leaf sc-fam-leaf-r" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img(ART.bananaLeaf, { lazy: true })} />
      </span>
      <SectionHead eyebrow={s.blessingsOf} title={s.families} lang={lang} />
      {blessingsOf && (
        <Reveal className="sc-fam-bless">
          <p>{blessingsOf}</p>
        </Reveal>
      )}
      <div className="sc-fam-grid">{first === "bride" ? [card("bride"), card("groom")] : [card("groom"), card("bride")]}</div>
    </section>
  );
}

// ── The couple ──────────────────────────────────────────────────────────────

export function Couple({ s, lang, bride, groom, brideCrop, groomCrop, first }: { s: Strings; lang: Lang; bride: Person; groom: Person; brideCrop: Crop; groomCrop: Crop; first: "bride" | "groom" }) {
  const anyPhoto = !!bride.photo || !!groom.photo;
  const one = (p: Person, c: Crop, side: "bride" | "groom", i: number) => (
    <Reveal key={side} className={`sc-card sc-person${p.photo ? " has-photo" : ""}`} delay={i * 120}>
      {p.photo && (
        <span className="sc-person-photo">
          <CroppedPhoto photo={{ url: p.photo, cropX: c.x, cropY: c.y, scale: c.scale }} alt={p.name} />
        </span>
      )}
      <div className="sc-person-tx">
        <p className="sc-eyebrow" lang={lang}>
          {side === "bride" ? s.bride : s.groom}
        </p>
        <h3 className="sc-person-name">{p.name}</h3>
        {p.description && <p className="sc-person-d">{p.description}</p>}
        {p.tags.length > 0 && (
          <ul className="sc-tags">
            {p.tags.slice(0, 4).map((t, k) => (
              <li key={k}>
                {t.emoji && <span aria-hidden>{t.emoji}</span>} {t.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Reveal>
  );
  const order = first === "bride" ? ([["bride", bride, brideCrop], ["groom", groom, groomCrop]] as const) : ([["groom", groom, groomCrop], ["bride", bride, brideCrop]] as const);
  return (
    <section id="couple" className="sc-sec sc-sec-couple">
      <SectionHead eyebrow={s.couple} title={s.coupleTitle} lang={lang} />
      <div className={`sc-couple-grid${anyPhoto ? " has-photos" : ""}`}>
        {one(order[0][1], order[0][2], order[0][0], 0)}
        {!anyPhoto && (
          <Reveal className="sc-couple-art" effect="zoom">
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img className="sc-couple-gazebo" {...img(ART.gazebo, { lazy: true })} aria-hidden />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="sc-couple-ill" {...img(ART.couple, { lazy: true })} alt="" aria-hidden />
          </Reveal>
        )}
        {one(order[1][1], order[1][2], order[1][0], 1)}
      </div>
    </section>
  );
}

// ── Save the date ───────────────────────────────────────────────────────────

export function SaveTheDate({ s, lang, locale, day, clock, time, muhurat, venue }: { s: Strings; lang: Lang; locale: string; day: string; clock: string; time: string; muhurat: string; venue: string }) {
  const d = new Date(`${day}T12:00:00Z`);
  const part = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale, { ...o, timeZone: "UTC" }).format(d);
  return (
    <section id="date" className="sc-sec sc-sec-date">
      <div className="sc-date-grid">
        <Reveal className="sc-date-art" effect="zoom">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="sc-swing" {...img(ART.swing, { lazy: true })} alt="" aria-hidden />
        </Reveal>
        <div className="sc-date-tx">
          <SectionHead eyebrow={s.dateEyebrow} title={s.countdownTitle} lang={lang} />
          <Reveal className="sc-card sc-date-card">
            <p className="sc-date-wd" lang={lang}>
              {part({ weekday: "long" })}
            </p>
            <div className="sc-date-big">
              <span className="sc-date-m">{part({ month: "long" })}</span>
              <span className="sc-date-d">{part({ day: "numeric" })}</span>
              <span className="sc-date-y">{part({ year: "numeric" })}</span>
            </div>
            {(time || muhurat) && <p className="sc-date-t">{[time, muhurat].filter(Boolean).join(" · ")}</p>}
            {venue && <p className="sc-date-v">{venue}</p>}
            <Countdown date={day} time={clock || undefined} variant="flip" labels={{ d: s.days, h: s.hours, m: s.minutes, s: s.seconds }} doneText={s.married} className="sc-countdown" />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ── Story ───────────────────────────────────────────────────────────────────

export function Story({ s, lang, chapters }: { s: Strings; lang: Lang; chapters: StoryChapter[] }) {
  return (
    <section id="story" className="sc-sec sc-sec-story">
      <span className="sc-story-vine" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img(ART.vine, { lazy: true })} />
      </span>
      <SectionHead eyebrow={s.storyEyebrow} title={s.story} lang={lang} />
      <ol className="sc-story">
        {chapters.map((c, i) => (
          <Reveal as="li" key={i} className={`sc-chapter${i % 2 ? " is-alt" : ""}${c.photo ? " has-photo" : ""}`} delay={60}>
            <span className="sc-chapter-dot" aria-hidden />
            {c.photo && (
              <span className="sc-chapter-photo">
                <CroppedPhoto photo={{ url: c.photo, cropX: c.cropX, cropY: c.cropY, scale: c.scale }} alt={c.title} />
              </span>
            )}
            <div className="sc-card sc-chapter-tx">
              {c.when && <p className="sc-chapter-when">{c.when}</p>}
              {c.title && <h3 className="sc-chapter-h">{c.title}</h3>}
              {c.line && <p className="sc-chapter-p">{c.line}</p>}
            </div>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}

// ── Functions ───────────────────────────────────────────────────────────────

function useLiveOpen(url: string, e?: RenderEvent): boolean {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!url) return;
    const t = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(t);
  }, [url]);
  if (!url || !e?.date) return false;
  const start = eventStart(e.date, e.time || "00:00");
  if (!start) return false;
  const end = (e.endTime && eventEnd({ date: e.date, time: e.time || "00:00", endTime: e.endTime })) || new Date(start.getTime() + 3 * 3600_000);
  return now >= start.getTime() - 30 * 60_000 && now <= end.getTime();
}

export function LiveButton({ url, main, s, lang }: { url: string; main?: RenderEvent; s: Strings; lang: Lang }) {
  const open = useLiveOpen(url, main);
  if (!url) return null;
  return open ? (
    <a className="sc-pill sc-pill-live" href={url} target="_blank" rel="noopener noreferrer" lang={lang}>
      <Icon d={ICON.live} size={17} /> {s.live}
    </a>
  ) : (
    <span className="sc-pill sc-pill-live is-off" aria-disabled lang={lang}>
      <Icon d={ICON.live} size={17} /> {s.liveSoon}
    </span>
  );
}

export function Functions({ s, lang, locale, events, couple, mainId }: { s: Strings; lang: Lang; locale: string; events: RenderEvent[]; couple: string; mainId?: string }) {
  const [saved, setSaved] = useState<string | null>(null);
  const icsOpts = { couple, url: typeof window === "undefined" ? "" : shareableUrl(), tz: DEFAULT_TZ_OFFSET };
  const dated = events.filter((e) => e.date);
  const save = (list: RenderEvent[], key: string) => {
    if (downloadWeddingIcs(list, icsOpts, list.length > 1 ? `wedding-${couple}` : `${list[0].title}-${couple}`)) {
      setSaved(key);
      window.setTimeout(() => setSaved(null), 2200);
    }
  };
  return (
    <section id="events" className="sc-sec sc-sec-events">
      <span className="sc-umb sc-umb-l" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img(ART.umbrella, { lazy: true })} />
      </span>
      <span className="sc-umb sc-umb-r" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img(ART.umbrella, { lazy: true })} />
      </span>
      <SectionHead eyebrow={s.eventsEyebrow} title={s.events} lang={lang} />
      <ul className="sc-fns">
        {events.map((e, i) => {
          const art = FN_ART[e.art] ?? FN_ART["fn-wedding"];
          const when = e.date ? formatEventDate(e.date, locale) : e.rawDate;
          const t = e.time ? `${formatEventTime(e.time, locale)}${e.endTime ? ` – ${formatEventTime(e.endTime, locale)}` : ""}` : e.rawTime || s.tba;
          const gcal = e.date ? googleCalendarUrl(e, icsOpts) : "";
          const map = e.venue || e.address || e.mapUrl ? mapLink(e) : "";
          return (
            <Reveal as="li" key={e.id} className={`sc-card sc-fn${e.id === mainId ? " is-main" : ""}`} delay={(i % 3) * 90} style={{ ["--fn" as string]: e.dressColor || "var(--sc-marigold)" }}>
              <div className="sc-fn-top">
                <div className="sc-fn-title">
                  <p className="sc-fn-icon" aria-hidden>
                    {e.icon}
                  </p>
                  <h3 className="sc-fn-name">{e.title}</h3>
                  {e.hindi && (
                    <p className="sc-fn-hi" lang="hi">
                      {e.hindi}
                    </p>
                  )}
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                <img className="sc-fn-art" {...img(art, { lazy: true })} aria-hidden />
              </div>
              <dl className="sc-fn-dl">
                {when && (
                  <div>
                    <dt aria-label="Date">
                      <Icon d={ICON.cal} size={16} />
                    </dt>
                    <dd>{when}</dd>
                  </div>
                )}
                <div>
                  <dt aria-label="Time">
                    <Icon d={ICON.clock} size={16} />
                  </dt>
                  <dd>{t}</dd>
                </div>
                {(e.venue || e.address) && (
                  <div>
                    <dt aria-label="Venue">
                      <Icon d={ICON.pin} size={16} />
                    </dt>
                    <dd>
                      {e.venue && <b>{e.venue}</b>}
                      {e.address && <span className="sc-fn-addr">{e.address}</span>}
                    </dd>
                  </div>
                )}
                {e.dressCode && (
                  <div>
                    <dt aria-label={s.dress}>
                      <Icon d={ICON.shirt} size={16} />
                    </dt>
                    <dd className="sc-fn-dress">
                      {e.dressColor && <i className="sc-swatch" style={{ background: e.dressColor }} aria-hidden />}
                      <span>
                        <span className="sc-fn-k" lang={lang}>
                          {s.dress}:
                        </span>{" "}
                        {e.dressCode}
                      </span>
                    </dd>
                  </div>
                )}
              </dl>
              {e.note && <p className="sc-fn-note">{e.note}</p>}
              <div className="sc-fn-btns">
                {map && (
                  <a className="sc-pill" href={map} target="_blank" rel="noopener noreferrer" lang={lang}>
                    <Icon d={ICON.pin} size={16} /> {s.directions}
                  </a>
                )}
                {e.date && (
                  <button type="button" className="sc-pill" onClick={() => save([e], e.id)} lang={lang}>
                    <Icon d={saved === e.id ? ICON.check : ICON.cal} size={16} /> {saved === e.id ? s.saved : s.calendar}
                  </button>
                )}
                {gcal && (
                  <a className="sc-pill sc-pill-g" href={gcal} target="_blank" rel="noopener noreferrer" aria-label={`${s.google} ${s.calendar}: ${e.title}`}>
                    {s.google}
                  </a>
                )}
              </div>
            </Reveal>
          );
        })}
      </ul>
      {dated.length > 1 && (
        <Reveal className="sc-fns-all">
          <button type="button" className="sc-btn" onClick={() => save(dated, "all")} lang={lang}>
            <Icon d={saved === "all" ? ICON.check : ICON.cal} size={17} /> {saved === "all" ? s.saved : s.saveAll}
          </button>
        </Reveal>
      )}
    </section>
  );
}

// ── Venue ───────────────────────────────────────────────────────────────────

export function Venue({ s, lang, event, gettingThere }: { s: Strings; lang: Lang; event: RenderEvent; gettingThere: string }) {
  const map = mapLink(event);
  return (
    <section id="venue" className="sc-sec sc-sec-venue">
      <Reveal className="sc-card sc-venue">
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img className="sc-venue-art" {...img(ART.fountain, { lazy: true })} aria-hidden />
        <div className="sc-venue-tx">
          <p className="sc-eyebrow" lang={lang}>
            {s.venueEyebrow}
          </p>
          <h2 className="sc-venue-name">{event.venue}</h2>
          {event.address && <p className="sc-venue-addr">{event.address}</p>}
          <a className="sc-btn" href={map} target="_blank" rel="noopener noreferrer" lang={lang}>
            <Icon d={ICON.pin} size={17} /> {s.map}
          </a>
          {gettingThere && (
            <div className="sc-venue-get">
              <p className="sc-label" lang={lang}>
                {s.gettingThere}
              </p>
              {paras(gettingThere).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          )}
        </div>
      </Reveal>
    </section>
  );
}

// ── Film ────────────────────────────────────────────────────────────────────

export function Film({ id, s, lang }: { id: string; s: Strings; lang: Lang }) {
  const [on, setOn] = useState(false);
  return (
    <section id="film" className="sc-sec sc-sec-film">
      <SectionHead eyebrow={s.filmEyebrow} title={s.film} lang={lang} />
      <Reveal className="sc-film" effect="zoom">
        {on ? (
          <iframe src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`} title={s.film} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
        ) : (
          <button type="button" className="sc-film-poster" onClick={() => setOn(true)} aria-label={s.play}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" width={480} height={360} loading="lazy" decoding="async" />
            <span className="sc-film-play" aria-hidden>
              <Icon d={ICON.play} size={28} />
            </span>
            <span className="sc-film-label" lang={lang}>
              {s.play}
            </span>
          </button>
        )}
      </Reveal>
    </section>
  );
}

// ── Good to know · who to call · shagun ─────────────────────────────────────

export function Notes({ s, lang, things, contacts, upiId, upiName, couple }: { s: Strings; lang: Lang; things: { head: string; text: string }[]; contacts: (Contact & { dial: string })[]; upiId: string; upiName: string; couple: string }) {
  const [copied, setCopied] = useState(false);
  const upiLink = upiId ? `upi://pay?pa=${encodeURIComponent(upiId)}${upiName ? `&pn=${encodeURIComponent(upiName)}` : ""}&tn=${encodeURIComponent(`Shagun · ${couple}`)}&cu=INR` : "";
  return (
    <section id="good-to-know" className="sc-sec sc-sec-notes">
      <SectionHead eyebrow={s.notesEyebrow} title={s.goodToKnow} lang={lang} />
      {things.length > 0 && (
        <ul className="sc-know">
          {things.map((t, i) => (
            <Reveal as="li" key={i} className="sc-card sc-know-i" delay={(i % 3) * 70}>
              {t.head && <p className="sc-know-h">{t.head}</p>}
              <p className="sc-know-t">{t.text}</p>
            </Reveal>
          ))}
        </ul>
      )}
      {contacts.length > 0 && (
        <Reveal className="sc-card sc-contacts">
          <h3 className="sc-h3" lang={lang}>
            {s.contacts}
          </h3>
          <p className="sc-muted" lang={lang}>
            {s.contactsIntro}
          </p>
          <ul className="sc-contact-list">
            {contacts.map((c, i) => (
              <li key={i} className="sc-contact">
                <span className="sc-contact-ini" aria-hidden>
                  {c.name.trim().charAt(0).toUpperCase()}
                </span>
                <span className="sc-contact-who">
                  <b>{c.name}</b>
                  {c.relation && <small>{c.relation}</small>}
                </span>
                <span className="sc-contact-btns">
                  <a className="sc-pill" href={`tel:+${c.dial}`} aria-label={`${s.call} ${c.name}`}>
                    <Icon d={ICON.phone} size={16} /> <span lang={lang}>{s.call}</span>
                  </a>
                  <a className="sc-pill sc-pill-wa" href={whatsappUrl(`Namaste ${c.name}, about ${couple}'s wedding: `, c.dial)} target="_blank" rel="noopener noreferrer" aria-label={`${s.chat} ${c.name}`}>
                    <WhatsAppGlyph size={16} /> <span>{s.chat}</span>
                  </a>
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
      )}
      {upiId && (
        <Reveal className="sc-card sc-shagun" delay={80}>
          <p className="sc-eyebrow" lang={lang}>
            {s.shagun}
          </p>
          <p className="sc-muted" lang={lang}>
            {s.shagunIntro}
          </p>
          <p className="sc-shagun-id">
            <b>{upiId}</b>
            {upiName && <small>{upiName}</small>}
          </p>
          <div className="sc-shagun-btns">
            <a className="sc-btn sc-upi-pay" href={upiLink} lang={lang}>
              <Icon d={ICON.rupee} size={16} /> {s.upiPay}
            </a>
            <button
              type="button"
              className="sc-pill"
              onClick={async () => {
                if (await copyText(upiId)) {
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 2000);
                }
              }}
              lang={lang}
            >
              <Icon d={copied ? ICON.check : ICON.copy} size={15} /> {copied ? s.upiCopied : s.upiCopy}
            </button>
          </div>
        </Reveal>
      )}
    </section>
  );
}

// ── Finale ──────────────────────────────────────────────────────────────────

export function Finale({ s, lang, first, second, closing, hashtag, share, onReplay, createHref }: { s: Strings; lang: Lang; first: string; second: string; closing: string; hashtag: string; share: ReactNode; onReplay: () => void; createHref?: string }) {
  return (
    <section id="finale" className="sc-sec sc-finale">
      <span className="sc-finale-peacock" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img(ART.peacock, { lazy: true })} />
      </span>
      <Reveal className="sc-seal" effect="zoom">
        <span className="sc-seal-ring" aria-hidden />
        <span className="sc-seal-in">
          <span className="sc-seal-hi" lang="hi">
            शुभ विवाह
          </span>
          <span className="sc-seal-ini">
            {first.charAt(0)}
            <i>&amp;</i>
            {second.charAt(0)}
          </span>
        </span>
      </Reveal>
      <Reveal as="p" className="sc-finale-line">
        <span lang={lang}>{s.closing}</span>
      </Reveal>
      {closing && <Reveal as="p" className="sc-finale-sign">{closing}</Reveal>}
      {hashtag && <Reveal as="p" className="sc-finale-tag">{hashtag}</Reveal>}
      <Reveal className="sc-finale-share">{share}</Reveal>
      <div className="sc-finale-foot">
        <button type="button" className="sc-link" onClick={onReplay} lang={lang}>
          <Icon d={ICON.replay} size={15} /> {s.replay}
        </button>
        {createHref && (
          <a className="sc-link" href={createHref} lang={lang}>
            ✦ {s.create}
          </a>
        )}
      </div>
    </section>
  );
}
