"use client";

// Scene 4 — The sparkler. Their word (a nickname, or their name) waits in the
// night as a faint outline. She picks up the sparkler and swipes anywhere:
// sparks fly off the tip (a small canvas, drawn only while sparks are alive)
// and every stroke writes more of the word in gold light, left to right.
// A plain tap works too (a burst of sparks, a bigger chunk of the word).

import { useCallback, useEffect, useRef, useState, type PointerEvent as RPointerEvent, type ReactNode } from "react";
import { motion } from "framer-motion";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import { FONTS } from "../../../_valentine/theme";
import { DW_DISPLAY } from "./fonts";
import { DW_GIF, preload, useDw, useNext } from "./stage";
import { DW, Hint, SceneTitle } from "./ui";

/** Outside the component: the React compiler treats these as impure inside it. */
const now = () => performance.now();
const rand = () => Math.random();

const CSS = `
.dw-sky { position: relative; width: 100%; height: 100%; touch-action: none; cursor: crosshair; border-radius: 22px; overflow: hidden;
  background: radial-gradient(70% 60% at 50% 55%, rgba(255,178,63,.08), transparent 70%); box-shadow: inset 0 0 0 1px rgba(255,211,110,.12); }
.dw-sky canvas { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
.dw-word { position: absolute; inset: 0; display: grid; place-items: center; pointer-events: none; padding: 0 10px; }
.dw-word span { grid-area: 1 / 1; white-space: nowrap; font: 400 min(calc(88cqw / (var(--len) * .8)), 30cqh, 120px)/1.2 ${DW_DISPLAY}; letter-spacing: .02em; padding: .1em .15em 0; }
.dw-word .ghost { color: transparent; -webkit-text-stroke: 1.5px rgba(255,246,227,.22); }
.dw-word .lit { color: #FFE6A3; text-shadow: 0 0 6px #FFB23F, 0 0 18px rgba(255,178,63,.85), 0 0 42px rgba(255,120,40,.6); transition: clip-path .25s linear; }
.dw-word .lit.is-done { animation: dw-glow 1.8s ease-in-out infinite alternate; }
@keyframes dw-glow { from { text-shadow: 0 0 6px #FFB23F, 0 0 18px rgba(255,178,63,.85), 0 0 42px rgba(255,120,40,.6) } to { text-shadow: 0 0 10px #FFF3C4, 0 0 30px rgba(255,200,90,1), 0 0 70px rgba(255,120,40,.8) } }
.dw-wand { position: absolute; left: 0; top: 0; pointer-events: none; will-change: transform; }
.dw-wand.is-idle { animation: dw-wave 1.8s ease-in-out infinite alternate; }
@keyframes dw-wave { from { rotate: -6deg } to { rotate: 8deg } }
@media (prefers-reduced-motion: reduce) { .dw-word .lit.is-done, .dw-wand.is-idle { animation: none; } }
`;

type Spark = { x: number; y: number; vx: number; vy: number; life: number; max: number; hue: number };

/** The wand GIF's sparkle tip, as a fraction of its box (474×498 art). */
const TIP = { x: 0.57, y: 0.47 };
/** The wand sticker's box (the parent renders the sticker at this size). */
export const WAND = 140;

export default function Sparkler({ word, sticker, nextLabel, onNext }: { word: string; sticker: ReactNode; nextLabel: string; onNext: () => void }) {
  const reduced = useReducedMotion();
  const { cue } = useDw();
  const skyRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wandRef = useRef<HTMLDivElement | null>(null);
  const sparks = useRef<Spark[]>([]);
  const raf = useRef<number | null>(null);
  const size = useRef({ w: 300, h: 300, dpr: 1 });
  const [p, setP] = useState(0);
  const prog = useRef(0);
  const last = useRef<{ x: number; y: number } | null>(null);
  const lastCue = useRef(0);
  const [active, setActive] = useState(false);
  const done = p >= 1;
  const wandSize = useRef(WAND);

  useEffect(() => {
    preload(DW_GIF.wand);
  }, []);

  // Size the canvas to the sky (device pixels, capped at 2× for speed).
  useEffect(() => {
    const el = skyRef.current;
    const cv = canvasRef.current;
    if (!el || !cv) return;
    const fit = () => {
      const r = el.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      size.current = { w: r.width, h: r.height, dpr };
      cv.width = Math.round(r.width * dpr);
      cv.height = Math.round(r.height * dpr);
      placeWand(r.width * 0.72, r.height * 0.78);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(
    () => () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    },
    [],
  );

  const placeWand = (x: number, y: number) => {
    const w = wandRef.current;
    if (!w) return;
    const s = wandSize.current;
    w.style.width = `${s}px`;
    w.style.height = `${s}px`;
    w.style.transform = `translate(${x - s * TIP.x}px, ${y - s * TIP.y}px)`;
  };

  const draw = useCallback(() => {
    const cv = canvasRef.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const { w, h, dpr } = size.current;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";
    const list = sparks.current;
    for (let i = list.length - 1; i >= 0; i--) {
      const s = list[i];
      s.life += 1;
      s.vy += 0.09;
      s.vx *= 0.97;
      s.x += s.vx;
      s.y += s.vy;
      const t = 1 - s.life / s.max;
      if (t <= 0) {
        list.splice(i, 1);
        continue;
      }
      ctx.strokeStyle = `hsla(${s.hue}, 100%, ${55 + t * 30}%, ${Math.min(1, t * 1.5)})`;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - s.vx * 2.4, s.y - s.vy * 2.4);
      ctx.stroke();
    }
    raf.current = list.length ? requestAnimationFrame(draw) : null;
    if (!list.length) ctx.clearRect(0, 0, w, h);
  }, []);

  const emit = (x: number, y: number, n: number, power = 1) => {
    if (reduced) return;
    for (let k = 0; k < n; k++) {
      const a = rand() * Math.PI * 2;
      const v = (1.2 + rand() * 3.6) * power;
      sparks.current.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1, life: 0, max: 18 + rand() * 22, hue: 35 + rand() * 20 });
    }
    if (sparks.current.length > 420) sparks.current.splice(0, sparks.current.length - 420);
    if (!raf.current) raf.current = requestAnimationFrame(draw);
  };

  const advance = (d: number) => {
    if (prog.current >= 1) return;
    prog.current = Math.min(1, prog.current + d);
    setP(prog.current);
    if (prog.current >= 1) {
      haptic([20, 40, 20]);
      cue("chime-cascade", { gain: 0.55 });
      const { w, h } = size.current;
      for (let k = 0; k < 5; k++) window.setTimeout(() => emit(w * (0.2 + 0.15 * k), h * 0.5, 40, 1.4), k * 90);
    }
  };

  const local = (e: { clientX: number; clientY: number }) => {
    const r = skyRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const onDown = (e: RPointerEvent<HTMLDivElement>) => {
    const pt = local(e);
    last.current = pt;
    setActive(true);
    placeWand(pt.x, pt.y);
    emit(pt.x, pt.y, 26, 1.2);
    cue("sparkle", { gain: 0.5 });
    // a plain tap writes a chunk too
    advance(0.08);
    try {
      (e.target as Element).setPointerCapture?.(e.pointerId);
    } catch {
      /* fine */
    }
  };
  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    if (!last.current) return;
    const pt = local(e);
    const d = Math.hypot(pt.x - last.current.x, pt.y - last.current.y);
    last.current = pt;
    placeWand(pt.x, pt.y);
    emit(pt.x, pt.y, Math.min(10, 2 + Math.round(d / 6)));
    advance(d / (size.current.w * 3.2));
    const t = now();
    if (t - lastCue.current > 140 && d > 2) {
      lastCue.current = t;
      cue("sparkle", { gain: 0.22, detune: (rand() - 0.5) * 400 });
    }
  };
  const onUp = () => {
    last.current = null;
    setActive(false);
  };

  useNext(done ? nextLabel : null, onNext, "lantern");

  const shown = Math.min(1, p);
  return (
    <>
      <style>{CSS}</style>
      <SceneTitle kicker="Write it in light" title={done ? "Written in the stars" : "Swipe the sparkler"} sub={done ? undefined : "Draw anywhere in the sky, as big as you like."} />
      <div className="dw-fill">
        <div ref={skyRef} className="dw-sky" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} role="img" aria-label={`The word ${word}, written with a sparkler`}>
          <div className="dw-word" style={{ ["--len" as string]: Math.max(3, word.length) }} aria-hidden>
            <span className="ghost">{word}</span>
            <span className={`lit${done ? " is-done" : ""}`} style={{ clipPath: `inset(-80% ${(1 - shown) * 100}% -80% -10%)` }}>
              {word}
            </span>
          </div>
          <canvas ref={canvasRef} aria-hidden />
          <div ref={wandRef} className={`dw-wand${active || done ? "" : " is-idle"}`} aria-hidden style={{ transformOrigin: `${TIP.x * 100}% ${TIP.y * 100}%` }}>
            <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center" }}>{sticker}</div>
          </div>
        </div>
      </div>
      <div style={{ flex: "none", minHeight: 44, display: "grid", placeItems: "center" }}>
        {done ? (
          <motion.p initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ margin: 0, font: `600 clamp(13.5px, 2.1dvh, 16px) ${FONTS.ui}`, color: DW.gold }}>
            The brightest word of the night ✨
          </motion.p>
        ) : (
          <Hint>{Math.round(shown * 100)}% written</Hint>
        )}
      </div>
    </>
  );
}
