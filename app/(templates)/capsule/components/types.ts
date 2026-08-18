// ─── Capsule — the frozen contract ───────────────────────────────────────────
//
// LEAD-OWNED AND FROZEN. Import from here; do not extend it.
//
// A capsule sealed today has to still work in March 2027. That outlives this
// schema, this hosting, and probably a rewrite — so the stored payload carries
// a `version` and every reader must tolerate an older one. See PAYLOAD_VERSION.
//
// TWO PROPERTIES ARE THE PRODUCT:
//
//   1. THE SEAL IS REAL. Nothing written can be read, edited, or inferred
//      before `opensOn` — not by the partner, not by the author, and not by
//      opening devtools. This is enforced in the TYPE system here and again on
//      the server. A sealed capsule's client-side shape is `SealedCapsuleView`,
//      which HAS NO PREDICTION TEXT ON IT AT ALL. There is no field to leak.
//      The server's `/capsule-pages/share/:shareId` returns counts and
//      authorship only until server time passes `opensOn`.
//
//   2. NO COPY ASSUMES THE COUPLE IS STILL TOGETHER. A capsule opened a year
//      later may be opened alone, or by people who have separated. Every string
//      in COPY is written to survive that, and `assertNeutralCopy` checks it.

// ═══════════════════════════════════════════════════════════════════════════
// Versioning — a capsule must outlive its schema
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Bump on any breaking change to the stored shape. Readers switch on it.
 * A capsule sealed at v1 must still open at v4 — that is the whole promise.
 *
 * TODO(ops): a monthly job should load every unopened capsule, run it through
 * `migrate`, and alert on any that fail. A capsule that silently 404s on the
 * day someone waited a year for is the worst failure this product can produce.
 */
export const PAYLOAD_VERSION = 1;

// ═══════════════════════════════════════════════════════════════════════════
// Stored shape
// ═══════════════════════════════════════════════════════════════════════════

export type Side = "a" | "b";

export interface Person {
  id: string;
  name: string;
  photoUrl: string;
}

/** 1..5. The stake weight. Higher confidence wins or loses more. */
export type Confidence = 1 | 2 | 3 | 4 | 5;

export type Verdict = "right" | "wrong";
export type Resolution = "right" | "wrong" | "disputed";

export interface Prediction {
  id: string;
  author: Side;
  /** Max 90 chars. Must not overflow the card or shrink below 16px. */
  text: string;
  confidence: Confidence;
  /** The deliberately absurd one. Scores zero either way. One per author. */
  isWildcard: boolean;
  verdictA?: Verdict;
  verdictB?: Verdict;
  resolved?: Resolution;
}

/** Captured at writing time. The gap between then and now is the payload. */
export interface CapsuleContext {
  city: string;
  /** ISO. */
  writtenAt: string;
  /** "we were still figuring it out" */
  oneLineAboutNow: string;
}

export type CapsuleStatus = "writing" | "sealed" | "opening" | "judged";

export interface Capsule {
  version: number;
  pair: { a: Person; b: Person };
  /** ISO. */
  sealedOn: string;
  /** ISO. Server time decides eligibility, never the device. */
  opensOn: string;
  /** IANA. One per pair, set at creation. */
  timezone: string;
  /** Max 120 chars. Both must agree before sealing. */
  stake: string;
  context: { a: CapsuleContext; b: CapsuleContext };
  predictions: Prediction[];
  status: CapsuleStatus;
  openedAt?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// The sealed view — what a client is allowed to hold before opensOn
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Note what is absent: `predictions`, `context`, and every string either
 * partner wrote. A component rendering this cannot leak the contents because
 * the contents are not in the process.
 *
 * `counts` and `stake` are deliberately present — the waiting screen has to
 * reward a visit, and "Arjun has written 4 predictions" gives it something to
 * say without giving anything away.
 */
export interface SealedCapsuleView {
  state: "sealed";
  version: number;
  pair: { a: Person; b: Person };
  sealedOn: string;
  opensOn: string;
  timezone: string;
  stake: string;
  counts: { a: number; b: number };
  /** Whether the 24h amend window is still open, and for how much longer. */
  amendUntil?: string;
}

export interface OpenCapsuleView {
  state: "open";
  capsule: Capsule;
}

export type CapsuleView = SealedCapsuleView | OpenCapsuleView;

// ═══════════════════════════════════════════════════════════════════════════
// Time lock
// ═══════════════════════════════════════════════════════════════════════════

/**
 * The ONLY clock permitted to decide opening eligibility.
 *
 * TODO(server-time): replace with a server timestamp captured at load plus a
 * monotonic offset. Until then a user who moves their phone clock forward can
 * reach the opening screen early — but they still cannot read anything, because
 * the server refuses to send prediction text until ITS clock passes `opensOn`.
 * That is the layer that actually matters, and it is already correct.
 */
export function getServerTime(): number {
  return Date.now();
}

export function isOpenable(opensOn: string, now = getServerTime()): boolean {
  const t = Date.parse(opensOn);
  return !Number.isNaN(t) && now >= t;
}

/** The 24h amend window after sealing. Prevents regret without losing finality. */
export const AMEND_WINDOW_MS = 24 * 3_600_000;

/**
 * After the window closes, editing is impossible. There is no admin path and no
 * "just this once" — this function is the only gate, and nothing else in the
 * template may write to `predictions` once it returns false.
 *
 * Edge case from the spec: if `opensOn` is less than 24h from sealing, the
 * window is skipped entirely rather than allowing edits past the open date.
 */
export function canAmend(c: Pick<Capsule, "sealedOn" | "opensOn">, now = getServerTime()): boolean {
  const sealed = Date.parse(c.sealedOn);
  const opens = Date.parse(c.opensOn);
  if (Number.isNaN(sealed)) return false;
  const closes = Number.isNaN(opens)
    ? sealed + AMEND_WINDOW_MS
    : Math.min(sealed + AMEND_WINDOW_MS, opens);
  return now < closes;
}

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** True once opensOn has passed. Never produces negative time. */
  done: boolean;
}

/** "247 days · 04:22:11". Clamped at zero — an overdue capsule is just open. */
export function countdownTo(opensOn: string, now = getServerTime()): Countdown {
  const t = Date.parse(opensOn);
  const left = Number.isNaN(t) ? 0 : Math.max(0, t - now);
  if (left === 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  return {
    days: Math.floor(left / 86_400_000),
    hours: Math.floor(left / 3_600_000) % 24,
    minutes: Math.floor(left / 60_000) % 60,
    seconds: Math.floor(left / 1000) % 60,
    done: false,
  };
}

/** How worn the capsule looks. Drives the wax crack / glow / tremble. */
export type CapsuleWear = "fresh" | "cracking" | "glowing" | "trembling" | "ready";

export function wearFor(opensOn: string, now = getServerTime()): CapsuleWear {
  const { days, done } = countdownTo(opensOn, now);
  if (done) return "ready";
  if (days <= 1) return "trembling";
  if (days <= 7) return "glowing";
  if (days <= 30) return "cracking";
  return "fresh";
}

/** "14 March 2027". Display only, in the pair's zone. */
export function fmtSealDate(iso: string, timezone: string): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "";
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(t));
  } catch {
    return new Date(t).toISOString().slice(0, 10);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Writing
// ═══════════════════════════════════════════════════════════════════════════

export const LIMITS = {
  predictionText: 90,
  stake: 120,
  city: 60,
  oneLine: 140,
  name: 80,
  minPredictions: 4,
  maxPredictions: 8,
} as const;

/** Words, not numbers. The label IS the weight, as far as the writer knows. */
export const CONFIDENCE_LABELS: Record<Confidence, string> = {
  1: "hunch",
  2: "likely",
  3: "confident",
  4: "certain",
  5: "betting on it",
};

/** Shown 3 at a time, shuffled, to defuse the blank page. */
export const PROMPTS = [
  "who says sorry first next time",
  "which of us moves cities",
  "will we still argue about the same thing",
  "what will we be doing exactly one year from now",
  "who gets the promotion",
  "will the hoodie be returned",
  "which of us changes their mind about something big",
  "what will still be exactly the same",
] as const;

/** A capsule cannot seal until both sides clear this. Never an error state. */
export function canSeal(
  predictions: Prediction[],
  stake: string,
): { ok: boolean; reason?: string } {
  const a = predictions.filter((p) => p.author === "a").length;
  const b = predictions.filter((p) => p.author === "b").length;
  if (a < LIMITS.minPredictions || b < LIMITS.minPredictions) {
    return { ok: false, reason: COPY.needMore };
  }
  if (!stake.trim()) return { ok: false, reason: COPY.needStake };
  return { ok: true };
}

// ═══════════════════════════════════════════════════════════════════════════
// Judging
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Alternate authors until one runs out, then continue with the rest.
 * Never pad — a 5-vs-8 split reveals 5 alternating pairs then Arjun's last 3.
 */
export function revealOrder(predictions: Prediction[]): Prediction[] {
  const a = predictions.filter((p) => p.author === "a");
  const b = predictions.filter((p) => p.author === "b");
  const out: Prediction[] = [];
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i]) out.push(a[i]);
    if (b[i]) out.push(b[i]);
  }
  return out;
}

/**
 * Match → that verdict. Mismatch → DISPUTED.
 *
 * Disputed is a first-class outcome and the funniest one the data can produce.
 * It is not an error, it is not a tie-break, and nothing in the UI may present
 * it as a failure to resolve.
 */
export function resolve(p: Prediction): Resolution | undefined {
  if (!p.verdictA || !p.verdictB) return undefined;
  return p.verdictA === p.verdictB ? p.verdictA : "disputed";
}

/** Normalised so "Will the hoodie be returned?" matches "will the hoodie be returned". */
export const normalise = (s: string): string =>
  s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, "").replace(/\s+/g, " ").trim();

export interface TwinPair {
  a: Prediction;
  b: Prediction;
}

/** Both wrote the same thing. A lovely moment — shown together, once. */
export function findTwins(predictions: Prediction[]): TwinPair[] {
  const byText = new Map<string, Prediction[]>();
  for (const p of predictions) {
    const k = normalise(p.text);
    if (!k) continue;
    byText.set(k, [...(byText.get(k) ?? []), p]);
  }
  const twins: TwinPair[] = [];
  for (const group of byText.values()) {
    const a = group.find((p) => p.author === "a");
    const b = group.find((p) => p.author === "b");
    if (a && b) twins.push({ a, b });
  }
  return twins;
}

// ═══════════════════════════════════════════════════════════════════════════
// Scoring
// ═══════════════════════════════════════════════════════════════════════════

export interface Scorecard {
  a: number;
  b: number;
  disputed: number;
  wildcards: number;
  /** Loser owes the stake. Null on a draw — nobody owes anything. */
  owedBy: { side: Side; name: string } | null;
  /** The single most confidently-wrong prediction. The funniest line available. */
  highlight: { prediction: Prediction; authorName: string; label: string } | null;
}

/**
 * Sum of confidence weights for correct predictions, minus HALF the weight for
 * confidently-wrong ones. Disputed and wildcards score zero in both directions.
 *
 * "Confidently wrong" is the whole joke, so the penalty scales with how sure
 * they were: being wrong at "hunch" costs 0.5, at "betting on it" costs 2.5.
 */
export function scoreCapsule(c: Capsule): Scorecard {
  let a = 0;
  let b = 0;
  let disputed = 0;
  let wildcards = 0;
  let worst: Prediction | null = null;

  for (const p of c.predictions) {
    const r = p.resolved ?? resolve(p);
    if (p.isWildcard) {
      wildcards++;
      continue;
    }
    if (r === "disputed") {
      disputed++;
      continue;
    }
    if (r === "right") {
      if (p.author === "a") a += p.confidence;
      else b += p.confidence;
    } else if (r === "wrong") {
      const penalty = p.confidence / 2;
      if (p.author === "a") a -= penalty;
      else b -= penalty;
      if (!worst || p.confidence > worst.confidence) worst = p;
    }
  }

  a = Math.round(a * 10) / 10;
  b = Math.round(b * 10) / 10;

  const owedBy =
    a === b ? null : a > b ? { side: "b" as Side, name: c.pair.b.name } : { side: "a" as Side, name: c.pair.a.name };

  return {
    a,
    b,
    disputed,
    wildcards,
    owedBy,
    highlight: worst
      ? {
          prediction: worst,
          authorName: c.pair[worst.author].name,
          label: CONFIDENCE_LABELS[worst.confidence],
        }
      : null,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// The opening ceremony
// ═══════════════════════════════════════════════════════════════════════════

export const TIMING = {
  /** Predictions folding into a capsule at seal time. */
  foldMs: 800,
  /** The wax pressing down. Hard THUNK, 3px page jolt. */
  sealPressMs: 400,
  /** Seal cracking open: two halves split, particle burst, paper unfurls. */
  crackMs: 1200,
  /** A beat between judged cards. Do not let them speed-run it. */
  betweenCardsMs: 600,
  /** The stamp landing. */
  stampMs: 300,
  /** Partner-presence poll. TODO(realtime): replace with a socket. */
  presencePollMs: 2000,
  /** After this long alone, offer to open it alone. Never leave them stuck. */
  aloneValveMs: 15 * 60_000,
} as const;

export type OpeningPhase =
  | "waiting"
  | "countdown"
  | "cracking"
  | "context"
  | "judging"
  | "scorecard"
  /** Opened alone: predictions and context, quietly. No judging, no score. */
  | "solo"
  | "declined";

/** Judging buttons, and everything else touchable. */
export const TAP_TARGET_PX = 48;

// ═══════════════════════════════════════════════════════════════════════════
// Palette — aged paper and wax
// ═══════════════════════════════════════════════════════════════════════════

export const PALETTE = {
  paper: "#f9f5eb",
  paperDeep: "#f2ebdb",
  edge: "#ddd2ba",
  ink: "#221d18",
  inkSoft: "#655d50",
  inkFaint: "#a1978440",
  /** The one wax red. */
  wax: "#8f2d24",
  waxDeep: "#6d211a",
  /** Disputed. Amber, and deliberately the warmest colour on the card. */
  amber: "#b57a1e",
  amberWash: "#f7ecd6",
  /** A resolved-right stamp. Muted, never a success green. */
  right: "#4c6b4a",
} as const;

/** Prediction text. */
export const SERIF = "var(--font-tinos), Georgia, 'Times New Roman', serif";
/** Dates, confidence labels, scores. Nothing else. */
export const MONO = "var(--font-courier-prime), ui-monospace, 'SF Mono', Menlo, monospace";
export const UI = "var(--font-outfit), system-ui, sans-serif";

// ═══════════════════════════════════════════════════════════════════════════
// Copy — audited, and written to survive a breakup
// ═══════════════════════════════════════════════════════════════════════════

export const COPY = {
  needMore: `each of you needs at least ${LIMITS.minPredictions} before it can seal.`,
  needStake: "agree on a stake first.",
  sealedUntil: (d: string) => `sealed until ${d}.`,
  amendOpen: "you can still change yours for a while.",
  amendClosed: "locked. that was the point.",
  peek: "nice try.",
  waitingFor: (name: string) => `waiting for ${name}…`,
  openAlone: "open it alone",
  decline: "I don't want to open this",
  /** Closes it without deleting. It stays exactly as it was. */
  declined: "it's still here. nothing was deleted.",
  contextLead: (city: string, line: string) =>
    `One year ago, you were in ${city}. You wrote: "${line}"`,
  disputed: "you two remember this differently.",
  bothSaid: "you both said this.",
  wildcard: "wildcard — scores nothing, as intended.",
  sealAnother: "seal another",
  /** The scorecard's funniest line. */
  highlight: (name: string, label: string, text: string) =>
    `${name} was "${label}" that ${text}`,
} as const;

/**
 * No string may assume the relationship still exists.
 *
 * Run over every value in COPY plus the sender-authored stake at build time.
 * The banned constructions are the ones that read as cruel to someone opening
 * this alone in 2027 — possessives about the couple, future-tense promises,
 * and anything that treats "together" as a given.
 */
export function assertNeutralCopy(strings: string[]): string[] {
  const banned = [
    /\byour (relationship|marriage|partner forever)\b/i,
    /\bstill together\b/i,
    /\bforever\b/i,
    /\bhappily ever after\b/i,
    /\bthe two of you will\b/i,
    /\byour future together\b/i,
    /\bcongratulations on\b/i,
  ];
  return strings.filter((s) => banned.some((re) => re.test(s)));
}

/** Migrate an older stored payload forward. Never throws — a capsule must open. */
export function migrate(raw: Partial<Capsule> & { version?: number }): Capsule["version"] {
  // v1 is current. Future versions add cases here and MUST leave v1 readable.
  return typeof raw.version === "number" ? raw.version : 1;
}
