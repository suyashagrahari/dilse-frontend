"use client";

import { memo, useCallback } from "react";
import { motion } from "framer-motion";
import { Home, Heart, Music, BookOpen, Gift, Sun, Moon } from "lucide-react";
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
  darkMode: boolean;
  toggleDark: () => void;
}

export default memo(function DesktopSidebar({ tab, onTabChange, darkMode, toggleDark }: Props) {
  const handleTab = useCallback(
    (id: TabId) => () => onTabChange(id),
    [onTabChange],
  );

  return (
    <aside
      className="hidden lg:flex fixed left-0 top-0 h-full w-56 flex-col z-50"
      style={{
        background: "hsl(var(--eid-card))",
        borderRight: "1px solid hsl(var(--eid-border))",
      }}
    >
      <div className="p-6 pb-4 text-center" style={{ borderBottom: "1px solid hsl(var(--eid-border))" }}>
        <motion.div
          className="text-4xl mb-2"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          🌙
        </motion.div>
        <h1
          className="text-xl font-bold"
          style={{ color: "var(--eid-teal)", fontFamily: "'Cormorant Garamond', serif" }}
        >
          Eid Mubarak
        </h1>
        <p
          className="text-sm mt-1"
          dir="rtl"
          lang="ur"
          style={{ color: "var(--eid-gold)", fontFamily: "'Noto Nastaliq Urdu', serif" }}
        >
          عید مبارک
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {TABS.map(({ id, label }) => {
          const Icon = TAB_ICONS[id];
          const active = tab === id;
          return (
            <button
              key={id}
              onClick={handleTab(id)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left"
              style={{
                background: active ? "rgba(197,160,63,0.12)" : "transparent",
                color: active ? "var(--eid-gold)" : "hsl(var(--eid-muted-fg))",
                fontWeight: active ? 600 : 400,
                fontFamily: "'DM Sans', sans-serif",
                boxShadow: active ? "0 0 20px rgba(197,160,63,0.15)" : "none",
              }}
            >
              <Icon size={18} strokeWidth={active ? 2 : 1.5} />
              <span className="text-sm">{label}</span>
            </button>
          );
        })}
      </nav>

      <div
        className="p-4 flex items-center justify-between"
        style={{ borderTop: "1px solid hsl(var(--eid-border))" }}
      >
        <p
          className="text-xs"
          dir="rtl"
          lang="ur"
          style={{ color: "hsl(var(--eid-muted-fg))", fontFamily: "'Noto Nastaliq Urdu', serif" }}
        >
          جزاک اللہ خیراً 🌙
        </p>
        <button
          onClick={toggleDark}
          className="p-2 rounded-lg transition-all"
          style={{ color: "hsl(var(--eid-muted-fg))" }}
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </aside>
  );
});
