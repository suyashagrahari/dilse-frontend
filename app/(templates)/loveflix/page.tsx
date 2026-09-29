"use client";

import { Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, PenLine, Send, Share2 } from "lucide-react";

import AuthModal from "@/components/AuthModal";
import StoryStarter from "@/components/story/StoryStarter";
import EditSheet from "./components/EditSheet";
import EditorDock from "../_love/EditorDock";
import LoveflixTemplate from "./components/LoveflixTemplate";
import { ACCENT, BG, BG_RAISED, FONT_BODY, FONT_DISPLAY, HAIRLINE, TEXT } from "./components/theme";
import { useReducedMotion } from "./components/useReducedMotion";
import { useLoveflixEditor } from "./hooks/useLoveflixEditor";

/* ── Editor chrome ─────────────────────────────────────────────────────────────
   None reserved: the app starts at the very top edge and keeps its own nav,
   billboard and tab bar exactly where the real thing has them. The editor
   controls float in one EditorDock, clear of the phone tab bar.
─────────────────────────────────────────────────────────────────────────────*/

function LoveflixPageInner() {
  const e = useLoveflixEditor();
  const reduced = useReducedMotion();

  // One button, three lives: Create → Publish → Share.
  const topAction = e.showShare
    ? { label: e.shareLabel, onClick: e.handleShare, icon: <Share2 size={15} /> }
    : e.showPublish
      ? { label: e.publishing ? "Publishing…" : "Publish", onClick: e.publish, icon: <Send size={15} /> }
      : { label: "Create yours", onClick: e.handleEditClick, icon: <PenLine size={15} /> };

  return (
    <div style={{ position: "relative", minHeight: "100dvh", background: BG }}>
      {/* Live preview. Keyed so every save restarts the run from the profile picker. */}
      <LoveflixTemplate key={e.previewVersion} data={e.displayData} mode="demo" />

      <EditorDock
        tone="dark"
        accent={ACCENT}
        font={FONT_BODY}
        avoidBottom=".lf-tabs"
        onBack={e.goBack}
        secondary={[
          e.isPersonalized && !e.showShare && { label: "Edit", onClick: e.handleEditFromPreview, icon: <PenLine size={15} /> },
        ]}
        primary={{ ...topAction, disabled: e.publishing }}
      />

      <EditSheet
        editMode={e.editMode}
        setEditMode={e.setEditMode}
        isPersonalized={e.isPersonalized}
        mf={e.mf}
        updateMf={e.updateMf}
        pagePassword={e.pagePassword}
        setPagePassword={e.setPagePassword}
        onSave={e.handleSave}
      />

      {/* Shown the first time Create is tapped, and only when the server has a
          schema for this template. Every way out lands in the EditSheet. */}
      {e.storyStarter && <StoryStarter guided fill={e.fill} onManual={e.openManualForm} title="Let's write your show" />}

      <AnimatePresence>
        {e.publishing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.1 : 0.2 }}
            style={{ position: "fixed", inset: 0, zIndex: 300, display: "grid", placeItems: "center", background: "rgba(0,0,0,0.8)" }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
                padding: "26px 30px",
                borderRadius: 14,
                background: BG_RAISED,
                border: `1px solid ${HAIRLINE}`,
              }}
            >
              <Loader2 size={26} className={reduced ? undefined : "animate-spin"} style={{ color: ACCENT }} />
              <p style={{ margin: 0, fontFamily: FONT_DISPLAY, fontSize: 16, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: TEXT }}>
                Putting it on air…
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth is deferred, not gating: onClose cancels the pending publish,
          onSuccess just closes and the hook's effect resumes it. */}
      <AnimatePresence>{e.showAuth && <AuthModal onClose={e.closeAuth} onSuccess={e.closeAuthSuccess} />}</AnimatePresence>
    </div>
  );
}

export default function LoveflixPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", background: BG }} />}>
      <LoveflixPageInner />
    </Suspense>
  );
}
