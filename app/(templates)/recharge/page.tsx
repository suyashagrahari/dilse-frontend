"use client";

// ─── /recharge ───────────────────────────────────────────────────────────────
//
// A thin renderer over `useRechargeEditor`. The page shows the live demo flow
// immediately; a floating bar carries Back on the left and one polymorphic
// button on the right that is Create → Publish → Share. Create opens the AI
// story panel, not the blank form.

import { Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AuthModal from "@/components/AuthModal";
import StoryStarter from "@/components/story/StoryStarter";
import { useRechargeEditor } from "./hooks/useRechargeEditor";
import RechargeTemplate from "./components/RechargeTemplate";
import EditSheet from "./components/EditSheet";
import { PINK as ACCENT, LINE as BORDER, FONT, INK, BG as SURROUND } from "./components/ui";

/* ── Inline icons. Drawn here, generically; no icon library in this template. ── */

function IconBack() {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M19 12H5" /><path d="m11 6-6 6 6 6" />
    </svg>
  );
}

function IconPen() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M4 20h4.5L20 8.5a2.1 2.1 0 0 0-3-3L5.5 17V20Z" /><path d="M14.5 6.5 17.5 9.5" />
    </svg>
  );
}

function IconLink() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M10 13.5a4 4 0 0 0 5.7 0l2.8-2.8a4 4 0 0 0-5.7-5.7l-1.4 1.4" />
      <path d="M14 10.5a4 4 0 0 0-5.7 0l-2.8 2.8a4 4 0 0 0 5.7 5.7l1.4-1.4" />
    </svg>
  );
}



/* ── Toasts ───────────────────────────────────────────────────────────────── */

/* ── Page ─────────────────────────────────────────────────────────────────── */

const barBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  minHeight: 44,
  height: 44,
  padding: "0 14px",
  borderRadius: 12,
  background: "rgba(255,255,255,.96)",
  boxShadow: "0 6px 18px -12px rgba(0,0,0,.35)",
  border: `1px solid ${BORDER}`,
  color: INK,
  fontFamily: FONT,
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};

function RechargePageInner() {
  const e = useRechargeEditor();

  const topAction = e.showShare
    ? { label: e.shareLabel, onClick: e.handleShare, icon: <IconLink /> }
    : e.showPublish
      ? { label: e.publishing ? "Publishing…" : "Publish", onClick: e.publish, icon: <IconLink /> }
      : { label: "Create", onClick: e.handleStartCreate, icon: <IconPen /> };

  return (
    <div style={{ minHeight: "100dvh", background: SURROUND, position: "relative" }}>
      <div
        className="fixed top-0 left-0 right-0 z-[120] flex items-center gap-2 px-3"
        style={{ paddingTop: "calc(8px + env(safe-area-inset-top, 0px))", paddingBottom: 8 }}
      >
        <button type="button" onClick={e.goBack} style={barBtn}>
          <IconBack /> Back
        </button>
        <div className="flex-1" />
        {e.isPersonalized && !e.showShare ? (
          <button type="button" onClick={e.handleEditFromPreview} style={barBtn}>
            <IconPen /> Edit
          </button>
        ) : null}
        <button
          type="button"
          onClick={topAction.onClick}
          disabled={e.publishing}
          style={{
            ...barBtn,
            background: ACCENT,
            borderColor: ACCENT,
            color: "#FFFFFF",
            opacity: e.publishing ? 0.6 : 1,
          }}
        >
          {topAction.icon} {topAction.label}
        </button>
      </div>

      {/* The live flow. Keyed so each save/publish restarts it at the plan grid. */}
      <RechargeTemplate key={e.previewVersion} data={e.displayData} mode="preview" />

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

      {/* Mounted after EditSheet so the panel sits over the form it seeds. */}
      {e.storyStarted ? <StoryStarter guided fill={e.storyFill} onManual={e.handleStoryManual} /> : null}

      <AnimatePresence>
        {e.publishing ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] grid place-items-center"
            style={{ background: "rgba(26,32,38,0.45)" }}
          >
            <div
              style={{
                background: "#FFFFFF",
                border: `1px solid ${BORDER}`,
                borderRadius: 12,
                padding: "20px 26px",
                fontFamily: FONT,
                fontSize: 14,
                fontWeight: 600,
                color: INK,
              }}
              aria-live="polite"
            >
              Do not press back or refresh
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>


      <AnimatePresence>
        {e.showAuth ? <AuthModal onClose={e.closeAuth} onSuccess={e.closeAuthSuccess} /> : null}
      </AnimatePresence>
    </div>
  );
}

export default function RechargePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", background: SURROUND }} />}>
      <RechargePageInner />
    </Suspense>
  );
}
