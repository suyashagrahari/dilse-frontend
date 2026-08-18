// ─── Challan — demo content and wire mapping ─────────────────────────────────
//
// THE ONE TRAP, RESTATED HERE BECAUSE THIS IS WHERE IT WOULD BE INTRODUCED:
// `totalFine` is free text. "one date" is the demo value. Nothing in this file,
// the controller, or the renderer may Number() it, sum `offences[].fine` into
// it, or format it as currency. Per-offence `fine` IS a number and is printed
// in the table — it is never added up.
//
// The authority is invented end to end. No national emblem, no state insignia,
// no official motto, no real police or transport department, and nothing here
// resembles any government identity document. This is a NOTICE.

import type { ChallanData } from "./types";
import { templateMedia } from "@/lib/templateMedia";

export type EditMode = null | "choose" | "manual" | "preview";

export interface Toast {
  id: number;
  type: "success" | "info" | "publish";
  title: string;
  message?: string;
  shareUrl?: string;
}

export const DEMO_CHALLAN: ChallanData = {
  authority: {
    name: "Department of Heart Traffic",
    department: "Enforcement Wing (Emotional Offences)",
    state: "Republic of Us",
    // Invented. Never the real state motto.
    motto: "हृदय सदैव जागृत",
  },
  challanNo: "KA01/2026/0447",
  // Issued a few days ago; due comfortably ahead so the countdown is visible.
  issuedAt: "2026-08-06T18:11:07.000Z",
  dueAt: "2026-08-21T18:29:59.000Z",
  accused: {
    name: "Meera Sharma",
    address: "3rd Floor, The One With The Balcony, Indiranagar, Bengaluru",
    vehicleNo: "KA 01 LUV 2023",
  },
  officer: {
    name: "K. Sharma",
    id: "4402",
    post: "Sub-Inspector, Heart Traffic",
  },
  location: "Near her house, 11:40 PM",
  evidence: {
    imageUrl:
      templateMedia("challan", "evidence.webp"),
    plateText: "KA 01 LUV 2023",
    // Burned into the frame by the camera. A string, never a Date.
    timestamp: "06/08/2026 23:41:07",
  },
  offences: [
    {
      section: "Sec 12(b), Heart Traffic Act",
      description: "Overspeeding",
      fine: 500,
      note: "into my life, without warning",
    },
    {
      section: "Sec 4(a), Heart Traffic Act",
      description: "Driving without a valid heart licence",
      fine: 1000,
    },
    {
      section: "Sec 19(c), Heart Traffic Act",
      description: "Illegal parking",
      fine: 750,
      note: "in my head, since 2023",
    },
    {
      section: "Sec 27(f), Heart Traffic Act",
      description: "Failure to signal",
      fine: 250,
      note: "left me on read, then turned up",
    },
  ],
  // FREE TEXT. See the header. This is the field that breaks the joke if parsed.
  totalFine: "one date",
  settlement: {
    methods: [
      { id: "date", label: "one date", sub: "you pick the place, I'll pretend to argue" },
      { id: "chai", label: "chai, twice", sub: "the good one near your office" },
      { id: "plan", label: "you plan it this time", sub: "entirely. start to finish." },
      { id: "paid", label: "already paid, emotionally", sub: "settled in instalments since 2023" },
    ],
  },
  paidMessage: [
    "There is no fine, obviously.",
    "You did park in my head in 2023 and you never moved. You turn up at 11:40 at night with food nobody asked for, and you are right about things in a way that should be annoying and somehow isn't.",
    "So: one date. Whenever you're free. I'll be the one who has already decided where we're going and will pretend I haven't.",
  ],
  contestMessage: [
    "Objection upheld, obviously. It was always going to be.",
    "You could have written anything in that box. I'd have withdrawn it anyway — that was the whole point of giving you the box.",
    "Come over. Bring nothing. The matter is closed.",
  ],
};

/* ── Wire mapping ──────────────────────────────────────────────────────────── */

/** Everything the server accepts. Secrets and ids are its business, not ours. */
export function challanDataToBody(data: ChallanData, password?: string): Record<string, unknown> {
  return {
    authority: data.authority,
    challanNo: data.challanNo,
    issuedAt: data.issuedAt,
    dueAt: data.dueAt,
    accused: data.accused,
    officer: data.officer,
    location: data.location,
    evidence: data.evidence,
    offences: data.offences,
    // String on the wire, string in Mongo, string on the page.
    totalFine: data.totalFine,
    settlement: data.settlement,
    paidMessage: data.paidMessage,
    contestMessage: data.contestMessage,
    ...(password ? { password } : {}),
  };
}

const arr = <T,>(v: unknown, fallback: T[]): T[] => (Array.isArray(v) ? (v as T[]) : fallback);
const s = (v: unknown, fallback: string): string => (typeof v === "string" && v ? v : fallback);

export function dbToChallanData(db: Record<string, unknown> | null | undefined): ChallanData {
  const d = (db ?? {}) as Record<string, unknown>;
  const authority = (d.authority ?? {}) as ChallanData["authority"];
  const accused = (d.accused ?? {}) as ChallanData["accused"];
  const officer = (d.officer ?? {}) as ChallanData["officer"];
  const evidence = (d.evidence ?? {}) as ChallanData["evidence"];
  const settlement = (d.settlement ?? {}) as ChallanData["settlement"];

  return {
    authority: {
      name: s(authority.name, DEMO_CHALLAN.authority.name),
      department: s(authority.department, DEMO_CHALLAN.authority.department),
      state: s(authority.state, DEMO_CHALLAN.authority.state),
      motto: s(authority.motto, DEMO_CHALLAN.authority.motto),
    },
    challanNo: s(d.challanNo, DEMO_CHALLAN.challanNo),
    issuedAt: s(d.issuedAt, DEMO_CHALLAN.issuedAt),
    dueAt: s(d.dueAt, DEMO_CHALLAN.dueAt),
    accused: {
      name: s(accused.name, ""),
      address: s(accused.address, ""),
      vehicleNo: s(accused.vehicleNo, DEMO_CHALLAN.accused.vehicleNo),
    },
    officer: {
      name: s(officer.name, DEMO_CHALLAN.officer.name),
      id: s(officer.id, DEMO_CHALLAN.officer.id),
      post: s(officer.post, DEMO_CHALLAN.officer.post),
    },
    location: s(d.location, DEMO_CHALLAN.location),
    evidence: {
      imageUrl: s(evidence.imageUrl, ""),
      plateText: s(evidence.plateText, DEMO_CHALLAN.evidence.plateText),
      timestamp: s(evidence.timestamp, DEMO_CHALLAN.evidence.timestamp),
    },
    offences: arr<ChallanData["offences"][number]>(d.offences, DEMO_CHALLAN.offences),
    // Never coerced, never recomputed from the offence rows.
    totalFine: s(d.totalFine, DEMO_CHALLAN.totalFine),
    settlement: {
      methods: arr<ChallanData["settlement"]["methods"][number]>(
        settlement.methods,
        DEMO_CHALLAN.settlement.methods,
      ),
    },
    paidMessage: arr<string>(d.paidMessage, DEMO_CHALLAN.paidMessage),
    contestMessage: arr<string>(d.contestMessage, DEMO_CHALLAN.contestMessage),
  };
}

export default DEMO_CHALLAN;
