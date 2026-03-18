/**
 * Client-side mirror of server/src/config/templatePricing.ts
 *
 * Used for:
 *  • Premium badge on TemplateCard
 *  • PaymentModal pricing display
 *  • Checking locally if payment is needed before hitting server
 *
 * Key: template SLUG (as it appears in the URL / template-registry)
 */

export interface ClientTemplatePricing {
  templateType: string;   // matches server templateType (for API calls)
  slug: string;           // matches template slug (for registry lookup)
  name: string;
  isFree: boolean;
  originalPrice: number;  // INR, shown crossed-out
  discountPercent: number;
  finalPrice: number;     // INR actually shown to pay
  pointsCost: number;     // points alternative
}

export const CLIENT_TEMPLATE_PRICING: Record<string, ClientTemplatePricing> = {
  // ── Premium ───────────────────────────────────────────────────────────────
  holi: {
    templateType:    "holi",
    slug:            "holi",
    name:            "Holi Special",
    isFree:          false,
    originalPrice:   499,
    discountPercent: 80,
    finalPrice:      99,
    pointsCost:      50,
  },

  // ── Free / Freemium ───────────────────────────────────────────────────────
  "eid-mubarak": {
    templateType:    "eid",
    slug:            "eid-mubarak",
    name:            "Eid Mubarak",
    isFree:          true,
    originalPrice:   0,
    discountPercent: 0,
    finalPrice:      0,
    pointsCost:      0,
  },
  "wedding-shaadi": {
    templateType:    "wedding",
    slug:            "wedding-shaadi",
    name:            "Wedding Shaadi",
    isFree:          true,
    originalPrice:   0,
    discountPercent: 0,
    finalPrice:      0,
    pointsCost:      0,
  },
  reception: {
    templateType:    "reception",
    slug:            "reception",
    name:            "Reception",
    isFree:          true,
    originalPrice:   0,
    discountPercent: 0,
    finalPrice:      0,
    pointsCost:      0,
  },
};

export function getClientPricing(slug: string): ClientTemplatePricing | null {
  return CLIENT_TEMPLATE_PRICING[slug] ?? null;
}

export function isTemplatePremium(slug: string): boolean {
  const p = getClientPricing(slug);
  return p ? !p.isFree : false;
}
