"use client";

import { TABS, type TabId } from "./types";

const WARM = "rgb(108, 74, 46)";
const WARM_MID = "rgba(108, 74, 46, 0.55)";
const CURSIVE = "'Dancing Script', 'Brush Script MT', cursive";

interface Props {
  tab: TabId;
  onTabChange: (id: TabId) => void;
  coupleNames: { person1: string; person2: string };
  onBack: () => void;
  onEdit?: () => void;
  showPublish?: boolean;
  showShare?: boolean;
  shareLabel?: string;
  onPublish?: () => void;
  onShare?: () => void;
}

export default function DesktopSidebar({
  tab, onTabChange, coupleNames, onBack,
  onEdit, showPublish, showShare, shareLabel, onPublish, onShare,
}: Props) {
  return (
    <aside
      className="hidden lg:flex"
      style={{
        position: "fixed",
        top: 0, left: 0, bottom: 0,
        width: 224,
        flexDirection: "column",
        zIndex: 50,
        background: "rgba(250, 246, 240, 0.92)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderRight: "1px solid rgba(158, 126, 97, 0.20)",
      }}
    >
      {/* Header */}
      <div style={{ padding: "28px 20px 20px", borderBottom: "1px solid rgba(158,126,97,0.15)" }}>
        <p style={{
          fontFamily: CURSIVE, fontSize: 22, fontWeight: 700,
          color: WARM, letterSpacing: "0.01em", lineHeight: 1.2,
          marginBottom: 4,
        }}>
          love page ♡
        </p>
        {(coupleNames.person1 || coupleNames.person2) && (
          <p style={{
            fontFamily: CURSIVE, fontSize: 14,
            color: "rgb(140, 105, 75)", opacity: 0.80,
            letterSpacing: "0.04em",
          }}>
            {coupleNames.person1 && coupleNames.person2
              ? `${coupleNames.person1} & ${coupleNames.person2}`
              : coupleNames.person1 || coupleNames.person2}
          </p>
        )}
      </div>

      {/* Nav tabs */}
      <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
        {TABS.map((t) => {
          const active = t.id === tab;
          return (
            <button
              key={t.id}
              onClick={() => onTabChange(t.id)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px", borderRadius: 8, border: "none",
                background: active ? "rgba(158,126,97,0.12)" : "transparent",
                cursor: "pointer", textAlign: "left", width: "100%",
                transition: "background 0.15s",
              }}
            >
              <span style={{ fontSize: 16, lineHeight: 1 }}>{t.icon}</span>
              <span style={{
                fontFamily: CURSIVE, fontSize: 15, fontWeight: active ? 700 : 400,
                color: active ? WARM : "rgb(130, 95, 65)", letterSpacing: "0.03em",
              }}>
                {t.label}
              </span>
              {active && (
                <div style={{
                  marginLeft: "auto", width: 4, height: 4, borderRadius: 2,
                  background: WARM, opacity: 0.7,
                }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Action buttons */}
      <div style={{ padding: "16px 12px", display: "flex", flexDirection: "column", gap: 8, borderTop: "1px solid rgba(158,126,97,0.15)" }}>
        {onEdit && (
          <button onClick={onEdit} style={{
            padding: "9px 0", borderRadius: 8,
            border: `1.5px solid ${WARM_MID}`, background: "transparent",
            fontFamily: CURSIVE, fontSize: 14, fontWeight: 600, color: WARM,
            cursor: "pointer", letterSpacing: "0.03em",
          }}>
            ✦ Edit
          </button>
        )}
        {showPublish && onPublish && (
          <button onClick={onPublish} style={{
            padding: "9px 0", borderRadius: 8, border: "none",
            background: "linear-gradient(135deg, rgb(158,126,97) 0%, rgb(120,85,55) 100%)",
            fontFamily: CURSIVE, fontSize: 14, fontWeight: 600, color: "#fff",
            cursor: "pointer", letterSpacing: "0.03em",
            boxShadow: "0 4px 16px rgba(108,74,46,0.30)",
          }}>
            ♡ Publish
          </button>
        )}
        {showShare && onShare && (
          <button onClick={onShare} style={{
            padding: "9px 0", borderRadius: 8,
            border: `1.5px solid ${WARM_MID}`, background: "rgba(108,74,46,0.08)",
            fontFamily: CURSIVE, fontSize: 14, fontWeight: 600, color: WARM,
            cursor: "pointer", letterSpacing: "0.03em",
          }}>
            ✉ {shareLabel || "Share"}
          </button>
        )}
        <button onClick={onBack} style={{
          padding: "7px 0", borderRadius: 8, border: "none",
          background: "transparent",
          fontFamily: CURSIVE, fontSize: 13, color: "rgb(140,105,75)",
          opacity: 0.65, cursor: "pointer", letterSpacing: "0.04em",
        }}>
          ← Back
        </button>
      </div>
    </aside>
  );
}
