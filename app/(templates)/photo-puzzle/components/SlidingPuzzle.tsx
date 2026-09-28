"use client";

// ─── The sliding board ───────────────────────────────────────────────────────
//
// Tiles are positioned with translate3d only (never top/left), so every slide
// is a compositor-only animation. Input:
//   * tap a tile next to the gap → it slides in; tap one further along the same
//     row/column → the whole line slides
//   * swipe on the board → the tile on that side of the gap slides
//   * arrow keys / WASD on a keyboard
// When the picture is whole, the last piece flies out of its little holder
// into the gap, the tile gaps close into one seamless photo, and hearts burst.

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { motion } from "framer-motion";
import { Eye, Hash, Shuffle, Volume2, VolumeX, Wand2, Timer, Footprints } from "lucide-react";

import { tone, unlockAudio, setMuted, isMuted } from "@/lib/webAudio";
import { GROTESK, HeartBurst, ITALIC } from "../../_love/LoveKit";
import { V, type LoveTheme } from "../../_love/theme";
import { PhotoLayer, Slice, useImageOk, type PhotoCrop } from "./PhotoSlice";
import { boardSkin } from "./themes";
import { emptyId, emptyPos, neighbours, rc, type Dir } from "./slidingEngine";
import type { PuzzleGame } from "./usePuzzleGame";
import { DIFFICULTY_META, type Difficulty } from "./types";

const FRAME_PAD = 10;

export const fmtTime = (ms: number): string => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

function useNow(active: boolean): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const t = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(t);
  }, [active]);
  return now;
}

type Phase = "play" | "flying" | "complete";

export default function SlidingPuzzle({
  game,
  src,
  crop,
  difficulty,
  theme,
  reduceMotion,
  onComplete,
  maxBoard = 520,
}: {
  game: PuzzleGame;
  src: string;
  crop: PhotoCrop;
  difficulty: Difficulty;
  theme: LoveTheme;
  reduceMotion: boolean;
  /** Fires once the last piece has landed and the seams are gone. */
  onComplete: () => void;
  maxBoard?: number;
}) {
  const n = game.n;
  const skin = boardSkin(theme.id);
  const ok = useImageOk(src);
  const wrapRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const holderRef = useRef<HTMLDivElement>(null);
  const [avail, setAvail] = useState(0);
  const [numbers, setNumbers] = useState(false);
  const [peeking, setPeeking] = useState(false);
  const [muted, setMutedState] = useState(() => isMuted());
  const [phase, setPhase] = useState<Phase>(() => (game.solved ? "complete" : "play"));
  const [fly, setFly] = useState<{ x: number; y: number; scale: number; left: number; top: number } | null>(null);
  const peekTimer = useRef<number | null>(null);

  // ── Size: the largest whole multiple of N that fits, so tiles are integer px.
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      const h = window.innerHeight;
      // Leave room for the heading, HUD and story bar on a phone.
      const byHeight = window.innerWidth >= 900 ? h - 190 : h - 330;
      setAvail(Math.max(210, Math.min(w, maxBoard, Math.max(byHeight, 260))) - FRAME_PAD * 2);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [maxBoard]);

  const t = Math.max(1, Math.floor(avail / n));
  const S = t * n;
  const gapPx = phase === "complete" ? 0 : Math.max(1.5, Math.round(t * 0.022 * 2) / 2);
  const radius = phase === "complete" ? 0 : Math.max(6, Math.round(t * 0.09));

  // ── Solve → flight → complete ──────────────────────────────────────────────
  const [prevSolved, setPrevSolved] = useState(game.solved);
  const [prevRound, setPrevRound] = useState(game.round);
  if (prevRound !== game.round) {
    setPrevRound(game.round);
    setPrevSolved(false);
    setPhase("play");
    setFly(null);
  } else if (prevSolved !== game.solved) {
    setPrevSolved(game.solved);
    if (!game.solved) setPhase("play");
  }

  useEffect(() => {
    if (!game.solved || phase !== "play") return;
    const holder = holderRef.current?.getBoundingClientRect();
    const board = boardRef.current?.getBoundingClientRect();
    const land = window.setTimeout(() => {
      if (reduceMotion || !holder || !board) {
        setPhase("complete");
        return;
      }
      const left = board.left + (n - 1) * t;
      const top = board.top + (n - 1) * t;
      setFly({ left, top, x: holder.left - left, y: holder.top - top, scale: holder.width / t });
      setPhase("flying");
    }, 260);
    return () => window.clearTimeout(land);
  }, [game.solved, phase, n, t, reduceMotion]);

  const completedRef = useRef(false);
  useEffect(() => {
    if (phase !== "complete") {
      completedRef.current = false;
      return;
    }
    if (completedRef.current) return;
    completedRef.current = true;
    [0, 4, 7, 12, 16].forEach((s, i) => tone({ freq: 523.25 * Math.pow(2, s / 12), ms: 380, type: "sine", gain: 0.1, delay: i * 0.09 }));
    onComplete();
  }, [phase, onComplete]);

  // ── Input ──────────────────────────────────────────────────────────────────
  const tick = () => tone({ freq: 660 + Math.random() * 120, ms: 45, type: "triangle", gain: 0.06 });

  const act = useCallback(
    (fn: () => boolean) => {
      if (phase !== "play" || game.autoSolving) return;
      unlockAudio();
      if (fn()) tick();
    },
    [phase, game.autoSolving],
  );

  const down = useRef<{ x: number; y: number; pos: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    const el = (e.target as HTMLElement).closest("[data-pos]") as HTMLElement | null;
    down.current = { x: e.clientX, y: e.clientY, pos: el ? Number(el.dataset.pos) : -1 };
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const d = down.current;
    down.current = null;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.hypot(dx, dy) < 14) {
      if (d.pos >= 0) act(() => game.tap(d.pos));
      return;
    }
    const dir: Dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up";
    // A swipe on a tile lined up with the gap in that direction slides that line.
    if (d.pos >= 0) {
      const e0 = emptyPos(game.board, n);
      const [pr, pc] = rc(d.pos, n);
      const [er, ec] = rc(e0, n);
      const lined =
        (dir === "right" && pr === er && ec > pc) ||
        (dir === "left" && pr === er && ec < pc) ||
        (dir === "down" && pc === ec && er > pr) ||
        (dir === "up" && pc === ec && er < pr);
      if (lined) return act(() => game.tap(d.pos));
    }
    act(() => game.moveDir(dir));
  };

  useEffect(() => {
    if (phase !== "play") return;
    const keys: Record<string, Dir> = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down", a: "left", d: "right", w: "up", s: "down" };
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement | null)?.isContentEditable) return;
      const dir = keys[e.key];
      if (!dir) return;
      e.preventDefault();
      act(() => game.moveDir(dir));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, act, game]);

  const doPeek = () => {
    if (phase !== "play") return;
    unlockAudio();
    game.peek();
    setPeeking(true);
    if (peekTimer.current) window.clearTimeout(peekTimer.current);
    peekTimer.current = window.setTimeout(() => setPeeking(false), 1700);
  };
  useEffect(() => () => {
    if (peekTimer.current) window.clearTimeout(peekTimer.current);
  }, []);

  // ── Derived ────────────────────────────────────────────────────────────────
  const now = useNow(game.startedAt !== null && game.endedAt === null);
  const elapsed = game.startedAt ? (game.endedAt ?? now) - game.startedAt : 0;
  const gap = emptyPos(game.board, n);
  const movable = new Set(neighbours(gap, n));
  const posOf = new Map<number, number>();
  game.board.forEach((id, pos) => posOf.set(id, pos));
  const last = emptyId(n);
  const meta = DIFFICULTY_META[difficulty];
  const showNumbersToggle = difficulty !== "easy";
  const stuck = !game.solved && !game.autoSolving && (game.moves >= 120 || (game.startedAt !== null && now - game.startedAt > 150_000));
  const stepMs = game.autoSolving ? 70 : 150;

  const pill: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    height: 36,
    padding: "0 12px",
    borderRadius: 999,
    background: V.glass,
    border: `1px solid ${V.edge}`,
    color: V.ink,
    fontFamily: GROTESK,
    fontWeight: 800,
    fontSize: 14,
    fontVariantNumeric: "tabular-nums",
  };
  const tool = (on = false): CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    minHeight: 44,
    minWidth: 44,
    padding: "0 12px",
    borderRadius: 999,
    border: `1.5px solid ${on ? "transparent" : V.edge}`,
    background: on ? V.grad : V.glass,
    color: on ? "#fff" : V.ink,
    fontFamily: GROTESK,
    fontWeight: 800,
    fontSize: 13.5,
    cursor: "pointer",
    WebkitTapHighlightColor: "transparent",
  });

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      {/* HUD: the kept-back piece · moves · time · level */}
      <div style={{ width: "100%", maxWidth: S + FRAME_PAD * 2 || undefined, display: "flex", alignItems: "center", gap: 10 }}>
        <div
          ref={holderRef}
          aria-label="The last piece, kept for the end"
          title="the last piece — it lands when you finish"
          style={{
            position: "relative",
            width: 54,
            height: 54,
            flexShrink: 0,
            borderRadius: 12,
            overflow: "hidden",
            transform: "rotate(-6deg)",
            boxShadow: `0 0 0 3px ${V.paper}, 0 10px 20px -8px ${V.shadow}`,
            opacity: phase === "play" ? 1 : 0,
            transition: "opacity .2s ease",
            background: V.base,
          }}
        >
          {t > 1 && (
            <div style={{ position: "absolute", left: 0, top: 0, width: t, height: t, transform: `scale(${54 / t})`, transformOrigin: "0 0" }}>
              <Slice src={src} crop={crop} n={n} t={t} id={last} ok={ok} />
            </div>
          )}
          <span aria-hidden className="lv-wiggle" style={{ position: "absolute", right: -2, top: -4, fontSize: 18 }}>
            💗
          </span>
        </div>
        <div style={{ minWidth: 0, flex: 1, display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
          <span style={pill} aria-label={`${game.moves} moves`}>
            <Footprints size={15} style={{ color: V.a1 }} /> {game.moves}
          </span>
          <span style={pill} aria-label={`time ${fmtTime(elapsed)}`}>
            <Timer size={15} style={{ color: V.a1 }} /> {fmtTime(elapsed)}
          </span>
          <span style={{ ...pill, background: V.chip, color: V.chipInk, border: "none" }}>
            {meta.emoji} {meta.label} · {n}×{n}
          </span>
        </div>
      </div>

      {/* The board */}
      <div ref={wrapRef} style={{ width: "100%", display: "flex", justifyContent: "center" }}>
        <div
          className={phase === "complete" ? "lp-glow" : undefined}
          style={{
            position: "relative",
            padding: FRAME_PAD,
            borderRadius: phase === "complete" ? 14 : Math.max(18, radius + FRAME_PAD),
            background: skin.frame,
            boxShadow: `inset 0 2px 0 rgba(255,255,255,.35), inset 0 -3px 0 rgba(0,0,0,.18), 0 30px 60px -28px ${V.shadow}`,
            transition: "border-radius .5s ease",
          }}
        >
          <div
            ref={boardRef}
            role="grid"
            aria-label={`Sliding puzzle, ${n} by ${n}. ${game.solved ? "Solved." : "Tap a tile next to the gap, swipe, or use the arrow keys."}`}
            tabIndex={0}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerCancel={() => (down.current = null)}
            className="lv-focus"
            style={{
              position: "relative",
              width: S,
              height: S,
              borderRadius: Math.max(4, radius - 2),
              background: skin.well,
              touchAction: "none",
              userSelect: "none",
              WebkitUserSelect: "none",
              overflow: "hidden",
              outline: "none",
              transition: "border-radius .5s ease",
            }}
          >
            {t > 1 &&
              game.board.map((_, id) => {
                if (id === last && phase !== "complete") return null;
                const pos = posOf.get(id) ?? id;
                const [r, c] = rc(pos, n);
                const canSlide = phase === "play" && movable.has(pos);
                return (
                  <div
                    key={id}
                    data-pos={pos}
                    data-tile={id}
                    role="gridcell"
                    aria-label={`tile ${id + 1}${canSlide ? ", can slide" : ""}`}
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      width: t,
                      height: t,
                      transform: `translate3d(${c * t}px, ${r * t}px, 0)`,
                      transition: reduceMotion ? "none" : `transform ${stepMs}ms cubic-bezier(.25,.9,.3,1.05)`,
                      cursor: canSlide ? "pointer" : "default",
                      zIndex: 1,
                    }}
                  >
                    <div
                      className={canSlide ? "lp-tile lp-can" : "lp-tile"}
                      style={{
                        position: "absolute",
                        inset: gapPx,
                        borderRadius: radius,
                        overflow: "hidden",
                        boxShadow: phase === "complete" ? "none" : skin.tileEdge,
                        transition: "inset .5s ease, border-radius .5s ease, box-shadow .4s ease",
                        background: V.base,
                      }}
                    >
                      <Slice src={src} crop={crop} n={n} t={t} id={id} inset={gapPx} ok={ok} />
                      {(numbers || !ok) && phase !== "complete" && (
                        <span
                          aria-hidden
                          style={{
                            position: "absolute",
                            left: t < 80 ? 3 : 5,
                            top: t < 80 ? 3 : 5,
                            minWidth: t < 80 ? 18 : 22,
                            height: t < 80 ? 18 : 22,
                            padding: "0 5px",
                            borderRadius: 999,
                            background: skin.badge,
                            color: skin.badgeInk,
                            fontFamily: GROTESK,
                            fontWeight: 800,
                            fontSize: t < 80 ? 10.5 : 12,
                            display: "grid",
                            placeItems: "center",
                            boxShadow: "0 2px 6px rgba(0,0,0,.25)",
                          }}
                        >
                          {id + 1}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

            {/* The empty slot: a soft, dashed "your piece goes here" */}
            {phase === "play" && t > 1 && (
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: t,
                  height: t,
                  transform: `translate3d(${(gap % n) * t}px, ${Math.floor(gap / n) * t}px, 0)`,
                  transition: reduceMotion ? "none" : `transform ${stepMs}ms cubic-bezier(.25,.9,.3,1.05)`,
                  display: "grid",
                  placeItems: "center",
                  pointerEvents: "none",
                }}
              >
                <span style={{ position: "absolute", inset: gapPx + 4, borderRadius: radius, border: "2px dashed rgba(255,255,255,.35)" }} />
                {gap === last && <span style={{ fontSize: Math.min(26, t * 0.28), opacity: 0.8 }}>💗</span>}
              </div>
            )}

            {/* Peek: the whole photo, briefly */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 5,
                opacity: peeking ? 1 : 0,
                transition: "opacity .25s ease",
                pointerEvents: "none",
              }}
            >
              {t > 1 && <PhotoLayer src={src} crop={crop} size={S} ok={ok} />}
              <span style={{ position: "absolute", left: "50%", bottom: 10, transform: "translateX(-50%)", padding: "5px 12px", borderRadius: 999, background: "rgba(0,0,0,.55)", color: "#fff", fontFamily: GROTESK, fontWeight: 800, fontSize: 12 }}>
                👀 peeking…
              </span>
            </div>
          </div>
          {phase === "complete" && !reduceMotion && <HeartBurst glyphs={["💖", "🧩", "✨", "💗", "🎉"]} />}
        </div>
      </div>

      {/* The last piece in flight */}
      {phase === "flying" && fly && (
        <motion.div
          aria-hidden
          initial={{ x: fly.x, y: fly.y, scale: fly.scale, rotate: -6 }}
          animate={{ x: [fly.x, fly.x * 0.45, 0], y: [fly.y, fly.y * 0.45 - 90, 0], scale: [fly.scale, 1.25, 1], rotate: [-6, 12, 0] }}
          transition={{ duration: 0.85, ease: [0.3, 0.7, 0.4, 1], times: [0, 0.55, 1] }}
          onAnimationComplete={() => setPhase("complete")}
          style={{
            position: "fixed",
            left: fly.left,
            top: fly.top,
            width: t,
            height: t,
            zIndex: 140,
            transformOrigin: "0 0",
            overflow: "hidden",
            borderRadius: radius,
            boxShadow: `0 0 0 3px ${V.paper}, 0 24px 40px -12px rgba(0,0,0,.55)`,
          }}
        >
          <Slice src={src} crop={crop} n={n} t={t} id={last} ok={ok} />
        </motion.div>
      )}

      {/* Tools */}
      {phase === "play" && (
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 6 }}>
          <button type="button" onClick={doPeek} style={tool(peeking)} className="lv-focus" aria-label="Peek at the full photo">
            <Eye size={16} /> peek
          </button>
          {showNumbersToggle && (
            <button type="button" onClick={() => setNumbers((v) => !v)} style={tool(numbers)} className="lv-focus" aria-pressed={numbers} aria-label="Show tile numbers">
              <Hash size={16} /> numbers
            </button>
          )}
          <button type="button" onClick={game.reshuffle} style={tool()} className="lv-focus" aria-label="Shuffle again">
            <Shuffle size={16} /> shuffle
          </button>
          <button
            type="button"
            onClick={() => {
              unlockAudio();
              setMuted(!muted);
              setMutedState(!muted);
            }}
            style={tool()}
            className="lv-focus"
            aria-label={muted ? "Sound on" : "Sound off"}
          >
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      )}
      {stuck && (
        <button type="button" onClick={game.autoSolve} className="lv-focus lv-pop" style={{ ...tool(), borderStyle: "dashed" }}>
          <Wand2 size={16} /> stuck? I&apos;ll finish it for you 🫶
        </button>
      )}
      {game.autoSolving && (
        <p style={{ margin: 0, fontFamily: ITALIC, fontStyle: "italic", fontSize: 18, color: V.soft }}>rewinding every move… ⏪</p>
      )}
      <style>{PUZZLE_CSS}</style>
    </div>
  );
}

const PUZZLE_CSS = `
@keyframes lp-glow { 0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--lv-a1) 60%, transparent), 0 30px 60px -28px var(--lv-shadow) } 100% { box-shadow: 0 0 0 26px transparent, 0 30px 60px -28px var(--lv-shadow) } }
.lp-glow { animation: lp-glow 1.2s ease-out 2; }
.lp-tile { transition-property: inset, border-radius, box-shadow, filter !important; }
@media (hover: hover) { .lp-can:hover { filter: brightness(1.08) saturate(1.05); } }
@media (prefers-reduced-motion: reduce) { .lp-glow { animation: none; } }
`;
