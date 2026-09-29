"use client";

// ─── /catch — the editor ─────────────────────────────────────────────────────
//
// The game owns the whole screen from the very top edge; the editor's only
// chrome is the shared floating EditorDock (Back · Edit · Create → Publish →
// Share), which tucks itself away while a run is being played. Create opens the
// guided AI questions first, then the form.

import { Suspense } from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import AuthModal from "@/components/AuthModal";
import StoryStarter from "@/components/story/StoryStarter";
import EditorDock from "../_love/EditorDock";
import { useCatchEditor } from "./hooks/useCatchEditor";
import CatchTemplate from "./components/CatchTemplate";
import EditSheet from "./components/EditSheet";
import { C, DISPLAY } from "./components/theme";

function CatchPageInner() {
  const e = useCatchEditor();

  // One button, three lives: Create → Publish → Share.
  const topAction = e.showShare
    ? { label: e.shareLabel, onClick: e.handleShare }
    : e.showPublish
      ? { label: e.publishing ? "Publishing…" : "Publish", onClick: e.publish }
      : { label: "Create", onClick: e.handleEditClick };

  const sheetOpen = e.editMode === "manual" || (e.storyStarter && e.fill.mode !== "manual");

  return (
    <div style={{ minHeight: "100dvh", position: "relative" }}>
      {/* Keyed so every save/publish restarts from the title screen with the new letter. */}
      <CatchTemplate
        key={e.previewVersion}
        data={e.displayData}
        mode="demo"
        hideLetter={sheetOpen}
        shiftForSheet={e.editMode === "manual"}
        onPlayingChange={e.setPlaying}
      />

      {!e.playing && (
        <EditorDock
          tone="light"
          accent={`linear-gradient(135deg, ${C.pink}, ${C.grape})`}
          font={DISPLAY}
          onBack={e.goBack}
          secondary={[e.isPersonalized && !e.showShare && { label: "Edit", onClick: e.handleEditFromPreview }]}
          primary={{ ...topAction, disabled: e.publishing }}
        />
      )}

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

      {/* Mounted after EditSheet so the sheet sits over the form it seeds. */}
      {e.storyStarter && <StoryStarter guided fill={e.fill} onManual={e.openManualForm} title="Let's build their game" />}

      <AnimatePresence>
        {e.publishing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] grid place-items-center"
            style={{ background: "rgba(42,22,64,.5)" }}
          >
            <div className="flex flex-col items-center gap-3 px-8 py-6 rounded-3xl" style={{ background: "#fff", fontFamily: DISPLAY }} aria-live="polite">
              <span style={{ fontSize: 34 }} className="animate-bounce" aria-hidden>💌</span>
              <p className="font-semibold" style={{ color: C.ink }}>Throwing it into the sky…</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth is deferred, not gating: onClose cancels the pending publish,
          onSuccess just closes and the hook's effect resumes it. */}
      <AnimatePresence>{e.showAuth && <AuthModal onClose={e.closeAuth} onSuccess={e.closeAuthSuccess} />}</AnimatePresence>
    </div>
  );
}

export default function CatchPage() {
  return (
    <MotionConfig reducedMotion="user">
      <Suspense fallback={<div style={{ minHeight: "100dvh", background: "#C8B8FF" }} />}>
        <CatchPageInner />
      </Suspense>
    </MotionConfig>
  );
}
