"use client";

// ─── /profile-pro ────────────────────────────────────────────────────────────
//
// A thin renderer over `useProfileEditor`. The page shows the live profile
// immediately; a floating bar carries Back on the left and one polymorphic
// button on the right that is Create → Publish → Share. Create opens the AI
// story panel, not the blank form.
//
// TWO LINKS, TWO PURPOSES. Once published, the bar also offers the nudge, which
// shares the ENDORSE link — a different secret from the share link. The share
// link is the read capability for the person the page is about; the endorse link
// is the write capability for the group chat. Sending the wrong one hands the
// recipient's gift to everybody being asked to endorse it.

import { Suspense, useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AuthModal from "@/components/AuthModal";
import StoryStarter from "@/components/story/StoryStarter";
import { exportNodeToPng } from "@/lib/exportPng";
import { useProfileEditor, type Toast } from "./hooks/useProfileEditor";
import { ProfileTemplate } from "./components/ProfileTemplate";
import EditSheet from "./components/EditSheet";
import ShareCard, { SHARE_W, SHARE_H } from "./components/ShareCard";
import { PP } from "./components/theme";

/** The column this genre reads best in. Wider and the cards stop looking like cards. */
const COLUMN = 700;

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
      className="fixed left-1/2 -translate-x-1/2 z-[400] flex flex-col gap-2 items-center pointer-events-none"
      style={{ top: 62, width: "92%", maxWidth: COLUMN - 32 }}
    >
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="pointer-events-auto w-full flex items-center gap-3"
            style={{ background: PP.card, border: `1px solid ${PP.edge}`, borderRadius: 10, padding: "10px 12px" }}
          >
            <div className="flex-1 min-w-0">
              <p style={{ margin: 0, fontFamily: PP.font, fontSize: 13, fontWeight: 600, color: PP.ink }}>{t.title}</p>
              {t.message ? (
                <p style={{ margin: 0, fontFamily: PP.font, fontSize: 11.5, color: PP.inkSoft }}>{t.message}</p>
              ) : null}
            </div>
            {t.type === "publish" ? (
              <button
                type="button"
                onClick={() => onCopy(t.shareUrl)}
                aria-label="Copy link"
                style={{ minWidth: 44, minHeight: 44, border: "none", background: "transparent", color: PP.accent, cursor: "pointer" }}
              >
                <IconCopy />
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => onDismiss(t.id)}
              aria-label="Dismiss"
              style={{ minWidth: 44, minHeight: 44, border: "none", background: "transparent", color: PP.inkSoft, cursor: "pointer" }}
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
  background: PP.card,
  border: `1px solid ${PP.edge}`,
  color: PP.ink,
  fontFamily: PP.font,
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};

function ProfileProPageInner() {
  const e = useProfileEditor();
  const shotRef = useRef<HTMLDivElement | null>(null);
  const [saving, setSaving] = useState(false);

  const attach = useCallback((el: HTMLDivElement | null) => { shotRef.current = el; }, []);

  const saveImage = useCallback(async () => {
    if (saving) return;
    setSaving(true);
    const result = await exportNodeToPng(shotRef.current, {
      width: SHARE_W,
      height: SHARE_H,
      filename: `${(e.content.person.name || "endorsements").toLowerCase().replace(/\s+/g, "-")}-endorsements`,
      backgroundColor: PP.page,
      pixelRatio: 3,
    });
    e.pushToast({ type: result.ok ? "success" : "info", title: result.message });
    setSaving(false);
  }, [saving, e]);

  const topAction = e.showShare
    ? { label: e.shareLabel, onClick: e.handleShare, icon: <IconLink /> }
    : e.showPublish
      ? { label: e.publishing ? "Publishing…" : "Publish", onClick: e.publish, icon: <IconLink /> }
      : { label: "Create", onClick: e.handleStartCreate, icon: <IconPen /> };

  return (
    <div style={{ minHeight: "100dvh", background: PP.page, position: "relative" }}>
      <div
        className="fixed top-0 left-0 right-0 z-[120] flex items-center gap-2 px-3"
        style={{
          paddingTop: "calc(8px + env(safe-area-inset-top, 0px))",
          paddingBottom: 8,
          maxWidth: COLUMN,
          marginLeft: "auto",
          marginRight: "auto",
        }}
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
          <button type="button" onClick={saveImage} disabled={saving} style={{ ...barBtn, opacity: saving ? 0.6 : 1 }}>
            {saving ? "Saving…" : "Image"}
          </button>
        ) : null}
        <button
          type="button"
          onClick={topAction.onClick}
          disabled={e.publishing}
          style={{
            ...barBtn,
            background: PP.accent,
            borderColor: PP.accent,
            color: PP.accentInk,
            opacity: e.publishing ? 0.6 : 1,
          }}
        >
          {topAction.icon} {topAction.label}
        </button>
      </div>

      {/* The nudge. Only once there is a write link to hand out, and it shares the
          ENDORSE link — never the share link. See the header note. */}
      {e.endorseUrl ? (
        <div style={{ maxWidth: COLUMN, margin: "0 auto", padding: "64px 12px 0" }}>
          <button
            type="button"
            onClick={e.handleNudge}
            style={{
              width: "100%",
              minHeight: 44,
              borderRadius: 8,
              border: `1px solid ${PP.accent}`,
              background: PP.card,
              color: PP.accent,
              fontFamily: PP.font,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Send their friends the endorsement link
          </button>
        </div>
      ) : null}

      <ProfileTemplate key={e.previewVersion} data={e.displayData} shareId={e.shareId ?? undefined} />

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
      <ShareCard data={e.content} attach={attach} />

      <ToastStack toasts={e.toasts} onDismiss={e.dismissToast} onCopy={e.handleCopy} />

      <AnimatePresence>
        {e.showAuth ? <AuthModal onClose={e.closeAuth} onSuccess={e.closeAuthSuccess} /> : null}
      </AnimatePresence>
    </div>
  );
}

export default function ProfileProPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", background: PP.page }} />}>
      <ProfileProPageInner />
    </Suspense>
  );
}
