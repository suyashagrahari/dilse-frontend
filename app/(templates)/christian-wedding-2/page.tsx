"use client";

import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import AuthModal from "@/components/AuthModal";
import SocialShareSheet from "@/components/SocialShareSheet";

import { useChristianWeddingEditor } from "@/app/(templates)/christian-wedding/hooks/useChristianWeddingEditor";
import { ChristianPageChrome } from "@/app/(templates)/christian-wedding/components/ChristianPageChrome";
import ChristianBackgroundMusic from "@/app/(templates)/christian-wedding/components/ChristianBackgroundMusic";
import ToastStack from "@/app/(templates)/christian-wedding/components/ToastStack";
import EditSheet from "@/app/(templates)/christian-wedding/components/EditSheet";
import PublishingOverlay from "@/app/(templates)/christian-wedding/components/PublishingOverlay";

import HomeHero from "./components/HomeHero";
import FloatingActions from "./components/FloatingActions";

const CoupleSection  = lazy(() => import("./components/CoupleSection"));
const EventsSection  = lazy(() => import("./components/EventsSection"));
const GallerySection = lazy(() => import("@/app/(templates)/christian-wedding/components/GallerySection"));
const WishesSection  = lazy(() => import("@/app/(templates)/christian-wedding/components/WishesSection"));

const C_ACCENT = "#546B57";

function SectionFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
        style={{ borderColor: C_ACCENT, borderTopColor: "transparent" }}
      />
    </div>
  );
}

const SECTION_VARIANTS = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

function SectionAnchor({
  id,
  children,
  first = false,
}: {
  id: string;
  children: React.ReactNode;
  first?: boolean;
}) {
  return (
    <motion.section
      id={`cw2-${id}`}
      initial={first ? "visible" : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
      variants={SECTION_VARIANTS}
      className="relative w-full"
    >
      {children}
    </motion.section>
  );
}

export default function ChristianWedding2Page() {
  const router = useRouter();
  const editor = useChristianWeddingEditor({ variant: "scroll" });

  // Gate: only allow the auth modal to render after the user explicitly
  // clicks Personalize/Create. Prevents any stale/auto flow from showing
  // the login sheet on first page load.
  const [authRequested, setAuthRequested] = useState(false);

  // Defensive: if showAuth somehow becomes true before the user clicked,
  // silently dismiss it so the public scroll experience isn't interrupted.
  useEffect(() => {
    if (editor.showAuth && !authRequested) editor.closeAuth();
  }, [editor.showAuth, authRequested, editor]);

  const handleBack = useCallback(() => {
    if (window.history.length > 1) router.back();
    else router.push("/");
  }, [router]);

  const handleEdit = useCallback(() => {
    setAuthRequested(true);
    editor.handleEditClick();
  }, [editor]);

  const handleAuthClose = useCallback(() => {
    setAuthRequested(false);
    editor.closeAuth();
  }, [editor]);

  const handleAuthSuccess = useCallback(() => {
    setAuthRequested(false);
    editor.closeAuthSuccess();
  }, [editor]);

  if (!editor.themeReady) return null;

  const isPreview = editor.editMode === "preview";
  const showAuth = authRequested && editor.showAuth;

  return (
    <div className="relative min-h-[100dvh] w-full" style={{ background: "#fcfcfa" }}>
      {/* Fixed watercolor chrome — stays pinned to viewport as user scrolls,
          so every section shares the same theme background as the original
          christian-wedding tabs. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <ChristianPageChrome />
      </div>

      {/* Scrollable stack — content flows directly on the fixed chrome */}
      <main className="relative z-10 flex w-full flex-col">
        <SectionAnchor id="home" first>
          <HomeHero data={editor.content} />
        </SectionAnchor>

        <SectionAnchor id="couple">
          <Suspense fallback={<SectionFallback />}>
            <CoupleSection data={editor.content} />
          </Suspense>
        </SectionAnchor>

        <SectionAnchor id="events">
          <Suspense fallback={<SectionFallback />}>
            <EventsSection data={editor.content} />
          </Suspense>
        </SectionAnchor>

        <SectionAnchor id="gallery">
          <Suspense fallback={<SectionFallback />}>
            <GallerySection data={editor.content} />
          </Suspense>
        </SectionAnchor>

        <SectionAnchor id="blessings">
          <Suspense fallback={<SectionFallback />}>
            <WishesSection data={editor.content} shareId={editor.shareId ?? undefined} />
          </Suspense>
        </SectionAnchor>

        {/* Bottom breathing room */}
        <div aria-hidden className="h-16 lg:h-24" />
      </main>

      {/* ── Top-floating controls ───────────────────────────────────────── */}
      <FloatingActions
        isPreview={isPreview}
        isPersonalized={editor.isPersonalized}
        showPublish={editor.showPublish && !editor.shareUrl}
        showShare={editor.showShare}
        shareLabel={editor.shareLabel}
        saving={editor.saving}
        publishing={editor.publishing}
        onBack={handleBack}
        onEdit={handleEdit}
        onPublish={editor.handlePublish}
        onShare={editor.handleShare}
        onConfirmSave={editor.handleConfirmSave}
        onDiscardPreview={editor.handleDiscardPreview}
      />

      {/* ── Modal / overlay stack ───────────────────────────────────────── */}
      {showAuth && (
        <AuthModal onClose={handleAuthClose} onSuccess={handleAuthSuccess} />
      )}

      <SocialShareSheet
        open={editor.showShareSheet}
        onClose={editor.closeShareSheet}
        shareUrl={editor.shareUrl}
        onCopy={editor.handleCopy}
        shareMessage={`${editor.content.brideName || "Bride"} & ${editor.content.groomName || "Groom"} invite you to their wedding celebration on SubhSandesh!`}
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
        extractLoading={editor.extractLoading}
        mf={editor.mf}
        manualStep={editor.manualStep}
        setManualStep={editor.setManualStep}
        updateMf={editor.updateMf}
        pagePassword={editor.pagePassword}
        setPagePassword={editor.setPagePassword}
        onStartAi={editor.startAiMode}
        onStartManual={editor.startManualMode}
        onCardExtract={editor.handleCardExtract}
        onAiGenerate={editor.handleAiGenerate}
        onAiEditPreview={editor.handleAiEditPreview}
        onManualPreview={editor.handleManualPreview}
      />

      <ToastStack
        toasts={editor.toasts}
        onDismiss={editor.dismissToast}
        onCopy={editor.handleCopy}
      />

      <PublishingOverlay visible={editor.publishing} />

      <ChristianBackgroundMusic shouldPlay={editor.themeReady} paused={!!editor.editMode} />
    </div>
  );
}
