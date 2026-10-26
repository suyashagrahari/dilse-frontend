"use client";

// ─── Wedding Invitation ✦ Premium — "The Lake Terrace": the guest's page ─────
//
// Tall gold French doors with etched glass swing inward (tap: a glass chime,
// a reflection sweeps the panes, sunlight spills through, the music starts)
// → the terrace hero (flamingos, the couple's names, the cover photo between
// the gazebo and the peacock, the lake and the balustrade) → the invitation in
// English + Hindi under a cherry-blossom branch → the families → the date and
// a flip countdown under hanging lanterns → our story → the functions → the
// venue by the fountain → live stream → film → gallery → good to know + family
// contacts → RSVP per function → blessings → shagun → share → the terrace at
// evening.
//
// All art is the owner's, served from /public/wedding-v3 (never the CDN).
// Every motion is transform/opacity, reduced-motion aware. Light themes only:
// a page stored with an old dark theme renders in the nearest light palette.
// A bilingual toggle (top-left) switches every heading and button to Hindi.
// ?to=<name> greets the guest by name and signs their RSVP.

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { BLESSINGS_TEXT_HI, BlessingsWall, photoImgStyle, Countdown, MessageBlock, RSVPBlock, RSVP_TEXT_HI, Reveal, Section, WeddingMasonry, WeddingRoot, fnTitle, formatEventDate, formatEventTime, hiTime } from "../../_wedding";
import type { ExperienceProps } from "../../_valentine/types";
import { Contacts, Icon, LiveStream, PLAY, ShareBar, Shagun, pageUrl } from "./wp/Actions";
import Events from "./wp/Events";
import Families from "./wp/Families";
import Finale from "./wp/Finale";
import Hero, { MotifMark } from "./wp/Hero";
import Opening from "./wp/Opening";
import Story from "./wp/Story";
import Venue from "./wp/Venue";
import { img } from "./wp/art";
import { WP_CSS } from "./wp/css";
import { prefillRsvpName, useGuestName } from "./wp/guest";
import type { InviteCardInput } from "./wp/inviteCard";
import { T, readPremium, type Lang, type Strings } from "./wp/model";

function Film({ id, label }: { id: string; label: string }) {
  const [on, setOn] = useState(false);
  return (
    <div className="wp-film">
      {on ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
          title={label}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          loading="lazy"
        />
      ) : (
        <button type="button" className="wp-film-poster" onClick={() => setOn(true)} aria-label={label}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" decoding="async" />
          <span className="wp-film-play" aria-hidden>
            <Icon d={PLAY} fill size={28} />
          </span>
          <span className="wp-film-label">{label}</span>
        </button>
      )}
    </div>
  );
}

/** Eyebrow, title and a gold rule, revealed on scroll. */
function Head({ eyebrow, title, lang }: { eyebrow: ReactNode; title?: ReactNode; lang: Lang }) {
  return (
    <Reveal className="wp-head">
      <p className="wp-eyebrow" lang={lang}>
        {eyebrow}
      </p>
      {title && (
        <h2 className="wp-h2" lang={lang}>
          {title}
        </h2>
      )}
      <span className="wp-rule" aria-hidden>
        <i />
      </span>
    </Reveal>
  );
}

/** 2 columns on phones, 3 on tablets, 4 from a laptop; the wall itself stops at 1080px (css). */
const GALLERY_COLUMNS = [
  { min: 0, columns: 2 },
  { min: 600, columns: 3 },
  { min: 900, columns: 4 },
];

export default function WeddingPremiumExperience({ data, mode, react }: ExperienceProps) {
  const m = useMemo(() => readPremium(data), [data]);
  const [lang, setLang] = useState<Lang>(m.lang);
  // The studio preview follows the "Opens in" setting when the sender changes it.
  const [langFrom, setLangFrom] = useState<Lang>(m.lang);
  if (langFrom !== m.lang) {
    setLangFrom(m.lang);
    setLang(m.lang);
  }
  const s: Strings = T[lang];
  const locale = lang === "hi" ? "hi-IN" : "en-IN";
  const couple = m.couple;
  const [open, setOpen] = useState(false);
  const [openKey, setOpenKey] = useState(0);
  const guest = useGuestName();
  const [lite] = useState(() => {
    if (typeof navigator === "undefined") return false;
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    return (navigator.hardwareConcurrency || 8) <= 4 && mem !== undefined && mem <= 3;
  });

  const main = m.main;
  const dateLine = m.date ? formatEventDate(m.date, locale) : "";
  const shortDate = m.date ? formatEventDate(m.date, "en-IN") : "";
  const mainTime = m.time ? (lang === "hi" ? hiTime(m.time) : formatEventTime(m.time, locale)) : "";
  // The RSVP's function chips read in the page's language too (their ids, which the dashboard keys on, stay).
  const rsvpEvents = useMemo(() => (lang === "hi" ? m.events.map((e) => ({ ...e, title: fnTitle(e.title, "hi") })) : m.events), [lang, m.events]);
  const place = [main?.venue, m.city].filter(Boolean).join(" · ");

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

  const onOpened = () => {
    setOpen(true);
    react("opened");
  };
  const replay = () => {
    window.scrollTo({ top: 0, behavior: "auto" });
    setOpen(false);
    setOpenKey((k) => k + 1);
  };

  const hasFamilies = !!(m.brideFam.names || m.groomFam.names || m.brideFam.note || m.groomFam.note || m.blessingsOf);
  const shareText = lang === "hi" ? `✨ ${couple} के शुभ विवाह का निमंत्रण` : `✨ You're invited to the wedding of ${couple}`;
  const card: InviteCardInput = {
    first: m.first,
    second: m.second,
    dateLine: shortDate,
    time: m.time ? formatEventTime(m.time, "en-IN") : "",
    venue: main?.venue ?? "",
    address: main?.address || m.city,
    muhurat: m.muhurat,
    together: T.en.together,
    inviteLine: "request the pleasure of your company",
    guest,
    url: typeof window === "undefined" ? "" : pageUrl(),
  };

  return (
    <WeddingRoot theme={m.theme} className={`wp-root${lang === "hi" ? " is-hi" : ""}${lite ? " is-lite" : ""}`} style={{ minHeight: "100dvh" }}>
      <style>{WP_CSS}</style>
      <div className="wp-backdrop" aria-hidden />
      <Opening key={openKey} first={m.first} second={m.second} dateLine={shortDate} city={m.city} guest={guest} s={s} lang={lang} invocation={m.motif === "ganesha"} onOpened={onOpened} />

      {m.bilingual && (
        <div className={`wp-lang${lang === "hi" ? " is-hi" : ""}`} role="group" aria-label={s.lang}>
          <span className="wp-lang-pill" aria-hidden />
          <button type="button" aria-pressed={lang === "en"} onClick={() => setLang("en")}>
            EN
          </button>
          <button type="button" aria-pressed={lang === "hi"} onClick={() => setLang("hi")} lang="hi">
            हिंदी
          </button>
        </div>
      )}

      <Hero
        open={open}
        lite={lite}
        s={s}
        lang={lang}
        first={m.first}
        second={m.second}
        guest={guest}
        motif={m.motif}
        dateLine={dateLine}
        time={mainTime}
        muhurat={m.muhurat}
        place={place}
        main={main}
        events={m.events}
        couple={couple}
        shareText={shareText}
      />

      {/* ── The invitation ──────────────────────────────────────────────── */}
      <Section id="invitation" ornament={null} width="wide" className="wp-sec wp-sec-invite">
        {/* The section sits on the terrace's watercolour sky; the card is compact and wide (photo beside the words on laptops). */}
        <div className="wp-sec-wash" aria-hidden />
        <Reveal className={`wp-invite${m.cover ? " has-photo" : ""}`}>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...img("blossom", { lazy: true })} className="wp-invite-branch" aria-hidden />
          {m.cover && (
            // The couple's cover photo, in an arched gold frame (beside the words on laptops, above them on phones).
            <figure className="wp-invite-portrait">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.cover.url} alt={couple} loading="lazy" decoding="async" style={photoImgStyle(m.cover)} />
            </figure>
          )}
          <div className="wp-invite-body">
            <MotifMark motif={m.motif} className="wp-invite-motif" />
            <p className="wp-eyebrow" lang={lang}>
              {s.invitation}
            </p>
            {/* The Hindi page reads the Hindi letter alone; the English page keeps both side by side. */}
            <MessageBlock text={lang === "hi" && m.hindiMessage ? m.hindiMessage : m.letter} hindi={lang === "hi" ? undefined : m.hindiMessage || undefined} ornament={null} heading={m.bilingual ? <span lang={lang}>{s.shubh}</span> : undefined} signature={m.endLine ? undefined : couple} />
          </div>
        </Reveal>
      </Section>

      {/* ── Families ────────────────────────────────────────────────────── */}
      {hasFamilies && (
        <Section id="families" ornament={null} width="normal" className="wp-sec">
          <Head eyebrow={s.families} title={couple} lang={lang} />
          <Families bride={m.brideFam} groom={m.groomFam} first={m.familyFirst} blessingsOf={m.blessingsOf} labels={{ blessingsOf: s.blessingsOf, brideSide: s.brideSide, groomSide: s.groomSide }} />
        </Section>
      )}

      {/* ── The date + countdown, under hanging lanterns ────────────────── */}
      {m.date && (
        <Section id="countdown" ornament={null} width="normal" className="wp-sec wp-sec-date">
          <div className="wp-date-lanterns" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img {...img("lanterns", { lazy: true })} className="wp-date-lantern wp-date-lantern-l" />
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img {...img("lanterns", { lazy: true })} className="wp-date-lantern wp-date-lantern-r" />
          </div>
          <Head eyebrow={s.dateEyebrow} title={s.countdown} lang={lang} />
          <Reveal className="wp-date">
            <p className="wp-date-big">{dateLine}</p>
            <Countdown date={m.date} time={m.time || "00:00"} variant="flip" labels={s.units} doneText={s.justMarried} />
            {(mainTime || m.muhurat) && <p className="wp-date-line">{[mainTime, m.muhurat].filter(Boolean).join(" · ")}</p>}
          </Reveal>
        </Section>
      )}

      {/* ── Our story ───────────────────────────────────────────────────── */}
      {m.story.length > 0 && (
        <Section id="story" ornament={null} width="wide" className="wp-sec wp-sec-story">
          <Head eyebrow={s.storyEyebrow} title={s.story} lang={lang} />
          <Story chapters={m.story} />
        </Section>
      )}

      {/* ── Functions ───────────────────────────────────────────────────── */}
      {m.events.length > 0 && (
        <Section id="events" ornament={null} width="wide" className="wp-sec wp-sec-events">
          <Head eyebrow={s.eventsEyebrow} title={s.events} lang={lang} />
          <Events events={m.events} couple={couple} locale={locale} lang={lang} labels={{ directions: s.directions, calendar: s.calendar, calShort: s.calShort, gcal: s.gcal, saveAll: s.saveAll, dress: s.dress, tba: s.tba, whatsapp: s.whatsapp, swipe: s.swipe, saved: s.saved }} />
        </Section>
      )}

      {/* ── The venue ───────────────────────────────────────────────────── */}
      {main?.venue && (
        <Section id="venue" ornament={null} width="wide" className="wp-sec">
          <Head eyebrow={s.venueEyebrow} title={main.venue} lang={lang} />
          <Venue event={main} eyebrow={main.title} directions={s.directions} note={m.gettingThere || undefined} />
        </Section>
      )}

      {/* ── Live stream ─────────────────────────────────────────────────── */}
      {m.liveUrl && (
        <Section id="live" ornament={null} width="narrow" className="wp-sec">
          <Head eyebrow={s.liveEyebrow} title={s.live} lang={lang} />
          <Reveal>
            <LiveStream url={m.liveUrl} main={main} s={s} lang={lang} />
          </Reveal>
        </Section>
      )}

      {/* ── Pre-wedding film ────────────────────────────────────────────── */}
      {m.videoId && (
        <Section id="film" ornament={null} width="normal" className="wp-sec">
          <Head eyebrow={s.film} lang={lang} />
          <Reveal effect="zoom">
            <Film id={m.videoId} label={s.play} />
          </Reveal>
        </Section>
      )}

      {/* ── Gallery ─────────────────────────────────────────────────────── */}
      {m.gallery.length > 0 && (
        <Section id="gallery" ornament={null} width="wide" className="wp-sec wp-sec-gallery">
          <Head eyebrow={s.galleryEyebrow} title={s.gallery} lang={lang} />
          <WeddingMasonry photos={m.gallery} mask="rounded" radius={18} columns={GALLERY_COLUMNS} frame="foil" tileCaptions label={s.gallery} />
        </Section>
      )}

      {/* ── Good to know + contacts ─────────────────────────────────────── */}
      {(m.things.length > 0 || m.contacts.length > 0 || (m.gettingThere && !main?.venue)) && (
        <Section id="good-to-know" ornament={null} width="normal" className="wp-sec">
          <Head eyebrow={s.goodToKnow} lang={lang} />
          {m.things.length > 0 && (
            <ul className="wp-know">
              {m.things.map((t, i) => (
                <Reveal as="li" key={i} className="wp-know-i" delay={(i % 3) * 70}>
                  {t.head && <p className="wp-know-h">{t.head}</p>}
                  {t.text && <p className="wp-know-t">{t.text}</p>}
                </Reveal>
              ))}
            </ul>
          )}
          {m.gettingThere && !main?.venue && (
            <Reveal className="wp-know-i wp-know-travel">
              <p className="wp-know-h">{s.gettingThere}</p>
              <p className="wp-know-t">{m.gettingThere}</p>
            </Reveal>
          )}
          {m.contacts.length > 0 && (
            <div className="wp-contacts-wrap">
              <Reveal as="p" className="wp-eyebrow">
                <span lang={lang}>{s.contactsEyebrow}</span>
              </Reveal>
              <Reveal as="h3" className="wp-h3">
                <span lang={lang}>{s.contacts}</span>
              </Reveal>
              <Contacts list={m.contacts} s={s} couple={couple} />
            </div>
          )}
        </Section>
      )}

      {/* ── RSVP ────────────────────────────────────────────────────────── */}
      <Section id="rsvp" ornament={null} width="wide" className="wp-sec wp-sec-rsvp">
        <Head eyebrow={lang === "hi" ? s.rsvpEyebrow : `RSVP · ${s.rsvpEyebrow}`} title={s.rsvp} lang={lang} />
        {/* Wide screens: the couple on the terrace sofa under the gazebo arch, with blossom lanterns, beside the form; phones: a vignette above it. */}
        <div className="wp-rsvp-wrap">
          <Reveal effect="zoom" className="wp-rsvp-art">
            <span className="wp-rsvp-arch" aria-hidden>
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img {...img("sky", { lazy: true })} className="wp-rsvp-sky" />
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img {...img("lake", { lazy: true })} className="wp-rsvp-lake" />
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img {...img("couple", { lazy: true })} className="wp-rsvp-couple" />
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img {...img("lanterns", { lazy: true })} className="wp-rsvp-lantern" aria-hidden />
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img {...img("anthurium", { lazy: true })} className="wp-rsvp-flora" aria-hidden />
            {m.bilingual && (
              <p className="wp-upasthiti">
                <span lang={lang}>{s.upasthiti}</span>
              </p>
            )}
            <p className="wp-rsvp-couple-names">{couple}</p>
          </Reveal>
          <Reveal className="wp-rsvp-form">
            <div ref={rsvpRef} className="wp-rsvp">
              <RSVPBlock mode={mode} couple={couple} events={rsvpEvents} perEvent meal={m.rsvpMeal} maxGuests={m.maxGuests} deadline={m.rsvpBy || undefined} title="" intro={s.rsvpIntro} locale={locale} text={lang === "hi" ? RSVP_TEXT_HI : undefined} />
            </div>
          </Reveal>
        </div>
      </Section>

      {/* ── Blessings ───────────────────────────────────────────────────── */}
      {m.blessings && (
        <Section id="blessings" ornament={null} width="wide" className="wp-sec wp-sec-bless">
          <Head eyebrow={s.blessingsEyebrow} title={s.blessings} lang={lang} />
          <BlessingsWall mode={mode} title="" intro={s.blessingsIntro} text={lang === "hi" ? BLESSINGS_TEXT_HI : undefined} />
        </Section>
      )}

      {/* ── Shagun ──────────────────────────────────────────────────────── */}
      {m.upiId && (
        <Section id="shagun" ornament={null} width="narrow" className="wp-sec">
          <Head eyebrow={s.shagunEyebrow} title={s.shagun} lang={lang} />
          <Reveal>
            <Shagun upiId={m.upiId} upiName={m.upiName} s={s} />
          </Reveal>
        </Section>
      )}

      {/* ── Share ───────────────────────────────────────────────────────── */}
      <Section id="share" ornament={null} width="normal" className="wp-sec wp-sec-share">
        <Head eyebrow={s.shareEyebrow} title={s.share} lang={lang} />
        <Reveal>
          <ShareBar s={s} shareText={shareText} card={card} />
        </Reveal>
      </Section>

      <div ref={endRef} />
      <Finale
        seal={T.en.shubh}
        sealHi={T.hi.shubh}
        bilingual={m.bilingual}
        closing={s.closing}
        endLine={m.endLine}
        first={m.first}
        second={m.second}
        hashtag={m.hashtag}
        lang={lang}
        whatsapp={s.whatsapp}
        replay={s.replay}
        shareText={shareText}
        onReplay={replay}
      />
    </WeddingRoot>
  );
}
