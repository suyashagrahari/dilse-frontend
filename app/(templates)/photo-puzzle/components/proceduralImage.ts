// STUB — owned by AGENT 1 (canvas renderer). Replace the body, keep the export
// signature. The demo ships with `imageUrl: ""`, so this IS the default
// experience for everyone browsing the gallery. It must look deliberate.

/**
 * Paints a pleasant, seeded, entirely procedural image filling `w`×`h`.
 * Deterministic in `seed` — never `Math.random()`.
 */
export function drawProceduralImage(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  seed: string,
): void {
  void seed;
  ctx.fillStyle = "#6366F1";
  ctx.fillRect(0, 0, w, h);
}
