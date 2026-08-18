"use client";

import { Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, PenLine, Share2, Loader2, X, Copy, Sparkles } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import StoryStarter from "@/components/story/StoryStarter";
import { useProposalEditor } from "./hooks/useProposalEditor";
import ProposalTemplate from "./components/ProposalTemplate";
import EditSheet from "./components/EditSheet";
import type { Toast } from "./components/types";

const INK = "#4A3547";
const MUTED = "#8B7B88";
const SURFACE = "#FFFBF7";
const LINE = "#F3E3EC";
const PINK = "#F2789F";
const PINK_GRADIENT = "linear-gradient(135deg,#FFA0BF,#F2789F)";
const HEAD = "var(--font-fredoka), ui-rounded, ui-sans-serif, system-ui, sans-serif";

const pill: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "9px 14px",
  borderRadius: 999,
  background: "rgba(255,255,255,.88)",
  color: INK,
  border: `1px solid ${LINE}`,
  backdropFilter: "blur(14px)",
  fontFamily: HEAD,
  fontSize: 13.5,
  fontWeight: 600,
  boxShadow: "0 8px 24px rgba(74,53,71,.08)",
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
      className="pointer-events-none fixed left-1/2 z-[400] flex w-[92%] max-w-sm -translate-x-1/2 flex-col items-center gap-2"
      style={{ top: "calc(env(safe-area-inset-top, 0px) + 62px)" }}
    >
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="pointer-events-auto flex w-full items-center gap-3"
            style={{
              background: SURFACE,
              border: `1px solid ${LINE}`,
              borderRadius: 24,
              padding: "12px 15px",
              boxShadow: "0 12px 30px rgba(74,53,71,.14)",
            }}
          >
            <div className="min-w-0 flex-1">
              <p style={{ fontFamily: HEAD, fontSize: 13.5, fontWeight: 700, color: INK, margin: 0 }}>
                {t.title}
              </p>
              {t.message && (
                <p style={{ fontSize: 11.5, color: MUTED, margin: "2px 0 0" }}>{t.message}</p>
              )}
            </div>
            {t.type === "publish" && (
              <button
                onClick={() => onCopy(t.shareUrl)}
                aria-label="Copy link"
                style={{
                  flexShrink: 0,
                  padding: 7,
                  borderRadius: 14,
                  color: PINK,
                  background: "rgba(242,120,159,.12)",
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
              style={{ flexShrink: 0, padding: 4, color: MUTED, background: "none", border: "none", cursor: "pointer" }}
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function ProposalPageInner() {
  const e = useProposalEditor();

  const topAction = e.showShare
    ? { label: e.shareLabel, onClick: e.handleShare, icon: <Share2 size={14} /> }
    : e.showPublish
      ? { label: e.publishing ? "Publishing…" : "Publish", onClick: e.publish, icon: <Sparkles size={14} /> }
      : { label: "Create", onClick: e.handleEditClick, icon: <PenLine size={14} /> };

  return (
    <div style={{ minHeight: "100dvh", position: "relative" }}>
      {/* Floating top bar. Hidden while the EditSheet is open: it sits at a higher
          z-index than the sheet, so it would otherwise paint over the first field's
          label, and an overlapping "Back" mid-edit is a tap-target hazard. */}
      <div
        className="fixed left-0 right-0 z-[120] flex items-center gap-2 px-3"
        style={{
          top: "calc(env(safe-area-inset-top, 0px) + 10px)",
          opacity: e.editMode ? 0 : 1,
          pointerEvents: e.editMode ? "none" : "auto",
          visibility: e.editMode ? "hidden" : "visible",
          transition: "opacity .18s ease",
        }}
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
            background: PINK_GRADIENT,
            color: "#FFF",
            border: "none",
            fontWeight: 700,
            boxShadow: "0 8px 22px rgba(242,120,159,.45)",
            opacity: e.publishing ? 0.6 : 1,
          }}
        >
          {topAction.icon} {topAction.label}
        </button>
      </div>

      {/* Live preview — keyed so each save replays from the audio gate. */}
      <ProposalTemplate key={e.previewVersion} data={e.displayData} mode="preview" />

      <EditSheet
        editMode={e.editMode}
        setEditMode={e.setEditMode}
        mf={e.mf}
        updateMf={e.updateMf}
        updateMemory={e.updateMemory}
        addMemory={e.addMemory}
        removeMemory={e.removeMemory}
        moveMemory={e.moveMemory}
        pagePassword={e.pagePassword}
        setPagePassword={e.setPagePassword}
        errors={e.errors}
        showErrors={e.showErrors}
        memoryBytes={e.memoryBytes}
        onSave={e.handleSave}
        saving={e.saving}
      />

      {/* Shown the first time Create is tapped, and only when the server has a
          schema for this template. Every way out of it lands in the EditSheet
          above, populated and fully editable. */}
      {e.storyStarter && (
        <StoryStarter fill={e.fill} onManual={e.openManualForm} title="Let's write the proposal" />
      )}

      {/* Publishing overlay */}
      <AnimatePresence>
        {e.publishing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] grid place-items-center"
            style={{ background: "rgba(74,53,71,.5)", backdropFilter: "blur(6px)" }}
          >
            <div
              className="flex flex-col items-center gap-3"
              style={{ background: SURFACE, padding: "26px 32px", borderRadius: 28 }}
            >
              <Loader2 size={28} className="animate-spin" style={{ color: PINK }} />
              <p style={{ fontFamily: HEAD, fontSize: 14.5, fontWeight: 700, color: INK, margin: 0 }}>
                Wrapping up your proposal…
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

export default function ProposalPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", background: SURFACE }} />}>
      <ProposalPageInner />
    </Suspense>
  );
}
