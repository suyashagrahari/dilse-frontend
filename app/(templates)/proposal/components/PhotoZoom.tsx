"use client";

// ─── A photo, up close ───────────────────────────────────────────────────────
//
// Tap a polaroid and the picture fills the screen, where it can be pinched,
// dragged and double-tapped. The scrapbook shows photos at about 150px; the
// whole point of somebody's photo is the detail in it, and 150px is a thumbnail
// of a memory rather than the memory.
//
// ── WHY THE GESTURES ARE HAND-ROLLED ────────────────────────────────────────
//
// Pointer Events give this for free and in about eighty lines: `setPointerCapture`
// keeps a drag alive when the finger leaves the element, and a Map of live
// pointers turns "two fingers" into a pinch without a library, a dependency, or
// a second touch model for mouse users. One code path covers finger, trackpad,
// mouse and pen.
//
// ── THE TWO THINGS THAT GO WRONG ────────────────────────────────────────────
//
// 1. The browser zooms the PAGE instead. A pinch inside this overlay must be
//    ours, so the stage sets `touch-action: none`, which tells the browser to
//    stop handling touch scrolling and pinching here and hand us raw events.
//    Without it the gesture is swallowed before any handler sees it.
//
// 2. Panning at 1x drags the picture off into space. `clampPan` bounds the
//    offset by how much of the image actually overflows the stage at the
//    current scale — which is zero at 1x, so at rest the image cannot be moved
//    at all and there is nothing to get lost.
//
// Wheel is bound with `{ passive: false }` by hand, because React attaches wheel
// listeners passively and `preventDefault` would be ignored — the page would
// scroll behind the overlay while the trackpad zoomed the picture.

import { useCallback, useEffect, useRef, useState } from "react";
// Only DISPLAY is used: this overlay deliberately runs dark over the photo,
// so the pastel palette does not apply to it.
import { DISPLAY } from "./theme";

const MIN_SCALE = 1;
const MAX_SCALE = 5;
/** What a double-tap jumps to, when it is not already zoomed in. */
const DOUBLE_TAP_SCALE = 2.6;
/** Two taps closer together than this, and near enough, count as a double tap. */
const DOUBLE_TAP_MS = 300;
const DOUBLE_TAP_SLOP = 30;

interface Pt {
  x: number;
  y: number;
}

export interface ZoomTarget {
  src: string;
  caption: string;
  alt?: string;
}

/**
 * Opening a different photo must not inherit the last one's zoom and offset.
 *
 * The caller keys this component on the photo's src, so a different picture is
 * a different component instance and every piece of state starts fresh. That is
 * the whole reset: an effect that setState'd on `photo.src` would cascade a
 * render and is the kind of "synchronise state to props" React now lints
 * against, when remounting says the same thing in one prop.
 */
export default function PhotoZoom({
  photo,
  onClose,
}: {
  photo: ZoomTarget | null;
  onClose: () => void;
}) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState<Pt>({ x: 0, y: 0 });
  /**
   * True while a finger or the mouse is actually down.
   *
   * State rather than a read of the pointer refs, because the render body uses
   * it to decide whether the transform is animated, and reading a ref during
   * render is both forbidden by `react-hooks/refs` and genuinely wrong here —
   * a ref change does not re-render, so the transition would be stale by a
   * gesture anyway.
   */
  const [gesturing, setGesturing] = useState(false);

  /** Every pointer currently down on the stage, by id. Two of them is a pinch. */
  const pointers = useRef<Map<number, Pt>>(new Map());
  /** Distance and midpoint at the moment the second finger landed. */
  const pinchStart = useRef<{ dist: number; scale: number } | null>(null);
  const dragStart = useRef<{ p: Pt; pan: Pt } | null>(null);
  const lastTap = useRef<{ t: number; x: number; y: number } | null>(null);

  /**
   * Bound the offset by how far the image actually overflows the stage.
   *
   * At 1x nothing overflows, so the limit is zero on both axes and the picture
   * is pinned — which is what stops a stray one-finger drag at rest from
   * throwing it off the screen.
   */
  const clampPan = useCallback((next: Pt, atScale: number): Pt => {
    const stage = stageRef.current;
    const img = imgRef.current;
    if (!stage || !img) return next;
    const sw = stage.clientWidth;
    const sh = stage.clientHeight;
    // The image's laid-out size, before the transform.
    const iw = img.clientWidth;
    const ih = img.clientHeight;
    const maxX = Math.max(0, (iw * atScale - sw) / 2);
    const maxY = Math.max(0, (ih * atScale - sh) / 2);
    return {
      x: Math.min(maxX, Math.max(-maxX, next.x)),
      y: Math.min(maxY, Math.max(-maxY, next.y)),
    };
  }, []);

  const applyScale = useCallback(
    (next: number) => {
      const s = Math.min(MAX_SCALE, Math.max(MIN_SCALE, next));
      setScale(s);
      setPan((p) => clampPan(p, s));
      return s;
    },
    [clampPan],
  );

  // Escape closes; the page behind must not scroll while this is open.
  useEffect(() => {
    if (!photo) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [photo, onClose]);

  // Wheel and trackpad pinch. Bound by hand because React's own wheel listener
  // is passive, and a passive listener cannot preventDefault the page scroll.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !photo) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      // A trackpad pinch arrives as a wheel event with ctrlKey set. Both it and
      // an ordinary wheel are treated as zoom here: the overlay has nothing to
      // scroll, so scrolling it would only ever mean "get me closer".
      applyScale(scale * (e.deltaY < 0 ? 1.12 : 1 / 1.12));
    };
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, [photo, scale, applyScale]);

  if (!photo) return null;

  const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    setGesturing(true);

    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinchStart.current = { dist: dist(a, b), scale };
      dragStart.current = null;
      return;
    }

    // Double tap toggles between fit and close-up.
    const now = Date.now();
    const prev = lastTap.current;
    if (
      prev &&
      now - prev.t < DOUBLE_TAP_MS &&
      Math.hypot(e.clientX - prev.x, e.clientY - prev.y) < DOUBLE_TAP_SLOP
    ) {
      lastTap.current = null;
      if (scale > 1.05) {
        setScale(1);
        setPan({ x: 0, y: 0 });
      } else {
        applyScale(DOUBLE_TAP_SCALE);
      }
      return;
    }
    lastTap.current = { t: now, x: e.clientX, y: e.clientY };
    dragStart.current = { p: { x: e.clientX, y: e.clientY }, pan };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2 && pinchStart.current) {
      const [a, b] = [...pointers.current.values()];
      const ratio = dist(a, b) / (pinchStart.current.dist || 1);
      applyScale(pinchStart.current.scale * ratio);
      return;
    }

    const start = dragStart.current;
    if (!start) return;
    setPan(
      clampPan(
        { x: start.pan.x + (e.clientX - start.p.x), y: start.pan.y + (e.clientY - start.p.y) },
        scale,
      ),
    );
  };

  const endPointer = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinchStart.current = null;
    if (pointers.current.size === 0) {
      dragStart.current = null;
      setGesturing(false);
    }
  };

  const zoomed = scale > 1.05;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={photo.caption || "Photo"}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        display: "flex",
        flexDirection: "column",
        background: "rgba(40,18,30,.82)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          padding: "12px 14px",
          flex: "none",
        }}
      >
        <span
          style={{
            fontFamily: DISPLAY,
            fontSize: 12,
            fontWeight: 600,
            color: "rgba(255,255,255,.82)",
          }}
        >
          pinch, drag, or double-tap
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close the photo"
          className="ps-btn"
          style={{
            width: 42,
            height: 42,
            flex: "none",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,.34)",
            background: "rgba(255,255,255,.16)",
            color: "#fff",
            fontSize: 20,
            lineHeight: 1,
            cursor: "pointer",
          }}
        >
          &times;
        </button>
      </div>

      <div
        ref={stageRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
        style={{
          flex: 1,
          minHeight: 0,
          display: "grid",
          placeItems: "center",
          overflow: "hidden",
          // Load-bearing: without it the browser handles the pinch itself and
          // zooms the whole page, and no handler below ever runs.
          touchAction: "none",
          cursor: zoomed ? "grab" : "zoom-in",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={photo.src}
          alt={photo.alt || photo.caption || ""}
          draggable={false}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
            userSelect: "none",
            WebkitUserSelect: "none",
            transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${scale})`,
            // Only animate the snap back, never the live gesture: transitioning
            // during a pinch makes it feel like dragging treacle.
            transition: gesturing ? "none" : "transform .18s ease-out",
            willChange: "transform",
          }}
        />
      </div>

      <div style={{ flex: "none", padding: "12px 16px 20px", textAlign: "center" }}>
        {photo.caption && (
          <p
            style={{
              margin: "0 0 10px",
              fontFamily: "var(--font-dancing), cursive",
              fontSize: "clamp(17px,4.6vw,22px)",
              color: "#fff",
              lineHeight: 1.3,
            }}
          >
            {photo.caption}
          </p>
        )}
        {zoomed && (
          <button
            type="button"
            onClick={() => {
              setScale(1);
              setPan({ x: 0, y: 0 });
            }}
            className="ps-btn"
            style={{
              cursor: "pointer",
              padding: "8px 18px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,.3)",
              background: "rgba(255,255,255,.14)",
              color: "#fff",
              fontFamily: DISPLAY,
              fontSize: 12.5,
              fontWeight: 600,
            }}
          >
            reset
          </button>
        )}
      </div>
    </div>
  );
}
