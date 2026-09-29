// ─── /searched — the editor ──────────────────────────────────────────────────
//
// A thin renderer over `useSearchedEditor`. The page opens as a LIVE DEMO of
// the finished thing — the doodle home page, typing their name by itself —
// and the editor's controls live in one floating EditorDock (Back · Edit ·
// Create → Publish → Share), so the clone owns the whole screen.
//
// Create opens the AI StoryStarter in guided mode. It mounts AFTER EditSheet
// so the form it seeds sits underneath it.

"use client";

import { Suspense } from "react";
import AuthModal from "@/components/AuthModal";
import StoryStarter from "@/components/story/StoryStarter";
import EditorDock from "../_love/EditorDock";
import { useSearchedEditor } from "./hooks/useSearchedEditor";
import SearchedTemplate from "./components/SearchedTemplate";
import EditSheet from "./components/EditSheet";

const FONT = `var(--font-outfit), "Outfit", Arial, sans-serif`;

function SearchedEditorPage() {
  const e = useSearchedEditor();

  const primary = e.showShare
    ? { label: e.shareLabel, onClick: e.handleShare }
    : e.publishing
      ? { label: "Publishing…", onClick: () => {}, disabled: true }
      : e.showPublish
        ? { label: "Publish", onClick: e.publish }
        : { label: "Create", onClick: e.handleStartCreate };

  const sheetOpen = e.editMode === "manual" || (e.storyStarted && e.storyFill.mode !== "manual") || e.showAuth;

  return (
    <div style={{ minHeight: "100dvh", position: "relative", background: "#fff" }}>
      <SearchedTemplate key={e.previewVersion} data={e.displayData} mode={e.isPersonalized ? "preview" : "demo"} hideLetter={sheetOpen} />

      <EditorDock
        tone="light"
        accent="linear-gradient(135deg, #3F76EE, #E8445E)"
        accentInk="#fff"
        font={FONT}
        onBack={e.goBack}
        secondary={[e.isPersonalized && !e.showShare && { label: "Edit", onClick: e.handleEditFromPreview }]}
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
      />

      {e.storyStarted && <StoryStarter guided fill={e.storyFill} onManual={e.handleStoryManual} />}

      {e.showAuth && <AuthModal onClose={e.closeAuth} onSuccess={e.closeAuthSuccess} />}
    </div>
  );
}

export default function SearchedPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", background: "#fff" }} />}>
      <SearchedEditorPage />
    </Suspense>
  );
}
