"use client";

// A kiss mark as INK, not clip-art: the lip shape (or the cute heart) filled in
// the sender's shade, broken up by the lip creases and a turbulence speckle so
// it reads as lipstick pressed onto paper or glass. The same paths draw the
// keepsake on canvas (drawLipPrint), so the saved strip matches the page.

import { useId, type CSSProperties } from "react";

/** 120 × 72 box. */
export const LIP_UPPER = "M4 38 C14 26 28 14 44 13 C52 12.5 56 17 60 21 C64 17 68 12.5 76 13 C92 14 106 26 116 38 C96 36 78 34 60 37 C42 34 24 36 4 38 Z";
export const LIP_LOWER = "M6 41 C24 42 42 40 60 43 C78 40 96 42 114 41 C104 60 84 70 60 70 C36 70 16 60 6 41 Z";
export const LIP_CREASES = "M30 23 L33 33 M40 17 L42 32 M50 17 L51 31 M70 17 L69 31 M80 17 L78 32 M90 23 L87 33 M22 46 L26 60 M34 46 L36 64 M46 46 L47 67 M60 47 L60 68 M74 46 L73 67 M86 46 L84 64 M98 46 L94 60";
export const HEART = "M60 66 C30 48 22 34 28 24 C34 14 50 14 60 28 C70 14 86 14 92 24 C98 34 90 48 60 66 Z";

export function LipPrint({ color, size = 120, lipstick = true, seed = 3, style, className }: { color: string; size?: number; lipstick?: boolean; seed?: number; style?: CSSProperties; className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 120 72" width={size} height={(size * 72) / 120} aria-hidden className={className} style={{ display: "block", overflow: "visible", ...style }}>
      <defs>
        <filter id={`ink${id}`} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={seed} result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -2.6 0 0 0 1.95" result="a" />
          <feComposite in="SourceGraphic" in2="a" operator="in" result="ink" />
          <feDisplacementMap in="ink" in2="n" scale="2.6" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <mask id={`m${id}`}>
          <rect width="120" height="72" fill="#fff" />
          {lipstick && <path d={LIP_CREASES} stroke="#000" strokeWidth="1.5" strokeLinecap="round" opacity=".85" />}
        </mask>
      </defs>
      <g filter={`url(#ink${id})`} mask={`url(#m${id})`} fill={color}>
        {lipstick ? (
          <>
            <path d={LIP_UPPER} />
            <path d={LIP_LOWER} />
          </>
        ) : (
          <path d={HEART} />
        )}
      </g>
    </svg>
  );
}

/** Canvas twin of <LipPrint>: draws into a w-wide box centred on (cx, cy). */
export function drawLipPrint(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, color: string, lipstick: boolean, rot = 0) {
  const s = w / 120;
  const off = document.createElement("canvas");
  off.width = Math.ceil(120 * s);
  off.height = Math.ceil(72 * s);
  const o = off.getContext("2d");
  if (!o) return;
  o.scale(s, s);
  o.fillStyle = color;
  if (lipstick) {
    o.fill(new Path2D(LIP_UPPER));
    o.fill(new Path2D(LIP_LOWER));
  } else o.fill(new Path2D(HEART));
  o.globalCompositeOperation = "destination-out";
  if (lipstick) {
    o.lineWidth = 1.5;
    o.lineCap = "round";
    o.globalAlpha = 0.85;
    o.stroke(new Path2D(LIP_CREASES));
  }
  // speckle: paper grain showing through the ink.
  o.globalAlpha = 1;
  for (let i = 0; i < 520; i++) {
    const r = Math.random() * 0.9 + 0.2;
    o.globalAlpha = Math.random() * 0.7;
    o.beginPath();
    o.arc(Math.random() * 120, Math.random() * 72, r, 0, Math.PI * 2);
    o.fill();
  }
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((rot * Math.PI) / 180);
  ctx.globalAlpha = 0.92;
  ctx.drawImage(off, (-120 * s) / 2, (-72 * s) / 2);
  ctx.restore();
}
