"use client";
// ─── Wedding Invitation ✦ Premium — the guest page ───────────────────────────
//
// Told as one long, calm scroll, like a wedding film:
//   envelope + foil monogram (tap) → hero (cover photo, parallax, names in foil)
//   → the invitation → save the date (calendar + flip countdown + .ics)
//   → our story (scroll-drawn gold line) → both families → the celebrations
//   (every function: dress code, map, timings) → moments (masonry + lightbox)
//   → good to know → RSVP per function → thank-you with the couple's photo.
// Built on the wedding kit (../../_wedding); every colour is a --wk-* token,
// so the six themes re-dress all of it. Motion is transform/opacity only and
// steps down to fades with prefers-reduced-motion.

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  Countdown,
  Divider,
  EventsTimeline,
  FamiliesBlock,
  MessageBlock,
  Monogram,
  Ornament,
  PetalBurst,
  RSVPBlock,
  Reveal,
  Section,
  WeddingCard,
  WeddingMasonry,
  WeddingRoot,
  downloadWeddingIcs,
  googleCalendarUrl,
  mainEventOf,
  photoImgStyle,
  useWeddingReducedMotion,
  type OrnamentId,
  type WeddingEvent,
} from "../../_wedding";
import { useDayMusic } from "../../_valentine/kit";
import type { ExperienceProps } from "../../_valentine/types";
import Envelope, { ENVELOPE_CSS } from "./Envelope";
import { HI, dotDate, longDate, monthGrid, niceTime, toModel, type WpModel } from "./model";

const noopSub = () => () => {};
const pageUrl = () => window.location.href.split("#")[0];
const MOTIF: Record<string, OrnamentId | null> = { ganesha: "ganesha", lotus: "lotus", rings: "rings", none: null };
const FAQ_ICONS: OrnamentId[] = ["paisley", "diya", "kalash"];

/** A section eyebrow with its small Hindi line. */
function Eyebrow({ en, hi, show }: { en: string; hi: string; show: boolean }) {
  return (
    <>
      {en}
      {show && (
        <span className="wp-hi" lang="hi">
          {hi}
        </span>
      )}
    </>
  );
}

// ── Scroll effects: hero parallax + the story's gold line (one rAF loop) ─────
function useScrollFx(hero: React.RefObject<HTMLElement | null>, story: React.RefObject<HTMLElement | null>, off: boolean) {
  useEffect(() => {
    if (off) return;
    let raf = 0;
    const tick = () => {
      raf = 0;
      const vh = window.innerHeight || 1;
      const h = hero.current;
      if (h) {
        const r = h.getBoundingClientRect();
        if (r.bottom > 0) h.style.setProperty("--p", String(Math.min(1, Math.max(0, -r.top / Math.max(1, r.height)))));
      }
      const s = story.current;
      if (s) {
        const r = s.getBoundingClientRect();
        if (r.top < vh && r.bottom > 0) s.style.setProperty("--sp", String(Math.min(1, Math.max(0, (vh * 0.62 - r.top) / Math.max(1, r.height)))));
      }
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    tick();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [hero, story, off]);
}

/** Calls `cb` once when `ref` first scrolls into view. */
function useOnceInView(ref: React.RefObject<HTMLElement | null>, cb: () => void, threshold = 0.3) {
  const done = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (es) => {
        if (!done.current && es.some((e) => e.isIntersecting)) {
          done.current = true;
          cb();
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, cb, threshold]);
}

// ── Hero ─────────────────────────────────────────────────────────────────────
function Hero({ m, heroRef, live }: { m: WpModel; heroRef: React.RefObject<HTMLElement | null>; live: boolean }) {
  const date = longDate(m.date);
  return (
    <header ref={heroRef} className={`wp-hero${m.cover ? "" : " is-plain"}${live ? " is-live" : ""}`} id="wp-top">
      <div className="wp-hero-media" aria-hidden>
        {m.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="wp-hero-img" src={m.cover.url} alt="" style={photoImgStyle(m.cover)} fetchPriority="high" decoding="async" />
        ) : (
          <Ornament id="mandala-ornate" width={760} className="wp-hero-mandala" shimmer />
        )}
      </div>
      <Corners />
      <div className="wp-hero-copy">
        <div className="wp-hero-mono">
          <Monogram a={m.a} b={m.b} variant="foil" size={104} />
        </div>
        <p className="wk-eyebrow wp-hero-k">Together with their families</p>
        <h1 className="wp-names">
          <span className="wk-script wk-foil-text wk-shimmer">{m.a}</span>
          <span className="wp-amp wk-script wk-foil-text">&amp;</span>
          <span className="wk-script wk-foil-text wk-shimmer">{m.b}</span>
        </h1>
        <p className="wp-hero-sub">are getting married</p>
        <Divider ornament="divider-mandala" width={220} space={6} />
        {date && <p className="wp-hero-date">{date}</p>}
        {(m.city || m.hashtag) && (
          <p className="wp-hero-city">
            {m.city}
            {m.city && m.hashtag && <span aria-hidden> · </span>}
            {m.hashtag && <span className="wp-tag">{m.hashtag}</span>}
          </p>
        )}
        <a className="wp-cue" href="#wp-invite" aria-label="Scroll to the invitation">
          <span />
        </a>
      </div>
    </header>
  );
}

function Corners() {
  return (
    <div className="wp-corners" aria-hidden>
      <Ornament id="corner-filigree" width={92} className="wp-c wp-c-tl" />
      <Ornament id="corner-filigree" width={92} className="wp-c wp-c-tr" flip="x" />
    </div>
  );
}

// ── Save the date: a little calendar page + flip countdown + calendar buttons ─
function SaveTheDate({ m, main, url }: { m: WpModel; main: WeddingEvent | undefined; url: string }) {
  const grid = monthGrid(m.date);
  if (!grid) return null;
  const when = main && main.date === m.date ? main : ({ id: "wedding", title: "Wedding", date: m.date, time: m.time, venue: m.city } as WeddingEvent);
  const ics = { couple: m.couple, url };
  return (
    <Section id="wp-date" eyebrow={<Eyebrow en="Save the date" hi={HI.countdown} show={m.hindi} />} title="Counting down to forever" ornament="divider-dots" width="normal">
      <div className="wp-std">
        <Reveal effect="rise" className="wp-cal-wrap">
          <WeddingCard paper corners="corner-deco" className="wp-cal">
            <p className="wp-cal-m">{grid.title}</p>
            <div className="wp-cal-g" role="grid" aria-label={`${grid.title}, the ${grid.day}th is the wedding`}>
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <span key={`h${i}`} className="wp-cal-h" aria-hidden>
                  {d}
                </span>
              ))}
              {grid.days.map((d, i) => (
                <span key={i} className={`wp-cal-d${d === grid.day ? " is-day" : ""}`} aria-hidden={d !== grid.day}>
                  {d === grid.day ? (
                    <>
                      <svg viewBox="0 0 40 40" className="wp-cal-ring" aria-hidden>
                        <path d="M20 35C9 27 4 21 4 14.5 4 9.5 8 6 12.5 6c3.2 0 5.8 1.8 7.5 4.5C21.7 7.8 24.3 6 27.5 6 32 6 36 9.5 36 14.5 36 21 31 27 20 35Z" pathLength={1} />
                      </svg>
                      <b>{d}</b>
                    </>
                  ) : (
                    d ?? ""
                  )}
                </span>
              ))}
            </div>
            <p className="wp-cal-when">
              {longDate(m.date)}
              {m.time && <> · {niceTime(m.time)}</>}
            </p>
          </WeddingCard>
        </Reveal>
        <Reveal effect="rise" delay={120} className="wp-std-r">
          <p className="wp-std-big wk-foil-text">{dotDate(m.date)}</p>
          <Countdown date={m.date} time={m.time || undefined} variant="flip" doneText="Just married" />
          <div className="wp-std-btns">
            <button type="button" className="wk-btn" onClick={() => downloadWeddingIcs([when], ics, `${m.a}-${m.b}-wedding`.toLowerCase().replace(/[^a-z0-9-]+/g, "-"))}>
              Add to calendar
            </button>
            <a className="wk-btn wk-btn-ghost" href={googleCalendarUrl(when, ics)} target="_blank" rel="noopener noreferrer">
              Google Calendar
            </a>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

// ── Our story ────────────────────────────────────────────────────────────────
function Story({ m, storyRef }: { m: WpModel; storyRef: React.RefObject<HTMLElement | null> }) {
  if (!m.story.length) return null;
  return (
    <Section id="wp-story" eyebrow={<Eyebrow en="Our story" hi={HI.story} show={m.hindi} />} title="How we got here" ornament="divider-paisley" width="normal">
      <ol ref={storyRef as React.RefObject<HTMLOListElement>} className="wp-story">
        <span className="wp-rail" aria-hidden>
          <i />
        </span>
        {m.story.map((s, i) => (
          <li key={i} className={`wp-mo${i % 2 ? " is-r" : ""}${s.photo ? "" : " no-ph"}`}>
            <span className="wp-mo-dot" aria-hidden />
            {s.photo && (
              <Reveal effect="zoom" className="wp-mo-ph">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.photo.url} alt={s.title || "A moment from our story"} loading="lazy" decoding="async" style={photoImgStyle(s.photo)} />
              </Reveal>
            )}
            <Reveal effect="rise" delay={90} className="wp-mo-tx">
              {s.when && <p className="wk-eyebrow wp-mo-when">{s.when}</p>}
              {s.title && <h3 className="wp-mo-t">{s.title}</h3>}
              {s.text && <p className="wp-mo-p">{s.text}</p>}
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}

// ── Good to know ─────────────────────────────────────────────────────────────
function GoodToKnow({ m }: { m: WpModel }) {
  if (!m.faqs.length) return null;
  return (
    <Section id="wp-know" eyebrow={<Eyebrow en="Good to know" hi={HI.goodToKnow} show={m.hindi} />} title="A few details" ornament="divider-scroll" width="normal">
      <ul className={`wp-know n${m.faqs.length}`}>
        {m.faqs.map((f, i) => (
          <Reveal as="li" key={i} delay={i * 90} className="wp-know-i">
            <WeddingCard className="wp-know-c">
              <Ornament id={FAQ_ICONS[i % FAQ_ICONS.length]} width={40} className="wp-know-o" />
              {f.title && <h3 className="wp-know-t">{f.title}</h3>}
              {f.text && <p className="wp-know-p">{f.text}</p>}
            </WeddingCard>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}

// ── Closing ──────────────────────────────────────────────────────────────────
function Closing({ m, onSeen, url }: { m: WpModel; onSeen: () => void; url: string }) {
  const ref = useRef<HTMLElement>(null);
  const [seen, setSeen] = useState(false);
  const cb = useCallback(() => {
    setSeen(true);
    onSeen();
  }, [onSeen]);
  useOnceInView(ref, cb, 0.35);
  const photo = m.photos.length > 1 ? m.photos[m.photos.length - 1] : m.cover;
  const closingPhoto = m.cover ?? photo;
  const wa = `https://wa.me/?text=${encodeURIComponent(`You're invited to ${m.couple}'s wedding${m.date ? ` on ${longDate(m.date)}` : ""} 💍 ${url}`)}`;
  return (
    <section ref={ref} className="wp-close wk-section" id="wp-close">
      {seen && <PetalBurst kind={["rose-petal-blush", "gold-confetti-round", "gold-sparkle"]} count={20} seed={23} />}
      <Reveal effect="zoom" className="wp-close-arch">
        {closingPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={closingPhoto.url} alt={m.couple} loading="lazy" decoding="async" style={photoImgStyle(closingPhoto)} />
        ) : (
          <Ornament id="rings" width={140} className="wp-close-rings" shimmer />
        )}
      </Reveal>
      <Reveal effect="rise" delay={120} className="wp-close-tx">
        <p className="wk-eyebrow">
          <Eyebrow en="With love" hi={HI.closing} show={m.hindi} />
        </p>
        <p className="wp-close-script wk-script wk-foil-text wk-shimmer">Thank you</p>
        {m.endLine && <p className="wp-close-line">{m.endLine}</p>}
        <Divider ornament="divider-lotus" width={200} space={10} />
        <p className="wp-close-sig">{m.couple}</p>
        {m.hashtag && <p className="wp-tag">{m.hashtag}</p>}
        <div className="wp-close-btns">
          <a className="wk-btn" href={wa} target="_blank" rel="noopener noreferrer">
            Share on WhatsApp
          </a>
          <a className="wk-btn wk-btn-ghost" href="#wp-top">
            Back to the top
          </a>
        </div>
      </Reveal>
    </section>
  );
}

// ── The page ─────────────────────────────────────────────────────────────────
export default function WeddingPremiumExperience({ data, mode, react }: ExperienceProps) {
  const m = useMemo(() => toModel(data), [data]);
  const reduce = useWeddingReducedMotion();
  const music = useDayMusic();
  const [sealed, setSealed] = useState(true);
  const heroRef = useRef<HTMLElement>(null);
  const storyRef = useRef<HTMLElement>(null);
  const rsvpRef = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState(false);
  const url = useSyncExternalStore(noopSub, pageUrl, () => "");

  useScrollFx(heroRef, storyRef, reduce || sealed);

  // The floating RSVP pill: after the hero, until the RSVP is on screen.
  useEffect(() => {
    if (sealed || typeof IntersectionObserver === "undefined") return;
    let pastHero = false;
    let atRsvp = false;
    const io = new IntersectionObserver((es) => {
      for (const e of es) {
        if (e.target === heroRef.current) pastHero = !e.isIntersecting && e.boundingClientRect.top < 0;
        if (e.target === rsvpRef.current) atRsvp = e.isIntersecting;
      }
      setPill(pastHero && !atRsvp);
    });
    if (heroRef.current) io.observe(heroRef.current);
    if (rsvpRef.current) io.observe(rsvpRef.current);
    return () => io.disconnect();
  }, [sealed]);

  const onOpen = useCallback(() => {
    if (data.musicMode !== "off") music?.start();
    react("opened");
  }, [data.musicMode, music, react]);
  const onGone = useCallback(() => setSealed(false), []);
  const onSeenEnd = useCallback(() => react("completed"), [react]);

  const main = mainEventOf(m.events);
  const motif = MOTIF[m.motif] ?? null;
  const live = mode === "live";

  return (
    <WeddingRoot theme={m.theme} className="wp-root">
      <style>{WP_CSS + ENVELOPE_CSS}</style>
      {sealed && <Envelope m={m} onOpen={onOpen} onGone={onGone} />}

      <main className={`wp-page${sealed ? " is-sealed" : " is-open"}`} aria-hidden={sealed || undefined}>
        <Hero m={m} heroRef={heroRef} live={live} />

        <Section id="wp-invite" eyebrow={<Eyebrow en="You're invited" hi={HI.invite} show={m.hindi} />} ornament={null} width="narrow" className="wp-invite">
          <WeddingCard paper corners="corner-mughal" className="wp-invite-card">
            <MessageBlock text={m.letter || `Together with their families, ${m.a} and ${m.b} request the pleasure of your company.`} ornament={motif} heading={motif === "ganesha" ? "Shubh Vivah" : "Save the date"} signature={m.hasFamilies ? <>with the blessings of our families</> : undefined} />
          </WeddingCard>
        </Section>

        <SaveTheDate m={m} main={main} url={url} />

        <Story m={m} storyRef={storyRef} />

        {m.hasFamilies && (
          <Section id="wp-families" eyebrow={<Eyebrow en="Our families" hi={HI.families} show={m.hindi} />} title="With the blessings of" ornament="divider-lotus" width="normal">
            <FamiliesBlock heading="" first={m.first} bride={m.brideFamily} groom={m.groomFamily} />
          </Section>
        )}

        {m.events.length > 0 && (
          <Section id="wp-events" eyebrow={<Eyebrow en="The celebrations" hi={HI.events} show={m.hindi} />} title={m.events.length > 1 ? "Every function" : "The wedding"} ornament="divider-paisley" width="normal">
            <EventsTimeline events={m.events} couple={m.couple} calendar="main" mainEventId={main?.id} url={url} layout="timeline" />
          </Section>
        )}

        {m.photos.length > 0 && (
          <Section id="wp-gallery" eyebrow={<Eyebrow en="Moments" hi={HI.gallery} show={m.hindi} />} title="Our story in pictures" ornament="divider-mandala" width="wide">
            <WeddingMasonry photos={m.photos} mask="soft" frame="foil" tileCaptions label={`Photos of ${m.couple}`} />
          </Section>
        )}

        <GoodToKnow m={m} />

        <div ref={rsvpRef}>
          <Section id="wp-rsvp" eyebrow={<Eyebrow en="RSVP" hi={HI.rsvp} show={m.hindi} />} title="Will you join us?" ornament="divider-lotus" width="narrow">
            <WeddingCard paper corners="corner-floral" className="wp-rsvp-card">
              <RSVPBlock
                mode={live ? "live" : "preview"}
                couple={m.couple}
                events={m.events}
                perEvent={m.events.length > 1}
                meal={m.meal}
                maxGuests={m.maxGuests}
                deadline={m.rsvpBy || undefined}
                title=""
                intro={m.events.length > 1 ? "Tick every function you'll be at, so we can plan for you." : undefined}
              />
            </WeddingCard>
          </Section>
        </div>

        <Closing m={m} onSeen={onSeenEnd} url={url} />
        <footer className="wp-foot">
          <Ornament id="divider-dots" width={120} />
        </footer>
      </main>

      <a className={`wp-pill${pill ? " is-on" : ""}`} href="#wp-rsvp" aria-hidden={!pill} tabIndex={pill ? 0 : -1}>
        RSVP
      </a>
    </WeddingRoot>
  );
}

const WP_CSS = `
.wp-root { min-height: 100dvh; overflow-x: clip; }
.wp-page { transition: opacity .9s; }
.wp-page.is-sealed { opacity: 0; }
.wp-hi { display: block; margin-top: 6px; font-family: var(--wk-font-deva); font-size: 13px; letter-spacing: 0; text-transform: none; color: var(--wk-muted); font-weight: 400; }

/* Hero */
.wp-hero { position: relative; min-height: 100svh; display: grid; align-items: end; justify-items: center; overflow: hidden; isolation: isolate; }
.wp-hero-media { position: absolute; inset: 0 0 auto 0; height: 76svh; z-index: -2; overflow: hidden;
  -webkit-mask-image: linear-gradient(180deg, #000 0%, #000 52%, rgba(0,0,0,.55) 74%, transparent 100%); mask-image: linear-gradient(180deg, #000 0%, #000 52%, rgba(0,0,0,.55) 74%, transparent 100%); }
.wp-hero-img { width: 100%; height: 100%; object-fit: cover; display: block; transform-origin: 50% 40%;
  transform: translate3d(0, calc(var(--p, 0) * 22%), 0) scale(calc(1.1 - var(--p, 0) * .1)); will-change: transform; }
.wp-hero-media::after { content: ""; position: absolute; inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,.22) 0%, transparent 24%, transparent 50%, color-mix(in srgb, var(--wk-bg) 55%, transparent) 80%, var(--wk-bg) 100%); }
.wp-hero.is-plain .wp-hero-media { height: 100%; display: grid; place-items: center; }
.wp-hero.is-plain .wp-hero-media::after { display: none; }
.wp-hero-mandala { opacity: .16; width: min(140vmin, 900px) !important; height: auto; }
.wp-corners .wp-c { position: absolute; top: 14px; z-index: 1; opacity: .9; }
.wp-c-tl { left: 14px; }
.wp-c-tr { right: 14px; display: none; }
.wp-hero-copy { position: relative; width: 100%; max-width: 760px; padding: 0 20px calc(56px + env(safe-area-inset-bottom, 0px)); text-align: center; display: grid; justify-items: center; }
.wp-hero-mono { margin-bottom: 4px; }
.wp-hero-mono .wk-mono-box { background: radial-gradient(circle, var(--wk-surface-solid) 0%, color-mix(in srgb, var(--wk-surface-solid) 70%, transparent) 60%, transparent 72%); border-radius: 50%; }
.wp-hero-k { margin: 6px 0 2px; }
.wp-names { margin: 0; display: flex; flex-wrap: wrap; justify-content: center; align-items: baseline; column-gap: .22em; font-weight: 400; font-size: clamp(52px, 15vw, 112px); line-height: 1.04; }
.wp-names > span { padding: 0 .08em; }
.wp-amp { font-size: .62em; }
.wp-hero-sub { margin: 4px 0 0; font: italic 400 clamp(17px, 4.4vw, 22px)/1.3 var(--wk-font-display); color: var(--wk-muted); }
.wp-hero-date { margin: 2px 0 0; font: 600 clamp(12px, 3.2vw, 14px)/1.4 var(--wk-font-caps); letter-spacing: .24em; text-transform: uppercase; color: var(--wk-ink); }
.wp-hero-city { margin: 8px 0 0; font: 400 16px/1.4 var(--wk-font-display); color: var(--wk-muted); letter-spacing: .04em; }
.wp-tag { font: 600 12px/1.4 var(--wk-font-sans); letter-spacing: .08em; color: var(--wk-gold-ink); }
.wp-cue { margin-top: 22px; width: 44px; height: 44px; display: grid; place-items: center; border-radius: 50%; color: var(--wk-gold-ink); }
.wp-cue span { width: 14px; height: 14px; border-right: 1.5px solid currentColor; border-bottom: 1.5px solid currentColor; transform: rotate(45deg); animation: wp-cue 2.2s ease-in-out infinite; }
@keyframes wp-cue { 50% { transform: translateY(6px) rotate(45deg); opacity: .5; } }
.wp-page.is-open .wp-hero-copy > * { animation: wp-rise 1.1s cubic-bezier(.22,1,.36,1) both; }
.wp-page.is-open .wp-hero-copy > :nth-child(2) { animation-delay: .25s; }
.wp-page.is-open .wp-hero-copy > :nth-child(3) { animation-delay: .4s; }
.wp-page.is-open .wp-hero-copy > :nth-child(n+4) { animation-delay: .6s; }
@keyframes wp-rise { from { opacity: 0; transform: translateY(18px); } }
.wp-hero-copy::before { content: ""; position: absolute; z-index: -1; inset: -60px -20px 0; pointer-events: none;
  background: radial-gradient(70% 62% at 50% 62%, color-mix(in srgb, var(--wk-bg) 82%, transparent) 0%, color-mix(in srgb, var(--wk-bg) 45%, transparent) 55%, transparent 80%); }
@media (max-height: 700px) and (orientation: portrait) { .wp-hero-mono { display: none; } }
/* Wide screens and landscape phones: the photo takes the right half, the names the left. */
@media (min-width: 900px), (max-height: 520px) and (orientation: landscape) {
  .wp-hero { grid-template-columns: 1fr 1fr; align-items: center; justify-items: stretch; }
  .wp-hero-media { inset: 0 0 0 46%; height: 100%;
    -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 26%); mask-image: linear-gradient(90deg, transparent 0%, #000 26%); }
  .wp-hero-media::after { background: linear-gradient(180deg, rgba(0,0,0,.12), transparent 30%); }
  .wp-hero.is-plain .wp-hero-media { inset: 0; -webkit-mask-image: none; mask-image: none; }
  .wp-hero-copy { grid-column: 1; justify-self: center; padding: 72px 32px 40px; }
  .wp-hero-copy::before { display: none; }
  .wp-names { font-size: clamp(56px, 6.4vw, 104px); }
  .wp-c-tr { display: none; }
}
@media (max-height: 520px) and (orientation: landscape) {
  .wp-hero-mono { display: none; }
  .wp-names { font-size: 46px; }
  .wp-hero-copy { padding: 20px 16px; }
  .wp-hero-k { margin-top: 0; }
  .wp-cue { display: none; }
}

/* Invitation */
.wp-invite-card { padding: clamp(36px, 8vw, 64px) clamp(20px, 6vw, 56px); text-align: center; }

/* Save the date */
.wp-std { display: grid; gap: 28px; justify-items: center; }
.wp-cal-wrap { width: min(100%, 360px); }
.wp-cal { padding: 26px 22px 22px; text-align: center; }
.wp-cal-m { margin: 0 0 14px; font: 600 13px/1 var(--wk-font-caps); letter-spacing: .3em; text-transform: uppercase; color: var(--wk-gold-ink); }
.wp-cal-g { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px 2px; }
.wp-cal-h { font: 600 10px/24px var(--wk-font-sans); color: var(--wk-muted); letter-spacing: .1em; }
.wp-cal-d { position: relative; height: 34px; display: grid; place-items: center; font: 400 15px/1 var(--wk-font-display); color: var(--wk-ink); opacity: .78; }
.wp-cal-d.is-day { opacity: 1; }
.wp-cal-d.is-day b { position: relative; z-index: 1; font-weight: 700; color: var(--wk-accent-ink); font-size: 15px; }
.wp-cal-ring { position: absolute; width: 42px; height: 42px; left: 50%; top: 50%; translate: -50% -48%; overflow: visible; }
.wp-cal-ring path { fill: var(--wk-accent); stroke: var(--wk-gold); stroke-width: 1.4; }
.wp-cal-when { margin: 16px 0 0; font: italic 400 16px/1.4 var(--wk-font-display); color: var(--wk-muted); }
.wp-std-r { display: grid; justify-items: center; gap: 18px; text-align: center; }
.wp-std-big { margin: 0; font: 500 clamp(30px, 8vw, 48px)/1 var(--wk-font-display); letter-spacing: .12em; }
.wp-std-btns { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
@media (min-width: 820px) { .wp-std { grid-template-columns: 360px 1fr; align-items: center; gap: 56px; } }

/* Our story */
.wp-story { --sp: 0; position: relative; list-style: none; margin: 0 auto; padding: 8px 0 0; max-width: 900px; display: grid; gap: 44px; }
.wp-rail { position: absolute; left: 15px; top: 0; bottom: 0; width: 2px; background: var(--wk-border); border-radius: 2px; overflow: hidden; }
.wp-rail i { position: absolute; inset: 0; background: var(--wk-foil); transform-origin: 50% 0; transform: scaleY(var(--sp)); }
.wp-mo { position: relative; padding-left: 46px; display: grid; gap: 14px; }
.wp-mo-dot { position: absolute; left: 8px; top: 6px; width: 16px; height: 16px; border-radius: 50%; background: var(--wk-surface-solid); border: 2px solid var(--wk-gold); box-shadow: 0 0 0 4px var(--wk-bg); }
.wp-mo-ph { width: min(100%, 360px); aspect-ratio: 4 / 5; border-radius: 999px 999px 18px 18px; overflow: hidden; box-shadow: var(--wk-shadow); background: var(--wk-placeholder); position: relative; }
.wp-mo-ph::after { content: ""; position: absolute; inset: 0; border-radius: inherit; padding: 1.5px; background: var(--wk-foil); -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none; }
.wp-mo-ph img { width: 100%; height: 100%; object-fit: cover; display: block; }
.wp-mo-when { margin: 0 0 4px; }
.wp-mo-t { margin: 0 0 6px; font: 500 clamp(26px, 6vw, 34px)/1.15 var(--wk-font-display); color: var(--wk-ink); }
.wp-mo-p { margin: 0; font: 400 17px/1.65 var(--wk-font-display); color: var(--wk-muted); }
@media (min-width: 820px) {
  .wp-story { gap: 72px; }
  .wp-rail { left: 50%; translate: -1px 0; }
  .wp-mo { padding: 0; grid-template-columns: 1fr 1fr; gap: 0 96px; align-items: center; }
  .wp-mo-dot { left: 50%; top: 50%; translate: -50% -50%; }
  .wp-mo-ph { justify-self: end; grid-column: 1; grid-row: 1; }
  .wp-mo-tx { grid-column: 2; grid-row: 1; }
  .wp-mo.is-r .wp-mo-ph { grid-column: 2; justify-self: start; }
  .wp-mo.is-r .wp-mo-tx { grid-column: 1; text-align: right; }
  .wp-mo.no-ph .wp-mo-tx { grid-column: 2; }
  .wp-mo.is-r.no-ph .wp-mo-tx { grid-column: 1; }
}

/* Good to know */
.wp-know { list-style: none; margin: 0; padding: 0; display: grid; gap: 16px; }
.wp-know-c { height: 100%; padding: 26px 22px; text-align: center; display: grid; justify-items: center; align-content: start; gap: 8px; }
.wp-know-o { color: var(--wk-gold); }
.wp-know-t { margin: 4px 0 0; font: 600 13px/1.3 var(--wk-font-caps); letter-spacing: .22em; text-transform: uppercase; color: var(--wk-ink); }
.wp-know-p { margin: 0; font: 400 16px/1.6 var(--wk-font-display); color: var(--wk-muted); }
@media (min-width: 760px) { .wp-know.n2 { grid-template-columns: 1fr 1fr; } .wp-know.n3 { grid-template-columns: repeat(3, 1fr); } }

/* RSVP */
.wp-rsvp-card { padding: clamp(22px, 6vw, 40px); }

/* Closing */
.wp-close { position: relative; overflow: hidden; display: grid; justify-items: center; gap: 26px; text-align: center; padding-bottom: 40px; }
.wp-close-arch { width: min(78vw, 340px); aspect-ratio: 3 / 4; border-radius: 999px 999px 22px 22px; overflow: hidden; position: relative; box-shadow: var(--wk-shadow); background: var(--wk-placeholder); display: grid; place-items: center; }
.wp-close-arch::after { content: ""; position: absolute; inset: 0; border-radius: inherit; padding: 2px; background: var(--wk-foil); -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none; }
.wp-close-arch img { width: 100%; height: 100%; object-fit: cover; }
.wp-close-tx { display: grid; justify-items: center; gap: 6px; max-width: 560px; padding: 0 16px; }
.wp-close-script { margin: 0; font-size: clamp(56px, 16vw, 96px); line-height: 1.05; padding: 0 .1em; }
.wp-close-line { margin: 0; font: italic 400 clamp(19px, 5vw, 24px)/1.5 var(--wk-font-display); color: var(--wk-ink); }
.wp-close-sig { margin: 0; font: 600 14px/1.4 var(--wk-font-caps); letter-spacing: .24em; text-transform: uppercase; color: var(--wk-gold-ink); }
.wp-close-btns { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-top: 18px; }
.wp-foot { display: grid; place-items: center; padding: 8px 0 calc(90px + env(safe-area-inset-bottom, 0px)); opacity: .7; }

/* Floating RSVP */
.wp-pill { position: fixed; right: max(16px, env(safe-area-inset-right, 0px)); bottom: max(16px, env(safe-area-inset-bottom, 0px)); z-index: 94; min-width: 92px; height: 46px; padding: 0 22px; border-radius: 99px;
  display: grid; place-items: center; font: 600 13px/1 var(--wk-font-caps); letter-spacing: .24em; color: var(--wk-accent-ink); text-decoration: none;
  background: var(--wk-accent); box-shadow: 0 14px 30px -12px rgba(0,0,0,.45), inset 0 0 0 1px rgba(255,255,255,.18);
  opacity: 0; transform: translateY(16px) scale(.96); pointer-events: none; transition: opacity .4s, transform .5s cubic-bezier(.22,1,.36,1); }
.wp-pill.is-on { opacity: 1; transform: none; pointer-events: auto; }
.wp-pill::before { content: ""; position: absolute; inset: 3px; border-radius: inherit; border: 1px solid color-mix(in srgb, var(--wk-gold) 70%, transparent); }

@media (prefers-reduced-motion: reduce) {
  .wp-hero-img { transform: none !important; }
  .wp-page.is-open .wp-hero-copy > * { animation: none; }
  .wp-cue span { animation: none; }
  .wp-rail i { transform: none; }
}
`;
