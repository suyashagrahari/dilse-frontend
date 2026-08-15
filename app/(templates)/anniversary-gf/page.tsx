"use client";

import { lazy, Suspense, useState, useCallback, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import AuthModal from "@/components/AuthModal";

import { useAnniversaryEditor } from "./hooks/useAnniversaryEditor";
import CoverTab from "./components/CoverTab";
import AnniversaryNav from "./components/AnniversaryNav";
import FloatingEmojis from "./components/FloatingEmojis";
import ToastStack from "./components/ToastStack";
import EditSheet from "./components/EditSheet";
import PasswordSheet from "./components/PasswordSheet";
import PreviewBar from "./components/PreviewBar";
import PublishingOverlay from "./components/PublishingOverlay";
import AnniversaryWelcomeOverlay from "./components/AnniversaryWelcomeOverlay";
import AnniversaryBackgroundMusic from "./components/AnniversaryBackgroundMusic";

const GamesTab = lazy(() => import("./components/GamesTab"));
const GalleryTab = lazy(() => import("./components/GalleryTab"));
const MusicTab = lazy(() => import("./components/MusicTab"));

function TabFallback() {
  return (
    <div className="h-screen flex items-center justify-center">
      <Loader2 size={28} className="animate-spin text-rose-400" />
    </div>
  );
}

export default function AnniversaryGfPage() {
  const editor = useAnniversaryEditor();
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
    if (editor.tab !== "music") {
      setPlaylistActive(false);
    }
  }, [editor.tab]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-pink-50/40 to-white dark:from-slate-950 dark:via-rose-950/20 dark:to-slate-950 relative overflow-hidden">
      {!welcomed && (
        <AnniversaryWelcomeOverlay
          senderName={editor.content.senderName}
          recipientName={editor.content.recipientName}
          onEnter={handleWelcomeEnter}
        />
      )}

      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src="https://cdn.subhsandesh.in/gifts-media/assets/Aniversary/aniversary.webp"
          alt=""
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority
          style={{ opacity: editor.tab === "cover" ? 0.9 : 0.7 }}
        />
        <div
          className="absolute inset-0 dark:hidden"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0.5) 100%)",
          }}
        />
        <div
          className="absolute inset-0 hidden dark:block"
          style={{
            background:
              "linear-gradient(180deg, rgba(2,6,23,0.4) 0%, rgba(2,6,23,0.6) 50%, rgba(2,6,23,0.4) 100%)",
          }}
        />
      </div>

      <FloatingEmojis />

      <AnimatePresence mode="wait">
        {editor.tab === "cover" && (
          <CoverTab key="cover" data={editor.content} onNext={editor.goToGames} />
        )}
        {editor.tab === "games" && (
          <Suspense key="games-s" fallback={<TabFallback />}>
            <GamesTab key="games" data={editor.content} />
          </Suspense>
        )}
        {editor.tab === "gallery" && (
          <Suspense key="gallery-s" fallback={<TabFallback />}>
            <GalleryTab key="gallery" data={editor.content} />
          </Suspense>
        )}
        {editor.tab === "music" && (
          <Suspense key="music-s" fallback={<TabFallback />}>
            <MusicTab key="music" data={editor.content} onPlayStateChange={handlePlaylistStateChange} />
          </Suspense>
        )}
      </AnimatePresence>

      <AnniversaryNav
        mode="editor"
        tab={editor.tab}
        onTabChange={editor.handleTabChange}
        editActive={!!editor.editMode}
        onEdit={editor.handleEditClick}
        onPublish={editor.handlePublish}
        onShare={editor.handleShare}
        onBack={editor.goBack}
        shareLabel={editor.shareLabel}
        showPublish={editor.showPublish}
        showShare={editor.showShare}
      />

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
        photoInput={editor.photoInput}
        setPhotoInput={editor.setPhotoInput}
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

      <AnniversaryBackgroundMusic shouldPlay={playMusic} paused={playlistActive} />

      <AnimatePresence>
        {editor.showAuth && (
          <AuthModal onClose={editor.closeAuth} onSuccess={editor.closeAuth} />
        )}
      </AnimatePresence>
    </div>
  );
}
