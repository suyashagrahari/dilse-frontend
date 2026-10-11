"use client";

// ─── Frame a photo — drag to move, pinch / wheel / slider to zoom ────────────
//
// The frame is the EXACT shape the day shows photos in (day.photoAspect) and
// draws the photo with the same math as kit/CroppedPhoto (object-fit: cover,
// object-position = focal point, scale about the focal point), so what they
// frame here is what the recipient sees. Stores the existing crop model
// (cropX / cropY 0–100, scale 100–300) — nothing new on the wire.
//
// Rendered in a portal: the edit sheet animates with a transform, which would
// otherwise trap `position: fixed` inside it.

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

export interface Crop {
  x: number;
  y: number;
  scale: number;
}
export const CROP_DEFAULT: Crop = { x: 50, y: 50, scale: 100 };
const MAX_SCALE = 300;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
export const clampCrop = (c: Crop): Crop => ({
  x: clamp(Number.isFinite(c.x) ? c.x : 50, 0, 100),
  y: clamp(Number.isFinite(c.y) ? c.y : 50, 0, 100),
  scale: clamp(Number.isFinite(c.scale) ? c.scale : 100, 100, MAX_SCALE),
});

/** The one framing rule (mirrors kit/CroppedPhoto). */
export const cropImgStyle = (c: Crop): CSSProperties => ({
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  objectPosition: `${c.x}% ${c.y}%`,
  transform: c.scale > 100 ? `scale(${c.scale / 100})` : undefined,
  transformOrigin: `${c.x}% ${c.y}%`,
  userSelect: "none",
  pointerEvents: "none",
});

type Pt = { x: number; y: number };

export default function PhotoCropper({
  open,
  src,
  crop,
  aspect,
  title,
  themeStyle,
  onChange,
  onClose,
  onReplace,
}: {
  open: boolean;
  src: string;
  crop: Crop;
  /** width / height of the day's photo frame. */
  aspect: number;
  title: string;
  /** The day's CSS variables (the portal leaves the sheet's DOM). */
  themeStyle?: CSSProperties;
  onChange: (c: Crop) => void;
  onClose: () => void;
  onReplace?: () => void;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef<HTMLButtonElement>(null);
  const pointers = useRef(new Map<number, Pt>());
  const gesture = useRef<{ start: Crop; origin: Pt; dist: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [touched, setTouched] = useState(false);
  const cropRef = useRef(crop);
  useLayoutEffect(() => {
    cropRef.current = crop;
  });

  // Each time it opens, show the "drag to move" hint again (render-time reset, no effect).
  const [wasOpen, setWasOpen] = useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (open) setTouched(false);
  }

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => frameRef.current?.focus({ preventScroll: true }), 60);
    return () => window.clearTimeout(t);
  }, [open]);

  const set = (patch: Partial<Crop>) => onChange(clampCrop({ ...cropRef.current, ...patch }));

  const centroid = (): { c: Pt; d: number } => {
    const pts = [...pointers.current.values()];
    if (pts.length === 1) return { c: pts[0], d: 0 };
    const [a, b] = pts;
    return { c: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, d: Math.hypot(a.x - b.x, a.y - b.y) };
  };
  const reanchor = (from: Crop) => {
    if (!pointers.current.size) {
      gesture.current = null;
      return;
    }
    const { c, d } = centroid();
    gesture.current = { start: from, origin: c, dist: d };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    reanchor(cropRef.current);
    setDragging(true);
    setTouched(true);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    const box = frameRef.current?.getBoundingClientRect();
    if (!g || !box) return;
    const { c, d } = centroid();
    const scale = g.dist > 0 && d > 0 ? g.start.scale * (d / g.dist) : g.start.scale;
    // Dragging right reveals more of the left, so the focal point moves the other
    // way; zoomed in, the same drag covers less of the photo.
    const k = 140 / (scale / 100);
    onChange(clampCrop({ scale, x: g.start.x - ((c.x - g.origin.x) / box.width) * k, y: g.start.y - ((c.y - g.origin.y) / box.height) * k }));
  };
  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    reanchor(cropRef.current);
    if (!pointers.current.size) setDragging(false);
  };

  // Wheel / trackpad pinch zoom. Non-passive so the page doesn't scroll.
  useEffect(() => {
    const el = frameRef.current;
    if (!open || !el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setTouched(true);
      const c = cropRef.current;
      onChange(clampCrop({ ...c, scale: c.scale * Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0025)) }));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [open, onChange]);

  const onKey = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 2;
    const c = cropRef.current;
    const map: Record<string, Partial<Crop>> = {
      ArrowLeft: { x: c.x + step },
      ArrowRight: { x: c.x - step },
      ArrowUp: { y: c.y + step },
      ArrowDown: { y: c.y - step },
      "+": { scale: c.scale + 10 },
      "=": { scale: c.scale + 10 },
      "-": { scale: c.scale - 10 },
    };
    if (map[e.key]) {
      e.preventDefault();
      set(map[e.key]);
    }
  };

  const isDefault = crop.x === 50 && crop.y === 50 && crop.scale === 100;
  const frameW = aspect >= 1 ? "min(100%, 400px)" : `min(100%, ${Math.round(400 * aspect)}px, calc(52dvh * ${aspect}))`;

  if (typeof document === "undefined") return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="vc-wrap"
          style={themeStyle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          onKeyDown={(e) => {
            // Esc closes the cropper only — never the edit sheet underneath.
            if (e.key === "Escape") {
              e.stopPropagation();
              onClose();
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <motion.div
            className="vc-card"
            initial={{ y: 30, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 360, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="vc-top">
              <div>
                <p className="vc-title">{title}</p>
                <p className="vc-sub">This is exactly how it&apos;s framed on their screen.</p>
              </div>
              <button type="button" className="vc-done" ref={doneRef} onClick={onClose}>Done</button>
            </div>

            <div
              ref={frameRef}
              className={`vc-frame${dragging ? " is-drag" : ""}`}
              style={{ width: frameW, aspectRatio: String(aspect) }}
              tabIndex={0}
              role="application"
              aria-label="Photo framing. Drag to move, pinch or use plus and minus to zoom, arrow keys to nudge."
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onKeyDown={onKey}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" draggable={false} style={cropImgStyle(crop)} />
              <span className={`vc-grid${dragging ? " is-on" : ""}`} aria-hidden />
              {!touched && (
                <span className="vc-hint" aria-hidden>
                  <span className="vc-hand">👆</span> Drag to move · pinch or scroll to zoom
                </span>
              )}
            </div>

            <div className="vc-zoom">
              <button type="button" className="vc-round" onClick={() => set({ scale: crop.scale - 15 })} disabled={crop.scale <= 100} aria-label="Zoom out">−</button>
              <input
                type="range"
                min={100}
                max={MAX_SCALE}
                step={1}
                value={Math.round(crop.scale)}
                onChange={(e) => {
                  setTouched(true);
                  set({ scale: Number(e.target.value) });
                }}
                aria-label="Zoom"
                style={{ ["--p" as string]: `${((crop.scale - 100) / (MAX_SCALE - 100)) * 100}%` }}
              />
              <button type="button" className="vc-round" onClick={() => set({ scale: crop.scale + 15 })} disabled={crop.scale >= MAX_SCALE} aria-label="Zoom in">+</button>
              <output className="vc-pct">{(crop.scale / 100).toFixed(1)}×</output>
            </div>

            <div className="vc-acts">
              <button type="button" className="vc-ghost" onClick={() => onChange(CROP_DEFAULT)} disabled={isDefault}>↺ Reset</button>
              {onReplace && (
                <button type="button" className="vc-ghost" onClick={onReplace}>⇄ Use another photo</button>
              )}
            </div>
          </motion.div>
          <style>{CSS}</style>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

const CSS = `
.vc-wrap { position: fixed; inset: 0; z-index: 260; display: flex; align-items: flex-end; justify-content: center;
  background: rgba(20,8,16,.72); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); font-family: var(--vw-font-ui, system-ui); }
@media (min-width: 640px) { .vc-wrap { align-items: center; padding: 24px; } }
.vc-card { width: 100%; max-width: 480px; display: grid; justify-items: center; gap: 14px; padding: 18px 16px calc(18px + env(safe-area-inset-bottom, 0px));
  background: var(--vw-paper, #fff); color: var(--vw-paper-ink, #2a1a22); border-radius: 26px 26px 0 0; box-shadow: 0 -10px 40px rgba(0,0,0,.3); }
@media (min-width: 640px) { .vc-card { border-radius: 26px; padding: 22px; } }
.vc-top { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.vc-title { margin: 0; font-weight: 700; font-size: 18px; }
.vc-sub { margin: 2px 0 0; font-size: 12.5px; opacity: .7; }
.vc-done { flex: none; min-height: 44px; padding: 0 20px; border-radius: 14px; border: 0; cursor: pointer; font: 700 15px var(--vw-font-ui, system-ui);
  background: var(--vw-accent, #d0245f); color: var(--vw-accent-ink, #fff); box-shadow: 0 4px 0 var(--vw-accent-deep, #8e0b20); }
.vc-frame { position: relative; overflow: hidden; border-radius: 14px; background: #1a1016; cursor: grab; touch-action: none; outline: none;
  box-shadow: 0 0 0 3px #fff, 0 0 0 5px var(--vw-accent, #d0245f), 0 18px 40px -16px rgba(0,0,0,.6); }
.vc-frame:focus-visible { box-shadow: 0 0 0 3px #fff, 0 0 0 6px var(--vw-accent-deep, #8e0b20), 0 18px 40px -16px rgba(0,0,0,.6); }
.vc-frame.is-drag { cursor: grabbing; }
.vc-grid { position: absolute; inset: 0; pointer-events: none; opacity: 0; transition: opacity .2s;
  background:
    linear-gradient(90deg, transparent calc(33.33% - .5px), rgba(255,255,255,.7) calc(33.33% - .5px), rgba(255,255,255,.7) calc(33.33% + .5px), transparent calc(33.33% + .5px), transparent calc(66.66% - .5px), rgba(255,255,255,.7) calc(66.66% - .5px), rgba(255,255,255,.7) calc(66.66% + .5px), transparent calc(66.66% + .5px)),
    linear-gradient(180deg, transparent calc(33.33% - .5px), rgba(255,255,255,.7) calc(33.33% - .5px), rgba(255,255,255,.7) calc(33.33% + .5px), transparent calc(33.33% + .5px), transparent calc(66.66% - .5px), rgba(255,255,255,.7) calc(66.66% - .5px), rgba(255,255,255,.7) calc(66.66% + .5px), transparent calc(66.66% + .5px)); }
.vc-grid.is-on { opacity: 1; }
.vc-hint { position: absolute; left: 50%; bottom: 12px; transform: translateX(-50%); white-space: nowrap; padding: 8px 14px; border-radius: 99px;
  background: rgba(0,0,0,.6); color: #fff; font-size: 13px; font-weight: 600; pointer-events: none; }
.vc-hand { display: inline-block; animation: vc-wave 1.6s ease-in-out infinite; }
@keyframes vc-wave { 0%,100% { transform: translateX(-4px); } 50% { transform: translateX(6px); } }
.vc-zoom { width: 100%; max-width: 400px; display: flex; align-items: center; gap: 10px; }
.vc-zoom input { flex: 1; min-width: 0; height: 44px; appearance: none; -webkit-appearance: none; background: transparent; cursor: pointer; }
.vc-zoom input::-webkit-slider-runnable-track { height: 6px; border-radius: 6px; background: linear-gradient(90deg, var(--vw-accent, #d0245f) var(--p), var(--vw-edge, #eee) var(--p)); }
.vc-zoom input::-moz-range-track { height: 6px; border-radius: 6px; background: var(--vw-edge, #eee); }
.vc-zoom input::-moz-range-progress { height: 6px; border-radius: 6px; background: var(--vw-accent, #d0245f); }
.vc-zoom input::-webkit-slider-thumb { -webkit-appearance: none; width: 26px; height: 26px; margin-top: -10px; border-radius: 50%; background: #fff; border: 3px solid var(--vw-accent, #d0245f); box-shadow: 0 2px 6px rgba(0,0,0,.25); }
.vc-zoom input::-moz-range-thumb { width: 22px; height: 22px; border-radius: 50%; background: #fff; border: 3px solid var(--vw-accent, #d0245f); }
.vc-zoom input:focus-visible { outline: 3px solid var(--vw-soft, #fde); outline-offset: 2px; border-radius: 8px; }
.vc-round { flex: none; width: 44px; height: 44px; border-radius: 50%; border: 2px solid var(--vw-edge, #eee); background: #fff; color: var(--vw-paper-ink, #222); font-size: 22px; cursor: pointer; }
.vc-round:disabled { opacity: .35; cursor: default; }
.vc-pct { min-width: 38px; text-align: right; font-weight: 700; font-size: 13px; font-variant-numeric: tabular-nums; }
.vc-acts { width: 100%; max-width: 400px; display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }
.vc-ghost { min-height: 44px; padding: 0 16px; border-radius: 14px; border: 2px solid var(--vw-edge, #eee); background: #fff; color: var(--vw-paper-ink, #222); font: 600 14px var(--vw-font-ui, system-ui); cursor: pointer; }
.vc-ghost:disabled { opacity: .4; cursor: default; }
.vc-ghost:focus-visible, .vc-round:focus-visible, .vc-done:focus-visible { outline: 3px solid var(--vw-accent-deep, #8e0b20); outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) { .vc-hand { animation: none; } }
`;
