"use client";

// ─── /rewind — the editor ────────────────────────────────────────────────────
//
// A thin renderer over `useRewindEditor`. The page opens as a live demo of the
// Lovify app edge to edge; a floating EditorDock carries Back, Edit and the one
// polymorphic Create → Publish → Share button. Create opens the AI
// StoryStarter (guided questions), with the form one tap behind it.

import { Suspense } from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import AuthModal from "@/components/AuthModal";
import StoryStarter from "@/components/story/StoryStarter";
import EditorDock from "../_love/EditorDock";
import { useRewindEditor } from "./hooks/useRewindEditor";
import RewindTemplate from "./components/RewindTemplate";
import EditSheet from "./components/EditSheet";
import { C, FONT } from "./components/theme";

function RewindPageInner() {
  const e = useRewindEditor();

  const topAction = e.showShare
    ? { label: e.shareLabel, onClick: e.handleShare }
    : e.publishing
      ? { label: "Publishing…", onClick: () => {} }
      : e.showPublish
        ? { label: "Publish", onClick: e.publish }
        : { label: "Create", onClick: e.handleStartCreate };

  const sheetOpen = e.editMode === "manual" || (e.storyStarted && e.storyFill.mode !== "manual");

  return (
    <div style={{ minHeight: "100dvh", position: "relative", background: "#000" }}>
      <RewindTemplate key={e.previewVersion} data={e.displayData} mode="demo" hideLetter={sheetOpen} />

      <EditorDock
        tone="dark"
        accent={C.green}
        accentInk="#000"
        font={FONT}
        avoidBottom=".lvPlayer, .lvTabs"
        avoidLeft=".lvSide"
        onBack={e.goBack}
        secondary={[e.isPersonalized && !e.showShare && { label: "Edit", onClick: e.handleEditFromPreview }]}
        primary={{ ...topAction, disabled: e.publishing }}
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

      {e.storyStarted && <StoryStarter guided fill={e.storyFill} onManual={e.handleStoryManual} />}

      <AnimatePresence>
        {e.publishing && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] grid place-items-center"
            style={{ background: "rgba(0,0,0,.6)" }}
          >
            <div aria-live="polite" style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 26px", borderRadius: 14, background: "#282828", color: "#fff", fontFamily: FONT, fontWeight: 800 }}>
              <span className="rwSpin" style={{ width: 20, height: 20, borderRadius: "50%", border: `3px solid ${C.green}`, borderTopColor: "transparent", display: "inline-block", animation: "rwPgSpin .8s linear infinite" }} />
              Running the numbers…
            </div>
            <style>{`@keyframes rwPgSpin { to { transform: rotate(360deg); } }`}</style>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {e.showAuth && <AuthModal onClose={e.closeAuth} onSuccess={e.closeAuthSuccess} />}
      </AnimatePresence>
    </div>
  );
}

export default function RewindPage() {
  return (
    <MotionConfig reducedMotion="user">
      <Suspense fallback={<div style={{ minHeight: "100dvh", background: "#000" }} />}>
        <RewindPageInner />
      </Suspense>
    </MotionConfig>
  );
}
