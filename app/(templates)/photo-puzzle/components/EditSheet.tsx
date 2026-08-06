"use client";

// ─── The Last Piece — the sender's side ──────────────────────────────────────
//
// Five tabs, straight off `config.ts`: photo · letter · melody · final · reveal.
// Every change goes through `updateMf`; the hook autosaves on every keystroke,
// so nothing here ever writes to storage itself.
//
// House rules for this form:
//   * Only three things are actually required — your name, their name, and two
//     lines. Everything else already has a working default, and the form says so
//     out loud rather than leaving someone guessing whether blank means broken.
//   * Nobody is asked to type a semitone. The melody is chosen by name.
//   * 16 pieces is the ceiling and the UI must make more than that unaskable.
//     There is no path in here that offers 24.

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  X, Lock, Loader2, Plus, Trash2, ChevronUp, ChevronDown, Minus,
  Image as ImageIcon, Play, Eye, Info, Check,
} from "lucide-react";

import { config } from "../config";
import {
  GRID, normaliseGrid,
  type EditMode, type FinalPieceMode, type PuzzleData,
} from "./types";
import {
  INDIGO, INDIGO_SOFT, ROSE, GRAD, INK, INK_SOFT,
  PAPER, PAPER_EDGE, OUTFIT, SERIF, RADIUS,
} from "./puzzleTheme";
import { playMelody } from "./puzzleAudio";
import { unlockAudio } from "@/lib/webAudio";

export interface EditSheetProps {
  editMode: EditMode;
  setEditMode: (m: EditMode) => void;
  mf: PuzzleData;
  updateMf: (key: keyof PuzzleData, val: unknown) => void;
  pagePassword: string;
  setPagePassword: (v: string) => void;
  onSave: () => void;
  saving: boolean;
}

const BORDER = "1px solid rgba(199,193,235,0.9)";
const FIELD_BG = "rgba(238,242,255,0.45)";
const TAP = 44; // the floor for anything a thumb has to hit

const INPUT_STYLE: React.CSSProperties = {
  minHeight: TAP,
  background: FIELD_BG,
  border: BORDER,
  borderRadius: 12,
  color: INK,
  fontFamily: OUTFIT,
  fontSize: 14,
  padding: "10px 14px",
  outline: "none",
  width: "100%",
};

/* ── small shared bits ─────────────────────────────────────────────────────── */

/** A textarea that grows with what's written on it. */
function useAutosize(value: string, min = 56) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(el.scrollHeight, min)}px`;
  }, [value, min]);
  return ref;
}

/**
 * The mobile keyboard covers the bottom half of the sheet. Nudging the focused
 * field into the middle of what's left is the difference between "typing in a
 * form" and "typing at a field you can't see".
 */
function useKeepVisible() {
  const reduced = useReducedMotion();
  return useCallback(
    (ev: React.FocusEvent<HTMLElement>) => {
      const el = ev.currentTarget;
      window.setTimeout(() => {
        el.scrollIntoView({ block: "center", behavior: reduced ? "auto" : "smooth" });
      }, 260);
    },
    [reduced],
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-1.5" style={{ color: INK_SOFT, fontSize: 11.5, lineHeight: 1.5 }}>
      <Info size={12} className="shrink-0 mt-0.5" style={{ color: INDIGO_SOFT }} />
      <span>{children}</span>
    </p>
  );
}

function Label({ children, optional }: { children: React.ReactNode; optional?: boolean }) {
  return (
    <label className="block mb-1.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: INK_SOFT }}>
      {children}
      {optional && <span className="normal-case tracking-normal font-normal opacity-70"> · optional</span>}
    </label>
  );
}

/** ± control. Both halves are full-height so a thumb cannot miss. */
function Stepper({
  label, value, display, onDec, onInc, decDisabled, incDisabled,
}: {
  label: string;
  value: number;
  display?: string;
  onDec: () => void;
  onInc: () => void;
  decDisabled?: boolean;
  incDisabled?: boolean;
}) {
  const btn: React.CSSProperties = {
    width: TAP, height: TAP, display: "grid", placeItems: "center",
    color: INDIGO, background: "transparent", border: "none",
  };
  return (
    <div className="flex-1">
      <Label>{label}</Label>
      <div className="flex items-center justify-between" style={{ background: FIELD_BG, border: BORDER, borderRadius: 12 }}>
        <button type="button" onClick={onDec} disabled={decDisabled} aria-label={`Fewer ${label}`} style={{ ...btn, opacity: decDisabled ? 0.3 : 1 }}>
          <Minus size={16} />
        </button>
        <span className="tabular-nums font-bold" style={{ color: INK, fontSize: 16 }}>{display ?? value}</span>
        <button type="button" onClick={onInc} disabled={incDisabled} aria-label={`More ${label}`} style={{ ...btn, opacity: incDisabled ? 0.3 : 1 }}>
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}

const looksLikeUrl = (u: string) => /^https?:\/\/\S+\.\S+/i.test(u.trim()) || u.trim().startsWith("data:image");

/** Live thumbnail. A half-typed URL must never clear the field, so the broken
 *  state remembers the URL that failed rather than being a boolean. */
function Thumb({ url, w = 76, h = 76 }: { url: string; w?: number; h?: number }) {
  const [brokenUrl, setBrokenUrl] = useState("");
  const usable = url.trim().length > 0 && url !== brokenUrl && looksLikeUrl(url);
  return (
    <div
      className="shrink-0 grid place-items-center overflow-hidden"
      style={{ width: w, height: h, borderRadius: 12, background: "#EEF2FF", border: BORDER, color: INDIGO_SOFT }}
    >
      {usable ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="w-full h-full object-cover" onError={() => setBrokenUrl(url)} />
      ) : (
        <ImageIcon size={22} aria-hidden />
      )}
    </div>
  );
}

/* ── melody ────────────────────────────────────────────────────────────────── */

const NOTE_NAMES = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
const noteName = (s: number) => `${NOTE_NAMES[((s % 12) + 12) % 12]}${4 + Math.floor(s / 12)}`;

/** Nobody should have to think in semitones to send a gift. */
const MELODY_PRESETS: { id: string; label: string; blurb: string; melody: number[] }[] = [
  { id: "rising",  label: "Rising",       blurb: "climbs as she goes",     melody: [0, 2, 4, 5, 7, 9, 11, 12, 11, 9, 7, 12] },
  { id: "lullaby", label: "Lullaby",      blurb: "slow and low",           melody: [7, 7, 9, 7, 12, 11, 7, 7, 9, 7, 14, 12] },
  { id: "playful", label: "Playful",      blurb: "bouncy, a bit cheeky",   melody: [0, 4, 7, 4, 9, 7, 12, 7, 9, 4, 7, 0] },
  { id: "demo",    label: "The demo one", blurb: "what you just heard",    melody: [0, 2, 4, 7, 9, 12, 11, 7, 9, 12, 14, 12] },
];

const sameMelody = (a: number[], b: number[]) => a.length === b.length && a.every((v, i) => v === b[i]);

/* ── letter ────────────────────────────────────────────────────────────────── */

function LineRow({
  value, index, total, onChange, onRemove, onMove, onFocusField,
}: {
  value: string;
  index: number;
  total: number;
  onChange: (v: string) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
  onFocusField: (ev: React.FocusEvent<HTMLElement>) => void;
}) {
  const ref = useAutosize(value);
  const iconBtn: React.CSSProperties = {
    width: TAP, height: TAP, display: "grid", placeItems: "center",
    background: "transparent", border: "none", color: INK_SOFT,
  };
  return (
    <div style={{ background: PAPER, border: `1px solid ${PAPER_EDGE}`, borderRadius: 14 }}>
      <div className="flex items-start gap-2 pl-3 pt-2">
        <span
          className="shrink-0 tabular-nums font-bold mt-1"
          style={{ color: INDIGO_SOFT, fontSize: 11, minWidth: 18 }}
        >
          {index + 1}
        </span>
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocusField}
          rows={2}
          placeholder="the line this piece hands over…"
          aria-label={`Letter line ${index + 1}`}
          className="flex-1 min-w-0 resize-none bg-transparent outline-none block"
          style={{
            fontFamily: SERIF, fontSize: 15, lineHeight: "24px", color: INK,
            padding: "0 12px 4px 0", minHeight: 56,
          }}
        />
      </div>
      <div className="flex items-center justify-between pl-3 pr-1" style={{ borderTop: `1px solid ${PAPER_EDGE}` }}>
        <span className="tabular-nums" style={{ color: value.length > 110 ? ROSE : INK_SOFT, fontSize: 10.5 }}>
          {value.length} characters{value.length > 110 ? " · long lines wrap on a phone" : ""}
        </span>
        <div className="flex items-center">
          <button type="button" onClick={() => onMove(-1)} disabled={index === 0} aria-label="Move line up" style={{ ...iconBtn, opacity: index === 0 ? 0.25 : 1 }}>
            <ChevronUp size={16} />
          </button>
          <button type="button" onClick={() => onMove(1)} disabled={index === total - 1} aria-label="Move line down" style={{ ...iconBtn, opacity: index === total - 1 ? 0.25 : 1 }}>
            <ChevronDown size={16} />
          </button>
          <button type="button" onClick={onRemove} disabled={total <= 1} aria-label="Remove line" style={{ ...iconBtn, color: ROSE, opacity: total <= 1 ? 0.25 : 1 }}>
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

/** How the letter will actually land against the pieces. */
function pacingCopy(lineCount: number, pieceCount: number): string {
  if (lineCount === 0) return `No lines yet — ${pieceCount} pieces with nothing to hand over.`;
  if (lineCount === pieceCount) return `${lineCount} lines across ${pieceCount} pieces — one per piece.`;
  if (lineCount < pieceCount) {
    const every = (pieceCount / lineCount).toFixed(1).replace(/\.0$/, "");
    return `${lineCount} lines across ${pieceCount} pieces — spread out, roughly one every ${every} pieces.`;
  }
  return `${lineCount} lines across ${pieceCount} pieces — some pieces hand over more than one.`;
}

/* ── the sheet ─────────────────────────────────────────────────────────────── */

export default memo(function EditSheet({
  editMode, setEditMode, mf, updateMf, pagePassword, setPagePassword, onSave, saving,
}: EditSheetProps) {
  const visible = editMode === "manual";
  const [tab, setTab] = useState<string>(config.tabs[0].id);
  const keepVisible = useKeepVisible();
  const bodyRef = useRef<HTMLDivElement>(null);
  const closingRef = useAutosize(mf.closingLine);
  const finalMsgRef = useAutosize(mf.finalPieceMessage);

  const grid = normaliseGrid(mf.cols, mf.rows);
  const pieces = grid.cols * grid.rows;
  const written = mf.lines.filter((l) => l.trim()).length;
  const ready = mf.senderName.trim().length > 0 && mf.recipientName.trim().length > 0 && written >= 2;

  // Switching tabs should hand you the top of the new tab, not the middle of it.
  const goTab = useCallback((id: string) => {
    setTab(id);
    bodyRef.current?.scrollTo({ top: 0 });
  }, []);

  const setGrid = useCallback((c: number, r: number) => {
    const n = normaliseGrid(c, r);
    updateMf("cols", n.cols);
    updateMf("rows", n.rows);
  }, [updateMf]);

  const setLine = useCallback((i: number, v: string) => {
    updateMf("lines", mf.lines.map((l, idx) => (idx === i ? v : l)));
  }, [mf.lines, updateMf]);

  const addLine = useCallback(() => {
    if (mf.lines.length >= GRID.maxPieces) return;
    updateMf("lines", [...mf.lines, ""]);
  }, [mf.lines, updateMf]);

  const removeLine = useCallback((i: number) => {
    if (mf.lines.length <= 1) return;
    updateMf("lines", mf.lines.filter((_, idx) => idx !== i));
  }, [mf.lines, updateMf]);

  const moveLine = useCallback((i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= mf.lines.length) return;
    const next = [...mf.lines];
    [next[i], next[j]] = [next[j], next[i]];
    updateMf("lines", next);
  }, [mf.lines, updateMf]);

  const setNote = useCallback((i: number, delta: number) => {
    updateMf("melody", mf.melody.map((n, idx) => (idx === i ? Math.max(-24, Math.min(24, n + delta)) : n)));
  }, [mf.melody, updateMf]);

  /** `playMelody` is AGENT 5's voice. Wired now; if it is still a stub this is
   *  a silent no-op rather than an error, and starts working the moment it lands. */
  const previewMelody = useCallback(() => {
    try { unlockAudio(); } catch {}
    try { playMelody(mf.melody); } catch {}
  }, [mf.melody]);

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setEditMode("preview")}
            className="fixed inset-0 z-[60]"
            style={{ background: "rgba(30,27,51,.55)" }}
          />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="fixed bottom-0 left-0 right-0 z-[60] lg:flex lg:items-center lg:justify-center lg:inset-0"
          >
            <div
              className="w-full max-w-2xl mx-auto flex flex-col shadow-2xl"
              style={{
                maxHeight: "88dvh",
                background: "#fff",
                borderTopLeftRadius: 28, borderTopRightRadius: 28,
                fontFamily: OUTFIT,
              }}
            >
              {/* ── sticky header: grabber, title, tabs ── */}
              <div className="shrink-0" style={{ borderBottom: BORDER }}>
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1 rounded-full" style={{ background: PAPER_EDGE }} />
                </div>
                <div className="flex items-center justify-between px-4 pb-1">
                  <h3 className="text-base font-bold" style={{ color: INK }}>
                    🧩 Build the puzzle
                  </h3>
                  <button
                    onClick={() => setEditMode("preview")}
                    aria-label="Close"
                    style={{ width: TAP, height: TAP, display: "grid", placeItems: "center", color: INK_SOFT }}
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="flex gap-1 px-3 pb-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                  {config.tabs.map((t) => {
                    const Icon = t.icon;
                    const on = tab === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => goTab(t.id)}
                        aria-current={on}
                        className="shrink-0 inline-flex items-center gap-1.5 px-3 rounded-full text-xs font-semibold transition-colors"
                        style={{
                          minHeight: TAP - 6,
                          color: on ? "#fff" : INK_SOFT,
                          background: on ? GRAD : "rgba(238,242,255,0.7)",
                        }}
                      >
                        <Icon size={14} /> {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── scrollable body ── */}
              <div ref={bodyRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-5" style={{ WebkitOverflowScrolling: "touch" }}>

                {/* ── PHOTO ─────────────────────────────────────────────── */}
                {tab === "photo" && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Your name *</Label>
                        <input
                          value={mf.senderName}
                          onChange={(e) => updateMf("senderName", e.target.value)}
                          onFocus={keepVisible}
                          placeholder="e.g. Rohan"
                          style={INPUT_STYLE}
                        />
                      </div>
                      <div>
                        <Label>Their name *</Label>
                        <input
                          value={mf.recipientName}
                          onChange={(e) => updateMf("recipientName", e.target.value)}
                          onFocus={keepVisible}
                          placeholder="e.g. Ananya"
                          style={INPUT_STYLE}
                        />
                      </div>
                    </div>

                    <div>
                      <Label optional>The photo they&rsquo;ll assemble</Label>
                      <div className="flex items-start gap-3">
                        <Thumb url={mf.imageUrl} />
                        <div className="flex-1 min-w-0 space-y-2">
                          <input
                            value={mf.imageUrl}
                            onChange={(e) => updateMf("imageUrl", e.target.value.trim())}
                            onFocus={keepVisible}
                            placeholder="https://…"
                            inputMode="url"
                            aria-label="Photo link"
                            style={INPUT_STYLE}
                          />
                          {mf.imageUrl.trim() && !looksLikeUrl(mf.imageUrl) && (
                            <p style={{ color: ROSE, fontSize: 11 }}>
                              That doesn&rsquo;t look like a link yet — it should start with https://
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mt-2">
                        <Note>
                          {mf.imageUrl.trim()
                            ? "Any photo of the two of you works. It gets centre-cropped, never squashed."
                            : "Leave this blank and the puzzle uses our own artwork — a soft indigo-and-rose piece made for this. It is not a broken page and it is not a grey box; the puzzle is fully playable without a photo."}
                        </Note>
                      </div>
                    </div>

                    <div>
                      <Label>How many pieces</Label>
                      <div className="flex items-end gap-3">
                        <Stepper
                          label="across"
                          value={grid.cols}
                          onDec={() => setGrid(grid.cols - 1, grid.rows)}
                          onInc={() => setGrid(grid.cols + 1, grid.rows)}
                          decDisabled={grid.cols <= GRID.minCols}
                          incDisabled={(grid.cols + 1) * grid.rows > GRID.maxPieces}
                        />
                        <Stepper
                          label="down"
                          value={grid.rows}
                          onDec={() => setGrid(grid.cols, grid.rows - 1)}
                          onInc={() => setGrid(grid.cols, grid.rows + 1)}
                          decDisabled={grid.rows <= GRID.minRows}
                          incDisabled={grid.cols * (grid.rows + 1) > GRID.maxPieces}
                        />
                      </div>
                      <p className="mt-2 font-bold" style={{ color: INDIGO, fontSize: 15 }}>
                        {pieces} pieces
                      </p>
                      <div className="mt-1">
                        <Note>
                          {pieces >= GRID.maxPieces
                            ? `${GRID.maxPieces} is the most this puzzle goes to. Past that, on a phone, it stops being a gift and starts being a chore.`
                            : "Twelve is the sweet spot — big enough to feel like a puzzle, short enough to finish in one sitting."}
                        </Note>
                      </div>
                    </div>
                  </>
                )}

                {/* ── LETTER ────────────────────────────────────────────── */}
                {tab === "letter" && (
                  <>
                    <Note>
                      Each piece she places hands over the next line. Write it the way you&rsquo;d say it —
                      short lines land better than paragraphs.
                    </Note>

                    <div
                      className="flex items-center justify-between px-3 py-2"
                      style={{ background: "rgba(238,242,255,0.6)", borderRadius: 12 }}
                    >
                      <span className="font-semibold" style={{ color: INDIGO, fontSize: 12 }}>
                        {pacingCopy(written, pieces)}
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {mf.lines.map((line, i) => (
                        <LineRow
                          key={i}
                          value={line}
                          index={i}
                          total={mf.lines.length}
                          onChange={(v) => setLine(i, v)}
                          onRemove={() => removeLine(i)}
                          onMove={(d) => moveLine(i, d)}
                          onFocusField={keepVisible}
                        />
                      ))}
                    </div>

                    {mf.lines.length < GRID.maxPieces ? (
                      <button
                        type="button"
                        onClick={addLine}
                        className="w-full inline-flex items-center justify-center gap-1.5 font-semibold"
                        style={{
                          minHeight: TAP, borderRadius: 14, color: INDIGO,
                          border: `1px dashed ${INDIGO_SOFT}`, background: "rgba(238,242,255,0.4)", fontSize: 13,
                        }}
                      >
                        <Plus size={15} /> Add a line
                      </button>
                    ) : (
                      <p className="text-center" style={{ color: INK_SOFT, fontSize: 11.5 }}>
                        {GRID.maxPieces} lines is the most a puzzle carries.
                      </p>
                    )}

                    {written < 2 && (
                      <p className="text-center" style={{ color: INK_SOFT, fontSize: 11.5 }}>
                        {2 - written === 1 ? "One more line" : "Two lines"} and it&rsquo;s a letter.
                      </p>
                    )}
                  </>
                )}

                {/* ── MELODY ────────────────────────────────────────────── */}
                {tab === "melody" && (
                  <>
                    <Note>
                      Every piece plays the next note. By the last one she has heard the whole phrase.
                      Pick one — you never have to think about it again.
                    </Note>

                    <div className="grid grid-cols-2 gap-2">
                      {MELODY_PRESETS.map((p) => {
                        const on = sameMelody(mf.melody, p.melody);
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => updateMf("melody", [...p.melody])}
                            className="text-left px-3 py-2.5 transition-colors"
                            style={{
                              minHeight: TAP + 12,
                              borderRadius: 14,
                              border: `1.5px solid ${on ? INDIGO : "rgba(199,193,235,0.9)"}`,
                              background: on ? "rgba(99,102,241,0.09)" : "transparent",
                            }}
                          >
                            <span className="flex items-center gap-1.5 font-bold" style={{ color: on ? INDIGO : INK, fontSize: 13.5 }}>
                              {on && <Check size={13} />} {p.label}
                            </span>
                            <span className="block mt-0.5" style={{ color: INK_SOFT, fontSize: 11 }}>{p.blurb}</span>
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={previewMelody}
                      className="w-full inline-flex items-center justify-center gap-2 font-semibold text-white"
                      style={{ minHeight: TAP, borderRadius: 14, background: GRAD, fontSize: 13.5 }}
                    >
                      <Play size={15} /> Hear it
                    </button>

                    <details>
                      <summary
                        className="cursor-pointer select-none font-semibold"
                        style={{ color: INK_SOFT, fontSize: 12, minHeight: 32, lineHeight: "32px" }}
                      >
                        Tweak the notes yourself
                      </summary>
                      <div className="mt-2 space-y-2">
                        <Note>Each note is one step of the phrase. Nudge any of them; nothing can break here.</Note>
                        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                          {mf.melody.map((n, i) => (
                            <div
                              key={i}
                              className="shrink-0 flex flex-col items-center"
                              style={{ background: FIELD_BG, border: BORDER, borderRadius: 12, width: 52 }}
                            >
                              <button
                                type="button"
                                onClick={() => setNote(i, 1)}
                                disabled={n >= 24}
                                aria-label={`Raise note ${i + 1}`}
                                style={{ width: 52, height: TAP, display: "grid", placeItems: "center", color: INDIGO, opacity: n >= 24 ? 0.3 : 1 }}
                              >
                                <ChevronUp size={15} />
                              </button>
                              <span className="tabular-nums font-bold" style={{ color: INK, fontSize: 12 }}>{noteName(n)}</span>
                              <button
                                type="button"
                                onClick={() => setNote(i, -1)}
                                disabled={n <= -24}
                                aria-label={`Lower note ${i + 1}`}
                                style={{ width: 52, height: TAP, display: "grid", placeItems: "center", color: INDIGO, opacity: n <= -24 ? 0.3 : 1 }}
                              >
                                <ChevronDown size={15} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </details>
                  </>
                )}

                {/* ── FINAL PIECE ───────────────────────────────────────── */}
                {tab === "final" && (
                  <>
                    <div className="space-y-2">
                      {([
                        {
                          mode: "sender-release" as FinalPieceMode,
                          title: "I'll release the last piece myself",
                          blurb: "She gets to eleven of twelve and stops. The hole sits in the middle of the photo and waits until you release it from your phone — so you're both there for the last piece.",
                        },
                        {
                          mode: "auto" as FinalPieceMode,
                          title: "Just let them finish it",
                          blurb: "The last piece is in the box like any other. She finishes whenever she likes, with nobody waiting on you.",
                        },
                      ]).map((opt) => {
                        const on = mf.finalPieceMode === opt.mode;
                        return (
                          <button
                            key={opt.mode}
                            type="button"
                            onClick={() => updateMf("finalPieceMode", opt.mode)}
                            className="w-full text-left px-3.5 py-3 transition-colors"
                            style={{
                              borderRadius: 16,
                              border: `1.5px solid ${on ? INDIGO : "rgba(199,193,235,0.9)"}`,
                              background: on ? "rgba(99,102,241,0.08)" : "transparent",
                            }}
                          >
                            <span className="flex items-center gap-1.5 font-bold" style={{ color: on ? INDIGO : INK, fontSize: 14 }}>
                              {on && <Check size={14} />} {opt.title}
                            </span>
                            <span className="block mt-1" style={{ color: INK_SOFT, fontSize: 11.5, lineHeight: 1.5 }}>
                              {opt.blurb}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {mf.finalPieceMode === "sender-release" && (
                      <div>
                        <Label>What she sees while she waits</Label>
                        <div style={{ background: PAPER, border: `1px solid ${PAPER_EDGE}`, borderRadius: 14, padding: "8px 12px" }}>
                          <textarea
                            ref={finalMsgRef}
                            value={mf.finalPieceMessage}
                            onChange={(e) => updateMf("finalPieceMessage", e.target.value)}
                            onFocus={keepVisible}
                            rows={2}
                            placeholder="I have the last piece. Ask me for it."
                            aria-label="Final piece message"
                            className="w-full resize-none bg-transparent outline-none block"
                            style={{ fontFamily: SERIF, fontSize: 15, lineHeight: "24px", color: INK, minHeight: 56 }}
                          />
                        </div>
                        <div className="mt-1.5">
                          <Note>
                            Leave it blank and she gets “I have the last piece. Ask me for it.” — which is already
                            the right thing to say. If she&rsquo;s still waiting after ten minutes she can finish it
                            herself, so nobody is ever left holding an unfinished gift.
                          </Note>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* ── REVEAL ────────────────────────────────────────────── */}
                {tab === "reveal" && (
                  <>
                    <Note>
                      She assembles one photo. The moment the last piece lands, the seams fade and the finished
                      picture cross-dissolves into this second one. Leave it blank to skip the dissolve.
                    </Note>

                    <div>
                      <Label optional>The photo it turns into</Label>
                      <div className="flex items-start gap-3">
                        <Thumb url={mf.revealImageUrl} />
                        <div className="flex-1 min-w-0 space-y-2">
                          <input
                            value={mf.revealImageUrl}
                            onChange={(e) => updateMf("revealImageUrl", e.target.value.trim())}
                            onFocus={keepVisible}
                            placeholder="https://…"
                            inputMode="url"
                            aria-label="Reveal photo link"
                            style={INPUT_STYLE}
                          />
                          {mf.revealImageUrl.trim() && !looksLikeUrl(mf.revealImageUrl) && (
                            <p style={{ color: ROSE, fontSize: 11 }}>
                              That doesn&rsquo;t look like a link yet — it should start with https://
                            </p>
                          )}
                          {mf.revealImageUrl.trim() && (
                            <button
                              type="button"
                              onClick={() => updateMf("revealImageUrl", "")}
                              style={{ color: INK_SOFT, fontSize: 11.5, minHeight: 32 }}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>The last thing she reads</Label>
                      <div style={{ background: PAPER, border: `1px solid ${PAPER_EDGE}`, borderRadius: 14, padding: "8px 12px" }}>
                        <textarea
                          ref={closingRef}
                          value={mf.closingLine}
                          onChange={(e) => updateMf("closingLine", e.target.value)}
                          onFocus={keepVisible}
                          rows={2}
                          placeholder="There. That's the whole thing."
                          aria-label="Closing line"
                          className="w-full resize-none bg-transparent outline-none block"
                          style={{ fontFamily: SERIF, fontSize: 15, lineHeight: "24px", color: INK, minHeight: 56 }}
                        />
                      </div>
                      <div className="mt-1.5">
                        <Note>Fades in under the finished photo, after everything else has settled.</Note>
                      </div>
                    </div>
                  </>
                )}

                {/* ── password: same on every tab ── */}
                <div className="pt-1" style={{ borderTop: BORDER }}>
                  <div className="pt-4">
                    <Label optional>Password</Label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: INK_SOFT }} />
                      <input
                        value={pagePassword}
                        onChange={(e) => setPagePassword(e.target.value)}
                        onFocus={keepVisible}
                        placeholder="Leave empty for no password"
                        aria-label="Page password"
                        style={{ ...INPUT_STYLE, paddingLeft: 38 }}
                      />
                    </div>
                    <div className="mt-1.5">
                      <Note>If set, the shared link asks for this before the puzzle opens.</Note>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── sticky footer ── */}
              <div
                className="shrink-0 px-4 pt-3"
                style={{ borderTop: BORDER, paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))", background: "#fff" }}
              >
                <button
                  onClick={onSave}
                  disabled={saving || !ready}
                  className="w-full inline-flex items-center justify-center gap-2 font-bold text-white disabled:opacity-50"
                  style={{ minHeight: 50, borderRadius: 14, background: GRAD, fontSize: 14 }}
                >
                  {saving ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : <><Eye size={16} /> Save &amp; play it</>}
                </button>
                <p className="text-center mt-2" style={{ color: INK_SOFT, fontSize: 11 }}>
                  {ready
                    ? "Publish from the preview to get your shareable link"
                    : "Both names and two lines, and you're done"}
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

// `RADIUS` is part of the shared token set; referenced so the theme stays the
// single source of truth for the sheet's corner language.
void RADIUS;
