"use client";

// The Will You Be Mine stage furniture, shared by every scene (the same
// one-screen engine as Sorry, re-dressed):
//
//   • WyStage — the context the scenes talk to: the one Next pill, the little
//     sound cues (the kit's procedural SFX — pops, squeaks, a heartbeat) and the
//     replay round.
//   • useNext(label, onPress, icon) — a scene declares its way forward; the
//     shell draws ONE pastel pill for it, fixed bottom-centre, so nothing jumps.
//     Only her tap moves on, and that tap plays the heart wipe: a big soft heart
//     swells from the middle to fill the screen, the scene is swapped behind it,
//     and it melts away into tiny hearts.
//   • HeartTrail — little hearts top-left; filled ones are done (tap to go back).
//
// Sounds stay silent until the first tap and whenever the visitor mutes.

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import { useDayMusic } from "../../../_valentine/music/context";
import { useUnlockAudioOnFirstTap } from "../../../_valentine/kit/premium/useScare";
import { sfx, type CueOptions } from "../../../_valentine/kit/premium/sfx";
import { FONTS } from "../../../_valentine/theme";
import { WY_SERIF } from "./fonts";

export type NextIcon = "ring" | "letter" | "heart" | "star" | "story" | "quiz" | "sparkle" | "photo" | "shy";

const ICONS: Record<NextIcon, string> = {
  ring: "💍",
  letter: "💌",
  heart: "💗",
  star: "🌟",
  story: "👣",
  quiz: "💘",
  sparkle: "✨",
  photo: "📸",
  shy: "🥰",
};

interface NextSpec {
  label: string;
  icon: NextIcon;
  onPress: () => void;
  /** false: the press does not change the scene (opens WhatsApp etc.), so no wipe. */
  wipe?: boolean;
}

export type WyCue =
  | "pop"
  | "bubble"
  | "chime"
  | "chime-cascade"
  | "sparkle"
  | "swoosh-soft"
  | "plush-squeak"
  | "heartbeat"
  | "kiss"
  | "wax-crack"
  | "paper-rustle"
  | "page-turn"
  | "glass-ping"
  | "ribbon"
  | "tick"
  | "firework";

interface WyApi {
  setNext: (s: NextSpec | null) => void;
  cue: (id: WyCue, o?: CueOptions) => void;
  /** Changes on every replay — remounts the scenes' GIFs. */
  round: number;
  /** Play the wipe and run `swap` while the screen is covered (replay, the trail). */
  go: (swap: () => void) => number;
}

const Ctx = createContext<WyApi | null>(null);
export function useWy(): WyApi {
  const v = useContext(Ctx);
  if (!v) throw new Error("useWy outside WyStage");
  return v;
}

/**
 * A scene's way forward. `null` hides the pill (pass null until the scene's
 * moment is done). It only moves on when she taps it — no auto-advance.
 */
export function useNext(label: string | null, onPress: () => void, icon: NextIcon = "heart", wipe = true) {
  const { setNext } = useWy();
  const fn = useRef(onPress);
  useLayoutEffect(() => {
    fn.current = onPress;
  });
  useEffect(() => {
    setNext(label ? { label, icon, wipe, onPress: () => fn.current() } : null);
  }, [label, icon, wipe, setNext]);
  useEffect(() => () => setNext(null), [setNext]);
}

const WIPE = { full: 860, soft: 480 } as const;
const COVER_AT = 0.46;

export function WyStage({
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
    (id: WyCue, o?: CueOptions) => {
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
        cue("heartbeat", { gain: 0.5, at: coverAt / 1000 - 0.08 });
        cue("sparkle", { gain: 0.3, at: coverAt / 1000 + 0.1 });
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

  const api = useMemo<WyApi>(() => ({ setNext, cue, round, go }), [setNext, cue, round, go]);

  return (
    <Ctx.Provider value={api}>
      <HeartTrail at={trail.at} rooms={trail.rooms} ending={trail.ending} onJump={(k) => go(() => trail.onJump(k))} />
      {children}
      <NextPill spec={next} onPress={press} />
      {run && <Wipe key={run.id} soft={run.soft} dur={run.dur} />}
      {blocked && <div className="wy-wipe-block" aria-hidden />}
    </Ctx.Provider>
  );
}

const MINI = [0, 40, 80, 120, 160, 200, 240, 280, 320];

/** The heart wipe: one big soft heart swells over the screen, then melts into tiny hearts. */
function Wipe({ soft, dur }: { soft: boolean; dur: number }) {
  if (soft) return <div className="wy-wipe is-soft" style={{ ["--wy-wipe" as string]: `${dur}ms` }} aria-hidden />;
  return (
    <div className="wy-wipe" style={{ ["--wy-wipe" as string]: `${dur}ms` }} aria-hidden>
      <span className="wy-wipe-wash" />
      <svg className="wy-wipe-heart" viewBox="0 0 100 92">
        <defs>
          <radialGradient id="wyWipeG" cx="45%" cy="35%" r="75%">
            <stop offset="0" stopColor="var(--vw-paper, #FFFFFF)" />
            <stop offset=".45" stopColor="var(--wy-blush, #FBDCD6)" />
            <stop offset="1" stopColor="var(--vw-gold, #E2A98F)" />
          </radialGradient>
        </defs>
        <path d="M50 90 C18 68 2 50 4 30 C6 10 32 4 50 24 C68 4 94 10 96 30 C98 50 82 68 50 90 Z" fill="url(#wyWipeG)" />
      </svg>
      <span className="wy-wipe-minis">
        {MINI.map((a, k) => (
          <i key={a} style={{ ["--a" as string]: `${a}deg`, ["--d" as string]: `${k % 2 ? 34 : 26}vmin` }}>
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
    <div className="wy-next-wrap">
      <button type="button" className={`wy-next${spec ? "" : " is-hidden"}`} onClick={onPress} disabled={!spec} aria-hidden={!spec} tabIndex={spec ? 0 : -1} data-wy-next>
        <span className="wy-next-gloss" aria-hidden />
        {spec && <span key={spec.label} className="wy-next-ring" aria-hidden />}
        <span className="wy-next-ico" aria-hidden>
          {ICONS[s?.icon ?? "heart"]}
        </span>
        <span className="wy-next-label">{s?.label ?? ""}</span>
        <span className="wy-next-arrow" aria-hidden>
          ›
        </span>
      </button>
    </div>
  );
}

/** Small hearts in a pill, top-left: filled = done (tap to go back), the current one beats. */
export function HeartTrail({ at, rooms, ending, onJump }: { at: number; rooms: number; ending: boolean; onJump: (k: number) => void }) {
  const [nope, setNope] = useState<{ k: number; n: number } | null>(null);
  return (
    <nav className="wy-trail" aria-label={`Step ${Math.min(at + 1, rooms)} of ${rooms}`}>
      {Array.from({ length: rooms }, (_, k) => {
        const done = k < at || ending;
        const here = k === at && !ending;
        return (
          <button
            key={k}
            type="button"
            className={`wy-pk${done ? " is-done" : ""}${here ? " is-here" : ""}`}
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
            <span key={nope?.k === k ? `n${nope.n}` : "s"} className={nope?.k === k ? "wy-pk-nope" : undefined}>
              <svg viewBox="0 0 24 22" width="100%" aria-hidden>
                <path
                  d="M12 21 C4 15 1 11 1.5 7 C2 3 7 1.5 12 6 C17 1.5 22 3 22.5 7 C23 11 20 15 12 21 Z"
                  fill={done || here ? "var(--vw-accent, #E0637F)" : "none"}
                  stroke={done || here ? "var(--vw-accent-deep, #B8435F)" : "var(--vw-gold, #E2A98F)"}
                  strokeWidth="2"
                />
              </svg>
            </span>
          </button>
        );
      })}
    </nav>
  );
}

export const WY_STAGE_CSS = `
/* One scene = one screen, airy: a calm top band (the heart trail, level with the editor's top bar / the
   viewer's logo), the scene, then a clear bottom strip for the pill alone (the music icon sits bottom-left). */
.wy-scene { position: relative; z-index: 1; box-sizing: border-box; height: 100vh; height: 100dvh;
  display: flex; flex-direction: column; align-items: center; text-align: center; gap: clamp(10px, 2.2dvh, 22px);
  padding: calc(env(safe-area-inset-top, 0px) + clamp(64px, 9dvh, 80px)) 20px max(calc(env(safe-area-inset-bottom, 0px) + 96px), var(--vw-dock-space, 0px));
  width: 100%; max-width: calc(520px * var(--vw-s, 1)); margin: 0 auto; overflow: hidden; color: var(--vw-ink); }
@media (min-width: 768px) { .wy-scene { max-width: 700px; padding-top: calc(var(--vw-top-space, 0px) + 72px); padding-bottom: 116px; gap: clamp(12px, 2.4dvh, 26px); } }
@media (min-width: 1100px) { .wy-scene { max-width: min(760px, 56vw); padding-top: 84px; } }
@media (min-width: 1100px) { .wy-zoom { zoom: 1.16; } }
@media (min-width: 1100px) and (min-height: 1000px) { .wy-zoom { zoom: 1.3; } }
.wy-fill { position: relative; flex: 1 1 0; min-height: 0; width: 100%; container-type: size; display: grid; grid-template: minmax(0, 1fr) / minmax(0, 1fr); place-items: center; }

/* Scene titles: a small kicker, a squishy heading, a soft line. */
.wy-head { flex: none; display: grid; gap: 4px; justify-items: center; max-width: 440px; }
.wy-kick { margin: 0; font: 700 clamp(11px, 1.7dvh, 13px)/1.2 ${FONTS.ui}; letter-spacing: .16em; text-transform: uppercase; color: var(--vw-accent-deep); }
.wy-title { margin: 0; font: 700 clamp(28px, min(8.4vw, 4.9dvh), 44px)/1.1 ${WY_SERIF}; letter-spacing: -.01em; color: var(--vw-ink); text-wrap: balance; overflow-wrap: anywhere; }
.wy-sub { margin: 0; font: 500 clamp(14px, 2.1dvh, 16.5px)/1.45 ${FONTS.ui}; color: var(--vw-ink-soft); text-wrap: balance; overflow-wrap: anywhere; }
@media (min-width: 1100px) { .wy-title { font-size: clamp(38px, 5.2dvh, 54px); } .wy-sub { font-size: 17px; } }

/* The one way forward: always the same spot, bottom centre, clear of the music icon on its left. */
.wy-next-wrap { position: fixed; z-index: 60; left: 0; right: 0; bottom: calc(env(safe-area-inset-bottom, 0px) + 18px);
  display: flex; justify-content: center; pointer-events: none; padding: 0 62px; box-sizing: border-box; }
@media (min-width: 768px) { .wy-next-wrap { bottom: 30px; } }
.wy-next { pointer-events: auto; position: relative; display: inline-flex; align-items: center; gap: 9px; height: 56px; max-width: 100%; min-width: 0; padding: 0 20px 0 7px;
  border: 0; border-radius: 999px; cursor: pointer; color: #FFFFFF;
  background: linear-gradient(180deg, color-mix(in srgb, var(--vw-accent) 72%, #FFFFFF) 0%, var(--vw-accent) 55%, var(--vw-accent-deep) 100%);
  box-shadow: 0 5px 0 var(--wy-deep), 0 0 0 4px color-mix(in srgb, var(--vw-paper) 70%, transparent), 0 14px 30px -10px color-mix(in srgb, var(--wy-deep) 70%, transparent);
  transition: transform .45s cubic-bezier(.2,.9,.25,1.2), opacity .3s ease, box-shadow .2s ease; touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
.wy-next.is-hidden { opacity: 0; transform: translateY(18px) scale(.9); pointer-events: none; transition-duration: .25s; }
.wy-next:active { transform: translateY(4px) scale(.97); box-shadow: 0 1px 0 var(--wy-deep), 0 0 0 4px color-mix(in srgb, var(--vw-paper) 70%, transparent); transition-duration: .08s; }
.wy-next:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 4px; }
.wy-next-gloss { position: absolute; left: 14px; right: 14px; top: 4px; height: 40%; border-radius: 999px; background: linear-gradient(180deg, rgba(255,255,255,.55), rgba(255,255,255,0)); pointer-events: none; }
.wy-next-ring { position: absolute; inset: -3px; border-radius: inherit; border: 3px solid var(--vw-accent); opacity: 0; pointer-events: none; animation: wy-ring 1.9s ease-out 2s infinite; }
@keyframes wy-ring { 0% { opacity: .8; transform: scale(1) } 100% { opacity: 0; transform: scale(1.12, 1.5) } }
.wy-next-ico { position: relative; width: 42px; height: 42px; flex: none; border-radius: 50%; display: grid; place-items: center; font-size: 22px; line-height: 1;
  background: radial-gradient(circle at 40% 35%, #FFFFFF, var(--wy-blush)); box-shadow: inset 0 -3px 0 color-mix(in srgb, var(--wy-deep) 25%, transparent), 0 2px 6px color-mix(in srgb, var(--wy-deep) 40%, transparent); animation: wy-bob 1.2s ease-in-out infinite alternate; }
@keyframes wy-bob { from { transform: translateY(-2px) rotate(-10deg) } to { transform: translateY(2px) rotate(10deg) } }
.wy-next-label { position: relative; min-width: 0; font: 700 18px/1.25 ${FONTS.ui}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-shadow: 0 1px 0 color-mix(in srgb, var(--wy-deep) 55%, transparent); }
.wy-next-arrow { position: relative; font: 700 26px/1 ${FONTS.ui}; margin-left: 2px; margin-top: -3px; }
@media (max-width: 389px) { .wy-next-wrap { padding: 0 54px; } .wy-next { gap: 7px; padding-right: 14px; } .wy-next-label { font-size: 16px; } }
@media (min-width: 1100px) { .wy-next-wrap .wy-next { transform: scale(1.1); transform-origin: 50% 100%; } .wy-next-wrap .wy-next.is-hidden { transform: translateY(18px); } }

/* The heart trail: small, top-left, level with the editor's top bar (which sits top-right). */
.wy-trail { position: fixed; z-index: 62; top: calc(max(10px, env(safe-area-inset-top, 0px)) + 8px); left: max(12px, env(safe-area-inset-left, 0px));
  display: flex; align-items: center; gap: 1px; height: 30px; padding: 0 6px; border-radius: 99px; box-sizing: border-box;
  background: color-mix(in srgb, var(--vw-paper) 82%, transparent); border: 1.5px solid var(--vw-edge);
  box-shadow: 0 6px 16px -8px color-mix(in srgb, var(--wy-deep) 50%, transparent); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
@media (min-width: 768px) { .wy-trail { top: 22px; left: 24px; height: 36px; } }
.wy-pk { width: 17px; height: 30px; padding: 0; margin: 0; border: 0; background: none; cursor: default; display: grid; place-items: center; touch-action: manipulation; -webkit-tap-highlight-color: transparent; position: relative; }
.wy-pk.is-done::after { content: ""; position: absolute; inset: -7px -1px; }
@media (max-width: 479px) { .wy-pk { width: 13px; } .wy-trail { padding: 0 5px; } }
@media (max-width: 359px) { .wy-pk { width: 11px; } }
@media (min-width: 768px) { .wy-pk { width: 21px; height: 36px; } }
.wy-pk > span { display: block; width: 100%; opacity: .75; }
.wy-pk.is-done { cursor: pointer; }
.wy-pk.is-done > span { opacity: 1; }
.wy-pk.is-done:hover > span { transform: scale(1.15); }
.wy-pk.is-here > span { opacity: 1; animation: wy-pk-beat .9s ease-in-out infinite; }
.wy-pk:focus-visible { outline: 2px solid var(--vw-ink); outline-offset: -2px; border-radius: 8px; }
.wy-pk > span.wy-pk-nope { animation: wy-pk-nope .42s ease-in-out; }
@keyframes wy-pk-beat { 0%, 100% { transform: scale(1) } 30% { transform: scale(1.22) } 50% { transform: scale(1.02) } 70% { transform: scale(1.14) } }
@keyframes wy-pk-nope { 0%,100% { transform: rotate(0) } 20% { transform: rotate(-16deg) } 45% { transform: rotate(13deg) } 70% { transform: rotate(-8deg) } }
/* The music icon (engine, DayConfig.music.compact) stays bottom-left, level with the pill's middle. */
body .vm-icon { bottom: calc(env(safe-area-inset-bottom, 0px) + 26px); }
body .vm-icon-btn { background: radial-gradient(circle at 50% 38%, var(--vw-accent, #E0637F), var(--vw-accent-deep, #B8435F) 72%); }
@media (min-width: 768px) { body .vm-icon { left: 24px; bottom: 38px; } }

/* The heart wipe. Transform/opacity only; input is blocked only while the screen is covered. */
.wy-wipe { position: fixed; inset: 0; z-index: 74; pointer-events: none; overflow: hidden; contain: strict; display: grid; place-items: center; }
.wy-wipe-wash { position: absolute; inset: 0; background: radial-gradient(circle, var(--vw-paper, #FFF), var(--wy-blush, #FBDCD6) 70%); opacity: 0;
  animation: wy-wash var(--wy-wipe) ease-in-out forwards; }
@keyframes wy-wash { 0% { opacity: 0 } 38% { opacity: .9 } 50% { opacity: 1 } 72% { opacity: .2 } 100% { opacity: 0 } }
.wy-wipe-heart { position: relative; width: 22vmin; height: auto; will-change: transform, opacity; filter: drop-shadow(0 10px 30px color-mix(in srgb, var(--wy-deep, #9A3150) 35%, transparent));
  animation: wy-swell var(--wy-wipe) cubic-bezier(.55,0,.35,1) forwards; }
@keyframes wy-swell { 0% { transform: scale(.05) rotate(-12deg); opacity: 0 } 18% { opacity: 1 } 46% { transform: scale(9) rotate(0); opacity: 1 } 70% { transform: scale(10); opacity: .35 } 100% { transform: scale(11); opacity: 0 } }
.wy-wipe-minis { position: absolute; left: 50%; top: 50%; width: 0; height: 0; }
.wy-wipe-minis i { position: absolute; left: -10px; top: -10px; font-size: 20px; font-style: normal; opacity: 0;
  animation: wy-mini var(--wy-wipe) ease-out forwards; }
@keyframes wy-mini { 0%, 46% { opacity: 0; transform: rotate(var(--a)) translateY(0) scale(.4) } 60% { opacity: 1 } 100% { opacity: 0; transform: rotate(var(--a)) translateY(calc(var(--d) * -1)) scale(1.1) } }
.wy-wipe.is-soft { background: var(--vw-paper, #FFF); opacity: 0; animation: wy-soft var(--wy-wipe) ease-in-out forwards; }
@keyframes wy-soft { 0% { opacity: 0 } 45% { opacity: 1 } 100% { opacity: 0 } }
.wy-wipe-block { position: fixed; inset: 0; z-index: 75; }
`;
