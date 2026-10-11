"use client";

// The Diwali night's stage furniture, shared by every scene:
//
//   • DwStage — the context the scenes talk to: the one Next button, the little
//     sound cues, the replay round.
//   • useNext(label, onPress) — a scene declares its way forward; the shell draws
//     ONE marigold pill for it, fixed in the same spot at the bottom, so nothing
//     ever jumps. Nothing moves on by itself: only her tap on the pill does, and
//     that tap sends a band of warm light (with the sparkle-stars GIF) across.
//   • DiyaTrail — seven tiny diyas, top-left, one per scene; lit ones glow, tap
//     an earlier one to go back.
//
// Media: the owner's festive GIFs on the CDN (media-src/templates/_festive).
// Each is fetched only when its scene is near (preload()); the two heavy
// fireworks (cracker-explode 751 KB, nemzeti 1.4 MB) only after the letter has
// appeared, on idle (./Fireworks.tsx).

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { templateMedia } from "@/lib/templateMedia";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import { useDayMusic } from "../../../_valentine/music/context";
import { useUnlockAudioOnFirstTap } from "../../../_valentine/kit/premium/useScare";
import { sfx, type CueId, type CueOptions } from "../../../_valentine/kit/premium/sfx";
import { FONTS } from "../../../_valentine/theme";
import { DW_DISPLAY } from "./fonts";

const g = (f: string) => templateMedia("_festive", f);
export const DW_GIF = {
  /** an illustrated clay diya, flame flickering (480², 80 KB) */
  diya: g("happy-diwali-diya.webp"),
  /** a round penguin waving a sparkler (480², 135 KB) */
  dudu: g("celebration-with-crackers-dudu.webp"),
  /** a colourful rangoli blooming (280², 86 KB) */
  rangoli: g("dawaii-colorful-rangoli.webp"),
  /** a hand waving a sparkler wand (474×498, 37 KB, transparent GIF) */
  wand: g("diwali-sparkles-wand.gif"),
  /** a string of crackers going off with a happy star (108 KB) */
  crackers: g("diwali-sparkles-fire-works.webp"),
  /** sparkle stars twinkling (79 KB) */
  stars: g("diwali-sparkles-stars.gif"),
  /** small sky-shot bursts (≈ 60–70 KB each) */
  skyDeepavali: g("fireworks-deepavali-skyshot.gif"),
  skyHanabi: g("fireworks-hanabi-skyshot.gif"),
  /** a confetti fountain (386 KB): fireworks scene only */
  putukan: g("fireworks-putukan.webp"),
  /** heavy: idle-loaded on the fireworks scene, after the letter shows */
  crackerExplode: g("cracker-explode-skyshot.gif"),
  nemzeti: g("fireworks-nemzeti-skyshot.gif"),
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

export type NextIcon = "diya" | "rangoli" | "sparkle" | "lantern" | "rocket" | "sweet" | "heart";

interface NextSpec {
  label: string;
  icon: NextIcon;
  onPress: () => void;
}

interface DwApi {
  setNext: (s: NextSpec | null) => void;
  cue: (id: CueId, o?: CueOptions) => void;
  /** Changes on every replay — feeds the GIFs' ?play= ids. */
  round: number;
}

const Ctx = createContext<DwApi | null>(null);
export function useDw(): DwApi {
  const v = useContext(Ctx);
  if (!v) throw new Error("useDw outside DwStage");
  return v;
}

/**
 * A scene's way forward: the shell draws it as the marigold pill. `null` hides
 * it (pass null until the scene's moment is done). It only ever moves on when
 * she taps it — there is no auto-advance and no skip.
 */
export function useNext(label: string | null, onPress: () => void, icon: NextIcon = "diya") {
  const { setNext } = useDw();
  const fn = useRef(onPress);
  useLayoutEffect(() => {
    fn.current = onPress;
  });
  useEffect(() => {
    setNext(label ? { label, icon, onPress: () => fn.current() } : null);
  }, [label, icon, setNext]);
  useEffect(() => () => setNext(null), [setNext]);
}

export function DwStage({ round, children }: { round: number; children: ReactNode }) {
  const music = useDayMusic();
  useUnlockAudioOnFirstTap();
  const [next, setNextState] = useState<NextSpec | null>(null);
  const [sweeps, setSweeps] = useState<number[]>([]);

  // The sender chose "no music" (or the visitor turned it off): stay quiet.
  const quiet = !!music && (music.mode === "off" || music.userOff);
  const cue = useCallback(
    (id: CueId, o?: CueOptions) => {
      if (!quiet) sfx(id, o);
    },
    [quiet],
  );

  // Every setNext bumps the generation; a press that does not change the scene
  // (e.g. "Light a diya for someone") brings its pill back after the sweep.
  const gen = useRef(0);
  const setNext = useCallback((s: NextSpec | null) => {
    gen.current += 1;
    setNextState(s);
  }, []);

  useEffect(() => {
    // The sweep's stars are small and used on every Next: fetch once the first scene has painted.
    const t = window.setTimeout(() => preload(DW_GIF.stars), 1200);
    return () => window.clearTimeout(t);
  }, []);

  const reduced = useReducedMotion();
  const press = () => {
    if (!next) return;
    haptic(12);
    cue("swoosh-soft", { gain: 0.6 });
    const id = performance.now();
    if (!reduced) {
      setSweeps((f) => [...f.slice(-1), id]);
      window.setTimeout(() => setSweeps((f) => f.filter((x) => x !== id)), SWEEP_MS + 100);
    }
    const spec = next;
    setNextState(null);
    const g0 = gen.current;
    window.setTimeout(() => {
      if (gen.current === g0) setNextState(spec);
    }, 1500);
    if (reduced) spec.onPress();
    else window.setTimeout(() => spec.onPress(), SWEEP_SWAP_MS);
  };
  const api = useMemo<DwApi>(() => ({ setNext, cue, round }), [setNext, cue, round]);

  return (
    <Ctx.Provider value={api}>
      {children}
      <MarigoldNext spec={next} onPress={press} />
      {sweeps.map((id) => (
        <LightSweep key={id} />
      ))}
    </Ctx.Provider>
  );
}

// ─── Art bits used by the chrome ──────────────────────────────────────────────

/** A tiny clay diya (bowl + flame), used by the trail and the Next pill. */
export function MiniDiya({ lit = true, size = 22 }: { lit?: boolean; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden style={{ display: "block", overflow: "visible" }}>
      {lit && <path d="M12 2.5 C14.6 7 15.2 9.4 12 12.6 C8.8 9.4 9.4 7 12 2.5 Z" fill="#FFB23F" />}
      {lit && <path d="M12 6 C13.2 8.2 13.4 9.6 12 11.4 C10.6 9.6 10.8 8.2 12 6 Z" fill="#FFF3C4" />}
      <path d="M2.5 13.2 Q12 11 21.5 13.2 Q20.4 21 12 21.2 Q3.6 21 2.5 13.2 Z" fill={lit ? "#D9621F" : "#5B4A6E"} />
      <path d="M2.5 13.2 Q12 15.2 21.5 13.2" fill="none" stroke={lit ? "#FFD36E" : "#7E6E95"} strokeWidth="1.3" />
      <circle cx="12" cy="17.3" r="1.3" fill={lit ? "#FFD36E" : "#7E6E95"} />
    </svg>
  );
}

const ICON_EMOJI: Record<Exclude<NextIcon, "diya">, string> = { rangoli: "🌸", sparkle: "✨", lantern: "🏮", rocket: "🎆", sweet: "🍬", heart: "💛" };

// ─── The marigold pill ────────────────────────────────────────────────────────

function MarigoldNext({ spec, onPress }: { spec: NextSpec | null; onPress: () => void }) {
  // Keep the last label while the pill fades out, so it never flashes empty.
  const [shown, setShown] = useState<NextSpec | null>(spec);
  if (spec && spec !== shown) setShown(spec);
  const s = spec ?? shown;
  const icon = s?.icon ?? "diya";
  return (
    <div className="dw-next-wrap">
      <button type="button" className={`dw-next${spec ? "" : " is-hidden"}`} onClick={onPress} disabled={!spec} aria-hidden={!spec} tabIndex={spec ? 0 : -1}>
        <span className="dw-next-shine" aria-hidden />
        {spec && <span key={spec.label} className="dw-next-ring" aria-hidden />}
        <span className="dw-next-ico" aria-hidden>
          {icon === "diya" ? <MiniDiya size={26} /> : ICON_EMOJI[icon]}
        </span>
        <span className="dw-next-label">{s?.label ?? ""}</span>
        <span className="dw-next-arrow" aria-hidden>
          ›
        </span>
      </button>
    </div>
  );
}

/** Scene change: total length, and when the next scene is swapped in (the light band fully covers the screen then). */
const SWEEP_MS = 1400;
const SWEEP_SWAP_MS = 520;

function LightSweep() {
  return (
    <>
      <span className="dw-sweep" aria-hidden>
        <i />
      </span>
      <span className="dw-sweep-stars" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={DW_GIF.stars} alt="" width={240} height={225} decoding="async" />
      </span>
    </>
  );
}

// ─── The diya trail (progress) ────────────────────────────────────────────────

/** Tiny diyas in a pill, far top-left: lit ones glow, the current one flickers; tap a lit one to go back. */
export function DiyaTrail({ at, rooms, ending, onJump }: { at: number; rooms: number; ending: boolean; onJump: (k: number) => void }) {
  const [nope, setNope] = useState<{ k: number; n: number } | null>(null);
  return (
    <nav className="dw-trail" aria-label={`Scene ${Math.min(at + 1, rooms)} of ${rooms}`}>
      {Array.from({ length: rooms }, (_, k) => {
        const done = k < at || ending;
        const here = k === at && !ending;
        return (
          <button
            key={k}
            type="button"
            className={`dw-pk${done ? " is-done" : ""}${here ? " is-here" : ""}`}
            aria-label={done ? `Back to scene ${k + 1}` : here ? `Scene ${k + 1}, you are here` : `Scene ${k + 1}, not yet`}
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
            <span key={nope?.k === k ? `n${nope.n}` : "s"} className={nope?.k === k ? "dw-pk-nope" : undefined}>
              <MiniDiya lit={done || here} size={16} />
            </span>
          </button>
        );
      })}
    </nav>
  );
}

// ─── CSS (one block for the whole template) ──────────────────────────────────

export const DW_STAGE_CSS = `
/* One scene = one screen, airy: a calm top band (the trail sits in the corner, level with the
   editor's top bar / the viewer's logo), the scene's content, then a clear bottom strip that belongs to
   the marigold pill alone (the music icon sits bottom-left beside it, see .vm-icon below). */
.dw-scene { position: relative; z-index: 1; box-sizing: border-box; height: 100vh; height: 100dvh;
  display: flex; flex-direction: column; align-items: center; text-align: center; gap: clamp(10px, 2.2dvh, 22px);
  padding: calc(env(safe-area-inset-top, 0px) + clamp(62px, 8.6dvh, 78px)) 20px max(calc(env(safe-area-inset-bottom, 0px) + 94px), var(--vw-dock-space, 0px));
  width: 100%; max-width: calc(520px * var(--vw-s, 1)); margin: 0 auto; overflow: hidden; }
@media (min-width: 768px) { .dw-scene { max-width: 680px; padding-top: calc(var(--vw-top-space, 0px) + 44px); padding-bottom: 110px; gap: clamp(12px, 2.4dvh, 26px); } }
@media (min-width: 1100px) { .dw-scene { max-width: min(780px, 58vw); padding-top: 70px; } }
@media (min-width: 1100px) {
  [data-vw-root="happy-diwali"][data-vw-layout="full"] { --vw-s: 1.4; }
  .dw-head h1, .dw-head h2 { font-size: clamp(38px, 5.4dvh, 56px) !important; }
  .dw-head > p:first-child { font-size: 13px !important; }
  .dw-head > p:last-child:not(:first-child) { font-size: 16.5px !important; max-width: 500px !important; }
  .dw-next-wrap .dw-next { transform: scale(1.12); transform-origin: 50% 100%; }
  .dw-next-wrap .dw-next.is-hidden { transform: translateY(18px) scale(1); }
}
@media (min-width: 1100px) and (min-height: 1000px) { [data-vw-root="happy-diwali"][data-vw-layout="full"] { --vw-s: 1.55; } }
/* Paper cards with small print scale up as a whole on wide screens. */
@media (min-width: 1100px) { .dw-zoom { zoom: 1.2; } }
@media (min-width: 1100px) and (min-height: 1000px) { .dw-zoom { zoom: 1.35; } }
.dw-fill { position: relative; flex: 1 1 0; min-height: 0; width: 100%; container-type: size; display: grid; grid-template: minmax(0, 1fr) / minmax(0, 1fr); place-items: center; }

/* The one way forward: always the same spot, bottom centre, clear of the music icon on its left. */
.dw-next-wrap { position: fixed; z-index: 60; left: 0; right: 0; bottom: calc(env(safe-area-inset-bottom, 0px) + 18px);
  display: flex; justify-content: center; pointer-events: none; padding: 0 62px; box-sizing: border-box; }
@media (min-width: 768px) { .dw-next-wrap { bottom: 30px; } }

/* The diya trail: small, top-left, level with the editor's top bar (top-right). */
.dw-trail { position: fixed; z-index: 62; top: calc(max(10px, env(safe-area-inset-top, 0px)) + 8px); left: max(12px, env(safe-area-inset-left, 0px));
  display: flex; align-items: center; height: 30px; padding: 0 5px; border-radius: 99px; box-sizing: border-box;
  background: linear-gradient(180deg, rgba(29,44,102,.85), rgba(10,16,48,.85)); border: 1px solid rgba(255,211,110,.26);
  box-shadow: 0 0 14px -5px rgba(255,178,63,.45), inset 0 1px 0 rgba(255,255,255,.07); }
@media (min-width: 768px) { .dw-trail { top: 22px; left: 24px; height: 34px; } }
.dw-pk { width: 18px; height: 30px; padding: 0; margin: 0; border: 0; background: none; cursor: default; display: grid; place-items: center;
  line-height: 1; touch-action: manipulation; -webkit-tap-highlight-color: transparent; position: relative; }
.dw-pk.is-done::after { content: ""; position: absolute; inset: -7px -1px; }
@media (min-width: 768px) { .dw-pk { width: 22px; height: 34px; } .dw-pk svg { width: 19px; height: 19px; } }
.dw-pk > span { display: block; opacity: .6; }
.dw-pk.is-done { cursor: pointer; }
.dw-pk.is-done > span { opacity: 1; filter: drop-shadow(0 0 3px rgba(255,190,80,.9)); }
.dw-pk.is-done:hover > span { transform: scale(1.18); }
.dw-pk.is-done:active > span { transform: scale(.85); }
.dw-pk.is-here > span { opacity: 1; filter: drop-shadow(0 0 5px rgba(255,211,110,1)); animation: dw-pk-bob 1.2s ease-in-out infinite alternate; }
.dw-pk:focus-visible { outline: 2px solid #2EC4B6; outline-offset: -2px; border-radius: 8px; }
.dw-pk > span.dw-pk-nope { animation: dw-pk-nope .42s ease-in-out; }
@keyframes dw-pk-bob { from { transform: translateY(1px) scale(1.02) } to { transform: translateY(-2px) scale(1.14) } }
@keyframes dw-pk-nope { 0%,100% { transform: rotate(0) } 20% { transform: rotate(-16deg) } 45% { transform: rotate(13deg) } 70% { transform: rotate(-8deg) } }
/* The music icon (engine, DayConfig.music.compact) stays bottom-left; here it lines up with the pill's middle. */
body .vm-icon { bottom: calc(env(safe-area-inset-bottom, 0px) + 27px); }
@media (min-width: 768px) { body .vm-icon { left: 24px; bottom: 39px; } }

.dw-next { pointer-events: auto; position: relative; display: inline-flex; align-items: center; gap: 9px; height: 56px; max-width: 100%; min-width: 0; padding: 0 20px 0 7px;
  border: 0; border-radius: 999px; cursor: pointer; color: #3A1606; overflow: hidden;
  background: linear-gradient(180deg, #FFE08A 0%, #FFB23F 48%, #F2851C 100%);
  box-shadow: 0 5px 0 #A84C08, 0 0 0 3px rgba(255,211,110,.32), 0 0 36px -4px rgba(255,170,60,.8), 0 18px 30px -12px rgba(0,0,0,.6);
  transition: transform .45s cubic-bezier(.2,.9,.25,1.2), opacity .3s ease, box-shadow .2s ease; touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
.dw-next.is-hidden { opacity: 0; transform: translateY(18px) scale(.9); pointer-events: none; transition-duration: .25s; }
.dw-next:active { transform: translateY(4px) scale(.97); box-shadow: 0 1px 0 #A84C08, 0 0 0 3px rgba(255,211,110,.4), 0 0 26px -4px rgba(255,170,60,.7); transition-duration: .08s; }
.dw-next:focus-visible { outline: 3px solid #2EC4B6; outline-offset: 4px; }
/* a slow glint across the pill (one composited translate) */
.dw-next-shine { position: absolute; top: 0; bottom: 0; left: 0; width: 46px; pointer-events: none;
  background: linear-gradient(100deg, rgba(255,255,255,0), rgba(255,255,255,.55), rgba(255,255,255,0)); transform: translateX(-60px) skewX(-18deg); animation: dw-shine 3.2s ease-in-out 1s infinite; }
@keyframes dw-shine { 0% { transform: translateX(-60px) skewX(-18deg) } 45%, 100% { transform: translateX(420px) skewX(-18deg) } }
.dw-next-ring { position: absolute; inset: 0; border-radius: inherit; border: 3px solid rgba(255,226,150,.9); opacity: 0; pointer-events: none; animation: dw-ring 1.9s ease-out 2s infinite; }
@keyframes dw-ring { 0% { opacity: .85 } 100% { opacity: 0 } }
.dw-next-ico { position: relative; width: 42px; height: 42px; flex: none; border-radius: 50%; display: grid; place-items: center; font-size: 23px; line-height: 1;
  background: radial-gradient(circle at 40% 35%, #FFFDF6, #FFE9C9); box-shadow: inset 0 -3px 0 rgba(194,94,10,.22), 0 2px 6px rgba(122,52,16,.35); animation: dw-bob 1.3s ease-in-out infinite alternate; }
@keyframes dw-bob { from { transform: translateY(-2px) rotate(-6deg) } to { transform: translateY(2px) rotate(6deg) } }
.dw-next-label { position: relative; min-width: 0; font: 400 19px/1.25 ${DW_DISPLAY}; padding-top: 3px; letter-spacing: .01em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-shadow: 0 1px 0 rgba(255,240,200,.7); }
@media (max-width: 400px) { .dw-next-label { font-size: 17.5px; } .dw-next { gap: 7px; padding-right: 16px; } }
.dw-next-arrow { position: relative; font: 700 26px/1 ${FONTS.ui}; margin-left: 2px; margin-top: -3px; }

/* The scene change: a band of warm light rolls across (one composited translate) with stars riding it. */
.dw-sweep { position: fixed; z-index: 74; top: 0; bottom: 0; left: 0; width: 180vw; pointer-events: none; will-change: transform; contain: strict;
  animation: dw-sweep ${SWEEP_MS}ms cubic-bezier(.45,.05,.55,.95) forwards; }
.dw-sweep::before { content: ""; position: absolute; inset: 0;
  background: linear-gradient(90deg, rgba(10,16,48,0) 0%, rgba(26,30,80,.9) 10%, #141C4A 16%, #141C4A 84%, rgba(26,30,80,.9) 90%, rgba(10,16,48,0) 100%); }
.dw-sweep i { position: absolute; inset: 0; display: block;
  background: radial-gradient(16% 30% at 22% 34%, rgba(255,190,80,.34), transparent 70%), radial-gradient(14% 24% at 26% 74%, rgba(255,95,162,.2), transparent 70%),
    radial-gradient(16% 30% at 78% 36%, rgba(255,211,110,.32), transparent 70%), radial-gradient(14% 24% at 76% 76%, rgba(46,196,182,.18), transparent 70%),
    radial-gradient(22% 36% at 50% 50%, rgba(255,178,63,.24), transparent 70%); }
@keyframes dw-sweep { 0% { transform: translateX(100vw) } 37% { transform: translateX(-29vw) } 62% { transform: translateX(-51vw) } 100% { transform: translateX(-180vw) } }
.dw-sweep-stars { position: fixed; z-index: 75; left: 0; top: 32%; width: clamp(150px, 40vw, 240px); pointer-events: none; will-change: transform;
  animation: dw-stars-x ${SWEEP_MS}ms cubic-bezier(.4,.1,.6,.95) forwards; }
.dw-sweep-stars img { display: block; width: 100%; height: auto; }
@keyframes dw-stars-x { from { transform: translateX(110vw) } to { transform: translateX(-50vw) } }

@media (prefers-reduced-motion: reduce) {
  .dw-next-shine, .dw-next-ring, .dw-next-ico, .dw-pk > span, .dw-pk > span.dw-pk-nope { animation: none !important; }
}
`;
