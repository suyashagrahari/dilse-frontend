"use client";

// Scenes 1–4: the incoming love call, how far apart we are, the countdown and
// the jar of things I miss. Each one is a single screen; its Next pill appears
// only once her moment is done (call answered, map folded, today crossed off,
// every note pulled out of the jar).

import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { motion } from "framer-motion";
import { burst, haptic, useReducedMotion } from "../../../_valentine/kit";
import { FONTS } from "../../../_valentine/theme";
import { Jar, RouteMap } from "./art";
import { MU_DISPLAY, MU_HAND } from "./fonts";
import { hourIn, timeIn } from "./geo";
import { useMu, useNext } from "./stage";
import { Head, MuScroll } from "./ui";

/** 0 → 1 over `ms` once `on` turns true (instantly with reduced motion). */
function useTween(on: boolean, ms: number, reduced: boolean): number {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!on || reduced) return;
    let raf = 0;
    const t0 = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / ms);
      setV(1 - Math.pow(1 - k, 3));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [on, ms, reduced]);
  return on && reduced ? 1 : v;
}

// ─── 1 · The incoming love call ─────────────────────────────────────────────

const DECLINE_LINES = ["can't decline, it's me 🥺", "nice try 😌", "the decline button is broken 🙈", "pick up na 🥹"];

export function Call({ sender, recipient, openingLine, sticker, onNext }: { sender: string; recipient: string; openingLine: string; sticker: ReactNode; onNext: () => void }) {
  const { cue } = useMu();
  const reduced = useReducedMotion();
  const [answered, setAnswered] = useState(false);
  const [secs, setSecs] = useState(0);
  const [nope, setNope] = useState(-1);
  const track = useRef<HTMLDivElement | null>(null);
  const [x, setX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const max = useRef(0);

  useEffect(() => {
    if (!answered) return;
    const t = window.setInterval(() => setSecs((s) => s + 1), 1000);
    return () => window.clearInterval(t);
  }, [answered]);

  const answer = () => {
    if (answered) return;
    setAnswered(true);
    setX(max.current);
    haptic(24);
    cue("chime-cascade", { gain: 0.6 });
    cue("kiss", { gain: 0.4, at: 0.3 });
    if (!reduced) window.setTimeout(() => burst({ kind: "hearts", origin: { x: 0.5, y: 0.4 }, count: 22, emojis: ["💗", "💞", "✨", "🥹"] }), 260);
  };

  const down = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (answered || !track.current) return;
    const tr = track.current.getBoundingClientRect();
    const knob = e.currentTarget.getBoundingClientRect();
    max.current = tr.width - knob.width - 8;
    const start = e.clientX - x;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    haptic(6);
    const el = e.currentTarget;
    const move = (ev: PointerEvent) => setX(Math.max(0, Math.min(max.current, ev.clientX - start)));
    const up = (ev: PointerEvent) => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      setDragging(false);
      const fx = Math.max(0, Math.min(max.current, ev.clientX - start));
      if (fx >= max.current * 0.8) answer();
      else if (fx < 6) {
        // A plain tap: show which way it slides, then settle back.
        setX(max.current * 0.32);
        window.setTimeout(() => setX(0), 380);
      } else setX(0);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
  };

  const key = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") {
      e.preventDefault();
      if (track.current) max.current = track.current.getBoundingClientRect().width - 72;
      answer();
    }
  };

  const decline = () => {
    haptic(8);
    cue("plush-squeak", { gain: 0.55 });
    setNope((n) => n + 1);
  };

  useNext(answered ? "I miss you too 🥹" : null, onNext, "call");
  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");

  return (
    <>
      <Head kicker={answered ? "Connected 💗" : `Psst, ${recipient}…`} title={answered ? <>Hi, {recipient} 🥹</> : <>Your phone is <em className="mu-em">ringing</em></>} />
      <div className="mu-fill">
        <div className={`mu-call mu-zoom${answered ? " is-on" : ""}`} data-mu-call={answered ? "answered" : "ringing"}>
          <div className="mu-call-ava">
            {!answered && !reduced && (
              <>
                <i className="mu-call-ring" />
                <i className="mu-call-ring is-b" />
              </>
            )}
            <span className="mu-call-ava-in">{sticker ?? <span className="mu-call-ava-emoji">📞</span>}</span>
          </div>
          <p className="mu-call-name">{sender} 💗</p>
          <p className="mu-call-state" aria-live="polite">
            {answered ? (
              <>
                <i className="mu-call-dot" /> {mm}:{ss}
              </>
            ) : (
              <>
                is calling you<span className="mu-call-dots" aria-hidden><i>.</i><i>.</i><i>.</i></span>
              </>
            )}
          </p>
          {answered ? (
            <motion.div className="mu-call-say" initial={reduced ? false : { opacity: 0, y: 10, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.25 }}>
              <span className="mu-call-wave" aria-hidden>
                {[0, 1, 2, 3, 4].map((k) => (
                  <i key={k} style={{ animationDelay: `${k * 0.12}s` }} />
                ))}
              </span>
              <p>“{openingLine}”</p>
            </motion.div>
          ) : (
            <div className="mu-call-ctl">
              <div className="mu-call-decline">
                <button type="button" onClick={decline} aria-label="Decline" className={nope >= 0 ? `is-nope-${nope % 2}` : undefined}>
                  ✕
                </button>
                <span className="mu-call-nope" aria-live="polite">
                  {nope >= 0 ? DECLINE_LINES[nope % DECLINE_LINES.length] : "decline"}
                </span>
              </div>
              <div ref={track} className="mu-slide" data-mu-slide>
                <span className="mu-slide-txt" style={{ opacity: Math.max(0, 1 - x / 120) }}>
                  slide to answer <b aria-hidden>›››</b>
                </span>
                <button
                  type="button"
                  className={`mu-slide-knob${dragging ? " is-drag" : ""}`}
                  style={{ transform: `translateX(${x}px)` }}
                  onPointerDown={down}
                  onKeyDown={key}
                  onClick={(e) => {
                    // A tap without a drag (or a screen reader) answers too — never a dead end.
                    if (e.detail === 0) answer();
                  }}
                  aria-label="Slide to answer the call"
                  data-mu-answer
                >
                  📞
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{CALL_CSS}</style>
    </>
  );
}

const CALL_CSS = `
.mu-call { position: relative; width: min(100%, 340px); box-sizing: border-box; padding: clamp(16px, 3dvh, 24px) 18px clamp(16px, 2.6dvh, 22px); border-radius: 34px; display: grid; justify-items: center; gap: clamp(4px, 1dvh, 8px);
  background: linear-gradient(180deg, color-mix(in srgb, var(--vw-paper) 92%, transparent), color-mix(in srgb, var(--vw-paper) 70%, transparent));
  box-shadow: 0 0 0 2px var(--vw-edge), 0 30px 50px -26px color-mix(in srgb, var(--mu-deep) 75%, transparent); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
.mu-call-ava { position: relative; width: clamp(108px, 19dvh, 150px); aspect-ratio: 1; display: grid; place-items: center; margin-bottom: 4px; }
.mu-call-ava-in { position: relative; z-index: 1; width: 100%; height: 100%; border-radius: 50%; overflow: hidden; background: #FFFFFF; display: grid; place-items: center;
  box-shadow: 0 0 0 4px var(--vw-accent), 0 0 0 9px color-mix(in srgb, var(--vw-accent) 25%, transparent), 0 14px 30px -12px color-mix(in srgb, var(--mu-deep) 70%, transparent); }
.mu-call-ava-in .mu-stk { transform: none; box-shadow: none; padding: 0; border-radius: 0; background: none; }
.mu-call-ava-in img { width: 112% !important; height: auto !important; border-radius: 0 !important; }
.mu-call-ava-emoji { font-size: 56px; }
.mu-call-ring { position: absolute; inset: 0; border-radius: 50%; border: 3px solid var(--vw-accent); animation: mu-callring 1.8s ease-out infinite; }
.mu-call-ring.is-b { animation-delay: .9s; }
@keyframes mu-callring { 0% { transform: scale(1); opacity: .8 } 100% { transform: scale(1.55); opacity: 0 } }
.mu-call-name { margin: 6px 0 0; font: 800 clamp(26px, 4.2dvh, 34px)/1.05 ${MU_DISPLAY}; color: var(--vw-ink); overflow-wrap: anywhere; }
.mu-call-state { margin: 0; font: 600 15px ${FONTS.ui}; color: var(--vw-ink-soft); display: inline-flex; align-items: center; gap: 6px; }
.mu-call-dot { width: 9px; height: 9px; border-radius: 50%; background: #3BD16F; box-shadow: 0 0 0 3px rgba(59,209,111,.25); }
.mu-call-dots i { font-style: normal; animation: mu-dots 1.2s infinite; }
.mu-call-dots i:nth-child(2) { animation-delay: .2s; } .mu-call-dots i:nth-child(3) { animation-delay: .4s; }
@keyframes mu-dots { 0%, 60%, 100% { opacity: .2 } 30% { opacity: 1 } }
.mu-call-ctl { width: 100%; display: grid; gap: 12px; margin-top: clamp(6px, 1.6dvh, 14px); }
.mu-call-decline { display: flex; align-items: center; justify-content: center; gap: 10px; min-height: 48px; }
.mu-call-decline button { width: 48px; height: 48px; flex: none; border-radius: 50%; border: 0; cursor: pointer; background: #FF5A6E; color: #FFF; font: 800 20px ${FONTS.ui}; box-shadow: 0 6px 14px -6px rgba(200,40,60,.7); touch-action: manipulation; }
.mu-call-decline button.is-nope-0 { animation: mu-no-a .45s ease-in-out; } .mu-call-decline button.is-nope-1 { animation: mu-no-b .45s ease-in-out; }
@keyframes mu-no-a { 0%,100% { transform: translateX(0) } 25% { transform: translateX(-8px) rotate(-10deg) } 60% { transform: translateX(6px) rotate(8deg) } }
@keyframes mu-no-b { 0%,100% { transform: translateX(0) } 25% { transform: translateX(8px) rotate(10deg) } 60% { transform: translateX(-6px) rotate(-8deg) } }
.mu-call-decline button:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 3px; }
.mu-call-nope { min-width: 0; font: 600 14px ${FONTS.ui}; color: var(--vw-ink-soft); text-align: left; max-width: 200px; }
.mu-slide { position: relative; text-align: left; height: 64px; border-radius: 99px; box-sizing: border-box; padding: 4px;
  background: linear-gradient(90deg, color-mix(in srgb, #3BD16F 30%, var(--vw-paper)), color-mix(in srgb, #3BD16F 14%, var(--vw-paper))); box-shadow: inset 0 0 0 2px color-mix(in srgb, #3BD16F 45%, transparent); }
.mu-slide-txt { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; gap: 6px; white-space: nowrap; padding-left: 52px; font: 700 16px ${FONTS.ui}; color: var(--vw-ink); pointer-events: none; }
.mu-slide-txt b { color: #1E9E50; letter-spacing: -2px; animation: mu-shim 1.4s ease-in-out infinite; display: inline-block; }
@keyframes mu-shim { 0%, 100% { transform: translateX(0); opacity: .5 } 50% { transform: translateX(5px); opacity: 1 } }
.mu-slide-knob { position: relative; z-index: 1; display: block; width: 56px; height: 56px; border-radius: 50%; border: 0; cursor: grab; font-size: 26px; line-height: 1; color: #FFF;
  background: radial-gradient(circle at 40% 35%, #6BE495, #22B455 70%); box-shadow: 0 6px 14px -4px rgba(20,120,60,.7), inset 0 2px 0 rgba(255,255,255,.4);
  touch-action: none; user-select: none; -webkit-user-select: none; transition: transform .35s cubic-bezier(.3,1.4,.5,1); animation: mu-knob 1.6s ease-in-out infinite; }
.mu-slide-knob.is-drag { transition: none; cursor: grabbing; animation: none; }
@keyframes mu-knob { 0%, 70%, 100% { rotate: 0deg } 75% { rotate: -14deg } 80% { rotate: 12deg } 85% { rotate: -8deg } }
.mu-slide-knob:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 3px; }
.mu-call-say { width: 100%; box-sizing: border-box; margin-top: clamp(6px, 1.4dvh, 12px); padding: 14px 16px 16px; border-radius: 22px; display: grid; gap: 8px; justify-items: center;
  background: color-mix(in srgb, var(--vw-accent) 14%, var(--vw-paper)); box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--vw-accent) 30%, transparent); }
.mu-call-say p { margin: 0; font: 700 clamp(22px, 3.4dvh, 27px)/1.2 ${MU_HAND}; color: var(--vw-ink); overflow-wrap: anywhere; }
.mu-call-wave { display: flex; gap: 4px; align-items: center; height: 22px; }
.mu-call-wave i { width: 5px; height: 100%; border-radius: 3px; background: var(--vw-accent); animation: mu-wv .9s ease-in-out infinite alternate; transform-origin: center; }
@keyframes mu-wv { from { transform: scaleY(.25) } to { transform: scaleY(1) } }
@media (prefers-reduced-motion: reduce) { .mu-call-ring, .mu-call-wave i, .mu-slide-knob, .mu-slide-txt b, .mu-call-dots i { animation: none !important; } }
`;

// ─── 2 · How far apart are we? ──────────────────────────────────────────────

export function Distance({ myCity, yourCity, km, zones, onNext }: { myCity: string; yourCity: string; km: number | null; zones: { a: string; b: string } | null; onNext: () => void }) {
  const { cue } = useMu();
  const reduced = useReducedMotion();
  const draw = useTween(true, 2000, reduced);
  const [folding, setFolding] = useState(false);
  const fold = useTween(folding, 1300, reduced);
  const folded = fold >= 1;
  const drawn = draw >= 1;
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 15000);
    return () => window.clearInterval(t);
  }, []);
  const shown = km === null ? null : Math.round(km * draw * (1 - fold));
  const announced = useRef(false);
  useEffect(() => {
    if (drawn && !announced.current) {
      announced.current = true;
      cue("glass-ping", { gain: 0.4 });
    }
  }, [drawn, cue]);
  useEffect(() => {
    if (folded) {
      haptic(20);
      cue("chime-cascade", { gain: 0.5 });
      if (!reduced) burst({ kind: "hearts", origin: { x: 0.5, y: 0.45 }, count: 18, emojis: ["💗", "💞", "✨"] });
    }
  }, [folded, cue, reduced]);

  const doFold = () => {
    if (folding) return;
    haptic(12);
    cue("paper-rustle", { gain: 0.6 });
    setFolding(true);
  };

  useNext(folded ? "Closer already 💗" : null, onNext, "plane");

  const title = folded ? (
    <>0 km in my heart 💗</>
  ) : shown === null ? (
    <>Too many kilometres apart</>
  ) : (
    <>
      <span className="mu-km">{shown.toLocaleString("en-IN")}</span> km apart
    </>
  );

  const clock = (zone: string, label: string) => {
    const h = hourIn(zone, now);
    const night = h < 6 || h >= 19;
    return (
      <span className="mu-clock">
        <i aria-hidden>{night ? "🌙" : "☀️"}</i>
        <span>
          <b>{timeIn(zone, now)}</b>
          <small>{label}</small>
        </span>
      </span>
    );
  };

  return (
    <>
      <Head kicker={folded ? "Fold the map and…" : "Right now, we're"} title={title} sub={folded ? "you're right here. Always." : `${myCity} ✈︎ ${yourCity}`} />
      <div className="mu-fill">
        <div className="mu-dist mu-zoom">
          <RouteMap from={myCity} to={yourCity} draw={draw} fold={fold} traveller={drawn ? null : "plane"} t={draw} />
        </div>
      </div>
      <div className="mu-dist-foot">
        {zones && !folded && (
          <div className="mu-clocks" aria-label="The time in both cities">
            {zones.a === zones.b ? (
              <span className="mu-clock is-same">
                <i aria-hidden>🌙</i>
                <span>
                  <b>Same sky, same moon</b>
                  <small>{timeIn(zones.a, now)} for both of us</small>
                </span>
              </span>
            ) : (
              <>
                {clock(zones.b, yourCity)}
                {clock(zones.a, myCity)}
              </>
            )}
          </div>
        )}
        {!folded && (
          <button type="button" className="mu-fold-btn" onClick={doFold} disabled={!drawn || folding} data-mu-fold>
            {folding ? "Folding…" : "Fold the map 🗺️"}
          </button>
        )}
      </div>
      <style>{DIST_CSS}</style>
    </>
  );
}

const DIST_CSS = `
.mu-dist { width: min(100%, 420px, calc(100cqh * 1.4)); }
.mu-km { color: var(--vw-accent); font-variant-numeric: tabular-nums; }
.mu-dist-foot { flex: none; width: 100%; max-width: 420px; display: grid; gap: 10px; justify-items: center; }
.mu-clocks { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }
.mu-clock { display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px 6px 8px; border-radius: 16px; background: var(--vw-paper); box-shadow: 0 0 0 1.5px var(--vw-edge); text-align: left; max-width: 190px; }
.mu-clock.is-same { max-width: 300px; }
.mu-clock i { font-style: normal; font-size: 20px; line-height: 1; }
.mu-clock b { display: block; font: 800 15px/1.15 ${MU_DISPLAY}; color: var(--vw-ink); }
.mu-clock small { display: block; font: 600 11.5px/1.2 ${FONTS.ui}; color: var(--vw-ink-soft); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px; }
.mu-clock.is-same small { max-width: 240px; }
.mu-fold-btn { min-height: 48px; padding: 0 22px; border-radius: 99px; cursor: pointer; font: 800 17px ${MU_DISPLAY}; color: var(--vw-accent-deep);
  border: 2.5px solid var(--vw-accent); background: var(--vw-paper); box-shadow: 0 4px 0 color-mix(in srgb, var(--vw-accent) 45%, transparent); transition: opacity .3s ease, transform .2s ease; touch-action: manipulation; }
.mu-fold-btn:not(:disabled) { animation: mu-pulse-btn 1.6s ease-in-out infinite; }
@keyframes mu-pulse-btn { 0%, 100% { transform: scale(1) } 50% { transform: scale(1.05) } }
.mu-fold-btn:disabled { opacity: .45; cursor: default; }
.mu-fold-btn:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 3px; }
:root .mu-fold-btn { color: var(--mu-kick); }
@media (prefers-reduced-motion: reduce) { .mu-fold-btn { animation: none !important; } }
`;

// ─── 3 · Days until I see you ───────────────────────────────────────────────

/** "YYYY-MM-DD" → local midnight, or null. */
export function parseMeet(v: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v.trim());
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

const DAY = 86400000;
const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export function Countdown({ meet, sticker, onNext }: { meet: Date | null; sticker: ReactNode; onNext: () => void }) {
  const { cue } = useMu();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(t);
  }, []);
  const [crossed, setCrossed] = useState(false);
  const today = startOf(now);
  const daysTo = meet ? Math.round((meet.getTime() - today.getTime()) / DAY) : null;
  const state: "future" | "today" | "none" = daysTo === null || daysTo < 0 ? "none" : daysTo === 0 ? "today" : "future";
  const left = meet ? Math.max(0, meet.getTime() - now.getTime()) : 0;
  const parts = [
    { v: Math.floor(left / DAY), l: "days" },
    { v: Math.floor((left % DAY) / 3600000), l: "hours" },
    { v: Math.floor((left % 3600000) / 60000), l: "mins" },
    { v: Math.floor((left % 60000) / 1000), l: "secs" },
  ];
  const meetLabel = meet ? meet.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }) : "";

  // The strip: today first, then the next days; the meet day gets a heart.
  const cells = useMemo(() => {
    const out: { key: string; top: string; num: string; kind: "today" | "day" | "gap" | "meet" }[] = [];
    const span = state === "future" && daysTo !== null && daysTo <= 6 ? daysTo : 4;
    for (let k = 0; k <= span; k++) {
      const d = new Date(today.getTime() + k * DAY);
      const isMeet = state === "future" && k === daysTo;
      out.push({ key: `d${k}`, top: d.toLocaleDateString("en-IN", { weekday: "short" }), num: String(d.getDate()), kind: k === 0 ? "today" : isMeet ? "meet" : "day" });
    }
    if (!(state === "future" && daysTo !== null && daysTo <= 6)) {
      out.push({ key: "gap", top: "", num: "…", kind: "gap" });
      out.push({
        key: "meet",
        top: meet && state === "future" ? meet.toLocaleDateString("en-IN", { month: "short" }) : "soon",
        num: meet && state === "future" ? String(meet.getDate()) : "?",
        kind: "meet",
      });
    }
    return out;
    // `today` changes identity every second; its date string is what matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, daysTo, meet, today.getTime()]);

  const cross = () => {
    if (crossed) return;
    setCrossed(true);
    haptic(18);
    cue("nib-scratch", { gain: 0.6 });
    cue("chime", { gain: 0.45, at: 0.45 });
  };
  useNext(crossed ? "One day closer 💗" : null, onNext, "clock");

  const title = state === "today" ? "It's TODAY!! 🥹" : state === "future" ? "Until I see you again" : "Days until I see you";
  const sub =
    state === "today" ? "No more counting. I'm coming to you." : state === "future" ? `${meetLabel} 💗 I'm counting every second.` : "Not sure when yet… but soon, I promise.";

  return (
    <>
      <Head kicker="Counting down" title={title} sub={sub} />
      <div className="mu-fill">
        <div className="mu-cd mu-zoom">
          <div className="mu-cd-gif">{sticker}</div>
          {state === "today" ? (
            <div className="mu-cd-today" aria-live="polite">
              0<small>days left</small>
            </div>
          ) : (
            <div className="mu-cd-tiles" role="timer" aria-label={state === "future" ? `${parts[0].v} days, ${parts[1].v} hours left` : "Soon"}>
              {parts.map((p, k) => (
                <div key={p.l} className={`mu-tile${k === 0 ? " is-days" : ""}`}>
                  <b>{state === "future" ? String(p.v).padStart(2, "0") : "??"}</b>
                  <span>{p.l}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="mu-cal" data-mu-cal>
        <div className="mu-cal-strip">
          {cells.map((c) =>
            c.kind === "today" ? (
              <button key={c.key} type="button" className={`mu-cal-cell is-today${crossed ? " is-crossed" : ""}`} onClick={cross} aria-label={crossed ? "Today, crossed off" : "Cross off today"} data-mu-today>
                <small>{c.top}</small>
                <b>{c.num}</b>
                <svg viewBox="0 0 40 40" className="mu-cal-x" aria-hidden>
                  <path d="M8 8 L32 32" pathLength={1} />
                  <path d="M32 8 L8 32" pathLength={1} />
                </svg>
              </button>
            ) : (
              <span key={c.key} className={`mu-cal-cell is-${c.kind}`} aria-hidden>
                <small>{c.top}</small>
                <b>{c.num}</b>
                {c.kind === "meet" && <i>💗</i>}
              </span>
            ),
          )}
        </div>
        <p className="mu-hint" aria-live="polite">
          {crossed ? "One less day without you 💗" : "Tap today to cross it off ✕"}
        </p>
      </div>
      <style>{CD_CSS}</style>
    </>
  );
}

const CD_CSS = `
.mu-cd { width: min(100%, 400px); display: grid; justify-items: center; gap: clamp(8px, 1.6dvh, 14px); }
.mu-cd-gif .mu-stk img { width: clamp(78px, 15dvh, 120px) !important; height: auto !important; }
.mu-cd-tiles { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; width: 100%; }
.mu-tile { position: relative; display: grid; gap: 2px; justify-items: center; padding: 10px 4px 8px; border-radius: 18px; background: var(--vw-paper); box-shadow: 0 0 0 2px var(--vw-edge), 0 10px 20px -14px color-mix(in srgb, var(--mu-deep) 70%, transparent); overflow: hidden; }
.mu-tile::after { content: ""; position: absolute; left: 0; right: 0; top: 50%; border-top: 1.5px solid color-mix(in srgb, var(--vw-ink) 10%, transparent); }
.mu-tile b { font: 800 clamp(28px, 5.4dvh, 42px)/1 ${MU_DISPLAY}; color: var(--vw-ink); font-variant-numeric: tabular-nums; padding-top: 4px; }
.mu-tile span { font: 700 11px ${FONTS.ui}; letter-spacing: .12em; text-transform: uppercase; color: var(--vw-ink-soft); }
.mu-tile.is-days { background: linear-gradient(180deg, color-mix(in srgb, var(--vw-accent) 75%, #FFF), var(--vw-accent)); box-shadow: 0 0 0 2px var(--vw-accent-deep), 0 10px 20px -12px color-mix(in srgb, var(--mu-deep) 70%, transparent); }
.mu-tile.is-days b, .mu-tile.is-days span { color: #FFFFFF; }
.mu-cd-today { font: 800 clamp(64px, 12dvh, 96px)/1 ${MU_DISPLAY}; color: var(--vw-accent); display: grid; justify-items: center; }
.mu-cd-today small { font: 700 13px ${FONTS.ui}; letter-spacing: .14em; text-transform: uppercase; color: var(--vw-ink-soft); }
.mu-cal { flex: none; width: 100%; max-width: 400px; display: grid; gap: 8px; justify-items: center; }
.mu-cal-strip { display: flex; gap: 6px; justify-content: center; width: 100%; }
.mu-cal-cell { position: relative; flex: 1 1 0; max-width: 52px; min-width: 0; height: 58px; box-sizing: border-box; border-radius: 14px; display: grid; align-content: center; justify-items: center; gap: 0;
  background: var(--vw-paper); box-shadow: 0 0 0 1.5px var(--vw-edge); color: var(--vw-ink); border: 0; padding: 0; }
.mu-cal-cell small { font: 700 10px ${FONTS.ui}; text-transform: uppercase; letter-spacing: .06em; color: var(--vw-ink-soft); min-height: 12px; }
.mu-cal-cell b { font: 800 19px/1.1 ${MU_DISPLAY}; }
.mu-cal-cell.is-gap { background: none; box-shadow: none; max-width: 22px; }
.mu-cal-cell.is-meet { box-shadow: 0 0 0 2px var(--vw-accent); }
.mu-cal-cell.is-meet i { position: absolute; top: -9px; right: -6px; font-style: normal; font-size: 16px; }
.mu-cal-cell.is-today { cursor: pointer; box-shadow: 0 0 0 2.5px var(--vw-accent), 0 6px 14px -8px color-mix(in srgb, var(--mu-deep) 70%, transparent); touch-action: manipulation; }
.mu-cal-cell.is-today:not(.is-crossed) { animation: mu-today 1.4s ease-in-out infinite; }
@keyframes mu-today { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-4px) } }
.mu-cal-cell.is-today:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 3px; }
.mu-cal-x { position: absolute; inset: 4px; width: calc(100% - 8px); height: calc(100% - 8px); pointer-events: none; }
.mu-cal-x path { fill: none; stroke: var(--vw-accent-deep); stroke-width: 4.5; stroke-linecap: round; stroke-dasharray: 1 1; stroke-dashoffset: 1; }
.mu-cal-cell.is-crossed .mu-cal-x path { animation: mu-x .28s ease-out forwards; }
.mu-cal-cell.is-crossed .mu-cal-x path:nth-child(2) { animation-delay: .26s; }
@keyframes mu-x { to { stroke-dashoffset: 0 } }
@media (min-width: 768px) { .mu-cal-cell { height: 64px; max-width: 58px; } }
@media (prefers-reduced-motion: reduce) { .mu-cal-cell.is-today { animation: none !important; } .mu-cal-x path { animation-duration: .01s !important; } }
`;

// ─── 4 · The jar of things I miss ───────────────────────────────────────────

export function MissJar({ things, sticker, onNext }: { things: readonly string[]; sticker: ReactNode; onNext: () => void }) {
  const { cue } = useMu();
  const reduced = useReducedMotion();
  const [pulled, setPulled] = useState(0);
  const [shake, setShake] = useState(0);
  const all = pulled >= things.length;
  const pull = () => {
    if (all) return;
    haptic(14);
    setShake((s) => s + 1);
    cue("glass-ping", { gain: 0.5, detune: pulled * 100 });
    cue("paper-rustle", { gain: 0.35, at: 0.12 });
    setPulled((p) => p + 1);
  };
  useEffect(() => {
    if (all && !reduced) cue("chime-cascade", { gain: 0.4, at: 0.3 });
  }, [all, reduced, cue]);
  useNext(all ? "I miss you too" : null, onNext, "heart");

  return (
    <>
      <Head
        kicker="Things I miss about you"
        title={all ? "Basically… everything" : pulled === 0 ? "Tap the jar 🫙" : "Another one?"}
        sub={all ? "And a hundred more that didn't fit in the jar." : pulled === 0 ? "Each glowing star is one little thing." : `${pulled} of ${things.length} · tap again`}
      />
      <div className="mu-fill">
        {all ? (
          <motion.div className="mu-list" initial={reduced ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 220, damping: 22 }}>
            <div className="mu-list-gif" aria-hidden>
              {sticker}
            </div>
            <MuScroll className="mu-list-scroll" label="Things I miss about you">
              <ol className="mu-list-ol">
                {things.map((r, k) => (
                  <li key={k} style={{ animationDelay: `${120 + k * 90}ms` }}>
                    <span className="mu-list-n" aria-hidden>
                      ★
                    </span>
                    <span className="mu-list-t">{r}</span>
                  </li>
                ))}
              </ol>
            </MuScroll>
          </motion.div>
        ) : (
          <div className="mu-jarwrap">
            <button type="button" className="mu-jar-btn" onClick={pull} aria-label={`Pull a note from the jar (${pulled} of ${things.length})`} data-mu-jar>
              <Jar left={things.length - pulled} total={things.length} shake={shake} />
            </button>
            <div className="mu-jar-gif" aria-hidden>
              {sticker}
            </div>
          </div>
        )}
      </div>
      {!all && (
        <div className="mu-note-slot" aria-live="polite">
          {pulled === 0 ? (
            <p className="mu-note-empty">✨ tap the jar ✨</p>
          ) : (
            <motion.p
              key={pulled}
              className="mu-note"
              initial={reduced ? false : { opacity: 0, y: -40, scale: 0.4, rotate: -8 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotate: pulled % 2 ? -1.5 : 1.5 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
            >
              {things[pulled - 1]}
            </motion.p>
          )}
        </div>
      )}
      <style>{JAR_CSS}</style>
    </>
  );
}

const JAR_CSS = `
.mu-jarwrap { position: relative; height: 100%; max-height: 100cqh; aspect-ratio: 200 / 240; max-width: min(64cqw, 260px); display: grid; place-items: center; }
.mu-jar-btn { width: 100%; border: 0; padding: 0; background: none; cursor: pointer; touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
.mu-jar-btn:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 6px; border-radius: 24px; }
.mu-jar-btn:active .mu-jar { transform: scale(.97); }
.mu-jar-gif { position: absolute; right: -34%; bottom: 2%; transform: rotate(8deg); pointer-events: none; }
.mu-jar-gif .mu-stk img { width: clamp(64px, 12dvh, 96px) !important; height: auto !important; }
.mu-note-slot { flex: none; min-height: clamp(76px, 12dvh, 100px); width: 100%; max-width: 400px; display: grid; place-items: center; }
.mu-note-empty { margin: 0; font: 700 16px ${MU_DISPLAY}; color: var(--vw-ink-soft); }
.mu-note { margin: 0; box-sizing: border-box; width: 100%; padding: 12px 18px; border-radius: 18px; background: #FFFDF6; color: #3B2E4A;
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--vw-gold) 70%, transparent), 0 0 24px -4px color-mix(in srgb, var(--vw-gold) 70%, transparent), 0 12px 22px -14px rgba(0,0,0,.4);
  font: 700 clamp(21px, 3.2dvh, 25px)/1.2 ${MU_HAND}; overflow-wrap: anywhere; }
.mu-list { width: min(100%, 400px); height: 100%; max-height: 100cqh; display: flex; flex-direction: column; align-items: stretch; gap: clamp(8px, 1.4dvh, 12px); min-height: 0; }
.mu-list-gif { flex: none; display: grid; place-items: center; padding-top: 4px; }
.mu-list-gif .mu-stk img { width: clamp(70px, 14dvh, 100px) !important; height: auto !important; }
.mu-list-scroll { flex: 1 1 auto; align-self: stretch; }
.mu-list-ol { list-style: none; margin: 0; padding: 4px 2px 10px; display: grid; gap: 9px; }
.mu-list-ol li { margin: 0; box-sizing: border-box; display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 10px; align-items: start; padding: 10px 14px 10px 10px; border-radius: 18px;
  background: var(--vw-paper); box-shadow: 0 0 0 2px var(--vw-edge), 0 8px 16px -12px color-mix(in srgb, var(--mu-deep) 55%, transparent); text-align: left; animation: mu-li-in .4s cubic-bezier(.3,1.4,.5,1) both; }
.mu-list-n { display: grid; place-items: center; width: 26px; height: 26px; border-radius: 50%; color: #FFFFFF; font: 800 14px ${FONTS.ui};
  background: radial-gradient(circle at 35% 30%, color-mix(in srgb, var(--vw-gold) 70%, #FFFFFF), var(--vw-gold) 60%, color-mix(in srgb, var(--vw-gold) 60%, var(--mu-deep))); text-shadow: 0 1px 0 color-mix(in srgb, var(--mu-deep) 50%, transparent); }
.mu-list-t { font: 700 clamp(19px, 2.7dvh, 22px)/1.2 ${MU_HAND}; color: var(--vw-ink); overflow-wrap: anywhere; padding-top: 1px; }
@keyframes mu-li-in { from { opacity: 0; transform: translateY(10px) scale(.96) } to { opacity: 1; transform: none } }
@media (max-width: 420px) { .mu-jar-gif { right: -24%; } }
`;
