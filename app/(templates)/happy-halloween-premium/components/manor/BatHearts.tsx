"use client";

// The wow, after YES: a flock of bats bursts off the clock tower, and each bat
// explodes into sparks that fly into place as firework hearts spelling both
// initials ("M ♥ A"), shimmer, then drift down like embers. One short-lived
// Canvas2D (DPR ≤ 2, ~200 sprites, stops itself after ~8 s). Reduced motion:
// the formed initials simply fade in and out — no flight, no flashes.

import { useEffect, useRef } from "react";

interface Spark { x: number; y: number; sx: number; sy: number; tx: number; ty: number; c: string; d: number; r: number; tw: number }
interface Flyer { x: number; y: number; vx: number; vy: number; s: number; ph: number }
interface Pop { x: number; y: number; t0: number; c: string }

const COLORS = ["#FFC86B", "#FFB3A7", "#FFE6A0", "#7FF5D8", "#FF8FB1"];

function targets(text: string, w: number, h: number, family: string): { x: number; y: number }[] {
  const c = document.createElement("canvas");
  const cw = 640;
  const ch = 220;
  c.width = cw;
  c.height = ch;
  const g = c.getContext("2d");
  if (!g) return [];
  g.fillStyle = "#fff";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.font = `700 180px ${family}, Georgia, serif`;
  g.fillText(text, cw / 2, ch / 2 + 8);
  const data = g.getImageData(0, 0, cw, ch).data;
  const scale = Math.min((w * 0.9) / cw, 1.1);
  const ox = w / 2 - (cw * scale) / 2;
  const oy = h * 0.3 - (ch * scale) / 2;
  const max = w < 600 ? 210 : 300;
  // The finest grid that fits the budget keeps the letters evenly dotted.
  let out: { x: number; y: number }[] = [];
  for (let step = 4; step <= 14; step++) {
    out = [];
    for (let y = 0; y < ch; y += step)
      for (let x = (y / step) % 2 ? step / 2 : 0; x < cw; x += step) if (data[(Math.floor(y) * cw + Math.floor(x)) * 4 + 3] > 140) out.push({ x: ox + x * scale, y: oy + y * scale });
    if (out.length <= max) break;
  }
  return out;
}

function heartPath(g: CanvasRenderingContext2D, x: number, y: number, r: number) {
  g.beginPath();
  g.moveTo(x, y + r * 0.35);
  g.bezierCurveTo(x - r, y - r * 0.4, x - r * 0.4, y - r * 1.1, x, y - r * 0.45);
  g.bezierCurveTo(x + r * 0.4, y - r * 1.1, x + r, y - r * 0.4, x, y + r * 0.35);
  g.fill();
}

export default function BatHearts({ a, b, origin, reduce }: { a: string; b: string; origin: { x: number; y: number }; reduce: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const g = cv.getContext("2d");
    if (!g) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = window.innerWidth;
    const h = window.innerHeight;
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const text = `${a} ♥ ${b}`.trim();
    const fam = getComputedStyle(cv).getPropertyValue("--font-mm-engraved").trim() || "Georgia";
    const T = targets(text, w, h, fam);
    const ox = origin.x;
    const oy = origin.y;
    const flyers: Flyer[] = Array.from({ length: reduce ? 0 : 22 }, (_, i) => {
      const ang = -Math.PI / 2 + (i / 21 - 0.5) * Math.PI * 1.5 + (Math.random() - 0.5) * 0.3;
      const sp = 2.2 + Math.random() * 2.4;
      return { x: ox, y: oy, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, s: 7 + Math.random() * 6, ph: Math.random() * 6 };
    });
    const sparks: Spark[] = [];
    const pops: Pop[] = [];
    let burst = false;
    const t0 = performance.now();
    const BURST = reduce ? 0 : 950;
    const FLY = 1400;
    let raf = 0;

    const doBurst = (now: number) => {
      burst = true;
      T.forEach((p, i) => {
        const f = flyers[i % Math.max(1, flyers.length)] ?? { x: p.x, y: p.y };
        sparks.push({ x: f.x, y: f.y, sx: f.x, sy: f.y, tx: p.x, ty: p.y, c: COLORS[i % COLORS.length], d: Math.random() * 380, r: 1.8 + Math.random() * 1.2, tw: Math.random() * 6 });
      });
      flyers.forEach((f, i) => pops.push({ x: f.x, y: f.y, t0: now + (i % 5) * 40, c: COLORS[i % COLORS.length] }));
    };

    const frame = (now: number) => {
      const t = now - t0;
      g.clearRect(0, 0, w, h);
      if (!burst && t >= BURST) doBurst(now);
      if (!burst) {
        for (const f of flyers) {
          f.x += f.vx;
          f.y += f.vy;
          f.vy += 0.01;
          const flap = Math.sin(now / 55 + f.ph);
          g.save();
          g.translate(f.x, f.y);
          g.fillStyle = "#120D1E";
          g.strokeStyle = "rgba(255,200,107,.55)";
          g.lineWidth = 1;
          g.beginPath();
          g.moveTo(0, 0);
          g.quadraticCurveTo(-f.s, -f.s * flap, -f.s * 1.7, 0);
          g.quadraticCurveTo(-f.s * 0.8, f.s * 0.25, 0, f.s * 0.3);
          g.quadraticCurveTo(f.s * 0.8, f.s * 0.25, f.s * 1.7, 0);
          g.quadraticCurveTo(f.s, -f.s * flap, 0, 0);
          g.fill();
          g.stroke();
          g.restore();
        }
      }
      // bursts
      for (const p of pops) {
        const k = (now - p.t0) / 700;
        if (k < 0 || k > 1) continue;
        g.globalAlpha = 1 - k;
        g.strokeStyle = p.c;
        g.lineWidth = 2;
        for (let j = 0; j < 10; j++) {
          const a2 = (j / 10) * Math.PI * 2;
          const r1 = 6 + k * 34;
          const r2 = r1 + 7;
          g.beginPath();
          g.moveTo(p.x + Math.cos(a2) * r1, p.y + Math.sin(a2) * r1);
          g.lineTo(p.x + Math.cos(a2) * r2, p.y + Math.sin(a2) * r2);
          g.stroke();
        }
        g.globalAlpha = 1;
      }
      // sparks → initials
      if (burst) {
        const end = BURST + FLY + 3600;
        const fall = Math.max(0, (t - end) / 2200);
        for (const s of sparks) {
          const k = reduce ? 1 : Math.min(1, Math.max(0, (t - BURST - s.d) / FLY));
          const e = 1 - Math.pow(1 - k, 3);
          s.x = s.sx + (s.tx - s.sx) * e;
          s.y = s.sy + (s.ty - s.sy) * e + fall * fall * 120;
          const fadeIn = reduce ? Math.min(1, t / 600) : 1;
          const tw = 0.65 + 0.35 * Math.sin(now / 160 + s.tw);
          g.globalAlpha = Math.max(0, (1 - fall) * fadeIn * (k < 1 ? 1 : tw));
          g.fillStyle = s.c;
          if (k >= 1) heartPath(g, s.x, s.y, s.r * 1.45);
          else {
            g.beginPath();
            g.arc(s.x, s.y, s.r, 0, 6.283);
            g.fill();
          }
          g.globalAlpha *= 0.12;
          g.beginPath();
          g.arc(s.x, s.y, s.r * 2, 0, 6.283);
          g.fill();
        }
        g.globalAlpha = 1;
        if (fall >= 1) {
          g.clearRect(0, 0, w, h);
          return;
        }
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [a, b, origin.x, origin.y, reduce]);

  return <canvas ref={ref} aria-hidden style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", pointerEvents: "none", zIndex: 40 }} />;
}
