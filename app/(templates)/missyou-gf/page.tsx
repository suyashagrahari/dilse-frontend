"use client";

import { Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, PenLine, Heart, Share2, Loader2, X, Copy } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import { useMissYouEditor } from "./hooks/useMissYouEditor";
import MissYouTemplate from "./components/MissYouTemplate";
import EditSheet from "./components/EditSheet";
import { NIGHT, LIGHT, BRAND_GRADIENT } from "./components/theme";
import type { Toast } from "./components/types";

function ToastStack({ toasts, onDismiss, onCopy }: { toasts: Toast[]; onDismiss: (id: number) => void; onCopy: (url?: string) => void }) {
  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[400] flex flex-col gap-2 items-center w-[92%] max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div key={t.id} initial={{ opacity: 0, y: -20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="pointer-events-auto w-full rounded-2xl px-4 py-3 shadow-lg flex items-center gap-3" style={{ background: "#fff", border: `1px solid ${LIGHT.border}` }}>
            <div className="flex-1">
              <p className="text-sm font-bold" style={{ color: LIGHT.indigoStrong }}>{t.title}</p>
              {t.message && <p className="text-xs text-muted-foreground mt-0.5">{t.message}</p>}
            </div>
            {t.type === "publish" && (
              <button onClick={() => onCopy(t.shareUrl)} aria-label="Copy link" className="p-1.5 rounded-lg" style={{ color: LIGHT.indigoStrong, background: LIGHT.surfaceAlt }}><Copy size={14} /></button>
            )}
            <button onClick={() => onDismiss(t.id)} aria-label="Dismiss" className="p-1 text-muted-foreground"><X size={14} /></button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function MissYouPageInner() {
  const e = useMissYouEditor();

  const topAction = e.showShare
    ? { label: "Share", onClick: e.handleShare, icon: <Share2 size={14} /> }
    : e.showPublish
      ? { label: e.publishing ? "Publishing…" : "Publish", onClick: e.publish, icon: <Heart size={14} fill="#fff" /> }
      : { label: "Create", onClick: e.handleEditClick, icon: <PenLine size={14} /> };

  const barBtn: React.CSSProperties = { background: "rgba(27,24,48,.85)", color: NIGHT.onNight, border: `1px solid ${NIGHT.hairline}`, backdropFilter: "blur(8px)" };

  return (
    <div style={{ minHeight: "100dvh", position: "relative" }}>
      <div className="fixed top-3 left-0 right-0 z-[120] px-3 flex items-center gap-2" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
        <button onClick={e.goBack} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold shadow-sm" style={barBtn}>
          <ArrowLeft size={15} /> Back
        </button>
        <div className="flex-1" />
        {e.isPersonalized && !e.showShare && (
          <button onClick={e.handleEditFromPreview} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold shadow-sm" style={barBtn}>
            <PenLine size={14} /> Edit
          </button>
        )}
        <button onClick={topAction.onClick} disabled={e.publishing} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold text-white shadow-md disabled:opacity-60" style={{ background: BRAND_GRADIENT }}>
          {topAction.icon} {topAction.label}
        </button>
      </div>

      {/* Live preview — keyed so each save/publish restarts the experience fresh */}
      <MissYouTemplate key={e.previewVersion} data={e.displayData} mode="preview" />

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

      {/* PublishingOverlay — branded conic ring */}
      <AnimatePresence>
        {e.publishing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] grid place-items-center" style={{ background: "rgba(18,16,31,.7)", backdropFilter: "blur(6px)" }}>
            <div className="flex flex-col items-center gap-3 px-8 py-6 rounded-3xl" style={{ background: NIGHT.base2, border: `1px solid ${NIGHT.hairline}` }}>
              <div aria-hidden style={{ width: 44, height: 44, borderRadius: 999, background: `conic-gradient(#6C5CE7,#F72585,#C6FF3D,#6C5CE7)`, WebkitMask: "radial-gradient(farthest-side,transparent calc(100% - 5px),#000 0)", mask: "radial-gradient(farthest-side,transparent calc(100% - 5px),#000 0)", animation: "myspin 1s linear infinite" }} />
              <p className="font-semibold" style={{ color: NIGHT.onNight }} aria-live="polite">Publishing your letter…</p>
              <style>{`@keyframes myspin{to{transform:rotate(360deg)}}`}</style>
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

export default function MissYouGfPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", background: NIGHT.base }} />}>
      <MissYouPageInner />
    </Suspense>
  );
}
