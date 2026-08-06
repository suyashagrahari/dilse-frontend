"use client";

import { memo, useCallback, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, PenLine, Eye, Trash2, Plus, Lock, Loader2, Undo2, Wrench, Check } from "lucide-react";

import {
  type VendingData,
  type EditMode,
  type Slot,
  type SlotKind,
  COLS,
  DEMO_DATA,
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

const STENCIL = "var(--font-oswald), system-ui, sans-serif";
const TYPED = "var(--font-courier-prime), ui-monospace, monospace";

const INPUT_CLS =
  "w-full px-3.5 py-2.5 rounded-xl bg-black/[.03] border border-[#ECEAE3] focus:outline-none focus:border-[#6C5CE7] text-sm transition-colors";
const INPUT_SM =
  "w-full px-3 py-2 rounded-lg bg-black/[.03] border border-[#ECEAE3] focus:outline-none focus:border-[#6C5CE7] text-sm transition-colors";

const KIND_META: Record<SlotKind, { label: string; glyph: string }> = {
  compliment: { label: "Compliment", glyph: "💬" },
  memory: { label: "Memory", glyph: "📼" },
  voucher: { label: "Voucher", glyph: "🎟️" },
  empty: { label: "Blank", glyph: "🕳️" },
};

const DEMO_BY_CODE = new Map(DEMO_DATA.slots.map((s) => [s.code, s]));

/** Has the sender actually put their own words in this slot? */
const isYours = (s: Slot): boolean => {
  const d = DEMO_BY_CODE.get(s.code);
  if (!d) return true;
  return s.label !== d.label || s.payload !== d.payload || s.kind !== d.kind;
};

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

/* ── Section header ───────────────────────────────────────────────────────── */
function Section({ n, title, blurb, children }: { n: string; title: string; blurb?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex items-baseline gap-2">
        <span
          className="text-[10px] font-bold px-1.5 py-0.5 rounded"
          style={{ background: SURFACE_ALT, color: INDIGO, fontFamily: STENCIL, letterSpacing: ".08em" }}
        >
          {n}
        </span>
        <h4 className="text-sm font-bold" style={{ color: INK }}>{title}</h4>
      </div>
      {blurb && <p className="text-[11.5px] leading-relaxed" style={{ color: MUTED }}>{blurb}</p>}
      {children}
    </section>
  );
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

/* ── The sheet ────────────────────────────────────────────────────────────── */
export default memo(function EditSheet({
  editMode, setEditMode, mf, updateMf, pagePassword, setPagePassword, onSave, saving,
}: Props) {
  const visible = editMode !== null && editMode !== "preview";
  const [openCode, setOpenCode] = useState<string | null>(null);

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
            className="fixed bottom-0 left-0 right-0 z-[60] pointer-events-auto lg:flex lg:items-center lg:justify-center lg:inset-0 lg:bg-transparent"
          >
            <div
              className="w-full max-w-2xl max-h-[86vh] lg:max-h-[90vh] overflow-y-auto rounded-t-3xl lg:rounded-3xl shadow-2xl mx-auto"
              style={{ background: "#FAFAF7", color: INK }}
            >
              <div className="flex justify-center pt-3 pb-1 sticky top-0 z-10" style={{ background: "#FAFAF7" }}>
                <div className="w-10 h-1 rounded-full" style={{ background: BORDER }} />
              </div>

              <div className="px-4 sm:px-5 pb-8 pt-2 space-y-7">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <PenLine size={16} style={{ color: INDIGO }} /> Stock the machine
                  </h3>
                  <button onClick={() => setEditMode("preview")} className="p-2 -mr-2" style={{ color: MUTED }} aria-label="Close">
                    <X size={20} />
                  </button>
                </div>

                {/* 01 — the machine itself */}
                <Section n="01" title="The machine">
                  <div>
                    <Label>Name on the front</Label>
                    <input
                      value={mf.machineName}
                      onChange={(e) => updateMf("machineName", e.target.value)}
                      placeholder="AFFECTION DISPENSER"
                      className={INPUT_CLS}
                      style={{ fontFamily: STENCIL, letterSpacing: ".08em", textTransform: "uppercase" }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <Label>You *</Label>
                      <input
                        value={mf.senderName}
                        onChange={(e) => updateMf("senderName", e.target.value)}
                        placeholder="e.g. Rohan"
                        className={INPUT_CLS}
                      />
                    </div>
                    <div>
                      <Label>Them</Label>
                      <input
                        value={mf.recipientName}
                        onChange={(e) => updateMf("recipientName", e.target.value)}
                        placeholder="e.g. Ananya"
                        className={INPUT_CLS}
                      />
                    </div>
                  </div>
                </Section>

                {/* 02 — the shelves */}
                <Section
                  n="02"
                  title="The shelves"
                  blurb="Already loaded with ours. Tap any slot to put your words in it — change three, change all seventeen, it works either way."
                >
                  {/* progress, not a checklist */}
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

                  {/* the glass: three shelves, six slots each */}
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

                  {/* one editor, in place, under the shelves */}
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
                        <div className="pt-2.5">
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

                  {/* the jam, restated where it can be seen without hunting */}
                  <div
                    className="rounded-xl px-3 py-2.5 flex items-center gap-2.5"
                    style={{ background: "#fff0f7", border: `1px solid ${PINK}33` }}
                  >
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
                        className="text-[11px] font-semibold px-2.5 py-2 rounded-lg shrink-0"
                        style={{ color: PINK, border: `1px solid ${PINK}44` }}
                      >
                        Open
                      </button>
                    )}
                  </div>
                </Section>

                {/* 03 — credit prompts */}
                <Section
                  n="03"
                  title="What it asks for"
                  blurb="The machine doesn't take coins. It asks a question, and their answer is the payment. Their answers come back to you, and nobody else."
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
                </Section>

                {/* 04 — idle sign */}
                <Section n="04" title="The scrolling sign" blurb="What the little amber display says when nothing is happening.">
                  <LineList
                    values={mf.displayIdleMessages}
                    onChange={(next) => updateMf("displayIdleMessages", next)}
                    placeholder="HAVE A NICE DAY"
                    addLabel="Add a message"
                    uppercase
                    max={40}
                  />
                  <div
                    className="rounded-[2px] px-2.5 py-2 overflow-hidden"
                    style={{ background: "#0b0b0b", border: "1px solid #2f3436" }}
                  >
                    <p
                      className="text-[10px] whitespace-nowrap overflow-hidden text-ellipsis"
                      style={{ color: "#ffa500", fontFamily: STENCIL, letterSpacing: ".18em" }}
                    >
                      {signPreview || "—"}
                    </p>
                  </div>
                </Section>

                {/* 05 — password */}
                <Section n="05" title="Lock the link (optional)">
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
                    <input
                      value={pagePassword}
                      onChange={(e) => setPagePassword(e.target.value)}
                      placeholder="Leave empty for no password"
                      className={INPUT_CLS + " pl-10"}
                    />
                  </div>
                </Section>

                <button
                  onClick={onSave}
                  disabled={saving || !mf.senderName.trim()}
                  className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ background: LIME, color: INK }}
                >
                  {saving ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : <><Eye size={16} /> Save &amp; try it</>}
                </button>
                <p className="text-center text-[11px] flex items-center justify-center gap-1" style={{ color: MUTED }}>
                  <Check size={10} /> Publish from the preview to get your link
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});
