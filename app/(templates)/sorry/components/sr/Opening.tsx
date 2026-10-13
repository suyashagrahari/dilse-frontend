"use client";

// Scenes 1–4: the sealed envelope, "how upset are you?", what I did, the guilt
// bubbles. Each one is a single screen; its Next pill appears only once her
// moment is done (the seal broken, the slider moved, the card scratched, every
// bubble popped).

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { ScratchCanvas, burst, haptic, useReducedMotion } from "../../../_valentine/kit";
import { SORRY_MOODS } from "../../../_valentine/days/sorry";
import { FONTS } from "../../../_valentine/theme";
import { HeartSeal, MochiBear } from "./art";
import { SR_DISPLAY, SR_HAND } from "./fonts";
import { useNext, useSr } from "./stage";
import { Head } from "./ui";

const TAPS = 3;

// ─── 1 · The sealed envelope ────────────────────────────────────────────────

export function Gate({ recipient, sender, openingLine, sticker, onEnter }: { recipient: string; sender: string; openingLine: string; sticker: ReactNode; onEnter: () => void }) {
  const { cue } = useSr();
  const reduced = useReducedMotion();
  const [taps, setTaps] = useState(0);
  const [press, setPress] = useState(0);
  const open = taps >= TAPS;

  const tap = () => {
    if (open) return;
    const n = taps + 1;
    setTaps(n);
    setPress((p) => p + 1);
    haptic(n >= TAPS ? 22 : 10);
    if (n < TAPS) {
      cue("plush-squeak", { gain: 0.7 });
      return;
    }
    cue("wax-crack", { gain: 0.9 });
    cue("chime-cascade", { gain: 0.55, at: 0.35 });
    if (!reduced) window.setTimeout(() => burst({ kind: "hearts", origin: { x: 0.5, y: 0.45 }, count: 26, emojis: ["💗", "🩷", "💕", "✨"] }), 420);
  };

  useNext(open ? "Let me explain" : null, onEnter, "sorry");

  return (
    <>
      <Head kicker={`Psst, ${recipient}…`} title={<>Someone is <em className="sr-em">very</em> sorry</>} sub={openingLine || "please don't stay mad, open this first 🥺"} />
      <div className="sr-fill">
        <div className={`sr-env${open ? " is-open" : ""}`} data-sr-envelope={open ? "open" : "sealed"}>
          <div className="sr-env-peek">{sticker}</div>
          <div className="sr-env-back" />
          <div className="sr-env-card">
            <p className="sr-env-card-k">from {sender}</p>
            <p className="sr-env-card-t">I&apos;m sorry 🥺</p>
            <p className="sr-env-card-s">(please read till the end)</p>
          </div>
          <div className="sr-env-front">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
              <path d="M0 100 L46 58 Q50 55 54 58 L100 100" fill="none" stroke="var(--vw-gold)" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
              <path d="M0 0 L42 52 M100 0 L58 52" stroke="var(--vw-gold)" strokeWidth="1" strokeOpacity=".6" vectorEffect="non-scaling-stroke" />
            </svg>
            <span className="sr-env-to">For {recipient} 💌</span>
          </div>
          <div className="sr-env-flap" aria-hidden>
            <span className="sr-env-flap-out" />
            <span className="sr-env-flap-in" />
          </div>
          <button
            type="button"
            className={`sr-env-seal${press ? (press % 2 ? " is-press-a" : " is-press-b") : ""}`}
            onClick={tap}
            disabled={open}
            aria-label={open ? "The envelope is open" : `Tap the heart seal to open it (${taps} of ${TAPS})`}
          >
            <HeartSeal size="100%" cracks={taps} />
          </button>
        </div>
      </div>
      <p className="sr-hint" aria-live="polite">
        {open ? "It's open 💗" : taps === 0 ? "Tap the heart seal 💗" : taps === 1 ? "Again… 🥺" : "One more! 💗"}
      </p>
      <style>{GATE_CSS}</style>
    </>
  );
}

const GATE_CSS = `
.sr-em { font-style: normal; color: var(--vw-accent); }
.sr-hint { flex: none; margin: 0; min-height: 22px; font: 700 clamp(15px, 2.3dvh, 18px) ${SR_DISPLAY}; color: var(--vw-accent-deep); }
.sr-env { position: relative; width: min(84cqw, 100cqh, calc(340px * var(--vw-s, 1))); aspect-ratio: 1.42; margin-top: min(20cqw, 24cqh); }
.sr-env-back, .sr-env-front { position: absolute; inset: 0; border-radius: 14px; }
.sr-env-back { background: linear-gradient(180deg, var(--vw-gold), color-mix(in srgb, var(--vw-gold) 70%, var(--sr-deep))); box-shadow: 0 30px 50px -24px color-mix(in srgb, var(--sr-deep) 80%, transparent); }
.sr-env-card { position: absolute; left: 8%; right: 8%; top: 7%; height: 86%; z-index: 1; border-radius: 10px; box-sizing: border-box; padding: 10% 6% 0;
  background: radial-gradient(120% 90% at 50% 0%, #FFFFFF, var(--vw-paper)); box-shadow: inset 0 0 0 2px var(--vw-edge), 0 8px 20px -10px color-mix(in srgb, var(--sr-deep) 60%, transparent);
  display: grid; align-content: start; justify-items: center; gap: 2px; text-align: center; transition: transform 1s cubic-bezier(.2,.85,.25,1.08) .9s; }
.sr-env.is-open .sr-env-card { transform: translateY(-74%); }
.sr-env:not(.is-open) .sr-env-card > * { visibility: hidden; }
.sr-env-card-k { margin: 0; font: 700 11px ${FONTS.ui}; letter-spacing: .18em; text-transform: uppercase; color: var(--vw-accent-deep); }
.sr-env-card-t { margin: 0; font: 800 clamp(24px, 9cqw, 32px)/1.1 ${SR_DISPLAY}; color: var(--vw-ink); }
.sr-env-card-s { margin: 0; font: 400 clamp(14px, 4.6cqw, 17px) ${SR_HAND}; color: var(--vw-ink-soft); }
/* The front pocket: its mouth is the straight top edge; the folded flaps are drawn as stitched seams. */
.sr-env-front { z-index: 2; background: radial-gradient(130% 120% at 50% 100%, var(--vw-paper), var(--sr-blush)); box-shadow: inset 0 0 0 2px var(--vw-edge); overflow: hidden; }
.sr-env-front svg { position: absolute; inset: 0; width: 100%; height: 100%; }
.sr-env-front::before { content: ""; position: absolute; left: 0; right: 0; top: 0; height: 3px; background: var(--vw-gold); }
.sr-env-to { position: absolute; left: 0; right: 0; bottom: 9%; font: 400 clamp(17px, 6cqw, 22px) ${SR_HAND}; color: var(--vw-ink); }
/* The flap: an outside face and the lining. The lining is cut pre-mirrored (base at the bottom): its own
   180° turn plus the flap's turn about the top edge land it ON the hinge, pointing up. */
.sr-env-flap { position: absolute; inset: 0; z-index: 4; transform-origin: 50% 0; transform-style: preserve-3d; pointer-events: none;
  transform: perspective(900px) rotateX(0deg); transition: transform .9s cubic-bezier(.3,.6,.25,1) .25s, z-index 0s .6s; }
.sr-env-flap > span { position: absolute; inset: 0; backface-visibility: hidden; -webkit-backface-visibility: hidden; }
.sr-env-flap-out { border-radius: 14px 14px 0 0; clip-path: polygon(0 0, 100% 0, 50% 68%);
  background: linear-gradient(180deg, color-mix(in srgb, var(--vw-gold) 55%, #FFFFFF), var(--vw-gold)); }
.sr-env-flap-out::after { content: ""; position: absolute; inset: 0; clip-path: polygon(0 0, 100% 0, 50% 68%, 50% 62%, 92% 3%, 8% 3%, 50% 62%, 50% 68%); background: #FFFFFF; opacity: .55; }
.sr-env-flap > .sr-env-flap-in { transform: rotateX(180deg); border-radius: 0 0 14px 14px; clip-path: polygon(0 100%, 100% 100%, 50% 32%);
  background: linear-gradient(0deg, color-mix(in srgb, var(--sr-deep) 30%, transparent), transparent 24%),
    radial-gradient(circle, var(--vw-paper) 0 2.2px, transparent 2.8px) 0 0 / 14px 14px, var(--vw-accent); }
.sr-env.is-open .sr-env-flap { transform: perspective(900px) rotateX(180deg) scaleY(.92); z-index: 0; }
/* The heart seal on the flap's tip — the button. */
.sr-env-seal { position: absolute; z-index: 5; left: 50%; top: 62%; width: clamp(70px, 24cqw, 96px); aspect-ratio: 1; transform: translate(-50%, -50%); border: 0; padding: 0; background: none; cursor: pointer;
  touch-action: manipulation; -webkit-tap-highlight-color: transparent; filter: drop-shadow(0 6px 8px color-mix(in srgb, var(--sr-deep) 55%, transparent)); transition: opacity .5s ease .1s, transform .5s ease; }
.sr-env-seal:not(:disabled) { animation: sr-seal 1.6s ease-in-out infinite alternate; }
@keyframes sr-seal { from { transform: translate(-50%, -50%) scale(1) } to { transform: translate(-50%, -50%) scale(1.08) } }
.sr-env-seal.is-press-a:not(:disabled) { animation: sr-press-a .32s cubic-bezier(.3,1.6,.5,1), sr-seal 1.6s ease-in-out .32s infinite alternate; }
.sr-env-seal.is-press-b:not(:disabled) { animation: sr-press-b .32s cubic-bezier(.3,1.6,.5,1), sr-seal 1.6s ease-in-out .32s infinite alternate; }
@keyframes sr-press-a { 0% { transform: translate(-50%, -50%) scale(.82) rotate(-8deg) } 100% { transform: translate(-50%, -50%) scale(1) } }
@keyframes sr-press-b { 0% { transform: translate(-50%, -50%) scale(.82) rotate(8deg) } 100% { transform: translate(-50%, -50%) scale(1) } }
.sr-env-seal:disabled { cursor: default; opacity: 0; transform: translate(-50%, 40%) scale(.6) rotate(20deg); }
.sr-env-seal:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 4px; border-radius: 50%; }
.sr-env-peek { position: absolute; right: -2%; top: -36%; z-index: 0; transform: rotate(8deg); transition: transform .8s cubic-bezier(.3,1.5,.5,1) 1.1s; }
.sr-env.is-open .sr-env-peek { transform: translate(10%, -16%) rotate(14deg) scale(1.08); }
@media (min-width: 640px) { .sr-env.is-open .sr-env-card { transform: translateY(-62%); } }
@media (prefers-reduced-motion: reduce) { .sr-env *, .sr-env { transition: none !important; animation: none !important; } }
`;

// ─── 2 · How upset are you? ─────────────────────────────────────────────────

export function Mood({ lines, sender, onNext }: { lines: readonly string[]; sender: string; onNext: () => void }) {
  const { cue } = useSr();
  const [level, setLevel] = useState(2);
  const [moved, setMoved] = useState(false);
  const m = SORRY_MOODS[level];
  const set = (v: number) => {
    const n = Math.max(0, Math.min(SORRY_MOODS.length - 1, v));
    if (n !== level) {
      haptic(n >= 3 ? 14 : 8);
      cue(n >= 3 ? "plush-squeak" : "tick", { gain: n >= 3 ? 0.6 : 0.5, detune: (n - 2) * 120 });
    }
    setLevel(n);
    setMoved(true);
  };
  useNext(moved ? (level >= 3 ? "That's fair" : "Phew, okay") : null, onNext, "sorry");

  return (
    <>
      <Head kicker="Be honest" title="How upset are you right now?" sub="Slide it. The bear can take it." />
      <div className="sr-fill">
        <div className="sr-mood" data-sr-mood={m.face}>
          <div className="sr-mood-bear" style={{ ["--heat" as string]: String(level / 4) }}>
            <MochiBear face={m.face} size="100%" />
          </div>
          <motion.div key={level} className="sr-mood-say" initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 22 }}>
            <span className="sr-mood-who">{sender}:</span> {lines[level]}
          </motion.div>
        </div>
      </div>
      <div className="sr-mood-ctl">
        <p className="sr-mood-label" aria-live="polite">
          {m.emoji} {m.label}
        </p>
        <input
          type="range"
          min={0}
          max={SORRY_MOODS.length - 1}
          step={1}
          value={level}
          aria-label="How upset are you"
          aria-valuetext={m.label}
          className="sr-range"
          style={{ ["--p" as string]: `${(level / (SORRY_MOODS.length - 1)) * 100}%` }}
          onChange={(e) => set(Number(e.target.value))}
        />
        <div className="sr-range-ends" aria-hidden>
          {SORRY_MOODS.map((x, k) => (
            <button key={x.face} type="button" tabIndex={-1} className={k === level ? "is-on" : undefined} onClick={() => set(k)}>
              {x.emoji}
            </button>
          ))}
        </div>
      </div>
      <style>{MOOD_CSS}</style>
    </>
  );
}

const MOOD_CSS = `
.sr-mood { display: grid; justify-items: center; gap: clamp(8px, 2dvh, 16px); width: 100%; }
.sr-mood-bear { width: min(46cqh, 62cqw, calc(220px * var(--vw-s, 1))); filter: drop-shadow(0 14px 20px color-mix(in srgb, var(--sr-deep) 30%, transparent)); }
.sr-mood-bear svg { width: 100%; height: auto; }
.sr-mood-say { position: relative; max-width: min(360px, 92%); box-sizing: border-box; padding: 12px 16px; border-radius: 20px; background: var(--vw-paper); color: var(--vw-ink);
  font: 400 clamp(17px, 2.6dvh, 21px)/1.3 ${SR_HAND}; box-shadow: 0 0 0 2px var(--vw-edge), 0 10px 22px -12px color-mix(in srgb, var(--sr-deep) 50%, transparent); overflow-wrap: anywhere; }
.sr-mood-say::before { content: ""; position: absolute; left: 50%; top: -9px; width: 16px; height: 16px; margin-left: -8px; background: var(--vw-paper); transform: rotate(45deg); box-shadow: -2px -2px 0 0 var(--vw-edge); }
.sr-mood-who { font: 700 13px ${FONTS.ui}; color: var(--vw-accent-deep); }
.sr-mood-ctl { flex: none; width: 100%; max-width: 380px; display: grid; gap: 6px; }
.sr-mood-label { margin: 0; font: 800 clamp(18px, 2.7dvh, 22px) ${SR_DISPLAY}; color: var(--vw-ink); }
.sr-range { -webkit-appearance: none; appearance: none; width: 100%; height: 44px; margin: 0; background: transparent; cursor: pointer; touch-action: pan-y; }
.sr-range::-webkit-slider-runnable-track { height: 14px; border-radius: 99px; background: linear-gradient(90deg, #9ADBB5, #FFE07A 35%, #FFB07A 62%, #FF6F7F 100%); box-shadow: inset 0 0 0 2px rgba(255,255,255,.7), 0 4px 10px -6px rgba(0,0,0,.25); }
.sr-range::-moz-range-track { height: 14px; border-radius: 99px; background: linear-gradient(90deg, #9ADBB5, #FFE07A 35%, #FFB07A 62%, #FF6F7F 100%); }
.sr-range::-webkit-slider-thumb { -webkit-appearance: none; width: 34px; height: 34px; margin-top: -10px; border-radius: 50%; background: #FFFFFF; border: 3px solid var(--vw-accent); box-shadow: 0 4px 10px -2px color-mix(in srgb, var(--sr-deep) 60%, transparent); }
.sr-range::-moz-range-thumb { width: 30px; height: 30px; border-radius: 50%; background: #FFFFFF; border: 3px solid var(--vw-accent); }
.sr-range:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 2px; border-radius: 99px; }
.sr-range-ends { display: flex; justify-content: space-between; padding: 0 2px; }
.sr-range-ends button { width: 36px; height: 30px; border: 0; background: none; font-size: 20px; line-height: 1; cursor: pointer; opacity: .55; transition: transform .2s ease, opacity .2s ease; }
.sr-range-ends button.is-on { opacity: 1; transform: scale(1.3); }
`;

// ─── 3 · What I did (scratch it off) ────────────────────────────────────────

export function Confession({ confession, sender, foil, onNext }: { confession: string; sender: string; foil: readonly [string, string]; onNext: () => void }) {
  const { cue } = useSr();
  const [shown, setShown] = useState(false);
  const [ticks, setTicks] = useState(0);
  useNext(shown ? "I hear you" : null, onNext, "sorry");
  return (
    <>
      <Head kicker="No excuses" title="What I did" sub={shown ? "That was on me. Completely." : "Scratch the card to see it 🥺"} />
      <div className="sr-fill">
        <div className="sr-conf sr-zoom">
          <ScratchCanvas
            height={200}
            cover={foil}
            label="scratch me 🥺"
            labelColor="#FFFFFF"
            radius={22}
            threshold={0.5}
            onProgress={(p) => {
              const t = Math.floor(p * 10);
              if (t > ticks) {
                setTicks(t);
                cue("paper-rustle", { gain: 0.25 });
              }
            }}
            onReveal={() => {
              setShown(true);
              haptic(16);
              cue("chime", { gain: 0.5 });
            }}
            style={{ width: "100%" }}
          >
            <div className="sr-conf-card">
              <p className="sr-conf-t">“{confession}”</p>
              <p className="sr-conf-s">— {sender}, owning it</p>
            </div>
          </ScratchCanvas>
        </div>
      </div>
      <style>{CONF_CSS}</style>
    </>
  );
}

const CONF_CSS = `
.sr-conf { width: min(100%, 380px); }
.sr-conf-card { position: relative; box-sizing: border-box; height: 200px; padding: 18px 20px; border-radius: 22px; display: grid; align-content: center; gap: 10px;
  background: radial-gradient(120% 80% at 50% 0%, #FFFFFF, var(--vw-paper)); box-shadow: inset 0 0 0 2px var(--vw-edge); }
.sr-conf-card::before { content: ""; position: absolute; left: 50%; top: 8px; width: 70px; height: 18px; transform: translateX(-50%) rotate(-2deg); border-radius: 3px; background: color-mix(in srgb, var(--vw-gold) 60%, transparent); }
.sr-conf-t { margin: 0; font: 400 clamp(19px, 2.9dvh, 23px)/1.3 ${SR_HAND}; color: var(--vw-ink); overflow-wrap: anywhere; }
.sr-conf-s { margin: 0; font: 600 13px ${FONTS.ui}; color: var(--vw-accent-deep); }
`;

// ─── 4 · Pop the guilt bubbles ──────────────────────────────────────────────

/** Where the bubbles float, as % of the arena (around the crying sticker in the middle). */
const SPOTS: readonly [number, number][] = [
  [18, 18],
  [80, 14],
  [12, 64],
  [86, 60],
  [50, 88],
];

export function Bubbles({ reasons, sticker, onNext }: { reasons: readonly string[]; sticker: ReactNode; onNext: () => void }) {
  const { cue } = useSr();
  const reduced = useReducedMotion();
  const list = useMemo(() => reasons.slice(0, SPOTS.length), [reasons]);
  const [popped, setPopped] = useState<number[]>([]);
  const last = popped.length ? popped[popped.length - 1] : null;
  const all = popped.length >= list.length;
  const pop = (k: number) => {
    if (popped.includes(k)) return;
    haptic(14);
    cue("bubble", { gain: 0.7, detune: k * 90 });
    cue("pop", { gain: 0.6, at: 0.04 });
    setPopped((p) => [...p, k]);
  };
  useEffect(() => {
    if (all && !reduced) cue("chime-cascade", { gain: 0.4, at: 0.3 });
  }, [all, reduced, cue]);
  useNext(all ? "That's all of it" : null, onNext, "bubble");

  return (
    <>
      <Head kicker="Pop them, one by one" title="Why I'm sorry" sub={all ? "Every single one is true." : `${popped.length} of ${list.length} popped`} />
      <div className="sr-fill">
        {all ? (
          <motion.ul className="sr-reasons" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 220, damping: 22 }}>
            <li className="sr-reasons-gif" aria-hidden>
              {sticker}
            </li>
            {list.map((r, k) => (
              <li key={k} style={{ animationDelay: `${k * 90}ms` }}>
                <span aria-hidden>🫧</span> {r}
              </li>
            ))}
          </motion.ul>
        ) : (
        <div className="sr-bubs">
          <div className="sr-bubs-mid">{sticker}</div>
          {list.map((_, k) => {
            const done = popped.includes(k);
            const [x, y] = SPOTS[k];
            return (
              <button
                key={k}
                type="button"
                className={`sr-bubble${done ? " is-popped" : ""}`}
                style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${-k * 0.9}s` }}
                onClick={() => pop(k)}
                disabled={done}
                aria-label={done ? `Reason ${k + 1}, popped` : `Pop bubble ${k + 1}`}
                data-sr-bubble={k}
              >
                <span className="sr-bubble-in">{done ? "" : "🫧"}</span>
              </button>
            );
          })}
        </div>
        )}
      </div>
      <div className="sr-reason" aria-live="polite" hidden={all}>
        {last === null ? (
          <p className="sr-reason-empty">tap a bubble 🫧</p>
        ) : (
          <motion.p key={last} className="sr-reason-t" initial={{ opacity: 0, y: 12, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 280, damping: 20 }}>
            {list[last]}
          </motion.p>
        )}
      </div>
      <style>{BUB_CSS}</style>
    </>
  );
}

const BUB_CSS = `
.sr-bubs { position: relative; width: min(100cqw, 130cqh, 400px); aspect-ratio: 1 / .9; max-height: 100cqh; }
.sr-bubs-mid { position: absolute; left: 50%; top: 48%; transform: translate(-50%, -50%); }
.sr-bubble { position: absolute; width: clamp(62px, 20cqw, 86px); aspect-ratio: 1; margin: 0; padding: 0; border: 0; border-radius: 50%; cursor: pointer; transform: translate(-50%, -50%);
  background: radial-gradient(circle at 32% 28%, #FFFFFF 0 14%, rgba(255,255,255,.35) 30%, color-mix(in srgb, var(--vw-accent) 22%, transparent) 62%, color-mix(in srgb, var(--sr-blush) 80%, transparent) 100%);
  box-shadow: inset 0 0 0 2px rgba(255,255,255,.85), inset -6px -8px 14px color-mix(in srgb, var(--vw-gold) 45%, transparent), 0 10px 20px -10px color-mix(in srgb, var(--sr-deep) 50%, transparent);
  animation: sr-bob-b 3.2s ease-in-out infinite alternate; touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
.sr-bubble::after { content: ""; position: absolute; inset: 0; border-radius: 50%; background: conic-gradient(from 0deg, rgba(255,180,220,.35), rgba(170,220,255,.35), rgba(200,255,220,.35), rgba(255,240,170,.35), rgba(255,180,220,.35)); mix-blend-mode: screen; opacity: .8; }
@keyframes sr-bob-b { from { transform: translate(-50%, -50%) translateY(-6px) } to { transform: translate(-50%, -50%) translateY(6px) } }
.sr-bubble-in { position: relative; z-index: 1; font-size: 22px; opacity: .55; }
.sr-bubble.is-popped { animation: sr-burst .38s ease-out forwards; pointer-events: none; }
@keyframes sr-burst { 0% { transform: translate(-50%, -50%) scale(1); opacity: 1 } 60% { transform: translate(-50%, -50%) scale(1.35); opacity: .6 } 100% { transform: translate(-50%, -50%) scale(1.6); opacity: 0 } }
.sr-bubble:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 3px; }
.sr-reasons { list-style: none; margin: 0; padding: 0; width: min(100%, 400px); max-height: 100cqh; overflow-y: auto; display: grid; gap: 8px; align-content: center; }
.sr-reasons li { margin: 0; box-sizing: border-box; padding: 9px 14px; border-radius: 16px; background: var(--vw-paper); box-shadow: 0 0 0 2px var(--vw-edge); text-align: left;
  font: 400 clamp(16px, 2.4dvh, 19px)/1.3 ${SR_HAND}; color: var(--vw-ink); overflow-wrap: anywhere; animation: sr-li-in .4s cubic-bezier(.3,1.4,.5,1) both; }
.sr-reasons li.sr-reasons-gif { background: none; box-shadow: none; padding: 0; display: grid; place-items: center; }
@keyframes sr-li-in { from { opacity: 0; transform: translateY(10px) scale(.96) } to { opacity: 1; transform: none } }
.sr-reason[hidden] { display: none; }
.sr-reason { flex: none; min-height: clamp(70px, 11dvh, 96px); width: 100%; max-width: 400px; display: grid; place-items: center; }
.sr-reason-empty { margin: 0; font: 700 16px ${SR_DISPLAY}; color: var(--vw-ink-soft); }
.sr-reason-t { margin: 0; box-sizing: border-box; width: 100%; padding: 12px 16px; border-radius: 18px; background: var(--vw-paper); box-shadow: 0 0 0 2px var(--vw-edge), 0 10px 20px -12px color-mix(in srgb, var(--sr-deep) 50%, transparent);
  font: 400 clamp(18px, 2.7dvh, 21px)/1.3 ${SR_HAND}; color: var(--vw-ink); overflow-wrap: anywhere; }
@media (prefers-reduced-motion: reduce) { .sr-bubble { animation: none; } }
`;
