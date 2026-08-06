"use client";

// ─── Dedication — the editor route ───────────────────────────────────────────
//
// Same three-lives top bar as the sibling editors: Create → Publish → Share.
// The radio underneath is the live preview and it is keyed on `previewVersion`,
// so every save remounts it and the show replays from the dial. That is not a
// nicety — the show machine captures its running order at construction and owns
// an unlocked audio session, so a remount is the only safe way to swap shows.

import { Suspense, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, PenLine, Send, Share2, Loader2, X, Copy } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import { useDedicationEditor } from "./hooks/useDedicationEditor";
import DedicationTemplate from "./components/DedicationTemplate";
import EditSheet from "./components/EditSheet";
import { toShow, type Toast } from "./components/showData";

const ACCENT = "#B4441F";
const ACCENT_GRAD = "linear-gradient(135deg,#C2551F,#8c3b2a)";
const CHROME = "rgba(255,251,246,.94)";
const CHROME_BORDER = "1px solid #EDDCC9";

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
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="pointer-events-auto w-full rounded-2xl px-4 py-3 shadow-lg flex items-center gap-3"
            style={{ background: "#fff", border: CHROME_BORDER }}
          >
            <div className="flex-1">
              <p className="text-sm font-bold" style={{ color: ACCENT }}>{t.title}</p>
              {t.message && <p className="text-xs text-muted-foreground mt-0.5">{t.message}</p>}
            </div>
            {t.type === "publish" && (
              <button
                onClick={() => onCopy(t.shareUrl)}
                aria-label="Copy link"
                className="p-1.5 rounded-lg"
                style={{ color: ACCENT, background: "#FDF3EC" }}
              >
                <Copy size={14} />
              </button>
            )}
            <button onClick={() => onDismiss(t.id)} aria-label="Dismiss" className="p-1 text-muted-foreground">
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function DedicationPageInner() {
  const e = useDedicationEditor();
  const show = useMemo(() => toShow(e.displayData), [e.displayData]);

  const topAction = e.showShare
    ? { label: e.shareLabel, onClick: e.handleShare, icon: <Share2 size={14} /> }
    : e.showPublish
      ? { label: e.publishing ? "Publishing…" : "Publish", onClick: e.publish, icon: <Send size={14} /> }
      : { label: "Create", onClick: e.handleEditClick, icon: <PenLine size={14} /> };

  return (
    <div style={{ minHeight: "100dvh", position: "relative", background: "#070302" }}>
      <div
        className="fixed top-3 left-0 right-0 z-[120] px-3 flex items-center gap-2"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)", pointerEvents: "none" }}
      >
        <button
          onClick={e.goBack}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold shadow-sm min-h-[44px]"
          style={{ pointerEvents: "auto", background: CHROME, color: ACCENT, border: CHROME_BORDER, backdropFilter: "blur(8px)" }}
        >
          <ArrowLeft size={15} /> Back
        </button>
        <div className="flex-1" />
        {e.isPersonalized && !e.showShare && (
          <button
            onClick={e.handleEditFromPreview}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold shadow-sm min-h-[44px]"
            style={{ pointerEvents: "auto", background: CHROME, color: ACCENT, border: CHROME_BORDER, backdropFilter: "blur(8px)" }}
          >
            <PenLine size={14} /> Edit
          </button>
        )}
        <button
          onClick={topAction.onClick}
          disabled={e.publishing}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold text-white shadow-md disabled:opacity-60 min-h-[44px]"
          style={{ pointerEvents: "auto", background: ACCENT_GRAD }}
        >
          {topAction.icon} {topAction.label}
        </button>
      </div>

      {/* The radio. Keyed so every save replays the show from the dial. */}
      <div style={{ paddingTop: 56 }}>
        <DedicationTemplate key={e.previewVersion} data={show} mode="demo" />
      </div>

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

      <AnimatePresence>
        {e.publishing && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] grid place-items-center"
            style={{ background: "rgba(26,10,4,.6)", backdropFilter: "blur(6px)" }}
          >
            <div className="flex flex-col items-center gap-3 px-8 py-6 rounded-3xl" style={{ background: "#fff" }}>
              <Loader2 size={28} className="animate-spin" style={{ color: ACCENT }} />
              <p className="font-semibold" style={{ color: ACCENT }}>Going on air…</p>
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

export default function DedicationPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", background: "#070302" }} />}>
      <DedicationPageInner />
    </Suspense>
  );
}
