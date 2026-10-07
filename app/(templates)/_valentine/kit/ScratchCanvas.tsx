"use client";

// ─── ScratchCanvas — scratch a foil to reveal what's under it ────────────────
//
// A canvas overlay erased with `destination-out`. The cleared share is sampled
// every few strokes; past `threshold` the rest fades away and `onReveal` fires
// (once). A "Reveal" link appears after `revealLinkAfterMs` for anyone who can't
// or won't scratch (accessibility, tiny screens), and keyboard users get it
// focusable immediately. Reduced motion: no fade, instant reveal.
//
// The children are rendered underneath at full size from the first paint, so
// the box never changes size (no layout shift). Give the wrapper a size via
// `height` (or style) — the canvas follows it with a ResizeObserver at DPR.
//
//   <ScratchCanvas height={160} cover={["#E6C27A", "#F6E3B4"]} label="Scratch gently 💛" onReveal={() => …}>
//     <h2>Will you be mine?</h2>
//   </ScratchCanvas>

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { prefersReducedMotion } from "./useReducedMotion";
import { haptic } from "./haptic";
import { canvasFont } from "./canvasFonts";

export interface ScratchCanvasProps {
  children: ReactNode;
  /** Reserved height in px (or set it via style). */
  height?: number;
  /** Solid colour, or [from, to] for a foil gradient. */
  cover?: string | readonly [string, string];
  /** Text printed on the foil. */
  label?: string;
  labelColor?: string;
  /** 0–1 cleared share that auto-completes the reveal. Default 0.55. */
  threshold?: number;
  /** Brush radius in CSS px. Default 22. */
  brush?: number;
  /** Show the tap-to-reveal link after this many ms. Default 4000. */
  revealLinkAfterMs?: number;
  onReveal?: () => void;
  /** Called with 0–1 progress as they scratch. */
  onProgress?: (p: number) => void;
  radius?: number;
  className?: string;
  style?: CSSProperties;
}

export default function ScratchCanvas({
  children,
  height,
  cover = ["#E6C27A", "#F6E3B4"],
  label = "Scratch here ✨",
  labelColor = "rgba(60,30,10,.75)",
  threshold = 0.55,
  brush = 22,
  revealLinkAfterMs = 4000,
  onReveal,
  onProgress,
  radius = 20,
  className,
  style,
}: ScratchCanvasProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const strokes = useRef(0);
  const revealedRef = useRef(false);
  const [revealed, setRevealed] = useState(false);
  const [fading, setFading] = useState(false);
  const [showLink, setShowLink] = useState(false);

  const paintCover = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap || revealedRef.current) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const { width, height: h } = wrap.getBoundingClientRect();
    if (!width || !h) return;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(h * dpr);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    if (typeof cover === "string") ctx.fillStyle = cover;
    else {
      const g = ctx.createLinearGradient(0, 0, width, h);
      g.addColorStop(0, cover[0]);
      g.addColorStop(0.5, cover[1]);
      g.addColorStop(1, cover[0]);
      ctx.fillStyle = g;
    }
    ctx.fillRect(0, 0, width, h);
    // A little foil sparkle texture.
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = "#fff";
    for (let i = 0; i < 60; i++) ctx.fillRect(Math.random() * width, Math.random() * h, 1.5, 1.5);
    ctx.globalAlpha = 1;
    ctx.fillStyle = labelColor;
    ctx.font = canvasFont("ui", Math.max(14, Math.min(20, width / 16)), 600);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, width / 2, h / 2);
    strokes.current = 0;
  }, [cover, label, labelColor]);

  useEffect(() => {
    paintCover();
    const wrap = wrapRef.current;
    if (!wrap || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => paintCover());
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [paintCover]);

  useEffect(() => {
    const t = window.setTimeout(() => setShowLink(true), revealLinkAfterMs);
    return () => window.clearTimeout(t);
  }, [revealLinkAfterMs]);

  const finish = useCallback(() => {
    if (revealedRef.current) return;
    revealedRef.current = true;
    haptic([10, 40, 10]);
    onProgress?.(1);
    if (prefersReducedMotion()) {
      setRevealed(true);
      onReveal?.();
      return;
    }
    setFading(true);
    window.setTimeout(() => {
      setRevealed(true);
      onReveal?.();
    }, 450);
  }, [onReveal, onProgress]);

  const cleared = useCallback((): number => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { willReadFrequently: true } as CanvasRenderingContext2DSettings);
    if (!canvas || !ctx || !canvas.width || !canvas.height) return 0;
    // Sample a coarse grid, not every pixel.
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const step = 4 * 24;
    let clear = 0;
    let total = 0;
    for (let i = 3; i < data.length; i += step) {
      total++;
      if (data[i] < 40) clear++;
    }
    return total ? clear / total : 0;
  }, []);

  const pointAt = (e: React.PointerEvent) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const scratch = (p: { x: number; y: number }) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = brush * 2;
    ctx.beginPath();
    const from = last.current ?? p;
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(p.x + 0.01, p.y + 0.01);
    ctx.stroke();
    last.current = p;
    strokes.current++;
    if (strokes.current % 8 === 0) {
      const c = cleared();
      onProgress?.(Math.min(1, c / threshold));
      if (c >= threshold) finish();
    }
  };

  return (
    <div
      ref={wrapRef}
      className={className}
      style={{ position: "relative", height, borderRadius: radius, overflow: "hidden", touchAction: revealed ? undefined : "none", ...style }}
    >
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>{children}</div>
      {!revealed && (
        <canvas
          ref={canvasRef}
          aria-hidden
          onPointerDown={(e) => {
            drawing.current = true;
            last.current = null;
            (e.target as HTMLCanvasElement).setPointerCapture?.(e.pointerId);
            scratch(pointAt(e));
          }}
          onPointerMove={(e) => drawing.current && scratch(pointAt(e))}
          onPointerUp={() => {
            drawing.current = false;
            last.current = null;
            if (cleared() >= threshold) finish();
          }}
          onPointerCancel={() => {
            drawing.current = false;
            last.current = null;
          }}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            cursor: "grab",
            opacity: fading ? 0 : 1,
            transition: "opacity .45s ease",
          }}
        />
      )}
      {!revealed && (
        <button
          type="button"
          onClick={finish}
          style={{
            position: "absolute",
            right: 10,
            bottom: 8,
            padding: "6px 12px",
            minHeight: 32,
            borderRadius: 99,
            border: 0,
            background: "rgba(255,255,255,.85)",
            color: "#3a2a1a",
            font: "600 12px var(--font-fredoka), Fredoka, system-ui, sans-serif",
            cursor: "pointer",
            opacity: showLink ? 1 : 0,
            transition: "opacity .3s",
          }}
          // Focusable from the start for keyboard users; only visually delayed.
          onFocus={() => setShowLink(true)}
        >
          Reveal ✨
        </button>
      )}
    </div>
  );
}
