"use client";

// Scene 6 · Make our bouquet. Her photos are flowers on the table (up to six). She drags each one into the kraft
// cone (or taps it: it hops in by itself), each landing with a boing and a sparkle; then she ties the ribbon and
// the bow pops on with a heart burst. Now every flower opens into a polaroid (a bright card, never a dark
// lightbox) with his caption and note. The penguins with a bouquet watch from the side.

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CroppedPhoto, haptic } from "../../../_valentine/kit";
import { usePremium } from "../../../_valentine/kit/premium";
import { Cone, Gif, PhotoFlower, Washi } from "./art";
import { Puffy, Scene, originOf, useAww } from "./ui";
import { FIXED_GIF, type Garden } from "./util";
import { GARDEN_FONT_VARS } from "./fonts";

/** Bouquet spots around (centre, 150), in landing order. */
const SPOTS = [
  { x: 0, y: -56 },
  { x: -66, y: -30 },
  { x: 66, y: -30 },
  { x: -34, y: 16 },
  { x: 34, y: 16 },
  { x: 0, y: -112 },
];
const FLOWER = 78;

export function BouquetScene({ g, step, total, onDone }: { g: Garden; step: number; total: number; onDone: () => void }) {
  const { sfx } = usePremium();
  const aww = useAww();
  const photos = g.photos.slice(0, 6);
  const n = photos.length;
  const stageRef = useRef<HTMLDivElement>(null);
  const coneRef = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(340);
  const [placed, setPlaced] = useState<number[]>([]);
  const [tied, setTied] = useState(false);
  const [drag, setDrag] = useState<{ i: number; dx: number; dy: number } | null>(null);
  const [view, setView] = useState<number | null>(null);
  const [seen, setSeen] = useState<number[]>([]);
  const start = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const all = placed.length >= n;

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const rows = n > 3 ? 2 : 1;
  const trayPos = (i: number) => {
    const perRow = Math.min(3, Math.ceil(n / rows));
    const row = Math.floor(i / perRow);
    const inRow = Math.min(perRow, n - row * perRow);
    const col = i - row * perRow;
    return { x: w / 2 + (col - (inRow - 1) / 2) * 98, y: 380 + row * 92 };
  };
  const spot = (k: number) => ({ x: w / 2 + SPOTS[k].x, y: 150 + SPOTS[k].y });
  const height = 380 + (rows - 1) * 92 + 64;

  const placedRef = useRef<number[]>([]);
  const place = (i: number) => {
    if (placedRef.current.includes(i)) return;
    const next = [...placedRef.current, i];
    placedRef.current = next;
    setPlaced(next);
    sfx("rg-boing", { gain: 0.55, detune: next.length * 80 });
    sfx("sparkle", { gain: 0.3, at: 0.1 });
    haptic(14);
    if (next.length === n) sfx("chime", { gain: 0.5, at: 0.25 });
  };

  const onDown = (i: number) => (e: React.PointerEvent) => {
    if (placed.includes(i)) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = { x: e.clientX, y: e.clientY, moved: false };
    setDrag({ i, dx: 0, dy: 0 });
    sfx("pop", { gain: 0.35 });
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag || !start.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    if (Math.abs(dx) + Math.abs(dy) > 8) start.current.moved = true;
    setDrag({ ...drag, dx, dy });
  };
  const onUp = (e: React.PointerEvent) => {
    if (!drag || !start.current) return;
    const i = drag.i;
    const moved = start.current.moved;
    start.current = null;
    setDrag(null);
    const c = coneRef.current?.getBoundingClientRect();
    const inCone = c && e.clientX > c.left - 50 && e.clientX < c.right + 50 && e.clientY < c.bottom && e.clientY > c.top - 160;
    if (!moved || inCone) place(i);
  };

  const tie = () => {
    if (tied) return;
    setTied(true);
    sfx("ribbon", { gain: 0.8 });
    window.setTimeout(() => aww(originOf(coneRef.current, 0.45), true), 300);
  };

  const open = (i: number) => {
    setView(i);
    setSeen((s) => (s.includes(i) ? s : [...s, i]));
    sfx("paper-rustle", { gain: 0.5 });
    haptic(10);
  };

  const sub = !all ? "Drag each flower into the paper 💐" : !tied ? "Now tie the ribbon 🎀" : "Tap a flower to read it 💌";

  return (
    <Scene id="bouquet" step={step} total={total} label="Make our bouquet" kicker="Step 6 · our bouquet" title="Every flower is a memory" sub={sub}>
      <div className="rg-bqStage" ref={stageRef} style={{ height }}>
        <div className="rg-cone" ref={coneRef} style={{ left: w / 2 - 92 }}>
          <Cone tied={tied} color={g.color} />
          <span className="rg-coneTag">
            <Washi className="rg-coneTape" />
            {g.pet || g.to}
          </span>
        </div>
        <Gif src={FIXED_GIF.penguinsBouquet} size={88} className="rg-bqPeek" tilt={8} />
        {photos.map((p, i) => {
          const k = placed.indexOf(i);
          const isPlaced = k >= 0;
          const at = isPlaced ? spot(k) : trayPos(i);
          const d = drag?.i === i ? drag : null;
          return (
            <button
              key={i}
              type="button"
              className={`rg-bqFlower${isPlaced ? " is-placed" : ""}${d ? " is-drag" : ""}${tied ? " is-tied" : ""}${seen.includes(i) ? " is-seen" : ""}`}
              style={{ left: at.x - FLOWER / 2, top: at.y - FLOWER / 2, zIndex: d ? 30 : isPlaced ? 10 + (k < 3 ? 0 : 5) : 20, transform: d ? `translate(${d.dx}px, ${d.dy}px) scale(1.08) rotate(-4deg)` : undefined }}
              aria-label={isPlaced ? (tied ? `Read: ${p.caption || `memory ${i + 1}`}` : "In the bouquet") : `Put memory ${i + 1} in the bouquet`}
              onPointerDown={onDown(i)}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={() => {
                start.current = null;
                setDrag(null);
              }}
              onClick={(e) => {
                if (e.detail === 0 && !isPlaced) place(i);
                if (isPlaced && tied) open(i);
              }}
            >
              <PhotoFlower photo={p} color={g.color} size={FLOWER} eager />
            </button>
          );
        })}
        {!all && <p className="rg-bqCount" style={{ top: height - 6 }}>{placed.length}/{n} in the bouquet</p>}
        {tied && <p className="rg-bqCount" style={{ top: 352 }}>{seen.length}/{n} memories read 💌</p>}
      </div>
      <div className="rg-foot">
        {!all ? (
          <Puffy variant="ghost" cue={null} onClick={() => photos.forEach((_, i) => window.setTimeout(() => place(i), i * 260))}>
            Arrange them for me 💐
          </Puffy>
        ) : !tied ? (
          <Puffy onClick={tie} cue={null} className="rg-heartbeat">
            Tie the ribbon 🎀
          </Puffy>
        ) : (
          <Puffy onClick={onDone}>One last question… 🌹</Puffy>
        )}
      </div>
      {view !== null && typeof document !== "undefined" && createPortal(<Polaroid photos={photos} at={view} onAt={open} onClose={() => setView(null)} />, document.body)}
    </Scene>
  );
}

function Polaroid({ photos, at, onAt, onClose }: { photos: Garden["photos"]; at: number; onAt: (i: number) => void; onClose: () => void }) {
  const p = photos[at];
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onAt((at + 1) % photos.length);
      if (e.key === "ArrowLeft") onAt((at - 1 + photos.length) % photos.length);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [at, photos.length, onAt, onClose]);
  if (!p) return null;
  return (
    <div className={`rg-lb ${GARDEN_FONT_VARS}`} role="dialog" aria-modal="true" aria-label={p.caption || "A memory"} onClick={onClose}>
      <figure className="rg-lbCard" key={at} onClick={(e) => e.stopPropagation()}>
        <Washi className="rg-lbTape" />
        <span className="rg-lbPhoto">
          <CroppedPhoto photo={p} alt={p.caption ?? ""} eager />
        </span>
        <figcaption>
          {p.caption && <b>{p.caption}</b>}
          {p.note && <span>{p.note}</span>}
        </figcaption>
      </figure>
      <div className="rg-lbNav" onClick={(e) => e.stopPropagation()}>
        {photos.length > 1 && (
          <button type="button" aria-label="Previous memory" onClick={() => onAt((at - 1 + photos.length) % photos.length)}>
            ‹
          </button>
        )}
        <button type="button" className="rg-lbClose" onClick={onClose}>
          Back to the bouquet
        </button>
        {photos.length > 1 && (
          <button type="button" aria-label="Next memory" onClick={() => onAt((at + 1) % photos.length)}>
            ›
          </button>
        )}
      </div>
    </div>
  );
}
