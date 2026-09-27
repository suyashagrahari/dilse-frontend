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

const ACCENT = "#d0245f";
const GRAD = "linear-gradient(115deg,#ff4f8b 0%,#ff7a5c 48%,#ffb03c 100%)";
/** Frosted glass that reads on every theme, dark or light. */
const CHROME: React.CSSProperties = {
  background: "rgba(18,10,30,.55)",
  color: "#fff6fb",
  border: "1px solid rgba(255,255,255,.18)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  minHeight: 44,
};

function CourtMarriagePageInner() {
  const e = useCourtMarriageEditor();
  const reduced = usePrefersReducedMotion();

  const topAction = e.showShare
    ? { label: e.shareLabel, onClick: e.handleShare, icon: <Share2 size={14} /> }
    : e.showPublish
      ? { label: e.publishing ? "Registering…" : "Publish", onClick: e.publish, icon: <Stamp size={14} /> }
      : { label: "Create", onClick: e.handleEditClick, icon: <PenLine size={14} /> };

  return (
    <div style={{ minHeight: "100dvh", position: "relative" }}>
      {/* Floating top bar */}
      <div className="fixed left-0 right-0 top-3 z-[120] flex items-center gap-2 px-3" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
        <button onClick={e.goBack} className="inline-flex items-center gap-1.5 rounded-full px-3 text-sm font-semibold shadow-sm" style={CHROME}>
          <ArrowLeft size={15} /> Back
        </button>
        <div className="flex-1" />
        {e.isPersonalized && !e.showShare && (
          <button onClick={e.handleEditFromPreview} className="inline-flex items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold shadow-sm" style={CHROME}>
            <PenLine size={14} /> Edit
          </button>
        )}
        <button
          onClick={topAction.onClick}
          disabled={e.publishing}
          className="inline-flex items-center gap-1.5 rounded-full px-4 text-sm font-bold text-white shadow-md disabled:opacity-60"
          style={{ background: GRAD, minHeight: 44, boxShadow: "0 12px 26px -12px rgba(255,79,139,.9)" }}
        >
          {topAction.icon} {topAction.label}
        </button>
      </div>

      <CourtMarriageTemplate data={e.displayData} mode="preview" onThemeChange={e.shareUrl ? undefined : e.setTheme} />

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
            style={{ background: "rgba(18,10,30,.55)", backdropFilter: "blur(6px)" }}
          >
            <div className="flex flex-col items-center gap-3 rounded-3xl bg-white px-8 py-6">
              {reduced ? (
                <Loader2 size={28} className="animate-spin" style={{ color: ACCENT }} />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={`${ASSET}/typing.webp`} alt="" width={96} height={96} />
              )}
              <p className="font-semibold" style={{ color: ACCENT }}>Entering it in the register…</p>
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
            style={{ background: "rgba(18,10,30,.55)", backdropFilter: "blur(4px)" }}
          >
            <div className="flex flex-col items-center gap-2 rounded-3xl bg-white px-8 py-6">
              {reduced ? (
                <div className="text-6xl" aria-hidden>🎉</div>
              ) : (
                <video src={`${ASSET}/hug.webm`} autoPlay loop muted playsInline width={220} height={220} aria-hidden />
              )}
              <p className="text-lg font-extrabold" style={{ color: ACCENT }}>Duly registered 📜</p>
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
    <Suspense fallback={<div style={{ minHeight: "100dvh", background: "#111a3d" }} />}>
      <CourtMarriagePageInner />
    </Suspense>
  );
}
