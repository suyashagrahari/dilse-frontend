// ─── Recharge — the data contract ────────────────────────────────────────────
//
// A prepaid "relationship recharge" played exactly like a payments app: the
// operator-detected card, offer banners, a category tab rail, plan cards, the
// payment sheet with UPI apps and a PIN pad, the processing spinner, the green
// success tick, a cashback scratch card and the transaction receipt.
//
// ── BRAND ────────────────────────────────────────────────────────────────────
// No real network operator and no real payment app is named anywhere in this
// template, and none of their brand colours appear. The payments app is the
// invented "dilpay" and the operator is the invented OPERATOR_NAME below.
//
// ── PRICES ARE STRINGS ───────────────────────────────────────────────────────
// `plan.price` is a STRING and the headline demo plan's price is "∞". It is
// never parsed, summed or sorted. Plans render in stored order.
//
// ── ROWS ARE LINES ───────────────────────────────────────────────────────────
// A plan's detail rows are held as "Label: Value | optional note" lines. That
// is the shape the AI fill writes and the shape the form edits; the wire body
// sends the same lines and the server splits them. Older pages stored objects,
// which `normalizeData` folds back into lines.

import { obj, str, strOr, bool, list, strList, type Raw } from "@/lib/wire";
import {
  DEMO_PHOTOS,
  MAX_LETTER_LEN,
  MAX_LOCK_ANSWER_LEN,
  MAX_LOCK_QUESTION_LEN,
  parseLovePhotos,
  type LovePhoto,
} from "../../_love/types";

/** The invented operator. Nothing in this template names a real one. */
export const OPERATOR_NAME = "DIL Prepaid";
/** The invented payments app. */
export const APP_NAME = "dilpay";

// ═══════════════════════════════════════════════════════════════════════════
// Stored shape
// ═══════════════════════════════════════════════════════════════════════════

export interface PlanCategory {
  id: string;
  label: string;
}

export interface Plan {
  id: string;
  /** STRING — "∞" is legal. Never parsed. */
  price: string;
  categoryId: string;
  validity: string;
  /** Ribbon on the card: "Most Recharged", "Best Value". */
  badge?: string;
  /** "Label: Value | note" lines. The first two become the card's columns. */
  rows: string[];
  /** Short benefit lines — chips on the card, full list in details. */
  benefits: string[];
  disabled?: boolean;
  disabledReason?: string;
}

export interface RechargeData {
  subscriber: { name: string; number: string; circle: string };
  sender: { name: string };
  /** The expiry strip on the operator card. */
  currentPlan: { expiresIn: string; note: string };
  /** Offer-banner captions; banner i sits on photo i. */
  promos: string[];
  categories: PlanCategory[];
  plans: Plan[];
  /** The scratch card that appears after the payment succeeds. */
  cashback: { title: string; note: string };
  /** The payment note on the receipt — where the joking stops. */
  receipt: { message: string[] };
  /** Photo 1 is their avatar; all of them become the offer banners. */
  photos: LovePhoto[];
  letter: string;
  lockQuestion: string;
  lockAnswer: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// Demo content
// ═══════════════════════════════════════════════════════════════════════════

export const DEMO_DATA: RechargeData = {
  subscriber: { name: "Meera", number: "+91 98200 14022", circle: "UP West" },
  sender: { name: "Karan" },
  currentPlan: {
    expiresIn: "Expires in 3 days",
    note: "cuddle balance critically low bestie 🪫 recharge before you start replying 'k'",
  },
  promos: [
    "Flat ₹∞ cashback on your first hug of the day 🫂",
    "Unlimited 2 AM calls. No FUP. No sleep. 📞",
    "Refer me to your mom, get lifetime biryani 🍛",
    "Buy 1 forehead kiss, get the next 10,000 free 💋",
  ],
  categories: [
    { id: "popular", label: "Popular 🔥" },
    { id: "unlimited", label: "Unlimited Love" },
    { id: "hugs", label: "Hugs = Data" },
    { id: "forever", label: "Forever Plans" },
  ],
  plans: [
    {
      id: "pl-forever",
      price: "∞",
      categoryId: "popular",
      validity: "Lifetime",
      badge: "Most Recharged",
      rows: [
        "Hugs: Unlimited/day | no daily cap, no fair usage policy, no mercy",
        "Calls: Unlimited | including the 2 AM 'are you awake' ones",
        "Texts: 100/min | 97 of them are reels you already saw",
        "Roaming: Free | wherever you go, I'm on the same network",
      ],
      benefits: [
        "Priority answering on the first ring",
        "Free forehead kisses, all days",
        "AC temperature fights (you still win)",
        "Unlimited 'have you eaten?' checks",
      ],
    },
    {
      id: "pl-84",
      price: "₹84",
      categoryId: "unlimited",
      validity: "84 days",
      badge: "Best Value",
      rows: [
        "Hugs: 2 GB/day | 1.9 GB of it is you sending me the same meme",
        "Calls: Unlimited | yes, even the 'nothing, you tell' calls",
        "Dates: 12 weekends | eleven already planned in my notes app",
      ],
      benefits: ["One long drive, route unannounced", "Weekly restaurant veto power", "Airport bag-carrying included"],
    },
    {
      id: "pl-1",
      price: "₹1",
      categoryId: "hugs",
      validity: "1 day",
      rows: [
        "Hugs: 1 GB | enough for one video call where the video keeps freezing",
        "Good-morning texts: 1 | delivered before 8 AM, drafted the night before",
      ],
      benefits: ["One unsolicited food pic", "A voice note that's just me yawning"],
    },
    {
      id: "pl-365",
      price: "₹365",
      categoryId: "forever",
      validity: "365 days",
      rows: [
        "Hugs: 2.5 GB/day",
        "Calls: Unlimited",
        "Cost: ₹1/day | I did the maths. It's the only maths here.",
        "Auto-renew: On | cannot be switched off from this screen",
      ],
      benefits: ["Every birthday + both anniversaries", "One argument won by you per quarter", "Standing invite to your mom's kitchen"],
    },
    {
      id: "pl-silence",
      price: "₹0",
      categoryId: "unlimited",
      validity: "—",
      rows: ["Calls: Barred", "Texts: Seen, no reply"],
      benefits: ["Nothing. That was the point."],
      disabled: true,
      disabledReason: "The silent treatment plan was discontinued after a 3-day trial in 2023. Never again 🙅",
    },
  ],
  cashback: {
    title: "1 lifetime supply of forehead kisses",
    note: "Auto-credited to your cheeks. No expiry. Non-transferable (I checked).",
  },
  receipt: {
    message: [
      "Okay, no jokes for one second.",
      "You're the only plan I never want to switch from. Thank you for picking up every single time — even on the days I was a lot.",
      "Consider this recharged. Forever. 💗",
    ],
  },
  photos: DEMO_PHOTOS.map(({ url, cropX, cropY, scale }) => ({ url, cropX, cropY, scale })),
  letter:
    "I tried to find a plan big enough for you and every single one had an expiry date, so I made my own.\n\nYou are my favourite notification. You're the reason I check my phone forty times an hour — and somehow also the reason I stopped needing to. Every call with you ends with neither of us hanging up, and honestly? I hope nobody ever fixes that bug.\n\nThis recharge doesn't run out. No FUP, no validity, no 'your data pack is exhausted'. Just me, on your network, forever. Full bars.",
  lockQuestion: "Will you stay on my network forever? 📶",
  lockAnswer: "Recharge accepted 💗",
};

/** Whitelisted keys that make up the flat wire payload. */
export const RECHARGE_CONTENT_KEYS: readonly (keyof RechargeData)[] = [
  "subscriber",
  "sender",
  "currentPlan",
  "promos",
  "categories",
  "plans",
  "cashback",
  "receipt",
  "photos",
  "letter",
  "lockQuestion",
  "lockAnswer",
];

// ═══════════════════════════════════════════════════════════════════════════
// Caps and helpers
// ═══════════════════════════════════════════════════════════════════════════

export const MAX_CATEGORIES = 6;
export const MAX_PLANS = 12;
export const MAX_ROWS = 6;
export const MAX_BENEFITS = 6;
export const MAX_PROMOS = 6;
export const MAX_RECEIPT_LINES = 6;
export const MAX_PHOTOS = 6;

export const LIMITS = {
  id: 48,
  name: 60,
  number: 32,
  circle: 60,
  price: 24,
  validity: 48,
  badge: 32,
  label: 60,
  row: 300,
  benefit: 200,
  reason: 300,
  line: 240,
  expiry: 48,
  promo: 90,
  cashTitle: 80,
  cashNote: 200,
  letter: MAX_LETTER_LEN,
  lockQuestion: MAX_LOCK_QUESTION_LEN,
  lockAnswer: MAX_LOCK_ANSWER_LEN,
} as const;

const cut = (s: string, max: number): string => (s.length > max ? s.slice(0, max) : s);

const idOf = (v: unknown, fallback: string): string => {
  const raw = strOr(v, "").trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
  return cut(raw, LIMITS.id) || fallback;
};

export interface Row {
  label: string;
  value: string;
  note: string;
}

/** "Label: Value | note" → parts. A line with no colon is all value. */
export function parseRow(line: string): Row {
  const [head, ...rest] = (line ?? "").split("|");
  const at = head.indexOf(":");
  const note = rest.join("|").trim();
  if (at < 0) return { label: "", value: head.trim(), note };
  return { label: head.slice(0, at).trim(), value: head.slice(at + 1).trim(), note };
}

/** One row off the wire — a line, or an older `{label,value,note}` object. */
function rowLine(v: unknown): string | null {
  if (typeof v === "string") {
    const s = cut(v.trim(), LIMITS.row);
    return s || null;
  }
  const o = obj(v);
  const label = strOr(o.label, "").trim();
  const value = strOr(o.value, "").trim();
  if (!label || !value) return null;
  const note = strOr(o.note, "").trim();
  return cut(`${label}: ${value}${note ? ` | ${note}` : ""}`, LIMITS.row);
}

export const plansInCategory = (data: RechargeData, categoryId: string): Plan[] =>
  data.plans.filter((p) => p.categoryId === categoryId);

export function recommendedPlanId(data: RechargeData): string | null {
  const first = data.plans.find((p) => !p.disabled);
  return first ? first.id : (data.plans[0]?.id ?? null);
}

// ═══════════════════════════════════════════════════════════════════════════
// Wire format
// ═══════════════════════════════════════════════════════════════════════════

/** UI state → flat body sent to POST/PUT. `password` optional (empty = no gate). */
export function rechargeDataToBody(data: RechargeData, password?: string): Record<string, unknown> {
  const d = normalizeData(data);
  const body: Record<string, unknown> = {};
  for (const k of RECHARGE_CONTENT_KEYS) body[k] = d[k];
  if (password !== undefined) body.password = password;
  return body;
}

function coerceCategory(o: Raw, index: number): PlanCategory | null {
  const label = cut(strOr(o.label, "").trim(), LIMITS.label);
  if (!label) return null;
  return { id: idOf(o.id, `cat-${index + 1}`), label };
}

function coercePlan(v: unknown, index: number): Plan | null {
  const o = obj(v);
  const rows = (Array.isArray(o.rows) ? o.rows : [])
    .map(rowLine)
    .filter((r): r is string => !!r)
    .slice(0, MAX_ROWS);
  const benefits = strList(o.benefits, [])
    .map((b) => cut(b.trim(), LIMITS.benefit))
    .filter(Boolean)
    .slice(0, MAX_BENEFITS);
  const price = cut(strOr(o.price, "").trim(), LIMITS.price);
  if (!price && rows.length === 0 && benefits.length === 0) return null;
  const badge = cut(strOr(o.badge, "").trim(), LIMITS.badge);
  const disabled = bool(o.disabled, false);
  const reason = cut(strOr(o.disabledReason, "").trim(), LIMITS.reason);
  return {
    id: idOf(o.id, `pl-${index + 1}`),
    price: price || "—",
    categoryId: idOf(o.categoryId, ""),
    validity: cut(strOr(o.validity, "").trim(), LIMITS.validity),
    ...(badge ? { badge } : {}),
    rows,
    benefits,
    ...(disabled ? { disabled: true, disabledReason: reason || "Not available on this number." } : {}),
  };
}

const strings = (v: unknown, max: number, count: number): string[] =>
  (Array.isArray(v) ? v : [])
    .filter((x): x is string => typeof x === "string")
    .map((x) => cut(x, max))
    .slice(0, count);

/**
 * Structural repair. Runs on live editor state (an AI patch can leave lines
 * where the old shape had objects), on drafts, and on API payloads: it dedupes
 * ids, rehomes orphaned plans, and never lets the grid go empty.
 */
export function normalizeData(input: RechargeData): RechargeData {
  const src = input as unknown as Raw;
  const categories = list<PlanCategory>(src.categories, coerceCategory, DEMO_DATA.categories).slice(0, MAX_CATEGORIES);
  const seenCats = new Set<string>();
  const uniqueCats = categories.map((c, i) => {
    let id = c.id;
    while (seenCats.has(id)) id = `${id}-${i}`;
    seenCats.add(id);
    return id === c.id ? c : { ...c, id };
  });
  const known = new Set(uniqueCats.map((c) => c.id));
  const fallbackCat = uniqueCats[0]?.id ?? "";

  const rawPlans = Array.isArray(src.plans) ? (src.plans as unknown[]) : [];
  let plans = rawPlans
    .map((p, i) => coercePlan(p, i))
    .filter((p): p is Plan => !!p)
    .slice(0, MAX_PLANS);
  if (plans.length === 0) plans = DEMO_DATA.plans.map((p) => ({ ...p, rows: [...p.rows], benefits: [...p.benefits] }));
  const seenPlans = new Set<string>();
  plans = plans.map((p, i) => {
    let id = p.id || `pl-${i + 1}`;
    while (seenPlans.has(id)) id = `${id}-${i}`;
    seenPlans.add(id);
    return { ...p, id, categoryId: known.has(p.categoryId) ? p.categoryId : fallbackCat };
  });

  const sub = obj(src.subscriber);
  const snd = obj(src.sender);
  const cur = obj(src.currentPlan);
  const cash = obj(src.cashback);
  const rec = obj(src.receipt);

  return {
    subscriber: {
      name: cut(strOr(sub.name, ""), LIMITS.name),
      number: cut(strOr(sub.number, ""), LIMITS.number),
      circle: cut(strOr(sub.circle, ""), LIMITS.circle),
    },
    sender: { name: cut(strOr(snd.name, ""), LIMITS.name) },
    currentPlan: {
      expiresIn: cut(strOr(cur.expiresIn, ""), LIMITS.expiry),
      note: cut(strOr(cur.note, ""), LIMITS.line),
    },
    promos: strings(src.promos, LIMITS.promo, MAX_PROMOS),
    categories: uniqueCats,
    plans,
    cashback: { title: cut(strOr(cash.title, ""), LIMITS.cashTitle), note: cut(strOr(cash.note, ""), LIMITS.cashNote) },
    receipt: { message: strings(rec.message, LIMITS.line, MAX_RECEIPT_LINES) },
    photos: parseLovePhotos(src.photos, []).slice(0, MAX_PHOTOS),
    letter: cut(strOr(src.letter, ""), LIMITS.letter),
    lockQuestion: cut(strOr(src.lockQuestion, ""), LIMITS.lockQuestion),
    lockAnswer: cut(strOr(src.lockAnswer, ""), LIMITS.lockAnswer),
  };
}

/**
 * DB/share response → UI state. Total: an absent field falls back to the demo
 * copy — except photos and the letter, which stay empty so a page made before
 * they existed does not grow a stranger's photos or someone else's letter.
 */
export function dbToRechargeData(db: Raw | null | undefined): RechargeData {
  const src = obj(db);
  const sub = obj(src.subscriber);
  const cur = obj(src.currentPlan);
  const cash = obj(src.cashback);
  const promos = strList(src.promos, []);

  const merged = {
    subscriber: {
      name: str(sub.name, DEMO_DATA.subscriber.name),
      number: str(sub.number, DEMO_DATA.subscriber.number),
      circle: strOr(sub.circle, DEMO_DATA.subscriber.circle),
    },
    sender: { name: strOr(obj(src.sender).name, "") },
    currentPlan: {
      expiresIn: str(cur.expiresIn, DEMO_DATA.currentPlan.expiresIn),
      note: strOr(cur.note, DEMO_DATA.currentPlan.note),
    },
    promos: promos.length ? promos : DEMO_DATA.promos,
    categories: src.categories ?? DEMO_DATA.categories,
    plans: Array.isArray(src.plans) && src.plans.length ? src.plans : DEMO_DATA.plans,
    cashback: {
      title: str(cash.title, DEMO_DATA.cashback.title),
      note: str(cash.title, "") ? strOr(cash.note, "") : DEMO_DATA.cashback.note,
    },
    receipt: { message: strList(obj(src.receipt).message, DEMO_DATA.receipt.message) },
    photos: parseLovePhotos(src.photos, []),
    letter: strOr(src.letter, ""),
    lockQuestion: strOr(src.lockQuestion, ""),
    lockAnswer: strOr(src.lockAnswer, ""),
  };
  return normalizeData(merged as unknown as RechargeData);
}
