"use client";

// The Miss You stage furniture, shared by every scene (the same contract as
// Sorry's ./sr/stage.tsx):
//
//   • MuStage — the context the scenes talk to: the one Next pill, the little
//     sound cues (the kit's procedural SFX) and the replay round.
//   • useNext(label, onPress, icon) — a scene declares its way forward; the
//     shell draws ONE pill for it, fixed bottom-centre. Only her tap moves on,
//     and that tap plays the paper-plane wipe: a soft wash fills the screen
//     while a little plane loops across it trailing hearts, the scene is
//     swapped behind it, and the wash clears.
//   • FlightTrail — a dotted flight path top-left; passed stops are filled (tap
//     to fly back), a tiny plane sits on the current one.
//
// Sounds stay silent until the first tap and whenever the visitor mutes.

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import { useDayMusic } from "../../../_valentine/music/context";
import { useUnlockAudioOnFirstTap } from "../../../_valentine/kit/premium/useScare";
import { sfx, type CueOptions } from "../../../_valentine/kit/premium/sfx";
import { FONTS } from "../../../_valentine/theme";
import { MU_DISPLAY } from "./fonts";

export type NextIcon = "call" | "plane" | "heart" | "letter" | "hug" | "ticket" | "sparkle" | "photo" | "moon" | "jar" | "clock";

const ICONS: Record<NextIcon, string> = {
  call: "📞",
  plane: "✈️",
  heart: "💗",
  letter: "💌",
  hug: "🤗",
  ticket: "🎫",
  sparkle: "✨",
  photo: "📸",
  moon: "🌙",
  jar: "🫙",
  clock: "⏳",
};

interface NextSpec {
  label: string;
  icon: NextIcon;
  onPress: () => void;
  /** false: the press does not change the scene (opens WhatsApp etc.), so no wipe. */
  wipe?: boolean;
}

export type MuCue =
  | "pop"
  | "bubble"
  | "chime"
  | "chime-cascade"
  | "sparkle"
  | "swoosh-soft"
  | "whoosh"
  | "plush-squeak"
  | "heartbeat"
  | "kiss"
  | "wax-crack"
  | "paper-rustle"
  | "page-turn"
  | "glass-ping"
  | "ribbon"
  | "tick"
  | "nib-scratch";

interface MuApi {
  setNext: (s: NextSpec | null) => void;
  cue: (id: MuCue, o?: CueOptions) => void;
  /** Changes on every replay — remounts the scenes' GIFs. */
  round: number;
  /** Play the wipe and run `swap` while the screen is covered (replay, the trail). */
  go: (swap: () => void) => number;
}

const Ctx = createContext<MuApi | null>(null);
export function useMu(): MuApi {
  const v = useContext(Ctx);
  if (!v) throw new Error("useMu outside MuStage");
  return v;
}

/** A scene's way forward. `null` hides the pill until the scene's moment is done. */
export function useNext(label: string | null, onPress: () => void, icon: NextIcon = "heart", wipe = true) {
  const { setNext } = useMu();
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
const COVER_AT = 0.48;

export function MuStage({
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
    (id: MuCue, o?: CueOptions) => {
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
        cue("whoosh", { gain: 0.32 });
        cue("sparkle", { gain: 0.28, at: coverAt / 1000 + 0.08 });
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

  const api = useMemo<MuApi>(() => ({ setNext, cue, round, go }), [setNext, cue, round, go]);

  return (
    <Ctx.Provider value={api}>
      <FlightTrail at={trail.at} rooms={trail.rooms} ending={trail.ending} onJump={(k) => go(() => trail.onJump(k))} />
      {children}
      <NextPill spec={next} onPress={press} />
      {run && <Wipe key={run.id} soft={run.soft} dur={run.dur} />}
      {blocked && <div className="mu-wipe-block" aria-hidden />}
    </Ctx.Provider>
  );
}

const MINI = [0, 45, 90, 135, 180, 225, 270, 315];

/** A small paper plane, nose to the right. */
export function PlaneGlyph({ size = 40, color = "#FFFFFF", fold = "#E6DEFF" }: { size?: number | string; color?: string; fold?: string }) {
  return (
    <svg viewBox="0 0 64 48" width={size} height={typeof size === "number" ? (size * 48) / 64 : undefined} aria-hidden style={{ overflow: "visible" }}>
      <path d="M2 22 L62 2 L36 46 L28 30 Z" fill={color} stroke="var(--mu-deep, #5338B4)" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M28 30 L62 2 L22 26 Z" fill={fold} stroke="var(--mu-deep, #5338B4)" strokeWidth="2" strokeLinejoin="round" />
      <path d="M28 30 L30 40 L36 46" fill="none" stroke="var(--mu-deep, #5338B4)" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

/** The wipe: a soft wash covers the screen while a paper plane loops across it trailing hearts. */
function Wipe({ soft, dur }: { soft: boolean; dur: number }) {
  if (soft) return <div className="mu-wipe is-soft" style={{ ["--mu-wipe" as string]: `${dur}ms` }} aria-hidden />;
  return (
    <div className="mu-wipe" style={{ ["--mu-wipe" as string]: `${dur}ms` }} aria-hidden>
      <span className="mu-wipe-wash" />
      <span className="mu-wipe-cloud mu-wipe-cloud-a" />
      <span className="mu-wipe-cloud mu-wipe-cloud-b" />
      <span className="mu-wipe-plane">
        <PlaneGlyph size="100%" />
      </span>
      <span className="mu-wipe-minis">
        {MINI.map((a, k) => (
          <i key={a} style={{ ["--a" as string]: `${a}deg`, ["--d" as string]: `${k % 2 ? 32 : 24}vmin` }}>
            {k % 3 ? "💗" : "✨"}
          </i>
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
    <div className="mu-next-wrap">
      <button type="button" className={`mu-next${spec ? "" : " is-hidden"}`} onClick={onPress} disabled={!spec} aria-hidden={!spec} tabIndex={spec ? 0 : -1} data-mu-next>
        <span className="mu-next-gloss" aria-hidden />
        {spec && <span key={spec.label} className="mu-next-ring" aria-hidden />}
        <span className="mu-next-ico" aria-hidden>
          {ICONS[s?.icon ?? "heart"]}
        </span>
        <span className="mu-next-label">{s?.label ?? ""}</span>
        <span className="mu-next-arrow" aria-hidden>
          ›
        </span>
      </button>
    </div>
  );
}

/** A dotted flight path, top-left: filled stops are done (tap to fly back), the plane marks where you are. */
export function FlightTrail({ at, rooms, ending, onJump }: { at: number; rooms: number; ending: boolean; onJump: (k: number) => void }) {
  const [nope, setNope] = useState<{ k: number; n: number } | null>(null);
  return (
    <nav className="mu-trail" aria-label={`Step ${Math.min(at + 1, rooms)} of ${rooms}`}>
      {Array.from({ length: rooms }, (_, k) => {
        const done = k < at || ending;
        const here = k === at && !ending;
        return (
          <button
            key={k}
            type="button"
            className={`mu-pk${done ? " is-done" : ""}${here ? " is-here" : ""}`}
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
            <span key={nope?.k === k ? `n${nope.n}` : "s"} className={nope?.k === k ? "mu-pk-nope" : undefined}>
              {here ? (
                <span className="mu-pk-plane">
                  <PlaneGlyph size="100%" color="var(--vw-accent, #FF7EAE)" fold="var(--vw-paper, #FFF)" />
                </span>
              ) : (
                <i className="mu-pk-dot" />
              )}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

export const MU_STAGE_CSS = `
/* One scene = one screen: a calm top band (the flight trail, level with the editor's top bar / the
   viewer's logo), the scene, then a clear bottom strip for the pill alone (the music icon sits bottom-left). */
.mu-scene { position: relative; z-index: 1; box-sizing: border-box; height: 100vh; height: 100dvh;
  display: flex; flex-direction: column; align-items: center; text-align: center; gap: clamp(10px, 2.2dvh, 22px);
  padding: calc(env(safe-area-inset-top, 0px) + clamp(64px, 9dvh, 80px)) 20px max(calc(env(safe-area-inset-bottom, 0px) + 96px), var(--vw-dock-space, 0px));
  width: 100%; max-width: calc(520px * var(--vw-s, 1)); margin: 0 auto; overflow: hidden; color: var(--vw-ink); }
@media (min-width: 768px) { .mu-scene { max-width: 700px; padding-top: calc(var(--vw-top-space, 0px) + 72px); padding-bottom: 116px; gap: clamp(12px, 2.4dvh, 26px); } }
@media (min-width: 1100px) { .mu-scene { max-width: min(760px, 56vw); padding-top: 84px; } }
@media (min-width: 1100px) { .mu-zoom { zoom: 1.14; } }
@media (min-width: 1100px) and (min-height: 1000px) { .mu-zoom { zoom: 1.28; } }
.mu-fill { position: relative; flex: 1 1 0; min-height: 0; width: 100%; container-type: size; display: grid; grid-template: minmax(0, 1fr) / minmax(0, 1fr); place-items: center; }

.mu-head { flex: none; display: grid; gap: 4px; justify-items: center; max-width: 440px; }
.mu-kick { margin: 0; font: 700 clamp(11px, 1.7dvh, 13px)/1.2 ${FONTS.ui}; letter-spacing: .16em; text-transform: uppercase; color: var(--mu-kick); }
.mu-title { margin: 0; font: 800 clamp(28px, min(8.4vw, 4.9dvh), 44px)/1.08 ${MU_DISPLAY}; color: var(--vw-ink); text-wrap: balance; overflow-wrap: anywhere; }
.mu-sub { margin: 0; font: 500 clamp(14px, 2.1dvh, 16.5px)/1.45 ${FONTS.ui}; color: var(--vw-ink-soft); text-wrap: balance; overflow-wrap: anywhere; }
@media (min-width: 1100px) { .mu-title { font-size: clamp(38px, 5.2dvh, 54px); } .mu-sub { font-size: 17px; } }
.mu-em { font-style: normal; color: var(--vw-accent); }
.mu-hint { flex: none; margin: 0; min-height: 22px; font: 700 clamp(15px, 2.3dvh, 18px) ${MU_DISPLAY}; color: var(--mu-kick); }

.mu-next-wrap { position: fixed; z-index: 60; left: 0; right: 0; bottom: calc(env(safe-area-inset-bottom, 0px) + 18px);
  display: flex; justify-content: center; pointer-events: none; padding: 0 62px; box-sizing: border-box; }
@media (min-width: 768px) { .mu-next-wrap { bottom: 30px; } }
.mu-next { pointer-events: auto; position: relative; display: inline-flex; align-items: center; gap: 9px; height: 56px; max-width: 100%; min-width: 0; padding: 0 20px 0 7px;
  border: 0; border-radius: 999px; cursor: pointer; color: #FFFFFF;
  background: linear-gradient(180deg, color-mix(in srgb, var(--vw-accent) 72%, #FFFFFF) 0%, var(--vw-accent) 55%, var(--vw-accent-deep) 100%);
  box-shadow: 0 5px 0 var(--mu-deep), 0 0 0 4px color-mix(in srgb, var(--vw-paper) 70%, transparent), 0 14px 30px -10px color-mix(in srgb, var(--mu-deep) 70%, transparent);
  transition: transform .45s cubic-bezier(.2,.9,.25,1.2), opacity .3s ease, box-shadow .2s ease; touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
.mu-next.is-hidden { opacity: 0; transform: translateY(18px) scale(.9); pointer-events: none; transition-duration: .25s; }
.mu-next:active { transform: translateY(4px) scale(.97); box-shadow: 0 1px 0 var(--mu-deep), 0 0 0 4px color-mix(in srgb, var(--vw-paper) 70%, transparent); transition-duration: .08s; }
.mu-next:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 4px; }
.mu-next-gloss { position: absolute; left: 14px; right: 14px; top: 4px; height: 40%; border-radius: 999px; background: linear-gradient(180deg, rgba(255,255,255,.5), rgba(255,255,255,0)); pointer-events: none; }
.mu-next-ring { position: absolute; inset: -3px; border-radius: inherit; border: 3px solid var(--vw-accent); opacity: 0; pointer-events: none; animation: mu-ring 1.9s ease-out 2s infinite; }
@keyframes mu-ring { 0% { opacity: .8; transform: scale(1) } 100% { opacity: 0; transform: scale(1.12, 1.5) } }
.mu-next-ico { position: relative; width: 42px; height: 42px; flex: none; border-radius: 50%; display: grid; place-items: center; font-size: 22px; line-height: 1;
  background: radial-gradient(circle at 40% 35%, #FFFFFF, color-mix(in srgb, var(--vw-accent) 22%, #FFFFFF)); box-shadow: inset 0 -3px 0 color-mix(in srgb, var(--mu-deep) 25%, transparent), 0 2px 6px color-mix(in srgb, var(--mu-deep) 40%, transparent); animation: mu-bob 1.2s ease-in-out infinite alternate; }
@keyframes mu-bob { from { transform: translateY(-2px) rotate(-10deg) } to { transform: translateY(2px) rotate(10deg) } }
.mu-next-label { position: relative; min-width: 0; font: 800 18px/1.25 ${MU_DISPLAY}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-shadow: 0 1px 0 color-mix(in srgb, var(--mu-deep) 60%, transparent); padding-top: 2px; }
.mu-next-arrow { position: relative; font: 700 26px/1 ${FONTS.ui}; margin-left: 2px; margin-top: -3px; }
@media (min-width: 1100px) { .mu-next-wrap .mu-next { transform: scale(1.1); transform-origin: 50% 100%; } .mu-next-wrap .mu-next.is-hidden { transform: translateY(18px); } }

/* The flight trail: dots joined by a dashed line, the plane on the current stop. */
.mu-trail { position: fixed; z-index: 62; top: calc(max(10px, env(safe-area-inset-top, 0px)) + 8px); left: max(12px, env(safe-area-inset-left, 0px));
  display: flex; align-items: center; gap: 0; height: 30px; padding: 0 7px; border-radius: 99px; box-sizing: border-box;
  background: color-mix(in srgb, var(--vw-paper) 84%, transparent); border: 1.5px solid var(--vw-edge);
  box-shadow: 0 6px 16px -8px color-mix(in srgb, var(--mu-deep) 50%, transparent); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
.mu-trail::before { content: ""; position: absolute; left: 14px; right: 14px; top: 50%; border-top: 2px dashed color-mix(in srgb, var(--vw-accent) 45%, transparent); }
@media (min-width: 768px) { .mu-trail { top: 22px; left: 24px; height: 36px; } }
.mu-pk { width: 16px; height: 30px; padding: 0; margin: 0; border: 0; background: none; cursor: default; display: grid; place-items: center; touch-action: manipulation; -webkit-tap-highlight-color: transparent; position: relative; }
.mu-pk.is-done::after { content: ""; position: absolute; inset: -7px -1px; }
@media (max-width: 479px) { .mu-pk { width: 13px; } .mu-trail { padding: 0 5px; } }
@media (max-width: 359px) { .mu-pk { width: 11px; } }
@media (min-width: 768px) { .mu-pk { width: 21px; height: 36px; } }
.mu-pk > span { display: grid; place-items: center; width: 100%; }
.mu-pk-dot { display: block; width: 7px; height: 7px; border-radius: 50%; background: var(--vw-paper); box-shadow: 0 0 0 2px color-mix(in srgb, var(--vw-accent) 55%, transparent); }
.mu-pk.is-done .mu-pk-dot { background: var(--vw-accent); box-shadow: 0 0 0 2px var(--vw-accent-deep); }
.mu-pk.is-done { cursor: pointer; }
.mu-pk.is-done:hover .mu-pk-dot { transform: scale(1.3); }
.mu-pk-plane { display: block; width: 19px; transform: rotate(-12deg); animation: mu-pk-fly 1.6s ease-in-out infinite; filter: drop-shadow(0 2px 2px color-mix(in srgb, var(--mu-deep) 45%, transparent)); }
@media (min-width: 768px) { .mu-pk-plane { width: 23px; } }
@keyframes mu-pk-fly { 0%, 100% { transform: rotate(-12deg) translateY(0) } 50% { transform: rotate(-4deg) translateY(-3px) } }
.mu-pk:focus-visible { outline: 2px solid var(--vw-ink); outline-offset: -2px; border-radius: 8px; }
.mu-pk > span.mu-pk-nope { animation: mu-pk-nope .42s ease-in-out; }
@keyframes mu-pk-nope { 0%,100% { transform: translateX(0) } 25% { transform: translateX(-3px) } 50% { transform: translateX(3px) } 75% { transform: translateX(-2px) } }
body .vm-icon { bottom: calc(env(safe-area-inset-bottom, 0px) + 26px); }
@media (min-width: 768px) { body .vm-icon { left: 24px; bottom: 38px; } }

/* The paper-plane wipe. Transform/opacity only; input is blocked only while the screen is covered. */
.mu-wipe { position: fixed; inset: 0; z-index: 74; pointer-events: none; overflow: hidden; contain: strict; }
.mu-wipe-wash { position: absolute; inset: 0; background: radial-gradient(circle at 50% 55%, var(--vw-paper, #FFF), var(--mu-blush, #E2D9FF) 75%); opacity: 0;
  animation: mu-wash var(--mu-wipe) ease-in-out forwards; }
@keyframes mu-wash { 0% { opacity: 0 } 36% { opacity: .92 } 50% { opacity: 1 } 74% { opacity: .2 } 100% { opacity: 0 } }
.mu-wipe-cloud { position: absolute; width: 90vmax; height: 50vmax; border-radius: 50%; background: var(--vw-paper, #FFF); opacity: 0; filter: blur(8px); }
.mu-wipe-cloud-a { left: -60vmax; top: 10vh; animation: mu-cloud-a var(--mu-wipe) ease-in-out forwards; }
.mu-wipe-cloud-b { right: -60vmax; bottom: 6vh; animation: mu-cloud-b var(--mu-wipe) ease-in-out forwards; }
@keyframes mu-cloud-a { 0% { opacity: 0; transform: translateX(0) } 45% { opacity: .9; transform: translateX(45vmax) } 100% { opacity: 0; transform: translateX(80vmax) } }
@keyframes mu-cloud-b { 0% { opacity: 0; transform: translateX(0) } 45% { opacity: .9; transform: translateX(-45vmax) } 100% { opacity: 0; transform: translateX(-80vmax) } }
.mu-wipe-plane { position: absolute; left: 0; top: 0; width: clamp(64px, 16vmin, 120px); will-change: transform, opacity;
  filter: drop-shadow(0 10px 18px color-mix(in srgb, var(--mu-deep, #5338B4) 40%, transparent)); animation: mu-plane var(--mu-wipe) cubic-bezier(.45,.05,.4,1) forwards; }
@keyframes mu-plane {
  0% { transform: translate(-20vw, 78vh) rotate(-24deg) scale(.7); opacity: 0 }
  12% { opacity: 1 }
  48% { transform: translate(42vw, 40vh) rotate(-8deg) scale(1.15) }
  100% { transform: translate(115vw, 6vh) rotate(-20deg) scale(.8); opacity: 1 } }
.mu-wipe-minis { position: absolute; left: 50%; top: 50%; width: 0; height: 0; }
.mu-wipe-minis i { position: absolute; left: -10px; top: -10px; font-size: 20px; font-style: normal; opacity: 0; animation: mu-mini var(--mu-wipe) ease-out forwards; }
@keyframes mu-mini { 0%, 46% { opacity: 0; transform: rotate(var(--a)) translateY(0) scale(.4) } 60% { opacity: 1 } 100% { opacity: 0; transform: rotate(var(--a)) translateY(calc(var(--d) * -1)) scale(1.1) } }
.mu-wipe.is-soft { background: var(--vw-paper, #FFF); opacity: 0; animation: mu-soft var(--mu-wipe) ease-in-out forwards; }
@keyframes mu-soft { 0% { opacity: 0 } 45% { opacity: 1 } 100% { opacity: 0 } }
.mu-wipe-block { position: fixed; inset: 0; z-index: 75; }
`;
