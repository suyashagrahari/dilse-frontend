"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { X, Copy } from "lucide-react";
import { useToast } from "@/lib/toast/useToast";
import { A, Num } from "../../adminKit";
import { C } from "./types";

/**
 * Shared chrome for the profile screen, in the SubhSandesh palette and the
 * admin kit's look: cream glass cards that fade up, a maroon hero, gold accents.
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
      .sa-root { color: ${C.text}; position: relative; font-size: 13px; min-width: 0; max-width: 100%; }

      /* Lora is the site's heading serif and is already loaded globally. */
      .sa-h { font-family: var(--font-lora), Georgia, serif; letter-spacing: -0.01em; }

      /* Every flex child defaults to min-width:auto, which refuses to shrink
         below its content — that is what pushed a long share link past the
         screen edge. Reset it wherever text can be long. */
      .sa-card, .sa-mini, .sa-card-h, .sa-mini-r, .sa-row { min-width: 0; max-width: 100%; }
      .sa-mini-r > *, .sa-row > *, .sa-card-h > * { min-width: 0; }

      /* translate, not transform: a filled animation would pin transform and cancel the hover lift. */
      @keyframes saRise { from { opacity: 0; translate: 0 8px; } to { opacity: 1; translate: none; } }

      .sa-card {
        background: ${A.card}; border: 1px solid ${A.edge}; border-radius: 16px;
        backdrop-filter: blur(8px); padding: 11px 12px; margin-bottom: 10px;
        transition: box-shadow .18s, border-color .18s;
      }
      .sa-card:hover { box-shadow: 0 12px 26px -20px rgba(61,12,17,.45); }
      @media (min-width: 760px) { .sa-card { padding: 13px 14px; } }
      .sa-card[data-tone="danger"] { border-color: rgba(179,38,30,.22); background: linear-gradient(180deg, rgba(179,38,30,.045), ${A.card}); }

      .sa-card-h {
        display: flex; align-items: center; justify-content: space-between;
        gap: 8px; flex-wrap: wrap; margin-bottom: 9px;
      }
      @media (max-width: 759px) { .sa-card-h[data-stack="1"] { flex-direction: column; align-items: stretch; } }
      .sa-card-tw { display: flex; align-items: baseline; gap: 6px; min-width: 0; flex-wrap: wrap; }
      .sa-card-t { margin: 0; font-size: 13.5px; font-weight: 800; color: ${A.ink}; white-space: nowrap; }
      .sa-card-note { font-size: 11px; color: ${A.muted}; font-weight: 600; }
      .sa-search { display: flex; align-items: center; gap: 7px; width: 100%; }
      @media (min-width: 760px) { .sa-search { width: 280px; } }

      .sa-grid2 { display: grid; grid-template-columns: minmax(0,1fr); gap: 0 10px; align-items: start; }
      @media (min-width: 900px) { .sa-grid2 { grid-template-columns: minmax(0,1.15fr) minmax(0,1fr); } }

      /* Dense by design: six numbers should fit one row on a laptop. */
      .sa-stats { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 7px; margin-bottom: 10px; }
      @media (min-width: 700px) { .sa-stats { grid-template-columns: repeat(6, minmax(0,1fr)); gap: 8px; } }

      .sa-stat {
        position: relative; overflow: hidden; min-width: 0;
        background: ${A.card}; border: 1px solid ${A.edge}; border-radius: 14px; padding: 9px 10px;
        animation: saRise .35s cubic-bezier(.22,1,.36,1) both;
        transition: transform .15s, box-shadow .15s;
      }
      .sa-stat:hover { transform: translateY(-1px); box-shadow: 0 10px 24px -16px rgba(61,12,17,.45); }
      .sa-stat-blob { position: absolute; right: -16px; top: -16px; width: 52px; height: 52px; border-radius: 50%;
        background: color-mix(in srgb, var(--acc) 13%, transparent); }
      .sa-stat-l { position: relative; font-size: 9.5px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: ${A.muted};
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .sa-stat-v { position: relative; font-size: 19px; font-weight: 800; margin-top: 3px; line-height: 1.1;
        font-family: 'Playfair Display', serif; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      @media (min-width: 760px) { .sa-stat-v { font-size: 22px; } }

      /* ── Hero — maroon, so the identity you are acting on is unmistakable ── */
      .sa-hero { position: relative; overflow: hidden; border-radius: 20px; padding: 14px; color: #f5ede6;
        background: radial-gradient(120% 140% at 0% 0%, #6b1a22 0%, #3d0c11 55%, #240609 100%);
        box-shadow: 0 18px 40px -22px rgba(61,12,17,.8); }
      @media (min-width: 760px) { .sa-hero { padding: 16px 18px; } }
      .sa-hero-glow { position: absolute; right: -60px; top: -80px; width: 240px; height: 240px; border-radius: 50%;
        background: radial-gradient(circle, rgba(201,168,76,.28), transparent 65%); pointer-events: none; }
      .sa-hero-top { position: relative; display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
      .sa-avatar-w { position: relative; flex: none; }
      .sa-avatar {
        width: 54px; height: 54px; border-radius: 16px;
        display: grid; place-items: center; overflow: hidden;
        background: rgba(245,237,230,0.12); border: 1.5px solid rgba(201,168,76,0.6);
        color: #ffe3a3; font-size: 22px; font-weight: 800; font-family: 'Playfair Display', serif;
        box-shadow: 0 0 0 4px rgba(201,168,76,.12);
      }
      @media (min-width: 760px) { .sa-avatar { width: 62px; height: 62px; border-radius: 18px; font-size: 25px; } }
      .sa-avatar-badge { position: absolute; right: -5px; bottom: -5px; width: 22px; height: 22px; border-radius: 50%;
        background: #fff; display: grid; place-items: center; box-shadow: 0 2px 8px rgba(0,0,0,.3); border: 2px solid #3d0c11; }
      .sa-id { flex: 1 1 200px; min-width: 0; }
      .sa-name { margin: 0; font-size: 19px; font-weight: 800; color: #fdf7f0; line-height: 1.15;
        font-family: 'Playfair Display', serif; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      @media (min-width: 760px) { .sa-name { font-size: 23px; } }
      .sa-email { color: rgba(245,237,230,0.7); font-size: 12px; margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .sa-hero-pills { display: flex; align-items: center; gap: 5px; flex-wrap: wrap; margin-top: 6px; }
      .sa-hero-meta { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; color: rgba(245,237,230,.72); }
      .sa-hero-btn { flex: none; }
      @media (max-width: 519px) { .sa-hero-btn { flex: 1 1 100%; } .sa-hero-btn > .sa-btn { width: 100%; min-height: 38px; } }
      .sa-hero-stats { position: relative; display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 6px;
        margin-top: 12px; padding-top: 11px; border-top: 1px solid rgba(201,168,76,.22); }
      .sa-hs { min-width: 0; }
      .sa-hs-v { font-size: 21px; font-weight: 800; line-height: 1; color: #fff; font-family: 'Playfair Display', serif; }
      .sa-hs[data-big="1"] .sa-hs-v { color: #ffe3a3; }
      @media (min-width: 760px) { .sa-hs-v { font-size: 27px; } }
      .sa-hs-l { font-size: 10px; font-weight: 700; opacity: .72; margin-top: 4px; letter-spacing: .03em;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

      /* ── Sliding-pill tab bar, sticky under the admin navbar ── */
      .sa-tabs {
        position: sticky; top: calc(var(--adm-top) + 8px); z-index: 20;
        display: flex; gap: 3px; margin: 10px 0; padding: 4px; border-radius: 14px;
        background: rgba(255,253,251,.86); border: 1px solid ${A.edge}; backdrop-filter: blur(10px);
        box-shadow: 0 10px 24px -20px rgba(61,12,17,.5);
        overflow-x: auto; scrollbar-width: none; -webkit-overflow-scrolling: touch;
      }
      .sa-tabs::-webkit-scrollbar { display: none; }
      .sa-tab {
        position: relative; flex: 0 0 auto; height: 34px; border-radius: 10px; padding: 0 12px;
        display: inline-flex; align-items: center; gap: 6px;
        font-size: 12px; font-weight: 700; cursor: pointer; white-space: nowrap;
        border: none; background: transparent; color: ${A.soft}; font-family: inherit;
        transition: color .2s, background .15s;
      }
      .sa-tab:hover { color: ${A.maroon}; background: rgba(201,168,76,.1); }
      .sa-tab[data-on="1"] { color: #fff6e6; background: transparent; }
      .sa-tab[data-danger="1"] { color: ${A.danger}; }
      .sa-tab[data-danger="1"][data-on="1"] { color: #fff; }
      .sa-tab-pill { position: absolute; inset: 0; border-radius: 10px; z-index: 0;
        background: linear-gradient(135deg, #5a1520, #3d0c11); box-shadow: 0 6px 14px -8px rgba(61,12,17,.8); }
      .sa-tab[data-danger="1"] .sa-tab-pill { background: linear-gradient(135deg, #c4382f, #8e1c15); }
      .sa-tab-in { position: relative; z-index: 1; display: inline-flex; align-items: center; gap: 6px; }

      .sa-btn {
        display: inline-flex; align-items: center; justify-content: center; gap: 5px;
        border-radius: 10px; padding: 7px 12px; font-size: 12px; font-weight: 800;
        cursor: pointer; border: 1px solid transparent; white-space: nowrap; text-decoration: none;
        transition: transform .15s, box-shadow .15s, filter .15s, background .15s, border-color .15s;
        font-family: inherit;
      }
      .sa-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 18px -12px rgba(61,12,17,.5); }
      .sa-btn:disabled { opacity: .42; cursor: not-allowed; }
      .sa-btn[data-v="primary"] { background: linear-gradient(135deg, #d9bb62, ${C.gold}); color: ${A.ink}; }
      .sa-btn[data-v="primary"]:hover:not(:disabled) { filter: brightness(1.05); }
      .sa-btn[data-v="accent"] { background: linear-gradient(135deg, #5a1520, #3d0c11); color: #fff6e6; }
      .sa-btn[data-v="accent"]:hover:not(:disabled) { filter: brightness(1.25); }
      .sa-btn[data-v="danger"] { background: ${A.danger}; color: #fff; }
      .sa-btn[data-v="danger"]:hover:not(:disabled) { filter: brightness(.92); }
      .sa-btn[data-v="ghost"] { background: rgba(255,255,255,0.75); color: ${A.soft}; border-color: ${A.edge}; }
      .sa-btn[data-v="ghost"]:hover:not(:disabled) { border-color: ${C.gold}; color: ${A.maroon}; }
      /* Compact, but still a comfortable mouse target — 19x26 was too tight. */
      .sa-icon-btn { padding: 6px; border-radius: 8px; min-width: 30px; min-height: 30px; }
      .sa-icon-btn:hover:not(:disabled) { transform: none; box-shadow: none; }

      .sa-input {
        width: 100%; border: 1px solid ${A.edge}; border-radius: 10px;
        padding: 8px 10px; font-size: 12.5px; color: ${A.ink};
        background: #fff; outline: none; font-family: inherit; min-width: 0;
        transition: border-color .2s, box-shadow .2s;
      }
      .sa-input:focus { border-color: ${C.gold}; box-shadow: 0 0 0 3px rgba(201,168,76,.15); }

      .sa-pill {
        display: inline-flex; align-items: center; gap: 4px;
        border-radius: 99px; padding: 2px 8px; white-space: nowrap;
        font-size: 9.5px; font-weight: 800; letter-spacing: .05em; text-transform: uppercase;
      }

      .sa-row {
        display: flex; justify-content: space-between; align-items: center; gap: 12px;
        padding: 6px 0; border-bottom: 1px dashed ${A.edge}; font-size: 12.5px;
      }
      .sa-row:last-child { border-bottom: none; }
      .sa-row-l { color: ${A.muted}; flex-shrink: 0; font-size: 11.5px; font-weight: 600; }
      .sa-row-v { color: ${A.ink}; font-weight: 600; text-align: right; overflow-wrap: anywhere; min-width: 0; }

      .sa-table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
      .sa-table th {
        text-align: left; padding: 6px 9px; font-size: 9.5px; font-weight: 800;
        letter-spacing: .06em; text-transform: uppercase; color: ${A.muted};
        border-bottom: 1px solid ${C.borderStrong};
      }
      .sa-table td { padding: 7px 9px; border-bottom: 1px solid ${A.edge}; vertical-align: middle; }
      .sa-table tr:last-child td { border-bottom: none; }
      .sa-table tbody tr { transition: background .12s; }
      .sa-table tbody tr:hover { background: rgba(201,168,76,0.08); }

      .sa-cards { display: grid; gap: 7px; }
      .sa-tpl-grid { display: grid; gap: 9px; grid-template-columns: minmax(0,1fr); }
      @media (min-width: 720px) { .sa-tpl-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
      @media (min-width: 1140px) { .sa-tpl-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }

      /* ── Template card ────────────────────────────────────────────────────
         A card, not a table row: a title bar carrying name, status and reach; a
         quiet body of facts; a footer of exactly three actions. Three fit one
         line at 320px, a fourth does not — which is why revealing and changing
         the password live inline on the password row instead of the footer. */
      .sa-tpl {
        border: 1px solid ${A.edge}; border-radius: 14px;
        background: ${A.paper}; overflow: hidden; min-width: 0;
        animation: saRise .35s cubic-bezier(.22,1,.36,1) both;
        transition: transform .18s, border-color .18s, box-shadow .18s;
      }
      .sa-tpl:hover { transform: translateY(-2px); border-color: rgba(201,168,76,0.55); box-shadow: 0 12px 26px -16px rgba(61,12,17,.45); }
      .sa-tpl-h {
        display: flex; align-items: center; gap: 7px; padding: 8px 11px;
        background: linear-gradient(180deg,#fdf9f4,#f8efe4);
        border-bottom: 1px solid ${A.edge}; min-width: 0;
      }
      .sa-tpl-name {
        font-family: 'Playfair Display', serif;
        font-size: 14px; font-weight: 800; margin: 0; min-width: 0; flex: 1; color: ${A.ink};
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
      .sa-tpl-b { padding: 6px 11px 8px; }
      .sa-tpl-f {
        display: grid; grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 6px; padding: 8px 11px; border-top: 1px solid ${A.edge};
        background: rgba(245,237,230,.45);
      }
      .sa-tpl-f > .sa-btn, .sa-tpl-f > a.sa-btn {
        width: 100%; min-height: 36px; border-radius: 10px;
        font-size: 12px; gap: 5px; overflow: hidden;
      }
      @media (max-width: 400px) {
        .sa-tpl-f > .sa-btn, .sa-tpl-f > a.sa-btn { font-size: 11.5px; padding: 8px 4px; gap: 4px; }
      }

      .sa-reach { display: flex; align-items: baseline; gap: 3px; flex-shrink: 0; font-size: 11px; color: ${A.muted}; }
      .sa-reach strong { font-size: 13px; color: ${A.ink}; }

      .sa-det { border-top: 1px dashed ${A.edge}; margin-top: 6px; padding-top: 7px; }
      .sa-det-sum {
        cursor: pointer; list-style: none; display: flex; align-items: center; gap: 5px;
        font-size: 10.5px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase;
        color: ${C.accent}; user-select: none;
      }
      .sa-det-sum svg { transition: transform .2s; }
      .sa-det[open] .sa-det-sum svg { transform: rotate(90deg); }
      .sa-det-sum::-webkit-details-marker { display: none; }
      .sa-det-grid { display: grid; gap: 8px; margin-top: 9px; }
      @media (min-width: 620px) { .sa-det-grid { grid-template-columns: minmax(0,1fr) minmax(0,1fr); gap: 9px 16px; } }
      .sa-det-i { min-width: 0; }
      .sa-det-k { font-size: 9.5px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: ${A.muted}; }
      .sa-det-v { font-size: 12.5px; line-height: 1.5; overflow-wrap: anywhere; white-space: pre-wrap; margin-top: 1px; }

      .sa-edit-f { display: grid; gap: 11px; }
      .sa-edit-k { font-size: 10px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: ${A.muted}; margin-bottom: 3px; }
      .sa-ta {
        width: 100%; border: 1px solid ${A.edge}; border-radius: 10px;
        padding: 8px 10px; font-size: 12.5px; color: ${A.ink}; background: #fff;
        outline: none; font-family: inherit; resize: vertical; min-height: 60px; line-height: 1.5;
        transition: border-color .2s, box-shadow .2s;
      }
      .sa-ta:focus { border-color: ${C.gold}; box-shadow: 0 0 0 3px rgba(201,168,76,.15); }
      .sa-mini {
        border: 1px solid ${A.edge}; border-radius: 12px; padding: 9px 10px; background: ${A.paper};
        animation: saRise .3s cubic-bezier(.22,1,.36,1) both;
        transition: transform .15s, border-color .15s, box-shadow .15s;
      }
      .sa-mini:hover { transform: translateY(-1px); border-color: rgba(201,168,76,.5); box-shadow: 0 10px 22px -18px rgba(61,12,17,.5); }
      .sa-mini-r { display: flex; justify-content: space-between; gap: 10px; font-size: 12px; padding: 2px 0; }
      .sa-mini-r > span:last-child { overflow-wrap: anywhere; text-align: right; }
      .sa-mini-l { color: ${A.muted}; white-space: nowrap; flex-shrink: 0; }

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

      /* Portalled to <body> and above the BottomNav (79), admin navbar (45)
         and every sheet the brief reserves 189+ for. */
      .sa-scrim {
        position: fixed; inset: 0; z-index: 1000; background: rgba(26,5,7,.46);
        backdrop-filter: blur(4px); display: grid; place-items: end center;
        animation: saFade .16s ease;
      }
      @media (min-width: 620px) { .sa-scrim { place-items: center; padding: 20px; } }
      @keyframes saFade { from { opacity: 0 } to { opacity: 1 } }
      .sa-dialog {
        background: ${A.paper}; color: ${A.ink}; width: 100%; max-width: 460px; font-size: 13px;
        border-radius: 20px 20px 0 0;
        box-shadow: 0 30px 70px -20px rgba(26,5,7,.6); padding: 16px 16px calc(16px + env(safe-area-inset-bottom));
        max-height: 90vh; overflow-y: auto; animation: saUp .24s cubic-bezier(.2,.8,.2,1);
        border: 1px solid ${A.edge}; border-top: 3px solid ${C.gold};
      }
      @media (min-width: 620px) { .sa-dialog { border-radius: 20px; padding: 18px; } }
      @keyframes saUp { from { transform: translateY(16px) scale(.98); opacity: .5 } to { transform: none; opacity: 1 } }
      .sa-dialog-wide { max-width: 820px; }

      .sa-skel {
        background: linear-gradient(90deg, rgba(255,255,255,.55) 25%, #eee2d6 37%, rgba(255,255,255,.55) 63%);
        background-size: 400% 100%; animation: saShim 1.3s ease infinite; border-radius: 16px;
      }
      @keyframes saShim { from { background-position: 100% 50% } to { background-position: 0 50% } }

      .sa-mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11.5px; }
    `}</style>
  );
}

/* ── Dialog ───────────────────────────────────────────────────────────────── */

export function Dialog({
  open, onClose, title, children, wide,
}: {
  open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean;
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
  // Portalled: a fixed element inside an animated (transformed) card would be
  // positioned and stacked relative to that card, not the viewport.
  return createPortal(
    <div className="sa-scrim" onClick={onClose}>
      <div className={`sa-dialog${wide ? " sa-dialog-wide" : ""}`} role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, fontFamily: "'Playfair Display', serif", color: A.ink, overflowWrap: "anywhere" }}>{title}</h3>
          <button onClick={onClose} className="sa-btn sa-icon-btn" data-v="ghost" aria-label="Close"><X size={15} /></button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}

/* ── Primitives ───────────────────────────────────────────────────────────── */

export function Card({
  title, note, children, action, tone, stack, delay = 0,
}: {
  title?: string; note?: ReactNode; children: ReactNode; action?: ReactNode;
  tone?: "danger"; stack?: boolean; delay?: number;
}) {
  return (
    <motion.section
      className="sa-card"
      data-tone={tone}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {title && (
        <div className="sa-card-h" data-stack={stack ? "1" : "0"}>
          <div className="sa-card-tw">
            <h3 className="sa-card-t">{title}</h3>
            {note && <span className="sa-card-note">· {note}</span>}
          </div>
          {action}
        </div>
      )}
      {children}
    </motion.section>
  );
}

export function Stat({ label, value, tone, i = 0 }: { label: string; value: ReactNode; tone?: string; i?: number }) {
  return (
    <div className="sa-stat" style={{ ["--acc" as string]: tone || C.gold, animationDelay: `${i * 40}ms` }}>
      <span aria-hidden className="sa-stat-blob" />
      <div className="sa-stat-l">{label}</div>
      <div className="sa-stat-v" style={{ color: tone || A.ink }}>
        {typeof value === "number" ? <Num value={value} /> : value}
      </div>
    </div>
  );
}

export function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="sa-row">
      <span className="sa-row-l">{label}</span>
      <span className="sa-row-v">{value ?? "—"}</span>
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div style={{ color: A.muted, fontSize: 12.5, padding: "22px 0", textAlign: "center" }}>{children}</div>;
}

export function Btn({
  children, onClick, variant = "accent", disabled, title, icon,
}: {
  children?: ReactNode; onClick?: () => void;
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
export function Pill({ text, color, solid, icon }: { text: string; color: string; solid?: boolean; icon?: ReactNode }) {
  return (
    <span
      className="sa-pill"
      style={
        solid
          ? { color: "#1a0507", background: color, border: `1px solid ${color}` }
          : { color, background: `${color}18`, border: `1px solid ${color}38` }
      }
    >
      {icon}
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
  return <div className="sa-skel" style={{ height: h, marginBottom: 10 }} />;
}

/* ── Dates — always India time, which is what the team reads them in ─────── */

const IST_FULL = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric",
  hour: "numeric", minute: "2-digit", hour12: true,
});
const IST_DAY = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric",
});

/** "28 Sept 2026, 1:10 am" (IST). */
export const fmt = (d?: string | Date) => (d ? IST_FULL.format(new Date(d)) : "—");
/** "28 Sept 2026" (IST). */
export const fmtShort = (d?: string | Date) => (d ? IST_DAY.format(new Date(d)) : "—");

/** "12h ago", "3d ago", "2mo ago". */
export function ago(d?: string | Date) {
  if (!d) return "";
  const s = Math.max(0, Math.round((Date.now() - new Date(d).getTime()) / 1000));
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days}d ago`;
  const mo = Math.floor(days / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

/** "28 Sept 2026, 1:10 am · 12h ago" (IST). */
export const fmtAgo = (d?: string | Date) => (d ? `${fmt(d)} · ${ago(d)}` : "—");
