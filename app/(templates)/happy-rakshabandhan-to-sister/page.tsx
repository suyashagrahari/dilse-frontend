"use client";

import { Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, PenLine, Share2, Loader2, X, Copy, Sparkles } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import StoryStarter from "@/components/story/StoryStarter";
import { useSisterEditor } from "./hooks/useSisterEditor";
import SisterTemplate from "./components/SisterTemplate";
import EditSheet from "./components/EditSheet";
import { RS, PAPER_GRADIENT, BRAND_GRADIENT, CARD_BORDER, CARD_SHADOW } from "./components/theme";
import type { Toast } from "./components/types";
import "./components/sister.css";

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
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[400] flex flex-col gap-2 items-center w-[92%] max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="pointer-events-auto w-full rounded-2xl px-4 py-3 flex items-center gap-3"
            style={{
              background: RS.surface,
              border: CARD_BORDER,
              boxShadow: CARD_SHADOW,
            }}
          >
            <div className="flex-1">
              <p className="text-sm font-bold" style={{ color: RS.rani }}>
                {t.title}
              </p>
              {t.message && (
                <p className="text-xs" style={{ color: RS.muted }}>
                  {t.message}
                </p>
              )}
            </div>
            {t.type === "publish" && (
              <button
                onClick={() => onCopy(t.shareUrl)}
                aria-label="Copy link"
                className="p-1.5 rounded-lg"
                style={{ color: RS.rani, background: "rgba(166,42,92,0.12)" }}
              >
                <Copy size={14} />
              </button>
            )}
            <button
              onClick={() => onDismiss(t.id)}
              aria-label="Dismiss"
              className="p-1.5 rounded-lg"
              style={{ color: RS.muted }}
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function SisterPageInner() {
  const e = useSisterEditor();

  // One primary action, cycling Create → Send it → Share. Three buttons in the
  // bar would mean two of them are always wrong for where he is.
  const topAction = e.showShare
    ? { label: e.shareLabel, onClick: e.handleShare, icon: <Share2 size={14} /> }
    : e.showPublish
      ? {
          label: e.publishing ? "Sending…" : "Send it",
          onClick: e.publish,
          icon: <Sparkles size={14} />,
        }
      : { label: "Create", onClick: e.handleStartCreate, icon: <PenLine size={14} /> };

  const barBtn: React.CSSProperties = {
    background: RS.surface,
    color: RS.ink,
    border: CARD_BORDER,
    boxShadow: "2px 3px 0 rgba(51,32,43,0.14)",
  };

  // On a laptop the builder is a docked rail, so the stage and the top bar have
  // to move out from under it. `rs-railed` does both, in CSS, under the same
  // 1024px breakpoint the rail itself uses — see sister.css.
  const railed = e.editMode === "manual" || e.editMode === "choose";

  return (
    <div
      className={`rs-root${railed ? " rs-railed" : ""}`}
      style={{ minHeight: "100dvh", position: "relative", background: PAPER_GRADIENT }}
    >
      {/* ── The bar is positioned by the STYLESHEET, not by utilities here ────
       *
       * `.rs-topbar` owns `position`, `top`, `left`, `right` and `z-index`, and
       * `.rs-railed .rs-topbar` overrides the `left` when the rail is open. A
       * single-class Tailwind utility (`left-0`, `z-[200]`) ties on specificity
       * with the two-class railed rule and is decided by whichever stylesheet
       * the bundler emits last — a difference that shows up only in the
       * production build. So only in-flow layout lives on the element: the
       * padding, the flex row, and the max-width that keeps the two controls
       * from drifting to the far edges of a 1440px screen while the phone
       * column is centred.
       */}
      <div className="rs-topbar flex items-center justify-between gap-2 px-3 pt-3 lg:px-8 max-w-[520px] lg:max-w-none mx-auto">
        <button
          onClick={e.goBack}
          aria-label="Back to templates"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-bold"
          style={barBtn}
        >
          <ArrowLeft size={15} />
        </button>

        <div className="flex items-center gap-2">
          {e.isPersonalized && !e.showShare && (
            <button
              onClick={e.handleEditFromPreview}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-bold"
              style={barBtn}
            >
              <PenLine size={14} /> Edit
            </button>
          )}
          <button
            onClick={topAction.onClick}
            disabled={e.publishing}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold disabled:opacity-60"
            style={{
              background: BRAND_GRADIENT,
              color: "#fffdf8",
              border: CARD_BORDER,
              boxShadow: CARD_SHADOW,
            }}
          >
            {topAction.icon} {topAction.label}
          </button>
        </div>
      </div>

      {/* ── Sample marker ────────────────────────────────────────────────────
       *
       * The preview renders `DEMO` — a real family's photograph, a real ledger,
       * a scannable QR. That is the point: you cannot evaluate a template whose
       * every slot is empty, and three of the four things this one does would be
       * invisible. But filled demo content is also indistinguishable from a
       * finished page, and somebody has to be told that Ananya and Kabir are not
       * his before he taps Create and wonders where his own names went.
       *
       * Disappears the moment he has anything of his own — see `isPersonalized`.
       */}
      {!e.isPersonalized && e.editMode === null && (
        // Under the top bar, not at the bottom. Pinned to the bottom edge it sat
        // on top of whatever CTA the current screen ends with — on a 390px phone
        // it covered the cover screen's button outright. Up here the only thing
        // behind it is the toran, which is decoration.
        <div
          className="px-3.5 py-1.5 rounded-full text-[11px] font-bold pointer-events-none whitespace-nowrap"
          style={{
            // Inline rather than Tailwind utilities: the offset has to clear the
            // top bar exactly (it sits at top:12 and is ~38px tall) and an
            // arbitrary-value class is one purge away from silently not
            // applying, which drops this straight onto the Create button.
            position: "fixed",
            top: 58,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 150,
            background: "rgba(51,32,43,0.86)",
            color: "#fffaf2",
            letterSpacing: 0.4,
          }}
        >
          Sample — yours will use your photos
        </div>
      )}

      {/* Live preview. Keyed so each save restarts the page from the cover —
          otherwise he saves a change and is left staring at the tied rakhi. */}
      <SisterTemplate key={e.previewVersion} data={e.displayData} mode="preview" />

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

      {/* Shown the first time Create is tapped, and only once the server has a
          schema for this slug — otherwise it renders nothing and the form
          behaves exactly as it did. Every way out of it lands in the EditSheet
          above, with every field editable. */}
      {e.storyStarter && (
        <StoryStarter
          fill={e.fill}
          onManual={e.openManualForm}
          title="Tell me about your behna"
        />
      )}

      <AnimatePresence>
        {e.publishing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] grid place-items-center"
            style={{ background: "rgba(51,32,43,0.5)", backdropFilter: "blur(4px)" }}
          >
            <div
              className="flex flex-col items-center gap-3 px-8 py-6 rounded-3xl"
              style={{ background: RS.surface, border: CARD_BORDER }}
            >
              <Loader2 size={30} className="animate-spin" style={{ color: RS.rani }} />
              {/* One live region, not two: `publishStage` replaces the line
                  rather than appearing under it, so a screen reader announces
                  "Uploading photos… 2 of 4" instead of both at once. */}
              <p className="font-bold" style={{ color: RS.ink }} aria-live="polite">
                {e.publishStage ?? "Sealing the lifafa…"}
              </p>
              {e.publishStage && (
                <p className="text-xs" style={{ color: RS.muted }}>
                  Your photos are going up now — keep this open.
                </p>
              )}
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

// `useSearchParams` (via the editor hook, for `?edit=<id>`) requires a Suspense
// boundary or the whole route opts out of static rendering.
export default function HappyRakshaBandhanToSisterPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", background: "#fffaf2" }} />}>
      <SisterPageInner />
    </Suspense>
  );
}
