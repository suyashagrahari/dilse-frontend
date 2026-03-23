"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import {
  Home, Heart, CalendarDays, Image, Flower2, Pencil,
} from "lucide-react";
import { TABS, type TabId } from "./types";

const C_ACCENT = "#AB1C3E";
const C_MED    = "#CB6B82";

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
  onEdit: () => void;
  onBack: () => void;
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
      <div className="mx-auto max-w-xs sm:max-w-sm md:max-w-md mb-3 px-3 pointer-events-auto">
        <div
          className="relative rounded-2xl shadow-lg overflow-hidden"
          style={{
            background: "rgba(253,245,240,0.92)",
            backdropFilter: "blur(30px)",
            WebkitBackdropFilter: "blur(30px)",
            border: `1px solid ${C_MED}25`,
            boxShadow: `0 8px 32px rgba(171,28,62,0.15)`,
          }}
        >
          <div className="flex items-stretch px-1.5 py-1">
            {TABS.map(({ id, label }) => {
              const Icon = TAB_ICONS[id];
              const active = tab === id;
              return (
                <button key={id} onClick={() => onTabChange(id)} className="flex-1 relative">
                  <div className="flex flex-col items-center justify-center gap-0.5 py-2 rounded-xl transition-all duration-200">
                    {active && (
                      <motion.div
                        layoutId="sc-nav-bg"
                        className="absolute inset-1 rounded-lg"
                        style={{ background: `${C_ACCENT}12` }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <Icon
                      size={18}
                      strokeWidth={active ? 2.2 : 1.5}
                      className="relative z-10"
                      style={{ color: active ? C_ACCENT : C_MED }}
                    />
                    <span
                      className={`text-[9px] font-semibold relative z-10 ${active ? "" : "opacity-60"}`}
                      style={{ color: active ? C_ACCENT : C_MED }}
                    >
                      {label}
                    </span>
                  </div>
                </button>
              );
            })}

            {/* Edit button — shown after save, hidden in preview */}
            {!isPreview && isPersonalized && (
              <button onClick={onEdit} className="flex-1 relative">
                <div className="flex flex-col items-center justify-center gap-0.5 py-2 rounded-xl transition-all duration-200">
                  <Pencil
                    size={18}
                    strokeWidth={1.5}
                    className="relative z-10"
                    style={{ color: C_ACCENT }}
                  />
                  <span
                    className="text-[9px] font-semibold relative z-10"
                    style={{ color: C_ACCENT }}
                  >
                    Edit
                  </span>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
