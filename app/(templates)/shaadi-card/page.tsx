"use client";

// ─── /shaadi-card: the editor ───────────────────────────────────────────────
// The guest's page itself (preview mode) fills the screen; a dock at the
// bottom holds Back · Replay · Edit · Publish/Share. Create opens the AI
// questions (or the form); the form is a full-screen sheet on phones and a
// left panel on laptops, with the live page beside it.

import { Suspense, useDeferredValue } from "react";
import { AnimatePresence } from "framer-motion";
import AuthModal from "@/components/AuthModal";
import { DayMusicProvider } from "../_valentine/music/DayMusic";
import { useShaadiCardEditor } from "./hooks/useShaadiCardEditor";
import ShaadiExperience from "./components/ShaadiExperience";
import EditSheet from "./components/EditSheet";
import ShaadiAi from "./components/ai/ShaadiAi";
import PublishingOverlay from "./components/PublishingOverlay";
import { LEGACY_TRACK, SHAADI_SONGS, musicSettings } from "./components/model";

function Dock({ e }: { e: ReturnType<typeof useShaadiCardEditor> }) {
  const published = !!e.shareUrl;
  return (
    <nav className="pg-dock" aria-label="Editor">
      <button type="button" className="pg-dock-btn" onClick={e.goBack} aria-label="Back to templates">
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 5l-7 7 7 7" />
        </svg>
        <span className="pg-dock-l">Back</span>
      </button>
      <button type="button" className="pg-dock-btn" onClick={e.replayOpening} aria-label="Replay the opening">
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12a8 8 0 1 0 2.3-5.6M4 4v4.5h4.5" />
        </svg>
        <span className="pg-dock-l">Replay</span>
      </button>
      <button type="button" className={`pg-dock-btn pg-dock-edit${published ? "" : " is-wide"}`} onClick={e.handleEditClick}>
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4" />
        </svg>
        <span>{e.isPersonalized ? "Edit" : "Create yours"}</span>
      </button>
      {published ? (
        <button type="button" className="pg-dock-btn is-primary" onClick={e.handleShare}>
          <span>Share</span>
        </button>
      ) : (
        e.isPersonalized && (
          <button type="button" className="pg-dock-btn is-primary" onClick={e.handlePublish} disabled={e.publishing}>
            <span>{e.publishing ? "Publishing…" : "Publish ✦"}</span>
          </button>
        )
      )}
    </nav>
  );
}

function ShaadiCardPage() {
  const e = useShaadiCardEditor();
  const data = useDeferredValue(e.previewData);
  const editing = e.sheet === "form";
  return (
    <DayMusicProvider
      settings={musicSettings(data)}
      melody="diya"
      autoStart={!editing}
      overSheet={editing}
      audioOnly
      compact
      songs={SHAADI_SONGS}
      track={LEGACY_TRACK}
    >
      <style>{PG_CSS}</style>
      <div className="pg-root">
        <div className={`pg-stage${editing ? " is-editing" : ""}`}>
          <div className="pg-scroll" data-sc-scroller>
            {e.ready && <ShaadiExperience data={data} mode="preview" replay={e.replay} />}
          </div>
        </div>
      </div>
      {e.sheet === "closed" && e.ready && <Dock e={e} />}
      <EditSheet e={e} />
      <ShaadiAi e={e} />
      <PublishingOverlay visible={e.publishing} />
      <AnimatePresence>{e.showAuth && <AuthModal onClose={e.closeAuth} onSuccess={e.closeAuthSuccess} />}</AnimatePresence>
    </DayMusicProvider>
  );
}

export default function ShaadiCardPageWrapper() {
  return (
    <Suspense>
      <ShaadiCardPage />
    </Suspense>
  );
}

const PG_CSS = `
/* The page is one screen tall (the paid-tier cross-link from the layout sits below it, as before);
   the guest page scrolls inside it, in a transformed box so its fixed parts stay in the preview pane. */
.pg-root { position: relative; height: 100dvh; overflow: hidden; }
.pg-stage { position: absolute; inset: 0; transform: translateZ(0); overflow: hidden; background: #fff9ee; }
.pg-scroll { position: absolute; inset: 0; overflow-y: auto; overflow-x: hidden; -webkit-overflow-scrolling: touch; }
@media (min-width: 1024px) { .pg-stage.is-editing { left: 560px; } }
@media (min-width: 1440px) { .pg-stage.is-editing { left: 620px; } }
.pg-dock { position: fixed; z-index: 120; left: 50%; bottom: calc(12px + env(safe-area-inset-bottom, 0px)); translate: -50% 0; display: flex; gap: 6px; padding: 6px; width: min(calc(100% - 24px), 520px);
  border-radius: 22px; background: rgba(255, 250, 240, .94); border: 1px solid rgba(179, 21, 90, .16); box-shadow: 0 18px 40px -18px rgba(61, 26, 15, .55); -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px);
  font-family: var(--font-wk-sans, "DM Sans"), system-ui, sans-serif; }
.pg-dock-btn { flex: none; display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-width: 48px; min-height: 48px; padding: 0 12px; border-radius: 16px; border: 0;
  background: rgba(179, 21, 90, .07); color: #3d1a0f; font: 700 14.5px/1 inherit; cursor: pointer; -webkit-tap-highlight-color: transparent; }
.pg-dock-l { display: none; }
.pg-dock-edit { flex: 1; }
.pg-dock-btn.is-primary { flex: 1; background: linear-gradient(135deg, #c2185b, #e0457b 60%, #f29d12); color: #fff; box-shadow: 0 10px 20px -12px rgba(194, 24, 91, .8); }
.pg-dock-btn:disabled { opacity: .6; }
@media (min-width: 560px) { .pg-dock-l { display: inline; } }
/* The music icon must not sit on the dock; the experience moves it to the top right. */
`;
