"use client";

import { Suspense, lazy, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AuthModal from "@/components/AuthModal";

import { useBirthdayEditor } from "./hooks/useBirthdayEditor";

import HomeSection from "./components/HomeSection";
import BottomNav from "./components/BottomNav";
import DesktopSidebar from "./components/DesktopSidebar";
import ToastStack from "./components/ToastStack";
import EditSheet from "./components/EditSheet";
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

function EditorShareSheet({ url, onClose }: { url: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsapp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`A birthday page just for you 🎂 ${url}`)}`, "_blank");
  };

  const nativeShare = () => {
    if (navigator.share) {
      navigator.share({ title: "A birthday page for you 🎂", url }).catch(() => {});
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, zIndex: 500,
        background: "rgba(45,25,15,0.55)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{
          width: "100%", maxWidth: 480, borderRadius: "20px 20px 0 0",
          background: "rgba(250,245,238,0.98)",
          padding: "28px 24px 44px",
          boxShadow: "0 -12px 60px rgba(45,25,15,0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <span style={{ fontFamily: SCRIPT, fontSize: 20, fontWeight: 700, color: DARK_BROWN }}>
            Share your birthday page 🎂
          </span>
          <button onClick={onClose} style={{ border: "none", background: "transparent", cursor: "pointer", color: DARK_BROWN, opacity: 0.5 }}>
            ✕
          </button>
        </div>

        {/* URL preview */}
        <div style={{
          background: "rgba(173,104,74,0.08)", borderRadius: 12,
          padding: "10px 14px", marginBottom: 20,
          fontFamily: SCRIPT, fontSize: 12, color: DARK_BROWN,
          wordBreak: "break-all", lineHeight: 1.5,
        }}>
          {url}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button onClick={copy} style={{
            display: "flex", alignItems: "center", gap: 14, padding: "14px 18px",
            borderRadius: 14, border: "1.5px solid rgba(173,104,74,0.25)",
            background: copied ? "rgba(173,104,74,0.12)" : "rgba(255,252,246,0.9)",
            cursor: "pointer", textAlign: "left",
          }}>
            <span style={{ fontSize: 22 }}>{copied ? "✓" : "🔗"}</span>
            <div>
              <p style={{ fontFamily: SCRIPT, fontSize: 15, fontWeight: 700, color: DARK_BROWN, margin: 0 }}>
                {copied ? "Copied!" : "Copy Link"}
              </p>
              <p style={{ fontFamily: SCRIPT, fontSize: 12, color: "rgba(93,63,49,0.55)", margin: 0 }}>
                Copy the link to share anywhere
              </p>
            </div>
          </button>

          <button onClick={whatsapp} style={{
            display: "flex", alignItems: "center", gap: 14, padding: "14px 18px",
            borderRadius: 14, border: "1.5px solid rgba(37,211,102,0.25)",
            background: "rgba(255,252,246,0.9)",
            cursor: "pointer", textAlign: "left",
          }}>
            <span style={{ fontSize: 22 }}>💬</span>
            <div>
              <p style={{ fontFamily: SCRIPT, fontSize: 15, fontWeight: 700, color: DARK_BROWN, margin: 0 }}>WhatsApp</p>
              <p style={{ fontFamily: SCRIPT, fontSize: 12, color: "rgba(93,63,49,0.55)", margin: 0 }}>
                Send via WhatsApp
              </p>
            </div>
          </button>

          {typeof navigator !== "undefined" && "share" in navigator && (
            <button onClick={nativeShare} style={{
              display: "flex", alignItems: "center", gap: 14, padding: "14px 18px",
              borderRadius: 14, border: "1.5px solid rgba(173,104,74,0.25)",
              background: "rgba(255,252,246,0.9)",
              cursor: "pointer", textAlign: "left",
            }}>
              <span style={{ fontSize: 22 }}>↗️</span>
              <div>
                <p style={{ fontFamily: SCRIPT, fontSize: 15, fontWeight: 700, color: DARK_BROWN, margin: 0 }}>Share</p>
                <p style={{ fontFamily: SCRIPT, fontSize: 12, color: "rgba(93,63,49,0.55)", margin: 0 }}>
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

function BirthdayGfPageInner() {
  const editor = useBirthdayEditor();
  const [songPlaying, setSongPlaying] = useState(false);
  const handleSongPlayingChange = useCallback((v: boolean) => setSongPlaying(v), []);

  const topAction = editor.showShare
    ? { label: "Share", onClick: editor.handleShare }
    : editor.showPublish
      ? { label: "🎂 Publish", onClick: editor.handlePublish }
      : { label: "✦ Create", onClick: editor.handleEditClick };

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
          <ScrapbookBg>
            <Suspense fallback={<SectionLoader />}>
              <GallerySection data={editor.content} />
            </Suspense>
          </ScrapbookBg>
        )}

        {/* Songs & Games stay MOUNTED (display:none) to preserve play state and game history */}
        <div style={{ display: editor.tab === "songs" ? "block" : "none" }}>
          <ScrapbookBg>
            <Suspense fallback={<SectionLoader />}>
              <SongsSection data={editor.content} onPlayingChange={handleSongPlayingChange} />
            </Suspense>
          </ScrapbookBg>
        </div>

        <div style={{ display: editor.tab === "games" ? "block" : "none" }}>
          <ScrapbookBg>
            <Suspense fallback={<SectionLoader />}>
              <GamesSection
                data={editor.content}
                shareId={editor.shareId}
                quizAttempts={editor.quizAttemptsFromDB}
                initialGameResponses={editor.gameResponsesFromDB as unknown as any}
              />
            </Suspense>
          </ScrapbookBg>
        </div>

        {editor.tab === "surprise" && (
          <ScrapbookBg>
            <Suspense fallback={<SectionLoader />}>
              <SurpriseSection data={editor.content} isPreview />
            </Suspense>
          </ScrapbookBg>
        )}
      </main>

      <BirthdayBgMusic paused={songPlaying} />

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

export default function BirthdayGfPage() {
  return (
    <Suspense fallback={<SectionLoader />}>
      <BirthdayGfPageInner />
    </Suspense>
  );
}
