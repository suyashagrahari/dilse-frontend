"use client";

import { Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, PenLine, TicketCheck, Share2, Loader2, X, Copy } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import { useTrainTicketEditor } from "./hooks/useTrainTicketEditor";
import TrainTicket from "./components/TrainTicket";
import EditSheet from "./components/EditSheet";
import StoryStarter from "@/components/story/StoryStarter";
import type { Toast } from "./components/types";

const INK = "#1c1c1c";

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
            className="pointer-events-auto w-full px-4 py-3 flex items-center gap-3"
            style={{ background: "#fff", border: "1px solid #111", fontFamily: "var(--font-courier-prime), monospace" }}
          >
            <div className="flex-1">
              <p className="text-sm font-bold" style={{ color: INK }}>{t.title}</p>
              {t.message && <p className="text-xs text-muted-foreground mt-0.5">{t.message}</p>}
            </div>
            {t.type === "publish" && (
              <button onClick={() => onCopy(t.shareUrl)} className="p-1.5" style={{ color: INK, border: "1px solid #111" }}><Copy size={14} /></button>
            )}
            <button onClick={() => onDismiss(t.id)} className="p-1 text-muted-foreground"><X size={14} /></button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function TrainTicketPageInner() {
  const e = useTrainTicketEditor();

  const topAction = e.showShare
    ? { label: e.shareLabel, onClick: e.handleShare, icon: <Share2 size={14} /> }
    : e.showPublish
      ? { label: e.publishing ? "Publishing…" : "Publish", onClick: e.publish, icon: <TicketCheck size={14} /> }
      : { label: "Create", onClick: e.handleEditClick, icon: <PenLine size={14} /> };

  return (
    <div style={{ minHeight: "100dvh", position: "relative" }}>
      {/* Floating top bar */}
      <div className="fixed top-3 left-0 right-0 z-[120] px-3 flex items-center gap-2" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
        <button
          onClick={e.goBack}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold"
          style={{ background: "rgba(255,255,255,.92)", color: INK, border: "1px solid #111", backdropFilter: "blur(8px)", minHeight: 40 }}
        >
          <ArrowLeft size={15} /> Back
        </button>
        <div className="flex-1" />
        {e.isPersonalized && !e.showShare && (
          <button
            onClick={e.handleEditFromPreview}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold"
            style={{ background: "rgba(255,255,255,.92)", color: INK, border: "1px solid #111", backdropFilter: "blur(8px)", minHeight: 40 }}
          >
            <PenLine size={14} /> Edit
          </button>
        )}
        <button
          onClick={topAction.onClick}
          disabled={e.publishing}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
          style={{ background: INK, border: "1px solid #111", minHeight: 40 }}
        >
          {topAction.icon} {topAction.label}
        </button>
      </div>

      {/* Live preview. Keyed so every save replays the PNR reveal from WL rather
          than leaving the sender staring at a stale CNF. */}
      <TrainTicket
        key={e.previewVersion}
        data={e.displayData}
        gate={{ chartPrepared: true, passengerCount: e.displayData.passengers.length }}
        mode="preview"
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
          schema for this template. Every way out lands in the EditSheet above,
          fully editable. */}
      {e.storyStarter && (
        <StoryStarter fill={e.fill} onManual={e.openManualForm} title="Let's print your ticket" />
      )}

      <AnimatePresence>
        {e.publishing && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] grid place-items-center"
            style={{ background: "rgba(28,28,28,.55)", backdropFilter: "blur(6px)" }}
          >
            <div className="flex flex-col items-center gap-3 px-8 py-6" style={{ background: "#f4f3ef", border: "1px solid #111" }}>
              <Loader2 size={26} className="animate-spin" style={{ color: INK }} />
              <p className="font-semibold" style={{ color: INK, fontFamily: "var(--font-courier-prime), monospace" }}>
                Preparing the chart…
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

export default function TrainTicketPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", background: "#e9e8e4" }} />}>
      <TrainTicketPageInner />
    </Suspense>
  );
}
