import type { CSSProperties } from "react";

export const HOLI_GLASS: CSSProperties = {
  background: "var(--holi-glass)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid var(--holi-glass-border)",
  boxShadow: "var(--holi-glass-shadow)",
};

export const HOLI_GLASS_STRONG: CSSProperties = {
  background: "var(--holi-glass-strong)",
  backdropFilter: "blur(32px)",
  WebkitBackdropFilter: "blur(32px)",
  border: "1px solid var(--holi-glass-border)",
  boxShadow: "var(--holi-glass-shadow)",
};

export const HOLI_CARD: CSSProperties = {
  background: "hsl(var(--holi-card))",
  border: "1px solid hsl(var(--holi-border))",
  borderRadius: "1rem",
  boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
};

export const HOLI_INPUT: CSSProperties = {
  background: "hsl(var(--holi-input))",
  border: "1px solid hsl(var(--holi-border))",
  color: "hsl(var(--holi-fg))",
  borderRadius: "0.75rem",
};
