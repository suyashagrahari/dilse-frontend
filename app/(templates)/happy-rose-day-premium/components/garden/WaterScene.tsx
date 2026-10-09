"use client";

// Scene 1 · Water me. A seed drops into the pot; she drags the pink watering can over it and it pours (droplets,
// drips). The sprout grows in three bouncy stages (sprout → leaves → bud), each with a pop, sparkles and a label.
// The penguin with the vase cheers… then turns into a bunny lounging in roses. Fallback: "Water it for me" pours
// one stage per tap (the can flies over by itself). Keyboard: the button.

import { useEffect, useRef, useState } from "react";
import { haptic } from "../../../_valentine/kit";
import { usePremium } from "../../../_valentine/kit/premium";
import type { DayConfig } from "../../../_valentine/types";
import { Plant, shadesFor } from "../../../happy-rose-day/components/rose/art";
import { Gif, Slot, Sparkle, WateringCan } from "./art";
import { Puffy, Scene, originOf, useAww } from "./ui";
import { FIXED_GIF, type Garden } from "./util";

const STAGES = ["a sprout! 🌱", "leaves! 🍃", "a bud! 🌹"];
const POUR_MS = 2700;
const CAN_W = 112;

interface Drop {
  id: number;
  x: number;
  y: number;
  fall: number;
}

export function WaterScene({ g, day, gifs, step, total, onDone }: { g: Garden; day: DayConfig; gifs?: Record<string, string>; step: number; total: number; onDone: () => void }) {
  const { sfx } = usePremium();
  const aww = useAww();
  const stageRef = useRef<HTMLDivElement>(null);
  const potRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 340, h: 400 });
  const [water, setWater] = useState(0);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [auto, setAuto] = useState<number | null>(null);
  const [drops, setDrops] = useState<Drop[]>([]);
  const [label, setLabel] = useState<string | null>(null);
  const grab = useRef({ dx: 0, dy: 0 });
  const waterRef = useRef(0);
  const stageHit = useRef(0);
  const dropId = useRef(0);
  const done = water >= 1;

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    setSize({ w: el.clientWidth, h: el.clientHeight });
    sfx("bubble", { at: 0.7, gain: 0.6 });
    return () => ro.disconnect();
  }, [sfx]);

  const home = { x: size.w - CAN_W - 4, y: 6 };
  const pourAt = { x: size.w / 2 + 6, y: Math.max(0, size.h * 0.12) };
  const can = auto !== null ? pourAt : done ? home : (pos ?? home);
  // Over the pot = the spout (the can's left edge) is above the plant's column.
  const over = can.x < size.w / 2 + 70 && can.x + 20 > size.w / 2 - 110 && can.y < size.h * 0.42;
  const pouring = !done && (auto !== null || (dragging && over));

  // The pour loop (one rAF for the scene's life, everything through refs): water rises while pouring, droplets
  // fall from the spout, and each third pops a stage.
  const live = useRef({ pouring, can, h: size.h, auto, sfx, aww });
  useEffect(() => {
    live.current = { pouring, can, h: size.h, auto, sfx, aww };
  });
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let lastDrop = 0;
    let lastDrip = 0;
    const tick = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      const L = live.current;
      if (L.pouring && waterRef.current < 1) {
        const target = L.auto !== null ? L.auto / 3 : 1;
        const nextW = Math.min(1, target, waterRef.current + dt / POUR_MS);
        waterRef.current = nextW;
        setWater(nextW);
        const stage = Math.floor(nextW * 3 + 1e-6);
        if (stage > stageHit.current) {
          stageHit.current = stage;
          setLabel(STAGES[stage - 1]);
          if (stage < 3) {
            L.sfx("rg-sprout", { gain: 0.8 });
            L.sfx("sparkle", { gain: 0.4 });
            haptic([12, 30, 12]);
          } else {
            L.aww(originOf(potRef.current, 0.25));
          }
          if (L.auto !== null && stage >= L.auto) setAuto(null);
        }
        if (now - lastDrop > 80) {
          lastDrop = now;
          const id = ++dropId.current;
          const sx = L.can.x + 8 + Math.random() * 10;
          const sy = L.can.y + 22;
          setDrops((d) => [...d.slice(-14), { id, x: sx, y: sy, fall: Math.max(60, L.h * 0.62 - sy) }]);
          window.setTimeout(() => setDrops((d) => d.filter((q) => q.id !== id)), 700);
        }
        if (now - lastDrip > 240) {
          lastDrip = now;
          L.sfx("rg-drip", { gain: 0.5, pan: -0.2 });
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!label) return;
    const t = window.setTimeout(() => setLabel(null), 1400);
    return () => window.clearTimeout(t);
  }, [label]);

  const onDown = (e: React.PointerEvent) => {
    if (done) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const r = stageRef.current!.getBoundingClientRect();
    grab.current = { dx: e.clientX - r.left - can.x, dy: e.clientY - r.top - can.y };
    setDragging(true);
    sfx("rg-boing", { gain: 0.4 });
  };
  const onMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const r = stageRef.current!.getBoundingClientRect();
    const x = Math.max(-20, Math.min(size.w - CAN_W + 10, e.clientX - r.left - grab.current.dx));
    const y = Math.max(-30, Math.min(size.h - 120, e.clientY - r.top - grab.current.dy));
    setPos({ x, y });
  };
  const onUp = () => setDragging(false);

  const pourForMe = () => {
    if (done || auto !== null) return;
    setAuto(Math.min(3, stageHit.current + 1));
  };

  // Stage 1 is a seedling of our own; from the leaves on it is the $2 day's plant, up to a closed bud.
  const sprout = water < 2 / 3;
  const progress = 0.2 + 0.24 * Math.min(1, Math.max(0, (water - 2 / 3) * 3));
  const sh = shadesFor(g.color);

  return (
    <Scene id="water" step={step} total={total} label="Water the rose" kicker="Step 1 · plant it" title={g.opening} sub={done ? "Look! A little bud, just for you 🌹" : "Drag the watering can over the pot 💧"}>
      <div className="rg-waterStage" ref={stageRef}>
        <div className="rg-pot" ref={potRef}>
          <span className="rg-seed" aria-hidden />
          {sprout ? <SproutPot k={Math.min(1, water * 1.6)} /> : <Plant progress={progress} id="water" sh={sh} />}
          {label && (
            <span className="rg-stageLabel" key={label}>
              <Sparkle size={14} color="#FFE27A" /> {label}
            </span>
          )}
        </div>
        {drops.map((d) => (
          <i key={d.id} className="rg-drop" style={{ left: d.x, top: d.y, ["--fall" as string]: `${d.fall}px` }} aria-hidden />
        ))}
        <div
          className={`rg-can${pouring ? " is-pouring" : ""}${dragging ? " is-dragging" : ""}${done ? " is-done" : ""}`}
          style={{ transform: `translate(${can.x}px, ${can.y}px)` }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          role="img"
          aria-label="Watering can: drag it over the pot"
        >
          <span className="rg-canTilt">
            <WateringCan size={CAN_W} />
          </span>
          {!dragging && !done && water === 0 && <span className="rg-dragHint" aria-hidden>drag me</span>}
        </div>
        <div className="rg-reactor rg-reactor--water">
          {done ? <Gif key="bunny" src={FIXED_GIF.bunnyRoses} size={104} className="rg-pop" tilt={-6} /> : <Slot day={day} gifs={gifs} id="rg2-water" size={96} tilt={-6} eager />}
        </div>
        <div className="rg-meter" aria-label={`Watered ${Math.round(water * 100)}%`} role="progressbar" aria-valuenow={Math.round(water * 100)} aria-valuemin={0} aria-valuemax={100}>
          {[0, 1, 2].map((k) => (
            <i key={k} className={water * 3 >= k + 1 - 1e-6 ? "is-full" : ""} />
          ))}
        </div>
      </div>
      <div className="rg-foot">
        {done ? (
          <Puffy onClick={onDone} cue="pop">
            Let it bloom 🌹
          </Puffy>
        ) : (
          <Puffy variant="ghost" onClick={pourForMe} cue={null} disabled={auto !== null}>
            Water it for me 💧
          </Puffy>
        )}
      </div>
    </Scene>
  );
}

/** The pot from the $2 Plant (same viewBox 240×360, soil at y≈291) with a two-leaf seedling growing by `k`. */
function SproutPot({ k }: { k: number }) {
  const h = 8 + 52 * k;
  const top = 291 - h;
  return (
    <svg viewBox="0 0 240 360" width="100%" height="100%" style={{ overflow: "visible", display: "block" }} aria-hidden>
      <defs>
        <linearGradient id="sp-pot" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#B4542F" />
          <stop offset=".45" stopColor="#D9774A" />
          <stop offset="1" stopColor="#A54826" />
        </linearGradient>
      </defs>
      {k > 0.02 && (
        <g>
          <path d={`M120 292 C 118 ${292 - h * 0.4} 122 ${292 - h * 0.7} 120 ${top}`} stroke="#6FAE63" strokeWidth={5} fill="none" strokeLinecap="round" />
          <g transform={`translate(120 ${top}) scale(${0.3 + 0.7 * k})`}>
            <path d="M0 0 C -6 -18 -30 -24 -40 -12 C -28 2 -10 4 0 0 Z" fill="#7BC47F" stroke="#fff" strokeWidth={2} />
            <path d="M0 0 C 6 -22 30 -30 42 -16 C 30 0 10 4 0 0 Z" fill="#8DD18F" stroke="#fff" strokeWidth={2} />
          </g>
        </g>
      )}
      <ellipse cx={120} cy={352} rx={58} ry={6} fill="rgba(90,26,43,.12)" />
      <path d="M78 306 L162 306 L152 350 Q120 356 88 350 Z" fill="url(#sp-pot)" />
      <path d="M86 318 Q120 324 154 318" stroke="rgba(255,255,255,.18)" strokeWidth={2} fill="none" />
      <rect x={70} y={288} width={100} height={20} rx={6} fill="#DE8457" />
      <rect x={70} y={288} width={100} height={6} rx={3} fill="rgba(255,255,255,.22)" />
      <ellipse cx={120} cy={291} rx={44} ry={4} fill="#5B3A2A" />
      <path d="M120 340 c-6 -5 -12 -8 -12 -13 a5 5 0 0 1 12 -2 a5 5 0 0 1 12 2 c0 5 -6 8 -12 13 Z" fill="#FBE3E8" opacity=".9" />
    </svg>
  );
}
