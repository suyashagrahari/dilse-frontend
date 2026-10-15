"use client";

// The first act: the lock (optional), the opening titles, two lives one path,
// and the time machine.
//
//   • Lock — "unlock with our date" (a pearl keypad: DD MM of the anniversary)
//     or a countdown that keeps the book sealed until the day.
//   • Titles — the screen is out of focus like a film's first frame; she drags
//     the lens ring and their names sharpen, then the credits roll.
//   • Paths — two dotted trails start at opposite corners; she traces hers with
//     a finger and both draw towards the point where they met.
//   • Time machine — a ring of years; she spins it and the window in the
//     middle morphs into that chapter's season, photo and line.

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useMotionValueEvent } from "framer-motion";
import { CroppedPhoto, burst, haptic, useReducedMotion } from "../../../_valentine/kit";
import { ANNI_SEASONS, type AnniChapter, type AnniSeason } from "../../../_valentine/days/anniversary-premium";
import type { LovePhoto } from "../../../_valentine/types";
import { AP_HAND, AP_SANS, AP_SCRIPT, AP_SERIF } from "./fonts";
import { useAp, useNext } from "./stage";
import { Head, Hint, ordinal, prettyDay, type Together } from "./ui";

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

// ─── 0 · The lock ───────────────────────────────────────────────────────────

export function PassLock({ code, hint, recipient, preview, onOpen }: { code: string; hint: string; recipient: string; preview: boolean; onOpen: () => void }) {
  const { cue } = useAp();
  const reduced = useReducedMotion();
  const [entry, setEntry] = useState("");
  const [wrong, setWrong] = useState(0);
  const [shake, setShake] = useState(0);
  const [open, setOpen] = useState(false);
  useNext(open ? "Open our book" : null, onOpen, "book");
  const month = useMemo(() => new Date(2000, Number(code.slice(2)) - 1, 1).toLocaleDateString("en-IN", { month: "long" }), [code]);

  const press = (d: string) => {
    if (open) return;
    haptic(8);
    cue("tick", { gain: 0.5, detune: entry.length * 90 });
    const nextEntry = (entry + d).slice(0, 4);
    setEntry(nextEntry);
    if (nextEntry.length === 4) {
      window.setTimeout(() => {
        if (nextEntry === code) {
          setOpen(true);
          haptic([20, 40, 30]);
          cue("key", { gain: 0.7 });
          cue("chime-cascade", { gain: 0.55, at: 0.25 });
          if (!reduced) burst({ kind: "sparkles", origin: { x: 0.5, y: 0.42 }, count: 30 });
        } else {
          setWrong((w) => w + 1);
          setShake((s) => s + 1);
          haptic([30, 30, 30]);
          cue("snap", { gain: 0.4 });
          setEntry("");
        }
      }, 180);
    }
  };
  const back = () => setEntry((e) => e.slice(0, -1));

  useEffect(() => {
    if (open) return;
    const onKey = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) press(e.key);
      else if (e.key === "Backspace") back();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const slots = ["D", "D", "M", "M"];
  return (
    <>
      <Head kicker={`For ${recipient}, sealed with love`} title={open ? <>It&apos;s <em>you</em>. Come in.</> : <>Unlock with <em>our date</em></>} sub={open ? undefined : hint || "The day it all began: day and month."} />
      <div className="ap-fill">
        <div className={`ap-lock${open ? " is-open" : ""}`}>
          <div className="ap-clasp" aria-hidden>
            <span className="ap-clasp-l" />
            <span className="ap-clasp-r" />
            <span className="ap-clasp-heart">{open ? "💗" : "🔒"}</span>
          </div>
          <div key={shake} className={`ap-code${shake ? " is-shake" : ""}`} aria-live="polite" aria-label={`${entry.length} of 4 digits entered`}>
            {slots.map((s, k) => (
              <span key={k} className={`ap-code-slot${entry[k] ? " is-on" : ""}${k === 2 ? " is-gap" : ""}`}>
                {entry[k] ?? <i>{s}</i>}
              </span>
            ))}
          </div>
          {!open && (
            <div className="ap-keys" role="group" aria-label="Keypad">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
                <button key={d} type="button" className="ap-key" onClick={() => press(d)} data-ap-key={d}>
                  {d}
                </button>
              ))}
              <button type="button" className="ap-key is-soft" onClick={back} aria-label="Delete a digit">
                ⌫
              </button>
              <button type="button" className="ap-key" onClick={() => press("0")} data-ap-key="0">
                0
              </button>
              <span />
            </div>
          )}
        </div>
      </div>
      <div className="ap-foot">
        {!open && wrong > 0 && <p className="ap-lock-note">{wrong >= 3 ? `Not quite. A little hint: it's in ${month} 🤍` : "Not quite… try again 🤍"}</p>}
        {!open && preview && (
          <button type="button" className="ap-ghost" onClick={() => press(code.slice(entry.length, entry.length + 1))}>
            Preview: the code is {code.slice(0, 2)} {code.slice(2)}
          </button>
        )}
      </div>
      <style>{LOCK_CSS}</style>
    </>
  );
}

export function CountdownLock({ opensAt, recipient, preview, onOpen }: { opensAt: Date; recipient: string; preview: boolean; onOpen: () => void }) {
  const { cue } = useAp();
  const [now, setNow] = useState(() => Date.now());
  const [skip, setSkip] = useState(false);
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);
  const left = Math.max(0, opensAt.getTime() - now);
  const ready = left === 0 || skip;
  const wasReady = useRef(ready);
  useEffect(() => {
    if (ready && !wasReady.current) cue("chime-cascade", { gain: 0.6 });
    wasReady.current = ready;
  }, [ready, cue]);
  useNext(ready ? "Open our book" : null, onOpen, "book");
  const d = Math.floor(left / 86400000);
  const h = Math.floor((left % 86400000) / 3600000);
  const m = Math.floor((left % 3600000) / 60000);
  const s = Math.floor((left % 60000) / 1000);
  const tiles: [number, string][] = [
    [d, d === 1 ? "day" : "days"],
    [h, "hours"],
    [m, "mins"],
    [s, "secs"],
  ];
  return (
    <>
      <Head kicker={`For ${recipient}`} title={ready ? <>The day is <em>here</em></> : <>Not yet, <em>my love</em></>} sub={ready ? "Your book is ready to open." : `This little book opens on ${prettyDay(opensAt, { day: "numeric", month: "long" })}. Come back then 🤍`} />
      <div className="ap-fill">
        <div className="ap-count">
          <div className="ap-hourglass" aria-hidden>
            <span className="ap-hg-top" />
            <span className="ap-hg-bot" />
            <span className="ap-hg-sand" />
          </div>
          {!ready && (
            <div className="ap-tiles" role="timer" aria-label={`${d} days ${h} hours ${m} minutes left`}>
              {tiles.map(([n, l]) => (
                <span key={l} className="ap-tile">
                  <b key={n}>{String(n).padStart(2, "0")}</b>
                  <i>{l}</i>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="ap-foot">
        {!ready && preview && (
          <button type="button" className="ap-ghost" onClick={() => setSkip(true)}>
            Preview: skip the countdown
          </button>
        )}
      </div>
      <style>{LOCK_CSS}</style>
    </>
  );
}

const LOCK_CSS = `
.ap-lock { display: grid; justify-items: center; gap: clamp(10px, 2.2cqh, 22px); width: min(100%, 360px); }
.ap-clasp { position: relative; width: clamp(90px, 22cqh, 130px); aspect-ratio: 1.3; }
.ap-clasp-l, .ap-clasp-r { position: absolute; top: 18%; width: 52%; height: 64%; border-radius: 40px 10px 10px 40px; transition: transform .8s cubic-bezier(.3,1.4,.4,1);
  background: linear-gradient(160deg, #FFFFFF, var(--ap-foil) 70%, var(--ap-deep)); box-shadow: inset 0 0 0 2px color-mix(in srgb, #FFFFFF 60%, transparent), 0 10px 20px -10px var(--ap-deep); }
.ap-clasp-l { left: 0; }
.ap-clasp-r { right: 0; transform: scaleX(-1); }
.ap-clasp-heart { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); font-size: clamp(28px, 7cqh, 40px); filter: drop-shadow(0 4px 6px rgba(0,0,0,.15)); transition: transform .5s cubic-bezier(.3,1.6,.5,1); }
.ap-lock.is-open .ap-clasp-l { transform: translateX(-34%) rotate(-24deg); }
.ap-lock.is-open .ap-clasp-r { transform: scaleX(-1) translateX(-34%) rotate(-24deg); }
.ap-lock.is-open .ap-clasp-heart { transform: translate(-50%, -50%) scale(1.5); }
.ap-code { display: flex; gap: 8px; }
.ap-code.is-shake { animation: ap-shake .45s ease-in-out; }
@keyframes ap-shake { 0%,100% { transform: translateX(0) } 20% { transform: translateX(-10px) } 40% { transform: translateX(9px) } 60% { transform: translateX(-6px) } 80% { transform: translateX(4px) } }
.ap-code-slot { width: clamp(46px, 13cqw, 56px); height: clamp(54px, 9cqh, 64px); border-radius: 14px; display: grid; place-items: center; box-sizing: border-box;
  font: 600 clamp(30px, 5cqh, 38px)/1 ${AP_SERIF}; color: var(--vw-ink); background: var(--vw-paper); box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--ap-foil) 70%, var(--vw-edge)), 0 8px 16px -10px var(--ap-deep); }
.ap-code-slot i { font: 600 14px ${AP_SANS}; color: color-mix(in srgb, var(--vw-ink-soft) 60%, transparent); font-style: normal; letter-spacing: .1em; }
.ap-code-slot.is-on { box-shadow: inset 0 0 0 2px var(--vw-accent), 0 8px 16px -10px var(--ap-deep); }
.ap-code-slot.is-gap { margin-left: 12px; }
.ap-keys { display: grid; grid-template-columns: repeat(3, clamp(58px, 17cqw, 76px)); gap: clamp(6px, 1.4cqh, 12px); }
.ap-key { height: clamp(46px, 8.4cqh, 60px); border: 0; border-radius: 18px; cursor: pointer; touch-action: manipulation; font: 600 clamp(22px, 3.6cqh, 28px)/1 ${AP_SERIF}; color: var(--vw-ink);
  background: radial-gradient(120% 120% at 30% 20%, #FFFFFF, var(--ap-blush)); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--ap-foil) 55%, transparent), 0 3px 0 color-mix(in srgb, var(--ap-foil) 55%, transparent), 0 10px 18px -12px var(--ap-deep); transition: transform .08s ease; }
.ap-key:active { transform: translateY(2px) scale(.96); }
.ap-key.is-soft { font-family: ${AP_SANS}; font-size: 20px; color: var(--vw-ink-soft); }
.ap-key:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 2px; }
.ap-lock-note { margin: 0; font: 600 15px ${AP_SANS}; color: var(--vw-accent-deep); }
/* Short screens (in-app browsers): the keypad turns into a two-and-a-bit row combination lock so the clasp,
   the four slots and every key fit without scrolling; keys stay 44px+ tall. */
@container (max-height: 360px) {
  .ap-lock { gap: 8px; }
  .ap-clasp { width: clamp(52px, 17cqh, 90px); }
  .ap-code-slot { height: clamp(44px, 14cqh, 54px); width: clamp(42px, 12cqw, 52px); font-size: 28px; }
  .ap-keys { grid-template-columns: repeat(4, clamp(54px, 16cqw, 72px)); gap: 6px; }
  .ap-key { height: 44px; font-size: 22px; }
  .ap-key[data-ap-key="0"] { order: 1; }
  .ap-key.is-soft { order: 2; }
  .ap-keys > span { display: none; }
}
@container (max-height: 250px) { .ap-clasp { display: none; } }
.ap-count { display: grid; justify-items: center; gap: clamp(14px, 3cqh, 28px); }
.ap-hourglass { position: relative; width: clamp(70px, 16cqh, 110px); aspect-ratio: .62; animation: ap-hg 6s ease-in-out infinite; }
@keyframes ap-hg { 0%, 80% { transform: rotate(0) } 90%, 100% { transform: rotate(180deg) } }
.ap-hg-top, .ap-hg-bot { position: absolute; left: 0; right: 0; height: 50%; background: color-mix(in srgb, #FFFFFF 60%, transparent); box-shadow: inset 0 0 0 2px var(--ap-foil); }
.ap-hg-top { top: 0; clip-path: polygon(0 0, 100% 0, 56% 100%, 44% 100%); }
.ap-hg-bot { bottom: 0; clip-path: polygon(44% 0, 56% 0, 100% 100%, 0 100%); background: linear-gradient(180deg, transparent 50%, var(--ap-rose) 50%); }
.ap-hg-sand { position: absolute; left: 49%; top: 46%; width: 2%; height: 34%; background: var(--ap-rose); }
.ap-tiles { display: flex; gap: clamp(6px, 2cqw, 14px); }
.ap-tile { display: grid; justify-items: center; gap: 4px; padding: 10px 6px 8px; min-width: clamp(60px, 18cqw, 84px); border-radius: 16px; background: var(--vw-paper); box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--ap-foil) 60%, transparent), 0 12px 22px -14px var(--ap-deep); }
.ap-tile b { font: 600 clamp(32px, 7cqh, 52px)/1 ${AP_SERIF}; color: var(--vw-ink); animation: ap-flip .4s ease; }
@keyframes ap-flip { from { transform: rotateX(70deg); opacity: .3 } to { transform: rotateX(0); opacity: 1 } }
.ap-tile i { font: 700 11px ${AP_SANS}; letter-spacing: .14em; text-transform: uppercase; font-style: normal; color: var(--vw-ink-soft); }
@media (prefers-reduced-motion: reduce) { .ap-hourglass, .ap-tile b, .ap-code.is-shake { animation: none; } }
`;

// ─── 1 · Opening titles (pull focus) ────────────────────────────────────────

export function Titles({
  recipient,
  sender,
  openingLine,
  together,
  sticker,
  onNext,
}: {
  recipient: string;
  sender: string;
  openingLine: string;
  together: Together | null;
  sticker: ReactNode;
  onNext: () => void;
}) {
  const { cue } = useAp();
  const reduced = useReducedMotion();
  const [focus, setFocus] = useState(0);
  const [rolled, setRolled] = useState(false);
  const ridge = useRef(0);
  const [ridgeX, setRidgeX] = useState(0);
  const lastTick = useRef(0);
  const ringRef = useRef<HTMLDivElement | null>(null);

  const focusRef = useRef(0);
  const bump = useCallback(
    (amt: number) => {
      const f = focusRef.current;
      const n = clamp(f + amt, 0, 1);
      if (n === f) return;
      focusRef.current = n;
      setFocus(n);
      if (n >= 1 && f < 1) {
        haptic([18, 40, 24]);
        cue("chime-cascade", { gain: 0.55 });
        cue("sparkle", { gain: 0.4, at: 0.3 });
        window.setTimeout(() => setRolled(true), reduced ? 0 : 250);
      }
    },
    [cue, reduced],
  );

  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (focus >= 1) return;
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    let lx = e.clientX;
    const w = el.getBoundingClientRect().width || 300;
    const startX = e.clientX;
    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - lx;
      lx = ev.clientX;
      ridge.current += dx;
      setRidgeX(ridge.current);
      if (Math.abs(ridge.current - lastTick.current) > 18) {
        lastTick.current = ridge.current;
        haptic(4);
        cue("tick", { gain: 0.22, detune: Math.random() * 200 - 100 });
      }
      bump(Math.abs(dx) / (w * 1.25));
    };
    const up = (ev: PointerEvent) => {
      if (Math.abs(ev.clientX - startX) < 6) bump(0.22);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
  };

  useNext(rolled ? "Begin chapter one" : null, onNext, "book");
  const blur = (1 - focus) * 7;
  const nth = together?.nth;
  return (
    <div className="ap-fill">
      <div className={`ap-titles${rolled ? " is-rolled" : ""}`}>
        <div className="ap-titles-frame" style={{ filter: reduced ? undefined : `blur(${blur.toFixed(2)}px)`, transform: `scale(${1.08 - focus * 0.08})`, opacity: 0.9 + focus * 0.1 }}>
          <p className="ap-t-kick">{sender} &amp; {recipient} present</p>
          <h1 className="ap-t-names">
            <span>{recipient}</span>
            <i>&amp;</i>
            <span>{sender}</span>
          </h1>
          <p className="ap-t-book">The Book of Us</p>
        </div>
        <AnimatePresence>
          {rolled && (
            <motion.div className="ap-t-credits" initial={reduced ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduced ? 0 : 0.2, duration: 0.8 }}>
              <span className="ap-rule" aria-hidden />
              <p className="ap-t-nth">{nth ? `Our ${ordinal(nth)} Anniversary` : "Happy Anniversary"}</p>
              {openingLine && <p className="ap-t-line">{openingLine}</p>}
              {together && (
                <p className="ap-t-since">
                  since {prettyDay(together.start)} · {together.totalDays.toLocaleString("en-IN")} days of us
                </p>
              )}
              <div className="ap-t-stk">{sticker}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {!rolled && (
        <div className="ap-lens-wrap">
          <div
            ref={ringRef}
            className="ap-lens"
            role="slider"
            tabIndex={0}
            aria-label="Turn the lens to bring the names into focus"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(focus * 100)}
            onPointerDown={onDown}
            onKeyDown={(e) => {
              if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " ", "Enter"].includes(e.key)) {
                e.preventDefault();
                ridge.current += 14;
                setRidgeX(ridge.current);
                bump(0.2);
              }
            }}
            data-ap-lens
          >
            <span className="ap-lens-ridges" style={{ backgroundPositionX: `${ridgeX}px` }} />
            <span className="ap-lens-mark" />
            <span className="ap-lens-scale" style={{ transform: `translateX(${ridgeX * 0.5}px)` }}>
              ∞ · 10 · 5 · 3 · 2 · 1.5 · 1 · ∞ · 10 · 5 · 3 · 2
            </span>
          </div>
          <Hint hand="👉">Drag the lens ring to focus</Hint>
        </div>
      )}
      <style>{TITLES_CSS}</style>
    </div>
  );
}

const TITLES_CSS = `
.ap-titles { position: relative; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: clamp(6px, 1.6cqh, 16px); padding-bottom: 0; }
.ap-titles-frame { display: grid; justify-items: center; gap: clamp(4px, 1.2cqh, 12px); transition: filter .12s linear, transform .2s ease-out, opacity .2s; will-change: filter; }
.ap-t-kick { margin: 0; font: 700 clamp(11px, 1.8cqh, 14px) ${AP_SANS}; letter-spacing: .3em; text-transform: uppercase; color: var(--vw-accent-deep); }
.ap-t-names { margin: 0; display: grid; justify-items: center; line-height: .95; font-weight: 400; }
.ap-t-names span { font: 400 clamp(54px, min(17cqw, 12cqh), 132px)/1.05 ${AP_SCRIPT}; color: var(--vw-ink); padding: 0 12px; overflow-wrap: anywhere; max-width: 100%;
  background: linear-gradient(100deg, var(--vw-ink) 0%, var(--vw-accent-deep) 40%, var(--ap-foil) 50%, var(--vw-accent-deep) 60%, var(--vw-ink) 100%); background-size: 220% 100%; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.ap-titles.is-rolled .ap-t-names span { animation: ap-foil-sweep 3.4s ease-in-out .3s 1 both; }
@keyframes ap-foil-sweep { from { background-position: 100% 0 } to { background-position: 0 0 } }
.ap-t-names i { font: italic 500 clamp(26px, 5cqh, 44px)/1 ${AP_SERIF}; color: var(--ap-foil); margin: 2px 0; }
.ap-t-book { margin: 0; font: 600 clamp(15px, 2.6cqh, 22px) ${AP_SERIF}; letter-spacing: .34em; text-transform: uppercase; color: var(--vw-ink-soft); padding-left: .34em; }
.ap-t-credits { display: grid; justify-items: center; gap: 6px; }
.ap-t-nth { margin: 0; font: italic 600 clamp(24px, 4.4cqh, 38px)/1.1 ${AP_SERIF}; color: var(--vw-accent-deep); }
.ap-t-line { margin: 0; font: 500 clamp(19px, 3cqh, 26px)/1.25 ${AP_HAND}; color: var(--vw-ink); max-width: 30ch; overflow-wrap: anywhere; }
.ap-t-since { margin: 0; font: 600 clamp(12px, 1.8cqh, 14px) ${AP_SANS}; letter-spacing: .06em; color: var(--vw-ink-soft); }
.ap-t-stk { margin-top: 4px; }
/* Short screens (landscape phones): the opening credits tighten so both names and the credits fit. */
@container (max-height: 360px) { .ap-t-names span { font-size: clamp(32px, 13cqh, 54px); } .ap-t-names i { font-size: 22px; } .ap-t-nth { font-size: 21px; } .ap-t-line { font-size: 17px; } .ap-t-stk { display: none; } }
.ap-lens-wrap { position: absolute; left: 0; right: 0; bottom: 0; display: grid; justify-items: center; gap: 10px; }
.ap-lens { position: relative; width: min(100%, 420px); height: 64px; border-radius: 18px; overflow: hidden; cursor: ew-resize; touch-action: none; user-select: none; -webkit-user-select: none;
  background: linear-gradient(180deg, color-mix(in srgb, var(--ap-deep) 70%, #000) 0%, var(--ap-deep) 40%, color-mix(in srgb, var(--ap-deep) 80%, #000) 100%);
  box-shadow: inset 0 2px 0 rgba(255,255,255,.25), inset 0 -3px 0 rgba(0,0,0,.25), 0 14px 28px -14px var(--ap-deep), 0 0 0 1.5px var(--ap-foil); }
.ap-lens-ridges { position: absolute; inset: 0 0 26px; background: repeating-linear-gradient(90deg, rgba(255,255,255,.28) 0 2px, transparent 2px 9px); -webkit-mask-image: linear-gradient(90deg, transparent, #000 20%, #000 80%, transparent); mask-image: linear-gradient(90deg, transparent, #000 20%, #000 80%, transparent); }
.ap-lens-scale { position: absolute; left: -40px; right: -40px; bottom: 6px; white-space: nowrap; text-align: center; font: 600 12px ${AP_SANS}; letter-spacing: .14em; color: color-mix(in srgb, var(--ap-foil) 80%, #FFFFFF); }
.ap-lens-mark { position: absolute; left: 50%; top: 0; width: 3px; height: 14px; margin-left: -1.5px; background: var(--ap-rose); border-radius: 0 0 3px 3px; box-shadow: 0 0 8px var(--ap-rose); z-index: 1; }
.ap-lens:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 4px; }
@media (prefers-reduced-motion: reduce) { .ap-titles.is-rolled .ap-t-names span { animation: none; background-position: 50% 0; } }
`;

// ─── 2 · Two lives, one path ────────────────────────────────────────────────

const LEFT = "M 34 296 C 70 250, 18 214, 74 190 S 160 186, 146 132 S 170 84, 200 70";
const RIGHT = "M 366 296 C 330 250, 382 214, 326 190 S 240 186, 254 132 S 230 84, 200 70";
const SAMPLES = 72;
const LIFE_L = ["🎒", "📚", "🎧"];
const LIFE_R = ["⚽", "🎸", "💼"];

export function Paths({
  recipient,
  sender,
  metOn,
  metPlace,
  metLine,
  sticker,
  onNext,
}: {
  recipient: string;
  sender: string;
  metOn: Date | null;
  metPlace: string;
  metLine: string;
  sticker: ReactNode;
  onNext: () => void;
}) {
  const { cue } = useAp();
  const reduced = useReducedMotion();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const leftRef = useRef<SVGPathElement | null>(null);
  const rightRef = useRef<SVGPathElement | null>(null);
  const [pts, setPts] = useState<{ l: { x: number; y: number }[]; r: { x: number; y: number }[] } | null>(null);
  const [p, setP] = useState(0);
  const [met, setMet] = useState(false);
  const lastChime = useRef(0);

  useEffect(() => {
    const l = leftRef.current;
    const r = rightRef.current;
    if (!l || !r) return;
    const sample = (path: SVGPathElement) => {
      const len = path.getTotalLength();
      return Array.from({ length: SAMPLES + 1 }, (_, k) => {
        const q = path.getPointAtLength((k / SAMPLES) * len);
        return { x: q.x, y: q.y };
      });
    };
    setPts({ l: sample(l), r: sample(r) });
  }, []);

  const pRef = useRef(0);
  const metRef = useRef(false);
  const advance = useCallback(
    (to: number) => {
      if (metRef.current) return;
      const n = clamp(Math.max(pRef.current, to), 0, 1);
      if (n === pRef.current) return;
      if (n - lastChime.current > 0.18) {
        lastChime.current = n;
        cue("glass-ping", { gain: 0.25, detune: n * 700 });
        haptic(6);
      }
      if (n >= 0.985) {
        metRef.current = true;
        pRef.current = 1;
        setP(1);
        setMet(true);
        haptic([20, 50, 30]);
        cue("chime-cascade", { gain: 0.7 });
        cue("kiss", { gain: 0.4, at: 0.35 });
        if (!reduced) burst({ kind: "hearts", emojis: ["💗", "🤍", "✨"], origin: { x: 0.5, y: 0.25 }, count: 26 });
        return;
      }
      pRef.current = n;
      setP(n);
    },
    [cue, reduced],
  );

  const onDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (met || !pts) return;
    const svg = svgRef.current;
    if (!svg) return;
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    const toSvg = (cx: number, cy: number) => {
      const m = svg.getScreenCTM();
      if (!m) return null;
      const pt = new DOMPoint(cx, cy).matrixTransform(m.inverse());
      return { x: pt.x, y: pt.y };
    };
    const track = (cx: number, cy: number) => {
      const q = toSvg(cx, cy);
      if (!q) return;
      // The nearest point on either trail (she can trace from her side or theirs), never jumping far ahead.
      let best = -1;
      let bd = Infinity;
      for (const list of [pts.l, pts.r]) {
        list.forEach((s, k) => {
          const d = (s.x - q.x) ** 2 + (s.y - q.y) ** 2;
          if (d < bd) {
            bd = d;
            best = k;
          }
        });
      }
      if (best < 0 || bd > 60 * 60) return;
      const t = best / SAMPLES;
      if (t > pRef.current && t <= pRef.current + 0.2) advance(t);
    };
    track(e.clientX, e.clientY);
    const move = (ev: PointerEvent) => track(ev.clientX, ev.clientY);
    const up = () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
  };

  useNext(met ? "Time machine" : null, onNext, "clock");
  const idx = Math.round(p * SAMPLES);
  const dotL = pts?.l[idx];
  const dotR = pts?.r[idx];
  const when = metOn ? prettyDay(metOn) : "";
  return (
    <>
      <Head kicker="Chapter one" title={met ? <>And then, <em>us</em>.</> : <>Two lives, <em>one path</em></>} sub={met ? undefined : `${recipient}'s road and ${sender}'s road, before they knew.`} />
      <div className="ap-fill">
        <div className={`ap-paths${met ? " is-met" : ""}`}>
          <svg ref={svgRef} viewBox="0 0 400 320" className="ap-paths-svg" onPointerDown={onDown} role="img" aria-label="Two paths that meet at the top" data-ap-paths>
            <defs>
              <radialGradient id="apMeetG">
                <stop offset="0" stopColor="#FFFFFF" />
                <stop offset=".5" stopColor="var(--ap-rose)" stopOpacity=".55" />
                <stop offset="1" stopColor="var(--ap-rose)" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="200" cy="70" r={met ? 70 : 34} fill="url(#apMeetG)" className="ap-meet-glow" />
            <path ref={leftRef} d={LEFT} className="ap-trail-bg" />
            <path ref={rightRef} d={RIGHT} className="ap-trail-bg" />
            <path d={LEFT} className="ap-trail-ink is-l" pathLength={1} style={{ strokeDashoffset: 1 - p }} />
            <path d={RIGHT} className="ap-trail-ink is-r" pathLength={1} style={{ strokeDashoffset: 1 - p }} />
            {pts &&
              [0.28, 0.52, 0.76].map((t, k) => {
                const a = pts.l[Math.round(t * SAMPLES)];
                const b = pts.r[Math.round(t * SAMPLES)];
                const lit = p >= t;
                return (
                  <g key={t} className={`ap-life${lit ? " is-lit" : ""}`}>
                    <circle cx={a.x} cy={a.y} r="13" />
                    <text x={a.x} y={a.y + 5} textAnchor="middle" fontSize="14">
                      {LIFE_L[k]}
                    </text>
                    <circle cx={b.x} cy={b.y} r="13" />
                    <text x={b.x} y={b.y + 5} textAnchor="middle" fontSize="14">
                      {LIFE_R[k]}
                    </text>
                  </g>
                );
              })}
            <text x="34" y="316" textAnchor="start" className="ap-path-name">
              {recipient.slice(0, 14)}
            </text>
            <text x="366" y="316" textAnchor="end" className="ap-path-name">
              {sender.slice(0, 14)}
            </text>
            <g className="ap-meet" transform="translate(200 70)">
              <path d="M0 14 C-14 4 -20 -4 -18 -11 C-15 -19 -5 -19 0 -11 C5 -19 15 -19 18 -11 C20 -4 14 4 0 14 Z" />
            </g>
            {!met && dotL && dotR && (
              <>
                <circle cx={dotL.x} cy={dotL.y} r="11" className="ap-dot" />
                <circle cx={dotR.x} cy={dotR.y} r="11" className="ap-dot is-r" />
                {p < 0.04 && <circle cx={dotL.x} cy={dotL.y} r="11" className="ap-dot-ping" />}
              </>
            )}
          </svg>
          <AnimatePresence>
            {met && (
              <motion.div className="ap-met-card" initial={reduced ? false : { opacity: 0, y: 24, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 20, delay: reduced ? 0 : 0.35 }} data-ap-met>
                <div className="ap-met-stk">{sticker}</div>
                <p className="ap-met-k">{[when, metPlace].filter(Boolean).join(" · ") || "The day we met"}</p>
                {metLine && <p className="ap-met-l">{metLine}</p>}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="ap-foot">
        {!met && (
          <>
            <Hint>Trace the path with your finger</Hint>
            <button type="button" className="ap-ghost ap-path-step" onClick={() => advance(Math.min(1, p + 0.25))} aria-label="Walk a little further along the path">
              Walk on ›
            </button>
          </>
        )}
      </div>
      <style>{PATHS_CSS}</style>
    </>
  );
}

const PATHS_CSS = `
.ap-paths { position: relative; width: 100%; height: 100%; display: grid; place-items: center; }
.ap-paths-svg { width: min(100cqw, 125cqh); height: auto; max-height: 100cqh; overflow: visible; touch-action: none; cursor: crosshair; }
.ap-trail-bg { fill: none; stroke: color-mix(in srgb, var(--ap-foil) 60%, transparent); stroke-width: 3; stroke-dasharray: 2 9; stroke-linecap: round; }
.ap-trail-ink { fill: none; stroke-width: 5; stroke-linecap: round; stroke-dasharray: 1 1; transition: stroke-dashoffset .15s linear; }
.ap-trail-ink.is-l { stroke: var(--vw-accent); }
.ap-trail-ink.is-r { stroke: var(--ap-rose); }
.ap-life circle { fill: var(--vw-paper); stroke: color-mix(in srgb, var(--ap-foil) 60%, transparent); stroke-width: 1.5; transition: transform .3s; }
.ap-life text { opacity: .35; transition: opacity .3s; }
.ap-life.is-lit text { opacity: 1; }
.ap-life.is-lit circle { stroke: var(--vw-accent); }
.ap-path-name { font: 400 22px ${AP_SCRIPT}; fill: var(--vw-ink); }
.ap-meet path { fill: color-mix(in srgb, var(--vw-paper) 60%, transparent); stroke: var(--ap-foil); stroke-width: 2; stroke-dasharray: 3 4; transform-box: fill-box; transform-origin: center; transition: transform .6s cubic-bezier(.3,1.6,.5,1); }
.ap-paths.is-met .ap-meet path { fill: var(--ap-rose); stroke: #FFFFFF; stroke-dasharray: none; transform: scale(1.7); }
.ap-meet-glow { transition: r .8s ease; }
.ap-dot { fill: #FFFFFF; stroke: var(--vw-accent); stroke-width: 4; filter: drop-shadow(0 0 6px var(--vw-accent)); }
.ap-dot.is-r { stroke: var(--ap-rose); filter: drop-shadow(0 0 6px var(--ap-rose)); }
.ap-dot-ping { fill: none; stroke: var(--vw-accent); stroke-width: 2; transform-box: fill-box; transform-origin: center; animation: ap-ping 1.4s ease-out infinite; }
@keyframes ap-ping { from { transform: scale(1); opacity: .9 } to { transform: scale(2.6); opacity: 0 } }
.ap-met-card { position: absolute; left: 0; right: 0; margin: 0 auto; bottom: 2%; width: min(92%, 380px); box-sizing: border-box; padding: 14px 18px 16px; border-radius: 22px; text-align: center;
  background: color-mix(in srgb, var(--vw-paper) 94%, transparent); box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--ap-foil) 60%, transparent), 0 22px 40px -22px var(--ap-deep); display: grid; justify-items: center; gap: 4px; }
.ap-met-stk { margin-top: -66px; }
.ap-met-k { margin: 0; font: 700 12px ${AP_SANS}; letter-spacing: .16em; text-transform: uppercase; color: var(--vw-accent-deep); }
.ap-met-l { margin: 0; font: 500 clamp(19px, 2.8dvh, 23px)/1.25 ${AP_HAND}; color: var(--vw-ink); overflow-wrap: anywhere; }
.ap-path-step { min-height: 44px; font-size: 14px; }
@media (prefers-reduced-motion: reduce) { .ap-dot-ping { animation: none; } }
`;

// ─── 3 · The time machine ───────────────────────────────────────────────────

const STEP = 40;

export function TimeMachine({ chapters, photos, together, onNext }: { chapters: AnniChapter[]; photos: LovePhoto[]; together: Together | null; onNext: () => void }) {
  const { cue } = useAp();
  const reduced = useReducedMotion();
  const n = chapters.length;
  const rot = useMotionValue(0);
  const [at, setAt] = useState(0);
  const [seen, setSeen] = useState<Set<number>>(() => new Set([0]));
  const ringRef = useRef<HTMLDivElement | null>(null);
  const minRot = -(n - 1) * STEP;

  useMotionValueEvent(rot, "change", (v) => {
    const k = clamp(Math.round(-v / STEP), 0, n - 1);
    if (k !== at) {
      setAt(k);
      setSeen((s) => (s.has(k) ? s : new Set(s).add(k)));
      haptic(10);
      cue("tick", { gain: 0.45, detune: k * 120 });
      cue("whoosh", { gain: 0.15 });
    }
  });

  const snapTo = useCallback(
    (k: number) => {
      const target = -clamp(k, 0, n - 1) * STEP;
      if (reduced) rot.set(target);
      else animate(rot, target, { type: "spring", stiffness: 160, damping: 20 });
    },
    [n, reduced, rot],
  );

  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ringRef.current;
    if (!el) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const ang = (x: number, y: number) => (Math.atan2(y - cy, x - cx) * 180) / Math.PI;
    let last = ang(e.clientX, e.clientY);
    const start = { x: e.clientX, y: e.clientY };
    const tgt = e.currentTarget;
    rot.stop();
    const move = (ev: PointerEvent) => {
      const a = ang(ev.clientX, ev.clientY);
      let d = a - last;
      if (d > 180) d -= 360;
      if (d < -180) d += 360;
      last = a;
      let v = rot.get() + d;
      // Rubber band past the first / last year.
      if (v > 0) v = rot.get() + d * 0.3;
      if (v < minRot) v = rot.get() + d * 0.3;
      rot.set(clamp(v, minRot - 30, 30));
    };
    const up = (ev: PointerEvent) => {
      tgt.removeEventListener("pointermove", move);
      tgt.removeEventListener("pointerup", up);
      tgt.removeEventListener("pointercancel", up);
      const tap = Math.hypot(ev.clientX - start.x, ev.clientY - start.y) < 6;
      if (tap) snapTo(at + 1 > n - 1 ? 0 : at + 1);
      else snapTo(Math.round(-rot.get() / STEP));
    };
    tgt.addEventListener("pointermove", move);
    tgt.addEventListener("pointerup", up);
    tgt.addEventListener("pointercancel", up);
  };

  const [ringRot, setRingRot] = useState(0);
  useMotionValueEvent(rot, "change", (v) => setRingRot(v));

  const done = seen.size >= n;
  useNext(done ? "Play our firsts" : null, onNext, "record");
  const c = chapters[at];
  const photo = photos[at];
  const sub = together
    ? `${together.years ? `${together.years} ${together.years === 1 ? "year" : "years"}, ` : ""}${together.months} ${together.months === 1 ? "month" : "months"} and ${together.days} ${together.days === 1 ? "day" : "days"} of us`
    : "Every year of us, in one little machine";
  return (
    <>
      <Head kicker="The time machine" title={<>Spin through <em>our years</em></>} sub={sub} />
      <div className="ap-fill">
        <div className="ap-tm" data-ap-dial>
          <div ref={ringRef} className="ap-tm-ring" onPointerDown={onDown} role="slider" tabIndex={0} aria-label="Spin the ring to travel through our years" aria-valuemin={1} aria-valuemax={n} aria-valuenow={at + 1} aria-valuetext={`${c.when} ${c.title}`}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                e.preventDefault();
                snapTo(at + 1);
              } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                e.preventDefault();
                snapTo(at - 1);
              }
            }}
          >
            <div className="ap-tm-face" style={{ transform: `rotate(${ringRot}deg)` }}>
              {Array.from({ length: 36 }, (_, k) => (
                <i key={k} className="ap-tm-tick" style={{ transform: `rotate(${k * 10}deg)` }} />
              ))}
              {chapters.map((ch, k) => (
                <span key={k} className={`ap-tm-year${k === at ? " is-on" : ""}${seen.has(k) ? " is-seen" : ""}`} style={{ transform: `rotate(${k * STEP}deg)` }}>
                  <b style={{ transform: `rotate(${-(k * STEP + ringRot)}deg)` }}>{ch.when || `Year ${k + 1}`}</b>
                </span>
              ))}
            </div>
            <span className="ap-tm-notch" aria-hidden />
            <div className={`ap-tm-window is-${c.season}`}>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={at}
                  className="ap-tm-scene"
                  initial={reduced ? false : { opacity: 0, scale: 1.15, filter: "blur(8px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={reduced ? undefined : { opacity: 0, scale: 0.9, filter: "blur(8px)" }}
                  transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
                >
                  <SeasonSky season={c.season} />
                  {photo ? (
                    <div className="ap-tm-photo">
                      <CroppedPhoto photo={photo} eager />
                    </div>
                  ) : (
                    <span className="ap-tm-emoji" aria-hidden>
                      {ANNI_SEASONS[c.season].emoji}
                    </span>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
      <div className="ap-foot ap-tm-foot">
        <button type="button" className="ap-tm-arrow" onClick={() => snapTo(at - 1)} disabled={at === 0} aria-label="Previous year">
          ‹
        </button>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={at} className="ap-tm-card" initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={reduced ? undefined : { opacity: 0, y: -6 }} transition={{ duration: 0.25 }} data-ap-chapter={at}>
            <p className="ap-tm-when">
              {ANNI_SEASONS[c.season].emoji} {c.when || `Year ${at + 1}`}
            </p>
            <p className="ap-tm-title">{c.title}</p>
            {c.line && <p className="ap-tm-line">{c.line}</p>}
          </motion.div>
        </AnimatePresence>
        <button type="button" className="ap-tm-arrow" onClick={() => snapTo(at + 1)} disabled={at === n - 1} aria-label="Next year">
          ›
        </button>
        {!done && <p className="ap-tm-left">{n - seen.size} more {n - seen.size === 1 ? "year" : "years"} to visit · spin the ring ↻</p>}
      </div>
      <style>{TM_CSS}</style>
    </>
  );
}

/** A tiny animated season inside the time-machine window. */
export function SeasonSky({ season }: { season: AnniSeason }) {
  const bits = Array.from({ length: 14 }, (_, k) => k);
  return (
    <span className={`ap-sky is-${season}`} aria-hidden>
      {season === "summer" && <span className="ap-sky-sun" />}
      {season === "monsoon" && <span className="ap-sky-cloud" />}
      {bits.map((k) => (
        <i key={k} style={{ left: `${(k * 37 + 5) % 100}%`, animationDelay: `${-((k * 0.53) % 4)}s`, animationDuration: `${(season === "monsoon" ? 0.8 : 3.6) + (k % 4) * 0.6}s` }} />
      ))}
    </span>
  );
}

const TM_CSS = `
.ap-tm { width: 100%; height: 100%; display: grid; place-items: center; }
.ap-tm-ring { position: relative; width: min(96cqw, 96cqh, 620px); aspect-ratio: 1; border-radius: 50%; touch-action: none; cursor: grab; user-select: none; -webkit-user-select: none;
  background: radial-gradient(circle, transparent 58%, color-mix(in srgb, var(--vw-paper) 92%, transparent) 58.5%, #FFFFFF 70%, var(--ap-blush) 86%, color-mix(in srgb, var(--ap-foil) 60%, var(--ap-blush)) 99%);
  box-shadow: 0 0 0 2px var(--ap-foil), 0 0 0 7px color-mix(in srgb, var(--vw-paper) 70%, transparent), 0 0 0 8.5px color-mix(in srgb, var(--ap-foil) 50%, transparent), 0 30px 60px -30px var(--ap-deep), inset 0 0 30px -10px color-mix(in srgb, var(--ap-deep) 40%, transparent); }
.ap-tm-ring:active { cursor: grabbing; }
.ap-tm-ring:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 8px; }
.ap-tm-face { position: absolute; inset: 0; border-radius: 50%; }
.ap-tm-tick { position: absolute; left: 50%; top: 1.5%; width: 1.5px; height: 3.5%; margin-left: -.75px; background: color-mix(in srgb, var(--ap-foil) 70%, transparent); transform-origin: 50% calc(50cqmin * 0); }
.ap-tm-tick { transform-origin: 50% 1400%; }
.ap-tm-year { position: absolute; left: 50%; top: 0; width: 0; height: 50%; transform-origin: 50% 100%; }
.ap-tm-year b { position: absolute; left: 50%; top: 6.5%; transform-origin: 50% 50%; translate: -50% 0; white-space: nowrap; font: 600 clamp(15px, 3.6cqmin, 22px)/1 ${AP_SERIF}; color: var(--vw-ink-soft); padding: 4px 9px; border-radius: 99px; transition: color .25s, background .25s, scale .25s; }
.ap-tm-year.is-seen b { color: var(--vw-ink); }
.ap-tm-year.is-on b { color: #FFFFFF; background: var(--vw-accent); scale: 1.12; box-shadow: 0 6px 12px -6px var(--ap-deep); }
.ap-tm-notch { position: absolute; left: 50%; top: -14px; width: 0; height: 0; margin-left: -10px; border: 10px solid transparent; border-top: 14px solid var(--ap-rose); filter: drop-shadow(0 2px 2px rgba(0,0,0,.15)); }
.ap-tm-window { position: absolute; inset: 20%; border-radius: 50%; overflow: hidden; box-shadow: 0 0 0 3px #FFFFFF, 0 0 0 5px var(--ap-foil), inset 0 6px 18px rgba(0,0,0,.12); background: var(--ap-sky1); isolation: isolate; }
.ap-tm-scene { position: absolute; inset: 0; display: grid; place-items: center; }
.ap-tm-photo { position: relative; z-index: 2; width: 66%; aspect-ratio: 1; border-radius: 50%; overflow: hidden; box-shadow: 0 0 0 4px #FFFFFF, 0 12px 24px -10px rgba(0,0,0,.35); }
.ap-tm-emoji { position: relative; z-index: 2; font-size: clamp(54px, 16cqmin, 110px); filter: drop-shadow(0 8px 10px rgba(0,0,0,.15)); }
.ap-sky { position: absolute; inset: 0; z-index: 1; overflow: hidden; }
.ap-sky.is-spring { background: linear-gradient(180deg, #FFE8F0, #FFF6EC 60%, #E9F6E4); }
.ap-sky.is-summer { background: linear-gradient(180deg, #FFE7B8, #FFF3D6 55%, #DFF1F9); }
.ap-sky.is-monsoon { background: linear-gradient(180deg, #DCE6EF, #EEF2F4 60%, #DDEFE4); }
.ap-sky.is-autumn { background: linear-gradient(180deg, #FFE1C7, #FFF1E2 60%, #F6E2CC); }
.ap-sky.is-winter { background: linear-gradient(180deg, #E4EEFA, #F6F9FD 60%, #FFFFFF); }
.ap-sky i { position: absolute; top: -10%; display: block; animation: ap-fall linear infinite; }
.ap-sky.is-spring i { width: 9px; height: 12px; border-radius: 80% 0 80% 0; background: #FFB8CF; }
.ap-sky.is-summer i { width: 4px; height: 4px; border-radius: 50%; background: #FFFFFF; box-shadow: 0 0 6px #FFE29A; animation-name: ap-shimmer; top: auto; bottom: 10%; }
.ap-sky.is-monsoon i { width: 1.5px; height: 16px; background: linear-gradient(#9EB7CC00, #8FA9C2); }
.ap-sky.is-autumn i { width: 11px; height: 9px; border-radius: 0 80% 0 80%; background: #E9965A; }
.ap-sky.is-winter i { width: 7px; height: 7px; border-radius: 50%; background: #FFFFFF; box-shadow: 0 0 4px #BFD3EA; }
@keyframes ap-fall { from { transform: translateY(0) rotate(0) } to { transform: translateY(130cqmin) rotate(300deg) } }
@keyframes ap-shimmer { 0%, 100% { transform: translateY(0); opacity: .2 } 50% { transform: translateY(-40px); opacity: 1 } }
.ap-sky-sun { position: absolute; right: 12%; top: 10%; width: 22%; aspect-ratio: 1; border-radius: 50%; background: radial-gradient(circle, #FFF6C9, #FFD36E); box-shadow: 0 0 30px 10px #FFE7A3; }
.ap-sky-cloud { position: absolute; left: 10%; top: 8%; width: 50%; height: 16%; border-radius: 99px; background: #FFFFFF; opacity: .8; box-shadow: 30px -10px 0 4px #FFFFFF; }
.ap-tm-foot { display: grid; grid-template-columns: 44px minmax(0, 1fr) 44px; align-items: center; width: 100%; max-width: 520px; gap: 8px; }
.ap-tm-card { display: grid; gap: 2px; text-align: center; min-height: 86px; align-content: center; }
.ap-tm-when { margin: 0; font: 700 12px ${AP_SANS}; letter-spacing: .16em; text-transform: uppercase; color: var(--vw-accent-deep); }
.ap-tm-title { margin: 0; font: 600 clamp(21px, 3.2dvh, 28px)/1.1 ${AP_SERIF}; color: var(--vw-ink); overflow-wrap: anywhere; }
.ap-tm-line { margin: 0; font: 500 clamp(17px, 2.5dvh, 21px)/1.22 ${AP_HAND}; color: var(--vw-ink-soft); overflow-wrap: anywhere; }
.ap-tm-left { grid-column: 1 / -1; margin: 0; font: 600 12.5px ${AP_SANS}; color: var(--vw-ink-soft); text-align: center; }
@media (min-width: 1100px) { .ap-tm-foot { max-width: 440px; } .ap-tm-card { text-align: left; } .ap-tm-title { font-size: 30px; } .ap-tm-line { font-size: 23px; } }
@media (prefers-reduced-motion: reduce) { .ap-sky i { animation: none; } }
`;
