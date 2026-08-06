"use client";

// ─── The Invitation — the sender's bottom sheet ──────────────────────────────
//
// Mirrors `catch/components/EditSheet.tsx` in chrome and motion; the fields are
// the ones the SENDER legitimately owns.
//
// The sender NEVER sets rsvp / proposedDate / currentStopIndex / arrivedAt /
// photos — those are recipient-owned, and `handleSave` forces them back to
// their defaults regardless of what is in `mf`.
//
// TIME: everything is stored as an ISO 8601 UTC string and entered/displayed in
// the sender's LOCAL zone. `composeUtcIso` is the single crossing point — a
// local `YYYY-MM-DD` plus a local `HH:MM` go in, a UTC instant comes out — and
// the resolved local datetime is echoed straight back under the fields so there
// is no ambiguity about which evening was just booked.

import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown, ArrowUp, Calendar, Eye, Info, Link2, Loader2, Lock, MapPin, Minus,
  Plus, Trash2, X,
} from "lucide-react";

import type { DateInviteData, EditMode, GeoPoint, Stop, WalkingLevel } from "./types";
import { WALKING_COPY } from "./types";
import {
  ACCENT, ACCENT_EDGE, ACCENT_WASH, DISPLAY, INK, INK_FAINT, INK_SOFT,
  MONO, PAPER, PAPER_DEEP, PAPER_EDGE, SERIF, TAP, UI,
  fmtDateTimeLong, fmtDuration, fmtMins, toLocalDateInput,
} from "./dateTheme";
import useReducedMotion from "./useReducedMotion";
import {
  LIMITS, MAX_STOPS, MAX_STOP_MINS, MAX_TOTAL_MINS, MIN_STOP_MINS, MIN_TOTAL_MINS,
} from "../hooks/useDateInvitationEditor";

export interface EditSheetProps {
  editMode: EditMode;
  setEditMode: (m: EditMode) => void;
  mf: DateInviteData;
  updateMf: (key: keyof DateInviteData, val: unknown) => void;
  pagePassword: string;
  setPagePassword: (v: string) => void;
  onSave: () => void;
  saving: boolean;
}

// ─── Local ⇄ UTC ─────────────────────────────────────────────────────────────
//
// NOT a display formatter — every one of those lives in `dateTheme.ts` and is
// imported above. These two are input-value serialisers for the native
// `<input type="date">` / `<input type="time">` pair, which only speak
// `YYYY-MM-DD` and `HH:MM`, both in local time. `toLocalDateInput` already
// exists in the theme; this is its missing sibling.

/** "19:30" in LOCAL time — for seeding an `<input type="time">`. */
export function toLocalTimeInput(iso: string): string {
  if (!iso || Number.isNaN(Date.parse(iso))) return "";
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())}`;
}

/**
 * A local calendar date + a local wall-clock time → an ISO 8601 UTC instant.
 *
 * `new Date(y, m, d, h, min)` is defined to build the instant in the runtime's
 * own zone, and `.toISOString()` renders that instant in UTC — so the DST and
 * offset arithmetic is the platform's, not ours. Returns "" for input the
 * native controls cannot produce, which is what an empty field looks like.
 */
export function composeUtcIso(dateStr: string, timeStr: string): string {
  const dm = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(dateStr || "");
  const tm = /^(\d{1,2}):(\d{2})/.exec(timeStr || "");
  if (!dm || !tm) return "";
  const y = Number(dm[1]), mo = Number(dm[2]), day = Number(dm[3]);
  const h = Number(tm[1]), min = Number(tm[2]);
  if (mo < 1 || mo > 12 || day < 1 || day > 31 || h > 23 || min > 59) return "";
  const d = new Date(y, mo - 1, day, h, min, 0, 0);
  if (Number.isNaN(d.getTime())) return "";
  // Reject a rolled-over date (31 April → 1 May) rather than silently shifting.
  if (d.getMonth() !== mo - 1 || d.getDate() !== day) return "";
  return d.toISOString();
}

const DAY_MS = 86_400_000;

/**
 * A stop's time-of-day resolved against the evening it belongs to. A stop at
 * 00:30 on a date that starts at 22:00 is the next calendar day, not fourteen
 * hours before the invitation.
 */
function stopIsoFor(startsAt: string, timeStr: string): string {
  const dateStr = toLocalDateInput(startsAt);
  if (!dateStr || !timeStr) return "";
  const iso = composeUtcIso(dateStr, timeStr);
  if (!iso) return "";
  const t = Date.parse(iso);
  const start = Date.parse(startsAt);
  return !Number.isNaN(start) && t < start ? new Date(t + DAY_MS).toISOString() : iso;
}

/**
 * Pull coordinates out of a pasted Google Maps URL.
 *
 * `!3d<lat>!4d<lng>` is the place's own pin and is preferred; `@lat,lng` is the
 * map viewport centre, which is close enough to be useful and is what a short
 * "share" link expands to. Anything else is left alone — a wrong pin is worse
 * than no pin, so this never guesses.
 */
export function parseMapsLink(url: string): { lat: number; lng: number } | null {
  const s = String(url || "");
  const pin = /!3d(-?\d{1,3}(?:\.\d+)?)!4d(-?\d{1,3}(?:\.\d+)?)/.exec(s);
  const at = /@(-?\d{1,3}(?:\.\d+)?),(-?\d{1,3}(?:\.\d+)?)/.exec(s);
  const q = /[?&](?:q|query|destination|daddr)=(-?\d{1,3}(?:\.\d+)?),\s*(-?\d{1,3}(?:\.\d+)?)/.exec(s);
  const plain = /^\s*(-?\d{1,3}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)\s*$/.exec(s);
  const m = pin || q || at || plain;
  if (!m) return null;
  const lat = Number(m[1]);
  const lng = Number(m[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  if (lat === 0 && lng === 0) return null; // that is our "not supplied" sentinel
  return { lat, lng };
}

// ─── Shared bits ─────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: "100%",
  minHeight: TAP,
  padding: "10px 14px",
  borderRadius: 6,
  background: PAPER,
  border: `1px solid ${PAPER_EDGE}`,
  color: INK,
  fontFamily: UI,
  fontSize: 15,
  outline: "none",
};

const LABEL_CLS = "flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] mb-1.5";

function Field({
  label, hint, count, children,
}: { label: string; hint?: string; count?: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (ev: PointerEvent) => { if (!boxRef.current?.contains(ev.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", onDoc);
    return () => document.removeEventListener("pointerdown", onDoc);
  }, [open]);

  return (
    <div>
      <div className="flex items-end justify-between gap-2">
        <label className={LABEL_CLS} style={{ color: INK_SOFT, fontFamily: UI }}>
          <span>{label}</span>
          {hint && (
            <span ref={boxRef} className="relative inline-flex items-center">
              <button
                type="button"
                onClick={(ev) => { ev.stopPropagation(); setOpen((v) => !v); }}
                aria-label={hint}
                aria-expanded={open}
                className="inline-grid place-items-center w-5 h-5 rounded-full shrink-0"
                style={{ background: open ? ACCENT : ACCENT_WASH, color: open ? "#fff" : ACCENT }}
              >
                <Info size={12} />
              </button>
              {open && (
                <span
                  role="tooltip"
                  className="absolute z-[240] normal-case tracking-normal font-medium"
                  style={{
                    top: "calc(100% + 8px)", left: 0, width: "min(250px, 74vw)",
                    background: "#2c2320", color: "#fff", fontSize: 11, lineHeight: 1.55,
                    padding: "8px 11px", borderRadius: 8, fontFamily: UI,
                    boxShadow: "0 12px 30px -8px rgba(44,35,32,.5)",
                  }}
                >
                  {hint}
                </span>
              )}
            </span>
          )}
        </label>
        {count && (
          <span className="text-[10px] mb-1.5 tabular-nums shrink-0" style={{ color: INK_FAINT, fontFamily: MONO }}>
            {count}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function SectionTitle({ children, note }: { children: React.ReactNode; note?: string }) {
  return (
    <div className="flex items-baseline gap-2 pt-1">
      <h4 style={{ fontFamily: DISPLAY, fontSize: 19, color: INK, lineHeight: 1.2 }}>{children}</h4>
      <span aria-hidden className="flex-1 h-px" style={{ background: PAPER_EDGE }} />
      {note && <span className="text-[10px]" style={{ color: INK_FAINT, fontFamily: MONO }}>{note}</span>}
    </div>
  );
}

/** ± stepper. Two 48px targets and a readable value between them. */
function Stepper({
  value, onChange, step, min, max, format, label,
}: {
  value: number; onChange: (n: number) => void; step: number; min: number; max: number;
  format: (n: number) => string; label: string;
}) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  const btn: React.CSSProperties = {
    width: TAP, height: TAP, borderRadius: 6, background: PAPER,
    border: `1px solid ${PAPER_EDGE}`, color: ACCENT, display: "grid", placeItems: "center",
  };
  return (
    <div className="flex items-center gap-2">
      <button type="button" aria-label={`Less ${label}`} onClick={() => onChange(clamp(value - step))} style={btn}>
        <Minus size={16} />
      </button>
      <span
        className="flex-1 text-center"
        aria-live="polite"
        style={{ fontFamily: SERIF, fontSize: 15, color: INK, minHeight: TAP, lineHeight: `${TAP}px` }}
      >
        {format(value)}
      </span>
      <button type="button" aria-label={`More ${label}`} onClick={() => onChange(clamp(value + step))} style={btn}>
        <Plus size={16} />
      </button>
    </div>
  );
}

/**
 * A coordinate box that keeps its own text buffer, so "-", "12." and "1e" never
 * round-trip through `Number()` and wipe the field mid-keystroke. Empty commits
 * `0`, the frozen contract's "not supplied" sentinel.
 *
 * The buffer is seeded once per mount and the parent remounts it (via `key`)
 * when the Maps-link helper writes coordinates from outside — an effect that
 * mirrors a prop into state is the thing that pattern exists to avoid.
 */
function CoordInput({
  value, onChange, limit, placeholder, ariaLabel,
}: { value: number; onChange: (n: number) => void; limit: number; placeholder: string; ariaLabel: string }) {
  const [text, setText] = useState(value === 0 ? "" : String(value));

  const commit = (t: string) => {
    setText(t);
    const trimmed = t.trim();
    const n = trimmed === "" ? 0 : Number(trimmed);
    const next = Number.isFinite(n) ? Math.min(limit, Math.max(-limit, n)) : 0;
    onChange(next);
  };

  return (
    <input
      value={text}
      onChange={(e) => commit(e.target.value)}
      inputMode="decimal"
      placeholder={placeholder}
      aria-label={ariaLabel}
      style={{ ...inputStyle, fontFamily: MONO, fontSize: 14 }}
    />
  );
}

/**
 * name / address / lat / lng, used for both the meeting point and every stop.
 * Coordinates are OPTIONAL and the empty state says so out loud: 0/0 reads as
 * "no coordinates", never as a place in the Gulf of Guinea.
 */
function PlaceFields({
  place, onPatch, namePlaceholder, addressPlaceholder, nameLabel,
}: {
  place: GeoPoint;
  onPatch: (patch: Partial<GeoPoint>) => void;
  namePlaceholder: string;
  addressPlaceholder: string;
  nameLabel: string;
}) {
  const [pasted, setPasted] = useState("");
  const [pasteState, setPasteState] = useState<"" | "ok" | "bad">("");
  // Bumped on a successful paste so the two coordinate boxes remount and pick
  // up the new numbers, instead of syncing a prop into state inside an effect.
  const [extNonce, setExtNonce] = useState(0);
  const has = place.lat !== 0 || place.lng !== 0;

  const applyPaste = (raw: string) => {
    setPasted(raw);
    if (!raw.trim()) { setPasteState(""); return; }
    const hit = parseMapsLink(raw);
    if (hit) {
      onPatch({ lat: hit.lat, lng: hit.lng });
      setPasteState("ok");
      setExtNonce((n) => n + 1);
    } else {
      setPasteState("bad");
    }
  };

  return (
    <div className="space-y-3">
      <Field label={nameLabel} count={`${place.name.length}/${LIMITS.placeName}`}>
        <input
          value={place.name}
          onChange={(e) => onPatch({ name: e.target.value.slice(0, LIMITS.placeName) })}
          placeholder={namePlaceholder}
          aria-label={nameLabel}
          style={inputStyle}
        />
      </Field>

      <Field label="Address" count={`${place.address.length}/${LIMITS.address}`}>
        <input
          value={place.address}
          onChange={(e) => onPatch({ address: e.target.value.slice(0, LIMITS.address) })}
          placeholder={addressPlaceholder}
          aria-label="Address"
          style={inputStyle}
        />
      </Field>

      <div
        className="rounded-md p-3"
        style={{ background: PAPER_DEEP, border: `1px dashed ${PAPER_EDGE}` }}
      >
        <div className="flex items-center gap-1.5 mb-1">
          <MapPin size={13} style={{ color: has ? ACCENT : INK_FAINT }} />
          <span className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: INK_SOFT, fontFamily: UI }}>
            Coordinates — optional
          </span>
        </div>
        <p className="text-[11px] leading-snug mb-2.5" style={{ color: INK_SOFT, fontFamily: UI }}>
          {has
            ? "The little map and the Directions button will show."
            : "Leave these empty and there is no map and no Directions button — just the address as text. That is a perfectly good invitation."}
        </p>

        <div className="relative mb-2">
          <Link2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: INK_FAINT }} />
          <input
            value={pasted}
            onChange={(e) => applyPaste(e.target.value)}
            placeholder="paste a Google Maps link"
            aria-label="Paste a Google Maps link to fill the coordinates"
            style={{ ...inputStyle, paddingLeft: 36, fontSize: 13 }}
          />
        </div>
        {pasteState === "bad" && (
          <p className="text-[11px] mb-2" style={{ color: ACCENT, fontFamily: UI }}>
            No coordinates in that link. Open the place in Maps, tap Share → Copy link, or type them in below.
          </p>
        )}

        <div className="grid grid-cols-2 gap-2">
          <CoordInput
            key={`lat-${extNonce}`}
            value={place.lat}
            onChange={(n) => onPatch({ lat: n })}
            limit={90}
            placeholder="lat"
            ariaLabel="Latitude"
          />
          <CoordInput
            key={`lng-${extNonce}`}
            value={place.lng}
            onChange={(n) => onPatch({ lng: n })}
            limit={180}
            placeholder="lng"
            ariaLabel="Longitude"
          />
        </div>
        <p className="text-[10.5px] mt-1.5" style={{ color: INK_FAINT, fontFamily: MONO }}>
          {has ? `${place.lat}, ${place.lng}` : "no coordinates"}
        </p>
      </div>
    </div>
  );
}

// ─── A stop ──────────────────────────────────────────────────────────────────

const DRESS_SUGGESTIONS = [
  "something you can walk in",
  "nice, but not fussy",
  "wear the good shoes",
  "layers — we'll be outside",
];

const WALKING_LEVELS: WalkingLevel[] = ["minimal", "some", "a lot"];

function StopCard({
  stop, index, total, startsAt, onPatch, onRemove, onMove,
}: {
  stop: Stop;
  index: number;
  total: number;
  startsAt: string;
  onPatch: (patch: Partial<Stop>) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const named = stop.name.trim().length > 0;
  const timeValue = toLocalTimeInput(stop.arriveAt);

  const iconBtn: React.CSSProperties = {
    width: TAP, height: TAP, borderRadius: 6, display: "grid", placeItems: "center",
    background: PAPER, border: `1px solid ${PAPER_EDGE}`, color: INK_SOFT,
  };

  return (
    <div
      className="rounded-md p-3.5 space-y-3"
      style={{
        background: named ? "#fffdf7" : "rgba(247,241,228,.55)",
        border: `1px ${named ? "solid" : "dashed"} ${named ? PAPER_EDGE : "#ddd2bd"}`,
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className="grid place-items-center shrink-0 rounded-full"
          style={{
            width: 26, height: 26, fontFamily: MONO, fontSize: 12,
            background: ACCENT_WASH, color: ACCENT, border: `1px solid ${ACCENT_EDGE}`,
          }}
        >
          {index + 1}
        </span>
        <span className="flex-1 truncate" style={{ fontFamily: SERIF, fontSize: 14, color: named ? INK : INK_FAINT }}>
          {named ? stop.name : "unnamed stop — it won't be saved"}
        </span>
        <button type="button" aria-label={`Move stop ${index + 1} up`} disabled={index === 0} onClick={() => onMove(-1)} style={{ ...iconBtn, opacity: index === 0 ? 0.35 : 1 }}>
          <ArrowUp size={15} />
        </button>
        <button type="button" aria-label={`Move stop ${index + 1} down`} disabled={index === total - 1} onClick={() => onMove(1)} style={{ ...iconBtn, opacity: index === total - 1 ? 0.35 : 1 }}>
          <ArrowDown size={15} />
        </button>
        <button type="button" aria-label={`Remove stop ${index + 1}`} onClick={onRemove} style={{ ...iconBtn, color: ACCENT }}>
          <Trash2 size={15} />
        </button>
      </div>

      <PlaceFields
        place={stop}
        onPatch={onPatch}
        nameLabel="Stop name"
        namePlaceholder="e.g. Blossom Book House"
        addressPlaceholder="street, area, city"
      />

      <div className="grid grid-cols-2 gap-3">
        <Field label="Arrive by">
          <input
            type="time"
            value={timeValue}
            onChange={(e) => onPatch({ arriveAt: stopIsoFor(startsAt, e.target.value) })}
            aria-label={`Arrive by, stop ${index + 1}`}
            style={{ ...inputStyle, fontFamily: MONO, fontSize: 15 }}
          />
        </Field>
        <Field label="How long">
          <Stepper
            value={stop.durationMins}
            onChange={(n) => onPatch({ durationMins: n })}
            step={15}
            min={MIN_STOP_MINS}
            max={MAX_STOP_MINS}
            format={fmtMins}
            label={`time at stop ${index + 1}`}
          />
        </Field>
      </div>

      <Field
        label="Why this place"
        hint="This is the line she reads while she is standing there. It is the best part of the whole thing — say the actual reason, not the description."
        count={`${stop.why.length}/${LIMITS.why}`}
      >
        <textarea
          value={stop.why}
          onChange={(e) => onPatch({ why: e.target.value.slice(0, LIMITS.why) })}
          rows={4}
          placeholder="You told me once that you judge a place by whether they let you sit for two hours on one coffee. They do."
          aria-label={`Why stop ${index + 1}`}
          style={{ ...inputStyle, fontFamily: SERIF, fontSize: 15, lineHeight: 1.55, minHeight: 108, resize: "vertical" }}
        />
      </Field>

      <Field label="A note about this stop" count={`${stop.dressNote.length}/${LIMITS.dressNote}`}>
        <input
          value={stop.dressNote}
          onChange={(e) => onPatch({ dressNote: e.target.value.slice(0, LIMITS.dressNote) })}
          placeholder="it gets cooler here — bring the jacket"
          aria-label={`Note for stop ${index + 1}`}
          style={inputStyle}
        />
      </Field>

      {/* Surprise. Default ON, and the helper text states the consequence rather
          than the setting — "surprise: off" tells nobody what will happen. */}
      <button
        type="button"
        role="switch"
        aria-checked={stop.surprise}
        onClick={() => onPatch({ surprise: !stop.surprise })}
        className="w-full flex items-start gap-3 text-left rounded-md p-3"
        style={{
          minHeight: TAP,
          background: stop.surprise ? ACCENT_WASH : PAPER,
          border: `1px solid ${stop.surprise ? ACCENT_EDGE : PAPER_EDGE}`,
        }}
      >
        <span
          aria-hidden
          className="shrink-0 mt-0.5 rounded-full transition-colors"
          style={{
            width: 42, height: 24, padding: 3, display: "block",
            background: stop.surprise ? ACCENT : "#cfc4ae",
          }}
        >
          <span
            style={{
              display: "block", width: 18, height: 18, borderRadius: 999, background: "#fff",
              transform: stop.surprise ? "translateX(18px)" : "translateX(0)",
              transition: "transform .15s ease",
            }}
          />
        </span>
        <span className="min-w-0">
          <span className="block text-[13px] font-bold" style={{ color: INK, fontFamily: UI }}>
            Keep this one a surprise
          </span>
          <span className="block text-[11.5px] leading-snug mt-0.5" style={{ color: INK_SOFT, fontFamily: UI }}>
            {stop.surprise
              ? "She sees ——— until she gets there."
              : "She sees the name while it is still locked — she just can't open it yet."}
          </span>
        </span>
      </button>
    </div>
  );
}

// ─── The sheet ───────────────────────────────────────────────────────────────

export default memo(function EditSheet({
  editMode, setEditMode, mf, updateMf, pagePassword, setPagePassword, onSave, saving,
}: EditSheetProps) {
  const visible = editMode === "manual";
  const reduced = useReducedMotion();

  const dateValue = toLocalDateInput(mf.startsAt);
  const timeValue = toLocalTimeInput(mf.startsAt);
  const startValid = Boolean(mf.startsAt) && !Number.isNaN(Date.parse(mf.startsAt));

  const named = useMemo(() => mf.stops.filter((s) => s.name.trim().length > 0).length, [mf.stops]);
  const ready =
    mf.senderName.trim().length > 0 &&
    mf.recipientName.trim().length > 0 &&
    startValid &&
    named >= 1;

  /**
   * Both halves of the datetime go through here, so the UTC string is always
   * rebuilt from BOTH native inputs rather than patched in place. Changing the
   * day also re-resolves every stop's time-of-day against the new evening —
   * otherwise moving the date leaves the itinerary stranded on the old one.
   */
  const setStart = useCallback((nextDate: string, nextTime: string) => {
    const iso = composeUtcIso(nextDate, nextTime || "19:00");
    if (!iso) return;
    const times = mf.stops.map((s) => toLocalTimeInput(s.arriveAt));
    updateMf("startsAt", iso);
    updateMf(
      "stops",
      mf.stops.map((s, i) => ({ ...s, arriveAt: times[i] ? stopIsoFor(iso, times[i]) : iso })),
    );
  }, [mf.stops, updateMf]);

  const patchStop = useCallback((i: number, patch: Partial<Stop>) => {
    updateMf("stops", mf.stops.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }, [mf.stops, updateMf]);

  const addStop = useCallback(() => {
    if (mf.stops.length >= MAX_STOPS) return;
    const prev = mf.stops[mf.stops.length - 1];
    const base = prev && Date.parse(prev.arriveAt)
      ? Date.parse(prev.arriveAt) + (prev.durationMins + 15) * 60_000
      : Date.parse(mf.startsAt);
    const arriveAt = Number.isNaN(base) ? mf.startsAt : new Date(base).toISOString();
    const next: Stop = {
      // Date.now() in a click handler — never in a render path.
      id: `s${Date.now().toString(36)}${mf.stops.length}`,
      order: mf.stops.length + 1,
      name: "",
      address: "",
      lat: 0,
      lng: 0,
      arriveAt,
      durationMins: 45,
      why: "",
      dressNote: "",
      surprise: true, // the safe default — forgetting to set it must not leak a name
    };
    updateMf("stops", [...mf.stops, next]);
    updateMf("arrivedAt", [...mf.stops, next].map(() => ""));
  }, [mf.stops, mf.startsAt, updateMf]);

  const removeStop = useCallback((i: number) => {
    const rest = mf.stops.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, order: idx + 1 }));
    updateMf("stops", rest);
    updateMf("arrivedAt", rest.map(() => ""));
  }, [mf.stops, updateMf]);

  /** Plain buttons. A drag-and-drop library is banned, and two arrows are more
   *  usable one-handed on a phone anyway. */
  const moveStop = useCallback((i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= mf.stops.length) return;
    const next = [...mf.stops];
    [next[i], next[j]] = [next[j], next[i]];
    updateMf("stops", next.map((s, idx) => ({ ...s, order: idx + 1 })));
  }, [mf.stops, updateMf]);

  const patchMeeting = useCallback((patch: Partial<GeoPoint>) => {
    updateMf("meetingPoint", { ...mf.meetingPoint, ...patch });
  }, [mf.meetingPoint, updateMf]);

  const panelMotion = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.12 } }
    : {
        initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" },
        transition: { type: "spring" as const, stiffness: 300, damping: 32 },
      };

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* z-200: the template pins a demo-only phase-jump bar at z-130. */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.12 : 0.2 }}
            onClick={() => setEditMode("preview")}
            className="fixed inset-0 z-[200]"
            style={{ background: "rgba(36,31,27,.55)" }}
          />
          <motion.div
            {...panelMotion}
            className="fixed bottom-0 left-0 right-0 z-[210] lg:flex lg:items-center lg:justify-center lg:inset-0 lg:bg-transparent"
          >
            <div
              className="w-full max-w-2xl max-h-[88vh] lg:max-h-[92vh] overflow-y-auto mx-auto rounded-t-2xl lg:rounded-2xl"
              style={{ background: PAPER, boxShadow: "0 -18px 44px -18px rgba(58,44,32,.45)", fontFamily: UI }}
            >
              <div className="flex justify-center pt-3 pb-1 sticky top-0 z-20" style={{ background: PAPER }}>
                <div className="w-10 h-1 rounded-full" style={{ background: PAPER_EDGE }} />
              </div>

              <div className="px-4 pb-10 pt-2 space-y-6" style={{ paddingBottom: "calc(2.5rem + env(safe-area-inset-bottom, 0px))" }}>
                <div className="flex items-center justify-between">
                  <h3 style={{ fontFamily: DISPLAY, fontSize: 22, color: INK }}>Write the invitation</h3>
                  <button
                    onClick={() => setEditMode("preview")}
                    aria-label="Close"
                    style={{ width: TAP, height: TAP, display: "grid", placeItems: "center", color: INK_SOFT }}
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* ── Who ── */}
                <SectionTitle>Who</SectionTitle>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Your name *" count={`${mf.senderName.length}/${LIMITS.senderName}`}>
                    <input
                      value={mf.senderName}
                      onChange={(e) => updateMf("senderName", e.target.value.slice(0, LIMITS.senderName))}
                      placeholder="e.g. Rohan"
                      style={inputStyle}
                    />
                  </Field>
                  <Field label="Their name *" count={`${mf.recipientName.length}/${LIMITS.recipientName}`}>
                    <input
                      value={mf.recipientName}
                      onChange={(e) => updateMf("recipientName", e.target.value.slice(0, LIMITS.recipientName))}
                      placeholder="e.g. Aditi"
                      style={inputStyle}
                    />
                  </Field>
                </div>

                {/* ── When ── */}
                <SectionTitle>When</SectionTitle>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Day *">
                    <div className="relative">
                      <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: INK_FAINT }} />
                      <input
                        type="date"
                        value={dateValue}
                        onChange={(e) => setStart(e.target.value, timeValue)}
                        aria-label="Day"
                        style={{ ...inputStyle, fontFamily: MONO, fontSize: 14 }}
                      />
                    </div>
                  </Field>
                  <Field label="Time *">
                    <input
                      type="time"
                      value={timeValue}
                      onChange={(e) => setStart(dateValue || toLocalDateInput(new Date().toISOString()), e.target.value)}
                      aria-label="Start time"
                      style={{ ...inputStyle, fontFamily: MONO, fontSize: 15 }}
                    />
                  </Field>
                </div>
                {/* Echoed back so there is no timezone ambiguity about which
                    evening was just booked. Stored UTC, shown local. */}
                <p className="-mt-3 text-[12px]" style={{ color: startValid ? INK_SOFT : ACCENT, fontFamily: SERIF }}>
                  {startValid ? `That's ${fmtDateTimeLong(mf.startsAt)}, your time.` : "Pick a day and a time."}
                </p>

                <Field label="How long, all in" hint="Shown on the invitation as “Duration … about 4 hours”. She is deciding whether to say yes; this is most of that decision.">
                  <Stepper
                    value={mf.durationMins}
                    onChange={(n) => updateMf("durationMins", n)}
                    step={30}
                    min={MIN_TOTAL_MINS}
                    max={MAX_TOTAL_MINS}
                    format={fmtDuration}
                    label="total time"
                  />
                </Field>

                {/* ── The ask ── */}
                <SectionTitle>The ask</SectionTitle>

                <Field label="Dress" count={`${mf.dressCode.length}/${LIMITS.dressCode}`}>
                  <input
                    value={mf.dressCode}
                    onChange={(e) => updateMf("dressCode", e.target.value.slice(0, LIMITS.dressCode))}
                    placeholder="something you can walk in"
                    aria-label="Dress code"
                    style={inputStyle}
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {DRESS_SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => updateMf("dressCode", s)}
                        className="px-3 rounded-full text-[11.5px]"
                        style={{
                          minHeight: 34, color: mf.dressCode === s ? "#fff" : ACCENT,
                          background: mf.dressCode === s ? ACCENT : "transparent",
                          border: `1px solid ${ACCENT_EDGE}`, fontFamily: UI,
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </Field>

                <Field label="Walking">
                  <div className="grid grid-cols-3 gap-2" role="group" aria-label="How much walking">
                    {WALKING_LEVELS.map((w) => {
                      const on = mf.walkingLevel === w;
                      return (
                        <button
                          key={w}
                          type="button"
                          aria-pressed={on}
                          onClick={() => updateMf("walkingLevel", w)}
                          className="rounded-md px-2"
                          style={{
                            minHeight: TAP,
                            background: on ? ACCENT_WASH : PAPER,
                            border: `1.5px solid ${on ? ACCENT : PAPER_EDGE}`,
                            color: on ? ACCENT : INK_SOFT,
                            fontFamily: UI, fontSize: 13, fontWeight: 700,
                          }}
                        >
                          {w}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11.5px] mt-1.5" style={{ color: INK_SOFT, fontFamily: SERIF }}>
                    Reads on the invitation as “Walking … {WALKING_COPY[mf.walkingLevel]}”.
                  </p>
                </Field>

                <Field
                  label="One line under it all"
                  hint="Sits directly beneath the invitation rows. One sentence; it does more work than the rest of the card."
                  count={`${mf.note.length}/${LIMITS.note}`}
                >
                  <input
                    value={mf.note}
                    onChange={(e) => updateMf("note", e.target.value.slice(0, LIMITS.note))}
                    placeholder="I planned the whole thing. You just have to show up."
                    aria-label="Note"
                    style={{ ...inputStyle, fontFamily: SERIF, fontSize: 15 }}
                  />
                </Field>

                {/* ── Meeting point ── */}
                <SectionTitle note="revealed after she says yes">Meeting point</SectionTitle>
                <p className="-mt-3 text-[11.5px]" style={{ color: INK_SOFT, fontFamily: UI }}>
                  Where she goes first. Hidden on the invitation itself, shown once she accepts.
                </p>
                <PlaceFields
                  place={mf.meetingPoint}
                  onPatch={patchMeeting}
                  nameLabel="Meeting point"
                  namePlaceholder="e.g. The clock outside Church Street Social"
                  addressPlaceholder="street, area, city"
                />

                {/* ── Stops ── */}
                <SectionTitle note={`${named}/${MAX_STOPS} named`}>The stops</SectionTitle>
                <p className="-mt-3 text-[11.5px]" style={{ color: INK_SOFT, fontFamily: UI }}>
                  One to {MAX_STOPS}. They unlock one at a time on the night — she never sees the next one early.
                </p>

                <div className="space-y-3">
                  {mf.stops.map((s, i) => (
                    <StopCard
                      key={s.id}
                      stop={s}
                      index={i}
                      total={mf.stops.length}
                      startsAt={mf.startsAt}
                      onPatch={(patch) => patchStop(i, patch)}
                      onRemove={() => removeStop(i)}
                      onMove={(dir) => moveStop(i, dir)}
                    />
                  ))}
                </div>

                {mf.stops.length < MAX_STOPS ? (
                  <button
                    type="button"
                    onClick={addStop}
                    className="w-full rounded-md inline-flex items-center justify-center gap-1.5 text-sm font-bold"
                    style={{ minHeight: TAP, color: ACCENT, border: `1px dashed ${ACCENT_EDGE}`, background: "rgba(246,233,231,.4)", fontFamily: UI }}
                  >
                    <Plus size={15} /> Add a stop
                  </button>
                ) : (
                  <p className="text-[11.5px] text-center" style={{ color: INK_FAINT, fontFamily: UI }}>
                    {MAX_STOPS} stops is the most an evening holds.
                  </p>
                )}

                {named === 0 && (
                  <p className="text-[11.5px] text-center" style={{ color: ACCENT, fontFamily: UI }}>
                    Give at least one stop a name — a nameless stop is left out when you save.
                  </p>
                )}

                {/* ── Closing + password ── */}
                <SectionTitle>Afterwards</SectionTitle>
                <Field
                  label="The closing line"
                  hint="Shown on the memory card at the end of the night, once every stop has been walked."
                  count={`${mf.closingLine.length}/${LIMITS.closingLine}`}
                >
                  <textarea
                    value={mf.closingLine}
                    onChange={(e) => updateMf("closingLine", e.target.value.slice(0, LIMITS.closingLine))}
                    rows={2}
                    placeholder="Four hours, four stops, and I'd do the whole thing again tomorrow."
                    aria-label="Closing line"
                    style={{ ...inputStyle, fontFamily: SERIF, fontSize: 15, lineHeight: 1.55, minHeight: 76, resize: "vertical" }}
                  />
                </Field>

                <Field label="Password (optional)" hint="If set, the shared link asks for this before the invitation opens.">
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: INK_FAINT }} />
                    <input
                      value={pagePassword}
                      onChange={(e) => setPagePassword(e.target.value)}
                      placeholder="Leave empty for no password"
                      aria-label="Password"
                      style={{ ...inputStyle, paddingLeft: 38 }}
                    />
                  </div>
                </Field>

                <button
                  onClick={onSave}
                  disabled={saving || !ready}
                  className="w-full rounded-md text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ minHeight: 52, background: ACCENT, fontFamily: UI }}
                >
                  {saving ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : <><Eye size={16} /> Save & see it</>}
                </button>
                <p className="text-center text-[11px]" style={{ color: INK_FAINT, fontFamily: UI }}>
                  Publish from the preview to get your shareable link
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});
