"use client";

// ─── /product — the editor ───────────────────────────────────────────────────
//
// A thin renderer over `useProductEditor`. The page opens as a live demo of the
// listing, edge to edge like the real store; a floating EditorDock carries Back
// and one polymorphic button that walks Create → Publish → Share. Create opens the AI
// StoryStarter, not the blank form.
//
// Everything stateful lives in the hook. Nothing in this file fetches.

import { Suspense, useCallback, useState } from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import AuthModal from "@/components/AuthModal";
import StoryStarter from "@/components/story/StoryStarter";
import ModerationQueue from "@/components/contrib/ModerationQueue";
import { whatsappNudgeUrl } from "@/components/contrib/ContributorShell";

import { useProductEditor } from "./hooks/useProductEditor";
import ProductTemplate from "./components/ProductTemplate";
import EditSheet from "./components/EditSheet";
import ShareCardPanel from "./components/ShareCard";
import EditorDock from "../_love/EditorDock";
import { C, FONT, LinkText, WRAP, aggregateOf } from "./components/tokens";

/* ── The page ──────────────────────────────────────────────────────────────── */

function ProductPageInner() {
  const e = useProductEditor();
  const [panelOpen, setPanelOpen] = useState(false);

  // `showPublish` goes false while publishing, which used to fall through to
  // "Create" for the length of the request.
  const topAction = e.showShare
    ? { label: e.shareLabel, onClick: e.handleShare }
    : e.publishing
      ? { label: "Listing…", onClick: () => {} }
      : e.showPublish
      ? { label: e.publishing ? "Listing…" : "List it", onClick: e.publish }
      : { label: "Create", onClick: e.handleStartCreate };

  const nudge = e.reviewLink
    ? whatsappNudgeUrl(
        `${e.content.sender.firstName || "I"} listed ${e.content.subject.firstName || "her"} as a product. Leave a review — one line is plenty:`,
        e.reviewLink
      )
    : null;

  const published = e.displayData.reviews.filter((r) => r.status === "published");
  const aggregate = aggregateOf(published);
  const topReview = published.length > 0
    ? [...published].sort((a, b) => b.helpful - a.helpful || b.stars - a.stars)[0] ?? null
    : null;

  const openPanel = useCallback(() => setPanelOpen(true), []);

  return (
    <div style={{ minHeight: "100dvh", position: "relative", background: C.page }}>
      {/* Live preview */}
      <ProductTemplate
        key={e.previewVersion}
        data={e.displayData}
        mode="preview"
        onBack={e.goBack}
        hideLetter={e.editMode === "manual" || e.editMode === "choose" || (e.storyStarted && e.storyFill.mode !== "manual") || panelOpen}
        onWriteReview={e.showShare ? openPanel : undefined}
        writeReviewLabel={e.showShare ? "Get her friends to write one" : "Write a review"}
        reviewsFooter={
          nudge ? (
            <div
              style={{
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                padding: 14,
                background: C.section,
                fontFamily: FONT,
                maxWidth: 520,
              }}
            >
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.text }}>
                Reviews come from her friends
              </p>
              <p style={{ margin: "6px 0 10px", fontSize: 13, color: C.secondary, lineHeight: 1.55, ...WRAP }}>
                Send this link to the group chat. Anyone can write one, nobody needs an account, and nothing
                appears here until you approve it.
              </p>
              <a
                href={nudge}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  minHeight: 34,
                  padding: "7px 16px",
                  borderRadius: 100,
                  border: "1px solid #E7B93C",
                  background: C.ctaYellow,
                  color: C.text,
                  fontSize: 13.5,
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Share the review link
              </a>
            </div>
          ) : undefined
        }
      />

      {/* The editor control floats over the store — no reserved strip. The
          search bar's own back arrow (onBack above) is Back too. */}
      <EditorDock
        tone="light"
        accent={C.ctaYellow}
        accentInk={C.text}
        font={FONT}
        avoidBottom=".lk-tabbar"
        onBack={e.goBack}
        secondary={[
          e.isPersonalized && !e.showShare && { label: "Edit", onClick: e.handleEditFromPreview },
          e.showShare && { label: "Reviews", onClick: openPanel, badge: e.moderation.pendingCount },
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

      {/* Mounted after EditSheet so the sheet sits over the form it seeds. */}
      {e.storyStarted && <StoryStarter guided fill={e.storyFill} onManual={e.handleStoryManual} />}

      {/* Share + moderation panel */}
      <AnimatePresence>
        {panelOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPanelOpen(false)}
              className="fixed inset-0 z-[210]"
              style={{ background: "rgba(15,17,17,0.5)" }}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              className="fixed bottom-0 left-0 right-0 z-[211] mx-auto w-full max-w-[620px]"
              style={{
                background: "#fff",
                borderTopLeftRadius: 18,
                borderTopRightRadius: 18,
                border: `1px solid ${C.border}`,
                borderBottom: 0,
                maxHeight: "90dvh",
                overflowY: "auto",
                padding: "18px 16px calc(24px + env(safe-area-inset-bottom, 0px))",
                fontFamily: FONT,
                color: C.text,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, flex: 1 }}>Her page, and her reviews</h2>
                <button
                  type="button"
                  onClick={() => setPanelOpen(false)}
                  aria-label="Close"
                  style={{ border: "none", background: "none", color: C.secondary, fontSize: 20, cursor: "pointer", lineHeight: 1 }}
                >
                  ×
                </button>
              </div>

              {e.reviewLink ? (
                <div style={{ marginTop: 18 }}>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: C.secondary }}>
                    The review link — for her friends
                  </p>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: C.link, ...WRAP }}>{e.reviewLink}</p>
                  <p style={{ margin: "6px 0 0", fontSize: 12, color: C.secondary, lineHeight: 1.5, ...WRAP }}>
                    A different link from hers, on purpose. It lets people write a review and nothing else — it
                    does not open her page.
                  </p>
                  <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
                    <LinkText onClick={() => e.handleCopy(e.reviewLink ?? undefined)} size={13}>
                      Copy the review link
                    </LinkText>
                    {nudge ? (
                      <LinkText href={nudge} size={13}>
                        Share it on WhatsApp
                      </LinkText>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <div style={{ marginTop: 20, maxWidth: 340 }}>
                <ShareCardPanel data={e.displayData} aggregate={aggregate} topReview={topReview} />
              </div>

              <div style={{ marginTop: 22 }}>
                <ModerationQueue
                  items={e.moderation.items}
                  loading={e.moderation.loading}
                  busyIds={e.moderation.busyIds}
                  onApprove={e.moderation.approve}
                  onReject={e.moderation.reject}
                  onApproveAll={e.moderation.approveAll}
                  approvingAll={e.moderation.approvingAll}
                  emptyTitle="Nothing waiting yet"
                  emptyBody="When one of her friends writes a review it lands here first. You see it before she does, and nothing goes on her page until you say so."
                  theme={{
                    paper: "#ffffff",
                    paperDeep: C.section,
                    edge: C.border,
                    ink: C.text,
                    inkSoft: C.secondary,
                    accent: C.subHeader,
                    accentInk: "#ffffff",
                    danger: C.priceRed,
                    ok: C.green,
                    warn: "#B07213",
                    font: FONT,
                    serif: 'Georgia, "Times New Roman", serif',
                  }}
                />
              </div>
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
            style={{ background: "rgba(15,17,17,0.55)" }}
          >
            <div
              style={{
                background: "#fff",
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: "20px 28px",
                fontFamily: FONT,
                fontSize: 14,
                fontWeight: 700,
                color: C.text,
              }}
              aria-live="polite"
            >
              <span className="lk-spin" style={{ display: "inline-block", verticalAlign: "-3px", marginRight: 10 }} />
              Listing her on the store…
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

export default function ProductPage() {
  return (
    // `reducedMotion="user"` makes every framer transition in this subtree — the
    // sheet, the panel, the toasts — honour prefers-reduced-motion. The sheet
    // still opens and closes; it just stops sliding.
    <MotionConfig reducedMotion="user">
      <Suspense fallback={<div style={{ minHeight: "100dvh", background: "#fff" }} />}>
        <ProductPageInner />
      </Suspense>
    </MotionConfig>
  );
}
