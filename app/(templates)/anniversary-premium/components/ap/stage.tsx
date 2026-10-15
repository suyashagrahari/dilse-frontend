"use client";

// The Book of Us stage furniture, shared by every scene:
//
//   • ApStage — the context the scenes talk to: the one Next pill, the little
//     sound cues (the kit's procedural SFX) and the replay round.
//   • useNext(label, onPress, icon) — a scene declares its way forward; the
//     shell draws ONE pill for it, fixed bottom-centre, so nothing jumps. Only
//     her tap moves on, and that tap plays the page-turn wipe: a sheet of
//     pearl paper sweeps across the screen like a book page, the scene is
//     swapped behind it, and it lifts away in a scatter of gold flecks.
//   • ChapterTrail — little gold beads top-left with "Ch. N"; filled beads are
//     done (tap one to go back).
//
// Sounds stay silent until the first tap and whenever the visitor mutes.

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import { useDayMusic } from "../../../_valentine/music/context";
import { useUnlockAudioOnFirstTap } from "../../../_valentine/kit/premium/useScare";
import { sfx, type CueId, type CueOptions } from "../../../_valentine/kit/premium/sfx";
import { AP_SANS, AP_SERIF } from "./fonts";

export type NextIcon = "book" | "heart" | "sparkle" | "record" | "photo" | "letter" | "lantern" | "sun" | "ring" | "key" | "clock" | "gift";

const ICONS: Record<NextIcon, string> = {
  book: "📖",
  heart: "💗",
  sparkle: "✨",
  record: "🎶",
  photo: "🧵",
  letter: "💌",
  lantern: "🏮",
  sun: "🌅",
  ring: "💍",
  key: "🗝️",
  clock: "⏳",
  gift: "🎁",
};

interface NextSpec {
  label: string;
  icon: NextIcon;
  onPress: () => void;
  /** false: the press does not change the scene (opens WhatsApp etc.), so no wipe. */
  wipe?: boolean;
}

interface ApApi {
  setNext: (s: NextSpec | null) => void;
  cue: (id: CueId, o?: CueOptions) => void;
  /** Changes on every replay — remounts the scenes' GIFs. */
  round: number;
  /** Play the wipe and run `swap` while the screen is covered (replay, the trail). */
  go: (swap: () => void) => number;
}

const Ctx = createContext<ApApi | null>(null);
export function useAp(): ApApi {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAp outside ApStage");
  return v;
}

/**
 * A scene's way forward. `null` hides the pill (pass null until the scene's
 * moment is done). It only moves on when she taps it — no auto-advance.
 */
export function useNext(label: string | null, onPress: () => void, icon: NextIcon = "heart", wipe = true) {
  const { setNext } = useAp();
  const fn = useRef(onPress);
  useLayoutEffect(() => {
    fn.current = onPress;
  });
  useEffect(() => {
    setNext(label ? { label, icon, wipe, onPress: () => fn.current() } : null);
  }, [label, icon, wipe, setNext]);
  useEffect(() => () => setNext(null), [setNext]);
}

const WIPE = { full: 920, soft: 480 } as const;
const COVER_AT = 0.48;

export function ApStage({
  round,
  trail,
  children,
}: {
  round: number;
  trail: { at: number; rooms: number; ending: boolean; hidden?: boolean; onJump: (k: number) => void };
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
        cue("page-turn", { gain: 0.5 });
        cue("chime", { gain: 0.25, at: coverAt / 1000 - 0.02 });
        cue("sparkle", { gain: 0.26, at: coverAt / 1000 + 0.12 });
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
    cue("pop", { gain: 0.4 });
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

  const api = useMemo<ApApi>(() => ({ setNext, cue, round, go }), [setNext, cue, round, go]);

  return (
    <Ctx.Provider value={api}>
      {!trail.hidden && <ChapterTrail at={trail.at} rooms={trail.rooms} ending={trail.ending} onJump={(k) => go(() => trail.onJump(k))} />}
      {children}
      <NextPill spec={next} onPress={press} />
      {run && <Wipe key={run.id} soft={run.soft} dur={run.dur} />}
      {blocked && <div className="ap-wipe-block" aria-hidden />}
    </Ctx.Provider>
  );
}

const FLECKS = [8, 19, 31, 42, 55, 66, 78, 90];

/** The page-turn wipe: a pearl sheet sweeps over like a turning page, then lifts away in gold flecks. */
function Wipe({ soft, dur }: { soft: boolean; dur: number }) {
  if (soft) return <div className="ap-wipe is-soft" style={{ ["--ap-wipe" as string]: `${dur}ms` }} aria-hidden />;
  return (
    <div className="ap-wipe" style={{ ["--ap-wipe" as string]: `${dur}ms` }} aria-hidden>
      <span className="ap-wipe-page">
        <span className="ap-wipe-curl" />
        <span className="ap-wipe-mark">❦</span>
      </span>
      <span className="ap-wipe-flecks">
        {FLECKS.map((x, k) => (
          <i key={x} style={{ left: `${x}%`, ["--d" as string]: `${(k % 4) * 40}ms`, ["--h" as string]: `${22 + (k % 3) * 9}vh` }} />
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
    <div className="ap-next-wrap">
      <button type="button" className={`ap-next${spec ? "" : " is-hidden"}`} onClick={onPress} disabled={!spec} aria-hidden={!spec} tabIndex={spec ? 0 : -1} data-ap-next>
        <span className="ap-next-gloss" aria-hidden />
        {spec && <span key={spec.label} className="ap-next-ring" aria-hidden />}
        <span className="ap-next-ico" aria-hidden>
          {ICONS[s?.icon ?? "heart"]}
        </span>
        <span className="ap-next-label">{s?.label ?? ""}</span>
        <span className="ap-next-arrow" aria-hidden>
          ›
        </span>
      </button>
    </div>
  );
}

/** Gold beads in a pill, top-left: filled = done (tap to go back), the current one glows. */
export function ChapterTrail({ at, rooms, ending, onJump }: { at: number; rooms: number; ending: boolean; onJump: (k: number) => void }) {
  const [nope, setNope] = useState<{ k: number; n: number } | null>(null);
  return (
    <nav className="ap-trail" aria-label={`Chapter ${Math.min(at + 1, rooms)} of ${rooms}`}>
      <span className="ap-trail-ch" aria-hidden>
        {ending ? "The End" : `Ch. ${Math.min(at + 1, rooms)}`}
      </span>
      {Array.from({ length: rooms }, (_, k) => {
        const done = k < at || ending;
        const here = k === at && !ending;
        return (
          <button
            key={k}
            type="button"
            className={`ap-bead${done ? " is-done" : ""}${here ? " is-here" : ""}`}
            aria-label={done ? `Back to chapter ${k + 1}` : here ? `Chapter ${k + 1}, you are here` : `Chapter ${k + 1}, not yet`}
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
            <span key={nope?.k === k ? `n${nope.n}` : "s"} className={nope?.k === k ? "ap-bead-nope" : undefined} />
          </button>
        );
      })}
    </nav>
  );
}

export const AP_STAGE_CSS = `
/* One scene = one screen: a calm top band (the trail, level with the editor's top bar / the viewer's logo),
   the scene, then a clear bottom strip for the pill alone (the music icon sits bottom-left). */
.ap-scene { position: relative; z-index: 1; box-sizing: border-box; height: 100vh; height: 100dvh;
  display: flex; flex-direction: column; align-items: center; text-align: center; gap: clamp(8px, 1.8dvh, 20px);
  padding: calc(env(safe-area-inset-top, 0px) + clamp(62px, 8.6dvh, 78px)) 18px max(calc(env(safe-area-inset-bottom, 0px) + 94px), var(--vw-dock-space, 0px));
  width: 100%; max-width: 560px; margin: 0 auto; overflow: hidden; color: var(--vw-ink); }
@media (min-width: 768px) { .ap-scene { max-width: 760px; padding-top: calc(var(--vw-top-space, 0px) + 76px); padding-bottom: 112px; gap: clamp(12px, 2.2dvh, 24px); } }
/* Desktop: the stage spreads out like an open book — the words on the left page, the scene on the right. */
@media (min-width: 1100px) {
  .ap-scene { max-width: min(1240px, 94vw); padding: 84px 40px 108px; }
  .ap-scene[data-split] { display: grid; grid-template-columns: minmax(300px, 0.74fr) minmax(0, 1.26fr); grid-template-rows: minmax(0, 1fr) auto; column-gap: clamp(28px, 4vw, 64px); row-gap: 14px; align-items: center; text-align: left; }
  .ap-scene[data-split] > .ap-head { grid-column: 1; grid-row: 1; justify-items: start; align-self: center; max-width: 440px; }
  .ap-scene[data-split] > .ap-head .ap-rule { margin-left: 0; }
  .ap-scene[data-split] > .ap-fill { grid-column: 2; grid-row: 1 / span 2; height: 100%; }
  .ap-scene[data-split] > .ap-foot { grid-column: 1; grid-row: 2; justify-self: start; align-self: start; }
}
.ap-fill { position: relative; flex: 1 1 0; min-height: 0; width: 100%; container-type: size; display: grid; grid-template: minmax(0, 1fr) / minmax(0, 1fr); place-items: center; }
.ap-foot { flex: none; min-height: 20px; display: flex; justify-content: center; align-items: center; gap: 8px; flex-wrap: wrap; }

/* Scene titles: a small-caps kicker, a storybook serif heading, a soft line. */
.ap-head { flex: none; display: grid; gap: 4px; justify-items: center; max-width: 480px; }
.ap-kick { margin: 0; font: 700 clamp(10.5px, 1.6dvh, 12.5px)/1.2 ${AP_SANS}; letter-spacing: .22em; text-transform: uppercase; color: var(--vw-accent-deep); }
.ap-title { margin: 0; font: 600 clamp(29px, min(8.8vw, 5.1dvh), 46px)/1.04 ${AP_SERIF}; color: var(--vw-ink); text-wrap: balance; overflow-wrap: anywhere; letter-spacing: -.005em; }
.ap-title em { font-style: italic; font-weight: 500; color: var(--vw-accent-deep); }
.ap-sub { margin: 0; font: 500 clamp(14px, 2.05dvh, 16.5px)/1.45 ${AP_SANS}; color: var(--vw-ink-soft); text-wrap: balance; overflow-wrap: anywhere; }
.ap-rule { display: block; width: 74px; height: 10px; margin: 2px auto; background:
  radial-gradient(circle, var(--ap-foil) 0 2.6px, transparent 3px) 50% 50% / 10px 10px no-repeat,
  linear-gradient(90deg, transparent, var(--ap-foil) 30%, transparent 44%, transparent 56%, var(--ap-foil) 70%, transparent) 50% 50% / 100% 1.5px no-repeat; }
@media (min-width: 1100px) { .ap-title { font-size: clamp(42px, 6dvh, 64px); } .ap-sub { font-size: 18px; } .ap-kick { font-size: 13px; } .ap-head { gap: 8px; } }

/* The one way forward: always the same spot, bottom centre, clear of the music icon on its left. */
.ap-next-wrap { position: fixed; z-index: 60; left: 0; right: 0; bottom: calc(env(safe-area-inset-bottom, 0px) + 18px);
  display: flex; justify-content: center; pointer-events: none; padding: 0 62px; box-sizing: border-box; }
@media (min-width: 768px) { .ap-next-wrap { bottom: 30px; } }
.ap-next { pointer-events: auto; position: relative; display: inline-flex; align-items: center; gap: 10px; height: 56px; max-width: 100%; min-width: 0; padding: 0 22px 0 7px;
  border: 0; border-radius: 999px; cursor: pointer; color: #FFFFFF;
  background: linear-gradient(180deg, color-mix(in srgb, var(--vw-accent) 70%, #FFFFFF) 0%, var(--vw-accent) 52%, var(--vw-accent-deep) 100%);
  box-shadow: 0 4px 0 var(--ap-deep), 0 0 0 1.5px color-mix(in srgb, var(--ap-foil) 80%, #FFFFFF), 0 0 0 5px color-mix(in srgb, var(--vw-paper) 72%, transparent), 0 16px 32px -12px color-mix(in srgb, var(--ap-deep) 70%, transparent);
  transition: transform .45s cubic-bezier(.2,.9,.25,1.2), opacity .3s ease, box-shadow .2s ease; touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
.ap-next.is-hidden { opacity: 0; transform: translateY(18px) scale(.9); pointer-events: none; transition-duration: .25s; }
.ap-next:active { transform: translateY(3px) scale(.97); transition-duration: .08s; }
.ap-next:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 5px; }
.ap-next-gloss { position: absolute; left: 14px; right: 14px; top: 4px; height: 40%; border-radius: 999px; background: linear-gradient(180deg, rgba(255,255,255,.5), rgba(255,255,255,0)); pointer-events: none; }
.ap-next-ring { position: absolute; inset: -3px; border-radius: inherit; border: 2px solid var(--ap-foil); opacity: 0; pointer-events: none; animation: ap-ring 2s ease-out 2s infinite; }
@keyframes ap-ring { 0% { opacity: .85; transform: scale(1) } 100% { opacity: 0; transform: scale(1.12, 1.55) } }
.ap-next-ico { position: relative; width: 42px; height: 42px; flex: none; border-radius: 50%; display: grid; place-items: center; font-size: 21px; line-height: 1;
  background: radial-gradient(circle at 40% 35%, #FFFFFF, var(--ap-blush)); box-shadow: inset 0 0 0 1.5px var(--ap-foil), 0 2px 6px color-mix(in srgb, var(--ap-deep) 40%, transparent); animation: ap-bob 1.4s ease-in-out infinite alternate; }
@keyframes ap-bob { from { transform: translateY(-2px) rotate(-8deg) } to { transform: translateY(2px) rotate(8deg) } }
.ap-next-label { position: relative; min-width: 0; font: italic 600 21px/1.2 ${AP_SERIF}; letter-spacing: .01em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-shadow: 0 1px 0 color-mix(in srgb, var(--ap-deep) 55%, transparent); }
.ap-next-arrow { position: relative; font: 600 26px/1 ${AP_SANS}; margin-left: 2px; margin-top: -3px; }
@media (min-width: 1100px) { .ap-next-wrap .ap-next { transform: scale(1.1); transform-origin: 50% 100%; } .ap-next-wrap .ap-next.is-hidden { transform: translateY(18px); } }

/* The chapter trail: small, top-left, level with the editor's top bar (which sits top-right). */
.ap-trail { position: fixed; z-index: 62; top: calc(max(10px, env(safe-area-inset-top, 0px)) + 8px); left: max(12px, env(safe-area-inset-left, 0px));
  display: flex; align-items: center; gap: 0; height: 30px; padding: 0 8px 0 10px; border-radius: 99px; box-sizing: border-box; max-width: calc(100vw - 220px);
  background: color-mix(in srgb, var(--vw-paper) 84%, transparent); border: 1px solid color-mix(in srgb, var(--ap-foil) 60%, var(--vw-edge));
  box-shadow: 0 6px 16px -8px color-mix(in srgb, var(--ap-deep) 45%, transparent); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
@media (min-width: 768px) { .ap-trail { top: 22px; left: 24px; height: 36px; padding: 0 10px 0 14px; } }
.ap-trail-ch { font: italic 600 14px/1 ${AP_SERIF}; color: var(--vw-accent-deep); margin-right: 6px; white-space: nowrap; }
@media (min-width: 768px) { .ap-trail-ch { font-size: 16px; } }
.ap-bead { width: 12px; height: 30px; padding: 0; margin: 0; border: 0; background: none; cursor: default; display: grid; place-items: center; touch-action: manipulation; -webkit-tap-highlight-color: transparent; position: relative; flex: none; }
.ap-bead.is-done::after { content: ""; position: absolute; inset: -7px -1px; }
@media (max-width: 379px) { .ap-bead { width: 9px; } .ap-trail-ch { font-size: 13px; } }
@media (min-width: 768px) { .ap-bead { width: 16px; height: 36px; } }
.ap-bead > span { display: block; width: 7px; height: 7px; border-radius: 50%; box-sizing: border-box; border: 1.5px solid var(--ap-foil); background: transparent; transition: transform .2s ease; }
@media (min-width: 768px) { .ap-bead > span { width: 9px; height: 9px; } }
.ap-bead.is-done { cursor: pointer; }
.ap-bead.is-done > span { background: radial-gradient(circle at 35% 30%, #FFFFFF, var(--ap-foil) 60%, var(--ap-deep)); border-color: var(--ap-foil); }
.ap-bead.is-done:hover > span { transform: scale(1.3); }
.ap-bead.is-here > span { background: var(--vw-accent); border-color: var(--vw-accent-deep); animation: ap-bead-glow 1.6s ease-in-out infinite; }
.ap-bead:focus-visible { outline: 2px solid var(--vw-ink); outline-offset: -2px; border-radius: 8px; }
.ap-bead > span.ap-bead-nope { animation: ap-bead-nope .42s ease-in-out; }
@keyframes ap-bead-glow { 0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--vw-accent) 50%, transparent) } 50% { box-shadow: 0 0 0 4px color-mix(in srgb, var(--vw-accent) 0%, transparent); transform: scale(1.25) } }
@keyframes ap-bead-nope { 0%,100% { transform: translateX(0) } 25% { transform: translateX(-3px) } 60% { transform: translateX(3px) } }
/* The music icon (engine, DayConfig.music.compact) stays bottom-left, level with the pill's middle. */
body .vm-icon { bottom: calc(env(safe-area-inset-bottom, 0px) + 26px); }
body .vm-icon-btn { background: radial-gradient(circle at 50% 38%, var(--vw-accent, #B4813A), var(--vw-accent-deep, #8E6224) 72%); }
@media (min-width: 768px) { body .vm-icon { left: 24px; bottom: 38px; } }

/* The page-turn wipe. Transform/opacity only; input is blocked only while the screen is covered. */
.ap-wipe { position: fixed; inset: 0; z-index: 74; pointer-events: none; overflow: hidden; contain: strict; perspective: 1600px; }
.ap-wipe-page { position: absolute; inset: -4vh -2vw; transform-origin: 0% 50%; will-change: transform, opacity;
  background: linear-gradient(100deg, var(--vw-paper, #FFFDF8) 0%, #FFFFFF 40%, var(--ap-blush, #F6E9D6) 100%);
  box-shadow: -30px 0 60px -20px color-mix(in srgb, var(--ap-deep, #7A5420) 40%, transparent);
  animation: ap-turn var(--ap-wipe) cubic-bezier(.6,.02,.3,1) forwards; display: grid; place-items: center; }
.ap-wipe-curl { position: absolute; top: 0; bottom: 0; left: 0; width: 18%; background: linear-gradient(90deg, color-mix(in srgb, var(--ap-deep, #7A5420) 20%, transparent), transparent); opacity: .6; }
.ap-wipe-mark { font: 400 min(22vw, 22vh)/1 ${AP_SERIF}; color: var(--ap-foil, #C9A15A); opacity: .55; animation: ap-mark var(--ap-wipe) ease-in-out forwards; }
@keyframes ap-turn { 0% { transform: translateX(100%) rotateY(-34deg); opacity: .4 } 46% { transform: translateX(0) rotateY(0); opacity: 1 } 56% { transform: translateX(0) rotateY(0); opacity: 1 } 100% { transform: translateX(-104%) rotateY(28deg); opacity: .2 } }
@keyframes ap-mark { 0%, 30% { transform: scale(.6) rotate(-20deg); opacity: 0 } 50% { transform: scale(1) rotate(0); opacity: .55 } 80%, 100% { transform: scale(1.2); opacity: 0 } }
.ap-wipe-flecks { position: absolute; inset: 0; }
.ap-wipe-flecks i { position: absolute; top: 58%; width: 6px; height: 6px; border-radius: 50%; background: var(--ap-foil, #C9A15A); opacity: 0; box-shadow: 0 0 8px color-mix(in srgb, var(--ap-foil, #C9A15A) 70%, transparent);
  animation: ap-fleck var(--ap-wipe) ease-out var(--d) forwards; }
@keyframes ap-fleck { 0%, 50% { opacity: 0; transform: translateY(0) scale(.4) } 64% { opacity: 1 } 100% { opacity: 0; transform: translateY(calc(var(--h) * -1)) scale(1.1) } }
.ap-wipe.is-soft { background: var(--vw-paper, #FFF); opacity: 0; animation: ap-soft var(--ap-wipe) ease-in-out forwards; }
@keyframes ap-soft { 0% { opacity: 0 } 45% { opacity: 1 } 100% { opacity: 0 } }
.ap-wipe-block { position: fixed; inset: 0; z-index: 75; }

/* Phones. A long label never ellipsizes: the pill keeps clear of the music icon on the left but may use
   the right gutter ("safe center" pins it to the left edge only when it would otherwise overflow). */
@media (max-width: 420px) {
  .ap-next-wrap { padding: 0 max(12px, env(safe-area-inset-right, 0px)) 0 62px; justify-content: safe center; }
  .ap-next { gap: 8px; padding-right: 16px; }
  .ap-next-ico { width: 38px; height: 38px; font-size: 19px; }
  .ap-next-label { font-size: clamp(17px, 5.4vw, 21px); }
}
/* Landscape phones (and in-app browsers turned sideways): the open-book split — the words and the pill on
   the left page, the scene on the right page using the full height. */
@media (orientation: landscape) and (max-height: 520px) and (min-width: 560px) {
  .ap-scene { max-width: none; gap: 8px;
    padding: calc(env(safe-area-inset-top, 0px) + 54px) max(16px, env(safe-area-inset-right, 0px)) calc(env(safe-area-inset-bottom, 0px) + 84px) max(16px, env(safe-area-inset-left, 0px)); }
  .ap-scene[data-split] { display: grid; grid-template-columns: minmax(230px, .8fr) minmax(0, 1.2fr); grid-template-rows: minmax(0, 1fr) auto auto; column-gap: 22px; row-gap: 6px; align-items: center;
    padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 10px); }
  .ap-scene[data-split] > .ap-head { grid-column: 1; grid-row: 1; align-self: center; }
  .ap-scene[data-split] > .ap-fill { grid-column: 2; grid-row: 1 / -1; height: 100%; }
  .ap-scene[data-split] > .ap-foot { grid-column: 1; grid-row: 2; }
  /* the pill's own row at the foot of the left page */
  .ap-scene[data-split]::after { content: ""; grid-column: 1; grid-row: 3; height: 64px; }
  body:has([data-ap-scene][data-split]) .ap-next-wrap { right: auto; width: calc((100vw - 54px) * .4 + 16px); padding: 0 0 0 62px; justify-content: safe center; }
  .ap-title { font-size: clamp(24px, 8dvh, 34px); }
  .ap-sub { font-size: 14px; }
}
`;
