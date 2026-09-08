"use client";

// ─── /challan ────────────────────────────────────────────────────────────────
//
// A thin renderer over `useChallanEditor`. The page runs the live flow
// immediately — the ugly lookup portal first, because that contrast is what
// makes the notice land — and a floating bar carries Back on the left with one
// polymorphic button on the right that is Create → Publish → Share.
//
// The document scales via a CSS transform inside `ChallanNotice`. Nothing here
// should try to make it responsive; it is a fixed 420px sheet by design.

import { Suspense, useCallback, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import AuthModal from "@/components/AuthModal";
import StoryStarter from "@/components/story/StoryStarter";
import { exportNodeToPng } from "@/lib/exportPng";
import { useChallanEditor } from "./hooks/useChallanEditor";
import { ChallanTemplate } from "./components/ChallanTemplate";
import EditSheet from "./components/EditSheet";
import ShareCard, { SHARE_W, SHARE_H } from "./components/ShareCard";

import { CH } from "./components/theme";

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
  background: "#FFFFFF",
  border: `1px solid ${CH.portalEdge}`,
  color: CH.ink,
  fontFamily: CH.serif,
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
};

function ChallanPageInner() {
  const e = useChallanEditor();
  const shotRef = useRef<HTMLDivElement | null>(null);
  const [savingImage, setSavingImage] = useState(false);

  const attach = useCallback((el: HTMLDivElement | null) => { shotRef.current = el; }, []);

  const saveImage = useCallback(async () => {
    if (savingImage) return;
    setSavingImage(true);
    const result = await exportNodeToPng(shotRef.current, {
      width: SHARE_W,
      height: SHARE_H,
      filename: `challan-${e.content.challanNo.replace(/[^\w]+/g, "-").toLowerCase()}`,
      backgroundColor: CH.paper,
      pixelRatio: 3,
    });
    e.pushToast({ type: result.ok ? "success" : "info", title: result.message });
    setSavingImage(false);
  }, [savingImage, e]);

  const topAction = e.showShare
    ? { label: e.shareLabel, onClick: e.handleShare, icon: <IconLink /> }
    : e.showPublish
      ? { label: e.publishing ? "Publishing…" : "Publish", onClick: e.publish, icon: <IconLink /> }
      : { label: "Create", onClick: e.handleStartCreate, icon: <IconPen /> };

  return (
    <div style={{ minHeight: "100dvh", background: CH.portalBg, position: "relative" }}>
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
        {e.showShare ? (
          <button type="button" onClick={saveImage} disabled={savingImage} style={{ ...barBtn, opacity: savingImage ? 0.6 : 1 }}>
            {savingImage ? "Saving…" : "Image"}
          </button>
        ) : null}
        <button
          type="button"
          onClick={topAction.onClick}
          disabled={e.publishing}
          style={{
            ...barBtn,
            background: CH.ink,
            borderColor: CH.ink,
            color: CH.paper,
            opacity: e.publishing ? 0.6 : 1,
          }}
        >
          {topAction.icon} {topAction.label}
        </button>
      </div>

      {/* Keyed so each save/publish restarts the flow at the lookup portal —
          the sender should see what the recipient sees, from the top. */}
      <ChallanTemplate key={e.previewVersion} data={e.displayData} />

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

      {/* Offscreen, at true size. Never the on-screen node scaled up. */}
      <ShareCard data={e.content} paid={false} attach={attach} />

      <AnimatePresence>
        {e.showAuth ? <AuthModal onClose={e.closeAuth} onSuccess={e.closeAuthSuccess} /> : null}
      </AnimatePresence>
    </div>
  );
}

export default function ChallanPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", background: CH.portalBg }} />}>
      <ChallanPageInner />
    </Suspense>
  );
}
