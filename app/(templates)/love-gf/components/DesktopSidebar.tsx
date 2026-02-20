"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Home, Image, Music, Gamepad2, Heart, Sun, Moon, ArrowLeft } from "lucide-react";
import { TABS, type TabId } from "./types";

const TAB_ICONS: Record<TabId, typeof Home> = {
  home: Home,
  gallery: Image,
  music: Music,
  games: Gamepad2,
  notes: Heart,
};

interface Props {
  tab: TabId;
  onTabChange: (id: TabId) => void;
  coupleNames: { person1: string; person2: string };
  darkMode: boolean;
  toggleDark: () => void;
  onBack: () => void;
}

export default memo(function DesktopSidebar({ tab, onTabChange, coupleNames, darkMode, toggleDark, onBack }: Props) {
  return (
    <motion.aside
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-64 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-border/30 z-40 py-6 px-3"
    >
      <div className="text-center mb-8 px-3">
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30 border-2 border-pink-200 dark:border-pink-800/40 flex items-center justify-center text-2xl mb-3 shadow-sm"
        >
          💑
        </motion.div>
        <h2
          className="text-base font-bold leading-tight"
          style={{ background: "linear-gradient(135deg, hsl(338 80% 65%), hsl(350 85% 60%))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
        >
          {coupleNames.person1} & {coupleNames.person2}
        </h2>
        <p className="text-[10px] text-muted-foreground mt-0.5">💕 Together forever</p>
      </div>

      <nav className="flex-1 space-y-1 px-1">
        {TABS.map(({ id, label }) => {
          const Icon = TAB_ICONS[id];
          const active = tab === id;
          return (
            <motion.button
              key={id}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onTabChange(id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-all duration-200 text-sm font-medium ${
                active
                  ? "bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-200/50 dark:border-pink-800/30"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <Icon size={17} strokeWidth={active ? 2.2 : 1.5} />
              {label}
              {active && (
                <motion.div
                  layoutId="sidebar-dot"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-pink-500"
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      <div className="px-1 space-y-1 mt-4 border-t border-border/30 pt-4">
        <button
          onClick={toggleDark}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all"
        >
          {darkMode ? <Sun size={17} strokeWidth={1.5} /> : <Moon size={17} strokeWidth={1.5} />}
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
        <button
          onClick={onBack}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all"
        >
          <ArrowLeft size={17} strokeWidth={1.5} />
          Back to Templates
        </button>
      </div>
    </motion.aside>
  );
});
