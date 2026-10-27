"use client";

// ─── Wedding Invitation (Classic) · the Gulabi Jharokha — the guest's page ──
//
// The carved jharokha at pink dawn (tap: santoor glissando, the latticed ivory
// shutters swing outward in 3D, rose light and petals pour through, the names
// float up, the music starts, the camera steps through) → the rose garden
// (gold lattice crown, names in rose-gold script, the date strip, RSVP, the
// floral gazebo with the illustrated couple or their portrait,
// peony trees) → the invitation in English + Hindi on ivory stationery (gold
// swirls, roses, Shri Ganesh when chosen) → the families → the date with
// a flip countdown on a mandala band → the story along a rose-gold thread →
// every function as a card from the suite → the venue → film → gallery →
// for our guests (good to know, who to call, livestream, shagun) → RSVP per
// function → blessings → the jharokha closes at dusk, replay.
//
// Art: public/wedding-v3 (./cw/assets.ts), served from the repo, never the CDN.
// One long calm scroll after one cinematic moment; every motion is
// transform/opacity, gated on visibility, and reduced-motion aware. A
// bilingual toggle (top-left) switches every heading and button to Hindi.
// ?to=Name greets the guest on the window and pre-fills their RSVP.
// Pages published before the rebuild (≤ 2 functions, a dark theme, no story,
// no Hindi) render through the same model with every new block hidden.

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { BlessingsWall, Countdown, DEFAULT_TZ_OFFSET, FamiliesBlock, MessageBlock, RSVPBlock, Reveal, Section, VenueCard, WeddingMasonry, WeddingRoot } from "../../_wedding";
import type { ExperienceProps } from "../../_valentine/types";
import { useDayMusic } from "../../_valentine/music/context";
import { A, CW_KIT, img } from "./cw/assets";
import Events from "./cw/Events";
import Finale from "./cw/Finale";
import { Contacts, GoodToKnow, LiveButton, Shagun } from "./cw/GuestInfo";
import Hero from "./cw/Hero";
import Jharokha from "./cw/Jharokha";
import Story from "./cw/Story";
import { CW_CSS } from "./cw/css";
import { BLESSINGS_HI, RSVP_HI, T, fnTitle, longDate, readClassic, timeIn, type Lang } from "./cw/model";
import { prefillRsvpName, useGuestName } from "./cw/share";

/** Two across on a phone, three from a tablet up (the gallery block is capped, so tiles stay large). */
const GALLERY_COLUMNS = [
  { min: 0, columns: 2 },
  { min: 600, columns: 3 },
] as const;

/** The kit's paper textures from this repo (public/wedding-v3/classic/kit); the kit's defaults point at the CDN. */
const rootStyle = (theme: string): CSSProperties =>
  ({
    minHeight: "100dvh",
    ["--wk-texture" as string]: `url("${CW_KIT.linen}")`,
    ["--wk-paper" as string]: `url("${theme === "champagne" ? CW_KIT.silk : CW_KIT.linen}")`,
  }) as CSSProperties;

function Film({ id, label }: { id: string; label: string }) {
  const [on, setOn] = useState(false);
  return (
    <div className="cw-film">
      {on ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
          title={label}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          loading="lazy"
        />
      ) : (
        <button type="button" className="cw-film-poster" onClick={() => setOn(true)} aria-label={label}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" decoding="async" width={480} height={360} />
          <span className="cw-film-play" aria-hidden>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5.5v13l11-6.5z" />
            </svg>
          </span>
          <span className="cw-film-label">{label}</span>
        </button>
      )}
    </div>
  );
}

const OPENED_KEY = "cw-opened:";

export default function WeddingInvitationExperience({ data, mode, react }: ExperienceProps) {
  const m = useMemo(() => readClassic(data.extras as Record<string, unknown>, data.photos, data.recipientName, data.senderName), [data.extras, data.photos, data.recipientName, data.senderName]);
  const [lang, setLang] = useState<Lang>(m.lang);
  const s = T[lang];
  const locale = lang === "hi" ? "hi-IN" : "en-IN";
  const couple = `${m.first} & ${m.second}`;
  const music = useDayMusic();
  const guest = useGuestName();
  const rsvpRef = useRef<HTMLDivElement>(null);
  // A reload in the same tab skips the window (the guest already opened it); the editor preview always shows it.
  const [open, setOpen] = useState(() => {
    if (mode !== "live" || typeof window === "undefined") return false;
    try {
      return window.sessionStorage.getItem(OPENED_KEY + window.location.pathname) === "1";
    } catch {
      return false;
    }
  });
  const [round, setRound] = useState(0);
  const [gate, setGate] = useState(!open);

  const dateLine = longDate(m.date, locale);
  const shortDate = m.date ? longDate(m.date, "en-IN").replace(/^[^,]+,\s*/, "") : "";
  const mainTime = timeIn(m.time, lang);
  const venueLine = [m.main?.venue, m.main?.address?.split(",").pop()?.trim()].filter(Boolean).join(" · ");

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

  // ?to=Name → the RSVP's name box (once it is on screen and still empty).
  useEffect(() => {
    const el = rsvpRef.current;
    if (!el || !guest) return;
    const io = new IntersectionObserver(([en]) => {
      if (en.isIntersecting) prefillRsvpName(el, guest);
    });
    io.observe(el);
    return () => io.disconnect();
  }, [guest]);

  const onOpened = useCallback(() => {
    setOpen(true);
    react("opened");
    if (mode === "live") {
      try {
        window.sessionStorage.setItem(OPENED_KEY + window.location.pathname, "1");
      } catch {}
    }
    window.setTimeout(() => setGate(false), 800);
  }, [mode, react]);

  const replay = () => {
    window.scrollTo({ top: 0, behavior: "auto" });
    setOpen(false);
    setRound((n) => n + 1);
    setGate(true);
  };

  const toRsvp = () => document.getElementById("rsvp")?.scrollIntoView({ behavior: "smooth", block: "start" });

  const bride = { ...m.bride_, title: s.brideSide };
  const groom = { ...m.groom_, title: s.groomSide };
  const hasFamilies = bride.names.length > 0 || groom.names.length > 0;
  // The RSVP's function chips read in the page's language too (the ids, which the owner's dashboard keys on, stay).
  const rsvpEvents = useMemo(() => (lang === "hi" ? m.events.map((e) => ({ ...e, title: fnTitle(e.title, "hi") })) : m.events), [lang, m.events]);
  const hasInfo = m.things.length > 0 || !!m.gettingThere || m.contacts.length > 0 || !!m.upiId || !!m.liveUrl;

  return (
    <WeddingRoot theme={m.theme} className={`cw-root${lang === "hi" ? " is-hi" : ""}${open ? " is-open" : ""}`} style={rootStyle(m.theme)}>
      <style>{CW_CSS}</style>
      {gate && <Jharokha key={round} first={m.first} second={m.second} dateLine={shortDate} guest={guest} s={s} lang={lang} invocation={m.invocation} onOpened={onOpened} />}

      <div className={`cw-lang${lang === "hi" ? " is-hi" : ""}`} role="group" aria-label={s.lang}>
        <span className="cw-lang-pill" aria-hidden />
        <button type="button" aria-pressed={lang === "en"} onClick={() => setLang("en")}>
          EN
        </button>
        <button type="button" aria-pressed={lang === "hi"} onClick={() => setLang("hi")} lang="hi">
          हिंदी
        </button>
      </div>

      {open && music?.available && music.blocked && !music.playing && (
        <button type="button" className="cw-hear" onClick={() => music.start()} lang={lang}>
          <span aria-hidden>♪</span> {s.music}
        </button>
      )}

      <Hero
        on={open}
        s={s}
        lang={lang}
        first={m.first}
        second={m.second}
        guest={guest}
        date={m.date}
        time={mainTime}
        venue={venueLine}
        photo={m.hero}
        onRsvp={m.rsvp ? toRsvp : undefined}
      />

      {/* ── The invitation ──────────────────────────────────────────────── */}
      <Section id="invitation" eyebrow={<span lang={lang}>{s.invitation}</span>} ornament={null} width="normal" className="cw-sec cw-sec-invite">
        <Reveal effect="zoom" className="cw-letter">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img className="cw-letter-roses is-tr" {...img(A.roses, { lazy: true })} aria-hidden />
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img className="cw-letter-roses is-bl" {...img(A.roses, { lazy: true })} aria-hidden />
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img className="cw-letter-swirl is-tl" {...img(A.swirl, { lazy: true })} aria-hidden />
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img className="cw-letter-swirl is-br" {...img(A.swirl, { lazy: true })} aria-hidden />
          <div className="cw-letter-in">
            {m.invocation && (
              <p className="cw-invoke">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img {...img(A.ganesha, { lazy: true })} alt="" aria-hidden />
                <span lang="hi">॥ श्री गणेशाय नमः ॥</span>
              </p>
            )}
            {/* The Hindi page reads the Hindi letter alone; the English page keeps both side by side. */}
            <MessageBlock text={lang === "hi" && m.hindiMessage ? m.hindiMessage : data.letter} hindi={lang === "hi" ? undefined : m.hindiMessage} ornament={null} heading={<span lang={lang}>{s.shubh}</span>} signature={data.endLine ? undefined : couple} />
          </div>
        </Reveal>
      </Section>

      {/* ── Families ────────────────────────────────────────────────────── */}
      {(hasFamilies || m.blessingsOf) && (
        <Section id="families" eyebrow={<span lang={lang}>{s.families}</span>} title={<span lang={lang}>{couple}</span>} ornament="divider-lotus" width="normal" className="cw-sec cw-sec-fam">
          <div className="cw-fam">
            {m.blessingsOf && (
              <Reveal className="cw-blessings-of">
                <p className="wk-eyebrow" lang={lang}>
                  {s.blessingsOf}
                </p>
                <p className="cw-blessings-names">{m.blessingsOf}</p>
              </Reveal>
            )}
            {hasFamilies && <FamiliesBlock bride={bride} groom={groom} first={m.familyFirst} heading="" />}
          </div>
        </Section>
      )}

      {/* ── The date + countdown ────────────────────────────────────────── */}
      {m.date && (
        <section id="date" className="cw-day" aria-label={s.dateEyebrow}>
          <div className="cw-day-band" aria-hidden />
          <Reveal className="cw-day-card">
            <p className="wk-eyebrow" lang={lang}>
              {s.dateEyebrow}
            </p>
            <p className="cw-day-date">{dateLine}</p>
            {(mainTime || m.muhurat) && (
              <p className="cw-day-time">
                {mainTime && <span>{mainTime}</span>}
                {m.muhurat && <span className="cw-day-muhurat">{m.muhurat}</span>}
              </p>
            )}
            <p className="cw-day-count" lang={lang}>
              {s.countdown}
            </p>
            <Countdown date={m.date} time={m.time || undefined} tz={DEFAULT_TZ_OFFSET} variant="flip" labels={s.units} doneText={s.done} className="cw-count" />
          </Reveal>
        </section>
      )}

      {/* ── Our story ───────────────────────────────────────────────────── */}
      {m.story.length > 0 && (
        <Section id="story" eyebrow={<span lang={lang}>{s.storyEyebrow}</span>} title={<span lang={lang}>{s.story}</span>} ornament="divider-mandala" width="normal" className="cw-sec cw-sec-story">
          <Story chapters={m.story} />
        </Section>
      )}

      {/* ── Functions ───────────────────────────────────────────────────── */}
      {m.events.length > 0 && (
        <Section id="events" eyebrow={<span lang={lang}>{s.eventsEyebrow}</span>} title={<span lang={lang}>{s.events}</span>} ornament="divider-lotus" width="wide" className="cw-sec cw-sec-events">
          <Events events={m.events} locale={locale} lang={lang} labels={{ directions: s.directions, dress: s.dress, tba: s.tba, swipe: s.swipe }} />
        </Section>
      )}

      {/* ── The venue ───────────────────────────────────────────────────── */}
      {m.main?.venue && (
        <Section id="venue" eyebrow={<span lang={lang}>{s.venueEyebrow}</span>} ornament={null} width="normal" className="cw-sec cw-sec-venue">
          <div className="cw-venue">
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img className="cw-venue-peony" {...img(A.peonies, { lazy: true })} aria-hidden />
            <Reveal effect="zoom" className="cw-venue-card">
              <VenueCard name={m.main.venue} address={m.main.address} mapUrl={m.main.mapUrl} embed ornament={null} eyebrow={m.main.title || s.venueEyebrow} note={m.main.note || undefined} labels={{ directions: s.getDirections, showMap: s.showMap }} />
            </Reveal>
          </div>
        </Section>
      )}

      {/* ── Pre-wedding film ────────────────────────────────────────────── */}
      {m.videoId && (
        <Section id="film" eyebrow={<span lang={lang}>{s.film}</span>} ornament={null} width="normal" className="cw-sec">
          <Reveal effect="zoom">
            <Film id={m.videoId} label={s.play} />
          </Reveal>
        </Section>
      )}

      {/* ── Gallery ─────────────────────────────────────────────────────── */}
      {m.gallery.length > 0 && (
        <Section id="gallery" eyebrow={<span lang={lang}>{s.galleryEyebrow}</span>} title={<span lang={lang}>{s.gallery}</span>} ornament="divider-scroll" width="wide" className="cw-sec cw-sec-gallery">
          <div className="cw-gallery">
            <WeddingMasonry photos={m.gallery} mask="rounded" radius={18} columns={GALLERY_COLUMNS} frame="foil" tileCaptions label={s.gallery} />
          </div>
        </Section>
      )}

      {/* ── For our guests ──────────────────────────────────────────────── */}
      {hasInfo && (
        <Section id="good-to-know" eyebrow={<span lang={lang}>{s.infoEyebrow}</span>} title={<span lang={lang}>{s.info}</span>} ornament={null} width="normal" className="cw-sec cw-sec-info">
          <GoodToKnow things={m.things} gettingThere={m.gettingThere} s={s} lang={lang} />
          {m.contacts.length > 0 && (
            <div className="cw-info-block">
              <Reveal as="p" className="cw-info-h">
                <span lang={lang}>{s.callUs}</span>
              </Reveal>
              <Contacts contacts={m.contacts} s={s} couple={couple} />
            </div>
          )}
          <LiveButton url={m.liveUrl} main={m.main} s={s} />
          {m.upiId && (
            <div className="cw-info-block">
              <Reveal as="p" className="cw-info-h">
                <span lang={lang}>{s.shagun}</span>
              </Reveal>
              <Shagun upiId={m.upiId} upiName={m.upiName} couple={couple} s={s} />
            </div>
          )}
        </Section>
      )}

      {/* ── RSVP ────────────────────────────────────────────────────────── */}
      {m.rsvp && (
        <Section id="rsvp" eyebrow={<span lang={lang}>{lang === "hi" ? s.rsvpEyebrow : `RSVP · ${s.rsvpEyebrow}`}</span>} ornament={null} width="wide" className="cw-sec cw-sec-rsvp">
          {/* Wide screens: the couple on their flowered swing under the floral canopy beside the form; phones: a small vignette above it. */}
          <div className="cw-rsvp">
            <Reveal effect="zoom" className="cw-rsvp-art">
              <span className="cw-rsvp-arch" aria-hidden>
                {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                <img className="cw-rsvp-canopy" {...img(A.canopy, { lazy: true })} />
                {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                <img className="cw-rsvp-swing" {...img(A.swing, { lazy: true })} />
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img className="cw-rsvp-peony" {...img(A.peonies, { lazy: true })} aria-hidden />
              <p className="cw-upasthiti">
                <span lang={lang}>{s.upasthiti}</span>
              </p>
              <p className="cw-rsvp-couple">{couple}</p>
            </Reveal>
            <div ref={rsvpRef} className="cw-rsvp-form">
              <Reveal>
                <RSVPBlock mode={mode} couple={couple} events={rsvpEvents} perEvent={m.events.length > 1} meal={m.rsvpMeal} maxGuests={m.maxGuests} deadline={m.rsvpBy || undefined} title={s.rsvp} intro={m.events.length > 1 ? s.rsvpIntro : undefined} locale={locale} text={lang === "hi" ? RSVP_HI : undefined} />
              </Reveal>
            </div>
          </div>
        </Section>
      )}

      {/* ── Blessings ───────────────────────────────────────────────────── */}
      {m.blessings && (
        <Section id="blessings" eyebrow={<span lang={lang}>{s.blessingsEyebrow}</span>} ornament="divider-paisley" width="wide" className="cw-sec cw-sec-bless">
          <BlessingsWall mode={mode} title={s.blessings} intro={s.blessingsIntro} text={lang === "hi" ? BLESSINGS_HI : undefined} />
        </Section>
      )}

      <div ref={endRef} />
      <Finale seal={T.en.shubh} sealHi={T.hi.shubh} closing={s.closing} endLine={data.endLine} first={m.first} second={m.second} hashtag={m.hashtag} lang={lang} replayLabel={s.replay} onReplay={replay} />
    </WeddingRoot>
  );
}
