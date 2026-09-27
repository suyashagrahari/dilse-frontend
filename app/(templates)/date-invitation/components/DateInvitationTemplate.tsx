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

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
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
  MAX_MEMORIES,
  type Memory,
  type Phase,
  type RsvpState,
} from "./types";
import { useAppSelector } from "@/store/hooks";
import { compressPhoto, deleteMemory, fetchLive, sendCheckIn, sendMemory, sendRsvp, type LiveState } from "./liveApi";
import SongPlayer from "./SongPlayer";
import type { CheckInMode } from "./StopCard";
import { headerView } from "./viewModel";
import { GROTESK, MOON, NIGHT } from "./dateTheme";
import { DATE_FONT_VARS } from "./fonts";
import { DemoNudge, NIGHT_CSS, NightSky } from "./NightKit";
import useReducedMotion from "./useReducedMotion";
import { useWeather } from "./useWeather";

import InvitationCard from "./InvitationCard";
import CountdownScreen from "./CountdownScreen";
import LiveItinerary from "./LiveItinerary";
import AfterScreen from "./AfterScreen";
import { DeclinedScreen, ExpiredScreen, RescheduleScreen } from "./ClosingScreens";

const DAY = 86_400_000;

/** "7:12 pm" today, "Sat 7:12 pm" otherwise — for the host banner. */
function hostTime(iso: string): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "";
  const d = new Date(t);
  const time = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit", hour12: true });
  return d.toDateString() === new Date().toDateString() ? time : `${d.toLocaleDateString(undefined, { weekday: "short" })} ${time}`;
}

// ─── The clock, as an external store ─────────────────────────────────────────
//
// One interval for the whole module, started on the first subscriber and torn
// down after the last. `readClock` must return a value that is stable between
// ticks — returning `getServerTime()` directly would give React a new number on
// every call and re-render forever — so the reading is latched into `tick` and
// only moved by the interval.

let tick = 0;
const clockListeners = new Set<() => void>();
let clockTimer: number | null = null;

function subscribeToClock(onChange: () => void): () => void {
  clockListeners.add(onChange);
  if (clockTimer === null) {
    tick = getServerTime();
    clockTimer = window.setInterval(() => {
      tick = getServerTime();
      clockListeners.forEach((l) => l());
    }, TIMING.tickMs);
  }
  return () => {
    clockListeners.delete(onChange);
    if (clockListeners.size === 0 && clockTimer !== null) {
      window.clearInterval(clockTimer);
      clockTimer = null;
    }
  };
}

/** Latched, so repeated calls within a tick are `Object.is`-equal. */
function readClock(): number {
  if (tick === 0) tick = getServerTime();
  return tick;
}

/**
 * Pull the latch forward immediately. Only the demo phase-jump needs this: it
 * computes its offset against the true clock, so leaving the latch up to a
 * second stale would land the jump up to a second off.
 */
function resyncClock(): void {
  tick = getServerTime();
  clockListeners.forEach((l) => l());
}

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

export default function DateInvitationTemplate({ data, mode, shareId }: DateInvitationTemplateProps) {
  const reduceMotion = useReducedMotion();
  const isDemo = mode === "demo";
  // A published page with a share id is a shared evening: the server is the
  // source of truth for the answer, the check-ins and the photos.
  const isShared = mode === "live" && !!shareId;
  const { accessToken } = useAppSelector((s) => s.auth);

  // ── The clock ──────────────────────────────────────────────────────────────
  //
  // The first render must be identical on the server and on the client or React
  // throws away the tree, so it is seeded from the DATA, not from the clock.
  // The effect swaps in the real time on mount, before anything is interactive.
  const startMs = useMemo(() => {
    const t = Date.parse(data.startsAt);
    return Number.isNaN(t) ? 0 : t;
  }, [data.startsAt]);

  // A ticking clock is an external store, so it is subscribed to as one. The
  // previous shape — seed from data, then overwrite from a mount effect — meant
  // a synchronous setState during commit on every mount. `useSyncExternalStore`
  // gets the same hydration safety for free: React renders the server snapshot
  // (seeded from the data, so server and client agree) and swaps to the live
  // reading once hydration is done, without a cascading render.
  const serverSnapshot = useCallback(() => (startMs ? startMs - 1000 : 0), [startMs]);
  const clockMs = useSyncExternalStore(subscribeToClock, readClock, serverSnapshot);
  const [devOffset, setDevOffset] = useState(0);

  // Every gating decision in this template reads this value, and only this one.
  const nowMs = clockMs + devOffset;

  // ── Recipient session state ────────────────────────────────────────────────
  const [rsvp, setRsvp] = useState<RsvpState>(data.rsvp);
  const [proposedDate, setProposedDate] = useState(data.proposedDate);
  const [rawCursor, setRawCursor] = useState(data.currentStopIndex);
  const [arrivedAt, setArrivedAt] = useState<string[]>(data.arrivedAt);
  const [memories, setMemories] = useState<Memory[]>(data.memories);
  // Who is looking. "host" = the sender on their own link, "guest" = anyone
  // else with it. Unknown until the first live read comes back.
  const [role, setRole] = useState<"host" | "guest" | null>(null);
  const [rsvpAt, setRsvpAt] = useState("");
  const [notice, setNotice] = useState("");

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
      memories,
    }),
    [data, rsvp, proposedDate, cursor, arrivedAt, memories],
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

  // Fold a server reading of the shared evening into local state. Local state
  // moves first (so a tap feels instant); the cursor only ever moves forward
  // unless the server's answer is authoritative (a check-in response).
  const applyLive = useCallback(
    (live: LiveState, authoritative = false) => {
      setRole(live.isOwner ? "host" : "guest");
      setRsvp(live.rsvp);
      setRsvpAt(live.rsvpAt);
      setProposedDate(live.proposedDate);
      setRawCursor((c) => (authoritative ? live.currentStopIndex : Math.max(c, live.currentStopIndex)));
      setArrivedAt((a) => data.stops.map((_, i) => live.arrivedAt[i] || a[i] || ""));
      setMemories(live.memories);
    },
    [data.stops],
  );

  // ── Advance ────────────────────────────────────────────────────────────────
  const advance = useCallback(
    (stampIso: string | null) => {
      const from = cursor;
      if (from >= stopCount) return;
      if (from >= 0 && stampIso) {
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

  /** The `[ we're here ]` tap. Unlocks exactly one stop — on both phones. */
  const onAdvance = useCallback(() => {
    if (isShared && role !== "host") return;
    const from = cursor;
    advance(new Date(nowMs).toISOString());
    if (isShared && shareId) {
      void sendCheckIn(shareId, accessToken, from).then((r) => {
        if (r.ok) applyLive(r.data, true);
        else setNotice(r.error);
      });
    }
  }, [advance, nowMs, isShared, role, cursor, shareId, accessToken, applyLive]);

  // Auto-advance: twenty minutes past the NEXT stop's arrival time, a forgotten
  // tap stops costing them the rest of the itinerary. Stamped `""`, which the
  // frozen contract reads as "nobody tapped".
  // The ref exists so the auto-advance effect below does not re-fire every time
  // `advance` gets a new identity. Synced in its own effect rather than during
  // render — effects run in declaration order, so this lands before the one
  // that reads it on the same commit.
  const autoRef = useRef(advance);
  useEffect(() => {
    autoRef.current = advance;
  }, [advance]);
  useEffect(() => {
    if (phase !== "live") return;
    if (!shouldAutoAdvance(liveData, nowMs)) return;
    autoRef.current(null);
  }, [phase, liveData, nowMs]);

  // ── The shared evening ─────────────────────────────────────────────────────
  //
  // Both of them poll the page: she sees his check-ins arrive, he sees her
  // answer land. Local state moves first (so a tap feels instant) and the
  // server's answer is folded in; the cursor only ever moves forward.
  const pollMs = phase === "live" ? 5000 : phase === "invitation" || phase === "countdown" ? 8000 : 12000;
  useEffect(() => {
    if (!isShared || !shareId) return;
    let alive = true;
    const pull = () => {
      if (document.visibilityState === "hidden") return;
      void fetchLive(shareId, accessToken).then((r) => {
        if (alive && r.ok) applyLive(r.data);
      });
    };
    pull();
    const id = window.setInterval(pull, pollMs);
    document.addEventListener("visibilitychange", pull);
    return () => {
      alive = false;
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", pull);
    };
  }, [isShared, shareId, accessToken, pollMs, applyLive]);

  useEffect(() => {
    if (!notice) return;
    const id = window.setTimeout(() => setNotice(""), 4200);
    return () => window.clearTimeout(id);
  }, [notice]);

  // ── RSVP ───────────────────────────────────────────────────────────────────
  // Only the recipient answers. On a shared page the answer goes to the server
  // (which emails the sender); if that fails the screen steps back so she can
  // try again rather than believing an answer that never arrived.
  const answer = useCallback(
    (state: Exclude<RsvpState, "pending">, iso = "") => {
      if (isShared && role === "host") return;
      const prev = { rsvp, proposedDate };
      setRsvp(state);
      setProposedDate(state === "reschedule" ? iso : "");
      if (!isShared || !shareId) return;
      void sendRsvp(shareId, accessToken, state, iso).then((r) => {
        if (r.ok) applyLive(r.data);
        else {
          setRsvp(prev.rsvp);
          setProposedDate(prev.proposedDate);
          setNotice(r.error);
        }
      });
    },
    [isShared, role, rsvp, proposedDate, shareId, accessToken, applyLive],
  );
  const onAccept = useCallback(() => answer("accepted"), [answer]);
  const onDecline = useCallback(() => answer("declined"), [answer]);
  const onReschedule = useCallback((iso: string) => answer("reschedule", iso), [answer]);

  // ── Photos from the night ──────────────────────────────────────────────────
  const me: "sender" | "recipient" | null = isDemo ? "recipient" : role === "host" ? "sender" : role === "guest" ? "recipient" : null;

  const onAddMemory = useCallback(
    async (file: File, stopId: string, title: string): Promise<string | null> => {
      if (memories.length >= MAX_MEMORIES) return `That's all ${MAX_MEMORIES} photos`;
      let image: string;
      try {
        image = await compressPhoto(file);
      } catch {
        return "That photo couldn't be read — try another";
      }
      if (!isShared || !shareId) {
        // Preview: kept on this screen only.
        setMemories((m) =>
          [...m, { id: `demo-${Date.now()}`, url: image, stopId, title, by: "recipient" as const, at: new Date().toISOString() }].slice(0, MAX_MEMORIES),
        );
        return null;
      }
      const r = await sendMemory(shareId, accessToken, image, stopId, title);
      if (!r.ok) return r.error;
      applyLive(r.data);
      return null;
    },
    [memories.length, isShared, shareId, accessToken, applyLive],
  );

  const onRemoveMemory = useCallback(
    async (id: string) => {
      if (!isShared || !shareId) {
        setMemories((m) => m.filter((x) => x.id !== id));
        return;
      }
      const r = await deleteMemory(shareId, accessToken, id);
      if (r.ok) applyLive(r.data);
      else setNotice(r.error);
    },
    [isShared, shareId, accessToken, applyLive],
  );

  const checkIn: CheckInMode = {
    kind: isDemo ? "demo" : role === "host" ? "host" : "guest",
    hostName: data.senderName || "your date",
  };
  const viewer: "guest" | "host" | "demo" = isDemo ? "demo" : role === "host" ? "host" : "guest";

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
      if (target !== "after") setMemories([]);
      resyncClock();
      window.scrollTo({ top: 0, behavior: "auto" });
    },
    [isDemo, startMs, stopCount, data.stops],
  );

  // The demo preview offers the natural next step instead of a phase bar.
  const nudge: { label: string; emoji: string; to: Phase } | null = !isDemo
    ? null
    : phase === "countdown"
      ? { label: "peek at date night", emoji: "⏩", to: "live" }
      : phase === "invitation"
        ? null
        : phase === "live"
          ? null
          : { label: "replay from the invite", emoji: "↺", to: "invitation" };

  return (
    <div
      className={DATE_FONT_VARS}
      style={{
        minHeight: "100dvh",
        background: NIGHT,
        color: MOON,
        position: "relative",
        isolation: "isolate",
        overflowX: "clip",
        paddingBottom: nudge ? 76 : 0,
      }}
    >
      <style>{NIGHT_CSS}</style>
      <NightSky reduceMotion={reduceMotion} />

      {/* The recipient's route back to us, and the only chrome on a live page. */}
      {mode === "live" && (
        <Link
          href="/templates"
          aria-label="SubhSandesh — make your own"
          className="fixed right-3 top-3 z-[95] inline-flex items-center gap-1.5 rounded-full px-3 py-1.5"
          style={{
            background: "rgba(18,8,31,0.6)",
            border: "1px solid rgba(255,255,255,0.16)",
            boxShadow: "0 8px 20px -10px rgba(0,0,0,0.6)",
            textDecoration: "none",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.webp" alt="" width={18} height={18} style={{ width: 18, height: 18 }} />
          <span className="text-[11px] font-semibold" style={{ color: MOON, fontFamily: GROTESK }}>
            SubhSandesh
          </span>
        </Link>
      )}

      {/* The host's own view of the shared evening: what she answered, and a
          reminder that the check-in button is theirs alone. */}
      {isShared && role === "host" && (
        <div
          className="fixed left-3 top-3 z-[95] max-w-[62vw] rounded-full px-3.5 py-2"
          style={{
            background: rsvp === "accepted" ? "#d8ff5c" : "rgba(18,8,31,0.72)",
            color: rsvp === "accepted" ? "#1a0d26" : MOON,
            border: rsvp === "accepted" ? "none" : "1px solid rgba(255,255,255,0.16)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            fontFamily: GROTESK,
            fontSize: 12.5,
            fontWeight: 800,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            boxShadow: "0 8px 20px -10px rgba(0,0,0,0.6)",
          }}
          aria-live="polite"
        >
          {rsvp === "accepted"
            ? `💘 ${data.recipientName} said yes${rsvpAt ? ` · ${hostTime(rsvpAt)}` : ""}`
            : rsvp === "declined"
              ? `${data.recipientName} answered`
              : rsvp === "reschedule"
                ? `📅 ${data.recipientName} suggested another day`
                : `🎛️ host view · waiting for ${data.recipientName}`}
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="fixed left-1/2 z-[150] -translate-x-1/2 rounded-full px-4 py-2.5 text-center"
          style={{
            top: 70,
            maxWidth: "calc(100vw - 32px)",
            background: "#fff6fb",
            color: "#1a0d26",
            fontFamily: GROTESK,
            fontSize: 13.5,
            fontWeight: 700,
            boxShadow: "0 14px 30px -12px rgba(0,0,0,0.7)",
          }}
        >
          {notice}
        </div>
      )}

      {data.songId && (
        <SongPlayer songId={data.songId} title={data.songTitle} lift={nudge ? 64 : 0} reduceMotion={reduceMotion} />
      )}

      {phase === "invitation" && (
        <InvitationCard
          view={view}
          weather={weather}
          onAccept={onAccept}
          onDecline={onDecline}
          onReschedule={onReschedule}
          reduceMotion={reduceMotion}
          viewer={viewer}
        />
      )}

      {phase === "countdown" && (
        <CountdownScreen view={view} nowMs={nowMs} weather={weather} reduceMotion={reduceMotion} viewer={viewer} />
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
          checkIn={checkIn}
        />
      )}

      {phase === "after" && (
        <AfterScreen
          data={liveData}
          itinerary={itinerary}
          memories={memories}
          maxMemories={MAX_MEMORIES}
          me={me}
          onAddMemory={onAddMemory}
          onRemoveMemory={onRemoveMemory}
          reduceMotion={reduceMotion}
        />
      )}

      {phase === "declined" && <DeclinedScreen view={view} />}
      {phase === "reschedule" && <RescheduleScreen view={view} proposedDate={proposedDate} />}
      {phase === "expired" && <ExpiredScreen view={view} />}

      {nudge && <DemoNudge label={nudge.label} emoji={nudge.emoji} onClick={() => onJump(nudge.to)} />}
    </div>
  );
}
