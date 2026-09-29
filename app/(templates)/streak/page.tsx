// ─── /streak ─────────────────────────────────────────────────────────────────
//
// The gallery/editor route. The parody camera-chat app owns the whole screen;
// the editor's controls float in the shared EditorDock (Back · Edit ·
// Create → Publish → Share). Create opens the guided AI StoryStarter over the
// form. Everything stateful lives in useStreakEditor.

"use client";

import { Suspense } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import AuthModal from "@/components/AuthModal";
import StoryStarter from "@/components/story/StoryStarter";
import { useStreakEditor } from "./hooks/useStreakEditor";
import StreakTemplate from "./components/StreakTemplate";
import EditSheet from "./components/EditSheet";
import EditorDock from "../_love/EditorDock";
import { FONT } from "./components/snap/tokens";

function StreakPageInner() {
  const e = useStreakEditor();

  const topAction = e.showShare
    ? { label: e.shareLabel, onClick: e.handleShare }
    : e.publishing
      ? { label: "Publishing…", onClick: () => {} }
      : e.showPublish
        ? { label: "Publish", onClick: e.publish }
        : { label: "Create", onClick: e.handleStartCreate };

  const aiOpen = e.storyStarted && e.storyFill.mode !== "manual";

  return (
    <div style={{ minHeight: "100dvh", position: "relative", background: "#000" }}>
      {/* Keyed so a Save re-seats the session on the freshly-written pair. */}
      <StreakTemplate
        key={e.previewVersion}
        data={e.displayData}
        mode="demo"
        shareUrl={e.shareUrl}
        hideLetter={e.editMode === "manual" || aiOpen}
      />

      <EditorDock
        tone="dark"
        accent="#FFFC00"
        accentInk="#111"
        font={FONT}
        avoidBottom=".snNav, .snCamBottom, .snInputBar, .snViewerReply"
        avoidLeft=".snRailNav, .snListCol"
        onBack={e.goBack}
        secondary={[
          e.isPersonalized && !e.showShare && { label: "Edit", onClick: e.handleEditFromPreview },
          e.showShare && !!e.myUrl && { label: "My link", onClick: () => e.handleCopy(e.myUrl ?? undefined) },
        ]}
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
        restoredDraft={e.restoredDraft}
      />

      {/* Mounted after the sheet so it sits over the form it seeds. */}
      {e.storyStarted && <StoryStarter guided fill={e.storyFill} onManual={e.handleStoryManual} />}

      <AnimatePresence>
        {e.publishing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] grid place-items-center"
            style={{ background: "rgba(0,0,0,.6)" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "16px 22px",
                borderRadius: 20,
                background: "#fff",
                fontFamily: FONT,
                fontWeight: 800,
                fontSize: 15,
                color: "#16191C",
              }}
              aria-live="polite"
            >
              <span aria-hidden style={{ fontSize: 24, display: "inline-block", animation: "stkFlick 1s ease-in-out infinite" }}>🔥</span>
              Sending your streak…
              <style>{`@keyframes stkFlick { 50% { transform: scale(1.18) rotate(6deg); } }`}</style>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {e.showAuth && <AuthModal onClose={e.closeAuth} onSuccess={e.closeAuthSuccess} />}
      </AnimatePresence>
    </div>
  );
}

export default function StreakPage() {
  return (
    <MotionConfig reducedMotion="user">
      <Suspense fallback={<div style={{ minHeight: "100dvh", background: "#000" }} />}>
        <StreakPageInner />
      </Suspense>
    </MotionConfig>
  );
}
