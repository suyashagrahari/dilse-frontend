"use client";

import { memo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Home, Heart, CalendarDays, Image, Flower2,
  Pencil, Send, Share2, ArrowLeft,
} from "lucide-react";
import { TABS, type TabId } from "./types";

const C_ACCENT = "#546B57";
const C_MED    = "#7A9B7E";
const C_DARK   = "#2D3E32";
const C_BG     = "#FDF5F0";
const C_CARD   = "#FFFAF8";

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
  coupleNames: { bride: string; groom: string };
  onBack: () => void;
  onEdit: () => void;
  showPublish?: boolean;
  showShare?: boolean;
  shareLabel?: string;
  onPublish?: () => void;
  onShare?: () => void;
}

export default memo(function DesktopSidebar({
  tab, onTabChange, coupleNames, onBack,
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
        background: C_CARD,
        borderRight: `1px solid ${C_MED}25`,
        boxShadow: "4px 0 24px rgba(109,43,59,0.06)",
      }}
    >
      {/* Header */}
      <div
        className="text-center py-6 px-4"
        style={{ borderBottom: `1px solid ${C_MED}20` }}
      >
        <motion.div
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl mb-3 shadow-md"
          style={{
            background: `linear-gradient(135deg, ${C_ACCENT}, ${C_MED})`,
            boxShadow: `0 0 24px ${C_ACCENT}35`,
          }}
        >
          💍
        </motion.div>
        <h2 className="text-base font-bold leading-tight" style={{ color: C_DARK }}>
          {coupleNames.bride || "Bride"} &amp; {coupleNames.groom || "Groom"}
        </h2>
        <p className="text-[11px] mt-0.5" style={{ color: C_MED, fontFamily: "'Noto Serif Devanagari', serif" }}>
          शुभ विवाह ✨
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
                      background: `${C_ACCENT}12`,
                      color: C_ACCENT,
                      border: `1px solid ${C_ACCENT}28`,
                    }
                  : { color: C_DARK, border: "1px solid transparent", opacity: 0.7 }
              }
            >
              <Icon size={17} strokeWidth={active ? 2.2 : 1.5} />
              <span>{emoji} {label}</span>
              {active && (
                <motion.div
                  layoutId="sc-sidebar-dot"
                  className="ml-auto w-1.5 h-1.5 rounded-full"
                  style={{ background: C_ACCENT }}
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Action buttons footer */}
      <div
        className="p-3 space-y-2"
        style={{ borderTop: `1px solid ${C_MED}20` }}
      >
        {/* Edit — always visible */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onEdit}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-semibold text-sm text-white transition-all"
          style={{
            background: `linear-gradient(135deg, ${C_ACCENT}, ${C_MED})`,
            boxShadow: `0 4px 18px ${C_ACCENT}35`,
          }}
        >
          <Pencil size={15} />
          Edit Invitation
        </motion.button>

        {/* Publish — after saving */}
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

        {/* Share — after publishing */}
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

        {/* Back */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all hover:opacity-80"
            style={{ color: C_MED, background: `${C_ACCENT}08` }}
          >
            <ArrowLeft size={13} />
            Back
          </button>
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-sm"
            style={{ background: `${C_ACCENT}12` }}
          >
            🌸
          </div>
        </div>
      </div>
    </motion.aside>
  );
});
