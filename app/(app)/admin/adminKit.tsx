"use client";

// ─── Admin UI kit ────────────────────────────────────────────────────────────
//
// The pieces every admin screen is built from, so they share one look: cream
// glass cards, a maroon hero strip, gold accents, count-up numbers, a sliding
// chip picker and a soft fade-up on entry. The navbar and page background come
// from the layout (`AdminNav`); a page renders `<AdminPage>` and fills it.

import { createContext, useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Info, Loader2, Search, X } from "lucide-react";

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

// What a page is and what it is for. `AdminPage` provides it; the maroon
// `Hero` reads it and shows the title with an ⓘ that opens the description,
// so the explanation is one tap away instead of a paragraph above every page.
interface PageMeta { title: ReactNode; subtitle?: ReactNode; icon?: ReactNode; actions?: ReactNode }
const PageMetaCtx = createContext<PageMeta | null>(null);

/**
 * The page frame: max width and gutters. The title, description and actions
 * are not drawn here — they appear in the page's maroon `Hero` header. A page
 * without a Hero passes `head` to get a slim header strip instead.
 */
export function AdminPage({
  title,
  subtitle,
  icon,
  actions,
  children,
  width = 1280,
  head = false,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  width?: number;
  head?: boolean;
}) {
  return (
    <PageMetaCtx.Provider value={{ title, subtitle, icon, actions }}>
      <div className="adk-page" style={{ maxWidth: width }}>
        <style>{ADMIN_KIT_CSS}</style>
        {head && <Hero compact />}
        {children}
      </div>
    </PageMetaCtx.Provider>
  );
}

/**
 * The header row of a maroon card: icon, page title, actions and the ⓘ that
 * expands the page description. `Hero` renders it from the page's meta; custom
 * maroon cards (analytics, the profile) render it themselves.
 */
export function HeroHead({ title, subtitle, icon, actions }: PageMeta) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="adk-hh">
        {icon && <span className="adk-hh-ic">{icon}</span>}
        <h1 className="adk-hh-title">{title}</h1>
        <div className="adk-hh-right">
          {actions}
          {subtitle && (
            <button
              type="button"
              className="adk-hh-info"
              data-on={open ? "1" : "0"}
              aria-expanded={open}
              aria-label={open ? "Hide what this page is" : "What is this page?"}
              title="What is this page?"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X size={14} /> : <Info size={15} />}
            </button>
          )}
        </div>
      </div>
      <AnimatePresence initial={false}>
        {open && subtitle && (
          <motion.div
            key="about"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div className="adk-hh-about">{subtitle}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
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

/**
 * The maroon card at the top of a page: the page header (title + ⓘ) and its
 * headline numbers. Put `HeroStat`s in `<div className="adk-hero-grid">`.
 */
export function Hero({ children, style, compact }: { children?: ReactNode; style?: CSSProperties; compact?: boolean }) {
  const meta = useContext(PageMetaCtx);
  return (
    <motion.div
      className="adk-hero"
      data-compact={compact ? "1" : "0"}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      style={style}
    >
      <span aria-hidden className="adk-hero-shine" />
      <span aria-hidden className="adk-hero-orb" />
      <div style={{ position: "relative" }}>
        {meta && <HeroHead {...meta} />}
        {children}
      </div>
    </motion.div>
  );
}

/** One number tile inside a Hero's `.adk-hero-grid`. */
export function HeroStat({ label, value, sub, big, tone }: { label: string; value: number | string; sub?: ReactNode; big?: boolean; tone?: string }) {
  return (
    <motion.div
      className="adk-hs"
      data-big={big ? "1" : "0"}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: big ? 0.05 : 0.12 }}
    >
      <div className="adk-hs-label">{label}</div>
      <div className="adk-hs-val" style={tone ? { color: tone } : undefined}>
        {typeof value === "number" ? <Num value={value} /> : value}
      </div>
      {sub && <div className="adk-hs-sub">{sub}</div>}
    </motion.div>
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
  .adk-actions { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
  .adk-panel { background: ${A.card}; border: 1px solid ${A.edge}; border-radius: 16px; backdrop-filter: blur(8px); min-width: 0; }
  .adk-panel-head { display: flex; align-items: center; gap: 6px; margin-bottom: 10px; min-width: 0; }
  .adk-panel-title { margin: 0; font-size: 13.5px; font-weight: 800; color: ${A.ink}; white-space: nowrap; }
  .adk-panel-note { font-size: 11px; color: ${A.muted}; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .adk-hero { position: relative; overflow: hidden; border-radius: 20px; padding: 14px; color: #f5ede6; margin-bottom: 12px;
    background: radial-gradient(120% 140% at 0% 0%, #6b1a22 0%, #3d0c11 55%, #240609 100%); box-shadow: 0 18px 40px -22px rgba(61,12,17,.8); }
  @media (min-width: 768px) { .adk-hero { padding: 16px 18px; } }
  .adk-hero[data-compact="1"] { padding: 10px 12px; }
  .adk-hero[data-compact="1"] .adk-hh { margin-bottom: 0; }
  .adk-hero-orb { position: absolute; right: -60px; top: -80px; width: 220px; height: 220px; border-radius: 50%;
    background: radial-gradient(circle, rgba(201,168,76,.22), transparent 65%); pointer-events: none; }
  .adk-hh { display: flex; align-items: center; gap: 9px; margin-bottom: 12px; min-width: 0; }
  .adk-hh-ic { width: 30px; height: 30px; flex: none; border-radius: 10px; display: grid; place-items: center; color: #3d0c11;
    background: linear-gradient(135deg, #ffe3a3, #c9a84c); box-shadow: 0 6px 14px -6px rgba(0,0,0,.5); }
  .adk-hh-ic svg { width: 16px; height: 16px; }
  .adk-hh-title { margin: 0; flex: 1; min-width: 0; font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 800; line-height: 1.15;
    color: #fff6e6; letter-spacing: -0.01em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .adk-hh-right { flex: none; display: flex; align-items: center; gap: 6px; }
  .adk-hh-right .adk-btn { height: 30px; padding: 0 10px; font-size: 11.5px; border-radius: 9px; background: rgba(255,255,255,.1); color: #fff6e6; border: 1px solid rgba(255,236,190,.2); }
  .adk-hh-right .adk-btn[data-v="gold"] { background: linear-gradient(135deg, #ffe3a3, #c9a84c); color: #3d0c11; border: none; }
  .adk-hh-info { width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center; cursor: pointer; color: #ffe3a3;
    background: rgba(255,255,255,.08); border: 1px solid rgba(255,236,190,.25); transition: background .2s, transform .2s; }
  .adk-hh-info:hover { background: rgba(255,236,190,.16); transform: scale(1.06); }
  .adk-hh-info[data-on="1"] { background: #ffe3a3; color: #3d0c11; }
  .adk-hh-about { margin: -2px 0 12px; padding: 10px 12px; border-radius: 12px; font-size: 12.5px; line-height: 1.55; color: #f5e6d6;
    background: rgba(255,255,255,.07); border: 1px solid rgba(255,236,190,.14); }
  .adk-hh-about strong, .adk-hh-about b { color: #ffe3a3; }
  .adk-hero-grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 8px; }
  @media (min-width: 760px) { .adk-hero-grid { grid-template-columns: repeat(4, minmax(0,1fr)); } }
  .adk-hs { min-width: 0; padding: 10px 12px; border-radius: 13px; background: rgba(255,255,255,.06); border: 1px solid rgba(255,236,190,.12);
    display: flex; flex-direction: column; gap: 4px; transition: background .2s, transform .2s; }
  .adk-hs:hover { background: rgba(255,255,255,.1); transform: translateY(-1px); }
  .adk-hs[data-big="1"] { background: linear-gradient(135deg, rgba(255,227,163,.18), rgba(201,168,76,.08)); border-color: rgba(255,227,163,.3); }
  .adk-hs-label { font-size: 9.5px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: rgba(255,236,210,.7);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .adk-hs-val { font-size: 24px; font-weight: 800; line-height: 1; color: #fff; font-family: 'Playfair Display', serif; }
  .adk-hs[data-big="1"] .adk-hs-val { color: #ffe3a3; font-size: 28px; }
  .adk-hs-sub { font-size: 10.5px; line-height: 1.35; color: rgba(255,236,210,.78); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
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
  /* List card: warm paper, soft maroon shadow, gold hairline + sheen on hover. */
  .adk-card { position: relative; overflow: hidden; display: block; width: 100%; text-align: left; font: inherit; min-width: 0;
    background: linear-gradient(180deg, #fffdfb, #fff7ef); border: 1px solid ${A.edge}; border-radius: 15px; padding: 11px 12px;
    box-shadow: 0 1px 0 rgba(61,12,17,.03), 0 8px 18px -14px rgba(61,12,17,.35);
    transition: transform .18s, box-shadow .18s, border-color .18s; }
  .adk-card::after { content: ""; position: absolute; top: 0; bottom: 0; left: -40%; width: 30%; pointer-events: none;
    background: linear-gradient(100deg, transparent, rgba(255,236,190,.35), transparent); transform: skewX(-12deg); opacity: 0; transition: none; }
  button.adk-card, a.adk-card { cursor: pointer; }
  button.adk-card:hover, a.adk-card:hover, .adk-card[data-hover="1"]:hover { transform: translateY(-2px); box-shadow: 0 14px 28px -16px rgba(61,12,17,.5); border-color: rgba(201,168,76,.6); }
  button.adk-card:hover::after, a.adk-card:hover::after { opacity: 1; left: 120%; transition: left .7s ease, opacity .2s; }
  .adk-card[data-on="1"] { border-color: ${A.maroon}; box-shadow: 0 0 0 1.5px ${A.maroon} inset, 0 14px 28px -16px rgba(61,12,17,.55); }
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
