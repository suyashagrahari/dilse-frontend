"use client";

// ─── The Invitation — phase router ───────────────────────────────────────────
//
// LEAD-OWNED. This is the integration point for every other file in the
// template. Do not edit it; if a screen needs something it is not being handed,
// ask the lead rather than reaching around it.
//
// WHAT THIS FILE IS RESPONSIBLE FOR
//
// 1. The clock. One interval, `TIMING.tickMs`, feeding every screen. Nothing
//    else in the template may read the clock: unlock decisions go through
//    `getServerTime()` (see the TODO in the frozen types) and everything else
//    receives `nowMs` as a prop. This is also what makes the countdown cross
//    zero into the itinerary with no refresh — the phase is recomputed on every
//    tick, so the transition is a consequence of the clock, not an event.
//
// 2. The recipient's session state. RSVP, the `we're here` taps and the photos
//    are React state and nothing more. They do not survive a refresh and they
//    do not reach the sender. The rules forbid extra browser storage and there
//    is no backend this session, so every one of those points carries a
//    `// TODO(server):` naming the endpoint that would carry it. We are NOT
//    inventing an unauthenticated write endpoint to paper over it.
//
// 3. The reveal guard. `buildItinerary()` is called here, once, and the result
//    is handed down. The pre-date screens receive `headerView(data)` — an
//    object with no `stops` property — so the plan is not reachable from them
//    at all. See `viewModel.ts`.
//
// ─── CURSOR SEMANTICS (lead ruling — every agent must follow this) ───────────
//
// `currentStopIndex` is the cursor. Read it as "the stop they are heading to,
// or are at right now".
//
//   cursor === -1   The evening has started but they have not checked in
//                   anywhere. `buildItinerary` returns every stop `locked`.
//                   The screen shows the MEETING POINT and a `[ we're here ]`
//                   button. Tapping it stamps nothing — the meeting point has
//                   no `arrivedAt` slot — and moves the cursor to 0.
//
//   cursor === i    Stop i is `current`: name, address, arrive-by, map,
//                   Directions and `why`. `[ we're here ]` means "we have
//                   arrived at this place": it stamps `arrivedAt[i] = now`,
//                   moves the cursor to i+1, and so unlocks exactly one more.
//                   Stop i then reads "you were here at 7:12 PM" — which is
//                   accurate, because the tap happened on arrival.
//
//   cursor >= n     `after`.
//
// Auto-advance does the same thing with an empty timestamp, because `""` is the
// frozen contract's marker for "nobody tapped".

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import {
  TIMING,
  buildItinerary,
  getServerTime,
  hasCoords,
  phaseOf,
  runningStatus,
  shouldAutoAdvance,
  type DateInviteData,
  type DateInvitationTemplateProps,
  type Phase,
  type RsvpState,
} from "./types";
import { headerView } from "./viewModel";
import { INK, PAPER, PAPER_EDGE, UI } from "./dateTheme";
import useReducedMotion from "./useReducedMotion";
import { useWeather } from "./useWeather";

import InvitationCard from "./InvitationCard";
import CountdownScreen from "./CountdownScreen";
import LiveItinerary from "./LiveItinerary";
import AfterScreen from "./AfterScreen";
import { DeclinedScreen, ExpiredScreen, RescheduleScreen } from "./ClosingScreens";
import DevPhaseControl from "./DevPhaseControl";

const DAY = 86_400_000;

/**
 * Demo-only. Produces the clock offset and the recipient-state overlay that put
 * the page into `target`, so all seven screens are reachable without waiting
 * three days. `realNow` is the true clock; `startMs` the parsed `startsAt`.
 */
function devJump(
  target: Phase,
  realNow: number,
  startMs: number,
  stopCount: number,
): { offset: number; rsvp: RsvpState; cursor: number; proposed: string } {
  // How far to push the clock so that `realNow + offset` lands where we want.
  const to = (instant: number) => instant - realNow;
  switch (target) {
    case "invitation":
      return { offset: 0, rsvp: "pending", cursor: -1, proposed: "" };
    case "declined":
      return { offset: 0, rsvp: "declined", cursor: -1, proposed: "" };
    case "reschedule":
      return {
        offset: 0,
        rsvp: "reschedule",
        cursor: -1,
        proposed: new Date(startMs + 7 * DAY).toISOString(),
      };
    case "expired":
      // Past the lenient six-hour window, still unanswered.
      return { offset: to(startMs + TIMING.expiresAfterStartMs + 60_000), rsvp: "pending", cursor: -1, proposed: "" };
    case "countdown":
      return { offset: 0, rsvp: "accepted", cursor: -1, proposed: "" };
    case "live":
      // Ten minutes in, checked in at the meeting point, standing at stop 1.
      return { offset: to(startMs + 10 * 60_000), rsvp: "accepted", cursor: 0, proposed: "" };
    case "after":
      return { offset: to(startMs + 6 * 3600_000), rsvp: "accepted", cursor: stopCount, proposed: "" };
  }
}

export default function DateInvitationTemplate({ data, mode }: DateInvitationTemplateProps) {
  const reduceMotion = useReducedMotion();
  const isDemo = mode === "demo";

  // ── The clock ──────────────────────────────────────────────────────────────
  //
  // The first render must be identical on the server and on the client or React
  // throws away the tree, so it is seeded from the DATA, not from the clock.
  // The effect swaps in the real time on mount, before anything is interactive.
  const startMs = useMemo(() => {
    const t = Date.parse(data.startsAt);
    return Number.isNaN(t) ? 0 : t;
  }, [data.startsAt]);

  const [clockMs, setClockMs] = useState(() => (startMs ? startMs - 1000 : 0));
  const [devOffset, setDevOffset] = useState(0);

  useEffect(() => {
    setClockMs(getServerTime());
    const id = window.setInterval(() => setClockMs(getServerTime()), TIMING.tickMs);
    return () => window.clearInterval(id);
  }, []);

  // Every gating decision in this template reads this value, and only this one.
  const nowMs = clockMs + devOffset;

  // ── Recipient session state ────────────────────────────────────────────────
  const [rsvp, setRsvp] = useState<RsvpState>(data.rsvp);
  const [proposedDate, setProposedDate] = useState(data.proposedDate);
  const [rawCursor, setRawCursor] = useState(data.currentStopIndex);
  const [arrivedAt, setArrivedAt] = useState<string[]>(data.arrivedAt);
  const [photos, setPhotos] = useState<string[]>(data.photos);

  const stopCount = data.stops.length;
  // The sender can change the stop list under us while editing the live
  // preview, so the cursor is clamped on the way out rather than trusted.
  const cursor = Math.max(-1, Math.min(rawCursor, stopCount));

  // A live view of the data with the recipient's answers folded in. This — not
  // the `data` prop — is what the phase machine and `buildItinerary` see.
  const liveData: DateInviteData = useMemo(
    () => ({
      ...data,
      rsvp,
      proposedDate,
      currentStopIndex: cursor,
      arrivedAt: data.stops.map((_, i) => arrivedAt[i] ?? ""),
      photos,
    }),
    [data, rsvp, proposedDate, cursor, arrivedAt, photos],
  );

  const phase = phaseOf(liveData, nowMs);
  const itinerary = useMemo(() => buildItinerary(liveData, phase), [liveData, phase]);
  const view = useMemo(() => headerView(data), [data]);
  const status = runningStatus(liveData, nowMs);

  // ── Weather ────────────────────────────────────────────────────────────────
  //
  // Fetched for the meeting point, and ONLY before the date starts. Once they
  // are out they are on patchy mobile data and nothing may block on the
  // network, so the hook is handed `null` and never calls out. `hasCoords`,
  // not a truthiness check — 0 is a real latitude and our null sentinel.
  const wantsWeather = phase === "invitation" || phase === "countdown";
  const weather = useWeather(
    wantsWeather && hasCoords(data.meetingPoint)
      ? { lat: data.meetingPoint.lat, lng: data.meetingPoint.lng }
      : null,
    data.startsAt,
  );

  // ── Advance ────────────────────────────────────────────────────────────────
  const advance = useCallback(
    (stampIso: string | null) => {
      const from = cursor;
      if (from >= stopCount) return;
      if (from >= 0 && stampIso) {
        // TODO(server): PATCH /date-invitation-pages/share/:shareId/arrival
        // { index, at } so the sender sees them move through the evening.
        setArrivedAt((a) => {
          const next = data.stops.map((_, i) => a[i] ?? "");
          next[from] = stampIso;
          return next;
        });
      }
      setRawCursor(from + 1);
    },
    [cursor, stopCount, data.stops],
  );

  /** The `[ we're here ]` tap. Unlocks exactly one stop. */
  const onAdvance = useCallback(() => {
    advance(new Date(nowMs).toISOString());
  }, [advance, nowMs]);

  // Auto-advance: twenty minutes past the NEXT stop's arrival time, a forgotten
  // tap stops costing them the rest of the itinerary. Stamped `""`, which the
  // frozen contract reads as "nobody tapped".
  const autoRef = useRef(advance);
  autoRef.current = advance;
  useEffect(() => {
    if (phase !== "live") return;
    if (!shouldAutoAdvance(liveData, nowMs)) return;
    autoRef.current(null);
  }, [phase, liveData, nowMs]);

  // ── RSVP ───────────────────────────────────────────────────────────────────
  // TODO(server): POST /date-invitation-pages/share/:shareId/rsvp
  // { state, proposedDate } so the sender is actually told the answer. Until
  // that exists this is session state: it does not survive a refresh and it
  // does not reach him. We are not inventing an unauthenticated write endpoint.
  const onAccept = useCallback(() => setRsvp("accepted"), []);
  const onDecline = useCallback(() => setRsvp("declined"), []);
  const onReschedule = useCallback((iso: string) => {
    setProposedDate(iso);
    setRsvp("reschedule");
  }, []);

  // TODO(server): POST the photos to the page so they survive the evening.
  const onAddPhotos = useCallback((urls: string[]) => {
    setPhotos((p) => [...p, ...urls].slice(0, 12));
  }, []);

  // ── Demo phase jump ────────────────────────────────────────────────────────
  const onJump = useCallback(
    (target: Phase) => {
      if (!isDemo) return;
      const j = devJump(target, getServerTime(), startMs, stopCount);
      setDevOffset(j.offset);
      setRsvp(j.rsvp);
      setRawCursor(j.cursor);
      setProposedDate(j.proposed);
      setArrivedAt(
        target === "after"
          ? data.stops.map((s) => s.arriveAt)
          : data.stops.map(() => ""),
      );
      if (target !== "after") setPhotos([]);
      setClockMs(getServerTime());
      window.scrollTo({ top: 0, behavior: "auto" });
    },
    [isDemo, startMs, stopCount, data.stops],
  );

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: PAPER,
        color: INK,
        position: "relative",
        // Clear of the dev bar in demo mode and of nothing in live mode.
        paddingBottom: isDemo ? 64 : 0,
      }}
    >
      {/* The recipient's route back to us, and the only chrome on a live page. */}
      {mode === "live" && (
        <Link
          href="/templates"
          aria-label="SubhSandesh — make your own"
          className="fixed right-3 top-3 z-[95] inline-flex items-center gap-1.5 rounded-full px-3 py-1.5"
          style={{
            background: "rgba(253,250,243,0.94)",
            border: `1px solid ${PAPER_EDGE}`,
            boxShadow: "0 4px 14px rgba(58,44,32,0.14)",
            textDecoration: "none",
            backdropFilter: "blur(6px)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.webp" alt="" width={18} height={18} style={{ width: 18, height: 18 }} />
          <span className="text-[11px] font-semibold" style={{ color: INK, fontFamily: UI }}>
            SubhSandesh
          </span>
        </Link>
      )}

      {phase === "invitation" && (
        <InvitationCard
          view={view}
          weather={weather}
          onAccept={onAccept}
          onDecline={onDecline}
          onReschedule={onReschedule}
          reduceMotion={reduceMotion}
        />
      )}

      {phase === "countdown" && (
        <CountdownScreen view={view} nowMs={nowMs} weather={weather} reduceMotion={reduceMotion} />
      )}

      {phase === "live" && (
        <LiveItinerary
          view={view}
          itinerary={itinerary}
          status={status}
          cursor={cursor}
          nowMs={nowMs}
          weather={weather}
          onAdvance={onAdvance}
          reduceMotion={reduceMotion}
        />
      )}

      {phase === "after" && (
        <AfterScreen
          data={liveData}
          itinerary={itinerary}
          photos={photos}
          onAddPhotos={onAddPhotos}
          reduceMotion={reduceMotion}
        />
      )}

      {phase === "declined" && <DeclinedScreen view={view} />}
      {phase === "reschedule" && <RescheduleScreen view={view} proposedDate={proposedDate} />}
      {phase === "expired" && <ExpiredScreen view={view} />}

      {isDemo && <DevPhaseControl phase={phase} onJump={onJump} />}
    </div>
  );
}
