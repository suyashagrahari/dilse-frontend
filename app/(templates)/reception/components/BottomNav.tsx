"use client";

import { useState, memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Heart, Image, MapPin, Flower2,
  MoreHorizontal, Pencil, Send, Share2, ArrowLeft, Sun, Moon,
} from "lucide-react";
import { TABS, type TabId } from "./types";

const TAB_ICONS: Record<TabId, typeof Home> = {
  home: Home,
  couple: Heart,
  gallery: Image,
  location: MapPin,
  blessings: Flower2,
};

interface Props {
  tab: TabId;
  onTabChange: (id: TabId) => void;
  onEdit: () => void;
  onBack: () => void;
  showPublish: boolean;
  showShare: boolean;
  shareLabel: string;
  onPublish: () => void;
  onShare: () => void;
  darkMode: boolean;
  toggleDark: () => void;
}

export default memo(function BottomNav({
  tab,
  onTabChange,
  onEdit,
  onBack,
  showPublish,
  showShare,
  shareLabel,
  onPublish,
  onShare,
  darkMode,
  toggleDark,
}: Props) {
  const [moreOpen, setMoreOpen] = useState(false);

  const handleTab = useCallback(
    (id: TabId) => () => {
      onTabChange(id);
      setMoreOpen(false);
    },
    [onTabChange],
  );

  const handleThemeToggle = useCallback(() => {
    toggleDark();
    setMoreOpen(false);
  }, [toggleDark]);

  const moreItems = [
    {
      icon: Pencil,
      label: "Edit",
      color: "var(--rec-accent)",
      bg: "rgba(212,165,116,0.15)",
      action: () => { setMoreOpen(false); onEdit(); },
    },
    ...(showPublish
      ? [{
          icon: Send,
          label: "Publish",
          color: "var(--rec-sage)",
          bg: "rgba(127,184,176,0.15)",
          action: () => { setMoreOpen(false); onPublish(); },
        }]
      : []),
    ...(showShare
      ? [{
          icon: Share2,
          label: shareLabel,
          color: "var(--rec-rose)",
          bg: "rgba(196,166,181,0.15)",
          action: () => { setMoreOpen(false); onShare(); },
        }]
      : []),
    {
      icon: darkMode ? Sun : Moon,
      label: darkMode ? "Light" : "Dark",
      color: darkMode ? "#E8CBAE" : "var(--rec-rose)",
      bg: darkMode ? "rgba(232,203,174,0.12)" : "rgba(196,166,181,0.12)",
      action: handleThemeToggle,
    },
    {
      icon: ArrowLeft,
      label: "Back",
      color: "hsl(var(--rec-muted-fg))",
      bg: "rgba(255,255,255,0.05)",
      action: () => { setMoreOpen(false); onBack(); },
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none lg:hidden">
      <div className="flex justify-center mb-4 pointer-events-auto">
        <AnimatePresence>
          {moreOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMoreOpen(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-[3px] -z-10"
              />
              <motion.div
                className="absolute bottom-full mb-3 flex gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                {moreItems.map((item, i) => (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={item.action}
                    className="flex flex-col items-center gap-1"
                  >
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all active:scale-90"
                      style={{ background: item.bg, border: `1px solid ${item.bg}` }}
                    >
                      <item.icon size={17} style={{ color: item.color }} strokeWidth={1.8} />
                    </div>
                    <span className="text-[8px] font-medium" style={{ color: "hsl(var(--rec-muted-fg))" }}>
                      {item.label}
                    </span>
                  </motion.button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div
          className="flex items-center gap-1 px-2 py-2 rounded-full"
          style={{
            background: "var(--rec-nav-bg)",
            backdropFilter: "blur(30px)",
            WebkitBackdropFilter: "blur(30px)",
            border: "1px solid var(--rec-nav-border)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          {TABS.map(({ id }) => {
            const Icon = TAB_ICONS[id];
            const active = tab === id && !moreOpen;
            return (
              <button
                key={id}
                onClick={handleTab(id)}
                className="relative w-12 h-12 flex items-center justify-center rounded-full transition-all duration-250"
              >
                {active && (
                  <motion.div
                    layoutId="rec-pill"
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: "rgba(212,165,116,0.1)",
                      border: "1px solid rgba(212,165,116,0.15)",
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <Icon
                  size={19}
                  strokeWidth={active ? 2 : 1.4}
                  className="relative z-10 transition-all"
                  style={{ color: active ? "var(--rec-accent)" : "hsl(var(--rec-muted-fg))" }}
                />
              </button>
            );
          })}

          <div className="w-px h-5 mx-0.5" style={{ background: "rgba(255,255,255,0.06)" }} />

          <button
            onClick={() => setMoreOpen((o) => !o)}
            className="relative w-12 h-12 flex items-center justify-center rounded-full transition-all"
          >
            {moreOpen && (
              <motion.div
                layoutId="rec-pill"
                className="absolute inset-0 rounded-full"
                style={{
                  background: "rgba(212,165,116,0.1)",
                  border: "1px solid rgba(212,165,116,0.15)",
                }}
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            <MoreHorizontal
              size={19}
              strokeWidth={moreOpen ? 2 : 1.4}
              className="relative z-10"
              style={{ color: moreOpen ? "var(--rec-accent)" : "hsl(var(--rec-muted-fg))" }}
            />
          </button>
        </div>
      </div>
    </div>
  );
});
