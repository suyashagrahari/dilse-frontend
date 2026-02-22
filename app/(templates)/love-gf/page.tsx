"use client";

import { useState, useCallback, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import Image from "next/image";
import AuthModal from "@/components/AuthModal";

import { useLoveEditor } from "./hooks/useLoveEditor";

import FloatingHearts from "./components/FloatingHearts";
import DesktopSidebar from "./components/DesktopSidebar";
import HeroSection from "./components/HeroSection";
import GallerySection from "./components/GallerySection";
import MusicSection from "./components/MusicSection";
import GamesSection from "./components/GamesSection";
import NotesSection from "./components/NotesSection";
import BottomNav from "./components/BottomNav";
import ToastStack from "./components/ToastStack";
import EditSheet from "./components/EditSheet";
import PasswordSheet from "./components/PasswordSheet";
import PreviewBar from "./components/PreviewBar";
import PublishingOverlay from "./components/PublishingOverlay";
import LoveWelcomeOverlay from "./components/LoveWelcomeOverlay";
import LoveBackgroundMusic from "./components/LoveBackgroundMusic";

export default function LoveGfPage() {
  const editor = useLoveEditor();
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
    <div className="h-screen bg-background relative overflow-hidden">
      {!welcomed && (
        <LoveWelcomeOverlay
          senderName={editor.content.senderName}
          recipientName={editor.content.recipientName}
          onEnter={handleWelcomeEnter}
        />
      )}

      {/* Background image on all tabs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src="/assets/hero-bg.jpeg"
          alt=""
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority
          style={{ opacity: editor.tab === "home" ? 0.03 : 0.05 }}
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

      <FloatingHearts />

      <DesktopSidebar
        tab={editor.tab}
        onTabChange={editor.handleTabChange}
        coupleNames={{ person1: editor.content.senderName, person2: editor.content.recipientName }}
        darkMode={editor.darkMode}
        toggleDark={editor.toggleDark}
        onBack={editor.goBack}
      />

      <div className="lg:ml-64 h-full">
        <AnimatePresence mode="wait">
          {editor.tab === "home" && (
            <HeroSection
              key="home"
              data={editor.content}
              onGoGallery={editor.goToGallery}
              onGoNotes={editor.goToNotes}
            />
          )}
          {editor.tab === "gallery" && <GallerySection key="gallery" data={editor.content} />}
          {editor.tab === "music" && <MusicSection key="music" data={editor.content} onPlayStateChange={handlePlaylistStateChange} />}
          {editor.tab === "games" && <GamesSection key="games" data={editor.content} />}
          {editor.tab === "notes" && <NotesSection key="notes" />}
        </AnimatePresence>
      </div>

      <BottomNav
        mode="editor"
        tab={editor.tab}
        onTabChange={editor.handleTabChange}
        onEdit={editor.handleEditClick}
        showPublish={editor.showPublish}
        showShare={editor.showShare}
        shareLabel={editor.shareLabel}
        onPublish={editor.handlePublish}
        onShare={editor.handleShare}
        onBack={editor.goBack}
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

      <LoveBackgroundMusic shouldPlay={playMusic} paused={playlistActive} />

      <AnimatePresence>
        {editor.showAuth && <AuthModal onClose={editor.closeAuth} onSuccess={editor.closeAuth} />}
      </AnimatePresence>
    </div>
  );
}
