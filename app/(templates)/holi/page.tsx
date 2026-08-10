"use client";

import { lazy, Suspense, useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { ArrowLeft, Sparkles, Send, Share2, Check, Loader2 } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import { ShareSheet } from "@/components/share/ShareSheet";
import PaymentModal from "@/components/PaymentModal";
import { useHoliEditor } from "./hooks/useHoliEditor";

import ColorBlobs from "./components/ColorBlobs";
import ParticleRain from "./components/ParticleRain";
import DesktopSidebar from "./components/DesktopSidebar";
import BottomNav from "./components/BottomNav";
import HomeSection from "./components/HomeSection";
import ToastStack from "./components/ToastStack";
import EditSheet from "./components/EditSheet";
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

      {/* Global background image — hidden on Home tab */}
      {editor.tab !== "home" && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image
            src="/assets/Holi/hero_holi.webp"
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
              background: "var(--holi-nav-bg)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid var(--holi-nav-border)",
              color: "hsl(var(--holi-muted-fg))",
            }}
          >
            <ArrowLeft size={14} />
            {editor.editMode === "preview" ? "Back & Edit" : "Back"}
          </motion.button>
        </div>
      )}

      {/* Floating Create / Save / Publish / Share button — top-right, mobile only */}
      {welcomed && (
        <div className="fixed top-4 right-4 z-50 lg:hidden">
          <AnimatePresence mode="wait">
            {editor.editMode === "preview" ? (
              <motion.button
                key="save"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileTap={{ scale: 0.95 }}
                onClick={editor.handleConfirmSave}
                disabled={editor.saving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-2xl font-bold text-sm shadow-xl disabled:opacity-70"
                style={{ background: "var(--holi-gradient-cta)", color: "#fff" }}
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
                className="flex items-center gap-1.5 px-4 py-2 rounded-2xl font-bold text-sm shadow-xl"
                style={{ background: "var(--holi-gradient-cta)", color: "#fff" }}
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
        isPersonalized={editor.isPersonalized}
        isPreview={editor.editMode === "preview"}
        isEditing={!!editor.editMode && editor.editMode !== "preview"}
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
      <ShareSheet
        open={editor.showShareSheet}
        onClose={editor.closeShareSheet}
        shareUrl={editor.shareUrl}
        text={`${editor.content.senderName || "Someone"} is sending Holi wishes${editor.content.recipientName ? ` to ${editor.content.recipientName}` : ""} on SubhSandesh!`}
        title="Happy Holi"
        cardTitle="Happy Holi"
        cardNote="Scan to open the colours sent your way."
        senderName={editor.content.senderName}
        recipientName={editor.content.recipientName}
        accent="#ec4899"
        slug="holi"
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
        mf={editor.mf}
        manualStep={editor.manualStep}
        setManualStep={editor.setManualStep}
        updateMf={editor.updateMf}
        pagePassword={editor.pagePassword}
        setPagePassword={editor.setPagePassword}
        onStartAi={editor.startAiMode}
        onStartManual={editor.startManualMode}
        onAiGenerate={editor.handleAiGenerate}
        onManualPreview={editor.handleManualPreview}
        onAiEditPreview={editor.handleAiEditPreview}
      />

      <PreviewBar
        visible={false}
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

      {/* Payment modal — shown when user tries to publish without paying */}
      {editor.payment.paymentModal && (
        <PaymentModal
          open={!!editor.payment.paymentModal}
          pricing={editor.payment.paymentModal.pricing}
          paymentStatus={editor.payment.paymentStatus}
          paymentError={editor.payment.paymentError}
          onClose={editor.payment.closePaymentModal}
          onSpendPoints={editor.payment.handleSpendPoints}
          onRazorpay={editor.payment.handleRazorpayPayment}
        />
      )}
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
