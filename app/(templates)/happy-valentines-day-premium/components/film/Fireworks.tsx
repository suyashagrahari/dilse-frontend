"use client";

// The YES fireworks (scene 9). One Canvas2D, DPR ≤ 2, a pooled budget of 600 sparks, additive blending.
// Four volleys of heart- and ring-shaped bursts, then the last volley WRITES THEIR INITIALS: the initials are
// drawn once on a small offscreen canvas, its lit pixels sampled into targets, and the sparks of the final
// shell fly to them, hang there glowing, then fall. Each launch whistles ("film-launch") and each burst
// cracks ("film-burst"), panned to where it bursts. Stops drawing when everything has burned out or the tab hides.

import { useEffect, useRef } from "react";

type P = { x: number; y: number; vx: number; vy: number; life: number; max: number; c: string; tx?: number; ty?: number; sx?: number; sy?: number; t?: number };
type Shell = { x: number; y: number; tx: number; ty: number; t: number; dur: number; kind: "heart" | "ring" | "text"; c: string[] };

const ROSE = ["#FF5C8A", "#FF8FB0", "#FFD1DC"];
const GOLD = ["#FFD36E", "#FFE7B3", "#FFB347"];
const MAX = 600;

function textTargets(text: string, family: string, w: number, h: number, cx: number, cy: number, budget: number): { pts: { x: number; y: number }[]; gap: number } {
  const oc = document.createElement("canvas");
  const W = 360;
  const H = 140;
  oc.width = W;
  oc.height = H;
  const g = oc.getContext("2d");
  if (!g) return { pts: [], gap: 4 };
  g.fillStyle = "#fff";
  g.textAlign = "center";
  g.textBaseline = "middle";
  let size = 120;
  g.font = `700 ${size}px ${family}`;
  while (g.measureText(text).width > W - 20 && size > 40) {
    size -= 6;
    g.font = `700 ${size}px ${family}`;
  }
  g.fillText(text, W / 2, H / 2 + 6);
  const data = g.getImageData(0, 0, W, H).data;
  const scale = Math.min((w * 0.8) / W, (h * 0.3) / H, 2.2);
  // Sample densely enough that the sparks sit ~5 px apart on screen, then thin evenly to the budget.
  const step = Math.max(2, Math.round(5 / scale));
  const pts: { x: number; y: number }[] = [];
  for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step) if (data[(y * W + x) * 4 + 3] > 140) pts.push({ x, y });
  const every = Math.max(1, Math.ceil(pts.length / budget));
  const keep = pts.filter((_, i) => i % every === 0);
  return { pts: keep.map((p) => ({ x: cx + (p.x - W / 2) * scale, y: cy + (p.y - H / 2) * scale })), gap: step * scale * Math.sqrt(every) };
}

export default function Fireworks({ text, onLaunch, onBurst, onWritten }: {
  text: string;
  onLaunch?: (pan: number) => void;
  onBurst?: (pan: number, big: boolean) => void;
  onWritten?: () => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const cb = useRef({ onLaunch, onBurst, onWritten });
  useEffect(() => {
    cb.current = { onLaunch, onBurst, onWritten };
  });

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let w = 0;
    let h = 0;
    const size = () => {
      const r = cv.getBoundingClientRect();
      w = r.width;
      h = r.height;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(cv);

    const ps: P[] = [];
    let dot = 2.4;
    const shells: Shell[] = [];
    const family = (getComputedStyle(cv).getPropertyValue("--fm-display").trim() || "Georgia") + ", Georgia, serif";
    const pan = (x: number) => Math.max(-1, Math.min(1, (x / Math.max(1, w)) * 2 - 1));

    const launch = (fx: number, fy: number, kind: Shell["kind"], c: string[]) => {
      const tx = fx * w;
      const ty = fy * h;
      shells.push({ x: tx + (Math.random() - 0.5) * 40, y: h + 10, tx, ty, t: 0, dur: 0.8, kind, c });
      cb.current.onLaunch?.(pan(tx));
    };
    const burst = (s: Shell) => {
      cb.current.onBurst?.(pan(s.tx), s.kind === "text");
      if (s.kind === "text" && MAX - ps.length < 460) ps.splice(0, 460 - (MAX - ps.length)); // the oldest sparks make room for the initials
      const room = MAX - ps.length;
      if (s.kind === "text") {
        const { pts: targets, gap } = textTargets(text, family, w, h, w / 2, h * 0.17, Math.min(room, 460));
        dot = Math.max(2.2, Math.min(3.6, gap * 0.6));
        targets.forEach((t, i) =>
          ps.push({ x: s.tx, y: s.ty, vx: 0, vy: 0, sx: s.tx, sy: s.ty, tx: t.x, ty: t.y, t: 0, life: 0, max: 4.6 + Math.random() * 0.6, c: i % 3 ? GOLD[i % 3] : ROSE[0] }),
        );
        window.setTimeout(() => cb.current.onWritten?.(), 1100);
        return;
      }
      const n = Math.min(room, s.kind === "heart" ? 130 : 90);
      const sp = Math.min(w, h) * (s.kind === "heart" ? 0.0105 : 0.012);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        let vx: number;
        let vy: number;
        if (s.kind === "heart") {
          vx = 16 * Math.pow(Math.sin(a), 3) / 16;
          vy = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) / 16;
        } else {
          vx = Math.cos(a);
          vy = Math.sin(a);
        }
        const k = sp * (0.92 + Math.random() * 0.16);
        ps.push({ x: s.tx, y: s.ty, vx: vx * k, vy: vy * k, life: 0, max: 1.6 + Math.random() * 0.6, c: s.c[i % s.c.length] });
      }
    };

    const plan: [number, () => void][] = [
      [200, () => launch(0.3, 0.3, "heart", ROSE)],
      [1000, () => launch(0.72, 0.26, "ring", GOLD)],
      [1800, () => launch(0.5, 0.2, "heart", GOLD)],
      [2500, () => launch(0.22, 0.24, "ring", ROSE)],
      [2700, () => launch(0.8, 0.34, "heart", ROSE)],
      [3700, () => launch(0.5, 0.17, "text", GOLD)],
    ];
    const timers = plan.map(([ms, f]) => window.setTimeout(f, ms));

    let raf = 0;
    let last = performance.now();
    let idleFrames = 0;
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      for (let i = shells.length - 1; i >= 0; i--) {
        const s = shells[i];
        s.t += dt;
        const k = Math.min(1, s.t / s.dur);
        const e = 1 - Math.pow(1 - k, 2);
        const x = s.x + (s.tx - s.x) * e;
        const y = s.y + (s.ty - s.y) * e;
        ctx.fillStyle = "rgba(255,231,179,.9)";
        ctx.fillRect(x - 1.2, y - 1.2, 2.4, 2.4);
        ctx.fillStyle = "rgba(255,180,90,.35)";
        ctx.fillRect(x - 0.8, y + 4, 1.6, 10);
        if (k >= 1) {
          shells.splice(i, 1);
          burst(s);
        }
      }
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        p.life += dt;
        if (p.tx !== undefined && p.sx !== undefined && p.sy !== undefined && p.ty !== undefined) {
          // initials: fly to the target (0–0.9 s), hang and twinkle, then drift down
          const k = Math.min(1, p.life / 0.9);
          const e = 1 - Math.pow(1 - k, 3);
          if (p.life < 3.2) {
            p.x = p.sx + (p.tx - p.sx) * e + (k >= 1 ? Math.sin(now / 180 + i) * 0.3 : 0);
            p.y = p.sy + (p.ty - p.sy) * e;
          } else {
            p.vy += 30 * dt;
            p.y += p.vy * dt;
          }
        } else {
          p.vy += 0.6 * dt * 60 * 0.05;
          p.vx *= 0.985;
          p.vy *= 0.985;
          p.x += p.vx * dt * 60;
          p.y += p.vy * dt * 60;
        }
        const a = p.tx !== undefined ? (p.life < 3.2 ? 1 : Math.max(0, 1 - (p.life - 3.2) / (p.max - 3.2))) : Math.max(0, 1 - p.life / p.max);
        if (a <= 0) {
          ps.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = a;
        ctx.fillStyle = p.c;
        const r = p.tx !== undefined ? dot : 2.6;
        ctx.fillRect(p.x - r / 2, p.y - r / 2, r, r);
        ctx.globalAlpha = a * 0.22;
        ctx.fillRect(p.x - r * 2, p.y - r * 2, r * 4, r * 4);
        if (p.tx === undefined) {
          ctx.globalAlpha = a * 0.35;
          ctx.fillRect(p.x - p.vx * 2.5 - 0.6, p.y - p.vy * 2.5 - 0.6, 1.2, 1.2);
        }
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      idleFrames = ps.length || shells.length ? 0 : idleFrames + 1;
      if (idleFrames > 240) return; // everything has burned out (and the plan is long over)
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    const vis = () => {
      cancelAnimationFrame(raf);
      if (document.visibilityState === "visible") {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener("visibilitychange", vis);
    return () => {
      timers.forEach(clearTimeout);
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", vis);
    };
  }, [text]);

  return <canvas ref={ref} className="fm-fw" aria-hidden />;
}
