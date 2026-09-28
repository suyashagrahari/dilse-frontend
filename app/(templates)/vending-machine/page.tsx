"use client";

import { Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, PenLine, Share2, Loader2, Coins } from "lucide-react";
import AuthModal from "@/components/AuthModal";

import { useVendingMachineEditor } from "./hooks/useVendingMachineEditor";
import VendingMachineTemplate from "./components/VendingMachineTemplate";
import EditSheet from "./components/EditSheet";
import StoryStarter from "@/components/story/StoryStarter";
import { ThemeDock } from "../_love/LoveKit";
import { VEND_THEMES, pickVendTheme } from "./components/themes";

/* Chrome floats over every theme (two of them light), so the pills are dark
   glass and the one primary action is the SubhSandesh lime CTA. */
const LIME = "#C6FF3D";
const INK = "#0E0E12";
const PAGE_BG = "#12181a";

const PILL: React.CSSProperties = {
  background: "rgba(18,24,26,.72)",
  color: "#e9efe6",
  border: "1px solid rgba(255,255,255,.16)",
  backdropFilter: "blur(10px)",
};

function VendingMachinePageInner() {
  const e = useVendingMachineEditor();
  const theme = pickVendTheme(e.displayData.theme);

  // Three booleans drive one button: Create → Publish → Share.
  const topAction = e.showShare
    ? { label: e.shareLabel, onClick: e.handleShare, icon: <Share2 size={14} /> }
    : e.showPublish
      ? { label: e.publishing ? "Publishing…" : "Publish", onClick: e.publish, icon: <Coins size={14} /> }
      : { label: "Create", onClick: e.handleEditClick, icon: <PenLine size={14} /> };

  return (
    <div style={{ minHeight: "100dvh", position: "relative", background: theme.colors.base }}>
      {/* Floating top bar */}
      <div
        className="fixed top-3 left-0 right-0 z-[120] px-3 flex items-center gap-2"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <button
          onClick={e.goBack}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold shadow-sm"
          style={PILL}
        >
          <ArrowLeft size={15} /> Back
        </button>
        <div className="flex-1" />
        {e.isPersonalized && !e.showShare && (
          <button
            onClick={e.handleEditFromPreview}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold shadow-sm"
            style={PILL}
          >
            <PenLine size={14} /> Edit
          </button>
        )}
        <button
          onClick={topAction.onClick}
          disabled={e.publishing}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold shadow-md disabled:opacity-60"
          style={{ background: LIME, color: INK }}
        >
          {topAction.icon} {topAction.label}
        </button>
      </div>

      {/* Live demo preview. Keyed so every save/publish restocks the machine:
          credit back to ₹0.00, tray emptied, sold-out flags reset. */}
      <VendingMachineTemplate key={e.previewVersion} data={e.displayData} mode="demo" />

      {/* Live theme switcher — hidden while the form is open (the form has its own picker). */}
      {e.editMode !== "manual" && (
        <ThemeDock themes={VEND_THEMES} value={e.content.theme} onChange={e.setTheme} />
      )}

      {/* Edit sheet */}
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

      {/* Shown the first time Create is tapped, and only when the server has a
          schema for this template. Every way out lands in the EditSheet above,
          fully editable. */}
      {e.storyStarter && (
        <StoryStarter fill={e.fill} onManual={e.openManualForm} title="Let's stock the machine" />
      )}

      {/* Publishing overlay */}
      <AnimatePresence>
        {e.publishing && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] grid place-items-center"
            style={{ background: "rgba(8,12,13,.66)", backdropFilter: "blur(6px)" }}
          >
            <div className="flex flex-col items-center gap-3 px-8 py-6 rounded-2xl" style={{ background: "#FAFAF7" }}>
              <Loader2 size={28} className="animate-spin" style={{ color: "#6C5CE7" }} />
              <p className="font-semibold" style={{ color: INK }}>Stocking the machine…</p>
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

export default function VendingMachinePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", background: PAGE_BG }} />}>
      <VendingMachinePageInner />
    </Suspense>
  );
}
