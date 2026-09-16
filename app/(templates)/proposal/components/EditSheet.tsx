"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, PenLine, Eye, Camera, Trash2, Plus, Lock, Loader2, Heart, ChevronDown,
  ArrowUp, ArrowDown, Music, CalendarHeart, AlertCircle,
} from "lucide-react";
import type { EditMode, HeroArt, Memory, ProposalData } from "./types";
import { BUILTIN_TRACKS, TRACK_IDS, parseYouTubeId, type MusicChoice } from "./music";
import { PERSPECTIVES, copyFor } from "./copy";
import { MAX_MEMORIES, MIN_MEMORIES } from "./types";
import { HERO_ART } from "./assets";
import type { ProposalErrors } from "../hooks/useProposalEditor";
import PhotoCropper from "./PhotoCropper";

// ── Kawaii pastel palette (matches the template) ─────────────────────────────
const PINK = "#F2789F";
const PINK_SOFT = "#FFEAF2";
const LAVENDER = "#A78BFA";
const CREAM = "#FFFBF7";
const INK = "#4A3547";
const MUTED = "#8B7B88";
const LINE = "#F3E3EC";
const HEAD = "var(--font-fredoka), ui-rounded, ui-sans-serif, system-ui, sans-serif";

const PINK_GRADIENT = "linear-gradient(135deg,#FFA0BF,#F2789F)";

const INPUT_CLS =
  "w-full px-4 py-3 rounded-2xl text-sm transition-all focus:outline-none focus:ring-2";
const inputStyle: React.CSSProperties = {
  background: "#FFF",
  border: `1.5px solid ${LINE}`,
  color: INK,
  // Tailwind's ring colour utility can't see our palette, so it rides on the shadow.
  boxShadow: "none",
};
const errorInputStyle: React.CSSProperties = { ...inputStyle, border: "1.5px solid #EF7C8E" };

/**
 * A textarea that grows with its content instead of scrolling inside itself.
 *
 * This matters more than it looks: a short fixed-height textarea sitting inside
 * the sheet's own scroll container swallows the scroll gesture the moment the
 * pointer is over it, so the form reads as "not scrollable". Growing to fit means
 * there is only ever ONE scrollbar on screen — the sheet's. `maxPx` is the last
 * resort for someone pasting an essay; past that it scrolls internally again.
 */
function AutoTextarea({
  value,
  onChange,
  minRows = 3,
  maxPx = 340,
  ...rest
}: {
  value: string;
  onChange: (next: string) => void;
  minRows?: number;
  maxPx?: number;
} & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange" | "rows">) {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  const fit = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    // These inputs are border-box, so `height` includes the border while
    // `scrollHeight` does not. Without adding it back the box lands 3px short
    // (1.5px border twice) and clips the final line of text.
    const cs = getComputedStyle(el);
    const border = parseFloat(cs.borderTopWidth || "0") + parseFloat(cs.borderBottomWidth || "0");
    const wanted = el.scrollHeight + border;
    el.style.height = `${Math.min(wanted, maxPx)}px`;
    el.style.overflowY = wanted > maxPx ? "auto" : "hidden";
  }, [maxPx]);

  // Re-fit on every value change — covers typing, paste, and the draft restore
  // that populates the whole form at once when the sheet opens.
  useEffect(fit, [value, fit]);

  return (
    <textarea
      ref={ref}
      rows={minRows}
      value={value}
      onChange={(ev) => onChange(ev.target.value)}
      onInput={fit}
      {...rest}
    />
  );
}

/** Longest edge of a stored polaroid. They render at ~150px, so this is generous. */
const MAX_EDGE = 1400;
/** Raw-file backstop. ~1.6MB once base64-encoded. */
const MAX_UPLOAD_BYTES = 1.2 * 1024 * 1024;

const mbLabel = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

/**
 * Downscale an upload and return it as a data URL.
 *
 * The polaroids are tiny on screen, so capping the longest edge at 1400px is
 * visually free and typically cuts the encoded payload by 5–10x — which is what
 * keeps a six-photo scrapbook comfortably under the API's 15MB body limit.
 *
 * PNG/WebP sources are re-exported as WebP rather than JPEG: a photo with a
 * transparent cut-out would otherwise gain a black background.
 */
function compressToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("no 2d context");
        ctx.drawImage(img, 0, 0, w, h);
        // Only formats that *can* carry alpha keep it.
        const keepsAlpha = file.type === "image/png" || file.type === "image/webp" || file.type === "image/gif";
        const out = keepsAlpha
          ? canvas.toDataURL("image/webp", 0.85)
          : canvas.toDataURL("image/jpeg", 0.82);
        resolve(out && out.length > 24 ? out : "");
      } catch (err) {
        reject(err);
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("decode failed"));
    };
    img.src = objectUrl;
  });
}

/** Last-resort path when canvas is unavailable — encode the file as it is. */
function rawDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(String(e.target?.result ?? ""));
    reader.onerror = () => reject(new Error("read failed"));
    reader.readAsDataURL(file);
  });
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider"
        style={{ color: MUTED, fontFamily: HEAD }}
      >
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 flex items-start gap-1 text-[11px] font-medium" style={{ color: "#D9536A" }}>
          <AlertCircle size={12} className="mt-[1px] shrink-0" /> {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-[10.5px] leading-snug" style={{ color: MUTED }}>{hint}</p>
      ) : null}
    </div>
  );
}

interface Props {
  editMode: EditMode;
  setEditMode: (m: EditMode) => void;
  mf: ProposalData;
  updateMf: (key: keyof ProposalData, val: unknown) => void;
  updateMemory: (index: number, patch: Partial<Memory>) => void;
  addMemory: () => void;
  removeMemory: (index: number) => void;
  moveMemory: (index: number, dir: -1 | 1) => void;
  pagePassword: string;
  setPagePassword: (v: string) => void;
  errors: ProposalErrors;
  showErrors: boolean;
  memoryBytes: number;
  onSave: () => void;
  saving: boolean;
}

function MemoryRow({
  memory,
  index,
  total,
  onPatch,
  onRemove,
  onMove,
}: {
  memory: Memory;
  index: number;
  total: number;
  onPatch: (patch: Partial<Memory>) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [rowError, setRowError] = useState<string | null>(null);

  /**
   * The picked file, held as an object URL while the sender frames it.
   *
   * ── WHY A CROP STEP AT ALL ────────────────────────────────────────────────
   *
   * A phone camera shoots 4:3 or 16:9 and the card shows a square, so something
   * has to decide what is lost. It used to be `object-fit: cover` — a centre
   * crop, applied silently, which is how a photo of two people becomes a photo
   * of one person's shoulder. Now the sender decides, on the picture, before it
   * is saved.
   *
   * The cropper also replaces the downscale: it draws the chosen square to a
   * 1080px canvas, so what comes back is already bounded. `compressToDataUrl`
   * stays for the fallback path below, where there is no canvas to crop with.
   */
  const [pending, setPending] = useState<{ url: string; type: string; file: File } | null>(null);

  const pick = (file: File) => {
    setRowError(null);
    if (file.size > MAX_UPLOAD_BYTES) {
      setRowError(`That photo is ${mbLabel(file.size)}. Please pick one under 1.2 MB 🥺`);
      return;
    }
    // A blob URL, not a data URL: the cropper only needs to draw it, and a
    // 1.2MB base64 string through React state on every keystroke is waste.
    setPending({ url: URL.createObjectURL(file), type: file.type, file });
  };

  const closeCropper = useCallback(() => {
    setPending((p) => {
      if (p) URL.revokeObjectURL(p.url);
      return null;
    });
  }, []);

  /** No canvas, no crop — the old path, so the upload still works. */
  const fallback = async (file: File) => {
    setBusy(true);
    try {
      let src = "";
      try {
        src = await compressToDataUrl(file);
      } catch {
        src = await rawDataUrl(file);
      }
      if (!src) throw new Error("empty");
      onPatch({ imageUrl: src });
    } catch {
      setRowError("Couldn't read that image. Try a JPG or PNG.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl p-3" style={{ background: CREAM, border: `1.5px solid ${LINE}` }}>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl transition-transform active:scale-95"
          style={{
            border: `2px dashed ${memory.imageUrl ? "transparent" : "#EFC9DA"}`,
            background: memory.imageUrl ? "#FFF" : PINK_SOFT,
          }}
          aria-label={memory.imageUrl ? "Change photo" : "Add photo"}
        >
          {busy ? (
            <Loader2 size={18} className="animate-spin" style={{ color: PINK }} />
          ) : memory.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={memory.imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <Camera size={20} style={{ color: PINK }} />
          )}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(ev) => {
            const f = ev.target.files?.[0];
            if (f) pick(f);
            ev.target.value = "";
          }}
        />

        {pending && (
          <PhotoCropper
            src={pending.url}
            fileType={pending.type}
            onCancel={closeCropper}
            onDone={(dataUrl) => {
              onPatch({ imageUrl: dataUrl });
              closeCropper();
            }}
            onUnavailable={() => {
              const f = pending.file;
              closeCropper();
              void fallback(f);
            }}
          />
        )}

        <div className="min-w-0 flex-1">
          <AutoTextarea
            value={memory.caption}
            onChange={(next) => onPatch({ caption: next.slice(0, 140) })}
            minRows={2}
            maxPx={160}
            maxLength={140}
            placeholder="the day you said hi first 🐱"
            className={INPUT_CLS + " resize-none !py-2 !px-3"}
            style={inputStyle}
          />
          <div className="mt-1.5 flex items-center gap-1">
            <button
              type="button"
              onClick={() => onMove(-1)}
              disabled={index === 0}
              aria-label="Move up"
              className="grid h-8 w-8 place-items-center rounded-xl disabled:opacity-30"
              style={{ background: "#FFF", border: `1px solid ${LINE}`, color: MUTED }}
            >
              <ArrowUp size={13} />
            </button>
            <button
              type="button"
              onClick={() => onMove(1)}
              disabled={index === total - 1}
              aria-label="Move down"
              className="grid h-8 w-8 place-items-center rounded-xl disabled:opacity-30"
              style={{ background: "#FFF", border: `1px solid ${LINE}`, color: MUTED }}
            >
              <ArrowDown size={13} />
            </button>
            <div className="flex-1" />
            <button
              type="button"
              onClick={onRemove}
              aria-label="Remove memory"
              className="grid h-8 w-8 place-items-center rounded-xl"
              style={{ background: "#FFF", border: `1px solid ${LINE}`, color: "#D9536A" }}
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>
      {rowError && (
        <p className="mt-2 flex items-start gap-1 text-[11px] font-medium" style={{ color: "#D9536A" }}>
          <AlertCircle size={12} className="mt-[1px] shrink-0" /> {rowError}
        </p>
      )}
    </div>
  );
}

export default memo(function EditSheet({
  editMode,
  setEditMode,
  mf,
  updateMf,
  updateMemory,
  addMemory,
  removeMemory,
  moveMemory,
  pagePassword,
  setPagePassword,
  errors,
  showErrors,
  memoryBytes,
  onSave,
  saving,
}: Props) {
  const visible = editMode !== null && editMode !== "preview";
  const [advanced, setAdvanced] = useState(false);

  const close = useCallback(() => setEditMode("preview"), [setEditMode]);

  const usable = mf.memories.filter((m) => m.imageUrl.trim()).length;

  /**
   * What the pasted link resolves to, or null when the field is empty.
   *
   * Mirrors `resolveMusic`'s precedence rather than re-deciding it: the form
   * must describe what the page will actually do, and two places deciding
   * "YouTube or file?" separately is how they drift apart.
   */
  const trimmedMusic = mf.musicUrl.trim();
  const linkedMusic: "youtube" | "file" | null = !trimmedMusic
    ? null
    : parseYouTubeId(trimmedMusic)
      ? "youtube"
      : /^https?:\/\//i.test(trimmedMusic)
        ? "file"
        : null;
  const err = (k: keyof ProposalErrors) => (showErrors ? errors[k] : undefined);

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-[60]"
            style={{ background: "rgba(74,53,71,.45)", backdropFilter: "blur(3px)" }}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="fixed bottom-0 left-0 right-0 z-[60] pointer-events-auto lg:inset-0 lg:flex lg:items-center lg:justify-center lg:bg-transparent"
          >
            <div
              className="psSheet mx-auto w-full overflow-y-auto overscroll-contain rounded-t-3xl shadow-2xl lg:rounded-3xl"
              style={{
                background: "rgba(255,251,247,.94)",
                backdropFilter: "blur(18px)",
                // Momentum scrolling on iOS; without it the sheet feels stuck at
                // the ends of its range even though it does scroll.
                WebkitOverflowScrolling: "touch",
              }}
            >
              {/*
                ── WHY THE SIZE IS A HAND-WRITTEN STYLE BLOCK ────────────────

                Not a Tailwind class and not an inline style, and both for
                recorded reasons.

                Tailwind first: `max-h-[86vh]` and `max-h-[86dvh]` both came out
                of the generator as `max-height: none` here, which removed the
                cap entirely — the sheet grew to its full content height, and
                because it is bottom-anchored that put about 1200px of form
                above the top of the viewport with no way to scroll up to it.

                Inline second: an inline style cannot be overridden by a media
                query, so the phone's cap would also be the desktop's, which is
                exactly the bug that left the desktop form cut off. This is the
                trap documented at length in components/feedback/MascotStage.tsx.

                A plain stylesheet is the only one of the three that can be both
                reliable and responsive.

                Desktop: half the viewport width and about two thirds its
                height, which is what a form of this length wants — wide enough
                for the two-column rows, short enough that the page behind still
                frames it as a dialog rather than a takeover.
              */}
              <style>{`
                .psSheet {
                  max-height: 86dvh;
                  max-width: 42rem;
                  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 28px);
                }
                @media (min-width: 1024px) {
                  .psSheet {
                    width: 50vw;
                    min-width: 620px;
                    max-width: 900px;
                    height: 68dvh;
                    max-height: 68dvh;
                    padding-bottom: 26px;
                  }
                }
                /* The grab handle is a phone affordance; a centred dialog has a
                   close button and does not get dragged. */
                @media (min-width: 1024px) { .psGrab { display: none } }
              `}</style>
              <div
                className="psGrab sticky top-0 z-10 flex justify-center pb-1 pt-3"
                style={{ background: "linear-gradient(180deg,rgba(255,251,247,.98),rgba(255,251,247,.7))" }}
              >
                <div className="h-1 w-10 rounded-full" style={{ background: "#EFD9E5" }} />
              </div>

              <div className="space-y-5 px-5 pt-2">
                <div className="flex items-center justify-between">
                  <h3
                    className="flex items-center gap-2 text-lg font-bold"
                    style={{ fontFamily: HEAD, color: INK }}
                  >
                    <PenLine size={16} style={{ color: PINK }} /> Write your proposal
                  </h3>
                  <button onClick={close} aria-label="Close" style={{ color: MUTED }} className="p-1">
                    <X size={20} />
                  </button>
                </div>

                {/* ── Names ── */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Your name" hint="Signs the secret note.">
                    <input
                      value={mf.senderName}
                      onChange={(ev) => updateMf("senderName", ev.target.value)}
                      placeholder="e.g. Aarav"
                      className={INPUT_CLS}
                      style={inputStyle}
                    />
                  </Field>
                  <Field label="Their name *" error={err("recipientName")}>
                    <input
                      value={mf.recipientName}
                      onChange={(ev) => updateMf("recipientName", ev.target.value)}
                      placeholder="e.g. Ananya"
                      className={INPUT_CLS}
                      style={err("recipientName") ? errorInputStyle : inputStyle}
                    />
                  </Field>
                </div>

                {/* ── The big question ── */}
                <Field label="The big question" hint="The headline they'll see when the ask appears.">
                  <input
                    value={mf.askHeadline}
                    onChange={(ev) => updateMf("askHeadline", ev.target.value)}
                    placeholder="Will you be my forever?"
                    className={INPUT_CLS}
                    style={inputStyle}
                  />
                </Field>

                {/* ── What kind of ask this is ──────────────────────────
                    First, because it rewrites the wording of every other field
                    below it. Putting it lower would mean somebody writes their
                    headline and then watches the toggle overwrite it. */}
                <Field
                  label="What are you asking?"
                  hint="Changes the wording across the whole page. Anything you have written yourself is kept."
                >
                  <div className="grid grid-cols-2 gap-2.5">
                    {PERSPECTIVES.map((key) => {
                      const c = copyFor(key);
                      const on = mf.perspective === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => updateMf("perspective", key)}
                          aria-pressed={on}
                          className="rounded-2xl p-3 text-left transition-transform active:scale-95"
                          style={{
                            border: `2px solid ${on ? PINK : LINE}`,
                            background: on ? PINK_SOFT : "#FFF",
                            boxShadow: on ? "0 8px 20px -8px rgba(242,120,159,.5)" : "none",
                          }}
                        >
                          <span
                            className="block text-[13px] font-bold leading-tight"
                            style={{ fontFamily: HEAD, color: on ? PINK : INK }}
                          >
                            {c.emoji} {c.pickerLabel}
                          </span>
                          <span
                            className="mt-1 block text-[11px] leading-snug"
                            style={{ color: MUTED }}
                          >
                            {c.pickerBlurb}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </Field>

                {/* ── Hero art picker ── */}
                <Field label="Pick your moment" hint="The animation that headlines the proposal.">
                  <div className="grid grid-cols-3 gap-2.5">
                    {(Object.keys(HERO_ART) as HeroArt[]).map((key) => {
                      const art = HERO_ART[key];
                      const on = mf.heroArt === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => updateMf("heroArt", key)}
                          className="flex flex-col items-center gap-1.5 rounded-2xl p-2.5 transition-transform active:scale-95"
                          style={{
                            border: `2px solid ${on ? PINK : LINE}`,
                            background: on ? PINK_SOFT : "#FFF",
                            boxShadow: on ? "0 8px 20px -8px rgba(242,120,159,.5)" : "none",
                          }}
                          aria-pressed={on}
                        >
                          {/* 80px, and `objectFit` as a style rather than a
                              class: at 56px these thumbnails were showing the
                              top third of a tall animation and reading as
                              broken art. The box is now tall enough to letterbox
                              the real aspect ratio, and the fit cannot be lost
                              to class generation. */}
                          <span
                            className="grid h-20 w-full place-items-center overflow-hidden rounded-xl"
                            style={{ background: on ? "#FFF" : "#FDF6FA" }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={art.src}
                              alt={art.alt}
                              loading="lazy"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                              }}
                            />
                          </span>
                          <span
                            className="text-[11px] font-bold leading-tight"
                            style={{ fontFamily: HEAD, color: on ? PINK : MUTED }}
                          >
                            {art.emoji} {art.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </Field>

                {/* ── Memory lane ── */}
                <div>
                  <div className="mb-2 flex items-end justify-between">
                    <label
                      className="text-[11px] font-bold uppercase tracking-wider"
                      style={{ color: MUTED, fontFamily: HEAD }}
                    >
                      Your memories *
                    </label>
                    <span
                      className="rounded-full px-2 py-0.5 text-[11px] font-bold"
                      style={{ background: PINK_SOFT, color: PINK, fontFamily: HEAD }}
                    >
                      {usable} / {MAX_MEMORIES}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {mf.memories.map((m, i) => (
                      <MemoryRow
                        key={i}
                        memory={m}
                        index={i}
                        total={mf.memories.length}
                        onPatch={(patch) => updateMemory(i, patch)}
                        onRemove={() => removeMemory(i)}
                        onMove={(dir) => moveMemory(i, dir)}
                      />
                    ))}
                  </div>

                  {mf.memories.length < MAX_MEMORIES && (
                    <button
                      type="button"
                      onClick={addMemory}
                      className="mt-2.5 inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-bold transition-transform active:scale-95"
                      style={{ background: PINK_SOFT, color: PINK, fontFamily: HEAD }}
                    >
                      <Plus size={14} /> Add a memory
                    </button>
                  )}

                  {(err("memories") || err("payload")) && (
                    <p
                      className="mt-2 flex items-start gap-1 text-[11px] font-medium"
                      style={{ color: "#D9536A" }}
                    >
                      <AlertCircle size={12} className="mt-[1px] shrink-0" />
                      {err("memories") ?? err("payload")}
                    </p>
                  )}
                  <p className="mt-1.5 text-[10.5px] leading-snug" style={{ color: MUTED }}>
                    Photos are shrunk on your phone before sending, so uploads stay quick.
                    {memoryBytes > 0 && ` Currently ${mbLabel(memoryBytes)}.`}
                  </p>
                </div>

                {/* ── The payoff ── */}
                <Field label="Celebration title" hint="Shown the moment they say yes.">
                  <input
                    value={mf.celebrationTitle}
                    onChange={(ev) => updateMf("celebrationTitle", ev.target.value)}
                    placeholder="You are officially mine forever ❤️"
                    className={INPUT_CLS}
                    style={inputStyle}
                  />
                </Field>

                <Field label="Your secret note" hint="The long, honest bit. Signed with your name.">
                  <AutoTextarea
                    value={mf.secretNote}
                    onChange={(next) => updateMf("secretNote", next)}
                    minRows={5}
                    placeholder="Say the thing you've been rehearsing…"
                    className={INPUT_CLS + " resize-none"}
                    style={inputStyle}
                  />
                </Field>

                {/* ── Optional extras ── */}
                <Field
                  label="The day you met (optional)"
                  hint="Adds a little “we've been together N days” counter."
                >
                  <div className="relative">
                    <CalendarHeart
                      size={15}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                      style={{ color: PINK }}
                    />
                    <input
                      type="date"
                      value={mf.metDate}
                      onChange={(ev) => updateMf("metDate", ev.target.value)}
                      className={INPUT_CLS + " pl-10"}
                      style={inputStyle}
                    />
                  </div>
                </Field>

                {/* ── Music ─────────────────────────────────────────────────
                    Two controls, and the link wins when it is filled in: a
                    sender who pasted something meant it, and silently playing a
                    built-in melody over the top of their choice would be the
                    single most confusing thing this form could do. The picker
                    is dimmed rather than removed when that happens, so it is
                    visible why it is not in charge. */}
                <Field
                  label="Music"
                  hint="Plays from the moment they open it. There is a mute button on the page."
                >
                  <div
                    className="grid grid-cols-2 gap-2 sm:grid-cols-4"
                    style={{ opacity: linkedMusic ? 0.45 : 1 }}
                  >
                    {(["auto", ...TRACK_IDS] as MusicChoice[]).map((id) => {
                      const t = id === "auto" ? null : BUILTIN_TRACKS[id as Exclude<MusicChoice, "auto">];
                      const on = mf.musicTrack === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          disabled={Boolean(linkedMusic)}
                          onClick={() => updateMf("musicTrack", id)}
                          aria-pressed={on}
                          className="rounded-2xl p-2.5 text-left transition-transform active:scale-95 disabled:cursor-not-allowed"
                          style={{
                            border: `2px solid ${on ? PINK : LINE}`,
                            background: on ? PINK_SOFT : "#FFF",
                          }}
                        >
                          <span
                            className="block text-[12px] font-bold leading-tight"
                            style={{ fontFamily: HEAD, color: on ? PINK : INK }}
                          >
                            {t ? `${t.emoji} ${t.label}` : "🎲 Surprise me"}
                          </span>
                          <span className="mt-0.5 block text-[10.5px] leading-snug" style={{ color: MUTED }}>
                            {t ? t.blurb : "A different one each time."}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="relative mt-2.5">
                    <Music
                      size={15}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                      style={{ color: LAVENDER }}
                    />
                    <input
                      value={mf.musicUrl}
                      onChange={(ev) => updateMf("musicUrl", ev.target.value)}
                      placeholder="Or paste a YouTube link, or an .mp3 URL"
                      inputMode="url"
                      className={INPUT_CLS + " pl-10"}
                      style={inputStyle}
                    />
                  </div>

                  <p className="mt-1.5 text-[11px] leading-snug" style={{ color: MUTED }}>
                    {linkedMusic === "youtube" ? (
                      <>
                        <strong style={{ color: PINK }}>YouTube song detected.</strong> It plays through
                        YouTube&rsquo;s own player, which appears as a small panel in the corner of the
                        page — it has to stay visible, that is YouTube&rsquo;s rule, not ours.
                      </>
                    ) : linkedMusic === "file" ? (
                      <>
                        <strong style={{ color: PINK }}>Audio link detected.</strong> Make sure it is a
                        file you have the right to share.
                      </>
                    ) : (
                      <>The melodies above are written for this page, so there is nothing to load and
                      nothing that can be taken down. Paste a link if you have one particular song.</>
                    )}
                  </p>
                </Field>

                {/* ── Advanced wording ── */}
                <div className="rounded-2xl" style={{ border: `1.5px solid ${LINE}`, background: "#FFF" }}>
                  <button
                    type="button"
                    onClick={() => setAdvanced((v) => !v)}
                    aria-expanded={advanced}
                    className="flex w-full items-center justify-between px-4 py-3"
                  >
                    <span className="text-sm font-bold" style={{ fontFamily: HEAD, color: INK }}>
                      Customise wording
                    </span>
                    <ChevronDown
                      size={16}
                      style={{
                        color: MUTED,
                        transform: advanced ? "rotate(180deg)" : "none",
                        transition: "transform .2s",
                      }}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {advanced && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: "hidden" }}
                      >
                        <div className="space-y-4 px-4 pb-4">
                          <Field label="Opening question" hint="The line on the very first screen.">
                            <input
                              value={mf.gateTitle}
                              onChange={(ev) => updateMf("gateTitle", ev.target.value)}
                              placeholder="Are you ready for a surprise?"
                              className={INPUT_CLS}
                              style={inputStyle}
                            />
                          </Field>
                          <Field label="Opening button">
                            <input
                              value={mf.gateButtonLabel}
                              onChange={(ev) => updateMf("gateButtonLabel", ev.target.value)}
                              placeholder="Yes, show me!"
                              className={INPUT_CLS}
                              style={inputStyle}
                            />
                          </Field>
                          <Field label="Scrapbook title">
                            <input
                              value={mf.memoryLaneTitle}
                              onChange={(ev) => updateMf("memoryLaneTitle", ev.target.value)}
                              placeholder="Everything that led to this"
                              className={INPUT_CLS}
                              style={inputStyle}
                            />
                          </Field>
                          <Field label="“Yes” button" hint="The button that grows every time they dodge.">
                            <input
                              value={mf.yesLabel}
                              onChange={(ev) => updateMf("yesLabel", ev.target.value)}
                              placeholder="YES! 💖"
                              className={INPUT_CLS}
                              style={inputStyle}
                            />
                          </Field>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* ── Password ── */}
                <Field
                  label="Password (optional)"
                  hint="If set, the shared link asks for this before opening."
                >
                  <div className="relative">
                    <Lock
                      size={15}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                      style={{ color: MUTED }}
                    />
                    <input
                      value={pagePassword}
                      onChange={(ev) => setPagePassword(ev.target.value)}
                      placeholder="Leave empty for no password"
                      className={INPUT_CLS + " pl-10"}
                      style={inputStyle}
                    />
                  </div>
                </Field>

                {/* Sticky action footer — on a form this long the primary action
                    must not require scrolling to the very end to reach. The negative
                    inline margin lets the frosted backing span the sheet's gutters. */}
                <div
                  className="sticky bottom-0 z-10 -mx-5 px-5 pb-2 pt-3"
                  style={{
                    background:
                      "linear-gradient(0deg,rgba(255,251,247,.99) 62%,rgba(255,251,247,.72) 100%)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <button
                    onClick={onSave}
                    disabled={saving}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white disabled:opacity-50"
                    style={{ background: PINK_GRADIENT, fontFamily: HEAD, boxShadow: "0 10px 24px -10px rgba(242,120,159,.8)" }}
                  >
                    {saving ? (
                      <><Loader2 size={16} className="animate-spin" /> Saving…</>
                    ) : (
                      <><Eye size={16} /> Save &amp; Preview</>
                    )}
                  </button>
                  <p
                    className="mt-2 flex items-center justify-center gap-1 text-center text-[11px]"
                    style={{ color: MUTED }}
                  >
                    <Heart size={10} /> Publish from the preview to get your shareable link
                  </p>
                </div>
                {usable < MIN_MEMORIES && !showErrors && (
                  <p className="text-center text-[10.5px]" style={{ color: MUTED }}>
                    Add at least one photo to continue.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});
