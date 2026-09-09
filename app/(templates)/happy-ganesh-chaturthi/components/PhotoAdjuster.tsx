"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Loader2, Minus, Plus, RotateCcw } from "lucide-react";
import { GC, BRAND_GRADIENT, CARD_BORDER, CARD_SHADOW } from "./theme";
import {
  INITIAL_CROP,
  ZOOM_MAX,
  ZOOM_MIN,
  bakeSquare,
  clampOffset,
  offsetRange,
  sourceRect,
  zoomAround,
  type CropState,
} from "./photoCrop";

// ─── Pick the square ─────────────────────────────────────────────────────────
//
// Opens on the photo she just chose and lets her decide what the square keeps:
// drag to move it, pinch or scroll or the slider to zoom, and two sliders for
// horizontal and vertical position when a drag is too coarse.
//
// ── WHY THE PREVIEW IS A CANVAS AND NOT AN <img> WITH A TRANSFORM ───────────
//
// The obvious build is an `<img>` inside `overflow: hidden` with
// `object-position` and `transform: scale()`, which is what two other templates
// in this repo do. It is less code and it is wrong here, because this crop gets
// BAKED: the file that uploads is drawn by `drawImage` from a source rectangle,
// and the CSS version is a second, independent implementation of the same
// geometry. Any disagreement between them — a rounding rule, how `transform`
// interacts with `object-position`, a half-pixel of border — ships as "the
// saved photo is not the photo I chose", which is unfalsifiable from a
// screenshot and miserable to chase.
//
// Drawing the preview through `sourceRect` — the same function, the same state,
// the same clamps, only a smaller destination — makes that class of bug
// impossible by construction. Redrawing one bitmap per pointer move is nothing.
//
// ── WHY A PORTAL ────────────────────────────────────────────────────────────
//
// Same reason as `RitualTakeover`: `position: fixed` resolves against a
// transformed ancestor, and this opens from inside a `motion.div` sheet that is
// mid-spring when it mounts. Declared in place it would be clipped into the
// sheet.

/** `document.body` never changes identity, so there is nothing to subscribe to. */
const NO_SUBSCRIBE = () => () => {};

/** CSS px of the square she adjusts in. The bake output is independent of this. */
const VIEWPORT = 296;

export default function PhotoAdjuster({
  bitmap,
  out,
  title,
  busy,
  onConfirm,
  onCancel,
}: {
  bitmap: ImageBitmap;
  /** Edge of the baked square in px — 1080 hero, 720 memory. */
  out: number;
  title: string;
  /** True while the parent is uploading, so the button can say so. */
  busy: boolean;
  onConfirm: (file: File) => void;
  onCancel: () => void;
}) {
  const host = useSyncExternalStore(NO_SUBSCRIBE, () => document.body, () => null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [crop, setCrop] = useState<CropState>(() =>
    clampOffset(centred(bitmap), bitmap.width, bitmap.height, VIEWPORT)
  );
  const [baking, setBaking] = useState(false);

  // Live pointer state. In a ref, not state: a drag fires dozens of moves a
  // second and none of them should queue a React render of their own — the
  // canvas redraw below is the only thing that has to keep up.
  const drag = useRef<{ id: number; x: number; y: number } | null>(null);
  const pinch = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchStart = useRef<{ dist: number; zoom: number } | null>(null);

  const range = offsetRange(crop, bitmap.width, bitmap.height, VIEWPORT);

  // ── Draw ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Back the canvas at device resolution or the preview is visibly softer
    // than the photograph she is judging.
    const dpr = Math.min(3, window.devicePixelRatio || 1);
    if (canvas.width !== VIEWPORT * dpr) {
      canvas.width = VIEWPORT * dpr;
      canvas.height = VIEWPORT * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, VIEWPORT, VIEWPORT);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const { sx, sy, size } = sourceRect(crop, bitmap.width, bitmap.height, VIEWPORT);
    ctx.drawImage(bitmap, sx, sy, size, size, 0, 0, VIEWPORT, VIEWPORT);
    ctx.restore();
  }, [crop, bitmap]);

  const apply = useCallback(
    (next: CropState) => setCrop(clampOffset(next, bitmap.width, bitmap.height, VIEWPORT)),
    [bitmap]
  );

  // ── Pointers ──────────────────────────────────────────────────────────────
  const onPointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pinch.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pinch.current.size === 2) {
      const [a, b] = [...pinch.current.values()];
      pinchStart.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), zoom: crop.zoom };
      drag.current = null;
      return;
    }
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
  }, [crop.zoom]);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!pinch.current.has(e.pointerId)) return;
      pinch.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      // Two fingers → zoom about the midpoint between them.
      if (pinch.current.size === 2 && pinchStart.current) {
        const [a, b] = [...pinch.current.values()];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinchStart.current.dist > 0) {
          const rect = e.currentTarget.getBoundingClientRect();
          apply(
            zoomAround(
              crop,
              pinchStart.current.zoom * (dist / pinchStart.current.dist),
              VIEWPORT,
              { x: (a.x + b.x) / 2 - rect.left, y: (a.y + b.y) / 2 - rect.top }
            )
          );
        }
        return;
      }

      const d = drag.current;
      if (!d || d.id !== e.pointerId) return;
      const dx = e.clientX - d.x;
      const dy = e.clientY - d.y;
      drag.current = { id: d.id, x: e.clientX, y: e.clientY };
      apply({ ...crop, offsetX: crop.offsetX + dx, offsetY: crop.offsetY + dy });
    },
    [crop, apply]
  );

  const endPointer = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    pinch.current.delete(e.pointerId);
    if (pinch.current.size < 2) pinchStart.current = null;
    if (drag.current?.id === e.pointerId) drag.current = null;
  }, []);

  // Wheel zoom for desktop. Non-passive so the page behind cannot scroll while
  // she is zooming — React's onWheel is passive, hence the manual listener.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      apply(
        zoomAround(crop, crop.zoom * (e.deltaY < 0 ? 1.08 : 1 / 1.08), VIEWPORT, {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        })
      );
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", onWheel);
  }, [crop, apply]);

  const confirm = useCallback(async () => {
    setBaking(true);
    try {
      onConfirm(await bakeSquare(bitmap, crop, VIEWPORT, out));
    } finally {
      setBaking(false);
    }
  }, [bitmap, crop, out, onConfirm]);

  if (!host) return null;

  const working = baking || busy;

  return createPortal(
    <motion.div
      className="gc-root"
      role="dialog"
      aria-label={title}
      aria-modal
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 120,
        display: "grid",
        placeItems: "center",
        padding: 16,
        background: "rgba(43,26,16,0.66)",
        backdropFilter: "blur(3px)",
      }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.94, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 330, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 360,
          maxHeight: "94dvh",
          overflowY: "auto",
          borderRadius: 20,
          background: GC.paper,
          border: CARD_BORDER,
          boxShadow: CARD_SHADOW,
          padding: 16,
        }}
      >
        <p
          className="gc-display"
          style={{ fontSize: 16, fontWeight: 700, color: GC.maroon, margin: "0 0 3px" }}
        >
          {title}
        </p>
        <p style={{ fontSize: 12, color: GC.muted, margin: "0 0 12px" }}>
          Drag to move it, pinch or scroll to zoom — or use the sliders below.
          What you see here is exactly what the page will show.
        </p>

        {/* ── THE SHAPE HAS TO MATCH THE FRAME ON THE PAGE ────────────────
         *
         * A square with a 6px radius, because that is exactly what
         * `.gc-frame-window` is. It was 22px while the page's frame was a
         * circle, and both times the mismatch costs the same thing: the sender
         * composes inside one shape and the page crops to another, so a face
         * they carefully centred comes out clipped.
         *
         * If the frame's radius changes, change this with it. */}
        <div
          style={{
            position: "relative",
            width: VIEWPORT,
            height: VIEWPORT,
            maxWidth: "100%",
            margin: "0 auto",
            borderRadius: 6,
            overflow: "hidden",
            background: "#e9dcc6",
            boxShadow: "inset 0 0 0 1px rgba(61,35,23,0.18)",
          }}
        >
          <canvas
            ref={canvasRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endPointer}
            onPointerCancel={endPointer}
            style={{
              width: VIEWPORT,
              height: VIEWPORT,
              maxWidth: "100%",
              display: "block",
              cursor: working ? "default" : "grab",
              // Without this the browser claims the gesture for scrolling and
              // a vertical drag pans the sheet instead of the photograph.
              touchAction: "none",
            }}
          />
          {/* Thirds, to help place a face. Pointer-transparent so it never eats
              a drag. */}
          <svg
            aria-hidden
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.28 }}
          >
            <path
              d="M33.33 0V100M66.66 0V100M0 33.33H100M0 66.66H100"
              stroke="#fffdf8"
              strokeWidth="0.5"
              fill="none"
            />
          </svg>
        </div>

        {/* ── Controls ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
          <Slider
            label="Zoom"
            value={crop.zoom}
            min={ZOOM_MIN}
            max={ZOOM_MAX}
            step={0.02}
            onChange={(v) => apply(zoomAround(crop, v, VIEWPORT))}
            left={<Minus size={13} />}
            right={<Plus size={13} />}
          />

          {/* Position sliders map onto the travel available at this zoom. At
              zoom 1 a square photo has none, so they are disabled rather than
              silently inert — a slider that moves and does nothing reads as a
              bug. */}
          <Slider
            label="Left ↔ Right"
            value={range.x === 0 ? 50 : (-crop.offsetX / range.x) * 100}
            min={0}
            max={100}
            step={0.5}
            disabled={range.x === 0}
            onChange={(v) => apply({ ...crop, offsetX: -(v / 100) * range.x })}
          />
          <Slider
            label="Up ↕ Down"
            value={range.y === 0 ? 50 : (-crop.offsetY / range.y) * 100}
            min={0}
            max={100}
            step={0.5}
            disabled={range.y === 0}
            onChange={(v) => apply({ ...crop, offsetY: -(v / 100) * range.y })}
          />
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 15, alignItems: "center" }}>
          <button
            type="button"
            onClick={() => apply(centred(bitmap))}
            disabled={working}
            aria-label="Reset"
            style={{
              minHeight: 46,
              width: 46,
              flexShrink: 0,
              borderRadius: 12,
              border: `1px solid ${GC.hairline}`,
              background: GC.surface,
              color: GC.muted,
              cursor: "pointer",
              display: "grid",
              placeItems: "center",
            }}
          >
            <RotateCcw size={15} />
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={working}
            style={{
              flex: 1,
              minHeight: 46,
              borderRadius: 12,
              border: `1px solid ${GC.hairline}`,
              background: GC.surface,
              color: GC.ink,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={working}
            className="gc-display"
            style={{
              flex: 1.4,
              minHeight: 46,
              borderRadius: 12,
              background: BRAND_GRADIENT,
              color: "#fffdf8",
              border: CARD_BORDER,
              fontSize: 14.5,
              fontWeight: 700,
              cursor: working ? "default" : "pointer",
              opacity: working ? 0.7 : 1,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
            }}
          >
            {working && <Loader2 size={14} className="animate-spin" />}
            {working ? "Saving…" : "Use this photo"}
          </button>
        </div>
      </motion.div>
    </motion.div>,
    host
  );
}

/** Start centred on the middle of the photograph, which is where the subject is. */
function centred(bitmap: ImageBitmap): CropState {
  const state = { ...INITIAL_CROP };
  const range = offsetRange(state, bitmap.width, bitmap.height, VIEWPORT);
  return { ...state, offsetX: -range.x / 2, offsetY: -range.y / 2 };
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  disabled,
  onChange,
  left,
  right,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  disabled?: boolean;
  onChange: (v: number) => void;
  left?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9, opacity: disabled ? 0.42 : 1 }}>
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: GC.muted,
          width: 78,
          flexShrink: 0,
          letterSpacing: 0.2,
        }}
      >
        {label}
      </span>
      {left && <span style={{ color: GC.muted, display: "grid" }}>{left}</span>}
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ flex: 1, minWidth: 0, accentColor: GC.maroon, cursor: disabled ? "default" : "pointer" }}
      />
      {right && <span style={{ color: GC.muted, display: "grid" }}>{right}</span>}
    </div>
  );
}
