"use client";

// ─── /watch ──────────────────────────────────────────────────────────────────
//
// A thin renderer over `useWatchEditor`. The page opens on a live demo of the
// finished thing — a real player, real chapters, real comments — edge to edge,
// with one floating EditorDock over it: Back, and one polymorphic button that
// is Create, then Publish, then Share.
//
// Create opens the AI panel rather than the blank form. Publish defers auth and
// resumes itself after login. The draft is written on every keystroke and is
// cleared only when a publish succeeds.
//
// No space is reserved: the template's own header sits at the very top edge,
// exactly where the real app has it, and the dock floats bottom-left.

import { Suspense } from "react";
import AuthModal from "@/components/AuthModal";
import StoryStarter from "@/components/story/StoryStarter";
import { useWatchEditor } from "./hooks/useWatchEditor";
import WatchTemplate from "./components/WatchTemplate";
import EditSheet from "./components/EditSheet";
import { FONT, T } from "./components/theme";
import { WATCH_FONT_VARS } from "./components/fonts";
import EditorDock from "../_love/EditorDock";

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

      <WatchTemplate
        key={e.previewVersion}
        data={e.displayData}
        mode="preview"
        shareId={e.shareId}
        shareUrl={e.shareUrl}
        contribToken={e.contribToken}
      />

      <EditorDock
        tone="dark"
        accent="linear-gradient(135deg, #FF3E86, #FF7A59)"
        font={FONT}
        onBack={e.goBack}
        secondary={[e.isPersonalized && !e.showShare && { label: "Edit", onClick: e.handleEditFromPreview }]}
        primary={{ ...topAction, disabled: e.publishing }}
      />

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
