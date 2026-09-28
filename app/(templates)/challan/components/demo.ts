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
import { DEMO_PHOTOS, parseLoveKit, type LoveKitData } from "../../_love/types";
import { CHALLAN_THEME_IDS } from "./themes";

const GIF_CDN = "https://cdn.subhsandesh.in/gifts-media";

/**
 * The reaction GIFs, one per moment: the camera "staring" when the case is
 * settled, the officer typing up the report after the evidence, the hug under the court
 * order. All three are on our own CDN.
 */
export const CHALLAN_DEMO_GIFS = [
  `${GIF_CDN}/templates/legal-notice/unblinking.gif`,
  `${GIF_CDN}/templates/legal-notice/focus-typing.gif`,
  `${GIF_CDN}/assets/court-of-love/penguin-hug.gif`,
];

/** A love kit with nothing in it — what an old page or a fresh form starts from. */
export const EMPTY_KIT: LoveKitData = { photos: [], gifs: [], letter: "", theme: "", lockQuestion: "", lockAnswer: "" };

export type EditMode = null | "choose" | "manual" | "preview";

export interface Toast {
  id: number;
  type: "success" | "info" | "publish";
  title: string;
  message?: string;
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
  // ── Love kit: the CCTV evidence, the reactions, the court order ──
  photos: [
    { ...DEMO_PHOTOS[0], caption: "Sunset Point, 6:48 PM", note: "Subject stopped mid-sentence to point at the sky and said it looked like mango lassi. Officer has not recovered. Officer may never recover." },
    { ...DEMO_PHOTOS[1], caption: "Table 4, date night", note: "Suspect stole fries from the plate opposite, then the heart of the person holding the plate. Both offences clearly on camera. No remorse shown." },
    { ...DEMO_PHOTOS[2], caption: "Cubbon Park signal", note: "Unauthorised smiling in a public park. Cherry trees visibly jealous. Witnesses: four pigeons, all of them on her side." },
    { ...DEMO_PHOTOS[3], caption: "Her balcony, 11:40 PM", note: "Loitering in my future without a permit. Officer recommends no action. Officer recommends forever, actually." },
  ],
  gifs: CHALLAN_DEMO_GIFS,
  letter:
    "Meera,\n\nHaving reviewed every frame of the footage, this officer has one remark for the record, and it has nothing to do with traffic.\n\nYou drove into my life at 11:40 on a Tuesday with momos nobody ordered, parked in my head, and never once looked for the exit. I checked. There isn't one.\n\nSo the challan stands, but the fine is waived. The only sentence this court hands down is a long one: you, me, and every bad movie you insist on finishing.\n\nCase closed. Forever pending.\n\n— K.",
  theme: "patrol",
  lockQuestion: "",
  lockAnswer: "",
};

/**
 * What a fresh Create form starts from: the demo's paperwork and jokes as a
 * scaffold, but never the demo couple's name, address, photos, GIFs or letter —
 * and it keeps the vibe they were just previewing.
 */
export function challanStarter(theme: string): ChallanData {
  return {
    ...DEMO_CHALLAN,
    accused: { ...DEMO_CHALLAN.accused, name: "", address: "" },
    photos: [],
    gifs: [],
    letter: "",
    lockQuestion: "",
    lockAnswer: "",
    theme,
  };
}

/** A required field the form has not got yet. `section` is the form anchor to scroll to. */
export interface MissingField {
  section: "accused" | "offences" | "fine";
  label: string;
}

/** Everything that has to be there before the notice can be served. */
export function challanMissing(d: ChallanData): MissingField[] {
  const out: MissingField[] = [];
  if (!d.accused.name.trim()) out.push({ section: "accused", label: "who it's for (their name)" });
  if (!d.offences.some((o) => o.description.trim())) out.push({ section: "offences", label: "at least one offence" });
  if (!d.totalFine.trim()) out.push({ section: "fine", label: "the total fine" });
  return out;
}

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
    photos: data.photos,
    gifs: data.gifs,
    letter: data.letter,
    theme: data.theme,
    lockQuestion: data.lockQuestion,
    lockAnswer: data.lockAnswer,
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
    // Pages made before the love kit have none of these; they fall back to an
    // empty kit (no photos, no letter, the default theme), never the demo couple.
    ...parseLoveKit(d, EMPTY_KIT, CHALLAN_THEME_IDS),
  };
}

export default DEMO_CHALLAN;
