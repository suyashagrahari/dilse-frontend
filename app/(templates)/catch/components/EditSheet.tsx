"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, PenLine, Eye, Lock, Loader2, Plus, Camera, Link2, Info, Trash2 } from "lucide-react";
import type { CatchData, EditMode, GoodItem, BadItem } from "./types";
import { MIN_GOOD, MAX_GOOD, MIN_BAD, MAX_BAD } from "../hooks/useCatchEditor";

/* ── Warm palette. The whole template warms from grey-blue to amber as lines
      arrive, so the editor lives at the amber end of that same ramp. ───────── */
const INK = "#2E2A24";
const MUTED = "#8A8175";
const AMBER = "#B9722A";
const AMBER_GRAD = "linear-gradient(135deg,#E9A94A,#B9722A)";
const PAPER = "#FCF9F1";
const RULE = "rgba(176,146,102,.30)";
const FLAG = "#B8433A";

const SERIF = "var(--font-tinos), Georgia, serif";
const TYPED = "var(--font-courier-prime), ui-monospace, monospace";

const INPUT_CLS =
  "w-full px-4 py-3 rounded-xl bg-muted/40 border border-border/50 focus:outline-none focus:border-amber-500/50 text-sm transition-all";
const INPUT_SM = "w-full px-3 py-2 rounded-lg bg-muted/40 border border-border/50 focus:outline-none text-sm";

/** Things people actually keep. An emoji beats custom art: legible, free, theirs. */
const GOOD_EMOJI = [
  "☕","🧥","🎧","🐕","📚","🌧️","💍","🍜","✈️","📷","🎵","🕯️",
  "🧦","🍫","🚲","🎂","🪁","🧣","📖","🍟","🥟","🏏","🎸","🌻",
  "🪴","🚗","🎟️","🧸","📌","🍵","🪞","🧃","🛵","🎨","🧤","🍦",
  "🗝️","🌙","⭐","💛",
];
const BAD_EMOJI = ["💬","👀","🚩","📱","🥱","🙄","😐","⏳","📵","💤","🧢","🔕"];

const DURATIONS = [
  { ms: 30000, label: "30s", note: "quick" },
  { ms: 45000, label: "45s", note: "just right" },
  { ms: 60000, label: "60s", note: "roomy" },
  { ms: 90000, label: "90s", note: "long letter" },
];

interface Props {
  editMode: EditMode;
  setEditMode: (m: EditMode) => void;
  mf: CatchData;
  updateMf: (key: keyof CatchData, val: unknown) => void;
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
    const onDoc = (e: PointerEvent) => { if (!boxRef.current?.contains(e.target as Node)) setOpen(false); };
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
              onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
              onMouseEnter={() => setOpen(true)}
              onMouseLeave={() => setOpen(false)}
              aria-label={hint}
              aria-expanded={open}
              className="inline-grid place-items-center w-5 h-5 rounded-full shrink-0 transition-transform active:scale-90"
              style={{ background: open ? AMBER : "rgba(185,114,42,.12)", color: open ? "#fff" : AMBER }}
            >
              <Info size={12} />
            </button>
            <AnimatePresence>
              {open && (
                <motion.span
                  role="tooltip"
                  initial={{ opacity: 0, y: -4, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute z-[70] normal-case tracking-normal font-medium"
                  style={{
                    top: "calc(100% + 8px)", left: 0, width: "min(250px, 74vw)",
                    background: "#332C22", color: "#fff", fontSize: 11, lineHeight: 1.5,
                    padding: "8px 11px", borderRadius: 10, boxShadow: "0 12px 30px -8px rgba(51,44,34,.5)",
                  }}
                >
                  <span aria-hidden style={{ position: "absolute", top: -5, left: 6, width: 10, height: 10, background: "#332C22", transform: "rotate(45deg)", borderRadius: 2 }} />
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

/** Emoji palette. Opens under the object being named, so the choice reads as
 *  "pick the thing", not "fill the emoji field". Free text still allowed. */
function EmojiPalette({
  value, options, onPick, onClose,
}: { value: string; options: string[]; onPick: (e: string) => void; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDoc = (e: PointerEvent) => { if (!ref.current?.contains(e.target as Node)) onClose(); };
    document.addEventListener("pointerdown", onDoc);
    return () => document.removeEventListener("pointerdown", onDoc);
  }, [onClose]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.97 }}
      transition={{ duration: 0.14 }}
      className="absolute z-[80] left-0 top-full mt-2 p-2.5 rounded-2xl shadow-xl"
      style={{ width: "min(276px, 78vw)", background: "#fff", border: "1px solid #EADFCB" }}
    >
      <div className="grid grid-cols-8 gap-1">
        {options.map((em) => (
          <button
            key={em}
            type="button"
            onClick={() => { onPick(em); onClose(); }}
            className="w-8 h-8 rounded-lg grid place-items-center text-[18px] transition-transform active:scale-90"
            style={{ background: em === value ? "rgba(185,114,42,.14)" : "transparent" }}
          >
            {em}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-2 pt-2" style={{ borderTop: "1px solid #F0E7D7" }}>
        <span className="text-[10px] shrink-0" style={{ color: MUTED }}>or paste one</span>
        <input
          value={value}
          onChange={(ev) => onPick(ev.target.value.slice(0, 4))}
          maxLength={4}
          className="w-14 text-center text-[16px] rounded-lg py-1"
          style={{ background: "#FAF6EE", border: "1px solid #EADFCB", outline: "none" }}
        />
      </div>
    </motion.div>
  );
}

/** A textarea that grows with what's written on it — a sheet of paper never
 *  gets a scrollbar. */
function useAutosize(value: string) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(el.scrollHeight, 58)}px`;
  }, [value]);
  return ref;
}

/* ── THE OBJECT ────────────────────────────────────────────────────────────────
   The whole emotional payload of this template is that the hoodie you never gave
   back has a line written ON it. So the editor refuses to be three columns of
   fields: the object is a physical chip, its name hangs off it on a luggage tag,
   and a thread runs from the tag across to a sheet of ruled paper where the line
   is written in serif. Nothing is written until the paper has ink — an unwritten
   object stays faded and dashed, because an object with no line on it isn't a
   piece of the letter yet.
──────────────────────────────────────────────────────────────────────────────*/
function ObjectCard({
  item, index, onPatch, onRemove, canRemove,
}: {
  item: GoodItem;
  index: number;
  onPatch: (patch: Partial<GoodItem>) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const [picking, setPicking] = useState(false);
  const written = item.line.trim().length > 0;
  const areaRef = useAutosize(item.line);

  // A gentle, deterministic tilt so the row of objects looks laid out by hand
  // rather than stacked by a layout engine. Index-derived — never random.
  const tilt = [-2.1, 1.4, -1.2, 2.0, -1.7, 1.1][index % 6];

  return (
    <div
      className="relative flex items-stretch gap-0 rounded-2xl p-3 transition-all"
      style={{
        background: written ? "#FFFDF8" : "rgba(250,246,238,.55)",
        border: `1px ${written ? "solid" : "dashed"} ${written ? "#E7D9BF" : "#DCD3C4"}`,
        boxShadow: written ? "0 6px 18px -12px rgba(80,60,30,.5)" : "none",
      }}
    >
      {/* ── the object + its tag ── */}
      <div className="relative w-[86px] shrink-0 flex flex-col items-center">
        <button
          type="button"
          onClick={() => setPicking((v) => !v)}
          aria-label="Choose the object"
          className="w-[58px] h-[58px] rounded-full grid place-items-center transition-transform active:scale-95"
          style={{
            fontSize: 28, lineHeight: 1,
            background: "#FFF8EA",
            border: `1.5px solid ${written ? "#DEC79B" : "#E3D9C6"}`,
            boxShadow: "inset 0 -3px 8px rgba(150,115,60,.10)",
            transform: `rotate(${tilt}deg)`,
          }}
        >
          <span aria-hidden>{item.emoji || "＋"}</span>
        </button>

        {/* the string from the object down to its tag */}
        <svg width="10" height="12" aria-hidden style={{ marginTop: -1 }}>
          <path d="M5 0 C 2 5, 8 7, 5 12" fill="none" stroke="#CBB994" strokeWidth="1.2" />
        </svg>

        {/* the luggage tag: the object's name, typed onto it */}
        <div
          className="relative w-full"
          style={{
            background: "#F6EEDD",
            border: "1px solid #E0D2B6",
            borderRadius: 6,
            padding: "3px 5px 3px 11px",
            transform: `rotate(${-tilt * 0.6}deg)`,
          }}
        >
          <span
            aria-hidden
            style={{ position: "absolute", left: 4, top: "50%", marginTop: -2.5, width: 5, height: 5, borderRadius: 999, background: "#fff", border: "1px solid #D3C3A2" }}
          />
          <input
            value={item.label}
            onChange={(e) => onPatch({ label: e.target.value.slice(0, 34) })}
            placeholder="name it"
            aria-label="What is this object?"
            className="w-full bg-transparent outline-none text-center"
            style={{ fontFamily: TYPED, fontSize: 10.5, lineHeight: 1.3, color: "#6B5B41" }}
          />
        </div>

        <AnimatePresence>
          {picking && (
            <EmojiPalette
              value={item.emoji}
              options={GOOD_EMOJI}
              onPick={(em) => onPatch({ emoji: em })}
              onClose={() => setPicking(false)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* ── the thread running from the tag onto the paper ── */}
      <div className="shrink-0 w-[22px] self-center" aria-hidden>
        <svg width="22" height="40" viewBox="0 0 22 40">
          <path
            d="M0 20 C 8 20, 8 12, 16 12"
            fill="none"
            stroke={written ? "#D9BE8C" : "#DFD6C6"}
            strokeWidth="1.3"
            strokeDasharray="3 3"
          />
          <circle cx="17.5" cy="12" r="2.2" fill={written ? "#D9BE8C" : "#DFD6C6"} />
        </svg>
      </div>

      {/* ── the paper the line is written on ── */}
      <div
        className="flex-1 min-w-0 relative rounded-lg overflow-hidden"
        style={{
          background: PAPER,
          border: `1px solid ${written ? "#E6D8BE" : "#E4DCCD"}`,
          transform: "rotate(-0.35deg)",
        }}
      >
        <textarea
          ref={areaRef}
          value={item.line}
          onChange={(e) => onPatch({ line: e.target.value })}
          rows={2}
          placeholder={item.label.trim() ? `what ${item.label.trim()} means…` : "write the line this object carries…"}
          aria-label={`The line written on ${item.label.trim() || "this object"}`}
          className="w-full resize-none bg-transparent outline-none block"
          style={{
            fontFamily: SERIF,
            fontSize: 14.5,
            lineHeight: "26px",
            color: INK,
            padding: "5px 30px 6px 12px",
            minHeight: 58,
            backgroundImage: `repeating-linear-gradient(to bottom, transparent 0px, transparent 25px, ${RULE} 25px, ${RULE} 26px)`,
            backgroundAttachment: "local",
            backgroundPosition: "0 5px",
          }}
        />
        {/* nib mark, bottom-right of the sheet */}
        <PenLine
          size={11}
          aria-hidden
          style={{ position: "absolute", right: 9, bottom: 7, color: written ? "#C9AE7C" : "#DDD5C6" }}
        />
      </div>

      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove this object"
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full grid place-items-center shadow-sm transition-transform active:scale-90"
          style={{ background: "#fff", border: "1px solid #E7DCC7", color: MUTED }}
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}

/* ── the things they dodge: emoji + label only, kept petty ─────────────────── */
function FlagChip({
  item, onPatch, onRemove, canRemove,
}: { item: BadItem; onPatch: (p: Partial<BadItem>) => void; onRemove: () => void; canRemove: boolean }) {
  const [picking, setPicking] = useState(false);
  return (
    <div
      className="relative flex items-center gap-2 rounded-full pl-1.5 pr-1.5 py-1.5"
      style={{ background: "rgba(184,67,58,.05)", border: "1px solid rgba(184,67,58,.18)" }}
    >
      <button
        type="button"
        onClick={() => setPicking((v) => !v)}
        aria-label="Choose the emoji"
        className="w-8 h-8 rounded-full grid place-items-center text-[17px] shrink-0 transition-transform active:scale-90"
        style={{ background: "#fff", border: "1px solid rgba(184,67,58,.22)" }}
      >
        <span aria-hidden>{item.emoji || "＋"}</span>
      </button>
      <input
        value={item.label}
        onChange={(e) => onPatch({ label: e.target.value.slice(0, 30) })}
        placeholder="the petty thing"
        aria-label="What are they dodging?"
        className="bg-transparent outline-none"
        style={{ fontFamily: TYPED, fontSize: 12, color: "#7C3B35", width: `${Math.max(11, Math.min(24, item.label.length + 3))}ch` }}
      />
      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove"
          className="w-6 h-6 rounded-full grid place-items-center shrink-0"
          style={{ color: "rgba(184,67,58,.6)" }}
        >
          <Trash2 size={12} />
        </button>
      )}
      <AnimatePresence>
        {picking && (
          <EmojiPalette value={item.emoji} options={BAD_EMOJI} onPick={(em) => onPatch({ emoji: em })} onClose={() => setPicking(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

/** Shows exactly what the sprite will look like — circular, cover-cropped, or
 *  their initial. A half-typed URL must never wipe the field, so the broken
 *  state is local and resets whenever the URL changes. */
function FacePreview({ url, initial }: { url: string; initial: string }) {
  // The URL that failed, not a boolean — typing on resets it for free.
  const [brokenUrl, setBrokenUrl] = useState("");
  const usable = url !== brokenUrl && (url.startsWith("data:image") || /^https?:\/\/\S+$/i.test(url));

  return (
    <div
      className="w-16 h-16 rounded-full overflow-hidden grid place-items-center shrink-0"
      style={{ background: "#FFF3DF", border: "1.5px solid #E4CFA6", color: AMBER, fontFamily: SERIF, fontSize: 24 }}
    >
      {usable ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="w-full h-full object-cover" onError={() => setBrokenUrl(url)} />
      ) : (
        <span aria-hidden>{initial}</span>
      )}
    </div>
  );
}

/** Square, centre-cropped, downscaled to 256px before it ever reaches the wire.
 *  The sprite is drawn at 64px — anything bigger is payload for nothing, and a
 *  data URL keeps the canvas same-origin so the share card can still export. */
function faceToDataUrl(file: File, cb: (src: string) => void) {
  if (!file.type.startsWith("image/")) return;
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const S = 256;
      const canvas = document.createElement("canvas");
      canvas.width = S; canvas.height = S;
      const ctx = canvas.getContext("2d");
      if (!ctx) { cb(String(reader.result)); return; }
      const side = Math.min(img.width, img.height);
      ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, S, S);
      try { cb(canvas.toDataURL("image/jpeg", 0.82)); } catch { cb(String(reader.result)); }
    };
    img.onerror = () => cb(String(reader.result));
    img.src = String(reader.result);
  };
  reader.readAsDataURL(file);
}

/* ── The sheet ─────────────────────────────────────────────────────────────── */

export default memo(function EditSheet({
  editMode, setEditMode, mf, updateMf, pagePassword, setPagePassword, onSave, saving,
}: Props) {
  const visible = editMode === "manual";
  const fileRef = useRef<HTMLInputElement>(null);
  const closingRef = useAutosize(mf.closingLine);

  const written = mf.goodItems.filter((g) => g.line.trim()).length;
  const ready = mf.senderName.trim().length > 0 && written >= MIN_GOOD && mf.badItems.length >= MIN_BAD;

  const patchGood = useCallback((i: number, patch: Partial<GoodItem>) => {
    updateMf("goodItems", mf.goodItems.map((g, idx) => (idx === i ? { ...g, ...patch } : g)));
  }, [mf.goodItems, updateMf]);

  const addGood = useCallback(() => {
    if (mf.goodItems.length >= MAX_GOOD) return;
    const id = `g${Date.now().toString(36)}${mf.goodItems.length}`;
    updateMf("goodItems", [...mf.goodItems, { id, emoji: "💛", label: "", line: "" }]);
  }, [mf.goodItems, updateMf]);

  const removeGood = useCallback((i: number) => {
    updateMf("goodItems", mf.goodItems.filter((_, idx) => idx !== i));
  }, [mf.goodItems, updateMf]);

  const patchBad = useCallback((i: number, patch: Partial<BadItem>) => {
    updateMf("badItems", mf.badItems.map((b, idx) => (idx === i ? { ...b, ...patch } : b)));
  }, [mf.badItems, updateMf]);

  const addBad = useCallback(() => {
    if (mf.badItems.length >= MAX_BAD) return;
    const id = `b${Date.now().toString(36)}${mf.badItems.length}`;
    updateMf("badItems", [...mf.badItems, { id, emoji: "🚩", label: "" }]);
  }, [mf.badItems, updateMf]);

  const removeBad = useCallback((i: number) => {
    updateMf("badItems", mf.badItems.filter((_, idx) => idx !== i));
  }, [mf.badItems, updateMf]);

  /** The demo objects are there to show the register, not to be deleted one by
   *  one. This hands back MIN_GOOD blank objects to write on. */
  const startBlank = useCallback(() => {
    const stamp = Date.now().toString(36);
    updateMf("goodItems", Array.from({ length: MIN_GOOD }, (_, i) => ({
      id: `g${stamp}${i}`,
      emoji: GOOD_EMOJI[i % GOOD_EMOJI.length],
      label: "",
      line: "",
    })));
  }, [updateMf]);

  const initial = (mf.recipientName.trim()[0] || "?").toUpperCase();

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setEditMode("preview")}
            className="fixed inset-0 z-[60] bg-black/50"
          />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="fixed bottom-0 left-0 right-0 z-[60] pointer-events-auto lg:flex lg:items-center lg:justify-center lg:inset-0 lg:bg-transparent"
          >
            <div className="w-full max-w-2xl max-h-[86vh] lg:max-h-[92vh] overflow-y-auto bg-background rounded-t-3xl lg:rounded-3xl shadow-2xl mx-auto">
              <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-background z-20">
                <div className="w-10 h-1 rounded-full bg-border" />
              </div>

              <div className="px-5 pb-8 pt-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <PenLine size={16} style={{ color: AMBER }} /> Write the letter onto things
                  </h3>
                  <button onClick={() => setEditMode("preview")} aria-label="Close" className="p-1 text-muted-foreground"><X size={20} /></button>
                </div>

                {/* names */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Your name *" hint="The one writing the letter — that's you.">
                    <input value={mf.senderName} onChange={(e) => updateMf("senderName", e.target.value)} placeholder="e.g. Rohan" className={INPUT_CLS} />
                  </Field>
                  <Field label="Their name" hint="Whoever is going to catch it.">
                    <input value={mf.recipientName} onChange={(e) => updateMf("recipientName", e.target.value)} placeholder="e.g. Ananya" className={INPUT_CLS} />
                  </Field>
                </div>

                {/* face */}
                <Field label="Their face" hint="Becomes the thing they catch with. Paste a link or upload — we crop it square and shrink it. No photo? Their initial is used instead, which looks fine.">
                  <div className="flex items-center gap-3">
                    <FacePreview url={mf.faceUrl} initial={initial} />
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="relative">
                        <Link2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
                        <input
                          value={mf.faceUrl.startsWith("data:") ? "" : mf.faceUrl}
                          onChange={(e) => updateMf("faceUrl", e.target.value.trim())}
                          placeholder={mf.faceUrl.startsWith("data:") ? "photo uploaded" : "https://…"}
                          className={INPUT_SM + " pl-9"}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button" onClick={() => fileRef.current?.click()}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
                          style={{ color: AMBER, border: "1px solid rgba(185,114,42,.3)" }}
                        >
                          <Camera size={13} /> Upload
                        </button>
                        {mf.faceUrl && (
                          <button type="button" onClick={() => updateMf("faceUrl", "")} className="text-xs" style={{ color: MUTED }}>Remove</button>
                        )}
                      </div>
                      <input
                        ref={fileRef} type="file" accept="image/*" className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) faceToDataUrl(f, (src) => updateMf("faceUrl", src)); e.target.value = ""; }}
                      />
                    </div>
                  </div>
                </Field>

                {/* ── THE OBJECTS ── */}
                <div>
                  <div className="flex items-end justify-between mb-2">
                    <div>
                      <h4 className="text-sm font-bold" style={{ color: INK }}>The things, and what they say</h4>
                      <p className="text-[11px] mt-0.5" style={{ color: MUTED }}>
                        One line per object. They catch the thing, the line arrives.
                      </p>
                    </div>
                    <div className="shrink-0 ml-2 text-right">
                      <span
                        className="block text-[11px] font-semibold tabular-nums"
                        style={{ color: written >= MIN_GOOD ? AMBER : MUTED, fontFamily: TYPED }}
                      >
                        {written}/{mf.goodItems.length} written
                      </span>
                      <button
                        type="button" onClick={startBlank}
                        className="text-[10px] underline underline-offset-2"
                        style={{ color: MUTED }}
                      >
                        start blank
                      </button>
                    </div>
                  </div>

                  {/* how much of the letter exists, as pieces rather than a bar */}
                  <div className="flex gap-1 mb-3" aria-hidden>
                    {mf.goodItems.map((g, i) => (
                      <span
                        key={g.id + i}
                        className="h-1 flex-1 rounded-full transition-colors"
                        style={{ background: g.line.trim() ? AMBER : "#E7E0D2" }}
                      />
                    ))}
                  </div>

                  <div className="space-y-2.5">
                    {mf.goodItems.map((item, i) => (
                      <ObjectCard
                        key={item.id}
                        item={item}
                        index={i}
                        onPatch={(patch) => patchGood(i, patch)}
                        onRemove={() => removeGood(i)}
                        canRemove={mf.goodItems.length > MIN_GOOD}
                      />
                    ))}
                  </div>

                  {mf.goodItems.length < MAX_GOOD ? (
                    <button
                      type="button" onClick={addGood}
                      className="w-full mt-2.5 py-3 rounded-2xl text-sm font-semibold inline-flex items-center justify-center gap-1.5 transition-colors"
                      style={{ color: AMBER, border: "1px dashed #DDCFB4", background: "rgba(250,246,238,.5)" }}
                    >
                      <Plus size={14} /> Add another thing
                    </button>
                  ) : (
                    <p className="text-[11px] text-center mt-2.5" style={{ color: MUTED }}>
                      {MAX_GOOD} objects is the most a run can hold.
                    </p>
                  )}

                  {written < MIN_GOOD && (
                    <p className="text-[11px] mt-2 text-center" style={{ color: MUTED }}>
                      {MIN_GOOD - written} more {MIN_GOOD - written === 1 ? "line" : "lines"} and the letter has enough pieces to fall.
                    </p>
                  )}
                </div>

                {/* ── the last line ── */}
                <div>
                  <h4 className="text-sm font-bold mb-1" style={{ color: INK }}>The last line</h4>
                  <p className="text-[11px] mb-2" style={{ color: MUTED }}>
                    Always arrives — caught, missed, or out of time. Nothing is ever withheld.
                  </p>
                  <div className="rounded-lg overflow-hidden" style={{ background: PAPER, border: "1px solid #E6D8BE", transform: "rotate(-0.25deg)" }}>
                    <textarea
                      ref={closingRef}
                      value={mf.closingLine}
                      onChange={(e) => updateMf("closingLine", e.target.value)}
                      rows={2}
                      placeholder="the line you'd want them to read last…"
                      aria-label="Closing line"
                      className="w-full resize-none bg-transparent outline-none block"
                      style={{
                        fontFamily: SERIF, fontSize: 15, lineHeight: "26px", color: INK,
                        padding: "5px 12px 6px", minHeight: 58,
                        backgroundImage: `repeating-linear-gradient(to bottom, transparent 0px, transparent 25px, ${RULE} 25px, ${RULE} 26px)`,
                        backgroundAttachment: "local",
                        backgroundPosition: "0 5px",
                      }}
                    />
                  </div>
                </div>

                {/* ── the petty things ── */}
                <div>
                  <div className="flex items-end justify-between mb-1">
                    <h4 className="text-sm font-bold" style={{ color: INK }}>Things to dodge</h4>
                    <span className="text-[11px] tabular-nums" style={{ color: MUTED, fontFamily: TYPED }}>
                      {mf.badItems.length}/{MAX_BAD}
                    </span>
                  </div>
                  <p className="text-[11px] mb-2.5" style={{ color: MUTED }}>
                    Petty, not cruel — “seen 9:41 PM”, “k”. Hitting one never takes a line away.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {mf.badItems.map((b, i) => (
                      <FlagChip
                        key={b.id}
                        item={b}
                        onPatch={(p) => patchBad(i, p)}
                        onRemove={() => removeBad(i)}
                        canRemove={mf.badItems.length > MIN_BAD}
                      />
                    ))}
                    {mf.badItems.length < MAX_BAD && (
                      <button
                        type="button" onClick={addBad}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold"
                        style={{ color: FLAG, border: "1px dashed rgba(184,67,58,.35)" }}
                      >
                        <Plus size={13} /> Add
                      </button>
                    )}
                  </div>
                </div>

                {/* ── how long ── */}
                <Field label="How long it falls" hint="How long the sky keeps dropping things. Missed lines come back around, so a longer run just means more chances.">
                  <div className="grid grid-cols-4 gap-2">
                    {DURATIONS.map((d) => {
                      const on = mf.durationMs === d.ms;
                      return (
                        <button
                          key={d.ms} type="button" onClick={() => updateMf("durationMs", d.ms)}
                          className="py-2.5 rounded-xl text-center transition-all"
                          style={{
                            background: on ? "rgba(185,114,42,.10)" : "transparent",
                            border: `1.5px solid ${on ? AMBER : "#E7E0D2"}`,
                          }}
                        >
                          <span className="block text-sm font-bold" style={{ color: on ? AMBER : INK }}>{d.label}</span>
                          <span className="block text-[9.5px] mt-0.5" style={{ color: MUTED }}>{d.note}</span>
                        </button>
                      );
                    })}
                  </div>
                </Field>

                {/* ── password ── */}
                <Field label="Password (optional)" hint="If set, the shared link asks for this before the letter opens.">
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
                    <input
                      value={pagePassword}
                      onChange={(e) => setPagePassword(e.target.value)}
                      placeholder="Leave empty for no password"
                      className={INPUT_CLS + " pl-10"}
                    />
                  </div>
                </Field>

                <button
                  onClick={onSave}
                  disabled={saving || !ready}
                  className="w-full py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ background: AMBER_GRAD }}
                >
                  {saving ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : <><Eye size={16} /> Save & play it</>}
                </button>
                <p className="text-center text-[11px] flex items-center justify-center gap-1" style={{ color: MUTED }}>
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
