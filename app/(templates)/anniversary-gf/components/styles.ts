import type { CSSProperties } from "react";

export const GLASS_CARD: CSSProperties = {
  background: "var(--anni-glass)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1.5px solid var(--anni-glass-border)",
  boxShadow: "var(--anni-glass-shadow)",
};

export const GLASS_LIGHT: CSSProperties = {
  background: "var(--anni-glass)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  border: "1px solid var(--anni-glass-border)",
};

export const GLASS_STRONG: CSSProperties = {
  background: "var(--anni-glass-strong)",
  backdropFilter: "blur(8px)",
  border: "1.5px solid var(--anni-glass-border)",
};

export const GLASS_BTN: CSSProperties = {
  background: "var(--anni-glass)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1.5px solid var(--anni-glass-border)",
  boxShadow: "var(--anni-card-btn-shadow)",
};

export const GLASS_BAR: CSSProperties = {
  background: "var(--anni-glass)",
  backdropFilter: "blur(12px)",
  border: "1px solid var(--anni-glass-border)",
};

export const BADGE_STYLE: CSSProperties = {
  background: "var(--anni-badge-bg)",
  backdropFilter: "blur(8px)",
  boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
};

export const ROSE_GRADIENT = "linear-gradient(90deg, #e11d48, #ec4899)";
export const VIOLET_GRADIENT = "linear-gradient(90deg, #8b5cf6, #7c3aed)";
export const ROSE_SHADOW = "0 8px 25px rgba(225,29,72,0.3)";
