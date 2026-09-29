"use client";

// ─── /watch ──────────────────────────────────────────────────────────────────
//
// A thin renderer over `useWatchEditor`. The page opens on a live demo of the
// finished thing — a real player, real chapters, real comments — with one
// floating bar over it: Back on the left, and one polymorphic button on the
// right that is Create, then Publish, then Share.
//
// Create opens the AI panel rather than the blank form. Publish defers auth and
// resumes itself after login. The draft is written on every keystroke and is
// cleared only when a publish succeeds.
//
// The editor bar sits at the very top and the template's own sticky bar is
// pushed 48px down to live under it, so the two never overlap.

import { Suspense } from "react";
import AuthModal from "@/components/AuthModal";
import StoryStarter from "@/components/story/StoryStarter";
import { useWatchEditor } from "./hooks/useWatchEditor";
import WatchTemplate from "./components/WatchTemplate";
import EditSheet from "./components/EditSheet";
import { FONT, T } from "./components/theme";
import { WATCH_FONT_VARS } from "./components/fonts";

const BAR_H = 48;

function WatchPageInner() {
  const e = useWatchEditor();

  const topAction = e.showShare
    ? { label: e.shareLabel, onClick: e.handleShare }
    : e.showPublish
      ? { label: e.publishing ? "Publishing…" : "Publish", onClick: e.publish }
      : { label: "Create", onClick: e.handleStartCreate };

  return (
    <div className={`wt-editor-frame ${WATCH_FONT_VARS}`}>
      <style>{EDITOR_CSS}</style>

      <div className="wt-editbar">
        <button type="button" className="wt-editbar-btn" onClick={e.goBack}>
          ← Back
        </button>
        <span style={{ flex: 1 }} />
        {e.isPersonalized && !e.showShare ? (
          <button type="button" className="wt-editbar-btn" onClick={e.handleEditFromPreview}>
            Edit
          </button>
        ) : null}
        <button
          type="button"
          className="wt-editbar-btn is-primary"
          onClick={topAction.onClick}
          disabled={e.publishing}
        >
          {topAction.label}
        </button>
      </div>

      <div style={{ paddingTop: BAR_H }}>
        <WatchTemplate
          key={e.previewVersion}
          data={e.displayData}
          mode="preview"
          shareId={e.shareId}
          shareUrl={e.shareUrl}
          contribToken={e.contribToken}
        />
      </div>

      <EditSheet
        editMode={e.editMode}
        setEditMode={e.setEditMode}
        mf={e.mf}
        setMf={e.setMf}
        pagePassword={e.pagePassword}
        setPagePassword={e.setPagePassword}
        onSave={e.handleSave}
        saving={e.saving}
      />

      {/* Mounted after EditSheet so the panel sits over the form it seeds. */}
      {e.storyStarted ? <StoryStarter guided fill={e.storyFill} onManual={e.handleStoryManual} /> : null}

      {e.publishing ? (
        <div className="wt-publishing" role="status" aria-live="polite">
          <p>Premiering your video…</p>
        </div>
      ) : null}

      {e.showAuth ? <AuthModal onClose={e.closeAuth} onSuccess={e.closeAuthSuccess} /> : null}
    </div>
  );
}

export default function WatchPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", background: T.page }} />}>
      <WatchPageInner />
    </Suspense>
  );
}

const EDITOR_CSS = `
.wt-editor-frame { background: ${T.page}; min-height: 100dvh; }
/* The template's own sticky surfaces live under the editor bar rather than behind it. */
@media (min-width: 760px) { .wt-editor-frame .wt-bar { top: ${BAR_H}px; } }
@media (max-width: 759px) { .wt-editor-frame .wt-player-slot { top: ${BAR_H}px; } }

.wt-editbar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 200;
  height: ${BAR_H}px; display: flex; align-items: center; gap: 8px;
  padding: 0 12px; background: rgba(15,15,15,0.96); border-bottom: 1px solid rgba(255,255,255,.08);
  font-family: ${FONT};
}
.wt-editbar-btn {
  height: 34px; padding: 0 16px; border-radius: 17px; border: 0;
  background: rgba(255,255,255,.1); color: ${T.ink};
  font-family: ${FONT}; font-size: 14px; font-weight: 500; cursor: pointer; white-space: nowrap;
  transition: background .15s ease, transform .15s ease;
}
.wt-editbar-btn:hover { background: rgba(255,255,255,.18); }
.wt-editbar-btn:active { transform: scale(.97); }
.wt-editbar-btn.is-primary { background: linear-gradient(135deg, #FF3E86, #FF7A59); color: #FFFFFF; box-shadow: 0 6px 18px -8px rgba(255,62,134,.8); }
.wt-editbar-btn:disabled { opacity: 0.6; cursor: default; }

.wt-publishing {
  position: fixed; inset: 0; z-index: 320; display: grid; place-items: center;
  background: rgba(0,0,0,0.7); font-family: ${FONT}; color: ${T.ink};
}
.wt-publishing p {
  margin: 0; padding: 16px 24px; border-radius: 12px; display: flex; align-items: center; gap: 12px;
  background: ${T.raised}; border: 1px solid ${T.line}; font-size: 15px; font-weight: 500;
}
.wt-publishing p::before {
  content: ""; width: 18px; height: 18px; border-radius: 50%; border: 3px solid rgba(255,255,255,.2); border-top-color: #FF3E86;
  animation: wt-pub-spin .8s linear infinite;
}
@keyframes wt-pub-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .wt-publishing p::before { animation: none; } }
`;
