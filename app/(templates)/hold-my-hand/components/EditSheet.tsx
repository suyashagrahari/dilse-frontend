"use client";

import { memo, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, PenLine, Eye, Camera, Trash2, Plus, Lock, Loader2, Info, Hand, Skull, Heart, ImagePlus, Crop as CropIcon, RefreshCw,
} from "lucide-react";
import {
  CROP_DEFAULT, DURATION_PRESETS, HMH, LOVE, MAX_MEMORIES, MEMORY_NOTE_MAX,
  cropStyle, isDemoImage, mainCrop, memoryCrop, type Crop, type HoldData, type EditMode,
} from "./types";
import PhotoAdjuster from "./PhotoAdjuster";

const INPUT_CLS =
  "w-full px-4 py-3 rounded-xl bg-black/[.04] border border-black/10 focus:outline-none focus:border-[#6C5CE7] text-sm transition-all";
const INPUT_SM = "w-full px-3 py-2 rounded-lg bg-black/[.04] border border-black/10 focus:outline-none focus:border-[#6C5CE7] text-sm";

/**
 * A textarea that grows with what is typed. Every line in this form is a
 * sentence somebody means, so none of them get a one-line box that hides half
 * of it.
 */
function AutoText({
  value, onChange, placeholder, minRows = 2, maxLength, className = INPUT_SM, style,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  minRows?: number;
  maxLength?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight + 2}px`;
  }, [value]);
  return (
    <textarea
      ref={ref}
      value={value}
      rows={minRows}
      maxLength={maxLength}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={className + " resize-none leading-relaxed block"}
      style={{ overflow: "hidden", ...style }}
    />
  );
}

/** "Sample" chip on the demo art, so nobody publishes our couple by accident. */
function SampleChip() {
  return (
    <span
      className="absolute left-1.5 top-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
      style={{ background: "rgba(255,255,255,.92)", color: LOVE.roseDeep }}
    >
      sample
    </span>
  );
}

interface Props {
  editMode: EditMode;
  setEditMode: (m: EditMode) => void;
  mf: HoldData;
  updateMf: (key: keyof HoldData, val: unknown) => void;
  pagePassword: string;
  setPagePassword: (v: string) => void;
  onSave: () => void;
  saving: boolean;
}

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
      <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5" style={{ color: HMH.muted }}>
        <span>{label}</span>
        {hint && (
          <span ref={boxRef} className="relative inline-flex items-center">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
              aria-label={hint}
              aria-expanded={open}
              className="inline-grid place-items-center w-5 h-5 rounded-full shrink-0 transition-transform active:scale-90"
              style={{ background: open ? HMH.indigo : "rgba(108,92,231,.12)", color: open ? "#fff" : HMH.indigo }}
            >
              <Info size={12} />
            </button>
            <AnimatePresence>
              {open && (
                <motion.span
                  role="tooltip"
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute z-[60] normal-case tracking-normal font-medium"
                  style={{
                    top: "calc(100% + 8px)", left: 0, width: "min(240px, 72vw)",
                    background: HMH.ink, color: "#fff", fontSize: 11, lineHeight: 1.5,
                    padding: "8px 11px", borderRadius: 10,
                    boxShadow: "0 12px 30px -8px rgba(14,14,18,.5)",
                  }}
                >
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

function fileToDataUrl(file: File, cb: (src: string) => void, maxMb = 6) {
  if (file.size > maxMb * 1024 * 1024) {
    alert(`Image too large. Please use one under ${maxMb}MB.`);
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => cb(e.target?.result as string);
  reader.readAsDataURL(file);
}

export default memo(function EditSheet({
  editMode, setEditMode, mf, updateMf, pagePassword, setPagePassword, onSave, saving,
}: Props) {
  const visible = editMode !== null && editMode !== "preview";
  const photoRef = useRef<HTMLInputElement>(null);
  const memoryRef = useRef<HTMLInputElement>(null);

  /** Which photo the adjuster is framing: "main", a gallery index, or none. */
  const [adjusting, setAdjusting] = useState<"main" | number | null>(null);
  /** Gallery slot a "change photo" upload replaces (null = add a new one). */
  const replaceIdx = useRef<number | null>(null);

  const setMainCrop = (c: Crop) => {
    updateMf("photoCropX", c.x);
    updateMf("photoCropY", c.y);
    updateMf("photoScale", c.scale);
  };
  const setMainPhoto = (src: string) => {
    updateMf("photoUrl", src);
    setMainCrop({ ...CROP_DEFAULT });
    setAdjusting("main");
  };
  const setMemoryCrop = (i: number, c: Crop) =>
    updateMf("memories", (mf.memories ?? []).map((m, idx) => (idx === i ? { ...m, cropX: c.x, cropY: c.y, scale: c.scale } : m)));
  const replaceMemoryPhoto = (i: number, src: string) =>
    updateMf("memories", (mf.memories ?? []).map((m, idx) => (idx === i ? { ...m, imageUrl: src, ...toMemCrop(CROP_DEFAULT) } : m)));
  const toMemCrop = (c: Crop) => ({ cropX: c.x, cropY: c.y, scale: c.scale });

  const updateHoldLine = (i: number, patch: Partial<{ atMs: number; text: string }>) =>
    updateMf("holdLines", mf.holdLines.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  const addHoldLine = () =>
    updateMf("holdLines", [...mf.holdLines, { atMs: Math.min(mf.durationMs, (mf.holdLines.at(-1)?.atMs ?? 0) + 5000), text: "" }]);
  const removeHoldLine = (i: number) => updateMf("holdLines", mf.holdLines.filter((_, idx) => idx !== i));

  const updateList = (key: "releaseLines" | "ghostFragments", i: number, val: string) =>
    updateMf(key, mf[key].map((s, idx) => (idx === i ? val : s)));
  const addToList = (key: "releaseLines" | "ghostFragments") => updateMf(key, [...mf[key], ""]);
  const removeFromList = (key: "releaseLines" | "ghostFragments", i: number) =>
    updateMf(key, mf[key].filter((_, idx) => idx !== i));

  // ── Keepsake cards ────────────────────────────────────────────────────────
  // Photo first, note second: a card with no picture is dropped by the server,
  // so adding one starts by choosing the photograph rather than by leaving an
  // empty frame on the page.
  const addMemory = (src: string) => {
    const list = [...(mf.memories ?? []), { imageUrl: src, note: "", ...toMemCrop(CROP_DEFAULT) }].slice(0, MAX_MEMORIES);
    updateMf("memories", list);
    setAdjusting(list.length - 1);
  };
  const updateMemoryNote = (i: number, note: string) =>
    updateMf("memories", (mf.memories ?? []).map((m, idx) => (idx === i ? { ...m, note } : m)));
  const removeMemory = (i: number) =>
    updateMf("memories", (mf.memories ?? []).filter((_, idx) => idx !== i));

  return (
    <>
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setEditMode("preview")}
            className="fixed inset-0 z-[60] bg-black/60"
          />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="fixed bottom-0 left-0 right-0 z-[60] pointer-events-auto lg:flex lg:items-center lg:justify-center lg:inset-0 lg:bg-transparent"
          >
            <div
              className="w-full max-w-2xl lg:max-w-3xl max-h-[88dvh] lg:max-h-[90vh] overflow-y-auto rounded-t-3xl lg:rounded-[28px] shadow-2xl mx-auto"
              style={{ background: HMH.bg, color: HMH.ink, fontFamily: HMH.body }}
            >
              <div className="flex justify-center pt-3 pb-1 sticky top-0 z-10" style={{ background: HMH.bg }}>
                <div className="w-10 h-1 rounded-full" style={{ background: HMH.border }} />
              </div>

              <div className="px-5 sm:px-7 pb-10 pt-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold flex items-center gap-2" style={{ fontFamily: HMH.display }}>
                    <PenLine size={16} style={{ color: HMH.indigo }} /> Build the hold
                  </h3>
                  <button onClick={() => setEditMode("preview")} className="p-1" style={{ color: HMH.muted }}><X size={20} /></button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Your name *" hint="Signs the letter at the end.">
                    <input value={mf.senderName} onChange={(e) => updateMf("senderName", e.target.value)} placeholder="e.g. Aarav" className={INPUT_CLS} />
                  </Field>
                  <Field label="Their name" hint="The person who has to hold on.">
                    <input value={mf.recipientName} onChange={(e) => updateMf("recipientName", e.target.value)} placeholder="e.g. Aditi" className={INPUT_CLS} />
                  </Field>
                </div>

                <Field label="Main photo" hint="The face that slowly comes into focus while they hold. It is also the stamp on the letter and the big photo on the share card they post. No photo → a heart is used.">
                  <div className="flex items-center gap-4">
                    <div
                      onClick={() => (mf.photoUrl ? setAdjusting("main") : photoRef.current?.click())}
                      className="relative w-24 h-24 rounded-full border-2 border-dashed cursor-pointer overflow-hidden grid place-items-center shrink-0"
                      style={{ borderColor: mf.photoUrl ? "transparent" : HMH.border, boxShadow: mf.photoUrl ? `0 0 0 3px ${LOVE.blush}` : undefined }}
                    >
                      {mf.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={mf.photoUrl} alt="" style={cropStyle(mainCrop(mf))} />
                      ) : (
                        <Camera size={20} style={{ color: HMH.muted }} />
                      )}
                      <input
                        ref={photoRef} type="file" accept="image/*" className="hidden"
                        onChange={(e) => { if (e.target.files?.[0]) fileToDataUrl(e.target.files[0], setMainPhoto); e.target.value = ""; }}
                      />
                    </div>
                    <div className="flex flex-col items-start gap-1.5 min-w-0">
                      <div className="flex flex-wrap gap-1.5">
                        {mf.photoUrl && (
                          <button onClick={() => setAdjusting("main")} className="inline-flex items-center gap-1 text-xs font-semibold rounded-full px-3.5 py-1.5" style={{ background: LOVE.rose, color: "#fff" }}>
                            <CropIcon size={12} /> Adjust
                          </button>
                        )}
                        <button onClick={() => photoRef.current?.click()} className="inline-flex items-center gap-1 text-xs font-semibold rounded-full px-3.5 py-1.5" style={{ background: HMH.ink, color: "#fff" }}>
                          <RefreshCw size={12} /> {mf.photoUrl ? "Change" : "Upload photo"}
                        </button>
                        {mf.photoUrl && (
                          <button onClick={() => updateMf("photoUrl", "")} className="text-xs rounded-full px-3 py-1.5 border" style={{ borderColor: HMH.border, color: HMH.muted }}>Remove</button>
                        )}
                      </div>
                      {isDemoImage(mf.photoUrl) && (
                        <span className="text-[11px]" style={{ color: LOVE.roseDeep }}>Sample photo — tap to use yours. It&apos;s also the photo on their share card.</span>
                      )}
                    </div>
                  </div>
                </Field>

                <Field label="The main letter" hint="Sealed in an envelope until they hold on to 100%. They tap to open it, then it appears one paragraph at a time. Press Enter for a new paragraph.">
                  <AutoText
                    value={mf.letter}
                    onChange={(v) => updateMf("letter", v)}
                    minRows={8}
                    placeholder="what you actually wanted to say…"
                    className="w-full px-4 py-3.5 rounded-xl bg-[#FFF8EF] border border-black/10 focus:outline-none focus:border-[#E0457B] text-[15px]"
                  />
                </Field>

                {/* Gallery */}
                <Field
                  label={`Gallery — photos of you two (${(mf.memories ?? []).length}/${MAX_MEMORIES})`}
                  hint="Shown as polaroids under the main letter. Tapping a photo opens it with the little letter you write here — the photo says when, the letter says why you kept it."
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(mf.memories ?? []).map((m, i) => (
                      <div
                        key={i}
                        className="rounded-2xl overflow-hidden border flex"
                        style={{ borderColor: HMH.border, background: "#fff" }}
                      >
                        <div className="relative w-32 sm:w-36 shrink-0 self-stretch overflow-hidden" style={{ minHeight: 160, background: "#F3F1EC" }}>
                          <button
                            type="button"
                            onClick={() => setAdjusting(i)}
                            aria-label={`Adjust photo ${i + 1}`}
                            className="absolute inset-0 overflow-hidden"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={m.imageUrl} alt="" style={cropStyle(memoryCrop(m))} />
                          </button>
                          {isDemoImage(m.imageUrl) && <SampleChip />}
                          <div className="absolute left-1.5 right-1.5 bottom-1.5 flex gap-1">
                            <button
                              onClick={() => setAdjusting(i)}
                              className="flex-1 inline-flex items-center justify-center gap-1 rounded-full py-1 text-[10px] font-bold"
                              style={{ background: "rgba(255,255,255,.94)", color: LOVE.roseDeep }}
                            >
                              <CropIcon size={11} /> Adjust
                            </button>
                            <button
                              onClick={() => { replaceIdx.current = i; memoryRef.current?.click(); }}
                              className="flex-1 inline-flex items-center justify-center gap-1 rounded-full py-1 text-[10px] font-bold"
                              style={{ background: "rgba(14,14,18,.78)", color: "#fff" }}
                            >
                              <RefreshCw size={11} /> Change
                            </button>
                          </div>
                          <button
                            onClick={() => removeMemory(i)}
                            aria-label="Remove this photo"
                            className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full flex items-center justify-center"
                            style={{ background: "rgba(0,0,0,.62)", color: "#fff" }}
                          >
                            <X size={13} />
                          </button>
                        </div>
                        <div className="flex-1 min-w-0 p-2.5 flex flex-col">
                          <span className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: LOVE.roseDeep }}>
                            💌 letter for photo {i + 1}
                          </span>
                          <AutoText
                            value={m.note}
                            onChange={(v) => updateMemoryNote(i, v.slice(0, MEMORY_NOTE_MAX))}
                            placeholder="the day we… why this one matters to you"
                            minRows={4}
                            maxLength={MEMORY_NOTE_MAX}
                            className="w-full px-2.5 py-2 rounded-lg bg-[#FFF8EF] border border-black/5 focus:outline-none focus:border-[#E0457B] text-sm"
                            style={{ fontFamily: HMH.body }}
                          />
                          <span className="mt-1 self-end text-[10px]" style={{ color: HMH.muted }}>
                            {m.note.length}/{MEMORY_NOTE_MAX}
                          </span>
                        </div>
                      </div>
                    ))}

                    {(mf.memories ?? []).length < MAX_MEMORIES && (
                      <button
                        onClick={() => { replaceIdx.current = null; memoryRef.current?.click(); }}
                        className="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 py-8 sm:min-h-[160px] transition-colors hover:bg-white"
                        style={{ borderColor: LOVE.blush, color: LOVE.roseDeep, background: "#FFF8FA" }}
                      >
                        <ImagePlus size={22} />
                        <span className="text-sm font-semibold">Add a photo</span>
                        <span className="text-[11px]" style={{ color: HMH.muted }}>then write the little letter it opens into</span>
                      </button>
                    )}
                    <input
                      ref={memoryRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => {
                        const idx = replaceIdx.current;
                        replaceIdx.current = null;
                        if (e.target.files?.[0]) {
                          fileToDataUrl(e.target.files[0], (src) => {
                            if (idx === null) { addMemory(src); return; }
                            replaceMemoryPhoto(idx, src);
                            setAdjusting(idx);
                          });
                        }
                        e.target.value = "";
                      }}
                    />
                  </div>
                </Field>

                <Field label="How long" hint="How long they must hold without letting go.">
                  <select
                    value={mf.durationMs}
                    onChange={(e) => updateMf("durationMs", Number(e.target.value))}
                    className={INPUT_CLS}
                  >
                    {DURATION_PRESETS.map((d) => <option key={d.ms} value={d.ms}>{d.label}</option>)}
                  </select>
                </Field>

                <Field label="Mode" hint="Kind is sincere. Evil plants a fake 'okay, you can let go now' five seconds before the end — letting go there costs 5x drain.">
                  <div className="grid grid-cols-2 gap-2">
                    <Toggle
                      on={mf.mode === "kind"} onClick={() => updateMf("mode", "kind")}
                      icon={<Heart size={15} />} title="Kind" sub="It means what it says"
                    />
                    <Toggle
                      on={mf.mode === "evil"} onClick={() => updateMf("mode", "evil")}
                      icon={<Skull size={15} />} title="Evil" sub="The 55s betrayal"
                    />
                  </div>
                </Field>

                <Field label="Hands" hint="Two hands means two simultaneous touches for the whole duration — awkward alone, easy if somebody holds the other side. That puts two people in one frame.">
                  <div className="grid grid-cols-2 gap-2">
                    <Toggle on={mf.hands === 1} onClick={() => updateMf("hands", 1)} icon={<Hand size={15} />} title="One finger" sub="Solo" />
                    <Toggle on={mf.hands === 2} onClick={() => updateMf("hands", 2)} icon={<Hand size={15} />} title="Two hands" sub="Two touch points" />
                  </div>
                </Field>

                {/* Hold lines */}
                <Field label="Lines while they hold" hint="Each appears once progress reaches its timestamp, then fades. Drain back below it and it can fire again.">
                  <div className="space-y-2">
                    {mf.holdLines.map((l, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="relative shrink-0">
                          <input
                            type="number" min={0} max={Math.round(mf.durationMs / 1000)}
                            value={Math.round(l.atMs / 1000)}
                            onChange={(e) => updateHoldLine(i, { atMs: Math.max(0, Number(e.target.value) * 1000) })}
                            className={INPUT_SM + " w-20 pr-6 text-center"}
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px]" style={{ color: HMH.muted }}>s</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <AutoText value={l.text} onChange={(v) => updateHoldLine(i, { text: v })} placeholder="something sweet to say at this second…" minRows={1} />
                        </div>
                        <button onClick={() => removeHoldLine(i)} className="w-9 h-9 rounded-lg border grid place-items-center shrink-0" style={{ borderColor: HMH.border, color: HMH.muted }}><Trash2 size={14} /></button>
                      </div>
                    ))}
                    <button onClick={addHoldLine} className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: HMH.indigo }}><Plus size={14} /> Add line</button>
                  </div>
                </Field>

                {/* Release lines */}
                <Field label="Lines when they let go" hint="Shown in order — the 1st time they let go, the 2nd, and so on. These carry more weight than the hold lines. Write more than you think you need.">
                  <div className="space-y-2">
                    {mf.releaseLines.map((s, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="w-7 pt-2.5 text-xs text-center shrink-0" style={{ color: HMH.muted }}>{i + 1}.</span>
                        <div className="flex-1 min-w-0">
                          <AutoText value={s} onChange={(v) => updateList("releaseLines", i, v)} placeholder="come back? 🥺" minRows={1} />
                        </div>
                        <button onClick={() => removeFromList("releaseLines", i)} className="w-9 h-9 rounded-lg border grid place-items-center shrink-0" style={{ borderColor: HMH.border, color: HMH.muted }}><Trash2 size={14} /></button>
                      </div>
                    ))}
                    <button onClick={() => addToList("releaseLines")} className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: HMH.pink }}><Plus size={14} /> Add release line</button>
                  </div>
                </Field>

                <Field label="Ghost fragments" hint="One surfaces behind the photo every 12 seconds of progress. Draining takes them away again — that is what makes letting go hurt.">
                  <div className="space-y-2">
                    {mf.ghostFragments.map((s, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="w-9 pt-2.5 text-[10px] text-center shrink-0" style={{ color: HMH.muted }}>{(i + 1) * 12}s</span>
                        <div className="flex-1 min-w-0">
                          <AutoText value={s} onChange={(v) => updateList("ghostFragments", i, v)} placeholder="a fragment of the letter…" minRows={1} />
                        </div>
                        <button onClick={() => removeFromList("ghostFragments", i)} className="w-9 h-9 rounded-lg border grid place-items-center shrink-0" style={{ borderColor: HMH.border, color: HMH.muted }}><Trash2 size={14} /></button>
                      </div>
                    ))}
                    <button onClick={() => addToList("ghostFragments")} className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: HMH.indigo }}><Plus size={14} /> Add fragment</button>
                  </div>
                </Field>

                <Field label="Password (optional)" hint="If set, the shared link asks for this before opening.">
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: HMH.muted }} />
                    <input value={pagePassword} onChange={(e) => setPagePassword(e.target.value)} placeholder="Leave empty for no password" className={INPUT_CLS + " pl-10"} />
                  </div>
                </Field>

                <button
                  onClick={onSave}
                  disabled={saving || !mf.senderName.trim()}
                  className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ background: HMH.lime, color: HMH.ink, fontFamily: HMH.display }}
                >
                  {saving ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : <><Eye size={16} /> Save & Preview</>}
                </button>
                <p className="text-center text-[11px]" style={{ color: HMH.muted }}>
                  Publish from the preview to get your shareable link
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
      {visible && (
        <PhotoAdjuster
          open={adjusting !== null && (adjusting === "main" ? !!mf.photoUrl : !!mf.memories?.[adjusting])}
          src={adjusting === "main" ? mf.photoUrl : (typeof adjusting === "number" ? mf.memories?.[adjusting]?.imageUrl ?? "" : "")}
          crop={adjusting === "main" ? mainCrop(mf) : (typeof adjusting === "number" && mf.memories?.[adjusting] ? memoryCrop(mf.memories[adjusting]) : { ...CROP_DEFAULT })}
          shape={adjusting === "main" ? "circle" : "portrait"}
          title={adjusting === "main" ? "Adjust the main photo" : `Adjust photo ${typeof adjusting === "number" ? adjusting + 1 : ""}`}
          onChange={(c) => (adjusting === "main" ? setMainCrop(c) : typeof adjusting === "number" && setMemoryCrop(adjusting, c))}
          onClose={() => setAdjusting(null)}
          onReplace={() => {
            if (adjusting === "main") photoRef.current?.click();
            else if (typeof adjusting === "number") { replaceIdx.current = adjusting; memoryRef.current?.click(); }
          }}
        />
      )}
    </>
  );
});

function Toggle({ on, onClick, icon, title, sub }: { on: boolean; onClick: () => void; icon: React.ReactNode; title: string; sub: string }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-start gap-0.5 rounded-xl px-3.5 py-3 text-left transition-all"
      style={{
        border: `1.5px solid ${on ? HMH.indigo : HMH.border}`,
        background: on ? "rgba(108,92,231,.08)" : HMH.surface,
      }}
    >
      <span className="flex items-center gap-1.5 text-sm font-bold" style={{ color: on ? HMH.indigo : HMH.ink }}>
        {icon} {title}
      </span>
      <span className="text-[11px]" style={{ color: HMH.muted }}>{sub}</span>
    </button>
  );
}
