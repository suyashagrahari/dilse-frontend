"use client";

// ─── The published listing ───────────────────────────────────────────────────
//
// Password gate, then the listing. `shareId` is deliberately NOT passed to the
// template here: it is what gates the moderation queue, and the queue belongs to
// the sender on their own editor view, never to whoever opens the share link.
//
// The gate borrows the listing's own chrome — the system stack, the indigo
// accent, the soft card fill. Nothing in it names or imitates a storefront.

import { useCallback, useState } from "react";
import AppTemplate from "@/app/(templates)/app/components/AppTemplate";
import { dbToAppData } from "@/app/(templates)/app/components/demo";
import { AP } from "@/app/(templates)/app/components/theme";
import { TemplateGate, initialUnlocked } from "./_TemplateGate";

const PALETTE = {
  surround: AP.card,
  card: AP.page,
  edge: AP.edge,
  ink: AP.ink,
  muted: AP.inkSoft,
  accent: AP.accent,
  accentInk: AP.accentInk,
  accentTint: "rgba(75, 63, 167, 0.08)",
  font: AP.font,
  radius: 12,
};

export default function AppViewer({
  rawData,
  hasPassword,
  shareId,
}: {
  rawData: Record<string, unknown>;
  hasPassword: boolean;
  shareId: string;
}) {
  const [unlocked, setUnlocked] = useState(() => initialUnlocked(hasPassword, "app", shareId));
  const unlock = useCallback(() => setUnlocked(true), []);

  if (hasPassword && !unlocked) {
    return (
      <TemplateGate
        shareId={shareId}
        onUnlocked={unlock}
        apiBase="app-pages"
        storageKey="app"
        title="This listing is protected"
        blurb="Enter the password to view it."
        palette={PALETTE}
        badge={
          <span style={{ fontFamily: AP.font, fontSize: 15, fontWeight: 700, color: AP.accent }}>
            Protected listing
          </span>
        }
      />
    );
  }

  // The coercer clamps and repairs everything — the payload is untrusted input.
  // It never parses `size`, `price` or the ratings count.
  const data = dbToAppData(rawData);

  // No `shareId`: the recipient must not get the moderation queue.
  return <AppTemplate data={data} />;
}
