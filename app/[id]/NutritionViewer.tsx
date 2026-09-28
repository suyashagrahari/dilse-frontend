"use client";

// ─── The published nutrition label ───────────────────────────────────────────
//
// Password gate, then the package. The gate is printed in the packaging the
// sender picked (Classic / Candy / Kraft / Midnight) and the label's Helvetica,
// so the unlock reads as part of the same printed artifact.

import { useCallback, useState } from "react";
import NutritionTemplate, { NF_SANS } from "@/app/(templates)/nutrition/components/NutritionTemplate";
import { dbToNutritionData } from "@/app/(templates)/nutrition/components/demo";
import { pickNutritionTheme } from "@/app/(templates)/nutrition/components/themes";
import { TemplateGate, initialUnlocked } from "./_TemplateGate";

function gatePalette(themeId: unknown) {
  const t = pickNutritionTheme(typeof themeId === "string" ? themeId : "");
  const c = t.colors;
  return {
    surround: c.base,
    card: c.paper,
    edge: c.edge,
    ink: c.paperInk,
    muted: c.paperSoft,
    accent: c.a1,
    accentInk: "#FFFFFF",
    accentTint: t.pack.board,
    font: NF_SANS,
    radius: 14,
  };
}

export default function NutritionViewer({
  rawData,
  hasPassword,
  shareId,
}: {
  rawData: Record<string, unknown>;
  hasPassword: boolean;
  shareId: string;
}) {
  const [unlocked, setUnlocked] = useState(() => initialUnlocked(hasPassword, "nutrition", shareId));
  const unlock = useCallback(() => setUnlocked(true), []);

  if (hasPassword && !unlocked) {
    return (
      <TemplateGate
        shareId={shareId}
        onUnlocked={unlock}
        apiBase="nutrition-pages"
        storageKey="nutrition"
        title="This label is protected"
        blurb="Enter the password to read the panel."
        palette={gatePalette(rawData.theme)}
        badge={
          <span style={{ fontFamily: NF_SANS, fontSize: 14, fontWeight: 800, letterSpacing: "-0.4px", color: gatePalette(rawData.theme).ink }}>
            Nutrition Facts
          </span>
        }
      />
    );
  }

  // The coercer clamps and repairs everything. It never parses `calories`.
  const data = dbToNutritionData(rawData);

  return <NutritionTemplate data={data} mode="live" shareId={shareId} hasPassword={hasPassword} />;
}
