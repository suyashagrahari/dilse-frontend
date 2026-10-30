// ─── Wedding kit: shared data shapes ────────────────────────────────────────
import type { LovePhoto, PhotoSpan } from "../_love/types";

export type { PhotoSpan };
export { PHOTO_SPANS } from "../_love/types";

/**
 * A gallery photo. It IS the engine's LovePhoto (so `data.photos` is uploaded,
 * sanitised and stored by the existing pipeline), using:
 *   cropX / cropY → focal point (object-position %, 0–100; default 50/50)
 *   scale         → optional zoom (100–300) around the focal point
 *   span          → "normal" | "wide" | "tall" | "large"
 *   w / h         → natural pixel size (measured on upload; layout without CLS)
 */
export type WeddingPhoto = LovePhoto;

/** Single source of truth for tier limits (mirrors server config/weddingShared.ts). */
export const WEDDING_TIER_LIMITS = {
  "wedding-invitation": { events: 5, photos: 12, story: 3, faq: 3, icsAllEvents: false, rsvpPerEvent: true, blessings: true },
  "wedding-invitation-premium": { events: 5, photos: 20, story: 5, faq: 3, icsAllEvents: false, rsvpPerEvent: true, blessings: true },
  "royal-wedding-invitation": { events: 8, photos: 40, story: 8, faq: 6, icsAllEvents: true, rsvpPerEvent: true, blessings: true },
  // The four designs on Royal's limits (palace door, Mughal garden, pampas & peony, lotus temple).
  "palace-door-wedding-invitation": { events: 8, photos: 40, story: 8, faq: 6, icsAllEvents: true, rsvpPerEvent: true, blessings: true },
  "garden-wedding-invitation": { events: 8, photos: 40, story: 8, faq: 6, icsAllEvents: true, rsvpPerEvent: true, blessings: true },
  "floral-wedding-invitation": { events: 8, photos: 40, story: 8, faq: 6, icsAllEvents: true, rsvpPerEvent: true, blessings: true },
  "sikh-wedding-invitation": { events: 8, photos: 40, story: 8, faq: 6, icsAllEvents: true, rsvpPerEvent: true, blessings: true },
  "muslim-wedding-invitation": { events: 8, photos: 40, story: 8, faq: 6, icsAllEvents: true, rsvpPerEvent: true, blessings: true },
  "christian-wedding-invitation": { events: 8, photos: 40, story: 8, faq: 6, icsAllEvents: true, rsvpPerEvent: true, blessings: true },
  "tamil-wedding-invitation": { events: 8, photos: 40, story: 8, faq: 6, icsAllEvents: true, rsvpPerEvent: true, blessings: true },
  "telugu-wedding-invitation": { events: 8, photos: 40, story: 8, faq: 6, icsAllEvents: true, rsvpPerEvent: true, blessings: true },
  "kannada-wedding-invitation": { events: 8, photos: 40, story: 8, faq: 6, icsAllEvents: true, rsvpPerEvent: true, blessings: true },
  "malayalam-wedding-invitation": { events: 8, photos: 40, story: 8, faq: 6, icsAllEvents: true, rsvpPerEvent: true, blessings: true },
  "marathi-wedding-invitation": { events: 8, photos: 40, story: 8, faq: 6, icsAllEvents: true, rsvpPerEvent: true, blessings: true },
  "lotus-wedding-invitation": { events: 8, photos: 40, story: 8, faq: 6, icsAllEvents: true, rsvpPerEvent: true, blessings: true },
} as const;
export type WeddingSlug = keyof typeof WEDDING_TIER_LIMITS;

/**
 * One function (Haldi, Mehendi, Sangeet, Wedding, Reception…). Stored by the
 * tiers in `extras.events` (an engine objlist) — every leaf is a string so it
 * fits the objlist spec; `id` is a short stable slug the RSVP refers to.
 */
export interface WeddingEvent {
  id: string;
  title: string;
  /** "2026-12-12" (local date at the venue). */
  date: string;
  /** "19:30" 24h; "" = time to be announced. */
  time: string;
  /** Optional end "23:00"; default 3 hours after start for the calendar. */
  endTime?: string;
  venue: string;
  address?: string;
  /** Google Maps link (any https maps URL); empty = built from venue + address. */
  mapUrl?: string;
  dressCode?: string;
  /** Hex colour swatch for the dress code (Royal tier), e.g. "#f2c94c". */
  dressColor?: string;
  note?: string;
}

/** "+05:30" — every date/time in the kit is wall-clock time at the venue. */
export const DEFAULT_TZ_OFFSET = "+05:30";

export interface FamilySide {
  /** "Bride's family" / "वधू पक्ष" — the card heading. */
  title: string;
  /** "Mrs. & Mr. Rajesh Sharma" — one line per name. */
  names: string[];
  /** Optional line under the names: "Grandparents: …", a city, a phone. */
  note?: string;
  /** Optional photo (https / data URL). */
  photo?: string;
}

export type Attending = "yes" | "no" | "maybe";
export type Meal = "veg" | "nonveg" | "jain";

export interface RsvpDraft {
  guestName: string;
  phone?: string;
  attending: Attending;
  guests: number;
  events: string[];
  meal?: Meal | null;
  message?: string;
}

export interface RsvpRow extends Required<Omit<RsvpDraft, "meal">> {
  id: string;
  meal: Meal | null;
  createdAt: string;
  updatedAt: string;
}

export interface RsvpTotals {
  responses: number;
  attending: number;
  maybe: number;
  declined: number;
  heads: number;
  headsWithMaybe: number;
  perEvent: Record<string, number>;
  meals: Record<Meal, number>;
}

export interface Blessing {
  id: string;
  name: string;
  message: string;
  createdAt: string;
  /** Owner view only. */
  approved?: boolean;
}

export const RSVP_LIMITS = { name: 60, phone: 20, message: 300, maxGuests: 10 } as const;
export const BLESSING_LIMITS = { name: 60, message: 280 } as const;
