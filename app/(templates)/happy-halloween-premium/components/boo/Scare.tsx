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
// The visual is transform/opacity only; the stage gets a 0.4 s shake. The
// sound is useScare(): the boo through the SFX bus, music.duckFor(2.2 s), a
// haptic. Under reduced motion the zoom and shake calm down (the sound plays
// softer, per the hook).

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotion } from "../../../_valentine/kit";
import { sfx, useScare } from "../../../_valentine/kit/premium";
import { Pumpkin } from "./art";
import { BODY, DISPLAY } from "./fonts";
import { BOO_FRAME_MS, freshGif, GIF, preloadGif } from "./gifs";
import { BN } from "./model";

type Kind = "ghost" | "pumpkin";
interface Call {
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

  return (
    <Ctx.Provider value={api}>
      {children}
      <AnimatePresence>
        {run && (
          <ScareLayer
            key={run.id}
            run={run}
            reduce={reduce}
            onBoo={() => {
              scare();
              shake();
            }}
            onClose={() => {
              const done = run.onDone;
              setRun(null);
              done?.();
            }}
          />
        )}
      </AnimatePresence>
    </Ctx.Provider>
  );
}

function ScareLayer({ run, reduce, onBoo, onClose }: { run: Run; reduce: boolean; onBoo: () => void; onClose: () => void }) {
  const [count, setCount] = useState(run.count);
  const [src, setSrc] = useState<string | null>(null);
  const [phase, setPhase] = useState<"count" | "boo" | "got">(run.count > 0 ? "count" : "boo");
  const fired = useRef(false);
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
    onBoo();
  };

  // Ghost: the sound waits for the image to decode, then lands on the BOO frame.
  // Pumpkin: it turns round (0.18 s) and the boo hits as the face shows.
  const onLoaded = () => {
    if (run.kind === "ghost") later(boo, BOO_FRAME_MS);
    else later(boo, reduce ? 0 : 170);
    later(() => setPhase("got"), run.kind === "ghost" ? 1050 : 1500);
  };
  // Never stall on a slow network: fire anyway.
  useEffect(() => {
    if (phase !== "boo") return;
    const t = window.setTimeout(() => {
      if (!fired.current) {
        boo();
        later(() => setPhase("got"), 900);
      }
    }, 1400);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    if (phase !== "got") return;
    sfx("bn-giggle", { gain: 0.7 });
    const t = window.setTimeout(() => closeRef.current(), 2600);
    return () => window.clearTimeout(t);
  }, [phase]);

  return (
    <motion.div
      className={`bn-scare is-${run.kind} is-${phase}${reduce ? " is-calm" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Boo!"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      onClick={() => phase === "got" && onClose()}
    >
      <span className="bn-scareFlash" aria-hidden />
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
          {run.kind === "pumpkin" && <span className="bn-scareBoo">BOO!</span>}
        </div>
      )}
      {phase === "got" && (
        <motion.div className="bn-scareGot" initial={{ scale: 0.4, y: 40, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 380, damping: 16 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={GIF.panda} alt="" width={150} height={139} className="bn-scarePanda" draggable={false} />
          <p className="bn-scareLine">{run.line || "Got you! 💜"}</p>
          <p className="bn-scareSub">{run.sub || "It's only me. A very friendly ghost."}</p>
        </motion.div>
      )}
    </motion.div>
  );
}

export const SCARE_CSS = `
.bn-scare { position: fixed; inset: 0; z-index: 120; display: grid; place-items: center; overflow: hidden; touch-action: none;
  background: radial-gradient(circle at 50% 55%, rgba(42,31,61,.55), rgba(20,12,36,.92)); -webkit-tap-highlight-color: transparent; }
.bn-scare.is-got { cursor: pointer; background: radial-gradient(circle at 50% 50%, rgba(255,158,196,.5), rgba(42,31,61,.88)); transition: background .5s ease; }
.bn-scareFlash { position: absolute; inset: 0; background: radial-gradient(circle, rgba(255,255,255,.85), rgba(255,255,255,0) 60%); opacity: 0; pointer-events: none; }
.bn-scare.is-ghost.is-boo .bn-scareFlash { animation: bn-flash .5s ease-out .26s both; }
.bn-scare.is-pumpkin.is-boo .bn-scareFlash { background: radial-gradient(circle, rgba(140,255,120,.75), rgba(80,220,90,0) 62%); animation: bn-flash .7s ease-out .16s both; }
@keyframes bn-flash { 0% { opacity: 0 } 15% { opacity: 1 } 100% { opacity: 0 } }
.bn-scareStage { position: relative; width: min(92vw, 62dvh, 520px); aspect-ratio: 1; display: grid; place-items: center; }
.bn-scareGif { position: absolute; inset: 0; display: grid; place-items: center; }
.bn-scareGif img { width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 0 3px #fff) drop-shadow(0 18px 30px rgba(0,0,0,.45)); }
.bn-scare.is-ghost .bn-scareGif { animation: bn-booZoom 1.05s cubic-bezier(.2,.9,.3,1) both; }
@keyframes bn-booZoom { 0% { transform: scale(.42) translateY(30%); opacity: 0 } 10% { opacity: 1 } 24% { transform: scale(.5) translateY(18%) } 30% { transform: scale(1.22) translateY(0) } 38% { transform: scale(1.06) } 100% { transform: scale(1.12) } }
.bn-scareBack { position: absolute; inset: 12%; display: grid; place-items: center; animation: bn-turnAway .2s ease-in both; }
.bn-scareBack svg { width: 100%; height: auto; }
@keyframes bn-turnAway { 0% { transform: scale(.6) rotateY(0); opacity: 1 } 100% { transform: scale(.8) rotateY(90deg); opacity: 0 } }
.bn-scareGif.is-turn { animation: bn-turnIn 1.4s cubic-bezier(.2,.9,.3,1) both; }
@keyframes bn-turnIn { 0% { transform: scale(.8) rotateY(-90deg); opacity: 0 } 12% { transform: scale(.85) rotateY(0); opacity: 1 } 22% { transform: scale(1.3) } 30% { transform: scale(1.1) } 100% { transform: scale(1.14) } }
.bn-scareGif.is-turn img { filter: drop-shadow(0 0 3px #fff) drop-shadow(0 0 40px rgba(120,255,110,.75)); }
.bn-scareBoo { position: absolute; bottom: 2%; font: 400 clamp(56px, 18vw, 110px)/1 ${DISPLAY}; color: #fff; text-shadow: 0 5px 0 ${BN.orangeDeep}, 0 10px 30px rgba(0,0,0,.5); animation: bn-booText .5s cubic-bezier(.3,1.6,.5,1) .17s both; }
@keyframes bn-booText { from { transform: scale(.2) rotate(-12deg); opacity: 0 } to { transform: scale(1) rotate(-4deg); opacity: 1 } }
.bn-scareCount { display: grid; justify-items: center; gap: 10px; color: #fff; text-align: center; padding: 0 24px; }
.bn-scareCount p { margin: 0; font: 800 20px/1.3 ${BODY}; }
.bn-scareCount b { font: 400 140px/1 ${DISPLAY}; color: ${BN.candle}; text-shadow: 0 6px 0 rgba(0,0,0,.3); }
.bn-scareCount small { font: 700 15px/1 ${BODY}; color: #EDE4FF; opacity: .8; }
.bn-scareGot { display: grid; justify-items: center; gap: 8px; padding: 22px 26px 20px; margin: 0 20px; border-radius: 30px; background: ${BN.card}; color: ${BN.ink}; text-align: center; max-width: 340px;
  box-shadow: 0 0 0 4px #fff inset, 0 20px 50px rgba(20,10,40,.5); }
.bn-scarePanda { width: 120px; height: auto; margin-top: -78px; filter: drop-shadow(0 0 2px #fff) drop-shadow(0 0 1px #fff) drop-shadow(0 6px 10px rgba(30,16,60,.35)); }
.bn-scareLine { margin: 0; font: 400 34px/1.05 ${DISPLAY}; color: ${BN.orangeDeep}; }
.bn-scareSub { margin: 0; font: 700 16px/1.35 ${BODY}; color: ${BN.inkSoft}; text-wrap: balance; }
.bn-scare.is-calm .bn-scareGif, .bn-scare.is-calm .bn-scareBack, .bn-scare.is-calm .bn-scareGif.is-turn { animation: none; }
.bn-scare.is-calm .bn-scareFlash { animation: none !important; }
.bn-scare.is-calm .bn-scareBack { display: none; }
`;
