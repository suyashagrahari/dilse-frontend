"use client";

// ─── <Torch> — the flashlight over a dark room ───────────────────────────────
//
// The room's content renders normally underneath; this paints the dark ON TOP
// with a soft hole where the beam is. The dark is one big pre-drawn radial
// gradient moved with transform only (composited, no per-frame paint), so it
// holds 60 fps on a mid Android. A warm glow layer rides with it.
//
// Targets are the stage's descendants marked `data-torch="<i>"`. Holding the
// beam over a target for `dwell` ms finds it (the glow swells while it
// dwells: the visual twin). Before the first touch the beam wanders on its own
// so the mechanic explains itself; while it wanders it finds nothing.
// Tap anywhere also moves the beam there (tap fallback). `lockTo` glides the
// beam onto one target and opens it up until the room is lit (the reveal).

import { useEffect, useRef, type RefObject } from "react";
import { useReducedMotion } from "../../../_valentine/kit";

export interface TorchProps {
  stageRef: RefObject<HTMLElement | null>;
  found: readonly boolean[];
  onFound: (i: number) => void;
  /** Beam radius in px (default scales with the stage: 0.24 × the short side, 84–150). */
  radius?: number;
  dwell?: number;
  /** 0–1: how dark the dark is (default .95). */
  darkness?: number;
  /** Glide to target i and open the beam until the whole room is lit. */
  lockTo?: number | null;
  onTouch?: () => void;
  z?: number;
}

export default function Torch({ stageRef, found, onFound, radius, dwell = 650, darkness = 0.95, lockTo = null, onTouch, z = 4 }: TorchProps) {
  const darkRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const live = useRef({ found, onFound, darkness, lockTo, onTouch, dwell });
  useEffect(() => {
    live.current = { found, onFound, darkness, lockTo, onTouch, dwell };
  }, [found, onFound, darkness, lockTo, onTouch, dwell]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !darkRef.current || !glowRef.current) return;
    const dark: HTMLDivElement = darkRef.current;
    const glow: HTMLDivElement = glowRef.current;

    let W = stage.clientWidth;
    let H = stage.clientHeight;
    let R = radius ?? Math.max(84, Math.min(150, Math.min(W, H) * 0.24));
    let S = 0;
    const paint = () => {
      W = stage.clientWidth;
      H = stage.clientHeight;
      R = radius ?? Math.max(84, Math.min(150, Math.min(W, H) * 0.24));
      // Big enough to cover the stage from any beam position, even opened up ×1.4.
      S = Math.ceil(Math.max(W, H) * 2.3 + R * 2);
      dark.style.width = dark.style.height = `${S}px`;
      dark.style.marginLeft = dark.style.marginTop = `${-S / 2}px`;
      dark.style.background = `radial-gradient(circle closest-side at 50% 50%, rgba(7,4,9,0) 0px, rgba(7,4,9,0) ${R * 0.42}px, rgba(7,4,9,.55) ${R * 0.78}px, rgba(7,4,9,.9) ${R * 1.05}px, rgb(7,4,9) ${R * 1.4}px, rgb(7,4,9) 100%)`;
      const g = R * 2.6;
      glow.style.width = glow.style.height = `${g}px`;
      glow.style.marginLeft = glow.style.marginTop = `${-g / 2}px`;
    };
    paint();

    // Target rects, relative to the stage (refreshed on resize and every 600 ms: portraits settle in).
    let rects: { i: number; x0: number; y0: number; x1: number; y1: number }[] = [];
    const measure = () => {
      const sr = stage.getBoundingClientRect();
      rects = Array.from(stage.querySelectorAll<HTMLElement>("[data-torch]")).map((el) => {
        const r = el.getBoundingClientRect();
        const ix = r.width * 0.14;
        const iy = r.height * 0.14;
        return { i: Number(el.dataset.torch), x0: r.left - sr.left + ix, y0: r.top - sr.top + iy, x1: r.right - sr.left - ix, y1: r.bottom - sr.top - iy };
      });
    };
    measure();
    const ro = new ResizeObserver(() => {
      paint();
      measure();
    });
    ro.observe(stage);

    const pos = { x: W * 0.5, y: H * 0.42 };
    const aim = { x: pos.x, y: pos.y };
    let touched = false;
    let open = 1;
    let fade = 1;
    const dwellMs = new Map<number, number>();

    const toLocal = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onMove = (e: PointerEvent) => {
      if (live.current.lockTo != null) return;
      if (e.pointerType !== "mouse" && e.buttons === 0 && e.type === "pointermove") return;
      const p = toLocal(e);
      aim.x = p.x;
      // A finger covers what it points at: on touch the beam sits a little above it.
      aim.y = p.y - (e.pointerType === "touch" ? Math.min(70, R * 0.55) : 0);
      if (!touched) {
        touched = true;
        live.current.onTouch?.();
      }
    };
    // On the window, not the stage: fixed layers above the scene (the music
    // chip's hit area, the viewer's chrome) must not swallow the beam.
    window.addEventListener("pointerdown", onMove, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });

    let raf = 0;
    let last = performance.now();
    let since = 0;
    let visible = !document.hidden;
    const onVis = () => {
      visible = !document.hidden;
      if (visible) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };
    document.addEventListener("visibilitychange", onVis);

    function tick(now: number) {
      if (!visible) return;
      const dt = Math.min(120, now - last);
      last = now;
      since += dt;
      if (since > 600) {
        since = 0;
        measure();
      }
      const L = live.current;
      if (L.lockTo != null) {
        const t = rects.find((r) => r.i === L.lockTo);
        if (t) {
          aim.x = (t.x0 + t.x1) / 2;
          aim.y = (t.y0 + t.y1) / 2;
        }
        open = Math.min(reduce ? 4 : 4, open + dt * (reduce ? 0.02 : 0.0019));
        fade = Math.max(0, fade - dt * 0.00045);
      } else if (!touched && !reduce) {
        // The idle wander: a slow figure-eight through the middle of the room.
        const k = now / 1000;
        aim.x = W * (0.5 + 0.28 * Math.sin(k * 0.55));
        aim.y = H * (0.44 + 0.16 * Math.sin(k * 1.1 + 0.6));
      }
      const ease = L.lockTo != null ? 0.06 : touched ? 0.28 : 0.05;
      pos.x += (aim.x - pos.x) * ease;
      pos.y += (aim.y - pos.y) * ease;

      // Dwell → found.
      let dwelling = 0;
      if (touched && L.lockTo == null) {
        for (const r of rects) {
          if (L.found[r.i]) continue;
          const inside = pos.x > r.x0 && pos.x < r.x1 && pos.y > r.y0 && pos.y < r.y1;
          const v = inside ? (dwellMs.get(r.i) ?? 0) + dt : 0;
          dwellMs.set(r.i, v);
          if (inside) dwelling = Math.max(dwelling, v / L.dwell);
          if (v >= L.dwell) {
            dwellMs.set(r.i, 0);
            L.onFound(r.i);
          }
        }
      }

      const tr = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      dark.style.transform = `${tr} scale(${open})`;
      dark.style.opacity = String(L.darkness * fade);
      glow.style.transform = `${tr} scale(${(1 + Math.min(1, dwelling) * 0.22) * Math.min(open, 2)})`;
      glow.style.opacity = String((0.55 + Math.min(1, dwelling) * 0.45) * fade);
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointerdown", onMove);
      window.removeEventListener("pointermove", onMove);
    };
  }, [stageRef, radius, reduce]);

  return (
    <div aria-hidden className="nm-torch" style={{ zIndex: z }}>
      <div ref={darkRef} className="nm-torchDark" />
      <div ref={glowRef} className="nm-torchGlow" />
      <style>{TORCH_CSS}</style>
    </div>
  );
}

const TORCH_CSS = `
.nm-torch { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.nm-torchDark, .nm-torchGlow { position: absolute; left: 0; top: 0; will-change: transform, opacity; transform-origin: 50% 50%; }
.nm-torchGlow { border-radius: 50%; mix-blend-mode: soft-light;
  background: radial-gradient(circle closest-side, rgba(255,226,168,.75), rgba(242,179,91,.35) 45%, rgba(242,179,91,0) 100%); }
`;
