"use client";

// ─── Recharge — tokens, CSS and primitives ───────────────────────────────────
//
// The look is a modern Indian payments app: a deep berry header that bleeds
// into a white "recharging for" card, grey-lavender page, white 16–20px cards,
// hairline dividers, one hot-pink action colour, and the classic full-bleed
// green success screen. Gen-Z comes through in stickers, copy and little
// bounces — the chrome itself stays convincingly "shipped".
//
// All CSS lives in one tag (`RechargeStyles`) with an `rc-` prefix. Layout is
// responsive in CSS only (no JS width checks for layout) so server and client
// render the same tree.

import { useEffect, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { cropStyle, photoCrop } from "../../dedication/components/types";
import type { LovePhoto } from "../../_love/types";
import { IconClose } from "./icons";

/* ── Tokens ───────────────────────────────────────────────────────────────── */

export const PINK = "#F0287A";
export const PINK_DEEP = "#D3125F";
export const PINK_TINT = "#FFE8F1";
export const BERRY = "#3A0C33";
export const BERRY_2 = "#6E1250";
export const INK = "#16121D";
export const MUTED = "#686274";
export const FAINT = "#9C96A8";
export const LINE = "#ECE8F1";
export const BG = "#F4F2F8";
export const CARD = "#FFFFFF";
export const GREEN = "#18A058";
export const GREEN_DEEP = "#0F8646";
export const GREEN_TINT = "#E6F7EE";
export const BUTTER = "#FFE14D";
export const LILAC = "#F1EAFF";
export const RED = "#E5383B";

export const FONT = `var(--font-inter), Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
export const DISPLAY = `var(--font-outfit), Outfit, var(--font-inter), Inter, system-ui, sans-serif`;
export const CUTE = `var(--font-fredoka), Fredoka, var(--font-outfit), system-ui, sans-serif`;

/* ── Media queries & motion ───────────────────────────────────────────────── */

function subscribe(query: string) {
  return (cb: () => void) => {
    if (typeof window === "undefined" || !window.matchMedia) return () => {};
    const mq = window.matchMedia(query);
    mq.addEventListener("change", cb);
    return () => mq.removeEventListener("change", cb);
  };
}

/** A media query as state. Server + first paint read `false`. */
export function useMedia(query: string): boolean {
  return useSyncExternalStore(
    subscribe(query),
    () => (typeof window !== "undefined" && window.matchMedia ? window.matchMedia(query).matches : false),
    () => false,
  );
}

export const useReducedMotion = () => useMedia("(prefers-reduced-motion: reduce)");
export const useWide = () => useMedia("(min-width: 1024px)");

/** True after `ms` — for the skeleton / "detecting operator" beats. */
export function useAfter(ms: number): boolean {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setDone(true), ms);
    return () => window.clearTimeout(t);
  }, [ms]);
  return done;
}

/* ── Formatting ───────────────────────────────────────────────────────────── */

const CURRENCY = /^\s*(₹|Rs\.?|INR|\$|€|£)\s*(.*)$/i;

/** Split "₹84" into symbol + amount without parsing a number. "∞" → ₹ + ∞. */
export function priceParts(price: string): { symbol: string; amount: string } {
  const raw = (price ?? "").trim();
  const m = CURRENCY.exec(raw);
  if (m && m[2].trim()) return { symbol: m[1], amount: m[2].trim() };
  return { symbol: "₹", amount: raw || "—" };
}

export const priceLabel = (price: string) => {
  const { symbol, amount } = priceParts(price);
  return `${symbol}${amount}`;
};

export function fmtStamp(d: Date): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  let h = d.getHours();
  const ap = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${h}:${m} ${ap}`;
}

/** A 12-digit UPI-style reference derived from the names — stable per page. */
export function txnRef(seed: string): string {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  const a = String(Math.abs(h) % 1e6).padStart(6, "0");
  const b = String(Math.abs(Math.imul(h, 2654435761)) % 1e6).padStart(6, "0");
  return `${a}${b}`;
}

export const initials = (name: string) =>
  (name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "?";

/* ── Photo & avatar ───────────────────────────────────────────────────────── */

/** A framed photo that fills its box, honouring the sender's crop. */
export function Photo({ photo, alt = "" }: { photo: LovePhoto; alt?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={photo.url} alt={alt} draggable={false} loading="lazy" decoding="async" style={cropStyle(photoCrop(photo))} />;
}

export function Avatar({
  photo,
  name,
  size = 48,
  ring = true,
}: {
  photo?: LovePhoto | null;
  name: string;
  size?: number;
  ring?: boolean;
}) {
  return (
    <span
      className="rc-avatar"
      style={{
        width: size,
        height: size,
        boxShadow: ring ? `0 0 0 2px #fff, 0 0 0 4px ${PINK}` : undefined,
        fontSize: size * 0.38,
      }}
    >
      {photo ? <Photo photo={photo} alt={name} /> : <span aria-hidden="true">{initials(name)}</span>}
    </span>
  );
}

export function Price({ price, size = 26, strike, color }: { price: string; size?: number; strike?: boolean; color?: string }) {
  const { symbol, amount } = priceParts(price);
  // The infinity glyph sits small and low in most faces; lift it to cap height.
  const inf = amount === "∞";
  return (
    <span className="rc-price" style={{ fontSize: size, textDecoration: strike ? "line-through" : undefined, color }}>
      <span style={{ fontSize: size * 0.62, marginRight: 1, fontWeight: 600 }}>{symbol}</span>
      {inf ? <span style={{ fontSize: "1.3em", lineHeight: 0.8, display: "inline-block", transform: "translateY(0.04em)" }}>∞</span> : amount}
    </span>
  );
}

/* ── Sheet / modal ────────────────────────────────────────────────────────── */

/** Bottom sheet on phones, centred modal from 768px. */
export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
  label,
  wide,
  z = 200,
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  label: string;
  wide?: boolean;
  z?: number;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="rc-scrim" style={{ zIndex: z }} onClick={onClose} role="presentation">
      <div
        className={`rc-sheet${wide ? " rc-sheet-wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rc-grab" aria-hidden="true" />
        {title !== undefined ? (
          <div className="rc-sheet-head">
            <div className="rc-sheet-title">{title}</div>
            <button type="button" className="rc-icon-btn" onClick={onClose} aria-label="Close">
              <IconClose size={18} />
            </button>
          </div>
        ) : null}
        <div className="rc-sheet-body">{children}</div>
        {footer ? <div className="rc-sheet-foot">{footer}</div> : null}
      </div>
    </div>
  );
}

/* ── Tiny toast (copy, share) ─────────────────────────────────────────────── */

export function MiniToast({ text }: { text: string | null }) {
  if (!text) return null;
  return (
    <div className="rc-toast" role="status" aria-live="polite">
      {text}
    </div>
  );
}

export const srOnly: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0,0,0,0)",
  whiteSpace: "nowrap",
  border: 0,
};

/* ── All of the CSS ───────────────────────────────────────────────────────── */

export function RechargeStyles() {
  return <style>{CSS}</style>;
}

const CSS = `
.rc-root { --rc-top: 0px; min-height: 100dvh; background: ${BG}; color: ${INK}; font-family: ${FONT}; -webkit-font-smoothing: antialiased; overflow-x: clip; }
.rc-root *, .rc-root *::before, .rc-root *::after { box-sizing: border-box; }
.rc-root button { font-family: inherit; -webkit-tap-highlight-color: transparent; }
.rc-root :focus-visible { outline: 2.5px solid ${PINK}; outline-offset: 2px; }
.rc-live .rc-hide-live { visibility: hidden; }
.rc-live .rc-me { margin-right: 176px; }
.rc-noscroll { scrollbar-width: none; -ms-overflow-style: none; }
.rc-noscroll::-webkit-scrollbar { display: none; }

/* avatar / price */
.rc-avatar { position: relative; display: inline-grid; place-items: center; flex: none; border-radius: 50%; overflow: hidden;
  background: linear-gradient(135deg, #FF8CB8, ${PINK_DEEP}); color: #fff; font-family: ${DISPLAY}; font-weight: 700; }
.rc-avatar img { position: absolute; inset: 0; }
.rc-price { font-family: ${DISPLAY}; font-weight: 700; letter-spacing: -0.02em; line-height: 1; color: ${INK}; white-space: nowrap; }

/* buttons */
.rc-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 48px; padding: 0 20px; border-radius: 14px;
  border: 0; cursor: pointer; font-weight: 700; font-size: 15px; letter-spacing: .01em; transition: transform .12s ease, box-shadow .2s ease, background .2s ease; }
.rc-btn:active { transform: scale(.97); }
.rc-btn-pink { background: linear-gradient(180deg, #FF3F8A, ${PINK_DEEP}); color: #fff; box-shadow: 0 8px 20px -8px rgba(211,18,95,.65), inset 0 1px 0 rgba(255,255,255,.25); }
.rc-btn-pink:hover { box-shadow: 0 12px 26px -8px rgba(211,18,95,.75), inset 0 1px 0 rgba(255,255,255,.25); }
.rc-btn-pink:disabled { opacity: .45; cursor: default; box-shadow: none; }
.rc-btn-ghost { background: #fff; color: ${INK}; border: 1.5px solid ${LINE}; }
.rc-btn-ghost:hover { border-color: #DCD5E6; background: #FCFBFE; }
.rc-link { background: none; border: 0; padding: 0; color: ${PINK_DEEP}; font-weight: 700; font-size: 13px; cursor: pointer; display: inline-flex; align-items: center; gap: 2px; }
.rc-link:hover { text-decoration: underline; text-underline-offset: 3px; }
.rc-icon-btn { width: 38px; height: 38px; border-radius: 12px; border: 0; background: transparent; color: inherit; display: grid; place-items: center; cursor: pointer; }
.rc-icon-btn:hover { background: rgba(0,0,0,.05); }

/* web nav (tablet/desktop) */
.rc-web { display: none; }
.rc-app { display: block; }
@media (min-width: 768px) { .rc-web { display: block; } .rc-app { display: none; } }
.rc-nav { position: sticky; top: var(--rc-top); z-index: 40; background: #fff; border-bottom: 1px solid ${LINE}; }
.rc-nav-in { max-width: 1240px; margin: 0 auto; height: 64px; padding: 0 24px; display: flex; align-items: center; gap: 28px; }
.rc-wordmark { font-family: ${DISPLAY}; font-weight: 800; font-size: 23px; letter-spacing: -0.04em; color: ${BERRY}; display: inline-flex; align-items: center; gap: 8px; }
.rc-wordmark b { color: ${PINK}; font-weight: 800; }
.rc-navlinks { display: flex; gap: 22px; font-size: 14px; font-weight: 600; color: ${MUTED}; }
.rc-navlinks span { padding: 21px 0 19px; border-bottom: 3px solid transparent; white-space: nowrap; cursor: default; }
.rc-navlinks span.on { color: ${INK}; border-color: ${PINK}; }
@media (max-width: 1100px) { .rc-navlinks span:nth-child(n+4) { display: none; } }
@media (max-width: 900px) { .rc-navlinks { display: none; } }
.rc-me { margin-left: auto; display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 600; color: ${INK}; }
.rc-me-chip { display: inline-flex; align-items: center; gap: 8px; padding: 5px 12px 5px 5px; border-radius: 99px; background: ${BG}; }

.rc-services { max-width: 1240px; margin: 18px auto 0; padding: 0 24px; }
.rc-services-card { background: #fff; border-radius: 20px; padding: 16px 18px; display: flex; gap: 8px; overflow-x: auto; box-shadow: 0 1px 0 ${LINE}; }
.rc-svc { flex: 1 0 96px; display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 8px 4px; border-radius: 14px; font-size: 12px; font-weight: 600; color: ${MUTED}; text-align: center; cursor: default; }
.rc-svc i { width: 46px; height: 46px; border-radius: 15px; display: grid; place-items: center; background: ${LILAC}; color: ${BERRY_2}; font-style: normal; position: relative; }
.rc-svc.on { color: ${INK}; }
.rc-svc.on i { background: ${PINK}; color: #fff; box-shadow: 0 8px 18px -8px ${PINK}; }
.rc-svc em { position: absolute; top: -7px; right: -14px; background: ${BUTTER}; color: ${INK}; font: 700 9px/1 ${FONT}; font-style: normal; padding: 3px 5px; border-radius: 6px; transform: rotate(8deg); }

/* page grid */
.rc-page { max-width: 1240px; margin: 0 auto; padding: 0 0 120px; }
@media (min-width: 768px) { .rc-page { padding: 20px 24px 80px; } }
.rc-grid { display: block; }
@media (min-width: 1024px) { .rc-grid { display: grid; grid-template-columns: 392px minmax(0, 1fr); gap: 24px; align-items: start; } }
.rc-left { }
@media (min-width: 1024px) { .rc-left { position: sticky; top: calc(var(--rc-top) + 84px); } }

/* phone app header */
.rc-hero { position: relative; background: radial-gradient(120% 90% at 100% 0%, #B3186F 0%, transparent 55%), linear-gradient(160deg, ${BERRY} 0%, ${BERRY_2} 100%);
  color: #fff; padding: 0 16px 64px; overflow: hidden; }
.rc-hero::after { content: ""; position: absolute; right: -40px; top: 30px; width: 180px; height: 180px; border-radius: 50%;
  background: radial-gradient(circle, rgba(255,92,154,.35), transparent 70%); pointer-events: none; }
.rc-appbar { position: relative; z-index: 1; height: 56px; display: flex; align-items: center; gap: 6px; margin: 0 -8px; }
.rc-appbar h1 { font-size: 17px; font-weight: 700; margin: 0; flex: 1; letter-spacing: -0.01em; }
.rc-hero-sub { position: relative; z-index: 1; display: flex; align-items: center; gap: 8px; font-size: 12.5px; opacity: .85; margin-top: 2px; }
.rc-float-card { position: relative; z-index: 2; margin: -52px 12px 0; }
@media (min-width: 768px) { .rc-float-card { margin: 0; } }

/* operator card */
.rc-card { background: #fff; border-radius: 20px; box-shadow: 0 1px 2px rgba(22,18,29,.04), 0 10px 30px -18px rgba(58,12,51,.35); }
.rc-op { padding: 16px; }
.rc-op-row { display: flex; align-items: center; gap: 13px; }
.rc-op-name { font-weight: 700; font-size: 16px; display: flex; align-items: center; gap: 6px; min-width: 0; }
.rc-op-name span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rc-op-num { font-family: ${DISPLAY}; font-size: 15px; font-weight: 600; letter-spacing: .02em; color: ${INK}; margin-top: 1px; }
.rc-op-meta { display: flex; align-items: center; gap: 6px; font-size: 12px; color: ${MUTED}; margin-top: 3px; min-height: 16px; }
.rc-detect { display: inline-flex; align-items: center; gap: 4px; color: ${GREEN_DEEP}; font-weight: 700; animation: rc-pop .35s cubic-bezier(.2,1.4,.4,1) both; }
.rc-shimmer { display: inline-block; height: 10px; border-radius: 6px; background: linear-gradient(90deg, #EEEAF3 0%, #F8F6FB 50%, #EEEAF3 100%); background-size: 200% 100%; animation: rc-shim 1.1s linear infinite; }
.rc-expiry { margin-top: 14px; padding-top: 13px; border-top: 1.5px dashed ${LINE}; }
.rc-expiry-pill { display: inline-flex; align-items: center; gap: 7px; padding: 5px 10px 5px 8px; border-radius: 99px; background: #FFECEC; color: ${RED}; font-size: 12px; font-weight: 700; }
.rc-dot { width: 7px; height: 7px; border-radius: 50%; background: ${RED}; box-shadow: 0 0 0 0 rgba(229,56,59,.5); animation: rc-ping 1.6s ease-out infinite; }
.rc-expiry p { margin: 8px 0 0; font-size: 13px; line-height: 1.45; color: ${MUTED}; }

/* desktop form fields on the left card */
.rc-field { position: relative; border: 1.5px solid ${LINE}; border-radius: 14px; padding: 18px 14px 8px; margin-top: 12px; background: #fff; }
.rc-field label { position: absolute; top: 6px; left: 14px; font-size: 10.5px; font-weight: 700; color: ${FAINT}; text-transform: uppercase; letter-spacing: .06em; }
.rc-field div { font-size: 15px; font-weight: 600; display: flex; align-items: center; gap: 8px; min-height: 22px; }

/* search */
.rc-search { display: flex; align-items: center; gap: 10px; height: 48px; padding: 0 14px; border-radius: 14px; background: #fff; border: 1.5px solid ${LINE}; color: ${FAINT}; transition: border-color .2s; }
.rc-search:focus-within { border-color: ${PINK}; }
.rc-search input { flex: 1; min-width: 0; border: 0; outline: none; background: transparent; font: 500 15px ${FONT}; color: ${INK}; }
.rc-search input::placeholder { color: ${FAINT}; }

/* banners */
.rc-banners { display: flex; gap: 12px; overflow-x: auto; scroll-snap-type: x mandatory; padding: 2px 16px 4px; scroll-padding: 0 16px; }
@media (min-width: 768px) { .rc-banners { padding: 2px 0 4px; scroll-padding: 0; } }
.rc-banner { position: relative; flex: 0 0 86%; aspect-ratio: 2.35 / 1; border-radius: 18px; overflow: hidden; scroll-snap-align: start; color: #fff; background: linear-gradient(120deg, ${BERRY_2}, ${PINK}); }
@media (min-width: 768px) { .rc-banner { flex-basis: calc(50% - 6px); } }
.rc-banner img { position: absolute; inset: 0; transition: transform 6s ease; }
.rc-banner:hover img { transform: scale(1.04); }
.rc-banner-shade { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(40,6,34,.88) 0%, rgba(40,6,34,.55) 48%, rgba(40,6,34,0) 80%); }
.rc-banner-txt { position: absolute; left: 16px; top: 14px; bottom: 14px; width: 62%; display: flex; flex-direction: column; justify-content: space-between; }
.rc-banner-txt b { font-family: ${DISPLAY}; font-size: clamp(15px, 4.4vw, 19px); line-height: 1.15; letter-spacing: -0.01em; font-weight: 700; text-wrap: balance; }
@media (min-width: 768px) { .rc-banner-txt b { font-size: 17px; } }
.rc-offer { align-self: flex-start; font-size: 10px; font-weight: 800; letter-spacing: .08em; padding: 3px 7px; border-radius: 6px; background: ${BUTTER}; color: ${INK}; }
.rc-tnc { font-size: 10px; opacity: .7; }
.rc-dots { display: flex; justify-content: center; gap: 5px; margin-top: 8px; }
.rc-dots span { width: 6px; height: 6px; border-radius: 6px; background: #D9D3E2; transition: width .3s, background .3s; }
.rc-dots span.on { width: 18px; background: ${PINK}; }

/* tabs */
.rc-tabs-wrap { position: sticky; top: var(--rc-top); z-index: 30; background: ${BG}; padding-top: 4px; }
@media (min-width: 768px) { .rc-tabs-wrap { top: calc(var(--rc-top) + 64px); } }
.rc-tabs { display: flex; gap: 4px; overflow-x: auto; padding: 0 12px; border-bottom: 1px solid ${LINE}; background: #fff; }
@media (min-width: 768px) { .rc-tabs { border-radius: 16px 16px 0 0; padding: 0 8px; } }
.rc-tab { position: relative; flex: none; border: 0; background: none; padding: 15px 12px 13px; font-size: 14px; font-weight: 600; color: ${MUTED}; cursor: pointer; white-space: nowrap; transition: color .2s; }
.rc-tab::after { content: ""; position: absolute; left: 10px; right: 10px; bottom: 0; height: 3px; border-radius: 3px 3px 0 0; background: ${PINK}; transform: scaleX(0); transition: transform .25s cubic-bezier(.2,.9,.3,1.2); }
.rc-tab.on { color: ${INK}; font-weight: 700; }
.rc-tab.on::after { transform: scaleX(1); }
.rc-tab sup { font-size: 10px; color: ${FAINT}; margin-left: 3px; font-weight: 600; }

/* plan list */
.rc-plans { padding: 12px 12px 0; display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; }
@media (min-width: 768px) { .rc-plans { padding: 14px; background: #fff; border-radius: 0 0 20px 20px; } }
@media (min-width: 768px) and (max-width: 1023px) { .rc-plans { grid-template-columns: 1fr 1fr; } }
.rc-plan { position: relative; background: #fff; border-radius: 18px; border: 1.5px solid ${LINE}; padding: 16px; cursor: pointer; text-align: left; width: 100%;
  transition: border-color .2s, box-shadow .2s, transform .12s; animation: rc-in .35s ease both; }
.rc-plan:hover { border-color: #E3D8EC; box-shadow: 0 10px 28px -20px rgba(58,12,51,.45); }
.rc-plan:active { transform: scale(.985); }
.rc-plan.on { border-color: ${PINK}; box-shadow: 0 0 0 3px ${PINK_TINT}; }
.rc-plan.off { cursor: default; background: #FAF9FC; }
.rc-plan.off:active { transform: none; }
.rc-plan-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.rc-radio { width: 24px; height: 24px; flex: none; border-radius: 50%; border: 2px solid #D7D0E0; display: grid; place-items: center; color: #fff; transition: all .2s; }
.rc-plan.on .rc-radio { background: ${PINK}; border-color: ${PINK}; animation: rc-pop .3s cubic-bezier(.2,1.5,.4,1); }
.rc-badge { position: absolute; top: -9px; left: 14px; font: 800 10.5px/1 ${FONT}; letter-spacing: .03em; padding: 5px 8px; border-radius: 7px; background: ${BUTTER}; color: ${INK}; transform: rotate(-2deg); box-shadow: 0 3px 0 rgba(22,18,29,.08); }
.rc-cols { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 10px; margin-top: 14px; }
.rc-col small { display: block; font-size: 11.5px; color: ${FAINT}; font-weight: 500; margin-bottom: 3px; }
.rc-col b { display: block; font-size: 14px; font-weight: 700; line-height: 1.25; overflow-wrap: anywhere; }
.rc-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }
.rc-chip { display: inline-flex; align-items: center; gap: 5px; max-width: 100%; padding: 5px 9px; border-radius: 99px; background: ${LILAC}; color: ${BERRY_2}; font-size: 11.5px; font-weight: 600; }
.rc-chip span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rc-plan-foot { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 12px; padding-top: 11px; border-top: 1px solid ${LINE}; font-size: 12px; color: ${MUTED}; }
.rc-off-note { margin-top: 12px; padding: 10px 12px; border-radius: 12px; background: #FFF1F1; color: #A12A2D; font-size: 12.5px; line-height: 1.45; }
.rc-plan-cta { display: none; }
@media (min-width: 1024px) {
  .rc-plan { display: grid; grid-template-columns: 120px minmax(0,1fr) auto; gap: 18px; align-items: center; padding: 20px 20px 18px; }
  .rc-plan-top .rc-radio { display: none; }
  .rc-cols { margin-top: 0; }
  .rc-plan-body .rc-chips { margin-top: 10px; }
  .rc-plan-foot { grid-column: 1 / -1; margin-top: 0; }
  .rc-plan-cta { display: inline-flex; min-height: 40px; padding: 0 18px; font-size: 14px; border-radius: 12px; }
  .rc-plan.on .rc-plan-cta { background: ${GREEN}; box-shadow: none; }
}
.rc-empty { padding: 36px 16px; text-align: center; color: ${MUTED}; font-size: 14px; }
.rc-skel { background: #fff; border-radius: 18px; border: 1.5px solid ${LINE}; padding: 16px; display: grid; gap: 12px; }

/* bottom bar (phone/tablet) */
.rc-bar { position: fixed; left: 0; right: 0; bottom: 0; z-index: 60; background: #fff; border-top: 1px solid ${LINE}; box-shadow: 0 -10px 30px -20px rgba(58,12,51,.4);
  padding: 10px 16px calc(10px + env(safe-area-inset-bottom, 0px)); animation: rc-up .3s cubic-bezier(.2,1,.3,1) both; }
.rc-bar-in { max-width: 720px; margin: 0 auto; display: flex; align-items: center; gap: 12px; }
@media (min-width: 1024px) { .rc-bar { display: none; } }

/* sheet */
.rc-scrim { position: fixed; inset: 0; background: rgba(20,8,20,.52); display: flex; align-items: flex-end; justify-content: center; animation: rc-fade .2s ease both; }
.rc-sheet { width: 100%; max-width: 560px; max-height: 92dvh; display: flex; flex-direction: column; background: #fff; border-radius: 24px 24px 0 0; box-shadow: 0 -20px 60px -20px rgba(0,0,0,.5);
  animation: rc-sheet .38s cubic-bezier(.2,1,.3,1) both; color: ${INK}; font-family: ${FONT}; }
@media (min-width: 768px) { .rc-scrim { align-items: center; padding: 24px; } .rc-sheet { border-radius: 24px; max-width: 460px; max-height: 88dvh; animation-name: rc-modal; } .rc-sheet-wide { max-width: 560px; } .rc-grab { display: none; } }
.rc-grab { width: 40px; height: 4.5px; border-radius: 4px; background: #DDD7E6; margin: 9px auto 0; flex: none; }
.rc-sheet-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 12px 12px 6px 20px; flex: none; }
.rc-sheet-title { font-size: 17px; font-weight: 700; letter-spacing: -0.01em; }
.rc-sheet-body { padding: 4px 20px 16px; overflow-y: auto; overscroll-behavior: contain; }
.rc-sheet-foot { padding: 12px 20px calc(14px + env(safe-area-inset-bottom, 0px)); border-top: 1px solid ${LINE}; flex: none; }

/* pay sheet */
.rc-amount { border-radius: 18px; padding: 16px; background: linear-gradient(135deg, #FFF3F8, #F6F0FF); display: flex; align-items: center; gap: 12px; }
.rc-coupon { margin-top: 12px; display: flex; align-items: center; gap: 10px; padding: 11px 12px; border-radius: 14px; border: 1.5px dashed #9ADBB8; background: ${GREEN_TINT}; color: ${GREEN_DEEP}; font-size: 12.5px; font-weight: 600; line-height: 1.35; }
.rc-sec { margin: 18px 0 10px; font-size: 12px; font-weight: 700; letter-spacing: .07em; text-transform: uppercase; color: ${FAINT}; }
.rc-upi { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 8px; }
.rc-upi button { border: 1.5px solid ${LINE}; background: #fff; border-radius: 16px; padding: 12px 4px 10px; display: flex; flex-direction: column; align-items: center; gap: 7px; font-size: 11px; font-weight: 600; color: ${INK}; cursor: pointer; line-height: 1.2; position: relative; transition: border-color .2s, transform .12s; }
.rc-upi button:active { transform: scale(.95); }
.rc-upi button.on { border-color: ${PINK}; background: #FFF7FA; }
.rc-upi i { width: 40px; height: 40px; border-radius: 13px; display: grid; place-items: center; color: #fff; font-style: normal; }
.rc-tick { position: absolute; top: 6px; right: 6px; width: 16px; height: 16px; border-radius: 50%; background: ${PINK}; color: #fff; display: grid; place-items: center; }
.rc-method { width: 100%; display: flex; align-items: center; gap: 12px; padding: 13px 4px; border: 0; border-bottom: 1px solid ${LINE}; background: none; text-align: left; cursor: pointer; color: ${INK}; }
.rc-method:last-child { border-bottom: 0; }
.rc-method i { width: 38px; height: 38px; border-radius: 12px; background: ${BG}; display: grid; place-items: center; color: ${BERRY_2}; flex: none; font-style: normal; }
.rc-method b { display: block; font-size: 14px; font-weight: 600; }
.rc-method small { display: block; font-size: 12px; color: ${MUTED}; margin-top: 2px; }
.rc-ring { width: 20px; height: 20px; border-radius: 50%; border: 2px solid #D7D0E0; flex: none; margin-left: auto; display: grid; place-items: center; }
.rc-ring.on { border-color: ${PINK}; }
.rc-ring.on::after { content: ""; width: 10px; height: 10px; border-radius: 50%; background: ${PINK}; }
.rc-secure { display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 9px; font-size: 11.5px; color: ${FAINT}; }

/* PIN screen */
.rc-pin { position: fixed; inset: 0; z-index: 260; display: flex; justify-content: center; align-items: stretch; background: rgba(20,8,20,.55); animation: rc-fade .2s both; }
.rc-pin-card { width: 100%; max-width: 480px; background: #fff; display: flex; flex-direction: column; animation: rc-slide .32s cubic-bezier(.2,1,.3,1) both; }
@media (min-width: 768px) { .rc-pin { align-items: center; padding: 24px; } .rc-pin-card { max-width: 400px; height: min(760px, 94dvh); border-radius: 22px; overflow: hidden; animation-name: rc-modal; } }
.rc-pin-top { display: flex; align-items: center; justify-content: space-between; padding: calc(14px + env(safe-area-inset-top, 0px)) 16px 14px; border-bottom: 1px solid ${LINE}; }
.rc-upi-word { font: 800 italic 18px/1 ${DISPLAY}; letter-spacing: -0.02em; color: #4A4A55; display: inline-flex; align-items: center; gap: 3px; }
.rc-upi-word span { color: ${GREEN}; }
.rc-pin-band { background: ${BERRY}; color: #fff; padding: 14px 16px; display: flex; justify-content: space-between; align-items: center; gap: 12px; }
.rc-pin-mid { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 26px 20px 12px; min-height: 0; }
.rc-pin-label { font-size: 13px; font-weight: 700; letter-spacing: .12em; color: #3E3A48; }
.rc-pin-boxes { display: flex; gap: 18px; margin: 20px 0 6px; }
.rc-pin-box { width: 34px; height: 40px; border-bottom: 2.5px solid #BDB6C9; display: grid; place-items: center; font: 700 24px ${DISPLAY}; color: ${INK}; transition: border-color .2s; }
.rc-pin-box.full { border-color: ${BERRY}; }
.rc-pin-box i { width: 13px; height: 13px; border-radius: 50%; background: ${INK}; animation: rc-pop .2s cubic-bezier(.2,1.6,.4,1) both; }
.rc-pin-shake { animation: rc-shake .4s ease; }
.rc-warn { width: 100%; margin-top: auto; display: flex; gap: 10px; align-items: flex-start; padding: 11px 12px; border-radius: 12px; background: #FFF6D6; color: #6A5205; font-size: 12.5px; line-height: 1.4; }
.rc-keys { background: #F2F0F6; padding: 8px 8px calc(10px + env(safe-area-inset-bottom, 0px)); display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
.rc-key { height: 56px; border: 0; border-radius: 12px; background: transparent; font: 500 25px ${DISPLAY}; color: ${INK}; cursor: pointer; display: grid; place-items: center; transition: background .1s; }
.rc-key:active, .rc-key.hit { background: #E2DEEA; }
.rc-key-ok { background: ${PINK}; color: #fff; border-radius: 50%; width: 56px; margin: 0 auto; }
.rc-key-ok:disabled { background: #D3CEDB; cursor: default; }
.rc-key-ok.ready { animation: rc-glow 1.2s ease-in-out infinite; }

/* processing */
.rc-proc { position: fixed; inset: 0; z-index: 280; background: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; text-align: center; animation: rc-fade .2s both; }
.rc-spin { position: relative; width: 96px; height: 96px; }
.rc-spin::before { content: ""; position: absolute; inset: 0; border-radius: 50%; background: conic-gradient(from 0deg, ${PINK} 0 25%, #F6DDE8 25% 100%);
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 7px), #000 calc(100% - 6px)); mask: radial-gradient(farthest-side, transparent calc(100% - 7px), #000 calc(100% - 6px)); animation: rc-rot .9s linear infinite; }
.rc-spin span { position: absolute; inset: 0; display: grid; place-items: center; color: ${PINK}; animation: rc-beat 1s ease-in-out infinite; }
.rc-proc-line { height: 20px; margin-top: 8px; font-size: 14px; color: ${MUTED}; }
.rc-proc-line span { display: inline-block; animation: rc-in .3s ease both; }

/* success */
.rc-ok-hero { position: relative; overflow: hidden; background: radial-gradient(90% 120% at 50% 0%, #2BC271 0%, ${GREEN} 45%, ${GREEN_DEEP} 100%); color: #fff; text-align: center; padding: 34px 20px 70px; }
@media (min-width: 768px) { .rc-ok-hero { padding: 48px 24px 96px; } }
.rc-ok-tick { position: relative; width: 92px; height: 92px; margin: 0 auto; }
.rc-ok-tick .disc { position: absolute; inset: 0; border-radius: 50%; background: #fff; animation: rc-pop .5s cubic-bezier(.2,1.5,.35,1) both; box-shadow: 0 10px 30px -10px rgba(0,0,0,.35); }
.rc-ok-tick .wave { position: absolute; inset: 0; border-radius: 50%; border: 2px solid rgba(255,255,255,.7); animation: rc-wave 1.8s ease-out .3s infinite; }
.rc-ok-tick .wave.b { animation-delay: .9s; }
.rc-ok-tick svg { position: absolute; inset: 0; margin: auto; }
.rc-ok-tick path { stroke-dasharray: 48; stroke-dashoffset: 48; animation: rc-draw .45s ease-out .35s forwards; }
.rc-ok-title { margin: 18px 0 0; font-size: 19px; font-weight: 700; letter-spacing: -0.01em; animation: rc-in .4s ease .45s both; }
.rc-ok-amt { font-family: ${DISPLAY}; font-weight: 800; font-size: 46px; letter-spacing: -0.03em; line-height: 1.1; margin-top: 4px; animation: rc-in .4s ease .55s both; }
.rc-ok-sub { font-size: 13.5px; opacity: .92; margin-top: 6px; animation: rc-in .4s ease .65s both; }
.rc-ok-body { position: relative; z-index: 2; max-width: 1100px; margin: -52px auto 0; padding: 0 12px 110px; display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; }
@media (min-width: 768px) { .rc-ok-body { padding: 0 24px 80px; margin-top: -64px; gap: 16px; } }
@media (min-width: 1024px) { .rc-ok-body { grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr); align-items: start; } }
.rc-ok-col { display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; min-width: 0; animation: rc-in .5s ease .7s both; }
@media (min-width: 768px) { .rc-ok-col { gap: 16px; } }
.rc-confetti { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.rc-confetti i { position: absolute; top: -20px; left: var(--x); width: var(--w); height: var(--h); background: var(--c); border-radius: var(--br); opacity: 0;
  animation: rc-fall var(--d) cubic-bezier(.25,.6,.4,1) var(--dl) forwards; transform: rotate(var(--r)); font-style: normal; }
.rc-confetti i.h { width: auto; height: auto; background: none; color: var(--c); font-size: var(--w); line-height: 1; }

.rc-kv { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; padding: 11px 0; border-bottom: 1px solid ${LINE}; font-size: 13.5px; }
.rc-kv:last-child { border-bottom: 0; }
.rc-kv span { color: ${MUTED}; flex: none; }
.rc-kv b { font-weight: 600; text-align: right; overflow-wrap: anywhere; display: inline-flex; align-items: center; gap: 6px; justify-content: flex-end; }
.rc-status { display: inline-flex; align-items: center; gap: 5px; padding: 4px 9px; border-radius: 99px; background: ${GREEN_TINT}; color: ${GREEN_DEEP}; font-size: 11.5px; font-weight: 700; }
.rc-note { position: relative; padding: 16px 18px; border-radius: 20px 20px 20px 6px; background: linear-gradient(160deg, #FFF0F6, #FFE3EE); color: #3B1230; }
.rc-note p { margin: 0 0 10px; font-size: 15.5px; line-height: 1.6; }
.rc-note p:last-child { margin: 0; }
.rc-polas { display: flex; gap: 12px; overflow-x: auto; padding: 8px 4px 12px; }
.rc-pola { flex: 0 0 132px; background: #fff; padding: 7px 7px 26px; border-radius: 6px; box-shadow: 0 8px 20px -10px rgba(58,12,51,.45); transform: rotate(var(--t)); transition: transform .25s; position: relative; }
.rc-pola:hover { transform: rotate(0) scale(1.04); }
.rc-pola div { position: relative; aspect-ratio: 1; overflow: hidden; border-radius: 3px; background: #eee; }
.rc-pola div img { position: absolute; inset: 0; }
.rc-pola span { position: absolute; left: 0; right: 0; bottom: 6px; text-align: center; font: 600 12px ${CUTE}; color: ${BERRY_2}; }

/* scratch card */
.rc-scratch { position: relative; width: 100%; max-width: 300px; aspect-ratio: 1; margin: 0 auto; border-radius: 22px; overflow: hidden; background: #fff; box-shadow: 0 14px 34px -16px rgba(58,12,51,.5); }
.rc-scratch canvas { position: absolute; inset: 0; width: 100%; height: 100%; touch-action: none; cursor: grab; transition: opacity .5s ease; }
.rc-prize { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 22px; background: radial-gradient(circle at 50% 30%, #FFF6D0, #FFFFFF 70%); }
.rc-prize b { font-family: ${DISPLAY}; font-size: 20px; line-height: 1.2; letter-spacing: -0.01em; margin-top: 8px; color: ${INK}; }
.rc-prize small { font-size: 12px; color: ${MUTED}; margin-top: 8px; line-height: 1.45; }
.rc-prize.won { animation: rc-pop .45s cubic-bezier(.2,1.5,.4,1) both; }

.rc-toast { position: fixed; left: 50%; bottom: calc(96px + env(safe-area-inset-bottom, 0px)); transform: translateX(-50%); z-index: 400; background: #221A28; color: #fff; padding: 10px 16px; border-radius: 12px; font-size: 13px; font-weight: 600; box-shadow: 0 12px 30px -10px rgba(0,0,0,.5); animation: rc-toast .3s cubic-bezier(.2,1.3,.4,1) both; max-width: calc(100vw - 32px); text-align: center; }

.rc-foot { text-align: center; font-size: 11.5px; color: ${FAINT}; line-height: 1.6; padding: 22px 16px 0; }

@keyframes rc-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@keyframes rc-up { from { transform: translateY(100%); } to { transform: none; } }
@keyframes rc-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes rc-sheet { from { transform: translateY(100%); } to { transform: none; } }
@keyframes rc-modal { from { opacity: 0; transform: translateY(16px) scale(.97); } to { opacity: 1; transform: none; } }
@keyframes rc-slide { from { transform: translateX(40px); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes rc-pop { from { opacity: 0; transform: scale(.5); } to { opacity: 1; transform: scale(1); } }
@keyframes rc-shim { from { background-position: 200% 0; } to { background-position: -200% 0; } }
@keyframes rc-ping { 0% { box-shadow: 0 0 0 0 rgba(229,56,59,.5); } 80%,100% { box-shadow: 0 0 0 7px rgba(229,56,59,0); } }
@keyframes rc-rot { to { transform: rotate(360deg); } }
@keyframes rc-beat { 0%,100% { transform: scale(1); } 30% { transform: scale(1.18); } 60% { transform: scale(.96); } }
@keyframes rc-draw { to { stroke-dashoffset: 0; } }
@keyframes rc-wave { from { transform: scale(1); opacity: .8; } to { transform: scale(2.3); opacity: 0; } }
@keyframes rc-fall { 0% { opacity: 1; transform: translate3d(0,0,0) rotate(var(--r)); } 100% { opacity: 0; transform: translate3d(var(--dx), var(--fy), 0) rotate(calc(var(--r) + 540deg)); } }
@keyframes rc-shake { 0%,100% { transform: none; } 20%,60% { transform: translateX(-8px); } 40%,80% { transform: translateX(8px); } }
@keyframes rc-glow { 0%,100% { box-shadow: 0 0 0 0 rgba(240,40,122,.45); } 50% { box-shadow: 0 0 0 9px rgba(240,40,122,0); } }
@keyframes rc-toast { from { opacity: 0; transform: translate(-50%, 12px) scale(.95); } to { opacity: 1; transform: translate(-50%, 0); } }
@keyframes rc-wiggle { 0%,100% { transform: rotate(0); } 25% { transform: rotate(-8deg); } 75% { transform: rotate(8deg); } }

@media (prefers-reduced-motion: reduce) {
  .rc-root *, .rc-root *::before, .rc-root *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
  .rc-ok-tick path { stroke-dashoffset: 0; }
  .rc-confetti { display: none; }
  .rc-spin::before { animation: rc-rot 2.4s linear infinite !important; animation-duration: 2.4s !important; animation-iteration-count: infinite !important; }
}
`;
