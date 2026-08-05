"use client";

import { memo, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, PenLine, Eye, Camera, Trash2, Plus, Lock, Loader2, Info, Hand, Skull, Heart,
} from "lucide-react";
import { DURATION_PRESETS, HMH, type HoldData, type EditMode } from "./types";

const INPUT_CLS =
  "w-full px-4 py-3 rounded-xl bg-black/[.04] border border-black/10 focus:outline-none focus:border-[#6C5CE7] text-sm transition-all";
const INPUT_SM = "w-full px-3 py-2 rounded-lg bg-black/[.04] border border-black/10 focus:outline-none text-sm";

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

  return (
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
              className="w-full max-w-2xl max-h-[84vh] lg:max-h-[90vh] overflow-y-auto rounded-t-3xl lg:rounded-[28px] shadow-2xl mx-auto"
              style={{ background: HMH.bg, color: HMH.ink, fontFamily: HMH.body }}
            >
              <div className="flex justify-center pt-3 pb-1 sticky top-0 z-10" style={{ background: HMH.bg }}>
                <div className="w-10 h-1 rounded-full" style={{ background: HMH.border }} />
              </div>

              <div className="px-5 pb-10 pt-2 space-y-5">
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

                <Field label="Their photo" hint="The face that comes into focus as they hold. Loss aversion is far stronger when the thing being lost is a person. No photo → a heart is used.">
                  <div className="flex items-center gap-3">
                    <div
                      onClick={() => photoRef.current?.click()}
                      className="w-20 h-20 rounded-full border-2 border-dashed cursor-pointer overflow-hidden grid place-items-center shrink-0"
                      style={{ borderColor: HMH.border }}
                    >
                      {mf.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={mf.photoUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Camera size={20} style={{ color: HMH.muted }} />
                      )}
                      <input
                        ref={photoRef} type="file" accept="image/*" className="hidden"
                        onChange={(e) => { if (e.target.files?.[0]) fileToDataUrl(e.target.files[0], (src) => updateMf("photoUrl", src)); e.target.value = ""; }}
                      />
                    </div>
                    {mf.photoUrl && (
                      <button onClick={() => updateMf("photoUrl", "")} className="text-xs rounded-full px-3 py-1.5 border" style={{ borderColor: HMH.border, color: HMH.muted }}>Remove</button>
                    )}
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
                      <div key={i} className="flex items-center gap-2">
                        <div className="relative shrink-0">
                          <input
                            type="number" min={0} max={Math.round(mf.durationMs / 1000)}
                            value={Math.round(l.atMs / 1000)}
                            onChange={(e) => updateHoldLine(i, { atMs: Math.max(0, Number(e.target.value) * 1000) })}
                            className={INPUT_SM + " w-20 pr-6 text-center"}
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px]" style={{ color: HMH.muted }}>s</span>
                        </div>
                        <input value={l.text} onChange={(e) => updateHoldLine(i, { text: e.target.value })} placeholder="don't." className={INPUT_SM + " flex-1"} />
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
                      <div key={i} className="flex items-center gap-2">
                        <span className="w-7 text-xs text-center shrink-0" style={{ color: HMH.muted }}>{i + 1}.</span>
                        <input value={s} onChange={(e) => updateList("releaseLines", i, e.target.value)} placeholder="come back." className={INPUT_SM + " flex-1"} />
                        <button onClick={() => removeFromList("releaseLines", i)} className="w-9 h-9 rounded-lg border grid place-items-center shrink-0" style={{ borderColor: HMH.border, color: HMH.muted }}><Trash2 size={14} /></button>
                      </div>
                    ))}
                    <button onClick={() => addToList("releaseLines")} className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: HMH.pink }}><Plus size={14} /> Add release line</button>
                  </div>
                </Field>

                {/* Ghosts */}
                <Field label="Ghost fragments" hint="One surfaces behind the photo every 12 seconds of progress. Draining takes them away again — that is what makes letting go hurt.">
                  <div className="space-y-2">
                    {mf.ghostFragments.map((s, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="w-9 text-[10px] text-center shrink-0" style={{ color: HMH.muted }}>{(i + 1) * 12}s</span>
                        <input value={s} onChange={(e) => updateList("ghostFragments", i, e.target.value)} placeholder="a fragment of the letter…" className={INPUT_SM + " flex-1"} />
                        <button onClick={() => removeFromList("ghostFragments", i)} className="w-9 h-9 rounded-lg border grid place-items-center shrink-0" style={{ borderColor: HMH.border, color: HMH.muted }}><Trash2 size={14} /></button>
                      </div>
                    ))}
                    <button onClick={() => addToList("ghostFragments")} className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: HMH.indigo }}><Plus size={14} /> Add fragment</button>
                  </div>
                </Field>

                <Field label="The letter" hint="Revealed only at 100%, one line at a time. Blank lines separate paragraphs.">
                  <textarea
                    value={mf.letter}
                    onChange={(e) => updateMf("letter", e.target.value)}
                    rows={7}
                    placeholder="what you actually wanted to say…"
                    className={INPUT_CLS + " resize-none"}
                  />
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
