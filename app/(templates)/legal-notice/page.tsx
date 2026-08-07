"use client";

import { Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, PenLine, Scale, Share2, Loader2, X, Copy } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import StoryStarter from "@/components/story/StoryStarter";
import { useLegalNoticeEditor } from "./hooks/useLegalNoticeEditor";
import LegalNotice from "./components/LegalNotice";
import EditSheet from "./components/EditSheet";
import type { Toast } from "./components/types";

const ACCENT = "#6C5CE7";

function ToastStack({ toasts, onDismiss, onCopy }: { toasts: Toast[]; onDismiss: (id: number) => void; onCopy: (url?: string) => void }) {
  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[400] flex flex-col gap-2 items-center w-[92%] max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="pointer-events-auto w-full rounded-2xl px-4 py-3 shadow-lg flex items-center gap-3"
            style={{ background: "#fff", border: "1px solid #e2ddf8" }}
          >
            <div className="flex-1">
              <p className="text-sm font-bold" style={{ color: ACCENT }}>{t.title}</p>
              {t.message && <p className="text-xs text-muted-foreground mt-0.5">{t.message}</p>}
            </div>
            {t.type === "publish" && (
              <button onClick={() => onCopy(t.shareUrl)} className="p-1.5 rounded-lg" style={{ color: ACCENT, background: "#efedfd" }} aria-label="Copy link">
                <Copy size={14} />
              </button>
            )}
            <button onClick={() => onDismiss(t.id)} className="p-1 text-muted-foreground" aria-label="Dismiss"><X size={14} /></button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

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

      <ToastStack toasts={e.toasts} onDismiss={e.dismissToast} onCopy={e.handleCopy} />

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
