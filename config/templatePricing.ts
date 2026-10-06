/**
 * Pricing TYPES and MATH. Deliberately no numbers.
 *
 * This file used to be a hand-maintained mirror of the server's price list,
 * which meant changing a price required editing two repositories and deploying
 * both — and the two had already drifted (the server said Holi was ₹499 at 80%
 * off for ₹99, and 499 × 0.20 is 99.80). The numbers now come from
 * `GET /payment/pricing` via `lib/pricing.ts`.
 *
 * ── WHY THE MATH IS DUPLICATED FROM THE SERVER ──────────────────────────────
 *
 * `server/src/config/pricingMath.ts` holds the same formula. That is deliberate,
 * and it is not the mirror this change removed: what drifted before was DATA —
 * a list of prices that had to be edited in two places. This is a pure function
 * of two inputs, and it exists here so the admin panel can show a live preview
 * as the super admin types, before anything is saved.
 *
 * Every price the user is actually shown is resolved SERVER-side and sent
 * whole — `mrp`, `savings` and `discountPercent` all arrive computed. The
 * paywall never recomputes. So a drift here shows up in the admin preview, not
 * in what anyone is charged.
 *
 * If you change the formula, change both.
 */

export interface ResolvedPricing {
  slug: string;
  isFree: boolean;
  finalPricePaise: number;
  finalPrice: number;
  mrpPaise: number;
  mrp: number;
  savingsPaise: number;
  savings: number;
  discountPercent: number;
  pointsCost: number;
  /** International price in cents set by a super admin; null = derived from INR. */
  usdPriceCents?: number | null;
}

export interface PricingRow {
  slug: string;
  isFree: boolean;
  finalPricePaise: number;
  discountPercent: number;
  pointsCost: number;
  /** International price in cents set by a super admin; null = derived from INR. */
  usdPriceCents?: number | null;
}

const toRupees = (paise: number): number => Math.round(paise) / 100;

export function deriveMrpPaise(finalPricePaise: number, discountPercent: number): number {
  const price = Math.max(0, Math.round(finalPricePaise) || 0);
  const pct = Math.min(Math.max(Math.round(discountPercent) || 0, 0), 99);
  if (pct === 0) return price;
  // Floored at the price so a strike-through can never read below what is being
  // charged, which would look like a price rise.
  return Math.max(Math.round(price / (1 - pct / 100)), price);
}

export function derivePricing(row: PricingRow): ResolvedPricing {
  if (row.isFree) {
    return {
      slug: row.slug, isFree: true,
      finalPricePaise: 0, finalPrice: 0,
      mrpPaise: 0, mrp: 0,
      savingsPaise: 0, savings: 0,
      discountPercent: 0, pointsCost: 0,
    };
  }

  const finalPricePaise = Math.max(0, Math.round(row.finalPricePaise) || 0);
  const discountPercent = Math.min(Math.max(Math.round(row.discountPercent) || 0, 0), 99);
  const mrpPaise = deriveMrpPaise(finalPricePaise, discountPercent);
  const savingsPaise = mrpPaise - finalPricePaise;

  return {
    slug: row.slug, isFree: false,
    finalPricePaise, finalPrice: toRupees(finalPricePaise),
    mrpPaise, mrp: toRupees(mrpPaise),
    savingsPaise, savings: toRupees(savingsPaise),
    discountPercent,
    pointsCost: Math.max(0, Math.round(row.pointsCost) || 0),
  };
}

export function freePricing(slug: string): ResolvedPricing {
  return derivePricing({ slug, isFree: true, finalPricePaise: 0, discountPercent: 0, pointsCost: 0 });
}

/**
 * ₹1,499 — Indian digit grouping, no decimals.
 *
 * No decimals because every price is whole rupees: `validatePricingInput` on the
 * server only accepts integer paise and the panel only sends whole rupees. A
 * `.00` on every price would be noise.
 */
export function formatINR(rupees: number): string {
  return "₹" + Math.round(rupees).toLocaleString("en-IN");
}
