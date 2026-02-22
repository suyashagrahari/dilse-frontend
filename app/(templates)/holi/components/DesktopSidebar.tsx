"use client";

import { memo, useCallback } from "react";
import { motion } from "framer-motion";
import { Home, Heart, Music, Info, Gift, Sun, Moon } from "lucide-react";
import { TABS, type TabId } from "./types";

const TAB_ICONS: Record<TabId, typeof Home> = {
  home: Home,
  wish: Gift,
  greetings: Heart,
  playlist: Music,
  more: Info,
};

const TAB_COLORS: Record<TabId, string> = {
  home: "var(--holi-orange)",
  wish: "var(--holi-pink)",
  greetings: "var(--holi-purple)",
  playlist: "var(--holi-blue)",
  more: "var(--holi-green)",
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
        background: "hsl(var(--holi-card))",
        borderRight: "1px solid hsl(var(--holi-border))",
      }}
    >
      <div className="p-6 pb-4 text-center" style={{ borderBottom: "1px solid hsl(var(--holi-border))" }}>
        <motion.div
          className="text-4xl mb-2"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          🎨
        </motion.div>
        <h1
          className="text-xl font-bold holi-text-gradient"
          style={{ fontFamily: "'Noto Serif Devanagari', serif" }}
        >
          होली है!
        </h1>
        <p
          className="text-xs mt-1"
          style={{ color: "hsl(var(--holi-muted-fg))", fontFamily: "'DM Sans', sans-serif" }}
        >
          Festival of Colors
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {TABS.map(({ id, label }) => {
          const Icon = TAB_ICONS[id];
          const color = TAB_COLORS[id];
          const active = tab === id;
          return (
            <button
              key={id}
              onClick={handleTab(id)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left"
              style={{
                background: active ? `${color}18` : "transparent",
                color: active ? color : "hsl(var(--holi-muted-fg))",
                fontWeight: active ? 600 : 400,
                fontFamily: "'DM Sans', sans-serif",
                boxShadow: active ? `0 0 20px ${color}15` : "none",
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
        style={{ borderTop: "1px solid hsl(var(--holi-border))" }}
      >
        <p
          className="text-xs"
          style={{ color: "hsl(var(--holi-muted-fg))", fontFamily: "'Noto Serif Devanagari', serif" }}
        >
          होली मुबारक! 🎨
        </p>
        <button
          onClick={toggleDark}
          className="p-2 rounded-lg transition-all"
          style={{ color: "hsl(var(--holi-muted-fg))" }}
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </aside>
  );
});
