"use client";

// ─── The published page for every day on the engine (Valentine's week + Halloween) ─
//
// Password gate (the shared _TemplateGate, painted in the day's palette,
// verify URL from the slug) → the day's Experience in LIVE mode, with `react`
// wired to the public beacon `POST /<slug>-pages/share/:shareId/react`.
// `opened` fires once per browser session; every event is first-wins on the
// server too, so a replay or a second tab changes nothing.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MotionConfig } from "framer-motion";
import { API_URL, IS_NGROK } from "@/lib/config";
import { useAppSelector } from "@/store/hooks";
import { getDay } from "@/app/(templates)/_valentine/days";
import { getExperience, teaserArtFor } from "@/app/(templates)/_valentine/experiences";
import { fromDb, parseReactions, type DaySlug, type ReactFn, type ValentineReactions } from "@/app/(templates)/_valentine/types";
import OwnerBanner from "@/app/(templates)/_valentine/kit/OwnerBanner";
import { BrandMark } from "@/app/(templates)/_valentine/kit/DayRoot";
import { FONTS } from "@/app/(templates)/_valentine/theme";
import { DayMusicProvider, chipThemeFrom } from "@/app/(templates)/_valentine/music/DayMusic";
import { TemplateGate, initialUnlocked } from "./_TemplateGate";
import { parseLockedTeaser } from "@/app/(templates)/_valentine/premiumData";
import UnlockTeaser from "@/app/(templates)/_valentine/kit/premium/UnlockTeaser";
import { PremiumShareContext } from "@/app/(templates)/_valentine/kit/premium/ReplyBox";
import { DayShareContext } from "@/app/(templates)/_valentine/kit/shareInfo";

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
  // ✦ Premium scheduled unlock: before `unlockAt` the server sends only a
  // teaser (names + time). At zero we fetch the page again for the content.
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const [raw, setRaw] = useState(rawData);
  const teaser = useMemo(() => (day.premium ? parseLockedTeaser(raw) : null), [day.premium, raw]);
  const refetch = useCallback(() => {
    fetch(`${API_URL}/${slug}-pages/share/${encodeURIComponent(shareId)}`, {
      headers: {
        ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
        // The signed-in owner gets the full page before the unlock time.
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    })
      .then((r) => r.json())
      .then((j) => {
        if (j?.success && j.data) setRaw(j.data as Record<string, unknown>);
      })
      .catch(() => {});
  }, [slug, shareId, accessToken]);
  // The share route's first fetch is anonymous: if this is the owner, ask again with their token.
  const askedAsOwner = useRef(false);
  useEffect(() => {
    if (!teaser || !accessToken || askedAsOwner.current) return;
    askedAsOwner.current = true;
    refetch();
  }, [teaser, accessToken, refetch]);
  // The signed-in sender opening their own link: ask the owner-only GET how it
  // went (it 404s for anyone else, and does not count a view) → OwnerBanner.
  const [ownerView, setOwnerView] = useState<ValentineReactions | null>(null);
  const pageId = typeof raw._id === "string" ? raw._id : "";
  useEffect(() => {
    if (!accessToken || !pageId || teaser) return;
    let live = true;
    fetch(`${API_URL}/${slug}-pages/${encodeURIComponent(pageId)}`, {
      headers: { Authorization: `Bearer ${accessToken}`, ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}) },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (live && j?.success && j.data) setOwnerView(parseReactions(j.data.reactions));
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [accessToken, pageId, slug, teaser]);
  const shareInfo = useMemo(() => ({ slug, shareId, replySent: raw.replySent === true }), [slug, shareId, raw.replySent]);
  const dayShare = useMemo(() => ({ slug, shareId, hasPassword }), [slug, shareId, hasPassword]);
  const [unlocked, setUnlocked] = useState(() => initialUnlocked(hasPassword, slug, shareId));
  const unlock = useCallback(() => setUnlocked(true), []);
  const react = useReactBeacon(slug, shareId);
  const data = useMemo(() => fromDb(slug, raw, true), [slug, raw]);
  const Experience = getExperience(slug);
  const open = !hasPassword || unlocked;

  useEffect(() => {
    if (open && !teaser) react("opened");
  }, [open, teaser, react]);

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

  if (teaser) {
    return (
      <>
        <UnlockTeaser
          day={day}
          teaser={teaser}
          onUnlocked={refetch}
          art={teaserArtFor(slug, { recipientName: teaser.recipientName, senderName: teaser.senderName })}
        />
        <BrandMark dark={day.theme.dark} />
      </>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      {/* The sender's music (off · melody · YouTube song) — the day's own
          useSynthMusic()/MusicToggle delegate to this. Starts on the first tap. */}
      <DayMusicProvider settings={data} melody={day.melody} autoStart dark={day.theme.dark} audioOnly={!!day.music?.audioOnly} songs={day.music?.suggestions} chip={day.premium ? chipThemeFrom(day.theme, day.emoji) : undefined} track={day.music?.track} compact={!!day.music?.compact} volume={day.music?.volume}>
        <DayShareContext.Provider value={dayShare}>
          <PremiumShareContext.Provider value={day.premium ? shareInfo : null}>
            <Experience data={data} mode="live" react={react} />
          </PremiumShareContext.Provider>
        </DayShareContext.Provider>
      </DayMusicProvider>
      <BrandMark dark={day.theme.dark} stacked={day.brandMark === "stacked"} />
      {ownerView && <OwnerBanner r={ownerView} asks={day.asksQuestion} yes={day.copy.yesChip} />}
    </MotionConfig>
  );
}
