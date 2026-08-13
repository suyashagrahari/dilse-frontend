"use client";

import { Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, PenLine, Share2, Loader2, X, Copy, Sparkles } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import { useRakhiEditor } from "./hooks/useRakhiEditor";
import RakhiTemplate from "./components/RakhiTemplate";
import EditSheet from "./components/EditSheet";
import { RB, PAPER_GRADIENT, BRAND_GRADIENT, CARD_BORDER, CARD_SHADOW } from "./components/theme";
import type { Toast } from "./components/types";
import "./components/rakhi.css";

function ToastStack({
  toasts,
  onDismiss,
  onCopy,
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
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="pointer-events-auto w-full rounded-2xl px-4 py-3 flex items-center gap-3"
            style={{
              background: RB.surface,
              border: CARD_BORDER,
              boxShadow: CARD_SHADOW,
            }}
          >
            <div className="flex-1">
              <p className="text-sm font-bold" style={{ color: RB.red }}>
                {t.title}
              </p>
              {t.message && (
                <p className="text-xs" style={{ color: RB.muted }}>
                  {t.message}
                </p>
              )}
            </div>
            {t.type === "publish" && (
              <button
                onClick={() => onCopy(t.shareUrl)}
                aria-label="Copy link"
                className="p-1.5 rounded-lg"
                style={{ color: RB.red, background: "rgba(155,34,38,0.12)" }}
              >
                <Copy size={14} />
              </button>
            )}
            <button
              onClick={() => onDismiss(t.id)}
              aria-label="Dismiss"
              className="p-1.5 rounded-lg"
              style={{ color: RB.muted }}
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function RakhiPageInner() {
  const e = useRakhiEditor();

  const topAction = e.showShare
    ? { label: e.shareLabel, onClick: e.handleShare, icon: <Share2 size={14} /> }
    : e.showPublish
      ? {
          label: e.publishing ? "Sending…" : "Send it",
          onClick: e.publish,
          icon: <Sparkles size={14} />,
        }
      : { label: "Create", onClick: e.handleStartCreate, icon: <PenLine size={14} /> };

  const barBtn: React.CSSProperties = {
    background: RB.surface,
    color: RB.ink,
    border: CARD_BORDER,
    boxShadow: "2px 3px 0 rgba(61,35,23,0.14)",
  };

  return (
    <div className="rb-root" style={{ minHeight: "100dvh", position: "relative", background: PAPER_GRADIENT }}>
      <div className="fixed top-3 left-0 right-0 z-[200] flex items-center justify-between px-3 max-w-[520px] mx-auto">
        <button
          onClick={e.goBack}
          aria-label="Back to templates"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-bold"
          style={barBtn}
        >
          <ArrowLeft size={15} />
        </button>

        <div className="flex items-center gap-2">
          {e.isPersonalized && !e.showShare && (
            <button
              onClick={e.handleEditFromPreview}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-bold"
              style={barBtn}
            >
              <PenLine size={14} /> Edit
            </button>
          )}
          <button
            onClick={topAction.onClick}
            disabled={e.publishing}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold disabled:opacity-60"
            style={{
              background: BRAND_GRADIENT,
              color: "#fffdf8",
              border: CARD_BORDER,
              boxShadow: CARD_SHADOW,
            }}
          >
            {topAction.icon} {topAction.label}
          </button>
        </div>
      </div>

      {/* Live preview. Keyed so each save restarts the ritual from the cover —
          otherwise she saves a change and is left staring at step 3. */}
      <RakhiTemplate key={e.previewVersion} data={e.displayData} mode="preview" />

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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] grid place-items-center"
            style={{ background: "rgba(43,26,16,0.5)", backdropFilter: "blur(4px)" }}
          >
            <div
              className="flex flex-col items-center gap-3 px-8 py-6 rounded-3xl"
              style={{ background: RB.surface, border: CARD_BORDER }}
            >
              <Loader2 size={30} className="animate-spin" style={{ color: RB.red }} />
              <p className="font-bold" style={{ color: RB.ink }} aria-live="polite">
                Tying your rakhi…
              </p>
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

export default function HappyRakshaBandhanPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", background: "#fdf8ee" }} />}>
      <RakhiPageInner />
    </Suspense>
  );
}
