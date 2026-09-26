"use client";

// ─── Frame a photo: drag to move, pinch / slider / wheel to zoom ─────────────
//
// The preview is the reel card's exact 4:5 shape and uses the same
// `cropStyle()` every surface renders with, so what they frame here is what the
// recipient sees on the reel, in the viewer and on the radio's screen.
//
// Touch: one finger pans, two fingers pinch-zoom around the photo. Mouse: drag
// pans, the wheel zooms. Buttons cover everyone else, and arrow nudges handle
// the last few pixels a finger can't.

import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, Minus, Move, Plus, RotateCcw } from "lucide-react";
import { CROP_DEFAULT, CROP_MAX_SCALE, clampCrop, cropStyle, type Crop } from "./types";

const INK = "#2A1A12";
const MUTED = "#8A776A";
const RULE = "#EDDCC9";
const ACCENT = "#B4441F";

type Pt = { x: number; y: number };

export default function PhotoAdjuster({
  open,
  src,
  crop,
  title,
  onChange,
  onClose,
  onReplace,
}: {
  open: boolean;
  src: string;
  crop: Crop;
  title: string;
  onChange: (c: Crop) => void;
  onClose: () => void;
  onReplace?: () => void;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, Pt>());
  const gesture = useRef<{ start: Crop; origin: Pt; dist: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  const set = useCallback((patch: Partial<Crop>) => onChange(clampCrop({ ...crop, ...patch })), [crop, onChange]);

  const centroid = (): { c: Pt; d: number } => {
    const pts = [...pointers.current.values()];
    if (pts.length === 1) return { c: pts[0], d: 0 };
    const [a, b] = pts;
    return { c: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, d: Math.hypot(a.x - b.x, a.y - b.y) };
  };

  // Re-anchor whenever a finger is added or lifted, so the photo never jumps.
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
    reanchor(crop);
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    const box = frameRef.current?.getBoundingClientRect();
    if (!g || !box) return;
    const { c, d } = centroid();
    const scale = g.dist > 0 && d > 0 ? g.start.scale * (d / g.dist) : g.start.scale;
    // Dragging right reveals more of the left side, so the focal point moves the
    // other way; zoomed in, the same drag covers less of the photo.
    const k = 140 / (scale / 100);
    onChange(
      clampCrop({
        scale,
        x: g.start.x - ((c.x - g.origin.x) / box.width) * k,
        y: g.start.y - ((c.y - g.origin.y) / box.height) * k,
      }),
    );
  };

  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    reanchor(crop);
    if (!pointers.current.size) setDragging(false);
  };

  const nudge = (dx: number, dy: number) => set({ x: crop.x + dx, y: crop.y + dy });

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[260] flex items-end sm:items-center justify-center sm:p-6"
          style={{ background: "rgba(14,8,4,.74)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full rounded-t-[28px] sm:rounded-[28px] px-5 pt-5"
            style={{
              maxWidth: 440,
              background: "#FFFDFB",
              color: INK,
              paddingBottom: "calc(22px + env(safe-area-inset-bottom, 0px))",
            }}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold">{title}</h4>
              <button
                type="button"
                onClick={() => onChange({ ...CROP_DEFAULT })}
                className="inline-flex items-center gap-1 text-xs font-semibold rounded-full px-3 py-1.5 border"
                style={{ borderColor: RULE, color: MUTED }}
              >
                <RotateCcw size={12} /> Reset
              </button>
            </div>

            <div className="mt-4 flex justify-center">
              <div
                ref={frameRef}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                onWheel={(e) => set({ scale: crop.scale - e.deltaY * 0.25 })}
                className="relative overflow-hidden select-none"
                style={{
                  width: "min(62vw, 250px)",
                  aspectRatio: "4 / 5",
                  borderRadius: 10,
                  background: "#EDE7DF",
                  boxShadow: "0 0 0 5px #fff, 0 0 0 6px #EDDCC9, 0 22px 40px -18px rgba(0,0,0,.5)",
                  cursor: dragging ? "grabbing" : "grab",
                  touchAction: "none",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" draggable={false} style={{ ...cropStyle(crop), pointerEvents: "none" }} />
                {dragging && (
                  <span
                    aria-hidden
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundImage:
                        "linear-gradient(90deg, transparent 33.1%, rgba(255,255,255,.6) 33.3%, transparent 33.5%, transparent 66.5%, rgba(255,255,255,.6) 66.7%, transparent 66.9%), linear-gradient(180deg, transparent 33.1%, rgba(255,255,255,.6) 33.3%, transparent 33.5%, transparent 66.5%, rgba(255,255,255,.6) 66.7%, transparent 66.9%)",
                    }}
                  />
                )}
              </div>
            </div>
            <p className="mt-3 text-center text-[11px] flex items-center justify-center gap-1" style={{ color: MUTED }}>
              <Move size={12} /> drag to move · pinch or use the slider to zoom
            </p>

            <div className="mt-4 flex items-center gap-3">
              <RoundBtn label="Zoom out" onClick={() => set({ scale: crop.scale - 10 })}>
                <Minus size={16} />
              </RoundBtn>
              <input
                type="range"
                min={100}
                max={CROP_MAX_SCALE}
                step={1}
                value={crop.scale}
                onChange={(e) => set({ scale: Number(e.target.value) })}
                aria-label="Zoom"
                className="flex-1"
                style={{ accentColor: ACCENT }}
              />
              <RoundBtn label="Zoom in" onClick={() => set({ scale: crop.scale + 10 })}>
                <Plus size={16} />
              </RoundBtn>
            </div>
            <p className="mt-1 text-center text-[11px] font-semibold" style={{ color: ACCENT }}>
              {Math.round(crop.scale)}% zoom
            </p>

            <div className="mt-3 flex items-center justify-center gap-2">
              <RoundBtn label="Move left" onClick={() => nudge(-4, 0)}><ArrowLeft size={15} /></RoundBtn>
              <RoundBtn label="Move up" onClick={() => nudge(0, -4)}><ArrowUp size={15} /></RoundBtn>
              <RoundBtn label="Move down" onClick={() => nudge(0, 4)}><ArrowDown size={15} /></RoundBtn>
              <RoundBtn label="Move right" onClick={() => nudge(4, 0)}><ArrowRight size={15} /></RoundBtn>
            </div>

            <div className="mt-5 flex gap-2.5">
              {onReplace && (
                <button
                  type="button"
                  onClick={onReplace}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold border"
                  style={{ borderColor: RULE, color: INK, background: "#fff" }}
                >
                  Change photo
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl text-sm font-bold inline-flex items-center justify-center gap-1.5 text-white"
                style={{ background: "linear-gradient(135deg,#C2551F,#8c3b2a)" }}
              >
                <Check size={16} /> Done
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function RoundBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="w-10 h-10 rounded-full grid place-items-center border transition-transform active:scale-90 shrink-0"
      style={{ borderColor: RULE, background: "#fff", color: INK }}
    >
      {children}
    </button>
  );
}
