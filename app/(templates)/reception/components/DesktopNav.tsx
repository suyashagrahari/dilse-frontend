"use client";

import { memo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Home, Heart, Camera, MapPin, Flower2,
  Sun, Moon, Pencil, Send, Share2, ArrowLeft,
} from "lucide-react";
import { TABS, type TabId } from "./types";

const TAB_ICONS: Record<TabId, typeof Home> = {
  home: Home,
  couple: Heart,
  gallery: Camera,
  location: MapPin,
  blessings: Flower2,
};

interface Props {
  tab: TabId;
  onTabChange: (id: TabId) => void;
  coupleNames: { bride: string; groom: string };
  darkMode: boolean;
  toggleDark: () => void;
  onBack: () => void;
  onEdit: () => void;
  showPublish?: boolean;
  showShare?: boolean;
  shareLabel?: string;
  onPublish?: () => void;
  onShare?: () => void;
}

export default memo(function DesktopNav({
  tab, onTabChange, coupleNames, darkMode, toggleDark, onBack,
  onEdit, showPublish, showShare, shareLabel, onPublish, onShare,
}: Props) {
  const handleTab = useCallback(
    (id: TabId) => () => onTabChange(id),
    [onTabChange],
  );

  return (
    <motion.aside
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-64 z-40"
      style={{
        background: "var(--rec-sidebar-bg)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderRight: "1px solid var(--rec-sidebar-border)",
      }}
    >
      {/* Header */}
      <div
        className="text-center py-6 px-4"
        style={{ borderBottom: "1px solid var(--rec-sidebar-border)" }}
      >
        <motion.div
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl mb-3 shadow-md"
          style={{
            background: "var(--rec-gradient-accent)",
            boxShadow: "0 0 24px var(--rec-accent-glow)",
          }}
        >
          🥂
        </motion.div>
        <h2
          className="text-base font-bold leading-tight"
          style={{
            background: "var(--rec-gradient-accent)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontFamily: "'Cormorant Garamond', serif",
          }}
        >
          {coupleNames.bride || "Bride"} &amp; {coupleNames.groom || "Groom"}
        </h2>
        <p
          className="text-[11px] mt-0.5"
          style={{ color: "var(--rec-accent-light)", fontFamily: "'DM Sans', sans-serif" }}
        >
          Wedding Reception ✨
        </p>
      </div>

      {/* Tab navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {TABS.map(({ id, label, emoji }) => {
          const Icon = TAB_ICONS[id];
          const active = tab === id;
          return (
            <motion.button
              key={id}
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleTab(id)}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left text-sm font-medium transition-all"
              style={
                active
                  ? {
                      background: darkMode
                        ? "rgba(212,165,116,0.12)"
                        : "rgba(184,134,11,0.08)",
                      color: "var(--rec-accent)",
                      border: `1px solid ${darkMode ? "rgba(212,165,116,0.25)" : "rgba(184,134,11,0.18)"}`,
                    }
                  : { color: "hsl(var(--rec-muted-fg))", border: "1px solid transparent" }
              }
            >
              <Icon size={17} strokeWidth={active ? 2.2 : 1.5} />
              <span>
                {emoji} {label}
              </span>
              {active && (
                <motion.div
                  layoutId="rec-sidebar-dot"
                  className="ml-auto w-1.5 h-1.5 rounded-full"
                  style={{ background: "var(--rec-accent)" }}
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Action buttons footer */}
      <div
        className="p-3 space-y-2"
        style={{ borderTop: "1px solid var(--rec-sidebar-border)" }}
      >
        {/* Edit */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onEdit}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all"
          style={{
            background: "var(--rec-gradient-accent)",
            color: "var(--rec-accent-fg)",
            boxShadow: "0 4px 18px var(--rec-accent-glow)",
          }}
        >
          <Pencil size={15} />
          Edit Reception
        </motion.button>

        {/* Publish */}
        {showPublish && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onPublish}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all"
            style={{
              background: "rgba(16,185,129,0.12)",
              color: "#10b981",
              border: "1px solid rgba(16,185,129,0.3)",
            }}
          >
            <Send size={15} />
            Publish
          </motion.button>
        )}

        {/* Share */}
        {showShare && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onShare}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all"
            style={{
              background: "rgba(99,102,241,0.12)",
              color: "#818cf8",
              border: "1px solid rgba(99,102,241,0.25)",
            }}
          >
            <Share2 size={15} />
            {shareLabel || "Share"}
          </motion.button>
        )}

        {/* Back + theme toggle */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all hover:opacity-80"
            style={{ color: "hsl(var(--rec-muted-fg))", background: "var(--rec-glass)" }}
          >
            <ArrowLeft size={13} />
            Back
          </button>
          <button
            onClick={toggleDark}
            className="p-2 rounded-lg transition-all hover:opacity-80"
            style={{ color: "hsl(var(--rec-muted-fg))" }}
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>
    </motion.aside>
  );
});
