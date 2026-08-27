"use client";

import { useEffect, useState, createContext, useContext, useCallback } from "react";
import { X, Check, AlertTriangle, Copy } from "lucide-react";
import { C } from "./types";

/**
 * Shared chrome for the profile screen, in the SubhSandesh palette.
 *
 * ── RESPONSIVE STRATEGY ─────────────────────────────────────────────────────
 *
 * One breakpoint that matters: 760px. Above it, tabular data is a table,
 * because comparing rows down a column is the whole point of a table. Below it
 * a table either scrolls sideways (invisible columns) or crushes to unreadable
 * — so each row becomes its own card with the column headers as inline labels.
 * That is `.sa-table` / `.sa-cards`, and every table on this screen ships both.
 *
 * A second, softer breakpoint at 1040px only relaxes padding and grid columns.
 */

export function ProfileStyles() {
  return (
    <style>{`
      .sa-root {
        --accent: ${C.accent};
        --pink: ${C.pink};
        --text: ${C.text};
        --muted: ${C.muted};
        --border: ${C.border};
        --surface: ${C.surface};
        min-height: 100vh;
        background: ${C.bg};
        color: ${C.text};
        position: relative;
        overflow-x: clip;
      }
      /* Soft corner glow — the theme's signature, kept low-alpha so a dense
         data screen stays readable rather than becoming decorative. */
      .sa-root::before {
        content: "";
        position: absolute; inset: 0 0 auto 0; height: 420px;
        pointer-events: none; z-index: 0;
        background:
          radial-gradient(60% 70% at 12% 0%, rgba(108,92,231,.10), transparent 70%),
          radial-gradient(50% 60% at 92% 6%, rgba(247,37,133,.08), transparent 70%),
          radial-gradient(40% 50% at 60% 0%, rgba(198,255,61,.10), transparent 70%);
      }
      .sa-wrap { position: relative; z-index: 1; max-width: 1120px; margin: 0 auto; padding: 18px 14px 80px; }
      @media (min-width: 760px) { .sa-wrap { padding: 26px 22px 80px; } }
      @media (min-width: 1040px) { .sa-wrap { padding: 32px 28px 96px; } }

      .sa-h { font-family: var(--font-space-grotesk), var(--font-inter), system-ui, sans-serif; letter-spacing: -0.02em; }

      .sa-card {
        background: ${C.surface};
        border: 1px solid ${C.border};
        border-radius: ${C.radius}px;
        box-shadow: ${C.shadow};
        padding: 16px;
        margin-bottom: 14px;
      }
      @media (min-width: 760px) { .sa-card { padding: 20px; margin-bottom: 16px; } }

      .sa-card-h {
        display: flex; align-items: center; justify-content: space-between;
        gap: 10px; flex-wrap: wrap; margin-bottom: 14px;
      }
      .sa-card-t {
        margin: 0; font-size: 12px; font-weight: 700; letter-spacing: .08em;
        text-transform: uppercase; color: ${C.muted};
      }

      .sa-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 14px; }
      @media (min-width: 620px) { .sa-stats { grid-template-columns: repeat(3, 1fr); gap: 12px; } }
      @media (min-width: 1040px) { .sa-stats { grid-template-columns: repeat(6, 1fr); } }

      .sa-stat {
        background: ${C.surface}; border: 1px solid ${C.border};
        border-radius: 16px; padding: 12px 14px; box-shadow: ${C.shadow};
      }
      .sa-stat-l { font-size: 10.5px; font-weight: 700; letter-spacing: .07em; text-transform: uppercase; color: ${C.muted}; }
      .sa-stat-v { font-size: 22px; font-weight: 700; margin-top: 3px; letter-spacing: -0.02em; }
      @media (min-width: 760px) { .sa-stat-v { font-size: 26px; } }

      /* Header */
      .sa-head {
        background: ${C.surface}; border: 1px solid ${C.border};
        border-radius: ${C.radiusLg}px; box-shadow: ${C.shadow};
        padding: 16px; display: flex; gap: 14px; align-items: flex-start; flex-wrap: wrap;
      }
      @media (min-width: 760px) { .sa-head { padding: 22px; align-items: center; } }
      .sa-avatar {
        width: 52px; height: 52px; border-radius: 16px; flex-shrink: 0;
        display: grid; place-items: center; overflow: hidden;
        background: ${C.gradient}; color: #fff; font-size: 20px; font-weight: 700;
      }
      @media (min-width: 760px) { .sa-avatar { width: 64px; height: 64px; border-radius: 20px; font-size: 24px; } }
      .sa-name { margin: 0; font-size: 19px; font-weight: 700; letter-spacing: -0.02em; }
      @media (min-width: 760px) { .sa-name { font-size: 23px; } }
      .sa-email { color: ${C.muted}; font-size: 13px; margin-top: 2px; word-break: break-all; }

      /* Tabs — horizontally scrollable on phones, no wrap, no scrollbar */
      .sa-tabs {
        display: flex; gap: 6px; margin: 16px 0;
        overflow-x: auto; scrollbar-width: none; -webkit-overflow-scrolling: touch;
        padding-bottom: 2px;
      }
      .sa-tabs::-webkit-scrollbar { display: none; }
      .sa-tab {
        flex: 0 0 auto; border-radius: 999px; padding: 8px 15px;
        font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap;
        border: 1px solid ${C.border}; background: ${C.surface}; color: ${C.muted};
        transition: background .15s, color .15s, border-color .15s;
      }
      .sa-tab:hover { border-color: ${C.accent}; color: ${C.accent}; }
      .sa-tab[data-on="1"] { background: ${C.accent}; border-color: ${C.accent}; color: #fff; }
      .sa-tab[data-danger="1"] { color: ${C.pink}; }
      .sa-tab[data-danger="1"][data-on="1"] { background: ${C.pink}; border-color: ${C.pink}; color: #fff; }

      /* Buttons */
      .sa-btn {
        display: inline-flex; align-items: center; justify-content: center; gap: 6px;
        border-radius: 999px; padding: 9px 15px; font-size: 13px; font-weight: 700;
        cursor: pointer; border: 1px solid transparent; white-space: nowrap;
        transition: transform .12s, filter .15s, background .15s;
        font-family: inherit;
      }
      .sa-btn:active:not(:disabled) { transform: translateY(1px); }
      .sa-btn:disabled { opacity: .45; cursor: not-allowed; }
      .sa-btn[data-v="primary"] { background: ${C.lime}; color: ${C.text}; }
      .sa-btn[data-v="primary"]:hover:not(:disabled) { filter: brightness(.95); }
      .sa-btn[data-v="accent"] { background: ${C.accent}; color: #fff; }
      .sa-btn[data-v="accent"]:hover:not(:disabled) { background: ${C.accentStrong}; }
      .sa-btn[data-v="danger"] { background: ${C.pink}; color: #fff; }
      .sa-btn[data-v="danger"]:hover:not(:disabled) { filter: brightness(.93); }
      .sa-btn[data-v="ghost"] { background: transparent; color: ${C.muted}; border-color: ${C.border}; }
      .sa-btn[data-v="ghost"]:hover:not(:disabled) { border-color: ${C.accent}; color: ${C.accent}; }
      .sa-icon-btn { padding: 8px; border-radius: 12px; }

      .sa-input {
        width: 100%; border: 1px solid ${C.border}; border-radius: 12px;
        padding: 10px 12px; font-size: 13.5px; color: ${C.text};
        background: ${C.bgAlt}; outline: none; font-family: inherit;
        transition: border-color .15s, background .15s;
      }
      .sa-input:focus { border-color: ${C.accent}; background: ${C.surface}; }

      .sa-pill {
        display: inline-flex; align-items: center; gap: 4px;
        border-radius: 999px; padding: 3px 9px;
        font-size: 10.5px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase;
      }

      /* Definition rows */
      .sa-row {
        display: flex; justify-content: space-between; gap: 14px;
        padding: 9px 0; border-bottom: 1px solid ${C.border}; font-size: 13px;
      }
      .sa-row:last-child { border-bottom: none; }
      .sa-row-l { color: ${C.muted}; flex-shrink: 0; }
      .sa-row-v { color: ${C.text}; font-weight: 500; text-align: right; word-break: break-word; min-width: 0; }

      /* Table above 760px, stacked cards below */
      .sa-table { width: 100%; border-collapse: collapse; font-size: 13px; }
      .sa-table th {
        text-align: left; padding: 8px 10px; font-size: 10.5px; font-weight: 700;
        letter-spacing: .07em; text-transform: uppercase; color: ${C.muted};
        border-bottom: 1px solid ${C.border};
      }
      .sa-table td { padding: 11px 10px; border-bottom: 1px solid ${C.border}; vertical-align: middle; }
      .sa-table tr:last-child td { border-bottom: none; }
      .sa-table tbody tr { transition: background .12s; }
      .sa-table tbody tr:hover { background: ${C.surfaceAlt}; }

      .sa-cards { display: grid; gap: 10px; }
      .sa-mini {
        border: 1px solid ${C.border}; border-radius: 16px; padding: 13px; background: ${C.bgAlt};
      }
      .sa-mini-r { display: flex; justify-content: space-between; gap: 12px; font-size: 12.5px; padding: 3px 0; }
      .sa-mini-l { color: ${C.muted}; }

      .sa-only-lg { display: none; }
      @media (min-width: 760px) { .sa-only-lg { display: block; } .sa-only-sm { display: none; } }

      .sa-actions { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }

      /* Dialog */
      .sa-scrim {
        position: fixed; inset: 0; z-index: 1000; background: rgba(14,14,18,.42);
        backdrop-filter: blur(6px); display: grid; place-items: end center;
        padding: 0; animation: saFade .18s ease;
      }
      @media (min-width: 620px) { .sa-scrim { place-items: center; padding: 20px; } }
      @keyframes saFade { from { opacity: 0 } to { opacity: 1 } }
      .sa-dialog {
        background: ${C.surface}; width: 100%; max-width: 520px;
        border-radius: ${C.radiusLg}px ${C.radiusLg}px 0 0;
        box-shadow: ${C.shadowElevated}; padding: 20px;
        max-height: 90vh; overflow-y: auto; animation: saUp .22s cubic-bezier(.2,.8,.2,1);
      }
      @media (min-width: 620px) { .sa-dialog { border-radius: ${C.radiusLg}px; } }
      @keyframes saUp { from { transform: translateY(14px); opacity: .6 } to { transform: none; opacity: 1 } }
      .sa-dialog-wide { max-width: 860px; }

      /* Toast */
      .sa-toasts {
        position: fixed; left: 50%; transform: translateX(-50%); bottom: 20px;
        z-index: 1100; display: grid; gap: 8px; width: calc(100% - 28px); max-width: 420px;
      }
      .sa-toast {
        display: flex; align-items: center; gap: 9px;
        border-radius: 14px; padding: 11px 14px; font-size: 13px; font-weight: 600;
        box-shadow: ${C.shadowElevated}; color: #fff; animation: saUp .2s ease;
      }

      .sa-skel {
        background: linear-gradient(90deg, ${C.bgAlt} 25%, #e9e7e0 37%, ${C.bgAlt} 63%);
        background-size: 400% 100%; animation: saShim 1.3s ease infinite; border-radius: 12px;
      }
      @keyframes saShim { from { background-position: 100% 50% } to { background-position: 0 50% } }

      .sa-mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12.5px; }
    `}</style>
  );
}

/* ── Toasts ───────────────────────────────────────────────────────────────── */

type Toast = { id: number; msg: string; tone: "ok" | "bad" };
const ToastCtx = createContext<(msg: string, tone?: "ok" | "bad") => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastHost({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const push = useCallback((msg: string, tone: "ok" | "bad" = "ok") => {
    const id = Date.now() + Math.random();
    setItems((x) => [...x, { id, msg, tone }]);
    setTimeout(() => setItems((x) => x.filter((t) => t.id !== id)), 4200);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="sa-toasts">
        {items.map((t) => (
          <div key={t.id} className="sa-toast" style={{ background: t.tone === "ok" ? C.green : C.pink }}>
            {t.tone === "ok" ? <Check size={15} /> : <AlertTriangle size={15} />}
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ── Dialog ───────────────────────────────────────────────────────────────── */

export function Dialog({
  open, onClose, title, children, wide,
}: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode; wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    // Stop the page behind from scrolling under the sheet on touch devices.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = prev; };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="sa-scrim" onClick={onClose}>
      <div className={`sa-dialog${wide ? " sa-dialog-wide" : ""}`} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
          <h3 className="sa-h" style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} className="sa-btn sa-icon-btn" data-v="ghost" aria-label="Close"><X size={15} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ── Primitives ───────────────────────────────────────────────────────────── */

export function Card({ title, children, action }: { title?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="sa-card">
      {title && (
        <div className="sa-card-h">
          <h3 className="sa-card-t">{title}</h3>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function Stat({ label, value, tone }: { label: string; value: React.ReactNode; tone?: string }) {
  return (
    <div className="sa-stat">
      <div className="sa-stat-l">{label}</div>
      <div className="sa-stat-v sa-h" style={{ color: tone || C.text }}>{value}</div>
    </div>
  );
}

export function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="sa-row">
      <span className="sa-row-l">{label}</span>
      <span className="sa-row-v">{value ?? "—"}</span>
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div style={{ color: C.muted, fontSize: 13, padding: "26px 0", textAlign: "center" }}>{children}</div>;
}

export function Btn({
  children, onClick, variant = "accent", disabled, title, icon,
}: {
  children?: React.ReactNode; onClick?: () => void;
  variant?: "primary" | "accent" | "danger" | "ghost";
  disabled?: boolean; title?: string; icon?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={icon && typeof children !== "string" ? title : undefined}
      className={`sa-btn${icon ? " sa-icon-btn" : ""}`}
      data-v={variant}
    >
      {children}
    </button>
  );
}

export function Pill({ text, color }: { text: string; color: string }) {
  return (
    <span className="sa-pill" style={{ color, background: `${color}18`, border: `1px solid ${color}38` }}>
      {text}
    </span>
  );
}

export function CopyBtn({ value, label = "Copy" }: { value: string; label?: string }) {
  const toast = useToast();
  return (
    <Btn
      variant="ghost"
      icon
      title={label}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          toast("Copied");
        } catch {
          toast("Clipboard unavailable", "bad");
        }
      }}
    >
      <Copy size={13} />
    </Btn>
  );
}

export function Skeleton({ h = 60 }: { h?: number }) {
  return <div className="sa-skel" style={{ height: h, marginBottom: 12 }} />;
}

export const fmt = (d?: string | Date) => (d ? new Date(d).toLocaleString() : "—");
export const fmtShort = (d?: string | Date) =>
  d ? new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "—";
