"use client";

// Scenes 5–7: our photos (polaroids pegged to a string of fairy lights), the
// letter (a birthday card that unfolds), the birthday coupons (unwrap every
// gift, then claim the one they want first).

import { useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CroppedPhoto, haptic, useReducedMotion } from "../../../_valentine/kit";
import type { HbCoupon } from "../../../_valentine/days/happy-birthday";
import type { LovePhoto } from "../../../_valentine/types";
import { FONTS } from "../../../_valentine/theme";
import { HB_DISPLAY, HB_HAND } from "./fonts";
import { useHb, useNext } from "./stage";
import { Head } from "./ui";

// ─── 5 · Our photos ─────────────────────────────────────────────────────────

export function Memories({ photos, placeholders = 0, bulbs, onNext }: { photos: LovePhoto[]; placeholders?: number; bulbs: readonly string[]; onNext: () => void }) {
  const { cue } = useHb();
  const track = useRef<HTMLDivElement | null>(null);
  const [at, setAt] = useState(0);
  const [seen, setSeen] = useState(1);
  const total = photos.length + placeholders;
  useNext("Read my letter", onNext, "letter");
  const onScroll = () => {
    const t = track.current;
    if (!t) return;
    const w = t.firstElementChild instanceof HTMLElement ? t.firstElementChild.offsetWidth + 14 : t.clientWidth;
    const k = Math.round(t.scrollLeft / w);
    if (k !== at) {
      setAt(k);
      setSeen((s) => Math.max(s, k + 1));
      cue("paper-rustle", { gain: 0.3 });
    }
  };
  const bulbRow = (k: number) => (
    <span className="hb-pol-lights" aria-hidden>
      {[0, 1, 2].map((b) => (
        <i key={b} style={{ ["--c" as string]: bulbs[(k * 3 + b) % bulbs.length], animationDelay: `${-((k * 3 + b) % 5) * 0.4}s` }} />
      ))}
    </span>
  );
  return (
    <>
      <Head kicker="Remember these?" title="Our favourite memories" sub={total > 1 ? "Swipe through 📸" : undefined} />
      <div className="hb-fill">
        <div className="hb-pol-track" ref={track} onScroll={onScroll}>
          {Array.from({ length: placeholders }, (_, k) => (
            <figure key={`ph-${k}`} className={`hb-pol hb-pol-ph${k < seen ? " is-seen" : ""}`} style={{ ["--tilt" as string]: `${k % 2 ? 3 : -3}deg` }}>
              {bulbRow(k)}
              <span className="hb-pol-pin" aria-hidden />
              <div className="hb-pol-img hb-pol-empty">📸</div>
              <figcaption>
                <span className="hb-pol-cap">your photo here</span>
              </figcaption>
            </figure>
          ))}
          {photos.map((p, k) => (
            <figure key={`${p.url}-${k}`} className={`hb-pol${k + placeholders < seen ? " is-seen" : ""}`} style={{ ["--tilt" as string]: `${k % 2 ? 3 : -3}deg` }}>
              {bulbRow(k + placeholders)}
              <span className="hb-pol-pin" aria-hidden />
              <div className="hb-pol-img">
                <CroppedPhoto photo={p} eager={k < 2} />
              </div>
              <figcaption>
                {p.caption ? <span className="hb-pol-cap">{p.caption}</span> : null}
                {p.note ? <span className="hb-pol-note">{p.note}</span> : null}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
      {total > 1 && (
        <div className="hb-dots" aria-hidden>
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
.hb-pol-track { width: 100%; height: 100%; display: flex; gap: 14px; align-items: center; overflow-x: auto; overflow-y: hidden; scroll-snap-type: x mandatory; padding: 34px calc(50% - min(36cqw, 40cqh, 160px)) 12px; box-sizing: border-box; scrollbar-width: none; }
.hb-pol-track::-webkit-scrollbar { display: none; }
.hb-pol { flex: none; scroll-snap-align: center; margin: 0; width: min(72cqw, 78cqh, 320px); max-height: 100%; box-sizing: border-box; padding: 12px 12px 14px; background: #FFFFFF; border-radius: 6px; position: relative;
  transform: rotate(var(--tilt)); transform-origin: 50% -26px; box-shadow: 0 16px 30px -16px color-mix(in srgb, var(--hb-deep) 60%, transparent), 0 0 0 1px rgba(0,0,0,.04); display: grid; gap: 8px;
  animation: hb-swing 3.4s ease-in-out infinite alternate; }
@keyframes hb-swing { from { transform: rotate(calc(var(--tilt) - 1deg)) } to { transform: rotate(calc(var(--tilt) + 1deg)) } }
/* The string of fairy lights: each card carries its stretch of wire (wider than the card, so it runs on across the gap). */
.hb-pol-lights { position: absolute; left: -12px; right: -12px; top: -26px; height: 20px; border-top: 2px solid color-mix(in srgb, var(--vw-ink) 35%, transparent); border-radius: 50% 50% 0 0 / 14px 14px 0 0;
  display: flex; justify-content: space-around; transform: rotate(calc(var(--tilt) * -1)); }
.hb-pol-lights i { width: 9px; height: 13px; margin-top: 1px; border-radius: 45% 45% 50% 50%; background: var(--c); box-shadow: 0 0 10px 2px color-mix(in srgb, var(--c) 70%, transparent); animation: hb-twinkle 1.8s ease-in-out infinite alternate; }
@keyframes hb-twinkle { from { opacity: .55; filter: saturate(.7) } to { opacity: 1; filter: saturate(1.2) } }
.hb-pol-pin { position: absolute; left: 50%; top: -14px; width: 12px; height: 26px; transform: translateX(-50%); border-radius: 3px; background: linear-gradient(90deg, #D8B48A, #EFD3AE 50%, #C99E70); box-shadow: 0 2px 3px rgba(0,0,0,.18); z-index: 1; }
.hb-pol-img { width: 100%; aspect-ratio: 1; max-height: 54cqh; border-radius: 3px; overflow: hidden; margin: 0 auto; background: #EEE; }
.hb-pol.is-seen .hb-pol-img > * { animation: hb-develop 2s ease-out both; }
@keyframes hb-develop { 0% { filter: brightness(1.9) saturate(0) blur(3px) sepia(.5) } 60% { filter: brightness(1.2) saturate(.6) blur(.5px) sepia(.2) } 100% { filter: none } }
.hb-pol figcaption { display: grid; gap: 2px; text-align: center; min-height: 26px; }
.hb-pol-cap { font: 700 clamp(20px, 2.9dvh, 24px)/1.1 ${HB_HAND}; color: #3A2A30; overflow-wrap: anywhere; }
.hb-pol-note { font: 500 13px/1.35 ${FONTS.ui}; color: #7A6068; overflow-wrap: anywhere; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.hb-pol-empty { display: grid; place-items: center; font-size: 46px; background: repeating-linear-gradient(45deg, var(--hb-blush) 0 12px, var(--vw-paper) 12px 24px); }
.hb-dots { flex: none; display: flex; gap: 6px; justify-content: center; }
.hb-dots i { width: 7px; height: 7px; border-radius: 50%; background: var(--vw-edge); transition: transform .2s ease, background .2s ease; }
.hb-dots i.is-on { background: var(--vw-accent); transform: scale(1.4); }
@media (prefers-reduced-motion: reduce) { .hb-pol, .hb-pol-lights i, .hb-pol.is-seen .hb-pol-img > * { animation: none !important; } }
`;

// ─── 6 · The letter ─────────────────────────────────────────────────────────

export function Letter({ letter, recipient, sender, petName, signOff, onNext }: { letter: string; recipient: string; sender: string; petName: string; signOff: string; onNext: () => void }) {
  const { cue } = useHb();
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
      <Head kicker="The real gift" title={open ? `Dear ${petName || recipient},` : "I wrote you a birthday card"} sub={open ? undefined : "Tap to open it 💌"} />
      <div className="hb-fill">
        <AnimatePresence mode="wait" initial={false}>
          {!open ? (
            <motion.button
              key="folded"
              type="button"
              className="hb-fold"
              onClick={unfold}
              aria-label="Open the birthday card"
              initial={reduced ? false : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduced ? undefined : { opacity: 0, rotateY: -80, scale: 0.9, transition: { duration: 0.3 } }}
              data-hb-card
            >
              <span className="hb-fold-paper" aria-hidden />
              <span className="hb-fold-art" aria-hidden>
                🎂
              </span>
              <span className="hb-fold-hb">Happy Birthday</span>
              <span className="hb-fold-label">for {recipient}</span>
            </motion.button>
          ) : (
            <motion.article
              key="open"
              className="hb-paper"
              initial={reduced ? false : { opacity: 0, scaleY: 0.2, rotateX: -50 }}
              animate={{ opacity: 1, scaleY: 1, rotateX: 0 }}
              transition={{ type: "spring", stiffness: 170, damping: 20 }}
            >
              <div className="hb-paper-body">
                {letter.split(/\n{2,}/).map((para, k) => (
                  <p key={k}>{para}</p>
                ))}
                <p className="hb-paper-sign">
                  {signOff}
                  <br />
                  <b>{sender}</b> 💗
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
.hb-fold { position: relative; width: min(64cqw, 66cqh, 260px); aspect-ratio: 1 / 1.25; border: 0; padding: 0; background: none; cursor: pointer; perspective: 800px; touch-action: manipulation; animation: hb-wobble 2.4s ease-in-out infinite; }
@keyframes hb-wobble { 0%, 100% { transform: rotate(-3deg) } 50% { transform: rotate(3deg) translateY(-6px) } }
.hb-fold-paper { position: absolute; inset: 0; border-radius: 6px 14px 14px 6px;
  background: radial-gradient(circle, color-mix(in srgb, var(--vw-accent) 35%, transparent) 0 2.4px, transparent 3px) 0 0 / 20px 20px, linear-gradient(160deg, #FFFFFF, var(--vw-paper) 50%, var(--hb-blush));
  box-shadow: inset 8px 0 0 color-mix(in srgb, var(--hb-deep) 14%, transparent), 0 0 0 2px var(--vw-edge), 0 22px 34px -18px color-mix(in srgb, var(--hb-deep) 70%, transparent); }
.hb-fold-art { position: absolute; left: 50%; top: 38%; transform: translate(-50%, -50%); font-size: clamp(56px, 19cqw, 80px); filter: drop-shadow(0 6px 8px color-mix(in srgb, var(--hb-deep) 40%, transparent)); }
.hb-fold-hb { position: absolute; left: 0; right: 0; top: 62%; font: 800 clamp(20px, 7cqw, 26px)/1 ${HB_DISPLAY}; color: var(--vw-accent-deep); }
.hb-fold-label { position: absolute; left: 0; right: 0; bottom: 10%; font: 700 clamp(19px, 6.4cqw, 24px) ${HB_HAND}; color: var(--vw-ink); }
.hb-fold:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 6px; border-radius: 12px; }
.hb-paper { width: min(100%, 440px); max-height: 100%; box-sizing: border-box; border-radius: 16px; transform-origin: 50% 0; display: flex;
  background: linear-gradient(180deg, #FFFFFF, var(--vw-paper));
  box-shadow: 0 0 0 2px var(--vw-edge), 0 24px 40px -22px color-mix(in srgb, var(--hb-deep) 70%, transparent); }
.hb-paper-body { overflow-y: auto; overscroll-behavior: contain; padding: 18px 20px 20px; text-align: left;
  background: repeating-linear-gradient(180deg, transparent 0 31px, color-mix(in srgb, var(--vw-accent) 16%, transparent) 31px 32px) 0 18px / 100% 32px local; -webkit-mask-image: linear-gradient(180deg, transparent 0, #000 14px, #000 calc(100% - 18px), transparent); mask-image: linear-gradient(180deg, transparent 0, #000 14px, #000 calc(100% - 18px), transparent); }
.hb-paper-body p { margin: 0 0 32px; font: 600 clamp(20px, 2.8dvh, 23px)/32px ${HB_HAND}; color: var(--vw-ink); overflow-wrap: anywhere; white-space: pre-line; }
.hb-paper-sign { text-align: right; }
.hb-paper-sign b { font: 800 22px ${HB_DISPLAY}; color: var(--vw-accent-deep); }
@media (prefers-reduced-motion: reduce) { .hb-fold { animation: none; } }
`;

// ─── 7 · Birthday coupons ───────────────────────────────────────────────────

export function Gifts({
  coupons,
  colors,
  sticker,
  claimed,
  onClaim,
  onNext,
}: {
  coupons: readonly HbCoupon[];
  colors: readonly string[];
  sticker: ReactNode;
  claimed: number | null;
  onClaim: (k: number) => void;
  onNext: () => void;
}) {
  const { cue } = useHb();
  const [open, setOpen] = useState<number[]>([]);
  const all = open.length >= coupons.length;
  const tap = (k: number) => {
    if (!open.includes(k)) {
      haptic(16);
      cue("ribbon", { gain: 0.6, detune: k * 90 });
      cue("paper-rustle", { gain: 0.5, at: 0.1 });
      cue("sparkle", { gain: 0.35, at: 0.35 });
      setOpen((o) => [...o, k]);
      return;
    }
    if (!all || claimed !== null) return;
    haptic(22);
    cue("chime", { gain: 0.55 });
    cue("pop", { gain: 0.4, at: 0.05 });
    onClaim(k);
  };
  useNext(claimed !== null ? "Deal!" : null, onNext, "ticket");
  const sub = claimed !== null ? `Claimed: ${coupons[claimed].title}` : all ? "Now tap the one you want first 🎟️" : `Unwrap them all (${open.length} of ${coupons.length}) 🎀`;
  return (
    <>
      <Head kicker="Birthday gifts" title={all ? "Pick your first one" : "Unwrap your presents"} sub={sub} />
      <div className="hb-fill">
        <div className="hb-gifts-wrap">
          <div className="hb-gifts-gif">{sticker}</div>
          <ul className={`hb-gifts n${coupons.length}`}>
            {coupons.map((c, k) => {
              const isOpen = open.includes(k);
              const mine = claimed === k;
              const other = claimed !== null && !mine;
              return (
                <li key={k}>
                  <button
                    type="button"
                    className={`hb-present${isOpen ? " is-open" : ""}${mine ? " is-mine" : ""}${other ? " is-other" : ""}${all && claimed === null ? " can-claim" : ""}`}
                    style={{ ["--w" as string]: colors[k % colors.length] }}
                    onClick={() => tap(k)}
                    disabled={(isOpen && !all) || claimed !== null}
                    aria-label={!isOpen ? `Unwrap gift ${k + 1}` : `${c.title}. ${c.line}${mine ? " — claimed" : all && claimed === null ? " — tap to claim" : ""}`}
                    data-hb-gift-n={k}
                  >
                    <span className="hb-present-wrap" aria-hidden>
                      <span className="hb-present-bow">🎀</span>
                    </span>
                    <span className="hb-present-coupon">
                      <span className="hb-present-t">{c.title}</span>
                      <span className="hb-present-s">{c.line}</span>
                      {mine && <span className="hb-present-stamp">CLAIMED</span>}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <style>{GIFT_CSS}</style>
    </>
  );
}

const GIFT_CSS = `
.hb-gifts-wrap { position: relative; width: min(100%, 420px); max-height: 100%; display: grid; justify-items: center; }
.hb-gifts-gif { position: absolute; right: -6px; top: -82px; z-index: 3; transform: rotate(8deg); pointer-events: none; }
.hb-gifts-gif .hb-stk img { width: clamp(58px, 9.5dvh, 80px) !important; height: auto !important; }
.hb-gifts { list-style: none; margin: 0; padding: 4px; width: 100%; box-sizing: border-box; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: clamp(10px, 1.6dvh, 14px); }
.hb-gifts.n1 { grid-template-columns: minmax(0, 1fr); max-width: 280px; }
.hb-gifts.n1 .hb-present { aspect-ratio: 1.3; }
.hb-gifts li { margin: 0; min-width: 0; }
.hb-present { position: relative; width: 100%; aspect-ratio: 1 / 1; max-height: calc((100cqh - 40px) / 2); min-height: 120px; border: 0; padding: 0; cursor: pointer; border-radius: 18px; background: none; perspective: 700px;
  touch-action: manipulation; -webkit-tap-highlight-color: transparent; transition: transform .25s ease, opacity .3s ease, filter .3s ease; }
.hb-present:disabled { cursor: default; }
.hb-present:not(:disabled):active { transform: scale(.97); }
.hb-present-wrap, .hb-present-coupon { position: absolute; inset: 0; border-radius: 18px; backface-visibility: hidden; -webkit-backface-visibility: hidden; transition: transform .6s cubic-bezier(.3,1.3,.5,1); }
.hb-present-wrap { display: grid; place-items: center;
  background: linear-gradient(90deg, transparent 43%, #FFD66E 43% 57%, transparent 57%), linear-gradient(0deg, transparent 43%, #FFD66E 43% 57%, transparent 57%),
    radial-gradient(circle, color-mix(in srgb, #FFFFFF 55%, transparent) 0 3px, transparent 3.6px) 0 0 / 18px 18px,
    linear-gradient(160deg, color-mix(in srgb, var(--w) 70%, #FFFFFF), var(--w));
  box-shadow: inset 0 -6px 0 color-mix(in srgb, var(--w) 70%, #000), 0 12px 22px -12px color-mix(in srgb, var(--hb-deep) 70%, transparent); animation: hb-shake 2.6s ease-in-out infinite; }
.hb-gifts li:nth-child(2) .hb-present-wrap { animation-delay: -.7s; }
.hb-gifts li:nth-child(3) .hb-present-wrap { animation-delay: -1.4s; }
.hb-gifts li:nth-child(4) .hb-present-wrap { animation-delay: -2.1s; }
@keyframes hb-shake { 0%, 80%, 100% { transform: rotate(0) } 84% { transform: rotate(-4deg) } 88% { transform: rotate(4deg) } 92% { transform: rotate(-2deg) } }
.hb-present-bow { font-size: clamp(30px, 10cqw, 44px); line-height: 1; filter: drop-shadow(0 3px 3px rgba(0,0,0,.2)); }
.hb-present-coupon { transform: rotateY(180deg); display: grid; align-content: center; justify-items: center; gap: 4px; padding: 10px 10px; box-sizing: border-box; text-align: center; overflow: hidden;
  background: radial-gradient(circle at 0 50%, transparent 9px, var(--vw-paper) 9.5px) left / 51% 100% no-repeat, radial-gradient(circle at 100% 50%, transparent 9px, var(--vw-paper) 9.5px) right / 51% 100% no-repeat;
  filter: drop-shadow(0 0 1.5px var(--vw-edge)) drop-shadow(0 10px 12px color-mix(in srgb, var(--hb-deep) 25%, transparent)); }
.hb-present-coupon::before { content: ""; position: absolute; left: 14px; right: 14px; top: 8px; height: 5px; border-radius: 9px; background: var(--w); opacity: .85; }
.hb-present.is-open .hb-present-wrap { transform: rotateY(-180deg); animation: none; }
.hb-present.is-open .hb-present-coupon { transform: rotateY(0); }
.hb-present-t { font: 800 clamp(15px, 2.2dvh, 18px)/1.15 ${HB_DISPLAY}; color: var(--vw-ink); overflow-wrap: anywhere; text-wrap: balance; }
.hb-present-s { font: 600 clamp(15px, 2.1dvh, 18px)/1.1 ${HB_HAND}; color: var(--vw-ink-soft); overflow-wrap: anywhere; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }
.hb-present.can-claim { animation: hb-claim 1.2s ease-in-out infinite; }
@keyframes hb-claim { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-4px) } }
.hb-present.is-mine { transform: scale(1.04); }
.hb-present.is-mine .hb-present-coupon { filter: drop-shadow(0 0 0 var(--vw-accent)) drop-shadow(0 0 3px var(--vw-accent)) drop-shadow(0 12px 14px color-mix(in srgb, var(--hb-deep) 35%, transparent)); }
.hb-present.is-other { opacity: .45; filter: grayscale(.4); }
.hb-present-stamp { position: absolute; right: 8px; bottom: 8px; transform: rotate(-10deg); padding: 1px 7px; border: 2.5px solid var(--vw-accent-deep); border-radius: 7px;
  font: 800 11px ${FONTS.ui}; letter-spacing: .14em; color: var(--vw-accent-deep); background: var(--vw-paper); animation: hb-stamp .45s cubic-bezier(.3,1.6,.5,1); }
@keyframes hb-stamp { from { transform: rotate(-10deg) scale(2.4); opacity: 0 } to { transform: rotate(-10deg) scale(1); opacity: 1 } }
.hb-present:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 3px; }
@media (prefers-reduced-motion: reduce) { .hb-present-wrap, .hb-present-coupon { transition: none; animation: none !important; } .hb-present.can-claim { animation: none; } }
`;
