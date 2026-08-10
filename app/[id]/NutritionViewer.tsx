"use client";

// ─── The published nutrition label ───────────────────────────────────────────
//
// Password gate, then the package. The gate borrows the label's flat black-on-
// white and its Helvetica so the unlock reads as part of the same printed
// artifact.

import { useCallback, useState } from "react";
import NutritionTemplate, {
  NF_INK,
  NF_MUTED,
  NF_SANS,
  NF_SURROUND,
} from "@/app/(templates)/nutrition/components/NutritionTemplate";
import { dbToNutritionData } from "@/app/(templates)/nutrition/components/demo";
import { TemplateGate, initialUnlocked } from "./_TemplateGate";

const PALETTE = {
  surround: NF_SURROUND,
  card: "#FFFFFF",
  edge: "#D9D5CC",
  ink: NF_INK,
  muted: NF_MUTED,
  accent: NF_INK,
  accentInk: "#FFFFFF",
  accentTint: "#F1EEE7",
  font: NF_SANS,
  radius: 4,
};

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
        palette={PALETTE}
        badge={
          <span style={{ fontFamily: NF_SANS, fontSize: 14, fontWeight: 800, letterSpacing: "-0.4px", color: NF_INK }}>
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
