"use client";

// ─── <GlowParticles> — depth-of-field particles that look shot, not drawn ────
//
//   <GlowParticles preset="petals" />
//   <GlowParticles preset="embers" density={0.7} colors={["#ffb067", "#ff7a2f"]} />
//
// Every sprite is pre-rendered ONCE per colour to a small offscreen canvas
// (soft radial glow, shaded petal, glossy heart, bat flap frames…) and then
// only drawImage'd — no gradients or paths per frame. Three depth layers on
// two canvases: a blurred canvas holds the far layer (small, slow, dim) and a
// few huge out-of-focus foreground ones; the sharp canvas holds the mid layer.
// Glowing presets draw additively ("lighter"). Budget: ≤ 90 sprites on phones,
// ≤ 160 from 1024px, × density. DPR capped at 2; stops when hidden/off screen.
// Reduced motion: one still frame. Use ParticleField for the cheap flat look.

import { useEffect, useRef, type CSSProperties } from "react";
import { useReducedMotion } from "../../useReducedMotion";
import { hexA } from "./shared";

export type GlowPreset = "petals" | "embers" | "fireflies" | "hearts" | "sparkles" | "snow" | "bats";

export const GLOW_COLORS: Record<GlowPreset, string[]> = {
  petals: ["#ff8fab", "#ffb3c6", "#e0406a", "#ffd6e0"],
  embers: ["#ffb067", "#ff7a2f", "#ffd27a"],
  fireflies: ["#f4ff9e", "#d9ff6b", "#fff2a8"],
  hearts: ["#ff5c8a", "#ff8fab", "#ffc2d1"],
  sparkles: ["#fff6d6", "#ffe08a", "#ffffff"],
  snow: ["#ffffff", "#eaf2ff"],
  bats: ["#0d0a14", "#1a1426"],
};

export interface GlowParticlesProps {
  preset: GlowPreset;
  colors?: string[];
  /** 0–1 share of the budget (default 0.6). */
  density?: number;
  /** Speed multiplier (default 1). */
  speed?: number;
  fixed?: boolean;
  z?: number;
  style?: CSSProperties;
  className?: string;
}

interface P { x: number; y: number; vx: number; vy: number; s: number; z: number; rot: number; vr: number; ph: number; spr: number; layer: 0 | 1 | 2 }

const SPR = 96; // sprite canvas size (px) — drawn scaled.

function makeCanvas(w = SPR, h = SPR) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  return c;
}

function heartPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(cx, cy + r * 0.62);
  ctx.bezierCurveTo(cx - r * 1.25, cy - r * 0.1, cx - r * 0.55, cy - r * 1.05, cx, cy - r * 0.38);
  ctx.bezierCurveTo(cx + r * 0.55, cy - r * 1.05, cx + r * 1.25, cy - r * 0.1, cx, cy + r * 0.62);
  ctx.closePath();
}

/** Pre-render the sprite set for a preset (one or more frames per colour). */
function buildSprites(preset: GlowPreset, colors: string[]): HTMLCanvasElement[] {
  const out: HTMLCanvasElement[] = [];
  const m = SPR / 2;
  for (const col of colors) {
    if (preset === "embers" || preset === "fireflies" || preset === "snow") {
      const c = makeCanvas(); const x = c.getContext("2d")!;
      const g = x.createRadialGradient(m, m, 0, m, m, m);
      const core = preset === "snow" ? 0.95 : 1;
      g.addColorStop(0, hexA("#ffffff", core));
      g.addColorStop(0.12, hexA(col, 0.95));
      g.addColorStop(0.35, hexA(col, preset === "snow" ? 0.25 : 0.35));
      g.addColorStop(1, hexA(col, 0));
      x.fillStyle = g; x.fillRect(0, 0, SPR, SPR);
      out.push(c);
    } else if (preset === "sparkles") {
      const c = makeCanvas(); const x = c.getContext("2d")!;
      const g = x.createRadialGradient(m, m, 0, m, m, m * 0.5);
      g.addColorStop(0, hexA(col, 0.9)); g.addColorStop(1, hexA(col, 0));
      x.fillStyle = g; x.fillRect(0, 0, SPR, SPR);
      x.globalCompositeOperation = "lighter";
      const ray = (len: number, thick: number, ang: number) => {
        x.save(); x.translate(m, m); x.rotate(ang);
        const lg = x.createLinearGradient(-len, 0, len, 0);
        lg.addColorStop(0, hexA(col, 0)); lg.addColorStop(0.5, "#ffffff"); lg.addColorStop(1, hexA(col, 0));
        x.fillStyle = lg; x.beginPath(); x.ellipse(0, 0, len, thick, 0, 0, 6.283); x.fill(); x.restore();
      };
      ray(m * 0.95, 1.5, 0); ray(m * 0.95, 1.5, Math.PI / 2); ray(m * 0.4, 1, Math.PI / 4); ray(m * 0.4, 1, -Math.PI / 4);
      out.push(c);
    } else if (preset === "petals") {
      // A cupped petal: body gradient, darker base, a light vein, a faint rim.
      const c = makeCanvas(); const x = c.getContext("2d")!;
      x.translate(m, m);
      x.beginPath();
      x.moveTo(0, -m * 0.78);
      x.bezierCurveTo(m * 0.7, -m * 0.7, m * 0.72, m * 0.35, 0, m * 0.8);
      x.bezierCurveTo(-m * 0.72, m * 0.35, -m * 0.7, -m * 0.7, 0, -m * 0.78);
      const g = x.createLinearGradient(-m * 0.6, -m * 0.8, m * 0.5, m * 0.8);
      g.addColorStop(0, hexA("#ffffff", 0.9)); g.addColorStop(0.25, hexA(col, 1)); g.addColorStop(1, hexA(col, 0.85));
      x.fillStyle = g; x.fill();
      x.globalCompositeOperation = "source-atop";
      const b = x.createRadialGradient(0, m * 0.85, 0, 0, m * 0.85, m * 0.9);
      b.addColorStop(0, "rgba(90,0,20,.45)"); b.addColorStop(1, "rgba(90,0,20,0)");
      x.fillStyle = b; x.fillRect(-m, -m, SPR, SPR);
      x.strokeStyle = "rgba(255,255,255,.35)"; x.lineWidth = 1.2;
      x.beginPath(); x.moveTo(0, m * 0.7); x.quadraticCurveTo(-m * 0.08, 0, 0, -m * 0.55); x.stroke();
      out.push(c);
    } else if (preset === "hearts") {
      const c = makeCanvas(); const x = c.getContext("2d")!;
      x.shadowColor = hexA(col, 0.8); x.shadowBlur = 10;
      heartPath(x, m, m + 2, m * 0.62);
      const g = x.createLinearGradient(0, m * 0.3, 0, SPR * 0.9);
      g.addColorStop(0, hexA("#ffffff", 0.95)); g.addColorStop(0.3, hexA(col, 1)); g.addColorStop(1, hexA(col, 0.9));
      x.fillStyle = g; x.fill();
      x.shadowBlur = 0;
      x.fillStyle = "rgba(255,255,255,.55)";
      x.beginPath(); x.ellipse(m - m * 0.28, m - m * 0.18, m * 0.13, m * 0.07, -0.6, 0, 6.283); x.fill();
      out.push(c);
    } else if (preset === "bats") {
      // 4 flap frames, a silhouette with a faint rim light.
      for (let f = 0; f < 4; f++) {
        const c = makeCanvas(); const x = c.getContext("2d")!;
        const flap = [1, 0.4, -0.5, 0.4][f];
        x.translate(m, m);
        const wing = (dir: number) => {
          x.moveTo(0, 0);
          x.quadraticCurveTo(dir * m * 0.35, -m * 0.55 * flap - 4, dir * m * 0.9, -m * 0.35 * flap);
          x.quadraticCurveTo(dir * m * 0.75, m * 0.05, dir * m * 0.62, m * 0.12);
          x.quadraticCurveTo(dir * m * 0.5, m * 0.02, dir * m * 0.4, m * 0.16);
          x.quadraticCurveTo(dir * m * 0.28, m * 0.06, dir * m * 0.16, m * 0.18);
          x.quadraticCurveTo(dir * m * 0.06, m * 0.12, 0, m * 0.14);
        };
        x.beginPath(); wing(-1); wing(1);
        x.ellipse(0, m * 0.04, m * 0.09, m * 0.15, 0, 0, 6.283);
        x.shadowColor = "rgba(255,170,90,.35)"; x.shadowBlur = 6;
        x.fillStyle = col; x.fill();
        out.push(c);
      }
    }
  }
  return out;
}

function spawn(preset: GlowPreset, w: number, h: number, n: number, initial: boolean, i: number): P {
  // Layer split: 0 far (blurred) 55%, 1 mid (sharp) 38%, 2 near bokeh (blurred, huge) 7%.
  const roll = (i * 0.6180339) % 1;
  const layer: 0 | 1 | 2 = roll < 0.55 ? 0 : roll < 0.93 ? 1 : 2;
  const z = layer === 0 ? 0.35 + Math.random() * 0.25 : layer === 1 ? 0.75 + Math.random() * 0.3 : 1.9 + Math.random() * 0.8;
  const up = preset === "embers" || preset === "fireflies";
  const p: P = {
    x: Math.random() * w, y: initial ? Math.random() * h : up ? h + 40 : -40,
    vx: 0, vy: 0, s: 1, z, rot: Math.random() * 6.283, vr: 0, ph: Math.random() * 100, spr: Math.floor(Math.random() * n), layer,
  };
  switch (preset) {
    case "petals": p.s = 20; p.vx = 0.25 + Math.random() * 0.4; p.vy = 0.45 + Math.random() * 0.5; p.vr = (Math.random() - 0.5) * 0.03; break;
    case "hearts": p.s = 30; p.vx = (Math.random() - 0.5) * 0.2; p.vy = -(0.3 + Math.random() * 0.35); if (!initial) p.y = h + 40; break;
    case "embers": p.s = 14; p.vx = (Math.random() - 0.5) * 0.3; p.vy = -(0.5 + Math.random() * 0.9); break;
    case "fireflies": p.s = 22; p.vx = (Math.random() - 0.5) * 0.3; p.vy = -(0.05 + Math.random() * 0.2); break;
    case "sparkles": p.s = 26; p.y = Math.random() * h; p.vy = -0.04; break;
    case "snow": p.s = 12; p.vx = (Math.random() - 0.5) * 0.3; p.vy = 0.35 + Math.random() * 0.45; break;
    case "bats": p.s = 64; p.x = initial ? p.x : -60; p.y = Math.random() * h * 0.7; p.vx = 0.9 + Math.random() * 1.2; p.vy = (Math.random() - 0.5) * 0.3; break;
  }
  return p;
}

export default function GlowParticles({ preset, colors, density = 0.6, speed = 1, fixed = true, z = 1, style, className }: GlowParticlesProps) {
  const farRef = useRef<HTMLCanvasElement>(null);
  const nearRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();
  const colorKey = (colors ?? GLOW_COLORS[preset]).join("|");
  const sp = useRef(speed);
  useEffect(() => { sp.current = speed; }, [speed]);

  useEffect(() => {
    const far = farRef.current, near = nearRef.current;
    if (!far || !near) return;
    const fx = far.getContext("2d"), nx = near.getContext("2d");
    if (!fx || !nx) return;
    const sprites = buildSprites(preset, colorKey.split("|"));
    const frames = preset === "bats" ? 4 : 1;
    const variants = sprites.length / frames;
    const additive = preset === "embers" || preset === "fireflies" || preset === "sparkles" || preset === "snow";
    let w = 0, h = 0, raf = 0, visible = !document.hidden, onScreen = true;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const resize = () => {
      w = near.clientWidth; h = near.clientHeight;
      for (const [c, x] of [[far, fx], [near, nx]] as const) {
        c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
        x.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    };
    resize();
    const budget = Math.round((window.innerWidth >= 1024 ? 160 : 90) * Math.max(0, Math.min(1, density)) * (preset === "bats" ? 0.16 : 1));
    const ps: P[] = Array.from({ length: budget }, (_, i) => spawn(preset, w, h, variants, true, i));

    const drawOne = (ctx: CanvasRenderingContext2D, p: P, t: number) => {
      let a = p.layer === 0 ? 0.55 : p.layer === 2 ? 0.35 : 0.95;
      let frame = 0;
      if (preset === "fireflies") a *= 0.25 + 0.75 * Math.max(0, Math.sin(t / 700 + p.ph));
      else if (preset === "embers") a *= 0.6 + 0.4 * Math.sin(t / 110 + p.ph * 7);
      else if (preset === "sparkles") a *= Math.max(0, Math.sin(t / 1100 + p.ph)) ** 3;
      else if (preset === "bats") frame = Math.floor(t / 70 + p.ph) % 4;
      if (a <= 0.01) return;
      const img = sprites[p.spr * frames + frame];
      const s = p.s * p.z;
      ctx.globalAlpha = Math.min(1, a);
      if (preset === "petals" || preset === "hearts") {
        // Petals tumble: rotate + squash on one axis to fake the 3D flip.
        const flip = preset === "petals" ? Math.cos(t / 900 + p.ph) : 1;
        ctx.setTransform(dpr * Math.cos(p.rot), dpr * Math.sin(p.rot), -dpr * Math.sin(p.rot) * flip, dpr * Math.cos(p.rot) * flip, p.x * dpr, p.y * dpr);
        ctx.drawImage(img, -s / 2, -s / 2, s, s);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      } else ctx.drawImage(img, p.x - s / 2, p.y - s / 2, s, s);
    };

    let last = performance.now();
    const frame = (now: number) => {
      raf = 0;
      const dt = Math.min(3, (now - last) / 16.67) * sp.current;
      last = now;
      fx.clearRect(0, 0, w, h); nx.clearRect(0, 0, w, h);
      fx.globalCompositeOperation = nx.globalCompositeOperation = additive ? "lighter" : "source-over";
      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];
        if (!reduce) {
          const sway = preset === "petals" || preset === "snow" || preset === "fireflies" ? Math.sin(now / 1300 + p.ph) * 0.35 : 0;
          p.x += (p.vx + sway) * p.z * dt;
          p.y += p.vy * p.z * dt + (preset === "bats" ? Math.sin(now / 400 + p.ph) * 0.4 * dt : 0);
          p.rot += p.vr * dt;
          if (p.y < -80 || p.y > h + 80 || p.x < -90 || p.x > w + 90) ps[i] = spawn(preset, w, h, variants, false, i);
        }
        drawOne(p.layer === 1 ? nx : fx, ps[i], now);
      }
      fx.globalAlpha = nx.globalAlpha = 1;
      if (!reduce && visible && onScreen) raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (!raf && visible && onScreen && !reduce) { last = performance.now(); raf = requestAnimationFrame(frame); }
    };
    const onVis = () => { visible = !document.hidden; kick(); };
    const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; kick(); });
    io.observe(near);
    const ro = new ResizeObserver(() => { resize(); if (reduce) frame(performance.now()); });
    ro.observe(near);
    document.addEventListener("visibilitychange", onVis);
    raf = requestAnimationFrame(frame);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      io.disconnect(); ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [preset, colorKey, density, reduce]);

  const pos: CSSProperties = { position: fixed ? "fixed" : "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" };
  return (
    <div aria-hidden className={className} style={{ ...pos, zIndex: z, ...style }}>
      <canvas ref={farRef} style={{ ...pos, position: "absolute", filter: "blur(2.5px)" }} />
      <canvas ref={nearRef} style={{ ...pos, position: "absolute" }} />
    </div>
  );
}
