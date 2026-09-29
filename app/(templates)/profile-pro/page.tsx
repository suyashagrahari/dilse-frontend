"use client";

// ─── /profile-pro ────────────────────────────────────────────────────────────
//
// The profile owns the whole screen from the very top edge (the app's own top
// bar on phones, the web nav on desktop); the editor's only chrome is the shared
// floating EditorDock — Back · Edit · Create → Publish → Share — which floats
// clear of the profile's tab bar. Create opens the guided AI questions first.
//
// TWO LINKS, TWO PURPOSES. Once published the dock also offers "Invite", which
// shares the ENDORSE link — a different secret from the share link. The share
// link is the read capability for the person the page is about; the endorse link
// is the write capability for the group chat.

import { Suspense } from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import AuthModal from "@/components/AuthModal";
import StoryStarter from "@/components/story/StoryStarter";
import EditorDock from "../_love/EditorDock";
import { useProfileEditor } from "./hooks/useProfileEditor";
import { ProfileTemplate } from "./components/ProfileTemplate";
import EditSheet from "./components/EditSheet";
import { LI, PP } from "./components/theme";

function ProfileProPageInner() {
  const e = useProfileEditor();

  const topAction = e.showShare
    ? { label: e.shareLabel, onClick: e.handleShare }
    : e.showPublish
      ? { label: e.publishing ? "Publishing…" : "Publish", onClick: e.publish }
      : { label: "Create", onClick: e.handleStartCreate };

  const sheetOpen = e.editMode === "manual" || (e.storyStarted && e.storyFill.mode !== "manual");

  return (
    <div style={{ minHeight: "100dvh", background: PP.page, position: "relative" }}>
      <ProfileTemplate
        key={e.previewVersion}
        data={e.displayData}
        shareId={e.shareId ?? undefined}
        hideLetter={sheetOpen}
        instant={e.previewVersion > 0}
      />

      <EditorDock
        tone="light"
        accent={LI.blue}
        font={PP.font}
        onBack={e.goBack}
        avoidBottom=".pf-tabbar"
        secondary={[
          e.isPersonalized && !e.showShare && { label: "Edit", onClick: e.handleEditFromPreview },
          !!e.endorseUrl && { label: "Invite", onClick: e.handleNudge },
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
      />

      {/* Mounted after EditSheet so the panel sits over the form it seeds. */}
      {e.storyStarted ? (
        <StoryStarter guided fill={e.storyFill} onManual={e.handleStoryManual} title="Let's build their profile" />
      ) : null}

      <AnimatePresence>
        {e.publishing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] grid place-items-center"
            style={{ background: "rgba(0,0,0,.45)" }}
          >
            <div className="flex flex-col items-center gap-3 px-8 py-6 rounded-2xl" style={{ background: "#fff", fontFamily: PP.font }} aria-live="polite">
              <span style={{ fontSize: 34 }} className="animate-bounce" aria-hidden>💼</span>
              <p className="font-semibold" style={{ color: PP.ink }}>Updating their profile…</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth is deferred, not gating: onClose cancels the pending publish,
          onSuccess just closes and the hook's effect resumes it. */}
      <AnimatePresence>
        {e.showAuth ? <AuthModal onClose={e.closeAuth} onSuccess={e.closeAuthSuccess} /> : null}
      </AnimatePresence>
    </div>
  );
}

export default function ProfileProPage() {
  return (
    <MotionConfig reducedMotion="user">
      <Suspense fallback={<div style={{ minHeight: "100dvh", background: PP.page }} />}>
        <ProfileProPageInner />
      </Suspense>
    </MotionConfig>
  );
}
