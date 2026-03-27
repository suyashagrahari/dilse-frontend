"use client";

import { motion } from "framer-motion";
import { Camera, Gamepad2, Heart, Mail, Music, Sparkles, type LucideIcon } from "lucide-react";
import { TABS, type TabId } from "./types";

const ROSE = "rgb(201, 144, 106)";
const CURSIVE = "'Dancing Script', 'Brush Script MT', cursive";

const TAB_ICONS: Record<TabId, LucideIcon> = {
  home: Heart,
  wish: Sparkles,
  gallery: Camera,
  music: Music,
  games: Gamepad2,
  notes: Mail,
};

interface Props {
  mode: "editor" | "viewer";
  tab: TabId;
  onTabChange: (id: TabId) => void;
  onEdit?: () => void;
  showPublish?: boolean;
  showShare?: boolean;
  shareLabel?: string;
  onPublish?: () => void;
  onShare?: () => void;
  onBack?: () => void;
  onCreateYours?: () => void;
}

export default function BottomNav({
  mode, tab, onTabChange,
  onEdit, showPublish, showShare, shareLabel, onPublish, onShare,
  onCreateYours,
}: Props) {
  return (
    <nav
      className="lg:hidden"
      style={{
        position: "fixed",
        bottom: 10, left: 0, right: 0,
        zIndex: 100,
        pointerEvents: "auto",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 20 }}
        style={{
          width: "calc(100% - 24px)",
          margin: "0 auto",
          background: "rgba(8, 4, 18, 0.92)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          border: "1px solid rgba(201, 144, 106, 0.18)",
          borderRadius: 18,
          boxShadow: "0 -10px 30px rgba(0,0,0,0.35)",
          padding: "4px 10px env(safe-area-inset-bottom, 0px)",
          paddingTop: 6,
        }}
      >
        <style>{`
          @keyframes drl-create-glow {
            0%,100%{box-shadow:0 0 10px 2px rgba(201,144,106,0.50),0 3px 12px rgba(0,0,0,0.35)}
            50%{box-shadow:0 0 20px 6px rgba(201,144,106,0.70),0 5px 18px rgba(0,0,0,0.45)}
          }
          .drl-create-tab{animation:drl-create-glow 2s ease-in-out infinite}
        `}</style>
        {/* Tab row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            padding: "0 2px",
          }}
        >
          {TABS.map((t) => {
            const active = t.id === tab;
            const Icon = TAB_ICONS[t.id];

            return (
              <motion.button
                key={t.id}
                onClick={() => onTabChange(t.id)}
                whileTap={{ scale: 0.96 }}
                whileHover={{ scale: 1.02 }}
                style={{
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1,
                  padding: "4px 4px",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  flex: 1,
                  opacity: active ? 1 : 0.50,
                  transition: "opacity 0.15s",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    borderRadius: 15,
                  }}
                >
                  {active && (
                    <motion.div
                      layoutId="darling-nav-active"
                      initial={false}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", stiffness: 260, damping: 22 }}
                      style={{
                        position: "absolute",
                        inset: 2,
                        borderRadius: 14,
                        background: "linear-gradient(135deg, rgba(201,144,106,0.22), rgba(160,100,65,0.10))",
                        boxShadow: "0 12px 26px rgba(201,144,106,0.18)",
                        border: "1px solid rgba(201,144,106,0.26)",
                      }}
                    />
                  )}

                  <Icon
                    size={19}
                    strokeWidth={active ? 2.4 : 1.8}
                    style={{
                      position: "relative",
                      zIndex: 2,
                      color: active ? ROSE : "rgba(201, 144, 106, 0.60)",
                      filter: active ? "drop-shadow(0 8px 16px rgba(201,144,106,0.30))" : "none",
                    }}
                  />
                </div>

                <span
                  style={{
                    fontFamily: CURSIVE,
                    fontSize: "clamp(8px, 2vw, 10px)",
                    fontWeight: active ? 700 : 400,
                    color: active ? ROSE : "rgba(201, 144, 106, 0.60)",
                    letterSpacing: "0.04em",
                    lineHeight: 1,
                    textAlign: "center",
                  }}
                >
                  {t.label}
                </span>
                {active && (
                  <motion.span
                    initial={{ opacity: 0, scaleX: 0.7 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    transition={{ type: "spring", stiffness: 240, damping: 20 }}
                    style={{
                      width: 22,
                      height: 2,
                      borderRadius: 999,
                      background: "linear-gradient(90deg, rgba(201,144,106,0.15), rgba(201,144,106,0.95), rgba(201,144,106,0.15))",
                      marginTop: 2,
                    }}
                    aria-hidden="true"
                  />
                )}
              </motion.button>
            );
          })}

          {/* Viewer-only: glowing Create ♡ tab */}
          {mode === "viewer" && onCreateYours && (
            <motion.button
              onClick={onCreateYours}
              whileTap={{ scale: 0.93 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, type: "spring", stiffness: 260, damping: 22 }}
              className="drl-create-tab"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
                padding: "5px 8px",
                borderRadius: 14,
                border: "none",
                background: "linear-gradient(135deg, rgb(201,144,106) 0%, rgb(160,100,65) 100%)",
                cursor: "pointer",
                flexShrink: 0,
                marginLeft: 4,
              }}
            >
              <span style={{ fontSize: 15, lineHeight: 1 }}>✦</span>
              <span style={{
                fontFamily: CURSIVE,
                fontSize: "clamp(7px, 1.8vw, 9px)",
                fontWeight: 700,
                color: "#fff",
                letterSpacing: "0.03em",
                lineHeight: 1,
                textAlign: "center",
                whiteSpace: "nowrap",
              }}>
                Create ♡
              </span>
            </motion.button>
          )}
        </div>
      </motion.div>
    </nav>
  );
}
