"use client";

import { motion } from "framer-motion";
import { Camera, Gamepad2, Gift, Heart, Music } from "lucide-react";
import { type TabId } from "./types";

const BROWN = "#5D3F31";
const COPPER = "#AD684A";
const MUTED = "#A8968A";
const SCRIPT = "'Great Vibes', cursive";
const SERIF = "'Cormorant Garamond', Georgia, serif";

interface TabDef { id: TabId; label: string; Icon: typeof Heart; emoji: string }

const ALL_TABS: TabDef[] = [
  { id: "home", label: "Home", Icon: Heart, emoji: "🏠" },
  { id: "gallery", label: "Gallery", Icon: Camera, emoji: "📸" },
  { id: "songs", label: "Songs", Icon: Music, emoji: "🎵" },
  { id: "games", label: "Games", Icon: Gamepad2, emoji: "🎮" },
  { id: "surprise", label: "Surprise", Icon: Gift, emoji: "🎁" },
];

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
  hiddenTabs?: TabId[];
}

export default function BottomNav({
  mode, tab, onTabChange,
  onEdit, showPublish, showShare, shareLabel, onPublish, onShare,
  onCreateYours, hiddenTabs = [],
}: Props) {
  const TABS = ALL_TABS.filter((t) => !hiddenTabs.includes(t.id));
  return (
    <nav
      className="lg:hidden"
      style={{
        position: "fixed",
        bottom: 0, left: 0, right: 0,
        zIndex: 100,
        pointerEvents: "auto",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Cormorant+Garamond:ital,wght@0,400;1,400&display=swap');
        @keyframes bgf-nav-shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes bgf-create-glow {
          0%,100%{box-shadow:0 0 10px 2px rgba(173,104,74,0.50),0 3px 12px rgba(80,30,20,0.25)}
          50%{box-shadow:0 0 20px 6px rgba(173,104,74,0.70),0 5px 18px rgba(80,30,20,0.35)}
        }
        .bgf-create-tab{animation:bgf-create-glow 2s ease-in-out infinite}
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 22 }}
        style={{
          width: "calc(90%)",
          maxWidth: 460,
          margin: "0 auto 10px",
          background: "linear-gradient(135deg, rgba(253,248,240,0.95) 0%, rgba(240,228,210,0.95) 100%)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(173,104,74,0.18)",
          borderRadius: 24,
          boxShadow: "0 -4px 30px rgba(93,63,49,0.12), 0 2px 12px rgba(93,63,49,0.08), inset 0 1px 0 rgba(255,255,255,0.6)",
          padding: "4px 3px 6px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          {TABS.map((t) => {
            const active = t.id === tab;
            const Icon = t.Icon;

            return (
              <motion.button
                key={t.id}
                onClick={() => onTabChange(t.id)}
                whileTap={{ scale: 0.92 }}
                style={{
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                  padding: "6px 8px",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  flex: 1,
                  transition: "all 0.25s ease",
                }}
              >
                {active && (
                  <motion.div
                    layoutId="bday-gf-nav-pill"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 26 }}
                    style={{
                      position: "absolute",
                      inset: 2,
                      borderRadius: 18,
                      background: "linear-gradient(145deg, rgba(173,104,74,0.15) 0%, rgba(93,63,49,0.10) 100%)",
                      border: "1px solid rgba(173,104,74,0.20)",
                      boxShadow: "0 2px 10px rgba(93,63,49,0.10)",
                    }}
                  />
                )}

                <div style={{ position: "relative", zIndex: 2 }}>
                  <Icon
                    size={20}
                    strokeWidth={active ? 2.2 : 1.6}
                    style={{
                      color: active ? BROWN : MUTED,
                      transition: "color 0.2s, filter 0.2s",
                      filter: active ? "drop-shadow(0 1px 3px rgba(93,63,49,0.25))" : "none",
                    }}
                  />
                </div>

                <span
                  style={{
                    fontFamily: active ? SCRIPT : SERIF,
                    fontSize: active ? 13 : 11,
                    fontWeight: active ? 400 : 400,
                    fontStyle: active ? "normal" : "italic",
                    color: active ? BROWN : MUTED,
                    letterSpacing: active ? "0em" : "0.02em",
                    lineHeight: 1,
                    textAlign: "center",
                    transition: "all 0.25s ease",
                    position: "relative",
                    zIndex: 2,
                  }}
                >
                  {t.label}
                </span>

                {active && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.05, type: "spring", stiffness: 300, damping: 20 }}
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: 999,
                      background: `linear-gradient(135deg, ${COPPER}, ${BROWN})`,
                      marginTop: 1,
                      position: "relative",
                      zIndex: 2,
                    }}
                  />
                )}
              </motion.button>
            );
          })}

          {mode === "viewer" && onCreateYours && (
            <motion.button
              onClick={onCreateYours}
              whileTap={{ scale: 0.93 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, type: "spring", stiffness: 260, damping: 22 }}
              className="bgf-create-tab"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                padding: "8px 12px",
                borderRadius: 18,
                border: "none",
                background: `linear-gradient(135deg, ${COPPER} 0%, ${BROWN} 100%)`,
                cursor: "pointer",
                flexShrink: 0,
                marginLeft: 4,
              }}
            >
              <span style={{ fontSize: 16, lineHeight: 1 }}>🎂</span>
              <span style={{
                fontFamily: SCRIPT,
                fontSize: 10,
                fontWeight: 400,
                color: "#fff",
                letterSpacing: "0.02em",
                lineHeight: 1,
                textAlign: "center",
                whiteSpace: "nowrap",
              }}>
                Create
              </span>
            </motion.button>
          )}
        </div>
      </motion.div>
    </nav>
  );
}
