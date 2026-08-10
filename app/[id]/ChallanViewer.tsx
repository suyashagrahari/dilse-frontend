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
import { CH } from "@/app/(templates)/challan/components/theme";
import { TemplateGate, initialUnlocked } from "./_TemplateGate";

const PALETTE = {
  surround: CH.portalBg,
  card: "#FFFFFF",
  edge: CH.portalEdge,
  ink: CH.ink,
  muted: CH.faint,
  accent: CH.ink,
  accentInk: CH.paper,
  accentTint: CH.portalGrey,
  font: CH.serif,
  // Square. This template has no rounded corner anywhere in it.
  radius: 0,
  danger: CH.red,
};

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
        title="This challan is protected"
        blurb="Enter the password to view the notice."
        palette={PALETTE}
        badge={
          <span style={{ fontFamily: CH.serif, fontSize: 13, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: CH.ink }}>
            Challan status enquiry
          </span>
        }
      />
    );
  }

  // The coercer clamps and repairs everything — the payload is untrusted input
  // and this is the one place that decides what a malformed field becomes. It
  // never parses `totalFine`.
  const data = dbToChallanData(rawData);

  return <ChallanTemplate data={data} />;
}
