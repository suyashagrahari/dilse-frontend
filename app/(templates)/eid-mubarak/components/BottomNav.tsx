"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Home, Heart, Music, BookOpen, Gift, Pencil } from "lucide-react";
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
            background: "var(--eid-nav-bg)",
            backdropFilter: "blur(30px)",
            WebkitBackdropFilter: "blur(30px)",
            border: "1px solid var(--eid-nav-border)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
          }}
        >
          {TABS.map(({ id, label }) => {
            const Icon = TAB_ICONS[id];
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => onTabChange(id)}
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

          {isPersonalized && !isPreview && !isEditing && (
            <>
              <div className="w-px h-7 mx-0.5" style={{ background: "rgba(255,255,255,0.06)" }} />
              <button
                onClick={onEdit}
                className="relative flex flex-col items-center py-1 px-2"
              >
                <Pencil size={18} strokeWidth={1.5} style={{ color: "var(--eid-gold)" }} />
                <span
                  className="text-[9px] font-semibold"
                  style={{ color: "var(--eid-gold)", marginTop: "0.125rem", fontFamily: "'DM Sans', sans-serif" }}
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
