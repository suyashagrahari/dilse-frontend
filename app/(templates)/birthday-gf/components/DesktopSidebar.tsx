"use client";

import { Camera, Gamepad2, Gift, Heart, Music, type LucideIcon } from "lucide-react";
import { type TabId } from "./types";

const BROWN = "#5D3F31";
const BROWN_MID = "rgba(93,63,49,0.55)";
const TERRACOTTA = "#AD684A";
const CURSIVE = "'Dancing Script', 'Brush Script MT', cursive";

const TABS: { id: TabId; label: string; Icon: LucideIcon }[] = [
  { id: "home", label: "Home", Icon: Heart },
  { id: "gallery", label: "Gallery", Icon: Camera },
  { id: "songs", label: "Songs", Icon: Music },
  { id: "games", label: "Games", Icon: Gamepad2 },
  { id: "surprise", label: "Surprise", Icon: Gift },
];

interface Props {
  tab: TabId;
  onTabChange: (id: TabId) => void;
  recipientName: string;
  senderName: string;
  onBack: () => void;
  onEdit: () => void;
  showPublish: boolean;
  showShare: boolean;
  shareLabel: string;
  onPublish: () => void;
  onShare: () => void;
  hiddenTabs?: TabId[];
  showCreateYours?: boolean;
  onCreateYours?: () => void;
}

export default function DesktopSidebar({
  tab, onTabChange, recipientName, senderName,
  onBack, onEdit, showPublish, showShare, shareLabel, onPublish, onShare,
  hiddenTabs = [], showCreateYours, onCreateYours,
}: Props) {
  const visibleTabs = TABS.filter((t) => !hiddenTabs.includes(t.id));
  return (
    <aside
      className="hidden lg:flex"
      style={{
        position: "fixed",
        top: 0, left: 0, bottom: 0,
        width: 224,
        flexDirection: "column",
        zIndex: 50,
        background: "rgba(245,237,224,0.97)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderRight: "1px solid rgba(93,63,49,0.15)",
      }}
    >
      {/* Header */}
      <div style={{ padding: "28px 20px 20px", borderBottom: "1px solid rgba(93,63,49,0.12)" }}>
        <div style={{ fontSize: 28, marginBottom: 6, textAlign: "center" }}>🎂</div>
        <p style={{
          fontFamily: CURSIVE, fontSize: 22, fontWeight: 700,
          color: BROWN, letterSpacing: "0.01em", lineHeight: 1.2,
          marginBottom: 2, textAlign: "center",
        }}>
          {recipientName || "Birthday Girl"}
        </p>
        <p style={{
          fontFamily: CURSIVE, fontSize: 14,
          color: TERRACOTTA, opacity: 0.90,
          letterSpacing: "0.04em", textAlign: "center",
        }}>
          Birthday
        </p>
        {senderName && (
          <p style={{
            fontFamily: CURSIVE, fontSize: 12,
            color: "rgba(93,63,49,0.55)",
            letterSpacing: "0.03em", textAlign: "center",
            marginTop: 4,
          }}>
            from {senderName}
          </p>
        )}
      </div>

      {/* Nav tabs */}
      <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
        {visibleTabs.map((t) => {
          const active = t.id === tab;
          const Icon = t.Icon;
          return (
            <button
              key={t.id}
              onClick={() => onTabChange(t.id)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px", borderRadius: 8, border: "none",
                background: active ? "rgba(93,63,49,0.10)" : "transparent",
                cursor: "pointer", textAlign: "left", width: "100%",
                transition: "background 0.15s",
              }}
            >
              <Icon
                size={16}
                strokeWidth={active ? 2.4 : 1.8}
                style={{ color: active ? BROWN : "rgba(93,63,49,0.55)", flexShrink: 0 }}
              />
              <span style={{
                fontFamily: CURSIVE, fontSize: 15, fontWeight: active ? 700 : 400,
                color: active ? BROWN : "rgba(93,63,49,0.65)", letterSpacing: "0.03em",
              }}>
                {t.label}
              </span>
              {active && (
                <div style={{
                  marginLeft: "auto", width: 4, height: 4, borderRadius: 2,
                  background: TERRACOTTA, opacity: 0.8,
                }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Action buttons */}
      <div style={{ padding: "16px 12px", display: "flex", flexDirection: "column", gap: 8, borderTop: "1px solid rgba(93,63,49,0.12)" }}>
        <button onClick={onEdit} style={{
          padding: "9px 0", borderRadius: 8,
          border: `1.5px solid ${BROWN_MID}`, background: "transparent",
          fontFamily: CURSIVE, fontSize: 14, fontWeight: 600, color: BROWN,
          cursor: "pointer", letterSpacing: "0.03em",
        }}>
          ✦ Edit
        </button>
        {showPublish && (
          <button onClick={onPublish} style={{
            padding: "9px 0", borderRadius: 8, border: "none",
            background: `linear-gradient(135deg, ${TERRACOTTA} 0%, ${BROWN} 100%)`,
            fontFamily: CURSIVE, fontSize: 14, fontWeight: 600, color: "#fff",
            cursor: "pointer", letterSpacing: "0.03em",
            boxShadow: "0 4px 16px rgba(93,63,49,0.30)",
          }}>
            🎂 Publish
          </button>
        )}
        {showShare && (
          <button onClick={onShare} style={{
            padding: "9px 0", borderRadius: 8,
            border: `1.5px solid ${BROWN_MID}`, background: "rgba(93,63,49,0.07)",
            fontFamily: CURSIVE, fontSize: 14, fontWeight: 600, color: BROWN,
            cursor: "pointer", letterSpacing: "0.03em",
          }}>
            ✉ {shareLabel || "Share"}
          </button>
        )}
        {showCreateYours && onCreateYours && (
          <button onClick={onCreateYours} style={{
            padding: "10px 0", borderRadius: 8, border: "none",
            background: `linear-gradient(135deg, ${TERRACOTTA} 0%, ${BROWN} 100%)`,
            fontFamily: CURSIVE, fontSize: 14, fontWeight: 700, color: "#fff",
            cursor: "pointer", letterSpacing: "0.03em",
            boxShadow: `0 4px 16px rgba(93,63,49,0.30)`,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
            ✨ Create Your Own
          </button>
        )}
        <button onClick={onBack} style={{
          padding: "7px 0", borderRadius: 8, border: "none",
          background: "transparent",
          fontFamily: CURSIVE, fontSize: 13, color: "rgba(93,63,49,0.60)",
          cursor: "pointer", letterSpacing: "0.04em",
        }}>
          ← Back
        </button>
      </div>
    </aside>
  );
}
