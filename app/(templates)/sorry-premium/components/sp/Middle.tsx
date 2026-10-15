"use client";

// Scenes 4–7: the fortune cookies, the jar of paper stars, our sunny days on
// the washing line, and the letter as a paper boat.

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { CroppedPhoto, burst, haptic, useReducedMotion } from "../../../_valentine/kit";
import type { LovePhoto } from "../../../_valentine/types";
import { FONTS } from "../../../_valentine/theme";
import { CookieHalf, FortuneCookie, PaperBoat, PaperStar, PuddleBear, StarJar } from "./art";
import { SP_DISPLAY, SP_HAND } from "./fonts";
import { useNext, useSp } from "./stage";
import { Head, SpScroll } from "./ui";

// ─── 4 · Fortune cookies ────────────────────────────────────────────────────

export function Cookies({ lessons, onNext }: { lessons: readonly string[]; onNext: () => void }) {
  const { cue } = useSp();
  const reduced = useReducedMotion();
  const list = lessons.slice(0, 3);
  const [taps, setTaps] = useState<number[]>(() => list.map(() => 0));
  const [order, setOrder] = useState<number[]>([]);
  const all = order.length >= list.length;

  const tap = (k: number) => {
    if (taps[k] >= 2) return;
    const n = taps[k] + 1;
    setTaps((t) => t.map((v, i) => (i === k ? n : v)));
    if (n === 1) {
      haptic(8);
      cue("tick", { gain: 0.5, detune: k * 150 });
      return;
    }
    haptic(18);
    cue("snap", { gain: 0.7 });
    cue("paper-rustle", { gain: 0.45, at: 0.15 });
    setOrder((o) => [...o, k]);
  };

  useEffect(() => {
    if (all && !reduced) burst({ kind: "sparkles", origin: { x: 0.5, y: 0.35 }, count: 18 });
  }, [all, reduced]);

  useNext(all ? "I'll remember them" : null, onNext, "cookie");

  return (
    <>
      <Head kicker="What I learnt" title="Crack them open" sub={all ? "Lessons I'm keeping." : "Tap a cookie twice to crack it 🥠"} />
      <div className="sp-fill">
        <div className="sp-ck sp-zoom">
          <ul className="sp-ck-row">
            {list.map((_, k) => {
              const st = taps[k];
              return (
                <li key={k}>
                  <button
                    type="button"
                    className={`sp-cookie${st === 1 ? " is-crack" : ""}${st >= 2 ? " is-open" : ""}`}
                    onClick={() => tap(k)}
                    disabled={st >= 2}
                    aria-label={st >= 2 ? `Cookie ${k + 1}, open` : st === 1 ? `Cookie ${k + 1}: once more to crack it` : `Crack cookie ${k + 1}`}
                    data-sp-cookie={k}
                    style={{ animationDelay: `${k * -0.7}s` }}
                  >
                    {st >= 2 ? (
                      <>
                        <span className="sp-ck-l">
                          <CookieHalf />
                        </span>
                        <span className="sp-ck-r">
                          <CookieHalf flip />
                        </span>
                        <span className="sp-ck-slip" aria-hidden />
                      </>
                    ) : (
                      <span className="sp-ck-whole">
                        <FortuneCookie cracked={st === 1} />
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
          <SpScroll className="sp-ck-scroll" label="What I learnt">
            <ol className="sp-slips">
              <AnimatePresence initial={false}>
                {order.map((k) => (
                  <motion.li key={k} initial={reduced ? false : { opacity: 0, y: -14, scaleX: 0.4 }} animate={{ opacity: 1, y: 0, scaleX: 1 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}>
                    <span className="sp-slip-n">{k + 1}</span>
                    <span className="sp-slip-t">{list[k]}</span>
                  </motion.li>
                ))}
              </AnimatePresence>
              {order.length === 0 && <li className="sp-slip-empty">your fortunes land here ✨</li>}
            </ol>
          </SpScroll>
        </div>
      </div>
      <style>{COOKIE_CSS}</style>
    </>
  );
}

const COOKIE_CSS = `
.sp-ck { width: min(100%, 440px); height: 100%; display: flex; flex-direction: column; justify-content: center; gap: clamp(12px, 2.4dvh, 22px); min-height: 0; }
.sp-ck-row { flex: none; list-style: none; margin: 0; padding: 16px 10px 10px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; border-radius: 999px / 60%;
  background: radial-gradient(ellipse at 50% 70%, var(--vw-paper), color-mix(in srgb, var(--vw-paper) 50%, transparent) 70%, transparent 72%); }
.sp-cookie { position: relative; width: 100%; aspect-ratio: 1.15; border: 0; padding: 0; background: none; cursor: pointer; touch-action: manipulation; animation: sp-ck-bob 2.2s ease-in-out infinite alternate; -webkit-tap-highlight-color: transparent; }
@keyframes sp-ck-bob { from { transform: translateY(-3px) rotate(-3deg) } to { transform: translateY(3px) rotate(3deg) } }
.sp-cookie:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 3px; border-radius: 16px; }
.sp-ck-l, .sp-ck-r { position: absolute; top: 6%; width: 52%; height: 88%; transition: transform .55s cubic-bezier(.3,1.5,.5,1); filter: drop-shadow(0 8px 8px color-mix(in srgb, var(--sp-deep) 25%, transparent)); }
.sp-ck-l { left: 0; } .sp-ck-r { right: 0; }
.sp-cookie.is-crack { animation: sp-ck-shake .35s ease-in-out 2; }
@keyframes sp-ck-shake { 0%,100% { transform: rotate(0) } 25% { transform: rotate(-7deg) } 75% { transform: rotate(7deg) } }
.sp-ck-whole { position: absolute; inset: 4% 0; display: block; filter: drop-shadow(0 8px 8px color-mix(in srgb, var(--sp-deep) 25%, transparent)); }
.sp-ck-line { position: absolute; left: 50%; top: 20%; width: 4px; height: 50%; margin-left: -2px; background: repeating-linear-gradient(170deg, #5A3B33 0 5px, transparent 5px 8px); border-radius: 2px; }
.sp-cookie.is-open { animation: none; cursor: default; }
.sp-cookie.is-open .sp-ck-l { transform: translate(-16%, 10%) rotate(-28deg); }
.sp-cookie.is-open .sp-ck-r { transform: translate(16%, 10%) rotate(28deg); }
.sp-ck-slip { position: absolute; left: 50%; top: 30%; width: 70%; height: 14px; transform: translateX(-50%); background: #FFFFFF; box-shadow: 0 0 0 1.5px var(--vw-edge); border-radius: 2px; animation: sp-slip .5s ease-out both .1s; }
.sp-ck-slip::after { content: ""; position: absolute; left: 12%; right: 12%; top: 6px; height: 2px; background: var(--vw-accent); opacity: .7; }
@keyframes sp-slip { from { transform: translateX(-50%) scaleX(.2); opacity: 0 } to { transform: translateX(-50%) translateY(-10px) scaleX(1); opacity: 1 } }
.sp-ck-scroll { flex: 0 1 auto; }
.sp-slips { list-style: none; margin: 0; padding: 4px 2px 10px; display: grid; gap: 10px; }
.sp-slips li { position: relative; display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 10px; align-items: start; padding: 11px 14px; text-align: left;
  background: #FFFFFF; border-radius: 4px; box-shadow: 0 0 0 1.5px var(--vw-edge), 0 8px 16px -12px color-mix(in srgb, var(--sp-deep) 55%, transparent); transform-origin: 50% 0; }
.sp-slips li::before, .sp-slips li::after { content: ""; position: absolute; top: 0; bottom: 0; width: 6px; background: radial-gradient(circle at 0 50%, transparent 3px, #FFFFFF 3.5px) 0 0 / 6px 10px repeat-y; }
.sp-slips li::before { left: -5px; transform: scaleX(-1); } .sp-slips li::after { right: -5px; }
.sp-slip-n { display: grid; place-items: center; width: 24px; height: 24px; border-radius: 50%; font: 800 13px ${SP_DISPLAY}; color: #FFFFFF; background: var(--vw-accent); }
.sp-slip-t { font: 400 clamp(16px, 2.4dvh, 19px)/1.35 ${SP_HAND}; color: #3F2A2A; overflow-wrap: anywhere; }
.sp-slips .sp-slip-empty { display: block; text-align: center; background: transparent; box-shadow: none; font: 600 15px ${FONTS.ui}; color: var(--vw-ink-soft); }
.sp-slips .sp-slip-empty::before, .sp-slips .sp-slip-empty::after { display: none; }
@media (prefers-reduced-motion: reduce) { .sp-cookie, .sp-ck-slip { animation: none !important; } }
`;

// ─── 5 · The jar of paper stars ─────────────────────────────────────────────

export function Stars({ stars, days, starColors, sticker, onNext }: { stars: readonly string[]; days: number; starColors: readonly string[]; sticker: ReactNode; onNext: () => void }) {
  const { cue } = useSp();
  const reduced = useReducedMotion();
  const jar = useAnimationControls();
  const [out, setOut] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  const lastX = useRef(0);
  const dir = useRef(0);
  const lastPop = useRef(0);
  const all = out >= stars.length;

  const pop = () => {
    const now = performance.now();
    if (all || now - lastPop.current < 380) return;
    lastPop.current = now;
    const k = out;
    setOut(k + 1);
    setOpen(k);
    haptic(14);
    cue("glass-ping", { gain: 0.45, detune: k * 120 });
    cue("sparkle", { gain: 0.35, at: 0.1 });
    if (!reduced) void jar.start({ rotate: [0, -10, 9, -5, 0], transition: { duration: 0.5 } });
  };

  // A shake: the jar flips direction with enough travel.
  const onDrag = (_: unknown, info: { offset: { x: number } }) => {
    const x = info.offset.x;
    const d = x - lastX.current;
    if (Math.abs(d) > 2) {
      const nd = Math.sign(d);
      if (dir.current && nd !== dir.current && Math.abs(x) > 18) pop();
      dir.current = nd;
    }
    lastX.current = x;
  };

  useEffect(() => {
    if (all) cue("chime-cascade", { gain: 0.5, at: 0.3 });
  }, [all, cue]);

  useNext(all ? "Every word is true" : null, onNext, "star");

  return (
    <>
      <Head
        kicker={days > 0 ? `${days.toLocaleString("en-IN")} days of us ✨` : "Things I love about you"}
        title={all ? "All my stars are yours" : "A jar of paper stars"}
        sub={all ? "Tap any star to read it again." : "Shake the jar (or tap it) to let a star out ⭐"}
      />
      <div className="sp-fill">
        <div className="sp-jar-wrap">
          <motion.div
            className="sp-jar"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.5}
            onDrag={onDrag}
            onDragEnd={() => {
              lastX.current = 0;
              dir.current = 0;
            }}
            onTap={pop}
            animate={jar}
            role="button"
            tabIndex={all ? -1 : 0}
            aria-label={all ? "The jar is empty" : `Shake the jar to let a star out (${out} of ${stars.length})`}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), pop())}
            data-sp-jar={out}
          >
            <StarJar left={stars.length - out} colors={starColors} />
            <span className="sp-jar-gif">{sticker}</span>
          </motion.div>
          <ul className="sp-starrow" aria-label="Stars you've let out">
            {stars.map((_, k) => (
              <li key={k}>
                {k < out ? (
                  <motion.button
                    type="button"
                    className={`sp-star${open === k ? " is-on" : ""}`}
                    onClick={() => {
                      setOpen(k);
                      cue("tick", { gain: 0.4 });
                    }}
                    initial={reduced ? false : { y: -120, x: 0, scale: 0.4, rotate: -90 }}
                    animate={{ y: 0, x: 0, scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 220, damping: 14 }}
                    aria-label={`Star ${k + 1}`}
                    aria-pressed={open === k}
                  >
                    <PaperStar size="100%" color={starColors[k % starColors.length]} />
                  </motion.button>
                ) : (
                  <span className="sp-star-slot" aria-hidden />
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="sp-say">
        <AnimatePresence mode="wait">
          {open === null ? (
            <p key="e" className="sp-hint">
              {stars.length} folded little stars, all for you
            </p>
          ) : (
            <motion.p
              key={open}
              className="sp-say-card sp-star-card"
              initial={reduced ? false : { opacity: 0, rotateX: -80, y: -10 }}
              animate={{ opacity: 1, rotateX: 0, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, transition: { duration: 0.1 } }}
              transition={{ type: "spring", stiffness: 240, damping: 20 }}
              aria-live="polite"
            >
              <span className="sp-star-n">⭐ {open + 1}</span> {stars[open]}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      <style>{STAR_CSS}</style>
    </>
  );
}

const STAR_CSS = `
.sp-jar-wrap { width: 100%; height: 100%; display: grid; grid-template-rows: minmax(0, 1fr) auto; justify-items: center; align-items: center; gap: 10px; }
.sp-jar { position: relative; height: min(100%, 300px); aspect-ratio: 170 / 210; max-width: 70cqw; cursor: grab; touch-action: pan-y; transform-origin: 50% 90%; filter: drop-shadow(0 18px 20px color-mix(in srgb, var(--sp-deep) 28%, transparent)); }
.sp-jar:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 6px; border-radius: 20px; }
.sp-jar-gif { position: absolute; left: 70%; top: -4%; transform: rotate(10deg); pointer-events: none; }
.sp-jar-gif .sp-stk img { width: clamp(54px, 15cqh, 92px) !important; height: auto !important; }
@media (orientation: landscape) and (max-height: 500px) { .sp-jar-gif { left: 92%; top: 6%; } .sp-jar-gif .sp-stk img { width: 58px !important; } }
.sp-starrow { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; }
.sp-star, .sp-star-slot { display: block; width: 44px; height: 44px; box-sizing: border-box; }
.sp-star { border: 0; padding: 4px; background: none; cursor: pointer; border-radius: 50%; touch-action: manipulation; }
.sp-star.is-on { background: color-mix(in srgb, var(--vw-paper) 85%, transparent); box-shadow: 0 0 0 2px var(--vw-accent); }
.sp-star:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 2px; }
.sp-star-slot { border-radius: 50%; border: 2px dashed var(--vw-edge); transform: scale(.7); }
.sp-star-card { text-align: left; transform-origin: 50% 0; }
.sp-star-n { font: 800 13px ${SP_DISPLAY}; color: var(--vw-accent-deep); white-space: nowrap; }
`;

// ─── 6 · Our sunny days (photos on a washing line) ──────────────────────────

export function Line({ photos, placeholders = 0, onNext }: { photos: LovePhoto[]; placeholders?: number; onNext: () => void }) {
  const { cue } = useSp();
  const reduced = useReducedMotion();
  const [zoom, setZoom] = useState<number | null>(null);
  const [seen, setSeen] = useState<number[]>([]);
  const total = photos.length + placeholders;
  useNext(zoom === null ? "One more thing ⛵" : null, onNext, "boat");
  const show = (k: number) => {
    setZoom(k);
    setSeen((s) => (s.includes(k) ? s : [...s, k]));
    haptic(10);
    cue("paper-rustle", { gain: 0.5 });
  };
  const z = zoom !== null && zoom >= placeholders ? photos[zoom - placeholders] : null;
  return (
    <>
      <Head kicker="Our sunny days" title="This is what I don't want to lose" sub={zoom === null ? `Tap a photo to unpeg it 📸${total > 3 ? " · swipe for more" : ""}` : undefined} />
      <div className="sp-fill">
        <div className="sp-line-wrap">
          <div className="sp-line-box">
          <svg className="sp-line-rope" viewBox="0 0 400 40" preserveAspectRatio="none" aria-hidden>
            <path d="M0 6 Q200 44 400 6" fill="none" stroke="#8A6A55" strokeWidth="2.5" />
          </svg>
          <div className="sp-line">
            {Array.from({ length: total }, (_, k) => {
              const ph = k < placeholders;
              const p = ph ? null : photos[k - placeholders];
              return (
                <button
                  key={k}
                  type="button"
                  className={`sp-pin${seen.includes(k) ? " is-seen" : ""}`}
                  style={{ ["--tilt" as string]: `${k % 2 ? 4 : -4}deg`, animationDelay: `${-k * 0.6}s` }}
                  onClick={() => show(k)}
                  aria-label={p?.caption ? `Open photo: ${p.caption}` : `Open photo ${k + 1}`}
                  data-sp-photo={k}
                >
                  <span className="sp-peg" aria-hidden />
                  <span className="sp-pin-img">{p ? <CroppedPhoto photo={p} eager={k < 3} /> : <span className="sp-pin-empty">📸</span>}</span>
                  <span className="sp-pin-cap">{p?.caption || (ph ? "your photo here" : "")}</span>
                </button>
              );
            })}
          </div>
          </div>
          <div className="sp-line-bear" aria-hidden>
            <PuddleBear mood="hope" umbrella={false} size="100%" />
          </div>
        </div>
        <AnimatePresence>
          {zoom !== null && (
            <motion.div className="sp-zoomed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.2 }} onClick={() => setZoom(null)}>
              <motion.figure
                className="sp-zoom-card"
                initial={reduced ? false : { y: -60, rotate: -8, scale: 0.6 }}
                animate={{ y: 0, rotate: -1.5, scale: 1 }}
                exit={reduced ? undefined : { y: 30, opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 240, damping: 18 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sp-zoom-img">{z ? <CroppedPhoto photo={z} eager /> : <span className="sp-pin-empty">📸</span>}</div>
                <figcaption>
                  <span className="sp-zoom-cap">{z?.caption || "your photo here"}</span>
                  {z?.note && <span className="sp-zoom-note">{z.note}</span>}
                </figcaption>
                <div className="sp-zoom-nav">
                  <button type="button" className="sp-ghost" onClick={() => setZoom(null)} autoFocus>
                    Peg it back
                  </button>
                  {total > 1 && (
                    <button type="button" className="sp-ghost" onClick={() => show((zoom + 1) % total)}>
                      Next →
                    </button>
                  )}
                </div>
              </motion.figure>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <style>{LINE_CSS}</style>
    </>
  );
}

const LINE_CSS = `
.sp-line-wrap { position: relative; width: 100%; height: 100%; display: grid; grid-template-rows: auto auto; align-content: center; gap: 4px; }
.sp-line-box { position: relative; min-width: 0; }
.sp-line-rope { position: absolute; left: -20px; right: -20px; top: 2px; width: calc(100% + 40px); height: 40px; }
.sp-line { display: flex; gap: 14px; overflow-x: auto; overflow-y: hidden; scroll-snap-type: x proximity; padding: 18px 6px 8px; scrollbar-width: none; align-items: flex-start; min-height: 0; }
.sp-line::-webkit-scrollbar { display: none; }
.sp-pin { flex: none; scroll-snap-align: center; position: relative; width: min(48cqw, 56cqh, 220px); padding: 9px 9px 11px; border: 0; border-radius: 4px; background: #FFFFFF; cursor: pointer; display: grid; gap: 6px;
  transform-origin: 50% -10px; transform: rotate(var(--tilt)); animation: sp-sway 3.2s ease-in-out infinite alternate; box-shadow: 0 14px 24px -14px color-mix(in srgb, var(--sp-deep) 65%, transparent), 0 0 0 1px rgba(0,0,0,.05); touch-action: pan-x; }
@keyframes sp-sway { from { transform: rotate(calc(var(--tilt) - 3deg)) } to { transform: rotate(calc(var(--tilt) + 3deg)) } }
.sp-pin:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 3px; }
.sp-pin.is-seen::after { content: "♥"; position: absolute; right: 6px; bottom: 4px; font-size: 14px; color: var(--vw-accent); }
.sp-peg { position: absolute; left: 50%; top: -14px; width: 12px; height: 26px; margin-left: -6px; border-radius: 3px; background: linear-gradient(90deg, #E9C7A5, #F6DEC4); box-shadow: inset 0 0 0 1.5px #8A6A55; }
.sp-pin-img { display: block; width: 100%; aspect-ratio: .86; overflow: hidden; border-radius: 2px; background: var(--sp-blush); }
.sp-pin-empty { display: grid; place-items: center; width: 100%; height: 100%; font-size: 34px; background: repeating-linear-gradient(45deg, var(--sp-blush) 0 10px, var(--vw-paper) 10px 20px); }
.sp-pin-cap { font: 400 14px/1.2 ${SP_HAND}; color: #3F2A2A; text-wrap: balance; overflow-wrap: break-word; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.sp-line-bear { justify-self: end; width: clamp(70px, 22cqh, 120px); margin-right: 4%; }
.sp-zoomed { position: absolute; inset: -8px; z-index: 5; display: grid; place-items: center; background: color-mix(in srgb, var(--vw-paper) 55%, transparent); backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px); border-radius: 24px; }
.sp-zoom-card { margin: 0; width: min(82cqw, 62cqh, 330px); max-height: 100%; box-sizing: border-box; padding: 12px 12px 12px; background: #FFFFFF; border-radius: 6px; display: grid; gap: 8px; box-shadow: 0 30px 50px -24px color-mix(in srgb, var(--sp-deep) 70%, transparent); }
.sp-zoom-img { width: 100%; aspect-ratio: .86; overflow: hidden; border-radius: 3px; }
.sp-zoom-card figcaption { display: grid; gap: 2px; text-align: center; }
.sp-zoom-cap { font: 600 clamp(17px, 2.5dvh, 20px)/1.2 ${SP_HAND}; color: #3F2A2A; overflow-wrap: anywhere; }
.sp-zoom-note { font: 500 13.5px/1.35 ${FONTS.ui}; color: #6F5A5A; overflow-wrap: anywhere; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.sp-zoom-nav { display: flex; gap: 8px; justify-content: center; }
.sp-zoom-nav .sp-ghost { color: #4A3434; background: #FFFFFF; }
/* Landscape phones: photo on the left, caption and buttons beside it, so nothing drops off the bottom. */
@media (orientation: landscape) and (max-height: 500px) {
  .sp-zoom-card { width: auto; max-width: 96cqw; grid-template-columns: auto minmax(150px, 230px); grid-template-rows: 1fr auto; align-items: center; column-gap: 14px; }
  .sp-zoom-img { grid-row: 1 / span 2; height: calc(100cqh - 40px); width: auto; }
  .sp-zoom-card figcaption, .sp-zoom-nav { grid-column: 2; }
  .sp-zoom-nav { flex-wrap: wrap; }
}
@media (prefers-reduced-motion: reduce) { .sp-pin { animation: none; } }
`;

// ─── 7 · The letter, as a paper boat ────────────────────────────────────────

export function Boat({ letter, recipient, sender, petName, hint, onNext }: { letter: string; recipient: string; sender: string; petName: string; hint: string; onNext: () => void }) {
  const { cue } = useSp();
  const reduced = useReducedMotion();
  const pond = useRef<HTMLDivElement | null>(null);
  const boat = useAnimationControls();
  const [x, setX] = useState(0);
  const [docked, setDocked] = useState(false);
  const [open, setOpen] = useState(false);
  const travel = () => {
    const w = pond.current?.clientWidth ?? 300;
    return Math.max(120, w * 0.62);
  };

  const dock = () => {
    if (docked) return;
    setDocked(true);
    haptic(20);
    cue("bubble", { gain: 0.5 });
    cue("chime", { gain: 0.5, at: 0.3 });
    void boat.start({ x: travel(), rotate: 0, transition: { type: "spring", stiffness: 120, damping: 16 } });
    window.setTimeout(
      () => {
        setOpen(true);
        cue("paper-rustle", { gain: 0.6 });
        cue("page-turn", { gain: 0.4, at: 0.2 });
      },
      reduced ? 50 : 900,
    );
  };

  useNext(open ? "I read every word" : null, onNext, "heart");

  if (open)
    return (
      <>
        <Head kicker="The real one" title={`Dear ${petName || recipient},`} />
        <div className="sp-fill">
          <motion.article className="sp-letter" initial={reduced ? false : { opacity: 0, scale: 0.5, rotate: -6 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 160, damping: 18 }}>
            <SpScroll className="sp-letter-scroll" label="The letter">
              <div className="sp-letter-body">
                {letter.split(/\n{2,}/).map((p, k) => (
                  <p key={k}>{p}</p>
                ))}
                <p className="sp-letter-sign">
                  Yours, in every weather,
                  <br />
                  <b>{sender}</b> ☂️
                </p>
              </div>
            </SpScroll>
          </motion.article>
        </div>
        <style>{BOAT_CSS}</style>
      </>
    );

  return (
    <>
      <Head kicker="I wrote you a letter" title="It's folded into a little boat" sub={docked ? "Unfolding… 💌" : `${hint} ⛵ (drag it, or tap it)`} />
      <div className="sp-fill">
        <div className="sp-pond" ref={pond}>
          <div className="sp-puddle" aria-hidden>
            <i />
            <i />
            <i />
          </div>
          <div className="sp-shore" aria-hidden>
            <PuddleBear mood="hope" size="100%" />
          </div>
          <motion.div
            className="sp-boat"
            drag={docked ? false : "x"}
            dragConstraints={pond}
            dragElastic={0.05}
            dragMomentum={false}
            animate={boat}
            onDrag={(_, info) => {
              const nx = Math.max(0, info.offset.x);
              setX(nx);
              if (nx > travel() * 0.8) dock();
            }}
            onDragEnd={(_, info) => {
              if (info.offset.x > travel() * 0.55) dock();
            }}
            onTap={dock}
            role="button"
            tabIndex={docked ? -1 : 0}
            aria-label="The paper boat: drag it across the puddle, or tap it"
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), dock())}
            data-sp-boat
          >
            <span className="sp-boat-bob">
              <PaperBoat size="100%" />
            </span>
            <span className="sp-wake" style={{ opacity: Math.min(1, x / 60) }} aria-hidden />
          </motion.div>
        </div>
      </div>
      <p className="sp-hint">for {recipient} 💌</p>
      <style>{BOAT_CSS}</style>
    </>
  );
}

const BOAT_CSS = `
.sp-pond { position: relative; width: min(100%, 440px); height: min(100%, 300px); }
.sp-puddle { position: absolute; left: -4%; right: -4%; bottom: 8%; height: 46%; border-radius: 50%;
  background: radial-gradient(ellipse at 50% 40%, color-mix(in srgb, #BFE0FF 75%, var(--vw-paper)), color-mix(in srgb, #9CC8F2 70%, var(--sp-rain-a))); box-shadow: inset 0 6px 0 rgba(255,255,255,.6), 0 10px 0 color-mix(in srgb, #9CC8F2 45%, transparent); overflow: hidden; }
.sp-puddle i { position: absolute; left: 50%; top: 50%; width: 30%; aspect-ratio: 2.4; border-radius: 50%; border: 2px solid rgba(255,255,255,.75); translate: -50% -50%; animation: sp-ripple 3s ease-out infinite; }
.sp-puddle i:nth-child(1) { left: 22%; top: 46%; } .sp-puddle i:nth-child(2) { left: 66%; top: 62%; animation-delay: 1s; } .sp-puddle i:nth-child(3) { left: 44%; top: 30%; animation-delay: 2s; }
@keyframes sp-ripple { from { transform: scale(.2); opacity: 1 } to { transform: scale(1.6); opacity: 0 } }
.sp-shore { position: absolute; right: -2%; bottom: 24%; width: 30%; }
.sp-boat { position: absolute; left: 2%; bottom: 26%; width: clamp(96px, 30%, 140px); cursor: grab; touch-action: none; z-index: 2; }
.sp-boat:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 4px; border-radius: 16px; }
.sp-boat-bob { display: block; animation: sp-boat-bob 1.8s ease-in-out infinite; filter: drop-shadow(0 8px 6px color-mix(in srgb, var(--sp-deep) 25%, transparent)); }
@keyframes sp-boat-bob { 0%, 100% { transform: translateY(0) rotate(-3deg) } 50% { transform: translateY(-5px) rotate(3deg) } }
.sp-wake { position: absolute; right: 86%; bottom: 8%; width: 60px; height: 10px; border-radius: 50%; border-top: 3px solid rgba(255,255,255,.85); }
.sp-letter { width: min(100%, 440px); max-height: 100%; height: 100%; display: flex; border-radius: 18px; transform-origin: 50% 80%;
  background: linear-gradient(180deg, #FFFFFF, var(--vw-paper)); box-shadow: 0 0 0 2px var(--vw-edge), 0 24px 40px -22px color-mix(in srgb, var(--sp-deep) 70%, transparent); }
.sp-letter-scroll { flex: 1 1 auto; padding: 14px 6px 10px 18px; }
.sp-letter-body { text-align: left; padding: 4px 0 6px; background: repeating-linear-gradient(180deg, transparent 0 31px, color-mix(in srgb, var(--vw-accent) 15%, transparent) 31px 32px) 0 4px / 100% 32px local; }
.sp-letter-body p { margin: 0 0 32px; font: 400 clamp(16.5px, 2.4dvh, 19px)/32px ${SP_HAND}; color: var(--vw-ink); overflow-wrap: anywhere; white-space: pre-line; }
.sp-letter-sign { text-align: right; }
.sp-letter-sign b { font: 800 22px ${SP_DISPLAY}; color: var(--vw-accent-deep); }
@media (prefers-reduced-motion: reduce) { .sp-puddle i, .sp-boat-bob { animation: none; } }
`;
