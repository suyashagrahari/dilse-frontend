"use client";

// ─── The published Valentine's-week page (all eight days) ────────────────────
//
// Password gate (the shared _TemplateGate, painted in the day's palette,
// verify URL from the slug) → the day's Experience in LIVE mode, with `react`
// wired to the public beacon `POST /<slug>-pages/share/:shareId/react`.
// `opened` fires once per browser session; every event is first-wins on the
// server too, so a replay or a second tab changes nothing.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MotionConfig } from "framer-motion";
import { API_URL, IS_NGROK } from "@/lib/config";
import { getDay } from "@/app/(templates)/_valentine/days";
import { getExperience } from "@/app/(templates)/_valentine/experiences";
import { fromDb, type DaySlug, type ReactFn } from "@/app/(templates)/_valentine/types";
import { BrandMark } from "@/app/(templates)/_valentine/kit/DayRoot";
import { FONTS } from "@/app/(templates)/_valentine/theme";
import { DayMusicProvider } from "@/app/(templates)/_valentine/music/DayMusic";
import { TemplateGate, initialUnlocked } from "./_TemplateGate";

/** Fire-and-forget; never throws, never blocks the experience. */
function useReactBeacon(slug: DaySlug, shareId: string): ReactFn {
  const sent = useRef(new Set<string>());
  return useCallback<ReactFn>(
    (event, extra) => {
      const key = `${slug}_${event}_${shareId}`;
      if (sent.current.has(key)) return;
      try {
        if (event === "opened" && sessionStorage.getItem(key)) return;
      } catch {
        /* private mode */
      }
      sent.current.add(key);
      try {
        sessionStorage.setItem(key, "1");
      } catch {
        /* fine */
      }
      fetch(`${API_URL}/${slug}-pages/share/${encodeURIComponent(shareId)}/react`, {
        method: "POST",
        keepalive: true,
        headers: { "Content-Type": "application/json", ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}) },
        body: JSON.stringify({ event, ...(extra ?? {}) }),
      }).catch(() => {});
    },
    [slug, shareId],
  );
}

export default function ValentineDayViewer({
  slug,
  rawData,
  hasPassword,
  shareId,
}: {
  slug: DaySlug;
  rawData: Record<string, unknown>;
  hasPassword: boolean;
  shareId: string;
}) {
  const day = getDay(slug);
  const [unlocked, setUnlocked] = useState(() => initialUnlocked(hasPassword, slug, shareId));
  const unlock = useCallback(() => setUnlocked(true), []);
  const react = useReactBeacon(slug, shareId);
  const data = useMemo(() => fromDb(slug, rawData, true), [slug, rawData]);
  const Experience = getExperience(slug);
  const open = !hasPassword || unlocked;

  useEffect(() => {
    if (open) react("opened");
  }, [open, react]);

  if (!open) {
    const t = day.theme;
    return (
      <TemplateGate
        shareId={shareId}
        onUnlocked={unlock}
        apiBase={`${slug}-pages`}
        storageKey={slug}
        // Kiss Day stays neutral on the lock screen too (shared phones).
        title={slug === "happy-kiss-day" ? "A little something for you 💌" : `${day.emoji} Just for you`}
        blurb="Enter the password they gave you to open it."
        palette={{
          surround: t.base,
          card: t.paper,
          edge: t.edge,
          ink: t.paperInk,
          muted: t.paperInk,
          accent: t.accentDeep,
          accentInk: "#FFFFFF",
          accentTint: t.soft,
          font: FONTS.ui,
          radius: 22,
        }}
        badge={<span style={{ fontSize: 30 }} aria-hidden>{slug === "happy-kiss-day" ? "💌" : day.emoji}</span>}
      />
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      {/* The sender's music (off · melody · YouTube song) — the day's own
          useSynthMusic()/MusicToggle delegate to this. Starts on the first tap. */}
      <DayMusicProvider settings={data} melody={day.melody} autoStart dark={day.theme.dark}>
        <Experience data={data} mode="live" react={react} />
      </DayMusicProvider>
      <BrandMark dark={day.theme.dark} />
    </MotionConfig>
  );
}
