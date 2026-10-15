"use client";

// Rooms 3–5: the portrait gallery (she swipes through the framed photos, each
// with its museum plaque), the audio guide (she taps an exhibit number and the
// guide tells that part of our story) and the restoration studio (she brushes
// the dust off an old painting: where it all began).

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CroppedPhoto, burst, haptic, useReducedMotion } from "../../../_valentine/kit";
import type { LovePhoto } from "../../../_love/types";
import type { HaMilestone } from "../../../_valentine/days/happy-anniversary";
import { FONTS } from "../../../_valentine/theme";
import { HA_CAPS, HA_DISPLAY, HA_HAND } from "./fonts";
import { useHa, useNext } from "./stage";
import { Head } from "./ui";

// ─── 3 · The portrait gallery ───────────────────────────────────────────────

const MEDIUMS = [
  "Oil on happiness",
  "Mixed media: chai & giggles",
  "Digital photograph, 100% candid",
  "Watercolour of a very good day",
  "Acrylic on butterflies",
  "Pencil, heart & a little chaos",
];

/** A pastel painting for the preview when the sender hasn't added photos yet. */
function Painting({ k }: { k: number }) {
  const v = k % 3;
  return (
    <svg viewBox="0 0 80 100" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <rect width="80" height="100" fill="var(--ha-blush)" />
      <circle cx={v === 1 ? 58 : 24} cy="28" r="12" fill="#FFF6D6" />
      <path d="M0 70 Q20 54 40 66 T80 60 V100 H0 Z" fill="color-mix(in srgb, var(--vw-accent) 30%, #FFFFFF)" />
      <path d="M0 82 Q26 70 50 80 T80 76 V100 H0 Z" fill="color-mix(in srgb, var(--vw-accent) 50%, #FFFFFF)" />
      {v === 0 && <path d="M40 58 C32 52 29 47 30 43 C31 39 37 38 40 42 C43 38 49 39 50 43 C51 47 48 52 40 58 Z" fill="var(--vw-accent)" />}
      {v === 1 && (
        <g fill="var(--vw-accent-deep)">
          <circle cx="34" cy="60" r="4" />
          <circle cx="46" cy="60" r="4" />
          <rect x="31" y="63" width="6" height="10" rx="3" />
          <rect x="43" y="63" width="6" height="10" rx="3" />
        </g>
      )}
      {v === 2 && <path d="M18 64 h44 l-4 -12 h-36 z M24 52 q16 -16 32 0" fill="none" stroke="var(--vw-accent-deep)" strokeWidth="2.5" strokeLinecap="round" />}
    </svg>
  );
}

export function Gallery({
  photos,
  placeholders,
  sender,
  recipient,
  startYear,
  sticker,
  onNext,
}: {
  photos: readonly LovePhoto[];
  placeholders: number;
  sender: string;
  recipient: string;
  startYear: number;
  sticker: ReactNode;
  onNext: () => void;
}) {
  const { cue } = useHa();
  const reduced = useReducedMotion();
  const n = photos.length || placeholders;
  const [idx, setIdx] = useState(0);
  const [seen, setSeen] = useState<number[]>([0]);
  const nowYear = new Date().getFullYear();

  const go = useCallback(
    (d: number) => {
      setIdx((i) => {
        const j = Math.max(0, Math.min(n - 1, i + d));
        if (j !== i) {
          haptic(8);
          cue("swoosh-soft", { gain: 0.3 });
          setSeen((s) => (s.includes(j) ? s : [...s, j]));
        }
        return j;
      });
    },
    [n, cue],
  );

  const yearOf = (k: number) => {
    if (n <= 1 || nowYear <= startYear) return Math.max(startYear, Math.min(nowYear, startYear));
    return startYear + Math.round((k * (nowYear - startYear)) / (n - 1));
  };

  const enough = seen.length >= Math.min(n, 3) || idx === n - 1;
  useNext(enough ? "Audio guide" : null, onNext, "audio");

  return (
    <>
      <Head kicker="Room 2 · The Portrait Gallery" title="Our greatest works" sub="Swipe through the collection →" />
      <div className="ha-fill">
        <div className="ha-gal" data-ha-gallery={`${idx + 1}/${n}`}>
          <motion.div
            className="ha-gal-track"
            drag={n > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.35}
            dragSnapToOrigin
            onDragEnd={(_, info) => {
              if (info.offset.x < -50 || info.velocity.x < -400) go(1);
              else if (info.offset.x > 50 || info.velocity.x > 400) go(-1);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") go(1);
              if (e.key === "ArrowLeft") go(-1);
            }}
            tabIndex={0}
            role="group"
            aria-roledescription="carousel"
            aria-label={`Artwork ${idx + 1} of ${n}. Use the arrow keys or swipe.`}
          >
            {Array.from({ length: n }, (_, k) => {
              const p = photos[k];
              const off = k - idx;
              const title = (p?.caption ?? "").trim() || `Untitled No. ${k + 1}`;
              const note = (p?.note ?? "").trim();
              return (
                <div
                  key={k}
                  className={`ha-art${off === 0 ? " is-here" : ""}`}
                  style={{ ["--off" as string]: String(off), zIndex: 10 - Math.abs(off), visibility: Math.abs(off) > 1 ? "hidden" : undefined }}
                  aria-hidden={off !== 0}
                  onClick={() => off !== 0 && go(off)}
                >
                  <div className="ha-art-frame ha-frame">
                    <div className="ha-frame-in">{p ? <CroppedPhoto photo={p} eager={Math.abs(off) <= 1} alt={title} /> : <Painting k={k} />}</div>
                    <span className="ha-art-light" aria-hidden />
                  </div>
                  <div className="ha-art-pl ha-plaque">
                    <p className="ha-pl-t">{title}</p>
                    <p className="ha-pl-m">
                      {sender} &amp; {recipient}, {yearOf(k)} · {MEDIUMS[k % MEDIUMS.length]}
                    </p>
                    {note && <p className="ha-pl-c">“{note}”</p>}
                  </div>
                </div>
              );
            })}
          </motion.div>
          <div className="ha-gal-gif">{sticker}</div>
        </div>
      </div>
      <div className="ha-gal-nav">
        <button type="button" className="ha-arrow" onClick={() => go(-1)} disabled={idx === 0} aria-label="Previous artwork">
          ‹
        </button>
        <span className="ha-gal-count" aria-live="polite">
          No. {idx + 1} <i>of</i> {n}
        </span>
        <button type="button" className="ha-arrow" onClick={() => go(1)} disabled={idx === n - 1} aria-label="Next artwork" data-ha-gal-next>
          ›
        </button>
      </div>
      <style>{GAL_CSS(reduced)}</style>
    </>
  );
}

const GAL_CSS = (reduced: boolean) => `
.ha-gal { position: relative; width: 100%; height: 100%; }
.ha-gal-track { position: absolute; inset: 0; outline: none; touch-action: pan-y; cursor: grab; }
.ha-gal-track:active { cursor: grabbing; }
.ha-gal-track:focus-visible { outline: 3px solid var(--vw-accent); outline-offset: 4px; border-radius: 12px; }
.ha-art { --fh: min(60cqh, 104cqw, 560px); position: absolute; left: 50%; top: 0; width: calc(var(--fh) * .8); display: grid; justify-items: center; gap: 10px;
  transform: translateX(calc(-50% + var(--off) * (100% + max(6vw, 28px)))) scale(calc(1 - min(1, max(var(--off), -1 * var(--off))) * .14));
  transform-origin: 50% 40%; ${reduced ? "" : "transition: transform .55s cubic-bezier(.25,.9,.3,1.05), opacity .4s ease;"} opacity: 1; }
.ha-art:not(.is-here) { opacity: .5; cursor: pointer; }
.ha-art-frame { width: 100%; height: var(--fh); }
.ha-art-light { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(70% 45% at 50% 0%, rgba(255,255,255,.35), transparent 70%); }
.ha-art-pl { width: min(calc(100% + 40px), 88cqw); ${reduced ? "" : "transition: opacity .3s ease;"} }
.ha-art:not(.is-here) .ha-art-pl { opacity: 0; }
@media (max-width: 999px) { .ha-art { --fh: min(54cqh, 92cqw, 460px); } }
/* Phones: the plaque spans the room (long names stay on two lines, not six), and on short screens the frame
   gives up a little height so frame + plaque never run under the ‹ No. 1 of 4 › row. */
@media (max-width: 999px) { .ha-art { grid-template-columns: minmax(0, 1fr); } .ha-art-pl { --plw: max(100%, min(88cqw, 340px)); width: var(--plw); margin-inline: calc((100% - var(--plw)) / 2); } }
@container (max-height: 400px) { .ha-art { --fh: min(48cqh, 92cqw, 460px); } .ha-art-pl { padding: 7px 14px 6px; } }
@media (min-width: 1000px) {
  .ha-art { --fh: min(88cqh, 540px); width: calc(var(--fh) * .8 + 300px); grid-template-columns: calc(var(--fh) * .8) 270px; align-items: end; justify-items: start; gap: 30px; top: 50%; translate: 0 -50%; }
  .ha-art-pl { width: 270px; margin-bottom: 18px; padding: 14px 20px 12px; text-align: left; }
  .ha-art-pl .ha-pl-t { font-size: 27px; }
  .ha-art-pl .ha-pl-m { font-size: 11.5px; }
  .ha-art-pl .ha-pl-c { font-size: 20px; }
  .ha-gal-gif { left: calc(50% - var(--gw, 330px)); top: 2%; }
}
.ha-gal-gif { position: absolute; left: -4px; top: -6px; transform: rotate(-8deg); pointer-events: none; z-index: 20; }
.ha-gal-gif .ha-stk img { width: clamp(52px, 10cqh, 92px) !important; height: auto !important; }
@media (max-width: 999px) { .ha-gal-gif { left: -12px; top: -10px; } .ha-gal-gif .ha-stk img { width: clamp(46px, 9cqh, 80px) !important; } }
@media (min-width: 1000px) { .ha-gal-gif { left: 6%; top: 10%; } }
.ha-gal-nav { flex: none; display: flex; align-items: center; gap: 14px; }
.ha-arrow { width: 46px; height: 46px; border: 0; border-radius: 50%; cursor: pointer; font: 700 28px/1 ${FONTS.ui}; color: var(--vw-accent-deep); padding-bottom: 3px;
  background: var(--vw-paper); box-shadow: 0 0 0 2px var(--ha-gilt-a), 0 0 0 3.5px color-mix(in srgb, var(--ha-gilt-b) 60%, transparent), 0 8px 14px -8px color-mix(in srgb, var(--ha-deep) 60%, transparent); touch-action: manipulation; }
.ha-arrow:disabled { opacity: .35; cursor: default; }
.ha-arrow:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 3px; }
.ha-gal-count { min-width: 92px; font: 700 13px ${HA_CAPS}; letter-spacing: .14em; color: var(--vw-ink-soft); }
.ha-gal-count i { font-style: normal; font-family: ${FONTS.ui}; font-weight: 600; text-transform: lowercase; letter-spacing: 0; }
`;

// ─── 4 · The audio guide ────────────────────────────────────────────────────

function useTypeOut(text: string, on: boolean, reduced: boolean): { shown: string; done: boolean } {
  const [n, setN] = useState(0);
  const [prev, setPrev] = useState(text);
  if (prev !== text) {
    setPrev(text);
    setN(0);
  }
  useEffect(() => {
    if (!on || reduced) return;
    const id = window.setInterval(() => setN((v) => (v >= text.length ? v : v + 1)), 24);
    return () => window.clearInterval(id);
  }, [text, on, reduced]);
  const k = reduced ? text.length : n;
  return { shown: on ? text.slice(0, k) : "", done: on && k >= text.length };
}

export function AudioGuide({ milestones, intro, onNext }: { milestones: readonly HaMilestone[]; intro: string; onNext: () => void }) {
  const { cue } = useHa();
  const reduced = useReducedMotion();
  const [at, setAt] = useState<number | null>(null);
  const [heard, setHeard] = useState<number[]>([]);
  const m = at == null ? null : milestones[at];
  const { shown, done } = useTypeOut(m ? m.line : intro, true, reduced);
  const finished = heard.length >= milestones.length;
  const chimed = useRef(false);

  useEffect(() => {
    if (finished && done && !chimed.current) {
      chimed.current = true;
      cue("chime-cascade", { gain: 0.5 });
    }
  }, [finished, done, cue]);

  const press = (k: number) => {
    haptic(10);
    cue("tick", { gain: 0.5, detune: k * 90 });
    cue("glass-ping", { gain: 0.18, at: 0.06 });
    setAt(k);
    setHeard((h) => (h.includes(k) ? h : [...h, k]));
  };

  useNext(finished && done ? "The studio" : null, onNext, "brush");

  return (
    <>
      <Head kicker="Room 3 · Our Story" title="The audio guide" sub={heard.length ? `${heard.length} of ${milestones.length} exhibits heard` : "Tap an exhibit number to listen 🎧"} />
      <div className="ha-fill">
        <div className="ha-guide ha-zoom">
          <div className="ha-handset" aria-label="Audio guide">
            <span className="ha-hs-grille" aria-hidden />
            <div className="ha-hs-screen" aria-hidden>
              <span className="ha-hs-no">{m ? `Exhibit ${String((at ?? 0) + 1).padStart(2, "0")}` : "Welcome"}</span>
              <span className={`ha-eq${!done ? " is-on" : ""}`}>
                {[0, 1, 2, 3, 4].map((b) => (
                  <i key={b} style={{ animationDelay: `${b * 0.11}s` }} />
                ))}
              </span>
            </div>
            <div className="ha-keys">
              {milestones.map((ms, k) => (
                <button
                  key={k}
                  type="button"
                  className={`ha-key${heard.includes(k) ? " is-heard" : ""}${at === k ? " is-on" : ""}`}
                  onClick={() => press(k)}
                  aria-label={`Exhibit ${k + 1}: ${ms.title}`}
                  aria-pressed={at === k}
                  data-ha-key={k}
                >
                  {k + 1}
                </button>
              ))}
            </div>
            <span className="ha-hs-phones" aria-hidden>
              🎧
            </span>
          </div>
          <div className="ha-transcript">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={at ?? -1}
                className="ha-tr-card"
                initial={reduced ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? undefined : { opacity: 0, y: -8, transition: { duration: 0.15 } }}
                transition={{ duration: 0.3 }}
              >
                {m ? (
                  <>
                    <p className="ha-tr-when">{m.when || `Exhibit ${(at ?? 0) + 1}`}</p>
                    <p className="ha-tr-title">{m.title}</p>
                  </>
                ) : (
                  <p className="ha-tr-when">Your guide</p>
                )}
                <p className="ha-tr-line" aria-live="polite">
                  {shown}
                  {!done && <span className="ha-caret" aria-hidden />}
                </p>
              </motion.div>
            </AnimatePresence>
            <ol className="ha-tl" aria-label="Our story so far">
              {milestones.map((ms, k) => (
                <li key={k} className={heard.includes(k) ? "is-heard" : undefined}>
                  <span className="ha-tl-dot" aria-hidden />
                  <span className="ha-tl-w">{ms.when || `No. ${k + 1}`}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
      <style>{GUIDE_CSS}</style>
    </>
  );
}

const GUIDE_CSS = `
.ha-guide { width: min(100%, 440px); display: grid; gap: clamp(10px, 2.4cqh, 18px); justify-items: center; align-content: center; }
.ha-handset { position: relative; width: min(100%, 300px); box-sizing: border-box; padding: 12px 14px 14px; border-radius: 30px; display: grid; gap: 10px; justify-items: center;
  background: linear-gradient(165deg, #FFFFFF, var(--vw-paper) 40%, var(--ha-blush)); box-shadow: 0 0 0 2.5px var(--ha-gilt-a), 0 0 0 4px color-mix(in srgb, var(--ha-gilt-b) 60%, transparent), 0 22px 34px -18px color-mix(in srgb, var(--ha-deep) 70%, transparent), inset 0 -5px 0 color-mix(in srgb, var(--ha-deep) 10%, transparent); }
.ha-hs-grille { width: 54px; height: 7px; border-radius: 99px; background: repeating-linear-gradient(90deg, color-mix(in srgb, var(--ha-deep) 40%, transparent) 0 3px, transparent 3px 6px); }
.ha-hs-screen { width: 100%; box-sizing: border-box; height: 44px; padding: 0 12px; border-radius: 12px; display: flex; align-items: center; justify-content: space-between;
  background: linear-gradient(180deg, #F3FBF3, #E3F2E6); box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--ha-deep) 18%, transparent), inset 0 3px 6px rgba(0,40,10,.12); }
.ha-hs-no { font: 700 13px ${HA_CAPS}; letter-spacing: .14em; color: #234A2E; text-transform: uppercase; }
.ha-eq { display: inline-flex; align-items: end; gap: 3px; height: 22px; }
.ha-eq i { width: 4px; height: 100%; border-radius: 2px; background: #3E8C58; transform-origin: 50% 100%; transform: scaleY(.25); }
.ha-eq.is-on i { animation: ha-eq .55s ease-in-out infinite alternate; }
@keyframes ha-eq { from { transform: scaleY(.2) } to { transform: scaleY(1) } }
.ha-keys { display: flex; flex-wrap: wrap; justify-content: center; gap: 9px; }
.ha-key { width: 50px; height: 50px; border: 0; border-radius: 50%; cursor: pointer; touch-action: manipulation; font: 700 20px/1 ${HA_CAPS}; color: var(--vw-ink);
  background: radial-gradient(circle at 38% 32%, #FFFFFF, color-mix(in srgb, var(--ha-blush) 70%, #FFFFFF)); box-shadow: 0 4px 0 color-mix(in srgb, var(--ha-deep) 35%, transparent), 0 0 0 2px var(--vw-edge); transition: transform .12s ease, background .2s ease; }
.ha-key:active { transform: translateY(3px); box-shadow: 0 1px 0 color-mix(in srgb, var(--ha-deep) 35%, transparent), 0 0 0 2px var(--vw-edge); }
.ha-key.is-heard { background: radial-gradient(circle at 38% 32%, #FFFFFF, color-mix(in srgb, var(--vw-accent) 30%, #FFFFFF)); }
.ha-key.is-on { color: #FFFFFF; background: radial-gradient(circle at 38% 32%, color-mix(in srgb, var(--vw-accent) 60%, #FFFFFF), var(--vw-accent-deep)); box-shadow: 0 4px 0 var(--ha-deep), 0 0 0 2px var(--ha-gilt-a); }
.ha-key:not(.is-heard):not(.is-on) { animation: ha-key-glow 2s ease-in-out infinite; }
@keyframes ha-key-glow { 50% { box-shadow: 0 4px 0 color-mix(in srgb, var(--ha-deep) 35%, transparent), 0 0 0 2px var(--vw-accent), 0 0 14px 2px color-mix(in srgb, var(--vw-accent) 40%, transparent) } }
.ha-key:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 3px; }
.ha-hs-phones { position: absolute; right: -14px; top: -18px; font-size: 34px; transform: rotate(14deg); filter: drop-shadow(0 4px 6px rgba(0,0,0,.18)); }
.ha-transcript { width: 100%; display: grid; gap: 10px; }
.ha-tr-card { box-sizing: border-box; min-height: clamp(118px, 22cqh, 170px); padding: 12px 16px 14px; border-radius: 6px; text-align: left;
  background: linear-gradient(180deg, #FFFFFF, var(--vw-paper)); box-shadow: 0 0 0 1.5px var(--vw-edge), 0 14px 26px -18px color-mix(in srgb, var(--ha-deep) 60%, transparent); }
.ha-tr-when { margin: 0; font: 700 11px ${HA_CAPS}; letter-spacing: .16em; text-transform: uppercase; color: var(--vw-accent-deep); overflow-wrap: anywhere; }
.ha-tr-title { margin: 2px 0 0; font: 700 clamp(22px, 3.2cqh, 27px)/1.1 ${HA_DISPLAY}; color: var(--vw-ink); overflow-wrap: anywhere; }
.ha-tr-line { margin: 6px 0 0; font: 600 clamp(19px, 2.9cqh, 23px)/1.3 ${HA_HAND}; color: var(--vw-ink); overflow-wrap: anywhere; }
.ha-caret { display: inline-block; width: 2px; height: 1em; margin-left: 2px; vertical-align: -2px; background: var(--vw-accent); animation: ha-caret .8s steps(2) infinite; }
@keyframes ha-caret { 50% { opacity: 0 } }
.ha-tl { list-style: none; margin: 0; padding: 0 4px; display: flex; justify-content: space-between; position: relative; }
.ha-tl::before { content: ""; position: absolute; left: 14px; right: 14px; top: 7px; height: 2px; background: repeating-linear-gradient(90deg, var(--vw-gold) 0 6px, transparent 6px 10px); }
.ha-tl li { position: relative; display: grid; justify-items: center; gap: 3px; min-width: 0; flex: 1; }
.ha-tl-dot { width: 14px; height: 14px; border-radius: 50%; background: var(--vw-paper); box-shadow: inset 0 0 0 2px var(--vw-gold); transition: background .3s ease, transform .3s cubic-bezier(.3,1.6,.5,1); }
.ha-tl li.is-heard .ha-tl-dot { background: var(--vw-accent); box-shadow: inset 0 0 0 2px var(--vw-accent-deep); transform: scale(1.15); }
.ha-tl-w { font: 600 10.5px/1.2 ${FONTS.ui}; color: var(--vw-ink-soft); max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
@media (min-width: 1000px) {
  .ha-guide { --hz: 1.22; width: min(100%, 860px); grid-template-columns: 320px minmax(0, 1fr); gap: 36px; align-items: center; }
  .ha-handset { width: 320px; padding: 18px 18px 22px; gap: 14px; }
  .ha-keys { gap: 12px; }
  .ha-key { width: 56px; height: 56px; font-size: 22px; }
  .ha-tr-card { min-height: 200px; padding: 18px 22px; }
}
@media (prefers-reduced-motion: reduce) { .ha-eq.is-on i, .ha-key, .ha-caret { animation: none !important; } }
`;

// ─── 5 · The restoration studio ─────────────────────────────────────────────

const BRUSH = 30;

/** A little watercolour of the first date: a window, a round table, two cups. */
function FirstDatePainting() {
  return (
    <svg viewBox="0 0 200 220" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id="haSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFF4E2" />
          <stop offset="1" stopColor="var(--ha-blush)" />
        </linearGradient>
      </defs>
      <rect width="200" height="220" fill="url(#haSky)" />
      <path d="M40 120 V58 a60 60 0 0 1 120 0 V120 Z" fill="#E7F3FF" stroke="var(--ha-gilt-b)" strokeWidth="4" />
      <path d="M100 0 V120 M40 80 H160" stroke="var(--ha-gilt-b)" strokeWidth="3" opacity=".7" />
      <circle cx="132" cy="52" r="11" fill="#FFE7A3" />
      <path d="M48 112 q20 -16 40 -4 t40 -2 t30 2 V120 H48 Z" fill="color-mix(in srgb, var(--vw-accent) 25%, #FFFFFF)" />
      {[18, 46, 74, 102, 130, 158, 186].map((x, k) => (
        <path key={x} d={`M${x - 14} 14 l14 12 l14 -12`} fill={k % 2 ? "var(--vw-accent)" : "var(--ha-gilt-a)"} opacity=".85" />
      ))}
      <path d="M0 10 Q100 22 200 10" stroke="var(--ha-gilt-b)" strokeWidth="1.5" fill="none" />
      <rect x="0" y="150" width="200" height="70" fill="color-mix(in srgb, var(--ha-gilt-a) 50%, #FFF6EA)" />
      <ellipse cx="100" cy="152" rx="70" ry="13" fill="#FFFFFF" stroke="var(--ha-gilt-b)" strokeWidth="2.5" />
      <path d="M96 164 V206 M104 164 V206 M84 208 H116" stroke="var(--ha-gilt-b)" strokeWidth="4" strokeLinecap="round" />
      <g>
        <path d="M66 132 h22 v12 a11 8 0 0 1 -22 0 z" fill="#FFFFFF" stroke="var(--vw-accent-deep)" strokeWidth="2.2" />
        <path d="M88 136 q7 1 0 8" fill="none" stroke="var(--vw-accent-deep)" strokeWidth="2" />
        <path d="M112 132 h22 v12 a11 8 0 0 1 -22 0 z" fill="#FFFFFF" stroke="var(--vw-accent-deep)" strokeWidth="2.2" />
        <path d="M112 136 q-7 1 0 8" fill="none" stroke="var(--vw-accent-deep)" strokeWidth="2" />
        <path d="M100 124 C94 119 92 116 93 113 C94 110 98 110 100 113 C102 110 106 110 107 113 C108 116 106 119 100 124 Z" fill="var(--vw-accent)" />
        <path d="M74 126 q-3 -6 1 -12 M80 126 q-3 -6 1 -12 M120 126 q3 -6 -1 -12 M126 126 q3 -6 -1 -12" stroke="color-mix(in srgb, var(--ha-deep) 40%, transparent)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export function Restore({ place, memory, year, onNext }: { place: string; memory: string; year: number; onNext: () => void }) {
  const { cue } = useHa();
  const reduced = useReducedMotion();
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const puffs = useRef<HTMLSpanElement | null>(null);
  const brushEl = useRef<HTMLSpanElement | null>(null);
  const last = useRef<{ x: number; y: number } | null>(null);
  const moves = useRef(0);
  const lastPuff = useRef(0);
  const [progress, setProgress] = useState(0);
  const [clean, setClean] = useState(false);
  const [touched, setTouched] = useState(false);

  // Lay the dust: a warm grey film, speckles, a couple of cobweb wisps.
  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const paint = () => {
      const r = c.getBoundingClientRect();
      if (!r.width) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      c.width = Math.round(r.width * dpr);
      c.height = Math.round(r.height * dpr);
      const g = c.getContext("2d");
      if (!g) return;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const grd = g.createLinearGradient(0, 0, r.width, r.height);
      grd.addColorStop(0, "#D8CFC1");
      grd.addColorStop(0.5, "#CFC4B3");
      grd.addColorStop(1, "#C6BAA7");
      g.fillStyle = grd;
      g.fillRect(0, 0, r.width, r.height);
      let s = 7;
      const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
      for (let k = 0; k < 900; k++) {
        g.fillStyle = rnd() > 0.5 ? "rgba(255,255,255,.22)" : "rgba(90,70,45,.13)";
        const d = 0.6 + rnd() * 2.2;
        g.fillRect(rnd() * r.width, rnd() * r.height, d, d);
      }
      g.strokeStyle = "rgba(255,255,255,.35)";
      g.lineWidth = 1;
      for (let k = 0; k < 6; k++) {
        g.beginPath();
        g.moveTo(0, 0);
        g.quadraticCurveTo(r.width * (0.1 + k * 0.05), r.height * 0.05 * k, r.width * (0.16 + k * 0.06), r.height * (0.02 + k * 0.03));
        g.stroke();
      }
      g.fillStyle = "rgba(80,60,40,.38)";
      g.font = `600 ${Math.round(Math.min(18, r.width / 16))}px ${getComputedStyle(c).fontFamily}`;
      g.textAlign = "center";
      g.fillText("~ please restore me ~", r.width / 2, r.height * 0.5);
    };
    paint();
    const ro = new ResizeObserver(() => {
      if (!clean) paint();
    });
    ro.observe(c);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finish = useCallback(() => {
    if (clean) return;
    setClean(true);
    setProgress(1);
    haptic(26);
    cue("sparkle", { gain: 0.6 });
    cue("chime-cascade", { gain: 0.55, at: 0.25 });
    if (!reduced) burst({ kind: "sparkles", origin: { x: 0.5, y: 0.45 }, count: 22 });
  }, [clean, cue, reduced]);

  const measure = () => {
    const c = canvas.current;
    const g = c?.getContext("2d");
    if (!c || !g) return;
    const { width: w, height: h } = c;
    const data = g.getImageData(0, 0, w, h).data;
    const step = 10;
    let clear = 0;
    let all = 0;
    for (let y = 0; y < h; y += step)
      for (let x = 0; x < w; x += step) {
        all++;
        if (data[(y * w + x) * 4 + 3] < 60) clear++;
      }
    const p = clear / Math.max(1, all);
    setProgress(p);
    if (p > 0.55) finish();
  };

  const puff = (x: number, y: number) => {
    const host = puffs.current;
    if (!host || reduced) return;
    const now = performance.now();
    if (now - lastPuff.current < 40) return;
    lastPuff.current = now;
    for (let k = 0; k < 2; k++) {
      const s = document.createElement("span");
      s.className = "ha-puff";
      const dx = (Math.random() - 0.5) * 50;
      s.style.cssText = `left:${x}px;top:${y}px;--dx:${dx}px;--sz:${10 + Math.random() * 16}px`;
      s.addEventListener("animationend", () => s.remove());
      host.appendChild(s);
    }
  };

  const brush = (x: number, y: number) => {
    const c = canvas.current;
    const g = c?.getContext("2d");
    if (!c || !g) return;
    g.save();
    g.globalCompositeOperation = "destination-out";
    const p0 = last.current ?? { x, y };
    const dist = Math.hypot(x - p0.x, y - p0.y);
    const steps = Math.max(1, Math.ceil(dist / 8));
    for (let k = 1; k <= steps; k++) {
      const px = p0.x + ((x - p0.x) * k) / steps;
      const py = p0.y + ((y - p0.y) * k) / steps;
      const rg = g.createRadialGradient(px, py, 0, px, py, BRUSH);
      rg.addColorStop(0, "rgba(0,0,0,.9)");
      rg.addColorStop(0.6, "rgba(0,0,0,.45)");
      rg.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = rg;
      g.beginPath();
      g.arc(px, py, BRUSH, 0, Math.PI * 2);
      g.fill();
    }
    g.restore();
    last.current = { x, y };
    puff(x, y);
    moves.current += 1;
    if (moves.current % 10 === 0) measure();
    if (moves.current % 6 === 0) cue("paper-rustle", { gain: 0.12, detune: (Math.random() - 0.5) * 400 });
  };

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const moveBrush = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const b = brushEl.current;
    if (!b) return;
    const p = pos(e);
    b.style.transform = `translate(${p.x}px, ${p.y}px)`;
  };

  useNext(clean ? "The gift shop" : null, onNext, "snow");

  return (
    <>
      <Head kicker="Room 4 · The Restoration Studio" title="Where it all began" sub={clean ? "Good as new. Just like that day." : "This old painting needs you. Brush the dust off 🖌️"} />
      <div className="ha-fill">
        <div className="ha-restore ha-zoom">
          <div className="ha-easel ha-frame" data-ha-restore={clean ? "clean" : `${Math.round(progress * 100)}`}>
            <div className="ha-frame-in ha-canvas-host">
              <FirstDatePainting />
              <p className="ha-memory">{memory}</p>
              <span className={`ha-glint${clean ? " is-on" : ""}`} aria-hidden />
              <canvas
                ref={canvas}
                className={`ha-dust${clean ? " is-gone" : ""}`}
                onPointerDown={(e) => {
                  if (clean) return;
                  e.currentTarget.setPointerCapture(e.pointerId);
                  last.current = null;
                  setTouched(true);
                  const p = pos(e);
                  brush(p.x, p.y);
                }}
                onPointerMove={(e) => {
                  moveBrush(e);
                  if (clean || !e.currentTarget.hasPointerCapture(e.pointerId)) return;
                  const p = pos(e);
                  brush(p.x, p.y);
                }}
                onPointerUp={() => {
                  last.current = null;
                  measure();
                }}
                aria-label="A dusty painting. Drag across it to brush the dust off."
                data-ha-dust
              />
              <span className="ha-puffs" ref={puffs} aria-hidden />
              {!clean && (
                <span className="ha-brush" ref={brushEl} aria-hidden>
                  🖌️
                </span>
              )}
              {!touched && !clean && (
                <span className="ha-brush-hint" aria-hidden>
                  brush here
                </span>
              )}
            </div>
          </div>
          <div className="ha-plaque ha-restore-pl">
            <p className="ha-pl-t">{place}</p>
            <p className="ha-pl-m">Oil on memory, {year} · {clean ? "restored with love" : `restored ${Math.round(Math.min(1, progress / 0.55) * 100)}%`}</p>
          </div>
          {!clean && (
            <button type="button" className="ha-linkbtn" onClick={finish} data-ha-restore-skip>
              can&apos;t brush? restore it for me
            </button>
          )}
        </div>
      </div>
      <style>{RESTORE_CSS}</style>
    </>
  );
}

const RESTORE_CSS = `
.ha-restore { width: min(100%, 460px); display: grid; justify-items: center; gap: 10px; align-content: center; }
.ha-easel { --pw: min(70cqh, 86cqw, 440px); width: var(--pw); height: calc(var(--pw) * .98); max-height: 66cqh; }
@media (min-width: 1000px) { .ha-restore { --hz: 1; width: min(100%, 980px); grid-template-columns: auto 320px; grid-template-rows: 1fr auto auto 1fr; column-gap: 40px; align-items: center; } .ha-easel { --pw: min(90cqh, 560px); grid-row: 1 / -1; max-height: 92cqh; } .ha-restore-pl { width: 320px; grid-row: 2; } .ha-restore .ha-linkbtn { grid-row: 3; } .ha-restore-pl .ha-pl-t { font-size: 26px; } .ha-memory { font-size: 25px; } }
.ha-canvas-host { position: relative; }
.ha-canvas-host > svg { position: absolute; inset: 0; }
.ha-memory { position: absolute; left: 8%; right: 8%; bottom: 7%; margin: 0; padding: 8px 12px; border-radius: 4px; text-align: center;
  font: 700 clamp(17px, 2.7cqh, 23px)/1.22 ${HA_HAND}; color: #3E2A1E; background: color-mix(in srgb, #FFFDF6 88%, transparent); box-shadow: 0 0 0 1.5px var(--ha-gilt-b), 0 6px 14px -8px rgba(60,40,10,.4); overflow-wrap: anywhere; }
.ha-dust { position: absolute; inset: 0; width: 100%; height: 100%; touch-action: none; cursor: none; font-family: ${HA_DISPLAY}; transition: opacity 1.1s ease; }
.ha-dust.is-gone { opacity: 0; pointer-events: none; }
.ha-brush { position: absolute; left: 0; top: 0; font-size: 30px; line-height: 1; pointer-events: none; margin: -26px 0 0 -6px; transform: translate(50%, 40%); filter: drop-shadow(0 3px 4px rgba(0,0,0,.25)); }
@media (hover: none) { .ha-brush { display: none; } .ha-dust { cursor: default; } }
.ha-brush-hint { position: absolute; left: 50%; top: 32%; translate: -50% -50%; padding: 6px 14px; border-radius: 99px; pointer-events: none; font: 700 21px ${HA_HAND}; color: #FFFFFF; background: color-mix(in srgb, var(--vw-accent-deep) 85%, transparent); animation: ha-swipe 1.8s ease-in-out infinite; }
@keyframes ha-swipe { 0%, 100% { transform: translateX(-24px) rotate(-4deg) } 50% { transform: translateX(24px) rotate(4deg) } }
.ha-puffs { position: absolute; inset: 0; pointer-events: none; overflow: visible; }
.ha-puff { position: absolute; width: var(--sz); height: var(--sz); margin: calc(var(--sz) / -2) 0 0 calc(var(--sz) / -2); border-radius: 50%; pointer-events: none;
  background: radial-gradient(circle, rgba(225,214,198,.95), rgba(225,214,198,0) 70%); animation: ha-puff .9s ease-out forwards; }
@keyframes ha-puff { from { transform: translate(0, 0) scale(.6); opacity: .95 } to { transform: translate(var(--dx), -46px) scale(1.9); opacity: 0 } }
.ha-glint { position: absolute; inset: 0; pointer-events: none; opacity: 0; background: linear-gradient(115deg, transparent 30%, rgba(255,255,255,.85) 48%, transparent 62%); background-size: 260% 100%; background-position: 120% 0; }
.ha-glint.is-on { animation: ha-glint 1.4s ease .6s both; }
@keyframes ha-glint { 0% { opacity: 1; background-position: 120% 0 } 100% { opacity: 1; background-position: -60% 0 } }
.ha-restore-pl { width: min(100%, 320px); }
@media (prefers-reduced-motion: reduce) { .ha-brush-hint, .ha-glint.is-on { animation: none; } }
`;

