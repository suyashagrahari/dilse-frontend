"use client";

// ─── The editor page shell, shared by every day on the engine ────────────────
//
// The day's Experience fills the screen in preview mode (keyed on
// previewVersion so every Save restarts it); the only chrome is the floating
// EditorDock (Back · Edit · Create → Publish → Share). Create opens the guided
// AI questions (StoryStarter, mounted after EditSheet), then the form.
// When the recipient has reacted, the owner sees a small "Seen ✓ / Said YES" chip.

import { Suspense, useCallback, useState } from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import AuthModal from "@/components/AuthModal";
import StoryStarter from "@/components/story/StoryStarter";
import EditorDock from "../_love/EditorDock";
import PremiumTopBar from "./kit/premium/PremiumTopBar";
import EditSheet from "./EditSheet";
import { DayMusicProvider, chipThemeFrom } from "./music/DayMusic";
import { getDay } from "./days";
import { getExperience } from "./experiences";
import { FONTS } from "./theme";
import type { DaySlug, ValentineReactions } from "./types";
import { useValentineDayEditor } from "./useValentineDayEditor";
import { answeredWhen } from "./kit/answer";

const noopReact = () => {};

function ReactionsChip({ r, asks, yes = "Said YES 💍" }: { r: ValentineReactions; asks: boolean; yes?: string }) {
  const [open, setOpen] = useState(false);
  if (!r.openedAt && !r.answer && !r.completedAt && !r.reply) return null;
  // ✦ Premium: the recipient wrote back — the chip opens to show it.
  if (r.reply) {
    return (
      <motion.button
        type="button"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        style={{ position: "fixed", top: 44, left: "50%", transform: "translateX(-50%)", zIndex: 140, maxWidth: "min(92vw, 420px)", padding: open ? "12px 16px" : "8px 14px", borderRadius: open ? 18 : 99, border: "1.5px solid #e2b44a", background: "rgba(255,250,240,.97)", color: "#2a1a22", font: `600 13px ${FONTS.ui}`, boxShadow: "0 10px 30px -12px rgba(0,0,0,.4)", textAlign: "left", cursor: "pointer", whiteSpace: open ? "pre-wrap" : "nowrap" }}
      >
        {open ? <>They wrote back ✦<br /><span style={{ fontWeight: 500, fontSize: 15 }}>{r.reply.text}</span></> : "They wrote back ✦ · tap to read"}
      </motion.button>
    );
  }
  const label = r.answer === "no" && asks
    ? `Said no 💔${answeredWhen(r.answeredAt) ? ` · ${answeredWhen(r.answeredAt)}` : ""}`
    : r.answer === "yes" && asks
    ? `${yes}${r.noDodges ? ` · dodged No ×${r.noDodges}` : ""}${answeredWhen(r.answeredAt) ? ` · ${answeredWhen(r.answeredAt)}` : ""}`
    : r.completedAt
      ? "Seen it all ✓✓"
      : "Seen ✓";
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      role="status"
      data-owner-answer={r.answer ?? undefined}
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
  // Premium days, and $2 days that opt in (DayConfig.topBar), get the top-right bar.
  const topBar = !!day.premium || !!day.topBar;

  return (
    // --vw-dock-space: room under the scene so the floating EditorDock never
    // sits on top of a day's last button or hint (DayRoot pads by it).
    // ✦ Premium days (and `topBar` days) have no bottom dock: their controls sit
    // top-right (PremiumTopBar), so the bottom of the screen belongs to the scene.
    <div style={{ minHeight: "100dvh", position: "relative", background: day.theme.bg, backgroundColor: day.theme.base, ["--vw-dock-space" as string]: topBar ? "0px" : "96px", ["--vw-top-space" as string]: topBar ? "60px" : "0px" }}>
      {/* The sender's music plays in the preview too (and from the form's
          Listen button). It waits for a tap until they've saved once, so the
          demo stays quiet while they look around — except a template's own
          track ("track" mode), which is part of the demo and starts on the
          first tap like on the live page ($2 days; a premium gate starts it). */}
      <DayMusicProvider
        settings={e.displayData}
        melody={day.melody}
        autoStart={(e.isPersonalized || (!day.premium && e.displayData.musicMode === "track")) && e.editMode !== "manual"}
        dark={day.theme.dark}
        overSheet={e.editMode === "manual"}
        dockBase={topBar ? "0px" : "96px"}
        audioOnly={!!day.music?.audioOnly}
        songs={day.music?.suggestions}
        chip={day.premium ? chipThemeFrom(day.theme, day.emoji) : undefined}
        track={day.music?.track}
        compact={!!day.music?.compact} volume={day.music?.volume}
      >
      <Experience key={e.previewVersion} data={e.displayData} mode="preview" react={noopReact} />

      {e.reactions && <ReactionsChip r={e.reactions} asks={day.asksQuestion} yes={day.copy.yesChip} />}

      {topBar ? (
        <PremiumTopBar
          dark={!!day.theme.dark}
          accent={`linear-gradient(135deg, ${day.theme.accent}, ${day.theme.accentDeep})`}
          accentInk={day.theme.accentInk}
          font={FONTS.ui}
          onBack={e.goBack}
          secondary={[e.isPersonalized && !e.showShare && { label: "Edit", onClick: e.handleEditFromPreview }]}
          primary={{ ...topAction, disabled: e.publishing }}
        />
      ) : (
      <EditorDock
        tone={day.theme.dark ? "dark" : "light"}
        accent={`linear-gradient(135deg, ${day.theme.accent}, ${day.theme.accentDeep})`}
        accentInk={day.theme.accentInk}
        font={FONTS.ui}
        onBack={e.goBack}
        secondary={[e.isPersonalized && !e.showShare && { label: "Edit", onClick: e.handleEditFromPreview }]}
        primary={{ ...topAction, disabled: e.publishing }}
      />
      )}

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
        onDiscard={e.discardEdits}
        saving={e.saving}
        ai={{ available: e.aiAvailable, onOpen: e.openAiFromForm, fill: e.fill }}
      />
      </DayMusicProvider>

      {/* Mounted after EditSheet (and above it: z 200 > 190) so the AI
          questions sit over the form they fill. */}
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
