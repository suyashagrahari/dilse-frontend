"use client";

// ─── /nutrition ──────────────────────────────────────────────────────────────
//
// A thin renderer over `useNutritionEditor`. The page shows the live label
// immediately; a floating bar carries Back on the left and one polymorphic
// button on the right that is Create → Publish → Share. Create opens the AI
// story panel, not the blank form.
//
// The label itself never reflows — it is a fixed 300px block that
// `NutritionTemplate` scales with a CSS transform. Nothing here should try to
// make it responsive; that is the whole design.

import { Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AuthModal from "@/components/AuthModal";
import StoryStarter from "@/components/story/StoryStarter";
import { useNutritionEditor } from "./hooks/useNutritionEditor";
import NutritionTemplate, { NF_INK, NF_MUTED, NF_SANS, NF_SURROUND } from "./components/NutritionTemplate";
import EditSheet from "./components/EditSheet";
import type { Toast } from "./components/demo";

const BORDER = "#D9D5CC";

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

function IconClose() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" aria-hidden="true" focusable="false">
      <path d="m6 6 12 12" /><path d="M18 6 6 18" />
    </svg>
  );
}

function IconCopy() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <rect x="9" y="9" width="11" height="11" rx="2" /><path d="M15 5.5H6A1.5 1.5 0 0 0 4.5 7v9" />
    </svg>
  );
}

/* ── Toasts ───────────────────────────────────────────────────────────────── */

function ToastStack({
  toasts,
  onDismiss,
  onCopy,
}: {
  toasts: Toast[];
  onDismiss: (id: number) => void;
  onCopy: (url?: string) => void;
}) {
  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 z-[400] flex flex-col gap-2 items-center w-[92%] max-w-sm pointer-events-none"
      style={{ top: 62 }}
    >
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="pointer-events-auto w-full flex items-center gap-3"
            style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 12px" }}
          >
            <div className="flex-1 min-w-0">
              <p style={{ margin: 0, fontFamily: NF_SANS, fontSize: 13, fontWeight: 700, color: NF_INK }}>{t.title}</p>
              {t.message ? (
                <p style={{ margin: 0, fontFamily: NF_SANS, fontSize: 11.5, color: NF_MUTED }}>{t.message}</p>
              ) : null}
            </div>
            {t.type === "publish" ? (
              <button
                type="button"
                onClick={() => onCopy(t.shareUrl)}
                aria-label="Copy link"
                style={{ minWidth: 44, minHeight: 44, border: "none", background: "transparent", color: NF_INK, cursor: "pointer" }}
              >
                <IconCopy />
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => onDismiss(t.id)}
              aria-label="Dismiss"
              style={{ minWidth: 44, minHeight: 44, border: "none", background: "transparent", color: NF_MUTED, cursor: "pointer" }}
            >
              <IconClose />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────────── */

const barBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  minHeight: 44,
  height: 44,
  padding: "0 14px",
  borderRadius: 8,
  background: "#FFFFFF",
  border: `1px solid ${BORDER}`,
  color: NF_INK,
  fontFamily: NF_SANS,
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
};

function NutritionPageInner() {
  const e = useNutritionEditor();

  const topAction = e.showShare
    ? { label: e.shareLabel, onClick: e.handleShare, icon: <IconLink /> }
    : e.showPublish
      ? { label: e.publishing ? "Publishing…" : "Publish", onClick: e.publish, icon: <IconLink /> }
      : { label: "Create", onClick: e.handleStartCreate, icon: <IconPen /> };

  return (
    <div style={{ minHeight: "100dvh", background: NF_SURROUND, position: "relative" }}>
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
            background: NF_INK,
            borderColor: NF_INK,
            color: "#FFFFFF",
            opacity: e.publishing ? 0.6 : 1,
          }}
        >
          {topAction.icon} {topAction.label}
        </button>
      </div>

      {/* Keyed so each save/publish re-mounts the label with every row closed —
          the tap-to-reveal notes are the one interaction and they should start
          hidden every time the sender reads their work back. */}
      <NutritionTemplate key={e.previewVersion} data={e.displayData} mode="preview" />

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
      {e.storyStarted ? <StoryStarter fill={e.storyFill} onManual={e.handleStoryManual} /> : null}

      <ToastStack toasts={e.toasts} onDismiss={e.dismissToast} onCopy={e.handleCopy} />

      <AnimatePresence>
        {e.showAuth ? <AuthModal onClose={e.closeAuth} onSuccess={e.closeAuthSuccess} /> : null}
      </AnimatePresence>
    </div>
  );
}

export default function NutritionPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", background: NF_SURROUND }} />}>
      <NutritionPageInner />
    </Suspense>
  );
}
