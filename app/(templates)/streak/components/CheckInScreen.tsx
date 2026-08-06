// ─── Screen one: the check-in ────────────────────────────────────────────────
//
// Reading order is the whole design: LIGHTS first, number second, the two of
// you third, the button fourth. A layout that leads with the number is a
// scoreboard, and a scoreboard is a thing you can be losing at.
//
// Nothing on this screen counts down, and nothing on it is red.

"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Camera, Check } from "lucide-react";
import { tone } from "@/lib/webAudio";
import {
  COPY,
  LIMITS,
  PALETTE,
  SERIF,
  UI,
  addDays,
  coversAvailable,
  fmtDay,
  noteViewFor,
  type Side,
  type StreakData,
} from "./types";
import { other } from "./demoData";
import { createStore, useStore, type MomentPhase, type MomentState, type TodayView } from "./streakStore";
import Lights from "./Lights";
import AvatarRings from "./AvatarRings";
import SealedNote from "./SealedNote";
import WeekStrip from "./WeekStrip";
import HoldButton from "./HoldButton";

/** Character count that counts an emoji as one character. */
const glyphs = (s: string): number => [...s].length;
/** Clip to `max` GLYPHS, so a 20-emoji word is 20 and not 40. */
const clipGlyphs = (s: string, max: number): string => [...s].slice(0, max).join("");

// ─── The count-up ────────────────────────────────────────────────────────────
//
// The number steps up rather than snapping. Driven by rAF writing to a local
// external store — not `setState` inside an effect, which is both a lint rule
// and, at 60fps, a genuinely bad idea.

function CountUp({ from, to, ms, reduced }: { from: number; to: number; ms: number; reduced: boolean }) {
  const [store] = useState(() => createStore<number>(to));
  const value = useStore(store);

  useEffect(() => {
    if (reduced || from === to) {
      store.set(to);
      return;
    }
    store.set(from);
    let raf = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / ms);
      const eased = 1 - Math.pow(1 - p, 3);
      store.set(Math.round(from + (to - from) * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [from, to, ms, reduced, store]);

  return <>{value}</>;
}

// ─── The composer ────────────────────────────────────────────────────────────
//
// Appears only AFTER the check-in has been recorded. Every field is optional
// and the panel says so. It never blocks, never validates, and closing it
// changes nothing — the day is already counted.

interface ComposerProps {
  word: string;
  note: string;
  photoUrl: string;
  onWord: (v: string) => void;
  onNote: (v: string) => void;
  onPhoto: (file: File | null) => void;
  onDone: () => void;
  reduced: boolean;
}

function Composer({ word, note, photoUrl, onWord, onNote, onPhoto, onDone, reduced }: ComposerProps) {
  const wordId = useId();
  const noteId = useId();
  const fileRef = useRef<HTMLInputElement | null>(null);

  return (
    <div
      className="w-full rounded-2xl px-4 py-4 flex flex-col gap-3"
      style={{
        background: PALETTE.paperDeep,
        border: `1px solid ${PALETTE.edge}`,
        animation: reduced ? undefined : "streak-sheet-up 380ms ease-out both",
      }}
    >
      <div>
        <label htmlFor={wordId} className="sr-only">
          {COPY.wordPrompt}
        </label>
        <input
          id={wordId}
          value={word}
          onChange={(e) => onWord(clipGlyphs(e.target.value, LIMITS.word))}
          placeholder={COPY.wordPrompt}
          maxLength={LIMITS.word * 4}
          className="w-full rounded-xl px-3 outline-none"
          style={{
            minHeight: 48,
            fontFamily: SERIF,
            fontSize: 19,
            color: PALETTE.ink,
            background: PALETTE.paper,
            border: `1px solid ${PALETTE.edge}`,
          }}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onPhoto(e.target.files?.[0] ?? null)}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-xl px-3"
          style={{
            minHeight: 44,
            fontFamily: UI,
            fontSize: 13,
            color: PALETTE.inkSoft,
            background: PALETTE.paper,
            border: `1px solid ${PALETTE.edge}`,
          }}
        >
          <Camera size={15} />
          {photoUrl ? "photo added" : "add a photo"}
        </button>
        {photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt="Today's photo"
            style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover", border: `1px solid ${PALETTE.edge}` }}
          />
        )}
      </div>

      <div>
        <label htmlFor={noteId} className="sr-only">
          {COPY.notePrompt}
        </label>
        <input
          id={noteId}
          value={note}
          onChange={(e) => onNote(clipGlyphs(e.target.value, LIMITS.note))}
          placeholder={COPY.notePrompt}
          maxLength={LIMITS.note * 4}
          className="w-full rounded-xl px-3 outline-none"
          style={{
            minHeight: 48,
            fontFamily: UI,
            fontSize: 14,
            color: PALETTE.ink,
            background: PALETTE.paper,
            border: `1px solid ${PALETTE.edge}`,
          }}
        />
        <p style={{ fontFamily: UI, fontSize: 11, color: PALETTE.inkFaint, marginTop: 5 }}>
          {/* Not a warning, not a requirement. A description of what it is. */}
          sealed until they check in · {LIMITS.note - glyphs(note)} left
        </p>
      </div>

      <button
        type="button"
        onClick={onDone}
        className="inline-flex items-center justify-center gap-2 rounded-xl"
        style={{
          minHeight: 44,
          fontFamily: UI,
          fontSize: 13.5,
          color: PALETTE.paper,
          background: PALETTE.ink,
          border: "none",
        }}
      >
        <Check size={15} /> done
      </button>
    </div>
  );
}

// ─── The screen ──────────────────────────────────────────────────────────────

export interface CheckInScreenProps {
  data: StreakData;
  me: Side;
  today: string;
  todayView: TodayView;
  moment: MomentState | null;
  freshLights: string[];
  relighting: boolean;
  canopy: boolean;
  notice: string | null;
  /** True when the viewer checked in during THIS session. Gates the seal crack. */
  checkedInThisSession: boolean;
  reduced: boolean;
  onCheckIn: () => void;
  onPatch: (patch: { word?: string; photoUrl?: string; note?: string }) => void;
  onPhotoFailed: () => void;
  onAdvanceMoment: (phase: MomentPhase) => void;
  onSpendCover: (date: string) => void;
  onOpenArchive: () => void;
}

export default function CheckInScreen({
  data,
  me,
  today,
  todayView,
  moment,
  freshLights,
  relighting,
  canopy,
  notice,
  checkedInThisSession,
  reduced,
  onCheckIn,
  onPatch,
  onPhotoFailed,
  onAdvanceMoment,
  onSpendCover,
  onOpenArchive,
}: CheckInScreenProps) {
  const [composerOpen, setComposerOpen] = useState(false);
  const view = todayView.view;
  const them = other(me);
  const themName = data.pair[them].name;

  const dayRecord = data.checkIns.find((d) => d.date === today);
  const mine = dayRecord?.[me];
  const noteView = noteViewFor(dayRecord, me, data.pair);

  // Every completed day, in order — one light each.
  const litDates = data.checkIns
    .filter((d) => d.date <= today && (d.covered ? Boolean(d.a || d.b) : Boolean(d.a && d.b)))
    .map((d) => d.date);

  /** A soft two-note chime, at the bloom. Silent if audio was never unlocked. */
  const phase = moment?.phase;
  useEffect(() => {
    if (phase !== "bloom") return;
    tone({ freq: 523.25, ms: 460, type: "sine", gain: 0.1 });
    tone({ freq: 783.99, ms: 620, type: "sine", gain: 0.085, delay: 0.24 });
  }, [phase]);

  const handleCheckIn = useCallback(() => {
    onCheckIn();
    setComposerOpen(true);
  }, [onCheckIn]);

  const handlePhoto = useCallback(
    (file: File | null) => {
      if (!file) return;
      // A media failure is never allowed to invalidate the check-in. The day is
      // already recorded before this runs; the worst case is a warm line saying
      // the photo did not make it.
      if (!file.type.startsWith("image/")) {
        onPhotoFailed();
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === "string") onPatch({ photoUrl: result });
        else onPhotoFailed();
      };
      reader.onerror = () => onPhotoFailed();
      try {
        reader.readAsDataURL(file);
      } catch {
        onPhotoFailed();
      }
    },
    [onPatch, onPhotoFailed],
  );

  // The number holds at the PREVIOUS day through the drift, then counts up at
  // the bloom. Reading `view.count` during the drift would flash the new number
  // for 900ms and then jump backwards to count up to it — which is what this
  // looked like before it was measured frame by frame.
  const counting = phase === "bloom" || phase === "settled";
  const shownCount = moment
    ? phase === "drift"
      ? moment.from
      : moment.day
    : view.count;
  const countFrom = counting && moment ? moment.from : shownCount;

  // The cover offer. Only shown when there is one to spend, and phrased as an
  // option rather than a remedy.
  const canRepair = view.status === "repairable" && coversAvailable(data, me) > 0 && Boolean(view.missedDay);

  // Did the partner spend a cover for me recently? They get told warmly; I am
  // never told that they had to.
  const coveredForMe = data.checkIns.find(
    (d) => d.covered === me && d.date >= addDays(today, -2) && d.date <= today,
  );

  return (
    <div className="w-full flex flex-col items-center gap-5" style={{ maxWidth: 360 }}>
      {/* ── Status. Quiet, permissive, never a warning. ── */}
      {view.status === "dormant" && (
        <div className="w-full text-center">
          <p style={{ fontFamily: UI, fontSize: 13.5, color: PALETTE.inkSoft }}>{COPY.dormant(view.count)}</p>
          <p style={{ fontFamily: UI, fontSize: 12.5, color: PALETTE.inkFaint, marginTop: 2 }}>
            {COPY.welcomeBack}
          </p>
        </div>
      )}
      {view.status === "repairable" && (
        <div className="w-full text-center flex flex-col items-center gap-2">
          <p style={{ fontFamily: UI, fontSize: 13.5, color: PALETTE.inkSoft }}>{COPY.repairable}</p>
          {canRepair && (
            <button
              type="button"
              onClick={() => view.missedDay && onSpendCover(view.missedDay)}
              className="rounded-full px-4"
              style={{
                minHeight: 44,
                fontFamily: UI,
                fontSize: 13,
                color: PALETTE.cover,
                background: PALETTE.paper,
                border: `1px solid ${PALETTE.edge}`,
              }}
            >
              {COPY.repairAction}
            </button>
          )}
        </div>
      )}

      {/* ── The hero. ── */}
      <div className="w-full">
        <Lights
          dates={litDates}
          fresh={freshLights}
          dormant={view.status === "dormant"}
          relighting={relighting}
          canopy={canopy}
          reduced={reduced}
        />
      </div>

      {/* ── The number. Small, beneath, and in the serif. ──
             Before the first completed day there is no number at all. A "0" on
             day one would be the only zero this template can produce, and it
             would read as a score of nothing rather than as a beginning. */}
      <div className="text-center" style={{ marginTop: -4 }}>
        {view.totalDays === 0 ? (
          <p style={{ fontFamily: SERIF, fontSize: 30, lineHeight: 1.2, color: PALETTE.inkSoft }}>
            {COPY.emptyArchive}
          </p>
        ) : (
          <p
            style={{
              fontFamily: SERIF,
              fontSize: 44,
              lineHeight: 1,
              color: view.status === "dormant" ? PALETTE.inkSoft : PALETTE.ink,
              letterSpacing: "-0.01em",
            }}
          >
            <CountUp from={countFrom} to={shownCount} ms={900} reduced={reduced} />
          </p>
        )}
        {view.totalDays > 0 && (
          <p style={{ fontFamily: UI, fontSize: 11.5, letterSpacing: "0.1em", color: PALETTE.inkFaint, marginTop: 5 }}>
            {view.status === "dormant" ? "DAYS, PAUSED" : "DAYS"}
          </p>
        )}
        {/* The high water mark, shown ONLY when it is not the number above.

            Gating on `record > count` rather than on status is the whole point.
            While dormant the contract assigns `count` FROM `record`, so they
            are equal and this would be the same figure printed twice. But the
            instant the pair comes back, the new run is 1 and the record is
            still 74 — and if this line were tied to the dormant status it would
            vanish at exactly the moment it matters. Someone returning after
            months would watch the number they built disappear off the screen.
            It is never gone; it just stops being the headline. */}
        {view.record > view.count && (
          <p style={{ fontFamily: UI, fontSize: 12, color: PALETTE.inkFaint, marginTop: 5 }}>
            best {view.record}
          </p>
        )}
      </div>

      {/* ── The two of you. ── */}
      <AvatarRings
        pair={data.pair}
        me={me}
        mineIn={todayView.mineIn}
        theirsIn={todayView.theirsIn}
        moment={moment}
        reduced={reduced}
        onAdvance={onAdvanceMoment}
      />

      {/* ── The moment's line. Fades in and stays. ── */}
      {moment && (phase === "bloom" || phase === "settled") && (
        <p
          style={{
            fontFamily: SERIF,
            fontSize: 18,
            color: PALETTE.ink,
            animation: reduced ? undefined : "streak-fade-in 600ms ease-out both",
          }}
        >
          {COPY.bothIn(moment.day)}
        </p>
      )}

      {/* ── The gesture, or what follows it. ── */}
      {!todayView.mineIn ? (
        <HoldButton onComplete={handleCheckIn} reduced={reduced} />
      ) : (
        <div className="w-full flex flex-col items-center gap-3">
          <p style={{ fontFamily: UI, fontSize: 13.5, color: PALETTE.inkSoft }}>
            {todayView.iWasFirst ? COPY.firstToday : COPY.beatenToIt(themName)}
          </p>
          {composerOpen ? (
            <Composer
              word={mine?.word ?? ""}
              note={mine?.note ?? ""}
              photoUrl={mine?.photoUrl ?? ""}
              onWord={(v) => onPatch({ word: v })}
              onNote={(v) => onPatch({ note: v })}
              onPhoto={handlePhoto}
              onDone={() => setComposerOpen(false)}
              reduced={reduced}
            />
          ) : (
            <button
              type="button"
              onClick={() => setComposerOpen(true)}
              className="rounded-full px-4"
              style={{
                minHeight: 44,
                fontFamily: UI,
                fontSize: 13,
                color: PALETTE.inkSoft,
                background: PALETTE.paper,
                border: `1px solid ${PALETTE.edge}`,
              }}
            >
              {mine?.word ? `today: ${mine.word}` : COPY.wordPrompt}
            </button>
          )}
        </div>
      )}

      {/* ── Their note. Nothing is in the DOM until it is earned. ── */}
      <SealedNote view={noteView} animate={checkedInThisSession} reduced={reduced} />

      {/* ── Someone covered for you. Warm, and not a debt. ── */}
      {coveredForMe && (
        <p className="text-center" style={{ fontFamily: UI, fontSize: 13, color: PALETTE.cover }}>
          {COPY.coveredBy(themName)}
          <span style={{ color: PALETTE.inkFaint }}> · {fmtDay(coveredForMe.date, data.timezone)}</span>
        </p>
      )}

      {/* ── A transient line: already in, queued, photo didn't upload. ── */}
      {notice && (
        <p
          className="text-center"
          style={{
            fontFamily: UI,
            fontSize: 12.5,
            color: PALETTE.inkSoft,
            animation: reduced ? undefined : "streak-fade-in 240ms ease-out both",
          }}
        >
          {notice}
        </p>
      )}

      {/* ── The last seven days. ── */}
      <div className="w-full pt-1">
        <WeekStrip
          data={data}
          me={me}
          today={today}
          bloomDate={counting ? today : null}
          reduced={reduced}
        />
      </div>

      <button
        type="button"
        onClick={onOpenArchive}
        className="rounded-full px-4"
        style={{
          minHeight: 44,
          fontFamily: UI,
          fontSize: 13,
          color: PALETTE.inkSoft,
          background: "transparent",
          border: `1px solid ${PALETTE.edge}`,
        }}
      >
        {view.totalDays <= 1 ? COPY.emptyArchive : "see all of it"}
      </button>

      <span className="sr-only" aria-live="polite">
        {moment && phase === "settled" ? COPY.bothIn(moment.day) : ""}
      </span>
    </div>
  );
}
