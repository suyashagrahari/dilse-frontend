"use client";

// ─── Lotus Temple Wedding Invitation 🪷 — the guest's experience ─────────────
//
// A lotus blooms in a still temple pond (tap: the brass lamps light one by one,
// the petals unfold, the music starts) → the courtyard hero (marigold garland,
// gold string lights, the sage arch badge with the date, the couple before the
// gopuram) → the invitation in English + Hindi under joined hands → the two
// families → the date and a flip countdown under brass lamps → our story on a
// growing lotus stem → the functions as date-plate cards → the venue with the
// gopuram → live stream → film → gallery → good to know + family contacts →
// RSVP → blessings → shagun → the lotus blooms again on "Shubh Vivah".
//
// All art is the owner's (public/wedding-v3), drawn from its media-CDN twin.
// Every motion is transform/opacity, gated on visibility and reduced-motion
// aware. Light themes only. A bilingual toggle (top-left) switches every
// heading and button to Hindi. ?to=<name> greets the guest by name.

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { BlessingsWall, Countdown, MessageBlock, RSVPBlock, Reveal, Section, WeddingMasonry, WeddingRoot, formatEventDate, formatEventTime } from "../../_wedding";
import type { ExperienceProps } from "../../_valentine/types";
import { Contacts, Icon, LiveStream, PLAY, Shagun } from "./lw/Actions";
import DateBadge from "./lw/DateBadge";
import Families from "./lw/Families";
import Finale from "./lw/Finale";
import Hero from "./lw/Hero";
import LotusEvents from "./lw/LotusEvents";
import Opening from "./lw/Opening";
import Story from "./lw/Story";
import Venue from "./lw/Venue";
import { img } from "./lw/art";
import { LW_CSS } from "./lw/css";
import { prefillRsvpName, useGuestName } from "./lw/guest";
import { T, readLotus, type Lang } from "./lw/model";

function Film({ id, label }: { id: string; label: string }) {
  const [on, setOn] = useState(false);
  return (
    <div className="lw-film">
      {on ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
          title={label}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          loading="lazy"
        />
      ) : (
        <button type="button" className="lw-film-poster" onClick={() => setOn(true)} aria-label={label}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" decoding="async" />
          <span className="lw-film-play" aria-hidden>
            <Icon d={PLAY} fill size={28} />
          </span>
          <span className="lw-film-label">{label}</span>
        </button>
      )}
    </div>
  );
}

/** Eyebrow, title and the owner's red divider, revealed on scroll. */
function Head({ eyebrow, title, lang }: { eyebrow: ReactNode; title?: ReactNode; lang: Lang }) {
  return (
    <Reveal className="lw-head">
      <p className="lw-eyebrow" lang={lang}>
        {eyebrow}
      </p>
      {title && (
        <h2 className="lw-h2" lang={lang}>
          {title}
        </h2>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
      <img {...img("divider", { lazy: true })} className="lw-head-div" aria-hidden />
    </Reveal>
  );
}

/** 2 columns on phones, 3 on tablets, 4 from a laptop; the wall itself stops at 1080px (css). */
const GALLERY_COLUMNS = [
  { min: 0, columns: 2 },
  { min: 600, columns: 3 },
  { min: 900, columns: 4 },
];

const MONTHS_HI = ["जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"];

export default function LotusWeddingExperience({ data, mode, react }: ExperienceProps) {
  const m = useMemo(() => readLotus(data.extras as Record<string, unknown>, data.photos, data.recipientName, data.senderName), [data.extras, data.photos, data.recipientName, data.senderName]);
  const [lang, setLang] = useState<Lang>(m.lang);
  // The studio preview follows the "Opens in" setting when the sender changes it.
  const [langFrom, setLangFrom] = useState<Lang>(m.lang);
  if (langFrom !== m.lang) {
    setLangFrom(m.lang);
    setLang(m.lang);
  }
  const s = T[lang];
  const locale = lang === "hi" ? "hi-IN" : "en-IN";
  const couple = `${m.first} & ${m.second}`;
  const [open, setOpen] = useState(false);
  const guest = useGuestName();
  // On low-end phones drop the parallax and the ambient particles.
  const [lite] = useState(() => {
    if (typeof navigator === "undefined") return false;
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    return (navigator.hardwareConcurrency || 8) <= 4 && mem !== undefined && mem <= 3;
  });

  const main = m.main;
  const dateLine = main?.date ? formatEventDate(main.date, locale) : "";
  const shortDate = main?.date ? formatEventDate(main.date, "en-IN") : "";
  const mainTime = main?.time ? formatEventTime(main.time, locale) : "";
  const badge = useMemo(() => {
    if (!main?.date) return null;
    const [y, mo, d] = main.date.split("-").map(Number);
    const en = new Date(Date.UTC(y, mo - 1, d)).toLocaleDateString("en-IN", { month: "short", timeZone: "UTC" }).toUpperCase();
    return { month: lang === "hi" ? MONTHS_HI[mo - 1] : en, en, day: String(d), year: String(y) };
  }, [main?.date, lang]);
  const venueLine = [main?.venue, main?.address?.split(",").pop()?.trim()].filter(Boolean).join(" · ");

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

  // ?to= also fills the RSVP's name (the block may restore a stored reply first).
  const rsvpRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!guest) return;
    const ts = [300, 1400].map((ms) => window.setTimeout(() => prefillRsvpName(rsvpRef.current, guest), ms));
    return () => ts.forEach((t) => window.clearTimeout(t));
  }, [guest]);

  // The invitation always begins at the courtyard: the browser must not restore an old scroll
  // position behind the closed lotus (a reload would otherwise open onto the middle of the page).
  useEffect(() => {
    const h = window.history;
    const prev = h.scrollRestoration;
    h.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    return () => {
      h.scrollRestoration = prev;
    };
  }, []);

  // Smooth scrolling: every section's ambient loops (swaying lamps and umbrellas, the swing,
  // flickering flames) pause while it is off screen, so a long fling only animates what shows.
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = rootRef.current?.closest<HTMLElement>(".lw-root");
    if (!root || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle("lw-off", !e.isIntersecting)), { rootMargin: "120px 0px" });
    root.querySelectorAll(".lw-hero, .wk-section, .lw-finale").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [open]);

  const onOpened = () => {
    // Behind the light of the bloom, so the jump to the top is never seen.
    window.scrollTo({ top: 0, behavior: "instant" });
    setOpen(true);
    react("opened");
  };

  const hasFamilies = !!(m.brideFam.names || m.groomFam.names || m.brideFam.photo || m.groomFam.photo || m.blessingsOf);

  return (
    <WeddingRoot theme={m.theme} className={`lw-root${lang === "hi" ? " is-hi" : ""}${lite ? " is-lite" : ""}`} style={{ minHeight: "100dvh" }}>
      <style>{LW_CSS}</style>
      <div ref={rootRef} className="lw-backdrop" aria-hidden />
      <Opening first={m.first} second={m.second} dateLine={shortDate} guest={guest} s={s} lang={lang} invocation={m.invocation} onOpened={onOpened} />

      <div className="lw-lang" role="group" aria-label="Language">
        <button type="button" aria-pressed={lang === "en"} onClick={() => setLang("en")}>
          EN
        </button>
        <button type="button" aria-pressed={lang === "hi"} onClick={() => setLang("hi")} lang="hi">
          हिं
        </button>
      </div>

      <Hero
        open={open}
        lite={lite}
        s={s}
        lang={lang}
        first={m.first}
        second={m.second}
        guest={guest}
        invocation={m.invocation}
        badge={badge}
        dateLine={dateLine}
        time={mainTime}
        muhurat={m.muhurat}
        venue={venueLine}
        main={main}
        events={m.events}
        couple={couple}
      />

      {/* ── The invitation ──────────────────────────────────────────────── */}
      <Section id="invitation" ornament={null} width="normal" className="lw-sec lw-sec-invite">
        <Reveal effect="zoom" className="lw-hands">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...img("hands", { lazy: true })} aria-hidden />
        </Reveal>
        <Reveal className="lw-invite">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...img("cornerL", { lazy: true })} className="lw-corner lw-corner-l" aria-hidden />
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...img("cornerR", { lazy: true })} className="lw-corner lw-corner-r" aria-hidden />
          <p className="lw-eyebrow" lang={lang}>
            {s.invitation}
          </p>
          <MessageBlock text={data.letter} hindi={m.hindiMessage} ornament={null} heading={<span lang={lang}>{s.shubh}</span>} signature={data.endLine ? undefined : couple} />
        </Reveal>
      </Section>

      {/* ── Families ────────────────────────────────────────────────────── */}
      {hasFamilies && (
        <Section id="families" ornament={null} width="normal" className="lw-sec">
          <Head eyebrow={s.families} title={couple} lang={lang} />
          <Families bride={m.brideFam} groom={m.groomFam} first={m.familyFirst} blessingsOf={m.blessingsOf} labels={{ blessingsOf: s.blessingsOf, brideSide: s.brideSide, groomSide: s.groomSide }} />
        </Section>
      )}

      {/* ── The date + countdown, under brass lamps ─────────────────────── */}
      {main?.date && badge && (
        <Section id="countdown" ornament={null} width="normal" className="lw-sec lw-sec-date">
          <div className="lw-date-lamps" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img {...img("lamp", { lazy: true })} className="lw-date-lamp lw-date-lamp-l" />
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img {...img("lamp", { lazy: true })} className="lw-date-lamp lw-date-lamp-r" />
          </div>
          <Head eyebrow={s.dateEyebrow} title={s.countdown} lang={lang} />
          <div className="lw-date">
            <Reveal effect="zoom" className="lw-date-badge">
              <DateBadge month={badge.month} day={badge.day} year={badge.year} />
            </Reveal>
            <Reveal className="lw-date-count" delay={120}>
              <Countdown date={main.date} time={main.time || "00:00"} variant="flip" labels={s.units} doneText={lang === "hi" ? "विवाह संपन्न" : "Just married"} />
              <p className="lw-date-line">{[dateLine, mainTime].filter(Boolean).join(" · ")}</p>
              {m.muhurat && <p className="lw-date-muh">{m.muhurat}</p>}
            </Reveal>
          </div>
        </Section>
      )}

      {/* ── Our story ───────────────────────────────────────────────────── */}
      {m.story.length > 0 && (
        <Section id="story" ornament={null} width="wide" className="lw-sec">
          <Head eyebrow={s.storyEyebrow} title={s.story} lang={lang} />
          <Story chapters={m.story} />
        </Section>
      )}

      {/* ── Functions ───────────────────────────────────────────────────── */}
      {m.events.length > 0 && (
        <Section id="events" ornament={null} width="wide" className="lw-sec lw-sec-events">
          <div className="lw-umbrellas" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img {...img("umbrella", { lazy: true })} className="lw-umbrella lw-umbrella-l" />
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img {...img("umbrella", { lazy: true })} className="lw-umbrella lw-umbrella-r" />
          </div>
          <Head eyebrow={s.eventsEyebrow} title={s.events} lang={lang} />
          <LotusEvents events={m.events} locale={locale} labels={{ directions: s.directions, dress: s.dress, tba: s.tba, nav: s.nav }} />
        </Section>
      )}

      {/* ── The venue ───────────────────────────────────────────────────── */}
      {main?.venue && (
        <Section id="venue" ornament={null} width="wide" className="lw-sec">
          <Head eyebrow={s.venueEyebrow} title={main.venue} lang={lang} />
          <Venue event={main} eyebrow={main.title} directions={s.directions} note={m.gettingThere || undefined} />
        </Section>
      )}

      {/* ── Live stream ─────────────────────────────────────────────────── */}
      {m.liveUrl && (
        <Section id="live" ornament={null} width="narrow" className="lw-sec">
          <Head eyebrow={s.liveEyebrow} title={s.live} lang={lang} />
          <Reveal>
            <LiveStream url={m.liveUrl} main={main} s={s} />
          </Reveal>
        </Section>
      )}

      {/* ── Pre-wedding film ────────────────────────────────────────────── */}
      {m.videoId && (
        <Section id="film" ornament={null} width="normal" className="lw-sec">
          <Head eyebrow={s.film} lang={lang} />
          <Reveal effect="zoom">
            <Film id={m.videoId} label={s.play} />
          </Reveal>
        </Section>
      )}

      {/* ── Gallery ─────────────────────────────────────────────────────── */}
      {m.gallery.length > 0 && (
        <Section id="gallery" ornament={null} width="wide" className="lw-sec lw-sec-gallery">
          <Head eyebrow={s.galleryEyebrow} title={s.gallery} lang={lang} />
          <WeddingMasonry photos={m.gallery} mask="rounded" radius={16} columns={GALLERY_COLUMNS} frame="foil" tileCaptions label={s.gallery} />
        </Section>
      )}

      {/* ── Good to know + contacts ─────────────────────────────────────── */}
      {(m.things.length > 0 || m.contacts.length > 0) && (
        <Section id="good-to-know" ornament={null} width="normal" className="lw-sec">
          <Head eyebrow={s.goodToKnow} lang={lang} />
          {m.things.length > 0 && (
            <ul className="lw-know">
              {m.things.map((t, i) => (
                <Reveal as="li" key={i} className="lw-know-i" delay={(i % 3) * 70}>
                  {t.head && <p className="lw-know-h">{t.head}</p>}
                  <p className="lw-know-t">{t.text}</p>
                </Reveal>
              ))}
            </ul>
          )}
          {m.contacts.length > 0 && (
            <div className="lw-contacts-wrap">
              <Reveal as="p" className="lw-eyebrow">
                <span lang={lang}>{s.contactsEyebrow}</span>
              </Reveal>
              <Reveal as="h3" className="lw-h3">
                <span lang={lang}>{s.contacts}</span>
              </Reveal>
              <Contacts list={m.contacts} s={s} couple={couple} />
            </div>
          )}
        </Section>
      )}

      {/* ── RSVP ────────────────────────────────────────────────────────── */}
      <Section id="rsvp" ornament={null} width="wide" className="lw-sec lw-sec-rsvp">
        <Head eyebrow={`RSVP · ${s.rsvpEyebrow}`} title={s.rsvp} lang={lang} />
        <Reveal as="p" className="lw-upasthiti">
          <span lang={lang}>{s.upasthiti}</span>
        </Reveal>
        <div className="lw-rsvp-wrap">
          {/* A white-gold lotus rising from the pond beside the reply, lamps glowing over it. */}
          <Reveal effect="zoom" className="lw-rsvp-art">
            <span className="lw-rsvp-glow" aria-hidden />
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img {...img("leafStem", { lazy: true })} className="lw-rsvp-leaf" aria-hidden />
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img {...img("bloomStem", { lazy: true })} className="lw-rsvp-bloom" aria-hidden />
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img {...img("budB", { lazy: true })} className="lw-rsvp-bud" aria-hidden />
            <span className="lw-rsvp-water" aria-hidden />
            <p className="lw-rsvp-names">{couple}</p>
          </Reveal>
          {/* The kit's form labels are English only, so its "Kindly reply by <date>" stays English too (no mixed-script line). */}
          <Reveal>
            <div ref={rsvpRef} className="lw-rsvp">
              <RSVPBlock mode={mode} couple={couple} events={m.events} perEvent meal={m.rsvpMeal} maxGuests={m.maxGuests} deadline={m.rsvpBy || undefined} title="" intro={s.rsvpIntro} locale="en-IN" />
            </div>
          </Reveal>
        </div>
      </Section>

      {/* ── Blessings ───────────────────────────────────────────────────── */}
      {m.blessings && (
        <Section id="blessings" ornament={null} width="wide" className="lw-sec lw-sec-bless">
          <Head eyebrow={s.blessingsEyebrow} title={s.blessings} lang={lang} />
          <BlessingsWall mode={mode} title="" intro={s.blessingsIntro} />
        </Section>
      )}

      {/* ── Shagun ──────────────────────────────────────────────────────── */}
      {m.upiId && (
        <Section id="shagun" ornament={null} width="narrow" className="lw-sec">
          <Head eyebrow={s.shagunEyebrow} title={s.shagun} lang={lang} />
          <Reveal>
            <Shagun upiId={m.upiId} upiName={m.upiName} s={s} />
          </Reveal>
        </Section>
      )}

      <div ref={endRef} />
      <Finale
        seal={T.en.shubh}
        sealHi={T.hi.shubh}
        closing={s.closing}
        endLine={data.endLine}
        first={m.first}
        second={m.second}
        hashtag={m.hashtag}
        lang={lang}
      />
    </WeddingRoot>
  );
}
