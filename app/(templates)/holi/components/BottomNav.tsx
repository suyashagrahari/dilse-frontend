"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Home, Heart, Music, Info, Gift, Pencil } from "lucide-react";
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
  onEdit: () => void;
  isPersonalized: boolean;
  isPreview: boolean;
  isEditing: boolean;
}

export default memo(function BottomNav({ tab, onTabChange, onEdit, isPersonalized, isPreview, isEditing }: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none lg:hidden">
      <div className="flex justify-center mb-3 pointer-events-auto">
        <div
          className="flex items-center gap-0.5 px-2 py-1.5 rounded-2xl"
          style={{
            background: "var(--holi-nav-bg)",
            backdropFilter: "blur(30px)",
            WebkitBackdropFilter: "blur(30px)",
            border: "1px solid var(--holi-nav-border)",
            boxShadow: "var(--holi-glass-shadow)",
          }}
        >
          {TABS.map(({ id, label }) => {
            const Icon = TAB_ICONS[id];
            const color = TAB_COLORS[id];
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => onTabChange(id)}
                className="relative flex flex-col items-center py-1 px-2.5"
              >
                {active ? (
                  <motion.div
                    layoutId="holi-nav-active"
                    className="absolute -top-4 w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                      background: color,
                      boxShadow: `0 4px 16px ${color}66`,
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  >
                    <Icon size={18} style={{ color: "#fff" }} strokeWidth={2} />
                  </motion.div>
                ) : (
                  <Icon size={18} strokeWidth={1.5} style={{ color: "hsl(var(--holi-muted-fg))" }} />
                )}
                <span
                  className="text-[9px] font-semibold"
                  style={{
                    color: active ? color : "hsl(var(--holi-muted-fg))",
                    marginTop: active ? "1.25rem" : "0.125rem",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {label}
                </span>
              </button>
            );
          })}

          {isPersonalized && !isPreview && !isEditing && (
            <>
              <div className="w-px h-7 mx-0.5" style={{ background: "hsl(var(--holi-border))" }} />
              <button
                onClick={onEdit}
                className="relative flex flex-col items-center py-1 px-2"
              >
                <Pencil size={18} strokeWidth={1.5} style={{ color: "var(--holi-pink)" }} />
                <span
                  className="text-[9px] font-semibold"
                  style={{ color: "var(--holi-pink)", marginTop: "0.125rem", fontFamily: "'DM Sans', sans-serif" }}
                >
                  Edit
                </span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
});
