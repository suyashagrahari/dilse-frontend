"use client";

import { Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, PenLine, Send, Share2, Loader2 } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import StoryStarter from "@/components/story/StoryStarter";
import { useRewindEditor } from "./hooks/useRewindEditor";
import RewindTemplate from "./components/RewindTemplate";
import EditSheet from "./components/EditSheet";

const FUCHSIA = "#A21CAF";
const FUCHSIA_GRAD = "linear-gradient(135deg,#D946EF,#4F46E5)";
const CHROME = "rgba(255,255,255,.92)";
const CHROME_BORDER = "1px solid #EBD5F2";

function RewindPageInner() {
  const e = useRewindEditor();

  // One button, three lives: Create → Publish → Share.
  const topAction = e.showShare
    ? { label: e.shareLabel, onClick: e.handleShare, icon: <Share2 size={14} /> }
    : e.showPublish
      ? { label: e.publishing ? "Publishing…" : "Publish", onClick: e.publish, icon: <Send size={14} /> }
      : { label: "Create", onClick: e.handleStartCreate, icon: <PenLine size={14} /> };

  // The story underneath owns the whole viewport for tap-to-advance. Chrome taps
  // must reach the button and stop dead there — otherwise every Back press also
  // skips a slide. The bar itself is pointer-transparent so the gaps between the
  // buttons still advance the story, which is what you want on a phone.
  const swallow = {
    onPointerDown: (ev: React.PointerEvent) => ev.stopPropagation(),
    onPointerUp: (ev: React.PointerEvent) => ev.stopPropagation(),
    onClick: (ev: React.MouseEvent) => ev.stopPropagation(),
    style: { pointerEvents: "auto" as const, touchAction: "manipulation" as const },
  };

  return (
    <div style={{ minHeight: "100dvh", position: "relative" }}>
      {/* Floating top bar — above the story's full-viewport tap surface. */}
      <div
        className="fixed top-3 left-0 right-0 z-[120] px-3 flex items-center gap-2"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)", pointerEvents: "none" }}
      >
        <button
          {...swallow}
          onClick={(ev) => { ev.stopPropagation(); e.goBack(); }}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold shadow-sm min-h-[44px]"
          style={{ ...swallow.style, background: CHROME, color: FUCHSIA, border: CHROME_BORDER, backdropFilter: "blur(8px)" }}
        >
          <ArrowLeft size={15} /> Back
        </button>
        <div className="flex-1" />
        {e.isPersonalized && !e.showShare && (
          <button
            {...swallow}
            onClick={(ev) => { ev.stopPropagation(); e.handleEditFromPreview(); }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold shadow-sm min-h-[44px]"
            style={{ ...swallow.style, background: CHROME, color: FUCHSIA, border: CHROME_BORDER, backdropFilter: "blur(8px)" }}
          >
            <PenLine size={14} /> Edit
          </button>
        )}
        <button
          {...swallow}
          onClick={(ev) => { ev.stopPropagation(); topAction.onClick(); }}
          disabled={e.publishing}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold text-white shadow-md disabled:opacity-60 min-h-[44px]"
          style={{ ...swallow.style, background: FUCHSIA_GRAD }}
        >
          {topAction.icon} {topAction.label}
        </button>
      </div>

      {/* Live demo preview. Keyed so every save/publish replays the story from
          the cold open with the freshly-written year. */}
      <RewindTemplate key={e.previewVersion} data={e.displayData} mode="demo" />

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

      {/* Sits over the sheet above, so the first thing a sender sees after
          Create is the offer to have it written — with the form they get
          today one tap behind it. Renders nothing without a schema. */}
      {e.storyStarted && <StoryStarter fill={e.storyFill} onManual={e.handleStoryManual} />}

      <AnimatePresence>
        {e.publishing && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] grid place-items-center"
            style={{ background: "rgba(30,12,40,.55)", backdropFilter: "blur(6px)" }}
          >
            <div className="flex flex-col items-center gap-3 px-8 py-6 rounded-3xl" style={{ background: "#fff" }}>
              <Loader2 size={28} className="animate-spin" style={{ color: FUCHSIA }} />
              <p className="font-semibold" style={{ color: FUCHSIA }}>Running the numbers…</p>
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

export default function RewindPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", background: "#0E0E12" }} />}>
      <RewindPageInner />
    </Suspense>
  );
}
