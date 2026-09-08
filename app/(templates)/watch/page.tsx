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

const BAR_H = 48;

function WatchPageInner() {
  const e = useWatchEditor();

  const topAction = e.showShare
    ? { label: e.shareLabel, onClick: e.handleShare }
    : e.showPublish
      ? { label: e.publishing ? "Publishing…" : "Publish", onClick: e.publish }
      : { label: "Create", onClick: e.handleStartCreate };

  return (
    <div className="wt-editor-frame">
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
      {e.storyStarted ? <StoryStarter fill={e.storyFill} onManual={e.handleStoryManual} /> : null}

      {e.publishing ? (
        <div className="wt-publishing" role="status" aria-live="polite">
          <p>Putting it up…</p>
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
/* The template's own bar lives under the editor bar rather than behind it. */
.wt-editor-frame .wt-bar { top: ${BAR_H}px; }
.wt-editor-frame .wt-brand { top: ${BAR_H + 64}px; }

.wt-editbar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 200;
  height: ${BAR_H}px; display: flex; align-items: center; gap: 8px;
  padding: 0 12px calc(0px + env(safe-area-inset-top, 0px));
  background: rgba(15,15,15,0.92); border-bottom: 1px solid ${T.line};
  backdrop-filter: blur(8px); font-family: ${FONT};
}
.wt-editbar-btn {
  height: 32px; padding: 0 14px; border-radius: 16px; border: 1px solid ${T.line};
  background: ${T.chip}; color: ${T.ink};
  font-family: ${FONT}; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap;
}
.wt-editbar-btn.is-primary { background: ${T.accent}; border-color: ${T.accent}; color: #FFFFFF; }
.wt-editbar-btn:disabled { opacity: 0.6; cursor: default; }

.wt-publishing {
  position: fixed; inset: 0; z-index: 320; display: grid; place-items: center;
  background: rgba(0,0,0,0.7); font-family: ${FONT}; color: ${T.ink};
}
.wt-publishing p {
  margin: 0; padding: 16px 24px; border-radius: 12px;
  background: ${T.raised}; border: 1px solid ${T.line}; font-size: 15px; font-weight: 600;
}

.wt-editor-toasts {
  position: fixed; top: ${BAR_H + 10}px; left: 50%; transform: translateX(-50%); z-index: 310;
  display: flex; flex-direction: column; gap: 8px; width: min(92vw, 420px);
}
.wt-editor-toast {
  display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 12px;
  background: ${T.raised}; border: 1px solid ${T.line}; font-family: ${FONT};
  animation: wt-toast-in 200ms ease-out both;
}
.wt-editor-toast-title { margin: 0; font-size: 13.5px; font-weight: 700; color: ${T.ink}; }
.wt-editor-toast-msg { margin: 2px 0 0; font-size: 12px; color: ${T.inkSoft}; }
.wt-editor-toast-act {
  height: 30px; padding: 0 12px; border-radius: 15px; border: 0;
  background: ${T.accent}; color: #FFFFFF; font-family: ${FONT}; font-size: 12px;
  font-weight: 600; cursor: pointer;
}
.wt-editor-toast-x {
  width: 26px; height: 26px; border: 0; border-radius: 50%; background: transparent;
  display: grid; place-items: center; cursor: pointer;
}
@media (prefers-reduced-motion: reduce) { .wt-editor-toast { animation: none; } }
`;
