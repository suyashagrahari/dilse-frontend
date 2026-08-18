"use client";

import { Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, PenLine, Share2, Loader2, X, Copy, Hand } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import StoryStarter from "@/components/story/StoryStarter";
import { useHoldMyHandEditor } from "./hooks/useHoldMyHandEditor";
import HoldMyHand from "./components/HoldMyHand";
import EditSheet from "./components/EditSheet";
import { HMH, type Toast } from "./components/types";

const CHIP = "inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold shadow-sm";

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
            style={{ background: HMH.surface, border: `1px solid ${HMH.border}`, fontFamily: HMH.body }}
          >
            <div className="flex-1">
              <p className="text-sm font-bold" style={{ color: HMH.indigo }}>{t.title}</p>
              {t.message && <p className="text-xs mt-0.5" style={{ color: HMH.muted }}>{t.message}</p>}
            </div>
            {t.type === "publish" && (
              <button onClick={() => onCopy(t.shareUrl)} className="p-1.5 rounded-lg" style={{ color: HMH.indigo, background: "rgba(108,92,231,.1)" }}>
                <Copy size={14} />
              </button>
            )}
            <button onClick={() => onDismiss(t.id)} className="p-1" style={{ color: HMH.muted }}><X size={14} /></button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function HoldMyHandPageInner() {
  const e = useHoldMyHandEditor();

  const topAction = e.showShare
    ? { label: e.shareLabel, onClick: e.handleShare, icon: <Share2 size={14} /> }
    : e.showPublish
      ? { label: e.publishing ? "Publishing…" : "Publish", onClick: e.publish, icon: <Hand size={14} /> }
      : { label: "Create", onClick: e.handleEditClick, icon: <PenLine size={14} /> };

  // The hold surface is near-black, so the chrome is glass rather than cream.
  const glassChip = {
    background: "rgba(255,255,255,.14)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,.22)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    fontFamily: HMH.display,
  } as const;

  return (
    <div style={{ minHeight: "100dvh", position: "relative", background: HMH.void }}>
      <div
        className="fixed top-3 left-0 right-0 z-[120] px-3 flex items-center gap-2"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <button onClick={e.goBack} className={CHIP} style={glassChip}>
          <ArrowLeft size={15} /> Back
        </button>
        <div className="flex-1" />
        {e.isPersonalized && !e.showShare && (
          <button onClick={e.handleEditFromPreview} className={CHIP} style={glassChip}>
            <PenLine size={14} /> Edit
          </button>
        )}
        <button
          onClick={topAction.onClick}
          disabled={e.publishing}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold shadow-md disabled:opacity-60"
          style={{ background: HMH.lime, color: HMH.ink, fontFamily: HMH.display }}
        >
          {topAction.icon} {topAction.label}
        </button>
      </div>

      {/* Live preview. Keyed so every save/publish restarts the hold from zero
          with the latest photo, duration and lines. */}
      <HoldMyHand
        key={e.previewVersion}
        data={e.displayData}
        mode="preview"
        paused={e.editMode === "manual"}
      />

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
          schema for this template. Every way out of it lands in the EditSheet
          above, populated and fully editable. */}
      {e.storyStarter && (
        <StoryStarter fill={e.fill} onManual={e.openManualForm} title="Let's write what they'll hold" />
      )}

      <AnimatePresence>
        {e.publishing && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] grid place-items-center"
            style={{ background: "rgba(7,5,13,.72)", backdropFilter: "blur(6px)" }}
          >
            <div className="flex flex-col items-center gap-3 px-8 py-6 rounded-[28px]" style={{ background: HMH.surface }}>
              <Loader2 size={28} className="animate-spin" style={{ color: HMH.indigo }} />
              <p className="font-semibold" style={{ color: HMH.indigo, fontFamily: HMH.display }}>Publishing…</p>
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

export default function HoldMyHandPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", background: HMH.void }} />}>
      <HoldMyHandPageInner />
    </Suspense>
  );
}
