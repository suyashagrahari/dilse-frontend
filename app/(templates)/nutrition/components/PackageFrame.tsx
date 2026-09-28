"use client";

// ─── Nutrition Facts — THE PACKAGE ───────────────────────────────────────────
//
// The label alone is a graphic. The label photographed on the back of a product
// is a joke somebody printed and shipped, which is a much better joke. So: an
// off-white board with a whisper of grain, the printed panel sitting a degree
// and a half off square with a soft shadow, a product shot, a barcode, and a
// distributor line in type nobody is expected to read.
//
// The barcode is generated from a hash of the product name, never Math.random.
// A barcode that reshuffles on every render is not a barcode, and — worse — it
// would differ between the on-screen render and the PNG capture of it.
//
// The panel is a fixed 300px block. On a narrow viewport this whole frame is
// SCALED with a transform. It never reflows and the internal layout never
// changes, because the moment the rules stop sitting flush the illusion dies.

import React, { useEffect, useMemo, useRef, useState } from "react";

import { LABEL_WIDTH, type NutritionData } from "./types";

/* ── geometry ────────────────────────────────────────────────────────────── */

/** White printed panel padding around the label. */
const PANEL_PAD = 12;
/** Off-white board padding around the panel. Also absorbs the rotation. */
const BOARD_PAD = 26;

const PANEL_W = LABEL_WIDTH + PANEL_PAD * 2; // 324
const FRAME_W = PANEL_W + BOARD_PAD * 2; // 376

/** Breathing room kept either side of the frame at any viewport width. */
const GUTTER = 24;

const BOARD = "var(--nf-board, #F3F1EC)";
const BOARD_INK = "var(--nf-board-ink, #000)";
const PAPER = "var(--lv-paper, #fff)";

const BARCODE_W = 156;
const BARCODE_H = 34;

/* ── deterministic barcode ───────────────────────────────────────────────── */

/** FNV-1a. Small, stable, and identical on the server and in the browser. */
function seedFrom(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Barcode {
  bars: { x: number; w: number; tall: boolean }[];
  digits: string;
}

/**
 * Real EAN artwork is guard bars, two data halves and a set of digits that dip
 * below the bars. We are not encoding anything — but the silhouette has to be
 * right, because that silhouette is what makes a viewer's eye call it a barcode
 * without looking.
 */
function buildBarcode(productName: string): Barcode {
  const rnd = mulberry32(seedFrom(productName || "product"));
  const bars: { x: number; w: number; tall: boolean }[] = [];

  const quiet = 8;
  const usable = BARCODE_W - quiet * 2;
  const guardAt = [quiet, quiet + usable / 2 - 1, BARCODE_W - quiet - 2];

  const isGuard = (x: number, w: number): boolean =>
    guardAt.some((g) => x < g + 3 && x + w > g - 1);

  let x = quiet;
  // Leading guard pair.
  bars.push({ x, w: 1, tall: true });
  bars.push({ x: x + 2, w: 1, tall: true });
  x += 5;

  while (x < BARCODE_W - quiet - 3) {
    const w = 1 + Math.floor(rnd() * 3); // 1–3px bars
    const gap = 1 + Math.floor(rnd() * 3);
    if (x + w > BARCODE_W - quiet - 3) break;
    bars.push({ x, w, tall: isGuard(x, w) });
    x += w + gap;
  }

  // Middle + trailing guards, drawn last so they sit on top of any neighbour.
  const mid = quiet + usable / 2;
  bars.push({ x: mid, w: 1, tall: true });
  bars.push({ x: mid + 2, w: 1, tall: true });
  bars.push({ x: BARCODE_W - quiet - 3, w: 1, tall: true });
  bars.push({ x: BARCODE_W - quiet - 1, w: 1, tall: true });

  let digits = "";
  for (let i = 0; i < 12; i += 1) digits += String(Math.floor(rnd() * 10));

  return { bars, digits };
}

/* ── the frame ───────────────────────────────────────────────────────────── */

export function PackageFrame({
  data,
  children,
  capture = false,
}: {
  data: NutritionData;
  children: React.ReactNode;
  capture?: boolean;
}): React.JSX.Element {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);

  const [scale, setScale] = useState(1);
  const [innerH, setInnerH] = useState(0);

  // Capture renders at true size — a PNG of a scaled-down node is a soft PNG.
  useEffect(() => {
    if (capture) return;
    const host = hostRef.current;
    const inner = innerRef.current;
    if (!host || !inner) return;

    const fit = () => {
      const avail = host.clientWidth;
      if (avail > 0) setScale(Math.min(1, (avail - GUTTER) / FRAME_W));
      // offsetHeight is the LAYOUT height and ignores the transform, which is
      // exactly what we need to reserve the scaled box in normal flow.
      setInnerH(inner.offsetHeight);
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(host);
    ro.observe(inner);
    return () => ro.disconnect();
  }, [capture]);

  const barcode = useMemo(() => buildBarcode(data.productName), [data.productName]);

  const frame = (
    <div
      ref={innerRef}
      style={{
        width: FRAME_W,
        boxSizing: "border-box",
        background: BOARD,
        padding: BOARD_PAD,
        position: "relative",
        overflow: "hidden",
        transform: capture ? undefined : `scale(${scale})`, // capture renders at 1
        transformOrigin: "top left",
      }}
    >
      {/* Paper/plastic grain. 3% — you should not be able to say it is there,
          only notice that the board is not flat digital white. */}
      <svg
        aria-hidden="true"
        focusable="false"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0.03,
          pointerEvents: "none",
        }}
      >
        <filter id="nutrition-package-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={3} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#nutrition-package-grain)" />
      </svg>

      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>

        {/* The printed panel: off square, softly lit. */}
        <div
          style={{
            width: PANEL_W,
            boxSizing: "border-box",
            background: PAPER,
            padding: PANEL_PAD,
            transform: "rotate(-1.5deg)",
            boxShadow: "0 6px 16px rgba(0,0,0,0.16), 0 1px 2px rgba(0,0,0,0.12)",
          }}
        >
          {children}
        </div>

        {/* Barcode. Deterministic, so it survives re-render and PNG capture. */}
        <svg
          aria-hidden="true"
          focusable="false"
          width={BARCODE_W}
          height={BARCODE_H}
          viewBox={`0 0 ${BARCODE_W} ${BARCODE_H}`}
          style={{ display: "block", marginTop: 18 }}
        >
          <rect width={BARCODE_W} height={BARCODE_H} style={{ fill: PAPER }} />
          {barcode.bars.map((b, i) => (
            <rect
              key={i}
              x={b.x}
              y={2}
              width={b.w}
              height={b.tall ? BARCODE_H - 4 : BARCODE_H - 9}
              style={{ fill: "var(--lv-paper-ink, #000)" }}
            />
          ))}
        </svg>

        <div
          style={{
            fontFamily: "Helvetica, Arial, sans-serif",
            fontSize: 7,
            letterSpacing: "1.2px",
            lineHeight: 1.2,
            color: BOARD_INK,
            paddingTop: 3,
          }}
        >
          {barcode.digits}
        </div>

        {data.distributedBy ? (
          <div
            style={{
              fontFamily: "Helvetica, Arial, sans-serif",
              fontSize: 7,
              lineHeight: 1.3,
              color: BOARD_INK,
              opacity: 0.72,
              paddingTop: 8,
              textAlign: "center",
            }}
          >
            {data.distributedBy}
          </div>
        ) : null}
      </div>
    </div>
  );

  if (capture) {
    return <div style={{ width: FRAME_W }}>{frame}</div>;
  }

  return (
    <div ref={hostRef} style={{ width: "100%", display: "flex", justifyContent: "center" }}>
      {/* Outer box carries the SCALED size so anything below stays in flow; the
          inner box keeps its true 376px layout so the label never reflows. */}
      <div
        style={{
          width: FRAME_W * scale,
          height: innerH > 0 ? innerH * scale : undefined,
          flex: "0 0 auto",
        }}
      >
        {frame}
      </div>
    </div>
  );
}

export default PackageFrame;
