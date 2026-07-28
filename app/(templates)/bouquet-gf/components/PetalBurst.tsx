"use client";

import { useEffect, useRef } from "react";

const COLORS = ["#ff8fb1", "#b8a4f0", "#ffe08a", "#a8e6cf", "#ffb3c8", "#c9b6f5", "#fff2c4"];

interface Petal {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rot: number;
  vr: number;
  color: string;
  life: number;
  ttl: number;
}

/**
 * A full-screen pastel petal/confetti burst — the recipient's signature "it
 * bloomed for you" moment. Re-fires whenever `trigger` increments. Draws petals
 * from a few origin points across the middle of the screen with gravity + drift,
 * fading out over ~4.5s, then cleans itself up. Skipped under reduced-motion.
 */
export default function PetalBurst({ trigger }: { trigger: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!trigger) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.scale(dpr, dpr);

    const origins = [
      { x: W * 0.5, y: H * 0.42 },
      { x: W * 0.2, y: H * 0.5 },
      { x: W * 0.8, y: H * 0.5 },
      { x: W * 0.35, y: H * 0.38 },
      { x: W * 0.65, y: H * 0.38 },
    ];

    const petals: Petal[] = [];
    const COUNT = W < 480 ? 110 : 170;
    for (let i = 0; i < COUNT; i++) {
      const o = origins[i % origins.length];
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      petals.push({
        x: o.x,
        y: o.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        size: 6 + Math.random() * 8,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        color: COLORS[(Math.random() * COLORS.length) | 0],
        life: 0,
        ttl: 200 + Math.random() * 90, // ~3.3–4.8s at 60fps
      });
    }

    let running = true;
    const tick = () => {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      let alive = false;
      for (const p of petals) {
        if (p.life >= p.ttl) continue;
        alive = true;
        p.life++;
        p.vy += 0.08; // gravity
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        const fade = 1 - p.life / p.ttl;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, Math.min(1, fade * 1.4));
        ctx.fillStyle = p.color;
        // simple petal shape (rounded oval)
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      if (alive) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, W, H);
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [trigger]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 90 }}
    />
  );
}
