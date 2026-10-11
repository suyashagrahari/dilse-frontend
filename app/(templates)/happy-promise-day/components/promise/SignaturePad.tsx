"use client";

// Fingertip signature with smooth, variable-width ink (the signature_pad
// technique, hand-rolled — no dependency): each new point makes a quadratic
// Bézier between segment midpoints; the pen width follows a low-pass-filtered
// velocity (fast = thin, slow = thick) and the curve is stamped as small
// discs so the width tapers continuously. DPR capped at 2.

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { canvasFont } from "../../../_valentine/kit";
import { FONTS } from "../../../_valentine/theme";
import { P } from "./ui";

export interface SignatureHandle {
  clear: () => void;
  isEmpty: () => boolean;
  /** PNG data URL of the ink (transparent background), or null when empty. */
  toDataURL: () => string | null;
  /** Fallback: writes the name in a script hand. */
  signName: (name: string) => void;
}

type Pt = { x: number; y: number; t: number };

const MIN_W = 1.3;
const MAX_W = 4.6;
const FILTER = 0.7;

const SignaturePad = forwardRef<SignatureHandle, { height?: number; ink?: string; onInk?: (has: boolean) => void; label: string }>(function SignaturePad(
  { height = 132, ink = P.berry, onInk, label },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const has = useRef(false);
  const [empty, setEmpty] = useState(true);
  const stroke = useRef<{ id: number; pts: Pt[]; v: number; w: number } | null>(null);
  const dpr = useRef(1);

  const ctx = () => canvasRef.current?.getContext("2d") ?? null;

  const size = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const r = c.getBoundingClientRect();
    dpr.current = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.round(r.width * dpr.current);
    const h = Math.round(r.height * dpr.current);
    if (c.width === w && c.height === h) return;
    // Keep any ink across a resize.
    const old = has.current ? c.toDataURL() : null;
    c.width = w;
    c.height = h;
    const g = c.getContext("2d");
    if (g && old) {
      const img = new Image();
      img.onload = () => g.drawImage(img, 0, 0, w, h);
      img.src = old;
    }
  }, []);

  useEffect(() => {
    size();
    const c = canvasRef.current;
    if (!c || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(size);
    ro.observe(c);
    return () => ro.disconnect();
  }, [size]);

  const mark = (v: boolean) => {
    if (has.current === v) return;
    has.current = v;
    setEmpty(!v);
    onInk?.(v);
  };

  const point = (e: React.PointerEvent): Pt => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: (e.clientX - r.left) * dpr.current, y: (e.clientY - r.top) * dpr.current, t: performance.now() };
  };

  const dot = (g: CanvasRenderingContext2D, x: number, y: number, w: number) => {
    g.beginPath();
    g.arc(x, y, (w * dpr.current) / 2, 0, Math.PI * 2);
    g.fill();
  };

  const onDown = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    const p = point(e);
    stroke.current = { id: e.pointerId, pts: [p], v: 0, w: (MIN_W + MAX_W) / 2 };
    const g = ctx();
    if (g) {
      g.fillStyle = ink;
      dot(g, p.x, p.y, stroke.current.w * 0.8);
    }
    mark(true);
  };

  const onMove = (e: React.PointerEvent) => {
    const s = stroke.current;
    if (!s || s.id !== e.pointerId) return;
    const g = ctx();
    if (!g) return;
    const p = point(e);
    const last = s.pts[s.pts.length - 1];
    const dist = Math.hypot(p.x - last.x, p.y - last.y);
    if (dist < 2.5 * dpr.current) return;
    const dt = Math.max(1, p.t - last.t);
    const vel = dist / dpr.current / dt; // css px per ms
    s.v = FILTER * vel + (1 - FILTER) * s.v;
    const w = Math.max(MIN_W, Math.min(MAX_W, MAX_W / (s.v + 1)));
    s.pts.push(p);
    const n = s.pts.length;
    if (n < 3) {
      // straight segment for the first move
      const steps = Math.ceil(dist / (0.9 * dpr.current));
      g.fillStyle = ink;
      for (let k = 1; k <= steps; k++) {
        const t = k / steps;
        dot(g, last.x + (p.x - last.x) * t, last.y + (p.y - last.y) * t, s.w + (w - s.w) * t);
      }
      s.w = w;
      return;
    }
    const a = s.pts[n - 3];
    const b = s.pts[n - 2];
    const m1 = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    const m2 = { x: (b.x + p.x) / 2, y: (b.y + p.y) / 2 };
    const len = Math.hypot(m2.x - m1.x, m2.y - m1.y) + 1;
    const steps = Math.ceil(len / (0.9 * dpr.current));
    g.fillStyle = ink;
    for (let k = 1; k <= steps; k++) {
      const t = k / steps;
      const u = 1 - t;
      const x = u * u * m1.x + 2 * u * t * b.x + t * t * m2.x;
      const y = u * u * m1.y + 2 * u * t * b.y + t * t * m2.y;
      dot(g, x, y, s.w + (w - s.w) * t);
    }
    s.w = w;
  };

  const onUp = (e: React.PointerEvent) => {
    const s = stroke.current;
    if (!s || s.id !== e.pointerId) return;
    stroke.current = null;
  };

  useImperativeHandle(ref, () => ({
    clear() {
      const c = canvasRef.current;
      const g = ctx();
      if (c && g) g.clearRect(0, 0, c.width, c.height);
      mark(false);
    },
    isEmpty: () => !has.current,
    toDataURL() {
      const c = canvasRef.current;
      if (!c || !has.current) return null;
      try {
        return c.toDataURL("image/png");
      } catch {
        return null;
      }
    },
    signName(name: string) {
      const c = canvasRef.current;
      const g = ctx();
      if (!c || !g) return;
      g.clearRect(0, 0, c.width, c.height);
      const px = Math.min(c.height * 0.46, (c.width * 0.85) / Math.max(4, name.length * 0.5));
      g.save();
      g.translate(c.width / 2, c.height * 0.62);
      g.rotate(-0.06);
      g.font = canvasFont("script", px, 700);
      g.fillStyle = ink;
      g.textAlign = "center";
      g.textBaseline = "alphabetic";
      g.fillText(name, 0, 0, c.width * 0.9);
      // a flourish under the name
      const w = Math.min(c.width * 0.8, g.measureText(name).width + 30);
      g.strokeStyle = ink;
      g.lineCap = "round";
      g.lineWidth = 2.2 * dpr.current;
      g.beginPath();
      g.moveTo(-w / 2, px * 0.28);
      g.bezierCurveTo(-w / 6, px * 0.42, w / 6, px * 0.1, w / 2, px * 0.3);
      g.stroke();
      g.restore();
      mark(true);
    },
  }));

  return (
    <div style={{ position: "relative", width: "100%", height }}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={label}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", touchAction: "none", cursor: "crosshair", borderRadius: 10, zIndex: 1 }}
      />
      {/* baseline + the ✕ */}
      <div aria-hidden style={{ position: "absolute", left: 14, right: 14, bottom: 26, borderBottom: `1.5px dashed rgba(142,31,74,.35)` }} />
      <span aria-hidden style={{ position: "absolute", left: 14, bottom: 30, font: `700 18px ${FONTS.serif}`, color: "rgba(142,31,74,.45)" }}>
        ✕
      </span>
      {empty && (
        <span aria-hidden style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", paddingBottom: 18, font: `400 22px ${FONTS.script}`, color: "rgba(142,31,74,.32)", pointerEvents: "none" }}>
          sign here with your finger ✍️
        </span>
      )}
    </div>
  );
});

export default SignaturePad;
