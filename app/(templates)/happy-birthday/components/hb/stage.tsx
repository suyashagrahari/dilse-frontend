"use client";

// The Happy Birthday stage furniture, shared by every scene:
//
//   • HbStage — the context the scenes talk to: the one Next pill, the little
//     sound cues (the kit's procedural SFX — pops, chimes, a match strike) and
//     the replay round.
//   • useNext(label, onPress, icon) — a scene declares its way forward; the
//     shell draws ONE frosted pill for it, fixed bottom-centre, so nothing
//     jumps. Only their tap moves on, and that tap plays the balloon wipe: a
//     big glossy balloon swells from the middle to fill the screen, the scene
//     is swapped behind it, and it bursts into confetti.
//   • CandleTrail — little candles top-left; lit ones are done (tap to go back).
//
// Sounds stay silent until the first tap and whenever the visitor mutes.

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import { useDayMusic } from "../../../_valentine/music/context";
import { useUnlockAudioOnFirstTap } from "../../../_valentine/kit/premium/useScare";
import { sfx, type CueOptions } from "../../../_valentine/kit/premium/sfx";
import { FONTS } from "../../../_valentine/theme";
import { HB_DISPLAY } from "./fonts";

export type NextIcon = "gift" | "cake" | "slice" | "balloon" | "photo" | "letter" | "ticket" | "heart" | "sparkle" | "party" | "crown";

const ICONS: Record<NextIcon, string> = {
  gift: "🎁",
  cake: "🎂",
  slice: "🍰",
  balloon: "🎈",
  photo: "📸",
  letter: "💌",
  ticket: "🎟️",
  heart: "💗",
  sparkle: "✨",
  party: "🥳",
  crown: "👑",
};

interface NextSpec {
  label: string;
  icon: NextIcon;
  onPress: () => void;
  /** false: the press does not change the scene (opens WhatsApp etc.), so no wipe. */
  wipe?: boolean;
}

export type HbCue =
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
  | "paper-rustle"
  | "page-turn"
  | "glass-ping"
  | "ribbon"
  | "match-strike"
  | "flame-whoosh"
  | "firework"
  | "snap"
  | "tick";

interface HbApi {
  setNext: (s: NextSpec | null) => void;
  cue: (id: HbCue, o?: CueOptions) => void;
  /** Changes on every replay — remounts the scenes' GIFs. */
  round: number;
  /** Play the wipe and run `swap` while the screen is covered (replay, the trail). */
  go: (swap: () => void) => number;
}

const Ctx = createContext<HbApi | null>(null);
export function useHb(): HbApi {
  const v = useContext(Ctx);
  if (!v) throw new Error("useHb outside HbStage");
  return v;
}

/**
 * A scene's way forward. `null` hides the pill (pass null until the scene's
 * moment is done). It only moves on when they tap it — no auto-advance.
 */
export function useNext(label: string | null, onPress: () => void, icon: NextIcon = "heart", wipe = true) {
  const { setNext } = useHb();
  const fn = useRef(onPress);
  useLayoutEffect(() => {
    fn.current = onPress;
  });
  useEffect(() => {
    setNext(label ? { label, icon, wipe, onPress: () => fn.current() } : null);
  }, [label, icon, wipe, setNext]);
  useEffect(() => () => setNext(null), [setNext]);
}

const WIPE = { full: 880, soft: 480 } as const;
const COVER_AT = 0.46;

export function HbStage({
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
    (id: HbCue, o?: CueOptions) => {
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
        cue("pop", { gain: 0.55, at: coverAt / 1000 });
        cue("sparkle", { gain: 0.3, at: coverAt / 1000 + 0.08 });
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

  const api = useMemo<HbApi>(() => ({ setNext, cue, round, go }), [setNext, cue, round, go]);

  return (
    <Ctx.Provider value={api}>
      <CandleTrail at={trail.at} rooms={trail.rooms} ending={trail.ending} onJump={(k) => go(() => trail.onJump(k))} />
      {children}
      <NextPill spec={next} onPress={press} />
      {run && <Wipe key={run.id} soft={run.soft} dur={run.dur} />}
      {blocked && <div className="hb-wipe-block" aria-hidden />}
    </Ctx.Provider>
  );
}

const MINI = [0, 40, 80, 120, 160, 200, 240, 280, 320];
const MINI_CHARS = ["🎉", "✨", "🎈", "⭐", "💗", "✨", "🎊", "⭐", "✨"];

/** The balloon wipe: one big glossy balloon swells over the screen, then bursts into confetti. */
function Wipe({ soft, dur }: { soft: boolean; dur: number }) {
  if (soft) return <div className="hb-wipe is-soft" style={{ ["--hb-wipe" as string]: `${dur}ms` }} aria-hidden />;
  return (
    <div className="hb-wipe" style={{ ["--hb-wipe" as string]: `${dur}ms` }} aria-hidden>
      <span className="hb-wipe-wash" />
      <svg className="hb-wipe-balloon" viewBox="0 0 100 120">
        <defs>
          <radialGradient id="hbWipeG" cx="38%" cy="30%" r="78%">
            <stop offset="0" stopColor="var(--vw-paper, #FFFFFF)" />
            <stop offset=".35" stopColor="var(--hb-blush, #FFD8E3)" />
            <stop offset="1" stopColor="var(--vw-gold, #FF9EB5)" />
          </radialGradient>
        </defs>
        <path d="M50 4 C76 4 94 26 94 50 C94 78 70 98 50 100 C30 98 6 78 6 50 C6 26 24 4 50 4 Z" fill="url(#hbWipeG)" />
        <path d="M44 100 L56 100 L50 108 Z" fill="var(--vw-gold, #FF9EB5)" />
        <ellipse cx="32" cy="30" rx="9" ry="15" transform="rotate(-24 32 30)" fill="#FFFFFF" opacity=".55" />
      </svg>
      <span className="hb-wipe-minis">
        {MINI.map((a, k) => (
          <i key={a} style={{ ["--a" as string]: `${a}deg`, ["--d" as string]: `${k % 2 ? 34 : 26}vmin` }}>
            {MINI_CHARS[k]}
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
    <div className="hb-next-wrap">
      <button type="button" className={`hb-next${spec ? "" : " is-hidden"}`} onClick={onPress} disabled={!spec} aria-hidden={!spec} tabIndex={spec ? 0 : -1} data-hb-next>
        <span className="hb-next-gloss" aria-hidden />
        {spec && <span key={spec.label} className="hb-next-ring" aria-hidden />}
        <span className="hb-next-ico" aria-hidden>
          {ICONS[s?.icon ?? "heart"]}
        </span>
        <span className="hb-next-label">{s?.label ?? ""}</span>
        <span className="hb-next-arrow" aria-hidden>
          ›
        </span>
      </button>
    </div>
  );
}

/** Small candles in a pill, top-left: lit = done (tap to go back), the current one flickers. */
export function CandleTrail({ at, rooms, ending, onJump }: { at: number; rooms: number; ending: boolean; onJump: (k: number) => void }) {
  const [nope, setNope] = useState<{ k: number; n: number } | null>(null);
  return (
    <nav className="hb-trail" aria-label={`Step ${Math.min(at + 1, rooms)} of ${rooms}`}>
      {Array.from({ length: rooms }, (_, k) => {
        const done = k < at || ending;
        const here = k === at && !ending;
        return (
          <button
            key={k}
            type="button"
            className={`hb-pk${done ? " is-done" : ""}${here ? " is-here" : ""}`}
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
            <span key={nope?.k === k ? `n${nope.n}` : "s"} className={nope?.k === k ? "hb-pk-nope" : undefined}>
              <svg viewBox="0 0 12 26" width="100%" aria-hidden>
                {(done || here) && <path className="hb-pk-flame" d="M6 1 C8.6 4.6 9.2 6.8 6 9.6 C2.8 6.8 3.4 4.6 6 1 Z" fill="#FFB938" stroke="#FF7A2E" strokeWidth=".8" />}
                <rect x="3" y="10.5" width="6" height="14" rx="1.6" fill={done || here ? "var(--vw-accent, #EE5583)" : "none"} stroke={done || here ? "var(--vw-accent-deep, #C93A63)" : "var(--vw-gold, #FF9EB5)"} strokeWidth="1.4" />
                {(done || here) && <path d="M3.8 15 L8.2 13 M3.8 19 L8.2 17 M3.8 23 L8.2 21" stroke="#FFFFFF" strokeOpacity=".75" strokeWidth="1.1" />}
              </svg>
            </span>
          </button>
        );
      })}
    </nav>
  );
}

export const HB_STAGE_CSS = `
/* One scene = one screen, airy: a calm top band (the candle trail, level with the editor's top bar / the
   viewer's logo), the scene, then a clear bottom strip for the pill alone (the music icon sits bottom-left). */
.hb-scene { position: relative; z-index: 1; box-sizing: border-box; height: 100vh; height: 100dvh;
  display: flex; flex-direction: column; align-items: center; text-align: center; gap: clamp(10px, 2.2dvh, 22px);
  padding: calc(env(safe-area-inset-top, 0px) + clamp(64px, 9dvh, 80px)) 20px max(calc(env(safe-area-inset-bottom, 0px) + 96px), var(--vw-dock-space, 0px));
  width: 100%; max-width: calc(520px * var(--vw-s, 1)); margin: 0 auto; overflow: hidden; color: var(--vw-ink); }
@media (min-width: 768px) { .hb-scene { max-width: 700px; padding-top: calc(var(--vw-top-space, 0px) + 72px); padding-bottom: 116px; gap: clamp(12px, 2.4dvh, 26px); } }
@media (min-width: 1100px) { .hb-scene { max-width: min(760px, 56vw); padding-top: 84px; } }
@media (min-width: 1100px) { .hb-zoom { zoom: 1.14; } }
@media (min-width: 1100px) and (min-height: 1000px) { .hb-zoom { zoom: 1.28; } }
.hb-fill { position: relative; flex: 1 1 0; min-height: 0; width: 100%; container-type: size; display: grid; grid-template: minmax(0, 1fr) / minmax(0, 1fr); place-items: center; }

/* Scene titles: a small kicker, a bouncy heading, a soft line. */
.hb-head { flex: none; display: grid; gap: 4px; justify-items: center; max-width: 460px; }
.hb-kick { margin: 0; font: 700 clamp(11px, 1.7dvh, 13px)/1.2 ${FONTS.ui}; letter-spacing: .16em; text-transform: uppercase; color: var(--vw-accent-deep); }
.hb-title { margin: 0; font: 800 clamp(27px, min(8.2vw, 4.8dvh), 42px)/1.1 ${HB_DISPLAY}; color: var(--vw-ink); text-wrap: balance; overflow-wrap: anywhere; }
.hb-sub { margin: 0; font: 500 clamp(14px, 2.1dvh, 16.5px)/1.45 ${FONTS.ui}; color: var(--vw-ink-soft); text-wrap: balance; overflow-wrap: anywhere; }
@media (min-width: 1100px) { .hb-title { font-size: clamp(36px, 5dvh, 52px); } .hb-sub { font-size: 17px; } }
.hb-em { font-style: normal; color: var(--vw-accent); }
.hb-hint { flex: none; margin: 0; min-height: 22px; font: 700 clamp(15px, 2.3dvh, 18px) ${HB_DISPLAY}; color: var(--vw-accent-deep); }

/* The one way forward: always the same spot, bottom centre, clear of the music icon on its left. */
.hb-next-wrap { position: fixed; z-index: 60; left: 0; right: 0; bottom: calc(env(safe-area-inset-bottom, 0px) + 18px);
  display: flex; justify-content: center; pointer-events: none; padding: 0 62px; box-sizing: border-box; }
@media (min-width: 768px) { .hb-next-wrap { bottom: 30px; } }
.hb-next { pointer-events: auto; position: relative; display: inline-flex; align-items: center; gap: 9px; height: 56px; max-width: 100%; min-width: 0; padding: 0 20px 0 7px;
  border: 0; border-radius: 999px; cursor: pointer; color: #FFFFFF;
  background: linear-gradient(180deg, color-mix(in srgb, var(--vw-accent) 72%, #FFFFFF) 0%, var(--vw-accent) 55%, var(--vw-accent-deep) 100%);
  box-shadow: 0 5px 0 var(--hb-deep), 0 0 0 4px color-mix(in srgb, var(--vw-paper) 70%, transparent), 0 14px 30px -10px color-mix(in srgb, var(--hb-deep) 70%, transparent);
  transition: transform .45s cubic-bezier(.2,.9,.25,1.2), opacity .3s ease, box-shadow .2s ease; touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
.hb-next.is-hidden { opacity: 0; transform: translateY(18px) scale(.9); pointer-events: none; transition-duration: .25s; }
.hb-next:active { transform: translateY(4px) scale(.97); box-shadow: 0 1px 0 var(--hb-deep), 0 0 0 4px color-mix(in srgb, var(--vw-paper) 70%, transparent); transition-duration: .08s; }
.hb-next:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 4px; }
.hb-next-gloss { position: absolute; left: 14px; right: 14px; top: 4px; height: 40%; border-radius: 999px; background: linear-gradient(180deg, rgba(255,255,255,.55), rgba(255,255,255,0)); pointer-events: none; }
.hb-next-ring { position: absolute; inset: -3px; border-radius: inherit; border: 3px solid var(--vw-accent); opacity: 0; pointer-events: none; animation: hb-ring 1.9s ease-out 2s infinite; }
@keyframes hb-ring { 0% { opacity: .8; transform: scale(1) } 100% { opacity: 0; transform: scale(1.12, 1.5) } }
.hb-next-ico { position: relative; width: 42px; height: 42px; flex: none; border-radius: 50%; display: grid; place-items: center; font-size: 22px; line-height: 1;
  background: radial-gradient(circle at 40% 35%, #FFFFFF, var(--hb-blush)); box-shadow: inset 0 -3px 0 color-mix(in srgb, var(--hb-deep) 25%, transparent), 0 2px 6px color-mix(in srgb, var(--hb-deep) 40%, transparent); animation: hb-bob 1.2s ease-in-out infinite alternate; }
@keyframes hb-bob { from { transform: translateY(-2px) rotate(-10deg) } to { transform: translateY(2px) rotate(10deg) } }
.hb-next-label { position: relative; min-width: 0; font: 800 18px/1.25 ${HB_DISPLAY}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-shadow: 0 1px 0 color-mix(in srgb, var(--hb-deep) 55%, transparent); }
.hb-next-arrow { position: relative; font: 700 26px/1 ${FONTS.ui}; margin-left: 2px; margin-top: -3px; }
@media (min-width: 1100px) { .hb-next-wrap .hb-next { transform: scale(1.1); transform-origin: 50% 100%; } .hb-next-wrap .hb-next.is-hidden { transform: translateY(18px); } }
@media (prefers-reduced-motion: reduce) { .hb-next-ico, .hb-next-ring { animation: none; } }

/* The candle trail: small, top-left, level with the editor's top bar (which sits top-right). */
.hb-trail { position: fixed; z-index: 62; top: calc(max(10px, env(safe-area-inset-top, 0px)) + 8px); left: max(12px, env(safe-area-inset-left, 0px));
  display: flex; align-items: center; gap: 1px; height: 32px; padding: 0 7px; border-radius: 99px; box-sizing: border-box;
  background: color-mix(in srgb, var(--vw-paper) 82%, transparent); border: 1.5px solid var(--vw-edge);
  box-shadow: 0 6px 16px -8px color-mix(in srgb, var(--hb-deep) 50%, transparent); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
@media (min-width: 768px) { .hb-trail { top: 22px; left: 24px; height: 38px; } }
.hb-pk { width: 15px; height: 32px; padding: 0; margin: 0; border: 0; background: none; cursor: default; display: grid; place-items: center; touch-action: manipulation; -webkit-tap-highlight-color: transparent; position: relative; }
.hb-pk.is-done::after { content: ""; position: absolute; inset: -6px -1px; }
@media (max-width: 479px) { .hb-pk { width: 13px; } .hb-trail { padding: 0 6px; } }
@media (max-width: 359px) { .hb-pk { width: 11px; } }
@media (min-width: 768px) { .hb-pk { width: 18px; height: 38px; } }
.hb-pk > span { display: block; width: 66%; opacity: .8; }
.hb-pk.is-done { cursor: pointer; }
.hb-pk.is-done > span { opacity: 1; }
.hb-pk.is-done:hover > span { transform: scale(1.15); }
.hb-pk.is-here > span { opacity: 1; }
.hb-pk-flame { transform-box: fill-box; transform-origin: 50% 100%; animation: hb-flick .5s ease-in-out infinite alternate; }
.hb-pk.is-done .hb-pk-flame { animation-duration: 1.4s; }
.hb-pk:focus-visible { outline: 2px solid var(--vw-ink); outline-offset: -2px; border-radius: 8px; }
.hb-pk > span.hb-pk-nope { animation: hb-pk-nope .42s ease-in-out; }
@keyframes hb-flick { from { transform: scale(.9, 1) rotate(-6deg) } to { transform: scale(1.08, 1.12) rotate(5deg) } }
@keyframes hb-pk-nope { 0%,100% { transform: rotate(0) } 20% { transform: rotate(-16deg) } 45% { transform: rotate(13deg) } 70% { transform: rotate(-8deg) } }
@media (prefers-reduced-motion: reduce) { .hb-pk-flame { animation: none; } }
/* The music icon (engine, DayConfig.music.compact) stays bottom-left, level with the pill's middle. */
body .vm-icon { bottom: calc(env(safe-area-inset-bottom, 0px) + 26px); }
body .vm-icon-btn { background: radial-gradient(circle at 50% 38%, var(--vw-accent, #EE5583), var(--vw-accent-deep, #C93A63) 72%); }
@media (min-width: 768px) { body .vm-icon { left: 24px; bottom: 38px; } }

/* The balloon wipe. Transform/opacity only; input is blocked only while the screen is covered. */
.hb-wipe { position: fixed; inset: 0; z-index: 74; pointer-events: none; overflow: hidden; contain: strict; display: grid; place-items: center; }
.hb-wipe-wash { position: absolute; inset: 0; background: radial-gradient(circle, var(--vw-paper, #FFF), var(--hb-blush, #FFD8E3) 70%); opacity: 0;
  animation: hb-wash var(--hb-wipe) ease-in-out forwards; }
@keyframes hb-wash { 0% { opacity: 0 } 38% { opacity: .9 } 50% { opacity: 1 } 72% { opacity: .2 } 100% { opacity: 0 } }
.hb-wipe-balloon { position: relative; width: 20vmin; height: auto; will-change: transform, opacity; filter: drop-shadow(0 10px 30px color-mix(in srgb, var(--hb-deep, #A82C55) 35%, transparent));
  animation: hb-swell var(--hb-wipe) cubic-bezier(.55,0,.35,1) forwards; }
@keyframes hb-swell { 0% { transform: translateY(30vh) scale(.08) rotate(-10deg); opacity: 0 } 16% { opacity: 1 } 46% { transform: translateY(0) scale(9) rotate(0); opacity: 1 } 54% { transform: scale(10.5); opacity: .4 } 100% { transform: scale(11); opacity: 0 } }
.hb-wipe-minis { position: absolute; left: 50%; top: 50%; width: 0; height: 0; }
.hb-wipe-minis i { position: absolute; left: -11px; top: -11px; font-size: 22px; font-style: normal; opacity: 0;
  animation: hb-mini var(--hb-wipe) ease-out forwards; }
@keyframes hb-mini { 0%, 46% { opacity: 0; transform: rotate(var(--a)) translateY(0) scale(.4) } 58% { opacity: 1 } 100% { opacity: 0; transform: rotate(var(--a)) translateY(calc(var(--d) * -1)) scale(1.1) } }
.hb-wipe.is-soft { background: var(--vw-paper, #FFF); opacity: 0; animation: hb-soft var(--hb-wipe) ease-in-out forwards; }
@keyframes hb-soft { 0% { opacity: 0 } 45% { opacity: 1 } 100% { opacity: 0 } }
.hb-wipe-block { position: fixed; inset: 0; z-index: 75; }
`;
