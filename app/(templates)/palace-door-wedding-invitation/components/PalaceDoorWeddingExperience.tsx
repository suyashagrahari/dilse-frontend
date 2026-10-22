"use client";

// SCAFFOLD (wedding quartet): this started as a working copy of
// royal-wedding-invitation so the template runs end to end. Rebuild it with
// this template's own art (./assets.ts or ../assets.ts, served from
// public/wedding-v3, never the CDN); light themes only.

// ─── Royal Wedding Invitation 👑 — the guest's experience ────────────────────
//
// palace gates (tap: Ganesha glows in, the carved doors swing out in 3D,
// light + petals, the camera pushes through) → the courtyard (scene, gold
// mandala, lattice jharokha with the names, jhoomars, peacocks, elephants,
// diyas, toran, gold dust) → the invitation in English + Hindi → the families
// inside a Mughal manuscript border → the farmaan scroll with the date and a
// mohar seal → the story → illustrated function panels → the palace venue →
// a countdown in a gold medallion → film → masonry → good to know → RSVP →
// blessings → the gates close on "Shubh Vivah".
//
// One long, calm scroll after one cinematic moment; every motion is
// transform/opacity, gated on visibility, and reduced-motion aware. A
// bilingual toggle (top-left) switches every heading and button to Hindi.

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BlessingsWall,
  Countdown,
  FamiliesBlock,
  MessageBlock,
  RSVPBlock,
  Reveal,
  Section,
  WeddingCard,
  WeddingMasonry,
  WeddingRoot,
  formatEventDate,
  formatEventTime,
} from "../../_wedding";
import type { ExperienceProps } from "../../_valentine/types";
import Gates from "./pd/Gates";
import Story from "./pd/Story";
import Courtyard from "./pd/Courtyard";
import Farmaan from "./pd/Farmaan";
import PalaceDoorEvents from "./pd/PalaceDoorEvents";
import Venue from "./pd/Venue";
import { artImg, palaceDoorArt } from "./pd/art";
import Finale from "./pd/Finale";
import { PD_CSS } from "./pd/css";
import { T, readPalaceDoor, type Lang } from "./pd/model";

function Film({ id, label }: { id: string; label: string }) {
  const [on, setOn] = useState(false);
  return (
    <div className="pd-film wk-foil-border">
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
          <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" decoding="async" />
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

export default function PalaceDoorWeddingExperience({ data, mode, react }: ExperienceProps) {
  const m = useMemo(() => readPalaceDoor(data.extras as Record<string, unknown>, data.photos, data.recipientName, data.senderName), [data.extras, data.photos, data.recipientName, data.senderName]);
  const [lang, setLang] = useState<Lang>(m.lang);
  const s = T[lang];
  const locale = lang === "hi" ? "hi-IN" : "en-IN";
  const couple = `${m.first} & ${m.second}`;
  const [open, setOpen] = useState(false);
  const look = palaceDoorArt(m.theme);
  // Spec 7.1.11: on low-end phones drop the ambient particles and the parallax.
  const [lite] = useState(() => {
    if (typeof navigator === "undefined") return false;
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    return (navigator.hardwareConcurrency || 8) <= 4 && mem !== undefined && mem <= 3;
  });

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
    <WeddingRoot theme={m.theme} className={`pd-root${lang === "hi" ? " is-hi" : ""}${lite ? " is-lite" : ""}`} style={{ minHeight: "100dvh" }}>
      <style>{PD_CSS}</style>
      <div className="pd-backdrop" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...artImg(look.plate, { one: true })} />
      </div>
      <Gates first={m.first} second={m.second} dateLine={shortDate} s={s} lang={lang} invocation={m.invocation} look={look} onOpened={onOpened} />

      <div className="pd-lang" role="group" aria-label="Language">
        <button type="button" aria-pressed={lang === "en"} onClick={() => setLang("en")}>
          EN
        </button>
        <button type="button" aria-pressed={lang === "hi"} onClick={() => setLang("hi")} lang="hi">
          हिं
        </button>
      </div>

      {/* ── The courtyard (hero) ────────────────────────────────────────── */}
      <Courtyard
        open={open}
        look={look}
        s={s}
        lang={lang}
        first={m.first}
        second={m.second}
        photo={m.hero}
        dateLine={dateLine}
        time={mainTime}
        muhurat={m.muhurat}
        venue={[m.main?.venue, m.main?.address?.split(",").pop()?.trim()].filter(Boolean).join(" · ")}
      />

      {/* ── The invitation ──────────────────────────────────────────────── */}
      <Section id="invitation" eyebrow={<span lang={lang}>{s.invitation}</span>} ornament={null} width="normal">
        <WeddingCard paper corners="corner-mughal" className="pd-invite">
          <MessageBlock text={data.letter} hindi={m.hindiMessage} ornament="kalash" heading={<span lang={lang}>{s.shubh}</span>} signature={data.endLine ? undefined : couple} />
        </WeddingCard>
      </Section>

      {/* ── Families, inside a Mughal manuscript border ─────────────────── */}
      {(hasFamilies || m.blessingsOf) && (
        <Section id="families" eyebrow={<span lang={lang}>{s.families}</span>} title={<span lang={lang}>{couple}</span>} ornament="divider-paisley" width="normal">
          <div className="pd-hashiya">
            <span className="pd-band pd-band-top" aria-hidden />
            <div className="pd-hashiya-frame">
              <div className="pd-hashiya-in">
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
            </div>
            <span className="pd-band pd-band-bottom" aria-hidden />
          </div>
        </Section>
      )}

      {/* ── The farmaan: the date ───────────────────────────────────────── */}
      {m.main?.date && (
        <Section id="date" eyebrow={<span lang={lang}>{s.dateEyebrow}</span>} title={<span lang={lang}>{s.shubh}</span>} ornament={null} width="narrow">
          <Farmaan s={s} lang={lang} locale={locale} date={m.main.date} time={mainTime} muhurat={m.muhurat} venue={m.main.venue} first={m.first} second={m.second} />
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
          <PalaceDoorEvents events={m.events} couple={couple} url={url || undefined} locale={locale} labels={{ directions: s.directions, calendar: s.calendar, saveAll: s.saveAll, dress: s.dress, tba: s.tba }} />
        </Section>
      )}

      {/* ── The palace venue ────────────────────────────────────────────── */}
      {m.main?.venue && (
        <Section id="venue" eyebrow={<span lang={lang}>{s.venueEyebrow}</span>} ornament={null} width="normal">
          <Venue event={m.main} look={look} directions={s.directions} />
        </Section>
      )}

      {/* ── Countdown, in a gold medallion ─────────────────────────────── */}
      {m.main?.date && (
        <Section id="countdown" eyebrow={<span lang={lang}>{s.countdown}</span>} ornament={null} width="narrow" className="pd-count">
          <Reveal effect="zoom" className="pd-medallion">
            <span className="pd-medallion-ring" aria-hidden>
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img {...artImg("gold/gold-lotus-ring-frame-01", { lazy: true })} />
            </span>
            <span className="pd-medallion-disc" aria-hidden />
            <div className="pd-medallion-in">
              <Countdown date={m.main.date} time={m.main.time || "00:00"} variant="flip" labels={s.units} doneText={s.done} />
            </div>
          </Reveal>
          {(m.muhurat || dateLine) && (
            <Reveal as="p" className="pd-count-line" delay={120}>
              {m.muhurat || dateLine}
            </Reveal>
          )}
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
          <ul className="pd-know">
            {m.things.map((t, i) => (
              <Reveal as="li" key={i} className="wk-card wk-foil-border pd-know-i" delay={i * 70}>
                {t.head && <p className="pd-know-h">{t.head}</p>}
                <p className="pd-know-t">{t.text}</p>
              </Reveal>
            ))}
            {m.gettingThere && (
              <Reveal as="li" className="wk-card wk-foil-border pd-know-i pd-know-wide" delay={m.things.length * 70}>
                <p className="pd-know-h" lang={lang}>
                  {s.gettingThere}
                </p>
                <p className="pd-know-t">{m.gettingThere}</p>
              </Reveal>
            )}
          </ul>
        </Section>
      )}

      {/* ── RSVP ────────────────────────────────────────────────────────── */}
      <Section id="rsvp" eyebrow={<span lang={lang}>RSVP · {s.rsvpEyebrow}</span>} ornament="divider-dots" width="narrow">
        <Reveal as="p" className="pd-upasthiti">
          <span lang={lang}>{s.upasthiti}</span>
        </Reveal>
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
