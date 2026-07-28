"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { bqMedia, greeneryBack, flowerById, type BouquetMode } from "./assets";
import { expandStems, mulberry32, type StemCount } from "./types";

// Measure before paint on the client (no scale "flash") but fall back to a
// plain effect during SSR so React doesn't warn.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// A fixed 500-wide stage scaled to fit. The bush is a FORCED-SIZE <img> centred
// (z-0) so it's compact and can never dangle; blooms are placed by precise dome
// packing (absolute, forced-square so they never collapse to 0×0); a bush-top
// overlay sits in front (z-10).
const DW = 500;
const BOXH = 430;
const BUSH_W = 500; // greenery kept close to the bloom width so it reads as a gathered backing, not a wild bush
const BUSH_H = 360;

const SIZE_PX: Record<"small" | "medium" | "large", number> = { small: 104, medium: 150, large: 184 };
const BASE_COL = 104; // horizontal spacing between blooms in a row
const BASE_ROW = 86; // vertical spacing between rows

/** Denser bouquets shrink a touch so all blooms fit + stay visible. */
function packScale(n: number): number {
  if (n <= 6) return 1;
  if (n <= 8) return 0.9;
  return 0.8;
}

/** Split N blooms into centred rows forming a rounded bunch (widest in the
 *  middle) so no bloom is ever stranded on its own low row. */
function domeRows(n: number): number[] {
  const t: Record<number, number[]> = {
    1: [1], 2: [2], 3: [3], 4: [2, 2], 5: [2, 3], 6: [3, 3],
    7: [2, 3, 2], 8: [3, 3, 2], 9: [3, 3, 3], 10: [3, 4, 3],
  };
  return t[n] ?? [3, 3, 2];
}

export default function BouquetArrangement({
  mode,
  flowers,
  seed,
  greenery,
  animate = false,
  maxWidth = DW,
  className = "",
}: {
  mode: BouquetMode;
  flowers: StemCount[];
  seed: number;
  greenery: number;
  animate?: boolean;
  maxWidth?: number;
  className?: string;
}) {
  const back = greeneryBack(mode, greenery);

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(0);
  useIsoLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => setScale(Math.min(1.25, Math.max(0.4, el.clientWidth / DW)));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const blooms = useMemo(() => {
    const stems = expandStems(flowers);
    const n = stems.length;
    const ps = packScale(n);
    const col = BASE_COL * ps;
    const row = BASE_ROW * ps;
    const rng = mulberry32((seed || 1) >>> 0);

    const shuffled = stems.slice();
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const rows = domeRows(n);
    const slots: { x: number; y: number }[] = [];
    rows.forEach((count, r) => {
      for (let c = 0; c < count; c++) {
        slots.push({ x: (c - (count - 1) / 2) * col + (rng() * 2 - 1) * 6, y: r * row + (rng() * 2 - 1) * 5 });
      }
    });
    const cy = ((rows.length - 1) * row) / 2;

    return shuffled
      .map((id, i) => {
        const f = flowerById(id);
        return {
          key: `${id}-${i}`,
          src: f ? bqMedia(mode, `${f.key}.webp`) : "",
          name: f?.name ?? "flower",
          size: Math.round(SIZE_PX[f?.size ?? "medium"] * ps),
          rot: (rng() * 2 - 1) * 5,
          x: slots[i]?.x ?? 0,
          y: (slots[i]?.y ?? 0) - cy,
          delay: i * 0.05,
        };
      })
      .sort((a, b) => a.y - b.y); // lower blooms drawn last → overlap in front
  }, [flowers, seed, mode]);

  const bushImg = (src: string, z: number) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      aria-hidden
      draggable={false}
      width={BUSH_W}
      height={BUSH_H}
      className="absolute left-1/2"
      style={{ width: BUSH_W, height: BUSH_H, maxWidth: "none", bottom: 0, transform: "translateX(-50%)", zIndex: z, pointerEvents: "none", userSelect: "none" }}
    />
  );

  return (
    <div ref={wrapRef} className={className} style={{ width: "100%", maxWidth, margin: "0 auto", height: BOXH * scale }}>
      <div className="relative" style={{ width: DW, height: BOXH, transform: `scale(${scale})`, transformOrigin: "top left" }}>
        {bushImg(back, 0)}

        {/* blooms — precise dome, centred over the greenery */}
        <div className="absolute" style={{ left: "50%", top: "46%", width: 0, height: 0, zIndex: 5 }}>
          {blooms.map((b) => (
            <span
              key={b.key}
              style={{ position: "absolute", left: b.x, top: b.y, transform: `translate(-50%,-50%) rotate(${b.rot}deg)`, lineHeight: 0 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={b.src}
                alt={b.name}
                width={b.size}
                height={b.size}
                draggable={false}
                style={{
                  width: b.size,
                  height: b.size,
                  maxWidth: "none",
                  objectFit: "contain",
                  display: "block",
                  filter: "drop-shadow(0 5px 7px rgba(80,60,120,0.16))",
                  ...(animate ? { animation: `bq-pop 0.5s cubic-bezier(0.22,1,0.36,1) both`, animationDelay: `${b.delay}s` } : {}),
                }}
              />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
