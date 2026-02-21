"use client";

import { memo, useCallback } from "react";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { TABS, type TabId } from "./types";

interface Props {
  tab: TabId;
  onTabChange: (id: TabId) => void;
  coupleNames: { bride: string; groom: string };
  darkMode: boolean;
  toggleDark: () => void;
}

export default memo(function DesktopNav({
  tab,
  onTabChange,
  coupleNames,
  darkMode,
  toggleDark,
}: Props) {
  const handleTab = useCallback(
    (id: TabId) => () => onTabChange(id),
    [onTabChange],
  );

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="hidden lg:flex fixed top-4 left-1/2 -translate-x-1/2 z-50 items-center h-12 px-2 rounded-full"
      style={{
        background: "var(--rec-nav-bg)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid var(--rec-nav-border)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      }}
    >
      <div
        className="flex items-center gap-2 px-3 mr-2"
        style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
          style={{
            background: "var(--rec-gradient-accent)",
            color: "var(--rec-accent-fg)",
            fontFamily: "'Cormorant Garamond', serif",
          }}
        >
          {coupleNames.bride[0]}&{coupleNames.groom[0]}
        </div>
        <span
          className="text-xs font-light tracking-wider"
          style={{ color: "var(--rec-accent-light)", fontFamily: "'Cormorant Garamond', serif" }}
        >
          {coupleNames.bride} & {coupleNames.groom}
        </span>
      </div>

      <div className="flex items-center gap-0.5">
        {TABS.map(({ id, label }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              onClick={handleTab(id)}
              className="relative px-4 py-1.5 rounded-full text-xs tracking-wide transition-all duration-200"
              style={{
                color: active ? "var(--rec-accent)" : "hsl(var(--rec-muted-fg))",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: active ? 600 : 400,
              }}
            >
              {active && (
                <motion.div
                  layoutId="rec-desktop-pill"
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: "rgba(212,165,116,0.08)",
                    border: "1px solid rgba(212,165,116,0.12)",
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative z-10">{label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-1 ml-2 pl-2" style={{ borderLeft: "1px solid rgba(255,255,255,0.06)" }}>
        <button
          onClick={toggleDark}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:opacity-80"
          style={{ color: "hsl(var(--rec-muted-fg))" }}
        >
          {darkMode ? <Sun size={14} strokeWidth={1.5} /> : <Moon size={14} strokeWidth={1.5} />}
        </button>
      </div>
    </motion.nav>
  );
});
