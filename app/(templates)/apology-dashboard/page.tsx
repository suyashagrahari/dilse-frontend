"use client";

import { Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, PenLine, Heart, Share2, Loader2 } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import PremiumUpgradeModal from "@/components/upgrade/PremiumUpgradeModal";
import StoryStarter from "@/components/story/StoryStarter";
import { useApologyEditor } from "./hooks/useApologyEditor";
import ApologyDashboard from "./components/ApologyDashboard";
import EditSheet from "./components/EditSheet";

const ROSE_GRADIENT = "linear-gradient(135deg,#ff7aa8,#e64072)";

function ApologyPageInner() {
  const e = useApologyEditor();

  const topAction = e.showShare
    ? { label: "Share", onClick: e.handleShare, icon: <Share2 size={14} /> }
    : e.showPublish
      ? { label: e.publishing ? "Publishing…" : "Publish", onClick: e.publish, icon: <Heart size={14} fill="#fff" /> }
      : { label: "Create", onClick: e.handleEditClick, icon: <PenLine size={14} /> };

  return (
    <div style={{ minHeight: "100dvh", position: "relative" }}>
      {/* Floating top bar */}
      <div className="fixed top-3 left-0 right-0 z-[120] px-3 flex items-center gap-2" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
        <button onClick={e.goBack} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold shadow-sm" style={{ background: "rgba(255,255,255,.9)", color: "#e64072", border: "1px solid #ffd6e2", backdropFilter: "blur(8px)" }}>
          <ArrowLeft size={15} /> Back
        </button>
        <div className="flex-1" />
        {e.isPersonalized && !e.showShare && (
          <button onClick={e.handleEditFromPreview} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold shadow-sm" style={{ background: "rgba(255,255,255,.9)", color: "#e64072", border: "1px solid #ffd6e2", backdropFilter: "blur(8px)" }}>
            <PenLine size={14} /> Edit
          </button>
        )}
        <button onClick={topAction.onClick} disabled={e.publishing} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold text-white shadow-md disabled:opacity-60" style={{ background: ROSE_GRADIENT }}>
          {topAction.icon} {topAction.label}
        </button>
      </div>

      {/* Live preview — keyed so each save/publish restarts the experience fresh
          (scratch re-covered, whack + anger reset, newly-selected song playing). */}
      <ApologyDashboard key={e.previewVersion} data={e.displayData} mode="preview" />

      {/* Edit sheet */}
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

      {/* Rendered only once "Create" has opened the form on a page nobody has
          personalised yet, so it greets the sender instead of the landing page.
          It sits over the sheet, offering to write the whole thing first; both
          "I'll fill it in myself" and the report screen drop straight back into
          the sheet below, populated and entirely editable. With no schema for
          this slug it renders nothing and the editor is unchanged. */}
      {e.editMode === "manual" && !e.isPersonalized && (
        <StoryStarter fill={e.fill} onManual={() => e.setEditMode("manual")} title="Let's write your apology" />
      )}

      {/* Publishing overlay */}
      <AnimatePresence>
        {e.publishing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] grid place-items-center" style={{ background: "rgba(136,19,55,.5)", backdropFilter: "blur(6px)" }}>
            <div className="flex flex-col items-center gap-3 px-8 py-6 rounded-3xl" style={{ background: "#fff" }}>
              <Loader2 size={28} className="animate-spin" style={{ color: "#e64072" }} />
              <p className="font-semibold" style={{ color: "#e64072" }}>Publishing your apology…</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {e.showAuth && <AuthModal onClose={e.closeAuth} onSuccess={e.closeAuthSuccess} />}
      </AnimatePresence>

      {/* "See it in Premium, free" — opened by Publish before the free publish runs. */}
      <AnimatePresence>{e.upgrade && <PremiumUpgradeModal {...e.upgrade} />}</AnimatePresence>
    </div>
  );
}

export default function ApologyDashboardPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", background: "#FFF5F5" }} />}>
      <ApologyPageInner />
    </Suspense>
  );
}
