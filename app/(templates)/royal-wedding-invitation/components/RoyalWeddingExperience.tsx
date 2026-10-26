"use client";

// ─── Royal Wedding Invitation 👑 — the guest's experience ────────────────────
//
// The ivory sandstone gateway (tap: the brass bell rings, the toran sways, the
// jaali screens slide apart, light spills through, the elephants bow, petals
// fall, the shehnai starts, the camera walks through) → the courtyard (pink
// chhatris, a peacock, gold lanterns, the couple) → the invitation in English
// + Hindi on silk paper → the families in a pietra-dura border → the farmaan
// with the date and the mohar, and the flip countdown → the story → every
// function with its illustrated couple under a brass toran → the palace venue
// → film → gallery → for our guests (good to know, who to call, livestream,
// shagun) → RSVP → blessings → the gateway closes on "Shubh Vivah", the share
// bar (WhatsApp, link, invite card PNG, personal invites).
//
// Light only (the redesign of 2026-10): pages published earlier on a dark
// theme render in sandstone (rw/model.ts). Art: public/wedding-v3 (./assets).
// One long calm scroll after one cinematic moment; every motion is
// transform/opacity, gated on visibility, and reduced-motion aware. A
// bilingual toggle (top-left) switches every heading and button to Hindi.
// ?to=Name greets the guest on the gateway and pre-fills their RSVP.

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { BLESSINGS_TEXT_HI, BlessingsWall, MessageBlock, RSVPBlock, RSVP_TEXT_HI, Reveal, Section, VenueCard, WeddingMasonry, WeddingRoot, fnTitle, formatEventDate, formatEventTime, hiTime } from "../../_wedding";
import type { ExperienceProps } from "../../_valentine/types";
import { useDayMusic } from "../../_valentine/music/context";
import { A, RW_KIT, img } from "./assets";
import Courtyard from "./rw/Courtyard";
import Events from "./rw/Events";
import Farmaan from "./rw/Farmaan";
import Families from "./rw/Families";
import Finale from "./rw/Finale";
import Gateway, { gatewayOpenedBefore } from "./rw/Gateway";
import { Contacts, GoodToKnow, LiveButton, Shagun } from "./rw/GuestInfo";
import ShareBar from "./rw/ShareBar";
import Story from "./rw/Story";
import { RW_CSS } from "./rw/css";
import { T, readRoyal, type Lang } from "./rw/model";
import { prefillRsvpName, useGuestName } from "./rw/share";
import useSectionSnap from "./rw/useSectionSnap";

/** Two across on a phone, three from a tablet up, four on wide desktops. */
const GALLERY_COLUMNS = [
  { min: 0, columns: 2 },
  { min: 600, columns: 3 },
  { min: 1180, columns: 4 },
] as const;

/** Sandstone tokens over the kit's light theme: soft maroon accent, antique gold, the repo's own paper textures. */
const rootStyle = (theme: string): CSSProperties =>
  ({
    minHeight: "100dvh",
    ["--wk-texture" as string]: `url("${RW_KIT.linen}")`,
    ["--wk-paper" as string]: `url("${theme === "blush" ? RW_KIT.linen : RW_KIT.silk}")`,
    ...(theme === "champagne"
      ? {
          ["--wk-bg" as string]: "#FBF4E6",
          ["--wk-bg2" as string]: "#F3E2C3",
          ["--wk-ink" as string]: "#3E1F1A",
          ["--wk-muted" as string]: "#7D5E4E",
          ["--wk-accent" as string]: "#8E2A3C",
          ["--wk-accent-ink" as string]: "#FFF7EA",
          ["--wk-border" as string]: "rgba(142, 42, 60, 0.16)",
        }
      : {}),
  }) as CSSProperties;

function Film({ id, label }: { id: string; label: string }) {
  const [on, setOn] = useState(false);
  return (
    <div className="rw-film">
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
          <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" decoding="async" width={480} height={360} />
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

/** A gold lantern trio hanging still above each top corner of the invitation card. */
function Lanterns() {
  return (
    <>
      {[0, 1].map((i) => (
        <span key={i} className={`rw-hang is-${i ? "r" : "l"}`} aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...img(A.lanterns, { lazy: true })} />
        </span>
      ))}
    </>
  );
}

export default function RoyalWeddingExperience({ data, mode, react }: ExperienceProps) {
  const m = useMemo(() => readRoyal(data.extras as Record<string, unknown>, data.photos, data.recipientName, data.senderName), [data.extras, data.photos, data.recipientName, data.senderName]);
  const [lang, setLang] = useState<Lang>(m.lang);
  const s = T[lang];
  const locale = lang === "hi" ? "hi-IN" : "en-IN";
  const couple = `${m.first} & ${m.second}`;
  // A reload of the live page in the same tab skips straight to the courtyard.
  const [open, setOpen] = useState(() => mode === "live" && typeof window !== "undefined" && gatewayOpenedBefore());
  const [replay, setReplay] = useState(0);
  const [gate, setGate] = useState(!open);
  const music = useDayMusic();
  const guest = useGuestName();
  const rootRef = useRef<HTMLDivElement>(null);
  const rsvpRef = useRef<HTMLDivElement>(null);
  // On low-end phones drop the ambient loops.
  const [lite] = useState(() => {
    if (typeof navigator === "undefined") return false;
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    return (navigator.hardwareConcurrency || 8) <= 4 && mem !== undefined && mem <= 3;
  });

  const dateLine = m.main?.date ? formatEventDate(m.main.date, locale) : "";
  const shortDate = m.main?.date ? formatEventDate(m.main.date, "en-IN").replace(/^[^,]+,\s*/, "") : "";
  const mainTime = m.main?.time ? (lang === "hi" ? hiTime(m.main.time) : formatEventTime(m.main.time, locale)) : "";
  // The RSVP's function chips read in the page's language too (their ids, which the dashboard keys on, stay).
  const rsvpEvents = useMemo(() => (lang === "hi" ? m.events.map((e) => ({ ...e, title: fnTitle(e.title, "hi") })) : m.events), [lang, m.events]);
  const [url] = useState(() => (typeof window === "undefined" ? "" : window.location.href.split("#")[0]));
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

  // Section-by-section scrolling once the gateway has gone (./rw/useSectionSnap).
  useSectionSnap(open, ".rw-root .rw-court, .rw-root .wk-section.rw-sec, .rw-root .rw-finale");

  const onOpened = () => {
    setOpen(true);
    react("opened");
  };
  const replayOpening = () => {
    setOpen(false);
    setGate(true);
    setReplay((r) => r + 1);
  };

  const bride = { ...m.bride_, title: s.brideSide };
  const groom = { ...m.groom_, title: s.groomSide };
  const hasFamilies = bride.names.length > 0 || groom.names.length > 0;
  const shareText = lang === "hi" ? `${couple} के शुभ विवाह का निमंत्रण 👑` : `The palace gateway is open: you're invited to the royal wedding of ${couple} 👑`;
  const hasInfo = m.things.length > 0 || !!m.gettingThere || m.contacts.length > 0 || !!m.upiId || !!m.liveUrl;

  return (
    <WeddingRoot theme={m.theme} className={`rw-root rw-t-${m.theme}${lang === "hi" ? " is-hi" : ""}${lite ? " is-lite" : ""}${open ? " is-open" : ""}`} style={rootStyle(m.theme)}>
      <div ref={rootRef} style={{ display: "contents" }}>
        <style>{RW_CSS}</style>
        {gate && <Gateway first={m.first} second={m.second} dateLine={shortDate} guest={guest} s={s} lang={lang} invocation={m.invocation} replay={replay} onOpened={onOpened} />}

        <div className={`rw-lang${lang === "hi" ? " is-hi" : ""}`} role="group" aria-label={lang === "hi" ? "भाषा" : "Language"}>
          <span className="rw-lang-pill" aria-hidden />
          <button type="button" aria-pressed={lang === "en"} onClick={() => setLang("en")}>
            EN
          </button>
          <button type="button" aria-pressed={lang === "hi"} onClick={() => setLang("hi")} lang="hi">
            हिंदी
          </button>
        </div>

        {open && music?.available && music.blocked && !music.playing && (
          <button type="button" className="rw-hear" onClick={() => music.start()} lang={lang}>
            <span aria-hidden>♪</span> {lang === "hi" ? "संगीत सुनने के लिए छुएँ" : "Tap to hear the music"}
          </button>
        )}

        <Courtyard open={open} s={s} lang={lang} first={m.first} second={m.second} photo={m.hero} dateLine={dateLine} time={mainTime} muhurat={m.muhurat} venue={venueLine} guest={guest} />

        {/* ── The invitation ──────────────────────────────────────────────── */}
        {/* One full screen on the palace sky (clouds over the hedge wall), the card wide and compact, lanterns hanging from the top corners. */}
        <Section id="invitation" eyebrow={<span lang={lang}>{s.invitation}</span>} ornament={null} width="wide" className="rw-sec rw-sec-invite rw-full">
          <div className="rw-scene" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img className="rw-scene-cloud is-a" {...img(A.cloud, { lazy: true })} />
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img className="rw-scene-cloud is-b" {...img(A.cloud2, { lazy: true })} />
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img className="rw-scene-hedge" {...img(A.hedge, { lazy: true })} />
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img className="rw-scene-chhatri is-l" {...img(A.chhatri, { lazy: true })} />
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img className="rw-scene-chhatri is-r" {...img(A.chhatri, { lazy: true })} />
          </div>
          <div className="rw-invite-wrap">
            <Lanterns />
            <Reveal effect="zoom" className="rw-invite">
              {/* The Hindi page reads the Hindi letter alone; the English page keeps both side by side. */}
              <MessageBlock text={lang === "hi" && m.hindiMessage ? m.hindiMessage : data.letter} hindi={lang === "hi" ? undefined : m.hindiMessage} ornament="kalash" heading={<span lang={lang}>{s.shubh}</span>} signature={data.endLine ? undefined : couple} />
            </Reveal>
          </div>
        </Section>

        {/* ── Families, inside a pietra-dura border ───────────────────────── */}
        {(hasFamilies || m.blessingsOf) && (
          <Section id="families" eyebrow={<span lang={lang}>{s.families}</span>} title={<span lang={lang}>{couple}</span>} ornament="divider-paisley" width="wide" className="rw-sec rw-full rw-sec-fam">
            <Families bride={bride} groom={groom} first={m.familyFirst} blessingsOf={m.blessingsOf} blessingsLabel={s.blessingsOf} lang={lang} />
          </Section>
        )}

        {/* ── The farmaan: the date + countdown ───────────────────────────── */}
        {m.main?.date && (
          <Section id="date" eyebrow={<span lang={lang}>{s.dateEyebrow}</span>} title={<span lang={lang}>{s.shubh}</span>} ornament={null} width="normal" className="rw-sec rw-sec-day rw-full">
            <Farmaan s={s} lang={lang} locale={locale} date={m.main.date} rawTime={m.main.time} time={mainTime} muhurat={m.muhurat} venue={venueLine} first={m.first} second={m.second} />
          </Section>
        )}

        {/* ── Our story ───────────────────────────────────────────────────── */}
        {m.story.length > 0 && (
          <Section id="story" eyebrow={<span lang={lang}>{s.storyEyebrow}</span>} title={<span lang={lang}>{s.story}</span>} ornament="divider-mandala" width="normal" className="rw-sec rw-sec-story">
            <Story chapters={m.story} />
          </Section>
        )}

        {/* ── Functions ───────────────────────────────────────────────────── */}
        {m.events.length > 0 && (
          <Section id="events" eyebrow={<span lang={lang}>{s.eventsEyebrow}</span>} title={<span lang={lang}>{s.events}</span>} ornament="divider-lotus" width="wide" className="rw-sec rw-sec-events">
            <Events events={m.events} couple={couple} url={url || undefined} locale={locale} lang={lang} labels={{ directions: s.directions, calendar: s.calendar, saveAll: s.saveAll, dress: s.dress, tba: s.tba, saved: s.saved, swipe: s.swipe }} />
          </Section>
        )}

        {/* ── The palace venue ────────────────────────────────────────────── */}
        {m.main?.venue && (
          <Section id="venue" eyebrow={<span lang={lang}>{s.venueEyebrow}</span>} ornament={null} width="normal" className="rw-sec rw-sec-venue rw-full">
            <div className="rw-venue">
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img className="rw-venue-gazebo" {...img(A.gazeboGarden, { lazy: true })} />
              <Reveal effect="zoom" className="rw-venue-card">
                <VenueCard name={m.main.venue} address={m.main.address} mapUrl={m.main.mapUrl} embed ornament={null} eyebrow={m.main.title || s.venueEyebrow} note={m.main.note || undefined} labels={{ directions: s.getDirections, showMap: s.showMap }} />
              </Reveal>
            </div>
          </Section>
        )}

        {/* ── Pre-wedding film ────────────────────────────────────────────── */}
        {m.videoId && (
          <Section id="film" eyebrow={<span lang={lang}>{s.film}</span>} ornament={null} width="normal" className="rw-sec">
            <Reveal effect="zoom">
              <Film id={m.videoId} label={s.play} />
            </Reveal>
          </Section>
        )}

        {/* ── Gallery ─────────────────────────────────────────────────────── */}
        {m.gallery.length > 0 && (
          <Section id="gallery" eyebrow={<span lang={lang}>{s.galleryEyebrow}</span>} title={<span lang={lang}>{s.gallery}</span>} ornament="divider-scroll" width="wide" className="rw-sec rw-sec-gallery">
            <div className="rw-gallery">
              <WeddingMasonry photos={m.gallery} mask="rounded" radius={16} columns={GALLERY_COLUMNS} frame="foil" tileCaptions label={s.gallery} />
            </div>
          </Section>
        )}

        {/* ── For our guests ──────────────────────────────────────────────── */}
        {hasInfo && (
          <Section id="good-to-know" eyebrow={<span lang={lang}>{s.infoEyebrow}</span>} title={<span lang={lang}>{s.info}</span>} ornament={null} width="normal" className="rw-sec rw-sec-info">
            <GoodToKnow things={m.things} gettingThere={m.gettingThere} s={s} lang={lang} />
            {m.contacts.length > 0 && (
              <div className="rw-info-block">
                <Reveal as="p" className="rw-info-h">
                  <span lang={lang}>{s.callUs}</span>
                </Reveal>
                <Contacts contacts={m.contacts} s={s} couple={couple} />
              </div>
            )}
            <LiveButton url={m.liveUrl} main={m.main} s={s} />
            {m.upiId && (
              <div className="rw-info-block">
                <Reveal as="p" className="rw-info-h">
                  <span lang={lang}>{s.shagun}</span>
                </Reveal>
                <Shagun upiId={m.upiId} upiName={m.upiName} couple={couple} s={s} />
              </div>
            )}
          </Section>
        )}

        {/* ── RSVP ────────────────────────────────────────────────────────── */}
        {/* Laptops: the couple under the pink chhatris in a palace arch beside a wider form; phones: the arch above it. */}
        <Section id="rsvp" eyebrow={<span lang={lang}>{lang === "hi" ? s.rsvpEyebrow : `RSVP · ${s.rsvpEyebrow}`}</span>} ornament="divider-dots" width="wide" className="rw-sec rw-sec-rsvp">
          <div className="rw-rsvp">
            <Reveal effect="zoom" className="rw-rsvp-art">
              <span className="rw-rsvp-arch" aria-hidden>
                {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                <img className="rw-rsvp-chhatri is-l" {...img(A.chhatri, { lazy: true })} />
                {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                <img className="rw-rsvp-chhatri is-r" {...img(A.chhatri, { lazy: true })} />
                {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                <img className="rw-rsvp-carpet" {...img(A.carpet, { lazy: true })} />
                {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                <img className="rw-rsvp-pair" {...img(A.coupleWedding, { lazy: true })} />
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img className="rw-rsvp-peacock" {...img(A.peacock, { lazy: true })} aria-hidden />
              <p className="rw-upasthiti">
                <span lang={lang}>{s.upasthiti}</span>
              </p>
              <p className="rw-rsvp-names">{couple}</p>
            </Reveal>
            <div ref={rsvpRef} className="rw-rsvp-form">
              <Reveal>
                <RSVPBlock mode={mode} couple={couple} events={rsvpEvents} perEvent meal={m.rsvpMeal} maxGuests={m.maxGuests} deadline={m.rsvpBy || undefined} title={s.rsvp} intro={s.rsvpIntro} locale={locale} text={lang === "hi" ? RSVP_TEXT_HI : undefined} />
              </Reveal>
            </div>
          </div>
        </Section>

        {/* ── Blessings ───────────────────────────────────────────────────── */}
        {m.blessings && (
          <Section id="blessings" eyebrow={<span lang={lang}>{s.blessingsEyebrow}</span>} ornament="divider-paisley" width="wide" className="rw-sec rw-sec-bless">
            <BlessingsWall mode={mode} title={s.blessings} intro={s.blessingsIntro} text={lang === "hi" ? BLESSINGS_TEXT_HI : undefined} />
          </Section>
        )}

        <div ref={endRef} />
        <Finale seal={T.en.shubh} sealHi={T.hi.shubh} closing={s.closing} endLine={data.endLine} first={m.first} second={m.second} hashtag={m.hashtag} lang={lang} replayLabel={s.replay} onReplay={replayOpening}>
          <ShareBar
            s={s}
            lang={lang}
            shareText={shareText}
            personal={mode === "live"}
            fontRoot={() => rootRef.current?.closest<HTMLElement>(".rw-root") ?? null}
            card={{
              first: m.first,
              second: m.second,
              together: T.en.together,
              getting: T.en.getting,
              dateLine: m.main?.date ? formatEventDate(m.main.date, "en-IN") : "",
              time: m.main?.time ? formatEventTime(m.main.time, "en-IN") : "",
              venue: venueLine,
              functions: m.events.map((e) => ({ title: e.title, when: e.date ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${e.date}T00:00:00Z`)) : "" })),
              guest,
              dear: T.en.dear,
            }}
          />
        </Finale>
      </div>
    </WeddingRoot>
  );
}
