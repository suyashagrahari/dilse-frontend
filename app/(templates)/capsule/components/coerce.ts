// ─── Capsule — wire coercion ─────────────────────────────────────────────────
//
// Two legitimate payload shapes come back from `/capsule-pages/share/:shareId`,
// and conflating them is EXACTLY how sealed content leaks:
//
//   before opensOn → the server builds a fresh object with counts + authorship
//                    and nothing else. No `predictions`, no `context`.
//   after  opensOn → the whole document.
//
// `dbToCapsuleView` decides which it got FROM THE PAYLOAD, and when it decides
// "sealed" it returns a `SealedCapsuleView` — a type with no prediction field on
// it at all. It deliberately does NOT fabricate `predictions: []` to make
// downstream code simpler: a component handed this object cannot leak text
// because the text is not in the process.
//
// Nothing here throws. A capsule sealed today has to open in 2027, and a
// coercer that dies on an unfamiliar shape is how a capsule 404s on the one day
// somebody waited a year for.

import { obj, str, strOr, num, clampNum, type Raw } from "@/lib/wire";
import {
  LIMITS,
  PAYLOAD_VERSION,
  migrate,
  type Capsule,
  type CapsuleContext,
  type CapsuleStatus,
  type CapsuleView,
  type Confidence,
  type OpenCapsuleView,
  type Person,
  type Prediction,
  type Resolution,
  type SealedCapsuleView,
  type Side,
  type Verdict,
} from "./types";

const STATUSES: CapsuleStatus[] = ["writing", "sealed", "opening", "judged"];

const asSide = (v: unknown): Side | null => (v === "a" || v === "b" ? v : null);

const asConfidence = (v: unknown): Confidence =>
  clampNum(v, 3, 1, 5) as Confidence;

const asVerdict = (v: unknown): Verdict | undefined =>
  v === "right" || v === "wrong" ? v : undefined;

const asResolution = (v: unknown): Resolution | undefined =>
  v === "right" || v === "wrong" || v === "disputed" ? v : undefined;

const asStatus = (v: unknown): CapsuleStatus =>
  STATUSES.includes(v as CapsuleStatus) ? (v as CapsuleStatus) : "writing";

/** A timezone we can hand to `Intl` without it throwing. Never the device's. */
const asTimezone = (v: unknown): string => {
  const tz = str(v, "UTC");
  try {
    new Intl.DateTimeFormat("en-GB", { timeZone: tz }).format(0);
    return tz;
  } catch {
    return "UTC";
  }
};

const asPerson = (v: unknown, slot: Side): Person => {
  const src = obj(v);
  return {
    id: str(src.id, slot).slice(0, 64),
    name: strOr(src.name, "").slice(0, LIMITS.name),
    photoUrl: strOr(src.photoUrl, "").slice(0, 2000),
  };
};

const asContextSide = (v: unknown): CapsuleContext => {
  const src = obj(v);
  return {
    city: strOr(src.city, "").slice(0, LIMITS.city),
    writtenAt: strOr(src.writtenAt, ""),
    oneLineAboutNow: strOr(src.oneLineAboutNow, "").slice(0, LIMITS.oneLine),
  };
};

/**
 * Per-author cap, matching the server. Ids are deduped because the judging
 * screen keys its cards off them — two cards with the same key are two cards
 * React cannot tell apart.
 */
function asPredictions(v: unknown): Prediction[] {
  if (!Array.isArray(v)) return [];
  const counts: Record<Side, number> = { a: 0, b: 0 };
  const used = new Set<string>();
  const out: Prediction[] = [];

  for (const item of v.slice(0, 200)) {
    const src = obj(item);
    const author = asSide(src.author);
    if (!author) continue;
    if (counts[author] >= LIMITS.maxPredictions) continue;
    const text = strOr(src.text, "").slice(0, LIMITS.predictionText).trim();
    if (!text) continue;

    const candidate = str(src.id, "").slice(0, 64).trim();
    let id = candidate && !used.has(candidate) ? candidate : `p${out.length + 1}`;
    let n = out.length + 1;
    while (used.has(id)) id = `p${++n}`;
    used.add(id);

    const p: Prediction = {
      id,
      author,
      text,
      confidence: asConfidence(src.confidence),
      isWildcard: src.isWildcard === true,
    };
    const verdictA = asVerdict(src.verdictA);
    const verdictB = asVerdict(src.verdictB);
    const resolved = asResolution(src.resolved);
    if (verdictA) p.verdictA = verdictA;
    if (verdictB) p.verdictB = verdictB;
    if (resolved) p.resolved = resolved;

    counts[author]++;
    out.push(p);
  }
  return out;
}

/**
 * The full document. Only ever called on a payload the SERVER decided was past
 * its open date — never speculatively, and never as a fallback for a sealed
 * response that happened to look odd.
 */
export function dbToCapsule(raw: Record<string, unknown>): Capsule {
  const src: Raw = obj(raw);
  const pair = obj(src.pair);
  const context = obj(src.context);

  return {
    // An older capsule keeps its own version. Readers switch on it; they do not
    // rewrite it. `migrate` never throws.
    version: migrate({ version: num(src.version, PAYLOAD_VERSION) }),
    pair: { a: asPerson(pair.a, "a"), b: asPerson(pair.b, "b") },
    sealedOn: strOr(src.sealedOn, ""),
    opensOn: strOr(src.opensOn, ""),
    timezone: asTimezone(src.timezone),
    stake: strOr(src.stake, "").slice(0, LIMITS.stake),
    context: { a: asContextSide(context.a), b: asContextSide(context.b) },
    predictions: asPredictions(src.predictions),
    status: asStatus(src.status),
    ...(strOr(src.openedAt, "") ? { openedAt: strOr(src.openedAt, "") } : {}),
  };
}

/**
 * Build the sealed view from scratch — the same discipline the server uses.
 *
 * `counts` comes from the server's own tally when it sent one. When it did not
 * we count AUTHORS off whatever array is present; we never read `.text`, and
 * the returned object has nowhere to put it if we did.
 */
function sealedViewFrom(src: Raw): SealedCapsuleView {
  const pair = obj(src.pair);
  const counts = obj(src.counts);

  let a = num(counts.a, -1);
  let b = num(counts.b, -1);
  if (a < 0 || b < 0) {
    a = 0;
    b = 0;
    if (Array.isArray(src.predictions)) {
      for (const item of src.predictions) {
        const side = asSide(obj(item).author);
        if (side === "a") a++;
        else if (side === "b") b++;
      }
    }
  }

  const view: SealedCapsuleView = {
    state: "sealed",
    version: migrate({ version: num(src.version, PAYLOAD_VERSION) }),
    pair: { a: asPerson(pair.a, "a"), b: asPerson(pair.b, "b") },
    sealedOn: strOr(src.sealedOn, ""),
    opensOn: strOr(src.opensOn, ""),
    timezone: asTimezone(src.timezone),
    stake: strOr(src.stake, "").slice(0, LIMITS.stake),
    counts: { a: Math.max(0, Math.trunc(a)), b: Math.max(0, Math.trunc(b)) },
  };

  const amendUntil = strOr(src.amendUntil, "");
  if (amendUntil) view.amendUntil = amendUntil;
  return view;
}

/**
 * THE function the share viewer calls.
 *
 * `state: "sealed"` wins over everything. If a future server regression ever
 * ships prediction text alongside a sealed marker, this still returns a view
 * with no field to render it into, and the leak stops here rather than on the
 * recipient's screen.
 */
export function dbToCapsuleView(raw: Record<string, unknown>): CapsuleView {
  const src: Raw = obj(raw);

  if (src.state === "sealed" || !Array.isArray(src.predictions)) {
    return sealedViewFrom(src);
  }

  const open: OpenCapsuleView = { state: "open", capsule: dbToCapsule(src) };
  return open;
}

// ─── Editor → wire ───────────────────────────────────────────────────────────

/** The nine content fields the server allow-lists. Nothing else is sent. */
export function capsuleToBody(c: Capsule, password?: string): Record<string, unknown> {
  return {
    version: c.version,
    pair: c.pair,
    sealedOn: c.sealedOn,
    opensOn: c.opensOn,
    timezone: c.timezone,
    stake: c.stake,
    context: c.context,
    predictions: c.predictions,
    status: c.status,
    ...(c.openedAt ? { openedAt: c.openedAt } : {}),
    ...(password ? { password } : {}),
  };
}

/**
 * The client-side mirror of the server's projection, used by the demo preview
 * so that even the gallery never holds prediction text on the sealed path.
 * Constructs a NEW object; it does not delete keys off a copy.
 */
export function projectSealed(c: Capsule, amendUntil?: string): SealedCapsuleView {
  let a = 0;
  let b = 0;
  for (const p of c.predictions) {
    if (p.author === "a") a++;
    else b++;
  }
  const view: SealedCapsuleView = {
    state: "sealed",
    version: c.version,
    pair: {
      a: { id: c.pair.a.id, name: c.pair.a.name, photoUrl: c.pair.a.photoUrl },
      b: { id: c.pair.b.id, name: c.pair.b.name, photoUrl: c.pair.b.photoUrl },
    },
    sealedOn: c.sealedOn,
    opensOn: c.opensOn,
    timezone: c.timezone,
    stake: c.stake,
    counts: { a, b },
  };
  if (amendUntil) view.amendUntil = amendUntil;
  return view;
}
