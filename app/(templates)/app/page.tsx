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
// ── THE CHROME ───────────────────────────────────────────────────────────────
//
// The listing is responsive (phone / tablet / desktop layouts of the store), so
// the floating bar spans the viewport: Back on the left, the actions on the
// right. `chromeTop` on the template reserves room for it.

import { Suspense, useCallback, useState } from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import AuthModal from "@/components/AuthModal";
import StoryStarter from "@/components/story/StoryStarter";
import { whatsappNudgeUrl } from "@/components/contrib/ContributorShell";

import { useAppEditor } from "./hooks/useAppEditor";

import { AppTemplate } from "./components/AppTemplate";
import EditSheet from "./components/EditSheet";
import ShareCardPanel from "./components/ShareCard";
import { AP, AP_TAP } from "./components/theme";

const SURROUND = "#FFFFFF";
const INK = "#1C1C1E";

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
    boxShadow: "0 4px 14px -4px rgba(0,0,0,0.22), 0 0 0 0.5px rgba(0,0,0,0.06)",
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
      {/* A white band under the floating bar, so the listing never scrolls
          visibly behind Back / Create. Same height as `chromeTop`. */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          top: 0,
          zIndex: 119,
          height: "calc(62px + env(safe-area-inset-top, 0px))",
          background: "rgba(255,255,255,0.97)",
        }}
      />
      {/* Floating top bar — spans the viewport; the listing is responsive. */}
      <div
        className="fixed left-0 right-0 z-[120] px-3 sm:px-5 flex items-center gap-2"
        style={{ top: 10, paddingTop: "env(safe-area-inset-top, 0px)" }}
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
      {/* chromeTop clears the floating bar above: it is fixed at top:12 and is
          one 44px tap target tall, so the listing starts at 12 + 44 + 8 of
          breathing room. Without it the Back and Create pills sit directly on
          top of the app icon and the app name. */}
      <AppTemplate
        key={e.previewVersion}
        data={e.displayData}
        shareId={e.shareId ?? undefined}
        chromeTop={62}
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
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, flex: 1 }}>Her listing, and her reviews 💗</h2>
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
