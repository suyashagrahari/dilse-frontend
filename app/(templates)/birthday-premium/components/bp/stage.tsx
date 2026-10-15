"use client";

// The Birthday Storybook stage furniture, shared by every scene:
//
//   • BpStage — the context the scenes talk to: the one Next pill, the little
//     sound cues (the kit's procedural SFX) and the replay round.
//   • useNext(label, onPress, icon) — a scene declares its way forward; the
//     shell draws ONE ribbon pill for it, fixed bottom-centre, so nothing
//     jumps. Only their tap moves on, and that tap turns the page: a big
//     paper page sweeps across the screen with a curl of shadow, the scene is
//     swapped behind it, and it lifts away on the other side.
//   • Bunting — little paper flags top-left; coloured ones are done (tap to
//     go back to that chapter).
//
// Sounds stay silent until the first tap and whenever the visitor mutes.

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import { useDayMusic } from "../../../_valentine/music/context";
import { useUnlockAudioOnFirstTap } from "../../../_valentine/kit/premium/useScare";
import { sfx, type CueId, type CueOptions } from "../../../_valentine/kit/premium/sfx";
import { FONTS } from "../../../_valentine/theme";
import { BP_DISPLAY } from "./fonts";

export type NextIcon = "book" | "wind" | "balloon" | "claw" | "photo" | "cake" | "ticket" | "letter" | "heart" | "sparkle" | "passport" | "stamp";

const ICONS: Record<NextIcon, string> = {
  book: "📖",
  wind: "🌬️",
  balloon: "🎈",
  claw: "🧸",
  photo: "📸",
  cake: "🎂",
  ticket: "🎟️",
  letter: "💌",
  heart: "💗",
  sparkle: "✨",
  passport: "🛂",
  stamp: "💮",
};

interface NextSpec {
  label: string;
  icon: NextIcon;
  onPress: () => void;
  /** false: the press does not change the scene (opens WhatsApp etc.), so no page turn. */
  wipe?: boolean;
}

interface BpApi {
  setNext: (s: NextSpec | null) => void;
  cue: (id: CueId, o?: CueOptions) => void;
  /** Changes on every replay — remounts the scenes' GIFs. */
  round: number;
  /** Play the page turn and run `swap` while the screen is covered (replay, the bunting). */
  go: (swap: () => void) => number;
}

const Ctx = createContext<BpApi | null>(null);
export function useBp(): BpApi {
  const v = useContext(Ctx);
  if (!v) throw new Error("useBp outside BpStage");
  return v;
}

/**
 * A scene's way forward. `null` hides the pill (pass null until the scene's
 * moment is done). It only moves on when they tap it — no auto-advance.
 */
export function useNext(label: string | null, onPress: () => void, icon: NextIcon = "heart", wipe = true) {
  const { setNext } = useBp();
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

export function BpStage({
  round,
  trail,
  flags,
  children,
}: {
  round: number;
  trail: { at: number; rooms: number; ending: boolean; onJump: (k: number) => void };
  flags: readonly string[];
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
        cue("page-turn", { gain: 0.6 });
        cue("paper-rustle", { gain: 0.35, at: coverAt / 1000 });
        cue("sparkle", { gain: 0.25, at: coverAt / 1000 + 0.12 });
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

  const api = useMemo<BpApi>(() => ({ setNext, cue, round, go }), [setNext, cue, round, go]);

  return (
    <Ctx.Provider value={api}>
      <Bunting at={trail.at} rooms={trail.rooms} ending={trail.ending} colors={flags} onJump={(k) => go(() => trail.onJump(k))} />
      {children}
      <NextPill spec={next} onPress={press} />
      {run && <PageTurn key={run.id} soft={run.soft} dur={run.dur} />}
      {blocked && <div className="bp-wipe-block" aria-hidden />}
    </Ctx.Provider>
  );
}

/** The page turn: a sheet of storybook paper sweeps over from the right and lifts away to the left. */
function PageTurn({ soft, dur }: { soft: boolean; dur: number }) {
  if (soft) return <div className="bp-wipe is-soft" style={{ ["--bp-wipe" as string]: `${dur}ms` }} aria-hidden />;
  return (
    <div className="bp-wipe" style={{ ["--bp-wipe" as string]: `${dur}ms` }} aria-hidden>
      <span className="bp-wipe-sheet">
        <span className="bp-wipe-dots" />
        <span className="bp-wipe-curl" />
        <span className="bp-wipe-stars">
          <i>✦</i>
          <i>✿</i>
          <i>✦</i>
          <i>❀</i>
        </span>
      </span>
    </div>
  );
}

function NextPill({ spec, onPress }: { spec: NextSpec | null; onPress: () => void }) {
  const [shown, setShown] = useState<NextSpec | null>(spec);
  if (spec && spec !== shown) setShown(spec);
  const s = spec ?? shown;
  return (
    <div className="bp-next-wrap">
      <button type="button" className={`bp-next${spec ? "" : " is-hidden"}`} onClick={onPress} disabled={!spec} aria-hidden={!spec} tabIndex={spec ? 0 : -1} data-bp-next>
        <span className="bp-next-gloss" aria-hidden />
        {spec && <span key={spec.label} className="bp-next-ring" aria-hidden />}
        <span className="bp-next-ico" aria-hidden>
          {ICONS[s?.icon ?? "heart"]}
        </span>
        <span className="bp-next-label">{s?.label ?? ""}</span>
        <span className="bp-next-arrow" aria-hidden>
          ›
        </span>
      </button>
    </div>
  );
}

/** Paper bunting top-left: coloured flags are done chapters (tap one to go back), the current one sways. */
function Bunting({ at, rooms, ending, colors, onJump }: { at: number; rooms: number; ending: boolean; colors: readonly string[]; onJump: (k: number) => void }) {
  const [nope, setNope] = useState<{ k: number; n: number } | null>(null);
  return (
    <nav className="bp-trail" aria-label={`Chapter ${Math.min(at + 1, rooms)} of ${rooms}`}>
      <span className="bp-trail-string" aria-hidden />
      {Array.from({ length: rooms }, (_, k) => {
        const done = k < at || ending;
        const here = k === at && !ending;
        return (
          <button
            key={k}
            type="button"
            className={`bp-flag${done ? " is-done" : ""}${here ? " is-here" : ""}`}
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
            <span key={nope?.k === k ? `n${nope.n}` : "s"} className={nope?.k === k ? "bp-flag-nope" : undefined} style={{ ["--f" as string]: colors[k % colors.length] }}>
              <svg viewBox="0 0 14 18" width="100%" aria-hidden>
                <path d="M1 1 H13 L7 17 Z" className="bp-flag-p" />
              </svg>
            </span>
          </button>
        );
      })}
    </nav>
  );
}

export const BP_STAGE_CSS = `
/* One scene = one screen: a calm top band (the bunting, level with the editor's top bar / the viewer's
   logo), the scene, then a clear bottom strip for the pill alone (the music icon sits bottom-left). */
.bp-scene { position: relative; z-index: 1; box-sizing: border-box; height: 100vh; height: 100dvh;
  display: flex; flex-direction: column; align-items: center; text-align: center; gap: clamp(8px, 1.9dvh, 20px);
  padding: calc(env(safe-area-inset-top, 0px) + clamp(62px, 8.6dvh, 78px)) 18px max(calc(env(safe-area-inset-bottom, 0px) + 94px), var(--vw-dock-space, 0px));
  width: 100%; max-width: calc(520px * var(--vw-s, 1)); margin: 0 auto; overflow: hidden; color: var(--vw-ink); }
@media (min-width: 768px) { .bp-scene { max-width: 700px; padding-top: calc(var(--vw-top-space, 0px) + 72px); padding-bottom: 116px; gap: clamp(12px, 2.2dvh, 24px); } }
@media (min-width: 1100px) { .bp-scene { max-width: min(800px, 60vw); padding-top: 84px; } }
.bp-fill { position: relative; flex: 1 1 0; min-height: 0; width: 100%; container-type: size; display: grid; grid-template: minmax(0, 1fr) / minmax(0, 1fr); place-items: center; }

.bp-head { flex: none; display: grid; gap: 3px; justify-items: center; max-width: 470px; }
.bp-kick { margin: 0; display: inline-flex; align-items: center; gap: 6px; font: 700 clamp(11px, 1.6dvh, 12.5px)/1.2 ${FONTS.ui}; letter-spacing: .18em; text-transform: uppercase; color: var(--vw-accent-deep); }
.bp-kick::before, .bp-kick::after { content: "✦"; font-size: .9em; color: var(--vw-gold); letter-spacing: 0; }
.bp-title { margin: 0; font: 800 clamp(26px, min(8vw, 4.6dvh), 40px)/1.08 ${BP_DISPLAY}; color: var(--vw-ink); text-wrap: balance; overflow-wrap: anywhere; }
.bp-sub { margin: 0; font: 500 clamp(14px, 2.05dvh, 16.5px)/1.42 ${FONTS.ui}; color: var(--vw-ink-soft); text-wrap: balance; overflow-wrap: anywhere; }
@media (min-width: 1100px) { .bp-title { font-size: clamp(36px, 5dvh, 50px); } .bp-sub { font-size: 17px; } }
.bp-em { font-style: normal; color: var(--vw-accent-deep); }
.bp-hint { flex: none; margin: 0; min-height: 22px; display: inline-flex; gap: 6px; align-items: center; justify-content: center; font: 700 clamp(15px, 2.2dvh, 18px) ${BP_DISPLAY}; color: var(--vw-accent-deep); }
.bp-hint-hand { display: inline-block; animation: bp-point 1.1s ease-in-out infinite alternate; }
@keyframes bp-point { from { transform: translateX(-3px) } to { transform: translateX(4px) } }

/* The one way forward: a ribbon pill, always bottom centre, clear of the music icon on its left. */
.bp-next-wrap { position: fixed; z-index: 60; left: 0; right: 0; bottom: calc(env(safe-area-inset-bottom, 0px) + 18px);
  display: flex; justify-content: center; pointer-events: none; padding: 0 62px; box-sizing: border-box; }
@media (min-width: 768px) { .bp-next-wrap { bottom: 30px; } }
.bp-next { pointer-events: auto; position: relative; display: inline-flex; align-items: center; gap: 9px; height: 56px; max-width: 100%; min-width: 0; padding: 0 20px 0 7px;
  border: 0; border-radius: 999px; cursor: pointer; color: #FFFFFF;
  background: linear-gradient(180deg, color-mix(in srgb, var(--vw-accent) 70%, #FFFFFF) 0%, var(--vw-accent) 52%, var(--vw-accent-deep) 100%);
  box-shadow: 0 5px 0 var(--bp-deep), 0 0 0 4px color-mix(in srgb, var(--vw-paper) 75%, transparent), 0 0 0 5.5px color-mix(in srgb, var(--vw-gold) 70%, transparent), 0 16px 30px -10px color-mix(in srgb, var(--bp-deep) 70%, transparent);
  transition: transform .45s cubic-bezier(.2,.9,.25,1.2), opacity .3s ease, box-shadow .2s ease; touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
.bp-next.is-hidden { opacity: 0; transform: translateY(18px) scale(.9); pointer-events: none; transition-duration: .25s; }
.bp-next:active { transform: translateY(4px) scale(.97); box-shadow: 0 1px 0 var(--bp-deep), 0 0 0 4px color-mix(in srgb, var(--vw-paper) 75%, transparent); transition-duration: .08s; }
.bp-next:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 6px; }
.bp-next-gloss { position: absolute; left: 14px; right: 14px; top: 4px; height: 40%; border-radius: 999px; background: linear-gradient(180deg, rgba(255,255,255,.55), rgba(255,255,255,0)); pointer-events: none; }
.bp-next-ring { position: absolute; inset: -3px; border-radius: inherit; border: 3px solid var(--vw-accent); opacity: 0; pointer-events: none; animation: bp-ring 1.9s ease-out 2s infinite; }
@keyframes bp-ring { 0% { opacity: .8; transform: scale(1) } 100% { opacity: 0; transform: scale(1.12, 1.5) } }
.bp-next-ico { position: relative; width: 42px; height: 42px; flex: none; border-radius: 50%; display: grid; place-items: center; font-size: 22px; line-height: 1;
  background: radial-gradient(circle at 40% 35%, #FFFFFF, var(--bp-blush)); box-shadow: inset 0 -3px 0 color-mix(in srgb, var(--bp-deep) 22%, transparent), 0 2px 6px color-mix(in srgb, var(--bp-deep) 40%, transparent); animation: bp-bob 1.2s ease-in-out infinite alternate; }
@keyframes bp-bob { from { transform: translateY(-2px) rotate(-10deg) } to { transform: translateY(2px) rotate(10deg) } }
.bp-next-label { position: relative; min-width: 0; font: 800 18px/1.25 ${BP_DISPLAY}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-shadow: 0 1px 0 color-mix(in srgb, var(--bp-deep) 55%, transparent); }
.bp-next-arrow { position: relative; font: 700 26px/1 ${FONTS.ui}; margin-left: 2px; margin-top: -3px; }
/* Phones: a long label ("Tell Bartholomew", "I read every word") wraps onto a second line instead of
   being cut to "Turn the…"; the pill keeps clear of the music icon on the left. */
@media (max-width: 479px) {
  .bp-next-wrap { padding: 0 58px; }
  .bp-next { gap: 7px; padding: 0 14px 0 6px; }
  .bp-next-ico { width: 38px; height: 38px; font-size: 20px; }
  .bp-next-label { font-size: 16px; line-height: 1.1; white-space: normal; text-overflow: clip; text-align: left; text-wrap: balance;
    display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; line-clamp: 2; }
}
@media (min-width: 1100px) { .bp-next-wrap .bp-next { transform: scale(1.1); transform-origin: 50% 100%; } .bp-next-wrap .bp-next.is-hidden { transform: translateY(18px); } }
@media (prefers-reduced-motion: reduce) { .bp-next-ico, .bp-next-ring, .bp-hint-hand { animation: none; } }

/* The bunting: small, top-left, level with the editor's top bar (which sits top-right). */
.bp-trail { position: fixed; z-index: 62; top: calc(max(10px, env(safe-area-inset-top, 0px)) + 8px); left: max(12px, env(safe-area-inset-left, 0px));
  display: flex; align-items: flex-start; gap: 2px; height: 34px; padding: 4px 9px 0; border-radius: 14px; box-sizing: border-box;
  background: color-mix(in srgb, var(--vw-paper) 84%, transparent); border: 1.5px solid var(--vw-edge);
  box-shadow: 0 6px 16px -8px color-mix(in srgb, var(--bp-deep) 50%, transparent); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
@media (min-width: 768px) { .bp-trail { top: 22px; left: 24px; height: 40px; } }
.bp-trail-string { position: absolute; left: 6px; right: 6px; top: 6px; height: 6px; border-top: 1.5px solid color-mix(in srgb, var(--vw-ink) 40%, transparent); border-radius: 50%; pointer-events: none; }
.bp-flag { position: relative; width: 15px; height: 28px; padding: 0; margin: 0; border: 0; background: none; cursor: default; display: block; touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
.bp-flag.is-done::after { content: ""; position: absolute; inset: -6px -1px; }
@media (max-width: 479px) { .bp-flag { width: 13px; } .bp-trail { padding: 4px 7px 0; } }
@media (max-width: 359px) { .bp-flag { width: 11px; } }
@media (min-width: 768px) { .bp-flag { width: 19px; height: 34px; } }
.bp-flag > span { display: block; width: 100%; margin-top: 3px; transform-origin: 50% 0; }
.bp-flag-p { fill: color-mix(in srgb, var(--vw-paper) 60%, transparent); stroke: var(--vw-edge); stroke-width: 1.3; }
.bp-flag.is-done .bp-flag-p, .bp-flag.is-here .bp-flag-p { fill: var(--f); stroke: color-mix(in srgb, var(--f) 70%, #000); stroke-opacity: .35; }
.bp-flag.is-done { cursor: pointer; }
.bp-flag.is-done:hover > span { transform: scale(1.15); }
.bp-flag.is-here > span { animation: bp-sway 1.3s ease-in-out infinite alternate; }
.bp-flag:focus-visible { outline: 2px solid var(--vw-ink); outline-offset: 0; border-radius: 6px; }
.bp-flag > span.bp-flag-nope { animation: bp-nope .42s ease-in-out; }
@keyframes bp-sway { from { transform: rotate(-9deg) } to { transform: rotate(9deg) } }
@keyframes bp-nope { 0%,100% { transform: rotate(0) } 20% { transform: rotate(-18deg) } 45% { transform: rotate(14deg) } 70% { transform: rotate(-8deg) } }
@media (prefers-reduced-motion: reduce) { .bp-flag.is-here > span { animation: none; } }
/* The music icon (engine, DayConfig.music.compact) stays bottom-left, level with the pill's middle. */
body .vm-icon { bottom: calc(env(safe-area-inset-bottom, 0px) + 26px); }
@media (min-width: 768px) { body .vm-icon { left: 24px; bottom: 38px; } }

/* The page turn. Transform/opacity only; input is blocked only while the screen is covered. */
.bp-wipe { position: fixed; inset: 0; z-index: 74; pointer-events: none; overflow: hidden; contain: strict; perspective: 1600px; }
.bp-wipe-sheet { position: absolute; top: -4vh; bottom: -4vh; left: 0; width: 135vw; transform-origin: 0 50%; will-change: transform;
  background: linear-gradient(90deg, color-mix(in srgb, var(--bp-deep, #A02B50) 18%, var(--bp-blush, #FFE4EA)) 0, var(--bp-blush, #FFE4EA) 4%, var(--vw-paper, #FFF) 40%, var(--vw-base, #FFF8E8) 100%);
  box-shadow: -30px 0 60px -10px color-mix(in srgb, var(--bp-deep, #A02B50) 35%, transparent);
  animation: bp-turn var(--bp-wipe) cubic-bezier(.6,.02,.3,1) forwards; }
@keyframes bp-turn { 0% { transform: translateX(105vw) skewX(-14deg) } 47% { transform: translateX(-12vw) skewX(0) } 53% { transform: translateX(-14vw) skewX(0) } 100% { transform: translateX(-150vw) skewX(10deg) } }
.bp-wipe-dots { position: absolute; inset: 0; opacity: .45; background: radial-gradient(circle, color-mix(in srgb, var(--vw-gold, #FFCF5C) 70%, transparent) 0 2px, transparent 2.6px) 0 0 / 26px 26px; }
.bp-wipe-curl { position: absolute; left: 0; top: 0; bottom: 0; width: 70px; background: linear-gradient(90deg, rgba(255,255,255,.95), rgba(255,255,255,0)); }
.bp-wipe-stars { position: absolute; left: 50vw; top: 50%; width: 0; height: 0; }
.bp-wipe-stars i { position: absolute; font-style: normal; font-size: 30px; color: var(--vw-accent, #E5527A); opacity: .75; }
.bp-wipe-stars i:nth-child(1) { left: -60px; top: -80px; } .bp-wipe-stars i:nth-child(2) { left: 40px; top: -30px; color: var(--vw-gold, #FFCF5C); }
.bp-wipe-stars i:nth-child(3) { left: -20px; top: 50px; } .bp-wipe-stars i:nth-child(4) { left: 70px; top: 80px; color: var(--vw-gold, #FFCF5C); }
.bp-wipe.is-soft { background: var(--vw-paper, #FFF); opacity: 0; animation: bp-soft var(--bp-wipe) ease-in-out forwards; }
@keyframes bp-soft { 0% { opacity: 0 } 45% { opacity: 1 } 100% { opacity: 0 } }
.bp-wipe-block { position: fixed; inset: 0; z-index: 75; }

/* A phone turned sideways (or any very short, wide window): one stacked column would leave the scene
   ~120px tall, so the heading moves to a left column and the scene gets the whole right side, nearly
   floor to ceiling. The Next pill sits under the heading, clear of the music icon. */
@media (orientation: landscape) and (max-height: 520px) {
  .bp-scene { max-width: min(100%, 980px); flex-flow: column wrap; align-content: center; justify-content: center; column-gap: 20px; row-gap: 8px;
    padding: calc(env(safe-area-inset-top, 0px) + 58px) max(16px, env(safe-area-inset-right, 0px)) calc(env(safe-area-inset-bottom, 0px) + 10px) max(16px, env(safe-area-inset-left, 0px)); }
  .bp-scene > .bp-fill { width: calc(60% - 10px); }
  .bp-scene > .bp-head { flex: 0 0 100%; width: calc(40% - 10px); align-content: center; padding-bottom: 76px; box-sizing: border-box; }
  .bp-scene:not(:has(> .bp-head)) { padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 80px); }
  .bp-scene:not(:has(> .bp-head)) > .bp-fill { width: 100%; }
  .bp-title { font-size: clamp(22px, 7dvh, 32px); }
  .bp-next-wrap { right: auto; width: 40%; padding: 0 10px 0 62px; bottom: calc(env(safe-area-inset-bottom, 0px) + 12px); }
  body .vm-icon { bottom: calc(env(safe-area-inset-bottom, 0px) + 20px); }
}
`;
