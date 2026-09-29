// ─── /call — the editor ──────────────────────────────────────────────────────
//
// A thin renderer over `useCallEditor`. The page opens as a LIVE DEMO of the
// finished thing — the call already ringing, edge to edge — and the editor's
// controls live in one floating EditorDock (Back · Edit · Create → Publish →
// Share), so the phone owns the whole screen with no reserved strip.
//
// Create opens the AI StoryStarter in guided mode (a few questions, then the
// whole page is written), not the blank form. StoryStarter mounts AFTER
// EditSheet so the sheet it seeds sits underneath it.

"use client";

import { Suspense, useState } from "react";
import AuthModal from "@/components/AuthModal";
import StoryStarter from "@/components/story/StoryStarter";
import EditorDock from "../_love/EditorDock";
import { useCallEditor } from "./hooks/useCallEditor";
import CallTemplate from "./components/CallTemplate";
import EditSheet from "./components/EditSheet";
import TagQueue from "./components/TagQueue";

const FONT = `-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif`;

function CallEditorPage() {
  const e = useCallEditor();
  const [queueOpen, setQueueOpen] = useState(false);

  const primary = e.showShare
    ? { label: e.shareLabel, onClick: e.handleShare }
    : e.publishing
      ? { label: "Publishing…", onClick: () => {}, disabled: true }
      : e.showPublish
        ? { label: "Publish", onClick: e.publish }
        : { label: "Create", onClick: e.handleStartCreate };

  const sheetOpen = e.editMode === "manual" || (e.storyStarted && e.storyFill.mode !== "manual") || queueOpen || e.showAuth;

  return (
    <div style={{ minHeight: "100dvh", position: "relative", background: "#07090C", fontFamily: FONT }}>
      {/* Live preview — keyed so each save and publish restarts the call. */}
      <CallTemplate
        key={e.previewVersion}
        data={e.displayData}
        mode="preview"
        shareId={e.shareId}
        contribLink={e.contribLink}
        hideLetter={sheetOpen}
        dockSpace
      />

      <EditorDock
        tone="dark"
        accent="linear-gradient(145deg, #22B56E, #128A4F)"
        accentInk="#fff"
        font={FONT}
        onBack={e.goBack}
        secondary={[
          e.isPersonalized && !e.showShare && { label: "Edit", onClick: e.handleEditFromPreview },
          !!e.shareUrl && !!e.contribLink && { label: "Tag link", onClick: e.handleCopyTagLink },
          !!e.shareId && !!e.accessToken && { label: "Tags", onClick: () => setQueueOpen(true) },
        ]}
        primary={primary}
      />

      <EditSheet
        editMode={e.editMode}
        setEditMode={e.setEditMode}
        mf={e.mf}
        updateMf={e.updateMf}
        pagePassword={e.pagePassword}
        setPagePassword={e.setPagePassword}
        onSave={e.handleSave}
        saving={e.saving}
      />

      {/* Mounted after EditSheet so the panel sits over the form it seeds. */}
      {e.storyStarted && <StoryStarter guided fill={e.storyFill} onManual={e.handleStoryManual} />}

      {queueOpen && e.shareId && e.accessToken && (
        <TagQueue
          shareId={e.shareId}
          token={e.accessToken}
          onClose={() => setQueueOpen(false)}
          onToast={(message) => e.pushToast({ type: "info", title: message })}
        />
      )}

      {e.showAuth && <AuthModal onClose={e.closeAuth} onSuccess={e.closeAuthSuccess} />}
    </div>
  );
}

export default function CallPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", background: "#07090C" }} />}>
      <CallEditorPage />
    </Suspense>
  );
}
