"use client";

import { Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, PenLine, Send, Share2, Loader2, X, Copy } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import { usePhotoPuzzleEditor } from "./hooks/usePhotoPuzzleEditor";
import PhotoPuzzleTemplate from "./components/PhotoPuzzleTemplate";
import EditSheet from "./components/EditSheet";
import StoryStarter from "@/components/story/StoryStarter";
import type { Toast } from "./components/types";
import { INDIGO, GRAD, CHROME, CHROME_BORDER, INK_SOFT } from "./components/puzzleTheme";

function ToastStack({
  toasts, onDismiss, onCopy,
}: { toasts: Toast[]; onDismiss: (id: number) => void; onCopy: (url?: string) => void }) {
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
            style={{ background: "#fff", border: CHROME_BORDER }}
          >
            <div className="flex-1">
              <p className="text-sm font-bold" style={{ color: INDIGO }}>{t.title}</p>
              {t.message && <p className="text-xs mt-0.5" style={{ color: INK_SOFT }}>{t.message}</p>}
            </div>
            {t.type === "publish" && (
              <button
                onClick={() => onCopy(t.shareUrl)}
                aria-label="Copy link"
                className="grid place-items-center w-11 h-11 rounded-xl"
                style={{ color: INDIGO, background: "#EEF2FF" }}
              >
                <Copy size={14} />
              </button>
            )}
            <button
              onClick={() => onDismiss(t.id)}
              aria-label="Dismiss"
              className="grid place-items-center w-11 h-11 -mr-2"
              style={{ color: INK_SOFT }}
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function PhotoPuzzlePageInner() {
  const e = usePhotoPuzzleEditor();

  // One button, three lives: Create → Publish → Share.
  const topAction = e.showShare
    ? { label: e.shareLabel, onClick: e.handleShare, icon: <Share2 size={14} /> }
    : e.showPublish
      ? { label: e.publishing ? "Publishing…" : "Publish", onClick: e.publish, icon: <Send size={14} /> }
      : { label: "Create", onClick: e.handleEditClick, icon: <PenLine size={14} /> };

  return (
    <div style={{ minHeight: "100dvh", position: "relative" }}>
      {/* Floating top bar */}
      <div
        className="fixed top-3 left-0 right-0 z-[120] px-3 flex items-center gap-2"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <button
          onClick={e.goBack}
          className="inline-flex items-center gap-1.5 px-3 rounded-full text-sm font-semibold shadow-sm"
          style={{ minHeight: 44, background: CHROME, color: INDIGO, border: CHROME_BORDER, backdropFilter: "blur(8px)" }}
        >
          <ArrowLeft size={15} /> Back
        </button>
        <div className="flex-1" />
        {e.isPersonalized && !e.showShare && (
          <button
            onClick={e.handleEditFromPreview}
            className="inline-flex items-center gap-1.5 px-3.5 rounded-full text-sm font-semibold shadow-sm"
            style={{ minHeight: 44, background: CHROME, color: INDIGO, border: CHROME_BORDER, backdropFilter: "blur(8px)" }}
          >
            <PenLine size={14} /> Edit
          </button>
        )}
        <button
          onClick={topAction.onClick}
          disabled={e.publishing}
          className="inline-flex items-center gap-1.5 px-4 rounded-full text-sm font-bold text-white shadow-md disabled:opacity-60"
          style={{ minHeight: 44, background: GRAD }}
        >
          {topAction.icon} {topAction.label}
        </button>
      </div>

      {/* Live demo preview. Keyed so every save recuts the puzzle with the new
          grid and photo and starts from an empty board. */}
      <PhotoPuzzleTemplate key={e.previewVersion} data={e.displayData} mode="demo" />

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
          schema for this template. Every way out lands in the EditSheet above,
          fully editable. */}
      {e.storyStarter && (
        <StoryStarter fill={e.fill} onManual={e.openManualForm} title="Let's write the letter" />
      )}

      <AnimatePresence>
        {e.publishing && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] grid place-items-center"
            style={{ background: "rgba(34,30,58,.55)", backdropFilter: "blur(6px)" }}
          >
            <div className="flex flex-col items-center gap-3 px-8 py-6 rounded-3xl" style={{ background: "#fff" }}>
              <Loader2 size={28} className="animate-spin" style={{ color: INDIGO }} />
              <p className="font-semibold" style={{ color: INDIGO }}>Boxing up the pieces…</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ToastStack toasts={e.toasts} onDismiss={e.dismissToast} onCopy={e.handleCopy} />

      {/* Auth is deferred, not gating: onClose cancels the pending publish,
          onSuccess just closes and the hook's effect resumes it. */}
      <AnimatePresence>
        {e.showAuth && <AuthModal onClose={e.closeAuth} onSuccess={e.closeAuthSuccess} />}
      </AnimatePresence>
    </div>
  );
}

export default function PhotoPuzzlePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", background: "#EEF2FF" }} />}>
      <PhotoPuzzlePageInner />
    </Suspense>
  );
}
