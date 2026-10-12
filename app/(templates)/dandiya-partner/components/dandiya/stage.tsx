"use client";

// The Dandiya night's stage furniture, shared by every scene:
//
//   • DdStage — the context the scenes talk to: the one Next pill, the little
//     sound cues (dhol, the sticks' "tak", ghungroo bells) and the replay round.
//   • useNext(label, onPress) — a scene declares its way forward; the shell
//     draws ONE marigold pill for it, fixed bottom-centre, so nothing jumps.
//     Nothing moves on by itself: only her tap does, and that tap draws the
//     mandap curtains (see Curtain below) — the scene changes behind them.
//   • DiyaTrail — eight tiny diyas top-left; lit ones are done (tap to go back).
//
// Sounds are procedural (the kit's SFX bank + three local cues registered
// here), silent until the first tap and whenever the visitor mutes.

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { templateMedia } from "@/lib/templateMedia";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import { useDayMusic } from "../../../_valentine/music/context";
import { useUnlockAudioOnFirstTap } from "../../../_valentine/kit/premium/useScare";
import { registerCue, sfx, type CueOptions } from "../../../_valentine/kit/premium/sfx";
import { noiseBuffer } from "../../../_valentine/kit/premium/audio";
import { FONTS } from "../../../_valentine/theme";
import { Diya, Sparkle, Stick, Toran } from "./art";
import { DD_DISPLAY } from "./fonts";
import { DD } from "./ui";

const f = (n: string) => templateMedia("_festive", n);
export const DD_GIF = {
  /** the panda couple's dandiya dance (animated, 12 KB) */
  panda: f("bubudubu-dandiya-playing.webp"),
  /** crossed dandiya sticks with marigolds, "Dandiya Dhamaal! Happy Navratri!" (still) */
  dhamal: f("dandiya-dhamal.webp"),
  /** a couple mid-dandiya in yellow and red (still) */
  couple: f("dandiyapartyner.webp"),
} as const;

/** Warm the HTTP cache for an image (idempotent). */
const warmed = new Set<string>();
export function preload(url: string) {
  if (typeof window === "undefined" || warmed.has(url)) return;
  warmed.add(url);
  const img = new Image();
  img.decoding = "async";
  img.src = url;
}

// ─── Local cues ──────────────────────────────────────────────────────────────

let cuesReady = false;
function registerDandiyaCues() {
  if (cuesReady) return;
  cuesReady = true;
  // The dhol: a pitch-dropping sine (the bass head) plus a short slap of noise.
  registerCue("dd-dhol", ({ c, out, t, o }) => {
    const lo = c.createOscillator();
    const g = c.createGain();
    lo.type = "sine";
    lo.frequency.setValueAtTime(o.detune ? 150 : 130, t);
    lo.frequency.exponentialRampToValueAtTime(52, t + 0.2);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.9, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.34);
    lo.connect(g).connect(out);
    lo.start(t);
    lo.stop(t + 0.36);
    const n = c.createBufferSource();
    n.buffer = noiseBuffer("white");
    const bp = c.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 900;
    const ng = c.createGain();
    ng.gain.setValueAtTime(0.0001, t);
    ng.gain.linearRampToValueAtTime(0.25, t + 0.003);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
    n.connect(bp).connect(ng).connect(out);
    n.start(t);
    n.stop(t + 0.1);
    return 0.01;
  });
  // The sticks: a bright wooden "tak" — two damped high partials and a click of noise.
  registerCue("dd-tak", ({ c, out, t, k }) => {
    for (const [fr, lvl] of [
      [1850, 0.5],
      [3100, 0.25],
    ] as const) {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = "triangle";
      o.frequency.setValueAtTime(fr * k, t);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(lvl, t + 0.002);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
      o.connect(g).connect(out);
      o.start(t);
      o.stop(t + 0.1);
    }
    const n = c.createBufferSource();
    n.buffer = noiseBuffer("white");
    const hp = c.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 2500;
    const ng = c.createGain();
    ng.gain.setValueAtTime(0.0001, t);
    ng.gain.linearRampToValueAtTime(0.35, t + 0.001);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
    n.connect(hp).connect(ng).connect(out);
    n.start(t);
    n.stop(t + 0.05);
    return 0;
  });
  // Ghungroo: a little shimmer of ankle bells.
  registerCue("dd-bells", ({ c, out, t, k }) => {
    for (let i = 0; i < 6; i++) {
      const o = c.createOscillator();
      const g = c.createGain();
      const at = t + i * 0.035 + Math.random() * 0.02;
      o.type = "sine";
      o.frequency.setValueAtTime((4200 + Math.random() * 1600) * k, at);
      g.gain.setValueAtTime(0.0001, at);
      g.gain.linearRampToValueAtTime(0.12, at + 0.003);
      g.gain.exponentialRampToValueAtTime(0.0001, at + 0.22);
      o.connect(g).connect(out);
      o.start(at);
      o.stop(at + 0.24);
    }
    return 0.05;
  });
}

// ─── Context ─────────────────────────────────────────────────────────────────

export type NextIcon = "sticks" | "diya" | "heart" | "dance" | "sparkle" | "letter";

interface NextSpec {
  label: string;
  icon: NextIcon;
  onPress: () => void;
  /** false: the press does not change the scene (opens WhatsApp etc.), so no curtain. */
  curtain?: boolean;
}

export type DdCue = "dd-dhol" | "dd-tak" | "dd-bells" | "chime" | "sparkle" | "whoosh" | "swoosh-soft" | "pop" | "paper-rustle" | "page-turn" | "chime-cascade" | "match-strike";

interface DdApi {
  setNext: (s: NextSpec | null) => void;
  cue: (id: DdCue, o?: CueOptions) => void;
  /** Changes on every replay — remounts the scenes' GIFs. */
  round: number;
  /** Draw the curtains and run `swap` while they are shut (a scene change that is not the pill: replay, the trail). */
  go: (swap: () => void) => number;
}

const Ctx = createContext<DdApi | null>(null);
export function useDd(): DdApi {
  const v = useContext(Ctx);
  if (!v) throw new Error("useDd outside DdStage");
  return v;
}

/**
 * A scene's way forward: the shell draws it as the marigold pill. `null` hides
 * it (pass null until the scene's moment is done). It only moves on when she
 * taps it — no auto-advance, no skip.
 */
export function useNext(label: string | null, onPress: () => void, icon: NextIcon = "sticks", curtain = true) {
  const { setNext } = useDd();
  const fn = useRef(onPress);
  useLayoutEffect(() => {
    fn.current = onPress;
  });
  useEffect(() => {
    setNext(label ? { label, icon, curtain, onPress: () => fn.current() } : null);
  }, [label, icon, curtain, setNext]);
  useEffect(() => () => setNext(null), [setNext]);
}

// ─── The curtain (every scene change) ───────────────────────────────────────
//
// Two embroidered mandap curtains — kumkum velvet in soft pleats, bandhani dots,
// a zari edge set with little mirrors, a tasselled hem — sweep in from the sides
// under a marigold toran and meet in the middle. While they are shut, a mirror
// rosette blooms where they meet and two dandiya sticks clash across it (tak!)
// with a flash of light; that is when the next scene is swapped in, out of
// sight. Then the curtains part on it. Transform/opacity only, one composited
// layer per piece, ~0.9 s (a little shorter and lighter on phones). Reduced
// motion gets a soft dusk cross-fade instead. Input is blocked only while shut.

type CurtainKind = "full" | "lite" | "soft";
interface CurtainRun {
  id: number;
  kind: CurtainKind;
  dur: number;
}
const CURTAIN = {
  full: { dur: 880, shut: 0.37, open: 0.6 },
  lite: { dur: 780, shut: 0.38, open: 0.6 },
  soft: { dur: 520, shut: 0.45, open: 0.55 },
} as const;

export function DdStage({
  round,
  trail,
  children,
}: {
  round: number;
  trail: {
    at: number;
    rooms: number;
    ending: boolean;
    onJump: (k: number) => void;
  };
  children: ReactNode;
}) {
  const music = useDayMusic();
  useUnlockAudioOnFirstTap();
  const reduced = useReducedMotion();
  const [next, setNextState] = useState<NextSpec | null>(null);
  const [run, setRun] = useState<CurtainRun | null>(null);
  const [blocked, setBlocked] = useState(false);
  const busy = useRef(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    registerDandiyaCues();
    const ts = timers.current;
    return () => ts.forEach((t) => window.clearTimeout(t));
  }, []);

  // Build the curtains once the first scene has settled (kept hidden), so a tap only has to show them.
  const [ready, setReady] = useState<CurtainKind | null>(null);
  useEffect(() => {
    const t = window.setTimeout(() => setReady(curtainKind(reduced)), 900);
    return () => window.clearTimeout(t);
  }, [reduced]);

  // The sender chose "no music" (or the visitor turned it off): stay quiet.
  const quiet = !!music && (music.mode === "off" || music.userOff);
  const cue = useCallback(
    (id: DdCue, o?: CueOptions) => {
      if (!quiet) sfx(id, o);
    },
    [quiet],
  );

  const gen = useRef(0);
  const setNext = useCallback((s: NextSpec | null) => {
    gen.current += 1;
    setNextState(s);
  }, []);

  /** Draw the curtains, run `swap` while they are shut, part them again. Returns the run's length (ms). */
  const go = useCallback(
    (swap: () => void): number => {
      if (busy.current) return 0;
      busy.current = true;
      const kind = curtainKind(reduced);
      const c = CURTAIN[kind];
      const shutAt = Math.round(c.dur * c.shut);
      const at = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));
      if (kind !== "soft") {
        cue("swoosh-soft", { gain: 0.55 });
        cue("dd-tak", { gain: 0.95, at: shutAt / 1000 + 0.03 });
        cue("sparkle", { gain: 0.35, at: shutAt / 1000 + 0.06 });
        cue("dd-tak", { gain: 0.75, at: shutAt / 1000 + 0.15, detune: 120 });
        at(shutAt + 30, () => haptic(14));
      }
      setRun({ id: performance.now(), kind, dur: c.dur });
      setBlocked(true);
      at(shutAt, swap);
      at(Math.round(c.dur * c.open), () => setBlocked(false));
      at(c.dur + 40, () => {
        setRun(null);
        busy.current = false;
      });
      return c.dur;
    },
    [reduced, cue],
  );

  const press = () => {
    if (!next || busy.current) return;
    haptic(12);
    cue("dd-tak", { gain: 0.55 });
    const spec = next;
    setNextState(null);
    const g0 = gen.current;
    // A press that does not change the scene (e.g. "Pass it on") brings its pill back.
    const restore = (ms: number) =>
      window.setTimeout(() => {
        if (gen.current === g0) setNextState(spec);
      }, ms);
    if (spec.curtain === false) {
      spec.onPress();
      restore(900);
      return;
    }
    restore(go(spec.onPress) + 250);
  };

  const api = useMemo<DdApi>(() => ({ setNext, cue, round, go }), [setNext, cue, round, go]);

  return (
    <Ctx.Provider value={api}>
      <DiyaTrail at={trail.at} rooms={trail.rooms} ending={trail.ending} onJump={(k) => go(() => trail.onJump(k))} />
      {children}
      <NextPill spec={next} onPress={press} />
      {(run || ready) && <Curtain key={run?.kind ?? ready!} kind={run?.kind ?? ready!} dur={run?.dur ?? CURTAIN[ready!].dur} active={!!run} />}
      {blocked && <div className="dd-cur-block" aria-hidden />}
    </Ctx.Provider>
  );
}

const SPARKS = [0, 45, 90, 135, 180, 225, 270, 315];

function curtainKind(reduced: boolean): CurtainKind {
  return reduced ? "soft" : window.matchMedia("(max-width: 767px)").matches ? "lite" : "full";
}

/** Always mounted once built; hidden (display: none) between runs, and showing it restarts every animation. */
function Curtain({ kind, dur, active }: { kind: CurtainKind; dur: number; active: boolean }) {
  const state = active ? kind : undefined;
  if (kind === "soft")
    return (
      <div className={`dd-cur${active ? "" : " is-idle"}`} style={{ ["--dd-cur" as string]: `${dur}ms` }} aria-hidden data-dd-curtain={state}>
        <span className="dd-cur-soft" />
      </div>
    );
  return (
    <div className={`dd-cur is-${kind}${active ? "" : " is-idle"}`} style={{ ["--dd-cur" as string]: `${dur}ms` }} aria-hidden data-dd-curtain={state}>
      <span className="dd-cur-p dd-cur-l">
        <span className="dd-cur-cloth" />
      </span>
      <span className="dd-cur-p dd-cur-r">
        <span className="dd-cur-cloth" />
      </span>
      <span className="dd-cur-val">
        <span className="dd-cur-pelmet" />
        <Toran height={kind === "lite" ? 40 : 54} />
      </span>
      <span className="dd-cur-mid">
        <span className="dd-cur-burst" />
        <span className="dd-cur-rosette" />
        <span className="dd-cur-stick is-a">
          <Stick length="100%" a={DD.kumkum} b={DD.peacock} />
        </span>
        <span className="dd-cur-stick is-b">
          <Stick length="100%" a={DD.rani} b={DD.emerald} />
        </span>
        <span className="dd-cur-flash" />
        {kind === "full" &&
          SPARKS.map((a, k) => (
            <span
              key={a}
              className="dd-cur-spark"
              style={{
                ["--a" as string]: `${a + (k % 2 ? 12 : 0)}deg`,
                ["--r" as string]: k % 2 ? "-118%" : "-92%",
              }}
            >
              <Sparkle size={k % 2 ? 12 : 16} color={k % 3 ? "#FFF7E8" : "#FFE07A"} />
            </span>
          ))}
      </span>
    </div>
  );
}

// ─── The marigold pill ───────────────────────────────────────────────────────

function PillIcon({ icon }: { icon: NextIcon }) {
  if (icon === "diya") return <Diya lit size={34} style={{ marginTop: -6 }} />;
  if (icon === "sticks")
    return (
      <svg viewBox="0 0 40 40" width="30" height="30" aria-hidden>
        <g strokeLinecap="round">
          <path d="M8 32 L32 8" stroke="#D7263D" strokeWidth="5.5" />
          <path d="M8 32 L32 8" stroke="#F6D27A" strokeWidth="5.5" strokeDasharray="3 6" />
          <path d="M8 8 L32 32" stroke="#1590B8" strokeWidth="5.5" />
          <path d="M8 8 L32 32" stroke="#F6D27A" strokeWidth="5.5" strokeDasharray="3 6" />
        </g>
      </svg>
    );
  const emoji: Record<Exclude<NextIcon, "diya" | "sticks">, string> = {
    heart: "💛",
    dance: "🐼",
    sparkle: "✨",
    letter: "💌",
  };
  return <span style={{ fontSize: 23, lineHeight: 1 }}>{emoji[icon]}</span>;
}

function NextPill({ spec, onPress }: { spec: NextSpec | null; onPress: () => void }) {
  // Keep the last label while the pill fades out, so it never flashes empty.
  const [shown, setShown] = useState<NextSpec | null>(spec);
  if (spec && spec !== shown) setShown(spec);
  const s = spec ?? shown;
  return (
    <div className="dd-next-wrap">
      <button type="button" className={`dd-next${spec ? "" : " is-hidden"}`} onClick={onPress} disabled={!spec} aria-hidden={!spec} tabIndex={spec ? 0 : -1}>
        <span className="dd-next-mirrors" aria-hidden />
        <span className="dd-next-gloss" aria-hidden />
        {spec && <span key={spec.label} className="dd-next-ring" aria-hidden />}
        <span className="dd-next-ico" aria-hidden>
          <PillIcon icon={s?.icon ?? "sticks"} />
        </span>
        <span className="dd-next-label">{s?.label ?? ""}</span>
        <span className="dd-next-arrow" aria-hidden>
          ›
        </span>
      </button>
    </div>
  );
}

// ─── The diya trail (progress) ───────────────────────────────────────────────

/** Small diyas in a pill, top-left: lit = done (tap to go back), the current one flickers. */
export function DiyaTrail({ at, rooms, ending, onJump }: { at: number; rooms: number; ending: boolean; onJump: (k: number) => void }) {
  const [nope, setNope] = useState<{ k: number; n: number } | null>(null);
  return (
    <nav className="dd-trail" aria-label={`Step ${Math.min(at + 1, rooms)} of ${rooms}`}>
      {Array.from({ length: rooms }, (_, k) => {
        const done = k < at || ending;
        const here = k === at && !ending;
        return (
          <button
            key={k}
            type="button"
            className={`dd-pk${done ? " is-done" : ""}${here ? " is-here" : ""}`}
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
            <span key={nope?.k === k ? `n${nope.n}` : "s"} className={nope?.k === k ? "dd-pk-nope" : undefined}>
              <Diya lit={done || here} size="100%" />
            </span>
          </button>
        );
      })}
    </nav>
  );
}

// ─── CSS (one block for the whole template) ──────────────────────────────────

export const DD_STAGE_CSS = `
/* One scene = one screen, airy: a calm top band (the diya trail in the corner, level with the editor's
   top bar / the viewer's logo), the scene's content, then a clear bottom strip for the pill alone
   (the music icon sits bottom-left beside it). */
.dd-scene { position: relative; z-index: 1; box-sizing: border-box; height: 100vh; height: 100dvh;
  display: flex; flex-direction: column; align-items: center; text-align: center; gap: clamp(10px, 2.2dvh, 22px);
  padding: calc(env(safe-area-inset-top, 0px) + clamp(64px, 9dvh, 80px)) 20px max(calc(env(safe-area-inset-bottom, 0px) + 96px), var(--vw-dock-space, 0px));
  width: 100%; max-width: calc(520px * var(--vw-s, 1)); margin: 0 auto; overflow: hidden; }
@media (min-width: 768px) { .dd-scene { max-width: 700px; padding-top: calc(var(--vw-top-space, 0px) + 72px); padding-bottom: 116px; gap: clamp(12px, 2.4dvh, 26px); } }
@media (min-width: 1100px) { .dd-scene { max-width: min(800px, 58vw); padding-top: 84px; } }
@media (min-width: 1100px) {
  [data-vw-root="dandiya-partner"][data-vw-layout="full"] { --vw-s: 1.35; }
  .dd-head h1, .dd-head h2 { font-size: clamp(38px, 5.4dvh, 56px) !important; }
  .dd-head > p:first-child { font-size: 13px !important; }
  .dd-head > p:last-child:not(:first-child) { font-size: 16.5px !important; max-width: 500px !important; }
  .dd-next-wrap .dd-next { transform: scale(1.1); transform-origin: 50% 100%; }
  .dd-next-wrap .dd-next.is-hidden { transform: translateY(18px) scale(1); }
}
@media (min-width: 1100px) and (min-height: 1000px) { [data-vw-root="dandiya-partner"][data-vw-layout="full"] { --vw-s: 1.5; } }
/* Paper cards with small print scale up as a whole on wide screens. */
@media (min-width: 1100px) { .dd-zoom { zoom: 1.18; } }
@media (min-width: 1100px) and (min-height: 1000px) { .dd-zoom { zoom: 1.32; } }
.dd-fill { position: relative; flex: 1 1 0; min-height: 0; width: 100%; container-type: size; display: grid; grid-template: minmax(0, 1fr) / minmax(0, 1fr); place-items: center; }

/* The one way forward: always the same spot, bottom centre, clear of the music icon on its left. */
.dd-next-wrap { position: fixed; z-index: 60; left: 0; right: 0; bottom: calc(env(safe-area-inset-bottom, 0px) + 18px);
  display: flex; justify-content: center; pointer-events: none; padding: 0 62px; box-sizing: border-box; }
@media (min-width: 768px) { .dd-next-wrap { bottom: 30px; } }
.dd-next { pointer-events: auto; position: relative; display: inline-flex; align-items: center; gap: 9px; height: 56px; max-width: 100%; min-width: 0; padding: 0 20px 0 7px;
  border: 0; border-radius: 999px; cursor: pointer; color: #3A1404; background: linear-gradient(180deg, #FFE08A 0%, #FFB627 48%, #F08A0C 100%);
  box-shadow: 0 5px 0 #A8580A, 0 0 0 3px rgba(246,210,122,.4), 0 0 34px -4px rgba(255,182,39,.75), 0 18px 30px -12px rgba(0,0,0,.6);
  transition: transform .45s cubic-bezier(.2,.9,.25,1.2), opacity .3s ease, box-shadow .2s ease; touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
.dd-next.is-hidden { opacity: 0; transform: translateY(18px) scale(.9); pointer-events: none; transition-duration: .25s; }
.dd-next:active { transform: translateY(4px) scale(.97); box-shadow: 0 1px 0 #A8580A, 0 0 0 3px rgba(246,210,122,.5), 0 0 26px -4px rgba(255,182,39,.7); transition-duration: .08s; }
.dd-next:focus-visible { outline: 3px solid #7FD8F2; outline-offset: 4px; }
/* a band of tiny mirrors (sheesha) along the pill's lower edge, glinting */
.dd-next-mirrors { position: absolute; left: 50px; right: 16px; bottom: 5px; height: 8px; pointer-events: none; opacity: .9;
  background: radial-gradient(circle, #FFFFFF 0 1.4px, #DCE7FF 1.9px, #B8862E 2.6px, rgba(0,0,0,0) 3px) 0 50% / 10px 8px repeat-x; }
.dd-next-mirrors::after { content: ""; position: absolute; inset: -2px 0; background: linear-gradient(90deg, transparent 0, rgba(255,255,255,.95) 50%, transparent 100%) -40px 0 / 40px 100% no-repeat; animation: dd-glint 2.4s ease-in-out infinite; mix-blend-mode: screen; }
@keyframes dd-glint { 0% { background-position: -40px 0 } 60%, 100% { background-position: calc(100% + 40px) 0 } }
.dd-next-gloss { position: absolute; left: 14px; right: 14px; top: 4px; height: 38%; border-radius: 999px; background: linear-gradient(180deg, rgba(255,255,255,.6), rgba(255,255,255,0)); pointer-events: none; }
.dd-next-ring { position: absolute; inset: -3px; border-radius: inherit; border: 3px solid rgba(255,224,138,.9); opacity: 0; pointer-events: none; animation: dd-ring 1.9s ease-out 2s infinite; }
@keyframes dd-ring { 0% { opacity: .85; transform: scale(1) } 100% { opacity: 0; transform: scale(1.12, 1.5) } }
.dd-next-ico { position: relative; width: 42px; height: 42px; flex: none; border-radius: 50%; display: grid; place-items: center;
  background: radial-gradient(circle at 40% 35%, #FFFDF6, #FFE9C9); box-shadow: inset 0 -3px 0 rgba(168,88,10,.22), 0 2px 6px rgba(122,52,16,.35); animation: dd-bob 1.2s ease-in-out infinite alternate; }
@keyframes dd-bob { from { transform: translateY(-2px) rotate(-10deg) } to { transform: translateY(2px) rotate(10deg) } }
.dd-next-label { position: relative; min-width: 0; font: 400 18px/1.25 ${DD_DISPLAY}; padding-top: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-shadow: 0 1px 0 rgba(255,240,200,.7); }
.dd-next-arrow { position: relative; font: 700 26px/1 ${FONTS.ui}; margin-left: 2px; margin-top: -3px; }

/* The diya trail: small, top-left, level with the editor's top bar (which sits top-right). */
.dd-trail { position: fixed; z-index: 62; top: calc(max(10px, env(safe-area-inset-top, 0px)) + 8px); left: max(12px, env(safe-area-inset-left, 0px));
  display: flex; align-items: center; height: 30px; padding: 0 5px; border-radius: 99px; box-sizing: border-box;
  background: linear-gradient(180deg, rgba(122,15,18,.94), rgba(62,6,9,.94)); border: 1px solid rgba(246,210,122,.28);
  box-shadow: 0 0 14px -5px rgba(255,182,39,.45), inset 0 1px 0 rgba(255,255,255,.08); }
@media (min-width: 768px) { .dd-trail { top: 22px; left: 24px; height: 36px; } }
.dd-pk { width: 19px; height: 30px; padding: 0; margin: 0; border: 0; background: none; cursor: default; display: grid; place-items: center;
  touch-action: manipulation; -webkit-tap-highlight-color: transparent; position: relative; }
.dd-pk.is-done::after { content: ""; position: absolute; inset: -7px -1px; }
@media (max-width: 379px) { .dd-pk { width: 16px; } }
@media (min-width: 768px) { .dd-pk { width: 22px; height: 36px; } }
.dd-pk > span { display: block; width: 100%; margin-top: -3px; filter: grayscale(.6) brightness(.75); opacity: .7; }
.dd-pk.is-done { cursor: pointer; }
.dd-pk.is-done > span { filter: none; opacity: 1; }
.dd-pk.is-done:hover > span { transform: scale(1.15); }
.dd-pk.is-here > span { filter: drop-shadow(0 0 4px rgba(255,210,122,1)); opacity: 1; animation: dd-pk-bob 1.3s ease-in-out infinite alternate; }
.dd-pk:focus-visible { outline: 2px solid #7FD8F2; outline-offset: -2px; border-radius: 8px; }
.dd-pk > span.dd-pk-nope { animation: dd-pk-nope .42s ease-in-out; }
@keyframes dd-pk-bob { from { transform: translateY(1px) scale(1.02) } to { transform: translateY(-2px) scale(1.14) } }
@keyframes dd-pk-nope { 0%,100% { transform: rotate(0) } 20% { transform: rotate(-16deg) } 45% { transform: rotate(13deg) } 70% { transform: rotate(-8deg) } }
/* The music icon (engine, DayConfig.music.compact) stays bottom-left, level with the pill's middle. */
body .vm-icon { bottom: calc(env(safe-area-inset-bottom, 0px) + 26px); }
body .vm-icon-btn { background: radial-gradient(circle at 50% 38%, #A3141E, #4A080C 72%); }
@media (min-width: 768px) { body .vm-icon { left: 24px; bottom: 38px; } }

/* The curtains. Every moving piece is its own composited layer and only its transform/opacity animate. */
.dd-cur { position: fixed; inset: 0; z-index: 74; pointer-events: none; overflow: hidden; contain: strict; }
.dd-cur.is-idle { display: none; }
.dd-cur-block { position: fixed; inset: 0; z-index: 76; cursor: progress; touch-action: none; }
.dd-cur-p { position: absolute; top: 0; bottom: 0; width: 50.8%; will-change: transform; backface-visibility: hidden; }
.dd-cur-l { left: 0; transform-origin: 0 50%; animation: dd-cur-l var(--dd-cur) linear both; }
.dd-cur-r { right: 0; transform-origin: 100% 50%; animation: dd-cur-r var(--dd-cur) linear both; }
.dd-cur-r .dd-cur-cloth { transform: scaleX(-1); }
/* kumkum velvet: the zari edge (gold rules + a column of mirrors), a woven band and mirrors above the hem,
   soft pleats with light on their crests, sparse bandhani knots, light falling from the toran */
.dd-cur-cloth { position: absolute; inset: 0; box-shadow: 0 0 40px rgba(20,0,2,.55);
  background:
    linear-gradient(90deg, rgba(0,0,0,0) calc(100% - 44px), #F6D27A calc(100% - 44px) calc(100% - 40px), #B8862E calc(100% - 40px) calc(100% - 38px), rgba(0,0,0,0) calc(100% - 38px) calc(100% - 9px), #B8862E calc(100% - 9px) calc(100% - 7px), #F6D27A calc(100% - 7px) calc(100% - 2px), #5A0810 calc(100% - 2px)),
    radial-gradient(circle, #FFFFFF 0 2.2px, #DCE7FF 3px, #9FB3E8 4.6px, #F6D27A 5.2px, #B8862E 6.6px, rgba(0,0,0,0) 7.2px) right 10px top 4px / 26px 26px repeat-y,
    radial-gradient(circle, #FFB627 0 1.6px, rgba(0,0,0,0) 2.2px) right 10px top 17px / 26px 26px repeat-y,
    linear-gradient(#5A0810, #5A0810) right 9px top 0 / 29px 100% no-repeat,
    linear-gradient(#F6D27A, #F6D27A) 0 calc(100% - 78px) / 100% 3px no-repeat,
    radial-gradient(circle, #FFFFFF 0 2px, #DCE7FF 2.8px, #9FB3E8 4.2px, #F6D27A 4.8px, #B8862E 6px, rgba(0,0,0,0) 6.6px) 0 calc(100% - 52px) / 22px 22px repeat-x,
    linear-gradient(#5A0810, #5A0810) 0 calc(100% - 49px) / 100% 28px no-repeat,
    linear-gradient(#F6D27A, #F6D27A) 0 calc(100% - 46px) / 100% 3px no-repeat,
    radial-gradient(ellipse 5px 9px at 50% 9px, #FFB627 0 98%, rgba(0,0,0,0) 100%) 0 calc(100% - 4px) / 22px 22px repeat-x,
    linear-gradient(90deg, rgba(0,0,0,0) 10px, #F6D27A 10px 12px, rgba(0,0,0,0) 12px) 0 calc(100% - 26px) / 22px 20px repeat-x,
    linear-gradient(180deg, rgba(20,0,2,.55), rgba(20,0,2,0) 22%),
    linear-gradient(90deg, rgba(20,0,2,.45), rgba(20,0,2,0) 26%),
    repeating-linear-gradient(90deg, rgba(48,0,6,.42) 0, rgba(255,130,130,.13) 24px, rgba(48,0,6,.42) 48px),
    radial-gradient(circle, rgba(255,242,205,.9) 0 1.4px, rgba(0,0,0,0) 2px) 0 0 / 16px 16px,
    radial-gradient(circle, rgba(255,196,80,.65) 0 1.1px, rgba(0,0,0,0) 1.7px) 8px 8px / 16px 16px,
    linear-gradient(180deg, #C8161F 0%, #A3101A 55%, #6E0A12 100%); }
@keyframes dd-cur-l {
  0% { transform: translateX(-101%) scaleX(.6); animation-timing-function: cubic-bezier(.55,0,.25,1); }
  37% { transform: translateX(0) scaleX(1); animation-timing-function: ease-out; }
  43% { transform: translateX(-.7%) scaleX(1); animation-timing-function: ease-in-out; }
  49%, 60% { transform: translateX(0) scaleX(1); animation-timing-function: cubic-bezier(.6,0,.3,1); }
  100% { transform: translateX(-101%) scaleX(.6); } }
@keyframes dd-cur-r {
  0% { transform: translateX(101%) scaleX(.6); animation-timing-function: cubic-bezier(.55,0,.25,1); }
  37% { transform: translateX(0) scaleX(1); animation-timing-function: ease-out; }
  43% { transform: translateX(.7%) scaleX(1); animation-timing-function: ease-in-out; }
  49%, 60% { transform: translateX(0) scaleX(1); animation-timing-function: cubic-bezier(.6,0,.3,1); }
  100% { transform: translateX(101%) scaleX(.6); } }
/* the mandap's pelmet and the marigold toran drop in above the curtains */
.dd-cur-val { position: absolute; left: 0; right: 0; top: 0; will-change: transform; animation: dd-cur-val var(--dd-cur) linear both; }
.dd-cur-pelmet { display: block; height: 26px; background:
    radial-gradient(circle, #FFFFFF 0 1.8px, #DCE7FF 2.6px, #F6D27A 3.6px, #B8862E 4.6px, rgba(0,0,0,0) 5.2px) 0 50% / 18px 18px repeat-x,
    linear-gradient(180deg, #4A070C, #7A0F12); border-bottom: 3px solid #F6D27A; box-shadow: 0 2px 0 #B8862E; }
.dd-cur-val svg { margin-top: -2px; filter: none; }
@keyframes dd-cur-val {
  0% { transform: translateY(-110%); animation-timing-function: cubic-bezier(.3,0,.2,1); }
  30%, 66% { transform: translateY(0); animation-timing-function: cubic-bezier(.6,0,.4,1); }
  100% { transform: translateY(-110%); } }
/* the flourish where the curtains meet */
.dd-cur-mid { position: absolute; left: 50%; top: 46%; width: clamp(150px, 36vmin, 240px); height: clamp(150px, 36vmin, 240px); margin: calc(clamp(150px, 36vmin, 240px) / -2) 0 0 calc(clamp(150px, 36vmin, 240px) / -2); }
.dd-cur-mid > span { position: absolute; will-change: transform, opacity; }
.dd-cur-burst { inset: -45%; border-radius: 50%; opacity: 0;
  background: repeating-conic-gradient(from 0deg, rgba(255,233,168,0) 0deg 8deg, rgba(255,233,168,.9) 10deg 12deg, rgba(255,233,168,0) 14deg 22.5deg);
  -webkit-mask-image: radial-gradient(circle, #000 18%, rgba(0,0,0,0) 68%); mask-image: radial-gradient(circle, #000 18%, rgba(0,0,0,0) 68%);
  animation: dd-cur-burst var(--dd-cur) linear both; }
@keyframes dd-cur-burst { 0%, 36% { opacity: 0; transform: scale(.3) rotate(0) } 44% { opacity: 1; transform: scale(1) rotate(12deg) } 62% { opacity: .7; transform: scale(1.25) rotate(28deg) } 74%, 100% { opacity: 0; transform: scale(1.5) rotate(36deg) } }
.dd-cur-rosette { inset: 26%; border-radius: 50%; opacity: 0;
  background: radial-gradient(circle at 38% 32%, #FFFFFF 0 10%, #EEF4FF 24%, #AFC0E4 58%, #7E8FB8 100%);
  box-shadow: 0 0 0 4px #F6D27A, 0 0 0 7px #B8862E, 0 0 0 11px #8E1022, 0 0 0 13px #F6D27A, 0 0 34px 14px rgba(255,190,80,.55);
  animation: dd-cur-rosette var(--dd-cur) linear both; }
@keyframes dd-cur-rosette { 0%, 33% { opacity: 0; transform: scale(0) } 41% { opacity: 1; transform: scale(1.14); animation-timing-function: ease-out } 48%, 62% { opacity: 1; transform: scale(1) } 72%, 100% { opacity: 0; transform: scale(.55) } }
.dd-cur-stick { inset: 0; display: grid; place-items: center; opacity: 0; }
.dd-cur-stick svg { width: 118% !important; filter: drop-shadow(0 4px 6px rgba(30,0,4,.5)); }
.dd-cur-stick.is-a { animation: dd-cur-sa var(--dd-cur) linear both; }
.dd-cur-stick.is-b { animation: dd-cur-sb var(--dd-cur) linear both; }
@keyframes dd-cur-sa { 0%, 30% { opacity: 0; transform: rotate(-96deg) scale(.5) } 38% { opacity: 1; transform: rotate(-62deg) scale(1); animation-timing-function: cubic-bezier(.5,0,.9,.5) } 42% { transform: rotate(-30deg) } 47% { transform: rotate(-44deg) } 52% { transform: rotate(-31deg) } 62% { opacity: 1; transform: rotate(-38deg) scale(1) } 74%, 100% { opacity: 0; transform: rotate(-96deg) scale(.6) } }
@keyframes dd-cur-sb { 0%, 30% { opacity: 0; transform: rotate(276deg) scale(.5) } 38% { opacity: 1; transform: rotate(242deg) scale(1); animation-timing-function: cubic-bezier(.5,0,.9,.5) } 42% { transform: rotate(210deg) } 47% { transform: rotate(224deg) } 52% { transform: rotate(211deg) } 62% { opacity: 1; transform: rotate(218deg) scale(1) } 74%, 100% { opacity: 0; transform: rotate(276deg) scale(.6) } }
/* the clash: a white-gold flash at the crossing */
.dd-cur-flash { left: 50%; top: 50%; width: 56%; height: 56%; margin: -28% 0 0 -28%; border-radius: 50%; opacity: 0;
  background: radial-gradient(circle, #FFFFFF 0 14%, rgba(255,233,168,.85) 30%, rgba(255,182,39,0) 70%);
  animation: dd-cur-flash var(--dd-cur) linear both; }
@keyframes dd-cur-flash { 0%, 41% { opacity: 0; transform: scale(.2) } 43% { opacity: 1; transform: scale(1) } 50% { opacity: 0; transform: scale(1.5) } 51% { opacity: 0; transform: scale(.2) } 53% { opacity: .8; transform: scale(.8) } 60%, 100% { opacity: 0; transform: scale(1.3) } }
.dd-cur-spark { left: 50%; top: 50%; width: 0; height: 0; opacity: 0; transform: rotate(var(--a)) translateY(0) scale(.2); animation: dd-cur-spark var(--dd-cur) linear both; }
.dd-cur-spark svg { position: absolute; left: -8px; top: -8px; }
@keyframes dd-cur-spark { 0%, 42% { opacity: 0; transform: rotate(var(--a)) translateY(0) scale(.2) } 47% { opacity: 1; transform: rotate(var(--a)) translateY(calc(var(--r) * .7)) scale(1.1); animation-timing-function: ease-out } 66%, 100% { opacity: 0; transform: rotate(var(--a)) translateY(calc(var(--r) * 1.15)) scale(.3) } }
/* reduced motion: a soft dusk cross-fade */
.dd-cur-soft { position: absolute; inset: 0; opacity: 0; background: radial-gradient(circle at 50% 42%, #8E1022, #3E0609 72%); animation: dd-cur-soft var(--dd-cur) ease-in-out both; }
@keyframes dd-cur-soft { 0% { opacity: 0 } 45%, 55% { opacity: 1 } 100% { opacity: 0 } }

@media (prefers-reduced-motion: reduce) {
  .dd-next-mirrors::after, .dd-next-ring, .dd-next-ico, .dd-pk > span, .dd-pk > span.dd-pk-nope { animation: none !important; }
}
`;
