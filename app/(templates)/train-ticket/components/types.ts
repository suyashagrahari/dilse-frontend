// ─── Train Ticket — shared type contract ─────────────────────────────────────
// Single source of truth for the shape shared by the editor, the published
// viewer and the server payload. Field names here === server model field names
// === wire-format keys. Keep them in sync.
//
// LEGAL: every mark, code and wordmark in this template is invented. The issuing
// authority is the fictional "Indian Hearts Railway (IHRCTC)". Nothing here
// references a real carrier, ticketing portal or state emblem.

export type EditMode = null | "manual" | "preview";

export type Screen = "pnr" | "ticket" | "route";

export interface Toast {
  id: number;
  type: "success" | "info" | "publish";
  title: string;
  message?: string;
  shareUrl?: string;
}

export type Gender = "M" | "F" | "X";

export interface Passenger {
  name: string;
  age: number;
  gender: Gender;
  /** What it was booked as — "WL 47". */
  bookingStatus: string;
  /** What it resolved to — "CNF". */
  currentStatus: string;
  coach: string;
  seat: string;
  berth: string;
}

export interface FareLine {
  label: string;
  /** Prose, not currency — "2 years of waiting", "PRICELESS". */
  value: string;
}

export type StationStatus = "passed" | "current" | "upcoming";

export interface Station {
  name: string;
  /** Optional parenthetical — "unscheduled stop". */
  label: string;
  /** ISO timestamp, or "" when the stop has no date. */
  at: string;
  /** Right-aligned detail — "dep 14 Mar 2023, 02:11" | "27 times". */
  detail: string;
  status: StationStatus;
}

export interface Place {
  code: string;
  name: string;
}

export interface TicketData {
  pnr: string;
  trainNo: string;
  trainName: string;
  from: Place;
  to: Place;
  /** ISO — the real date they next meet. Drives the boarding countdown. */
  departureAt: string;
  /** ISO — printed as the arrival time. */
  arrivalAt: string;
  /** ISO — THE GATE. Before this, nothing is revealed. "" = already prepared. */
  chartPreparedAt: string;
  classCode: string;
  quota: string;
  passengers: Passenger[];
  fare: FareLine[];
  stations: Station[];
  delay: { amount: string; reason: string };
  finePrint: string[];
  /** The sincere payload, shown last, under the slip. */
  letter: string;
}

/**
 * Server-side truth about the chart gate. Before `chartPreparedAt` the shared
 * endpoint sends `chartPrepared:false`, an EMPTY passenger array and an empty
 * letter — the names and seats are never transmitted. `passengerCount` is the
 * only thing that survives so the wait screen can say how many are booked.
 */
export interface ChartGate {
  chartPrepared: boolean;
  passengerCount: number;
}

// ─── Demo data ───────────────────────────────────────────────────────────────
// Fixed ISO strings (never `Date.now()`) so server and client render identically
// and nothing hydration-mismatches.

export const DEMO_DATA: TicketData = {
  pnr: "4402 8891",
  trainNo: "20232",
  trainName: "US EXPRESS",
  from: { code: "BLR", name: "Bengaluru" },
  to: { code: "TRC", name: "Your Terrace" },
  departureAt: "2026-12-24T17:41:00.000Z", // 23:11 IST, 24 Dec 2026
  arrivalAt: "2026-12-25T02:20:00.000Z", // 07:50 IST, 25 Dec 2026
  chartPreparedAt: "2024-03-14T00:00:00.000Z", // in the past → demo shows the reveal
  classCode: "3A",
  quota: "TATKAL",
  passengers: [
    {
      name: "KIRAN R",
      age: 27,
      gender: "F",
      bookingStatus: "WL 47",
      currentStatus: "CNF",
      coach: "S4",
      seat: "41",
      berth: "SIDE LOWER",
    },
    {
      name: "AMAN K",
      age: 28,
      gender: "M",
      bookingStatus: "WL 48",
      currentStatus: "CNF",
      coach: "S4",
      seat: "42",
      berth: "SIDE UPPER",
    },
  ],
  fare: [
    { label: "Ticket Fare", value: "2 years of waiting" },
    { label: "Reservation Charge", value: "every 3 a.m. goodnight" },
    { label: "Superfast Charge", value: "worth it" },
    { label: "IHRCTC Convenience Fee", value: "₹0.00" },
    { label: "Total Fare", value: "PRICELESS" },
  ],
  stations: [
    { name: "Kaha Ho Junction", label: "", at: "2023-03-13T20:41:00.000Z", detail: "dep 14 Mar 2023, 02:11", status: "passed" },
    { name: "Pehli Mulaqat", label: "", at: "2023-04-02T13:10:00.000Z", detail: "dep 02 Apr 2023, 18:40", status: "passed" },
    { name: "Ladai Halt", label: "unscheduled stop", at: "", detail: "27 times", status: "passed" },
    { name: "Long Distance Ghat", label: "", at: "", detail: "current location", status: "current" },
    { name: "Ghar Pe Milna", label: "", at: "", detail: "expected Dec 2026", status: "upcoming" },
    { name: "Terminus", label: "", at: "", detail: "no ETA. no rush.", status: "upcoming" },
  ],
  delay: { amount: "4 months", reason: "circumstances beyond our control" },
  finePrint: [
    "Passengers are advised to reach the platform 30 minutes prior to departure. I have been on this platform since March 2023.",
    "This ticket is non-transferable. Obviously.",
    "Valid only with photo ID. Your face is on file.",
    "In case of cancellation, no refund shall be admissible. I'm not cancelling.",
    "The Indian Hearts Railway accepts no liability for tears shed on arrival.",
    "Unreserved passengers may not board. There is exactly one seat next to mine and it has your name printed on it.",
  ],
  letter:
    "I know a ticket is a strange way to say this.\n\nBut every time I have checked a PNR in the last two years it was because of you — because of a train that would eventually put me in the same room as you. I have refreshed that page more times than I would like to admit.\n\nThis one is confirmed. Coach S4, seats together, and no more waitlist.\n\nSee you on the platform.",
};

/** Whitelisted keys that make up the flat wire payload (= the server content fields). */
export const TICKET_CONTENT_KEYS: (keyof TicketData)[] = [
  "pnr",
  "trainNo",
  "trainName",
  "from",
  "to",
  "departureAt",
  "arrivalAt",
  "chartPreparedAt",
  "classCode",
  "quota",
  "passengers",
  "fare",
  "stations",
  "delay",
  "finePrint",
  "letter",
];

/** UI state → flat body sent to POST/PUT. `password` optional (empty = no gate). */
export function trainTicketDataToBody(data: TicketData, password?: string): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  for (const k of TICKET_CONTENT_KEYS) body[k] = data[k];
  if (password !== undefined) body.password = password;
  return body;
}

const asPlace = (v: unknown, fb: Place): Place => {
  const s = (v ?? {}) as Record<string, unknown>;
  const code = typeof s.code === "string" ? s.code : "";
  const name = typeof s.name === "string" ? s.name : "";
  return code || name ? { code, name } : fb;
};

/**
 * DB / share response → UI state.
 *
 * Arrays are taken verbatim when present (an EMPTY array is a legitimate answer,
 * notably the redacted passenger list before the chart is prepared — falling
 * back to DEMO_DATA there would invent passengers the server refused to send).
 */
export function dbToTrainTicketData(db: Record<string, unknown> | null | undefined): TicketData {
  const src = db ?? {};
  const s = <K extends keyof TicketData>(k: K): TicketData[K] => {
    const v = src[k as string];
    return (typeof v === "string" && v !== "" ? v : DEMO_DATA[k]) as TicketData[K];
  };
  const arr = <T,>(k: string, fb: T[]): T[] => (Array.isArray(src[k]) ? (src[k] as T[]) : fb);
  const delay = (src.delay ?? {}) as Record<string, unknown>;

  return {
    pnr: s("pnr"),
    trainNo: s("trainNo"),
    trainName: s("trainName"),
    from: asPlace(src.from, DEMO_DATA.from),
    to: asPlace(src.to, DEMO_DATA.to),
    departureAt: typeof src.departureAt === "string" ? src.departureAt : DEMO_DATA.departureAt,
    arrivalAt: typeof src.arrivalAt === "string" ? src.arrivalAt : DEMO_DATA.arrivalAt,
    // "" is meaningful here (= chart already prepared) so it is NOT replaced.
    chartPreparedAt: typeof src.chartPreparedAt === "string" ? src.chartPreparedAt : DEMO_DATA.chartPreparedAt,
    classCode: s("classCode"),
    quota: s("quota"),
    passengers: arr<Passenger>("passengers", DEMO_DATA.passengers),
    fare: arr<FareLine>("fare", DEMO_DATA.fare),
    stations: arr<Station>("stations", DEMO_DATA.stations),
    delay: {
      amount: typeof delay.amount === "string" ? delay.amount : DEMO_DATA.delay.amount,
      reason: typeof delay.reason === "string" ? delay.reason : DEMO_DATA.delay.reason,
    },
    finePrint: arr<string>("finePrint", DEMO_DATA.finePrint),
    // "" is meaningful (redacted before the chart) so it is NOT replaced.
    letter: typeof src.letter === "string" ? src.letter : DEMO_DATA.letter,
  };
}

/** Reads the server's chart verdict off a share response. */
export function dbToChartGate(db: Record<string, unknown> | null | undefined): ChartGate {
  const src = db ?? {};
  return {
    chartPrepared: src.chartPrepared !== false,
    passengerCount:
      typeof src.passengerCount === "number"
        ? src.passengerCount
        : Array.isArray(src.passengers)
          ? src.passengers.length
          : 0,
  };
}

// ─── Formatting helpers ──────────────────────────────────────────────────────
// Everything is pinned to Asia/Kolkata so the string is identical on the server
// render and the client render. `toLocaleString` without a timeZone would drift
// and hydration-mismatch.

const IST = "Asia/Kolkata";

const fmt = (iso: string, opts: Intl.DateTimeFormatOptions): string => {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "--";
  return new Intl.DateTimeFormat("en-GB", { timeZone: IST, ...opts }).format(new Date(t));
};

/** "24 Dec 2026" */
export const fmtDate = (iso: string) => fmt(iso, { day: "2-digit", month: "short", year: "numeric" });
/** "24-DEC-2026" — the slip's date-of-journey column. */
export const fmtDateSlip = (iso: string) => fmtDate(iso).replace(/ /g, "-").toUpperCase();
/** "23:11" */
export const fmtTime = (iso: string) => fmt(iso, { hour: "2-digit", minute: "2-digit", hour12: false });
/** "24 Dec 2026, 23:11" */
export const fmtDateTime = (iso: string) => `${fmtDate(iso)}, ${fmtTime(iso)}`;
/** "24-DEC" — the SMS format. */
export const fmtDateSms = (iso: string) => fmt(iso, { day: "2-digit", month: "short" }).replace(/ /g, "-").toUpperCase();

// ─── Derived reveal payload ──────────────────────────────────────────────────

/**
 * The seat allotment line typed in under CNF. THIS is the payload — CNF alone is
 * just a word; "seats 41, 42 · adjacent" is the thing that lands.
 *
 * "ADJACENT" is only claimed when there is genuinely more than one traveller in
 * the same coach — a solo passenger must never be told they are sitting next to
 * themselves.
 */
export function seatAllotmentLine(passengers: Passenger[]): string {
  const rows = passengers.filter((p) => p.coach || p.seat);
  if (rows.length === 0) return "";
  const coaches = Array.from(new Set(rows.map((p) => p.coach).filter(Boolean)));
  const seats = rows.map((p) => p.seat).filter(Boolean);
  const berths = Array.from(new Set(rows.map((p) => p.berth).filter(Boolean)));

  const parts: string[] = [];
  if (coaches.length) parts.push(`COACH ${coaches.join("/")}`);
  if (seats.length) parts.push(`${seats.length > 1 ? "SEATS" : "SEAT"} ${seats.join(", ")}`);
  if (berths.length) parts.push(berths.join(" / ").toUpperCase());
  if (rows.length > 1 && coaches.length === 1) parts.push("ADJACENT");
  return parts.join(" · ");
}

/** The waitlist ladder shown on Screen 1. Seeded from the first passenger's booking status. */
export function statusSequence(passengers: Passenger[]): string[] {
  const booked = passengers[0]?.bookingStatus?.trim();
  const confirmed = passengers[0]?.currentStatus?.trim() || "CNF";
  const head = booked && /^WL/i.test(booked) ? booked.toUpperCase() : "WL 47";
  const n = Number(head.replace(/[^0-9]/g, "")) || 47;
  // Three descending waitlist rungs, then RAC, then the confirmation. Values are
  // derived so a sender who books "WL 12" gets a plausible ladder, not "WL 47".
  const rungs = [n, Math.max(2, Math.round(n * 0.49)), Math.max(1, Math.round(n * 0.17))];
  return [`WL ${rungs[0]}`, `WL ${rungs[1]}`, `WL ${rungs[2]}`, "RAC 4", confirmed.toUpperCase()];
}

/**
 * Gaps between the rungs, in ms. DELIBERATELY IRREGULAR — 900/700/1100/600 with a
 * 400 ms dead hold before the last flip. Even intervals read as a progress bar and
 * kill the tension; these read as a server actually thinking about it.
 */
export const SEQUENCE_GAPS = [900, 700, 1100, 600] as const;
/** The dead beat before CNF lands. The single most important number in the file. */
export const CNF_HOLD_MS = 400;
/** How long the "fetching" spinner sits there before the first rung appears. */
export const FETCH_MS = 1200;

/** The dull, official green a real terminal prints CNF in. Not a success green. */
export const CNF_GREEN = "#1a6b3c";

// ─── SMS copy ────────────────────────────────────────────────────────────────

/** The ticket as the plain text an operator would SMS you. Forwards into chat perfectly. */
export function buildSmsCopy(d: TicketData): string {
  const seatBits = d.passengers
    .map((p) => `${p.coach} ${p.seat} ${p.currentStatus}`.trim())
    .filter(Boolean)
    .join(", ");
  const adjacent =
    d.passengers.length > 1 && new Set(d.passengers.map((p) => p.coach)).size === 1 ? "/ADJACENT" : "";
  const fareTotal = d.fare[d.fare.length - 1]?.value || "PRICELESS";
  const firstFinePrint = (d.finePrint[0] || "").trim();

  return [
    `IHRCTC/PNR ${d.pnr}/${d.trainNo} ${d.trainName}/${fmtDateSms(d.departureAt)}/${d.from.code}-${d.to.name.toUpperCase()}/${d.classCode}/`,
    `${seatBits}${adjacent}/DEP ${fmtTime(d.departureAt)}/Fare ${fareTotal}/`,
    firstFinePrint,
  ]
    .join("\n")
    .trim();
}
