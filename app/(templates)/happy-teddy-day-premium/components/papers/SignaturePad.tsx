"use client";

// Fingertip signature in fountain-pen ink, hand-rolled (no dependency): each new point makes a quadratic Bézier
// between segment midpoints; the nib width follows a low-pass-filtered velocity (fast = thin, slow = thick) and is
// stamped as small discs so the stroke tapers. DPR capped at 2. Adapted from the $2 Promise Day pad.

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import { canvasFont } from "../../../_valentine/kit";

export interface SignatureHandle {
  clear: () => void;
  isEmpty: () => boolean;
  /** PNG data URL of the ink (transparent), or null when empty. */
  toDataURL: () => string | null;
  /** Fallback for anyone who can't sign: writes the name in the serif italic. */
  signName: (name: string) => void;
  /** Width / height of the pad (for drawing the ink elsewhere without cropping it). */
  aspect: () => number;
}

type Pt = { x: number; y: number; t: number };

const MIN_W = 1.2;
const MAX_W = 4.2;
const FILTER = 0.7;

export const SignaturePad = forwardRef<SignatureHandle, { ink?: string; onInk?: (has: boolean) => void; onStroke?: () => void; label: string; disabled?: boolean }>(
  function SignaturePad({ ink = "#1F2F5C", onInk, onStroke, label, disabled }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const has = useRef(false);
    const stroke = useRef<{ id: number; pts: Pt[]; v: number; w: number } | null>(null);
    const dpr = useRef(1);
    const onInkRef = useRef(onInk);
    useEffect(() => {
      onInkRef.current = onInk;
    });

    const ctx = () => canvasRef.current?.getContext("2d") ?? null;

    const size = useCallback(() => {
      const c = canvasRef.current;
      if (!c) return;
      const r = c.getBoundingClientRect();
      dpr.current = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.round(r.width * dpr.current);
      const h = Math.round(r.height * dpr.current);
      if (!w || !h || (c.width === w && c.height === h)) return;
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
      onInkRef.current?.(v);
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
      if (disabled) return;
      e.preventDefault();
      (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
      size();
      const p = point(e);
      stroke.current = { id: e.pointerId, pts: [p], v: 0, w: (MIN_W + MAX_W) / 2 };
      const g = ctx();
      if (g) {
        g.fillStyle = ink;
        dot(g, p.x, p.y, stroke.current.w * 0.8);
      }
      mark(true);
      onStroke?.();
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
      const vel = dist / dpr.current / dt;
      s.v = FILTER * vel + (1 - FILTER) * s.v;
      const w = Math.max(MIN_W, Math.min(MAX_W, MAX_W / (s.v + 1)));
      s.pts.push(p);
      const n = s.pts.length;
      g.fillStyle = ink;
      if (n < 3) {
        const steps = Math.ceil(dist / (0.9 * dpr.current));
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
      for (let k = 1; k <= steps; k++) {
        const t = k / steps;
        const u = 1 - t;
        dot(g, u * u * m1.x + 2 * u * t * b.x + t * t * m2.x, u * u * m1.y + 2 * u * t * b.y + t * t * m2.y, s.w + (w - s.w) * t);
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
      aspect() {
        const c = canvasRef.current;
        return c && c.height ? c.width / c.height : 3.4;
      },
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
        size();
        const c = canvasRef.current;
        const g = ctx();
        if (!c || !g) return;
        g.clearRect(0, 0, c.width, c.height);
        const px = Math.min(c.height * 0.62, (c.width * 0.8) / Math.max(3, name.length * 0.48));
        g.save();
        g.translate(c.width / 2, c.height * 0.7);
        g.rotate(-0.05);
        g.font = canvasFont("serif", px, 400, true);
        g.fillStyle = ink;
        g.textAlign = "center";
        g.textBaseline = "alphabetic";
        g.fillText(name, 0, 0, c.width * 0.86);
        const w = Math.min(c.width * 0.76, g.measureText(name).width + 24);
        g.strokeStyle = ink;
        g.lineCap = "round";
        g.lineWidth = 1.8 * dpr.current;
        g.beginPath();
        g.moveTo(-w / 2, px * 0.2);
        g.bezierCurveTo(-w / 6, px * 0.34, w / 6, px * 0.04, w / 2, px * 0.22);
        g.stroke();
        g.restore();
        mark(true);
      },
    }));

    return (
      <canvas
        ref={canvasRef}
        className="ap-sigCanvas"
        role="img"
        aria-label={label}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      />
    );
  },
);
