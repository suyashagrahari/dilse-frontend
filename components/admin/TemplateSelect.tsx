"use client";

// ─── Picking one of forty-three templates ────────────────────────────────────
//
// A native <select> was here first. It works, and it was replaced anyway:
//
//   · Forty-three options in a native select is a scroll with no search. On iOS
//     it becomes a full-screen wheel picker, which is the worst possible control
//     for a long alphabetical list you already know the name of.
//   · A native select cannot be styled. On this cream-and-gold admin it renders
//     as a grey system control, which is the one element on the page that looks
//     like it belongs to a different application.
//
// So: a trigger, a search box, and a filtered list. Type "rak" and press Enter.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, LayoutGrid, Search, X } from "lucide-react";
import { BRAND } from "@/lib/brand";

export interface TemplateOption {
  templateType: string;
  label: string;
}

/** Above `BottomNav`'s z-[79], or the list is painted over on a phone. */
const PANEL_Z = 189;

export default function TemplateSelect({
  value,
  options,
  onChange,
  allLabel = "Every template",
  width = 210,
}: {
  /** "" means no filter. */
  value: string;
  options: TemplateOption[];
  onChange: (templateType: string) => void;
  allLabel?: string;
  width?: number;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  /** Which row the keyboard is on. -1 is the "all" row. */
  const [cursor, setCursor] = useState(-1);

  const wrapRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const current = options.find((o) => o.templateType === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    // Label first, then slug: somebody typing "rakhi" means the name, and
    // somebody typing "raksha-bandhan" has copied it from a URL.
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || o.templateType.toLowerCase().includes(q)
    );
  }, [options, query]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setCursor(-1);
  }, []);

  const pick = useCallback(
    (templateType: string) => {
      onChange(templateType);
      close();
    },
    [onChange, close]
  );

  // Focus the search the moment it opens — the whole point of the control.
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => searchRef.current?.focus(), 30);
    return () => clearTimeout(t);
  }, [open]);

  // Escape closes; a click anywhere else closes. `mousedown` rather than
  // `click`, so a press that starts outside cannot land on a row that has
  // meanwhile moved under the cursor.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [open, close]);

  // Keep the highlighted row in view when arrowing past the fold.
  useEffect(() => {
    if (!open || cursor < 0) return;
    const row = listRef.current?.querySelector<HTMLElement>(`[data-idx="${cursor}"]`);
    row?.scrollIntoView({ block: "nearest" });
  }, [cursor, open]);

  const onSearchKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(filtered.length - 1, c + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(-1, c - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      // Nothing highlighted but exactly one match left: take it. Typing three
      // characters and pressing Enter is how this control is meant to be used.
      if (cursor >= 0 && filtered[cursor]) pick(filtered[cursor].templateType);
      else if (cursor === -1 && query.trim() === "") pick("");
      else if (filtered.length === 1) pick(filtered[0].templateType);
    }
  };

  return (
    <div ref={wrapRef} style={{ position: "relative", width }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          width: "100%", height: 44, padding: "0 10px 0 11px",
          borderRadius: 12,
          border: `1px solid ${open ? BRAND.accentStrong : BRAND.border}`,
          background: BRAND.surface,
          color: current ? BRAND.text : BRAND.faint,
          fontSize: 13.5, fontWeight: current ? 700 : 500,
          display: "flex", alignItems: "center", gap: 8,
          cursor: "pointer", textAlign: "left",
          boxShadow: open ? `0 0 0 3px rgba(61,12,17,0.08)` : "none",
        }}
      >
        <LayoutGrid size={14} style={{ color: BRAND.accent, flex: "none" }} />
        <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {current ? current.label : allLabel}
        </span>
        {current && (
          <span
            role="button"
            tabIndex={0}
            aria-label="Clear template filter"
            onClick={(e) => { e.stopPropagation(); pick(""); }}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); pick(""); } }}
            style={{
              width: 22, height: 22, borderRadius: 7, flex: "none",
              display: "grid", placeItems: "center",
              background: "rgba(61,12,17,0.07)", color: BRAND.muted,
            }}
          >
            <X size={12} />
          </span>
        )}
        <ChevronDown
          size={15}
          style={{
            color: BRAND.muted, flex: "none",
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 160ms ease",
          }}
        />
      </button>

      {open && (
        <div
          role="listbox"
          style={{
            position: "absolute", top: 48, left: 0, zIndex: PANEL_Z,
            width: "max(100%, 260px)",
            background: BRAND.surface,
            border: `1px solid ${BRAND.border}`,
            borderRadius: 14,
            boxShadow: "0 20px 44px -16px rgba(26,5,7,0.34)",
            overflow: "hidden",
            display: "flex", flexDirection: "column",
            animation: "tsDrop 140ms cubic-bezier(0.16,1,0.3,1) both",
          }}
        >
          <div style={{ padding: 8, borderBottom: `1px solid ${BRAND.border}`, flex: "none" }}>
            <div style={{ position: "relative" }}>
              <Search size={13} style={{ position: "absolute", left: 9, top: 10, color: BRAND.faint }} />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setCursor(-1); }}
                onKeyDown={onSearchKey}
                placeholder="Type to filter…"
                style={{
                  width: "100%", height: 34, paddingLeft: 28, paddingRight: 8,
                  borderRadius: 9, border: `1px solid ${BRAND.border}`,
                  background: BRAND.bgAlt,
                  // 16px would be right for a form field, but this panel is
                  // 260px wide and iOS only zooms on focus for INPUTS inside a
                  // page that can zoom; the admin viewport is already locked.
                  fontSize: 16, color: BRAND.text, outline: "none",
                }}
              />
            </div>
          </div>

          <div ref={listRef} style={{ overflowY: "auto", maxHeight: 268, padding: 6 }}>
            {/* The reset, always first and always present — a filter you cannot
                clear from the same menu that set it is a trap. */}
            <Row
              idx={-1}
              active={cursor === -1}
              selected={!value}
              label={allLabel}
              muted
              onSelect={() => pick("")}
              onHover={() => setCursor(-1)}
            />

            {filtered.length === 0 ? (
              <p style={{ margin: 0, padding: "14px 10px", fontSize: 12.5, color: BRAND.faint }}>
                No template matches “{query.trim()}”.
              </p>
            ) : (
              filtered.map((o, i) => (
                <Row
                  key={o.templateType}
                  idx={i}
                  active={cursor === i}
                  selected={o.templateType === value}
                  label={o.label}
                  hint={o.templateType}
                  onSelect={() => pick(o.templateType)}
                  onHover={() => setCursor(i)}
                />
              ))
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes tsDrop {
          from { opacity: 0; transform: translateY(-4px) }
          to   { opacity: 1; transform: translateY(0) }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes tsDrop { from { opacity: 1 } to { opacity: 1 } }
        }
      `}</style>
    </div>
  );
}

/** Hoisted: a component defined inside the parent is remade every render. */
function Row({
  idx, active, selected, label, hint, muted, onSelect, onHover,
}: {
  idx: number;
  active: boolean;
  selected: boolean;
  label: string;
  hint?: string;
  muted?: boolean;
  onSelect: () => void;
  onHover: () => void;
}) {
  return (
    <button
      type="button"
      data-idx={idx}
      role="option"
      aria-selected={selected}
      onClick={onSelect}
      onMouseEnter={onHover}
      style={{
        width: "100%", minHeight: 36, padding: "6px 9px",
        borderRadius: 9, border: "none",
        background: active ? "rgba(201,168,76,0.16)" : "transparent",
        color: muted && !selected ? BRAND.muted : BRAND.text,
        display: "flex", alignItems: "center", gap: 8,
        cursor: "pointer", textAlign: "left",
      }}
    >
      <span style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            display: "block", fontSize: 13, fontWeight: selected ? 700 : 500,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}
        >
          {label}
        </span>
        {hint && (
          <span
            style={{
              display: "block", fontSize: 10.5, color: BRAND.faint,
              fontFamily: "ui-monospace, monospace",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}
          >
            {hint}
          </span>
        )}
      </span>
      {selected && <Check size={14} style={{ color: BRAND.accent, flex: "none" }} />}
    </button>
  );
}
