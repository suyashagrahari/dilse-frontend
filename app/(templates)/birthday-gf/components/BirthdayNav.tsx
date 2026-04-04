"use client";

import { motion } from "framer-motion";

interface Props {
  mode: "viewer";
  tab: string;
  onTabChange: (t: string) => void;
  onEdit: () => void;
  lockedTabs?: Set<string>;
  onInstall?: () => void;
}

const TABS = [
  { id: "cover", label: "🎂 Birthday" },
  { id: "final", label: "🎉 Wishes" },
];

export default function BirthdayNav({ tab, onTabChange, onInstall }: Props) {
  return (
    <nav
      style={{
        position: "fixed",
        bottom: 10,
        left: 0,
        right: 0,
        zIndex: 100,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: "calc(100% - 24px)",
          margin: "0 auto",
          background: "rgba(245,237,224,0.96)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(93,63,49,0.15)",
          borderRadius: 18,
          boxShadow: "0 -10px 30px rgba(40,22,8,0.10)",
          padding: "8px 16px",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
        }}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            style={{
              padding: "8px 16px",
              borderRadius: 12,
              border: "none",
              background:
                tab === t.id ? "rgba(93,63,49,0.15)" : "transparent",
              color: "#5D3F31",
              fontFamily: "'Dancing Script', cursive",
              fontSize: 14,
              fontWeight: tab === t.id ? 700 : 400,
              cursor: "pointer",
            }}
          >
            {t.label}
          </button>
        ))}
        {onInstall && (
          <button
            onClick={onInstall}
            style={{
              padding: "8px 16px",
              borderRadius: 12,
              border: "none",
              background: "linear-gradient(135deg, #AD684A, #5D3F31)",
              color: "#fff",
              fontFamily: "'Dancing Script', cursive",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            ♡ Save
          </button>
        )}
      </motion.div>
    </nav>
  );
}
