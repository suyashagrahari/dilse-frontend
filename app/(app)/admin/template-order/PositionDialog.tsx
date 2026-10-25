"use client";

// ─── "Move <template>" dialog ────────────────────────────────────────────────
//
// Opened from a row's position badge on /admin/template-order. The admin picks
// a new position inside the list they are looking at (the filtered view), and
// the page does a stable move: take the item out, insert it at N-1, everything
// in between shifts by one. Nothing is saved here — the page's Save does that.
//
// Centered on every screen (not a bottom sheet), rendered into <body> so no
// transformed ancestor can become its containing block.

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Minus, Plus, X } from "lucide-react";
import { A } from "../adminKit";

export type DialogItem = { slug: string; title: string };

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export default function PositionDialog({
  items,
  slug,
  scope,
  onMove,
  onClose,
}: {
  /** The list as the admin sees it right now (the filtered view), in order. */
  items: DialogItem[];
  slug: string;
  /** Where the positions count, e.g. "on the Premium page"; empty for the whole list. */
  scope: string;
  /** Called with the new 0-based index inside `items`. */
  onMove: (to: number) => void;
  onClose: () => void;
}) {
  const count = items.length;
  const from = items.findIndex((i) => i.slug === slug);
  const title = items[from]?.title ?? slug;
  const [raw, setRaw] = useState(String(from + 1));

  const parsed = parseInt(raw, 10);
  const valid = Number.isFinite(parsed);
  const target = valid ? clamp(parsed, 1, count) : from + 1;
  const clamped = valid && parsed !== target;
  const same = target === from + 1;

  const titleId = useId();
  const descId = useId();
  const panel = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  // Focus the number on open, give focus back to the badge on close, and keep
  // the page underneath from scrolling while the dialog is up.
  useEffect(() => {
    const back = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    input.current?.focus();
    input.current?.select();
    return () => {
      document.body.style.overflow = prevOverflow;
      back?.focus({ preventScroll: true });
    };
  }, []);

  // Neighbours once the item lands at `target`: the list without it, split there.
  const preview = useMemo(() => {
    const rest = items.filter((i) => i.slug !== slug);
    const prev = rest[target - 2]?.title ?? null;
    const next = rest[target - 1]?.title ?? null;
    return { prev, next };
  }, [items, slug, target]);

  const middle = Math.max(1, Math.ceil(count / 2));
  const chips = [
    { label: "Top", n: 1 },
    { label: "#2", n: 2 },
    { label: "#3", n: 3 },
    { label: "Middle", n: middle },
    { label: "Bottom", n: count },
  ].filter((c, i, arr) => c.n <= count && arr.findIndex((d) => d.n === c.n) === i);

  const confirm = () => {
    if (!same) onMove(target - 1);
    onClose();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key === "ArrowUp" && e.target === input.current) {
      e.preventDefault();
      setRaw(String(clamp(target - 1, 1, count)));
      return;
    }
    if (e.key === "ArrowDown" && e.target === input.current) {
      e.preventDefault();
      setRaw(String(clamp(target + 1, 1, count)));
      return;
    }
    if (e.key !== "Tab" || !panel.current) return;
    const nodes = Array.from(
      panel.current.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled])")
    );
    if (!nodes.length) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  let hint: React.ReactNode;
  if (same) hint = <>Already at #{target} — pick another spot.</>;
  else if (!preview.prev) hint = <>Will sit at the <b>top</b>, above <b>{preview.next}</b>.</>;
  else if (!preview.next) hint = <>Will sit at the <b>bottom</b>, below <b>{preview.prev}</b>.</>;
  else hint = <>Will sit between <b>{preview.prev}</b> and <b>{preview.next}</b>.</>;

  return createPortal(
    <div className="pd-root" onKeyDown={onKeyDown}>
      <style>{PD_CSS}</style>
      <div className="pd-backdrop" onClick={onClose} aria-hidden="true" />
      <div
        ref={panel}
        className="pd-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
      >
        <button type="button" className="pd-x" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
        <h2 id={titleId} className="pd-title">Move {title}</h2>
        <p id={descId} className="pd-sub">
          Currently <b>#{from + 1}</b> of {count}{scope ? ` ${scope}` : ""}
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            confirm();
          }}
        >
          <label className="pd-label" htmlFor={`${titleId}-n`}>New position</label>
          <div className="pd-stepper">
            <button
              type="button"
              className="pd-step"
              onClick={() => setRaw(String(clamp(target - 1, 1, count)))}
              disabled={target <= 1}
              aria-label="One place higher"
            >
              <Minus size={20} />
            </button>
            <div className="pd-field">
              <span className="pd-hash" aria-hidden="true">#</span>
              <input
                ref={input}
                id={`${titleId}-n`}
                className="pd-input"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                enterKeyHint="done"
                value={raw}
                style={{ width: `${Math.max(1, raw.length) + 0.4}ch` }}
                onChange={(e) => setRaw(e.target.value.replace(/[^0-9]/g, "").slice(0, 5))}
                onBlur={() => { if (valid) setRaw(String(target)); else setRaw(String(from + 1)); }}
                aria-describedby={`${titleId}-hint`}
              />
            </div>
            <button
              type="button"
              className="pd-step"
              onClick={() => setRaw(String(clamp(target + 1, 1, count)))}
              disabled={target >= count}
              aria-label="One place lower"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="pd-chips" role="group" aria-label="Quick positions">
            {chips.map((c) => (
              <button
                type="button"
                key={c.label}
                className="pd-chip"
                data-on={c.n === target ? "1" : "0"}
                aria-pressed={c.n === target}
                onClick={() => setRaw(String(c.n))}
              >
                {c.label}
              </button>
            ))}
          </div>

          <p id={`${titleId}-hint`} className="pd-hint" aria-live="polite" data-same={same ? "1" : "0"}>
            {clamped && <span className="pd-clamp">Only {count} places — using #{target}. </span>}
            {hint}
          </p>

          <div className="pd-actions">
            <button type="button" className="pd-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="pd-btn pd-btn--go" disabled={same}>
              Move to #{target}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

const PD_CSS = `
.pd-root { position: fixed; inset: 0; z-index: 120; display: grid; place-items: center; padding: 16px;
  padding: max(16px, env(safe-area-inset-top)) 16px max(16px, env(safe-area-inset-bottom)); }
.pd-backdrop { position: absolute; inset: 0; background: rgba(42,10,14,.48); backdrop-filter: blur(3px);
  animation: pd-fade .18s ease-out both; }
.pd-panel { position: relative; width: 100%; max-width: 400px; max-height: calc(100dvh - 32px); overflow: auto;
  padding: 22px 20px 18px; border-radius: 22px; background: ${A.paper}; border: 1px solid rgba(201,168,76,.35);
  box-shadow: 0 30px 80px -24px rgba(42,10,14,.55), 0 0 0 1px rgba(255,255,255,.6) inset;
  font-family: Inter, system-ui, sans-serif; color: ${A.ink};
  animation: pd-pop .24s cubic-bezier(.2,.9,.3,1.15) both; transform-origin: 50% 60%; }
.pd-x { position: absolute; top: 10px; right: 10px; display: grid; place-items: center; width: 40px; height: 40px;
  border-radius: 12px; border: 0; background: transparent; color: ${A.soft}; cursor: pointer; }
.pd-x:hover { background: rgba(61,12,17,.06); }
.pd-title { margin: 0 44px 4px 0; font: 700 17.5px/1.25 "Playfair Display", Georgia, serif; color: ${A.maroon};
  overflow-wrap: anywhere; }
.pd-sub { margin: 0 0 16px; font-size: 13px; color: ${A.soft}; }
.pd-sub b { color: ${A.goldDeep}; font-variant-numeric: tabular-nums; }
.pd-label { display: block; margin-bottom: 8px; font-size: 10.5px; font-weight: 800; letter-spacing: .12em;
  text-transform: uppercase; color: ${A.muted}; }
.pd-stepper { display: grid; grid-template-columns: 56px 1fr 56px; gap: 10px; align-items: stretch; }
.pd-step { display: grid; place-items: center; height: 64px; border-radius: 16px; border: 1px solid ${A.edge};
  background: #fff; color: ${A.maroon}; cursor: pointer; transition: transform .12s, background .15s; }
.pd-step:active:not(:disabled) { transform: scale(.94); }
.pd-step:disabled { opacity: .35; cursor: default; }
.pd-field { position: relative; display: flex; align-items: center; justify-content: center; height: 64px; border-radius: 16px;
  background: #fff; border: 1.5px solid rgba(201,168,76,.55); box-shadow: 0 0 0 4px rgba(201,168,76,.12); }
.pd-field:focus-within { border-color: ${A.goldDeep}; box-shadow: 0 0 0 4px rgba(201,168,76,.28); }
.pd-hash { font: 700 22px/1 Inter, system-ui, sans-serif; color: ${A.gold}; margin-right: 2px; }
.pd-input { min-width: 1.4ch; max-width: 5.5ch; border: 0; outline: 0; background: transparent; text-align: left;
  font: 800 36px/1 Inter, system-ui, sans-serif; color: ${A.maroon}; font-variant-numeric: tabular-nums; padding: 0; }
.pd-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }
.pd-chip { flex: 1 1 auto; min-height: 40px; padding: 0 12px; border-radius: 999px; border: 1px solid ${A.edge}; background: #fff;
  font: 600 13px/1 Inter, system-ui, sans-serif; color: ${A.ink}; cursor: pointer; transition: background .15s, color .15s, border-color .15s; }
.pd-chip[data-on="1"] { background: ${A.maroon}; color: #fdf8ee; border-color: transparent; }
.pd-hint { min-height: 40px; margin: 14px 0 0; padding: 10px 12px; border-radius: 12px; background: rgba(201,168,76,.12);
  font-size: 13px; line-height: 1.4; color: ${A.ink}; overflow-wrap: anywhere; }
.pd-hint b { color: ${A.maroon}; }
.pd-hint[data-same="1"] { background: rgba(61,12,17,.04); color: ${A.soft}; }
.pd-clamp { color: ${A.goldDeep}; font-weight: 600; }
.pd-actions { display: grid; grid-template-columns: 1fr 1.4fr; gap: 10px; margin-top: 16px; }
.pd-btn { min-height: 48px; border-radius: 14px; border: 1px solid ${A.edge}; background: #fff; cursor: pointer;
  font: 700 14.5px/1 Inter, system-ui, sans-serif; color: ${A.ink}; }
.pd-btn--go { background: ${A.maroon}; color: #fdf8ee; border-color: transparent; box-shadow: 0 10px 24px -14px rgba(61,12,17,.8); }
.pd-btn--go:disabled { opacity: .45; cursor: default; box-shadow: none; }
.pd-step:focus-visible, .pd-chip:focus-visible, .pd-btn:focus-visible, .pd-x:focus-visible { outline: 2px solid ${A.gold}; outline-offset: 2px; }
@keyframes pd-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes pd-pop { from { opacity: 0; transform: translateY(8px) scale(.94); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) {
  .pd-backdrop, .pd-panel { animation: none; }
  .pd-step:active:not(:disabled) { transform: none; }
}
`;
