// ─── Recharge — the frozen contract ──────────────────────────────────────────
//
// LEAD-OWNED AND FROZEN. Import from here; do not extend it.
//
// A prepaid recharge flow, end to end: the subscriber strip with the plan that
// is about to expire, a category tab rail, a grid of plan cards, a payment
// sheet, and a receipt. The goal is LAYOUT FIDELITY — three screens that feel
// like a utility app right up until you read them. The humour is entirely in
// the copy; the flow itself is plain, dense and correct.
//
// ── BRAND ────────────────────────────────────────────────────────────────────
// No real network operator and no real payment app is named anywhere in this
// template — not in copy, file names, class names, alt text, comments or tests
// — and none of their brand colours appear either. The operator is invented and
// is OPERATOR_NAME below; the payment rails in the demo are invented with it.
// UPI itself is a public rail rather than a brand and is safe to name; the
// handle attached to it must not be.
//
// ── THE DETAIL THAT DECIDES THIS TEMPLATE ────────────────────────────────────
// `plan.price` is a STRING and the headline demo plan's price is "∞". It is
// never Number()'d, parseInt'd, parseFloat'd, summed, sorted numerically or
// compared as a number — not to order the grid, not to pick the cheapest, not
// to total the payment sheet. Plans render in the order they are stored, and
// that is the whole ordering rule. The moment a price is parsed the grid shows
// "NaN" on the largest type on the page.

import { obj, str, strOr, bool, list, strList, bodyFromKeys, type Raw } from "@/lib/wire";

/** The invented operator. Nothing in this template names a real one. */
export const OPERATOR_NAME = "DIL Prepaid";

/** The accent. An invented magenta, matched to no operator's palette. */
export const ACCENT = "#C2255C";

// ═══════════════════════════════════════════════════════════════════════════
// Stored shape
// ═══════════════════════════════════════════════════════════════════════════

/** One tab in the category rail. `id` is what plans point at. */
export interface PlanCategory {
  id: string;
  label: string;
}

/** One row of the plan card's detail table. */
export interface PlanRow {
  label: string;
  value: string;
  note?: string;
}

export interface Plan {
  id: string;
  /**
   * STRING, and the headline demo plan is "∞". Never Number()/parseInt/
   * parseFloat it. The currency symbol and grouping live inside the string.
   */
  price: string;
  /** Must match a `PlanCategory.id`; a plan pointing nowhere is dropped on read. */
  categoryId: string;
  validity: string;
  /** "Most Recharged" / "Best Value" — the ribbon on the card. */
  badge?: string;
  rows: PlanRow[];
  benefits: string[];
  /** A greyed card that cannot be selected. */
  disabled?: boolean;
  /** Why. Rendered in place of the button, so it is required in spirit. */
  disabledReason?: string;
}

/** One row in the payment sheet. */
export interface PaymentMethod {
  id: string;
  label: string;
  sub?: string;
}

export interface RechargeData {
  operator: { name: string; tagline: string };
  subscriber: { name: string; number: string; circle: string };
  /** The strip at the top: what is running out, and the line under it. */
  currentPlan: { expiresIn: string; note: string };
  categories: PlanCategory[];
  /** Rendered in stored order. Never sorted by price — see the header. */
  plans: Plan[];
  payment: { methods: PaymentMethod[] };
  /** The payoff. Shown on the receipt after the payment sheet closes. */
  receipt: { message: string[] };
}

// ═══════════════════════════════════════════════════════════════════════════
// Demo content
// ═══════════════════════════════════════════════════════════════════════════

export const DEMO_DATA: RechargeData = {
  operator: { name: OPERATOR_NAME, tagline: "Ab pyaar unlimited." },
  subscriber: {
    name: "Meera Sharma",
    number: "+91 98200 41821",
    circle: "Uttar Pradesh (West)",
  },
  currentPlan: {
    expiresIn: "Expires in 3 days",
    note: "Your plan is ending. Karan has already paid for the next one, but the button is yours to press.",
  },
  categories: [
    { id: "popular", label: "Popular" },
    { id: "unlimited", label: "Unlimited" },
    { id: "data", label: "Data Add-On" },
    { id: "longterm", label: "Long Term" },
    { id: "special", label: "Special Recharge" },
  ],
  plans: [
    {
      id: "pl-forever",
      price: "∞",
      categoryId: "popular",
      validity: "No expiry",
      badge: "Most Recharged",
      rows: [
        { label: "Calls", value: "Unlimited", note: "Including the 2 AM ones. Especially those." },
        { label: "Data", value: "Unlimited", note: "For sending me videos I have already been sent." },
        { label: "SMS", value: "100 / day", note: "You have used four since 2021." },
        { label: "Validity", value: "No expiry", note: "This is not a typo and has been checked twice." },
      ],
      benefits: [
        "Priority answering — first ring, every ring, no exceptions",
        "Free forehead kisses on national holidays and on all other days",
        "Zero-rated arguments about the AC temperature (you still lose)",
        "Unlimited 'have you eaten' checks, incoming and outgoing",
      ],
    },
    {
      id: "pl-84",
      price: "₹84",
      categoryId: "unlimited",
      validity: "84 days",
      badge: "Best Value",
      rows: [
        { label: "Calls", value: "Unlimited" },
        { label: "Data", value: "2 GB / day", note: "1.9 GB of which is her sending me the same clip." },
        { label: "SMS", value: "100 / day" },
        { label: "Validity", value: "84 days", note: "Twelve weekends. Eleven of them already planned." },
      ],
      benefits: [
        "One long drive with the windows down, route unannounced",
        "Weekly permission to pick the restaurant (revocable)",
        "Complimentary carrying of your bag through any airport",
      ],
    },
    {
      id: "pl-1",
      price: "₹1",
      categoryId: "data",
      validity: "1 day",
      rows: [
        { label: "Data", value: "1 GB", note: "Enough for one call where the video keeps freezing." },
        { label: "Calls", value: "Not included", note: "This is a top-up, not a substitute." },
        { label: "Validity", value: "Today only" },
      ],
      benefits: [
        "One good-morning text, delivered before 8 AM, written the night before",
        "One photo of whatever I am eating, unsolicited",
      ],
    },
    {
      id: "pl-365",
      price: "₹365",
      categoryId: "longterm",
      validity: "365 days",
      badge: "Long Term",
      rows: [
        { label: "Calls", value: "Unlimited" },
        { label: "Data", value: "2.5 GB / day" },
        { label: "Validity", value: "365 days", note: "One rupee a day. I checked. It is the only sum here." },
        { label: "Auto-renew", value: "On", note: "Cannot be switched off from this screen." },
      ],
      benefits: [
        "Every birthday, both anniversaries, and the odd Tuesday for no reason",
        "One argument won by you per quarter, awarded regardless of merit",
        "Standing invitation to your mother's kitchen, where I am allowed to stir",
      ],
    },
    {
      id: "pl-3650",
      price: "₹3,650",
      categoryId: "longterm",
      validity: "10 years",
      rows: [
        { label: "Calls", value: "Unlimited" },
        { label: "Data", value: "Unlimited" },
        { label: "Validity", value: "10 years", note: "Renewable. I intend to keep renewing." },
        { label: "Family plan", value: "Available", note: "Requires a separate conversation with your father." },
      ],
      benefits: [
        "Everything in the 365-day plan, ten times over",
        "One serious question, asked properly, in person, with the ring in my pocket",
        "Free migration of all your things into one flat, movers included",
      ],
    },
    {
      id: "pl-silence",
      price: "₹0",
      categoryId: "special",
      validity: "—",
      rows: [
        { label: "Calls", value: "Barred" },
        { label: "Data", value: "Barred" },
        { label: "Validity", value: "Indefinite, unfortunately" },
      ],
      benefits: ["Nothing. That was the point of it."],
      disabled: true,
      disabledReason:
        "Discontinued in October 2022 after a three-day trial. We do not offer the silent treatment on this network anymore.",
    },
  ],
  payment: {
    methods: [
      { id: "upi", label: "UPI", sub: "meera@dilprepaid · saved" },
      { id: "wallet", label: "DIL Wallet", sub: "Balance: ∞" },
      { id: "card", label: "Debit / Credit Card", sub: "Saved card •••• 1402" },
      { id: "netbanking", label: "Net Banking", sub: "All banks. None of them will understand this." },
      { id: "later", label: "Pay Later", sub: "Settle in person. Preferred method." },
    ],
  },
  receipt: {
    message: [
      "Recharge successful.",
      "Your plan is active and it does not expire.",
      "Transaction ID: KRN-MRA-14022021",
      "Amount debited: everything, cheerfully.",
      "For any issue with this recharge, call the number you already know by heart. It rings on the first ring.",
      "— Karan",
    ],
  },
};

/** Whitelisted keys that make up the flat wire payload (also the model content fields). */
export const RECHARGE_CONTENT_KEYS: readonly (keyof RechargeData)[] = [
  "operator",
  "subscriber",
  "currentPlan",
  "categories",
  "plans",
  "payment",
  "receipt",
];

// ═══════════════════════════════════════════════════════════════════════════
// Caps and helpers
// ═══════════════════════════════════════════════════════════════════════════

export const MAX_CATEGORIES = 8;
export const MAX_PLANS = 24;
export const MAX_ROWS = 10;
export const MAX_BENEFITS = 8;
export const MAX_METHODS = 8;
export const MAX_RECEIPT_LINES = 10;

/** Hard caps on free text, so one pasted essay cannot destroy the plan grid. */
const LIMITS = {
  id: 48,
  name: 60,
  number: 32,
  circle: 60,
  tagline: 120,
  price: 24,
  validity: 48,
  badge: 32,
  label: 60,
  value: 80,
  note: 200,
  benefit: 200,
  reason: 300,
  line: 240,
} as const;

const cut = (s: string, max: number): string => (s.length > max ? s.slice(0, max) : s);

/** A slug-safe id. Ids reach React keys and category lookups, nothing else. */
const idOf = (v: unknown, fallback: string): string => {
  const raw = strOr(v, "").trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
  return cut(raw, LIMITS.id) || fallback;
};

/** The plans in a category, in stored order. The only ordering rule there is. */
export const plansInCategory = (data: RechargeData, categoryId: string): Plan[] =>
  data.plans.filter((p) => p.categoryId === categoryId);

/** The first selectable plan in a category, for the initial highlighted card. */
export const firstSelectablePlan = (data: RechargeData, categoryId: string): Plan | null =>
  plansInCategory(data, categoryId).find((p) => !p.disabled) ?? null;

// ═══════════════════════════════════════════════════════════════════════════
// Wire format
// ═══════════════════════════════════════════════════════════════════════════

/** UI state → flat body sent to POST/PUT. `password` optional (empty = no gate). */
export function rechargeDataToBody(data: RechargeData, password?: string): Record<string, unknown> {
  return bodyFromKeys(data, RECHARGE_CONTENT_KEYS, password);
}

function coerceCategory(o: Raw, index: number): PlanCategory | null {
  const label = cut(strOr(o.label, "").trim(), LIMITS.label);
  if (!label) return null;
  return { id: idOf(o.id, `cat-${index + 1}`), label };
}

function coerceRow(o: Raw): PlanRow | null {
  const label = cut(strOr(o.label, "").trim(), LIMITS.label);
  const value = cut(strOr(o.value, "").trim(), LIMITS.value);
  // A row with a blank side renders as a hole in the card's table.
  if (!label || !value) return null;
  const note = cut(strOr(o.note, "").trim(), LIMITS.note);
  return { label, value, ...(note ? { note } : {}) };
}

function coercePlan(o: Raw, index: number): Plan | null {
  const rows = list<PlanRow>(o.rows, coerceRow, []).slice(0, MAX_ROWS);
  const benefits = strList(o.benefits, [])
    .map((b) => cut(b.trim(), LIMITS.benefit))
    .filter(Boolean)
    .slice(0, MAX_BENEFITS);
  // A card with no table and no benefits is an empty box with a price on it.
  if (rows.length === 0 && benefits.length === 0) return null;
  const badge = cut(strOr(o.badge, "").trim(), LIMITS.badge);
  const disabled = bool(o.disabled, false);
  const reason = cut(strOr(o.disabledReason, "").trim(), LIMITS.reason);
  return {
    id: idOf(o.id, `pl-${index + 1}`),
    // String, and it stays one. "∞" survives; nothing here parses it.
    price: cut(str(o.price, "—").trim(), LIMITS.price),
    categoryId: idOf(o.categoryId, ""),
    validity: cut(strOr(o.validity, "").trim(), LIMITS.validity),
    ...(badge ? { badge } : {}),
    rows,
    benefits,
    ...(disabled ? { disabled: true } : {}),
    // A greyed card with no explanation is indistinguishable from a broken one,
    // so an unexplained disable gets a house line rather than silence.
    ...(disabled ? { disabledReason: reason || "Not available on this number." } : {}),
  };
}

function coerceMethod(o: Raw, index: number): PaymentMethod | null {
  const label = cut(strOr(o.label, "").trim(), LIMITS.label);
  if (!label) return null;
  const sub = cut(strOr(o.sub, "").trim(), LIMITS.note);
  return { id: idOf(o.id, `pm-${index + 1}`), label, ...(sub ? { sub } : {}) };
}

/**
 * DB/share response → UI state.
 *
 * Total function: every branch returns something drawable, and an empty or
 * absent payload falls all the way back to the demo flow rather than to an
 * empty grid. Nothing here parses a price.
 */
export function dbToRechargeData(db: Raw | null | undefined): RechargeData {
  const src = obj(db);

  const rawOperator = obj(src.operator);
  const rawSubscriber = obj(src.subscriber);
  const rawCurrent = obj(src.currentPlan);

  const categories = list<PlanCategory>(src.categories, coerceCategory, DEMO_DATA.categories).slice(
    0,
    MAX_CATEGORIES,
  );
  // Duplicate category ids make the tab rail ambiguous and silently hide plans,
  // so they are renumbered here rather than anywhere downstream.
  const seenCats = new Set<string>();
  const uniqueCategories: PlanCategory[] = categories.map((c, i) => {
    if (!seenCats.has(c.id)) {
      seenCats.add(c.id);
      return c;
    }
    let id = `${c.id}-${i}`;
    while (seenCats.has(id)) id = `${id}x`;
    seenCats.add(id);
    return { ...c, id };
  });

  const known = new Set(uniqueCategories.map((c) => c.id));
  const fallbackCategory = uniqueCategories[0]?.id ?? "";
  const plans = list<Plan>(src.plans, coercePlan, DEMO_DATA.plans)
    .slice(0, MAX_PLANS)
    // A plan pointing at a category that is not on the rail is unreachable —
    // it renders nowhere and looks like data loss. Rehome it on the first tab.
    .map((p) => (known.has(p.categoryId) ? p : { ...p, categoryId: fallbackCategory }));

  const seenPlans = new Set<string>();
  const uniquePlans: Plan[] = plans.map((p, i) => {
    if (!seenPlans.has(p.id)) {
      seenPlans.add(p.id);
      return p;
    }
    let id = `${p.id}-${i}`;
    while (seenPlans.has(id)) id = `${id}x`;
    seenPlans.add(id);
    return { ...p, id };
  });

  const methods = list<PaymentMethod>(obj(src.payment).methods, coerceMethod, DEMO_DATA.payment.methods).slice(
    0,
    MAX_METHODS,
  );

  return {
    operator: {
      name: cut(str(rawOperator.name, DEMO_DATA.operator.name).trim(), LIMITS.name),
      tagline: cut(strOr(rawOperator.tagline, DEMO_DATA.operator.tagline).trim(), LIMITS.tagline),
    },
    subscriber: {
      name: cut(str(rawSubscriber.name, DEMO_DATA.subscriber.name).trim(), LIMITS.name),
      number: cut(str(rawSubscriber.number, DEMO_DATA.subscriber.number).trim(), LIMITS.number),
      circle: cut(strOr(rawSubscriber.circle, DEMO_DATA.subscriber.circle).trim(), LIMITS.circle),
    },
    currentPlan: {
      expiresIn: cut(str(rawCurrent.expiresIn, DEMO_DATA.currentPlan.expiresIn).trim(), LIMITS.validity),
      note: cut(strOr(rawCurrent.note, DEMO_DATA.currentPlan.note).trim(), LIMITS.line),
    },
    categories: uniqueCategories,
    plans: uniquePlans,
    payment: { methods },
    receipt: {
      message: strList(obj(src.receipt).message, DEMO_DATA.receipt.message)
        .map((l) => cut(l.trim(), LIMITS.line))
        .filter(Boolean)
        .slice(0, MAX_RECEIPT_LINES),
    },
  };
}
