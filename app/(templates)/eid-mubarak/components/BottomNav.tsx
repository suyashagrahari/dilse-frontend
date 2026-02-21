"use client";

import { useState, memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Heart, Music, BookOpen, Gift,
  MoreHorizontal, Pencil, Send, Share2, ArrowLeft, Sun, Moon,
} from "lucide-react";
import { TABS, type TabId } from "./types";

const TAB_ICONS: Record<TabId, typeof Home> = {
  home: Home,
  wish: Gift,
  greetings: Heart,
  playlist: Music,
  dua: BookOpen,
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
  tab, onTabChange, onEdit, onBack,
  showPublish, showShare, shareLabel, onPublish, onShare,
  darkMode, toggleDark,
}: Props) {
  const [moreOpen, setMoreOpen] = useState(false);

  const handleTab = useCallback(
    (id: TabId) => () => { onTabChange(id); setMoreOpen(false); },
    [onTabChange],
  );

  const handleThemeToggle = useCallback(() => { toggleDark(); setMoreOpen(false); }, [toggleDark]);

  const moreItems = [
    { icon: Pencil, label: "Edit", color: "var(--eid-gold)", bg: "rgba(197,160,63,0.15)", action: () => { setMoreOpen(false); onEdit(); } },
    ...(showPublish ? [{ icon: Send, label: "Publish", color: "var(--eid-teal)", bg: "rgba(58,143,125,0.15)", action: () => { setMoreOpen(false); onPublish(); } }] : []),
    ...(showShare ? [{ icon: Share2, label: shareLabel, color: "var(--eid-gold-light)", bg: "rgba(224,201,110,0.12)", action: () => { setMoreOpen(false); onShare(); } }] : []),
    { icon: darkMode ? Sun : Moon, label: darkMode ? "Light" : "Dark", color: darkMode ? "var(--eid-gold-light)" : "var(--eid-gold)", bg: darkMode ? "rgba(224,201,110,0.12)" : "rgba(197,160,63,0.12)", action: handleThemeToggle },
    { icon: ArrowLeft, label: "Back", color: "hsl(var(--eid-muted-fg))", bg: "rgba(255,255,255,0.05)", action: () => { setMoreOpen(false); onBack(); } },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none lg:hidden">
      <div className="flex justify-center mb-3 pointer-events-auto">
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
                    <span className="text-[8px] font-medium" style={{ color: "hsl(var(--eid-muted-fg))" }}>
                      {item.label}
                    </span>
                  </motion.button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div
          className="flex items-center gap-0.5 px-2 py-1.5 rounded-2xl"
          style={{
            background: "var(--eid-nav-bg)",
            backdropFilter: "blur(30px)",
            WebkitBackdropFilter: "blur(30px)",
            border: "1px solid var(--eid-nav-border)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
          }}
        >
          {TABS.map(({ id, label }) => {
            const Icon = TAB_ICONS[id];
            const active = tab === id && !moreOpen;
            return (
              <button
                key={id}
                onClick={handleTab(id)}
                className="relative flex flex-col items-center py-1 px-2.5"
              >
                {active ? (
                  <motion.div
                    layoutId="eid-nav-active"
                    className="absolute -top-4 w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                      background: "var(--eid-gradient-gold)",
                      boxShadow: "0 4px 16px rgba(197,160,63,0.4)",
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  >
                    <Icon size={18} style={{ color: "hsl(var(--eid-bg))" }} strokeWidth={2} />
                  </motion.div>
                ) : (
                  <Icon size={18} strokeWidth={1.5} style={{ color: "hsl(var(--eid-muted-fg))" }} />
                )}
                <span
                  className="text-[9px] font-semibold"
                  style={{
                    color: active ? "var(--eid-gold)" : "hsl(var(--eid-muted-fg))",
                    marginTop: active ? "1.25rem" : "0.125rem",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {label}
                </span>
              </button>
            );
          })}

          <div className="w-px h-7 mx-0.5" style={{ background: "rgba(255,255,255,0.06)" }} />

          <button
            onClick={() => setMoreOpen((o) => !o)}
            className="relative flex flex-col items-center py-1 px-2"
          >
            {moreOpen ? (
              <motion.div
                layoutId="eid-nav-active"
                className="absolute -top-4 w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: "var(--eid-gradient-gold)",
                  boxShadow: "0 4px 16px rgba(197,160,63,0.4)",
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                <MoreHorizontal size={18} style={{ color: "hsl(var(--eid-bg))" }} strokeWidth={2} />
              </motion.div>
            ) : (
              <MoreHorizontal size={18} strokeWidth={1.5} style={{ color: "hsl(var(--eid-muted-fg))" }} />
            )}
            <span
              className="text-[9px] font-semibold"
              style={{
                color: moreOpen ? "var(--eid-gold)" : "hsl(var(--eid-muted-fg))",
                marginTop: moreOpen ? "1.25rem" : "0.125rem",
              }}
            >
              More
            </span>
          </button>
        </div>
      </div>
    </div>
  );
});
