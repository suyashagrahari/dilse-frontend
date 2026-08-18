"use client";

import { useEffect, useRef } from "react";

import { rngFrom } from "@/lib/seededRandom";
import { ACCENT, ACCENT_DIM, TEXT } from "./theme";

// ─── One-shot celebration ────────────────────────────────────────────────────
//
// Canvas 2D, ~1.2s, fired by flipping `fire` false → true.
//
// Every number below comes out of a seeded generator, never Math.random(). Two
// reasons: a re-render must not reshuffle the burst mid-flight, and the whole
// template holds the rule that nothing visual is allowed to differ between one
// render and the next — that is what keeps the exported card honest.
//
// Warm and restrained on purpose. This lands under a line of text somebody
// meant, not over a game-show win.

export interface ParticlesProps {
  /** Flip false → true to fire. */
  fire: boolean;
  /** Stable seed so the burst is identical across re-renders. */
  seed: string;
  reducedMotion: boolean;
}

const DURATION_MS = 1200;
const COUNT = 78;
const GRAVITY = 980; // px/s²
const DRAG = 1.5; // per second

/** Accent family only — the amber, its dim step, and a near-white spark. */
const PALETTE = [ACCENT, ACCENT, ACCENT_DIM, TEXT];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  spin: number;
  size: number;
  life: number;
  colour: string;
  round: boolean;
}

export default function Particles({ fire, seed, reducedMotion }: ParticlesProps) {
  // Reduced motion removes this entirely. It is pure decoration: the
  // confirmation line it accompanies is rendered by the finale either way.
  if (reducedMotion) return null;
  return <ParticleCanvas fire={fire} seed={seed} />;
}

function ParticleCanvas({ fire, seed }: { fire: boolean; seed: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!fire) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;

    const resize = () => {
      const dpr = Math.min(3, Math.max(1, window.devicePixelRatio || 1));
      const rect = parent.getBoundingClientRect();
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const rand = rngFrom(`${seed}::burst`);
    const originX = w / 2;
    const originY = h * 0.6;

    const parts: Particle[] = [];
    for (let i = 0; i < COUNT; i++) {
      // A wide upward cone, biased so the fan reads as a bloom, not a fountain.
      const angle = -Math.PI / 2 + (rand() - 0.5) * 2.1;
      const speed = 220 + rand() * 400;
      parts.push({
        x: originX + (rand() - 0.5) * 26,
        y: originY + (rand() - 0.5) * 14,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rot: rand() * Math.PI * 2,
        spin: (rand() - 0.5) * 9,
        size: 2.2 + rand() * 4.4,
        life: 0.72 + rand() * 0.48,
        colour: PALETTE[Math.floor(rand() * PALETTE.length)],
        round: rand() < 0.42,
      });
    }

    let raf = 0;
    let dead = false;
    const start = performance.now();
    let last = start;

    const frame = (now: number) => {
      if (dead) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const elapsed = now - start;

      ctx.clearRect(0, 0, w, h);

      for (const p of parts) {
        const age = elapsed / 1000;
        if (age > p.life) continue;
        p.vy += GRAVITY * dt;
        p.vx -= p.vx * DRAG * dt;
        p.vy -= p.vy * DRAG * dt * 0.35;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.spin * dt;

        const t = age / p.life;
        // Hold, then fall away over the last 45% of the life.
        const alpha = t < 0.55 ? 1 : 1 - (t - 0.55) / 0.45;
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha)) * 0.92;
        ctx.fillStyle = p.colour;

        if (p.round) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillRect(-p.size * 0.5, -p.size * 1.5, p.size, p.size * 3);
          ctx.restore();
        }
      }
      ctx.globalAlpha = 1;

      if (elapsed >= DURATION_MS) {
        // Stop rather than idle a rAF forever.
        ctx.clearRect(0, 0, w, h);
        dead = true;
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    window.addEventListener("resize", resize);

    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      ctx.clearRect(0, 0, w, h);
    };
  }, [fire, seed]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    />
  );
}
