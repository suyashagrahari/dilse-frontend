"use client";

// Scenes 5–8: the reasons flower (pluck the petals), our photos (a deck of
// keepsake cards to swipe away), the letter (pull the ribbon, the scroll
// unrolls) and the ring box (swipe the lid up, the ring rises).

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useTransform, type PanInfo } from "framer-motion";
import { CroppedPhoto, burst, haptic, useReducedMotion } from "../../../_valentine/kit";
import type { LovePhoto } from "../../../_valentine/types";
import { FONTS } from "../../../_valentine/theme";
import { Ring, RingBoxBase, RingBoxLid, Sparkle } from "./art";
import { PP_HAND, PP_SCRIPT } from "./fonts";
import { useNext, usePp } from "./stage";
import { Head, PpScroll } from "./ui";

// ─── 5 · The reasons flower ─────────────────────────────────────────────────

const chant = (k: number, n: number) => (k === n - 1 ? "loves me!! always 💗" : k % 2 ? "loves me more… 💞" : "loves me… 💗");

export function Petals({ reasons, sticker, onNext }: { reasons: readonly string[]; sticker: ReactNode; onNext: () => void }) {
  const { cue } = usePp();
  const reduced = useReducedMotion();
  const n = reasons.length;
  const [plucked, setPlucked] = useState<number[]>([]);
  const [showAll, setShowAll] = useState(false);
  const start = useRef<{ k: number; x: number; y: number } | null>(null);
  const all = plucked.length >= n;
  const last = plucked.length ? plucked[plucked.length - 1] : null;

  const pluck = (k: number) => {
    if (plucked.includes(k)) return;
    const count = plucked.length + 1;
    setPlucked((p) => [...p, k]);
    haptic(count === n ? 26 : 12);
    cue("paper-rustle", { gain: 0.45 });
    cue(count === n ? "chime-cascade" : "glass-ping", { gain: 0.5, detune: count * 110 - 200, at: 0.05 });
    if (count === n && !reduced) window.setTimeout(() => burst({ kind: "hearts", origin: { x: 0.5, y: 0.36 }, count: 32 }), 250);
  };
  const down = (k: number, e: ReactPointerEvent<HTMLButtonElement>) => {
    start.current = { k, x: e.clientX, y: e.clientY };
  };
  const move = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const s = start.current;
    if (s && Math.hypot(e.clientX - s.x, e.clientY - s.y) > 18) {
      start.current = null;
      pluck(s.k);
    }
  };

  useNext(all ? (showAll ? "Every word is true" : "Read them all") : null, () => (showAll ? onNext() : setShowAll(true)), "flower", showAll);

  return (
    <>
      <Head
        kicker="Loves me, loves me…"
        title={all ? <>Loves me. <em>Always.</em></> : "Pluck the petals"}
        sub={all ? undefined : `Tap or pull a petal · ${plucked.length} of ${n}`}
      />
      <div className="pp-fill">
        {showAll ? (
          <motion.div className="pp-reasons" initial={reduced ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 220, damping: 22 }}>
            <div className="pp-reasons-gif" aria-hidden>
              {sticker}
            </div>
            <PpScroll className="pp-reasons-scroll" label="Reasons I love you">
              <ol className="pp-reasons-list">
                {reasons.map((r, k) => (
                  <li key={k} style={{ animationDelay: `${100 + k * 80}ms` }}>
                    <span className="pp-reasons-n" aria-hidden>
                      🌸
                    </span>
                    <span className="pp-reasons-t">{r}</span>
                  </li>
                ))}
              </ol>
            </PpScroll>
          </motion.div>
        ) : (
          <div className="pp-flower" style={{ ["--n" as string]: String(n) }}>
            <svg className="pp-stem" viewBox="0 0 100 160" aria-hidden>
              <path d="M50 0 C46 50 56 100 50 160" stroke="var(--pp-leaf)" strokeWidth="6" fill="none" strokeLinecap="round" />
              <path d="M50 92 C30 78 14 84 8 96 C24 102 40 100 50 92 Z" fill="var(--pp-leaf)" />
              <path d="M51 120 C70 104 86 108 94 120 C78 128 62 128 51 120 Z" fill="var(--pp-leaf)" />
            </svg>
            <div className="pp-bloom">
              {reasons.map((_, k) => {
                const done = plucked.includes(k);
                const a = (360 / n) * k;
                return (
                  <span key={k} className="pp-petal-slot" style={{ rotate: `${a}deg` }}>
                    <AnimatePresence>
                      {!done && (
                        <motion.button
                          type="button"
                          className="pp-petal-b"
                          onPointerDown={(e) => down(k, e)}
                          onPointerMove={move}
                          onPointerUp={() => (start.current = null)}
                          onClick={() => pluck(k)}
                          aria-label={`Pluck petal ${k + 1}`}
                          data-pp-petal={k}
                          exit={reduced ? { opacity: 0 } : { y: [0, -30, 160], x: [0, k % 2 ? 30 : -30, k % 2 ? -20 : 20], rotate: [0, 90, 260], opacity: [1, 1, 0], transition: { duration: 1.1, ease: "easeIn" } }}
                        >
                          <span className="pp-petal-shape" />
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </span>
                );
              })}
              <span className={`pp-bloom-eye${all ? " is-happy" : ""}`} aria-hidden>
                <svg viewBox="0 0 40 40">
                  <circle cx="14" cy="17" r="2.4" fill="var(--pp-deep)" />
                  <circle cx="26" cy="17" r="2.4" fill="var(--pp-deep)" />
                  <path d={all ? "M12 23 Q20 32 28 23" : "M14 24 Q20 28 26 24"} stroke="var(--pp-deep)" strokeWidth="2.4" fill="none" strokeLinecap="round" />
                  <ellipse cx="10" cy="23" rx="3" ry="2" fill="var(--vw-accent)" opacity=".45" />
                  <ellipse cx="30" cy="23" rx="3" ry="2" fill="var(--vw-accent)" opacity=".45" />
                </svg>
              </span>
            </div>
          </div>
        )}
      </div>
      {!showAll && (
        <div className="pp-pluck" aria-live="polite">
          {last === null ? (
            <p className="pp-pluck-empty">each petal hides a reason 🌸</p>
          ) : (
            <motion.div key={last} className="pp-pluck-card" initial={reduced ? false : { opacity: 0, y: 12, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 280, damping: 20 }}>
              <span className="pp-pluck-chant">{chant(plucked.length - 1, n)}</span>
              <span className="pp-pluck-t">{reasons[last]}</span>
            </motion.div>
          )}
        </div>
      )}
      <style>{PETAL_CSS}</style>
    </>
  );
}

const PETAL_CSS = `
.pp-flower { position: relative; width: min(84cqw, 92cqh, 340px); aspect-ratio: 1 / 1.08; }
.pp-stem { position: absolute; left: 25%; top: 46%; width: 50%; height: 56%; }
.pp-bloom { position: absolute; left: 50%; top: 44%; width: 0; height: 0; }
.pp-petal-slot { position: absolute; left: 0; top: 0; width: 0; height: 0; }
.pp-petal-b { position: absolute; left: calc(min(84cqw, 92cqh, 340px) * -.085); top: calc(min(84cqw, 92cqh, 340px) * -.44); width: calc(min(84cqw, 92cqh, 340px) * .17); height: calc(min(84cqw, 92cqh, 340px) * .36);
  min-width: 44px; margin: 0; padding: 0; border: 0; background: none; cursor: pointer; touch-action: none; -webkit-tap-highlight-color: transparent; transform-origin: 50% 100%; }
.pp-petal-shape { position: absolute; inset: 0; border-radius: 50% 50% 46% 46% / 62% 62% 38% 38%;
  background: radial-gradient(130% 90% at 50% 8%, #FFFFFF 0 30%, color-mix(in srgb, var(--vw-accent) 22%, #FFFFFF) 70%, color-mix(in srgb, var(--vw-accent) 42%, #FFFFFF));
  box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--vw-accent) 55%, transparent), 0 6px 10px -6px color-mix(in srgb, var(--pp-deep) 45%, transparent); transition: transform .2s ease; }
.pp-petal-shape::after { content: ""; position: absolute; left: 50%; top: 18%; bottom: 14%; width: 2px; margin-left: -1px; background: color-mix(in srgb, var(--vw-accent) 25%, transparent); border-radius: 2px; }
.pp-petal-b:hover .pp-petal-shape, .pp-petal-b:focus-visible .pp-petal-shape { transform: scale(1.06) translateY(-3px); }
.pp-petal-b:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 2px; border-radius: 40%; }
.pp-bloom-eye { position: absolute; left: calc(min(84cqw, 92cqh, 340px) * -.14); top: calc(min(84cqw, 92cqh, 340px) * -.14); width: calc(min(84cqw, 92cqh, 340px) * .28); aspect-ratio: 1; border-radius: 50%; z-index: 2;
  background: radial-gradient(circle at 40% 35%, color-mix(in srgb, var(--pp-sun) 60%, #FFFFFF), var(--vw-gold) 80%); box-shadow: 0 0 0 3px color-mix(in srgb, var(--vw-gold) 60%, var(--pp-deep)), 0 8px 16px -8px color-mix(in srgb, var(--pp-deep) 60%, transparent); pointer-events: none; }
.pp-bloom-eye svg { width: 100%; height: 100%; }
.pp-bloom-eye.is-happy { animation: pp-happy .7s cubic-bezier(.3,1.6,.5,1); }
@keyframes pp-happy { 0% { transform: scale(.8) rotate(-10deg) } 100% { transform: none } }
.pp-pluck { flex: none; min-height: clamp(78px, 12dvh, 104px); width: 100%; max-width: 420px; display: grid; place-items: center; }
.pp-pluck-empty { margin: 0; font: 700 16px ${FONTS.ui}; color: var(--vw-ink-soft); }
.pp-pluck-card { box-sizing: border-box; width: 100%; padding: 10px 16px 12px; border-radius: 20px; display: grid; gap: 2px; background: var(--vw-paper); box-shadow: 0 0 0 2px var(--vw-edge), 0 12px 22px -14px color-mix(in srgb, var(--pp-deep) 55%, transparent); }
.pp-pluck-chant { font: 700 clamp(18px, 2.6dvh, 22px)/1.1 ${PP_SCRIPT}; color: var(--vw-accent-deep); }
.pp-pluck-t { font: 400 clamp(16px, 2.4dvh, 19px)/1.3 ${PP_HAND}; color: var(--vw-ink); overflow-wrap: anywhere; }
.pp-reasons { width: min(100%, 420px); height: 100%; max-height: 100cqh; display: flex; flex-direction: column; align-items: stretch; gap: clamp(8px, 1.4dvh, 12px); min-height: 0; }
.pp-reasons-gif { flex: none; display: grid; place-items: center; padding-top: 4px; }
.pp-reasons-gif .pp-stk img { width: clamp(72px, 14dvh, 104px) !important; height: clamp(72px, 14dvh, 104px) !important; }
.pp-reasons-scroll { flex: 1 1 auto; align-self: stretch; }
.pp-reasons-list { list-style: none; margin: 0; padding: 4px 2px 10px; display: grid; gap: 9px; }
.pp-reasons-list li { margin: 0; box-sizing: border-box; display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 10px; align-items: start; padding: 10px 14px 10px 10px; border-radius: 18px;
  background: var(--vw-paper); box-shadow: 0 0 0 2px var(--vw-edge), 0 8px 16px -12px color-mix(in srgb, var(--pp-deep) 55%, transparent); text-align: left; animation: pp-li-in .4s cubic-bezier(.3,1.4,.5,1) both; }
.pp-reasons-n { font-size: 20px; line-height: 1.2; }
.pp-reasons-t { font: 400 clamp(16px, 2.4dvh, 19px)/1.3 ${PP_HAND}; color: var(--vw-ink); overflow-wrap: anywhere; padding-top: 1px; }
@keyframes pp-li-in { from { opacity: 0; transform: translateY(10px) scale(.96) } to { opacity: 1; transform: none } }
@media (prefers-reduced-motion: reduce) { .pp-reasons-list li, .pp-bloom-eye.is-happy { animation: none; } }
`;

// ─── 6 · Our photos (a deck of keepsake cards) ──────────────────────────────

function DeckCard({ photo, k, total, onGone }: { photo: LovePhoto | null; k: number; total: number; onGone: (dir: 1 | -1) => void }) {
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 0, 220], [-16, 0, 16]);
  const heart = useTransform(x, [-140, -40, 0, 40, 140], [1, 0, 0, 0, 1]);
  const end = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 90 || Math.abs(info.velocity.x) > 500) {
      const dir: 1 | -1 = (info.offset.x || info.velocity.x) > 0 ? 1 : -1;
      animate(x, dir * 520, reduced ? { duration: 0 } : { type: "spring", stiffness: 160, damping: 22, velocity: info.velocity.x });
      window.setTimeout(() => onGone(dir), reduced ? 0 : 220);
    } else animate(x, 0, { type: "spring", stiffness: 320, damping: 24 });
  };
  return (
    <motion.figure
      className="pp-card"
      style={{ x, rotate }}
      drag="x"
      dragElastic={0.7}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={end}
      initial={reduced ? false : { scale: 0.94, y: 12, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      data-pp-card={k}
    >
      <span className="pp-card-no">
        {k + 1} / {total}
      </span>
      <div className="pp-card-img">{photo ? <CroppedPhoto photo={photo} eager /> : <span className="pp-card-empty">📸</span>}</div>
      <figcaption>
        <span className="pp-card-cap">{photo ? photo.caption || " " : "your photo here"}</span>
        {photo?.note ? <span className="pp-card-note">{photo.note}</span> : null}
      </figcaption>
      <motion.span className="pp-card-heart" style={{ opacity: heart }} aria-hidden>
        💗
      </motion.span>
    </motion.figure>
  );
}

export function Deck({ photos, placeholders = 0, onNext }: { photos: LovePhoto[]; placeholders?: number; onNext: () => void }) {
  const { cue } = usePp();
  const reduced = useReducedMotion();
  const cards: (LovePhoto | null)[] = [...Array.from({ length: placeholders }, () => null), ...photos];
  const total = cards.length;
  const [at, setAt] = useState(0);
  const done = at >= total;
  const gone = () => {
    haptic(10);
    cue("swoosh-soft", { gain: 0.4 });
    cue("paper-rustle", { gain: 0.3, at: 0.05 });
    setAt((v) => v + 1);
  };
  useEffect(() => {
    if (done) cue("chime", { gain: 0.45 });
  }, [done, cue]);
  useNext(done ? "Read my letter" : null, onNext, "letter");

  return (
    <>
      <Head kicker="Us, so far" title={done ? <>And a million <em>more</em></> : "Our little keepsakes"} sub={done ? "…to come 💗" : "Swipe each card away 💗"} />
      <div className="pp-fill">
        <div className="pp-deck">
          {done ? (
            <motion.div className="pp-deck-end" initial={reduced ? false : { opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 18 }}>
              <span aria-hidden>🌅</span>
              <p>This is my favourite view: you, in every one of them.</p>
              <button type="button" className="pp-ghost" onClick={() => setAt(0)}>
                See them again
              </button>
            </motion.div>
          ) : (
            <>
              {cards.slice(at + 1, at + 3).map((_, j) => (
                <span key={`b${at + 1 + j}`} className="pp-card-under" style={{ rotate: `${j % 2 ? -5 : 4}deg`, scale: String(0.96 - j * 0.03), translate: `0 ${10 + j * 8}px` }} aria-hidden />
              ))}
              <DeckCard key={at} photo={cards[at]} k={at} total={total} onGone={gone} />
            </>
          )}
        </div>
      </div>
      {!done && (
        <div className="pp-deck-ctl">
          <button type="button" className="pp-ghost" onClick={gone} data-pp-deck-next>
            Next card ›
          </button>
        </div>
      )}
      <style>{DECK_CSS}</style>
    </>
  );
}

const DECK_CSS = `
.pp-deck { position: relative; width: min(74cqw, 64cqh, 310px); aspect-ratio: .74; display: grid; place-items: center; }
.pp-card, .pp-card-under { position: absolute; inset: 0; margin: 0; box-sizing: border-box; border-radius: 22px; }
.pp-card-under { background: var(--vw-paper); box-shadow: 0 0 0 2px var(--vw-edge), 0 12px 24px -16px color-mix(in srgb, var(--pp-deep) 60%, transparent); }
.pp-card { padding: 12px 12px 10px; display: flex; flex-direction: column; gap: 8px; cursor: grab; touch-action: pan-y; user-select: none; -webkit-user-select: none;
  background: radial-gradient(circle at 0 0, var(--pp-blush) 0 10px, transparent 11px), radial-gradient(circle at 100% 0, var(--pp-blush) 0 10px, transparent 11px), #FFFFFF;
  box-shadow: 0 0 0 2px var(--vw-gold), 0 0 0 6px #FFFFFF, 0 0 0 7.5px var(--vw-edge), 0 24px 40px -22px color-mix(in srgb, var(--pp-deep) 70%, transparent); }
.pp-card:active { cursor: grabbing; }
.pp-card-no { position: absolute; right: 18px; top: 18px; z-index: 2; padding: 3px 9px; border-radius: 99px; background: color-mix(in srgb, #FFFFFF 88%, transparent); font: 700 12px ${FONTS.ui}; color: var(--vw-accent-deep); }
.pp-card-img { flex: 1 1 auto; min-height: 0; border-radius: 14px; overflow: hidden; background: var(--pp-blush); pointer-events: none; }
.pp-card-img img { pointer-events: none; }
.pp-card-empty { width: 100%; height: 100%; display: grid; place-items: center; font-size: 46px; background: repeating-linear-gradient(45deg, var(--pp-blush) 0 12px, var(--vw-paper) 12px 24px); }
.pp-card figcaption { flex: none; display: grid; gap: 1px; text-align: center; }
.pp-card-cap { font: 700 clamp(19px, 2.8dvh, 23px)/1.15 ${PP_SCRIPT}; color: #3A2A30; overflow-wrap: anywhere; }
.pp-card-note { font: 400 14px/1.3 ${PP_HAND}; color: #6A5560; overflow-wrap: anywhere; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.pp-card-heart { position: absolute; left: 50%; top: 40%; font-size: 64px; transform: translate(-50%, -50%); pointer-events: none; filter: drop-shadow(0 6px 10px rgba(0,0,0,.15)); }
.pp-deck-end { display: grid; justify-items: center; gap: 10px; max-width: 300px; padding: 20px; border-radius: 24px; background: var(--vw-paper); box-shadow: 0 0 0 2px var(--vw-edge), 0 20px 34px -20px color-mix(in srgb, var(--pp-deep) 60%, transparent); }
.pp-deck-end > span { font-size: 48px; line-height: 1; }
.pp-deck-end p { margin: 0; font: 400 clamp(18px, 2.6dvh, 21px)/1.35 ${PP_HAND}; color: var(--vw-ink); }
.pp-deck-ctl { flex: none; display: flex; justify-content: center; }
`;

// ─── 7 · The letter (pull the ribbon) ───────────────────────────────────────

export function Letter({ letter, recipient, sender, petName, onNext }: { letter: string; recipient: string; sender: string; petName: string; onNext: () => void }) {
  const { cue } = usePp();
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const pull = useMotionValue(0);
  const squash = useTransform(pull, [0, 90], [1, 0.7]);
  const untie = () => {
    if (open) return;
    haptic([12, 30, 16]);
    cue("ribbon", { gain: 0.8 });
    cue("paper-rustle", { gain: 0.6, at: 0.3 });
    cue("page-turn", { gain: 0.4, at: 0.55 });
    setOpen(true);
  };
  useNext(open ? "I read every word" : null, onNext, "heart");

  return (
    <>
      <Head kicker="For your eyes only" title={open ? `Dear ${petName || recipient},` : "I wrote you a letter"} sub={open ? undefined : "Pull the ribbon to untie it 🎀"} />
      <div className="pp-fill">
        <div className={`pp-scroll-l${open ? " is-open" : ""}`}>
          <span className="pp-roller pp-roller-top" aria-hidden />
          <motion.div className="pp-paper" initial={false} animate={{ height: open ? "100%" : "18%" }} transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 60, damping: 16, delay: 0.25 }}>
            {open && (
              <motion.div className="pp-paper-in" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: reduced ? 0 : 0.7, duration: 0.5 }}>
                <PpScroll className="pp-paper-scroll" label="The letter">
                  <div className="pp-paper-body">
                    {letter.split(/\n{2,}/).map((para, k) => (
                      <p key={k}>{para}</p>
                    ))}
                    <p className="pp-paper-sign">
                      Forever yours,
                      <br />
                      <b>{sender}</b>
                    </p>
                  </div>
                </PpScroll>
              </motion.div>
            )}
          </motion.div>
          <span className="pp-roller pp-roller-bot" aria-hidden />
          <AnimatePresence>
            {!open && (
              <motion.div className="pp-bow" exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.4, y: 60, rotate: 40, transition: { duration: 0.45 } }}>
                <motion.svg viewBox="0 0 120 70" className="pp-bow-svg" style={{ scaleX: squash }} aria-hidden>
                  <path d="M60 34 C40 10 8 8 10 30 C12 50 42 46 60 34 Z" fill="var(--vw-accent)" stroke="var(--pp-deep)" strokeWidth="2" />
                  <path d="M60 34 C80 10 112 8 110 30 C108 50 78 46 60 34 Z" fill="var(--vw-accent)" stroke="var(--pp-deep)" strokeWidth="2" />
                  <path d="M24 24 C34 22 44 26 52 32" stroke="#FFFFFF" strokeWidth="2.5" fill="none" opacity=".6" strokeLinecap="round" />
                  <rect x="52" y="26" width="16" height="16" rx="6" fill="var(--vw-accent-deep)" stroke="var(--pp-deep)" strokeWidth="2" />
                </motion.svg>
                <motion.button
                  type="button"
                  className="pp-tail"
                  drag="y"
                  dragConstraints={{ top: 0, bottom: 110 }}
                  dragElastic={0.15}
                  dragSnapToOrigin
                  style={{ y: pull }}
                  onDrag={(_, info) => {
                    if (info.offset.y > 80) untie();
                  }}
                  onTap={untie}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      untie();
                    }
                  }}
                  aria-label="Pull the ribbon to open the letter"
                  data-pp-ribbon
                >
                  <svg viewBox="0 0 40 120" aria-hidden>
                    <path d="M14 0 C10 40 22 70 12 112 L22 104 L30 116 C36 72 24 40 26 0 Z" fill="var(--vw-accent)" stroke="var(--pp-deep)" strokeWidth="2" strokeLinejoin="round" />
                  </svg>
                  <span className="pp-tail-tip" aria-hidden>
                    pull ↓
                  </span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
          {!open && <span className="pp-scroll-to">for {recipient}</span>}
        </div>
      </div>
      <style>{LETTER_CSS}</style>
    </>
  );
}

const LETTER_CSS = `
.pp-scroll-l { position: relative; width: min(100%, 440px); height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.pp-scroll-l.is-open { justify-content: flex-start; }
.pp-roller { flex: none; width: 100%; height: 22px; border-radius: 11px; z-index: 2; position: relative;
  background: linear-gradient(180deg, color-mix(in srgb, var(--vw-gold) 50%, #FFFFFF), var(--vw-gold) 55%, color-mix(in srgb, var(--vw-gold) 70%, var(--pp-deep)));
  box-shadow: 0 0 0 1.5px var(--pp-deep), 0 8px 14px -8px color-mix(in srgb, var(--pp-deep) 60%, transparent); }
.pp-roller::before, .pp-roller::after { content: ""; position: absolute; top: 3px; width: 14px; height: 16px; border-radius: 6px; background: var(--vw-accent-deep); box-shadow: 0 0 0 1.5px var(--pp-deep); }
.pp-roller::before { left: -8px; } .pp-roller::after { right: -8px; }
.pp-paper { width: calc(100% - 20px); min-height: 0; overflow: hidden; box-sizing: border-box; display: flex;
  background: linear-gradient(90deg, color-mix(in srgb, var(--pp-blush) 70%, transparent), transparent 8%, transparent 92%, color-mix(in srgb, var(--pp-blush) 70%, transparent)), linear-gradient(180deg, #FFFDF8, var(--vw-paper));
  box-shadow: inset 0 0 0 1.5px var(--vw-edge); }
.pp-scroll-l:not(.is-open) .pp-paper { max-height: 64px; }
.pp-scroll-l.is-open .pp-paper { flex: 1 1 auto; }
.pp-paper-in { flex: 1 1 auto; min-height: 0; display: grid; padding: 12px 6px 8px 18px; }
.pp-paper-scroll { min-height: 0; }
.pp-paper-body { text-align: left; }
.pp-paper-body p { margin: 0 0 14px; font: 400 clamp(17px, 2.5dvh, 20px)/1.55 ${PP_HAND}; color: var(--vw-ink); overflow-wrap: anywhere; white-space: pre-line; }
.pp-paper-sign { text-align: right; }
.pp-paper-sign b { font: 700 26px ${PP_SCRIPT}; color: var(--vw-accent-deep); }
.pp-bow { position: absolute; left: 50%; top: 50%; width: 130px; margin-left: -65px; margin-top: -40px; z-index: 4; display: grid; justify-items: center; }
.pp-bow-svg { width: 120px; height: 70px; overflow: visible; filter: drop-shadow(0 6px 8px color-mix(in srgb, var(--pp-deep) 35%, transparent)); }
.pp-tail { margin-top: -22px; width: 56px; height: 126px; padding: 0; border: 0; background: none; cursor: grab; touch-action: none; position: relative; -webkit-tap-highlight-color: transparent; }
.pp-tail svg { width: 40px; height: 120px; margin: 0 auto; display: block; pointer-events: none; }
.pp-tail-tip { position: absolute; left: 50%; bottom: -22px; transform: translateX(-50%); white-space: nowrap; padding: 3px 10px; border-radius: 99px; background: var(--vw-accent-deep); color: #FFFFFF; font: 700 12px ${FONTS.ui}; animation: pp-hint-bob 1.3s ease-in-out infinite; }
.pp-tail:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 2px; border-radius: 12px; }
.pp-scroll-to { position: absolute; left: 0; right: 0; top: calc(50% - 88px); font: 700 clamp(22px, 3.4dvh, 28px) ${PP_SCRIPT}; color: var(--vw-accent-deep); }
@media (prefers-reduced-motion: reduce) { .pp-tail-tip { animation: none; } }
`;

// ─── 8 · The ring box ───────────────────────────────────────────────────────

export function RingBox({ promise, sticker, onNext }: { promise: string; sticker: ReactNode; onNext: () => void }) {
  const { cue } = usePp();
  const reduced = useReducedMotion();
  const lid = useMotionValue(0);
  const tilt = useTransform(lid, (v) => `perspective(560px) rotateX(${-v * 158}deg)`);
  const [open, setOpen] = useState(false);
  const drag = useRef<{ y: number; p: number } | null>(null);

  const finish = () => {
    if (open) return;
    setOpen(true);
    animate(lid, 1, reduced ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 14 });
    haptic([14, 40, 24]);
    cue("creak", { gain: 0.35 });
    cue("chime-cascade", { gain: 0.7, at: 0.35 });
    cue("sparkle", { gain: 0.6, at: 0.9 });
    if (!reduced) window.setTimeout(() => burst({ kind: "sparkles", origin: { x: 0.5, y: 0.42 }, count: 34, spread: 0.5 }), 900);
  };
  const down = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (open) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { y: e.clientY, p: lid.get() };
  };
  const move = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || open) return;
    lid.set(Math.max(0, Math.min(0.85, d.p + (d.y - e.clientY) / 150)));
  };
  const up = () => {
    const d = drag.current;
    drag.current = null;
    if (!d || open) return;
    if (lid.get() > 0.4) finish();
    else if (lid.get() < 0.04) finish(); // a tap opens it too
    else animate(lid, 0, { type: "spring", stiffness: 260, damping: 20 });
  };

  useNext(open ? "I have a question…" : null, onNext, "ring");

  return (
    <>
      <Head kicker="Something small, for someone big" title={open ? <>For <em>you</em></> : "Open the little box"} sub={open ? undefined : "Swipe the lid up ☝️"} />
      <div className="pp-fill">
        <div className={`pp-box${open ? " is-open" : ""}`}>
          <svg className="pp-box-rays" viewBox="-100 -100 200 200" aria-hidden>
            <defs>
              <radialGradient id="ppRayFade">
                <stop offset="0" stopColor="var(--pp-sun)" stopOpacity="1" />
                <stop offset=".7" stopColor="var(--pp-sun)" stopOpacity=".35" />
                <stop offset="1" stopColor="var(--pp-sun)" stopOpacity="0" />
              </radialGradient>
            </defs>
            {Array.from({ length: 16 }, (_, k) => (
              <path key={k} d="M0 0 L-7 -100 L7 -100 Z" fill="url(#ppRayFade)" transform={`rotate(${k * 22.5})`} />
            ))}
            <circle r="34" fill="url(#ppRayFade)" />
          </svg>
          <motion.span className="pp-box-ring" initial={false} animate={open ? { y: "-78%", scale: 1, opacity: 1 } : { y: "10%", scale: 0.6, opacity: 0 }} transition={reduced ? { duration: 0 } : { delay: 0.45, type: "spring", stiffness: 60, damping: 12 }} aria-hidden>
            <Ring />
            {open && (
              <>
                <span className="pp-glint pp-glint-a">
                  <Sparkle size={22} color="#FFFFFF" />
                </span>
                <span className="pp-glint pp-glint-b">
                  <Sparkle size={14} />
                </span>
              </>
            )}
          </motion.span>
          <div className="pp-box-base">
            <RingBoxBase />
          </div>
          <motion.div className="pp-box-lid" style={{ transform: tilt }}>
            <span className="pp-lid-out">
              <RingBoxLid />
            </span>
            <span className="pp-lid-in" />
          </motion.div>
          {!open && (
            <button type="button" className="pp-box-hit" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), finish())} aria-label="Swipe the lid up to open the ring box" data-pp-box>
              <span className="pp-box-arrow" aria-hidden>
                ↑
              </span>
            </button>
          )}
        </div>
      </div>
      <div className="pp-promise-slot" aria-live="polite">
        {open && (
          <motion.div className="pp-promise" initial={reduced ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduced ? 0 : 1.3, type: "spring", stiffness: 200, damping: 20 }}>
            <span className="pp-promise-gif">{sticker}</span>
            <p>{promise}</p>
          </motion.div>
        )}
      </div>
      <style>{BOX_CSS}</style>
    </>
  );
}

const BOX_CSS = `
.pp-box { position: relative; width: min(62cqw, 74cqh, 240px); aspect-ratio: 1.1; }
.pp-box-base { position: absolute; left: 0; right: 0; bottom: 0; z-index: 1; filter: drop-shadow(0 18px 18px color-mix(in srgb, var(--pp-deep) 35%, transparent)); }
.pp-box-lid { position: absolute; left: 0; right: 0; bottom: 51%; z-index: 3; transform-origin: 50% 20%; transform-style: preserve-3d; pointer-events: none; }
.pp-lid-out { display: block; backface-visibility: hidden; -webkit-backface-visibility: hidden; }
.pp-lid-in { position: absolute; left: 7.5%; right: 7.5%; top: 4%; bottom: 8%; border-radius: 50% 50% 18px 18px / 40% 40% 18px 18px; transform: rotateX(180deg); backface-visibility: hidden; -webkit-backface-visibility: hidden;
  background: radial-gradient(120% 90% at 50% 70%, #FFFFFF, var(--pp-blush) 70%); box-shadow: inset 0 0 0 3px var(--vw-accent), inset 0 0 0 5px var(--pp-deep); }
.pp-box-ring { position: absolute; left: 26%; width: 48%; bottom: 40%; z-index: 4; filter: drop-shadow(0 8px 10px color-mix(in srgb, var(--pp-deep) 35%, transparent)); }
.pp-box-ring svg { width: 100%; height: auto; display: block; }
.pp-glint { position: absolute; animation: pp-twinkle 1.1s ease-in-out infinite alternate; }
.pp-glint-a { left: 6%; top: -6%; } .pp-glint-b { right: 4%; top: 12%; animation-delay: -.5s; }
.pp-box-rays { position: absolute; left: -45%; top: -95%; width: 190%; height: auto; overflow: visible; opacity: 0; scale: .3; z-index: 0; pointer-events: none; transition: scale 1.4s ease .5s, opacity 1.2s ease .5s; }
.pp-box.is-open .pp-box-rays { opacity: 1; scale: 1; animation: pp-rays-spin 24s linear infinite; }
@keyframes pp-rays-spin { from { rotate: 0deg } to { rotate: 360deg } }
.pp-box-hit { position: absolute; inset: -12% -8% -6%; z-index: 4; border: 0; padding: 0; background: none; cursor: grab; touch-action: none; -webkit-tap-highlight-color: transparent; }
.pp-box-hit:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 2px; border-radius: 20px; }
.pp-box-arrow { position: absolute; left: 50%; top: -6%; width: 40px; height: 40px; margin-left: -20px; border-radius: 50%; display: grid; place-items: center; font: 800 22px ${FONTS.ui}; color: #FFFFFF; background: var(--vw-accent-deep);
  box-shadow: 0 6px 14px -6px color-mix(in srgb, var(--pp-deep) 70%, transparent); animation: pp-arrow-up 1.2s ease-in-out infinite; }
@keyframes pp-arrow-up { 0%, 100% { transform: translateY(4px) } 50% { transform: translateY(-8px) } }
.pp-promise-slot { flex: none; min-height: clamp(84px, 13dvh, 120px); width: 100%; max-width: 420px; display: grid; place-items: center; }
.pp-promise { position: relative; box-sizing: border-box; width: 100%; padding: 14px 18px 14px 18px; border-radius: 22px; background: var(--vw-paper); box-shadow: 0 0 0 2px var(--vw-gold), 0 16px 30px -16px color-mix(in srgb, var(--pp-deep) 60%, transparent); }
.pp-promise p { margin: 0; font: 400 clamp(17px, 2.5dvh, 20px)/1.35 ${PP_HAND}; color: var(--vw-ink); overflow-wrap: anywhere; padding-right: 54px; text-align: left; }
.pp-promise-gif { position: absolute; right: -10px; top: -40px; transform: rotate(8deg); }
.pp-promise-gif .pp-stk img { width: 70px !important; height: 70px !important; }
@media (prefers-reduced-motion: reduce) { .pp-box-rays, .pp-glint, .pp-box-arrow { animation: none !important; } }
`;
