// ─── Session state, held outside React ───────────────────────────────────────
//
// WHY AN EXTERNAL STORE RATHER THAN useState.
//
// Three separate things in this template have to write state from outside a
// user gesture: the mock partner poll, the both-in moment that must fire on
// open when the second check-in happened hours ago, and the multi-phase merge
// animation. Every one of those is a timer, and `react-hooks/set-state-in-
// effect` (correctly) does not want React state written from an effect.
//
// `useSyncExternalStore` is the sanctioned answer. Timers mutate a plain store;
// React subscribes. No `setState` in an effect anywhere in this template, and
// no suppressions.
//
// NOTHING HERE TOUCHES localStorage OR sessionStorage. Draft and session state
// live in memory for the lifetime of the page, by design.

"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import {
  COPY,
  addDays,
  checkInKey,
  dayKeyInZone,
  deriveStreak,
  getServerTime,
  isComplete,
  coversAvailable,
  LIMITS,
  MAX_COVERS,
  type CheckInDay,
  type CheckInEntry,
  type Side,
  type StreakData,
  type StreakStatus,
  type StreakView,
} from "./types";
import { other, pairIdOf } from "./demoData";

// ═══════════════════════════════════════════════════════════════════════════
// A minimal store
// ═══════════════════════════════════════════════════════════════════════════

export interface Store<T> {
  subscribe: (cb: () => void) => () => void;
  get: () => T;
  set: (updater: T | ((prev: T) => T)) => void;
}

export function createStore<T>(initial: T): Store<T> {
  let value = initial;
  const listeners = new Set<() => void>();
  return {
    subscribe(cb) {
      listeners.add(cb);
      return () => {
        listeners.delete(cb);
      };
    },
    get: () => value,
    set(updater) {
      const next = typeof updater === "function" ? (updater as (p: T) => T)(value) : updater;
      if (Object.is(next, value)) return;
      value = next;
      for (const l of [...listeners]) l();
    },
  };
}

/** Subscribe a component to a store. Identical snapshot on server and client. */
export function useStore<T>(store: Store<T>): T {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}

/** Read one derived slice, so a component only re-renders when that changes. */
export function useStoreSlice<T, S>(store: Store<T>, select: (s: T) => S): S {
  const get = useCallback(() => select(store.get()), [store, select]);
  return useSyncExternalStore(store.subscribe, get, get);
}

// ═══════════════════════════════════════════════════════════════════════════
// Environment hooks — all `useSyncExternalStore`, never `setState` in an effect
// ═══════════════════════════════════════════════════════════════════════════

let rmMql: MediaQueryList | null | undefined;
function reducedMotionMql(): MediaQueryList | null {
  if (rmMql !== undefined) return rmMql;
  rmMql =
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-reduced-motion: reduce)")
      : null;
  return rmMql;
}
const subscribeReducedMotion = (cb: () => void) => {
  const m = reducedMotionMql();
  if (!m) return () => {};
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};
const getReducedMotion = () => reducedMotionMql()?.matches ?? false;
const getReducedMotionServer = () => false;

/**
 * Honoured throughout: no fade on a new light, no bloom, no re-light sweep, the
 * envelope opens instantly. Every one of those paths still FUNCTIONS — reduced
 * motion removes the motion, never the feature.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribeReducedMotion, getReducedMotion, getReducedMotionServer);
}

const subscribeNever = () => () => {};
const getTrue = () => true;
const getFalse = () => false;

/** False during SSR and the first paint, true after hydration. */
export function useMounted(): boolean {
  return useSyncExternalStore(subscribeNever, getTrue, getFalse);
}

// A single shared minute ticker. Quantised so the snapshot is stable between
// reads — `Date.now()` as a snapshot would tear on every render.
let minuteValue = Math.floor(getServerTime() / 60_000);
const minuteListeners = new Set<() => void>();
let minuteTimer: ReturnType<typeof setInterval> | null = null;
const subscribeMinute = (cb: () => void) => {
  minuteListeners.add(cb);
  if (!minuteTimer) {
    minuteTimer = setInterval(() => {
      const next = Math.floor(getServerTime() / 60_000);
      if (next === minuteValue) return;
      minuteValue = next;
      for (const l of [...minuteListeners]) l();
    }, 15_000);
  }
  return () => {
    minuteListeners.delete(cb);
    if (minuteListeners.size === 0 && minuteTimer) {
      clearInterval(minuteTimer);
      minuteTimer = null;
    }
  };
};
const getMinute = () => minuteValue;

/**
 * Today, in the PAIR's zone — re-evaluated as the clock runs so a page left
 * open across midnight rolls over on its own.
 *
 * There is deliberately no countdown anywhere near this. The day changing is
 * something the page notices, never something it warns you about.
 */
export function useToday(timezone: string): string {
  const minute = useSyncExternalStore(subscribeMinute, getMinute, getMinute);
  return useMemo(() => dayKeyInZone(minute * 60_000, timezone), [minute, timezone]);
}

// ═══════════════════════════════════════════════════════════════════════════
// The session
// ═══════════════════════════════════════════════════════════════════════════

/** drift → bloom → settled. `settled` persists; the line beneath stays. */
export type MomentPhase = "drift" | "bloom" | "settled";

export interface MomentState {
  date: string;
  /** The number the count-up lands on. */
  day: number;
  /** The number it starts from. */
  from: number;
  phase: MomentPhase;
  /** True when my own check-in was the one that completed the day. */
  mine: boolean;
}

export interface SessionState {
  data: StreakData;
  me: Side;
  /** Applied `checkInKey`s — the idempotency guard for double submits. */
  applied: string[];
  /** Dates whose moment has already played this session. */
  played: string[];
  moment: MomentState | null;
  /** A transient line from COPY. Never an error, never a warning. */
  notice: string | null;
  /**
   * Check-ins recorded while offline.
   * TODO(offline-persistence): this is IN-MEMORY ONLY — storage is off-limits
   * in this template, so a reload before reconnecting loses the queue. The
   * check-in itself is never rejected; the queue only tracks what still has to
   * reach the server.
   */
  queue: string[];
  /** Dates whose light should fade in rather than simply being there. */
  freshLights: string[];
  /** Re-lighting sweep after returning from dormancy. */
  relighting: boolean;
  /** The day-100 canopy. One-shot; `hundredPlayed` is never cleared. */
  hundredRunning: boolean;
  hundredPlayed: boolean;
}

export interface CheckInResult {
  status: "ok" | "already";
  /** `checkInKey(pairId, date, side)` — the server's unique index. */
  key: string;
  date: string;
  entry: CheckInEntry | null;
}

export interface StreakSession {
  store: Store<SessionState>;
  /**
   * Which half of the pair is looking.
   *
   * In the published view this is resolved BY THE SERVER from the link's token
   * and handed down — never inferred here, and never read from the URL.
   */
  setMe: (side: Side) => void;
  /** Fold the server's view of a day into local state. */
  mergeServerDay: (day: CheckInDay) => void;
  /** Records MY check-in for today. Idempotent on `checkInKey`. */
  checkIn: () => CheckInResult;
  /** A key left the queue because the server acknowledged it. */
  clearQueued: (key: string) => void;
  /** Word / photo / note, all optional, all after the fact. */
  patchEntry: (patch: Partial<Pick<CheckInEntry, "word" | "photoUrl" | "note">>) => void;
  /** A media failure must never invalidate the check-in. */
  photoFailed: () => void;
  spendCover: (date: string) => void;
  /** TODO(realtime): replace with a socket event from the partner's device. */
  partnerCheckIn: () => void;
  /** DEMO ONLY — jumps the log so a status can be looked at. Never on live. */
  demoSetStatus: (status: StreakStatus) => void;
  /** TODO(realtime): the poll stands in for a subscription. */
  poll: () => void;
  advanceMoment: (phase: MomentPhase) => void;
  setNotice: (msg: string | null) => void;
  openMilestone: (atDay: number) => void;
  startHundred: () => void;
  endHundred: () => void;
  endRelight: () => void;
}

const nowIso = () => new Date(getServerTime()).toISOString();

/**
 * Did this change bring the pair back from dormancy?
 *
 * Needed in three places — my check-in, the partner's, and a server merge —
 * because a revival is a property of the DAY completing, not of who completed
 * it. Only checking it on my own tap meant the re-light sweep never ran for the
 * partner who was second back.
 */
const revived = (before: StreakView, after: StreakView): boolean =>
  before.status === "dormant" && after.status !== "dormant";

const dayOf = (data: StreakData, date: string): CheckInDay | undefined =>
  data.checkIns.find((d) => d.date === date);

/** Immutably merge one side's entry into one day, keeping the log sorted. */
function withEntry(data: StreakData, date: string, side: Side, entry: CheckInEntry): StreakData {
  const existing = dayOf(data, date);
  const merged: CheckInDay = existing
    ? { ...existing, [side]: entry }
    : { date, [side]: entry };
  const rest = data.checkIns.filter((d) => d.date !== date);
  return { ...data, checkIns: [...rest, merged].sort((x, y) => (x.date < y.date ? -1 : 1)) };
}

export function createSession(data: StreakData, me: Side): StreakSession {
  const store = createStore<SessionState>({
    data,
    me,
    applied: [],
    played: [],
    moment: null,
    notice: null,
    queue: [],
    freshLights: [],
    relighting: false,
    hundredRunning: false,
    hundredPlayed: false,
  });

  const today = () => dayKeyInZone(getServerTime(), store.get().data.timezone);

  /**
   * The both-in moment.
   *
   * Fires when a day becomes complete WITH BOTH ENTRIES — a covered day is
   * complete but is not a moment; nobody's rings merged. `played` makes it
   * one-shot per session, and the fact that it is checked on every poll (the
   * first of which runs on mount) is what delivers the moment to the partner
   * who was not looking when it happened.
   */
  function syncMoment(mine: boolean): void {
    const s = store.get();
    if (s.moment) return;
    const date = today();
    if (s.played.includes(date)) return;
    const day = dayOf(s.data, date);
    if (!day?.a || !day.b) return;

    const view = deriveStreak(s.data, date);
    store.set({
      ...s,
      moment: { date, day: view.count, from: Math.max(0, view.count - 1), phase: "drift", mine },
      played: [...s.played, date],
    });
  }

  function checkIn(): CheckInResult {
    const s = store.get();
    const date = today();
    const key = checkInKey(pairIdOf(s.data), date, s.me);

    // Two taps in the same second, or a second visit later in the day: both
    // land here and both are no-ops.
    if (s.applied.includes(key) || dayOf(s.data, date)?.[s.me]) {
      store.set({ ...s, applied: s.applied.includes(key) ? s.applied : [...s.applied, key], notice: COPY.alreadyIn });
      return { status: "already", key, date, entry: dayOf(s.data, date)?.[s.me] ?? null };
    }

    const entry: CheckInEntry = { word: "", at: nowIso() };
    const before = deriveStreak(s.data, date);
    const nextData = withEntry(s.data, date, s.me, entry);
    const after = deriveStreak(nextData, date);
    const completedNow = isComplete(dayOf(nextData, date)) && !isComplete(dayOf(s.data, date));
    const bothIn = Boolean(dayOf(nextData, date)?.a && dayOf(nextData, date)?.b);

    // A dropped signal must not lose a check-in. It counts locally either way.
    const offline = typeof navigator !== "undefined" && navigator.onLine === false;

    store.set({
      ...s,
      data: nextData,
      applied: [...s.applied, key],
      queue: offline ? [...s.queue, key] : s.queue,
      notice: offline ? COPY.queued : null,
      freshLights: completedNow ? [...s.freshLights, date] : s.freshLights,
      relighting: revived(before, after),
      moment:
        completedNow && bothIn && !s.played.includes(date)
          ? { date, day: after.count, from: before.count, phase: "drift", mine: true }
          : s.moment,
      played: completedNow && bothIn ? [...s.played, date] : s.played,
    });

    // The caller POSTs this with `key` as the idempotency token. Whether that
    // request succeeds has no bearing on the day having counted.
    return { status: "ok", key, date, entry };
  }

  function patchEntry(patch: Partial<Pick<CheckInEntry, "word" | "photoUrl" | "note">>): void {
    const s = store.get();
    const date = today();
    const mine = dayOf(s.data, date)?.[s.me];
    if (!mine) return;
    const next: CheckInEntry = { ...mine };
    // Stored as entered, emoji included. `truncWord` handles DISPLAY only.
    if (patch.word !== undefined) next.word = patch.word;
    if (patch.photoUrl !== undefined) next.photoUrl = patch.photoUrl || undefined;
    if (patch.note !== undefined) {
      const trimmed = patch.note.slice(0, LIMITS.note);
      next.note = trimmed.trim() ? trimmed : undefined;
    }
    store.set({ ...s, data: withEntry(s.data, date, s.me, next) });
  }

  function photoFailed(): void {
    // The check-in already counted. This is the entire contract of this method.
    store.set({ ...store.get(), notice: COPY.photoFailed });
  }

  function spendCover(date: string): void {
    const s = store.get();
    if (coversAvailable(s.data, s.me) < 1) return;
    const day = dayOf(s.data, date);

    // `isComplete` needs at least one entry on a covered day. If the day is
    // entirely empty, spending the cover also records the spender's own tap —
    // they are vouching that the day happened, they just did not press.
    let data = s.data;
    if (!day?.a && !day?.b) data = withEntry(data, date, s.me, { word: "", at: nowIso() });

    const after = dayOf(data, date);
    const missing: Side = !after?.a ? "a" : !after?.b ? "b" : other(s.me);
    const rest = data.checkIns.filter((d) => d.date !== date);
    const merged: CheckInDay = { ...(after as CheckInDay), covered: missing };

    store.set({
      ...s,
      data: {
        ...data,
        checkIns: [...rest, merged].sort((x, y) => (x.date < y.date ? -1 : 1)),
        covers: {
          ...data.covers,
          [s.me]: Math.max(0, Math.min(MAX_COVERS, data.covers[s.me] - 1)),
        },
      },
      freshLights: [...s.freshLights, date],
      notice: null,
    });
  }

  /** TODO(realtime): stands in for the partner's device pushing an event. */
  function partnerCheckIn(): void {
    const s = store.get();
    const date = today();
    const them = other(s.me);
    if (dayOf(s.data, date)?.[them]) return;
    const before = deriveStreak(s.data, date);
    const nextData = withEntry(s.data, date, them, { word: "", at: nowIso() });
    const after = deriveStreak(nextData, date);
    store.set({
      ...s,
      data: nextData,
      freshLights: isComplete(dayOf(nextData, date)) ? [...s.freshLights, date] : s.freshLights,
      relighting: s.relighting || revived(before, after),
    });
    syncMoment(false);
  }

  /**
   * DEMO ONLY. Rewrites the check-in log so `deriveStreak` lands on a chosen
   * status, purely so the repairable and dormant screens can be looked at.
   *
   * Never reachable from a published page — `StreakTemplate` renders the
   * control behind `mode === "demo"`.
   * TODO(realtime): delete alongside the rest of the debug panel.
   */
  function demoSetStatus(status: StreakStatus): void {
    const s = store.get();
    const date = today();
    // repairable: last complete day is the day before yesterday, so exactly one
    // day is missed and `now` is still inside the 48h window.
    // dormant: the gap is wide enough that the window has long since passed.
    const keepBefore = status === "repairable" ? addDays(date, -1) : addDays(date, -10);
    const checkIns = status === "active" ? s.data.checkIns : s.data.checkIns.filter((d) => d.date < keepBefore);
    store.set({
      ...s,
      data: { ...s.data, checkIns },
      moment: null,
      played: [],
      freshLights: [],
      relighting: false,
      notice: null,
    });
  }

  /**
   * Fold the server's view of a day into local state.
   *
   * The server is authoritative about the PARTNER. It is not authoritative
   * about me in the other direction: a locally-recorded check-in that has not
   * yet been acknowledged must survive a poll, or a check-in made offline would
   * visibly un-happen the moment the connection came back.
   */
  function mergeServerDay(day: CheckInDay): void {
    const s = store.get();
    const local = dayOf(s.data, day.date);
    const them = other(s.me);
    const merged: CheckInDay = {
      date: day.date,
      [s.me]: local?.[s.me] ?? day[s.me],
      [them]: day[them] ?? local?.[them],
      ...(day.covered ?? local?.covered ? { covered: day.covered ?? local?.covered } : {}),
    };
    for (const side of ["a", "b"] as Side[]) if (!merged[side]) delete merged[side];

    const rest = s.data.checkIns.filter((d) => d.date !== day.date);
    const nextDays = (merged.a || merged.b ? [...rest, merged] : rest).sort((x, y) =>
      x.date < y.date ? -1 : 1,
    );
    const nowComplete = isComplete(merged);
    const wasComplete = isComplete(local);
    const nextData = { ...s.data, checkIns: nextDays };

    store.set({
      ...s,
      data: nextData,
      freshLights: nowComplete && !wasComplete ? [...s.freshLights, day.date] : s.freshLights,
      relighting:
        s.relighting ||
        revived(deriveStreak(s.data, day.date), deriveStreak(nextData, day.date)),
    });
    syncMoment(false);
  }

  return {
    store,
    setMe: (side) => {
      const s = store.get();
      if (s.me === side) return;
      store.set({ ...s, me: side });
    },
    mergeServerDay,
    demoSetStatus,
    checkIn,
    clearQueued: (key) => {
      const s = store.get();
      if (!s.queue.includes(key)) return;
      const queue = s.queue.filter((k) => k !== key);
      store.set({ ...s, queue, notice: queue.length === 0 && s.notice === COPY.queued ? null : s.notice });
    },
    patchEntry,
    photoFailed,
    spendCover,
    partnerCheckIn,
    poll: () => syncMoment(false),
    advanceMoment: (phase) => {
      const s = store.get();
      if (!s.moment) return;
      store.set({ ...s, moment: { ...s.moment, phase } });
    },
    setNotice: (notice) => store.set({ ...store.get(), notice }),
    openMilestone: (atDay) => {
      const s = store.get();
      const milestones = s.data.milestones.map((m) =>
        // Set once. There is no path in this file that clears `openedOn`.
        m.atDay === atDay && !m.openedOn ? { ...m, openedOn: nowIso() } : m,
      );
      store.set({ ...s, data: { ...s.data, milestones } });
    },
    startHundred: () => {
      const s = store.get();
      if (s.hundredPlayed || s.hundredRunning) return;
      store.set({ ...s, hundredRunning: true });
    },
    endHundred: () => store.set({ ...store.get(), hundredRunning: false, hundredPlayed: true }),
    endRelight: () => store.set({ ...store.get(), relighting: false }),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Derived read models
// ═══════════════════════════════════════════════════════════════════════════

export interface TodayView {
  date: string;
  mineIn: boolean;
  theirsIn: boolean;
  /** Only meaningful once `mineIn` — did I get here first, or did they? */
  iWasFirst: boolean;
  covered: Side | undefined;
  view: StreakView;
}

export function readToday(data: StreakData, me: Side, date: string): TodayView {
  const day = dayOf(data, date);
  const them = other(me);
  const mine = day?.[me];
  const theirs = day?.[them];
  const ta = mine ? Date.parse(mine.at) : NaN;
  const tb = theirs ? Date.parse(theirs.at) : NaN;
  return {
    date,
    mineIn: Boolean(mine),
    theirsIn: Boolean(theirs),
    iWasFirst: !theirs || (Number.isFinite(ta) && Number.isFinite(tb) && ta <= tb),
    covered: day?.covered,
    view: deriveStreak(data, date),
  };
}

/** The dates of every completed day, in order — one light each. */
export function completedDates(data: StreakData, today: string): string[] {
  return data.checkIns
    .filter((d) => d.date <= today && isComplete(d))
    .map((d) => d.date)
    .sort();
}
