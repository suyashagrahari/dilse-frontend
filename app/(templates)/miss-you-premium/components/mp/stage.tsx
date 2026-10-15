"use client";

// The stage furniture every scene shares:
//
//   • MpStage — the context the scenes talk to: the one Next pill, the little
//     sound cues (the kit's procedural SFX), the replay round, and `go`.
//   • useNext(label, onPress, icon) — a scene declares its way forward; the
//     shell draws ONE airmail-striped pill, fixed bottom-centre. Only her tap
//     moves on, and that tap plays the cloud wipe: two banks of pastel clouds
//     roll in from both sides, meet (two little dots kiss in the middle), and
//     part on the next scene.
//   • DistanceTrail — top-left: a back button and a tiny map where her dot and
//     the sender's dot creep toward each other scene by scene while the
//     kilometres count down; they meet at the finale.
//
// Sounds stay silent until the first tap and whenever the visitor mutes.

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import { useDayMusic } from "../../../_valentine/music/context";
import { useUnlockAudioOnFirstTap } from "../../../_valentine/kit/premium/useScare";
import { sfx, type CueId, type CueOptions } from "../../../_valentine/kit/premium/sfx";
import { FONTS } from "../../../_valentine/theme";
import { MP_DISPLAY } from "./fonts";

export type NextIcon = "sun" | "radio" | "photo" | "picnic" | "calendar" | "bottle" | "heart" | "star" | "phone" | "mail" | "sparkle";

const ICONS: Record<NextIcon, string> = {
  sun: "☀️",
  radio: "📻",
  photo: "📸",
  picnic: "🧺",
  calendar: "📅",
  bottle: "🍾",
  heart: "💗",
  star: "⭐",
  phone: "📞",
  mail: "💌",
  sparkle: "✨",
};

interface NextSpec {
  label: string;
  icon: NextIcon;
  onPress: () => void;
  /** false: the press does not change the scene (opens WhatsApp etc.), so no wipe. */
  wipe?: boolean;
}

interface MpApi {
  setNext: (s: NextSpec | null) => void;
  cue: (id: CueId, o?: CueOptions) => void;
  /** Changes on every replay — remounts the scenes' GIFs. */
  round: number;
  /** Play the wipe and run `swap` while the screen is covered (replay, back). */
  go: (swap: () => void) => number;
  /** Is the sound on (not muted)? */
  loud: boolean;
}

const Ctx = createContext<MpApi | null>(null);
export function useMp(): MpApi {
  const v = useContext(Ctx);
  if (!v) throw new Error("useMp outside MpStage");
  return v;
}

/** A scene's way forward. `null` hides the pill until the scene's moment is done. */
export function useNext(label: string | null, onPress: () => void, icon: NextIcon = "heart", wipe = true) {
  const { setNext } = useMp();
  const fn = useRef(onPress);
  useLayoutEffect(() => {
    fn.current = onPress;
  });
  useEffect(() => {
    setNext(label ? { label, icon, wipe, onPress: () => fn.current() } : null);
  }, [label, icon, wipe, setNext]);
  useEffect(() => () => setNext(null), [setNext]);
}

const WIPE = { full: 980, soft: 480 } as const;
const COVER_AT = 0.48;

export interface TrailSpec {
  at: number;
  rooms: number;
  ending: boolean;
  /** null when the two cities are unknown. Always km. */
  km: number | null;
  unit: "km" | "mi";
  onBack: () => void;
}

export function MpStage({ round, trail, children }: { round: number; trail: TrailSpec; children: ReactNode }) {
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
        cue("whoosh", { gain: 0.3 });
        cue("chime", { gain: 0.32, at: coverAt / 1000 - 0.05 });
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
    cue("pop", { gain: 0.5 });
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

  const api = useMemo<MpApi>(() => ({ setNext, cue, round, go, loud: !quiet }), [setNext, cue, round, go, quiet]);

  return (
    <Ctx.Provider value={api}>
      <DistanceTrail {...trail} onBack={() => go(trail.onBack)} />
      {children}
      <NextPill spec={next} onPress={press} />
      {run && <CloudWipe key={run.id} soft={run.soft} dur={run.dur} />}
      {blocked && <div className="mp-wipe-block" aria-hidden />}
    </Ctx.Provider>
  );
}

/** Two banks of clouds roll in from both sides, the dots kiss in the middle, then the clouds part. */
function CloudWipe({ soft, dur }: { soft: boolean; dur: number }) {
  if (soft) return <div className="mp-wipe is-soft" style={{ ["--mp-wipe" as string]: `${dur}ms` }} aria-hidden />;
  return (
    <div className="mp-wipe" style={{ ["--mp-wipe" as string]: `${dur}ms` }} aria-hidden>
      <span className="mp-wipe-wash" />
      <span className="mp-wipe-bank is-l">
        <i />
        <i />
        <i />
        <i />
      </span>
      <span className="mp-wipe-bank is-r">
        <i />
        <i />
        <i />
        <i />
      </span>
      <span className="mp-wipe-dot is-l" />
      <span className="mp-wipe-dot is-r" />
      <span className="mp-wipe-heart">💗</span>
    </div>
  );
}

function NextPill({ spec, onPress }: { spec: NextSpec | null; onPress: () => void }) {
  const [shown, setShown] = useState<NextSpec | null>(spec);
  if (spec && spec !== shown) setShown(spec);
  const s = spec ?? shown;
  return (
    <div className="mp-next-wrap">
      <button type="button" className={`mp-next${spec ? "" : " is-hidden"}`} onClick={onPress} disabled={!spec} aria-hidden={!spec} tabIndex={spec ? 0 : -1} data-mp-next>
        <span className="mp-next-gloss" aria-hidden />
        {spec && <span key={spec.label} className="mp-next-ring" aria-hidden />}
        <span className="mp-next-ico" aria-hidden>
          {ICONS[s?.icon ?? "heart"]}
        </span>
        <span className="mp-next-label">{s?.label ?? ""}</span>
        <span className="mp-next-arrow" aria-hidden>
          ›
        </span>
      </button>
    </div>
  );
}

export function fmtDistance(km: number, unit: "km" | "mi", short = false): string {
  const v = unit === "mi" ? km * 0.621371 : km;
  return `${Math.round(v).toLocaleString("en-IN")} ${unit === "mi" ? (short ? "mi" : "miles") : "km"}`;
}

/**
 * Top-left: ‹ back, and a tiny map line with her dot (left) and the sender's
 * (right) creeping together; the distance left shrinks with every scene.
 */
export function DistanceTrail({ at, rooms, ending, km, unit, onBack }: TrailSpec) {
  const p = ending ? 1 : Math.min(1, at / Math.max(1, rooms));
  const left = 10 + p * 40;
  const right = 110 - p * 40;
  const label = ending ? `0 ${unit} 💗` : km ? fmtDistance(km * (1 - p), unit, true) : p > 0.5 ? "getting closer" : "so far away";
  return (
    <nav className="mp-trail" aria-label={`Scene ${Math.min(at + 1, rooms)} of ${rooms}`}>
      <button type="button" className="mp-back" onClick={onBack} disabled={at === 0 && !ending} aria-label="Back to the previous scene" data-mp-back>
        ‹
      </button>
      <span className="mp-trail-map" aria-hidden>
        <svg viewBox="0 0 120 24" width="100%" height="100%">
          <path d="M6 14 Q 34 2 60 12 T 114 10" fill="none" stroke="var(--vw-edge)" strokeWidth="2.4" strokeDasharray="1 5" strokeLinecap="round" />
          {Array.from({ length: rooms - 1 }, (_, k) => {
            const x = 10 + ((k + 1) / rooms) * 100;
            return <circle key={k} cx={x} cy={12} r={1.4} fill={k + 1 <= at || ending ? "var(--vw-accent)" : "var(--vw-edge)"} />;
          })}
          <g style={{ transform: `translateX(${left}px)`, transition: "transform .9s cubic-bezier(.3,1.4,.5,1)" }}>
            <circle cx={0} cy={12} r={5.5} fill="var(--vw-accent)" stroke="#FFFFFF" strokeWidth="2" />
          </g>
          <g style={{ transform: `translateX(${right}px)`, transition: "transform .9s cubic-bezier(.3,1.4,.5,1)" }}>
            <circle cx={0} cy={12} r={5.5} fill="var(--mp-pop)" stroke="#FFFFFF" strokeWidth="2" />
          </g>
        </svg>
      </span>
      <span className="mp-trail-km" aria-live="polite">
        {label}
      </span>
    </nav>
  );
}

export const MP_STAGE_CSS = `
.mp-scene { position: relative; z-index: 1; box-sizing: border-box; height: 100vh; height: 100dvh;
  display: flex; flex-direction: column; align-items: center; text-align: center; gap: clamp(8px, 1.8dvh, 18px);
  padding: calc(env(safe-area-inset-top, 0px) + clamp(66px, 9.5dvh, 82px)) 18px max(calc(env(safe-area-inset-bottom, 0px) + 96px), var(--vw-dock-space, 0px));
  width: 100%; max-width: calc(520px * var(--vw-s, 1)); margin: 0 auto; overflow: hidden; color: var(--vw-ink); }
@media (min-width: 768px) { .mp-scene { max-width: 720px; padding-top: calc(var(--vw-top-space, 0px) + 78px); padding-bottom: 118px; gap: clamp(10px, 2dvh, 22px); } }
@media (min-width: 1100px) { .mp-scene { max-width: min(800px, 60vw); padding-top: 88px; } }
@media (min-width: 1100px) { .mp-zoom { zoom: 1.12; } }
@media (min-width: 1100px) and (min-height: 1000px) { .mp-zoom { zoom: 1.25; } }
/* Phone in landscape (and short in-app browsers turned sideways): the words sit in a column on the
   left, the stage and its buttons on the right, so nothing is squeezed to a sliver. */
@media (orientation: landscape) and (max-height: 500px) {
  .mp-scene { display: grid; grid-template-columns: minmax(0, .85fr) minmax(0, 1.15fr); grid-template-rows: minmax(0, 1fr); grid-auto-rows: auto; column-gap: clamp(16px, 4vw, 36px); row-gap: 8px;
    max-width: min(860px, 100%); padding: calc(env(safe-area-inset-top, 0px) + 66px) max(20px, env(safe-area-inset-right, 0px)) calc(env(safe-area-inset-bottom, 0px) + 88px) max(20px, env(safe-area-inset-left, 0px)); }
  .mp-scene > .mp-head { grid-column: 1; grid-row: 1 / -1; align-self: center; }
  .mp-scene > .mp-fill { grid-column: 2; grid-row: 1; height: 100%; }
  .mp-scene > :not(.mp-head):not(.mp-fill) { grid-column: 2; justify-self: center; }
  .mp-scene:not(:has(> .mp-head)) > * { grid-column: 1 / -1; }
  .mp-title { font-size: clamp(24px, 3.4vw, 34px); }
  /* The pill moves under the words (left column), so it never covers the stage on the right. */
  body .mp-next-wrap { justify-content: flex-start; padding: 0 0 0 max(78px, calc((100vw - min(860px, 100vw)) / 2 + 78px)); }
  /* The answer reads as a row (sticker, then the words) across the full width. */
  .mp-fill[data-mp-answered] > .mp-zoom { grid-template-columns: auto minmax(0, 1fr); max-width: 680px !important; column-gap: 24px; text-align: left; justify-items: start !important; align-items: center; }
  .mp-fill[data-mp-answered] > .mp-zoom > :first-child { grid-row: 1 / span 3; min-height: 0 !important; }
}
.mp-fill { position: relative; flex: 1 1 0; min-height: 0; width: 100%; container-type: size; display: grid; grid-template: minmax(0, 1fr) / minmax(0, 1fr); place-items: center; }

/* The one way forward: airmail-striped, bottom centre, clear of the music icon on its left. */
.mp-next-wrap { position: fixed; z-index: 60; left: 0; right: 0; bottom: calc(env(safe-area-inset-bottom, 0px) + 18px);
  display: flex; justify-content: center; pointer-events: none; padding: 0 62px; box-sizing: border-box; }
@media (min-width: 768px) { .mp-next-wrap { bottom: 30px; } }
.mp-next { pointer-events: auto; position: relative; display: inline-flex; align-items: center; gap: 9px; height: 62px; max-width: 100%; min-width: 0; padding: 0 20px 0 7px; box-sizing: border-box;
  border: 4px solid transparent; border-radius: 999px; cursor: pointer; color: #FFFFFF;
  /* The airmail edge: the stripes live in the border box, the pill's own gradient in the padding box. */
  background: linear-gradient(180deg, color-mix(in srgb, var(--vw-accent) 70%, #FFFFFF) 0%, var(--vw-accent) 55%, var(--vw-accent-deep) 100%) padding-box,
    repeating-linear-gradient(135deg, var(--vw-accent) 0 7px, #FFFFFF 7px 12px, var(--mp-pop) 12px 19px, #FFFFFF 19px 24px) border-box;
  box-shadow: 0 5px 0 var(--mp-deep), 0 0 0 2px #FFFFFF, 0 14px 30px -10px color-mix(in srgb, var(--mp-deep) 70%, transparent);
  transition: transform .45s cubic-bezier(.2,.9,.25,1.2), opacity .3s ease, box-shadow .2s ease; touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
.mp-next.is-hidden { opacity: 0; transform: translateY(18px) scale(.9); pointer-events: none; transition-duration: .25s; }
.mp-next:active { transform: translateY(4px) scale(.97); box-shadow: 0 1px 0 var(--mp-deep), 0 0 0 2px #FFFFFF; transition-duration: .08s; }
.mp-next:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 5px; }
.mp-next-gloss { position: absolute; left: 14px; right: 14px; top: 4px; height: 40%; border-radius: 999px; background: linear-gradient(180deg, rgba(255,255,255,.5), rgba(255,255,255,0)); pointer-events: none; }
.mp-next-ring { position: absolute; inset: -6px; border-radius: inherit; border: 3px solid var(--vw-accent); opacity: 0; pointer-events: none; animation: mp-ring 1.9s ease-out 2s infinite; }
@keyframes mp-ring { 0% { opacity: .8; transform: scale(1) } 100% { opacity: 0; transform: scale(1.1, 1.45) } }
.mp-next-ico { position: relative; width: 42px; height: 42px; flex: none; border-radius: 50%; display: grid; place-items: center; font-size: 22px; line-height: 1;
  background: radial-gradient(circle at 40% 35%, #FFFFFF, var(--mp-blush)); box-shadow: inset 0 -3px 0 color-mix(in srgb, var(--mp-deep) 22%, transparent), 0 2px 6px color-mix(in srgb, var(--mp-deep) 40%, transparent); animation: mp-bob 1.3s ease-in-out infinite alternate; }
@keyframes mp-bob { from { transform: translateY(-2px) rotate(-9deg) } to { transform: translateY(2px) rotate(9deg) } }
.mp-next-label { position: relative; min-width: 0; font: 800 18px/1.25 ${MP_DISPLAY}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-shadow: 0 1px 0 color-mix(in srgb, var(--mp-deep) 60%, transparent); }
/* Phones: the music button owns the bottom-left corner, so the pill centres in the space to its right
   and a long label wraps onto a second line instead of being cut off mid-word. */
@media (max-width: 479px) {
  .mp-next-wrap { padding: 0 max(10px, env(safe-area-inset-right, 0px)) 0 calc(max(12px, env(safe-area-inset-left, 0px)) + 58px); }
  .mp-next { padding-right: 14px; gap: 7px; }
  .mp-next-label { font-size: clamp(15.5px, 4.6vw, 18px); line-height: 1.08; white-space: normal; text-wrap: balance; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; text-align: left; }
  .mp-next-arrow { font-size: 22px; }
}
.mp-next-arrow { position: relative; font: 700 26px/1 ${FONTS.ui}; margin-left: 2px; margin-top: -3px; }
@media (min-width: 1100px) { .mp-next-wrap .mp-next { transform: scale(1.1); transform-origin: 50% 100%; } .mp-next-wrap .mp-next.is-hidden { transform: translateY(18px); } }

/* The distance trail, top-left (the editor's bar sits top-right). */
.mp-trail { position: fixed; z-index: 62; top: calc(max(8px, env(safe-area-inset-top, 0px)) + 6px); left: max(10px, env(safe-area-inset-left, 0px));
  display: flex; align-items: center; gap: 4px; height: 44px; padding: 0 12px 0 0; border-radius: 99px; box-sizing: border-box; max-width: calc(100vw - 150px);
  background: color-mix(in srgb, var(--vw-paper) 86%, transparent); border: 1.5px solid var(--vw-edge);
  box-shadow: 0 6px 16px -8px color-mix(in srgb, var(--mp-deep) 50%, transparent); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
@media (min-width: 768px) { .mp-trail { top: 20px; left: 24px; height: 48px; } }
.mp-back { flex: none; width: 42px; height: 42px; border-radius: 50%; border: 0; padding: 0 0 3px; margin-left: 0; cursor: pointer; display: grid; place-items: center;
  font: 800 26px/1 ${FONTS.ui}; color: var(--vw-accent-deep); background: transparent; touch-action: manipulation; }
.mp-back:disabled { opacity: .3; cursor: default; }
.mp-back:not(:disabled):hover { background: var(--mp-blush); }
.mp-back:focus-visible { outline: 2px solid var(--vw-ink); outline-offset: -3px; }
.mp-trail-map { flex: none; width: 74px; height: 20px; display: block; }
@media (min-width: 480px) { .mp-trail-map { width: 92px; } }
@media (max-width: 479px) { .mp-trail { max-width: calc(100vw - 222px); gap: 2px; padding-right: 10px; } .mp-trail-map { width: 50px; } .mp-trail-km { font-size: 11.5px; } }
@media (max-width: 399px) { .mp-trail-map { width: 28px; } }
@media (max-width: 359px) { .mp-trail-map { display: none; } .mp-trail { max-width: calc(100vw - 206px); } }
.mp-trail-km { min-width: 0; font: 700 12.5px/1 ${FONTS.ui}; color: var(--vw-ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-variant-numeric: tabular-nums; }
@media (min-width: 768px) { .mp-trail-km { font-size: 14px; } }
/* The music icon (engine, DayConfig.music.compact) stays bottom-left, level with the pill's middle. */
body .vm-icon { bottom: calc(env(safe-area-inset-bottom, 0px) + 26px); }
@media (min-width: 768px) { body .vm-icon { left: 24px; bottom: 38px; } }

/* The cloud wipe: transform/opacity only; input is blocked only while the screen is covered. */
.mp-wipe { position: fixed; inset: 0; z-index: 74; pointer-events: none; overflow: hidden; contain: strict; }
.mp-wipe-wash { position: absolute; inset: 0; background: radial-gradient(circle at 50% 50%, #FFFFFF, var(--mp-blush, #FFD9EA) 75%); opacity: 0; animation: mp-wash var(--mp-wipe) ease-in-out forwards; }
@keyframes mp-wash { 0% { opacity: 0 } 36% { opacity: .85 } 50% { opacity: 1 } 70% { opacity: .25 } 100% { opacity: 0 } }
.mp-wipe-bank { position: absolute; top: -10vh; bottom: -10vh; width: 75vw; will-change: transform; }
.mp-wipe-bank.is-l { left: 0; animation: mp-bank-l var(--mp-wipe) cubic-bezier(.6,0,.3,1) forwards; }
.mp-wipe-bank.is-r { right: 0; animation: mp-bank-r var(--mp-wipe) cubic-bezier(.6,0,.3,1) forwards; }
.mp-wipe-bank i { position: absolute; border-radius: 50%; background: radial-gradient(circle at 40% 35%, #FFFFFF 0 55%, color-mix(in srgb, var(--mp-blush, #FFD9EA) 70%, #FFFFFF) 100%);
  box-shadow: 0 10px 30px -10px color-mix(in srgb, var(--mp-deep, #A3336A) 30%, transparent); }
.mp-wipe-bank i:nth-child(1) { width: 80vmax; height: 80vmax; top: -20vmax; }
.mp-wipe-bank i:nth-child(2) { width: 60vmax; height: 60vmax; top: 30vh; }
.mp-wipe-bank i:nth-child(3) { width: 70vmax; height: 70vmax; top: 70vh; }
.mp-wipe-bank i:nth-child(4) { width: 46vmax; height: 46vmax; top: 10vh; }
.mp-wipe-bank.is-l i { right: -18vmax; }
.mp-wipe-bank.is-l i:nth-child(4) { right: -26vmax; }
.mp-wipe-bank.is-r i { left: -18vmax; }
.mp-wipe-bank.is-r i:nth-child(2) { left: -26vmax; }
@keyframes mp-bank-l { 0% { transform: translateX(-130%) } 46% { transform: translateX(0) } 54% { transform: translateX(0) } 100% { transform: translateX(-140%) } }
@keyframes mp-bank-r { 0% { transform: translateX(130%) } 46% { transform: translateX(0) } 54% { transform: translateX(0) } 100% { transform: translateX(140%) } }
.mp-wipe-dot { position: absolute; top: 50%; width: 22px; height: 22px; margin-top: -11px; border-radius: 50%; border: 3px solid #FFFFFF; opacity: 0; box-shadow: 0 4px 12px -2px rgba(0,0,0,.18); }
.mp-wipe-dot.is-l { left: 50%; background: var(--vw-accent, #EC5F9C); animation: mp-dot-l var(--mp-wipe) ease-in-out forwards; }
.mp-wipe-dot.is-r { left: 50%; background: var(--mp-pop, #7FA8F5); animation: mp-dot-r var(--mp-wipe) ease-in-out forwards; }
@keyframes mp-dot-l { 0%, 20% { opacity: 0; transform: translateX(-30vw) } 34% { opacity: 1 } 48% { transform: translateX(-17px) } 56% { opacity: 1; transform: translateX(-17px) } 66%, 100% { opacity: 0; transform: translateX(-17px) scale(.3) } }
@keyframes mp-dot-r { 0%, 20% { opacity: 0; transform: translateX(30vw) } 34% { opacity: 1 } 48% { transform: translateX(-5px) } 56% { opacity: 1; transform: translateX(-5px) } 66%, 100% { opacity: 0; transform: translateX(-5px) scale(.3) } }
.mp-wipe-heart { position: absolute; left: 50%; top: 50%; font-size: 34px; line-height: 1; transform: translate(-50%, -50%) scale(0); opacity: 0; animation: mp-wheart var(--mp-wipe) ease-out forwards; }
@keyframes mp-wheart { 0%, 48% { opacity: 0; transform: translate(-50%, -50%) scale(0) } 56% { opacity: 1; transform: translate(-50%, -50%) scale(1.4) } 72% { opacity: 1; transform: translate(-50%, -60%) scale(1) } 100% { opacity: 0; transform: translate(-50%, -140%) scale(.8) } }
.mp-wipe.is-soft { background: var(--vw-paper, #FFF); opacity: 0; animation: mp-soft var(--mp-wipe) ease-in-out forwards; }
@keyframes mp-soft { 0% { opacity: 0 } 45% { opacity: 1 } 100% { opacity: 0 } }
.mp-wipe-block { position: fixed; inset: 0; z-index: 75; }
@media (prefers-reduced-motion: reduce) { .mp-next-ico, .mp-next-ring { animation: none !important; } }
`;
