"use client";

// The museum's furniture, shared by every room:
//
//   • HaStage — the context the rooms talk to: the one Next pill, the sound
//     cues (the kit's procedural SFX), the replay round and the room change.
//   • useNext(label, onPress, icon) — a room declares its way forward; the
//     shell draws ONE glossy pill for it, fixed bottom-centre. Only her tap moves
//     on, and that tap plays the gallery doors: two wall panels slide shut from
//     both sides with a brass room plaque ("Room 3 · The Portrait Gallery") on
//     the seam, the room changes behind them, and they slide open again.
//   • RoomTrail — the progress, top-left: little empty frames for the rooms to
//     come, framed hearts for the ones she has seen (tap one to go back).
//
// Sounds stay silent until the first tap and whenever the visitor mutes.

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import { useDayMusic } from "../../../_valentine/music/context";
import { useUnlockAudioOnFirstTap } from "../../../_valentine/kit/premium/useScare";
import { sfx, type CueId, type CueOptions } from "../../../_valentine/kit/premium/sfx";
import { FONTS } from "../../../_valentine/theme";
import { HA_CAPS, HA_DISPLAY } from "./fonts";
import { Wall } from "./ui";

export type NextIcon = "ticket" | "clock" | "frame" | "audio" | "brush" | "snow" | "book" | "heart" | "trophy" | "sparkle" | "door";

const ICONS: Record<NextIcon, string> = {
  ticket: "🎟️",
  clock: "⏰",
  frame: "🖼️",
  audio: "🎧",
  brush: "🖌️",
  snow: "❄️",
  book: "📖",
  heart: "💗",
  trophy: "🏆",
  sparkle: "✨",
  door: "🚪",
};

interface NextSpec {
  label: string;
  icon: NextIcon;
  onPress: () => void;
  /** false: the press does not change the room (opens WhatsApp etc.), so no doors. */
  wipe?: boolean;
}

interface HaApi {
  setNext: (s: NextSpec | null) => void;
  cue: (id: CueId, o?: CueOptions) => void;
  /** Changes on every replay — remounts the rooms' GIFs. */
  round: number;
  /** Close the doors and run `swap` while the screen is covered (replay, the trail). */
  go: (swap: () => void, plaque?: Plaque) => number;
}

export interface Plaque {
  no: string;
  name: string;
}

const Ctx = createContext<HaApi | null>(null);
export function useHa(): HaApi {
  const v = useContext(Ctx);
  if (!v) throw new Error("useHa outside HaStage");
  return v;
}

/** A room's way forward. `null` hides the pill until the room's moment is done. */
export function useNext(label: string | null, onPress: () => void, icon: NextIcon = "heart", wipe = true) {
  const { setNext } = useHa();
  const fn = useRef(onPress);
  useLayoutEffect(() => {
    fn.current = onPress;
  });
  useEffect(() => {
    setNext(label ? { label, icon, wipe, onPress: () => fn.current() } : null);
  }, [label, icon, wipe, setNext]);
  useEffect(() => () => setNext(null), [setNext]);
}

const DOORS = { full: 1050, soft: 460 } as const;
const COVER_AT = 0.47;

export function HaStage({
  round,
  trail,
  petals,
  petalChars,
  children,
}: {
  round: number;
  /** names[k] = the plaque for room k (k = 0 is the ticket booth). */
  trail: { at: number; names: readonly Plaque[]; ending: boolean; onJump: (k: number) => void };
  petals: boolean;
  petalChars: readonly string[];
  children: ReactNode;
}) {
  const music = useDayMusic();
  useUnlockAudioOnFirstTap();
  const reduced = useReducedMotion();
  const [next, setNextState] = useState<NextSpec | null>(null);
  const [run, setRun] = useState<{ id: number; soft: boolean; dur: number; plaque: Plaque | null } | null>(null);
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
    (swap: () => void, plaque?: Plaque): number => {
      if (busy.current) return 0;
      busy.current = true;
      const soft = reduced;
      const dur = soft ? DOORS.soft : DOORS.full;
      const coverAt = Math.round(dur * COVER_AT);
      const at = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));
      if (!soft) {
        cue("swoosh-soft", { gain: 0.38 });
        cue("glass-ping", { gain: 0.22, at: coverAt / 1000 - 0.04 });
        at(coverAt, () => haptic(10));
      }
      setRun({ id: performance.now(), soft, dur, plaque: plaque ?? null });
      setBlocked(true);
      at(coverAt, swap);
      at(Math.round(dur * 0.74), () => setBlocked(false));
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
    cue("pop", { gain: 0.42 });
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
    restore(go(spec.onPress, trail.names[trail.at + 1]) + 250);
  };

  const api = useMemo<HaApi>(() => ({ setNext, cue, round, go }), [setNext, cue, round, go]);

  return (
    <Ctx.Provider value={api}>
      <Wall petals={petals} chars={petalChars} />
      <RoomTrail at={trail.at} rooms={trail.names.length} ending={trail.ending} onJump={(k) => go(() => trail.onJump(k), trail.names[k])} />
      {children}
      <NextPill spec={next} onPress={press} />
      {run && <Doors key={run.id} soft={run.soft} dur={run.dur} plaque={run.plaque} />}
      {blocked && <div className="ha-doors-block" aria-hidden />}
    </Ctx.Provider>
  );
}

/** Two wall panels close from both sides, a room plaque on the seam, then they open. */
function Doors({ soft, dur, plaque }: { soft: boolean; dur: number; plaque: Plaque | null }) {
  if (soft) return <div className="ha-doors is-soft" style={{ ["--ha-door" as string]: `${dur}ms` }} aria-hidden />;
  return (
    <div className="ha-doors" style={{ ["--ha-door" as string]: `${dur}ms` }} aria-hidden>
      <span className="ha-door is-l">
        <i />
      </span>
      <span className="ha-door is-r">
        <i />
      </span>
      {plaque && (
        <span className="ha-door-plaque">
          <b>{plaque.no}</b>
          <em>{plaque.name}</em>
        </span>
      )}
    </div>
  );
}

function NextPill({ spec, onPress }: { spec: NextSpec | null; onPress: () => void }) {
  const [shown, setShown] = useState<NextSpec | null>(spec);
  if (spec && spec !== shown) setShown(spec);
  const s = spec ?? shown;
  return (
    <div className="ha-next-wrap">
      <button type="button" className={`ha-next${spec ? "" : " is-hidden"}`} onClick={onPress} disabled={!spec} aria-hidden={!spec} tabIndex={spec ? 0 : -1} data-ha-next>
        <span className="ha-next-gloss" aria-hidden />
        {spec && <span key={spec.label} className="ha-next-ring" aria-hidden />}
        <span className="ha-next-ico" aria-hidden>
          {ICONS[s?.icon ?? "heart"]}
        </span>
        <span className="ha-next-label">{s?.label ?? ""}</span>
        <span className="ha-next-arrow" aria-hidden>
          ›
        </span>
      </button>
    </div>
  );
}

/** Empty frames to go, framed hearts for the rooms she has seen (tap one to go back). */
function RoomTrail({ at, rooms, ending, onJump }: { at: number; rooms: number; ending: boolean; onJump: (k: number) => void }) {
  return (
    <nav className="ha-trail" aria-label={`Room ${Math.min(at + 1, rooms)} of ${rooms}`}>
      {Array.from({ length: rooms }, (_, k) => {
        const done = k < at || ending;
        const here = k === at && !ending;
        return (
          <button
            key={k}
            type="button"
            className={`ha-tk${done ? " is-done" : ""}${here ? " is-here" : ""}`}
            aria-label={done ? `Back to room ${k + 1}` : here ? `Room ${k + 1}, you are here` : `Room ${k + 1}, not yet`}
            aria-current={here ? "step" : undefined}
            disabled={!done}
            onClick={() => {
              if (!done) return;
              haptic(10);
              onJump(k);
            }}
          >
            <svg viewBox="0 0 20 24" width="100%" aria-hidden>
              <rect x="2" y="3" width="16" height="18" rx="1.6" fill={done ? "var(--ha-blush)" : here ? "var(--vw-paper)" : "none"} stroke={done || here ? "var(--ha-gilt-b)" : "var(--vw-gold)"} strokeWidth="2.2" />
              {done && <path d="M10 16.2 C6.6 13.8 5.6 12.1 6 10.6 C6.4 9.1 8.5 8.8 10 10.4 C11.5 8.8 13.6 9.1 14 10.6 C14.4 12.1 13.4 13.8 10 16.2 Z" fill="var(--vw-accent)" />}
              {here && <circle cx="10" cy="12" r="2.6" fill="var(--vw-accent)" />}
            </svg>
          </button>
        );
      })}
    </nav>
  );
}

export const HA_STAGE_CSS = `
.ha-scene { position: relative; z-index: 2; box-sizing: border-box; height: 100vh; height: 100dvh;
  display: flex; flex-direction: column; align-items: center; text-align: center; gap: clamp(8px, 1.8dvh, 18px);
  padding: calc(env(safe-area-inset-top, 0px) + clamp(62px, 8.6dvh, 78px)) 18px max(calc(env(safe-area-inset-bottom, 0px) + 94px), var(--vw-dock-space, 0px));
  width: 100%; max-width: calc(520px * var(--vw-s, 1)); margin: 0 auto; overflow: hidden; color: var(--vw-ink); }
@media (min-width: 768px) { .ha-scene { max-width: 760px; padding-top: calc(var(--vw-top-space, 0px) + 74px); padding-bottom: 112px; gap: clamp(10px, 2dvh, 22px); } }
@media (min-width: 1100px) { .ha-scene { max-width: min(1120px, 86vw); padding-top: 80px; padding-bottom: 118px; } }
@media (min-width: 1100px) { .ha-zoom { zoom: var(--hz, 1.12); } }
@media (min-width: 1100px) and (min-height: 1000px) { .ha-zoom { zoom: calc(var(--hz, 1.12) * 1.12); } }
.ha-fill { position: relative; flex: 1 1 0; min-height: 0; width: 100%; container-type: size; display: grid; grid-template: minmax(0, 1fr) / minmax(0, 1fr); place-items: center; }

.ha-head { flex: none; display: grid; gap: 3px; justify-items: center; max-width: 560px; }
.ha-kick { margin: 0; display: inline-flex; align-items: center; gap: 7px; padding: 4px 12px 3px; border-radius: 3px; font: 700 clamp(11.5px, 1.5dvh, 12.5px)/1.3 ${HA_CAPS}; letter-spacing: .16em; text-transform: uppercase;
  color: var(--ha-deep); background: linear-gradient(180deg, #FFFDF6, color-mix(in srgb, var(--ha-gilt-a) 45%, #FFFFFF)); box-shadow: 0 0 0 1.5px var(--ha-gilt-b), 0 3px 8px -4px color-mix(in srgb, var(--ha-deep) 50%, transparent); }
.ha-title { margin: 0; font: 700 clamp(30px, min(9vw, 5.2dvh), 46px)/1.02 ${HA_DISPLAY}; color: var(--vw-ink); text-wrap: balance; overflow-wrap: anywhere; letter-spacing: -.005em; }
.ha-sub { margin: 0; font: 500 clamp(14px, 2.1dvh, 16.5px)/1.42 ${FONTS.ui}; color: var(--vw-ink-soft); text-wrap: balance; overflow-wrap: anywhere; }
@media (min-width: 1100px) { .ha-title { font-size: clamp(42px, 5.6dvh, 58px); } .ha-sub { font-size: 17.5px; } .ha-kick { font-size: 12.5px; } }

.ha-next-wrap { position: fixed; z-index: 60; left: 0; right: 0; bottom: calc(env(safe-area-inset-bottom, 0px) + 18px);
  display: flex; justify-content: center; pointer-events: none; padding: 0 62px; box-sizing: border-box; }
@media (min-width: 768px) { .ha-next-wrap { bottom: 30px; } }
.ha-next { pointer-events: auto; position: relative; display: inline-flex; align-items: center; gap: 9px; height: 56px; max-width: 100%; min-width: 0; padding: 0 20px 0 7px;
  border: 0; border-radius: 999px; cursor: pointer; color: #FFFFFF;
  background: linear-gradient(180deg, color-mix(in srgb, var(--vw-accent) 68%, #FFFFFF) 0%, var(--vw-accent) 52%, var(--vw-accent-deep) 100%);
  box-shadow: 0 5px 0 var(--ha-deep), 0 0 0 3px var(--ha-gilt-a), 0 0 0 5px color-mix(in srgb, var(--ha-gilt-b) 70%, transparent), 0 16px 30px -10px color-mix(in srgb, var(--ha-deep) 70%, transparent);
  transition: transform .45s cubic-bezier(.2,.9,.25,1.2), opacity .3s ease, box-shadow .2s ease; touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
.ha-next.is-hidden { opacity: 0; transform: translateY(18px) scale(.9); pointer-events: none; transition-duration: .25s; }
.ha-next:active { transform: translateY(4px) scale(.97); box-shadow: 0 1px 0 var(--ha-deep), 0 0 0 3px var(--ha-gilt-a); transition-duration: .08s; }
.ha-next:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 6px; }
.ha-next-gloss { position: absolute; left: 14px; right: 14px; top: 4px; height: 40%; border-radius: 999px; background: linear-gradient(180deg, rgba(255,255,255,.55), rgba(255,255,255,0)); pointer-events: none; }
.ha-next-ring { position: absolute; inset: -5px; border-radius: inherit; border: 3px solid var(--vw-accent); opacity: 0; pointer-events: none; animation: ha-ring 1.9s ease-out 2s infinite; }
@keyframes ha-ring { 0% { opacity: .8; transform: scale(1) } 100% { opacity: 0; transform: scale(1.12, 1.5) } }
.ha-next-ico { position: relative; width: 42px; height: 42px; flex: none; border-radius: 50%; display: grid; place-items: center; font-size: 21px; line-height: 1;
  background: radial-gradient(circle at 40% 35%, #FFFFFF, var(--ha-blush)); box-shadow: inset 0 -3px 0 color-mix(in srgb, var(--ha-deep) 22%, transparent), 0 2px 6px color-mix(in srgb, var(--ha-deep) 40%, transparent); animation: ha-bob 1.3s ease-in-out infinite alternate; }
@keyframes ha-bob { from { transform: translateY(-2px) rotate(-9deg) } to { transform: translateY(2px) rotate(9deg) } }
.ha-next-label { position: relative; min-width: 0; font: 700 21px/1.1 ${HA_DISPLAY}; padding-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-shadow: 0 1px 0 color-mix(in srgb, var(--ha-deep) 60%, transparent); letter-spacing: .005em; }
.ha-next-arrow { position: relative; font: 700 26px/1 ${FONTS.ui}; margin-left: 2px; margin-top: -3px; }
@media (min-width: 1100px) { .ha-next-wrap .ha-next { transform: scale(1.1); transform-origin: 50% 100%; } .ha-next-wrap .ha-next.is-hidden { transform: translateY(18px); } }

.ha-trail { position: fixed; z-index: 62; top: calc(max(10px, env(safe-area-inset-top, 0px)) + 8px); left: max(12px, env(safe-area-inset-left, 0px));
  display: flex; align-items: center; gap: 1px; height: 30px; padding: 0 6px; border-radius: 99px; box-sizing: border-box;
  background: color-mix(in srgb, var(--vw-paper) 84%, transparent); border: 1.5px solid var(--vw-edge);
  box-shadow: 0 6px 16px -8px color-mix(in srgb, var(--ha-deep) 50%, transparent); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
@media (min-width: 768px) { .ha-trail { top: 22px; left: 24px; height: 36px; } }
.ha-tk { width: 17px; height: 30px; padding: 0; margin: 0; border: 0; background: none; display: grid; place-items: center; touch-action: manipulation; -webkit-tap-highlight-color: transparent; position: relative; color: inherit; }
.ha-tk:disabled { cursor: default; opacity: .85; }
.ha-tk.is-done { cursor: pointer; }
.ha-tk.is-done::after { content: ""; position: absolute; inset: -7px -1px; }
.ha-tk.is-done:hover svg { transform: scale(1.18) rotate(-6deg); }
.ha-tk svg { transition: transform .2s ease; }
.ha-tk.is-here svg { animation: ha-tk-swing 1.6s ease-in-out infinite; transform-origin: 50% 0; }
@keyframes ha-tk-swing { 0%, 100% { transform: rotate(-6deg) } 50% { transform: rotate(6deg) } }
@media (max-width: 479px) { .ha-tk { width: 14px; } .ha-trail { padding: 0 5px; } }
@media (max-width: 359px) { .ha-tk { width: 12px; } }
@media (min-width: 768px) { .ha-tk { width: 21px; height: 36px; } }
.ha-tk:focus-visible { outline: 2px solid var(--vw-ink); outline-offset: -2px; border-radius: 6px; }
body .vm-icon { bottom: calc(env(safe-area-inset-bottom, 0px) + 26px); }
@media (min-width: 768px) { body .vm-icon { left: 24px; bottom: 38px; } }

/* The gallery doors: two wall panels slide shut from both sides, a brass plaque on the seam, then open. */
.ha-doors { position: fixed; inset: 0; z-index: 74; pointer-events: none; overflow: hidden; contain: strict; }
.ha-door { position: absolute; top: 0; bottom: 0; width: 51%; will-change: transform;
  background: linear-gradient(180deg, var(--ha-wall-a), var(--ha-wall-b)); animation: ha-door-l var(--ha-door) cubic-bezier(.65,0,.35,1) both; }
.ha-door.is-l { left: 0; box-shadow: inset -2px 0 0 var(--ha-gilt-b), inset -6px 0 0 var(--ha-gilt-a), 10px 0 30px -10px color-mix(in srgb, var(--ha-deep) 40%, transparent); }
.ha-door.is-r { right: 0; animation-name: ha-door-r; box-shadow: inset 2px 0 0 var(--ha-gilt-b), inset 6px 0 0 var(--ha-gilt-a), -10px 0 30px -10px color-mix(in srgb, var(--ha-deep) 40%, transparent); }
.ha-door i { position: absolute; left: 0; right: 0; bottom: 0; height: clamp(70px, 15vh, 140px); background: var(--ha-wains); box-shadow: inset 0 4px 0 #FFFFFF, inset 0 7px 0 var(--ha-gilt-a); }
.ha-door::before { content: ""; position: absolute; left: 14%; right: 14%; top: 18%; bottom: calc(clamp(70px, 15vh, 140px) + 6%); border-radius: 4px; box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--ha-gilt-b) 45%, transparent), inset 0 0 0 7px color-mix(in srgb, #FFFFFF 50%, transparent); }
@keyframes ha-door-l { 0% { transform: translateX(-101%) } 44%, 58% { transform: translateX(0) } 100% { transform: translateX(-101%) } }
@keyframes ha-door-r { 0% { transform: translateX(101%) } 44%, 58% { transform: translateX(0) } 100% { transform: translateX(101%) } }
.ha-door-plaque { position: absolute; left: 50%; top: 46%; translate: -50% -50%; display: grid; gap: 2px; justify-items: center; min-width: 200px; max-width: 80vw; padding: 12px 22px 10px; border-radius: 6px; text-align: center;
  background: linear-gradient(160deg, #FFF8E4, var(--ha-gilt-a) 55%, color-mix(in srgb, var(--ha-gilt-b) 70%, var(--ha-gilt-a))); box-shadow: 0 0 0 2px var(--ha-gilt-b), 0 18px 30px -14px rgba(70,40,10,.45);
  opacity: 0; animation: ha-plaque var(--ha-door) ease both; }
.ha-door-plaque b { font: 700 12px/1.2 ${HA_CAPS}; letter-spacing: .26em; color: color-mix(in srgb, var(--ha-deep) 80%, #3B2A10); }
.ha-door-plaque em { font: 700 italic 24px/1.1 ${HA_DISPLAY}; color: #3B2A14; }
@keyframes ha-plaque { 0%, 30% { opacity: 0; transform: scale(.9) } 44%, 60% { opacity: 1; transform: scale(1) } 72%, 100% { opacity: 0; transform: scale(.96) } }
.ha-doors.is-soft { background: var(--vw-paper, #FFF); opacity: 0; animation: ha-soft var(--ha-door) ease-in-out forwards; }
@keyframes ha-soft { 0% { opacity: 0 } 45% { opacity: 1 } 100% { opacity: 0 } }
.ha-doors-block { position: fixed; inset: 0; z-index: 75; }
@media (prefers-reduced-motion: reduce) { .ha-next-ico, .ha-next-ring, .ha-tk.is-here svg { animation: none; } }

/* Phones: a long label never ellipsizes. The pill keeps clear of the music icon on the left but may use the
   right gutter ("safe center" pins it left only when it would otherwise overflow). */
@media (max-width: 420px) {
  .ha-next-wrap { padding: 0 max(12px, env(safe-area-inset-right, 0px)) 0 62px; justify-content: safe center; }
  .ha-next { gap: 8px; padding-right: 16px; }
  .ha-next-ico { width: 38px; height: 38px; font-size: 19px; }
  .ha-next-label { font-size: clamp(17px, 5.4vw, 21px); }
}
/* Landscape phones: the room heading, any extras and the pill on the left wall, the exhibit on the right
   using the full height (otherwise the top bar and the pill leave the exhibit ~150px). */
@media (orientation: landscape) and (max-height: 520px) and (min-width: 560px) {
  .ha-scene { display: grid; grid-template-columns: minmax(230px, .8fr) minmax(0, 1.2fr); grid-template-rows: minmax(0, 1fr) auto auto auto; align-items: center;
    column-gap: 22px; row-gap: 6px; max-width: none;
    padding: calc(env(safe-area-inset-top, 0px) + 54px) max(16px, env(safe-area-inset-right, 0px)) calc(env(safe-area-inset-bottom, 0px) + 10px) max(16px, env(safe-area-inset-left, 0px)); }
  .ha-scene > .ha-head { grid-column: 1; grid-row: 1; align-self: center; }
  .ha-scene > .ha-fill { grid-column: 2; grid-row: 1 / -1; height: 100%; }
  .ha-scene > :not(.ha-head):not(.ha-fill) { grid-column: 1; }
  .ha-scene::after { content: ""; grid-column: 1; grid-row: 4; height: 66px; }
  .ha-next-wrap { right: auto; width: calc((100vw - 54px) * .4 + 16px); padding: 0 0 0 62px; justify-content: safe center; }
  .ha-title { font-size: clamp(24px, 8dvh, 34px); }
  .ha-sub { font-size: 14px; }
}
`;
