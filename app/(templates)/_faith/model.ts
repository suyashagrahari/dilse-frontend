// ─── Faith weddings: extras → a render model ─────────────────────────────────
// Untrusted (an old page, the AI fill, a hostile POST): everything is coerced.

import type { LovePhoto } from "../_love/types";
import { isWeddingThemeId, LIGHT_THEMES, type WeddingThemeId } from "../_wedding/themes";
import type { FamilySide, WeddingEvent } from "../_wedding/types";
import { fwLocalUrl } from "../_valentine/days/floral-wedding-invitation";
import type { FaithProfile, Lang } from "./types";

/** Same limits as Pampas & Peony (WEDDING_TIER_LIMITS; the server twins pin them). */
export const FAITH_LIMITS = { events: 8, photos: 40, story: 8, faq: 6 } as const;
/** Family members guests can call / WhatsApp (extras.contacts). */
export const FAITH_CONTACTS_MAX = 4;

export interface FwChapter {
  when: string;
  title: string;
  line: string;
  photo: LovePhoto | null;
}

export interface FwContact {
  name: string;
  relation: string;
  /** Display form ("+91 98290 00000"). */
  display: string;
  /** tel: target ("+919829000000"). */
  tel: string;
  /** wa.me digits ("919829000000"). */
  wa: string;
}

export interface FaithModel {
  theme: WeddingThemeId;
  lang: Lang;
  bride: string;
  groom: string;
  /** In the order the sender wants them printed. */
  first: string;
  second: string;
  /** The invitation in Punjabi / Urdu ("" = English only). */
  localMessage: string;
  /** Scripture on the invitation card (the faith's default when the couple leaves it empty). */
  verse: string;
  verseRef: string;
  bride_: FamilySide;
  groom_: FamilySide;
  familyFirst: "bride" | "groom";
  blessingsOf: string;
  muhurat: string;
  hashtag: string;
  events: WeddingEvent[];
  main: WeddingEvent | undefined;
  story: FwChapter[];
  things: { head: string; text: string }[];
  gettingThere: string;
  videoId: string;
  rsvpBy: string;
  maxGuests: number;
  rsvpMeal: boolean;
  blessings: boolean;
  /** Photos not used by a story chapter, a family card or the couple portrait. */
  gallery: LovePhoto[];
  /** The family cards' photos with their focal point / zoom (bride_.photo / groom_.photo carry only the url). */
  bridePic: LovePhoto | null;
  groomPic: LovePhoto | null;
  /** The couple's portrait under the floral drape (extras.couplePhoto); null = the illustration only. */
  couple: LovePhoto | null;
  /** The faith's invocation (Ik Onkar · Bismillah · the cross) on the hero and the invitation card (default on). */
  invocation: boolean;
  contacts: FwContact[];
  /** Shagun by UPI (off unless the sender adds an id). */
  upi: { id: string; name: string } | null;
  /** Livestream link (https only). */
  liveUrl: string;
}

const str = (v: unknown, max = 600) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const num = (v: unknown, d = 0) => (typeof v === "number" && Number.isFinite(v) ? Math.round(v) : typeof v === "string" && v.trim() && Number.isFinite(Number(v)) ? Math.round(Number(v)) : d);
const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);

/** A stable, short id for a function from its position (only when the row has none). */
export const fallbackEventId = (i: number) => `f${i + 1}`;

/** YouTube id out of any link form (watch, youtu.be, shorts, embed) or a bare id. */
export function youtubeIdOf(raw: string): string {
  const s = raw.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
  const m = s.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/))([A-Za-z0-9_-]{11})/i);
  return m ? m[1] : "";
}

/** Dress-code words → a swatch, for a row whose sender (or the AI) left the colour empty. */
const COLOUR_WORDS: [RegExp, string][] = [
  [/yellow|haldi|mustard|gold(en)?\b/i, "#F2C94C"],
  [/green|mehendi|mehndi|emerald|sage|mint/i, "#7FA77A"],
  [/pink|rose|blush|fuchsia|rani/i, "#E7A3AE"],
  [/red|maroon|crimson|wine|burgundy/i, "#A3122B"],
  [/purple|violet|lavender|lilac|plum/i, "#A58CC4"],
  [/blue|navy|teal|turquoise|indigo/i, "#6F8FC2"],
  [/orange|saffron|marigold|kesari|peach|coral/i, "#EE9A5E"],
  [/white|ivory|cream|pastel|beige|champagne|nude/i, "#F1E6D6"],
  [/black|tie|tux|noir|formal/i, "#2A2622"],
  [/silver|grey|gray/i, "#B8BCC6"],
];
export function swatchFor(e: Pick<WeddingEvent, "dressCode" | "dressColor">): string {
  if (e.dressColor && /^#[0-9a-f]{6}$/i.test(e.dressColor)) return e.dressColor;
  for (const [re, c] of COLOUR_WORDS) if (re.test(e.dressCode ?? "")) return c;
  return "";
}


/**
 * A phone number a guest can tap: Indian mobiles (10 digits, optional +91 / 0)
 * become +91; anything else with a leading + and 8–15 digits is kept as it is.
 * Null for anything that would dial nonsense.
 */
export function phoneOf(raw: string): { display: string; tel: string; wa: string } | null {
  const t = raw.trim();
  if (!t) return null;
  const digits = t.replace(/\D/g, "");
  let local = "";
  if (/^[6-9]\d{9}$/.test(digits)) local = digits;
  else if (/^91[6-9]\d{9}$/.test(digits)) local = digits.slice(2);
  else if (/^0[6-9]\d{9}$/.test(digits)) local = digits.slice(1);
  if (local) return { display: `+91 ${local.slice(0, 5)} ${local.slice(5)}`, tel: `+91${local}`, wa: `91${local}` };
  if (t.startsWith("+") && digits.length >= 8 && digits.length <= 15) return { display: `+${digits}`, tel: `+${digits}`, wa: digits };
  return null;
}

export const UPI_RE = /^[a-z0-9._-]{2,256}@[a-z][a-z0-9.-]{1,64}$/i;

export function readFaith(extras: Record<string, unknown>, photos: LovePhoto[], bride: string, groom: string, faith: FaithProfile): FaithModel {
  const x = extras ?? {};
  // Demo / repo art is stored as https://subhsandesh.in/wedding-v3/…: every host serves its own copy.
  const pool = (Array.isArray(photos) ? photos : []).filter((p) => p && p.url).map((p) => (fwLocalUrl(p.url) === p.url ? p : { ...p, url: fwLocalUrl(p.url) }));
  const used = new Set<number>();
  const pick = (n: unknown): LovePhoto | null => {
    const k = num(n);
    if (k < 1 || k > pool.length) return null;
    used.add(k - 1);
    return pool[k - 1];
  };

  const events: WeddingEvent[] = (Array.isArray(x.events) ? x.events : [])
    .filter(isObj)
    .slice(0, FAITH_LIMITS.events)
    .map((r, i) => {
      const e: WeddingEvent = {
        id: str(r.id, 24) || fallbackEventId(i),
        title: str(r.title, 40),
        date: /^\d{4}-\d{2}-\d{2}$/.test(str(r.date, 10)) ? str(r.date, 10) : "",
        time: /^\d{2}:\d{2}$/.test(str(r.time, 5)) ? str(r.time, 5) : "",
        endTime: /^\d{2}:\d{2}$/.test(str(r.endTime, 5)) ? str(r.endTime, 5) : "",
        venue: str(r.venue, 80),
        address: str(r.address, 140),
        mapUrl: /^https:\/\//i.test(str(r.mapUrl, 400)) ? str(r.mapUrl, 400) : "",
        dressCode: str(r.dressCode, 60),
        dressColor: "",
        note: str(r.note, 200),
      };
      e.dressColor = swatchFor({ dressCode: e.dressCode, dressColor: str(r.dressColor, 7) });
      return e;
    })
    .filter((e) => e.title || e.venue || e.date);

  const main = events.find((e) => faith.mainRe.test(e.title)) ?? events[0];

  const story: FwChapter[] = (Array.isArray(x.story) ? x.story : [])
    .filter(isObj)
    .slice(0, FAITH_LIMITS.story)
    .map((r) => ({ when: str(r.when, 24), title: str(r.title, 60), line: str(r.line, 240), photo: pick(r.photo) }))
    .filter((c) => c.title || c.line);

  const bridePhoto = pick(x.bridePhoto);
  const groomPhoto = pick(x.groomPhoto);
  const couple = pick(x.couplePhoto);

  const things = (Array.isArray(x.things) ? x.things : [])
    .map((t) => str(t, 180))
    .filter(Boolean)
    .slice(0, FAITH_LIMITS.faq)
    .map((t) => {
      const m = t.match(/^([^:]{2,28}):\s*(.+)$/);
      return m ? { head: m[1].trim(), text: m[2].trim() } : { head: "", text: t };
    });

  const contacts: FwContact[] = [];
  for (const r of (Array.isArray(x.contacts) ? x.contacts : []).filter(isObj).slice(0, FAITH_CONTACTS_MAX)) {
    const p = phoneOf(str(r.phone, 20));
    const name = str(r.name, 40);
    if (p && name) contacts.push({ name, relation: str(r.relation, 40), ...p });
  }

  const upiId = str(x.upiId, 80);
  const live = str(x.liveUrl, 300);

  const gallery = pool.filter((_, i) => !used.has(i));
  const order = x.nameOrder === "groom" ? "groom" : "bride";
  const b = bride.trim() || "Bride";
  const g = groom.trim() || "Groom";
  const theme = isWeddingThemeId(x.theme) && (LIGHT_THEMES as readonly string[]).includes(x.theme as string) ? (x.theme as WeddingThemeId) : "champagne";

  return {
    theme,
    lang: (faith.local && x.lang === faith.local.code ? faith.local.code : "en") as Lang,
    bride: b,
    groom: g,
    first: order === "bride" ? b : g,
    second: order === "bride" ? g : b,
    localMessage: faith.local ? str(x.localMessage, 700) : "",
    verse: str(x.verse, 220),
    verseRef: str(x.verse, 220) ? str(x.verseRef, 40) : "",
    bride_: { title: "", names: [str(x.brideFamily, 120)].filter(Boolean), note: str(x.brideNote, 100), photo: bridePhoto?.url },
    groom_: { title: "", names: [str(x.groomFamily, 120)].filter(Boolean), note: str(x.groomNote, 100), photo: groomPhoto?.url },
    familyFirst: order,
    bridePic: bridePhoto,
    groomPic: groomPhoto,
    blessingsOf: str(x.blessingsOf, 160),
    muhurat: str(x.muhurat, 60),
    hashtag: str(x.hashtag, 40),
    events,
    main,
    story,
    things,
    gettingThere: str(x.gettingThere, 500),
    videoId: youtubeIdOf(str(x.videoUrl, 200)),
    rsvpBy: /^\d{4}-\d{2}-\d{2}$/.test(str(x.rsvpBy, 10)) ? str(x.rsvpBy, 10) : "",
    maxGuests: Math.min(10, Math.max(1, num(x.maxGuests, 4))),
    rsvpMeal: x.rsvpMeal !== false,
    blessings: x.blessings !== false,
    gallery,
    couple,
    invocation: x.invocation !== false,
    contacts,
    upi: UPI_RE.test(upiId) ? { id: upiId, name: str(x.upiName, 60) } : null,
    liveUrl: /^https:\/\/[^\s"'<>]+$/i.test(live) ? live : "",
  };
}
