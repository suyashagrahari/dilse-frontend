import { DEMO_MEDIA } from "../assets";

export interface WishRow {
  label: string;
  value: string;
}

export interface Vargani {
  /**
   * Who is collecting — a mandal's name, a building, a flat number.
   *
   * The block used to be headed "For the pandal" for everybody, which is wrong
   * for about half the people who would use it: a sarvajanik mandal collecting
   * for a public pandal and one cousin sending another money for the sweets are
   * both legitimate uses of the same three fields, and "For the pandal" over a
   * personal UPI ID makes the sender look like they are fronting a collection
   * they are not part of. With a name here the heading becomes that name; empty,
   * the block heads itself neutrally.
   */
  title: string;
  upiId: string;
  qrImageUrl: string;
  note: string;
}

export interface GaneshData {
  recipientName: string;
  senderName: string;
  city: string;
  /**
   * The one photograph.
   *
   * Singular, deliberately. The first build also carried up to twelve "years
   * before this one" as a polaroid grid, and it was the heaviest thing in the
   * template for the least return: twelve uploads, twelve crops, twelve captions
   * and a scrolling grid, in a page whose subject is one greeting. One photo, in
   * one gold-ringed frame, is the whole picture story this page needs.
   */
  photoUrl: string;
  /** The lines under the title. Three, occasionally four. */
  greeting: string[];
  /** One line shown alone in the aarti section, while the thali turns. */
  aartiLine: string;
  /** Printed beside the modak, near the end. */
  prasadNote: string;
  /** "Our wishes this year" — label on the left, what is asked on the right. */
  wishes: WishRow[];
  /** Optional. The collection a building or a group runs for its pandal. */
  vargani: Vargani;
  /** What the reader wrote back. Theirs, written once, on their own page. */
  reply: string;
  festivalDate: string;
  visarjanDate: string;
}

export interface Toast {
  id: number;
  type: "success" | "publish" | "error" | "info";
  title: string;
  message?: string;
}

export type EditMode = null | "manual" | "choose" | "preview";

// ─── The offerings ───────────────────────────────────────────────────────────
//
// Five things, named and explained, and that is all they are now.
//
// They used to be a gated five-tap sequence with a full-screen takeover per tap,
// and the reader could not reach the aarti until all five were done. Two things
// were wrong with it. It made a ceremony into a form — you stop looking at the
// tilak and start counting how many screens are left — and it put a modal over
// the page five times in a row, which is the single most interruptive pattern
// available and it was being used for decoration.
//
// So the puja is now a row of five cards you scroll past, each with its own line
// about why it is done. Nothing is gated, nothing is counted, nothing pops up.
// The reader who cares reads five sentences; the reader who does not keeps
// scrolling, which they were going to do anyway.
export const OFFERINGS = [
  {
    key: "durva",
    label: "Durva grass",
    meaning:
      "Twenty-one blades, tied in bunches of three. It is the one offering he is said to prefer to anything expensive.",
  },
  {
    key: "kumkum",
    label: "Vermilion",
    meaning:
      "A mark on his forehead, and one on your own. The same finger does both, which is the point of it.",
  },
  {
    key: "flowers",
    label: "Flowers",
    meaning:
      "Both palms cupped, filled with whatever is in bloom, and opened over his feet. Never thrown — opened.",
  },
  {
    key: "modak",
    label: "Modak",
    meaning:
      "Steamed, filled with coconut and jaggery, offered in an odd number. Somebody has been folding these since morning.",
  },
  {
    key: "lamp",
    label: "Lamp and incense",
    meaning:
      "Circled three times in front of him. After this the aarti begins, and everybody has to sing.",
  },
] as const;

export type OfferingKey = (typeof OFFERINGS)[number]["key"];

/**
 * The aarti, in English.
 *
 * ── WHY THERE IS NO DEVANAGARI ON THIS PAGE ─────────────────────────────────
 *
 * The first build set the aarti as four lines of Sanskrit in Devanagari with a
 * transliteration and a gloss under each. It was the most beautiful thing in the
 * template and it was three lines of text per line of verse, in two scripts, for
 * a reader who may be able to read neither.
 *
 * These are the same four lines of Karpura Gauram — the verse sung at the end of
 * any aarti, whichever murti is in front of it — carried in English alone. The
 * recording still plays the original; the words on screen say what it means.
 *
 * Read as a couplet pair, not as four separate captions: they are shown two at a
 * time as the thali turns.
 */
export const AARTI_LINES = [
  "White as camphor, mercy itself, come down in a body",
  "the essence of all this, wearing the king of serpents,",
  "living always in the lotus of the heart —",
  "to him, and to her beside him, I bow.",
] as const;

/**
 * Editor state → request body. The server re-validates all of this.
 *
 * ── THE `idb:` STRIP ────────────────────────────────────────────────────────
 *
 * A photo the sender has not published yet is held in IndexedDB and carried here
 * as `idb:<id>`. `useGaneshEditor` uploads it before it calls this, and aborts
 * the publish if the upload fails, so in the normal path there is nothing to
 * strip.
 *
 * This is the backstop for the abnormal one. A ref that reached the database
 * would be saved as a permanent, unfixable broken image on the recipient's page
 * — the id means nothing outside the browser that minted it. Dropping it to an
 * empty string means the frame renders its drawn fallback, which is a page
 * missing a photo rather than a page with a hole in it.
 */
const stripLocal = (v: string): string => (v.startsWith("idb:") ? "" : v);

export function ganeshDataToBody(d: GaneshData, password: string) {
  return {
    recipientName: d.recipientName,
    senderName: d.senderName,
    city: d.city,
    photoUrl: stripLocal(d.photoUrl),
    greeting: d.greeting,
    aartiLine: d.aartiLine,
    prasadNote: d.prasadNote,
    // A row is its label; a value with nothing on the left renders as a stray
    // phrase in the right-hand column.
    wishes: d.wishes.filter((r) => r.label.trim()),
    vargani: { ...d.vargani, qrImageUrl: stripLocal(d.vargani.qrImageUrl) },
    festivalDate: d.festivalDate,
    visarjanDate: d.visarjanDate,
    password,
    // `reply` is deliberately absent. It belongs to the reader, the server
    // refuses it on this route anyway, and sending it would mean an owner edit
    // could overwrite words that are not theirs.
  };
}

/** Ganesh Chaturthi 2026, and Anant Chaturdashi 2026. */
export const FESTIVAL_DATE = "2026-09-14";
export const VISARJAN_DATE = "2026-09-24";

/**
 * What the builder opens holding — a complete first draft, not an empty form.
 *
 * Every value here is a real, sendable line the sender can keep, and every one
 * is editable. A form of empty boxes asks somebody to be a writer before they
 * have decided whether to bother, and the drop-off is at the first empty box. A
 * draft asks them to correct something instead, which is a much smaller thing to
 * be asked.
 *
 * ── WHAT IS NOT PREFILLED, AND WHY ──────────────────────────────────────────
 *
 * `recipientName` and `senderName` are theirs to state and cannot be guessed.
 * `photoUrl` and the whole of `vargani` involve their own photograph and their
 * own payment details — a default there would be a stranger's face or somebody
 * else's UPI ID (see `DEMO` below, which is exactly that and must never be
 * merged with this). `city` is a fact no default can know.
 */
export const SAMPLE: GaneshData = {
  recipientName: "",
  senderName: "",
  city: "",
  photoUrl: "",
  greeting: [
    "He is home again.",
    "The whole house smells of camphor and coconut.",
    "Wishing you a year with fewer obstacles than the last one.",
  ],
  aartiLine: "Whatever else changes, this week always brings everyone home.",
  prasadNote: "",
  wishes: [
    { label: "For everyone at home", value: "one healthy year" },
    { label: "For the thing you are not saying", value: "a way through" },
  ],
  vargani: { title: "", upiId: "", qrImageUrl: "", note: "" },
  reply: "",
  festivalDate: FESTIVAL_DATE,
  visarjanDate: VISARJAN_DATE,
};

/**
 * What the GALLERY PREVIEW renders — not what the builder starts from.
 *
 * These two must not be the same object, and the distinction is the whole point
 * of this constant. `SAMPLE` above is empty in every slot that carries somebody's
 * identity, so a sender who opens the form and publishes without finishing
 * cannot ship a page carrying a stranger's face. But feeding that same emptiness
 * to the preview meant every visitor evaluating the template saw a shell: no
 * photo, no wishes, no QR, an unnamed sender. Three of the things this template
 * does were invisible until you had already committed to building one.
 *
 * So the preview seeds from `DEMO`, the builder seeds from `SAMPLE`, and
 * `useGaneshEditor` keeps them apart. Anything added here must also be a field a
 * real sender can fill, or the preview starts advertising a feature that does not
 * exist.
 */
export const DEMO: GaneshData = {
  recipientName: "Aditi",
  senderName: "Rohit",
  city: "Pune",
  photoUrl: DEMO_MEDIA.hero,
  greeting: [
    "Eleventh year we have done this in the same flat.",
    "My mother still refuses to let anyone else fold the modak.",
    "Come home before the visarjan this time.",
  ],
  aartiLine: "You were on a call through the whole aarti last year. Not this year.",
  prasadNote: "There were fourteen of them this morning. There are four now.",
  wishes: [
    { label: "For my mother's knee", value: "one painless year" },
    { label: "For your interviews in October", value: "a clear head" },
    { label: "For my father's blood pressure", value: "and his cooperation" },
    { label: "For the same thing you ask every year", value: "a motorbike, allegedly" },
  ],
  vargani: {
    title: "Sai Mitra Mandal",
    upiId: "rohit@upi",
    qrImageUrl: DEMO_MEDIA.qr,
    note: "Whatever you feel like. It all goes on the decorations.",
  },
  reply: "",
  festivalDate: FESTIVAL_DATE,
  visarjanDate: VISARJAN_DATE,
};

/** Server document → the shape every section reads. Tolerates missing fields. */
export function dbToGaneshData(d: Record<string, unknown> | null | undefined): GaneshData {
  const o = (d || {}) as Record<string, unknown>;
  const v = (o.vargani || {}) as Record<string, unknown>;
  const str = (x: unknown, fb = "") => (typeof x === "string" ? x : fb);

  return {
    recipientName: str(o.recipientName),
    senderName: str(o.senderName),
    city: str(o.city),
    photoUrl: str(o.photoUrl),
    greeting: Array.isArray(o.greeting) ? o.greeting.map((l) => str(l)).filter(Boolean) : [],
    aartiLine: str(o.aartiLine),
    prasadNote: str(o.prasadNote),
    wishes: Array.isArray(o.wishes)
      ? o.wishes
          .map((r) => {
            const rr = (r || {}) as Record<string, unknown>;
            return { label: str(rr.label), value: str(rr.value) };
          })
          .filter((r) => r.label)
      : [],
    vargani: {
      title: str(v.title),
      upiId: str(v.upiId),
      qrImageUrl: str(v.qrImageUrl),
      note: str(v.note),
    },
    reply: str(o.reply),
    festivalDate: /^\d{4}-\d{2}-\d{2}$/.test(str(o.festivalDate))
      ? str(o.festivalDate)
      : FESTIVAL_DATE,
    visarjanDate: /^\d{4}-\d{2}-\d{2}$/.test(str(o.visarjanDate))
      ? str(o.visarjanDate)
      : VISARJAN_DATE,
  };
}

// ─── Dates ───────────────────────────────────────────────────────────────────
//
// Ganesh Chaturthi 2026 is Monday 14 September. The sthapana is traditionally
// done in the middle third of the day, which that year runs roughly 11:03–13:32
// IST. The festival closes with the visarjan on 24 September.
//
// Held as DATA, not asserted in logic, because panchang timings vary by a few
// minutes between almanacs and by city. Getting them slightly wrong must never
// be able to break anything, which is why `muhuratLine` below is purely
// informational and NO CALLER MAY GATE ON IT. The page opens, and everything on
// it works, at 3am on a Tuesday in March.

export const MUHURAT = {
  /** 11:03 IST → UTC. IST is UTC+5:30 and has no DST. */
  startIso: "2026-09-14T05:33:00.000Z",
  /** 13:32 IST → UTC. */
  endIso: "2026-09-14T08:02:00.000Z",
} as const;

export interface MuhuratState {
  phase: "before" | "during" | "after";
  /** Ready to render. Never null. */
  label: string;
}

/**
 * `now` is passed in rather than read here.
 *
 * Reading the clock inside a component's render is impure — React may render
 * twice and get two different answers, and `react-hooks/purity` fails the build
 * for it. The caller stamps the time in an effect and ticks it (`useNow`).
 */
export function muhuratLine(now: number): MuhuratState {
  const start = new Date(MUHURAT.startIso).getTime();
  const end = new Date(MUHURAT.endIso).getTime();
  if (now < start) return { phase: "before", label: `The auspicious hour is in ${gap(start - now)}` };
  if (now <= end) return { phase: "during", label: `The auspicious hour — ${gap(end - now)} remaining` };
  return { phase: "after", label: "The auspicious hour has passed. Do it anyway." };
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

/** "Visarjan in 10 days" — the other end of the festival, for the footer. */
export function visarjanLine(iso: string, now: number): string | null {
  if (!now) return null;
  const then = new Date(`${iso}T12:00:00+05:30`).getTime();
  if (Number.isNaN(then)) return null;
  const days = Math.round((then - now) / 86_400_000);
  if (days > 1) return `Visarjan in ${days} days`;
  if (days === 1) return "Visarjan tomorrow";
  if (days === 0) return "Visarjan today";
  return null;
}

/** "14 September 2026". Empty string for anything unparseable. */
export function formatFestivalDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
