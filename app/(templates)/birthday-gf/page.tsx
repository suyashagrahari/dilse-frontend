"use client";

import { Suspense, lazy, useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import AuthModal from "@/components/AuthModal";
import PremiumUpgradeModal from "@/components/upgrade/PremiumUpgradeModal";

import { useBirthdayEditor } from "./hooks/useBirthdayEditor";

import HomeSection from "./components/HomeSection";
import BottomNav from "./components/BottomNav";
import DesktopSidebar from "./components/DesktopSidebar";
import EditSheet from "./components/EditSheet";
import PublishSheet from "./components/PublishSheet";
import PublishingOverlay from "./components/PublishingOverlay";
import BirthdayBgMusic from "./components/BirthdayBgMusic";

const GallerySection  = lazy(() => import("./components/GallerySection"));
const SongsSection    = lazy(() => import("./components/SongsSection"));
const GamesSection    = lazy(() => import("./components/GamesSection"));
const SurpriseSection = lazy(() => import("./components/SurpriseSection"));

const SCRIPT = "'Great Vibes', cursive";
const SERIF = "'Cormorant Garamond', Georgia, serif";
const DARK_BROWN = "#5D3F31";
const COPPER = "#AD684A";

function ScrapbookBg({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ height: "100%", width: "100%" }}>
      {children}
    </div>
  );
}

function SectionLoader() {
  return (
    <div style={{ minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F5EDE0" }}>
      <p style={{ fontFamily: SCRIPT, fontSize: 20, color: "#5D3F31", opacity: 0.6 }}>loading...</p>
    </div>
  );
}

function BirthdayGfPageInner() {
  const editor = useBirthdayEditor();
  const [songPlaying, setSongPlaying] = useState(false);
  const handleSongPlayingChange = useCallback((v: boolean) => setSongPlaying(v), []);
  const [recordingActive, setRecordingActive] = useState(false);
  const handleRecordingChange = useCallback((v: boolean) => setRecordingActive(v), []);

  const topAction = editor.showShare
    ? { label: "Share", onClick: editor.handleShare }
    : editor.showPublish
      ? { label: "Publish", onClick: editor.handlePublish }
      : { label: "Create", onClick: editor.handleEditClick };

  return (
    <div
      style={{
        minHeight: "100dvh",
        width: "100%",
        overflow: "hidden",
        position: "relative",
        background: "#F5EDE0",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Cormorant+Garamond:ital,wght@0,400;1,400;1,500&display=swap');
        body, html { margin: 0; padding: 0; background: #F5EDE0; }
        * { box-sizing: border-box; }
        @media (max-width: 1023px) {
          body { overflow: hidden; }
        }
      `}</style>

      {/* Mobile top bar: Back + Create/Publish/Share */}
      <div
        className="lg:hidden"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 101,
          paddingTop: "max(12px, env(safe-area-inset-top, 12px))",
          paddingLeft: 14,
          paddingRight: 14,
          paddingBottom: 8,
          pointerEvents: "auto",
          background: "linear-gradient(180deg, rgba(237,224,204,0.85) 0%, rgba(237,224,204,0) 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <button
            onClick={editor.goBack}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px 7px 10px",
              borderRadius: 999,
              border: "1px solid rgba(173,104,74,0.15)",
              background: "rgba(253,248,240,0.90)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              fontFamily: SERIF,
              fontStyle: "italic",
              fontSize: 14,
              fontWeight: 400,
              color: DARK_BROWN,
              cursor: "pointer",
              letterSpacing: "0.01em",
              boxShadow: "0 2px 10px rgba(93,63,49,0.08)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={DARK_BROWN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
            Back
          </button>

          <button
            onClick={topAction.onClick}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 16px 7px 12px",
              borderRadius: 999,
              border: editor.showShare ? `1px solid rgba(173,104,74,0.15)` : "none",
              background: editor.showPublish
                ? `linear-gradient(135deg, ${COPPER} 0%, ${DARK_BROWN} 100%)`
                : editor.showShare
                  ? "rgba(253,248,240,0.90)"
                  : `linear-gradient(135deg, ${COPPER} 0%, ${DARK_BROWN} 100%)`,
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              color: editor.showShare ? DARK_BROWN : "#FFF8EE",
              fontFamily: SCRIPT,
              fontSize: 15,
              fontWeight: 400,
              cursor: "pointer",
              letterSpacing: "0.01em",
              boxShadow: editor.showPublish
                ? "0 4px 16px rgba(93,63,49,0.30)"
                : editor.showShare
                  ? "0 2px 10px rgba(93,63,49,0.08)"
                  : "0 4px 16px rgba(173,104,74,0.25)",
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z"/></svg>
            {topAction.label}
          </button>
        </div>
      </div>

      <DesktopSidebar
        tab={editor.tab}
        onTabChange={editor.handleTabChange}
        recipientName={editor.content.recipientName}
        senderName={editor.content.senderName}
        onBack={editor.goBack}
        onEdit={editor.handleEditClick}
        showPublish={editor.showPublish}
        showShare={editor.showShare}
        shareLabel={editor.shareLabel}
        onPublish={editor.handlePublish}
        onShare={editor.handleShare}
      />

      <main
        className="lg:ml-56"
        style={{ height: "100dvh", paddingBottom: 0, overflow: "hidden" }}
      >
        {editor.tab === "home" && (
          <HomeSection
            data={editor.content}
            isPersonalized={editor.isPersonalized}
          />
        )}

        {editor.tab === "gallery" && (
          <div style={{ height: "100dvh", overflowY: "auto" }}>
            <ScrapbookBg>
              <Suspense fallback={<SectionLoader />}>
                <GallerySection data={editor.content} />
              </Suspense>
            </ScrapbookBg>
          </div>
        )}

        {/* Songs & Games stay MOUNTED (display:none) to preserve play state and game history */}
        <div style={{ display: editor.tab === "songs" ? "block" : "none", height: "100dvh", overflowY: "auto" }}>
          <ScrapbookBg>
            <Suspense fallback={<SectionLoader />}>
              <SongsSection data={editor.content} onPlayingChange={handleSongPlayingChange} />
            </Suspense>
          </ScrapbookBg>
        </div>

        <div style={{ display: editor.tab === "games" ? "block" : "none", height: "100dvh", overflowY: "auto" }}>
          <ScrapbookBg>
            <Suspense fallback={<SectionLoader />}>
              <GamesSection
                data={editor.content}
                shareId={editor.shareId}
                quizAttempts={editor.quizAttemptsFromDB}
                initialGameResponses={editor.gameResponsesFromDB as unknown as any}
                onRecordingChange={handleRecordingChange}
              />
            </Suspense>
          </ScrapbookBg>
        </div>

        {editor.tab === "surprise" && (
          <div style={{ height: "100dvh", overflowY: "auto" }}>
            <ScrapbookBg>
              <Suspense fallback={<SectionLoader />}>
                <SurpriseSection data={editor.content} isPreview />
              </Suspense>
            </ScrapbookBg>
          </div>
        )}
      </main>

      <BirthdayBgMusic paused={songPlaying || recordingActive} />

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

      <EditSheet
        editMode={editor.editMode}
        setEditMode={editor.setEditMode}
        aiName={editor.aiName} setAiName={editor.setAiName}
        aiSender={editor.aiSender} setAiSender={editor.setAiSender}
        aiPrompt={editor.aiPrompt} setAiPrompt={editor.setAiPrompt}
        aiLoading={editor.aiLoading}
        mf={editor.mf}
        manualStep={editor.manualStep}
        setManualStep={editor.setManualStep}
        updateMf={editor.updateMf}
        onStartAi={editor.startAiMode}
        onStartManual={editor.startManualMode}
        onAiGenerate={editor.handleAiGenerate}
        onSaveWithPassword={editor.handleManualSave}
        saving={editor.saving}
      />

      <PublishSheet
        open={editor.showPublishSheet}
        recipientName={editor.content.recipientName}
        hasPassword={!!editor.pagePassword}
        publishing={editor.publishing}
        onPublish={() => {
          editor.handlePublish();
          editor.setShowPublishSheet(false);
        }}
        onClose={() => editor.setShowPublishSheet(false)}
      />

      <PublishingOverlay visible={editor.publishing} />


      <AnimatePresence>
        {editor.showAuth && (
          <AuthModal onClose={editor.closeAuth} onSuccess={editor.closeAuthSuccess} />
        )}
      </AnimatePresence>

      {/* "See it in Premium, free" — opened by Publish before the free publish runs. */}
      <AnimatePresence>{editor.upgrade && <PremiumUpgradeModal {...editor.upgrade} />}</AnimatePresence>

    </div>
  );
}

export default function BirthdayGfPage() {
  return (
    <Suspense fallback={<SectionLoader />}>
      <BirthdayGfPageInner />
    </Suspense>
  );
}
