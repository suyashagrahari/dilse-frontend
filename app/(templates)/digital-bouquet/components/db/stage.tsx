"use client";

// The Digital Bouquet stage, shared by every scene:
//
//   • DbStage — the context the scenes talk to: ONE Next pill (fixed bottom
//     centre, so nothing jumps), the little sound cues (the kit's procedural
//     SFX, silent until the first tap and whenever the visitor mutes) and
//     the replay round.
//   • useNext(label, onPress, icon) — a scene declares its way forward. Only
//     her tap moves on, and that tap plays the petal wipe: a flurry of petals
//     sweeps across, the scene is swapped behind it, and it settles.
//   • BudTrail — little buds top-left, one per scene; done ones have bloomed
//     (tap one to go back).

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import { useDayMusic } from "../../../_valentine/music/context";
import { useUnlockAudioOnFirstTap } from "../../../_valentine/kit/premium/useScare";
import { sfx, type CueId, type CueOptions } from "../../../_valentine/kit/premium/sfx";
import { DB_SANS, DB_SERIF } from "./fonts";

export type NextIcon = "bouquet" | "flower" | "water" | "photo" | "letter" | "heart" | "gift" | "sparkle";
const ICONS: Record<NextIcon, string> = { bouquet: "💐", flower: "🌷", water: "💧", photo: "📸", letter: "💌", heart: "💗", gift: "🎁", sparkle: "✨" };

interface NextSpec {
  label: string;
  icon: NextIcon;
  onPress: () => void;
  wipe?: boolean;
}

interface DbApi {
  setNext: (s: NextSpec | null) => void;
  cue: (id: CueId, o?: CueOptions) => void;
  round: number;
  go: (swap: () => void) => number;
}

const Ctx = createContext<DbApi | null>(null);
export function useDb(): DbApi {
  const v = useContext(Ctx);
  if (!v) throw new Error("useDb outside DbStage");
  return v;
}

/** A scene's way forward; `null` hides the pill until the scene's moment is done. */
export function useNext(label: string | null, onPress: () => void, icon: NextIcon = "heart", wipe = true) {
  const { setNext } = useDb();
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
const COVER_AT = 0.46;

export function DbStage({
  round,
  trail,
  petals,
  children,
}: {
  round: number;
  trail: { at: number; rooms: number; ending: boolean; onJump: (k: number) => void };
  petals: readonly string[];
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
        cue("swoosh-soft", { gain: 0.45 });
        cue("sparkle", { gain: 0.22, at: coverAt / 1000 + 0.1 });
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

  const api = useMemo<DbApi>(() => ({ setNext, cue, round, go }), [setNext, cue, round, go]);

  return (
    <Ctx.Provider value={api}>
      <BudTrail at={trail.at} rooms={trail.rooms} ending={trail.ending} onJump={(k) => go(() => trail.onJump(k))} />
      {children}
      <NextPill spec={next} onPress={press} />
      {run && <Wipe key={run.id} soft={run.soft} dur={run.dur} petals={petals} />}
      {blocked && <div className="db-wipe-block" aria-hidden />}
    </Ctx.Provider>
  );
}

const FLURRY = Array.from({ length: 22 }, (_, k) => ({ top: (k * 37) % 100, d: (k % 6) * 30, s: 14 + ((k * 13) % 22), r: (k * 47) % 360 }));

function Wipe({ soft, dur, petals }: { soft: boolean; dur: number; petals: readonly string[] }) {
  if (soft) return <div className="db-wipe is-soft" style={{ ["--db-wipe" as string]: `${dur}ms` }} aria-hidden />;
  return (
    <div className="db-wipe" style={{ ["--db-wipe" as string]: `${dur}ms` }} aria-hidden>
      <span className="db-wipe-veil" />
      {FLURRY.map((p, k) => (
        <i
          key={k}
          className="db-wipe-petal"
          style={{ top: `${p.top}%`, width: p.s, height: p.s * 1.25, background: `linear-gradient(135deg, #FFFFFF, ${petals[k % petals.length]})`, ["--d" as string]: `${p.d}ms`, ["--r" as string]: `${p.r}deg` }}
        />
      ))}
    </div>
  );
}

function NextPill({ spec, onPress }: { spec: NextSpec | null; onPress: () => void }) {
  const [shown, setShown] = useState<NextSpec | null>(spec);
  if (spec && spec !== shown) setShown(spec);
  const s = spec ?? shown;
  return (
    <div className="db-next-wrap">
      <button type="button" className={`db-next${spec ? "" : " is-hidden"}`} onClick={onPress} disabled={!spec} aria-hidden={!spec} tabIndex={spec ? 0 : -1} data-db-next>
        <span className="db-next-gloss" aria-hidden />
        {spec && <span key={spec.label} className="db-next-ring" aria-hidden />}
        <span className="db-next-ico" aria-hidden>
          {ICONS[s?.icon ?? "heart"]}
        </span>
        <span className="db-next-label">{s?.label ?? ""}</span>
        <span className="db-next-arrow" aria-hidden>
          ›
        </span>
      </button>
    </div>
  );
}

function BudTrail({ at, rooms, ending, onJump }: { at: number; rooms: number; ending: boolean; onJump: (k: number) => void }) {
  return (
    <nav className="db-trail" aria-label={`Scene ${Math.min(at + 1, rooms)} of ${rooms}`}>
      {Array.from({ length: rooms }, (_, k) => {
        const done = k < at || ending;
        const here = k === at && !ending;
        return (
          <button
            key={k}
            type="button"
            className={`db-bud${done ? " is-done" : ""}${here ? " is-here" : ""}`}
            aria-label={done ? `Back to scene ${k + 1}` : here ? `Scene ${k + 1}, you are here` : `Scene ${k + 1}, not yet`}
            aria-current={here ? "step" : undefined}
            disabled={!done}
            onClick={() => {
              if (done) {
                haptic(10);
                onJump(k);
              }
            }}
          >
            <span />
          </button>
        );
      })}
    </nav>
  );
}

export const DB_STAGE_CSS = `
.db-scene { position: relative; z-index: 1; box-sizing: border-box; height: 100vh; height: 100dvh;
  display: flex; flex-direction: column; align-items: center; text-align: center; gap: clamp(6px, 1.6dvh, 18px);
  padding: calc(env(safe-area-inset-top, 0px) + clamp(58px, 8.4dvh, 76px)) 18px max(calc(env(safe-area-inset-bottom, 0px) + 92px), var(--vw-dock-space, 0px));
  width: 100%; max-width: 560px; margin: 0 auto; overflow: hidden; color: var(--vw-ink); }
@media (min-width: 768px) { .db-scene { max-width: 760px; padding-top: calc(var(--vw-top-space, 0px) + 74px); padding-bottom: 110px; } }
@media (min-width: 1100px) {
  .db-scene { max-width: min(1240px, 94vw); padding: 84px 40px 108px; }
  .db-scene[data-split] { display: grid; grid-template-columns: minmax(300px, .8fr) minmax(0, 1.2fr); grid-template-rows: minmax(0, 1fr) auto; column-gap: clamp(28px, 4vw, 64px); row-gap: 14px; align-items: center; text-align: left; }
  .db-scene[data-split] > .db-head { grid-column: 1; grid-row: 1; justify-items: start; align-self: center; max-width: 460px; }
  .db-scene[data-split] > .db-fill { grid-column: 2; grid-row: 1 / span 2; height: 100%; }
  .db-scene[data-split] > .db-foot { grid-column: 1; grid-row: 2; justify-self: start; align-self: start; }
}
/* A split scene without a heading (the ending's postcard) stays one column. */
.db-scene[data-split]:not(:has(> .db-head)) { display: flex !important; }
.db-scene[data-split]:not(:has(> .db-head))::after { display: none; }
.db-fill { position: relative; flex: 1 1 0; min-height: 0; width: 100%; container-type: size; display: grid; grid-template: minmax(0, 1fr) / minmax(0, 1fr); place-items: center; }
.db-foot { flex: none; min-height: 20px; display: flex; justify-content: center; align-items: center; gap: 8px; flex-wrap: wrap; }
.db-bq { position: relative; width: min(100cqw, 71cqh, 560px); }
.db-head { flex: none; display: grid; gap: 4px; justify-items: center; max-width: 500px; }
.db-kick { margin: 0; font: 700 clamp(10.5px, 1.6dvh, 12.5px)/1.2 ${DB_SANS}; letter-spacing: .2em; text-transform: uppercase; color: var(--vw-accent-deep); }
.db-title { margin: 0; font: 600 clamp(28px, min(8.6vw, 5dvh), 46px)/1.05 ${DB_SERIF}; color: var(--vw-ink); text-wrap: balance; overflow-wrap: anywhere; }
.db-title em { font-style: italic; color: var(--vw-accent-deep); }
.db-sub { margin: 0; font: 500 clamp(14px, 2dvh, 16.5px)/1.45 ${DB_SANS}; color: var(--vw-ink-soft); text-wrap: balance; overflow-wrap: anywhere; }
@media (min-width: 1100px) { .db-title { font-size: clamp(42px, 6dvh, 62px); } .db-sub { font-size: 18px; } .db-kick { font-size: 13px; } }

.db-next-wrap { position: fixed; z-index: 60; left: 0; right: 0; bottom: calc(env(safe-area-inset-bottom, 0px) + 18px); display: flex; justify-content: center; pointer-events: none; padding: 0 62px; box-sizing: border-box; }
@media (min-width: 768px) { .db-next-wrap { bottom: 30px; } }
.db-next { pointer-events: auto; position: relative; display: inline-flex; align-items: center; gap: 10px; height: 56px; max-width: 100%; min-width: 0; padding: 0 22px 0 7px; border: 0; border-radius: 999px; cursor: pointer; color: #FFFFFF;
  background: linear-gradient(180deg, color-mix(in srgb, var(--vw-accent) 70%, #FFFFFF) 0%, var(--vw-accent) 52%, var(--vw-accent-deep) 100%);
  box-shadow: 0 4px 0 var(--db-deep), 0 0 0 5px color-mix(in srgb, var(--vw-paper) 72%, transparent), 0 16px 32px -12px color-mix(in srgb, var(--db-deep) 70%, transparent);
  transition: transform .45s cubic-bezier(.2,.9,.25,1.2), opacity .3s ease; touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
.db-next.is-hidden { opacity: 0; transform: translateY(18px) scale(.9); pointer-events: none; transition-duration: .25s; }
.db-next:active { transform: translateY(3px) scale(.97); transition-duration: .08s; }
.db-next:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 5px; }
.db-next-gloss { position: absolute; left: 14px; right: 14px; top: 4px; height: 40%; border-radius: 999px; background: linear-gradient(180deg, rgba(255,255,255,.5), rgba(255,255,255,0)); pointer-events: none; }
.db-next-ring { position: absolute; inset: -3px; border-radius: inherit; border: 2px solid var(--vw-accent); opacity: 0; pointer-events: none; animation: db-ring 2s ease-out 2s infinite; }
@keyframes db-ring { 0% { opacity: .8; transform: scale(1); } 100% { opacity: 0; transform: scale(1.12, 1.55); } }
.db-next-ico { position: relative; width: 42px; height: 42px; flex: none; border-radius: 50%; display: grid; place-items: center; font-size: 21px; line-height: 1; background: radial-gradient(circle at 40% 35%, #FFFFFF, var(--db-blush)); animation: db-bob 1.4s ease-in-out infinite alternate; }
@keyframes db-bob { from { transform: translateY(-2px) rotate(-8deg); } to { transform: translateY(2px) rotate(8deg); } }
.db-next-label { position: relative; min-width: 0; font: italic 600 21px/1.2 ${DB_SERIF}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-shadow: 0 1px 0 color-mix(in srgb, var(--db-deep) 55%, transparent); }
.db-next-arrow { position: relative; font: 600 26px/1 ${DB_SANS}; margin-left: 2px; margin-top: -3px; }
@media (max-width: 420px) {
  .db-next-wrap { padding: 0 max(12px, env(safe-area-inset-right, 0px)) 0 62px; justify-content: safe center; }
  .db-next { gap: 8px; padding-right: 16px; }
  .db-next-ico { width: 38px; height: 38px; font-size: 19px; }
  .db-next-label { font-size: clamp(17px, 5.4vw, 21px); }
}

.db-trail { position: fixed; z-index: 62; top: calc(max(10px, env(safe-area-inset-top, 0px)) + 8px); left: max(12px, env(safe-area-inset-left, 0px)); display: flex; align-items: center; height: 30px; padding: 0 8px; border-radius: 99px;
  background: color-mix(in srgb, var(--vw-paper) 84%, transparent); border: 1px solid var(--vw-edge); box-shadow: 0 6px 16px -8px color-mix(in srgb, var(--db-deep) 45%, transparent); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
@media (min-width: 768px) { .db-trail { top: 22px; left: 24px; height: 36px; padding: 0 12px; } }
.db-bud { width: 14px; height: 30px; padding: 0; border: 0; background: none; display: grid; place-items: center; position: relative; flex: none; cursor: default; }
.db-bud.is-done { cursor: pointer; }
.db-bud.is-done::after { content: ""; position: absolute; inset: -7px -1px; }
.db-bud > span { width: 7px; height: 9px; border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%; border: 1.5px solid var(--vw-accent); box-sizing: border-box; transition: transform .2s ease; }
.db-bud.is-done > span { width: 10px; height: 10px; border-radius: 50%; border: 0; background: radial-gradient(circle at 50% 50%, #FFE08A 0 22%, var(--vw-accent) 26%); box-shadow: 0 0 0 2px color-mix(in srgb, var(--vw-accent) 30%, transparent); }
.db-bud.is-here > span { background: var(--vw-accent); animation: db-bud 1.6s ease-in-out infinite; }
@keyframes db-bud { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.35); } }
.db-bud:focus-visible { outline: 2px solid var(--vw-ink); outline-offset: -2px; border-radius: 8px; }
@media (max-width: 379px) { .db-bud { width: 11px; } }

body .vm-icon { bottom: calc(env(safe-area-inset-bottom, 0px) + 26px); }
@media (min-width: 768px) { body .vm-icon { left: 24px; bottom: 38px; } }

.db-wipe { position: fixed; inset: 0; z-index: 74; pointer-events: none; overflow: hidden; contain: strict; }
.db-wipe-veil { position: absolute; inset: 0; background: radial-gradient(120% 90% at 50% 50%, var(--vw-paper), var(--db-blush)); opacity: 0; animation: db-veil var(--db-wipe) ease-in-out forwards; }
@keyframes db-veil { 0% { opacity: 0; } 40%, 56% { opacity: 1; } 100% { opacity: 0; } }
.db-wipe-petal { position: absolute; left: -8%; border-radius: 80% 0 80% 0; opacity: 0; box-shadow: inset 0 0 0 1px rgba(255,255,255,.6); animation: db-fly var(--db-wipe) cubic-bezier(.4,.1,.4,1) var(--d) forwards; }
@keyframes db-fly { 0% { transform: translate(0, 0) rotate(var(--r)); opacity: 0; } 15% { opacity: 1; } 85% { opacity: 1; } 100% { transform: translate(118vw, -14vh) rotate(calc(var(--r) + 420deg)); opacity: 0; } }
.db-wipe.is-soft { background: var(--vw-paper); opacity: 0; animation: db-soft var(--db-wipe) ease-in-out forwards; }
@keyframes db-soft { 0% { opacity: 0; } 45% { opacity: 1; } 100% { opacity: 0; } }
.db-wipe-block { position: fixed; inset: 0; z-index: 75; }

@media (orientation: landscape) and (max-height: 520px) and (min-width: 560px) {
  .db-scene { max-width: none; gap: 6px; padding: calc(env(safe-area-inset-top, 0px) + 50px) max(16px, env(safe-area-inset-right, 0px)) calc(env(safe-area-inset-bottom, 0px) + 80px) max(16px, env(safe-area-inset-left, 0px)); }
  .db-scene[data-split] { display: grid; grid-template-columns: minmax(230px, .85fr) minmax(0, 1.15fr); grid-template-rows: minmax(0, 1fr) auto auto; column-gap: 22px; row-gap: 6px; align-items: center; padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 10px); }
  .db-scene[data-split] > .db-head { grid-column: 1; grid-row: 1; align-self: center; }
  .db-scene[data-split] > .db-fill { grid-column: 2; grid-row: 1 / -1; height: 100%; }
  .db-scene[data-split] > .db-foot { grid-column: 1; grid-row: 2; }
  .db-scene[data-split]::after { content: ""; grid-column: 1; grid-row: 3; height: 80px; }
  body:has([data-db-scene][data-split] > .db-head) .db-next-wrap { right: auto; width: calc((100vw - 54px) * .425 + 16px); padding: 0 0 0 62px; justify-content: safe center; }
  .db-title { font-size: clamp(24px, 8dvh, 34px); }
  .db-sub { font-size: 14px; }
}
`;
