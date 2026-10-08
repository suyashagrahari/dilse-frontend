"use client";

// The perfumed envelope on the unlock teaser. Only names reach the teaser, so
// the line and the lipstick shade are the defaults. Loaded lazily by the
// viewer (getTeaserArt).

import { Envelope } from "./kisses/art";
import { SHADES } from "./kisses/model";

export default function KissTeaserArt() {
  return (
    <div style={{ width: "min(300px, 78vw)", aspectRatio: "320 / 220" }}>
      <Envelope line="Sealed with a kiss. Open gently." shade={SHADES.gulabi.c} cute />
    </div>
  );
}
