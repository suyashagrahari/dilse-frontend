"use client";

import { Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, PenLine, Gavel, Share2, Loader2, X, Copy } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import { useCourtOfLoveEditor } from "./hooks/useCourtOfLoveEditor";
import CourtOfLove from "./components/CourtOfLove";
import EditSheet from "./components/EditSheet";
import type { Toast } from "./components/types";

const TEXT = "#0E0E12";
const SURFACE = "#FFFFFF";
const BORDER = "#ECEAE3";
const INDIGO = "#6C5CE7";
const LIME = "#C6FF3D";
const HEAD = "var(--font-space-grotesk), ui-sans-serif, system-ui, sans-serif";
const BODY = "var(--font-inter), ui-sans-serif, system-ui, sans-serif";

const pill: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "9px 14px",
  borderRadius: 999,
  background: "rgba(255,255,255,.9)",
  color: TEXT,
  border: `1px solid ${BORDER}`,
  backdropFilter: "blur(14px)",
  fontFamily: HEAD,
  fontSize: 13.5,
  fontWeight: 600,
  boxShadow: "0 8px 24px rgba(14,14,18,.06)",
  cursor: "pointer",
  minHeight: 42,
};

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
    <div
      className="fixed left-1/2 -translate-x-1/2 z-[400] flex flex-col gap-2 items-center w-[92%] max-w-sm pointer-events-none"
      style={{ top: "calc(env(safe-area-inset-top, 0px) + 62px)" }}
    >
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="pointer-events-auto w-full flex items-center gap-3"
            style={{
              background: SURFACE,
              border: `1px solid ${BORDER}`,
              borderRadius: 20,
              padding: "12px 15px",
              boxShadow: "0 12px 30px rgba(14,14,18,.12)",
            }}
          >
            <div className="flex-1 min-w-0">
              <p style={{ fontFamily: HEAD, fontSize: 13.5, fontWeight: 700, color: TEXT, margin: 0 }}>
                {t.title}
              </p>
              {t.message && (
                <p style={{ fontFamily: BODY, fontSize: 11.5, color: "#5B5B66", margin: "2px 0 0" }}>
                  {t.message}
                </p>
              )}
            </div>
            {t.type === "publish" && (
              <button
                onClick={() => onCopy(t.shareUrl)}
                aria-label="Copy link"
                style={{
                  flexShrink: 0,
                  padding: 7,
                  borderRadius: 12,
                  color: INDIGO,
                  background: "rgba(108,92,231,.1)",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <Copy size={14} />
              </button>
            )}
            <button
              onClick={() => onDismiss(t.id)}
              aria-label="Dismiss"
              style={{ flexShrink: 0, padding: 4, color: "#5B5B66", background: "none", border: "none", cursor: "pointer" }}
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function CourtOfLovePageInner() {
  const e = useCourtOfLoveEditor();

  const topAction = e.showShare
    ? { label: e.shareLabel, onClick: e.handleShare, icon: <Share2 size={14} /> }
    : e.showPublish
      ? { label: e.publishing ? "Publishing…" : "Publish", onClick: e.publish, icon: <Gavel size={14} /> }
      : { label: "Create", onClick: e.handleEditClick, icon: <PenLine size={14} /> };

  return (
    <div style={{ minHeight: "100dvh", position: "relative" }}>
      {/* Floating top bar */}
      <div
        className="fixed left-0 right-0 z-[120] px-3 flex items-center gap-2"
        style={{ top: "calc(env(safe-area-inset-top, 0px) + 10px)" }}
      >
        <button onClick={e.goBack} style={pill}>
          <ArrowLeft size={15} /> Back
        </button>
        <div className="flex-1" />
        {e.isPersonalized && !e.showShare && (
          <button onClick={e.handleEditFromPreview} style={pill}>
            <PenLine size={14} /> Edit
          </button>
        )}
        <button
          onClick={topAction.onClick}
          disabled={e.publishing}
          style={{
            ...pill,
            background: LIME,
            border: "none",
            fontWeight: 700,
            boxShadow: "0 8px 22px rgba(198,255,61,.45)",
            opacity: e.publishing ? 0.6 : 1,
          }}
        >
          {topAction.icon} {topAction.label}
        </button>
      </div>

      {/* Live preview — keyed so each save restarts the trial from the summons. */}
      <CourtOfLove key={e.previewVersion} data={e.displayData} mode="preview" />

      <EditSheet
        editMode={e.editMode}
        setEditMode={e.setEditMode}
        mf={e.mf}
        updateMf={e.updateMf}
        updateQuestion={e.updateQuestion}
        updateOption={e.updateOption}
        pagePassword={e.pagePassword}
        setPagePassword={e.setPagePassword}
        onSave={e.handleSave}
        saving={e.saving}
        story={e.story}
        setStory={e.setStory}
        generating={e.generating}
        generatedLanguage={e.generatedLanguage}
        hasGenerated={e.hasGenerated}
        onGenerate={e.generateFromStory}
      />

      {/* Publishing overlay */}
      <AnimatePresence>
        {e.publishing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] grid place-items-center"
            style={{ background: "rgba(14,14,18,.5)", backdropFilter: "blur(6px)" }}
          >
            <div
              className="flex flex-col items-center gap-3"
              style={{ background: SURFACE, padding: "26px 32px", borderRadius: 28 }}
            >
              <Loader2 size={28} className="animate-spin" style={{ color: INDIGO }} />
              <p style={{ fontFamily: HEAD, fontSize: 14.5, fontWeight: 700, color: TEXT, margin: 0 }}>
                Filing your case…
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

export default function CourtOfLovePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", background: "#FAFAF7" }} />}>
      <CourtOfLovePageInner />
    </Suspense>
  );
}
