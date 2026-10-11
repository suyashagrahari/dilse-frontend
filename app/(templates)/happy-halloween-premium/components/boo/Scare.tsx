"use client";

// The jump-scares (Halloween v4). Every scare is earned by a tap and followed
// by a cute recovery; kids pages get none (`enabled` false).
//
//   const boo = useBoo();
//   boo.ghost({ line, sub, onDone })      full screen: pumpkin-ghost-boo.webp from frame 0,
//                                         the boo sample lands on its "BOO!" frame
//   boo.pumpkin({ line, sub, onDone })    full screen: a pumpkin turns round and lights up
//   boo.countdown({ … })                  "turn the screen to your boo · 3 2 1" → ghost
//   boo.sound(delayMs?)                   just the sample + duck + buzz (scenes with their own visual)
//
// v9: every scare is the BOO alone on a dark blurred veil (no words, no "got you"
// card): it pops, shakes on the BOO frame and fades by itself after ~1.7 s, then
// onDone runs. `line` / `sub` are kept for callers but no longer drawn.
// The visual is transform/opacity only; the GIF gets a 0.5 s shake. The
// sound is useScare(): the boo through the SFX bus, music.duckFor(2.2 s), a
// haptic. Under reduced motion the zoom and shake calm down (the sound plays
// softer, per the hook).

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotion } from "../../../_valentine/kit";
import { sfx, useScare } from "../../../_valentine/kit/premium";
import { Pumpkin } from "./art";
import { BN_FONT_VARS, BODY, DISPLAY } from "./fonts";
import { BOO_FRAME_MS, freshGif, GIF, preloadGif } from "./gifs";
import { BN } from "./model";

type Kind = "ghost" | "pumpkin";
interface Call {
  /** Unused since v9 (the BOO overlay has no words). */
  line?: string;
  sub?: string;
  onDone?: () => void;
}
interface Run extends Call {
  id: number;
  kind: Kind;
  count: number;
}

interface BooApi {
  enabled: boolean;
  ghost: (c?: Call) => void;
  pumpkin: (c?: Call) => void;
  countdown: (c?: Call) => void;
  /** Warm the next copy of a scare GIF (call where a scare is coming). */
  warm: () => void;
  sound: (delayMs?: number) => void;
  /** Shake the stage (transform only). */
  shake: () => void;
  busy: boolean;
}

const Ctx = createContext<BooApi | null>(null);
const NOOP: BooApi = { enabled: false, ghost: (c) => c?.onDone?.(), pumpkin: (c) => c?.onDone?.(), countdown: (c) => c?.onDone?.(), warm: () => {}, sound: () => {}, shake: () => {}, busy: false };

const noSub = () => () => {};

export function useBoo(): BooApi {
  return useContext(Ctx) ?? NOOP;
}

export function BooProvider({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  const scare = useScare();
  const reduce = useReducedMotion();
  const [run, setRun] = useState<Run | null>(null);
  const ids = useRef(0);

  useEffect(() => {
    if (!enabled) return;
    // Warm the two scare GIFs once the night is open (≈ 0.8 MB, idle-time).
    const t = window.setTimeout(() => {
      preloadGif(GIF.pumpkinBoo);
    }, 1500);
    return () => window.clearTimeout(t);
  }, [enabled]);

  const shake = useCallback(() => {
    if (reduce) return;
    const el = document.querySelector<HTMLElement>(".bn-stage");
    el?.animate?.(
      [
        { transform: "translate(0,0)" },
        { transform: "translate(-7px,4px) rotate(-.6deg)" },
        { transform: "translate(6px,-5px) rotate(.6deg)" },
        { transform: "translate(-5px,3px)" },
        { transform: "translate(3px,-2px)" },
        { transform: "translate(0,0)" },
      ],
      { duration: 420, easing: "ease-out" },
    );
  }, [reduce]);

  const sound = useCallback(
    (delayMs = 0) => {
      if (!enabled) return;
      if (delayMs <= 0) scare();
      else window.setTimeout(() => scare(), delayMs);
    },
    [enabled, scare],
  );

  const start = useCallback(
    (kind: Kind, c: Call = {}, count = 0) => {
      if (!enabled) {
        c.onDone?.();
        return;
      }
      ids.current += 1;
      setRun({ ...c, kind, count, id: ids.current });
    },
    [enabled],
  );

  const api = useMemo<BooApi>(
    () => ({
      enabled,
      ghost: (c) => start("ghost", c),
      pumpkin: (c) => start("pumpkin", c),
      countdown: (c) => start("ghost", c, 3),
      warm: () => enabled && preloadGif(GIF.pumpkinBoo),
      sound,
      shake,
      busy: !!run,
    }),
    [enabled, start, sound, shake, run],
  );

  // The veil is portalled to <body>: the template root is `isolation: isolate`, so
  // drawn in place it could never cover the editor's top bar or the music icon.
  const client = useSyncExternalStore(noSub, () => true, () => false);

  const layer = (
    <AnimatePresence>
        {run && (
          <ScareLayer
            key={run.id}
            run={run}
            reduce={reduce}
            onBoo={() => {
              scare();
            }}
            onClose={() => {
              const done = run.onDone;
              setRun(null);
              done?.();
            }}
          />
        )}
    </AnimatePresence>
  );

  return (
    <Ctx.Provider value={api}>
      {children}
      {client ? createPortal(layer, document.body) : layer}
    </Ctx.Provider>
  );
}

/** How long the BOO stays up after its GIF paints (then it fades and the night carries on). */
const DWELL_MS: Record<Kind, number> = { ghost: 1500, pumpkin: 1650 };

function ScareLayer({ run, reduce, onBoo, onClose }: { run: Run; reduce: boolean; onBoo: () => void; onClose: () => void }) {
  const [count, setCount] = useState(run.count);
  const [src, setSrc] = useState<string | null>(null);
  const [phase, setPhase] = useState<"count" | "boo">(run.count > 0 ? "count" : "boo");
  const [hit, setHit] = useState(false);
  const fired = useRef(false);
  const closed = useRef(false);
  const loaded = useRef(false);
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  useEffect(() => {
    const t = timers.current;
    return () => t.forEach((x) => window.clearTimeout(x));
  }, []);
  const close = () => {
    if (closed.current) return;
    closed.current = true;
    closeRef.current();
  };

  // 3 · 2 · 1 (the "scare your boo" button)
  useEffect(() => {
    if (phase !== "count") return;
    if (count <= 0) {
      setPhase("boo");
      return;
    }
    sfx("tick", { gain: 0.35 });
    const t = window.setTimeout(() => setCount((c) => c - 1), 850);
    return () => window.clearTimeout(t);
  }, [phase, count]);

  // A fresh copy of the GIF (frame 0) for this play.
  useEffect(() => {
    if (phase !== "boo") return;
    setSrc(freshGif(run.kind === "ghost" ? GIF.pumpkinBoo : GIF.pumpkinLight));
  }, [phase, run.kind]);

  const boo = () => {
    if (fired.current) return;
    fired.current = true;
    setHit(true);
    onBoo();
  };

  // Ghost: the sound waits for the image to decode, then lands on the BOO frame.
  // Pumpkin: it turns round (0.18 s) and the boo hits as the face shows.
  // Then the BOO holds for a beat, fades, and the night carries on (onDone).
  const onLoaded = () => {
    if (loaded.current) return;
    loaded.current = true;
    if (run.kind === "ghost") later(boo, BOO_FRAME_MS);
    else later(boo, reduce ? 0 : 170);
    later(close, DWELL_MS[run.kind]);
  };
  // Never stall on a slow network: fire anyway.
  useEffect(() => {
    if (phase !== "boo") return;
    const t = window.setTimeout(() => {
      if (!fired.current) {
        boo();
        later(close, 900);
      }
    }, 1400);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  return (
    <motion.div
      className={`bn-scare ${BN_FONT_VARS} is-${run.kind} is-${phase}${hit ? " is-hit" : ""}${reduce ? " is-calm" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Boo!"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: reduce ? 0.12 : 0.16 } }}
      exit={{ opacity: 0, transition: { duration: reduce ? 0.2 : 0.38, ease: "easeOut" } }}
      // a tap after the BOO has landed lets her skip the rest of it
      onClick={() => fired.current && close()}
    >
      <span className="bn-scareGlow" aria-hidden />
      {phase === "count" && (
        <div className="bn-scareCount">
          <p>Turn the screen to your boo 👀</p>
          <AnimatePresence mode="popLayout">
            <motion.b key={count} initial={{ scale: 2.2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }} transition={{ type: "spring", stiffness: 420, damping: 18 }}>
              {count}
            </motion.b>
          </AnimatePresence>
          <small>hold it close… closer…</small>
        </div>
      )}
      {phase === "boo" && (
        <div className="bn-scareStage">
          {run.kind === "pumpkin" && (
            <span className="bn-scareBack" aria-hidden>
              <Pumpkin eyes={null} mouth={null} lit={false} size={300} />
            </span>
          )}
          {src && (
            <span className={`bn-scareGif${run.kind === "pumpkin" ? " is-turn" : ""}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" width={360} height={360} decoding="sync" onLoad={onLoaded} onError={onLoaded} draggable={false} />
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}

// v9 (owner, 11 Oct): the BOO is the only thing on screen. A dark, blurred veil over
// everything (the top bar, the pumpkin trail and the music icon included), the GIF
// big in the middle with a pop and a shake on the BOO frame, no words; it fades by
// itself after ~1.7 s (a tap skips it once the BOO has landed).
export const SCARE_CSS = `
.bn-scare { position: fixed; inset: 0; z-index: 2147482000; display: grid; place-items: center; overflow: hidden; touch-action: none; cursor: pointer;
  background: rgba(8,6,16,.72); -webkit-backdrop-filter: blur(12px) saturate(.9); backdrop-filter: blur(12px) saturate(.9); -webkit-tap-highlight-color: transparent; }
.bn-scareGlow { position: absolute; left: 50%; top: 50%; width: min(120vw, 760px); aspect-ratio: 1; translate: -50% -50%; border-radius: 50%; pointer-events: none; opacity: .35;
  background: radial-gradient(circle, rgba(255,138,61,.30), rgba(155,123,255,.16) 42%, rgba(155,123,255,0) 68%); transition: opacity .25s ease; }
.bn-scare.is-pumpkin .bn-scareGlow { background: radial-gradient(circle, rgba(140,255,120,.26), rgba(155,123,255,.12) 45%, rgba(155,123,255,0) 68%); }
.bn-scare.is-hit .bn-scareGlow { opacity: 1; animation: bn-glowHit .7s ease-out both; }
@keyframes bn-glowHit { 0% { opacity: .35; scale: .8 } 25% { opacity: 1; scale: 1.08 } 100% { opacity: .75; scale: 1 } }
.bn-scareStage { position: relative; width: min(74vw, 360px, 58dvh); aspect-ratio: 1; display: grid; place-items: center; }
@media (min-width: 768px) { .bn-scareStage { width: min(420px, 60dvh); } }
.bn-scareGif { position: absolute; inset: 0; display: grid; place-items: center; }
.bn-scareGif img { width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 0 2px rgba(255,255,255,.9)) drop-shadow(0 18px 34px rgba(0,0,0,.55)); }
.bn-scare.is-ghost .bn-scareGif { animation: bn-booPop .42s cubic-bezier(.18,1.5,.4,1) both; }
@keyframes bn-booPop { 0% { transform: scale(.3); opacity: 0 } 35% { opacity: 1 } 70% { transform: scale(1.08) } 100% { transform: scale(1) } }
/* the shake lands with the sound, on the BOO frame */
.bn-scare.is-hit .bn-scareStage { animation: bn-booShake .48s cubic-bezier(.36,.07,.19,.97) both; }
@keyframes bn-booShake { 0%, 100% { transform: translate(0,0) rotate(0) scale(1) }
  10% { transform: translate(-9px,3px) rotate(-2.2deg) scale(1.06) } 25% { transform: translate(8px,-4px) rotate(2deg) scale(1.05) }
  40% { transform: translate(-7px,2px) rotate(-1.4deg) scale(1.03) } 55% { transform: translate(5px,-2px) rotate(1deg) }
  70% { transform: translate(-3px,1px) rotate(-.5deg) } 85% { transform: translate(1px,0) } }
.bn-scareBack { position: absolute; inset: 12%; display: grid; place-items: center; animation: bn-turnAway .2s ease-in both; }
.bn-scareBack svg { width: 100%; height: auto; }
@keyframes bn-turnAway { 0% { transform: scale(.6) rotateY(0); opacity: 1 } 100% { transform: scale(.8) rotateY(90deg); opacity: 0 } }
.bn-scareGif.is-turn { animation: bn-turnIn .6s cubic-bezier(.2,1.4,.4,1) both; }
@keyframes bn-turnIn { 0% { transform: scale(.8) rotateY(-90deg); opacity: 0 } 30% { transform: scale(.9) rotateY(0); opacity: 1 } 65% { transform: scale(1.1) } 100% { transform: scale(1) } }
.bn-scareGif.is-turn img { filter: drop-shadow(0 0 2px rgba(255,255,255,.9)) drop-shadow(0 0 40px rgba(120,255,110,.6)); }
.bn-scareCount { position: relative; display: grid; justify-items: center; gap: 10px; color: #fff; text-align: center; padding: 0 24px; }
.bn-scareCount p { margin: 0; font: 800 20px/1.3 ${BODY}; }
.bn-scareCount b { font: 400 140px/1 ${DISPLAY}; color: ${BN.candle}; text-shadow: 0 6px 0 rgba(0,0,0,.3); }
.bn-scareCount small { font: 700 15px/1 ${BODY}; color: #EDE4FF; opacity: .8; }
.bn-scare.is-calm .bn-scareGif, .bn-scare.is-calm .bn-scareBack, .bn-scare.is-calm .bn-scareGif.is-turn, .bn-scare.is-calm.is-hit .bn-scareStage, .bn-scare.is-calm .bn-scareGlow { animation: none !important; }
.bn-scare.is-calm .bn-scareBack { display: none; }
`;
