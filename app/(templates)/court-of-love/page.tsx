"use client";

import { Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, PenLine, Gavel, Share2, Loader2 } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import { useCourtOfLoveEditor } from "./hooks/useCourtOfLoveEditor";
import CourtOfLove from "./components/CourtOfLove";
import EditSheet from "./components/EditSheet";
import { COURT_THEMES } from "./components/themes";
import { pickTheme } from "../_love/theme";

const TEXT = "#0E0E12";
const SURFACE = "#FFFFFF";
const BORDER = "#ECEAE3";
const INDIGO = "#7A1F16";
const HEAD = "var(--font-space-grotesk), ui-sans-serif, system-ui, sans-serif";

const pill: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "9px 13px",
  borderRadius: 999,
  background: "rgba(255,255,255,.9)",
  color: TEXT,
  border: `1px solid ${BORDER}`,
  backdropFilter: "blur(10px)",
  fontFamily: HEAD,
  fontSize: 13.5,
  fontWeight: 600,
  boxShadow: "0 8px 24px rgba(14,14,18,.06)",
  cursor: "pointer",
  minHeight: 42,
};

function CourtOfLovePageInner() {
  const e = useCourtOfLoveEditor();
  // The main action wears the courtroom's wax/foil colour, so it belongs to
  // whichever theme is on screen instead of fighting it.
  const theme = pickTheme(COURT_THEMES, e.displayData.theme);

  const topAction = e.showShare
    ? { label: e.shareLabel, onClick: e.handleShare, icon: <Share2 size={14} /> }
    : e.showPublish
      ? { label: e.publishing ? "Publishing…" : "Publish", onClick: e.publish, icon: <Gavel size={14} /> }
      : { label: "Create", onClick: e.handleEditClick, icon: <PenLine size={14} /> };

  return (
    <div style={{ minHeight: "100dvh", position: "relative" }}>
      {/* Below 420px Edit collapses to its icon so Back · theme dock · Edit ·
          Publish never collide on a phone. */}
      <style>{`@media (max-width: 419px) { .col-edit-label { display: none; } }`}</style>
      {/* Floating top bar */}
      <div
        className="fixed left-0 right-0 z-[120] px-3 flex items-center gap-2"
        style={{ top: "calc(env(safe-area-inset-top, 0px) + 10px)" }}
      >
        <button onClick={e.goBack} style={pill}>
          <ArrowLeft size={15} /> Back
        </button>
        <div className="flex-1" />
        {e.isPersonalized && !e.showShare && (
          <button onClick={e.handleEditFromPreview} style={pill} aria-label="Edit">
            <PenLine size={14} /> <span className="col-edit-label">Edit</span>
          </button>
        )}
        <button
          onClick={topAction.onClick}
          disabled={e.publishing}
          style={{
            ...pill,
            background: theme.colors.chip,
            color: theme.colors.chipInk,
            border: "none",
            fontWeight: 700,
            boxShadow: "0 8px 22px rgba(0,0,0,.22)",
            opacity: e.publishing ? 0.6 : 1,
          }}
        >
          {topAction.icon} {topAction.label}
        </button>
      </div>

      {/* Live preview — keyed so each save restarts the trial from the summons. */}
      <CourtOfLove key={e.previewVersion} data={e.displayData} mode="preview" onThemeChange={e.setTheme} />

      <EditSheet
        editMode={e.editMode}
        setEditMode={e.setEditMode}
        mf={e.mf}
        updateMf={e.updateMf}
        errors={e.errors}
        updateQuestion={e.updateQuestion}
        updateOption={e.updateOption}
        pagePassword={e.pagePassword}
        setPagePassword={e.setPagePassword}
        onSave={e.handleSave}
        saving={e.saving}
        story={e.story}
        setStory={e.setStory}
        generating={e.generating}
        generatedLanguage={e.generatedLanguage}
        hasGenerated={e.hasGenerated}
        onGenerate={e.generateFromStory}
        savedStory={e.savedStory}
        savedStoryLabel={e.savedStoryLabel}
      />

      {/* Publishing overlay */}
      <AnimatePresence>
        {e.publishing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] grid place-items-center"
            style={{ background: "rgba(14,14,18,.5)", backdropFilter: "blur(6px)" }}
          >
            <div
              className="flex flex-col items-center gap-3"
              style={{ background: SURFACE, padding: "26px 32px", borderRadius: 28 }}
            >
              <Loader2 size={28} className="animate-spin" style={{ color: INDIGO }} />
              <p style={{ fontFamily: HEAD, fontSize: 14.5, fontWeight: 700, color: TEXT, margin: 0 }}>
                Filing your case…
              </p>
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

export default function CourtOfLovePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", background: "#2a0c07" }} />}>
      <CourtOfLovePageInner />
    </Suspense>
  );
}
