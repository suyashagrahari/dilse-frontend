"use client";

// ─── /recharge ───────────────────────────────────────────────────────────────
//
// A thin renderer over `useRechargeEditor`. The page shows the live demo flow
// immediately, edge to edge like the real app; a floating EditorDock carries
// Back and one polymorphic button that is Create → Publish → Share. Create opens the AI
// story panel, not the blank form.

import { Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AuthModal from "@/components/AuthModal";
import StoryStarter from "@/components/story/StoryStarter";
import { useRechargeEditor } from "./hooks/useRechargeEditor";
import RechargeTemplate from "./components/RechargeTemplate";
import EditSheet from "./components/EditSheet";
import EditorDock from "../_love/EditorDock";
import { PINK as ACCENT, LINE as BORDER, FONT, INK, BG as SURROUND } from "./components/ui";

/* ── Inline icons. Drawn here, generically; no icon library in this template. ── */

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



/* ── Page ─────────────────────────────────────────────────────────────────── */

function RechargePageInner() {
  const e = useRechargeEditor();

  const topAction = e.showShare
    ? { label: e.shareLabel, onClick: e.handleShare, icon: <IconLink /> }
    : e.showPublish
      ? { label: e.publishing ? "Publishing…" : "Publish", onClick: e.publish, icon: <IconLink /> }
      : { label: "Create", onClick: e.handleStartCreate, icon: <IconPen /> };

  return (
    <div style={{ minHeight: "100dvh", background: SURROUND, position: "relative" }}>
      {/* The live flow. Keyed so each save/publish restarts it at the plan grid. */}
      <RechargeTemplate key={e.previewVersion} data={e.displayData} mode="preview" />

      {/* Floats above the phone pay bar; the app keeps the whole screen. */}
      <EditorDock
        tone="light"
        accent={ACCENT}
        font={FONT}
        avoidBottom=".rc-bar"
        onBack={e.goBack}
        secondary={[
          e.isPersonalized && !e.showShare && { label: "Edit", onClick: e.handleEditFromPreview, icon: <IconPen /> },
        ]}
        primary={{ ...topAction, disabled: e.publishing }}
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
