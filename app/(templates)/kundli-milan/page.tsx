"use client";

// Thin renderer over `useKundliMilanEditor`. Everything stateful lives in the
// hook; this file only decides what the floating top bar says and where the
// three overlays (sheet, publishing, toasts) sit.

import { Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, PenLine, Stars, Share2, Loader2 } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import StoryStarter from "@/components/story/StoryStarter";
import { useKundliMilanEditor } from "./hooks/useKundliMilanEditor";
import KundliMilanTemplate from "./components/KundliMilanTemplate";
import EditSheet from "./components/EditSheet";

const ACCENT = "#6C5CE7";
const PAPER = "#fdfbf4";

function KundliMilanPageInner() {
  const e = useKundliMilanEditor();

  // One polymorphic button: Create → Publish → Share, driven entirely by the
  // hook's three booleans. Never two primary actions at once.
  const topAction = e.showShare
    ? { label: e.shareLabel, onClick: e.handleShare, icon: <Share2 size={14} /> }
    : e.showPublish
      ? { label: e.publishing ? "Publishing…" : "Publish", onClick: e.publish, icon: <Stars size={14} /> }
      : { label: "Create", onClick: e.handleEditClick, icon: <PenLine size={14} /> };

  return (
    <div style={{ minHeight: "100dvh", position: "relative" }}>
      <div className="fixed top-3 left-0 right-0 z-[120] px-3 flex items-center gap-2" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
        <button
          onClick={e.goBack}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold shadow-sm"
          style={{ background: "rgba(255,255,255,.92)", color: ACCENT, border: "1px solid #e2ddf8", backdropFilter: "blur(8px)" }}
        >
          <ArrowLeft size={15} /> Back
        </button>
        <div className="flex-1" />
        {e.isPersonalized && !e.showShare && (
          <button
            onClick={e.handleEditFromPreview}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold shadow-sm"
            style={{ background: "rgba(255,255,255,.92)", color: ACCENT, border: "1px solid #e2ddf8", backdropFilter: "blur(8px)" }}
          >
            <PenLine size={14} /> Edit
          </button>
        )}
        <button
          onClick={topAction.onClick}
          disabled={e.publishing}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold text-white shadow-md disabled:opacity-60"
          style={{ background: ACCENT }}
        >
          {topAction.icon} {topAction.label}
        </button>
      </div>

      {/* Live preview, seeded with DEMO_DATA until the form is filled. Keyed on
          previewVersion so every save replays the computation sequence from the
          top — that reveal is the template, and a cached report is not. */}
      <KundliMilanTemplate key={e.previewVersion} data={e.displayData} mode="demo" />

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

      {/* Shown the first time Create is tapped, and only when the server has a
          schema for this template. Every way out of it lands in the EditSheet
          above, populated and fully editable. */}
      {e.storyStarter && (
        <StoryStarter fill={e.fill} onManual={e.openManualForm} title="Let's write the reading" />
      )}

      <AnimatePresence>
        {e.publishing && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] grid place-items-center"
            style={{ background: "rgba(20,20,24,.55)", backdropFilter: "blur(6px)" }}
          >
            <div className="flex flex-col items-center gap-3 px-8 py-6 rounded-3xl bg-white">
              <Loader2 size={28} className="animate-spin" style={{ color: ACCENT }} />
              <p className="font-semibold" style={{ color: ACCENT }}>Filing the report…</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth is deferred, not gated: this only ever appears from a Publish
          click, and the hook resumes that publish once it closes successfully. */}
      <AnimatePresence>
        {e.showAuth && <AuthModal onClose={e.closeAuth} onSuccess={e.closeAuthSuccess} />}
      </AnimatePresence>
    </div>
  );
}

export default function KundliMilanPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", background: PAPER }} />}>
      <KundliMilanPageInner />
    </Suspense>
  );
}
