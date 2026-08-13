export type RakhiCharm = "om" | "swastik" | "evil-eye" | "heart" | "star";

export interface RakhiDesign {
  threadColorA: string;
  threadColorB: string;
  beadColor: string;
  charm: RakhiCharm;
  pendantText: string;
}

export interface Memory {
  imageUrl: string;
  caption: string;
  year: string;
}

export interface LedgerRow {
  label: string;
  value: string;
}

export interface Shagun {
  upiId: string;
  qrImageUrl: string;
  note: string;
}

export interface RakhiData {
  brotherName: string;
  sisterName: string;
  city: string;
  photoUrl: string;
  greeting: string[];
  rakhi: RakhiDesign;
  memories: Memory[];
  ledger: LedgerRow[];
  shagun: Shagun;
  vachan: string;
  distanceKm: number;
  festivalDate: string;
}

export interface Toast {
  id: number;
  type: "success" | "publish" | "error" | "info";
  title: string;
  message?: string;
  shareUrl?: string;
}

export type EditMode = null | "manual" | "choose" | "preview";

/** Editor state → request body. The server re-validates all of this. */
export function rakhiDataToBody(d: RakhiData, password: string) {
  return {
    brotherName: d.brotherName,
    sisterName: d.sisterName,
    city: d.city,
    photoUrl: d.photoUrl,
    greeting: d.greeting,
    rakhi: d.rakhi,
    memories: d.memories,
    ledger: d.ledger,
    shagun: d.shagun,
    distanceKm: d.distanceKm,
    festivalDate: d.festivalDate,
    password,
  };
}

export const DEFAULT_RAKHI: RakhiDesign = {
  threadColorA: "#9B2226",
  threadColorB: "#E8913A",
  beadColor: "#B08D57",
  charm: "om",
  pendantText: "",
};

/**
 * Shown in the builder before she has typed anything.
 *
 * Deliberately obviously-a-placeholder: a name in angle brackets and a ledger
 * row that is plainly a joke. A default that looks like real content is the
 * reason people publish pages still carrying it.
 */
export const SAMPLE: RakhiData = {
  brotherName: "Bhai",
  sisterName: "",
  city: "",
  photoUrl: "",
  greeting: [
    "Every year I tie this thread.",
    "Every year it means the same thing.",
    "You are stuck with me. Forever.",
  ],
  rakhi: DEFAULT_RAKHI,
  memories: [],
  ledger: [
    { label: "chocolates owed", value: "47" },
    { label: "times you tore my homework", value: "12" },
    { label: "times you covered for me", value: "every time" },
  ],
  shagun: { upiId: "", qrImageUrl: "", note: "" },
  vachan: "",
  distanceKm: 0,
  festivalDate: "2026-08-28",
};

/** Server document → the shape every screen reads. Tolerates missing fields. */
export function dbToRakhiData(d: Record<string, unknown> | null | undefined): RakhiData {
  const o = (d || {}) as Record<string, unknown>;
  const r = (o.rakhi || {}) as Record<string, unknown>;
  const s = (o.shagun || {}) as Record<string, unknown>;
  const str = (v: unknown, fb = "") => (typeof v === "string" ? v : fb);

  return {
    brotherName: str(o.brotherName) || "Bhai",
    sisterName: str(o.sisterName),
    city: str(o.city),
    photoUrl: str(o.photoUrl),
    greeting: Array.isArray(o.greeting) ? o.greeting.map((l) => str(l)).filter(Boolean) : [],
    rakhi: {
      threadColorA: str(r.threadColorA, DEFAULT_RAKHI.threadColorA),
      threadColorB: str(r.threadColorB, DEFAULT_RAKHI.threadColorB),
      beadColor: str(r.beadColor, DEFAULT_RAKHI.beadColor),
      charm: (["om", "swastik", "evil-eye", "heart", "star"] as const).includes(
        r.charm as RakhiCharm
      )
        ? (r.charm as RakhiCharm)
        : "om",
      pendantText: str(r.pendantText),
    },
    memories: Array.isArray(o.memories)
      ? o.memories
          .map((m) => {
            const mm = (m || {}) as Record<string, unknown>;
            return { imageUrl: str(mm.imageUrl), caption: str(mm.caption), year: str(mm.year) };
          })
          .filter((m) => m.imageUrl)
      : [],
    ledger: Array.isArray(o.ledger)
      ? o.ledger
          .map((l) => {
            const ll = (l || {}) as Record<string, unknown>;
            return { label: str(ll.label), value: str(ll.value) };
          })
          .filter((l) => l.label)
      : [],
    shagun: { upiId: str(s.upiId), qrImageUrl: str(s.qrImageUrl), note: str(s.note) },
    vachan: str(o.vachan),
    distanceKm: Number(o.distanceKm) || 0,
    festivalDate: /^\d{4}-\d{2}-\d{2}$/.test(str(o.festivalDate)) ? str(o.festivalDate) : "2026-08-28",
  };
}

// ─── Muhurat ─────────────────────────────────────────────────────────────────
//
// Raksha Bandhan 2026 falls on Friday 28 August. The auspicious window that
// morning is roughly 05:57–09:48 IST — Bhadra ends before sunrise that year, so
// the whole morning is clear.
//
// These are held as DATA, not asserted in logic, because panchang timings vary
// by a few minutes between almanacs and by location. Getting them slightly wrong
// must never be able to break anything, which is why `muhuratState` below is
// purely informational and no caller is allowed to gate on it.

export const MUHURAT = {
  /** 05:57 IST → UTC. IST is UTC+5:30 and has no DST. */
  startIso: "2026-08-28T00:27:00.000Z",
  /** 09:48 IST → UTC. */
  endIso: "2026-08-28T04:18:00.000Z",
} as const;

export type MuhuratPhase = "before" | "during" | "after";

export interface MuhuratState {
  phase: MuhuratPhase;
  /** Ready to render. Never null. */
  label: string;
}

/**
 * `now` is passed in rather than read here.
 *
 * Reading the clock inside a component's render is impure — React may render
 * twice and get two different answers, and `react-hooks/purity` fails the build
 * for it. The caller stamps the time in an effect and ticks it.
 */
export function muhuratState(now: number): MuhuratState {
  const start = new Date(MUHURAT.startIso).getTime();
  const end = new Date(MUHURAT.endIso).getTime();

  if (now < start) return { phase: "before", label: `Rakhi can be tied in ${gap(start - now)}` };
  if (now <= end) return { phase: "during", label: `Shubh muhurat. ${gap(end - now)} remaining.` };
  return { phase: "after", label: "The muhurat has passed. Tie it anyway." };
}

/** "4h 12m", "2d 6h", "9m". Coarse on purpose — seconds would be a stopwatch. */
function gap(ms: number): string {
  const mins = Math.max(0, Math.floor(ms / 60000));
  const days = Math.floor(mins / 1440);
  const hours = Math.floor((mins % 1440) / 60);
  const m = mins % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${m}m`;
  return `${m}m`;
}

/** "1,847 km away" — only rendered when she actually entered a distance. */
export function distanceLine(km: number): string | null {
  if (!km || km <= 0) return null;
  return `tied from ${km.toLocaleString("en-IN")} km away`;
}
