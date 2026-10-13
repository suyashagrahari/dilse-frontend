"use client";

// Scenes 1–4: the wrapped gift, the candles (light them, wish, blow), cutting
// the cake, the balloons. Each one is a single screen; its Next pill appears
// only once their moment is done (the ribbon off, the candles out, the first
// slice served, every balloon popped).

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { burst, haptic, useHoldProgress, useReducedMotion } from "../../../_valentine/kit";
import { FONTS } from "../../../_valentine/theme";
import { Bow, Cake, candleSpot, type CandleState } from "./art";
import { HB_DISPLAY, HB_HAND } from "./fonts";
import { useHb, useNext } from "./stage";
import { HbScroll, Head } from "./ui";

const TUGS = 3;

// ─── 1 · The wrapped gift ───────────────────────────────────────────────────

export function Gate({
  recipient,
  sender,
  petName,
  openingLine,
  sticker,
  confetti,
  onEnter,
}: {
  recipient: string;
  sender: string;
  petName: string;
  openingLine: string;
  sticker: ReactNode;
  confetti: readonly string[];
  onEnter: () => void;
}) {
  const { cue } = useHb();
  const reduced = useReducedMotion();
  const [tugs, setTugs] = useState(0);
  const [press, setPress] = useState(0);
  const open = tugs >= TUGS;

  const tug = () => {
    if (open) return;
    const n = tugs + 1;
    setTugs(n);
    setPress((p) => p + 1);
    haptic(n >= TUGS ? 24 : 10);
    if (n < TUGS) {
      cue("ribbon", { gain: 0.6, detune: n * 120 });
      return;
    }
    cue("ribbon", { gain: 0.8 });
    cue("pop", { gain: 0.7, at: 0.3 });
    cue("chime-cascade", { gain: 0.55, at: 0.45 });
    if (!reduced) {
      window.setTimeout(() => burst({ kind: "confetti", colors: confetti, origin: { x: 0.5, y: 0.42 }, count: 90 }), 480);
      window.setTimeout(() => burst({ kind: "sparkles", origin: { x: 0.5, y: 0.35 }, count: 18 }), 700);
    }
  };

  useNext(open ? "Let's celebrate" : null, onEnter, "cake");

  return (
    <>
      <Head
        kicker={open ? `From ${sender}, with love` : `Psst, ${recipient}…`}
        title={
          open ? (
            <>
              Happy Birthday, <em className="hb-em">{petName || recipient}</em>! 🎉
            </>
          ) : (
            <>
              Someone wrapped you a <em className="hb-em">surprise</em>
            </>
          )
        }
        sub={open ? "Today is all about you. Ready?" : openingLine || "untie the ribbon 🎀"}
      />
      <div className="hb-fill">
        <div className={`hb-gift${open ? " is-open" : ""}`} data-hb-gift={open ? "open" : "wrapped"}>
          <div className="hb-gift-peek">{sticker}</div>
          <div className="hb-gift-box">
            <span className="hb-gift-rib-v" />
            <span className="hb-gift-tag" aria-hidden>
              <span>To: {recipient}</span>
            </span>
          </div>
          <div className="hb-gift-lid">
            <span className="hb-gift-rib-v" />
          </div>
          <button
            type="button"
            className={`hb-gift-bow${press ? (press % 2 ? " is-tug-a" : " is-tug-b") : ""}`}
            onClick={tug}
            disabled={open}
            aria-label={open ? "The gift is open" : `Tug the bow to untie the ribbon (${tugs} of ${TUGS})`}
            data-hb-bow
          >
            <Bow loose={tugs} />
          </button>
        </div>
      </div>
      <p className="hb-hint" aria-live="polite">
        {open ? "Surprise!! 🥳" : tugs === 0 ? "Tap the bow to untie it 🎀" : tugs === 1 ? "Tug again… 🎀" : "One more pull! ✨"}
      </p>
      <style>{GATE_CSS}</style>
    </>
  );
}

const GATE_CSS = `
.hb-gift { --hb-ribbon: #FFD66E; --hb-ribbon2: #F2B53C; --hb-ribbon-ink: #B27A16;
  position: relative; width: min(74cqw, 76cqh, calc(300px * var(--vw-s, 1))); aspect-ratio: 1 / 1.08; }
.hb-gift-box { position: absolute; left: 6%; right: 6%; bottom: 0; height: 64%; z-index: 2; border-radius: 10px 10px 16px 16px;
  background: radial-gradient(circle, color-mix(in srgb, var(--vw-paper) 55%, transparent) 0 3.5px, transparent 4.2px) 0 0 / 22px 22px,
    linear-gradient(180deg, color-mix(in srgb, var(--vw-accent) 82%, #FFFFFF), var(--vw-accent) 60%, var(--vw-accent-deep));
  box-shadow: inset 0 -10px 0 color-mix(in srgb, var(--hb-deep) 25%, transparent), 0 30px 46px -24px color-mix(in srgb, var(--hb-deep) 80%, transparent); }
.hb-gift-lid { position: absolute; left: 0; right: 0; bottom: 60%; height: 17%; z-index: 3; border-radius: 10px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--vw-accent) 70%, #FFFFFF), var(--vw-accent));
  box-shadow: inset 0 -5px 0 color-mix(in srgb, var(--hb-deep) 22%, transparent), 0 8px 14px -8px color-mix(in srgb, var(--hb-deep) 70%, transparent);
  transform-origin: 50% 50%; transition: transform .9s cubic-bezier(.25,1.45,.45,1) .25s; }
.hb-gift-rib-v { position: absolute; left: 50%; top: 0; bottom: 0; width: 15%; transform: translateX(-50%); background: linear-gradient(90deg, var(--hb-ribbon2), var(--hb-ribbon) 40%, var(--hb-ribbon2));
  box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--hb-ribbon-ink) 45%, transparent); transform-origin: 50% 0; transition: transform .45s ease, opacity .45s ease; }
.hb-gift-box::after { content: ""; position: absolute; left: 0; right: 0; top: 38%; height: 13%; background: linear-gradient(180deg, var(--hb-ribbon2), var(--hb-ribbon) 40%, var(--hb-ribbon2));
  box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--hb-ribbon-ink) 45%, transparent); transition: transform .45s ease, opacity .45s ease; }
.hb-gift-bow { position: absolute; z-index: 5; left: 50%; bottom: 72%; width: 56%; aspect-ratio: 160 / 110; transform: translateX(-50%); border: 0; padding: 0; background: none; cursor: pointer;
  touch-action: manipulation; -webkit-tap-highlight-color: transparent; filter: drop-shadow(0 6px 8px color-mix(in srgb, var(--hb-deep) 40%, transparent));
  transition: transform .8s cubic-bezier(.3,.7,.3,1), opacity .6s ease .15s; }
.hb-gift-bow::before { content: ""; position: absolute; inset: -12px -6px; }
.hb-gift-bow:not(:disabled) { animation: hb-bow 1.6s ease-in-out infinite alternate; }
@keyframes hb-bow { from { transform: translateX(-50%) scale(1) rotate(-2deg) } to { transform: translateX(-50%) scale(1.06) rotate(2deg) } }
.hb-gift-bow.is-tug-a:not(:disabled) { animation: hb-tug-a .34s cubic-bezier(.3,1.6,.5,1), hb-bow 1.6s ease-in-out .34s infinite alternate; }
.hb-gift-bow.is-tug-b:not(:disabled) { animation: hb-tug-b .34s cubic-bezier(.3,1.6,.5,1), hb-bow 1.6s ease-in-out .34s infinite alternate; }
@keyframes hb-tug-a { 0% { transform: translateX(-50%) translateY(10px) scale(.9) rotate(-8deg) } 100% { transform: translateX(-50%) scale(1) } }
@keyframes hb-tug-b { 0% { transform: translateX(-50%) translateY(10px) scale(.9) rotate(8deg) } 100% { transform: translateX(-50%) scale(1) } }
.hb-gift-bow:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 4px; border-radius: 16px; }
.hb-gift-tag { position: absolute; right: -9%; top: 52%; z-index: 4; transform: rotate(10deg); transform-origin: 0 0; padding: 6px 10px 6px 16px; border-radius: 4px 10px 10px 4px;
  background: var(--vw-paper); box-shadow: 0 0 0 1.5px var(--vw-edge), 0 8px 14px -8px color-mix(in srgb, var(--hb-deep) 60%, transparent);
  clip-path: polygon(10px 0, 100% 0, 100% 100%, 10px 100%, 0 50%); max-width: 62%; }
.hb-gift-tag span { display: block; font: 700 clamp(15px, 5.4cqw, 20px)/1.05 ${HB_HAND}; color: var(--vw-ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.hb-gift-peek { position: absolute; left: 50%; bottom: 14%; z-index: 1; transform: translate(-50%, 0) scale(.6); opacity: 0; transition: transform .9s cubic-bezier(.3,1.5,.5,1) .7s, opacity .3s ease .7s; }
.hb-gift.is-open .hb-gift-peek { transform: translate(-50%, -122%) rotate(-4deg) scale(1); opacity: 1; }
.hb-gift.is-open .hb-gift-lid { transform: translate(5%, -250%) rotate(-9deg); }
.hb-gift.is-open .hb-gift-bow { transform: translate(40%, -150%) rotate(40deg) scale(.6); opacity: 0; animation: none; pointer-events: none; }
.hb-gift.is-open .hb-gift-rib-v, .hb-gift.is-open .hb-gift-box::after { transform: scaleY(0); opacity: 0; }
.hb-gift.is-open .hb-gift-box::after { transform: scaleX(0); }
@media (prefers-reduced-motion: reduce) { .hb-gift *, .hb-gift *::after { transition-duration: .01s !important; transition-delay: 0s !important; animation: none !important; } }
`;

// ─── 2 · Light the candles, wish, blow ──────────────────────────────────────

type Phase = "light" | "wish" | "blown";

/** Listens to the mic and calls `onBlow` after a sustained puff; `level` (0–1) leans the flames. */
function useMicBlow(onBlow: () => void) {
  const [state, setState] = useState<"off" | "asking" | "on" | "denied">("off");
  const [level, setLevel] = useState(0);
  const stop = useRef<(() => void) | null>(null);
  const cb = useRef(onBlow);
  useEffect(() => {
    cb.current = onBlow;
  });
  const end = useCallback(() => {
    stop.current?.();
    stop.current = null;
    setLevel(0);
  }, []);
  useEffect(() => end, [end]);
  const start = useCallback(async () => {
    if (stop.current || typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      if (!stop.current) setState("denied");
      return;
    }
    setState("asking");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AC();
      const src = ctx.createMediaStreamSource(stream);
      const an = ctx.createAnalyser();
      an.fftSize = 1024;
      src.connect(an);
      const buf = new Uint8Array(an.fftSize);
      let loud = 0;
      let last = performance.now();
      let raf = 0;
      let alive = true;
      stop.current = () => {
        alive = false;
        cancelAnimationFrame(raf);
        stream.getTracks().forEach((t) => t.stop());
        void ctx.close().catch(() => undefined);
      };
      setState("on");
      const tick = () => {
        if (!alive) return;
        an.getByteTimeDomainData(buf);
        let sum = 0;
        for (let k = 0; k < buf.length; k++) {
          const v = (buf[k] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / buf.length);
        const now = performance.now();
        const dt = now - last;
        last = now;
        setLevel(Math.min(1, rms / 0.22));
        loud = rms > 0.1 ? loud + dt : Math.max(0, loud - dt * 0.6);
        if (loud > 360) {
          end();
          setState("off");
          cb.current();
          return;
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    } catch {
      setState("denied");
    }
  }, [end]);
  return { state, level, start, stop: end };
}

export function Candles({
  recipient,
  age,
  sprinkles,
  confetti,
  wishLine,
  sender,
  sticker,
  onNext,
}: {
  recipient: string;
  age: string;
  sprinkles: readonly string[];
  confetti: readonly string[];
  wishLine: string;
  sender: string;
  sticker: ReactNode;
  onNext: () => void;
}) {
  const { cue } = useHb();
  const reduced = useReducedMotion();
  const [candles, setCandles] = useState<CandleState[]>(["unlit", "unlit", "unlit", "unlit", "unlit"]);
  const [phase, setPhase] = useState<Phase>("light");
  const [showWish, setShowWish] = useState(false);
  const timers = useRef<number[]>([]);
  useEffect(() => {
    const ts = timers.current;
    return () => ts.forEach((t) => window.clearTimeout(t));
  }, []);
  const litCount = candles.filter((c) => c === "lit").length;

  const light = (k: number) => {
    if (phase !== "light" || candles[k] !== "unlit") return;
    haptic(10);
    cue("match-strike", { gain: 0.55 });
    cue("flame-whoosh", { gain: 0.25, at: 0.12 });
    const nextC = candles.map((c, j) => (j === k ? "lit" : c)) as CandleState[];
    setCandles(nextC);
    if (nextC.every((c) => c === "lit")) {
      cue("chime", { gain: 0.45, at: 0.3 });
      setPhase("wish");
    }
  };
  const lightAll = () => {
    if (phase !== "light") return;
    haptic(14);
    cue("match-strike", { gain: 0.6 });
    cue("flame-whoosh", { gain: 0.35, at: 0.1 });
    setCandles(["lit", "lit", "lit", "lit", "lit"]);
    setPhase("wish");
  };

  const blowOut = useCallback(() => {
    if (phase !== "wish") return;
    setPhase("blown");
    haptic(30);
    cue("whoosh", { gain: 0.7 });
    [0, 1, 2, 3, 4].forEach((k) => {
      const order = [2, 1, 3, 0, 4][k];
      timers.current.push(window.setTimeout(() => setCandles((cs) => cs.map((c, j) => (j === order ? "out" : c)) as CandleState[]), reduced ? 0 : k * 90));
    });
    cue("chime-cascade", { gain: 0.6, at: 0.5 });
    cue("firework", { gain: 0.35, at: 0.7 });
    timers.current.push(
      window.setTimeout(() => {
        if (!reduced) {
          burst({ kind: "confetti", colors: confetti, origin: { x: 0.5, y: 0.35 }, count: 110 });
          burst({ kind: "sparkles", origin: { x: 0.5, y: 0.3 }, count: 20 });
        }
        setShowWish(true);
      }, reduced ? 0 : 900),
    );
  }, [phase, cue, reduced, confetti]);

  const mic = useMicBlow(blowOut);
  const hold = useHoldProgress({ duration: 1300, taps: 4, onComplete: blowOut, disabled: phase !== "wish" });
  const blow = phase === "wish" ? Math.max(hold.progress * 0.9, mic.level) : 0;
  const stopMic = mic.stop;
  useEffect(() => {
    if (phase !== "wish") stopMic();
  }, [phase, stopMic]);

  useNext(showWish ? "Cut the cake" : null, onNext, "slice");

  const title = phase === "light" ? "Light your candles" : phase === "wish" ? "Make a wish… 🤫" : showWish ? "Your wish is on its way ✨" : "Whoosh!";
  const sub =
    phase === "light"
      ? `Tap each candle to light it (${litCount} of 5) 🕯️`
      : phase === "wish"
        ? "Close your eyes, wish for something big, then blow!"
        : showWish
          ? undefined
          : "";

  return (
    <>
      <Head kicker={`Happy birthday, ${recipient}`} title={title} sub={sub} />
      <div className="hb-fill">
        <div className={`hb-cakebox is-${phase}${showWish ? " is-wished" : ""}`} data-hb-candles={phase}>
          <div className="hb-cakebox-cake">
            <Cake candles={candles} name={recipient} age={age} blow={blow} sprinkles={sprinkles} />
            {phase === "light" &&
              candles.map((c, k) => {
                const s = candleSpot(k, age);
                return (
                  <button
                    key={k}
                    type="button"
                    className={`hb-wick${c === "lit" ? " is-lit" : ""}`}
                    style={{ left: `${s.x}%`, top: `${s.y}%` }}
                    onClick={() => light(k)}
                    disabled={c !== "unlit"}
                    aria-label={c === "lit" ? `Candle ${k + 1} is lit` : `Light candle ${k + 1}`}
                    data-hb-wick={k}
                  >
                    {c === "unlit" && <span className="hb-wick-spark" aria-hidden>✨</span>}
                  </button>
                );
              })}
          </div>
          <AnimatePresence>
            {showWish && (
              <motion.div key="wish" className="hb-wish hb-card" initial={reduced ? false : { opacity: 0, y: 20, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 240, damping: 20 }}>
                <div className="hb-wish-gif">{sticker}</div>
                <p className="hb-wish-t">{wishLine}</p>
                <p className="hb-wish-s">— {sender}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="hb-candle-ctl">
        {phase === "light" && (
          <button type="button" className="hb-ghost" onClick={lightAll}>
            🔥 Light them all
          </button>
        )}
        {phase === "wish" && (
          <>
            <button type="button" className={`hb-blow${hold.holding ? " is-holding" : ""}`} {...hold.bind} aria-label="Hold to blow out the candles" data-hb-blow>
              <span className="hb-blow-fill" style={{ transform: `scaleX(${hold.progress})` }} aria-hidden />
              <span className="hb-blow-t">💨 Hold to blow</span>
            </button>
            <button type="button" className="hb-mic" onClick={() => void mic.start()} disabled={mic.state === "on" || mic.state === "asking"} data-hb-mic>
              {mic.state === "on" ? "🎤 Listening… blow now!" : mic.state === "asking" ? "🎤 Allow the mic…" : mic.state === "denied" ? "🎤 No mic — just hold the button" : "🎤 or really blow (use mic)"}
            </button>
          </>
        )}
      </div>
      <style>{CANDLE_CSS}</style>
    </>
  );
}

const CANDLE_CSS = `
.hb-cakebox { position: relative; width: min(92cqw, 112cqh, calc(360px * var(--vw-s, 1))); display: grid; justify-items: center; gap: 10px; }
.hb-cakebox-cake { position: relative; width: 100%; padding-top: 4%; transition: width .6s cubic-bezier(.3,1.2,.4,1), transform .6s ease; }
.hb-cakebox.is-wished .hb-cakebox-cake { width: min(100%, max(140px, (100cqh - 170px) * 1.1)); }
.hb-wick { position: absolute; width: 46px; height: 58px; margin: -40px 0 0 -23px; padding: 0; border: 0; border-radius: 16px; background: none; cursor: pointer; touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
.hb-wick:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 0; }
.hb-wick:disabled { cursor: default; }
.hb-wick-spark { position: absolute; left: 50%; top: 4px; transform: translateX(-50%); font-size: 16px; animation: hb-spark 1.3s ease-in-out infinite; }
@keyframes hb-spark { 0%, 100% { opacity: .35; transform: translateX(-50%) scale(.8) } 50% { opacity: 1; transform: translateX(-50%) scale(1.15) } }
.hb-wish { position: relative; width: min(100%, 390px); padding: 12px 16px 12px 12px; display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: center; gap: 4px 12px; text-align: left; }
.hb-wish-gif { grid-row: span 2; transform: rotate(-6deg); }
.hb-wish-gif:empty { display: none; }
.hb-wish-gif .hb-stk { padding: 4px; border-radius: 16px; }
.hb-wish-gif .hb-stk img { width: clamp(60px, 9.5dvh, 80px) !important; height: auto !important; }
.hb-wish-t { margin: 0; font: 600 clamp(20px, 2.9dvh, 24px)/1.2 ${HB_HAND}; color: var(--vw-ink); overflow-wrap: anywhere; }
.hb-wish-s { margin: 0; font: 700 13px ${FONTS.ui}; color: var(--vw-accent-deep); }
.hb-candle-ctl { flex: none; min-height: 52px; width: 100%; max-width: 380px; display: grid; gap: 8px; justify-items: center; }
.hb-candle-ctl:empty { min-height: 0; }
.hb-blow { position: relative; overflow: hidden; width: min(100%, 300px); min-height: 54px; border: 0; border-radius: 999px; cursor: pointer; touch-action: none; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none;
  background: var(--vw-paper); box-shadow: 0 0 0 3px var(--vw-accent), 0 10px 22px -12px color-mix(in srgb, var(--hb-deep) 70%, transparent); color: var(--vw-ink); }
.hb-blow-fill { position: absolute; inset: 0; transform-origin: 0 50%; background: linear-gradient(90deg, var(--hb-blush), color-mix(in srgb, var(--vw-accent) 45%, var(--hb-blush))); transition: transform .08s linear; }
.hb-blow-t { position: relative; font: 800 18px ${HB_DISPLAY}; }
.hb-blow.is-holding { transform: scale(.98); }
.hb-blow:not(.is-holding) { animation: hb-pulse 1.4s ease-in-out infinite; }
@keyframes hb-pulse { 0%, 100% { transform: scale(1) } 50% { transform: scale(1.04) } }
.hb-blow:focus-visible, .hb-mic:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 3px; }
.hb-mic { min-height: 44px; padding: 0 14px; border: 0; background: none; cursor: pointer; font: 600 14px ${FONTS.ui}; color: var(--vw-ink-soft); text-decoration: underline; text-underline-offset: 3px; touch-action: manipulation; }
.hb-mic:disabled { cursor: default; text-decoration: none; color: var(--vw-accent-deep); }
@media (prefers-reduced-motion: reduce) { .hb-blow, .hb-wick-spark { animation: none !important; } }
`;

// ─── 3 · Cut the cake ───────────────────────────────────────────────────────

export function CakeCut({
  recipient,
  age,
  sprinkles,
  confetti,
  cakeLine,
  onNext,
}: {
  recipient: string;
  age: string;
  sprinkles: readonly string[];
  confetti: readonly string[];
  cakeLine: string;
  onNext: () => void;
}) {
  const { cue } = useHb();
  const reduced = useReducedMotion();
  const box = useRef<HTMLDivElement | null>(null);
  const [cut, setCut] = useState(false);
  const [served, setServed] = useState(false);
  const [line, setLine] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const ticks = useRef(0);
  const outs: CandleState[] = useMemo(() => ["out", "out", "out", "out", "out"], []);

  const doCut = useCallback(() => {
    if (cut) return;
    setCut(true);
    setLine(null);
    haptic(26);
    cue("snap", { gain: 0.6 });
    cue("swoosh-soft", { gain: 0.5, at: 0.05 });
    cue("chime-cascade", { gain: 0.5, at: 0.55 });
    window.setTimeout(
      () => {
        setServed(true);
        if (!reduced) burst({ kind: "confetti", colors: confetti, origin: { x: 0.5, y: 0.5 }, count: 60, spread: 0.35 });
      },
      reduced ? 0 : 1000,
    );
  }, [cut, cue, reduced, confetti]);

  const local = (e: React.PointerEvent) => {
    const r = box.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 };
  };
  const down = (e: React.PointerEvent) => {
    if (cut) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = local(e);
    start.current = p;
    ticks.current = 0;
    setLine({ x1: p.x, y1: p.y, x2: p.x, y2: p.y });
  };
  const move = (e: React.PointerEvent) => {
    const s = start.current;
    if (!s || cut) return;
    const p = local(e);
    setLine({ x1: s.x, y1: s.y, x2: p.x, y2: p.y });
    const len = Math.hypot(p.x - s.x, p.y - s.y);
    const t = Math.floor(len / 10);
    if (t > ticks.current) {
      ticks.current = t;
      cue("tick", { gain: 0.25, detune: t * 60 });
    }
    if (len > 42) {
      start.current = null;
      doCut();
    }
  };
  const up = () => {
    start.current = null;
    if (!cut) setLine(null);
  };

  useNext(served ? "Pop the balloons" : null, onNext, "balloon");

  return (
    <>
      <Head kicker="Cake time" title={served ? "The first slice is yours 🍰" : "Now cut the cake!"} sub={served ? undefined : "Swipe across the cake, like a knife 🔪"} />
      <div className="hb-fill">
        <AnimatePresence mode="wait" initial={false}>
          {!served ? (
            <motion.div key="cake" className={`hb-cut${cut ? " is-cut" : ""}`} exit={reduced ? undefined : { opacity: 0, scale: 0.9, transition: { duration: 0.25 } }} data-hb-cut={cut ? "cut" : "whole"}>
              <div ref={box} className="hb-cut-area" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} data-hb-cut-area>
                <div className="hb-cut-half is-l">
                  <Cake candles={outs} name={recipient} age={age} sprinkles={sprinkles} showCandles={false} />
                </div>
                <div className="hb-cut-half is-r" aria-hidden>
                  <Cake candles={outs} name={recipient} age={age} sprinkles={sprinkles} showCandles={false} />
                </div>
                {!cut && (
                  <span className="hb-cut-guide" aria-hidden>
                    <span className="hb-cut-knife">
                      <Knife />
                    </span>
                  </span>
                )}
                {line && (
                  <svg className="hb-cut-line" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
                    <line x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} vectorEffect="non-scaling-stroke" />
                  </svg>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div key="slice" className="hb-served" initial={reduced ? false : { opacity: 0, y: 30, scale: 0.85 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 16 }}>
              <div className="hb-slice" aria-hidden>
                <Slice sprinkles={sprinkles} />
              </div>
              <div className="hb-slice-card hb-card">
                <p className="hb-slice-t">{cakeLine}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="hb-candle-ctl">
        {!cut && (
          <button type="button" className="hb-mic" onClick={doCut} data-hb-cut-tap>
            or tap here to cut it
          </button>
        )}
      </div>
      <style>{CUT_CSS}</style>
    </>
  );
}

/** The cake knife that bobs down the cut guide: a silver blade, a handle in the page's colour. */
function Knife() {
  return (
    <svg viewBox="0 0 30 110" width="100%" style={{ display: "block", overflow: "visible" }} aria-hidden>
      <rect x="8" y="0" width="14" height="40" rx="7" fill="var(--vw-accent)" stroke="var(--hb-deep)" strokeWidth="2.5" />
      <circle cx="15" cy="12" r="2.4" fill="#FFFFFF" opacity=".8" />
      <circle cx="15" cy="27" r="2.4" fill="#FFFFFF" opacity=".8" />
      <rect x="6" y="38" width="18" height="6" rx="3" fill="#C9CDD4" stroke="#8D949E" strokeWidth="1.5" />
      <path d="M9 44 L23 44 L23 92 C23 100 17 106 9 108 Z" fill="#E9ECF0" stroke="#8D949E" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 48 L12 98" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity=".9" />
    </svg>
  );
}

/** One slice on a little plate, with a fork and a strawberry-heart on top. */
function Slice({ sprinkles }: { sprinkles: readonly string[] }) {
  return (
    <svg viewBox="0 0 240 190" width="100%" style={{ display: "block", overflow: "visible" }}>
      <ellipse cx="120" cy="164" rx="112" ry="22" fill="color-mix(in srgb, var(--hb-deep) 16%, transparent)" />
      <ellipse cx="120" cy="158" rx="108" ry="20" fill="var(--hb-plate)" stroke="var(--vw-edge)" strokeWidth="3" />
      <ellipse cx="120" cy="155" rx="80" ry="12" fill="none" stroke="var(--vw-edge)" strokeWidth="1.5" opacity=".7" />
      {/* the wedge: a side face (layers) and a top */}
      <path d="M58 150 L58 92 L176 70 L176 128 Z" fill="var(--hb-sponge)" stroke="color-mix(in srgb, var(--hb-deep) 30%, transparent)" strokeWidth="2" />
      <path d="M58 112 L176 90 L176 98 L58 120 Z" fill="var(--hb-frost)" />
      <path d="M58 134 L176 112 L176 118 L58 140 Z" fill="var(--hb-cream)" />
      <path d="M176 70 L196 84 L196 140 L176 128 Z" fill="var(--hb-frost)" stroke="color-mix(in srgb, var(--hb-deep) 30%, transparent)" strokeWidth="2" />
      <path d="M58 92 L176 70 L196 84 L80 104 Z" fill="var(--hb-drip)" stroke="color-mix(in srgb, var(--hb-deep) 30%, transparent)" strokeWidth="2" strokeLinejoin="round" />
      <path d="M80 104 C82 112 86 112 88 104 M118 98 C120 110 126 110 128 96 M160 90 C162 98 166 98 168 88" stroke="var(--hb-drip)" strokeWidth="6" strokeLinecap="round" fill="none" />
      {Array.from({ length: 9 }, (_, k) => {
        const x = 86 + k * 11;
        const y = 92 - k * 2 + (k % 2) * 4;
        return <rect key={k} x={x} y={y} width="7" height="2.6" rx="1.3" fill={sprinkles[k % sprinkles.length]} transform={`rotate(${(k * 47) % 180} ${x} ${y})`} />;
      })}
      <path className="hb-slice-heart" d="M134 70 C120 60 116 52 120 46 C124 40 132 42 134 48 C136 42 144 40 148 46 C152 52 148 60 134 70 Z" fill="var(--vw-accent)" stroke="#FFFFFF" strokeWidth="2.5" />
      {/* fork */}
      <g transform="rotate(-24 210 140)">
        <rect x="206" y="104" width="6" height="56" rx="3" fill="#D7D9DE" stroke="#9AA0A8" strokeWidth="1.5" />
        <path d="M200 84 v18 q9 8 18 0 v-18 M206 84 v14 M212 84 v14" stroke="#9AA0A8" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}

const CUT_CSS = `
.hb-cut { width: min(92cqw, 112cqh, calc(360px * var(--vw-s, 1))); }
.hb-cut-area { position: relative; width: 100%; aspect-ratio: 300 / 270; touch-action: none; cursor: crosshair; user-select: none; -webkit-user-select: none; }
.hb-cut-half { position: absolute; inset: 0; transition: transform .7s cubic-bezier(.3,1.4,.4,1); }
.hb-cut-half.is-l { clip-path: inset(-20% 50% -20% -20%); }
.hb-cut-half.is-r { clip-path: inset(-20% -20% -20% 50%); }
.hb-cut.is-cut .hb-cut-half.is-l { transform: translateX(-9%) rotate(-3deg); }
.hb-cut.is-cut .hb-cut-half.is-r { transform: translateX(9%) rotate(3deg); }
.hb-cut-guide { position: absolute; left: 50%; top: 24%; bottom: 8%; width: 0; border-left: 3px dashed color-mix(in srgb, var(--vw-ink) 45%, transparent); pointer-events: none; }
.hb-cut-knife { position: absolute; left: -15px; top: -78px; width: 30px; animation: hb-knife 1.8s ease-in-out infinite; filter: drop-shadow(0 6px 6px color-mix(in srgb, var(--hb-deep) 35%, transparent)); }
@keyframes hb-knife { 0%, 100% { translate: 0 0 } 55% { translate: 0 70px } }
.hb-cut-line { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; overflow: visible; }
.hb-cut-line line { stroke: #FFFFFF; stroke-width: 6; stroke-linecap: round; filter: drop-shadow(0 0 6px color-mix(in srgb, var(--vw-accent) 80%, transparent)); }
.hb-served { width: min(100%, 380px); display: grid; justify-items: center; gap: clamp(8px, 1.6dvh, 14px); }
.hb-slice { width: min(80cqw, 54cqh, 300px); }
.hb-slice-heart { transform-box: fill-box; transform-origin: 50% 100%; animation: hb-beat .9s ease-in-out infinite alternate; }
.hb-slice-card { width: 100%; padding: 14px 18px; }
.hb-slice-t { margin: 0; font: 600 clamp(21px, 3.1dvh, 26px)/1.2 ${HB_HAND}; color: var(--vw-ink); overflow-wrap: anywhere; text-wrap: balance; }
@media (prefers-reduced-motion: reduce) { .hb-cut-knife, .hb-slice-heart { animation: none; } .hb-cut-half { transition: none; } }
`;

// ─── 4 · Pop the balloons ───────────────────────────────────────────────────

/** Where the balloons float, as % of the arena (around the sticker in the middle). */
const SPOTS: readonly [number, number][] = [
  [17, 22],
  [82, 18],
  [12, 66],
  [88, 62],
  [50, 86],
];

export function Balloons({ reasons, colors, sticker, onNext }: { reasons: readonly string[]; colors: readonly string[]; sticker: ReactNode; onNext: () => void }) {
  const { cue } = useHb();
  const reduced = useReducedMotion();
  const list = useMemo(() => reasons.slice(0, SPOTS.length), [reasons]);
  const [popped, setPopped] = useState<number[]>([]);
  const last = popped.length ? popped[popped.length - 1] : null;
  const all = popped.length >= list.length;
  const pop = (k: number, el: HTMLElement) => {
    if (popped.includes(k)) return;
    haptic(16);
    cue("pop", { gain: 0.8, detune: k * 80 });
    cue("sparkle", { gain: 0.3, at: 0.05 });
    if (!reduced) {
      const r = el.getBoundingClientRect();
      burst({ kind: "confetti", colors: [colors[k % colors.length], "#FFFFFF", "#FFE07A"], origin: { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height / 2) / window.innerHeight }, count: 24, spread: 0.16 });
    }
    setPopped((p) => [...p, k]);
  };
  useEffect(() => {
    if (all) cue("chime-cascade", { gain: 0.45, at: 0.3 });
  }, [all, cue]);
  useNext(all ? "Our memories" : null, onNext, "photo");

  return (
    <>
      <Head kicker="Pop them, one by one" title="Things I love about you" sub={all ? "Every single one is true 💗" : `${popped.length} of ${list.length} popped`} />
      <div className="hb-fill">
        {all ? (
          <motion.div className="hb-reasons" initial={reduced ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 220, damping: 22 }}>
            <div className="hb-reasons-gif" aria-hidden>
              {sticker}
            </div>
            <HbScroll className="hb-reasons-scroll" label="Things I love about you">
              <ol className="hb-reasons-list">
                {list.map((r, k) => (
                  <li key={k} style={{ animationDelay: `${120 + k * 90}ms`, ["--b" as string]: colors[k % colors.length] }}>
                    <span className="hb-reasons-n" aria-hidden>
                      🎈
                    </span>
                    <span className="hb-reasons-t">{r}</span>
                  </li>
                ))}
              </ol>
            </HbScroll>
          </motion.div>
        ) : (
          <div className="hb-balloons">
            <div className="hb-balloons-mid">{sticker}</div>
            {list.map((_, k) => {
              const done = popped.includes(k);
              const [x, y] = SPOTS[k];
              return (
                <button
                  key={k}
                  type="button"
                  className={`hb-balloon${done ? " is-popped" : ""}`}
                  style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${-k * 0.8}s`, ["--b" as string]: colors[k % colors.length] }}
                  onClick={(e) => pop(k, e.currentTarget)}
                  disabled={done}
                  aria-label={done ? `Balloon ${k + 1}, popped` : `Pop balloon ${k + 1}`}
                  data-hb-balloon={k}
                >
                  <span className="hb-balloon-body" aria-hidden />
                  <span className="hb-balloon-string" aria-hidden />
                </button>
              );
            })}
          </div>
        )}
      </div>
      <div className="hb-reason" aria-live="polite" hidden={all}>
        {last === null ? (
          <p className="hb-reason-empty">tap a balloon 🎈</p>
        ) : (
          <motion.p key={last} className="hb-reason-t hb-card" initial={reduced ? false : { opacity: 0, y: 12, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 280, damping: 20 }}>
            {list[last]}
          </motion.p>
        )}
      </div>
      <style>{BAL_CSS}</style>
    </>
  );
}

const BAL_CSS = `
.hb-balloons { position: relative; width: min(100cqw, 120cqh, 420px); aspect-ratio: 1 / .92; max-height: 100cqh; }
.hb-balloons-mid { position: absolute; left: 50%; top: 46%; transform: translate(-50%, -50%); }
.hb-balloon { position: absolute; width: clamp(60px, 18cqw, 82px); aspect-ratio: .84; margin: 0; padding: 0; border: 0; background: none; cursor: pointer; transform: translate(-50%, -50%);
  animation: hb-bal 3s ease-in-out infinite alternate; touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
.hb-balloon::before { content: ""; position: absolute; inset: -8px; }
.hb-balloon-body { position: absolute; inset: 0 0 14% 0; border-radius: 50% 50% 47% 47% / 55% 55% 45% 45%;
  background: radial-gradient(circle at 33% 27%, rgba(255,255,255,.95) 0 9%, rgba(255,255,255,.35) 16%, var(--b) 42%, color-mix(in srgb, var(--b) 72%, #000) 100%);
  box-shadow: inset -6px -8px 14px color-mix(in srgb, var(--b) 60%, #000), 0 12px 20px -12px color-mix(in srgb, var(--hb-deep) 60%, transparent); }
.hb-balloon-body::after { content: ""; position: absolute; left: 50%; bottom: -7px; width: 12px; height: 9px; transform: translateX(-50%); background: color-mix(in srgb, var(--b) 85%, #000); clip-path: polygon(50% 0, 100% 100%, 0 100%); }
.hb-balloon-string { position: absolute; left: 50%; top: 86%; width: 2px; height: 34px; background: linear-gradient(180deg, color-mix(in srgb, var(--vw-ink) 45%, transparent), transparent); transform-origin: 50% 0; animation: hb-string 1.4s ease-in-out infinite alternate; }
@keyframes hb-string { from { transform: rotate(-8deg) } to { transform: rotate(8deg) } }
@keyframes hb-bal { from { transform: translate(-50%, -50%) translateY(-7px) rotate(-3deg) } to { transform: translate(-50%, -50%) translateY(7px) rotate(3deg) } }
.hb-balloon.is-popped { animation: hb-burst .32s ease-out forwards; pointer-events: none; }
@keyframes hb-burst { 0% { transform: translate(-50%, -50%) scale(1); opacity: 1 } 40% { transform: translate(-50%, -50%) scale(1.3); opacity: .8 } 100% { transform: translate(-50%, -50%) scale(.2); opacity: 0 } }
.hb-balloon:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 3px; border-radius: 50%; }
.hb-reasons { width: min(100%, 400px); height: 100%; max-height: 100cqh; display: flex; flex-direction: column; align-items: stretch; gap: clamp(8px, 1.4dvh, 12px); min-height: 0; }
.hb-reasons-gif { flex: none; display: grid; place-items: center; padding-top: 4px; }
.hb-reasons-gif .hb-stk img { width: clamp(72px, 14dvh, 104px) !important; height: auto !important; }
.hb-reasons-scroll { flex: 1 1 auto; align-self: stretch; }
.hb-reasons-list { list-style: none; margin: 0; padding: 4px 2px 10px; display: grid; gap: 9px; }
.hb-reasons-list li { margin: 0; box-sizing: border-box; display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 10px; align-items: center; padding: 10px 14px 10px 10px; border-radius: 18px;
  background: var(--vw-paper); box-shadow: 0 0 0 2px var(--vw-edge), inset 5px 0 0 var(--b), 0 8px 16px -12px color-mix(in srgb, var(--hb-deep) 55%, transparent); text-align: left; animation: hb-li-in .4s cubic-bezier(.3,1.4,.5,1) both; }
.hb-reasons-n { font-size: 20px; line-height: 1; padding-left: 4px; }
.hb-reasons-t { font: 600 clamp(19px, 2.6dvh, 22px)/1.2 ${HB_HAND}; color: var(--vw-ink); overflow-wrap: anywhere; }
@keyframes hb-li-in { from { opacity: 0; transform: translateY(10px) scale(.96) } to { opacity: 1; transform: none } }
.hb-reason[hidden] { display: none; }
.hb-reason { flex: none; min-height: clamp(70px, 11dvh, 96px); width: 100%; max-width: 400px; display: grid; place-items: center; }
.hb-reason-empty { margin: 0; font: 700 16px ${HB_DISPLAY}; color: var(--vw-ink-soft); }
.hb-reason-t { margin: 0; width: 100%; padding: 12px 16px; border-radius: 18px; font: 600 clamp(21px, 2.9dvh, 24px)/1.2 ${HB_HAND}; color: var(--vw-ink); overflow-wrap: anywhere; }
@media (prefers-reduced-motion: reduce) { .hb-balloon, .hb-balloon-string { animation: none; } }
`;
