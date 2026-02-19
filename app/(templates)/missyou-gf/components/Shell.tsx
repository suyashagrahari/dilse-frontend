"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setTemplateData } from "@/store/templateEditSlice";
import { toggleFavoriteAsync } from "@/store/favoritesSlice";
import { config } from "../config";
import BottomNav from "./BottomNav";
import CoverPage from "./CoverPage";
import LetterPage from "./LetterPage";
import FinalPage from "./FinalPage";
import EditPanel from "./EditPanel";
import AuthModal from "@/components/AuthModal";

export default function Shell() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const savedData = useAppSelector((s) => s.templateEdit.savedData[config.slug]);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const isFavorited = useAppSelector((s) => s.favorites.slugs.includes(config.slug));

  useEffect(() => {
    document.title = `${config.title} | Gifts`;
  }, []);

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
    dispatch(setTemplateData({ templateId: config.slug, data: { heading: config.previewText, body: config.bodyText, senderName: "With Love ❤️" } }));
  }

  const handleAction = useCallback((actionId: string) => {
    setMenuOpen(false);
    switch (actionId) {
      case "home": router.push("/"); break;
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
  }, [router, isAuthenticated, dispatch]);

  const tabIds = config.tabs.map((t) => t.id);

  return (
    <div className="fixed inset-0 flex flex-col">
      <div className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          {activeTab === tabIds[0] && <CoverPage key="cover" heading={editData.heading} onNext={() => setActiveTab(tabIds[1])} />}
          {activeTab === tabIds[1] && <LetterPage key="letter" body={editData.body} senderName={editData.senderName} />}
          {activeTab === tabIds[2] && <FinalPage key="final" senderName={editData.senderName} />}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {copied && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] bg-card shadow-elevated rounded-2xl px-5 py-3 flex items-center gap-2">
            <Check size={16} className="text-green-500" /><span className="text-sm font-medium">Link copied!</span>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {menuOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/10 backdrop-blur-[2px] z-40" onClick={() => setMenuOpen(false)} />}
      </AnimatePresence>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} menuOpen={menuOpen} onMenuToggle={() => setMenuOpen((prev) => !prev)} onAction={handleAction} isFavorited={isFavorited} copied={copied} />
      <AnimatePresence>{isEditing && <EditPanel onClose={() => setIsEditing(false)} />}</AnimatePresence>
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
