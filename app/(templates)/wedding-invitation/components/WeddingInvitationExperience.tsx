"use client";

// ─── Wedding Invitation (Classic) — the guest's page ─────────────────────────
//
// The wax-sealed envelope (./Envelope) → tap → the card rises → the page:
//   hero card (monogram, names in gold script, date, live countdown)
//   → the invitation (letter) → the families ("with the blessings of")
//   → the celebrations (≤ 2 functions, maps, add-to-calendar on the main one)
//   → the venue (tap-to-load map) → moments (masonry, ≤ 6 photos, lightbox)
//   → RSVP (every guest; the owner is emailed) → "With love" + WhatsApp share.
// The whole page wears extras.theme (six kit themes, foil gold).

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  VenueCard,
  WeddingCard,
  WeddingMasonry,
  WeddingRoot,
  WEDDING_THEMES,
  downloadWeddingIcs,
  mapLink,
  useWeddingReducedMotion,
} from "../../_wedding";
import type { ExperienceProps } from "../../_valentine/types";
import Envelope, { ENVELOPE_CSS } from "./Envelope";
import { coupleNames, dotDate, longDate, mainEvent, prettyTime, readWi } from "./model";

export default function WeddingInvitationExperience({ data, mode, react }: ExperienceProps) {
  const reduced = useWeddingReducedMotion();
  const x = useMemo(() => readWi(data.extras), [data.extras]);
  const [a, b] = coupleNames(data.recipientName, data.senderName, x.namesOrder);
  const couple = `${a} & ${b}`;
  const main = mainEvent(x.events);
  const date = x.date || main?.date || "";
  const time = x.time || main?.time || "";
  const photos = useMemo(() => data.photos.filter((p) => p && p.url), [data.photos]);
  const tokens = WEDDING_THEMES[x.theme].tokens;

  const [sealed, setSealed] = useState(true);
  const [burst, setBurst] = useState(0);
  const done = useCallback(() => {
    setSealed(false);
    setBurst((n) => n + 1);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);
  const replay = () => {
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    window.setTimeout(() => setSealed(true), reduced ? 0 : 450);
  };

  // "Seen it all" once the closing comes into view.
  const endRef = useRef<HTMLDivElement>(null);
  const completed = useRef(false);
  useEffect(() => {
    const el = endRef.current;
    if (!el || sealed) return;
    const io = new IntersectionObserver((en) => {
      if (en.some((e) => e.isIntersecting) && !completed.current) {
        completed.current = true;
        react("completed");
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, [sealed, react]);

  const url = typeof window !== "undefined" ? window.location.href.split("#")[0] : "";
  const share = () => {
    const text = `You're invited to the wedding of ${couple} 💌${date ? ` ${longDate(date)}` : ""}. Tap to open the invitation: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };
  const toRsvp = () => document.getElementById("wi-rsvp")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  const addCal = () => {
    if (main) downloadWeddingIcs([main], { couple, url }, `${a}-${b}-wedding`.toLowerCase().replace(/[^a-z0-9-]+/g, "-"));
  };

  const hasFamilies = !!(x.brideFamily || x.groomFamily);
  // "With love" is the script heading above it: don't say it twice.
  const closing = (data.endLine || "").replace(/^\s*[—-]?\s*with (all our |much )?love,?\s*/i, "").trim() || `${a} & ${b}`;
  const brideSide = { title: "The bride's family", names: x.brideFamily ? [x.brideFamily] : [] };
  const groomSide = { title: "The groom's family", names: x.groomFamily ? [x.groomFamily] : [] };

  return (
    <WeddingRoot theme={x.theme} className="wi-root">
      <style>{WI_CSS + ENVELOPE_CSS}</style>
      {/* The engine's music icon sits outside this root: paint it in the theme. */}
      <style>{`body .vm-icon-btn { background: radial-gradient(circle at 50% 38%, ${tokens.accent}, ${tokens.ink} 140%); color: ${tokens.accentInk}; box-shadow: 0 6px 16px -6px rgba(0,0,0,.45), 0 0 0 1px ${tokens.gold}; }`}</style>

      {sealed && (
        <Envelope
          key={burst}
          theme={x.theme}
          names={[a, b]}
          date={dotDate(date)}
          reduced={reduced}
          onDone={done}
        />
      )}

      <main className="wi-page" data-sealed={sealed || undefined} aria-hidden={sealed || undefined}>
        {/* ── Hero card ─────────────────────────────────────────────────── */}
        <section className="wi-hero">
          {!sealed && burst > 0 && <PetalBurst key={burst} kind={x.theme === "blush" ? ["rose-petal-blush", "gold-sparkle"] : ["gold-confetti", "gold-sparkle"]} count={16} mode="fall" seed={burst + 3} />}
          <WeddingCard paper corners="corner-filigree" className="wi-heroCard">
            <div className="wi-heroIn">
              {!sealed && <Monogram a={a} b={b} variant="text" size={118} />}
              <p className="wk-eyebrow wi-heroKicker">{hasFamilies ? "Together with their families" : "Shubh Vivah"}</p>
              <h1 className="wi-names">
                <span className="wk-script wk-foil-text wk-shimmer">{a}</span>
                <span className="wi-amp" aria-hidden>
                  &amp;
                </span>
                <span className="wk-sr"> and </span>
                <span className="wk-script wk-foil-text wk-shimmer">{b}</span>
              </h1>
              <p className="wi-request">request the honour of your presence at their wedding</p>
              <Divider ornament="divider-mandala" space={10} width={220} />
              {date && (
                <p className="wi-when">
                  <span>{longDate(date)}</span>
                  {time && <span className="wi-when-t">{prettyTime(time)}</span>}
                </p>
              )}
              {main?.venue && (
                <p className="wi-where">
                  {main.venue}
                  {main.address ? <span>{main.address.split(",").slice(-2).join(",").trim()}</span> : null}
                </p>
              )}
              {date && (
                <div className="wi-count">
                  <p className="wk-eyebrow">Counting down to forever</p>
                  <Countdown date={date} time={time || undefined} variant="roll" doneText="Just married" />
                </div>
              )}
              <div className="wi-heroActs">
                {x.rsvp && (
                  <button type="button" className="wk-btn" onClick={toRsvp}>
                    RSVP
                  </button>
                )}
                {main && main.date && (
                  <button type="button" className="wk-btn wk-btn-ghost" onClick={addCal}>
                    Add to calendar
                  </button>
                )}
              </div>
            </div>
          </WeddingCard>
          <a className="wi-scrollCue" href="#wi-invite" aria-label="Read the invitation">
            <span aria-hidden />
          </a>
        </section>

        {/* ── The invitation ───────────────────────────────────────────── */}
        {data.letter.trim() && (
          <Section id="wi-invite" eyebrow="The invitation" width="narrow" ornament={null}>
            <MessageBlock text={data.letter} heading="You're invited" ornament="mandala-simple" />
          </Section>
        )}

        {/* ── Families ─────────────────────────────────────────────────── */}
        {hasFamilies && (
          <Section eyebrow="Our families" title="With the blessings of" width="normal" ornament="divider-lotus">
            <FamiliesBlock heading="" bride={brideSide} groom={groomSide} first={x.namesOrder === "groom" ? "groom" : "bride"} />
          </Section>
        )}

        {/* ── Celebrations ─────────────────────────────────────────────── */}
        {x.events.length > 0 && (
          <Section eyebrow="Save the dates" title="The celebrations" width="normal" ornament="divider-paisley">
            <EventsTimeline events={x.events} couple={couple} calendar="main" mainEventId={main?.id} url={url} layout="cards" showSwatch={false} />
          </Section>
        )}

        {/* ── Venue ───────────────────────────────────────────────────── */}
        {main?.venue && (
          <Section eyebrow="Where" title="The venue" width="narrow" ornament={null}>
            <VenueCard name={main.venue} address={main.address} mapUrl={main.mapUrl || mapLink(main)} eyebrow={main.title} note={main.note} embed />
          </Section>
        )}

        {/* ── Moments ─────────────────────────────────────────────────── */}
        {photos.length > 0 && (
          <Section eyebrow="Moments" title="Our story in pictures" width="wide" ornament="divider-dots">
            <WeddingMasonry photos={photos} mask="rounded" frame="foil" tileCaptions label={`Photos of ${couple}`} />
          </Section>
        )}

        {/* ── RSVP ────────────────────────────────────────────────────── */}
        {x.rsvp && (
          <Section id="wi-rsvp" eyebrow="RSVP" width="narrow" ornament={null}>
            <RSVPBlock mode={mode} couple={couple} maxGuests={x.maxGuests} deadline={x.rsvpBy || undefined} title="Will you join us?" />
          </Section>
        )}

        {/* ── Closing ─────────────────────────────────────────────────── */}
        <section className="wi-close" ref={endRef}>
          <Reveal className="wi-closeIn">
            <Ornament id="lotus" width={64} shimmer />
            <p className="wi-withLove wk-script wk-foil-text wk-shimmer">With love</p>
            <p className="wi-closeLine">{closing}</p>
            <div className="wi-heroActs">
              <button type="button" className="wk-btn" onClick={share}>
                Share on WhatsApp
              </button>
              <button type="button" className="wk-btn wk-btn-ghost" onClick={replay}>
                Open the envelope again
              </button>
            </div>
            {main && (
              <a className="wi-dir" href={main.mapUrl || mapLink(main)} target="_blank" rel="noopener noreferrer">
                Get directions to {main.venue || "the venue"}
              </a>
            )}
          </Reveal>
        </section>
      </main>
    </WeddingRoot>
  );
}

const WI_CSS = /* css */ `
.wi-root { min-height: 100dvh; overflow-x: clip; }
.wi-page { transition: opacity .9s var(--wk-ease-soft); padding-bottom: 72px; }
.wi-page[data-sealed] { opacity: 0; }
.wi-hero { position: relative; min-height: 100svh; display: grid; place-items: center; padding: max(76px, calc(env(safe-area-inset-top) + 64px)) 16px 88px; }
.wi-heroCard { position: relative; width: min(100%, 620px); padding: clamp(40px, 8vw, 64px) clamp(18px, 6vw, 56px) clamp(36px, 7vw, 56px); text-align: center; }
.wi-heroIn { display: grid; justify-items: center; gap: 0; }
.wi-page:not([data-sealed]) .wi-heroCard { animation: wi-rise 1.1s var(--wk-ease) both; }
@keyframes wi-rise { from { opacity: 0; transform: translateY(26px) scale(.97); } to { opacity: 1; transform: none; } }
.wi-heroKicker { margin: 18px 0 4px; }
.wi-names { margin: 0; display: grid; justify-items: center; font-weight: 400; line-height: 1.08; }
.wi-names .wk-script { font-size: clamp(52px, 15vw, 96px); padding: 0 .12em; }
.wi-amp { font: italic 500 clamp(26px, 6vw, 38px)/1 var(--wk-font-display); color: var(--wk-gold-ink); margin: -2px 0; }
.wi-request { margin: 12px 0 6px; font: italic 500 clamp(17px, 4.4vw, 21px)/1.45 var(--wk-font-display); color: var(--wk-muted); max-width: 30ch; }
.wi-when { margin: 6px 0 0; display: grid; gap: 4px; font: 600 clamp(13px, 3.4vw, 15px)/1.5 var(--wk-font-caps); letter-spacing: .2em; text-transform: uppercase; color: var(--wk-ink); }
.wi-when-t { color: var(--wk-gold-ink); letter-spacing: .26em; }
.wi-where { margin: 10px 0 0; display: grid; gap: 2px; font: 500 clamp(18px, 4.6vw, 22px)/1.35 var(--wk-font-display); color: var(--wk-ink); }
.wi-where span { font-size: .8em; font-style: italic; color: var(--wk-muted); }
.wi-count { margin-top: 22px; display: grid; justify-items: center; gap: 8px; }
.wi-count .wk-eyebrow { margin: 0; }
.wi-heroActs { margin-top: 24px; display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
.wi-heroActs .wk-btn { min-height: 46px; }
.wi-scrollCue { position: absolute; left: 50%; bottom: 18px; width: 26px; height: 40px; margin-left: -13px; border-radius: 14px; border: 1.5px solid var(--wk-gold); opacity: .7; }
.wi-scrollCue span { position: absolute; left: 50%; top: 8px; width: 4px; height: 8px; margin-left: -2px; border-radius: 2px; background: var(--wk-gold); animation: wi-cue 1.8s ease-in-out infinite; }
@keyframes wi-cue { 0% { transform: translateY(0); opacity: 1; } 70% { transform: translateY(12px); opacity: 0; } 100% { opacity: 0; } }
.wi-hero .wk-burst { position: absolute; inset: 0; pointer-events: none; overflow: hidden; z-index: 2; }
.wi-close { padding: 40px 16px 24px; display: grid; place-items: center; text-align: center; }
.wi-closeIn { display: grid; justify-items: center; gap: 6px; max-width: 560px; }
.wi-withLove { margin: 6px 0 0; font-size: clamp(48px, 13vw, 76px); line-height: 1.15; padding: 0 .12em; }
.wi-closeLine { margin: 0; font: 500 clamp(19px, 5vw, 24px)/1.45 var(--wk-font-display); color: var(--wk-ink); }
.wi-dir { margin-top: 14px; font: 500 14px var(--wk-font-sans); color: var(--wk-gold-ink); text-underline-offset: 3px; min-height: 44px; display: inline-flex; align-items: center; }
@media (min-width: 900px) and (min-height: 700px) { .wi-names { grid-auto-flow: column; align-items: baseline; gap: .3em; } .wi-names .wk-script { font-size: clamp(64px, 6.4vw, 96px); } }
@media (max-height: 480px) and (orientation: landscape) { .wi-hero { min-height: auto; padding-top: 72px; } .wi-names { grid-auto-flow: column; align-items: baseline; gap: .3em; } .wi-names .wk-script { font-size: 52px; } .wi-scrollCue { display: none; } }
@media (prefers-reduced-motion: reduce) { .wi-page, .wi-heroCard { animation: none !important; transition: none !important; } .wi-scrollCue span { animation: none; } }
`;
