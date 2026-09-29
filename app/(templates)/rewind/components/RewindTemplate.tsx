"use client";

// ─── Rewind — the template ───────────────────────────────────────────────────
//
// Lovify (the app shell) → the Rewind story (tap through the year) → the
// summary card → the hidden bonus track (the main letter, as a full-screen
// lyrics player). The same component renders the editor demo, the editor
// preview and the published page.

import React from "react";
import LetterPop from "../../_love/LetterPop";
import AppShell from "./AppShell";
import Story from "./Story";
import { useYear, fmt } from "./derive";
import { C, FONT, figtree } from "./theme";
import type { RewindTemplateProps } from "./types";

function useWide() {
  const [w, setW] = React.useState(0);
  React.useEffect(() => {
    const on = () => setW(window.innerWidth);
    on();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return w;
}

export default function RewindTemplate({
  data,
  mode,
  shareId,
  hideLetter,
  autoStory,
}: RewindTemplateProps & { hideLetter?: boolean; autoStory?: boolean }) {
  const y = useYear(data);
  const [story, setStory] = React.useState(false);
  const [bonus, setBonus] = React.useState(false);
  const [finished, setFinished] = React.useState(false);
  const width = useWide();
  const hasLetter = !!data.letter.trim();

  // The recipient's link opens straight into the story after a beat on Home,
  // the way the real banner auto-plays the first time.
  React.useEffect(() => {
    if (!autoStory) return;
    const t = window.setTimeout(() => setStory(true), 1400);
    return () => window.clearTimeout(t);
  }, [autoStory]);

  const openBonus = React.useCallback(() => {
    setFinished(true);
    setBonus(false);
    window.requestAnimationFrame(() => setBonus(true));
  }, []);

  const shareUrl = mode === "live" && shareId && typeof window !== "undefined" ? window.location.href : undefined;
  const phone = width > 0 && width < 768;

  return (
    <div className={figtree.variable} style={{ fontFamily: FONT, background: "#000", minHeight: "100dvh" }}>
      <AppShell data={data} y={y} onOpenStory={() => setStory(true)} letterLocked={hasLetter && !finished} />

      {story && (
        <Story
          data={data}
          y={y}
          onClose={() => setStory(false)}
          hasLetter={hasLetter}
          onBonus={openBonus}
          shareUrl={shareUrl}
        />
      )}

      {hasLetter && !hideLetter && (
        <>
          {/* The corner envelope stays out of the story; the bonus track opens it from the summary. */}
          {story && <style>{`.lpDock--rewind { display: none !important; }`}</style>}
          <LetterPop
            letter={data.letter}
            from={data.senderName}
            to={data.recipientName}
            question={data.lockQuestion.trim() || undefined}
            answer={data.lockAnswer.trim() || "Play it ▶"}
            accent={C.green}
            accent2={y.aura.b}
            paper="#121212"
            ink="#FFFFFF"
            bottom={phone ? 132 : 96}
            right={phone ? 14 : 24}
            delay={phone ? 2600 : 3200}
            teaser={`${y.from} left a hidden track for you 🎧`}
            sign="on repeat, forever —"
            variant="rewind"
            photos={data.photos.map((p) => p.url)}
            avatar={data.photos[0]?.url}
            title={y.archetype.name}
            handle={`${fmt(y.minutes)} minutes together`}
            forceOpen={bonus}
            zIndex={96}
          />
          <style>{`
.lpDock--rewind .lpFab { border-radius: 50%; background: ${C.green}; box-shadow: 0 12px 28px -8px rgba(30,215,96,.6), 0 0 0 3px #000; }
.lpDock--rewind .lpBadge { background: #FF4FB4; border-color: #000; }
.lpDock--rewind .lpBanner { background: #282828; color: #fff; border-radius: 10px; font-family: ${FONT}; box-shadow: 0 12px 30px -8px rgba(0,0,0,.8); }
.lpDock--rewind .lpBanTop b { color: ${C.green}; }
.lpDock--rewind .lpBanIc { border-radius: 4px; }
`}</style>
        </>
      )}
    </div>
  );
}
