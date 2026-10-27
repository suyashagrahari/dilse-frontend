"use client";

// ─── Pampas & Peony Wedding Invitation 🌸 — the guest's experience ──────────
//
// A boho-luxe stationery suite on handmade paper. The guest is greeted by
// name (?to=) on a wax-sealed envelope; one tap (which also starts the music)
// cracks the seal, lifts the flap and unfolds the card → the hero: the couple
// on a swing under a floral drape, pampas grass in the breeze, gold line-art
// drawing itself beside their names → the invitation card (English + Hindi,
// Shri Ganesh, the couple's portrait under a drape) → the families' place
// cards → the save-the-date card and a flip countdown → our story, pressed
// in an album → the functions as illustrated cards → the venue as a garden
// folly → film → the album (masonry) → for our guests (notes, who to call,
// shagun, live stream) → RSVP → blessings → the last page, sealed in wax,
// with share / card download / QR.
//
// Every section is animated on scroll (transform/opacity only); art is
// decoded before the opening plays; reduced motion gets instant states.
// Light themes only (champagne · blush · powder). A bilingual toggle
// (top-left) switches every heading and button to Hindi.

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { BlessingsWall, Countdown, DEFAULT_TZ_OFFSET, RSVPBlock, Reveal, Section, WeddingMasonry, WeddingRoot, downloadWeddingIcs, formatEventTime, photoImgStyle, cdn } from "../../_wedding";
import type { ExperienceProps } from "../../_valentine/types";
import Envelope from "./fw/Envelope";
import Hero from "./fw/Hero";
import Story from "./fw/Story";
import FloralEvents from "./fw/FloralEvents";
import Venue from "./fw/Venue";
import Guests from "./fw/Guests";
import ShareBar from "./fw/ShareBar";
import Finale from "./fw/Finale";
import Wipe from "./fw/Wipe";
import { PAPER_OPACITY, pic } from "./fw/art";
import { FW_CSS } from "./fw/css";
import { shareInvite, shareableUrl, useGuestName } from "./fw/guest";
import { T, readFloral, type Lang } from "./fw/model";

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

/** The album: 2 columns on phones, 3 on tablets, 4 from a laptop up (inside a 1120px frame, so a
 *  "wide" photo is half the wall, never a giant). */
const GALLERY_COLUMNS = [
  { min: 0, columns: 2 },
  { min: 640, columns: 3 },
  { min: 960, columns: 4 },
] as const;

/** "20", "February", "2027", "Saturday" in the page's language. */
function dateParts(date: string, locale: string) {
  const [y, mo, d] = date.split("-").map(Number);
  const dt = new Date(Date.UTC(y, mo - 1, d, 12));
  const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale, { timeZone: "UTC", ...o }).format(dt);
  return { day: f({ day: "numeric" }), month: f({ month: "long" }), year: f({ year: "numeric" }), weekday: f({ weekday: "long" }) };
}

export default function FloralWeddingExperience({ data, mode, react }: ExperienceProps) {
  const m = useMemo(() => readFloral(data.extras as Record<string, unknown>, data.photos, data.recipientName, data.senderName), [data.extras, data.photos, data.recipientName, data.senderName]);
  const [lang, setLang] = useState<Lang>(m.lang);
  const s = T[lang];
  const locale = lang === "hi" ? "hi-IN" : "en-IN";
  const couple = `${m.first} & ${m.second}`;
  const guest = useGuestName();
  const [open, setOpen] = useState(false);
  const [savedMain, setSavedMain] = useState(false);
  // Low-end phones: drop the ambient petals and the parallax.
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
  // Client-only component (ssr: false): the URL is known on the first render.
  const [url] = useState(() => shareableUrl());

  // ?to= → the RSVP's name field (the kit block has no default-name prop yet):
  // set through the native setter so React's onChange sees it; never over a typed value.
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

  // The EN / हिं pill tucks away while the guest scrolls down (it sat over the section
  // headings on phones) and comes back on the way up or near the top.
  const [tucked, setTucked] = useState(false);
  useEffect(() => {
    if (!open) return;
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
  }, [open]);

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

  const shareText = lang === "hi" ? `${couple} के शुभ विवाह का निमंत्रण 🌸` : `You're invited to the wedding of ${couple} 🌸`;
  const share = () => void shareInvite(shareText, url);
  const saveMain = m.main?.date
    ? () => {
        if (downloadWeddingIcs([m.main!], { couple, url, tz: DEFAULT_TZ_OFFSET }, `${m.main!.title || "wedding"}-${couple}`)) {
          setSavedMain(true);
          window.setTimeout(() => setSavedMain(false), 2400);
        }
      }
    : undefined;

  const brideSide = { ...m.bride_, title: s.brideSide, art: "peonyPink" as const, pic: m.bridePic };
  const groomSide = { ...m.groom_, title: s.groomSide, art: "peonyBeige" as const, pic: m.groomPic };
  const sides = m.familyFirst === "bride" ? [brideSide, groomSide] : [groomSide, brideSide];
  const hasFamilies = sides.some((x) => x.names.length > 0);
  const hasGuests = m.things.length > 0 || m.contacts.length > 0 || !!m.upi || !!m.liveUrl;
  // The kit's linen / silk textures live on the CDN: this page wears its own handmade paper
  // (.fw-paper, wedding-v3 art), so both are switched off here.
  const rootStyle = { minHeight: "100dvh", ["--fw-paper-o" as string]: String(PAPER_OPACITY[m.theme] ?? 0.6), ["--wk-texture" as string]: "none", ["--wk-paper" as string]: "none" } as CSSProperties;

  return (
    <WeddingRoot theme={m.theme} className={`fw-root${lang === "hi" ? " is-hi" : ""}${lite ? " is-lite" : ""}${open ? " is-open" : ""}`} style={rootStyle}>
      <style>{FW_CSS}</style>
      <div className="fw-paper" aria-hidden />
      <Envelope first={m.first} second={m.second} dateLine={shortDate} guest={guest} s={s} lang={lang} onOpened={onOpened} />

      <div className={`fw-lang${tucked ? " is-tucked" : ""}`} role="group" aria-label="Language">
        <button type="button" aria-pressed={lang === "en"} onClick={() => setLang("en")}>
          EN
        </button>
        <button type="button" aria-pressed={lang === "hi"} onClick={() => setLang("hi")} lang="hi">
          हिं
        </button>
      </div>

      <Hero open={open} s={s} lang={lang} first={m.first} second={m.second} guest={guest} dateLine={dateLine} time={mainTime} venue={venueLine} onSaveDate={saveMain} onShare={share} saved={savedMain} />

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
              <span className="fw-portrait-drape" aria-hidden>
                {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                <img {...pic("drape", { lazy: true, sizes: "(min-width: 1024px) 420px, 80vw" })} />
              </span>
            </Reveal>
          )}
          <Reveal className="fw-sheet fw-fold">
            <span className="fw-sheet-roses is-tl" aria-hidden>
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img {...pic("roses", { lazy: true })} />
            </span>
            <span className="fw-sheet-roses is-br" aria-hidden>
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img {...pic("roses", { lazy: true })} />
            </span>
            <Wipe role="swirl" className="fw-sheet-swirl" lazy dir="rtl" sizes="300px" />
            {m.invocation && (
              <div className="fw-ganesha">
                {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                <img {...pic("ganesha", { lazy: true })} />
                <p lang="hi">{s.mantra}</p>
              </div>
            )}
            <p className="fw-sheet-k" lang={lang}>
              {s.togetherWith}
            </p>
            <p className="fw-sheet-names">
              {m.first} <span>&amp;</span> {m.second}
            </p>
            <div className={`fw-sheet-text${m.hindiMessage ? " is-two" : ""}`}>
              <div className="fw-sheet-col">
                {data.letter
                  .split(/\n\s*\n/)
                  .map((p: string) => p.trim())
                  .filter(Boolean)
                  .map((p: string, i: number) => (
                    <p key={i}>{p}</p>
                  ))}
              </div>
              {m.hindiMessage && (
                <div className="fw-sheet-col is-deva" lang="hi">
                  {m.hindiMessage
                    .split(/\n\s*\n/)
                    .map((p) => p.trim())
                    .filter(Boolean)
                    .map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                </div>
              )}
            </div>
            <p className="fw-sheet-sign" lang={lang}>
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
              {sides.map((side, i) => (
                <Reveal key={i} className="fw-fam fw-fold" delay={i * 140}>
                  <span className={`fw-fam-flower is-${i ? "r" : "l"}`} aria-hidden>
                    {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                    <img {...pic(side.art, { lazy: true })} />
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
            <p className="fw-datecard-wd">{parts.weekday}</p>
            <div className="fw-datecard-row">
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
          {saveMain && (
            <Reveal className="fw-center" delay={200}>
              <button type="button" className="wk-btn wk-btn-ghost fw-btn" onClick={saveMain} lang={lang}>
                {savedMain ? `${s.saved} ✓` : s.calendar}
              </button>
            </Reveal>
          )}
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
          <FloralEvents events={m.events} couple={couple} url={url || undefined} locale={locale} labels={{ directions: s.directions, calendar: s.calendar, saveAll: s.saveAll, dress: s.dress, tba: s.tba, whatsapp: s.whatsapp, saved: s.saved }} />
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

      {/* ── RSVP ────────────────────────────────────────────────────────── */}
      <Section id="rsvp" eyebrow={<span lang={lang}>RSVP · {s.rsvpEyebrow}</span>} ornament={null} width="narrow" className="fw-sec fw-sec-rsvp">
        <span className="fw-rsvp-peony" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...pic("peonyPink", { lazy: true })} />
        </span>
        <div ref={rsvpRef} className="fw-rsvp">
          {guest && (
            <p className="fw-rsvp-dear" lang={lang}>
              {s.dear} {guest},
            </p>
          )}
          <Reveal className="fw-fold">
            <RSVPBlock mode={mode} couple={couple} events={m.events} perEvent meal={m.rsvpMeal} maxGuests={m.maxGuests} deadline={m.rsvpBy || undefined} title={s.rsvp} intro={s.rsvpIntro} locale={locale} />
          </Reveal>
        </div>
      </Section>

      {/* ── Blessings ───────────────────────────────────────────────────── */}
      {m.blessings && (
        <Section id="blessings" eyebrow={<span lang={lang}>{s.blessingsEyebrow}</span>} ornament={null} width="normal" className="fw-sec fw-sec-bless">
          <BlessingsWall mode={mode} title={s.blessings} intro={s.blessingsIntro} />
        </Section>
      )}

      <div ref={endRef} />
      <Finale
        sealHi={T.hi.shubh}
        seal={T.en.shubh}
        closing={s.closing}
        endLine={data.endLine}
        first={m.first}
        second={m.second}
        hashtag={m.hashtag}
        lang={lang}
        share={
          <ShareBar
            s={s}
            lang={lang}
            shareText={shareText}
            fileName={`${m.first}-${m.second}-invitation`}
            card={{ first: m.first, second: m.second, dateLine, time: mainTime, venue: venueLine, invocation: m.invocation, labels: { together: s.togetherWith, married: s.gettingMarried, scan: s.scan, mantra: s.mantra } }}
          />
        }
      />
    </WeddingRoot>
  );
}
