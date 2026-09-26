"use client";

/**
 * Frame a photo: drag it to move, zoom with the slider or the +/- buttons.
 *
 * The preview uses the exact frame shape it will be shown in — a circle for the
 * main photo, a 4:5 polaroid for gallery photos — and the exact same
 * `cropStyle()` the published page uses, so what they set is what they get.
 */

import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Minus, Move, Plus, RotateCcw, ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from "lucide-react";
import { CROP_DEFAULT, CROP_MAX_SCALE, HMH, LOVE, clampCrop, cropStyle, type Crop } from "./types";

export default function PhotoAdjuster({
  open,
  src,
  crop,
  shape,
  title,
  onChange,
  onClose,
  onReplace,
}: {
  open: boolean;
  src: string;
  crop: Crop;
  shape: "circle" | "portrait";
  title: string;
  onChange: (c: Crop) => void;
  onClose: () => void;
  /** Optional "change photo" action shown in the footer. */
  onReplace?: () => void;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; x: number; y: number; start: Crop } | null>(null);
  const [dragging, setDragging] = useState(false);

  const set = useCallback((patch: Partial<Crop>) => onChange(clampCrop({ ...crop, ...patch })), [crop, onChange]);

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, start: crop };
    setDragging(true);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    const box = frameRef.current?.getBoundingClientRect();
    if (!d || d.id !== e.pointerId || !box) return;
    // Dragging the photo right reveals more of its left side, so position
    // moves the other way. Zoomed in, the same drag covers less of the photo.
    const k = 140 / (d.start.scale / 100);
    onChange(clampCrop({
      ...d.start,
      x: d.start.x - ((e.clientX - d.x) / box.width) * k,
      y: d.start.y - ((e.clientY - d.y) / box.height) * k,
    }));
  };
  const endDrag = () => { drag.current = null; setDragging(false); };

  const onWheel = (e: React.WheelEvent) => set({ scale: crop.scale - e.deltaY * 0.25 });

  const nudge = (dx: number, dy: number) => set({ x: crop.x + dx, y: crop.y + dy });

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center sm:p-6"
          style={{ background: "rgba(14,14,18,.72)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-[440px] rounded-t-[28px] sm:rounded-[28px] px-5 pt-5 pb-6"
            style={{ background: HMH.bg, color: HMH.ink, fontFamily: HMH.body, paddingBottom: "calc(24px + env(safe-area-inset-bottom, 0px))" }}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold" style={{ fontFamily: HMH.display }}>{title}</h4>
              <button
                onClick={() => onChange({ ...CROP_DEFAULT })}
                className="inline-flex items-center gap-1 text-xs font-semibold rounded-full px-3 py-1.5 border"
                style={{ borderColor: HMH.border, color: HMH.muted }}
              >
                <RotateCcw size={12} /> Reset
              </button>
            </div>

            {/* The frame, in its real shape */}
            <div className="mt-4 flex justify-center">
              <div
                ref={frameRef}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                onWheel={onWheel}
                className="relative overflow-hidden select-none"
                style={{
                  width: shape === "circle" ? "min(68vw, 260px)" : "min(58vw, 220px)",
                  aspectRatio: shape === "circle" ? "1 / 1" : "4 / 5",
                  borderRadius: shape === "circle" ? "50%" : 14,
                  background: "#EDE7DF",
                  boxShadow: `0 0 0 4px ${LOVE.blush}, 0 20px 40px -18px rgba(0,0,0,.5)`,
                  cursor: dragging ? "grabbing" : "grab",
                  touchAction: "none",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" draggable={false} style={{ ...cropStyle(crop), pointerEvents: "none" }} />
                {/* rule-of-thirds guide while dragging */}
                {dragging && (
                  <span
                    aria-hidden
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundImage:
                        "linear-gradient(90deg, transparent 33.1%, rgba(255,255,255,.55) 33.3%, transparent 33.5%, transparent 66.5%, rgba(255,255,255,.55) 66.7%, transparent 66.9%), linear-gradient(180deg, transparent 33.1%, rgba(255,255,255,.55) 33.3%, transparent 33.5%, transparent 66.5%, rgba(255,255,255,.55) 66.7%, transparent 66.9%)",
                    }}
                  />
                )}
              </div>
            </div>
            <p className="mt-3 text-center text-[11px] inline-flex w-full items-center justify-center gap-1" style={{ color: HMH.muted }}>
              <Move size={12} /> drag the photo to move it
            </p>

            {/* Zoom */}
            <div className="mt-4 flex items-center gap-3">
              <RoundBtn label="Zoom out" onClick={() => set({ scale: crop.scale - 10 })}><Minus size={16} /></RoundBtn>
              <input
                type="range"
                min={100}
                max={CROP_MAX_SCALE}
                step={1}
                value={crop.scale}
                onChange={(e) => set({ scale: Number(e.target.value) })}
                aria-label="Zoom"
                className="flex-1"
                style={{ accentColor: LOVE.rose }}
              />
              <RoundBtn label="Zoom in" onClick={() => set({ scale: crop.scale + 10 })}><Plus size={16} /></RoundBtn>
            </div>
            <p className="mt-1 text-center text-[11px] font-semibold" style={{ color: LOVE.roseDeep }}>
              {Math.round(crop.scale)}% zoom
            </p>

            {/* Fine nudges — easier than dragging for small moves */}
            <div className="mt-3 flex items-center justify-center gap-2">
              <RoundBtn label="Move left" onClick={() => nudge(-4, 0)}><ArrowLeft size={15} /></RoundBtn>
              <RoundBtn label="Move up" onClick={() => nudge(0, -4)}><ArrowUp size={15} /></RoundBtn>
              <RoundBtn label="Move down" onClick={() => nudge(0, 4)}><ArrowDown size={15} /></RoundBtn>
              <RoundBtn label="Move right" onClick={() => nudge(4, 0)}><ArrowRight size={15} /></RoundBtn>
            </div>

            <div className="mt-5 flex gap-2.5">
              {onReplace && (
                <button
                  onClick={onReplace}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold border"
                  style={{ borderColor: HMH.border, color: HMH.ink, background: "#fff" }}
                >
                  Change photo
                </button>
              )}
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl text-sm font-bold inline-flex items-center justify-center gap-1.5"
                style={{ background: HMH.ink, color: "#fff", fontFamily: HMH.display }}
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
      style={{ borderColor: HMH.border, background: "#fff", color: HMH.ink }}
    >
      {children}
    </button>
  );
}
