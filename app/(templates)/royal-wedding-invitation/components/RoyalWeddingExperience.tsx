"use client";

// ─── Royal Wedding Invitation 👑 — the guest's experience ────────────────────
//
// palace gates (tap: doors swing in, light + petals, the shehnai starts) →
// the hero (Ken Burns cover in a jharokha, the crest stamps in gold foil) →
// the invitation in English + Hindi → the families (with photos) → a flip
// countdown with the muhurat → the story in chapters along a scroll-drawn
// gold line → every function (dress-code swatch, map, calendar, "save all")
// → the pre-wedding film → the 40-photo masonry (arch + foil frames) → good
// to know → RSVP per function (headcount, meal, a note) → the blessings
// wall → diya lanterns rise over the palace and the Shubh Vivah seal.
//
// One long, calm scroll after one cinematic moment; every motion is
// transform/opacity, gated on visibility, and reduced-motion aware. A
// bilingual toggle (top-left) switches every heading and button to Hindi.

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BlessingsWall,
  Countdown,
  EventsTimeline,
  FamiliesBlock,
  MessageBlock,
  Monogram,
  Ornament,
  RSVPBlock,
  Reveal,
  Section,
  WeddingCard,
  WeddingMasonry,
  WeddingRoot,
  formatEventDate,
  formatEventTime,
  photoImgStyle,
} from "../../_wedding";
import type { ExperienceProps } from "../../_valentine/types";
import Gates from "./rw/Gates";
import Story from "./rw/Story";
import Finale from "./rw/Finale";
import { RW_CSS } from "./rw/css";
import { T, readRoyal, type Lang } from "./rw/model";

function Film({ id, label }: { id: string; label: string }) {
  const [on, setOn] = useState(false);
  return (
    <div className="rw-film wk-foil-border">
      {on ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
          title={label}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          loading="lazy"
        />
      ) : (
        <button type="button" className="rw-film-poster" onClick={() => setOn(true)} aria-label={label}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" decoding="async" />
          <span className="rw-film-play" aria-hidden>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5.5v13l11-6.5z" />
            </svg>
          </span>
          <span className="rw-film-label">{label}</span>
        </button>
      )}
    </div>
  );
}

export default function RoyalWeddingExperience({ data, mode, react }: ExperienceProps) {
  const m = useMemo(() => readRoyal(data.extras as Record<string, unknown>, data.photos, data.recipientName, data.senderName), [data.extras, data.photos, data.recipientName, data.senderName]);
  const [lang, setLang] = useState<Lang>(m.lang);
  const s = T[lang];
  const locale = lang === "hi" ? "hi-IN" : "en-IN";
  const couple = `${m.first} & ${m.second}`;
  const [open, setOpen] = useState(false);

  const dateLine = m.main?.date ? formatEventDate(m.main.date, locale) : "";
  const shortDate = m.main?.date ? m.main.date.split("-").reverse().join(" · ") : "";
  const mainTime = m.main?.time ? formatEventTime(m.main.time, locale) : "";
  // Client-only component (ssr: false), so the URL is known on the first render.
  const [url] = useState(() => (typeof window === "undefined" ? "" : window.location.href.split("#")[0]));

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

  const onOpened = () => {
    setOpen(true);
    react("opened");
  };

  const bride = { ...m.bride_, title: s.brideSide };
  const groom = { ...m.groom_, title: s.groomSide };
  const hasFamilies = bride.names.length > 0 || groom.names.length > 0;
  const shareText = lang === "hi" ? `${couple} के शुभ विवाह का निमंत्रण 👑` : `You're invited to the wedding of ${couple} 👑`;

  return (
    <WeddingRoot theme={m.theme} className={`rw-root${lang === "hi" ? " is-hi" : ""}`} style={{ minHeight: "100dvh" }}>
      <style>{RW_CSS}</style>
      <Gates first={m.first} second={m.second} dateLine={shortDate} s={s} lang={lang} onOpened={onOpened} />

      <div className="rw-lang" role="group" aria-label="Language">
        <button type="button" aria-pressed={lang === "en"} onClick={() => setLang("en")}>
          EN
        </button>
        <button type="button" aria-pressed={lang === "hi"} onClick={() => setLang("hi")} lang="hi">
          हिं
        </button>
      </div>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <header className={`rw-hero${open ? " is-open" : ""}`}>
        {m.hero ? (
          <div className="rw-hero-photo" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.hero.url} alt="" decoding="async" fetchPriority="high" style={photoImgStyle(m.hero)} />
          </div>
        ) : (
          <div className="rw-hero-mandala" aria-hidden>
            <Ornament id="mandala-ornate" width="min(760px, 140vw)" />
          </div>
        )}
        <div className="rw-hero-scrim" aria-hidden />
        <div className="rw-toran rw-toran-hero" aria-hidden />
        <div className="rw-hero-in">
          <div className="rw-hero-crest">{open && <Monogram a={m.first} b={m.second} variant="crest" size={132} />}</div>
          <p className="wk-eyebrow rw-hero-k" lang={lang}>
            {s.shubh}
          </p>
          <h1 className="rw-hero-names">
            <span className="wk-foil-text wk-shimmer">{m.first}</span>
            <span className="rw-amp" lang={lang}>
              {s.and}
            </span>
            <span className="wk-foil-text wk-shimmer">{m.second}</span>
          </h1>
          <p className="rw-hero-inv" lang={lang}>
            {s.invited}
          </p>
          {dateLine && (
            <p className="rw-hero-date">
              {dateLine}
              {mainTime && <> · {mainTime}</>}
            </p>
          )}
          {m.muhurat && <p className="rw-hero-muhurat">{m.muhurat}</p>}
          {m.main?.venue && <p className="rw-hero-venue">{[m.main.venue, m.main.address?.split(",").pop()?.trim()].filter(Boolean).join(" · ")}</p>}
        </div>
        <span className="rw-scroll-cue" aria-hidden />
      </header>

      {/* ── The invitation ──────────────────────────────────────────────── */}
      <Section id="invitation" eyebrow={<span lang={lang}>{s.invitation}</span>} ornament={null} width="normal">
        <WeddingCard paper corners="corner-mughal" className="rw-invite">
          <MessageBlock text={data.letter} hindi={m.hindiMessage} ornament="kalash" heading={<span lang={lang}>{s.shubh}</span>} signature={data.endLine ? undefined : couple} />
        </WeddingCard>
      </Section>

      {/* ── Families ────────────────────────────────────────────────────── */}
      {(hasFamilies || m.blessingsOf) && (
        <Section id="families" eyebrow={<span lang={lang}>{s.families}</span>} title={<span lang={lang}>{couple}</span>} ornament="divider-paisley" width="normal">
          {m.blessingsOf && (
            <Reveal className="rw-blessings-of">
              <p className="wk-eyebrow" lang={lang}>
                {s.blessingsOf}
              </p>
              <p className="rw-blessings-names">{m.blessingsOf}</p>
            </Reveal>
          )}
          {hasFamilies && <FamiliesBlock bride={bride} groom={groom} first={m.familyFirst} heading="" photos />}
        </Section>
      )}

      {/* ── Countdown ───────────────────────────────────────────────────── */}
      {m.main?.date && (
        <Section id="countdown" eyebrow={<span lang={lang}>{s.countdown}</span>} ornament={null} width="narrow" className="rw-count">
          <div className="rw-count-ring" aria-hidden>
            <Ornament id="mandala-simple" width="min(520px, 120vw)" />
          </div>
          <Reveal>
            <Countdown date={m.main.date} time={m.main.time || "00:00"} variant="flip" labels={s.units} doneText={s.done} />
          </Reveal>
          {(m.muhurat || dateLine) && (
            <Reveal as="p" className="rw-count-line" delay={120}>
              {m.muhurat || dateLine}
            </Reveal>
          )}
        </Section>
      )}

      {/* ── Our story ───────────────────────────────────────────────────── */}
      {m.story.length > 0 && (
        <Section id="story" eyebrow={<span lang={lang}>{s.storyEyebrow}</span>} title={<span lang={lang}>{s.story}</span>} ornament="divider-mandala" width="normal">
          <Story chapters={m.story} />
        </Section>
      )}

      {/* ── Functions ───────────────────────────────────────────────────── */}
      {m.events.length > 0 && (
        <Section id="events" eyebrow={<span lang={lang}>{s.eventsEyebrow}</span>} title={<span lang={lang}>{s.events}</span>} ornament="divider-lotus" width="normal">
          <EventsTimeline
            events={m.events}
            couple={couple}
            calendar="all"
            mainEventId={m.main?.id}
            url={url || undefined}
            locale={locale}
            showSwatch
            labels={{ directions: s.directions, calendar: s.calendar, saveAll: s.saveAll, dress: s.dress, tba: s.tba }}
          />
        </Section>
      )}

      {/* ── Pre-wedding film ────────────────────────────────────────────── */}
      {m.videoId && (
        <Section id="film" eyebrow={<span lang={lang}>{s.film}</span>} ornament={null} width="normal">
          <Reveal effect="zoom">
            <Film id={m.videoId} label={s.play} />
          </Reveal>
        </Section>
      )}

      {/* ── Gallery ─────────────────────────────────────────────────────── */}
      {m.gallery.length > 0 && (
        <Section id="gallery" eyebrow={<span lang={lang}>{s.gallery}</span>} title={<span lang={lang}>{s.gallery}</span>} ornament="divider-scroll" width="wide">
          <WeddingMasonry photos={m.gallery} mask="arch" frame="foil" tileCaptions label={s.gallery} />
        </Section>
      )}

      {/* ── Good to know ────────────────────────────────────────────────── */}
      {(m.things.length > 0 || m.gettingThere) && (
        <Section id="good-to-know" eyebrow={<span lang={lang}>{s.goodToKnow}</span>} ornament={null} width="normal">
          <ul className="rw-know">
            {m.things.map((t, i) => (
              <Reveal as="li" key={i} className="wk-card wk-foil-border rw-know-i" delay={i * 70}>
                {t.head && <p className="rw-know-h">{t.head}</p>}
                <p className="rw-know-t">{t.text}</p>
              </Reveal>
            ))}
            {m.gettingThere && (
              <Reveal as="li" className="wk-card wk-foil-border rw-know-i rw-know-wide" delay={m.things.length * 70}>
                <p className="rw-know-h" lang={lang}>
                  {s.gettingThere}
                </p>
                <p className="rw-know-t">{m.gettingThere}</p>
              </Reveal>
            )}
          </ul>
        </Section>
      )}

      {/* ── RSVP ────────────────────────────────────────────────────────── */}
      <Section id="rsvp" eyebrow={<span lang={lang}>RSVP · {s.rsvpEyebrow}</span>} ornament="divider-dots" width="narrow">
        <Reveal>
          <RSVPBlock mode={mode} couple={couple} events={m.events} perEvent meal={m.rsvpMeal} maxGuests={m.maxGuests} deadline={m.rsvpBy || undefined} title={s.rsvp} intro={s.rsvpIntro} locale={locale} />
        </Reveal>
      </Section>

      {/* ── Blessings ───────────────────────────────────────────────────── */}
      {m.blessings && (
        <Section id="blessings" eyebrow={<span lang={lang}>{s.blessingsEyebrow}</span>} ornament="divider-paisley" width="normal">
          <BlessingsWall mode={mode} title={s.blessings} intro={s.blessingsIntro} />
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
        whatsapp={s.whatsapp}
        shareText={shareText}
      />
    </WeddingRoot>
  );
}
