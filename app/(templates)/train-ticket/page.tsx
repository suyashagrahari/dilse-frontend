"use client";

import { Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, PenLine, TicketCheck, Share2, Loader2 } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import { useTrainTicketEditor } from "./hooks/useTrainTicketEditor";
import TrainTicket from "./components/TrainTicket";
import EditSheet from "./components/EditSheet";
import StoryStarter from "@/components/story/StoryStarter";

const ACCENT = "#d0245f";
/** Frosted glass over whichever theme is showing. */
const CHROME: React.CSSProperties = {
  background: "rgba(18,10,30,.55)",
  color: "#fff6fb",
  border: "1px solid rgba(255,255,255,.16)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
};

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
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold"
          style={{ ...CHROME, minHeight: 44 }}
        >
          <ArrowLeft size={15} /> Back
        </button>
        <div className="flex-1" />
        {e.isPersonalized && !e.showShare && (
          <button
            onClick={e.handleEditFromPreview}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold"
            style={{ ...CHROME, minHeight: 44 }}
          >
            <PenLine size={14} /> Edit
          </button>
        )}
        <button
          onClick={topAction.onClick}
          disabled={e.publishing}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold text-white disabled:opacity-60"
          style={{ background: "linear-gradient(115deg,#ff4f8b 0%,#ff7a5c 48%,#ffb03c 100%)", minHeight: 44, boxShadow: "0 12px 26px -12px rgba(255,79,139,.9)" }}
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
        onThemeChange={e.shareUrl ? undefined : e.setTheme}
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
            style={{ background: "rgba(20,20,24,.55)", backdropFilter: "blur(6px)" }}
          >
            <div className="flex flex-col items-center gap-3 px-8 py-6 rounded-3xl bg-white">
              <Loader2 size={28} className="animate-spin" style={{ color: ACCENT }} />
              <p className="font-semibold" style={{ color: ACCENT }}>
                Preparing the chart… 🚆
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {e.showAuth && <AuthModal onClose={e.closeAuth} onSuccess={e.closeAuthSuccess} />}
      </AnimatePresence>
    </div>
  );
}

export default function TrainTicketPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", background: "#0d1030" }} />}>
      <TrainTicketPageInner />
    </Suspense>
  );
}
