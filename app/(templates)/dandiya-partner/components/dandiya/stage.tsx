"use client";

// The Dandiya night's stage furniture, shared by every scene:
//
//   • DdStage — the context the scenes talk to: the one Next pill, the little
//     sound cues (dhol, the sticks' "tak", ghungroo bells) and the replay round.
//   • useNext(label, onPress) — a scene declares its way forward; the shell
//     draws ONE marigold pill for it, fixed bottom-centre, so nothing jumps.
//     Nothing moves on by itself: only her tap does, and that tap sweeps a
//     bandhani dupatta across the screen while the crossed sticks twirl past.
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
import { Diya } from "./art";
import { DD_DISPLAY } from "./fonts";
import { BANDHANI } from "./ui";

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
    for (const [fr, lvl] of [[1850, 0.5], [3100, 0.25]] as const) {
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
}

export type DdCue = "dd-dhol" | "dd-tak" | "dd-bells" | "chime" | "sparkle" | "whoosh" | "swoosh-soft" | "pop" | "paper-rustle" | "chime-cascade" | "match-strike";

interface DdApi {
  setNext: (s: NextSpec | null) => void;
  cue: (id: DdCue, o?: CueOptions) => void;
  /** Changes on every replay — remounts the scenes' GIFs. */
  round: number;
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
export function useNext(label: string | null, onPress: () => void, icon: NextIcon = "sticks") {
  const { setNext } = useDd();
  const fn = useRef(onPress);
  useLayoutEffect(() => {
    fn.current = onPress;
  });
  useEffect(() => {
    setNext(label ? { label, icon, onPress: () => fn.current() } : null);
  }, [label, icon, setNext]);
  useEffect(() => () => setNext(null), [setNext]);
}

/** Scene change: total length, and when the next scene is swapped in (the dupatta covers the screen then). */
const WIPE_MS = 1300;
const WIPE_SWAP_MS = 500;

export function DdStage({ round, children }: { round: number; children: ReactNode }) {
  const music = useDayMusic();
  useUnlockAudioOnFirstTap();
  const reduced = useReducedMotion();
  const [next, setNextState] = useState<NextSpec | null>(null);
  const [flights, setFlights] = useState<number[]>([]);

  useEffect(() => {
    registerDandiyaCues();
    // The sticks fly on every scene change: fetch them once the first scene has painted.
    const t = window.setTimeout(() => preload(DD_GIF.dhamal), 1200);
    return () => window.clearTimeout(t);
  }, []);

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

  const press = () => {
    if (!next) return;
    haptic(12);
    cue("dd-tak", { gain: 0.8 });
    cue("dd-tak", { gain: 0.7, at: 0.13, detune: 120 });
    const id = performance.now();
    if (!reduced) {
      cue("whoosh", { gain: 0.45 });
      setFlights((fl) => [...fl.slice(-1), id]);
      window.setTimeout(() => setFlights((fl) => fl.filter((x) => x !== id)), WIPE_MS + 100);
    }
    const spec = next;
    setNextState(null);
    const g0 = gen.current;
    // A press that does not change the scene (e.g. "Invite your own") brings its pill back.
    window.setTimeout(() => {
      if (gen.current === g0) setNextState(spec);
    }, 1400);
    if (reduced) spec.onPress();
    else window.setTimeout(() => spec.onPress(), WIPE_SWAP_MS);
  };

  const api = useMemo<DdApi>(() => ({ setNext, cue, round }), [setNext, cue, round]);

  return (
    <Ctx.Provider value={api}>
      {children}
      <NextPill spec={next} onPress={press} />
      {flights.map((id) => (
        <DupattaWipe key={id} />
      ))}
    </Ctx.Provider>
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
  const emoji: Record<Exclude<NextIcon, "diya" | "sticks">, string> = { heart: "💛", dance: "💃", sparkle: "✨", letter: "💌" };
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

function DupattaWipe() {
  return (
    <>
      <span className="dd-wipe" aria-hidden>
        <i />
      </span>
      <span className="dd-twirl" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={DD_GIF.dhamal} alt="" width={384} height={500} decoding="async" />
      </span>
    </>
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

/* The scene change: a bandhani dupatta sweeps across (one composited translate), the crossed sticks twirl through it. */
.dd-wipe { position: fixed; z-index: 74; top: 0; bottom: 0; left: 0; width: 180vw; pointer-events: none; will-change: transform; contain: strict;
  animation: dd-wipe ${WIPE_MS}ms cubic-bezier(.45,.05,.55,.95) forwards; }
.dd-wipe::before { content: ""; position: absolute; inset: 0 8vw;
  background: ${BANDHANI}, linear-gradient(90deg, #C46A00 0%, #FFB627 22%, #E5489B 50%, #FFB627 78%, #C46A00 100%); }
/* zari borders + tassels on the dupatta's two edges */
.dd-wipe i { position: absolute; inset: 0 calc(8vw - 14px); display: block;
  background: linear-gradient(90deg, #F6D27A 0 6px, #B8862E 6px 8px, transparent 8px calc(100% - 8px), #B8862E calc(100% - 8px) calc(100% - 6px), #F6D27A calc(100% - 6px));
}
.dd-wipe i::before, .dd-wipe i::after { content: ""; position: absolute; top: 0; bottom: 0; width: 14px;
  background: radial-gradient(circle at 50% 30%, #FFB627 0 4px, rgba(0,0,0,0) 4.5px) 0 0 / 14px 26px repeat-y; }
.dd-wipe i::before { left: -8px; }
.dd-wipe i::after { right: -8px; }
@keyframes dd-wipe { 0% { transform: translateX(100vw) } 38% { transform: translateX(-30vw) } 62% { transform: translateX(-50vw) } 100% { transform: translateX(-180vw) } }
.dd-twirl { position: fixed; z-index: 75; left: 0; top: 28%; width: clamp(120px, 32vw, 190px); pointer-events: none; will-change: transform;
  animation: dd-twirl-x ${WIPE_MS}ms cubic-bezier(.4,.1,.6,.95) forwards; }
.dd-twirl img { display: block; width: 100%; height: auto; animation: dd-twirl-r ${WIPE_MS}ms ease-in-out forwards; filter: drop-shadow(0 8px 18px rgba(0,0,0,.45)); }
@keyframes dd-twirl-x { from { transform: translateX(120vw) } to { transform: translateX(-60vw) } }
@keyframes dd-twirl-r { 0% { transform: translateY(30px) rotate(0) } 55% { transform: translateY(-24px) rotate(-200deg) } 100% { transform: translateY(10px) rotate(-360deg) } }

@media (prefers-reduced-motion: reduce) {
  .dd-next-mirrors::after, .dd-next-ring, .dd-next-ico, .dd-pk > span, .dd-pk > span.dd-pk-nope { animation: none !important; }
}
`;
