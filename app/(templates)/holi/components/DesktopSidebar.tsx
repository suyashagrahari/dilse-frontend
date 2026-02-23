"use client";

import { memo, useCallback } from "react";
import { motion } from "framer-motion";
import { Home, Heart, Music, Info, Gift, Sun, Moon, Pencil, Send, Share2, ArrowLeft } from "lucide-react";
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
  onEdit: () => void;
  onBack: () => void;
  showPublish?: boolean;
  showShare?: boolean;
  shareLabel?: string;
  onPublish?: () => void;
  onShare?: () => void;
}

export default memo(function DesktopSidebar({
  tab, onTabChange, darkMode, toggleDark,
  onEdit, onBack,
  showPublish, showShare, shareLabel, onPublish, onShare,
}: Props) {
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
      {/* Logo */}
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

      {/* Tab nav */}
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

      {/* Actions footer */}
      <div className="p-4 space-y-2" style={{ borderTop: "1px solid hsl(var(--holi-border))" }}>

        {/* Edit — always visible */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onEdit}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.98]"
          style={{ background: "var(--holi-gradient-cta)", color: "#fff", boxShadow: "0 4px 18px rgba(233,30,99,0.3)", fontFamily: "'DM Sans', sans-serif" }}
        >
          <Pencil size={15} />
          Edit Card
        </motion.button>

        {/* Publish — conditional */}
        {showPublish && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onPublish}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.98]"
            style={{ background: "rgba(76,175,80,0.15)", color: "var(--holi-green)", border: "1px solid rgba(76,175,80,0.3)", fontFamily: "'DM Sans', sans-serif" }}
          >
            <Send size={15} />
            Publish
          </motion.button>
        )}

        {/* Share / Copy — conditional */}
        {showShare && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onShare}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.98]"
            style={{ background: "rgba(255,152,0,0.12)", color: "var(--holi-orange)", border: "1px solid rgba(255,152,0,0.25)", fontFamily: "'DM Sans', sans-serif" }}
          >
            <Share2 size={15} />
            {shareLabel || "Share"}
          </motion.button>
        )}

        {/* Back + theme row */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all hover:opacity-80"
            style={{ color: "hsl(var(--holi-muted-fg))", background: "hsl(var(--holi-surface))" }}
          >
            <ArrowLeft size={14} />
            Back
          </button>
          <button
            onClick={toggleDark}
            className="p-2 rounded-lg transition-all hover:opacity-80"
            style={{ color: "hsl(var(--holi-muted-fg))" }}
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>
    </aside>
  );
});
