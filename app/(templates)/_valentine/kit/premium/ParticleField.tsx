"use client";

// ─── <ParticleField> — ONE shared canvas per page, with a budget ─────────────
//
//   <ParticleField preset="petals" colors={["#ff8fab", "#ffd1dc"]} />
//   <ParticleField preset="embers" density={0.6} />      // 60% of the budget
//
// Mount it once (behind the scenes, `position: fixed`, pointer-events: none)
// and change `preset` between scenes instead of mounting a second one.
// Budget: ≤ 120 sprites on phones, ≤ 200 from 1024px, DPR capped at 2.
// It stops drawing when the tab is hidden or the canvas is off screen, and
// with reduced motion it draws nothing (pass `still` to draw one frozen frame).
// Transform-free Canvas2D: no layout work per frame.

import { useEffect, useRef, type CSSProperties } from "react";
import { useReducedMotion } from "../useReducedMotion";

export type ParticlePreset = "embers" | "bats" | "petals" | "sparkles" | "dust" | "rain" | "snowhearts" | "snow" | "fireflies" | "confetti";

interface Sprite {
  x: number; y: number; vx: number; vy: number; r: number; a: number; rot: number; vr: number; c: string; life: number;
}

const DEFAULT_COLORS: Record<ParticlePreset, string[]> = {
  embers: ["#ffb067", "#ff8a3d", "#ffd27a"],
  bats: ["#1b1330", "#2a1d45"],
  petals: ["#ff8fab", "#ffb3c6", "#e05780"],
  sparkles: ["#fff6d6", "#ffe08a", "#ffffff"],
  dust: ["rgba(255,248,230,.7)"],
  rain: ["rgba(200,220,255,.55)"],
  snowhearts: ["#ffffff", "#ffe5ec"],
  snow: ["#ffffff"],
  fireflies: ["#f6ff9e", "#d9ff6b"],
  confetti: ["#ff8fab", "#ffd98a", "#9be7c4", "#b9a7ff", "#7cc6ff"],
};

export interface ParticleFieldProps {
  preset: ParticlePreset;
  colors?: string[];
  /** 0–1 share of the budget (default 0.5). */
  density?: number;
  /** Draw a single frozen frame under reduced motion instead of nothing. */
  still?: boolean;
  style?: CSSProperties;
  className?: string;
  /** z-index (default 1). */
  z?: number;
}

function spawn(p: ParticlePreset, w: number, h: number, colors: string[], initial: boolean): Sprite {
  const c = colors[Math.floor(Math.random() * colors.length)];
  const y0 = initial ? Math.random() * h : p === "embers" || p === "fireflies" ? h + 10 : p === "bats" ? Math.random() * h * 0.6 : -10;
  const base: Sprite = { x: Math.random() * w, y: y0, vx: 0, vy: 0, r: 2, a: 1, rot: Math.random() * 6.28, vr: 0, c, life: 1 };
  switch (p) {
    case "embers": return { ...base, vx: (Math.random() - 0.5) * 0.3, vy: -(0.4 + Math.random() * 0.9), r: 1 + Math.random() * 2.2 };
    case "fireflies": return { ...base, vx: (Math.random() - 0.5) * 0.4, vy: -(0.1 + Math.random() * 0.3), r: 1.5 + Math.random() * 2 };
    case "bats": return { ...base, x: initial ? base.x : -30, vx: 1 + Math.random() * 1.6, vy: (Math.random() - 0.5) * 0.4, r: 6 + Math.random() * 6 };
    case "petals": return { ...base, vx: 0.2 + Math.random() * 0.6, vy: 0.5 + Math.random() * 0.9, r: 4 + Math.random() * 5, vr: (Math.random() - 0.5) * 0.06 };
    case "sparkles": return { ...base, y: Math.random() * h, vy: -0.05, r: 1 + Math.random() * 2.5, life: Math.random() };
    case "dust": return { ...base, vx: (Math.random() - 0.5) * 0.15, vy: (Math.random() - 0.5) * 0.15, r: 0.6 + Math.random() * 1.6 };
    case "rain": return { ...base, vx: -1.2, vy: 9 + Math.random() * 6, r: 10 + Math.random() * 10 };
    case "snowhearts": case "snow": return { ...base, vx: (Math.random() - 0.5) * 0.5, vy: 0.4 + Math.random() * 0.8, r: 2 + Math.random() * 4 };
    case "confetti": return { ...base, vx: (Math.random() - 0.5) * 1.2, vy: 1.2 + Math.random() * 1.8, r: 3 + Math.random() * 4, vr: (Math.random() - 0.5) * 0.2 };
  }
}

function heart(ctx: CanvasRenderingContext2D, r: number) {
  ctx.beginPath();
  ctx.moveTo(0, r * 0.35);
  ctx.bezierCurveTo(-r, -r * 0.4, -r * 0.4, -r * 1.1, 0, -r * 0.45);
  ctx.bezierCurveTo(r * 0.4, -r * 1.1, r, -r * 0.4, 0, r * 0.35);
  ctx.fill();
}

function draw(ctx: CanvasRenderingContext2D, p: ParticlePreset, s: Sprite, t: number) {
  ctx.fillStyle = s.c;
  ctx.strokeStyle = s.c;
  switch (p) {
    case "embers": case "fireflies": {
      const flick = p === "fireflies" ? 0.4 + 0.6 * Math.abs(Math.sin(t / 600 + s.rot * 3)) : 0.6 + 0.4 * Math.sin(t / 120 + s.rot * 5);
      ctx.globalAlpha = flick * s.a;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill();
      ctx.globalAlpha = flick * 0.25 * s.a;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 3, 0, 6.283); ctx.fill();
      break;
    }
    case "sparkles": {
      ctx.globalAlpha = Math.max(0, Math.sin((t / 900 + s.life) * Math.PI));
      ctx.save(); ctx.translate(s.x, s.y); ctx.beginPath();
      ctx.moveTo(0, -s.r * 2); ctx.lineTo(s.r * 0.4, 0); ctx.lineTo(0, s.r * 2); ctx.lineTo(-s.r * 0.4, 0); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-s.r * 2, 0); ctx.lineTo(0, s.r * 0.4); ctx.lineTo(s.r * 2, 0); ctx.lineTo(0, -s.r * 0.4); ctx.closePath(); ctx.fill();
      ctx.restore();
      break;
    }
    case "petals": case "confetti": {
      ctx.globalAlpha = 0.9;
      ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(s.rot);
      if (p === "petals") { ctx.beginPath(); ctx.ellipse(0, 0, s.r, s.r * 0.55, 0, 0, 6.283); ctx.fill(); }
      else ctx.fillRect(-s.r / 2, -s.r / 4, s.r, s.r / 2);
      ctx.restore();
      break;
    }
    case "bats": {
      const flap = Math.sin(t / 70 + s.rot * 4);
      ctx.globalAlpha = 0.85;
      ctx.save(); ctx.translate(s.x, s.y); ctx.beginPath();
      ctx.moveTo(0, 0); ctx.quadraticCurveTo(-s.r, -s.r * flap, -s.r * 1.6, 0); ctx.quadraticCurveTo(-s.r * 0.8, s.r * 0.2, 0, s.r * 0.25);
      ctx.quadraticCurveTo(s.r * 0.8, s.r * 0.2, s.r * 1.6, 0); ctx.quadraticCurveTo(s.r, -s.r * flap, 0, 0); ctx.fill();
      ctx.restore();
      break;
    }
    case "rain": {
      ctx.globalAlpha = 0.6; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x + s.vx * 1.5, s.y + s.r); ctx.stroke();
      break;
    }
    case "snowhearts": {
      ctx.globalAlpha = 0.85; ctx.save(); ctx.translate(s.x, s.y); heart(ctx, s.r * 1.3); ctx.restore();
      break;
    }
    default: {
      ctx.globalAlpha = p === "dust" ? 0.5 : 0.9;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill();
    }
  }
}

export default function ParticleField({ preset, colors, density = 0.5, still = false, style, className, z = 1 }: ParticleFieldProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();
  const colorKey = (colors ?? DEFAULT_COLORS[preset]).join("|");

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (reduce && !still) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const cols = colorKey.split("|");
    let w = 0, h = 0, raf = 0, visible = true, onScreen = true;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const resize = () => {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const budget = (window.innerWidth >= 1024 ? 200 : 120) * Math.max(0, Math.min(1, density));
    const n = Math.round(preset === "bats" ? Math.min(14, budget / 6) : preset === "rain" ? budget : budget * 0.6);
    const sprites: Sprite[] = Array.from({ length: n }, () => spawn(preset, w, h, cols, true));
    let last = performance.now();
    const frame = (now: number) => {
      raf = 0;
      const dt = Math.min(3, (now - last) / 16.67);
      last = now;
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < sprites.length; i++) {
        const s = sprites[i];
        if (!(reduce && still)) {
          s.x += s.vx * dt + (preset === "petals" || preset === "snow" || preset === "snowhearts" ? Math.sin(now / 900 + s.rot) * 0.3 * dt : 0);
          s.y += s.vy * dt;
          s.rot += s.vr * dt;
          if (s.y < -20 || s.y > h + 20 || s.x < -40 || s.x > w + 40) sprites[i] = spawn(preset, w, h, cols, false);
        }
        draw(ctx, preset, s, now);
      }
      ctx.globalAlpha = 1;
      if (visible && onScreen && !(reduce && still)) raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (!raf && visible && onScreen) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    const onVis = () => { visible = !document.hidden; kick(); };
    const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; kick(); });
    io.observe(canvas);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    document.addEventListener("visibilitychange", onVis);
    raf = requestAnimationFrame(frame);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [preset, colorKey, density, reduce, still]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={className}
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: z, ...style }}
    />
  );
}
