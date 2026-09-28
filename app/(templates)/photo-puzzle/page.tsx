"use client";

import { Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, PenLine, Send, Share2, Loader2 } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import { usePhotoPuzzleEditor } from "./hooks/usePhotoPuzzleEditor";
import PhotoPuzzleTemplate from "./components/PhotoPuzzleTemplate";
import EditSheet from "./components/EditSheet";
import StoryStarter from "@/components/story/StoryStarter";

import { PUZZLE_THEMES } from "./components/themes";
import { pickTheme } from "../_love/theme";

/** Frosted glass over whichever theme is showing. */
const CHROME = "rgba(255,255,255,.88)";
const CHROME_BORDER = "1px solid rgba(0,0,0,.08)";

function PhotoPuzzlePageInner() {
  const e = usePhotoPuzzleEditor();
  const accent = pickTheme(PUZZLE_THEMES, e.displayData.theme).colors;
  const INK = "#2b1a24";
  const GRAD = `linear-gradient(115deg, ${accent.a1}, ${accent.a2})`;

  // One button, three lives: Create → Publish → Share.
  const topAction = e.showShare
    ? { label: e.shareLabel, onClick: e.handleShare, icon: <Share2 size={14} /> }
    : e.showPublish
      ? { label: e.publishing ? "Publishing…" : "Publish", onClick: e.publish, icon: <Send size={14} /> }
      : { label: "Create", onClick: e.handleEditClick, icon: <PenLine size={14} /> };

  return (
    <div style={{ minHeight: "100dvh", position: "relative" }}>
      {/* Floating top bar */}
      <div
        className="fixed top-3 left-0 right-0 z-[120] px-3 flex items-center gap-2"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <button
          onClick={e.goBack}
          className="inline-flex items-center gap-1.5 px-3 rounded-full text-sm font-semibold shadow-sm"
          style={{ minHeight: 44, background: CHROME, color: INK, border: CHROME_BORDER, backdropFilter: "blur(8px)" }}
        >
          <ArrowLeft size={15} /> Back
        </button>
        {/* Edit sits by Back (icon-only on phones) so the centred theme dock never covers it. */}
        {e.isPersonalized && !e.showShare && (
          <button
            onClick={e.handleEditFromPreview}
            aria-label="Edit"
            className="inline-flex items-center justify-center gap-1.5 px-3 min-w-[44px] rounded-full text-sm font-semibold shadow-sm"
            style={{ minHeight: 44, background: CHROME, color: INK, border: CHROME_BORDER, backdropFilter: "blur(8px)" }}
          >
            <PenLine size={14} /> <span className="hidden min-[520px]:inline">Edit</span>
          </button>
        )}
        <div className="flex-1" />
        <button
          onClick={topAction.onClick}
          disabled={e.publishing}
          className="inline-flex items-center gap-1.5 px-4 rounded-full text-sm font-bold text-white shadow-md disabled:opacity-60"
          style={{ minHeight: 44, background: GRAD }}
        >
          {topAction.icon} {topAction.label}
        </button>
      </div>

      {/* Live demo preview. Keyed so every save recuts the puzzle with the new
          grid and photo and starts from an empty board. */}
      <PhotoPuzzleTemplate key={e.previewVersion} data={e.displayData} mode="demo" onThemeChange={e.shareUrl ? undefined : e.setTheme} />

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
        <StoryStarter fill={e.fill} onManual={e.openManualForm} title="Let's write the letter" />
      )}

      <AnimatePresence>
        {e.publishing && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] grid place-items-center"
            style={{ background: "rgba(34,30,58,.55)", backdropFilter: "blur(6px)" }}
          >
            <div className="flex flex-col items-center gap-3 px-8 py-6 rounded-3xl" style={{ background: "#fff" }}>
              <Loader2 size={28} className="animate-spin" style={{ color: accent.a1 }} />
              <p className="font-semibold" style={{ color: INK }}>Boxing up the pieces…</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth is deferred, not gating: onClose cancels the pending publish,
          onSuccess just closes and the hook's effect resumes it. */}
      <AnimatePresence>
        {e.showAuth && <AuthModal onClose={e.closeAuth} onSuccess={e.closeAuthSuccess} />}
      </AnimatePresence>
    </div>
  );
}

export default function PhotoPuzzlePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", background: "#f6e4cb" }} />}>
      <PhotoPuzzlePageInner />
    </Suspense>
  );
}
