"use client";

import { Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, PenLine, Flag, Share2, Loader2 } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import { useFlagsEditor } from "./hooks/useFlagsEditor";
import FlagsTemplate from "./components/FlagsTemplate";
import EditSheet from "./components/EditSheet";
import StoryStarter from "@/components/story/StoryStarter";
import { pickTheme } from "../_love/theme";
import { DATE_FONT_VARS } from "../date-invitation/components/fonts";
import { FLAGS_THEMES } from "./components/themes";

function FlagsPageInner() {
  const e = useFlagsEditor();
  const t = pickTheme(FLAGS_THEMES, e.displayData.theme);
  const c = t.colors;
  const ACCENT = c.a1;
  // Frosted chrome that sits on whichever theme is showing.
  const chip = {
    background: t.dark ? "rgba(20,14,30,.66)" : "rgba(255,255,255,.86)",
    color: c.ink,
    border: `1px solid ${c.edge}`,
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    fontFamily: "var(--font-di-grotesk), system-ui, sans-serif",
  } as const;

  // One button, three states — exactly the three booleans from the flow contract.
  const topAction = e.showShare
    ? { label: e.shareLabel, onClick: e.handleShare, icon: <Share2 size={14} /> }
    : e.showPublish
      ? { label: e.publishing ? "Publishing…" : "Publish", onClick: e.publish, icon: <Flag size={14} /> }
      : { label: "Create", onClick: e.handleEditClick, icon: <PenLine size={14} /> };

  return (
    <div className={DATE_FONT_VARS} style={{ minHeight: "100dvh", position: "relative", background: c.base }}>
      <div className="fixed top-3 left-0 right-0 z-[120] px-3 flex items-center gap-2" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
        <button
          onClick={e.goBack}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold shadow-sm min-h-[40px]"
          style={chip}
        >
          <ArrowLeft size={15} /> Back
        </button>
        <div className="flex-1" />
        {e.isPersonalized && !e.showShare && (
          <button
            onClick={e.handleEditFromPreview}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold shadow-sm min-h-[40px]"
            style={chip}
          >
            <PenLine size={14} /> Edit
          </button>
        )}
        <button
          onClick={topAction.onClick}
          disabled={e.publishing}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold text-white shadow-md disabled:opacity-60 min-h-[40px]"
          style={{ background: `linear-gradient(115deg, ${c.a1}, ${c.a2} 55%, ${c.a3})`, fontFamily: chip.fontFamily, boxShadow: `0 10px 24px -10px ${c.a1}` }}
        >
          {topAction.icon} {topAction.label}
        </button>
      </div>

      {/* Live preview. Keyed on previewVersion so every save restarts the deck at
          the profile screen — otherwise a save mid-deck leaves the sender looking
          at cards they have just rewritten, still showing the old text. */}
      <FlagsTemplate key={e.previewVersion} data={e.displayData} mode="demo" onThemeChange={e.shareUrl ? undefined : e.setTheme} />

      <EditSheet
        editMode={e.editMode}
        setEditMode={e.setEditMode}
        mf={e.mf}
        updateMf={e.updateMf}
        pagePassword={e.pagePassword}
        setPagePassword={e.setPagePassword}
        onSave={e.handleSave}
        saving={e.saving}
        draftSavedAt={e.draftSavedAt}
      />

      {/* Shown over the gallery the first time Create is tapped, and only when
          the server has a schema for this deck. Every way out of it lands in
          the EditSheet above, fully editable. */}
      {e.storyStarter && (
        <StoryStarter fill={e.fill} onManual={e.openManualForm} title="Let's write your deck" />
      )}

      <AnimatePresence>
        {e.publishing && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] grid place-items-center"
            style={{ background: "rgba(20,20,24,.55)", backdropFilter: "blur(6px)" }}
          >
            <div className="flex flex-col items-center gap-3 px-8 py-6 rounded-3xl bg-white">
              <Loader2 size={28} className="animate-spin" style={{ color: ACCENT }} />
              <p className="font-semibold" style={{ color: ACCENT }}>Putting your profile out there… 🚩</p>
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

export default function FlagsPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", background: "#faf8f4" }} />}>
      <FlagsPageInner />
    </Suspense>
  );
}
