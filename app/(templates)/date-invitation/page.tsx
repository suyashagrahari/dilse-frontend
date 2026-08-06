"use client";

// ─── The Invitation — sender-side page shell ─────────────────────────────────
//
// A thin renderer over `useDateInvitationEditor`. Mirrors `catch/page.tsx`: the
// live demo preview fills the viewport, a floating bar sits over it, and one
// polymorphic button carries the whole flow — Create → Publish → Share.
//
// Z-ORDER (the template pins a demo-only phase-jump bar at the bottom of the
// viewport at z-130, so everything here is placed around it):
//   100  the template, including its demo phase bar at 130
//   120  this top bar          — top-anchored, never overlaps the phase bar
//   200  the EditSheet scrim, 210 its panel — must cover the phase bar
//   300  the publishing overlay
//   400  the toasts
//   500  AuthModal (its own)

import { Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Copy, Loader2, PenLine, Send, Share2, X } from "lucide-react";

import AuthModal from "@/components/AuthModal";
import { useDateInvitationEditor } from "./hooks/useDateInvitationEditor";
import DateInvitationTemplate from "./components/DateInvitationTemplate";
import EditSheet from "./components/EditSheet";
import type { Toast } from "./components/types";
import { ACCENT, ACCENT_EDGE, ACCENT_WASH, INK, INK_SOFT, PAPER, PAPER_EDGE, UI } from "./components/dateTheme";
import { TAP_TARGET_PX as TAP } from "./components/types";

/** Editor chrome sits on the paper, in the invitation's own palette. */
const CHROME: React.CSSProperties = {
  background: "rgba(253,250,243,.92)",
  color: ACCENT,
  border: `1px solid ${PAPER_EDGE}`,
  backdropFilter: "blur(8px)",
  fontFamily: UI,
  minHeight: TAP,
};

function ToastStack({
  toasts, onDismiss, onCopy,
}: { toasts: Toast[]; onDismiss: (id: number) => void; onCopy: (url?: string) => void }) {
  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[400] flex flex-col gap-2 items-center w-[92%] max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            className="pointer-events-auto w-full rounded-md px-4 py-3 flex items-center gap-3"
            style={{
              background: PAPER,
              border: `1px solid ${PAPER_EDGE}`,
              boxShadow: "0 14px 34px -18px rgba(58,44,32,.5)",
              fontFamily: UI,
            }}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold" style={{ color: ACCENT }}>{t.title}</p>
              {t.message && <p className="text-xs mt-0.5" style={{ color: INK_SOFT }}>{t.message}</p>}
            </div>
            {t.type === "publish" && (
              <button
                onClick={() => onCopy(t.shareUrl)}
                aria-label="Copy link"
                className="rounded-md grid place-items-center shrink-0"
                style={{ width: 34, height: 34, color: ACCENT, background: ACCENT_WASH }}
              >
                <Copy size={14} />
              </button>
            )}
            <button
              onClick={() => onDismiss(t.id)}
              aria-label="Dismiss"
              className="grid place-items-center shrink-0"
              style={{ width: 30, height: 30, color: INK_SOFT }}
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function DateInvitationPageInner() {
  const e = useDateInvitationEditor();

  // One button, three lives: Create → Publish → Share.
  const topAction = e.showShare
    ? { label: e.shareLabel, onClick: e.handleShare, icon: <Share2 size={14} /> }
    : e.showPublish
      ? { label: e.publishing ? "Sending…" : "Publish", onClick: e.publish, icon: <Send size={14} /> }
      : { label: "Create", onClick: e.handleEditClick, icon: <PenLine size={14} /> };

  return (
    <div style={{ minHeight: "100dvh", position: "relative", background: PAPER }}>
      {/* Floating top bar */}
      <div
        className="fixed top-3 left-0 right-0 z-[120] px-3 flex items-center gap-2"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <button
          onClick={e.goBack}
          className="inline-flex items-center gap-1.5 px-3.5 rounded-full text-sm font-semibold"
          style={{ ...CHROME, boxShadow: "0 6px 18px -10px rgba(58,44,32,.5)" }}
        >
          <ArrowLeft size={15} /> Back
        </button>
        <div className="flex-1" />
        {e.isPersonalized && !e.showShare && (
          <button
            onClick={e.handleEditFromPreview}
            className="inline-flex items-center gap-1.5 px-3.5 rounded-full text-sm font-semibold"
            style={{ ...CHROME, boxShadow: "0 6px 18px -10px rgba(58,44,32,.5)" }}
          >
            <PenLine size={14} /> Edit
          </button>
        )}
        <button
          onClick={topAction.onClick}
          disabled={e.publishing}
          className="inline-flex items-center gap-1.5 px-4 rounded-full text-sm font-bold text-white disabled:opacity-60"
          style={{
            minHeight: TAP,
            background: ACCENT,
            border: `1px solid ${ACCENT_EDGE}`,
            fontFamily: UI,
            boxShadow: "0 8px 22px -12px rgba(140,47,57,.85)",
          }}
        >
          {topAction.icon} {topAction.label}
        </button>
      </div>

      {/* The live preview. Keyed so every save/publish remounts the phase router
          with the freshly-written invitation. */}
      <DateInvitationTemplate key={e.previewVersion} data={e.displayData} mode="demo" />

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

      <AnimatePresence>
        {e.publishing && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] grid place-items-center"
            style={{ background: "rgba(36,31,27,.55)", backdropFilter: "blur(6px)" }}
          >
            <div
              className="flex flex-col items-center gap-3 px-8 py-6 rounded-md"
              style={{ background: PAPER, border: `1px solid ${PAPER_EDGE}`, fontFamily: UI }}
            >
              <Loader2 size={28} className="animate-spin" style={{ color: ACCENT }} />
              <p className="font-semibold" style={{ color: INK }}>Sealing the envelope…</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ToastStack toasts={e.toasts} onDismiss={e.dismissToast} onCopy={e.handleCopy} />

      {/* Auth is deferred, not gating: onClose cancels the pending publish,
          onSuccess just closes and the hook's effect resumes it. */}
      <AnimatePresence>
        {e.showAuth && <AuthModal onClose={e.closeAuth} onSuccess={e.closeAuthSuccess} />}
      </AnimatePresence>
    </div>
  );
}

export default function DateInvitationPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", background: "#fdfaf3" }} />}>
      <DateInvitationPageInner />
    </Suspense>
  );
}
