"use client";

import { lazy, Suspense, useMemo, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import AuthModal from "@/components/AuthModal";
import { useReceptionEditor } from "./hooks/useReceptionEditor";

import BokehParticles from "./components/BokehParticles";
import DesktopNav from "./components/DesktopNav";
import BottomNav from "./components/BottomNav";
import SplashSection from "./components/SplashSection";
import ToastStack from "./components/ToastStack";
import EditSheet from "./components/EditSheet";
import PasswordSheet from "./components/PasswordSheet";
import PreviewBar from "./components/PreviewBar";
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

      {/* Background image on all tabs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src="/assets/Reception/reception.png"
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
      />

      <BottomNav
        tab={editor.tab}
        onTabChange={editor.handleTabChange}
        onEdit={editor.handleEditClick}
        onBack={editor.goBack}
        showPublish={editor.showPublish}
        showShare={editor.showShare}
        shareLabel={editor.shareLabel}
        onPublish={editor.handlePublish}
        onShare={editor.handleShare}
        darkMode={editor.darkMode}
        toggleDark={editor.toggleDark}
      />

      <div className="h-full overflow-y-auto no-scrollbar pb-24 lg:pb-0">
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
        mf={editor.mf}
        manualStep={editor.manualStep}
        setManualStep={editor.setManualStep}
        updateMf={editor.updateMf}
        onStartAi={editor.startAiMode}
        onStartManual={editor.startManualMode}
        onAiGenerate={editor.handleAiGenerate}
        onManualPreview={editor.handleManualPreview}
      />

      <PasswordSheet
        visible={editor.editMode === "password"}
        saving={editor.saving}
        password={editor.pagePassword}
        setPassword={editor.setPagePassword}
        showValue={editor.showPwValue}
        setShowValue={editor.setShowPwValue}
        onDone={editor.handlePasswordDone}
      />

      <PreviewBar
        visible={editor.editMode === "preview"}
        saving={editor.saving}
        onDiscard={editor.handleDiscardPreview}
        onConfirm={editor.handleConfirmSave}
      />

      <PublishingOverlay visible={editor.publishing} />

      <ReceptionBackgroundMusic shouldPlay={playMusic} />

      <AnimatePresence>
        {editor.showAuth && <AuthModal onClose={editor.closeAuth} onSuccess={editor.closeAuth} />}
      </AnimatePresence>
    </div>
  );
}
