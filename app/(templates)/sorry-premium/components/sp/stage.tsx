"use client";

// The "After the Rain" stage furniture, shared by every scene:
//
//   • SpStage — the context the scenes talk to: the one Next pill, the sound
//     cues (the kit's procedural SFX) and the replay round.
//   • useNext(label, onPress, icon) — a scene declares its way forward; the
//     shell draws ONE glossy pill for it, fixed bottom-centre. Only her tap moves
//     on, and that tap plays the cloud wipe: soft clouds roll in from both sides
//     and meet in the middle, the scene changes behind them, and they part again
//     with a glint of sun.
//   • DropTrail — the progress, top-left: raindrops for the scenes still to
//     come, little suns for the ones she has cleared (tap a sun to go back).
//
// Sounds stay silent until the first tap and whenever the visitor mutes.

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import { useDayMusic } from "../../../_valentine/music/context";
import { useUnlockAudioOnFirstTap } from "../../../_valentine/kit/premium/useScare";
import { sfx, type CueId, type CueOptions } from "../../../_valentine/kit/premium/sfx";
import { FONTS } from "../../../_valentine/theme";
import { SP_DISPLAY } from "./fonts";
import { Sky } from "./ui";

export type NextIcon = "umbrella" | "flower" | "heart" | "cookie" | "star" | "photo" | "boat" | "pen" | "sun" | "rainbow" | "sparkle";

const ICONS: Record<NextIcon, string> = {
  umbrella: "☂️",
  flower: "🌷",
  heart: "💗",
  cookie: "🥠",
  star: "⭐",
  photo: "📸",
  boat: "⛵",
  pen: "🖋️",
  sun: "☀️",
  rainbow: "🌈",
  sparkle: "✨",
};

interface NextSpec {
  label: string;
  icon: NextIcon;
  onPress: () => void;
  /** false: the press does not change the scene (opens WhatsApp etc.), so no wipe. */
  wipe?: boolean;
}

interface SpApi {
  setNext: (s: NextSpec | null) => void;
  cue: (id: CueId, o?: CueOptions) => void;
  /** Changes on every replay — remounts the scenes' GIFs. */
  round: number;
  /** Play the wipe and run `swap` while the screen is covered (replay, the trail). */
  go: (swap: () => void) => number;
}

const Ctx = createContext<SpApi | null>(null);
export function useSp(): SpApi {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSp outside SpStage");
  return v;
}

/** A scene's way forward. `null` hides the pill until the scene's moment is done. */
export function useNext(label: string | null, onPress: () => void, icon: NextIcon = "heart", wipe = true) {
  const { setNext } = useSp();
  const fn = useRef(onPress);
  useLayoutEffect(() => {
    fn.current = onPress;
  });
  useEffect(() => {
    setNext(label ? { label, icon, wipe, onPress: () => fn.current() } : null);
  }, [label, icon, wipe, setNext]);
  useEffect(() => () => setNext(null), [setNext]);
}

const WIPE = { full: 900, soft: 460 } as const;
const COVER_AT = 0.48;

export interface SkyState {
  /** 0 drizzle → 1 sunshine. A finished scene (its pill showing) clears a little more. */
  sun: number;
  rainbow: boolean;
  petals: boolean;
  chars: readonly string[];
}

export function SpStage({
  round,
  trail,
  sky,
  children,
}: {
  round: number;
  trail: { at: number; rooms: number; ending: boolean; onJump: (k: number) => void };
  sky: SkyState;
  children: ReactNode;
}) {
  const music = useDayMusic();
  useUnlockAudioOnFirstTap();
  const reduced = useReducedMotion();
  const [next, setNextState] = useState<NextSpec | null>(null);
  const [run, setRun] = useState<{ id: number; soft: boolean; dur: number } | null>(null);
  const [blocked, setBlocked] = useState(false);
  const busy = useRef(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const ts = timers.current;
    return () => ts.forEach((t) => window.clearTimeout(t));
  }, []);

  const quiet = !!music && (music.mode === "off" || music.userOff);
  const cue = useCallback(
    (id: CueId, o?: CueOptions) => {
      if (!quiet) sfx(id, o);
    },
    [quiet],
  );

  const gen = useRef(0);
  const setNext = useCallback((s: NextSpec | null) => {
    gen.current += 1;
    setNextState(s);
  }, []);

  const go = useCallback(
    (swap: () => void): number => {
      if (busy.current) return 0;
      busy.current = true;
      const soft = reduced;
      const dur = soft ? WIPE.soft : WIPE.full;
      const coverAt = Math.round(dur * COVER_AT);
      const at = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));
      if (!soft) {
        cue("swoosh-soft", { gain: 0.4 });
        cue("chime", { gain: 0.28, at: coverAt / 1000 + 0.06, detune: 200 });
        at(coverAt, () => haptic(10));
      }
      setRun({ id: performance.now(), soft, dur });
      setBlocked(true);
      at(coverAt, swap);
      at(Math.round(dur * 0.72), () => setBlocked(false));
      at(dur + 40, () => {
        setRun(null);
        busy.current = false;
      });
      return dur;
    },
    [reduced, cue],
  );

  const press = () => {
    if (!next || busy.current) return;
    haptic(12);
    cue("pop", { gain: 0.45 });
    const spec = next;
    setNextState(null);
    const g0 = gen.current;
    const restore = (ms: number) =>
      window.setTimeout(() => {
        if (gen.current === g0) setNextState(spec);
      }, ms);
    if (spec.wipe === false) {
      spec.onPress();
      restore(900);
      return;
    }
    restore(go(spec.onPress) + 250);
  };

  const api = useMemo<SpApi>(() => ({ setNext, cue, round, go }), [setNext, cue, round, go]);

  return (
    <Ctx.Provider value={api}>
      <Sky sun={Math.min(1, sky.sun + (next && sky.sun < 1 ? 0.06 : 0))} rainbow={sky.rainbow} petals={sky.petals} chars={sky.chars} />
      <DropTrail at={trail.at} rooms={trail.rooms} ending={trail.ending} onJump={(k) => go(() => trail.onJump(k))} />
      {children}
      <NextPill spec={next} onPress={press} />
      {run && <CloudWipe key={run.id} soft={run.soft} dur={run.dur} />}
      {blocked && <div className="sp-wipe-block" aria-hidden />}
    </Ctx.Provider>
  );
}

/** Puffs per side: [top %, size vmax, delay ms]. They roll in, meet, and part. */
const PUFFS: readonly (readonly [number, number, number])[] = [
  [-6, 62, 0],
  [18, 70, 40],
  [44, 76, 0],
  [70, 70, 60],
  [94, 64, 20],
];

function CloudWipe({ soft, dur }: { soft: boolean; dur: number }) {
  if (soft) return <div className="sp-wipe is-soft" style={{ ["--sp-wipe" as string]: `${dur}ms` }} aria-hidden />;
  return (
    <div className="sp-wipe" style={{ ["--sp-wipe" as string]: `${dur}ms` }} aria-hidden>
      {PUFFS.map(([top, size, d], k) => (
        <span key={`l${k}`} className="sp-puff is-l" style={{ top: `${top}%`, width: `${size}vmax`, height: `${size}vmax`, animationDelay: `${d}ms` }} />
      ))}
      {PUFFS.map(([top, size, d], k) => (
        <span key={`r${k}`} className="sp-puff is-r" style={{ top: `${top + 8}%`, width: `${size}vmax`, height: `${size}vmax`, animationDelay: `${d + 30}ms` }} />
      ))}
      <span className="sp-wipe-glint">☀️</span>
    </div>
  );
}

function NextPill({ spec, onPress }: { spec: NextSpec | null; onPress: () => void }) {
  const [shown, setShown] = useState<NextSpec | null>(spec);
  if (spec && spec !== shown) setShown(spec);
  const s = spec ?? shown;
  return (
    <div className="sp-next-wrap">
      <button type="button" className={`sp-next${spec ? "" : " is-hidden"}`} onClick={onPress} disabled={!spec} aria-hidden={!spec} tabIndex={spec ? 0 : -1} data-sp-next>
        <span className="sp-next-gloss" aria-hidden />
        {spec && <span key={spec.label} className="sp-next-ring" aria-hidden />}
        <span className="sp-next-ico" aria-hidden>
          {ICONS[s?.icon ?? "heart"]}
        </span>
        <span className="sp-next-label">{s?.label ?? ""}</span>
        <span className="sp-next-arrow" aria-hidden>
          ›
        </span>
      </button>
    </div>
  );
}

/** Raindrops to go, suns for the scenes she has cleared (tap a sun to go back). */
function DropTrail({ at, rooms, ending, onJump }: { at: number; rooms: number; ending: boolean; onJump: (k: number) => void }) {
  return (
    <nav className="sp-trail" aria-label={`Step ${Math.min(at + 1, rooms)} of ${rooms}`}>
      {Array.from({ length: rooms }, (_, k) => {
        const done = k < at || ending;
        const here = k === at && !ending;
        return (
          <button
            key={k}
            type="button"
            className={`sp-tk${done ? " is-done" : ""}${here ? " is-here" : ""}`}
            aria-label={done ? `Back to step ${k + 1}` : here ? `Step ${k + 1}, you are here` : `Step ${k + 1}, not yet`}
            aria-current={here ? "step" : undefined}
            disabled={!done}
            onClick={() => {
              if (!done) return;
              haptic(10);
              onJump(k);
            }}
          >
            <svg viewBox="0 0 24 24" width="100%" aria-hidden>
              {done ? (
                <g>
                  <circle cx="12" cy="12" r="5.2" fill="#FFD45E" stroke="#F0A93A" strokeWidth="1.4" />
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
                    <line key={a} x1="12" y1="2.6" x2="12" y2="4.9" stroke="#F0A93A" strokeWidth="1.8" strokeLinecap="round" transform={`rotate(${a} 12 12)`} />
                  ))}
                </g>
              ) : (
                <path
                  d="M12 2.5 C12 2.5 5.5 10 5.5 14.5 a6.5 6.5 0 0 0 13 0 C18.5 10 12 2.5 12 2.5 Z"
                  fill={here ? "var(--vw-accent, #E0567B)" : "none"}
                  stroke={here ? "var(--vw-accent-deep, #B5365A)" : "var(--vw-gold, #F4A7BB)"}
                  strokeWidth="2"
                />
              )}
            </svg>
          </button>
        );
      })}
    </nav>
  );
}

export const SP_STAGE_CSS = `
.sp-scene { position: relative; z-index: 2; box-sizing: border-box; height: 100vh; height: 100dvh;
  display: flex; flex-direction: column; align-items: center; text-align: center; gap: clamp(10px, 2dvh, 20px);
  padding: calc(env(safe-area-inset-top, 0px) + clamp(64px, 9dvh, 80px)) 20px max(calc(env(safe-area-inset-bottom, 0px) + 96px), var(--vw-dock-space, 0px));
  width: 100%; max-width: calc(520px * var(--vw-s, 1)); margin: 0 auto; overflow: hidden; color: var(--vw-ink); }
@media (min-width: 768px) { .sp-scene { max-width: 700px; padding-top: calc(var(--vw-top-space, 0px) + 72px); padding-bottom: 116px; gap: clamp(12px, 2.2dvh, 24px); } }
@media (min-width: 1100px) { .sp-scene { max-width: min(780px, 58vw); padding-top: 84px; } }
@media (min-width: 1100px) { .sp-zoom { zoom: 1.14; } }
@media (min-width: 1100px) and (min-height: 1000px) { .sp-zoom { zoom: 1.28; } }
.sp-fill { position: relative; flex: 1 1 0; min-height: 0; width: 100%; container-type: size; display: grid; grid-template: minmax(0, 1fr) / minmax(0, 1fr); place-items: center; }

.sp-head { flex: none; display: grid; gap: 4px; justify-items: center; max-width: 460px; }
.sp-kick { margin: 0; display: inline-flex; align-items: center; gap: 6px; padding: 3px 11px; border-radius: 99px; font: 700 clamp(11px, 1.6dvh, 12.5px)/1.3 ${FONTS.ui}; letter-spacing: .14em; text-transform: uppercase;
  color: var(--vw-accent-deep); background: color-mix(in srgb, var(--vw-paper) 72%, transparent); box-shadow: 0 0 0 1.5px var(--vw-edge); }
.sp-title { margin: 0; font: 800 clamp(28px, min(8.4vw, 4.9dvh), 44px)/1.06 ${SP_DISPLAY}; color: var(--vw-ink); text-wrap: balance; overflow-wrap: anywhere; }
.sp-sub { margin: 0; font: 500 clamp(14px, 2.1dvh, 16.5px)/1.45 ${FONTS.ui}; color: var(--vw-ink-soft); text-wrap: balance; overflow-wrap: anywhere; }
@media (min-width: 1100px) { .sp-title { font-size: clamp(38px, 5dvh, 54px); } .sp-sub { font-size: 17px; } }
.sp-hint { flex: none; margin: 0; min-height: 22px; font: 700 clamp(15px, 2.2dvh, 18px) ${SP_DISPLAY}; color: var(--vw-accent-deep); }

.sp-next-wrap { position: fixed; z-index: 60; left: 0; right: 0; bottom: calc(env(safe-area-inset-bottom, 0px) + 18px);
  display: flex; justify-content: center; pointer-events: none; padding: 0 62px; box-sizing: border-box; }
@media (min-width: 768px) { .sp-next-wrap { bottom: 30px; } }
.sp-next { pointer-events: auto; position: relative; display: inline-flex; align-items: center; gap: 9px; height: 56px; max-width: 100%; min-width: 0; padding: 0 20px 0 7px;
  border: 0; border-radius: 999px; cursor: pointer; color: #FFFFFF;
  background: linear-gradient(180deg, color-mix(in srgb, var(--vw-accent) 70%, #FFFFFF) 0%, var(--vw-accent) 52%, var(--vw-accent-deep) 100%);
  box-shadow: 0 5px 0 var(--sp-deep), 0 0 0 4px color-mix(in srgb, var(--vw-paper) 72%, transparent), 0 16px 30px -10px color-mix(in srgb, var(--sp-deep) 70%, transparent);
  transition: transform .45s cubic-bezier(.2,.9,.25,1.2), opacity .3s ease, box-shadow .2s ease; touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
.sp-next.is-hidden { opacity: 0; transform: translateY(18px) scale(.9); pointer-events: none; transition-duration: .25s; }
.sp-next:active { transform: translateY(4px) scale(.97); box-shadow: 0 1px 0 var(--sp-deep), 0 0 0 4px color-mix(in srgb, var(--vw-paper) 72%, transparent); transition-duration: .08s; }
.sp-next:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 4px; }
.sp-next-gloss { position: absolute; left: 14px; right: 14px; top: 4px; height: 40%; border-radius: 999px; background: linear-gradient(180deg, rgba(255,255,255,.55), rgba(255,255,255,0)); pointer-events: none; }
.sp-next-ring { position: absolute; inset: -3px; border-radius: inherit; border: 3px solid var(--vw-accent); opacity: 0; pointer-events: none; animation: sp-ring 1.9s ease-out 2s infinite; }
@keyframes sp-ring { 0% { opacity: .8; transform: scale(1) } 100% { opacity: 0; transform: scale(1.12, 1.5) } }
.sp-next-ico { position: relative; width: 42px; height: 42px; flex: none; border-radius: 50%; display: grid; place-items: center; font-size: 22px; line-height: 1;
  background: radial-gradient(circle at 40% 35%, #FFFFFF, var(--sp-blush)); box-shadow: inset 0 -3px 0 color-mix(in srgb, var(--sp-deep) 22%, transparent), 0 2px 6px color-mix(in srgb, var(--sp-deep) 40%, transparent); animation: sp-bob 1.3s ease-in-out infinite alternate; }
@keyframes sp-bob { from { transform: translateY(-2px) rotate(-9deg) } to { transform: translateY(2px) rotate(9deg) } }
.sp-next-label { position: relative; min-width: 0; font: 800 18.5px/1.2 ${SP_DISPLAY}; padding-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-shadow: 0 1px 0 color-mix(in srgb, var(--sp-deep) 60%, transparent); }
.sp-next-arrow { position: relative; font: 700 26px/1 ${FONTS.ui}; margin-left: 2px; margin-top: -3px; }
@media (min-width: 1100px) { .sp-next-wrap .sp-next { transform: scale(1.1); transform-origin: 50% 100%; } .sp-next-wrap .sp-next.is-hidden { transform: translateY(18px); } }

.sp-trail { position: fixed; z-index: 62; top: calc(max(10px, env(safe-area-inset-top, 0px)) + 8px); left: max(12px, env(safe-area-inset-left, 0px));
  display: flex; align-items: center; gap: 1px; height: 30px; padding: 0 6px; border-radius: 99px; box-sizing: border-box;
  background: color-mix(in srgb, var(--vw-paper) 82%, transparent); border: 1.5px solid var(--vw-edge);
  box-shadow: 0 6px 16px -8px color-mix(in srgb, var(--sp-deep) 50%, transparent); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
@media (min-width: 768px) { .sp-trail { top: 22px; left: 24px; height: 36px; } }
.sp-tk { width: 17px; height: 30px; padding: 0; margin: 0; border: 0; background: none; display: grid; place-items: center; touch-action: manipulation; -webkit-tap-highlight-color: transparent; position: relative; color: inherit; }
.sp-tk:disabled { cursor: default; opacity: .8; }
.sp-tk.is-done { cursor: pointer; }
.sp-tk.is-done::after { content: ""; position: absolute; inset: -7px -1px; }
.sp-tk.is-done:hover svg { transform: scale(1.18) rotate(20deg); }
.sp-tk svg { transition: transform .2s ease; }
.sp-tk.is-here svg { animation: sp-tk-drip 1.4s ease-in-out infinite; }
@keyframes sp-tk-drip { 0%, 100% { transform: translateY(-1px) } 50% { transform: translateY(2px) scale(.94, 1.06) } }
@media (max-width: 479px) { .sp-tk { width: 13px; } .sp-trail { padding: 0 5px; } }
@media (max-width: 359px) { .sp-tk { width: 11px; } }
@media (min-width: 768px) { .sp-tk { width: 21px; height: 36px; } }
.sp-tk:focus-visible { outline: 2px solid var(--vw-ink); outline-offset: -2px; border-radius: 8px; }
body .vm-icon { bottom: calc(env(safe-area-inset-bottom, 0px) + 26px); }
@media (min-width: 768px) { body .vm-icon { left: 24px; bottom: 38px; } }

/* The cloud wipe: puffs roll in from both sides, meet, then part. Transform/opacity only. */
.sp-wipe { position: fixed; inset: 0; z-index: 74; pointer-events: none; overflow: hidden; contain: strict; }
.sp-puff { position: absolute; border-radius: 50%; will-change: transform;
  background: radial-gradient(circle at 42% 38%, #FFFFFF 0%, var(--vw-paper) 46%, var(--sp-blush) 100%);
  box-shadow: inset -10px -14px 30px color-mix(in srgb, var(--vw-gold) 30%, transparent); animation: sp-puff-l var(--sp-wipe) cubic-bezier(.6,0,.35,1) both; }
.sp-puff.is-l { left: 0; translate: -50% -50%; }
.sp-puff.is-r { right: 0; translate: 50% -50%; animation-name: sp-puff-r; }
@keyframes sp-puff-l { 0% { transform: translateX(-80vw) scale(.8) } 46%, 54% { transform: translateX(42vw) scale(1) } 100% { transform: translateX(-90vw) scale(.85) } }
@keyframes sp-puff-r { 0% { transform: translateX(80vw) scale(.8) } 46%, 54% { transform: translateX(-42vw) scale(1) } 100% { transform: translateX(90vw) scale(.85) } }
.sp-wipe-glint { position: absolute; left: 50%; top: 50%; font-size: 64px; line-height: 1; translate: -50% -50%; opacity: 0; animation: sp-glint var(--sp-wipe) ease-out both; }
@keyframes sp-glint { 0%, 40% { opacity: 0; transform: scale(.3) rotate(-40deg) } 55% { opacity: 1; transform: scale(1.1) rotate(0) } 80% { opacity: 0; transform: scale(1.6) rotate(30deg) } 100% { opacity: 0 } }
.sp-wipe.is-soft { background: var(--vw-paper, #FFF); opacity: 0; animation: sp-soft var(--sp-wipe) ease-in-out forwards; }
@keyframes sp-soft { 0% { opacity: 0 } 45% { opacity: 1 } 100% { opacity: 0 } }
.sp-wipe-block { position: fixed; inset: 0; z-index: 75; }
@media (prefers-reduced-motion: reduce) { .sp-next-ico, .sp-next-ring, .sp-tk.is-here svg { animation: none; } }
`;
