"use client";

import { Camera, Gamepad2, Heart, Mail, Music, Sparkles, type LucideIcon } from "lucide-react";
import { TABS, type TabId } from "./types";

const PINK   = "#ff3d6b";
const GRAD   = "linear-gradient(135deg, #ff3d6b 0%, #a855f7 100%)";

const TAB_ICONS: Record<TabId, LucideIcon> = {
  home:    Heart,
  wish:    Sparkles,
  gallery: Camera,
  music:   Music,
  games:   Gamepad2,
  notes:   Mail,
};

interface Props {
  tab: TabId;
  onTabChange: (id: TabId) => void;
  coupleNames: { person1: string; person2: string };
  onBack: () => void;
  onEdit?: () => void;
  /** Wipe this browser's unpublished draft. Omitted when there is nothing to clear. */
  onClear?: () => void;
  showPublish?: boolean;
  showShare?: boolean;
  shareLabel?: string;
  onPublish?: () => void;
  onShare?: () => void;
}

export default function DesktopSidebar({
  tab, onTabChange, coupleNames, onBack,
  onEdit, onClear, showPublish, showShare, shareLabel, onPublish, onShare,
}: Props) {
  return (
    <aside
      className="hidden lg:flex"
      style={{
        position: "fixed",
        top: 0, left: 0, bottom: 0, width: 224,
        flexDirection: "column", zIndex: 50,
        background: "rgba(13, 11, 24, 0.97)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Header */}
      <div style={{
        padding: "28px 20px 18px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}>
        <p style={{
          fontSize: 20, fontWeight: 800, margin: 0, lineHeight: 1.2,
          background: GRAD,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        }}>
          darling ♡
        </p>
        {(coupleNames.person1 || coupleNames.person2) && (
          <p style={{
            fontSize: 13, margin: "4px 0 0",
            color: "rgba(255,255,255,0.40)",
            letterSpacing: "0.04em",
          }}>
            {coupleNames.person1 && coupleNames.person2
              ? `${coupleNames.person1} & ${coupleNames.person2}`
              : coupleNames.person1 || coupleNames.person2}
          </p>
        )}
      </div>

      {/* Nav tabs */}
      <nav style={{
        flex: 1, padding: "14px 10px",
        display: "flex", flexDirection: "column", gap: 2,
      }}>
        {TABS.map((t) => {
          const active = t.id === tab;
          const Icon = TAB_ICONS[t.id];
          const displayLabel = t.label;

          return (
            <button
              key={t.id}
              onClick={() => onTabChange(t.id)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", borderRadius: 10, border: "none",
                background: active ? "rgba(255,61,107,0.12)" : "transparent",
                cursor: "pointer", textAlign: "left", width: "100%",
                transition: "background 0.15s",
              }}
            >
              <Icon
                size={17}
                strokeWidth={active ? 2.4 : 1.8}
                style={{ color: active ? PINK : "rgba(255,255,255,0.35)", flexShrink: 0 }}
              />
              <span style={{
                fontSize: 14, fontWeight: active ? 700 : 400,
                color: active ? "#fff" : "rgba(255,255,255,0.45)",
                letterSpacing: "0.02em",
              }}>
                {displayLabel}
              </span>
              {active && (
                <div style={{
                  marginLeft: "auto", width: 4, height: 4, borderRadius: 2,
                  background: PINK,
                }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Action buttons */}
      <div style={{
        padding: "14px 10px",
        display: "flex", flexDirection: "column", gap: 8,
        borderTop: "1px solid rgba(255,255,255,0.07)",
      }}>
        {onEdit && (
          <button onClick={onEdit} style={{
            padding: "9px 0", borderRadius: 10,
            border: "1.5px solid rgba(255,61,107,0.35)",
            background: "transparent",
            fontSize: 13, fontWeight: 600, color: PINK,
            cursor: "pointer",
          }}>
            ✦ Edit
          </button>
        )}
        {showPublish && onPublish && (
          <button onClick={onPublish} style={{
            padding: "9px 0", borderRadius: 10, border: "none",
            background: GRAD,
            fontSize: 13, fontWeight: 700, color: "#fff",
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(255,61,107,0.35)",
          }}>
            ♡ Publish
          </button>
        )}
        {showShare && onShare && (
          <button onClick={onShare} style={{
            padding: "9px 0", borderRadius: 10,
            border: "1.5px solid rgba(255,61,107,0.30)",
            background: "rgba(255,61,107,0.08)",
            fontSize: 13, fontWeight: 600, color: PINK,
            cursor: "pointer",
          }}>
            ✉ {shareLabel || "Share"}
          </button>
        )}
        {onClear && (
          <button onClick={onClear} style={{
            padding: "7px 0", borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.04)",
            fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)",
            cursor: "pointer",
          }}>
            Clear my draft
          </button>
        )}
        <button onClick={onBack} style={{
          padding: "7px 0", borderRadius: 10, border: "none",
          background: "transparent",
          fontSize: 12, color: "rgba(255,255,255,0.28)",
          cursor: "pointer",
        }}>
          ← Back
        </button>
      </div>
    </aside>
  );
}
