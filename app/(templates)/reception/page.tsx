"use client";

import { lazy, Suspense, useMemo, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { ArrowLeft, Sparkles, Share2 } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import { ShareSheet } from "@/components/share/ShareSheet";
import { useReceptionEditor } from "./hooks/useReceptionEditor";

import BokehParticles from "./components/BokehParticles";
import DesktopNav from "./components/DesktopNav";
import DesktopRightPanel from "./components/DesktopRightPanel";
import BottomNav from "./components/BottomNav";
import SplashSection from "./components/SplashSection";
import ToastStack from "./components/ToastStack";
import EditSheet from "./components/EditSheet";
import PublishingOverlay from "./components/PublishingOverlay";
import ReceptionWelcomeOverlay from "./components/ReceptionWelcomeOverlay";
import ReceptionBackgroundMusic from "./components/ReceptionBackgroundMusic";

const CoupleReveal = lazy(() => import("./components/CoupleReveal"));
const GallerySection = lazy(() => import("./components/GallerySection"));
const LocationSection = lazy(() => import("./components/LocationSection"));
const BlessingsSection = lazy(() => import("./components/BlessingsSection"));

const PAGE_VARIANTS = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -15, transition: { duration: 0.3 } },
} as const;

function TabFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div
        className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: "var(--rec-accent)", borderTopColor: "transparent" }}
      />
    </div>
  );
}

export default function ReceptionPage() {
  const editor = useReceptionEditor();
  const [welcomed, setWelcomed] = useState(false);
  const [playMusic, setPlayMusic] = useState(false);

  const handleWelcomeEnter = useCallback((withMusic: boolean) => {
    setPlayMusic(withMusic);
    setWelcomed(true);
  }, []);

  const isPreview = editor.editMode === "preview";

  const coupleNames = useMemo(
    () => ({ bride: editor.content.brideName, groom: editor.content.groomName }),
    [editor.content.brideName, editor.content.groomName],
  );

  if (!editor.themeReady) return null;

  return (
    <div
      className="h-screen relative overflow-hidden"
      style={{ background: "hsl(var(--rec-bg))", color: "hsl(var(--rec-fg))" }}
    >
      {!welcomed && (
        <ReceptionWelcomeOverlay
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
              background: "var(--rec-nav-bg)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid var(--rec-nav-border)",
              color: "hsl(var(--rec-muted-fg))",
            }}
          >
            <ArrowLeft size={14} />
            {editor.editMode === "preview" ? "Back & Edit" : "Back"}
          </motion.button>
        </div>
      )}

      {/* Floating action button(s) — top-right, mobile only */}
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
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    color: "#fff",
                    borderRadius: 20,
                    padding: "6px 14px",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  ✦ Edit
                </button>
                <button
                  onClick={editor.handlePublish}
                  disabled={editor.publishing}
                  style={{
                    background: "linear-gradient(135deg, #C9A84C, #E8D5A3, #C9A84C)",
                    color: "#080808",
                    border: "none",
                    borderRadius: 20,
                    padding: "6px 14px",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: editor.publishing ? "not-allowed" : "pointer",
                    opacity: editor.publishing ? 0.7 : 1,
                  }}
                >
                  {editor.publishing ? "Publishing…" : "🥂 Publish"}
                </button>
              </motion.div>
            ) : editor.showShare ? (
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
            ) : (
              <motion.button
                key="create"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileTap={{ scale: 0.95 }}
                onClick={editor.handleEditClick}
                className="flex items-center gap-1.5 px-4 py-2 rounded-2xl font-bold text-sm shadow-xl"
                style={{ background: "linear-gradient(135deg, #C9A84C, #E8D5A3, #C9A84C)", color: "#080808" }}
              >
                <Sparkles size={14} />
                {editor.isPersonalized ? "Edit" : "Create"}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Background image */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src="https://cdn.subhsandesh.in/gifts-media/assets/Reception/reception.webp"
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
              "linear-gradient(180deg, hsl(var(--rec-bg) / 0.4) 0%, hsl(var(--rec-bg) / 0.6) 40%, hsl(var(--rec-bg) / 0.5) 70%, hsl(var(--rec-bg) / 0.4) 100%)",
          }}
        />
      </div>

      <BokehParticles />

      <DesktopNav
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

      <DesktopRightPanel
        content={editor.content}
        shareUrl={editor.shareUrl}
        isPersonalized={editor.isPersonalized}
      />

      <BottomNav
        tab={editor.tab}
        onTabChange={editor.handleTabChange}
        onEdit={editor.handleEditClick}
        isPersonalized={editor.isPersonalized}
        isPreview={editor.editMode === "preview"}
      />

      <div className="lg:ml-64 xl:mr-72 h-full overflow-y-auto no-scrollbar pb-20 lg:pb-0">
        <AnimatePresence mode="wait">
          {editor.tab === "home" && (
            <motion.div key="home" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
              <SplashSection data={editor.content} />
            </motion.div>
          )}

          {editor.tab === "couple" && (
            <motion.div key="couple" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
              <Suspense fallback={<TabFallback />}>
                <CoupleReveal data={editor.content} />
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

          {editor.tab === "location" && (
            <motion.div key="location" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
              <Suspense fallback={<TabFallback />}>
                <LocationSection data={editor.content} />
              </Suspense>
            </motion.div>
          )}

          {editor.tab === "blessings" && (
            <motion.div key="blessings" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
              <Suspense fallback={<TabFallback />}>
                <BlessingsSection data={editor.content} />
              </Suspense>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ToastStack toasts={editor.toasts} onDismiss={editor.dismissToast} onCopy={editor.handleCopy} />
      <ShareSheet
        open={editor.showShareSheet}
        onClose={editor.closeShareSheet}
        shareUrl={editor.shareUrl}
        text={`${editor.content.brideName || "Bride"} & ${editor.content.groomName || "Groom"} warmly invite you to their reception on SubhSandesh!`}
        title="Reception Invitation"
        cardTitle="You are invited to our reception"
        cardNote="Scan for the venue, the timings and the evening's programme."
        senderName={`${editor.content.brideName || "Bride"} & ${editor.content.groomName || "Groom"}`}
        accent="#e11d48"
        slug="reception"
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
        onStartAiText={editor.startAiTextMode}
        onStartAiCard={editor.startAiCardMode}
        onStartManual={editor.startManualMode}
        onCardExtract={editor.handleCardExtract}
        onAiGenerate={editor.handleAiGenerate}
        onAiEditPreview={editor.handleAiEditPreview}
        onManualPreview={editor.handleManualPreview}
      />

      <PublishingOverlay visible={editor.publishing} />

      <ReceptionBackgroundMusic shouldPlay={playMusic} />

      <AnimatePresence>
        {editor.showAuth && (
          <AuthModal onClose={editor.closeAuth} onSuccess={editor.closeAuthSuccess} />
        )}
      </AnimatePresence>
    </div>
  );
}
