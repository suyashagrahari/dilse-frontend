"use client";

// ─── Recharge — tokens, icons, primitives ────────────────────────────────────
//
// A deliberately boring utility app. White page, one accent, hard 1px borders,
// 8–12px radii, and exactly ONE shadow in the whole template (the card that
// overlaps the header). Every gradient, glow and float that would normally make
// a template look "designed" is what would kill this one: the joke is entirely
// in the copy, and the copy only lands if the chrome around it looks like it was
// shipped by somebody who did not care.
//
// ── BRAND ────────────────────────────────────────────────────────────────────
// The operator is invented (see OPERATOR_NAME in ./types). No real network and
// no real payment app is named anywhere — not in copy, class names, alt text or
// these comments — and none of their palettes appear either. The accent below
// is a deep teal chosen for exactly that reason.
//
// ── THE ONE RULE THAT BREAKS THE PAGE ────────────────────────────────────────
// `plan.price` is a STRING and the headline plan's price is an infinity sign.
// Nothing in this file, or any file that imports it, calls Number/parseInt/
// parseFloat on it. Prices are printed, never computed; the payment total is
// the selected plan's price string copied verbatim.

import Link from "next/link";
import Image from "next/image";
import { useSyncExternalStore } from "react";
import { DEMO_DATA, MAX_BENEFITS, MAX_ROWS, type Plan, type PlanRow, type RechargeData } from "./types";

/* ── Tokens ───────────────────────────────────────────────────────────────── */

export const ACCENT = "#0E7C7B";
export const ACCENT_DEEP = "#0A5C5B";
export const ACCENT_TINT = "#EAF2F2";
export const PAGE = "#FFFFFF";
export const SURROUND = "#ECEEF0";
export const SECTION = "#F7F8F9";
export const BORDER = "#E4E7EA";
export const DIVIDER = "#EEF0F2";
export const CHIP = "#F2F4F5";
export const INK = "#1A2026";
export const MUTED = "#5A6570";
export const FAINT = "#8A939C";
export const LEADER = "#CBD2D8";

export const FONT = `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
export const MONO = `ui-monospace, SFMono-Regular, Menlo, Consolas, "Courier New", monospace`;
export const SERIF = `Georgia, "Times New Roman", Times, serif`;

/** The letterboxed column. Portrait only — this never reflows wide. */
export const COLUMN = 420;

/* ── Motion ───────────────────────────────────────────────────────────────── */

const REDUCED = "(prefers-reduced-motion: reduce)";

function subscribeReduced(onChange: () => void): () => void {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/**
 * Honoured everywhere: no stagger, no scale-in, an instant checkmark and a
 * static spinner ring. Nothing stops working — the processing sequence still
 * advances on its timer, which is the only thing on this screen that matters.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReduced,
    () => (typeof window !== "undefined" && window.matchMedia ? window.matchMedia(REDUCED).matches : false),
    () => false,
  );
}

/**
 * All of the template's CSS in one tag.
 *
 * Inline styles carry the palette (they are the ones that have to survive an
 * html-to-image clone); this covers the three things inline style cannot do —
 * keyframes, media queries and the scrollbar on the tab rail.
 */
export function RechargeStyles() {
  return (
    <style>{`
.rc-shell { width: 100%; max-width: ${COLUMN}px; margin: 0 auto; background: ${PAGE}; min-height: 100dvh; position: relative; }
@media (min-width: 452px) { .rc-shell { border-left: 1px solid ${BORDER}; border-right: 1px solid ${BORDER}; } }
.rc-rail { scrollbar-width: none; -ms-overflow-style: none; }
.rc-rail::-webkit-scrollbar { display: none; }
@keyframes rc-in { from { opacity: 0; transform: translateY(9px); } to { opacity: 1; transform: none; } }
@keyframes rc-spin { to { transform: rotate(360deg); } }
@keyframes rc-pop { from { opacity: 0; transform: scale(.55); } to { opacity: 1; transform: scale(1); } }
@keyframes rc-draw { to { stroke-dashoffset: 0; } }
.rc-in { animation: rc-in 240ms ease-out both; }
.rc-spin { animation: rc-spin 850ms linear infinite; transform-origin: 50% 50%; }
.rc-pop { animation: rc-pop 300ms cubic-bezier(.2,.8,.3,1) both; }
.rc-draw { stroke-dasharray: 36; stroke-dashoffset: 36; animation: rc-draw 400ms ease-out 170ms forwards; }
.rc-static, .rc-static * { animation: none !important; transition: none !important; }
@media (prefers-reduced-motion: reduce) {
  .rc-in, .rc-pop { animation: none !important; opacity: 1 !important; transform: none !important; }
  .rc-spin { animation: none !important; }
  .rc-draw { animation: none !important; stroke-dashoffset: 0 !important; }
}
`}</style>
  );
}

/* ── Inline icons ─────────────────────────────────────────────────────────────
 *
 * Every glyph here is drawn by hand as a generic shape. No icon library, no
 * traced logotype, nothing lifted from a real operator or payment app.
 */

type IconProps = { size?: number; className?: string };

/**
 * The operator mark: four ascending signal bars whose tops are traced by a
 * heart outline. Line art, single stroke weight, currentColor.
 */
export function OperatorMark({ size = 22, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 21.2 4.4 13.9a4.3 4.3 0 0 1 0-6.2 4.6 4.6 0 0 1 6.4 0l1.2 1.2 1.2-1.2a4.6 4.6 0 0 1 6.4 0 4.3 4.3 0 0 1 0 6.2Z" />
      <path d="M8 16v-2.4" />
      <path d="M10.7 16v-4.2" />
      <path d="M13.3 16v-4.2" />
      <path d="M16 16v-2.4" />
    </svg>
  );
}

export function IconChevron({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" focusable="false">
      <path d="M15 5 8 12l7 7" />
    </svg>
  );
}

export function IconDownload({ size = 15, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" focusable="false">
      <path d="M12 3.5v11" /><path d="m7.5 10.5 4.5 4.5 4.5-4.5" /><path d="M4.5 19.5h15" />
    </svg>
  );
}

export function IconRepeat({ size = 15, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" focusable="false">
      <path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.5" /><path d="M20 4v4.5h-4.5" />
      <path d="M20 12a8 8 0 0 1-13.7 5.6L4 15.5" /><path d="M4 20v-4.5h4.5" />
    </svg>
  );
}

/** Generic method glyphs, keyed off a keyword in the label — never a logotype. */
function GlyphRails({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M4 8.5h13" /><path d="m13.5 5 3.5 3.5-3.5 3.5" />
      <path d="M20 15.5H7" /><path d="M10.5 12 7 15.5l3.5 3.5" />
    </svg>
  );
}
function GlyphWallet({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <rect x="3.5" y="6.5" width="17" height="12" rx="2.5" />
      <path d="M3.5 10.5h17" /><circle cx="16.5" cy="14.5" r="1.2" />
    </svg>
  );
}
function GlyphCard({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <rect x="2.8" y="5.5" width="18.4" height="13" rx="2.2" />
      <path d="M2.8 9.8h18.4" /><path d="M6.2 14.6h4" />
    </svg>
  );
}
function GlyphBank({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M3.5 9.5 12 4.5l8.5 5" /><path d="M5.5 9.5v8" /><path d="M9.8 9.5v8" />
      <path d="M14.2 9.5v8" /><path d="M18.5 9.5v8" /><path d="M3.5 19.5h17" />
    </svg>
  );
}
function GlyphLater({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="8.2" /><path d="M12 7.6V12l3 1.8" />
    </svg>
  );
}

/** Keyword → glyph. Everything unrecognised gets the neutral rails mark. */
export function MethodGlyph({ label, id, size = 19 }: { label: string; id: string; size?: number }) {
  const k = `${id} ${label}`.toLowerCase();
  if (k.includes("wallet")) return <GlyphWallet size={size} />;
  if (k.includes("card")) return <GlyphCard size={size} />;
  if (k.includes("bank")) return <GlyphBank size={size} />;
  if (k.includes("later") || k.includes("emi") || k.includes("credit line")) return <GlyphLater size={size} />;
  return <GlyphRails size={size} />;
}

/* ── Primitives ───────────────────────────────────────────────────────────── */

/**
 * A label–value row with DOT LEADERS.
 *
 * The alignment is the acceptance criterion: values sit on one right edge no
 * matter how long either side is. That is why the leader is a flex spacer with
 * a dotted bottom border rather than a run of typed periods — periods depend on
 * the label's width and drift by a pixel or two per row, which is exactly the
 * tell that a receipt is fake.
 *
 * The LABEL is the only thing allowed to shrink: it truncates with an ellipsis
 * and never wraps. The value never wraps either, so a 30-character value keeps
 * its right edge and loses its tail instead of pushing the row to two lines.
 */
export function DotRow({
  label,
  value,
  note,
  monoValue,
  strong,
  size = 13,
}: {
  label: string;
  value: string;
  note?: string;
  monoValue?: boolean;
  strong?: boolean;
  size?: number;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, minWidth: 0 }}>
        <span
          style={{
            flex: "0 1 auto",
            minWidth: 0,
            fontFamily: FONT,
            fontSize: size,
            color: strong ? INK : MUTED,
            fontWeight: strong ? 600 : 400,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {label}
        </span>
        <span
          aria-hidden="true"
          style={{
            flex: "1 1 auto",
            minWidth: 10,
            alignSelf: "flex-end",
            marginBottom: 3,
            borderBottom: `1px dotted ${LEADER}`,
          }}
        />
        <span
          style={{
            flex: "0 0 auto",
            maxWidth: "58%",
            textAlign: "right",
            fontFamily: monoValue ? MONO : FONT,
            fontSize: monoValue ? size - 0.5 : size,
            fontWeight: strong ? 700 : 500,
            color: INK,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {value}
        </span>
      </div>
      {note ? (
        <p
          style={{
            margin: 0,
            textAlign: "right",
            fontFamily: FONT,
            fontSize: 11,
            fontStyle: "italic",
            lineHeight: 1.4,
            color: FAINT,
          }}
        >
          {note}
        </p>
      ) : null}
    </div>
  );
}

/** The one button shape in the template. 44px+ everywhere, no shadow, no glow. */
export function ActionButton({
  label,
  onClick,
  variant = "accent",
  height = 44,
  disabled,
  ariaLabel,
  icon,
}: {
  label: string;
  onClick: () => void;
  variant?: "accent" | "outline" | "quiet";
  height?: number;
  disabled?: boolean;
  ariaLabel?: string;
  icon?: React.ReactNode;
}) {
  const base: React.CSSProperties = {
    width: "100%",
    minHeight: height,
    height,
    borderRadius: 8,
    fontFamily: FONT,
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: "0.08em",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    cursor: disabled ? "default" : "pointer",
    opacity: disabled ? 0.5 : 1,
  };
  const skin: React.CSSProperties =
    variant === "accent"
      ? { background: ACCENT, color: "#FFFFFF", border: `1px solid ${ACCENT}` }
      : variant === "outline"
        ? { background: "#FFFFFF", color: ACCENT, border: `1px solid ${ACCENT}` }
        : { background: "#FFFFFF", color: MUTED, border: `1px solid ${BORDER}` };

  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={ariaLabel ?? label} style={{ ...base, ...skin }}>
      {icon}
      {label}
    </button>
  );
}

/** The brand badge on a published page. Doubles as the recipient's create path. */
export function BrandLogo() {
  return (
    <Link
      href="/templates"
      aria-label="Create your own on SubhSandesh"
      style={{
        position: "fixed",
        top: 10,
        right: 10,
        zIndex: 95,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        minHeight: 32,
        padding: "6px 10px",
        borderRadius: 8,
        background: "#FFFFFF",
        border: `1px solid ${BORDER}`,
        textDecoration: "none",
      }}
    >
      <Image src="/logo.webp" alt="" width={16} height={16} style={{ borderRadius: 4 }} />
      <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 600, color: INK }}>SubhSandesh</span>
    </Link>
  );
}

/* ── Data normalisation ───────────────────────────────────────────────────────
 *
 * `dbToRechargeData` in ./types is the coercer of record for anything arriving
 * from the API. This is the second, narrower pass that also runs on the LIVE
 * EDITOR STATE, which the API coercer never sees, and which has two ways of
 * holding a plan row:
 *
 *   1. `{ label, value, note? }`, which is what the form and the wire use.
 *   2. `"Label: Value"`, which is what the AI fill schema declares and what the
 *      edit sheet's textarea takes, one row per line.
 *
 * Form (2) is split on the FIRST colon only, so "Calls: Unlimited: really"
 * becomes label "Calls" and value "Unlimited: really" rather than being thrown
 * away or split three ways.
 */

const trim = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

/** `"Label: Value"` → a row. First colon only; anything else returns null. */
export function rowFromString(raw: string): PlanRow | null {
  const s = raw.trim();
  if (!s) return null;
  const i = s.indexOf(":");
  if (i <= 0) return null;
  const label = s.slice(0, i).trim();
  const value = s.slice(i + 1).trim();
  if (!label || !value) return null;
  return { label, value };
}

/** A row from either shape. */
export function toRow(x: unknown): PlanRow | null {
  if (typeof x === "string") return rowFromString(x);
  if (!x || typeof x !== "object" || Array.isArray(x)) return null;
  const o = x as Record<string, unknown>;
  const label = trim(o.label);
  const value = trim(o.value);
  if (!label || !value) return null;
  const note = trim(o.note);
  return { label, value, ...(note ? { note } : {}) };
}

/** A row back to the sheet's one-line form. `note` rides after a pipe. */
export const rowToString = (r: PlanRow): string => `${r.label}: ${r.value}${r.note ? ` | ${r.note}` : ""}`;

/** One textarea line → a row, with the optional ` | note` tail. */
export function rowFromLine(line: string): PlanRow | null {
  const pipe = line.indexOf("|");
  const head = pipe >= 0 ? line.slice(0, pipe) : line;
  const note = pipe >= 0 ? line.slice(pipe + 1).trim() : "";
  const row = rowFromString(head);
  if (!row) return null;
  return note ? { ...row, note } : row;
}

function toPlan(x: unknown, index: number): Plan | null {
  if (!x || typeof x !== "object" || Array.isArray(x)) return null;
  const o = x as Record<string, unknown>;
  const rows = (Array.isArray(o.rows) ? o.rows : []).map(toRow).filter((r): r is PlanRow => r !== null).slice(0, MAX_ROWS);
  const benefits = (Array.isArray(o.benefits) ? o.benefits : [])
    .map(trim)
    .filter(Boolean)
    .slice(0, MAX_BENEFITS);
  const badge = trim(o.badge);
  const disabled = o.disabled === true;
  const reason = trim(o.disabledReason);
  return {
    id: trim(o.id) || `pl-${index + 1}`,
    // Printed, never parsed. "∞" is a legal price and survives untouched.
    price: typeof o.price === "string" && o.price.trim() ? o.price.trim() : "—",
    categoryId: trim(o.categoryId),
    validity: trim(o.validity),
    ...(badge ? { badge } : {}),
    rows,
    benefits,
    ...(disabled ? { disabled: true, disabledReason: reason || "Not available on this number." } : {}),
  };
}

/**
 * Make any in-flight editor state drawable.
 *
 * Three repairs, each of which is a blank or broken screen if it is skipped:
 * loose `"Label: Value"` strings sitting where plan objects belong (the AI fill
 * schema writes the plan grid as a flat list of those), plans pointing at a
 * category that is not on the rail, and duplicate ids reaching React keys.
 */
export function normalizeData(input: RechargeData): RechargeData {
  const rawPlans: unknown = input.plans;
  const items: unknown[] = Array.isArray(rawPlans) ? rawPlans : [];

  const looseRows: PlanRow[] = [];
  const parsed: Plan[] = [];
  items.forEach((item, i) => {
    if (typeof item === "string") {
      const r = rowFromString(item);
      if (r) looseRows.push(r);
      return;
    }
    const p = toPlan(item, i);
    if (p) parsed.push(p);
  });

  let plans = parsed.length > 0 ? parsed : DEMO_DATA.plans.map((p) => ({ ...p, rows: [...p.rows], benefits: [...p.benefits] }));

  // A flat list of rows is the recommended card's table — that is what the fill
  // schema declares it as, and dropping it would lose the whole plan grid.
  if (looseRows.length > 0) {
    const target = plans.findIndex((p) => !p.disabled);
    const at = target >= 0 ? target : 0;
    plans = plans.map((p, i) => (i === at ? { ...p, rows: looseRows.slice(0, MAX_ROWS) } : p));
  }

  const categories = Array.isArray(input.categories) && input.categories.length > 0 ? input.categories : DEMO_DATA.categories;
  const known = new Set(categories.map((c) => c.id));
  const fallbackCat = categories[0]?.id ?? "";

  const seen = new Set<string>();
  plans = plans.map((p, i) => {
    let id = p.id || `pl-${i + 1}`;
    while (seen.has(id)) id = `${id}-${i}`;
    seen.add(id);
    return { ...p, id, categoryId: known.has(p.categoryId) ? p.categoryId : fallbackCat };
  });

  return { ...input, categories, plans };
}

/* ── Prices ───────────────────────────────────────────────────────────────────
 *
 * The contract says the currency symbol and the grouping live INSIDE the price
 * string, and the design wants the symbol set 12px smaller than the amount. So
 * the symbol is split off the front of the string — by looking at characters,
 * never by parsing a number — and a price that arrived without one is given the
 * house symbol. "₹84" stays "₹84"; "∞" becomes "₹∞"; "₹₹84" never happens.
 */

const CURRENCY = /^\s*(₹|Rs\.?|INR|\$|€|£|¥)\s*(.*)$/i;

export function priceParts(price: string): { symbol: string; amount: string } {
  const raw = (price ?? "").trim();
  const m = CURRENCY.exec(raw);
  if (m && m[2].trim()) return { symbol: m[1], amount: m[2].trim() };
  return { symbol: "₹", amount: raw || "—" };
}

/** The price as one string, for a dot-leader value or a button label. */
export function priceLabel(price: string): string {
  const { symbol, amount } = priceParts(price);
  return `${symbol}${amount}`;
}

/**
 * The recommended plan — the one card with the 2px accent border, and the only
 * thing on the share card. Badged first, otherwise the first selectable plan.
 */
export function recommendedPlanId(data: RechargeData): string | null {
  const badged = data.plans.find((p) => !p.disabled && p.badge);
  if (badged) return badged.id;
  const first = data.plans.find((p) => !p.disabled);
  return first ? first.id : (data.plans[0]?.id ?? null);
}

/* ── The receipt ──────────────────────────────────────────────────────────── */

export interface ReceiptParts {
  /** The serial. Carries their anniversary when the sender put one in. */
  txnId: string;
  /** What was debited, said in words rather than in rupees. */
  amountNote: string;
  /** Everything that is not transaction data — the serif block under the card. */
  body: string[];
}

const TXN_RE = /^\s*(?:transaction|txn|reference|ref)\s*(?:id|no\.?|number)?\s*[:\-–]\s*(.+)$/i;
const AMOUNT_RE = /^\s*amount\s*(?:debited|paid|charged)?\s*[:\-–]\s*(.+)$/i;

/** Digits only, longest run wins — the anniversary hidden in a phone number. */
const digitsOf = (s: string): string => (s.match(/\d+/g) ?? []).sort((a, b) => b.length - a.length)[0] ?? "";

/**
 * Split `receipt.message` into the two things it actually holds.
 *
 * The sender writes one list; the screen needs a serial for the document card
 * and prose for the serif block underneath it, and the whole point of the last
 * screen is the gap between those two registers. Anything that reads like a
 * transaction line is lifted into the card; everything else stays prose.
 */
export function splitReceipt(message: string[], data: RechargeData): ReceiptParts {
  let txnId = "";
  let amountNote = "";
  const body: string[] = [];

  for (const line of message) {
    const t = TXN_RE.exec(line);
    if (t && !txnId) {
      txnId = t[1].trim();
      continue;
    }
    const a = AMOUNT_RE.exec(line);
    if (a && !amountNote) {
      amountNote = a[1].trim();
      continue;
    }
    const s = line.trim();
    if (s) body.push(s);
  }

  if (!txnId) {
    // Deterministic, never random and never clock-derived: the same page must
    // print the same serial on every open, including inside a screenshot.
    const initials = (data.subscriber.name.match(/\b[A-Za-z]/g) ?? ["D", "L"]).slice(0, 3).join("").toUpperCase();
    const digits = digitsOf(data.subscriber.number).slice(-8) || "00000000";
    txnId = `${initials || "DIL"}-${digits}`;
  }

  return { txnId, amountNote, body };
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const two = (n: number) => String(n).padStart(2, "0");

/**
 * `08 Aug 2026, 21:04:11`. Formatted by hand rather than by `Intl` so the
 * string is identical on every device and cannot drift between the screen and
 * the exported PNG.
 */
export function fmtStamp(d: Date): string {
  return `${two(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${two(d.getHours())}:${two(d.getMinutes())}:${two(d.getSeconds())}`;
}
