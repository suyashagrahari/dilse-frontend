"use client";

import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  X, PenLine, Eye, Lock, Loader2, Plus, Trash2, Info, ChevronUp, ChevronDown,
  CalendarDays, Music4, Camera, Link2, AlertTriangle, Sparkles, Users, Quote,
} from "lucide-react";
import {
  type RewindData, type EditMode, type Stat,
  QUESTIONS, computeArchetype, deriveStats, textOn,
} from "./types";
import { MAX_REASONS, MAX_STATS, MAX_PHOTOS, validateStartDate } from "../hooks/useRewindEditor";

/* ── Editor chrome. Ordinary product look — the poster typography belongs to the
      story, not to the form. Fuchsia/indigo so the editor, the password gate and
      the published page all read as one product. ─────────────────────────── */
const FUCHSIA = "#A21CAF";
const FUCHSIA_GRAD = "linear-gradient(135deg,#D946EF,#4F46E5)";
const INK = "#241B2B";
const MUTED = "#8A7E93";
const RULE = "#EBD5F2";
const DANGER = "#C2410C";

/** 16px on every text input: anything smaller makes iOS zoom the page on focus. */
const INPUT_STYLE: React.CSSProperties = { fontSize: 16 };
const INPUT_CLS =
  "w-full px-4 py-3 rounded-xl bg-muted/40 border border-border/50 focus:outline-none focus:border-fuchsia-400/60 transition-all min-h-[44px]";
const INPUT_SM =
  "w-full px-3 py-2.5 rounded-lg bg-muted/40 border border-border/50 focus:outline-none transition-all min-h-[44px]";

const MAX_REASON_LEN = 110;
const MAX_CLOSING_LEN = 140;
const MAX_NAME_LEN = 24;

interface Props {
  editMode: EditMode;
  setEditMode: (m: EditMode) => void;
  mf: RewindData;
  updateMf: (key: keyof RewindData, val: unknown) => void;
  pagePassword: string;
  setPagePassword: (v: string) => void;
  onSave: () => void;
  saving: boolean;
}

/* ── Small shared bits ─────────────────────────────────────────────────────── */

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
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
      <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5" style={{ color: MUTED }}>
        <span>{label}</span>
        {hint && (
          <span ref={boxRef} className="relative inline-flex items-center">
            <button
              type="button"
              onClick={(ev) => { ev.stopPropagation(); setOpen((v) => !v); }}
              aria-label={hint}
              aria-expanded={open}
              className="inline-grid place-items-center w-6 h-6 rounded-full shrink-0 transition-transform active:scale-90"
              style={{ background: open ? FUCHSIA : "rgba(162,28,175,.12)", color: open ? "#fff" : FUCHSIA }}
            >
              <Info size={12} />
            </button>
            <AnimatePresence>
              {open && (
                <motion.span
                  role="tooltip"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute z-[70] normal-case tracking-normal font-medium"
                  style={{
                    top: "calc(100% + 8px)", left: 0, width: "min(250px, 74vw)",
                    background: "#2B1733", color: "#fff", fontSize: 11, lineHeight: 1.5,
                    padding: "8px 11px", borderRadius: 10, boxShadow: "0 12px 30px -8px rgba(43,23,51,.5)",
                  }}
                >
                  <span aria-hidden style={{ position: "absolute", top: -5, left: 6, width: 10, height: 10, background: "#2B1733", transform: "rotate(45deg)", borderRadius: 2 }} />
                  {hint}
                </motion.span>
              )}
            </AnimatePresence>
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

function Section({
  icon, title, blurb, right, children,
}: { icon: React.ReactNode; title: string; blurb: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl p-3.5" style={{ background: "rgba(252,242,254,.55)", border: `1px solid ${RULE}` }}>
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="min-w-0">
          <h4 className="text-sm font-bold flex items-center gap-1.5" style={{ color: INK }}>
            <span style={{ color: FUCHSIA }} aria-hidden>{icon}</span>
            {title}
          </h4>
          <p className="text-[11px] mt-0.5 leading-snug" style={{ color: MUTED }}>{blurb}</p>
        </div>
        {right && <div className="shrink-0">{right}</div>}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Counter({ n, max }: { n: number; max: number }) {
  const near = n > max * 0.85;
  return (
    <span className="text-[10px] tabular-nums shrink-0" style={{ color: near ? DANGER : MUTED }}>
      {n}/{max}
    </span>
  );
}

/** Downscaled to a 1080px long edge before it ever reaches the wire — the photo
 *  slide never draws bigger than that, and a smaller payload publishes faster. */
function photoToDataUrl(file: File, cb: (src: string) => void, onError: (m: string) => void) {
  if (!file.type.startsWith("image/")) { onError("That file isn't an image."); return; }
  if (file.size > 8 * 1024 * 1024) { onError("Photo is over 8MB — try a smaller one."); return; }
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const MAX = 1080;
      const scale = Math.min(1, MAX / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) { cb(String(reader.result)); return; }
      ctx.drawImage(img, 0, 0, w, h);
      try { cb(canvas.toDataURL("image/jpeg", 0.82)); } catch { cb(String(reader.result)); }
    };
    img.onerror = () => cb(String(reader.result));
    img.src = String(reader.result);
  };
  reader.onerror = () => onError("Couldn't read that file.");
  reader.readAsDataURL(file);
}

/* ── THE DATE, and the proof that we did the maths ─────────────────────────────
   One input drives eleven slides. So the form shows the derivation the instant
   the date lands: the same numbers the recipient will see, in the same order,
   before the sender has typed anything else. Nothing else in this form sells the
   template as well as watching it fill in.
──────────────────────────────────────────────────────────────────────────────*/
function DerivedPreview({ startDate }: { startDate: string }) {
  const stats = useMemo(() => {
    const raw = (startDate ?? "").trim();
    if (!raw || Number.isNaN(Date.parse(raw))) return null;
    return deriveStats(raw);
  }, [startDate]);

  if (!stats || stats.isFuture) return null;

  const n = (v: number) => v.toLocaleString("en-IN");
  const plural = (v: number, one: string, many = `${one}s`) => `${v} ${v === 1 ? one : many}`;

  const bits: string[] = [
    plural(stats.days, "day"),
    `${n(stats.hours)} hours`,
    ...(stats.winters ? [plural(stats.winters, "winter")] : []),
    ...(stats.diwalis ? [plural(stats.diwalis, "Diwali", "Diwalis")] : []),
    ...(stats.holis ? [plural(stats.holis, "Holi", "Holis")] : []),
    ...(stats.monsoons ? [plural(stats.monsoons, "monsoon")] : []),
    `started on a ${stats.startWeekday}`,
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="rounded-xl px-3 py-2.5"
      style={{ background: "#fff", border: `1px solid ${RULE}` }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: MUTED }}>
        We worked this out for you
      </p>
      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        {bits.map((b, i) => (
          <React.Fragment key={b}>
            {i > 0 && <span aria-hidden style={{ color: RULE }}>·</span>}
            <span className="text-[12.5px] font-semibold tabular-nums" style={{ color: i === 0 ? FUCHSIA : INK }}>{b}</span>
          </React.Fragment>
        ))}
      </div>
      <p className="text-[11px] mt-1.5 leading-snug" style={{ color: MUTED }}>
        {stats.isEarly
          ? "It's early — the story says so out loud instead of showing a table of zeroes."
          : `Recounted every time someone opens the link. ${stats.yearPercent}% of this year so far.`}
      </p>
    </motion.div>
  );
}

/* ── The quiz. Rendered entirely from QUESTIONS — never hardcoded, so the form
      cannot drift from the frozen data the archetype is computed off. ─────── */
function Quiz({
  answers, startDate, onAnswer,
}: { answers: Record<string, string>; startDate: string; onAnswer: (qid: string, value: string) => void }) {
  const answered = QUESTIONS.filter((q) => answers[q.id]).length;
  const archetype = useMemo(() => computeArchetype(answers ?? {}, startDate ?? ""), [answers, startDate]);
  const fg = textOn(archetype.bg);

  return (
    <>
      <div className="flex gap-1" aria-hidden>
        {QUESTIONS.map((q) => (
          <span
            key={q.id}
            className="h-1 flex-1 rounded-full transition-colors"
            style={{ background: answers[q.id] ? FUCHSIA : "#EADDF0" }}
          />
        ))}
      </div>

      {QUESTIONS.map((q, qi) => (
        <fieldset key={q.id} className="border-0 p-0 m-0">
          <legend className="text-[12.5px] font-semibold mb-1.5 flex gap-1.5" style={{ color: INK }}>
            <span className="tabular-nums shrink-0" style={{ color: MUTED }}>{qi + 1}.</span>
            <span>{q.prompt}</span>
          </legend>
          <div className="grid grid-cols-1 gap-1.5">
            {q.options.map((o) => {
              const on = answers[q.id] === o.value;
              return (
                <button
                  key={o.value}
                  type="button"
                  aria-pressed={on}
                  onClick={() => onAnswer(q.id, o.value)}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all active:scale-[0.99] min-h-[48px] flex items-center gap-2"
                  style={{
                    background: on ? "rgba(162,28,175,.10)" : "#fff",
                    border: `1.5px solid ${on ? FUCHSIA : RULE}`,
                    color: on ? FUCHSIA : INK,
                  }}
                >
                  <span
                    aria-hidden
                    className="w-4 h-4 rounded-full shrink-0 grid place-items-center"
                    style={{ border: `1.5px solid ${on ? FUCHSIA : "#DCC9E4"}`, background: on ? FUCHSIA : "transparent" }}
                  >
                    {on && <span style={{ width: 6, height: 6, borderRadius: 999, background: "#fff" }} />}
                  </span>
                  <span className="min-w-0">{o.label}</span>
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}

      {/* The verdict, live. Watching it change as you answer is the proof that
          nobody picked it off a list. */}
      <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${RULE}` }}>
        <div className="px-3.5 py-3" style={{ background: archetype.bg }}>
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: fg, opacity: 0.7 }}>
            {answered === QUESTIONS.length ? "Your ending" : `Your ending so far · ${answered}/${QUESTIONS.length} answered`}
          </p>
          <p className="text-[15px] font-extrabold leading-tight" style={{ color: fg }}>{archetype.name}</p>
          <p className="text-[11.5px] mt-1 leading-snug" style={{ color: fg, opacity: 0.85 }}>{archetype.line}</p>
        </div>
        <p className="px-3.5 py-2 text-[11px]" style={{ color: MUTED, background: "#fff" }}>
          Computed from the answers, not chosen. Change one and watch it move.
        </p>
      </div>
    </>
  );
}

/* ── The sheet ─────────────────────────────────────────────────────────────── */

export default memo(function EditSheet({
  editMode, setEditMode, mf, updateMf, pagePassword, setPagePassword, onSave, saving,
}: Props) {
  const visible = editMode === "manual";
  const reduce = useReducedMotion();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoError, setPhotoError] = useState("");

  // Never trust a partially-filled draft: every array/record is read defensively.
  const reasons = useMemo(() => (Array.isArray(mf.topReasons) ? mf.topReasons : []), [mf.topReasons]);
  const stats = useMemo<Stat[]>(() => (Array.isArray(mf.stats) ? mf.stats : []), [mf.stats]);
  const photos = useMemo(() => (Array.isArray(mf.photos) ? mf.photos : []), [mf.photos]);
  const answers = useMemo(
    () => (mf.answers && typeof mf.answers === "object" ? mf.answers : {}),
    [mf.answers],
  );

  const writtenReasons = reasons.filter((r) => (r ?? "").trim()).length;
  const dateProblem = validateStartDate(mf.startDate);
  const ready = mf.recipientName.trim().length > 0 && !dateProblem && writtenReasons >= 1;

  /* reasons */
  const setReason = useCallback((i: number, v: string) => {
    updateMf("topReasons", reasons.map((r, idx) => (idx === i ? v.slice(0, MAX_REASON_LEN) : r)));
  }, [reasons, updateMf]);
  const addReason = useCallback(() => {
    if (reasons.length >= MAX_REASONS) return;
    updateMf("topReasons", [...reasons, ""]);
  }, [reasons, updateMf]);
  const removeReason = useCallback((i: number) => {
    updateMf("topReasons", reasons.filter((_, idx) => idx !== i));
  }, [reasons, updateMf]);
  const moveReason = useCallback((i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= reasons.length) return;
    const next = [...reasons];
    [next[i], next[j]] = [next[j], next[i]];
    updateMf("topReasons", next);
  }, [reasons, updateMf]);

  /* jokes */
  const patchStat = useCallback((i: number, patch: Partial<Stat>) => {
    updateMf("stats", stats.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }, [stats, updateMf]);
  const addStat = useCallback(() => {
    if (stats.length >= MAX_STATS) return;
    updateMf("stats", [...stats, { key: `s${Date.now().toString(36)}${stats.length}`, label: "", value: "", sub: "" }]);
  }, [stats, updateMf]);
  const removeStat = useCallback((i: number) => {
    updateMf("stats", stats.filter((_, idx) => idx !== i));
  }, [stats, updateMf]);

  /* photos */
  const addPhotoUrl = useCallback(() => {
    const v = photoUrl.trim();
    if (!v || photos.length >= MAX_PHOTOS) return;
    updateMf("photos", [...photos, v]);
    setPhotoUrl("");
    setPhotoError("");
  }, [photoUrl, photos, updateMf]);
  const addPhotoFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    setPhotoError("");
    const room = MAX_PHOTOS - photos.length;
    Array.from(files).slice(0, Math.max(0, room)).forEach((f) =>
      photoToDataUrl(f, (src) => updateMf("photos", [...(Array.isArray(mf.photos) ? mf.photos : []), src]), setPhotoError),
    );
  }, [photos.length, mf.photos, updateMf]);
  const removePhoto = useCallback((i: number) => {
    updateMf("photos", photos.filter((_, idx) => idx !== i));
  }, [photos, updateMf]);

  const onAnswer = useCallback((qid: string, value: string) => {
    updateMf("answers", { ...answers, [qid]: value });
  }, [answers, updateMf]);

  const sheetInit = reduce ? { opacity: 0 } : { y: "100%" as const };
  const sheetAnim = reduce ? { opacity: 1 } : { y: 0 };
  const sheetExit = reduce ? { opacity: 0 } : { y: "100%" as const };
  const sheetTrans = reduce
    ? { duration: 0.12 }
    : { type: "spring" as const, stiffness: 300, damping: 32 };

  // The story underneath listens for taps across the whole viewport. Everything
  // inside the sheet is form interaction, never a slide advance.
  const stop = (ev: React.PointerEvent | React.MouseEvent) => ev.stopPropagation();

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onPointerDown={stop}
            onClick={(ev) => { stop(ev); setEditMode("preview"); }}
            className="fixed inset-0 z-[200] bg-black/55"
          />
          <motion.div
            initial={sheetInit} animate={sheetAnim} exit={sheetExit} transition={sheetTrans}
            onPointerDown={stop}
            onPointerUp={stop}
            onClick={stop}
            className="fixed bottom-0 left-0 right-0 z-[200] pointer-events-auto lg:flex lg:items-center lg:justify-center lg:inset-0 lg:bg-transparent"
          >
            <div
              className="w-full max-w-2xl max-h-[86dvh] lg:max-h-[92dvh] overflow-y-auto bg-background rounded-t-3xl lg:rounded-3xl shadow-2xl mx-auto"
              style={{ overscrollBehavior: "contain", touchAction: "pan-y" }}
            >
              <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-background z-20">
                <div className="w-10 h-1 rounded-full bg-border" />
              </div>

              <div className="px-4 sm:px-5 pb-10 pt-2 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: INK }}>
                      <PenLine size={16} style={{ color: FUCHSIA }} /> Build their rewind
                    </h3>
                    <p className="text-[11px] mt-0.5" style={{ color: MUTED }}>
                      You write five things. We work out the rest.
                    </p>
                  </div>
                  <button
                    onClick={() => setEditMode("preview")}
                    aria-label="Close"
                    className="p-2 -mr-1 text-muted-foreground min-w-[44px] min-h-[44px] grid place-items-center"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* ── 1 · WHO ── */}
                <Section icon={<Users size={14} />} title="Who this is for" blurb="Their name opens the story and closes it.">
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Your name" hint="Signed at the end. Leave it blank to stay anonymous.">
                      <input
                        value={mf.senderName}
                        onChange={(ev) => updateMf("senderName", ev.target.value.slice(0, MAX_NAME_LEN))}
                        placeholder="e.g. Rohan"
                        className={INPUT_CLS}
                        style={INPUT_STYLE}
                      />
                    </Field>
                    <Field label="Their name *" hint="Set in the biggest type in the deck, so short beats formal.">
                      <input
                        value={mf.recipientName}
                        onChange={(ev) => updateMf("recipientName", ev.target.value.slice(0, MAX_NAME_LEN))}
                        placeholder="e.g. Aditi"
                        className={INPUT_CLS}
                        style={INPUT_STYLE}
                      />
                    </Field>
                  </div>
                  <div className="flex justify-end -mt-1">
                    <Counter n={mf.recipientName.length} max={MAX_NAME_LEN} />
                  </div>
                </Section>

                {/* ── 2 · THE DATE — the only number they type, and it isn't a number ── */}
                <Section
                  icon={<CalendarDays size={14} />}
                  title="The date it started"
                  blurb="The one field that matters. Every stat in the story — days, hours, winters, Diwalis, the weekday it began — is counted from here. You never type a total; we count it, fresh, each time the link is opened."
                >
                  <input
                    type="date"
                    value={mf.startDate ?? ""}
                    onChange={(ev) => updateMf("startDate", ev.target.value)}
                    aria-label="The date it started"
                    aria-invalid={Boolean(dateProblem)}
                    className={INPUT_CLS}
                    style={{
                      ...INPUT_STYLE,
                      minHeight: 48,
                      borderColor: dateProblem?.kind === "future" || dateProblem?.kind === "invalid" ? DANGER : undefined,
                    }}
                  />

                  {dateProblem ? (
                    <p
                      role="alert"
                      className="flex items-start gap-1.5 text-[11.5px] leading-snug"
                      style={{ color: dateProblem.kind === "missing" ? MUTED : DANGER }}
                    >
                      <AlertTriangle size={13} className="shrink-0 mt-px" />
                      <span>
                        {dateProblem.message}
                        {dateProblem.kind === "future" && " — pick the day it actually began."}
                      </span>
                    </p>
                  ) : (
                    <DerivedPreview startDate={mf.startDate} />
                  )}
                </Section>

                {/* ── 3 · TOP FIVE ── */}
                <Section
                  icon={<Quote size={14} />}
                  title="Top 5 reasons"
                  blurb="Counted down 5 → 1, one line at a time. This is the slide people screenshot, so be specific: the small thing beats the big word."
                  right={<span className="text-[11px] font-semibold tabular-nums" style={{ color: writtenReasons ? FUCHSIA : MUTED }}>{writtenReasons}/{MAX_REASONS}</span>}
                >
                  {reasons.length === 0 && (
                    <p className="text-[11.5px]" style={{ color: MUTED }}>Nothing here yet — add the first one.</p>
                  )}
                  {reasons.map((r, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span
                        className="shrink-0 w-7 h-11 grid place-items-center text-[12px] font-extrabold tabular-nums"
                        style={{ color: FUCHSIA }}
                        aria-hidden
                      >
                        #{i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <textarea
                          value={r ?? ""}
                          onChange={(ev) => setReason(i, ev.target.value)}
                          rows={2}
                          placeholder={i === 0 ? "You hand me the left earbud without looking" : "another small, specific thing…"}
                          aria-label={`Reason ${i + 1}`}
                          className={INPUT_SM + " resize-none"}
                          style={{ ...INPUT_STYLE, fontSize: 15 }}
                        />
                        <div className="flex justify-end mt-0.5">
                          <Counter n={(r ?? "").length} max={MAX_REASON_LEN} />
                        </div>
                      </div>
                      <div className="shrink-0 flex flex-col gap-1">
                        <div className="flex gap-1">
                          <button
                            type="button" onClick={() => moveReason(i, -1)} disabled={i === 0}
                            aria-label={`Move reason ${i + 1} up`}
                            className="w-[22px] h-[22px] rounded-md grid place-items-center disabled:opacity-25"
                            style={{ border: `1px solid ${RULE}`, color: MUTED }}
                          >
                            <ChevronUp size={12} />
                          </button>
                          <button
                            type="button" onClick={() => moveReason(i, 1)} disabled={i === reasons.length - 1}
                            aria-label={`Move reason ${i + 1} down`}
                            className="w-[22px] h-[22px] rounded-md grid place-items-center disabled:opacity-25"
                            style={{ border: `1px solid ${RULE}`, color: MUTED }}
                          >
                            <ChevronDown size={12} />
                          </button>
                        </div>
                        <button
                          type="button" onClick={() => removeReason(i)}
                          aria-label={`Remove reason ${i + 1}`}
                          className="w-full h-[22px] rounded-md grid place-items-center"
                          style={{ border: `1px solid ${RULE}`, color: MUTED }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {reasons.length < MAX_REASONS && (
                    <button
                      type="button" onClick={addReason}
                      className="w-full py-3 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-1.5 min-h-[44px]"
                      style={{ color: FUCHSIA, border: `1px dashed ${RULE}`, background: "#fff" }}
                    >
                      <Plus size={14} /> Add a reason
                    </button>
                  )}
                </Section>

                {/* ── 4 · THE JOKES ── */}
                <Section
                  icon={<Sparkles size={14} />}
                  title="The jokes"
                  blurb="The only numbers you type. Each one gets a whole slide: a huge figure, a label above it, and a punchline underneath. Made-up counts are funnier than accurate ones."
                  right={<span className="text-[11px] tabular-nums" style={{ color: MUTED }}>{stats.length}/{MAX_STATS}</span>}
                >
                  {stats.map((s, i) => (
                    <div key={s.key || i} className="relative rounded-xl p-3 space-y-2" style={{ background: "#fff", border: `1px solid ${RULE}` }}>
                      <div className="flex gap-2">
                        <div className="flex-1 min-w-0">
                          <input
                            value={s.label}
                            onChange={(ev) => patchStat(i, { label: ev.target.value.slice(0, 40) })}
                            placeholder="times you said"
                            aria-label={`Joke ${i + 1} label`}
                            className={INPUT_SM}
                            style={INPUT_STYLE}
                          />
                        </div>
                        <div className="w-[92px] shrink-0">
                          <input
                            value={s.value}
                            onChange={(ev) => patchStat(i, { value: ev.target.value.slice(0, 10) })}
                            placeholder="47"
                            aria-label={`Joke ${i + 1} number`}
                            className={INPUT_SM + " text-center font-extrabold tabular-nums"}
                            style={{ ...INPUT_STYLE, color: FUCHSIA }}
                          />
                        </div>
                      </div>
                      <input
                        value={s.sub}
                        onChange={(ev) => patchStat(i, { sub: ev.target.value.slice(0, 70) })}
                        placeholder={"\"I'm fine.\" You were fine twice."}
                        aria-label={`Joke ${i + 1} punchline`}
                        className={INPUT_SM}
                        style={INPUT_STYLE}
                      />
                      <button
                        type="button" onClick={() => removeStat(i)}
                        aria-label={`Remove joke ${i + 1}`}
                        className="absolute -top-2 -right-2 w-7 h-7 rounded-full grid place-items-center shadow-sm"
                        style={{ background: "#fff", border: `1px solid ${RULE}`, color: MUTED }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  {stats.length < MAX_STATS ? (
                    <button
                      type="button" onClick={addStat}
                      className="w-full py-3 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-1.5 min-h-[44px]"
                      style={{ color: FUCHSIA, border: `1px dashed ${RULE}`, background: "#fff" }}
                    >
                      <Plus size={14} /> Add a joke
                    </button>
                  ) : (
                    <p className="text-[11px] text-center" style={{ color: MUTED }}>
                      {MAX_STATS} is as many as the deck holds without dragging.
                    </p>
                  )}
                </Section>

                {/* ── 5 · THE QUIZ ── */}
                <Section
                  icon={<Sparkles size={14} />}
                  title="Six questions"
                  blurb="These decide the last slide — your relationship archetype. Nobody picks it; it's scored from what you tap here. Skipping a few is fine."
                >
                  <Quiz answers={answers} startDate={mf.startDate} onAnswer={onAnswer} />
                </Section>

                {/* ── 6 · PHOTOS ── */}
                <Section
                  icon={<Camera size={14} />}
                  title="Photos"
                  blurb={`Up to ${MAX_PHOTOS}. They stack and fan out on one slide. Skip it and the deck simply skips that slide.`}
                  right={<span className="text-[11px] tabular-nums" style={{ color: MUTED }}>{photos.length}/{MAX_PHOTOS}</span>}
                >
                  <div className="flex flex-wrap gap-2">
                    {photos.map((src, i) => (
                      <div key={`${i}-${src.slice(0, 24)}`} className="relative w-[68px] h-[68px] rounded-xl overflow-hidden" style={{ border: `1px solid ${RULE}` }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button" onClick={() => removePhoto(i)}
                          aria-label={`Remove photo ${i + 1}`}
                          className="absolute top-0.5 right-0.5 w-6 h-6 rounded-full bg-black/70 text-white grid place-items-center text-[11px]"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {photos.length < MAX_PHOTOS && (
                      <button
                        type="button" onClick={() => photoInputRef.current?.click()}
                        aria-label="Upload photos"
                        className="w-[68px] h-[68px] rounded-xl grid place-items-center"
                        style={{ border: `1.5px dashed ${RULE}`, color: FUCHSIA, background: "#fff" }}
                      >
                        <Plus size={18} />
                      </button>
                    )}
                    <input
                      ref={photoInputRef} type="file" accept="image/*" multiple className="hidden"
                      onChange={(ev) => { addPhotoFiles(ev.target.files); ev.target.value = ""; }}
                    />
                  </div>
                  {photos.length < MAX_PHOTOS && (
                    <div className="flex gap-2">
                      <div className="relative flex-1 min-w-0">
                        <Link2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
                        <input
                          value={photoUrl}
                          onChange={(ev) => setPhotoUrl(ev.target.value)}
                          onKeyDown={(ev) => { if (ev.key === "Enter") { ev.preventDefault(); addPhotoUrl(); } }}
                          placeholder="…or paste an image link"
                          aria-label="Photo link"
                          className={INPUT_SM + " pl-9"}
                          style={INPUT_STYLE}
                        />
                      </div>
                      <button
                        type="button" onClick={addPhotoUrl} disabled={!photoUrl.trim()}
                        className="px-4 rounded-lg text-sm font-semibold disabled:opacity-40 min-h-[44px]"
                        style={{ color: FUCHSIA, border: `1px solid ${RULE}`, background: "#fff" }}
                      >
                        Add
                      </button>
                    </div>
                  )}
                  {photoError && <p role="alert" className="text-[11px]" style={{ color: DANGER }}>{photoError}</p>}
                </Section>

                {/* ── 7 · THE SONG ── */}
                <Section
                  icon={<Music4 size={14} />}
                  title="The song"
                  blurb="One slide, one track. Leave the audio link empty and the song slide is removed entirely — no silent placeholder."
                >
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Title">
                      <input
                        value={mf.songTitle}
                        onChange={(ev) => updateMf("songTitle", ev.target.value.slice(0, 48))}
                        placeholder="the one you played twice"
                        className={INPUT_SM}
                        style={INPUT_STYLE}
                      />
                    </Field>
                    <Field label="Artist / where">
                      <input
                        value={mf.songArtist}
                        onChange={(ev) => updateMf("songArtist", ev.target.value.slice(0, 48))}
                        placeholder="in the auto, both times"
                        className={INPUT_SM}
                        style={INPUT_STYLE}
                      />
                    </Field>
                  </div>
                  <Field label="Audio link (optional)" hint="A direct link to an mp3/m4a file. Empty means no song slide at all.">
                    <div className="relative">
                      <Link2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
                      <input
                        value={mf.audioUrl}
                        onChange={(ev) => updateMf("audioUrl", ev.target.value.trim())}
                        placeholder="https://…  (empty = no song slide)"
                        className={INPUT_SM + " pl-9"}
                        style={INPUT_STYLE}
                      />
                    </div>
                  </Field>
                </Section>

                {/* ── 8 · CLOSING LINE ── */}
                <Section icon={<PenLine size={14} />} title="The last line" blurb="The final slide, on its own, in big type. Short lands hardest.">
                  <textarea
                    value={mf.closingLine}
                    onChange={(ev) => updateMf("closingLine", ev.target.value.slice(0, MAX_CLOSING_LEN))}
                    rows={2}
                    placeholder="Same time next year."
                    aria-label="Closing line"
                    className={INPUT_SM + " resize-none"}
                    style={{ ...INPUT_STYLE, fontSize: 15 }}
                  />
                  <div className="flex justify-end -mt-1">
                    <Counter n={mf.closingLine.length} max={MAX_CLOSING_LEN} />
                  </div>
                </Section>

                {/* ── 9 · PASSWORD ── */}
                <Section icon={<Lock size={14} />} title="Password (optional)" blurb="If set, the shared link asks for it before the story plays.">
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
                    <input
                      value={pagePassword}
                      onChange={(ev) => setPagePassword(ev.target.value)}
                      placeholder="Leave empty for no password"
                      aria-label="Password"
                      className={INPUT_CLS + " pl-10"}
                      style={INPUT_STYLE}
                    />
                  </div>
                </Section>

                <button
                  onClick={onSave}
                  disabled={saving || !ready}
                  className="w-full py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 min-h-[48px]"
                  style={{ background: FUCHSIA_GRAD }}
                >
                  {saving ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : <><Eye size={16} /> Save & play it</>}
                </button>
                <p className="text-center text-[11px]" style={{ color: MUTED }}>
                  {ready
                    ? "Publish from the preview to get your shareable link"
                    : "Needs their name, the date it started, and one reason"}
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});
