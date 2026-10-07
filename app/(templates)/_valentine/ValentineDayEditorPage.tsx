"use client";

// ─── The editor page shell, shared by all eight days ─────────────────────────
//
// The day's Experience fills the screen in preview mode (keyed on
// previewVersion so every Save restarts it); the only chrome is the floating
// EditorDock (Back · Edit · Create → Publish → Share). Create opens the guided
// AI questions (StoryStarter, mounted after EditSheet), then the form.
// When the recipient has reacted, the owner sees a small "Seen ✓ / Said YES" chip.

import { Suspense, useCallback } from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import AuthModal from "@/components/AuthModal";
import StoryStarter from "@/components/story/StoryStarter";
import EditorDock from "../_love/EditorDock";
import EditSheet from "./EditSheet";
import { getDay } from "./days";
import { getExperience } from "./experiences";
import { FONTS } from "./theme";
import type { DaySlug, ValentineReactions } from "./types";
import { useValentineDayEditor } from "./useValentineDayEditor";

const noopReact = () => {};

function ReactionsChip({ r, asks }: { r: ValentineReactions; asks: boolean }) {
  if (!r.openedAt && !r.answer && !r.completedAt) return null;
  const label = r.answer === "yes" && asks
    ? `Said YES 💍${r.noDodges ? ` · dodged No ×${r.noDodges}` : ""}`
    : r.completedAt
      ? "Seen it all ✓✓"
      : "Seen ✓";
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      role="status"
      style={{ position: "fixed", top: 44, left: "50%", transform: "translateX(-50%)", zIndex: 140, padding: "8px 14px", borderRadius: 99, background: "rgba(255,255,255,.94)", color: "#2a1a22", font: `600 13px ${FONTS.ui}`, boxShadow: "0 10px 30px -12px rgba(0,0,0,.4)", whiteSpace: "nowrap" }}
    >
      {label}
    </motion.div>
  );
}

function Inner({ slug }: { slug: DaySlug }) {
  const e = useValentineDayEditor(slug);
  const day = e.day;
  const Experience = getExperience(slug);

  const topAction = e.showShare
    ? { label: e.shareLabel, onClick: e.handleShare }
    : e.showPublish
      ? { label: e.publishing ? "Publishing…" : "Publish", onClick: e.publish }
      : { label: "Create", onClick: e.handleEditClick };

  const setEditMode = useCallback((m: Parameters<typeof e.setEditMode>[0]) => e.setEditMode(m), [e]);

  return (
    // --vw-dock-space: room under the scene so the floating EditorDock never
    // sits on top of a day's last button or hint (DayRoot pads by it).
    <div style={{ minHeight: "100dvh", position: "relative", background: day.theme.bg, backgroundColor: day.theme.base, ["--vw-dock-space" as string]: "96px" }}>
      <Experience key={e.previewVersion} data={e.displayData} mode="preview" react={noopReact} />

      {e.reactions && <ReactionsChip r={e.reactions} asks={day.asksQuestion} />}

      <EditorDock
        tone={day.theme.dark ? "dark" : "light"}
        accent={`linear-gradient(135deg, ${day.theme.accent}, ${day.theme.accentDeep})`}
        accentInk={day.theme.accentInk}
        font={FONTS.ui}
        onBack={e.goBack}
        secondary={[e.isPersonalized && !e.showShare && { label: "Edit", onClick: e.handleEditFromPreview }]}
        primary={{ ...topAction, disabled: e.publishing }}
      />

      <EditSheet
        day={day}
        editMode={e.editMode}
        setEditMode={setEditMode}
        mf={e.mf}
        updateMf={e.updateMf}
        updateExtra={e.updateExtra}
        pagePassword={e.pagePassword}
        setPagePassword={e.setPagePassword}
        onSave={e.handleSave}
        saving={e.saving}
      />

      {/* Mounted after EditSheet so the sheet sits over the form it seeds. */}
      {e.storyStarter && <StoryStarter guided fill={e.fill} onManual={e.openManualForm} title={day.copy.storyTitle} />}

      <AnimatePresence>
        {e.publishing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] grid place-items-center" style={{ background: "rgba(30,12,24,.5)" }}>
            <div className="flex flex-col items-center gap-3 px-8 py-6 rounded-3xl" style={{ background: "#fff", fontFamily: FONTS.ui }} aria-live="polite">
              <span style={{ fontSize: 34 }} className="animate-bounce" aria-hidden>{day.emoji}</span>
              <p className="font-semibold" style={{ color: "#2a1a22" }}>{day.copy.publishing}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>{e.showAuth && <AuthModal onClose={e.closeAuth} onSuccess={e.closeAuthSuccess} />}</AnimatePresence>
    </div>
  );
}

export default function ValentineDayEditorPage({ slug }: { slug: DaySlug }) {
  const day = getDay(slug);
  return (
    <MotionConfig reducedMotion="user">
      <Suspense fallback={<div style={{ minHeight: "100dvh", background: day.theme.bg }} />}>
        <Inner slug={slug} />
      </Suspense>
    </MotionConfig>
  );
}
