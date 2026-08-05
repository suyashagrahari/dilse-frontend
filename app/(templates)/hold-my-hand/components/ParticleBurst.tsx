"use client";

/**
 * The photo dissolving into light at 100%. Plain canvas, no library.
 * Runs for ~1.6s and then stops itself — it starts only after the hold engine
 * has finished, so the two loops never overlap in a meaningful way.
 */

import { useEffect, useRef } from "react";

interface P { x: number; y: number; vx: number; vy: number; r: number; life: number; hue: number }

export default function ParticleBurst({
  radiusRatio = 0.34,
  onDone,
}: {
  /**
   * Emission radius as a fraction of the canvas's own half-width, so the ring of
   * particles always starts on the photo's edge and never outside the canvas.
   */
  radiusRatio?: number;
  onDone?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) { doneRef.current?.(); return; }

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.scale(dpr, dpr);

    const cx = w / 2;
    const cy = h / 2;
    const radius = (w / 2) * radiusRatio;
    const parts: P[] = [];
    const N = 180;
    for (let i = 0; i < N; i++) {
      const a = Math.random() * Math.PI * 2;
      const rr = radius * (0.55 + Math.random() * 0.5);
      const speed = 40 + Math.random() * 190;
      parts.push({
        x: cx + Math.cos(a) * rr,
        y: cy + Math.sin(a) * rr,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed - 40,
        r: 1 + Math.random() * 2.6,
        life: 0.75 + Math.random() * 0.85,
        // indigo → pink → lime, the brand ramp
        hue: [258, 330, 78][Math.floor(Math.random() * 3)],
      });
    }

    let raf = 0;
    let last = performance.now();
    let elapsed = 0;

    const tick = (ts: number) => {
      const dt = Math.min(0.05, (ts - last) / 1000);
      last = ts;
      elapsed += dt;
      ctx.clearRect(0, 0, w, h);
      let alive = 0;
      for (const p of parts) {
        p.life -= dt;
        if (p.life <= 0) continue;
        alive++;
        p.vy += 90 * dt;      // a little gravity so it settles rather than sprays
        p.vx *= 1 - 1.1 * dt; // drag
        p.vy *= 1 - 1.1 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
        ctx.fillStyle = `hsl(${p.hue} 92% 68%)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (alive > 0 && elapsed < 2.4) raf = requestAnimationFrame(tick);
      else doneRef.current?.();
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [radiusRatio]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden />;
}
