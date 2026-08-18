import { DEMO_MEDIA } from "../assets";

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

/**
 * Editor state → request body. The server re-validates all of this.
 *
 * ── THE `idb:` STRIP ────────────────────────────────────────────────────────
 *
 * A photo she has not published yet is held in IndexedDB and carried here as
 * `idb:<id>`. `useRakhiEditor` uploads every one of those before it calls this,
 * and aborts the publish if any fails, so in the normal path there is nothing
 * to strip.
 *
 * This is the backstop for the abnormal one. A ref that reached the database
 * would be saved as a permanent, unfixable broken image on her brother's page —
 * the id means nothing outside the browser that minted it. Dropping it to an
 * empty string instead means the page renders its illustrated fallback, which is
 * a page missing a photo rather than a page with a hole in it.
 */
const stripLocal = (v: string): string => (v.startsWith("idb:") ? "" : v);

export function rakhiDataToBody(d: RakhiData, password: string) {
  return {
    brotherName: d.brotherName,
    sisterName: d.sisterName,
    city: d.city,
    photoUrl: stripLocal(d.photoUrl),
    greeting: d.greeting,
    rakhi: d.rakhi,
    memories: d.memories
      .map((m) => ({ ...m, imageUrl: stripLocal(m.imageUrl) }))
      // A memory IS its photograph; a caption with no image renders an empty frame.
      .filter((m) => m.imageUrl),
    ledger: d.ledger,
    shagun: { ...d.shagun, qrImageUrl: stripLocal(d.shagun.qrImageUrl) },
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
 * What the builder opens holding — a complete first draft, not an empty form.
 *
 * Every value here is a real, sendable line she can keep, and every one is
 * editable. That is deliberate: a form of empty boxes asks someone to be a
 * writer before they have decided whether to bother, and the drop-off is at the
 * first empty box. A draft asks them to correct something instead, which is a
 * much smaller thing to be asked.
 *
 * ── WHAT IS NOT PREFILLED, AND WHY ──────────────────────────────────────────
 *
 * `sisterName` is hers to state and cannot be guessed. `photoUrl`, `memories`
 * and the whole of `shagun` involve her own photographs and her own bank
 * details — a default there would be another family's face or somebody's UPI ID
 * (see `DEMO` below, which is exactly that and must never be merged with this).
 * `distanceKm` is a fact about them that no default can know.
 *
 * `brotherName` DOES carry "Bhai", because it is a real word a sister uses and
 * a page addressed to "Bhai" is a page, not a placeholder. The form marks it as
 * still-untouched so it cannot be published by accident without her seeing that.
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
  // The pendant is the one visible part of the rakhi itself. Left empty it
  // rendered as a blank brass disc in the middle of the thread, which reads as
  // a missing asset rather than as a choice she has not made yet.
  rakhi: { ...DEFAULT_RAKHI, pendantText: "didi" },
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

/**
 * What the GALLERY PREVIEW renders — not what the builder starts from.
 *
 * These two must not be the same object, and the distinction is the whole point
 * of this constant. `SAMPLE` above is deliberately empty so that a sister who
 * opens the form and publishes without finishing cannot ship a page carrying
 * someone else's face. But feeding that same emptiness to the preview meant
 * every visitor evaluating the template saw a shell: no photo, no memories, no
 * shagun QR, an unnamed sister. Three of the four things this template does
 * were invisible until you had already committed to building one.
 *
 * So: the preview seeds from `DEMO`, the builder seeds from `SAMPLE`, and
 * `useRakhiEditor` keeps them apart. Anything added here must also be a field a
 * real sister can fill, or the preview starts advertising a feature that does
 * not exist.
 *
 * The photographs are one image cropped four ways — see `DEMO_MEDIA`.
 */
export const DEMO: RakhiData = {
  brotherName: "Aarav",
  sisterName: "Meher",
  city: "Jaipur",
  photoUrl: DEMO_MEDIA.hero,
  greeting: [
    "You ate my share of the gulab jamun in 2009.",
    "I have not forgotten. I am still tying this.",
    "That is the entire deal, bhai.",
  ],
  rakhi: {
    threadColorA: "#9B2226",
    threadColorB: "#E8913A",
    beadColor: "#B08D57",
    charm: "evil-eye",
    pendantText: "nazar utaari",
  },
  memories: [
    { imageUrl: DEMO_MEDIA.memories[0], caption: "the knot, as always too tight", year: "2025" },
    { imageUrl: DEMO_MEDIA.memories[1], caption: "pretending he doesn't like this", year: "2024" },
    { imageUrl: DEMO_MEDIA.memories[2], caption: "the bribe, pre-negotiated", year: "2023" },
  ],
  ledger: [
    { label: "chocolates owed", value: "47" },
    { label: "times you tore my homework", value: "12" },
    { label: "times you took the blame anyway", value: "every time" },
    { label: "outstanding balance", value: "unpayable" },
  ],
  shagun: {
    upiId: "meher@upi",
    qrImageUrl: DEMO_MEDIA.qr,
    note: "No rush. Next year is also fine. I will remember though.",
  },
  vachan: "Ghar aaunga. Har baar. Even if it's the 11pm flight.",
  distanceKm: 1180,
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
