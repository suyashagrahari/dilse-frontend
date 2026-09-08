"use client";

import { Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Loader2, PenLine, Send, Share2 } from "lucide-react";

import AuthModal from "@/components/AuthModal";
import StoryStarter from "@/components/story/StoryStarter";
import EditSheet from "./components/EditSheet";
import LoveflixTemplate from "./components/LoveflixTemplate";
import { ACCENT, ACCENT_GRAD, BG, BG_RAISED, FONT_BODY, FONT_DISPLAY, HAIRLINE, TEXT, Z } from "./components/theme";

import { useReducedMotion } from "./components/useReducedMotion";
import { useLoveflixEditor } from "./hooks/useLoveflixEditor";

/* ── Chrome ────────────────────────────────────────────────────────────────────
   The first thing on screen is a black frame with a wordmark landing on it, so
   the editor chrome has to belong to that: dark translucent pills, a hairline
   instead of a shadow, and the accent reserved for the one primary action. Any
   light surface up here would read as a browser toolbar sitting on top of the
   thing instead of a control that is part of it.
─────────────────────────────────────────────────────────────────────────────*/

const PILL_BG = "rgba(18,18,18,0.74)";
const PILL_BORDER = `1px solid ${HAIRLINE}`;

/**
 * The template's own mute control is pinned to the top-right corner, so the bar
 * stops short of the edge rather than stacking on top of it.
 */
const MUTE_GUTTER = 54;

const pillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  minHeight: 44,
  padding: "0 14px",
  borderRadius: 999,
  background: PILL_BG,
  border: PILL_BORDER,
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  color: TEXT,
  fontFamily: FONT_BODY,
  fontSize: 13.5,
  fontWeight: 600,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const primaryStyle: React.CSSProperties = {
  ...pillStyle,
  padding: "0 18px",
  background: ACCENT_GRAD,
  border: "1px solid rgba(0,0,0,0.25)",
  color: "#150d05",
  fontFamily: FONT_DISPLAY,
  fontSize: 15,
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
};

function LoveflixPageInner() {
  const e = useLoveflixEditor();
  const reduced = useReducedMotion();

  // One button, three lives: Create → Publish → Share.
  const topAction = e.showShare
    ? { label: e.shareLabel, onClick: e.handleShare, icon: <Share2 size={15} /> }
    : e.showPublish
      ? { label: e.publishing ? "Publishing…" : "Publish", onClick: e.publish, icon: <Send size={15} /> }
      : { label: "Create", onClick: e.handleEditClick, icon: <PenLine size={15} /> };

  return (
    <div style={{ position: "relative", minHeight: "100dvh", background: BG }}>
      {/* Floating top bar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: Z.brand,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 12px 0",
          paddingTop: "calc(10px + env(safe-area-inset-top, 0px))",
          paddingRight: `calc(${MUTE_GUTTER}px + env(safe-area-inset-right, 0px))`,
          pointerEvents: "none",
        }}
      >
        <button
          type="button"
          onClick={e.goBack}
          style={{ ...pillStyle, paddingLeft: 12, pointerEvents: "auto" }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div style={{ flex: 1 }} />

        {e.isPersonalized && !e.showShare && (
          <button
            type="button"
            onClick={e.handleEditFromPreview}
            style={{ ...pillStyle, pointerEvents: "auto" }}
          >
            <PenLine size={15} /> Edit
          </button>
        )}

        <button
          type="button"
          onClick={topAction.onClick}
          disabled={e.publishing}
          style={{ ...primaryStyle, pointerEvents: "auto", opacity: e.publishing ? 0.65 : 1 }}
        >
          {topAction.icon} {topAction.label}
        </button>
      </div>

      {/* Live preview. Keyed so every save restarts the run from the intro with
          the freshly-written show. */}
      <LoveflixTemplate key={e.previewVersion} data={e.displayData} mode="demo" />

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
        <StoryStarter fill={e.fill} onManual={e.openManualForm} title="Let's write your show" />
      )}

      <AnimatePresence>
        {e.publishing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.1 : 0.2 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 300,
              display: "grid",
              placeItems: "center",
              background: "rgba(0,0,0,0.78)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
            }}
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
                border: PILL_BORDER,
              }}
            >
              <Loader2 size={26} className={reduced ? undefined : "animate-spin"} style={{ color: ACCENT }} />
              <p
                style={{
                  margin: 0,
                  fontFamily: FONT_DISPLAY,
                  fontSize: 16,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: TEXT,
                }}
              >
                Putting it on air…
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth is deferred, not gating: onClose cancels the pending publish,
          onSuccess just closes and the hook's effect resumes it. */}
      <AnimatePresence>
        {e.showAuth && <AuthModal onClose={e.closeAuth} onSuccess={e.closeAuthSuccess} />}
      </AnimatePresence>
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
