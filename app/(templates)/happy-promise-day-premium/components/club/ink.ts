// The recipient's signature: points captured from a finger or a mouse,
// normalised to the pad (0–1), drawn as ink whose width follows the speed
// of the stroke (fast = thin, slow = full), joined with quadratic curves
// through the midpoints so it reads as a pen, not a polyline. The same
// drawing feeds the page (a transparent PNG) and the keepsake.

export interface Pt {
  x: number;
  y: number;
  /** width factor 0–1 (from speed) */
  w: number;
}
export type Stroke = Pt[];

export const PAD_ASPECT = 2.4; // width / height

/** Stroke length in pad widths (to tell a scribble from a stray tap). */
export function inkLength(strokes: Stroke[]) {
  let L = 0;
  for (const s of strokes) for (let i = 1; i < s.length; i++) L += Math.hypot(s[i].x - s[i - 1].x, (s[i].y - s[i - 1].y) / PAD_ASPECT);
  return L;
}

/** Draws the strokes into a w×h box at (ox, oy). `base` = full pen width in px. */
export function drawInk(ctx: CanvasRenderingContext2D, strokes: Stroke[], ox: number, oy: number, w: number, h: number, color: string, base: number) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const s of strokes) {
    if (!s.length) continue;
    const P = s.map((p) => ({ x: ox + p.x * w, y: oy + p.y * h, w: base * (0.38 + 0.62 * p.w) }));
    if (P.length === 1) {
      ctx.beginPath();
      ctx.arc(P[0].x, P[0].y, P[0].w / 2, 0, Math.PI * 2);
      ctx.fill();
      continue;
    }
    let mx = P[0].x;
    let my = P[0].y;
    for (let i = 1; i < P.length; i++) {
      const a = P[i - 1];
      const b = P[i];
      const nx = (a.x + b.x) / 2;
      const ny = (a.y + b.y) / 2;
      ctx.beginPath();
      ctx.lineWidth = (a.w + b.w) / 2;
      ctx.moveTo(mx, my);
      ctx.quadraticCurveTo(a.x, a.y, nx, ny);
      ctx.stroke();
      mx = nx;
      my = ny;
    }
    const last = P[P.length - 1];
    ctx.beginPath();
    ctx.lineWidth = last.w;
    ctx.moveTo(mx, my);
    ctx.lineTo(last.x, last.y);
    ctx.stroke();
  }
  ctx.restore();
}

/** A transparent PNG of the signature (for the page and the keepsake). */
export function inkToDataUrl(strokes: Stroke[], color: string, width = 720): string {
  if (typeof document === "undefined") return "";
  const c = document.createElement("canvas");
  c.width = width;
  c.height = Math.round(width / PAD_ASPECT);
  const ctx = c.getContext("2d");
  if (!ctx) return "";
  drawInk(ctx, strokes, 0, 0, c.width, c.height, color, width * 0.011);
  try {
    return c.toDataURL("image/png");
  } catch {
    return "";
  }
}
