"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setTemplateData } from "@/store/templateEditSlice";
import { toggleFavoriteAsync } from "@/store/favoritesSlice";
import type { TemplatePageConfig } from "@/types/template-config";
import AuthModal from "@/components/AuthModal";

interface TemplateShellProps {
  config: TemplatePageConfig;
  CoverPage: React.ComponentType<{
    bgGradient: string;
    emoji: string;
    heading: string;
    config: TemplatePageConfig;
    onNext: () => void;
  }>;
  LetterPage: React.ComponentType<{
    bgGradient: string;
    emoji: string;
    body: string;
    senderName: string;
    config: TemplatePageConfig;
  }>;
  FinalPage: React.ComponentType<{
    bgGradient: string;
    senderName: string;
    config: TemplatePageConfig;
  }>;
  BottomNav: React.ComponentType<{
    config: TemplatePageConfig;
    activeTab: string;
    onTabChange: (tabId: string) => void;
    menuOpen: boolean;
    onMenuToggle: () => void;
    onAction: (actionId: string) => void;
    isFavorited: boolean;
    copied: boolean;
  }>;
  EditPanel: React.ComponentType<{
    config: TemplatePageConfig;
    onClose: () => void;
  }>;
  children?: React.ReactNode;
}

export default function TemplateShell({
  config,
  CoverPage,
  LetterPage,
  FinalPage,
  BottomNav,
  EditPanel,
  children,
}: TemplateShellProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const savedData = useAppSelector((s) => s.templateEdit.savedData[config.slug]);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const isFavorited = useAppSelector((s) => s.favorites.slugs.includes(config.slug));

  useEffect(() => {
    document.title = `${config.title} | Gifts`;
  }, [config.title]);

  const [activeTab, setActiveTab] = useState(config.tabs[0]?.id || "cover");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [copied, setCopied] = useState(false);

  const editData = savedData || {
    heading: config.previewText,
    body: config.bodyText,
    senderName: "With Love ❤️",
  };

  if (!savedData) {
    dispatch(
      setTemplateData({
        templateId: config.slug,
        data: {
          heading: config.previewText,
          body: config.bodyText,
          senderName: "With Love ❤️",
        },
      })
    );
  }

  const handleAction = useCallback(
    (actionId: string) => {
      setMenuOpen(false);
      switch (actionId) {
        case "home":
          router.push("/");
          break;
        case "favorite":
          dispatch(toggleFavoriteAsync(config.slug));
          break;
        case "share":
          navigator.clipboard.writeText(window.location.href);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
          break;
        case "edit":
          if (isAuthenticated) {
            setTimeout(() => setIsEditing(true), 200);
          } else {
            setTimeout(() => setShowAuth(true), 200);
          }
          break;
      }
    },
    [router, isAuthenticated, dispatch]
  );

  const tabIds = config.tabs.map((t) => t.id);
  const coverTabId = tabIds[0];
  const letterTabId = tabIds[1];
  const finalTabId = tabIds[2];

  return (
    <div className="fixed inset-0 flex flex-col">
      <div className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          {activeTab === coverTabId && (
            <CoverPage
              key="cover"
              bgGradient={config.bgGradient}
              emoji={config.emoji}
              heading={editData.heading}
              config={config}
              onNext={() => setActiveTab(letterTabId)}
            />
          )}
          {activeTab === letterTabId && (
            <LetterPage
              key="letter"
              bgGradient={config.bgGradient}
              emoji={config.emoji}
              body={editData.body}
              senderName={editData.senderName}
              config={config}
            />
          )}
          {activeTab === finalTabId && (
            <FinalPage
              key="final"
              bgGradient={config.bgGradient}
              senderName={editData.senderName}
              config={config}
            />
          )}
        </AnimatePresence>
        {children}
      </div>

      {/* Copied Toast */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] bg-card shadow-elevated rounded-2xl px-5 py-3 flex items-center gap-2"
          >
            <Check size={16} className="text-green-500" />
            <span className="text-sm font-medium">Link copied!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action menu backdrop */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/10 backdrop-blur-[2px] z-40"
            onClick={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      <BottomNav
        config={config}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        menuOpen={menuOpen}
        onMenuToggle={() => setMenuOpen((prev) => !prev)}
        onAction={handleAction}
        isFavorited={isFavorited}
        copied={copied}
      />

      <AnimatePresence>
        {isEditing && (
          <EditPanel config={config} onClose={() => setIsEditing(false)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showAuth && (
          <AuthModal
            onClose={() => setShowAuth(false)}
            onSuccess={() => {
              setShowAuth(false);
              setIsEditing(true);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
