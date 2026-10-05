/**
 * Currency-aware prices for the paywall. Mirrors `server/src/config/currency.ts`.
 *
 * Every amount is an integer in the currency's minor unit (paise / cents), the
 * same unit Razorpay charges in. The server decides the currency from the
 * buyer's country on every quote and every order; the client only displays
 * what it was quoted and sends it back so the server can refuse a mismatch.
 */
import type { ResolvedPricing } from "@/config/templatePricing";

export type Currency = "INR" | "USD";

export interface LocalizedPricing {
  slug: string;
  isFree: boolean;
  currency: Currency;
  finalAmount: number;
  mrpAmount: number;
  savingsAmount: number;
  discountPercent: number;
  pointsCost: number;
  source: "inr" | "usd_set" | "usd_derived";
}

export interface Quote {
  pricing: LocalizedPricing;
  currency: Currency;
  country: string | null;
  international: boolean;
}

/** "₹149" · "₹149.50" · "$1.99" — from minor units. */
export function formatMoney(minor: number, currency: Currency): string {
  const major = (minor || 0) / 100;
  if (currency === "USD") return "$" + major.toFixed(2);
  return "₹" + major.toLocaleString("en-IN", { minimumFractionDigits: major % 1 ? 2 : 0, maximumFractionDigits: 2 });
}

/** The INR quote implied by the gate's pricing — the fallback when /quote fails. */
export function inrQuoteFrom(pricing: ResolvedPricing): Quote {
  return {
    currency: "INR",
    country: null,
    international: false,
    pricing: {
      slug: pricing.slug,
      isFree: pricing.isFree,
      currency: "INR",
      finalAmount: pricing.finalPricePaise,
      mrpAmount: pricing.mrpPaise,
      savingsAmount: pricing.savingsPaise,
      discountPercent: pricing.discountPercent,
      pointsCost: pricing.pointsCost,
      source: "inr",
    },
  };
}

// ── Super-admin country override (testing the USD checkout from India) ──────
//
// Sent as `X-Debug-Country`. The server honours it ONLY for a super admin who
// is not impersonating; for anyone else it is ignored, so storing it here is
// harmless. Session-scoped so it cannot linger into a real purchase tomorrow.
const DEBUG_KEY = "ss_debug_country";

export function getDebugCountry(): string | null {
  try {
    const v = sessionStorage.getItem(DEBUG_KEY);
    return v && /^[A-Z]{2}$/.test(v) ? v : null;
  } catch {
    return null;
  }
}

export function setDebugCountry(code: string | null): void {
  try {
    if (code && /^[A-Z]{2}$/.test(code)) sessionStorage.setItem(DEBUG_KEY, code);
    else sessionStorage.removeItem(DEBUG_KEY);
  } catch {
    /* storage blocked */
  }
}

export function debugCountryHeader(): Record<string, string> {
  const c = getDebugCountry();
  return c ? { "X-Debug-Country": c } : {};
}
