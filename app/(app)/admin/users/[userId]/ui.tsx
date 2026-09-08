"use client";

import { useEffect } from "react";
import { X, Copy } from "lucide-react";
import { useToast } from "@/lib/toast/useToast";
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
        min-height: 100vh;
        background: linear-gradient(180deg,#faf3ee 0%,#f5ede6 46%,#efe3d3 100%);
        color: ${C.text};
        position: relative;
        overflow-x: clip;
        font-size: 13px;
      }
      .sa-wrap { position: relative; z-index: 1; max-width: 1180px; margin: 0 auto; padding: 12px 12px 64px; }
      @media (min-width: 760px) { .sa-wrap { padding: 18px 20px 64px; } }
      @media (min-width: 1040px) { .sa-wrap { padding: 22px 28px 72px; } }

      /* Lora is the site's heading serif and is already loaded globally. */
      .sa-h { font-family: var(--font-lora), Georgia, serif; letter-spacing: -0.01em; }

      .sa-root, .sa-wrap { max-width: 100%; }
      /* Every flex child defaults to min-width:auto, which refuses to shrink
         below its content — that is what pushed a long share link past the
         screen edge. Reset it wherever text can be long. */
      .sa-card, .sa-mini, .sa-card-h, .sa-mini-r, .sa-row { min-width: 0; max-width: 100%; }
      .sa-mini-r > *, .sa-row > *, .sa-card-h > * { min-width: 0; }

      .sa-card {
        background: ${C.surface};
        border: 1px solid ${C.border};
        border-radius: ${C.radius}px;
        box-shadow: ${C.shadow};
        padding: 12px;
        margin-bottom: 10px;
      }
      @media (min-width: 760px) { .sa-card { padding: 15px 16px; margin-bottom: 12px; } }

      .sa-card-h {
        display: flex; align-items: center; justify-content: space-between;
        gap: 10px; flex-wrap: wrap; margin-bottom: 10px;
      }
      @media (max-width: 759px) {
        .sa-card-h { flex-direction: column; align-items: stretch; gap: 8px; }
      }
      .sa-search { display: flex; align-items: center; gap: 7px; width: 100%; }
      @media (min-width: 760px) { .sa-search { width: 300px; } }

      .sa-card-t {
        margin: 0; font-size: 11px; font-weight: 700; letter-spacing: .07em;
        text-transform: uppercase; color: ${C.muted};
      }

      /* Dense by design: six numbers should fit one row on a laptop. */
      .sa-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 7px; margin-bottom: 10px; }
      @media (min-width: 700px) { .sa-stats { grid-template-columns: repeat(6, 1fr); gap: 8px; } }

      .sa-stat {
        background: ${C.surface}; border: 1px solid ${C.border};
        border-radius: ${C.radius}px; padding: 9px 10px; box-shadow: ${C.shadow};
      }
      .sa-stat-l { font-size: 9.5px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: ${C.faint}; }
      .sa-stat-v { font-size: 18px; font-weight: 700; margin-top: 1px; line-height: 1.2; }
      @media (min-width: 760px) { .sa-stat-v { font-size: 20px; } }

      /* Header — maroon, so the identity you are acting on is unmistakable */
      .sa-head {
        background: ${C.gradient};
        border-radius: ${C.radiusLg}px;
        padding: 13px; display: flex; gap: 11px; align-items: center; flex-wrap: wrap;
        color: #f5ede6; box-shadow: 0 6px 20px rgba(26,5,7,0.18);
      }
      @media (min-width: 760px) { .sa-head { padding: 16px 18px; gap: 14px; } }
      .sa-avatar {
        width: 42px; height: 42px; border-radius: 11px; flex-shrink: 0;
        display: grid; place-items: center; overflow: hidden;
        background: rgba(245,237,230,0.14); border: 1px solid rgba(201,168,76,0.5);
        color: ${C.gold}; font-size: 17px; font-weight: 700;
      }
      @media (min-width: 760px) { .sa-avatar { width: 50px; height: 50px; border-radius: 13px; font-size: 20px; } }
      .sa-name { margin: 0; font-size: 17px; font-weight: 700; color: #fdf7f0; }
      @media (min-width: 760px) { .sa-name { font-size: 20px; } }
      .sa-email { color: rgba(245,237,230,0.66); font-size: 12px; margin-top: 1px; word-break: break-all; }

      .sa-tabs {
        display: flex; gap: 5px; margin: 11px 0;
        overflow-x: auto; scrollbar-width: none; -webkit-overflow-scrolling: touch;
      }
      .sa-tabs::-webkit-scrollbar { display: none; }
      .sa-tab {
        flex: 0 0 auto; border-radius: 8px; padding: 6px 12px;
        font-size: 12px; font-weight: 700; cursor: pointer; white-space: nowrap;
        border: 1px solid ${C.border}; background: rgba(255,255,255,0.6); color: ${C.muted};
        transition: background .15s, color .15s, border-color .15s;
      }
      .sa-tab:hover { border-color: ${C.gold}; color: ${C.accent}; }
      .sa-tab[data-on="1"] { background: ${C.accentStrong}; border-color: ${C.accentStrong}; color: #f5ede6; }
      .sa-tab[data-danger="1"] { color: ${C.danger}; }
      .sa-tab[data-danger="1"][data-on="1"] { background: ${C.danger}; border-color: ${C.danger}; color: #fff; }

      .sa-btn {
        display: inline-flex; align-items: center; justify-content: center; gap: 5px;
        border-radius: 8px; padding: 6px 11px; font-size: 12px; font-weight: 700;
        cursor: pointer; border: 1px solid transparent; white-space: nowrap;
        transition: filter .15s, background .15s, border-color .15s;
        font-family: inherit;
      }
      .sa-btn:disabled { opacity: .42; cursor: not-allowed; }
      .sa-btn[data-v="primary"] { background: ${C.gold}; color: ${C.text}; }
      .sa-btn[data-v="primary"]:hover:not(:disabled) { background: ${C.goldDeep}; color: #fff; }
      .sa-btn[data-v="accent"] { background: ${C.accentStrong}; color: #f5ede6; }
      .sa-btn[data-v="accent"]:hover:not(:disabled) { filter: brightness(1.35); }
      .sa-btn[data-v="danger"] { background: ${C.danger}; color: #fff; }
      .sa-btn[data-v="danger"]:hover:not(:disabled) { filter: brightness(.92); }
      .sa-btn[data-v="ghost"] { background: rgba(255,255,255,0.55); color: ${C.muted}; border-color: ${C.border}; }
      .sa-btn[data-v="ghost"]:hover:not(:disabled) { border-color: ${C.gold}; color: ${C.accent}; }
      /* Compact, but still a comfortable mouse target — 19x26 was too tight. */
      .sa-icon-btn { padding: 6px; border-radius: 7px; min-width: 30px; min-height: 30px; }

      .sa-input {
        width: 100%; border: 1px solid ${C.border}; border-radius: 8px;
        padding: 7px 10px; font-size: 12.5px; color: ${C.text};
        background: ${C.bgAlt}; outline: none; font-family: inherit;
        transition: border-color .15s, background .15s;
      }
      .sa-input:focus { border-color: ${C.gold}; background: ${C.surface}; }

      .sa-pill {
        display: inline-flex; align-items: center; gap: 3px;
        border-radius: 5px; padding: 2px 7px;
        font-size: 9.5px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase;
      }

      .sa-row {
        display: flex; justify-content: space-between; gap: 12px;
        padding: 6px 0; border-bottom: 1px solid ${C.border}; font-size: 12.5px;
      }
      .sa-row:last-child { border-bottom: none; }
      .sa-row-l { color: ${C.faint}; flex-shrink: 0; }
      .sa-row-v { color: ${C.text}; font-weight: 500; text-align: right; word-break: break-word; min-width: 0; }

      .sa-table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
      .sa-table th {
        text-align: left; padding: 6px 9px; font-size: 9.5px; font-weight: 700;
        letter-spacing: .06em; text-transform: uppercase; color: ${C.faint};
        border-bottom: 1px solid ${C.borderStrong};
      }
      .sa-table td { padding: 7px 9px; border-bottom: 1px solid ${C.border}; vertical-align: middle; }
      .sa-table tr:last-child td { border-bottom: none; }
      .sa-table tbody tr { transition: background .12s; }
      .sa-table tbody tr:hover { background: rgba(201,168,76,0.07); }

      .sa-cards { display: grid; gap: 9px; }
      .sa-tpl-grid { display: grid; gap: 10px; grid-template-columns: 1fr; }
      @media (min-width: 720px) { .sa-tpl-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
      @media (min-width: 1180px) { .sa-tpl-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }

      /* ── Template card ────────────────────────────────────────────────────
         A card, not a table row: a title bar carrying name, status and reach; a
         quiet body of facts; a footer of exactly three actions. Three fit one
         line at 320px, a fourth does not — which is why revealing and changing
         the password live inline on the password row instead of the footer. */
      .sa-tpl {
        border: 1px solid ${C.border}; border-radius: ${C.radiusLg}px;
        background: ${C.surface}; overflow: hidden; min-width: 0;
        box-shadow: ${C.shadow}; transition: border-color .15s, box-shadow .15s;
      }
      .sa-tpl:hover { border-color: rgba(201,168,76,0.55); box-shadow: 0 4px 16px rgba(61,12,17,0.09); }
      .sa-tpl-h {
        display: flex; align-items: center; gap: 8px; padding: 9px 12px;
        background: linear-gradient(180deg,#fdf9f4,#f8efe4);
        border-bottom: 1px solid ${C.border}; min-width: 0;
      }
      .sa-tpl-name {
        font-family: var(--font-lora), Georgia, serif;
        font-size: 14.5px; font-weight: 700; margin: 0; min-width: 0; flex: 1;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
      .sa-tpl-b { padding: 9px 12px; }
      .sa-tpl-f {
        display: grid; grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 6px; padding: 9px 12px; border-top: 1px solid ${C.border};
        background: ${C.bgAlt};
      }
      .sa-tpl-f > .sa-btn, .sa-tpl-f > a.sa-btn {
        width: 100%; min-height: 38px; border-radius: 9px;
        font-size: 12px; gap: 5px; overflow: hidden;
      }
      @media (max-width: 400px) {
        .sa-tpl-f > .sa-btn, .sa-tpl-f > a.sa-btn { font-size: 11.5px; padding: 8px 4px; gap: 4px; }
      }

      .sa-reach { display: flex; align-items: baseline; gap: 3px; flex-shrink: 0; font-size: 11px; color: ${C.muted}; }
      .sa-reach strong { font-size: 13px; color: ${C.text}; }

      .sa-det { border-top: 1px dashed ${C.border}; margin-top: 8px; padding-top: 8px; }
      .sa-det-sum {
        cursor: pointer; list-style: none; display: flex; align-items: center; gap: 5px;
        font-size: 10.5px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase;
        color: ${C.accent}; user-select: none;
      }
      .sa-det-sum::-webkit-details-marker { display: none; }
      .sa-det-grid { display: grid; gap: 8px; margin-top: 9px; }
      @media (min-width: 620px) { .sa-det-grid { grid-template-columns: 1fr 1fr; gap: 9px 16px; } }
      .sa-det-i { min-width: 0; }
      .sa-det-k { font-size: 9.5px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: ${C.faint}; }
      .sa-det-v { font-size: 12.5px; line-height: 1.5; word-break: break-word; white-space: pre-wrap; margin-top: 1px; }

      .sa-edit-f { display: grid; gap: 11px; }
      .sa-edit-k { font-size: 10px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: ${C.faint}; margin-bottom: 3px; }
      .sa-ta {
        width: 100%; border: 1px solid ${C.border}; border-radius: 8px;
        padding: 7px 10px; font-size: 12.5px; color: ${C.text}; background: ${C.bgAlt};
        outline: none; font-family: inherit; resize: vertical; min-height: 60px; line-height: 1.5;
      }
      .sa-ta:focus { border-color: ${C.gold}; background: ${C.surface}; }
      .sa-mini { border: 1px solid ${C.border}; border-radius: ${C.radius}px; padding: 10px; background: ${C.bgAlt}; }
      .sa-mini-r { display: flex; justify-content: space-between; gap: 10px; font-size: 12px; padding: 2px 0; }
      .sa-mini-l { color: ${C.faint}; white-space: nowrap; flex-shrink: 0; }

      .sa-only-lg { display: none; }
      @media (min-width: 760px) { .sa-only-lg { display: block; } .sa-only-sm { display: none; } }

      .sa-actions { display: flex; gap: 4px; align-items: center; flex-wrap: wrap; }

      /* Phones get labelled, full-width buttons in a row that divides evenly,
         each at a real touch size. Desktop keeps the compact icon strip. */
      .sa-lbl { display: none; }
      @media (max-width: 759px) {
        /* Two across, not four. Four labelled buttons on a 360px phone leaves
           ~67px each, and "Password" does not fit that — the label spilled out
           of its own button. Two columns give ~145px, which fits comfortably. */
        .sa-actions {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 7px; width: 100%;
        }
        .sa-actions > .sa-btn, .sa-actions > a.sa-btn {
          width: 100%; min-height: 42px; padding: 8px;
          border-radius: 9px; font-size: 12px; gap: 6px;
          overflow: hidden;
        }
        .sa-lbl {
          display: inline; overflow: hidden;
          text-overflow: ellipsis; white-space: nowrap; min-width: 0;
        }
      }
      /* Roomier phones and small tablets fit all four in one row. */
      @media (min-width: 480px) and (max-width: 759px) {
        .sa-actions { grid-template-columns: repeat(4, minmax(0, 1fr)); }
      }

      .sa-scrim {
        position: fixed; inset: 0; z-index: 1000; background: rgba(26,5,7,.42);
        backdrop-filter: blur(4px); display: grid; place-items: end center;
        animation: saFade .16s ease;
      }
      @media (min-width: 620px) { .sa-scrim { place-items: center; padding: 20px; } }
      @keyframes saFade { from { opacity: 0 } to { opacity: 1 } }
      .sa-dialog {
        background: ${C.surface}; width: 100%; max-width: 460px;
        border-radius: ${C.radiusLg}px ${C.radiusLg}px 0 0;
        box-shadow: ${C.shadowElevated}; padding: 16px;
        max-height: 90vh; overflow-y: auto; animation: saUp .2s cubic-bezier(.2,.8,.2,1);
        border: 1px solid ${C.border};
      }
      @media (min-width: 620px) { .sa-dialog { border-radius: ${C.radiusLg}px; padding: 18px; } }
      @keyframes saUp { from { transform: translateY(12px); opacity: .6 } to { transform: none; opacity: 1 } }
      .sa-dialog-wide { max-width: 820px; }


      .sa-skel {
        background: linear-gradient(90deg, ${C.bgAlt} 25%, #eee2d6 37%, ${C.bgAlt} 63%);
        background-size: 400% 100%; animation: saShim 1.3s ease infinite; border-radius: ${C.radius}px;
      }
      @keyframes saShim { from { background-position: 100% 50% } to { background-position: 0 50% } }

      .sa-mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11.5px; }
    `}</style>
  );
}

/* ── Toasts ───────────────────────────────────────────────────────────────── */

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
      style={{ flexShrink: 0 }}
    >
      {children}
    </button>
  );
}

/**
 * `solid` is for the maroon header. The tinted default is built for the cream
 * canvas — a 9%-alpha fill over deep maroon reads as no fill at all, leaving
 * coloured text on a dark ground at far too little contrast.
 */
export function Pill({ text, color, solid }: { text: string; color: string; solid?: boolean }) {
  return (
    <span
      className="sa-pill"
      style={
        solid
          ? { color: "#1a0507", background: color, border: `1px solid ${color}` }
          : { color, background: `${color}18`, border: `1px solid ${color}38` }
      }
    >
      {text}
    </span>
  );
}

export function CopyBtn({ value, label = "Copy" }: { value: string; label?: string }) {
  const { pushToast } = useToast();
  return (
    <Btn
      variant="ghost"
      icon
      title={label}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          pushToast({ title: "Copied", type: "success" });
        } catch {
          pushToast({ title: "Clipboard unavailable", type: "error" });
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
