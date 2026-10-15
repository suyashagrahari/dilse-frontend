"use client";

// The third act: us, wrapped (our year in numbers), the lanterns, and next
// year's horizon.
//
//   • Wrapped — story cards like a year-in-review: tap to go on (they also
//     move on by themselves; hold to pause). Days, hours, sunrises, our song,
//     our most-said thing, the sender's own numbers, and "top person: you".
//   • Lanterns — a pastel dusk over the water; she flicks each lantern up and
//     it carries one promise for the next year into the sky.
//   • Horizon — a misty morning; she raises the sun and the mist burns off to
//     show where we'll be next year.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, animate, motion } from "framer-motion";
import { burst, haptic, useReducedMotion } from "../../../_valentine/kit";
import type { AnniStat } from "../../../_valentine/days/anniversary-premium";
import { AP_HAND, AP_SANS, AP_SCRIPT, AP_SERIF } from "./fonts";
import { useAp, useNext } from "./stage";
import { ApScroll, Head, Hint, bigWords, fmt, type Together } from "./ui";

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

// ─── 8 · Us, wrapped ────────────────────────────────────────────────────────

export interface WrapCard {
  id: string;
  kick: string;
  big?: number | string;
  bigText?: string;
  unit?: string;
  line?: string;
  emoji: string;
}

export function buildWrapped({ together, ourSong, mostSaid, stats, recipient, chapters, firsts }: { together: Together | null; ourSong: string; mostSaid: string; stats: AnniStat[]; recipient: string; chapters: number; firsts: number }): WrapCard[] {
  const out: WrapCard[] = [{ id: "intro", kick: "Our year", bigText: "Us, Wrapped", line: "A look back at the numbers only we would count.", emoji: "🎁" }];
  if (together) {
    out.push({ id: "days", kick: "Together for", big: together.totalDays, unit: together.totalDays === 1 ? "day" : "days", line: "and I'd choose every single one again.", emoji: "📅" });
    out.push({ id: "hours", kick: "That's", big: together.hours, unit: "hours", line: `${fmt(together.totalDays)} sunrises, and about ${bigWords(together.hours * 60 * 72)} heartbeats each. Most of mine were for you.`, emoji: "🌅" });
  }
  if (ourSong) out.push({ id: "song", kick: "Our song on repeat", bigText: ourSong, line: "Top track, every year, no contest.", emoji: "🎶" });
  if (mostSaid) out.push({ id: "said", kick: "Most said between us", bigText: mostSaid, line: "Said so often it's basically our love language.", emoji: "💬" });
  stats.forEach((s, k) => {
    if (s.num || s.label) out.push({ id: `stat${k}`, kick: "By the numbers", bigText: s.num, line: s.label, emoji: ["☕", "🎬", "✈️"][k % 3] });
  });
  out.push({ id: "chapters", kick: "This book holds", bigText: `${chapters} chapters`, line: `${firsts} firsts, countless little things, and one favourite person.`, emoji: "📖" });
  out.push({ id: "top", kick: "Your top person this year", bigText: recipient, line: "#1 for the whole year. Every year, actually.", emoji: "🏆" });
  return out;
}

function CountUp({ to, run }: { to: number; run: boolean }) {
  const reduced = useReducedMotion();
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!run || reduced) return;
    const c = animate(0, to, { duration: 1.4, ease: [0.2, 0.8, 0.2, 1], onUpdate: (x) => setV(Math.round(x)) });
    return () => c.stop();
  }, [to, run, reduced]);
  return <>{fmt(reduced || !run ? to : v)}</>;
}

const CARD_MS = 5200;

export function Wrapped({ cards, onNext }: { cards: WrapCard[]; onNext: () => void }) {
  const { cue } = useAp();
  const reduced = useReducedMotion();
  const [at, setAt] = useState(0);
  const [held, setHeld] = useState(false);
  const [reached, setReached] = useState(cards.length <= 1);
  const [prog, setProg] = useState(0);
  const downAt = useRef(0);

  const atRef = useRef(0);
  const go = useCallback(
    (dir: 1 | -1) => {
      const a = atRef.current;
      const n = clamp(a + dir, 0, cards.length - 1);
      setProg(0);
      if (n === a) return;
      atRef.current = n;
      setAt(n);
      haptic(8);
      cue("swoosh-soft", { gain: 0.3 });
      if (n === cards.length - 1) {
        setReached(true);
        cue("chime-cascade", { gain: 0.5, at: 0.2 });
      }
    },
    [cards.length, cue],
  );

  // Auto-advance (paused while held, stopped on the last card, off for reduced motion).
  useEffect(() => {
    if (reduced || held || at >= cards.length - 1) return;
    const start = performance.now() - prog * CARD_MS;
    let raf = 0;
    const tick = (t: number) => {
      const p = (t - start) / CARD_MS;
      if (p >= 1) {
        go(1);
        return;
      }
      setProg(p);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [at, held, reduced, cards.length, go]);

  useNext(reached ? "Light the lanterns" : null, onNext, "lantern");
  const c = cards[at];
  return (
    <>
      <Head kicker="Our year in numbers" title={<>Us, <em>wrapped</em></>} sub="Tap to go on · hold to pause" />
      <div className="ap-fill">
        <div
          className={`ap-wrap is-${at % 4}`}
          onPointerDown={() => {
            downAt.current = performance.now();
            setHeld(true);
          }}
          onPointerUp={(e) => {
            setHeld(false);
            if (performance.now() - downAt.current > 350) return;
            const r = e.currentTarget.getBoundingClientRect();
            go(e.clientX - r.left < r.width * 0.3 ? -1 : 1);
          }}
          onPointerCancel={() => setHeld(false)}
          onPointerLeave={() => setHeld(false)}
          role="group"
          aria-roledescription="story"
          aria-label={`Card ${at + 1} of ${cards.length}`}
          data-ap-wrapped
        >
          <div className="ap-wrap-bars" aria-hidden>
            {cards.map((_, k) => (
              <span key={k}>
                <i style={{ transform: `scaleX(${k < at ? 1 : k === at ? (reduced || at === cards.length - 1 ? 1 : prog) : 0})` }} />
              </span>
            ))}
          </div>
          <span className="ap-wrap-orb is-a" aria-hidden />
          <span className="ap-wrap-orb is-b" aria-hidden />
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={c.id}
              className="ap-wrap-card"
              initial={reduced ? false : { opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduced ? undefined : { opacity: 0, y: -18, scale: 1.02, transition: { duration: 0.18 } }}
              transition={{ type: "spring", stiffness: 210, damping: 22 }}
              data-ap-wrap-card={c.id}
            >
              <span className="ap-wrap-emoji" aria-hidden>
                {c.emoji}
              </span>
              <p className="ap-wrap-kick">{c.kick}</p>
              {typeof c.big === "number" ? (
                <p className="ap-wrap-big">
                  <CountUp to={c.big} run />
                  {c.unit && <small>{c.unit}</small>}
                </p>
              ) : (
                <p className={`ap-wrap-big is-text${c.id === "top" ? " is-name" : ""}`}>{c.bigText}</p>
              )}
              {c.line && <p className="ap-wrap-line">{c.line}</p>}
            </motion.div>
          </AnimatePresence>
          <button type="button" className="ap-wrap-nav is-prev" onClick={(e) => { e.stopPropagation(); go(-1); }} onPointerUp={(e) => e.stopPropagation()} disabled={at === 0} aria-label="Previous card">
            ‹
          </button>
          <button type="button" className="ap-wrap-nav is-next" onClick={(e) => { e.stopPropagation(); go(1); }} onPointerUp={(e) => e.stopPropagation()} disabled={at === cards.length - 1} aria-label="Next card" data-ap-wrap-next>
            ›
          </button>
        </div>
      </div>
      <style>{WRAP_CSS}</style>
    </>
  );
}

const WRAP_CSS = `
.ap-wrap { position: relative; height: min(100cqh, 158cqw, 680px); aspect-ratio: 9 / 15; max-width: 100%; min-width: min(100%, 300px); border-radius: 28px; overflow: hidden; touch-action: manipulation; cursor: pointer; user-select: none; -webkit-user-select: none;
  box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--ap-foil) 60%, transparent), 0 30px 60px -30px var(--ap-deep); transition: background .6s ease; }
.ap-wrap.is-0 { background: linear-gradient(165deg, #FFFFFF 0%, var(--ap-blush) 45%, color-mix(in srgb, var(--vw-accent) 30%, var(--ap-blush)) 100%); }
.ap-wrap.is-1 { background: linear-gradient(165deg, var(--ap-sky1) 0%, var(--ap-sky2) 60%, color-mix(in srgb, var(--ap-rose) 40%, #FFFFFF) 100%); }
.ap-wrap.is-2 { background: linear-gradient(165deg, #FFFFFF 0%, color-mix(in srgb, var(--ap-foil) 35%, #FFFFFF) 60%, var(--ap-blush) 100%); }
.ap-wrap.is-3 { background: linear-gradient(165deg, var(--ap-sky3) 0%, var(--ap-blush) 55%, color-mix(in srgb, var(--vw-accent) 25%, #FFFFFF) 100%); }
.ap-wrap-bars { position: absolute; left: 14px; right: 14px; top: 12px; display: flex; gap: 4px; z-index: 3; }
.ap-wrap-bars span { flex: 1; height: 3.5px; border-radius: 99px; background: color-mix(in srgb, var(--vw-ink) 16%, transparent); overflow: hidden; }
.ap-wrap-bars i { display: block; height: 100%; background: var(--vw-accent-deep); transform-origin: 0 50%; }
.ap-wrap-orb { position: absolute; border-radius: 50%; filter: blur(2px); opacity: .55; }
.ap-wrap-orb.is-a { width: 60%; aspect-ratio: 1; right: -20%; top: 8%; background: radial-gradient(circle, #FFFFFF, transparent 70%); animation: ap-orb 9s ease-in-out infinite alternate; }
.ap-wrap-orb.is-b { width: 46%; aspect-ratio: 1; left: -16%; bottom: 6%; background: radial-gradient(circle, color-mix(in srgb, var(--ap-rose) 60%, transparent), transparent 70%); animation: ap-orb 11s ease-in-out infinite alternate-reverse; }
@keyframes ap-orb { from { transform: translate(0, 0) } to { transform: translate(-14%, 10%) } }
/* Side padding always clears the ‹ › buttons, so a big number or a long name never runs under them. */
.ap-wrap-card { position: absolute; inset: 0; display: grid; align-content: center; justify-items: center; gap: clamp(6px, 1.6cqh, 14px); padding: 18% max(9%, 56px) 12%; text-align: center; }
.ap-wrap-emoji { font-size: clamp(40px, 8cqh, 64px); line-height: 1; filter: drop-shadow(0 8px 10px rgba(0,0,0,.12)); }
.ap-wrap-kick { margin: 0; font: 700 clamp(11px, 1.8cqh, 14px) ${AP_SANS}; letter-spacing: .2em; text-transform: uppercase; color: var(--vw-accent-deep); }
.ap-wrap-big { margin: 0; display: grid; justify-items: center; font: 600 clamp(56px, 13cqh, 108px)/.95 ${AP_SERIF}; color: var(--vw-ink); letter-spacing: -.02em; overflow-wrap: anywhere; max-width: 100%; }
.ap-wrap-big small { font: italic 500 clamp(22px, 4.4cqh, 36px)/1.1 ${AP_SERIF}; color: var(--vw-accent-deep); letter-spacing: 0; }
.ap-wrap-big.is-text { font-size: clamp(34px, 8cqh, 68px); line-height: 1.02; text-wrap: balance; }
.ap-wrap-big.is-name { font: 400 clamp(40px, 11cqh, 96px)/1.05 ${AP_SCRIPT}; color: var(--vw-accent-deep); overflow-wrap: break-word; }
.ap-wrap-line { margin: 0; max-width: 28ch; font: 500 clamp(19px, 3.2cqh, 26px)/1.22 ${AP_HAND}; color: var(--vw-ink); overflow-wrap: anywhere; }
.ap-wrap-nav { position: absolute; top: 50%; translate: 0 -50%; z-index: 3; width: 44px; height: 44px; border-radius: 50%; border: 0; cursor: pointer; font: 600 26px/1 ${AP_SERIF}; color: var(--vw-accent-deep); background: color-mix(in srgb, #FFFFFF 70%, transparent); box-shadow: 0 6px 14px -8px var(--ap-deep); touch-action: manipulation; }
.ap-wrap-nav.is-prev { left: 8px; }
.ap-wrap-nav.is-next { right: 8px; }
.ap-wrap-nav:disabled { opacity: 0; pointer-events: none; }
.ap-wrap-nav:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) { .ap-wrap-orb { animation: none; } }
`;

// ─── 9 · Lanterns (promises for the next year) ──────────────────────────────

const SKY_SPOTS: readonly [number, number][] = [
  [22, 18], [70, 12], [46, 30], [84, 34], [14, 40],
];

export function Lanterns({ promises, onNext }: { promises: string[]; onNext: () => void }) {
  const { cue } = useAp();
  const reduced = useReducedMotion();
  const [up, setUp] = useState<number[]>([]);
  const [drag, setDrag] = useState<{ k: number; dy: number } | null>(null);
  const all = up.length >= promises.length;
  const doneOnce = useRef(false);

  const upRef = useRef<number[]>([]);
  const release = useCallback(
    (k: number) => {
      if (upRef.current.includes(k)) return;
      const n = [...upRef.current, k];
      upRef.current = n;
      setUp(n);
      haptic([10, 30, 10]);
      cue("flame-whoosh", { gain: 0.35 });
      cue("chime", { gain: 0.4, at: 0.3, detune: n.length * 120 });
      if (n.length >= promises.length && !doneOnce.current) {
        doneOnce.current = true;
        window.setTimeout(() => {
          cue("chime-cascade", { gain: 0.6 });
          if (!reduced) burst({ kind: "sparkles", origin: { x: 0.5, y: 0.25 }, count: 30 });
        }, 700);
      }
    },
    [cue, promises.length, reduced],
  );

  const onDown = (k: number) => (e: React.PointerEvent<HTMLButtonElement>) => {
    if (up.includes(k)) return;
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    const sy = e.clientY;
    const t0 = performance.now();
    let dy = 0;
    const move = (ev: PointerEvent) => {
      dy = Math.min(0, ev.clientY - sy);
      setDrag({ k, dy });
    };
    const up2 = () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up2);
      el.removeEventListener("pointercancel", up2);
      setDrag(null);
      const dt = performance.now() - t0;
      // A flick up (or a plain tap) lets it go.
      if (dy < -36 || (dy > -6 && dt < 400)) release(k);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up2);
    el.addEventListener("pointercancel", up2);
  };

  useNext(all ? "See next year" : null, onNext, "sun");
  const last = up.length ? up[up.length - 1] : null;
  return (
    <>
      <Head kicker="For the next year" title={all ? <>Every promise, <em>in the sky</em></> : <>Light up <em>my promises</em></>} sub={all ? undefined : "Flick each lantern up into the sky."} />
      <div className="ap-fill">
        <div className={`ap-lake${all ? " is-all" : ""}`} data-ap-lake>
          <span className="ap-lake-moon" aria-hidden />
          <span className="ap-lake-water" aria-hidden />
          <span className="ap-lake-hills" aria-hidden />
          {promises.map((p, k) => {
            const flying = up.includes(k);
            const order = up.indexOf(k);
            const spot = SKY_SPOTS[(order >= 0 ? order : k) % SKY_SPOTS.length];
            const homeX = ((k + 1) / (promises.length + 1)) * 100;
            const dy = drag?.k === k ? drag.dy : 0;
            return (
              <motion.button
                key={k}
                type="button"
                className={`ap-lantern${flying ? " is-up" : ""}`}
                onPointerDown={onDown(k)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    release(k);
                  }
                }}
                initial={false}
                animate={flying ? { left: `${spot[0]}%`, top: `${spot[1]}%`, scale: 0.72 } : { left: `${homeX}%`, top: "78%", scale: 1 }}
                transition={flying ? { duration: reduced ? 0 : 2.4, ease: [0.3, 0.1, 0.3, 1] } : { type: "spring", stiffness: 200, damping: 18 }}
                style={{ y: dy }}
                aria-label={flying ? `Promise ${k + 1}: ${p}` : `Release lantern ${k + 1}`}
                disabled={flying}
                data-ap-lantern={k}
              >
                <span className="ap-lantern-body">
                  <span className="ap-lantern-flame" />
                  <b>{k + 1}</b>
                </span>
              </motion.button>
            );
          })}
          <AnimatePresence>
            {all && (
              <motion.div className="ap-promises" initial={reduced ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduced ? 0 : 1.2, duration: 0.6 }} data-ap-promises>
                <ApScroll label="My promises">
                  <ol>
                    {promises.map((p, k) => (
                      <li key={k}>{p}</li>
                    ))}
                  </ol>
                </ApScroll>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="ap-foot ap-lan-foot">
        {!all && last !== null ? (
          <motion.p key={last} className="ap-lan-cap" initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} data-ap-promise>
            <span>I promise…</span> {promises[last]}
          </motion.p>
        ) : !all ? (
          <Hint hand="☝️">Flick a lantern upward</Hint>
        ) : (
          <p className="ap-count-chip">{promises.length} promises, all yours</p>
        )}
      </div>
      <style>{LAKE_CSS}</style>
    </>
  );
}

const LAKE_CSS = `
.ap-lake { position: relative; width: min(100cqw, 150cqh, 860px); height: min(100cqh, 110cqw); border-radius: 26px; overflow: hidden;
  background: linear-gradient(180deg, var(--ap-sky1) 0%, var(--ap-sky2) 45%, var(--ap-sky3) 62%, color-mix(in srgb, var(--ap-sky2) 60%, #FFFFFF) 100%);
  box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--ap-foil) 50%, transparent), 0 30px 60px -30px var(--ap-deep); }
.ap-lake-moon { position: absolute; right: 14%; top: 10%; width: 13%; aspect-ratio: 1; border-radius: 50%; background: radial-gradient(circle at 40% 40%, #FFFFFF, #FFF5E6); box-shadow: 0 0 40px 14px rgba(255,255,255,.7); }
.ap-lake-hills { position: absolute; left: 0; right: 0; top: 56%; height: 12%; background:
  radial-gradient(60% 120% at 20% 100%, color-mix(in srgb, var(--ap-foil) 35%, var(--ap-sky3)) 60%, transparent 61%),
  radial-gradient(50% 140% at 75% 100%, color-mix(in srgb, var(--ap-rose) 30%, var(--ap-sky3)) 60%, transparent 61%); opacity: .8; }
.ap-lake-water { position: absolute; left: 0; right: 0; bottom: 0; top: 66%; background: linear-gradient(180deg, color-mix(in srgb, var(--ap-sky2) 70%, #FFFFFF), color-mix(in srgb, var(--ap-sky1) 80%, #FFFFFF));
  -webkit-mask-image: repeating-linear-gradient(180deg, #000 0 6px, rgba(0,0,0,.75) 6px 8px); mask-image: repeating-linear-gradient(180deg, #000 0 6px, rgba(0,0,0,.75) 6px 8px); }
.ap-lantern { position: absolute; translate: -50% -50%; width: clamp(56px, 13cqmin, 92px); aspect-ratio: .8; padding: 0; border: 0; background: none; cursor: grab; touch-action: none; z-index: 2; }
.ap-lantern:disabled { cursor: default; }
.ap-lantern-body { position: absolute; inset: 0; border-radius: 40% 40% 30% 30% / 30% 30% 20% 20%; display: grid; place-items: center;
  background: radial-gradient(70% 60% at 50% 70%, #FFF6D8, #FFC98A 60%, color-mix(in srgb, var(--ap-rose) 80%, #F49B6E));
  box-shadow: inset 0 -6px 0 rgba(0,0,0,.08), 0 0 22px 6px rgba(255,210,140,.55); animation: ap-sway 3.2s ease-in-out infinite alternate; }
.ap-lantern-body::before, .ap-lantern-body::after { content: ""; position: absolute; left: 10%; right: 10%; height: 6%; border-radius: 3px; background: color-mix(in srgb, var(--ap-deep) 40%, #C9864E); }
.ap-lantern-body::before { top: 2%; }
.ap-lantern-body::after { bottom: 4%; }
.ap-lantern-body b { position: relative; font: 600 clamp(16px, 4cqmin, 24px) ${AP_SERIF}; color: color-mix(in srgb, var(--ap-deep) 70%, #6B3A1A); }
.ap-lantern-flame { position: absolute; left: 50%; bottom: 12%; width: 16%; height: 18%; translate: -50% 0; border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%; background: radial-gradient(circle at 50% 70%, #FFFFFF, #FFD27A); animation: ap-flicker .3s ease-in-out infinite alternate; }
.ap-lantern:not(.is-up) .ap-lantern-body { box-shadow: inset 0 -6px 0 rgba(0,0,0,.08), 0 0 10px 2px rgba(255,210,140,.35); filter: saturate(.8); }
.ap-lantern:not(.is-up)::after { content: ""; position: absolute; left: 50%; top: -24px; width: 3px; height: 16px; translate: -50% 0; border-radius: 2px; background: linear-gradient(transparent, var(--vw-accent)); animation: ap-up-hint 1.4s ease-in-out infinite; }
@keyframes ap-up-hint { 0%, 100% { opacity: 0; transform: translateY(6px) } 50% { opacity: 1; transform: translateY(-4px) } }
.ap-lantern:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 4px; border-radius: 12px; }
@keyframes ap-sway { from { transform: rotate(-3deg) } to { transform: rotate(3deg) } }
@keyframes ap-flicker { from { transform: scale(1) } to { transform: scale(.85, 1.1) } }
.ap-promises { position: absolute; left: 50%; bottom: 4%; translate: -50% 0; width: min(90%, 420px); max-height: 48%; display: grid; z-index: 3; box-sizing: border-box; padding: 12px 6px 12px 16px; border-radius: 18px;
  background: color-mix(in srgb, #FFFFFF 86%, transparent); box-shadow: 0 18px 30px -18px var(--ap-deep), inset 0 0 0 1px color-mix(in srgb, var(--ap-foil) 50%, transparent); text-align: left; }
.ap-promises ol { margin: 0; padding: 0 0 0 22px; display: grid; gap: 6px; }
.ap-promises li { font: 500 clamp(17px, 2.5dvh, 21px)/1.22 ${AP_HAND}; color: var(--vw-ink); overflow-wrap: anywhere; }
.ap-promises li::marker { font: 600 15px ${AP_SERIF}; color: var(--vw-accent-deep); }
.ap-lan-foot { min-height: 60px; }
.ap-lan-cap { margin: 0; max-width: 440px; font: 500 clamp(20px, 3dvh, 25px)/1.2 ${AP_HAND}; color: var(--vw-ink); overflow-wrap: anywhere; }
.ap-lan-cap span { display: block; font: italic 600 15px ${AP_SERIF}; color: var(--vw-accent-deep); }
@media (prefers-reduced-motion: reduce) { .ap-lantern-body, .ap-lantern-flame, .ap-lantern::after { animation: none !important; } }
`;

// ─── 10 · Next year's horizon ───────────────────────────────────────────────

const PLAN_SPOTS: readonly [number, number][] = [
  [27, 57], [73, 50], [29, 80], [71, 76],
];

export function Horizon({ plans, sender, onNext }: { plans: string[]; sender: string; onNext: () => void }) {
  const { cue } = useAp();
  const reduced = useReducedMotion();
  const [r, setR] = useState(0);
  const [risen, setRisen] = useState(false);
  const shown = useRef(0);
  const sceneRef = useRef<HTMLDivElement | null>(null);

  const setRise = useCallback(
    (v: number) => {
      const n = clamp(v, 0, 1);
      setR((old) => Math.max(old, n));
      const k = Math.floor(n * (plans.length + 0.6));
      if (k > shown.current) {
        shown.current = k;
        haptic(10);
        cue("sparkle", { gain: 0.35, detune: k * 100 });
      }
      if (n >= 0.98 && !risen) {
        setRisen(true);
        haptic([20, 40, 30]);
        cue("chime-cascade", { gain: 0.65 });
        if (!reduced) burst({ kind: "sparkles", origin: { x: 0.5, y: 0.3 }, count: 28 });
      }
    },
    [plans.length, cue, risen, reduced],
  );

  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (risen) return;
    const el = sceneRef.current;
    if (!el) return;
    const tgt = e.currentTarget;
    tgt.setPointerCapture(e.pointerId);
    const rect = el.getBoundingClientRect();
    const sy = e.clientY;
    const base = r;
    const move = (ev: PointerEvent) => setRise(base + (sy - ev.clientY) / (rect.height * 0.55));
    const up = (ev: PointerEvent) => {
      tgt.removeEventListener("pointermove", move);
      tgt.removeEventListener("pointerup", up);
      tgt.removeEventListener("pointercancel", up);
      if (Math.abs(ev.clientY - sy) < 6) setRise(base + 0.22);
    };
    tgt.addEventListener("pointermove", move);
    tgt.addEventListener("pointerup", up);
    tgt.addEventListener("pointercancel", up);
  };

  useNext(risen ? "One last question" : null, onNext, "heart");
  const visible = Math.floor(r * (plans.length + 0.6));
  const items = useMemo(() => plans.slice(0, 4), [plans]);
  return (
    <>
      <Head kicker="Where we'll be next year" title={risen ? <>Next year, <em>together</em></> : <>Raise the <em>sun</em></>} sub={risen ? `Plans by ${sender}, pending your approval 🤍` : "Drag the sun up and the mist clears."} />
      <div className="ap-fill">
        <div
          ref={sceneRef}
          className={`ap-hz${risen ? " is-risen" : ""}`}
          style={{ ["--r" as string]: r.toFixed(3) }}
          onPointerDown={onDown}
          role="slider"
          tabIndex={0}
          aria-label="Raise the sun over the horizon"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(r * 100)}
          onKeyDown={(e) => {
            if (["ArrowUp", "ArrowRight", " ", "Enter"].includes(e.key)) {
              e.preventDefault();
              setRise(r + 0.2);
            }
          }}
          data-ap-horizon
        >
          <span className="ap-hz-sky" aria-hidden />
          <span className="ap-hz-sun" aria-hidden>
            <span className="ap-hz-rays" />
          </span>
          <svg className="ap-hz-hills" viewBox="0 0 400 200" preserveAspectRatio="none" aria-hidden>
            <path d="M0 120 C60 80 120 90 180 110 S300 70 400 100 V200 H0 Z" className="is-far" />
            <path d="M0 150 C80 110 150 130 220 145 S330 120 400 135 V200 H0 Z" className="is-mid" />
            <path d="M0 175 C90 150 190 170 260 168 S360 160 400 166 V200 H0 Z" className="is-near" />
          </svg>
          {items.map((p, k) => (
            <motion.span
              key={k}
              className="ap-plan"
              style={{ left: `${PLAN_SPOTS[k][0]}%`, top: `${PLAN_SPOTS[k][1]}%` }}
              initial={false}
              animate={k < visible ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 14, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 200, damping: 18 }}
              data-ap-plan={k}
            >
              <i aria-hidden>{["⛰️", "🌱", "💃", "🥞"][k]}</i>
              {p}
            </motion.span>
          ))}
          <span className="ap-hz-mist is-a" aria-hidden />
          <span className="ap-hz-mist is-b" aria-hidden />
          {!risen && <span className="ap-hz-grip" aria-hidden>↑</span>}
        </div>
      </div>
      <div className="ap-foot">{!risen && <Hint hand="☝️">Drag up anywhere on the horizon</Hint>}</div>
      <style>{HZ_CSS}</style>
    </>
  );
}

const HZ_CSS = `
.ap-hz { position: relative; width: min(100cqw, 150cqh, 880px); height: min(100cqh, 120cqw); border-radius: 26px; overflow: hidden; touch-action: none; cursor: ns-resize; user-select: none; -webkit-user-select: none;
  box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--ap-foil) 50%, transparent), 0 30px 60px -30px var(--ap-deep); }
.ap-hz:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 4px; }
.ap-hz-sky { position: absolute; inset: 0; background: linear-gradient(180deg, color-mix(in srgb, var(--ap-sky1) calc(40% + var(--r) * 60%), #E9E6EE) 0%, color-mix(in srgb, var(--ap-sky2) calc(40% + var(--r) * 60%), #EEECEF) 55%, var(--ap-sky3) 100%); }
.ap-hz-sun { position: absolute; left: 50%; top: calc(64% - var(--r) * 46%); width: 22%; aspect-ratio: 1; translate: -50% -50%; border-radius: 50%;
  background: radial-gradient(circle, #FFFDF2 0%, #FFE8A8 55%, color-mix(in srgb, var(--ap-rose) 70%, #FFC88A) 100%); box-shadow: 0 0 calc(30px + var(--r) * 60px) calc(10px + var(--r) * 30px) rgba(255,224,160,.65); }
.ap-hz-rays { position: absolute; inset: -60%; border-radius: 50%; background: repeating-conic-gradient(from 0deg, rgba(255,240,200,.38) 0 6deg, transparent 6deg 18deg); opacity: var(--r); animation: ap-rays 30s linear infinite; -webkit-mask-image: radial-gradient(circle, #000 30%, transparent 70%); mask-image: radial-gradient(circle, #000 30%, transparent 70%); }
@keyframes ap-rays { to { transform: rotate(360deg) } }
.ap-hz-hills { position: absolute; left: 0; right: 0; bottom: 0; width: 100%; height: 50%; }
.ap-hz-hills .is-far { fill: color-mix(in srgb, var(--ap-foil) 30%, var(--ap-sky3)); }
.ap-hz-hills .is-mid { fill: color-mix(in srgb, var(--vw-accent) 22%, #FFFFFF); }
.ap-hz-hills .is-near { fill: color-mix(in srgb, var(--vw-accent) 34%, #FFFFFF); }
.ap-hz-mist { position: absolute; left: -10%; right: -10%; height: 40%; pointer-events: none; opacity: calc(.82 - var(--r) * .9); background: linear-gradient(180deg, transparent, rgba(255,255,255,.95) 40%, rgba(255,255,255,.9) 70%, transparent); }
.ap-hz-mist.is-a { top: 40%; animation: ap-mist 12s ease-in-out infinite alternate; }
.ap-hz-mist.is-b { top: 62%; animation: ap-mist 16s ease-in-out infinite alternate-reverse; }
@keyframes ap-mist { from { transform: translateX(-4%) } to { transform: translateX(4%) } }
.ap-plan { position: absolute; translate: -50% -50%; width: max-content; max-width: 50%; box-sizing: border-box; display: inline-flex; align-items: center; gap: 6px; padding: 7px 12px 8px; border-radius: 14px; z-index: 2;
  font: 500 clamp(15px, 3.8cqmin, 22px)/1.12 ${AP_HAND}; color: var(--vw-ink); background: color-mix(in srgb, #FFFFFF 88%, transparent); box-shadow: 0 10px 20px -12px var(--ap-deep), inset 0 0 0 1px color-mix(in srgb, var(--ap-foil) 50%, transparent); overflow-wrap: anywhere; text-align: left; }
.ap-plan i { font-style: normal; font-size: 1.1em; }
.ap-hz-grip { position: absolute; left: 50%; bottom: 7%; translate: -50% 0; width: 46px; height: 46px; border-radius: 50%; display: grid; place-items: center; font: 700 22px ${AP_SANS}; color: #FFFFFF; background: var(--vw-accent); box-shadow: 0 8px 16px -8px var(--ap-deep); animation: ap-grip 1.4s ease-in-out infinite; z-index: 3; }
@keyframes ap-grip { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-10px) } }
@media (prefers-reduced-motion: reduce) { .ap-hz-rays, .ap-hz-mist, .ap-hz-grip { animation: none; } }
`;

