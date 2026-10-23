"use client";

// ─── Palace Door Wedding Invitation 🚪 — the guest's experience ──────────────
//
// The carved haveli door (tap: it knocks, the leaves swing inward in 3D, light
// floods through, jhumkas sway, petals fall, the music starts, the camera
// steps through) → the ivory courtyard (floral arch, lanterns, the couple in
// the gold frame, balustrade) → the invitation in English + Hindi → the
// families → the auspicious day on an unrolling scroll with the havan kund and
// a flip countdown → the story along a mauli thread → every function with its
// own illustrated couple → the venue → film → gallery → for our guests (good
// to know, who to call, livestream, shagun) → RSVP → blessings → the door
// closes on "Shubh Vivah", the share bar, the hands tied with the mauli.
//
// Art: public/wedding-v3 (./assets.ts), served from the repo, never the CDN.
// One long calm scroll after one cinematic moment; every motion is
// transform/opacity, gated on visibility, and reduced-motion aware. A
// bilingual toggle (top-left) switches every heading and button to Hindi.
// ?to=Name greets the guest on the door and pre-fills their RSVP.

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { BlessingsWall, FamiliesBlock, MessageBlock, RSVPBlock, Reveal, Section, VenueCard, WeddingMasonry, WeddingRoot, formatEventDate, formatEventTime } from "../../_wedding";
import type { ExperienceProps } from "../../_valentine/types";
import { useDayMusic } from "../../_valentine/music/context";
import { A, PD_KIT, img } from "./assets";
import Courtyard from "./pd/Courtyard";
import DateScroll from "./pd/DateScroll";
import Doors from "./pd/Doors";
import Events from "./pd/Events";
import Finale from "./pd/Finale";
import { Contacts, GoodToKnow, LiveButton, Shagun } from "./pd/GuestInfo";
import ShareBar from "./pd/ShareBar";
import Story from "./pd/Story";
import { PD_CSS } from "./pd/css";
import { T, readPalaceDoor, type Lang } from "./pd/model";
import { prefillRsvpName, useGuestName } from "./pd/share";

/** The kit's paper textures from this repo (public/wedding-v3/palace-door/kit); the kit's defaults point at the CDN. */
const rootStyle = (theme: string): CSSProperties =>
  ({
    minHeight: "100dvh",
    ["--wk-texture" as string]: `url("${PD_KIT.linen}")`,
    ["--wk-paper" as string]: `url("${theme === "champagne" ? PD_KIT.silk : PD_KIT.linen}")`,
  }) as CSSProperties;

function Film({ id, label }: { id: string; label: string }) {
  const [on, setOn] = useState(false);
  return (
    <div className="pd-film">
      {on ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
          title={label}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          loading="lazy"
        />
      ) : (
        <button type="button" className="pd-film-poster" onClick={() => setOn(true)} aria-label={label}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" decoding="async" width={480} height={360} />
          <span className="pd-film-play" aria-hidden>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5.5v13l11-6.5z" />
            </svg>
          </span>
          <span className="pd-film-label">{label}</span>
        </button>
      )}
    </div>
  );
}

/** Hanging jhumkas on a section's top corners (they sway while on screen). */
function Jhumkas({ lazy = true }: { lazy?: boolean }) {
  return (
    <>
      {[0, 1].map((i) => (
        <span key={i} className={`pd-hang is-${i ? "r" : "l"}`} aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...img(A.jhumka, { lazy })} />
        </span>
      ))}
    </>
  );
}

export default function PalaceDoorWeddingExperience({ data, mode, react }: ExperienceProps) {
  const m = useMemo(() => readPalaceDoor(data.extras as Record<string, unknown>, data.photos, data.recipientName, data.senderName), [data.extras, data.photos, data.recipientName, data.senderName]);
  const [lang, setLang] = useState<Lang>(m.lang);
  const s = T[lang];
  const locale = lang === "hi" ? "hi-IN" : "en-IN";
  const couple = `${m.first} & ${m.second}`;
  const [open, setOpen] = useState(false);
  const music = useDayMusic();
  const guest = useGuestName();
  const rootRef = useRef<HTMLDivElement>(null);
  const rsvpRef = useRef<HTMLDivElement>(null);
  // On low-end phones drop the ambient particles and the parallax.
  const [lite] = useState(() => {
    if (typeof navigator === "undefined") return false;
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    return (navigator.hardwareConcurrency || 8) <= 4 && mem !== undefined && mem <= 3;
  });

  const dateLine = m.main?.date ? formatEventDate(m.main.date, locale) : "";
  const shortDate = m.main?.date ? formatEventDate(m.main.date, "en-IN").replace(/^[^,]+,\s*/, "") : "";
  const mainTime = m.main?.time ? formatEventTime(m.main.time, locale) : "";
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

  const onOpened = () => {
    setOpen(true);
    react("opened");
  };

  const bride = { ...m.bride_, title: s.brideSide };
  const groom = { ...m.groom_, title: s.groomSide };
  const hasFamilies = bride.names.length > 0 || groom.names.length > 0;
  const shareText = lang === "hi" ? `${couple} के शुभ विवाह का निमंत्रण 🚪` : `The palace doors are open: you're invited to the wedding of ${couple} 🚪`;
  const hasInfo = m.things.length > 0 || !!m.gettingThere || m.contacts.length > 0 || !!m.upiId || !!m.liveUrl;

  return (
    <WeddingRoot theme={m.theme} className={`pd-root${lang === "hi" ? " is-hi" : ""}${lite ? " is-lite" : ""}${open ? " is-open" : ""}`} style={rootStyle(m.theme)}>
      <div ref={rootRef} style={{ display: "contents" }}>
        <style>{PD_CSS}</style>
        <Doors first={m.first} second={m.second} dateLine={shortDate} guest={guest} s={s} lang={lang} invocation={m.invocation} onOpened={onOpened} />

        <div className="pd-lang" role="group" aria-label="Language">
          <button type="button" aria-pressed={lang === "en"} onClick={() => setLang("en")}>
            EN
          </button>
          <button type="button" aria-pressed={lang === "hi"} onClick={() => setLang("hi")} lang="hi">
            हिं
          </button>
        </div>

        {open && music?.available && music.blocked && !music.playing && (
          <button type="button" className="pd-hear" onClick={() => music.start()} lang={lang}>
            <span aria-hidden>♪</span> {lang === "hi" ? "संगीत सुनने के लिए छुएँ" : "Tap to hear the music"}
          </button>
        )}

        <Courtyard open={open} s={s} lang={lang} first={m.first} second={m.second} photo={m.hero} dateLine={dateLine} time={mainTime} venue={venueLine} guest={guest} />

        {/* ── The invitation ──────────────────────────────────────────────── */}
        <Section id="invitation" eyebrow={<span lang={lang}>{s.invitation}</span>} ornament={null} width="normal" className="pd-sec pd-sec-invite">
          <div className="pd-invite-wrap">
            <Jhumkas />
            <Reveal effect="zoom" className="pd-invite">
              <MessageBlock text={data.letter} hindi={m.hindiMessage} ornament="kalash" heading={<span lang={lang}>{s.shubh}</span>} signature={data.endLine ? undefined : couple} />
            </Reveal>
            <span className="pd-invite-urn is-l" aria-hidden>
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img {...img(A.urn, { lazy: true })} />
            </span>
            <span className="pd-invite-urn is-r" aria-hidden>
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img {...img(A.urn, { lazy: true })} />
            </span>
          </div>
        </Section>

        {/* ── Families ────────────────────────────────────────────────────── */}
        {(hasFamilies || m.blessingsOf) && (
          <Section id="families" eyebrow={<span lang={lang}>{s.families}</span>} title={<span lang={lang}>{couple}</span>} ornament="divider-paisley" width="normal" className="pd-sec">
            <div className="pd-fam">
              {m.blessingsOf && (
                <Reveal className="pd-blessings-of">
                  <p className="wk-eyebrow" lang={lang}>
                    {s.blessingsOf}
                  </p>
                  <p className="pd-blessings-names">{m.blessingsOf}</p>
                </Reveal>
              )}
              {hasFamilies && <FamiliesBlock bride={bride} groom={groom} first={m.familyFirst} heading="" photos />}
            </div>
          </Section>
        )}

        {/* ── The auspicious day + countdown ──────────────────────────────── */}
        {m.main?.date && (
          <Section id="date" ornament={null} width="wide" className="pd-sec pd-sec-day">
            <DateScroll s={s} lang={lang} date={m.main.date} rawTime={m.main.time} dateLine={dateLine} time={mainTime} muhurat={m.muhurat} venue={venueLine} />
          </Section>
        )}

        {/* ── Our story ───────────────────────────────────────────────────── */}
        {m.story.length > 0 && (
          <Section id="story" eyebrow={<span lang={lang}>{s.storyEyebrow}</span>} title={<span lang={lang}>{s.story}</span>} ornament="divider-mandala" width="normal" className="pd-sec pd-sec-story">
            <Story chapters={m.story} />
          </Section>
        )}

        {/* ── Functions ───────────────────────────────────────────────────── */}
        {m.events.length > 0 && (
          <Section id="events" eyebrow={<span lang={lang}>{s.eventsEyebrow}</span>} title={<span lang={lang}>{s.events}</span>} ornament="divider-lotus" width="wide" className="pd-sec pd-sec-events">
            <Events events={m.events} couple={couple} url={url || undefined} locale={locale} labels={{ directions: s.directions, calendar: s.calendar, saveAll: s.saveAll, dress: s.dress, tba: s.tba, saved: s.saved }} />
          </Section>
        )}

        {/* ── The venue ───────────────────────────────────────────────────── */}
        {m.main?.venue && (
          <Section id="venue" eyebrow={<span lang={lang}>{s.venueEyebrow}</span>} ornament={null} width="normal" className="pd-sec pd-sec-venue">
            <div className="pd-venue">
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img className="pd-venue-pillar is-l" {...img(A.pillar, { lazy: true })} aria-hidden />
              <Reveal effect="zoom" className="pd-venue-card">
                <VenueCard name={m.main.venue} address={m.main.address} mapUrl={m.main.mapUrl} embed ornament={null} eyebrow={m.main.title || s.venueEyebrow} note={m.main.note || undefined} labels={{ directions: s.getDirections, showMap: s.showMap }} />
              </Reveal>
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img className="pd-venue-pillar is-r" {...img(A.pillar, { lazy: true })} aria-hidden />
            </div>
          </Section>
        )}

        {/* ── Pre-wedding film ────────────────────────────────────────────── */}
        {m.videoId && (
          <Section id="film" eyebrow={<span lang={lang}>{s.film}</span>} ornament={null} width="normal" className="pd-sec">
            <Reveal effect="zoom">
              <Film id={m.videoId} label={s.play} />
            </Reveal>
          </Section>
        )}

        {/* ── Gallery ─────────────────────────────────────────────────────── */}
        {m.gallery.length > 0 && (
          <Section id="gallery" eyebrow={<span lang={lang}>{s.galleryEyebrow}</span>} title={<span lang={lang}>{s.gallery}</span>} ornament="divider-scroll" width="wide" className="pd-sec pd-sec-gallery">
            <WeddingMasonry photos={m.gallery} mask="rounded" radius={16} frame="foil" tileCaptions label={s.gallery} />
          </Section>
        )}

        {/* ── For our guests ──────────────────────────────────────────────── */}
        {hasInfo && (
          <Section id="good-to-know" eyebrow={<span lang={lang}>{s.infoEyebrow}</span>} title={<span lang={lang}>{s.info}</span>} ornament={null} width="normal" className="pd-sec pd-sec-info">
            <GoodToKnow things={m.things} gettingThere={m.gettingThere} s={s} lang={lang} />
            {m.contacts.length > 0 && (
              <div className="pd-info-block">
                <Reveal as="p" className="pd-info-h">
                  <span lang={lang}>{s.callUs}</span>
                </Reveal>
                <Contacts contacts={m.contacts} s={s} couple={couple} />
              </div>
            )}
            <LiveButton url={m.liveUrl} main={m.main} s={s} />
            {m.upiId && (
              <div className="pd-info-block">
                <Reveal as="p" className="pd-info-h">
                  <span lang={lang}>{s.shagun}</span>
                </Reveal>
                <Shagun upiId={m.upiId} upiName={m.upiName} couple={couple} s={s} />
              </div>
            )}
          </Section>
        )}

        {/* ── RSVP ────────────────────────────────────────────────────────── */}
        {/* The kit's form labels are English only, so its "Kindly reply by <date>" stays English too (no mixed-script line). */}
        <Section id="rsvp" eyebrow={<span lang={lang}>RSVP · {s.rsvpEyebrow}</span>} ornament="divider-dots" width="narrow" className="pd-sec pd-sec-rsvp">
          <Reveal as="p" className="pd-upasthiti">
            <span lang={lang}>{s.upasthiti}</span>
          </Reveal>
          <div ref={rsvpRef}>
            <Reveal>
              <RSVPBlock mode={mode} couple={couple} events={m.events} perEvent meal={m.rsvpMeal} maxGuests={m.maxGuests} deadline={m.rsvpBy || undefined} title={s.rsvp} intro={s.rsvpIntro} locale="en-IN" />
            </Reveal>
          </div>
        </Section>

        {/* ── Blessings ───────────────────────────────────────────────────── */}
        {m.blessings && (
          <Section id="blessings" eyebrow={<span lang={lang}>{s.blessingsEyebrow}</span>} ornament="divider-paisley" width="normal" className="pd-sec">
            <BlessingsWall mode={mode} title={s.blessings} intro={s.blessingsIntro} />
          </Section>
        )}

        <div ref={endRef} />
        <Finale seal={T.en.shubh} sealHi={T.hi.shubh} closing={s.closing} endLine={data.endLine} first={m.first} second={m.second} hashtag={m.hashtag} lang={lang}>
          <ShareBar
            s={s}
            lang={lang}
            shareText={shareText}
            personal={mode === "live"}
            fontRoot={() => rootRef.current?.closest<HTMLElement>(".pd-root") ?? null}
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
