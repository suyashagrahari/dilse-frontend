"use client";

// The haunted house's stage furniture, shared by every room:
//
//   • HwStage — the context the rooms talk to: the one Next button, the scare,
//     the little sound cues, the kids-mode flag.
//   • useNext(label, onPress) — a room declares its way forward; the shell draws
//     ONE candy pill for it, fixed in the same spot at the bottom, so nothing
//     ever jumps. Nothing ever moves on by itself: only her tap on the pill
//     does, and that tap sends the witch-seal flying across in a fog wipe.
//   • hw.scare({ kind }) — the jump-scare: a full-screen GIF bursts toward the
//     viewer (scale-up + a small shake, transform/opacity only), the engine's
//     scare() plays the BOO on the GIF's BOO frame (music ducks, phone buzzes),
//     then a cute "got you! 💜" recovery. Kids mode keeps the GIF, drops the
//     sound, the shake and the dark.
//
// Media: transparent animated WebPs on the CDN (media-src/templates/_halloween).
// Each one is fetched only when its room is near (preload()), and every scare
// mounts a fresh <img src="…?play=N"> so the animation starts from frame one.

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { templateMedia } from "@/lib/templateMedia";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import { useDayMusic } from "../../../_valentine/music/context";
import { useScare, useUnlockAudioOnFirstTap } from "../../../_valentine/kit/premium/useScare";
import { sfx, type CueId, type CueOptions } from "../../../_valentine/kit/premium/sfx";
import { loadSample, playSample } from "../../../_valentine/kit/premium/samples";
import { Haunts } from "./haunts";
import { FONTS } from "../../../_valentine/theme";
import { HW_DISPLAY } from "./fonts";

const g = (f: string) => templateMedia("_halloween", f);
export const HW_GIF = {
  /** pumpkin lid pops, a ghost jumps out, "BOO!" (BOO lands ≈ 280 ms in) */
  boo: g("pumpkin-ghost-boo.webp"),
  /** jack-o'-lantern whose eyes and grin light up green */
  light: g("pumpkin-light-up.webp"),
  /** the witch-seal on her broom (flies across on Next) */
  witch: g("witch-seal-broom.webp"),
  /** three cute bats (sky decoration) */
  bats: g("cute-bats.webp"),
  /** panda in a Scream mask holding a pumpkin (the prankster) */
  panda: g("panda-scream-mask.webp"),
  /** "HAPPY HALLOWEEN" + a penguin peeking out of a pumpkin (the title card) */
  title: g("happy-halloween-pumpkin.webp"),
  // v7: the owner's spider / ghost / grave / pumpkin set
  /** a tarantula climbing down (180×419, one ≈4 s descent, then it loops): lowers itself from the top edge (./haunts.tsx) */
  spiderDrop: g("spider-drop-from-top.gif"),
  /** a black corner web whose red spider lowers itself (280×362): the top-right corner, mirrored and moonlit */
  cornerWeb: g("corner-web-spider.webp"),
  /** a pale web with a cute spider hanging under it (300×300): the top-left corner, behind the trail */
  cuteWeb: g("cute-spider-web.webp"),
  /** a spider walking, front view (260×260): walks the ceiling upside down now and then */
  crawl: g("spider-crawl.webp"),
  /** a round web with a widow running round it (288×288, ≈720 KB): strung behind a portrait in the hallway */
  webFrame: g("web-frame-spider.webp"),
  /** tombstone + a waving zombie hand (150×139): the balcony's little grave */
  grave: g("grave-zombie-hand.webp"),
  /** a bouncing jack-o'-lantern in a witch hat (240×285): on the porch beside the candy pail */
  witchPumpkin: g("witch-hat-pumpkin.webp"),
  /** two pastel top-hat ghosts floating (300×300, ≈430 KB): the YES celebration */
  ghosts: g("floating-ghosts.webp"),
  /** a cute ghost running, facing right (220px, 5 frames): dashes across at random moments */
  ghostRun: g("ghost-running.webp"),
} as const;

/** The witch's cackle (5.6 s): laid over the music every time the witch-seal flies across. */
const WITCH_LAUGH = { id: "hw-witch-laugh", url: g("witch-laugh.mp3") };
/** If she flies again within this, she keeps quiet (no cackle spam on quick page turns). */
const LAUGH_GAP_MS = 10000;

/** Warm the HTTP cache for an image (idempotent). */
const warmed = new Set<string>();
export function preload(url: string) {
  if (typeof window === "undefined" || warmed.has(url)) return;
  warmed.add(url);
  const img = new Image();
  img.decoding = "async";
  img.src = url;
}

export type ScareKind = "boo" | "light" | "panda";
/** When the scary frame lands, from the moment the GIF paints (ms). */
const LAND: Record<ScareKind, number> = { boo: 280, light: 380, panda: 160 };
const SRC: Record<ScareKind, string> = { boo: HW_GIF.boo, light: HW_GIF.light, panda: HW_GIF.panda };

export interface ScareRequest {
  kind: ScareKind;
  /** The play id (part of the GIF's ?play= query, so a replay restarts it). */
  play: string;
  /** Big word on the jump (default BOO!). */
  shout?: string;
  /** The recovery line under "got you! 💜". */
  line?: ReactNode;
  onDone?: () => void;
}

export type NextIcon = "pumpkin" | "ghost" | "bat" | "candy" | "heart" | "moon";
const ICONS: Record<NextIcon, string> = { pumpkin: "🎃", ghost: "👻", bat: "🦇", candy: "🍬", heart: "💜", moon: "🌙" };

interface NextSpec {
  label: string;
  icon: NextIcon;
  onPress: () => void;
}

interface HwApi {
  setNext: (s: NextSpec | null) => void;
  scare: (r: ScareRequest) => void;
  cue: (id: CueId, o?: CueOptions) => void;
  /** Kids mode: no scares at all. */
  gentle: boolean;
  /** Changes on every replay — feeds the GIFs' ?play= ids. */
  round: number;
}

const Ctx = createContext<HwApi | null>(null);
export function useHw(): HwApi {
  const v = useContext(Ctx);
  if (!v) throw new Error("useHw outside HwStage");
  return v;
}

/**
 * A room's way forward: the shell draws it as the candy pill. `null` hides it
 * (pass null until the room's moment is done). It only ever moves on when she
 * taps it — there is no auto-advance and no skip.
 */
export function useNext(label: string | null, onPress: () => void, icon: NextIcon = "pumpkin") {
  const { setNext } = useHw();
  const fn = useRef(onPress);
  useLayoutEffect(() => {
    fn.current = onPress;
  });
  useEffect(() => {
    setNext(label ? { label, icon, onPress: () => fn.current() } : null);
  }, [label, icon, setNext]);
  useEffect(() => () => setNext(null), [setNext]);
}

export function HwStage({ gentle, round, children }: { gentle: boolean; round: number; children: ReactNode }) {
  const music = useDayMusic();
  const boo = useScare();
  useUnlockAudioOnFirstTap();
  const [next, setNextState] = useState<NextSpec | null>(null);
  const [scareReq, setScareReq] = useState<ScareRequest | null>(null);
  const [flights, setFlights] = useState<number[]>([]);

  // The sender chose "no music" (or the visitor turned it off): stay quiet.
  const quiet = !!music && (music.mode === "off" || music.userOff);
  const cue = useCallback(
    (id: CueId, o?: CueOptions) => {
      if (!quiet) sfx(id, o);
    },
    [quiet],
  );

  // Every setNext bumps the generation; a press that does not change the room
  // (e.g. "Boo someone back") brings its pill back once the witch has flown.
  const gen = useRef(0);
  const setNext = useCallback((s: NextSpec | null) => {
    gen.current += 1;
    setNextState(s);
  }, []);
  const scare = useCallback((r: ScareRequest) => {
    preload(`${SRC[r.kind]}?play=${r.play}`);
    setScareReq(r);
  }, []);

  useEffect(() => {
    // The witch-seal and the panda are small and used everywhere: fetch them once the first room has painted.
    const t = window.setTimeout(() => {
      preload(HW_GIF.witch);
      preload(HW_GIF.panda);
    }, 1200);
    void loadSample(WITCH_LAUGH.id, WITCH_LAUGH.url);
    return () => window.clearTimeout(t);
  }, []);

  // The witch laughs every time she flies — over the music (no duck), never twice within 10 s,
  // and quiet exactly when a scare would be: muted / "no music" / kids mode.
  const lastLaugh = useRef(-1e9);
  const cackle = () => {
    const now = performance.now();
    if (gentle || quiet || now - lastLaugh.current < LAUGH_GAP_MS) return;
    lastLaugh.current = now;
    playSample(WITCH_LAUGH.id, { gain: 0.6, maxLateMs: 600 });
  };

  const reduced = useReducedMotion();
  const press = () => {
    if (!next) return;
    haptic(12);
    cue("whoosh", { gain: 0.6 });
    const id = performance.now();
    // The scene change: the witch-seal flies across and a fog bank wipes the
    // room away; the next room is swapped in while the fog covers the screen.
    if (!reduced) {
      cackle();
      setFlights((f) => [...f.slice(-1), id]);
      window.setTimeout(() => setFlights((f) => f.filter((x) => x !== id)), WIPE_MS + 100);
    }
    const spec = next;
    setNextState(null);
    const g0 = gen.current;
    window.setTimeout(() => {
      if (gen.current === g0) setNextState(spec);
    }, 1500);
    if (reduced) spec.onPress();
    else window.setTimeout(() => spec.onPress(), WIPE_SWAP_MS);
  };
  const api = useMemo<HwApi>(() => ({ setNext, scare, cue, gentle, round }), [setNext, scare, cue, gentle, round]);

  return (
    <Ctx.Provider value={api}>
      {children}
      {/* the running ghost and the ceiling spider: never during a scare or a scene change */}
      <Haunts paused={!!scareReq || flights.length > 0} />
      <CandyNext spec={scareReq ? null : next} onPress={press} />
      {flights.map((id) => (
        <SceneWipe key={id} />
      ))}
      <AnimatePresence>
        {scareReq && (
          <ScareOverlay
            key={scareReq.play}
            req={scareReq}
            gentle={gentle}
            fire={() => {
              if (gentle) cue("sparkle");
              else boo();
            }}
            onClose={() => {
              const done = scareReq.onDone;
              setScareReq(null);
              done?.();
            }}
          />
        )}
      </AnimatePresence>
    </Ctx.Provider>
  );
}

// ─── The candy pill ───────────────────────────────────────────────────────────

function CandyNext({ spec, onPress }: { spec: NextSpec | null; onPress: () => void }) {
  // Keep the last label while the pill fades out, so it never flashes empty.
  const [shown, setShown] = useState<NextSpec | null>(spec);
  if (spec && spec !== shown) setShown(spec);
  const s = spec ?? shown;
  return (
    <div className="hw-next-wrap">
      <button type="button" className={`hw-next${spec ? "" : " is-hidden"}`} onClick={onPress} disabled={!spec} aria-hidden={!spec} tabIndex={spec ? 0 : -1}>
        <span className="hw-next-stripes" aria-hidden />
        <span className="hw-next-gloss" aria-hidden />
        {/* keyed by label: the 2 s idle pulse restarts on every new step */}
        {spec && <span key={spec.label} className="hw-next-ring" aria-hidden />}
        <span className="hw-next-ico" aria-hidden>
          {ICONS[s?.icon ?? "pumpkin"]}
        </span>
        <span className="hw-next-label">{s?.label ?? ""}</span>
        <span className="hw-next-arrow" aria-hidden>
          ›
        </span>
      </button>
    </div>
  );
}

/** Scene change: total length, and when the next room is swapped in (the fog fully covers the screen then). */
const WIPE_MS = 1500;
const WIPE_SWAP_MS = 560;

function SceneWipe() {
  return (
    <>
      <span className="hw-wipe" aria-hidden>
        <i />
      </span>
      <span className="hw-witch" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={HW_GIF.witch} alt="" width={280} height={280} decoding="async" />
      </span>
    </>
  );
}

// ─── The pumpkin trail (progress) ─────────────────────────────────────────────

/**
 * Seven pumpkins in a glowing pill, far top-left: lit ones glow, the current
 * one bobs. Tap a lit (earlier) pumpkin to go back to that room; a future one
 * only wiggles "not yet".
 */
export function PumpkinTrail({ at, rooms, ending, onJump }: { at: number; rooms: number; ending: boolean; onJump: (k: number) => void }) {
  const [nope, setNope] = useState<{ k: number; n: number } | null>(null);
  return (
    <nav className="hw-trail" aria-label={`Room ${Math.min(at + 1, rooms)} of ${rooms}`}>
      {Array.from({ length: rooms }, (_, k) => {
        const done = k < at || ending;
        const here = k === at && !ending;
        return (
          <button
            key={k}
            type="button"
            className={`hw-pk${done ? " is-done" : ""}${here ? " is-here" : ""}`}
            aria-label={done ? `Back to room ${k + 1}` : here ? `Room ${k + 1}, you are here` : `Room ${k + 1}, not yet`}
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
            <span key={nope?.k === k ? `n${nope.n}` : "s"} className={nope?.k === k ? "hw-pk-nope" : undefined}>
              🎃
            </span>
          </button>
        );
      })}
    </nav>
  );
}

// ─── The scare ────────────────────────────────────────────────────────────────

function ScareOverlay({ req, gentle, fire, onClose }: { req: ScareRequest; gentle: boolean; fire: () => void; onClose: () => void }) {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<"wait" | "jump" | "boo" | "giggle">("wait");
  const fired = useRef(false);
  const closed = useRef(false);
  const close = useCallback(() => {
    if (closed.current) return;
    closed.current = true;
    onClose();
  }, [onClose]);

  const start = useCallback(() => setPhase((p) => (p === "wait" ? "jump" : p)), []);

  // If the GIF is slow to arrive, go anyway (the sound must never wait forever).
  useEffect(() => {
    const t = window.setTimeout(start, 1200);
    return () => window.clearTimeout(t);
  }, [start]);

  useEffect(() => {
    if (phase !== "jump") return;
    const t = window.setTimeout(() => {
      if (!fired.current) {
        fired.current = true;
        fire();
      }
      setPhase("boo");
    }, LAND[req.kind]);
    return () => window.clearTimeout(t);
  }, [phase, req.kind, fire]);

  useEffect(() => {
    if (phase === "boo") {
      const t = window.setTimeout(() => setPhase("giggle"), gentle ? 900 : 1500);
      return () => window.clearTimeout(t);
    }
    if (phase === "giggle") {
      const t = window.setTimeout(close, 3200);
      return () => window.clearTimeout(t);
    }
  }, [phase, gentle, close]);

  const calm = gentle || reduced;
  const landed = phase === "boo" || phase === "giggle";
  const gifScale = phase === "wait" ? 0.55 : phase === "jump" ? 0.8 : phase === "boo" ? (calm ? 1 : 1.22) : 0.62;
  const shout = req.shout ?? "BOO!";

  return (
    <motion.div
      className="hw-scare"
      role="dialog"
      aria-modal="true"
      aria-label={shout}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      onClick={() => phase === "giggle" && close()}
      style={{ background: gentle ? "rgba(23,18,43,.72)" : "rgba(6,4,14,.9)" }}
    >
      {/* a soft lilac bloom on the BOO frame — a glow, never a flash */}
      <motion.span aria-hidden className="hw-scare-bloom" initial={{ opacity: 0 }} animate={{ opacity: landed && phase === "boo" ? 0.85 : 0.2 }} transition={{ duration: 0.25 }} />
      <motion.div
        // the shake: a few px, once, on the BOO frame
        animate={phase === "boo" && !calm ? { x: [0, -12, 11, -8, 7, -4, 2, 0], rotate: [0, -1.4, 1.2, -0.8, 0.6, 0] } : { x: 0, rotate: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="hw-scare-col"
      >
        <motion.div
          className="hw-scare-gif"
          initial={{ scale: 0.4, y: 30 }}
          animate={{ scale: gifScale, y: phase === "giggle" ? "-6%" : 0 }}
          transition={phase === "boo" && !calm ? { type: "spring", stiffness: 520, damping: 13 } : { type: "spring", stiffness: 200, damping: 20 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${SRC[req.kind]}?play=${req.play}`} alt="" width={360} height={360} onLoad={start} onError={start} />
        </motion.div>
        <div className="hw-scare-words">
          <AnimatePresence mode="wait">
            {phase === "boo" && (req.kind !== "boo" || calm) && (
              <motion.p key="shout" className="hw-scare-shout" initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ type: "spring", stiffness: 420, damping: 12 }}>
                {shout}
              </motion.p>
            )}
            {phase === "giggle" && (
              <motion.div key="giggle" initial={{ opacity: 0, y: 16, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 16 }} style={{ display: "grid", justifyItems: "center", gap: 6 }}>
                <p className="hw-scare-got">{gentle ? "Boo! Happy Halloween 🍭" : "got you! 💜"}</p>
                {req.line && <p className="hw-scare-line">{req.line}</p>}
                <p className="hw-scare-tap">tap anywhere</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── CSS (one block for the whole template) ──────────────────────────────────

export const HW_STAGE_CSS = `
/* One room = one screen, airy: a calm top band (the pumpkin trail sits in the corner, level with the
   editor's top bar / the viewer's logo), the room's content, then a clear bottom strip that belongs to
   the candy pill alone (the music icon sits bottom-left beside it, see .vm-icon below). */
.hw-scene { position: relative; z-index: 1; box-sizing: border-box; height: 100vh; height: 100dvh;
  display: flex; flex-direction: column; align-items: center; text-align: center; gap: clamp(10px, 2.2dvh, 22px);
  padding: calc(env(safe-area-inset-top, 0px) + clamp(60px, 8.4dvh, 76px)) 20px max(calc(env(safe-area-inset-bottom, 0px) + 94px), var(--vw-dock-space, 0px));
  width: 100%; max-width: calc(520px * var(--vw-s, 1)); margin: 0 auto; overflow: hidden; }
/* Wide screens: the night is full-bleed (./Atmosphere.tsx); the room's content sits in a comfortable column inside it. */
@media (min-width: 768px) { .hw-scene { max-width: 680px; padding-top: calc(var(--vw-top-space, 0px) + 40px); padding-bottom: 110px; gap: clamp(12px, 2.4dvh, 26px); } }
@media (min-width: 1100px) { .hw-scene { max-width: min(760px, 56vw); padding-top: 64px; } }
/* Wide screens: everything a size up (the night is big, the room should be too). */
@media (min-width: 1100px) {
  [data-vw-root="happy-halloween"][data-vw-layout="full"] { --vw-s: 1.4; }
  .hw-head h1, .hw-head h2 { font-size: clamp(38px, 5.4dvh, 56px) !important; }
  .hw-head > p:first-child { font-size: 13px !important; }
  .hw-head > p:last-child:not(:first-child) { font-size: 16.5px !important; max-width: 480px !important; }
  .hw-next-wrap .hw-next { transform: scale(1.12); transform-origin: 50% 100%; }
  .hw-next-wrap .hw-next.is-hidden { transform: translateY(18px) scale(1); }
}
@media (min-width: 1100px) and (min-height: 1000px) { [data-vw-root="happy-halloween"][data-vw-layout="full"] { --vw-s: 1.55; } }
/* Paper cards with small print (the spell, the license, the YES, the ending's buttons) scale up as a whole. */
@media (min-width: 1100px) { .hw-zoom { zoom: 1.2; } }
@media (min-width: 1100px) and (min-height: 1000px) { .hw-zoom { zoom: 1.35; } }
.hw-fill { position: relative; flex: 1 1 0; min-height: 0; width: 100%; container-type: size; display: grid; grid-template: minmax(0, 1fr) / minmax(0, 1fr); place-items: center; }
.hw-row { display: flex; gap: 10px; align-items: center; justify-content: center; flex-wrap: wrap; }

/* The one way forward: always the same spot, bottom centre, clear of the music icon on its left. */
.hw-next-wrap { position: fixed; z-index: 60; left: 0; right: 0; bottom: calc(env(safe-area-inset-bottom, 0px) + 18px);
  display: flex; justify-content: center; pointer-events: none; padding: 0 62px; box-sizing: border-box; }
@media (min-width: 768px) { .hw-next-wrap { bottom: 30px; } }

/* The pumpkin trail: small, top-left, level with the editor's top bar (which sits top-right). */
.hw-trail { position: fixed; z-index: 62; top: calc(max(10px, env(safe-area-inset-top, 0px)) + 8px); left: max(12px, env(safe-area-inset-left, 0px));
  display: flex; align-items: center; height: 30px; padding: 0 4px; border-radius: 99px; box-sizing: border-box;
  background: linear-gradient(180deg, rgba(43,30,74,.78), rgba(23,18,43,.78)); border: 1px solid rgba(255,210,122,.2);
  box-shadow: 0 0 14px -5px rgba(255,138,61,.4), inset 0 1px 0 rgba(255,255,255,.07); }
@media (min-width: 768px) { .hw-trail { top: 22px; left: 24px; } }
.hw-pk { width: 16px; height: 30px; padding: 0; margin: 0; border: 0; background: none; cursor: default; display: grid; place-items: center;
  font-size: 12.5px; line-height: 1; touch-action: manipulation; -webkit-tap-highlight-color: transparent; position: relative; }
/* a bigger invisible hit area for the small pumpkins (they don't overlap: 16px apart, 30px tall) */
.hw-pk.is-done::after { content: ""; position: absolute; inset: -7px -1px; }
@media (min-width: 768px) { .hw-pk { width: 20px; font-size: 15px; } }
.hw-pk > span { display: block; filter: grayscale(1) brightness(.55); opacity: .55; }
.hw-pk.is-done { cursor: pointer; }
.hw-pk.is-done > span { filter: drop-shadow(0 0 3px rgba(255,179,71,.95)); opacity: 1; }
.hw-pk.is-done:hover > span { transform: scale(1.18); }
.hw-pk.is-done:active > span { transform: scale(.85); }
.hw-pk.is-here > span { filter: drop-shadow(0 0 5px rgba(255,210,122,1)) drop-shadow(0 0 2px #FF8A3D); opacity: 1; animation: hw-pk-bob 1.3s ease-in-out infinite alternate; }
.hw-pk:focus-visible { outline: 2px solid #9BE7C4; outline-offset: -2px; border-radius: 8px; }
.hw-pk > span.hw-pk-nope { animation: hw-pk-nope .42s ease-in-out; }
@keyframes hw-pk-bob { from { transform: translateY(1px) scale(1.04) } to { transform: translateY(-2px) scale(1.16) } }
@keyframes hw-pk-nope { 0%,100% { transform: rotate(0) } 20% { transform: rotate(-16deg) } 45% { transform: rotate(13deg) } 70% { transform: rotate(-8deg) } }
/* The music icon (engine, DayConfig.music.compact) stays bottom-left; here it lines up with the pill's middle. */
body .vm-icon { bottom: calc(env(safe-area-inset-bottom, 0px) + 27px); }
@media (min-width: 768px) { body .vm-icon { left: 24px; bottom: 39px; } }
.hw-next { pointer-events: auto; position: relative; display: inline-flex; align-items: center; gap: 9px; height: 56px; max-width: 100%; min-width: 0; padding: 0 20px 0 7px;
  border: 0; border-radius: 999px; cursor: pointer; color: #3A1606; background: linear-gradient(180deg, #FFC98A 0%, #FF9A4D 46%, #F2721F 100%);
  box-shadow: 0 5px 0 #B84E14, 0 0 0 3px rgba(255,210,122,.32), 0 0 34px -4px rgba(255,150,70,.75), 0 18px 30px -12px rgba(0,0,0,.6);
  transition: transform .45s cubic-bezier(.2,.9,.25,1.2), opacity .3s ease, box-shadow .2s ease; touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
.hw-next.is-hidden { opacity: 0; transform: translateY(18px) scale(.9); pointer-events: none; transition-duration: .25s; }
.hw-next:active { transform: translateY(4px) scale(.97); box-shadow: 0 1px 0 #B84E14, 0 0 0 3px rgba(255,210,122,.4), 0 0 26px -4px rgba(255,150,70,.7); transition-duration: .08s; }
.hw-next:focus-visible { outline: 3px solid #9BE7C4; outline-offset: 4px; }
.hw-next-stripes { position: absolute; inset: 0; border-radius: inherit; overflow: hidden; pointer-events: none; }
.hw-next-stripes::before { content: ""; position: absolute; top: 0; bottom: 0; left: -40px; width: calc(100% + 80px);
  background: repeating-linear-gradient(-45deg, rgba(255,255,255,.2) 0 9px, rgba(255,255,255,0) 9px 18px); animation: hw-stripes 1.4s linear infinite; }
@keyframes hw-stripes { to { transform: translateX(25.46px) } }
.hw-next-gloss { position: absolute; left: 14px; right: 14px; top: 4px; height: 40%; border-radius: 999px; background: linear-gradient(180deg, rgba(255,255,255,.55), rgba(255,255,255,0)); pointer-events: none; }
.hw-next-ring { position: absolute; inset: -3px; border-radius: inherit; border: 3px solid rgba(255,214,140,.9); opacity: 0; pointer-events: none; animation: hw-ring 1.9s ease-out 2s infinite; }
@keyframes hw-ring { 0% { opacity: .85; transform: scale(1) } 100% { opacity: 0; transform: scale(1.12, 1.5) } }
.hw-next-ico { position: relative; width: 42px; height: 42px; flex: none; border-radius: 50%; display: grid; place-items: center; font-size: 25px; line-height: 1;
  background: radial-gradient(circle at 40% 35%, #FFFDF6, #FFE9C9); box-shadow: inset 0 -3px 0 rgba(184,78,20,.22), 0 2px 6px rgba(122,52,16,.35); animation: hw-bob 1.3s ease-in-out infinite alternate; }
@keyframes hw-bob { from { transform: translateY(-3px) rotate(-8deg) } to { transform: translateY(2px) rotate(7deg) } }
.hw-next-label { position: relative; min-width: 0; font: 400 19px/1 ${HW_DISPLAY}; letter-spacing: .01em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-shadow: 0 1px 0 rgba(255,236,200,.7); }
.hw-next-arrow { position: relative; font: 700 26px/1 ${FONTS.ui}; margin-left: 2px; margin-top: -3px; }

/* The scene wipe: a fog bank rolls across (one composited translate) while the witch flies through it. */
.hw-wipe { position: fixed; z-index: 74; top: 0; bottom: 0; left: 0; width: 180vw; pointer-events: none; will-change: transform; contain: strict;
  animation: hw-wipe ${WIPE_MS}ms cubic-bezier(.45,.05,.55,.95) forwards; }
.hw-wipe::before { content: ""; position: absolute; inset: 0;
  background: linear-gradient(90deg, rgba(23,18,43,0) 0%, rgba(40,28,70,.88) 10%, #1E1638 15%, #1E1638 85%, rgba(40,28,70,.88) 90%, rgba(23,18,43,0) 100%); }
.hw-wipe i { position: absolute; inset: 0; display: block;
  background: radial-gradient(18% 30% at 20% 30%, rgba(207,198,232,.32), transparent 70%), radial-gradient(16% 26% at 24% 72%, rgba(183,156,255,.28), transparent 70%),
    radial-gradient(18% 30% at 80% 35%, rgba(207,198,232,.3), transparent 70%), radial-gradient(14% 24% at 77% 78%, rgba(183,156,255,.26), transparent 70%),
    radial-gradient(20% 34% at 50% 50%, rgba(255,210,122,.12), transparent 70%); }
@keyframes hw-wipe { 0% { transform: translateX(100vw) } 37% { transform: translateX(-29vw) } 62% { transform: translateX(-51vw) } 100% { transform: translateX(-180vw) } }

.hw-witch { position: fixed; z-index: 75; left: 0; top: 30%; width: clamp(130px, 36vw, 190px); pointer-events: none; will-change: transform;
  animation: hw-witch-x ${WIPE_MS}ms cubic-bezier(.4,.1,.6,.95) forwards; }
.hw-witch img { display: block; width: 100%; height: auto; animation: hw-witch-y ${WIPE_MS}ms ease-in-out forwards; }
@keyframes hw-witch-x { from { transform: translateX(-45vw) } to { transform: translateX(120vw) } }
@keyframes hw-witch-y { 0% { transform: translateY(46px) rotate(-10deg) } 55% { transform: translateY(-26px) rotate(3deg) } 100% { transform: translateY(6px) rotate(-8deg) } }

.hw-scare { position: fixed; inset: 0; z-index: 90; display: grid; place-items: center; padding: 24px 16px; overflow: hidden; cursor: pointer; }
.hw-scare-bloom { position: absolute; inset: -10%; background: radial-gradient(closest-side, rgba(183,156,255,.42), rgba(183,156,255,.12) 60%, transparent); pointer-events: none; }
.hw-scare-col { position: relative; display: grid; justify-items: center; gap: 4px; text-align: center; max-width: 100%; }
.hw-scare-gif { width: min(80vw, 44dvh, 360px); aspect-ratio: 1; will-change: transform; }
.hw-scare-gif img { display: block; width: 100%; height: 100%; object-fit: contain; }
.hw-scare-words { min-height: 120px; display: grid; justify-items: center; align-content: start; }
.hw-scare-shout { margin: 0; font: 400 clamp(56px, 16vw, 84px)/1 ${HW_DISPLAY}; color: #F7F3FF; letter-spacing: .02em; text-shadow: 0 0 26px rgba(183,156,255,.8), 0 4px 0 #3A2257; }
.hw-scare-got { margin: 0; font: 400 clamp(38px, 11vw, 54px)/1 ${HW_DISPLAY}; color: #FFD27A; text-shadow: 0 0 22px rgba(255,138,61,.55), 0 3px 0 #7A3410; }
.hw-scare-line { margin: 0; max-width: 320px; font: 600 16px/1.4 ${FONTS.ui}; color: #F7F3FF; text-wrap: balance; overflow-wrap: anywhere; }
.hw-scare-tap { margin: 6px 0 0; font: 600 12px ${FONTS.ui}; letter-spacing: .14em; text-transform: uppercase; color: rgba(247,243,255,.55); }

@media (prefers-reduced-motion: reduce) {
  .hw-next-stripes::before, .hw-next-ring, .hw-next-ico, .hw-pk > span, .hw-pk > span.hw-pk-nope { animation: none !important; }
  .hw-witch { animation-duration: 2.4s; }
  .hw-witch img { animation: none; }
}
`;
