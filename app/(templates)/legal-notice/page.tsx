"use client";

import { Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, PenLine, Scale, Share2, Loader2 } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import StoryStarter from "@/components/story/StoryStarter";
import { useLegalNoticeEditor } from "./hooks/useLegalNoticeEditor";
import LegalNotice from "./components/LegalNotice";
import EditSheet from "./components/EditSheet";

const ACCENT = "#6C5CE7";

function LegalNoticePageInner() {
  const e = useLegalNoticeEditor();

  const topAction = e.showShare
    ? { label: e.shareLabel, onClick: e.handleShare, icon: <Share2 size={14} /> }
    : e.showPublish
      ? { label: e.publishing ? "Publishing…" : "Publish", onClick: e.publish, icon: <Scale size={14} /> }
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

      {/* Live preview. Keyed so each save starts the demand state fresh. */}
      <LegalNotice key={e.previewVersion} data={e.displayData} mode="preview" />

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

      {/* Rendered only once "Create" has opened the form on a notice nobody has
          personalised yet, so it greets the sender instead of the landing page.
          It sits over the sheet, offering to write the whole thing first; both
          "I'll fill it in myself" and the report screen drop straight back into
          the sheet below, populated and entirely editable. With no schema for
          this slug it renders nothing and the editor is unchanged. */}
      {e.editMode === "manual" && !e.isPersonalized && (
        <StoryStarter fill={e.fill} onManual={() => e.setEditMode("manual")} title="Let's draft your notice" />
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
              <p className="font-semibold" style={{ color: ACCENT }}>Serving the notice…</p>
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

export default function LegalNoticePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", background: "#e6e3da" }} />}>
      <LegalNoticePageInner />
    </Suspense>
  );
}
