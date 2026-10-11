"use client";

// Pastel heart-shaped fireworks on a canvas (DPR ≤ 2, ≤ 6 bursts, stops by itself, paused when hidden).

import { useEffect, useRef } from "react";

const COLS = ["#FF4D6D", "#FFB3C6", "#FFD166", "#B9A7FF", "#FFFFFF", "#7FD8BE", "#FF8FAB"];

interface P { x: number; y: number; vx: number; vy: number; life: number; max: number; col: string; r: number }

export default function Fireworks({ play, bursts = 6 }: { play: boolean; bursts?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!play || !cv) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const size = () => {
      cv.width = cv.clientWidth * dpr;
      cv.height = cv.clientHeight * dpr;
    };
    size();
    window.addEventListener("resize", size);
    const ps: P[] = [];
    const W = () => cv.clientWidth;
    const H = () => cv.clientHeight;
    const boom = (k: number) => {
      const cx = W() * (0.2 + Math.random() * 0.6);
      const cy = H() * (0.14 + Math.random() * 0.3);
      const col = COLS[k % COLS.length];
      const n = 46;
      const s = Math.min(W(), H()) / 260;
      for (let i = 0; i < n; i++) {
        const t = (i / n) * Math.PI * 2;
        // The heart curve, scaled into a velocity field.
        const hx = 16 * Math.pow(Math.sin(t), 3);
        const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        ps.push({ x: cx, y: cy, vx: hx * 0.19 * s, vy: hy * 0.19 * s, life: 0, max: 70 + Math.random() * 20, col: i % 5 === 0 ? "#FFFFFF" : col, r: 1.6 + Math.random() * 1.6 });
      }
    };
    const timers: number[] = [];
    for (let k = 0; k < bursts; k++) timers.push(window.setTimeout(() => boom(k), k * 650 + (k ? Math.random() * 200 : 0)));
    let raf = 0;
    const end = performance.now() + bursts * 650 + 2600;
    const tick = (now: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W(), H());
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        p.life++;
        p.vx *= 0.965;
        p.vy = p.vy * 0.965 + 0.045;
        p.x += p.vx;
        p.y += p.vy;
        const a = 1 - p.life / p.max;
        if (a <= 0) {
          ps.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = a;
        ctx.fillStyle = p.col;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (now < end || ps.length) raf = requestAnimationFrame(tick);
    };
    const onVis = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      window.removeEventListener("resize", size);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [play, bursts]);
  return <canvas ref={ref} className="vc-fireworks" aria-hidden />;
}
