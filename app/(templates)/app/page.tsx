"use client";

// ─── /app — the editor ───────────────────────────────────────────────────────
//
// A thin renderer over `useAppEditor`. The page opens as a live demo of the
// listing; a floating bar carries Back on the left and one polymorphic button on
// the right that walks Create → Publish → Share. Create opens the AI
// StoryStarter, not the blank form.
//
// Everything stateful lives in the hook. Nothing in this file fetches.
//
// ── THE COLUMN ───────────────────────────────────────────────────────────────
//
// The listing is portrait and stays portrait. `AppTemplate` letterboxes itself
// into a centred 420px column on a neutral surround and never reflows wide, so
// this file's only job is to keep its own chrome — the floating bar, the sheet,
// the toasts — inside that same column rather than pinned to the browser edges.
// A listing that stretches to 1400px is not a listing, it is a table.

import { Suspense, useCallback, useState } from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import AuthModal from "@/components/AuthModal";
import StoryStarter from "@/components/story/StoryStarter";
import { whatsappNudgeUrl } from "@/components/contrib/ContributorShell";

import { useAppEditor } from "./hooks/useAppEditor";
import type { Toast } from "./hooks/useAppEditor";
import { AppTemplate } from "./components/AppTemplate";
import EditSheet from "./components/EditSheet";
import ShareCardPanel from "./components/ShareCard";
import { AP, AP_TAP } from "./components/theme";

/** The letterbox width. Must match `AppTemplate`'s own column. */
const COLUMN = 420;
/** The neutral the column floats on. Must match `AppTemplate`'s surround. */
const SURROUND = "#E8E6EF";
const INK = "#16141F";

/* ── Bits ──────────────────────────────────────────────────────────────────── */

function BackGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M14.5 5 8 12l6.5 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
      className="fixed left-1/2 -translate-x-1/2 z-[400] flex flex-col gap-2 items-center w-[92%] pointer-events-none"
      style={{ top: 14, maxWidth: COLUMN - 32 }}
    >
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            className="pointer-events-auto w-full flex items-center gap-3"
            style={{
              background: "#fff",
              border: `1px solid ${AP.edge}`,
              borderRadius: 14,
              padding: "10px 12px",
              boxShadow: "0 6px 22px rgba(22,20,31,0.18)",
              fontFamily: AP.font,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 13.5, fontWeight: 800, color: INK, overflowWrap: "anywhere" }}>
                {t.title}
              </p>
              {t.message ? (
                <p style={{ margin: "2px 0 0", fontSize: 12, color: AP.inkSoft, overflowWrap: "anywhere" }}>
                  {t.message}
                </p>
              ) : null}
            </div>
            {t.type === "publish" ? (
              <button
                type="button"
                onClick={() => onCopy(t.shareUrl)}
                style={{
                  minHeight: AP_TAP,
                  padding: "0 6px",
                  border: "none",
                  background: "none",
                  color: AP.accent,
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Copy
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => onDismiss(t.id)}
              aria-label="Dismiss"
              style={{
                minWidth: AP_TAP,
                minHeight: AP_TAP,
                border: "none",
                background: "none",
                color: AP.inkSoft,
                fontSize: 18,
                cursor: "pointer",
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ── The page ──────────────────────────────────────────────────────────────── */

function AppPageInner() {
  const e = useAppEditor();
  const [panelOpen, setPanelOpen] = useState(false);
  const openPanel = useCallback(() => setPanelOpen(true), []);
  const closePanel = useCallback(() => setPanelOpen(false), []);

  const topAction = e.showShare
    ? { label: e.shareLabel, onClick: e.handleShare }
    : e.showPublish
      ? { label: e.publishing ? "Publishing…" : "Publish", onClick: e.publish }
      : { label: "Create", onClick: e.handleStartCreate };

  const barBtn: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    minHeight: AP_TAP,
    padding: "8px 16px",
    borderRadius: 100,
    background: "#fff",
    border: `1px solid ${AP.edge}`,
    color: INK,
    fontFamily: AP.font,
    fontSize: 13.5,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 2px 10px rgba(22,20,31,0.14)",
    touchAction: "manipulation",
  };

  const nudge = e.reviewLink
    ? whatsappNudgeUrl(
        `${e.content.app.developer.trim() || "I"} listed ${e.content.app.name.trim() || "her"}. Leave a review — one line is plenty:`,
        e.reviewLink
      )
    : null;

  return (
    <div style={{ minHeight: "100dvh", position: "relative", background: SURROUND, fontFamily: AP.font }}>
      {/* Floating top bar — inside the column, never at the browser edges. */}
      <div
        className="fixed left-1/2 -translate-x-1/2 z-[120] px-3 flex items-center gap-2 w-full"
        style={{ top: 12, maxWidth: COLUMN, paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <button type="button" onClick={e.goBack} style={barBtn}>
          <BackGlyph /> Back
        </button>
        <div style={{ flex: 1 }} />
        {e.isPersonalized && !e.showShare && (
          <button type="button" onClick={e.handleEditFromPreview} style={barBtn}>
            Edit
          </button>
        )}
        {e.showShare && (
          <button type="button" onClick={openPanel} style={barBtn}>
            Reviews
          </button>
        )}
        <button
          type="button"
          onClick={topAction.onClick}
          disabled={e.publishing}
          style={{
            ...barBtn,
            background: AP.accent,
            border: `1px solid ${AP.accent}`,
            color: AP.accentInk,
            opacity: e.publishing ? 0.6 : 1,
          }}
        >
          {topAction.label}
        </button>
      </div>

      {/* Live preview. `shareId` only exists once published — it is what turns on
          the sender-only moderation queue inside the listing. */}
      <AppTemplate key={e.previewVersion} data={e.displayData} shareId={e.shareId ?? undefined} />

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

      {/* Mounted after EditSheet so the sheet sits over the form it seeds. */}
      {e.storyStarted && <StoryStarter fill={e.storyFill} onManual={e.handleStoryManual} />}

      {/* Share panel */}
      <AnimatePresence>
        {panelOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closePanel}
              className="fixed inset-0 z-[210]"
              style={{ background: "rgba(22,20,31,0.5)" }}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              role="dialog"
              aria-modal="true"
              aria-label="Share the listing"
              className="fixed bottom-0 left-0 right-0 z-[211] mx-auto w-full"
              style={{
                maxWidth: 480,
                background: "#fff",
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                maxHeight: "92dvh",
                overflowY: "auto",
                padding: "18px 18px calc(24px + env(safe-area-inset-bottom, 0px))",
                fontFamily: AP.font,
                color: INK,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, flex: 1 }}>Her listing, and her reviews</h2>
                <button
                  type="button"
                  onClick={closePanel}
                  aria-label="Close"
                  style={{
                    minWidth: AP_TAP,
                    minHeight: AP_TAP,
                    border: "none",
                    background: "none",
                    color: AP.inkSoft,
                    fontSize: 22,
                    cursor: "pointer",
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>

              {e.shareUrl ? (
                <div style={{ marginTop: 14 }}>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: AP.inkSoft }}>Her link</p>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: AP.accent, overflowWrap: "anywhere" }}>
                    {e.shareUrl}
                  </p>
                  <button
                    type="button"
                    onClick={() => e.handleCopy()}
                    style={{
                      minHeight: AP_TAP,
                      padding: "0 2px",
                      border: "none",
                      background: "none",
                      color: AP.accent,
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {e.copied ? "Copied!" : "Copy her link"}
                  </button>
                </div>
              ) : null}

              {e.reviewLink ? (
                <div style={{ marginTop: 12 }}>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: AP.inkSoft }}>
                    The review link — for her friends
                  </p>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: AP.accent, overflowWrap: "anywhere" }}>
                    {e.reviewLink}
                  </p>
                  <p style={{ margin: "6px 0 0", fontSize: 12, color: AP.inkSoft, lineHeight: 1.5 }}>
                    A different link from hers, on purpose. It lets people write a review and nothing else — it does
                    not open her listing, and nothing they write appears until you approve it.
                  </p>
                  <div style={{ display: "flex", gap: 14, marginTop: 4, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={() => e.handleCopy(e.reviewLink ?? undefined)}
                      style={{
                        minHeight: AP_TAP,
                        padding: "0 2px",
                        border: "none",
                        background: "none",
                        color: AP.accent,
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Copy the review link
                    </button>
                    {nudge ? (
                      <a
                        href={nudge}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          minHeight: AP_TAP,
                          color: AP.accent,
                          fontSize: 13,
                          fontWeight: 700,
                          textDecoration: "none",
                        }}
                      >
                        Share it on WhatsApp
                      </a>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <div style={{ marginTop: 12, maxWidth: 340 }}>
                <ShareCardPanel data={e.displayData} />
              </div>

              <p style={{ margin: "16px 0 0", fontSize: 12, color: AP.inkSoft, lineHeight: 1.5 }}>
                Reviews your friends send land in the queue at the bottom of the listing. You see them before she
                does.
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Publishing overlay */}
      <AnimatePresence>
        {e.publishing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] grid place-items-center"
            style={{ background: "rgba(22,20,31,0.55)" }}
          >
            <div
              style={{
                background: "#fff",
                border: `1px solid ${AP.edge}`,
                borderRadius: 16,
                padding: "20px 28px",
                fontFamily: AP.font,
                fontSize: 14,
                fontWeight: 800,
                color: INK,
              }}
              aria-live="polite"
            >
              Publishing her listing…
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ToastStack toasts={e.toasts} onDismiss={e.dismissToast} onCopy={e.handleCopy} />

      <AnimatePresence>
        {e.showAuth && <AuthModal onClose={e.closeAuth} onSuccess={e.closeAuthSuccess} />}
      </AnimatePresence>
    </div>
  );
}

export default function AppEditorPage() {
  return (
    // `reducedMotion="user"` makes every framer transition in this subtree — the
    // sheet, the panel, the toasts — honour prefers-reduced-motion. The sheet
    // still opens and closes; it just stops sliding.
    <MotionConfig reducedMotion="user">
      <Suspense fallback={<div style={{ minHeight: "100dvh", background: SURROUND }} />}>
        <AppPageInner />
      </Suspense>
    </MotionConfig>
  );
}
