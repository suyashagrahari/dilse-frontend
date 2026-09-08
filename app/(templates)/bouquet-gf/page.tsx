"use client";

import { Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, PenLine, Share2, Loader2, Sparkles } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import StoryStarter from "@/components/story/StoryStarter";
import { useBouquetEditor } from "./hooks/useBouquetEditor";
import BouquetTemplate from "./components/BouquetTemplate";
import EditSheet from "./components/EditSheet";
import { LIGHT, BQ, BRAND_GRADIENT } from "./components/theme";

function BouquetPageInner() {
  const e = useBouquetEditor();

  const topAction = e.showShare
    ? { label: "Share", onClick: e.handleShare, icon: <Share2 size={14} /> }
    : e.showPublish
      ? { label: e.publishing ? "Sending…" : "Send it", onClick: e.publish, icon: <Sparkles size={14} /> }
      : { label: "Create", onClick: e.handleStartCreate, icon: <PenLine size={14} /> };

  const barBtn: React.CSSProperties = { background: LIGHT.surface, color: LIGHT.ink, border: `2px solid ${LIGHT.ink}`, boxShadow: "2px 3px 0 rgba(43,36,64,0.14)" };

  return (
    <div style={{ minHeight: "100dvh", position: "relative" }}>
      <div className="fixed top-3 left-0 right-0 z-[120] px-3 flex items-center gap-2" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
        <button onClick={e.goBack} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-bold" style={barBtn}>
          <ArrowLeft size={15} /> Back
        </button>
        <div className="flex-1" />
        {e.isPersonalized && !e.showShare && (
          <button onClick={e.handleEditFromPreview} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-bold" style={barBtn}>
            <PenLine size={14} /> Edit
          </button>
        )}
        <button onClick={topAction.onClick} disabled={e.publishing} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold disabled:opacity-60" style={{ background: BRAND_GRADIENT, color: LIGHT.ink, border: `2px solid ${LIGHT.ink}`, boxShadow: "3px 4px 0 rgba(43,36,64,0.16)" }}>
          {topAction.icon} {topAction.label}
        </button>
      </div>

      {/* Live preview — keyed so each save/publish restarts fresh (bouquet re-wraps) */}
      <BouquetTemplate key={e.previewVersion} data={e.displayData} mode="preview" />

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

      {/* Mounted after EditSheet so the sheet sits over the form it seeds. */}
      {e.storyStarted && (
        <StoryStarter fill={e.storyFill} onManual={e.handleStoryManual} />
      )}

      <AnimatePresence>
        {e.publishing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] grid place-items-center" style={{ background: "rgba(43,36,64,0.5)", backdropFilter: "blur(4px)" }}>
            <div className="flex flex-col items-center gap-3 px-8 py-6 rounded-3xl" style={{ background: LIGHT.surface, border: `2px solid ${LIGHT.ink}` }}>
              <Loader2 size={30} className="animate-spin" style={{ color: BQ.bubblegumDeep }} />
              <p className="font-bold" style={{ color: LIGHT.ink }} aria-live="polite">Tying your bouquet…</p>
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

export default function BouquetGfPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", background: "#fdf6ee" }} />}>
      <BouquetPageInner />
    </Suspense>
  );
}
