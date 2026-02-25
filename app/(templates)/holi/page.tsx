"use client";

import { lazy, Suspense, useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import AuthModal from "@/components/AuthModal";
import { useHoliEditor } from "./hooks/useHoliEditor";

import ColorBlobs from "./components/ColorBlobs";
import ParticleRain from "./components/ParticleRain";
import DesktopSidebar from "./components/DesktopSidebar";
import BottomNav from "./components/BottomNav";
import HomeSection from "./components/HomeSection";
import ToastStack from "./components/ToastStack";
import EditSheet from "./components/EditSheet";
import PasswordSheet from "./components/PasswordSheet";
import PreviewBar from "./components/PreviewBar";
import PublishingOverlay from "./components/PublishingOverlay";
import BackgroundMusic from "./components/BackgroundMusic";
import WelcomeOverlay from "./components/WelcomeOverlay";

const WishSection = lazy(() => import("./components/WishSection"));
const GreetingsSection = lazy(() => import("./components/GreetingsSection"));
const PlaylistSection = lazy(() => import("./components/PlaylistSection"));
const MoreSection = lazy(() => import("./components/MoreSection"));

const PAGE_VARIANTS = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -15, transition: { duration: 0.3 } },
} as const;

function TabFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div
        className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: "var(--holi-pink)", borderTopColor: "transparent" }}
      />
    </div>
  );
}

function HoliPage() {
  const editor = useHoliEditor();
  const [welcomed, setWelcomed] = useState(false);
  const [playMusic, setPlayMusic] = useState(false);
  const [playlistActive, setPlaylistActive] = useState(false);

  const handleWelcomeEnter = useCallback((withMusic: boolean) => {
    setPlayMusic(withMusic);
    setWelcomed(true);
  }, []);

  const handlePlaylistStateChange = useCallback((isPlaying: boolean) => {
    setPlaylistActive(isPlaying);
  }, []);

  useEffect(() => {
    if (editor.tab !== "playlist") {
      setPlaylistActive(false);
    }
  }, [editor.tab]);

  if (!editor.themeReady) return null;

  return (
    <div
      className="h-screen relative overflow-hidden"
      style={{ background: "hsl(var(--holi-bg))", color: "hsl(var(--holi-fg))" }}
    >
      {!welcomed && (
        <WelcomeOverlay
          senderName={editor.content.senderName}
          recipientName={editor.content.recipientName}
          onEnter={handleWelcomeEnter}
        />
      )}
      {/* Global background image — hidden on Home tab (Home has its own hero) */}
      {editor.tab !== "home" && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image
            src="/assets/Holi/hero_holi.png"
            alt=""
            fill
            className="object-cover object-center"
            sizes="100vw"
            priority
            style={{ opacity: 0.08 }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, hsl(var(--holi-bg) / 0.4) 0%, hsl(var(--holi-bg) / 0.65) 40%, hsl(var(--holi-bg) / 0.5) 70%, hsl(var(--holi-bg) / 0.4) 100%)",
            }}
          />
        </div>
      )}

      <ColorBlobs count={5} />
      <ParticleRain count={7} />

      <DesktopSidebar
        tab={editor.tab}
        onTabChange={editor.handleTabChange}
        darkMode={editor.darkMode}
        toggleDark={editor.toggleDark}
        onEdit={editor.handleEditClick}
        onBack={editor.goBack}
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
        showPublish={editor.showPublish}
        showShare={editor.showShare}
        shareLabel={editor.shareLabel}
        onPublish={editor.handlePublish}
        onShare={editor.handleShare}
        darkMode={editor.darkMode}
        toggleDark={editor.toggleDark}
      />

      <main className="h-full overflow-y-auto no-scrollbar pb-24 lg:pb-0 lg:ml-56">
        <AnimatePresence mode="wait">
          {editor.tab === "home" && (
            <motion.div key="home" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
              <HomeSection data={editor.content} />
            </motion.div>
          )}

          {editor.tab === "wish" && (
            <motion.div key="wish" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
              <Suspense fallback={<TabFallback />}>
                <WishSection data={editor.content} onGoGreetings={() => editor.handleTabChange("greetings")} />
              </Suspense>
            </motion.div>
          )}

          {editor.tab === "greetings" && (
            <motion.div key="greetings" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
              <Suspense fallback={<TabFallback />}>
                <GreetingsSection data={editor.content} />
              </Suspense>
            </motion.div>
          )}

          {editor.tab === "playlist" && (
            <motion.div key="playlist" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
              <Suspense fallback={<TabFallback />}>
                <PlaylistSection data={editor.content} onPlayStateChange={handlePlaylistStateChange} />
              </Suspense>
            </motion.div>
          )}

          {editor.tab === "more" && (
            <motion.div key="more" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
              <Suspense fallback={<TabFallback />}>
                <MoreSection data={editor.content} />
              </Suspense>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

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

      <BackgroundMusic shouldPlay={playMusic} paused={playlistActive} />

      <AnimatePresence>
        {editor.showAuth && (
          <AuthModal
            onClose={editor.closeAuth}
            onSuccess={editor.closeAuthSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HoliPageWrapper() {
  return (
    <Suspense>
      <HoliPage />
    </Suspense>
  );
}
