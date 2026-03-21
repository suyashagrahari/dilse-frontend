"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Home, Heart, Image, MapPin, Flower2, Pencil } from "lucide-react";
import { TABS, type TabId } from "./types";

const TAB_ICONS: Record<TabId, typeof Home> = {
  home: Home,
  couple: Heart,
  gallery: Image,
  location: MapPin,
  blessings: Flower2,
};

interface Props {
  tab: TabId;
  onTabChange: (id: TabId) => void;
  onEdit: () => void;
  isPersonalized: boolean;
  isPreview?: boolean;
}

export default memo(function BottomNav({
  tab,
  onTabChange,
  onEdit,
  isPersonalized,
  isPreview = false,
}: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none lg:hidden">
      <div className="flex justify-center mb-4 pointer-events-auto">
        <div
          className="flex items-center gap-1 px-2 py-2 rounded-full"
          style={{
            background: "var(--rec-nav-bg)",
            backdropFilter: "blur(30px)",
            WebkitBackdropFilter: "blur(30px)",
            border: "1px solid var(--rec-nav-border)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          {TABS.map(({ id }) => {
            const Icon = TAB_ICONS[id];
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => onTabChange(id)}
                className="relative w-12 h-12 flex items-center justify-center rounded-full transition-all duration-250"
              >
                {active && (
                  <motion.div
                    layoutId="rec-pill"
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: "rgba(212,165,116,0.1)",
                      border: "1px solid rgba(212,165,116,0.15)",
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <Icon
                  size={19}
                  strokeWidth={active ? 2 : 1.4}
                  className="relative z-10 transition-all"
                  style={{ color: active ? "var(--rec-accent)" : "hsl(var(--rec-muted-fg))" }}
                />
              </button>
            );
          })}

          {/* Edit button — shown only after save, hidden in preview */}
          {!isPreview && isPersonalized && (
            <>
              <div className="w-px h-5 mx-0.5" style={{ background: "rgba(255,255,255,0.06)" }} />
              <button
                onClick={onEdit}
                className="relative w-12 h-12 flex items-center justify-center rounded-full transition-all"
              >
                <Pencil
                  size={18}
                  strokeWidth={1.5}
                  className="relative z-10"
                  style={{ color: "var(--rec-accent)" }}
                />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
});
