"use client";

// ─── Us — the editor page ────────────────────────────────────────────────────
//
// The same shape as every other template page: a live demo preview underneath,
// a floating Back / Create bar over it, the form in a sheet, and one button
// that changes job three times — Create, then Publish, then Share.
//
// The chrome is deliberately *not* in the template's own idiom. The profile
// below it is pretending to be an app; the bar on top is us, and letting the
// two blur would be the one thing that breaks the joke. So it is a rounded
// floating pill in the site's own voice, sitting clear of the 44px top bar.

import { Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AuthModal from "@/components/AuthModal";
import StoryStarter from "@/components/story/StoryStarter";
import UsTemplate from "./components/UsTemplate";
import EditSheet from "./components/EditSheet";
import { useUsEditor } from "./hooks/useUsEditor";
import { BackChevron, PenIcon, SendIcon, SpinnerIcon } from "./components/icons";

const INK = "#111111";
const CHROME = "rgba(255,255,255,0.94)";
const CHROME_BORDER = "1px solid #E1E1E1";

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

      {/* Floating chrome. Sits below the template's own 44px bar so the two
          never read as one thing. */}
      <div
        className="pointer-events-none fixed left-0 right-0 z-[150] flex items-center gap-2 px-3"
        style={{ bottom: "calc(64px + env(safe-area-inset-bottom, 0px))" }}
      >
        <button
          onClick={e.goBack}
          className="pointer-events-auto inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold shadow-sm"
          style={{ background: CHROME, color: INK, border: CHROME_BORDER, backdropFilter: "blur(8px)" }}
        >
          <BackChevron size={15} color={INK} /> Back
        </button>
        <div className="flex-1" />
        {e.isPersonalized && !e.showShare ? (
          <button
            onClick={e.handleEditFromPreview}
            className="pointer-events-auto inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold shadow-sm"
            style={{ background: CHROME, color: INK, border: CHROME_BORDER, backdropFilter: "blur(8px)" }}
          >
            <PenIcon size={14} color={INK} /> Edit
          </button>
        ) : null}
        <button
          onClick={topAction.onClick}
          disabled={e.publishing}
          className="pointer-events-auto inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold text-white shadow-md disabled:opacity-60"
          style={{ background: INK }}
        >
          {topAction.icon} {topAction.label}
        </button>
      </div>

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
      {e.storyStarted ? <StoryStarter fill={e.storyFill} onManual={e.handleStoryManual} /> : null}

      <AnimatePresence>
        {e.publishing ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] grid place-items-center"
            style={{ background: "rgba(20,20,20,0.5)", backdropFilter: "blur(6px)" }}
          >
            <div className="flex flex-col items-center gap-3 rounded-3xl bg-white px-8 py-6">
              <SpinnerIcon size={26} color={INK} />
              <p className="font-semibold" style={{ color: INK }}>
                Posting…
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
    <Suspense fallback={<div style={{ minHeight: "100dvh", background: "#EFEFEF" }} />}>
      <UsPageInner />
    </Suspense>
  );
}
