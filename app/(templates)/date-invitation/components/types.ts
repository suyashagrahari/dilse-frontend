// ─── Date Invitation — shared type contract ──────────────────────────────────
//
// Single source of truth for the shape shared by the editor, the published
// viewer and the server payload. Field names here === server model field names
// === wire-format keys. Keep them in sync.
//
// CORE DESIGN PRINCIPLE, enforced by these types: the location is hidden until
// the date begins, and stops unlock one at a time. This is a sequence of
// surprises, not a shared document.
//
// That principle is not left to the renderer's good behaviour. `LockedStopView`
// has NO name, NO address and NO coordinates — not optional ones, absent ones.
// A component handed a locked stop cannot render its address because there is
// no property to read. `buildItinerary()` below is the ONLY sanctioned way to
// get stops onto the screen; if you find yourself mapping over `data.stops`
// directly inside a component, you have just leaked the whole plan.

import { bodyFromKeys, clampNum, list, num, oneOf, str, strList, strOr, type Raw } from "@/lib/wire";

export type EditMode = null | "manual" | "preview";

export interface Toast {
  id: number;
  type: "success" | "info" | "publish";
  title: string;
  message?: string;
  shareUrl?: string;
}

export type WalkingLevel = "minimal" | "some" | "a lot";
export type RsvpState = "pending" | "accepted" | "declined" | "reschedule";

export interface GeoPoint {
  /** Human name of the place. "Blue Tokai, Koramangala". */
  name: string;
  address: string;
  /**
   * 0/0 is the sentinel for "not supplied" — the editor cannot produce a real
   * null through the wire format, and Null Island is not a date venue. When
   * both are 0 the map and the Directions button are hidden and the address is
   * shown as plain text. Use `hasCoords()`, never a truthiness check on lat.
   */
  lat: number;
  lng: number;
}

export interface Stop extends GeoPoint {
  id: string;
  /** 1-based, and authoritative. Never rely on array position. */
  order: number;
  /** ISO 8601, UTC. Everything is stored and compared in UTC, displayed local. */
  arriveAt: string;
  durationMins: number;
  /** Why he chose it. The emotional payload — give it room on screen. */
  why: string;
  dressNote: string;
  /** When true the name stays hidden until unlocked. When false it shows while still locked. */
  surprise: boolean;
}

export interface DateInviteData {
  senderName: string;
  recipientName: string;
  /** ISO 8601, UTC. */
  startsAt: string;
  durationMins: number;
  dressCode: string;
  walkingLevel: WalkingLevel;
  /** One line on the invitation. */
  note: string;
  meetingPoint: GeoPoint;
  stops: Stop[];
  /** Recipient-owned state. The sender never sets this to anything but "pending". */
  rsvp: RsvpState;
  /**
   * ISO date the recipient counter-proposed, or "". Only meaningful when
   * rsvp === "reschedule".
   */
  proposedDate: string;
  /**
   * Index of the stop currently being visited. -1 before the date starts.
   * Advanced by the "we're here" tap or by the auto-advance grace window.
   */
  currentStopIndex: number;
  /** ISO timestamps, parallel to `stops` by index. "" means not yet arrived. */
  arrivedAt: string[];
  /** Added afterwards. Data URLs or https URLs. */
  photos: string[];
  closingLine: string;
}

// ─── Tuning ──────────────────────────────────────────────────────────────────

export const TIMING = {
  /**
   * A forgotten tap must never strand them mid-date, so once they are this far
   * past the NEXT stop's arrival time we advance for them. Twenty minutes is
   * long enough that it never fires while they are actually at a stop.
   */
  autoAdvanceGraceMs: 20 * 60 * 1000,
  /** One-shot wax seal on accept. */
  sealMs: 600,
  /** Countdown re-render cadence. */
  tickMs: 1000,
  /**
   * The invitation stops being an invitation this long after the start time.
   * Generous: a date that started an hour ago can still be accepted late.
   */
  expiresAfterStartMs: 6 * 60 * 60 * 1000,
} as const;

/** Everything is at least this tall. This template is used outdoors, one-handed. */
export const TAP_TARGET_PX = 48;

// ─── Time ────────────────────────────────────────────────────────────────────

/**
 * TODO(server-time): unlock decisions must not trust the device clock — a
 * recipient who sets their phone forward three hours would otherwise skip the
 * entire reveal sequence. Replace this with a value seeded from a `Date` header
 * or a `/time` endpoint at page load, plus a monotonic offset from
 * `performance.now()`. Every caller in this template already routes through
 * here, so the swap is one function body.
 */
export function getServerTime(): number {
  return Date.now();
}

export const hasCoords = (p: { lat: number; lng: number }): boolean => p.lat !== 0 || p.lng !== 0;

/**
 * Deep-links the maps app the recipient already has. Deliberately NOT the Maps
 * JavaScript API: that is billed per load, heavy on mobile data, and looks
 * wrong inside a romantic card.
 */
export const directionsUrl = (p: { lat: number; lng: number }): string =>
  `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`;

export interface Countdown {
  days: number;
  hours: number;
  mins: number;
  secs: number;
  /** True once the target time has passed. Drives the automatic hand-off. */
  done: boolean;
}

export function countdownTo(iso: string, nowMs: number): Countdown {
  const target = Date.parse(iso);
  const delta = Number.isNaN(target) ? 0 : target - nowMs;
  if (delta <= 0) return { days: 0, hours: 0, mins: 0, secs: 0, done: true };
  const secs = Math.floor(delta / 1000);
  return {
    days: Math.floor(secs / 86400),
    hours: Math.floor((secs % 86400) / 3600),
    mins: Math.floor((secs % 3600) / 60),
    secs: secs % 60,
    done: false,
  };
}

/** "3 days 04:22:11" / "04:22:11" once inside a day. Monospace only. */
export function formatCountdown(c: Countdown): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const clock = `${pad(c.hours)}:${pad(c.mins)}:${pad(c.secs)}`;
  if (c.days <= 0) return clock;
  return `${c.days} ${c.days === 1 ? "day" : "days"} ${clock}`;
}

// ─── Phase ───────────────────────────────────────────────────────────────────

export type Phase =
  /** Not answered yet, and there is still time to answer. */
  | "invitation"
  /** Answered no. A warm ending, and nothing else. */
  | "declined"
  /** Counter-proposed. Waiting on the sender. */
  | "reschedule"
  /** Never answered, and the date has come and gone. */
  | "expired"
  /** Accepted, not started. Meeting point revealed; stops are not. */
  | "countdown"
  /** Running. One stop at a time. */
  | "live"
  /** Every stop passed. Becomes a memory. */
  | "after";

export function phaseOf(data: DateInviteData, nowMs: number): Phase {
  if (data.rsvp === "declined") return "declined";
  if (data.rsvp === "reschedule") return "reschedule";

  const start = Date.parse(data.startsAt);
  const started = !Number.isNaN(start) && nowMs >= start;

  if (data.rsvp === "pending") {
    // Expiry is deliberately lenient: a late yes is still a yes.
    return started && nowMs > start + TIMING.expiresAfterStartMs ? "expired" : "invitation";
  }

  // accepted
  if (!started) return "countdown";
  if (data.stops.length > 0 && data.currentStopIndex >= data.stops.length) return "after";
  return "live";
}

// ─── The itinerary view — the guard that makes the reveal real ───────────────

export type StopState = "passed" | "current" | "locked";

interface StopViewBase {
  id: string;
  order: number;
  state: StopState;
}

export interface PassedStopView extends StopViewBase {
  state: "passed";
  name: string;
  address: string;
  lat: number;
  lng: number;
  why: string;
  /** ISO of the actual tap, or "" if it auto-advanced. Shown as "you were here at 7:12 PM". */
  arrivedAt: string;
}

export interface CurrentStopView extends StopViewBase {
  state: "current";
  name: string;
  address: string;
  lat: number;
  lng: number;
  arriveAt: string;
  durationMins: number;
  why: string;
  dressNote: string;
}

/**
 * Note what is NOT here: no name, no address, no lat, no lng, no `why`. A locked
 * stop's content does not exist on this object, so it cannot reach the DOM by
 * accident. `label` is the only text, and it is either the placeholder or — when
 * the sender marked the stop as not-a-surprise — the name they chose to show.
 */
export interface LockedStopView extends StopViewBase {
  state: "locked";
  /** "———" for a surprise stop, otherwise the stop's own name. */
  label: string;
  surprise: boolean;
}

export type StopView = PassedStopView | CurrentStopView | LockedStopView;

/** The placeholder for a stop whose name is still a secret. */
export const SEALED_LABEL = "———";

/**
 * The ONLY sanctioned path from `data.stops` to the screen.
 *
 * Before the date starts this returns an empty array — during the countdown
 * there is no itinerary at all, not even a locked one, because rendering four
 * greyed rows already tells her how long the evening is.
 */
export function buildItinerary(data: DateInviteData, phase: Phase): StopView[] {
  if (phase !== "live" && phase !== "after") return [];

  const ordered = [...data.stops].sort((a, b) => a.order - b.order);
  const cursor = data.currentStopIndex;

  return ordered.map((s, i): StopView => {
    if (i < cursor) {
      return {
        id: s.id,
        order: s.order,
        state: "passed",
        name: s.name,
        address: s.address,
        lat: s.lat,
        lng: s.lng,
        why: s.why,
        arrivedAt: data.arrivedAt[i] ?? "",
      };
    }
    if (i === cursor) {
      return {
        id: s.id,
        order: s.order,
        state: "current",
        name: s.name,
        address: s.address,
        lat: s.lat,
        lng: s.lng,
        arriveAt: s.arriveAt,
        durationMins: s.durationMins,
        why: s.why,
        dressNote: s.dressNote,
      };
    }
    return {
      id: s.id,
      order: s.order,
      state: "locked",
      label: s.surprise ? SEALED_LABEL : s.name,
      surprise: s.surprise,
    };
  });
}

/**
 * How far past the next arrival time we are, if at all. The renderer polls this
 * and calls the advance handler when it returns true — the grace window means a
 * forgotten tap costs them twenty minutes, not the rest of the itinerary.
 */
export function shouldAutoAdvance(data: DateInviteData, nowMs: number): boolean {
  const next = data.stops[data.currentStopIndex + 1];
  if (!next) return false;
  const due = Date.parse(next.arriveAt);
  if (Number.isNaN(due)) return false;
  return nowMs > due + TIMING.autoAdvanceGraceMs;
}

/**
 * The status line at the top of the live itinerary.
 *
 * Never scolds. Late is the normal state of every date that has ever happened,
 * and a page that says "you are 40 minutes behind schedule" is a page nobody
 * wants open on the table. The copy tops out at relaxed.
 */
export function runningStatus(data: DateInviteData, nowMs: number): string {
  const total = data.stops.length;
  const i = data.currentStopIndex;
  if (total === 0) return "";
  if (i < 0) return `${total} ${total === 1 ? "stop" : "stops"} ahead`;
  if (i >= total) return "that was all of it";

  const head = `Stop ${i + 1} of ${total}`;
  const due = Date.parse(data.stops[i].arriveAt);
  if (Number.isNaN(due)) return head;

  const lateMins = Math.round((nowMs - due) / 60000);
  if (lateMins >= 10) return `${head} · running ${lateMins} min late · that's fine`;
  if (lateMins <= -20) return `${head} · early · no rush`;
  return `${head} · right on time`;
}

/** Derived so the sender never types it. Used on the completed route summary. */
export function totalTimeTogether(data: DateInviteData): string {
  const stamps = data.arrivedAt.filter(Boolean).map(Date.parse).filter((n) => !Number.isNaN(n));
  const start = Date.parse(data.startsAt);
  const first = Number.isNaN(start) ? Math.min(...stamps) : start;
  const last = stamps.length ? Math.max(...stamps) : first;
  const lastStop = data.stops[data.stops.length - 1];
  const end = last + (lastStop ? lastStop.durationMins * 60000 : 0);
  const mins = Math.max(0, Math.round((end - first) / 60000));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} minutes`;
  if (m === 0) return `${h} ${h === 1 ? "hour" : "hours"}`;
  return `${h}h ${m}m`;
}

export const WALKING_COPY: Record<WalkingLevel, string> = {
  minimal: "barely any",
  some: "a bit of walking",
  "a lot": "wear the good shoes",
};

// ─── Component contract ──────────────────────────────────────────────────────

export interface DateInvitationTemplateProps {
  data: DateInviteData;
  mode: "demo" | "live";
  shareId?: string;
  hasPassword?: boolean;
}

// ─── Demo data ───────────────────────────────────────────────────────────────
//
// Dates are relative to module load so the demo is always three days out and
// the countdown is always alive. `buildDemoData()` rather than a frozen const,
// because a hardcoded 2026 date would silently become the "expired" phase.

const HOUR = 3600_000;
const DAY = 24 * HOUR;

export function buildDemoData(): DateInviteData {
  const start = Date.now() + 3 * DAY + 4 * HOUR;
  const at = (offsetMins: number) => new Date(start + offsetMins * 60000).toISOString();
  return {
    senderName: "Rohan",
    recipientName: "Aditi",
    startsAt: new Date(start).toISOString(),
    durationMins: 240,
    dressCode: "something you can walk in",
    walkingLevel: "some",
    note: "I planned the whole thing. You just have to show up.",
    meetingPoint: {
      name: "The clock outside Church Street Social",
      address: "Church Street, Ashok Nagar, Bengaluru 560001",
      lat: 12.9738,
      lng: 77.6045,
    },
    stops: [
      {
        id: "s1",
        order: 1,
        name: "Blue Tokai, Church Street",
        address: "46 Church St, Ashok Nagar, Bengaluru 560001",
        lat: 12.9749,
        lng: 77.6068,
        arriveAt: at(0),
        durationMins: 45,
        why: "You told me once that you judge a place by whether they let you sit for two hours on one coffee. They do.",
        dressNote: "",
        surprise: false,
      },
      {
        id: "s2",
        order: 2,
        name: "Blossom Book House",
        address: "84/6 Church St, Bengaluru 560001",
        lat: 12.9752,
        lng: 77.6058,
        arriveAt: at(60),
        durationMins: 40,
        why: "Second floor, the corner with the poetry. You stopped at page forty of the last four books you started, so I want to watch you pick number five.",
        dressNote: "",
        surprise: true,
      },
      {
        id: "s3",
        order: 3,
        name: "Cubbon Park, the bamboo path",
        address: "Kasturba Road, Bengaluru 560001",
        lat: 12.9763,
        lng: 77.5929,
        arriveAt: at(120),
        durationMins: 50,
        why: "This is the bit I actually planned the day around. It'll be about seven, the light goes gold through the bamboo, and there is nowhere to sit so we'll have to keep walking and talking.",
        dressNote: "it gets cooler here — bring the jacket",
        surprise: true,
      },
      {
        id: "s4",
        order: 4,
        name: "Toit, 100 Feet Road",
        address: "298 Namma Metro Pillar 62, Indiranagar, Bengaluru 560038",
        lat: 12.9784,
        lng: 77.6408,
        arriveAt: at(200),
        durationMins: 90,
        why: "Where we had that argument about the film. I've had eleven months to prepare and I'd like a rematch.",
        dressNote: "",
        surprise: true,
      },
    ],
    rsvp: "pending",
    proposedDate: "",
    currentStopIndex: -1,
    arrivedAt: ["", "", "", ""],
    photos: [],
    closingLine: "Four hours, four stops, and I'd do the whole thing again tomorrow.",
  };
}

export const DEMO_DATA: DateInviteData = buildDemoData();

// ─── Wire format ─────────────────────────────────────────────────────────────

export const DATE_INVITE_CONTENT_KEYS: (keyof DateInviteData)[] = [
  "senderName", "recipientName", "startsAt", "durationMins", "dressCode",
  "walkingLevel", "note", "meetingPoint", "stops", "rsvp", "proposedDate",
  "currentStopIndex", "arrivedAt", "photos", "closingLine",
];

export function dateInviteDataToBody(data: DateInviteData, password?: string): Record<string, unknown> {
  return bodyFromKeys(data, DATE_INVITE_CONTENT_KEYS, password);
}

function coerceGeo(v: unknown, fallback: GeoPoint): GeoPoint {
  const o = (v && typeof v === "object" ? v : {}) as Raw;
  return {
    name: str(o.name, fallback.name),
    address: str(o.address, fallback.address),
    // Real coordinates only; anything out of range collapses to the 0/0 sentinel.
    lat: clampNum(o.lat, 0, -90, 90),
    lng: clampNum(o.lng, 0, -180, 180),
  };
}

export function dbToDateInviteData(db: Raw | null | undefined): DateInviteData {
  const src = db ?? {};
  const stops = list<Stop>(
    src.stops,
    (o, i) => {
      const name = str(o.name, "");
      if (!name) return null;
      return {
        id: str(o.id, `s${i + 1}`),
        order: num(o.order, i + 1),
        name,
        address: strOr(o.address, ""),
        lat: clampNum(o.lat, 0, -90, 90),
        lng: clampNum(o.lng, 0, -180, 180),
        arriveAt: strOr(o.arriveAt, ""),
        durationMins: clampNum(o.durationMins, 45, 5, 600),
        why: strOr(o.why, ""),
        dressNote: strOr(o.dressNote, ""),
        // Surprise is the default: forgetting to set it must not leak a name.
        surprise: o.surprise === false ? false : true,
      };
    },
    DEMO_DATA.stops,
  ).slice(0, 6);

  const arrived = strList(src.arrivedAt, []);

  return {
    senderName: str(src.senderName, DEMO_DATA.senderName),
    recipientName: str(src.recipientName, DEMO_DATA.recipientName),
    startsAt: str(src.startsAt, DEMO_DATA.startsAt),
    durationMins: clampNum(src.durationMins, DEMO_DATA.durationMins, 15, 1440),
    dressCode: strOr(src.dressCode, DEMO_DATA.dressCode),
    walkingLevel: oneOf<WalkingLevel>(src.walkingLevel, ["minimal", "some", "a lot"], "some"),
    note: strOr(src.note, DEMO_DATA.note),
    meetingPoint: coerceGeo(src.meetingPoint, DEMO_DATA.meetingPoint),
    stops,
    rsvp: oneOf<RsvpState>(src.rsvp, ["pending", "accepted", "declined", "reschedule"], "pending"),
    proposedDate: strOr(src.proposedDate, ""),
    // -1 means "not started". Clamped to stops.length so an out-of-range value
    // lands on the completed state rather than indexing off the end.
    currentStopIndex: clampNum(src.currentStopIndex, -1, -1, stops.length),
    // Kept parallel to `stops` by index, whatever the server sent.
    arrivedAt: stops.map((_, i) => arrived[i] ?? ""),
    photos: strList(src.photos, []).slice(0, 12),
    closingLine: strOr(src.closingLine, DEMO_DATA.closingLine),
  };
}

// Referenced by the editor's date validation. Exported here so the editor and
// the renderer agree on what "in the past" means.
export const isPast = (iso: string, nowMs = getServerTime()): boolean => {
  const t = Date.parse(iso);
  return !Number.isNaN(t) && t < nowMs;
};
