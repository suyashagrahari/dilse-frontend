"use client";
// ─── Wedding Invitation ✦ Premium — the guest page ───────────────────────────
//
// "A full wedding suite that blooms as you scroll" (spec section 5):
//   A  envelope: guest name, stamp + postmark, sprig under the seal, vellum band
//   B  parallax garden hero: plate → back foliage → gold arch + names → front
//      blooms, a growing stem, petal fall, gold sweep            (./Hero)
//   C  vellum "Save the date" reveal on scroll                    (./Sections)
//   D  the couple's photo in the arch + the invitation
//      our story (scroll-drawn gold line) · both families
//   E  every function, staggered cards with gold line icons
//   F  venue · G countdown (fading digits) · moments (masonry + lightbox)
//      good to know · RSVP per function
//   I  closing garland + gold laurel crown monogram + mini seal
// Built on the wedding kit (../../_wedding); every colour is a --wk-* token,
// per-theme art comes from ./art.ts. Motion is transform/opacity only (the
// kit's background-position shimmer is switched off here) and steps down to
// fades with prefers-reduced-motion.

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  FamiliesBlock,
  Ornament,
  RSVPBlock,
  Reveal,
  Section,
  WeddingCard,
  WeddingMasonry,
  WeddingRoot,
  isWeddingThemeId,
  mainEventOf,
  photoImgStyle,
  useWeddingReducedMotion,
  type OrnamentId,
} from "../../_wedding";
import { useDayMusic } from "../../_valentine/kit";
import type { ExperienceProps } from "../../_valentine/types";
import Envelope, { ENVELOPE_CSS } from "./Envelope";
import Hero, { HERO_CSS } from "./Hero";
import { ICON_CSS } from "./icons";
import { HI, toModel, type WpModel } from "./model";
import { Closing, EventCards, FadeCountdown, PhotoInvite, SECTIONS_CSS, Venue, VellumReveal, useIoReveal } from "./Sections";

const noopSub = () => () => {};
const pageUrl = () => window.location.href.split("#")[0];
const pageQuery = () => window.location.search;
const FAQ_ICONS: OrnamentId[] = ["paisley", "diya", "kalash"];

/** The guest's name for the envelope: `?to=` (or `?guest=`) on the share link. */
function guestFrom(q: URLSearchParams): string {
  const raw = (q.get("to") || q.get("guest") || "").replace(/[\u0000-\u001f<>]/g, "").trim();
  return raw.slice(0, 40) || "You & Family";
}

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

// ── The story's gold line (scroll-drawn, one rAF loop) ───────────────────────
function useStoryLine(story: React.RefObject<HTMLElement | null>, off: boolean) {
  useEffect(() => {
    if (off) return;
    let raf = 0;
    const tick = () => {
      raf = 0;
      const vh = window.innerHeight || 1;
      const s = story.current;
      if (!s) return;
      const r = s.getBoundingClientRect();
      if (r.top < vh && r.bottom > 0) s.style.setProperty("--sp", String(Math.min(1, Math.max(0, (vh * 0.62 - r.top) / Math.max(1, r.height)))));
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
  }, [story, off]);
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
    <Section
      id="wp-know"
      eyebrow={<Eyebrow en="Good to know" hi={HI.goodToKnow} show={m.hindi} />}
      title="A few details"
      ornament="divider-scroll"
      width="normal"
    >
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

// ── The page ─────────────────────────────────────────────────────────────────
export default function WeddingPremiumExperience({ data, mode, react }: ExperienceProps) {
  const query = useSyncExternalStore(noopSub, pageQuery, () => "");
  const q = useMemo(() => new URLSearchParams(query), [query]);
  const base = useMemo(() => toModel(data), [data]);
  // Dev only: ?wptheme=noir previews a theme without the editor.
  const devTheme = process.env.NODE_ENV !== "production" ? q.get("wptheme") : null;
  const m = useMemo<WpModel>(() => (devTheme && isWeddingThemeId(devTheme) ? { ...base, theme: devTheme } : base), [base, devTheme]);
  const guest = guestFrom(q);
  const reduce = useWeddingReducedMotion();
  const music = useDayMusic();
  const [sealed, setSealed] = useState(true);
  const [shown, setShown] = useState(false);
  const [go, setGo] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const storyRef = useRef<HTMLElement>(null);
  const rsvpRef = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState(false);
  const url = useSyncExternalStore(noopSub, pageUrl, () => "");

  useStoryLine(storyRef, reduce || sealed);
  useIoReveal(rootRef, reduce, shown ? m : null);

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
  // The envelope's camera push hands over to the hero: show the page under it,
  // decode the hero's layers (≤ 600 ms), then start Scene B.
  const onLeave = useCallback(() => {
    setShown(true);
    const imgs = Array.from(heroRef.current?.querySelectorAll("img") ?? []);
    const decoded = Promise.all(imgs.map((i) => i.decode().catch(() => undefined)));
    Promise.race([decoded, new Promise((r) => window.setTimeout(r, 600))]).then(() => setGo(true));
  }, []);
  const onGone = useCallback(() => setSealed(false), []);
  const onSeenEnd = useCallback(() => react("completed"), [react]);

  const main = mainEventOf(m.events);
  const live = mode === "live";

  // Everything below the hero, memoised: the opening's state changes (shown,
  // go, sealed) and the RSVP pill must not re-render the whole page mid-scene.
  const rest = useMemo(
    () => (
      <>
        <VellumReveal m={m} main={main} url={url} reduce={reduce} />

        <PhotoInvite m={m} />

        <Story m={m} storyRef={storyRef} />

        {m.hasFamilies && (
          <Section
            id="wp-families"
            eyebrow={<Eyebrow en="Our families" hi={HI.families} show={m.hindi} />}
            title="With the blessings of"
            ornament="divider-lotus"
            width="normal"
          >
            <FamiliesBlock heading="" first={m.first} bride={m.brideFamily} groom={m.groomFamily} />
          </Section>
        )}

        <EventCards m={m} main={main} url={url} />

        <Venue m={m} main={main} />

        <FadeCountdown m={m} />

        {m.photos.length > 0 && (
          <Section
            id="wp-gallery"
            eyebrow={<Eyebrow en="Moments" hi={HI.gallery} show={m.hindi} />}
            title="Our story in pictures"
            ornament="divider-mandala"
            width="wide"
          >
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
      </>
    ),
    [m, main, url, reduce, live, onSeenEnd],
  );

  return (
    <WeddingRoot theme={m.theme} className="wp-root">
      <style>{WP_CSS + ENVELOPE_CSS + HERO_CSS + SECTIONS_CSS + ICON_CSS}</style>
      {sealed && <Envelope m={m} guest={guest} onOpen={onOpen} onLeave={onLeave} onGone={onGone} />}

      <main ref={rootRef} className={`wp-page${shown ? " is-open" : " is-sealed"}`} aria-hidden={sealed || undefined}>
        <Hero m={m} heroRef={heroRef} go={go} reduce={reduce} />

        {rest}
      </main>

      <a className={`wp-pill${pill ? " is-on" : ""}`} href="#wp-rsvp" aria-hidden={!pill} tabIndex={pill ? 0 : -1}>
        RSVP
      </a>
    </WeddingRoot>
  );
}

const WP_CSS = `
.wp-root { min-height: 100dvh; overflow-x: clip; }
/* The kit's shimmer animates background-position (a repaint): off in this tier;
   foil stays as a static gradient, the light sweeps are transform-only. */
.wp-root .wk-shimmer { animation: none !important; }
/* Hidden (not faded) under the envelope: a page-tall opacity layer is costly;
   the envelope's own fade is the crossfade, the hero layers fade themselves. */
.wp-page.is-sealed { visibility: hidden; }
.wp-hi { display: block; margin-top: 6px; font-family: var(--wk-font-deva); font-size: 13px; letter-spacing: 0; text-transform: none; color: var(--wk-muted); font-weight: 400; }
.wp-tag { margin: 0; font: 600 12px/1.4 var(--wk-font-sans); letter-spacing: .08em; color: var(--wk-gold-ink); }

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

/* Closing text (shared with ./Sections) */
.wp-close-line { margin: 0; font: italic 400 clamp(18px, 4.8vw, 22px)/1.5 var(--wk-font-display); color: var(--wk-muted); }
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
  .wp-rail i { transform: none; }
}
`;
