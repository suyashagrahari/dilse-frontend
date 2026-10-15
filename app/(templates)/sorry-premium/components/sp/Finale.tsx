"use client";

// Scenes 8–11: the peace contract (she signs it), "Forgive me?", the rainbow
// (she pushes the last clouds away) or a gentle "take your time", and the
// Peace Treaty keepsake.
//
// Research note: pressuring for forgiveness is what makes an apology feel
// fake, so "I need a little time" is a real answer by default (the sender can
// switch to Yes-only), and its room is warm and complete — no guilt-trip.

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EndingActions, burst, haptic, useReducedMotion, type KeepsakeItem, type KeepsakeLayout } from "../../../_valentine/kit";
import type { SpPaletteDef } from "../../../_valentine/days/sorry-premium";
import type { DayConfig, ValentineDayData } from "../../../_valentine/types";
import { FONTS } from "../../../_valentine/theme";
import { PuddleBear } from "./art";
import { SP_DISPLAY, SP_HAND, SP_SIGN } from "./fonts";
import { useNext, useSp } from "./stage";
import { Head, SpScroll } from "./ui";

// ─── 8 · The peace contract ─────────────────────────────────────────────────

export function Contract({ promises, sender, recipient, sticker, onSigned, onNext }: { promises: readonly string[]; sender: string; recipient: string; sticker: ReactNode; onSigned: (png: string) => void; onNext: () => void }) {
  const { cue } = useSp();
  const reduced = useReducedMotion();
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const signFace = useRef<HTMLSpanElement | null>(null);
  const drawing = useRef<{ x: number; y: number } | null>(null);
  const ink = useRef(0);
  const [inked, setInked] = useState(false);
  const [sealed, setSealed] = useState(false);
  const [ticked, setTicked] = useState<number[]>([]);

  // Size the canvas to its box at device pixels.
  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const fit = () => {
      const r = c.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (!r.width) return;
      c.width = Math.round(r.width * dpr);
      c.height = Math.round(r.height * dpr);
      const g = c.getContext("2d");
      if (g) {
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        g.lineCap = "round";
        g.lineJoin = "round";
        g.lineWidth = 3.2;
        g.strokeStyle = getComputedStyle(c).color || "#33285A";
      }
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(c);
    return () => ro.disconnect();
  }, []);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const down = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (sealed) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = pos(e);
    cue("nib-scratch", { gain: 0.25 });
  };
  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const p0 = drawing.current;
    const g = canvas.current?.getContext("2d");
    if (!p0 || !g) return;
    const p = pos(e);
    g.beginPath();
    g.moveTo(p0.x, p0.y);
    g.lineTo(p.x, p.y);
    g.stroke();
    ink.current += Math.hypot(p.x - p0.x, p.y - p0.y);
    drawing.current = p;
    if (!inked && ink.current > 90) setInked(true);
  };
  const up = () => {
    drawing.current = null;
  };
  const clear = () => {
    const c = canvas.current;
    const g = c?.getContext("2d");
    if (!c || !g) return;
    g.save();
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, c.width, c.height);
    g.restore();
    ink.current = 0;
    setInked(false);
  };
  // No finger? A typed signature, in her name.
  const autograph = () => {
    const c = canvas.current;
    const g = c?.getContext("2d");
    if (!c || !g) return;
    clear();
    const r = c.getBoundingClientRect();
    g.save();
    g.fillStyle = g.strokeStyle as string;
    const face = signFace.current ? getComputedStyle(signFace.current).fontFamily : "cursive";
    g.font = `700 ${Math.round(r.height * 0.46)}px ${face}`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(recipient, r.width / 2, r.height * 0.55, r.width * 0.9);
    g.restore();
    ink.current = 999;
    setInked(true);
  };

  const seal = () => {
    if (sealed || !inked) return;
    const png = canvas.current?.toDataURL("image/png") ?? "";
    onSigned(png);
    setSealed(true);
    haptic(26);
    cue("wax-crack", { gain: 0.6 });
    cue("chime-cascade", { gain: 0.6, at: 0.25 });
    if (!reduced) burst({ kind: "hearts", origin: { x: 0.5, y: 0.55 }, count: 26, emojis: ["💗", "🖋️", "✨", "🌈"] });
  };

  useNext(sealed ? "Signed, sealed ☀️" : inked ? "Sign it" : null, sealed ? onNext : seal, sealed ? "sun" : "pen", sealed);

  return (
    <>
      <Head kicker="My repair plan" title="The peace contract" sub={sealed ? undefined : "Tap each clause you accept, then sign 🖋️"} />
      {sealed && (
        <motion.div className="sp-contract-gifrow" initial={reduced ? false : { scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 320, damping: 16 }}>
          {sticker}
        </motion.div>
      )}
      <div className="sp-fill">
        <div className={`sp-contract sp-card${sealed ? " is-sealed" : ""}`} data-sp-contract={sealed ? "sealed" : inked ? "inked" : "blank"}>
          <p className="sp-contract-k">
            between <b>{sender}</b> &amp; <b>{recipient}</b>
          </p>
          <SpScroll className="sp-contract-scroll" label="The clauses">
            <ol className="sp-clauses">
              {promises.map((p, k) => {
                const on = ticked.includes(k);
                return (
                  <li key={k}>
                    <button
                      type="button"
                      className={on ? "is-on" : undefined}
                      aria-pressed={on}
                      onClick={() => {
                        setTicked((t) => (on ? t.filter((v) => v !== k) : [...t, k]));
                        if (!on) cue("tick", { gain: 0.45, detune: k * 120 });
                      }}
                    >
                      <span className="sp-tick" aria-hidden>
                        {on ? "✓" : ""}
                      </span>
                      <span className="sp-clause-t">{p}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </SpScroll>
          <div className="sp-sigs">
            <div className="sp-sig">
              <span className="sp-sig-name" ref={signFace} style={{ ["--len" as string]: String(Math.max(6, sender.length)) }}>
                {sender}
              </span>
              <span className="sp-sig-k">{sender}, sorry one</span>
            </div>
            <div className="sp-sig is-pad">
              <canvas
                ref={canvas}
                className="sp-pad"
                onPointerDown={down}
                onPointerMove={move}
                onPointerUp={up}
                onPointerCancel={up}
                aria-label={`Sign here, ${recipient}`}
                data-sp-pad
              />
              {!inked && !sealed && <span className="sp-pad-hint" aria-hidden>sign here ✍️</span>}
              <span className="sp-sig-k">
                {recipient}
                {!sealed && (
                  <>
                    {" · "}
                    <button type="button" className="sp-linkbtn" onClick={inked ? clear : autograph}>
                      {inked ? "clear" : "can't draw? tap"}
                    </button>
                  </>
                )}
              </span>
            </div>
          </div>
          <AnimatePresence>
            {sealed && (
              <motion.span className="sp-contract-stamp" initial={reduced ? false : { scale: 2.4, opacity: 0, rotate: 30 }} animate={{ scale: 1, opacity: 1, rotate: 12 }} transition={{ type: "spring", stiffness: 300, damping: 16 }}>
                SIGNED ☀️
              </motion.span>
            )}
          </AnimatePresence>
          {sealed && <div className="sp-contract-gif">{sticker}</div>}
        </div>
      </div>
      <style>{CONTRACT_CSS}</style>
    </>
  );
}

const CONTRACT_CSS = `
.sp-contract { position: relative; width: min(100%, 420px); max-height: 100%; padding: 14px 14px 12px; display: flex; flex-direction: column; gap: 8px;
  background: linear-gradient(180deg, #FFFFFF, var(--vw-paper)); box-shadow: inset 0 0 0 2px var(--vw-gold), inset 0 0 0 6px var(--vw-paper), inset 0 0 0 7.5px var(--vw-edge), 0 24px 40px -22px color-mix(in srgb, var(--sp-deep) 70%, transparent); }
.sp-contract-k { flex: none; margin: 0; font: 500 13.5px ${FONTS.ui}; color: var(--vw-ink-soft); overflow-wrap: anywhere; }
.sp-contract-k b { color: var(--vw-accent-deep); }
.sp-contract-scroll { flex: 1 1 auto; }
.sp-clauses { list-style: none; margin: 0; padding: 2px 2px 6px; display: grid; gap: 6px; counter-reset: cl; }
.sp-clauses button { width: 100%; min-height: 44px; display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 10px; align-items: center; padding: 7px 10px; border: 0; border-radius: 14px; cursor: pointer; text-align: left;
  background: color-mix(in srgb, var(--sp-blush) 45%, #FFFFFF); color: var(--vw-ink); touch-action: manipulation; transition: background .2s ease; }
.sp-clauses button.is-on { background: color-mix(in srgb, var(--sp-blush) 85%, #FFFFFF); }
.sp-clauses button:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 2px; }
.sp-tick { width: 24px; height: 24px; border-radius: 7px; display: grid; place-items: center; font: 800 15px ${FONTS.ui}; color: #FFFFFF; background: #FFFFFF; box-shadow: inset 0 0 0 2px var(--vw-accent); }
.is-on .sp-tick { background: var(--vw-accent); }
.sp-clause-t { font: 400 clamp(15.5px, 2.3dvh, 18px)/1.3 ${SP_HAND}; overflow-wrap: anywhere; }
.sp-sigs { flex: none; display: grid; grid-template-columns: 1fr 1.25fr; gap: 10px; align-items: end; }
.sp-sig { display: grid; gap: 2px; justify-items: center; min-width: 0; container-type: inline-size; }
.sp-sig-name { font: 700 clamp(24px, 3.6dvh, 30px)/1.1 ${SP_SIGN}; font-size: min(clamp(24px, 3.6dvh, 30px), calc(190cqi / var(--len, 8))); min-height: 1.1em; color: var(--vw-accent-deep); border-bottom: 2px solid var(--vw-ink-soft); width: 100%; text-align: center; padding-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sp-sig-k { font: 600 13.5px/1.25 ${FONTS.ui}; color: var(--vw-ink-soft); overflow-wrap: anywhere; text-align: center; }
.sp-sig.is-pad { position: relative; }
.sp-pad { display: block; width: 100%; height: clamp(64px, 11dvh, 92px); border-radius: 12px; touch-action: none; cursor: crosshair; color: var(--vw-ink);
  background: repeating-linear-gradient(0deg, transparent 0 calc(100% - 3px), var(--vw-ink-soft) calc(100% - 3px) 100%), color-mix(in srgb, #FFF6C9 60%, #FFFFFF); box-shadow: inset 0 0 0 2px var(--vw-edge); }
.sp-pad-hint { position: absolute; left: 0; right: 0; top: 28%; pointer-events: none; font: 600 15px ${SP_HAND}; color: var(--vw-ink-soft); animation: sp-hint-pulse 1.6s ease-in-out infinite; }
@keyframes sp-hint-pulse { 50% { opacity: .45 } }
.sp-linkbtn { position: relative; border: 0; background: none; padding: 4px 2px; margin: -4px 0; min-height: 30px; font: 700 14px ${FONTS.ui}; color: var(--vw-accent-deep); text-decoration: underline; text-underline-offset: 2px; cursor: pointer; }
.sp-linkbtn::after { content: ""; position: absolute; inset: -8px -8px; } /* 44px+ hit area, same look */
.sp-contract-stamp { position: absolute; right: 18px; bottom: 34px; pointer-events: none; padding: 4px 10px; border: 3px solid var(--vw-accent); border-radius: 10px; font: 800 14px ${FONTS.ui}; letter-spacing: .1em; color: var(--vw-accent-deep); background: color-mix(in srgb, var(--vw-paper) 70%, transparent); }
.sp-contract-gif { position: absolute; right: -6px; top: -46px; transform: rotate(8deg); pointer-events: none; }
.sp-contract-gif .sp-stk img { width: clamp(64px, 12dvh, 92px) !important; height: auto !important; }
/* Phones: no room beside the title, so the sticker pops in where the subtitle was and the card makes room. */
.sp-contract-gifrow { display: none; }
/* Wide screens: the sticker sits beside the contract, never on its words. */
@media (min-width: 768px) { .sp-contract-gif { right: -96px; top: 6px; } }
@media (max-width: 767px), (orientation: landscape) and (max-height: 500px) {
  .sp-contract-gif { display: none; }
  .sp-contract-gifrow { display: block; flex: none; margin: -4px 0 -2px; }
  .sp-contract-gifrow .sp-stk { padding: 4px; border-radius: 16px; }
  .sp-contract-gifrow .sp-stk img { width: auto !important; height: clamp(46px, 8dvh, 64px) !important; border-radius: 12px; }
}
@media (orientation: landscape) and (max-height: 500px) { .sp-contract-gifrow { display: none !important; } }
@media (prefers-reduced-motion: reduce) { .sp-pad-hint { animation: none; } }
`;

// ─── 9 · Forgive me? ────────────────────────────────────────────────────────

export function Question({ question, yesLabel, timeLabel, canWait, onYes, onNo }: { question: string; yesLabel: string; timeLabel: string; canWait: boolean; onYes: () => void; onNo: () => void }) {
  const { cue } = useSp();
  const reduced = useReducedMotion();
  const [asking, setAsking] = useState(false);
  const [lean, setLean] = useState(false);
  const yes = () => {
    cue("chime-cascade", { gain: 0.8 });
    cue("kiss", { gain: 0.5, at: 0.15 });
    onYes();
  };
  return (
    <>
      <Head kicker="The big question" title={question} sub="Whatever you choose, I'll understand 🤍" />
      <div className="sp-fill">
        <div className={`sp-q${lean ? " is-lean" : ""}`}>
          <div className="sp-q-bear" aria-hidden>
            <PuddleBear mood="hope" size="100%" />
          </div>
        </div>
      </div>
      <div className="sp-q-actions">
        <button type="button" className="sp-q-yes" onClick={yes} onPointerEnter={() => setLean(true)} onPointerLeave={() => setLean(false)} onFocus={() => setLean(true)} onBlur={() => setLean(false)} data-sp-yes>
          <span aria-hidden>☀️</span> {yesLabel}
        </button>
        {canWait && (
          <button
            type="button"
            className="sp-q-wait"
            onClick={() => {
              haptic(8);
              cue("swoosh-soft", { gain: 0.35 });
              setAsking(true);
            }}
            data-sp-wait
          >
            {timeLabel}
          </button>
        )}
      </div>
      <AnimatePresence>
        {asking && (
          <motion.div className="sp-sure" role="dialog" aria-modal="true" aria-labelledby="sp-sure-t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.22 }}>
            <motion.div className="sp-sure-card" initial={reduced ? false : { y: 24, scale: 0.94 }} animate={{ y: 0, scale: 1 }} exit={reduced ? undefined : { y: 16, scale: 0.96 }} transition={{ type: "spring", stiffness: 320, damping: 24 }}>
              <p className="sp-sure-e" aria-hidden>
                🌦️
              </p>
              <h3 id="sp-sure-t">Need a little time?</h3>
              <p className="sp-sure-s">That&apos;s completely okay. They&apos;ll know you read every word, and they&apos;ll wait under the umbrella.</p>
              <button type="button" className="sp-sure-back" autoFocus onClick={() => setAsking(false)}>
                Wait, take me back
              </button>
              <button
                type="button"
                className="sp-sure-no"
                data-sp-confirm-wait
                onClick={() => {
                  setAsking(false);
                  onNo();
                }}
              >
                Yes, I need some time
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <style>{Q_CSS}</style>
    </>
  );
}

const Q_CSS = `
.sp-q { width: 100%; height: 100%; display: grid; place-items: center; }
.sp-q-bear { width: min(64cqh, 62cqw, 240px); transition: transform .5s cubic-bezier(.3,1.5,.5,1); filter: drop-shadow(0 16px 22px color-mix(in srgb, var(--sp-deep) 26%, transparent)); }
.sp-q.is-lean .sp-q-bear { transform: translateY(-6px) rotate(-4deg) scale(1.04); }
.sp-q-actions { flex: none; width: 100%; max-width: 380px; display: grid; gap: 10px; justify-items: center; }
.sp-q-yes { width: 100%; min-height: 60px; padding: 12px 22px; border: 0; border-radius: 999px; cursor: pointer; touch-action: manipulation; color: #FFFFFF; font: 800 clamp(19px, 2.8dvh, 22px)/1.2 ${SP_DISPLAY};
  background: linear-gradient(180deg, color-mix(in srgb, var(--vw-accent) 70%, #FFFFFF), var(--vw-accent) 55%, var(--vw-accent-deep)); text-shadow: 0 1px 0 color-mix(in srgb, var(--sp-deep) 60%, transparent);
  box-shadow: 0 5px 0 var(--sp-deep), 0 0 0 4px color-mix(in srgb, var(--vw-paper) 72%, transparent), 0 0 36px -4px color-mix(in srgb, #FFD45E 70%, transparent); animation: sp-yes-glow 2.2s ease-in-out infinite; overflow-wrap: anywhere; }
@keyframes sp-yes-glow { 50% { box-shadow: 0 5px 0 var(--sp-deep), 0 0 0 4px color-mix(in srgb, var(--vw-paper) 72%, transparent), 0 0 52px 4px color-mix(in srgb, #FFD45E 80%, transparent) } }
.sp-q-yes:active { transform: translateY(4px); }
.sp-q-yes:focus-visible, .sp-q-wait:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 4px; }
.sp-q-wait { min-height: 48px; padding: 8px 20px; border-radius: 999px; cursor: pointer; border: 2px solid var(--vw-edge); background: color-mix(in srgb, var(--vw-paper) 82%, transparent); color: var(--vw-ink); font: 700 16px ${FONTS.ui}; }
.sp-sure { position: fixed; inset: 0; z-index: 90; display: grid; place-items: center; padding: 20px; background: color-mix(in srgb, var(--sp-deep) 30%, transparent); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); }
.sp-sure-card { width: min(340px, 100%); box-sizing: border-box; padding: 22px 20px 18px; border-radius: 26px; text-align: center; display: grid; gap: 10px; justify-items: center;
  background: var(--vw-paper); color: var(--vw-ink); box-shadow: 0 0 0 3px var(--vw-edge), 0 30px 60px -20px color-mix(in srgb, var(--sp-deep) 70%, transparent); }
.sp-sure-e { margin: 0; font-size: 44px; line-height: 1; }
.sp-sure-card h3 { margin: 0; font: 800 clamp(26px, 7vw, 32px)/1.1 ${SP_DISPLAY}; }
.sp-sure-s { margin: 0 0 6px; font: 500 15px/1.45 ${FONTS.ui}; color: var(--vw-ink-soft); }
.sp-sure-back { width: 100%; min-height: 52px; border: 0; border-radius: 999px; cursor: pointer; font: 800 17px ${SP_DISPLAY}; color: #FFFFFF;
  background: linear-gradient(180deg, color-mix(in srgb, var(--vw-accent) 70%, #FFFFFF), var(--vw-accent-deep)); box-shadow: 0 4px 0 var(--sp-deep); }
.sp-sure-no { min-height: 44px; padding: 0 18px; border: 0; background: none; cursor: pointer; font: 600 15px ${FONTS.ui}; color: var(--vw-ink-soft); text-decoration: underline; text-underline-offset: 3px; }
.sp-sure-back:focus-visible, .sp-sure-no:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 3px; }
@media (prefers-reduced-motion: reduce) { .sp-q-yes { animation: none; } }
`;

// ─── 10 · The rainbow (she pushes the last clouds away) ─────────────────────

export function Rainbow({ recipient, yesLine, sticker, cleared, onClear, onNext }: { recipient: string; yesLine: string; sticker: ReactNode; cleared: boolean; onClear: () => void; onNext: () => void }) {
  const { cue } = useSp();
  const reduced = useReducedMotion();
  const [pull, setPull] = useState(0);
  const clear = () => {
    if (cleared) return;
    haptic(30);
    cue("whoosh", { gain: 0.5 });
    cue("chime-cascade", { gain: 0.7, at: 0.3 });
    onClear();
  };
  useNext(cleared ? "Our peace treaty" : null, onNext, "rainbow");
  return (
    <>
      <Head kicker={cleared ? "The rain's gone" : "One last thing"} title={cleared ? <>{recipient} forgave me 🌈</> : "Push the last clouds away"} sub={cleared ? undefined : "Drag them apart, or tap them ☁️"} />
      <div className="sp-fill">
        {cleared ? (
          <motion.div className="sp-yes sp-zoom" initial={reduced ? false : { opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 180, damping: 16, delay: reduced ? 0 : 0.3 }}>
            <div className="sp-yes-gif">{sticker}</div>
            <p className="sp-yes-line">{yesLine}</p>
          </motion.div>
        ) : (
          <div className="sp-clouds" data-sp-clouds>
            <span className="sp-peek" aria-hidden>
              ☀️
            </span>
            {[-1, 1].map((side) => (
              <motion.button
                key={side}
                type="button"
                className={`sp-bigcloud${side < 0 ? " is-l" : " is-r"}`}
                drag="x"
                dragConstraints={{ left: side < 0 ? -400 : 0, right: side < 0 ? 0 : 400 }}
                dragElastic={0.2}
                dragMomentum={false}
                onDrag={(_, info) => {
                  const p = Math.min(1, Math.abs(info.offset.x) / 110);
                  setPull(p);
                  if (p >= 1) clear();
                }}
                onDragEnd={() => setPull((p) => (p >= 1 ? p : 0))}
                onTap={clear}
                aria-label="A cloud: drag it away, or tap it"
              >
                <svg viewBox="0 0 200 110" width="100%" aria-hidden>
                  <path d="M36 96 C8 96 2 66 24 58 C20 32 52 18 72 34 C80 8 124 4 134 32 C154 18 188 30 182 58 C200 64 198 96 170 96 Z" fill="#FFFFFF" stroke="color-mix(in srgb, var(--vw-gold) 70%, #FFFFFF)" strokeWidth="4" />
                  <circle cx="80" cy="66" r="4" fill="#7A6A72" />
                  <circle cx="120" cy="66" r="4" fill="#7A6A72" />
                  <path d="M92 78 q8 -6 16 0" stroke="#7A6A72" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                </svg>
              </motion.button>
            ))}
            <span className="vw-sr" aria-live="polite">{pull > 0.5 ? "Almost…" : ""}</span>
          </div>
        )}
      </div>
      <style>{RAIN_CSS}</style>
    </>
  );
}

const RAIN_CSS = `
.sp-clouds { position: relative; width: min(100%, 420px); height: min(100%, 260px); display: grid; place-items: center; }
.sp-peek { font-size: clamp(54px, 18cqw, 80px); line-height: 1; filter: drop-shadow(0 0 20px #FFE07A); animation: sp-peek 2s ease-in-out infinite; }
@keyframes sp-peek { 50% { transform: scale(1.08) rotate(10deg) } }
.sp-bigcloud { position: absolute; top: 50%; width: 64%; padding: 0; border: 0; background: none; cursor: grab; touch-action: none; translate: 0 -50%; filter: drop-shadow(0 14px 20px color-mix(in srgb, var(--sp-deep) 22%, transparent)); }
.sp-bigcloud.is-l { left: -4%; } .sp-bigcloud.is-r { right: -4%; top: 58%; }
.sp-bigcloud:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 2px; border-radius: 30px; }
.sp-yes { display: grid; gap: clamp(10px, 2dvh, 16px); justify-items: center; max-width: 400px; }
.sp-yes-gif .sp-stk img { width: clamp(120px, 26dvh, 200px) !important; height: auto !important; }
.sp-yes-line { margin: 0; padding: 12px 16px; border-radius: 20px; background: color-mix(in srgb, var(--vw-paper) 88%, transparent); box-shadow: 0 0 0 2px var(--vw-edge);
  font: 400 clamp(18px, 2.7dvh, 22px)/1.35 ${SP_HAND}; color: var(--vw-ink); overflow-wrap: anywhere; }
@media (prefers-reduced-motion: reduce) { .sp-peek { animation: none; } }
`;

export function TimeRoom({ sender, recipient, onReplay }: { sender: string; recipient: string; onReplay: () => void }) {
  const { go } = useSp();
  const tell = () => {
    const text = `I read all of it, ${sender} 🌦️ I need a little time, but thank you for this.`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };
  useNext(`Tell ${sender}`, tell, "umbrella", false);
  return (
    <div className="sp-fill" style={{ alignContent: "center" }} data-sp-waiting>
      <div className="sp-zoom" style={{ display: "grid", gap: "clamp(10px, 2dvh, 18px)", justifyItems: "center", maxWidth: 420 }}>
        <div style={{ width: "clamp(120px, 22dvh, 180px)" }} aria-hidden>
          <PuddleBear mood="hope" size="100%" />
        </div>
        <h2 className="sp-title">Take all the time you need 🌦️</h2>
        <p style={{ margin: 0, font: `400 clamp(18px, 2.7dvh, 21px)/1.4 ${SP_HAND}`, color: "var(--vw-ink)", overflowWrap: "anywhere" }}>
          Thank you for reading every word, {recipient}. {sender} will wait right here, under the umbrella. No pressure, no rush.
        </p>
        <p style={{ margin: 0, font: `500 14px/1.4 ${FONTS.ui}`, color: "var(--vw-ink-soft)" }}>{sender} will know you answered, gently.</p>
        <button type="button" onClick={() => go(onReplay)} className="sp-ghost">
          Watch it again ☂️
        </button>
      </div>
    </div>
  );
}

// ─── 11 · The Peace Treaty ──────────────────────────────────────────────────

export function Treaty({
  day,
  data,
  mode,
  palette,
  recipient,
  sender,
  title,
  promises,
  days,
  signature,
  replyText,
  onReplay,
}: {
  day: DayConfig;
  data: ValentineDayData;
  mode: "preview" | "live";
  palette: SpPaletteDef;
  recipient: string;
  sender: string;
  title: string;
  promises: readonly string[];
  days: number;
  signature: string;
  replyText: string;
  onReplay: () => void;
}) {
  const reduced = useReducedMotion();
  const { go } = useSp();
  const [sheet, setSheet] = useState<"treaty" | "share">("treaty");
  const today = useMemo(() => new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }), []);
  const no = useMemo(() => {
    let h = 11;
    for (const ch of `${recipient}${sender}`) h = (h * 31 + ch.charCodeAt(0)) % 99991;
    return `PEACE-${String(h).padStart(5, "0")}`;
  }, [recipient, sender]);
  const terms = promises.slice(0, 3);

  const makeOwn = () => {
    haptic(12);
    const link = typeof window !== "undefined" ? `${window.location.origin}/sorry-premium` : "https://subhsandesh.in/sorry-premium";
    const text = `Someone said sorry to me with a page where the rain actually stops 🌧️→🌈\nMake one for your own person:\n${link}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  const t = palette.theme;
  const keepsake = (): KeepsakeLayout => {
    const W = 1080;
    const items: KeepsakeItem[] = [
      { type: "emoji", char: "🌈", x: W / 2, y: 150, size: 120 },
      { type: "text", text: "AFTER THE RAIN", x: W / 2, y: 270, size: 40, weight: 700, color: t.accentDeep, face: "ui" },
      { type: "rect", x: 80, y: 330, w: 920, h: 1380, radius: 56, fill: t.paper },
      { type: "rect", x: 104, y: 354, w: 872, h: 1332, radius: 44, stroke: t.gold, lineWidth: 8 },
      { type: "text", text: title, x: W / 2, y: 480, size: 70, weight: 700, color: t.ink, face: "serif", maxWidth: 820, maxLines: 2 },
      { type: "text", text: `between ${sender} & ${recipient}`, x: W / 2, y: 600, size: 40, color: t.inkSoft, face: "ui", maxWidth: 820, maxLines: 1 },
    ];
    let y = 720;
    terms.forEach((p, k) => {
      items.push({ type: "text", text: `${k + 1}. ${p}`, x: W / 2, y, size: 38, color: t.ink, face: "ui", maxWidth: 800, maxLines: 2 });
      y += 110;
    });
    if (days > 0) items.push({ type: "text", text: `${days.toLocaleString("en-IN")} days together, and counting`, x: W / 2, y: y + 10, size: 36, weight: 700, color: t.accent, face: "ui" });
    items.push({ type: "text", text: sender, x: 320, y: 1400, size: 72, face: "script", weight: 700, color: t.accentDeep, maxWidth: 380, maxLines: 1 });
    if (signature) items.push({ type: "image", src: signature, x: 580, y: 1310, w: 360, h: 130 });
    else items.push({ type: "text", text: recipient, x: 760, y: 1400, size: 72, face: "script", weight: 700, color: t.accentDeep, maxWidth: 380, maxLines: 1 });
    items.push(
      { type: "rect", x: 150, y: 1450, w: 340, h: 4, radius: 2, fill: t.inkSoft },
      { type: "rect", x: 590, y: 1450, w: 340, h: 4, radius: 2, fill: t.inkSoft },
      { type: "text", text: sender, x: 320, y: 1500, size: 30, color: t.inkSoft, face: "ui", maxWidth: 340, maxLines: 1 },
      { type: "text", text: recipient, x: 760, y: 1500, size: 30, color: t.inkSoft, face: "ui", maxWidth: 340, maxLines: 1 },
      { type: "text", text: `${today}  ·  ${no}`, x: W / 2, y: 1600, size: 30, weight: 600, color: t.inkSoft, face: "ui" },
      { type: "text", text: "☀️ RAIN CLEARED", x: W / 2, y: 1660, size: 44, weight: 700, color: t.accent, face: "ui" },
    );
    if (data.endLine) items.push({ type: "text", text: data.endLine, x: W / 2, y: 1790, size: 40, face: "serif", italic: true, color: t.ink, maxWidth: 940, maxLines: 2 });
    items.push({ type: "text", text: "Made on subhsandesh.in 🌈", x: W / 2, y: 1872, size: 30, color: t.inkSoft, face: "ui" });
    return { background: { stops: [[0, palette.sun[0]], [0.55, t.base], [1, palette.blush]] }, items };
  };

  useNext(sheet === "treaty" ? "Keep it" : "Make one ✨", sheet === "treaty" ? () => setSheet("share") : makeOwn, sheet === "treaty" ? "heart" : "sparkle", sheet === "treaty");

  if (sheet === "share")
    return (
      <>
        <Head kicker="All sunshine now" title={<>Hug time, {recipient} 🤗</>} sub={`Save your treaty, then tell ${sender}.`} />
        <div className="sp-fill">
          <motion.div initial={reduced ? false : { opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 180, damping: 16 }} style={{ width: "min(62cqh, 64cqw, 230px)" }}>
            <PuddleBear mood="happy" umbrella={false} size="100%" />
          </motion.div>
        </div>
        <div className="sp-zoom" style={{ flex: "none", width: "100%", maxWidth: 420 }}>
          <EndingActions day={day} data={data} mode={mode} onReplay={() => go(onReplay)} keepsake={keepsake} replyText={replyText} replyLabel={`💬 Reply to ${sender}`} />
        </div>
      </>
    );

  return (
    <>
      <style>{TREATY_CSS}</style>
      <div className="sp-fill">
        <motion.div className="sp-treaty sp-zoom" initial={reduced ? false : { opacity: 0, y: 30, rotate: -2 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ type: "spring", stiffness: 160, damping: 18 }} data-sp-treaty>
          <p className="sp-tr-k">After the rain · {today}</p>
          <h2 className="sp-tr-t">{title}</h2>
          <p className="sp-tr-s">
            between {sender} &amp; {recipient}
          </p>
          <ol className="sp-tr-terms">
            {terms.map((p, k) => (
              <li key={k}>{p}</li>
            ))}
          </ol>
          {days > 0 && <p className="sp-tr-days">{days.toLocaleString("en-IN")} days together, and counting ☀️</p>}
          <div className="sp-tr-sigs">
            <span className="sp-tr-sig">
              <b style={{ ["--len" as string]: String(Math.max(6, sender.length)) }}>{sender}</b>
              <i>{sender}</i>
            </span>
            <span className="sp-tr-sig">
              {signature ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={signature} alt={`${recipient}'s signature`} />
              ) : (
                <b style={{ ["--len" as string]: String(Math.max(6, recipient.length)) }}>{recipient}</b>
              )}
              <i>{recipient}</i>
            </span>
          </div>
          <span className="sp-tr-stamp" aria-hidden>
            RAIN CLEARED ☀️
          </span>
          {data.endLine && <p className="sp-tr-end">{data.endLine}</p>}
          <p className="sp-tr-no">{no}</p>
        </motion.div>
      </div>
    </>
  );
}

const TREATY_CSS = `
.sp-treaty { position: relative; width: min(100%, 390px); max-height: 100%; box-sizing: border-box; padding: 16px 18px 14px; border-radius: 28px; overflow: hidden;
  background: radial-gradient(120% 60% at 50% 0%, #FFFFFF, var(--vw-paper)); box-shadow: inset 0 0 0 3px var(--vw-gold), inset 0 0 0 9px var(--vw-paper), inset 0 0 0 10.5px var(--vw-edge), 0 28px 50px -24px color-mix(in srgb, var(--sp-deep) 70%, transparent);
  display: grid; justify-items: center; gap: 4px; text-align: center; }
.sp-treaty::before { content: ""; position: absolute; left: -20%; right: -20%; top: -62%; height: 100%; border-radius: 50%; pointer-events: none; opacity: .5;
  background: radial-gradient(circle at 50% 100%, transparent 54%, #D4C4FF 54% 57%, #B8DEFF 57% 60%, #C6EFC0 60% 63%, #FFF0A6 63% 66%, #FFD0A1 66% 69%, #FFB3C1 69% 72%, transparent 72%); }
.sp-tr-k { position: relative; margin: 0; font: 700 11px ${FONTS.ui}; letter-spacing: .18em; text-transform: uppercase; color: var(--vw-accent-deep); }
.sp-tr-t { position: relative; margin: 2px 0 0; font: 800 clamp(24px, 3.7dvh, 32px)/1.08 ${SP_DISPLAY}; color: var(--vw-ink); text-wrap: balance; overflow-wrap: anywhere; }
.sp-tr-s { margin: 0; font: 500 14px ${FONTS.ui}; color: var(--vw-ink-soft); overflow-wrap: anywhere; }
.sp-tr-terms { margin: 6px 0 0; padding: 0 0 0 22px; text-align: left; display: grid; gap: 4px; width: 100%; box-sizing: border-box; }
.sp-tr-terms li { font: 400 clamp(14.5px, 2.1dvh, 16.5px)/1.3 ${SP_HAND}; color: var(--vw-ink); overflow-wrap: anywhere; }
.sp-tr-terms li::marker { color: var(--vw-accent-deep); font-weight: 700; }
.sp-tr-days { margin: 4px 0 0; padding: 4px 12px; border-radius: 99px; background: var(--sp-blush); font: 700 13px ${FONTS.ui}; color: var(--vw-ink); }
.sp-tr-sigs { width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 8px; }
.sp-tr-sig { display: grid; gap: 2px; justify-items: center; min-width: 0; container-type: inline-size; }
.sp-tr-sig b[style] { font-size: min(clamp(22px, 3.4dvh, 28px), calc(190cqi / var(--len, 8))); }
.sp-tr-sig b { display: block; width: 100%; height: 44px; line-height: 44px; font: 700 clamp(22px, 3.4dvh, 28px)/44px ${SP_SIGN}; color: var(--vw-accent-deep); border-bottom: 2px solid var(--vw-ink-soft); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sp-tr-sig img { display: block; width: 100%; height: 44px; object-fit: contain; border-bottom: 2px solid var(--vw-ink-soft); }
.sp-tr-sig i { font: 600 13.5px ${FONTS.ui}; font-style: normal; color: var(--vw-ink-soft); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%; }
.sp-tr-stamp { position: relative; margin: 6px 0 2px; padding: 4px 9px; border: 3px solid var(--vw-accent); border-radius: 10px; transform: rotate(-5deg);
  font: 800 12px ${FONTS.ui}; letter-spacing: .08em; color: var(--vw-accent-deep); background: color-mix(in srgb, var(--vw-paper) 70%, transparent); animation: sp-stamp .55s cubic-bezier(.3,1.6,.5,1) .6s both; }
@keyframes sp-stamp { from { transform: rotate(-5deg) scale(2.4); opacity: 0 } to { transform: rotate(-5deg) scale(1); opacity: 1 } }
.sp-tr-end { margin: 6px 0 0; font: 400 clamp(16px, 2.4dvh, 19px)/1.3 ${SP_HAND}; color: var(--vw-ink); overflow-wrap: anywhere; }
.sp-tr-no { margin: 2px 0 0; font: 600 12px ${FONTS.ui}; letter-spacing: .08em; color: var(--vw-ink-soft); }
/* Short phones: tighten the treaty so the whole card (end line and serial too) fits above the pill;
   if a very long treaty still doesn't, it scrolls inside its frame instead of being cut off. */
.sp-treaty { overflow-y: auto; overscroll-behavior: contain; }
@container (max-height: 520px) {
  .sp-treaty { padding: 12px 16px 10px; gap: 2px; }
  .sp-tr-t { font-size: clamp(22px, 7cqw, 28px); }
  .sp-tr-terms { margin-top: 2px; gap: 2px; }
  .sp-tr-terms li { font-size: 15px; line-height: 1.22; }
  .sp-tr-sigs { margin-top: 2px; gap: 10px; }
  .sp-tr-sig b, .sp-tr-sig img { height: 36px; line-height: 36px; }
  .sp-tr-stamp { margin: 4px 0 0; }
  .sp-tr-end { margin-top: 2px; font-size: 16px; }
}
@media (prefers-reduced-motion: reduce) { .sp-tr-stamp { animation: none; } }
`;
