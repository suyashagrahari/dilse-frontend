"use client";

import { Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, PenLine, Share2, Loader2, Hand } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import StoryStarter from "@/components/story/StoryStarter";
import { useHoldMyHandEditor } from "./hooks/useHoldMyHandEditor";
import HoldMyHand from "./components/HoldMyHand";
import EditSheet from "./components/EditSheet";
import { HMH } from "./components/types";

const CHIP = "inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold shadow-sm";

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
