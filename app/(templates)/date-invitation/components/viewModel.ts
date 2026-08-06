// ─── The narrowed view handed to the pre-date screens ────────────────────────
//
// LEAD-OWNED. Do not edit; ask the lead.
//
// The frozen `types.ts` guarantees that a LOCKED STOP cannot leak, because
// `LockedStopView` has no name/address/lat/lng. This file closes the other half
// of the same hole: the `invitation` and `countdown` screens never receive a
// `stops` array in the first place.
//
// `DateInviteData` carries the full plan. Handing it to `InvitationCard` would
// mean the guard is "the component author remembered not to map over it".
// `InviteHeaderView` has NO `stops` property at all, so the invitation screen
// physically cannot render one, cannot count them, and cannot stringify them
// into a debug attribute. Acceptance criterion 1 becomes a type error rather
// than a code review.
//
// Screens that legitimately show stops (`live`, `after`) take `StopView[]` from
// `buildItinerary()` instead — never `data.stops`.

import type { DateInviteData, GeoPoint, WalkingLevel } from "./types";

/**
 * Everything the recipient needs in order to say yes, and nothing that would
 * spoil the evening. Deliberately excludes `stops` AND the stop count: four
 * greyed rows and "4 stops" tell her the same thing.
 */
export interface InviteHeaderView {
  senderName: string;
  recipientName: string;
  /** ISO 8601, UTC. */
  startsAt: string;
  durationMins: number;
  dressCode: string;
  walkingLevel: WalkingLevel;
  note: string;
  /**
   * The meeting point is NOT a stop. It is revealed during the countdown
   * because she has to know where to go; it is hidden on the invitation.
   */
  meetingPoint: GeoPoint;
  closingLine: string;
}

export function headerView(data: DateInviteData): InviteHeaderView {
  return {
    senderName: data.senderName,
    recipientName: data.recipientName,
    startsAt: data.startsAt,
    durationMins: data.durationMins,
    dressCode: data.dressCode,
    walkingLevel: data.walkingLevel,
    note: data.note,
    meetingPoint: { ...data.meetingPoint },
    closingLine: data.closingLine,
  };
}
