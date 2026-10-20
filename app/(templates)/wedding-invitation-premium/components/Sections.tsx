"use client";
// ─── Scenes C–I: the scroll story after the hero (Premium) ──────────────────
//
//   C  VellumReveal  a frosted vellum sheet printed with the invitation line,
//                    pinned for ~75 svh and slid away by the scroll (CSS
//                    view-timeline; IntersectionObserver → 1.2 s slide when
//                    scroll timelines are missing) to show "Save the date"
//   D  PhotoInvite   the couple's photo in the same gold arch, a floral corner
//                    that blooms on enter, beside the invitation letter
//   E  EventCards    one card per function, staggered in, gold line icons
//                    that stroke-draw
//   F  Venue         a gold pin that drops in + Google Maps
//   G  FadeCountdown digits that cross-fade (opacity only)
//   I  Closing       floral garland + gold laurel crown around the monogram,
//                    a mini wax seal pressing in, the families' sign-off
// Entrances use one shared IntersectionObserver (useIoReveal) that adds
// `.is-in` to every `.wp2-io` once; reduced motion = shown at once.

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Divider,
  Ornament,
  MessageBlock,
  Monogram,
  PetalBurst,
  downloadWeddingIcs,
  eventStart,
  formatEventDate,
  formatEventTime,
  googleCalendarUrl,
  initialOf,
  mapLink,
  photoImgStyle,
  useNowSeconds,
  WeddingCard,
  type DividerId,
  type OrnamentId,
  type WeddingEvent,
} from "../../_wedding";
import { ARCH, ARCH_OPENING, PREMIUM_ART, WREATH, artImg } from "./art";
import { BloomImg } from "./Hero";
import { GoldIcon, iconFor } from "./icons";
import { HI, dotDate, longDate, niceTime, type WpModel } from "./model";

/** Adds `.is-in` to every `.wp2-io` under `root` the first time it scrolls into view. */
export function useIoReveal(root: React.RefObject<HTMLElement | null>, reduce: boolean, deps: unknown) {
  useEffect(() => {
    const r = root.current;
    if (!r) return;
    const els = Array.from(r.querySelectorAll<HTMLElement>(".wp2-io:not(.is-in)"));
    if (reduce || typeof IntersectionObserver === "undefined") {
      els.forEach((e) => e.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.16, rootMargin: "0px 0px -6% 0px" },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [root, reduce, deps]);
}

/** A section head: engraved eyebrow (+ Hindi line), static foil title, ornament. */
export function Head({ en, hi, show, title, orn = "divider-lotus" }: { en: string; hi?: string; show: boolean; title?: string; orn?: DividerId | OrnamentId }) {
  return (
    <div className="wk-section-head wp2-head wp2-io">
      <p className="wk-eyebrow">
        {en}
        {show && hi && (
          <span className="wp-hi" lang="hi">
            {hi}
          </span>
        )}
      </p>
      {title && <h2 className="wk-h2 wk-foil-text">{title}</h2>}
      <Divider ornament={orn} space={14} width={260} shimmer={false} />
    </div>
  );
}

// ── C. Vellum reveal ─────────────────────────────────────────────────────────
export function VellumReveal({ m, main, url, reduce }: { m: WpModel; main: WeddingEvent | undefined; url: string; reduce: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const [inFallback, setIn] = useState(false);
  useEffect(() => {
    const el = ref.current?.querySelector(".wp2-vel-trip");
    if (!el || reduce || (typeof CSS !== "undefined" && CSS.supports?.("animation-timeline: view()")) || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((es) => es.some((e) => e.isIntersecting) && (setIn(true), io.disconnect()), { rootMargin: "0px 0px -55% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);
  if (!m.date) return null;
  const when =
    main && main.date === m.date
      ? main
      : ({
          id: "wedding",
          title: "Wedding",
          date: m.date,
          time: m.time,
          venue: m.city,
        } as WeddingEvent);
  const ics = { couple: m.couple, url };
  const gcal = googleCalendarUrl(when, ics);
  return (
    <section ref={ref} id="wp-date" className={`wp2-vel${reduce ? " is-rm" : ""}${inFallback ? " is-in" : ""}`}>
      <span className="wp2-vel-trip" aria-hidden />
      <div className="wp2-vel-pin">
        <div className="wp2-std">
          <p className="wk-eyebrow">
            Save the date
            {m.hindi && (
              <span className="wp-hi" lang="hi">
                {HI.countdown}
              </span>
            )}
          </p>
          <p className="wp2-std-big wk-foil-text">{dotDate(m.date)}</p>
          <Divider ornament="divider-mandala" space={8} width={220} shimmer={false} />
          <p className="wp2-std-long">
            {longDate(m.date)}
            {m.time && <> · {niceTime(m.time)}</>}
          </p>
          {m.city && <p className="wp2-std-city">{m.city}</p>}
          <div className="wp2-std-btns">
            <button
              type="button"
              className="wk-btn"
              onClick={() => downloadWeddingIcs([when], ics, `${m.a}-${m.b}-wedding`.toLowerCase().replace(/[^a-z0-9-]+/g, "-"))}
            >
              Add to calendar
            </button>
            {gcal && (
              <a className="wk-btn wk-btn-ghost" href={gcal} target="_blank" rel="noopener noreferrer">
                Google Calendar
              </a>
            )}
          </div>
        </div>
        {!reduce && (
          <div className="wp2-vel-sheet" aria-hidden>
            <span className="wp2-vel-grain" />
            <Ornament id="mandala-ornate" width={64} className="wp2-vel-orn" />
            <p className="wk-eyebrow">Together with their families</p>
            <p className="wp2-vel-names wk-script wk-foil-text">
              {m.a}
              <br />
              <span>&amp;</span> {m.b}
            </p>
            <p className="wp2-vel-line">request the honour of your presence as they begin their forever</p>
            {m.hindi && (
              <p className="wp2-vel-hi" lang="hi">
                आपकी उपस्थिति हमारा सौभाग्य होगी
              </p>
            )}
            <span className="wp2-vel-hint">Scroll</span>
          </div>
        )}
      </div>
    </section>
  );
}

// ── D. The photo in the arch + the invitation ────────────────────────────────
const MOTIF: Record<string, OrnamentId | null> = {
  ganesha: "ganesha",
  lotus: "lotus",
  rings: "rings",
  none: null,
};

export function PhotoInvite({ m }: { m: WpModel }) {
  const set = PREMIUM_ART[m.theme];
  const o = ARCH_OPENING;
  const motif = MOTIF[m.motif] ?? null;
  return (
    <section id="wp-invite" className="wk-section wk-w-normal wp2-inv">
      <Head en="You're invited" hi={HI.invite} show={m.hindi} title={motif === "ganesha" ? "Shubh Vivah" : "With joy"} orn="divider-paisley" />
      <div className="wp2-inv-grid">
        <figure className="wp2-ph wp2-io">
          <div className="wp2-ph-box">
            <div
              className="wp2-ph-win"
              style={{
                left: `${o.x}%`,
                top: `${o.y}%`,
                width: `${o.w}%`,
                height: `${o.h}%`,
              }}
            >
              {m.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.cover.url} alt={m.couple} loading="lazy" decoding="async" style={photoImgStyle(m.cover)} />
              ) : (
                <span className="wp2-ph-mono">
                  <Monogram a={m.a} b={m.b} variant="foil" size={120} animate={false} />
                </span>
              )}
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="wp2-ph-arch" alt="" {...artImg(ARCH, "min(78vw, 340px)")} loading="lazy" decoding="async" />
            <div className="wp2-ph-bloom">
              <BloomImg b={set.bloomBR} cssWidth={220} lazy />
            </div>
          </div>
        </figure>
        <WeddingCard paper className="wp2-inv-card wp2-io">
          <MessageBlock
            text={m.letter || `Together with their families, ${m.a} and ${m.b} request the pleasure of your company.`}
            ornament={motif}
            heading={motif === "ganesha" ? "Shubh Vivah" : "Save the date"}
            signature={m.hasFamilies ? <>with the blessings of our families</> : undefined}
          />
        </WeddingCard>
      </div>
    </section>
  );
}

// ── E. Every function ────────────────────────────────────────────────────────
export function EventCards({ m, main, url }: { m: WpModel; main: WeddingEvent | undefined; url: string }) {
  if (!m.events.length) return null;
  const ics = { couple: m.couple, url };
  return (
    <section id="wp-events" className="wk-section wk-w-normal wp2-evs">
      <Head en="The celebrations" hi={HI.events} show={m.hindi} title={m.events.length > 1 ? "Every function" : "The wedding"} orn="divider-paisley" />
      <ol className={`wp2-ev-list n${Math.min(m.events.length, 3)}`}>
        {m.events.map((e, i) => {
          const map = mapLink(e);
          const time = formatEventTime(e.time);
          const end = formatEventTime(e.endTime);
          const gcal = e.id === main?.id ? googleCalendarUrl(e, ics) : "";
          return (
            <li key={e.id} className="wp2-ev wp2-io wp2-draw" style={{ ["--d" as string]: `${(i % 6) * 120}ms` }}>
              <div className="wk-card wk-paper wp2-ev-card">
                <GoldIcon id={iconFor(e.title)} size={56} />
                <h3 className="wp2-ev-t">{e.title}</h3>
                {(e.date || time) && (
                  <p className="wp2-ev-when">
                    {formatEventDate(e.date)}
                    {time && (
                      <span>
                        {time}
                        {end && ` – ${end}`}
                      </span>
                    )}
                  </p>
                )}
                {e.venue && <p className="wp2-ev-venue">{e.venue}</p>}
                {e.address && <p className="wp2-ev-addr">{e.address}</p>}
                {e.dressCode && (
                  <p className="wp2-ev-dress">
                    <b>Dress code</b> {e.dressCode}
                  </p>
                )}
                {e.note && <p className="wp2-ev-note">{e.note}</p>}
                {(map || gcal) && (
                  <div className="wp2-ev-btns">
                    {map && (
                      <a className="wk-btn wk-btn-sm wk-btn-ghost" href={map} target="_blank" rel="noopener noreferrer">
                        Directions
                      </a>
                    )}
                    {gcal && (
                      <a className="wk-btn wk-btn-sm" href={gcal} target="_blank" rel="noopener noreferrer">
                        Add to calendar
                      </a>
                    )}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

// ── F. Venue ─────────────────────────────────────────────────────────────────
export function Venue({ m, main }: { m: WpModel; main: WeddingEvent | undefined }) {
  const v = main?.venue ? main : m.events.find((e) => e.venue);
  if (!v) return null;
  const map = mapLink(v);
  return (
    <section id="wp-venue" className="wk-section wk-w-narrow wp2-venue">
      <div className="wk-card wk-paper wk-foil-border wp2-venue-card wp2-io">
        <span className="wp2-pin">
          <GoldIcon id="pin" size={72} />
        </span>
        <p className="wk-eyebrow">{v.title ? `The ${v.title.toLowerCase()} venue` : "The venue"}</p>
        <h3 className="wp2-venue-n">{v.venue}</h3>
        {v.address && <p className="wp2-venue-a">{v.address}</p>}
        {map && (
          <a className="wk-btn" href={map} target="_blank" rel="noopener noreferrer">
            Open in Google Maps
          </a>
        )}
      </div>
    </section>
  );
}

// ── G. Countdown: fading digits ──────────────────────────────────────────────
const pad = (n: number) => String(n).padStart(2, "0");

export function FadeCountdown({ m }: { m: WpModel }) {
  const now = useNowSeconds();
  const start = eventStart(m.date, m.time || undefined);
  if (!start) return null;
  const left = Math.max(0, Math.floor(start.getTime() / 1000) - now);
  const units: [string, string][] = now
    ? [
        [String(Math.floor(left / 86400)), "Days"],
        [pad(Math.floor((left % 86400) / 3600)), "Hours"],
        [pad(Math.floor((left % 3600) / 60)), "Minutes"],
        [pad(left % 60), "Seconds"],
      ]
    : [
        ["–", "Days"],
        ["–", "Hours"],
        ["–", "Minutes"],
        ["–", "Seconds"],
      ];
  return (
    <section id="wp-countdown" className="wk-section wk-w-narrow wp2-cd-s">
      <Head en="Counting down" hi={HI.countdown} show={m.hindi} title="Until we say I do" orn="divider-dots" />
      {now > 0 && left === 0 ? (
        <p className="wp2-cd-done wk-script wk-foil-text">Just married</p>
      ) : (
        <div className="wp2-cd wp2-io" role="timer" aria-label={`${units[0][0]} days, ${units[1][0]} hours and ${units[2][0]} minutes to go`}>
          {units.map(([v, l]) => (
            <div key={l} className="wp2-cd-u">
              <span className="wp2-cd-v">
                <span key={v} className="wp2-cd-n wk-foil-text">
                  {v}
                </span>
              </span>
              <span className="wp2-cd-l">{l}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ── I. Closing ───────────────────────────────────────────────────────────────
export function Closing({ m, onSeen, url }: { m: WpModel; onSeen: () => void; url: string }) {
  const set = PREMIUM_ART[m.theme];
  const ref = useRef<HTMLElement>(null);
  const [seen, setSeen] = useState(false);
  const fire = useCallback(() => {
    setSeen(true);
    onSeen();
  }, [onSeen]);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((es) => es.some((e) => e.isIntersecting) && (fire(), io.disconnect()), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, [fire]);
  const wa = `https://wa.me/?text=${encodeURIComponent(`You're invited to ${m.couple}'s wedding${m.date ? ` on ${longDate(m.date)}` : ""} 💍 ${url}`)}`;
  return (
    <section ref={ref} className="wp2-close wk-section" id="wp-close">
      {seen && <PetalBurst kind={["rose-petal-blush", "gold-confetti-round", "gold-sparkle"]} count={14} seed={23} />}
      {set.garlandKind === "swag" && (
        <div className="wp2-close-garland wp2-io" aria-hidden>
          <BloomImg b={set.garland} cssWidth={460} lazy />
        </div>
      )}
      <div className="wp2-close-crest wp2-io" aria-hidden>
        {set.garlandKind === "flank" && (
          <>
            <span className="wp2-close-flank is-l">
              <BloomImg b={{ ...set.garland, flip: true }} cssWidth={170} lazy />
            </span>
            <span className="wp2-close-flank is-r">
              <BloomImg b={set.garland} cssWidth={170} lazy />
            </span>
          </>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="wp2-close-wreath" alt="" {...artImg(WREATH, 220)} loading="lazy" decoding="async" />
        <span className="wp2-close-mono wk-foil-text">
          {initialOf(m.a)}
          <i>&amp;</i>
          {initialOf(m.b)}
        </span>
        <span className="wp2-close-sweep">
          <i />
        </span>
        <span className="wp2-close-seal">
          <span className="wp2-seal-face">
            <span className="wp2-seal-ltr">
              {initialOf(m.a)}
              <i>&amp;</i>
              {initialOf(m.b)}
            </span>
          </span>
        </span>
      </div>
      <div className="wp2-close-tx wp2-io">
        <p className="wk-eyebrow">
          With love
          {m.hindi && (
            <span className="wp-hi" lang="hi">
              {HI.closing}
            </span>
          )}
        </p>
        <p className="wp2-close-fam">
          the families of <span className="wk-script wk-foil-text">{m.a}</span> &amp; <span className="wk-script wk-foil-text">{m.b}</span>
        </p>
        {m.endLine && <p className="wp-close-line">{m.endLine}</p>}
        {m.hashtag && <p className="wp-tag">{m.hashtag}</p>}
        <div className="wp-close-btns">
          <a className="wk-btn" href={wa} target="_blank" rel="noopener noreferrer">
            Share on WhatsApp
          </a>
          <a className="wk-btn wk-btn-ghost" href="#wp-top">
            Back to the top
          </a>
        </div>
      </div>
    </section>
  );
}

export const SECTIONS_CSS = `
/* Shared entrance */
.wp2-io { opacity: 0; transform: translateY(24px); transition: opacity .7s cubic-bezier(.22,.61,.36,1) var(--d, 0ms), transform .7s cubic-bezier(.22,.61,.36,1) var(--d, 0ms); }
.wp2-io.is-in { opacity: 1; transform: none; }
.wp2-head { text-align: center; }

/* C. Vellum */
.wp2-vel { position: relative; height: 175svh; view-timeline: --wpvel block; }
.wp2-vel-trip { position: absolute; top: 30svh; left: 0; width: 1px; height: 1px; }
.wp2-vel-pin { position: sticky; top: 0; height: 100svh; overflow: hidden; display: grid; place-items: center; padding: 0 16px; }
.wp2-std { display: grid; justify-items: center; text-align: center; gap: 6px; max-width: 560px; }
.wp2-std .wk-eyebrow { margin: 0; }
.wp2-std-big { margin: 6px 0 0; font: 500 clamp(46px, 14vw, 92px)/1 var(--wk-font-display); letter-spacing: .04em; white-space: nowrap; padding: 0 .06em .06em; }
.wp2-std-long { margin: 0; font: 600 clamp(11px, 3.1vw, 14px)/1.5 var(--wk-font-caps); letter-spacing: .2em; text-transform: uppercase; color: var(--wk-ink); }
.wp2-std-city { margin: 0; font: italic 400 19px/1.4 var(--wk-font-display); color: var(--wk-muted); }
.wp2-std-btns { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-top: 18px; }
.wp2-vel-sheet { position: absolute; left: 50%; top: 50%; width: min(88vw, 520px); height: min(74svh, 640px); margin: calc(min(74svh, 640px) / -2) 0 0 calc(min(88vw, 520px) / -2);
  display: grid; align-content: center; justify-items: center; gap: 10px; padding: 28px 22px; text-align: center; border-radius: 3px; overflow: hidden;
  background: linear-gradient(170deg, rgba(255,255,255,.86), rgba(255,255,255,.74) 55%, rgba(255,255,255,.82)); color: var(--wk-ink);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--wk-gold) 45%, transparent), 0 24px 50px -24px rgba(30,10,10,.45); transform-origin: 50% 100%; }
[data-wk-dark] .wp2-vel-sheet { background: linear-gradient(170deg, color-mix(in srgb, var(--wk-bg) 72%, #f8ecd0), color-mix(in srgb, var(--wk-bg) 78%, #f8ecd0) 55%, color-mix(in srgb, var(--wk-bg) 70%, #f8ecd0)); }
.wp2-vel-sheet::before { content: ""; position: absolute; inset: 10px; border: 1px solid color-mix(in srgb, var(--wk-gold) 60%, transparent); border-radius: 2px; pointer-events: none; }
.wp2-vel-grain { position: absolute; inset: 0; background: var(--wk-texture); background-size: 420px; opacity: .3; pointer-events: none; }
.wp2-vel-sheet .wk-eyebrow { margin: 0; position: relative; }
.wp2-vel-orn { position: relative; opacity: .8; margin-bottom: 4px; }
.wp2-vel-names { position: relative; margin: 6px 0; font-size: clamp(44px, 12vw, 72px); line-height: 1.08; padding: 0 .15em; }
.wp2-vel-names span { font-size: .6em; }
.wp2-vel-line { position: relative; margin: 0; max-width: 26ch; font: italic 400 clamp(18px, 4.8vw, 22px)/1.45 var(--wk-font-display); color: var(--wk-muted); }
.wp2-vel-hi { position: relative; margin: 0; font: 400 15px/1.5 var(--wk-font-deva); color: var(--wk-muted); }
.wp2-vel-hint { position: absolute; bottom: 26px; left: 50%; translate: -50% 0; font: 600 10px/1 var(--wk-font-caps); letter-spacing: .32em; text-transform: uppercase; color: var(--wk-gold-ink); opacity: .8; }
.wp2-vel-hint::after { content: ""; display: block; width: 8px; height: 8px; margin: 8px auto 0; border-left: 1.5px solid currentColor; border-top: 1.5px solid currentColor; transform: rotate(45deg); }
@supports (animation-timeline: view()) {
  .wp2-vel:not(.is-rm) .wp2-vel-sheet { animation: wp2-vel-up linear both; animation-timeline: --wpvel; animation-range: contain 6% contain 72%; }
  .wp2-vel:not(.is-rm) .wp2-std { animation: wp2-std-in linear both; animation-timeline: --wpvel; animation-range: contain 18% contain 80%; }
}
@supports not (animation-timeline: view()) {
  .wp2-vel-sheet { transition: transform 1.2s cubic-bezier(.65,.05,.36,1); }
  .wp2-std { opacity: 0; transform: scale(.96); transition: opacity 1s cubic-bezier(.22,.61,.36,1) .35s, transform 1.2s cubic-bezier(.22,.61,.36,1) .35s; }
  .wp2-vel.is-in .wp2-vel-sheet { transform: translateY(calc(-100% - 20svh)) rotate(-2deg); }
  .wp2-vel.is-in .wp2-std { opacity: 1; transform: none; }
}
@keyframes wp2-vel-up { to { transform: translateY(calc(-100% - 20svh)) rotate(-2deg); } }
@keyframes wp2-std-in { from { opacity: 0; transform: scale(.96); } 60% { opacity: 1; } to { opacity: 1; transform: none; } }
.wp2-vel.is-rm { height: auto; }
.wp2-vel.is-rm .wp2-vel-pin { position: relative; height: auto; padding: 72px 16px; }
.wp2-vel.is-rm .wp2-std { opacity: 1; transform: none; }

/* D. Photo in the arch + invitation */
.wp2-inv-grid { display: grid; gap: 34px; justify-items: center; }
.wp2-ph { margin: 0; width: min(78vw, 340px); }
.wp2-ph-box { position: relative; aspect-ratio: 421 / 639; }
.wp2-ph-win { position: absolute; overflow: hidden; border-radius: 50% 50% 0 0 / 32.6% 32.6% 0 0; background: var(--wk-placeholder); display: grid; place-items: center; }
.wp2-ph-win img { width: 100%; height: 100%; object-fit: cover; display: block; }
.wp2-ph-win { opacity: 0; transform: scale(1.06); transition: opacity 1.4s cubic-bezier(.22,.61,.36,1) .1s, transform 1.4s cubic-bezier(.22,.61,.36,1) .1s; }
.wp2-ph.is-in .wp2-ph-win { opacity: 1; transform: none; }
.wp2-ph-mono { display: grid; place-items: center; }
.wp2-ph-arch { position: absolute; inset: 0; width: 100%; height: 100%; filter: drop-shadow(0 16px 22px rgba(30,10,10,.25)); }
.wp2-ph-bloom { position: absolute; left: -22%; bottom: -4%; width: 76%; opacity: 0; transform: translate(-30px, 30px) scale(.85); transform-origin: 0 100%; transition: opacity 1.4s cubic-bezier(.22,.61,.36,1) .5s, transform 1.6s cubic-bezier(.22,.61,.36,1) .5s; }
.wp2-ph-bloom .wp2-bloom { transform: rotate(12deg) scaleX(-1); filter: drop-shadow(0 10px 14px rgba(30,10,10,.22)); }
.wp2-ph.is-in .wp2-ph-bloom { opacity: 1; transform: none; }
.wp2-inv-card { padding: clamp(32px, 7vw, 56px) clamp(20px, 6vw, 48px); text-align: center; width: 100%; max-width: 560px; }
@media (min-width: 860px) { .wp2-inv-grid { grid-template-columns: 340px 1fr; align-items: center; gap: 64px; } }

/* E. Events */
.wp2-ev-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 18px; }
@media (min-width: 720px) { .wp2-ev-list.n2, .wp2-ev-list.n3 { grid-template-columns: 1fr 1fr; } }
@media (min-width: 1040px) { .wp2-ev-list.n3 { grid-template-columns: repeat(3, 1fr); } }
.wp2-ev-card { height: 100%; padding: 28px 22px 24px; display: grid; justify-items: center; align-content: start; gap: 6px; text-align: center; position: relative; }
.wp2-ev-card::before { content: ""; position: absolute; inset: 8px; border: 1px solid color-mix(in srgb, var(--wk-gold) 45%, transparent); border-radius: calc(var(--wk-radius, 18px) - 6px); pointer-events: none; }
.wp2-ev-t { margin: 6px 0 0; font: 600 15px/1.3 var(--wk-font-caps); letter-spacing: .24em; text-transform: uppercase; color: var(--wk-gold-ink); }
.wp2-ev-when { margin: 0; display: grid; gap: 2px; font: italic 500 18px/1.35 var(--wk-font-display); color: var(--wk-ink); }
.wp2-ev-when span { font-style: normal; font: 600 12px/1.4 var(--wk-font-sans); letter-spacing: .12em; color: var(--wk-muted); }
.wp2-ev-venue { margin: 6px 0 0; font: 500 19px/1.3 var(--wk-font-display); color: var(--wk-ink); }
.wp2-ev-addr, .wp2-ev-note { margin: 0; font: 400 15.5px/1.5 var(--wk-font-display); color: var(--wk-muted); }
.wp2-ev-dress { margin: 4px 0 0; font: 400 15.5px/1.5 var(--wk-font-display); color: var(--wk-ink); }
.wp2-ev-dress b { display: block; font: 600 10px/1.6 var(--wk-font-caps); letter-spacing: .26em; text-transform: uppercase; color: var(--wk-muted); }
.wp2-ev-btns { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-top: 10px; }

/* F. Venue */
.wp2-venue-card { padding: 34px 22px 30px; display: grid; justify-items: center; gap: 8px; text-align: center; }
.wp2-venue-card .wk-eyebrow { margin: 4px 0 0; }
.wp2-pin { display: block; }
.wp2-venue-card .wp2-pin { transform: translateY(-20px); opacity: 0; transition: transform .5s cubic-bezier(.34,1.56,.64,1) .25s, opacity .3s .25s; }
.wp2-venue-card.is-in .wp2-pin { transform: none; opacity: 1; }
.wp2-venue-n { margin: 0; font: 500 clamp(24px, 6.4vw, 32px)/1.2 var(--wk-font-display); color: var(--wk-ink); }
.wp2-venue-a { margin: 0 0 12px; font: 400 16px/1.5 var(--wk-font-display); color: var(--wk-muted); }

/* G. Countdown */
.wp2-cd { display: grid; grid-template-columns: repeat(4, 1fr); gap: clamp(8px, 3vw, 22px); max-width: 520px; margin: 0 auto; }
.wp2-cd-u { display: grid; justify-items: center; gap: 8px; padding: 18px 4px 14px; border-radius: 14px; background: var(--wk-surface); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--wk-gold) 40%, transparent); }
.wp2-cd-v { display: block; height: 1em; font: 500 clamp(34px, 10vw, 54px)/1 var(--wk-font-display); font-variant-numeric: tabular-nums; }
.wp2-cd-n { display: block; animation: wp2-cd-in .5s cubic-bezier(.22,.61,.36,1) both; padding: 0 .04em; }
@keyframes wp2-cd-in { from { opacity: 0; } }
.wp2-cd-l { font: 600 9.5px/1 var(--wk-font-caps); letter-spacing: .22em; text-transform: uppercase; color: var(--wk-muted); }
.wp2-cd-done { margin: 0; text-align: center; font-size: clamp(48px, 13vw, 80px); }

/* I. Closing */
.wp2-close { position: relative; overflow: hidden; display: grid; justify-items: center; gap: 14px; text-align: center; padding-bottom: 40px; }
.wp2-close-garland { width: min(110vw, 620px); margin: 0 -5vw -54px; position: relative; z-index: 1; transform: translateY(30px); }
.wp2-close-garland.is-in { transform: none; transition-duration: 1.2s; }
.wp2-close-crest { position: relative; width: min(60vw, 230px); aspect-ratio: 594 / 640; display: grid; place-items: center; }
.wp2-close-wreath { position: absolute; inset: 0; width: 100%; height: 100%; filter: drop-shadow(0 8px 14px rgba(30,10,10,.25)); }
.wp2-close-mono { position: relative; top: 9%; font: italic 500 clamp(40px, 12vw, 58px)/1 var(--wk-font-display); display: flex; align-items: baseline; gap: .06em; padding: 0 .1em .05em; }
.wp2-close-mono i { font-family: var(--wk-font-script); font-size: .62em; font-style: normal; }
.wp2-close-flank { position: absolute; top: 34%; width: 78%; }
.wp2-close-flank.is-l { right: 70%; } .wp2-close-flank.is-r { left: 70%; }
.wp2-close-flank .wp2-bloom { filter: drop-shadow(0 10px 14px rgba(0,0,0,.35)); }
.wp2-close-sweep { position: absolute; inset: 12% 14% 8%; overflow: hidden; border-radius: 50%; pointer-events: none; }
.wp2-close-sweep i { position: absolute; top: -10%; bottom: -10%; left: 0; width: 30%; opacity: 0; transform: translateX(-120%) skewX(-14deg);
  background: linear-gradient(100deg, transparent, color-mix(in srgb, var(--wk-gold) 25%, rgba(255,255,255,.6)), transparent); }
.wp2-close-crest.is-in .wp2-close-sweep i { animation: wp2-sweep1 1.6s cubic-bezier(.22,.61,.36,1) 1.2s both; }
@keyframes wp2-sweep1 { 0% { opacity: 0; transform: translateX(-120%) skewX(-14deg); } 15% { opacity: 1; } 85% { opacity: 1; } 100% { opacity: 0; transform: translateX(380%) skewX(-14deg); } }
.wp2-close-seal { position: absolute; left: 50%; bottom: -6%; width: 22%; aspect-ratio: 1; margin-left: -11%; opacity: 0; transform: scale(1.5); }
.wp2-close-crest.is-in .wp2-close-seal { opacity: 1; transform: none; transition: transform .45s cubic-bezier(.34,1.56,.64,1) .8s, opacity .2s .8s; }
.wp2-close-seal .wp2-seal-ltr { font-size: clamp(12px, 3.4vw, 17px); }
.wp2-close-tx { display: grid; justify-items: center; gap: 6px; max-width: 560px; padding: 22px 16px 0; }
.wp2-close-tx .wk-eyebrow { margin: 0; }
.wp2-close-fam { margin: 0; font: italic 400 clamp(19px, 5vw, 23px)/1.5 var(--wk-font-display); color: var(--wk-ink); }
.wp2-close-fam .wk-script { font-style: normal; font-size: 1.5em; padding: 0 .1em; }
@media (prefers-reduced-motion: reduce) {
  .wp2-io, .wp2-ph-win, .wp2-ph-bloom, .wp2-close-seal, .wp2-venue-card .wp2-pin { transition: opacity .3s !important; transform: none !important; }
  .wp2-cd-n, .wp2-close-sweep i { animation: none !important; }
}
`;
