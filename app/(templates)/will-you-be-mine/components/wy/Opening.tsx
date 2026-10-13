"use client";

// Scenes 1–3: the velvet ring box, our story, and the heart constellation.
// Each one is a single screen; its Next pill appears only once her moment is
// done (the box opened, every chapter walked, every star connected).

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { burst, haptic, useReducedMotion } from "../../../_valentine/kit";
import type { WybmChapter } from "../../../_valentine/days/will-you-be-mine";
import { FONTS } from "../../../_valentine/theme";
import { VelvetBox } from "./art";
import { WY_HAND, WY_SERIF } from "./fonts";
import { useNext, useWy } from "./stage";
import { Head, WyScroll } from "./ui";

const TAPS = 3;

// ─── 1 · The velvet ring box ────────────────────────────────────────────────

export function Gate({ recipient, sender, openingLine, sticker, onEnter }: { recipient: string; sender: string; openingLine: string; sticker: ReactNode; onEnter: () => void }) {
  const { cue } = useWy();
  const reduced = useReducedMotion();
  const [taps, setTaps] = useState(0);
  const [press, setPress] = useState(0);
  const open = taps >= TAPS;

  const tap = () => {
    if (open) return;
    const n = taps + 1;
    setTaps(n);
    setPress((p) => p + 1);
    haptic(n >= TAPS ? 22 : 10);
    if (n < TAPS) {
      cue("heartbeat", { gain: 0.55 });
      if (!reduced) burst({ kind: "hearts", origin: { x: 0.5, y: 0.55 }, count: 6 + n * 4, spread: 0.25 });
      return;
    }
    cue("ribbon", { gain: 0.8 });
    cue("chime-cascade", { gain: 0.55, at: 0.35 });
    if (!reduced) window.setTimeout(() => burst({ kind: "sparkles", origin: { x: 0.5, y: 0.5 }, count: 24 }), 420);
  };

  useNext(open ? "Okay, show me" : null, onEnter, "story");

  return (
    <>
      <Head kicker={`Psst, ${recipient}…`} title={<>I have a <em className="wy-em">little</em> question for you</>} sub={openingLine || "but first, open this 🎀"} />
      <div className="wy-fill">
        <div className={`wy-gate${open ? " is-open" : ""}`} data-wy-box={open ? "open" : "closed"}>
          <div className="wy-gate-peek">{sticker}</div>
          <button
            type="button"
            className={`wy-gate-btn${press ? (press % 2 ? " is-press-a" : " is-press-b") : ""}`}
            onClick={tap}
            disabled={open}
            aria-label={open ? "The box is open" : `Tap the ring box to open it (${taps} of ${TAPS})`}
          >
            <VelvetBox open={open} size="100%" />
          </button>
          <AnimatePresence>
            {open && (
              <motion.div
                className="wy-gate-note"
                initial={reduced ? false : { opacity: 0, y: 40, scale: 0.6, rotate: -6 }}
                animate={{ opacity: 1, y: 0, scale: 1, rotate: -3 }}
                transition={{ type: "spring", stiffness: 200, damping: 16, delay: reduced ? 0 : 0.75 }}
              >
                <p className="wy-gate-note-t">It&apos;s empty… for now 😌</p>
                <p className="wy-gate-note-s">The ring comes at the end. First, a little story — from {sender}.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <p className="wy-hint" aria-live="polite">
        {open ? "Shh, no peeking ahead 🤫" : taps === 0 ? "Tap the box 🎀" : taps === 1 ? "Again… 💓" : "One more! 💗"}
      </p>
      <style>{GATE_CSS}</style>
    </>
  );
}

const GATE_CSS = `
.wy-em { font-style: italic; color: var(--vw-accent); }
.wy-hint { flex: none; margin: 0; min-height: 22px; font: 600 clamp(15px, 2.3dvh, 18px) ${FONTS.ui}; color: var(--vw-accent-deep); }
.wy-gate { position: relative; width: min(78cqw, 92cqh, calc(300px * var(--vw-s, 1))); aspect-ratio: 1; display: grid; place-items: center; }
.wy-gate-btn { position: relative; z-index: 1; width: 100%; height: 100%; padding: 0; border: 0; background: none; cursor: pointer; touch-action: manipulation; -webkit-tap-highlight-color: transparent;
  filter: drop-shadow(0 22px 26px color-mix(in srgb, var(--wy-deep) 45%, transparent)); }
.wy-gate-btn:not(:disabled) { animation: wy-box-bob 1.8s ease-in-out infinite alternate; }
@keyframes wy-box-bob { from { transform: translateY(0) rotate(-1.5deg) } to { transform: translateY(-6px) rotate(1.5deg) } }
.wy-gate-btn.is-press-a:not(:disabled) { animation: wy-press-a .34s cubic-bezier(.3,1.6,.5,1), wy-box-bob 1.8s ease-in-out .34s infinite alternate; }
.wy-gate-btn.is-press-b:not(:disabled) { animation: wy-press-b .34s cubic-bezier(.3,1.6,.5,1), wy-box-bob 1.8s ease-in-out .34s infinite alternate; }
@keyframes wy-press-a { 0% { transform: scale(.86) rotate(-7deg) } 100% { transform: scale(1) } }
@keyframes wy-press-b { 0% { transform: scale(.86) rotate(7deg) } 100% { transform: scale(1) } }
.wy-gate-btn:disabled { cursor: default; }
.wy-gate-btn:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 4px; border-radius: 24px; }
.wy-gate-peek { position: absolute; z-index: 2; right: -7%; bottom: 2%; transform: rotate(9deg); transition: transform .7s cubic-bezier(.3,1.5,.5,1) .9s; pointer-events: none; }
.wy-gate.is-open .wy-gate-peek { transform: translate(4%, 6%) rotate(12deg) scale(1.04); }
.wy-gate-peek .wy-stk img { width: clamp(68px, 22cqw, 96px) !important; height: auto !important; }
.wy-gate-note { position: absolute; z-index: 2; left: 50%; top: 8%; width: min(86%, 270px); margin-left: max(-43%, -135px); box-sizing: border-box; padding: 12px 16px 13px; border-radius: 16px;
  background: var(--wy-card); color: var(--vw-ink); text-align: center; box-shadow: 0 0 0 2px var(--vw-edge), 0 18px 30px -14px color-mix(in srgb, var(--wy-deep) 60%, transparent); }
.wy-gate-note::before { content: ""; position: absolute; left: 50%; top: -9px; width: 64px; height: 18px; transform: translateX(-50%) rotate(-2deg); border-radius: 3px; background: color-mix(in srgb, var(--vw-gold) 65%, transparent); }
.wy-gate-note-t { margin: 0; font: 700 clamp(19px, 6cqw, 23px)/1.15 ${WY_SERIF}; font-style: italic; color: var(--vw-accent-deep); }
.wy-gate-note-s { margin: 4px 0 0; font: 600 clamp(17px, 5.2cqw, 20px)/1.2 ${WY_HAND}; color: var(--vw-ink); overflow-wrap: anywhere; }
@media (prefers-reduced-motion: reduce) { .wy-gate-btn, .wy-gate-peek { animation: none !important; transition: none !important; } }
`;

// ─── 2 · Our story (walk the heart path) ────────────────────────────────────

export function Story({ chapters, sticker, onNext }: { chapters: readonly WybmChapter[]; sticker: ReactNode; onNext: () => void }) {
  const { cue } = useWy();
  const reduced = useReducedMotion();
  const n = chapters.length;
  const [at, setAt] = useState(-1);
  const [shown, setShown] = useState(-1);
  const all = at >= n - 1;
  const step = (k: number) => {
    if (k !== at + 1) {
      if (k <= at) {
        setShown(k);
        cue("tick", { gain: 0.4 });
      }
      return;
    }
    haptic(12);
    cue("pop", { gain: 0.5, detune: k * 120 });
    cue("chime", { gain: 0.35, at: 0.08, detune: k * 120 });
    setAt(k);
    setShown(k);
    if (k === n - 1 && !reduced) window.setTimeout(() => burst({ kind: "hearts", origin: { x: 0.5, y: 0.35 }, count: 18 }), 250);
  };
  useNext(all ? "Aww, and then?" : null, onNext, "star");
  const pos = (k: number) => (n <= 1 ? 50 : 8 + (k * 84) / (n - 1));
  const c = shown >= 0 ? chapters[shown] : null;

  return (
    <>
      <Head kicker="How it started" title="Our little story" sub={all ? "…and it's still my favourite one." : "Tap the glowing heart to walk with me 👣"} />
      <div className="wy-fill">
        <div className="wy-story">
          <div className="wy-path" style={{ ["--n" as string]: String(n) }}>
            <div className="wy-path-walker" style={{ left: `${pos(Math.max(0, at))}%` }} aria-hidden>
              {sticker}
            </div>
            <svg className="wy-path-line" viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden>
              <path d="M8 5 L92 5" stroke="var(--vw-edge)" strokeWidth="2.4" strokeDasharray="1 4" strokeLinecap="round" vectorEffect="non-scaling-stroke" fill="none" />
              <path d="M8 5 L92 5" stroke="var(--vw-accent)" strokeWidth="3.2" strokeLinecap="round" vectorEffect="non-scaling-stroke" fill="none" pathLength={1}
                style={{ strokeDasharray: 1, strokeDashoffset: 1 - (n <= 1 ? (at >= 0 ? 1 : 0) : Math.max(0, at) / (n - 1)), transition: "stroke-dashoffset .6s ease" }} />
            </svg>
            {chapters.map((ch, k) => {
              const done = k <= at;
              const next = k === at + 1;
              return (
                <button
                  key={k}
                  type="button"
                  className={`wy-stop${done ? " is-done" : ""}${next ? " is-next" : ""}${shown === k ? " is-shown" : ""}`}
                  style={{ left: `${pos(k)}%` }}
                  onClick={() => step(k)}
                  aria-label={done ? `Chapter ${k + 1}: ${ch.title}` : next ? `Open chapter ${k + 1}` : `Chapter ${k + 1}, not yet`}
                  data-wy-stop={k}
                >
                  <svg viewBox="0 0 24 22" width="100%" aria-hidden>
                    <path d="M12 21 C4 15 1 11 1.5 7 C2 3 7 1.5 12 6 C17 1.5 22 3 22.5 7 C23 11 20 15 12 21 Z" fill={done ? "var(--vw-accent)" : "var(--wy-card)"} stroke={done || next ? "var(--vw-accent-deep)" : "var(--vw-edge)"} strokeWidth="1.8" />
                  </svg>
                  <span className="wy-stop-n">{k + 1}</span>
                </button>
              );
            })}
          </div>
          <div className="wy-chap-slot" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              {c ? (
                <motion.article
                  key={shown}
                  className="wy-chap"
                  initial={reduced ? false : { opacity: 0, y: 18, rotate: shown % 2 ? 1.5 : -1.5 }}
                  animate={{ opacity: 1, y: 0, rotate: shown % 2 ? 0.8 : -0.8 }}
                  exit={reduced ? undefined : { opacity: 0, y: -10, transition: { duration: 0.16 } }}
                  transition={{ type: "spring", stiffness: 240, damping: 20 }}
                >
                  {c.when && <p className="wy-chap-when">{c.when}</p>}
                  <h3 className="wy-chap-t">{c.title}</h3>
                  {c.line && <p className="wy-chap-l">{c.line}</p>}
                </motion.article>
              ) : (
                <motion.p key="empty" className="wy-chap-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  it all started somewhere… 💭
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <style>{STORY_CSS}</style>
    </>
  );
}

const STORY_CSS = `
.wy-story { width: min(100%, 430px); height: 100%; max-height: 100cqh; display: grid; grid-template-rows: auto minmax(0, 1fr); gap: clamp(10px, 2dvh, 18px); align-items: start; }
.wy-path { position: relative; height: clamp(150px, 26dvh, 190px); }
.wy-path-line { position: absolute; left: 0; right: 0; bottom: 18px; width: 100%; height: 12px; }
.wy-stop { position: absolute; bottom: 0; width: 46px; height: 46px; margin-left: -23px; padding: 4px; border: 0; background: none; cursor: default; touch-action: manipulation; -webkit-tap-highlight-color: transparent;
  display: grid; place-items: center; filter: drop-shadow(0 4px 6px color-mix(in srgb, var(--wy-deep) 30%, transparent)); transition: transform .3s cubic-bezier(.3,1.6,.5,1); }
.wy-stop svg { position: absolute; inset: 4px; width: calc(100% - 8px); height: auto; }
.wy-stop-n { position: relative; margin-top: -3px; font: 700 13px ${FONTS.ui}; color: var(--vw-ink-soft); }
.wy-stop.is-done { cursor: pointer; }
.wy-stop.is-done .wy-stop-n { color: #FFFFFF; }
.wy-stop.is-next { cursor: pointer; animation: wy-stop-beat 1.1s ease-in-out infinite; }
.wy-stop.is-next .wy-stop-n { color: var(--vw-accent-deep); }
.wy-stop.is-shown { transform: scale(1.18); }
.wy-stop:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 2px; border-radius: 12px; }
@keyframes wy-stop-beat { 0%, 100% { transform: scale(1) } 30% { transform: scale(1.22) } 50% { transform: scale(1.04) } 70% { transform: scale(1.16) } }
.wy-path-walker { position: absolute; bottom: 52px; transform: translateX(-50%); transition: left .9s cubic-bezier(.5,0,.3,1); z-index: 1; }
.wy-path-walker .wy-stk { transform: rotate(-3deg); }
.wy-path-walker .wy-stk img { width: clamp(70px, 13dvh, 96px) !important; height: auto !important; }
.wy-chap-slot { display: grid; place-items: start center; min-height: 0; }
.wy-chap { position: relative; width: 100%; box-sizing: border-box; padding: 18px 20px 18px; border-radius: 20px; background: var(--wy-card); color: var(--vw-ink); text-align: center;
  box-shadow: 0 0 0 2px var(--vw-edge), 0 18px 30px -18px color-mix(in srgb, var(--wy-deep) 60%, transparent); display: grid; gap: 4px; }
.wy-chap::before { content: ""; position: absolute; left: 50%; top: -9px; width: 66px; height: 18px; transform: translateX(-50%) rotate(-2deg); border-radius: 3px; background: color-mix(in srgb, var(--vw-gold) 65%, transparent); }
.wy-chap-when { margin: 0; font: 700 11.5px ${FONTS.ui}; letter-spacing: .16em; text-transform: uppercase; color: var(--vw-accent-deep); overflow-wrap: anywhere; }
.wy-chap-t { margin: 0; font: 700 clamp(22px, 3.4dvh, 28px)/1.15 ${WY_SERIF}; color: var(--vw-ink); overflow-wrap: anywhere; text-wrap: balance; }
.wy-chap-l { margin: 2px 0 0; font: 600 clamp(19px, 2.8dvh, 23px)/1.25 ${WY_HAND}; color: var(--vw-ink); overflow-wrap: anywhere; }
.wy-chap-empty { margin: 18px 0 0; font: 600 22px ${WY_HAND}; color: var(--vw-ink-soft); }
@media (prefers-reduced-motion: reduce) { .wy-stop.is-next { animation: none; } .wy-path-walker { transition: none; } }
`;

// ─── 3 · Reasons I fell for you (connect the stars) ─────────────────────────

/** Points of a heart curve, starting at the top dip and going round, in a 100×92 box. */
function heartPoints(n: number): [number, number][] {
  const f = (t: number): [number, number] => [16 * Math.sin(t) ** 3, 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)];
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (let i = 0; i < 360; i++) {
    const [x, y] = f((i / 360) * Math.PI * 2);
    minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  }
  return Array.from({ length: n }, (_, k) => {
    // Go round to the left first (negative t), so the first line draws up into the left lobe.
    const [x, y] = f(-(k / n) * Math.PI * 2);
    return [10 + ((x - minX) / (maxX - minX)) * 80, 10 + ((maxY - y) / (maxY - minY)) * 72];
  });
}

/** Faint background stars in the sky card. */
const DUST: readonly [number, number, number][] = [
  [8, 10, 1], [22, 4, 0.7], [40, 14, 0.8], [62, 6, 1], [86, 12, 0.7], [94, 40, 1], [4, 46, 0.8], [14, 78, 0.7], [30, 88, 1], [70, 90, 0.8], [90, 76, 1], [52, 50, 0.6], [78, 28, 0.6], [26, 30, 0.6],
];

export function Stars({ reasons, onNext }: { reasons: readonly string[]; onNext: () => void }) {
  const { cue } = useWy();
  const reduced = useReducedMotion();
  // A heart needs ten-odd points to read as one: quiet little stars sit between
  // the reason stars (one between each for 5–6 reasons, more for 3–4).
  const n = reasons.length;
  const step = Math.max(1, Math.ceil(10 / n));
  const pts = useMemo(() => heartPoints(n * step), [n, step]);
  const [lit, setLit] = useState(0);
  const all = lit >= n;
  /** The last heart point reached (the lines run up to it). */
  const reach = all ? pts.length : lit > 0 ? (lit - 1) * step : -1;
  const tap = (k: number) => {
    if (k !== lit) return;
    haptic(12);
    cue("glass-ping", { gain: 0.55, detune: k * 140 });
    cue("sparkle", { gain: 0.3, at: 0.05 });
    setLit(k + 1);
  };
  useEffect(() => {
    if (!all) return;
    cue("chime-cascade", { gain: 0.5, at: 0.35 });
    haptic(24);
    if (!reduced) window.setTimeout(() => burst({ kind: "sparkles", origin: { x: 0.5, y: 0.35 }, count: 30 }), 380);
  }, [all, reduced, cue]);
  useNext(all ? "You're too sweet 🥹" : null, onNext, "quiz");
  const line = (a: number, b: number) => `M${pts[a][0]} ${pts[a][1]} L${pts[b][0]} ${pts[b][1]}`;
  const last = lit > 0 ? lit - 1 : null;

  return (
    <>
      <Head kicker="Connect the stars" title="Reasons I fell for you" sub={all ? "You light up my whole sky ✨" : `Tap the glowing star · ${lit} of ${reasons.length}`} />
      <div className="wy-fill">
        <div className={`wy-stars${all ? " is-all" : ""}`}>
          <div className="wy-sky">
            <div className="wy-sky-box">
            <svg className="wy-sky-svg" viewBox="0 0 100 92" aria-hidden>
              <defs>
                <radialGradient id="wyHeartGlow" cx="50%" cy="45%" r="55%">
                  <stop offset="0" stopColor="var(--vw-accent)" stopOpacity=".55" />
                  <stop offset="1" stopColor="var(--vw-accent)" stopOpacity="0" />
                </radialGradient>
              </defs>
              {DUST.map(([x, y, r], k) => (
                <circle key={k} cx={x} cy={y} r={r * 0.6} fill="#FFFFFF" className="wy-dust" style={{ animationDelay: `${-k * 0.37}s` }} />
              ))}
              {all && <path className="wy-sky-fill" d={`M${pts.map((p) => p.join(" ")).join(" L")} Z`} fill="url(#wyHeartGlow)" />}
              {pts.map((_, k) =>
                k + 1 <= reach ? (
                  <path key={`l${k}`} d={line(k, (k + 1) % pts.length)} stroke="var(--vw-gold)" strokeWidth=".9" strokeLinecap="round" className="wy-sky-line" pathLength={1} />
                ) : null,
              )}
            </svg>
            {pts.map(([x, y], k) => {
              if (k % step)
                return (
                  <span key={k} className={`wy-star wy-star-mini${k <= reach ? " is-on" : ""}`} style={{ left: `${x}%`, top: `${(y / 92) * 100}%` }} aria-hidden>
                    <svg viewBox="0 0 24 24">
                      <path d="M12 3 L13.8 10.2 L21 12 L13.8 13.8 L12 21 L10.2 13.8 L3 12 L10.2 10.2 Z" fill={k <= reach ? "#FFF6D8" : "rgba(255,255,255,.35)"} />
                    </svg>
                  </span>
                );
              const r = k / step;
              const on = r < lit;
              const next = r === lit;
              return (
                <button
                  key={k}
                  type="button"
                  className={`wy-star${on ? " is-on" : ""}${next ? " is-next" : ""}`}
                  style={{ left: `${x}%`, top: `${(y / 92) * 100}%` }}
                  onClick={() => tap(r)}
                  disabled={!next}
                  aria-label={on ? `Star ${r + 1}: ${reasons[r]}` : next ? `Light star ${r + 1}` : `Star ${r + 1}, not yet`}
                  data-wy-star={r}
                >
                  <svg viewBox="0 0 24 24" aria-hidden>
                    <path d="M12 1.5 L14.6 9.4 L22.5 12 L14.6 14.6 L12 22.5 L9.4 14.6 L1.5 12 L9.4 9.4 Z" fill={on ? "#FFF6D8" : next ? "var(--vw-gold)" : "rgba(255,255,255,.45)"} />
                  </svg>
                </button>
              );
            })}
            </div>
          </div>
          {all ? (
            <WyScroll className="wy-reasons" label="Reasons I fell for you">
              <ol className="wy-reasons-list">
                {reasons.map((r, k) => (
                  <li key={k} style={{ animationDelay: `${120 + k * 80}ms` }}>
                    <span className="wy-reasons-n" aria-hidden>
                      ★
                    </span>
                    <span className="wy-reasons-t">{r}</span>
                  </li>
                ))}
              </ol>
            </WyScroll>
          ) : (
            <div className="wy-star-say" aria-live="polite">
              {last === null ? (
                <p className="wy-star-empty">every star is a reason ✨</p>
              ) : (
                <motion.p key={last} className="wy-star-t" initial={reduced ? false : { opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 280, damping: 20 }}>
                  {reasons[last]}
                </motion.p>
              )}
            </div>
          )}
        </div>
      </div>
      <style>{STARS_CSS}</style>
    </>
  );
}

const STARS_CSS = `
.wy-stars { width: min(100%, 430px); height: 100%; max-height: 100cqh; display: flex; flex-direction: column; gap: clamp(8px, 1.6dvh, 14px); min-height: 0; }
.wy-sky { position: relative; flex: 1 1 auto; min-height: 0; width: 100%; max-height: 360px; border-radius: 26px; overflow: hidden;
  background: radial-gradient(90% 70% at 50% 30%, color-mix(in srgb, var(--wy-sky-b) 85%, var(--vw-accent)) 0%, var(--wy-sky-b) 40%, var(--wy-sky-a) 100%);
  box-shadow: 0 0 0 2px var(--vw-edge), inset 0 0 40px rgba(0,0,0,.35), 0 20px 34px -20px color-mix(in srgb, var(--wy-deep) 70%, transparent); transition: flex-basis .6s ease, max-height .6s ease; }
.wy-stars.is-all .wy-sky { flex: 0 0 auto; height: clamp(150px, 30dvh, 250px); }
.wy-sky { container-type: size; }
.wy-sky-box { position: absolute; left: 50%; top: 50%; width: min(80cqw, calc(80cqh * 100 / 92)); aspect-ratio: 100 / 92; transform: translate(-50%, -50%); }
.wy-sky-svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.wy-dust { animation: wy-tw 3s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
.wy-sky-line { stroke-dasharray: 1; stroke-dashoffset: 1; animation: wy-draw .5s ease-out forwards; filter: drop-shadow(0 0 1.5px var(--vw-gold)); }
@keyframes wy-draw { to { stroke-dashoffset: 0 } }
.wy-sky-fill { opacity: 0; animation: wy-fade-in 1.2s ease .3s forwards; }
@keyframes wy-fade-in { to { opacity: 1 } }
.wy-star { position: absolute; width: 46px; height: 46px; margin: -23px 0 0 -23px; padding: 9px; border: 0; background: none; cursor: default; touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
.wy-star svg { width: 100%; height: 100%; display: block; transition: transform .3s cubic-bezier(.3,1.6,.5,1); }
.wy-star.is-on svg { filter: drop-shadow(0 0 6px #FFE9A8) drop-shadow(0 0 2px #FFFFFF); transform: scale(1.1); }
.wy-star.is-next { cursor: pointer; }
.wy-star-mini { pointer-events: none; padding: 14px; }
.wy-star-mini.is-on svg { filter: drop-shadow(0 0 4px #FFE9A8); transform: none; }
.wy-star.is-next svg { filter: drop-shadow(0 0 8px var(--vw-gold)); animation: wy-star-pulse 1s ease-in-out infinite; }
@keyframes wy-star-pulse { 0%, 100% { transform: scale(.9) rotate(0) } 50% { transform: scale(1.3) rotate(20deg) } }
.wy-star:disabled { cursor: default; }
.wy-star:focus-visible { outline: 2px solid #FFFFFF; outline-offset: -4px; border-radius: 50%; }
.wy-star-say { flex: none; min-height: clamp(76px, 12dvh, 100px); display: grid; place-items: center; }
.wy-star-empty { margin: 0; font: 600 22px ${WY_HAND}; color: var(--vw-ink-soft); }
.wy-star-t { margin: 0; box-sizing: border-box; width: 100%; padding: 12px 16px; border-radius: 18px; background: var(--wy-card); box-shadow: 0 0 0 2px var(--vw-edge), 0 10px 20px -12px color-mix(in srgb, var(--wy-deep) 50%, transparent);
  font: 600 clamp(20px, 2.9dvh, 24px)/1.25 ${WY_HAND}; color: var(--vw-ink); overflow-wrap: anywhere; }
.wy-reasons { flex: 1 1 auto; min-height: 0; }
.wy-reasons-list { list-style: none; margin: 0; padding: 4px 2px 10px; display: grid; gap: 8px; }
.wy-reasons-list li { margin: 0; box-sizing: border-box; display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 10px; align-items: start; padding: 9px 14px 9px 10px; border-radius: 16px;
  background: var(--wy-card); box-shadow: 0 0 0 2px var(--vw-edge), 0 8px 16px -12px color-mix(in srgb, var(--wy-deep) 55%, transparent); text-align: left; animation: wy-li-in .4s cubic-bezier(.3,1.4,.5,1) both; }
.wy-reasons-n { display: grid; place-items: center; width: 26px; height: 26px; border-radius: 50%; color: #FFF6D8; font: 700 14px ${FONTS.ui};
  background: radial-gradient(circle at 35% 30%, var(--wy-sky-b), var(--wy-sky-a)); box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--vw-gold) 70%, transparent); }
.wy-reasons-t { font: 600 clamp(19px, 2.6dvh, 21px)/1.22 ${WY_HAND}; color: var(--vw-ink); overflow-wrap: anywhere; padding-top: 1px; }
@keyframes wy-li-in { from { opacity: 0; transform: translateY(10px) scale(.96) } to { opacity: 1; transform: none } }
@media (prefers-reduced-motion: reduce) { .wy-star.is-next svg, .wy-dust { animation: none; } .wy-sky-line { animation: none; stroke-dashoffset: 0; } .wy-sky-fill { animation: none; opacity: 1; } }
`;
