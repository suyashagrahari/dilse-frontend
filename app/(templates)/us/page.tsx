"use client";

// ─── Us — the editor page ────────────────────────────────────────────────────
//
// The same shape as every other template page: a live demo preview underneath,
// edge to edge like the real app, the editor controls in one floating
// EditorDock, the form in a sheet, and one button that changes job three
// times — Create, then Publish, then Share.
//
// The dock is deliberately *not* in the template's own idiom. The profile
// below it is pretending to be an app; the dock is us, and letting the two blur
// would be the one thing that breaks the joke. It floats clear of the tab bar
// on phones and of the left rail on the web.

import { Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AuthModal from "@/components/AuthModal";
import StoryStarter from "@/components/story/StoryStarter";
import UsTemplate from "./components/UsTemplate";
import EditSheet from "./components/EditSheet";
import { useUsEditor } from "./hooks/useUsEditor";
import EditorDock from "../_love/EditorDock";
import { PenIcon, SendIcon, SpinnerIcon } from "./components/icons";

const INK = "#1D1418";
const CTA = "linear-gradient(135deg, #FF5E9A, #FF3D7F 55%, #E0287A)";

function UsPageInner() {
  const e = useUsEditor();

  // One button, three lives.
  const topAction = e.showShare
    ? { label: e.shareLabel, onClick: e.handleShare, icon: <SendIcon size={14} color="#fff" /> }
    : e.showPublish
      ? {
          label: e.publishing ? "Publishing…" : "Publish",
          onClick: e.publish,
          icon: <SendIcon size={14} color="#fff" />,
        }
      : { label: "Create", onClick: e.handleStartCreate, icon: <PenIcon size={14} color="#fff" /> };

  return (
    <div style={{ minHeight: "100dvh", position: "relative" }}>
      {/* The profile itself. Keyed so each save remounts it at the top. */}
      <UsTemplate key={e.previewVersion} data={e.displayData} mode="demo" />

      <EditorDock
        tone="light"
        accent={CTA}
        avoidBottom=".us-bnav"
        avoidLeft=".us-rail"
        onBack={e.goBack}
        secondary={[
          e.isPersonalized && !e.showShare && {
            label: "Edit",
            onClick: e.handleEditFromPreview,
            icon: <PenIcon size={14} color={INK} />,
          },
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
      />

      {/* Sits over the sheet above, so the first thing a sender sees after
          Create is the offer to have it written — with the form they get
          today one tap behind it. Renders nothing without a schema. */}
      {e.storyStarted ? <StoryStarter guided fill={e.storyFill} onManual={e.handleStoryManual} /> : null}

      <AnimatePresence>
        {e.publishing ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] grid place-items-center"
            style={{ background: "rgba(20,8,14,0.5)" }}
          >
            <div className="flex flex-col items-center gap-3 rounded-3xl bg-white px-8 py-6">
              <SpinnerIcon size={26} color="#FF3D7F" />
              <p className="font-semibold" style={{ color: INK }}>
                Posting your account… 💞
              </p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>


      {/* Auth is deferred, not gating: closing cancels the pending publish and
          the hook's effect resumes it on success. */}
      <AnimatePresence>
        {e.showAuth ? <AuthModal onClose={e.closeAuth} onSuccess={e.closeAuthSuccess} /> : null}
      </AnimatePresence>
    </div>
  );
}

export default function UsPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", background: "#FFFFFF" }} />}>
      <UsPageInner />
    </Suspense>
  );
}
