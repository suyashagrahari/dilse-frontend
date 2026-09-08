"use client";

import { Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, PenLine, Heart, Share2, History } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import StoryStarter from "@/components/story/StoryStarter";
import { useMissYouEditor } from "./hooks/useMissYouEditor";
import MissYouTemplate from "./components/MissYouTemplate";
import EditSheet from "./components/EditSheet";
import HistorySheet from "./components/HistorySheet";

// Warm "paper" chrome tokens (match the recipient-facing theme in missyou.css).
const MU_CREAM = "#fffdfa";
const MU_EDGE = "#ead9c8";
const MU_ROSE_STRONG = "#9c2f4d";
const MU_ROSE_GRAD = "linear-gradient(135deg,#dd7f96,#b23a5b)";

function MissYouPageInner() {
  const e = useMissYouEditor();

  const topAction = e.showShare
    ? { label: "Share", onClick: e.handleShare, icon: <Share2 size={14} /> }
    : e.showPublish
      ? { label: e.publishing ? "Publishing…" : "Publish", onClick: e.publish, icon: <Heart size={14} fill="#fff" /> }
      : { label: "Create", onClick: e.handleStartCreate, icon: <PenLine size={14} /> };

  const barBtn: React.CSSProperties = { background: MU_CREAM, color: MU_ROSE_STRONG, border: `1px solid ${MU_EDGE}`, boxShadow: "0 8px 22px -12px rgba(120,60,72,.5)" };

  return (
    <div style={{ minHeight: "100dvh", position: "relative" }}>
      <div className="fixed top-3 left-0 right-0 z-[120] px-3 flex items-center gap-2" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
        <button onClick={e.goBack} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold shadow-sm" style={barBtn}>
          <ArrowLeft size={15} /> Back
        </button>
        <div className="flex-1" />
        {e.isPersonalized && !e.showShare && (
          <button onClick={e.handleEditFromPreview} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold shadow-sm" style={barBtn}>
            <PenLine size={14} /> Edit
          </button>
        )}
        {e.canViewHistory && (
          <button onClick={e.openHistory} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold shadow-sm" style={barBtn}>
            <History size={14} /> History
          </button>
        )}
        <button onClick={topAction.onClick} disabled={e.publishing} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold text-white shadow-md disabled:opacity-60" style={{ background: MU_ROSE_GRAD }}>
          {topAction.icon} {topAction.label}
        </button>
      </div>

      {/* Live preview — keyed so each save/publish restarts the experience fresh */}
      <MissYouTemplate key={e.previewVersion} data={e.displayData} mode="preview" />

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
      {e.storyStarted && (
        <StoryStarter fill={e.storyFill} onManual={e.handleStoryManual} />
      )}

      {/* PublishingOverlay — branded conic ring */}
      <AnimatePresence>
        {e.publishing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] grid place-items-center" style={{ background: "rgba(58,44,39,.55)", backdropFilter: "blur(4px)" }}>
            <div className="flex flex-col items-center gap-3 px-8 py-6 rounded-3xl" style={{ background: MU_CREAM, border: `1px solid ${MU_EDGE}` }}>
              <div aria-hidden style={{ width: 44, height: 44, borderRadius: 999, background: `conic-gradient(#dd7f96,#b23a5b,#c9a06a,#dd7f96)`, WebkitMask: "radial-gradient(farthest-side,transparent calc(100% - 5px),#000 0)", mask: "radial-gradient(farthest-side,transparent calc(100% - 5px),#000 0)", animation: "myspin 1s linear infinite" }} />
              <p className="font-semibold" style={{ color: MU_ROSE_STRONG }} aria-live="polite">Publishing your letter…</p>
              <style>{`@keyframes myspin{to{transform:rotate(360deg)}}`}</style>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <HistorySheet open={e.showHistory} onClose={e.closeHistory} loading={e.historyLoading} engagement={e.engagement} />

      <AnimatePresence>
        {e.showAuth && <AuthModal onClose={e.closeAuth} onSuccess={e.closeAuthSuccess} />}
      </AnimatePresence>
    </div>
  );
}

export default function MissYouGfPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", background: "#fbf6ef" }} />}>
      <MissYouPageInner />
    </Suspense>
  );
}
