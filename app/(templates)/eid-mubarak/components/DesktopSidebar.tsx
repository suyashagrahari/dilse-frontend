"use client";

import { memo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Home, Heart, Music, BookOpen, Gift,
  Sun, Moon, Pencil, Send, Share2, ArrowLeft, Loader2,
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
  darkMode: boolean;
  toggleDark: () => void;
  onEdit: () => void;
  onBack: () => void;
  showPublish: boolean;
  showShare: boolean;
  shareLabel: string;
  onPublish: () => void;
  onShare: () => void;
  isPublishing: boolean;
  recipientName?: string;
}

export default memo(function DesktopSidebar({
  tab, onTabChange, darkMode, toggleDark,
  onEdit, onBack, showPublish, showShare, shareLabel,
  onPublish, onShare, isPublishing, recipientName,
}: Props) {
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
      {/* Header */}
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
        {recipientName ? (
          <p className="text-xs mt-1 truncate" style={{ color: "hsl(var(--eid-muted-fg))" }}>
            For {recipientName}
          </p>
        ) : (
          <p
            className="text-sm mt-1"
            dir="rtl"
            lang="ur"
            style={{ color: "var(--eid-gold)", fontFamily: "'Noto Nastaliq Urdu', serif" }}
          >
            عید مبارک
          </p>
        )}
      </div>

      {/* Tab Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
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

        {/* Edit Button */}
        <div className="pt-3" style={{ borderTop: "1px solid hsl(var(--eid-border))" }}>
          <button
            onClick={onEdit}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 active:scale-[0.98]"
            style={{
              background: "rgba(197,160,63,0.08)",
              border: "1px solid rgba(197,160,63,0.2)",
              color: "var(--eid-gold)",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
            }}
          >
            <Pencil size={16} />
            <span className="text-sm">Edit Card</span>
          </button>
        </div>

        {/* Publish Button */}
        {showPublish && (
          <button
            onClick={onPublish}
            disabled={isPublishing}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
            style={{
              background: "var(--eid-gradient-gold)",
              color: "hsl(var(--eid-bg))",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              fontSize: "0.8rem",
            }}
          >
            {isPublishing ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Send size={15} />
            )}
            {isPublishing ? "Publishing..." : "Publish"}
          </button>
        )}

        {/* Share Button */}
        {showShare && (
          <button
            onClick={onShare}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 active:scale-[0.98]"
            style={{
              background: "transparent",
              border: "1px solid rgba(197,160,63,0.4)",
              color: "var(--eid-gold)",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              fontSize: "0.8rem",
            }}
          >
            <Share2 size={15} />
            {shareLabel}
          </button>
        )}
      </nav>

      {/* Footer */}
      <div
        className="p-4 flex items-center justify-between"
        style={{ borderTop: "1px solid hsl(var(--eid-border))" }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs transition-all hover:opacity-80"
          style={{ color: "hsl(var(--eid-muted-fg))", fontFamily: "'DM Sans', sans-serif" }}
        >
          <ArrowLeft size={13} />
          Back
        </button>
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
