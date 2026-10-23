"use client";

// ─── The published Animated Shaadi Card ─────────────────────────────────────
//
// Password gate (the shared TemplateGate in the card's marigold palette; it
// keeps the typed password for the tab, so the RSVP can send it) → the guest's
// experience in LIVE mode: the khidki opening, the mandap, every section, the
// RSVP (wedding kit routes on /shaadi-card-pages) and the blessings wall.
// Pages saved before the 2026-10 rebuild read through `fromDb`, which gives
// every new field a sensible value; they play the card's own song as before.

import { useMemo, useState } from "react";
import { MotionConfig } from "framer-motion";
import { BrandMark } from "@/app/(templates)/_valentine/kit/DayRoot";
import { DayMusicProvider } from "@/app/(templates)/_valentine/music/DayMusic";
import ShaadiExperience from "@/app/(templates)/shaadi-card/components/ShaadiExperience";
import { LEGACY_TRACK, SHAADI_SONGS, fromDb, musicSettings } from "@/app/(templates)/shaadi-card/components/model";
import { TemplateGate, initialUnlocked } from "./_TemplateGate";

interface ShaadiCardViewerProps {
  rawData: Record<string, unknown>;
  shareId: string;
  hasPassword: boolean;
}

export default function ShaadiCardViewer({ rawData, shareId, hasPassword }: ShaadiCardViewerProps) {
  const data = useMemo(() => fromDb(rawData), [rawData]);
  const [unlocked, setUnlocked] = useState(() => initialUnlocked(hasPassword, "shaadi-card", shareId));

  if (hasPassword && !unlocked) {
    return (
      <TemplateGate
        shareId={shareId}
        onUnlocked={() => setUnlocked(true)}
        apiBase="shaadi-card-pages"
        storageKey="shaadi-card"
        title="🪔 You're invited"
        blurb="Enter the password the family shared with you to open the invitation."
        palette={{
          surround: "#fff4dc",
          card: "#fffdf6",
          edge: "rgba(179, 21, 90, .18)",
          ink: "#3d1a0f",
          muted: "#7a5a43",
          accent: "#c2185b",
          accentInk: "#ffffff",
          accentTint: "#fff1d2",
          font: "DM Sans, system-ui, sans-serif",
          radius: 22,
        }}
        badge={
          <span style={{ fontSize: 30 }} aria-hidden>
            🪔
          </span>
        }
      />
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <DayMusicProvider settings={musicSettings(data)} melody="diya" autoStart audioOnly compact songs={SHAADI_SONGS} track={LEGACY_TRACK}>
        <ShaadiExperience data={data} mode="live" shareId={shareId} createHref="/shaadi-card" />
      </DayMusicProvider>
      <BrandMark stacked />
    </MotionConfig>
  );
}
