// ─── Revenue & billing: shapes, money and day maths ─────────────────────────
//
// Shared by `/admin/revenue` and the Billing tab of a user's profile. Every
// shape here mirrors `GET/POST /api/admin/super/revenue/*` exactly (see the
// revenue CONTRACT.md) — the server is the authority; these are its words.
//
// ── MONEY ──────────────────────────────────────────────────────────────────
//
// Amounts are integers in minor units, never floats: `amountInrPaise` is INR
// paise (USD orders converted at the rate frozen on the order), and an order's
// own `amount` / `listAmount` / `discountAmount` are minor units of ITS
// currency — paise for INR, cents for USD. Format with `money()` / `inr()`;
// never divide by 100 inline.

export type Currency = "INR" | "USD";
export type RangeKey = "today" | "7d" | "30d" | "90d" | "custom";
export type OrderStatus = "created" | "paid" | "failed" | "points_used";
export type DiscountSource = "none" | "admin" | "season_sale" | "unknown";
export type AccountStatus = "active" | "suspended" | "banned" | "closed";

export interface Pagination { page: number; limit: number; total: number; totalPages: number }

export interface RevenueTotals {
  revenueInrPaise: number;
  orders: number;
  payingUsers: number;
  newPayingUsers: number;
  avgOrderInrPaise: number;
  pointsUnlocks: number;
  pointsSpent: number;
  discountGivenInrPaise: number;
  signups: number;
  pagesCreated: number;
}

export interface QuickCell { revenueInrPaise: number; orders: number }

export interface RevenueSummary {
  range: { from: string; to: string; label: string; days: number };
  totals: RevenueTotals;
  previous: RevenueTotals;
  daily: { date: string; revenueInrPaise: number; orders: number; payingUsers: number; signups: number }[];
  byTemplate: { templateType: string; label: string; revenueInrPaise: number; orders: number }[];
  byCurrency: { currency: Currency; amount: number; revenueInrPaise: number; orders: number }[];
  byCountry: { country: string | null; revenueInrPaise: number; orders: number }[];
  quick: { today: QuickCell; last7: QuickCell; last30: QuickCell; last90: QuickCell };
}

export interface Customer {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  joinedAt: string;
  country?: string | null;
  status?: AccountStatus;
  revenueInrPaise: number;
  lifetimeRevenueInrPaise: number;
  orders: number;
  lifetimeOrders: number;
  pagesCreated: number;
  firstPaidAt?: string | null;
  lastPaidAt?: string | null;
}

export interface Order {
  _id: string;
  invoiceNumber: string | null;
  userId: string;
  userName: string;
  userEmail: string;
  templateType: string;
  templateLabel: string;
  pageId?: string | null;
  pageShareId: string | null;
  pageExists: boolean;
  status: OrderStatus;
  currency: Currency;
  amount: number;
  listAmount: number;
  discountAmount: number;
  discountPercent: number;
  discountSource: DiscountSource;
  seasonMode: string | null;
  amountInrPaise: number;
  pointsUsed: number;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  country?: string | null;
  createdAt: string;
  paidAt?: string | null;
}

export interface PagePayment {
  orderId: string;
  status: OrderStatus;
  amount: number;
  currency: Currency;
  amountInrPaise: number;
  listAmount: number;
  discountAmount: number;
  discountPercent: number;
  discountSource: DiscountSource;
  seasonMode: string | null;
  pointsUsed: number;
  paidAt?: string | null;
  razorpayPaymentId?: string | null;
  invoiceNumber?: string | null;
}

export interface BillingPage {
  _id: string;
  templateType: string;
  templateLabel: string;
  shareId?: string | null;
  isPublished: boolean;
  createdAt: string;
  viewCount: number;
  payment: PagePayment | null;
}

export interface StatementSent {
  sentAt: string;
  sentByEmail: string;
  period: { from: string; to: string };
  orderCount: number;
  totalInrPaise: number;
  to: string;
  messageId?: string | null;
  status: "sent" | "skipped" | "failed";
}

export interface UserBilling {
  user: {
    _id: string; name: string; email: string; avatar?: string; joinedAt: string;
    status?: AccountStatus; country?: string | null; provider?: string;
    freeAccess?: { enabled: boolean } | null; closedAt?: string | null;
  };
  totals: {
    lifetimeRevenueInrPaise: number; paidOrders: number; pointsUnlocks: number; pointsSpent: number;
    discountGivenInrPaise: number; pagesCreated: number; pagesPublished: number; paidPages: number;
    firstPaidAt?: string | null; lastPaidAt?: string | null;
  };
  pages: BillingPage[];
  orders: Order[];
  days: { date: string; orders: number; revenueInrPaise: number }[];
  statementsSent: StatementSent[];
}

export interface StatementPreview {
  subject: string;
  html: string;
  text: string;
  orderCount: number;
  totalInrPaise: number;
  to: string;
  /** The thank-you message the email opens with (the default one when none was written). */
  message?: string;
  /** The statement PDF that is attached to the email. */
  pdfBase64?: string;
  pdfFileName?: string;
}

/** What `POST …/billing/send` answers. `status` is the truth about delivery. */
export interface StatementResult {
  status?: "sent" | "skipped" | "failed";
  orderCount?: number;
  totalInrPaise?: number;
  to?: string;
  messageId?: string | null;
  message?: string;
  error?: string;
}

export interface ClosePreview {
  pages?: number;
  publishedPages?: number;
  paidOrders?: number;
  /** Per-collection counts of what a permanent close would delete. */
  deleted?: Record<string, number>;
  [k: string]: unknown;
}

// ── Money ───────────────────────────────────────────────────────────────────

const INR0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const INR2 = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** INR paise → "₹1,24,500" (paise shown only when there are any: "₹99.50"). */
export function inr(paise: number | null | undefined): string {
  const p = Math.round(Number(paise) || 0);
  const neg = p < 0 ? "-" : "";
  const a = Math.abs(p);
  return `${neg}₹${a % 100 ? INR2.format(a / 100) : INR0.format(a / 100)}`;
}

/** "₹1.2L" / "₹3.4Cr" — for chart axes and tight tiles where width matters. */
export function inrShort(paise: number): string {
  const r = (Number(paise) || 0) / 100;
  if (Math.abs(r) >= 1e7) return `₹${(r / 1e7).toFixed(1)}Cr`;
  if (Math.abs(r) >= 1e5) return `₹${(r / 1e5).toFixed(1)}L`;
  if (Math.abs(r) >= 1e3) return `₹${(r / 1e3).toFixed(1)}K`;
  return `₹${Math.round(r)}`;
}

/** Minor units of `currency` → "₹99" / "$4.99". */
export function money(minor: number | null | undefined, currency: Currency | string = "INR"): string {
  if (currency === "USD") return `$${((Number(minor) || 0) / 100).toFixed(2)}`;
  return inr(minor);
}

/** "Season sale — Dandiya 30%" / "Discount 20%" / "—": the offer that applied. */
export function discountLabel(o: { discountSource?: DiscountSource; discountPercent?: number; seasonMode?: string | null }): string {
  const pct = Math.round(Number(o.discountPercent) || 0);
  if (o.discountSource === "season_sale") {
    const mode = o.seasonMode ? ` — ${o.seasonMode.charAt(0).toUpperCase()}${o.seasonMode.slice(1)}` : "";
    return `Season sale${mode}${pct ? ` ${pct}%` : ""}`;
  }
  if (o.discountSource === "admin" && pct > 0) return `Discount ${pct}%`;
  if (pct > 0) return `${pct}% off`;
  return "—";
}

/** Percentage change vs the previous period; null when there is nothing to compare against. */
export function pctChange(now: number, prev: number): number | null {
  if (!prev) return now ? null : 0;
  return Math.round(((now - prev) / prev) * 100);
}

// ── Days — always India time, the same days the server buckets by ──────────

const YMD = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" });
export const istDay = (offset = 0) => YMD.format(new Date(Date.now() + offset * 86400000));

/** "12 Oct" / "12 Oct 2026" for a YYYY-MM-DD IST day. */
export const prettyDay = (ymd: string, withYear = false) =>
  new Date(`${ymd}T12:00:00+05:30`).toLocaleDateString("en-IN", { day: "numeric", month: "short", ...(withYear ? { year: "numeric" } : {}) });
export const weekday = (ymd: string) => new Date(`${ymd}T12:00:00+05:30`).toLocaleDateString("en-IN", { weekday: "short" });

const IST_TIME = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true,
});
/** "12 Oct 2026, 4:05 pm" (IST). */
export const istTime = (d?: string | Date | null) => (d ? IST_TIME.format(new Date(d)) : "—");

/** The IST day of an instant, as YYYY-MM-DD. */
export const istDayOf = (d: string | Date) => YMD.format(new Date(d));

export const isYmd = (s: string | null | undefined): s is string => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);

// ── CSV ─────────────────────────────────────────────────────────────────────

/** RFC 4180 cell; a leading = + - @ is defused so a spreadsheet never runs it. */
function cell(v: unknown): string {
  let s = v === null || v === undefined ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Builds the file in the browser and hands it to the download bar. */
export function downloadCsv(name: string, header: string[], rows: unknown[][]) {
  const body = [header, ...rows].map((r) => r.map(cell).join(",")).join("\r\n");
  // BOM so Excel reads ₹ and names in UTF-8.
  const blob = new Blob(["﻿" + body], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** paise → "1245.00" for CSV, where a spreadsheet wants a plain number. */
export const rupeesPlain = (paise: number) => ((Number(paise) || 0) / 100).toFixed(2);
