// ─── /call — the editor ──────────────────────────────────────────────────────
//
// A thin renderer over `useCallEditor`. The page opens as a LIVE DEMO of the
// finished thing — her call already coming in — with a floating bar carrying
// Back on the left and one polymorphic button on the right that walks
// Create → Publish → Share.
//
// Create opens the AI StoryStarter, not the blank form. StoryStarter mounts
// AFTER EditSheet so the sheet it seeds sits underneath it.

"use client";

import { Suspense, useState } from "react";
import AuthModal from "@/components/AuthModal";
import StoryStarter from "@/components/story/StoryStarter";
import { useCallEditor } from "./hooks/useCallEditor";
import CallTemplate from "./components/CallTemplate";
import EditSheet from "./components/EditSheet";
import TagQueue from "./components/TagQueue";
import { ArrowLeftGlyph, CopyGlyph, PenGlyph, ShareGlyph, TagGlyph } from "./components/icons";
import { COLUMN, DARK, FONT, TAP } from "./components/theme";

function CallEditorPage() {
  const e = useCallEditor();
  const [queueOpen, setQueueOpen] = useState(false);

  const topAction = e.showShare
    ? { label: e.shareLabel, onClick: e.handleShare, icon: <ShareGlyph size={15} color="#fff" /> }
    : e.showPublish
      ? {
          label: e.publishing ? "Publishing…" : "Publish",
          onClick: e.publish,
          icon: <ShareGlyph size={15} color="#fff" />,
        }
      : { label: "Create", onClick: e.handleStartCreate, icon: <PenGlyph size={15} color="#fff" /> };

  const barButton: React.CSSProperties = {
    minHeight: TAP,
    padding: "0 14px",
    borderRadius: 999,
    border: `1px solid ${DARK.edge}`,
    background: "rgba(26,31,38,0.88)",
    color: DARK.text,
    fontFamily: FONT,
    fontSize: 14,
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    cursor: "pointer",
    backdropFilter: "blur(6px)",
    touchAction: "manipulation",
  };

  return (
    <div style={{ minHeight: "100dvh", position: "relative", fontFamily: FONT }}>
      <div
        style={{
          position: "fixed",
          top: "calc(env(safe-area-inset-top, 0px) + 12px)",
          left: 0,
          right: 0,
          zIndex: 150,
          // Held to the same 400px column the template letterboxes into, so the
          // bar sits over the phone on a desktop rather than across the window.
          maxWidth: COLUMN,
          margin: "0 auto",
          padding: "0 12px",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <button type="button" onClick={e.goBack} style={barButton}>
          <ArrowLeftGlyph size={15} color={DARK.text} /> Back
        </button>

        <div style={{ flex: 1 }} />

        {e.isPersonalized && !e.showShare && (
          <button type="button" onClick={e.handleEditFromPreview} style={barButton}>
            <PenGlyph size={14} color={DARK.text} /> Edit
          </button>
        )}

        <button
          type="button"
          onClick={topAction.onClick}
          disabled={e.publishing}
          style={{
            ...barButton,
            border: "none",
            background: DARK.accentWarm,
            opacity: e.publishing ? 0.65 : 1,
            padding: "0 18px",
          }}
        >
          {topAction.icon}
          {topAction.label}
        </button>
      </div>

      {/* The owner's tag tools appear only once there is something to point at. */}
      {e.shareUrl && e.contribLink && (
        <div
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: "calc(env(safe-area-inset-bottom, 0px) + 14px)",
            zIndex: 150,
            maxWidth: COLUMN,
            margin: "0 auto",
            display: "flex",
            justifyContent: "center",
            gap: 8,
            padding: "0 12px",
          }}
        >
          <button type="button" onClick={e.handleCopyTagLink} style={barButton}>
            <CopyGlyph size={15} color={DARK.text} /> Tag link
          </button>
          {e.shareId && e.accessToken && (
            <button type="button" onClick={() => setQueueOpen(true)} style={barButton}>
              <TagGlyph size={15} color={DARK.text} /> Tags waiting
            </button>
          )}
        </div>
      )}

      {/* Live preview — keyed so each save and publish restarts the call. */}
      <CallTemplate
        key={e.previewVersion}
        data={e.displayData}
        mode="preview"
        shareId={e.shareId}
        contribLink={e.contribLink}
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
      {e.storyStarted && <StoryStarter fill={e.storyFill} onManual={e.handleStoryManual} />}

      {queueOpen && e.shareId && e.accessToken && (
        <TagQueue
          shareId={e.shareId}
          token={e.accessToken}
          onClose={() => setQueueOpen(false)}
          onToast={(message) => e.pushToast({ type: "info", title: message })}
        />
      )}

      {/* Toasts */}
      <div
        style={{
          position: "fixed",
          top: "calc(env(safe-area-inset-top, 0px) + 68px)",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 400,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          width: "92%",
          maxWidth: 360,
          pointerEvents: "none",
        }}
      >
        {e.toasts.map((t) => (
          <div
            key={t.id}
            style={{
              pointerEvents: "auto",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "11px 14px",
              borderRadius: 14,
              background: "rgba(16,20,24,0.95)",
              border: `1px solid ${DARK.edge}`,
              color: DARK.text,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{t.title}</p>
              {t.message && <p style={{ margin: "2px 0 0", fontSize: 12.5, color: DARK.dim }}>{t.message}</p>}
            </div>
            {t.type === "publish" && (
              <button
                type="button"
                onClick={() => e.handleCopy(t.shareUrl)}
                aria-label="Copy the link"
                style={{ background: "transparent", border: "none", cursor: "pointer", padding: 6 }}
              >
                <CopyGlyph size={15} color={DARK.dim} />
              </button>
            )}
            <button
              type="button"
              onClick={() => e.dismissToast(t.id)}
              aria-label="Dismiss"
              style={{ background: "transparent", border: "none", cursor: "pointer", padding: 6, color: DARK.dim }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {e.showAuth && <AuthModal onClose={e.closeAuth} onSuccess={e.closeAuthSuccess} />}
    </div>
  );
}

export default function CallPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", background: "#101418" }} />}>
      <CallEditorPage />
    </Suspense>
  );
}
