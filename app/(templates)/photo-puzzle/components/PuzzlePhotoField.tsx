"use client";

// ─── The puzzle photo: upload + square framing, right in the form ────────────
//
// The frame IS the board: square, with the cut lines of the chosen difficulty
// drawn over it, so the sender sees exactly which faces land on which tile.
// One finger / mouse drag moves the photo, pinch / wheel / slider zooms. The
// framing is stored as a focal point + zoom (the same `cropStyle` the board
// renders with), so it is pixel-identical on the recipient's phone.

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Minus, Plus, RefreshCw, RotateCcw } from "lucide-react";

import { compressImage } from "../../dedication/components/mediaUploads";
import { CROP_MAX_SCALE, clampCrop, cropStyle, type Crop } from "../../dedication/components/types";

type Pt = { x: number; y: number };

export default function PuzzlePhotoField({
  src,
  isDemo,
  crop,
  grid,
  accent,
  onPhoto,
  onCrop,
  onUseDemo,
}: {
  src: string;
  isDemo: boolean;
  crop: Crop;
  grid: number;
  accent: string;
  onPhoto: (dataUrl: string) => void;
  onCrop: (c: Crop) => void;
  onUseDemo: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, Pt>());
  const gesture = useRef<{ start: Crop; origin: Pt; dist: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const set = (patch: Partial<Crop>) => onCrop(clampCrop({ ...crop, ...patch }));

  const centroid = () => {
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

  const pick = async (files: FileList | null) => {
    const f = files?.[0];
    if (!f) return;
    setError("");
    setBusy(true);
    try {
      onPhoto(await compressImage(f, 1400));
    } catch (e) {
      setError(e instanceof Error ? e.message : "That photo couldn't be read — try another one");
    } finally {
      setBusy(false);
    }
  };

  const lines = Array.from({ length: grid - 1 }, (_, i) => ((i + 1) / grid) * 100);

  return (
    <div className="space-y-3">
      <div className="flex gap-4 items-start flex-wrap sm:flex-nowrap">
        <div
          ref={frameRef}
          onPointerDown={(e) => {
            e.preventDefault();
            (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
            pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
            reanchor(crop);
            setDragging(true);
          }}
          onPointerMove={(e) => {
            if (!pointers.current.has(e.pointerId)) return;
            pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
            const g = gesture.current;
            const box = frameRef.current?.getBoundingClientRect();
            if (!g || !box) return;
            const { c, d } = centroid();
            const scale = g.dist > 0 && d > 0 ? g.start.scale * (d / g.dist) : g.start.scale;
            const k = 140 / (scale / 100);
            onCrop(clampCrop({ scale, x: g.start.x - ((c.x - g.origin.x) / box.width) * k, y: g.start.y - ((c.y - g.origin.y) / box.height) * k }));
          }}
          onPointerUp={(e) => {
            pointers.current.delete(e.pointerId);
            reanchor(crop);
            if (!pointers.current.size) setDragging(false);
          }}
          onPointerCancel={(e) => {
            pointers.current.delete(e.pointerId);
            reanchor(crop);
            if (!pointers.current.size) setDragging(false);
          }}
          onWheel={(e) => set({ scale: crop.scale - e.deltaY * 0.25 })}
          role="img"
          aria-label="Puzzle photo framing — drag to move, pinch or use the slider to zoom"
          className="relative overflow-hidden select-none shrink-0 mx-auto sm:mx-0"
          style={{
            width: "min(100%, 250px)",
            aspectRatio: "1 / 1",
            borderRadius: 16,
            background: "#efe7df",
            boxShadow: `0 0 0 4px #fff, 0 0 0 5px ${accent}33, 0 18px 34px -18px rgba(0,0,0,.45)`,
            cursor: dragging ? "grabbing" : "grab",
            touchAction: "none",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" draggable={false} style={{ ...cropStyle(crop), pointerEvents: "none" }} />
          {/* The cut lines of the chosen difficulty */}
          <span aria-hidden className="absolute inset-0 pointer-events-none">
            {lines.map((p) => (
              <span key={`v${p}`} className="absolute top-0 bottom-0" style={{ left: `${p}%`, width: 2, marginLeft: -1, background: "rgba(255,255,255,.75)", boxShadow: "0 0 3px rgba(0,0,0,.35)" }} />
            ))}
            {lines.map((p) => (
              <span key={`h${p}`} className="absolute left-0 right-0" style={{ top: `${p}%`, height: 2, marginTop: -1, background: "rgba(255,255,255,.75)", boxShadow: "0 0 3px rgba(0,0,0,.35)" }} />
            ))}
            <span className="absolute grid place-items-center text-lg" style={{ right: 0, bottom: 0, width: `${100 / grid}%`, height: `${100 / grid}%`, background: "rgba(0,0,0,.35)", color: "#fff" }}>
              💗
            </span>
          </span>
          {isDemo && (
            <span className="absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: "rgba(0,0,0,.55)", color: "#fff" }}>
              demo photo
            </span>
          )}
        </div>

        <div className="flex-1 min-w-[180px] space-y-2.5">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="w-full rounded-xl py-3 text-sm font-bold inline-flex items-center justify-center gap-2 text-white disabled:opacity-60"
            style={{ background: accent, minHeight: 48 }}
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : isDemo ? <ImagePlus size={16} /> : <RefreshCw size={15} />}
            {busy ? "loading…" : isDemo ? "upload your photo" : "change photo"}
          </button>
          <div className="flex items-center gap-2">
            <button type="button" aria-label="Zoom out" onClick={() => set({ scale: crop.scale - 10 })} className="w-10 h-10 rounded-full border grid place-items-center shrink-0 bg-white">
              <Minus size={15} />
            </button>
            <input
              type="range"
              min={100}
              max={CROP_MAX_SCALE}
              value={crop.scale}
              onChange={(e) => set({ scale: Number(e.target.value) })}
              aria-label="Zoom"
              className="flex-1 min-w-0"
              style={{ accentColor: accent }}
            />
            <button type="button" aria-label="Zoom in" onClick={() => set({ scale: crop.scale + 10 })} className="w-10 h-10 rounded-full border grid place-items-center shrink-0 bg-white">
              <Plus size={15} />
            </button>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[12px] font-semibold text-muted-foreground">
            <button type="button" onClick={() => onCrop({ x: 50, y: 50, scale: 100 })} className="inline-flex items-center gap-1 min-h-[32px]">
              <RotateCcw size={12} /> reset framing
            </button>
            {!isDemo && (
              <button type="button" onClick={onUseDemo} className="min-h-[32px] underline underline-offset-2">
                use the demo photo
              </button>
            )}
          </div>
          <p className="text-[11.5px] leading-snug text-muted-foreground">
            Drag to move, pinch or slide to zoom. Faces work best away from the bottom-right corner — that&apos;s the piece you keep 💗
          </p>
        </div>
      </div>
      {error && <p className="text-[12px] font-medium" style={{ color: accent }}>{error}</p>}
      <input ref={fileRef} type="file" accept="image/*" className="sr-only" aria-hidden tabIndex={-1} onChange={(e) => { void pick(e.target.files); e.target.value = ""; }} />
    </div>
  );
}
