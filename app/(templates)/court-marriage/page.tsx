"use client";

import { Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, PenLine, Stamp, Share2, Loader2 } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import StoryStarter from "@/components/story/StoryStarter";
import { useCourtMarriageEditor } from "./hooks/useCourtMarriageEditor";
import CourtMarriageTemplate, { usePrefersReducedMotion } from "./components/CourtMarriageTemplate";
import EditSheet from "./components/EditSheet";

import { templateMediaBase } from "@/lib/templateMedia";

/** Animation set for this template — served from S3, never bundled. */
const ASSET = templateMediaBase("court-marriage");

const SEAL = "#3f4c8f";
const SEAL_GRADIENT = "linear-gradient(135deg,#5566b8,#2f3a70)";
const CHROME = { fontFamily: "var(--font-inter), system-ui, sans-serif" } as const;

function CourtMarriagePageInner() {
  const e = useCourtMarriageEditor();
  const reduced = usePrefersReducedMotion();

  const topAction = e.showShare
    ? { label: e.shareLabel, onClick: e.handleShare, icon: <Share2 size={14} /> }
    : e.showPublish
      ? { label: e.publishing ? "Registering…" : "Publish", onClick: e.publish, icon: <Stamp size={14} /> }
      : { label: "Create", onClick: e.handleEditClick, icon: <PenLine size={14} /> };

  const pill = {
    background: "rgba(255,255,255,.9)",
    color: SEAL,
    border: "1px solid #d9dcef",
    backdropFilter: "blur(8px)",
    minHeight: 40,
    ...CHROME,
  } as const;

  return (
    <div style={{ minHeight: "100dvh", position: "relative" }}>
      {/* Floating top bar */}
      <div className="fixed left-0 right-0 top-3 z-[120] flex items-center gap-2 px-3" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
        <button onClick={e.goBack} className="inline-flex items-center gap-1.5 rounded-full px-3 text-sm font-semibold shadow-sm" style={pill}>
          <ArrowLeft size={15} /> Back
        </button>
        <div className="flex-1" />
        {e.isPersonalized && !e.showShare && (
          <button onClick={e.handleEditFromPreview} className="inline-flex items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold shadow-sm" style={pill}>
            <PenLine size={14} /> Edit
          </button>
        )}
        <button
          onClick={topAction.onClick}
          disabled={e.publishing}
          className="inline-flex items-center gap-1.5 rounded-full px-4 text-sm font-bold text-white shadow-md disabled:opacity-60"
          style={{ background: SEAL_GRADIENT, minHeight: 40, ...CHROME }}
        >
          {topAction.icon} {topAction.label}
        </button>
      </div>

      <CourtMarriageTemplate data={e.displayData} mode="preview" />

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
        <StoryStarter fill={e.fill} onManual={e.openManualForm} title="Let's fill in the certificate" />
      )}

      {/* Registering overlay — the typewriter belongs here, never on the paper. */}
      <AnimatePresence>
        {e.publishing && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] grid place-items-center"
            style={{ background: "rgba(31,35,60,.55)", backdropFilter: "blur(6px)" }}
          >
            <div className="flex flex-col items-center gap-3 rounded-3xl bg-white px-8 py-6" style={CHROME}>
              {reduced ? (
                <Loader2 size={28} className="animate-spin" style={{ color: SEAL }} />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={`${ASSET}/typing.webp`} alt="" width={96} height={96} />
              )}
              <p className="font-semibold" style={{ color: SEAL }}>Entering it in the register…</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Publish-success celebration. Fires on the transition into Share. */}
      <AnimatePresence>
        {e.justPublished && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="pointer-events-none fixed inset-0 z-[320] grid place-items-center"
            style={{ background: "rgba(250,246,237,.72)" }}
          >
            <div className="flex flex-col items-center gap-2" style={CHROME}>
              {reduced ? (
                <div className="text-6xl" aria-hidden>🎉</div>
              ) : (
                <video src={`${ASSET}/hug.webm`} autoPlay loop muted playsInline width={220} height={220} aria-hidden />
              )}
              <p className="text-lg font-extrabold" style={{ color: SEAL }}>Duly registered 📜</p>
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

export default function CourtMarriagePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", background: "#e2dac7" }} />}>
      <CourtMarriagePageInner />
    </Suspense>
  );
}
