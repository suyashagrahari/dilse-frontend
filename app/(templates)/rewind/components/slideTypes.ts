// ─── Rewind — the slide contract the story machine runs on ───────────────────

export interface SlideDef {
  /** Which card this is (see Story.tsx). */
  kind: string;
  /** Stable React key. Never the array index. */
  key: string;
  /** How long the auto-advance timer holds on this card. */
  durationMs: number;
  /** Flat, saturated, hard-cut background. */
  bg: string;
  fg: string;
}
