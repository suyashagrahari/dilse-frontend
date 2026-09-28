"use client";

// ─── The published challan ───────────────────────────────────────────────────
//
// Password gate, then the flow — starting at the ugly lookup portal, because the
// contrast between that screen and the notice is what makes the notice land.
//
// The gate borrows the challan's own chrome: square corners, the portal greys,
// the serif. A rounded card in front of this document would announce that the
// document is a toy before the recipient has read a word of it.

import { useCallback, useState } from "react";
import ChallanTemplate from "@/app/(templates)/challan/components/ChallanTemplate";
import { dbToChallanData } from "@/app/(templates)/challan/components/demo";
import { CHALLAN_THEMES } from "@/app/(templates)/challan/components/themes";
import { pickTheme } from "@/app/(templates)/_love/theme";
import { TemplateGate, initialUnlocked } from "./_TemplateGate";

const GROTESK = "var(--font-di-grotesk), 'Bricolage Grotesque', system-ui, sans-serif";

/** The gate wears the department (theme) the sender picked. */
function gatePalette(themeId: unknown) {
  const t = pickTheme(CHALLAN_THEMES, typeof themeId === "string" ? themeId : "");
  const c = t.colors;
  return {
    surround: c.base,
    card: c.paper,
    edge: `color-mix(in srgb, ${c.paperInk} 16%, transparent)`,
    ink: c.paperInk,
    muted: c.paperSoft,
    accent: c.a1,
    accentInk: "#ffffff",
    accentTint: `color-mix(in srgb, ${c.a1} 14%, transparent)`,
    font: GROTESK,
    radius: 22,
    danger: "#e11d48",
  };
}

export default function ChallanViewer({
  rawData,
  hasPassword,
  shareId,
}: {
  rawData: Record<string, unknown>;
  hasPassword: boolean;
  shareId: string;
}) {
  const [unlocked, setUnlocked] = useState(() => initialUnlocked(hasPassword, "challan", shareId));
  const unlock = useCallback(() => setUnlocked(true), []);

  if (hasPassword && !unlocked) {
    return (
      <TemplateGate
        shareId={shareId}
        onUnlocked={unlock}
        apiBase="challan-pages"
        storageKey="challan"
        title="A challan is waiting for you"
        blurb="It's protected. Enter the password to see what you did."
        palette={gatePalette(rawData.theme)}
        badge={
          <span style={{ fontFamily: GROTESK, fontSize: 12, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase" }}>
            🚨 Heart Traffic · e-challan
          </span>
        }
      />
    );
  }

  // The coercer clamps and repairs everything — the payload is untrusted input
  // and this is the one place that decides what a malformed field becomes. It
  // never parses `totalFine`.
  const data = dbToChallanData(rawData);

  return <ChallanTemplate data={data} mode="live" />;
}
