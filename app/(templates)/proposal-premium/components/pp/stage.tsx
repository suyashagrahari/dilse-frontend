"use client";

// The Proposal stage furniture, shared by every scene:
//
//   • PpStage — the context the scenes talk to: the one Next pill, the little
//     sound cues (the kit's procedural SFX) and the replay round.
//   • useNext(label, onPress, icon) — a scene declares its way forward; the
//     shell draws ONE pill for it, fixed bottom-centre, so nothing jumps. Only
//     her tap moves on, and that tap plays the golden-hour wipe: a warm sun
//     rises from the bottom and floods the screen, the scene is swapped behind
//     it, and it fades out through a flurry of petals.
//   • BudTrail — little rosebuds top-left that bloom as she goes (tap a
//     bloomed one to go back).
//
// Sounds stay silent until the first tap and whenever the visitor mutes.

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import { useDayMusic } from "../../../_valentine/music/context";
import { useUnlockAudioOnFirstTap } from "../../../_valentine/kit/premium/useScare";
import { sfx, type CueId, type CueOptions } from "../../../_valentine/kit/premium/sfx";
import { FONTS } from "../../../_valentine/theme";
import { PP_SERIF } from "./fonts";

export type NextIcon = "letter" | "heart" | "ring" | "sparkle" | "flower" | "photo" | "key" | "carousel" | "light";

const ICONS: Record<NextIcon, string> = {
  letter: "💌",
  heart: "💗",
  ring: "💍",
  sparkle: "✨",
  flower: "🌷",
  photo: "📸",
  key: "🗝️",
  carousel: "🎠",
  light: "💡",
};

interface NextSpec {
  label: string;
  icon: NextIcon;
  onPress: () => void;
  /** false: the press does not change the scene (opens WhatsApp etc.), so no wipe. */
  wipe?: boolean;
}

interface PpApi {
  setNext: (s: NextSpec | null) => void;
  cue: (id: CueId, o?: CueOptions) => void;
  /** Changes on every replay — remounts the scenes' GIFs. */
  round: number;
  /** Play the wipe and run `swap` while the screen is covered (replay, the trail). */
  go: (swap: () => void) => number;
}

const Ctx = createContext<PpApi | null>(null);
export function usePp(): PpApi {
  const v = useContext(Ctx);
  if (!v) throw new Error("usePp outside PpStage");
  return v;
}

/**
 * A scene's way forward. `null` hides the pill (pass null until the scene's
 * moment is done). It only moves on when she taps it — no auto-advance.
 */
export function useNext(label: string | null, onPress: () => void, icon: NextIcon = "heart", wipe = true) {
  const { setNext } = usePp();
  const fn = useRef(onPress);
  useLayoutEffect(() => {
    fn.current = onPress;
  });
  useEffect(() => {
    setNext(label ? { label, icon, wipe, onPress: () => fn.current() } : null);
  }, [label, icon, wipe, setNext]);
  useEffect(() => () => setNext(null), [setNext]);
}

const WIPE = { full: 900, soft: 480 } as const;
const COVER_AT = 0.47;

export function PpStage({
  round,
  trail,
  children,
}: {
  round: number;
  trail: { at: number; rooms: number; ending: boolean; onJump: (k: number) => void };
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
        cue("chime", { gain: 0.32, at: coverAt / 1000 - 0.05 });
        cue("sparkle", { gain: 0.28, at: coverAt / 1000 + 0.12 });
        at(coverAt, () => haptic(10));
      }
      setRun({ id: performance.now(), soft, dur });
      setBlocked(true);
      at(coverAt, swap);
      at(Math.round(dur * 0.7), () => setBlocked(false));
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

  const api = useMemo<PpApi>(() => ({ setNext, cue, round, go }), [setNext, cue, round, go]);

  return (
    <Ctx.Provider value={api}>
      <BudTrail at={trail.at} rooms={trail.rooms} ending={trail.ending} onJump={(k) => go(() => trail.onJump(k))} />
      {children}
      <NextPill spec={next} onPress={press} />
      {run && <Wipe key={run.id} soft={run.soft} dur={run.dur} />}
      {blocked && <div className="pp-wipe-block" aria-hidden />}
    </Ctx.Provider>
  );
}

const PETALS = [6, 18, 30, 44, 57, 69, 81, 93];

/** The golden-hour wipe: a warm sun rises and floods the screen, then melts away through petals. */
function Wipe({ soft, dur }: { soft: boolean; dur: number }) {
  if (soft) return <div className="pp-wipe is-soft" style={{ ["--pp-wipe" as string]: `${dur}ms` }} aria-hidden />;
  return (
    <div className="pp-wipe" style={{ ["--pp-wipe" as string]: `${dur}ms` }} aria-hidden>
      <span className="pp-wipe-sun" />
      <span className="pp-wipe-rays" />
      <span className="pp-wipe-petals">
        {PETALS.map((x, k) => (
          <i key={x} style={{ left: `${x}%`, ["--d" as string]: `${(k % 4) * 40}ms`, ["--r" as string]: `${k % 2 ? 140 : -160}deg` }} />
        ))}
      </span>
    </div>
  );
}

function NextPill({ spec, onPress }: { spec: NextSpec | null; onPress: () => void }) {
  const [shown, setShown] = useState<NextSpec | null>(spec);
  if (spec && spec !== shown) setShown(spec);
  const s = spec ?? shown;
  return (
    <div className="pp-next-wrap">
      <button type="button" className={`pp-next${spec ? "" : " is-hidden"}`} onClick={onPress} disabled={!spec} aria-hidden={!spec} tabIndex={spec ? 0 : -1} data-pp-next>
        <span className="pp-next-gloss" aria-hidden />
        {spec && <span key={spec.label} className="pp-next-ring" aria-hidden />}
        <span className="pp-next-ico" aria-hidden>
          {ICONS[s?.icon ?? "heart"]}
        </span>
        <span className="pp-next-label">{s?.label ?? ""}</span>
        <span className="pp-next-arrow" aria-hidden>
          ›
        </span>
      </button>
    </div>
  );
}

/** Little rosebuds in a pill, top-left: bloomed = done (tap to go back), the current one sways. */
export function BudTrail({ at, rooms, ending, onJump }: { at: number; rooms: number; ending: boolean; onJump: (k: number) => void }) {
  const [nope, setNope] = useState<{ k: number; n: number } | null>(null);
  return (
    <nav className="pp-trail" aria-label={`Step ${Math.min(at + 1, rooms)} of ${rooms}`}>
      {Array.from({ length: rooms }, (_, k) => {
        const done = k < at || ending;
        const here = k === at && !ending;
        return (
          <button
            key={k}
            type="button"
            className={`pp-bud${done ? " is-done" : ""}${here ? " is-here" : ""}`}
            aria-label={done ? `Back to step ${k + 1}` : here ? `Step ${k + 1}, you are here` : `Step ${k + 1}, not yet`}
            aria-current={here ? "step" : undefined}
            onClick={() => {
              if (done) {
                haptic(10);
                onJump(k);
              } else if (!here) {
                haptic(6);
                setNope((p) => ({ k, n: (p?.n ?? 0) + 1 }));
              }
            }}
          >
            <span key={nope?.k === k ? `n${nope.n}` : "s"} className={nope?.k === k ? "pp-bud-nope" : undefined}>
              <svg viewBox="0 0 24 24" width="100%" aria-hidden>
                {done || here ? (
                  <>
                    {[0, 72, 144, 216, 288].map((a) => (
                      <ellipse key={a} cx="12" cy="6.6" rx="4.2" ry="5.4" transform={`rotate(${a} 12 12)`} fill="var(--vw-accent, #D45E78)" stroke="var(--vw-accent-deep, #A63D58)" strokeWidth=".9" />
                    ))}
                    <circle cx="12" cy="12" r="3.4" fill="var(--vw-gold, #E3A891)" stroke="var(--vw-accent-deep, #A63D58)" strokeWidth=".9" />
                  </>
                ) : (
                  <>
                    <path d="M12 22 V13" stroke="var(--pp-leaf, #9CC79A)" strokeWidth="2" strokeLinecap="round" />
                    <path d="M12 4 C7 7 7 13 12 14 C17 13 17 7 12 4 Z" fill="none" stroke="var(--vw-gold, #E3A891)" strokeWidth="2" />
                  </>
                )}
              </svg>
            </span>
          </button>
        );
      })}
    </nav>
  );
}

export const PP_STAGE_CSS = `
/* One scene = one screen, airy: a calm top band (the bud trail, level with the editor's top bar / the
   viewer's logo), the scene, then a clear bottom strip for the pill alone (the music icon sits bottom-left). */
.pp-scene { position: relative; z-index: 1; box-sizing: border-box; height: 100vh; height: 100dvh;
  display: flex; flex-direction: column; align-items: center; text-align: center; gap: clamp(8px, 2dvh, 20px);
  padding: calc(env(safe-area-inset-top, 0px) + clamp(62px, 9dvh, 80px)) 20px max(calc(env(safe-area-inset-bottom, 0px) + 96px), var(--vw-dock-space, 0px));
  width: 100%; max-width: calc(520px * var(--vw-s, 1)); margin: 0 auto; overflow: hidden; color: var(--vw-ink); }
@media (min-width: 768px) { .pp-scene { max-width: 700px; padding-top: calc(var(--vw-top-space, 0px) + 72px); padding-bottom: 116px; gap: clamp(12px, 2.4dvh, 24px); } }
@media (min-width: 1100px) { .pp-scene { max-width: min(780px, 58vw); padding-top: 84px; } }
@media (min-width: 1100px) { .pp-zoom { zoom: 1.14; } }
@media (min-width: 1100px) and (min-height: 1000px) { .pp-zoom { zoom: 1.28; } }
.pp-fill { position: relative; flex: 1 1 0; min-height: 0; width: 100%; container-type: size; display: grid; grid-template: minmax(0, 1fr) / minmax(0, 1fr); place-items: center; }

/* Scene titles: a small kicker, a fairytale serif heading, a soft line. */
.pp-head { flex: none; display: grid; gap: 4px; justify-items: center; max-width: 460px; }
.pp-kick { margin: 0; font: 700 clamp(11px, 1.7dvh, 13px)/1.2 ${FONTS.ui}; letter-spacing: .18em; text-transform: uppercase; color: var(--vw-accent-deep); }
.pp-title { margin: 0; font: 700 clamp(30px, min(9vw, 5.2dvh), 46px)/1.04 ${PP_SERIF}; color: var(--vw-ink); text-wrap: balance; overflow-wrap: anywhere; letter-spacing: -.01em; }
.pp-title em { font-style: italic; color: var(--vw-accent-deep); }
.pp-sub { margin: 0; font: 500 clamp(14px, 2.1dvh, 16.5px)/1.45 ${FONTS.ui}; color: var(--vw-ink-soft); text-wrap: balance; overflow-wrap: anywhere; }
@media (min-width: 1100px) { .pp-title { font-size: clamp(40px, 5.4dvh, 56px); } .pp-sub { font-size: 17px; } }
.pp-hint { flex: none; margin: 0; min-height: 22px; font: 700 clamp(14px, 2.2dvh, 17px) ${FONTS.ui}; color: var(--vw-accent-deep); }

/* The one way forward: always the same spot, bottom centre, clear of the music icon on its left. */
.pp-next-wrap { position: fixed; z-index: 60; left: 0; right: 0; bottom: calc(env(safe-area-inset-bottom, 0px) + 18px);
  display: flex; justify-content: center; pointer-events: none; padding: 0 62px; box-sizing: border-box; }
@media (min-width: 768px) { .pp-next-wrap { bottom: 30px; } }
.pp-next { pointer-events: auto; position: relative; display: inline-flex; align-items: center; gap: 9px; height: 56px; max-width: 100%; min-width: 0; padding: 0 20px 0 7px;
  border: 0; border-radius: 999px; cursor: pointer; color: #FFFFFF;
  background: linear-gradient(180deg, color-mix(in srgb, var(--vw-accent) 70%, #FFFFFF) 0%, var(--vw-accent) 52%, var(--vw-accent-deep) 100%);
  box-shadow: 0 4px 0 var(--pp-deep), 0 0 0 4px color-mix(in srgb, #FFFFFF 75%, transparent), 0 0 0 5.5px color-mix(in srgb, var(--vw-gold) 70%, transparent), 0 16px 30px -10px color-mix(in srgb, var(--pp-deep) 70%, transparent);
  transition: transform .45s cubic-bezier(.2,.9,.25,1.2), opacity .3s ease, box-shadow .2s ease; touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
.pp-next.is-hidden { opacity: 0; transform: translateY(18px) scale(.9); pointer-events: none; transition-duration: .25s; }
.pp-next:active { transform: translateY(3px) scale(.97); box-shadow: 0 1px 0 var(--pp-deep), 0 0 0 4px color-mix(in srgb, #FFFFFF 75%, transparent); transition-duration: .08s; }
.pp-next:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 5px; }
.pp-next-gloss { position: absolute; left: 14px; right: 14px; top: 4px; height: 40%; border-radius: 999px; background: linear-gradient(180deg, rgba(255,255,255,.55), rgba(255,255,255,0)); pointer-events: none; }
.pp-next-ring { position: absolute; inset: -3px; border-radius: inherit; border: 3px solid var(--vw-gold); opacity: 0; pointer-events: none; animation: pp-ring 2s ease-out 2s infinite; }
@keyframes pp-ring { 0% { opacity: .9; transform: scale(1) } 100% { opacity: 0; transform: scale(1.12, 1.5) } }
.pp-next-ico { position: relative; width: 42px; height: 42px; flex: none; border-radius: 50%; display: grid; place-items: center; font-size: 22px; line-height: 1;
  background: radial-gradient(circle at 40% 35%, #FFFFFF, var(--pp-blush)); box-shadow: inset 0 -3px 0 color-mix(in srgb, var(--pp-deep) 22%, transparent), 0 2px 6px color-mix(in srgb, var(--pp-deep) 40%, transparent); animation: pp-bob 1.3s ease-in-out infinite alternate; }
@keyframes pp-bob { from { transform: translateY(-2px) rotate(-9deg) } to { transform: translateY(2px) rotate(9deg) } }
.pp-next-label { position: relative; min-width: 0; font: 700 18px/1.25 ${FONTS.ui}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-shadow: 0 1px 0 color-mix(in srgb, var(--pp-deep) 60%, transparent); }
.pp-next-arrow { position: relative; font: 700 26px/1 ${FONTS.ui}; margin-left: 2px; margin-top: -3px; }
@media (min-width: 1100px) { .pp-next-wrap .pp-next { transform: scale(1.1); transform-origin: 50% 100%; } .pp-next-wrap .pp-next.is-hidden { transform: translateY(18px); } }

/* The bud trail: small, top-left, level with the editor's top bar (which sits top-right). */
.pp-trail { position: fixed; z-index: 62; top: calc(max(10px, env(safe-area-inset-top, 0px)) + 8px); left: max(12px, env(safe-area-inset-left, 0px));
  display: flex; align-items: center; gap: 1px; height: 30px; padding: 0 6px; border-radius: 99px; box-sizing: border-box;
  background: color-mix(in srgb, var(--vw-paper) 84%, transparent); border: 1.5px solid var(--vw-edge);
  box-shadow: 0 6px 16px -8px color-mix(in srgb, var(--pp-deep) 50%, transparent); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
@media (min-width: 768px) { .pp-trail { top: 22px; left: 24px; height: 36px; } }
.pp-bud { width: 17px; height: 30px; padding: 0; margin: 0; border: 0; background: none; cursor: default; display: grid; place-items: center; touch-action: manipulation; -webkit-tap-highlight-color: transparent; position: relative; }
.pp-bud.is-done::after { content: ""; position: absolute; inset: -7px -1px; }
@media (max-width: 479px) { .pp-bud { width: 14px; } .pp-trail { padding: 0 5px; } }
@media (max-width: 359px) { .pp-bud { width: 12px; } }
@media (min-width: 768px) { .pp-bud { width: 21px; height: 36px; } }
.pp-bud > span { display: block; width: 100%; opacity: .8; }
.pp-bud.is-done { cursor: pointer; }
.pp-bud.is-done > span { opacity: 1; }
.pp-bud.is-done:hover > span { transform: scale(1.15) rotate(20deg); }
.pp-bud.is-here > span { opacity: 1; animation: pp-bud-sway 1.6s ease-in-out infinite; }
.pp-bud:focus-visible { outline: 2px solid var(--vw-ink); outline-offset: -2px; border-radius: 8px; }
.pp-bud > span.pp-bud-nope { animation: pp-bud-nope .42s ease-in-out; }
@keyframes pp-bud-sway { 0%, 100% { transform: rotate(-14deg) scale(1.05) } 50% { transform: rotate(14deg) scale(1.18) } }
@keyframes pp-bud-nope { 0%,100% { transform: rotate(0) } 20% { transform: rotate(-16deg) } 45% { transform: rotate(13deg) } 70% { transform: rotate(-8deg) } }
/* The music icon (engine, DayConfig.music.compact) stays bottom-left, level with the pill's middle. */
body .vm-icon { bottom: calc(env(safe-area-inset-bottom, 0px) + 26px); }
@media (min-width: 768px) { body .vm-icon { left: 24px; bottom: 38px; } }

/* The golden-hour wipe. Transform/opacity only; input is blocked only while the screen is covered. */
.pp-wipe { position: fixed; inset: 0; z-index: 74; pointer-events: none; overflow: hidden; contain: strict; }
.pp-wipe-sun { position: absolute; left: 50%; bottom: 0; width: 40vmax; height: 40vmax; margin-left: -20vmax; margin-bottom: -20vmax; border-radius: 50%;
  background: radial-gradient(circle, #FFFFFF 0%, var(--pp-sun, #FFD3A6) 26%, var(--pp-blush, #FBDDD6) 52%, color-mix(in srgb, var(--vw-paper, #FFF) 92%, transparent) 70%);
  transform: scale(.05); opacity: 0; will-change: transform, opacity; animation: pp-sunrise var(--pp-wipe) cubic-bezier(.55,0,.3,1) forwards; }
@keyframes pp-sunrise { 0% { transform: scale(.05); opacity: 0 } 14% { opacity: 1 } 47% { transform: scale(8.2); opacity: 1 } 72% { transform: scale(8.8); opacity: .4 } 100% { transform: scale(9.2); opacity: 0 } }
.pp-wipe-rays { position: absolute; left: 50%; bottom: -30vmax; width: 140vmax; height: 140vmax; margin-left: -70vmax; border-radius: 50%; opacity: 0;
  background: repeating-conic-gradient(from 0deg, color-mix(in srgb, #FFFFFF 70%, transparent) 0 5deg, transparent 5deg 15deg);
  -webkit-mask-image: radial-gradient(circle, #000 0 30%, transparent 64%); mask-image: radial-gradient(circle, #000 0 30%, transparent 64%);
  animation: pp-rays var(--pp-wipe) ease-out forwards; }
@keyframes pp-rays { 0% { opacity: 0; transform: rotate(-8deg) scale(.6) } 35% { opacity: .55 } 55% { opacity: .2; transform: rotate(6deg) scale(1) } 100% { opacity: 0; transform: rotate(10deg) scale(1.1) } }
.pp-wipe-petals { position: absolute; inset: 0; }
.pp-wipe-petals i { position: absolute; top: -6vh; width: 16px; height: 22px; border-radius: 80% 0 80% 0; opacity: 0;
  background: linear-gradient(135deg, #FFFFFF, var(--vw-accent, #D45E78)); animation: pp-petal-fall var(--pp-wipe) ease-in calc(var(--pp-wipe) * .38 + var(--d)) forwards; }
@keyframes pp-petal-fall { 0% { opacity: 0; transform: translateY(0) rotate(0) } 20% { opacity: .95 } 100% { opacity: 0; transform: translateY(70vh) rotate(var(--r)) } }
.pp-wipe.is-soft { background: var(--vw-paper, #FFF); opacity: 0; animation: pp-soft var(--pp-wipe) ease-in-out forwards; }
@keyframes pp-soft { 0% { opacity: 0 } 45% { opacity: 1 } 100% { opacity: 0 } }
.pp-wipe-block { position: fixed; inset: 0; z-index: 75; }
`;
