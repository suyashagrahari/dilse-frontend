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
//
// ── WHY IT IS A PORTAL ──────────────────────────────────────────────────────
//
// It is rendered from inside an act, and every act lives inside a framer-motion
// wrapper with a transform and inside a `z-index: 1` container. Both of those
// are stacking contexts, so no z-index this overlay could name would lift it
// above the fixed music dock or the builder's own Back/Create chrome — and it
// did not: the close button sat underneath "Create", which is the one control
// that has to work. A portal to <body> takes the overlay out of both contexts,
// where its z-index is finally compared against theirs.

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
/**
 * How far a picture smaller than the stage is allowed to be blown up to fill it.
 *
 * Two bad extremes, and this sits between them. Left at its intrinsic size, a
 * 200px sticker floats in the middle of a dark phone screen and reads as a
 * loading state. Stretched to fit, that same sticker becomes a 850px smear on a
 * laptop — which is what "fill the stage" produced. 2x is about as far as these
 * assets carry, and anything already larger than the stage is untouched.
 */
const MAX_UPSCALE = 2;

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
  /** The picture's laid-out size at 1x, or null until it has loaded. */
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);

  /**
   * Size the picture to the stage, up to MAX_UPSCALE.
   *
   * Driven by the image's own `load` event and by `resize` — never set from an
   * effect body. `react-hooks/set-state-in-effect` is right about that in
   * general and it is right here: this is a reaction to two events, not a
   * derived value that needs synchronising into state on every render.
   */
  const measure = useCallback(() => {
    const img = imgRef.current;
    const stage = stageRef.current;
    if (!img || !stage || !img.naturalWidth) return;
    const f = Math.min(
      stage.clientWidth / img.naturalWidth,
      stage.clientHeight / img.naturalHeight,
      MAX_UPSCALE,
    );
    setBox({ w: img.naturalWidth * f, h: img.naturalHeight * f });
  }, []);

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
    // The element is sized to the picture itself (see `measure`), so its own
    // box is the honest one — there are no letterbox bands to pan into.
    const iw = img.offsetWidth;
    const ih = img.offsetHeight;
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

  // Re-fit when the viewport changes. A rotation is the common case.
  useEffect(() => {
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, [measure]);

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

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={photo.caption || "Photo"}
      style={{
        position: "fixed",
        inset: 0,
        // Above the builder's chrome (120) and the music dock (47), both of
        // which are fixed to the same corners this overlay uses.
        zIndex: 300,
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
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            padding: "7px 14px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,.22)",
            background: "rgba(255,255,255,.13)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            fontFamily: DISPLAY,
            fontSize: 12,
            fontWeight: 600,
            color: "rgba(255,255,255,.9)",
          }}
        >
          <span aria-hidden>&#128269;</span>
          <span className="pzHintHover">scroll or drag to look closer</span>
          <span className="pzHintTap">pinch, drag, or double-tap</span>
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
          onLoad={measure}
          style={{
            width: box ? box.w : "auto",
            height: box ? box.h : "auto",
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
            // A shadow rather than a frame. `object-fit: contain` letterboxes
            // the picture inside an element box that is the whole stage, so a
            // border would draw a white rectangle round the STAGE and leave the
            // picture floating in the middle of it — which is exactly what a
            // sticker with a transparent background looked like. `drop-shadow`
            // reads the alpha channel instead of the box, so it hugs a
            // photograph's straight edges and a sticker's outline alike.
            filter: "drop-shadow(0 26px 44px rgba(0,0,0,.55))",
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

      {/*
        ── THE CAPTION IS A NOTE, NOT A SUBTITLE ─────────────────────────────

        It used to be one line of script type floating on the dark backdrop,
        which reads as a video caption — something the player put there. What
        the sender actually wrote is a handwritten line about this photograph,
        so it is presented the way a line written on the back of a photograph
        is: on paper, with the opening quote set above it.
      */}
      <div style={{ flex: "none", padding: "10px 16px calc(env(safe-area-inset-bottom,0px) + 20px)" }}>
        {photo.caption && (
          <figcaption className="pzNote">
            <span aria-hidden className="pzQuote">
              &ldquo;
            </span>
            <p className="pzNoteText">{photo.caption}</p>
          </figcaption>
        )}

        {zoomed && (
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <button
              type="button"
              onClick={() => {
                setScale(1);
                setPan({ x: 0, y: 0 });
              }}
              className="ps-btn"
              style={{
                cursor: "pointer",
                padding: "9px 20px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,.3)",
                background: "rgba(255,255,255,.14)",
                color: "#fff",
                fontFamily: DISPLAY,
                fontSize: 12.5,
                fontWeight: 600,
              }}
            >
              &#8634; fit to screen
            </button>
          </div>
        )}
      </div>

      <style>{`
        .pzHintTap { display: none }
        @media (hover: none) {
          .pzHintHover { display: none }
          .pzHintTap { display: inline }
        }
        .pzNote {
          position: relative;
          margin: 0 auto;
          max-width: 34rem;
          padding: 20px 20px 18px;
          border-radius: 20px;
          background: rgba(255,250,246,.95);
          border: 1px solid rgba(255,255,255,.7);
          box-shadow: 0 26px 60px -30px rgba(0,0,0,.9);
        }
        .pzQuote {
          position: absolute;
          top: -14px; left: 18px;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 58px; line-height: 1;
          color: #ef537d; opacity: .32;
          pointer-events: none;
        }
        .pzNoteText {
          margin: 0;
          font-family: var(--font-dancing), cursive;
          font-size: clamp(19px, 5vw, 27px);
          line-height: 1.32;
          color: #4b2e3d;
          text-align: center;
        }
        @media (min-width: 900px) {
          .pzNote { padding: 24px 30px 22px; max-width: 42rem }
        }
      `}</style>
    </div>,
    document.body,
  );
}
