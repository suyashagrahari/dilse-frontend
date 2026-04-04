"use client";

import { motion } from "framer-motion";
import { Camera, Gamepad2, Heart, Mail, Music, Sparkles, type LucideIcon } from "lucide-react";
import { TABS, type TabId } from "./types";

const PINK    = "#ff3d6b";
const GRAD    = "linear-gradient(135deg, #ff3d6b 0%, #a855f7 100%)";
const GLASS   = "rgba(13, 11, 24, 0.88)";
const BORDER  = "rgba(255, 61, 107, 0.18)";
const BORDER_SOFT = "rgba(255, 255, 255, 0.08)";

const TAB_ICONS: Record<TabId, LucideIcon> = {
  home:    Heart,
  wish:    Sparkles,
  gallery: Camera,
  music:   Music,
  games:   Gamepad2,
  notes:   Mail,
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
  onCreateYours,
}: Props) {
  return (
    <nav
      className="lg:hidden"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: "0 14px calc(env(safe-area-inset-bottom, 0px) + 14px)",
        pointerEvents: "none",
      }}
    >
      {/* Soft glow under the dock */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: "50%",
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 8px)",
          transform: "translateX(-50%)",
          width: "min(92%, 420px)",
          height: 56,
          borderRadius: 999,
          background: "radial-gradient(ellipse 80% 100% at 50% 100%, rgba(255,61,107,0.14), transparent 65%)",
          pointerEvents: "none",
          filter: "blur(8px)",
        }}
      />

      <div
        style={{
          pointerEvents: "auto",
          position: "relative",
          margin: "0 auto",
          maxWidth: 440,
          borderRadius: 999,
          padding: "10px 8px 10px",
          background: GLASS,
          backdropFilter: "blur(24px) saturate(1.2)",
          WebkitBackdropFilter: "blur(24px) saturate(1.2)",
          border: `1px solid ${BORDER_SOFT}`,
          boxShadow: `
            0 4px 24px rgba(0,0,0,0.45),
            0 0 0 1px ${BORDER} inset,
            0 1px 0 rgba(255,255,255,0.06) inset
          `,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          {TABS.map((t) => {
            const active = t.id === tab;
            const Icon = TAB_ICONS[t.id];
            const displayLabel = t.label;

            return (
              <motion.button
                key={t.id}
                onClick={() => onTabChange(t.id)}
                whileTap={{ scale: 0.92 }}
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  padding: "2px 0",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: 40,
                    height: 36,
                    borderRadius: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {active && (
                    <motion.div
                      layoutId="darling-nav-pill"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: 14,
                        background: "linear-gradient(145deg, rgba(255,61,107,0.22) 0%, rgba(168,85,247,0.14) 100%)",
                        border: "1px solid rgba(255,61,107,0.28)",
                        boxShadow: "0 2px 12px rgba(255,61,107,0.2), inset 0 1px 0 rgba(255,255,255,0.12)",
                      }}
                    />
                  )}
                  <Icon
                    size={19}
                    strokeWidth={active ? 2.5 : 1.75}
                    style={{
                      position: "relative",
                      zIndex: 1,
                      color: active ? PINK : "rgba(255,255,255,0.38)",
                      filter: active ? "drop-shadow(0 0 8px rgba(255,61,107,0.55))" : "none",
                      transition: "color 0.2s ease",
                    }}
                    fill={active && t.id === "home" ? "rgba(255,61,107,0.22)" : "none"}
                  />
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: active ? 700 : 500,
                    color: active ? PINK : "rgba(255,255,255,0.36)",
                    letterSpacing: "0.02em",
                    transition: "color 0.2s ease",
                    lineHeight: 1,
                    maxWidth: "100%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    padding: "0 1px",
                  }}
                >
                  {displayLabel}
                </span>
              </motion.button>
            );
          })}

          {mode === "viewer" && onCreateYours && (
            <motion.button
              onClick={onCreateYours}
              whileTap={{ scale: 0.92 }}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.45, type: "spring", stiffness: 280, damping: 22 }}
              style={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                padding: "2px 0",
                border: "none",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 36,
                  borderRadius: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: GRAD,
                  boxShadow: "0 4px 16px rgba(255,61,107,0.35), inset 0 1px 0 rgba(255,255,255,0.25)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                <span style={{ fontSize: 15, color: "#fff", lineHeight: 1 }}>✦</span>
              </div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: PINK,
                  letterSpacing: "0.02em",
                  lineHeight: 1,
                }}
              >
                Create
              </span>
            </motion.button>
          )}
        </div>
      </div>
    </nav>
  );
}
