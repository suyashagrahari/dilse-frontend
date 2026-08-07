"use client";

import { Suspense, lazy, useMemo, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, Mail, Music2, Sparkles } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import StoryStarter from "@/components/story/StoryStarter";

import { useDarlingEditor } from "./hooks/useDarlingEditor";

import HomeSection from "./components/HomeSection";
import WishSection from "./components/WishSection";
import BottomNav from "./components/BottomNav";
import DesktopSidebar from "./components/DesktopSidebar";
import ToastStack from "./components/ToastStack";
import EditSheet from "./components/EditSheet";
import PasswordSheet from "./components/PasswordSheet";
import PublishingOverlay from "./components/PublishingOverlay";
import DarlingBg from "./components/DarlingBg";
import DarlingBackgroundMusic from "./components/BackgroundMusic";

const GallerySection = lazy(() => import("./components/GallerySection"));
const MusicSection = lazy(() => import("./components/MusicSection"));
const GamesSection = lazy(() => import("./components/GamesSection"));
const NotesSection = lazy(() => import("./components/NotesSection"));

const CURSIVE = "system-ui, sans-serif";
const ROSE = "#ff3d6b";
const GRAD = "linear-gradient(135deg, #ff3d6b 0%, #a855f7 100%)";

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
          border: "1px solid rgba(255,61,107,0.18)",
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
          background: "rgba(255,61,107,0.07)", borderRadius: 12,
          padding: "10px 14px", marginBottom: 20,
          fontFamily: CURSIVE, fontSize: 12, color: "rgba(255,61,107,0.70)",
          wordBreak: "break-all", lineHeight: 1.5,
          border: "1px solid rgba(255,61,107,0.15)",
        }}>
          {url}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button onClick={copy} style={{
            display: "flex", alignItems: "center", gap: 14, padding: "14px 18px",
            borderRadius: 14,
            border: copied ? "1.5px solid rgba(255,61,107,0.40)" : "1.5px solid rgba(255,61,107,0.20)",
            background: copied ? "rgba(255,61,107,0.10)" : "rgba(255,61,107,0.04)",
            cursor: "pointer", textAlign: "left",
          }}>
            <span style={{ fontSize: 22 }}>{copied ? "✓" : "🔗"}</span>
            <div>
              <p style={{ fontFamily: CURSIVE, fontSize: 15, fontWeight: 700, color: ROSE, margin: 0 }}>
                {copied ? "Copied!" : "Copy Link"}
              </p>
              <p style={{ fontFamily: CURSIVE, fontSize: 12, color: "rgba(255,61,107,0.55)", margin: 0 }}>
                Copy the link to share anywhere
              </p>
            </div>
          </button>

          <button onClick={whatsapp} style={{
            display: "flex", alignItems: "center", gap: 14, padding: "14px 18px",
            borderRadius: 14, border: "1.5px solid rgba(37,211,102,0.20)",
            background: "rgba(255,61,107,0.04)",
            cursor: "pointer", textAlign: "left",
          }}>
            <span style={{ fontSize: 22 }}>💬</span>
            <div>
              <p style={{ fontFamily: CURSIVE, fontSize: 15, fontWeight: 700, color: ROSE, margin: 0 }}>WhatsApp</p>
              <p style={{ fontFamily: CURSIVE, fontSize: 12, color: "rgba(255,61,107,0.55)", margin: 0 }}>
                Send via WhatsApp
              </p>
            </div>
          </button>

          {typeof navigator !== "undefined" && "share" in navigator && (
            <button onClick={nativeShare} style={{
              display: "flex", alignItems: "center", gap: 14, padding: "14px 18px",
              borderRadius: 14, border: "1.5px solid rgba(255,61,107,0.20)",
              background: "rgba(255,61,107,0.04)",
              cursor: "pointer", textAlign: "left",
            }}>
              <span style={{ fontSize: 22 }}>↗️</span>
              <div>
                <p style={{ fontFamily: CURSIVE, fontSize: 15, fontWeight: 700, color: ROSE, margin: 0 }}>Share</p>
                <p style={{ fontFamily: CURSIVE, fontSize: 12, color: "rgba(255,61,107,0.55)", margin: 0 }}>
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

  const isPreview = editor.editMode === "preview";

  const topAction = editor.showShare
    ? { label: "Share", onClick: editor.handleShare }
    : editor.showPublish
      ? { label: "♡ Publish", onClick: editor.handlePublish }
      : { label: "✦ Create", onClick: editor.handleStartCreate };

  const galleryUserCount = useMemo(
    () => (editor.content.galleryPhotos || []).filter((p) => p.url).length,
    [editor.content.galleryPhotos],
  );
  /** Compact top bar; center title on these tabs (not Home) */
  const showCenterTitle =
    editor.tab === "gallery" || editor.tab === "games" || editor.tab === "music"
    || editor.tab === "notes" || editor.tab === "wish";

  const centerH2: CSSProperties = {
    margin: 0,
    padding: 0,
    fontSize: "1em",
    fontWeight: 800,
    lineHeight: 1.08,
    letterSpacing: "-0.02em",
    background: GRAD,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        width: "100%",
        overflow: "hidden",
        position: "relative",
        background: "#0d0b18",
      }}
    >
      <style>{`
        body, html { margin: 0; padding: 0; background: #0d0b18; }
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
          top: 10,
          left: 0,
          right: 0,
          zIndex: 101,
          paddingTop: "max(6px, env(safe-area-inset-top, 14px))",
          paddingBottom: 4,
          paddingLeft: 12,
          paddingRight: 12,
          pointerEvents: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: showCenterTitle ? 6 : 8,
            width: "100%",
            minHeight: 36,
          }}
        >
          <button
            onClick={editor.goBack}
            style={{
              display: "flex", alignItems: "center", gap: 3,
              padding: "5px 9px",
              borderRadius: 50,
              border: "1px solid rgba(255,61,107,0.22)",
              background: "rgba(255,61,107,0.07)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              fontSize: 11,
              fontWeight: 700,
              color: "#fff",
              cursor: "pointer",
              letterSpacing: "0.02em",
              boxShadow: "0 3px 14px rgba(255,61,107,0.08)",
              flexShrink: 0,
            }}
          >
            ← Back
          </button>

          <div
            style={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: showCenterTitle ? "0 2px" : 0,
              fontSize: showCenterTitle ? "clamp(11.5px, 3.5vw, 16px)" : undefined,
            }}
          >
            {editor.tab === "gallery" ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.4em",
                  minWidth: 0,
                  maxWidth: "100%",
                  padding: "2px 6px",
                }}
              >
                <h2 style={centerH2}>
                  {galleryUserCount > 0
                    ? `Our Memories (${galleryUserCount})`
                    : "Our Memories"}
                </h2>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    lineHeight: 0,
                    flexShrink: 0,
                    transform: "translateY(0.05em)",
                  }}
                  aria-hidden
                >
                  <Camera
                    color={ROSE}
                    strokeWidth={2.25}
                    style={{ width: "0.9em", height: "0.9em", display: "block" }}
                  />
                </span>
              </div>
            ) : editor.tab === "games" ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.35em",
                  minWidth: 0,
                  maxWidth: "100%",
                  padding: "2px 6px",
                }}
              >
                <h2 style={centerH2}>Love Games</h2>
                <span style={{ fontSize: "0.95em", lineHeight: 1, flexShrink: 0 }} aria-hidden>🎮</span>
              </div>
            ) : editor.tab === "music" ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.35em",
                  minWidth: 0,
                  maxWidth: "100%",
                  padding: "2px 6px",
                }}
              >
                <h2 style={centerH2}>Our Playlist</h2>
                <Music2 color={ROSE} strokeWidth={2.2} style={{ width: "0.9em", height: "0.9em", flexShrink: 0 }} aria-hidden />
              </div>
            ) : editor.tab === "notes" ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.35em",
                  minWidth: 0,
                  maxWidth: "100%",
                  padding: "2px 6px",
                }}
              >
                <h2 style={centerH2}>Love Notes</h2>
                <Mail color={ROSE} strokeWidth={2.2} style={{ width: "0.9em", height: "0.9em", flexShrink: 0 }} aria-hidden />
              </div>
            ) : editor.tab === "wish" ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.35em",
                  minWidth: 0,
                  maxWidth: "100%",
                  padding: "2px 6px",
                }}
              >
                <h2 style={centerH2}>Love Letter</h2>
                <Sparkles color={ROSE} strokeWidth={2.2} style={{ width: "0.9em", height: "0.9em", flexShrink: 0 }} aria-hidden />
              </div>
            ) : null}
          </div>

          {isPreview ? (
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
              <button
                onClick={editor.handleEditFromPreview}
                style={{
                  padding: "5px 11px",
                  borderRadius: 50,
                  border: "1.5px solid rgba(255,61,107,0.35)",
                  background: "rgba(255,61,107,0.10)",
                  color: "#ff3d6b",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                  letterSpacing: "0.02em",
                  flexShrink: 0,
                }}
              >
                ✦ Edit
              </button>
              <button
                onClick={editor.handlePublish}
                disabled={editor.publishing}
                style={{
                  padding: "5px 13px",
                  borderRadius: 50,
                  border: "none",
                  background: editor.publishing ? "rgba(255,61,107,0.40)" : GRAD,
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: editor.publishing ? "not-allowed" : "pointer",
                  letterSpacing: "0.02em",
                  boxShadow: editor.publishing ? "none" : "0 4px 16px rgba(255,61,107,0.35)",
                  flexShrink: 0,
                }}
              >
                {editor.publishing ? "Publishing..." : "♡ Publish"}
              </button>
            </div>
          ) : (
            <button
              onClick={topAction.onClick}
              style={{
                display: "flex", alignItems: "center", gap: 4,
                padding: "5px 11px",
                borderRadius: 50,
                border: editor.showShare ? "1.5px solid rgba(255,61,107,0.35)" : "none",
                background: editor.showPublish
                  ? GRAD
                  : editor.showShare
                    ? "rgba(255,61,107,0.12)"
                    : GRAD,
                color: "#fff",
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                letterSpacing: "0.02em",
                boxShadow: (editor.showPublish || (!editor.showShare && !editor.showPublish))
                  ? "0 4px 16px rgba(255,61,107,0.26)"
                  : "none",
                flexShrink: 0,
              }}
            >
              {topAction.label}
            </button>
          )}
        </div>
      </div>

      <DesktopSidebar
        tab={editor.tab}
        onTabChange={editor.handleTabChange}
        coupleNames={{ person1: editor.content.senderName, person2: editor.content.recipientName }}
        onBack={editor.goBack}
        onEdit={isPreview ? editor.handleEditFromPreview : editor.handleStartCreate}
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
            onEditClick={editor.handleStartCreate}
            onTabChange={editor.handleTabChange}
          />
        )}
        {editor.tab === "wish" && (
          <WishSection data={editor.content} isPersonalized={editor.isPersonalized} titleInTopBar />
        )}
        {editor.tab === "gallery" && (
          <DarlingBg>
            <Suspense fallback={<SectionLoader />}>
              <GallerySection data={editor.content} titleInTopBar />
            </Suspense>
          </DarlingBg>
        )}
        {editor.tab === "notes" && (
          <DarlingBg>
            <Suspense fallback={<SectionLoader />}>
              <NotesSection shareId={editor.shareId} titleInTopBar />
            </Suspense>
          </DarlingBg>
        )}

        {/* Music & Games stay MOUNTED (display:none) to preserve play state and game history */}
        <div style={{ display: editor.tab === "music" ? "block" : "none" }}>
          <DarlingBg>
            <Suspense fallback={<SectionLoader />}>
              <MusicSection data={editor.content} onPlayStateChange={setPlaylistActive} titleInTopBar />
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
                titleInTopBar
              />
            </Suspense>
          </DarlingBg>
        </div>
      </main>

      <BottomNav
        mode="editor"
        tab={editor.tab}
        onTabChange={editor.handleTabChange}
        onEdit={editor.handleStartCreate}
        showPublish={editor.showPublish}
        showShare={editor.showShare}
        shareLabel={editor.shareLabel}
        onPublish={editor.handlePublish}
        onShare={editor.handleShare}
        onBack={editor.goBack}
      />

      <EditSheet
        editMode={editor.editMode}
        setEditMode={editor.setEditModeFromSheet}
        aiName={editor.aiName} setAiName={editor.setAiName}
        aiSender={editor.aiSender} setAiSender={editor.setAiSender}
        aiPrompt={editor.aiPrompt} setAiPrompt={editor.setAiPrompt}
        aiLoading={editor.aiLoading}
        mf={editor.mf}
        manualStep={editor.manualStep}
        setManualStep={editor.setManualStep}
        updateMf={editor.updateMf}
        onStartAi={editor.handleStartAi}
        onStartManual={editor.startManualMode}
        onAiGenerate={editor.handleAiGenerate}
        onSaveWithPassword={editor.handleManualSave}
        saving={editor.saving}
      />

      {/* Mounted after EditSheet so the sheet sits over the seeded manual form. */}
      {editor.storyStarted && (
        <StoryStarter fill={editor.storyFill} onManual={editor.handleStoryManual} />
      )}

      <PasswordSheet
        visible={editor.editMode === "password"}
        saving={editor.saving}
        password={editor.pagePassword}
        setPassword={editor.setPagePassword}
        showValue={editor.showPwValue}
        setShowValue={editor.setShowPwValue}
        onDone={editor.handlePasswordDone}
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
