import type { CSSProperties } from "react";

export const EID_GLASS: CSSProperties = {
  background: "var(--eid-glass)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid var(--eid-glass-border)",
  boxShadow: "var(--eid-glass-shadow)",
};

export const EID_GLASS_STRONG: CSSProperties = {
  background: "var(--eid-glass-strong)",
  backdropFilter: "blur(32px)",
  WebkitBackdropFilter: "blur(32px)",
  border: "1px solid var(--eid-glass-border)",
  boxShadow: "var(--eid-glass-shadow)",
};

export const EID_CARD: CSSProperties = {
  background: "hsl(var(--eid-card))",
  border: "1px solid hsl(var(--eid-border))",
  borderRadius: "1rem",
  boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
};

export const EID_INPUT: CSSProperties = {
  background: "hsl(var(--eid-input))",
  border: "1px solid hsl(var(--eid-border))",
  color: "hsl(var(--eid-fg))",
  borderRadius: "0.75rem",
};

export const EID_SHIMMER: CSSProperties = {
  background:
    "linear-gradient(145deg, var(--eid-glass-strong) 0%, var(--eid-glass) 50%, var(--eid-glass-strong) 100%)",
  backdropFilter: "blur(40px)",
  WebkitBackdropFilter: "blur(40px)",
  border: "1px solid var(--eid-glass-border)",
  boxShadow:
    "0 20px 50px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04), 0 0 40px var(--eid-gold-glow)",
};
