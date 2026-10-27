"use client";
// ─── <Lightbox> — full-screen photo viewer for the wedding kit ───────────────
//
//   <Lightbox photos={photos} index={i} onIndex={setI} onClose={() => setI(null)} />
//
// Swipe (or ← →) between photos, Esc / tap the backdrop / ✕ to close.
// Zoom: double-tap / double-click (2.5×), pinch, or the wheel with ctrl/⌘;
// drag to pan while zoomed. Captions + "3 / 12" counter. Neighbours preload.
// Scroll is locked while open and focus returns to the opener on close.
// Themed by the --wk-* tokens of the nearest WeddingRoot (portal keeps them via
// the inherited style object passed in `themeStyle`, or falls back to dark).

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent as RPointerEvent } from "react";
import { createPortal } from "react-dom";
import type { WeddingPhoto } from "../types";
import { cdn } from "../media";

export interface LightboxProps {
  photos: readonly WeddingPhoto[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}

const MAX_ZOOM = 4;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export default function Lightbox({ photos, index, onIndex, onClose }: LightboxProps) {
  const n = photos.length;
  const p = photos[index];
  const stageRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [vars, setVars] = useState<CSSProperties>({});
  const [zoom, setZoom] = useState({ s: 1, x: 0, y: 0 });
  const [drag, setDrag] = useState(0);
  const [entering, setEntering] = useState(true);
  const [active, setActive] = useState(false);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ startX: number; startY: number; dx: number; dy: number; pinch0: number; s0: number; x0: number; y0: number; moved: boolean; lastTap: number }>({
    startX: 0, startY: 0, dx: 0, dy: 0, pinch0: 0, s0: 1, x0: 0, y0: 0, moved: false, lastTap: 0,
  });

  const go = useCallback(
    (d: number) => {
      if (n < 2) return;
      onIndex((index + d + n) % n);
    },
    [index, n, onIndex],
  );

  // Inherit the theme tokens from the gallery's WeddingRoot (the portal leaves its subtree).
  useLayoutEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const root = opener?.closest<HTMLElement>("[data-wk-root]") ?? document.querySelector<HTMLElement>("[data-wk-root]");
    if (root) {
      const cs = getComputedStyle(root);
      const pick = ["--wk-scrim", "--wk-ink", "--wk-gold", "--wk-foil", "--wk-font-display", "--wk-font-sans", "--wk-font-caps"];
      const out: Record<string, string> = {};
      for (const k of pick) out[k] = cs.getPropertyValue(k);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- the tokens must be in place for the first painted frame
      setVars(out as CSSProperties);
    }
    const t = window.requestAnimationFrame(() => setEntering(false));
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      window.cancelAnimationFrame(t);
      document.documentElement.style.overflow = prevOverflow;
      opener?.focus?.({ preventScroll: true });
    };
  }, []);

  // Reset zoom when the photo changes. Keyed state reset without an effect:
  const [shownIndex, setShownIndex] = useState(index);
  if (shownIndex !== index) {
    setShownIndex(index);
    setZoom({ s: 1, x: 0, y: 0 });
    setDrag(0);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "Tab") {
        // Keep focus inside the dialog.
        const f = stageRef.current?.closest(".wk-lb")?.querySelectorAll<HTMLElement>("button");
        if (!f?.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  // Preload neighbours.
  useEffect(() => {
    for (const d of [1, -1]) {
      const q = photos[(index + d + n) % n];
      if (q && n > 1) {
        const im = new Image();
        im.decoding = "async";
        im.src = cdn(q.url);
      }
    }
  }, [index, n, photos]);

  const clampPan = (s: number, x: number, y: number) => {
    const el = stageRef.current;
    if (!el || s <= 1) return { s: Math.max(1, s), x: 0, y: 0 };
    const mx = (el.clientWidth * (s - 1)) / 2;
    const my = (el.clientHeight * (s - 1)) / 2;
    return { s, x: clamp(x, -mx, mx), y: clamp(y, -my, my) };
  };

  const lastToggle = useRef(0);
  const toggleZoomAt = (cx: number, cy: number) => {
    const el = stageRef.current;
    if (!el) return;
    // A touch double-tap also fires dblclick; one gesture = one toggle.
    const now = Date.now();
    if (now - lastToggle.current < 450) return;
    lastToggle.current = now;
    if (zoom.s > 1) { setZoom({ s: 1, x: 0, y: 0 }); return; }
    const r = el.getBoundingClientRect();
    const s = 2.5;
    // Keep the tapped point under the finger.
    const ox = cx - (r.left + r.width / 2);
    const oy = cy - (r.top + r.height / 2);
    setZoom(clampPan(s, -ox * (s - 1), -oy * (s - 1)));
  };

  const onDown = (e: RPointerEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    setActive(true);
    const g = gesture.current;
    if (pointers.current.size === 1) {
      g.startX = e.clientX; g.startY = e.clientY; g.dx = 0; g.dy = 0; g.moved = false;
      g.x0 = zoom.x; g.y0 = zoom.y;
    } else if (pointers.current.size === 2) {
      const [a, b] = Array.from(pointers.current.values());
      g.pinch0 = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      g.s0 = zoom.s; g.x0 = zoom.x; g.y0 = zoom.y;
      setDrag(0);
    }
  };

  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    if (pointers.current.size === 2) {
      const [a, b] = Array.from(pointers.current.values());
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      setZoom(clampPan(clamp((g.s0 * d) / g.pinch0, 1, MAX_ZOOM), g.x0, g.y0));
      g.moved = true;
      return;
    }
    g.dx = e.clientX - g.startX;
    g.dy = e.clientY - g.startY;
    if (Math.abs(g.dx) + Math.abs(g.dy) > 6) g.moved = true;
    if (zoom.s > 1) setZoom(clampPan(zoom.s, g.x0 + g.dx, g.y0 + g.dy));
    else if (Math.abs(g.dx) > Math.abs(g.dy)) setDrag(g.dx);
  };

  const onUp = (e: RPointerEvent<HTMLDivElement>) => {
    const was = pointers.current.size;
    pointers.current.delete(e.pointerId);
    if (!pointers.current.size) setActive(false);
    const g = gesture.current;
    if (was === 2) return; // end of a pinch
    if (zoom.s <= 1) {
      const w = stageRef.current?.clientWidth ?? 360;
      if (Math.abs(g.dx) > Math.min(90, w * 0.18) && Math.abs(g.dx) > Math.abs(g.dy)) go(g.dx < 0 ? 1 : -1);
      else if (g.dy > 120 && Math.abs(g.dy) > Math.abs(g.dx) * 1.4) onClose(); // swipe down to dismiss
      setDrag(0);
    }
    if (!g.moved) {
      const now = Date.now();
      if (now - g.lastTap < 300) {
        toggleZoomAt(e.clientX, e.clientY);
        g.lastTap = 0;
      } else g.lastTap = now;
    }
  };

  const onWheel = (e: React.WheelEvent) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    setZoom((z) => clampPan(clamp(z.s * (e.deltaY < 0 ? 1.12 : 1 / 1.12), 1, MAX_ZOOM), z.x, z.y));
  };

  if (!p || typeof document === "undefined") return null;

  return createPortal(
    <div className={`wk-lb${entering ? "" : " is-open"}`} style={vars} role="dialog" aria-modal="true" aria-label={`Photo ${index + 1} of ${n}`}>
      <div className="wk-lb-scrim" onClick={onClose} aria-hidden />
      <div className="wk-lb-top">
        <span className="wk-lb-count" aria-live="polite">{index + 1} / {n}</span>
        <button ref={closeRef} type="button" className="wk-lb-btn" onClick={onClose} aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </div>
      <div
        ref={stageRef}
        className="wk-lb-stage"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onWheel={onWheel}
        onDoubleClick={(e) => toggleZoomAt(e.clientX, e.clientY)}
        onClick={(e) => { if (e.target === e.currentTarget && zoom.s === 1) onClose(); }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={p.url}
          src={cdn(p.url)}
          alt={p.caption || `Photo ${index + 1}`}
          draggable={false}
          className="wk-lb-img"
          style={{
            transform: `translate3d(${zoom.x + drag}px, ${zoom.y}px, 0) scale(${zoom.s})`,
            transition: drag || active ? "none" : undefined,
            cursor: zoom.s > 1 ? "grab" : "zoom-in",
          }}
        />
      </div>
      {n > 1 && (
        <>
          <button type="button" className="wk-lb-btn wk-lb-prev" onClick={() => go(-1)} aria-label="Previous photo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
          </button>
          <button type="button" className="wk-lb-btn wk-lb-next" onClick={() => go(1)} aria-label="Next photo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7" /></svg>
          </button>
        </>
      )}
      {(p.caption || p.note) && (
        <div className="wk-lb-cap">
          {p.caption && <p className="wk-lb-capT">{p.caption}</p>}
          {p.note && <p className="wk-lb-capN">{p.note}</p>}
        </div>
      )}
    </div>,
    document.body,
  );
}
