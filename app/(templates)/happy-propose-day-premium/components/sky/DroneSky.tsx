"use client";

// The drone show (the signature wow). ONE Canvas2D, DPR ≤ 2, ~600 drones (360 on low-end phones). Every
// formation is sampled once from an offscreen canvas (text with the display font, the heart / ring box / ring as
// paths), split into colour layers, and the swarm flows to it on a per-drone spring with a staggered start, so it
// moves like a real show. Drones are a pre-rendered glow sprite + a white core, additive. A beating layer
// (the hearts) scales around its own centre on a lub-dub that speeds up from 72 to 96 bpm. In the YES formation one
// drone blinks pink — its resting position is reported so the scene can put a tap target on it (the easter egg).
// Reduced motion: no flight; each formation simply appears (the canvas cross-fades).

import { useEffect, useRef } from "react";

export type Formation =
  | { kind: "rise" }
  | { kind: "text"; text: string; color: string; maxLines?: number }
  | { kind: "heart"; color: string }
  | { kind: "box"; open: boolean; stone: string }
  | { kind: "yes"; name: string; stone: string };

type Layer = { color: string; beat?: boolean; draw: (g: CanvasRenderingContext2D, w: number, h: number, fam: string) => void };

const GOLD = "#FFD27A";
const WHITE = "#F4F8FF";
const ROSE = "#FF5C8A";

function fitText(g: CanvasRenderingContext2D, text: string, fam: string, w: number, h: number, maxLines: number) {
  const words = text.split(/\s+/).filter(Boolean);
  for (let size = Math.min(h * 0.9, 220); size >= 14; size -= 3) {
    g.font = `700 ${size}px ${fam}`;
    const lines: string[] = [];
    let line = "";
    for (const wd of words) {
      const next = line ? `${line} ${wd}` : wd;
      if (g.measureText(next).width > w * 0.92 && line) {
        lines.push(line);
        line = wd;
      } else line = next;
    }
    if (line) lines.push(line);
    const lh = size * 1.08;
    if (lines.length <= maxLines && lines.every((l) => g.measureText(l).width <= w * 0.94) && lines.length * lh <= h * 0.96) return { lines, size, lh };
  }
  g.font = `700 14px ${fam}`;
  return { lines: [text], size: 14, lh: 15 };
}

function drawLines(g: CanvasRenderingContext2D, text: string, fam: string, w: number, h: number, maxLines: number, top = 0, height = h) {
  const { lines, size, lh } = fitText(g, text, fam, w, height, maxLines);
  g.font = `700 ${size}px ${fam}`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  const y0 = top + height / 2 - ((lines.length - 1) * lh) / 2;
  lines.forEach((l, i) => g.fillText(l, w / 2, y0 + i * lh));
}

function heartPath(cx: number, cy: number, s: number) {
  const p = new Path2D();
  p.moveTo(cx, cy + s * 0.42);
  p.bezierCurveTo(cx - s * 0.62, cy, cx - s * 0.56, cy - s * 0.5, cx - s * 0.26, cy - s * 0.5);
  p.bezierCurveTo(cx - s * 0.1, cy - s * 0.5, cx, cy - s * 0.38, cx, cy - s * 0.28);
  p.bezierCurveTo(cx, cy - s * 0.38, cx + s * 0.1, cy - s * 0.5, cx + s * 0.26, cy - s * 0.5);
  p.bezierCurveTo(cx + s * 0.56, cy - s * 0.5, cx + s * 0.62, cy, cx, cy + s * 0.42);
  p.closePath();
  return p;
}

function layersFor(f: Formation): Layer[] {
  switch (f.kind) {
    case "text":
      return [{ color: f.color, draw: (g, w, h, fam) => drawLines(g, f.text, fam, w, h, f.maxLines ?? 2) }];
    case "heart":
      return [{ color: f.color, beat: true, draw: (g, w, h) => g.fill(heartPath(w / 2, h * 0.53, Math.min(w * 0.7, h * 1.05))) }];
    case "box": {
      const lid = (g: CanvasRenderingContext2D, w: number, h: number) => {
        const s = Math.min(w * 0.55, h * 0.9);
        const cx = w / 2;
        const top = h / 2 - s * 0.05;
        g.lineWidth = Math.max(3, s * 0.035);
        g.lineJoin = "round";
        g.strokeRect(cx - s * 0.42, top, s * 0.84, s * 0.46); // body
        if (!f.open) {
          g.strokeRect(cx - s * 0.46, top - s * 0.2, s * 0.92, s * 0.2); // lid
          g.beginPath();
          g.moveTo(cx, top - s * 0.2);
          g.lineTo(cx, top + s * 0.46); // ribbon
          g.stroke();
          g.beginPath();
          g.ellipse(cx - s * 0.11, top - s * 0.28, s * 0.11, s * 0.07, -0.4, 0, Math.PI * 2);
          g.ellipse(cx + s * 0.11, top - s * 0.28, s * 0.11, s * 0.07, 0.4, 0, Math.PI * 2);
          g.stroke();
        } else {
          // the lid swung open behind, and the satin cushion
          g.beginPath();
          g.moveTo(cx - s * 0.42, top);
          g.lineTo(cx - s * 0.36, top - s * 0.42);
          g.lineTo(cx + s * 0.36, top - s * 0.42);
          g.lineTo(cx + s * 0.42, top);
          g.stroke();
          g.beginPath();
          g.moveTo(cx - s * 0.3, top + s * 0.14);
          g.quadraticCurveTo(cx, top + s * 0.26, cx + s * 0.3, top + s * 0.14);
          g.stroke();
        }
      };
      const ring = (g: CanvasRenderingContext2D, w: number, h: number) => {
        const s = Math.min(w * 0.55, h * 0.9);
        const cx = w / 2;
        const top = h / 2 - s * 0.05;
        g.lineWidth = Math.max(3, s * 0.03);
        g.beginPath();
        g.ellipse(cx, top - s * 0.02, s * 0.13, s * 0.15, 0, 0, Math.PI * 2);
        g.stroke();
      };
      const gem = (g: CanvasRenderingContext2D, w: number, h: number) => {
        const s = Math.min(w * 0.55, h * 0.9);
        const cx = w / 2;
        const y = h / 2 - s * 0.05 - s * 0.2;
        g.beginPath();
        g.moveTo(cx - s * 0.09, y - s * 0.02);
        g.lineTo(cx - s * 0.05, y - s * 0.08);
        g.lineTo(cx + s * 0.05, y - s * 0.08);
        g.lineTo(cx + s * 0.09, y - s * 0.02);
        g.lineTo(cx, y + s * 0.08);
        g.closePath();
        g.fill();
      };
      return f.open
        ? [{ color: GOLD, draw: lid }, { color: WHITE, draw: ring }, { color: f.stone, draw: gem }]
        : [{ color: GOLD, draw: lid }];
    }
    case "yes":
      return [
        {
          color: WHITE,
          draw: (g, w, h, fam) => {
            drawLines(g, f.name.toUpperCase(), fam, w, h, 1, 0, h * 0.34);
            drawLines(g, "SAID YES", fam, w, h, 1, h * 0.34, h * 0.36);
          },
        },
        { color: ROSE, beat: true, draw: (g, w, h) => g.fill(heartPath(w / 2, h * 0.86, Math.min(w * 0.22, h * 0.28))) },
      ];
    case "rise":
    default:
      return [];
  }
}

function sprite(color: string) {
  const c = document.createElement("canvas");
  c.width = c.height = 24;
  const g = c.getContext("2d")!;
  const rg = g.createRadialGradient(12, 12, 0, 12, 12, 12);
  rg.addColorStop(0, "rgba(255,255,255,1)");
  rg.addColorStop(0.22, color);
  rg.addColorStop(0.55, color + "55");
  rg.addColorStop(1, color + "00");
  g.fillStyle = rg;
  g.fillRect(0, 0, 24, 24);
  return c;
}

export interface DroneSkyProps {
  formation: Formation | null;
  /** Sky band the formation fills, as fractions of the viewport height [top, bottom]. */
  region: [number, number];
  /** Overall brightness 0–1 (dim the sky behind a foreground scene). */
  dim?: number;
  reduce?: boolean;
  /** YES easter egg: where the pink drone rests (viewport px), null while flying. */
  onPinkPos?: (p: { x: number; y: number } | null) => void;
  onBeat?: () => void;
}

export default function DroneSky({ formation, region, dim = 1, reduce = false, onPinkPos, onBeat }: DroneSkyProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const api = useRef<{ set: (f: Formation | null, r: [number, number]) => void; dim: (d: number) => void } | null>(null);
  const cb = useRef({ onPinkPos, onBeat });
  useEffect(() => {
    cb.current = { onPinkPos, onBeat };
  });

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const nav = navigator as Navigator & { deviceMemory?: number };
    const low = (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4;
    const dpr = Math.min(low ? 1.5 : 2, window.devicePixelRatio || 1);
    let W = 0;
    let H = 0;
    const N = low || window.innerWidth < 360 ? 360 : 600;
    const x = new Float32Array(N), y = new Float32Array(N), vx = new Float32Array(N), vy = new Float32Array(N);
    const tx = new Float32Array(N), ty = new Float32Array(N), delay = new Float32Array(N), phase = new Float32Array(N), alpha = new Float32Array(N);
    const layer = new Uint8Array(N), col = new Uint8Array(N);
    let colors: string[] = [WHITE];
    let sprites: HTMLCanvasElement[] = [sprite(WHITE)];
    let beats: boolean[] = [false];
    let started = performance.now();
    let pink = -1;
    let pinkSent = false;
    let dimLevel = dim;
    let last: { f: Formation | null; r: [number, number] } = { f: null, r: region };
    const fam = (getComputedStyle(cv).getPropertyValue("--sk-display").trim() || "Impact") + ", 'Arial Narrow', Impact, sans-serif";

    const size = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    for (let i = 0; i < N; i++) {
      x[i] = Math.random() * W;
      y[i] = H * (0.66 + Math.random() * 0.3);
      tx[i] = x[i];
      ty[i] = y[i];
      phase[i] = Math.random() * 6.28;
      alpha[i] = 0;
    }

    const sample = (f: Formation | null, r: [number, number]) => {
      started = performance.now();
      pink = -1;
      pinkSent = false;
      cb.current.onPinkPos?.(null);
      const top = H * r[0];
      const rh = Math.max(60, H * (r[1] - r[0]));
      if (!f) {
        for (let i = 0; i < N; i++) { tx[i] = x[i]; ty[i] = H + 40; delay[i] = Math.random() * 0.6; }
        return;
      }
      if (f.kind === "rise") {
        colors = [WHITE];
        sprites = [sprite(WHITE)];
        beats = [false];
        for (let i = 0; i < N; i++) {
          tx[i] = W * (0.06 + Math.random() * 0.88);
          ty[i] = top + rh * (0.15 + Math.random() * 0.8);
          delay[i] = Math.random() * 1.6;
          layer[i] = 0;
          col[i] = 0;
        }
        return;
      }
      const layers = layersFor(f);
      const off = document.createElement("canvas");
      const sw = Math.min(900, Math.round(W));
      const sh = Math.min(560, Math.round(rh));
      off.width = sw;
      off.height = sh;
      const g = off.getContext("2d", { willReadFrequently: true })!;
      // Draw every layer once, measure the lit area, then sample ALL layers on one regular grid whose pitch
      // gives about N points: a dot-matrix, like a real show (crisp letters instead of a random spray).
      const masks: Uint8ClampedArray[] = [];
      let area = 0;
      layers.forEach((L) => {
        g.clearRect(0, 0, sw, sh);
        g.fillStyle = "#fff";
        g.strokeStyle = "#fff";
        L.draw(g, sw, sh, fam);
        const d = g.getImageData(0, 0, sw, sh).data;
        masks.push(d);
        for (let k = 3; k < d.length; k += 16) if (d[k] > 120) area += 4; // every 4th pixel ≈ area/4
      });
      const pitch = Math.max(2.2, Math.sqrt(area / N) * 1.02);
      const targets: { x: number; y: number; l: number }[] = [];
      masks.forEach((d, li) => {
        for (let yy = pitch / 2; yy < sh; yy += pitch) {
          const row = Math.round(yy);
          const shift = (Math.round(yy / pitch) % 2) * pitch * 0.5; // staggered rows read rounder
          for (let xx = pitch / 2 + shift; xx < sw; xx += pitch) {
            const col = Math.round(xx);
            if (d[(row * sw + col) * 4 + 3] > 120) targets.push({ x: xx, y: yy, l: li });
          }
        }
      });
      if (targets.length > N) {
        const keep: typeof targets = [];
        for (let k = 0; k < N; k++) keep.push(targets[Math.floor((k * targets.length) / N)]);
        targets.length = 0;
        targets.push(...keep);
      }
      const used = targets.length;
      // spare drones park (invisible) where they are
      for (let k = used; k < N; k++) targets.push({ x: -1, y: -1, l: 255 });
      // Map to the screen (the sample canvas is centred in the band), then pair by position so the swarm flows.
      const ox = (W - sw) / 2;
      const oy = top + (rh - sh) / 2;
      const order = Array.from({ length: N }, (_, i) => i).sort((a, b) => x[a] + y[a] * 0.2 - (x[b] + y[b] * 0.2));
      const real = targets.filter((t) => t.l !== 255).map((t) => ({ ...t, x: t.x + ox, y: t.y + oy })).sort((a, b) => a.x + a.y * 0.2 - (b.x + b.y * 0.2));
      const tord: { x: number; y: number; l: number }[] = [];
      // spread the real targets evenly over the x-ordered drones; the drones in between become spares
      const step = N / Math.max(1, real.length);
      const isReal = new Uint8Array(N);
      real.forEach((_, k) => (isReal[Math.min(N - 1, Math.floor(k * step))] = 1));
      let ri = 0;
      for (let k = 0; k < N; k++) tord.push(isReal[k] && ri < real.length ? real[ri++] : { x: -1, y: -1, l: 255 });
      colors = layers.map((L) => L.color);
      sprites = colors.map(sprite);
      beats = layers.map((L) => !!L.beat);
      order.forEach((di, k) => {
        const t = tord[k];
        if (t.l === 255) {
          tx[di] = x[di];
          ty[di] = y[di];
          layer[di] = 255;
          col[di] = 0;
        } else {
          tx[di] = t.x;
          ty[di] = t.y;
          layer[di] = t.l;
          col[di] = t.l;
        }
        delay[di] = Math.random() * 0.7;
      });
      if (f.kind === "yes") {
        const cands = order.filter((i) => layer[i] === 0);
        pink = cands[Math.floor(cands.length * 0.37)] ?? -1;
      }
      if (reduce) for (let i = 0; i < N; i++) { x[i] = tx[i]; y[i] = ty[i]; alpha[i] = 1; vx[i] = vy[i] = 0; }
    };

    let raf = 0;
    let lastT = performance.now();
    let beatT = 0;
    let lastBeat = 0;
    let beatIdx = 0;
    const frame = (now: number) => {
      const dt = Math.min(2.5, (now - lastT) / 16.67);
      lastT = now;
      const el = (now - started) / 1000;
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      // the beat: lub-dub, 72 → 96 bpm over ~20 s
      const bpm = Math.min(96, 72 + el * 1.2);
      beatT += ((now - (lastBeat || now)) / 60000) * bpm;
      lastBeat = now;
      const ph = beatT % 1;
      const pulse = Math.exp(-((ph - 0.05) ** 2) / 0.002) + 0.6 * Math.exp(-((ph - 0.22) ** 2) / 0.002);
      const bi = Math.floor(beatT);
      if (bi !== beatIdx && beats.some(Boolean)) {
        beatIdx = bi;
        cb.current.onBeat?.();
      }
      const centers = beats.map((b, li) => {
        if (!b) return null;
        let sx = 0, sy = 0, n = 0;
        for (let i = 0; i < N; i += 3) if (layer[i] === li) { sx += tx[i]; sy += ty[i]; n++; }
        return n ? { x: sx / n, y: sy / n } : null;
      });
      for (let i = 0; i < N; i++) {
        const c = layer[i] === 255 ? null : centers[layer[i]];
        let gx = tx[i];
        let gy = ty[i];
        if (c && !reduce) {
          const s = 1 + 0.07 * pulse;
          gx = c.x + (gx - c.x) * s;
          gy = c.y + (gy - c.y) * s;
        }
        if (reduce) {
          x[i] = gx;
          y[i] = gy;
        } else if (el > delay[i]) {
          vx[i] = (vx[i] + (gx - x[i]) * 0.035 * dt) * Math.pow(0.86, dt);
          vy[i] = (vy[i] + (gy - y[i]) * 0.035 * dt) * Math.pow(0.86, dt);
          x[i] += vx[i] * dt;
          y[i] += vy[i] * dt;
        }
        alpha[i] = layer[i] === 255 ? Math.max(0, alpha[i] - 0.03 * dt) : Math.min(1, alpha[i] + 0.02 * dt);
        const isPink = i === pink;
        const tw = isPink ? 0.55 + 0.45 * Math.sin(now / 110) : 0.82 + 0.18 * Math.sin(now / 400 + phase[i]);
        const a = alpha[i] * tw * dimLevel;
        if (a <= 0.01) continue;
        ctx.globalAlpha = a;
        const sp = isPink ? sprite_pink : sprites[col[i]] ?? sprites[0];
        ctx.drawImage(sp, x[i] - 5, y[i] - 5, 10, 10);
        ctx.fillStyle = "#fff";
        ctx.fillRect(x[i] - 0.9, y[i] - 0.9, 1.8, 1.8);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      if (pink >= 0 && !pinkSent && el > 3.2) {
        pinkSent = true;
        cb.current.onPinkPos?.({ x: tx[pink], y: ty[pink] });
      }
      raf = requestAnimationFrame(frame);
    };
    const sprite_pink = sprite("#FF3D8B");
    raf = requestAnimationFrame(frame);

    api.current = {
      set: (f, r) => {
        last = { f, r };
        sample(f, r);
      },
      dim: (d) => {
        dimLevel = d;
      },
    };
    api.current.set(last.f, last.r);
    const onResize = () => {
      size();
      sample(last.f, last.r);
    };
    window.addEventListener("resize", onResize);
    const vis = () => {
      cancelAnimationFrame(raf);
      if (document.visibilityState === "visible") {
        lastT = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener("visibilitychange", vis);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", vis);
      api.current = null;
    };
    // mount once; formation changes go through api.set below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  const fkey = JSON.stringify(formation) + region.join(",");
  useEffect(() => {
    api.current?.set(formation, region);
    // keyed on the serialised formation + band
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fkey]);
  useEffect(() => {
    api.current?.dim(dim);
  }, [dim]);

  return <canvas ref={ref} className="sk-drones" aria-hidden />;
}
