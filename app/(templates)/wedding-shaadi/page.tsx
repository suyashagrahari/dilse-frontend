"use client";

import { lazy, Suspense, useMemo, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { ArrowLeft, Sparkles, Send, Share2 } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import SocialShareSheet from "@/components/SocialShareSheet";
import { useWeddingEditor } from "./hooks/useWeddingEditor";

import GoldenParticles from "./components/GoldenParticles";
import DesktopSidebar from "./components/DesktopSidebar";
import BottomNav from "./components/BottomNav";
import CoverSection from "./components/CoverSection";
import ToastStack from "./components/ToastStack";
import EditSheet from "./components/EditSheet";
import PublishingOverlay from "./components/PublishingOverlay";
import WeddingWelcomeOverlay from "./components/WeddingWelcomeOverlay";
import WeddingBackgroundMusic from "./components/WeddingBackgroundMusic";

const CoupleSection = lazy(() => import("./components/CoupleSection"));
const EventsSection = lazy(() => import("./components/EventsSection"));
const GallerySection = lazy(() => import("./components/GallerySection"));
const WishesSection = lazy(() => import("./components/WishesSection"));

const PAGE_VARIANTS = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.25 } },
} as const;

function TabFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div
        className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: "var(--wed-accent-gold)", borderTopColor: "transparent" }}
      />
    </div>
  );
}

function WeddingShadiPage() {
  const editor = useWeddingEditor();
  const isPreview = editor.editMode === "preview";
  const [welcomed, setWelcomed] = useState(false);
  const [playMusic, setPlayMusic] = useState(false);

  const handleWelcomeEnter = useCallback((withMusic: boolean) => {
    setPlayMusic(withMusic);
    setWelcomed(true);
  }, []);

  const coupleNames = useMemo(
    () => ({ bride: editor.content.brideName, groom: editor.content.groomName }),
    [editor.content.brideName, editor.content.groomName],
  );

  if (!editor.themeReady) return null;

  return (
    <div
      className="h-screen relative overflow-hidden"
      style={{ background: "hsl(var(--wed-bg))", color: "hsl(var(--wed-fg))" }}
    >
      {!welcomed && (
        <WeddingWelcomeOverlay
          brideName={editor.content.brideName}
          groomName={editor.content.groomName}
          onEnter={handleWelcomeEnter}
        />
      )}

      {/* Floating Back button — top-left, mobile only */}
      {welcomed && (
        <div className="fixed top-4 left-4 z-50 lg:hidden">
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            whileTap={{ scale: 0.95 }}
            onClick={editor.editMode === "preview" ? editor.handleDiscardPreview : editor.goBack}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl shadow-xl font-medium text-xs"
            style={{
              background: "var(--wed-glass-strong)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid var(--wed-glass-border)",
              color: "hsl(var(--wed-muted-fg))",
            }}
          >
            <ArrowLeft size={14} />
            {editor.editMode === "preview" ? "Back & Edit" : "Back"}
          </motion.button>
        </div>
      )}

      {/* Floating Create / Edit+Publish / Share button — top-right, mobile only */}
      {welcomed && (
        <div className="fixed top-4 right-4 z-50 lg:hidden">
          <AnimatePresence mode="wait">
            {isPreview ? (
              <motion.div
                key="preview-actions"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <button
                  onClick={editor.handleEditFromPreview}
                  style={{
                    background: "var(--wed-glass-strong)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    border: "1px solid var(--wed-glass-border)",
                    color: "hsl(var(--wed-fg))",
                    borderRadius: 20,
                    padding: "7px 14px",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  ✦ Edit
                </button>
                <button
                  onClick={editor.handlePublish}
                  disabled={editor.publishing}
                  style={{
                    background: "var(--wed-gradient-gold)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 20,
                    padding: "7px 14px",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 18px var(--wed-gold-glow)",
                    opacity: editor.publishing ? 0.7 : 1,
                  }}
                >
                  {editor.publishing ? "Publishing…" : "🎊 Publish"}
                </button>
              </motion.div>
            ) : !editor.isPersonalized ? (
              <motion.button
                key="create"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileTap={{ scale: 0.95 }}
                onClick={editor.handleEditClick}
                className="flex items-center gap-1.5 px-4 py-2 rounded-2xl font-bold text-sm text-white shadow-xl"
                style={{
                  background: "var(--wed-gradient-gold)",
                  boxShadow: "0 4px 18px var(--wed-gold-glow)",
                }}
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
      )}

      {/* Background image on all tabs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src="/assets/marriage/weeding.png"
          alt=""
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority
          style={{ opacity: editor.tab === "home" ? 0.04 : 0.06 }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, hsl(var(--wed-bg) / 0.4) 0%, hsl(var(--wed-bg) / 0.6) 40%, hsl(var(--wed-bg) / 0.5) 70%, hsl(var(--wed-bg) / 0.4) 100%)",
          }}
        />
      </div>

      <GoldenParticles />

      <DesktopSidebar
        tab={editor.tab}
        onTabChange={editor.handleTabChange}
        coupleNames={coupleNames}
        darkMode={editor.darkMode}
        toggleDark={editor.toggleDark}
        onBack={editor.goBack}
        onEdit={isPreview ? editor.handleEditFromPreview : editor.handleEditClick}
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

      <div className="lg:ml-64 h-full overflow-y-auto no-scrollbar pb-20 lg:pb-0">
        <AnimatePresence mode="wait">
          {editor.tab === "home" && (
            <motion.div key="home" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
              <CoverSection data={editor.content} />
            </motion.div>
          )}

          {editor.tab === "couple" && (
            <motion.div key="couple" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
              <Suspense fallback={<TabFallback />}>
                <CoupleSection data={editor.content} />
              </Suspense>
            </motion.div>
          )}

          {editor.tab === "events" && (
            <motion.div key="events" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
              <Suspense fallback={<TabFallback />}>
                <EventsSection data={editor.content} />
              </Suspense>
            </motion.div>
          )}

          {editor.tab === "gallery" && (
            <motion.div key="gallery" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
              <Suspense fallback={<TabFallback />}>
                <GallerySection data={editor.content} />
              </Suspense>
            </motion.div>
          )}

          {editor.tab === "blessings" && (
            <motion.div key="blessings" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
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
        setEditMode={editor.setEditModeFromSheet}
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

      <PublishingOverlay visible={editor.publishing} />

      <WeddingBackgroundMusic shouldPlay={playMusic} />

      <AnimatePresence>
        {editor.showAuth && <AuthModal onClose={editor.closeAuth} onSuccess={editor.closeAuthSuccess} />}
      </AnimatePresence>
    </div>
  );
}

export default function WeddingShadiPageWrapper() {
  return (
    <Suspense>
      <WeddingShadiPage />
    </Suspense>
  );
}
