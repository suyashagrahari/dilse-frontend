"use client";

import { C } from "./types";

/** Small shared primitives so the five tabs look like one screen. */

export function Card({ title, children, action }: { title?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18, marginBottom: 16 }}>
      {title && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, gap: 12 }}>
          <h3 style={{ margin: 0, fontSize: 14, color: C.t1, textTransform: "uppercase", letterSpacing: 0.5 }}>{title}</h3>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14 }}>
      <div style={{ fontSize: 11, color: C.tM, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: C.t1, marginTop: 4 }}>{value}</div>
    </div>
  );
}

export function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "7px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
      <span style={{ color: C.tM }}>{label}</span>
      <span style={{ color: C.t1, fontWeight: 500, textAlign: "right", wordBreak: "break-word" }}>{value ?? "—"}</span>
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div style={{ color: C.tM, fontSize: 13, padding: "18px 0", textAlign: "center" }}>{children}</div>;
}

export function Btn({
  children, onClick, tone = "default", disabled, title,
}: {
  children: React.ReactNode; onClick?: () => void;
  tone?: "default" | "danger" | "ghost"; disabled?: boolean; title?: string;
}) {
  const bg = tone === "danger" ? C.danger : tone === "ghost" ? "transparent" : C.t1;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        background: disabled ? "rgba(61,12,17,0.2)" : bg,
        color: tone === "ghost" ? C.t2 : "#fff",
        border: tone === "ghost" ? `1px solid ${C.border}` : "none",
        borderRadius: 8, padding: "7px 12px", fontSize: 12.5, fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer", whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

export const fmt = (d?: string) => (d ? new Date(d).toLocaleString() : "—");
