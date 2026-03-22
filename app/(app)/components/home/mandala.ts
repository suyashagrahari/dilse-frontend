export const MANDALA_ANGLES = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330] as const;

// Pre-computed at 2 decimal places to avoid server/client floating-point mismatch
const PRECOMPUTED: Record<number, Record<number, { x2: number; y2: number }>> = {};

function compute(angle: number, radius: number): { x2: number; y2: number } {
  if (!PRECOMPUTED[radius]) PRECOMPUTED[radius] = {};
  if (!PRECOMPUTED[radius][angle]) {
    const rad = (angle * Math.PI) / 180;
    PRECOMPUTED[radius][angle] = {
      x2: Math.round((100 + radius * Math.cos(rad)) * 100) / 100,
      y2: Math.round((100 + radius * Math.sin(rad)) * 100) / 100,
    };
  }
  return PRECOMPUTED[radius][angle];
}

export function getMandalaLineEndpoint(angle: number, radius: number): { x2: number; y2: number } {
  return compute(angle, radius);
}
