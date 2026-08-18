"use client";

// ─── The spiral coil ─────────────────────────────────────────────────────────
//
// A helix seen in profile. Projected to 2D, a point on the helix at axial
// fraction u sits at y = cy + r·sin(2π·loops·u − φ); advancing φ rotates the
// coil, and the visible consequence is that the whole wave TRAVELS along the
// axis. That travelling wave is what pushes the product forward, and it is why
// this must be the path itself moving and not the item sliding over a static
// squiggle.
//
// Two strands are drawn — the near half of the helix and the far half, offset by
// π — because a single sine reads as a squiggle while two crossing strands read
// as a spring. A dashed glint runs along the wire via stroke-dashoffset for the
// same reason.

export const COIL_LOOPS = 6;
export const COIL_SAMPLES = 96;

/**
 * @param phase radians. One full turn of the coil is 2π.
 * @param strand 0 = near strand, 1 = far strand (offset by half a turn).
 */
export function coilPath(w: number, h: number, phase: number, strand: 0 | 1): string {
  const cy = h / 2;
  const r = h / 2 - 1.4;
  const off = strand === 1 ? Math.PI : 0;
  const x0 = 1.2;
  const span = w - 2.4;
  let d = "";
  for (let i = 0; i <= COIL_SAMPLES; i++) {
    const u = i / COIL_SAMPLES;
    const x = x0 + u * span;
    const y = cy + r * Math.sin(u * Math.PI * 2 * COIL_LOOPS - phase + off);
    d += `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return d;
}

interface CoilProps {
  code: string;
  w: number;
  h: number;
  /** Static resting phase. Animated coils have their `d` rewritten per frame. */
  phase?: number;
  dim?: boolean;
}

export default function Coil({ code, w, h, phase = 0, dim = false }: CoilProps) {
  const gid = `vm-coil-grad-${code}`;
  const front = coilPath(w, h, phase, 0);
  const back = coilPath(w, h, phase, 1);

  return (
    <svg
      data-coil={code}
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      aria-hidden="true"
      style={{ display: "block", overflow: "visible" }}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8f0ef" />
          <stop offset="34%" stopColor="#9fb2b0" />
          <stop offset="58%" stopColor="#546a69" />
          <stop offset="100%" stopColor="#b9c8c6" />
        </linearGradient>
      </defs>

      {/* the shaft the helix is wound on */}
      <line
        x1="0.6"
        y1={h / 2}
        x2={w - 0.6}
        y2={h / 2}
        stroke="#0a1a1c"
        strokeWidth="1"
        opacity="0.55"
      />

      <path
        className="vm-coil-back"
        d={back}
        fill="none"
        stroke="#3f5250"
        strokeWidth="2"
        strokeLinecap="round"
        opacity={dim ? 0.3 : 0.45}
      />
      <path
        className="vm-coil-front"
        d={front}
        fill="none"
        stroke={`url(#${gid})`}
        strokeWidth="2"
        strokeLinecap="round"
        opacity={dim ? 0.55 : 1}
      />
      <path
        className="vm-coil-glint"
        d={front}
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeDasharray="7 113"
        opacity="0.5"
      />
    </svg>
  );
}
