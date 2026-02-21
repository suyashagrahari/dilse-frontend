"use client";

import { useState, memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Heart, CalendarDays, Image, Flower2,
  MoreHorizontal, Pencil, Send, Share2, ArrowLeft, Sun, Moon,
} from "lucide-react";
import { TABS, type TabId } from "./types";

const TAB_ICONS: Record<TabId, typeof Home> = {
  home: Home,
  couple: Heart,
  events: CalendarDays,
  gallery: Image,
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
      gradient: "from-amber-500 to-yellow-600",
      action: () => { setMoreOpen(false); onEdit(); },
    },
    ...(showPublish
      ? [{
          icon: Send,
          label: "Publish",
          gradient: "from-emerald-500 to-teal-600",
          action: () => { setMoreOpen(false); onPublish(); },
        }]
      : []),
    ...(showShare
      ? [{
          icon: Share2,
          label: shareLabel,
          gradient: "from-blue-500 to-cyan-500",
          action: () => { setMoreOpen(false); onShare(); },
        }]
      : []),
    {
      icon: darkMode ? Sun : Moon,
      label: darkMode ? "Light" : "Dark",
      gradient: darkMode ? "from-yellow-400 to-orange-400" : "from-indigo-500 to-purple-600",
      action: handleThemeToggle,
    },
    {
      icon: ArrowLeft,
      label: "Back",
      gradient: "from-gray-500 to-gray-600",
      action: () => { setMoreOpen(false); onBack(); },
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none lg:hidden">
      <div className="mx-3 mb-3 md:mx-auto md:max-w-md pointer-events-auto">
        <AnimatePresence>
          {moreOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMoreOpen(false)}
                className="fixed inset-0 bg-black/20 backdrop-blur-[2px] -z-10"
              />
              <div className="flex justify-center gap-4 mb-3">
                {moreItems.map((item, i) => (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.8 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={item.action}
                    className="flex flex-col items-center gap-1.5"
                  >
                    <div
                      className={`w-12 h-12 rounded-full bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-xl`}
                    >
                      <item.icon size={19} className="text-white" strokeWidth={2} />
                    </div>
                    <span className="text-[9px] font-semibold text-foreground/50">
                      {item.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </>
          )}
        </AnimatePresence>

        <div className="relative">
          <div
            className="relative rounded-2xl shadow-lg overflow-hidden"
            style={{
              background: "var(--wed-glass-strong)",
              backdropFilter: "blur(30px)",
              WebkitBackdropFilter: "blur(30px)",
              border: "1px solid var(--wed-glass-border)",
            }}
          >
            <div className="flex items-stretch px-1.5 py-1">
              {TABS.map(({ id, label }) => {
                const Icon = TAB_ICONS[id];
                const active = tab === id && !moreOpen;
                return (
                  <button key={id} onClick={handleTab(id)} className="flex-1 relative">
                    <div className="flex flex-col items-center justify-center gap-0.5 py-2 rounded-xl transition-all duration-200">
                      {active && (
                        <motion.div
                          layoutId="wed-nav-bg"
                          className="absolute inset-1 rounded-lg"
                          style={{ background: "rgba(184,134,11,0.08)" }}
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                      <Icon
                        size={18}
                        strokeWidth={active ? 2.2 : 1.5}
                        className="relative z-10"
                        style={{ color: active ? "var(--wed-accent-gold)" : undefined }}
                      />
                      <span
                        className={`text-[9px] font-semibold relative z-10 ${active ? "" : "opacity-60"}`}
                        style={{ color: active ? "var(--wed-accent-gold)" : undefined }}
                      >
                        {label}
                      </span>
                    </div>
                  </button>
                );
              })}

              <button onClick={() => setMoreOpen((o) => !o)} className="flex-1 relative">
                <div className="flex flex-col items-center justify-center gap-0.5 py-2 rounded-xl transition-all duration-200">
                  {moreOpen && (
                    <motion.div
                      layoutId="wed-nav-bg"
                      className="absolute inset-1 rounded-lg"
                      style={{ background: "rgba(184,134,11,0.08)" }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <MoreHorizontal
                    size={18}
                    strokeWidth={moreOpen ? 2.2 : 1.5}
                    className="relative z-10"
                    style={{ color: moreOpen ? "var(--wed-accent-gold)" : undefined }}
                  />
                  <span
                    className={`text-[9px] font-semibold relative z-10 ${moreOpen ? "" : "opacity-60"}`}
                    style={{ color: moreOpen ? "var(--wed-accent-gold)" : undefined }}
                  >
                    More
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
