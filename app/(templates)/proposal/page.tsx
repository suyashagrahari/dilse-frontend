"use client";

import { Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, PenLine, Share2, Loader2, Sparkles } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import PremiumUpgradeModal from "@/components/upgrade/PremiumUpgradeModal";
import StoryStarter from "@/components/story/StoryStarter";
import { useProposalEditor } from "./hooks/useProposalEditor";
import ProposalTemplate from "./components/ProposalTemplate";
import EditSheet from "./components/EditSheet";

const INK = "#4A3547";
const SURFACE = "#FFFBF7";
const LINE = "#F3E3EC";
const PINK = "#F2789F";
const PINK_GRADIENT = "linear-gradient(135deg,#FFA0BF,#F2789F)";
const HEAD = "var(--font-fredoka), ui-rounded, ui-sans-serif, system-ui, sans-serif";

const pill: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "9px 14px",
  borderRadius: 999,
  background: "rgba(255,255,255,.88)",
  color: INK,
  border: `1px solid ${LINE}`,
  backdropFilter: "blur(14px)",
  fontFamily: HEAD,
  fontSize: 13.5,
  fontWeight: 600,
  boxShadow: "0 8px 24px rgba(74,53,71,.08)",
  cursor: "pointer",
  minHeight: 42,
};

function ProposalPageInner() {
  const e = useProposalEditor();

  /**
   * Fixed, above everything, and gone only while the FORM is open.
   *
   * ── THE BUG THIS FIXES ────────────────────────────────────────────────────
   *
   * The guard used to be `editMode ? hidden : visible`, and `editMode` has
   * three values, not two: `null`, `"manual"` (the form is up) and `"preview"`
   * (the form has been filled in and put away). Saving the form sets
   * `"preview"` — and so does restoring a draft from localStorage on load, and
   * so does opening `?edit=<id>`. So the moment somebody filled the form in
   * once, Back and Create vanished, on that visit and on every visit
   * afterwards, because the draft came back as "preview" before first paint.
   *
   * Which is exactly the report: no Create option and no Back in the preview.
   * A clean browser profile never reproduced it, because a clean profile has no
   * draft and lands on `editMode === null`.
   *
   * The thing being avoided is the sheet, so the condition is the sheet —
   * `"manual"`, the same test EditSheet itself uses to decide it is visible.
   */
  const formOpen = e.editMode === "manual";
  const chrome: React.CSSProperties = {
    position: "fixed",
    top: "calc(env(safe-area-inset-top, 0px) + 10px)",
    zIndex: 120,
    opacity: formOpen ? 0 : 1,
    pointerEvents: formOpen ? "none" : "auto",
    visibility: formOpen ? "hidden" : "visible",
    transition: "opacity .18s ease",
  };

  const topAction = e.showShare
    ? { label: e.shareLabel, onClick: e.handleShare, icon: <Share2 size={14} /> }
    : e.showPublish
      ? { label: e.publishing ? "Publishing…" : "Publish", onClick: e.publish, icon: <Sparkles size={14} /> }
      : { label: "Create", onClick: e.handleEditClick, icon: <PenLine size={14} /> };

  return (
    <div style={{ minHeight: "100dvh", position: "relative" }}>
      {/*
        ── THE BUILDER'S CHROME ───────────────────────────────────────────────

        Two separately positioned controls, not one full-width bar.

        The bar was reported as missing on this template: "i am not able to see
        create option in preview and also back option". A full-width
        `position: fixed` strip pinned to the top of the page is precisely the
        shape that content blockers' annoyance filters hunt for — it is what a
        cookie nag, a newsletter gate and a sticky promo header all look like to
        a cosmetic rule — and it is also a single element whose failure takes
        both controls with it. Two corner controls fail independently and match
        nothing.

        Everything load-bearing here is an inline style rather than a utility
        class, for the same reason: a class is a dependency on a stylesheet that
        has to have been generated, shipped and not filtered. `position`,
        `z-index` and `top` are the three properties that decide whether this is
        on the screen at all, so they are stated where nothing can drop them.

        Both are hidden while the EditSheet is open: they sit above it, so they
        would otherwise paint over the first field, and an overlapping "Back"
        mid-edit is a tap-target hazard.
      */}
      <button
        onClick={e.goBack}
        aria-label="Leave this template"
        style={{ ...pill, ...chrome, left: 12 }}
      >
        <ArrowLeft size={15} /> Back
      </button>

      <div
        style={{
          ...chrome,
          right: 12,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {e.isPersonalized && !e.showShare && (
          <button onClick={e.handleEditFromPreview} style={pill}>
            <PenLine size={14} /> Edit
          </button>
        )}
        <button
          onClick={topAction.onClick}
          disabled={e.publishing}
          style={{
            ...pill,
            padding: "11px 20px",
            fontSize: 14.5,
            background: PINK_GRADIENT,
            color: "#FFF",
            border: "none",
            fontWeight: 700,
            boxShadow: "0 10px 26px rgba(242,120,159,.5)",
            opacity: e.publishing ? 0.6 : 1,
            minHeight: 46,
          }}
        >
          {topAction.icon} {topAction.label}
        </button>
      </div>

      {/* Live preview — keyed so each save replays from the audio gate. */}
      <ProposalTemplate key={e.previewVersion} data={e.displayData} mode="preview" />

      <EditSheet
        editMode={e.editMode}
        setEditMode={e.setEditMode}
        mf={e.mf}
        updateMf={e.updateMf}
        updateMemory={e.updateMemory}
        addMemory={e.addMemory}
        removeMemory={e.removeMemory}
        moveMemory={e.moveMemory}
        pagePassword={e.pagePassword}
        setPagePassword={e.setPagePassword}
        errors={e.errors}
        showErrors={e.showErrors}
        memoryBytes={e.memoryBytes}
        onSave={e.handleSave}
        saving={e.saving}
      />

      {/* Shown the first time Create is tapped, and only when the server has a
          schema for this template. Every way out of it lands in the EditSheet
          above, populated and fully editable. */}
      {e.storyStarter && (
        <StoryStarter fill={e.fill} onManual={e.openManualForm} title="Let's write the proposal" />
      )}

      {/* Publishing overlay */}
      <AnimatePresence>
        {e.publishing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] grid place-items-center"
            style={{ background: "rgba(74,53,71,.5)", backdropFilter: "blur(6px)" }}
          >
            <div
              className="flex flex-col items-center gap-3"
              style={{ background: SURFACE, padding: "26px 32px", borderRadius: 28 }}
            >
              <Loader2 size={28} className="animate-spin" style={{ color: PINK }} />
              <p style={{ fontFamily: HEAD, fontSize: 14.5, fontWeight: 700, color: INK, margin: 0 }}>
                Wrapping up your proposal…
              </p>
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

export default function ProposalPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", background: SURFACE }} />}>
      <ProposalPageInner />
    </Suspense>
  );
}
