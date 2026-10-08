"use client";

// ─── <Shatter> — the set heart bursting into ~16 shards (one canvas) ────────
//
// The heart is painted once onto an offscreen canvas (gradient shell, gloss,
// embossed initials), then cut into Voronoi cells from fixed seeds (computed
// once at module level by half-plane clipping — no library) and every shard is
// thrown with simple 2D rigid-body motion: gravity, spin, one floor bounce
// (damping 0.4), a settle and a fade. Each landing calls onLand(x) for the
// tinkle cue. Mounted only for the smash; DPR ≤ 2; stops itself.

import { useEffect, useRef } from "react";
import { HEART_D } from "./art";

type P = [number, number];
const SEEDS: P[] = [
  [50, 46], [34, 30], [66, 30], [20, 38], [80, 38], [28, 54], [72, 54], [42, 64], [58, 64],
  [50, 80], [14, 26], [86, 26], [40, 18], [60, 18], [50, 30], [36, 44], [64, 44],
];

function clip(poly: P[], a: P, b: P): P[] {
  // keep points closer to a than to b
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
  const nx = b[0] - a[0], ny = b[1] - a[1];
  const side = (p: P) => (p[0] - mx) * nx + (p[1] - my) * ny; // ≤ 0 = inside
  const out: P[] = [];
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i], q = poly[(i + 1) % poly.length];
    const sp = side(p), sq = side(q);
    if (sp <= 0) out.push(p);
    if ((sp <= 0) !== (sq <= 0)) {
      const t = sp / (sp - sq);
      out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]);
    }
  }
  return out;
}

const CELLS: P[][] = SEEDS.map((s, i) => {
  let poly: P[] = [[0, 0], [100, 0], [100, 100], [0, 100]];
  SEEDS.forEach((o, j) => {
    if (i !== j) poly = clip(poly, s, o);
  });
  return poly;
});

export function paintHeart(ctx: CanvasRenderingContext2D, size: number, marks: string[]) {
  const k = size / 100;
  ctx.save();
  ctx.scale(k, k);
  const heart = new Path2D(HEART_D);
  const g = ctx.createRadialGradient(36, 30, 4, 50, 50, 62);
  g.addColorStop(0, "#9a5d3b");
  g.addColorStop(0.45, "#5b3020");
  g.addColorStop(1, "#24100a");
  ctx.fillStyle = g;
  ctx.fill(heart);
  ctx.clip(heart);
  // gloss
  const gl = ctx.createLinearGradient(10, 10, 60, 60);
  gl.addColorStop(0, "rgba(255,230,200,.55)");
  gl.addColorStop(0.35, "rgba(255,230,200,0)");
  ctx.fillStyle = gl;
  ctx.fillRect(0, 0, 100, 100);
  ctx.strokeStyle = "rgba(255,220,190,.18)";
  ctx.lineWidth = 2.4;
  ctx.stroke(heart);
  if (marks.length) {
    ctx.font = "700 15px Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const txt = marks.join(" ♥ ");
    ctx.fillStyle = "rgba(0,0,0,.35)";
    ctx.fillText(txt, 50.6, 47.6);
    ctx.fillStyle = "rgba(255,214,170,.42)";
    ctx.fillText(txt, 50, 47);
  }
  ctx.restore();
}

interface Shard {
  poly: P[];
  cx: number; cy: number; x: number; y: number; vx: number; vy: number; r: number; vr: number; bounced: boolean; rest: boolean;
}

export default function Shatter({ size, marks, onLand, className }: { size: number; marks: string[]; onLand?: (xNorm: number) => void; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const landRef = useRef(onLand);
  useEffect(() => {
    landRef.current = onLand;
  });
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = cv.clientWidth, H = cv.clientHeight;
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const off = document.createElement("canvas");
    off.width = Math.round(size * dpr);
    off.height = Math.round(size * dpr);
    const octx = off.getContext("2d");
    if (!octx) return;
    octx.scale(dpr, dpr);
    paintHeart(octx, size, marks);
    const ox = (W - size) / 2, oy = (H - size) / 2;
    const k = size / 100;
    const floor = H - 10;
    const shards: Shard[] = CELLS.filter((p) => p.length > 2).map((poly) => {
      const cx = poly.reduce((s, p) => s + p[0], 0) / poly.length;
      const cy = poly.reduce((s, p) => s + p[1], 0) / poly.length;
      const dx = cx - 50, dy = cy - 48;
      const d = Math.max(6, Math.hypot(dx, dy));
      const sp = 3.2 + Math.random() * 3.4;
      return { poly, cx, cy, x: ox + cx * k, y: oy + cy * k, vx: (dx / d) * sp * (W / 420), vy: (dy / d) * sp - 5.5 - Math.random() * 3, r: 0, vr: (Math.random() - 0.5) * 0.26, bounced: false, rest: false };
    });
    let raf = 0;
    let t0 = 0;
    let lands = 0;
    const draw = (now: number) => {
      if (!t0) t0 = now;
      const age = (now - t0) / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const fade = age > 2.1 ? Math.max(0, 1 - (age - 2.1) / 0.9) : 1;
      ctx.globalAlpha = fade;
      for (const s of shards) {
        if (!s.rest) {
          s.vy += 0.42;
          s.x += s.vx;
          s.y += s.vy;
          s.r += s.vr;
          if (s.y > floor) {
            s.y = floor;
            if (!s.bounced) {
              s.bounced = true;
              s.vy *= -0.4;
              s.vx *= 0.6;
              s.vr *= 0.5;
              if (lands++ < 8) landRef.current?.(s.x / W);
            } else {
              s.vy = 0;
              s.vx *= 0.8;
              s.vr *= 0.7;
              if (Math.abs(s.vx) < 0.05) s.rest = true;
            }
          }
        }
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.r);
        ctx.beginPath();
        s.poly.forEach((p, i) => {
          const px = (p[0] - s.cx) * k, py = (p[1] - s.cy) * k;
          if (i) ctx.lineTo(px, py);
          else ctx.moveTo(px, py);
        });
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(off, -s.cx * k, -s.cy * k, size, size);
        ctx.restore();
      }
      if (age < 3.1) raf = requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, W, H);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <canvas ref={ref} className={className} aria-hidden style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 5 }} />;
}
