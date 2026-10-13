"use client";

// Scenes 5–8: our photos (polaroids), the letter, the pinky promise, the
// make-it-up coupons.

import { useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CroppedPhoto, burst, haptic, useHoldProgress, useReducedMotion } from "../../../_valentine/kit";
import type { SorryCoupon } from "../../../_valentine/days/sorry";
import type { LovePhoto } from "../../../_valentine/types";
import { FONTS } from "../../../_valentine/theme";
import { PinkyHand, Sparkle } from "./art";
import { SR_DISPLAY, SR_HAND } from "./fonts";
import { useNext, useSr } from "./stage";
import { Head } from "./ui";

// ─── 5 · Our photos ─────────────────────────────────────────────────────────

export function Memories({ photos, placeholders = 0, onNext }: { photos: LovePhoto[]; placeholders?: number; onNext: () => void }) {
  const { cue } = useSr();
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
  return (
    <>
      <Head kicker="Remember us?" title="This is what I don't want to lose" sub={photos.length + placeholders > 1 ? "Swipe through 💗" : undefined} />
      <div className="sr-fill">
        <div className="sr-pol-track" ref={track} onScroll={onScroll}>
          {Array.from({ length: placeholders }, (_, k) => (
            <figure key={`ph-${k}`} className="sr-pol sr-pol-ph" style={{ ["--tilt" as string]: `${k % 2 ? 3 : -3}deg` }}>
              <span className="sr-pol-tape" aria-hidden />
              <div className="sr-pol-img sr-pol-empty">📸</div>
              <figcaption>
                <span className="sr-pol-cap">your photo here</span>
              </figcaption>
            </figure>
          ))}
          {photos.map((p, k) => (
            <figure key={`${p.url}-${k}`} className="sr-pol" style={{ ["--tilt" as string]: `${k % 2 ? 3 : -3}deg` }}>
              <span className="sr-pol-tape" aria-hidden />
              <div className="sr-pol-img">
                <CroppedPhoto photo={p} eager={k < 2} />
              </div>
              <figcaption>
                {p.caption ? <span className="sr-pol-cap">{p.caption}</span> : null}
                {p.note ? <span className="sr-pol-note">{p.note}</span> : null}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
      {photos.length + placeholders > 1 && (
        <div className="sr-dots" aria-hidden>
          {Array.from({ length: photos.length + placeholders }, (_, k) => (
            <i key={k} className={k === at ? "is-on" : undefined} />
          ))}
        </div>
      )}
      <style>{POL_CSS}</style>
    </>
  );
}

const POL_CSS = `
.sr-pol-track { width: 100%; height: 100%; display: flex; gap: 14px; align-items: center; overflow-x: auto; overflow-y: hidden; scroll-snap-type: x mandatory; padding: 10px calc(50% - min(36cqw, 42cqh, 160px)); box-sizing: border-box; scrollbar-width: none; }
.sr-pol-track::-webkit-scrollbar { display: none; }
.sr-pol { flex: none; scroll-snap-align: center; margin: 0; width: min(72cqw, 84cqh, 320px); max-height: 100%; box-sizing: border-box; padding: 12px 12px 14px; background: #FFFFFF; border-radius: 6px; position: relative;
  transform: rotate(var(--tilt)); box-shadow: 0 16px 30px -16px color-mix(in srgb, var(--sr-deep) 60%, transparent), 0 0 0 1px rgba(0,0,0,.04); display: grid; gap: 8px; }
.sr-pol-tape { position: absolute; left: 50%; top: -10px; width: 74px; height: 22px; transform: translateX(-50%) rotate(-3deg); background: color-mix(in srgb, var(--vw-gold) 70%, transparent); opacity: .85; border-radius: 3px; }
.sr-pol-img { width: 100%; aspect-ratio: 1; max-height: 58cqh; border-radius: 3px; overflow: hidden; margin: 0 auto; }
.sr-pol figcaption { display: grid; gap: 2px; text-align: center; min-height: 26px; }
.sr-pol-cap { font: 400 clamp(18px, 2.7dvh, 22px)/1.15 ${SR_HAND}; color: #3A2A30; overflow-wrap: anywhere; }
.sr-pol-note { font: 500 13px/1.35 ${FONTS.ui}; color: #7A6068; overflow-wrap: anywhere; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.sr-pol-empty { display: grid; place-items: center; font-size: 46px; background: repeating-linear-gradient(45deg, var(--sr-blush) 0 12px, var(--vw-paper) 12px 24px); }
.sr-dots { flex: none; display: flex; gap: 6px; justify-content: center; }
.sr-dots i { width: 7px; height: 7px; border-radius: 50%; background: var(--vw-edge); transition: transform .2s ease, background .2s ease; }
.sr-dots i.is-on { background: var(--vw-accent); transform: scale(1.4); }
`;

// ─── 6 · The letter ─────────────────────────────────────────────────────────

export function Letter({ letter, recipient, sender, petName, onNext }: { letter: string; recipient: string; sender: string; petName: string; onNext: () => void }) {
  const { cue } = useSr();
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const unfold = () => {
    if (open) return;
    haptic(14);
    cue("paper-rustle", { gain: 0.7 });
    cue("page-turn", { gain: 0.5, at: 0.25 });
    setOpen(true);
  };
  useNext(open ? "I read it" : null, onNext, "heart");
  return (
    <>
      <Head kicker="The real one" title={open ? `Dear ${petName || recipient},` : "I wrote you a letter"} sub={open ? undefined : "Tap to unfold it 💌"} />
      <div className="sr-fill">
        <AnimatePresence mode="wait" initial={false}>
          {!open ? (
            <motion.button
              key="folded"
              type="button"
              className="sr-fold"
              onClick={unfold}
              aria-label="Unfold the letter"
              initial={reduced ? false : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduced ? undefined : { opacity: 0, rotateX: 70, scale: 0.9, transition: { duration: 0.28 } }}
            >
              <span className="sr-fold-paper" aria-hidden />
              <span className="sr-fold-heart" aria-hidden>
                💌
              </span>
              <span className="sr-fold-label">for {recipient}</span>
            </motion.button>
          ) : (
            <motion.article
              key="open"
              className="sr-paper"
              initial={reduced ? false : { opacity: 0, scaleY: 0.2, rotateX: -50 }}
              animate={{ opacity: 1, scaleY: 1, rotateX: 0 }}
              transition={{ type: "spring", stiffness: 170, damping: 20 }}
            >
              <div className="sr-paper-body">
                {letter.split(/\n{2,}/).map((para, k) => (
                  <p key={k}>{para}</p>
                ))}
                <p className="sr-paper-sign">
                  Yours, still sorry,
                  <br />
                  <b>{sender}</b> 🥺
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
.sr-fold { position: relative; width: min(64cqw, 70cqh, 260px); aspect-ratio: 1 / 1.1; border: 0; padding: 0; background: none; cursor: pointer; perspective: 800px; touch-action: manipulation; animation: sr-wobble 2.4s ease-in-out infinite; }
@keyframes sr-wobble { 0%, 100% { transform: rotate(-3deg) } 50% { transform: rotate(3deg) translateY(-6px) } }
.sr-fold-paper { position: absolute; inset: 0; border-radius: 10px; background:
  linear-gradient(180deg, transparent 32%, color-mix(in srgb, var(--sr-deep) 10%, transparent) 33%, transparent 35%, transparent 65%, color-mix(in srgb, var(--sr-deep) 10%, transparent) 66%, transparent 68%),
  linear-gradient(160deg, #FFFFFF, var(--vw-paper) 60%, var(--sr-blush)); box-shadow: 0 0 0 2px var(--vw-edge), 0 22px 34px -18px color-mix(in srgb, var(--sr-deep) 70%, transparent); }
.sr-fold-heart { position: absolute; left: 50%; top: 46%; transform: translate(-50%, -50%); font-size: clamp(54px, 18cqw, 76px); filter: drop-shadow(0 6px 8px color-mix(in srgb, var(--sr-deep) 40%, transparent)); }
.sr-fold-label { position: absolute; left: 0; right: 0; bottom: 12%; font: 400 clamp(18px, 6cqw, 22px) ${SR_HAND}; color: var(--vw-ink); }
.sr-fold:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 6px; border-radius: 12px; }
.sr-paper { width: min(100%, 440px); max-height: 100%; box-sizing: border-box; border-radius: 16px; transform-origin: 50% 0; display: flex;
  background: linear-gradient(180deg, #FFFFFF, var(--vw-paper));
  box-shadow: 0 0 0 2px var(--vw-edge), 0 24px 40px -22px color-mix(in srgb, var(--sr-deep) 70%, transparent); }
.sr-paper-body { overflow-y: auto; overscroll-behavior: contain; padding: 18px 20px 20px; text-align: left;
  background: repeating-linear-gradient(180deg, transparent 0 31px, color-mix(in srgb, var(--vw-accent) 16%, transparent) 31px 32px) 0 18px / 100% 32px local; -webkit-mask-image: linear-gradient(180deg, transparent 0, #000 14px, #000 calc(100% - 18px), transparent); mask-image: linear-gradient(180deg, transparent 0, #000 14px, #000 calc(100% - 18px), transparent); }
.sr-paper-body p { margin: 0 0 32px; font: 400 clamp(18px, 2.6dvh, 21px)/32px ${SR_HAND}; color: var(--vw-ink); overflow-wrap: anywhere; white-space: pre-line; }
.sr-paper-sign { text-align: right; }
.sr-paper-sign b { font: 800 22px ${SR_DISPLAY}; color: var(--vw-accent-deep); }
@media (prefers-reduced-motion: reduce) { .sr-fold { animation: none; } }
`;

// ─── 7 · The pinky promise ──────────────────────────────────────────────────

export function PinkyPromise({ promise, sticker, onNext }: { promise: string; sticker: ReactNode; onNext: () => void }) {
  const { cue } = useSr();
  const reduced = useReducedMotion();
  const [sealed, setSealed] = useState(false);
  const hold = useHoldProgress({
    duration: 2000,
    onComplete: () => {
      setSealed(true);
      haptic(28);
      cue("kiss", { gain: 0.6 });
      cue("chime-cascade", { gain: 0.6, at: 0.15 });
      if (!reduced) burst({ kind: "sparkles", origin: { x: 0.5, y: 0.42 }, count: 26 });
    },
  });
  const p = sealed ? 1 : hold.progress;
  useNext(sealed ? "Promise accepted" : null, onNext, "promise");
  return (
    <>
      <Head kicker="Pinky promise" title={sealed ? "Sealed. For real. 🤞" : "Hold to pinky promise"} sub={sealed ? undefined : "Keep your thumb on 🤞 till the hands meet"} />
      <div className="sr-fill">
        <div className={`sr-pinky${sealed ? " is-sealed" : ""}`} style={{ ["--p" as string]: String(p) }}>
          <div className="sr-pinky-hands" aria-hidden>
            <span className="sr-pinky-l">
              <PinkyHand size="100%" />
            </span>
            <span className="sr-pinky-r">
              <PinkyHand size="100%" flip tone="#F7D6C4" />
            </span>
            {sealed && (
              <span className="sr-pinky-spark">
                <Sparkle size={30} color="#FFE07A" />
              </span>
            )}
          </div>
          <AnimatePresence>
            {sealed ? (
              <motion.div key="card" className="sr-pinky-card" initial={reduced ? false : { opacity: 0, y: 16, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}>
                <div className="sr-pinky-gif">{sticker}</div>
                <p>{promise}</p>
              </motion.div>
            ) : (
              <button type="button" className={`sr-hold${hold.holding ? " is-holding" : ""}`} {...hold.bind} aria-label="Hold to make the pinky promise" data-sr-hold>
                <span className="sr-hold-ring" style={{ ["--p" as string]: String(hold.progress) }} aria-hidden />
                <span className="sr-hold-core" aria-hidden>
                  🤞
                </span>
              </button>
            )}
          </AnimatePresence>
        </div>
      </div>
      <style>{PINKY_CSS}</style>
    </>
  );
}

const PINKY_CSS = `
.sr-pinky { width: 100%; height: 100%; display: grid; grid-template-rows: auto 1fr; justify-items: center; align-items: center; gap: 10px; }
.sr-pinky-hands { position: relative; width: min(96cqw, 420px); height: min(30cqh, 150px); }
.sr-pinky-l, .sr-pinky-r { position: absolute; top: 0; width: 52%; transition: transform .12s linear; }
.sr-pinky-l { left: 0; transform: translateX(calc((1 - var(--p)) * -34%)); }
.sr-pinky-r { right: 0; transform: translateX(calc((1 - var(--p)) * 34%)); }
.sr-pinky.is-sealed .sr-pinky-l, .sr-pinky.is-sealed .sr-pinky-r { transition: transform .5s cubic-bezier(.3,1.6,.5,1); }
.sr-pinky.is-sealed .sr-pinky-l { transform: translateX(6%) rotate(-4deg); }
.sr-pinky.is-sealed .sr-pinky-r { transform: translateX(-6%) rotate(4deg); }
.sr-pinky-spark { position: absolute; left: 50%; top: 52%; transform: translate(-50%, -50%); animation: sr-spark 1.2s ease-in-out infinite alternate; }
@keyframes sr-spark { from { transform: translate(-50%, -50%) scale(.8) rotate(0) } to { transform: translate(-50%, -50%) scale(1.25) rotate(45deg) } }
.sr-hold { position: relative; width: clamp(110px, 30cqw, 140px); aspect-ratio: 1; border: 0; padding: 0; border-radius: 50%; background: none; cursor: pointer; touch-action: none; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; }
.sr-hold-ring { position: absolute; inset: 0; border-radius: 50%; background: conic-gradient(var(--vw-accent) calc(var(--p) * 360deg), color-mix(in srgb, var(--vw-paper) 85%, transparent) 0);
  box-shadow: 0 12px 26px -12px color-mix(in srgb, var(--sr-deep) 70%, transparent), 0 0 0 4px var(--vw-edge); }
.sr-hold-core { position: absolute; inset: 12%; border-radius: 50%; display: grid; place-items: center; font-size: clamp(40px, 12cqw, 54px); background: radial-gradient(circle at 40% 35%, #FFFFFF, var(--sr-blush)); transition: transform .15s ease; }
.sr-hold.is-holding .sr-hold-core { transform: scale(.92); }
.sr-hold:not(.is-holding) .sr-hold-core { animation: sr-pulse 1.4s ease-in-out infinite; }
@keyframes sr-pulse { 0%, 100% { transform: scale(1) } 50% { transform: scale(1.06) } }
.sr-hold:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 4px; }
.sr-pinky-card { position: relative; width: min(100%, 380px); box-sizing: border-box; padding: 18px 18px 16px; border-radius: 22px; background: var(--vw-paper); box-shadow: 0 0 0 2px var(--vw-edge), 0 18px 30px -16px color-mix(in srgb, var(--sr-deep) 60%, transparent); display: grid; justify-items: center; gap: 8px; }
.sr-pinky-gif { margin-top: -54px; }
.sr-pinky-card p { margin: 0; font: 400 clamp(19px, 2.8dvh, 23px)/1.35 ${SR_HAND}; color: var(--vw-ink); overflow-wrap: anywhere; }
@media (prefers-reduced-motion: reduce) { .sr-hold-core, .sr-pinky-spark { animation: none !important; } }
`;

// ─── 8 · Make-it-up coupons ─────────────────────────────────────────────────

export function Coupons({ coupons, sticker, claimed, onClaim, onNext }: { coupons: readonly SorryCoupon[]; sticker: ReactNode; claimed: number | null; onClaim: (k: number) => void; onNext: () => void }) {
  const { cue } = useSr();
  const claim = (k: number) => {
    if (claimed !== null) return;
    haptic(20);
    cue("ribbon", { gain: 0.6 });
    cue("chime", { gain: 0.5, at: 0.2 });
    onClaim(k);
  };
  useNext(claimed !== null ? "Deal" : null, onNext, "ticket");
  return (
    <>
      <Head kicker="I owe you" title="Pick one to make it up to you" sub={claimed !== null ? `Claimed: ${coupons[claimed].title}` : "Tap the one you want 🎟️"} />
      <div className="sr-fill">
        <div className="sr-coup-wrap">
          <div className="sr-coup-gif">{sticker}</div>
          <ul className="sr-coups">
            {coupons.map((c, k) => {
              const mine = claimed === k;
              const other = claimed !== null && !mine;
              return (
                <li key={k}>
                  <button type="button" className={`sr-coup${mine ? " is-mine" : ""}${other ? " is-other" : ""}`} onClick={() => claim(k)} disabled={claimed !== null} data-sr-coupon={k}>
                    <span className="sr-coup-l">
                      <span className="sr-coup-t">{c.title}</span>
                      <span className="sr-coup-s">{c.line}</span>
                    </span>
                    <span className="sr-coup-r" aria-hidden>
                      {mine ? "✓" : "🎟️"}
                    </span>
                    {mine && <span className="sr-coup-stamp">CLAIMED</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <style>{COUP_CSS}</style>
    </>
  );
}

const COUP_CSS = `
.sr-coup-wrap { position: relative; width: min(100%, 400px); max-height: 100%; display: grid; justify-items: center; }
.sr-coup-gif { position: absolute; right: 2px; top: -74px; z-index: 2; transform: rotate(8deg); pointer-events: none; }
.sr-coups { list-style: none; margin: 0; padding: 0; width: 100%; display: grid; gap: clamp(8px, 1.4dvh, 12px); max-height: 100cqh; overflow-y: auto; overscroll-behavior: contain; padding: 4px 2px; box-sizing: border-box; }
.sr-coup { position: relative; width: 100%; display: flex; align-items: stretch; border: 0; padding: 0; cursor: pointer; text-align: left; border-radius: 16px; overflow: hidden;
  background: var(--vw-paper); box-shadow: 0 0 0 2px var(--vw-edge), 0 10px 20px -14px color-mix(in srgb, var(--sr-deep) 60%, transparent); transition: transform .25s ease, opacity .3s ease, filter .3s ease; touch-action: manipulation; }
.sr-coup:not(:disabled):active { transform: scale(.98); }
.sr-coup-l { flex: 1 1 auto; min-width: 0; display: grid; gap: 2px; padding: 12px 14px; }
.sr-coup-t { font: 800 clamp(16px, 2.4dvh, 19px)/1.2 ${SR_DISPLAY}; color: var(--vw-ink); overflow-wrap: anywhere; }
.sr-coup-s { font: 400 clamp(15px, 2.2dvh, 17px)/1.25 ${SR_HAND}; color: var(--vw-ink-soft); overflow-wrap: anywhere; }
.sr-coup-r { flex: none; width: 58px; display: grid; place-items: center; font-size: 24px; color: #FFFFFF; font-weight: 800;
  background: radial-gradient(circle at 0 50%, transparent 7px, var(--vw-accent) 7.5px) 0 0 / 100% 18px repeat-y; border-left: 2px dashed color-mix(in srgb, var(--vw-paper) 80%, transparent); }
.sr-coup.is-mine { box-shadow: 0 0 0 3px var(--vw-accent), 0 14px 26px -12px color-mix(in srgb, var(--sr-deep) 70%, transparent); transform: scale(1.02); }
.sr-coup.is-other { opacity: .45; filter: grayscale(.4); }
.sr-coup:disabled { cursor: default; }
.sr-coup-stamp { position: absolute; right: 66px; top: 8px; transform: rotate(-8deg); padding: 1px 7px; border: 2.5px solid var(--vw-accent-deep); border-radius: 7px;
  font: 800 11px ${FONTS.ui}; letter-spacing: .14em; color: var(--vw-accent-deep); background: var(--vw-paper); animation: sr-stamp .45s cubic-bezier(.3,1.6,.5,1); }
@keyframes sr-stamp { from { transform: rotate(-8deg) scale(2.4); opacity: 0 } to { transform: rotate(-8deg) scale(1); opacity: 1 } }
.sr-coup.is-mine .sr-coup-t { padding-right: 78px; }
.sr-coup:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 3px; }
`;
