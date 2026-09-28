"use client";

// ─── Stock the machine — the form ────────────────────────────────────────────
//
// One scrolling sheet, read top to bottom as steps: pick the machine, name it,
// load the limited-edition memory cards (photos with a caption + a note on the
// back), rewrite the shelves, choose the questions it asks, pick the GIF
// stickers, and write the letter that prints at the foot of the receipt.
//
// A progress rail at the top jumps to each step and shows what is done. Save
// validates the two things the page cannot live without (both names), says
// exactly what is missing, scrolls to it and never silently no-ops.

import { memo, useCallback, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, Trash2, Plus, Lock, Loader2, Undo2, Wrench, Check, AlertCircle, Sparkles } from "lucide-react";

import { FormSection } from "../../_love/editor/LoveKitSections";
import PhotosEditor from "../../_love/editor/PhotosEditor";
import GifPicker from "../../_love/editor/GifPicker";
import { MAX_GIFS, MAX_LETTER_LEN, MAX_PHOTOS } from "../../_love/types";
import GifSticker from "./GifSticker";
import { VEND_THEMES, pickVendTheme, type VendTheme } from "./themes";
import {
  type VendingData,
  type EditMode,
  type Slot,
  type SlotKind,
  COLS,
  DEMO_DATA,
  MACHINE_GIFS,
  RESERVED_SLOT,
  ROWS,
  SHELF_LABEL_MAX,
  shelfLabel,
} from "./types";

/* ── SubhSandesh chrome tokens (this sheet is app UI, not the machine) ─────── */
const INDIGO = "#6C5CE7";
const PINK = "#F72585";
const LIME = "#C6FF3D";
const INK = "#0E0E12";
const MUTED = "#5B5B66";
const BORDER = "#ECEAE3";
const SURFACE_ALT = "#EFEDFD";
const AMBER = "#FFB020";
const ERROR = "#E5484D";

const STENCIL = "var(--font-oswald), system-ui, sans-serif";
const TYPED = "var(--font-courier-prime), ui-monospace, monospace";

const INPUT_CLS =
  "w-full px-3.5 py-2.5 rounded-xl bg-black/[.03] border border-[#ECEAE3] focus:outline-none focus:border-[#6C5CE7] transition-colors";
const INPUT_SM =
  "w-full px-3 py-2 rounded-lg bg-black/[.03] border border-[#ECEAE3] focus:outline-none focus:border-[#6C5CE7] transition-colors";

const KIND_META: Record<SlotKind, { label: string; glyph: string }> = {
  compliment: { label: "Compliment", glyph: "💬" },
  memory: { label: "Memory", glyph: "📼" },
  voucher: { label: "Voucher", glyph: "🎟️" },
  empty: { label: "Blank", glyph: "🕳️" },
};

const DEMO_BY_CODE = new Map(DEMO_DATA.slots.map((s) => [s.code, s]));
const MACHINE_GIF_URLS = new Set(MACHINE_GIFS.map((g) => g.url));

/** Has the sender actually put their own words in this slot? */
const isYours = (s: Slot): boolean => {
  const d = DEMO_BY_CODE.get(s.code);
  if (!d) return true;
  return s.label !== d.label || s.payload !== d.payload || s.kind !== d.kind;
};

const LETTER_STARTERS = [
  "The first time I saw you, ",
  "I've never told you this, but ",
  "My favourite thing about us is ",
  "No refunds. No returns. No expiry.",
];

interface Props {
  editMode: EditMode;
  setEditMode: (m: EditMode) => void;
  mf: VendingData;
  updateMf: (key: keyof VendingData, val: unknown) => void;
  pagePassword: string;
  setPagePassword: (v: string) => void;
  onSave: () => void;
  saving: boolean;
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ color: MUTED }}>
      {children}
    </span>
  );
}

/* ── The shelf-tag chip: a map of the machine, not a table row ─────────────── */
function SlotChip({
  slot, open, yours, onClick,
}: { slot: Slot; open: boolean; yours: boolean; onClick: () => void }) {
  const reserved = slot.code === RESERVED_SLOT;
  const tag = shelfLabel(slot.label);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      aria-label={`Slot ${slot.code}: ${slot.label}`}
      className="relative rounded-[3px] px-1 pt-1.5 pb-1 text-left transition-all active:scale-[0.96] overflow-hidden"
      style={{
        minHeight: 52,
        background: open ? INDIGO : reserved ? "#2a2a2e" : yours ? "#16191a" : "#16191a",
        opacity: open || yours || reserved ? 1 : 0.55,
        border: `1px solid ${open ? INDIGO : yours ? AMBER : "#2f3436"}`,
        boxShadow: open ? `0 0 0 2px ${INDIGO}33` : "inset 0 1px 0 rgba(255,255,255,.06)",
      }}
    >
      <span
        className="block text-[11px] leading-none"
        style={{ fontFamily: STENCIL, letterSpacing: ".1em", color: open ? "#fff" : slot.soldOut ? "#d9534f" : "#ffa500" }}
      >
        {slot.code}
      </span>
      <span
        className="block mt-1 text-[7.5px] leading-[1.25] break-words"
        style={{ color: open ? "rgba(255,255,255,.85)" : "#9aa3a3", maxHeight: 20, overflow: "hidden" }}
      >
        {reserved ? "RESERVED" : tag || "—"}
      </span>

      {/* corner markers */}
      {reserved && <Lock size={9} className="absolute top-1 right-1" style={{ color: "#9aa3a3" }} />}
      {!reserved && slot.sticks && <Wrench size={9} className="absolute top-1 right-1" style={{ color: PINK }} />}
      {!reserved && !slot.sticks && yours && (
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: AMBER }} />
      )}
      {slot.soldOut && !reserved && (
        <span className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ background: "#d9534f" }} />
      )}
    </button>
  );
}

/* ── One slot's editor. Only ever one of these is mounted. ─────────────────── */
function SlotEditor({
  slot, onPatch, onMakeJam, onReset,
}: {
  slot: Slot;
  onPatch: (patch: Partial<Slot>) => void;
  onMakeJam: () => void;
  onReset: () => void;
}) {
  const reserved = slot.code === RESERVED_SLOT;
  const over = slot.label.length > SHELF_LABEL_MAX;
  const demo = DEMO_BY_CODE.get(slot.code);

  return (
    <div className="rounded-2xl p-3.5 space-y-3.5" style={{ background: "#fff", border: `1px solid ${BORDER}` }}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="px-2 py-1 rounded-[2px] text-[12px]"
            style={{ background: "#16191a", color: "#ffa500", fontFamily: STENCIL, letterSpacing: ".12em" }}
          >
            {slot.code}
          </span>
          {reserved && (
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: MUTED }}>
              Reserved — never vends
            </span>
          )}
        </div>
        {demo && !reserved && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1.5 rounded-lg"
            style={{ color: MUTED, border: `1px solid ${BORDER}` }}
          >
            <Undo2 size={11} /> Use ours
          </button>
        )}
      </div>

      {reserved && (
        <p className="text-[11.5px] leading-relaxed" style={{ color: MUTED }}>
          A1 is yours and stays yours. It is permanently sold out and can never jam — punching it just
          tells them <em>“that one&apos;s mine.”</em> You can still change what it says, even though nobody will see it.
        </p>
      )}

      {/* Kind */}
      <div>
        <Label>What kind of thing is it</Label>
        <div className="grid grid-cols-4 gap-1.5">
          {(Object.keys(KIND_META) as SlotKind[]).map((k) => {
            const on = slot.kind === k;
            return (
              <button
                key={k}
                type="button"
                onClick={() => onPatch({ kind: k })}
                className="py-2 rounded-lg text-[10.5px] font-semibold transition-colors"
                style={{
                  minHeight: 44,
                  background: on ? SURFACE_ALT : "#fff",
                  border: `1.5px solid ${on ? INDIGO : BORDER}`,
                  color: on ? INDIGO : MUTED,
                }}
              >
                <span className="block text-[13px] leading-none mb-1">{KIND_META[k].glyph}</span>
                {KIND_META[k].label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Shelf label + live tag preview */}
      <div>
        <Label>Shelf tag — what they read through the glass</Label>
        <input
          value={slot.label}
          onChange={(e) => onPatch({ label: e.target.value })}
          placeholder="e.g. your terrible laugh"
          className={INPUT_SM}
        />
        <div className="flex items-center justify-between gap-2 mt-1.5">
          <span
            className="inline-flex items-center px-1.5 py-1 rounded-[2px] text-[9px] shrink min-w-0"
            style={{ background: "#16191a", color: "#e8e8e8", fontFamily: STENCIL, letterSpacing: ".06em" }}
          >
            <span className="truncate">{shelfLabel(slot.label) || "—"}</span>
          </span>
          <span className="text-[10px] font-semibold shrink-0" style={{ color: over ? AMBER : MUTED }}>
            {slot.label.length}/{SHELF_LABEL_MAX}
          </span>
        </div>
        {over && (
          <p className="text-[10.5px] mt-1" style={{ color: AMBER }}>
            Too long for the shelf — it&apos;ll show cut off up there. The coupon still gets every word.
          </p>
        )}
      </div>

      {/* Payload */}
      <div>
        <Label>The coupon — what actually drops</Label>
        <textarea
          value={slot.payload}
          onChange={(e) => onPatch({ payload: e.target.value })}
          rows={3}
          placeholder="Say the whole thing. This is the bit they keep."
          className={INPUT_SM + " resize-none leading-relaxed"}
        />
        <p className="text-[10px] mt-1" style={{ color: MUTED }}>{slot.payload.length} characters</p>
      </div>

      {/* Price + sold out */}
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <Label>Costs</Label>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onPatch({ price: Math.max(0, slot.price - 1) })}
              className="w-11 h-11 rounded-lg grid place-items-center text-lg font-bold"
              style={{ border: `1px solid ${BORDER}`, color: MUTED }}
              aria-label="Cheaper"
            >−</button>
            <span
              className="flex-1 text-center text-sm font-bold py-2.5 rounded-lg"
              style={{ fontFamily: TYPED, background: "#0b0f0b", color: "#4ade80", letterSpacing: ".06em" }}
            >₹{slot.price}</span>
            <button
              type="button"
              onClick={() => onPatch({ price: Math.min(9, slot.price + 1) })}
              className="w-11 h-11 rounded-lg grid place-items-center text-lg font-bold"
              style={{ border: `1px solid ${BORDER}`, color: MUTED }}
              aria-label="Pricier"
            >+</button>
          </div>
        </div>
        <div>
          <Label>Already gone</Label>
          <button
            type="button"
            disabled={reserved}
            onClick={() => onPatch({ soldOut: !slot.soldOut })}
            className="w-full rounded-lg text-[11.5px] font-semibold disabled:opacity-60"
            style={{
              minHeight: 44,
              background: slot.soldOut ? "#fdecec" : "#fff",
              border: `1.5px solid ${slot.soldOut ? "#d9534f" : BORDER}`,
              color: slot.soldOut ? "#d9534f" : MUTED,
            }}
          >
            {reserved ? "SOLD OUT · locked" : slot.soldOut ? "SOLD OUT" : "In stock"}
          </button>
        </div>
      </div>

      {/* The jam — single choice, lives here but is owned by one field */}
      {!reserved && (
        <button
          type="button"
          onClick={onMakeJam}
          disabled={slot.sticks}
          className="w-full rounded-xl px-3 py-3 text-left transition-colors disabled:cursor-default"
          style={{
            background: slot.sticks ? "#fff0f7" : "#fff",
            border: `1.5px solid ${slot.sticks ? PINK : BORDER}`,
          }}
        >
          <span className="flex items-center gap-2">
            <span
              className="w-5 h-5 rounded-full grid place-items-center shrink-0"
              style={{ border: `2px solid ${slot.sticks ? PINK : "#c9c9d1"}` }}
            >
              {slot.sticks && <span className="w-2.5 h-2.5 rounded-full" style={{ background: PINK }} />}
            </span>
            <span className="text-[12.5px] font-bold" style={{ color: slot.sticks ? PINK : INK }}>
              {slot.sticks ? "This is the one that jams" : "Make this the one that jams"}
            </span>
          </span>
          <span className="block mt-1 pl-7 text-[11px] leading-relaxed" style={{ color: MUTED }}>
            It hangs off the coil and they have to shake the machine for it. Only one slot can do this —
            picking this one lets the last one go.
          </span>
        </button>
      )}
    </div>
  );
}

/* ── Compact string-list editor for the prompts and the sign ──────────────── */
function LineList({
  values, onChange, placeholder, addLabel, prefix, uppercase, max,
}: {
  values: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
  addLabel: string;
  prefix?: string;
  uppercase?: boolean;
  max: number;
}) {
  return (
    <div className="space-y-2">
      {values.map((v, i) => (
        <div key={i} className="flex items-center gap-2">
          {prefix && (
            <span className="text-[13px] shrink-0" style={{ fontFamily: TYPED, color: INDIGO }}>{prefix}</span>
          )}
          <input
            value={v}
            onChange={(e) => onChange(values.map((x, idx) => (idx === i ? e.target.value : x)))}
            placeholder={placeholder}
            maxLength={max}
            className={INPUT_SM + " flex-1"}
            style={uppercase ? { textTransform: "uppercase", fontFamily: STENCIL, letterSpacing: ".05em" } : undefined}
          />
          <button
            type="button"
            onClick={() => onChange(values.filter((_, idx) => idx !== i))}
            disabled={values.length <= 1}
            aria-label="Remove line"
            className="w-11 h-11 rounded-lg grid place-items-center shrink-0 disabled:opacity-30"
            style={{ border: `1px solid ${BORDER}`, color: MUTED }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...values, ""])}
        className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold py-1.5"
        style={{ color: INDIGO }}
      >
        <Plus size={14} /> {addLabel}
      </button>
    </div>
  );
}

/* ── The machine picker: each theme as a tiny machine in its own skin ──────── */
function MachineSwatch({ t }: { t: VendTheme }) {
  const m = t.machine;
  return (
    <span className="block relative h-[104px] overflow-hidden" style={{ background: t.colors.bg }} aria-hidden>
      <span
        className="absolute left-1/2 top-3 -translate-x-1/2 w-[70px] h-[112px] rounded-[10px] p-[5px]"
        style={{ background: `linear-gradient(90deg, ${m.bodyDark}, ${m.body} 20%, ${m.bodyLight} 48%, ${m.body} 72%, ${m.bodyDark})`, boxShadow: "0 10px 20px -8px rgba(0,0,0,.45)" }}
      >
        <span className="block h-[9px] rounded-[3px] mb-[4px] px-1 text-[6px] leading-[9px] font-bold tracking-[.12em]" style={{ background: m.plateHi, color: m.sign, textShadow: `0 0 4px ${m.signGlow}` }}>
          ♥ ♥ ♥
        </span>
        <span className="grid grid-cols-3 gap-[3px] p-[4px] rounded-[4px]" style={{ background: m.glass }}>
          {Array.from({ length: 9 }).map((_, i) => (
            <span key={i} className="block h-[9px] rounded-[2px]" style={{ background: i % 4 === 0 ? t.colors.a1 : i % 3 === 0 ? t.colors.a3 : "#efe9dc" }} />
          ))}
        </span>
        <span className="block h-[6px] mt-[4px] rounded-[2px]" style={{ background: "#050505", boxShadow: `inset 0 0 0 1px ${m.led}55` }}>
          <span className="block h-[2px] w-[60%] ml-[3px] mt-[2px] rounded-full" style={{ background: m.led, boxShadow: `0 0 4px ${m.led}` }} />
        </span>
        <span className="grid grid-cols-3 gap-[2px] mt-[4px]">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="block h-[6px] rounded-[2px]" style={{ background: i === 5 ? m.wornHi : m.keyHi }} />
          ))}
        </span>
      </span>
      <span className="absolute right-2 bottom-2 text-lg">{t.emoji}</span>
    </span>
  );
}

function MachinePicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const current = pickVendTheme(value).id;
  return (
    <div role="radiogroup" aria-label="Machine style" className="grid grid-cols-2 gap-2.5">
      {VEND_THEMES.map((t) => {
        const on = t.id === current;
        return (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(t.id)}
            className="relative rounded-2xl overflow-hidden text-left border-2 transition-transform active:scale-[.98]"
            style={{ borderColor: on ? INDIGO : BORDER, boxShadow: on ? `0 0 0 3px ${INDIGO}22` : undefined }}
          >
            <MachineSwatch t={t} />
            <span className="block px-2.5 py-2 bg-white">
              <span className="flex items-center justify-between gap-1">
                <span className="text-[13px] font-bold" style={{ color: INK }}>{t.name}</span>
                {on && (
                  <span className="w-5 h-5 rounded-full grid place-items-center text-white shrink-0" style={{ background: INDIGO }}>
                    <Check size={12} />
                  </span>
                )}
              </span>
              <span className="block text-[11px] leading-snug mt-0.5" style={{ color: MUTED }}>{t.vibe}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ── GIF stickers: the machine's own first, then the shared library ───────── */
function StickerPicker({ gifs, onChange }: { gifs: string[]; onChange: (next: string[]) => void }) {
  const full = gifs.length >= MAX_GIFS;
  const toggle = (url: string) => {
    if (gifs.includes(url)) onChange(gifs.filter((g) => g !== url));
    else if (!full) onChange([...gifs, url]);
  };
  // The shared picker only ever sees (and edits) the non-machine picks, so its
  // thumbnails never try to <img> a .webm.
  const others = gifs.filter((g) => !MACHINE_GIF_URLS.has(g));
  const mine = gifs.filter((g) => MACHINE_GIF_URLS.has(g));
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-bold" style={{ color: INK }}>From this machine</p>
        <span className="text-[11px] font-semibold tabular-nums px-2 py-0.5 rounded-full" style={{ background: full ? "#fff4e0" : SURFACE_ALT, color: full ? "#9a5b00" : INDIGO }}>
          {gifs.length}/{MAX_GIFS} picked
        </span>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {MACHINE_GIFS.map((g) => {
          const on = gifs.includes(g.url);
          return (
            <button
              key={g.url}
              type="button"
              onClick={() => toggle(g.url)}
              aria-pressed={on}
              aria-label={g.label}
              disabled={!on && full}
              className="relative rounded-xl overflow-hidden border-2 bg-white disabled:opacity-40"
              style={{ aspectRatio: "1 / 1", borderColor: on ? PINK : BORDER }}
            >
              <GifSticker url={g.url} size="100%" style={{ borderRadius: 0 }} />
              {on && (
                <span className="absolute top-1 right-1 w-5 h-5 rounded-full grid place-items-center text-white" style={{ background: PINK }}>
                  <Check size={12} />
                </span>
              )}
              <span className="absolute inset-x-0 bottom-0 text-[9px] font-semibold text-white py-0.5 truncate px-1" style={{ background: "rgba(0,0,0,.45)" }}>
                {g.label}
              </span>
            </button>
          );
        })}
      </div>
      <details className="rounded-xl border px-3 py-2.5" style={{ borderColor: BORDER }}>
        <summary className="text-[12.5px] font-bold cursor-pointer select-none" style={{ color: INK }}>
          More cute GIFs, or paste your own link
        </summary>
        <div className="pt-3">
          <GifPicker
            gifs={others}
            tags={["love", "hug", "funny"]}
            onChange={(next) => onChange([...mine, ...next].slice(0, MAX_GIFS))}
          />
        </div>
      </details>
    </div>
  );
}

/* ── The letter, typed straight onto receipt paper ─────────────────────────── */
function ReceiptLetter({ value, onChange, sender }: { value: string; onChange: (v: string) => void; sender: string }) {
  const left = MAX_LETTER_LEN - value.length;
  return (
    <div>
      <div
        className="relative mx-auto rounded-sm"
        style={{
          maxWidth: 420,
          background: "#fffdf6",
          boxShadow: "0 10px 24px -14px rgba(0,0,0,.35)",
          padding: "18px 16px 14px",
          fontFamily: TYPED,
          color: "#23201a",
        }}
      >
        <p className="text-center text-[11px] tracking-[.14em]">★ SECRET PRIZE UNLOCKED ★</p>
        <div className="my-2 border-t border-dashed" style={{ borderColor: "#23201a66" }} />
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, MAX_LETTER_LEN))}
          placeholder={"Write it like they're reading it at 2am…\n\nThis prints at the very bottom of their receipt, after every card and every slot."}
          aria-label="Your letter — printed on the receipt"
          rows={9}
          className="w-full bg-transparent resize-y focus:outline-none leading-relaxed"
          style={{ fontSize: 16, minHeight: 190, fontFamily: "var(--font-di-serif), Georgia, serif", fontStyle: "italic" }}
        />
        <div className="mt-1 border-t border-dashed pt-2 flex items-center justify-between text-[10.5px]" style={{ borderColor: "#23201a66" }}>
          <span>— {sender.trim() || "you"}</span>
          <span className="tabular-nums" style={{ color: left < 100 ? ERROR : "#23201a99" }}>
            {value.length}/{MAX_LETTER_LEN}
          </span>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="text-[11px] font-semibold mr-1 self-center" style={{ color: MUTED }}>Stuck? Start with:</span>
        {LETTER_STARTERS.map((line) => (
          <button
            key={line}
            type="button"
            onClick={() => onChange((value.trim() ? `${value.trimEnd()}\n\n` : "") + line)}
            className="text-[11.5px] font-semibold px-2.5 py-1.5 rounded-full border"
            style={{ borderColor: BORDER, color: INK, background: "#fff" }}
          >
            {line.length > 26 ? `${line.slice(0, 25)}…` : line}
          </button>
        ))}
      </div>
    </div>
  );
}

type SectionId = "vibe" | "names" | "cards" | "shelves" | "prompts" | "gifs" | "letter" | "extras";

/* ── The sheet ────────────────────────────────────────────────────────────── */
export default memo(function EditSheet({
  editMode, setEditMode, mf, updateMf, pagePassword, setPagePassword, onSave, saving,
}: Props) {
  const visible = editMode !== null && editMode !== "preview";
  const [openCode, setOpenCode] = useState<string | null>(null);
  const [tried, setTried] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const refs = useRef<Partial<Record<SectionId, HTMLElement | null>>>({});

  const byCode = useMemo(() => new Map(mf.slots.map((s) => [s.code, s])), [mf.slots]);
  const jam = useMemo(() => mf.slots.find((s) => s.sticks && s.code !== RESERVED_SLOT) ?? null, [mf.slots]);
  const yoursCount = useMemo(
    () => mf.slots.filter((s) => s.code !== RESERVED_SLOT && isYours(s)).length,
    [mf.slots],
  );

  const patchSlot = useCallback(
    (code: string, patch: Partial<Slot>) =>
      updateMf("slots", mf.slots.map((s) => (s.code === code ? { ...s, ...patch } : s))),
    [mf.slots, updateMf],
  );

  /**
   * The jam is ONE field, not eighteen checkboxes. Every write rebuilds the whole
   * list from a single winning code, so two stuck slots are unrepresentable.
   */
  const setJam = useCallback(
    (code: string) =>
      updateMf("slots", mf.slots.map((s) => ({ ...s, sticks: s.code !== RESERVED_SLOT && s.code === code }))),
    [mf.slots, updateMf],
  );

  const resetSlot = useCallback(
    (code: string) => {
      const d = DEMO_BY_CODE.get(code);
      if (!d) return;
      // Keep whoever currently jams — restocking one slot shouldn't move the jam.
      patchSlot(code, { kind: d.kind, label: d.label, payload: d.payload, price: d.price, soldOut: d.soldOut });
    },
    [patchSlot],
  );

  const openSlot = openCode ? byCode.get(openCode) ?? null : null;
  const signPreview = mf.displayIdleMessages.filter((m) => m.trim()).join("  ·  ");

  const missingSender = !mf.senderName.trim();
  const missingRecipient = !mf.recipientName.trim();
  const missing = [missingSender && "your name", missingRecipient && "their name"].filter(Boolean) as string[];
  const photoCount = mf.photos.length;
  const letterLen = mf.letter.trim().length;

  const jump = useCallback((id: SectionId) => {
    const el = refs.current[id];
    const box = scrollRef.current;
    if (!el || !box) return;
    const top = el.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop - 64;
    box.scrollTo({ top, behavior: "smooth" });
  }, []);

  const save = useCallback(() => {
    if (missing.length) {
      setTried(true);
      jump("names");
      return;
    }
    onSave();
  }, [missing.length, jump, onSave]);

  const steps: { id: SectionId; label: string; done: boolean; bad?: boolean; note?: string }[] = [
    { id: "vibe", label: "🎨 Machine", done: true },
    { id: "names", label: "🏷️ Names", done: missing.length === 0, bad: tried && missing.length > 0 },
    { id: "cards", label: "📸 Cards", done: photoCount > 0, note: `${photoCount}/${MAX_PHOTOS}` },
    { id: "shelves", label: "🎰 Shelves", done: yoursCount > 0, note: `${yoursCount}/17` },
    { id: "gifs", label: "🎞️ Stickers", done: mf.gifs.length > 0, note: `${mf.gifs.length}/${MAX_GIFS}` },
    { id: "letter", label: "🧾 Receipt", done: letterLen > 0 },
  ];

  const sec = (id: SectionId) => (el: HTMLElement | null) => {
    refs.current[id] = el;
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setEditMode("preview")}
            className="fixed inset-0 z-[60] bg-black/55"
          />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="fixed bottom-0 left-0 right-0 z-[60] pointer-events-none lg:flex lg:items-center lg:justify-center lg:inset-0"
          >
            <div
              ref={scrollRef}
              className="pointer-events-auto w-full max-w-2xl max-h-[88vh] lg:max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-t-3xl lg:rounded-3xl shadow-2xl mx-auto"
              style={{ background: "#FAFAF7", color: INK, overscrollBehavior: "contain" }}
            >
              {/* sticky header: handle, title, progress rail */}
              <div className="sticky top-0 z-20 px-4 sm:px-5 pt-3 pb-2.5" style={{ background: "rgba(250,250,247,.97)", borderBottom: `1px solid ${BORDER}` }}>
                <div className="flex justify-center pb-2">
                  <div className="w-10 h-1 rounded-full" style={{ background: BORDER }} />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-[19px] font-extrabold leading-tight tracking-tight">Stock your machine 🎰</h3>
                    <p className="text-[12px]" style={{ color: MUTED }}>Every step changes the preview behind this sheet.</p>
                  </div>
                  <button onClick={() => setEditMode("preview")} className="w-11 h-11 -mr-2 grid place-items-center rounded-full shrink-0" style={{ color: MUTED }} aria-label="Close">
                    <X size={20} />
                  </button>
                </div>
                <div className="mt-2.5 -mx-4 sm:-mx-5 px-4 sm:px-5 flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                  {steps.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => jump(st.id)}
                      className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11.5px] font-semibold border whitespace-nowrap"
                      style={{
                        borderColor: st.bad ? ERROR : st.done ? `${INDIGO}55` : BORDER,
                        background: st.bad ? "#fdecec" : st.done ? SURFACE_ALT : "#fff",
                        color: st.bad ? ERROR : st.done ? INDIGO : MUTED,
                      }}
                    >
                      {st.label}
                      {st.note && <span className="tabular-nums opacity-80">{st.note}</span>}
                      {st.done && !st.note && <Check size={11} />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="px-4 sm:px-5 pb-6 pt-4 space-y-8">
                {tried && missing.length > 0 && (
                  <div role="alert" className="rounded-2xl px-3.5 py-3 flex gap-2.5 items-start" style={{ background: "#fdecec", border: `1px solid ${ERROR}44` }}>
                    <AlertCircle size={17} className="shrink-0 mt-0.5" style={{ color: ERROR }} />
                    <div className="text-[12.5px] leading-snug">
                      <p className="font-bold" style={{ color: ERROR }}>Almost! Add {missing.join(" and ")} to save.</p>
                      <p style={{ color: MUTED }}>They go on the machine, the cards and the receipt.</p>
                    </div>
                  </div>
                )}

                {/* 1 — the machine */}
                <div ref={sec("vibe")}>
                  <FormSection emoji="🎨" title="Pick your machine" note="Four machines, four moods. The whole page re-skins — cabinet, cards, receipt.">
                    <MachinePicker value={mf.theme} onChange={(id) => updateMf("theme", id)} />
                  </FormSection>
                </div>

                {/* 2 — names */}
                <div ref={sec("names")}>
                  <FormSection emoji="🏷️" title="Whose machine is this?" note="Your name signs every card and the receipt. Theirs is the customer.">
                    <div className="grid grid-cols-2 gap-2.5">
                      <label className="block">
                        <Label>Your name *</Label>
                        <input
                          value={mf.senderName}
                          onChange={(e) => updateMf("senderName", e.target.value.slice(0, 80))}
                          placeholder="e.g. Rohan"
                          aria-invalid={tried && missingSender}
                          className={INPUT_CLS}
                          style={tried && missingSender ? { borderColor: ERROR, background: "#fff6f6" } : undefined}
                        />
                        {tried && missingSender && <span className="block text-[11px] mt-1 font-semibold" style={{ color: ERROR }}>Who stocked it?</span>}
                      </label>
                      <label className="block">
                        <Label>Their name *</Label>
                        <input
                          value={mf.recipientName}
                          onChange={(e) => updateMf("recipientName", e.target.value.slice(0, 80))}
                          placeholder="e.g. Ananya"
                          aria-invalid={tried && missingRecipient}
                          className={INPUT_CLS}
                          style={tried && missingRecipient ? { borderColor: ERROR, background: "#fff6f6" } : undefined}
                        />
                        {tried && missingRecipient && <span className="block text-[11px] mt-1 font-semibold" style={{ color: ERROR }}>Who&apos;s it for?</span>}
                      </label>
                    </div>
                    <label className="block">
                      <Label>Name on the front of the machine</Label>
                      <input
                        value={mf.machineName}
                        onChange={(e) => updateMf("machineName", e.target.value.slice(0, 60))}
                        placeholder="AFFECTION DISPENSER"
                        className={INPUT_CLS}
                        style={{ fontFamily: STENCIL, letterSpacing: ".08em", textTransform: "uppercase" }}
                      />
                      <span className="block text-[10.5px] mt-1" style={{ color: MUTED }}>Deadpan works best — HUG DISPENSER, SNACC UNIT, REGRET VENDOR CO.</span>
                    </label>
                  </FormSection>
                </div>

                {/* 3 — memory cards */}
                <div ref={sec("cards")}>
                  <FormSection
                    emoji="📸"
                    title="Limited-edition memory cards"
                    note={`Each photo becomes a 1-of-1 collectible card (M1–M${MAX_PHOTOS}) that drops out of the Card-O-Matic. 5–10 is the sweet spot.`}
                  >
                    <div className="rounded-2xl p-3 flex gap-3 items-center" style={{ background: "linear-gradient(115deg,#fff0f7,#efedfd)" }}>
                      <Sparkles size={18} style={{ color: PINK }} className="shrink-0" />
                      <p className="text-[11.5px] leading-snug" style={{ color: INK }}>
                        <strong>Caption</strong> = the card&apos;s name on the front. <strong>Note</strong> = the memory printed on the back.
                        Tap a photo to crop &amp; zoom, or swap it.
                      </p>
                    </div>
                    <PhotosEditor
                      photos={mf.photos}
                      onChange={(v) => updateMf("photos", v)}
                      captionHint="card name — e.g. the 2am maggi"
                      noteHint="The back of the card: what happened, what you felt, what you never said…"
                    />
                    {photoCount === 0 && (
                      <p className="text-[11.5px] text-center" style={{ color: MUTED }}>
                        No cards yet — the page still works, but the cards are the best bit. 💖
                      </p>
                    )}
                  </FormSection>
                </div>

                {/* 4 — the shelves */}
                <div ref={sec("shelves")}>
                  <FormSection
                    emoji="🎰"
                    title="The shelves"
                    note="Already loaded with ours. Tap any slot to put your words in it — change three or all seventeen."
                  >
                    <div className="flex items-center gap-2 flex-wrap text-[11px]" style={{ color: MUTED }}>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ background: AMBER }} />
                        <strong style={{ color: INK }}>{yoursCount}</strong> of 17 in your words
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Lock size={10} /> A1 is yours
                      </span>
                      {jam && (
                        <span className="inline-flex items-center gap-1.5">
                          <Wrench size={10} style={{ color: PINK }} /> {jam.code} jams
                        </span>
                      )}
                    </div>

                    <div className="rounded-xl p-2.5 space-y-2.5" style={{ background: "#0f1314", border: "1px solid #2f3436" }}>
                      {ROWS.map((row) => (
                        <div key={row}>
                          <div className="grid grid-cols-6 gap-1">
                            {COLS.map((col) => {
                              const code = `${row}${col}`;
                              const s = byCode.get(code);
                              if (!s) return <div key={code} />;
                              return (
                                <SlotChip
                                  key={code}
                                  slot={s}
                                  open={openCode === code}
                                  yours={isYours(s)}
                                  onClick={() => setOpenCode((c) => (c === code ? null : code))}
                                />
                              );
                            })}
                          </div>
                          <div className="h-[3px] mt-1 rounded-[1px]" style={{ background: "#2f3436" }} />
                        </div>
                      ))}
                    </div>

                    <AnimatePresence initial={false} mode="wait">
                      {openSlot && (
                        <motion.div
                          key={openSlot.code}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-1">
                            <SlotEditor
                              slot={openSlot}
                              onPatch={(patch) => patchSlot(openSlot.code, patch)}
                              onMakeJam={() => setJam(openSlot.code)}
                              onReset={() => resetSlot(openSlot.code)}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {!openSlot && (
                      <p className="text-[11px] text-center py-1" style={{ color: MUTED }}>
                        Tap a slot above to open it.
                      </p>
                    )}

                    <div className="rounded-xl px-3 py-2.5 flex items-center gap-2.5" style={{ background: "#fff0f7", border: `1px solid ${PINK}33` }}>
                      <Wrench size={14} style={{ color: PINK }} className="shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11.5px] font-bold" style={{ color: PINK }}>
                          {jam ? `${jam.code} is the one that jams` : "No slot jams yet"}
                        </p>
                        <p className="text-[10.5px] truncate" style={{ color: MUTED }}>
                          {jam ? jam.label || "—" : "Open a slot and pick one — it's the best moment in here."}
                        </p>
                      </div>
                      {jam && (
                        <button
                          type="button"
                          onClick={() => setOpenCode(jam.code)}
                          className="text-[11px] font-semibold px-3 py-2 rounded-lg shrink-0"
                          style={{ color: PINK, border: `1px solid ${PINK}44`, minHeight: 36 }}
                        >
                          Open
                        </button>
                      )}
                    </div>
                  </FormSection>
                </div>

                {/* 5 — credit prompts */}
                <div ref={sec("prompts")}>
                  <FormSection
                    emoji="🪙"
                    title="What it asks for"
                    note="It doesn't take coins — it asks a question, and their answer is the payment. Answers come back to you and nobody else."
                  >
                    <LineList
                      values={mf.creditPrompts}
                      onChange={(next) => updateMf("creditPrompts", next)}
                      placeholder="ONE THING YOU LOVE ABOUT HIM"
                      addLabel="Add a question"
                      prefix=">"
                      uppercase
                      max={80}
                    />
                  </FormSection>
                </div>

                {/* 6 — GIF stickers */}
                <div ref={sec("gifs")}>
                  <FormSection emoji="🎞️" title="GIF stickers" note="Up to 3. They get taped onto the backs of the cards and onto the receipt.">
                    <StickerPicker gifs={mf.gifs} onChange={(v) => updateMf("gifs", v)} />
                  </FormSection>
                </div>

                {/* 7 — the letter */}
                <div ref={sec("letter")}>
                  <FormSection emoji="🧾" title="The secret prize" note="Your main letter. It prints at the foot of their receipt, after every card — the last thing the machine gives them.">
                    <ReceiptLetter value={mf.letter} onChange={(v) => updateMf("letter", v)} sender={mf.senderName} />
                    {letterLen === 0 && (
                      <p className="text-[11px]" style={{ color: MUTED }}>
                        Leave it empty and the receipt prints a hug coupon instead. (But write it. You know you want to.)
                      </p>
                    )}
                  </FormSection>
                </div>

                {/* 8 — extras */}
                <div ref={sec("extras")}>
                  <FormSection emoji="📟" title="Extras" note="The scrolling sign and an optional password.">
                    <details className="rounded-xl border px-3 py-2.5" style={{ borderColor: BORDER }}>
                      <summary className="text-[12.5px] font-bold cursor-pointer select-none" style={{ color: INK }}>
                        The scrolling sign
                      </summary>
                      <div className="pt-3 space-y-2.5">
                        <LineList
                          values={mf.displayIdleMessages}
                          onChange={(next) => updateMf("displayIdleMessages", next)}
                          placeholder="HAVE A NICE DAY"
                          addLabel="Add a message"
                          uppercase
                          max={40}
                        />
                        <div className="rounded-[4px] px-2.5 py-2 overflow-hidden" style={{ background: "#0b0b0b", border: "1px solid #2f3436" }}>
                          <p className="text-[10px] whitespace-nowrap overflow-hidden text-ellipsis" style={{ color: "#ffa500", fontFamily: STENCIL, letterSpacing: ".18em" }}>
                            {signPreview || "—"}
                          </p>
                        </div>
                      </div>
                    </details>
                    <div>
                      <Label>Lock the link (optional)</Label>
                      <div className="relative">
                        <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
                        <input
                          value={pagePassword}
                          onChange={(e) => setPagePassword(e.target.value)}
                          placeholder="Leave empty for no password"
                          className={INPUT_CLS + " pl-10"}
                        />
                      </div>
                    </div>
                  </FormSection>
                </div>
              </div>

              {/* sticky save */}
              <div className="sticky bottom-0 z-20 px-4 sm:px-5 pt-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))]" style={{ background: "linear-gradient(180deg, rgba(250,250,247,0), #FAFAF7 30%)" }}>
                <button
                  onClick={save}
                  disabled={saving}
                  className="w-full py-3.5 rounded-2xl font-extrabold text-[15px] flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
                  style={{ background: LIME, color: INK, minHeight: 52 }}
                >
                  {saving ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : <><Eye size={16} /> Save &amp; try your machine</>}
                </button>
                <p className="text-center text-[11px] mt-1.5 flex items-center justify-center gap-1" style={{ color: MUTED }}>
                  <Check size={10} /> {photoCount} card{photoCount === 1 ? "" : "s"} · {letterLen ? "letter ✓" : "no letter yet"} · {pickVendTheme(mf.theme).name} — publish from the preview
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});
