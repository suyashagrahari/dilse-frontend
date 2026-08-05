// ─── Court Marriage Certificate — shared type contract ───────────────────────
// Single source of truth for the shape shared by the editor, the published
// viewer and the server payload. Field names here === server model field names
// === wire-format keys (flat payload). Keep them in sync.

export type EditMode = null | "manual" | "preview";

export interface Toast {
  id: number;
  type: "success" | "info" | "publish";
  title: string;
  message?: string;
  shareUrl?: string;
}

/** One of the two people being registered. */
export interface Party {
  name: string;
  age: number;
  city: string;
}

/** One dot-leader row in the middle block of the certificate. */
export interface CertField {
  label: string;
  value: string;
}

/** A witness slot. `signaturePath` empty = an unsigned, blank ruled line. */
export interface Witness {
  name: string;
  /** SVG path data drawn in a 0 0 160 48 viewBox. Empty string = not yet signed. */
  signaturePath: string;
}

/**
 * Explicit lifecycle so the (later) witness-signature-collection flow can drop
 * in without a migration: a certificate sits in `awaiting_witnesses` until all
 * three slots are signed, then flips to `registered`.
 */
export type CertificateState = "draft" | "awaiting_witnesses" | "registered";

export const CERTIFICATE_STATES: CertificateState[] = ["draft", "awaiting_witnesses", "registered"];

export interface CertificateData {
  partyA: Party;
  partyB: Party;
  /** Couple photo. Data URL or same-origin path — a cross-origin URL blanks in the PNG export. */
  photoUrl: string | null;
  /** e.g. "RH/2026/004402". Also the deterministic seed for every ink jitter. */
  certificateNo: string;
  /** ISO `YYYY-MM-DD`. Stored as a string so it never shifts across timezones. */
  registeredOn: string;
  knownSinceDays: number;
  /** 4–6 dot-leader rows. Rendered verbatim, in order. */
  fields: CertField[];
  /** Always length 3 on the certificate; unsigned slots render a blank ruled line. */
  witnesses: Witness[];
  /** Static — the Marriage Officer's hand never changes. */
  registrarSignaturePath: string;
  /** Rendered as the clerk's margin annotation beside the dot-leader block. */
  objectionCount: number;
  certificateState: CertificateState;
}

/** The Marriage Officer's hand. Deliberately fixed — a registrar signs the same way every time. */
export const REGISTRAR_SIGNATURE =
  "M4,38 C10,14 17,6 21,17 C25,28 19,40 15,33 C11,26 22,12 36,15 C50,18 44,37 38,33 C32,29 45,11 59,17 C67,20 62,35 69,33 C80,30 74,10 88,14 C101,18 92,37 103,35 C116,32 109,11 124,15 C137,19 132,33 128,31 C124,29 133,22 141,25 C147,27 150,32 156,24";

const WITNESS_HANDS = [
  "M6,34 C12,12 20,9 23,20 C26,31 18,38 16,31 C14,24 27,14 40,19 C50,23 44,36 39,32 C34,28 47,15 60,21 C70,26 63,36 72,33 C84,29 79,13 93,19 C104,24 96,36 108,33 C120,30 116,16 130,22 C140,26 138,32 152,27",
  "M8,31 C16,10 26,8 28,21 C30,34 20,39 18,30 C16,21 32,13 46,20 C57,26 48,37 43,31 C38,25 54,16 66,24 C74,29 68,35 78,32 C90,28 86,14 99,21 C110,27 100,35 112,34 C126,33 122,18 136,24 C145,28 146,31 154,26",
  "M5,36 C13,13 21,7 25,18 C29,29 21,39 17,32 C13,25 25,13 39,17 C52,21 46,38 40,34 C34,30 48,13 61,19 C71,24 64,37 74,34 C87,30 81,12 95,17 C107,21 98,37 110,35 C123,33 117,14 131,20 C142,25 140,33 155,25",
];

/** Deterministic per-witness hand so a demo never re-rolls signatures between renders. */
export const witnessHand = (i: number) => WITNESS_HANDS[i % WITNESS_HANDS.length];

export const DEMO_DATA: CertificateData = {
  partyA: { name: "Ananya Iyer", age: 26, city: "Bengaluru" },
  partyB: { name: "Rohan Mehta", age: 28, city: "Bengaluru" },
  photoUrl: null,
  certificateNo: "RH/2026/004402",
  registeredOn: "2026-03-14",
  knownSinceDays: 847,
  fields: [
    { label: "Known to each other since", value: "847 days" },
    { label: "Fights survived", value: "27" },
    { label: "Objections received", value: "4" },
    { label: "Objections upheld", value: "0" },
  ],
  witnesses: [
    { name: "Kabir Sen", signaturePath: WITNESS_HANDS[0] },
    { name: "Meera Nair", signaturePath: WITNESS_HANDS[1] },
    { name: "", signaturePath: "" },
  ],
  registrarSignaturePath: REGISTRAR_SIGNATURE,
  objectionCount: 4,
  certificateState: "registered",
};

/** Always exactly three witness columns — unsigned slots are part of the design. */
export const WITNESS_SLOTS = 3;

export function padWitnesses(list: Witness[] | undefined | null): Witness[] {
  const src = Array.isArray(list) ? list.slice(0, WITNESS_SLOTS) : [];
  while (src.length < WITNESS_SLOTS) src.push({ name: "", signaturePath: "" });
  return src;
}

// ─── Deterministic ink jitter ────────────────────────────────────────────────
// Every Courier value gets a tiny rotation. It MUST be identical on every render
// (screen, re-render, and the html-to-image export capture), so it is derived
// from a hash of the certificate number plus a stable per-field key — never from
// Math.random() and never from array order.

function hash32(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

/** Stable pseudo-random in [0,1) for a (seed, key) pair. */
export function seededUnit(seed: string, key: string): number {
  let h = hash32(`${seed}::${key}`);
  // one mulberry32 step for a better spread than the raw hash
  h = (h + 0x6d2b79f5) >>> 0;
  let t = h;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** Deterministic rotation in [-0.4deg, 0.4deg] for a typed value. */
export function inkRotation(seed: string, key: string): number {
  return Math.round((seededUnit(seed, key) * 0.8 - 0.4) * 100) / 100;
}

// ─── Formatting helpers ──────────────────────────────────────────────────────

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const ordinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
};

/** "2026-03-14" → { day: "14th", month: "March", year: "2026" }. Robust to junk input. */
export function splitRegisteredOn(iso: string): { day: string; month: string; year: string } {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || ""));
  if (!m) return { day: "—", month: "—", year: "—" };
  const day = Number(m[3]);
  const month = MONTHS[Number(m[2]) - 1] ?? "—";
  return { day: ordinal(day), month, year: m[1] };
}

/** Filename-safe slug for the PNG download. */
export const fileSlug = (s: string) =>
  (s || "party").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "party";

// ─── Wire format ─────────────────────────────────────────────────────────────

export const COURT_MARRIAGE_CONTENT_KEYS: (keyof CertificateData)[] = [
  "partyA",
  "partyB",
  "photoUrl",
  "certificateNo",
  "registeredOn",
  "knownSinceDays",
  "fields",
  "witnesses",
  "registrarSignaturePath",
  "objectionCount",
  "certificateState",
];

/** UI state → flat body sent to POST/PUT. `password` optional (empty = no gate). */
export function courtMarriageDataToBody(data: CertificateData, password?: string): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  for (const k of COURT_MARRIAGE_CONTENT_KEYS) body[k] = data[k];
  if (password !== undefined) body.password = password;
  return body;
}

const num = (v: unknown, fallback: number): number => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const party = (v: unknown, fallback: Party): Party => {
  const src = (v ?? {}) as Record<string, unknown>;
  return {
    name: typeof src.name === "string" ? src.name : fallback.name,
    age: num(src.age, fallback.age),
    city: typeof src.city === "string" ? src.city : fallback.city,
  };
};

/** DB/share response → UI state (fills any missing field from DEMO_DATA). */
export function dbToCourtMarriageData(db: Record<string, unknown> | null | undefined): CertificateData {
  const src = db ?? {};
  const s = (k: string, fallback: string) => (typeof src[k] === "string" ? (src[k] as string) : fallback);

  const rawFields = Array.isArray(src.fields) ? (src.fields as unknown[]) : null;
  const fields: CertField[] = rawFields
    ? rawFields
        .map((f) => {
          const o = (f ?? {}) as Record<string, unknown>;
          return { label: typeof o.label === "string" ? o.label : "", value: typeof o.value === "string" ? o.value : "" };
        })
        .filter((f) => f.label.trim().length > 0)
    : DEMO_DATA.fields;

  const rawW = Array.isArray(src.witnesses) ? (src.witnesses as unknown[]) : [];
  const witnesses = padWitnesses(
    rawW.map((w) => {
      const o = (w ?? {}) as Record<string, unknown>;
      return {
        name: typeof o.name === "string" ? o.name : "",
        signaturePath: typeof o.signaturePath === "string" ? o.signaturePath : "",
      };
    }),
  );

  const state = s("certificateState", DEMO_DATA.certificateState) as CertificateState;

  return {
    partyA: party(src.partyA, DEMO_DATA.partyA),
    partyB: party(src.partyB, DEMO_DATA.partyB),
    photoUrl: typeof src.photoUrl === "string" && src.photoUrl.trim() ? src.photoUrl : null,
    certificateNo: s("certificateNo", DEMO_DATA.certificateNo),
    registeredOn: s("registeredOn", DEMO_DATA.registeredOn),
    knownSinceDays: num(src.knownSinceDays, DEMO_DATA.knownSinceDays),
    fields: fields.length ? fields.slice(0, 6) : DEMO_DATA.fields,
    witnesses,
    registrarSignaturePath: s("registrarSignaturePath", REGISTRAR_SIGNATURE) || REGISTRAR_SIGNATURE,
    objectionCount: num(src.objectionCount, DEMO_DATA.objectionCount),
    certificateState: CERTIFICATE_STATES.includes(state) ? state : "registered",
  };
}
