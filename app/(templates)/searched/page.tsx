"use client";

import React, { Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Copy, Loader2, PenLine, Send, Share2, X } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import StoryStarter from "@/components/story/StoryStarter";
import { useSearchedEditor, type Toast } from "./hooks/useSearchedEditor";
import SearchedTemplate from "./components/SearchedTemplate";
import EditSheet from "./components/EditSheet";
import { PALETTE } from "./components/types";

const VIOLET = "#6D28D9";
const VIOLET_GRAD = "linear-gradient(135deg,#7C3AED,#4F46E5)";
const BAR = "rgba(255,255,255,.94)";
const BAR_BORDER = "1px solid #E6E0F5";

function ToastStack({
  toasts, onDismiss, onCopy,
}: {
  toasts: Toast[];
  onDismiss: (id: number) => void;
  onCopy: (url?: string) => void;
}) {
  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[400] flex flex-col gap-2 items-center w-[92%] max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="pointer-events-auto w-full rounded-2xl px-4 py-3 shadow-lg flex items-center gap-3"
            style={{ background: "#fff", border: BAR_BORDER }}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold" style={{ color: VIOLET }}>{t.title}</p>
              {t.message && <p className="text-xs text-muted-foreground mt-0.5">{t.message}</p>}
            </div>
            {t.type === "publish" && (
              <button
                onClick={() => onCopy(t.shareUrl)}
                aria-label="Copy link"
                className="p-1.5 rounded-lg shrink-0"
                style={{ color: VIOLET, background: "#F5F1FE" }}
              >
                <Copy size={14} />
              </button>
            )}
            <button onClick={() => onDismiss(t.id)} aria-label="Dismiss" className="p-1 text-muted-foreground shrink-0">
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function SearchedPageInner() {
  const e = useSearchedEditor();

  // One button, three lives: Create → Publish → Share.
  const topAction = e.showShare
    ? { label: e.shareLabel, onClick: e.handleShare, icon: <Share2 size={14} /> }
    : e.showPublish
      ? { label: e.publishing ? "Publishing…" : "Publish", onClick: e.publish, icon: <Send size={14} /> }
      : { label: "Create", onClick: e.handleStartCreate, icon: <PenLine size={14} /> };

  return (
    <div style={{ minHeight: "100dvh", position: "relative", background: PALETTE.bg }}>
      <div
        className="fixed top-3 left-0 right-0 z-[120] px-3 flex items-center gap-2"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)", pointerEvents: "none" }}
      >
        <button
          onClick={e.goBack}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold shadow-sm min-h-[44px]"
          style={{ pointerEvents: "auto", background: BAR, color: VIOLET, border: BAR_BORDER, backdropFilter: "blur(8px)" }}
        >
          <ArrowLeft size={15} /> Back
        </button>
        <div className="flex-1" />
        {e.isPersonalized && !e.showShare && (
          <button
            onClick={e.openSheet}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold shadow-sm min-h-[44px]"
            style={{ pointerEvents: "auto", background: BAR, color: VIOLET, border: BAR_BORDER, backdropFilter: "blur(8px)" }}
          >
            <PenLine size={14} /> Edit
          </button>
        )}
        <button
          onClick={topAction.onClick}
          disabled={e.publishing}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold text-white shadow-md disabled:opacity-60 min-h-[44px]"
          style={{ pointerEvents: "auto", background: VIOLET_GRAD }}
        >
          {topAction.icon} {topAction.label}
        </button>
      </div>

      {/* Live preview. Keyed so every save returns them to the empty box —
          the reveal only works from the landing screen. */}
      <SearchedTemplate key={e.previewVersion} data={e.displayData} mode="demo" />

      <EditSheet
        editMode={e.editMode}
        setEditMode={e.setEditMode}
        mf={e.mf}
        updateMf={e.updateMf}
        setRecipientName={e.setRecipientName}
        pagePassword={e.pagePassword}
        setPagePassword={e.setPagePassword}
        onSave={e.handleSave}
      />

      {/* Sits over the sheet above, so the first thing a sender sees after
          Create is the offer to have it written — with the form they get today
          one tap behind it. The wrapper makes a stacking context: this sheet is
          z-250 and StoryStarter is z-200, so without it the starter would open
          underneath. Renders nothing without a schema. */}
      {e.storyStarted && (
        <div style={{ position: "relative", zIndex: 260 }}>
          <StoryStarter fill={e.storyFill} onManual={e.handleStoryManual} />
        </div>
      )}

      <AnimatePresence>
        {e.publishing && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] grid place-items-center"
            style={{ background: "rgba(24,18,40,.5)", backdropFilter: "blur(6px)" }}
          >
            <div className="flex flex-col items-center gap-3 px-8 py-6 rounded-3xl" style={{ background: "#fff" }}>
              <Loader2 size={28} className="animate-spin" style={{ color: VIOLET }} />
              <p className="font-semibold" style={{ color: VIOLET }}>Indexing…</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ToastStack toasts={e.toasts} onDismiss={e.dismissToast} onCopy={e.handleCopy} />

      {/* Auth is deferred, not gating: closing cancels the pending publish and
          the hook's effect resumes it on a successful login. */}
      <AnimatePresence>
        {e.showAuth && <AuthModal onClose={e.closeAuth} onSuccess={e.closeAuthSuccess} />}
      </AnimatePresence>
    </div>
  );
}

export default function SearchedPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", background: PALETTE.bg }} />}>
      <SearchedPageInner />
    </Suspense>
  );
}
