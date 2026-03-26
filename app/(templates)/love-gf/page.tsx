"use client";

import { Suspense, lazy } from "react";
import { AnimatePresence } from "framer-motion";
import AuthModal from "@/components/AuthModal";

import { useLoveEditor } from "./hooks/useLoveEditor";

import HomeSection from "./components/HomeSection";
import WishSection from "./components/WishSection";
import BottomNav from "./components/BottomNav";
import DesktopSidebar from "./components/DesktopSidebar";
import ToastStack from "./components/ToastStack";
import EditSheet from "./components/EditSheet";
import PasswordSheet from "./components/PasswordSheet";
import PreviewBar from "./components/PreviewBar";
import PublishingOverlay from "./components/PublishingOverlay";
import ScrapbookBg from "./components/ScrapbookBg";

const GallerySection = lazy(() => import("./components/GallerySection"));
const MusicSection = lazy(() => import("./components/MusicSection"));
const GamesSection = lazy(() => import("./components/GamesSection"));
const NotesSection = lazy(() => import("./components/NotesSection"));

const CURSIVE = "'Dancing Script', 'Brush Script MT', cursive";
const WARM = "rgb(108, 74, 46)";

function SectionLoader() {
  return (
    <ScrapbookBg>
      <div style={{ minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: CURSIVE, fontSize: 20, color: WARM, opacity: 0.6 }}>loading...</p>
      </div>
    </ScrapbookBg>
  );
}

function LoveGfPageInner() {
  const editor = useLoveEditor();

  const topAction = editor.showShare
    ? { label: "Share", onClick: editor.handleShare }
    : editor.showPublish
      ? { label: "♡ Publish", onClick: editor.handlePublish }
      : { label: "✦ Create", onClick: editor.handleEditClick };

  return (
    <div
      style={{
        minHeight: "100dvh",
        width: "100%",
        overflow: "hidden",
        position: "relative",
        background: `
          radial-gradient(ellipse at 50% 50%, transparent 22%, rgba(28,15,6,0.28) 100%),
          url(/love/image18.webp) center / cover no-repeat
        `,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;600;700&display=swap');
        body, html { margin: 0; padding: 0; background: #faf6f0; }
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
          top: 12,
          left: 0,
          right: 0,
          zIndex: 101,
          paddingTop: "env(safe-area-inset-top, 16px)",
          paddingLeft: 16,
          paddingRight: 16,
          pointerEvents: "auto",
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
              padding: "8px 12px",
              borderRadius: 12,
              border: "1px solid rgba(158,126,97,0.20)",
              background: "rgba(250, 246, 240, 0.92)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              fontFamily: CURSIVE,
              fontSize: 14,
              fontWeight: 600,
              color: WARM,
              cursor: "pointer",
              letterSpacing: "0.02em",
            }}
          >
            ← Back
          </button>

          <button
            onClick={topAction.onClick}
            style={{
              padding: "8px 16px",
              borderRadius: 999,
              border: "none",
              background: editor.showPublish
                ? "linear-gradient(135deg, rgb(158,126,97) 0%, rgb(120,85,55) 100%)"
                : editor.showShare
                  ? "rgba(108,74,46,0.10)"
                  : "rgba(180, 60, 80, 0.92)",
              color: editor.showShare ? WARM : "#fff",
              fontFamily: CURSIVE,
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: "0.02em",
              boxShadow: editor.showPublish ? "0 6px 18px rgba(108,74,46,0.35)" : "none",
            }}
          >
            {topAction.label}
          </button>
        </div>
      </div>

      <DesktopSidebar
        tab={editor.tab}
        onTabChange={editor.handleTabChange}
        coupleNames={{ person1: editor.content.senderName, person2: editor.content.recipientName }}
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
            onEditClick={editor.handleEditClick}
          />
        )}
        {editor.tab === "wish" && (
          <WishSection data={editor.content} isPersonalized={editor.isPersonalized} />
        )}
        {editor.tab === "gallery" && (
          <ScrapbookBg>
            <Suspense fallback={<SectionLoader />}>
              <GallerySection data={editor.content} />
            </Suspense>
          </ScrapbookBg>
        )}
        {editor.tab === "music" && (
          <ScrapbookBg>
            <Suspense fallback={<SectionLoader />}>
              <MusicSection data={editor.content} onPlayStateChange={() => {}} />
            </Suspense>
          </ScrapbookBg>
        )}
        {editor.tab === "games" && (
          <ScrapbookBg>
            <Suspense fallback={<SectionLoader />}>
              <GamesSection data={editor.content} shareId={editor.shareId} />
            </Suspense>
          </ScrapbookBg>
        )}
        {editor.tab === "notes" && (
          <ScrapbookBg>
            <Suspense fallback={<SectionLoader />}>
              <NotesSection />
            </Suspense>
          </ScrapbookBg>
        )}
      </main>

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

      <ToastStack toasts={editor.toasts} onDismiss={editor.dismissToast} onCopy={editor.handleCopy} />

      <AnimatePresence>
        {editor.showAuth && (
          <AuthModal onClose={editor.closeAuth} onSuccess={editor.closeAuthSuccess} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LoveGfPage() {
  return (
    <Suspense fallback={<SectionLoader />}>
      <LoveGfPageInner />
    </Suspense>
  );
}
