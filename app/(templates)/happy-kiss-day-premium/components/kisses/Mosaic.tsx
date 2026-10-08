"use client";

// Room 3 — The Kiss Mosaic (the wow). Up to 2,000 tiny kisses (X's, hearts
// and lip-prints in the sender's shade) orbit as a pulsing heart cloud. Swipe
// up (or tap "Make them into us") and they stream on curved paths into their
// places in the sender's chosen photo — each kiss tinted by its cell's
// brightness on a lipstick palette — so the photo resolves OUT of kisses. The
// song's drop (useSongDrop, the page's one climax) lands exactly as it locks.
// Hold a finger on it and the kisses scatter around it like a magnifier.
// Caption: "This picture is made of 1,402 kisses — one for every day since we
// met." One Canvas2D, pre-rendered sprites, DPR ≤ 2, 1,200 kisses on ≤4-core
// phones, the loop sleeps once it is still. Reduced motion: a crossfade.

import { useEffect, useRef, useState, type ReactNode } from "react";
import { sfx, useSongDrop } from "../../../_valentine/kit/premium";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import type { LovePhoto } from "../../../_valentine/types";
import { SERIF } from "./fonts";
import { fmt, KD, type Kisses } from "./model";
import { Hint, Kicker, Room, Satin, Title } from "./ui";

const sameOrigin = (src: string) => (src.startsWith("data:") || src.startsWith("blob:") || src.startsWith("/") ? src : `/_next/image?url=${encodeURIComponent(src)}&w=256&q=75`);

function loadImg(src: string): Promise<HTMLImageElement | null> {
  return new Promise((res) => {
    const i = new Image();
    i.decoding = "async";
    i.onload = () => res(i);
    i.onerror = () => res(null);
    i.src = src;
  });
}

function heartPath(g: CanvasRenderingContext2D, x: number, y: number, r: number) {
  g.beginPath();
  g.moveTo(x, y + r * 0.45);
  g.bezierCurveTo(x - r * 1.2, y - r * 0.3, x - r * 0.5, y - r * 1.15, x, y - r * 0.45);
  g.bezierCurveTo(x + r * 0.5, y - r * 1.15, x + r * 1.2, y - r * 0.3, x, y + r * 0.45);
  g.fill();
}

/** A sprite per tone × glyph (0 = x, 1 = heart, 2 = lips or dot). */
function makeSprites(tones: string[], px: number, lips: boolean): HTMLCanvasElement[][] {
  return tones.map((c) =>
    [0, 1, 2].map((kind) => {
      const cv = document.createElement("canvas");
      cv.width = cv.height = Math.max(4, Math.ceil(px));
      const g = cv.getContext("2d")!;
      const s = cv.width;
      g.fillStyle = c;
      g.strokeStyle = c;
      g.lineCap = "round";
      if (kind === 0) {
        g.lineWidth = s * 0.2;
        g.beginPath();
        g.moveTo(s * 0.22, s * 0.22);
        g.lineTo(s * 0.78, s * 0.78);
        g.moveTo(s * 0.78, s * 0.22);
        g.lineTo(s * 0.22, s * 0.78);
        g.stroke();
      } else if (kind === 1 || !lips) heartPath(g, s / 2, s * 0.55, s * 0.42);
      else {
        g.beginPath();
        g.ellipse(s / 2, s * 0.42, s * 0.42, s * 0.16, 0, Math.PI, 0);
        g.ellipse(s / 2, s * 0.5, s * 0.42, s * 0.24, 0, 0, Math.PI);
        g.fill();
      }
      return cv;
    }),
  );
}

export default function Mosaic({ k, photo, aspect, sticker, onLocked, onNext }: { k: Kisses; photo?: LovePhoto; aspect: number; sticker: ReactNode; onLocked: (n: number) => void; onNext: () => void }) {
  const reduce = useReducedMotion();
  const { drop } = useSongDrop();
  const wrap = useRef<HTMLDivElement>(null);
  const cvRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<"cloud" | "fly" | "locked">("cloud");
  const [ready, setReady] = useState(false);
  const [shown, setShown] = useState(0);
  const [total, setTotal] = useState(0);
  const sim = useRef<{ start: (() => void) | null; press: ((x: number, y: number, on: boolean) => void) | null }>({ start: null, press: null });
  const swipe = useRef<number | null>(null);

  // The heart cloud's swirl, until the swipe.
  useEffect(() => {
    if (phase !== "cloud") return;
    const bed = sfx("kd-swirl", { gain: 0.8 });
    return () => bed.stop(600);
  }, [phase]);

  useEffect(() => {
    const cv = cvRef.current;
    const box = wrap.current;
    if (!cv || !box) return;
    let alive = true;
    let raf = 0;
    (async () => {
      const W = box.clientWidth;
      const H = Math.round(W / aspect);
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      cv.style.height = `${H}px`;
      const g = cv.getContext("2d");
      if (!g) return;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cores = (navigator as Navigator & { hardwareConcurrency?: number }).hardwareConcurrency ?? 8;
      const N = cores <= 4 ? 1200 : 2000;
      const cols = Math.round(Math.sqrt(N * aspect));
      const rows = Math.round(cols / aspect);
      const cell = W / cols;
      // Brightness per cell, from the photo (cover-fit around its focal point).
      let lum: Float32Array | null = null;
      const img = photo?.url ? await loadImg(sameOrigin(photo.url)) : null;
      if (!alive) return;
      if (img) {
        try {
          const off = document.createElement("canvas");
          off.width = cols;
          off.height = rows;
          const og = off.getContext("2d", { willReadFrequently: true })!;
          const s = Math.max(cols / img.width, rows / img.height) * (Math.max(100, photo?.scale ?? 100) / 100);
          const dw = img.width * s;
          const dh = img.height * s;
          const fx = (photo?.cropX ?? 50) / 100;
          const fy = (photo?.cropY ?? 50) / 100;
          og.drawImage(img, -(dw - cols) * fx, -(dh - rows) * fy, dw, dh);
          const d = og.getImageData(0, 0, cols, rows).data;
          lum = new Float32Array(cols * rows);
          for (let i = 0; i < cols * rows; i++) lum[i] = (0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]) / 255;
        } catch {
          lum = null; // a tainted canvas: fall back to the heart
        }
      }
      // Targets: every cell of the photo, or the cells inside a big heart.
      const tx: number[] = [];
      const ty: number[] = [];
      const tone: number[] = [];
      const TONES = [KD.velvetDeep, k.S.lo, k.S.c, k.S.hi, KD.blush, "#FFF1E8"];
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          const x = (c + 0.5) * cell;
          const y = (r + 0.5) * cell;
          if (lum) {
            const L = Math.min(0.999, Math.max(0, (lum[r * cols + c] - 0.06) * 1.12));
            tone.push(Math.floor(L * TONES.length));
          } else {
            const nx = ((x - W / 2) / H) * 2.6;
            const ny = (0.55 - y / H) * 2.6;
            const inside = Math.pow(nx * nx + ny * ny - 1, 3) - nx * nx * ny * ny * ny < 0;
            if (!inside) continue;
            tone.push(1 + Math.floor(((r / rows) * 3 + Math.random()) % 4));
          }
          tx.push(x);
          ty.push(y);
        }
      const n = tx.length;
      setTotal(n);
      const gs = cell * 1.4;
      const sprites = makeSprites(TONES, gs * dpr, k.lipstick);
      const glyph = Uint8Array.from({ length: n }, () => (Math.random() < 0.45 ? 0 : Math.random() < 0.6 ? 1 : 2));
      // The cloud: points filling a heart, orbiting.
      const hx = new Float32Array(n);
      const hy = new Float32Array(n);
      const ph = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        const t = Math.random() * Math.PI * 2;
        const rr = Math.sqrt(Math.random());
        hx[i] = 16 * Math.pow(Math.sin(t), 3) * rr;
        hy[i] = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * rr;
        ph[i] = Math.random() * 6.28;
      }
      const sx = new Float32Array(n);
      const sy = new Float32Array(n);
      const kx = new Float32Array(n);
      const ky = new Float32Array(n);
      const delay = Float32Array.from({ length: n }, (_, i) => (ty[i] / H) * 500 + Math.random() * 300);
      const px = new Float32Array(n);
      const py = new Float32Array(n);
      const hs = Math.min(W, H) / 38;
      const mode = { phase: "cloud" as "cloud" | "fly" | "locked", t0: 0, press: { x: 0, y: 0, on: false, amt: 0 }, still: 0 };
      const cloudPos = (i: number, now: number) => {
        const pulse = 1 + 0.05 * Math.sin(now / 260);
        const ox = Math.sin(now / 900 + ph[i]) * 3;
        const oy = Math.cos(now / 1100 + ph[i]) * 3;
        return [W / 2 + hx[i] * hs * pulse + ox, H * 0.48 + hy[i] * hs * pulse + oy];
      };
      const FLY = 1700;
      const draw = (now: number) => {
        g.clearRect(0, 0, W, H);
        const m = mode;
        if (m.press.on) m.press.amt += (1 - m.press.amt) * 0.18;
        else m.press.amt *= 0.85;
        const tt = now - m.t0;
        for (let i = 0; i < n; i++) {
          let x: number;
          let y: number;
          if (m.phase === "cloud") [x, y] = cloudPos(i, now);
          else {
            const p = m.phase === "locked" ? 1 : Math.min(1, Math.max(0, (tt - delay[i]) / FLY));
            const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
            const u = 1 - e;
            x = u * u * sx[i] + 2 * u * e * kx[i] + e * e * tx[i];
            y = u * u * sy[i] + 2 * u * e * ky[i] + e * e * ty[i];
          }
          if (m.press.amt > 0.01) {
            const dx = x - m.press.x;
            const dy = y - m.press.y;
            const d = Math.hypot(dx, dy);
            const R = 70;
            if (d < R && d > 0.01) {
              const push = (1 - d / R) * 30 * m.press.amt;
              x += (dx / d) * push;
              y += (dy / d) * push;
            }
          }
          px[i] = x;
          py[i] = y;
          g.drawImage(sprites[tone[i]][glyph[i]], x - gs / 2, y - gs / 2, gs, gs);
        }
        if (m.phase === "fly" && tt > FLY + 820) {
          m.phase = "locked";
        }
        const moving = m.phase !== "locked" || m.press.on || m.press.amt > 0.01;
        if (moving || reduce) mode.still = now;
        if (alive && (moving || now - mode.still < 200) && !(reduce && m.phase === "locked")) raf = requestAnimationFrame(draw);
        else raf = 0;
      };
      const kick = () => {
        if (!raf && alive) raf = requestAnimationFrame(draw);
      };
      sim.current.start = () => {
        const now = performance.now();
        for (let i = 0; i < n; i++) {
          const [x, y] = reduce ? [tx[i], ty[i]] : cloudPos(i, now);
          sx[i] = x;
          sy[i] = y;
          const mx = (x + tx[i]) / 2;
          const my = (y + ty[i]) / 2;
          const sw = (Math.random() - 0.5) * W * 0.7;
          kx[i] = mx + sw;
          ky[i] = my - Math.abs(sw) * 0.4 - 40;
        }
        mode.phase = reduce ? "locked" : "fly";
        mode.t0 = now;
        kick();
      };
      sim.current.press = (x, y, on) => {
        mode.press.x = x;
        mode.press.y = y;
        mode.press.on = on;
        kick();
      };
      setReady(true);
      if (reduce) {
        // Draw a still cloud (no orbit) until the swipe.
        draw(performance.now());
      } else raf = requestAnimationFrame(draw);
    })();
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
    };
  }, [photo, aspect, k.S, k.lipstick, reduce]);

  const go = () => {
    if (phase !== "cloud" || !ready) return;
    setPhase("fly");
    haptic([10, 30, 10]);
    sfx("kd-assemble", { dur: 2.4, gain: 0.9 });
    sim.current.start?.();
    // The drop's riser runs ~1.1 s, so starting it here lands its peak as the photo locks.
    window.setTimeout(
      () =>
        drop(() => {
          setPhase("locked");
          sfx("kd-lock", { gain: 0.9 });
          haptic([20, 40, 30]);
        }),
      reduce ? 0 : 1350,
    );
  };

  // Count up the kisses once it locks.
  const count = k.count ?? total;
  useEffect(() => {
    if (phase !== "locked") return;
    onLocked(count);
    if (reduce) {
      setShown(count);
      return;
    }
    const t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / 1600);
      setShown(Math.round(count * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const local = (e: React.PointerEvent) => {
    const r = cvRef.current?.getBoundingClientRect();
    return r ? { x: e.clientX - r.left, y: e.clientY - r.top } : { x: 0, y: 0 };
  };

  return (
    <Room label="The kiss mosaic" className="kd-mosaic">
      <Kicker>{phase === "locked" ? "Look closer" : `${fmt(total || 2000)} kisses`}</Kicker>
      <Title>{phase === "locked" ? "This is us" : "Swipe them into place"}</Title>
      <div
        ref={wrap}
        className={`kd-mosaicStage is-${phase}`}
        onPointerDown={(e) => {
          (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
          if (phase === "cloud") swipe.current = e.clientY;
          else {
            const p = local(e);
            sim.current.press?.(p.x, p.y, true);
          }
        }}
        onPointerMove={(e) => {
          if (phase === "cloud" && swipe.current != null && swipe.current - e.clientY > 40) {
            swipe.current = null;
            go();
          } else if (phase !== "cloud") {
            const p = local(e);
            if (e.buttons || e.pointerType === "touch") sim.current.press?.(p.x, p.y, true);
          }
        }}
        onPointerUp={() => {
          swipe.current = null;
          sim.current.press?.(0, 0, false);
        }}
        onPointerCancel={() => sim.current.press?.(0, 0, false)}
        role="img"
        aria-label={phase === "locked" ? `Your photo, made of ${fmt(count)} kisses.` : "A heart-shaped cloud of tiny kisses. Swipe up to put them in place."}
      >
        <canvas ref={cvRef} className="kd-mosaicCv" aria-hidden />
        {phase === "locked" && <span className="kd-wowSticker">{sticker}</span>}
      </div>
      {phase === "locked" ? (
        <>
          <p className="kd-count" aria-live="polite">
            This picture is made of <b>{fmt(shown)}</b> kisses
            <br />
            <i>{k.count ? k.countWhy : "every one of them for you"}</i>
          </p>
          <Hint>Hold a finger on it ✦</Hint>
          <Satin big onClick={() => { sfx("kd-lipstick", { gain: 0.6 }); onNext(); }}>Read what I wrote →</Satin>
        </>
      ) : phase === "cloud" ? (
        <>
          <Hint>Swipe up to set them free</Hint>
          <Satin big onClick={go} disabled={!ready}>Make them into us ✦</Satin>
        </>
      ) : (
        <Hint>…</Hint>
      )}
      <style>{CSS}</style>
    </Room>
  );
}

const CSS = `
.kd-mosaic { gap: 10px; }
.kd-mosaicStage { position: relative; width: 100%; max-width: 460px; touch-action: none; border-radius: 20px; overflow: hidden; cursor: grab;
  background: radial-gradient(90% 80% at 50% 45%, #FFFFFF, #FFF1E8 60%, #F9DDE3); box-shadow: 0 30px 60px -30px rgba(122,15,46,.55), inset 0 0 0 1px rgba(122,15,46,.08); }
.kd-mosaicCv { display: block; width: 100%; }
.kd-mosaicStage.is-locked { animation: kd-lockPop .9s cubic-bezier(.22,1,.36,1); }
@keyframes kd-lockPop { 0% { transform: scale(1); } 30% { transform: scale(1.025); } 100% { transform: scale(1); } }
.kd-wowSticker { position: absolute; right: 6px; bottom: 6px; pointer-events: none; animation: kd-in .8s .4s ease both; }
.kd-count { margin: 4px 0 0; font: italic 400 19px/1.4 ${SERIF}; color: var(--vw-ink); }
.kd-count b { font: italic 700 30px/1 ${SERIF}; color: var(--vw-accent); font-variant-numeric: tabular-nums; }
.kd-count i { font-size: 16px; color: var(--vw-ink-soft); }
@media (prefers-reduced-motion: reduce) { .kd-mosaicStage.is-locked { animation: none; } .kd-mosaicCv { transition: opacity .4s; } }
`;
