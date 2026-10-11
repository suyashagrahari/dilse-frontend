"use client";

// A super admin previewing the site as one side of the India/abroad split
// (/admin/season → "Preview as", lib/season.ts SEASON_PREVIEW_KEY) sees this
// pill, so a preview left on in a tab is never mistaken for what visitors see.
// It reads the season STORE only (no fetch of its own): the preview answer is
// only ever there for a super admin, so nobody else can see this.

import { useSyncExternalStore } from "react";
import { getSeasonServerSnapshot, getSeasonSnapshot, seasonPreviewOf, subscribeSeason } from "@/lib/season";

export default function SeasonPreviewBadge() {
  const s = useSyncExternalStore(subscribeSeason, getSeasonSnapshot, getSeasonServerSnapshot);
  const side = seasonPreviewOf(s);
  if (!side) return null;
  return (
    <a
      href="?seasonPreview=off"
      title="End the season preview"
      style={{
        position: "fixed", left: 12, bottom: 12, zIndex: 95, display: "inline-flex", alignItems: "center", gap: 6,
        padding: "8px 12px", borderRadius: 999, background: "#1e1a2e", color: "#fff", textDecoration: "none",
        font: "700 12px/1 Inter, sans-serif", boxShadow: "0 8px 20px -8px rgba(0,0,0,.5)",
      }}
    >
      {side === "india" ? "🇮🇳" : "🌍"} Previewing as {side === "india" ? "India" : "abroad"} · End ✕
    </a>
  );
}
