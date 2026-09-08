// ─── Legal Notice — shared type contract ─────────────────────────────────────
// Single source of truth for the shape used by the editor, the served viewer and
// the server payload. Field names here === server model field names === wire
// keys (flat payload), with one exception: the document's lifecycle is `state`
// in the UI and `noticeState` on the wire, because `state` is too generic to sit
// on a Mongoose schema next to `password` and `viewCount`. The two mapping
// functions at the bottom are the only place that seam exists.

export type EditMode = null | "manual" | "preview";

/** How the addressee answered a single demand. */
export type DemandResponse = "pending" | "accepted" | "contested";

/**
 * The 60-character cap is a tone guardrail, not a layout guess. A complaint
 * format will attract real grievances; the cap is what keeps every demand petty
 * and affectionate instead of a paragraph of pain. Enforced in the editor, in
 * `sanitizeDemandText` and again on the server. Do not raise it.
 */
export const DEMAND_TEXT_MAX = 60;
/** One line of grounds. Constraint forces punchiness — the contest is the comedy. */
export const GROUNDS_MAX = 80;
/** Nine demands overflow the page. */
export const MAX_DEMANDS = 8;
export const MAX_RECITALS = 10;

/** The fine-print line the notice must always carry. Product decision, not a disclaimer. */
export const REQUIRED_FINE_PRINT =
  "This notice has no legal effect and is not a substitute for a conversation.";

export interface Demand {
  id: string;
  text: string;
  response: DemandResponse;
  grounds: string;
  complied: boolean;
  /** ISO datetime compliance was recorded. Stamped once, never re-derived from "now". */
  compliedOn: string;
}

export type NoticeLifecycle = "served" | "responded" | "complied" | "final";

export interface Toast {
  id: number;
  type: "success" | "info" | "publish";
  title: string;
  message?: string;
}

export interface NoticeData {
  senderName: string;
  senderCity: string;
  addresseeName: string;
  addresseeCity: string;
  advocateName: string;
  advocateEnrollment: string;
  advocateChamber: string;
  /** e.g. "LN/2026/0447". Also seeds the stamp-paper serial and every deterministic imperfection. */
  refNo: string;
  /** ISO `YYYY-MM-DD`. Empty = "seed with today on mount" (see the editor hook). */
  datedOn: string;
  /** ISO `YYYY-MM-DD` the relationship began. */
  relationshipSince: string;
  /** Numbered paragraphs. Every one begins with "That ". */
  recitals: string[];
  demands: Demand[];
  /** ISO datetime. Drives the countdown and the self-firing FINAL NOTICE. */
  complianceDeadline: string;
  escalationClause: string;
  finePrint: string[];
  state: NoticeLifecycle;
}

// ─── Formatting helpers — the house style IS the realism ─────────────────────

const ONES = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
  "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
  "seventeen", "eighteen", "nineteen",
];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

/** Spell a small integer. Returns "" outside 0–999 — callers then leave the numeral alone. */
export function numberToWords(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 999) return "";
  if (n < 20) return ONES[n];
  if (n < 100) {
    const t = TENS[Math.floor(n / 10)];
    const o = n % 10;
    return o ? `${t}-${ONES[o]}` : t;
  }
  const h = `${ONES[Math.floor(n / 100)]} hundred`;
  const r = n % 100;
  return r ? `${h} and ${numberToWords(r)}` : h;
}

/**
 * "on 27 occasions" → "on 27 (twenty-seven) occasions".
 *
 * Every numeral in an Indian legal notice is followed by the word in brackets.
 * It is the thing everyone recognises and nobody can name, so it is applied at
 * render rather than trusted to whatever the sender typed. Dates (14.03.2023),
 * reference numbers (LN/2026/0447), four-digit years and numerals that are
 * already bracketed are all left alone.
 */
export function numeralize(text: string): string {
  return text.replace(/\d+/g, (m: string, offset: number) => {
    if (m.length > 2) return m; // years, ref numbers
    const before = text[offset - 1] ?? "";
    const after = text[offset + m.length] ?? "";
    if (/[./\-:\d,]/.test(before)) return m; // 14.03…, LN/2026…
    if (/[./\-:\d]/.test(after)) return m;
    if (/^\s*\(/.test(text.slice(offset + m.length))) return m; // already "7 (seven)"
    const w = numberToWords(parseInt(m, 10));
    return w ? `${m} (${w})` : m;
  });
}

/** ISO (or anything Date can parse) → DD.MM.YYYY. Empty input → "". */
export function fmtDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}`;
}

/** `YYYY-MM-DD` for a Date, in local time (never `toISOString`, which shifts a day). */
export function isoDay(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Add days to an ISO day string and return a full ISO datetime (end of that day). */
export function addDaysIso(isoDate: string, days: number): string {
  const base = new Date(isoDate.length <= 10 ? `${isoDate}T00:00:00` : isoDate);
  if (Number.isNaN(base.getTime())) return "";
  base.setDate(base.getDate() + days);
  base.setHours(23, 59, 59, 999);
  return base.toISOString();
}

/** Every recital in this format opens with "That ". Normalise, never reject. */
export function normalizeRecital(raw: string): string {
  const t = raw.trim().replace(/\s+/g, " ");
  if (!t) return "";
  if (/^that\s/i.test(t)) return "That " + t.slice(5).trimStart();
  return "That " + t.charAt(0).toLowerCase() + t.slice(1);
}

export const sanitizeDemandText = (s: string): string => s.slice(0, DEMAND_TEXT_MAX);

/** Small stable hash. Every "imperfection" on the page is derived from this so the
 *  same notice always looks identically imperfect — a random one looks generated. */
export function hashRef(refNo: string): number {
  let h = 2166136261;
  for (let i = 0; i < refNo.length; i++) {
    h ^= refNo.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/** The row of tiny serial digits along the bottom of the stamp-paper band. */
export function serialFromRef(refNo: string): string {
  const h = hashRef(refNo || "LN");
  let s = "";
  let x = h;
  for (let i = 0; i < 14; i++) {
    // Math.imul is signed — without the abs, half the "digits" print as minus signs.
    x = Math.abs(Math.imul(x, 48271) + 11) % 2147483647;
    s += String(x % 10);
    if (i === 3 || i === 8) s += " ";
  }
  return s;
}

// ─── Derived state ───────────────────────────────────────────────────────────

/** A demand nobody has to do anything more about. */
const isResolved = (d: Demand) =>
  d.response === "contested" || (d.response === "accepted" && d.complied);

/**
 * The self-firing escalation. FINAL once the stipulated period has lapsed and
 * the notice is not fully resolved. `nowMs === null` means "not mounted yet" —
 * never fire on the server, or SSR and hydration disagree.
 */
export function isFinalState(data: NoticeData, nowMs: number | null): boolean {
  if (nowMs === null) return false;
  if (!data.complianceDeadline) return false;
  const dl = Date.parse(data.complianceDeadline);
  if (Number.isNaN(dl)) return false;
  if (nowMs <= dl) return false;
  return !(data.demands.length > 0 && data.demands.every(isResolved));
}

export function deriveLifecycle(data: NoticeData, nowMs: number | null): NoticeLifecycle {
  if (data.demands.length > 0 && data.demands.every(isResolved)) return "complied";
  if (isFinalState(data, nowMs)) return "final";
  return data.demands.some((d) => d.response !== "pending") ? "responded" : "served";
}

export interface ComplianceSummary {
  satisfied: number;
  /** Demands that *could* be satisfied — total minus contested. Zero when everything
   *  is contested, which is why the strip reads "0 of 0 satisfied" and never divides. */
  satisfiable: number;
  contested: number;
  pending: number;
}

export function complianceSummary(demands: Demand[]): ComplianceSummary {
  const contested = demands.filter((d) => d.response === "contested").length;
  return {
    satisfied: demands.filter((d) => d.response === "accepted" && d.complied).length,
    satisfiable: demands.length - contested,
    contested,
    pending: demands.filter((d) => d.response === "pending").length,
  };
}

/** Never negative, never NaN. Returns null when there is no usable deadline. */
export function formatRemaining(deadline: string, nowMs: number | null): string | null {
  if (nowMs === null || !deadline) return null;
  const dl = Date.parse(deadline);
  if (Number.isNaN(dl)) return null;
  const ms = Math.max(0, dl - nowMs);
  if (ms === 0) return "period lapsed";
  const p = (n: number) => String(n).padStart(2, "0");
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return d > 0 ? `${d}d ${p(h)}h remaining` : `${p(h)}h ${p(m)}m ${p(s)}s remaining`;
}

// ─── Demo seed ───────────────────────────────────────────────────────────────

let demandSeq = 0;
export const newDemandId = (): string =>
  `d${Date.now().toString(36)}${(demandSeq++).toString(36)}`;

/**
 * The seed demands are written in HER voice, on purpose. Every other template in
 * this product implicitly casts the boyfriend as the sender; this one corrects
 * that. The template itself stays usable by any pairing — nothing below is
 * gendered, only the point of view is.
 */
const SEED_DEMANDS: string[] = [
  "one (1) date, planned by you, not me",
  "reply within 30 minutes or state reasons in writing",
  "return of hoodie (grey, mine, since March)",
  'cease and desist from saying "whatever you want"',
];

/** The remaining seed demands, offered as one-tap presets in the editor. */
export const DEMAND_PRESETS: string[] = [
  ...SEED_DEMANDS,
  "one (1) apology, unprompted",
  "stop being nice to your ex on her stories",
  "no phone at dinner. any dinner.",
  "text back before you fall asleep",
];

export const ESCALATION_DEFAULT =
  "That in the event of your failure to comply within the stipulated period, my client shall be constrained to escalate this matter to your mother, without further notice, and you shall be responsible for all consequences arising therefrom.";

/** The clause that replaces the escalation clause once the period has lapsed. */
export function escalatedClause(deadline: string): string {
  const on = fmtDate(deadline) || "the said date";
  return `That the stipulated period having lapsed, this matter has been escalated to your mother on ${on}, as previously intimated.`;
}

export const FINE_PRINT_DEFAULT: string[] = [
  "Issued without prejudice to any other rights or remedies",
  "Service deemed effected on delivery of the message",
  "Emotional damages, if any, to be settled in kind",
  REQUIRED_FINE_PRINT,
];

export const DEMO_DATA: NoticeData = {
  senderName: "Ananya",
  senderCity: "Bengaluru",
  addresseeName: "Rohan",
  addresseeCity: "Bengaluru",
  advocateName: "R. K. Sharma",
  advocateEnrollment: "KAR/0447/2023",
  advocateChamber: "Chamber No. 4, Heartbreak Complex, Bengaluru",
  refNo: "LN/2026/0447",
  // Empty on purpose. The editor hook seeds today + seven days on mount, so the
  // demo is never born already-expired and SSR never disagrees with hydration.
  datedOn: "",
  relationshipSince: "2023-03-14",
  recitals: [
    "That my client and yourself have been in a relationship since 14.03.2023, a fact not in dispute.",
    'That you have, on 27 occasions, responded to a direct question with the words "whatever you want".',
    "That my client has, on 3 separate occasions, been left on read for a period exceeding 6 hours.",
    "That the grey hoodie belonging to my client remains in your custody since March 2023, notwithstanding repeated oral demands.",
  ],
  demands: SEED_DEMANDS.map((text, i) => ({
    id: `seed-${i}`,
    text,
    response: "pending" as DemandResponse,
    grounds: "",
    complied: false,
    compliedOn: "",
  })),
  complianceDeadline: "",
  escalationClause: ESCALATION_DEFAULT,
  finePrint: FINE_PRINT_DEFAULT,
  state: "served",
};

// ─── Wire mapping ────────────────────────────────────────────────────────────

export function legalNoticeDataToBody(data: NoticeData, password?: string): Record<string, unknown> {
  const body: Record<string, unknown> = {
    senderName: data.senderName,
    senderCity: data.senderCity,
    addresseeName: data.addresseeName,
    addresseeCity: data.addresseeCity,
    advocateName: data.advocateName,
    advocateEnrollment: data.advocateEnrollment,
    advocateChamber: data.advocateChamber,
    refNo: data.refNo,
    datedOn: data.datedOn,
    relationshipSince: data.relationshipSince,
    recitals: data.recitals.map(normalizeRecital).filter(Boolean),
    demands: data.demands.slice(0, MAX_DEMANDS).map((d) => ({
      id: d.id,
      text: sanitizeDemandText(d.text),
      response: d.response,
      grounds: d.grounds.slice(0, GROUNDS_MAX),
      complied: d.complied,
      compliedOn: d.compliedOn,
    })),
    complianceDeadline: data.complianceDeadline,
    escalationClause: data.escalationClause,
    finePrint: data.finePrint,
    noticeState: data.state,
  };
  if (password !== undefined) body.password = password;
  return body;
}

const LIFECYCLES: NoticeLifecycle[] = ["served", "responded", "complied", "final"];

export function dbToLegalNoticeData(db: Record<string, unknown> | null | undefined): NoticeData {
  const src = db ?? {};
  const s = (k: string, fallback: string): string =>
    typeof src[k] === "string" && src[k] !== "" ? (src[k] as string) : fallback;

  const rawDemands = Array.isArray(src.demands) ? (src.demands as Record<string, unknown>[]) : [];
  const demands: Demand[] = rawDemands.slice(0, MAX_DEMANDS).map((d, i) => {
    const response: DemandResponse =
      d?.response === "accepted" || d?.response === "contested" ? d.response : "pending";
    return {
      id: typeof d?.id === "string" && d.id ? d.id : `db-${i}`,
      text: typeof d?.text === "string" ? sanitizeDemandText(d.text) : "",
      response,
      grounds: response === "contested" && typeof d?.grounds === "string" ? d.grounds : "",
      complied: response === "accepted" && d?.complied === true,
      compliedOn:
        response === "accepted" && d?.complied === true && typeof d?.compliedOn === "string"
          ? d.compliedOn
          : "",
    };
  });

  const recitals = Array.isArray(src.recitals)
    ? (src.recitals as string[]).map(normalizeRecital).filter(Boolean)
    : DEMO_DATA.recitals;

  const finePrint = Array.isArray(src.finePrint) && src.finePrint.length
    ? (src.finePrint as string[])
    : DEMO_DATA.finePrint;

  return {
    senderName: s("senderName", DEMO_DATA.senderName),
    senderCity: s("senderCity", DEMO_DATA.senderCity),
    addresseeName: s("addresseeName", DEMO_DATA.addresseeName),
    addresseeCity: s("addresseeCity", DEMO_DATA.addresseeCity),
    advocateName: s("advocateName", DEMO_DATA.advocateName),
    advocateEnrollment: s("advocateEnrollment", DEMO_DATA.advocateEnrollment),
    advocateChamber: s("advocateChamber", DEMO_DATA.advocateChamber),
    refNo: s("refNo", DEMO_DATA.refNo),
    datedOn: s("datedOn", ""),
    relationshipSince: s("relationshipSince", DEMO_DATA.relationshipSince),
    recitals: recitals.length ? recitals : DEMO_DATA.recitals,
    demands: demands.length ? demands : DEMO_DATA.demands,
    complianceDeadline: s("complianceDeadline", ""),
    escalationClause: s("escalationClause", DEMO_DATA.escalationClause),
    finePrint: finePrint.some((l) => l.toLowerCase().includes("no legal effect"))
      ? finePrint
      : [...finePrint, REQUIRED_FINE_PRINT],
    state: LIFECYCLES.includes(src.noticeState as NoticeLifecycle)
      ? (src.noticeState as NoticeLifecycle)
      : "served",
  };
}

// ─── Response endpoint (viewer → server, no auth) ────────────────────────────
/** Body POSTed to `/legal-notice-pages/share/:shareId/respond`. */
export interface RecordResponseBody {
  demandId: string;
  response?: DemandResponse;
  grounds?: string;
  complied?: boolean;
  /** "counter" routes into the counter-notice. Reserved — not filed by this build. */
  notice?: "primary" | "counter";
}
