import type { CSSProperties } from "react";

export const GLASS_CARD: CSSProperties = {
  background: "var(--wed-glass)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid var(--wed-glass-border)",
  boxShadow: "var(--wed-glass-shadow)",
};

export const GLASS_STRONG: CSSProperties = {
  background: "var(--wed-glass-strong)",
  backdropFilter: "blur(30px)",
  WebkitBackdropFilter: "blur(30px)",
  border: "1px solid var(--wed-glass-border)",
  boxShadow: "var(--wed-glass-shadow)",
};

export const GLASS_BTN: CSSProperties = {
  background: "var(--wed-glass)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid var(--wed-glass-border)",
  boxShadow: "var(--wed-btn-shadow)",
};

export const GOLD_GRADIENT = "var(--wed-gradient-gold)";
export const AMBER_GRADIENT = "linear-gradient(90deg, #d97706, #b45309)";
export const GOLD_SHADOW = "0 8px 25px var(--wed-gold-glow)";
