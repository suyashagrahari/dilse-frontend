// ─── /streak ─────────────────────────────────────────────────────────────────
//
// The gallery/editor route. Same three-lives top bar every template in this
// repo uses: Create → Publish → Share, with auth deferred rather than gating.
//
// The chrome is deliberately quieter than Rewind's. This is not a story you
// watch once; it is a thing someone is deciding to open every day, and a
// gradient button shouting at them on the way in sets the wrong expectation.

"use client";

import { Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, PenLine, Send, Share2, Loader2 } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import StoryStarter from "@/components/story/StoryStarter";
import { useStreakEditor } from "./hooks/useStreakEditor";
import StreakTemplate from "./components/StreakTemplate";
import EditSheet from "./components/EditSheet";
import { PALETTE, SERIF, UI } from "./components/types";

const CHROME = "rgba(250,247,240,0.92)";
const CHROME_BORDER = `1px solid ${PALETTE.edge}`;

function StreakPageInner() {
  const e = useStreakEditor();

  const topAction = e.showShare
    ? { label: e.shareLabel, onClick: e.handleShare, icon: <Share2 size={14} /> }
    : e.showPublish
      ? { label: e.publishing ? "Publishing…" : "Publish", onClick: e.publish, icon: <Send size={14} /> }
      : { label: "Create", onClick: e.handleStartCreate, icon: <PenLine size={14} /> };

  return (
    <div style={{ minHeight: "100dvh", position: "relative", background: PALETTE.paper }}>
      <div
        className="fixed top-3 left-0 right-0 z-[120] px-3 flex items-center gap-2"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)", pointerEvents: "none" }}
      >
        <button
          onClick={e.goBack}
          className="inline-flex items-center gap-1.5 px-3 rounded-full"
          style={{
            pointerEvents: "auto",
            minHeight: 44,
            fontFamily: UI,
            fontSize: 13.5,
            background: CHROME,
            color: PALETTE.inkSoft,
            border: CHROME_BORDER,
            backdropFilter: "blur(8px)",
          }}
        >
          <ArrowLeft size={15} /> Back
        </button>
        <div className="flex-1" />
        {e.isPersonalized && !e.showShare && (
          <button
            onClick={e.handleEditFromPreview}
            className="inline-flex items-center gap-1.5 px-3.5 rounded-full"
            style={{
              pointerEvents: "auto",
              minHeight: 44,
              fontFamily: UI,
              fontSize: 13.5,
              background: CHROME,
              color: PALETTE.inkSoft,
              border: CHROME_BORDER,
              backdropFilter: "blur(8px)",
            }}
          >
            <PenLine size={14} /> Edit
          </button>
        )}
        <button
          onClick={topAction.onClick}
          disabled={e.publishing}
          className="inline-flex items-center gap-1.5 px-4 rounded-full disabled:opacity-60"
          style={{
            pointerEvents: "auto",
            minHeight: 44,
            fontFamily: UI,
            fontSize: 13.5,
            background: PALETTE.ink,
            color: PALETTE.paper,
            border: "none",
          }}
        >
          {topAction.icon} {topAction.label}
        </button>
      </div>

      {/* Keyed so a Save re-seats the session on the freshly-written pair. */}
      <StreakTemplate
        key={e.previewVersion}
        data={e.displayData}
        mode="demo"
        shareUrl={e.shareUrl}
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
        restoredDraft={e.restoredDraft}
      />

      {/* Sits over the sheet above, so the first thing a sender sees after
          Create is the offer to have it written — with the form they get
          today one tap behind it. Renders nothing without a schema, and adds
          no storage of any kind. */}
      {e.storyStarted && <StoryStarter fill={e.storyFill} onManual={e.handleStoryManual} />}

      <AnimatePresence>
        {e.publishing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] grid place-items-center"
            style={{ background: "rgba(43,38,32,0.42)", backdropFilter: "blur(5px)" }}
          >
            <div
              className="flex flex-col items-center gap-3 px-8 py-6 rounded-3xl"
              style={{ background: PALETTE.paper }}
            >
              <Loader2 size={26} className="animate-spin" style={{ color: PALETTE.accent }} />
              <p style={{ fontFamily: SERIF, fontSize: 16, color: PALETTE.ink }}>Lighting it up…</p>
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

export default function StreakPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", background: PALETTE.paper }} />}>
      <StreakPageInner />
    </Suspense>
  );
}
