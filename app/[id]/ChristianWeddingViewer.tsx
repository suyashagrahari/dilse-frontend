"use client";

// ─── The shared page for christian-wedding ("tabs" variant) ─────────────────
//
// Pages published before the chapel-door rebuild and after it render through
// the same experience: `fromDb` gives every field the rebuild added a default
// that keeps an older page looking like itself (no theme → ivory, no song →
// the hymn it always played, free-text "21 Jul" dates read in the wedding's
// year). christian-wedding-2 ("scroll") keeps its own viewer.
//
// A password-protected page shows the shared gate in the chapel's palette
// first; the typed password stays in this tab so the RSVP can prove the guest
// got past it. Music starts on the guest's first tap (the doors).
//
// No font is preloaded from this module (it is pulled into every share page;
// nginx 502s on a long Link header — see the kit's fonts.ts).

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { BrandMark } from "@/app/(templates)/_valentine/kit/DayRoot";
import { fromDb } from "@/app/(templates)/christian-wedding/chapel/model";
import { EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import { TemplateGate, initialUnlocked } from "./_TemplateGate";

const ChapelExperience = dynamic(() => import("@/app/(templates)/christian-wedding/chapel/ChapelExperience"), { ssr: false });
const ChapelMusic = dynamic(() => import("@/app/(templates)/christian-wedding/chapel/ChapelExperience").then((m) => m.ChapelMusic), { ssr: false });

interface ChristianWeddingViewerProps {
  rawData: Record<string, unknown>;
  shareId: string;
  hasPassword: boolean;
}

const LIVE_CSS = `
body:has(.cw-root.is-live) .vm-icon { top: calc(max(12px, env(safe-area-inset-top)) + 60px) !important; }
`;

export default function ChristianWeddingViewer({ rawData, shareId, hasPassword }: ChristianWeddingViewerProps) {
  const data = useMemo(() => fromDb(rawData), [rawData]);
  const [unlocked, setUnlocked] = useState(() => initialUnlocked(hasPassword, "christian-wedding", shareId));
  const unlock = useCallback(() => setUnlocked(true), []);
  const open = !hasPassword || unlocked;

  // "Create your own" at the end of the page: count it like the old viewer did.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a.cw-create, a[href='/templates']");
      if (a) track(EVENTS.CREATE_CTA_CLICKED, { template: "christian-wedding", source: a.classList.contains("cw-create") ? "viewer_finale" : "viewer_logo" });
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [open]);

  if (!open) {
    return (
      <TemplateGate
        shareId={shareId}
        onUnlocked={unlock}
        apiBase="christian-wedding-pages"
        storageKey="christian-wedding"
        title="This invitation is just for you"
        blurb="Enter the password the family shared with you to open the church doors."
        palette={{
          surround: "linear-gradient(180deg, #fbf7ef, #f1e7d6)",
          card: "#fffdf8",
          edge: "rgba(135,104,58,.22)",
          ink: "#3b342c",
          muted: "#7a7064",
          accent: "#5f7c5f",
          accentInk: "#ffffff",
          accentTint: "#e6ede2",
          font: "var(--font-dm-sans), system-ui, sans-serif",
          radius: 20,
        }}
        badge={
          <span style={{ display: "flex", alignItems: "center", gap: 10, font: "600 15px/1.2 Georgia, serif", color: "#3b342c" }}>
            <span style={{ fontSize: 26 }} aria-hidden>
              ⛪
            </span>
            {data.brideName && data.groomName ? `${data.brideName} & ${data.groomName}` : "A wedding invitation"}
          </span>
        }
      />
    );
  }

  return (
    <ChapelMusic data={data} autoStart>
      <style>{LIVE_CSS}</style>
      <ChapelExperience data={data} mode="live" shareId={shareId} />
      <BrandMark stacked />
    </ChapelMusic>
  );
}
