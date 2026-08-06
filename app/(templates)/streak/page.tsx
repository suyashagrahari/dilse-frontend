// ─── /streak ─────────────────────────────────────────────────────────────────
//
// The gallery/editor route. Same three-lives top bar every template in this
// repo uses: Create → Publish → Share, with auth deferred rather than gating.
//
// The chrome is deliberately quieter than Rewind's. This is not a story you
// watch once; it is a thing someone is deciding to open every day, and a
// gradient button shouting at them on the way in sets the wrong expectation.

"use client";

import { Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, PenLine, Send, Share2, Loader2, X, Copy } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import { useStreakEditor } from "./hooks/useStreakEditor";
import StreakTemplate from "./components/StreakTemplate";
import EditSheet from "./components/EditSheet";
import { PALETTE, SERIF, UI } from "./components/types";
import type { Toast } from "./components/editorTypes";

const CHROME = "rgba(250,247,240,0.92)";
const CHROME_BORDER = `1px solid ${PALETTE.edge}`;

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
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="pointer-events-auto w-full rounded-2xl px-4 py-3 flex items-center gap-3"
            style={{ background: PALETTE.paper, border: CHROME_BORDER, boxShadow: "0 6px 20px rgba(43,38,32,0.08)" }}
          >
            <div className="flex-1">
              <p style={{ fontFamily: SERIF, fontSize: 15, color: PALETTE.ink }}>{t.title}</p>
              {t.message && (
                <p style={{ fontFamily: UI, fontSize: 12, color: PALETTE.inkSoft, marginTop: 1 }}>{t.message}</p>
              )}
            </div>
            {t.type === "publish" && (
              <button
                onClick={() => onCopy(t.shareUrl)}
                aria-label="Copy link"
                style={{ minWidth: 44, minHeight: 44, display: "grid", placeItems: "center", background: "transparent", border: "none", color: PALETTE.accent }}
              >
                <Copy size={15} />
              </button>
            )}
            <button
              onClick={() => onDismiss(t.id)}
              aria-label="Dismiss"
              style={{ minWidth: 44, minHeight: 44, display: "grid", placeItems: "center", background: "transparent", border: "none", color: PALETTE.inkFaint }}
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function StreakPageInner() {
  const e = useStreakEditor();

  const topAction = e.showShare
    ? { label: e.shareLabel, onClick: e.handleShare, icon: <Share2 size={14} /> }
    : e.showPublish
      ? { label: e.publishing ? "Publishing…" : "Publish", onClick: e.publish, icon: <Send size={14} /> }
      : { label: "Create", onClick: e.handleEditClick, icon: <PenLine size={14} /> };

  return (
    <div style={{ minHeight: "100dvh", position: "relative", background: PALETTE.paper }}>
      <div
        className="fixed top-3 left-0 right-0 z-[120] px-3 flex items-center gap-2"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)", pointerEvents: "none" }}
      >
        <button
          onClick={e.goBack}
          className="inline-flex items-center gap-1.5 px-3 rounded-full"
          style={{
            pointerEvents: "auto",
            minHeight: 44,
            fontFamily: UI,
            fontSize: 13.5,
            background: CHROME,
            color: PALETTE.inkSoft,
            border: CHROME_BORDER,
            backdropFilter: "blur(8px)",
          }}
        >
          <ArrowLeft size={15} /> Back
        </button>
        <div className="flex-1" />
        {e.isPersonalized && !e.showShare && (
          <button
            onClick={e.handleEditFromPreview}
            className="inline-flex items-center gap-1.5 px-3.5 rounded-full"
            style={{
              pointerEvents: "auto",
              minHeight: 44,
              fontFamily: UI,
              fontSize: 13.5,
              background: CHROME,
              color: PALETTE.inkSoft,
              border: CHROME_BORDER,
              backdropFilter: "blur(8px)",
            }}
          >
            <PenLine size={14} /> Edit
          </button>
        )}
        <button
          onClick={topAction.onClick}
          disabled={e.publishing}
          className="inline-flex items-center gap-1.5 px-4 rounded-full disabled:opacity-60"
          style={{
            pointerEvents: "auto",
            minHeight: 44,
            fontFamily: UI,
            fontSize: 13.5,
            background: PALETTE.ink,
            color: PALETTE.paper,
            border: "none",
          }}
        >
          {topAction.icon} {topAction.label}
        </button>
      </div>

      {/* Keyed so a Save re-seats the session on the freshly-written pair. */}
      <StreakTemplate
        key={e.previewVersion}
        data={e.displayData}
        mode="demo"
        shareUrl={e.shareUrl}
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
        restoredDraft={e.restoredDraft}
      />

      <AnimatePresence>
        {e.publishing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] grid place-items-center"
            style={{ background: "rgba(43,38,32,0.42)", backdropFilter: "blur(5px)" }}
          >
            <div
              className="flex flex-col items-center gap-3 px-8 py-6 rounded-3xl"
              style={{ background: PALETTE.paper }}
            >
              <Loader2 size={26} className="animate-spin" style={{ color: PALETTE.accent }} />
              <p style={{ fontFamily: SERIF, fontSize: 16, color: PALETTE.ink }}>Lighting it up…</p>
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

export default function StreakPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", background: PALETTE.paper }} />}>
      <StreakPageInner />
    </Suspense>
  );
}
