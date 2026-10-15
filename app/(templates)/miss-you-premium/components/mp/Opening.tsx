"use client";

// Morning: 1 · draw the curtains open (a skywriter writes their name),
// 2 · tune the radio to our frequency (voice notes), 3 · pull the photo-booth
// strip out of the slot (the photos develop).

import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CroppedPhoto, burst, haptic, useReducedMotion } from "../../../_valentine/kit";
import type { LovePhoto } from "../../../_valentine/types";
import { FONTS } from "../../../_valentine/theme";
import { MP_DISPLAY, MP_HAND } from "./fonts";
import { useMp, useNext } from "./stage";
import { Head, Hint, MpScroll } from "./ui";

// ─── 1 · Good morning: open the curtains ────────────────────────────────────

export function Curtains({ recipient, petName, sender, openingLine, sticker, onNext }: { recipient: string; petName: string; sender: string; openingLine: string; sticker: ReactNode; onNext: () => void }) {
  const { cue } = useMp();
  const reduced = useReducedMotion();
  const winRef = useRef<HTMLDivElement | null>(null);
  const [pull, setPull] = useState({ l: 0, r: 0 });
  const [open, setOpen] = useState(false);
  const drag = useRef<{ side: "l" | "r"; x0: number; v0: number; w: number } | null>(null);

  const reveal = () => {
    if (open) return;
    setOpen(true);
    setPull({ l: 1, r: 1 });
    haptic([14, 40, 20]);
    cue("ribbon", { gain: 0.5 });
    cue("chime-cascade", { gain: 0.6, at: 0.35 });
    if (!reduced) {
      window.setTimeout(() => burst({ kind: "sparkles", origin: { x: 0.5, y: 0.42 }, count: 26, spread: 0.5 }), 320);
      window.setTimeout(() => burst({ kind: "hearts", emojis: ["💗", "🩷", "☀️", "✨"], origin: { x: 0.5, y: 0.55 }, count: 20 }), 900);
    }
  };

  const down = (side: "l" | "r") => (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (open) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const w = (winRef.current?.clientWidth ?? 300) / 2;
    drag.current = { side, x0: e.clientX, v0: pull[side], w };
    cue("paper-rustle", { gain: 0.35 });
  };
  const move = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || open) return;
    const dx = (e.clientX - d.x0) * (d.side === "l" ? -1 : 1);
    const v = Math.max(0, Math.min(1, d.v0 + dx / (d.w * 0.85)));
    const n = { ...pull, [d.side]: v };
    setPull(n);
    if (n.l + n.r > 1.1) reveal();
  };
  const up = (side: "l" | "r") => () => {
    const d = drag.current;
    drag.current = null;
    if (open || !d) return;
    // A tap (no real drag) still opens that side a good way — never a dead end.
    const n = { ...pull, [side]: pull[side] < 0.06 ? 0.62 : pull[side] };
    setPull(n);
    if (n.l + n.r > 1.1) reveal();
  };

  useNext(open ? "Good morning ☀️" : null, onNext, "radio");
  const name = petName || recipient;
  return (
    <>
      <style>{CURTAIN_CSS}</style>
      <Head kicker={open ? `From ${sender}, far away` : `Psst, ${recipient}…`} title={open ? <>Good morning, {name} ☀️</> : "Someone's waiting outside your window"} sub={open ? openingLine || undefined : undefined} />
      <div className="mp-fill">
        <div className={`mp-win mp-zoom${open ? " is-open" : ""}`} ref={winRef}>
          <div className="mp-win-view" aria-hidden>
            <span className="mp-win-sun" />
            <svg className="mp-win-sky" viewBox="0 0 300 220" preserveAspectRatio="xMidYMid meet">
              <path className="mp-win-route" d="M40 170 Q 150 70 260 160" fill="none" strokeWidth="3" strokeDasharray="2 8" strokeLinecap="round" />
              <circle cx="40" cy="170" r="8" className="mp-win-dot-a" />
              <circle cx="260" cy="160" r="8" className="mp-win-dot-b" />
              {open && (
                <>
                  <text x="150" y="86" textAnchor="middle" className="mp-sky-name" style={{ fontFamily: MP_HAND, fontSize: name.length > 11 ? Math.max(24, Math.round((46 * 11) / Math.min(name.length, 21))) : undefined }}>
                    {name.length > 21 ? `${name.slice(0, 20)}…` : name}
                  </text>
                  <g className="mp-sky-plane">
                    <text x="0" y="0" fontSize="26">
                      🛩️
                    </text>
                  </g>
                </>
              )}
            </svg>
            <span className="mp-win-bird is-a">〰</span>
            <span className="mp-win-bird is-b">〰</span>
          </div>
          <span className="mp-win-bars" aria-hidden />
          <button
            type="button"
            className="mp-curtain is-l"
            style={{ ["--pull" as string]: String(pull.l) }}
            onPointerDown={down("l")}
            onPointerMove={move}
            onPointerUp={up("l")}
            onPointerCancel={up("l")}
            aria-label="Open the left curtain"
            data-mp-curtain="l"
            tabIndex={open ? -1 : 0}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && reveal()}
          >
            <span className="mp-curtain-tie" />
          </button>
          <button
            type="button"
            className="mp-curtain is-r"
            style={{ ["--pull" as string]: String(pull.r) }}
            onPointerDown={down("r")}
            onPointerMove={move}
            onPointerUp={up("r")}
            onPointerCancel={up("r")}
            aria-label="Open the right curtain"
            data-mp-curtain="r"
            tabIndex={open ? -1 : 0}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && reveal()}
          >
            <span className="mp-curtain-tie" />
          </button>
          <span className="mp-win-rod" aria-hidden />
          <span className="mp-win-sill" aria-hidden />
          <AnimatePresence>
            {open && sticker && (
              <motion.span className="mp-win-gif" initial={reduced ? false : { y: 50, opacity: 0, rotate: -12 }} animate={{ y: 0, opacity: 1, rotate: -5 }} transition={{ type: "spring", stiffness: 200, damping: 14, delay: reduced ? 0 : 1.1 }}>
                {sticker}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
      <Hint show={!open}>Drag the curtains open ⟵ ⟶</Hint>
    </>
  );
}

const CURTAIN_CSS = `
.mp-win { position: relative; width: min(88cqw, 64cqh, 380px); aspect-ratio: 0.82; border-radius: 48% 48% 18px 18px / 30% 30% 18px 18px; background: #FFFFFF; padding: 12px; box-sizing: border-box;
  box-shadow: 0 0 0 4px var(--vw-edge), 0 30px 50px -26px color-mix(in srgb, var(--mp-deep) 70%, transparent); }
.mp-win-view { position: absolute; inset: 12px; border-radius: inherit; overflow: hidden; background: linear-gradient(180deg, #CFE6FF 0%, #FFE7EF 75%, #FFF4E0 100%); }
.mp-win-sun { position: absolute; left: 50%; top: 66%; width: 34%; aspect-ratio: 1; transform: translate(-50%, -50%); border-radius: 50%;
  background: radial-gradient(circle, #FFFDF2 0 35%, #FFE7A8 70%, #FFD18A); box-shadow: 0 0 40px 18px rgba(255,230,160,.55); transition: top 2.2s cubic-bezier(.3,.8,.3,1); }
.mp-win.is-open .mp-win-sun { top: 30%; }
.mp-win-sky { position: absolute; inset: 0; width: 100%; height: 100%; }
.mp-win-route { stroke: color-mix(in srgb, var(--mp-deep) 45%, transparent); }
.mp-win-dot-a { fill: var(--vw-accent); stroke: #FFFFFF; stroke-width: 3; }
.mp-win-dot-b { fill: var(--mp-pop); stroke: #FFFFFF; stroke-width: 3; }
.mp-sky-name { font-size: 46px; font-weight: 700; fill: rgba(255,255,255,0); stroke: #FFFFFF; stroke-width: 2.2; stroke-dasharray: 900; stroke-dashoffset: 900;
  paint-order: stroke; filter: drop-shadow(0 2px 4px color-mix(in srgb, var(--mp-deep) 35%, transparent)); animation: mp-skywrite 3.2s ease-out .5s forwards; }
@keyframes mp-skywrite { 70% { stroke-dashoffset: 0; fill: rgba(255,255,255,0) } 100% { stroke-dashoffset: 0; fill: rgba(255,255,255,.95) } }
.mp-sky-plane { animation: mp-plane 2.6s ease-in-out .4s both; }
@keyframes mp-plane { 0% { transform: translate(-30px, 96px) rotate(-6deg) } 100% { transform: translate(320px, 70px) rotate(4deg) } }
.mp-win-bird { position: absolute; font: 700 18px ${FONTS.ui}; color: color-mix(in srgb, var(--mp-deep) 55%, transparent); animation: mp-bird 9s linear infinite; }
.mp-win-bird.is-a { top: 18%; left: -10%; }
.mp-win-bird.is-b { top: 26%; left: -20%; font-size: 13px; animation-delay: -3s; }
@keyframes mp-bird { from { transform: translateX(0) } to { transform: translateX(440px) } }
.mp-win-bars { position: absolute; inset: 12px; border-radius: 48% 48% 10px 10px / 30% 30% 10px 10px; pointer-events: none;
  background: linear-gradient(90deg, transparent calc(50% - 3px), #FFFFFF calc(50% - 3px), #FFFFFF calc(50% + 3px), transparent calc(50% + 3px)),
              linear-gradient(180deg, transparent calc(52% - 3px), #FFFFFF calc(52% - 3px), #FFFFFF calc(52% + 3px), transparent calc(52% + 3px)); opacity: .9; }
.mp-win-rod { position: absolute; left: -16px; right: -16px; top: 6px; height: 10px; border-radius: 99px; background: linear-gradient(180deg, color-mix(in srgb, var(--vw-gold) 60%, #FFFFFF), var(--vw-gold)); box-shadow: 0 3px 6px -2px rgba(0,0,0,.15); z-index: 3; }
.mp-win-sill { position: absolute; left: -18px; right: -18px; bottom: -10px; height: 18px; border-radius: 8px; background: #FFFFFF; box-shadow: 0 0 0 3px var(--vw-edge), 0 10px 18px -10px color-mix(in srgb, var(--mp-deep) 60%, transparent); z-index: 3; }
.mp-curtain { position: absolute; top: 10px; bottom: 0; width: 54%; border: 0; padding: 0; cursor: grab; touch-action: none; z-index: 2; transition: transform .5s cubic-bezier(.3,1.2,.5,1);
  background: repeating-linear-gradient(90deg, color-mix(in srgb, var(--vw-accent) 34%, #FFFFFF) 0 12px, color-mix(in srgb, var(--vw-accent) 48%, #FFFFFF) 12px 15px, color-mix(in srgb, var(--vw-accent) 30%, #FFFFFF) 15px 26px);
  box-shadow: inset 0 -14px 0 color-mix(in srgb, var(--vw-paper) 60%, transparent), 0 10px 20px -12px color-mix(in srgb, var(--mp-deep) 60%, transparent); }
.mp-curtain:active { cursor: grabbing; }
.mp-curtain.is-l { left: -2px; border-radius: 60% 0 0 10px / 22% 0 0 10px; transform-origin: 0 0; transform: scaleX(calc(1 - var(--pull) * .78)); }
.mp-curtain.is-r { right: -2px; border-radius: 0 60% 10px 0 / 0 22% 10px 0; transform-origin: 100% 0; transform: scaleX(calc(1 - var(--pull) * .78)); }
.mp-win.is-open .mp-curtain { transition-duration: .9s; cursor: default; }
.mp-curtain-tie { position: absolute; top: 56%; width: 30px; height: 12px; border-radius: 99px; background: var(--vw-accent-deep); opacity: 0; transition: opacity .4s ease .5s; }
.mp-curtain.is-l .mp-curtain-tie { right: 10%; }
.mp-curtain.is-r .mp-curtain-tie { left: 10%; }
.mp-win.is-open .mp-curtain-tie { opacity: .8; }
.mp-curtain:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: -6px; }
.mp-win-gif { position: absolute; right: -14px; bottom: 2px; z-index: 4; }
@media (prefers-reduced-motion: reduce) { .mp-win-bird, .mp-sky-plane { animation: none; display: none; } .mp-sky-name { animation-duration: .01s; animation-delay: 0s; } }
`;

// ─── 2 · Tune the radio to our frequency ────────────────────────────────────

const LOW = 88;
const HIGH = 108;
const STATIONS = [91.4, 98.7, 104.2];
const LOCK = 0.55;

export function Radio({ notes, sender, sticker, onNext }: { notes: readonly string[]; sender: string; sticker: ReactNode; onNext: () => void }) {
  const { cue } = useMp();
  const reduced = useReducedMotion();
  const stations = STATIONS.slice(0, Math.max(1, notes.length));
  const [freq, setFreq] = useState(95.1);
  const [found, setFound] = useState<number[]>([]);
  const [showing, setShowing] = useState<number | null>(null);
  const dialRef = useRef<HTMLDivElement | null>(null);
  const drag = useRef<{ x0: number; f0: number; w: number } | null>(null);
  const lastStatic = useRef(0);

  const near = stations.findIndex((s) => Math.abs(s - freq) <= LOCK);
  const tuned = near >= 0;
  const done = found.length >= stations.length;

  const tune = (f: number, at = 0) => {
    const v = Math.max(LOW, Math.min(HIGH, Math.round(f * 10) / 10));
    setFreq(v);
    const k = stations.findIndex((s) => Math.abs(s - v) <= LOCK);
    if (k >= 0) {
      setShowing(k);
      if (!found.includes(k)) {
        haptic([10, 30, 10]);
        cue("glass-ping", { gain: 0.55 });
        cue("sparkle", { gain: 0.35, at: 0.12 });
        if (!reduced && found.length + 1 === stations.length) window.setTimeout(() => burst({ kind: "sparkles", origin: { x: 0.5, y: 0.35 }, count: 22 }), 200);
        setFound([...found, k]);
      }
    } else {
      if (at - lastStatic.current > 450) {
        lastStatic.current = at;
        cue("static", { gain: 0.12, dur: 0.18 });
      }
    }
  };

  const down = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x0: e.clientX, f0: freq, w: dialRef.current?.clientWidth ?? 260 };
  };
  const move = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    tune(d.f0 + ((e.clientX - d.x0) / d.w) * (HIGH - LOW) * 0.9, e.timeStamp);
  };
  const up = () => {
    drag.current = null;
  };
  const step = (dir: -1 | 1) => {
    haptic(6);
    cue("tick", { gain: 0.4 });
    // Snap toward the next heart on the dial, so the buttons alone always get there.
    const target = dir > 0 ? stations.find((s) => s > freq + LOCK) : [...stations].reverse().find((s) => s < freq - LOCK);
    tune(target !== undefined && Math.abs(target - freq) <= 2.2 ? target : freq + dir * 1.5);
  };

  useNext(done ? "Our frequency 💗" : null, onNext, "photo");
  const pos = ((freq - LOW) / (HIGH - LOW)) * 100;
  const note = showing !== null ? notes[showing] : null;
  return (
    <>
      <style>{RADIO_CSS}</style>
      <Head kicker="Radio Distance FM" title={done ? "You found all of me 📻" : "Find my frequency"} sub={done ? undefined : `${found.length} of ${stations.length} voice notes found`} />
      <div className="mp-fill">
        <div className="mp-radio-wrap mp-zoom">
          <div className={`mp-radio${tuned ? " is-tuned" : ""}`}>
            <span className="mp-radio-handle" aria-hidden />
            <span className="mp-radio-ant" aria-hidden style={{ transform: `rotate(${-24 + (pos / 100) * 12}deg)` }} />
            <div className="mp-radio-face">
              <span className="mp-radio-grille" aria-hidden>
                <span className={`mp-dial-read${tuned ? " is-on" : ""}`}>
                  {freq.toFixed(1)} <small>FM</small>
                </span>
                {tuned && !reduced && (
                  <span className="mp-radio-notes">
                    <i>♪</i>
                    <i>♫</i>
                    <i>♪</i>
                  </span>
                )}
              </span>
              <div
                className="mp-dial"
                ref={dialRef}
                onPointerDown={down}
                onPointerMove={move}
                onPointerUp={up}
                onPointerCancel={up}
                role="slider"
                tabIndex={0}
                aria-label="Radio dial"
                aria-valuemin={LOW}
                aria-valuemax={HIGH}
                aria-valuenow={freq}
                aria-valuetext={`${freq.toFixed(1)} FM${tuned ? ", a voice note is playing" : ", static"}`}
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                    e.preventDefault();
                    step(1);
                  } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                    e.preventDefault();
                    step(-1);
                  }
                }}
                data-mp-dial
              >
                <span className="mp-dial-scale" aria-hidden>
                  {[88, 92, 96, 100, 104, 108].map((n) => (
                    <b key={n} style={{ left: `${((n - LOW) / (HIGH - LOW)) * 100}%` }}>
                      {n}
                    </b>
                  ))}
                  {stations.map((s, k) => (
                    <em key={s} className={found.includes(k) ? "is-found" : undefined} style={{ left: `${((s - LOW) / (HIGH - LOW)) * 100}%` }}>
                      ♥
                    </em>
                  ))}
                  <span className="mp-dial-needle" style={{ left: `${pos}%` }} aria-hidden />
                </span>
              </div>
              <div className="mp-radio-ctrls">
                <button type="button" className="mp-knob-btn" onClick={() => step(-1)} aria-label="Tune down">
                  ◀
                </button>
                <span className="mp-knob" aria-hidden style={{ transform: `rotate(${(pos / 100) * 300 - 150}deg)` }} />
                <button type="button" className="mp-knob-btn" onClick={() => step(1)} aria-label="Tune up">
                  ▶
                </button>
              </div>
            </div>
          </div>
          <div className="mp-vn-slot">
            <AnimatePresence mode="wait" initial={false}>
              {tuned && note ? (
                <motion.div key={`n${near}`} className="mp-vn" initial={reduced ? false : { opacity: 0, y: 14, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={reduced ? undefined : { opacity: 0, y: -8 }} transition={{ type: "spring", stiffness: 300, damping: 24 }} data-mp-voicenote={near}>
                  <span className="mp-vn-play" aria-hidden>
                    ▶
                  </span>
                  <span className="mp-vn-body">
                    <span className="mp-vn-wave" aria-hidden>
                      {Array.from({ length: 22 }, (_, k) => (
                        <i key={k} style={{ ["--h" as string]: `${30 + ((k * 37) % 60)}%`, animationDelay: `${(k % 6) * 0.08}s` }} />
                      ))}
                    </span>
                    <span className="mp-vn-text">{note}</span>
                    <span className="mp-vn-meta">
                      🎙️ {sender} · 0:{String(8 + ((note.length * 7) % 40)).padStart(2, "0")}
                    </span>
                  </span>
                </motion.div>
              ) : (
                <motion.div key="static" className="mp-vn is-static" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={reduced ? undefined : { opacity: 0 }}>
                  <span className="mp-vn-static" aria-hidden />
                  <span className="mp-vn-text is-soft">{found.length ? "…kssshh… keep turning for the next ♥" : "…kssshh… turn the dial to the ♥"}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {found.length > 0 && sticker && <span className="mp-radio-gif">{sticker}</span>}
        </div>
      </div>
      <Hint show={!done}>Drag the dial (or ◀ ▶) to each ♥</Hint>
    </>
  );
}

const RADIO_CSS = `
.mp-radio-wrap { position: relative; width: min(100%, 400px); height: 100%; max-height: 520px; display: grid; grid-template-rows: auto 1fr; gap: clamp(10px, 2dvh, 18px); align-items: start; justify-items: center; }
.mp-radio { position: relative; width: 100%; margin-top: 30px; }
.mp-radio-handle { position: absolute; left: 30%; right: 30%; top: -24px; height: 30px; border: 7px solid var(--vw-accent-deep); border-bottom: 0; border-radius: 22px 22px 0 0; box-sizing: border-box; }
.mp-radio-ant { position: absolute; right: 16%; top: -46px; width: 4px; height: 64px; border-radius: 4px; background: linear-gradient(180deg, #FFFFFF, #B8B4C8); transform-origin: 50% 100%; transition: transform .2s ease; }
.mp-radio-ant::before { content: ""; position: absolute; left: -4px; top: -6px; width: 12px; height: 12px; border-radius: 50%; background: var(--mp-pop); }
.mp-radio-face { position: relative; border-radius: 30px; padding: 16px 16px 14px; display: grid; grid-template-columns: 1fr; gap: 12px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--vw-accent) 32%, #FFFFFF), color-mix(in srgb, var(--vw-accent) 52%, #FFFFFF));
  box-shadow: inset 0 3px 0 rgba(255,255,255,.6), inset 0 -6px 0 color-mix(in srgb, var(--mp-deep) 22%, transparent), 0 0 0 3px #FFFFFF, 0 22px 40px -22px color-mix(in srgb, var(--mp-deep) 70%, transparent); }
.mp-radio-grille { position: relative; height: clamp(46px, 8dvh, 70px); border-radius: 18px; overflow: visible;
  background: radial-gradient(circle, color-mix(in srgb, var(--mp-deep) 40%, transparent) 2.2px, transparent 2.8px) 0 0 / 11px 11px, #FFFFFF; box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--mp-deep) 18%, transparent); }
.mp-radio.is-tuned .mp-radio-grille { animation: mp-thump .5s ease-in-out infinite alternate; }
@keyframes mp-thump { from { transform: scale(1) } to { transform: scale(1.02) } }
.mp-radio-notes { position: absolute; inset: 0; pointer-events: none; }
.mp-radio-notes i { position: absolute; bottom: 60%; font: 700 20px ${FONTS.ui}; font-style: normal; color: var(--vw-accent-deep); animation: mp-note 1.6s ease-out infinite; }
.mp-radio-notes i:nth-child(1) { left: 18%; } .mp-radio-notes i:nth-child(2) { left: 50%; animation-delay: .5s; } .mp-radio-notes i:nth-child(3) { left: 78%; animation-delay: 1s; }
@keyframes mp-note { 0% { transform: translateY(0) rotate(-10deg); opacity: 0 } 20% { opacity: 1 } 100% { transform: translateY(-46px) rotate(14deg); opacity: 0 } }
.mp-dial { position: relative; height: 62px; border-radius: 14px; cursor: ew-resize; touch-action: none; overflow: hidden;
  background: linear-gradient(180deg, #FFFDF4, #FFF4DA); box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--mp-deep) 25%, transparent), inset 0 6px 10px -6px rgba(0,0,0,.18); }
.mp-dial:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 3px; }
.mp-dial-scale { position: absolute; left: 14px; right: 14px; top: 0; bottom: 0; }
.mp-dial-scale::before { content: ""; position: absolute; left: 0; right: 0; top: 24px; height: 10px; background: repeating-linear-gradient(90deg, color-mix(in srgb, var(--mp-deep) 45%, transparent) 0 1.5px, transparent 1.5px 9px); }
.mp-dial-scale b { position: absolute; top: 6px; transform: translateX(-50%); font: 700 10.5px ${FONTS.ui}; color: color-mix(in srgb, var(--vw-ink) 80%, transparent); }
.mp-dial-scale em { position: absolute; bottom: 4px; transform: translateX(-50%); font: 700 16px/1 ${FONTS.ui}; font-style: normal; color: var(--vw-accent); opacity: .55; animation: mp-pulse 1.2s ease-in-out infinite; }
.mp-dial-scale em.is-found { opacity: 1; color: var(--vw-accent-deep); animation: none; }
@keyframes mp-pulse { 0%, 100% { transform: translateX(-50%) scale(1) } 50% { transform: translateX(-50%) scale(1.25) } }
.mp-dial-needle { position: absolute; top: 4px; bottom: 4px; width: 3px; margin-left: -1.5px; border-radius: 3px; background: var(--vw-accent-deep);
  box-shadow: 0 0 8px color-mix(in srgb, var(--vw-accent) 80%, transparent); }
.mp-dial-read { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); padding: 4px 12px; border-radius: 10px; white-space: nowrap;
  font: 800 clamp(18px, 2.8dvh, 22px)/1 ${MP_DISPLAY}; font-variant-numeric: tabular-nums; color: color-mix(in srgb, var(--vw-ink) 70%, transparent); background: #F4F1EA; box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--mp-deep) 20%, transparent); }
.mp-dial-read small { font-size: .6em; letter-spacing: .08em; }
.mp-dial-read.is-on { color: var(--vw-accent-deep); background: #FFFBEA; box-shadow: inset 0 0 0 2px var(--vw-accent), 0 0 14px color-mix(in srgb, var(--vw-accent) 50%, transparent); }
.mp-radio-ctrls { display: flex; align-items: center; justify-content: center; gap: 14px; }
.mp-knob-btn { width: 48px; height: 44px; border-radius: 14px; border: 0; cursor: pointer; font: 700 16px ${FONTS.ui}; color: var(--vw-accent-deep); background: #FFFFFF;
  box-shadow: 0 3px 0 color-mix(in srgb, var(--mp-deep) 35%, transparent); touch-action: manipulation; }
.mp-knob-btn:active { transform: translateY(2px); box-shadow: 0 1px 0 color-mix(in srgb, var(--mp-deep) 35%, transparent); }
.mp-knob-btn:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 2px; }
.mp-knob { width: 50px; height: 50px; border-radius: 50%; background: radial-gradient(circle at 40% 35%, #FFFFFF, var(--vw-paper) 50%, color-mix(in srgb, var(--vw-accent) 30%, #FFFFFF));
  box-shadow: 0 0 0 3px #FFFFFF, 0 4px 0 color-mix(in srgb, var(--mp-deep) 35%, transparent); position: relative; transition: transform .15s ease; }
.mp-knob::after { content: ""; position: absolute; left: 50%; top: 5px; width: 4px; height: 14px; margin-left: -2px; border-radius: 2px; background: var(--vw-accent-deep); }
.mp-vn-slot { width: 100%; min-height: 0; max-height: 100%; display: grid; align-items: start; overflow-y: auto; overscroll-behavior: contain; border-radius: 22px; }
/* Short phones: a slimmer speaker so the voice note below never slides under the pill. */
@media (orientation: landscape) and (max-height: 500px) { .mp-radio-wrap { zoom: .8; } .mp-radio-grille { display: none; } .mp-radio-wrap { gap: 8px; } .mp-radio-face { gap: 8px; padding: 10px 12px; } }
@media (max-height: 700px) { .mp-radio { margin-top: 24px; } .mp-radio-grille { height: clamp(28px, 5.5dvh, 46px); } .mp-radio-face { padding: 12px 14px 12px; gap: 9px; } .mp-dial { height: 54px; } }
.mp-vn { display: flex; gap: 10px; align-items: flex-start; text-align: left; padding: 12px 14px; border-radius: 22px 22px 22px 6px; background: #FFFFFF;
  box-shadow: 0 0 0 2px var(--vw-edge), 0 16px 30px -18px color-mix(in srgb, var(--mp-deep) 60%, transparent); }
.mp-vn-play { flex: none; width: 38px; height: 38px; border-radius: 50%; display: grid; place-items: center; color: #FFFFFF; font-size: 14px; background: var(--vw-accent); }
.mp-vn-body { min-width: 0; display: grid; gap: 6px; }
.mp-vn-wave { display: flex; align-items: center; gap: 2.5px; height: 22px; }
.mp-vn-wave i { width: 3px; height: var(--h); border-radius: 3px; background: color-mix(in srgb, var(--vw-accent) 70%, #FFFFFF); animation: mp-wave .7s ease-in-out infinite alternate; }
@keyframes mp-wave { from { transform: scaleY(.4) } to { transform: scaleY(1) } }
.mp-vn-text { font: 400 clamp(17px, 2.5dvh, 20px)/1.35 ${MP_HAND}; color: var(--vw-ink); overflow-wrap: anywhere; }
.mp-vn-text.is-soft { color: var(--vw-ink-soft); font-size: clamp(16px, 2.3dvh, 18px); }
.mp-vn-meta { font: 600 13.5px ${FONTS.ui}; color: var(--vw-ink-soft); }
.mp-vn.is-static { align-items: center; border-radius: 22px; }
.mp-vn-static { flex: none; width: 38px; height: 38px; border-radius: 50%; background: repeating-radial-gradient(circle at 30% 40%, #DDD 0 1px, #FFF 1px 3px); animation: mp-fuzz .2s steps(2) infinite; }
@keyframes mp-fuzz { to { background-position: 3px 2px } }
.mp-radio-gif { position: absolute; left: -10px; top: -6px; transform: rotate(-10deg) scale(.82); transform-origin: 0 0; z-index: 2; pointer-events: none; }
@media (prefers-reduced-motion: reduce) { .mp-vn-wave i, .mp-dial-scale em, .mp-radio.is-tuned .mp-radio-grille, .mp-vn-static { animation: none; } }
`;

// ─── 3 · The photo booth ────────────────────────────────────────────────────

export function PhotoBooth({ photos, placeholders, onNext }: { photos: LovePhoto[]; placeholders: number; onNext: () => void }) {
  const { cue } = useMp();
  const reduced = useReducedMotion();
  const [p, setP] = useState(0);
  const [printed, setPrinted] = useState(false);
  const [zoom, setZoom] = useState<number | null>(null);
  const drag = useRef<{ y0: number; p0: number } | null>(null);
  const frames = useMemo(() => [...photos.map((ph) => ({ ph })), ...Array.from({ length: placeholders }, () => ({ ph: null as LovePhoto | null }))], [photos, placeholders]);

  const finish = () => {
    if (printed) return;
    setPrinted(true);
    setP(1);
    haptic([8, 60, 8, 60, 8]);
    cue("projector-loop", { gain: 0.25, dur: 0.9 });
    cue("chime", { gain: 0.45, at: 0.9 });
  };
  useEffect(() => {
    if (!printed) return;
    frames.forEach((_, k) => window.setTimeout(() => cue("snap", { gain: 0.35 }), reduced ? 0 : 500 + k * 650));
  }, [printed, frames, cue, reduced]);

  const down = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (printed) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { y0: e.clientY, p0: p };
  };
  const move = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || printed) return;
    const v = Math.max(0, Math.min(1, d.p0 + (e.clientY - d.y0) / 170));
    setP(v);
    if (v > 0.62) {
      drag.current = null;
      finish();
    }
  };
  const up = () => {
    const d = drag.current;
    drag.current = null;
    if (printed) return;
    // A plain tap prints it too.
    if ((d && Math.abs(p - d.p0) < 0.04) || p > 0.45) finish();
    else setP(p * 0.6);
  };

  useNext(printed ? "Next, a picnic date" : null, onNext, "picnic");
  const z = zoom !== null ? frames[zoom]?.ph : null;
  return (
    <>
      <style>{BOOTH_CSS}</style>
      <Head kicker="Photo booth" title={printed ? "Us, developing slowly 📸" : "Our photo booth strip"} sub={printed ? (photos.length ? "Tap a photo to see it bigger" : undefined) : undefined} />
      <div className="mp-fill">
        <div className="mp-booth mp-zoom">
          <div className="mp-booth-top" aria-hidden>
            <span className="mp-booth-lights">
              {Array.from({ length: 9 }, (_, k) => (
                <i key={k} style={{ animationDelay: `${k * 0.15}s` }} />
              ))}
            </span>
            <span className="mp-booth-sign">PHOTO ♥ BOOTH</span>
            <span className="mp-booth-slot" />
          </div>
          <div className={`mp-strip-window${printed ? " is-printed" : ""}`} style={{ ["--ghost" as string]: String(Math.max(0, 1 - p * 2)) }}>
            {printed ? (
              <MpScroll className="mp-strip-scroll" label="Your photo strip">
                <Strip frames={frames} printed onZoom={setZoom} reduced={reduced} />
              </MpScroll>
            ) : (
              <div className="mp-strip-peek" style={{ transform: `translateY(calc(-100% + ${86 + p * 260}px))` }}>
                <Strip frames={frames} printed={false} onZoom={() => {}} reduced={reduced} />
              </div>
            )}
            {!printed && (
              <button type="button" className="mp-strip-tab" style={{ transform: `translate(-50%, ${72 + p * 260}px)` }} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} aria-label="Pull the photo strip out" data-mp-strip>
                <span aria-hidden>pull ↓</span>
              </button>
            )}
          </div>
        </div>
      </div>
      <Hint show={!printed}>Pull the strip down out of the slot</Hint>
      <AnimatePresence>
        {z && (
          <motion.div className="mp-lb" role="dialog" aria-modal="true" aria-label={z.caption || "Photo"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setZoom(null)}>
            <motion.figure className="mp-lb-card" initial={reduced ? false : { scale: 0.8, rotate: -4 }} animate={{ scale: 1, rotate: -1.5 }} exit={reduced ? undefined : { scale: 0.85, opacity: 0 }} transition={{ type: "spring", stiffness: 260, damping: 20 }} onClick={(e) => e.stopPropagation()}>
              <div className="mp-lb-img">
                <CroppedPhoto photo={z} eager />
              </div>
              <figcaption>
                {z.caption && <b>{z.caption}</b>}
                {z.note && <span>{z.note}</span>}
              </figcaption>
              <button type="button" className="mp-ghost" onClick={() => setZoom(null)} autoFocus>
                Close
              </button>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Strip({ frames, printed, onZoom, reduced }: { frames: { ph: LovePhoto | null }[]; printed: boolean; onZoom: (k: number) => void; reduced: boolean }) {
  return (
    <ol className={`mp-strip${printed ? " is-printed" : ""}`}>
      {frames.map(({ ph }, k) => (
        <li key={k} style={{ ["--d" as string]: reduced ? "0s" : `${0.5 + k * 0.65}s` }}>
          {ph ? (
            <button type="button" className="mp-frame" onClick={() => printed && onZoom(k)} tabIndex={printed ? 0 : -1} aria-label={ph.caption ? `Open photo: ${ph.caption}` : `Open photo ${k + 1}`}>
              <span className="mp-frame-img">
                <CroppedPhoto photo={ph} eager={k < 2} />
              </span>
              {ph.caption && <span className="mp-frame-cap">{ph.caption}</span>}
            </button>
          ) : (
            <span className="mp-frame is-ph">
              <span className="mp-frame-img mp-frame-empty">📸</span>
              <span className="mp-frame-cap">your photo here</span>
            </span>
          )}
        </li>
      ))}
      <li className="mp-strip-foot" aria-hidden>
        ♥ {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} ♥
      </li>
    </ol>
  );
}

const BOOTH_CSS = `
.mp-booth { position: relative; width: min(100%, 360px); height: 100%; display: grid; grid-template-rows: auto minmax(0, 1fr); justify-items: center; }
.mp-booth-top { position: relative; width: 100%; height: clamp(88px, 14dvh, 112px); border-radius: 24px 24px 14px 14px; box-sizing: border-box; display: grid; place-items: center;
  background: linear-gradient(180deg, color-mix(in srgb, var(--vw-accent) 40%, #FFFFFF), color-mix(in srgb, var(--vw-accent) 62%, #FFFFFF));
  box-shadow: inset 0 3px 0 rgba(255,255,255,.6), 0 0 0 3px #FFFFFF, 0 18px 30px -18px color-mix(in srgb, var(--mp-deep) 70%, transparent); z-index: 2; }
.mp-booth-lights { position: absolute; left: 14px; right: 14px; top: 9px; display: flex; justify-content: space-between; }
.mp-booth-lights i { width: 9px; height: 9px; border-radius: 50%; background: #FFF4C2; box-shadow: 0 0 8px 2px rgba(255,236,150,.8); animation: mp-bulb 1.4s ease-in-out infinite; }
@keyframes mp-bulb { 0%, 100% { opacity: 1 } 50% { opacity: .35 } }
.mp-booth-sign { font: 800 clamp(19px, 3dvh, 24px) ${MP_DISPLAY}; letter-spacing: .06em; color: #FFFFFF; text-shadow: 0 2px 0 var(--mp-deep); margin-top: 6px; }
.mp-booth-slot { position: absolute; left: 22%; right: 22%; bottom: 10px; height: 10px; border-radius: 99px; background: color-mix(in srgb, var(--mp-deep) 70%, #000); box-shadow: inset 0 2px 3px rgba(0,0,0,.5); }
.mp-strip-window { position: relative; width: 100%; height: 100%; min-height: 0; overflow: hidden; display: grid; justify-items: center; margin-top: -14px; padding-top: 14px; }
.mp-strip-peek { width: 100%; display: grid; justify-items: center; transition: transform .25s ease; align-self: start; }
.mp-strip-window::after { content: ""; position: absolute; left: 50%; top: 150px; width: min(64cqw, 200px); height: min(46cqh, 300px); transform: translateX(-50%); border: 2.5px dashed color-mix(in srgb, var(--vw-accent) 35%, transparent); border-radius: 8px; pointer-events: none; opacity: var(--ghost, 1); }
.mp-strip-window.is-printed::after { display: none; }
.mp-strip-scroll { width: 100%; height: 100%; }
.mp-strip-scroll .mp-scroll-body { display: grid; justify-items: center; padding: 4px 0 16px; }
.mp-strip { list-style: none; margin: 0; padding: 12px 12px 8px; width: min(64cqw, 200px); box-sizing: border-box; display: grid; gap: 10px; background: #FFFFFF; border-radius: 4px;
  box-shadow: 0 0 0 1px rgba(0,0,0,.05), 0 18px 30px -18px color-mix(in srgb, var(--mp-deep) 70%, transparent); transform: rotate(-1.5deg); }
@media (min-width: 768px) { .mp-strip { width: 230px; } }
.mp-frame { display: grid; gap: 4px; width: 100%; padding: 0; border: 0; background: none; cursor: pointer; touch-action: manipulation; }
.mp-frame:focus-visible { outline: 3px solid var(--vw-accent); outline-offset: 3px; }
.mp-frame.is-ph { cursor: default; }
.mp-frame-img { display: block; width: 100%; aspect-ratio: 1; overflow: hidden; border-radius: 2px; background: #EEE; }
.mp-strip .mp-frame-img { filter: blur(7px) sepia(1) brightness(1.5) contrast(.6); }
.mp-strip.is-printed .mp-frame-img { animation: mp-develop 1.6s ease-out var(--d) forwards; }
@keyframes mp-develop { 0% { filter: blur(7px) sepia(1) brightness(1.5) contrast(.6) } 60% { filter: blur(1px) sepia(.4) brightness(1.1) contrast(.9) } 100% { filter: none } }
.mp-frame-empty { display: grid; place-items: center; font-size: 34px; background: repeating-linear-gradient(45deg, var(--mp-blush) 0 10px, #FFFFFF 10px 20px); }
.mp-frame-cap { font: 400 16px/1.15 ${MP_HAND}; color: #3B2A33; overflow-wrap: anywhere; }
.mp-strip-foot { text-align: center; font: 700 11px ${FONTS.ui}; letter-spacing: .08em; color: #8A7480; padding-top: 2px; }
.mp-strip-tab { position: absolute; left: 50%; top: 0; z-index: 3; min-width: 96px; height: 46px; padding: 0 16px; border: 0; border-radius: 0 0 16px 16px; cursor: grab; touch-action: none;
  background: #FFFFFF; color: var(--vw-accent-deep); font: 800 15px ${MP_DISPLAY}; box-shadow: 0 0 0 2px var(--vw-edge), 0 10px 18px -10px color-mix(in srgb, var(--mp-deep) 60%, transparent); transition: transform .2s ease; }
.mp-strip-tab span { display: inline-block; animation: mp-tug 1.1s ease-in-out infinite; }
@keyframes mp-tug { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(5px) } }
.mp-strip-tab:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 3px; }
.mp-lb { position: fixed; inset: 0; z-index: 90; display: grid; place-items: center; padding: 20px; background: color-mix(in srgb, var(--mp-deep) 30%, transparent); backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px); }
.mp-lb-card { margin: 0; width: min(340px, 100%); max-height: calc(100dvh - 60px); overflow: auto; box-sizing: border-box; padding: 14px 14px 12px; background: #FFFFFF; border-radius: 6px; display: grid; gap: 8px; justify-items: center; box-shadow: 0 30px 60px -20px rgba(0,0,0,.35); }
.mp-lb-img { width: 100%; aspect-ratio: 1; overflow: hidden; border-radius: 3px; }
.mp-lb-card figcaption { display: grid; gap: 4px; text-align: center; }
.mp-lb-card b { font: 700 22px/1.15 ${MP_HAND}; color: #3B2A33; overflow-wrap: anywhere; }
.mp-lb-card figcaption span { font: 500 14.5px/1.4 ${FONTS.ui}; color: #6E5A64; overflow-wrap: anywhere; }
@media (prefers-reduced-motion: reduce) { .mp-booth-lights i, .mp-strip-tab span { animation: none; } .mp-strip.is-printed .mp-frame-img { animation-duration: .01s; } }
`;
