import type { CSSProperties } from "react";

export const REC_GLASS: CSSProperties = {
  background: "var(--rec-glass)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid var(--rec-glass-border)",
  boxShadow: "var(--rec-glass-shadow)",
};

export const REC_GLASS_STRONG: CSSProperties = {
  background: "var(--rec-glass-strong)",
  backdropFilter: "blur(32px)",
  WebkitBackdropFilter: "blur(32px)",
  border: "1px solid var(--rec-glass-border)",
  boxShadow: "var(--rec-glass-shadow)",
};

export const REC_GLOSSY: CSSProperties = {
  background:
    "linear-gradient(145deg, var(--rec-glass-strong) 0%, var(--rec-glass) 50%, var(--rec-glass-strong) 100%)",
  backdropFilter: "blur(40px)",
  WebkitBackdropFilter: "blur(40px)",
  border: "1px solid var(--rec-glass-border)",
  boxShadow:
    "0 20px 50px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04), 0 0 60px var(--rec-accent-glow)",
};

export const REC_INPUT: CSSProperties = {
  background: "var(--rec-input-bg)",
  border: "1px solid var(--rec-input-border)",
  color: "hsl(var(--rec-fg))",
};

export const REC_CARD: CSSProperties = {
  background: "hsl(var(--rec-surface))",
  border: "1px solid rgba(255,255,255,0.04)",
  borderRadius: "1.25rem",
  boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
};
