"use client";

// Scenes 4–7: the love quiz (with a rigged love meter), our photos
// (polaroids), the letter, and the hold-to-propose moment.

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CroppedPhoto, burst, haptic, useHoldProgress, useReducedMotion } from "../../../_valentine/kit";
import type { WybmQuizItem } from "../../../_valentine/days/will-you-be-mine";
import type { LovePhoto } from "../../../_valentine/types";
import { FONTS } from "../../../_valentine/theme";
import { FillHeart, Sparkle, VelvetBox } from "./art";
import { WY_HAND, WY_SCRIPT, WY_SERIF } from "./fonts";
import { useNext, useWy } from "./stage";
import { Head, seeded } from "./ui";

// ─── 4 · The love quiz ──────────────────────────────────────────────────────

const RIGHT_LINES = ["Correct!! 💗", "You know me so well 🥹", "Obviously 😌", "Ten on ten 💯"];

export function Quiz({ items, sticker, onNext }: { items: readonly WybmQuizItem[]; sticker: ReactNode; onNext: () => void }) {
  const { cue } = useWy();
  const reduced = useReducedMotion();
  const [q, setQ] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const item = items[Math.min(q, items.length - 1)];
  const options = useMemo(() => seeded([item.right, item.wrong1, item.wrong2].filter(Boolean), q + item.q.length), [item, q]);
  const rightIdx = options.indexOf(item.right);
  const answered = picked !== null;
  const correct = answered && picked === rightIdx;
  // The meter always climbs (it's rigged): each answer fills its share, and the end is 100%.
  const meter = done ? 100 : Math.round(((q + (answered ? 1 : 0)) / items.length) * 92);

  const pick = (k: number) => {
    if (answered) return;
    setPicked(k);
    const ok = k === rightIdx;
    if (ok) setScore((s) => s + 1);
    haptic(ok ? 18 : 10);
    cue(ok ? "chime" : "plush-squeak", { gain: ok ? 0.55 : 0.5 });
    if (ok && !reduced) burst({ kind: "hearts", origin: { x: 0.5, y: 0.6 }, count: 14, spread: 0.3 });
  };
  const advance = () => {
    if (q + 1 >= items.length) {
      setDone(true);
      haptic(24);
      cue("chime-cascade", { gain: 0.55 });
      if (!reduced) burst({ kind: "confetti", origin: { x: 0.5, y: 0.3 }, count: 70 });
      return;
    }
    cue("page-turn", { gain: 0.4 });
    setQ((v) => v + 1);
    setPicked(null);
  };
  useNext(done ? "Convinced 😌" : null, onNext, "photo");

  return (
    <>
      <Head kicker="Little love quiz" title={done ? "Perfect match 💯" : "How well do you know us?"} sub={done ? `${score} of ${items.length} right — but the meter was rigged anyway 😌` : `Question ${q + 1} of ${items.length}`} />
      <div className="wy-meter" role="meter" aria-label="Love meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={meter}>
        <span className="wy-meter-gif" aria-hidden>
          {sticker}
        </span>
        <div className="wy-meter-bar">
          <span className="wy-meter-fill" style={{ width: `${Math.max(6, meter)}%` }} />
          <span className="wy-meter-n">💗 {meter}%</span>
        </div>
      </div>
      <div className="wy-fill">
        <AnimatePresence mode="wait" initial={false}>
          {done ? (
            <motion.div key="done" className="wy-quiz-done" initial={reduced ? false : { opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 16 }}>
              <span className="wy-quiz-done-e" aria-hidden>
                💞
              </span>
              <p>Compatibility: <b>100%</b></p>
              <p className="wy-quiz-done-s">(scientifically proven by me)</p>
            </motion.div>
          ) : (
            <motion.div key={q} className="wy-quiz" initial={reduced ? false : { opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={reduced ? undefined : { opacity: 0, x: -30, transition: { duration: 0.18 } }}>
              <p className="wy-quiz-q">{item.q}</p>
              <ul className="wy-quiz-opts">
                {options.map((o, k) => {
                  const isRight = k === rightIdx;
                  const cls = answered ? (isRight ? " is-right" : k === picked ? " is-wrong" : " is-dim") : "";
                  return (
                    <li key={k}>
                      <button type="button" className={`wy-opt${cls}`} onClick={() => pick(k)} disabled={answered} data-wy-opt={isRight ? "right" : "wrong"}>
                        <span className="wy-opt-t">{o}</span>
                        <span className="wy-opt-i" aria-hidden>
                          {answered ? (isRight ? "💗" : k === picked ? "🙈" : "") : ""}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="wy-quiz-say" aria-live="polite">
                {answered && (
                  <>
                    <p className="wy-quiz-r">{correct ? RIGHT_LINES[q % RIGHT_LINES.length] : `Close! It's “${item.right}” 😌`}</p>
                    <button type="button" className="wy-ghost wy-quiz-next" onClick={advance} data-wy-quiz-next>
                      {q + 1 >= items.length ? "See my score 💯" : "Next question ›"}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <style>{QUIZ_CSS}</style>
    </>
  );
}

const QUIZ_CSS = `
.wy-meter { flex: none; position: relative; width: min(100%, 400px); display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: center; gap: 8px; }
.wy-meter-gif .wy-stk { transform: rotate(-6deg); padding: 4px; border-radius: 16px; }
.wy-meter-gif .wy-stk img { width: clamp(56px, 9dvh, 76px) !important; height: auto !important; border-radius: 12px; }
.wy-meter-bar { position: relative; height: 30px; border-radius: 99px; overflow: hidden; background: color-mix(in srgb, var(--vw-accent) 12%, var(--wy-card)); box-shadow: inset 0 0 0 2px var(--vw-edge); }
.wy-meter-fill { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 99px; background: linear-gradient(90deg, color-mix(in srgb, var(--vw-accent) 55%, #FFFFFF), var(--vw-accent), var(--vw-accent-deep));
  transition: width .8s cubic-bezier(.3,1.3,.5,1); box-shadow: inset 0 2px 0 rgba(255,255,255,.4); }
.wy-meter-n { position: absolute; inset: 0; display: grid; place-items: center; font: 700 14px ${FONTS.ui}; color: var(--vw-ink); text-shadow: 0 1px 0 color-mix(in srgb, var(--wy-card) 80%, transparent); }
.wy-quiz { width: min(100%, 400px); max-height: 100cqh; display: grid; gap: clamp(10px, 1.8dvh, 14px); align-content: center; }
.wy-quiz-q { margin: 0; font: 700 clamp(21px, 3.2dvh, 26px)/1.2 ${WY_SERIF}; color: var(--vw-ink); overflow-wrap: anywhere; text-wrap: balance; }
.wy-quiz-opts { list-style: none; margin: 0; padding: 0; display: grid; gap: clamp(8px, 1.3dvh, 11px); }
.wy-opt { position: relative; width: 100%; min-height: 52px; display: flex; align-items: center; gap: 8px; padding: 10px 14px 10px 18px; border: 0; border-radius: 16px; cursor: pointer; text-align: left;
  background: var(--wy-card); color: var(--vw-ink); box-shadow: 0 0 0 2px var(--vw-edge), 0 8px 18px -14px color-mix(in srgb, var(--wy-deep) 60%, transparent);
  transition: transform .2s ease, box-shadow .2s ease, opacity .3s ease; touch-action: manipulation; }
.wy-opt:not(:disabled):active { transform: scale(.98); }
.wy-opt:not(:disabled):hover { box-shadow: 0 0 0 2px var(--vw-accent), 0 8px 18px -14px color-mix(in srgb, var(--wy-deep) 60%, transparent); }
.wy-opt-t { flex: 1 1 auto; min-width: 0; font: 600 clamp(16px, 2.3dvh, 18px)/1.25 ${FONTS.ui}; overflow-wrap: anywhere; }
.wy-opt-i { flex: none; width: 26px; font-size: 20px; text-align: center; }
.wy-opt.is-right { box-shadow: 0 0 0 3px var(--vw-accent), 0 10px 22px -12px color-mix(in srgb, var(--wy-deep) 70%, transparent); background: color-mix(in srgb, var(--vw-accent) 14%, var(--wy-card)); animation: wy-pop .45s cubic-bezier(.3,1.6,.5,1); }
.wy-opt.is-wrong { animation: wy-shake .42s ease-in-out; opacity: .8; }
.wy-opt.is-dim { opacity: .45; }
.wy-opt:disabled { cursor: default; }
.wy-opt:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 3px; }
@keyframes wy-pop { 0% { transform: scale(.94) } 100% { transform: scale(1) } }
@keyframes wy-shake { 0%, 100% { transform: translateX(0) } 20% { transform: translateX(-7px) } 45% { transform: translateX(6px) } 70% { transform: translateX(-3px) } }
.wy-quiz-say { min-height: 98px; display: grid; justify-items: center; align-content: start; gap: 8px; }
.wy-quiz-r { margin: 0; font: 700 clamp(21px, 3dvh, 25px)/1.2 ${WY_HAND}; color: var(--vw-accent-deep); overflow-wrap: anywhere; }
.wy-quiz-done { display: grid; justify-items: center; gap: 2px; text-align: center; }
.wy-quiz-done-e { font-size: clamp(64px, 12dvh, 96px); line-height: 1; animation: wy-heart-beat 1.2s ease-in-out infinite; }
.wy-quiz-done p { margin: 6px 0 0; font: 600 clamp(22px, 3.4dvh, 28px) ${WY_SERIF}; color: var(--vw-ink); }
.wy-quiz-done b { color: var(--vw-accent); font-weight: 700; }
.wy-quiz-done .wy-quiz-done-s { margin: 0; font: 600 20px ${WY_HAND}; color: var(--vw-ink-soft); }
@media (max-height: 700px) { .wy-quiz { gap: 8px; } .wy-quiz-q { font-size: 19px; } .wy-opt { min-height: 46px; padding-top: 7px; padding-bottom: 7px; } .wy-quiz-say { min-height: 86px; gap: 4px; } .wy-meter-gif .wy-stk img { width: 50px !important; } }
@media (prefers-reduced-motion: reduce) { .wy-opt { animation: none !important; } .wy-quiz-done-e { animation: none; } .wy-meter-fill { transition: none; } }
`;

// ─── 5 · Our photos ─────────────────────────────────────────────────────────

export function Memories({ photos, placeholders = 0, onNext }: { photos: LovePhoto[]; placeholders?: number; onNext: () => void }) {
  const { cue } = useWy();
  const track = useRef<HTMLDivElement | null>(null);
  const [at, setAt] = useState(0);
  useNext("Read my letter", onNext, "letter");
  const onScroll = () => {
    const t = track.current;
    if (!t) return;
    const w = t.firstElementChild instanceof HTMLElement ? t.firstElementChild.offsetWidth + 14 : t.clientWidth;
    const k = Math.round(t.scrollLeft / w);
    if (k !== at) {
      setAt(k);
      cue("paper-rustle", { gain: 0.3 });
    }
  };
  const total = photos.length + placeholders;
  return (
    <>
      <Head kicker="Our moments" title="The ones I replay" sub={total > 1 ? "Swipe through 💗" : undefined} />
      <div className="wy-fill">
        <div className="wy-pol-track" ref={track} onScroll={onScroll}>
          {Array.from({ length: placeholders }, (_, k) => (
            <figure key={`ph-${k}`} className="wy-pol wy-pol-ph" style={{ ["--tilt" as string]: `${k % 2 ? 3 : -3}deg` }}>
              <span className="wy-pol-tape" aria-hidden />
              <div className="wy-pol-img wy-pol-empty">📸</div>
              <figcaption>
                <span className="wy-pol-cap">your photo here</span>
              </figcaption>
            </figure>
          ))}
          {photos.map((p, k) => (
            <figure key={`${p.url}-${k}`} className="wy-pol" style={{ ["--tilt" as string]: `${k % 2 ? 3 : -3}deg` }}>
              <span className="wy-pol-tape" aria-hidden />
              <div className="wy-pol-img">
                <CroppedPhoto photo={p} eager={k < 2} />
              </div>
              <figcaption>
                {p.caption ? <span className="wy-pol-cap">{p.caption}</span> : null}
                {p.note ? <span className="wy-pol-note">{p.note}</span> : null}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
      {total > 1 && (
        <div className="wy-dots" aria-hidden>
          {Array.from({ length: total }, (_, k) => (
            <i key={k} className={k === at ? "is-on" : undefined} />
          ))}
        </div>
      )}
      <style>{POL_CSS}</style>
    </>
  );
}

const POL_CSS = `
.wy-pol-track { width: 100%; height: 100%; display: flex; gap: 14px; align-items: center; overflow-x: auto; overflow-y: hidden; scroll-snap-type: x mandatory; padding: 10px calc(50% - min(36cqw, 40cqh, 160px)); box-sizing: border-box; scrollbar-width: none; }
.wy-pol-track::-webkit-scrollbar { display: none; }
.wy-pol { flex: none; scroll-snap-align: center; margin: 0; width: min(72cqw, 80cqh, 320px); max-height: 100%; box-sizing: border-box; padding: 12px 12px 14px; background: #FFFFFF; border-radius: 6px; position: relative;
  transform: rotate(var(--tilt)); box-shadow: 0 16px 30px -16px color-mix(in srgb, var(--wy-deep) 60%, transparent), 0 0 0 1px rgba(0,0,0,.04); display: grid; gap: 8px; }
.wy-pol-tape { position: absolute; left: 50%; top: -10px; width: 74px; height: 22px; transform: translateX(-50%) rotate(-3deg); background: color-mix(in srgb, var(--vw-gold) 70%, transparent); opacity: .85; border-radius: 3px; }
.wy-pol-img { width: 100%; aspect-ratio: 1; max-height: 56cqh; border-radius: 3px; overflow: hidden; margin: 0 auto; }
.wy-pol figcaption { display: grid; gap: 2px; text-align: center; min-height: 26px; }
.wy-pol-cap { font: 700 clamp(20px, 2.9dvh, 24px)/1.1 ${WY_HAND}; color: #3A2A30; overflow-wrap: anywhere; }
.wy-pol-note { font: 500 13px/1.35 ${FONTS.ui}; color: #7A6068; overflow-wrap: anywhere; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.wy-pol-empty { display: grid; place-items: center; font-size: 46px; background: repeating-linear-gradient(45deg, #FBE3E6 0 12px, #FFFFFF 12px 24px); }
.wy-dots { flex: none; display: flex; gap: 6px; justify-content: center; }
.wy-dots i { width: 7px; height: 7px; border-radius: 50%; background: var(--vw-edge); transition: transform .2s ease, background .2s ease; }
.wy-dots i.is-on { background: var(--vw-accent); transform: scale(1.4); }
`;

// ─── 6 · The letter ─────────────────────────────────────────────────────────

export function Letter({ letter, recipient, sender, petName, onNext }: { letter: string; recipient: string; sender: string; petName: string; onNext: () => void }) {
  const { cue } = useWy();
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const unfold = () => {
    if (open) return;
    haptic(14);
    cue("wax-crack", { gain: 0.6 });
    cue("paper-rustle", { gain: 0.7, at: 0.15 });
    cue("page-turn", { gain: 0.5, at: 0.35 });
    setOpen(true);
  };
  useNext(open ? "I read every word" : null, onNext, "heart");
  return (
    <>
      <Head kicker="From my heart" title={open ? `Dear ${petName || recipient},` : "I wrote you a love letter"} sub={open ? undefined : "Tap the seal to open it 💌"} />
      <div className="wy-fill">
        <AnimatePresence mode="wait" initial={false}>
          {!open ? (
            <motion.button
              key="sealed"
              type="button"
              className="wy-env"
              onClick={unfold}
              aria-label="Open the love letter"
              initial={reduced ? false : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduced ? undefined : { opacity: 0, y: -20, scale: 0.92, transition: { duration: 0.26 } }}
            >
              <span className="wy-env-body" aria-hidden />
              <span className="wy-env-flap" aria-hidden />
              <span className="wy-env-seal" aria-hidden>
                <svg viewBox="0 0 24 22" width="60%">
                  <path d="M12 21 C4 15 1 11 1.5 7 C2 3 7 1.5 12 6 C17 1.5 22 3 22.5 7 C23 11 20 15 12 21 Z" fill="#FFFFFF" opacity=".92" />
                </svg>
              </span>
              <span className="wy-env-to">for {recipient}</span>
            </motion.button>
          ) : (
            <motion.article
              key="open"
              className="wy-paper"
              initial={reduced ? false : { opacity: 0, scaleY: 0.2, rotateX: -50 }}
              animate={{ opacity: 1, scaleY: 1, rotateX: 0 }}
              transition={{ type: "spring", stiffness: 170, damping: 20 }}
            >
              <div className="wy-paper-body">
                {letter.split(/\n{2,}/).map((para, k) => (
                  <p key={k}>{para}</p>
                ))}
                <p className="wy-paper-sign">
                  Hopefully yours,
                  <br />
                  <b>{sender}</b>
                </p>
              </div>
            </motion.article>
          )}
        </AnimatePresence>
      </div>
      <style>{LETTER_CSS}</style>
    </>
  );
}

const LETTER_CSS = `
.wy-env { position: relative; width: min(80cqw, 100cqh, 320px); aspect-ratio: 1.45; border: 0; padding: 0; background: none; cursor: pointer; touch-action: manipulation; animation: wy-wobble 2.6s ease-in-out infinite; }
@keyframes wy-wobble { 0%, 100% { transform: rotate(-2.5deg) } 50% { transform: rotate(2.5deg) translateY(-6px) } }
.wy-env-body { position: absolute; inset: 0; border-radius: 12px; background: linear-gradient(160deg, #FFFFFF, color-mix(in srgb, var(--wy-blush) 60%, #FFFFFF)); box-shadow: inset 0 0 0 2px var(--vw-edge), 0 24px 36px -18px color-mix(in srgb, var(--wy-deep) 70%, transparent); }
.wy-env-body::after { content: ""; position: absolute; inset: 0; border-radius: 12px; background:
  linear-gradient(to top right, transparent calc(50% - 1px), color-mix(in srgb, var(--vw-gold) 70%, transparent) 50%, transparent calc(50% + 1px)) left bottom / 50% 60% no-repeat,
  linear-gradient(to top left, transparent calc(50% - 1px), color-mix(in srgb, var(--vw-gold) 70%, transparent) 50%, transparent calc(50% + 1px)) right bottom / 50% 60% no-repeat; }
.wy-env-flap { position: absolute; left: 0; right: 0; top: 0; height: 62%; clip-path: polygon(0 0, 100% 0, 50% 100%); border-radius: 12px 12px 0 0;
  background: linear-gradient(180deg, color-mix(in srgb, var(--vw-gold) 50%, #FFFFFF), var(--vw-gold)); filter: drop-shadow(0 3px 3px rgba(0,0,0,.08)); }
.wy-env-seal { position: absolute; left: 50%; top: 62%; width: clamp(54px, 18cqw, 70px); aspect-ratio: 1; transform: translate(-50%, -50%); border-radius: 50%; display: grid; place-items: center;
  background: radial-gradient(circle at 38% 32%, color-mix(in srgb, var(--vw-accent) 70%, #FFFFFF), var(--vw-accent) 55%, var(--vw-accent-deep)); box-shadow: 0 0 0 4px color-mix(in srgb, var(--vw-accent-deep) 40%, transparent), 0 6px 12px -2px color-mix(in srgb, var(--wy-deep) 60%, transparent);
  animation: wy-seal 1.4s ease-in-out infinite alternate; }
@keyframes wy-seal { from { transform: translate(-50%, -50%) scale(1) } to { transform: translate(-50%, -50%) scale(1.08) } }
.wy-env-to { position: absolute; left: 0; right: 0; bottom: 8%; font: 700 clamp(19px, 6cqw, 24px) ${WY_HAND}; color: var(--vw-ink); }
.wy-env:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 6px; border-radius: 14px; }
.wy-paper { width: min(100%, 460px); max-height: 100%; box-sizing: border-box; border-radius: 16px; transform-origin: 50% 0; display: flex;
  background: linear-gradient(180deg, #FFFFFF, #FFF9F4); box-shadow: 0 0 0 2px var(--vw-edge), 0 24px 40px -22px color-mix(in srgb, var(--wy-deep) 70%, transparent); }
.wy-paper-body { overflow-y: auto; overscroll-behavior: contain; padding: 18px 20px 20px; text-align: left;
  background: repeating-linear-gradient(180deg, transparent 0 31px, color-mix(in srgb, var(--vw-accent) 16%, transparent) 31px 32px) 0 18px / 100% 32px local;
  -webkit-mask-image: linear-gradient(180deg, transparent 0, #000 14px, #000 calc(100% - 18px), transparent); mask-image: linear-gradient(180deg, transparent 0, #000 14px, #000 calc(100% - 18px), transparent); }
.wy-paper-body p { margin: 0 0 32px; font: 600 clamp(20px, 2.8dvh, 23px)/32px ${WY_HAND}; color: #3F2A30; overflow-wrap: anywhere; white-space: pre-line; }
.wy-paper-sign { text-align: right; }
.wy-paper-sign b { font: 400 34px/1 ${WY_SCRIPT}; color: var(--vw-accent-deep); }
@media (prefers-reduced-motion: reduce) { .wy-env, .wy-env-seal { animation: none; } }
`;

// ─── 7 · Hold the heart (the ring box opens) ───────────────────────────────

export function Propose({ promise, sticker, onNext }: { promise: string; sticker: ReactNode; onNext: () => void }) {
  const { cue } = useWy();
  const reduced = useReducedMotion();
  const [full, setFull] = useState(false);
  const beats = useRef(0);
  const hold = useHoldProgress({
    duration: 2600,
    onComplete: () => {
      setFull(true);
      haptic(30);
      cue("kiss", { gain: 0.5 });
      cue("chime-cascade", { gain: 0.7, at: 0.2 });
      cue("sparkle", { gain: 0.5, at: 0.6 });
      if (!reduced) {
        burst({ kind: "hearts", origin: { x: 0.5, y: 0.45 }, count: 30 });
        window.setTimeout(() => burst({ kind: "sparkles", origin: { x: 0.5, y: 0.4 }, count: 26 }), 700);
      }
    },
  });
  const p = full ? 1 : hold.progress;
  // A heartbeat that quickens as the heart fills.
  useEffect(() => {
    if (!hold.holding || full) return;
    let alive = true;
    const beat = () => {
      if (!alive) return;
      beats.current += 1;
      cue("heartbeat", { gain: 0.45 });
      haptic(6);
      window.setTimeout(beat, Math.max(260, 760 - beats.current * 90));
    };
    beat();
    return () => {
      alive = false;
      beats.current = 0;
    };
  }, [hold.holding, full, cue]);
  useNext(full ? "Ask me" : null, onNext, "ring");

  return (
    <>
      <Head
        kicker={full ? "Look what's inside 💍" : "One last thing"}
        title={full ? "If you say yes…" : "Hold my heart"}
        sub={full ? undefined : p > 0 ? `${Math.round(p * 100)}% full… don't let go 💓` : "Keep your finger on it till it's full"}
      />
      <div className="wy-fill">
        <AnimatePresence mode="wait" initial={false}>
          {full ? (
            <motion.div key="ring" className="wy-prop" initial={reduced ? false : { opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 190, damping: 17 }}>
              <div className="wy-prop-box">
                <VelvetBox open ring size="100%" />
                <span className="wy-prop-spark a" aria-hidden>
                  <Sparkle size={22} />
                </span>
                <span className="wy-prop-spark b" aria-hidden>
                  <Sparkle size={16} color="#FFFFFF" />
                </span>
              </div>
              <div className="wy-prop-card">
                <span className="wy-prop-gif">{sticker}</span>
                <p className="wy-prop-k">I promise</p>
                <p className="wy-prop-t">{promise}</p>
              </div>
            </motion.div>
          ) : (
            <motion.button
              key="heart"
              type="button"
              className={`wy-hold${hold.holding ? " is-holding" : ""}`}
              {...hold.bind}
              aria-label="Hold the heart until it is full"
              data-wy-hold
              exit={reduced ? undefined : { scale: 1.3, opacity: 0, transition: { duration: 0.3 } }}
            >
              <FillHeart p={p} />
              <span className="wy-hold-hint" aria-hidden>
                {hold.holding ? "💓" : "👆"}
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      <style>{PROP_CSS}</style>
    </>
  );
}

const PROP_CSS = `
.wy-hold { position: relative; width: min(70cqw, 74cqh, 280px); aspect-ratio: 1.08; border: 0; padding: 0; background: none; cursor: pointer; touch-action: none; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none;
  filter: drop-shadow(0 18px 24px color-mix(in srgb, var(--wy-deep) 45%, transparent)); transition: transform .2s ease; }
.wy-hold svg { width: 100%; height: 100%; }
.wy-hold:not(.is-holding) { animation: wy-heart-beat 1.3s ease-in-out infinite; }
.wy-hold.is-holding { transform: scale(.95); animation: wy-hold-shake .18s linear infinite; }
@keyframes wy-hold-shake { 0%, 100% { translate: 0 0 } 25% { translate: 1px -1px } 75% { translate: -1px 1px } }
.wy-hold-hint { position: absolute; left: 50%; top: 46%; transform: translate(-50%, -50%); font-size: clamp(30px, 9cqw, 42px); pointer-events: none; }
.wy-hold:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 6px; border-radius: 30px; }
.wy-prop { width: min(100%, 400px); height: 100%; max-height: 100cqh; display: grid; grid-template-rows: minmax(0, 1fr) auto; justify-items: center; align-items: center; gap: 4px; }
.wy-prop-box { position: relative; height: 100%; max-height: min(46cqh, 250px); aspect-ratio: 1; filter: drop-shadow(0 18px 24px color-mix(in srgb, var(--wy-deep) 45%, transparent)); }
.wy-prop-box > svg { width: 100%; height: 100%; }
.wy-prop-spark { position: absolute; animation: wy-glint 1.6s ease-in-out infinite; }
.wy-prop-spark.a { right: 12%; top: 16%; }
.wy-prop-spark.b { left: 14%; top: 26%; animation-delay: .7s; }
.wy-prop-card { position: relative; width: 100%; box-sizing: border-box; padding: 14px 18px 16px 18px; border-radius: 22px; background: var(--wy-card); text-align: center;
  box-shadow: 0 0 0 2px var(--vw-edge), 0 18px 30px -16px color-mix(in srgb, var(--wy-deep) 60%, transparent); }
.wy-prop-gif { position: absolute; right: -6px; top: -54px; transform: rotate(8deg); }
.wy-prop-gif .wy-stk img { width: clamp(64px, 11dvh, 84px) !important; height: auto !important; }
.wy-prop-k { margin: 0; font: 400 clamp(30px, 4.6dvh, 38px)/1 ${WY_SCRIPT}; color: var(--vw-accent-deep); }
.wy-prop-t { margin: 4px 0 0; font: 600 clamp(20px, 2.9dvh, 24px)/1.25 ${WY_HAND}; color: var(--vw-ink); overflow-wrap: anywhere; }
@media (prefers-reduced-motion: reduce) { .wy-hold, .wy-prop-spark { animation: none !important; } }
`;
