"use client";

import { memo, useCallback } from "react";
import { motion } from "framer-motion";
import { Home, Heart, CalendarDays, Image, Flower2, Sun, Moon, ArrowLeft } from "lucide-react";
import { TABS, type TabId } from "./types";

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
  darkMode: boolean;
  toggleDark: () => void;
  onBack: () => void;
}

export default memo(function DesktopSidebar({
  tab,
  onTabChange,
  coupleNames,
  darkMode,
  toggleDark,
  onBack,
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
      className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-64 z-40 py-6 px-3"
      style={{
        background: "var(--wed-sidebar-bg)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderRight: "1px solid var(--wed-sidebar-border)",
      }}
    >
      <div className="text-center mb-8 px-3">
        <motion.div
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl mb-3 shadow-sm"
          style={{
            background: "var(--wed-gradient-gold)",
            boxShadow: "0 0 20px var(--wed-gold-glow)",
          }}
        >
          💍
        </motion.div>
        <h2
          className="text-base font-bold leading-tight"
          style={{
            background: "var(--wed-gradient-gold)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {coupleNames.bride} & {coupleNames.groom}
        </h2>
        <p className="text-[10px] mt-0.5" style={{ color: "var(--wed-gold)" }}>
          शुभ विवाह
        </p>
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
              onClick={handleTab(id)}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-all duration-200 text-sm font-medium"
              style={
                active
                  ? {
                      background: darkMode
                        ? "rgba(212,168,67,0.1)"
                        : "rgba(184,134,11,0.08)",
                      color: "var(--wed-accent-gold)",
                      border: `1px solid ${darkMode ? "rgba(212,168,67,0.2)" : "rgba(184,134,11,0.15)"}`,
                    }
                  : { color: "var(--wed-muted-fg)" as unknown as string }
            }
            >
              <Icon size={17} strokeWidth={active ? 2.2 : 1.5} />
              {label}
              {active && (
                <motion.div
                  layoutId="wed-sidebar-dot"
                  className="ml-auto w-1.5 h-1.5 rounded-full"
                  style={{ background: "var(--wed-accent-gold)" }}
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      <div className="px-1 space-y-1 mt-4 pt-4" style={{ borderTop: "1px solid var(--wed-sidebar-border)" }}>
        <button
          onClick={toggleDark}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-80"
          style={{ color: "hsl(var(--wed-muted-fg))" }}
        >
          {darkMode ? <Sun size={17} strokeWidth={1.5} /> : <Moon size={17} strokeWidth={1.5} />}
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
        <button
          onClick={onBack}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-80"
          style={{ color: "hsl(var(--wed-muted-fg))" }}
        >
          <ArrowLeft size={17} strokeWidth={1.5} />
          Back to Templates
        </button>
      </div>
    </motion.aside>
  );
});
