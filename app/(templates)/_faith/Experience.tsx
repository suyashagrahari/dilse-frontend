"use client";

// ─── Faith weddings — the guest's experience (Anand Karaj · Nikah · Holy Matrimony) ─
//
// One stationery suite, three faiths (the FaithProfile brings the art, palette,
// language and words). The guest is greeted by name (?to=) on a wax-sealed
// envelope; one tap (which also starts the music) cracks the seal, lifts the
// flap and brings the card out → the hero: the invitation itself inside the
// faith's arch (Ik Onkar over the Golden Temple's gold; the Bismillah in a
// Mughal arch with the couple at its foot; the cross in a lily-crowned chapel
// arch) → the invitation card (English + Punjabi / Urdu side by side, the
// faith's scripture, the couple's portrait) → the families' place cards → the
// save-the-date card and a flip countdown → our story → the functions as
// stationery cards with gold icons → the venue → film → the album → for our
// guests (notes, who to call, a gift by UPI, live stream) → RSVP → blessings /
// duas → the last page, sealed in wax.
//
// Every section is animated on scroll (transform/opacity only); art is decoded
// before the opening plays; reduced motion gets instant states. Light themes
// only. Anand Karaj and Nikah carry a language toggle (top-left): EN / ਪੰ, EN /
// اُردو (Urdu is set right-to-left in Nastaliq).

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { BlessingsWall, Countdown, RSVPBlock, Reveal, Section, WeddingMasonry, WeddingRoot, formatEventTime, photoImgStyle, cdn } from "../_wedding";
import type { ExperienceProps } from "../_valentine/types";
import Envelope from "./Envelope";
import Hero, { Invocation } from "./Hero";
import Story from "./Story";
import FaithEvents from "./Events";
import Venue from "./Venue";
import Guests from "./Guests";
import Finale from "./Finale";
import Wipe from "./Wipe";
import { FaithArtProvider, PAPER_OPACITY, picOf } from "./art";
import { FAITH_CSS } from "./css";
import { useGuestName } from "./guest";
import { readFaith } from "./model";
import type { FaithProfile, Lang } from "./types";

function Film({ id, label }: { id: string; label: string }) {
  const [on, setOn] = useState(false);
  return (
    <div className="fw-film">
      {on ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
          title={label}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          loading="lazy"
        />
      ) : (
        <button type="button" className="fw-film-poster" onClick={() => setOn(true)} aria-label={label}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" decoding="async" width={480} height={360} />
          <span className="fw-film-play" aria-hidden>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5.5v13l11-6.5z" />
            </svg>
          </span>
          <span className="fw-film-label">{label}</span>
        </button>
      )}
    </div>
  );
}

/** The album: 2 columns on phones, 3 on tablets, 4 from a laptop up. */
const GALLERY_COLUMNS = [
  { min: 0, columns: 2 },
  { min: 640, columns: 3 },
  { min: 960, columns: 4 },
] as const;

/** Punjabi month and weekday names: some browsers ship no Gurmukhi calendar data (they print "M02"). */
const PA_MONTHS = ["ਜਨਵਰੀ", "ਫ਼ਰਵਰੀ", "ਮਾਰਚ", "ਅਪ੍ਰੈਲ", "ਮਈ", "ਜੂਨ", "ਜੁਲਾਈ", "ਅਗਸਤ", "ਸਤੰਬਰ", "ਅਕਤੂਬਰ", "ਨਵੰਬਰ", "ਦਸੰਬਰ"];
const PA_DAYS = ["ਐਤਵਾਰ", "ਸੋਮਵਾਰ", "ਮੰਗਲਵਾਰ", "ਬੁੱਧਵਾਰ", "ਵੀਰਵਾਰ", "ਸ਼ੁੱਕਰਵਾਰ", "ਸ਼ਨਿੱਚਰਵਾਰ"];

/** "20", "February", "2027", "Saturday" in the page's language. */
function dateParts(date: string, locale: string) {
  const [y, mo, d] = date.split("-").map(Number);
  const dt = new Date(Date.UTC(y, mo - 1, d, 12));
  if (locale.startsWith("pa")) return { day: String(d), month: PA_MONTHS[mo - 1], year: String(y), weekday: PA_DAYS[dt.getUTCDay()] };
  const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale, { timeZone: "UTC", ...o }).format(dt);
  return { day: f({ day: "numeric" }), month: f({ month: "long" }), year: f({ year: "numeric" }), weekday: f({ weekday: "long" }) };
}

const paras = (t: string) =>
  t
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

export default function FaithWeddingExperience({ data, mode, react, faith }: ExperienceProps & { faith: FaithProfile }) {
  const m = useMemo(() => readFaith(data.extras as Record<string, unknown>, data.photos, data.recipientName, data.senderName, faith), [data.extras, data.photos, data.recipientName, data.senderName, faith]);
  const [lang, setLang] = useState<Lang>(m.lang);
  const s = (lang !== "en" && faith.T[lang]) || faith.T.en;
  const local = faith.local;
  const locale = local && lang === local.code ? local.locale : "en-IN";
  const dir = local && lang === local.code ? local.dir : "ltr";
  const couple = `${m.first} & ${m.second}`;
  const guest = useGuestName();
  const [open, setOpen] = useState(false);
  const pic = (role: Parameters<typeof picOf>[1], o?: Parameters<typeof picOf>[2]) => picOf(faith.art, role, o);
  // Low-end phones: drop the ambient motes and the parallax.
  const [lite] = useState(() => {
    if (typeof navigator === "undefined") return false;
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    return (navigator.hardwareConcurrency || 8) <= 4 && mem !== undefined && mem <= 3;
  });

  const parts = m.main?.date ? dateParts(m.main.date, locale) : null;
  const dateLine = parts ? `${parts.weekday} · ${parts.day} ${parts.month} ${parts.year}` : "";
  const shortDate = parts ? `${parts.day} · ${parts.month} · ${parts.year}` : "";
  const mainTime = m.main?.time ? formatEventTime(m.main.time, locale) : "";
  const venueLine = [m.main?.venue, m.main?.address?.split(",").pop()?.trim()].filter((v, i, a) => v && a.indexOf(v) === i).join(" · ");
  // The couple's own verse, else the faith's (with its original script when the page reads in it, or always for Gurbani).
  const verse = m.verse ? { text: m.verse, ref: m.verseRef, local: "" } : { text: faith.verse.text, ref: faith.verse.ref, local: faith.verse.local ?? "" };

  // ?to= → the RSVP's name field: set through the native setter so React's onChange sees it; never over a typed value.
  const rsvpRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!guest || !open) return;
    const t = window.setTimeout(() => {
      const input = rsvpRef.current?.querySelector<HTMLInputElement>('input:not([type]), input[type="text"]');
      if (!input || input.value) return;
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(input, guest);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }, 400);
    return () => window.clearTimeout(t);
  }, [guest, open]);

  // The language pill tucks away while the guest scrolls down and comes back on the way up or near the top.
  const [tucked, setTucked] = useState(false);
  useEffect(() => {
    if (!open || !local) return;
    let last = window.scrollY;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY;
        if (Math.abs(y - last) < 8) return;
        setTucked(y > 160 && y > last);
        last = y;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [open, local]);

  const completed = useRef(false);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = endRef.current;
    if (!el || !open) return;
    const io = new IntersectionObserver(([en]) => {
      if (en.isIntersecting && !completed.current) {
        completed.current = true;
        react("completed");
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, [open, react]);

  // The invitation always opens at the very top: no restored scroll position (a reload mid-page) may leave
  // the hero shifted by its parallax.
  useEffect(() => {
    try {
      if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    } catch {}
  }, []);
  const onOpened = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    setOpen(true);
    react("opened");
  };

  const brideSide = { ...m.bride_, title: s.brideSide, pic: m.bridePic };
  const groomSide = { ...m.groom_, title: s.groomSide, pic: m.groomPic };
  const sides = m.familyFirst === "bride" ? [brideSide, groomSide] : [groomSide, brideSide];
  const hasFamilies = sides.some((x) => x.names.length > 0);
  const hasGuests = m.things.length > 0 || m.contacts.length > 0 || !!m.upi || !!m.liveUrl;
  const rootStyle = { minHeight: "100dvh", ["--fw-paper-o" as string]: String(PAPER_OPACITY[m.theme] ?? 0.6), ["--wk-texture" as string]: "none", ["--wk-paper" as string]: "none" } as CSSProperties;
  const localLang = local?.code;

  return (
    <FaithArtProvider art={faith.art}>
      <WeddingRoot theme={m.theme} className={`fw-root fh-root is-${faith.id}${lang !== "en" ? ` is-${lang}` : ""}${lite ? " is-lite" : ""}${open ? " is-open" : ""}`} style={rootStyle}>
        <style>{FAITH_CSS}</style>
        <style>{faith.css}</style>
        <div className="fw-paper" aria-hidden />
        <Envelope first={m.first} second={m.second} dateLine={shortDate} guest={guest} s={s} lang={lang} onOpened={onOpened} />

        {local && (
          <div className={`fw-lang${tucked ? " is-tucked" : ""}`} role="group" aria-label="Language">
            <button type="button" aria-pressed={lang === "en"} onClick={() => setLang("en")}>
              EN
            </button>
            <button type="button" aria-pressed={lang === local.code} onClick={() => setLang(local.code)} lang={local.code}>
              {local.short}
            </button>
          </div>
        )}

        <Hero open={open} faith={faith.id} s={s} lang={lang} first={m.first} second={m.second} guest={guest} dateLine={dateLine} time={mainTime} venue={venueLine} invocation={m.invocation} />

        {/* ── The invitation card ─────────────────────────────────────────── */}
        <Section id="invitation" eyebrow={<span lang={lang}>{s.invitation}</span>} ornament={null} width="wide" className="fw-sec fw-sec-invite">
          <div className={`fw-invite${m.couple ? " has-portrait" : ""}`}>
            <span className="fw-mandala" aria-hidden />
            {m.couple && (
              <Reveal effect="zoom" className="fw-portrait">
                <span className="fw-portrait-pic">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cdn(m.couple.url)} alt={couple} loading="lazy" decoding="async" style={photoImgStyle(m.couple)} />
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                <img className="fw-portrait-bloom is-t" {...pic("bloomAlt", { lazy: true, sizes: "200px" })} aria-hidden />
                {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                <img className="fw-portrait-bloom is-b" {...pic("bloom", { lazy: true, sizes: "200px" })} aria-hidden />
              </Reveal>
            )}
            <Reveal className="fw-sheet fw-fold">
              <span className="fw-sheet-roses is-tl" aria-hidden>
                {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                <img {...pic("sheetCorner", { lazy: true, sizes: "190px" })} />
              </span>
              <span className="fw-sheet-roses is-br" aria-hidden>
                {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                <img {...pic("sheetCorner", { lazy: true, sizes: "190px" })} />
              </span>
              <Wipe role="swirl" className="fw-sheet-swirl" lazy dir="rtl" sizes="300px" />
              {m.invocation && (
                <div className="fh-sheet-inv">
                  <Invocation faith={faith.id} />
                  {s.greeting && (
                    <p className="fh-greet" lang={lang}>
                      {s.greeting}
                    </p>
                  )}
                </div>
              )}
              <p className="fw-sheet-k" lang={lang}>
                {s.togetherWith}
              </p>
              <p className="fw-sheet-names">
                {m.first} <span>&amp;</span> {m.second}
              </p>
              <div className={`fw-sheet-text${m.localMessage ? " is-two" : ""}`}>
                <div className="fw-sheet-col">
                  {paras(data.letter).map((p: string, i: number) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
                {m.localMessage && localLang && (
                  <div className={`fw-sheet-col is-local is-${localLang}`} lang={localLang} dir={local?.dir}>
                    {paras(m.localMessage).map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                )}
              </div>
              {(verse.text || verse.local) && (
                <figure className="fh-verse">
                  {verse.local && (
                    <blockquote className="fh-verse-local" lang={faith.id === "sikh" ? "pa" : localLang} dir={faith.id === "muslim" ? "rtl" : undefined}>
                      {verse.local}
                    </blockquote>
                  )}
                  {(lang === "en" || !verse.local || faith.id === "sikh") && verse.text && <blockquote className="fh-verse-text">“{verse.text}”</blockquote>}
                  {verse.ref && <figcaption>{verse.ref}</figcaption>}
                </figure>
              )}
              <p className="fw-sheet-sign" lang={lang} dir={dir}>
                {s.upasthiti}
              </p>
            </Reveal>
          </div>
        </Section>

        {/* ── Families: two place cards ────────────────────────────────────── */}
        {(hasFamilies || m.blessingsOf) && (
          <Section id="families" eyebrow={<span lang={lang}>{s.families}</span>} title={<span>{couple}</span>} ornament={null} width="normal" className="fw-sec">
            {m.blessingsOf && (
              <Reveal className="fw-blessed">
                <p className="wk-eyebrow" lang={lang}>
                  {s.blessingsOf}
                </p>
                <p className="fw-blessed-names">{m.blessingsOf}</p>
              </Reveal>
            )}
            {hasFamilies && (
              <div className="fw-fams">
                <span className="fw-fams-amp" aria-hidden>
                  &amp;
                </span>
                {sides.map((side, i) => (
                  <Reveal key={i} className={`fw-fam fw-fold is-${i ? "r" : "l"}`} delay={i * 140}>
                    <span className="fw-fam-crest" aria-hidden>
                      <b>{(side === brideSide ? m.bride : m.groom).trim().charAt(0).toUpperCase()}</b>
                    </span>
                    <span className={`fw-fam-flower is-${i ? "r" : "l"}`} aria-hidden>
                      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                      <img {...pic("bloom", { lazy: true, sizes: "120px" })} />
                    </span>
                    {side.pic && (
                      <span className="fw-fam-photo">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={cdn(side.pic.url)} alt={side.title} loading="lazy" decoding="async" style={photoImgStyle(side.pic)} />
                      </span>
                    )}
                    <p className="wk-eyebrow" lang={lang}>
                      {side.title}
                    </p>
                    {side.names.map((n, k) => (
                      <p key={k} className="fw-fam-names">
                        {n}
                      </p>
                    ))}
                    {side.note && <p className="fw-fam-note">{side.note}</p>}
                  </Reveal>
                ))}
              </div>
            )}
          </Section>
        )}

        {/* ── Save the date + countdown ───────────────────────────────────── */}
        {m.main?.date && parts && (
          <Section id="date" eyebrow={<span lang={lang}>{s.dateEyebrow}</span>} ornament={null} width="normal" className="fw-sec fw-sec-date">
            <Reveal effect="zoom" className="fw-datecard">
              <span className="fw-datecard-tile" aria-hidden />
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img className="fw-datecard-bloom" {...pic("bloom", { lazy: true, sizes: "140px" })} aria-hidden />
              <span className="fw-datecard-wax" aria-hidden>
                <b lang={faith.id === "sikh" ? "pa" : faith.id === "muslim" ? "ur" : "en"}>{faith.T.en.seal}</b>
              </span>
              <p className="fw-datecard-wd" lang={lang}>
                {parts.weekday}
              </p>
              <div className="fw-datecard-row" lang={lang}>
                <span className="fw-datecard-m">{parts.month}</span>
                <span className="fw-datecard-d">{parts.day}</span>
                <span className="fw-datecard-y">{parts.year}</span>
              </div>
              {(mainTime || m.muhurat) && <p className="fw-datecard-t">{[mainTime, m.muhurat].filter(Boolean).join(" · ")}</p>}
              {m.main.venue && <p className="fw-datecard-v">{m.main.venue}</p>}
            </Reveal>
            <Reveal className="fw-count" delay={120}>
              <p className="wk-eyebrow" lang={lang}>
                {s.countdown}
              </p>
              <Countdown date={m.main.date} time={m.main.time || "00:00"} variant="flip" labels={s.units} doneText={s.done} />
            </Reveal>
          </Section>
        )}

        {/* ── Our story ───────────────────────────────────────────────────── */}
        {m.story.length > 0 && (
          <Section id="story" eyebrow={<span lang={lang}>{s.storyEyebrow}</span>} title={<span lang={lang}>{s.story}</span>} ornament={null} width="normal" className="fw-sec">
            <Story chapters={m.story} />
          </Section>
        )}

        {/* ── Functions ───────────────────────────────────────────────────── */}
        {m.events.length > 0 && (
          <Section id="events" eyebrow={<span lang={lang}>{s.eventsEyebrow}</span>} title={<span lang={lang}>{s.events}</span>} ornament={null} width="wide" className="fw-sec">
            <FaithEvents events={m.events} locale={locale} labels={{ directions: s.directions, dress: s.dress, tba: s.tba }} icons={faith.eventArt} />
          </Section>
        )}

        {/* ── The venue ───────────────────────────────────────────────────── */}
        {m.main?.venue && (
          <Section id="venue" eyebrow={<span lang={lang}>{s.venueEyebrow}</span>} ornament={null} width="normal" className="fw-sec">
            <Venue event={m.main} directions={s.directions} gettingThere={m.gettingThere} gettingThereLabel={s.gettingThere} mapLabel={s.showMap} />
          </Section>
        )}

        {/* ── Pre-wedding film ────────────────────────────────────────────── */}
        {m.videoId && (
          <Section id="film" eyebrow={<span lang={lang}>{s.film}</span>} ornament={null} width="normal" className="fw-sec">
            <Reveal effect="zoom">
              <Film id={m.videoId} label={s.play} />
            </Reveal>
          </Section>
        )}

        {/* ── The album ───────────────────────────────────────────────────── */}
        {m.gallery.length > 0 && (
          <Section id="gallery" eyebrow={<span lang={lang}>{s.galleryEyebrow}</span>} title={<span lang={lang}>{s.gallery}</span>} ornament={null} width="wide" className="fw-sec fw-sec-gallery">
            <WeddingMasonry photos={m.gallery} mask="rounded" radius={16} frame="mat" tileCaptions label={s.gallery} columns={GALLERY_COLUMNS} className="fw-album" />
          </Section>
        )}

        {/* ── For our guests ──────────────────────────────────────────────── */}
        {hasGuests && (
          <Section id="good-to-know" eyebrow={<span lang={lang}>{s.guestsEyebrow}</span>} title={<span lang={lang}>{s.goodToKnow}</span>} ornament={null} width="normal" className="fw-sec">
            <Guests s={s} lang={lang} things={m.things} contacts={m.contacts} upi={m.upi} liveUrl={m.liveUrl} main={m.main} couple={couple} />
          </Section>
        )}

        {/* ── RSVP: an arched window in the faith's watercolour beside the reply card ─ */}
        <Section id="rsvp" eyebrow={<span lang={lang}>RSVP · {s.rsvpEyebrow}</span>} ornament={null} width="wide" className="fw-sec fw-sec-rsvp">
          <div className="fw-rsvp-wrap">
            <Reveal effect="zoom" className="fw-rsvp-art">
              <span className="fw-rsvp-window" aria-hidden>
                {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                <img className="fw-rw-wash" {...pic("rsvpWash", { lazy: true, sizes: "420px" })} />
                {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                <img className="fw-rw-pair fh-rw-figure" {...pic("rsvpFigure", { lazy: true, sizes: "420px" })} />
                {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                <img className="fw-rw-peony is-l" {...pic("bloom", { lazy: true, sizes: "160px" })} />
                {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                <img className="fw-rw-peony is-r" {...pic("bloom", { lazy: true, sizes: "160px" })} />
              </span>
              <p className="fw-rsvp-names">{couple}</p>
            </Reveal>
            <div ref={rsvpRef} className="fw-rsvp">
              {guest && (
                <p className="fw-rsvp-dear" lang={lang}>
                  {s.dear} {guest},
                </p>
              )}
              <Reveal className="fw-fold">
                <RSVPBlock mode={mode} couple={couple} events={m.events} perEvent meal={m.rsvpMeal} maxGuests={m.maxGuests} deadline={m.rsvpBy || undefined} title={s.rsvp} intro={s.rsvpIntro} locale={locale} text={faith.kit.rsvp} />
              </Reveal>
            </div>
          </div>
        </Section>

        {/* ── Blessings ───────────────────────────────────────────────────── */}
        {m.blessings && (
          <Section id="blessings" eyebrow={<span lang={lang}>{s.blessingsEyebrow}</span>} ornament={null} width="normal" className="fw-sec fw-sec-bless">
            <BlessingsWall mode={mode} title={s.blessings} intro={s.blessingsIntro} sample={faith.kit.sample} text={faith.kit.blessings} />
          </Section>
        )}

        <div ref={endRef} />
        <Finale faith={faith.id} s={s} sealWord={faith.T.en.seal} seal={faith.T.en.shubh} endLine={data.endLine} first={m.first} second={m.second} hashtag={m.hashtag} lang={lang} invocation={m.invocation} />
      </WeddingRoot>
    </FaithArtProvider>
  );
}
