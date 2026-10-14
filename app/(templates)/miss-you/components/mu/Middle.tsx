"use client";

// Scenes 5–8: our photos (polaroids), the "open when…" envelopes, the paper
// plane that unfolds into the letter, and the hug sent across the map.

import { useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CroppedPhoto, burst, haptic, useHoldProgress, useReducedMotion } from "../../../_valentine/kit";
import type { MissYouLetter } from "../../../_valentine/days/miss-you";
import type { LovePhoto } from "../../../_valentine/types";
import { FONTS } from "../../../_valentine/theme";
import { RouteMap } from "./art";
import { MU_DISPLAY, MU_HAND } from "./fonts";
import { PlaneGlyph, useMu, useNext } from "./stage";
import { Head, MuScroll } from "./ui";

// ─── 5 · Our photos ─────────────────────────────────────────────────────────

export function Memories({ photos, placeholders = 0, onNext }: { photos: LovePhoto[]; placeholders?: number; onNext: () => void }) {
  const { cue } = useMu();
  const track = useRef<HTMLDivElement | null>(null);
  const [at, setAt] = useState(0);
  useNext("Next 💌", onNext, "letter");
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
  const n = photos.length + placeholders;
  return (
    <>
      <Head kicker="Until we make new ones" title="Our little moments" sub={n > 1 ? "Swipe through 💗" : undefined} />
      <div className="mu-fill">
        <div className="mu-pol-track" ref={track} onScroll={onScroll}>
          {Array.from({ length: placeholders }, (_, k) => (
            <figure key={`ph-${k}`} className="mu-pol mu-pol-ph" style={{ ["--tilt" as string]: `${k % 2 ? 3 : -3}deg` }}>
              <span className="mu-pol-tape" aria-hidden />
              <div className="mu-pol-img mu-pol-empty">📸</div>
              <figcaption>
                <span className="mu-pol-cap">your photo here</span>
              </figcaption>
            </figure>
          ))}
          {photos.map((p, k) => (
            <figure key={`${p.url}-${k}`} className="mu-pol" style={{ ["--tilt" as string]: `${k % 2 ? 3 : -3}deg` }}>
              <span className="mu-pol-tape" aria-hidden />
              <div className="mu-pol-img">
                <CroppedPhoto photo={p} eager={k < 2} />
              </div>
              <figcaption>
                {p.caption ? <span className="mu-pol-cap">{p.caption}</span> : null}
                {p.note ? <span className="mu-pol-note">{p.note}</span> : null}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
      {n > 1 && (
        <div className="mu-dots" aria-hidden>
          {Array.from({ length: n }, (_, k) => (
            <i key={k} className={k === at ? "is-on" : undefined} />
          ))}
        </div>
      )}
      <style>{POL_CSS}</style>
    </>
  );
}

const POL_CSS = `
.mu-pol-track { width: 100%; height: 100%; display: flex; gap: 14px; align-items: center; overflow-x: auto; overflow-y: hidden; scroll-snap-type: x mandatory; padding: 14px calc(50% - min(36cqw, 40cqh, 160px)); box-sizing: border-box; scrollbar-width: none; }
.mu-pol-track::-webkit-scrollbar { display: none; }
.mu-pol { flex: none; scroll-snap-align: center; margin: 0; width: min(72cqw, 80cqh, 320px); max-height: 100%; box-sizing: border-box; padding: 12px 12px 14px; background: #FFFFFF; border-radius: 6px; position: relative;
  transform: rotate(var(--tilt)); box-shadow: 0 16px 30px -16px color-mix(in srgb, var(--mu-deep) 60%, rgba(0,0,0,.5)), 0 0 0 1px rgba(0,0,0,.04); display: grid; gap: 8px; }
.mu-pol-tape { position: absolute; left: 50%; top: -10px; width: 74px; height: 22px; transform: translateX(-50%) rotate(-3deg); background: color-mix(in srgb, var(--vw-gold) 70%, transparent); opacity: .9; border-radius: 3px; }
.mu-pol-img { width: 100%; aspect-ratio: 1; max-height: 56cqh; border-radius: 3px; overflow: hidden; margin: 0 auto; }
.mu-pol figcaption { display: grid; gap: 2px; text-align: center; min-height: 26px; }
.mu-pol-cap { font: 700 clamp(20px, 2.9dvh, 24px)/1.1 ${MU_HAND}; color: #34284A; overflow-wrap: anywhere; }
.mu-pol-note { font: 500 13px/1.35 ${FONTS.ui}; color: #6F6380; overflow-wrap: anywhere; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.mu-pol-empty { display: grid; place-items: center; font-size: 46px; background: repeating-linear-gradient(45deg, #F1ECFA 0 12px, #FFFFFF 12px 24px); }
.mu-dots { flex: none; display: flex; gap: 6px; justify-content: center; }
.mu-dots i { width: 7px; height: 7px; border-radius: 50%; background: var(--vw-edge); transition: transform .2s ease, background .2s ease; }
.mu-dots i.is-on { background: var(--vw-accent); transform: scale(1.4); }
`;

// ─── 6 · "Open when…" envelopes ─────────────────────────────────────────────

export function OpenWhen({ letters, onNext }: { letters: readonly MissYouLetter[]; onNext: () => void }) {
  const { cue } = useMu();
  const reduced = useReducedMotion();
  const [opened, setOpened] = useState<number[]>([]);
  const [reading, setReading] = useState<number | null>(null);
  const all = opened.length >= letters.length;
  const open = (k: number) => {
    haptic(16);
    if (!opened.includes(k)) {
      cue("wax-crack", { gain: 0.7 });
      cue("paper-rustle", { gain: 0.5, at: 0.2 });
      setOpened((o) => [...o, k]);
    } else cue("paper-rustle", { gain: 0.45 });
    setReading(k);
  };
  const close = () => {
    cue("page-turn", { gain: 0.4 });
    setReading(null);
  };
  useNext(opened.length && reading === null ? (all ? "Next ✈️" : "Save the rest 💌") : null, onNext, "letter");

  return (
    <>
      <Head
        kicker="For the days I'm not there"
        title="Open when…"
        sub={all ? "All opened. Come back to them anytime 💗" : opened.length ? `${opened.length} of ${letters.length} opened · the rest can wait` : "Open one now, or save them for later 💌"}
      />
      <div className="mu-fill">
        <div className={`mu-ow mu-zoom is-n${letters.length}`}>
          {letters.map((l, k) => {
            const done = opened.includes(k);
            return (
              <button key={k} type="button" className={`mu-env${done ? " is-open" : ""}`} onClick={() => open(k)} style={{ ["--tilt" as string]: `${[-2, 2, 1.5, -1.5][k % 4]}deg` }} data-mu-env={k}>
                <span className="mu-env-flap" aria-hidden />
                <span className="mu-env-body">
                  <span className="mu-env-when">{l.when}</span>
                  {done && <span className="mu-env-done">opened ✓</span>}
                </span>
                {!done && (
                  <span className="mu-env-seal" aria-hidden>
                    💗
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <AnimatePresence>
        {reading !== null && (
          <motion.div className="mu-ow-sheet" role="dialog" aria-modal="true" aria-labelledby="mu-ow-t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.2 }} onClick={close}>
            <motion.div
              className="mu-ow-card"
              onClick={(e) => e.stopPropagation()}
              initial={reduced ? false : { y: 40, scaleY: 0.3, rotateX: -40 }}
              animate={{ y: 0, scaleY: 1, rotateX: 0 }}
              exit={reduced ? undefined : { y: 30, scale: 0.92, opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 20 }}
            >
              <p className="mu-ow-k">Open when…</p>
              <h3 id="mu-ow-t">{letters[reading].when}</h3>
              <p className="mu-ow-note">{letters[reading].note}</p>
              <button type="button" className="mu-ow-close" autoFocus onClick={close} data-mu-env-close>
                Fold it back 💌
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <style>{OW_CSS}</style>
    </>
  );
}

const OW_CSS = `
.mu-ow { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: clamp(12px, 2.2dvh, 18px) 14px; width: min(100%, 400px); }
.mu-ow.is-n1 { grid-template-columns: minmax(0, 220px); justify-content: center; }
.mu-ow.is-n3 > :last-child { grid-column: 1 / -1; justify-self: center; width: calc(50% - 7px); }
.mu-env { position: relative; aspect-ratio: 1.22; border: 0; padding: 0; cursor: pointer; border-radius: 14px; transform: rotate(var(--tilt)); touch-action: manipulation; -webkit-tap-highlight-color: transparent;
  background: linear-gradient(180deg, var(--vw-paper), color-mix(in srgb, var(--mu-blush) 70%, var(--vw-paper))); box-shadow: 0 0 0 2px var(--vw-edge), 0 14px 24px -16px color-mix(in srgb, var(--mu-deep) 75%, transparent); transition: transform .25s ease; overflow: visible; }
.mu-env:not(.is-open):hover { transform: rotate(var(--tilt)) translateY(-3px); }
.mu-env:active { transform: rotate(var(--tilt)) scale(.97); }
.mu-env-flap { position: absolute; left: 0; right: 0; top: 0; height: 46%; clip-path: polygon(0 0, 100% 0, 50% 100%); border-radius: 14px 14px 0 0;
  background: linear-gradient(180deg, color-mix(in srgb, var(--vw-accent) 30%, var(--vw-paper)), color-mix(in srgb, var(--vw-accent) 50%, var(--vw-paper))); transform-origin: 50% 0; transition: transform .5s cubic-bezier(.3,.6,.25,1); }
.mu-env.is-open .mu-env-flap { transform: perspective(500px) rotateX(165deg); opacity: .65; }
.mu-env-body { position: absolute; left: 8px; right: 8px; bottom: 9px; top: 56%; display: grid; align-content: end; justify-items: center; gap: 0; text-align: center; }
.mu-env-body small { font: 700 10.5px ${FONTS.ui}; letter-spacing: .14em; text-transform: uppercase; color: var(--mu-kick); }
.mu-env-when { font: 700 clamp(17px, 2.6dvh, 21px)/1.05 ${MU_HAND}; color: var(--vw-ink); overflow-wrap: anywhere; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.mu-env-done { font: 700 11px ${FONTS.ui}; color: var(--vw-accent); margin-top: 1px; }
.mu-env-seal { position: absolute; left: 50%; top: 42%; transform: translate(-50%, -50%); width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; font-size: 16px;
  background: radial-gradient(circle at 40% 35%, color-mix(in srgb, var(--vw-accent) 60%, #FFF), var(--vw-accent-deep)); box-shadow: 0 3px 6px color-mix(in srgb, var(--mu-deep) 50%, transparent), inset 0 0 0 3px color-mix(in srgb, #FFF 30%, transparent); animation: mu-seal 1.8s ease-in-out infinite; }
@keyframes mu-seal { 0%, 100% { transform: translate(-50%, -50%) scale(1) } 50% { transform: translate(-50%, -50%) scale(1.1) } }
.mu-env:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 4px; }
.mu-ow-sheet { position: fixed; inset: 0; z-index: 90; display: grid; place-items: center; padding: 20px; background: color-mix(in srgb, var(--mu-deep) 40%, rgba(0,0,0,.25)); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); }
.mu-ow-card { width: min(360px, 100%); box-sizing: border-box; padding: 20px 20px 16px; border-radius: 22px; display: grid; gap: 8px; justify-items: center; text-align: center; transform-origin: 50% 0;
  background: repeating-linear-gradient(180deg, transparent 0 33px, color-mix(in srgb, var(--vw-accent) 16%, transparent) 33px 34px) 0 70px / 100% 34px, linear-gradient(180deg, #FFFFFF, #FFF9F4);
  color: #33284A; box-shadow: 0 0 0 3px var(--vw-edge), 0 30px 60px -20px rgba(0,0,0,.5); }
.mu-ow-k { margin: 0; font: 700 11px ${FONTS.ui}; letter-spacing: .16em; text-transform: uppercase; color: #8A6FB0; }
.mu-ow-card h3 { margin: 0; font: 800 clamp(24px, 6.5vw, 30px)/1.1 ${MU_DISPLAY}; color: #33284A; overflow-wrap: anywhere; }
.mu-ow-note { margin: 4px 0 6px; font: 700 clamp(21px, 5.6vw, 25px)/34px ${MU_HAND}; color: #33284A; overflow-wrap: anywhere; max-height: 50dvh; overflow-y: auto; }
.mu-ow-close { width: 100%; min-height: 50px; border: 0; border-radius: 999px; cursor: pointer; font: 800 17px ${MU_DISPLAY}; color: #FFFFFF;
  background: linear-gradient(180deg, color-mix(in srgb, var(--vw-accent) 70%, #FFFFFF), var(--vw-accent)); box-shadow: 0 4px 0 var(--mu-deep); }
.mu-ow-close:focus-visible { outline: 3px solid #33284A; outline-offset: 3px; }
@media (prefers-reduced-motion: reduce) { .mu-env-seal { animation: none; } .mu-env-flap { transition: none; } }
`;

// ─── 7 · The paper plane letter ─────────────────────────────────────────────

export function PlaneLetter({ letter, recipient, sender, petName, onNext }: { letter: string; recipient: string; sender: string; petName: string; onNext: () => void }) {
  const { cue } = useMu();
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const unfold = () => {
    if (open) return;
    haptic(14);
    cue("whoosh", { gain: 0.4 });
    cue("paper-rustle", { gain: 0.7, at: 0.2 });
    cue("page-turn", { gain: 0.5, at: 0.4 });
    setOpen(true);
  };
  useNext(open ? "I read every word" : null, onNext, "heart");
  return (
    <>
      <Head kicker={open ? "From far away, with love" : "Incoming ✈️"} title={open ? `Dear ${petName || recipient},` : "A paper plane just landed"} sub={open ? undefined : "Tap it to unfold 💌"} />
      <div className="mu-fill">
        <AnimatePresence mode="wait" initial={false}>
          {!open ? (
            <motion.button
              key="plane"
              type="button"
              className="mu-pl"
              onClick={unfold}
              aria-label="Unfold the paper plane"
              initial={reduced ? false : { opacity: 0, x: -120, y: 60, rotate: -20 }}
              animate={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
              exit={reduced ? undefined : { opacity: 0, scale: 1.6, rotate: 20, transition: { duration: 0.3 } }}
              transition={{ type: "spring", stiffness: 90, damping: 14 }}
              data-mu-plane
            >
              <svg className="mu-pl-trail" viewBox="0 0 200 120" aria-hidden>
                <path d="M10 100 C 40 60, 70 110, 100 70 S 150 30, 170 40" fill="none" stroke="var(--vw-accent)" strokeWidth="3" strokeLinecap="round" strokeDasharray="2 10" />
              </svg>
              <span className="mu-pl-glyph">
                <PlaneGlyph size="100%" />
              </span>
              <span className="mu-pl-to">for {recipient} 💌</span>
            </motion.button>
          ) : (
            <motion.article
              key="open"
              className="mu-paper"
              initial={reduced ? false : { opacity: 0, scaleY: 0.15, scaleX: 0.5, rotate: -6 }}
              animate={{ opacity: 1, scaleY: 1, scaleX: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 150, damping: 18 }}
            >
              <MuScroll className="mu-paper-scroll" label="The letter">
                <div className="mu-paper-body">
                  {letter.split(/\n{2,}/).map((para, k) => (
                    <p key={k}>{para}</p>
                  ))}
                  <p className="mu-paper-sign">
                    Missing you, always,
                    <br />
                    <b>{sender}</b> 💗
                  </p>
                </div>
              </MuScroll>
            </motion.article>
          )}
        </AnimatePresence>
      </div>
      <style>{LETTER_CSS}</style>
    </>
  );
}

const LETTER_CSS = `
.mu-pl { position: relative; width: min(80cqw, 100cqh, 320px); aspect-ratio: 1.3; border: 0; padding: 0; background: none; cursor: pointer; touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
.mu-pl-trail { position: absolute; left: -6%; top: 14%; width: 74%; opacity: .7; }
.mu-pl-glyph { position: absolute; left: 50%; top: 18%; width: 56%; animation: mu-hover 2.4s ease-in-out infinite; filter: drop-shadow(0 18px 18px color-mix(in srgb, var(--mu-deep) 40%, transparent)); }
@keyframes mu-hover { 0%, 100% { transform: translate(-50%, 0) rotate(-14deg) } 50% { transform: translate(-46%, -12px) rotate(-6deg) } }
.mu-pl-to { position: absolute; left: 0; right: 0; bottom: 4%; font: 700 clamp(21px, 7cqw, 26px) ${MU_HAND}; color: var(--vw-ink); }
.mu-pl::after { content: "tap"; position: absolute; left: 62%; top: 10%; padding: 3px 10px; border-radius: 99px; background: var(--vw-accent); color: #FFF; font: 700 12px ${FONTS.ui}; animation: mu-hint-bob 1.3s ease-in-out infinite; }
.mu-pl:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 6px; border-radius: 16px; }
.mu-paper { width: min(100%, 440px); max-height: 100%; height: 100%; box-sizing: border-box; border-radius: 16px; transform-origin: 50% 30%; display: grid; grid-template: minmax(0, 1fr) / minmax(0, 1fr); padding: 10px 8px 10px 0;
  background: linear-gradient(180deg, #FFFFFF, #FFF9F4); box-shadow: 0 0 0 2px var(--vw-edge), 0 24px 40px -22px color-mix(in srgb, var(--mu-deep) 70%, rgba(0,0,0,.4)); }
.mu-paper-scroll { min-height: 0; }
.mu-paper-body { padding: 8px 12px 10px 20px; text-align: left;
  background: repeating-linear-gradient(180deg, transparent 0 33px, color-mix(in srgb, var(--vw-accent) 18%, transparent) 33px 34px) 0 8px / 100% 34px local; }
.mu-paper-body p { margin: 0 0 34px; font: 700 clamp(20px, 2.9dvh, 23px)/34px ${MU_HAND}; color: #33284A; overflow-wrap: anywhere; white-space: pre-line; }
.mu-paper-sign { text-align: right; }
.mu-paper-sign b { font: 800 22px ${MU_DISPLAY}; color: #C2417A; }
@media (prefers-reduced-motion: reduce) { .mu-pl-glyph, .mu-pl::after { animation: none; } }
`;

// ─── 8 · A hug across the map ───────────────────────────────────────────────

export function SendHug({
  myCity,
  yourCity,
  km,
  hugLine,
  sender,
  sticker,
  onNext,
}: {
  myCity: string;
  yourCity: string;
  km: number | null;
  hugLine: string;
  sender: string;
  sticker: ReactNode;
  onNext: () => void;
}) {
  const { cue } = useMu();
  const reduced = useReducedMotion();
  const [sent, setSent] = useState(false);
  const hold = useHoldProgress({
    duration: 2400,
    onComplete: () => {
      setSent(true);
      haptic(30);
      cue("kiss", { gain: 0.6 });
      cue("chime-cascade", { gain: 0.6, at: 0.15 });
      if (!reduced) burst({ kind: "hearts", origin: { x: 0.5, y: 0.4 }, count: 28, emojis: ["💗", "🤗", "💞", "✨"] });
    },
  });
  const p = sent ? 1 : hold.progress;
  useNext(sent ? "Hug received 💗" : null, onNext, "hug");
  const across = km ? `${km.toLocaleString("en-IN")} km` : "all these kilometres";
  return (
    <>
      <Head kicker={`A hug across ${across}`} title={sent ? "Hug delivered 🤗" : "Hold to hug me"} sub={sent ? undefined : "Keep your thumb on 🤗 till our hearts meet"} />
      <div className="mu-fill">
        <div className="mu-hug mu-zoom">
          <RouteMap from={myCity} to={yourCity} meet={sent ? null : p} arrived={sent ? <span className="mu-hug-gif">{sticker ?? <span style={{ fontSize: 54 }}>🤗</span>}</span> : null} />
        </div>
      </div>
      <div className="mu-hug-foot">
        {sent ? (
          <motion.div className="mu-hug-card" initial={reduced ? false : { opacity: 0, y: 14, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}>
            <p>{hugLine}</p>
            <small>— {sender}</small>
          </motion.div>
        ) : (
          <button type="button" className={`mu-hold${hold.holding ? " is-holding" : ""}`} {...hold.bind} aria-label="Hold to send a hug" data-mu-hold>
            <span className="mu-hold-ring" style={{ ["--p" as string]: String(hold.progress) }} aria-hidden />
            <span className="mu-hold-core" aria-hidden>
              🤗
            </span>
          </button>
        )}
      </div>
      <style>{HUG_CSS}</style>
    </>
  );
}

const HUG_CSS = `
.mu-hug { width: min(100%, 420px, calc(100cqh * 1.4)); }
.mu-hug-gif .mu-stk img { width: clamp(70px, 13dvh, 108px) !important; height: auto !important; }
.mu-hug-foot { flex: none; min-height: clamp(110px, 17dvh, 140px); width: 100%; max-width: 400px; display: grid; place-items: center; }
.mu-hold { position: relative; width: clamp(104px, 15dvh, 130px); aspect-ratio: 1; border: 0; padding: 0; border-radius: 50%; background: none; cursor: pointer; touch-action: none; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; }
.mu-hold-ring { position: absolute; inset: 0; border-radius: 50%; background: conic-gradient(var(--vw-accent) calc(var(--p) * 360deg), color-mix(in srgb, var(--vw-paper) 85%, transparent) 0);
  box-shadow: 0 12px 26px -12px color-mix(in srgb, var(--mu-deep) 70%, transparent), 0 0 0 4px var(--vw-edge); }
.mu-hold-core { position: absolute; inset: 12%; border-radius: 50%; display: grid; place-items: center; font-size: clamp(40px, 6.4dvh, 54px); background: radial-gradient(circle at 40% 35%, #FFFFFF, color-mix(in srgb, var(--vw-accent) 22%, #FFF)); transition: transform .15s ease; }
.mu-hold.is-holding .mu-hold-core { transform: scale(.92); }
.mu-hold:not(.is-holding) .mu-hold-core { animation: mu-pulse 1.4s ease-in-out infinite; }
@keyframes mu-pulse { 0%, 100% { transform: scale(1) } 50% { transform: scale(1.06) } }
.mu-hold:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 4px; }
.mu-hug-card { width: 100%; box-sizing: border-box; padding: 14px 18px; border-radius: 22px; background: var(--vw-paper); box-shadow: 0 0 0 2px var(--vw-edge), 0 16px 28px -16px color-mix(in srgb, var(--mu-deep) 60%, transparent); display: grid; gap: 4px; }
.mu-hug-card p { margin: 0; font: 700 clamp(21px, 3.1dvh, 25px)/1.2 ${MU_HAND}; color: var(--vw-ink); overflow-wrap: anywhere; }
.mu-hug-card small { font: 700 13px ${FONTS.ui}; color: var(--mu-kick); }
@media (prefers-reduced-motion: reduce) { .mu-hold-core { animation: none !important; } }
`;
