"use client";

import { Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, PenLine, Share2, Loader2, Sparkles } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import StoryStarter from "@/components/story/StoryStarter";
import { GANESH_CAST } from "@/components/story/casts";
import { useGaneshEditor } from "./hooks/useGaneshEditor";
import GaneshTemplate from "./components/GaneshTemplate";
import EditSheet from "./components/EditSheet";
import { GC, PAPER_GRADIENT, BRAND_GRADIENT } from "./components/theme";

import "./components/ganesh.css";

function GaneshPageInner() {
  const e = useGaneshEditor();

  // ── The one button that changes its job ───────────────────────────────────
  //
  // Three booleans drive the whole bar — `isPersonalized`, `shareUrl`,
  // `publishing` — and this is the only place they are read for presentation.
  // Create → Send it → Share, in that order, never two of them at once.
  const topAction = e.showShare
    ? { label: e.shareLabel, onClick: e.handleShare, icon: <Share2 size={14} /> }
    : e.showPublish
      ? {
          label: e.publishing ? "Sending…" : "Send it",
          onClick: e.publish,
          icon: <Sparkles size={14} />,
        }
      : { label: "Create", onClick: e.handleStartCreate, icon: <PenLine size={14} /> };

  const barBtn: React.CSSProperties = {
    background: "rgba(255,253,249,0.88)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    color: GC.ink,
    border: `1px solid ${GC.hairline}`,
    boxShadow: "0 10px 26px -18px rgba(46,33,25,0.5)",
  };

  // On a laptop the builder is a docked rail, so the page and the bar have to
  // move out from under it. `gc-railed` does both in CSS, under the same 1024px
  // breakpoint the rail itself uses — see ganesh.css.
  const railed = e.editMode === "manual" || e.editMode === "choose";

  return (
    <div
      className={`gc-root${railed ? " gc-railed" : ""}`}
      style={{ minHeight: "100dvh", position: "relative", background: PAPER_GRADIENT }}
    >
      {/* ── The bar ───────────────────────────────────────────────────────────
       *
       * `fixed`, because this is a long scrolling page now and a bar that
       * scrolled away would leave the sender with no way back and no way to
       * publish without returning to the top. It is deliberately light and
       * translucent: on a page whose whole design is ivory and air, an opaque
       * bar is a stripe across the top of every screenshot. */}
      {/* Fades the page out under the bar, so nothing scrolling past it reads as
          one of its controls. See `.gc-topbar-scrim` in ganesh.css. */}
      <div className="gc-topbar-scrim" aria-hidden />

      <div className="gc-topbar fixed top-3 left-0 right-0 z-[200] flex items-center justify-between px-3 sm:px-5 lg:px-8">
        <button
          onClick={e.goBack}
          aria-label="Back to templates"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold"
          style={barBtn}
        >
          <ArrowLeft size={15} />
        </button>

        <div className="flex items-center gap-2">
          {e.isPersonalized && !e.showShare && (
            <button
              onClick={e.handleEditFromPreview}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold"
              style={barBtn}
            >
              <PenLine size={14} /> Edit
            </button>
          )}
          <button
            onClick={topAction.onClick}
            disabled={e.publishing}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold disabled:opacity-60"
            style={{
              background: BRAND_GRADIENT,
              color: "#FFFDF9",
              border: "none",
              boxShadow: "0 12px 26px -14px rgba(222,138,44,0.75)",
            }}
          >
            {topAction.icon} {topAction.label}
          </button>
        </div>
      </div>

      {/* The page. Keyed so a save scrolls it back to the top and replays the
          reveals against the sender's own words. */}
      <GaneshTemplate
        key={e.previewVersion}
        data={e.displayData}
        mode="preview"
        // The page renders `DEMO` until the sender has anything of their own — a
        // real photograph, a real wish list, a scannable code. That is the point:
        // you cannot evaluate a template whose every slot is empty. But filled
        // demo content is indistinguishable from a finished page, and somebody
        // has to be told that Rohit and Aditi are not theirs before they tap
        // Create and wonder where their own names went.
        sample={!e.isPersonalized && e.editMode === null}
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

      {/* Shown the first time Create is tapped, and only once the server has a
          schema for this slug — otherwise it renders nothing and the form
          behaves exactly as it would have. Every way out of it lands in the
          EditSheet above, with every field still editable.

          Mounted AFTER EditSheet so the starter sits over the form it seeds. */}
      {e.storyStarter && (
        <StoryStarter
          fill={e.fill}
          onManual={e.openManualForm}
          title="Let's write your page"
          cast={GANESH_CAST}
        />
      )}

      <AnimatePresence>
        {e.publishing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] grid place-items-center"
            style={{ background: "rgba(46,33,25,0.42)", backdropFilter: "blur(4px)" }}
          >
            <div
              className="flex flex-col items-center gap-3 px-8 py-7 rounded-3xl"
              style={{ background: GC.surface, border: `1px solid ${GC.hairline}` }}
            >
              <Loader2 size={28} className="animate-spin" style={{ color: GC.saffron }} />
              {/* One live region, not two: `publishStage` replaces the line
                  rather than appearing under it, so a screen reader announces
                  "Uploading… 1 of 2" instead of both at once. */}
              <p style={{ fontWeight: 600, color: GC.ink }} aria-live="polite">
                {e.publishStage ?? "Sending it…"}
              </p>
              {e.publishStage && (
                <p style={{ fontSize: 12.5, color: GC.muted }}>
                  Your photo is going up now — keep this open.
                </p>
              )}
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

export default function HappyGaneshChaturthiPage() {
  return (
    // `useSearchParams` in the hook needs a Suspense boundary, and the fallback
    // is the paper ground rather than a spinner: the page it stands in for is
    // ivory, and a flash of white between the two is more noticeable than a beat
    // of nothing.
    <Suspense fallback={<div style={{ minHeight: "100dvh", background: "#FBF7F0" }} />}>
      <GaneshPageInner />
    </Suspense>
  );
}
