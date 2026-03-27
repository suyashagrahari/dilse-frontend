"use client";

import { Suspense, lazy, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AuthModal from "@/components/AuthModal";

import { useDarlingEditor } from "./hooks/useDarlingEditor";

import HomeSection from "./components/HomeSection";
import WishSection from "./components/WishSection";
import BottomNav from "./components/BottomNav";
import DesktopSidebar from "./components/DesktopSidebar";
import ToastStack from "./components/ToastStack";
import EditSheet from "./components/EditSheet";
import PasswordSheet from "./components/PasswordSheet";
import PreviewBar from "./components/PreviewBar";
import PublishingOverlay from "./components/PublishingOverlay";
import DarlingBg from "./components/DarlingBg";
import DarlingBackgroundMusic from "./components/BackgroundMusic";

const GallerySection = lazy(() => import("./components/GallerySection"));
const MusicSection = lazy(() => import("./components/MusicSection"));
const GamesSection = lazy(() => import("./components/GamesSection"));
const NotesSection = lazy(() => import("./components/NotesSection"));

const CURSIVE = "'Dancing Script', 'Brush Script MT', cursive";
const ROSE = "rgb(201, 144, 106)";

function SectionLoader() {
  return (
    <DarlingBg>
      <div style={{ minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: CURSIVE, fontSize: 20, color: ROSE, opacity: 0.6 }}>loading...</p>
      </div>
    </DarlingBg>
  );
}

function EditorShareSheet({ url, onClose }: { url: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsapp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`A love page just for you ♡ ${url}`)}`, "_blank");
  };

  const nativeShare = () => {
    if (navigator.share) {
      navigator.share({ title: "A darling page for you ♡", url }).catch(() => {});
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, zIndex: 500,
        background: "rgba(4, 2, 10, 0.70)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{
          width: "100%", maxWidth: 480, borderRadius: "20px 20px 0 0",
          background: "rgba(14, 7, 24, 0.98)",
          border: "1px solid rgba(201,144,106,0.18)",
          borderBottom: "none",
          padding: "28px 24px 44px",
          boxShadow: "0 -12px 60px rgba(0,0,0,0.55)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <span style={{ fontFamily: CURSIVE, fontSize: 20, fontWeight: 700, color: ROSE }}>
            Share your darling page ♡
          </span>
          <button onClick={onClose} style={{ border: "none", background: "transparent", cursor: "pointer", color: ROSE, opacity: 0.5, fontSize: 16 }}>
            ✕
          </button>
        </div>

        {/* URL preview */}
        <div style={{
          background: "rgba(201,144,106,0.07)", borderRadius: 12,
          padding: "10px 14px", marginBottom: 20,
          fontFamily: CURSIVE, fontSize: 12, color: "rgba(201,144,106,0.70)",
          wordBreak: "break-all", lineHeight: 1.5,
          border: "1px solid rgba(201,144,106,0.15)",
        }}>
          {url}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button onClick={copy} style={{
            display: "flex", alignItems: "center", gap: 14, padding: "14px 18px",
            borderRadius: 14,
            border: copied ? "1.5px solid rgba(201,144,106,0.40)" : "1.5px solid rgba(201,144,106,0.20)",
            background: copied ? "rgba(201,144,106,0.10)" : "rgba(201,144,106,0.04)",
            cursor: "pointer", textAlign: "left",
          }}>
            <span style={{ fontSize: 22 }}>{copied ? "✓" : "🔗"}</span>
            <div>
              <p style={{ fontFamily: CURSIVE, fontSize: 15, fontWeight: 700, color: ROSE, margin: 0 }}>
                {copied ? "Copied!" : "Copy Link"}
              </p>
              <p style={{ fontFamily: CURSIVE, fontSize: 12, color: "rgba(201,144,106,0.55)", margin: 0 }}>
                Copy the link to share anywhere
              </p>
            </div>
          </button>

          <button onClick={whatsapp} style={{
            display: "flex", alignItems: "center", gap: 14, padding: "14px 18px",
            borderRadius: 14, border: "1.5px solid rgba(37,211,102,0.20)",
            background: "rgba(201,144,106,0.04)",
            cursor: "pointer", textAlign: "left",
          }}>
            <span style={{ fontSize: 22 }}>💬</span>
            <div>
              <p style={{ fontFamily: CURSIVE, fontSize: 15, fontWeight: 700, color: ROSE, margin: 0 }}>WhatsApp</p>
              <p style={{ fontFamily: CURSIVE, fontSize: 12, color: "rgba(201,144,106,0.55)", margin: 0 }}>
                Send via WhatsApp
              </p>
            </div>
          </button>

          {typeof navigator !== "undefined" && "share" in navigator && (
            <button onClick={nativeShare} style={{
              display: "flex", alignItems: "center", gap: 14, padding: "14px 18px",
              borderRadius: 14, border: "1.5px solid rgba(201,144,106,0.20)",
              background: "rgba(201,144,106,0.04)",
              cursor: "pointer", textAlign: "left",
            }}>
              <span style={{ fontSize: 22 }}>↗️</span>
              <div>
                <p style={{ fontFamily: CURSIVE, fontSize: 15, fontWeight: 700, color: ROSE, margin: 0 }}>Share</p>
                <p style={{ fontFamily: CURSIVE, fontSize: 12, color: "rgba(201,144,106,0.55)", margin: 0 }}>
                  Share via other apps
                </p>
              </div>
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function DarlingPageInner() {
  const editor = useDarlingEditor();
  const [playlistActive, setPlaylistActive] = useState(false);

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
          radial-gradient(ellipse at 50% 50%, transparent 22%, rgba(8,4,18,0.55) 100%),
          url(/love/image18.webp) center / cover no-repeat fixed
        `,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;600;700&display=swap');
        body, html { margin: 0; padding: 0; background: rgb(8, 4, 18); }
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
              border: "1px solid rgba(201,144,106,0.18)",
              background: "rgba(8, 4, 18, 0.80)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              fontFamily: CURSIVE,
              fontSize: 14,
              fontWeight: 600,
              color: ROSE,
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
              border: editor.showShare ? "1.5px solid rgba(201,144,106,0.30)" : "none",
              background: editor.showPublish
                ? "linear-gradient(135deg, rgb(201,144,106) 0%, rgb(160,100,65) 100%)"
                : editor.showShare
                  ? "rgba(201,144,106,0.08)"
                  : "rgba(201,144,106,0.80)",
              color: editor.showShare ? ROSE : "#fff",
              fontFamily: CURSIVE,
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: "0.02em",
              boxShadow: editor.showPublish ? "0 6px 18px rgba(201,144,106,0.35)" : "none",
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

      {/* Ambient background music — pauses while playlist is playing */}
      <DarlingBackgroundMusic shouldPlay paused={editor.tab === "music" && playlistActive} />

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
          <DarlingBg>
            <Suspense fallback={<SectionLoader />}>
              <GallerySection data={editor.content} />
            </Suspense>
          </DarlingBg>
        )}
        {editor.tab === "notes" && (
          <DarlingBg>
            <Suspense fallback={<SectionLoader />}>
              <NotesSection shareId={editor.shareId} />
            </Suspense>
          </DarlingBg>
        )}

        {/* Music & Games stay MOUNTED (display:none) to preserve play state and game history */}
        <div style={{ display: editor.tab === "music" ? "block" : "none" }}>
          <DarlingBg>
            <Suspense fallback={<SectionLoader />}>
              <MusicSection data={editor.content} onPlayStateChange={setPlaylistActive} />
            </Suspense>
          </DarlingBg>
        </div>

        <div style={{ display: editor.tab === "games" ? "block" : "none" }}>
          <DarlingBg>
            <Suspense fallback={<SectionLoader />}>
              <GamesSection
                data={editor.content}
                shareId={editor.shareId}
                quizAttempts={editor.quizAttemptsFromDB}
                initialGameResponses={editor.gameResponsesFromDB as unknown as import("./components/GamesSection").ServerGameResponse[]}
              />
            </Suspense>
          </DarlingBg>
        </div>
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
        onSaveWithPassword={editor.handleManualSave}
        saving={editor.saving}
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

      <AnimatePresence>
        {editor.showShareSheet && editor.shareUrl && (
          <EditorShareSheet
            url={editor.shareUrl}
            onClose={() => editor.setShowShareSheet(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DarlingPage() {
  return (
    <Suspense fallback={<SectionLoader />}>
      <DarlingPageInner />
    </Suspense>
  );
}
