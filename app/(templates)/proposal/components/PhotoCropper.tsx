"use client";

// ─── Choosing what the polaroid shows ────────────────────────────────────────
//
// A phone camera shoots 4:3 or 16:9; the scrapbook shows a square. Before this,
// the difference was settled by `object-fit: cover` — a centre crop, decided by
// arithmetic, with the sender finding out afterwards that it had cut somebody's
// head off. This hands that decision back: drag to choose what is in frame,
// pinch or scroll to choose how much of it.
//
// ── WHY A SQUARE FRAME ──────────────────────────────────────────────────────
//
// It is what the card shows from the tablet up, and the phone's 4:3 card is the
// centre band of exactly that square. So the crop somebody chooses here is the
// crop they get on a laptop, and on a phone it is that picture with a little off
// the top and bottom — never something they did not see. One frame, one
// prediction. A cropper that offered both ratios would be asking the sender to
// think about breakpoints.
//
// ── THE GESTURES ARE THE ONES FROM PhotoZoom ────────────────────────────────
//
// Deliberately the same model, because it is the one this codebase has already
// got right: `setPointerCapture` keeps a drag alive when the finger leaves the
// element, a Map of live pointers turns "two fingers" into a pinch with no
// library, and one code path covers finger, trackpad, mouse and pen. Wheel is
// bound by hand with `{ passive: false }` — React's own wheel listener is
// passive, so `preventDefault` is ignored and the sheet behind would scroll
// while the trackpad zoomed the photo. `touch-action: none` is load-bearing:
// without it the browser takes the pinch and zooms the page instead.
//
// ── THE ONE RULE THE MATHS ENFORCES ─────────────────────────────────────────
//
// The photo must always cover the frame. `clampView` derives the minimum scale
// from the picture's own aspect ratio and bounds the offset by how far it
// actually overhangs, so there is no gesture — drag, pinch, wheel, or a
// rotation mid-gesture — that can leave a transparent wedge in the corner of
// somebody's memory. That is the entire reason this is not just a free
// transform.

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/** The exported crop, in pixels. Comfortably past what any card renders at. */
const OUTPUT_PX = 1080;
const MAX_ZOOM = 4;

interface Pt {
  x: number;
  y: number;
}
interface View {
  /** 1 = the photo exactly covers the frame. */
  scale: number;
  /** Offset of the photo's centre from the frame's centre, in frame pixels. */
  x: number;
  y: number;
}

const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);

export interface CropResult {
  dataUrl: string;
}

export default function PhotoCropper({
  src,
  fileType,
  onCancel,
  onDone,
  onUnavailable,
}: {
  /** An object URL for the picked file. The caller owns revoking it. */
  src: string;
  /** The original file's MIME type — decides whether alpha has to survive. */
  fileType: string;
  onCancel: () => void;
  onDone: (dataUrl: string) => void;
  /**
   * Canvas refused. Cropping is not possible, but uploading still is — the
   * caller falls back to encoding the file as it stands rather than leaving
   * somebody stuck on a dialog whose only working button is Cancel.
   */
  onUnavailable: () => void;
}) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [view, setView] = useState<View>({ scale: 1, x: 0, y: 0 });
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [gesturing, setGesturing] = useState(false);

  const pointers = useRef<Map<number, Pt>>(new Map());
  const pinchStart = useRef<{ dist: number; scale: number } | null>(null);
  const dragStart = useRef<{ p: Pt; x: number; y: number } | null>(null);

  /**
   * The photo's size at scale 1 — the smallest that still covers the frame.
   *
   * Both are in frame pixels, so every offset below is in one unit and the
   * export can convert the whole view with a single ratio.
   */
  const covered = useCallback((): { w: number; h: number; frame: number } | null => {
    const frame = frameRef.current?.clientWidth ?? 0;
    const img = imgRef.current;
    if (!frame || !img || !img.naturalWidth) return null;
    const ar = img.naturalWidth / img.naturalHeight;
    return ar >= 1 ? { w: frame * ar, h: frame, frame } : { w: frame, h: frame / ar, frame };
  }, []);

  /** Keep the frame covered: clamp the zoom, then clamp the pan to the overhang. */
  const clampView = useCallback(
    (next: View): View => {
      const c = covered();
      if (!c) return next;
      const scale = Math.min(MAX_ZOOM, Math.max(1, next.scale));
      const maxX = Math.max(0, (c.w * scale - c.frame) / 2);
      const maxY = Math.max(0, (c.h * scale - c.frame) / 2);
      return {
        scale,
        x: Math.min(maxX, Math.max(-maxX, next.x)),
        y: Math.min(maxY, Math.max(-maxY, next.y)),
      };
    },
    [covered],
  );

  /**
   * Sizing happens on the image's own load event, never in an effect body.
   *
   * `react-hooks/set-state-in-effect` is right about the general case and right
   * here: this is a reaction to two events — the picture arriving and the
   * viewport changing — not a value that needs synchronising on every render.
   */
  const measure = useCallback(() => {
    if (!covered()) return;
    setReady(true);
    setView((v) => clampView(v));
  }, [covered, clampView]);

  useEffect(() => {
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, [measure]);

  // Escape cancels; the sheet behind must not scroll while this is open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onCancel]);

  // Wheel and trackpad pinch, bound by hand — React's listener is passive.
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setView((v) => clampView({ ...v, scale: v.scale * (e.deltaY < 0 ? 1.1 : 1 / 1.1) }));
    };
    frame.addEventListener("wheel", onWheel, { passive: false });
    return () => frame.removeEventListener("wheel", onWheel);
  }, [clampView]);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    setGesturing(true);
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinchStart.current = { dist: dist(a, b), scale: view.scale };
      dragStart.current = null;
      return;
    }
    dragStart.current = { p: { x: e.clientX, y: e.clientY }, x: view.x, y: view.y };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2 && pinchStart.current) {
      const [a, b] = [...pointers.current.values()];
      const ratio = dist(a, b) / (pinchStart.current.dist || 1);
      setView((v) => clampView({ ...v, scale: pinchStart.current!.scale * ratio }));
      return;
    }
    const s = dragStart.current;
    if (!s) return;
    setView((v) => clampView({ ...v, x: s.x + (e.clientX - s.p.x), y: s.y + (e.clientY - s.p.y) }));
  };

  const endPointer = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinchStart.current = null;
    if (pointers.current.size === 0) {
      dragStart.current = null;
      setGesturing(false);
    }
  };

  /**
   * Render the chosen square to a canvas.
   *
   * Everything on screen is in frame pixels, so one ratio converts the whole
   * view into source pixels and the drawImage is a single call — no second
   * coordinate system to keep in step with the transform above.
   */
  const apply = () => {
    const c = covered();
    const img = imgRef.current;
    if (!c || !img) return;
    setBusy(true);
    try {
      // ── Frame coordinates → source pixels ───────────────────────────────
      //
      // The photo is centred in the frame and then offset by `view`, so in
      // frame coordinates its top-left sits at:
      //
      //     px = frame/2 + view.x - W/2        (and py, likewise, with H)
      //
      // The frame's own top-left is the origin, so its position measured from
      // the photo's left edge is -px, which is W/2 - frame/2 - view.x. Scaling
      // that by (source px per frame px) gives the source rectangle.
      //
      // The sign of `view` here is the part that was wrong first time round:
      // dragging RIGHT moves the photo right, which brings its LEFT side into
      // frame, so a positive view.x has to DECREASE sx. Verified by cropping a
      // half-red, half-blue image and reading the pixels back.
      const W = c.w * view.scale;
      const H = c.h * view.scale;
      const srcPerFrame = img.naturalWidth / W;
      const half = c.frame / 2;
      const sx = (W / 2 - half - view.x) * srcPerFrame;
      const sy = (H / 2 - half - view.y) * srcPerFrame;
      const sSide = c.frame * srcPerFrame;

      const canvas = document.createElement("canvas");
      canvas.width = OUTPUT_PX;
      canvas.height = OUTPUT_PX;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("no 2d context");
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, sx, sy, sSide, sSide, 0, 0, OUTPUT_PX, OUTPUT_PX);

      // Only formats that can carry alpha keep it — a PNG cut-out re-encoded
      // as JPEG gains a black background.
      const keepsAlpha = fileType === "image/png" || fileType === "image/webp";
      const out = keepsAlpha
        ? canvas.toDataURL("image/webp", 0.86)
        : canvas.toDataURL("image/jpeg", 0.84);
      if (!out || out.length < 24) throw new Error("empty");
      onDone(out);
    } catch {
      setBusy(false);
      onUnavailable();
    }
  };

  const c = covered();
  const w = c ? c.w * view.scale : 0;
  const h = c ? c.h * view.scale : 0;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Choose what the photo shows"
      className="pcWrap"
    >
      <div className="pcCard">
        <p className="pcTitle">Move and zoom to frame it</p>

        <div
          ref={frameRef}
          className="pcFrame"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endPointer}
          onPointerCancel={endPointer}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={src}
            alt=""
            draggable={false}
            onLoad={measure}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: w || undefined,
              height: h || undefined,
              maxWidth: "none",
              transform: `translate(calc(-50% + ${view.x}px), calc(-50% + ${view.y}px))`,
              transition: gesturing ? "none" : "width .14s ease-out, height .14s ease-out",
              userSelect: "none",
              WebkitUserSelect: "none",
              opacity: ready ? 1 : 0,
            }}
          />
          {/* Rule-of-thirds guides, drawn over the photo and ignoring pointers. */}
          <span aria-hidden className="pcGrid" />
        </div>

        <label className="pcZoom">
          <span aria-hidden>−</span>
          <input
            type="range"
            min={1}
            max={MAX_ZOOM}
            step={0.01}
            value={view.scale}
            aria-label="Zoom"
            onChange={(e) => setView((v) => clampView({ ...v, scale: Number(e.target.value) }))}
          />
          <span aria-hidden>+</span>
        </label>

        <p className="pcHint">
          <span className="pcHintHover">drag to move &middot; scroll to zoom</span>
          <span className="pcHintTap">drag to move &middot; pinch with two fingers to zoom</span>
        </p>

        <div className="pcRow">
          <button type="button" onClick={onCancel} className="pcBtn pcGhost">
            Cancel
          </button>
          <button type="button" onClick={apply} disabled={!ready || busy} className="pcBtn pcGo">
            {busy ? "Saving…" : "Use this photo"}
          </button>
        </div>
      </div>

      <style>{`
        .pcWrap {
          position: fixed; inset: 0; z-index: 320;
          display: grid; place-items: center;
          padding: 16px;
          background: rgba(40,18,30,.72);
          -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
        }
        .pcCard {
          width: 100%; max-width: 420px;
          background: #FFFBF7;
          border-radius: 26px;
          padding: 18px 18px calc(env(safe-area-inset-bottom, 0px) + 18px);
          box-shadow: 0 30px 70px -30px rgba(0,0,0,.65);
        }
        .pcTitle {
          margin: 0 0 12px; text-align: center;
          font-family: var(--font-fredoka), ui-rounded, system-ui, sans-serif;
          font-size: 15.5px; font-weight: 700; color: #4A3547;
        }
        .pcFrame {
          position: relative; overflow: hidden;
          width: 100%; aspect-ratio: 1 / 1;
          border-radius: 18px;
          background: #2a1622;
          cursor: grab;
          /* Load-bearing: without it the browser handles the pinch itself and
             zooms the whole page, and no handler above ever runs. */
          touch-action: none;
        }
        .pcFrame:active { cursor: grabbing }
        .pcGrid {
          position: absolute; inset: 0; pointer-events: none;
          background:
            linear-gradient(to right, transparent calc(33.333% - .5px), rgba(255,255,255,.28) calc(33.333% - .5px), rgba(255,255,255,.28) calc(33.333% + .5px), transparent calc(33.333% + .5px)),
            linear-gradient(to right, transparent calc(66.666% - .5px), rgba(255,255,255,.28) calc(66.666% - .5px), rgba(255,255,255,.28) calc(66.666% + .5px), transparent calc(66.666% + .5px)),
            linear-gradient(to bottom, transparent calc(33.333% - .5px), rgba(255,255,255,.28) calc(33.333% - .5px), rgba(255,255,255,.28) calc(33.333% + .5px), transparent calc(33.333% + .5px)),
            linear-gradient(to bottom, transparent calc(66.666% - .5px), rgba(255,255,255,.28) calc(66.666% - .5px), rgba(255,255,255,.28) calc(66.666% + .5px), transparent calc(66.666% + .5px));
        }
        .pcZoom { display: flex; align-items: center; gap: 10px; margin: 14px 2px 4px; color: #8d6b7b; font-size: 17px }
        .pcZoom input { flex: 1; accent-color: #F2789F; height: 22px }
        .pcHint {
          margin: 0 0 14px; text-align: center;
          font-size: 11.5px; color: #8d6b7b; opacity: .85;
        }
        .pcHintTap { display: none }
        @media (hover: none) {
          .pcHintHover { display: none }
          .pcHintTap { display: inline }
        }
        .pcRow { display: flex; gap: 10px }
        .pcBtn {
          flex: 1; min-height: 46px; border-radius: 999px; cursor: pointer;
          font-family: var(--font-fredoka), ui-rounded, system-ui, sans-serif;
          font-size: 14.5px; font-weight: 700;
          transition: transform .16s cubic-bezier(.2,1.4,.4,1);
        }
        .pcBtn:active { transform: scale(.97) }
        .pcBtn:disabled { opacity: .6; cursor: default }
        .pcGhost { background: #FFF; border: 1.5px solid #F3E3EC; color: #8d6b7b }
        .pcGo { border: none; background: linear-gradient(135deg,#FFA0BF,#F2789F); color: #fff }
      `}</style>
    </div>,
    document.body,
  );
}
