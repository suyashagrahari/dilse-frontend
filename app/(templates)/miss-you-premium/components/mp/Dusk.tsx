"use client";

// Sunset to dusk: 7 · tap along until our two heartbeats sync (the phone
// buzzes with it), 8 · join the stars into our initials on a lilac dusk sky —
// every line lights one "thing I miss about you".

import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { burst, haptic, useReducedMotion } from "../../../_valentine/kit";
import { FONTS } from "../../../_valentine/theme";
import { MP_DISPLAY, MP_HAND } from "./fonts";
import { useMp, useNext } from "./stage";
import { Head, Hint, MpScroll } from "./ui";

// ─── 7 · Our heartbeats, in sync ────────────────────────────────────────────

const BEAT = 900;
const WINDOW = 230;
const NEED = 6;
const MERCY = 12;

function HeartShape({ fill, size = "100%" }: { fill: string; size?: string | number }) {
  return (
    <svg viewBox="0 0 100 92" width={size} height={size} aria-hidden>
      <path d="M50 90 C18 68 2 50 4 30 C6 10 32 4 50 24 C68 4 94 10 96 30 C98 50 82 68 50 90 Z" fill={fill} />
      <path d="M24 26 C28 18 36 16 42 20" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" fill="none" opacity=".7" />
    </svg>
  );
}

export function Heartbeat({ recipient, sender, heartLine, sticker, onNext }: { recipient: string; sender: string; heartLine: string; sticker: ReactNode; onNext: () => void }) {
  const { cue } = useMp();
  const reduced = useReducedMotion();
  const t0 = useRef(0);
  const [beat, setBeat] = useState(0);
  const [mine, setMine] = useState(0);
  const [good, setGood] = useState(0);
  const [taps, setTaps] = useState(0);
  const [miss, setMiss] = useState(0);
  const synced = good >= NEED || taps >= MERCY;
  const syncedRef = useRef(false);

  useEffect(() => {
    t0.current = performance.now();
    let n = 0;
    const id = window.setInterval(() => {
      n += 1;
      setBeat(n);
      if (syncedRef.current) {
        if (n % 2 === 0 && n < 40) haptic([18, 90, 14]);
      } else {
        cue("heartbeat", { gain: 0.22 });
      }
    }, BEAT);
    return () => window.clearInterval(id);
  }, [cue]);

  useEffect(() => {
    if (!synced || syncedRef.current) return;
    syncedRef.current = true;
    haptic([30, 80, 30, 200, 30, 80, 30]);
    cue("heartbeat", { gain: 0.6, count: 2 });
    cue("chime-cascade", { gain: 0.6, at: 0.4 });
    if (!reduced) {
      burst({ kind: "hearts", emojis: ["💓", "💗", "💞", "✨"], origin: { x: 0.5, y: 0.42 }, count: 30 });
    }
  }, [synced, cue, reduced]);

  const tap = () => {
    if (synced) return;
    const ph = ((performance.now() - t0.current) % BEAT) / BEAT;
    const off = Math.min(ph, 1 - ph) * BEAT;
    setMine((m) => m + 1);
    setTaps((t) => t + 1);
    if (off <= WINDOW) {
      setGood((g) => g + 1);
      haptic(22);
      cue("pop", { gain: 0.35, detune: good * 70 });
    } else {
      setMiss((m) => m + 1);
      haptic(6);
    }
  };

  useNext(synced ? "Same heartbeat" : null, onNext, "star");
  const pct = Math.min(1, synced ? 1 : good / NEED);
  return (
    <>
      <style>{HB_CSS}</style>
      <Head kicker="Sunset, wherever you are" title={synced ? "We're in sync 💓" : "Tap along with my heartbeat"} sub={synced ? undefined : `Every time ${sender}'s heart beats, tap the button`} />
      <div className="mp-fill">
        <div className={`mp-hb mp-zoom${synced ? " is-synced" : ""}`}>
          <div className="mp-hb-stage">
            <svg className="mp-hb-ecg" viewBox="0 0 300 60" preserveAspectRatio="none" aria-hidden>
              <polyline points="0,30 70,30 82,30 90,10 100,50 108,22 116,30 190,30 202,30 210,10 220,50 228,22 236,30 300,30" fill="none" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
            </svg>
            <div className="mp-hb-heart is-you" style={{ ["--k" as string]: reduced ? "0" : "1" }}>
              <span key={`m${mine}`} className="mp-hb-beat">
                <HeartShape fill="var(--vw-accent)" />
              </span>
              <b>{recipient}</b>
            </div>
            <div className="mp-hb-heart is-me" style={{ ["--k" as string]: reduced ? "0" : "1" }}>
              <span key={`b${beat}`} className="mp-hb-beat">
                <HeartShape fill="var(--mp-pop)" />
              </span>
              <b>{sender}</b>
            </div>
            <AnimatePresence>
              {synced && (
                <motion.div className="mp-hb-one" initial={reduced ? false : { scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 12, delay: reduced ? 0 : 0.35 }}>
                  <span key={`o${beat}`} className="mp-hb-beat">
                    <HeartShape fill="url(#mpHbG)" />
                  </span>
                  <svg width="0" height="0" aria-hidden>
                    <defs>
                      <linearGradient id="mpHbG" x1="0" x2="1">
                        <stop offset=".45" stopColor="var(--vw-accent)" />
                        <stop offset=".55" stopColor="var(--mp-pop)" />
                      </linearGradient>
                    </defs>
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="mp-hb-low">
            {synced ? (
              <motion.div className="mp-hb-card" initial={reduced ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduced ? 0 : 0.6 }}>
                {sticker && <span className="mp-hb-gif">{sticker}</span>}
                <p>{heartLine}</p>
              </motion.div>
            ) : (
              <>
                <div className="mp-hb-meter" role="progressbar" aria-valuemin={0} aria-valuemax={NEED} aria-valuenow={good} aria-label="How in sync you are">
                  <span style={{ width: `${pct * 100}%` }} />
                </div>
                <p className="mp-hb-say" aria-live="polite">
                  {good === 0 && taps === 0 ? "Wait for the blue heart to thump… then tap" : miss > 0 && taps > 0 && good < NEED / 2 ? "Close! Tap right when it thumps 💓" : `${good} of ${NEED} beats together`}
                </p>
                <button type="button" className="mp-hb-btn" onPointerDown={(e) => { e.preventDefault(); tap(); }} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); tap(); } }} data-mp-beat-btn>
                  <span aria-hidden>💓</span> Tap with my heart
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      <Hint show={!synced}>Tap each time the heart thumps</Hint>
    </>
  );
}

const HB_CSS = `
.mp-hb { width: min(100%, 420px); height: 100%; display: grid; grid-template-rows: minmax(0, 1fr) auto; gap: 12px; }
.mp-hb-stage { position: relative; display: grid; grid-template-columns: 1fr 1fr; align-items: center; justify-items: center; min-height: 0; }
.mp-hb-ecg { position: absolute; left: 6%; right: 6%; bottom: 2%; height: 48px; width: 88%; opacity: .6; transition: opacity .4s ease; }
.mp-hb.is-synced .mp-hb-ecg { opacity: 0; }
.mp-hb-ecg polyline { stroke: var(--vw-accent-deep); stroke-dasharray: 520; stroke-dashoffset: 520; animation: mp-ecg 1.8s linear infinite; }
@keyframes mp-ecg { to { stroke-dashoffset: 0 } }
.mp-hb-heart { position: relative; z-index: 1; display: grid; justify-items: center; gap: 6px; width: min(36cqw, 46cqh, 150px); transition: transform 1s cubic-bezier(.4,1.4,.5,1), opacity .6s ease .4s; }
.mp-hb-heart b { font: 800 clamp(15px, 2.2dvh, 18px)/1.1 ${MP_DISPLAY}; color: var(--vw-ink); max-width: 100%; text-align: center; text-wrap: balance; overflow-wrap: break-word; }
.mp-hb-beat { display: block; width: 100%; filter: drop-shadow(0 10px 14px color-mix(in srgb, var(--mp-deep) 35%, transparent)); animation: mp-thud .5s cubic-bezier(.3,1.8,.5,1) both; }
@keyframes mp-thud { 0% { transform: scale(calc(1 + .16 * var(--k, 1))); opacity: calc(1 - .25 * (1 - var(--k, 1))) } 100% { transform: scale(1); opacity: 1 } }
.mp-hb.is-synced .mp-hb-heart.is-you { transform: translateX(42%) scale(.8); opacity: 0; }
.mp-hb.is-synced .mp-hb-heart.is-me { transform: translateX(-42%) scale(.8); opacity: 0; }
.mp-hb-one { position: absolute; left: 50%; top: 50%; width: min(52cqw, 62cqh, 210px); translate: -50% -55%; z-index: 2; }
.mp-hb-low { display: grid; gap: 10px; justify-items: center; }
.mp-hb-meter { width: min(100%, 300px); height: 14px; border-radius: 99px; background: color-mix(in srgb, var(--vw-paper) 80%, transparent); box-shadow: inset 0 0 0 2px var(--vw-edge); overflow: hidden; }
.mp-hb-meter span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--vw-accent), var(--mp-pop)); transition: width .3s ease; }
.mp-hb-say { margin: 0; min-height: 22px; font: 600 clamp(14px, 2dvh, 16px) ${FONTS.ui}; color: var(--vw-ink-soft); }
.mp-hb-btn { min-height: 60px; padding: 0 26px; border: 0; border-radius: 999px; cursor: pointer; touch-action: manipulation; font: 800 19px ${MP_DISPLAY}; color: #FFFFFF;
  background: linear-gradient(180deg, color-mix(in srgb, var(--vw-accent) 70%, #FFFFFF), var(--vw-accent) 55%, var(--vw-accent-deep)); box-shadow: 0 5px 0 var(--mp-deep), 0 0 0 4px #FFFFFF, 0 16px 30px -12px color-mix(in srgb, var(--mp-deep) 70%, transparent); }
.mp-hb-btn:active { transform: translateY(4px) scale(.97); box-shadow: 0 1px 0 var(--mp-deep), 0 0 0 4px #FFFFFF; }
.mp-hb-btn:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 6px; }
.mp-hb-card { position: relative; width: min(100%, 380px); box-sizing: border-box; padding: 16px 18px 16px 18px; border-radius: 22px; background: #FFFFFF; box-shadow: 0 0 0 2px var(--vw-edge), 0 16px 28px -16px color-mix(in srgb, var(--mp-deep) 60%, transparent); }
.mp-hb-card p { margin: 0; font: 400 clamp(19px, 2.8dvh, 23px)/1.35 ${MP_HAND}; color: var(--vw-ink); overflow-wrap: anywhere; }
.mp-hb-gif { position: absolute; right: -10px; top: -78px; transform: rotate(6deg); }
/* Landscape phones: hearts on the left, the button and meter beside them. */
@media (orientation: landscape) and (max-height: 500px) {
  .mp-hb { width: 100%; grid-template-columns: minmax(0, 1fr) minmax(0, 190px); grid-template-rows: minmax(0, 1fr); align-items: center; }
  .mp-hb-btn { min-height: 56px; padding: 0 18px; font-size: 17px; }
  .mp-hb-heart { width: min(24cqw, 52cqh, 130px); }
}
@media (prefers-reduced-motion: reduce) { .mp-hb-ecg polyline { animation: none; stroke-dashoffset: 0; } .mp-hb-heart { transition-duration: .01s; } }
`;

// ─── 8 · Join the stars into our initials ───────────────────────────────────

type Pt = readonly [number, number];
const L: Record<string, readonly (readonly Pt[])[]> = {
  A: [[[0, 6], [2, 0], [4, 6]], [[1, 3.6], [3, 3.6]]],
  B: [[[0, 6], [0, 0], [3, 0.4], [3.4, 2.4], [0, 3], [3.8, 3.8], [3.4, 5.7], [0, 6]]],
  C: [[[4, 0.8], [2, 0], [0, 2], [0, 4.2], [2, 6], [4, 5.2]]],
  D: [[[0, 0], [0, 6], [3, 5.4], [4, 3], [3, 0.6], [0, 0]]],
  E: [[[4, 0], [0, 0], [0, 6], [4, 6]], [[0, 3], [3, 3]]],
  F: [[[4, 0], [0, 0], [0, 6]], [[0, 3], [3, 3]]],
  G: [[[4, 0.8], [2, 0], [0, 2.4], [0.6, 5], [2.4, 6], [4, 5], [4, 3.4], [2.4, 3.4]]],
  H: [[[0, 0], [0, 6]], [[4, 0], [4, 6]], [[0, 3], [4, 3]]],
  I: [[[1, 0], [3, 0]], [[2, 0], [2, 6]], [[1, 6], [3, 6]]],
  J: [[[1, 0], [4, 0]], [[3, 0], [3, 4.8], [2, 6], [0.6, 5.2]]],
  K: [[[0, 0], [0, 6]], [[4, 0], [0, 3.4], [4, 6]]],
  L: [[[0, 0], [0, 6], [4, 6]]],
  M: [[[0, 6], [0, 0], [2, 3], [4, 0], [4, 6]]],
  N: [[[0, 6], [0, 0], [4, 6], [4, 0]]],
  O: [[[2, 0], [0, 1.6], [0, 4.4], [2, 6], [4, 4.4], [4, 1.6], [2, 0]]],
  P: [[[0, 6], [0, 0], [3.4, 0.4], [3.8, 2.2], [3, 3.2], [0, 3.2]]],
  Q: [[[2, 0], [0, 1.6], [0, 4.4], [2, 6], [4, 4.4], [4, 1.6], [2, 0]], [[2.6, 4.4], [4.2, 6.2]]],
  R: [[[0, 6], [0, 0], [3.4, 0.4], [3.8, 2.2], [3, 3.2], [0, 3.2], [4, 6]]],
  S: [[[4, 0.8], [2, 0], [0, 1.4], [1, 2.8], [3, 3.2], [4, 4.6], [2, 6], [0, 5.2]]],
  T: [[[0, 0], [4, 0]], [[2, 0], [2, 6]]],
  U: [[[0, 0], [0, 4.6], [2, 6], [4, 4.6], [4, 0]]],
  V: [[[0, 0], [2, 6], [4, 0]]],
  W: [[[0, 0], [1, 6], [2, 2.6], [3, 6], [4, 0]]],
  X: [[[0, 0], [4, 6]], [[4, 0], [0, 6]]],
  Y: [[[0, 0], [2, 3]], [[4, 0], [2, 3], [2, 6]]],
  Z: [[[0, 0], [4, 0], [0, 6], [4, 6]]],
  "♥": [[[2, 6], [0, 3], [0, 1.2], [1, 0], [2, 1], [3, 0], [4, 1.2], [4, 3], [2, 6]]],
};

interface Star {
  x: number;
  y: number;
}
interface Step {
  star: number;
  connect: boolean;
}

/** Two letters side by side (left at x 0, right at x 7) → unique stars + the order to join them. */
function buildSky(a: string, b: string): { stars: Star[]; steps: Step[] } {
  const stars: Star[] = [];
  const steps: Step[] = [];
  const idx = (x: number, y: number) => {
    const k = stars.findIndex((s) => Math.abs(s.x - x) < 0.01 && Math.abs(s.y - y) < 0.01);
    if (k >= 0) return k;
    stars.push({ x, y });
    return stars.length - 1;
  };
  [a, b].forEach((ch, li) => {
    const dx = li * 7;
    for (const stroke of L[ch]) {
      stroke.forEach(([x, y], k) => steps.push({ star: idx(x + dx, y), connect: k > 0 }));
    }
  });
  return { stars, steps };
}

export function Constellation({ a, b, things, sticker, onNext }: { a: string; b: string; things: readonly string[]; sticker: ReactNode; onNext: () => void }) {
  const { cue } = useMp();
  const reduced = useReducedMotion();
  const svg = useRef<SVGSVGElement | null>(null);
  const { stars, steps } = useMemo(() => buildSky(a, b), [a, b]);
  const [at, setAt] = useState(1);
  const [pen, setPen] = useState<{ x: number; y: number } | null>(null);
  const down = useRef(false);
  const done = at >= steps.length;
  const segs = steps.filter((s) => s.connect).length;
  const segsDone = steps.slice(0, at).filter((s) => s.connect).length;
  const lit = useMemo(() => {
    const T = Math.max(1, things.length);
    return things.filter((_, i) => segsDone >= Math.ceil(((i + 1) * segs) / T) || done).length;
  }, [things, segs, segsDone, done]);
  const prevLit = useRef(0);

  useEffect(() => {
    if (lit > prevLit.current) {
      cue("sparkle", { gain: 0.45 });
      haptic(12);
    }
    prevLit.current = lit;
  }, [lit, cue]);

  useEffect(() => {
    if (!done) return;
    cue("chime-cascade", { gain: 0.7 });
    haptic([20, 60, 20, 60, 40]);
    if (!reduced) burst({ kind: "sparkles", origin: { x: 0.5, y: 0.32 }, count: 34, spread: 0.55 });
  }, [done, cue, reduced]);

  const toSvg = (e: { clientX: number; clientY: number }) => {
    const el = svg.current;
    if (!el) return null;
    const m = el.getScreenCTM();
    if (!m) return null;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  };
  const tryHit = (p: { x: number; y: number }, r: number) => {
    if (done) return;
    const s = stars[steps[at].star];
    if (Math.hypot(s.x - p.x, s.y - p.y) <= r) {
      cue("glass-ping", { gain: 0.35, detune: (at % 8) * 90 });
      haptic(8);
      setAt((v) => v + 1);
    }
  };
  const onDown = (e: ReactPointerEvent<SVGSVGElement>) => {
    down.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = toSvg(e);
    if (p) {
      setPen(p);
      tryHit(p, 1.1);
    }
  };
  const onMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (!down.current) return;
    const p = toSvg(e);
    if (p) {
      setPen(p);
      tryHit(p, 0.8);
    }
  };
  const onUp = () => {
    down.current = false;
    setPen(null);
  };
  const keyNext = () => {
    if (done) return;
    cue("glass-ping", { gain: 0.35, detune: (at % 8) * 90 });
    setAt((v) => v + 1);
  };

  const lines: { x1: number; y1: number; x2: number; y2: number; k: number }[] = [];
  for (let k = 1; k < at; k++) {
    if (!steps[k].connect) continue;
    const p = stars[steps[k - 1].star];
    const q = stars[steps[k].star];
    lines.push({ x1: p.x, y1: p.y, x2: q.x, y2: q.y, k });
  }
  const litStars = new Set(steps.slice(0, at).map((s) => s.star));
  const target = !done ? stars[steps[at].star] : null;
  const from = at > 0 && !done && steps[at].connect ? stars[steps[at - 1].star] : null;

  useNext(done ? "Same sky ✨" : null, onNext, "phone");
  return (
    <>
      <style>{STAR_CSS}</style>
      <Head kicker="Dusk, same sky" title={done ? `${a} ♥ ${b}, written in the stars` : "Join the stars"} sub={done ? undefined : `Things I miss about you: ${lit} of ${things.length}`} />
      <div className="mp-fill">
        <div className="mp-cons mp-zoom">
          <div className={`mp-cons-sky${done ? " is-done" : ""}`}>
            <span className="mp-cons-moon" aria-hidden />
            <svg
              ref={svg}
              className="mp-cons-svg"
              viewBox="-1.2 -1.2 13.4 8.4"
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
              role="application"
              aria-label={`Constellation: join the stars to draw ${a} and ${b}`}
              data-mp-sky
            >
              {lines.map((l) => (
                <line key={l.k} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} className="mp-cons-line" />
              ))}
              {from && pen && <line x1={from.x} y1={from.y} x2={pen.x} y2={pen.y} className="mp-cons-pen" />}
              <g className={`mp-cons-heart${done ? " is-on" : ""}`} transform="translate(5.5 3.1) scale(.11)">
                <path d="M0 9 C-5 5 -9 2 -9 -2 C-9 -6 -4 -8 0 -4 C4 -8 9 -6 9 -2 C9 2 5 5 0 9 Z" />
              </g>
              {stars.map((s, k) => {
                const isOn = litStars.has(k);
                const isTarget = target === s;
                return (
                  <g key={k} transform={`translate(${s.x} ${s.y})`} className={`mp-star${isOn ? " is-on" : ""}${isTarget ? " is-next" : ""}`} data-mp-star={isTarget ? "next" : undefined}>
                    {isTarget && <circle r="0.62" className="mp-star-ring" />}
                    <path d="M0 -0.42 L0.11 -0.11 L0.42 0 L0.11 0.11 L0 0.42 L-0.11 0.11 L-0.42 0 L-0.11 -0.11 Z" />
                  </g>
                );
              })}
            </svg>
            {done && sticker && (
              <motion.span className="mp-cons-gif" initial={reduced ? false : { y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: reduced ? 0 : 0.5, type: "spring", stiffness: 200, damping: 14 }}>
                {sticker}
              </motion.span>
            )}
            <button type="button" className="vw-sr" onClick={keyNext} disabled={done}>
              Join the next star
            </button>
          </div>
          <div className="mp-cons-list">
            <MpScroll label="Things I miss about you">
              <ol className="mp-miss">
                {things.map((t, i) => (
                  <li key={i} className={i < lit ? "is-lit" : undefined} aria-hidden={i >= lit}>
                    <span className="mp-miss-star" aria-hidden>
                      {i < lit ? "✦" : "·"}
                    </span>
                    <span className="mp-miss-t">{i < lit ? t : "…"}</span>
                  </li>
                ))}
              </ol>
            </MpScroll>
          </div>
        </div>
      </div>
      <Hint show={!done}>Drag from star to star ✨</Hint>
    </>
  );
}

const STAR_CSS = `
.mp-cons { width: min(100%, 460px); height: 100%; display: grid; grid-template-rows: minmax(0, 1.3fr) minmax(0, 1fr); gap: 12px; }
.mp-cons-sky { position: relative; min-height: 0; border-radius: 26px; overflow: visible; display: grid; place-items: center;
  background: linear-gradient(180deg, #CFC3F3 0%, #DCCFF6 45%, #F6D3E6 100%); box-shadow: inset 0 0 0 2px rgba(255,255,255,.6), 0 18px 32px -20px color-mix(in srgb, var(--mp-deep) 60%, transparent); }
.mp-cons-moon { position: absolute; right: 7%; top: 9%; width: 28px; height: 28px; border-radius: 50%; box-shadow: inset -8px -3px 0 0 #FFFFFF; opacity: .95; transform: rotate(-20deg); }
.mp-cons-svg { position: absolute; inset: 8px; width: calc(100% - 16px); height: calc(100% - 16px); touch-action: none; cursor: crosshair; overflow: visible; }
.mp-cons-line { stroke: #FFFFFF; stroke-width: .13; stroke-linecap: round; filter: drop-shadow(0 0 .18px #FFF6C8); }
.mp-cons-sky.is-done .mp-cons-line { stroke: #FFFBE6; animation: mp-glow 1.6s ease-in-out infinite alternate; }
@keyframes mp-glow { from { stroke-width: .13 } to { stroke-width: .2 } }
.mp-cons-pen { stroke: rgba(255,255,255,.75); stroke-width: .09; stroke-dasharray: .2 .2; stroke-linecap: round; }
.mp-star path { fill: #FFFFFF; stroke: color-mix(in srgb, var(--mp-deep) 35%, transparent); stroke-width: .04; transform: scale(.9); transition: transform .3s cubic-bezier(.3,1.8,.5,1), fill .3s ease; }
.mp-star.is-on path { fill: #FFF8D6; transform: scale(1.25); filter: drop-shadow(0 0 .25px #FFFFFF); }
.mp-star.is-next path { fill: #FFFFFF; transform: scale(1.5); }
.mp-star-ring { fill: none; stroke: var(--vw-accent-deep); stroke-width: .07; animation: mp-ringpulse 1.2s ease-out infinite; transform-origin: 0 0; }
@keyframes mp-ringpulse { 0% { transform: scale(.6); opacity: 1 } 100% { transform: scale(1.5); opacity: 0 } }
.mp-cons-heart path { fill: rgba(255,255,255,.35); transition: fill .6s ease; }
.mp-cons-heart.is-on path { fill: var(--vw-accent); }
.mp-cons-gif { position: absolute; right: -8px; top: -26px; transform: rotate(6deg); z-index: 3; pointer-events: none; }
@media (max-width: 599px), (max-height: 700px) { .mp-cons-gif { right: -10px; top: -16px; } .mp-cons-gif .mp-stk img { width: clamp(50px, 9dvh, 70px) !important; height: auto !important; } }
.mp-cons-sky.is-done .mp-cons-moon { opacity: 0; }
.mp-cons-list { min-height: 0; display: grid; }
.mp-miss { list-style: none; margin: 0; padding: 2px 0 8px; display: grid; gap: 8px; text-align: left; }
.mp-miss li { display: flex; gap: 10px; align-items: flex-start; padding: 9px 12px; border-radius: 16px; background: color-mix(in srgb, var(--vw-paper) 60%, transparent); box-shadow: inset 0 0 0 1.5px var(--vw-edge); transition: background .4s ease, box-shadow .4s ease; }
.mp-miss li.is-lit { background: #FFFFFF; box-shadow: 0 0 0 2px var(--vw-edge), 0 8px 16px -12px color-mix(in srgb, var(--mp-deep) 60%, transparent); animation: mp-litin .5s cubic-bezier(.3,1.5,.5,1); }
@keyframes mp-litin { from { transform: scale(.94); opacity: .4 } to { transform: scale(1); opacity: 1 } }
.mp-miss-star { flex: none; width: 20px; font: 800 17px/1.3 ${FONTS.ui}; color: var(--vw-accent-deep); text-align: center; }
.mp-miss-t { font: 400 clamp(16px, 2.3dvh, 19px)/1.3 ${MP_HAND}; color: var(--vw-ink); overflow-wrap: anywhere; }
.mp-miss li:not(.is-lit) .mp-miss-t { color: var(--vw-ink-soft); }
@media (prefers-reduced-motion: reduce) { .mp-star-ring, .mp-cons-line, .mp-miss li.is-lit { animation: none !important; } }
`;
