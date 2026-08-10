"use client";

// ─── The published profile ───────────────────────────────────────────────────
//
// Password gate, then the profile. `shareId` is deliberately NOT passed to the
// template here: it gates the moderation queue, which belongs to the sender on
// their own editor view and never to whoever opens the share link. The server
// has already stripped `contribToken` and every unapproved recommendation from
// this payload — this is the second half of that same rule, held on the client.

import { useCallback, useState } from "react";
import ProfileTemplate from "@/app/(templates)/profile-pro/components/ProfileTemplate";
import { dbToProfileData } from "@/app/(templates)/profile-pro/hooks/useProfileEditor";
import { PP, ACCENT_TINT } from "@/app/(templates)/profile-pro/components/theme";
import { TemplateGate, initialUnlocked } from "./_TemplateGate";

const PALETTE = {
  surround: PP.page,
  card: PP.card,
  edge: PP.edge,
  ink: PP.ink,
  muted: PP.inkSoft,
  accent: PP.accent,
  accentInk: PP.accentInk,
  accentTint: ACCENT_TINT,
  font: PP.font,
  radius: 8,
};

export default function ProfileProViewer({
  rawData,
  hasPassword,
  shareId,
}: {
  rawData: Record<string, unknown>;
  hasPassword: boolean;
  shareId: string;
}) {
  const [unlocked, setUnlocked] = useState(() => initialUnlocked(hasPassword, "profile_pro", shareId));
  const unlock = useCallback(() => setUnlocked(true), []);

  if (hasPassword && !unlocked) {
    return (
      <TemplateGate
        shareId={shareId}
        onUnlocked={unlock}
        apiBase="profile-pro-pages"
        storageKey="profile_pro"
        title="This profile is protected"
        blurb="Enter the password to view it."
        palette={PALETTE}
        badge={
          <span style={{ fontFamily: PP.font, fontSize: 15, fontWeight: 600, color: PP.accent }}>
            Private profile
          </span>
        }
      />
    );
  }

  const data = dbToProfileData(rawData);

  // No `shareId`: the recipient must not get the moderation queue.
  return <ProfileTemplate data={data} />;
}
