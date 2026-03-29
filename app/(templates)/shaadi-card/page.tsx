"use client";

import { lazy, Suspense, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Sparkles, Send, Share2, Check, Loader2 } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import SocialShareSheet from "@/components/SocialShareSheet";
import { useShaadiCardEditor } from "./hooks/useShaadiCardEditor";

import DesktopSidebar from "./components/DesktopSidebar";
import BottomNav from "./components/BottomNav";
import HomeSection from "./components/HomeSection";
import ToastStack from "./components/ToastStack";
import EditSheet from "./components/EditSheet";
import PublishingOverlay from "./components/PublishingOverlay";

const CoupleSection  = lazy(() => import("./components/CoupleSection"));
const EventsSection  = lazy(() => import("./components/EventsSection"));
const GallerySection = lazy(() => import("./components/GallerySection"));
const WishesSection  = lazy(() => import("./components/WishesSection"));

const C_ACCENT = "#AB1C3E";
const C_MED    = "#CB6B82";

const PAGE_VARIANTS = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.25 } },
} as const;

function TabFallback() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "#FDFBF7" }}
    >
      <div
        className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: C_ACCENT, borderTopColor: "transparent" }}
      />
    </div>
  );
}

function ShaadiCardPage() {
  const editor = useShaadiCardEditor();

  const coupleNames = useMemo(
    () => ({ bride: editor.content.brideName, groom: editor.content.groomName }),
    [editor.content.brideName, editor.content.groomName],
  );

  if (!editor.themeReady) return null;

  return (
    <div
      className="relative overflow-hidden"
      style={{ background: "#FDFBF7", height: "100dvh" }}
    >
      {/* Floating Back button — top-left, mobile only */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          whileTap={{ scale: 0.95 }}
          onClick={editor.editMode === "preview" ? editor.handleDiscardPreview : editor.goBack}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl shadow-xl font-medium text-xs"
          style={{
            background: "rgba(253,245,240,0.92)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: `1px solid ${C_MED}30`,
            color: C_MED,
          }}
        >
          <ArrowLeft size={14} />
          {editor.editMode === "preview" ? "Back & Edit" : "Back"}
        </motion.button>
      </div>

      {/* Floating action button — top-right, mobile only */}
      <div className="fixed top-4 right-4 z-50 lg:hidden">
        <AnimatePresence mode="wait">
          {editor.editMode === "preview" ? (
            <motion.button
              key="save"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileTap={{ scale: 0.95 }}
              onClick={editor.handleConfirmSave as () => void}
              disabled={editor.saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl font-bold text-sm text-white shadow-xl disabled:opacity-70"
              style={{ background: `linear-gradient(135deg, ${C_ACCENT}, ${C_MED})` }}
            >
              {editor.saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {editor.saving ? "Saving…" : "Save"}
            </motion.button>
          ) : !editor.isPersonalized ? (
            <motion.button
              key="create"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileTap={{ scale: 0.95 }}
              onClick={editor.handleEditClick}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl font-bold text-sm text-white shadow-xl"
              style={{ background: `linear-gradient(135deg, ${C_ACCENT}, ${C_MED})` }}
            >
              <Sparkles size={14} />
              Create
            </motion.button>
          ) : !editor.shareUrl ? (
            <motion.button
              key="publish"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileTap={{ scale: 0.95 }}
              onClick={editor.handlePublish}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl font-bold text-sm shadow-xl"
              style={{
                background: "rgba(16,185,129,0.15)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                color: "#10b981",
                border: "1px solid rgba(16,185,129,0.35)",
              }}
            >
              <Send size={14} />
              Publish
            </motion.button>
          ) : (
            <motion.button
              key="share"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileTap={{ scale: 0.95 }}
              onClick={editor.handleShare}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl font-bold text-sm shadow-xl"
              style={{
                background: "rgba(99,102,241,0.15)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                color: "#818cf8",
                border: "1px solid rgba(99,102,241,0.3)",
              }}
            >
              <Share2 size={14} />
              Share
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <DesktopSidebar
        tab={editor.tab}
        onTabChange={editor.handleTabChange}
        coupleNames={coupleNames}
        onBack={editor.goBack}
        onEdit={editor.handleEditClick}
        showPublish={editor.showPublish}
        showShare={editor.showShare}
        shareLabel={editor.shareLabel}
        onPublish={editor.handlePublish}
        onShare={editor.handleShare}
      />

      <BottomNav
        tab={editor.tab}
        onTabChange={editor.handleTabChange}
        onEdit={editor.handleEditClick}
        onBack={editor.goBack}
        isPersonalized={editor.isPersonalized}
        isPreview={editor.editMode === "preview"}
      />

      <PublishingOverlay visible={editor.publishing} />

      <div className="lg:ml-64 h-full overflow-y-auto no-scrollbar">
        <AnimatePresence mode="wait">
          {editor.tab === "home" && (
            /* Home tab: no bottom padding — card fills to nav via its own height calc */
            <motion.div key="home" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
              <HomeSection data={editor.content} />
            </motion.div>
          )}

          {editor.tab === "couple" && (
            <motion.div key="couple" className="pb-0 lg:pb-0" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
              <Suspense fallback={<TabFallback />}>
                <CoupleSection data={editor.content} />
              </Suspense>
            </motion.div>
          )}

          {editor.tab === "events" && (
            <motion.div key="events" className="pb-20 lg:pb-0" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
              <Suspense fallback={<TabFallback />}>
                <EventsSection data={editor.content} />
              </Suspense>
            </motion.div>
          )}

          {editor.tab === "gallery" && (
            <motion.div key="gallery" className="pb-20 lg:pb-0" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
              <Suspense fallback={<TabFallback />}>
                <GallerySection data={editor.content} />
              </Suspense>
            </motion.div>
          )}

          {editor.tab === "blessings" && (
            <motion.div key="blessings" className="pb-20 lg:pb-0" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
              <Suspense fallback={<TabFallback />}>
                <WishesSection data={editor.content} />
              </Suspense>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ToastStack toasts={editor.toasts} onDismiss={editor.dismissToast} onCopy={editor.handleCopy} />
      <SocialShareSheet
        open={editor.showShareSheet}
        onClose={editor.closeShareSheet}
        shareUrl={editor.shareUrl}
        onCopy={editor.handleCopy}
        shareMessage={`${editor.content.brideName || "Bride"} & ${editor.content.groomName || "Groom"} invite you to their wedding celebration on SubhSandesh!`}
      />

      <EditSheet
        editMode={editor.editMode}
        setEditMode={editor.setEditMode}
        aiName={editor.aiName}
        setAiName={editor.setAiName}
        aiSender={editor.aiSender}
        setAiSender={editor.setAiSender}
        aiPrompt={editor.aiPrompt}
        setAiPrompt={editor.setAiPrompt}
        aiLoading={editor.aiLoading}
        extractLoading={editor.extractLoading}
        mf={editor.mf}
        manualStep={editor.manualStep}
        setManualStep={editor.setManualStep}
        updateMf={editor.updateMf}
        pagePassword={editor.pagePassword}
        setPagePassword={editor.setPagePassword}
        onStartAi={editor.startAiMode}
        onStartManual={editor.startManualMode}
        onCardExtract={editor.handleCardExtract}
        onAiGenerate={editor.handleAiGenerate}
        onAiEditPreview={editor.handleAiEditPreview}
        onManualPreview={editor.handleManualPreview}
      />

      <AnimatePresence>
        {editor.showAuth && <AuthModal onClose={editor.closeAuth} onSuccess={editor.closeAuthSuccess} />}
      </AnimatePresence>
    </div>
  );
}

export default function ShaadiCardPageWrapper() {
  return (
    <Suspense>
      <ShaadiCardPage />
    </Suspense>
  );
}
