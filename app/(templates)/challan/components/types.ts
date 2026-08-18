// ─── Challan — frozen data contract ──────────────────────────────────────────
//
// A parody e-challan. The recipient does not READ this document, they SETTLE it:
// pay it or contest it. The notice is the setup; the settlement flow is the
// template.
//
// ── THE LINE THIS FILE EXISTS TO HOLD ────────────────────────────────────────
//
// This is a NOTICE, never an identity document. A parody traffic notice and a
// convincing fake government ID are different legal categories, and only one of
// them is a joke. Nothing in this contract carries a photo of a person beside
// their name and a number in a card layout, because that is what an ID is. The
// evidence photo is a road-camera frame — degraded, timestamped, of a vehicle.
//
// The issuing authority is INVENTED end to end: "Department of Heart Traffic,
// Republic of Us". No national emblem, no state insignia, no official motto, no
// real police or transport-authority seal, no government portal wordmark — not
// in the data, not in the components, not in file names, alt text, or comments.
// Those terms are deliberately absent from this file too, so that a grep for any
// of them across the template returns nothing at all.

/** The invented issuing body. Every field here is fiction and must read as such. */
export interface ChallanAuthority {
  /** "Department of Heart Traffic" */
  name: string;
  /** "Enforcement Wing (Emotional Offences)" */
  department: string;
  /** "Republic of Us" — a place that does not exist. */
  state: string;
  /** Devanagari-styled INVENTED motto. Never a real national or state motto. */
  motto: string;
}

export interface ChallanAccused {
  name: string;
  address: string;
  /** A joke plate: "KA 01 LUV 2023". Never a real-format plate tied to a real person. */
  vehicleNo: string;
}

export interface ChallanOfficer {
  name: string;
  /** Invented badge id. Four digits, no real force's numbering. */
  id: string;
  /** "Sub-Inspector, Heart Traffic" */
  post: string;
}

/**
 * The camera frame.
 *
 * `imageUrl` is rendered deliberately degraded — grayscale, raised contrast,
 * scanlines, a hair of blur. A clean photo in this box makes the whole page read
 * as a graphic; a bad one makes it read as a scan. The degradation is the build.
 */
export interface ChallanEvidence {
  imageUrl: string;
  /** Shown in the cropped "NUMBER PLATE" inset, large monospace. */
  plateText: string;
  /** Burned into the frame's corner: "14/03/2026 23:41:07". Not parsed. */
  timestamp: string;
}

export interface ChallanOffence {
  /** Invented statute: "Sec 12(b), Heart Traffic Act". Never a real IPC/MVA section. */
  section: string;
  description: string;
  /**
   * Per-offence fine. A NUMBER here is fine — it is never summed into
   * `totalFine`, which is free text. Render it, do not arithmetic it.
   */
  fine: number;
  /** Optional aside, rendered 11px italic beneath the description. */
  note?: string;
}

export interface ChallanSettlementMethod {
  id: string;
  label: string;
  sub?: string;
}

export interface ChallanData {
  authority: ChallanAuthority;
  /** "KA01/2026/0447". Also seeds the deterministic Courier character jitter. */
  challanNo: string;
  /** ISO 8601. */
  issuedAt: string;
  /**
   * ISO 8601. May already be in the past on load — that is a supported state,
   * not an error. See the OVERDUE rules in the renderer.
   */
  dueAt: string;
  accused: ChallanAccused;
  officer: ChallanOfficer;
  /** "Near her house, 11:40 PM" */
  location: string;
  evidence: ChallanEvidence;
  offences: ChallanOffence[];
  /**
   * FREE TEXT, AND THE ONE TRAP IN THIS CONTRACT.
   *
   * "one date" is a valid total. Never `Number()` it, never `parseFloat` it,
   * never sum `offences[].fine` into it, never compare it, never format it as
   * currency. It is a string that gets printed. `Number("one date")` is `NaN`
   * and `NaN` on a challan is the one bug that makes the joke stop working.
   */
  totalFine: string;
  settlement: { methods: ChallanSettlementMethod[] };
  /** The sincere payload, shown after payment. Serif, outside the document. */
  paidMessage: string[];
  /** The sincere payload, shown after the objection is upheld. */
  contestMessage: string[];
}

/**
 * Which screen the recipient is on.
 *
 * Deliberately one union rather than a pile of booleans: "paid" and "contested"
 * are mutually exclusive terminal states, and a boolean pair would permit both
 * at once. `settled` is what browser-back must land on rather than replaying the
 * payment — see the back-navigation rule.
 */
export type ChallanScreen =
  | "lookup"
  | "fetching"
  | "notice"
  | "payment"
  | "processing"
  | "receipt"
  | "contest"
  | "forwarding"
  | "verdict";

/** The mandatory disclaimer. Rendered legibly on screen AND in the exported PNG. */
export const CHALLAN_DISCLAIMER =
  "This is not a government document. It has no legal effect and cannot be enforced by any authority.";

/** Grounds cap on the objection textarea. */
export const OBJECTION_MAX = 200;

/** What prints on the verdict when somebody submits an empty objection. */
export const OBJECTION_NOT_STATED = "not stated. Upheld anyway.";
