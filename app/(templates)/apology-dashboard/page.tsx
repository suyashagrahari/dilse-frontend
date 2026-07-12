"use client";

import { Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, PenLine, Heart, Share2, Loader2, X, Copy } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import { useApologyEditor } from "./hooks/useApologyEditor";
import ApologyDashboard from "./components/ApologyDashboard";
import EditSheet from "./components/EditSheet";
import type { Toast } from "./components/types";

const ROSE_GRADIENT = "linear-gradient(135deg,#ff7aa8,#e64072)";

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
            style={{ background: "#fff", border: "1px solid #ffd6e2" }}
          >
            <div className="flex-1">
              <p className="text-sm font-bold" style={{ color: "#e64072" }}>{t.title}</p>
              {t.message && <p className="text-xs text-muted-foreground mt-0.5">{t.message}</p>}
            </div>
            {t.type === "publish" && (
              <button onClick={() => onCopy(t.shareUrl)} className="p-1.5 rounded-lg" style={{ color: "#e64072", background: "#fff0f4" }}><Copy size={14} /></button>
            )}
            <button onClick={() => onDismiss(t.id)} className="p-1 text-muted-foreground"><X size={14} /></button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function ApologyPageInner() {
  const e = useApologyEditor();

  const topAction = e.showShare
    ? { label: "Share", onClick: e.handleShare, icon: <Share2 size={14} /> }
    : e.showPublish
      ? { label: e.publishing ? "Publishing…" : "Publish", onClick: e.publish, icon: <Heart size={14} fill="#fff" /> }
      : { label: "Create", onClick: e.handleEditClick, icon: <PenLine size={14} /> };

  return (
    <div style={{ minHeight: "100dvh", position: "relative" }}>
      {/* Floating top bar */}
      <div className="fixed top-3 left-0 right-0 z-[120] px-3 flex items-center gap-2" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
        <button onClick={e.goBack} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold shadow-sm" style={{ background: "rgba(255,255,255,.9)", color: "#e64072", border: "1px solid #ffd6e2", backdropFilter: "blur(8px)" }}>
          <ArrowLeft size={15} /> Back
        </button>
        <div className="flex-1" />
        {e.isPersonalized && !e.showShare && (
          <button onClick={e.handleEditFromPreview} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold shadow-sm" style={{ background: "rgba(255,255,255,.9)", color: "#e64072", border: "1px solid #ffd6e2", backdropFilter: "blur(8px)" }}>
            <PenLine size={14} /> Edit
          </button>
        )}
        <button onClick={topAction.onClick} disabled={e.publishing} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold text-white shadow-md disabled:opacity-60" style={{ background: ROSE_GRADIENT }}>
          {topAction.icon} {topAction.label}
        </button>
      </div>

      {/* Live preview — keyed so each save/publish restarts the experience fresh
          (scratch re-covered, whack + anger reset, newly-selected song playing). */}
      <ApologyDashboard key={e.previewVersion} data={e.displayData} mode="preview" />

      {/* Edit sheet */}
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

      {/* Publishing overlay */}
      <AnimatePresence>
        {e.publishing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] grid place-items-center" style={{ background: "rgba(136,19,55,.5)", backdropFilter: "blur(6px)" }}>
            <div className="flex flex-col items-center gap-3 px-8 py-6 rounded-3xl" style={{ background: "#fff" }}>
              <Loader2 size={28} className="animate-spin" style={{ color: "#e64072" }} />
              <p className="font-semibold" style={{ color: "#e64072" }}>Publishing your apology…</p>
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

export default function ApologyDashboardPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", background: "#FFF5F5" }} />}>
      <ApologyPageInner />
    </Suspense>
  );
}
