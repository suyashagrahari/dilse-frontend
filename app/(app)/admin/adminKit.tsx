"use client";

// ─── Admin UI kit ────────────────────────────────────────────────────────────
//
// The pieces every admin screen is built from, so they share one look: cream
// glass cards, a maroon hero strip, gold accents, count-up numbers, a sliding
// chip picker and a soft fade-up on entry. The navbar and page background come
// from the layout (`AdminNav`); a page renders `<AdminPage>` and fills it.

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Loader2, Search, X } from "lucide-react";

export const A = {
  ink: "#2a0a0e",
  soft: "#7f5f5f",
  muted: "#9a7070",
  gold: "#c9a84c",
  goldDeep: "#8b5a2b",
  rust: "#a0522d",
  maroon: "#3d0c11",
  maroon2: "#5a1520",
  edge: "rgba(61,12,17,0.08)",
  card: "rgba(255,255,255,0.72)",
  paper: "#fffdfb",
  ok: "#1e7a4b",
  warn: "#b7791f",
  danger: "#b3261e",
  info: "#6d4ad1",
};

export const fmtNum = (n: number) =>
  n >= 1e6 ? (n / 1e6).toFixed(1) + "M" : n >= 1e4 ? (n / 1e3).toFixed(1) + "K" : n.toLocaleString("en-IN");

/** Counts up to `value` whenever it changes. */
export function useCountUp(value: number, ms = 700) {
  const [n, setN] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / ms);
      setN(Math.round(a + (value - a) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
      else from.current = value;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, ms]);
  return n;
}

export function Num({ value, style }: { value: number; style?: CSSProperties }) {
  return <span style={style}>{fmtNum(useCountUp(value))}</span>;
}

/**
 * The page frame: max width, gutters, and the title block. `actions` sit to the
 * right of the title on desktop and wrap under it on a phone.
 */
export function AdminPage({
  title,
  subtitle,
  icon,
  actions,
  children,
  width = 1280,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  width?: number;
}) {
  return (
    <div className="adk-page" style={{ maxWidth: width }}>
      <style>{ADMIN_KIT_CSS}</style>
      <motion.header
        className="adk-head"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        {icon && (
          <motion.span
            className="adk-head-ic"
            initial={{ scale: 0.6, rotate: -12, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.05 }}
          >
            {icon}
          </motion.span>
        )}
        <div style={{ flex: "1 1 220px", minWidth: 0 }}>
          <h1 className="adk-title">{title}</h1>
          {subtitle && <p className="adk-sub">{subtitle}</p>}
        </div>
        {actions && <div className="adk-actions">{actions}</div>}
      </motion.header>
      {children}
    </div>
  );
}

/** A cream glass card that fades up on entry. `delay` staggers a group. */
export function Panel({
  children,
  title,
  icon,
  note,
  right,
  delay = 0,
  pad = 14,
  style,
  className,
}: {
  children: ReactNode;
  title?: ReactNode;
  icon?: ReactNode;
  note?: ReactNode;
  right?: ReactNode;
  delay?: number;
  pad?: number;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <motion.section
      className={`adk-panel ${className || ""}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{ padding: pad, ...style }}
    >
      {(title || right) && (
        <div className="adk-panel-head">
          {icon}
          {title && <h2 className="adk-panel-title">{title}</h2>}
          {note && <span className="adk-panel-note">· {note}</span>}
          {right && <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>{right}</div>}
        </div>
      )}
      {children}
    </motion.section>
  );
}

/** The maroon strip for a page's headline numbers. */
export function Hero({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <motion.div
      className="adk-hero"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      style={style}
    >
      <span aria-hidden className="adk-hero-shine" />
      <div style={{ position: "relative" }}>{children}</div>
    </motion.div>
  );
}

/** One number inside a Hero. */
export function HeroStat({ label, value, sub, big, tone }: { label: string; value: number | string; sub?: ReactNode; big?: boolean; tone?: string }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: big ? 40 : 22, fontWeight: 800, lineHeight: 1, color: tone || (big ? "#ffe3a3" : "#fff"), fontFamily: big ? "'Playfair Display',serif" : undefined }}>
        {typeof value === "number" ? <Num value={value} /> : value}
      </div>
      <div style={{ fontSize: 10.5, fontWeight: 700, opacity: 0.72, marginTop: 4, letterSpacing: ".03em" }}>{label}</div>
      {sub && <div style={{ fontSize: 10.5, marginTop: 3, opacity: 0.85 }}>{sub}</div>}
    </div>
  );
}

/** A compact KPI tile. Grid them with `.adk-stats`. */
export function StatTile({
  icon,
  label,
  value,
  sub,
  accent = A.gold,
  delay = 0,
  onClick,
  active,
}: {
  icon: ReactNode;
  label: string;
  value: number | string;
  sub?: ReactNode;
  accent?: string;
  delay?: number;
  onClick?: () => void;
  active?: boolean;
}) {
  const Tag = onClick ? motion.button : motion.div;
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className="adk-stat"
      data-on={active ? "1" : "0"}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      style={{ ["--acc" as string]: accent, cursor: onClick ? "pointer" : "default" }}
    >
      <span aria-hidden className="adk-stat-blob" />
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <span className="adk-stat-ic">{icon}</span>
        <span className="adk-stat-label">{label}</span>
      </div>
      <div className="adk-stat-val">{typeof value === "number" ? <Num value={value} /> : value}</div>
      {sub && <div className="adk-stat-sub">{sub}</div>}
    </Tag>
  );
}

/**
 * A row of mutually exclusive chips with a sliding highlight. `id` must be
 * unique on the page (it names the shared-layout animation).
 */
export function ChipGroup<T extends string | number>({
  id,
  value,
  onChange,
  options,
  style,
}: {
  id: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: ReactNode; count?: number; tone?: string }[];
  style?: CSSProperties;
}) {
  return (
    <div className="adk-chips" role="radiogroup" style={style}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className="adk-chip"
            data-on={on ? "1" : "0"}
          >
            {on && <motion.span layoutId={`adk-chip-${id}`} className="adk-chip-pill" style={o.tone ? { background: o.tone } : undefined} transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
            <span style={{ position: "relative", zIndex: 1, display: "inline-flex", alignItems: "center", gap: 5 }}>
              {o.label}
              {typeof o.count === "number" && <span className="adk-chip-count">{o.count}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function SearchBox({ value, onChange, onEnter, placeholder = "Search…", style }: { value: string; onChange: (v: string) => void; onEnter?: () => void; placeholder?: string; style?: CSSProperties }) {
  return (
    <label className="adk-search" style={style}>
      <Search size={14} color={A.muted} />
      <input value={value} onChange={(e) => onChange(e.target.value)} onKeyDown={(e) => e.key === "Enter" && onEnter?.()} placeholder={placeholder} />
      {value && (
        <button type="button" aria-label="Clear search" onClick={() => onChange("")}>
          <X size={13} />
        </button>
      )}
    </label>
  );
}

export function Loading({ label = "Loading…", h = 220 }: { label?: string; h?: number }) {
  return (
    <div style={{ minHeight: h, display: "grid", placeItems: "center", color: A.muted, fontSize: 12 }}>
      <div style={{ textAlign: "center" }}>
        <Loader2 size={22} className="animate-spin" style={{ color: A.gold, margin: "0 auto 8px", display: "block" }} />
        {label}
      </div>
    </div>
  );
}

export function EmptyState({ icon, title, note }: { icon?: ReactNode; title: ReactNode; note?: ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="adk-empty">
      {icon && <div className="adk-empty-ic">{icon}</div>}
      <p style={{ margin: "10px 0 0", fontSize: 14, fontWeight: 800, color: A.ink }}>{title}</p>
      {note && <p style={{ margin: "4px 0 0", fontSize: 12.5, color: A.muted }}>{note}</p>}
    </motion.div>
  );
}

/** Small coloured pill: status, counts, tags. */
export function Tag({ children, tone = A.goldDeep, solid, style }: { children: ReactNode; tone?: string; solid?: boolean; style?: CSSProperties }) {
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 99,
        fontSize: 10.5, fontWeight: 800, whiteSpace: "nowrap", lineHeight: 1.3,
        background: solid ? tone : `${tone}16`, color: solid ? "#fff" : tone, border: solid ? "none" : `1px solid ${tone}2e`,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

/** Stagger helper for lists: `<motion.div {...rise(i)}>`. */
export const rise = (i: number) => ({
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: Math.min(i, 14) * 0.03, duration: 0.3 },
});

export const ADMIN_KIT_CSS = `
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes adk-shine { from { transform: translateX(-120%) rotate(12deg); } to { transform: translateX(320%) rotate(12deg); } }
  .adk-page { margin: 0 auto; padding: 12px 12px 110px; }
  @media (min-width: 768px) { .adk-page { padding: 18px 24px 64px; } }
  .adk-head { display: flex; align-items: center; flex-wrap: wrap; gap: 10px 12px; margin-bottom: 14px; }
  .adk-head-ic { width: 40px; height: 40px; flex: none; border-radius: 13px; display: grid; place-items: center; color: #ffe3a3;
    background: radial-gradient(120% 120% at 0% 0%, #6b1a22, #3d0c11); box-shadow: 0 10px 22px -12px rgba(61,12,17,.8); }
  .adk-title { margin: 0; font-size: clamp(20px, 4.6vw, 26px); font-weight: 800; color: ${A.ink}; letter-spacing: -0.02em; font-family: 'Playfair Display', serif; line-height: 1.1; }
  .adk-sub { margin: 3px 0 0; font-size: 12.5px; line-height: 1.45; color: ${A.soft}; }
  .adk-actions { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
  .adk-panel { background: ${A.card}; border: 1px solid ${A.edge}; border-radius: 16px; backdrop-filter: blur(8px); min-width: 0; }
  .adk-panel-head { display: flex; align-items: center; gap: 6px; margin-bottom: 10px; min-width: 0; }
  .adk-panel-title { margin: 0; font-size: 13.5px; font-weight: 800; color: ${A.ink}; white-space: nowrap; }
  .adk-panel-note { font-size: 11px; color: ${A.muted}; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .adk-hero { position: relative; overflow: hidden; border-radius: 20px; padding: 16px; color: #f5ede6; margin-bottom: 12px;
    background: radial-gradient(120% 140% at 0% 0%, #6b1a22 0%, #3d0c11 55%, #240609 100%); box-shadow: 0 18px 40px -22px rgba(61,12,17,.8); }
  .adk-hero-shine { position: absolute; top: -40px; bottom: -40px; width: 60px; background: linear-gradient(90deg, transparent, rgba(255,236,190,.14), transparent); animation: adk-shine 5s ease-in-out infinite; }
  .adk-stats { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 8px; margin-bottom: 10px; }
  @media (min-width: 900px) { .adk-stats { grid-template-columns: repeat(4, minmax(0,1fr)); gap: 10px; } }
  .adk-stat { position: relative; overflow: hidden; text-align: left; background: ${A.card}; border: 1px solid ${A.edge}; border-radius: 16px; padding: 11px 12px; min-width: 0; font: inherit; transition: transform .15s, box-shadow .15s, border-color .15s; }
  .adk-stat:hover { transform: translateY(-1px); box-shadow: 0 10px 24px -16px rgba(61,12,17,.45); }
  .adk-stat[data-on="1"] { border-color: var(--acc); box-shadow: 0 0 0 1.5px var(--acc) inset; }
  .adk-stat-blob { position: absolute; right: -18px; top: -18px; width: 64px; height: 64px; border-radius: 50%; background: color-mix(in srgb, var(--acc) 12%, transparent); }
  .adk-stat-ic { width: 26px; height: 26px; flex: none; border-radius: 8px; display: grid; place-items: center; color: var(--acc); background: color-mix(in srgb, var(--acc) 15%, transparent); }
  .adk-stat-label { font-size: 10.5px; color: ${A.muted}; font-weight: 700; letter-spacing: .03em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .adk-stat-val { margin-top: 7px; font-size: clamp(21px, 5.2vw, 27px); font-weight: 800; color: ${A.ink}; font-family: 'Playfair Display', serif; line-height: 1; }
  .adk-stat-sub { margin-top: 5px; font-size: 10.5px; color: var(--acc); font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .adk-chips { display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; padding-bottom: 2px; min-width: 0; }
  .adk-chips::-webkit-scrollbar { display: none; }
  .adk-chip { position: relative; flex: none; height: 32px; padding: 0 13px; border-radius: 99px; font-size: 12px; font-weight: 700; cursor: pointer;
    border: 1px solid ${A.edge}; background: rgba(255,255,255,.72); color: ${A.soft}; white-space: nowrap; transition: transform .15s, color .2s; }
  .adk-chip:hover { transform: translateY(-1px); }
  .adk-chip[data-on="1"] { color: #fff6e6; border-color: transparent; }
  .adk-chip-pill { position: absolute; inset: -1px; border-radius: 99px; background: ${A.maroon}; z-index: 0; }
  .adk-chip-count { min-width: 18px; height: 18px; padding: 0 5px; border-radius: 99px; font-size: 10px; display: inline-grid; place-items: center; background: rgba(61,12,17,.08); }
  .adk-chip[data-on="1"] .adk-chip-count { background: rgba(255,255,255,.18); }
  .adk-search { display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,.75); border: 1px solid ${A.edge}; border-radius: 12px; padding: 0 12px; min-width: 0; transition: border-color .2s, box-shadow .2s; }
  .adk-search:focus-within { border-color: ${A.gold}; box-shadow: 0 0 0 3px rgba(201,168,76,.15); }
  .adk-search input { flex: 1; min-width: 0; background: transparent; border: none; outline: none; color: ${A.ink}; font-size: 13px; padding: 10px 0; }
  .adk-search button { background: none; border: none; cursor: pointer; color: ${A.muted}; padding: 2px; display: grid; }
  .adk-empty { padding: 40px 20px; text-align: center; border-radius: 16px; background: ${A.card}; border: 1px dashed rgba(61,12,17,.14); }
  .adk-empty-ic { width: 46px; height: 46px; margin: 0 auto; border-radius: 15px; display: grid; place-items: center; color: ${A.gold}; background: rgba(201,168,76,.14); }
  .adk-grid2 { display: grid; grid-template-columns: minmax(0,1fr); gap: 10px; }
  @media (min-width: 900px) { .adk-grid2 { grid-template-columns: minmax(0,1fr) minmax(0,1fr); } }
  .adk-card { position: relative; overflow: hidden; display: block; width: 100%; text-align: left; font: inherit; background: ${A.paper}; border: 1px solid ${A.edge}; border-radius: 14px;
    padding: 11px 12px; transition: transform .18s, box-shadow .18s, border-color .18s; min-width: 0; }
  button.adk-card, a.adk-card { cursor: pointer; }
  button.adk-card:hover, a.adk-card:hover { transform: translateY(-2px); box-shadow: 0 12px 26px -16px rgba(61,12,17,.45); border-color: rgba(201,168,76,.55); }
  .adk-card[data-on="1"] { border-color: ${A.maroon}; box-shadow: 0 8px 20px -12px rgba(61,12,17,.5); }
  .adk-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 36px; padding: 0 14px; border-radius: 11px; font-size: 12.5px; font-weight: 800; cursor: pointer;
    border: 1px solid ${A.edge}; background: #fff; color: ${A.ink}; transition: transform .15s, box-shadow .15s, opacity .15s; white-space: nowrap; }
  .adk-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 18px -12px rgba(61,12,17,.5); }
  .adk-btn:disabled { opacity: .55; cursor: default; }
  .adk-btn[data-v="primary"] { border: none; color: #fff6e6; background: linear-gradient(135deg, #5a1520, #3d0c11); }
  .adk-btn[data-v="gold"] { border: 1px solid ${A.gold}; color: ${A.goldDeep}; background: rgba(201,168,76,.14); }
  .adk-btn[data-v="danger"] { border: 1px solid rgba(179,38,30,.25); color: ${A.danger}; background: rgba(179,38,30,.07); }
  .adk-input { width: 100%; padding: 9px 11px; border-radius: 11px; border: 1px solid ${A.edge}; background: #fff; font-size: 13px; color: ${A.ink}; outline: none; transition: border-color .2s, box-shadow .2s; }
  .adk-input:focus { border-color: ${A.gold}; box-shadow: 0 0 0 3px rgba(201,168,76,.15); }
  /* Sticky elements sit under the fixed admin navbar. */
  .adk-sticky { position: sticky; top: calc(var(--adm-top) + 8px); }
`;
