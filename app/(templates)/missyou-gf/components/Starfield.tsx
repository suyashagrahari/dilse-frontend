"use client";

import { useEffect, useRef } from "react";
import { NIGHT } from "./theme";

interface Star { x: number; y: number; r: number; base: number; tw: number; phase: number; vy: number }
interface FloatHeart { x: number; y: number; size: number; vy: number; sway: number; phase: number; opacity: number }

/**
 * Ambient drifting starfield + a few floating hearts on a single canvas.
 * Decorative only (aria-hidden, pointer-events:none). Honors prefers-reduced-motion:
 * a static twinkle field with no drift and no hearts. Animation is paused when
 * `active` is false (e.g. before the envelope opens) to save the main thread.
 */
export default function Starfield({ active = true, tint = NIGHT.indigoLt }: { active?: boolean; tint?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;

    let w = 0, h = 0, dpr = 1;
    let stars: Star[] = [];
    let hearts: FloatHeart[] = [];

    const build = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(120, Math.floor((w * h) / 9000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.3 + 0.3,
        base: Math.random() * 0.5 + 0.35,
        tw: Math.random() * 0.4 + 0.15,
        phase: Math.random() * Math.PI * 2,
        vy: (Math.random() * 0.12 + 0.03),
      }));
      hearts = reduced ? [] : Array.from({ length: 6 }, () => ({
        x: Math.random() * w,
        y: h + Math.random() * h,
        size: Math.random() * 10 + 8,
        vy: Math.random() * 0.25 + 0.15,
        sway: Math.random() * 0.6 + 0.2,
        phase: Math.random() * Math.PI * 2,
        opacity: Math.random() * 0.25 + 0.12,
      }));
    };

    const drawHeart = (x: number, y: number, s: number, o: number) => {
      ctx.save();
      ctx.globalAlpha = o;
      ctx.fillStyle = NIGHT.pinkLt;
      ctx.beginPath();
      const t = s / 16;
      ctx.moveTo(x, y + 4 * t);
      ctx.bezierCurveTo(x, y, x - 5 * t, y - 3 * t, x - 8 * t, y + 1 * t);
      ctx.bezierCurveTo(x - 12 * t, y + 5 * t, x - 4 * t, y + 11 * t, x, y + 14 * t);
      ctx.bezierCurveTo(x + 4 * t, y + 11 * t, x + 12 * t, y + 5 * t, x + 8 * t, y + 1 * t);
      ctx.bezierCurveTo(x + 5 * t, y - 3 * t, x, y, x, y + 4 * t);
      ctx.fill();
      ctx.restore();
    };

    let time = 0;
    const render = () => {
      ctx.clearRect(0, 0, w, h);
      time += reduced ? 0 : 0.016;
      for (const s of stars) {
        const twinkle = reduced ? s.base : s.base + Math.sin(time * 2 + s.phase) * s.tw;
        ctx.globalAlpha = Math.max(0.08, Math.min(1, twinkle));
        ctx.fillStyle = Math.random() > 0.985 ? NIGHT.amber : tint;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        if (!reduced) {
          s.y -= s.vy;
          if (s.y < -2) { s.y = h + 2; s.x = Math.random() * w; }
        }
      }
      ctx.globalAlpha = 1;
      if (!reduced) {
        for (const hs of hearts) {
          hs.y -= hs.vy;
          hs.x += Math.sin(time + hs.phase) * hs.sway * 0.4;
          if (hs.y < -20) { hs.y = h + 20; hs.x = Math.random() * w; }
          drawHeart(hs.x, hs.y, hs.size, hs.opacity);
        }
      }
      rafRef.current = requestAnimationFrame(render);
    };

    build();
    if (reduced || !active) {
      render(); // one static frame
      if (reduced || !active) { if (rafRef.current) cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    } else {
      rafRef.current = requestAnimationFrame(render);
    }

    const onResize = () => build();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active, tint]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    />
  );
}
